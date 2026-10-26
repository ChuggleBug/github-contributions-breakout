import { useState } from "react";
import type { State } from "../script/model/core";
import { DEFAULT_STATE } from "../script/properties/defaults";

export type BreakoutStore = {
    score: number;
    setScore: (score: number) => void;
    state: State;
    setState: (state: State) => void;
};
export default function useBreakoutStore(): BreakoutStore {
    const [score, setScore] = useState(0);
    const [state, setState] = useState<State>(DEFAULT_STATE);

    return {
        score,
        setScore,
        state,
        setState,
    };
}
