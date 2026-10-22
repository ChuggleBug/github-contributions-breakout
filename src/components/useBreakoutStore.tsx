import { useState } from "react";

export type BreakoutStore = {
    score: number;
    setScore: (score: number) => void;
};

export default function useBreakoutStore(): BreakoutStore {
    const [score, setScore] = useState(0);

    return {
        score,
        setScore,
    };
}
