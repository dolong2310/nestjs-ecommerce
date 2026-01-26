import { LanguageController } from '@/routes/language/language.controller';
import { LanguageRepository } from '@/routes/language/language.repo';
import { LanguageService } from '@/routes/language/language.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [LanguageController],
  providers: [LanguageRepository, LanguageService]
})
export class LanguageModule { }
