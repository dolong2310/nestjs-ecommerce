import {
  LaunchpadExpiredException,
  LaunchpadNotFoundException,
  LaunchpadNotLiveException,
} from '@/routes/launchpad/launchpad.error';
import { LaunchpadRepository } from '@/routes/launchpad/launchpad.repo';
import {
  GetLaunchpadResponseType,
  GetLaunchpadsQueryType,
  GetLaunchpadsResponseType,
  LaunchpadWithProductType,
} from '@/routes/launchpad/launchpad.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LaunchpadService {
  constructor(private readonly launchpadRepo: LaunchpadRepository) {}

  async getMany(query: GetLaunchpadsQueryType): Promise<GetLaunchpadsResponseType> {
    const result = await this.launchpadRepo.findManyLive(query);

    return {
      ...result,
      data: result.data.map((lp) => this._toPublicResponse(lp)),
    };
  }

  async getById(id: number, userId?: number): Promise<GetLaunchpadResponseType> {
    const launchpad = await this.launchpadRepo.findByIdLive(id);

    if (!launchpad) throw LaunchpadNotFoundException;

    // Kiểm tra lại (dự phòng sau khi query):
    if (launchpad.status !== 'LIVE') throw LaunchpadNotLiveException;
    if (launchpad.endTime && launchpad.endTime <= new Date()) throw LaunchpadExpiredException;

    let purchaseCount = 0;
    if (userId) {
      purchaseCount = await this.launchpadRepo.countUserPurchases(id, userId);
    }

    const isPurchased = purchaseCount > 0;
    const isLimitReached = launchpad.maxPurchasesPerUser !== null && purchaseCount >= launchpad.maxPurchasesPerUser;

    const effectiveDisplayPrice = this._computeDisplayPrice(launchpad.product.basePrice, launchpad.discountRate);

    const skusWithLaunchPrice = launchpad.product.skus.map((sku) => ({
      ...sku,
      launchPrice: this._computeSkuLaunchPrice(sku.price, launchpad.discountRate),
    }));

    return {
      ...launchpad,
      effectiveDisplayPrice,
      product: {
        ...launchpad.product,
        skus: skusWithLaunchPrice,
      },
      isPurchased,
      canPurchase: !isLimitReached,
      purchaseCount,
    };
  }

  // ─── Helpers (dùng chung) ─────────────────────────────────────────────────────

  /** Giá hiển thị trên product list = Product.basePrice * (1 - discountRate/100) */
  _computeDisplayPrice(basePrice: number, discountRate: number): number {
    return Math.round(basePrice * (1 - discountRate / 100));
  }

  /** Giá thực tế mua của SKU = SKU.price * (1 - discountRate/100) */
  _computeSkuLaunchPrice(skuPrice: number, discountRate: number): number {
    return Math.round(skuPrice * (1 - discountRate / 100));
  }

  _toPublicResponse(lp: LaunchpadWithProductType): GetLaunchpadsResponseType['data'][number] {
    return {
      ...lp,
      effectiveDisplayPrice: this._computeDisplayPrice(lp.product.basePrice, lp.discountRate),
    };
  }
}
