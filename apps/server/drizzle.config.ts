import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  dialect: "mysql",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
});
