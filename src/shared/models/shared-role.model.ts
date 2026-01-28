import z from "zod";

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  description: z.string().default(''),
  // isActive example:
  // truthy: "true", "1", 1, true
  // falsy: "false", "0", 0, false, "", null, undefined
  isActive: z.coerce.boolean().default(true), // coerce: convert string to boolean
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});
