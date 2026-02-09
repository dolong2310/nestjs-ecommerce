import { AppModule } from '@/app.module';
import envConfig from '@/shared/config';
import { LoggingInterceptor } from '@/shared/interceptor/logging.interceptor';
import { WebsocketAdapter } from '@/websockets/websocket.adapter';
// import { ConsoleLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    { bufferLogs: true }, // buffer logs để ghi đè lên logger mặc định của nestjs
    //   {
    //   logger: new ConsoleLogger({
    //     // json: true,
    //   }),
    // }
  );

  // CORS
  app.enableCors({
    origin: [envConfig.FRONTEND_URL],
    credentials: true,
  });

  // WebSocket
  const websocketAdapter = new WebsocketAdapter(app);
  await websocketAdapter.connectToRedis();

  app.useWebSocketAdapter(websocketAdapter);

  // app.useStaticAssets(UPLOAD_DIR, {
  //   prefix: '/media/static',
  // });

  // Cấu hình phục vụ cho các proxy nginx hoặc apache để bảo vệ nestjs server từ việc bị tấn công DoS (Denial of Service) hoặc DDOS (Distributed Denial of Service)
  app.set('trust proxy', 'loopback'); // Trust requests from the loopback address

  // Helmet
  // Helmet là một middleware giúp bảo vệ ứng dụng Express/NestJS bằng cách tự động thiết lập các HTTP Header bảo mật quan trọng.
  // Nói đơn giản, helmet giống như một "lớp áo giáp" bổ sung cho ứng dụng web, giúp giảm nguy cơ bị tấn công như XSS, clickjacking, lộ thông tin server, v.v.
  // Việc này chủ yếu thông qua việc tự động thêm/chỉnh sửa các HTTP header mà trình duyệt và client sẽ dùng để tăng mức độ an toàn cho ứng dụng.
  app.use(helmet());

  // Logger
  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger
  const openApiDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Ecommerce API')
      .setDescription('Ecommerce API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .addApiKey(
        {
          name: 'authorization',
          type: 'apiKey',
          in: 'headers',
        },
        'payment-api-key',
      )
      .build(),
  );
  SwaggerModule.setup('api', app, cleanupOpenApiDoc(openApiDoc), {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(envConfig.PORT ?? 3000);
}
bootstrap();
