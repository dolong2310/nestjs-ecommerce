import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { RemoveRefreshTokenCronjob } from '@/cronjobs/remove-refresh-token.cronjob';
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
import { ReviewModule } from '@/routes/review/review.module';
import { RoleModule } from '@/routes/role/role.module';
import { UserModule } from '@/routes/user/user.module';
import envConfig from '@/shared/config';
import { HttpExceptionFilter } from '@/shared/filters/http-exception.filter';
import { AuthCompositeGuard } from '@/shared/guards/auth-composite.guard';
import { ThrottlerBehindProxyGuard } from '@/shared/guards/throttler-behind-proxy.guard';
import { CustomZodValidationPipe } from '@/shared/pipes/custom-zod-validation.pipe';
import { SharedModule } from '@/shared/shared.module';
import { WebsocketModule } from '@/websockets/websocket.module';
import KeyvRedis from '@keyv/redis';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { LoggerModule } from 'nestjs-pino';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import path from 'path';
import pino from 'pino';

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
        // Using: @SkipThrottle() hoặc @SkipThrottle({ default: false });
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
        // Using: @SkipThrottle({ short: true, medium: true, long: true });
      ],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        return {
          stores: [new KeyvRedis(envConfig.REDIS_URL)],
        };
      },
    }),
    // Setup log rotation cho dự án thực tế:
    // Một file log app.log to sẽ bị chia thành 7 file log nhỏ tượng trưng cho 7 ngày gần nhất: app.log.1, app.log.2, app.log.3,... Và qua một ngày mới thì một file log nhỏ sẽ bị xóa, một file log nhỏ lại được tạo.
    // Keyword hỏi AI: Hướng dẫn sử dụng logrotate cho file log được lưu tại đường dẫn /logs/app.log
    LoggerModule.forRoot({
      pinoHttp: {
        // stream: ghi log vào file
        // stream: pino.destination({
        //   dest: path.resolve('logs/app.log'),
        //   sync: false, // Asynchronous logging
        //   mkdir: true, // Create directory if it doesn't exist
        // }),

        // serializers: chuẩn hoá dữ liệu request/response để dễ đọc
        serializers: {
          req: (req: any) => {
            return {
              method: req.method,
              url: req.url,
              query: req.query,
              params: req.params,
            };
          },
          res: (res: any) => {
            return {
              statusCode: res.statusCode,
            };
          },
        },
      },
    }),
    ScheduleModule.forRoot(),
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
    ReviewModule,
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
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: LoggingInterceptor, // logging request/response
    // },
    RemoveRefreshTokenCronjob,
  ],
})
export class AppModule {}
