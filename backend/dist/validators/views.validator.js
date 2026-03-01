"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateViewSchema = exports.createViewSchema = void 0;
const zod_1 = require("zod");
const filtersSchema = zod_1.z.object({
    state: zod_1.z.enum(["open", "closed", "all"]).optional(),
    priority: zod_1.z.array(zod_1.z.enum(["P0", "P1", "P2", "P3"])).optional(),
    labels: zod_1.z.array(zod_1.z.string()).optional(),
    assignee: zod_1.z.string().optional(),
    repository: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    milestone: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    createdAfter: zod_1.z.string().optional(),
    createdBefore: zod_1.z.string().optional(),
    sort: zod_1.z.enum(["created", "updated", "priority"]).optional(),
    order: zod_1.z.enum(["asc", "desc"]).optional(),
});
exports.createViewSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(100, "Name cannot exceed 100 characters"),
    filters: filtersSchema,
    isDefault: zod_1.z.boolean().optional().default(false),
});
exports.updateViewSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(100, "Name cannot exceed 100 characters")
        .optional(),
    filters: filtersSchema.optional(),
    isDefault: zod_1.z.boolean().optional(),
});
