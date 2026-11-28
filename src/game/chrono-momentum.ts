import type { ChronoMomentumState, ChronoMomentumTier } from './types.ts';

export const MOMENTUM_STREAK_DURATION_SEC = 7.0;
export const WEAKPOINT_BREAK_DURATION_SEC = 4.5;
export const WEAKPOINT_DAMAGE_MULT = 1.2;

export interface ChronoMomentumTierSpec {
  tier: ChronoMomentumTier;
  minStreak: number;
  multiplier: number;
  damageMult: number;
  styleBonusMult: number;
  accentHex: number;
  accentCss: string;
  labelEn: string;
  labelVi: string;
}

export const MOMENTUM_TIER_SPECS: Record<ChronoMomentumTier, ChronoMomentumTierSpec> = {
  0: {
    tier: 0,
    minStreak: 0,
    multiplier: 1.0,
    damageMult: 1.0,
    styleBonusMult: 1.0,
    accentHex: 0x38bdf8,
    accentCss: '#38bdf8',
    labelEn: 'BASE ×1.0',
    labelVi: 'CƠ BẢN ×1.0',
  },
  1: {
    tier: 1,
    minStreak: 2,
    multiplier: 1.25,
    damageMult: 1.08,
    styleBonusMult: 1.15,
    accentHex: 0x22d3ee,
    accentCss: '#22d3ee',
    labelEn: 'SURGE ×1.25',
    labelVi: 'XUNG KÍCH ×1.25',
  },
  2: {
    tier: 2,
    minStreak: 4,
    multiplier: 1.5,
    damageMult: 1.16,
    styleBonusMult: 1.3,
    accentHex: 0xa78bfa,
    accentCss: '#c4b5fd',
    labelEn: 'APEX ×1.5',
    labelVi: 'ĐỈNH CAO ×1.5',
  },
  3: {
    tier: 3,
    minStreak: 6,
    multiplier: 2.0,
    damageMult: 1.25,
    styleBonusMult: 1.5,
    accentHex: 0xfbbf24,
    accentCss: '#fde047',
    labelEn: 'SINGULARITY ×2.0',
    labelVi: 'KỲ DỊ ×2.0',
  },
};

export function createInitialChronoMomentumState(): ChronoMomentumState {
  return {
    streak: 0,
    tier: 0,
    multiplier: 1.0,
    streakTimer: 0,
    weakpointTimer: 0,
    peakStreak: 0,
    totalBreaks: 0,
    bonusFragmentsAwarded: 0,
  };
}

export function resolveMomentumTier(streak: number): ChronoMomentumTier {
  if (streak >= 6) return 3;
  if (streak >= 4) return 2;
  if (streak >= 2) return 1;
  return 0;
}

export function getChronoMomentumModifiers(state: ChronoMomentumState | undefined): {
  damageMult: number;
  styleBonusMult: number;
  weakpointActive: boolean;
  tierSpec: ChronoMomentumTierSpec;
} {
  if (!state) {
    return {
      damageMult: 1.0,
      styleBonusMult: 1.0,
      weakpointActive: false,
      tierSpec: MOMENTUM_TIER_SPECS[0],
    };
  }
  const tierSpec = MOMENTUM_TIER_SPECS[state.tier] ?? MOMENTUM_TIER_SPECS[0];
  const weakpointActive = state.weakpointTimer > 0;
  const damageMult = tierSpec.damageMult * (weakpointActive ? WEAKPOINT_DAMAGE_MULT : 1.0);
  return {
    damageMult,
    styleBonusMult: tierSpec.styleBonusMult,
    weakpointActive,
    tierSpec,
  };
}

export function triggerWeakpointBreakWindow(
  state: ChronoMomentumState,
  durationSec = WEAKPOINT_BREAK_DURATION_SEC
): { tierUp: boolean; newTier: ChronoMomentumTier; newlyOpened: boolean } {
  const newlyOpened = state.weakpointTimer <= 0.1;
  state.weakpointTimer = Math.max(state.weakpointTimer, durationSec);
  state.totalBreaks += 1;
  const streakRes = registerMomentumStreakEvent(state, 1);
  return {
    tierUp: streakRes.tierUp,
    newTier: streakRes.newTier,
    newlyOpened,
  };
}

export function registerMomentumStreakEvent(
  state: ChronoMomentumState,
  increment = 1
): { tierUp: boolean; newTier: ChronoMomentumTier; awardBonusFragment: boolean } {
  if (increment <= 0) {
    return { tierUp: false, newTier: state.tier, awardBonusFragment: false };
  }
  const prevTier = state.tier;
  state.streak += increment;
  if (state.streak > state.peakStreak) {
    state.peakStreak = state.streak;
  }
  state.streakTimer = MOMENTUM_STREAK_DURATION_SEC;
  state.tier = resolveMomentumTier(state.streak);
  state.multiplier = MOMENTUM_TIER_SPECS[state.tier].multiplier;

  const tierUp = state.tier > prevTier;
  // Award 1 bonus Memory Fragment upon first reaching Tier 2 (×1.5) or Tier 3 (×2.0) in a streak cycle
  const awardBonusFragment = tierUp && state.tier >= 2;
  if (awardBonusFragment) {
    state.bonusFragmentsAwarded += 1;
  }
  return { tierUp, newTier: state.tier, awardBonusFragment };
}

export function tickChronoMomentumState(state: ChronoMomentumState, dt: number): void {
  if (dt <= 0) return;

  if (state.weakpointTimer > 0) {
    state.weakpointTimer = Math.max(0, state.weakpointTimer - dt);
  }

  if (state.streakTimer > 0) {
    state.streakTimer = Math.max(0, state.streakTimer - dt);
    if (state.streakTimer <= 0) {
      state.streak = 0;
      state.tier = 0;
      state.multiplier = 1.0;
    }
  }
}
