import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import * as LibraryServiceModule from './library.service';
import type { Library } from './library.service';
import { WorldGateway } from './world.gateway';

@Controller('api/library')
export class LibraryController {
  constructor(
    private readonly libraryService: LibraryServiceModule.LibraryService,
    private readonly worldGateway: WorldGateway,
  ) {}

  /**
   * GET /library
   * Get all libraries or filter by query parameters
   */
  @Get()
  getAllLibraries(
    @Query('tag') tag?: string,
    @Query('public') isPublic?: string,
  ): Library[] {
    if (tag) {
      return this.libraryService.getLibrariesByTag(tag);
    }
    if (isPublic === 'true') {
      return this.libraryService.getPublicLibraries();
    }
    return this.libraryService.getAllLibraries();
  }

  /**
   * GET /library/:id
   * Get a specific library by ID
   */
  @Get(':id')
  getLibrary(@Param('id') id: string): Library {
    return this.libraryService.getLibrary(id);
  }

  /**
   * POST /library
   * Create a new library
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createLibrary(@Body() library: Library): Library {
    const created = this.libraryService.createLibrary(library);
    this.worldGateway.broadcastLibraryChanged(created.id);
    return created;
  }

  /**
   * PUT /library/:id
   * Update an existing library
   */
  @Put(':id')
  updateLibrary(
    @Param('id') id: string,
    @Body() updates: Partial<Library>,
  ): Library {
    const updated = this.libraryService.updateLibrary(id, updates);
    // Worlds and lobbies hold a merged copy of every linked library. Without this they keep
    // showing the pre-edit content until someone reloads the page.
    this.worldGateway.broadcastLibraryChanged(id);
    return updated;
  }

  /**
   * DELETE /library/:id
   * Delete a library
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLibrary(@Param('id') id: string): void {
    this.libraryService.deleteLibrary(id);
    this.worldGateway.broadcastLibraryChanged(id);
  }
}
