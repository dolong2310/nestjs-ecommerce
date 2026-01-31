import {
  BrandTranslationResponseDTO,
  CreateBrandTranslationBodyDTO,
  UpdateBrandTranslationBodyDTO,
} from '@/routes/brand/brand-translation/brand-translation.dto';
import { BrandTranslationService } from '@/routes/brand/brand-translation/brand-translation.service';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('brand-translation')
export class BrandTranslationController {
  constructor(private readonly brandTranslationService: BrandTranslationService) {}

  @Get(':id')
  @ZodSerializerDto(BrandTranslationResponseDTO)
  getBrandTranslation(@Param('id', ParseIntPipe) id: number): Promise<BrandTranslationResponseDTO> {
    return this.brandTranslationService.getBrandTranslationById(id);
  }

  @Post()
  @ZodSerializerDto(BrandTranslationResponseDTO)
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
  @ZodSerializerDto(BrandTranslationResponseDTO)
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
  @ZodSerializerDto(MessageResponseDTO)
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
