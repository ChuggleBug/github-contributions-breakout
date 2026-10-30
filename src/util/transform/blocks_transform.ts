import type { BlockData, BlockGrid, SidebarDisplayProperties } from "@breakout";
import type { GitHubBlocks } from "../../user";

const ROW_SIZES = {
    weekly: 7,
    biweekly: 14,
    monthly: 31,
} as const;

export type RowLength = keyof typeof ROW_SIZES;

export type BlockTransformOptions = {
    rowLength: RowLength;
};

export function BlockTransform(
    blocks: GitHubBlocks,
    opt: BlockTransformOptions,
): { data: BlockGrid; properties: SidebarDisplayProperties } {
    const blockData: BlockData[] = [];

    return {
        data: {
            blocksPerRow: ROW_SIZES[opt.rowLength],
            blocks: blockData,
        },
        properties: {
            
        }
    };
}
