import type { PlayerState } from './types.ts';

export type AdrenalineTier = 0 | 1 | 2 | 3 | 4 | 5;

export interface AdrenalineModifierSpec {
  readonly tier: AdrenalineTier;
  readonly label: string;
  readonly perkLabel: string;
  readonly fluxRegenMult: number;
  readonly staggerMult: number;
  readonly damageMult: number;
  readonly coolRateMult: number;
  readonly siphonOnKillHp: number;
}

export const ADRENALINE_MAX_SCORE = 5.95;
export const ADRENALINE_GRACE_DURATION = 7.5;
export const ADRENALINE_DECAY_RATE_PER_SEC = 0.32;

export const ADRENALINE_GAINS = {
  parry: 1.0,
  chronoSlip: 0.85,
  convergence: 0.95,
  enemyKo: 0.65,
  bossPhaseBreak: 1.15,
  activeVent: 0.75,
  lightHit: 0.12,
  heavyHit: 0.22,
  damageTakenPenalty: -1.5,
} as const;

export const ADRENALINE_TIERS: readonly AdrenalineModifierSpec[] = [
  {
    tier: 0,
    label: 'SYNC LV 0',
    perkLabel: 'BASE CALIBRATION',
    fluxRegenMult: 1.0,
    staggerMult: 1.0,
    damageMult: 1.0,
    coolRateMult: 1.0,
    siphonOnKillHp: 0,
  },
  {
    tier: 1,
    label: 'SYNC LV 1',
    perkLabel: 'FLUX +15%',
    fluxRegenMult: 1.15,
    staggerMult: 1.0,
    damageMult: 1.0,
    coolRateMult: 1.0,
    siphonOnKillHp: 0,
  },
  {
    tier: 2,
    label: 'SYNC LV 2',
    perkLabel: 'STAGGER +12%',
    fluxRegenMult: 1.2,
    staggerMult: 1.12,
    damageMult: 1.0,
    coolRateMult: 1.1,
    siphonOnKillHp: 0,
  },
  {
    tier: 3,
    label: 'SYNC LV 3',
    perkLabel: 'COOLING +25% · DMG +8%',
    fluxRegenMult: 1.25,
    staggerMult: 1.15,
    damageMult: 1.08,
    coolRateMult: 1.25,
    siphonOnKillHp: 0,
  },
  {
    tier: 4,
    label: 'SYNC LV 4',
    perkLabel: 'KO SIPHON +6HP',
    fluxRegenMult: 1.28,
    staggerMult: 1.18,
    damageMult: 1.12,
    coolRateMult: 1.32,
    siphonOnKillHp: 6,
  },
  {
    tier: 5,
    label: 'OVERDRIVE LV 5',
    perkLabel: 'MAX +18% DMG · +8HP KO',
    fluxRegenMult: 1.35,
    staggerMult: 1.25,
    damageMult: 1.18,
    coolRateMult: 1.4,
    siphonOnKillHp: 8,
  },
] as const;

export const ACTIVE_VENT_CONFIG = {
  windowStart: 0.36,
  windowEnd: 0.68,
  empoweredShotsGranted: 2,
  empoweredDamageMult: 1.25,
  empoweredStaggerMult: 1.15,
  fluxBonus: 12,
} as const;

export function getAdrenalineTier(score: number | undefined): AdrenalineTier {
  if (typeof score !== 'number' || !Number.isFinite(score) || score <= 0) return 0;
  const clamped = Math.min(5, Math.floor(score));
  return clamped as AdrenalineTier;
}

export function getAdrenalineModifiers(score: number | undefined): AdrenalineModifierSpec {
  return ADRENALINE_TIERS[getAdrenalineTier(score)];
}

export interface AdrenalineChangeResult {
  prevTier: AdrenalineTier;
  nextTier: AdrenalineTier;
  tierDelta: number;
}

export function applyAdrenalineDelta(
  player: PlayerState,
  delta: number,
  refreshGrace = delta > 0
): AdrenalineChangeResult {
  const prevScore = typeof player.adrenalineScore === 'number' ? player.adrenalineScore : 0;
  const prevTier = getAdrenalineTier(prevScore);
  const nextScore = Math.max(0, Math.min(ADRENALINE_MAX_SCORE, prevScore + delta));
  player.adrenalineScore = nextScore;
  if (refreshGrace && delta > 0) {
    player.adrenalineDecayGraceTimer = ADRENALINE_GRACE_DURATION;
  } else if (nextScore <= 0) {
    player.adrenalineDecayGraceTimer = 0;
  }
  const nextTier = getAdrenalineTier(nextScore);
  return {
    prevTier,
    nextTier,
    tierDelta: nextTier - prevTier,
  };
}

export function tickAdrenalineDecay(
  player: PlayerState,
  dt: number,
  hasActiveHostiles: boolean
): AdrenalineChangeResult {
  const score = typeof player.adrenalineScore === 'number' ? player.adrenalineScore : 0;
  const prevTier = getAdrenalineTier(score);
  if (dt <= 0 || score <= 0) {
    return { prevTier, nextTier: prevTier, tierDelta: 0 };
  }

  const grace = Math.max(0, (player.adrenalineDecayGraceTimer ?? 0) - dt);
  player.adrenalineDecayGraceTimer = grace;

  // Never decay outside active combat so puzzle solving does not punish players
  if (!hasActiveHostiles || grace > 0) {
    return { prevTier, nextTier: prevTier, tierDelta: 0 };
  }

  const nextScore = Math.max(0, score - ADRENALINE_DECAY_RATE_PER_SEC * dt);
  player.adrenalineScore = nextScore;
  const nextTier = getAdrenalineTier(nextScore);
  return {
    prevTier,
    nextTier,
    tierDelta: nextTier - prevTier,
  };
}

export interface ActiveVentTimingResult {
  progress: number;
  inWindow: boolean;
  zone: 'early' | 'sweet_spot' | 'late';
}

export function evaluateActiveVentTiming(
  overheatTimer: number,
  lockoutDuration: number
): ActiveVentTimingResult {
  const safeLockout = Math.max(0.1, lockoutDuration);
  const progress = Math.max(0, Math.min(1, 1 - overheatTimer / safeLockout));
  if (progress < ACTIVE_VENT_CONFIG.windowStart) {
    return { progress, inWindow: false, zone: 'early' };
  }
  if (progress > ACTIVE_VENT_CONFIG.windowEnd) {
    return { progress, inWindow: false, zone: 'late' };
  }
  return { progress, inWindow: true, zone: 'sweet_spot' };
}
