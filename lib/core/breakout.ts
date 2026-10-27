import { Paddle } from "./model/paddle";
import { Ball } from "./model/ball";
import type {
    BreakoutProperties,
    BlockGrid,
    GameControlProperties,
} from "./properties/types";
import type {
    State,
    Direction,
    AxesModelTransform,
} from "./model/types";
import { ObjectSet, type BreakoutModel } from "./model/core";
import {
    paletteFactory,
    type BreakoutColorPalatte,
    type ColorPalette,
} from "./palettes/types";
import * as CONSTANTS from "./constants";

import {
    DEFAULT_STATE,
    DEFAULTS,
    rangeSelect,
} from "./properties/defaults";
import { Block } from "./model/block";
import { GameWindow } from "./view/core";

export interface BreakoutOptions {
    id?: string;
    height: number;
    width: number;
    startingBlocks: BlockGrid;
    store?: BreakoutStore;
    properties?: BreakoutProperties;
    palette?: BreakoutColorPalatte;
    customPalette?: ColorPalette;
}

export type BreakoutStore = {
    secondsElapsed: number;
    setSecondsElapsed: (score: number) => void;
    state: State;
    setState: (state: State) => void;
};

type ViewName = "game" | "sidebar" | "screen";
type BallHiddenState = Ball & { _speedup: boolean };

export class Breakout {
    readonly canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private rafId = 0;
    // @ts-ignore
    private running = false;
    private abort = new AbortController(); // for event listeners
    private resizeObserver?: ResizeObserver;

    private height: number;
    private width: number;
    private startingBlocks: BlockGrid;
    private store?: BreakoutStore | null;
    private properties: BreakoutProperties;
    private palette: BreakoutColorPalatte;
    private customPalette: ColorPalette | null;

    // Internal state from BreakoutState
    private state: State = DEFAULT_STATE;
    private seconds: number = 0;
    private colors: ColorPalette;
    private blockDownStepsCountdown: number;

    // Internal State
    private keySet: Set<string>;
    private controls: Required<GameControlProperties>;
    private transformations: Record<ViewName, AxesModelTransform | null>;
    private model: BreakoutModel;
    private clearedRows: number;

    constructor(opts: BreakoutOptions) {
        this.height = opts.height;
        this.width = opts.width;
        this.startingBlocks = opts.startingBlocks;
        this.store = opts.store ?? null;
        this.properties = opts.properties ?? DEFAULTS;
        this.palette = opts.palette ?? "default";
        this.customPalette = opts.customPalette ?? null;

        // Canvas configurations
        const targetID = opts.id ?? "breakout";
        const element = document.getElementById(targetID);
        if (!element) {
            throw new Error(`Missing HTML element canvas "${targetID}"`);
        }
        if (!(element instanceof HTMLCanvasElement)) {
            throw new Error(`HTML element "${targetID}" is not a canvas`);
        }
        this.canvas = element as HTMLCanvasElement;
        this.canvas.className = "breakout";
        this.canvas.tabIndex = 0;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;

        // Canvas Context
        const ctx = this.canvas.getContext("2d");
        if (!ctx) {
            throw new Error("2D context not supported");
        }
        this.ctx = ctx;

        // Internal Game State
        this.keySet = new Set<string>();
        this.controls = {
            ...this.properties?.controls,
            ...DEFAULTS.controls,
        };
        this.blockDownStepsCountdown = 0;
        this.colors = paletteFactory(this.palette, this.customPalette);
        this.transformations = {
            screen: null,
            game: null,
            sidebar: null,
        };
        this.clearedRows = 0;
        this.model = this.makeBreakoutModel();
    }

    setStore(store: BreakoutStore) {
        this.store = store;
    }

    private setState(s: State) {
        this.state = s;
        if (this.store) {
            this.store.setState(s);
        }
    }

    private setSeconds(s: number) {
        this.seconds = s;
        if (this.store) {
            this.store?.setSecondsElapsed(s);
        }
    }

    init() {
        this.initialize();
        this.start();
    }

    private initialize() {
        const { signal } = this.abort;
        this.canvas.addEventListener(
            "keydown",
            (e: KeyboardEvent) => this.handleKeyDown(e),
            {
                signal,
            },
        );
        this.canvas.addEventListener(
            "keyup",
            (e: KeyboardEvent) => this.handleKeyUp(e),
            {
                signal,
            },
        );
        this.canvas.addEventListener(
            "pointerdown",
            (_: PointerEvent) => this.handlePointerDown(),
            {
                signal,
            },
        );
        this.canvas.addEventListener(
            "blur",
            (_: FocusEvent) => this.handleBlur(),
            { signal },
        );
        this.canvas.addEventListener(
            "focus",
            (_: FocusEvent) => this.handleFocus(),
            {
                signal,
            },
        );
        window.addEventListener("resize", (_: UIEvent) => this.handleResize(), {
            signal,
        });
    }

    private start() {
        let frameCount = 0;
        let lastReportedScore = -1;

        let lastTime: number | null = null;
        let playTime: number = 0;

        const render = (time: number) => {
            if (lastTime === null) {
                lastTime = time;
            }
            let deltaTime = (time - lastTime) / 1000;
            lastTime = time;
            deltaTime = Math.min(deltaTime, CONSTANTS.GAME_MAX_DELTA_TIME);
            this.clearScreen();
            switch (this.state) {
                case "end": {
                    this.drawGame("blur(6px)");
                    this.writeText("Game End", { rem: 10 });
                    return;
                }
                case "pause": {
                    this.drawGame("blur(6px)");
                    this.writeText("Paused", { rem: 10 });
                    break;
                }
                case "start": {
                    // Only draw all the elements
                    this.drawGame("blur(6px)");
                    break;
                }
                case "play": {
                    playTime += deltaTime;
                    this.gameLogic(deltaTime);
                    this.drawGame();
                    this.setSeconds(Math.floor(playTime));
                    if (this.seconds !== lastReportedScore) {
                        lastReportedScore = this.seconds;
                    }
                    break;
                }
                default: {
                    throw new Error(`Invalid game state: ${this.state}`);
                }
            }
            this.drawBorders();

            frameCount++;
            this.rafId = window.requestAnimationFrame(render);
        };
        this.rafId = window.requestAnimationFrame(render);
    }

    private gameLogic(dt: number) {
        // Move and out of bounds check
        this.model.paddle.direction = this.getDirection();
        this.model.objects.all.forEach((e) => e.move(dt));
        this.model.objects.all.forEach((e) => e.checkBounds());

        // Block Steps
        if (this.blockDownStepsCountdown > 0) {
            this.blockDownStepsCountdown -= 1;
            if (this.blockDownStepsCountdown === 0) {
                this.model.activeBlocks
                    .flat()
                    .forEach((b) => (b.canMove = false));
            }
        }

        // Collisions
        for (const obj of this.model.objects.all) {
            if (this.model.ball.collides(obj)) {
                this.model.ball.handleCollision(obj);
            }
        }
        this.filterBlocks();

        // Ball Deletion, and respawn logic
        if (
            this.model.objects.has(this.model.ball) &&
            this.model.ball.boundHits.bottom
        ) {
            this.model.objects.delete(this.model.ball);
            this.model.ball = this.model.ballCreate();
            this.model.objects.add(this.model.ball);
            this.model.ball.canMove = false;
            setTimeout(() => {
                this.model.ball.canMove = true;
            }, CONSTANTS.GAME_BALL_RESPAWN_TIME_MS);
        }
    }

    clearScreen() {
        const transform = this.transformations.screen;
        this.ctx.clearRect(
            transform!.X(0),
            transform!.Y(0),
            transform!.X(1),
            transform!.Y(1),
        );
    }

    drawGame(ctxFilter: string = "none") {
        const transform = this.transformations.game;

        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(
            transform!.X(0),
            transform!.Y(0),
            transform!.X(1),
            transform!.Y(1),
        );

        this.model.objects.all.forEach((e) => {
            this.ctx.filter = ctxFilter;
            e.draw(this.ctx, this.transformations.game!);
        });

        // Will exit early if not present
        this.drawSidebar();
        this.ctx.filter = "none";
    }

    drawBorders() {
        this.ctx.filter = "none";
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 2;
        // Draw Borders
        let transform = this.transformations.game;
        this.ctx.strokeRect(
            transform!.X(0),
            transform!.Y(0),
            transform!.X(1),
            transform!.Y(1),
        );
        transform = this.transformations.screen;
        this.ctx.strokeRect(
            transform!.X(0),
            transform!.Y(0),
            transform!.X(1),
            transform!.Y(1),
        );
    }

    drawSidebar() {
        if (!this.properties.sidebar?.blockRowIndicator) {
            return;
        }

        const transform = this.transformations.sidebar;
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(
            transform!.X(0),
            transform!.Y(0),
            transform!.X(1),
            transform!.Y(1),
        );

        // Guess the width of the sidebar, given the text hint
        const sidebarWidth = transform!.X(1) - transform!.X(0);
        const rem =
            sidebarWidth /
            CONSTANTS.GAME_ROOT_FONT_SIZE_PX /
            (this.properties.sidebar.blockRowIndicatorWidthHint ?? 1);

        for (let i = 0; i < this.model.activeBlocks.length; i += 1) {
            const row = this.model.activeBlocks[i];

            const Y = row[0].Y + row[0].height / 2;
            this.writeText(
                this.properties.sidebar.blockRowIndicator(this.clearedRows + i),
                {
                    view: "sidebar",
                    X: 0.5,
                    Y,
                    rem,
                },
            );
        }
        this.ctx.filter = "none";
    }

    writeText(
        text: string,
        {
            view = "screen",
            X = 0.5,
            Y = 0.5,
            rem = 1,
        }: {
            view?: ViewName;
            X?: number;
            Y?: number;
            rem?: number;
        } = {},
    ) {
        const transform = this.transformations[view];

        this.ctx.fillStyle = "#fff";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.font = `${Math.floor(rem * CONSTANTS.GAME_ROOT_FONT_SIZE_PX)}px monospace`;
        this.ctx.fillText(text, transform!.X(X), transform!.Y(Y));
    }

    private makeBreakoutModel() {
        const game = new GameWindow();

        const makeTransform = (id: number): AxesModelTransform => {
            // Read the view on every call so changes to the view are picked up
            // automatically. Maps model 0..1 -> view start..end -> device pixels.
            const modelToX = (modelX: number) => {
                const { start, end } = game.view(id).horizontal;
                return (
                    (start + +modelX.toFixed(5) * (end - start)) *
                    this.canvas.width
                );
            };
            const modelToY = (modelY: number) => {
                const { start, end } = game.view(id).vertical;
                return (
                    (start + +modelY.toFixed(5) * (end - start)) *
                    this.canvas.height
                );
            };
            return { X: modelToX, Y: modelToY };
        };

        // Make view transformation functions
        this.transformations["screen"] = makeTransform(game.screenView);
        this.transformations["game"] = makeTransform(game.mainViewID);
        if (this.properties.sidebar?.blockRowIndicator) {
            const sidebarID = game.splitView(game.mainViewID, 0.8, "vertical");
            this.transformations.sidebar = makeTransform(sidebarID);
        }

        const gameWidth =
            (game.mainView.horizontal.end - game.mainView.horizontal.start) *
            this.width;
        const gameHeight =
            (game.mainView.vertical.end - game.mainView.vertical.start) *
            this.height;
        const yScaleFactor = gameWidth / gameHeight;
        const yOffset = (gameHeight - gameWidth) / gameHeight;
        const yScale = (y: number) => {
            return y * yScaleFactor + yOffset;
        };
        const heightScale = (h: number) => {
            return h * yScaleFactor;
        };

        this.handleResize();

        const makeBall = () => {
            // BallStartState.angleDeg can be either a
            // range or a number, so a single number needs
            //  to be resolved during construction
            const angleDegSafe =
                this.properties?.ball?.angleDeg ?? DEFAULTS.ball.angleDeg;
            const XSafe = this.properties?.ball?.X ?? DEFAULTS.ball.X;
            const YSafe = this.properties?.ball?.Y ?? DEFAULTS.ball.Y;

            const ball = new Ball({
                ...DEFAULTS.ball,
                ...this.properties?.ball,
                X: rangeSelect(XSafe),
                Y: rangeSelect(YSafe),
                Z: 1,
                angleDeg: rangeSelect(angleDegSafe),
                fillColor: this.colors.ball,
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
        const blockMargin =
            this.properties?.blocks?.margin ?? DEFAULTS.block.margin;
        const half = blockMargin / 2;
        const blockModelLength = 1 / this.startingBlocks.blocksPerRow;

        const blockMatrix: Block[][] = [];
        for (
            let i = 0, rowNum = 0;
            i < this.startingBlocks.blocks.length;
            i += this.startingBlocks.blocksPerRow, rowNum += 1
        ) {
            blockMatrix.push(
                this.startingBlocks.blocks
                    .slice(i, i + this.startingBlocks.blocksPerRow)
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
                            fillColor: this.colors.blocks,
                            roundness:
                                this.properties?.blocks?.roundness ??
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
        const loadedBlocks = blockMatrix.slice(0, blockSlice);
        const blockQueue = blockMatrix.slice(blockSlice);

        let paddle = new Paddle({
            ...DEFAULTS.paddle,
            ...this.properties?.paddle,
            fillColor: this.colors.paddle,
            Z: 1,
        });
        paddle.Y = yScale(paddle.Y);
        paddle.height = heightScale(paddle.height);

        const objects = new ObjectSet();
        const gameModel = {
            activeBlocks: loadedBlocks,
            blockQueue: blockQueue,
            paddle,
            ball: makeBall(),
            ballCreate: makeBall,
            objects,
        };
        gameModel.objects.add([
            gameModel.paddle,
            gameModel.ball,
            ...gameModel.activeBlocks.flat(),
        ]);

        // Convert paddle to real coordinates
        gameModel.paddle.X -= gameModel.paddle.width / 2;
        gameModel.paddle.Y -= gameModel.paddle.height / 2;

        return gameModel;
    }

    handleKeyDown(e: KeyboardEvent) {
        this.keySet.add(e.code);
        // stop page scrolling
        if (e.code.startsWith("Arrow") || e.code === "Space") {
            e.preventDefault();
        }
        // Speed up the ball
        if (this.controls.speedupKeys.some((k) => k === e.code)) {
            // Ensure ball has default value (false)
            const ball = this.model.ball as BallHiddenState;
            ball._speedup = ball._speedup ?? false;

            if (!ball._speedup) {
                ball._speedup = true;
                ball.velocity *= 3;
            }
        }
    }
    handleKeyUp(e: KeyboardEvent) {
        this.keySet.delete(e.code);
        // Speed up the ball
        if (this.controls.speedupKeys.some((k) => k === e.code)) {
            // Ensure ball has default value (false)
            const ball = this.model.ball as BallHiddenState;
            ball._speedup = ball._speedup ?? false;
    
            if (ball._speedup) {
                ball._speedup = false;
                ball.velocity /= 3;
            }
        }
    }

    handlePointerDown() {
        this.canvas.focus();
    }
    handleBlur() {
        this.setState("pause");
        this.keySet.clear();
    }
    handleFocus() {
        if (this.state !== "end") {
            this.setState("play");
        }
    }

    handleResize() {
        // When the game ends, it exits the loop and stops drawing
        if (this.state === "end") {
            return;
        }
        const dpi = window.devicePixelRatio || 1;
        this.canvas.height = this.canvas.clientHeight * dpi;
        this.canvas.width = this.canvas.clientWidth * dpi;
    }

    getDirection() {
        let direction: Direction = "none";
        for (const k of this.controls.leftKeys) {
            if (this.keySet.has(k)) {
                direction = "left";
                break;
            }
        }
        for (const k of this.controls.rightKeys) {
            if (this.keySet.has(k)) {
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
    }

    filterBlocks() {
        let sliceTo = 0;
        for (let i = 0; i < this.model.activeBlocks.length; i += 1) {
            if (this.model.activeBlocks[sliceTo].every((b) => !b.alive)) {
                sliceTo = i + 1;
                break;
            }
        }

        if (sliceTo > 0) {
            this.clearedRows += sliceTo;
            this.blockDownStepsCountdown +=
                CONSTANTS.GAME_BLOCK_DOWN_STEPS * sliceTo;

            const topRow =
                this.model.activeBlocks[this.model.activeBlocks.length - 1];
            const topY = topRow[0].Y;
            const rowPitch = topRow[0].fullHeight;

            const toDelete = this.model.activeBlocks.slice(0, sliceTo);
            this.model.activeBlocks = this.model.activeBlocks.slice(sliceTo);
            const toAdd = this.model.blockQueue.slice(0, sliceTo);
            this.model.blockQueue = this.model.blockQueue.slice(sliceTo);

            toAdd.forEach((row, i) => {
                row.forEach((b) => {
                    b.Y = topY - (i + 1) * rowPitch;
                });
            });

            this.model.objects.delete(toDelete.flat());
            this.model.objects.add(toAdd.flat());

            toAdd.forEach((r) => this.model.activeBlocks.push(r));
            this.model.activeBlocks.flat().forEach((b) => (b.canMove = true));
        }
        // Game end check
        if (this.model.activeBlocks.length <= 0) {
            this.setState("end");
        }
    }

    destroy() {
        this.running = false;
        cancelAnimationFrame(this.rafId);
        this.abort.abort();
        this.resizeObserver?.disconnect();
    }
}
