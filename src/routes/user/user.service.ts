import { RoleNotFoundException, UserAlreadyExistsException, UserCannotBeSetAsAdminException, UserCannotUpdateOrDeleteYourselfException, UserNotFoundException } from '@/routes/user/user.error';
import { UserRepository } from '@/routes/user/user.repo';
import { CreateUserBodyType, GetUsersResponseType, UpdateUserBodyType, UserQueryType } from '@/routes/user/user.type';
import { RoleName, RoleNameType } from '@/shared/constants/role.constant';
import { isForeignKeyConstraintPrismaError, isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helpers';
import { SharedRoleRepository } from '@/shared/repositories/shared-role.repo';
import { SharedUserRepository, UserIncludeRolePermissionsType } from '@/shared/repositories/shared-user.repo';
import { HashingService } from '@/shared/services/hashing.service';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import type { UserType } from '@/shared/types/shared-user.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly sharedRoleRepository: SharedRoleRepository,
    private readonly hashingService: HashingService,
  ) { }

  async getUsers({ page, limit }: UserQueryType): Promise<GetUsersResponseType> {
    try {
      return await this.userRepository.findMany({ page, limit });
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id: number): Promise<UserIncludeRolePermissionsType> {
    try {
      // TODO: Sửa lại sharedUserRepository.findUnique nếu cần
      const user = await this.sharedUserRepository.findUniqueIncludeRolePermissions({
        id,
        deletedAt: null
      });
      if (!user) {
        throw UserNotFoundException;
      }
      return user;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw UserNotFoundException;
      }
      throw error;
    }
  }

  async createUser(payload: {
    userId: number, // user id from access token
    roleName: RoleNameType, // Current role name of user who is sending request
    body: CreateUserBodyType,
  }): Promise<UserType> {
    try {
      // 1. Check role: Chỉ có admin mới có quyền tạo user có role là admin
      await this._verifyRole({ roleName: payload.roleName, bodyRoleId: payload.body.roleId });

      // 2. Hash password
      const hashedPassword = await this.hashingService.hash(payload.body.password);
      payload.body.password = hashedPassword;

      // 3. Create user
      return await this.userRepository.create(payload);
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw RoleNotFoundException;
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw UserAlreadyExistsException;
      }
      throw error;
    }
  }

  async updateUser(payload: {
    userId: number, // user id from access token
    roleName: RoleNameType, // Current role name of user who is sending request
    id: number, // user id from params
    body: UpdateUserBodyType
  }): Promise<UserType> {
    try {
      // 1. Check if user is trying to update themself
      this._verifyCannotUpdateOrDeleteYourself({
        paramsUserId: payload.id,
        currentUserId: payload.userId,
      });

      // 2. Get role id by user id
      const roleId = await this._getRoleIdByCurrentUserId(payload.userId);

      // 3. Check role: Chỉ có admin mới có quyền update user có role là admin
      // Lấy roleId trực tiếp từ currentUser để tránh việc cố tình truyền sai roleId trong body request
      await this._verifyRole({ roleName: payload.roleName, bodyRoleId: roleId });

      // 4. Update user
      const user = await this.sharedUserRepository.update(
        {
          id: payload.id,
          deletedAt: null
        },
        {
          email: payload.body.email,
          name: payload.body.name,
          // password: payload.body.password,
          phoneNumber: payload.body.phoneNumber,
          avatar: payload.body.avatar,
          roleId: payload.body.roleId,
          status: payload.body.status,
          updatedById: payload.userId,
        }
      );

      if (!user) {
        throw UserNotFoundException;
      }

      // 5. Return user
      return user;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw UserNotFoundException;
      }
      if (isForeignKeyConstraintPrismaError(error)) {
        throw RoleNotFoundException;
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw UserAlreadyExistsException;
      }
      throw error;
    }
  }

  async deleteUser(payload: {
    userId: number, // user id from access token
    roleName: RoleNameType, // Current role name of user who is sending request
    id: number, // user id from params
  }): Promise<MessageResponseType> {
    try {
      // 1. Check if user is trying to delete themself
      this._verifyCannotUpdateOrDeleteYourself({
        paramsUserId: payload.id,
        currentUserId: payload.userId,
      });

      // 2. Get role id by user id
      const roleId = await this._getRoleIdByCurrentUserId(payload.userId);

      // 3. Check role: Chỉ có admin mới có quyền delete user có role là admin
      // Lấy roleId trực tiếp từ currentUser để tránh việc cố tình truyền sai roleId trong body request
      await this._verifyRole({ roleName: payload.roleName, bodyRoleId: roleId });

      // 4. Delete user
      const isHardDelete = true;
      await this.userRepository.delete(payload, isHardDelete);

      // 5. Return success
      return {
        message: 'Success.UserDeleted',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw UserNotFoundException;
      }
      throw error;
    }
  }

  /**
   * Function này kiểm tra xem người thực hiện có quyền tác động đến người khácc không.
   * Người thực hiện có role là admin mới được quyền: tạo admin user, update roleId của các user khác, xoá user.
   * Còn nếu người thực hiện không phải role admin thì không được phép tác động đến người có role là admin
   */
  private async _verifyRole({ roleName, bodyRoleId }: { roleName: RoleNameType, bodyRoleId: number }): Promise<boolean> {
    try {
      // Current user is admin => ALLOW all actions
      if (roleName === RoleName.Admin) {
        return true;
      } else {
        // Or current user is not admin && body role id is admin => NOT ALLOW to action
        const adminRoleId = await this.sharedRoleRepository.getAdminRoleId();
        if (bodyRoleId === adminRoleId) {
          throw UserCannotBeSetAsAdminException;
        }
        // Or current user is not admin && body role id is not admin => ALLOW to action
        return true;
      }
    } catch (error) {
      throw error;
    }
  }

  private _verifyCannotUpdateOrDeleteYourself({
    paramsUserId,
    currentUserId,
  }: {
    paramsUserId: number,
    currentUserId: number,
  }): boolean {
    if (paramsUserId === currentUserId) {
      throw UserCannotUpdateOrDeleteYourselfException;
    }
    return true;
  }

  private async _getRoleIdByCurrentUserId(userId: number): Promise<number> {
    const currentUser = await this.sharedUserRepository.findUnique({
      id: userId,
      deletedAt: null
    });

    if (!currentUser) {
      throw UserNotFoundException;
    }

    return currentUser.roleId;
  }
}
