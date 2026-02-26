import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GoneException,
  NotFoundException,
} from '@nestjs/common';

export const LaunchpadNotFoundException = new NotFoundException([
  { field: 'id', message: 'Error.LaunchpadNotFound' },
]);

export const LaunchpadNotLiveException = new BadRequestException([
  { field: 'status', message: 'Error.LaunchpadNotLive' },
]);

export const LaunchpadExpiredException = new GoneException([
  { field: 'endTime', message: 'Error.LaunchpadExpired' },
]);

export const LaunchpadForbiddenException = new ForbiddenException([
  { field: 'id', message: 'Error.LaunchpadForbidden' },
]);

export const LaunchpadCannotEditException = new BadRequestException([
  { field: 'status', message: 'Error.LaunchpadCannotEdit' },
]);

export const LaunchpadCannotDeleteException = new BadRequestException([
  { field: 'status', message: 'Error.LaunchpadCannotDelete' },
]);

export const LaunchpadCannotSubmitException = new BadRequestException([
  { field: 'status', message: 'Error.LaunchpadCannotSubmit' },
]);

export const LaunchpadCannotPublishException = new BadRequestException([
  { field: 'status', message: 'Error.LaunchpadCannotPublish' },
]);

export const LaunchpadCannotApproveException = new BadRequestException([
  { field: 'status', message: 'Error.LaunchpadCannotApprove' },
]);

export const LaunchpadCannotRejectException = new BadRequestException([
  { field: 'status', message: 'Error.LaunchpadCannotReject' },
]);

export const LaunchpadActiveConflictException = new ConflictException([
  { field: 'productId', message: 'Error.LaunchpadActiveConflict' },
]);

export const LaunchpadPurchaseLimitException = new BadRequestException([
  { field: 'launchpadId', message: 'Error.LaunchpadPurchaseLimit' },
]);

export const LaunchpadDiscountRateInvalidException = new BadRequestException([
  { field: 'discountRate', message: 'Error.LaunchpadDiscountRateInvalid' },
]);

export const SkuNotBelongToLaunchpadProductException = new BadRequestException([
  { field: 'skuId', message: 'Error.SkuNotBelongToLaunchpadProduct' },
]);
