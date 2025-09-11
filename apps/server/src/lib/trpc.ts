import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import { auth } from "./auth";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }

  try {
    const validSession = await auth.api.getSession({
      headers: ctx.headers,
    });

    if (!validSession) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Session is no longer valid",
        cause: "Session revoked or expired",
      });
    }
  } catch (error) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Session validation failed",
      cause: error,
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});
