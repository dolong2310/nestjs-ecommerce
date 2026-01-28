import { RoleAlreadyExistsException, RoleNotFoundException } from '@/routes/role/role.error';
import { RoleRepository } from '@/routes/role/role.repo';
import { CreateRoleBodyType, GetRolesResponseType, RoleQueryType, RoleWithPermissionsType, UpdateRoleBodyType } from '@/routes/role/role.type';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helpers';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) { }

  async getRoles(payload: RoleQueryType): Promise<GetRolesResponseType> {
    try {
      return await this.roleRepository.findAll(payload);
    } catch (error) {
      throw error;
    }
  }

  async getRoleById(id: number): Promise<RoleWithPermissionsType> {
    try {
      const role = await this.roleRepository.findOne(id);
      if (!role) {
        throw RoleNotFoundException;
      }
      return role;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw RoleNotFoundException;
      }
      throw error;
    }
  }

  async createRole(payload: { userId: number, body: CreateRoleBodyType }): Promise<RoleWithPermissionsType> {
    try {
      return await this.roleRepository.create(payload);
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException;
      }
      throw error;
    }
  }

  async updateRole(payload: { userId: number, id: number, body: UpdateRoleBodyType }): Promise<RoleWithPermissionsType> {
    try {
      return await this.roleRepository.update(payload);
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw RoleNotFoundException;
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw RoleAlreadyExistsException;
      }
      throw error;
    }
  }

  async deleteRole(payload: { userId: number, id: number }): Promise<MessageResponseType> {
    try {
      const isHardDelete = true;
      await this.roleRepository.delete(payload, isHardDelete);
      return {
        message: 'Success.RoleDeleted',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw RoleNotFoundException;
      }
      throw error;
    }
  }

}
