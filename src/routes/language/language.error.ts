import { ConflictException, NotFoundException } from "@nestjs/common";

export const LanguageNotFoundException = new NotFoundException([{
  field: 'language',
  message: 'Error.LanguageNotFound',
}])

export const LanguageAlreadyExistsException = new ConflictException([{
  field: 'language',
  message: 'Error.LanguageAlreadyExists',
}])
