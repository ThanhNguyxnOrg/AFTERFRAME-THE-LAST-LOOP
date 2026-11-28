import type {
  BossGauntletState,
  BossId,
  CampaignChapterId,
  ChronoOverdriveState,
  GauntletStageSpec,
} from './types.ts';

// ============================================================================
// CHRONO STASIS OVERDRIVE — PURE DETERMINISTIC TUNING & STATE MACHINE
// ============================================================================

export const OVERDRIVE_MAX_CHARGE = 100;
export const OVERDRIVE_DURATION_SEC = 4.5;
export const OVERDRIVE_ENEMY_TIME_SCALE = 0.32;
export const OVERDRIVE_PLAYER_SPEED_MULT = 1.25;
export const OVERDRIVE_DAMAGE_MULT = 1.3;
export const OVERDRIVE_STAGGER_MULT = 1.35;

export const OVERDRIVE_CHARGE_GAINS = {
  lightHit: 6,
  heavyHit: 12,
  parry: 24,
  perfectDodge: 18,
  convergence: 22,
  enemyDefeat: 16,
  riftSeal: 25,
} as const;

export interface OverdriveTimeScales {
  enemyTimeScale: number;
  playerSpeedMult: number;
  damageMult: number;
  staggerMult: number;
  heatLockZero: boolean;
}

export function createInitialChronoOverdriveState(
  initialCharge = 25
): ChronoOverdriveState {
  const clamped = Math.max(
    0,
    Math.min(OVERDRIVE_MAX_CHARGE, Math.round(Number.isFinite(initialCharge) ? initialCharge : 0))
  );
  return {
    charge: clamped,
    maxCharge: OVERDRIVE_MAX_CHARGE,
    active: false,
    remainingTimer: 0,
    maxDuration: OVERDRIVE_DURATION_SEC,
    activationCount: 0,
    statusMessage:
      clamped >= OVERDRIVE_MAX_CHARGE
        ? 'CHRONO OVERDRIVE READY [5]'
        : `OVERDRIVE CHARGING ${clamped}%`,
  };
}

export function addOverdriveCharge(
  state: ChronoOverdriveState,
  amount: number
): ChronoOverdriveState {
  if (state.active || !Number.isFinite(amount) || amount <= 0) {
    return state;
  }
  const nextCharge = Math.min(
    state.maxCharge,
    Math.max(0, Number((state.charge + amount).toFixed(2)))
  );
  return {
    ...state,
    charge: nextCharge,
    statusMessage:
      nextCharge >= state.maxCharge
        ? 'CHRONO OVERDRIVE READY [5]'
        : `OVERDRIVE CHARGING ${Math.floor(nextCharge)}%`,
  };
}

export function canActivateChronoOverdrive(
  state: ChronoOverdriveState | null | undefined,
  playerDead: boolean
): boolean {
  if (!state || playerDead || state.active) return false;
  return state.charge >= state.maxCharge;
}

export function activateChronoOverdrive(
  state: ChronoOverdriveState,
  playerDead = false
): { state: ChronoOverdriveState; activated: boolean } {
  if (!canActivateChronoOverdrive(state, playerDead)) {
    return { state, activated: false };
  }
  return {
    activated: true,
    state: {
      ...state,
      charge: 0,
      active: true,
      remainingTimer: state.maxDuration,
      activationCount: state.activationCount + 1,
      statusMessage: 'CHRONO OVERDRIVE · TIME DILATED',
    },
  };
}

export function tickChronoOverdrive(
  state: ChronoOverdriveState,
  dt: number
): { state: ChronoOverdriveState; justEnded: boolean } {
  if (!state.active || !Number.isFinite(dt) || dt <= 0) {
    return { state, justEnded: false };
  }
  const nextRemaining = Math.max(0, state.remainingTimer - dt);
  if (nextRemaining <= 0) {
    return {
      justEnded: true,
      state: {
        ...state,
        active: false,
        remainingTimer: 0,
        statusMessage: 'OVERDRIVE CHARGING 0%',
      },
    };
  }
  return {
    justEnded: false,
    state: {
      ...state,
      remainingTimer: nextRemaining,
      statusMessage: `CHRONO OVERDRIVE · ${nextRemaining.toFixed(1)}s`,
    },
  };
}

export function getOverdriveTimeScales(
  state: ChronoOverdriveState | null | undefined
): OverdriveTimeScales {
  if (!state || !state.active) {
    return {
      enemyTimeScale: 1,
      playerSpeedMult: 1,
      damageMult: 1,
      staggerMult: 1,
      heatLockZero: false,
    };
  }
  return {
    enemyTimeScale: OVERDRIVE_ENEMY_TIME_SCALE,
    playerSpeedMult: OVERDRIVE_PLAYER_SPEED_MULT,
    damageMult: OVERDRIVE_DAMAGE_MULT,
    staggerMult: OVERDRIVE_STAGGER_MULT,
    heatLockZero: true,
  };
}

// ============================================================================
// SOVEREIGN BOSS GAUNTLET (5-BOSS SEQUENTIAL RUSH)
// ============================================================================

export const GAUNTLET_REFIT_REWARDS = {
  integrityHeal: 35,
  fluxGain: 50,
  overdriveCharge: 40,
  memoryFragments: 2,
} as const;

export const BOSS_GAUNTLET_STAGES: readonly GauntletStageSpec[] = [
  {
    index: 0,
    bossId: 'helix-04',
    chapter: 'chapter_1_helix',
    shortCode: 'I',
    bossName: 'HELIX-04',
    label: 'TRIAL I · MARSHAL HELIX-04',
    sectorLabel: 'CONTAINMENT CORE',
  },
  {
    index: 1,
    bossId: 'the-choir',
    chapter: 'chapter_2_choir',
    shortCode: 'II',
    bossName: 'THE CHOIR',
    label: 'TRIAL II · THE CHOIR',
    sectorLabel: 'HYDROPONIC RING',
  },
  {
    index: 2,
    bossId: 'the-curator',
    chapter: 'chapter_3_curator',
    shortCode: 'III',
    bossName: 'THE CURATOR',
    label: 'TRIAL III · THE CURATOR',
    sectorLabel: 'DEEP MEMORY VAULTS',
  },
  {
    index: 3,
    bossId: 'matron-v',
    chapter: 'chapter_4_matron',
    shortCode: 'IV',
    bossName: 'MATRON-V',
    label: 'TRIAL IV · MATRON-V',
    sectorLabel: 'SURGICAL QUARANTINE',
  },
  {
    index: 4,
    bossId: 'warden-prime',
    chapter: 'chapter_5_loom',
    shortCode: 'V',
    bossName: 'WARDEN PRIME',
    label: 'TRIAL V · WARDEN PRIME',
    sectorLabel: 'CHRONICLE LOOM CORE',
  },
];

export function getGauntletStageSpec(stageIndex: number): GauntletStageSpec {
  const clamped = Math.max(0, Math.min(BOSS_GAUNTLET_STAGES.length - 1, Math.floor(stageIndex)));
  return BOSS_GAUNTLET_STAGES[clamped];
}

export function createInitialBossGauntletState(
  bestClearTimeSec: number | null = null,
  totalGauntletClears = 0
): BossGauntletState {
  const first = BOSS_GAUNTLET_STAGES[0];
  return {
    active: true,
    stageIndex: 0,
    totalStages: BOSS_GAUNTLET_STAGES.length,
    currentBossId: first.bossId,
    currentChapter: first.chapter,
    currentStageLabel: first.label,
    defeatedBossIds: [],
    stageElapsedTimes: [],
    totalElapsedTime: 0,
    stageStartTime: 0,
    refitBannerTimer: 0,
    refitBannerText: '',
    completed: false,
    bestClearTimeSec:
      typeof bestClearTimeSec === 'number' && Number.isFinite(bestClearTimeSec) && bestClearTimeSec > 0
        ? bestClearTimeSec
        : null,
    totalGauntletClears: Math.max(0, Math.floor(totalGauntletClears || 0)),
  };
}

export function advanceBossGauntletStage(
  state: BossGauntletState,
  elapsedTime: number
): {
  state: BossGauntletState;
  completedAll: boolean;
  nextStage: GauntletStageSpec | null;
  refitRewards: typeof GAUNTLET_REFIT_REWARDS;
} {
  const safeElapsed = Math.max(state.stageStartTime, Number.isFinite(elapsedTime) ? elapsedTime : 0);
  const splitSec = Number(Math.max(0, safeElapsed - state.stageStartTime).toFixed(2));
  const currentSpec = getGauntletStageSpec(state.stageIndex);
  const defeatedBossIds: BossId[] = state.defeatedBossIds.includes(currentSpec.bossId)
    ? [...state.defeatedBossIds]
    : [...state.defeatedBossIds, currentSpec.bossId];
  const stageElapsedTimes = [...state.stageElapsedTimes, splitSec];
  const nextIndex = state.stageIndex + 1;

  if (nextIndex >= BOSS_GAUNTLET_STAGES.length) {
    const totalClearTime = Number(safeElapsed.toFixed(2));
    const bestClearTimeSec =
      state.bestClearTimeSec === null
        ? totalClearTime
        : Math.min(state.bestClearTimeSec, totalClearTime);
    return {
      completedAll: true,
      nextStage: null,
      refitRewards: GAUNTLET_REFIT_REWARDS,
      state: {
        ...state,
        active: true,
        defeatedBossIds,
        stageElapsedTimes,
        totalElapsedTime: totalClearTime,
        completed: true,
        bestClearTimeSec,
        totalGauntletClears: state.totalGauntletClears + 1,
        refitBannerTimer: 4.5,
        refitBannerText: 'SOVEREIGN GAUNTLET CONQUERED · ALL 5 WARDENS DISMANTLED',
      },
    };
  }

  const nextSpec = getGauntletStageSpec(nextIndex);
  return {
    completedAll: false,
    nextStage: nextSpec,
    refitRewards: GAUNTLET_REFIT_REWARDS,
    state: {
      ...state,
      active: true,
      stageIndex: nextIndex,
      currentBossId: nextSpec.bossId,
      currentChapter: nextSpec.chapter,
      currentStageLabel: nextSpec.label,
      defeatedBossIds,
      stageElapsedTimes,
      totalElapsedTime: safeElapsed,
      stageStartTime: safeElapsed,
      completed: false,
      refitBannerTimer: 3.6,
      refitBannerText: `FIELD REFIT (+35 INT · +50 FLUX · +40% OVERDRIVE) → ${nextSpec.label}`,
    },
  };
}

export function formatGauntletClock(seconds: number): string {
  const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  const tenths = Math.floor((safe - Math.floor(safe)) * 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
}
