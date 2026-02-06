import { AppModule } from '@/app.module';
import envConfig from '@/shared/config';
import { WebsocketAdapter } from '@/websockets/websocket.adapter';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

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
