import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { UserApiService } from '../services/user-api.service';
import { CharacterApiService, CharacterSummary } from '../services/character-api.service';
import { WorldApiService, WorldSummary } from '../services/world-api.service';
import { User } from '../model/user.model';
import { createEmptySheet } from '../model/character-sheet-model';
import { createEmptyWorld } from '../model/world.model';

/**
 * The app's home. Replaces the old "type a URL" flow: you identify yourself once (name + join
 * code), then everything you can reach lives here. Admins additionally get creation/management.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private auth = inject(AuthService);
  private userApi = inject(UserApiService);
  private characterApi = inject(CharacterApiService);
  private worldApi = inject(WorldApiService);
  private router = inject(Router);

  // Auth state (from AuthService signals)
  readonly loading = this.auth.loading;
  readonly user = this.auth.currentUser;
  readonly isAdmin = this.auth.isAdmin;

  // Identify screen
  needsBootstrap = signal(false);
  loginName = '';
  loginCode = '';
  bootstrapName = '';
  authError = signal('');
  busy = signal(false);

  // Dashboard data
  private characters = signal<CharacterSummary[]>([]);
  private worlds = signal<WorldSummary[]>([]);
  users = signal<User[]>([]);

  // New-thing inputs
  newCharName = '';
  newWorldName = '';
  newUserName = '';
  showUserManager = signal(false);
  assignTarget = signal<CharacterSummary | null>(null);

  readonly myCharacters = computed(() => {
    const uid = this.user()?.id;
    if (!uid) return [];
    return this.characters().filter(c => (c.controllerUserIds ?? []).includes(uid));
  });

  /** Worlds to show: all for admin, else worlds where I control a character. */
  readonly myWorlds = computed(() => {
    if (this.isAdmin()) return this.worlds();
    const myCharIds = new Set(this.myCharacters().map(c => c.id));
    const myWorldNames = new Set(this.myCharacters().map(c => c.worldName).filter(Boolean) as string[]);
    return this.worlds().filter(w =>
      myWorldNames.has(w.name) || w.characterIds.some(id => myCharIds.has(id)));
  });

  /** All characters (admin view — for assigning control). */
  readonly allCharacters = computed(() => this.characters());

  constructor() {
    // When identity resolves (or changes), (re)load the dashboard; when signed out, fetch status.
    effect(() => {
      const u = this.user();
      if (u) this.loadDashboard();
      else if (!this.loading()) this.refreshStatus();
    });
  }

  private async refreshStatus(): Promise<void> {
    try {
      const s = await this.auth.status();
      this.needsBootstrap.set(s.needsBootstrap);
    } catch { /* backend down — leave as-is */ }
  }

  private async loadDashboard(): Promise<void> {
    try {
      const [chars, worlds] = await Promise.all([
        this.characterApi.getCharacterSummaries(),
        this.worldApi.listWorlds(),
      ]);
      this.characters.set(chars);
      this.worlds.set(worlds);
      if (this.isAdmin()) this.users.set(await this.userApi.list().catch(() => []));
    } catch { /* ignore */ }
  }

  // ── Identify ──
  async doLogin(): Promise<void> {
    this.authError.set('');
    if (!this.loginName.trim() || !this.loginCode.trim()) return;
    this.busy.set(true);
    try {
      await this.auth.login(this.loginName.trim(), this.loginCode.trim());
    } catch {
      this.authError.set('Name oder Code ist nicht korrekt.');
    } finally {
      this.busy.set(false);
    }
  }

  async doBootstrap(): Promise<void> {
    this.authError.set('');
    if (!this.bootstrapName.trim()) return;
    this.busy.set(true);
    try {
      await this.auth.bootstrapFirstAdmin(this.bootstrapName.trim());
    } catch {
      this.authError.set('Konnte den ersten Admin nicht erstellen (existiert bereits?).');
      this.refreshStatus();
    } finally {
      this.busy.set(false);
    }
  }

  switchUser(): void {
    this.auth.logout();
    this.characters.set([]);
    this.worlds.set([]);
    this.users.set([]);
    this.loginName = '';
    this.loginCode = '';
    this.refreshStatus();
  }

  // ── Characters ──
  private sanitize(s: string): string {
    return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'char';
  }

  async createCharacter(): Promise<void> {
    const name = this.newCharName.trim();
    if (!name) return;
    const id = `${this.sanitize(name)}_${Date.now()}`;
    const sheet = createEmptySheet();
    sheet.id = id;
    sheet.name = name;
    const uid = this.user()?.id;
    if (uid) sheet.controllerUserIds = [uid];
    await this.characterApi.saveCharacter(id, sheet);
    this.newCharName = '';
    this.router.navigate(['/characters', id]);
  }

  openSheet(id: string): void { this.router.navigate(['/characters', id]); }
  openLobby(world: string): void { this.router.navigate(['/lobby', world]); }
  openMap(world: string): void { this.router.navigate(['/world-map', world]); }
  openWorld(world: string): void { this.router.navigate(['/world', world]); }

  // ── Admin: worlds ──
  async createWorld(): Promise<void> {
    const name = this.newWorldName.trim();
    if (!name || !this.isAdmin()) return;
    const world = createEmptyWorld(name);
    await this.worldApi.saveWorld(name, world);
    this.newWorldName = '';
    await this.loadDashboard();
    this.openWorld(name);
  }

  // ── Admin: users ──
  async createUser(): Promise<void> {
    const name = this.newUserName.trim();
    if (!name || !this.isAdmin()) return;
    this.busy.set(true);
    try {
      await this.userApi.create(name);
      this.newUserName = '';
      this.users.set(await this.userApi.list());
    } finally {
      this.busy.set(false);
    }
  }

  async toggleAdmin(u: User): Promise<void> {
    if (!this.isAdmin() || u.id === this.user()?.id) return;
    await this.userApi.update(u.id, { isAdmin: !u.isAdmin });
    this.users.set(await this.userApi.list());
  }

  async regenerateCode(u: User): Promise<void> {
    if (!this.isAdmin()) return;
    await this.userApi.update(u.id, { regenerateCode: true });
    this.users.set(await this.userApi.list());
  }

  async deleteUser(u: User): Promise<void> {
    if (!this.isAdmin() || u.id === this.user()?.id) return;
    if (!confirm(`Nutzer "${u.name}" löschen?`)) return;
    await this.userApi.remove(u.id);
    this.users.set(await this.userApi.list());
  }

  // ── Admin: assign character control ──
  userControls(c: CharacterSummary, u: User): boolean {
    return (c.controllerUserIds ?? []).includes(u.id);
  }

  async toggleControl(c: CharacterSummary, u: User): Promise<void> {
    if (!this.isAdmin()) return;
    const set = new Set(c.controllerUserIds ?? []);
    if (set.has(u.id)) set.delete(u.id); else set.add(u.id);
    const ids = [...set];
    await this.characterApi.setControllers(c.id, ids);
    // reflect locally
    this.characters.set(this.characters().map(x => x.id === c.id ? { ...x, controllerUserIds: ids } : x));
    const t = this.assignTarget();
    if (t && t.id === c.id) this.assignTarget.set({ ...t, controllerUserIds: ids });
  }
}
