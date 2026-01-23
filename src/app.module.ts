import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/routes/auth/auth.module';
import { HttpExceptionFilter } from '@/shared/filters/http-exception.filter';
import { AuthCompositeGuard } from '@/shared/guards/auth-composite.guard';
import { CustomZodValidationPipe } from '@/shared/pipes/custom-zod-validation.pipe';
import { SharedModule } from '@/shared/shared.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor } from 'nestjs-zod';

@Module({
  imports: [ConfigModule.forRoot(), SharedModule, AuthModule],
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
export class AppModule { }
