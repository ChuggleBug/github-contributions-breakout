import "./breakout.css";
import { useEffect, useRef } from "react";
import {
    Breakout as BreakoutGame,
    type BreakoutOptions,
} from "../core/breakout";

export type BreakoutProps = BreakoutOptions;

export function Breakout(props: BreakoutProps) {
    const containerRef = useRef<HTMLCanvasElement | null>(null);
    const gameRef = useRef<BreakoutGame | null>(null);

    // Create once, destroy on unmount
    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const game = new BreakoutGame(props);
        game.init();
        gameRef.current = game;

        return () => {
            game.destroy();
            gameRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally empty: the game owns its own lifecycle

    // Forward prop changes to the running game
    useEffect(() => {
        if (props.store) {
            gameRef.current?.setStore(props.store);
        }
    }, [props.store]);

    return <canvas id="breakout" ref={containerRef} />;
}

export default Breakout;
