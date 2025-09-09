import { timestamp } from "drizzle-orm/mysql-core";

export const defaultTimestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
  deletedAt: timestamp("deleted_at"),
};
