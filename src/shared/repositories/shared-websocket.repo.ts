import { PrismaService } from '@/shared/services/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SharedWebSocketRepository {
  constructor(private readonly prismaService: PrismaService) {}

  findMany(userId: number) {
    return this.prismaService.webSocket.findMany({
      where: {
        userId,
      },
    });
  }

  create({ id, userId }: { id: string; userId: number }) {
    return this.prismaService.webSocket.create({
      data: {
        id,
        userId,
      },
    });
  }

  delete(id: string) {
    return this.prismaService.webSocket.delete({
      where: {
        id,
      },
    });
  }
}
