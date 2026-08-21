// src/app/model/world.model.ts
function createEmptyWorld(name) {
  const defaultClock = {
    year: 321,
    day: 1,
    hour: 8,
    minute: 0
  };
  const defaultAbsoluteHour = (defaultClock.year * 360 + (defaultClock.day - 1)) * 24 + defaultClock.hour;
  return {
    name,
    worldClockMinutes: Math.floor(Date.now() / 6e4),
    worldClock: defaultClock,
    encounterTimer: {
      enabled: false,
      intervalHours: 4,
      nextTriggerAtHour: defaultAbsoluteHour + 4
    },
    characterIds: [],
    partyIds: [],
    linkedLibraries: [],
    itemLibrary: [],
    runeLibrary: [],
    spellLibrary: [],
    skillLibrary: [],
    statusEffectLibrary: [],
    currentEvents: [],
    lootBundles: [],
    battleLoot: [],
    battleParticipants: [],
    currentTurnIndex: 0,
    trash: [],
    battleMaps: []
  };
}

export {
  createEmptyWorld
};
//# sourceMappingURL=chunk-4YEN6ADO.js.map
