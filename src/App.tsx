import "./App.css";
import { Breakout } from "@lib/react";
import { useState, useEffect, useRef } from "react";
import { useBreakoutStore } from "@lib/react";
import { type BreakoutStore } from "@lib/react";
import type { BlockGrid } from "@lib";
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
            // Each row of 7 is one week; days within a row now run Saturday → Sunday.
            const day =
                thisSunday - Math.floor(i / 7) * 7 * DAY + (6 - (i % 7)) * DAY;

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

    const divRef = useRef<HTMLDivElement>(null);

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
            <div ref={divRef}>
                <Breakout
                    height={750}
                    width={500}
                    store={store}
                    startingBlocks={blocks}
                    properties={{
                        sidebar: {
                            blockRowIndicator: (n: number) => {
                                const start = new Date(
                                    thisSunday - n * 7 * DAY,
                                ); // Sunday of this row
                                const end = new Date(start.getTime() + 6 * DAY); // Saturday of this row

                                // The row contains the 1st of a month iff its Saturday falls on day 1-7
                                const monthStarts = end.getUTCDate() <= 7;
                                if (n !== 0 && !monthStarts) {
                                    return "";
                                }

                                const month = end.toLocaleString("en-US", {
                                    month: "short",
                                    timeZone: "UTC",
                                });

                                return `${month}`;
                            },
                            blockRowIndicatorWidthHint: 3,
                        },
                    }}
                />
            </div>
            <div
                style={{
                    width: `${divRef.current?.clientWidth ?? 200}px`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "start",
                    alignItems: "start",
                }}
            >
                <div>Time (Game): {store.secondsElapsed}</div>
                <div>Time: {seconds}</div>
            </div>
        </div>
    );
}

export default App;
