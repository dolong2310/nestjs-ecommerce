import { ProductTranslationType } from '@/shared/types/shared-product-translation.type';
import { VariantsType } from '@/shared/types/shared-product.type';

declare global {
  namespace PrismaJson {
    type ProductVariantType = VariantsType; // { value: string; options: string[] }[];
    type ProductTranslations = Pick<ProductTranslationType, 'id' | 'name' | 'description' | 'languageId'>[];
    type Receiver = {
      name: string;
      phoneNumber: string;
      address: string;
    };
  }
}
