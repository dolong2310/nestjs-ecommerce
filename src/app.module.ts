import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/routes/auth/auth.module';
import { SharedModule } from '@/shared/shared.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), SharedModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
