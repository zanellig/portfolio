import { betterAuth } from "better-auth";
import { admin, jwt } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { z } from "zod";
import { db } from "../db";
import * as schema from "../db/schema/auth";
import { v4 } from "uuid";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: schema,
  }),
  plugins: [jwt(), admin()],
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    disableSignUp: false,
    enabled: true,
  },
  rateLimit: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
    cookiePrefix: "pf",
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return { data: { ...user, id: v4() } };
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          return { data: { ...session, id: v4() } };
        },
      },
    },
    account: {
      create: {
        before: async (account) => {
          return { data: { ...account, id: v4() } };
        },
      },
    },
  },
});
