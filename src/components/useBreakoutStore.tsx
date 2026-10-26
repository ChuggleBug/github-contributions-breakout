import { useState } from "react";
import type { State } from "../script/model/types";
import { type BreakoutStore } from "../script/breakout";
import { DEFAULT_STATE } from "../script/properties/defaults";

export function useBreakoutStore(): BreakoutStore {
    const [score, setScore] = useState(0);
    const [state, setState] = useState<State>(DEFAULT_STATE);

    return {
        score,
        setScore,
        state,
        setState,
    };
}

export default useBreakoutStore;
