import { CreateLanguageBodySchema, GetLanguageResponseSchema, GetLanguagesResponseSchema, LanguageSchema, UpdateLanguageBodySchema } from "@/routes/language/language.model";
import z from "zod";

export type LanguageType = z.infer<typeof LanguageSchema>;
export type CreateLanguageBodyType = z.infer<typeof CreateLanguageBodySchema>;
export type UpdateLanguageBodyType = z.infer<typeof UpdateLanguageBodySchema>;
export type GetLanguageResponseType = z.infer<typeof GetLanguageResponseSchema>;
export type GetLanguagesResponseType = z.infer<typeof GetLanguagesResponseSchema>;
