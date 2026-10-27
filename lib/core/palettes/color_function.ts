import type { ColorLevelFn } from "./types";

export class MemoColorLevelFunction implements ColorLevelFn {
    private colorTable: Record<number, string>;
    private fn: (level: number) => string;

    constructor(fn: (level: number) => string) {
        this.fn = fn;
        this.colorTable = {};
    }

    colorFor(level: number): string {
        if (!(level in this.colorTable)) {
            this.colorTable[level] = this.fn(level);
        }
        return this.colorTable[level];
    }
}
