// src/app/model/lobby.model.ts
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
function createEmptyMap(id, name) {
  const defaultImageLayer = {
    id: generateId(),
    name: "Images",
    type: "image",
    visible: true,
    locked: false,
    zIndex: 1,
    createdAt: Date.now()
  };
  const defaultTextureLayer = {
    id: generateId(),
    name: "Textures",
    type: "texture",
    visible: true,
    locked: false,
    zIndex: 0,
    createdAt: Date.now()
  };
  const defaultDrawLayer = {
    id: generateId(),
    name: "Drawing",
    type: "draw",
    visible: true,
    locked: false,
    zIndex: 2,
    createdAt: Date.now()
  };
  return {
    id,
    name,
    tokens: [],
    strokes: [],
    drawBitmaps: [],
    textureStrokes: [],
    walls: [],
    measurementLines: [],
    images: [],
    layers: [defaultImageLayer, defaultTextureLayer, defaultDrawLayer],
    activeLayerId: defaultDrawLayer.id,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}
function createEmptyLobby(worldName) {
  const defaultMap = createEmptyMap("default", "Main Map");
  return {
    id: worldName,
    worldName,
    maps: { default: defaultMap },
    activeMapId: "default",
    imageLibrary: [],
    textureLibrary: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}
var HEX_SIZE = 32;
var HexMath = {
  /** Convert axial coordinates to pixel center */
  hexToPixel(coord) {
    const x = HEX_SIZE * (3 / 2 * coord.q);
    const y = HEX_SIZE * (Math.sqrt(3) / 2 * coord.q + Math.sqrt(3) * coord.r);
    return { x, y };
  },
  /** Convert pixel position to axial coordinates (rounded) */
  pixelToHex(point) {
    const q = 2 / 3 * point.x / HEX_SIZE;
    const r = (-1 / 3 * point.x + Math.sqrt(3) / 3 * point.y) / HEX_SIZE;
    return this.roundHex({ q, r });
  },
  /** Round floating-point hex coords to nearest hex */
  roundHex(coord) {
    const s = -coord.q - coord.r;
    let rQ = Math.round(coord.q);
    let rR = Math.round(coord.r);
    const rS = Math.round(s);
    const qDiff = Math.abs(rQ - coord.q);
    const rDiff = Math.abs(rR - coord.r);
    const sDiff = Math.abs(rS - s);
    if (qDiff > rDiff && qDiff > sDiff) {
      rQ = -rR - rS;
    } else if (rDiff > sDiff) {
      rR = -rQ - rS;
    }
    return { q: rQ, r: rR };
  },
  /** Calculate distance between two hexes */
  hexDistance(a, b) {
    return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
  },
  /** Get corner points for a flat-top hex at given center */
  getHexCorners(center) {
    const corners = [];
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 180 * (60 * i);
      corners.push({
        x: center.x + HEX_SIZE * Math.cos(angle),
        y: center.y + HEX_SIZE * Math.sin(angle)
      });
    }
    return corners;
  },
  /** Get hex width (flat-top) */
  get hexWidth() {
    return HEX_SIZE * 2;
  },
  /** Get hex height (flat-top) */
  get hexHeight() {
    return HEX_SIZE * Math.sqrt(3);
  }
};

export {
  generateId,
  createEmptyMap,
  createEmptyLobby,
  HexMath
};
//# sourceMappingURL=chunk-OVLXAWKG.js.map
