import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";

export const UserNotFoundException = new NotFoundException([
  {
    field: 'user',
    message: 'Error.UserNotFound', // User not found
  },
]);

export const UserAlreadyExistsException = new BadRequestException([
  {
    field: 'email',
    message: 'Error.UserAlreadyExists', // User already exists
  },
]);

export const UserCannotBeDeletedException = new ForbiddenException([
  {
    field: 'user',
    message: 'Error.UserCannotBeDeleted', // User cannot be deleted
  }
]);

export const UserCannotBeUpdatedException = new ForbiddenException([
  {
    field: 'user',
    message: 'Error.UserCannotBeUpdated', // User cannot be updated
  }
]);

// Chỉ Admin mới có thể đặt role là ADMIN
export const UserCannotBeSetAsAdminException = new ForbiddenException([
  {
    field: 'user',
    message: 'Error.UserCannotBeSetAsAdmin', // User cannot be set as admin
  }
]);

export const RoleNotFoundException = new NotFoundException([
  {
    field: 'roleId',
    message: 'Error.RoleNotFound', // Role not found
  },
]);

export const UserCannotUpdateOrDeleteYourselfException = new ForbiddenException('Error.UserCannotUpdateOrDeleteYourself');
