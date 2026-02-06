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
  app.useWebSocketAdapter(new WebsocketAdapter(app));
  // app.useStaticAssets(UPLOAD_DIR, {
  //   prefix: '/media/static',
  // });
  await app.listen(envConfig.PORT ?? 3000);
}
bootstrap();
