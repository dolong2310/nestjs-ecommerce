import { PermissionController } from '@/routes/permission/permission.controller';
import { PermissionRepository } from '@/routes/permission/permission.repo';
import { PermissionService } from '@/routes/permission/permission.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [PermissionController],
  providers: [PermissionRepository, PermissionService],
})
export class PermissionModule {}
