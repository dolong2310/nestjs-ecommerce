import {
  ProductTranslationResponseDTO,
  CreateProductTranslationBodyDTO,
  UpdateProductTranslationBodyDTO,
} from '@/routes/product/product-translation/product-translation.dto';
import { ProductTranslationService } from '@/routes/product/product-translation/product-translation.service';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('product-translation')
export class ProductTranslationController {
  constructor(private readonly productTranslationService: ProductTranslationService) {}

  @Get(':id')
  @ZodSerializerDto(ProductTranslationResponseDTO)
  getProductTranslation(@Param('id', ParseIntPipe) id: number): Promise<ProductTranslationResponseDTO> {
    return this.productTranslationService.getProductTranslationById(id);
  }

  @Post()
  @ZodSerializerDto(ProductTranslationResponseDTO)
  createProductTranslation(
    @Body() body: CreateProductTranslationBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<ProductTranslationResponseDTO> {
    return this.productTranslationService.createProductTranslation({
      userId,
      body,
    });
  }

  @Put(':id')
  @ZodSerializerDto(ProductTranslationResponseDTO)
  updateProductTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductTranslationBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<ProductTranslationResponseDTO> {
    return this.productTranslationService.updateProductTranslation({
      id,
      userId,
      body,
    });
  }

  @Delete(':id')
  @ZodSerializerDto(MessageResponseDTO)
  deleteProductTranslation(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser('userId') userId: number,
  ): Promise<MessageResponseDTO> {
    return this.productTranslationService.deleteProductTranslation({
      id,
      userId,
    });
  }
}
