import {
  CancelOrderResponseDTO,
  CreateOrderBodyDTO,
  CreateOrderResponseDTO,
  GetOrderParamsDTO,
  GetOrderResponseDTO,
  GetOrdersQueryDTO,
  GetOrdersResponseDTO,
} from '@/routes/order/order.dto';
import { OrderService } from '@/routes/order/order.service';
import { CURRENT_VERSION } from '@/shared/constants/version.constant';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { EmptyBodyDTO } from '@/shared/dtos/request.dto';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

@Controller({ path: 'orders', version: CURRENT_VERSION })
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ZodResponse({ type: GetOrdersResponseDTO })
  async getOrders(
    @Query() query: GetOrdersQueryDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<GetOrdersResponseDTO> {
    return this.orderService.getOrders({ userId, query });
  }

  @Get(':id')
  @ZodResponse({ type: GetOrderResponseDTO })
  async getOrderById(
    @Param() params: GetOrderParamsDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<GetOrderResponseDTO> {
    return this.orderService.getOrderById({ userId, id: params.id });
  }

  @Post()
  @ZodResponse({ type: CreateOrderResponseDTO })
  async createOrder(
    @Body() body: CreateOrderBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<CreateOrderResponseDTO> {
    return this.orderService.createOrder({ userId, body });
  }

  @Put(':id/cancel')
  @ZodResponse({ type: CancelOrderResponseDTO })
  async cancelOrder(
    @Param() params: GetOrderParamsDTO,
    @ActiveUser('userId') userId: number,
    @Body() _: EmptyBodyDTO,
  ): Promise<CancelOrderResponseDTO> {
    return this.orderService.cancelOrder({ userId, id: params.id });
  }
}
