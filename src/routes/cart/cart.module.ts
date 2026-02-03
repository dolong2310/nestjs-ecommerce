import { CartController } from '@/routes/cart/cart.controller';
import { CartRepository } from '@/routes/cart/cart.repo';
import { CartService } from '@/routes/cart/cart.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [CartController],
  providers: [CartRepository, CartService],
})
export class CartModule {}
