import { PermissionAlreadyExistsException, PermissionNotFoundException } from '@/routes/permission/permission.error';
import { PermissionRepository } from '@/routes/permission/permission.repo';
import { CreatePermissionBodyType, GetPermissionsResponseType, PermissionQueryType, UpdatePermissionBodyType } from '@/routes/permission/permission.type';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helpers';
import type { PermissionType } from '@/shared/types/shared-permission.type';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) { }

  async getPermissions({ page, limit }: PermissionQueryType): Promise<GetPermissionsResponseType> {
    try {
      return await this.permissionRepository.findAll({ page, limit });
    } catch (error) {
      throw error;
    }
  }

  async getPermissionById(id: number): Promise<PermissionType> {
    try {
      const permission = await this.permissionRepository.findOne(id);
      if (!permission) {
        throw PermissionNotFoundException;
      }
      return permission;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw PermissionNotFoundException;
      }
      throw error;
    }
  }

  async createPermission(payload: { userId: number, body: CreatePermissionBodyType }): Promise<PermissionType> {
    try {
      return await this.permissionRepository.create(payload);
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException;
      }
      throw error;
    }
  }

  async updatePermission(payload: { userId: number, id: number, body: UpdatePermissionBodyType }): Promise<PermissionType> {
    try {
      return await this.permissionRepository.update(payload);
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw PermissionNotFoundException;
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException;
      }
      throw error;
    }
  }

  async deletePermission(payload: { userId: number, id: number }): Promise<MessageResponseType> {
    try {
      const isHardDelete = true;
      await this.permissionRepository.delete(payload, isHardDelete);
      return {
        message: 'Success.PermissionDeleted',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw PermissionNotFoundException;
      }
      throw error;
    }
  }

}
