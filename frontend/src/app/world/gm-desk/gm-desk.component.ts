import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDragPreview, CdkDropList } from '@angular/cdk/drag-drop';

import { ItemBlock } from '../../model/item-block.model';
import { RuneBlock } from '../../model/rune-block.model';
import { SpellBlock } from '../../model/spell-block-model';
import { SkillBlock } from '../../model/skill-block.model';
import { StatusEffect } from '../../model/status-effect.model';
import { CharacterSheet } from '../../model/character-sheet-model';
import { Token } from '../../model/lobby.model';
import { formatCurrency, Currency } from '../../model/current-events.model';
import {
  createDeskEntry,
  createDeskTab,
  DeskEntry,
  DeskTab,
  GrantType,
  GRANT_TYPE_ICON,
  GRANT_TYPE_LABEL,
  KnowledgeKind,
  KNOWLEDGE_KIND_LABEL,
} from '../../model/gm-desk.model';
import { ImageUrlPipe } from '../../shared/image-url.pipe';
import { ItemComponent } from '../../sheet/item/item.component';
import { ItemEditorComponent } from '../../sheet/item-editor/item-editor.component';
import { createEmptySheet } from '../../model/character-sheet-model';
import {
  goldValue, isUnidentified, kindLabel, previewText, stackCount, tokenLabel,
} from '../../utils/entry-preview.util';

/** Eine Kategorie im Bibliotheks-Browser (Spalte 3). */
interface BrowseCategory {
  id: string;
  label: string;
  type: GrantType;
  knowledgeKind?: KnowledgeKind;
}

/** Ein Eintrag der Bibliothek, unabhängig davon, woher er stammt. */
export interface BrowseEntry {
  id: string;
  name: string;
  folder: string;
  data: unknown;
  /** Aus welcher Bibliothek der Eintrag stammt — damit man ihn dort wiederfindet. */
  libraryId?: string;
  libraryName?: string;
}

interface BrowseFolder {
  path: string;
  label: string;
  entries: BrowseEntry[];
}

/** Ein Reiter der mittleren Spalte: entweder ein GM-Reiter oder ein NSC der aktiven Karte. */
interface DeskTabView {
  key: string;
  name: string;
  kind: 'desk' | 'npc';
  revealed: boolean;
  count: number;
}

/**
 * Der GM-Schreibtisch: Porträts ⟂ Vorbereitung ⟂ Bibliothek.
 *
 * Löst die alte "Bibliothek" ab, in der 100+ Einträge unsortiert in einer Liste lagen. Der
 * Spielleiter legt Dinge jeder Art in benannte Reiter, schiebt sie per Klick an einen
 * ausgewählten Spieler, und deckt einzelne Reiter als gemeinsame Beute auf.
 */
@Component({
  selector: 'app-gm-desk',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkDrag, CdkDragPreview, CdkDropList, ImageUrlPipe,
            ItemComponent, ItemEditorComponent],
  templateUrl: './gm-desk.component.html',
  styleUrl: './gm-desk.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GmDeskComponent implements OnDestroy {
  private cdr = inject(ChangeDetectorRef);

  // ── Eingänge ───────────────────────────────────────────────────────────────

  @Input({ required: true }) set deskTabs(value: DeskTab[]) { this.tabs.set(value ?? []); }
  @Input({ required: true }) set partyMembers(value: { id: string; sheet: CharacterSheet }[]) {
    this.members.set(value ?? []);
  }
  /** NSC-Token der aktiven Lobby-Karte — je einer bekommt einen Reiter. */
  @Input() set npcTokens(value: Token[]) { this.npcs.set(value ?? []); }

  /**
   * Der gesamte Bestand, nach Kategorie-ID sortiert. Ein einziger Eingang statt sieben, damit
   * jeder Eintrag dieselben Angaben trägt — vor allem, aus welcher Bibliothek er stammt.
   */
  @Input() catalog: Record<string, BrowseEntry[]> = {};
  /** Die mit der Welt verknüpften Bibliotheken — als direkter Weg in den Editor. */
  @Input() linkedLibraries: { id: string; name: string }[] = [];

  // ── Ausgänge ───────────────────────────────────────────────────────────────

  /** Der Schreibtisch hat sich geändert und muss in die Welt zurückgeschrieben werden. */
  @Output() deskChanged = new EventEmitter<DeskTab[]>();
  /** Ein Ding soll einem Spieler angeboten werden. */
  @Output() offerToCharacter = new EventEmitter<{ characterId: string; entry: DeskEntry }>();
  /** Das Inventar eines NSC-Tokens hat sich geändert. */
  @Output() npcInventoryChanged = new EventEmitter<{ tokenId: string; inventory: ItemBlock[] }>();
  /** Die Kennzeichnung eines NSC-Tokens wurde geändert ("Kultist 2" → "Anführer"). */
  @Output() npcTagChanged = new EventEmitter<{ tokenId: string; tag: string }>();
  /** Ein Ding wandert in den gemeinsamen Beutel der Gruppe. */
  @Output() depositToStash = new EventEmitter<ItemBlock>();
  @Output() openLibrarySelector = new EventEmitter<void>();
  /** Diesen Eintrag im Bibliotheks-Editor öffnen (bearbeiten). */
  @Output() openInLibrary = new EventEmitter<BrowseEntry>();
  /** Eine ganze Bibliothek im Editor öffnen. */
  @Output() openLibrary = new EventEmitter<string>();

  // ── Zustand ────────────────────────────────────────────────────────────────

  readonly tabs = signal<DeskTab[]>([]);
  readonly members = signal<{ id: string; sheet: CharacterSheet }[]>([]);
  readonly npcs = signal<Token[]>([]);

  /** Ausgewählter Spieler; solange einer gewählt ist, geht jedes ＋ direkt an ihn. */
  readonly selectedCharacterId = signal<string | null>(null);
  readonly activeTabKey = signal<string | null>(null);
  readonly renamingTabId = signal<string | null>(null);

  readonly browseCategoryId = signal<string>('item');
  readonly search = signal<string>('');
  /**
   * Ordner sind standardmäßig OFFEN — hier wird gemerkt, welche der GM zugeklappt hat. Andersherum
   * (offene merken) begrüßt einen die Bibliothek mit lauter zugeklappten Ordnern, und man klickt
   * sich erst einmal durch, bevor man irgendetwas sieht.
   */
  readonly closedFolders = signal<Set<string>>(new Set());
  /** Zuletzt angeklickte Bibliotheks-ID — blitzt kurz grün als Klick-Quittung. */
  readonly justAddedId = signal<string | null>(null);
  private justAddedTimer?: number;

  readonly typeIcon = GRANT_TYPE_ICON;
  readonly typeLabel = GRANT_TYPE_LABEL;

  // Kurzinfos für Zeilen und Tooltips — geteilt mit dem NSC-Editor.
  readonly goldValue = goldValue;
  readonly isUnidentified = isUnidentified;
  readonly kindLabel = kindLabel;
  readonly previewText = previewText;
  readonly stackCount = stackCount;

  readonly categories: BrowseCategory[] = [
    { id: 'item', label: 'Gegenstände', type: 'item' },
    { id: 'spell', label: 'Zauber', type: 'spell' },
    { id: 'skill', label: 'Fähigkeiten', type: 'skill' },
    { id: 'rune', label: 'Runen', type: 'rune' },
    { id: 'resource', label: 'Materialien', type: 'resource' },
    { id: 'status-effect', label: 'Statuseffekte', type: 'status-effect' },
    { id: 'material', label: 'Materialwissen', type: 'knowledge', knowledgeKind: 'material' },
    { id: 'forge-trait', label: 'Schmiedewissen', type: 'knowledge', knowledgeKind: 'forge-trait' },
    { id: 'ingredient', label: 'Wirkstoffwissen', type: 'knowledge', knowledgeKind: 'ingredient' },
    { id: 'extractor', label: 'Extraktorwissen', type: 'knowledge', knowledgeKind: 'extractor' },
    { id: 'brew-trait', label: 'Braumerkmale', type: 'knowledge', knowledgeKind: 'brew-trait' },
  ];

  ngOnDestroy(): void {
    if (this.justAddedTimer) clearTimeout(this.justAddedTimer);
  }

  // ── Ansehen & Bearbeiten (wie im Spielerinventar) ──────────────────────────

  /**
   * Stub-Bogen, damit `app-item` einen Gegenstand anzeigen kann. Die Werte stehen hoch, damit
   * Voraussetzungs-Badges nie fälschlich rot leuchten — der Schreibtisch gehört keinem Charakter.
   */
  readonly previewSheet = (() => {
    const sheet = createEmptySheet();
    for (const key of ['strength', 'dexterity', 'speed', 'intelligence', 'constitution', 'chill'] as const) {
      Object.assign(sheet[key], { current: 999, base: 999 });
    }
    return sheet;
  })();

  /** entryId, dessen Karte gerade aufgeklappt ist. */
  readonly expandedEntryId = signal<string | null>(null);
  /** entryId, der gerade im Editor liegt. */
  readonly editingEntryId = signal<string | null>(null);

  toggleEntryDetails(entry: DeskEntry): void {
    this.expandedEntryId.update(id => (id === entry.entryId ? null : entry.entryId));
  }

  /** Nur Gegenstände lassen sich hier voll anzeigen und bearbeiten. */
  canInspect(entry: DeskEntry): boolean { return entry.type === 'item'; }

  itemOf(entry: DeskEntry): ItemBlock { return entry.data as ItemBlock; }

  openEntryEditor(entry: DeskEntry, event: MouseEvent): void {
    event.stopPropagation();
    this.editingEntryId.set(entry.entryId);
  }

  closeEntryEditor(): void { this.editingEntryId.set(null); }

  /** Der bearbeitete Gegenstand, oder null wenn kein Editor offen ist. */
  readonly editingItem = computed<ItemBlock | null>(() => {
    const id = this.editingEntryId();
    if (!id) return null;
    const entry = this.activeEntries().find(e => e.entryId === id);
    return entry ? (entry.data as ItemBlock) : null;
  });

  /** Speichert die Änderung zurück in den Reiter bzw. ins Token-Inventar. */
  saveEntryEdit(item: ItemBlock): void {
    const id = this.editingEntryId();
    const tab = this.activeTab();
    if (!id || !tab) return;

    if (tab.kind === 'desk') {
      this.deskChanged.emit(this.tabs().map(t => t.tabId !== tab.key ? t : {
        ...t,
        entries: t.entries.map(e => (e.entryId === id ? { ...e, data: item, name: item.name } : e)),
      }));
    } else {
      const token = this.npcs().find(t => 'npc:' + t.id === tab.key);
      if (token) {
        const index = Number(id.split(':').pop());
        const inventory = [...(token.inventory ?? [])];
        inventory[index] = item;
        this.npcInventoryChanged.emit({ tokenId: token.id, inventory });
      }
    }
    this.closeEntryEditor();
  }

  /** Eine Änderung aus der Item-Karte heraus (z. B. Stückzahl, identifiziert). */
  onEntryPatch(entry: DeskEntry, patch: { path: string; value: unknown }): void {
    const item = { ...(entry.data as ItemBlock) } as Record<string, unknown>;
    item[patch.path.replace(/^\//, '')] = patch.value;
    this.editingEntryId.set(entry.entryId);
    this.saveEntryEdit(item as unknown as ItemBlock);
  }

  // ── Spalte 1: Spieler ──────────────────────────────────────────────────────

  toggleCharacter(characterId: string): void {
    this.selectedCharacterId.update(id => (id === characterId ? null : characterId));
  }

  get selectedName(): string {
    const id = this.selectedCharacterId();
    if (!id) return '';
    return this.members().find(m => m.id === id)?.sheet.name || id;
  }

  // ── Spalte 2: Reiter ───────────────────────────────────────────────────────

  readonly tabViews = computed<DeskTabView[]>(() => [
    ...this.tabs().map(t => ({
      key: t.tabId, name: t.name, kind: 'desk' as const,
      revealed: t.revealed, count: t.entries.length,
    })),
    ...this.npcs().map(t => ({
      // Mit Kennzeichnung, sonst heißen fünf Kultisten alle gleich und man weiß nicht,
      // welcher Reiter zu welchem Token auf der Karte gehört.
      key: 'npc:' + t.id, name: tokenLabel(t), kind: 'npc' as const,
      revealed: false, count: (t.inventory ?? []).length,
    })),
  ]);

  /** Der gerade offene Reiter; fällt auf den ersten zurück, wenn der alte verschwunden ist. */
  readonly activeTab = computed<DeskTabView | null>(() => {
    const views = this.tabViews();
    if (!views.length) return null;
    return views.find(v => v.key === this.activeTabKey()) ?? views[0];
  });

  /** Was im offenen Reiter liegt — für NSC-Reiter das Token-Inventar als Einträge verpackt. */
  readonly activeEntries = computed<DeskEntry[]>(() => {
    const tab = this.activeTab();
    if (!tab) return [];
    if (tab.kind === 'desk') {
      return this.tabs().find(t => t.tabId === tab.key)?.entries ?? [];
    }
    const token = this.npcs().find(t => 'npc:' + t.id === tab.key);
    return (token?.inventory ?? []).map((item, i) =>
      ({ ...createDeskEntry('item', item, { name: item.name }), entryId: `${tab.key}:${i}` }));
  });

  selectTab(key: string): void {
    this.activeTabKey.set(key);
    this.renamingTabId.set(null);
  }

  addTab(): void {
    const tab = createDeskTab('Neuer Reiter');
    this.deskChanged.emit([...this.tabs(), tab]);
    this.activeTabKey.set(tab.tabId);
  }

  renameTab(tabId: string, name: string): void {
    // Ein NSC-Reiter heißt wie sein Token — umbenennen heißt hier: die Kennzeichnung ändern.
    if (tabId.startsWith('npc:')) {
      const token = this.npcs().find(t => 'npc:' + t.id === tabId);
      if (token) this.npcTagChanged.emit({ tokenId: token.id, tag: name.replace(token.name, '').trim() });
      this.renamingTabId.set(null);
      return;
    }
    this.deskChanged.emit(this.tabs().map(t => (t.tabId === tabId ? { ...t, name } : t)));
    this.renamingTabId.set(null);
  }

  /**
   * Leert den Reiter, ohne ihn zu löschen. Das ✕ oben stand vorher für "Reiter weg" — was
   * niemand erwartet, der es neben einer Liste sieht. Löschen liegt jetzt im Rechtsklick.
   */
  clearTab(tabId: string): void {
    this.deskChanged.emit(
      this.tabs().map(t => (t.tabId === tabId ? { ...t, entries: [] } : t)),
    );
  }

  deleteTab(tabId: string): void {
    this.deskChanged.emit(this.tabs().filter(t => t.tabId !== tabId));
    if (this.activeTabKey() === tabId) this.activeTabKey.set(null);
    this.tabMenuFor.set(null);
  }

  /** Reiter, dessen Rechtsklick-Menü offen ist, samt Position. */
  readonly tabMenuFor = signal<{ key: string; x: number; y: number } | null>(null);

  onTabContextMenu(event: MouseEvent, tab: DeskTabView): void {
    event.preventDefault();
    this.tabMenuFor.set({ key: tab.key, x: event.clientX, y: event.clientY });
  }

  /** NSC-Reiter lassen sich nicht löschen — sie gehören einem Token auf der Karte. */
  isDeskTab(key: string): boolean { return !key.startsWith('npc:'); }

  closeTabMenu(): void { this.tabMenuFor.set(null); }

  /** Aufdecken: der Reiter erscheint bei den Spielern unter Aktive Events und beginnt zu glühen. */
  toggleRevealed(tabId: string): void {
    this.deskChanged.emit(
      this.tabs().map(t => (t.tabId === tabId ? { ...t, revealed: !t.revealed } : t)),
    );
  }

  /** Ein einzelner Eintrag bleibt im aufgedeckten Reiter für die Spieler verborgen. */
  toggleEntryHidden(entryId: string): void {
    const tab = this.activeTab();
    if (!tab || tab.kind !== 'desk') return;
    this.deskChanged.emit(this.tabs().map(t => t.tabId !== tab.key ? t : {
      ...t,
      entries: t.entries.map(e => (e.entryId === entryId ? { ...e, hidden: !e.hidden } : e)),
    }));
  }

  removeEntry(entryId: string): void {
    const tab = this.activeTab();
    if (!tab) return;

    if (tab.kind === 'desk') {
      this.deskChanged.emit(this.tabs().map(t => t.tabId !== tab.key ? t : {
        ...t, entries: t.entries.filter(e => e.entryId !== entryId),
      }));
      return;
    }

    const token = this.npcs().find(t => 'npc:' + t.id === tab.key);
    if (!token) return;
    const index = Number(entryId.split(':').pop());
    const inventory = [...(token.inventory ?? [])];
    inventory.splice(index, 1);
    this.npcInventoryChanged.emit({ tokenId: token.id, inventory });
  }

  /** Alles aus dem Reiter dem ausgewählten Spieler anbieten. */
  offerTabToSelected(): void {
    const characterId = this.selectedCharacterId();
    if (!characterId) return;
    for (const entry of this.activeEntries()) {
      this.offerToCharacter.emit({ characterId, entry });
    }
  }

  entryLabel(entry: DeskEntry): string {
    if (entry.type === 'currency') return formatCurrency(entry.data as Currency);
    if (entry.type === 'knowledge' && entry.knowledgeKind) {
      return `${entry.name} (${KNOWLEDGE_KIND_LABEL[entry.knowledgeKind]})`;
    }
    return entry.name;
  }

  /** Einen bereits abgelegten Eintrag dem ausgewählten Spieler anbieten. */
  offerEntry(entry: DeskEntry): void {
    const characterId = this.selectedCharacterId();
    if (!characterId) return;
    this.offerToCharacter.emit({ characterId, entry });
  }

  /** Ein Gegenstand aus dem Reiter wandert in den Beutel der Gruppe. */
  moveToStash(entry: DeskEntry): void {
    if (entry.type !== 'item') return;
    this.depositToStash.emit(entry.data as ItemBlock);
    this.removeEntry(entry.entryId);
  }

  /** Nur Gegenstände lassen sich in den Beutel ziehen — er hält keine Zauber oder Wissen. */
  canStash(entry: DeskEntry): boolean {
    return entry.type === 'item';
  }

  // ── Ziehen ─────────────────────────────────────────────────────────────────

  /** Wohin aus dem Bibliotheks-Browser gezogen werden darf: der Reiter und jedes Porträt. */
  readonly dropTargets = computed<string[]>(() => [
    'deskEntryList',
    // Der Beutel der Gruppe liegt in einer ANDEREN Komponente (unter Aktive Events). CDK
    // verbindet Listen über ihre ID app-weit, deshalb steht er hier als Ziel — der Drop wird
    // dort behandelt, wo die Liste lebt.
    'deskStash',
    ...this.members().map(m => 'deskPlayer-' + m.id),
  ]);

  onEntryDropped(event: CdkDragDrop<DeskEntry[]>): void {
    // Aus der Bibliothek gezogen: derselbe Weg wie ein Klick auf ＋, nur mit gewähltem Ziel.
    if (event.previousContainer !== event.container) {
      const dragged = event.item.data as (DeskEntry & { fromLibrary?: boolean }) | null;
      if (dragged) this.addToActiveTab({ ...dragged, entryId: createDeskEntry(dragged.type, dragged.data).entryId });
      return;
    }

    const tab = this.activeTab();
    if (!tab || tab.kind !== 'desk' || event.previousIndex === event.currentIndex) return;
    this.deskChanged.emit(this.tabs().map(t => {
      if (t.tabId !== tab.key) return t;
      const entries = [...t.entries];
      const [moved] = entries.splice(event.previousIndex, 1);
      entries.splice(event.currentIndex, 0, moved);
      return { ...t, entries };
    }));
  }

  /** Etwas auf ein Porträt gezogen — geht direkt an diesen Spieler, egal ob er ausgewählt ist. */
  onDropOnPlayer(event: CdkDragDrop<{ id: string; sheet: CharacterSheet }>, characterId: string): void {
    const dragged = event.item.data as (DeskEntry & { fromLibrary?: boolean }) | null;
    if (!dragged) return;

    this.offerToCharacter.emit({ characterId, entry: dragged });
    // Nur was schon auf dem Schreibtisch lag, verschwindet dort — ein Bibliothekseintrag bleibt.
    if (!dragged.fromLibrary) this.removeEntry(dragged.entryId);
  }

  // ── Spalte 3: Bibliothek ───────────────────────────────────────────────────

  get currentCategory(): BrowseCategory {
    return this.categories.find(c => c.id === this.browseCategoryId()) ?? this.categories[0];
  }

  selectCategory(id: string): void {
    this.browseCategoryId.set(id);
    this.search.set('');
  }

  /** Der Bestand der aktiven Kategorie, ohne Filter. */
  private categoryEntries(): BrowseEntry[] {
    return this.catalog[this.currentCategory.id] ?? [];
  }

  /**
   * Nach Ordner gruppiert und durchsuchbar — das ist der eigentliche Punkt der Übung: 100+
   * Einträge in einer flachen Liste waren nicht benutzbar. Anders als im NSC-Editor bleiben
   * mehrere Ordner gleichzeitig offen, und gesucht werden kann in jeder Kategorie.
   */
  readonly folders = computed<BrowseFolder[]>(() => {
    // Auf die Signale zugreifen, damit die Berechnung neu läuft, wenn sie sich ändern.
    this.browseCategoryId();
    const query = this.search().trim().toLowerCase();

    const matching = this.categoryEntries()
      .filter(e => !query || e.name.toLowerCase().includes(query));

    const byFolder = new Map<string, BrowseEntry[]>();
    for (const entry of matching) {
      const list = byFolder.get(entry.folder) ?? [];
      list.push(entry);
      byFolder.set(entry.folder, list);
    }

    return [...byFolder.entries()]
      .map(([path, entries]) => ({
        path,
        label: path === '/' ? 'Wurzel' : path.replace(/^\//, ''),
        entries: entries.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  });

  /**
   * Zum Bearbeiten in die Bibliothek springen. Ohne das kommt man von hier nicht mehr an die
   * Inhalte heran — und wer nicht weiß, in welcher Bibliothek ein Eintrag liegt, sucht sich tot.
   */
  editInLibrary(entry: BrowseEntry, event: MouseEvent): void {
    event.stopPropagation();
    this.openInLibrary.emit(entry);
  }

  isFolderOpen(path: string): boolean {
    // Bei einer Suche wird alles aufgeklappt — sonst sucht man und sieht nichts.
    return !!this.search().trim() || !this.closedFolders().has(this.browseCategoryId() + '|' + path);
  }

  toggleFolder(path: string): void {
    const key = this.browseCategoryId() + '|' + path;
    this.closedFolders.update(closed => {
      const next = new Set(closed);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  /**
   * Das ＋ auf einem Bibliothekseintrag: mit ausgewähltem Spieler geht das Ding direkt an ihn,
   * ohne Auswahl landet es im offenen Reiter.
   */
  /**
   * Was beim Ziehen mitgereicht wird: IMMER ein fertiger `DeskEntry`.
   *
   * Vorher hing an einer Bibliothekszeile die rohe `BrowseEntry`, der Typ und Wissensart fehlen.
   * Ein Drop-Ziel in einer anderen Komponente — der Beutel der Gruppe — konnte damit nicht
   * entscheiden, ob es ein Gegenstand ist, und lehnte alles ab. `fromLibrary` unterscheidet den
   * Neuzugang von einem Eintrag, der schon in einem Reiter liegt und dort verschwinden muss.
   *
   * Zwischengespeichert, weil Angular den Ausdruck bei jedem Änderungslauf neu auswertet und ein
   * frisches Objekt mitten im Ziehen den Bezug reißen würde.
   */
  private readonly dragPayloads = new Map<string, DeskEntry & { fromLibrary: true }>();

  dragPayload(entry: BrowseEntry): DeskEntry & { fromLibrary: true } {
    const key = this.currentCategory.id + '|' + entry.id;
    let payload = this.dragPayloads.get(key);
    if (!payload) {
      payload = { ...this.entryFromBrowse(entry), fromLibrary: true };
      this.dragPayloads.set(key, payload);
    }
    return payload;
  }

  /** Ein Bibliothekseintrag der aktiven Kategorie als Schreibtisch-Eintrag. */
  private entryFromBrowse(browseEntry: BrowseEntry): DeskEntry {
    const cat = this.currentCategory;
    return createDeskEntry(cat.type, structuredClone(browseEntry.data), {
      name: browseEntry.name,
      knowledgeKind: cat.knowledgeKind,
    });
  }

  addFromLibrary(browseEntry: BrowseEntry): void {
    const entry = this.entryFromBrowse(browseEntry);

    const characterId = this.selectedCharacterId();
    if (characterId) {
      this.offerToCharacter.emit({ characterId, entry });
    } else {
      this.addToActiveTab(entry);
    }
    this.flashAdded(browseEntry.id);
  }

  private addToActiveTab(entry: DeskEntry): void {
    const tab = this.activeTab();
    if (!tab) {
      // Ohne Reiter gäbe es kein Ziel — also einen anlegen, statt den Klick zu verschlucken.
      const created = createDeskTab('Vorbereitung');
      created.entries.push(entry);
      this.deskChanged.emit([...this.tabs(), created]);
      this.activeTabKey.set(created.tabId);
      return;
    }

    if (tab.kind === 'desk') {
      this.deskChanged.emit(this.tabs().map(t =>
        t.tabId === tab.key ? { ...t, entries: [...t.entries, entry] } : t));
      return;
    }

    // NSC-Reiter: nur Gegenstände, alles andere hat im Token-Inventar keinen Platz.
    const token = this.npcs().find(t => 'npc:' + t.id === tab.key);
    if (!token || entry.type !== 'item') return;
    this.npcInventoryChanged.emit({
      tokenId: token.id,
      inventory: [...(token.inventory ?? []), entry.data as ItemBlock],
    });
  }

  /** Kurzes grünes Aufblitzen — ohne das fühlt sich das ＋ an, als hätte es nichts getan. */
  private flashAdded(id: string): void {
    this.justAddedId.set(id);
    if (this.justAddedTimer) clearTimeout(this.justAddedTimer);
    this.justAddedTimer = window.setTimeout(() => {
      this.justAddedId.set(null);
      this.cdr.markForCheck();
    }, 450);
  }
}
