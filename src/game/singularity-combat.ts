import type { SingularityCombatState } from './types.ts';

export const HIT_COMBO_WINDOW_SEC = 3.8;
export const FLASH_SWAP_WINDOW_SEC = 0.95;
export const FLASH_SWAP_COOLDOWN_SEC = 3.0;
export const FLASH_SWAP_AMP_DURATION_SEC = 3.2;
export const FLASH_SWAP_DAMAGE_BONUS = 0.22;
export const FLASH_SWAP_STAGGER_BONUS = 0.18;
export const FLASH_SWAP_FLUX_REWARD = 12;
export const FLASH_SWAP_STYLE_REWARD = 18;

export const PHANTOM_RIPOSTE_DURATION_SEC = 2.8;
export const PHANTOM_RIPOSTE_DAMAGE_BONUS = 0.30;
export const PHANTOM_RIPOSTE_FLAT_STAGGER = 20;

export const HIT_COMBO_MILESTONES: readonly number[] = [10, 20, 30, 50];

export function createInitialSingularityCombatState(): SingularityCombatState {
  return {
    hitComboCount: 0,
    bestHitCombo: 0,
    hitComboTimer: 0,
    flashSwapWindowTimer: 0,
    flashSwapCooldown: 0,
    flashSwapAmpTimer: 0,
    flashSwapCount: 0,
    phantomRiposteTimer: 0,
    lastMilestoneReached: 0,
    bannerLabel: '',
    bannerTimer: 0,
  };
}

export interface SingularityHitOutcome {
  hitComboCount: number;
  milestoneHit: number | null;
  bonusFlux: number;
  bonusStyle: number;
}

export function registerSingularityHit(
  state: SingularityCombatState,
  hits: number = 1
): SingularityHitOutcome {
  const delta = Math.max(1, Math.floor(hits));
  state.hitComboCount += delta;
  if (state.hitComboCount > state.bestHitCombo) {
    state.bestHitCombo = state.hitComboCount;
  }
  state.hitComboTimer = HIT_COMBO_WINDOW_SEC;
  state.flashSwapWindowTimer = FLASH_SWAP_WINDOW_SEC;

  let milestoneHit: number | null = null;
  let bonusFlux = 0;
  let bonusStyle = 0;

  for (const m of HIT_COMBO_MILESTONES) {
    if (state.hitComboCount >= m && state.lastMilestoneReached < m) {
      state.lastMilestoneReached = m;
      milestoneHit = m;
      bonusFlux = m >= 30 ? 18 : m >= 20 ? 14 : 10;
      bonusStyle = m >= 30 ? 28 : m >= 20 ? 20 : 14;
      state.bannerLabel = `CHRONO CHAIN ×${m}`;
      state.bannerTimer = 1.4;
    }
  }

  return {
    hitComboCount: state.hitComboCount,
    milestoneHit,
    bonusFlux,
    bonusStyle,
  };
}

export interface FlashSwapOutcome {
  triggered: boolean;
  bonusFlux: number;
  bonusStyle: number;
}

export function tryTriggerFlashSwap(state: SingularityCombatState): FlashSwapOutcome {
  if (state.flashSwapWindowTimer <= 0 || state.flashSwapCooldown > 0) {
    return { triggered: false, bonusFlux: 0, bonusStyle: 0 };
  }
  state.flashSwapWindowTimer = 0;
  state.flashSwapCooldown = FLASH_SWAP_COOLDOWN_SEC;
  state.flashSwapAmpTimer = FLASH_SWAP_AMP_DURATION_SEC;
  state.flashSwapCount += 1;
  state.hitComboTimer = Math.max(state.hitComboTimer, HIT_COMBO_WINDOW_SEC);
  state.bannerLabel = 'FLASH SWAP +22%';
  state.bannerTimer = 1.35;

  return {
    triggered: true,
    bonusFlux: FLASH_SWAP_FLUX_REWARD,
    bonusStyle: FLASH_SWAP_STYLE_REWARD,
  };
}

export function armPhantomRiposte(state: SingularityCombatState): void {
  state.phantomRiposteTimer = PHANTOM_RIPOSTE_DURATION_SEC;
  state.hitComboTimer = Math.max(state.hitComboTimer, 3.2);
  state.bannerLabel = 'PHANTOM RIPOSTE +30%';
  state.bannerTimer = 1.35;
}

export interface SingularityStrikeMultipliers {
  damageMult: number;
  staggerMult: number;
  bonusFlatStagger: number;
  consumedFlashSwap: boolean;
  consumedPhantomRiposte: boolean;
}

export function consumeSingularityStrikeMultipliers(
  state: SingularityCombatState,
  isMeleeOrScythe: boolean
): SingularityStrikeMultipliers {
  let damageMult = 1.0;
  let staggerMult = 1.0;
  let bonusFlatStagger = 0;
  let consumedFlashSwap = false;
  let consumedPhantomRiposte = false;

  if (state.flashSwapAmpTimer > 0) {
    damageMult += FLASH_SWAP_DAMAGE_BONUS;
    staggerMult += FLASH_SWAP_STAGGER_BONUS;
    state.flashSwapAmpTimer = 0;
    consumedFlashSwap = true;
  }

  if (isMeleeOrScythe && state.phantomRiposteTimer > 0) {
    damageMult += PHANTOM_RIPOSTE_DAMAGE_BONUS;
    bonusFlatStagger += PHANTOM_RIPOSTE_FLAT_STAGGER;
    state.phantomRiposteTimer = 0;
    consumedPhantomRiposte = true;
  }

  return {
    damageMult,
    staggerMult,
    bonusFlatStagger,
    consumedFlashSwap,
    consumedPhantomRiposte,
  };
}

export function tickSingularityCombat(state: SingularityCombatState, dt: number): void {
  const safeDt = Math.max(0, dt);
  if (state.flashSwapWindowTimer > 0) {
    state.flashSwapWindowTimer = Math.max(0, state.flashSwapWindowTimer - safeDt);
  }
  if (state.flashSwapCooldown > 0) {
    state.flashSwapCooldown = Math.max(0, state.flashSwapCooldown - safeDt);
  }
  if (state.flashSwapAmpTimer > 0) {
    state.flashSwapAmpTimer = Math.max(0, state.flashSwapAmpTimer - safeDt);
  }
  if (state.phantomRiposteTimer > 0) {
    state.phantomRiposteTimer = Math.max(0, state.phantomRiposteTimer - safeDt);
  }
  if (state.bannerTimer > 0) {
    state.bannerTimer = Math.max(0, state.bannerTimer - safeDt);
    if (state.bannerTimer === 0) {
      state.bannerLabel = '';
    }
  }
  if (state.hitComboTimer > 0) {
    state.hitComboTimer = Math.max(0, state.hitComboTimer - safeDt);
    if (state.hitComboTimer === 0) {
      state.hitComboCount = 0;
      state.lastMilestoneReached = 0;
    }
  }
}

export function resetSingularityComboOnDamage(state: SingularityCombatState): void {
  state.hitComboCount = 0;
  state.hitComboTimer = 0;
  state.lastMilestoneReached = 0;
  state.flashSwapWindowTimer = 0;
}
