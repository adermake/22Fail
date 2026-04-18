/** Simplified port kinds — flow only */
export type PortKind = 'flow-in' | 'flow-out';

/** A port on a node (always flow) */
export interface SpellPort {
  id: string;   // 'flow-in' | 'flow-out' | 'neutral-in' | 'neutral-out'
  kind: PortKind;
  name: string;
}

/** One rune node placed in the canvas */
export interface SpellNode {
  id: string;     // unique in graph
  runeId: string; // reference to RuneBlock (by name)
  x: number;
  y: number;
}

/** A connection between two ports (flow only) */
export interface SpellConnection {
  id: string;
  fromNodeId: string;
  fromPortId: string;
  toNodeId: string;
  toPortId: string;
  waypoints?: { x: number; y: number }[];
  /** Loop: limit how many times this connection fires */
  passthroughEnabled?: boolean;
  maxPassthrough?: number; // undefined = unlimited
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
  nodeId: string;
  portId: string;
  x: number;
  y: number;
  kind: PortKind;
}

/** State of an in-progress connection drag */
export interface PendingConnection {
  fromNodeId: string;
  fromPortId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  isPickup?: boolean;
}

export const FLOW_COLOR = '#ffffff';
export const FLOW_TYPE: string[] = [];

/** Build flow ports for a rune — always 1 flow-in + 1 flow-out */
export function buildRunePorts(_rune: { name?: string }): SpellPort[] {
  if (_rune.name === NEUTRAL_RUNE_ID) {
    return [
      { id: 'neutral-in',  kind: 'flow-in',  name: 'Eingang' },
      { id: 'neutral-out', kind: 'flow-out', name: 'Ausgang' },
    ];
  }
  return [
    { id: 'flow-in',  kind: 'flow-in',  name: 'Fluss' },
    { id: 'flow-out', kind: 'flow-out', name: 'Fluss' },
  ];
}
