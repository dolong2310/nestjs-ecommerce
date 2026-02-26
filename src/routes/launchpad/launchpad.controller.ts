import {
  GetLaunchpadParamsDTO,
  GetLaunchpadResponseDTO,
  GetLaunchpadsQueryDTO,
  GetLaunchpadsResponseDTO,
  PurchaseLaunchpadBodyDTO,
  PurchaseLaunchpadResponseDTO,
} from '@/routes/launchpad/launchpad.dto';
import { LaunchpadService } from '@/routes/launchpad/launchpad.service';
import { ManageLaunchpadService } from '@/routes/launchpad/manage-launchpad.service';
import { CURRENT_VERSION } from '@/shared/constants/version.constant';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { Public } from '@/shared/decorators/auth.decorator';
import type { AccessTokenPayload } from '@/shared/types/jwt.type';
import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Param, Post, Query } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

@Controller({ path: 'launchpads', version: CURRENT_VERSION })
export class LaunchpadController {
  constructor(
    private readonly launchpadService: LaunchpadService,
    private readonly manageLaunchpadService: ManageLaunchpadService,
  ) {}

  /**
   * @description Public: danh sách launchpads đang LIVE
   */
  @Public()
  @Get()
  @ZodResponse({ type: GetLaunchpadsResponseDTO })
  getMany(@Query() query: GetLaunchpadsQueryDTO): Promise<GetLaunchpadsResponseDTO> {
    return this.launchpadService.getMany(query);
  }

  /**
   * @description Public: chi tiết 1 launchpad (kèm isPurchased nếu đã đăng nhập)
   */
  @Public()
  @Get(':id')
  @ZodResponse({ type: GetLaunchpadResponseDTO })
  getById(
    @Param() params: GetLaunchpadParamsDTO,
    @ActiveUser() user?: AccessTokenPayload,
  ): Promise<GetLaunchpadResponseDTO> {
    return this.launchpadService.getById(params.id, user?.userId);
  }

  /**
   * @description Authenticated user: mua 1 launchpad (trả về payment URL)
   */
  @Post(':id/purchase')
  @HttpCode(HttpStatus.OK)
  @ZodResponse({ type: PurchaseLaunchpadResponseDTO })
  purchase(
    @Param() params: GetLaunchpadParamsDTO,
    @Body() body: PurchaseLaunchpadBodyDTO,
    @ActiveUser() user: AccessTokenPayload,
    @Ip() ip: string,
  ): Promise<PurchaseLaunchpadResponseDTO> {
    return this.manageLaunchpadService.purchase(params.id, user.userId, body, ip);
  }
}
