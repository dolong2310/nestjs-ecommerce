import { GetProductResponseDTO, GetProductsQueryDTO, GetProductsResponseDTO } from '@/routes/product/product.dto';
import { ProductService } from '@/routes/product/product.service';
import { CURRENT_VERSION } from '@/shared/constants/version.constant';
import { Public } from '@/shared/decorators/auth.decorator';
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

/**
 * @description: Public access for all users
 */
@Public()
@Controller({ path: 'products', version: CURRENT_VERSION })
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ZodResponse({ type: GetProductsResponseDTO })
  getProducts(@Query() query: GetProductsQueryDTO): Promise<GetProductsResponseDTO> {
    return this.productService.getProducts(query);
  }

  @Get(':id')
  @ZodResponse({ type: GetProductResponseDTO })
  getProductById(@Param('id', ParseIntPipe) id: number): Promise<GetProductResponseDTO> {
    return this.productService.getProductById(id);
  }
}
