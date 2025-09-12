import { defaultTimestamps, id } from "@/lib/db-constants";
import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { v4 } from "uuid";
import { images } from "@/db/schema/blog";

export const projects = mysqlTable("projects", {
  id: id("id").primaryKey().$defaultFn(v4),
  title: varchar({ length: 255 }).notNull(),
  excerpt: text(),
  description: text().notNull(),

  coverImageId: id("cover_image_id").references(() => images.id),
  thumbnailId: id("thumbnail_id").references(() => images.id),

  status: mysqlEnum(["published", "hidden"]).default("hidden").notNull(),

  url: text(),
  repositoryUrl: text("repository_url"),
  technologies: json(),
  category: varchar({ length: 64 }),
  featured: boolean().default(false),
  order: int({ unsigned: true }),

  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  ...defaultTimestamps,
});
