import { Injectable, computed, inject, signal } from '@angular/core';
import { User } from '../model/user.model';
import { UserApiService } from './user-api.service';
import {
  KnownAccount, clearStoredIdentity, forgetAccount, getKnownAccounts, getStoredIdentity,
  rememberAccount, setStoredIdentity,
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
  /** Every account this device has signed in with — powers the account switcher. */
  readonly knownAccounts = signal<KnownAccount[]>(getKnownAccounts());
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
      this.remember(user);
      this.currentUser.set(user);
    } catch {
      // Stored identity is stale (user deleted / code regenerated) — sign out cleanly.
      clearStoredIdentity();
      forgetAccount(stored.userId);
      this.knownAccounts.set(getKnownAccounts());
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
    return this.signIn(user);
  }

  async bootstrapFirstAdmin(name: string): Promise<User> {
    const user = await this.api.bootstrap(name);
    return this.signIn(user);
  }

  /** One-click sign-in for an account this device already remembers. */
  async loginWithKnownAccount(acc: KnownAccount): Promise<User> {
    try {
      const user = await this.api.resolve(acc.userId, acc.code);
      return this.signIn(user);
    } catch (e) {
      // The stored code no longer works — drop it so the list stays honest.
      this.forget(acc.userId);
      throw e;
    }
  }

  /** All accounts on the server, behind the master password (rescue / debugging). */
  rootList(password: string): Promise<User[]> {
    return this.api.rootList(password);
  }

  forget(userId: string): void {
    forgetAccount(userId);
    this.knownAccounts.set(getKnownAccounts());
  }

  logout(): void {
    clearStoredIdentity();
    this.currentUser.set(null);
  }

  /** Persist the identity, remember the account for later switching, and go live. */
  private signIn(user: User): User {
    setStoredIdentity({ userId: user.id, code: user.joinCode });
    this.remember(user);
    this.currentUser.set(user);
    return user;
  }

  private remember(user: User): void {
    rememberAccount({
      userId: user.id, code: user.joinCode, name: user.name, isAdmin: user.isAdmin,
    });
    this.knownAccounts.set(getKnownAccounts());
  }
}
