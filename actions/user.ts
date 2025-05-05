"use server";

import { UnauthorizedError, UserError, inlineCatch } from "@/lib/utils";
import { db, eq, users } from "@/db";
import { session, validateUser } from "@/auth/session";

import { editUserSchema } from "@/validation/user";
import { revalidatePath } from "next/cache";

export const editUser = async (unsafe: editUserSchema) => {
    const user = await session();

    if (!validateUser(user, { isAdmin: true })) return UnauthorizedError();

    const [date, error] = inlineCatch(() => editUserSchema.parse(unsafe));

    if (error) return UserError(error);

    const exists = await db.query.users.findFirst({
        where: eq(users.id, date.id),
    });

    if (!exists) return UserError("Neplatné ID uživatele");

    const userClass = date.class === "none" ? null : date.class;

    await db
        .update(users)
        .set({
            name: date.name,
            email: date.email,
            class: userClass,
            isAttending: date.isAttending,
            isTeacher: date.isTeacher,
            isAdmin: date.isAdmin,
        })
        .where(eq(users.id, date.id));

    revalidatePath("/admin/users");
};
