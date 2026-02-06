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
import envConfig from '@/shared/config';
import { HttpExceptionFilter } from '@/shared/filters/http-exception.filter';
import { AuthCompositeGuard } from '@/shared/guards/auth-composite.guard';
import { ThrottlerBehindProxyGuard } from '@/shared/guards/throttler-behind-proxy.guard';
import { CustomZodValidationPipe } from '@/shared/pipes/custom-zod-validation.pipe';
import { SharedModule } from '@/shared/shared.module';
import { WebsocketModule } from '@/websockets/websocket.module';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
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
    BullModule.forRoot({
      connection: {
        url: envConfig.REDIS_URL,
      },
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000, // 10 seconds time to live
          limit: 10, // 10 requests per 10 seconds
        },
        // {
        //   name: 'short',
        //   ttl: 1000,
        //   limit: 3,
        // },
        // {
        //   name: 'medium',
        //   ttl: 10000,
        //   limit: 20,
        // },
        // {
        //   name: 'long',
        //   ttl: 60000,
        //   limit: 100,
        // },
      ],
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
    WebsocketModule,
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard, // throttle requests
    },
  ],
})
export class AppModule {}
