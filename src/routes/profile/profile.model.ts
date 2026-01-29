import { UserSchema } from "@/shared/models/shared-user.model";
import z from "zod";

export const UpdateProfileBodySchema = UserSchema.pick({
  name: true,
  phoneNumber: true,
  avatar: true,
}).strict();

export const ChangePasswordBodySchema = UserSchema.pick({
  password: true,
}).extend({
  newPassword: z.string().min(6).max(100),
  confirmNewPassword: z.string().min(6).max(100),
}).strict().superRefine((data, ctx) => {
  if (data.newPassword !== data.confirmNewPassword) {
    ctx.addIssue({
      code: 'custom',
      message: 'Error.PasswordNotMatch', // Passwords do not match
      path: ['confirmNewPassword'],
    });
  }
});
