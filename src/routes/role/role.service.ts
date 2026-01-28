import { RoleAlreadyExistsException, RoleCannotBeDeletedException, RoleCannotBeUpdatedException, RoleNotFoundException } from '@/routes/role/role.error';
import { RoleRepository } from '@/routes/role/role.repo';
import { CreateRoleBodyType, GetRolesResponseType, RoleQueryType, RoleWithPermissionsType, UpdateRoleBodyType } from '@/routes/role/role.type';
import { RoleName, RoleNameType } from '@/shared/constants/role.constant';
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
      // Không cho bất kỳ ai cập nhật role ADMIN, kể cả user với role ADMIN. Tránh ADMIN này thay đổi permission linh tinh làm mất quyền kiểm soát hệ thống.
      // 1. Lấy role từ database
      const role = await this.getRoleById(payload.id);

      // 2. Kiểm tra xem role có phải là role ADMIN không
      if (RoleName.Admin === role.name as RoleNameType) {
        throw RoleCannotBeUpdatedException;
      }

      // 3. Cập nhật role
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
      // Không cho phép bất kỳ ai có thể xóa 3 role cơ bản [ADMIN, USER, SELLER]. Vì 3 role này chúng ta dùng trong code rất nhiều, ví dụ register là auto role CLIENT
      // 1. Lấy role từ database
      const role = await this.getRoleById(payload.id);

      // 2. Kiểm tra xem role có phải là 3 role cơ bản này không
      if ([RoleName.Admin, RoleName.User, RoleName.Seller].includes(role.name as RoleNameType)) {
        throw RoleCannotBeDeletedException;
      }

      // 3. Xóa role
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
