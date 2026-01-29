import { LanguageAlreadyExistsException, LanguageNotFoundException } from '@/routes/language/language.error';
import { LanguageRepository } from '@/routes/language/language.repo';
import { CreateLanguageBodyType, GetLanguageResponseType, GetLanguagesResponseType, UpdateLanguageBodyType } from '@/routes/language/language.type';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '@/shared/helpers';
import { MessageResponseType } from '@/shared/types/shared-response.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LanguageService {
  constructor(
    private readonly languageRepository: LanguageRepository,
  ) { }

  async getLanguages(): Promise<GetLanguagesResponseType> {
    try {
      const languages = await this.languageRepository.findMany();
      return {
        data: languages,
        totalItems: languages.length,
      };
    } catch (error) {
      throw error;
    }
  }

  async getLanguageById(id: string): Promise<GetLanguageResponseType> {
    try {
      const language = await this.languageRepository.findById(id);
      if (!language) {
        throw LanguageNotFoundException;
      }
      return language;
    } catch (error) {
      throw error;
    }
  }

  async createLanguage(payload: { userId: number, body: CreateLanguageBodyType }): Promise<GetLanguageResponseType> {
    try {
      const language = await this.languageRepository.create(payload);
      return language;
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw LanguageAlreadyExistsException;
      }
      throw error;
    }
  }

  async updateLanguage(payload: { id: string, userId: number, body: UpdateLanguageBodyType }): Promise<GetLanguageResponseType> {
    try {
      const language = await this.languageRepository.update(payload);
      return language;
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw LanguageNotFoundException;
      }
      throw error;
    }
  }

  async deleteLanguage(payload: { userId: number, id: string }): Promise<MessageResponseType> {
    try {
      // hard delete vì id là mình tự tạo nên có thể bị conflict nếu như đã tồn tại trong database
      const isHardDelete = true;
      await this.languageRepository.delete(payload, isHardDelete);
      return {
        message: 'Success.LanguageDeleted',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw LanguageNotFoundException;
      }
      throw error;
    }
  }
}
