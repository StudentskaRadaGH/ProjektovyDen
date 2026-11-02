import { printDate, printDateTime, printTime } from "@/lib/utils";

import { z } from "zod";

export const addBlockSchema = z
	.object({
		from: z.date({
			message: "Zadejte platné datum",
		}),
		to: z.date({
			message: "Zadejte platné datum",
		}),
	})
	.refine((data) => data.from < data.to, {
		message: "Začátek bloku musí být dříve než jeho konec",
		path: ["to"],
	});

export type addBlockSchema = z.infer<typeof addBlockSchema>;

export const editBlockSchema = z
	.object({
		id: z.number({
			message: "Zadejte platné číslo",
		}),
		from: z.date({
			message: "Zadejte platné datum",
		}),
		to: z.date({
			message: "Zadejte platné datum",
		}),
	})
	.refine((data) => data.from < data.to, {
		message: "Začátek bloku musí být dříve než jeho konec",
		path: ["to"],
	});

export type editBlockSchema = z.infer<typeof editBlockSchema>;

export const getBlockName = (block: { from: Date; to: Date }) => {
	if (block.from.getDate() === block.to.getDate()) return `${printDate(block.from)}, ${printTime(block.from)} - ${printTime(block.to)}`;

	return `${printDateTime(block.from)} - ${printDateTime(block.to)}`;
};

/**
 * Vrátí blok, jehož konec odpovídá poslednímu bloku, který přednáška
 * se zadaným `span` zabírá (pro běžné přednášky vrací původní blok).
 */
export const getEventBlock = <T extends { id: number; from: Date; to: Date }>(
	block: T,
	span: number,
	allBlocks: { id: number; from: Date; to: Date }[]
): T => {
	if (span <= 1) return block;

	const sorted = [...allBlocks].sort((a, b) => a.from.getTime() - b.from.getTime());
	const index = sorted.findIndex((b) => b.id === block.id);

	if (index === -1) return block;

	const last = sorted[Math.min(index + span - 1, sorted.length - 1)];

	return { ...block, to: last.to };
};
