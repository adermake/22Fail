// Fixed method implementations for lobby-grid.component.ts

// Context menu methods - these should be inside the LobbyGridComponent class
onMoveImageForward(): void {
  const id = this.contextMenuImageId();
  if (id) {
    this.store.moveImageForward(id);
  }
  this.closeContextMenu();
}

onMoveImageBackward(): void {
  const id = this.contextMenuImageId();
  if (id) {
    this.store.moveImageBackward(id);
  }
  this.closeContextMenu();
}

onMoveImageToFront(): void {
  const id = this.contextMenuImageId();
  if (id) {
    this.store.moveImageToFront(id);
  }
  this.closeContextMenu();
}

onMoveImageToBack(): void {
  const id = this.contextMenuImageId();
  if (id) {
    this.store.moveImageToBack(id);
  }
  this.closeContextMenu();
}

onDeleteSelectedImage(): void {
  const id = this.contextMenuImageId();
  if (id) {
    this.imageDelete.emit(id);
  }
  this.closeContextMenu();
}

// Token handling methods
onTokenDragStart(token: Token, event: MouseEvent): void {
  this.draggingToken = token;
  this.dragStartHex.set(token.position);
  const rect = this.container.nativeElement.getBoundingClientRect();
  const world = this.screenToWorld(event.clientX - rect.left, event.clientY - rect.top);
  this.dragGhostPosition.set(world);
}

onTokenContextMenu(token: Token, event: MouseEvent): void {
  event.preventDefault();
  if (confirm(`Remove ${token.name} from the map?`)) {
    this.tokenRemove.emit(token.id);
  }
}

// Utility methods
getTokenScreenPosition(token: Token): Point {
  const center = HexMath.hexToPixel(token.position);
  return this.worldToScreen(center.x, center.y);
}

private calculatePath(start: HexCoord, end: HexCoord): HexCoord[] {
  const path: HexCoord[] = [start];
  
  if (start.q === end.q && start.r === end.r) {
    return path;
  }

  let current = { ...start };
  
  // Simple linear interpolation pathfinding
  const distance = Math.abs(start.q - end.q) + Math.abs(start.q + start.r - end.q - end.r) + Math.abs(start.r - end.r);
  
  for (let i = 1; i <= distance; i++) {
    const t = i / distance;
    const lerpQ = start.q + (end.q - start.q) * t;
    const lerpR = start.r + (end.r - start.r) * t;
    
    const rounded = this.roundHex(lerpQ, lerpR);
    
    // Only add if different from last position
    const last = path[path.length - 1];
    if (rounded.q !== last.q || rounded.r !== last.r) {
      path.push(rounded);
    }
  }
  
  return path;
}

private roundHex(q: number, r: number): HexCoord {
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  let rs = Math.round(s);
  
  const qDiff = Math.abs(rq - q);
  const rDiff = Math.abs(rr - r);
  const sDiff = Math.abs(rs - s);
  
  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  }
  
  return { q: rq, r: rr };
}