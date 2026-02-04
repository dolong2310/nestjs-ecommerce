import { OrderController } from '@/routes/order/order.controller';
import { OrderRepository } from '@/routes/order/order.repo';
import { OrderService } from '@/routes/order/order.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [OrderController],
  providers: [OrderRepository, OrderService],
})
export class OrderModule {}
