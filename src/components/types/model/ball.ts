import * as CONSTANTS from "../../constants";
import { BreakoutModelElement, wallHits } from "./core";
import type { BoundingBox, AxesModelTransform } from "./core";
import { Paddle } from "./paddle";

export type BallModel = {
    X: number;
    Y: number;
    velocity: number;
    angleDeg: number;
    width: number;
    height: number;
};

export class Ball extends BreakoutModelElement {
    X: number;
    Y: number;
    velocity: number;
    angleDeg: number;
    width: number;
    height: number;

    constructor({ ...params }: BallModel) {
        super();
        this.X = params.X;
        this.Y = params.Y;
        this.velocity = params.velocity;
        this.angleDeg = params.angleDeg;
        this.width = params.width;
        this.height = params.height;
    }

    protected moveObject(dt: number) {
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

    protected checkObjectBounds() {
        const hit = wallHits(this.bounds());
        if (!hit.left && !hit.right && !hit.top && !hit.bottom) return hit;

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
        return hit;
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

    handleCollision(element: BreakoutModelElement): void {
        if (element instanceof Paddle) {
            this.handlePaddleCollision(element);
        }
    }

    private static clamp(v: number, lo: number, hi: number) {
        return Math.min(hi, Math.max(lo, v));
    }

    private handlePaddleCollision(paddle: Paddle): void {
        const ball = this.bounds();
        const pad = paddle.bounds();

        // 1. Penetration depth on each axis
        const overlapX =
            Math.min(ball.x + ball.w, pad.x + pad.w) - Math.max(ball.x, pad.x);
        const overlapY =
            Math.min(ball.y + ball.h, pad.y + pad.h) - Math.max(ball.y, pad.y);
        if (overlapX <= 0 || overlapY <= 0) return; // not actually touching

        const ballCenterX = ball.x + ball.w / 2;
        const padCenterX = pad.x + pad.w / 2;

        // Current velocity direction (y grows downward, so "up" is negative y)
        const rad = (this.angleDeg * Math.PI) / 180;
        const vx = Math.cos(rad);
        const vy = Math.sin(rad);

        // 2. Side hit: the ball clipped the paddle's end rather than landing on top
        if (overlapX < overlapY) {
            const dir = ballCenterX < padCenterX ? -1 : 1; // which side the ball is on
            const pushedX = dir < 0 ? pad.x - this.width : pad.x + pad.w;
            const fitsInWorld = pushedX >= 0 && pushedX + this.width <= 1;

            if (fitsInWorld) {
                this.X = pushedX; // eject sideways
                this.setDirection(dir * Math.abs(vx), vy); // head away from the paddle
                return;
            }
            // Sandwiched between paddle and wall: no room to the side,
            // so fall through and launch it over the top of the paddle instead.
        } else if (vy <= 0) {
            // 3. Top overlap but already moving up: it already bounced, don't re-bounce
            return;
        }

        // 4. Top bounce
        this.Y = pad.y - this.height; // sit exactly on top of the paddle

        const offset = Ball.clamp(
            (ballCenterX - padCenterX) / (pad.w / 2),
            -1,
            1,
        ); // -1 left edge .. 1 right edge
        let deg = offset * CONSTANTS.BALL_PADDLE_MAX_BOUNCE_DEG;

        // 5. Nudge only if the paddle is actually moving in that direction
        const moving = paddle.direction;
        if (moving === "left") deg -= CONSTANTS.BALL_PADDLE_NUDGE_DEG;
        else if (moving === "right") deg += CONSTANTS.BALL_PADDLE_NUDGE_DEG;

        deg = Ball.clamp(
            deg,
            -CONSTANTS.BALL_PADDLE_MAX_TOTAL_DEG,
            CONSTANTS.BALL_PADDLE_MAX_TOTAL_DEG,
        );
        this.angleDeg = -90 + deg; // -90 = straight up
    }

    private setDirection(vx: number, vy: number): void {
        this.angleDeg = (Math.atan2(vy, vx) * 180) / Math.PI;
    }
}
