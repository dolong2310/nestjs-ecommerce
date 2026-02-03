import { ManageProductController } from '@/routes/product/manage-product.controller';
import { ManageProductService } from '@/routes/product/manage-product.service';
import { ProductController } from '@/routes/product/product.controller';
import { ProductRepository } from '@/routes/product/product.repo';
import { ProductService } from '@/routes/product/product.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [ProductController, ManageProductController],
  providers: [ProductRepository, ProductService, ManageProductService],
})
export class ProductModule {}
