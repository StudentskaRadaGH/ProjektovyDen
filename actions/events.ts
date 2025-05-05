"use server";

import { Event, User } from "@/lib/types";
import { UnauthorizedError, UserError, inlineCatch } from "@/lib/utils";
import {
    and,
    archetypes,
    blockArchetypeLookup,
    db,
    eq,
    events,
    inArray,
    places,
    sql,
    users,
} from "@/db";
import { createNewEventSchema, editEventSchema } from "@/validation/events";
import { session, validateUser } from "@/auth/session";

import { UserErrorType } from "@/lib/utilityTypes";
import { recalculateBlockArchetypeLookup } from "./lookup";
import { revalidatePath } from "next/cache";

export type EditEventDetails = Omit<Event, "archetype">;

export const createNewEvent = async (unsafe: createNewEventSchema) => {
    const user = await session();

    if (!validateUser(user, { isAdmin: true })) return UnauthorizedError();

    const [data, error] = inlineCatch(() => createNewEventSchema.parse(unsafe));

    if (error) return UserError(error);

    // Archetype
    const archetype = await db.query.archetypes.findFirst({
        where: eq(archetypes.id, data.archetype),
    });

    if (!archetype) return UserError("Neplatné ID přednášky");

    // Block
    const block = await db.query.blocks.findFirst({
        where: eq(archetypes.id, data.block),
    });

    if (!block) return UserError("Neplatné ID bloku");

    // Place
    const place = await db.query.places.findFirst({
        where: eq(places.id, data.place),
        with: {
            events: {
                columns: {
                    id: true,
                },
                where: eq(events.block, data.block),
                limit: 1,
            },
        },
    });

    if (!place || place.events.length > 0)
        return UserError("Neplatné ID místa");

    const inserted_id = (
        await db
            .insert(events)
            .values({
                archetype: data.archetype,
                block: data.block,
                place: data.place,
                capacity: data.capacity,
            })
            .returning({ insertedId: events.id })
    )[0].insertedId;

    if (!inserted_id) return UserError("Nepodařilo se vytvořit přednášku");

    await db
        .update(blockArchetypeLookup)
        .set({
            capacity: sql`${blockArchetypeLookup.capacity} + ${data.capacity}`,
            freeSpace: sql`${blockArchetypeLookup.freeSpace} + ${data.capacity}`,
        })
        .where(
            and(
                eq(blockArchetypeLookup.block, data.block),
                eq(blockArchetypeLookup.archetype, data.archetype),
            ),
        );

    revalidatePath("/admin/archetypes");
};

export const editEvent = async (unsafe: editEventSchema) => {
    const user = await session();

    if (!validateUser(user, { isAdmin: true })) return UnauthorizedError();

    const [data, error] = inlineCatch(() => editEventSchema.parse(unsafe));

    if (error) return UserError(error);

    // Event
    const event = await db.query.events.findFirst({
        where: eq(events.id, data.id),
    });

    if (!event) return UserError("Neplatné ID přednášky");

    // Block
    if (event.block !== data.block) {
        const block = await db.query.blocks.findFirst({
            where: eq(archetypes.id, data.block),
        });

        if (!block) return UserError("Neplatné ID bloku");
    }

    // Place
    if (event.place !== data.place) {
        const place = await db.query.places.findFirst({
            where: eq(places.id, data.place),
            with: {
                events: {
                    columns: {
                        id: true,
                    },
                    where: eq(events.block, data.block),
                    limit: 1,
                },
            },
        });

        if (!place || place.events.length > 0)
            return UserError("Neplatné ID místa");
    }

    await db
        .update(events)
        .set({
            block: data.block,
            place: data.place,
            capacity: data.capacity,
        })
        .where(eq(events.id, data.id));

    if (data.capacity !== event.capacity || data.block !== event.block)
        await recalculateBlockArchetypeLookup();

    revalidatePath("/admin/archetypes");
};

export const deleteEvent = async (eventId: number) => {
    const user = await session();

    if (!validateUser(user, { isAdmin: true })) return UnauthorizedError();

    const event = await db.query.events.findFirst({
        where: eq(events.id, eventId),
    });

    if (!event) return UserError("Neplatné ID přednášky");

    if (event.attending > 0)
        return UserError(
            "Nelze smazat přednášku, na kterou je již někdo nahlášen",
        );

    await db.delete(events).where(eq(events.id, eventId));

    await db
        .update(blockArchetypeLookup)
        .set({
            capacity: sql`${blockArchetypeLookup.capacity} - ${event.capacity}`,
            freeSpace: sql`${blockArchetypeLookup.freeSpace} - ${event.capacity}`,
        })
        .where(
            and(
                eq(blockArchetypeLookup.block, event.block),
                eq(blockArchetypeLookup.archetype, event.archetype),
            ),
        );

    revalidatePath("/admin/archetypes");
};

export const getArchetypeEvents = async (
    archetypeId: number,
): Promise<UserErrorType | EditEventDetails[]> => {
    const user = await session();

    if (!validateUser(user, { isAdmin: true })) return UnauthorizedError();

    return await db.query.events.findMany({
        where: eq(events.archetype, archetypeId),
        columns: {
            id: true,
            capacity: true,
            attending: true,
        },
        with: {
            block: true,
            place: true,
        },
    });
};
