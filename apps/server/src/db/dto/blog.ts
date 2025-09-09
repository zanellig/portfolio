import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";
import { postFormat, posts, postStatus } from "../schema/blog";

export const insertPostSchema = createInsertSchema(posts, {
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(128),
  excerpt: z.string().max(255).optional(),
  body: z.string().min(1),
  status: z.enum(postStatus._.enumValues).optional(),
  format: z.enum(postFormat._.enumValues).optional(),
  isFeatured: z.boolean().optional(),
});

export const selectPostSchema = createSelectSchema(posts);
export type InsertPost = z.infer<typeof insertPostSchema>;
export type SelectPost = z.infer<typeof selectPostSchema>;
