import { Field } from "../../components/Field";
import type { ContributionsAPIBlockDriverOptions } from "../../util/blocks";
import type { FieldsProps } from "../shared";

export type ContributionsFormState = Pick<
    ContributionsAPIBlockDriverOptions,
    "username"
>;

export function ContributionsFields({
    value,
    onChange,
}: FieldsProps<ContributionsFormState>) {
    return (
        <Field
            label="GitHub Username"
            type="text"
            placeholder="GitHub Username"
            value={value.username}
            onChange={(e) => onChange({ ...value, username: e.target.value })}
            required
        />
    );
}
