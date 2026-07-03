import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import {
  NpcStatblock,
  NpcArchetype,
  NPC_ARCHETYPES,
  NpcArchetypeDefinition,
} from '../../model/npc-statblock.model';
import { AssetFile } from '../../model/asset-browser.model';
import { Race } from '../../model/race.model';
import { SkillBlock } from '../../model/skill-block.model';
import { SpellBlock } from '../../model/spell-block-model';
import { ItemBlock } from '../../model/item-block.model';
import {
  CLASS_DEFINITIONS,
  SKILL_DEFINITIONS,
} from '../../data/skill-definitions';
import { NpcGeneratorService } from '../../services/npc-generator.service';
import { WeaponGeneratorService } from '../../services/weapon-generator.service';
import { MaterialBlock, ForgeTrait } from '../../model/forging.model';

@Component({
  selector: 'app-npc-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './npc-editor.component.html',
  styleUrl: './npc-editor.component.css',
})
export class NpcEditorComponent implements OnInit {
  @Input() statblock!: NpcStatblock;
  @Input() availableSpells: AssetFile[] = [];
  @Input() availableItems: AssetFile[] = [];
  @Input() availableMaterials: AssetFile[] = [];
  @Input() availableForgeTraits: AssetFile[] = [];

  @Output() save = new EventEmitter<NpcStatblock>();
  @Output() cancel = new EventEmitter<void>();

  private http = inject(HttpClient);
  private npcGen = inject(NpcGeneratorService);
  private weaponGen = inject(WeaponGeneratorService);

  draft!: NpcStatblock;
  races: Race[] = [];

  readonly archetypes = NPC_ARCHETYPES;
  readonly allClasses = Object.keys(CLASS_DEFINITIONS).sort();
  readonly tier1Classes = Object.entries(CLASS_DEFINITIONS)
    .filter(([, v]) => v.tier === 1)
    .map(([k]) => k)
    .sort();

  // Skill search state
  showSkillSearch = false;
  skillSearchQuery = '';

  // Picker state
  showSpellPicker = false;
  showItemPicker = false;

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.draft = JSON.parse(JSON.stringify(this.statblock));
    this.loadRaces();
  }

  private loadRaces(): void {
    this.http.get<Race[]>('/api/races').subscribe({
      next: (races) => {
        this.races = races;
        if (this.draft.raceId && !this.draft.raceName) {
          const race = races.find(r => r.id === this.draft.raceId);
          if (race) this.draft.raceName = race.name;
        }
      },
      error: () => {
        this.races = [];
      },
    });
  }

  // ─── Computed Getters ──────────────────────────────────────────────────────

  get selectedRace(): Race | null {
    return this.races.find(r => r.id === this.draft.raceId) ?? null;
  }

  get selectedArchetype(): NpcArchetypeDefinition | null {
    return NPC_ARCHETYPES.find(a => a.id === this.draft.archetype) ?? null;
  }

  get totalTP(): number {
    return this.npcGen.calcTalentPoints(this.draft.level);
  }

  get spentTP(): number {
    return this.npcGen.calcSpentTP(this.draft.learnedSkillIds);
  }

  get computedFokus(): number {
    if (this.draft.fokusOverride) return this.draft.fokus;
    return this.npcGen.calcFokus(this.draft.intelligence, this.draft.learnedSkillIds);
  }

  get computedReaktionswert(): number {
    if (this.draft.reaktionswertOverride) return this.draft.reaktionswert;
    return this.npcGen.calcReaktionswert(this.draft.wille, this.draft.level);
  }

  get computedGrundbonus(): number {
    if (this.draft.grundbonusOverride) return this.draft.grundbonus;
    return this.npcGen.calcGrundbonus(this.draft.level, this.draft.wille);
  }

  get freeStatPoints(): number {
    return this.npcGen.calcFreeStatPoints(this.draft.level);
  }

  /** Wie viele freie Statpunkte über den Rassen-Basiswerten verteilt wurden. */
  get allocatedStatPoints(): number {
    const race = this.selectedRace;
    if (!race) return 0;
    const base = this.npcGen.calcRaceBaseStats(race, this.draft.level);
    return (
      (this.draft.strength - base.str) +
      (this.draft.dexterity - base.dex) +
      (this.draft.speed - base.spd) +
      (this.draft.intelligence - base.int) +
      (this.draft.constitution - base.con) +
      (this.draft.wille - base.wil)
    );
  }

  get filteredSkillSearch() {
    if (this.skillSearchQuery.length < 2) return [];
    const q = this.skillSearchQuery.toLowerCase();
    return SKILL_DEFINITIONS.filter(
      s =>
        !this.draft.learnedSkillIds.includes(s.id) &&
        (s.name.toLowerCase().includes(q) || s.class.toLowerCase().includes(q)),
    ).slice(0, 25);
  }

  get learnedSkillDetails() {
    return this.draft.learnedSkillIds.map(id => {
      const def = SKILL_DEFINITIONS.find(s => s.id === id);
      return {
        id,
        name: def?.name ?? id,
        class: def?.class ?? '?',
        tier: CLASS_DEFINITIONS[def?.class ?? '']?.tier ?? 1,
      };
    });
  }

  get canGenerateGear(): boolean {
    return this.availableMaterials.length > 0;
  }

  get spreadTotal(): number {
    return this.draft.gearSpreadWeapon + this.draft.gearSpreadArmor + this.draft.gearSpreadAccessory;
  }

  // ─── Race / Archetype Handlers ────────────────────────────────────────────

  onRaceChange(raceId: string): void {
    this.draft.raceId = raceId || undefined;
    const race = this.races.find(r => r.id === raceId);
    this.draft.raceName = race?.name ?? '';
    if (race) {
      this.autoCalcResources();
    }
  }

  onArchetypeChange(archetypeId: string): void {
    this.draft.archetype = archetypeId as NpcArchetype;
    const arch = NPC_ARCHETYPES.find(a => a.id === archetypeId);
    if (arch) {
      this.draft.primaryClassTarget = arch.primaryClass;
      this.draft.secondaryClassTarget = arch.secondaryClass;
      this.draft.gearSpreadWeapon = arch.gearSpread.weapon;
      this.draft.gearSpreadArmor = arch.gearSpread.armor;
      this.draft.gearSpreadAccessory = arch.gearSpread.accessory;
    }
  }

  // ─── Auto-Kalkulationen ───────────────────────────────────────────────────

  autoCalcResources(): void {
    const race = this.selectedRace;
    if (!race) return;
    const res = this.npcGen.calcResources(race, this.draft.level);
    this.draft.maxHealth = res.health;
    this.draft.maxMana = res.mana;
    this.draft.maxEnergy = res.energy;
  }

  autoAllocateStats(): void {
    const race = this.selectedRace;
    const arch = this.selectedArchetype;
    if (!race || !arch) return;
    const base = this.npcGen.calcRaceBaseStats(race, this.draft.level);
    const free = this.npcGen.calcFreeStatPoints(this.draft.level);
    const result = this.npcGen.autoAllocateStats(arch, base, free);
    this.draft.strength = result.str;
    this.draft.dexterity = result.dex;
    this.draft.speed = result.spd;
    this.draft.intelligence = result.int;
    this.draft.constitution = result.con;
    this.draft.wille = result.wil;
    this.recalcDerived();
  }

  autoGenSkills(): void {
    this.draft.learnedSkillIds = this.npcGen.autoSkillTree(
      this.draft.primaryClassTarget,
      this.draft.secondaryClassTarget,
      this.draft.classWeight,
      this.totalTP,
    );
    this.recalcDerived();
  }

  recalcDerived(): void {
    if (!this.draft.fokusOverride) {
      this.draft.fokus = this.npcGen.calcFokus(this.draft.intelligence, this.draft.learnedSkillIds);
    }
    if (!this.draft.reaktionswertOverride) {
      this.draft.reaktionswert = this.npcGen.calcReaktionswert(this.draft.wille, this.draft.level);
    }
    if (!this.draft.grundbonusOverride) {
      this.draft.grundbonus = this.npcGen.calcGrundbonus(this.draft.level, this.draft.wille);
    }
  }

  /** Einmaliger Klick: Rasse anwenden, Stats + Fertigkeiten generieren */
  generateAll(): void {
    this.autoCalcResources();
    if (this.draft.mode === 'humanoid' && this.selectedArchetype) {
      this.autoAllocateStats();
      this.autoGenSkills();
    }
    this.recalcDerived();
  }

  // ─── Skill Management ─────────────────────────────────────────────────────

  removeLearnedSkill(skillId: string): void {
    this.draft.learnedSkillIds = this.draft.learnedSkillIds.filter(id => id !== skillId);
    this.recalcDerived();
  }

  addLearnedSkillById(skillId: string): void {
    if (!this.draft.learnedSkillIds.includes(skillId)) {
      this.draft.learnedSkillIds.push(skillId);
    }
    this.skillSearchQuery = '';
    this.showSkillSearch = false;
    this.recalcDerived();
  }

  removeCustomSkill(index: number): void {
    this.draft.customSkills.splice(index, 1);
  }

  addCustomSkill(): void {
    const skill: SkillBlock = {
      name: 'Neue Fertigkeit',
      class: 'Benutzerdefiniert',
      description: '',
      type: 'active',
      enlightened: false,
    };
    this.draft.customSkills.push(skill);
  }

  // ─── Spell Management ─────────────────────────────────────────────────────

  addSpellFromLibrary(file: AssetFile): void {
    const spell = file.data as SpellBlock;
    this.draft.spells.push(JSON.parse(JSON.stringify(spell)));
    this.showSpellPicker = false;
  }

  removeSpell(index: number): void {
    this.draft.spells.splice(index, 1);
  }

  // ─── Equipment Management ─────────────────────────────────────────────────

  addItemFromLibrary(file: AssetFile): void {
    const item = file.data as ItemBlock;
    this.draft.equipment.push(JSON.parse(JSON.stringify(item)));
    this.showItemPicker = false;
  }

  removeEquipment(index: number): void {
    this.draft.equipment.splice(index, 1);
  }

  generateWeapon(): void {
    const materials = this.availableMaterials.map(f => f.data as MaterialBlock);
    const traits = this.availableForgeTraits.map(f => f.data as ForgeTrait);

    if (materials.length === 0) {
      alert('Keine Materialien in der Bibliothek verfügbar. Füge zuerst Materialien hinzu.');
      return;
    }

    const weaponBudget = Math.max(
      10,
      Math.floor(this.draft.gearBudget * this.draft.gearSpreadWeapon / 100),
    );

    const result = this.weaponGen.generate(
      {
        maxSP: Math.floor(weaponBudget / 5),
        costPerSP: 5,
        minBudget: 0,
        budget: weaponBudget,
        forgingRatio: 50,
        weaponTypeName: null,
        weaponSize: null,
        minHaltbarkeit: null,
        minEffektivitaet: null,
        maxWeight: null,
      },
      materials,
      traits,
      {},
      {},
    );

    if (!result) {
      alert('Waffe konnte nicht generiert werden. Überprüfe Budget und verfügbare Materialien.');
      return;
    }

    const effects = [...result.allTraitEffects, ...result.allExtraEffects].filter(Boolean);

    const weapon = new ItemBlock();
    weapon.name = result.weaponType.name;
    weapon.description = `Geschmiedete Waffe (${result.weaponSize})`;
    weapon.weight = result.finalWeight;
    weapon.lost = false;
    weapon.broken = false;
    weapon.itemType = 'weapon';
    weapon.armorType = 'weapon';
    weapon.requirements = { strength: result.finalStatRequirement };
    weapon.efficiency = result.finalEffektivitaet;
    weapon.hasDurability = true;
    weapon.durability = result.finalHaltbarkeit;
    weapon.maxDurability = result.finalHaltbarkeit;
    weapon.weaponTypeName = result.weaponType.name;
    weapon.damageType = result.weaponType.damageType;
    weapon.range = result.weaponType.range;
    weapon.value = result.totalCost;
    weapon.isIdentified = true;
    if (effects.length > 0) {
      weapon.primaryEffect = effects.join('; ');
    }

    this.draft.equipment.push(weapon);
  }

  // ─── Derived Override Toggles ─────────────────────────────────────────────

  toggleFokusOverride(): void {
    this.draft.fokusOverride = !this.draft.fokusOverride;
    if (!this.draft.fokusOverride) {
      this.draft.fokus = this.computedFokus;
    }
  }

  toggleReaktionswertOverride(): void {
    this.draft.reaktionswertOverride = !this.draft.reaktionswertOverride;
    if (!this.draft.reaktionswertOverride) {
      this.draft.reaktionswert = this.computedReaktionswert;
    }
  }

  toggleGrundbonusOverride(): void {
    this.draft.grundbonusOverride = !this.draft.grundbonusOverride;
    if (!this.draft.grundbonusOverride) {
      this.draft.grundbonus = this.computedGrundbonus;
    }
  }

  // ─── Save / Cancel ────────────────────────────────────────────────────────

  onSave(): void {
    if (!this.draft.name?.trim()) this.draft.name = 'NSC';
    this.recalcDerived();
    this.save.emit(this.draft);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // ─── Template Helpers ─────────────────────────────────────────────────────

  getSkillName(skillId: string): string {
    return SKILL_DEFINITIONS.find(s => s.id === skillId)?.name ?? skillId;
  }

  getSkillClass(skillId: string): string {
    return SKILL_DEFINITIONS.find(s => s.id === skillId)?.class ?? '?';
  }

  getSkillTier(skillId: string): number {
    const cls = SKILL_DEFINITIONS.find(s => s.id === skillId)?.class;
    return CLASS_DEFINITIONS[cls ?? '']?.tier ?? 1;
  }

  getSpellName(spell: SpellBlock): string {
    return (spell as any).name ?? 'Unbekannter Zauber';
  }

  tierClass(tier: number): string {
    return `tier-${Math.min(tier, 5)}`;
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }
}
