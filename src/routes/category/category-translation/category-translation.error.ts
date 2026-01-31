import { BadRequestException, NotFoundException } from '@nestjs/common';

export const CategoryTranslationNotFoundException = new NotFoundException([
  {
    field: 'id',
    message: 'Error.CategoryTranslationNotFound',
  },
]);

export const CategoryTranslationAlreadyExistsException = new BadRequestException([
  {
    field: 'categoryId',
    message: 'Error.CategoryTranslationAlreadyExists',
  },
  {
    field: 'languageId',
    message: 'Error.CategoryTranslationAlreadyExists',
  },
]);

export const LanguageNotFoundException = new NotFoundException([
  {
    field: 'languageId',
    message: 'Error.LanguageNotFound',
  },
]);
