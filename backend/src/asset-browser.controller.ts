import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { AssetBrowserService } from './asset-browser.service';
import type { AssetType, AssetFile, AssetFolder, AssetLibrary } from './asset-browser.service';

// DTOs
class CreateLibraryDto {
  name: string;
  description?: string;
}

class UpdateLibraryDto {
  name?: string;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  author?: string;
}

class CreateFolderDto {
  name: string;
  parentId: string;
}

class RenameFolderDto {
  name: string;
}

class MoveFolderDto {
  newParentId: string;
}

class CreateFileDto {
  name: string;
  type: AssetType;
  folderId: string;
  data: any;
}

class UpdateFileDto {
  name?: string;
  data?: any;
  tags?: string[];
}

class MoveFileDto {
  newFolderId: string;
}

class CopyFileDto {
  targetFolderId: string;
}

class BulkOperationDto {
  folderIds: string[];
  fileIds: string[];
  targetFolderId: string;
}

class BulkDeleteDto {
  folderIds: string[];
  fileIds: string[];
}

class SearchDto {
  query: string;
  types?: AssetType[];
}

@Controller('api/asset-browser')
export class AssetBrowserController {
  constructor(private readonly assetBrowserService: AssetBrowserService) {}

  // ==================== LIBRARY ENDPOINTS ====================

  @Get('libraries')
  getAllLibraries(): AssetLibrary[] {
    return this.assetBrowserService.getAllLibraries();
  }

  @Get('libraries/:libraryId')
  getLibrary(@Param('libraryId') libraryId: string): AssetLibrary {
    return this.assetBrowserService.getLibrary(libraryId);
  }

  @Post('libraries')
  createLibrary(@Body() dto: CreateLibraryDto): AssetLibrary {
    return this.assetBrowserService.createLibrary(dto.name, dto.description);
  }

  @Put('libraries/:libraryId')
  updateLibrary(
    @Param('libraryId') libraryId: string,
    @Body() dto: UpdateLibraryDto,
  ): AssetLibrary {
    return this.assetBrowserService.updateLibrary(libraryId, dto);
  }

  @Delete('libraries/:libraryId')
  deleteLibrary(@Param('libraryId') libraryId: string): { success: boolean } {
    this.assetBrowserService.deleteLibrary(libraryId);
    return { success: true };
  }

  // ==================== FOLDER ENDPOINTS ====================

  @Get('libraries/:libraryId/folders/:folderId')
  getFolder(
    @Param('libraryId') libraryId: string,
    @Param('folderId') folderId: string,
  ): AssetFolder {
    return this.assetBrowserService.getFolder(libraryId, folderId);
  }

  @Get('libraries/:libraryId/folders/:folderId/contents')
  getFolderContents(
    @Param('libraryId') libraryId: string,
    @Param('folderId') folderId: string,
  ) {
    return this.assetBrowserService.getFolderContents(libraryId, folderId);
  }

  @Post('libraries/:libraryId/folders')
  createFolder(
    @Param('libraryId') libraryId: string,
    @Body() dto: CreateFolderDto,
  ): AssetFolder {
    return this.assetBrowserService.createFolder(libraryId, dto.name, dto.parentId);
  }

  @Put('libraries/:libraryId/folders/:folderId/rename')
  renameFolder(
    @Param('libraryId') libraryId: string,
    @Param('folderId') folderId: string,
    @Body() dto: RenameFolderDto,
  ): AssetFolder {
    return this.assetBrowserService.renameFolder(libraryId, folderId, dto.name);
  }

  @Put('libraries/:libraryId/folders/:folderId/move')
  moveFolder(
    @Param('libraryId') libraryId: string,
    @Param('folderId') folderId: string,
    @Body() dto: MoveFolderDto,
  ): AssetFolder {
    return this.assetBrowserService.moveFolder(libraryId, folderId, dto.newParentId);
  }

  @Delete('libraries/:libraryId/folders/:folderId')
  deleteFolder(
    @Param('libraryId') libraryId: string,
    @Param('folderId') folderId: string,
  ): { success: boolean } {
    this.assetBrowserService.deleteFolder(libraryId, folderId);
    return { success: true };
  }

  // ==================== FILE ENDPOINTS ====================

  @Get('libraries/:libraryId/files/:fileId')
  getFile(
    @Param('libraryId') libraryId: string,
    @Param('fileId') fileId: string,
  ): AssetFile {
    return this.assetBrowserService.getFile(libraryId, fileId);
  }

  @Post('libraries/:libraryId/files')
  createFile(
    @Param('libraryId') libraryId: string,
    @Body() dto: CreateFileDto,
  ): AssetFile {
    return this.assetBrowserService.createFile(
      libraryId,
      dto.name,
      dto.type,
      dto.folderId,
      dto.data,
    );
  }

  @Put('libraries/:libraryId/files/:fileId')
  updateFile(
    @Param('libraryId') libraryId: string,
    @Param('fileId') fileId: string,
    @Body() dto: UpdateFileDto,
  ): AssetFile {
    return this.assetBrowserService.updateFile(libraryId, fileId, dto);
  }

  @Put('libraries/:libraryId/files/:fileId/move')
  moveFile(
    @Param('libraryId') libraryId: string,
    @Param('fileId') fileId: string,
    @Body() dto: MoveFileDto,
  ): AssetFile {
    return this.assetBrowserService.moveFile(libraryId, fileId, dto.newFolderId);
  }

  @Post('libraries/:libraryId/files/:fileId/copy')
  copyFile(
    @Param('libraryId') libraryId: string,
    @Param('fileId') fileId: string,
    @Body() dto: CopyFileDto,
  ): AssetFile {
    return this.assetBrowserService.copyFile(libraryId, fileId, dto.targetFolderId);
  }

  @Delete('libraries/:libraryId/files/:fileId')
  deleteFile(
    @Param('libraryId') libraryId: string,
    @Param('fileId') fileId: string,
  ): { success: boolean } {
    this.assetBrowserService.deleteFile(libraryId, fileId);
    return { success: true };
  }

  // ==================== BULK OPERATIONS ====================

  @Post('libraries/:libraryId/bulk/copy')
  bulkCopy(
    @Param('libraryId') libraryId: string,
    @Body() dto: BulkOperationDto,
  ) {
    return this.assetBrowserService.copyMultiple(
      libraryId,
      dto.folderIds,
      dto.fileIds,
      dto.targetFolderId,
    );
  }

  @Post('libraries/:libraryId/bulk/move')
  bulkMove(
    @Param('libraryId') libraryId: string,
    @Body() dto: BulkOperationDto,
  ) {
    return this.assetBrowserService.moveMultiple(
      libraryId,
      dto.folderIds,
      dto.fileIds,
      dto.targetFolderId,
    );
  }

  @Post('libraries/:libraryId/bulk/delete')
  bulkDelete(
    @Param('libraryId') libraryId: string,
    @Body() dto: BulkDeleteDto,
  ): { success: boolean } {
    this.assetBrowserService.deleteMultiple(libraryId, dto.folderIds, dto.fileIds);
    return { success: true };
  }

  // ==================== SEARCH ====================

  @Get('libraries/:libraryId/search')
  searchFiles(
    @Param('libraryId') libraryId: string,
    @Query('query') query: string,
    @Query('types') types?: string,
  ): AssetFile[] {
    const typeArray = types ? (types.split(',') as AssetType[]) : undefined;
    return this.assetBrowserService.searchFiles(libraryId, query, typeArray);
  }
}
