import { BadRequestException, NotFoundException } from "@nestjs/common";

export const PermissionNotFoundException = new NotFoundException([
  {
    field: 'permission',
    message: 'Error.PermissionNotFound', // Permission not found
  }
]);

export const PermissionAlreadyExistsException = new BadRequestException([
  {
    field: 'path',
    message: 'Error.PermissionAlreadyExists', // Permission already exists
  },
  {
    field: 'method',
    message: 'Error.PermissionAlreadyExists', // Permission already exists
  }
]);
