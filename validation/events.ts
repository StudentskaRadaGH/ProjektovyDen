import { withId } from "./universal";
import { z } from "zod";

export const createNewEventSchema = z.object({
    archetype: z.number({
        message: "Nebyl zvolen typ přednášky",
    }),
    block: z.number({
        message: "Nebyl zvolen blok přednášky",
    }),
    place: z.number({
        message: "Nebylo zvoleno místo přednášky",
    }),
    capacity: z.number().min(1, {
        message: "Kapacita přednášky musí být větší než 0",
    }),
    span: z
        .number({ message: "Délka přednášky musí být číslo" })
        .int({ message: "Délka přednášky musí být celé číslo" })
        .min(1, { message: "Přednáška musí trvat alespoň 1 blok" }),
});

export type createNewEventSchema = z.infer<typeof createNewEventSchema>;

export const editEventSchema = z
    .object({
        block: z.number({
            message: "Nebyl zvolen blok přednášky",
        }),
        place: z.number({
            message: "Nebylo zvoleno místo přednášky",
        }),
        capacity: z.number().min(1, {
            message: "Kapacita přednášky musí být větší než 0",
        }),
        span: z
            .number({ message: "Délka přednášky musí být číslo" })
            .int({ message: "Délka přednášky musí být celé číslo" })
            .min(1, { message: "Přednáška musí trvat alespoň 1 blok" }),
    })
    .merge(withId);

export type editEventSchema = z.infer<typeof editEventSchema>;
