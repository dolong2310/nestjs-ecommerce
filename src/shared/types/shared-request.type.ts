import { EmptyBodySchema } from "@/shared/models/request.model";
import z from "zod";

export type EmptyBodyType = z.infer<typeof EmptyBodySchema>;
