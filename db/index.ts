import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import postgres from "postgres";

const pg = postgres(process.env.DATABASE_URL!);

export const db: PostgresJsDatabase<typeof schema> = drizzle(pg, { schema });
