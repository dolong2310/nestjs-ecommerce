// Common config
import '@/shared/config';

import { ApiKeyGuard } from '@/shared/guards/api-key.guard';
import { AuthCompositeGuard } from '@/shared/guards/auth-composite.guard';
import { AuthGuard } from '@/shared/guards/auth.guard';
import { PaymentApiKeyGuard } from '@/shared/guards/payment-api-key.guard';
import { SharedPaymentRepository } from '@/shared/repositories/shared-payment.repo';
import { SharedRoleRepository } from '@/shared/repositories/shared-role.repo';
import { SharedUserRepository } from '@/shared/repositories/shared-user.repo';
import { TwoFactorAuthenticationService } from '@/shared/services/2fa.service';
import { EmailService } from '@/shared/services/email.service';
import { HashingService } from '@/shared/services/hashing.service';
import { PrismaService } from '@/shared/services/prisma.service';
import { S3Service } from '@/shared/services/s3.service';
import { TokenService } from '@/shared/services/token.service';
import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

const sharedServices = [
  PrismaService,
  HashingService,
  TokenService,
  EmailService,
  TwoFactorAuthenticationService,
  S3Service,
];
const sharedRepositories = [SharedUserRepository, SharedRoleRepository, SharedPaymentRepository];
const sharedGuards = [AuthGuard, ApiKeyGuard, PaymentApiKeyGuard, AuthCompositeGuard];

@Global()
@Module({
  imports: [JwtModule],
  providers: [...sharedServices, ...sharedRepositories, ...sharedGuards],
  exports: [...sharedServices, ...sharedRepositories, ...sharedGuards],
})
export class SharedModule {}
