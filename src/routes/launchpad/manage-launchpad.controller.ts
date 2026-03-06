import {
  ApproveLaunchpadBodyDTO,
  CreateLaunchpadBodyDTO,
  GetLaunchpadParamsDTO,
  GetManageLaunchpadsQueryDTO,
  GetManageLaunchpadsResponseDTO,
  ManageLaunchpadResponseDTO,
  RejectLaunchpadBodyDTO,
  UpdateLaunchpadBodyDTO,
} from '@/routes/launchpad/launchpad.dto';
import { ManageLaunchpadService } from '@/routes/launchpad/manage-launchpad.service';
import { CURRENT_VERSION } from '@/shared/constants/version.constant';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import type { AccessTokenPayload } from '@/shared/types/jwt.type';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

/**
 * @description Seller: tạo/sửa/xóa/submit/publish launchpad của mình
 *              Admin: approve/reject + xem tất cả
 * Authorization được kiểm tra trong service layer dựa vào roleName
 */
@Controller({ path: 'manage-launchpad/launchpads', version: CURRENT_VERSION })
export class ManageLaunchpadController {
  constructor(private readonly manageLaunchpadService: ManageLaunchpadService) {}

  // ─── Read (Seller xem của mình, Admin xem tất cả) ─────────────────────────────

  @Get()
  @ZodResponse({ type: GetManageLaunchpadsResponseDTO })
  getMany(
    @Query() query: GetManageLaunchpadsQueryDTO,
    @ActiveUser() user: AccessTokenPayload,
  ): Promise<GetManageLaunchpadsResponseDTO> {
    return this.manageLaunchpadService.getManageLaunchpads(query, user.userId, user.roleName);
  }

  @Get(':id')
  @ZodResponse({ type: ManageLaunchpadResponseDTO })
  getById(
    @Param() params: GetLaunchpadParamsDTO,
    @ActiveUser() user: AccessTokenPayload,
  ): Promise<ManageLaunchpadResponseDTO> {
    return this.manageLaunchpadService.getManageLaunchpadById(params.id, user.userId, user.roleName);
  }

  // ─── Seller: CRUD + State transitions ────────────────────────────────────────

  @Post()
  @ZodResponse({ type: ManageLaunchpadResponseDTO })
  create(
    @Body() body: CreateLaunchpadBodyDTO,
    @ActiveUser() user: AccessTokenPayload,
  ): Promise<ManageLaunchpadResponseDTO> {
    return this.manageLaunchpadService.create(body, user.userId);
  }

  @Patch(':id')
  @ZodResponse({ type: ManageLaunchpadResponseDTO })
  update(
    @Param() params: GetLaunchpadParamsDTO,
    @Body() body: UpdateLaunchpadBodyDTO,
    @ActiveUser() user: AccessTokenPayload,
  ): Promise<ManageLaunchpadResponseDTO> {
    return this.manageLaunchpadService.update(params.id, body, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param() params: GetLaunchpadParamsDTO, @ActiveUser() user: AccessTokenPayload): Promise<void> {
    return this.manageLaunchpadService.delete(params.id, user.userId);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: ManageLaunchpadResponseDTO })
  submit(
    @Param() params: GetLaunchpadParamsDTO,
    @ActiveUser() user: AccessTokenPayload,
  ): Promise<ManageLaunchpadResponseDTO> {
    return this.manageLaunchpadService.submit(params.id, user.userId);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: ManageLaunchpadResponseDTO })
  publish(
    @Param() params: GetLaunchpadParamsDTO,
    @ActiveUser() user: AccessTokenPayload,
  ): Promise<ManageLaunchpadResponseDTO> {
    return this.manageLaunchpadService.publish(params.id, user.userId);
  }

  // ─── Admin: Approve / Reject ──────────────────────────────────────────────────

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: ManageLaunchpadResponseDTO })
  approve(
    @Param() params: GetLaunchpadParamsDTO,
    @Body() body: ApproveLaunchpadBodyDTO,
    @ActiveUser() user: AccessTokenPayload,
  ): Promise<ManageLaunchpadResponseDTO> {
    return this.manageLaunchpadService.approve(params.id, user.userId, body.priority);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: ManageLaunchpadResponseDTO })
  reject(
    @Param() params: GetLaunchpadParamsDTO,
    @Body() body: RejectLaunchpadBodyDTO,
    @ActiveUser() user: AccessTokenPayload,
  ): Promise<ManageLaunchpadResponseDTO> {
    return this.manageLaunchpadService.reject(params.id, user.userId, body.reason);
  }
}
