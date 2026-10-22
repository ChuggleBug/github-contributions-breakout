import "./breakout.css";
import { useEffect, useRef } from "react";
import type { BreakoutStore } from "./useBreakoutStore";

export type BreakoutProps = {
    height: number;
    width: number;
    store?: BreakoutStore;
};

type BreakoutProperties = {
    paddleXDelta: number;
    paddleWidth: number;
    paddleHeight: number;
};

// Does not move vertically
const PADDLE_STARTING_X = 0.5;
const PADDLE_STARTING_Y = 0.85;

const PADDLE_HEIGHT = 0.01;
let properties: BreakoutProperties = {
    paddleXDelta: 0.008,
    paddleWidth: 0.2,
    paddleHeight: PADDLE_HEIGHT,
};

type BreakoutModel = {
    // Based on canvas dimensions
    paddleX: number;
    paddleY: number;
};

const LEFT_KEYS = ["KeyA", "ArrowLeft"];
const RIGHT_KEYS = ["KeyD", "ArrowRight"];

type Direction = "left" | "right" | "none";

export default function Breakout({ height, width, store }: BreakoutProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const storeRef = useRef(store);
    useEffect(() => {
        storeRef.current = store;
    }, [store]);

    // Basic Model Transformations
    const modelToX = (modelX: number) => {
        return modelX * width;
    };
    const modelToY = (modelY: number) => {
        return modelY * height;
    };

    // Starting State of the model
    let model: BreakoutModel = {
        paddleX: PADDLE_STARTING_X - properties.paddleWidth / 2,
        paddleY: PADDLE_STARTING_Y,
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        let frameCount = 0;
        let score = 0;
        let lastReportedScore = -1;
        let animationFrameId: number;
        type State = "pause" | "play";
        let state: State = "play";
        let direction: Direction = "none";

        // Load keyboard events
        const keySet = new Set<string>();
        const handleKeyDown = (e: KeyboardEvent) => {
            keySet.add(e.code);
            // stop page scrolling
            if (e.code.startsWith("Arrow") || e.code === "Space")
                e.preventDefault();
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keySet.delete(e.code);
        };
        const handlePointerDown = () => {
            canvas.focus();
        };
        const handleBlur = () => {
            state = "pause";
            keySet.clear();
        };
        const handleFocus = () => {
            state = "play";
        };

        // Events
        canvas.addEventListener("keydown", handleKeyDown);
        canvas.addEventListener("keyup", handleKeyUp);
        canvas.addEventListener("pointerdown", handlePointerDown);
        canvas.addEventListener("blur", handleBlur);
        canvas.addEventListener("focus", handleFocus);

        const render = () => {
            if (state === "pause") {
            } else if (state === "play") {
                // Detect Movement
                direction = "none";
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

                // Move Paddle
                switch (direction) {
                    case "left": {
                        model.paddleX -= properties.paddleXDelta;
                        break;
                    }
                    case "right": {
                        model.paddleX += properties.paddleXDelta;
                        break;
                    }
                    case "none":
                    default: {
                        break;
                    }
                }
                // Left Edge Detection
                if (model.paddleX <= 0) {
                    model.paddleX = 0;
                }
                // Right edge Detection
                if (model.paddleX + properties.paddleWidth >= 1) {
                    model.paddleX = 1 - properties.paddleWidth;
                }

                console.log(model.paddleX);

                frameCount++;
                score = Math.floor(frameCount / 120);

                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                draw(ctx, frameCount);
                drawPaddle(ctx);

                // Only tell React when something actually changed
                if (score !== lastReportedScore) {
                    lastReportedScore = score;
                    storeRef.current?.setScore(score);
                }
            }

            animationFrameId = window.requestAnimationFrame(render);
        };
        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener("keydown", handleKeyDown);
            canvas.removeEventListener("keyup", handleKeyUp);
            canvas.removeEventListener("pointerdown", handlePointerDown);
            canvas.removeEventListener("blur", handleBlur);
            canvas.removeEventListener("focus", handleFocus);
        };
    }, []);

    const drawPaddle = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(
            modelToX(model.paddleX),
            modelToY(model.paddleY),
            modelToX(properties.paddleWidth),
            modelToY(properties.paddleHeight),
        );
    };

    const draw = (ctx: CanvasRenderingContext2D, frameCount: number) => {
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(50, 100, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI);
        ctx.fill();
    };

    return (
        <canvas
            tabIndex={0}
            className="breakout"
            ref={canvasRef}
            id="breakout"
            height={height}
            width={width}
        ></canvas>
    );
}
