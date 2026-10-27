import { GITHUB_DARK_PALETTE } from "./github_dark";
import { RANDOM_PALATTE } from "./random";
import { GITHUB_LIGHT_PALETTE } from "./github_light";

export type BreakoutColorPalatte =
    "default" | "custom" | "github_dark" | "github_light" | "random";

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
            return GITHUB_DARK_PALETTE;
        case "github_light":
            return GITHUB_LIGHT_PALETTE;
        case "random":
            return RANDOM_PALATTE;
    }
}
