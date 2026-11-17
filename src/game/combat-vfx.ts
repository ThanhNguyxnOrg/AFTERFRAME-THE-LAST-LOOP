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
  input: ChronoAuraVisualInput
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

  const emissiveIntensity = Number(
    (1.25 + tier * 0.24 + boost + wave * 0.12).toFixed(3)
  );
  const spinMultiplier = Number(
    (1 + tier * 0.26 + (input.riposteActive || input.chronoSlipActive ? 1.45 : input.kineticSurgeActive ? 0.65 : 0)).toFixed(3)
  );

  const baseAuraOpacity =
    tier > 0 || input.riposteActive || input.chronoSlipActive || input.kineticSurgeActive || input.isRecording
      ? Math.min(0.56, 0.12 + tier * 0.068 + boost * 0.2 + wave * 0.03)
      : 0;
  const groundAuraOpacity = Math.max(0, Number(baseAuraOpacity.toFixed(3)));
  const groundAuraScale = Number(
    (0.84 + tier * 0.068 + boost * 0.12 + wave * 0.025).toFixed(3)
  );
  const echoShimmerOpacity = input.reducedMotion
    ? 0.48
    : Number((0.46 + Math.sin(input.timeSec * 6.4) * 0.12).toFixed(3));

  return {
    tier,
    ringHex,
    emissiveIntensity,
    spinMultiplier,
    groundAuraOpacity,
    groundAuraScale,
    echoShimmerOpacity,
  };
}

