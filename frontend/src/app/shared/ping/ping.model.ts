/**
 * League-of-Legends-style radial pings, shared by the world map and the lobby.
 *
 * A ping is an ephemeral, broadcast-only event (never persisted): the sender fires it,
 * the server echoes it to everyone in the room, and it animates for a couple of seconds
 * before disappearing. Positions travel in *world* coordinates so each client maps them
 * onto its own pan/zoom.
 */

export type PingType = 'generic' | 'danger' | 'onmyway' | 'assist' | 'enemy';

export interface PingTypeConfig {
  type: PingType;
  label: string;
  color: string;
  icon: string;
  sound: string;
  /** Direction on the radial wheel this type sits at. */
  direction: 'center' | 'up' | 'right' | 'down' | 'left';
}

const SOUND_BASE = '/ping-sounds';

export const PING_TYPES: Record<PingType, PingTypeConfig> = {
  danger: {
    type: 'danger',
    label: 'Danger',
    color: '#ef4444',
    icon: '❗',
    sound: `${SOUND_BASE}/Caution_ping_SFX.ogg`,
    direction: 'up',
  },
  onmyway: {
    type: 'onmyway',
    label: 'On My Way',
    color: '#22c55e',
    icon: '🏃',
    sound: `${SOUND_BASE}/On_My_Way_ping_SFX.ogg`,
    direction: 'right',
  },
  assist: {
    type: 'assist',
    label: 'Assist Me',
    color: '#3b82f6',
    icon: '🚩',
    sound: `${SOUND_BASE}/Assist_Me_ping_SFX.ogg`,
    direction: 'down',
  },
  enemy: {
    type: 'enemy',
    label: 'Enemy Missing',
    color: '#eab308',
    icon: '❓',
    sound: `${SOUND_BASE}/Enemy_Missing_ping_SFX.ogg`,
    direction: 'left',
  },
  generic: {
    type: 'generic',
    label: 'Ping',
    color: '#e2e8f0',
    icon: '📍',
    sound: `${SOUND_BASE}/Generic_ping_SFX.ogg`,
    direction: 'center',
  },
};

/** Ordered list of the directional (non-center) ping types for wheel rendering. */
export const PING_WHEEL_TYPES: PingTypeConfig[] = [
  PING_TYPES.danger,
  PING_TYPES.onmyway,
  PING_TYPES.assist,
  PING_TYPES.enemy,
];

/** How long a ping stays on screen (must match the CSS animation length). */
export const PING_DURATION_MS = 2400;

/** Minimum drag distance (px) before the wheel leaves the neutral/center selection. */
export const PING_WHEEL_DEADZONE = 28;

/** A ping currently animating on a client. */
export interface ActivePing {
  id: string;
  type: PingType;
  worldX: number;
  worldY: number;
  createdBy: string;
  createdAt: number;
}

/** Wire payload broadcast between clients. */
export interface PingBroadcast {
  id: string;
  type: PingType;
  worldX: number;
  worldY: number;
  createdBy: string;
}

/** Pick a ping type from a drag vector (screen space, y pointing down). */
export function pingTypeFromDrag(dx: number, dy: number): PingType {
  if (Math.hypot(dx, dy) < PING_WHEEL_DEADZONE) return 'generic';
  const angle = Math.atan2(dy, dx); // -π..π
  const deg = (angle * 180) / Math.PI;
  if (deg >= -45 && deg < 45) return 'onmyway'; // right
  if (deg >= 45 && deg < 135) return 'assist'; // down
  if (deg >= -135 && deg < -45) return 'danger'; // up
  return 'enemy'; // left
}

let idCounter = 0;
export function makePingId(): string {
  idCounter = (idCounter + 1) % 1_000_000;
  return `ping-${Date.now().toString(36)}-${idCounter}`;
}
