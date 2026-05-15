/**
 * NpcGeneratorService
 *
 * Enthält die Logik für die automatische Generierung von NSC-Statblöcken:
 * - Talentpunkte berechnen
 * - Talentbaum traversieren (50%-Regel, Klassen-Pfad-Suche)
 * - Statistiken aus Archetyp verteilen
 * - Abgeleitete Werte berechnen (Fokus, Reaktionswert, Grundbonus)
 * - Ressourcen aus Rasse berechnen
 */

import { Injectable } from '@angular/core';
import {
  CLASS_DEFINITIONS,
  SKILL_DEFINITIONS,
  getSkillsForClass,
} from '../data/skill-definitions';
import { SkillDefinition } from '../model/skill-definition.model';
import { NpcArchetypeDefinition } from '../model/npc-statblock.model';
import { Race } from '../model/race.model';

export interface BaseStats {
  str: number;
  dex: number;
  spd: number;
  int: number;
  con: number;
  wil: number;
}

@Injectable({ providedIn: 'root' })
export class NpcGeneratorService {

  /** Eltern-Map: Kind-Klasse → Liste der Eltern-Klassen */
  private readonly parentMap: Map<string, string[]>;

  constructor() {
    this.parentMap = new Map<string, string[]>();
    for (const [cls, info] of Object.entries(CLASS_DEFINITIONS)) {
      for (const child of info.children) {
        if (!this.parentMap.has(child.className)) {
          this.parentMap.set(child.className, []);
        }
        this.parentMap.get(child.className)!.push(cls);
      }
    }
  }

  // ─── Talentpunkte ─────────────────────────────────────────────────────────

  /** Gesamte verdiente Talentpunkte für ein Level. */
  calcTalentPoints(level: number): number {
    let total = 0;
    for (let l = 1; l <= level; l++) {
      total += 1 + Math.floor((l - 1) / 10);
    }
    return total;
  }

  /** TP-Kosten einer Fertigkeit anhand der Klassen-Stufe. */
  getSkillTPCost(skill: SkillDefinition): number {
    const classInfo = CLASS_DEFINITIONS[skill.class];
    if (!classInfo) return 1;
    const tier = classInfo.tier;
    if (tier <= 2) return 1;
    if (tier <= 4) return 2;
    return 3;
  }

  /** Bereits verbrauchte TP für eine Liste gelernter Skill-IDs. */
  calcSpentTP(learnedSkillIds: string[]): number {
    return learnedSkillIds.reduce((sum, id) => {
      const skill = SKILL_DEFINITIONS.find(s => s.id === id);
      return sum + (skill ? this.getSkillTPCost(skill) : 1);
    }, 0);
  }

  // ─── Pfad-Suche ───────────────────────────────────────────────────────────

  /**
   * Findet den kürzesten Pfad von einer Tier-1-Klasse zur Zielklasse.
   * Gibt ein geordnetes Array [Tier1, ..., Ziel] zurück.
   * Wenn Ziel selbst Tier-1 ist, wird [Ziel] zurückgegeben.
   */
  findPathToClass(targetClass: string): string[] {
    const info = CLASS_DEFINITIONS[targetClass];
    if (!info) return [targetClass];
    if (info.tier === 1) return [targetClass];

    // BFS rückwärts: von Zielklasse zu Tier-1
    const queue: Array<{ cls: string; path: string[] }> = [
      { cls: targetClass, path: [targetClass] },
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { cls, path } = queue.shift()!;
      if (visited.has(cls)) continue;
      visited.add(cls);

      const tier = CLASS_DEFINITIONS[cls]?.tier;
      if (tier === 1) {
        // Pfad umkehren: Tier-1 an Anfang
        return [...path].reverse();
      }

      const parents = this.parentMap.get(cls) ?? [];
      for (const parent of parents) {
        if (!visited.has(parent)) {
          queue.push({ cls: parent, path: [...path, parent] });
        }
      }
    }

    // Fallback: Klasse konnte nicht gefunden werden
    return [targetClass];
  }

  // ─── Talentbaum-Traversierung ─────────────────────────────────────────────

  /**
   * Generiert automatisch eine Liste gelernter Skill-IDs.
   *
   * - Findet den Pfad zur Primär- und Sekundärklasse.
   * - Füllt den gemeinsamen Stamm bis 50%.
   * - Teilt die restlichen TP nach Gewicht auf.
   * - Respektiert die 50%-Regel: Jede Klasse muss zu 50% gelernt sein,
   *   bevor die Kindklasse zugänglich wird.
   */
  autoSkillTree(
    primaryClass: string,
    secondaryClass: string,
    weight: number,   // 0–100: Anteil für Primärklasse
    totalTP: number,
  ): string[] {
    const learnedIds: string[] = [];
    const classProgress = new Map<string, number>();

    if (totalTP <= 0) return learnedIds;

    const primaryPath = this.findPathToClass(primaryClass);
    const secondaryPath = secondaryClass ? this.findPathToClass(secondaryClass) : [];

    // Gemeinsamen Stamm ermitteln (gemeinsames Präfix beider Pfade)
    let trunkLength = 0;
    for (let i = 0; i < Math.min(primaryPath.length, secondaryPath.length); i++) {
      if (primaryPath[i] === secondaryPath[i]) {
        trunkLength = i + 1;
      } else {
        break;
      }
    }

    const trunk = primaryPath.slice(0, trunkLength);
    const primaryBranch = primaryPath.slice(trunkLength);
    const secondaryBranch = secondaryPath.slice(trunkLength);

    let remainingTP = totalTP;

    // Schritt 1: Stamm bis 50% füllen
    remainingTP = this.fillPathClasses(trunk, remainingTP, learnedIds, classProgress, false);
    if (remainingTP <= 0) return learnedIds;

    // Schritt 2: TP nach Gewicht aufteilen
    const clampedWeight = Math.max(0, Math.min(100, weight));
    const primaryShare = secondaryClass
      ? Math.round(remainingTP * clampedWeight / 100)
      : remainingTP;
    const secondaryShare = remainingTP - primaryShare;

    // Schritt 3: Primär-Ast füllen
    const leftoverFromPrimary = this.fillPathClasses(
      primaryBranch, primaryShare, learnedIds, classProgress, true,
    );

    // Schritt 4: Sekundär-Ast füllen (+ evtl. Überschuss vom Primär-Ast)
    this.fillPathClasses(
      secondaryBranch,
      secondaryShare + leftoverFromPrimary,
      learnedIds,
      classProgress,
      true,
    );

    return learnedIds;
  }

  /**
   * Füllt Fertigkeiten entlang eines Klassen-Pfades.
   *
   * @param isTargetPhase  true = letzte Klasse im Pfad wird vollständig gefüllt;
   *                       false = jede Klasse wird nur bis zur 50%-Schwelle gefüllt.
   * @returns Verbleibende TP
   */
  private fillPathClasses(
    path: string[],
    tp: number,
    learnedIds: string[],
    classProgress: Map<string, number>,
    isTargetPhase: boolean,
  ): number {
    let remaining = tp;

    for (let i = 0; i < path.length; i++) {
      const cls = path[i];
      // Unendlich lernbare Fertigkeiten (∞) werden übersprungen
      const skills = getSkillsForClass(cls).filter(s => !s.infiniteLevel);
      const isLast = i === path.length - 1;

      // Wie viele Fertigkeiten dieser Klasse sollen gelernt werden?
      const fillTarget = isTargetPhase && isLast
        ? skills.length                      // Letzte Zielklasse: alles
        : Math.ceil(skills.length / 2);      // Zwischenklassen: 50% Minimum

      let learned = classProgress.get(cls) ?? 0;

      for (const skill of skills) {
        if (learnedIds.includes(skill.id)) continue;
        if (learned >= fillTarget || remaining <= 0) break;

        const cost = this.getSkillTPCost(skill);
        if (remaining >= cost) {
          learnedIds.push(skill.id);
          learned++;
          remaining -= cost;
          classProgress.set(cls, learned);
        }
      }

      // Kann diese Klasse nicht zur Schwelle gebracht werden → Stopp
      const threshold = Math.ceil(skills.length / 2);
      if (!isLast && (classProgress.get(cls) ?? 0) < threshold) {
        break;
      }
    }

    return remaining;
  }

  // ─── Ressourcen ───────────────────────────────────────────────────────────

  /** Berechnet HP, Mana und Ausdauer aus Rasse und Level. */
  calcResources(
    race: Race,
    level: number,
  ): { health: number; mana: number; energy: number } {
    const lvl = Math.max(1, level);
    return {
      health: race.baseHealth + (lvl - 1) * race.healthPerLevel,
      mana: race.baseMana + (lvl - 1) * race.manaPerLevel,
      energy: race.baseEnergy + (lvl - 1) * race.energyPerLevel,
    };
  }

  // ─── Basiswerte ───────────────────────────────────────────────────────────

  /** Berechnet Rassenbasisboni (ohne freie Statpunkte). */
  calcRaceBaseStats(race: Race, level: number): BaseStats {
    const lvl = Math.max(1, level);
    return {
      str: race.baseStrength + (lvl - 1) * race.strengthPerLevel,
      dex: race.baseDexterity + (lvl - 1) * race.dexterityPerLevel,
      spd: race.baseSpeed + (lvl - 1) * race.speedPerLevel,
      int: race.baseIntelligence + (lvl - 1) * race.intelligencePerLevel,
      con: race.baseConstitution + (lvl - 1) * race.constitutionPerLevel,
      wil: race.baseChill + (lvl - 1) * race.chillPerLevel,
    };
  }

  /** Freie Statpunkte für ein Level. */
  calcFreeStatPoints(level: number): number {
    return Math.floor(level / 3);
  }

  /**
   * Verteilt freie Statpunkte proportional zu den Archetyp-Gewichten.
   * Gibt den angepassten BaseStats-Wert zurück.
   */
  autoAllocateStats(
    archetype: NpcArchetypeDefinition,
    base: BaseStats,
    freePoints: number,
  ): BaseStats {
    const w = archetype.statWeights;
    const totalWeight = w.strength + w.dexterity + w.speed + w.intelligence + w.constitution + w.wille;

    if (totalWeight === 0 || freePoints <= 0) return base;

    // Proportionale Verteilung, Rundung auf ganze Punkte
    const allocate = (weight: number) => Math.round(freePoints * weight / totalWeight);

    return {
      str: base.str + allocate(w.strength),
      dex: base.dex + allocate(w.dexterity),
      spd: base.spd + allocate(w.speed),
      int: base.int + allocate(w.intelligence),
      con: base.con + allocate(w.constitution),
      wil: base.wil + allocate(w.wille),
    };
  }

  // ─── Abgeleitete Werte ────────────────────────────────────────────────────

  /** Berechnet Fokus (= Intelligenz + Fokus-Boni aus Fertigkeiten). */
  calcFokus(intelligence: number, learnedSkillIds: string[]): number {
    let fokus = intelligence;
    for (const id of learnedSkillIds) {
      const skill = SKILL_DEFINITIONS.find(s => s.id === id);
      if (!skill) continue;
      if (skill.statBonus?.stat === 'focus') fokus += skill.statBonus.amount;
      if (skill.statBonuses) {
        for (const b of skill.statBonuses) {
          if (b.stat === 'focus') fokus += b.amount;
        }
      }
    }
    return fokus;
  }

  /** Berechnet Reaktionswert (= 10 − ⌊Wille / 5⌋). */
  calcReaktionswert(wille: number): number {
    return 10 - Math.floor(wille / 5);
  }

  /** Berechnet Grundbonus (= ⌊Level / 5⌋). */
  calcGrundbonus(level: number): number {
    return Math.floor(level / 5);
  }

  // ─── Hilfsmethoden für die UI ─────────────────────────────────────────────

  /** Gibt alle Klassennamen eines bestimmten Tiers zurück. */
  getClassesByTier(tier: number): string[] {
    return Object.entries(CLASS_DEFINITIONS)
      .filter(([, info]) => info.tier === tier)
      .map(([name]) => name);
  }

  /** Gibt alle Klassennamen sortiert zurück. */
  getAllClasses(): string[] {
    return Object.keys(CLASS_DEFINITIONS).sort();
  }
}
