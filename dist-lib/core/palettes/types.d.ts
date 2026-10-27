export type BreakoutColorPalatte = "default" | "custom" | "github_dark" | "github_light" | "random";
export interface ColorLevelFn {
    colorFor(level: number): string;
}
export interface ColorPalette {
    background: string;
    paddle: string;
    ball: string;
    blocks: ColorLevelFn;
}
export declare function paletteFactory(palette: BreakoutColorPalatte, custom?: ColorPalette | null): ColorPalette;
