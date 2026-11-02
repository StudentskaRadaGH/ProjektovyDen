type SpanBlock = { id: number; from: Date };

/**
 * ID bloků, které přednáška začínající v bloku `startBlockId` a trvající `span` bloků zabírá.
 * Pokud přednáška přesahuje poslední blok, vrátí méně než `span` ID.
 */
export const getCoveredBlockIds = (blocks: SpanBlock[], startBlockId: number, span: number): number[] => {
    const sorted = [...blocks].sort((a, b) => a.from.getTime() - b.from.getTime());
    const index = sorted.findIndex((b) => b.id === startBlockId);

    if (index === -1) return [];

    return sorted.slice(index, index + span).map((b) => b.id);
};
