import { ModelElement } from './core';
import { BoundingBox, WallHit, AxesModelTransform, BlockStruct } from './types';
import { ColorPalette } from '../palettes/types';
export declare class Block extends ModelElement {
    fullHeight: number;
    level: number;
    fillColor: ColorPalette["blocks"];
    roundness: number;
    constructor({ ...params }: BlockStruct);
    get alive(): boolean;
    bounds(): BoundingBox;
    protected moveObject(_dt: number): void;
    protected checkObjectBounds(): WallHit;
    drawObject(ctx: CanvasRenderingContext2D, transform: AxesModelTransform): void;
}
