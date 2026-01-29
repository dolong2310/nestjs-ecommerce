import { GetUserProfileResponseSchema, UpdateUserProfileResponseSchema, UserSchema } from "@/shared/models/shared-user.model";
import z from "zod";

export type UserType = z.infer<typeof UserSchema>;
export type GetUserProfileResponseType = z.infer<typeof GetUserProfileResponseSchema>;
export type UpdateProfileResponseType = z.infer<typeof UpdateUserProfileResponseSchema>;
