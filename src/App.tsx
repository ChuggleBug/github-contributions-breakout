import React, { useReducer, useRef, useState } from "react";
import { Breakout, type BreakoutProps } from "@breakout/react";
import { FaRegCopy } from "react-icons/fa";

import type { BlocksDriver, GitHubBlocks } from "./util/blocks/types/core";
import { Dropdown } from "./components/Dropdown";
import { SlidingToggle } from "./components/SlidingToggle";
import { INITIAL_SHARED, type SharedFormState } from "./forms/shared";
import { SOURCES, type SourceKey } from "./forms/sources";
import {
    blockTransform,
    ROW_SIZES,
    type RowLength,
} from "./util/transform/blocks_transform";
import type { BreakoutGameProperties } from "@breakout";

const GAME_HEIGHT = 750;
const GAME_WIDTH = 500;

const CONFIG_TABS = [
    { value: "api", label: "API Configurations" },
    { value: "game", label: "Game Configurations" },
] as const;

type ConfigTab = (typeof CONFIG_TABS)[number]["value"];

function App() {
    const [startingBlocks, setStartingBlocks] = useState<
        BreakoutProps["startingBlocks"] | null
    >(null);
    const gameStart = startingBlocks !== null;
    const propertiesRef = useRef<BreakoutGameProperties>({});

    const [configTab, setConfigTab] = useState<ConfigTab>("api");

    const [sourceKey, setSourceKey] = useState<SourceKey>("account");
    const source = SOURCES[sourceKey];
    // Lives in App so shared options survive swapping sources.
    const [shared, setShared] = useState<SharedFormState>(INITIAL_SHARED);

    const [rawInput, setRawInput] = useState<GitHubBlocks | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const rawInputPretty = rawInput
        ? JSON.stringify(rawInput, null, 2)
        : "(none)";

    const [copied, setCopied] = useState(false);

    let textContent: React.ReactNode | string = (
        <span className="text-fg-muted">No output yet</span>
    );
    if (error) {
        textContent = (
            <>
                <strong className="text-danger">Error: </strong>
                <span>{error}</span>
            </>
        );
    } else if (loading && !rawInput) {
        textContent = "Loading";
    } else if (!loading && rawInput) {
        textContent = rawInputPretty;
    }

    const [rowLength, setRowLength] = useState<RowLength>("weekly");

    const handleSubmission = async (driver: BlocksDriver) => {
        setRawInput(null);
        setError(null);

        setLoading(true);

        setTimeout(
            async () => {
                try {
                    setRawInput(await driver.getBlocks());
                } catch (e) {
                    setError(e instanceof Error ? e.message : String(e));
                } finally {
                    setLoading(false);
                }
            },
            import.meta.env.VITE_MODE === "development" ? 1000 : 0,
        );
    };

    const handleCopy = () => {
        if (!error && rawInput) {
            navigator.clipboard.writeText(rawInputPretty);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    const handleGameStart = () => {
        if (!rawInput) {
            return;
        }
        const { data, properties: sidebar } = blockTransform(rawInput, {
            rowLength,
        });
        propertiesRef.current.sidebar = sidebar;
        setStartingBlocks(data);
    };

    return (
        <main className="grid min-h-dvh grid-cols-1 gap-10 p-10 xl:grid-cols-2">
            {/* Game Content */}
            <section className="flex items-center justify-center">
                {gameStart ? (
                    <Breakout
                        height={GAME_HEIGHT}
                        width={GAME_WIDTH}
                        startingBlocks={startingBlocks}
                        properties={propertiesRef.current}
                    />
                ) : (
                    <div
                        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
                        className="flex items-center justify-center rounded-md border border-dashed border-border"
                    >
                        Load a user or repository to start playing
                    </div>
                )}
            </section>

            {/* Configs. `contain: size` stops the output from growing the row, so this column fills the height instead. */}
            <section className="flex flex-col gap-6 xl:contain-size">
                <h1>GitHub Contributions Breakout</h1>
                <Dropdown text="Configurations">
                    <SlidingToggle
                        options={CONFIG_TABS}
                        value={configTab}
                        onChange={setConfigTab}
                    />
                    {configTab === "api" ? (
                        <>
                            <label className="flex items-center gap-2">
                                Get contributions at the
                                <select
                                    className="input py-1"
                                    value={sourceKey}
                                    onChange={(e) =>
                                        setSourceKey(
                                            e.target.value as SourceKey,
                                        )
                                    }
                                >
                                    {(Object.keys(SOURCES) as SourceKey[]).map(
                                        (key) => (
                                            <option key={key} value={key}>
                                                {key}
                                            </option>
                                        ),
                                    )}
                                </select>
                                level
                            </label>
                            {/* `key` makes each source start with its own fresh state when swapped. */}
                            <source.Form
                                key={sourceKey}
                                shared={shared}
                                onSharedChange={setShared}
                                onSubmit={handleSubmission}
                            />
                        </>
                    ) : (
                        <>
                            <label className="flex items-center gap-2">
                                Set rows to
                                <select
                                    className="input py-1"
                                    onChange={(e) =>
                                        setRowLength(
                                            e.target.value as RowLength,
                                        )
                                    }
                                >
                                    {(
                                        Object.keys(ROW_SIZES) as RowLength[]
                                    ).map((key) => (
                                        <div>
                                            <option key={key} value={key}>
                                                {key}
                                            </option>
                                        </div>
                                    ))}
                                </select>
                                {`(${ROW_SIZES[rowLength]}`} blocks per row{")"}
                            </label>
                        </>
                    )}
                </Dropdown>
                <Dropdown
                    text={`${source.label} Level Output`}
                    className="min-h-0 flex-1"
                >
                    <div className="relative flex min-h-0 flex-1 flex-col">
                        <div className="absolute top-2 right-2 flex items-center">
                            <div
                                className={`${copied ? "opacity-100" : "opacity-0"} transition-opacity absolute right-full mr-2 rounded-md border border-control-border bg-control px-2 py-1 text-xs whitespace-nowrap text-fg shadow-lg`}
                                role="status"
                            >
                                Copied!
                            </div>
                            <button
                                className="flex size-8 items-center justify-center rounded-md border border-control-border bg-control text-fg-muted transition-colors hover:bg-control-hover hover:text-fg"
                                type="button"
                                aria-label="Copy Output"
                                onClick={handleCopy}
                            >
                                <FaRegCopy />
                            </button>
                        </div>
                        <pre className="panel max-h-96 min-h-24 flex-1 xl:max-h-none">
                            {textContent}
                        </pre>
                    </div>
                </Dropdown>
                <div>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleGameStart}
                    >
                        Start Game
                    </button>
                </div>
            </section>
        </main>
    );
}

export default App;
