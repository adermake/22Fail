export interface TimelineEntry {
  id: string;              // unique timeline entry id
  characterId: string;
  label?: string;
  team?: string;

  isAnchor: boolean;
  meta?: any;              // free data for your logic
}

export interface TimelineGroup {
  id: string;
  participants: TimelineEntry[];
}
