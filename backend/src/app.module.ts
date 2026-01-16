import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DataService } from './data.service';
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
  controllers: [AppController],
  providers: [CharacterGateway, WorldGateway, BattleMapGateway, DataService],
})
export class AppModule {}
