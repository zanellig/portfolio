import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";
import { posts } from "../schema/blog";

const _insertPostSchema = createInsertSchema(posts, {
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(128),
  excerpt: z.string().max(255).optional(),
  body: z.string().min(1),
  isFeatured: z.boolean().optional(),
  isCommentable: z.boolean().optional(),
});
export const selectPostSchema = createSelectSchema(posts);

export const insertPostSchema = _insertPostSchema.pick({
  title: true,
  body: true,
  coverImageId: true,
  excerpt: true,
  format: true,
  isCommentable: true,
  isFeatured: true,
  meta: true,
  slug: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type SelectPost = z.infer<typeof selectPostSchema>;
