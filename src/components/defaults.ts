import type {
    StartingRange,
    PaddleStartState,
    BallStartState,
    BlockGridProperties,
} from "./types/properties";
import type { State } from "./types/model/core";

export const DEFAULT_STATE: State = "start";

const PADDLE_DEFAULT_X = 0.5;
const PADDLE_DEFAULT_Y = 0.85;
const PADDLE_DEFAULT_X_SPEED = 1;
const PADDLE_DEFAULT_Y_SPEED = 0;
const PADDLE_DEFAULT_WIDTH = 0.2;
const PADDLE_DEFAULT_HEIGHT = 0.01;

const BALL_DEFAULT_X = 0.5;
const BALL_DEFAULT_Y = 0.6;
const BALL_DEFAULT_ANGLE: StartingRange = {
    min: 225,
    max: 315,
};
const BALL_DEFAULT_VELOCITY = 0.7;
const BALL_DEFAULT_WIDTH = 0.02;
const BALL_DEFAULT_HEIGHT = 0.02;

const BLOCK_MARGIN = 0.015;
const BLOCK_ROUNDNESS = 0.2;

export function rangeSelect(option: number | StartingRange): number {
    if (typeof option === "number") {
        return option;
    }

    const lo = Math.min(option.min, option.max);
    const hi = Math.max(option.min, option.max);

    // Both bounds are integers: return an integer, inclusive of both ends
    if (Number.isInteger(lo) && Number.isInteger(hi)) {
        return Math.floor(Math.random() * (hi - lo + 1)) + lo;
    }

    // Otherwise: return a float between the bounds
    return Math.random() * (hi - lo) + lo;
}

export const DEFAULTS = {
    paddle: {
        X: PADDLE_DEFAULT_X,
        Y: PADDLE_DEFAULT_Y,
        height: PADDLE_DEFAULT_HEIGHT,
        width: PADDLE_DEFAULT_WIDTH,
        XSpeed: PADDLE_DEFAULT_X_SPEED,
        YSpeed: PADDLE_DEFAULT_Y_SPEED,
    },
    ball: {
        X: BALL_DEFAULT_X,
        Y: BALL_DEFAULT_Y,
        velocity: BALL_DEFAULT_VELOCITY,
        angleDeg: BALL_DEFAULT_ANGLE,
        width: BALL_DEFAULT_WIDTH,
        height: BALL_DEFAULT_HEIGHT,
    },
    block: {
        margin: BLOCK_MARGIN,
        roundness: BLOCK_ROUNDNESS,
    },
} satisfies {
    paddle: Required<PaddleStartState>;
    ball: Required<BallStartState>;
    block: Required<BlockGridProperties>;
};

export default DEFAULTS;
