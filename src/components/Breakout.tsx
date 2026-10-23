import "./breakout.css";
import { useEffect, useRef } from "react";
import { type BreakoutStore } from "./useBreakoutStore";
import { Paddle } from "./types/model/paddle";
import { Ball } from "./types/model/ball";
import type { BreakoutProperties, BlockGrid } from "./types/properties";
import type {
    BreakoutModel,
    State,
    Direction,
    BreakoutModelElement,
} from "./types/model/core";
import {
    paletteFactory,
    type BreakoutColorPalatte,
    type ColorPalette,
} from "./palettes/types";
import * as CONSTANTS from "./constants";

import { DEFAULT_STATE, DEFAULTS, rangeSelect } from "./defaults";
import { Block } from "./types/model/block";

export type BreakoutProps = {
    height: number;
    width: number;
    startingBlocks: BlockGrid;
    store?: BreakoutStore;
    properties?: BreakoutProperties;
    palette?: BreakoutColorPalatte;
    customPalette?: ColorPalette;
};

const LEFT_KEYS = ["KeyA", "ArrowLeft"];
const RIGHT_KEYS = ["KeyD", "ArrowRight"];

export default function Breakout({
    height,
    width,
    startingBlocks,
    store,
    properties,
    palette = "default",
    customPalette,
}: BreakoutProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const storeRef = useRef(store);
    useEffect(() => {
        storeRef.current = store;
    }, [store]);

    useEffect(() => {
        // Canvas Initialization and adjustments
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) {
            return;
        }

        let dpi: number = 1;
        const handleResize = () => {
            dpi = window.devicePixelRatio || 1;
            canvas.height = canvas.clientHeight * dpi;
            canvas.width = canvas.clientWidth * dpi;
        };
        handleResize();

        // Basic Model Transformations (device pixels)
        const modelToX = (modelX: number) => modelX * canvas.width;
        const modelToY = (modelY: number) => modelY * canvas.height;
        const transform = { X: modelToX, Y: modelToY };

        // Draw Wrapper
        const drawObject = (e: BreakoutModelElement) => {
            e.draw(ctx, transform);
        };

        const colors = paletteFactory(palette, customPalette);

        const makeBall = () => {
            // BallStartState.angleDeg can be either a
            // range or a number, so a single number needs
            //  to be resolved during construction
            const angleDegSafe =
                properties?.ball?.angleDeg ?? DEFAULTS.ball.angleDeg;
            const XSafe = properties?.ball?.X ?? DEFAULTS.ball.X;
            const YSafe = properties?.ball?.Y ?? DEFAULTS.ball.Y;

            const ball = new Ball({
                ...DEFAULTS.ball,
                ...properties?.ball,
                X: rangeSelect(XSafe),
                Y: rangeSelect(YSafe),
                angleDeg: rangeSelect(angleDegSafe),
                fillColor: colors.ball,
            });
            // Convert ball to real coordinates
            ball.X -= ball.width / 2;
            ball.Y -= ball.height / 2;
            ball.angleDeg = (360 - ball.angleDeg) % 360;
            return ball;
        };

        // Starting State of the model
        const blockMargin = properties?.blocks?.margin ?? DEFAULTS.block.margin;
        const half = blockMargin / 2;
        const blockModelWidth = 1 / startingBlocks.blocksPerRow;
        const cellHeight = CONSTANTS.GAME_BLOCK_HEIGHT;

        const blockMatrix: Block[][] = [];
        for (
            let i = 0, rowNum = 0;
            i < startingBlocks.blocks.length;
            i += startingBlocks.blocksPerRow, rowNum += 1
        ) {
            blockMatrix.push(
                startingBlocks.blocks
                    .slice(i, i + startingBlocks.blocksPerRow)
                    .map((bd, j) => {
                        const cellX = j * blockModelWidth;
                        const cellY =
                            CONSTANTS.GAME_BLOCK_STARTING_LEVEL -
                            rowNum * cellHeight;

                        return new Block({
                            X: cellX + half,
                            Y: cellY + half,
                            width: blockModelWidth - blockMargin,
                            height: cellHeight - blockMargin,
                            level: bd.level,
                            fillColor: colors.blocks,
                            roundness:
                                properties?.blocks?.roundness ??
                                DEFAULTS.block.roundness,
                        });
                    }),
            );
        }

        let model: BreakoutModel = {
            paddle: new Paddle({
                ...DEFAULTS.paddle,
                ...properties?.paddle,
                fillColor: colors.paddle,
            }),
            ball: makeBall(),
            blockMatrix: blockMatrix,
        };
        // Convert paddle to real coordinates
        model.paddle.X -= model.paddle.width / 2;
        model.paddle.Y -= model.paddle.height / 2;
        // TODO: Bounds check initial state

        let frameCount = 0;
        let score = 0;
        let lastReportedScore = -1;
        let animationFrameId: number;
        let state: State = storeRef.current?.state ?? DEFAULT_STATE;

        // Load keyboard events
        const keySet = new Set<string>();
        const handleKeyDown = (e: KeyboardEvent) => {
            keySet.add(e.code);
            // stop page scrolling
            if (e.code.startsWith("Arrow") || e.code === "Space") {
                e.preventDefault();
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keySet.delete(e.code);
        };
        const handlePointerDown = () => {
            canvas.focus();
        };
        const handleBlur = () => {
            state = "pause";
            storeRef.current?.setState("pause");
            keySet.clear();
        };
        const handleFocus = () => {
            state = "play";
            storeRef.current?.setState("play");
        };

        // Events
        canvas.addEventListener("keydown", handleKeyDown);
        canvas.addEventListener("keyup", handleKeyUp);
        canvas.addEventListener("pointerdown", handlePointerDown);
        canvas.addEventListener("blur", handleBlur);
        canvas.addEventListener("focus", handleFocus);
        window.addEventListener("resize", handleResize);

        // Time
        let lastTime: number | null = null;
        let playTime: number = 0;

        const getDirection = () => {
            let direction: Direction = "none";
            for (const k of LEFT_KEYS) {
                if (keySet.has(k)) {
                    direction = "left";
                    break;
                }
            }
            for (const k of RIGHT_KEYS) {
                if (keySet.has(k)) {
                    // Conflicting directions
                    if (direction === "left") {
                        direction = "none";
                    } else {
                        direction = "right";
                    }
                    break;
                }
            }
            return direction;
        };

        let objects = new Set<BreakoutModelElement>([
            model.paddle,
            model.ball,
            ...model.blockMatrix.flat(),
        ]);

        const drawGame = () => {
            ctx.fillStyle = colors.background;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            objects.forEach((e) => {
                drawObject(e);
            });
        };

        let blockDownStepsCountdown = 0;
        const filterBlocks = () => {
            // Check if any blocks are deleted
            for (const block of [...objects].filter((e) => {
                return e instanceof Block;
            })) {
                if (block.level === 0) {
                    objects.delete(block);
                }
            }
            // Check if the bottom row is empty
            let sliceTo: number = 0;
            for (let i = 0; i < model.blockMatrix.length; i += 1) {
                // Row is empty
                if (model.blockMatrix[i].every((b) => !b.alive)) {
                    sliceTo = i + 1;
                    blockDownStepsCountdown += CONSTANTS.GAME_BLOCK_DOWN_STEPS;
                } else {
                    break;
                }
            }
            if (sliceTo >= 1) {
                model.blockMatrix = model.blockMatrix.slice(sliceTo);
                model.blockMatrix.flat().forEach((b) => (b.canMove = true));
            }
            // Final end game check
            if (model.blockMatrix.length === 0) {
                state = "end";
            }
        };

        filterBlocks();
        const render = (time: number) => {
            if (lastTime === null) {
                lastTime = time;
            }
            let deltaTime = (time - lastTime) / 1000;
            lastTime = time;
            deltaTime = Math.min(deltaTime, CONSTANTS.GAME_MAX_DELTA_TIME);
            if (state === "end") {
                ctx.filter = "brightness(50%)";
                drawGame();
                ctx.filter = "none";
                ctx.fillStyle = "#fff";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = `${transform.Y(0.1)}px monospace`;
                ctx.fillText("Game End", transform.X(0.5), transform.Y(0.5));
                return;
            }
            if (state === "pause") {
                ctx.filter = "brightness(50%)";
                drawGame();
                ctx.filter = "none";
                ctx.fillStyle = "#fff";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = `${transform.Y(0.1)}px monospace`;
                ctx.fillText("Paused", transform.X(0.5), transform.Y(0.5));
            } else if (state === "start") {
                // Only draw all the elements
                ctx.filter = "brightness(50%)";
                drawGame();
                ctx.filter = "none";
            } else if (state === "play") {
                playTime += deltaTime;

                // Move and out of bounds check
                model.paddle.direction = getDirection();
                objects.forEach((e) => e.move(deltaTime));
                objects.forEach((e) => e.checkBounds());
                // Block Steps

                console.log(blockDownStepsCountdown);
                if (blockDownStepsCountdown <= 0) {
                    model.blockMatrix
                        .flat()
                        .forEach((b) => (b.canMove = false));
                } else {
                    blockDownStepsCountdown -= 1;
                }

                // Collisions
                for (const obj of objects) {
                    if (model.ball.collides(obj)) {
                        model.ball.handleCollision(obj);
                    }
                }
                filterBlocks();

                // Ball Deletion, and respawn logic
                if (objects.has(model.ball) && model.ball.boundHits.bottom) {
                    objects.delete(model.ball);
                    model.ball = makeBall();
                    objects.add(model.ball);
                    model.ball.canMove = false;
                    setTimeout(() => {
                        model.ball.canMove = true;
                    }, CONSTANTS.GAME_BALL_RESPAWN_TIME_MS);
                }

                // Drawing
                drawGame();

                // TOOD: Modify this
                score = Math.floor(playTime);
                if (score !== lastReportedScore) {
                    lastReportedScore = score;
                    storeRef.current?.setScore(score);
                }
            }

            frameCount++;
            animationFrameId = window.requestAnimationFrame(render);
        };
        animationFrameId = window.requestAnimationFrame(render);

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener("keydown", handleKeyDown);
            canvas.removeEventListener("keyup", handleKeyUp);
            canvas.removeEventListener("pointerdown", handlePointerDown);
            canvas.removeEventListener("blur", handleBlur);
            canvas.removeEventListener("focus", handleFocus);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        // height and width attributes handled inside of game init loop
        <canvas
            tabIndex={0}
            className="breakout"
            ref={canvasRef}
            id="breakout"
            style={{ width, height }}
        ></canvas>
    );
}
