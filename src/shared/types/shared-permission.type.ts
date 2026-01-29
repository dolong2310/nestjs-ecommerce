import { PermissionSchema } from "@/shared/models/shared-permission.model";
import z from "zod";

export type PermissionType = z.infer<typeof PermissionSchema>;
