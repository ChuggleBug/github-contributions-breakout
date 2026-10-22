import { useState } from "react";
import type { State } from "./Breakout";

export type BreakoutStore = {
    score: number;
    setScore: (score: number) => void;
    state: State;
    setState: (state: State) => void;
};

export const DEFAULT_STATE: State = "play";

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
