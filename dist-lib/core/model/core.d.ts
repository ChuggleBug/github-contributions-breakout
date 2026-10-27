import { Block } from './block';
import { Paddle } from './paddle';
import { Ball } from './ball';
import { ModelElementStruct, AxesModelTransform, BoundingBox, WallHit } from './types';
export declare class ObjectSet {
    private objects;
    constructor();
    add(e: ModelElement | ModelElement[]): void;
    has(e: ModelElement): boolean;
    private add_single;
    delete(e: ModelElement | ModelElement[]): void;
    private delete_single;
    get all(): ModelElement[];
}
export declare function wallHits(b: BoundingBox): WallHit;
export declare abstract class ModelElement {
    X: number;
    Y: number;
    Z: number;
    width: number;
    height: number;
    private wallsHit;
    private doMove;
    constructor({ ...params }: ModelElementStruct);
    get boundHits(): WallHit;
    set canMove(move: boolean);
    bounds(): BoundingBox;
    visible(): boolean;
    collides(other: ModelElement): boolean;
    handleCollision(element: ModelElement): void;
    move(dt: number): void;
    protected abstract moveObject(dt: number): void;
    checkBounds(): void;
    protected abstract checkObjectBounds(): WallHit;
    draw(ctx: CanvasRenderingContext2D, transform: AxesModelTransform): void;
    protected abstract drawObject(ctx: CanvasRenderingContext2D, transform: AxesModelTransform): void;
}
export interface BreakoutModel {
    paddle: Paddle;
    ball: Ball;
    activeBlocks: Block[][];
    blockQueue: Block[][];
    ballCreate: () => Ball;
    objects: ObjectSet;
}
