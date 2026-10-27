import { StartingRange } from './types';
import { State } from '../model/types';
export declare const DEFAULT_STATE: State;
export declare function rangeSelect(option: number | StartingRange): number;
export declare const DEFAULTS: {
    paddle: {
        X: number;
        Y: number;
        height: number;
        width: number;
        XSpeed: number;
        YSpeed: number;
    };
    ball: {
        X: number;
        Y: number;
        velocity: number;
        angleDeg: number;
        width: number;
        height: number;
    };
    block: {
        margin: number;
        roundness: number;
    };
    controls: {
        leftKeys: string[];
        rightKeys: string[];
        speedupKeys: string[];
    };
};
export default DEFAULTS;
