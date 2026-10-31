import { useId, useState, type ReactNode } from "react";

type DisclosureProps = {
    icon: ReactNode;
    label: string;
    align?: "left" | "right";
    children: ReactNode;
};

export function Disclosure({
    icon,
    label,
    align = "right",
    children,
}: DisclosureProps) {
    const [open, setOpen] = useState(false);
    const panelId = useId();

    return (
        <div className="relative flex">
            <button
                className="text-fg-muted hover:text-fg"
                type="button"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onClick={() => setOpen((prev) => !prev)}
                aria-label={label}
                aria-expanded={open}
                aria-controls={panelId}
            >
                {icon}
            </button>
            <div
                className={`token-disclosure ${align === "left" ? "token-disclosure--left" : ""} ${open ? "token-disclosure--show" : ""}`}
                id={panelId}
                role="note"
            >
                {children}
            </div>
        </div>
    );
}
