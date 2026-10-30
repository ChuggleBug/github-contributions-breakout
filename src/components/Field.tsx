import { useId, type InputHTMLAttributes, type ReactNode } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    /** Rendered after the input, e.g. a help button. */
    children?: ReactNode;
};

/** A labelled input row. */
export function Field({ label, children, ...inputProps }: FieldProps) {
    const id = useId();
    return (
        <div className="field">
            <label className="field-label" htmlFor={id}>
                {label}
                {inputProps.required && (
                    <span className="text-danger" aria-hidden>
                        {" "}
                        *
                    </span>
                )}
            </label>
            <input className="input" id={id} {...inputProps} />
            {children}
        </div>
    );
}
