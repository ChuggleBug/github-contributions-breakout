import { BreakoutModelElement } from "./core";
import type { BoundingBox, WallHit, AxesModelTransform } from "./core";

export type BlockModel = {
    X: number;
    Y: number;
    width: number;
    height: number;
    level: number;
};

export class Block extends BreakoutModelElement {
    X: number;
    Y: number;
    width: number;
    height: number;
    level: number;

    constructor({ ...props }: BlockModel) {
        super();
        this.X = props.X;
        this.Y = props.Y;
        this.width = props.width;
        this.height = props.height;
        this.level = props.level;
    }
    bounds(): BoundingBox {
        return { x: this.X, y: this.Y, w: this.width, h: this.height };
    }

    protected moveObject(dt: number): void {
        // TODO: Move down at a fixed rate
    }

    protected checkObjectBounds(): WallHit {
        // No bounds checking
        return {
            left: false,
            right: false,
            top: false,
            bottom: false,
        };
    }
    draw(ctx: CanvasRenderingContext2D, transform: AxesModelTransform): void {
        ctx.strokeStyle = "#00FF00";
        ctx.fillStyle = "#0000FF";
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
