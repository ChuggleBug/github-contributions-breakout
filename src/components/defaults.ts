import type * as types from "./types";

// Does not move vertically
const PADDLE_DEFAULT_X = 0.5;
const PADDLE_DEFAULT_Y = 0.85;
const PADDLE_DEFAULT_WIDTH = 0.2;
const PADDLE_DEFAULT_HEIGHT = 0.01;
const PADDLE_DEFAULT_X_SPEED = 0.7;
const PADDLE_DEFAULT_Y_SPEED = 0.7;

export const DEFAULTS = {
    paddle: {
        X: PADDLE_DEFAULT_X,
        Y: PADDLE_DEFAULT_Y,
        height: PADDLE_DEFAULT_HEIGHT,
        width: PADDLE_DEFAULT_WIDTH,
        XSpeed: PADDLE_DEFAULT_X_SPEED,
        YSpeed: PADDLE_DEFAULT_Y_SPEED,
    },
} satisfies { paddle: Required<types.PaddleStartState> };

export default DEFAULTS;
