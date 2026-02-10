import {
  BrandTranslationResponseDTO,
  CreateBrandTranslationBodyDTO,
  UpdateBrandTranslationBodyDTO,
} from '@/routes/brand/brand-translation/brand-translation.dto';
import { BrandTranslationService } from '@/routes/brand/brand-translation/brand-translation.service';
import { CURRENT_VERSION } from '@/shared/constants/version.constant';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

@Controller({ path: 'brand-translation', version: CURRENT_VERSION })
export class BrandTranslationController {
  constructor(private readonly brandTranslationService: BrandTranslationService) {}

  @Get(':id')
  @ZodResponse({ type: BrandTranslationResponseDTO })
  getBrandTranslation(@Param('id', ParseIntPipe) id: number): Promise<BrandTranslationResponseDTO> {
    return this.brandTranslationService.getBrandTranslationById(id);
  }

  @Post()
  @ZodResponse({ type: BrandTranslationResponseDTO })
  createBrandTranslation(
    @Body() body: CreateBrandTranslationBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<BrandTranslationResponseDTO> {
    return this.brandTranslationService.createBrandTranslation({
      userId,
      body,
    });
  }

  @Put(':id')
  @ZodResponse({ type: BrandTranslationResponseDTO })
  updateBrandTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateBrandTranslationBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<BrandTranslationResponseDTO> {
    return this.brandTranslationService.updateBrandTranslation({
      id,
      userId,
      body,
    });
  }

  @Delete(':id')
  @ZodResponse({ type: MessageResponseDTO })
  deleteBrandTranslation(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser('userId') userId: number,
  ): Promise<MessageResponseDTO> {
    return this.brandTranslationService.deleteBrandTranslation({
      id,
      userId,
    });
  }
}
