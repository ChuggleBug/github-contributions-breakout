import type { FunctionColorPalette } from "./types";

function randHex() {
    return rgbToHex(randNum(), randNum(), randNum());
}

function randNum() {
    return Math.floor(Math.random() * 256);
}

function rgbToHex(r: number, g: number, b: number) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export const RANDOM_PALATTE: FunctionColorPalette = {
    background: randHex(),
    paddle: randHex(),
    ball: randHex(),
    blocks: {
        type: "function",
        fn: (_level: number) => {
            return randHex();
        },
    },
};

export default RANDOM_PALATTE;
