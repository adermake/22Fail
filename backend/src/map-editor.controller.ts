import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { MapEditorService } from './map-editor.service';
// Type-only: `emitDecoratorMetadata` + `isolatedModules` forbids value imports in decorated signatures.
import type { RasterLayer } from './map-editor.service';
import { UsersService } from './users.service';

/**
 * Map Editor REST API (format v2).
 *
 * The document endpoint is identity-aware: players receive a payload with secret objects
 * already removed, so a hidden dungeon is absent from the response rather than merely
 * hidden by the UI.
 *
 * Chunks move as raw PNG bytes over plain HTTP rather than through the socket. They are
 * large and cacheable, and keeping them off the realtime channel is what lets live editing
 * stay responsive while the map grows.
 */
@Controller('api/worlds/:worldName/map-editor')
export class MapEditorController {
  constructor(
    private readonly mapEditor: MapEditorService,
    private readonly users: UsersService,
  ) {}

  private isGM(userId?: string, code?: string): boolean {
    return !!this.users.resolve(userId as string, code as string)?.isAdmin;
  }

  /** Full document, filtered to the caller's visibility. */
  @Get()
  getMap(
    @Param('worldName') worldName: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-code') userCode: string,
  ): any {
    return this.mapEditor.viewFor(worldName, this.isGM(userId, userCode));
  }

  /** Wholesale document save. Used for imports and recovery, not the editing hot path. */
  @Post()
  saveMap(@Param('worldName') worldName: string, @Body() body: any): any {
    return this.mapEditor.saveMap(worldName, body);
  }

  /**
   * A tile from the pyramid.
   *
   * Level 0 is what the editor paints; higher levels are derived by downscaling four
   * children and are built on first request. Because each level covers four times the world
   * area, the client fetches roughly the same number of tiles at any zoom — which is what
   * makes panning and zooming seamless however far out the map goes.
   */
  @Get('tiles/:layer/:level/:cx/:cy')
  getTile(
    @Param('worldName') worldName: string,
    @Param('layer') layer: RasterLayer,
    @Param('level', ParseIntPipe) level: number,
    @Param('cx', ParseIntPipe) cx: number,
    @Param('cy', ParseIntPipe) cy: number,
    @Res() res: Response,
  ): void {
    const data = this.mapEditor.readTile(worldName, layer, cx, cy, level);
    if (!data) {
      // Nothing painted beneath this tile — the normal case over most of a map.
      res.status(404).end();
      return;
    }
    res.setHeader('Content-Type', 'image/png');
    /*
     * Derived tiles are rebuilt in place whenever a chunk beneath them changes, and the
     * client has no per-tile version to bust a cache with. Caching them as immutable would
     * pin stale terrain in the browser for a year. Level 0 keeps the versioned immutable
     * treatment on its own route.
     */
    res.setHeader('Cache-Control', level === 0 ? 'public, max-age=31536000, immutable' : 'no-store');
    res.end(data);
  }

  @Get('chunks/:layer/:cx/:cy')
  getChunk(
    @Param('worldName') worldName: string,
    @Param('layer') layer: RasterLayer,
    @Param('cx', ParseIntPipe) cx: number,
    @Param('cy', ParseIntPipe) cy: number,
    @Res() res: Response,
  ): void {
    const data = this.mapEditor.readChunk(worldName, layer, cx, cy);
    if (!data) {
      // A missing chunk is the normal case for unpainted map, not an error worth logging.
      res.status(404).end();
      return;
    }
    res.setHeader('Content-Type', 'image/png');
    // Versioned by query string on the client, so the bytes themselves are immutable.
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.end(data);
  }

  /**
   * Upload a painted chunk as a raw PNG body. Returns the new version, which the client
   * broadcasts so other sessions know to refetch exactly this chunk.
   */
  @Put('chunks/:layer/:cx/:cy')
  async putChunk(
    @Param('worldName') worldName: string,
    @Param('layer') layer: RasterLayer,
    @Param('cx', ParseIntPipe) cx: number,
    @Param('cy', ParseIntPipe) cy: number,
    @Req() req: Request,
  ): Promise<{ success: boolean; ver?: number }> {
    const body = await readRawBody(req);
    if (!body?.length) return { success: false };

    const ver = this.mapEditor.writeChunk(worldName, layer, cx, cy, body);
    return ver == null ? { success: false } : { success: true, ver };
  }
}

/** Collect a raw request body; Nest's JSON parser leaves binary uploads alone. */
function readRawBody(req: Request): Promise<Buffer> {
  const existing = (req as any).body;
  if (Buffer.isBuffer(existing)) return Promise.resolve(existing);

  return new Promise((resolve, reject) => {
    const parts: Buffer[] = [];
    req.on('data', (c: Buffer) => parts.push(c));
    req.on('end', () => resolve(Buffer.concat(parts)));
    req.on('error', reject);
  });
}
