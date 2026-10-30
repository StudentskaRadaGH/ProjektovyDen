"use server";

import {
    UnauthorizedError,
    UserError,
    inlineCatch,
    pluralHelper,
} from "@/lib/utils";
import { addPlaceSchema, editPlaceSchema } from "@/validation/place";
import { blocks, count, db, eq, events, getTableColumns, places } from "@/db";
import { session, validateUser } from "@/auth/session";

import { Place } from "@/lib/types";
import { UserErrorType } from "@/lib/utilityTypes";
import { getCoveredBlockIds } from "@/lib/eventSpan";
import { revalidatePath } from "next/cache";

export const addPlace = async (unsafe: addPlaceSchema) => {
    const user = await session();

    if (!validateUser(user, { isAdmin: true })) return UnauthorizedError();

    const [place, error] = inlineCatch(() => addPlaceSchema.parse(unsafe));

    if (error) return UserError(error);

    await db.insert(places).values(place);

    revalidatePath("/admin/places");
};

export const editPlace = async (unsafe: editPlaceSchema) => {
    const user = await session();

    if (!validateUser(user, { isAdmin: true })) return UnauthorizedError();

    const [place, error] = inlineCatch(() => editPlaceSchema.parse(unsafe));

    if (error) return UserError(error);

    const exists = await db.query.places.findFirst({
        where: eq(places.id, place.id),
    });

    if (!exists) return UserError("Místo neexistuje");

    await db
        .update(places)
        .set({
            name: place.name,
        })
        .where(eq(places.id, place.id));

    revalidatePath("/admin/places");
};

export const deletePlace = async (id: number) => {
    const user = await session();

    if (!validateUser(user, { isAdmin: true })) return UnauthorizedError();

    const exists = (
        await db
            .select({
                id: places.id,
                events: count(events.id),
            })
            .from(places)
            .leftJoin(events, eq(places.id, events.place))
            .where(eq(places.id, id))
            .groupBy(places.id)
            .limit(1)
    )[0];

    if (!exists) return UserError("Místo neexistuje");

    if (exists.events > 0)
        return UserError(
            `Místo nelze odstranit, protože se zde ${pluralHelper(exists.events, "koná", "konají")} ${exists.events} ${pluralHelper(exists.events, "událost", "události", "událostí")}`,
        );

    await db.delete(places).where(eq(places.id, id));

    revalidatePath("/admin/places");
};

export const getPossiblePlacesForEvent = async (
    blockId: number,
    eventId: number | null = null,
    span: number = 1,
): Promise<UserErrorType | Place[]> => {
    const user = await session();

    if (!validateUser(user, { isAdmin: true })) return UnauthorizedError();

    const block = await db.query.blocks.findFirst({
        where: eq(blocks.id, blockId),
    });

    if (!block) return UserError("Neplatné ID bloku");

    const allBlocks = await db.query.blocks.findMany({
        columns: { id: true, from: true },
    });

    const covered = getCoveredBlockIds(allBlocks, blockId, Math.max(1, span));

    return (
        await db.query.places.findMany({
            with: {
                events: {
                    columns: {
                        id: true,
                        block: true,
                        span: true,
                    },
                },
            },
        })
    ).filter((place) =>
        place.events.every(
            (e) =>
                e.id === eventId ||
                !getCoveredBlockIds(allBlocks, e.block, e.span).some((id) =>
                    covered.includes(id),
                ),
        ),
    );
};
