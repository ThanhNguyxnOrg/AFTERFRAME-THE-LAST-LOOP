import type { EchoDoctrineId, TwinSyncState, TwinSyncTier } from './types.ts';

export const TWIN_SYNC_MAX_CHARGE = 100;
export const TWIN_SYNC_ACTIVE_DECAY_PER_SEC = 5.5;
export const TWIN_SYNC_IDLE_DECAY_PER_SEC = 18.0;
export const TWIN_SYNC_PINCER_BONUS = 28;
export const TWIN_SYNC_COOP_HIT_BONUS = 18;
export const TWIN_SYNC_EXECUTION_BONUS = 30;
export const TWIN_SYNC_PROXIMITY_GAIN_PER_SEC = 6.5;

export const VALID_ECHO_DOCTRINE_IDS: readonly EchoDoctrineId[] = Object.freeze([
  'standard',
  'vanguard',
  'bastion',
  'nova',
]);

export interface EchoDoctrineSpec {
  readonly id: EchoDoctrineId;
  readonly titleEn: string;
  readonly titleVi: string;
  readonly shortBadgeEn: string;
  readonly shortBadgeVi: string;
  readonly roleEn: string;
  readonly roleVi: string;
  readonly summaryEn: string;
  readonly summaryVi: string;
  readonly accentHex: number;
  readonly ringHex: number;
  readonly accentCss: string;
  readonly echoDamageMultiplier: number;
  readonly echoStaggerMultiplier: number;
  readonly twinSyncGainMultiplier: number;
  readonly twinSyncDecayMultiplier: number;
  readonly tetherRadius: number;
  readonly tetherIncomingDamageMult: number;
  readonly tetherWardRegenPerSec: number;
  readonly tetherFluxRegenPerSec: number;
  readonly novaPulseRadius: number;
  readonly novaPulseDamage: number;
  readonly novaPulseStagger: number;
  readonly novaPullDistance: number;
  readonly novaCooldownSec: number;
  readonly collapseCooldownMultiplier: number;
  readonly collapseRadiusBonus: number;
}

export const ECHO_DOCTRINE_SPECS: Readonly<Record<EchoDoctrineId, EchoDoctrineSpec>> = Object.freeze({
  standard: Object.freeze({
    id: 'standard',
    titleEn: 'CALIBRATED ECHO',
    titleVi: 'VỌNG ẢNH CHUẨN',
    shortBadgeEn: 'CALIBRATED',
    shortBadgeVi: 'CHUẨN',
    roleEn: 'BALANCED BASELINE LOOP',
    roleVi: 'VÒNG LẶP CÂN BẰNG',
    summaryEn: 'Standard 1.0× Echo replay telemetry with zero Flux surcharge or behavioral drift.',
    summaryVi: 'Phát lại Vọng Ảnh 1.0× chuẩn xác, giữ nguyên tiêu hao Flux và nhịp chiến thuật gốc.',
    accentHex: 0x38bdf8,
    ringHex: 0x22d3ee,
    accentCss: '#38bdf8',
    echoDamageMultiplier: 1.0,
    echoStaggerMultiplier: 1.0,
    twinSyncGainMultiplier: 1.0,
    twinSyncDecayMultiplier: 1.0,
    tetherRadius: 0,
    tetherIncomingDamageMult: 1.0,
    tetherWardRegenPerSec: 0,
    tetherFluxRegenPerSec: 0,
    novaPulseRadius: 0,
    novaPulseDamage: 0,
    novaPulseStagger: 0,
    novaPullDistance: 0,
    novaCooldownSec: 0,
    collapseCooldownMultiplier: 1.0,
    collapseRadiusBonus: 0,
  }),
  vanguard: Object.freeze({
    id: 'vanguard',
    titleEn: 'VANGUARD STRIKE',
    titleVi: 'VỌNG ẢNH TIÊN PHONG',
    shortBadgeEn: 'VANGUARD',
    shortBadgeVi: 'TIÊN PHONG',
    roleEn: 'AGGRESSIVE CONVERGENCE SPEAR',
    roleVi: 'MŨI NHỌN CÔNG KÍCH',
    summaryEn: '+28% Echo, Convergence & Collapse DMG, +20% Echo Stagger, and +25% Twin-Sync charge gain.',
    summaryVi: '+28% ST Vọng Ảnh, Hội Tụ & Kích Nổ, +20% Choáng và +25% tốc độ tích Đồng Bộ Song Ảnh.',
    accentHex: 0xfb923c,
    ringHex: 0xfbbf24,
    accentCss: '#fb923c',
    echoDamageMultiplier: 1.28,
    echoStaggerMultiplier: 1.2,
    twinSyncGainMultiplier: 1.25,
    twinSyncDecayMultiplier: 1.0,
    tetherRadius: 0,
    tetherIncomingDamageMult: 1.0,
    tetherWardRegenPerSec: 0,
    tetherFluxRegenPerSec: 0,
    novaPulseRadius: 0,
    novaPulseDamage: 0,
    novaPulseStagger: 0,
    novaPullDistance: 0,
    novaCooldownSec: 0,
    collapseCooldownMultiplier: 1.0,
    collapseRadiusBonus: 0,
  }),
  bastion: Object.freeze({
    id: 'bastion',
    titleEn: 'BASTION ANCHOR',
    titleVi: 'VỌNG ẢNH PHÁO ĐÀI',
    shortBadgeEn: 'BASTION',
    shortBadgeVi: 'PHÁO ĐÀI',
    roleEn: 'TEMPORAL TETHER GUARDIAN',
    roleVi: 'MỎ NEO HỘ VỆ THỜI GIAN',
    summaryEn: 'Active Echo within 9.5m grants -18% incoming DMG, +4.5/s Chrono Ward, +2.0/s Flux & -30% Sync decay.',
    summaryVi: 'Khi Vọng Ảnh phát trong 9.5m: giảm 18% ST nhận vào, hồi +4.5 Giáp/s, +2.0 Flux/s & giảm 30% tụt Đồng Bộ.',
    accentHex: 0x34d399,
    ringHex: 0x10b981,
    accentCss: '#34d399',
    echoDamageMultiplier: 1.0,
    echoStaggerMultiplier: 1.05,
    twinSyncGainMultiplier: 1.0,
    twinSyncDecayMultiplier: 0.7,
    tetherRadius: 9.5,
    tetherIncomingDamageMult: 0.82,
    tetherWardRegenPerSec: 4.5,
    tetherFluxRegenPerSec: 2.0,
    novaPulseRadius: 0,
    novaPulseDamage: 0,
    novaPulseStagger: 0,
    novaPullDistance: 0,
    novaCooldownSec: 0,
    collapseCooldownMultiplier: 1.0,
    collapseRadiusBonus: 0,
  }),
  nova: Object.freeze({
    id: 'nova',
    titleEn: 'PARADOX NOVA',
    titleVi: 'VỌNG ẢNH TÂN TINH',
    shortBadgeEn: 'NOVA',
    shortBadgeVi: 'TÂN TINH',
    roleEn: 'RIFT DETONATOR & VORTEX',
    roleVi: 'KÍCH NỔ DỊ ĐIỂM HÚT',
    summaryEn: 'Replay [Y] & Warp [V] unleash a 4.4m Rift Pulse (22 DMG, +18 Stagger, pull); -25% Collapse [X] CD & +0.8m radius.',
    summaryVi: 'Phát [Y] & Dịch Chuyển [V] nổ xung 4.4m (22 ST, +18 Choáng, gom mục tiêu); -25% hồi Kích Nổ [X] & +0.8m bán kính.',
    accentHex: 0xe879f9,
    ringHex: 0xc084fc,
    accentCss: '#e879f9',
    echoDamageMultiplier: 1.12,
    echoStaggerMultiplier: 1.12,
    twinSyncGainMultiplier: 1.1,
    twinSyncDecayMultiplier: 1.0,
    tetherRadius: 0,
    tetherIncomingDamageMult: 1.0,
    tetherWardRegenPerSec: 0,
    tetherFluxRegenPerSec: 0,
    novaPulseRadius: 4.4,
    novaPulseDamage: 22,
    novaPulseStagger: 18,
    novaPullDistance: 1.2,
    novaCooldownSec: 1.8,
    collapseCooldownMultiplier: 0.75,
    collapseRadiusBonus: 0.8,
  }),
});

export function isValidEchoDoctrineId(value: unknown): value is EchoDoctrineId {
  return (
    value === 'standard' ||
    value === 'vanguard' ||
    value === 'bastion' ||
    value === 'nova'
  );
}

export function normalizeEchoDoctrineId(value: unknown): EchoDoctrineId {
  return isValidEchoDoctrineId(value) ? value : 'standard';
}

export function cycleNextEchoDoctrineId(current: unknown): EchoDoctrineId {
  const norm = normalizeEchoDoctrineId(current);
  const idx = VALID_ECHO_DOCTRINE_IDS.indexOf(norm);
  return VALID_ECHO_DOCTRINE_IDS[(idx + 1) % VALID_ECHO_DOCTRINE_IDS.length];
}

export function getEchoDoctrineSpec(doctrineId: unknown): EchoDoctrineSpec {
  return ECHO_DOCTRINE_SPECS[normalizeEchoDoctrineId(doctrineId)];
}

export function formatEchoDoctrineHudBadge(
  doctrineId: unknown,
  locale: 'en' | 'vi' = 'en'
): string {
  const spec = getEchoDoctrineSpec(doctrineId);
  return `[0] ${locale === 'vi' ? spec.shortBadgeVi : spec.shortBadgeEn}`;
}

export interface TwinSyncTierModifiers {
  tier: TwinSyncTier;
  damageMult: number;
  staggerMult: number;
  moveSpeedMult: number;
  bonusFluxPerSec: number;
  accentHex: number;
  accentCss: string;
  labelEn: string;
  labelVi: string;
}

export const TWIN_SYNC_TIER_SPECS: Record<TwinSyncTier, TwinSyncTierModifiers> = {
  0: {
    tier: 0,
    damageMult: 1.0,
    staggerMult: 1.0,
    moveSpeedMult: 1.0,
    bonusFluxPerSec: 0,
    accentHex: 0x38bdf8,
    accentCss: '#38bdf8',
    labelEn: 'UNLINKED',
    labelVi: 'CHƯA ĐỒNG BỘ',
  },
  1: {
    tier: 1,
    damageMult: 1.15,
    staggerMult: 1.08,
    moveSpeedMult: 1.08,
    bonusFluxPerSec: 1.5,
    accentHex: 0x22d3ee,
    accentCss: '#22d3ee',
    labelEn: 'SYNC I · +15% DMG',
    labelVi: 'SONG ẢNH I · +15% ST',
  },
  2: {
    tier: 2,
    damageMult: 1.25,
    staggerMult: 1.14,
    moveSpeedMult: 1.12,
    bonusFluxPerSec: 3.5,
    accentHex: 0x818cf8,
    accentCss: '#a5b4fc',
    labelEn: 'HARMONIC II · +25% DMG',
    labelVi: 'CỘNG HƯỞNG II · +25% ST',
  },
  3: {
    tier: 3,
    damageMult: 1.35,
    staggerMult: 1.22,
    moveSpeedMult: 1.16,
    bonusFluxPerSec: 5.5,
    accentHex: 0xfbbf24,
    accentCss: '#fde047',
    labelEn: 'SINGULARITY III · +35% DMG',
    labelVi: 'KỲ DỊ III · +35% ST',
  },
};

export function createInitialTwinSyncState(): TwinSyncState {
  return {
    charge: 0,
    tier: 0,
    linkActive: false,
    pincerActive: false,
    lastPlayerHitTime: -99,
    lastEchoHitTime: -99,
    totalPincers: 0,
    peakTier: 0,
  };
}

export function resolveTwinSyncTier(charge: number): TwinSyncTier {
  if (charge >= 85) return 3;
  if (charge >= 50) return 2;
  if (charge >= 20) return 1;
  return 0;
}

export function getTwinSyncModifiers(state: TwinSyncState | undefined): TwinSyncTierModifiers {
  if (!state || !state.linkActive) {
    return TWIN_SYNC_TIER_SPECS[0];
  }
  return TWIN_SYNC_TIER_SPECS[state.tier] ?? TWIN_SYNC_TIER_SPECS[0];
}

export function isPincerFlankGeometry(
  playerX: number,
  playerZ: number,
  echoX: number,
  echoZ: number,
  targetX: number,
  targetZ: number
): boolean {
  const px = playerX - targetX;
  const pz = playerZ - targetZ;
  const ex = echoX - targetX;
  const ez = echoZ - targetZ;
  const pLen = Math.hypot(px, pz);
  const eLen = Math.hypot(ex, ez);
  if (pLen < 0.25 || eLen < 0.25) return false;
  const dot = (px * ex + pz * ez) / (pLen * eLen);
  // Opposite or perpendicular-flanking angles (> ~105 degrees apart)
  return dot <= -0.25;
}

export function registerTwinSyncCombatHit(
  state: TwinSyncState,
  source: 'player' | 'echo',
  nowSec: number,
  echoActive: boolean,
  isPincer: boolean,
  doctrineId: EchoDoctrineId = 'standard'
): { tierUp: boolean; newTier: TwinSyncTier; pincerTriggered: boolean } {
  if (!echoActive) {
    return { tierUp: false, newTier: state.tier, pincerTriggered: false };
  }

  const prevTier = state.tier;
  if (source === 'player') {
    state.lastPlayerHitTime = nowSec;
  } else {
    state.lastEchoHitTime = nowSec;
  }

  const coopWindow = Math.abs(state.lastPlayerHitTime - state.lastEchoHitTime) <= 1.25;
  const pincerTriggered = isPincer && coopWindow;
  const rawGain = pincerTriggered
    ? TWIN_SYNC_PINCER_BONUS
    : coopWindow
      ? TWIN_SYNC_COOP_HIT_BONUS
      : 8;
  const gain = Math.round(rawGain * ECHO_DOCTRINE_SPECS[doctrineId].twinSyncGainMultiplier);

  if (pincerTriggered) {
    state.totalPincers += 1;
    state.pincerActive = true;
  }

  state.linkActive = true;
  state.charge = Math.min(TWIN_SYNC_MAX_CHARGE, state.charge + gain);
  state.tier = resolveTwinSyncTier(state.charge);
  if (state.tier > state.peakTier) {
    state.peakTier = state.tier;
  }

  return {
    tierUp: state.tier > prevTier,
    newTier: state.tier,
    pincerTriggered,
  };
}

export function addTwinSyncBonus(
  state: TwinSyncState,
  amount: number,
  echoActive: boolean
): { tierUp: boolean; newTier: TwinSyncTier } {
  if (!echoActive || amount <= 0) {
    return { tierUp: false, newTier: state.tier };
  }
  const prevTier = state.tier;
  state.linkActive = true;
  state.charge = Math.min(TWIN_SYNC_MAX_CHARGE, state.charge + amount);
  state.tier = resolveTwinSyncTier(state.charge);
  if (state.tier > state.peakTier) {
    state.peakTier = state.tier;
  }
  return { tierUp: state.tier > prevTier, newTier: state.tier };
}

export function tickTwinSyncState(
  state: TwinSyncState,
  dt: number,
  echoActive: boolean,
  linkDistance: number,
  doctrineId: EchoDoctrineId = 'standard'
): void {
  if (dt <= 0) return;
  const docSpec = ECHO_DOCTRINE_SPECS[doctrineId];

  state.linkActive = echoActive;
  if (!echoActive) {
    state.pincerActive = false;
    state.charge = Math.max(
      0,
      state.charge - TWIN_SYNC_IDLE_DECAY_PER_SEC * docSpec.twinSyncDecayMultiplier * dt
    );
    state.tier = resolveTwinSyncTier(state.charge);
    return;
  }

  // Optimal tactical distance (1.8m – 11m) steadily hums the Twin-Sync link
  if (linkDistance >= 1.5 && linkDistance <= 12.0) {
    state.charge = Math.min(
      TWIN_SYNC_MAX_CHARGE,
      state.charge + TWIN_SYNC_PROXIMITY_GAIN_PER_SEC * docSpec.twinSyncGainMultiplier * dt
    );
  } else {
    state.charge = Math.max(
      0,
      state.charge - TWIN_SYNC_ACTIVE_DECAY_PER_SEC * docSpec.twinSyncDecayMultiplier * dt
    );
  }

  state.tier = resolveTwinSyncTier(state.charge);
  if (state.tier > state.peakTier) {
    state.peakTier = state.tier;
  }
}
