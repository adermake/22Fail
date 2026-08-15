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

import { TerrainTool } from './brush-engine';
import { SymbolCategory } from './map-assets';

export type EditorTab = 'water' | 'land' | 'symbols' | 'regions' | 'labels' | 'map';
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

export const TAB_DEFS: TabDef[] = [
  { id: 'water', label: 'Wasser' },
  { id: 'land', label: 'Land' },
  { id: 'symbols', label: 'Symbole' },
  { id: 'regions', label: 'Regionen' },
  { id: 'labels', label: 'Beschriftung' },
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
];

export const LAND_TOOL_DEFS: ToolDef<TerrainTool>[] = [
  { id: 'landBrush', icon: 'landmass_brush_64', label: 'Land' },
  { id: 'landEraser', icon: 'landmass_eraser_64', label: 'Land radieren' },
  { id: 'heighten', icon: 'raise_landmass_tool_64', label: 'Anheben' },
  { id: 'lower', icon: 'lower_landmass_tool_64', label: 'Absenken' },
  { id: 'landPaint', icon: 'ground_color_normal', label: 'Landfarbe' },
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
 * Blending land colours needs a very soft, very low-flow brush, while drawing a coastline
 * needs a hard one — and reaching for three sliders every time you switch between those two
 * jobs is most of the time spent in the tool. These are the presets Wonderdraft offers,
 * plus a couple that cover the cases its three do not.
 */
export interface BrushProfile {
  id: string;
  label: string;
  softness: number;
  strength: number;
  /** Raggedness, used by the raise/lower brushes. */
  noise: number;
}

export const BRUSH_PROFILES: BrushProfile[] = [
  // The blending workhorse: maximum feather, minimum flow, so colour builds up gradually.
  { id: 'blend', label: 'Verlauf', softness: 1, strength: 0.1, noise: 0 },
  { id: 'soft', label: 'Weich', softness: 0.7, strength: 0.4, noise: 0 },
  { id: 'hard', label: 'Hart', softness: 0.05, strength: 1, noise: 0 },
  { id: 'noisy', label: 'Rau', softness: 0.8, strength: 0.5, noise: 0.85 },
  { id: 'grain', label: 'Körnig', softness: 0.35, strength: 0.25, noise: 1 },
];
