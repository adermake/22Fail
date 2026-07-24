import { Injectable, computed, inject, signal } from '@angular/core';
import { User } from '../model/user.model';
import { UserApiService } from './user-api.service';
import {
  clearStoredIdentity, getStoredIdentity, setStoredIdentity,
} from './identity';

/**
 * Current signed-in user. The device identity (id + join code) lives in localStorage via
 * `identity.ts`; this service resolves it to the full User record and exposes reactive state.
 * Soft model — the server validates the code and is the source of truth for `isAdmin`.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(UserApiService);

  readonly currentUser = signal<User | null>(null);
  /** True until the initial identity resolution completes (avoids a flash of the login screen). */
  readonly loading = signal<boolean>(true);

  readonly isSignedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.isAdmin === true);
  readonly userId = computed(() => this.currentUser()?.id ?? null);

  /** Resolve the stored device identity into a live user (called once at app start). */
  async init(): Promise<void> {
    this.loading.set(true);
    const stored = getStoredIdentity();
    if (!stored) { this.currentUser.set(null); this.loading.set(false); return; }
    try {
      const user = await this.api.resolve(stored.userId, stored.code);
      this.currentUser.set(user);
    } catch {
      // Stored identity is stale (user deleted / code regenerated) — sign out cleanly.
      clearStoredIdentity();
      this.currentUser.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  status(): Promise<{ needsBootstrap: boolean }> {
    return this.api.status();
  }

  async login(name: string, code: string): Promise<User> {
    const user = await this.api.login(name, code);
    setStoredIdentity({ userId: user.id, code: user.joinCode });
    this.currentUser.set(user);
    return user;
  }

  async bootstrapFirstAdmin(name: string): Promise<User> {
    const user = await this.api.bootstrap(name);
    setStoredIdentity({ userId: user.id, code: user.joinCode });
    this.currentUser.set(user);
    return user;
  }

  logout(): void {
    clearStoredIdentity();
    this.currentUser.set(null);
  }
}
