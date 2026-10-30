type SlidingToggleProps<T extends string> = {
    options: readonly { value: T; label: string }[];
    value: T;
    onChange: (value: T) => void;
};

export function SlidingToggle<T extends string>({
    options,
    value,
    onChange,
}: SlidingToggleProps<T>) {
    const selectedIndex = Math.max(
        0,
        options.findIndex((o) => o.value === value),
    );
    return (
        <div role="tablist" className="slider">
            {/* Sliding indicator */}
            <div
                aria-hidden
                className="slider-indicator"
                style={{
                    width: `calc((100% - 0.5rem) / ${options.length})`,
                    transform: `translateX(${selectedIndex * 100}%)`,
                }}
            />
            {options.map((o) => (
                <button
                    key={o.value}
                    type="button"
                    role="tab"
                    aria-selected={o.value === value}
                    onClick={() => onChange(o.value)}
                    className="slider-option"
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}
