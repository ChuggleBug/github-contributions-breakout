import type { Contribution } from "./gh_contributions";

export type GitHubBlocks = {
    total: number;
    contributions: ReadonlyArray<Contribution>;
};

export type BlocksDriverOptions = {
    _url?: string; // Handled by a derived class
    filters?: BlockFilerOptions;
};

export type BlockFilerOptions = {
    sinceDate: Date;
};

export interface BlocksDriver {
    getBlocks(): Promise<GitHubBlocks>;
}
