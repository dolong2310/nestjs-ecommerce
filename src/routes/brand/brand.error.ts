import { NotFoundException } from '@nestjs/common';

export const BrandNotFoundException = new NotFoundException([
  {
    field: 'id',
    message: 'Error.BrandNotFound',
  },
]);
