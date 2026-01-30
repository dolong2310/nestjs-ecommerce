import { ChangePasswordBodySchema, UpdateProfileBodySchema } from '@/routes/profile/profile.model';
import { UserSchema } from '@/shared/models/shared-user.model';
import z from 'zod';

export type ProfileType = z.infer<typeof UserSchema>;
export type UpdateProfileBodyType = z.infer<typeof UpdateProfileBodySchema>;
export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBodySchema>;
