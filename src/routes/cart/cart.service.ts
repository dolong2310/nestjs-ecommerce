import { InvalidQuantityException, OutOfStockSkuException, SkuNotFoundException } from '@/routes/cart/cart.error';
import { CartRepository } from '@/routes/cart/cart.repo';
import {
  AddToCartBodyType,
  CartItemType,
  DeleteCartBodyType,
  GetCartQueryType,
  GetCartResponseType,
  UpdateCartBodyType,
} from '@/routes/cart/cart.type';
import { CartItemNotFoundException, ProductNotFoundException } from '@/shared/errors/shared-error.error';
import { isForeignKeyConstraintPrismaError, isNotFoundPrismaError } from '@/shared/helpers';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { SkuType } from '@/shared/types/shared-sku.type';
import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  getCart(props: { userId: number; query: GetCartQueryType }): Promise<GetCartResponseType> {
    const { userId, query } = props;
    return this.cartRepository.findMany({ userId, languageId: I18nContext.current()!.lang, query });
  }

  async addToCart(props: { userId: number; body: AddToCartBodyType }): Promise<CartItemType> {
    try {
      const { userId, body } = props;
      const { skuId, quantity } = body;

      // 1. Validate sku
      await this._validateSku({ userId, skuId, quantity, isCreate: true });

      // 2. Upsert cart item
      return await this.cartRepository.create({ userId, body });
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw SkuNotFoundException;
      }
      throw error;
    }
  }

  async updateCart(props: { userId: number; id: number; body: UpdateCartBodyType }): Promise<CartItemType> {
    try {
      const { userId, id, body } = props;
      const { skuId, quantity } = body;

      // 1. Validate sku
      await this._validateSku({ userId, skuId, quantity, isCreate: false });

      if (quantity <= 0) {
        return await this.cartRepository.delete({ userId, id });
      }

      // 2. Update cart item
      return await this.cartRepository.update({ userId, id, body });
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw CartItemNotFoundException;
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw SkuNotFoundException;
      }
      throw error;
    }
  }

  async deleteCart(props: { userId: number; body: DeleteCartBodyType }): Promise<MessageResponseType> {
    try {
      const { userId, body } = props;
      await this.cartRepository.deleteMany({ userId, body });
      return {
        message: 'Success.DeleteCart',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw CartItemNotFoundException;
      }
      throw error;
    }
  }

  private async _validateSku({
    userId,
    skuId,
    quantity,
    isCreate,
  }: {
    userId: number;
    skuId: number;
    quantity: number;
    isCreate: boolean;
  }): Promise<SkuType> {
    // 1. lấy danh sách sku theo skuId
    const [sku, cartItem] = await Promise.all([
      this.cartRepository.findSkuIncludeProductById(skuId),
      isCreate
        ? this.cartRepository.findCartItemById({
            userId,
            skuId,
          })
        : Promise.resolve(null),
    ]);

    if (!sku) {
      throw SkuNotFoundException;
    }

    // 2. Trong trường hợp add to cart (isCreate = true):
    // Kiểm tra số lượng cần thêm vào cart có lớn hơn số lượng trong kho không.
    // Trường hợp update cart item: không cần kiểm tra vì số lượng quantity khi update là replace (quantity mới) chứ không phải cộng thêm.
    if (isCreate && cartItem && cartItem.quantity + quantity > sku.stock) {
      throw InvalidQuantityException;
    }

    // 3. Kiểm tra sku có hết hàng không hoặc số lượng cần thêm vào cart lớn hơn số lượng trong kho
    if (sku.stock <= 0 || sku.stock < quantity) {
      throw OutOfStockSkuException;
    }

    // 4. Kiểm tra product có tồn tại không hoặc có isPublished không
    const product = sku.product;
    if (
      product.deletedAt !== null || // product đã bị xoá mềm
      product.publishedAt === null || // product chưa được publish
      (product.publishedAt !== null && product.publishedAt > new Date()) // product đã được publish nhưng chưa đến thời gian publish
    ) {
      throw ProductNotFoundException;
    }

    // 5. Return sku
    return sku;
  }
}
