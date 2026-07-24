import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User } from '../model/user.model';

/** Thin client for the /api/users endpoints. Identity headers are added by the interceptor. */
@Injectable({ providedIn: 'root' })
export class UserApiService {
  private http = inject(HttpClient);
  private base = '/api/users';

  status(): Promise<{ needsBootstrap: boolean }> {
    return firstValueFrom(this.http.get<{ needsBootstrap: boolean }>(`${this.base}/status`));
  }

  bootstrap(name: string): Promise<User> {
    return firstValueFrom(this.http.post<User>(`${this.base}/bootstrap`, { name }));
  }

  login(name: string, code: string): Promise<User> {
    return firstValueFrom(this.http.post<User>(`${this.base}/login`, { name, code }));
  }

  /** Re-validate a stored device identity (id + code). */
  resolve(userId: string, code: string): Promise<User> {
    return firstValueFrom(this.http.post<User>(`${this.base}/resolve`, { userId, code }));
  }

  // Admin
  list(): Promise<User[]> {
    return firstValueFrom(this.http.get<User[]>(this.base));
  }

  create(name: string, isAdmin = false): Promise<User> {
    return firstValueFrom(this.http.post<User>(this.base, { name, isAdmin }));
  }

  update(id: string, patch: { name?: string; isAdmin?: boolean; regenerateCode?: boolean }): Promise<User> {
    return firstValueFrom(this.http.patch<User>(`${this.base}/${id}`, patch));
  }

  remove(id: string): Promise<{ ok: boolean }> {
    return firstValueFrom(this.http.delete<{ ok: boolean }>(`${this.base}/${id}`));
  }
}
