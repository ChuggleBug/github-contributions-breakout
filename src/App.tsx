import { useState } from "react";
import { Breakout, type BreakoutProps } from "@breakout/react";
import { FaRegCopy } from "react-icons/fa";

import type { BlocksDriver, GitHubBlocks } from "./util/blocks/types/core";
import { Dropdown } from "./components/Dropdown";
import { SlidingToggle } from "./components/SlidingToggle";
import { INITIAL_SHARED, type SharedFormState } from "./forms/shared";
import { SOURCES, type SourceKey } from "./forms/sources";

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
    const gameLoaded = startingBlocks !== null;

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

    const handleSubmission = async (driver: BlocksDriver) => {
        setRawInput(null);
        setError(null);

        setLoading(true);
        try {
            setRawInput(await driver.getBlocks());
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!error && rawInput) {
            navigator.clipboard.writeText(rawInputPretty);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    return (
        <main className="grid min-h-dvh grid-cols-1 gap-10 p-10 xl:grid-cols-2">
            {/* Game Content */}
            <section className="flex items-center justify-center">
                {gameLoaded ? (
                    <Breakout
                        height={GAME_HEIGHT}
                        width={GAME_WIDTH}
                        startingBlocks={startingBlocks}
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
                        <p>Game configurations coming soon</p>
                    )}
                </Dropdown>
                <Dropdown
                    text={`${source.label} Level API Output`}
                    className="min-h-0 flex-1"
                >
                    {error && (
                        <div className="flash-error" role="alert">
                            <strong className="text-danger">Error: </strong>
                            {error}
                        </div>
                    )}
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
                            {rawInput ? (
                                rawInputPretty
                            ) : (
                                <span className="text-fg-muted">
                                    No output yet
                                </span>
                            )}
                        </pre>
                    </div>
                </Dropdown>
                <div>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => {}}
                    >
                        Start Game
                    </button>
                </div>
            </section>
        </main>
    );
}

export default App;
