export type State = "pause" | "play";
export type Direction = "left" | "right" | "none";

export type PaddleStartState = {
    // Starting Position of the MIDDLE X of the paddle
    // Is either edge would place it out of bounds, then
    // it will be adjusted to fit
    X?: number;
    // Starting Position of the MIDDLE Y of the paddle
    // Is either edge would place it out of bounds, then
    // it will be adjusted to fit
    Y?: number;
    XSpeed?: number;
    YSpeed?: number;
    height?: number;
    width?: number;
};

export type BallStartAngleDegRange = {
    min: number;
    max: number;
};

export type BallStartState = {
    // Again, these are the CENTER of the ball
    X?: number;
    Y?: number;
    velocity?: number;
    // Starting angle of the ball on using the regular Cartesean plane
    // Converting the angle to the canvas coordiante system is handled upon init
    angleDeg?: number | BallStartAngleDegRange;
    width?: number;
    height?: number;
};

export type BreakoutProperties = {
    paddle?: PaddleStartState;
    ball?: BallStartState;
};

export type BreakoutModel = {
    paddle: Paddle;
    ball: Ball;
};

export type PaddleModel = {
    X: number;
    Y: number;
    XSpeed: number;
    YSpeed: number;
    width: number;
    height: number;
};

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

export interface BreakoutModelElement {
    move(dt: number): void;
    checkBounds(): void;
    draw(ctx: CanvasRenderingContext2D, transform: AxesModelTransform): void;
    bounds(): BoundingBox;
}

export class Paddle implements BreakoutModelElement {
    X: number;
    Y: number;
    XSpeed: number;
    YSpeed: number;
    width: number;
    height: number;

    direction: Direction = "none";

    constructor({ ...params }: PaddleModel) {
        this.Y = params.Y;
        this.X = params.X;
        this.XSpeed = params.XSpeed;
        this.YSpeed = params.YSpeed;
        this.width = params.width;
        this.height = params.height;
    }

    move(dt: number) {
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

    checkBounds() {
        const hit = wallHits(this.bounds());
        if (hit.left) this.X = 0;
        else if (hit.right) this.X = 1 - this.width;
    }

    draw(ctx: CanvasRenderingContext2D, transform: AxesModelTransform) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(
            transform.X(this.X),
            transform.Y(this.Y),
            transform.X(this.width),
            transform.Y(this.height),
        );
    }
}

export type BallModel = {
    X: number;
    Y: number;
    velocity: number;
    angleDeg: number;
    width: number;
    height: number;
};

export class Ball implements BreakoutModelElement {
    X: number;
    Y: number;
    velocity: number;
    angleDeg: number;
    width: number;
    height: number;

    constructor({ ...params }: BallModel) {
        this.X = params.X;
        this.Y = params.Y;
        this.velocity = params.velocity;
        this.angleDeg = params.angleDeg;
        this.width = params.width;
        this.height = params.height;
    }

    move(dt: number) {
        const xStep =
            Math.cos((this.angleDeg * Math.PI) / 180) * this.velocity * dt;
        const yStep =
            Math.sin((this.angleDeg * Math.PI) / 180) * this.velocity * dt;
        const toX = this.X + xStep;
        const toY = this.Y + yStep;
        this.X = toX;
        this.Y = toY;
    }
    bounds(): BoundingBox {
        return { x: this.X, y: this.Y, w: this.width, h: this.height };
    }

    checkBounds() {
        const hit = wallHits(this.bounds());
        if (!hit.left && !hit.right && !hit.top && !hit.bottom) return;

        // Work in velocity components so reflection is simple
        const rad = (this.angleDeg * Math.PI) / 180;
        let vx = Math.cos(rad);
        let vy = Math.sin(rad);

        if (hit.left) {
            this.X = 0;
            vx = Math.abs(vx);
        }
        if (hit.right) {
            this.X = 1 - this.width;
            vx = -Math.abs(vx);
        }
        if (hit.top) {
            this.Y = 0;
            vy = Math.abs(vy);
        }
        if (hit.bottom) {
            this.Y = 1 - this.height;
            vy = -Math.abs(vy);
        }

        this.angleDeg = (Math.atan2(vy, vx) * 180) / Math.PI;
    }
    draw(ctx: CanvasRenderingContext2D, transform: AxesModelTransform) {
        ctx.fillStyle = "#FF0000";
        ctx.fillStyle;
        ctx.fillRect(
            transform.X(this.X),
            transform.Y(this.Y),
            transform.X(this.width),
            transform.Y(this.height),
        );
    }
}
