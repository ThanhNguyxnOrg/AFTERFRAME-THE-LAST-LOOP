import { evaluateCombatRank } from './combat-flow.ts';
import type {
  BossId,
  CampaignChapterId,
  CombatMasteryGrade,
  CombatMasteryLedgerMap,
  CombatMasteryRecord,
  MasteryBountyKind,
  MasteryTargetId,
  PlayerState,
  RunSummary,
} from './types.ts';

// ============================================================================
// v3.9.0 — TEMPORAL SLIP-TIME (MICRO TIME DILATION) & SOVEREIGN MASTERY LEDGER
// Pure, deterministic, Zero-GC O(1) combat mastery & time-dilation engine
// ============================================================================

export const TEMPORAL_SLIP_CONFIG = {
  baseDurationSec: 1.35,
  hostileTimeScale: 0.38,
  cooldownSec: 2.4,
} as const;

export const VALID_MASTERY_GRADES: readonly CombatMasteryGrade[] = [
  'C',
  'B',
  'A',
  'S',
  'S+',
] as const;

const GRADE_RANK_VALUE: Readonly<Record<CombatMasteryGrade, number>> = Object.freeze({
  C: 1,
  B: 2,
  A: 3,
  S: 4,
  'S+': 5,
});

export interface MasteryTargetDefinition {
  readonly id: MasteryTargetId;
  readonly category: 'sector' | 'boss';
  readonly code: string;
  readonly titleEn: string;
  readonly titleVi: string;
  readonly subtitleEn: string;
  readonly subtitleVi: string;
  readonly chapter: CampaignChapterId;
  readonly bossId: BossId | null;
}

export const MASTERY_TARGETS: readonly MasteryTargetDefinition[] = Object.freeze([
  {
    id: 'sector_prologue',
    category: 'sector',
    code: 'SEC-00',
    titleEn: 'Prologue · Calibration Bay 04',
    titleVi: 'Mở Đầu · Khoang Hiệu Chuẩn 04',
    subtitleEn: '3-Stage Echo Gate & Security Proxies',
    subtitleVi: 'Cổng Echo 3 Bước & Đội Cận Vệ',
    chapter: 'prologue',
    bossId: null,
  },
  {
    id: 'sector_ch1_helix',
    category: 'sector',
    code: 'SEC-01',
    titleEn: 'Chapter I · Containment Core',
    titleVi: 'Chương I · Lõi Phong Tỏa',
    subtitleEn: 'Outer Ring Breach & Helical Lock',
    subtitleVi: 'Đột Kích Vành Ngoài & Khóa Xoắn Ốc',
    chapter: 'chapter_1_helix',
    bossId: 'helix-04',
  },
  {
    id: 'sector_ch2_choir',
    category: 'sector',
    code: 'SEC-02',
    titleEn: 'Chapter II · Acoustic Biodome',
    titleVi: 'Chương II · Vòm Cộng Hưởng',
    subtitleEn: '3-Node Harmonic Synchronization',
    subtitleVi: 'Đồng Pha 3 Trụ Cộng Hưởng Âm Học',
    chapter: 'chapter_2_choir',
    bossId: 'the-choir',
  },
  {
    id: 'sector_ch3_curator',
    category: 'sector',
    code: 'SEC-03',
    titleEn: 'Chapter III · Deep Memory Vaults',
    titleVi: 'Chương III · Hầm Ký Ức Sâu',
    subtitleEn: 'Reconstructed Traces & False Decoys',
    subtitleVi: 'Dấu Vết Tái Hiện & Ảo Ảnh Mồi Nhử',
    chapter: 'chapter_3_curator',
    bossId: 'the-curator',
  },
  {
    id: 'sector_ch4_matron',
    category: 'sector',
    code: 'SEC-04',
    titleEn: 'Chapter IV · Surgical Quarantine',
    titleVi: 'Chương IV · Khu Cách Ly Phẫu Thuật',
    subtitleEn: 'Flux Siphon & Chrono Sever Zones',
    subtitleVi: 'Hút Năng Lượng & Vùng Cắt Thời Không',
    chapter: 'chapter_4_matron',
    bossId: 'matron-v',
  },
  {
    id: 'sector_ch5_loom',
    category: 'sector',
    code: 'SEC-05',
    titleEn: 'Chapter V · Chronicle Loom Core',
    titleVi: 'Chương V · Lõi Khung Cửi Biên Niên',
    subtitleEn: 'Sovereign Sanctum & Final Directive',
    subtitleVi: 'Thánh Điện Thống Lĩnh & Phán Quyết Cuối',
    chapter: 'chapter_5_loom',
    bossId: 'warden-prime',
  },
  {
    id: 'boss_helix_04',
    category: 'boss',
    code: 'WRD-01',
    titleEn: 'Marshal HELIX-04',
    titleVi: 'Thống Lĩnh HELIX-04',
    subtitleEn: 'Vector Ram · Helical Sweep · Bastion Core',
    subtitleVi: 'Húc Vector · Quét Xoắn Ốc · Lõi Pháo Đài',
    chapter: 'chapter_1_helix',
    bossId: 'helix-04',
  },
  {
    id: 'boss_the_choir',
    category: 'boss',
    code: 'WRD-02',
    titleEn: 'THE CHOIR',
    titleVi: 'DÀN ĐỒNG CA (THE CHOIR)',
    subtitleEn: 'Harmonic Nodes · Acoustic Wave · Chime Core',
    subtitleVi: 'Nút Hòa Âm · Sóng Cộng Hưởng · Lõi Chuông',
    chapter: 'chapter_2_choir',
    bossId: 'the-choir',
  },
  {
    id: 'boss_the_curator',
    category: 'boss',
    code: 'WRD-03',
    titleEn: 'THE CURATOR',
    titleVi: 'KẺ GIÁM TUYỂN (THE CURATOR)',
    subtitleEn: 'Archive Lance · Decoys · Singularity Core',
    subtitleVi: 'Thương Lưu Trữ · Phân Thân · Lõi Kỳ Dị',
    chapter: 'chapter_3_curator',
    bossId: 'the-curator',
  },
  {
    id: 'boss_matron_v',
    category: 'boss',
    code: 'WRD-04',
    titleEn: 'MATRON-V · The Surgeon',
    titleVi: 'MATRON-V · Bác Sĩ Phẫu Thuật',
    subtitleEn: 'Surgical Incision · Chrono Sever · Siphon Core',
    subtitleVi: 'Nhát Cắt Giải Phẫu · Đoạn Tuyệt · Lõi Hấp Thụ',
    chapter: 'chapter_4_matron',
    bossId: 'matron-v',
  },
  {
    id: 'boss_warden_prime',
    category: 'boss',
    code: 'WRD-05',
    titleEn: 'WARDEN PRIME',
    titleVi: 'WARDEN PRIME · Kiến Trúc Sư Tối Cao',
    subtitleEn: 'Directive Lance · Convergence Grid · Purge Wave',
    subtitleVi: 'Thương Chỉ Thị · Lưới Hội Tụ · Sóng Thanh Trừng',
    chapter: 'chapter_5_loom',
    bossId: 'warden-prime',
  },
  {
    id: 'boss_echo_zero',
    category: 'boss',
    code: 'WRD-06',
    titleEn: 'ECHO-ZERO · Mirror-Sera',
    titleVi: 'ECHO-ZERO · Bản Thể Gương Sera',
    subtitleEn: 'Paradox Blink · Rail Lance · Twin Pincer',
    subtitleVi: 'Chớp Nghịch Lý · Thương Điện Từ · Gọng Kìm Đôi',
    chapter: 'chapter_5_loom',
    bossId: 'echo-zero',
  },
]);

export const VALID_MASTERY_TARGET_IDS: readonly MasteryTargetId[] = Object.freeze(
  MASTERY_TARGETS.map((t) => t.id)
);

const VALID_TARGET_SET: ReadonlySet<string> = new Set(VALID_MASTERY_TARGET_IDS);

export function isValidMasteryTargetId(id: unknown): id is MasteryTargetId {
  return typeof id === 'string' && VALID_TARGET_SET.has(id);
}

export function isValidCombatMasteryGrade(g: unknown): g is CombatMasteryGrade {
  return g === 'C' || g === 'B' || g === 'A' || g === 'S' || g === 'S+';
}

export function isSRankOrAbove(grade: CombatMasteryGrade | null | undefined): boolean {
  return grade === 'S' || grade === 'S+';
}

export interface MasterySealTierSpec {
  readonly tier: 0 | 1 | 2 | 3 | 4;
  readonly minClaimedSeals: number;
  readonly titleEn: string;
  readonly titleVi: string;
  readonly allDamageMult: number;
  readonly bonusMaxWard: number;
  readonly overdriveChargeMult: number;
  readonly bonusSlipDurationSec: number;
}

export const MASTERY_SEAL_TIERS: readonly MasterySealTierSpec[] = Object.freeze([
  Object.freeze({
    tier: 0,
    minClaimedSeals: 0,
    titleEn: 'UNSEALED OPERATIVE',
    titleVi: 'ĐẶC VỤ KHỞI NGUYÊN',
    allDamageMult: 1.0,
    bonusMaxWard: 0,
    overdriveChargeMult: 1.0,
    bonusSlipDurationSec: 0,
  }),
  Object.freeze({
    tier: 1,
    minClaimedSeals: 2,
    titleEn: 'SEAL I · BRONZE CHRONOMANCER',
    titleVi: 'ẤN I · ĐỒNG THỜI KHÔNG',
    allDamageMult: 1.04,
    bonusMaxWard: 4,
    overdriveChargeMult: 1.08,
    bonusSlipDurationSec: 0.15,
  }),
  Object.freeze({
    tier: 2,
    minClaimedSeals: 5,
    titleEn: 'SEAL II · SILVER VANGUARD',
    titleVi: 'ẤN II · BẠC TIÊN PHONG',
    allDamageMult: 1.08,
    bonusMaxWard: 10,
    overdriveChargeMult: 1.14,
    bonusSlipDurationSec: 0.3,
  }),
  Object.freeze({
    tier: 3,
    minClaimedSeals: 9,
    titleEn: 'SEAL III · GOLD ARBITER',
    titleVi: 'ẤN III · VÀNG PHÁN QUYẾT',
    allDamageMult: 1.12,
    bonusMaxWard: 16,
    overdriveChargeMult: 1.2,
    bonusSlipDurationSec: 0.45,
  }),
  Object.freeze({
    tier: 4,
    minClaimedSeals: 12,
    titleEn: 'SEAL IV · SOVEREIGN CHRONOMANCER Ω',
    titleVi: 'ẤN IV · CHÍ TÔN THỜI KHÔNG Ω',
    allDamageMult: 1.16,
    bonusMaxWard: 24,
    overdriveChargeMult: 1.28,
    bonusSlipDurationSec: 0.6,
  }),
]);

export interface MasterySealComputedSummary extends MasterySealTierSpec {
  readonly claimedSealsCount: number;
  readonly sRankUnlockedCount: number;
  readonly sPlusUnlockedCount: number;
  readonly hitlessUnlockedCount: number;
  readonly pendingBountyCount: number;
  readonly totalTargetsCount: number;
  readonly nextTierMinSeals: number | null;
}

const ZERO_MASTERY_SUMMARY: MasterySealComputedSummary = Object.freeze({
  ...MASTERY_SEAL_TIERS[0],
  claimedSealsCount: 0,
  sRankUnlockedCount: 0,
  sPlusUnlockedCount: 0,
  hitlessUnlockedCount: 0,
  pendingBountyCount: 0,
  totalTargetsCount: MASTERY_TARGETS.length,
  nextTierMinSeals: MASTERY_SEAL_TIERS[1].minClaimedSeals,
});

export function computeMasterySealModifiers(
  ledger: CombatMasteryLedgerMap | null | undefined
): MasterySealComputedSummary {
  if (!ledger) return ZERO_MASTERY_SUMMARY;

  let claimedSealsCount = 0;
  let sRankUnlockedCount = 0;
  let sPlusUnlockedCount = 0;
  let hitlessUnlockedCount = 0;
  let pendingBountyCount = 0;

  for (let i = 0; i < VALID_MASTERY_TARGET_IDS.length; i++) {
    const id = VALID_MASTERY_TARGET_IDS[i];
    const rec = ledger[id];
    if (!rec) continue;
    const hasSRank = rec.bestGrade === 'S' || rec.bestGrade === 'S+';
    if (hasSRank) {
      sRankUnlockedCount += 1;
      if (rec.bestGrade === 'S+') sPlusUnlockedCount += 1;
      if (rec.sRankRewardClaimed) {
        claimedSealsCount += 1;
      } else {
        pendingBountyCount += 1;
      }
    }
    if (rec.hitless) {
      hitlessUnlockedCount += 1;
      if (rec.hitlessRewardClaimed) {
        claimedSealsCount += 1;
      } else {
        pendingBountyCount += 1;
      }
    }
  }

  if (
    claimedSealsCount === 0 &&
    sRankUnlockedCount === 0 &&
    hitlessUnlockedCount === 0 &&
    pendingBountyCount === 0
  ) {
    return ZERO_MASTERY_SUMMARY;
  }

  let matchedSpec = MASTERY_SEAL_TIERS[0];
  let nextTierMinSeals: number | null = MASTERY_SEAL_TIERS[1].minClaimedSeals;
  for (let t = MASTERY_SEAL_TIERS.length - 1; t >= 0; t--) {
    if (claimedSealsCount >= MASTERY_SEAL_TIERS[t].minClaimedSeals) {
      matchedSpec = MASTERY_SEAL_TIERS[t];
      nextTierMinSeals =
        t + 1 < MASTERY_SEAL_TIERS.length ? MASTERY_SEAL_TIERS[t + 1].minClaimedSeals : null;
      break;
    }
  }

  return {
    ...matchedSpec,
    claimedSealsCount,
    sRankUnlockedCount,
    sPlusUnlockedCount,
    hitlessUnlockedCount,
    pendingBountyCount,
    totalTargetsCount: MASTERY_TARGETS.length,
    nextTierMinSeals,
  };
}

// ============================================================================
// TEMPORAL SLIP-TIME (PERFECT DODGE MICRO TIME DILATION)
// ============================================================================

export function tryTriggerTemporalSlip(
  player: PlayerState,
  bonusDurationSec = 0
): { triggered: boolean; durationSec: number } {
  const cd = player.temporalSlipCooldown ?? 0;
  if (cd > 0) {
    return { triggered: false, durationSec: 0 };
  }
  const safeBonus = Number.isFinite(bonusDurationSec) ? Math.max(0, Math.min(1.0, bonusDurationSec)) : 0;
  const durationSec = Number((TEMPORAL_SLIP_CONFIG.baseDurationSec + safeBonus).toFixed(2));
  player.temporalSlipTimer = Math.max(player.temporalSlipTimer ?? 0, durationSec);
  player.temporalSlipMaxDuration = durationSec;
  player.temporalSlipCooldown = TEMPORAL_SLIP_CONFIG.cooldownSec;
  return { triggered: true, durationSec };
}

export function tickTemporalSlipTimers(player: PlayerState, realDt: number): void {
  if (!Number.isFinite(realDt) || realDt <= 0) return;
  if ((player.temporalSlipTimer ?? 0) > 0) {
    player.temporalSlipTimer = Math.max(0, (player.temporalSlipTimer ?? 0) - realDt);
    if (player.temporalSlipTimer === 0) {
      player.temporalSlipMaxDuration = 0;
    }
  }
  if ((player.temporalSlipCooldown ?? 0) > 0) {
    player.temporalSlipCooldown = Math.max(0, (player.temporalSlipCooldown ?? 0) - realDt);
  }
}

export function computeEffectiveHostileTimeScale(
  overdriveEnemyScale: number,
  temporalSlipTimer: number | undefined
): number {
  const baseScale = Number.isFinite(overdriveEnemyScale) ? Math.max(0.05, overdriveEnemyScale) : 1;
  if ((temporalSlipTimer ?? 0) > 0) {
    return Math.min(baseScale, TEMPORAL_SLIP_CONFIG.hostileTimeScale);
  }
  return baseScale;
}

// ============================================================================
// LIVE TACTICAL RANK FORECAST (IN-COMBAT REAL-TIME S+ PROJECTION)
// ============================================================================

export interface LiveRankForecast {
  grade: CombatMasteryGrade;
  score: number;
  hitless: boolean;
  nextGrade: CombatMasteryGrade | null;
  pointsToNext: number;
}

export function computeLiveTacticalRankForecast(input: {
  elapsedTime: number;
  damageTaken: number;
  parriesLanded: number;
  perfectDodges: number;
  vulnerableHits: number;
  convergencesTriggered: number;
  relaysUsed: number;
}): LiveRankForecast {
  const projectedSummary: RunSummary = {
    outcome: 'victory',
    chapter: 'prologue',
    bossId: null,
    selectedEnding: null,
    elapsedTime: Math.max(0, input.elapsedTime || 0),
    enemiesDefeated: 1,
    totalEnemies: 1,
    damageDealt: 0,
    damageTaken: Math.max(0, Math.round(input.damageTaken || 0)),
    parriesLanded: Math.max(0, input.parriesLanded || 0),
    perfectDodges: Math.max(0, input.perfectDodges || 0),
    vulnerableHits: Math.max(0, input.vulnerableHits || 0),
    convergencesTriggered: Math.max(0, input.convergencesTriggered || 0),
    relaysUsed: Math.max(0, input.relaysUsed || 0),
    remainingTargetHp: 0,
  };
  const evaluated = evaluateCombatRank(projectedSummary);
  let nextGrade: CombatMasteryGrade | null = null;
  let pointsToNext = 0;

  if (evaluated.grade === 'C') {
    nextGrade = 'B';
    pointsToNext = Math.max(1, 48 - evaluated.score);
  } else if (evaluated.grade === 'B') {
    nextGrade = 'A';
    pointsToNext = Math.max(1, 72 - evaluated.score);
  } else if (evaluated.grade === 'A') {
    nextGrade = 'S';
    pointsToNext = Math.max(1, 95 - evaluated.score);
  } else if (evaluated.grade === 'S') {
    nextGrade = 'S+';
    pointsToNext = Math.max(1, 120 - evaluated.score);
  }

  return {
    grade: evaluated.grade,
    score: evaluated.score,
    hitless: evaluated.hitless,
    nextGrade,
    pointsToNext,
  };
}

// ============================================================================
// MASTERY LEDGER RECORDING, BOUNTY CLAIMING & SAVE V2 SANITIZATION
// ============================================================================

export function mapChapterToSectorMasteryId(chapter: CampaignChapterId): MasteryTargetId {
  switch (chapter) {
    case 'prologue':
      return 'sector_prologue';
    case 'chapter_1_helix':
      return 'sector_ch1_helix';
    case 'chapter_2_choir':
      return 'sector_ch2_choir';
    case 'chapter_3_curator':
      return 'sector_ch3_curator';
    case 'chapter_4_matron':
      return 'sector_ch4_matron';
    case 'chapter_5_loom':
      return 'sector_ch5_loom';
  }
}

export function mapBossIdToMasteryTargetId(bossId: BossId | string | null | undefined): MasteryTargetId | null {
  switch (bossId) {
    case 'helix-04':
      return 'boss_helix_04';
    case 'the-choir':
      return 'boss_the_choir';
    case 'the-curator':
      return 'boss_the_curator';
    case 'matron-v':
      return 'boss_matron_v';
    case 'warden-prime':
      return 'boss_warden_prime';
    case 'echo-zero':
      return 'boss_echo_zero';
    default:
      return null;
  }
}

export function sanitizeCombatMasteryLedger(raw: unknown): CombatMasteryLedgerMap {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const src = raw as Record<string, unknown>;
  const out: CombatMasteryLedgerMap = {};
  for (let i = 0; i < VALID_MASTERY_TARGET_IDS.length; i++) {
    const id = VALID_MASTERY_TARGET_IDS[i];
    const item = src[id];
    if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
    const rec = item as Record<string, unknown>;
    if (!isValidCombatMasteryGrade(rec.bestGrade)) continue;
    const bestScore =
      typeof rec.bestScore === 'number' && Number.isFinite(rec.bestScore)
        ? Math.max(0, Math.min(200, Math.round(rec.bestScore)))
        : 40;
    const bestTimeSec =
      typeof rec.bestTimeSec === 'number' && Number.isFinite(rec.bestTimeSec) && rec.bestTimeSec >= 0
        ? Math.round(Math.min(99999, rec.bestTimeSec) * 100) / 100
        : 0;
    const clears =
      typeof rec.clears === 'number' && Number.isFinite(rec.clears) && rec.clears >= 1
        ? Math.min(99999, Math.floor(rec.clears))
        : 1;
    const hitless = Boolean(rec.hitless);
    const hasSRank = rec.bestGrade === 'S' || rec.bestGrade === 'S+';
    out[id] = {
      bestGrade: rec.bestGrade,
      bestScore,
      bestTimeSec,
      hitless,
      clears,
      sRankRewardClaimed: hasSRank ? Boolean(rec.sRankRewardClaimed) : false,
      hitlessRewardClaimed: hitless ? Boolean(rec.hitlessRewardClaimed) : false,
    };
  }
  return out;
}

export function cloneCombatMasteryLedger(
  ledger: CombatMasteryLedgerMap | null | undefined
): CombatMasteryLedgerMap {
  if (!ledger) return {};
  const out: CombatMasteryLedgerMap = {};
  for (let i = 0; i < VALID_MASTERY_TARGET_IDS.length; i++) {
    const id = VALID_MASTERY_TARGET_IDS[i];
    const rec = ledger[id];
    if (rec) {
      out[id] = { ...rec };
    }
  }
  return out;
}

export interface MasteryVictoryRecordOutcome {
  ledger: CombatMasteryLedgerMap;
  grade: CombatMasteryGrade;
  score: number;
  hitless: boolean;
  isNewBestGrade: boolean;
  newlyUnlockedBounties: number;
}

export function recordCombatMasteryVictory(
  currentLedger: CombatMasteryLedgerMap | null | undefined,
  targetIds: readonly MasteryTargetId[],
  summary: RunSummary
): MasteryVictoryRecordOutcome {
  const ledger = cloneCombatMasteryLedger(currentLedger);
  if (summary.outcome !== 'victory' || targetIds.length === 0) {
    const rank = evaluateCombatRank(summary);
    return {
      ledger,
      grade: rank.grade,
      score: rank.score,
      hitless: rank.hitless,
      isNewBestGrade: false,
      newlyUnlockedBounties: 0,
    };
  }

  const evaluated = evaluateCombatRank(summary);
  const safeTime =
    typeof summary.elapsedTime === 'number' && Number.isFinite(summary.elapsedTime) && summary.elapsedTime >= 0
      ? Math.round(summary.elapsedTime * 100) / 100
      : 0;

  let isNewBestGrade = false;
  let newlyUnlockedBounties = 0;

  for (let i = 0; i < targetIds.length; i++) {
    const targetId = targetIds[i];
    if (!isValidMasteryTargetId(targetId)) continue;
    const prev = ledger[targetId];
    if (!prev) {
      isNewBestGrade = true;
      if (isSRankOrAbove(evaluated.grade)) newlyUnlockedBounties += 1;
      if (evaluated.hitless) newlyUnlockedBounties += 1;
      ledger[targetId] = {
        bestGrade: evaluated.grade,
        bestScore: evaluated.score,
        bestTimeSec: safeTime,
        hitless: evaluated.hitless,
        clears: 1,
        sRankRewardClaimed: false,
        hitlessRewardClaimed: false,
      };
    } else {
      const prevHadS = isSRankOrAbove(prev.bestGrade);
      const nextHasS = isSRankOrAbove(evaluated.grade);
      if (!prevHadS && nextHasS) {
        newlyUnlockedBounties += 1;
      }
      if (!prev.hitless && evaluated.hitless) {
        newlyUnlockedBounties += 1;
      }
      const nextRankVal = GRADE_RANK_VALUE[evaluated.grade];
      const prevRankVal = GRADE_RANK_VALUE[prev.bestGrade];
      if (nextRankVal > prevRankVal) {
        isNewBestGrade = true;
      }
      const bestGrade = nextRankVal >= prevRankVal ? evaluated.grade : prev.bestGrade;
      const bestScore = Math.max(prev.bestScore, evaluated.score);
      const bestTimeSec =
        prev.bestTimeSec > 0 && safeTime > 0
          ? Math.min(prev.bestTimeSec, safeTime)
          : safeTime > 0
            ? safeTime
            : prev.bestTimeSec;
      ledger[targetId] = {
        bestGrade,
        bestScore,
        bestTimeSec,
        hitless: prev.hitless || evaluated.hitless,
        clears: prev.clears + 1,
        sRankRewardClaimed: prev.sRankRewardClaimed,
        hitlessRewardClaimed: prev.hitlessRewardClaimed,
      };
    }
  }

  return {
    ledger,
    grade: evaluated.grade,
    score: evaluated.score,
    hitless: evaluated.hitless,
    isNewBestGrade,
    newlyUnlockedBounties,
  };
}

export function claimCombatMasteryBounty(
  currentLedger: CombatMasteryLedgerMap | null | undefined,
  targetId: MasteryTargetId,
  kind: MasteryBountyKind
): { ledger: CombatMasteryLedgerMap; claimed: boolean; fragmentsAwarded: number } {
  const ledger = cloneCombatMasteryLedger(currentLedger);
  if (!isValidMasteryTargetId(targetId)) {
    return { ledger, claimed: false, fragmentsAwarded: 0 };
  }
  const rec = ledger[targetId];
  if (!rec) {
    return { ledger, claimed: false, fragmentsAwarded: 0 };
  }
  if (kind === 's_rank') {
    if (!isSRankOrAbove(rec.bestGrade) || rec.sRankRewardClaimed) {
      return { ledger, claimed: false, fragmentsAwarded: 0 };
    }
    ledger[targetId] = { ...rec, sRankRewardClaimed: true };
    return { ledger, claimed: true, fragmentsAwarded: 1 };
  }
  if (kind === 'hitless') {
    if (!rec.hitless || rec.hitlessRewardClaimed) {
      return { ledger, claimed: false, fragmentsAwarded: 0 };
    }
    ledger[targetId] = { ...rec, hitlessRewardClaimed: true };
    return { ledger, claimed: true, fragmentsAwarded: 1 };
  }
  return { ledger, claimed: false, fragmentsAwarded: 0 };
}

export function claimAllReadyMasteryBounties(
  currentLedger: CombatMasteryLedgerMap | null | undefined
): { ledger: CombatMasteryLedgerMap; claimedCount: number; fragmentsAwarded: number } {
  const ledger = cloneCombatMasteryLedger(currentLedger);
  let claimedCount = 0;

  for (let i = 0; i < VALID_MASTERY_TARGET_IDS.length; i++) {
    const id = VALID_MASTERY_TARGET_IDS[i];
    const rec = ledger[id];
    if (!rec) continue;
    let updated = rec;
    if (isSRankOrAbove(updated.bestGrade) && !updated.sRankRewardClaimed) {
      updated = { ...updated, sRankRewardClaimed: true };
      claimedCount += 1;
    }
    if (updated.hitless && !updated.hitlessRewardClaimed) {
      updated = { ...updated, hitlessRewardClaimed: true };
      claimedCount += 1;
    }
    if (updated !== rec) {
      ledger[id] = updated;
    }
  }

  return {
    ledger,
    claimedCount,
    fragmentsAwarded: claimedCount,
  };
}
