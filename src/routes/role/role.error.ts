import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

export const RoleNotFoundException = new NotFoundException([
  {
    field: 'role',
    message: 'Error.RoleNotFound', // Role not found
  },
]);

export const RoleAlreadyExistsException = new BadRequestException([
  {
    field: 'name',
    message: 'Error.RoleAlreadyExists', // Role already exists
  },
]);

export const RoleCannotBeDeletedException = new ForbiddenException([
  {
    field: 'role',
    message: 'Error.RoleCannotBeDeleted', // Role cannot be deleted
  },
]);

export const RoleCannotBeUpdatedException = new ForbiddenException([
  {
    field: 'role',
    message: 'Error.RoleCannotBeUpdated', // Role cannot be updated
  },
]);
