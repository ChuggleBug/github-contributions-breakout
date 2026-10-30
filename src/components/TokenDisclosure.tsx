import { useId, useState } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";

export function TokenDisclosure() {
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
                aria-label="Personal Access Token notice"
                aria-expanded={open}
                aria-controls={panelId}
            >
                <FaRegQuestionCircle size={18} />
            </button>
            <div
                className={`token-disclosure ${open ? "token-disclosure--show" : ""}`}
                id={panelId}
                role="note"
            >
                <strong className="text-fg">Why do I need a token?</strong>
                <p>
                    Private repositories are not accessible through{" "}
                    <a href="https://docs.github.com/en/rest/about-the-rest-api/about-the-rest-api">
                        GitHub's API
                    </a>{" "}
                    without a token. Public repositories do not need this.
                </p>
                <p>
                    If your repository requires a token, it must have at least{" "}
                    <code>Metadata:&nbsp;Read</code> permission for the selected
                    repository.
                </p>
                <p>
                    This is entirely a client-side application. Your token is
                    only sent to GitHub and is not stored within the browser.
                </p>
            </div>
        </div>
    );
}
