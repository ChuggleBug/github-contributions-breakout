import type { Block } from "./block";
import type { Paddle } from "./paddle";
import type { Ball } from "./ball";
import type { ModelElementStruct } from "./types";
import type { AxesModelTransform, BoundingBox, WallHit } from "./types";

export class ObjectSet {
    private objects: Record<number, Set<ModelElement>>;

    constructor() {
        this.objects = {};
    }

    add(e: ModelElement | ModelElement[]) {
        if (Array.isArray(e)) {
            e.forEach((e) => this.add_single(e));
        } else {
            this.add_single(e);
        }
    }

    has(e: ModelElement) {
        return this.objects[e.Z].has(e);
    }

    private add_single(e: ModelElement) {
        if (!(e.Z in this.objects)) {
            this.objects[e.Z] = new Set();
        }
        this.objects[e.Z].add(e);
    }

    delete(e: ModelElement | ModelElement[]) {
        if (Array.isArray(e)) {
            e.forEach((e) => this.delete_single(e));
        } else {
            this.delete_single(e);
        }
    }

    private delete_single(e: ModelElement) {
        if (!(e.Z in this.objects)) {
            return;
        }
        this.objects[e.Z].delete(e);
    }

    get all(): ModelElement[] {
        return Object.keys(this.objects)
            .sort((l, r) => {
                return Number(r) - Number(l);
            })
            .map((k: string) => {
                return [...this.objects[Number(k)]];
            })
            .flat();
    }
}

export function wallHits(b: BoundingBox): WallHit {
    return {
        left: b.x < 0,
        right: b.x + b.w > 1,
        top: b.y < 0,
        bottom: b.y + b.h > 1,
    };
}

export abstract class ModelElement {
    X: number;
    Y: number;
    Z: number;
    width: number;
    height: number;
    private wallsHit: WallHit;
    private doMove: boolean;

    constructor({ ...params }: ModelElementStruct) {
        this.X = params.X;
        this.Y = params.Y;
        this.Z = params.Z ?? 0;
        this.width = params.width;
        this.height = params.height;
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

    bounds(): BoundingBox {
        return { x: this.X, y: this.Y, w: this.width, h: this.height };
    }

    visible(): boolean {
        const { x, y, w, h } = this.bounds();
        return x < 1 && x + w > 0 && y < 1 && y + h > 0;
    }

    collides(other: ModelElement): boolean {
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
    handleCollision(element: ModelElement): void {}

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
    draw(ctx: CanvasRenderingContext2D, transform: AxesModelTransform): void {
        this.drawObject(ctx, transform);
    }
    protected abstract drawObject(
        ctx: CanvasRenderingContext2D,
        transform: AxesModelTransform,
    ): void;
}

export type BreakoutModel = {
    paddle: Paddle;
    ball: Ball;
    activeBlocks: Block[][];
    blockQueue: Block[][];
    ballCreate: () => Ball;
};
