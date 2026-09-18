import io

p = 'src/app/map-editor/map-editor.component.ts'
s = io.open(p, encoding='utf-8').read()

old = """  readonly secretView = signal<'marked' | 'hidden'>('marked');

  setSecretView(mode: 'marked' | 'hidden'): void {
    this.secretView.set(mode);
    this.saveBrushPrefs();
    this.applyMode();
  }"""
new = """  readonly viewAs = signal<MapViewAs>('gm');
  readonly viewAsOptions = VIEW_AS_DEFS;

  setViewAs(mode: MapViewAs): void {
    this.viewAs.set(mode);
    this.saveBrushPrefs();
    this.applyMode();
  }

  /** True while previewing the players' view — the one mode that hides things from the GM. */
  readonly asPlayer = computed(() => this.viewAs() === 'player');"""
assert s.count(old) == 1, 'secretView signal'
s = s.replace(old, new)

old = """  /** Whether secret objects are drawn at all for this viewer. */
  readonly showSecrets = computed(
    () => this.isGM() && (!this.inGame() || this.secretView() === 'marked'),
  );"""
new = """  /** Whether secret objects are drawn at all for this viewer. */
  readonly showSecrets = computed(() => this.isGM() && !this.asPlayer());"""
assert s.count(old) == 1, 'showSecrets'
s = s.replace(old, new)

old = """  readonly overviewActive = computed(() =>
    this.inGame()
      ? this.isGM() && this.secretView() === 'marked'
      : this.tab() === 'secrets' && this.overviewOn(),
  );"""
new = """  readonly overviewActive = computed(() => {
    // Nothing is marked while previewing the players' view; the whole point is to see what
    // they see, and a frame round a secret is exactly what they do not get.
    if (this.asPlayer()) return false;
    return this.inGame() ? this.isGM() : this.tab() === 'secrets' && this.overviewOn();
  });"""
assert s.count(old) == 1, 'overviewActive'
s = s.replace(old, new)

old = """  private applyMode(): void {
    this.fogView?.setEnabled(this.inGame());"""
new = """  private applyMode(): void {
    /*
     * Fog also comes on while previewing the players' view, even in edit mode.
     *
     * "See it as a player" is not worth much if the one thing that actually hides the map
     * from them is the one thing still switched off.
     */
    this.fogView?.setEnabled(this.inGame() || this.asPlayer());"""
assert s.count(old) == 1, 'applyMode fog'
s = s.replace(old, new)

old = """      this.fogView?.update(view, this.revealedSet, this.isGM(), this.fogRevision);"""
new = """      // Passing `false` for the GM flag is what makes the preview honest: the fog goes
      // opaque instead of the GM's see-through grey.
      this.fogView?.update(view, this.revealedSet, this.isGM() && !this.asPlayer(), this.fogRevision);"""
assert s.count(old) == 1, 'fog update'
s = s.replace(old, new)

# Persistence
old = """          secretOverview: this.overviewOn(),
          mode: this.mode(),"""
new = """          secretOverview: this.overviewOn(),
          mode: this.mode(),
          viewAs: this.viewAs(),"""
assert s.count(old) == 1, 'save prefs'
s = s.replace(old, new)

old = """      if (p['mode'] === 'game' || p['mode'] === 'edit') this.mode.set(p['mode']);"""
new = """      if (p['mode'] === 'game' || p['mode'] === 'edit') this.mode.set(p['mode']);
      if (VIEW_AS_DEFS.some(v => v.id === p['viewAs'])) this.viewAs.set(p['viewAs'] as MapViewAs);"""
assert s.count(old) == 1, 'load prefs'
s = s.replace(old, new)

old = """import {
  DRAW_COLORS,
  FogMode,"""
new = """import {
  DRAW_COLORS,
  FogMode,
  MapViewAs,
  VIEW_AS_DEFS,"""
assert s.count(old) == 1, 'import'
s = s.replace(old, new)

io.open(p, 'w', encoding='utf-8').write(s)

# ── the modes themselves ────────────────────────────────────────────────────
p = 'src/app/map-editor/editor-tools.ts'
s = io.open(p, encoding='utf-8').read()
old = """/** Pen widths offered as presets, matching the old toolbar. */"""
new = """/**
 * How the map is being *looked at*, independent of which tool is in hand.
 *
 * This began as a pair of buttons in the game-mode panel, which put it in the wrong place
 * twice over: it was reachable only from one tool, and it was only about secrets. It is
 * neither. It answers "whose view am I looking at", which applies while editing as much as
 * while playing, and it has to cover everything that differs between the two — secrets *and*
 * fog, or a preview that claims to be the players' view is not one.
 */
export type MapViewAs = 'gm' | 'player';

export const VIEW_AS_DEFS: { id: MapViewAs; label: string; title: string }[] = [
  {
    id: 'gm',
    label: 'GM-Sicht',
    title: 'Alles sichtbar: Geheimnisse markiert, Nebel nur angedeutet',
  },
  {
    id: 'player',
    label: 'Spielersicht',
    title: 'Genau das, was am Spielertisch auf dem Schirm steht — mit vollem Nebel',
  },
];

/** Pen widths offered as presets, matching the old toolbar. */"""
assert s.count(old) == 1, 'view defs'
s = s.replace(old, new)
io.open(p, 'w', encoding='utf-8').write(s)
print("ok")
