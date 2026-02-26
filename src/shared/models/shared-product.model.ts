import { stringToDate } from '@/shared/models/codecs';
import { ProductTranslationSchema } from '@/shared/models/shared-product-translation.model';
import { SkuSchema } from '@/shared/models/shared-sku.model';
import z from 'zod';

// Variant Schema
export const VariantSchema = z.object({
  value: z.string().trim(),
  options: z.array(z.string().trim()),
});

export const VariantsSchema = z.array(VariantSchema).superRefine((variants, ctx) => {
  // Kiểm tra variants và variant option có bị trùng không
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    const isExisting = variants.findIndex((v) => v.value.toLowerCase() === variant.value.toLowerCase()) !== i;
    if (isExisting) {
      return ctx.addIssue({
        code: 'custom',
        message: `${variant.value} is already exists`,
        path: ['variants', i, 'value'],
      });
    }
    const isDuplicateOption = variant.options.some(
      (option) => variant.options.filter((o) => o.toLowerCase() === option.toLowerCase()).length > 1,
    );
    if (isDuplicateOption) {
      return ctx.addIssue({
        code: 'custom',
        message: `${variant.options.join(', ')} contains duplicate option names`,
        path: ['variants', i, 'options'],
      });
    }
  }
});

// Product Schema
export const ProductSchema = z.object({
  id: z.number(),
  name: z.string().max(500).trim(),
  basePrice: z.number().min(0),
  virtualPrice: z.number().min(0),
  brandId: z.number().positive(),
  images: z.array(z.string()),
  publishedAt: stringToDate.nullable(), // Phải có coerce để ép kiểu qua date vì FE truyền date dưới dạng string
  // publishedAt: z.coerce.date().nullable(), // Phải có coerce để ép kiểu qua date vì FE truyền date dưới dạng string
  variants: VariantsSchema, // Json field represented as a record of VariantSchema

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),

  createdAt: stringToDate.default(new Date()),
  updatedAt: stringToDate.default(new Date()),
  deletedAt: stringToDate.nullable(),
});

export const ProductIncludeSkuAndTranslation = ProductSchema.extend({
  productTranslations: z.array(
    ProductTranslationSchema.omit({
      createdById: true,
      updatedById: true,
      deletedById: true,
      deletedAt: true,
    }),
  ),
  skus: z.array(
    SkuSchema.omit({
      createdById: true,
      updatedById: true,
      deletedById: true,
      deletedAt: true,
    }),
  ),
}).omit({
  // createdById: true,
  updatedById: true,
  deletedById: true,
  deletedAt: true,
});
