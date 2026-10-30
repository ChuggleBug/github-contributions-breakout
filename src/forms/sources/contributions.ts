import {
    ContributionsFields,
    type ContributionsFormState,
} from "../fields/ContributionsFields";
import { ContributionsAPIBlockDriver } from "../../util/blocks";
import { MY_USER, type SourceDefinition } from "../shared";

export const contributionsSource: SourceDefinition<ContributionsFormState> = {
    prettyName: "grubersjoe/github-contributions-api",
    initial: { username: MY_USER },
    Fields: ContributionsFields,
    create: (specific, shared) =>
        new ContributionsAPIBlockDriver({ ...shared, ...specific }),
};
