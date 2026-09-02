import { NestFactory } from '@nestjs/core';
// Default import: `compression` is a CommonJS callable, and `esModuleInterop` is on.
import compression from 'compression';
import { AppModule } from './app.module';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // Disable Nest's default 100kb body parser — it rejects large base64 uploads before our limit applies.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  app.enableCors();

  /*
   * Gzip responses.
   *
   * The map document is one JSON array of every symbol on the map, sent in full on every
   * join, and it is extremely repetitive — the same asset keys and shapes tens of thousands
   * of times. Measured on 50k symbols that is 8.4 MB raw and 0.61 MB gzipped, so this is the
   * difference between a map that opens and one that does not.
   *
   * Chunk PNGs are unaffected: `compression` consults the response content-type and skips
   * anything already compressed, so it never wastes CPU re-packing image bytes.
   */
  app.use(compression());

  // Base64 JSON payloads are ~33% larger than the raw file; allow large lobby map images.
  const bodyLimit = process.env.BODY_SIZE_LIMIT ?? '200mb';
  app.useBodyParser('json', { limit: bodyLimit });
  app.useBodyParser('urlencoded', { extended: true, limit: bodyLimit });

  /*
   * Let SIGINT/SIGTERM run the lifecycle hooks.
   *
   * Without this, `onModuleDestroy` never fires and the map editor's debounced save — up to a
   * second of edits held only in memory — is lost on every ordinary restart. `MapEditorService`
   * is currently the only service with such a hook, so this enables exactly that flush.
   */
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000, '::');
}
bootstrap();
//npm run start:dev
