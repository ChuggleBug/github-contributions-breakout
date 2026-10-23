import { BreakoutModelElement } from "./core";
import type { BoundingBox, WallHit, AxesModelTransform } from "./core";
import type { ResolvedColorPalette } from "../../palettes/types";

export type BlockModel = {
    X: number;
    Y: number;
    width: number;
    height: number;
    level: number;
    fillColor: ResolvedColorPalette["blocks"];
};

export class Block extends BreakoutModelElement {
    X: number;
    Y: number;
    width: number;
    height: number;
    level: number;
    fillColor: ResolvedColorPalette["blocks"];

    constructor({ ...props }: BlockModel) {
        super();
        this.X = props.X;
        this.Y = props.Y;
        this.width = props.width;
        this.height = props.height;
        this.level = props.level;
        this.fillColor = props.fillColor;
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
        let fill: string;
        switch (this.fillColor.type) {
            case "defined": {
                switch (this.level) {
                    case 0:
                        fill = this.fillColor.zero;
                        break;
                    case 1:
                        fill = this.fillColor.one;
                        break;
                    case 2:
                        fill = this.fillColor.two;
                        break;
                    case 3:
                        fill = this.fillColor.three;
                        break;
                    case 4:
                        fill = this.fillColor.four;
                        break;
                    default:
                        fill =
                            this.fillColor.fourAndUp?.(this.level) ??
                            this.fillColor.four;
                }
                break;
            }
            case "function": {
                fill = this.fillColor.fn(this.level);
                break;
            }
            default: {
                throw new Error("Unknown block color palette type");
            }
        }
        ctx.fillStyle = fill;
        ctx.fillRect(
            transform.X(this.X),
            transform.Y(this.Y),
            transform.X(this.width),
            transform.Y(this.height),
        );
    }
}
