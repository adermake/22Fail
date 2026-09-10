/**
 * Sorting the bought asset packs into symbol categories.
 *
 * This is a build-time script, but it decides where 1200 icons end up, and its failures are
 * silent — a misfiled asset just quietly sits in the wrong tab. Two bugs got through before
 * this existed, both of them invisible without a test:
 *
 *  - `\b` does not fire before `_`, so `/inn\b/` never matched `half-timber_Inn_1` and every
 *    inn was filed as clutter. The same silently broke rock, cart, camp, keep, well and pen.
 *  - The packs also number variants without a separator (`medieval_barn1`), so the tokeniser
 *    saw `barn1` and matched nothing — which mis-filed most of the largest pack.
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error — plain ESM build script, no type declarations
import { classify, words } from '../../../tools/iso-classify.mjs';

const cls = classify as (name: string) => string;
const tok = words as (name: string) => string[];

describe('Asset-Namen zerlegen', () => {
  it('trennt an Unterstrichen, camelCase und angehängten Ziffern', () => {
    expect(tok('CityOfTheDead_GnarledTree_1')).toEqual([
      'city',
      'of',
      'the',
      'dead',
      'gnarled',
      'tree',
      '1',
    ]);
    // The separator-less numbering that broke the largest pack.
    expect(tok('medieval_barn1')).toEqual(['medieval', 'barn', '1']);
  });
});

describe('Einsortieren der Packs', () => {
  it('erkennt Gebäude, auch mit angehängter Nummer', () => {
    for (const n of ['medieval_barn1', 'medieval_house7_iso3', 'half-timber_Inn_1', 'elven_rotunda']) {
      expect(cls(n)).toBe('misc');
    }
  });

  it('lässt kurze Wörter nicht in längeren zünden', () => {
    // `table` inside `stables` once turned the stables into furniture.
    expect(cls('Dwarven_stables')).toBe('misc');
    expect(cls('IndustrialEra_table1')).toBe('props');
  });

  it('erkennt Bewuchs', () => {
    for (const n of ['EuropeanNature_birch_4', 'Desert_tree_2', 'Region_Forest_5', 'half-timber_fruittree_1']) {
      expect(cls(n)).toBe('trees');
    }
  });

  it('erkennt Gelände', () => {
    for (const n of ['cliff_section_10', 'Region_Hills_2', 'Desert_rock_1', 'chasm_1']) {
      expect(cls(n)).toBe('mountains');
    }
  });

  it('schiebt Kleinkram in die Requisiten', () => {
    for (const n of [
      'Marketsquare_stall_4',
      'Marketsquare_washingline_2',
      'Marketsquare_Animalfeeder_1',
      'american_colonial_woodpile_1',
    ]) {
      expect(cls(n)).toBe('props');
    }
  });

  it('legt Unbekanntes in die Requisiten, nicht zwischen die Berge', () => {
    // A stray crate in the drawer nobody opens beats a washing line among the mountains.
    expect(cls('völlig_unbekanntes_ding_1')).toBe('props');
  });

  it('unterscheidet Straße von Baum', () => {
    // `street` contains `tree`; that is why short words are matched whole, not as substrings.
    expect(cls('IndustrialEra_street_1')).toBe('misc');
  });
});
