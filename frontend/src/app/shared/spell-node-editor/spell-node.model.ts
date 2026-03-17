/** Unique port kinds */
export type PortKind = 'flow-in' | 'flow-out' | 'data-in' | 'data-out';

/** A port on a node */
export interface SpellPort {
  id: string;          // unique within node: 'flow-in' | 'flow-out' | 'in-0' | 'out-1' etc.
  kind: PortKind;
  name: string;
  color: string;       // hex color — white for flow
  types: string[];     // empty = flow; otherwise data types
}

/** One rune node placed in the canvas */
export interface SpellNode {
  id: string;          // unique in graph
  runeId: string;      // reference to RuneBlock (by name — since runes have no DB id)
  x: number;
  y: number;
  mode?: 'basic' | 'advanced';   // 'basic' collapses all ports into one multi-in + one multi-out
}

/** A connection between two ports */
export interface SpellConnection {
  id: string;
  fromNodeId: string;
  fromPortId: string;
  toNodeId: string;
  toPortId: string;
  waypoints?: { x: number; y: number }[]; // world-space intermediate points for circuit-board routing
  /** Branch condition text; undefined/empty = unconditional */
  condition?: string;
  /** Whether the branch condition is currently known (true) or unknown (false); only applies when condition has text */
  precastKnown?: boolean;
  /** When true, this connection is part of a mutually-exclusive fork group (only ONE branch fires at a time).
   *  When false/undefined, multiple branches from the same node can fire simultaneously → power-set cost cases. */
  exclusive?: boolean;
  /** Passthrough limiting — replaces isLoop + loopCount */
  passthroughEnabled?: boolean;
  maxPassthrough?: number; // undefined = unlimited; 1 = old single-loop behavior
  /** Wait N turns before continuing; undefined = instant */
  lineDelay?: number;
}

/** Neutral pass-through node — hardcoded, no rune reference */
export const NEUTRAL_RUNE_ID = '__neutral__';

/** The start node (special, not a rune) */
export interface SpellStartNode {
  x: number;
  y: number;
}

/** The complete spell node graph */
export interface SpellGraph {
  startNode: SpellStartNode;
  nodes: SpellNode[];
  connections: SpellConnection[];
}

/** Computed port positions — calculated each render frame */
export interface PortPosition {
  nodeId: string;       // 'start' for the start circle
  portId: string;
  x: number;           // canvas world coordinates
  y: number;
  kind: PortKind;
  color: string;
  types: string[];
}

/** State of an in-progress connection drag */
export interface PendingConnection {
  fromNodeId: string;
  fromPortId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  types: string[];      // empty = flow
  kind: PortKind;       // kind of the source port
  isPickup?: boolean;   // true when re-routing an existing connection (drop-in-void = cancel)
}

export const FLOW_COLOR = '#ffffff';
export const FLOW_TYPE: string[] = [];

/** Build ports list for a rune */
export function buildRunePorts(rune: { inputs?: { name: string, color: string, types: string[] }[], outputs?: { name: string, color: string, types: string[] }[], name?: string, runeType?: string }): SpellPort[] {
  // Neutral node: one any-type in and one any-type out — ports colored dynamically by attached connections
  if (rune.name === NEUTRAL_RUNE_ID) {
    return [
      { id: 'neutral-in',  kind: 'flow-in',  name: 'Eingang', color: FLOW_COLOR, types: FLOW_TYPE },
      { id: 'neutral-out', kind: 'flow-out', name: 'Ausgang', color: FLOW_COLOR, types: FLOW_TYPE },
    ];
  }
  const ports: SpellPort[] = [];

  if (rune.runeType) {
    // New mode: inputs/outputs fully define the ports.
    // A data line with types: ['Fluss'] becomes a flow port.
    (rune.inputs || []).forEach((dl, i) => {
      const isFlow = dl.types.includes('Fluss');
      ports.push({ id: `in-${i}`, kind: isFlow ? 'flow-in' : 'data-in', name: dl.name, color: isFlow ? FLOW_COLOR : dl.color, types: isFlow ? FLOW_TYPE : dl.types });
    });
    (rune.outputs || []).forEach((dl, i) => {
      const isFlow = dl.types.includes('Fluss');
      ports.push({ id: `out-${i}`, kind: isFlow ? 'flow-out' : 'data-out', name: dl.name, color: isFlow ? FLOW_COLOR : dl.color, types: isFlow ? FLOW_TYPE : dl.types });
    });
  } else {
    // Legacy: always prepend flow-in/flow-out, then data ports from inputs/outputs
    ports.push({ id: 'flow-in',  kind: 'flow-in',  name: 'Fluss', color: FLOW_COLOR, types: FLOW_TYPE });
    ports.push({ id: 'flow-out', kind: 'flow-out', name: 'Fluss', color: FLOW_COLOR, types: FLOW_TYPE });
    (rune.inputs || []).forEach((dl, i) => {
      ports.push({ id: `in-${i}`, kind: 'data-in', name: dl.name, color: dl.color, types: dl.types });
    });
    (rune.outputs || []).forEach((dl, i) => {
      ports.push({ id: `out-${i}`, kind: 'data-out', name: dl.name, color: dl.color, types: dl.types });
    });
  }
  return ports;
}

/** Can two ports be connected? */
export function portsCompatible(from: SpellPort | PortPosition, to: SpellPort | PortPosition): boolean {
  // flow → flow only
  const fromIsFlow = from.types.length === 0;
  const toIsFlow   = to.types.length === 0;
  if (fromIsFlow !== toIsFlow) return false;
  if (fromIsFlow && toIsFlow) return true;
  // data: at least one type in common
  return from.types.some(t => to.types.includes(t));
}

/**
 * Returns the union of all non-flow types from an array of ports.
 * Does NOT include flow (empty-types) ports by default — they are handled separately.
 * If you want to check if ANY flow port exists, check `ports.some(p => p.types.length === 0)`.
 */
export function mergePortTypes(ports: SpellPort[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const p of ports) {
    for (const t of p.types) {
      if (!seen.has(t)) { seen.add(t); result.push(t); }
    }
  }
  return result;
}

/** All port colors as an ordered array (deduplicated) for a set of ports */
export function mergePortColors(ports: SpellPort[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const p of ports) {
    if (!seen.has(p.color)) { seen.add(p.color); result.push(p.color); }
  }
  return result;
}
