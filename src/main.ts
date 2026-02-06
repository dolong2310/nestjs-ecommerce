import { AppModule } from '@/app.module';
import envConfig from '@/shared/config';
import { WebsocketAdapter } from '@/websockets/websocket.adapter';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [envConfig.FRONTEND_URL],
    credentials: true,
  });

  const websocketAdapter = new WebsocketAdapter(app);
  await websocketAdapter.connectToRedis();

  app.useWebSocketAdapter(websocketAdapter);

  // app.useStaticAssets(UPLOAD_DIR, {
  //   prefix: '/media/static',
  // });

  // Cấu hình phục vụ cho các proxy nginx hoặc apache để bảo vệ nestjs server từ việc bị tấn công DoS (Denial of Service) hoặc DDOS (Distributed Denial of Service)
  app.set('trust proxy', 'loopback'); // Trust requests from the loopback address

  await app.listen(envConfig.PORT ?? 3000);
}
bootstrap();
