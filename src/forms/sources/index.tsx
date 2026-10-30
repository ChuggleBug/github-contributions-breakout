import { APIForm, type SourceFormProps } from "../APIForm";
import type { SourceDefinition } from "../shared";
import { contributionsSource } from "./contributions";
import { gitHubSource } from "./github";

/** Binds a source to the form so every entry in SOURCES has the same type. */
function bindSource<T>(source: SourceDefinition<T>) {
    return function SourceForm(props: SourceFormProps) {
        return <APIForm source={source} {...props} />;
    };
}

/** Keyed by the level shown in the "Get contributions at the ___ level" select. */
export const SOURCES = {
    account: { label: "Account", Form: bindSource(contributionsSource) },
    repository: { label: "Repository", Form: bindSource(gitHubSource) },
};

export type SourceKey = keyof typeof SOURCES;
