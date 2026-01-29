import { GetUserProfileResponseSchema, UpdateUserProfileResponseSchema } from "@/shared/models/shared-user.model";
import { createZodDto } from "nestjs-zod";

export class GetUserProfileResponseDTO extends createZodDto(GetUserProfileResponseSchema) { }
export class UpdateUserProfileResponseDTO extends createZodDto(UpdateUserProfileResponseSchema) { }
