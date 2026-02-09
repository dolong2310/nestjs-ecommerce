import {
  CreateUserBodyDTO,
  CreateUserResponseDTO,
  GetUserResponseDTO,
  GetUsersResponseDTO,
  UpdateUserBodyDTO,
  UpdateUserResponseDTO,
  UserParamsDTO,
  UserQueryDTO,
} from '@/routes/user/user.dto';
import { UserService } from '@/routes/user/user.service';
import type { RoleNameType } from '@/shared/constants/role.constant';
import { ActiveRolePermissions } from '@/shared/decorators/active-role-permissions.decorator';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ZodSerializerDto(GetUsersResponseDTO)
  getUsers(@Query() query: UserQueryDTO): Promise<GetUsersResponseDTO> {
    const { page, limit } = query;
    return this.userService.getUsers({ page, limit });
  }

  @Get(':id')
  @ZodSerializerDto(GetUserResponseDTO)
  // có thể dùng cách này để lấy id: @Param('id', ParseIntPipe) id: number
  getUser(@Param() params: UserParamsDTO): Promise<GetUserResponseDTO> {
    return this.userService.getUserById(params.id);
  }

  @Post()
  @ZodSerializerDto(CreateUserResponseDTO)
  createUser(
    @Body() body: CreateUserBodyDTO,
    @ActiveUser('userId') userId: number,
    @ActiveRolePermissions('name') roleName: RoleNameType,
  ): Promise<CreateUserResponseDTO> {
    return this.userService.createUser({ userId, roleName, body });
  }

  @Put(':id')
  @ZodSerializerDto(UpdateUserResponseDTO)
  updateUser(
    @Param() params: UserParamsDTO,
    @Body() body: UpdateUserBodyDTO,
    @ActiveUser('userId') userId: number,
    @ActiveRolePermissions('name') roleName: RoleNameType,
  ): Promise<UpdateUserResponseDTO> {
    return this.userService.updateUser({ userId, roleName, id: params.id, body });
  }

  @Delete(':id')
  @ZodSerializerDto(MessageResponseDTO)
  deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @ActiveUser('userId') userId: number,
    @ActiveRolePermissions('name') roleName: RoleNameType,
  ): Promise<MessageResponseDTO> {
    return this.userService.deleteUser({ userId, roleName, id });
  }
}
