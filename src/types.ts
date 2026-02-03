import { VariantsType } from '@/routes/product/product.type';

declare global {
  namespace PrismaJson {
    type ProductVariantType = VariantsType; // { value: string; options: string[] }[];
  }
}
