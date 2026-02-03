import { SkuSchema } from '@/shared/models/shared-sku.model';
import z from 'zod';

export type SkuType = z.infer<typeof SkuSchema>;
