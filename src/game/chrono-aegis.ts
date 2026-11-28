import type {
  AppLocale,
  ChronoAegisRuntimeState,
  RigModuleId,
  RigModuleSlot,
  SentinelProtocolMode,
} from './types.ts';
import { VALID_RIG_MODULE_SLOTS } from './rig-progression.ts';

export const RIG_OVERCLOCK_COST = 1;

export const VALID_SENTINEL_MODES: readonly SentinelProtocolMode[] = [
  'off',
  'aegis',
  'interceptor',
  'harmonic',
];

export interface SentinelProtocolSpec {
  id: SentinelProtocolMode;
  shortBadgeEn: string;
  shortBadgeVi: string;
  titleEn: string;
  titleVi: string;
  roleEn: string;
  roleVi: string;
  summaryEn: string;
  summaryVi: string;
  baseWard: number;
  haloHex: number;
  emissiveHex: number;
  accentCss: string;
}

export const SENTINEL_PROTOCOL_SPECS: Record<SentinelProtocolMode, SentinelProtocolSpec> = {
  off: {
    id: 'off',
    shortBadgeEn: 'STANDBY',
    shortBadgeVi: 'CHỜ',
    titleEn: 'LYS-04 STANDBY',
    titleVi: 'LYS-04 CHẾ ĐỘ CHỜ',
    roleEn: 'PASSIVE DOCKED TELEMETRY',
    roleVi: 'THU GỌN ĐO LƯỜNG THỤ ĐỘNG',
    summaryEn: 'Drone docked on shoulder mount. Press [8] or select a protocol to deploy.',
    summaryVi: 'Drone thu gọn trên giá vai. Nhấn [8] hoặc chọn giao thức để triển khai.',
    baseWard: 0,
    haloHex: 0x64748b,
    emissiveHex: 0x334155,
    accentCss: '#94a3b8',
  },
  aegis: {
    id: 'aegis',
    shortBadgeEn: 'AEGIS',
    shortBadgeVi: 'HỘ VỆ',
    titleEn: 'LYS-04 AEGIS WARD',
    titleVi: 'LYS-04 KHIÊN HỘ VỆ AEGIS',
    roleEn: '+30 REGENERATIVE WARD & SHATTER PULSE',
    roleVi: '+30 GIÁP CHRONO TỰ HỒI & NỔ PHẢN CHẤN',
    summaryEn:
      '+30 Regenerative Chrono Ward (absorbs damage before HP, recharges after 3.4s) & 4.2m +20 Stagger pulse on Ward break.',
    summaryVi:
      '+30 Giáp Chrono tự hồi (hấp thụ sát thương trước Sinh Lực, hồi lại sau 3.4s) & nổ +20 Choáng bán kính 4.2m khi vỡ giáp.',
    baseWard: 30,
    haloHex: 0x34d399,
    emissiveHex: 0x10b981,
    accentCss: '#34d399',
  },
  interceptor: {
    id: 'interceptor',
    shortBadgeEn: 'TURRET',
    shortBadgeVi: 'PHÁO',
    titleEn: 'LYS-04 INTERCEPTOR',
    titleVi: 'LYS-04 PHÁO TIÊU DIỆT',
    roleEn: 'AUTONOMOUS PLASMA SUPPORT & +10 WARD',
    roleVi: 'BẮN HỖ TRỢ TỰ ĐỘNG & +10 GIÁP CHRONO',
    summaryEn:
      '+10 Chrono Ward & fires autonomous plasma bolts every 2.2s (14 DMG, +9 Stagger, +3 Flux) at nearby threats within 11.5m.',
    summaryVi:
      '+10 Giáp Chrono & tự động bắn đạn plasma mỗi 2.2s (14 ST, +9 Choáng, +3 Flux) vào kẻ địch trong tầm 11.5m.',
    baseWard: 10,
    haloHex: 0x22d3ee,
    emissiveHex: 0x06b6d4,
    accentCss: '#22d3ee',
  },
  harmonic: {
    id: 'harmonic',
    shortBadgeEn: 'ECHO+',
    shortBadgeVi: 'ECHO+',
    titleEn: 'LYS-04 HARMONIC AMP',
    titleVi: 'LYS-04 KHUẾCH ĐẠI ECHO',
    roleEn: '+20% ECHO DMG, FLUX PULSE & AFTERIMAGE',
    roleVi: '+20% ST ECHO, HỒI FLUX & DƯ ẢNH KẾT LIỄU',
    summaryEn:
      '+15 Chrono Ward, +20% Echo DMG, +25% Twin-Sync gain, +4 Flux/2.5s during Echo, & Phantom Afterimage Strikes (+32% shear).',
    summaryVi:
      '+15 Giáp Chrono, +20% ST Echo, +25% tích Song Ảnh, +4 Flux/2.5s khi có Echo & kích hoạt Dư Ảnh Kết Liễu (+32% ST).',
    baseWard: 15,
    haloHex: 0xa78bfa,
    emissiveHex: 0x8b5cf6,
    accentCss: '#c084fc',
  },
};

export function isValidSentinelMode(value: unknown): value is SentinelProtocolMode {
  return (
    typeof value === 'string' &&
    (VALID_SENTINEL_MODES as readonly string[]).includes(value)
  );
}

export function normalizeSentinelMode(value: unknown): SentinelProtocolMode {
  return isValidSentinelMode(value) ? value : 'off';
}

export function cycleNextSentinelMode(current: SentinelProtocolMode): SentinelProtocolMode {
  switch (current) {
    case 'off':
      return 'aegis';
    case 'aegis':
      return 'interceptor';
    case 'interceptor':
      return 'harmonic';
    case 'harmonic':
    default:
      return 'off';
  }
}

export interface RigSetSynergySummary {
  equippedCount: number;
  overclockedEquippedCount: number;
  tier: 0 | 1 | 2 | 3;
  damageMultiplier: number;
  fluxGainMultiplier: number;
  skillFluxCostMultiplier: number;
  bonusWard: number;
  sentinelRateMultiplier: number;
  phantomAfterimageUnlocked: boolean;
  titleEn: string;
  titleVi: string;
  perkSummaryEn: string;
  perkSummaryVi: string;
}

export function computeRigSetSynergy(
  equippedRigModules?: Partial<Record<RigModuleSlot, RigModuleId | null>> | null,
  overclockedRigModules?: readonly RigModuleId[] | null
): RigSetSynergySummary {
  let equippedCount = 0;
  let overclockedEquippedCount = 0;
  const ocSet = Array.isArray(overclockedRigModules) ? overclockedRigModules : [];

  if (equippedRigModules) {
    for (let i = 0; i < VALID_RIG_MODULE_SLOTS.length; i++) {
      const slot = VALID_RIG_MODULE_SLOTS[i];
      const modId = equippedRigModules[slot];
      if (modId) {
        equippedCount += 1;
        if (ocSet.includes(modId)) {
          overclockedEquippedCount += 1;
        }
      }
    }
  }

  if (equippedCount >= 3 && overclockedEquippedCount >= 3) {
    return {
      equippedCount,
      overclockedEquippedCount,
      tier: 3,
      damageMultiplier: 1.2,
      fluxGainMultiplier: 1.2,
      skillFluxCostMultiplier: 0.8,
      bonusWard: 35,
      sentinelRateMultiplier: 1.25,
      phantomAfterimageUnlocked: true,
      titleEn: 'SOVEREIGN RIG OVERDRIVE (3/3 MK.II)',
      titleVi: 'KHUNG GIÁP TỐI THƯỢNG (3/3 MK.II)',
      perkSummaryEn:
        '+20% All DMG · +35 Max Ward · +20% Flux · -20% Skill Flux · ★ Phantom Afterimage Strikes',
      perkSummaryVi:
        '+20% Sát Thương · +35 Giáp Chrono · +20% Flux · -20% Flux Kỹ Năng · ★ Dư Ảnh Kết Liễu',
    };
  }

  if (equippedCount >= 3) {
    return {
      equippedCount,
      overclockedEquippedCount,
      tier: 2,
      damageMultiplier: 1.12,
      fluxGainMultiplier: 1.15,
      skillFluxCostMultiplier: 0.9,
      bonusWard: 20,
      sentinelRateMultiplier: 1.12,
      phantomAfterimageUnlocked: false,
      titleEn: 'TRIAD CHASSIS SYNC (3/3)',
      titleVi: 'ĐỒNG BỘ KHUNG GIÁP TAM HỢP (3/3)',
      perkSummaryEn:
        '+12% All DMG · +20 Max Ward · +15% Flux · -10% Skill Flux (Overclock 3/3 to MK.II for Sovereign)',
      perkSummaryVi:
        '+12% Sát Thương · +20 Giáp Chrono · +15% Flux · -10% Flux Kỹ Năng (Ép xung đủ 3/3 MK.II để lên Tối Thượng)',
    };
  }

  if (equippedCount === 2) {
    return {
      equippedCount,
      overclockedEquippedCount,
      tier: 1,
      damageMultiplier: 1.06,
      fluxGainMultiplier: 1.08,
      skillFluxCostMultiplier: 1.0,
      bonusWard: 10,
      sentinelRateMultiplier: 1.0,
      phantomAfterimageUnlocked: false,
      titleEn: 'DUO CHASSIS LINK (2/3)',
      titleVi: 'LIÊN KẾT KHUNG GIÁP ĐÔI (2/3)',
      perkSummaryEn: '+6% All DMG · +10 Max Ward · +8% Flux (Equip 3/3 slots for Triad Sync)',
      perkSummaryVi: '+6% Sát Thương · +10 Giáp Chrono · +8% Flux (Lắp đủ 3/3 khe để mở Tam Hợp)',
    };
  }

  return {
    equippedCount,
    overclockedEquippedCount,
    tier: 0,
    damageMultiplier: 1.0,
    fluxGainMultiplier: 1.0,
    skillFluxCostMultiplier: 1.0,
    bonusWard: 0,
    sentinelRateMultiplier: 1.0,
    phantomAfterimageUnlocked: false,
    titleEn: `CHASSIS SYNERGY (${equippedCount}/3)`,
    titleVi: `ĐỒNG BỘ KHUNG GIÁP (${equippedCount}/3)`,
    perkSummaryEn: 'Equip 2/3 or 3/3 Chrono Rig Chassis slots to unlock Ward & Damage Set Bonuses.',
    perkSummaryVi: 'Trang bị 2/3 hoặc 3/3 khe Mô-đun Khung Giáp để kích hoạt Giáp Tự Hồi & Sát Thương bộ.',
  };
}

export function computeMaxChronoWard(
  mode: SentinelProtocolMode,
  rigSynergy: RigSetSynergySummary,
  extraBonusWard = 0
): number {
  const spec = SENTINEL_PROTOCOL_SPECS[mode] ?? SENTINEL_PROTOCOL_SPECS.off;
  return spec.baseWard + rigSynergy.bonusWard + Math.max(0, extraBonusWard);
}

export function createInitialChronoAegisState(
  mode: SentinelProtocolMode = 'off'
): ChronoAegisRuntimeState {
  const baseWard = SENTINEL_PROTOCOL_SPECS[mode]?.baseWard ?? 0;
  return {
    mode,
    ward: baseWard,
    maxWard: baseWard,
    rechargeDelayTimer: 0,
    fireCooldown: 0.9,
    harmonicFluxTimer: 2.5,
    bossCoreSiphonCooldown: 0,
    droneX: 0.95,
    droneZ: -0.65,
    lastTargetId: null,
    totalWardAbsorbed: 0,
    totalSentinelShots: 0,
    totalAfterimages: 0,
  };
}

export function syncChronoAegisMaxWard(
  aegis: ChronoAegisRuntimeState,
  mode: SentinelProtocolMode,
  rigSynergy: RigSetSynergySummary,
  refillAddedCapacity = true,
  extraBonusWard = 0
): void {
  const prevMax = aegis.maxWard;
  const nextMax = computeMaxChronoWard(mode, rigSynergy, extraBonusWard);
  aegis.mode = mode;
  aegis.maxWard = nextMax;
  if (nextMax <= 0) {
    aegis.ward = 0;
    aegis.rechargeDelayTimer = 0;
  } else if (refillAddedCapacity && nextMax > prevMax) {
    aegis.ward = Math.min(nextMax, aegis.ward + (nextMax - prevMax));
  } else if (aegis.ward > nextMax) {
    aegis.ward = nextMax;
  }
}

export function absorbDamageWithChronoWard(
  aegis: ChronoAegisRuntimeState | undefined | null,
  incomingDamage: number
): {
  absorbed: number;
  remainingDamage: number;
  shatteredShockwave: boolean;
} {
  if (!aegis || incomingDamage <= 0 || aegis.maxWard <= 0) {
    return {
      absorbed: 0,
      remainingDamage: Math.max(0, incomingDamage),
      shatteredShockwave: false,
    };
  }
  aegis.rechargeDelayTimer = 3.4;
  if (aegis.ward <= 0) {
    return {
      absorbed: 0,
      remainingDamage: incomingDamage,
      shatteredShockwave: false,
    };
  }
  const prevWard = aegis.ward;
  const absorbed = Math.min(prevWard, incomingDamage);
  aegis.ward = Math.max(0, Number((prevWard - absorbed).toFixed(2)));
  aegis.totalWardAbsorbed += Math.round(absorbed);
  const shatteredShockwave = prevWard >= 15 && aegis.ward <= 0;
  return {
    absorbed,
    remainingDamage: Math.max(0, Math.round(incomingDamage - absorbed)),
    shatteredShockwave,
  };
}

export interface SentinelTargetCandidate {
  id: string;
  x: number;
  z: number;
  hp: number;
}

export function tickChronoAegisSystem(params: {
  aegis: ChronoAegisRuntimeState;
  rigSynergy: RigSetSynergySummary;
  playerX: number;
  playerZ: number;
  elapsedTime: number;
  overdriveActive: boolean;
  echoActiveOrRecording: boolean;
  canAttack: boolean;
  targets: readonly SentinelTargetCandidate[];
  dt: number;
}): {
  fired: boolean;
  targetId: string | null;
  baseDamage: number;
  baseStagger: number;
  fluxGain: number;
  harmonicFluxPulse: number;
} {
  const {
    aegis,
    rigSynergy,
    playerX,
    playerZ,
    elapsedTime,
    overdriveActive,
    echoActiveOrRecording,
    canAttack,
    targets,
    dt,
  } = params;

  if ((aegis.bossCoreSiphonCooldown ?? 0) > 0) {
    aegis.bossCoreSiphonCooldown = Math.max(0, (aegis.bossCoreSiphonCooldown ?? 0) - dt);
  }

  // Smooth right-shoulder orbital offset (distinct from Fabricator left-flank drone)
  const orbitAngle = elapsedTime * 1.65 + 0.85;
  const orbitRadius = 1.08;
  const desiredX = playerX + Math.cos(orbitAngle) * orbitRadius;
  const desiredZ = playerZ + Math.sin(orbitAngle) * orbitRadius;
  const alpha = Math.min(1, dt * 10);
  aegis.droneX += (desiredX - aegis.droneX) * alpha;
  aegis.droneZ += (desiredZ - aegis.droneZ) * alpha;

  // Recharge Chrono Ward after delay
  if (aegis.maxWard > 0) {
    if (aegis.rechargeDelayTimer > 0) {
      aegis.rechargeDelayTimer = Math.max(0, aegis.rechargeDelayTimer - dt);
    } else if (aegis.ward < aegis.maxWard) {
      const regenPerSec =
        (aegis.mode === 'aegis' ? 6.5 : 4.5) * rigSynergy.sentinelRateMultiplier;
      aegis.ward = Math.min(aegis.maxWard, Number((aegis.ward + regenPerSec * dt).toFixed(2)));
    }
  }

  let harmonicFluxPulse = 0;
  if (aegis.mode === 'harmonic' && echoActiveOrRecording) {
    aegis.harmonicFluxTimer -= dt * rigSynergy.sentinelRateMultiplier;
    if (aegis.harmonicFluxTimer <= 0) {
      aegis.harmonicFluxTimer = 2.5;
      harmonicFluxPulse = 4;
    }
  } else {
    aegis.harmonicFluxTimer = Math.min(2.5, Math.max(0.4, aegis.harmonicFluxTimer));
  }

  if (aegis.mode !== 'interceptor' || !canAttack || targets.length === 0) {
    aegis.lastTargetId = null;
    if (aegis.fireCooldown > 0) {
      aegis.fireCooldown = Math.max(0, aegis.fireCooldown - dt);
    }
    return {
      fired: false,
      targetId: null,
      baseDamage: 0,
      baseStagger: 0,
      fluxGain: 0,
      harmonicFluxPulse,
    };
  }

  const rateMult = rigSynergy.sentinelRateMultiplier * (overdriveActive ? 1.55 : 1.0);
  aegis.fireCooldown -= dt * rateMult;

  let nearest: SentinelTargetCandidate | null = null;
  let bestDistSq = 11.5 * 11.5;
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    if (t.hp <= 0) continue;
    const dx = t.x - playerX;
    const dz = t.z - playerZ;
    const dSq = dx * dx + dz * dz;
    if (dSq <= bestDistSq) {
      bestDistSq = dSq;
      nearest = t;
    }
  }

  aegis.lastTargetId = nearest ? nearest.id : null;
  if (!nearest || aegis.fireCooldown > 0) {
    return {
      fired: false,
      targetId: nearest ? nearest.id : null,
      baseDamage: 0,
      baseStagger: 0,
      fluxGain: 0,
      harmonicFluxPulse,
    };
  }

  aegis.fireCooldown = 2.2;
  aegis.totalSentinelShots += 1;
  return {
    fired: true,
    targetId: nearest.id,
    baseDamage: 14,
    baseStagger: 9,
    fluxGain: 3,
    harmonicFluxPulse,
  };
}

export function shouldTriggerPhantomAfterimage(
  mode: SentinelProtocolMode,
  rigSynergy: RigSetSynergySummary,
  qualifyingStrike: boolean
): boolean {
  if (!qualifyingStrike) return false;
  return mode === 'harmonic' || rigSynergy.phantomAfterimageUnlocked;
}

export function formatSentinelHudLabel(
  mode: SentinelProtocolMode,
  locale: AppLocale
): string {
  const spec = SENTINEL_PROTOCOL_SPECS[mode] ?? SENTINEL_PROTOCOL_SPECS.off;
  return locale === 'vi'
    ? `LYS-04 [8]: ${spec.shortBadgeVi}`
    : `LYS-04 [8]: ${spec.shortBadgeEn}`;
}
