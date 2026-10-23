import "./App.css";
import Breakout from "./components/Breakout";
import { useState, useEffect } from "react";
import useBreakoutStore, {
    type BreakoutStore,
} from "./components/useBreakoutStore";
import type { BlockGrid } from "./components/types/properties";

function App() {
    const store: BreakoutStore = useBreakoutStore();

    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(id);
    }, []);

    const range = (start: number, end: number) =>
        Array.from({ length: end - start + 1 }, (_, i) => i + start);
    const blocks: BlockGrid = {
        blocksPerRow: 7,
        blocks: range(1, 35).map((n) => {
            // blocks: range(1, 700).map((n) => {
            return { level: n };
        }),
    };

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
                height={500}
                width={500}
                store={store}
                startingBlocks={blocks}
                palette="random"
            />
            <div>Score: {store.score}</div>
            <div>Time: {seconds}</div>
            <div>{store.state}</div>
        </div>
    );
}

export default App;
