import { BreakoutModelElement, wallHits } from "./core";
import type { Direction, BoundingBox, AxesModelTransform } from "./core";

export type PaddleModel = {
    X: number;
    Y: number;
    XSpeed: number;
    YSpeed: number;
    width: number;
    height: number;
    fillColor: string;
};

export class Paddle extends BreakoutModelElement {
    X: number;
    Y: number;
    XSpeed: number;
    YSpeed: number;
    width: number;
    height: number;

    direction: Direction = "none";
    fillColor: string;

    constructor({ ...params }: PaddleModel) {
        super();
        this.Y = params.Y;
        this.X = params.X;
        this.XSpeed = params.XSpeed;
        this.YSpeed = params.YSpeed;
        this.width = params.width;
        this.height = params.height;
        this.fillColor = params.fillColor;
    }

    protected moveObject(dt: number) {
        const step = this.XSpeed * dt;
        switch (this.direction) {
            case "left": {
                this.X -= step;
                break;
            }
            case "right": {
                this.X += step;
                break;
            }
            case "none":
            default: {
                break;
            }
        }
    }

    bounds(): BoundingBox {
        return { x: this.X, y: this.Y, w: this.width, h: this.height };
    }

    protected checkObjectBounds() {
        const hit = wallHits(this.bounds());
        if (hit.left) {
            this.X = 0;
        } else if (hit.right) {
            this.X = 1 - this.width;
        }
        return hit;
    }

    draw(ctx: CanvasRenderingContext2D, transform: AxesModelTransform) {
        ctx.strokeStyle = this.fillColor;
        ctx.fillStyle = this.fillColor;
        ctx.fillRect(
            transform.X(this.X),
            transform.Y(this.Y),
            transform.X(this.width),
            transform.Y(this.height),
        );
        ctx.strokeRect(
            transform.X(this.X),
            transform.Y(this.Y),
            transform.X(this.width),
            transform.Y(this.height),
        );
    }
}
