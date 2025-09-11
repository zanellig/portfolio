import { defaultTimestamps, id } from "@/lib/db-constants";
import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  varchar,
} from "drizzle-orm/mysql-core";
import { v4 } from "uuid";

export const images = mysqlTable("images", {
  id: id("id").primaryKey().$defaultFn(v4),
  status: mysqlEnum([
    "ready",
    "pending",
    "processing",
    "failed",
    "deleted",
  ]).default("pending"),
  type: mysqlEnum([
    "thumbnail",
    "small",
    "medium",
    "large",
    "webp",
    "avif",
    "custom",
  ]),
  fileName: varchar({ length: 255 }).notNull(),
  originalName: varchar({ length: 255 }),
  mimeType: varchar({ length: 120 }).notNull(),
  sizeBytes: int({ unsigned: true }).notNull(),
  sha256: varchar({ length: 64 }).notNull().unique(),
  objectKey: varchar({ length: 512 }).notNull().unique(),
  width: int({ unsigned: true }),
  height: int({ unsigned: true }),
  // SEO
  alt: text("alt"),
  title: varchar("title", { length: 255 }),
  caption: text("caption"),

  ...defaultTimestamps,
});

export const postStatus = mysqlEnum("post_status", [
  "draft",
  "published",
  "archived",
]);
export const postFormat = mysqlEnum("post_format", ["markdown", "html"]);

export const posts = mysqlTable("posts", {
  id: id("id").primaryKey().$defaultFn(v4),

  thumbnailId: id("thumbnail_id").references(() => images.id),
  coverImageId: id("cover_image_id").references(() => images.id),

  status: postStatus.default("draft").notNull(),
  format: postFormat.default("markdown").notNull(),

  title: varchar({ length: 255 }).notNull(),
  excerpt: text(),

  slug: varchar({ length: 140 }).notNull().unique(),
  body: text().notNull(),

  isCommentable: boolean("is_commentable").default(true),
  isFeatured: boolean("is_featured").default(false),

  viewCount: int("view_count", { unsigned: true }).default(0),
  likeCount: int("like_count", { unsigned: true }).default(0),
  commentCount: int("comment_count", { unsigned: true }).default(0),

  meta: json().$type<{
    canonical?: string;
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
  }>(),

  ...defaultTimestamps,
});

export const comments = mysqlTable("comments", {
  id: id("id").primaryKey().$defaultFn(v4),
  postId: id("post_id").references(() => posts.id),
  status: mysqlEnum(["published", "draft", "spam", "trash", "deleted"]).default(
    "deleted"
  ),

  content: text().notNull(),

  likeCount: int().default(0),
  dislikeCount: int().default(0),

  authorName: varchar({ length: 100 }),
  authorEmail: varchar({ length: 255 }),
  authorWebsite: varchar({ length: 500 }),

  userAgent: varchar({ length: 500 }),
  authorIp: varchar({ length: 45 }), // IPv6 support

  ...defaultTimestamps,
});
