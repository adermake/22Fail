import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // Disable Nest's default 100kb body parser — it rejects large base64 uploads before our limit applies.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  app.enableCors();

  // Base64 JSON payloads are ~33% larger than the raw file; allow large lobby map images.
  const bodyLimit = process.env.BODY_SIZE_LIMIT ?? '200mb';
  app.useBodyParser('json', { limit: bodyLimit });
  app.useBodyParser('urlencoded', { extended: true, limit: bodyLimit });

  await app.listen(process.env.PORT ?? 3000, '::');
}
bootstrap();
//npm run start:dev
