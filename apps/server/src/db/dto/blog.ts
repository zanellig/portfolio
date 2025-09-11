import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import { posts } from "@/db/schema/blog";

const _postsRefinement = {
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(128),
  excerpt: z.string().max(255).optional(),
  body: z.string().min(1),
  isFeatured: z.boolean().optional(),
  isCommentable: z.boolean().optional(),
};

export const selectPostSchema = createSelectSchema(posts);

const _insertPostSchema = createInsertSchema(posts, _postsRefinement);
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

const _updatePostSchema = createUpdateSchema(posts, _postsRefinement);
export const updatePostSchema = _updatePostSchema.pick({
  body: true,
  coverImageId: true,
  excerpt: true,
  isCommentable: true,
  isFeatured: true,
  status: true,
  title: true,
});

export type SelectPost = z.infer<typeof selectPostSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;
