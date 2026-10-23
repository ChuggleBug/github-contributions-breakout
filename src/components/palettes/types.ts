import { GITHUB_PALATTE } from "./github_dark";
import { RANDOM_PALATTE } from "./random";

export type BreakoutColorPalatte =
    "default" | "custom" | "github_dark" | "random";

export interface ColorLevelFn {
    colorFor(level: number): string;
}

export interface ColorPalette {
    background: string;
    paddle: string;
    ball: string;
    blocks: ColorLevelFn;
}

export function paletteFactory(
    palette: BreakoutColorPalatte,
    custom: ColorPalette | null = null,
) {
    switch (palette) {
        case "custom":
            if (!custom) {
                throw new Error("Missing Custom color palette");
            }
            return custom;
        case "default":
        case "github_dark":
            return GITHUB_PALATTE;
        case "random":
            return RANDOM_PALATTE;
    }
}
