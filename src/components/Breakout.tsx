import "./breakout.css";
import { useEffect, useRef } from "react";
import { type BreakoutStore } from "./useBreakoutStore";
import { Paddle } from "./model/paddle";
import { Ball } from "./model/ball";
import type {
    BreakoutProperties,
    BlockGrid,
    GameControlProperties,
} from "./properties/types";
import type { State, Direction, AxesModelTransform } from "./model/types";
import { ObjectSet, type BreakoutModel, type ModelElement } from "./model/core";
import {
    paletteFactory,
    type BreakoutColorPalatte,
    type ColorPalette,
} from "./palettes/types";
import * as CONSTANTS from "./constants";

import { DEFAULT_STATE, DEFAULTS, rangeSelect } from "./properties/defaults";
import { Block } from ".//model/block";
import { GameWindow } from "./game/core";

export type BreakoutProps = {
    height: number;
    width: number;
    startingBlocks: BlockGrid;
    store?: BreakoutStore;
    properties?: BreakoutProperties;
    palette?: BreakoutColorPalatte;
    customPalette?: ColorPalette;
};

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

        const game = new GameWindow();
        const sidebarID = game.splitView(game.mainViewID, 0.9, "vertical");
        const gameWidth =
            (game.mainView.horizontal.end - game.mainView.horizontal.start) *
            width;
        const gameHeight =
            (game.mainView.vertical.end - game.mainView.vertical.start) *
            height;
        const yScaleFactor = gameWidth / gameHeight;
        const yOffset = (gameHeight - gameWidth) / gameHeight;
        const yScale = (y: number) => {
            return y * yScaleFactor + yOffset;
        };
        const heightScale = (h: number) => {
            return h * yScaleFactor;
        };

        let dpi: number = 1;
        const handleResize = () => {
            dpi = window.devicePixelRatio || 1;
            canvas.height = canvas.clientHeight * dpi;
            canvas.width = canvas.clientWidth * dpi;
        };
        handleResize();

        const makeTransform = (id: number): AxesModelTransform => {
            // Read the view on every call so changes to the view are picked up
            // automatically. Maps model 0..1 -> view start..end -> device pixels.
            const modelToX = (modelX: number) => {
                const { start, end } = game.view(id).horizontal;
                return (
                    (start + +modelX.toFixed(5) * (end - start)) * canvas.width
                );
            };
            const modelToY = (modelY: number) => {
                const { start, end } = game.view(id).vertical;
                return (
                    (start + +modelY.toFixed(5) * (end - start)) * canvas.height
                );
            };
            return { X: modelToX, Y: modelToY };
        };

        const gameTransform = makeTransform(game.mainViewID);

        // Draw Wrapper
        const drawElement = (e: ModelElement) => {
            e.draw(ctx, gameTransform);
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
                Z: 1,
                angleDeg: rangeSelect(angleDegSafe),
                fillColor: colors.ball,
            });
            // Convert ball to real coordinates
            ball.X -= ball.width / 2;
            ball.Y -= ball.height / 2;
            ball.angleDeg = (360 - ball.angleDeg) % 360;
            ball.Y = yScale(ball.Y);
            ball.height = heightScale(ball.height);
            return ball;
        };

        // Starting State of the model
        const blockMargin = properties?.blocks?.margin ?? DEFAULTS.block.margin;
        const half = blockMargin / 2;
        const blockModelLength = 1 / startingBlocks.blocksPerRow;

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
                        const cellX = j * blockModelLength;
                        let cellY = yScale(
                            CONSTANTS.GAME_BLOCK_STARTING_LEVEL -
                                rowNum * blockModelLength,
                        );
                        let block = new Block({
                            X: cellX + half,
                            Y: cellY + half,
                            Z: 2,
                            width: blockModelLength - blockMargin,
                            height: heightScale(blockModelLength - blockMargin),
                            fullHeight: heightScale(blockModelLength),
                            level: bd.level,
                            fillColor: colors.blocks,
                            roundness:
                                properties?.blocks?.roundness ??
                                DEFAULTS.block.roundness,
                        });
                        return block;
                    }),
            );
        }
        let blockSlice = 0;
        for (; blockSlice < blockMatrix.length; blockSlice += 1) {
            // If there is not blocks in this row (all dead)
            // Then just skip
            if (
                blockMatrix[blockSlice]
                    .filter((b) => b.alive)
                    .some((b) => !b.visible())
            ) {
                break;
            }
        }
        let loadedBlocks = blockMatrix.slice(0, blockSlice);
        let blockQueue = blockMatrix.slice(blockSlice);

        let paddle = new Paddle({
            ...DEFAULTS.paddle,
            ...properties?.paddle,
            fillColor: colors.paddle,
            Z: 1,
        });
        paddle.Y = yScale(paddle.Y);
        paddle.height = heightScale(paddle.height);

        let model: BreakoutModel = {
            blockMatrix: loadedBlocks,
            paddle,
            ball: makeBall(),
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
        const controls = {
            ...properties?.controls,
            ...DEFAULTS.controls,
        } satisfies Required<GameControlProperties>;
        type BallHiddenState = Ball & { _speedup: boolean };
        const handleKeyDown = (e: KeyboardEvent) => {
            keySet.add(e.code);
            // stop page scrolling
            if (e.code.startsWith("Arrow") || e.code === "Space") {
                e.preventDefault();
            }
            // Speed up the ball
            if (controls.speedupKeys.some((k) => k === e.code)) {
                if (!Object.hasOwn(model.ball, "_speedup")) {
                    (model.ball as BallHiddenState)._speedup = false;
                }
                if (!(model.ball as BallHiddenState)._speedup) {
                    (model.ball as BallHiddenState)._speedup = true;
                    model.ball.velocity *= 3;
                }
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keySet.delete(e.code);
            // Speed up the ball
            if (controls.speedupKeys.some((k) => k === e.code)) {
                if (!Object.hasOwn(model.ball, "_speedup")) {
                    (model.ball as BallHiddenState)._speedup = false;
                }
                if ((model.ball as BallHiddenState)._speedup) {
                    (model.ball as BallHiddenState)._speedup = false;
                    model.ball.velocity /= 3;
                }
            }
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
            if (state !== "end") {
                state = "play";
                storeRef.current?.setState("play");
            }
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
            for (const k of controls.leftKeys) {
                if (keySet.has(k)) {
                    direction = "left";
                    break;
                }
            }
            for (const k of controls.rightKeys) {
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

        const objects = new ObjectSet();
        objects.add([model.paddle, model.ball, ...model.blockMatrix.flat()]);
        // let objects = new Set<ModelElement>();

        const drawGame = () => {
            ctx.fillStyle = colors.background;
            ctx.fillRect(
                gameTransform.X(0),
                gameTransform.Y(0),
                gameTransform.X(1),
                gameTransform.Y(1),
            );
            objects.all.forEach((e) => {
                drawElement(e);
            });

            // Draw Borders
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.strokeRect(
                gameTransform.X(0),
                gameTransform.Y(0),
                gameTransform.X(1),
                gameTransform.Y(1),
            );
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
        };

        let blockDownStepsCountdown = 0;
        const filterBlocks = () => {
            let sliceTo = 0;
            for (let i = 0; i < model.blockMatrix.length; i += 1) {
                if (model.blockMatrix[sliceTo].every((b) => !b.alive)) {
                    sliceTo = i + 1;
                    break;
                }
            }

            if (sliceTo > 0) {
                blockDownStepsCountdown +=
                    CONSTANTS.GAME_BLOCK_DOWN_STEPS * sliceTo;

                const topRow = model.blockMatrix[model.blockMatrix.length - 1];
                const topY = topRow[0].Y;
                const rowPitch = topRow[0].fullHeight;

                const toDelete = model.blockMatrix.slice(0, sliceTo);
                model.blockMatrix = model.blockMatrix.slice(sliceTo);
                const toAdd = blockQueue.slice(0, sliceTo);
                blockQueue = blockQueue.slice(sliceTo);

                toAdd.forEach((row, i) => {
                    row.forEach((b) => {
                        b.Y = topY - (i + 1) * rowPitch;
                    });
                });

                objects.delete(toDelete.flat());
                objects.add(toAdd.flat());

                toAdd.forEach((r) => model.blockMatrix.push(r));
                model.blockMatrix.flat().forEach((b) => (b.canMove = true));
            }
            // Game end check
            if (model.blockMatrix.length <= 0) {
                state = "end";
                store?.setState("end");
            }
        };

        filterBlocks();
        const render = (time: number) => {
            console.log(
                "Blocks: ",
                objects.all.filter((e) => e instanceof Block).length,
            );
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
                ctx.font = `${gameTransform.Y(0.1)}px monospace`;
                ctx.fillText("Game End", gameTransform.X(0.5), gameTransform.Y(0.5));
                return;
            }
            if (state === "pause") {
                ctx.filter = "brightness(50%)";
                drawGame();
                ctx.filter = "none";
                ctx.fillStyle = "#fff";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = `${gameTransform.Y(0.1)}px monospace`;
                ctx.fillText("Paused", gameTransform.X(0.5), gameTransform.Y(0.5));
            } else if (state === "start") {
                // Only draw all the elements
                ctx.filter = "brightness(50%)";
                drawGame();
                ctx.filter = "none";
            } else if (state === "play") {
                playTime += deltaTime;

                // Move and out of bounds check
                model.paddle.direction = getDirection();
                objects.all.forEach((e) => e.move(deltaTime));
                objects.all.forEach((e) => e.checkBounds());

                // Block Steps
                if (blockDownStepsCountdown > 0) {
                    blockDownStepsCountdown -= 1;
                    if (blockDownStepsCountdown === 0) {
                        model.blockMatrix
                            .flat()
                            .forEach((b) => (b.canMove = false));
                    }
                }

                // Collisions
                for (const obj of objects.all) {
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
