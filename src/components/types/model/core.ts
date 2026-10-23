import type { Block } from "./block";
import type { Paddle } from "./paddle";
import type { Ball } from "./ball";

export type State = "pause" | "play";
export type Direction = "left" | "right" | "none";

export type ModelTransform = (axis: number) => number;
export type AxesModelTransform = {
    X: ModelTransform;
    Y: ModelTransform;
};

export interface BoundingBox {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface WallHit {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
}

export function wallHits(b: BoundingBox): WallHit {
    return {
        left: b.x < 0,
        right: b.x + b.w > 1,
        top: b.y < 0,
        bottom: b.y + b.h > 1,
    };
}

export abstract class BreakoutModelElement {
    private wallsHit: WallHit;
    private doMove: boolean;

    constructor() {
        this.doMove = true;
        this.wallsHit = {
            top: false,
            left: false,
            right: false,
            bottom: false,
        };
    }

    get boundHits(): WallHit {
        return this.wallsHit;
    }

    set canMove(move: boolean) {
        this.doMove = move;
    }

    collides(other: BreakoutModelElement): boolean {
        const a = this.bounds();
        const b = other.bounds();
        return (
            a.x < b.x + b.w &&
            a.x + a.w > b.x &&
            a.y < b.y + b.h &&
            a.y + a.h > b.y
        );
    }

    // @ts-ignore
    handleCollision(element: BreakoutModelElement): void {}

    abstract bounds(): BoundingBox;
    move(dt: number) {
        if (this.doMove) {
            this.moveObject(dt);
        }
    }
    protected abstract moveObject(dt: number): void;
    checkBounds(): void {
        this.wallsHit = this.checkObjectBounds();
    }
    protected abstract checkObjectBounds(): WallHit;
    abstract draw(
        ctx: CanvasRenderingContext2D,
        transform: AxesModelTransform,
    ): void;
}

export type BreakoutModel = {
    paddle: Paddle;
    ball: Ball;
    blockMatrix: Block[][];
};
