import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DataService } from './data.service';
import { ImageService } from './image.service';
import { TextureService } from './texture.service';
import { StressTestService } from './stress-test.service';
import { MapStorageService } from './map-storage.service';
import { MapStorageController } from './map-storage.controller';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { AssetBrowserController } from './asset-browser.controller';
import { AssetBrowserService } from './asset-browser.service';
import { MapEditorController } from './map-editor.controller';
import { MapEditorService } from './map-editor.service';
import { MapEditorGateway } from './map-editor.gateway';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { existsSync } from 'fs';
import { CharacterGateway } from './character.gateway';
import { WorldGateway } from './world.gateway';
import { BattleMapGateway } from './battlemap.gateway';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminGuard } from './admin.guard';

/**
 * Where the built frontend lives.
 *
 * The staging copy has historically been made with two different nestings
 * (`frontend-dist/frontend/browser` vs `frontend-dist/browser`), and picking the wrong one
 * fails SILENTLY - the server just serves nothing, or something ancient. So probe for the first
 * candidate that actually contains an index.html, and shout if none does.
 * The last candidate lets a dev server run straight off the frontend build with no copy at all.
 */
function resolveFrontendRoot(): string {
  const candidates = [
    join(__dirname, '..', 'frontend-dist', 'frontend', 'browser'),
    join(__dirname, '..', 'frontend-dist', 'browser'),
    join(__dirname, '..', '..', 'frontend', 'dist', 'frontend', 'browser'),
  ];
  for (const dir of candidates) {
    if (existsSync(join(dir, 'index.html'))) {
      console.log(`[static] serving frontend from ${dir}`);
      return dir;
    }
  }
  console.error('[static] NO frontend build found. Tried these paths -');
  for (const dir of candidates) console.error('  ' + dir);
  console.error('[static] Run "npm run deploy:stage" in frontend/ to build and stage it.');
  return candidates[0];
}

const FRONTEND_ROOT = resolveFrontendRoot();

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: FRONTEND_ROOT,
      exclude: ['api/*path'],
      serveStaticOptions: {
        setHeaders: (res, filePath) => {
          // Angular fingerprints its bundles, so those may be cached forever.
          // EVERYTHING else (index.html, rulebook markdown, icons) keeps a stable name and can
          // change between deploys - it must revalidate, or you get the "updates only somewhat,
          // really inconsistent" behaviour. Revalidation is a cheap 304 when nothing changed.
          if (/-[A-Z0-9]{8,}[.](?:js|css)$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
          }
        },
      },
    }),
  ],
  controllers: [AppController, MapStorageController, LibraryController, AssetBrowserController, UsersController, MapEditorController],
  providers: [CharacterGateway, WorldGateway, BattleMapGateway, DataService, ImageService, TextureService, StressTestService, MapStorageService, LibraryService, AssetBrowserService, UsersService, AdminGuard, MapEditorService, MapEditorGateway],
})
export class AppModule {}
