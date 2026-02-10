import {
  CreatePermissionBodyDTO,
  GetPermissionsResponseDTO,
  PermissionParamsDTO,
  PermissionQueryDTO,
  PermissionResponseDTO,
  UpdatePermissionBodyDTO,
} from '@/routes/permission/permission.dto';
import { PermissionService } from '@/routes/permission/permission.service';
import { CURRENT_VERSION } from '@/shared/constants/version.constant';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

@Controller({ path: 'permissions', version: CURRENT_VERSION })
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @ZodResponse({ type: GetPermissionsResponseDTO })
  getPermissions(@Query() query: PermissionQueryDTO): Promise<GetPermissionsResponseDTO> {
    const { page, limit } = query;
    return this.permissionService.getPermissions({ page, limit });
  }

  @Get(':id')
  @ZodResponse({ type: PermissionResponseDTO })
  // có thể dùng cách này để lấy id: @Param('id', ParseIntPipe) id: number
  getPermission(@Param() params: PermissionParamsDTO): Promise<PermissionResponseDTO> {
    return this.permissionService.getPermissionById(params.id);
  }

  @Post()
  @ZodResponse({ type: PermissionResponseDTO })
  createPermission(
    @Body() body: CreatePermissionBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<PermissionResponseDTO> {
    return this.permissionService.createPermission({ userId, body });
  }

  @Put(':id')
  @ZodResponse({ type: PermissionResponseDTO })
  updatePermission(
    @Param() params: PermissionParamsDTO,
    @Body() body: UpdatePermissionBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<PermissionResponseDTO> {
    return this.permissionService.updatePermission({ userId, id: params.id, body });
  }

  @Delete(':id')
  @ZodResponse({ type: MessageResponseDTO })
  deletePermission(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser('userId') userId: number,
  ): Promise<MessageResponseDTO> {
    return this.permissionService.deletePermission({ userId, id });
  }
}
