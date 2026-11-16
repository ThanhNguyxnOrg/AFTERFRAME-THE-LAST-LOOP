import type { PlayerState, RunSummary } from './types.ts';

export type CombatFlowKind =
  | 'none'
  | 'riposte'
  | 'chrono_slip'
  | 'relay_momentum'
  | 'quick_draw';

export type CombatRankGrade = 'S+' | 'S' | 'A' | 'B' | 'C';

export interface CombatRankEvaluation {
  grade: CombatRankGrade;
  score: number;
  hitless: boolean;
  summaryTag: string;
}

export const COMBAT_FLOW_CONFIG = {
  riposteDuration: 1.75,
  riposteWindupMult: 0.72,
  riposteDamageMult: 1.24,
  riposteStaggerMult: 1.3,

  chronoSlipDuration: 1.65,
  chronoSlipWindupMult: 0.78,
  chronoSlipDamageMult: 1.18,
  chronoSlipStaggerMult: 1.22,
  chronoSlipMoveSpeedMult: 1.14,
  chronoSlipFluxGain: 18,
  chronoSlipInvulnExtension: 0.24,

  relayMomentumDuration: 2.0,
  relayWindupMult: 0.82,
  relayStaggerMult: 1.2,
  relayMoveSpeedMult: 1.18,

  quickDrawDuration: 1.4,
  quickDrawWindupMult: 0.85,
  quickDrawStaggerMult: 1.12,

  dodgeStrikeCancelRemaining: 0.075,
  heavyRecoveryCancelRemaining: 0.13,
  parryRecoveryCancelRemaining: 0.11,
  rangedRecoveryCancelRemaining: 0.08,
} as const;

export interface ConsumedCombatFlowMultipliers {
  windupMult: number;
  damageMult: number;
  staggerMult: number;
  flowKind: CombatFlowKind;
  triggeredRiposte: boolean;
}

export interface CombatFlowHudSummary {
  active: boolean;
  kind: CombatFlowKind;
  label: string;
  riposteRemaining: number;
  chronoSlipRemaining: number;
  relayMomentumRemaining: number;
  quickDrawRemaining: number;
}

export function tickPlayerCombatFlowTimers(player: PlayerState, dt: number): void {
  if (dt <= 0) return;
  player.riposteTimer = Math.max(0, (player.riposteTimer ?? 0) - dt);
  player.chronoSlipTimer = Math.max(0, (player.chronoSlipTimer ?? 0) - dt);
  player.relayMomentumTimer = Math.max(0, (player.relayMomentumTimer ?? 0) - dt);
  player.quickDrawTimer = Math.max(0, (player.quickDrawTimer ?? 0) - dt);
}

export function grantRiposteWindow(player: PlayerState): void {
  player.riposteTimer = COMBAT_FLOW_CONFIG.riposteDuration;
}

export function grantChronoSlipWindow(player: PlayerState): void {
  player.chronoSlipTimer = COMBAT_FLOW_CONFIG.chronoSlipDuration;
}

export function grantRelayMomentumWindow(player: PlayerState): void {
  player.relayMomentumTimer = COMBAT_FLOW_CONFIG.relayMomentumDuration;
}

export function grantQuickDrawWindow(player: PlayerState): void {
  player.quickDrawTimer = COMBAT_FLOW_CONFIG.quickDrawDuration;
}

export function clearActiveStrikeFlow(player: PlayerState): void {
  player.activeStrikeFlowDamageMult = 1;
  player.activeStrikeFlowStaggerMult = 1;
  player.activeStrikeFlowKind = 'none';
}

/**
 * Determines whether the trailing end of an evasion, recovery, or ranged shot can
 * seamlessly chain into an offensive follow-up or weapon swap without waiting for full idle.
 */
export function canCancelActionTailForCombatFlow(
  player: PlayerState,
  isRangedWeapon: boolean,
  intent: 'light' | 'heavy' | 'weapon_switch'
): boolean {
  const remaining = player.stateTimer;

  if (intent === 'weapon_switch') {
    if (
      player.actionState === 'heavy_recovery' &&
      remaining <= COMBAT_FLOW_CONFIG.heavyRecoveryCancelRemaining
    ) {
      return true;
    }
    if (
      player.actionState === 'parry_recovery' &&
      remaining <= COMBAT_FLOW_CONFIG.parryRecoveryCancelRemaining
    ) {
      return true;
    }
    return false;
  }

  if (
    player.actionState === 'dodging' &&
    remaining <= COMBAT_FLOW_CONFIG.dodgeStrikeCancelRemaining
  ) {
    return true;
  }
  if (
    player.actionState === 'heavy_recovery' &&
    remaining <= COMBAT_FLOW_CONFIG.heavyRecoveryCancelRemaining
  ) {
    return true;
  }
  if (
    player.actionState === 'parry_recovery' &&
    remaining <= COMBAT_FLOW_CONFIG.parryRecoveryCancelRemaining
  ) {
    return true;
  }
  if (
    isRangedWeapon &&
    player.actionState === 'light_recovery' &&
    remaining <= COMBAT_FLOW_CONFIG.rangedRecoveryCancelRemaining
  ) {
    return true;
  }

  return false;
}

/**
 * Consumes active flow windows at attack initiation so the resulting swing or projectile
 * inherits faster windup, bonus damage, and bonus posture stagger on impact.
 */
export function consumeAttackFlowMultipliers(
  player: PlayerState
): ConsumedCombatFlowMultipliers {
  const hasRiposte = (player.riposteTimer ?? 0) > 0;
  const hasChronoSlip = (player.chronoSlipTimer ?? 0) > 0;
  const hasRelay = (player.relayMomentumTimer ?? 0) > 0;
  const hasQuickDraw = (player.quickDrawTimer ?? 0) > 0;

  let windupMult = 1;
  let damageMult = 1;
  let staggerMult = 1;
  let flowKind: CombatFlowKind = 'none';

  if (hasRiposte) {
    windupMult = Math.min(windupMult, COMBAT_FLOW_CONFIG.riposteWindupMult);
    damageMult *= COMBAT_FLOW_CONFIG.riposteDamageMult;
    staggerMult *= COMBAT_FLOW_CONFIG.riposteStaggerMult;
    flowKind = 'riposte';
    player.riposteTimer = 0;
  }

  if (hasChronoSlip) {
    windupMult = Math.min(windupMult, COMBAT_FLOW_CONFIG.chronoSlipWindupMult);
    damageMult *= COMBAT_FLOW_CONFIG.chronoSlipDamageMult;
    staggerMult *= COMBAT_FLOW_CONFIG.chronoSlipStaggerMult;
    if (flowKind === 'none') {
      flowKind = 'chrono_slip';
    }
    player.chronoSlipTimer = 0;
  }

  if (hasRelay) {
    windupMult = Math.min(windupMult, COMBAT_FLOW_CONFIG.relayWindupMult);
    staggerMult *= COMBAT_FLOW_CONFIG.relayStaggerMult;
    if (flowKind === 'none') {
      flowKind = 'relay_momentum';
    }
    player.relayMomentumTimer = 0;
  }

  if (hasQuickDraw) {
    windupMult = Math.min(windupMult, COMBAT_FLOW_CONFIG.quickDrawWindupMult);
    staggerMult *= COMBAT_FLOW_CONFIG.quickDrawStaggerMult;
    if (flowKind === 'none') {
      flowKind = 'quick_draw';
    }
    player.quickDrawTimer = 0;
  }

  player.activeStrikeFlowDamageMult = damageMult;
  player.activeStrikeFlowStaggerMult = staggerMult;
  player.activeStrikeFlowKind = flowKind;

  return {
    windupMult,
    damageMult,
    staggerMult,
    flowKind,
    triggeredRiposte: hasRiposte,
  };
}

export function getCombatFlowMovementSpeedMultiplier(player: PlayerState): number {
  const relayMult =
    (player.relayMomentumTimer ?? 0) > 0 ? COMBAT_FLOW_CONFIG.relayMoveSpeedMult : 1;
  const slipMult =
    (player.chronoSlipTimer ?? 0) > 0 ? COMBAT_FLOW_CONFIG.chronoSlipMoveSpeedMult : 1;
  return Math.max(relayMult, slipMult);
}

export function getCombatFlowHudSummary(player: PlayerState): CombatFlowHudSummary {
  const riposteRemaining = Number(Math.max(0, player.riposteTimer ?? 0).toFixed(2));
  const chronoSlipRemaining = Number(Math.max(0, player.chronoSlipTimer ?? 0).toFixed(2));
  const relayMomentumRemaining = Number(
    Math.max(0, player.relayMomentumTimer ?? 0).toFixed(2)
  );
  const quickDrawRemaining = Number(Math.max(0, player.quickDrawTimer ?? 0).toFixed(2));

  let kind: CombatFlowKind = 'none';
  let label = '';
  if (riposteRemaining > 0) {
    kind = 'riposte';
    label = `RIPOSTE READY · 1.24x COUNTER (${riposteRemaining.toFixed(1)}s)`;
  } else if (chronoSlipRemaining > 0) {
    kind = 'chrono_slip';
    label = `CHRONO SLIP · 1.18x COUNTER (${chronoSlipRemaining.toFixed(1)}s)`;
  } else if (relayMomentumRemaining > 0) {
    kind = 'relay_momentum';
    label = `RELAY SURGE · +20% STAGGER (${relayMomentumRemaining.toFixed(1)}s)`;
  } else if (quickDrawRemaining > 0) {
    kind = 'quick_draw';
    label = `FLOW SWITCH · QUICK-DRAW (${quickDrawRemaining.toFixed(1)}s)`;
  }

  return {
    active: kind !== 'none',
    kind,
    label,
    riposteRemaining,
    chronoSlipRemaining,
    relayMomentumRemaining,
    quickDrawRemaining,
  };
}

/**
 * Computes a deterministic post-run tactical style rank (S+ / S / A / B / C)
 * rewarding clean evasion, timed parries, Echo convergence, and speed.
 */
export function evaluateCombatRank(summary: RunSummary): CombatRankEvaluation {
  const perfectDodges = Math.max(0, summary.perfectDodges ?? 0);
  const parries = Math.max(0, summary.parriesLanded ?? 0);
  const convergences = Math.max(0, summary.convergencesTriggered ?? 0);
  const relays = Math.max(0, summary.relaysUsed ?? 0);
  const vulnerableHits = Math.max(0, summary.vulnerableHits ?? 0);
  const damageTaken = Math.max(0, summary.damageTaken ?? 0);
  const hitless = summary.outcome === 'victory' && damageTaken === 0;

  const tacticalPoints =
    parries * 12 +
    perfectDodges * 10 +
    convergences * 10 +
    relays * 6 +
    Math.min(18, vulnerableHits * 3);

  const speedPoints =
    summary.elapsedTime <= 45
      ? 15
      : summary.elapsedTime <= 90
        ? 10
        : summary.elapsedTime <= 150
          ? 5
          : 0;

  if (summary.outcome !== 'victory') {
    const score = Math.min(65, Math.round(20 + tacticalPoints * 0.6));
    return {
      grade: tacticalPoints >= 30 ? 'B' : 'C',
      score,
      hitless: false,
      summaryTag: summary.outcome === 'defeat' ? 'LOOP TERMINATED' : 'SECTOR IN PROGRESS',
    };
  }

  const integrityBonus = hitless ? 35 : Math.max(0, 20 - Math.floor(damageTaken / 6));
  const rawScore = 40 + integrityBonus + tacticalPoints + speedPoints;
  const score = Math.min(150, Math.max(40, Math.round(rawScore)));

  let grade: CombatRankGrade = 'C';
  if (score >= 120 || (hitless && parries + perfectDodges >= 1)) {
    grade = 'S+';
  } else if (score >= 95) {
    grade = 'S';
  } else if (score >= 72) {
    grade = 'A';
  } else if (score >= 48) {
    grade = 'B';
  }

  let summaryTag = 'LOOP STABILIZED';
  if (hitless && parries + perfectDodges >= 2) {
    summaryTag = 'UNTOUCHED CHRONOMANCER';
  } else if (hitless) {
    summaryTag = 'ZERO-DAMAGE CLEAR';
  } else if (perfectDodges >= 2 && perfectDodges >= parries) {
    summaryTag = 'CHRONO SLIP ACE';
  } else if (parries >= 2) {
    summaryTag = 'AEGIS PARRY MASTER';
  } else if (convergences >= 2) {
    summaryTag = 'ECHO CONVERGENCE ACE';
  }

  return {
    grade,
    score,
    hitless,
    summaryTag,
  };
}

