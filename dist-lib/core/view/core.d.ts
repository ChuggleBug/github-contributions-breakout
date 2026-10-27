export type Orientation = "vertical" | "horizontal";
export type Ends = {
    start: number;
    end: number;
};
export type View = {
    horizontal: Ends;
    vertical: Ends;
};
export declare class GameWindow {
    private views;
    private viewIDCounter;
    constructor();
    get mainView(): View;
    get screenView(): number;
    get mainViewID(): number;
    private viewIDCheck;
    view(id: number): View;
    /**
     *
     * @param id
     * @param at
     * @param o
     * @returns the view ID of the right or bottom newly created split
     */
    splitView(id: number, at: number, o: Orientation): number;
}
