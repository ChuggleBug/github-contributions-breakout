import { useId, useState, type ReactNode } from "react";
import { FaChevronDown } from "react-icons/fa";

type DropdownProps = {
    text: string;
    children?: ReactNode;
    className?: string;
};

export function Dropdown({ text, children, className = "" }: DropdownProps) {
    const [open, setOpen] = useState(true);
    const contentId = useId();

    return (
        <div className={`flex flex-col ${className}`}>
            <button
                type="button"
                className="flex items-center justify-between border-b border-border pb-2 text-left"
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-controls={contentId}
            >
                <h2>{text}</h2>
                <FaChevronDown
                    className={`transition-transform duration-300 ${open ? "" : "-rotate-90"}`}
                />
            </button>
            {open && (
                <div
                    id={contentId}
                    className="flex min-h-0 flex-1 flex-col gap-3 pt-3"
                >
                    {children}
                </div>
            )}
        </div>
    );
}
