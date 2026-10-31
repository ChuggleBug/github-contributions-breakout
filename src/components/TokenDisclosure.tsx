import { FaQuestionCircle } from "react-icons/fa";
import { Disclosure } from "./Disclosure";

export function TokenDisclosure() {
    return (
        <Disclosure
            icon={<FaQuestionCircle size={18} />}
            label="Personal Access Token notice"
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
                This is entirely a client-side application. Your token is only
                sent to GitHub and is not stored within the browser.
            </p>
        </Disclosure>
    );
}
