import { GITHUB_PALATTE } from "./github_dark";
import { RANDOM_PALATTE } from "./random";

export type BreakoutColorPalatte =
    "default" | "custom" | "github_dark" | "random";

type BaseColorPalette = {
    background: string;
    paddle: string;
    ball: string;
};

type LevelColorFn = (level: number) => string;

type DefinedBlocks = {
    type: "defined";
    zero?: string;
    one: string;
    two: string;
    three: string;
    four: string;
    fourAndUp?: LevelColorFn;
};

type FunctionBlocks = {
    type: "function";
    fn: LevelColorFn;
};

type ResolvedDefinedBlocks = DefinedBlocks & { zero: string };

// Input types (what users can supply)
export type UserDefinedColorPalette = BaseColorPalette & {
    blocks: DefinedBlocks;
};
export type FunctionColorPalette = BaseColorPalette & {
    blocks: FunctionBlocks;
};
export type ColorPalette = UserDefinedColorPalette | FunctionColorPalette;

// Output types (what the rest of the app consumes)
export type ResolvedDefinedColorPalette = BaseColorPalette & {
    blocks: ResolvedDefinedBlocks;
};
export type ResolvedColorPalette =
    ResolvedDefinedColorPalette | FunctionColorPalette;

function pallateSelector(
    pallate: BreakoutColorPalatte,
    custom: ColorPalette | null = null,
): ColorPalette {
    switch (pallate) {
        case "custom": {
            if (!custom) {
                throw new Error("Missing Color Palette");
            }
            return custom;
        }
        case "random":
            return RANDOM_PALATTE;
        case "github_dark":
        default:
            return GITHUB_PALATTE;
    }
}

export function pallateFactory(
    pallate: BreakoutColorPalatte,
    custom: ColorPalette | null = null,
): ResolvedColorPalette {
    const { blocks, ...base } = pallateSelector(pallate, custom);

    if (blocks.type === "defined") {
        return {
            ...base,
            blocks: { ...blocks, zero: blocks.zero ?? base.background },
        };
    }

    return { ...base, blocks };
}
