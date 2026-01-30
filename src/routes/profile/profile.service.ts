import { ChangePasswordBodyType, UpdateProfileBodyType } from '@/routes/profile/profile.type';
import { InvalidPasswordException, UserNotFoundException } from '@/shared/errors/shared-error.error';
import { SharedUserRepository } from '@/shared/repositories/shared-user.repo';
import { HashingService } from '@/shared/services/hashing.service';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { GetUserProfileResponseType, UserType } from '@/shared/types/shared-user.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfileService {
  constructor(
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly hashingService: HashingService,
  ) {}

  async getProfile(userId: number): Promise<GetUserProfileResponseType> {
    try {
      const user = await this.sharedUserRepository.findUniqueIncludeRolePermissions({ id: userId });

      if (!user) {
        throw UserNotFoundException;
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userId: number, body: UpdateProfileBodyType): Promise<UserType> {
    try {
      const user = await this.sharedUserRepository.update(
        { id: userId },
        {
          ...body,
          updatedById: userId,
        },
      );

      if (!user) {
        throw UserNotFoundException;
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(userId: number, body: ChangePasswordBodyType): Promise<MessageResponseType> {
    try {
      // 1. Lấy user trong database
      const user = await this.sharedUserRepository.findUnique({ id: userId });

      if (!user) {
        throw UserNotFoundException;
      }

      // 2. So sánh password body.password với user.password
      const isPasswordValid = await this.hashingService.compare(body.password, user.password);

      if (!isPasswordValid) {
        throw InvalidPasswordException;
      }

      // 3. Hash newPassword
      const hashedPassword = await this.hashingService.hash(body.newPassword);

      // 4. Cập nhật newPassword vào database
      await this.sharedUserRepository.update(
        { id: userId },
        {
          password: hashedPassword,
          updatedById: userId,
        },
      );

      // 5. Trả về message thành công
      return {
        message: 'Success.PasswordChanged',
      };
    } catch (error) {
      throw error;
    }
  }
}
