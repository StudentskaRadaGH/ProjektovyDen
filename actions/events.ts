"use server";

import { Event, User } from "@/lib/types";
import { UnauthorizedError, UserError, inlineCatch } from "@/lib/utils";
import {
    and,
    archetypes,
    asc,
    blockArchetypeLookup,
    blocks as blocksTable,
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
import { getCoveredBlockIds } from "@/lib/eventSpan";
import { recalculateBlockArchetypeLookup } from "./lookup";
import { revalidatePath } from "next/cache";

export type EditEventDetails = Omit<Event, "archetype">;

/**
 * Zkontroluje, že přednáška (i dvojblok) může být v daných blocích a místě.
 * Vrací text chyby, nebo null, pokud je vše v pořádku.
 */
const checkEventSlot = async (slot: {
    eventId: number | null;
    archetype: number;
    block: number;
    place: number;
    span: number;
}): Promise<string | null> => {
    const allBlocks = await db.query.blocks.findMany({
        columns: { id: true, from: true },
        orderBy: asc(blocksTable.from),
    });

    const covered = getCoveredBlockIds(allBlocks, slot.block, slot.span);

    if (covered.length < slot.span)
        return "Přednáška by přesahovala poslední existující blok";

    const others = (
        await db.query.events.findMany({
            columns: { id: true, block: true, span: true, place: true, archetype: true },
        })
    ).filter((e) => e.id !== slot.eventId);

    for (const other of others) {
        const otherCovered = getCoveredBlockIds(allBlocks, other.block, other.span);

        if (!otherCovered.some((id) => covered.includes(id))) continue;

        if (other.place === slot.place)
            return "Zvolené místo je v některém z bloků přednášky již obsazené";

        if (
            other.archetype === slot.archetype &&
            !(other.block === slot.block && other.span === slot.span)
        )
            return "Přednášky stejného typu se nemohou časově překrývat, pokud nezačínají ve stejném bloku a nemají stejnou délku";
    }

    return null;
};

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
    });

    if (!place) return UserError("Neplatné ID místa");

    // Místo, blok(y) a překryv s ostatními přednáškami
    const slotError = await checkEventSlot({
        eventId: null,
        archetype: data.archetype,
        block: data.block,
        place: data.place,
        span: data.span,
    });

    if (slotError) return UserError(slotError);

    const inserted_id = (
        await db
            .insert(events)
            .values({
                archetype: data.archetype,
                block: data.block,
                place: data.place,
                capacity: data.capacity,
                span: data.span,
            })
            .returning({ insertedId: events.id })
    )[0].insertedId;

    if (!inserted_id) return UserError("Nepodařilo se vytvořit přednášku");

    await db
        .update(blockArchetypeLookup)
        .set({
            capacity: sql`${blockArchetypeLookup.capacity} + ${data.capacity}`,
            freeSpace: sql`${blockArchetypeLookup.freeSpace} + ${data.capacity}`,
            span: data.span,
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
        });

        if (!place) return UserError("Neplatné ID místa");
    }

    // Místo, blok(y) a překryv s ostatními přednáškami
    if (
        event.place !== data.place ||
        event.block !== data.block ||
        event.span !== data.span
    ) {
        const slotError = await checkEventSlot({
            eventId: event.id,
            archetype: event.archetype,
            block: data.block,
            place: data.place,
            span: data.span,
        });

        if (slotError) return UserError(slotError);
    }

    await db
        .update(events)
        .set({
            block: data.block,
            place: data.place,
            capacity: data.capacity,
            span: data.span,
        })
        .where(eq(events.id, data.id));

    if (
        data.capacity !== event.capacity ||
        data.block !== event.block ||
        data.span !== event.span
    )
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
            span: true,
        },
        with: {
            block: true,
            place: true,
        },
    });
};
