import { CategoryTranslationController } from '@/routes/category/category-translation/category-translation.controller';
import { CategoryTranslationRepository } from '@/routes/category/category-translation/category-translation.repo';
import { CategoryTranslationService } from '@/routes/category/category-translation/category-translation.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [CategoryTranslationController],
  providers: [CategoryTranslationRepository, CategoryTranslationService],
})
export class CategoryTranslationModule {}
