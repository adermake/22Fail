import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AssetFile,
  AssetFolder,
  FolderContents,
  AssetType,
} from '../model/asset-browser.model';

/**
 * Library metadata (no content)
 */
export interface AssetLibrary {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  isPublic?: boolean;
  author?: string;
  dependencies?: string[]; // IDs of other libraries this library depends on
}

/**
 * Folder contents response from API
 */
export interface FolderContentsResponse {
  folder: AssetFolder | null;
  subfolders: AssetFolder[];
  files: AssetFile[];
  breadcrumbs: AssetFolder[];
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse {
  folders: AssetFolder[];
  files: AssetFile[];
}

@Injectable({ providedIn: 'root' })
export class AssetBrowserApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api/asset-browser';

  // ==================== LIBRARY OPERATIONS ====================

  getAllLibraries(): Observable<AssetLibrary[]> {
    return this.http.get<AssetLibrary[]>(`${this.baseUrl}/libraries`);
  }

  getLibrary(libraryId: string): Observable<AssetLibrary> {
    return this.http.get<AssetLibrary>(`${this.baseUrl}/libraries/${libraryId}`);
  }

  createLibrary(name: string, description?: string): Observable<AssetLibrary> {
    return this.http.post<AssetLibrary>(`${this.baseUrl}/libraries`, {
      name,
      description,
    });
  }

  updateLibrary(libraryId: string, updates: Partial<AssetLibrary>): Observable<AssetLibrary> {
    return this.http.put<AssetLibrary>(`${this.baseUrl}/libraries/${libraryId}`, updates);
  }

  deleteLibrary(libraryId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/libraries/${libraryId}`);
  }

  // ==================== FOLDER OPERATIONS ====================

  getFolder(libraryId: string, folderId: string): Observable<AssetFolder> {
    return this.http.get<AssetFolder>(
      `${this.baseUrl}/libraries/${libraryId}/folders/${folderId}`
    );
  }

  getFolderContents(libraryId: string, folderId: string): Observable<FolderContentsResponse> {
    return this.http.get<FolderContentsResponse>(
      `${this.baseUrl}/libraries/${libraryId}/folders/${folderId}/contents`
    );
  }

  createFolder(libraryId: string, name: string, parentId: string): Observable<AssetFolder> {
    return this.http.post<AssetFolder>(
      `${this.baseUrl}/libraries/${libraryId}/folders`,
      { name, parentId }
    );
  }

  renameFolder(libraryId: string, folderId: string, name: string): Observable<AssetFolder> {
    return this.http.put<AssetFolder>(
      `${this.baseUrl}/libraries/${libraryId}/folders/${folderId}/rename`,
      { name }
    );
  }

  moveFolder(libraryId: string, folderId: string, newParentId: string): Observable<AssetFolder> {
    return this.http.put<AssetFolder>(
      `${this.baseUrl}/libraries/${libraryId}/folders/${folderId}/move`,
      { newParentId }
    );
  }

  deleteFolder(libraryId: string, folderId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.baseUrl}/libraries/${libraryId}/folders/${folderId}`
    );
  }

  // ==================== FILE OPERATIONS ====================

  getFile(libraryId: string, fileId: string): Observable<AssetFile> {
    return this.http.get<AssetFile>(
      `${this.baseUrl}/libraries/${libraryId}/files/${fileId}`
    );
  }

  createFile(
    libraryId: string,
    name: string,
    type: AssetType,
    folderId: string,
    data: any
  ): Observable<AssetFile> {
    return this.http.post<AssetFile>(
      `${this.baseUrl}/libraries/${libraryId}/files`,
      { name, type, folderId, data }
    );
  }

  updateFile(
    libraryId: string,
    fileId: string,
    updates: Partial<AssetFile>
  ): Observable<AssetFile> {
    return this.http.put<AssetFile>(
      `${this.baseUrl}/libraries/${libraryId}/files/${fileId}`,
      updates
    );
  }

  moveFile(libraryId: string, fileId: string, newFolderId: string): Observable<AssetFile> {
    return this.http.put<AssetFile>(
      `${this.baseUrl}/libraries/${libraryId}/files/${fileId}/move`,
      { newFolderId }
    );
  }

  copyFile(libraryId: string, fileId: string, targetFolderId: string): Observable<AssetFile> {
    return this.http.post<AssetFile>(
      `${this.baseUrl}/libraries/${libraryId}/files/${fileId}/copy`,
      { targetFolderId }
    );
  }

  deleteFile(libraryId: string, fileId: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(
      `${this.baseUrl}/libraries/${libraryId}/files/${fileId}`
    );
  }

  // ==================== BULK OPERATIONS ====================

  bulkCopy(
    libraryId: string,
    folderIds: string[],
    fileIds: string[],
    targetFolderId: string
  ): Observable<BulkOperationResponse> {
    return this.http.post<BulkOperationResponse>(
      `${this.baseUrl}/libraries/${libraryId}/bulk/copy`,
      { folderIds, fileIds, targetFolderId }
    );
  }

  bulkMove(
    libraryId: string,
    folderIds: string[],
    fileIds: string[],
    targetFolderId: string
  ): Observable<BulkOperationResponse> {
    return this.http.post<BulkOperationResponse>(
      `${this.baseUrl}/libraries/${libraryId}/bulk/move`,
      { folderIds, fileIds, targetFolderId }
    );
  }

  bulkDelete(
    libraryId: string,
    folderIds: string[],
    fileIds: string[]
  ): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.baseUrl}/libraries/${libraryId}/bulk/delete`,
      { folderIds, fileIds }
    );
  }

  // ==================== SEARCH ====================

  searchFiles(
    libraryId: string,
    query: string,
    types?: AssetType[]
  ): Observable<AssetFile[]> {
    let url = `${this.baseUrl}/libraries/${libraryId}/search?query=${encodeURIComponent(query)}`;
    if (types && types.length > 0) {
      url += `&types=${types.join(',')}`;
    }
    return this.http.get<AssetFile[]>(url);
  }
}
