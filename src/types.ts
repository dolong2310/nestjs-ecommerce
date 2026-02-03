import { VariantsType } from '@/shared/types/shared-product.type';

declare global {
  namespace PrismaJson {
    type ProductVariantType = VariantsType; // { value: string; options: string[] }[];
  }
}
