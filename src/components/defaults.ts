import type * as types from "./types";

export const DEFAULT_STATE = "pause";

const PADDLE_DEFAULT_X = 0.5;
const PADDLE_DEFAULT_Y = 0.85;
const PADDLE_DEFAULT_X_SPEED = 1;
const PADDLE_DEFAULT_Y_SPEED = 0;
const PADDLE_DEFAULT_WIDTH = 0.2;
const PADDLE_DEFAULT_HEIGHT = 0.01;

const BALL_DEFAULT_X = 0.5;
const BALL_DEFAULT_Y = 0.5;
const BALL_DEFAULT_VELOCITY = 0.5;
const BALL_DEFAULT_ANGLE_RANGE: types.BallStartAngleDegRange = {
    min: 210,
    max: 330,
};
const BALL_DEFAULT_WIDTH = 0.02;
const BALL_DEFAULT_HEIGHT = 0.02;

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
        angleDeg: BALL_DEFAULT_ANGLE_RANGE,
        width: BALL_DEFAULT_WIDTH,
        height: BALL_DEFAULT_HEIGHT,
    },
} satisfies {
    paddle: Required<types.PaddleStartState>;
    ball: Required<types.BallStartState>;
};

export default DEFAULTS;
