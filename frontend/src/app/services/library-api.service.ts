import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Library } from '../model/library.model';

/**
 * Library API Service
 * Handles HTTP communication with the backend library endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class LibraryApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/library';

  /**
   * Get all libraries
   */
  getAllLibraries(): Observable<Library[]> {
    return this.http.get<Library[]>(this.baseUrl);
  }

  /**
   * Get libraries by tag
   */
  getLibrariesByTag(tag: string): Observable<Library[]> {
    return this.http.get<Library[]>(`${this.baseUrl}?tag=${encodeURIComponent(tag)}`);
  }

  /**
   * Get public libraries
   */
  getPublicLibraries(): Observable<Library[]> {
    return this.http.get<Library[]>(`${this.baseUrl}?public=true`);
  }

  /**
   * Get a single library by ID
   */
  getLibrary(libraryId: string): Observable<Library> {
    return this.http.get<Library>(`${this.baseUrl}/${libraryId}`);
  }

  /**
   * Create a new library
   */
  createLibrary(library: Library): Observable<Library> {
    return this.http.post<Library>(this.baseUrl, library);
  }

  /**
   * Update an existing library
   */
  updateLibrary(libraryId: string, updates: Partial<Library>): Observable<Library> {
    return this.http.put<Library>(`${this.baseUrl}/${libraryId}`, updates);
  }

  /**
   * Delete a library
   */
  deleteLibrary(libraryId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${libraryId}`);
  }
}
