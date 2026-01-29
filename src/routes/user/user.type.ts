import { CreateUserBodySchema, GetUsersResponseSchema, UserParamsSchema, UserQuerySchema, UpdateUserBodySchema, GetUserResponseSchema, CreateUserResponseSchema, UpdateUserResponseSchema } from "@/routes/user/user.model";
import z from "zod";

export type CreateUserBodyType = z.infer<typeof CreateUserBodySchema>;
export type UpdateUserBodyType = z.infer<typeof UpdateUserBodySchema>;
export type UserParamsType = z.infer<typeof UserParamsSchema>;
export type UserQueryType = z.infer<typeof UserQuerySchema>;
export type GetUsersResponseType = z.infer<typeof GetUsersResponseSchema>;
export type GetUserResponseType = z.infer<typeof GetUserResponseSchema>;
export type CreateUserResponseType = z.infer<typeof CreateUserResponseSchema>;
export type UpdateUserResponseType = z.infer<typeof UpdateUserResponseSchema>;