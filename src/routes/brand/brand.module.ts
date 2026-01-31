import { BrandController } from '@/routes/brand/brand.controller';
import { BrandRepository } from '@/routes/brand/brand.repo';
import { BrandService } from '@/routes/brand/brand.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [BrandController],
  providers: [BrandRepository, BrandService],
})
export class BrandModule {}
