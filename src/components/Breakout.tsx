// GameComponent.tsx
import "./breakout.css";
import { useEffect, useRef } from "react";
import { Breakout, type BreakoutOptions } from "../script/breakout";

type BreakoutProps = BreakoutOptions;

export default function GameComponent(props: BreakoutProps) {
    const containerRef = useRef<HTMLCanvasElement | null>(null);
    const gameRef = useRef<Breakout | null>(null);

    // Create once, destroy on unmount
    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const game = new Breakout(props);
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
