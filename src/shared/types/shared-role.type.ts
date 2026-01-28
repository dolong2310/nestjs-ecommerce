import { RoleSchema } from "@/shared/models/shared-role.model";
import z from "zod";

export type RoleType = z.infer<typeof RoleSchema>;
