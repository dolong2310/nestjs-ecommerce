import { BadRequestException, NotFoundException } from '@nestjs/common';

export const ProductTranslationNotFoundException = new NotFoundException([
  {
    field: 'id',
    message: 'Error.ProductTranslationNotFound',
  },
]);

export const ProductTranslationAlreadyExistsException = new BadRequestException([
  {
    field: 'productId',
    message: 'Error.ProductTranslationAlreadyExists',
  },
  {
    field: 'languageId',
    message: 'Error.ProductTranslationAlreadyExists',
  },
]);

export const LanguageOrProductNotFoundException = new NotFoundException([
  {
    field: 'languageId',
    message: 'Error.LanguageOrProductNotFound',
  },
  {
    field: 'productId',
    message: 'Error.LanguageOrProductNotFound',
  },
]);
