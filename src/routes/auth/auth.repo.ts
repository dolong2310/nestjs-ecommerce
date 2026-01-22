import { PrismaService } from "@/shared/services/prisma.service";
import { Injectable } from "@nestjs/common";
import { CreateRefreshTokenBodyType, CreateRefreshTokenResponseType, RefreshTokenType, RegisterBodyType, UserType } from "./auth.model";


@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) { }

  createUser(body: Omit<RegisterBodyType, 'confirmPassword'> & Pick<UserType, 'roleId'>): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
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

  findUserByEmail(email: string): Promise<UserType | null> {
    return this.prismaService.user.findUnique({
      where: { email },
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
        userId: body.userId,
        token: body.token,
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
}