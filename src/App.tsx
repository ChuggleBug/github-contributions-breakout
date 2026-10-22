import "./App.css";
import Breakout from "./components/Breakout";
import { useState } from "react";
import useBreakoutStore, {
    type BreakoutStore,
} from "./components/useBreakoutStore";

function App() {
    const [count, setCount] = useState(0);
    const store: BreakoutStore = useBreakoutStore();

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
            <button onClick={() => setCount((prev) => prev + 1)}>
                Click me: {count}
            </button>
        </div>
    );
}

export default App;
