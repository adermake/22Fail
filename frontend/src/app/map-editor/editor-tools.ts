/**
 * Tool definitions for the editor's left rail.
 *
 * Icons are Wonderdraft's own, extracted by `generate-map-atlas.mjs`. Reusing them is not
 * decoration: the tool shapes are already familiar, and a column of German words is far
 * slower to read at a glance than the icon you have used a hundred times.
 *
 * Each tab owns its tools, and every tab ends in a *selector* that edits what that tab
 * creates — the symbol selector moves symbols, a future region selector will edit region
 * paths. Same icon, same position, different target.
 */

import { TerrainTool } from './brush-engine';

export type EditorTab = 'terrain' | 'symbols' | 'map';
export type SymbolTool = 'trees' | 'mountains' | 'misc' | 'select';

export interface ToolDef<T extends string> {
  id: T;
  icon: string;
  label: string;
}

export const TERRAIN_TOOL_DEFS: ToolDef<TerrainTool>[] = [
  { id: 'landBrush', icon: 'landmass_brush_64', label: 'Land' },
  { id: 'landEraser', icon: 'landmass_eraser_64', label: 'Land radieren' },
  { id: 'heighten', icon: 'raise_landmass_tool_64', label: 'Anheben' },
  { id: 'lower', icon: 'lower_landmass_tool_64', label: 'Absenken' },
  { id: 'waterBrush', icon: 'freshwater_brush_64', label: 'Wasser' },
  { id: 'waterEraser', icon: 'ground_color_eraser_normal', label: 'Wasser radieren' },
  { id: 'lakeStamp', icon: 'lake_tool_64', label: 'See' },
  { id: 'landPaint', icon: 'ground_color_normal', label: 'Landfarbe' },
  { id: 'waterPaint', icon: 'color_brush', label: 'Wasserfarbe' },
];

export const SYMBOL_TOOL_DEFS: ToolDef<SymbolTool>[] = [
  { id: 'trees', icon: 'tree_brush_64', label: 'Bäume' },
  { id: 'mountains', icon: 'mountain_brush_64', label: 'Berge' },
  { id: 'misc', icon: 'symbol_tool_64', label: 'Symbole' },
  { id: 'select', icon: 'symbol_move_tool_64', label: 'Auswahl' },
];

export const TAB_DEFS: ToolDef<EditorTab>[] = [
  { id: 'terrain', icon: 'landmass_wizard_64', label: 'Gelände' },
  { id: 'symbols', icon: 'symbol_tool_64', label: 'Symbole' },
  { id: 'map', icon: 'layers_64', label: 'Karte' },
];

/** Tools that paint with a size/softness/strength brush. */
export function isBrushTool(tool: TerrainTool): boolean {
  return tool !== 'lakeStamp';
}

/** Tools whose colour comes from the land palette. */
export function usesLandPalette(tool: TerrainTool): boolean {
  return tool === 'landBrush' || tool === 'landPaint';
}

/** Tools whose colour comes from the water palette. */
export function usesWaterPalette(tool: TerrainTool): boolean {
  return tool === 'waterBrush' || tool === 'waterPaint' || tool === 'lakeStamp';
}

export function iconUrl(name: string): string {
  return `/mapassets/icons/${name}.png`;
}
