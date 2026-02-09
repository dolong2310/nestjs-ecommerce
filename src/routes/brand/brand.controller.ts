import {
  BrandIncludeTranslationsResponseDTO,
  CreateBrandBodyDTO,
  GetBrandsIncludeTranslationsResponseDTO,
  GetBrandsQueryDTO,
  UpdateBrandBodyDTO,
} from '@/routes/brand/brand.dto';
import { BrandService } from '@/routes/brand/brand.service';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { Public } from '@/shared/decorators/auth.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { ZodResponse } from 'nestjs-zod';

@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @Public()
  @ZodResponse({ type: GetBrandsIncludeTranslationsResponseDTO })
  getBrands(@Query() query: GetBrandsQueryDTO): Promise<GetBrandsIncludeTranslationsResponseDTO> {
    const { page, limit } = query;
    const lang = I18nContext.current()!.lang;
    return this.brandService.getBrands({ page, limit, lang });
  }

  @Get(':id')
  @Public()
  @ZodResponse({ type: BrandIncludeTranslationsResponseDTO })
  getBrand(@Param('id', ParseIntPipe) id: number): Promise<BrandIncludeTranslationsResponseDTO> {
    const lang = I18nContext.current()!.lang;
    return this.brandService.getBrandById(id, lang);
  }

  @Post()
  @ZodResponse({ type: BrandIncludeTranslationsResponseDTO })
  createBrand(
    @Body() body: CreateBrandBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<BrandIncludeTranslationsResponseDTO> {
    return this.brandService.createBrand({ userId, body });
  }

  @Put(':id')
  @ZodResponse({ type: BrandIncludeTranslationsResponseDTO })
  updateBrand(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateBrandBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<BrandIncludeTranslationsResponseDTO> {
    return this.brandService.updateBrand({ userId, id, body });
  }

  @Delete(':id')
  @ZodResponse({ type: MessageResponseDTO })
  deleteBrand(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser('userId') userId: number,
  ): Promise<MessageResponseDTO> {
    return this.brandService.deleteBrand({ userId, id });
  }
}
