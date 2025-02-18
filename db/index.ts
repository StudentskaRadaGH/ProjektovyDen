import * as schema from "./schema";

import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "@/env";

export const db = drizzle(env.DATABASE_URL, {
	schema,
});

export * from "drizzle-orm";

export * from "./schema";
