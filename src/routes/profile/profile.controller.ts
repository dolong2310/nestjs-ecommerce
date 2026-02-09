import { ChangePasswordBodyDTO, UpdateProfileBodyDTO } from '@/routes/profile/profile.dto';
import { ProfileService } from '@/routes/profile/profile.service';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import { GetUserProfileResponseDTO, UpdateUserProfileResponseDTO } from '@/shared/dtos/shared-user.dto';
import { Body, Controller, Get, Put } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ZodResponse({ type: GetUserProfileResponseDTO })
  getProfile(@ActiveUser('userId') userId: number): Promise<GetUserProfileResponseDTO> {
    return this.profileService.getProfile(userId);
  }

  @Put()
  @ZodResponse({ type: UpdateUserProfileResponseDTO })
  updateProfile(
    @Body() body: UpdateProfileBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<UpdateUserProfileResponseDTO> {
    return this.profileService.updateProfile(userId, body);
  }

  @Put('change-password')
  @ZodResponse({ type: MessageResponseDTO })
  changePassword(
    @Body() body: ChangePasswordBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<MessageResponseDTO> {
    return this.profileService.changePassword(userId, body);
  }
}
