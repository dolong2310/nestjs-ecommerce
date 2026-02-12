import { PermissionAlreadyExistsException, PermissionNotFoundException } from '@/routes/permission/permission.error';
import { PermissionRepository } from '@/routes/permission/permission.repo';
import {
  CreatePermissionBodyType,
  GetPermissionResponseType,
  GetPermissionsResponseType,
  PermissionQueryType,
  UpdatePermissionBodyType,
} from '@/routes/permission/permission.type';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helpers';
import type { PermissionType } from '@/shared/types/shared-permission.type';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getPermissions({ page, limit }: PermissionQueryType): Promise<GetPermissionsResponseType> {
    try {
      return await this.permissionRepository.findMany({ page, limit });
    } catch (error) {
      throw error;
    }
  }

  async getPermissionById(id: number): Promise<GetPermissionResponseType> {
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

  async createPermission(payload: { userId: number; body: CreatePermissionBodyType }): Promise<PermissionType> {
    try {
      return await this.permissionRepository.create(payload);
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException;
      }
      throw error;
    }
  }

  async updatePermission(payload: {
    userId: number;
    id: number;
    body: UpdatePermissionBodyType;
  }): Promise<PermissionType> {
    try {
      const permission = await this.permissionRepository.update(payload);
      const { roles } = permission;

      await this._clearCache(roles);

      return permission;
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

  async deletePermission(payload: { userId: number; id: number }): Promise<MessageResponseType> {
    try {
      const isHardDelete = true;
      const permission = await this.permissionRepository.delete(payload, isHardDelete);
      const { roles } = permission;

      await this._clearCache(roles);

      return {
        message: 'Success.PermissionDeleted',
      };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw PermissionNotFoundException;
      }
      throw error;
    }
  }

  private async _clearCache(roles: { id: number }[]): Promise<void> {
    await Promise.all(
      roles.map((role) => {
        const cacheKey = `role:${role.id}`;
        this.cacheManager.del(cacheKey);
      }),
    );
  }
}
