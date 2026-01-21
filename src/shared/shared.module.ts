import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ApiKeyGuard } from '@/shared/guards/api-key.guard';
import { AuthCompositeGuard } from '@/shared/guards/auth-composite.guard';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { HashingService } from '@/shared/services/hashing.service';
import { PrismaService } from '@/shared/services/prisma.service';
import { TokenService } from '@/shared/services/token.service';

// Common config
import '@/shared/config';

const sharedServices = [PrismaService, HashingService, TokenService];
const sharedGuards = [AuthGuard, ApiKeyGuard, AuthCompositeGuard];

@Global()
@Module({
  imports: [JwtModule],
  providers: [...sharedServices, ...sharedGuards],
  exports: [...sharedServices, ...sharedGuards],
})
export class SharedModule { }
