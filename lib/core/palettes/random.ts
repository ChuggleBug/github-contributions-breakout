import type { ColorPalette } from "./types";
import { MemoColorLevelFunction } from "./color_function";

function randHex() {
    return rgbToHex(randNum(), randNum(), randNum());
}

function randNum() {
    return Math.floor(Math.random() * 256);
}

function rgbToHex(r: number, g: number, b: number) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export const RANDOM_PALATTE: ColorPalette = {
    background: randHex(),
    paddle: randHex(),
    ball: randHex(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- level is not used by this color pallete, and instead returns a random one
    blocks: new MemoColorLevelFunction((level: number) => randHex()),
};

export default RANDOM_PALATTE;
