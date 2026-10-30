import { Field } from "../../components/Field";
import { TokenDisclosure } from "../../components/TokenDisclosure";
import type { GitHubAPIBlocksDriverOptions } from "../../util/blocks";
import type { FieldsProps } from "../shared";

export type GitHubFormState = Pick<
    GitHubAPIBlocksDriverOptions,
    "owner" | "repository"
> & { token: string };

export function GitHubFields({
    value,
    onChange,
}: FieldsProps<GitHubFormState>) {
    return (
        <>
            <Field
                label="Repository Owner"
                type="text"
                placeholder="Repository Owner"
                value={value.owner}
                onChange={(e) => onChange({ ...value, owner: e.target.value })}
                required
            />
            <Field
                label="Repository Name"
                type="text"
                placeholder="Repository Name"
                value={value.repository}
                onChange={(e) =>
                    onChange({ ...value, repository: e.target.value })
                }
                required
            />
        </>
    );
}

export function GitHubAdvancedFields({
    value,
    onChange,
}: FieldsProps<GitHubFormState>) {
    return (
        <Field
            label="Access Token"
            type="password"
            autoComplete="off"
            placeholder="PAT Token"
            value={value.token}
            onChange={(e) => onChange({ ...value, token: e.target.value })}
        >
            <TokenDisclosure />
        </Field>
    );
}
