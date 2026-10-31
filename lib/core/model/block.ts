import { ModelElement } from "./core";
import type { BoundingBox, WallHit, AxesModelTransform } from "./types";
import { GAME_BLOCK_DOWN_STEPS } from "../constants";
import type { ColorPalette } from "../palettes/types";
import type { BlockStruct } from "./types";

export class Block extends ModelElement {
    fullHeight: number;
    level: number;
    fillColor: ColorPalette["blocks"];
    roundness: number;

    constructor({ ...params }: BlockStruct) {
        super({ ...params });
        this.fullHeight = params.fullHeight;
        this.level = params.level;
        this.fillColor = params.fillColor;
        this.roundness = params.roundness;
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Delta time is not used by a block but added to keep the method signature
    protected moveObject(dt: number): void {
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
    drawObject(
        ctx: CanvasRenderingContext2D,
        transform: AxesModelTransform,
    ): void {
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
