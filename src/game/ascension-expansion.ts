import type {
  AscensionRuntimeState,
  BossId,
  CampaignChapterId,
  ChronoMutatorState,
  ChronoRelicId,
  DailyTrialConfig,
  DailyTrialRecord,
  PhotoFilterId,
  PhotoModeState,
  StyleActionKind,
  StyleRankState,
  StyleRankTier,
  WeaponModChipDefinition,
  WeaponModChipId,
} from './types.ts';

export const WEAPON_MOD_CHIPS: readonly WeaponModChipDefinition[] = [
  {
    id: 'mod_volt_arc',
    name: 'VOLT ARC CHIP',
    nameVi: 'CHIP HỒ QUANG ĐIỆN',
    shortLabel: 'VOLT ARC',
    cost: 0,
    accentHex: 0x22d3ee,
    accentCss: '#22d3ee',
    summaryEn:
      'Weapon strikes arc electric cyan lightning (+12 dmg) to the nearest hostile within 4.0m.',
    summaryVi:
      'Đòn đánh phóng tia sét lam (+12 sát thương) lan sang kẻ địch gần nhất trong bán kính 4.0m.',
  },
  {
    id: 'mod_siphon_leech',
    name: 'SIPHON LEECH CHIP',
    nameVi: 'CHIP HÚT SINH LỰC',
    shortLabel: 'SIPHON LEECH',
    cost: 2,
    accentHex: 0x34d399,
    accentCss: '#34d399',
    summaryEn:
      'Siphons Integrity on strike: +3 HP on Light hits and +8 HP on Heavy hits or Convergences.',
    summaryVi:
      'Hấp thụ Integrity mỗi đòn trúng: hồi +3 HP với đòn Nhẹ và +8 HP với đòn Nặng / Hội Tụ.',
  },
  {
    id: 'mod_chrono_nova',
    name: 'CHRONO NOVA CHIP',
    nameVi: 'CHIP SIÊU TÂN THỜI KHÔNG',
    shortLabel: 'CHRONO NOVA',
    cost: 3,
    accentHex: 0xf59e0b,
    accentCss: '#f59e0b',
    summaryEn:
      'Heavy strikes & Chrono Finishers detonate a 2.8m astral-gold temporal blast (+18 AoE dmg, +10 Stagger).',
    summaryVi:
      'Đòn Nặng & Kết Liễu kích nổ xung thời không vàng kim 2.8m (+18 sát thương diện rộng, +10 Choáng).',
  },
];

export function getWeaponModChipDefinition(
  id: WeaponModChipId | null | undefined
): WeaponModChipDefinition | null {
  if (!id) return null;
  return WEAPON_MOD_CHIPS.find((chip) => chip.id === id) ?? null;
}

export const STYLE_RANK_THRESHOLDS: ReadonlyArray<{
  tier: StyleRankTier;
  minPoints: number;
  titleEn: string;
  titleVi: string;
  accentCss: string;
  damageBonusMult: number;
}> = [
  {
    tier: 'D',
    minPoints: 0,
    titleEn: 'DISSONANT',
    titleVi: 'KHỞI NHỊP',
    accentCss: '#94a3b8',
    damageBonusMult: 1.0,
  },
  {
    tier: 'C',
    minPoints: 35,
    titleEn: 'CALIBRATED',
    titleVi: 'ĐỒNG BỘ',
    accentCss: '#38bdf8',
    damageBonusMult: 1.0,
  },
  {
    tier: 'B',
    minPoints: 80,
    titleEn: 'BLITZFRAME',
    titleVi: 'CHỚP NHOÁNG',
    accentCss: '#34d399',
    damageBonusMult: 1.0,
  },
  {
    tier: 'A',
    minPoints: 135,
    titleEn: 'AFTERIMAGE',
    titleVi: 'TÀN ẢNH',
    accentCss: '#a78bfa',
    damageBonusMult: 1.08,
  },
  {
    tier: 'S',
    minPoints: 200,
    titleEn: 'SOVEREIGN',
    titleVi: 'THỐNG TRỊ',
    accentCss: '#f59e0b',
    damageBonusMult: 1.15,
  },
  {
    tier: 'SSS',
    minPoints: 280,
    titleEn: 'PARADOX ASCENDANT',
    titleVi: 'THẦN TỐC THỜI KHÔNG',
    accentCss: '#fde047',
    damageBonusMult: 1.25,
  },
];

export function computeStyleRankTier(points: number): StyleRankTier {
  let matched: StyleRankTier = 'D';
  for (const entry of STYLE_RANK_THRESHOLDS) {
    if (points >= entry.minPoints) {
      matched = entry.tier;
    }
  }
  return matched;
}

export function getStyleRankMeta(tier: StyleRankTier) {
  return (
    STYLE_RANK_THRESHOLDS.find((entry) => entry.tier === tier) ??
    STYLE_RANK_THRESHOLDS[0]
  );
}

export function styleTierIndex(tier: StyleRankTier): number {
  return STYLE_RANK_THRESHOLDS.findIndex((entry) => entry.tier === tier);
}

export function createInitialStyleRankState(): StyleRankState {
  return {
    points: 0,
    peakPoints: 0,
    tier: 'D',
    peakTier: 'D',
    decayGraceTimer: 0,
    recentActions: [],
    hitFreeStreak: 0,
    finisherCooldown: 0,
    finisherActiveTimer: 0,
    finisherReady: false,
    lastActionLabel: '',
    totalFinishersUsed: 0,
  };
}

export function canTriggerChronoFinisher(
  style: StyleRankState,
  hasNearbyStaggeredEnemy: boolean
): boolean {
  if (style.finisherCooldown > 0 || style.finisherActiveTimer > 0) return false;
  return style.tier === 'S' || style.tier === 'SSS' || hasNearbyStaggeredEnemy;
}

export function recordStyleAction(
  style: StyleRankState,
  actionKind: StyleActionKind,
  basePoints: number,
  label: string
): { tierChanged: boolean; newTier: StyleRankTier; pointsAdded: number } {
  const prevTier = style.tier;
  const repeatCount = style.recentActions.filter((k) => k === actionKind).length;
  const varietyMult =
    repeatCount === 0 ? 1.3 : repeatCount === 1 ? 1.0 : repeatCount === 2 ? 0.7 : 0.45;
  const streakBonus = Math.min(10, Math.floor(style.hitFreeStreak * 0.8));
  const pointsAdded = Math.max(4, Math.round(basePoints * varietyMult + streakBonus));

  style.points = Math.min(340, style.points + pointsAdded);
  style.hitFreeStreak += 1;
  style.decayGraceTimer = 4.2;
  style.recentActions = [...style.recentActions.slice(-4), actionKind];
  style.lastActionLabel = label;

  const newTier = computeStyleRankTier(style.points);
  style.tier = newTier;
  if (style.points > style.peakPoints) {
    style.peakPoints = style.points;
  }
  if (styleTierIndex(newTier) > styleTierIndex(style.peakTier)) {
    style.peakTier = newTier;
  }
  return {
    tierChanged: styleTierIndex(newTier) > styleTierIndex(prevTier),
    newTier,
    pointsAdded,
  };
}

export function penalizeStyleOnHit(style: StyleRankState): void {
  style.points = Math.max(0, style.points - 55);
  style.hitFreeStreak = 0;
  style.decayGraceTimer = Math.min(style.decayGraceTimer, 1.5);
  style.tier = computeStyleRankTier(style.points);
}

export function tickStyleRank(
  style: StyleRankState,
  dt: number,
  hasNearbyStaggeredEnemy: boolean
): void {
  if (style.finisherCooldown > 0) {
    style.finisherCooldown = Math.max(0, style.finisherCooldown - dt);
  }
  if (style.finisherActiveTimer > 0) {
    style.finisherActiveTimer = Math.max(0, style.finisherActiveTimer - dt);
  }
  if (style.decayGraceTimer > 0) {
    style.decayGraceTimer = Math.max(0, style.decayGraceTimer - dt);
  } else if (style.points > 0) {
    const decayRate =
      style.tier === 'SSS'
        ? 14
        : style.tier === 'S'
          ? 11
          : style.tier === 'A'
            ? 8.5
            : 6;
    style.points = Math.max(0, style.points - decayRate * dt);
    style.tier = computeStyleRankTier(style.points);
  }
  style.finisherReady = canTriggerChronoFinisher(style, hasNearbyStaggeredEnemy);
}

function hashSeedString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

export function getTodayDateKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface DailyBossPreset {
  chapter: CampaignChapterId;
  bossId: BossId;
  bossLabel: string;
  titleEn: string;
  titleVi: string;
  parTimeSec: number;
}

const DAILY_BOSS_PRESETS: readonly DailyBossPreset[] = [
  {
    chapter: 'chapter_1_helix',
    bossId: 'helix-04',
    bossLabel: 'HELIX-04',
    titleEn: 'HELIX CRUCIBLE PROTOCOL',
    titleVi: 'THỬ THÁCH LÒ RÈN HELIX-04',
    parTimeSec: 85,
  },
  {
    chapter: 'chapter_2_choir',
    bossId: 'the-choir',
    bossLabel: 'THE CHOIR',
    titleEn: 'RESONANCE SPIRE GAUNTLET',
    titleVi: 'THỬ THÁCH THÁP CỘNG HƯỞNG',
    parTimeSec: 95,
  },
  {
    chapter: 'chapter_3_curator',
    bossId: 'the-curator',
    bossLabel: 'THE CURATOR',
    titleEn: 'REDACTION VAULT BREACH',
    titleVi: 'THỬ THÁCH HẦM LƯU TRỮ',
    parTimeSec: 100,
  },
  {
    chapter: 'chapter_4_matron',
    bossId: 'matron-v',
    bossLabel: 'MATRON-V',
    titleEn: 'QUARANTINE SEVERANCE RUN',
    titleVi: 'THỬ THÁCH KHU CÁCH LY NULL',
    parTimeSec: 105,
  },
  {
    chapter: 'chapter_5_loom',
    bossId: 'warden-prime',
    bossLabel: 'WARDEN PRIME',
    titleEn: 'CHRONICLE LOOM APEX',
    titleVi: 'THỬ THÁCH ĐỈNH KHUNG THỜI GIAN',
    parTimeSec: 115,
  },
];

const DAILY_MUTATOR_POOL: ReadonlyArray<{
  key: keyof ChronoMutatorState;
  en: string;
  vi: string;
}> = [
  { key: 'hyperSpeed', en: 'HYPER PACE (1.3x Speed)', vi: 'SIÊU TỐC ĐỘ (1.3x Tốc độ)' },
  { key: 'glassCannon', en: 'GLASS CANNON (2x Dmg)', vi: 'PHÁO THỦY TINH (2x Sát thương)' },
  { key: 'zeroEchoCooldown', en: 'INFINITE ECHO (0s CD)', vi: 'VÔ HẠN DƯ ẢNH (0s Hồi)' },
  { key: 'ironmanNoHeal', en: 'IRONMAN PROTOCOL (No Heal)', vi: 'GIAO THỨC THIẾT GIÁP (Không Hồi Máu)' },
];

const DAILY_RELIC_POOL: ReadonlyArray<{ id: ChronoRelicId; label: string }> = [
  { id: 'relic_kinetic_overdrive', label: 'KINETIC OVERDRIVE' },
  { id: 'relic_temporal_siphon', label: 'TEMPORAL SIPHON' },
  { id: 'relic_echo_amplification', label: 'ECHO AMPLIFICATION' },
  { id: 'relic_aegis_capacitor', label: 'AEGIS CAPACITOR' },
  { id: 'relic_singularity_coil', label: 'SINGULARITY COIL' },
];

export function generateDailyTrialConfig(dateKey: string = getTodayDateKey()): DailyTrialConfig {
  const hash = hashSeedString(`AFTERFRAME-DAILY-${dateKey}`);
  const bossPreset = DAILY_BOSS_PRESETS[hash % DAILY_BOSS_PRESETS.length];
  const m1Idx = (hash >>> 4) % DAILY_MUTATOR_POOL.length;
  let m2Idx = (hash >>> 9) % DAILY_MUTATOR_POOL.length;
  if (m2Idx === m1Idx) {
    m2Idx = (m1Idx + 1) % DAILY_MUTATOR_POOL.length;
  }
  const m1 = DAILY_MUTATOR_POOL[m1Idx];
  const m2 = DAILY_MUTATOR_POOL[m2Idx];
  const relic = DAILY_RELIC_POOL[(hash >>> 13) % DAILY_RELIC_POOL.length];
  const compactDate = dateKey.replace(/-/g, '');

  return {
    dateKey,
    seedCode: `TRIAL-${compactDate}`,
    titleEn: bossPreset.titleEn,
    titleVi: bossPreset.titleVi,
    chapter: bossPreset.chapter,
    bossId: bossPreset.bossId,
    bossLabel: bossPreset.bossLabel,
    mutatorKeys: [m1.key, m2.key],
    mutatorLabelsEn: [m1.en, m2.en],
    mutatorLabelsVi: [m1.vi, m2.vi],
    startingRelicId: relic.id,
    startingRelicLabel: relic.label,
    parTimeSec: bossPreset.parTimeSec,
    targetScore: 4500,
  };
}

export function computeDailyTrialScore(
  elapsedSec: number,
  peakStylePoints: number,
  damageTaken: number,
  parTimeSec: number
): number {
  const baseClear = 2500;
  const speedBonus = Math.max(0, Math.round((parTimeSec - elapsedSec) * 28));
  const styleBonus = Math.round(peakStylePoints * 6.5);
  const damagePenalty = Math.min(1200, Math.round(damageTaken * 8));
  return Math.max(500, baseClear + speedBonus + styleBonus - damagePenalty);
}

const DAILY_TRIAL_STORAGE_KEY = 'afterframe_daily_trial_records_v1';

export function loadDailyTrialRecords(): Record<string, DailyTrialRecord> {
  if (typeof globalThis.localStorage === 'undefined') return {};
  try {
    const raw = globalThis.localStorage.getItem(DAILY_TRIAL_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, DailyTrialRecord>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getDailyTrialRecord(dateKey: string = getTodayDateKey()): DailyTrialRecord | null {
  const all = loadDailyTrialRecords();
  return all[dateKey] ?? null;
}

export function saveDailyTrialRecord(record: DailyTrialRecord): DailyTrialRecord {
  const all = loadDailyTrialRecords();
  const prev = all[record.dateKey];
  const merged: DailyTrialRecord = prev
    ? {
        dateKey: record.dateKey,
        seedCode: record.seedCode,
        bestScore: Math.max(prev.bestScore, record.bestScore),
        bestTimeSec: Math.min(prev.bestTimeSec, record.bestTimeSec),
        peakRank:
          styleTierIndex(record.peakRank) >= styleTierIndex(prev.peakRank)
            ? record.peakRank
            : prev.peakRank,
        completedCount: prev.completedCount + 1,
        updatedAtIso: record.updatedAtIso,
      }
    : record;

  all[record.dateKey] = merged;
  if (typeof globalThis.localStorage !== 'undefined') {
    try {
      globalThis.localStorage.setItem(DAILY_TRIAL_STORAGE_KEY, JSON.stringify(all));
    } catch {
      // Ignore quota errors
    }
  }
  return merged;
}

export function createInitialAscensionState(): AscensionRuntimeState {
  return {
    style: createInitialStyleRankState(),
    dailyTrialActive: false,
    dailyTrialConfig: null,
    dailyTrialElapsedSec: 0,
    dailyTrialScore: 0,
    dailyTrialCompleted: false,
    lastDailyRecord: getDailyTrialRecord(),
    finisherRiftTimer: 0,
    finisherRiftX: 0,
    finisherRiftZ: 0,
  };
}

export const PHOTO_FILTER_PRESETS: ReadonlyArray<{
  id: PhotoFilterId;
  labelEn: string;
  labelVi: string;
  cssFilter: string;
}> = [
  { id: 'standard', labelEn: 'STANDARD', labelVi: 'TIÊU CHUẨN', cssFilter: 'none' },
  {
    id: 'noir',
    labelEn: 'NOIR CONTRAST',
    labelVi: 'PHIM ĐEN TRẮNG',
    cssFilter: 'grayscale(1) contrast(1.25) brightness(1.04)',
  },
  {
    id: 'cyber_cyan',
    labelEn: 'CYBER CYAN',
    labelVi: 'LAM KỸ THUẬT',
    cssFilter: 'saturate(1.38) contrast(1.1) hue-rotate(-10deg)',
  },
  {
    id: 'paradox_violet',
    labelEn: 'PARADOX VIOLET',
    labelVi: 'TÍM NGHỊCH LÝ',
    cssFilter: 'saturate(1.45) contrast(1.12) hue-rotate(34deg)',
  },
  {
    id: 'golden_hour',
    labelEn: 'GOLDEN HOUR',
    labelVi: 'HOÀNG HÔN KIM',
    cssFilter: 'sepia(0.32) saturate(1.4) contrast(1.08) brightness(1.05)',
  },
];

export function getPhotoFilterCss(id: PhotoFilterId): string {
  return PHOTO_FILTER_PRESETS.find((f) => f.id === id)?.cssFilter ?? 'none';
}

export function createInitialPhotoModeState(): PhotoModeState {
  return {
    active: false,
    hideUi: false,
    yawOffset: 0.45,
    pitchOffset: 0.16,
    distance: 7.4,
    fov: 50,
    filter: 'standard',
    showDrone: true,
  };
}
