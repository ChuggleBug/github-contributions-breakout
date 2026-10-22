export type PaddleStartState = {
    // Starting Position of the MIDDLE X of the paddle
    // Is either edge would place it out of bounds, then
    // it will be adjusted to fit
    X?: number;
    // Starting Position of the MIDDLE Y of the paddle
    // Is either edge would place it out of bounds, then
    // it will be adjusted to fit
    Y?: number;
    XSpeed?: number;
    YSpeed?: number;
    height?: number;
    width?: number;
};

export type BreakoutProperties = {
    paddle: PaddleStartState;
};
