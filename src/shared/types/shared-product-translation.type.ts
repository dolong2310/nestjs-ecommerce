import { ProductTranslationSchema } from '@/shared/models/shared-product-translation.model';
import z from 'zod';

export type ProductTranslationType = z.infer<typeof ProductTranslationSchema>;
