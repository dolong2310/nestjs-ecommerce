import {
  CreateLanguageBodyDTO,
  GetLanguageParamsDTO,
  GetLanguageResponseDTO,
  GetLanguagesResponseDTO,
  UpdateLanguageBodyDTO,
} from '@/routes/language/language.dto';
import { LanguageService } from '@/routes/language/language.service';
import { CURRENT_VERSION } from '@/shared/constants/version.constant';
import { ActiveUser } from '@/shared/decorators/active-user.decorator';
import { MessageResponseDTO } from '@/shared/dtos/response.dto';
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

@Controller({ path: 'languages', version: CURRENT_VERSION })
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get()
  @ZodResponse({ type: GetLanguagesResponseDTO })
  getLanguages(): Promise<GetLanguagesResponseDTO> {
    return this.languageService.getLanguages();
  }

  @Get(':id')
  @ZodResponse({ type: GetLanguageResponseDTO })
  getLanguageById(@Param() params: GetLanguageParamsDTO): Promise<GetLanguageResponseDTO> {
    return this.languageService.getLanguageById(params.id);
  }

  @Post()
  @ZodResponse({ type: GetLanguageResponseDTO })
  createLanguage(
    @Body() body: CreateLanguageBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<GetLanguageResponseDTO> {
    return this.languageService.createLanguage({ userId, body });
  }

  // Không cho phép cập nhật id: Vì id là mã ngôn ngữ ("en", "vi",...) do user tự tạo, nó nên bất biến. Nếu muốn thay đổi id thì phải xoá và tạo lại mới.
  // Kiểm tra soft delete: Theo nguyên tắc chung của soft delete, không nên cho phép update record đã bị soft delete. Trừ khi có yêu cầu đặc biệt (ví dụ: khôi phục hoặc chỉnh sửa dữ liệu lịch sử).
  @Put(':id')
  @ZodResponse({ type: GetLanguageResponseDTO })
  updateLanguage(
    @Param() params: GetLanguageParamsDTO,
    @Body() body: UpdateLanguageBodyDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<GetLanguageResponseDTO> {
    return this.languageService.updateLanguage({ userId, id: params.id, body });
  }

  @Delete(':id')
  @ZodResponse({ type: MessageResponseDTO })
  deleteLanguage(
    @Param() params: GetLanguageParamsDTO,
    @ActiveUser('userId') userId: number,
  ): Promise<MessageResponseDTO> {
    return this.languageService.deleteLanguage({ userId, id: params.id });
  }
}
