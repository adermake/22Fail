import { describe, expect, it } from 'vitest';
import {
  breakInscriptionPatches, bruchprobeBonus, needsBruchprobe, resolveBruchprobe,
} from './spell-break.util';
import { SpellMedium } from './spell-medium.util';

describe('Bruchprobe', () => {
  it('is only rolled once the rest falls below 10', () => {
    expect(needsBruchprobe(10)).toBe(false);
    expect(needsBruchprobe(9.9)).toBe(true);
    expect(needsBruchprobe(0)).toBe(true);
  });

  it('gives a helpful (negative) bonus while the medium is healthy', () => {
    // Lower is better, so a negative bonus is the good one.
    expect(bruchprobeBonus(9)).toBe(-4);
    expect(bruchprobeBonus(5)).toBe(0);
    expect(bruchprobeBonus(1)).toBe(4);
    expect(bruchprobeBonus(0)).toBe(5);
  });

  it('does not keep rewarding Haltbarkeit below zero', () => {
    expect(bruchprobeBonus(-7)).toBe(5);
  });

  it('holds at 10 and breaks above it', () => {
    expect(resolveBruchprobe(5, 10).broken).toBe(false);   // 10 + 0 = 10
    expect(resolveBruchprobe(5, 11).broken).toBe(true);    // 11 + 0 = 11
  });

  it('lets a nearly-full medium survive a bad roll', () => {
    const probe = resolveBruchprobe(9, 14);               // 14 − 4 = 10
    expect(probe.bonus).toBe(-4);
    expect(probe.total).toBe(10);
    expect(probe.broken).toBe(false);
  });

  it('breaks a spent medium on an average roll', () => {
    const probe = resolveBruchprobe(1, 8);                 // 8 + 4 = 12
    expect(probe.total).toBe(12);
    expect(probe.broken).toBe(true);
  });
});

describe('Bruch-Folgen', () => {
  it('burns the inscription and loses the carrier', () => {
    const medium = {
      path: 'inventory.3.embeddedSpells.1',
      itemPath: 'inventory.3',
    } as SpellMedium;

    expect(breakInscriptionPatches(medium)).toEqual([
      { path: 'inventory.3.embeddedSpells.1.binding.broken', value: true },
      { path: 'inventory.3.lost', value: true },
    ]);
  });
});
