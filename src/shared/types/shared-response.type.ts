import { MessageResponseSchema } from "@/shared/models/response.model";
import z from "zod";

export type MessageResponseType = z.infer<typeof MessageResponseSchema>;