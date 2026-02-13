import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DataService } from './data.service';
import { ImageService } from './image.service';
import { TextureService } from './texture.service';
import { StressTestService } from './stress-test.service';
import { MapStorageService } from './map-storage.service';
import { MapStorageController } from './map-storage.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CharacterGateway } from './character.gateway';
import { WorldGateway } from './world.gateway';
import { BattleMapGateway } from './battlemap.gateway';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend-dist', 'frontend', 'browser'),
      exclude: ['api/*path'],
    }),
  ],
  controllers: [AppController, MapStorageController],
  providers: [CharacterGateway, WorldGateway, BattleMapGateway, DataService, ImageService, TextureService, StressTestService, MapStorageService],
})
export class AppModule {}
