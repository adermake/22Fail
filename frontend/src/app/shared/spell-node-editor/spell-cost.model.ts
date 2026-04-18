/** Simple spell cost — sum of all rune costs in the graph */
export interface SimpleSpellCost {
  mana: number;
  fokus: number;
  nodeCount: number;
  statRequirements: {
    strength?: number;
    dexterity?: number;
    speed?: number;
    intelligence?: number;
    constitution?: number;
    chill?: number;
  };
}
