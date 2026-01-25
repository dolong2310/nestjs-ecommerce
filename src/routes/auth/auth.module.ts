import { AuthController } from '@/routes/auth/auth.controller';
import { AuthRepository } from '@/routes/auth/repositories/auth.repo';
import { AuthService } from '@/routes/auth/services/auth.service';
import { GoogleService } from '@/routes/auth/services/google.service';
import { RolesService } from '@/routes/auth/services/roles.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AuthController],
  providers: [AuthRepository, AuthService, RolesService, GoogleService],
})
export class AuthModule { }
