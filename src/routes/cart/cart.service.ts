import { CartItemNotFoundException, SkuNotFoundException } from '@/routes/cart/cart.error';
import { CartRepository } from '@/routes/cart/cart.repo';
import {
  AddToCartBodyType,
  CartItemType,
  DeleteCartBodyType,
  GetCartQueryType,
  GetCartResponseType,
  UpdateCartBodyType,
} from '@/routes/cart/cart.type';
import { isForeignKeyConstraintPrismaError, isNotFoundPrismaError } from '@/shared/helpers';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async getCart(props: { userId: number; query: GetCartQueryType }): Promise<GetCartResponseType> {
    try {
      const { userId, query } = props;
      return await this.cartRepository.findMany2({ userId, languageId: I18nContext.current()!.lang, query });
    } catch (error) {
      throw error;
    }
  }

  async addToCart(props: { userId: number; body: AddToCartBodyType }): Promise<CartItemType> {
    try {
      const { userId, body } = props;
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
      await this.cartRepository.delete({ userId, body });
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
}
