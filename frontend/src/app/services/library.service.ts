import { Injectable, inject } from '@angular/core';
import { WorldStoreService } from './world-store.service';
import { TrashService } from './trash.service';
import { ItemBlock } from '../model/item-block.model';
import { RuneBlock } from '../model/rune-block.model';
import { SpellBlock } from '../model/spell-block-model';
import { SkillBlock } from '../model/skill-block.model';
import { JsonPatch } from '../model/json-patch.model';
import { WeaponGeneratorService } from './weapon-generator.service';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  private store = inject(WorldStoreService);
  private trashService = inject(TrashService);
  private weaponGenerator = inject(WeaponGeneratorService);

  // Item library management
  createItem(item: ItemBlock) {
    const world = this.store.worldValue;
    if (world) {
      this.store.applyPatch({
        path: 'itemLibrary',
        value: [...world.itemLibrary, item]
      });
    }
  }

  generateRandomWeapon(level: number = 5) {
    const world = this.store.worldValue;
    if (!world) return;
    const weapon = this.weaponGenerator.generateWeapon(level);
    this.store.applyPatch({
      path: 'itemLibrary',
      value: [...world.itemLibrary, weapon]
    });
  }

  generateRandomArmor(level: number = 5) {
    const world = this.store.worldValue;
    if (!world) return;
    const armor = this.weaponGenerator.generateArmor(level);
    this.store.applyPatch({
      path: 'itemLibrary',
      value: [...world.itemLibrary, armor]
    });
  }

  updateItem(index: number, patch: JsonPatch) {
    let subPath = patch.path.replace(/\//g, '.');
    if (subPath.startsWith('.')) subPath = subPath.substring(1);

    this.store.applyPatch({
      path: `itemLibrary.${index}.${subPath}`,
      value: patch.value
    });
  }

  removeItem(index: number): Set<number> {
    const world = this.store.worldValue;
    if (!world) return new Set();

    const item = world.itemLibrary[index];
    const newItems = [...world.itemLibrary];
    newItems.splice(index, 1);

    this.trashService.addToTrash('item', item);

    this.store.applyPatch({
      path: 'itemLibrary',
      value: newItems
    });

    // Return shifted indices for editing state management
    return this.shiftIndices(index);
  }

  // Rune library management
  addRune() {
    const world = this.store.worldValue;
    if (world) {
      const newRune: RuneBlock = {
        name: 'New Rune',
        description: '',
        drawing: '',
        tags: []
      };
      this.store.applyPatch({
        path: 'runeLibrary',
        value: [...world.runeLibrary, newRune]
      });
    }
  }

  updateRune(index: number, patch: JsonPatch) {
    let subPath = patch.path.replace(/\//g, '.');
    if (subPath.startsWith('.')) subPath = subPath.substring(1);

    this.store.applyPatch({
      path: `runeLibrary.${index}.${subPath}`,
      value: patch.value
    });
  }

  removeRune(index: number): Set<number> {
    const world = this.store.worldValue;
    if (!world) return new Set();

    const rune = world.runeLibrary[index];
    const newRunes = [...world.runeLibrary];
    newRunes.splice(index, 1);

    this.trashService.addToTrash('rune', rune);

    this.store.applyPatch({
      path: 'runeLibrary',
      value: newRunes
    });

    return this.shiftIndices(index);
  }

  // Spell library management
  addSpell() {
    const world = this.store.worldValue;
    if (world) {
      const newSpell: SpellBlock = {
        name: 'New Spell',
        description: '',
        drawing: '',
        tags: [],
        binding: { type: 'learned' }
      };
      this.store.applyPatch({
        path: 'spellLibrary',
        value: [...world.spellLibrary, newSpell]
      });
    }
  }

  updateSpell(index: number, patch: JsonPatch) {
    let subPath = patch.path.replace(/\//g, '.');
    if (subPath.startsWith('.')) subPath = subPath.substring(1);

    this.store.applyPatch({
      path: `spellLibrary.${index}.${subPath}`,
      value: patch.value
    });
  }

  removeSpell(index: number): Set<number> {
    const world = this.store.worldValue;
    if (!world) return new Set();

    const spell = world.spellLibrary[index];
    const newSpells = [...world.spellLibrary];
    newSpells.splice(index, 1);

    this.trashService.addToTrash('spell', spell);

    this.store.applyPatch({
      path: 'spellLibrary',
      value: newSpells
    });

    return this.shiftIndices(index);
  }

  // Skill library management
  addSkill() {
    const world = this.store.worldValue;
    if (world) {
      const newSkill = new SkillBlock();
      newSkill.name = 'New Skill';
      newSkill.description = '';
      newSkill.type = 'passive';
      newSkill.class = '';
      newSkill.enlightened = false;
      this.store.applyPatch({
        path: 'skillLibrary',
        value: [...world.skillLibrary, newSkill]
      });
    }
  }

  updateSkill(index: number, patch: JsonPatch) {
    let subPath = patch.path.replace(/\//g, '.');
    if (subPath.startsWith('.')) subPath = subPath.substring(1);

    this.store.applyPatch({
      path: `skillLibrary.${index}.${subPath}`,
      value: patch.value
    });
  }

  removeSkill(index: number): Set<number> {
    const world = this.store.worldValue;
    if (!world) return new Set();

    const skill = world.skillLibrary[index];
    const newSkills = [...world.skillLibrary];
    newSkills.splice(index, 1);

    this.trashService.addToTrash('skill', skill);

    this.store.applyPatch({
      path: 'skillLibrary',
      value: newSkills
    });

    return this.shiftIndices(index);
  }

  // Helper to calculate shifted indices after removal
  private shiftIndices(removedIndex: number): Set<number> {
    // This is used by components to update their editing state sets
    // Returns a new set pattern for indices that need shifting
    return new Set<number>();
  }

  // Get library data from current world
  getItemLibrary(): ItemBlock[] {
    return this.store.worldValue?.itemLibrary || [];
  }

  getRuneLibrary(): RuneBlock[] {
    return this.store.worldValue?.runeLibrary || [];
  }

  getSpellLibrary(): SpellBlock[] {
    return this.store.worldValue?.spellLibrary || [];
  }

  getSkillLibrary(): SkillBlock[] {
    return this.store.worldValue?.skillLibrary || [];
  }
}
