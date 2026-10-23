import type { ColorPalette } from "./types";
import { MemoColorLevelFunction } from "./color_function";

const baseTable: Record<number, string> = {
    0: "",
    1: "#033a16",
    2: "#196c2e",
    3: "#2ea043",
    4: "#56d364",
};

function colorSelect(level: number): string {
    if (level <= 0) {
        return baseTable[0];
    } else if (level >= 4) {
        return baseTable[4];
    }
    return baseTable[level];
}

export const GITHUB_PALATTE: ColorPalette = {
    background: "#0d1117",
    paddle: "#ffffff",
    ball: "#ffffff",
    blocks: new MemoColorLevelFunction(colorSelect),
};

export default GITHUB_PALATTE;
