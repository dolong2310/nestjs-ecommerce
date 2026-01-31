import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/routes/auth/auth.module';
import { BrandTranslationModule } from '@/routes/brand/brand-translation/brand-translation.module';
import { BrandModule } from '@/routes/brand/brand.module';
import { LanguageModule } from '@/routes/language/language.module';
import { MediaModule } from '@/routes/media/media.module';
import { PermissionModule } from '@/routes/permission/permission.module';
import { ProfileModule } from '@/routes/profile/profile.module';
import { RoleModule } from '@/routes/role/role.module';
import { UserModule } from '@/routes/user/user.module';
import { HttpExceptionFilter } from '@/shared/filters/http-exception.filter';
import { AuthCompositeGuard } from '@/shared/guards/auth-composite.guard';
import { CustomZodValidationPipe } from '@/shared/pipes/custom-zod-validation.pipe';
import { SharedModule } from '@/shared/shared.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor } from 'nestjs-zod';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SharedModule,
    AuthModule,
    LanguageModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    UserModule,
    MediaModule,
    BrandModule,
    BrandTranslationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthCompositeGuard, // auth composite guard to execute all guards
    },
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe, // validate zod errors
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor, // serialize zod errors
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter, // logging zod errors
    },
  ],
})
export class AppModule {}
