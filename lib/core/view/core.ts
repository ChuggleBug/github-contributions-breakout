export type Orientation = "vertical" | "horizontal";

export type Ends = {
    start: number;
    end: number;
};

export type View = {
    horizontal: Ends;
    vertical: Ends;
};

const SCREEN_VIEW = {
    horizontal: {
        start: 0,
        end: 1,
    },
    vertical: {
        start: 0,
        end: 1,
    },
};

export class GameWindow {
    private views: Record<number, View>;
    private viewIDCounter: number;
    constructor() {
        this.views = {
            0: structuredClone(SCREEN_VIEW),
        };
        this.viewIDCounter = 0;
    }

    get mainView() {
        return this.views[0];
    }

    get screenView() {
        return -1;
    }

    get mainViewID() {
        return 0;
    }

    private viewIDCheck(id: number) {
        if (!(id in this.views)) {
            return Error(`Invalid View number ${id}`);
        }
    }

    view(id: number) {
        if (id === -1) {
            return structuredClone(SCREEN_VIEW);
        }
        this.viewIDCheck(id);
        return this.views[id];
    }

    /**
     *
     * @param id
     * @param at
     * @param o
     * @returns the view ID of the right or bottom newly created split
     */
    splitView(id: number, at: number, o: Orientation): number {
        this.viewIDCheck(id);

        let toSplit = this.views[id];
        let newSplit: View;
        switch (o) {
            // Make split along the vertical axis
            case "vertical": {
                const border = Math.abs(
                    toSplit.horizontal.end - at - toSplit.horizontal.end,
                );
                newSplit = {
                    horizontal: {
                        start: border,
                        end: toSplit.horizontal.end,
                    },
                    vertical: structuredClone(toSplit.vertical),
                };
                toSplit.horizontal.end = border;
                break;
            }
            // Make split along the horizontal axis
            case "horizontal": {
                const border = Math.abs(
                    toSplit.vertical.end - at - toSplit.vertical.end,
                );
                newSplit = {
                    horizontal: structuredClone(toSplit.horizontal),
                    vertical: {
                        start: border,
                        end: toSplit.vertical.end,
                    },
                };
                toSplit.vertical.end = border;
                break;
            }
            default:
                throw new Error("Invalid Orientation");
        }

        // Update values
        this.views[id] = toSplit;

        this.viewIDCounter += 1;
        this.views[this.viewIDCounter] = newSplit;

        return this.viewIDCounter;
    }
}
