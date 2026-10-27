import { useState } from "react";
import type { State } from "../core/model/types";
import { type BreakoutStore } from "../core/breakout";
import { DEFAULT_STATE } from "../core/properties/defaults";

export function useBreakoutStore(): BreakoutStore {
    const [score, setScore] = useState(0);
    const [state, setState] = useState<State>(DEFAULT_STATE);

    return {
        secondsElapsed: score,
        setSecondsElapsed: setScore,
        state,
        setState,
    };
}

export default useBreakoutStore;
