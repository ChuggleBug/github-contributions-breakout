import { useState, type SubmitEvent } from "react";
import type { BlocksDriver } from "../util/blocks/types/core";
import { SharedAdvancedFields } from "./SharedAdvancedFields";
import {
    toSharedOptions,
    type SharedFormState,
    type SourceDefinition,
} from "./shared";

export type SourceFormProps = {
    shared: SharedFormState;
    onSharedChange: (next: SharedFormState) => void;
    onSubmit: (driver: BlocksDriver) => void;
};

type APIFormProps<T> = SourceFormProps & { source: SourceDefinition<T> };

export function APIForm<T>({
    source,
    shared,
    onSharedChange,
    onSubmit,
}: APIFormProps<T>) {
    const [specific, setSpecific] = useState<T>(source.initial);
    // Start open if a shared advanced value is already set (e.g. after swapping sources).
    const [advancedOpen, setAdvancedOpen] = useState(!!shared.sinceDate);

    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(source.create(specific, toSharedOptions(shared)));
    };

    return (
        <form
            className="flex flex-col gap-3"
            autoComplete="off"
            onSubmit={handleSubmit}
        >
            <source.Fields value={specific} onChange={setSpecific} />
            <details
                className="details"
                open={advancedOpen}
                onToggle={(e) => setAdvancedOpen(e.currentTarget.open)}
            >
                <summary>Advanced features</summary>
                <div className="details-body">
                    {source.AdvancedFields && (
                        <source.AdvancedFields
                            value={specific}
                            onChange={setSpecific}
                        />
                    )}
                    <SharedAdvancedFields
                        value={shared}
                        onChange={onSharedChange}
                    />
                </div>
            </details>
            <button type="submit" className="btn btn-primary self-start">
                Submit
            </button>
        </form>
    );
}
