import type {
  CampaignChapterId,
  ChronoRelicDefinition,
  ChronoRelicId,
  ObstacleCollider,
  RelicConstellationId,
  WeaponId,
  WeaponMasteryRankInfo,
  WeaponMasteryXpMap,
} from './types.ts';

export const VALID_CHRONO_RELIC_IDS: readonly ChronoRelicId[] = [
  'relic_kinetic_overdrive',
  'relic_temporal_siphon',
  'relic_echo_amplification',
  'relic_aegis_capacitor',
  'relic_thermal_purge',
  'relic_singularity_coil',
];

export const CHRONO_RELICS: Record<ChronoRelicId, ChronoRelicDefinition> = {
  relic_kinetic_overdrive: {
    id: 'relic_kinetic_overdrive',
    name: 'Kinetic Overdrive',
    shortLabel: 'OVERDRIVE',
    accent: 'cyan',
    benefitText: '+14% Move & Strike Tempo per stack (multiplicative recursion scaling)',
  },
  relic_temporal_siphon: {
    id: 'relic_temporal_siphon',
    name: 'Temporal Siphon',
    shortLabel: 'SIPHON',
    accent: 'emerald',
    benefitText: '+12 Chrono Flux & +8 Integrity restored on every hostile defeat',
  },
  relic_echo_amplification: {
    id: 'relic_echo_amplification',
    name: 'Echo Resonance Core',
    shortLabel: 'ECHO CORE',
    accent: 'purple',
    benefitText: '+22% Echo & Convergence Damage + +15% Echo Stagger per stack',
  },
  relic_aegis_capacitor: {
    id: 'relic_aegis_capacitor',
    name: 'Aegis Phase Barrier',
    shortLabel: 'AEGIS',
    accent: 'amber',
    benefitText: '+20 Max Integrity cap & +18 Integrity immediate field repair',
  },
  relic_thermal_purge: {
    id: 'relic_thermal_purge',
    name: 'Cryo Thermal Vent',
    shortLabel: 'CRYO VENT',
    accent: 'cyan',
    benefitText: '-18% Weapon Heat buildup & +18% Heavy / Ranged impact potency',
  },
  relic_singularity_coil: {
    id: 'relic_singularity_coil',
    name: 'Singularity Bus',
    shortLabel: 'SINGULARITY',
    accent: 'rose',
    benefitText: '+22% Posture Stagger output & -18% Relay/Pin/Collapse cooldowns',
  },
};

export interface RelicConstellationSpec {
  readonly id: RelicConstellationId;
  readonly pair: readonly [ChronoRelicId, ChronoRelicId];
  readonly titleEn: string;
  readonly titleVi: string;
  readonly summaryEn: string;
  readonly summaryVi: string;
  readonly accentCss: string;
}

export const RELIC_SYNERGY_CONSTELLATIONS: Readonly<
  Record<RelicConstellationId, RelicConstellationSpec>
> = Object.freeze({
  constellation_chrono_vampirism: Object.freeze({
    id: 'constellation_chrono_vampirism',
    pair: Object.freeze(['relic_kinetic_overdrive', 'relic_temporal_siphon'] as const),
    titleEn: 'CHRONO VAMPIRISM',
    titleVi: 'HÚT NĂNG LƯỢNG THỜI GIAN',
    summaryEn: '+15% All DMG, +12% Move Speed, and +6 Chrono Ward & +6 Flux on kill.',
    summaryVi: '+15% Toàn Bộ ST, +12% Tốc Chạy, hồi thêm +6 Giáp Chrono & +6 Flux khi hạ địch.',
    accentCss: '#34d399',
  }),
  constellation_paradox_singularity: Object.freeze({
    id: 'constellation_paradox_singularity',
    pair: Object.freeze(['relic_echo_amplification', 'relic_singularity_coil'] as const),
    titleEn: 'PARADOX SINGULARITY',
    titleVi: 'DỊ ĐIỂM NGHỊCH LÝ',
    summaryEn: '+25% Echo & Convergence DMG, +20% Stagger, and -15% Confluence [9] & Collapse CD.',
    summaryVi: '+25% ST Vọng Ảnh & Hội Tụ, +20% Choáng, giảm 15% hồi Tuyệt Kỹ [9] & Kích Nổ [X].',
    accentCss: '#e879f9',
  }),
  constellation_cryo_fortress: Object.freeze({
    id: 'constellation_cryo_fortress',
    pair: Object.freeze(['relic_aegis_capacitor', 'relic_thermal_purge'] as const),
    titleEn: 'CRYO FORTRESS',
    titleVi: 'PHÁO ĐÀI BĂNG HÀN',
    summaryEn: '+25 Max Integrity, -20% Weapon Heat cost, and +20% Heavy/Ranged impact potency.',
    summaryVi: '+25 Sinh Lực Tối Đa, giảm 20% Nhiệt Vũ Khí và +20% uy lực Đòn Mạnh / Tầm Xa.',
    accentCss: '#38bdf8',
  }),
});

export const VALID_RELIC_CONSTELLATION_IDS: readonly RelicConstellationId[] = Object.freeze([
  'constellation_chrono_vampirism',
  'constellation_paradox_singularity',
  'constellation_cryo_fortress',
]);

// Pre-computed frozen 8-entry bitmask table so computeActiveRelicConstellations allocates 0 arrays at 60Hz
const FROZEN_CONSTELLATION_BITMASK_TABLE: ReadonlyArray<readonly RelicConstellationId[]> =
  Object.freeze(
    Array.from({ length: 8 }, (_, mask) => {
      const list: RelicConstellationId[] = [];
      if (mask & 1) list.push('constellation_chrono_vampirism');
      if (mask & 2) list.push('constellation_paradox_singularity');
      if (mask & 4) list.push('constellation_cryo_fortress');
      return Object.freeze(list);
    })
  );

export function computeActiveRelicConstellations(
  relicStacks?: Partial<Record<ChronoRelicId, number>> | null
): readonly RelicConstellationId[] {
  if (!relicStacks) return FROZEN_CONSTELLATION_BITMASK_TABLE[0];
  let mask = 0;
  if ((relicStacks.relic_kinetic_overdrive ?? 0) >= 1 && (relicStacks.relic_temporal_siphon ?? 0) >= 1) {
    mask |= 1;
  }
  if ((relicStacks.relic_echo_amplification ?? 0) >= 1 && (relicStacks.relic_singularity_coil ?? 0) >= 1) {
    mask |= 2;
  }
  if ((relicStacks.relic_aegis_capacitor ?? 0) >= 1 && (relicStacks.relic_thermal_purge ?? 0) >= 1) {
    mask |= 4;
  }
  return FROZEN_CONSTELLATION_BITMASK_TABLE[mask];
}

export function getDraftRelicSynergyPreview(
  candidateRelicId: ChronoRelicId,
  relicStacks?: Partial<Record<ChronoRelicId, number>> | null
): {
  status: 'completes' | 'active' | 'partner_missing';
  constellation: RelicConstellationSpec;
  partnerRelic: ChronoRelicDefinition;
} {
  const s = relicStacks ?? {};
  for (let i = 0; i < VALID_RELIC_CONSTELLATION_IDS.length; i++) {
    const cid = VALID_RELIC_CONSTELLATION_IDS[i];
    const spec = RELIC_SYNERGY_CONSTELLATIONS[cid];
    if (spec.pair[0] === candidateRelicId || spec.pair[1] === candidateRelicId) {
      const partnerId = spec.pair[0] === candidateRelicId ? spec.pair[1] : spec.pair[0];
      const hasCandidate = (s[candidateRelicId] ?? 0) >= 1;
      const hasPartner = (s[partnerRelicIdKey(partnerId)] ?? 0) >= 1;
      return {
        status: hasCandidate && hasPartner ? 'active' : hasPartner ? 'completes' : 'partner_missing',
        constellation: spec,
        partnerRelic: CHRONO_RELICS[partnerId],
      };
    }
  }
  return {
    status: 'partner_missing',
    constellation: RELIC_SYNERGY_CONSTELLATIONS.constellation_chrono_vampirism,
    partnerRelic: CHRONO_RELICS.relic_temporal_siphon,
  };
}

function partnerRelicIdKey(id: ChronoRelicId): ChronoRelicId {
  return id;
}

export interface RecursionModifierSummary {
  moveSpeedMultiplier: number;
  damageMultiplier: number;
  heavyRangedDamageMultiplier: number;
  echoDamageMultiplier: number;
  echoStaggerMultiplier: number;
  staggerMultiplier: number;
  heatMultiplier: number;
  cooldownMultiplier: number;
  confluenceCooldownMultiplier: number;
  killFluxBonus: number;
  killHealBonus: number;
  killWardBonus: number;
  maxIntegrityBonus: number;
  activeConstellations: readonly RelicConstellationId[];
}

export function isValidChronoRelicId(value: unknown): value is ChronoRelicId {
  return (
    typeof value === 'string' &&
    (VALID_CHRONO_RELIC_IDS as readonly string[]).includes(value)
  );
}

export function getAllChronoRelicDefinitions(): ChronoRelicDefinition[] {
  return VALID_CHRONO_RELIC_IDS.map((id) => CHRONO_RELICS[id]);
}

export function computeRecursionModifierSummary(
  relicStacks?: Partial<Record<ChronoRelicId, number>> | null
): RecursionModifierSummary {
  const s = relicStacks ?? {};
  const kinetic = Math.max(0, Math.min(8, Math.floor(s.relic_kinetic_overdrive ?? 0)));
  const siphon = Math.max(0, Math.min(8, Math.floor(s.relic_temporal_siphon ?? 0)));
  const echo = Math.max(0, Math.min(8, Math.floor(s.relic_echo_amplification ?? 0)));
  const aegis = Math.max(0, Math.min(8, Math.floor(s.relic_aegis_capacitor ?? 0)));
  const thermal = Math.max(0, Math.min(8, Math.floor(s.relic_thermal_purge ?? 0)));
  const sing = Math.max(0, Math.min(8, Math.floor(s.relic_singularity_coil ?? 0)));

  const hasVampirism = kinetic >= 1 && siphon >= 1;
  const hasSingularity = echo >= 1 && sing >= 1;
  const hasCryoFortress = aegis >= 1 && thermal >= 1;
  const activeConstellations = computeActiveRelicConstellations(relicStacks);

  return {
    moveSpeedMultiplier: (1 + kinetic * 0.14) * (hasVampirism ? 1.12 : 1),
    damageMultiplier: (1 + kinetic * 0.1) * (hasVampirism ? 1.15 : 1),
    heavyRangedDamageMultiplier: (1 + thermal * 0.18) * (hasCryoFortress ? 1.2 : 1),
    echoDamageMultiplier: (1 + echo * 0.22) * (hasSingularity ? 1.25 : 1),
    echoStaggerMultiplier: 1 + echo * 0.15,
    staggerMultiplier: (1 + sing * 0.22) * (hasSingularity ? 1.2 : 1),
    heatMultiplier: Math.pow(0.82, thermal) * (hasCryoFortress ? 0.8 : 1),
    cooldownMultiplier: Math.pow(0.82, sing) * (hasSingularity ? 0.85 : 1),
    confluenceCooldownMultiplier: hasSingularity ? 0.85 : 1,
    killFluxBonus: siphon * 12 + (hasVampirism ? 6 : 0),
    killHealBonus: siphon * 8,
    killWardBonus: hasVampirism ? 6 : 0,
    maxIntegrityBonus: aegis * 20 + (hasCryoFortress ? 25 : 0),
    activeConstellations,
  };
}

export function getRelicDraftChoices(
  loopIndex: number,
  relicStacks?: Partial<Record<ChronoRelicId, number>> | null
): ChronoRelicDefinition[] {
  const totalOwned = VALID_CHRONO_RELIC_IDS.reduce(
    (sum, id) => sum + (relicStacks?.[id] ?? 0),
    0
  );
  const startIdx = (Math.max(1, loopIndex) * 5 + totalOwned * 3) % VALID_CHRONO_RELIC_IDS.length;
  const picks: ChronoRelicDefinition[] = [];
  for (let i = 0; i < 3; i++) {
    const id = VALID_CHRONO_RELIC_IDS[(startIdx + i * 2) % VALID_CHRONO_RELIC_IDS.length];
    picks.push(CHRONO_RELICS[id]);
  }
  return picks;
}

const RECURSION_SECTOR_ROTATION: readonly CampaignChapterId[] = [
  'prologue',
  'chapter_1_helix',
  'chapter_2_choir',
  'chapter_3_curator',
  'chapter_4_matron',
  'chapter_5_loom',
];

export function pickNextRecursionSector(loopIndex: number): CampaignChapterId {
  const idx = (Math.max(1, loopIndex) - 1) % RECURSION_SECTOR_ROTATION.length;
  return RECURSION_SECTOR_ROTATION[idx];
}

// ============================================================================
// WEAPON MASTERY RANKS (RANK I - V)
// ============================================================================

export const WEAPON_MASTERY_THRESHOLDS: readonly number[] = [0, 25, 75, 150, 260];

export function createEmptyWeaponMasteryXpMap(): WeaponMasteryXpMap {
  return {
    chrono_edge: 0,
    pulsecaster: 0,
    phase_rail: 0,
    grav_breaker: 0,
    chrono_scythe: 0,
  };
}

export function normalizeWeaponMasteryXpMap(
  raw?: Partial<Record<WeaponId, number>> | null
): WeaponMasteryXpMap {
  const base = createEmptyWeaponMasteryXpMap();
  if (!raw || typeof raw !== 'object') return base;
  const keys: WeaponId[] = [
    'chrono_edge',
    'pulsecaster',
    'phase_rail',
    'grav_breaker',
    'chrono_scythe',
  ];
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const v = raw[k];
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) {
      base[k] = Math.min(999999, Math.floor(v));
    }
  }
  return base;
}

export function computeWeaponMasteryRankInfo(xpRaw: number): WeaponMasteryRankInfo {
  const xp = Math.max(0, Math.floor(xpRaw || 0));
  let rank: 1 | 2 | 3 | 4 | 5 = 1;
  if (xp >= WEAPON_MASTERY_THRESHOLDS[4]) rank = 5;
  else if (xp >= WEAPON_MASTERY_THRESHOLDS[3]) rank = 4;
  else if (xp >= WEAPON_MASTERY_THRESHOLDS[2]) rank = 3;
  else if (xp >= WEAPON_MASTERY_THRESHOLDS[1]) rank = 2;

  const currentFloor = WEAPON_MASTERY_THRESHOLDS[rank - 1];
  const nextThreshold = rank < 5 ? WEAPON_MASTERY_THRESHOLDS[rank] : null;
  const progressRatio =
    nextThreshold !== null
      ? Math.max(0, Math.min(1, (xp - currentFloor) / Math.max(1, nextThreshold - currentFloor)))
      : 1;

  // Rank 1 grants zero bonuses so baseline deterministic combat numbers never shift.
  const damageMultiplier = rank === 1 ? 1 : 1 + (rank - 1) * 0.03; // up to +12%
  const staggerMultiplier = rank === 1 ? 1 : 1 + (rank - 1) * 0.035; // up to +14%
  const fluxGainMultiplier = rank === 1 ? 1 : 1 + (rank - 1) * 0.04; // up to +16%
  const vulnerableBonus = rank === 1 ? 0 : (rank - 1) * 0.03; // up to +12%

  const rankLabels = ['I · CALIBRATED', 'II · TUNED', 'III · RESONANT', 'IV · HARMONIC', 'V · SOVEREIGN'] as const;

  return {
    rank,
    rankLabel: rankLabels[rank - 1],
    xp,
    nextRankXp: nextThreshold,
    progressRatio: Number(progressRatio.toFixed(3)),
    damageMultiplier,
    staggerMultiplier,
    fluxGainMultiplier,
    vulnerableBonus,
  };
}

// ============================================================================
// TEMPORAL ANOMALY RIFT SPAWN GEOMETRY
// ============================================================================

const RIFT_CANDIDATE_ANGLES: readonly number[] = [
  0.42,
  1.95,
  3.52,
  5.12,
  1.15,
  2.72,
  4.35,
  5.85,
];

export function computeTemporalRiftSpawnPosition(
  chapter: CampaignChapterId,
  spawnSeq: number,
  playerX: number,
  playerZ: number,
  obstacles: ObstacleCollider[]
): { x: number; z: number } {
  const chOffset =
    chapter === 'prologue'
      ? 0
      : chapter === 'chapter_1_helix'
        ? 1
        : chapter === 'chapter_2_choir'
          ? 2
          : chapter === 'chapter_3_curator'
            ? 3
            : chapter === 'chapter_4_matron'
              ? 4
              : 5;

  for (let attempt = 0; attempt < RIFT_CANDIDATE_ANGLES.length; attempt++) {
    const idx = (spawnSeq + chOffset + attempt) % RIFT_CANDIDATE_ANGLES.length;
    const angle = RIFT_CANDIDATE_ANGLES[idx];
    const dist = 7.6 + ((attempt + spawnSeq) % 3) * 1.4;
    const x = Number((Math.cos(angle) * dist).toFixed(2));
    const z = Number((Math.sin(angle) * dist).toFixed(2));

    if (Math.hypot(x - playerX, z - playerZ) < 4.5) continue;
    let blocked = false;
    for (let i = 0; i < obstacles.length; i++) {
      const o = obstacles[i];
      if (o.disabled) continue;
      if (Math.hypot(x - o.x, z - o.z) < o.radius + 1.8) {
        blocked = true;
        break;
      }
    }
    if (!blocked) {
      return { x, z };
    }
  }
  return { x: 0, z: -8.2 };
}
