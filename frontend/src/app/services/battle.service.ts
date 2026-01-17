import { Injectable, inject } from '@angular/core';
import { WorldStoreService } from './world-store.service';
import { BattleParticipant } from '../model/world.model';
import { CharacterSheet } from '../model/character-sheet-model';

export interface SimulatedTurn {
  characterId: string;
  name: string;
  team: string;
  time: number;
  isAnchor: boolean;
  speed: number;
}

export interface BattleGroup {
  turns: SimulatedTurn[];
  team: string;
  startTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class BattleService {
  private store = inject(WorldStoreService);

  // Reference to party characters - set by WorldComponent
  private partyCharacters: Map<string, CharacterSheet> = new Map();

  setPartyCharacters(characters: Map<string, CharacterSheet>) {
    this.partyCharacters = characters;
  }

  calculateSpeed(character: CharacterSheet): number {
    const speedStat = character.speed;
    if (!speedStat) return 10;
    const calculated = speedStat.base + speedStat.bonus + (character.level / (speedStat.gain || 1));
    return Math.floor(calculated) || 10;
  }

  getAvailableCharactersForBattle(partyArray: Array<{id: string, sheet: CharacterSheet}>) {
    return partyArray.map(member => ({
      id: member.id,
      name: member.sheet.name || member.id,
      speed: this.calculateSpeed(member.sheet)
    }));
  }

  addToBattle(characterId: string) {
    const world = this.store.worldValue;
    if (!world) return;

    const character = this.partyCharacters.get(characterId);
    if (!character) return;

    const speed = this.calculateSpeed(character);

    const maxTurn = world.battleParticipants.length > 0
      ? Math.max(...world.battleParticipants.map(p => p.nextTurnAt))
      : 0;

    const newParticipant: BattleParticipant = {
      characterId,
      name: character.name || characterId,
      speed,
      turnFrequency: speed,
      nextTurnAt: maxTurn + 10,
      team: 'blue'
    };

    const updatedParticipants = [...world.battleParticipants, newParticipant];

    this.store.applyPatch({
      path: 'battleParticipants',
      value: updatedParticipants
    });
  }

  removeFromBattle(characterId: string) {
    const world = this.store.worldValue;
    if (!world) return;

    const updatedParticipants = world.battleParticipants.filter(
      (p: BattleParticipant) => p.characterId !== characterId
    );

    this.store.applyPatch({
      path: 'battleParticipants',
      value: updatedParticipants
    });
  }

  advanceTurn() {
    const world = this.store.worldValue;
    if (!world || world.battleParticipants.length === 0) {
      return;
    }

    const queue = this.getBattleQueue();
    if (queue.length === 0) return;

    const firstGroup = queue[0];
    const groupIds = new Set(firstGroup.turns.map(t => t.characterId));

    const updatedParticipants = world.battleParticipants.map((p: BattleParticipant) => {
      const character = this.partyCharacters.get(p.characterId);
      const freshSpeed = character ? this.calculateSpeed(character) : p.speed;

      if (groupIds.has(p.characterId)) {
        const newNextTurnAt = p.nextTurnAt + (1000 / freshSpeed);
        return {
          ...p,
          speed: freshSpeed,
          nextTurnAt: newNextTurnAt
        };
      }
      return {
        ...p,
        speed: freshSpeed
      };
    });

    this.store.applyPatch({
      path: 'battleParticipants',
      value: updatedParticipants
    });
  }

  resetBattle() {
    const world = this.store.worldValue;
    if (!world) return;

    const resetParticipants = world.battleParticipants.map((p: BattleParticipant) => {
      const character = this.partyCharacters.get(p.characterId);
      const freshSpeed = character ? this.calculateSpeed(character) : p.speed;
      return {
        ...p,
        speed: freshSpeed,
        nextTurnAt: 0
      };
    });

    this.store.applyPatch({
      path: 'battleParticipants',
      value: resetParticipants
    });
  }

  refreshBattleSpeeds() {
    const world = this.store.worldValue;
    if (!world) return;

    const updatedParticipants = world.battleParticipants.map((p: BattleParticipant) => {
      const character = this.partyCharacters.get(p.characterId);
      const freshSpeed = character ? this.calculateSpeed(character) : p.speed;
      return {
        ...p,
        speed: freshSpeed
      };
    });

    this.store.applyPatch({
      path: 'battleParticipants',
      value: updatedParticipants
    });
  }

  syncTurns(sourceId: string, targetId: string) {
    const world = this.store.worldValue;
    if (!world) return;

    const targetParticipant = world.battleParticipants.find(p => p.characterId === targetId);
    if (!targetParticipant) return;

    const updatedParticipants = world.battleParticipants.map((p: BattleParticipant) => {
      if (p.characterId === sourceId) {
        return {
          ...p,
          nextTurnAt: targetParticipant.nextTurnAt
        };
      }
      return p;
    });

    this.store.applyPatch({
      path: 'battleParticipants',
      value: updatedParticipants
    });
  }

  setTurnOrder(characterId: string, position: number) {
    const world = this.store.worldValue;
    if (!world || world.battleParticipants.length === 0) return;

    const queue: BattleParticipant[] = [];
    const participants = world.battleParticipants.map(p => ({ ...p }));

    for (let i = 0; i < 10; i++) {
      participants.sort((a, b) => a.nextTurnAt - b.nextTurnAt);
      const next = participants[0];
      queue.push({ ...next });
      next.nextTurnAt = next.nextTurnAt + (1000 / next.speed);
    }

    const targetTurnAt = queue[position]?.nextTurnAt;
    if (targetTurnAt === undefined) return;

    const updatedParticipants = world.battleParticipants.map((p: BattleParticipant) => {
      if (p.characterId === characterId) {
        return {
          ...p,
          nextTurnAt: targetTurnAt
        };
      }
      return p;
    });

    this.store.applyPatch({
      path: 'battleParticipants',
      value: updatedParticipants
    });
  }

  changeParticipantTeam(characterId: string, team: string) {
    const world = this.store.worldValue;
    if (!world) return;

    const updatedParticipants = world.battleParticipants.map((p: BattleParticipant) =>
      p.characterId === characterId ? { ...p, team } : p
    );

    this.store.applyPatch({
      path: 'battleParticipants',
      value: updatedParticipants
    });
  }

  reorderParticipants(characterId: string, newIndex: number) {
    const world = this.store.worldValue;
    if (!world) return;

    const queue = this.getBattleQueue();
    if (queue.length === 0) return;

    let newNextTurnAt: number;

    if (newIndex <= 0) {
      newNextTurnAt = queue[0].startTime - 10;
    } else if (newIndex >= queue.length) {
      newNextTurnAt = queue[queue.length - 1].startTime + 10;
    } else {
      const prev = queue[newIndex - 1];
      const next = queue[newIndex];
      newNextTurnAt = (prev.startTime + next.startTime) / 2;
    }

    const updatedParticipants = world.battleParticipants.map((p: BattleParticipant) => {
      if (p.characterId === characterId) {
        return { ...p, nextTurnAt: newNextTurnAt };
      }
      return p;
    });

    this.store.applyPatch({
      path: 'battleParticipants',
      value: updatedParticipants
    });
  }

  getBattleQueue(): BattleGroup[] {
    const world = this.store.worldValue;
    if (!world || world.battleParticipants.length === 0) return [];

    const turns: SimulatedTurn[] = [];
    const participants = world.battleParticipants.map(p => ({
      ...p,
      currentTurnAt: p.nextTurnAt,
      speed: this.partyCharacters.get(p.characterId)
        ? this.calculateSpeed(this.partyCharacters.get(p.characterId)!)
        : p.speed
    }));

    for (let step = 0; step < 50; step++) {
      participants.sort((a, b) => a.currentTurnAt - b.currentTurnAt);

      const next = participants[0];

      const original = world.battleParticipants.find(p => p.characterId === next.characterId);
      const isAnchor = original ? Math.abs(original.nextTurnAt - next.currentTurnAt) < 0.001 : false;

      turns.push({
        characterId: next.characterId,
        name: next.name,
        team: next.team || 'blue',
        time: next.currentTurnAt,
        isAnchor,
        speed: next.speed
      });

      next.currentTurnAt += (1000 / next.speed);
    }

    const groups: BattleGroup[] = [];
    if (turns.length === 0) return [];

    let currentGroup: BattleGroup = {
      turns: [turns[0]],
      team: turns[0].team,
      startTime: turns[0].time
    };
    let membersInGroup = new Set<string>([turns[0].characterId]);

    for (let i = 1; i < turns.length; i++) {
      const turn = turns[i];

      if (turn.team === currentGroup.team && !membersInGroup.has(turn.characterId)) {
        currentGroup.turns.push(turn);
        membersInGroup.add(turn.characterId);
      } else {
        groups.push(currentGroup);

        currentGroup = {
          turns: [turn],
          team: turn.team,
          startTime: turn.time
        };
        membersInGroup = new Set([turn.characterId]);
      }
    }
    groups.push(currentGroup);

    return groups;
  }
}
