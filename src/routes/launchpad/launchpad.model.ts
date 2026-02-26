import { EnumLaunchpadStatus } from '@/shared/constants/launchpad.constant';
import { LaunchpadSchema } from '@/shared/models/shared-launchpad.model';
import { ProductTranslationSchema } from '@/shared/models/shared-product-translation.model';
import { ProductSchema } from '@/shared/models/shared-product.model';
import { SkuSchema } from '@/shared/models/shared-sku.model';
import { EnumPaymentMethod } from '@/shared/payment-providers/core/constants';
import z from 'zod';

// ─── Request query ────────────────────────────────────────────────────────────

export const GetLaunchpadsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10),
    sort: z.enum(['priority', 'newest', 'ending-soon']).default('priority'),
  })
  .strict();

export const GetManageLaunchpadsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    status: z.enum(EnumLaunchpadStatus).optional(),
    creatorId: z.coerce.number().int().positive().optional(),
  })
  .strict();

// ─── Request params ───────────────────────────────────────────────────────────

export const GetLaunchpadParamsSchema = z
  .object({
    id: z.coerce.number().int().positive(),
  })
  .strict();

// ─── Request body ─────────────────────────────────────────────────────────────

export const CreateLaunchpadBodySchema = z
  .object({
    productId: z.number().int().positive(),
    discountRate: z.number().min(1, 'Discount rate must be at least 1%').max(99, 'Discount rate must be at most 99%'),
    duration: z
      .number()
      .int()
      .min(1, 'Duration must be at least 1 hour')
      .max(720, 'Duration must be at most 720 hours'),
    maxPurchasesPerUser: z.number().int().positive().nullable().optional().default(null),
  })
  .strict();

export const UpdateLaunchpadBodySchema = CreateLaunchpadBodySchema.omit({ productId: true }).partial().strict();

export const ApproveLaunchpadBodySchema = z
  .object({
    priority: z.number().int().min(0).optional(),
  })
  .strict();

export const RejectLaunchpadBodySchema = z
  .object({
    reason: z.string().min(1).max(500),
  })
  .strict();

export const PurchaseLaunchpadBodySchema = z
  .object({
    skuId: z.number().int().positive(),
    paymentMethod: z.enum(EnumPaymentMethod),
    receiver: z.object({
      name: z.string().min(1),
      phoneNumber: z.string().min(10).max(15),
      address: z.string().min(1),
    }),
  })
  .strict();

// ─── Product info embedded in launchpad response ──────────────────────────────

const LaunchpadProductSchema = ProductSchema.pick({
  id: true,
  name: true,
  basePrice: true,
  virtualPrice: true,
  images: true,
}).extend({
  productTranslations: z.array(
    ProductTranslationSchema.pick({ id: true, languageId: true, name: true, description: true }),
  ),
});

const LaunchpadDetailProductSchema = LaunchpadProductSchema.extend({
  skus: z.array(
    SkuSchema.pick({ id: true, value: true, price: true, stock: true, image: true }).extend({
      launchPrice: z.number(), // Computed: SKU.price * (1 - discountRate/100)
    }),
  ),
});

// ─── Response ─────────────────────────────────────────────────────────────────

const LaunchpadBaseResponseSchema = LaunchpadSchema.omit({
  createdById: true,
  updatedById: true,
  deletedById: true,
  deletedAt: true,
}).extend({
  effectiveDisplayPrice: z.number(), // Computed: Product.basePrice * (1 - discountRate/100)
});

export const GetLaunchpadsResponseSchema = z.object({
  data: z.array(
    LaunchpadBaseResponseSchema.extend({
      product: LaunchpadProductSchema,
    }),
  ),
  totalItems: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  limit: z.number(),
});

export const GetLaunchpadResponseSchema = LaunchpadBaseResponseSchema.extend({
  product: LaunchpadDetailProductSchema,
  isPurchased: z.boolean(),
  canPurchase: z.boolean(),
  purchaseCount: z.number(),
});

export const GetManageLaunchpadsResponseSchema = z.object({
  data: z.array(
    LaunchpadSchema.omit({
      createdById: true,
      updatedById: true,
      deletedById: true,
      deletedAt: true,
    }).extend({
      effectiveDisplayPrice: z.number(),
      product: LaunchpadProductSchema,
    }),
  ),
  totalItems: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  limit: z.number(),
});

export const ManageLaunchpadResponseSchema = LaunchpadSchema.omit({
  createdById: true,
  updatedById: true,
  deletedById: true,
  deletedAt: true,
}).extend({
  effectiveDisplayPrice: z.number(),
  product: LaunchpadDetailProductSchema,
});

export const PurchaseLaunchpadResponseSchema = z.object({
  orderId: z.number(),
  paymentUrl: z.string().nullable(),
});

// ─── Repository schemas ──

export const LaunchpadRepoProductSchema = ProductSchema.extend({
  productTranslations: z.array(ProductTranslationSchema),
});

export const LaunchpadRepoProductWithSkusSchema = ProductSchema.extend({
  productTranslations: z.array(ProductTranslationSchema),
  skus: z.array(SkuSchema),
});

export const LaunchpadWithProductSchema = LaunchpadSchema.extend({
  product: LaunchpadRepoProductSchema,
});

export const LaunchpadWithProductAndSkusSchema = LaunchpadSchema.extend({
  product: LaunchpadRepoProductWithSkusSchema,
});

export const LaunchpadActiveLookupSchema = LaunchpadSchema.pick({
  id: true,
  discountRate: true,
  endTime: true,
  soldCount: true,
  maxPurchasesPerUser: true,
});

export const LaunchpadExpiredIdSchema = z.object({ id: z.number() });
