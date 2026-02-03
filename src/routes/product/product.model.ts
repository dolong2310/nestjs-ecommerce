import { UpsertSkuBodySchema } from '@/routes/product/sku.model';
import { EnumOrderBy, EnumSortBy } from '@/shared/constants/common.constant';
import { BrandIncludeTranslationsResponseSchema } from '@/shared/models/shared-brand.model';
import { CategoryIncludeTranslationsResponseSchema } from '@/shared/models/shared-category.model';
import { ProductTranslationSchema } from '@/shared/models/shared-product-translation.model';
import { ProductSchema } from '@/shared/models/shared-product.model';
import { SkuSchema } from '@/shared/models/shared-sku.model';
import { VariantsType } from '@/shared/types/shared-product.type';
import z from 'zod';

// Request query
/**
 * Query dành cho User và Guest
 */
export const GetProductsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    name: z.string().optional(),
    brandIds: z.preprocess((value: string) => {
      const parsedValue = value ? JSON.parse(value) : undefined; // Frontend truyền brandIds dưới dạng JSON.stringify vì nó là mảng
      if (parsedValue && Array.isArray(parsedValue)) {
        return parsedValue.map((id) => Number(id));
      }
      return undefined;
    }, z.array(z.coerce.number().int().positive()).optional()),
    categories: z.preprocess((value: string) => {
      const parsedValue = value ? JSON.parse(value) : undefined; // Frontend truyền categories dưới dạng JSON.stringify vì nó là mảng
      if (parsedValue && Array.isArray(parsedValue)) {
        return parsedValue.map((id) => Number(id));
      }
      return undefined;
    }, z.array(z.coerce.number().int().positive()).optional()),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    creatorId: z.coerce.number().int().positive().optional(),
    orderBy: z.enum(EnumOrderBy).default(EnumOrderBy.DESC),
    sortBy: z.enum(EnumSortBy).default(EnumSortBy.CREATED_AT),
  })
  .strict();
// .superRefine(({ minPrice, maxPrice }, ctx) => {
//   if (minPrice !== undefined && maxPrice !== undefined) {
//     if (minPrice > maxPrice) {
//       return ctx.addIssue({
//         code: 'custom',
//         message: 'Min price must be less than max price',
//         path: ['minPrice', 'maxPrice'],
//       });
//     }
//   }
// });

/**
 * Query dành cho Admin và Seller
 */
export const GetManageProductsQuerySchema = GetProductsQuerySchema.extend({
  /**
    z.preprocess(
      (value) => value === 'true',  // Bước 1: Transform
      z.boolean().optional()        // Bước 2: Validate
    )
    Ý nghĩa:
    URL: ?isPublished=true => value === 'true' => true (boolean)
    URL: ?isPublished=false => value === 'false' => false (boolean)
    URL: không có isPublished => value = undefined => .optional() cho phép → undefined
   */
  isPublished: z.preprocess((value) => {
    if (typeof value === 'undefined') {
      return undefined; // must be undefined, DO NOT return boolean
    }
    return value === 'true';
  }, z.boolean().optional()), //  z.coerce.boolean().optional(),
  creatorId: z.coerce.number().int().positive(),
});

// Request params
export const GetProductParamsSchema = z
  .object({
    id: z.coerce.number().int().positive(),
  })
  .strict();

// Request body
export const CreateProductBodySchema = ProductSchema.pick({
  name: true,
  basePrice: true,
  virtualPrice: true,
  brandId: true,
  images: true,
  publishedAt: true,
  variants: true,
})
  .extend({
    categories: z.array(z.coerce.number().int().positive()),
    skus: z.array(UpsertSkuBodySchema),
  })
  .strict()
  .superRefine(({ variants, skus }, ctx) => {
    // Kiểm tra số lượng sku có hợp lệ không
    const skuValueArray = _generateSKUs(variants);
    if (skus.length !== skuValueArray.length) {
      return ctx.addIssue({
        code: 'custom',
        message: `Number of SKUs should be ${skuValueArray.length}`,
        path: ['skus'],
      });
    }

    // Kiểm tra từng ski có hợp lệ không
    let wrongSkuIndex = -1;
    const isValidSkus = skus.every((sku, index) => {
      const isValid = sku.value === skuValueArray[index].value;
      if (!isValid) {
        wrongSkuIndex = index;
      }
      return isValid;
    });

    if (!isValidSkus) {
      return ctx.addIssue({
        code: 'custom',
        message: `SKU at index ${wrongSkuIndex} is invalid`,
        path: ['skus', wrongSkuIndex, 'value'],
      });
    }
  });

export const UpdateProductBodySchema = CreateProductBodySchema.strict();

// Response
export const GetProductsResponseSchema = z.object({
  data: z.array(
    ProductSchema.extend({
      productTranslations: z.array(ProductTranslationSchema),
    }),
  ),
  totalItems: z.number(),
  totalPages: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const GetProductResponseSchema = ProductSchema.extend({
  productTranslations: z.array(ProductTranslationSchema),
  skus: z.array(SkuSchema),
  categories: z.array(CategoryIncludeTranslationsResponseSchema),
  brand: BrandIncludeTranslationsResponseSchema,
});

function _generateSKUs(variants: VariantsType) {
  // Hàm hỗ trợ để tạo tất cả tổ hợp
  function getCombinations(arrays: string[][]): string[] {
    return arrays.reduce((acc, curr) => acc.flatMap((x) => curr.map((y) => `${x}${x ? '-' : ''}${y}`)), ['']);
  }

  // Lấy mảng các options từ variants
  const options = variants.map((variant) => variant.options);

  // Tạo tất cả tổ hợp
  const combinations = getCombinations(options);

  // Map mỗi tổ hợp thành SKU (loại bỏ chuỗi rỗng nếu có)
  return combinations.map((value, index) => ({
    value,
    price: 0,
    stock: 100,
    image: `https://example.com/image${index + 1}.jpg`,
  }));
}
