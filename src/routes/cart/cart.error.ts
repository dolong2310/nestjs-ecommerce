import { BadRequestException, NotFoundException } from '@nestjs/common';

export const OutOfStockSkuException = new BadRequestException([
  {
    field: 'id',
    message: 'Error.OutOfStockSku',
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
