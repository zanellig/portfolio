import { posts } from "@/db/schema/blog";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { db } from "@/db";
import z from "zod";
import { desc, eq } from "drizzle-orm";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  posts: publicProcedure.query(async () => {
    const postsRes = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt));
    if (!postsRes) return [];
    return postsRes;
  }),
  postById: publicProcedure.input(z.uuid()).query(async (opts) => {
    return await db.select().from(posts).where(eq(posts.id, opts.input));
  }),
  postCreate: protectedProcedure
    .input(z.object({ title: z.string().max(255) }))
    .mutation(async (opts) => {
      const { title } = opts.input;
      const post = await db.insert(posts).values({ title }).$returningId();
      return post;
    }),
});
export type AppRouter = typeof appRouter;
