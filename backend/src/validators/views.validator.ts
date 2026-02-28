import { z } from "zod";

const filtersSchema = z.object({
  state: z.enum(["open", "closed", "all"]).optional(),
  priority: z.array(z.enum(["P0", "P1", "P2", "P3"])).optional(),
  labels: z.array(z.string()).optional(),
  assignee: z.string().optional(),
  repository: z.string().optional(),
  category: z.string().optional(),
  milestone: z.string().optional(),
  search: z.string().optional(),
  createdAfter: z.string().optional(),
  createdBefore: z.string().optional(),
  sort: z.enum(["created", "updated", "priority"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const createViewSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),
  filters: filtersSchema,
  isDefault: z.boolean().optional().default(false),
});

export const updateViewSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  filters: filtersSchema.optional(),
  isDefault: z.boolean().optional(),
});

export type CreateViewInput = z.infer<typeof createViewSchema>;
export type UpdateViewInput = z.infer<typeof updateViewSchema>;
export type FiltersInput = z.infer<typeof filtersSchema>;