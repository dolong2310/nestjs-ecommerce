import { AuthController } from '@/routes/auth/auth.controller';
import { AuthRepository } from '@/routes/auth/auth.repo';
import { AuthService } from '@/routes/auth/auth.service';
import { GoogleService } from '@/routes/auth/google.service';
import { RolesService } from '@/routes/auth/roles.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AuthController],
  providers: [AuthRepository, AuthService, RolesService, GoogleService],
})
export class AuthModule { }
