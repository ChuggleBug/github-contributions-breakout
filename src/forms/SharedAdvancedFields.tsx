import { Field } from "../components/Field";
import type { FieldsProps, SharedFormState } from "./shared";

const EPOCH = "1970-01-01";
const TODAY = () => new Date().toLocaleDateString("en-CA");

/** Advanced options shared by every source. */
export function SharedAdvancedFields({
    value,
    onChange,
}: FieldsProps<SharedFormState>) {
    return (
        <>
            <Field
                label="Only blocks since"
                type="date"
                min={EPOCH}
                max={TODAY()}
                value={value.sinceDate}
                onChange={(e) =>
                    onChange({ ...value, sinceDate: e.target.value })
                }
            />
            {import.meta.env.VITE_MODE === "development" && (
                <Field
                    label="URL Endpoint"
                    type="text"
                    value={value.url}
                    onChange={(e) =>
                        onChange({ ...value, url: e.target.value })
                    }
                />
            )}
        </>
    );
}
