import { BadRequestException, NotFoundException } from '@nestjs/common';

export const BrandTranslationNotFoundException = new NotFoundException([
  {
    field: 'id',
    message: 'Error.BrandTranslationNotFound',
  },
]);

export const BrandTranslationAlreadyExistsException = new BadRequestException([
  {
    field: 'brandId',
    message: 'Error.BrandTranslationAlreadyExists',
  },
  {
    field: 'languageId',
    message: 'Error.BrandTranslationAlreadyExists',
  },
]);

export const LanguageNotFoundException = new NotFoundException([
  {
    field: 'languageId',
    message: 'Error.LanguageNotFound',
  },
]);
