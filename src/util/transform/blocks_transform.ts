import type { BlockData, BlockGrid, SidebarDisplayProperties } from "@breakout";
import type { GitHubBlocks } from "../../user";

export const ROW_SIZES = {
    weekly: 7,
    biweekly: 14,
    monthly: 31,
} as const;

export type RowLength = keyof typeof ROW_SIZES;

export type BlockTransformOptions = {
    rowLength: RowLength;
};

const DAY = 86_400_000;

function monthName(time: number): string {
    return new Date(time).toLocaleString("en-US", {
        month: "short",
        timeZone: "UTC",
    });
}

// Row 0 is the most recent unit. Within a row, days run newest → oldest,
// so day 0 of the unit (Sunday / the 1st) is the last block of the row.
export function blockTransform(
    blocks: GitHubBlocks,
    opt: BlockTransformOptions,
): { data: BlockGrid; properties: SidebarDisplayProperties } {
    const blocksPerRow = ROW_SIZES[opt.rowLength];

    const now = new Date();
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const earliest = Math.min(
        today,
        ...blocks.contributions.map((c) => Date.parse(c.date)),
    );
    const levels = new Map(blocks.contributions.map((c) => [c.date, c.level]));

    const levelOf = (day: number): number =>
        day > today
            ? 0 // filler: days that haven't happened yet
            : (levels.get(new Date(day).toISOString().slice(0, 10)) ?? 0); // filler for gaps

    if (opt.rowLength === "monthly") {
        const thisYear = new Date(today).getUTCFullYear();
        const thisMonth = new Date(today).getUTCMonth();
        const months =
            (thisYear - new Date(earliest).getUTCFullYear()) * 12 +
            (thisMonth - new Date(earliest).getUTCMonth()) +
            1;

        // Date.UTC rolls negative months back into previous years
        const monthStart = (n: number) => Date.UTC(thisYear, thisMonth - n, 1);
        const daysInMonth = (n: number) =>
            new Date(Date.UTC(thisYear, thisMonth - n + 1, 0)).getUTCDate();

        const blockData: BlockData[] = Array.from(
            { length: months * blocksPerRow },
            (_, i) => {
                const n = Math.floor(i / blocksPerRow);
                // Days within a row run 31 → 1
                const dayOfMonth = blocksPerRow - (i % blocksPerRow);

                return {
                    level:
                        dayOfMonth > daysInMonth(n)
                            ? 0 // filler: months shorter than 31 days
                            : levelOf(monthStart(n) + (dayOfMonth - 1) * DAY),
                };
            },
        );

        return {
            data: { blocksPerRow, blocks: blockData },
            properties: {
                // Every row is a new month
                blockRowIndicator: (n: number) => monthName(monthStart(n)),
                blockRowIndicatorWidthHint: 3,
            },
        };
    }

    // Weekly / biweekly: rows start on a Sunday, and row 0 ends this Saturday
    const thisSunday = today - new Date(today).getUTCDay() * DAY;
    const firstRowStart = thisSunday - (blocksPerRow - 7) * DAY;
    const rowStart = (n: number) => firstRowStart - n * blocksPerRow * DAY;
    const rows =
        Math.ceil((firstRowStart - earliest) / (blocksPerRow * DAY)) + 1;

    const blockData: BlockData[] = Array.from(
        { length: rows * blocksPerRow },
        (_, i) => {
            // Days within a row run Saturday → Sunday
            const day =
                rowStart(Math.floor(i / blocksPerRow)) +
                (blocksPerRow - 1 - (i % blocksPerRow)) * DAY;
            return { level: levelOf(day) };
        },
    );

    return {
        data: { blocksPerRow, blocks: blockData },
        properties: {
            blockRowIndicator: (n: number) => {
                const end = rowStart(n) + (blocksPerRow - 1) * DAY; // Saturday of this row

                // The row contains the 1st of a month iff its Saturday falls within the row's length
                const monthStarts = new Date(end).getUTCDate() <= blocksPerRow;
                if (n !== 0 && !monthStarts) {
                    return "";
                }

                return monthName(end);
            },
            blockRowIndicatorWidthHint: 3,
        },
    };
}
