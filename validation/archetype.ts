import { withId } from "./universal";
import { z } from "zod";

export const addArchetypeSchema = z.object({
	name: z
		.string()
		.min(1, {
			message: "Název přednášky je povinný",
		})
		.max(255, {
			message: "Název přednášky může mít maximálně 255 znaků",
		}),
	description: z
		.string()
		.min(1, {
			message: "Popis přednášky je povinný",
		})
		.max(511, {
			message: "Popis přednášky může mít maximálně 511 znaků",
		}),
	detailedDescription: z
		.string()
		.max(2047, {
			message: "Detailní popis přednášky může mít maximálně 2047 znaků",
		})
		.trim()
		.nullable()
		.transform((v) => (v && v.length > 0 ? v : null)),
});

export type addArchetypeSchema = z.infer<typeof addArchetypeSchema>;

export const editArchetypeSchema = addArchetypeSchema.merge(withId);

export type editArchetypeSchema = z.infer<typeof editArchetypeSchema>;
