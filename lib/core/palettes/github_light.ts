import type { ColorPalette } from "./types";
import { MemoColorLevelFunction } from "./color_function";

const baseTable: Record<number, string> = {
    0: "",
    1: "#9be9a8",
    2: "#40c463",
    3: "#30a14e",
    4: "#216e39",
};

function colorSelect(level: number): string {
    if (level <= 0) {
        return baseTable[0];
    } else if (level >= 4) {
        return baseTable[4];
    }
    return baseTable[level];
}

export const GITHUB_LIGHT_PALETTE: ColorPalette = {
    background: "#ffffff",
    paddle: "#24292f",
    ball: "#24292f",
    blocks: new MemoColorLevelFunction(colorSelect),
};

export default GITHUB_LIGHT_PALETTE;
