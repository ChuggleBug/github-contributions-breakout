import { BreakoutModelElement } from "./core";
import type { BoundingBox } from "./core";

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
}
