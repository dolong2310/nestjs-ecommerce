import { AppModule } from '@/app.module';
import envConfig from '@/shared/config';
import { WebsocketAdapter } from '@/websockets/websocket.adapter';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

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

  // Helmet là một middleware giúp bảo vệ ứng dụng Express/NestJS bằng cách tự động thiết lập các HTTP Header bảo mật quan trọng.
  // Nói đơn giản, helmet giống như một "lớp áo giáp" bổ sung cho ứng dụng web, giúp giảm nguy cơ bị tấn công như XSS, clickjacking, lộ thông tin server, v.v.
  // Việc này chủ yếu thông qua việc tự động thêm/chỉnh sửa các HTTP header mà trình duyệt và client sẽ dùng để tăng mức độ an toàn cho ứng dụng.
  app.use(helmet());

  await app.listen(envConfig.PORT ?? 3000);
}
bootstrap();
