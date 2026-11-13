import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkillBlock } from '../../model/skill-block.model';
import { SpellBlock } from '../../model/spell-block-model';
import { LobbyTokenActionsService } from '../lobby-token-actions.service';

const COLLAPSE_KEY = 'lobby:abilities-dock-collapsed';

/**
 * Dock unten in der Lobby: alle aktivierbaren Fähigkeiten und Zauber des ausgewählten Tokens als
 * Karten. Klick aktiviert — die Karte erscheint sofort links in der Aktiv-Spalte. Vorher lagen sie
 * im schmalen rechten Panel, so weit unten, dass man für jeden Zauber scrollen musste.
 */
@Component({
  selector: 'app-lobby-abilities-dock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lobby-abilities-dock.component.html',
  styleUrl: './lobby-abilities-dock.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LobbyAbilitiesDockComponent {
  readonly svc = inject(LobbyTokenActionsService);

  // No status-effect reminder here: it belongs to the status strip of the token on turn (it used
  // to blink this dock too, which read as "something is wrong with my spells").
  @Input() canViewStats = true;

  collapsed = readCollapsed();
  filter: 'all' | 'skills' | 'spells' = 'all';
  query = '';

  private matches(name: string | undefined): boolean {
    const q = this.query.trim().toLowerCase();
    return !q || (name ?? '').toLowerCase().includes(q);
  }

  get skills(): SkillBlock[] {
    return this.filter === 'spells' ? [] : this.svc.availableSkills.filter(s => this.matches(s.name));
  }

  get spells(): SpellBlock[] {
    return this.filter === 'skills' ? [] : this.svc.availableSpells.filter(s => this.matches(s.name));
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
    try { localStorage.setItem(COLLAPSE_KEY, String(this.collapsed)); } catch { /* private mode */ }
  }
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === 'true';
  } catch {
    return false;
  }
}
