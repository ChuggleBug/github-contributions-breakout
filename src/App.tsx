import "./App.css";
import Breakout from "./components/Breakout";
import { useState, useEffect } from "react";
import { useBreakoutStore } from "./components/useBreakoutStore";
import { type BreakoutStore } from "./script/breakout";
import type { BlockGrid } from "./script/properties/types";
import { user } from "./user";

function App() {
    const store: BreakoutStore = useBreakoutStore();

    const [seconds, setSeconds] = useState(0);

    const DAY = 86_400_000;
    const now = new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const thisSunday = today - new Date(today).getUTCDay() * DAY;
    const earliest = Math.min(
        ...user.contributions.map((c) => Date.parse(c.date)),
    );
    const earliestSunday = earliest - new Date(earliest).getUTCDay() * DAY;
    const weeks = Math.round((thisSunday - earliestSunday) / (7 * DAY)) + 1;
    const levels = new Map(user.contributions.map((c) => [c.date, c.level]));

    let blocks: BlockGrid;

    blocks = {
        blocksPerRow: 7,
        blocks: Array.from({ length: weeks * 7 }, (_, i) => {
            // i = 0 is this week's Sunday, 7 is last week's Sunday, etc.
            const day =
                thisSunday - Math.floor(i / 7) * 7 * DAY + (i % 7) * DAY;
            return {
                level:
                    day > today
                        ? 0 // filler: future days in the current week
                        : (levels.get(
                              new Date(day).toISOString().slice(0, 10),
                          ) ?? 0), // filler for gaps
            };
        }),
    };

    useEffect(() => {
        const id = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(id);
    }, []);

    // const range = (start: number, end: number) =>
    //     Array.from({ length: end - start + 1 }, (_, i) => i + start);
    // blocks = {
    //     blocksPerRow: 7,
    //     // blocks: range(1, 700).map((_n) => {
    //     //     return { level: range(0, 4)[Math.floor(Math.random() * 4)] };
    //     // }),
    //     blocks: [
    //         [0, 0, 0, 1, 0, 0, 0],
    //         [0, 0, 0, 0, 0, 0, 0],
    //         [0, 0, 0, 0, 0, 0, 0],
    //         [0, 0, 0, 0, 0, 0, 0],
    //         [0, 0, 0, 0, 0, 0, 0],
    //         [0, 0, 0, 0, 0, 0, 0],
    //         [0, 0, 0, 0, 0, 0, 0],
    //         [0, 0, 0, 0, 0, 0, 0],
    //         [0, 0, 0, 0, 0, 0, 0],
    //         [0, 0, 0, 0, 0, 0, 0],
    //         [0, 0, 0, 0, 0, 0, 0],
    //         [0, 0, 0, 0, 0, 0, 0],
    //         [0, 0, 0, 0, 0, 0, 0],
    //         [0, 0, 0, 0, 0, 0, 0],
    //         [0, 0, 0, 1, 0, 0, 0],
    //         [0, 0, 0, 1, 0, 0, 0],
    //     ]
    //         .flat()
    //         .map((n) => {
    //             return {
    //                 level: n,
    //             };
    //         }),
    //     blockRowIndicator: (n: number) => `Row ${n}`,
    // };

    return (
        <div
            style={{
                height: "100vh",
                // width: "100vw",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Breakout
                height={750}
                width={500}
                store={store}
                startingBlocks={blocks}
            />
            <div>Score: {store.score}</div>
            <div>Time: {seconds}</div>
            <div>{store.state}</div>
        </div>
    );
}

export default App;
