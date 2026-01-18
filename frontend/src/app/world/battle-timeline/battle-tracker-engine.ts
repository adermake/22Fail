import { BattleTimelineEngine } from "./timeline-engine";
import { TimelineGroup } from "./timeline-model";

export class BattleTrackerEngine extends BattleTimelineEngine {

  buildTimeline(): TimelineGroup[] {
    // TODO: your logic
    return [];
  }

  onDragEntry(entryId: string) {
    // TODO: highlight / prepare drag
  }

  onDropEntry(entryId: string, targetGroupIndex: number) {
    // TODO: implement reorder logic
  }

  onAdvanceTurn(entryId: string) {
    // TODO: advance battle state
  }

  onReorderTimeline(from: number, to: number) {
    // optional
  }
}
