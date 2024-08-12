import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const linkRequests = pgTable("link_request", {
  token: text("token").primaryKey(),
  user_id: text("user_id").unique().notNull(),
  expires: timestamp("expires").notNull(),
});

export const accounts = pgTable("account", {
  user_id: varchar("user_id").primaryKey(),
  username: varchar("username").notNull(),
  access_token: varchar("access_token").notNull(),
  refresh_token: varchar("refresh_token").notNull(),
  session_token: varchar("session_token"),
  expires: timestamp("expires").notNull(),
  last_updated: timestamp("last_updated").notNull().defaultNow(),
});
