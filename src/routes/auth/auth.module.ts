import { AuthController } from '@/routes/auth/auth.controller';
import { AuthRepository } from '@/routes/auth/auth.repo';
import { AuthService } from '@/routes/auth/auth.service';
import { RolesService } from '@/routes/auth/roles.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RolesService, AuthRepository],
})
export class AuthModule { }
