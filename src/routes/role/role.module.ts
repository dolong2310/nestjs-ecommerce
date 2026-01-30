import { RoleController } from '@/routes/role/role.controller';
import { RoleRepository } from '@/routes/role/role.repo';
import { RoleService } from '@/routes/role/role.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [RoleController],
  providers: [RoleRepository, RoleService],
})
export class RoleModule {}
