"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export const RefreshCurrentPath = async () => {
	revalidatePath(new URL((await headers()).get("referer") || "").pathname);
};
