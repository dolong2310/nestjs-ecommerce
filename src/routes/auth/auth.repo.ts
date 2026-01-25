import { CreateDeviceBodyType, CreateRefreshTokenBodyType, CreateRefreshTokenResponseType, CreateVerificationCodeBodyType, DeviceType, RefreshTokenType, RegisterBodyType, RoleType, VerificationCodeType } from "@/routes/auth/auth.type";
import { EnumVerificationCodeType } from "@/shared/constants/auth.constant";
import { UserType } from "@/shared/models/shared-user.model";
import { PrismaService } from "@/shared/services/prisma.service";
import { Injectable } from "@nestjs/common";


@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) { }

  // User
  createUser(body: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'avatar' | 'roleId'>): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return this.prismaService.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password,
        phoneNumber: body.phoneNumber,
        avatar: body.avatar,
        roleId: body.roleId,
      },
      omit: {
        password: true,
        totpSecret: true,
      }
    });
  }

  createUserIncludeRole(body: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'avatar' | 'roleId'>): Promise<(UserType & { role: RoleType })> {
    // Tại sao không omit password và totpSecret?
    // Vì khi tạo user mới ở googleService -> method authCallback -> biến let user khi gán lại ở createUserIncludeRole phải cùng type trả về với method findUserUniqueIncludeRole
    return this.prismaService.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password,
        phoneNumber: body.phoneNumber,
        avatar: body.avatar,
        roleId: body.roleId,
      },
      include: {
        role: true,
      }
    });
  }

  findUserUniqueIncludeRole(uniqueInput: { id: number } | { email: string }): Promise<(UserType & { role: RoleType }) | null> {
    return this.prismaService.user.findUnique({
      where: uniqueInput,
      // include: Join Role table
      include: {
        role: true,
      },
    });
  }

  // Refresh Token
  createRefreshToken(body: CreateRefreshTokenBodyType): Promise<CreateRefreshTokenResponseType> {
    return this.prismaService.refreshToken.create({
      data: {
        token: body.token,
        userId: body.userId,
        deviceId: body.deviceId,
        expiresAt: body.expiresAt,
      },
    });
  }

  findRefreshTokenUnique(uniqueInput: { token: string }): Promise<RefreshTokenType | null> {
    return this.prismaService.refreshToken.findUnique({
      where: uniqueInput,
    });
  }

  findRefreshTokenUniqueIncludeUserRole(uniqueInput: { token: string }): Promise<(RefreshTokenType & { user: UserType & { role: RoleType } }) | null> {
    return this.prismaService.refreshToken.findUnique({
      where: uniqueInput,
      // include: Join User table
      include: {
        user: {
          // include: Join Role table from User table
          include: {
            role: true,
          }
        }
      }
    });
  }

  deleteRefreshToken(uniqueInput: { token: string }): Promise<RefreshTokenType> {
    return this.prismaService.refreshToken.delete({
      where: uniqueInput,
    });
  }

  // Verification Code
  createVerificationCode(body: CreateVerificationCodeBodyType): Promise<Omit<VerificationCodeType, 'code'>> {
    // upsert là nếu chưa có thì tạo mới hoặc có rồi thì cập nhật
    // email là unique nên chỉ có thể có 1 verification code cho 1 email (không thể tạo thêm -> auto throw error)
    return this.prismaService.verificationCode.upsert({
      where: {
        email: body.email,
      },
      create: body,
      update: {
        code: body.code,
        expiresAt: body.expiresAt,
      },
      // Tạo thêm verification code cho email đó -> sai vì email là unique
      // data: {
      //   email: body.email,
      //   code: body.code,
      //   type: body.type,
      //   expiresAt: body.expiresAt,
      // },
    });
  }

  findUniqueVerificationCode(uniqueInput: { email: string } | { id: number } | { email: string, code: string, type: EnumVerificationCodeType }): Promise<VerificationCodeType | null> {
    // query theo "email" hoặc "id" hoặc "email, code, type" vì được đánh index
    return this.prismaService.verificationCode.findUnique({
      where: uniqueInput,
    })
  }

  deleteVerificationCode(uniqueInput: { id: number }): Promise<VerificationCodeType> {
    return this.prismaService.verificationCode.delete({
      where: uniqueInput,
    });
  }

  // Device
  createDevice(body: CreateDeviceBodyType): Promise<DeviceType> {
    return this.prismaService.device.create({
      data: body,
    });
  }

  updateDevice(deviceId: number, body: Partial<DeviceType>): Promise<DeviceType> {
    return this.prismaService.device.update({
      where: { id: deviceId },
      data: body,
    });
  }

  findDeviceUnique(uniqueInput: { id: number }): Promise<DeviceType | null> {
    return this.prismaService.device.findUnique({
      where: uniqueInput,
    });
  }

  // Role
  findRoleUnique(uniqueInput: { id: number } | { name: string }) {
    return this.prismaService.role.findUnique({
      where: uniqueInput,
    });
  }
}