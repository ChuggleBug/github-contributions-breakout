import { ModelElement } from './core';
import { AxesModelTransform, BallStruct } from './types';
export declare class Ball extends ModelElement {
    velocity: number;
    angleDeg: number;
    fillColor: string;
    constructor({ ...params }: BallStruct);
    protected moveObject(dt: number): void;
    protected checkObjectBounds(): import('./types').WallHit;
    drawObject(ctx: CanvasRenderingContext2D, transform: AxesModelTransform): void;
    handleCollision(element: ModelElement): void;
    private handleBlockCollision;
    private static clamp;
    private handlePaddleCollision;
    private setDirection;
}
