import { ProductRepository } from '@/routes/product/product.repo';
import {
  CreateProductBodyType,
  GetManageProductsQueryType,
  GetProductResponseType,
  GetProductsResponseType,
  UpdateProductBodyType,
} from '@/routes/product/product.type';
import { RoleName, RoleNameType } from '@/shared/constants/role.constant';
import { ProductNotFoundException } from '@/shared/errors/shared-error.error';
import { isNotFoundPrismaError } from '@/shared/helpers';
import { ProductType } from '@/shared/types/shared-product.type';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { SkuType } from '@/shared/types/shared-sku.type';
import { Transactional } from '@nestjs-cls/transactional';
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
      if (roleName !== RoleName.ADMIN && roleName !== RoleName.SELLER) {
        throw new ForbiddenException();
      }

      return this.productRepository.create({ userId, body });
    } catch (error) {
      throw error;
    }
  }

  // async updateProduct(props: {
  //   userId: number;
  //   productId: number;
  //   body: UpdateProductBodyType;
  //   roleName: RoleNameType;
  // }): Promise<ProductType> {
  //   try {
  //     const { userId, productId, body, roleName } = props;

  //     const product = await this.productRepository.findById(productId);

  //     if (!product) {
  //       throw ProductNotFoundException;
  //     }

  //     this._validateOwnerOrAdmin({
  //       userId: userId,
  //       roleName: roleName,
  //       creatorId: product.createdById,
  //     });

  //     const updatedProduct = await this.productRepository.update({ userId, productId, body });

  //     return updatedProduct;
  //   } catch (error) {
  //     if (isNotFoundPrismaError(error)) {
  //       throw ProductNotFoundException;
  //     }
  //     throw error;
  //   }
  // }

  async updateProduct(props: {
    userId: number;
    productId: number;
    body: UpdateProductBodyType;
    roleName: RoleNameType;
  }): Promise<ProductType> {
    const { userId, productId, body, roleName } = props;

    // 1. validate product
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw ProductNotFoundException;
    }

    // 2. Kiểm tra nếu user không phải là product creator hoặc admin thì không cho tiếp tục
    this._validateOwnerOrAdmin({
      userId: userId,
      roleName: roleName,
      creatorId: product.createdById,
    });

    // 3. find skus in database
    const skusInDatabase = await this.productRepository.findSkusByProductId(productId);

    // 4. update product
    return this._updateProductTransaction({ userId, productId, body, skusInDatabase });
  }

  @Transactional()
  private async _updateProductTransaction(props: {
    userId: number;
    productId: number;
    body: UpdateProductBodyType;
    skusInDatabase: SkuType[];
  }): Promise<ProductType> {
    const { userId, productId, body, skusInDatabase } = props;
    const { name, basePrice, virtualPrice, brandId, images, publishedAt, variants, categories, skus } = body;

    // 1. calculate skus to delete, update, create
    const skuInDatabaseByValue = new Map<string, SkuType>(skusInDatabase.map((s) => [s.value, s]));
    const bodyValues = new Set(skus.map((s) => s.value));

    const skusWithId = skus.map((sku) => ({
      ...sku,
      id: skuInDatabaseByValue.get(sku.value)?.id ?? null,
    }));

    const skuIdsToDelete = skusInDatabase.filter((s) => !bodyValues.has(s.value)).map((s) => s.id);
    const skusToUpdate = skusWithId.filter((sku): sku is typeof sku & { id: number } => sku.id !== null);
    const skusToCreate = skusWithId.filter((sku) => sku.id === null);

    // 2. update product
    const product = await this.productRepository.updateProduct({
      productId,
      userId,
      name,
      basePrice,
      virtualPrice,
      brandId,
      images,
      publishedAt,
      variants,
      categories,
    });

    if (skuIdsToDelete.length > 0) {
      await this.productRepository.softDeleteSkus({
        userId,
        skuIds: skuIdsToDelete,
      });
    }

    if (skusToUpdate.length > 0) {
      for (const sku of skusToUpdate) {
        await this.productRepository.updateSku({
          userId,
          sku,
        });
      }
    }

    if (skusToCreate.length > 0) {
      await this.productRepository.createSkus(
        skusToCreate.map(({ id: _id, ...sku }) => ({
          ...sku,
          productId,
          createdById: userId,
        })),
      );
    }

    return product;
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
    if (userId !== creatorId && roleName !== RoleName.ADMIN) {
      throw new ForbiddenException();
    }
    return true;
  }
}
