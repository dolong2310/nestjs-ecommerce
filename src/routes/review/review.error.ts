import { BadRequestException, NotFoundException } from '@nestjs/common';

export const OrderNotFoundException = new NotFoundException('Order not found');
export const OrderNotDeliveredException = new BadRequestException('Order must be delivered before reviewing');
export const ReviewNotFoundException = new NotFoundException('Review not found');
export const ReviewUpdateCountExceededException = new BadRequestException('Review update count exceeded');
export const ReviewAlreadyExistsException = new BadRequestException('Review already exists');
