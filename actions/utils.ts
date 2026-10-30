"use server";

import { Archetype, Block, Event, Place } from "@/lib/types";
import { claims as Claims, blocks as Blocks, users as Users, asc, attendance, db, eq } from "@/db";
import { UnauthorizedError, createMapById } from "@/lib/utils";
import { session, validateUser } from "@/auth/session";

import { recalculateAll } from "./lookup";

export const generateAttendances = async () => {
    const user = await session();

    if (!validateUser(user, { isAdmin: true })) return UnauthorizedError();

    await db.delete(attendance);

    await recalculateAll();

    const attendees = await db.query.users.findMany({
        where: eq(Users.isAttending, true),
        with: {
            claims: {
                where: eq(Claims.secondary, false),
            },
        },
    });

    const blocks = await db.query.blocks.findMany({
        orderBy: asc(Blocks.from),
        with: {
            events: true,
        },
    });

    // Uživatel, který je kvůli delší přednášce (dvojbloku) obsazený až do bloku s tímto indexem (bez něj)
    const busyUntil = new Map<number, number>();

    for await (const [blockIndex, block] of blocks.entries()) {
        const eventsByArchetype = new Map<
            Archetype["id"],
            (Pick<Event, "id" | "capacity" | "attending" | "span"> & {
                archetype: Archetype["id"];
                block: Block["id"];
                place: Place["id"];
            })[]
        >();

        const eventPercentage = new Map<Event["id"], number>();
        const eventPercentPointPerUser = new Map<Event["id"], number>();
        const eventSpan = new Map<Event["id"], number>();

        const attendances: {
            user: number;
            event: number;
        }[] = [];

        block.events.forEach((event) => {
            if (!eventsByArchetype.has(event.archetype))
                eventsByArchetype.set(event.archetype, [] as any);

            eventsByArchetype.get(event.archetype)!.push({
                id: event.id,
                capacity: event.capacity,
                attending: 0,
                span: event.span,
                archetype: event.archetype,
                block: event.block,
                place: event.place,
            });

            eventPercentage.set(event.id, 0);
            eventPercentPointPerUser.set(event.id, 1 / event.capacity);
            eventSpan.set(event.id, event.span);
        });

        const markBusy = (userId: number, eventId: number) => {
            const span = eventSpan.get(eventId) ?? 1;

            if (span > 1) busyUntil.set(userId, blockIndex + span);
        };

        const usersWithoutClaim: typeof attendees = [];

        attendees.forEach((user) => {
            // Uživatel je stále na delší přednášce z předchozího bloku
            if ((busyUntil.get(user.id) ?? 0) > blockIndex) return;

            const claim = user.claims.find((claim) => claim.block === block.id);

            if (!claim) {
                usersWithoutClaim.push(user);
                return;
            }

            const events = eventsByArchetype.get(claim.archetype)!;

            // Implement round-robin
            const chosenEvent = events[0];

            attendances.push({
                user: claim.user,
                event: chosenEvent.id,
            });

            markBusy(claim.user, chosenEvent.id);

            eventPercentage.set(
                chosenEvent.id,
                eventPercentage.get(chosenEvent.id)! +
                    eventPercentPointPerUser.get(chosenEvent.id)!,
            );
        });

        usersWithoutClaim.forEach((user) => {
            // Delší přednáška nesmí zasáhnout do bloku, kde má uživatel vlastní volbu (nebo za poslední blok)
            const compatibleEvents = Array.from(eventPercentage).filter(([id]) => {
                for (let offset = 1; offset < (eventSpan.get(id) ?? 1); offset++) {
                    const nextBlock = blocks[blockIndex + offset];

                    if (!nextBlock || user.claims.some((c) => c.block === nextBlock.id))
                        return false;
                }

                return true;
            });

            const eventWithLowestPercentage = (
                compatibleEvents.length > 0
                    ? compatibleEvents
                    : Array.from(eventPercentage)
            ).reduce(
                (acc, [id, percentage]) =>
                    percentage < acc.percentage ? { id, percentage } : acc,
                { id: -1, percentage: 1000 },
            );

            attendances.push({
                user: user.id,
                event: eventWithLowestPercentage.id,
            });

            markBusy(user.id, eventWithLowestPercentage.id);

            eventPercentage.set(
                eventWithLowestPercentage.id,
                eventWithLowestPercentage.percentage +
                    eventPercentPointPerUser.get(eventWithLowestPercentage.id)!,
            );
        });

        if (attendances.length > 0)
            await db.insert(attendance).values(attendances);
    }

    await recalculateAll();
};

export const deleteAttendances = async () => {
    const user = await session();

    if (!validateUser(user, { isAdmin: true })) return UnauthorizedError();

    await db.delete(attendance);

    await recalculateAll();
};
