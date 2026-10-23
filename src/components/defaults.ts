import type * as types from "./types/properties";

export const DEFAULT_STATE = "pause";

const PADDLE_DEFAULT_X = 0.5;
const PADDLE_DEFAULT_Y = 0.85;
const PADDLE_DEFAULT_X_SPEED = 1;
const PADDLE_DEFAULT_Y_SPEED = 0;
const PADDLE_DEFAULT_WIDTH = 0.2;
const PADDLE_DEFAULT_HEIGHT = 0.01;

// const BALL_DEFAULT_X = 0.5;
// const BALL_DEFAULT_Y = 0.5;
// const BALL_DEFAULT_ANGLE = 90;
const BALL_DEFAULT_X: types.StartingRange = {
    min: 0.4,
    max: 0.6,
};
const BALL_DEFAULT_Y: types.StartingRange = {
    min: 0.45,
    max: 0.55,
};
const BALL_DEFAULT_ANGLE: types.StartingRange = {
    min: 210,
    max: 330,
};
const BALL_DEFAULT_VELOCITY = 0.5;
const BALL_DEFAULT_WIDTH = 0.02;
const BALL_DEFAULT_HEIGHT = 0.02;

export function rangeSelect(option: number | types.StartingRange): number {
    return typeof option === "number"
        ? option
        : Math.floor(Math.random() * (option.max - option.min + 1)) +
              option.min;
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
} satisfies {
    paddle: Required<types.PaddleStartState>;
    ball: Required<types.BallStartState>;
};

export default DEFAULTS;
