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
  status: mysqlEnum("status", [
    "ready",
    "pending",
    "processing",
    "failed",
    "deleted",
  ]).default("pending"),
  type: mysqlEnum("type", [
    "thumbnail",
    "small",
    "medium",
    "large",
    "webp",
    "avif",
    "custom",
  ]),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }),
  mimeType: varchar("mime_type", { length: 120 }).notNull(),
  sizeBytes: int("size_bytes", { unsigned: true }).notNull(),
  sha256: varchar("sha256", { length: 64 }).notNull().unique(),
  objectKey: varchar("object_key", { length: 512 }).notNull().unique(),
  width: int("width", { unsigned: true }),
  height: int("height", { unsigned: true }),
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

  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt"),

  slug: varchar("slug", { length: 140 }).notNull().unique(),
  body: text("body").notNull(),

  isCommentable: boolean("is_commentable").default(true),
  isFeatured: boolean("is_featured").default(false),

  viewCount: int("view_count", { unsigned: true }).default(0),
  likeCount: int("like_count", { unsigned: true }).default(0),
  commentCount: int("comment_count", { unsigned: true }).default(0),

  meta: json("meta").$type<{
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
  status: mysqlEnum("status", ["published", "draft", "spam", "trash", "deleted"]).default(
    "deleted"
  ),

  content: text("content").notNull(),

  likeCount: int("like_count").default(0),
  dislikeCount: int("dislike_count").default(0),

  authorName: varchar("author_name", { length: 100 }),
  authorEmail: varchar("author_email", { length: 255 }),
  authorWebsite: varchar("author_website", { length: 500 }),

  userAgent: varchar("user_agent", { length: 500 }),
  authorIp: varchar("author_ip", { length: 45 }), // IPv6 support

  ...defaultTimestamps,
});
