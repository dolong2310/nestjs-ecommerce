import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

export const NotFoundCouponException = new NotFoundException({
  field: 'id',
  message: 'Error.CouponNotFound',
});

export const CouponCodeAlreadyExistsException = new BadRequestException({
  field: 'code',
  message: 'Error.CouponCodeAlreadyExists',
});

export const CouponNotOwnedException = new ForbiddenException({
  field: 'userId',
  message: 'Error.CouponNotOwned',
});

export const CouponActiveAndHasOrdersException = new ForbiddenException({
  field: 'status',
  message: 'Error.CouponActiveAndHasOrders',
});

export const CouponNotAllowedException = new ForbiddenException({
  field: 'roleName',
  message: 'Error.CouponNotAllowed',
});
