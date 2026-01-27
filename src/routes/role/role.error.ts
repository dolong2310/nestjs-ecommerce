import { BadRequestException, NotFoundException } from "@nestjs/common";

export const RoleNotFoundException = new NotFoundException([
  {
    field: 'role',
    message: 'Error.RoleNotFound', // Role not found
  }
]);

export const RoleAlreadyExistsException = new BadRequestException([
  {
    field: 'name',
    message: 'Error.RoleAlreadyExists', // Role already exists
  },
]);
