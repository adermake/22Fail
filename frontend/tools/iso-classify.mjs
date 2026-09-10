/**
 * Sorting the bought asset packs into the editor's symbol categories.
 *
 * The packs mix world-map furniture (castles, forests, cliffs, cartographic icons) with
 * battlemap clutter (market stalls, washing lines, animal feeders). On a map where one hex is
 * 4 km the clutter is not *wrong*, just rarely wanted, so it goes to a category of its own
 * that is opened deliberately rather than padding out the pickers used constantly.
 *
 * ## Why this tokenises instead of matching the raw filename
 *
 * The first attempt ran regexes straight at names like `half-timber_Inn_1`, and two things
 * went wrong that are worth not repeating:
 *
 *  - **`\b` does not fire before `_`.** An underscore is a word character, so `/inn\b/`
 *    failed on `..._Inn_1` and every inn was filed as clutter. The same silently broke
 *    `rock`, `cart`, `camp`, `keep`, `well` and `pen`.
 *  - **Short words match inside longer ones.** `table` matched `Dwarven_stables`, so the
 *    stables became furniture.
 *
 * Splitting the name into words first — on separators *and* camel case — makes both problems
 * go away: short, ambiguous words are matched as whole words, and only long unambiguous ones
 * are allowed to match as substrings, which is what catches the pack authors' run-together
 * names like `woodenfence` and `animalfeeder`.
 */

/**
 * `CityOfTheDead_GnarledTree_1` → `['city','of','the','dead','gnarled','tree','1']`.
 *
 * Digits are split off the word they are glued to as well. The packs number variants both
 * ways — `medieval_barn_1` *and* `medieval_barn1` — and without this the second form leaves
 * the token as `barn1`, which matches nothing. That silently filed every numbered house,
 * barn and ship in the largest pack as clutter.
 */
export function words(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z])(\d)/gi, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Rules in priority order; the first that matches wins.
 *
 * `exact` holds words short enough to appear inside unrelated ones, matched whole.
 * `like` holds words long enough to be safe as substrings of the joined name, which is how
 * run-together names such as `washingline` or `shopfront` are caught.
 */
const RULES = [
  {
    category: 'props',
    exact: ['cart', 'table', 'chair', 'bench', 'sack', 'chest', 'torch', 'cage', 'pen', 'plow'],
    like: [
      'stall',
      'container',
      'washingline',
      'clothsline',
      'clothesline',
      'animalfeeder',
      'farmanimal',
      'campfire',
      'crate',
      'barrel',
      'furniture',
      'decoration',
      'debris',
      'rubble',
      'bones',
      'bucket',
      'ladder',
      'banner',
      'gallows',
      'stocks',
      'anvil',
      'woodpile',
      'wheelbarrow',
      'beehive',
      'totem',
      'firepit',
      'laundry',
      'supplies',
      'fungus',
      'mushroom',
      'tanningpool',
    ],
  },
  {
    category: 'trees',
    exact: ['tree', 'oak', 'elm', 'pine', 'fern', 'moss', 'crop', 'bush', 'reed', 'vine'],
    like: [
      'forest',
      'larch',
      'birch',
      'poplar',
      'cypress',
      'cedar',
      'willow',
      'maple',
      'shrub',
      'grass',
      'cactus',
      'plant',
      'garden',
      'hedge',
      'palm',
      'flower',
      'orchard',
      'nature',
      'foliage',
      'jungle',
      'swamp',
      'fruittree',
      'berrybush',
      'grapevine',
    ],
  },
  {
    category: 'mountains',
    exact: ['rock', 'rocks', 'hill', 'hills', 'cliff', 'dune', 'dunes', 'crag', 'chasm'],
    like: ['mountain', 'boulder', 'canyon', 'ravine', 'outcrop', 'cliffside', 'rockformation'],
  },
  {
    category: 'misc',
    exact: [
      'keep',
      'well',
      'inn',
      'camp',
      'hall',
      'hut',
      'barn',
      'mill',
      'dock',
      'pier',
      'gate',
      'wall',
      'walls',
      'tent',
      'ship',
      'boat',
      'tomb',
      'shop',
      'pub',
      'block',
      'icon',
      'map',
      'region',
      'path',
      'road',
      'river',
      'bridge',
      'port',
      'altar',
      'pillar',
      'stairs',
      'statue',
      'arena',
      'prison',
    ],
    like: [
      'building',
      'house',
      'palace',
      'castle',
      'tower',
      'temple',
      'cathedral',
      'church',
      'chapel',
      'mansion',
      'broch',
      'warehouse',
      'storehouse',
      'storefront',
      'shopfront',
      'outbuilding',
      'ruin',
      'mausoleum',
      'gravestone',
      'tombstone',
      'memorial',
      'monument',
      'settlement',
      'hangar',
      'hanger',
      'factory',
      'workshop',
      'smithy',
      'forge',
      'tannery',
      'bakery',
      'granary',
      'brewery',
      'windmill',
      'waterwheel',
      'charcoalkiln',
      'lighthouse',
      'stable',
      'barrack',
      'library',
      'academy',
      'fortress',
      'fort',
      'watchtower',
      'doorway',
      'entrance',
      'gateway',
      'fence',
      'wallsegment',
      'wallsection',
      'cobblestone',
      'gravel',
      'dirt',
      'border',
      'label',
      'centerpiece',
      'section',
      'segment',
      'caravan',
      'cabin',
      'cottage',
      'villa',
      'manor',
      'lair',
      'shed',
      'harbor',
      'harbour',
      'square',
      'plaza',
      'street',
      'dininghall',
      'necromancy',
      'stonewall',
      'dockfront',
      'wallstatue',
      'roadside',
      'shrine',
      'longship',
      'spaceship',
      'shipreck',
      'shipwreck',
      'boatgroup',
      'tavern',
      'throne',
      'smelter',
      'stockpile',
      'stair',
      'rotunda',
      'market',
      'baker',
      'fountain',
      'kiosk',
      'obelisk',
      'archway',
    ],
  },
];

/**
 * Category for one asset name.
 *
 * Anything unrecognised falls to `props`: a stray crate hiding in the drawer nobody opens is
 * a much smaller problem than a washing line sitting among the mountains.
 */
export function classify(name) {
  const ws = words(name);
  const set = new Set(ws);
  const joined = ws.join('');

  for (const rule of RULES) {
    if (rule.exact.some(w => set.has(w))) return rule.category;
    if (rule.like.some(w => joined.includes(w))) return rule.category;
  }
  return 'props';
}
