import { BrandTranslationController } from '@/routes/brand/brand-translation/brand-translation.controller';
import { BrandTranslationRepository } from '@/routes/brand/brand-translation/brand-translation.repo';
import { BrandTranslationService } from '@/routes/brand/brand-translation/brand-translation.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [BrandTranslationController],
  providers: [BrandTranslationRepository, BrandTranslationService],
})
export class BrandTranslationModule {}
