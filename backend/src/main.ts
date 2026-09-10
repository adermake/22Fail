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

  /*
   * Slow-request log.
   *
   * The backend does almost all of its filesystem work synchronously, so one slow handler does
   * not just make itself slow — it holds the single event loop and every other request waits
   * behind it, the homepage included. That makes "the site is occasionally unreachable" almost
   * impossible to attribute by reading code: the request that suffers is rarely the one at fault.
   *
   * This prints the ones that actually blocked, with how long they took. Tune or silence with
   * SLOW_REQUEST_MS; 0 logs everything, a negative value turns it off.
   */
  const slowMs = Number(process.env.SLOW_REQUEST_MS ?? 300);
  if (slowMs >= 0) {
    app.use((req: any, res: any, next: () => void) => {
      const started = process.hrtime.bigint();
      res.on('finish', () => {
        const ms = Number(process.hrtime.bigint() - started) / 1e6;
        if (ms >= slowMs) {
          console.warn(
            `[SLOW ${ms.toFixed(0)}ms] ${req.method} ${req.originalUrl ?? req.url}`,
          );
        }
      });
      next();
    });
  }

  /*
   * Event-loop stall detector.
   *
   * The request log above only sees HTTP. A lobby patch arrives over a WebSocket and does its
   * synchronous read-modify-write outside any request, so it can freeze the server without a
   * single slow request being logged — as can a long GC pause. This timer should fire every
   * 500ms; whatever it is late by is time nothing else could run.
   */
  const stallMs = Number(process.env.STALL_WARN_MS ?? 250);
  if (stallMs >= 0) {
    let last = Date.now();
    const tick = setInterval(() => {
      const drift = Date.now() - last - 500;
      if (drift >= stallMs) {
        console.warn(`[EVENT LOOP BLOCKED ${drift.toFixed(0)}ms]`);
      }
      last = Date.now();
    }, 500);
    tick.unref();
  }

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
