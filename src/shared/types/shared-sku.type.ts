import { SkuSchema } from '@/shared/models/shared-sku.model';
import { ProductType } from '@/shared/types/shared-product.type';
import z from 'zod';

export type SkuType = z.infer<typeof SkuSchema>;
export type SkuIncludeProductType = SkuType & {
  product: ProductType;
};
