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

export interface BreakoutModelElement {
    move(dt: number): void;
    checkBounds(): void;
    draw(ctx: CanvasRenderingContext2D, transform: AxesModelTransform): void;
    // bounds(): BoundingBox;
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

    checkBounds() {
        // Left Edge Detection
        if (this.X <= 0) {
            this.X = 0;
        }
        // Right edge Detection
        if (this.X + this.width >= 1) {
            this.X = 1 - this.width;
        }
        if (this.X <= 0) {
            this.X = 0;
        }
        // Right edge Detection
        if (this.X + this.width >= 1) {
            this.X = 1 - this.width;
        }
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
    checkBounds() {}
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
