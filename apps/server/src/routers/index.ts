import { posts } from "@/db/schema/blog";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { db } from "@/db";
import z from "zod";
import { desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { insertPostSchema, selectPostSchema } from "@/db/dto/blog";

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
    try {
      const postsRes = await db
        .select()
        .from(posts)
        .orderBy(desc(posts.createdAt));

      return z.array(selectPostSchema).parse(postsRes);
    } catch (e) {
      console.error(e);
      return [];
    }
  }),

  postById: publicProcedure.input(z.uuid()).query(async (opts) => {
    return await db.select().from(posts).where(eq(posts.id, opts.input));
  }),

  uploadImage: protectedProcedure
    .input(z.instanceof(FormData))
    .mutation(async (opts) => {
      const file = opts.input.get("file");
      if (file === null || !file || file === "null")
        throw new TRPCError({
          message: "A file must be included",
          code: "BAD_REQUEST",
        });
      return z.uuid().parse("1ee6dc69-b577-4872-aed6-a88b4778e706");
    }),

  postCreate: protectedProcedure
    .input(insertPostSchema)
    .mutation(async (opts) => {
      const post = opts.input;
      try {
        const postRes = await db.insert(posts).values(post).$returningId();
        return postRes;
      } catch (e: any) {
        console.error(e);
        throw new TRPCError({
          message: e.cause,
          code: "INTERNAL_SERVER_ERROR",
        });
      }
    }),
});
export type AppRouter = typeof appRouter;
