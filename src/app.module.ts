import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/routes/auth/auth.module';
import { BrandTranslationModule } from '@/routes/brand/brand-translation/brand-translation.module';
import { BrandModule } from '@/routes/brand/brand.module';
import { CartModule } from '@/routes/cart/cart.module';
import { CategoryTranslationModule } from '@/routes/category/category-translation/category-translation.module';
import { CategoryModule } from '@/routes/category/category.module';
import { LanguageModule } from '@/routes/language/language.module';
import { MediaModule } from '@/routes/media/media.module';
import { OrderModule } from '@/routes/order/order.module';
import { PaymentModule } from '@/routes/payment/payment.module';
import { PermissionModule } from '@/routes/permission/permission.module';
import { ProductTranslationModule } from '@/routes/product/product-translation/product-translation.module';
import { ProductModule } from '@/routes/product/product.module';
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
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.resolve('src/i18n/'),
        watch: true,
      },
      typesOutputPath: path.resolve('src/generated/i18n.generated.ts'),
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
    }),
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
    CategoryModule,
    CategoryTranslationModule,
    ProductModule,
    ProductTranslationModule,
    CartModule,
    OrderModule,
    PaymentModule,
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
