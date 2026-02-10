import { ProductRepository } from '@/routes/product/product.repo';
import { GetProductResponseType, GetProductsQueryType, GetProductsResponseType } from '@/routes/product/product.type';
import { ProductNotFoundException } from '@/shared/errors/shared-error.error';
import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getProducts(query: GetProductsQueryType): Promise<GetProductsResponseType> {
    try {
      const { page, limit, name, brandIds, categories, minPrice, maxPrice, creatorId, orderBy, sortBy } = query;
      return this.productRepository.findMany({
        page,
        limit,
        name,
        brandIds,
        categories,
        minPrice,
        maxPrice,
        creatorId,
        isPublished: true, // user only => true => chỉ lấy các product đã được publish
        orderBy,
        sortBy,
        languageId: I18nContext.current()!.lang,
      });
    } catch (error) {
      throw error;
    }
  }

  async getProductById(productId: number): Promise<GetProductResponseType> {
    try {
      const product = await this.productRepository.getDetail({
        productId,
        languageId: I18nContext.current()!.lang,
        isPublished: true, // user => true
      });
      if (!product) {
        throw ProductNotFoundException;
      }
      return product;
    } catch (error) {
      throw error;
    }
  }
}
