import type { CombatEvent } from './types.ts';

export type BossTelegraphShaderMode = 'lane' | 'sweep' | 'radial';

export interface BossTelegraphVisualState {
  mode: BossTelegraphShaderMode;
  progress: number;
  locked: boolean;
  primaryHex: number;
  edgeHex: number;
  fillOpacity: number;
  borderOpacity: number;
  chevronSpeed: number;
  sweepFillFrac: number;
  pulseStrength: number;
}

export interface EnemyDeRezTransformState {
  progress: number;
  toppleAngle: number;
  sinkY: number;
  horizontalScale: number;
  verticalScale: number;
  emissiveIntensity: number;
  emissiveHex: number;
  opacityFade: number;
  pulseStrength: number;
}

export type ScreenFlashTone = 'parry' | 'dodge' | 'convergence' | 'finisher' | 'damage';

export interface ScreenFlashSpec {
  tone: ScreenFlashTone;
  hex: string;
  rgba: string;
  durationMs: number;
  maxOpacity: number;
  priority: number;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function computeBossTelegraphVisuals(
  attackType: string | null | undefined,
  rawProgress: number,
  locked: boolean,
  reducedMotion: boolean
): BossTelegraphVisualState {
  const progress = clamp01(rawProgress);
  const mode: BossTelegraphShaderMode =
    attackType === 'vector_ram'
      ? 'lane'
      : attackType === 'helical_sweep'
        ? 'sweep'
        : 'radial';

  const primaryHex = locked ? 0xef4444 : 0xf59e0b;
  const edgeHex = locked ? 0xffffff : 0xef4444;
  const fillOpacity = Math.min(0.92, 0.28 + progress * 0.44 + (locked ? 0.14 : 0));
  const borderOpacity = Math.min(1, 0.65 + progress * 0.35);
  const chevronSpeed = reducedMotion ? 0 : locked ? 4.2 : 2.6;
  const sweepFillFrac = clamp01(0.14 + progress * 0.86);
  const pulseStrength = reducedMotion ? 0 : locked ? 1.0 : 0.45;

  return {
    mode,
    progress,
    locked,
    primaryHex,
    edgeHex,
    fillOpacity,
    borderOpacity,
    chevronSpeed,
    sweepFillFrac,
    pulseStrength,
  };
}

export function computeEnemyDeRezState(
  rawKoProgress: number,
  reducedMotion: boolean
): EnemyDeRezTransformState {
  const progress = clamp01(rawKoProgress);
  const easedCollapse = progress * progress;

  const toppleAngle = progress === 0 ? 0 : -progress * (Math.PI * 0.46);
  const sinkY = progress === 0 ? 0 : -progress * 0.38;
  const horizontalScale = 1 + Math.sin(progress * Math.PI) * 0.22;
  const verticalScale = Math.max(0.12, 1 - easedCollapse * 0.88);
  const pulsePeak = Math.sin(progress * Math.PI);
  const emissiveIntensity = 0.4 + pulsePeak * 2.1;
  const emissiveHex = progress < 0.45 ? 0x22d3ee : 0xf59e0b;
  const opacityFade = clamp01(1 - Math.pow(progress, 1.35));
  const pulseStrength = reducedMotion ? 0 : pulsePeak;

  return {
    progress,
    toppleAngle,
    sinkY,
    horizontalScale,
    verticalScale,
    emissiveIntensity,
    emissiveHex,
    opacityFade,
    pulseStrength,
  };
}

export function computeScreenFlashTint(
  events: readonly CombatEvent[] | null | undefined,
  reducedMotion: boolean
): ScreenFlashSpec | null {
  if (!events || events.length === 0) return null;

  let best: ScreenFlashSpec | null = null;
  const consider = (candidate: ScreenFlashSpec) => {
    if (!best || candidate.priority > best.priority) {
      best = candidate;
    }
  };

  for (let i = 0; i < events.length; i++) {
    switch (events[i].type) {
      case 'chrono_execution_finisher':
        consider({
          tone: 'finisher',
          hex: '#fde047',
          rgba: '253, 224, 71',
          durationMs: 240,
          maxOpacity: 0.42,
          priority: 5,
        });
        break;
      case 'resonance_convergence':
        consider({
          tone: 'convergence',
          hex: '#22d3ee',
          rgba: '34, 211, 238',
          durationMs: 220,
          maxOpacity: 0.38,
          priority: 4,
        });
        break;
      case 'player_parry_success':
      case 'player_riposte_strike':
        consider({
          tone: 'parry',
          hex: '#fbbf24',
          rgba: '251, 191, 36',
          durationMs: 180,
          maxOpacity: 0.34,
          priority: 3,
        });
        break;
      case 'player_perfect_dodge':
        consider({
          tone: 'dodge',
          hex: '#38bdf8',
          rgba: '56, 189, 248',
          durationMs: 160,
          maxOpacity: 0.3,
          priority: 2,
        });
        break;
      case 'player_damaged':
      case 'timed_hazard_damaged_player':
        consider({
          tone: 'damage',
          hex: '#ef4444',
          rgba: '239, 68, 68',
          durationMs: 180,
          maxOpacity: 0.36,
          priority: 1,
        });
        break;
      default:
        break;
    }
  }

  if (!best) return null;
  const spec: ScreenFlashSpec = best;
  if (!reducedMotion) return spec;

  return {
    tone: spec.tone,
    hex: spec.hex,
    rgba: spec.rgba,
    durationMs: Math.min(140, Math.round(spec.durationMs * 0.65)),
    maxOpacity: Math.min(0.14, Number((spec.maxOpacity * 0.36).toFixed(3))),
    priority: spec.priority,
  };
}

export interface ChronoAuraVisualInput {
  adrenalineScore: number;
  riposteActive: boolean;
  chronoSlipActive: boolean;
  kineticSurgeActive: boolean;
  isRecording: boolean;
  reducedMotion: boolean;
  timeSec: number;
}

export interface ChronoAuraVisualState {
  tier: number;
  ringHex: number;
  emissiveIntensity: number;
  spinMultiplier: number;
  groundAuraOpacity: number;
  groundAuraScale: number;
  echoShimmerOpacity: number;
}

export function computeChronoAuraVisuals(
  input: ChronoAuraVisualInput,
  out = {} as ChronoAuraVisualState
): ChronoAuraVisualState {
  const score = Number.isFinite(input.adrenalineScore)
    ? Math.max(0, Math.min(5.95, input.adrenalineScore))
    : 0;
  const tier = Math.min(5, Math.floor(score));
  const wave = input.reducedMotion ? 0 : Math.sin(input.timeSec * 5.2);

  let ringHex = 0x38bdf8;
  if (input.riposteActive || input.chronoSlipActive) {
    ringHex = 0xfef08a;
  } else if (tier >= 4) {
    ringHex = 0xfbbf24;
  } else if (input.kineticSurgeActive) {
    ringHex = 0x34d399;
  } else if (tier === 3) {
    ringHex = 0x67e8f9;
  } else if (input.isRecording) {
    ringHex = 0xf59e0b;
  }

  const boost =
    input.riposteActive || input.chronoSlipActive
      ? 0.65
      : input.kineticSurgeActive
        ? 0.35
        : 0;

  const emissiveIntensity = Math.round((1.25 + tier * 0.24 + boost + wave * 0.12) * 1000) / 1000;
  const spinMultiplier = Math.round((1 + tier * 0.26 + (input.riposteActive || input.chronoSlipActive ? 1.45 : input.kineticSurgeActive ? 0.65 : 0)) * 1000) / 1000;

  const baseAuraOpacity =
    tier > 0 || input.riposteActive || input.chronoSlipActive || input.kineticSurgeActive || input.isRecording
      ? Math.min(0.56, 0.12 + tier * 0.068 + boost * 0.2 + wave * 0.03)
      : 0;
  const groundAuraOpacity = Math.max(0, Math.round(baseAuraOpacity * 1000) / 1000);
  const groundAuraScale = Math.round((0.84 + tier * 0.068 + boost * 0.12 + wave * 0.025) * 1000) / 1000;
  const echoShimmerOpacity = input.reducedMotion
    ? 0.48
    : Math.round((0.46 + Math.sin(input.timeSec * 6.4) * 0.12) * 1000) / 1000;

  out.tier = tier;
  out.ringHex = ringHex;
  out.emissiveIntensity = emissiveIntensity;
  out.spinMultiplier = spinMultiplier;
  out.groundAuraOpacity = groundAuraOpacity;
  out.groundAuraScale = groundAuraScale;
  out.echoShimmerOpacity = echoShimmerOpacity;
  return out;
}

export interface LockOnGroundVisualInput {
  active: boolean;
  isBoss: boolean;
  targetRadius: number;
  isStaggered: boolean;
  isTelegraphing: boolean;
  isResonanceMarked: boolean;
  coreExposed: boolean;
  reducedMotion: boolean;
  timeSec: number;
}

export interface LockOnGroundVisualState {
  visible: boolean;
  outerRadius: number;
  outerHex: number;
  innerHex: number;
  outerOpacity: number;
  innerOpacity: number;
  outerSpinRate: number;
  innerSpinRate: number;
  pulseScale: number;
}

export function computeLockOnGroundVisuals(
  input: LockOnGroundVisualInput,
  out = {} as LockOnGroundVisualState
): LockOnGroundVisualState {
  if (!input.active) {
    out.visible = false;
    out.outerRadius = 1;
    out.outerHex = 0x38bdf8;
    out.innerHex = 0xbae6fd;
    out.outerOpacity = 0;
    out.innerOpacity = 0;
    out.outerSpinRate = 0;
    out.innerSpinRate = 0;
    out.pulseScale = 1;
    return out;
  }

  const radius = Number.isFinite(input.targetRadius) ? Math.max(0.45, input.targetRadius) : 0.7;
  const outerRadius = Math.max(0.78, Math.round(radius * (input.isBoss ? 1.32 : 1.48) * 1000) / 1000);

  let outerHex = 0x38bdf8;
  let innerHex = 0xbae6fd;
  let outerOpacity = 0.72;
  let innerOpacity = 0.22;
  let outerSpinRate = 1.45;
  let innerSpinRate = -1.8;

  if (input.isStaggered || input.coreExposed) {
    outerHex = 0xfbbf24;
    innerHex = 0xfef08a;
    outerOpacity = 0.92;
    innerOpacity = 0.42;
    outerSpinRate = 2.8;
    innerSpinRate = -3.6;
  } else if (input.isTelegraphing) {
    outerHex = 0xef4444;
    innerHex = 0xf59e0b;
    outerOpacity = 0.88;
    innerOpacity = 0.34;
    outerSpinRate = 3.1;
    innerSpinRate = -2.4;
  } else if (input.isResonanceMarked) {
    outerHex = 0x22d3ee;
    innerHex = 0xe0f2fe;
    outerOpacity = 0.86;
    innerOpacity = 0.36;
    outerSpinRate = 2.3;
    innerSpinRate = -2.8;
  }

  const pulseFreq = input.isStaggered || input.isTelegraphing ? 7.5 : 4.0;
  const pulseScale = input.reducedMotion
    ? 1
    : Math.round((1 + Math.sin(input.timeSec * pulseFreq) * 0.055) * 1000) / 1000;

  out.visible = true;
  out.outerRadius = outerRadius;
  out.outerHex = outerHex;
  out.innerHex = innerHex;
  out.outerOpacity = outerOpacity;
  out.innerOpacity = innerOpacity;
  out.outerSpinRate = input.reducedMotion ? 0 : outerSpinRate;
  out.innerSpinRate = input.reducedMotion ? 0 : innerSpinRate;
  out.pulseScale = pulseScale;
  return out;
}

export interface EchoTetherVisualInput {
  distance: number;
  resonancePrimed: boolean;
  relayReady: boolean;
  reducedMotion: boolean;
  timeSec: number;
}

export interface EchoTetherVisualState {
  visible: boolean;
  hex: number;
  thicknessScale: number;
  opacity: number;
}

export function computeEchoTetherVisuals(
  input: EchoTetherVisualInput
): EchoTetherVisualState {
  if (!Number.isFinite(input.distance) || input.distance <= 0.35) {
    return {
      visible: false,
      hex: 0x38bdf8,
      thicknessScale: 1,
      opacity: 0,
    };
  }

  if (input.resonancePrimed) {
    return {
      visible: true,
      hex: 0xfde047,
      thicknessScale: 2.25,
      opacity: input.reducedMotion
        ? 0.56
        : Number((0.52 + Math.sin(input.timeSec * 14) * 0.14).toFixed(3)),
    };
  }

  if (input.relayReady) {
    return {
      visible: true,
      hex: 0x22d3ee,
      thicknessScale: 1.35,
      opacity: input.reducedMotion
        ? 0.28
        : Number((0.24 + Math.sin(input.timeSec * 10) * 0.06).toFixed(3)),
    };
  }

  return {
    visible: true,
    hex: 0x38bdf8,
    thicknessScale: 0.95,
    opacity: input.reducedMotion
      ? 0.16
      : Number((0.14 + Math.sin(input.timeSec * 8) * 0.04).toFixed(3)),
  };
}

