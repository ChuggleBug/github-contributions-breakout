import {
    GitHubAdvancedFields,
    GitHubFields,
    type GitHubFormState,
} from "../fields/GitHubFields";
import { GitHubAPIBlocksDriver } from "../../util/blocks";
import { MY_REPO, MY_USER, type SourceDefinition } from "../shared";

export const gitHubSource: SourceDefinition<GitHubFormState> = {
    prettyName: "GitHub REST API",
    initial: { owner: MY_USER, repository: MY_REPO, token: "" },
    Fields: GitHubFields,
    AdvancedFields: GitHubAdvancedFields,
    create: ({ owner, repository, token }, shared) =>
        new GitHubAPIBlocksDriver({
            ...shared,
            owner,
            repository,
            ...(!!token && { token }),
        }),
    note: (
        <>
            <span>
                GitHub returns only the commits of the previous 52 weeks. Refer
                to the{" "}
            </span>
            <a href="https://docs.github.com/en/rest/metrics/statistics?apiVersion=2026-03-10#get-the-last-year-of-commit-activity">
                API Docs
            </a>
            <span> for more information.</span>
        </>
    ),
};
