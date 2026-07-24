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
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CharacterGateway } from './character.gateway';
import { WorldGateway } from './world.gateway';
import { BattleMapGateway } from './battlemap.gateway';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminGuard } from './admin.guard';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend-dist', 'frontend', 'browser'),
      exclude: ['api/*path'],
    }),
  ],
  controllers: [AppController, MapStorageController, LibraryController, AssetBrowserController, UsersController],
  providers: [CharacterGateway, WorldGateway, BattleMapGateway, DataService, ImageService, TextureService, StressTestService, MapStorageService, LibraryService, AssetBrowserService, UsersService, AdminGuard],
})
export class AppModule {}
