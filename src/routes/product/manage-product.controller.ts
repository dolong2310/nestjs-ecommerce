import {
  CreateProductBodyDTO,
  GetManageProductsQueryDTO,
  GetProductResponseDTO,
  GetProductsResponseDTO,
  ProductResponseDTO,
  UpdateProductBodyDTO,
} from '@/routes/product/product.dto';
import { CURRENT_VERSION } from '@/shared/constants/version.constant';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import type { AccessTokenPayload } from '@/shared/types/jwt.type';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';
import { ManageProductService } from './manage-product.service';

/**
 * @description: Only for ADMIN/SELLER access
 */
@Controller({ path: 'manage-product/products', version: CURRENT_VERSION })
export class ManageProductController {
  constructor(private readonly manageProductService: ManageProductService) {}

  @Get()
  @ZodResponse({ type: GetProductsResponseDTO })
  getProducts(
    @Query() query: GetManageProductsQueryDTO,
    @ActiveUser() user: AccessTokenPayload,
  ): Promise<GetProductsResponseDTO> {
    const { userId, roleName } = user;
    return this.manageProductService.getProducts({
      query,
      userId,
      roleName,
    });
  }

  @Get(':id')
  @ZodResponse({ type: GetProductResponseDTO })
  getProductById(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser() user: AccessTokenPayload,
  ): Promise<GetProductResponseDTO> {
    const { userId, roleName } = user;
    return this.manageProductService.getProductById({
      productId: id,
      userId,
      roleName,
    });
  }

  @Post()
  @ZodResponse({ type: GetProductResponseDTO })
  createProduct(
    @ActiveUser() user: AccessTokenPayload,
    @Body() body: CreateProductBodyDTO,
  ): Promise<GetProductResponseDTO> {
    const { userId, roleName } = user;
    return this.manageProductService.createProduct({ userId, roleName, body });
  }

  @Put(':id')
  @ZodResponse({ type: ProductResponseDTO })
  updateProduct(
    @ActiveUser() user: AccessTokenPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductBodyDTO,
  ): Promise<ProductResponseDTO> {
    const { userId, roleName } = user;
    return this.manageProductService.updateProduct({
      userId,
      productId: id,
      body,
      roleName,
    });
  }

  @Delete(':id')
  @ZodResponse({ type: MessageResponseDTO })
  deleteProduct(
    @ActiveUser() user: AccessTokenPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MessageResponseDTO> {
    const { userId, roleName } = user;
    return this.manageProductService.deleteProduct({
      userId,
      productId: id,
      roleName,
    });
  }
}
