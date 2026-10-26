import { ModelElement, wallHits } from "./core";
import type { Direction, AxesModelTransform } from "./types";
import type { PaddleStruct } from "./types";

export class Paddle extends ModelElement {
    XSpeed: number;
    YSpeed: number;

    direction: Direction = "none";
    fillColor: string;

    constructor({ ...params }: PaddleStruct) {
        super({ ...params });
        this.XSpeed = params.XSpeed;
        this.YSpeed = params.YSpeed;
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

    protected checkObjectBounds() {
        const hit = wallHits(this.bounds());
        if (hit.left) {
            this.X = 0;
        } else if (hit.right) {
            this.X = 1 - this.width;
        }
        return hit;
    }

    drawObject(ctx: CanvasRenderingContext2D, transform: AxesModelTransform) {
        ctx.fillStyle = this.fillColor;
        ctx.fillRect(
            transform.X(this.X),
            transform.Y(this.Y),
            transform.X(this.width),
            transform.Y(this.height),
        );
    }
}
