import { BreakoutModelElement } from "./core";
import type { BoundingBox, WallHit, AxesModelTransform } from "./core";
import type { ColorPalette } from "../../palettes/types";

export type BlockModel = {
    X: number;
    Y: number;
    width: number;
    height: number;
    level: number;
    fillColor: ColorPalette["blocks"];
    roundness: number;
};

export class Block extends BreakoutModelElement {
    X: number;
    Y: number;
    width: number;
    height: number;
    level: number;
    fillColor: ColorPalette["blocks"];
    roundness: number;

    constructor({ ...props }: BlockModel) {
        super();
        this.X = props.X;
        this.Y = props.Y;
        this.width = props.width;
        this.height = props.height;
        this.level = props.level;
        this.fillColor = props.fillColor;
        this.roundness = props.roundness;
    }
    bounds(): BoundingBox {
        return { x: this.X, y: this.Y, w: this.width, h: this.height };
    }

    // @ts-ignore
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
        const fill = this.fillColor.colorFor(this.level);
        if (fill.length === 0) {
            console.log("skipping");
            return;
        }
        ctx.fillStyle = fill;

        const w = transform.X(this.width);
        const h = transform.Y(this.height);
        const radius = Math.min(w, h) * this.roundness;
        ctx.beginPath();
        ctx.roundRect(transform.X(this.X), transform.Y(this.Y), w, h, radius);
        ctx.fill();
    }
}
