/** Cast-level factor for mana cost and stat prerequisites: 100 / (Cast + 100) */
export function castFactor(castLevel: number): number {
  const cl = Math.max(0, castLevel || 0);
  return 100 / (cl + 100);
}

export function castFactorPercent(castLevel: number): number {
  return Math.round(castFactor(castLevel) * 1000) / 10;
}

/** Effective stat requirement after cast-level adjustment */
export function effectiveStatRequirement(baseReq: number, castLevel: number): number {
  if (baseReq <= 0) return 0;
  return Math.round(baseReq * castFactor(castLevel) * 100) / 100;
}

/** Minimum cast level so `currentStat` meets `baseReq` */
export function castLevelForStatRequirement(baseReq: number, currentStat: number): number {
  if (baseReq <= 0 || currentStat >= baseReq) return 0;
  if (currentStat <= 0) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.ceil((100 * baseReq) / currentStat - 100));
}

/** Mana: base × castFactor × skalierung */
export function scaledManaCost(baseMana: number, castLevel: number, skalierung: number): number {
  return Math.round(baseMana * castFactor(castLevel) * skalierung * 100) / 100;
}

/** Effektivität / Haltbarkeit: base × skalierung */
export function scaledBySkalierung(base: number, skalierung: number): number {
  return Math.round(base * skalierung * 100) / 100;
}
