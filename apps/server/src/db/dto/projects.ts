import { projects } from "@/db/schema/projects";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";

const _insertProjectSchema = createInsertSchema(projects, {
  repositoryUrl: z.url(),
  url: z.url(),
  technologies: z.array(z.string()),
});

export const insertProjectSchema = _insertProjectSchema.pick({
  category: true,
  coverImageId: true,
  description: true,
  excerpt: true,
  featured: true,
  order: true,
  status: true,
  technologies: true,
  title: true,
  url: true,
  repositoryUrl: true,
});

export const selectProjectSchema = createSelectSchema(projects);

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type SelectProject = z.infer<typeof selectProjectSchema>;
