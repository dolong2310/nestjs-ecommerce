import { UserType } from "@/shared/models/shared-user.model";
import { PrismaService } from "@/shared/services/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) { }

  findUnique(uniqueInput: { email: string } | { id: number }): Promise<UserType | null> {
    return this.prismaService.user.findUnique({
      where: uniqueInput,
    });
  }
}