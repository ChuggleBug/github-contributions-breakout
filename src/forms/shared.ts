import type { ComponentType } from "react";
import type {
    BlocksDriver,
    BlocksDriverOptions,
} from "../util/blocks/types/core";

// Defaults to show what to put
export const MY_USER = "ChuggleBug";
export const MY_REPO = "WikiGraph";

export type FieldsProps<T> = {
    value: T;
    onChange: (next: T) => void;
};

/** Options shared by every source. Lives above the form so it survives swapping sources. */
export type SharedFormState = {
    sinceDate: string;
    url: string;
};

export const INITIAL_SHARED: SharedFormState = { sinceDate: "", url: "" };

/** Convert form state -> the shared part of any driver's options. */
export function toSharedOptions(shared: SharedFormState): BlocksDriverOptions {
    return {
        ...(shared.sinceDate && {
            filters: { sinceDate: new Date(`${shared.sinceDate}T00:00:00Z`) },
        }),
        ...(!!shared.url && { _url: shared.url }),
    };
}

export type SourceDefinition<T> = {
    prettyName: string;
    initial: T;
    Fields: ComponentType<FieldsProps<T>>;
    /** Source-specific fields shown inside the collapsed "Advanced features". */
    AdvancedFields?: ComponentType<FieldsProps<T>>;
    create: (specific: T, shared: BlocksDriverOptions) => BlocksDriver;
};
