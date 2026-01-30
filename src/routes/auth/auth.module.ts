import { AuthController } from '@/routes/auth/auth.controller';
import { AuthRepository } from '@/routes/auth/repositories/auth.repo';
import { AuthService } from '@/routes/auth/services/auth.service';
import { GoogleService } from '@/routes/auth/services/google.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AuthController],
  providers: [AuthRepository, AuthService, GoogleService],
})
export class AuthModule {}
