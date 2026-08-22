import {
  talentPointsForLevel, totalTalentPointsAtLevel, talentPointCostForTier,
} from './skill-tree-rules.util';
import {
  normalizeRace, unarmedEffectiveness, grantedRaceSkills, createEmptyRace, Race,
} from '../model/race.model';
import { migrateSpellSummonsToCompanions, companionFromSoul, blankCompanion } from '../model/companion-block.model';
import { SUMMON_RUNE_ID } from '../shared/spell-node-editor/spell-node.model';
import { SkillBlock } from '../model/skill-block.model';
import {
  knowledgeTierOf, setKnowledgeTier, isKnowledgeVisible, isKnowledgeUsable,
} from './knowledge-tier.util';
import { spentTalentPoints, legacyTalentPointCostForTier } from './skill-tree-rules.util';
import { FORGE_BASE_COST, nextForgeCost, totalForgeSPSpent } from '../model/forging.model';

/**
 * Rules that live in pure functions: the Fähigkeitenbaum economy, race normalisation and the
 * Begleiter migration. These are the numbers the table argues about, so they get pinned down here.
 */

function sk(name: string): SkillBlock {
  return { name, class: 'X', description: '', type: 'passive', enlightened: false } as SkillBlock;
}

describe('Fähigkeitspunkte', () => {
  it('grants 2 per level up to 10', () => {
    expect([1, 2, 5, 10].map(talentPointsForLevel)).toEqual([2, 2, 2, 2]);
  });

  it('steps to 3 at level 11 and 4 at level 21', () => {
    expect(talentPointsForLevel(11)).toBe(3);
    expect(talentPointsForLevel(20)).toBe(3);
    expect(talentPointsForLevel(21)).toBe(4);
  });

  it('totals 20 by level 10 and 50 by level 20', () => {
    expect(totalTalentPointsAtLevel(10)).toBe(20);
    expect(totalTalentPointsAtLevel(20)).toBe(50);
  });

  it('never returns a negative total for level 0', () => {
    expect(totalTalentPointsAtLevel(0)).toBe(0);
  });

  it('costs 1 · 2 · 2 · 3 · 3 by tier', () => {
    expect([1, 2, 3, 4, 5].map(talentPointCostForTier)).toEqual([1, 2, 2, 3, 3]);
  });
});

describe('Waffenlose Effektivität', () => {
  it('is base strength minus 5', () => {
    expect(unarmedEffectiveness(10)).toBe(5);
    expect(unarmedEffectiveness(7)).toBe(2);
  });

  it('can go negative for very weak races', () => {
    expect(unarmedEffectiveness(3)).toBe(-2);
  });
});

describe('normalizeRace', () => {
  const base = (): Race => ({ ...createEmptyRace(), id: 'r', name: 'Test' });

  it('merges skills that share a level into ONE choice row', () => {
    const race = { ...base(), skills: [
      { levelRequired: 1, skills: [sk('A')], isChoice: false },
      { levelRequired: 1, skills: [sk('B')], isChoice: false },
    ]};
    const out = normalizeRace(race);
    expect(out.skills.length).toBe(1);
    expect(out.skills[0].skills.map(s => s.name)).toEqual(['A', 'B']);
    expect(out.skills[0].isChoice).toBe(true);
  });

  it('keeps a single-skill row as a non-choice', () => {
    const race = { ...base(), skills: [{ levelRequired: 3, skills: [sk('Solo')], isChoice: true }] };
    expect(normalizeRace(race).skills[0].isChoice).toBe(false);
  });

  it('preserves pregenerated choice pairs intact', () => {
    const race = { ...base(), skills: [
      { levelRequired: 25, skills: [sk('A'), sk('B')], isChoice: true },
      { levelRequired: 10, skills: [sk('C'), sk('D')], isChoice: true },
    ]};
    const out = normalizeRace(race);
    expect(out.skills.map(g => g.levelRequired)).toEqual([10, 25]);
    expect(out.skills.every(g => g.skills.length === 2)).toBe(true);
  });

  it('fills the ability categories for old data', () => {
    const out = normalizeRace({ ...base(), skills: [] });
    expect(out.advantages).toEqual([]);
    expect(out.disadvantages).toEqual([]);
  });

  it('drops empty Stufen on save but keeps them while editing', () => {
    const race = { ...base(), skills: [
      { levelRequired: 1, skills: [sk('A')], isChoice: false },
      { levelRequired: 5, skills: [], isChoice: false },
    ]};
    expect(normalizeRace(race).skills.length).toBe(1);
    expect(normalizeRace(race, { keepEmptyGroups: true }).skills.length).toBe(2);
  });

  it('coerces string levels and drops null skills', () => {
    const race = { ...base(), skills: [
      { levelRequired: '3' as any, skills: [sk('S'), null as any], isChoice: false },
    ]};
    const out = normalizeRace(race);
    expect(out.skills[0].levelRequired).toBe(3);
    expect(out.skills[0].skills.length).toBe(1);
  });

  it('does not mutate its input', () => {
    // Deliberately raw (no category arrays), the shape old JSON arrives in.
    const race = { id: 'r', name: 'Test', skills: [
      { levelRequired: 1, skills: [sk('A')], isChoice: false },
      { levelRequired: 1, skills: [sk('B')], isChoice: false },
    ]} as unknown as Race;
    const out = normalizeRace(race);
    expect(out.skills.length).toBe(1);
    expect(race.skills.length).toBe(2);
    expect(race.advantages).toBeUndefined();
  });

  it('deduplicates a skill listed twice on the same level', () => {
    const race = { ...base(), skills: [
      { levelRequired: 2, skills: [sk('Dup')], isChoice: false },
      { levelRequired: 2, skills: [sk('Dup')], isChoice: false },
    ]};
    expect(normalizeRace(race).skills[0].skills.length).toBe(1);
  });

  it('collects advantages and disadvantages as the always-on grant list', () => {
    const race = { ...base(), advantages: [sk('Zäh')], disadvantages: [sk('Langsam')] };
    expect(grantedRaceSkills(race).map(s => s.name)).toEqual(['Zäh', 'Langsam']);
  });
});

describe('Begleiter migration', () => {
  it('moves an inline spell summon into the companion list and leaves a reference', () => {
    const statblock = { name: 'Wolf', customSkills: [] } as any;
    const sheet = {
      companions: undefined as any,
      spells: [{ graph: { nodes: [
        { id: 'n1', runeId: SUMMON_RUNE_ID, summon: { soulId: 's1', soulName: 'Wolfsseele', statblock } },
      ] } }],
    };
    expect(migrateSpellSummonsToCompanions(sheet as any)).toBe(true);
    expect(sheet.companions.length).toBe(1);
    expect(sheet.companions[0].name).toBe('Wolf');
    const node = (sheet.spells[0].graph!.nodes as any[])[0];
    expect(node.summon.companionId).toBe(sheet.companions[0].id);
    expect(node.summon.statblock).toBeUndefined();
  });

  it('is a no-op the second time (already migrated)', () => {
    const sheet = { spells: [{ graph: { nodes: [
      { id: 'n1', runeId: SUMMON_RUNE_ID, summon: { companionId: 'c1', companionName: 'Wolf' } },
    ] } }] };
    expect(migrateSpellSummonsToCompanions(sheet as any)).toBe(false);
  });

  it('ignores spells without a summoning rune', () => {
    const sheet = { spells: [{ graph: { nodes: [{ id: 'n1', runeId: 'feuer' }] } }] };
    expect(migrateSpellSummonsToCompanions(sheet as any)).toBe(false);
  });

  it('builds a soul-bound companion with locked stats and the soul name', () => {
    const soul = {
      id: 'soul1', sourceName: 'Bergtroll', sourceType: 'npc' as const, level: 5,
      stats: { strength: 20, dexterity: 8, speed: 8, intelligence: 5, constitution: 18, wille: 7 },
      skills: [], createdAt: 0,
    };
    const companion = companionFromSoul(soul);
    expect(companion.soulId).toBe('soul1');
    expect(companion.soulName).toBe('Bergtroll');
    expect(companion.statblock.soul?.level).toBe(5);
    expect(companion.statblock.soul?.stats.strength).toBe(20);
  });

  it('builds a free-form companion without a soul reference', () => {
    const companion = blankCompanion('Wachhund');
    expect(companion.soulId).toBeUndefined();
    expect(companion.name).toBe('Wachhund');
    expect(companion.statblock.name).toBe('Wachhund');
  });
});


describe('Wissensstufen', () => {
  it('reads old data through isPublic: true → bekannt, false → geheim', () => {
    expect(knowledgeTierOf({ isPublic: true })).toBe('bekannt');
    expect(knowledgeTierOf({ isPublic: false })).toBe('geheim');
  });

  it('prefers an explicit tier over the legacy flag', () => {
    expect(knowledgeTierOf({ isPublic: true, knowledgeTier: 'unbekannt' })).toBe('unbekannt');
  });

  it('keeps isPublic in sync when a tier is set', () => {
    const entry = setKnowledgeTier({ isPublic: false }, 'bekannt');
    expect(entry.isPublic).toBe(true);
    expect(setKnowledgeTier(entry, 'unbekannt').isPublic).toBe(false);
  });

  it('bekannt is always visible and usable', () => {
    const e = { knowledgeTier: 'bekannt' as const };
    expect(isKnowledgeVisible(e, { known: false })).toBe(true);
    expect(isKnowledgeUsable(e, { known: false })).toBe(true);
  });

  it('unbekannt shows only in free mode, and is never usable in enforced crafting', () => {
    const e = { knowledgeTier: 'unbekannt' as const };
    expect(isKnowledgeVisible(e, { known: false, freeMode: true })).toBe(true);
    expect(isKnowledgeVisible(e, { known: false, freeMode: false })).toBe(false);
    expect(isKnowledgeVisible(e, { known: false })).toBe(false); // Wissen tab
    expect(isKnowledgeUsable(e, { known: false, freeMode: true })).toBe(false);
  });

  it('geheim stays hidden everywhere until the GM grants it', () => {
    const e = { knowledgeTier: 'geheim' as const };
    expect(isKnowledgeVisible(e, { known: false, freeMode: true })).toBe(false);
    expect(isKnowledgeVisible(e, { known: true })).toBe(true);
    expect(isKnowledgeUsable(e, { known: true })).toBe(true);
  });

  it('unlockAll (GM view) reveals every tier', () => {
    for (const tier of ['geheim', 'unbekannt', 'bekannt'] as const) {
      expect(isKnowledgeVisible({ knowledgeTier: tier }, { known: false, unlockAll: true })).toBe(true);
    }
  });
});

describe('Fähigkeitspunkt-Buchhaltung', () => {
  const defs: Record<string, any> = {
    alt: { id: 'alt', class: 'Krieger' },   // tier 2 → legacy 1, current 2
    neu: { id: 'neu', class: 'Krieger' },
  };
  const byId = (id: string) => defs[id];

  it('charges skills without a recorded price at the LEGACY tier cost', () => {
    expect(spentTalentPoints(['alt'], undefined, byId)).toBe(legacyTalentPointCostForTier(2));
  });

  it('charges what was actually paid once recorded', () => {
    expect(spentTalentPoints(['neu'], { neu: 2 }, byId)).toBe(2);
  });

  it('mixes grandfathered and new purchases', () => {
    expect(spentTalentPoints(['alt', 'neu'], { neu: 2 }, byId)).toBe(1 + 2);
  });

  it('counts an infinite skill once per instance', () => {
    expect(spentTalentPoints(['neu', 'neu', 'neu'], { neu: 2 }, byId)).toBe(6);
  });
});

describe('Schmiedekosten', () => {
  it('starts at 3 SP per forge', () => {
    expect(FORGE_BASE_COST).toBe(3);
    expect(nextForgeCost(0)).toBe(3);
  });

  it('climbs by one per forge', () => {
    expect([0, 1, 2, 3].map(nextForgeCost)).toEqual([3, 4, 5, 6]);
  });

  it('totals the costs already paid', () => {
    expect(totalForgeSPSpent(0)).toBe(0);
    expect(totalForgeSPSpent(1)).toBe(3);
    expect(totalForgeSPSpent(2)).toBe(7);
    expect(totalForgeSPSpent(3)).toBe(12);
  });

  it('agrees with summing the per-forge costs', () => {
    for (let n = 0; n <= 8; n++) {
      let sum = 0;
      for (let i = 0; i < n; i++) sum += nextForgeCost(i);
      expect(totalForgeSPSpent(n)).toBe(sum);
    }
  });
});
