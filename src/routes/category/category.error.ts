import { NotFoundException } from '@nestjs/common';

export const CategoryNotFoundException = new NotFoundException([
  {
    field: 'id',
    message: 'Error.CategoryNotFound',
  },
]);
