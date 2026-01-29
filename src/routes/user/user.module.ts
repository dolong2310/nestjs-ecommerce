import { UserController } from '@/routes/user/user.controller';
import { UserRepository } from '@/routes/user/user.repo';
import { UserService } from '@/routes/user/user.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [UserController],
  providers: [UserRepository, UserService]
})
export class UserModule { }
