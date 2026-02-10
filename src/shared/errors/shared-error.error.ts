import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';

export const InvalidApiKeyException = new UnauthorizedException([
  {
    field: 'xApiKey',
    message: 'Error.InvalidApiKey', // Invalid API key
  },
]);

export const InvalidPaymentApiKeyException = new UnauthorizedException([
  {
    field: 'paymentApiKey',
    message: 'Error.InvalidPaymentApiKey', // Invalid payment API key
  },
]);

export const AuthenticationRequiredException = new UnauthorizedException([
  {
    field: 'authentication',
    message: 'Error.AuthenticationRequired', // Authentication required
  },
]);

export const AccessTokenExpiredException = new UnauthorizedException([
  {
    field: 'accessToken',
    message: 'Error.AccessTokenExpired', // Access token has expired
  },
]);

export const InvalidAccessTokenException = new UnauthorizedException([
  {
    field: 'accessToken',
    message: 'Error.InvalidAccessToken', // Invalid access token
  },
]);

export const UserNotFoundException = new NotFoundException([
  {
    field: 'userId',
    message: 'Error.UserNotFound', // User not found
  },
]);

export const InvalidPasswordException = new BadRequestException([
  {
    field: 'password',
    message: 'Error.InvalidPassword', // Invalid password
  },
]);

export const VersionConflictException = new ConflictException('Error.VersionConflict');

export const ServerOverloadedException = new ServiceUnavailableException([
  {
    field: 'lock',
    message: 'Error.ServerOverloaded', // Server is currently overloaded, please try again later
  },
]);

export const RoleNotFoundException = new NotFoundException([
  {
    field: 'role',
    message: 'Error.RoleNotFound', // Role not found
  },
]);

export const CartItemNotFoundException = new NotFoundException([
  {
    field: 'id',
    message: 'Error.CartItemNotFound',
  },
]);

export const ProductNotFoundException = new NotFoundException([
  {
    field: 'id',
    message: 'Error.ProductNotFound',
  },
]);
