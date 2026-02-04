import { BadRequestException, NotFoundException } from '@nestjs/common';

export const CartItemNotFoundException = new NotFoundException([
  {
    field: 'id',
    message: 'Error.CartItemNotFound',
  },
]);

export const OutOfStockSkuException = new BadRequestException([
  {
    field: 'id',
    message: 'Error.OutOfStockSku',
  },
]);

export const ProductNotFoundException = new NotFoundException([
  {
    field: 'id',
    message: 'Error.ProductNotFound',
  },
]);

export const SkuNotFoundException = new NotFoundException([
  {
    field: 'id',
    message: 'Error.SkuNotFound',
  },
]);

export const InvalidQuantityException = new BadRequestException([
  {
    field: 'quantity',
    message: 'Error.InvalidQuantity',
  },
]);
