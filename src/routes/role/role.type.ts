import {
  CreateRoleBodySchema,
  GetRolesResponseSchema,
  RoleParamsSchema,
  RoleQuerySchema,
  UpdateRoleBodySchema,
} from '@/routes/role/role.model';
import z from 'zod';

export type RoleParamsType = z.infer<typeof RoleParamsSchema>;
export type RoleQueryType = z.infer<typeof RoleQuerySchema>;
export type CreateRoleBodyType = z.infer<typeof CreateRoleBodySchema>;
export type UpdateRoleBodyType = z.infer<typeof UpdateRoleBodySchema>;
export type GetRolesResponseType = z.infer<typeof GetRolesResponseSchema>;
