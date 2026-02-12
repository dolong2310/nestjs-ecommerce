import {
  RoleResponseSchema,
  RoleSchema,
  RoleWithPermissionsResponseSchema,
  RoleWithPermissionsSchema,
} from '@/shared/models/shared-role.model';
import z from 'zod';

export type RoleType = z.infer<typeof RoleSchema>;
export type RoleWithPermissionsType = z.infer<typeof RoleWithPermissionsSchema>;

export type RoleResponseType = z.infer<typeof RoleResponseSchema>;
export type RoleWithPermissionsResponseType = z.infer<typeof RoleWithPermissionsResponseSchema>;
