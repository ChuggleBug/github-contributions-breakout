import type { GitHubBlocks } from "../user";

const STORED_OUTPUT_KEY = "ghBlocksSavedOutput";

type LocalStorageSavedOutput = {
    timestamp: number;
    output: GitHubBlocks;
};

export function getSavedOutput(): GitHubBlocks | null {
    const raw = localStorage.getItem(STORED_OUTPUT_KEY);
    if (!raw) {
        return null;
    }
    const stored = JSON.parse(raw) as LocalStorageSavedOutput;
    return stored.output;
}

export function setSavedOutput(output: GitHubBlocks | null) {
    if (!output) {
        localStorage.removeItem(STORED_OUTPUT_KEY);
        return;
    }
    const stored: LocalStorageSavedOutput = {
        timestamp: Date.now(),
        output,
    };
    localStorage.setItem(STORED_OUTPUT_KEY, JSON.stringify(stored));
}
