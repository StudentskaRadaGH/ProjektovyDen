import { Block } from "./types";
import { printTime } from "./utils";

export interface TimeRange {
    from: Date;
    to: Date;
}

export function getEventTimeRange(
    event: { block: number; span: number },
    blocks: Pick<Block, "id" | "from" | "to">[],
): TimeRange {
    const sortedBlocks = [...blocks].sort(
        (a, b) => new Date(a.from).getTime() - new Date(b.from).getTime(),
    );
    const startIndex = sortedBlocks.findIndex((b) => b.id === event.block);

    if (startIndex === -1) {
        return { from: new Date(0), to: new Date(0) };
    }

    const startBlock = sortedBlocks[startIndex];
    const span = Math.max(1, event.span ?? 1);
    const endIndex = Math.min(sortedBlocks.length - 1, startIndex + span - 1);
    const endBlock = sortedBlocks[endIndex];

    return {
        from: new Date(startBlock.from),
        to: new Date(endBlock.to),
    };
}

export function formatTimeRange(range: TimeRange): string {
    return `${printTime(range.from)} - ${printTime(range.to)}`;
}
