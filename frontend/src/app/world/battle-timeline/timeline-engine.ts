import { TimelineGroup, TimelineEntry } from "./timeline-model";

export abstract class BattleTimelineEngine {

  /** Your raw battle state */
  protected participants: any[] = [];

  /** Called when participants change */
  setParticipants(data: any[]) {
    this.participants = structuredClone(data);
  }

  /** Build timeline groups */
  abstract buildTimeline(): TimelineGroup[];

  /** Called when user drags any entry */
  abstract onDragEntry(entryId: string): void;

  /** Called when dropped */
  abstract onDropEntry(entryId: string, targetGroupIndex: number): void;

  /** Called when turn is advanced */
  abstract onAdvanceTurn(entryId: string): void;

  /** Optional reorder hook */
  abstract onReorderTimeline(fromIndex: number, toIndex: number): void;

  /** Optional validation */
  canDrag(entry: TimelineEntry): boolean {
    return true; // override if needed
  }

  /** Optional grouping rules */
  canGroup(a: TimelineEntry, b: TimelineEntry): boolean {
    return false;
  }
}
