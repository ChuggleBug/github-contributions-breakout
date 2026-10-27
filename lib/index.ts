export {
    Breakout as BreakoutGame,
    type BreakoutOptions as BreakoutGameOptions,
} from "./core/breakout";
export type {
    BlockData,
    BlockGrid,
    PaddleStartState,
    StartingRange,
    BallStartState,
    BlockGridProperties,
    GameControlProperties,
    SidebarDisplayProperties,
    BreakoutProperties as BreakoutGameProperties,
} from "./core/properties/types";

export { GITHUB_DARK_PALETTE } from "./core/palettes/github_dark";
export { RANDOM_PALATTE } from "./core/palettes/random";
export { GITHUB_LIGHT_PALETTE } from "./core/palettes/github_light";
export {
    paletteFactory,
    type BreakoutColorPalatte,
    type ColorLevelFn,
    type ColorPalette,
} from "./core/palettes/types";
