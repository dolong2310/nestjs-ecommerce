import { ProductNotFoundException } from '@/routes/product/product.error';
import { ProductRepository } from '@/routes/product/product.repo';
import {
  CreateProductBodyType,
  GetManageProductsQueryType,
  GetProductResponseType,
  GetProductsResponseType,
  ProductType,
  UpdateProductBodyType,
} from '@/routes/product/product.type';
import { RoleName, RoleNameType } from '@/shared/constants/role.constant';
import { isNotFoundPrismaError } from '@/shared/helpers';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class ManageProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * @description: Xem danh sách sản phẩm của 1 shop, bắt buộc phải truyền query param là `creatorId`
   */
  async getProducts(props: {
    query: GetManageProductsQueryType;
    userId: number;
    roleName: RoleNameType;
  }): Promise<GetProductsResponseType> {
    const { query, userId, roleName } = props;
    const { page, limit, name, brandIds, categories, minPrice, maxPrice, creatorId, isPublished, orderBy, sortBy } =
      query;

    this._validateOwnerOrAdmin({
      userId,
      roleName,
      creatorId,
    });

    try {
      return this.productRepository.findMany({
        page,
        limit,
        name,
        brandIds,
        categories,
        minPrice,
        maxPrice,
        creatorId,
        isPublished,
        orderBy,
        sortBy,
        languageId: I18nContext.current()!.lang,
      });
    } catch (error) {
      throw error;
    }
  }

  async getProductById(props: {
    productId: number;
    userId: number;
    roleName: RoleNameType;
  }): Promise<GetProductResponseType> {
    try {
      const { productId, userId, roleName } = props;

      const product = await this.productRepository.getDetail({
        productId,
        languageId: I18nContext.current()!.lang,
        // isPublished: false,
      });

      if (!product) {
        throw ProductNotFoundException;
      }

      this._validateOwnerOrAdmin({
        userId: userId,
        roleName: roleName,
        creatorId: product.createdById,
      });

      return product;
    } catch (error) {
      throw error;
    }
  }

  async createProduct(props: {
    userId: number;
    roleName: RoleNameType;
    body: CreateProductBodyType;
  }): Promise<GetProductResponseType> {
    try {
      const { userId, body, roleName } = props;

      // NOTE: only admin and seller can create product
      if (roleName !== RoleName.Admin && roleName !== RoleName.Seller) {
        throw new ForbiddenException();
      }

      return this.productRepository.create({ userId, body });
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(props: {
    userId: number;
    productId: number;
    body: UpdateProductBodyType;
    roleName: RoleNameType;
  }): Promise<ProductType> {
    try {
      const { userId, productId, body, roleName } = props;

      const product = await this.productRepository.findById(productId);

      if (!product) {
        throw ProductNotFoundException;
      }

      this._validateOwnerOrAdmin({
        userId: userId,
        roleName: roleName,
        creatorId: product.createdById,
      });

      const updatedProduct = await this.productRepository.update2({ userId, productId, body });

      return updatedProduct;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw ProductNotFoundException;
      }
      throw error;
    }
  }

  async deleteProduct(props: {
    userId: number;
    productId: number;
    roleName: RoleNameType;
  }): Promise<MessageResponseType> {
    try {
      const { userId, productId, roleName } = props;
      const product = await this.productRepository.findById(productId);

      if (!product) {
        throw ProductNotFoundException;
      }

      this._validateOwnerOrAdmin({
        userId: userId,
        roleName: roleName,
        creatorId: product.createdById,
      });

      const isHardDelete = false;
      await this.productRepository.delete({ userId, productId }, isHardDelete);

      return {
        message: 'Success.ProductDeleted',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw ProductNotFoundException;
      }
      throw error;
    }
  }

  /**
   * Kiểm tra nếu user không phải là `product creator` hoặc `admin` thì không cho tiếp tục.
   */
  private _validateOwnerOrAdmin({
    userId,
    roleName,
    creatorId,
  }: {
    userId: number;
    roleName: RoleNameType;
    creatorId?: number | null;
  }): boolean {
    if (userId !== creatorId && roleName !== RoleName.Admin) {
      throw new ForbiddenException();
    }
    return true;
  }
}
