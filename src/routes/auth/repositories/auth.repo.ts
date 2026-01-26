import { CreateDeviceBodyType, CreateOtpCodeBodyType, CreateRefreshTokenBodyType, CreateRefreshTokenResponseType, DeviceType, OtpCodeType, RefreshTokenType, RegisterBodyType, RoleType } from "@/routes/auth/types/auth.type";
import { EnumOtpCodeType } from "@/shared/constants/auth.constant";
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

  updateUser(where: { id: number } | { email: string }, data: Partial<Omit<UserType, 'id'>>): Promise<UserType> {
    return this.prismaService.user.update({
      where,
      data,
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

  findUserUniqueIncludeRole(where: { id: number } | { email: string }): Promise<(UserType & { role: RoleType }) | null> {
    return this.prismaService.user.findUnique({
      where,
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

  findRefreshTokenUnique(where: { token: string }): Promise<RefreshTokenType | null> {
    return this.prismaService.refreshToken.findUnique({
      where,
    });
  }

  findRefreshTokenUniqueIncludeUserRole(where: { token: string }): Promise<(RefreshTokenType & { user: UserType & { role: RoleType } }) | null> {
    return this.prismaService.refreshToken.findUnique({
      where,
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

  deleteRefreshToken(where: { token: string }): Promise<RefreshTokenType> {
    return this.prismaService.refreshToken.delete({
      where,
    });
  }

  // Otp Code
  createOtpCode(body: CreateOtpCodeBodyType): Promise<Omit<OtpCodeType, 'code'>> {
    // upsert là nếu chưa có thì tạo mới hoặc có rồi thì cập nhật
    // email là unique nên chỉ có thể có 1 otp code cho 1 email (không thể tạo thêm -> auto throw error)
    return this.prismaService.otpCode.upsert({
      where: {
        // email: body.email, // vì email không là unique nữa nên không thể dùng để where
        // dùng email_code_type để where vì email_code_type là unique trong schema prisma
        email_code_type: {
          email: body.email,
          code: body.code,
          type: body.type,
        }
      },
      create: body,
      update: {
        code: body.code,
        expiresAt: body.expiresAt,
      },
      // Tạo thêm otp code cho email đó -> sai vì email là unique
      // data: {
      //   email: body.email,
      //   code: body.code,
      //   type: body.type,
      //   expiresAt: body.expiresAt,
      // },
    });
  }

  findUniqueOtpCode(where: { id: number } | { email_code_type: { email: string, code: string, type: EnumOtpCodeType } }): Promise<OtpCodeType | null> {
    // query theo 3 trường "email, code, type" vì được đánh index
    return this.prismaService.otpCode.findUnique({
      where,
    })
  }

  deleteOtpCode(where: { id: number } | { email_code_type: { email: string, code: string, type: EnumOtpCodeType } }): Promise<OtpCodeType> {
    // query theo 3 trường "email, code, type" vì được đánh index
    return this.prismaService.otpCode.delete({
      where,
    });
  }

  // Device
  createDevice(body: CreateDeviceBodyType): Promise<DeviceType> {
    return this.prismaService.device.create({
      data: body,
    });
  }

  updateDevice(where: { id: number }, body: Partial<DeviceType>): Promise<DeviceType> {
    return this.prismaService.device.update({
      where,
      data: body,
    });
  }

  findDeviceUnique(where: { id: number }): Promise<DeviceType | null> {
    return this.prismaService.device.findUnique({
      where,
    });
  }

  // Role
  findRoleUnique(where: { id: number } | { name: string }) {
    return this.prismaService.role.findUnique({
      where,
    });
  }
}