import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { user } from "@/db/schema/auth";
import { z } from "zod";

export const selectUserSchema = createSelectSchema(user);

export const insertUserSchema = createInsertSchema(user, {
  email: z.email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
  role: z.enum(["user", "admin"]).default("user"),
});

export const updateUserSchema = insertUserSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    id: z.uuid("Invalid user ID"),
  });

export const adminCreateUserSchema = insertUserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  emailVerified: true,
});

export const userListQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  role: z.enum(["user", "admin"]).optional(),
  search: z.string().optional(),
});

export const toggleUserStatusSchema = z.object({
  userId: z.uuid("Invalid user ID"),
  active: z.boolean(),
});

export type SelectUser = z.infer<typeof selectUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type AdminCreateUser = z.infer<typeof adminCreateUserSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;
export type ToggleUserStatus = z.infer<typeof toggleUserStatusSchema>;
