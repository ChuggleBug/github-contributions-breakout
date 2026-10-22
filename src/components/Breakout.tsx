import "./breakout.css";
import { useEffect, useRef } from "react";
import { type BreakoutStore } from "./useBreakoutStore";
import {
    Paddle,
    Ball,
    type BreakoutProperties,
    type BreakoutModel,
    type State,
    type Direction,
    type BreakoutModelElement,
} from "./types";

import { DEFAULT_STATE, DEFAULTS } from "./defaults";

export type BreakoutProps = {
    height: number;
    width: number;
    store?: BreakoutStore;
    properties?: BreakoutProperties;
};

const LEFT_KEYS = ["KeyA", "ArrowLeft"];
const RIGHT_KEYS = ["KeyD", "ArrowRight"];

export default function Breakout({
    height,
    width,
    store,
    properties,
}: BreakoutProps) {
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

    // BallStartState.angleDeg can be either a
    // range or a number, so a single number needs
    //  to be resolved during construction
    const angleDegSafe = properties?.ball?.angleDeg ?? DEFAULTS.ball.angleDeg;
    const resolveAngleDeg =
        typeof angleDegSafe === "number"
            ? angleDegSafe
            : Math.floor(
                  Math.random() * (angleDegSafe.max - angleDegSafe.min + 1),
              ) + angleDegSafe.min;

    // Starting State of the model
    let model: BreakoutModel = {
        paddle: new Paddle({
            ...DEFAULTS.paddle,
            ...properties?.paddle,
        }),
        ball: new Ball({
            ...DEFAULTS.ball,
            ...properties?.ball,
            angleDeg: resolveAngleDeg,
        }),
    };
    // Convert paddle to real coordinates
    model.paddle.X -= model.paddle.width / 2;
    model.paddle.Y -= model.paddle.height / 2;
    // TODO: Bounds check initial state

    // Convert ball to real coordinates
    model.ball.X -= model.ball.width / 2;
    model.ball.Y -= model.ball.height / 2;
    model.ball.angleDeg = (360 - model.ball.angleDeg) % 360;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

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

        // Time
        let lastTime: number | null = null;
        let playTime: number = 0;
        const MAX_DELTA_TIME: number = 0.05;

        // Draw Wrapper
        const drawObject = (e: BreakoutModelElement) => {
            e.draw(ctx, { X: modelToX, Y: modelToY });
        };

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

        const render = (time: number) => {
            if (lastTime === null) {
                lastTime = time;
            }
            let deltaTime = (time - lastTime) / 1000;
            lastTime = time;
            deltaTime = Math.min(deltaTime, MAX_DELTA_TIME);

            if (state === "pause") {
            } else if (state === "play") {
                playTime += deltaTime;

                model.paddle.direction = getDirection();
                model.paddle.move(deltaTime);
                model.ball.move(deltaTime);

                model.paddle.checkBounds();
                model.ball.checkBounds();

                

                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                drawObject(model.paddle);
                drawObject(model.ball);
                // drawBall(ctx);

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
        };
    }, []);

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
