import type {
    BlocksDriver,
    BlocksDriverOptions,
    GitHubBlocks,
    BlockFilerOptions,
} from "./blocks/types/types";
import type {
    Response,
    ErrorResponse,
    Contribution,
} from "./blocks/types/gh_contributions";
import type { WeeklyCommitActivity } from "./blocks/types/gh_api";

export abstract class AbstractBlockDriver implements BlocksDriver {
    protected url: string;
    protected filters: BlockFilerOptions | null = null;
    constructor({ _url, filters }: BlocksDriverOptions) {
        if (!_url) {
            throw new Error("Missing url");
        }
        this.url = _url;
        this.filters = filters ?? null; // Convert undefined to null
    }

    abstract getBlocks(): Promise<GitHubBlocks>;
}

export interface ContributionsAPIBlockDriverOptions extends BlocksDriverOptions {
    username: string;
}

export class ContributionsAPIBlockDriver extends AbstractBlockDriver {
    private user: string;

    constructor(options: ContributionsAPIBlockDriverOptions) {
        const { username, ...baseOptions } = options;
        super({
            ...baseOptions,
            _url:
                baseOptions?._url ??
                "https://github-contributions-api.jogruber.de/v4",
        });
        this.user = username;
    }

    async getBlocks(): Promise<GitHubBlocks> {
        const params = new URLSearchParams();
        const now = new Date();

        // Make the API filter by year
        if (this.filters) {
            const sinceDate = this.filters.sinceDate;
            if (sinceDate > now) {
                throw new Error(
                    `Day requested is greater than current year (${sinceDate.toLocaleDateString()} is later than ${now.toLocaleDateString()})`,
                );
            }
            for (
                let i = sinceDate.getFullYear();
                i <= now.getFullYear();
                i += 1
            ) {
                params.append("y", `${i}`);
            }
        }

        // API call and checking
        const resp = await fetch(`${this.url}/${this.user}?${params}`);
        const json = (await resp.json()) as Response;

        // Error is ok
        if (!resp.ok) {
            // Error Response
            if (Object.hasOwn(json, "error")) {
                // It was actually an error response so cast is as such
                const err = json as unknown as ErrorResponse;
                throw new Error(err.error);
            } else {
                // General Error
                throw new Error(`Failed to reach to ${this.url}`);
            }
        }

        // Filter out dates before opt.sinceDate
        // and days after today (the API returns them)
        json.contributions = json.contributions.filter((c) => {
            const d = new Date(Date.parse(c.date));
            // Greater than since
            // Skip greater than if not present
            return this.filters?.sinceDate
                ? d >= this.filters.sinceDate
                : true && d <= now; // Less than curent day
        });

        return {
            total: json.contributions
                .map((c) => c.count)
                .reduce((acc, cur) => acc + cur, 0),
            contributions: json.contributions,
        };
    }
}

export interface GitHubAPIBlocksDriverOptions extends BlocksDriverOptions {
    owner: string;
    repository: string;
    token?: string;
}

export class GitHubAPIBlocksDriver extends AbstractBlockDriver {
    private owner: string;
    private repo: string;
    private token: string | null = null;

    constructor(options: GitHubAPIBlocksDriverOptions) {
        const { owner, repository, token, ...baseOptions } = options;
        super({
            ...baseOptions,
            _url: baseOptions?._url ?? "https://api.github.com",
        });
        this.owner = owner;
        this.repo = repository;
        this.token = token || null; // Empty turns to null
    }

    private toLevel(count: number, max: number): Contribution["level"] {
        if (count === 0) {
            return 0;
        }
        const ratio = count / max;
        if (ratio <= 0.25) {
            return 1;
        }
        if (ratio <= 0.5) {
            return 2;
        }
        if (ratio <= 0.75) {
            return 3;
        }
        return 4;
    }

    private transforCommitActicity(
        activity: WeeklyCommitActivity[],
    ): Contribution[] {
        const DAY_MS = 86_400_000;
        const max = Math.max(1, ...activity.flatMap((e) => e.days));
        const mapped: Contribution[] = activity.flatMap((e) =>
            e.days.map((count: number, dow: number) => ({
                // e.week is Unix seconds for Sunday of that week; add dow days
                date: new Date(e.week * 1000 + dow * DAY_MS)
                    .toISOString()
                    .slice(0, 10),
                count,
                level: this.toLevel(count, max),
            })),
        );

        return mapped;
    }

    async getBlocks(): Promise<GitHubBlocks> {
        const json = await this.apiCall();

        // Epoch as a lower bound
        const lowerTimestamp = this.filters?.sinceDate
            ? this.filters.sinceDate.getTime()
            : 1;
        const upperTimestamp = Date.now();
        const contributions = this.transforCommitActicity(json).filter((c) => {
            const time = new Date(Date.parse(c.date)).getTime();
            return time >= lowerTimestamp && time <= upperTimestamp;
        });

        return {
            total: contributions
                .map((c) => c.count)
                .reduce((acc, cur) => acc + cur, 0),
            contributions: contributions,
        };
    }

    private async apiCall(): Promise<WeeklyCommitActivity[]> {
        const MAX_RETRIES = 10;

        // A token is needed sometimes if requested
        const url = `${this.url}/repos/${this.owner}/${this.repo}/stats/commit_activity`;
        const headers = {
            Accept: "application/vnd.github+json",
            ...(this.token && { Authorization: `Bearer ${this.token}` }),
            "X-GitHub-Api-Version": "2026-03-10",
        };

        for (let retry = 0; retry < MAX_RETRIES; retry += 1) {
            const resp = await fetch(url, { headers });

            if (resp.status === 200) {
                const json = await resp.json();
                return json as WeeklyCommitActivity[];
            } else if (resp.status === 202) {
                // Backoff
                await new Promise((r) =>
                    setTimeout(r, 1000 * Math.pow(2, retry)),
                );
                continue;
            } else if (resp.status === 204) {
                return [];
            } else if (resp.status === 403 || resp.status == 429) {
                const resetStr = resp.headers.get("x-ratelimit-reset");
                let errStr: string;
                if (resetStr) {
                    // A timestamp was given
                    const resetDate = new Date(Number(resetStr) * 1000);
                    errStr = `Too many requests made, try again at ${resetDate.toLocaleString()}`;
                } else {
                    errStr = `Too many requests made`;
                }
                throw new Error(errStr);
            }
            // Unable to find the user
            throw new Error(`Unable to find ${this.owner}/${this.repo}`);
        }
        throw new Error("Took to many reties. Try again");
    }
}
