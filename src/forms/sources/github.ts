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
};
