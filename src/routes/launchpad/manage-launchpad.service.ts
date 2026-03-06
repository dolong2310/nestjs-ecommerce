import { redlock } from '@/redis';
import {
  LaunchpadActiveConflictException,
  LaunchpadCannotApproveException,
  LaunchpadCannotDeleteException,
  LaunchpadCannotEditException,
  LaunchpadCannotPublishException,
  LaunchpadCannotRejectException,
  LaunchpadCannotSubmitException,
  LaunchpadDiscountRateInvalidException,
  LaunchpadExpiredException,
  LaunchpadForbiddenException,
  LaunchpadNotFoundException,
  LaunchpadNotLiveException,
  LaunchpadPurchaseLimitException,
  SkuNotBelongToLaunchpadProductException,
} from '@/routes/launchpad/launchpad.error';
import { LaunchpadRepository } from '@/routes/launchpad/launchpad.repo';
import { LaunchpadService } from '@/routes/launchpad/launchpad.service';
import type {
  CreateLaunchpadBodyType,
  GetManageLaunchpadsQueryType,
  GetManageLaunchpadsResponseType,
  LaunchpadWithProductAndSkusType,
  ManageLaunchpadResponseType,
  PurchaseLaunchpadBodyType,
  PurchaseLaunchpadResponseType,
  UpdateLaunchpadBodyType,
} from '@/routes/launchpad/launchpad.type';
import { EnumLaunchpadStatus, LaunchpadStatusType } from '@/shared/constants/launchpad.constant';
import { EnumPaymentStatus } from '@/shared/constants/payment.constant';
import { RoleName, RoleNameType } from '@/shared/constants/role.constant';
import { ServerOverloadedException } from '@/shared/errors/shared-error.error';
import { isNotFoundPrismaError } from '@/shared/helpers';
import { SharedPaymentService } from '@/shared/services/shared-payment.service';
import { LaunchpadType } from '@/shared/types/shared-launchpad.type';
import { ProductIncludeSkuAndTranslationType } from '@/shared/types/shared-product.type';
import { SkuType } from '@/shared/types/shared-sku.type';
import { Transactional } from '@nestjs-cls/transactional';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ManageLaunchpadService {
  constructor(
    private readonly launchpadRepo: LaunchpadRepository,
    private readonly launchpadService: LaunchpadService,
    private readonly sharedPaymentService: SharedPaymentService,
  ) {}

  // ─── Seller: Read ────────────────────────────────────────────────────────────

  async getManageLaunchpads(
    query: GetManageLaunchpadsQueryType,
    userId: number,
    roleName: RoleNameType,
  ): Promise<GetManageLaunchpadsResponseType> {
    const isAdmin = roleName === RoleName.ADMIN;
    const result = await this.launchpadRepo.findManyManage(query, userId, isAdmin);

    return {
      ...result,
      data: result.data.map((lp) => ({
        ...lp,
        effectiveDisplayPrice: this.launchpadService._computeDisplayPrice(lp.product.basePrice, lp.discountRate),
      })),
    };
  }

  async getManageLaunchpadById(
    id: number,
    userId: number,
    roleName: RoleNameType,
  ): Promise<ManageLaunchpadResponseType> {
    const launchpad = await this.launchpadRepo.findByIdManage(id);

    if (!launchpad) throw LaunchpadNotFoundException;

    // Seller chỉ được xem launchpad của mình
    if (roleName === RoleName.SELLER && launchpad.createdById !== userId) {
      throw LaunchpadForbiddenException;
    }

    const effectiveDisplayPrice = this.launchpadService._computeDisplayPrice(
      launchpad.product.basePrice,
      launchpad.discountRate,
    );

    const skusWithLaunchPrice = launchpad.product.skus.map((sku) => ({
      ...sku,
      launchPrice: this.launchpadService._computeSkuLaunchPrice(sku.price, launchpad.discountRate),
    }));

    return {
      ...launchpad,
      rejectionReason: launchpad.rejectionReason ?? null,
      startTime: launchpad.startTime ?? null,
      endTime: launchpad.endTime ?? null,
      effectiveDisplayPrice,
      product: {
        ...launchpad.product,
        productTranslations: launchpad.product.productTranslations,
        skus: skusWithLaunchPrice,
      },
    };
  }

  // ─── Seller: Create / Update / Delete ────────────────────────────────────────

  @Transactional()
  async create(body: CreateLaunchpadBodyType, userId: number): Promise<ManageLaunchpadResponseType> {
    const { productId, discountRate, duration, maxPurchasesPerUser } = body;

    // 1. Kiểm tra product tồn tại và thuộc về seller
    const product = await this.launchpadRepo.findProductById(productId, userId);

    if (!product) {
      throw new NotFoundException([{ field: 'productId', message: 'Error.ProductNotFound' }]);
    }

    // 2. Validate discountRate hợp lý với basePrice
    const minSkuPrice = Math.min(...product.skus.map((s) => s.price));
    if (discountRate >= 100 || minSkuPrice * (1 - discountRate / 100) <= 0) {
      throw LaunchpadDiscountRateInvalidException;
    }

    // 3. Tạo launchpad
    const launchpad = await this.launchpadRepo.create({
      productId,
      createdById: userId,
      discountRate,
      duration,
      maxPurchasesPerUser,
    });

    return this._toManageResponse(launchpad, product);
  }

  @Transactional()
  async update(id: number, body: UpdateLaunchpadBodyType, userId: number): Promise<ManageLaunchpadResponseType> {
    const { discountRate, duration, maxPurchasesPerUser } = body;

    const launchpad = await this.launchpadRepo.findByIdManage(id);

    if (!launchpad) throw LaunchpadNotFoundException;
    if (launchpad.createdById !== userId) throw LaunchpadForbiddenException;

    const editableStatuses: LaunchpadStatusType[] = [EnumLaunchpadStatus.DRAFT, EnumLaunchpadStatus.REJECTED];
    if (!editableStatuses.includes(launchpad.status)) {
      throw LaunchpadCannotEditException;
    }

    // Re-validate discountRate nếu thay đổi
    if (discountRate !== undefined) {
      const minSkuPrice = Math.min(...launchpad.product.skus.map((s) => s.price));
      if (discountRate >= 100 || minSkuPrice * (1 - discountRate / 100) <= 0) {
        throw LaunchpadDiscountRateInvalidException;
      }
    }

    const updated = await this.launchpadRepo.update({
      id,
      userId,
      discountRate,
      duration,
      maxPurchasesPerUser,
    });

    return this._toManageResponse({ ...launchpad, ...updated }, launchpad.product);
  }

  @Transactional()
  async delete(id: number, userId: number): Promise<void> {
    const launchpad = await this.launchpadRepo.findByIdManage(id);

    if (!launchpad) throw LaunchpadNotFoundException;
    if (launchpad.createdById !== userId) throw LaunchpadForbiddenException;

    const deletableStatuses: LaunchpadStatusType[] = [EnumLaunchpadStatus.DRAFT, EnumLaunchpadStatus.REJECTED];
    if (!deletableStatuses.includes(launchpad.status)) {
      throw LaunchpadCannotDeleteException;
    }

    await this.launchpadRepo.softDelete(id, userId);
  }

  // ─── Seller: State transitions ────────────────────────────────────────────────

  @Transactional()
  async submit(id: number, userId: number): Promise<ManageLaunchpadResponseType> {
    const launchpad = await this.launchpadRepo.findByIdManage(id);

    if (!launchpad) throw LaunchpadNotFoundException;
    if (launchpad.createdById !== userId) throw LaunchpadForbiddenException;

    const submittableStatuses: LaunchpadStatusType[] = [EnumLaunchpadStatus.DRAFT, EnumLaunchpadStatus.REJECTED];
    if (!submittableStatuses.includes(launchpad.status)) {
      throw LaunchpadCannotSubmitException;
    }

    const updated = await this.launchpadRepo.submit(id, userId);

    return this._toManageResponse({ ...launchpad, ...updated }, launchpad.product);
  }

  @Transactional()
  async publish(id: number, userId: number): Promise<ManageLaunchpadResponseType> {
    const launchpad = await this.launchpadRepo.findByIdManage(id);

    if (!launchpad) throw LaunchpadNotFoundException;
    if (launchpad.createdById !== userId) throw LaunchpadForbiddenException;

    if (launchpad.status !== EnumLaunchpadStatus.APPROVED) {
      throw LaunchpadCannotPublishException;
    }

    // Kiểm tra không có LIVE launchpad nào cho product này của seller này
    const hasActive = await this.launchpadRepo.hasActiveLaunchpad(userId, launchpad.productId);
    if (hasActive) throw LaunchpadActiveConflictException;

    const now = new Date();
    const endTime = new Date(now.getTime() + launchpad.duration * 60 * 60 * 1000);

    const updated = await this.launchpadRepo.publish({
      id,
      userId,
      startTime: now,
      endTime,
    });

    return this._toManageResponse({ ...launchpad, ...updated }, launchpad.product);
  }

  // ─── Admin: Approve / Reject ──────────────────────────────────────────────────

  @Transactional()
  async approve(id: number, adminId: number, priority?: number): Promise<ManageLaunchpadResponseType> {
    const launchpad = await this.launchpadRepo.findByIdManage(id);

    if (!launchpad) throw LaunchpadNotFoundException;
    if (launchpad.status !== EnumLaunchpadStatus.PENDING) throw LaunchpadCannotApproveException;

    const updated = await this.launchpadRepo.approve({
      id,
      priority,
      adminId,
    });

    return this._toManageResponse({ ...launchpad, ...updated }, launchpad.product);
  }

  @Transactional()
  async reject(id: number, adminId: number, reason: string): Promise<ManageLaunchpadResponseType> {
    const launchpad = await this.launchpadRepo.findByIdManage(id);

    if (!launchpad) throw LaunchpadNotFoundException;
    if (launchpad.status !== EnumLaunchpadStatus.PENDING) throw LaunchpadCannotRejectException;

    const updated = await this.launchpadRepo.reject({
      id,
      reason,
      adminId,
    });

    return this._toManageResponse({ ...launchpad, ...updated }, launchpad.product);
  }

  // ─── User: Purchase ───────────────────────────────────────────────────────────

  async purchase(
    launchpadId: number,
    userId: number,
    body: PurchaseLaunchpadBodyType,
    ip: string,
  ): Promise<PurchaseLaunchpadResponseType> {
    const { skuId, paymentMethod, receiver } = body;

    // 1. Lấy launchpad kèm product + SKUs
    const launchpad = await this.launchpadRepo.findByIdLive(launchpadId);

    if (!launchpad) throw LaunchpadNotFoundException;
    if (launchpad.status !== EnumLaunchpadStatus.LIVE) throw LaunchpadNotLiveException;
    if (launchpad.endTime && launchpad.endTime <= new Date()) throw LaunchpadExpiredException;

    // 2. Kiểm tra SKU thuộc product của launchpad
    const sku = launchpad.product.skus.find((s) => s.id === skuId);
    if (!sku) throw SkuNotBelongToLaunchpadProductException;

    // 3. Kiểm tra số lần mua (nếu có giới hạn) — dùng Redlock để tránh race condition
    if (launchpad.maxPurchasesPerUser !== null) {
      const lockKey = `lock:launchpad-purchase:${launchpadId}:${userId}`;
      const lock = await redlock.acquire([lockKey], 5000).catch(() => {
        throw ServerOverloadedException;
      });

      try {
        const purchaseCount = await this.launchpadRepo.countUserPurchases(launchpadId, userId);
        if (purchaseCount >= launchpad.maxPurchasesPerUser) {
          throw LaunchpadPurchaseLimitException;
        }
      } finally {
        // await lock.release().catch(() => {});
        await redlock.release(lock).catch(() => {});
      }
    }

    // 4. Lock SKU để tránh race condition khi trừ stock
    const lock = await redlock.acquire([`lock:sku:${skuId}`], 3000).catch(() => {
      throw ServerOverloadedException;
    });

    try {
      const { order, paymentId } = await this._createLaunchpadOrderTransaction({
        launchpadId,
        userId,
        sku,
        launchpad,
        receiver,
      });

      // 5. Build payment URL
      let paymentUrl: string | null = null;
      if (paymentMethod) {
        paymentUrl = await this.sharedPaymentService.buildPaymentUrl({
          method: paymentMethod,
          userId,
          paymentId,
          ip,
          totalAmount: this.launchpadService._computeSkuLaunchPrice(sku.price, launchpad.discountRate),
        });
      }

      return { orderId: order.id, paymentUrl };
    } finally {
      // await lock.release().catch(() => {});
      await redlock.release(lock).catch(() => {});
    }
  }

  @Transactional()
  private async _createLaunchpadOrderTransaction(props: {
    launchpadId: number;
    userId: number;
    sku: Pick<SkuType, 'id' | 'price' | 'stock' | 'value' | 'image' | 'updatedAt'>;
    launchpad: LaunchpadWithProductAndSkusType;
    receiver: PurchaseLaunchpadBodyType['receiver'];
  }) {
    const { launchpadId, userId, sku, launchpad, receiver } = props;

    // Kiểm tra tồn kho
    const currentSku = await this.launchpadRepo.findSkuById(sku.id);

    if (!currentSku) {
      throw new NotFoundException([{ field: 'skuId', message: 'Error.SkuOutOfStock' }]);
    }

    const launchSkuPrice = this.launchpadService._computeSkuLaunchPrice(sku.price, launchpad.discountRate);

    // Tạo Payment
    const payment = await this.launchpadRepo.createPayment(EnumPaymentStatus.PENDING);

    // Tạo Order với launchpadId
    const order = await this.launchpadRepo.createOrder({
      userId,
      paymentId: payment.id,
      launchpadId,
      launchpad,
      launchSkuPrice,
      sku,
      receiver,
    });

    // Trừ stock SKU (optimistic lock: kiểm tra updatedAt)
    await this.launchpadRepo.decrementSkuStock(sku.id, sku.updatedAt).catch((error) => {
      if (isNotFoundPrismaError(error)) {
        throw new NotFoundException([{ field: 'skuId', message: 'Error.SkuOutOfStock' }]);
      }
      throw error;
    });

    return { order, paymentId: payment.id };
  }

  // ─── Cron: Process expired launchpad ─────────────────────────────────────────

  /**
   * Được gọi từ BullMQ processor. Idempotent: double-check status trước khi update.
   */
  async processExpired(launchpadId: number): Promise<void> {
    const launchpad = await this.launchpadRepo.findLaunchpadById(launchpadId);

    if (!launchpad || launchpad.status !== EnumLaunchpadStatus.LIVE) return;

    await this.launchpadRepo.processExpired(launchpadId);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private _toManageResponse(
    launchpad: LaunchpadType,
    product: ProductIncludeSkuAndTranslationType,
  ): ManageLaunchpadResponseType {
    const effectiveDisplayPrice = this.launchpadService._computeDisplayPrice(product.basePrice, launchpad.discountRate);

    const skusWithLaunchPrice = (product.skus ?? []).map((sku) => ({
      ...sku,
      launchPrice: this.launchpadService._computeSkuLaunchPrice(sku.price, launchpad.discountRate),
    }));

    return {
      ...launchpad,
      rejectionReason: launchpad.rejectionReason,
      startTime: launchpad.startTime,
      endTime: launchpad.endTime,
      effectiveDisplayPrice,
      product: {
        ...product,
        productTranslations: product.productTranslations ?? [],
        skus: skusWithLaunchPrice,
      },
    };
  }
}
