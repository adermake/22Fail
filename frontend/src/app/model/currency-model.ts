export interface Currency {
  copper: number;
  silver: number;
  gold: number;
  platinum: number;
}

// Weight per coin in kg (standard D&D: 50 coins = 1 pound ≈ 0.45kg, so ~0.009kg per coin)
export const COIN_WEIGHT = 0.009;