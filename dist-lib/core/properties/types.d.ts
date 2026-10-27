export type BlockData = {
    level: number;
};
export type BlockGrid = {
    blocksPerRow: number;
    blocks: BlockData[];
};
export type PaddleStartState = {
    X?: number;
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
    X?: number | StartingRange;
    Y?: number | StartingRange;
    velocity?: number;
    angleDeg?: number | StartingRange;
    width?: number;
    height?: number;
};
export type BlockGridProperties = {
    margin?: number;
    roundness?: number;
};
export type GameControlProperties = {
    leftKeys?: ReadonlyArray<string>;
    rightKeys?: ReadonlyArray<string>;
    speedupKeys?: ReadonlyArray<string>;
};
export type SidebarDisplayProperties = {
    blockRowIndicator?: undefined;
    blockRowIndicatorWidthHint?: undefined;
} | {
    blockRowIndicator: (rowNum: number) => string;
    blockRowIndicatorWidthHint?: number;
};
export type BreakoutProperties = {
    paddle?: PaddleStartState;
    ball?: BallStartState;
    blocks?: BlockGridProperties;
    controls?: GameControlProperties;
    sidebar?: SidebarDisplayProperties;
};
