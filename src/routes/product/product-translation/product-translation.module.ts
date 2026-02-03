import { ProductTranslationController } from '@/routes/product/product-translation/product-translation.controller';
import { ProductTranslationRepository } from '@/routes/product/product-translation/product-translation.repo';
import { ProductTranslationService } from '@/routes/product/product-translation/product-translation.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [ProductTranslationController],
  providers: [ProductTranslationRepository, ProductTranslationService],
})
export class ProductTranslationModule {}
