import type { ColorPalette } from "../palettes/types";

export type State = "pause" | "play" | "start" | "end";
export type Direction = "left" | "right" | "none";

export type ModelTransform = (axis: number) => number;
export type AxesModelTransform = {
    X: ModelTransform;
    Y: ModelTransform;
};

export type BoundingBox = {
    x: number;
    y: number;
    w: number;
    h: number;
};

export type WallHit = {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
};

export type ModelElementStruct = {
    X: number;
    Y: number;
    Z?: number;
    width: number;
    height: number;
};

export type BallStruct = ModelElementStruct & {
    velocity: number;
    angleDeg: number;
    fillColor: string;
};

export type BlockStruct = ModelElementStruct & {
    fullHeight: number;
    level: number;
    fillColor: ColorPalette["blocks"];
    roundness: number;
};

export type PaddleStruct = ModelElementStruct & {
    XSpeed: number;
    YSpeed: number;
    fillColor: string;
};
