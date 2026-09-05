/**
 * Tab and tool definitions for the editor's left rail.
 *
 * Layout mirrors Wonderdraft: categories are *text* buttons down the left, and the tools
 * inside a category are icons below them. Icons were previously used for both, which meant
 * the same artwork appeared twice (the castle stood for the Symbols tab *and* the misc
 * symbol tool) with no way to tell which was which.
 *
 * Water and land are separate categories rather than one "terrain" tab, so each keeps its
 * own colour tool and neither shows the other's palette.
 *
 * Every category ends in a selector that edits what that category creates. Regions and
 * labels will slot in the same way: their own tools plus their own selector, same icon,
 * same position, different target.
 */

import { BrushTexture, TerrainTool } from './brush-engine';
import { SymbolCategory } from './map-assets';

export type EditorTab = 'water' | 'land' | 'symbols' | 'regions' | 'labels' | 'secrets' | 'map';
export type SymbolTool = SymbolCategory | 'select';
export type RegionTool = 'draw' | 'select';
export type LabelTool = 'place' | 'select';

export interface ToolDef<T extends string> {
  id: T;
  icon: string;
  label: string;
}

export interface TabDef {
  id: EditorTab;
  label: string;
}

/**
 * Tools for game mode.
 *
 * Deliberately the same three the old world map had, with the same letters and the same
 * icons, because they are what everybody at the table already has in their fingers. The two
 * things that are *not* tools there are not tools here either:
 *
 *  - **Fog is a mode, not a tool** (`FogMode`). V flips reveal/hide, D steps out of it. It
 *    rides on the cursor tool, so covering ground and moving a figure are one gesture apart
 *    instead of a toolbar trip.
 *  - **Pings are a chord**, G + left-drag, live on every tool. A ping is something you do
 *    *while* doing something else; making it a tool would mean leaving whatever you were
 *    doing to point at something.
 *
 * `reveal` is the one addition — secrets did not exist in v1 — and it earns a tool because it
 * is a deliberate, one-off act rather than something you do mid-gesture.
 */
export type GameTool = 'cursor' | 'draw' | 'measure' | 'reveal';

/** Fog painting state. `neutral` means the cursor tool moves figures instead. */
export type FogMode = 'neutral' | 'reveal' | 'hide';

export interface GameToolDef extends ToolDef<GameTool> {
  /** Single-key shortcut, shown in the tooltip so it can be learnt by using it. */
  shortcut: string;
  gmOnly?: boolean;
}

/** Icons are the shared `app-icon` masks, the same artwork the old map used. */
export const GAME_TOOL_DEFS: GameToolDef[] = [
  { id: 'cursor', icon: 'i-token-drag', label: 'Figuren bewegen', shortcut: 'S' },
  { id: 'draw', icon: 'i-draw', label: 'Zeichnen', shortcut: 'B' },
  { id: 'measure', icon: 'i-ruler', label: 'Messen', shortcut: 'M' },
  { id: 'reveal', icon: 'i-visibility-on', label: 'Geheimnis aufdecken', shortcut: 'R', gmOnly: true },
];

export function gameToolsFor(isGM: boolean): GameToolDef[] {
  return isGM ? GAME_TOOL_DEFS : GAME_TOOL_DEFS.filter(t => !t.gmOnly);
}

/** Pen widths offered as presets, matching the old toolbar. */
export const PEN_SIZES = [2, 4, 8, 12, 20];

export const DRAW_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#ffffff',
  '#000000',
];

export const TAB_DEFS: TabDef[] = [
  { id: 'water', label: 'Wasser' },
  { id: 'land', label: 'Land' },
  { id: 'symbols', label: 'Symbole' },
  { id: 'regions', label: 'Regionen' },
  { id: 'labels', label: 'Beschriftung' },
  { id: 'secrets', label: 'Geheimnisse' },
  { id: 'map', label: 'Karte' },
];

/**
 * Region and label tools mirror the symbol layout: a create tool, then a selector using the
 * same icon as every other selector — same gesture, different target.
 */
export const REGION_TOOL_DEFS: ToolDef<RegionTool>[] = [
  { id: 'draw', icon: 'territory_tool_64', label: 'Region zeichnen' },
  { id: 'select', icon: 'symbol_move_tool_64', label: 'Region auswählen' },
];

export const LABEL_TOOL_DEFS: ToolDef<LabelTool>[] = [
  { id: 'place', icon: 'label_tool_64', label: 'Beschriftung setzen' },
  { id: 'select', icon: 'symbol_move_tool_64', label: 'Beschriftung auswählen' },
];

export const WATER_TOOL_DEFS: ToolDef<TerrainTool>[] = [
  { id: 'waterBrush', icon: 'freshwater_brush_64', label: 'Wasser' },
  { id: 'lakeStamp', icon: 'lake_tool_64', label: 'See' },
  { id: 'waterPaint', icon: 'color_brush', label: 'Wasserfarbe' },
  // Takes drawn water back without disturbing the land under it — see `paintPasses`.
  { id: 'waterEraser', icon: 'randomize_water_64', label: 'Wasser radieren' },
  { id: 'waterColorEraser', icon: 'ground_color_eraser_normal', label: 'Wasserfarbe radieren' },
  { id: 'tierEraser', icon: 'landmass_wizard_64', label: 'Stufe radieren' },
];

export const LAND_TOOL_DEFS: ToolDef<TerrainTool>[] = [
  { id: 'landBrush', icon: 'landmass_brush_64', label: 'Land' },
  { id: 'landEraser', icon: 'landmass_eraser_64', label: 'Land radieren' },
  { id: 'heighten', icon: 'raise_landmass_tool_64', label: 'Anheben' },
  { id: 'lower', icon: 'lower_landmass_tool_64', label: 'Absenken' },
  { id: 'landPaint', icon: 'ground_color_normal', label: 'Landfarbe' },
  // Colour off, land intact — the way to hand an area back to the base colour, or to a
  // coarser tier whose paint a finer one is covering.
  { id: 'landColorEraser', icon: 'ground_color_eraser_normal', label: 'Landfarbe radieren' },
  // Everything off, so the tier holds nothing here and a coarser one shows through. Listed
  // in both terrain tabs because it belongs to neither: it is a tier operation.
  { id: 'tierEraser', icon: 'landmass_wizard_64', label: 'Stufe radieren' },
];

export const SYMBOL_TOOL_DEFS: ToolDef<SymbolTool>[] = [
  { id: 'trees', icon: 'tree_brush_64', label: 'Bäume' },
  { id: 'mountains', icon: 'mountain_brush_64', label: 'Berge' },
  { id: 'misc', icon: 'symbol_tool_64', label: 'Symbole' },
  { id: 'select', icon: 'symbol_move_tool_64', label: 'Auswahl' },
];

/** Terrain tools for a tab, empty for non-terrain tabs. */
export function terrainToolsFor(tab: EditorTab): ToolDef<TerrainTool>[] {
  if (tab === 'water') return WATER_TOOL_DEFS;
  if (tab === 'land') return LAND_TOOL_DEFS;
  return [];
}

/** Tools that paint with a size/softness/strength brush. */
export function isBrushTool(tool: TerrainTool): boolean {
  return tool !== 'lakeStamp';
}

/*
 * The colour erasers are absent from both: an eraser takes colour away, so offering a swatch
 * for it would suggest it puts one down.
 */
export function usesLandPalette(tool: TerrainTool): boolean {
  return tool === 'landBrush' || tool === 'landPaint';
}

export function usesWaterPalette(tool: TerrainTool): boolean {
  return tool === 'waterBrush' || tool === 'waterPaint' || tool === 'lakeStamp';
}

/**
 * Categories whose symbols vary automatically after each placement.
 *
 * Trees and mountains are laid down in bulk, where repeating one sprite reads as a grid of
 * clones. A town or a castle is placed deliberately and must stay exactly what was picked.
 */
export function autoVaries(category: SymbolCategory): boolean {
  return category === 'trees' || category === 'mountains';
}

export function iconUrl(name: string): string {
  return `/mapassets/icons/${name}.png`;
}

/**
 * Brush profiles.
 *
 * Each one has to be recognisable *in the stroke*, not just in its slider values. Softness
 * alone could not do that — every brush was a circle with a harder or blurrier edge — so a
 * profile now also picks a stamp texture, which is what makes chalk read as chalk.
 *
 * `strength` is the coverage a single pass leaves, so these numbers mean what they say; before
 * the flow model was fixed, anything above about 0.1 painted solid regardless.
 */
export interface BrushProfile {
  id: string;
  label: string;
  softness: number;
  strength: number;
  /** Raggedness, used by the raise/lower brushes and the lake stamp. */
  noise: number;
  texture: BrushTexture;
}

export const BRUSH_PROFILES: BrushProfile[] = [
  // Full coverage, crisp rim: coastlines and anything that needs a definite edge.
  { id: 'hard', label: 'Hart', softness: 0.05, strength: 1, noise: 0, texture: 'smooth' },
  // The everyday brush — solid enough to cover, soft enough not to leave a seam.
  { id: 'soft', label: 'Weich', softness: 0.7, strength: 0.75, noise: 0, texture: 'smooth' },
  // The blending workhorse: maximum feather, light coverage, so colour builds up gradually.
  { id: 'blend', label: 'Verlauf', softness: 1, strength: 0.12, noise: 0, texture: 'smooth' },
  // Paper tooth. Reads as texture at any coverage, unlike a low-flow smooth brush.
  { id: 'grain', label: 'Körnig', softness: 0.5, strength: 0.5, noise: 0, texture: 'grain' },
  // Solid core, crumbling rim — a dry stick rather than an airbrush.
  { id: 'chalk', label: 'Kreide', softness: 0.6, strength: 0.7, noise: 0.4, texture: 'chalk' },
  // Sparse droplets for stippling and broken coasts.
  { id: 'spray', label: 'Spray', softness: 0.9, strength: 0.4, noise: 0.6, texture: 'spray' },
];

/** Labels for the stamp textures, so softness is no longer the only thing to vary. */
export const BRUSH_TEXTURE_DEFS: { id: BrushTexture; label: string }[] = [
  { id: 'smooth', label: 'Glatt' },
  { id: 'grain', label: 'Körnig' },
  { id: 'chalk', label: 'Kreide' },
  { id: 'spray', label: 'Spray' },
];
