import {
  CreateRoleBodyDTO,
  GetRolesResponseDTO,
  RoleParamsDTO,
  RoleQueryDTO,
  RoleWithPermissionsResponseDTO,
  UpdateRoleBodyDTO,
} from '@/routes/role/role.dto';
import { RoleService } from '@/routes/role/role.service';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ZodResponse({ type: GetRolesResponseDTO })
  getRoles(@Query() query: RoleQueryDTO): Promise<GetRolesResponseDTO> {
    const { page, limit } = query;
    return this.roleService.getRoles({ page, limit });
  }

  @Get(':id')
  @ZodResponse({ type: RoleWithPermissionsResponseDTO })
  // có thể dùng cách này để lấy id: @Param('id', ParseIntPipe) id: number
  getRole(@Param() params: RoleParamsDTO): Promise<RoleWithPermissionsResponseDTO> {
    return this.roleService.getRoleById(params.id);
  }

  @Post()
  @ZodResponse({ type: RoleWithPermissionsResponseDTO })
  createRole(
    @Body() body: CreateRoleBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<RoleWithPermissionsResponseDTO> {
    return this.roleService.createRole({ userId, body });
  }

  @Put(':id')
  @ZodResponse({ type: RoleWithPermissionsResponseDTO })
  updateRole(
    @Param() params: RoleParamsDTO,
    @Body() body: UpdateRoleBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<RoleWithPermissionsResponseDTO> {
    return this.roleService.updateRole({ userId, id: params.id, body });
  }

  @Delete(':id')
  @ZodResponse({ type: MessageResponseDTO })
  deleteRole(@Param('id', ParseIntPipe) id: number, @ActiveUser('userId') userId: number): Promise<MessageResponseDTO> {
    return this.roleService.deleteRole({ userId, id });
  }
}
