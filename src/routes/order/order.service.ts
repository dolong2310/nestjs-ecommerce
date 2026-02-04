import { OrderNotFoundException } from '@/routes/order/order.error';
import { OrderRepository } from '@/routes/order/order.repo';
import {
  CancelOrderResponseType,
  CreateOrderBodyType,
  CreateOrderResponseType,
  GetOrderResponseType,
  GetOrdersQueryType,
  GetOrdersResponseType,
} from '@/routes/order/order.type';
import { isNotFoundPrismaError } from '@/shared/helpers';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async getOrders(props: { userId: number; query: GetOrdersQueryType }): Promise<GetOrdersResponseType> {
    try {
      const orders = await this.orderRepository.findMany(props);
      return orders;
    } catch (error) {
      throw error;
    }
  }

  async createOrder(props: { userId: number; body: CreateOrderBodyType }): Promise<CreateOrderResponseType> {
    try {
      const order = await this.orderRepository.create(props);
      return order;
    } catch (error) {
      throw error;
    }
  }

  async getOrderById(props: { userId: number; id: number }): Promise<GetOrderResponseType> {
    try {
      const order = await this.orderRepository.findById(props);
      if (!order) {
        throw OrderNotFoundException;
      }
      return order;
    } catch (error) {
      throw error;
    }
  }

  async cancelOrder(props: { userId: number; id: number }): Promise<CancelOrderResponseType> {
    try {
      const order = await this.orderRepository.cancel(props);
      return order;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw OrderNotFoundException;
      }
      throw error;
    }
  }
}
