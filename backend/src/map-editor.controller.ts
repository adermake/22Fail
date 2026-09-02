import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { MapEditorService } from './map-editor.service';
// Type-only: `emitDecoratorMetadata` + `isolatedModules` forbids value imports in decorated signatures.
import type { DetailTier, RasterLayer } from './map-editor.service';
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
   * A painted chunk, at one of the three authored detail tiers.
   *
   * One route for all three: no tier is derived from another, so `low` is served exactly the
   * way `high` is. The client picks a tier from how much world is on screen, which is what
   * keeps the number of chunks it fetches roughly constant however far out the map goes.
   */
  @Get('chunks/:layer/:tier/:cx/:cy')
  getChunk(
    @Param('worldName') worldName: string,
    @Param('layer') layer: RasterLayer,
    @Param('tier') tier: DetailTier,
    @Param('cx', ParseIntPipe) cx: number,
    @Param('cy', ParseIntPipe) cy: number,
    @Res() res: Response,
  ): void {
    const data = this.mapEditor.readChunk(worldName, layer, tier, cx, cy);
    if (!data) {
      // A missing chunk is the normal case for unpainted map, not an error worth logging.
      res.status(404).end();
      return;
    }
    res.setHeader('Content-Type', 'image/png');
    /*
     * Versioned by query string on the client, so the bytes themselves are immutable.
     *
     * Every tier can be cached this way now. The derived tiles this replaced had to be
     * served `no-store`, because they were rebuilt in place whenever a chunk beneath them
     * changed and had no version of their own to bust a cache with.
     */
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.end(data);
  }

  /**
   * Upload a painted chunk as a raw PNG body. Returns the new version, which the client
   * broadcasts so other sessions know to refetch exactly this chunk.
   *
   * A stroke sends one of these per tier it wrote — its own and every coarser one — so the
   * coarse views are published as authored data rather than rebuilt from the fine ones.
   */
  @Put('chunks/:layer/:tier/:cx/:cy')
  async putChunk(
    @Param('worldName') worldName: string,
    @Param('layer') layer: RasterLayer,
    @Param('tier') tier: DetailTier,
    @Param('cx', ParseIntPipe) cx: number,
    @Param('cy', ParseIntPipe) cy: number,
    @Req() req: Request,
  ): Promise<{ success: boolean; ver?: number }> {
    const body = await readRawBody(req);
    if (!body?.length) return { success: false };

    const ver = this.mapEditor.writeChunk(worldName, layer, tier, cx, cy, body);
    return ver == null ? { success: false } : { success: true, ver };
  }

  /**
   * Delete every stored chunk of one layer and tier inside a chunk-coordinate rectangle.
   *
   * The cheap way to clear a large area: chunks are plain files, so removing them is the
   * erase, and it costs the same whether the region is one chunk or a continent. Rendering
   * transparency into each one and PUTting it back would be thousands of round trips for a
   * result that is by definition empty.
   *
   * GM-only, and checked here rather than left to the UI: this is the most destructive route
   * in the map API, and unlike `putChunk` there is nothing to undo it with.
   *
   * Returns the cells actually removed — normally far fewer than the rectangle, since most
   * of a map was never painted — so the caller can tell other sessions exactly what to drop.
   */
  @Delete('chunks/:layer/:tier')
  clearChunks(
    @Param('worldName') worldName: string,
    @Param('layer') layer: RasterLayer,
    @Param('tier') tier: DetailTier,
    @Query('minCx', ParseIntPipe) minCx: number,
    @Query('minCy', ParseIntPipe) minCy: number,
    @Query('maxCx', ParseIntPipe) maxCx: number,
    @Query('maxCy', ParseIntPipe) maxCy: number,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-code') userCode: string,
  ): { success: boolean; cells: [number, number][] } {
    if (!this.isGM(userId, userCode)) return { success: false, cells: [] };

    const cells = this.mapEditor.clearChunks(
      worldName,
      layer,
      tier,
      minCx,
      minCy,
      maxCx,
      maxCy,
    );
    return { success: true, cells };
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
