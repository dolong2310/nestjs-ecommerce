import {
  CategoryTranslationResponseDTO,
  CreateCategoryTranslationBodyDTO,
  UpdateCategoryTranslationBodyDTO,
} from '@/routes/category/category-translation/category-translation.dto';
import { CategoryTranslationService } from '@/routes/category/category-translation/category-translation.service';
import { CURRENT_VERSION } from '@/shared/constants/version.constant';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

@Controller({ path: 'category-translation', version: CURRENT_VERSION })
export class CategoryTranslationController {
  constructor(private readonly categoryTranslationService: CategoryTranslationService) {}

  @Get(':id')
  @ZodResponse({ type: CategoryTranslationResponseDTO })
  getCategoryTranslation(@Param('id', ParseIntPipe) id: number): Promise<CategoryTranslationResponseDTO> {
    return this.categoryTranslationService.getCategoryTranslationById(id);
  }

  @Post()
  @ZodResponse({ type: CategoryTranslationResponseDTO })
  createCategoryTranslation(
    @Body() body: CreateCategoryTranslationBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<CategoryTranslationResponseDTO> {
    return this.categoryTranslationService.createCategoryTranslation({
      userId,
      body,
    });
  }

  @Put(':id')
  @ZodResponse({ type: CategoryTranslationResponseDTO })
  updateCategoryTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCategoryTranslationBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<CategoryTranslationResponseDTO> {
    return this.categoryTranslationService.updateCategoryTranslation({
      id,
      userId,
      body,
    });
  }

  @Delete(':id')
  @ZodResponse({ type: MessageResponseDTO })
  deleteCategoryTranslation(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser('userId') userId: number,
  ): Promise<MessageResponseDTO> {
    return this.categoryTranslationService.deleteCategoryTranslation({
      id,
      userId,
    });
  }
}
