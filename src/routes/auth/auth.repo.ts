import { CreateDeviceBodyType, CreateRefreshTokenBodyType, CreateRefreshTokenResponseType, CreateVerificationCodeBodyType, DeviceType, RefreshTokenType, RegisterBodyType, RoleType, VerificationCodeType } from "@/routes/auth/auth.model";
import { EnumVerificationCodeType } from "@/shared/constants/auth.constant";
import { UserType } from "@/shared/models/shared-user.model";
import { PrismaService } from "@/shared/services/prisma.service";
import { Injectable } from "@nestjs/common";


@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) { }

  createUser(body: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId'>): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return this.prismaService.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: body.password,
        phoneNumber: body.phoneNumber,
        roleId: body.roleId,
      },
      omit: {
        password: true,
        totpSecret: true,
      }
    });
  }

  findUserById(id: number): Promise<Omit<UserType, 'password' | 'totpSecret'> | null> {
    return this.prismaService.user.findUnique({
      where: { id },
      omit: {
        password: true,
        totpSecret: true,
      }
    });
  }

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

  findRefreshTokenByToken(token: string): Promise<RefreshTokenType | null> {
    return this.prismaService.refreshToken.findUnique({
      where: { token },
    });
  }

  deleteRefreshToken(token: string): Promise<RefreshTokenType> {
    return this.prismaService.refreshToken.delete({
      where: { token },
    });
  }

  createVerificationCode(body: CreateVerificationCodeBodyType): Promise<VerificationCodeType> {
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

  deleteVerificationCode(id: number): Promise<VerificationCodeType> {
    return this.prismaService.verificationCode.delete({
      where: { id },
    });
  }

  createDevice(body: CreateDeviceBodyType): Promise<DeviceType> {
    return this.prismaService.device.create({
      data: body,
    });
  }

  findDeviceUnique(uniqueInput: { id: number }): Promise<DeviceType | null> {
    return this.prismaService.device.findUnique({
      where: uniqueInput,
    });
  }

  findUserUniqueIncludeRole(uniqueInput: { id: number } | { email: string }): Promise<(UserType & { role: RoleType }) | null> {
    return this.prismaService.user.findUnique({
      where: uniqueInput,
      include: {
        role: true,
      },
    }) as Promise<(UserType & { role: RoleType }) | null>;
  }

  findRoleUnique(uniqueInput: { id: number } | { name: string }) {
    return this.prismaService.role.findUnique({
      where: uniqueInput,
    });
  }
}