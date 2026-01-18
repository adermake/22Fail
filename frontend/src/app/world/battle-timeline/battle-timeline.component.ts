import { Component, Input } from "@angular/core";
import { BattleTimelineEngine } from "./timeline-engine";
import { TimelineGroup, TimelineEntry } from "./timeline-model";

@Component({
  selector: 'app-battle-timeline',
  templateUrl: './battle-timeline.component.html',
})
export class BattleTimeline {

  @Input() engine!: BattleTimelineEngine;

  timeline: TimelineGroup[] = [];

  draggedEntry: TimelineEntry | null = null;

  ngOnChanges() {
    this.refresh();
  }

  refresh() {
    this.timeline = this.engine.buildTimeline();
  }

  onDragStart(entry: TimelineEntry) {
    if (!this.engine.canDrag(entry)) return;
    this.draggedEntry = entry;
    this.engine.onDragEntry(entry.id);
  }

  onDrop(groupIndex: number) {
    if (!this.draggedEntry) return;

    this.engine.onDropEntry(this.draggedEntry.id, groupIndex);
    this.draggedEntry = null;
    this.refresh();
  }

  onAdvance(entry: TimelineEntry) {
    this.engine.onAdvanceTurn(entry.id);
    this.refresh();
  }
}
