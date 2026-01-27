import { CreateRoleBodyDTO, GetRolesResponseDTO, RoleParamsDTO, RoleQueryDTO, RoleResponseDTO, UpdateRoleBodyDTO } from '@/routes/role/role.dto';
import { RoleService } from '@/routes/role/role.service';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) { }

  @Get()
  @ZodSerializerDto(GetRolesResponseDTO)
  getRoles(@Query() query: RoleQueryDTO): Promise<GetRolesResponseDTO> {
    const { page, limit } = query;
    return this.roleService.getRoles({ page, limit });
  }

  @Get(':id')
  @ZodSerializerDto(RoleResponseDTO)
  // có thể dùng cách này để lấy id: @Param('id', ParseIntPipe) id: number
  getRole(@Param() params: RoleParamsDTO): Promise<RoleResponseDTO> {
    return this.roleService.getRoleById(params.id);
  }

  @Post()
  @ZodSerializerDto(RoleResponseDTO)
  createRole(@Body() body: CreateRoleBodyDTO, @ActiveUser("userId") userId: number): Promise<RoleResponseDTO> {
    return this.roleService.createRole({ userId, body });
  }

  @Put(':id')
  @ZodSerializerDto(RoleResponseDTO)
  updateRole(@Param() params: RoleParamsDTO, @Body() body: UpdateRoleBodyDTO, @ActiveUser("userId") userId: number): Promise<RoleResponseDTO> {
    return this.roleService.updateRole({ userId, id: params.id, body });
  }

  @Delete(':id')
  @ZodSerializerDto(MessageResponseDTO)
  deleteRole(@Param('id', ParseIntPipe) id: number, @ActiveUser("userId") userId: number): Promise<MessageResponseDTO> {
    return this.roleService.deleteRole({ userId, id });
  }
}
