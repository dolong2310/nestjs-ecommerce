import {
  CategoryIncludeTranslationsResponseDTO,
  CreateCategoryBodyDTO,
  GetCategoriesIncludeTranslationsResponseDTO,
  GetCategoriesQueryDTO,
  UpdateCategoryBodyDTO,
} from '@/routes/category/category.dto';
import { CategoryService } from '@/routes/category/category.service';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { Public } from '@/shared/decorators/auth.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @Public()
  @ZodSerializerDto(GetCategoriesIncludeTranslationsResponseDTO)
  getCategories(@Query() query: GetCategoriesQueryDTO): Promise<GetCategoriesIncludeTranslationsResponseDTO> {
    const lang = I18nContext.current()!.lang;
    return this.categoryService.getCategories({ parentCategoryId: query.parentCategoryId, lang });
  }

  @Get(':id')
  @Public()
  @ZodSerializerDto(CategoryIncludeTranslationsResponseDTO)
  getCategory(@Param('id', ParseIntPipe) id: number): Promise<CategoryIncludeTranslationsResponseDTO> {
    const lang = I18nContext.current()!.lang;
    return this.categoryService.getCategoryById({ id, languageId: lang });
  }

  @Post()
  @ZodSerializerDto(CategoryIncludeTranslationsResponseDTO)
  createCategory(
    @Body() body: CreateCategoryBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<CategoryIncludeTranslationsResponseDTO> {
    return this.categoryService.createCategory({ userId, body });
  }

  @Put(':id')
  @ZodSerializerDto(CategoryIncludeTranslationsResponseDTO)
  updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCategoryBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<CategoryIncludeTranslationsResponseDTO> {
    return this.categoryService.updateCategory({ userId, id, body });
  }

  @Delete(':id')
  @ZodSerializerDto(MessageResponseDTO)
  deleteCategory(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser('userId') userId: number,
  ): Promise<MessageResponseDTO> {
    return this.categoryService.deleteCategory({ userId, id });
  }
}
