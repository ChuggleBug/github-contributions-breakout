export type BlockData = {
    level: number;
};

export type BlockGrid = {
    blocksPerRow: number;
    blocks: BlockData[];
    // Given a row from 0-n, return the rows "name"
    // Example Row 0 can return "Row 1"
    blockRowIndicator?: (rowNum: number) => string;
};

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

export type StartingRange = {
    min: number;
    max: number;
};

export type BallStartState = {
    // Again, these are the CENTER of the ball
    X?: number | StartingRange;
    Y?: number | StartingRange;
    velocity?: number;
    // Starting angle of the ball on using the regular Cartesean plane
    // Converting the angle to the canvas coordiante system is handled upon init
    angleDeg?: number | StartingRange;
    width?: number;
    height?: number;
};

export type BlockGridProperties = {
    margin?: number;
    roundness?: number;
};

export type BreakoutProperties = {
    paddle?: PaddleStartState;
    ball?: BallStartState;
    blocks?: BlockGridProperties;
};
