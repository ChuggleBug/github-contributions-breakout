import { ColorLevelFn } from './types';
export declare class MemoColorLevelFunction implements ColorLevelFn {
    private colorTable;
    private fn;
    constructor(fn: (level: number) => string);
    colorFor(level: number): string;
}
