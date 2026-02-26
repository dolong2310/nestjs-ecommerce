import {
  GetLaunchpadsQueryType,
  GetManageLaunchpadsQueryType,
  LaunchpadActiveLookupType,
  LaunchpadExpiredIdType,
  LaunchpadPaginatedType,
  LaunchpadWithProductAndSkusType,
  LaunchpadWithProductType,
  PurchaseLaunchpadBodyType,
} from '@/routes/launchpad/launchpad.type';
import { EnumLaunchpadStatus } from '@/shared/constants/launchpad.constant';
import { EnumOrderStatus } from '@/shared/constants/order.constant';
import { EnumPaymentStatus, PaymentStatusType } from '@/shared/constants/payment.constant';
import { paginate } from '@/shared/helpers';
import { PrismaService } from '@/shared/services/prisma.service';
import { LaunchpadType } from '@/shared/types/shared-launchpad.type';
import { OrderType } from '@/shared/types/shared-order.type';
import { PaymentType } from '@/shared/types/shared-payment.type';
import { ProductIncludeSkuAndTranslationType } from '@/shared/types/shared-product.type';
import { SkuType } from '@/shared/types/shared-sku.type';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';

// Prisma include dùng chung cho public và manage views
const LAUNCHPAD_PRODUCT_INCLUDE = {
  product: {
    include: {
      productTranslations: {
        where: { deletedAt: null },
      },
    },
  },
} as const;

const LAUNCHPAD_PRODUCT_WITH_SKUS_INCLUDE = {
  product: {
    include: {
      productTranslations: {
        where: { deletedAt: null },
      },
      skus: {
        where: { deletedAt: null },
      },
    },
  },
} as const;

@Injectable()
export class LaunchpadRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma<PrismaService>>,
  ) {}

  // ─── Public queries ──────────────────────────────────────────────────────────

  async findManyLive(query: GetLaunchpadsQueryType): Promise<LaunchpadPaginatedType<LaunchpadWithProductType>> {
    const { page, limit, sort } = query;
    const now = new Date();

    const where = {
      status: EnumLaunchpadStatus.LIVE,
      endTime: { gt: now },
      deletedAt: null,
    };

    const orderBy =
      sort === 'ending-soon'
        ? { endTime: 'asc' as const }
        : sort === 'newest'
          ? { createdAt: 'desc' as const }
          : { priority: 'desc' as const };

    const dataPromise = this.prismaService.launchpad.findMany({
      where,
      include: LAUNCHPAD_PRODUCT_INCLUDE,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const countPromise = this.prismaService.launchpad.count({ where });

    return paginate(dataPromise, countPromise, page, limit);
  }

  findByIdLive(id: number): Promise<LaunchpadWithProductAndSkusType | null> {
    return this.prismaService.launchpad.findFirst({
      where: {
        id,
        status: EnumLaunchpadStatus.LIVE,
        endTime: { gt: new Date() },
        deletedAt: null,
      },
      include: LAUNCHPAD_PRODUCT_WITH_SKUS_INCLUDE,
    });
  }

  // ─── Manage queries (seller + admin) ─────────────────────────────────────────

  async findManyManage(
    query: GetManageLaunchpadsQueryType,
    userId: number,
    isAdmin: boolean,
  ): Promise<LaunchpadPaginatedType<LaunchpadWithProductType>> {
    const { page, limit, status, creatorId } = query;

    const where = {
      deletedAt: null,
      ...(status && { status }),
      // Admin có thể lọc theo creatorId, Seller chỉ thấy của mình
      createdById: isAdmin ? (creatorId ?? undefined) : userId,
    };

    const dataPromise = this.prismaService.launchpad.findMany({
      where,
      include: LAUNCHPAD_PRODUCT_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const countPromise = this.prismaService.launchpad.count({ where });

    return paginate(dataPromise, countPromise, page, limit);
  }

  findByIdManage(id: number): Promise<LaunchpadWithProductAndSkusType | null> {
    return this.prismaService.launchpad.findFirst({
      where: { id, deletedAt: null },
      include: LAUNCHPAD_PRODUCT_WITH_SKUS_INCLUDE,
    });
  }

  // ─── Validation helpers ───────────────────────────────────────────────────────

  /** Tìm launchpad LIVE của product để kiểm tra price và purchase eligibility */
  findActiveLaunchpadByProductId(productId: number): Promise<LaunchpadActiveLookupType | null> {
    return this.prismaService.launchpad.findFirst({
      where: {
        productId,
        status: EnumLaunchpadStatus.LIVE,
        endTime: { gt: new Date() },
        deletedAt: null,
      },
      select: {
        id: true,
        discountRate: true,
        endTime: true,
        soldCount: true,
        maxPurchasesPerUser: true,
      },
    });
  }

  /** Đếm số lần user đã mua thành công 1 launchpad cụ thể */
  countUserPurchases(launchpadId: number, userId: number): Promise<number> {
    return this.prismaService.order.count({
      where: {
        launchpadId,
        userId,
        status: { not: EnumOrderStatus.CANCELLED },
        deletedAt: null,
        payment: {
          status: EnumPaymentStatus.SUCCESS,
        },
      },
    });
  }

  /** Kiểm tra seller có LIVE launchpad nào cho product này không */
  hasActiveLaunchpad(createdById: number, productId: number): Promise<boolean> {
    return this.prismaService.launchpad
      .count({
        where: {
          createdById,
          productId,
          status: EnumLaunchpadStatus.LIVE,
          deletedAt: null,
        },
      })
      .then((count) => count > 0);
  }

  // ─── Write operations (chạy trong transaction) ────────────────────────────────

  create(data: {
    productId: number;
    createdById: number;
    discountRate: number;
    duration: number;
    maxPurchasesPerUser: number | null;
  }): Promise<LaunchpadType> {
    return this.txHost.tx.launchpad.create({ data });
  }

  update({
    id,
    userId,
    discountRate,
    duration,
    maxPurchasesPerUser,
  }: {
    id: number;
    userId: number;
    discountRate?: number | undefined;
    duration?: number | undefined;
    maxPurchasesPerUser?: number | null | undefined;
  }): Promise<LaunchpadType> {
    return this.txHost.tx.launchpad.update({
      where: { id, deletedAt: null },
      data: {
        discountRate,
        duration,
        maxPurchasesPerUser,
        updatedById: userId,
      },
    });
  }

  submit(id: number, userId: number): Promise<LaunchpadType> {
    return this.txHost.tx.launchpad.update({
      where: { id, deletedAt: null },
      data: {
        status: EnumLaunchpadStatus.PENDING,
        rejectionReason: null,
        updatedById: userId,
      },
    });
  }

  publish({
    id,
    userId,
    startTime,
    endTime,
  }: {
    id: number;
    userId: number;
    startTime: Date;
    endTime: Date;
  }): Promise<LaunchpadType> {
    return this.txHost.tx.launchpad.update({
      where: { id, deletedAt: null },
      data: {
        status: EnumLaunchpadStatus.LIVE,
        startTime,
        endTime,
        updatedById: userId,
      },
    });
  }

  approve({ id, priority, adminId }: { id: number; priority?: number; adminId: number }): Promise<LaunchpadType> {
    return this.txHost.tx.launchpad.update({
      where: { id, deletedAt: null },
      data: {
        status: EnumLaunchpadStatus.APPROVED,
        ...(priority !== undefined && { priority }),
        updatedById: adminId,
      },
    });
  }

  reject({ id, reason, adminId }: { id: number; reason: string; adminId: number }): Promise<LaunchpadType> {
    return this.txHost.tx.launchpad.update({
      where: { id, deletedAt: null },
      data: {
        status: EnumLaunchpadStatus.REJECTED,
        rejectionReason: reason,
        updatedById: adminId,
      },
    });
  }

  processExpired(id: number): Promise<LaunchpadType> {
    return this.prismaService.launchpad.update({
      where: { id, deletedAt: null },
      data: {
        status: EnumLaunchpadStatus.ENDED,
      },
    });
  }

  softDelete(id: number, deletedById: number): Promise<LaunchpadType> {
    return this.txHost.tx.launchpad.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById,
      },
    });
  }

  /** Tăng soldCount atomic khi thanh toán thành công */
  incrementSoldCount(id: number): Promise<LaunchpadType> {
    return this.txHost.tx.launchpad.update({
      where: { id },
      data: { soldCount: { increment: 1 } },
    });
  }

  /** Lấy danh sách expired LIVE launchpads để cron job enqueue */
  findExpiredLive(): Promise<LaunchpadExpiredIdType[]> {
    return this.prismaService.launchpad.findMany({
      where: {
        status: EnumLaunchpadStatus.LIVE,
        endTime: { lt: new Date() },
        deletedAt: null,
      },
      select: { id: true },
    });
  }

  findProductById(id: number, userId: number): Promise<ProductIncludeSkuAndTranslationType | null> {
    return this.txHost.tx.product.findFirst({
      where: { id, createdById: userId, deletedAt: null, publishedAt: { not: null } },
      include: {
        productTranslations: { where: { deletedAt: null } },
        skus: { where: { deletedAt: null } },
      },
    });
  }

  findSkuById(id: number): Promise<SkuType | null> {
    return this.txHost.tx.sKU.findUnique({
      where: { id, stock: { gte: 1 }, deletedAt: null },
    });
  }

  createPayment(status: PaymentStatusType = EnumPaymentStatus.PENDING): Promise<PaymentType> {
    return this.txHost.tx.payment.create({
      data: { status },
    });
  }

  createOrder(data: {
    userId: number;
    paymentId: number;
    launchpadId: number;
    launchpad: LaunchpadWithProductAndSkusType;
    launchSkuPrice: number;
    sku: Pick<SkuType, 'id' | 'price' | 'stock' | 'value' | 'image' | 'updatedAt'>;
    receiver: PurchaseLaunchpadBodyType['receiver'];
  }): Promise<OrderType> {
    const { userId, paymentId, launchpadId, launchpad, launchSkuPrice, sku, receiver } = data;
    const productTranslations = launchpad.product.productTranslations ?? [];
    return this.txHost.tx.order.create({
      data: {
        userId,
        shopId: launchpad.createdById,
        paymentId,
        status: EnumOrderStatus.PENDING_PAYMENT,
        receiver,
        createdById: userId,
        launchpadId,
        items: {
          create: {
            productId: launchpad.productId,
            productName: launchpad.product.name,
            productTranslations: productTranslations.map((t) => ({
              id: t.id,
              name: t.name,
              languageId: t.languageId,
              description: t.description,
            })),
            quantity: 1,
            image: sku.image,
            skuId: sku.id,
            skuPrice: launchSkuPrice,
            skuValue: sku.value,
          },
        },
        products: {
          connect: { id: launchpad.productId },
        },
      },
    });
  }

  decrementSkuStock(skuId: number, skuUpdatedAt: Date): Promise<SkuType> {
    return this.txHost.tx.sKU.update({
      where: { id: skuId, updatedAt: skuUpdatedAt, stock: { gte: 1 }, deletedAt: null },
      data: { stock: { decrement: 1 } },
    });
  }

  findLaunchpadById(id: number): Promise<Pick<LaunchpadType, 'id' | 'status'> | null> {
    return this.prismaService.launchpad.findUnique({
      where: { id, deletedAt: null },
      select: { id: true, status: true },
    });
  }
}
