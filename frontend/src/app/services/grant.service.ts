import { Injectable, inject } from '@angular/core';
import { CharacterSocketService } from './character-socket.service';
import { JsonPatch } from '../model/json-patch.model';
import { CharacterSheet } from '../model/character-sheet-model';
import { ItemBlock } from '../model/item-block.model';
import { Currency } from '../model/currency-model';
import { ActiveStatusEffect, StatusEffect } from '../model/status-effect.model';
import { SoulBlock } from '../model/soul-block.model';
import { canMerge, mergeStacks } from '../utils/item-stack.util';
import { DeskEntry, KnowledgeKind, PendingGrant } from '../model/gm-desk.model';

/**
 * Der einzige Weg, auf dem ein Charakter etwas vom Spielleiter bekommt.
 *
 * Vorher gab es drei: Drag&Drop schrieb das ganze Inventar-Array zurück UND schickte eine
 * Loot-Benachrichtigung (der Spieler bekam alles doppelt), das Kontextmenü hängte still an, und
 * Wissen lief an beiden vorbei. Statuseffekte und drei der fünf Wissensarten hatten überhaupt
 * keinen Pfad. Deshalb: der GM schreibt nie mehr direkt in den Bogen, er *bietet an*.
 *
 * Ablauf: `offer()` hängt einen `PendingGrant` an den Bogen. Der Spieler sieht ein Popup und
 * entscheidet. Erst `acceptPatches()` legt das Ding tatsächlich ab — auf dem Client des Spielers,
 * der den aktuellen Bogen hat, also ohne Race gegen dessen eigene Änderungen. Ein Angebot
 * überlebt so auch, wenn der Spieler gerade nicht online ist.
 */
@Injectable({ providedIn: 'root' })
export class GrantService {
  private characterSocket = inject(CharacterSocketService);

  /** In welches Bogen-Feld eine Wissensart einsortiert wird. */
  private static readonly KNOWLEDGE_FIELD: Record<KnowledgeKind, keyof CharacterSheet> = {
    'material': 'knownMaterialIds',
    'forge-trait': 'knownForgeTraitIds',
    'ingredient': 'knownIngredientIds',
    'extractor': 'knownExtractorIds',
    'brew-trait': 'knownBrewTraitIds',
  };

  // ── GM-Seite ───────────────────────────────────────────────────────────────

  /** Bietet einem Charakter einen Eintrag an. Landet als Popup in dessen Bogen. */
  offer(characterId: string, entry: DeskEntry, fromName?: string): void {
    const pending: PendingGrant = {
      ...structuredClone(entry),
      claimedBy: undefined,
      hidden: undefined,
      fromName,
      offeredAt: Date.now(),
    };
    this.characterSocket.sendPatch(characterId, { path: '/pendingGrants/-', value: pending });
  }

  /** Bietet mehrere Einträge auf einmal an (z. B. einen ganzen Reiter). */
  offerAll(characterId: string, entries: DeskEntry[], fromName?: string): void {
    for (const entry of entries) this.offer(characterId, entry, fromName);
  }

  // ── Spieler-Seite ──────────────────────────────────────────────────────────

  /** Nimmt ein Angebot an: legt das Ding ab und entfernt es aus der Warteschlange. */
  accept(characterId: string, sheet: CharacterSheet, entry: PendingGrant): JsonPatch[] {
    const patches = [...this.acceptPatches(sheet, entry), this.removePendingPatch(sheet, entry)];
    for (const patch of patches) this.characterSocket.sendPatch(characterId, patch);
    return patches;
  }

  /** Lehnt ein Angebot ab: nur aus der Warteschlange nehmen. */
  decline(characterId: string, sheet: CharacterSheet, entry: PendingGrant): void {
    this.characterSocket.sendPatch(characterId, this.removePendingPatch(sheet, entry));
  }

  private removePendingPatch(sheet: CharacterSheet, entry: PendingGrant): JsonPatch {
    const rest = (sheet.pendingGrants ?? []).filter(g => g.entryId !== entry.entryId);
    return { path: '/pendingGrants', value: rest };
  }

  // ── Das Typ→Feld-Mapping ───────────────────────────────────────────────────

  /**
   * Die Patches, die einen Eintrag im Bogen ablegen. Reine Funktion des Bogens — genau deshalb
   * hier und nicht in einer Komponente, und genau deshalb testbar.
   */
  acceptPatches(sheet: CharacterSheet, entry: DeskEntry): JsonPatch[] {
    switch (entry.type) {
      case 'item':
        return this.itemPatches(sheet, structuredClone(entry.data) as ItemBlock);
      case 'resource':
        return this.resourcePatches(sheet, structuredClone(entry.data) as ItemBlock);
      case 'rune':
        return [{ path: '/runes/-', value: structuredClone(entry.data) }];
      case 'spell':
        return [{ path: '/spells/-', value: structuredClone(entry.data) }];
      case 'skill':
        return [{ path: '/skills/-', value: structuredClone(entry.data) }];
      case 'soul':
        return [{ path: '/souls/-', value: structuredClone(entry.data) as SoulBlock }];
      case 'knowledge':
        return this.knowledgePatches(sheet, entry);
      case 'status-effect':
        return this.statusEffectPatches(sheet, entry);
      case 'currency':
        return this.currencyPatches(sheet, entry.data as Currency);
      default:
        return [];
    }
  }

  /**
   * Ein Gegenstand füllt zuerst einen passenden Stapel auf, dann das erste freie Fach, und hängt
   * erst zuletzt hinten an. Das Inventar ist ein *dünn besetztes* Raster mit `null`-Löchern
   * (siehe `inventory.component`) — blindes Anhängen ließ Geschenke hinter den Löchern landen.
   */
  private itemPatches(sheet: CharacterSheet, item: ItemBlock): JsonPatch[] {
    const inventory = sheet.inventory ?? [];

    const stackIdx = inventory.findIndex(slot => canMerge(slot, item));
    if (stackIdx >= 0) {
      const { merged } = mergeStacks(inventory[stackIdx] as ItemBlock, item);
      return [{ path: `/inventory/${stackIdx}`, value: merged }];
    }

    const freeIdx = inventory.findIndex(slot => slot === null || slot === undefined);
    if (freeIdx >= 0) return [{ path: `/inventory/${freeIdx}`, value: item }];

    return [{ path: '/inventory/-', value: item }];
  }

  /** Rohstoffe liegen in einer dichten Liste — nur stapeln oder anhängen, keine Löcher. */
  private resourcePatches(sheet: CharacterSheet, resource: ItemBlock): JsonPatch[] {
    const resources = sheet.resources ?? [];
    const stackIdx = resources.findIndex(r => canMerge(r, resource));
    if (stackIdx >= 0) {
      const { merged } = mergeStacks(resources[stackIdx], resource);
      return [{ path: `/resources/${stackIdx}`, value: merged }];
    }
    return [{ path: '/resources/-', value: resource }];
  }

  /**
   * Wissen ist nur eine ID in einer Liste. `data` darf die ID selbst oder das ganze Asset sein —
   * ein Asset trägt seine ID mal in `data.id`, mal nur als Datei-ID, und wer hier den falschen
   * Zweig nimmt, vergibt Wissen, das der Bogen anschließend nicht wiederfindet.
   */
  private knowledgePatches(sheet: CharacterSheet, entry: DeskEntry): JsonPatch[] {
    const kind = entry.knowledgeKind;
    if (!kind) return [];
    const field = GrantService.KNOWLEDGE_FIELD[kind];
    const id = typeof entry.data === 'string'
      ? entry.data
      : (entry.data as { id?: string } | null)?.id ?? '';
    if (!id) return [];

    const known = (sheet[field] as string[] | undefined) ?? [];
    if (known.includes(id)) return [];
    return [{ path: `/${String(field)}/-`, value: id }];
  }

  /**
   * Ein Statuseffekt wird angewendet UND als "gesehen" vermerkt, damit der Spieler ihn danach
   * selbst wieder anlegen kann.
   */
  private statusEffectPatches(sheet: CharacterSheet, entry: DeskEntry): JsonPatch[] {
    const effect = entry.data as StatusEffect;
    if (!effect?.id) return [];

    const active: ActiveStatusEffect = {
      statusEffectId: effect.id,
      sourceLibraryId: entry.sourceRef?.libraryId ?? '',
      appliedAt: Date.now(),
      appliedBy: 'gm',
      duration: effect.defaultDuration,
      stacks: 1,
    };

    const patches: JsonPatch[] = [{ path: '/activeStatusEffects/-', value: active }];
    if (!(sheet.seenStatusEffectIds ?? []).includes(effect.id)) {
      patches.push({ path: '/seenStatusEffectIds/-', value: effect.id });
    }
    return patches;
  }

  private currencyPatches(sheet: CharacterSheet, gained: Currency): JsonPatch[] {
    const have = sheet.currency ?? { copper: 0, silver: 0, gold: 0, platinum: 0 };
    const sum: Currency = {
      copper: (have.copper ?? 0) + (gained?.copper ?? 0),
      silver: (have.silver ?? 0) + (gained?.silver ?? 0),
      gold: (have.gold ?? 0) + (gained?.gold ?? 0),
      platinum: (have.platinum ?? 0) + (gained?.platinum ?? 0),
    };
    return [{ path: '/currency', value: sum }];
  }
}
