import { BreakoutModelElement } from "./core";
import type { BoundingBox, WallHit, AxesModelTransform } from "./core";
import type { ColorPalette } from "../../palettes/types";
import { GAME_BLOCK_DOWN_STEPS } from "../../constants";

export type BlockModel = {
    X: number;
    Y: number;
    width: number;
    height: number;
    fullHeight: number;
    level: number;
    fillColor: ColorPalette["blocks"];
    roundness: number;
};

export class Block extends BreakoutModelElement {
    X: number;
    Y: number;
    width: number;
    height: number;
    fullHeight: number;
    level: number;
    fillColor: ColorPalette["blocks"];
    roundness: number;

    constructor({ ...props }: BlockModel) {
        super();
        this.X = props.X;
        this.Y = props.Y;
        this.width = props.width;
        this.height = props.height;
        this.fullHeight = props.fullHeight;
        this.level = props.level;
        this.fillColor = props.fillColor;
        this.roundness = props.roundness;
        this.canMove = false;
    }

    get alive() {
        return this.level > 0;
    }

    bounds(): BoundingBox {
        if (!this.alive) {
            return {
                x: -1,
                y: -1,
                w: 0,
                h: 0,
            };
        }
        return { x: this.X, y: this.Y, w: this.width, h: this.height };
    }

    protected moveObject(_dt: number): void {
        this.Y += this.fullHeight / GAME_BLOCK_DOWN_STEPS;
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
        // Dont bother if not in bounds
        if (this.Y + this.height < 0) {
            return;
        }

        const fill = this.fillColor.colorFor(this.level);
        if (fill.length === 0) {
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
