import "./App.css";
import Breakout from "./components/Breakout";
import { useState, useEffect } from "react";
import useBreakoutStore, {
    type BreakoutStore,
} from "./components/useBreakoutStore";

function App() {
    const store: BreakoutStore = useBreakoutStore();

    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(id);
    }, []);

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
            <Breakout height={500} width={500} store={store} />
            <div>Score: {store.score}</div>
            <div>Time: {seconds}</div>
            <div>{store.state}</div>
        </div>
    );
}

export default App;
