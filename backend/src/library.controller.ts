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

@Controller('api/library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryServiceModule.LibraryService) {}

  /**
   * GET /library
   * Get all libraries or filter by query parameters
   */
  @Get()
  getAllLibraries(@Query('tag') tag?: string, @Query('public') isPublic?: string): Library[] {
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
    return this.libraryService.createLibrary(library);
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
    return this.libraryService.updateLibrary(id, updates);
  }

  /**
   * DELETE /library/:id
   * Delete a library
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLibrary(@Param('id') id: string): void {
    this.libraryService.deleteLibrary(id);
  }
}
