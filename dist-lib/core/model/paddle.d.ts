import { ModelElement } from './core';
import { Direction, AxesModelTransform, PaddleStruct } from './types';
export declare class Paddle extends ModelElement {
    XSpeed: number;
    YSpeed: number;
    direction: Direction;
    fillColor: string;
    constructor({ ...params }: PaddleStruct);
    protected moveObject(dt: number): void;
    protected checkObjectBounds(): import('./types').WallHit;
    drawObject(ctx: CanvasRenderingContext2D, transform: AxesModelTransform): void;
}
