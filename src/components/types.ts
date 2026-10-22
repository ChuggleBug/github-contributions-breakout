export type State = "pause" | "play";
export type Direction = "left" | "right" | "none";

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

export type BallStartAngleDegRange = {
    min: number;
    max: number;
};

export type BallStartState = {
    // Again, these are the CENTER of the ball
    X?: number;
    Y?: number;
    velocity?: number;
    // Starting angle of the ball on using the regular Cartesean plane
    // Converting the angle to the canvas coordiante system is handled upon init
    angleDeg?: number | BallStartAngleDegRange;
    width?: number;
    height?: number;
};

export type BreakoutProperties = {
    paddle?: PaddleStartState;
    ball?: BallStartState;
};

export type BreakoutModel = {
    paddle: PaddleModel;
    ball: BallModel;
};

export type PaddleModel = {
    X: number;
    Y: number;
    XSpeed: number;
    YSpeed: number;
    width: number;
    height: number;
};

export type BlockModel = {
    X: number;
    Y: number;
    level: number;
};

export type BallModel = {
    X: number;
    Y: number;
    velocity: number;
    angleDeg: number;
    width: number;
    height: number;
};
