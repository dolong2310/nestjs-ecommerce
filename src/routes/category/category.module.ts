import { CategoryController } from '@/routes/category/category.controller';
import { CategoryRepository } from '@/routes/category/category.repo';
import { CategoryService } from '@/routes/category/category.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [CategoryController],
  providers: [CategoryRepository, CategoryService],
})
export class CategoryModule {}
