import { NotFoundException } from '@nestjs/common';

export const ProductNotFoundException = new NotFoundException([
  {
    field: 'id',
    message: 'Error.ProductNotFound',
  },
]);
