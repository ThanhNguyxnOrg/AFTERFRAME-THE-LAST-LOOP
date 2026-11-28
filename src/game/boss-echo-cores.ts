/**
 * Boss Echo Cores (`Lõi Vọng Âm Thống Lĩnh`) & Harmonic Confluence (`Hợp Lưu LYS-04 × Lõi Boss`).
 * Implements `design/gdd/boss-echo-cores-and-synergy.md` &
 * `design/gdd/boss-core-transcendence-and-confluence.md` following `.claude/rules/gameplay-code.md`.
 */

import type {
  AppLocale,
  BossEchoCoreId,
  CampaignChapterId,
  ChronicleLoomEndingId,
  ChronoConfluenceState,
  ConfluenceDoctrineId,
  SentinelProtocolMode,
  WeaponId,
} from './types.ts';

export const VALID_BOSS_ECHO_CORE_IDS: readonly BossEchoCoreId[] = [
  'core_helix_bastion',
  'core_choir_chime',
  'core_curator_singularity',
  'core_matron_siphon',
  'core_warden_sovereign',
];

export const BOSS_CORE_OMEGA_COST = 2;
export const CONFLUENCE_BURST_COOLDOWN_SEC = 14.0;

export const CONFLUENCE_CHARGE_GAINS = {
  lightHit: 8,
  heavyHit: 14,
  parry: 22,
  convergence: 25,
  weakpointOrExecute: 30,
} as const;

export interface BossEchoCoreSpec {
  id: BossEchoCoreId;
  bossChapter: CampaignChapterId;
  bossName: string;
  synthesisCost: number;
  crystalHex: number;
  ringHex: number;
  accentCss: string;
  shortBadgeEn: string;
  shortBadgeVi: string;
  titleEn: string;
  titleVi: string;
  roleEn: string;
  roleVi: string;
  omegaRoleEn: string;
  omegaRoleVi: string;
  unlockSourceEn: string;
  unlockSourceVi: string;
  summaryEn: string;
  summaryVi: string;
  omegaSummaryEn: string;
  omegaSummaryVi: string;
  bonusWard: number;
  allDamageMultiplier: number;
  echoConvergenceMultiplier: number;
  weakpointDamageMultiplier: number;
  overdriveChargeMultiplier: number;
  naniteHealMultiplier: number;
  parryLanceRadius: number;
  parryLanceDamage: number;
  parryLanceStagger: number;
  parryWardRestore: number;
  echoPulseRadius: number;
  echoPulseDamage: number;
  echoPulseStagger: number;
  echoPulseTwinSync: number;
  heavyPullRadius: number;
  heavyPullStep: number;
  weakpointExtendSec: number;
  siphonHp: number;
  siphonWard: number;
  siphonCooldownSec: number;
  overdriveNovaRadius: number;
  overdriveNovaDamage: number;
  overdriveNovaStagger: number;
}

export interface BossCoreOmegaOverride {
  bonusWard: number;
  allDamageMultiplier: number;
  echoConvergenceMultiplier: number;
  weakpointDamageMultiplier: number;
  overdriveChargeMultiplier: number;
  naniteHealMultiplier: number;
  parryLanceRadius: number;
  parryLanceDamage: number;
  parryLanceStagger: number;
  parryWardRestore: number;
  echoPulseRadius: number;
  echoPulseDamage: number;
  echoPulseStagger: number;
  echoPulseTwinSync: number;
  heavyPullRadius: number;
  heavyPullStep: number;
  weakpointExtendSec: number;
  siphonHp: number;
  siphonWard: number;
  siphonCooldownSec: number;
  overdriveNovaRadius: number;
  overdriveNovaDamage: number;
  overdriveNovaStagger: number;
}

export const BOSS_ECHO_CORES: Record<BossEchoCoreId, BossEchoCoreSpec> = {
  core_helix_bastion: {
    id: 'core_helix_bastion',
    bossChapter: 'chapter_1_helix',
    bossName: 'HELIX-04',
    synthesisCost: 3,
    crystalHex: 0xf59e0b,
    ringHex: 0xfde047,
    accentCss: '#fbbf24',
    shortBadgeEn: 'HELIX-04',
    shortBadgeVi: 'HELIX-04',
    titleEn: 'AEGIS BASTION CORE',
    titleVi: 'LÕI PHÁO ĐÀI AEGIS',
    roleEn: '+20 WARD & PARRY COUNTER-LANCE',
    roleVi: '+20 GIÁP CHRONO & PHẢN KÍCH ĐỠ ĐÒN',
    omegaRoleEn: 'Ω +28 WARD & 38 DMG HELICAL LANCE',
    omegaRoleVi: 'Ω +28 GIÁP CHRONO & GIÁO XOẮN 38 ST',
    unlockSourceEn: 'Clear Ch.I (HELIX-04) or Synthesize (3◆)',
    unlockSourceVi: 'Vượt Ch.I (HELIX-04) hoặc Tổng hợp (3◆)',
    summaryEn:
      '+20 Max Chrono Ward. Perfect Parry [Q] unleashes a 4.0m Helical Counter-Lance (28 DMG, +24 Stagger) and restores +10 Ward.',
    summaryVi:
      '+20 Giáp Chrono tối đa. Đỡ Đòn Hoàn Hảo [Q] phóng Xung Giáo Xoắn 4.0m (28 ST, +24 Choáng) và hồi ngay +10 Giáp Chrono.',
    omegaSummaryEn:
      'OMEGA: +28 Max Chrono Ward. Perfect Parry [Q] unleashes a 4.6m Helical Lance (38 DMG, +32 Stagger) and restores +15 Ward.',
    omegaSummaryVi:
      'OMEGA: +28 Giáp Chrono tối đa. Đỡ Đòn [Q] phóng Xung Giáo Xoắn 4.6m (38 ST, +32 Choáng) và hồi ngay +15 Giáp Chrono.',
    bonusWard: 20,
    allDamageMultiplier: 1.0,
    echoConvergenceMultiplier: 1.0,
    weakpointDamageMultiplier: 1.0,
    overdriveChargeMultiplier: 1.0,
    naniteHealMultiplier: 1.0,
    parryLanceRadius: 4.0,
    parryLanceDamage: 28,
    parryLanceStagger: 24,
    parryWardRestore: 10,
    echoPulseRadius: 0,
    echoPulseDamage: 0,
    echoPulseStagger: 0,
    echoPulseTwinSync: 0,
    heavyPullRadius: 0,
    heavyPullStep: 0,
    weakpointExtendSec: 0,
    siphonHp: 0,
    siphonWard: 0,
    siphonCooldownSec: 0,
    overdriveNovaRadius: 0,
    overdriveNovaDamage: 0,
    overdriveNovaStagger: 0,
  },
  core_choir_chime: {
    id: 'core_choir_chime',
    bossChapter: 'chapter_2_choir',
    bossName: 'THE CHOIR',
    synthesisCost: 3,
    crystalHex: 0xa855f7,
    ringHex: 0x38bdf8,
    accentCss: '#c084fc',
    shortBadgeEn: 'CHOIR',
    shortBadgeVi: 'CHOIR',
    titleEn: 'HARMONIC BELL CORE',
    titleVi: 'LÕI CHUÔNG CỘNG HƯỞNG',
    roleEn: '+15% ECHO DMG & ACOUSTIC PULSE',
    roleVi: '+15% ST ECHO & SÓNG ÂM CỘNG HƯỞNG',
    omegaRoleEn: 'Ω +22% ECHO DMG & 6.0m ACOUSTIC RESONANCE',
    omegaRoleVi: 'Ω +22% ST ECHO & SÓNG ÂM 6.0m',
    unlockSourceEn: 'Clear Ch.II (THE CHOIR) or Synthesize (3◆)',
    unlockSourceVi: 'Vượt Ch.II (THE CHOIR) hoặc Tổng hợp (3◆)',
    summaryEn:
      '+15% Echo Convergence DMG. Deploying Echo [Y] or landing Convergence emits a 5.2m Acoustic Pulse (22 DMG, +18 Stagger, +12 Twin-Sync).',
    summaryVi:
      '+15% ST Hội Tụ Echo. Gọi Echo [Y] hoặc nổ Hội Tụ phát Sóng Âm 5.2m (22 ST, +18 Choáng, +12% Song Ảnh).',
    omegaSummaryEn:
      'OMEGA: +22% Echo Convergence DMG. Deploying Echo [Y] or Convergence emits a 6.0m Acoustic Pulse (30 DMG, +24 Stagger, +18 Twin-Sync).',
    omegaSummaryVi:
      'OMEGA: +22% ST Hội Tụ Echo. Gọi Echo [Y] hoặc nổ Hội Tụ phát Sóng Âm 6.0m (30 ST, +24 Choáng, +18% Song Ảnh).',
    bonusWard: 0,
    allDamageMultiplier: 1.0,
    echoConvergenceMultiplier: 1.15,
    weakpointDamageMultiplier: 1.0,
    overdriveChargeMultiplier: 1.0,
    naniteHealMultiplier: 1.0,
    parryLanceRadius: 0,
    parryLanceDamage: 0,
    parryLanceStagger: 0,
    parryWardRestore: 0,
    echoPulseRadius: 5.2,
    echoPulseDamage: 22,
    echoPulseStagger: 18,
    echoPulseTwinSync: 12,
    heavyPullRadius: 0,
    heavyPullStep: 0,
    weakpointExtendSec: 0,
    siphonHp: 0,
    siphonWard: 0,
    siphonCooldownSec: 0,
    overdriveNovaRadius: 0,
    overdriveNovaDamage: 0,
    overdriveNovaStagger: 0,
  },
  core_curator_singularity: {
    id: 'core_curator_singularity',
    bossChapter: 'chapter_3_curator',
    bossName: 'THE CURATOR',
    synthesisCost: 3,
    crystalHex: 0x06b6d4,
    ringHex: 0x818cf8,
    accentCss: '#22d3ee',
    shortBadgeEn: 'CURATOR',
    shortBadgeVi: 'CURATOR',
    titleEn: 'GRAVITY WELL CORE',
    titleVi: 'LÕI DỊ ĐIỂM HẤP DẪN',
    roleEn: '+22% BREAK DMG & GRAVITY VORTEX',
    roleVi: '+22% ST PHÁ GIÁP & XOÁY HÚT TRỌNG LỰC',
    omegaRoleEn: 'Ω +30% BREAK DMG & 5.4m SINGULARITY PULL',
    omegaRoleVi: 'Ω +30% ST PHÁ GIÁP & XOÁY DỊ ĐIỂM 5.4m',
    unlockSourceEn: 'Clear Ch.III (THE CURATOR) or Synthesize (3◆)',
    unlockSourceVi: 'Vượt Ch.III (THE CURATOR) hoặc Tổng hợp (3◆)',
    summaryEn:
      '+22% DMG vs Staggered/Weakpoint foes. Empowered Heavy strikes pull enemies within 4.5m inward and extend Weakpoint Break by +1.0s.',
    summaryVi:
      '+22% ST lên mục tiêu Choáng/Phá Giáp. Đòn Mạnh Cường Hóa hút kẻ địch trong 4.5m lại gần và kéo dài Phá Giáp thêm +1.0s.',
    omegaSummaryEn:
      'OMEGA: +30% DMG vs Staggered/Weakpoint foes. Empowered Heavy strikes pull within 5.4m and extend Weakpoint Break by +1.4s.',
    omegaSummaryVi:
      'OMEGA: +30% ST lên mục tiêu Choáng/Phá Giáp. Đòn Mạnh Cường Hóa hút kẻ địch trong 5.4m và kéo dài Phá Giáp thêm +1.4s.',
    bonusWard: 0,
    allDamageMultiplier: 1.0,
    echoConvergenceMultiplier: 1.0,
    weakpointDamageMultiplier: 1.22,
    overdriveChargeMultiplier: 1.0,
    naniteHealMultiplier: 1.0,
    parryLanceRadius: 0,
    parryLanceDamage: 0,
    parryLanceStagger: 0,
    parryWardRestore: 0,
    echoPulseRadius: 0,
    echoPulseDamage: 0,
    echoPulseStagger: 0,
    echoPulseTwinSync: 0,
    heavyPullRadius: 4.5,
    heavyPullStep: 1.4,
    weakpointExtendSec: 1.0,
    siphonHp: 0,
    siphonWard: 0,
    siphonCooldownSec: 0,
    overdriveNovaRadius: 0,
    overdriveNovaDamage: 0,
    overdriveNovaStagger: 0,
  },
  core_matron_siphon: {
    id: 'core_matron_siphon',
    bossChapter: 'chapter_4_matron',
    bossName: 'MATRON-V',
    synthesisCost: 3,
    crystalHex: 0x10b981,
    ringHex: 0xf43f5e,
    accentCss: '#34d399',
    shortBadgeEn: 'MATRON-V',
    shortBadgeVi: 'MATRON-V',
    titleEn: 'NANITE SIPHON CORE',
    titleVi: 'LÕI HÚT SINH LỰC NANITE',
    roleEn: 'EXECUTION & WEAKPOINT LIFE/WARD SIPHON',
    roleVi: 'HÚT MÁU & GIÁP KHI KẾT LIỄU / PHÁ GIÁP',
    omegaRoleEn: 'Ω +30% NANITE (55 HP) & +9 HP/WARD SIPHON',
    omegaRoleVi: 'Ω +30% NANITE (55 HP) & HÚT +9 MÁU/GIÁP',
    unlockSourceEn: 'Clear Ch.IV (MATRON-V) or Synthesize (3◆)',
    unlockSourceVi: 'Vượt Ch.IV (MATRON-V) hoặc Tổng hợp (3◆)',
    summaryEn:
      '+20% Nanite [6] healing (50 HP). Execution Finishers [F] & Weakpoint hits (1.2s cd) siphon +6 Integrity and +6 Chrono Ward.',
    summaryVi:
      '+20% hồi máu Nanite [6] (50 HP). Kết Liễu [F] & đòn đánh vào mục tiêu Phá Giáp (hồi 1.2s) hút +6 Sinh Lực và +6 Giáp Chrono.',
    omegaSummaryEn:
      'OMEGA: +30% Nanite [6] healing (55 HP). Execution [F] & Weakpoint hits (1.0s cd) siphon +9 Integrity and +9 Chrono Ward.',
    omegaSummaryVi:
      'OMEGA: +30% hồi máu Nanite [6] (55 HP). Kết Liễu [F] & đòn đánh vào mục tiêu Phá Giáp (hồi 1.0s) hút +9 Sinh Lực và +9 Giáp Chrono.',
    bonusWard: 0,
    allDamageMultiplier: 1.0,
    echoConvergenceMultiplier: 1.0,
    weakpointDamageMultiplier: 1.0,
    overdriveChargeMultiplier: 1.0,
    naniteHealMultiplier: 1.2,
    parryLanceRadius: 0,
    parryLanceDamage: 0,
    parryLanceStagger: 0,
    parryWardRestore: 0,
    echoPulseRadius: 0,
    echoPulseDamage: 0,
    echoPulseStagger: 0,
    echoPulseTwinSync: 0,
    heavyPullRadius: 0,
    heavyPullStep: 0,
    weakpointExtendSec: 0,
    siphonHp: 6,
    siphonWard: 6,
    siphonCooldownSec: 1.2,
    overdriveNovaRadius: 0,
    overdriveNovaDamage: 0,
    overdriveNovaStagger: 0,
  },
  core_warden_sovereign: {
    id: 'core_warden_sovereign',
    bossChapter: 'chapter_5_loom',
    bossName: 'WARDEN PRIME',
    synthesisCost: 4,
    crystalHex: 0xfef08a,
    ringHex: 0x22d3ee,
    accentCss: '#fde047',
    shortBadgeEn: 'SOVEREIGN',
    shortBadgeVi: 'TỐI THƯỢNG',
    titleEn: 'CHRONICLE SOVEREIGN CORE',
    titleVi: 'LÕI BIÊN NIÊN TỐI THƯỢNG',
    roleEn: '+14% ALL DMG · +15 WARD · JUDGMENT NOVA',
    roleVi: '+14% TOÀN BỘ ST · +15 GIÁP · BÃO PHÁN QUYẾT',
    omegaRoleEn: 'Ω +20% ALL DMG · +22 WARD · 62 DMG NOVA',
    omegaRoleVi: 'Ω +20% TOÀN BỘ ST · +22 GIÁP · BÃO 62 ST',
    unlockSourceEn: 'Clear Ch.V (WARDEN PRIME) or Synthesize (4◆)',
    unlockSourceVi: 'Vượt Ch.V (WARDEN PRIME) hoặc Tổng hợp (4◆)',
    summaryEn:
      '+14% All-Weapon DMG, +15 Max Ward & +20% Overdrive gain. Activating Overdrive [`] unleashes a 6.5m Judgment Nova (45 DMG, +35 Stagger).',
    summaryVi:
      '+14% Toàn bộ Sát Thương, +15 Giáp Chrono & +20% tích Ngưng Đọng. Bật Ngưng Đọng [`] nổ Bão Phán Quyết 6.5m (45 ST, +35 Choáng).',
    omegaSummaryEn:
      'OMEGA: +20% All-Weapon DMG, +22 Max Ward & +30% Overdrive gain. Overdrive [`] unleashes a 7.5m Judgment Nova (62 DMG, +48 Stagger).',
    omegaSummaryVi:
      'OMEGA: +20% Toàn bộ Sát Thương, +22 Giáp Chrono & +30% tích Ngưng Đọng. Bật Ngưng Đọng [`] nổ Bão Phán Quyết 7.5m (62 ST, +48 Choáng).',
    bonusWard: 15,
    allDamageMultiplier: 1.14,
    echoConvergenceMultiplier: 1.0,
    weakpointDamageMultiplier: 1.0,
    overdriveChargeMultiplier: 1.2,
    naniteHealMultiplier: 1.0,
    parryLanceRadius: 0,
    parryLanceDamage: 0,
    parryLanceStagger: 0,
    parryWardRestore: 0,
    echoPulseRadius: 0,
    echoPulseDamage: 0,
    echoPulseStagger: 0,
    echoPulseTwinSync: 0,
    heavyPullRadius: 0,
    heavyPullStep: 0,
    weakpointExtendSec: 0,
    siphonHp: 0,
    siphonWard: 0,
    siphonCooldownSec: 0,
    overdriveNovaRadius: 6.5,
    overdriveNovaDamage: 45,
    overdriveNovaStagger: 35,
  },
};

const BOSS_CORE_OMEGA_OVERRIDES: Record<BossEchoCoreId, BossCoreOmegaOverride> = {
  core_helix_bastion: {
    bonusWard: 28,
    allDamageMultiplier: 1.0,
    echoConvergenceMultiplier: 1.0,
    weakpointDamageMultiplier: 1.0,
    overdriveChargeMultiplier: 1.0,
    naniteHealMultiplier: 1.0,
    parryLanceRadius: 4.6,
    parryLanceDamage: 38,
    parryLanceStagger: 32,
    parryWardRestore: 15,
    echoPulseRadius: 0,
    echoPulseDamage: 0,
    echoPulseStagger: 0,
    echoPulseTwinSync: 0,
    heavyPullRadius: 0,
    heavyPullStep: 0,
    weakpointExtendSec: 0,
    siphonHp: 0,
    siphonWard: 0,
    siphonCooldownSec: 0,
    overdriveNovaRadius: 0,
    overdriveNovaDamage: 0,
    overdriveNovaStagger: 0,
  },
  core_choir_chime: {
    bonusWard: 0,
    allDamageMultiplier: 1.0,
    echoConvergenceMultiplier: 1.22,
    weakpointDamageMultiplier: 1.0,
    overdriveChargeMultiplier: 1.0,
    naniteHealMultiplier: 1.0,
    parryLanceRadius: 0,
    parryLanceDamage: 0,
    parryLanceStagger: 0,
    parryWardRestore: 0,
    echoPulseRadius: 6.0,
    echoPulseDamage: 30,
    echoPulseStagger: 24,
    echoPulseTwinSync: 18,
    heavyPullRadius: 0,
    heavyPullStep: 0,
    weakpointExtendSec: 0,
    siphonHp: 0,
    siphonWard: 0,
    siphonCooldownSec: 0,
    overdriveNovaRadius: 0,
    overdriveNovaDamage: 0,
    overdriveNovaStagger: 0,
  },
  core_curator_singularity: {
    bonusWard: 0,
    allDamageMultiplier: 1.0,
    echoConvergenceMultiplier: 1.0,
    weakpointDamageMultiplier: 1.3,
    overdriveChargeMultiplier: 1.0,
    naniteHealMultiplier: 1.0,
    parryLanceRadius: 0,
    parryLanceDamage: 0,
    parryLanceStagger: 0,
    parryWardRestore: 0,
    echoPulseRadius: 0,
    echoPulseDamage: 0,
    echoPulseStagger: 0,
    echoPulseTwinSync: 0,
    heavyPullRadius: 5.4,
    heavyPullStep: 1.8,
    weakpointExtendSec: 1.4,
    siphonHp: 0,
    siphonWard: 0,
    siphonCooldownSec: 0,
    overdriveNovaRadius: 0,
    overdriveNovaDamage: 0,
    overdriveNovaStagger: 0,
  },
  core_matron_siphon: {
    bonusWard: 0,
    allDamageMultiplier: 1.0,
    echoConvergenceMultiplier: 1.0,
    weakpointDamageMultiplier: 1.0,
    overdriveChargeMultiplier: 1.0,
    naniteHealMultiplier: 1.31,
    parryLanceRadius: 0,
    parryLanceDamage: 0,
    parryLanceStagger: 0,
    parryWardRestore: 0,
    echoPulseRadius: 0,
    echoPulseDamage: 0,
    echoPulseStagger: 0,
    echoPulseTwinSync: 0,
    heavyPullRadius: 0,
    heavyPullStep: 0,
    weakpointExtendSec: 0,
    siphonHp: 9,
    siphonWard: 9,
    siphonCooldownSec: 1.0,
    overdriveNovaRadius: 0,
    overdriveNovaDamage: 0,
    overdriveNovaStagger: 0,
  },
  core_warden_sovereign: {
    bonusWard: 22,
    allDamageMultiplier: 1.2,
    echoConvergenceMultiplier: 1.0,
    weakpointDamageMultiplier: 1.0,
    overdriveChargeMultiplier: 1.3,
    naniteHealMultiplier: 1.0,
    parryLanceRadius: 0,
    parryLanceDamage: 0,
    parryLanceStagger: 0,
    parryWardRestore: 0,
    echoPulseRadius: 0,
    echoPulseDamage: 0,
    echoPulseStagger: 0,
    echoPulseTwinSync: 0,
    heavyPullRadius: 0,
    heavyPullStep: 0,
    weakpointExtendSec: 0,
    siphonHp: 0,
    siphonWard: 0,
    siphonCooldownSec: 0,
    overdriveNovaRadius: 7.5,
    overdriveNovaDamage: 62,
    overdriveNovaStagger: 48,
  },
};

export function isValidBossEchoCoreId(value: unknown): value is BossEchoCoreId {
  return (
    typeof value === 'string' &&
    (VALID_BOSS_ECHO_CORE_IDS as readonly string[]).includes(value)
  );
}

export function isBossCoreTranscended(
  coreId: BossEchoCoreId | null | undefined,
  transcendedCores?: readonly BossEchoCoreId[] | null
): boolean {
  if (!coreId || !isValidBossEchoCoreId(coreId) || !Array.isArray(transcendedCores)) {
    return false;
  }
  return transcendedCores.includes(coreId);
}

export function getAllBossEchoCoreSpecs(): BossEchoCoreSpec[] {
  return VALID_BOSS_ECHO_CORE_IDS.map((id) => BOSS_ECHO_CORES[id]);
}

export function deriveAutoUnlockedBossCores(
  completedChapters?: readonly CampaignChapterId[] | null,
  completedEndings?: readonly ChronicleLoomEndingId[] | null
): BossEchoCoreId[] {
  const out: BossEchoCoreId[] = [];
  const chapters = Array.isArray(completedChapters) ? completedChapters : [];
  const endings = Array.isArray(completedEndings) ? completedEndings : [];

  if (chapters.includes('chapter_1_helix')) out.push('core_helix_bastion');
  if (chapters.includes('chapter_2_choir')) out.push('core_choir_chime');
  if (chapters.includes('chapter_3_curator')) out.push('core_curator_singularity');
  if (chapters.includes('chapter_4_matron')) out.push('core_matron_siphon');
  if (chapters.includes('chapter_5_loom') || endings.length > 0) {
    out.push('core_warden_sovereign');
  }
  return out;
}

export function normalizeBossCoreProgression(
  rawUnlocked: unknown,
  rawEquipped: unknown,
  completedChapters?: readonly CampaignChapterId[] | null,
  completedEndings?: readonly ChronicleLoomEndingId[] | null,
  rawTranscended?: unknown
): {
  unlockedBossCores: BossEchoCoreId[];
  equippedBossCore: BossEchoCoreId | null;
  transcendedBossCores: BossEchoCoreId[];
} {
  const unlockedBossCores: BossEchoCoreId[] = [];
  if (Array.isArray(rawUnlocked)) {
    const limit = Math.min(rawUnlocked.length, 32);
    for (let i = 0; i < limit; i++) {
      const candidate = rawUnlocked[i];
      if (isValidBossEchoCoreId(candidate) && !unlockedBossCores.includes(candidate)) {
        unlockedBossCores.push(candidate);
      }
    }
  }
  const autoUnlocked = deriveAutoUnlockedBossCores(completedChapters, completedEndings);
  for (let i = 0; i < autoUnlocked.length; i++) {
    const id = autoUnlocked[i];
    if (!unlockedBossCores.includes(id)) {
      unlockedBossCores.push(id);
    }
  }

  const equippedBossCore =
    isValidBossEchoCoreId(rawEquipped) && unlockedBossCores.includes(rawEquipped)
      ? rawEquipped
      : null;

  const transcendedBossCores: BossEchoCoreId[] = [];
  if (Array.isArray(rawTranscended)) {
    const limit = Math.min(rawTranscended.length, 32);
    for (let i = 0; i < limit; i++) {
      const candidate = rawTranscended[i];
      if (
        isValidBossEchoCoreId(candidate) &&
        unlockedBossCores.includes(candidate) &&
        !transcendedBossCores.includes(candidate)
      ) {
        transcendedBossCores.push(candidate);
      }
    }
  }

  return { unlockedBossCores, equippedBossCore, transcendedBossCores };
}

export interface BossCoreModifiers {
  readonly spec: BossEchoCoreSpec | null;
  readonly isOmega: boolean;
  readonly bonusWard: number;
  readonly allDamageMultiplier: number;
  readonly echoConvergenceMultiplier: number;
  readonly weakpointDamageMultiplier: number;
  readonly overdriveChargeMultiplier: number;
  readonly naniteHealMultiplier: number;
}

const NEUTRAL_BOSS_CORE_MODIFIERS: BossCoreModifiers = Object.freeze({
  spec: null,
  isOmega: false,
  bonusWard: 0,
  allDamageMultiplier: 1.0,
  echoConvergenceMultiplier: 1.0,
  weakpointDamageMultiplier: 1.0,
  overdriveChargeMultiplier: 1.0,
  naniteHealMultiplier: 1.0,
});

function buildFrozenBossCoreModifiers(coreId: BossEchoCoreId, isOmega: boolean): BossCoreModifiers {
  const baseSpec = BOSS_ECHO_CORES[coreId];
  const effectiveSpec: BossEchoCoreSpec = Object.freeze(
    isOmega ? { ...baseSpec, ...BOSS_CORE_OMEGA_OVERRIDES[coreId] } : { ...baseSpec }
  );
  return Object.freeze({
    spec: effectiveSpec,
    isOmega,
    bonusWard: effectiveSpec.bonusWard,
    allDamageMultiplier: effectiveSpec.allDamageMultiplier,
    echoConvergenceMultiplier: effectiveSpec.echoConvergenceMultiplier,
    weakpointDamageMultiplier: effectiveSpec.weakpointDamageMultiplier,
    overdriveChargeMultiplier: effectiveSpec.overdriveChargeMultiplier,
    naniteHealMultiplier: effectiveSpec.naniteHealMultiplier,
  });
}

const FROZEN_BOSS_CORE_MODS_BASE: Record<BossEchoCoreId, BossCoreModifiers> = Object.freeze({
  core_helix_bastion: buildFrozenBossCoreModifiers('core_helix_bastion', false),
  core_choir_chime: buildFrozenBossCoreModifiers('core_choir_chime', false),
  core_curator_singularity: buildFrozenBossCoreModifiers('core_curator_singularity', false),
  core_matron_siphon: buildFrozenBossCoreModifiers('core_matron_siphon', false),
  core_warden_sovereign: buildFrozenBossCoreModifiers('core_warden_sovereign', false),
});

const FROZEN_BOSS_CORE_MODS_OMEGA: Record<BossEchoCoreId, BossCoreModifiers> = Object.freeze({
  core_helix_bastion: buildFrozenBossCoreModifiers('core_helix_bastion', true),
  core_choir_chime: buildFrozenBossCoreModifiers('core_choir_chime', true),
  core_curator_singularity: buildFrozenBossCoreModifiers('core_curator_singularity', true),
  core_matron_siphon: buildFrozenBossCoreModifiers('core_matron_siphon', true),
  core_warden_sovereign: buildFrozenBossCoreModifiers('core_warden_sovereign', true),
});

export function computeBossCoreModifiers(
  coreId: BossEchoCoreId | null | undefined,
  transcendedCores?: readonly BossEchoCoreId[] | null
): BossCoreModifiers {
  if (!coreId || !isValidBossEchoCoreId(coreId)) {
    return NEUTRAL_BOSS_CORE_MODIFIERS;
  }
  return isBossCoreTranscended(coreId, transcendedCores)
    ? FROZEN_BOSS_CORE_MODS_OMEGA[coreId]
    : FROZEN_BOSS_CORE_MODS_BASE[coreId];
}

export interface SentinelCoreConfluenceSummary {
  readonly active: boolean;
  readonly doctrineId: ConfluenceDoctrineId;
  readonly isOmega: boolean;
  readonly accentCss: string;
  readonly titleEn: string;
  readonly titleVi: string;
  readonly passiveEn: string;
  readonly passiveVi: string;
  readonly burstTitleEn: string;
  readonly burstTitleVi: string;
  readonly burstDescEn: string;
  readonly burstDescVi: string;
  readonly bonusWard: number;
  readonly wardRegenMultiplier: number;
  readonly allDamageMultiplier: number;
  readonly sentinelFireRateMultiplier: number;
  readonly fluxGainMultiplier: number;
  readonly skillFluxCostMultiplier: number;
  readonly burstRadius: number;
  readonly burstDamage: number;
  readonly burstStagger: number;
  readonly burstWardRestoreRatio: number;
  readonly burstTargetCap: number;
  readonly burstHeatRelief: number;
  readonly burstFluxRestore: number;
  readonly burstTwinSyncBonus: number;
}

const INACTIVE_CONFLUENCE_SUMMARY: SentinelCoreConfluenceSummary = Object.freeze({
  active: false,
  doctrineId: 'none',
  isOmega: false,
  accentCss: '#64748b',
  titleEn: 'CONFLUENCE STANDBY',
  titleVi: 'CHƯA KÍCH HOẠT HỢP LƯU',
  passiveEn: 'Equip any Sovereign Boss Echo Core + LYS-04 Sentinel [8] to awaken Harmonic Confluence & [9] Burst.',
  passiveVi: 'Lắp 1 Lõi Vọng Âm Boss + Drone LYS-04 [8] để kích hoạt Học Thuyết Hợp Lưu & Tuyệt Kỹ [9].',
  burstTitleEn: 'CONFLUENCE [9]',
  burstTitleVi: 'HỢP LƯU [9]',
  burstDescEn: 'Requires an equipped Boss Echo Core.',
  burstDescVi: 'Yêu cầu trang bị Lõi Vọng Âm Boss.',
  bonusWard: 0,
  wardRegenMultiplier: 1.0,
  allDamageMultiplier: 1.0,
  sentinelFireRateMultiplier: 1.0,
  fluxGainMultiplier: 1.0,
  skillFluxCostMultiplier: 1.0,
  burstRadius: 0,
  burstDamage: 0,
  burstStagger: 0,
  burstWardRestoreRatio: 0,
  burstTargetCap: 0,
  burstHeatRelief: 0,
  burstFluxRestore: 0,
  burstTwinSyncBonus: 0,
});

function buildFrozenConfluenceSummary(
  mode: SentinelProtocolMode,
  isOmega: boolean
): SentinelCoreConfluenceSummary {
  if (mode === 'aegis') {
    const bonusWard = isOmega ? 15 : 10;
    const burstDamage = isOmega ? 46 : 36;
    return Object.freeze({
      active: true,
      doctrineId: 'aegis_bastion',
      isOmega,
      accentCss: '#34d399',
      titleEn: isOmega ? 'AEGIS BASTION CONFLUENCE Ω' : 'AEGIS BASTION CONFLUENCE',
      titleVi: isOmega ? 'HỢP LƯU PHÁO ĐÀI AEGIS Ω' : 'HỢP LƯU PHÁO ĐÀI AEGIS',
      passiveEn: `+${bonusWard} Max Chrono Ward & +20% Ward regeneration speed`,
      passiveVi: `+${bonusWard} Giáp Chrono tối đa & +20% tốc độ hồi Giáp Chrono`,
      burstTitleEn: '[9] FORTRESS REPULSOR',
      burstTitleVi: '[9] XUNG PHÁO ĐÀI',
      burstDescEn: `Restores 50% Max Ward & unleashes a 5.5m Repulsor (${burstDamage} DMG, +32 Stagger).`,
      burstDescVi: `Hồi ngay 50% Giáp Chrono & phóng Xung Đẩy Lùi 5.5m (${burstDamage} ST, +32 Choáng).`,
      bonusWard,
      wardRegenMultiplier: 1.2,
      allDamageMultiplier: 1.0,
      sentinelFireRateMultiplier: 1.0,
      fluxGainMultiplier: 1.0,
      skillFluxCostMultiplier: 1.0,
      burstRadius: 5.5,
      burstDamage,
      burstStagger: 32,
      burstWardRestoreRatio: 0.5,
      burstTargetCap: 0,
      burstHeatRelief: 0,
      burstFluxRestore: 0,
      burstTwinSyncBonus: 0,
    });
  }

  if (mode === 'interceptor') {
    const dmgPct = isOmega ? 12 : 8;
    const burstDamage = isOmega ? 60 : 48;
    return Object.freeze({
      active: true,
      doctrineId: 'interceptor_lance',
      isOmega,
      accentCss: '#38bdf8',
      titleEn: isOmega ? 'INTERCEPTOR LANCE CONFLUENCE Ω' : 'INTERCEPTOR LANCE CONFLUENCE',
      titleVi: isOmega ? 'HỢP LƯU XUNG KÍCH QUỸ ĐẠO Ω' : 'HỢP LƯU XUNG KÍCH QUỸ ĐẠO',
      passiveEn: `+${dmgPct}% All-Weapon DMG & +18% LYS-04 Sentinel fire rate`,
      passiveVi: `+${dmgPct}% Toàn bộ Sát Thương & +18% tốc bắn Drone LYS-04`,
      burstTitleEn: '[9] ORBITAL RAIL BARRAGE',
      burstTitleVi: '[9] MƯA GIÁO QUỸ ĐẠO',
      burstDescEn: `Strikes up to 3 foes within 12m (${burstDamage} DMG, +28 Stagger) & vents -25 Heat.`,
      burstDescVi: `Phóng giáo quỹ đạo vào 3 mục tiêu trong 12m (${burstDamage} ST, +28 Choáng) & xả -25 Nhiệt.`,
      bonusWard: 0,
      wardRegenMultiplier: 1.0,
      allDamageMultiplier: isOmega ? 1.12 : 1.08,
      sentinelFireRateMultiplier: 1.18,
      fluxGainMultiplier: 1.0,
      skillFluxCostMultiplier: 1.0,
      burstRadius: 12.0,
      burstDamage,
      burstStagger: 28,
      burstWardRestoreRatio: 0,
      burstTargetCap: 3,
      burstHeatRelief: 25,
      burstFluxRestore: 0,
      burstTwinSyncBonus: 0,
    });
  }

  if (mode === 'harmonic') {
    const fluxPct = isOmega ? 20 : 15;
    const burstDamage = isOmega ? 54 : 42;
    return Object.freeze({
      active: true,
      doctrineId: 'harmonic_paradox',
      isOmega,
      accentCss: '#c084fc',
      titleEn: isOmega ? 'HARMONIC PARADOX CONFLUENCE Ω' : 'HARMONIC PARADOX CONFLUENCE',
      titleVi: isOmega ? 'HỢP LƯU NGHỊCH LÝ CỘNG HƯỞNG Ω' : 'HỢP LƯU NGHỊCH LÝ CỘNG HƯỞNG',
      passiveEn: `+${fluxPct}% Flux gain & -10% Skill Flux cost ([V] / [G] / [X])`,
      passiveVi: `+${fluxPct}% tốc hồi Flux & -10% Flux tiêu hao kỹ năng ([V] / [G] / [X])`,
      burstTitleEn: '[9] TEMPORAL SINGULARITY',
      burstTitleVi: '[9] DỊ ĐIỂM THỜI KHÔNG',
      burstDescEn: `Detonates a 6.2m Singularity (${burstDamage} DMG, +30 Stagger, +25 Flux, +20 Twin-Sync).`,
      burstDescVi: `Nổ Dị Điểm 6.2m (${burstDamage} ST, +30 Choáng) & hồi ngay +25 Flux, +20% Song Ảnh.`,
      bonusWard: 0,
      wardRegenMultiplier: 1.0,
      allDamageMultiplier: 1.0,
      sentinelFireRateMultiplier: 1.0,
      fluxGainMultiplier: isOmega ? 1.2 : 1.15,
      skillFluxCostMultiplier: 0.9,
      burstRadius: 6.2,
      burstDamage,
      burstStagger: 30,
      burstWardRestoreRatio: 0,
      burstTargetCap: 0,
      burstHeatRelief: 0,
      burstFluxRestore: 25,
      burstTwinSyncBonus: 20,
    });
  }

  const burstDamage = isOmega ? 40 : 32;
  return Object.freeze({
    active: true,
    doctrineId: 'core_overpulse',
    isOmega,
    accentCss: '#fbbf24',
    titleEn: isOmega ? 'CORE OVERPULSE STANDBY Ω' : 'CORE OVERPULSE STANDBY',
    titleVi: isOmega ? 'XUNG LÕI ĐƠN LẬP Ω' : 'XUNG LÕI ĐƠN LẬP',
    passiveEn: 'Activate LYS-04 [8] (Aegis / Interceptor / Harmonic) to unlock bonus Confluence passives.',
    passiveVi: 'Bật Drone LYS-04 [8] (Hộ Thuẫn / Xung Kích / Cộng Hưởng) để mở thêm nội tại Hợp Lưu.',
    burstTitleEn: '[9] CORE OVERPULSE',
    burstTitleVi: '[9] XUNG LÕI THỐNG LĨNH',
    burstDescEn: `Unleashes a 4.8m Boss Core Overpulse (${burstDamage} DMG, +22 Stagger).`,
    burstDescVi: `Giải phóng Xung Lõi Thống Lĩnh 4.8m (${burstDamage} ST, +22 Choáng).`,
    bonusWard: 0,
    wardRegenMultiplier: 1.0,
    allDamageMultiplier: 1.0,
    sentinelFireRateMultiplier: 1.0,
    fluxGainMultiplier: 1.0,
    skillFluxCostMultiplier: 1.0,
    burstRadius: 4.8,
    burstDamage,
    burstStagger: 22,
    burstWardRestoreRatio: 0,
    burstTargetCap: 0,
    burstHeatRelief: 0,
    burstFluxRestore: 0,
    burstTwinSyncBonus: 0,
  });
}

const FROZEN_CONFLUENCE_BASE: Record<SentinelProtocolMode, SentinelCoreConfluenceSummary> =
  Object.freeze({
    off: buildFrozenConfluenceSummary('off', false),
    aegis: buildFrozenConfluenceSummary('aegis', false),
    interceptor: buildFrozenConfluenceSummary('interceptor', false),
    harmonic: buildFrozenConfluenceSummary('harmonic', false),
  });

const FROZEN_CONFLUENCE_OMEGA: Record<SentinelProtocolMode, SentinelCoreConfluenceSummary> =
  Object.freeze({
    off: buildFrozenConfluenceSummary('off', true),
    aegis: buildFrozenConfluenceSummary('aegis', true),
    interceptor: buildFrozenConfluenceSummary('interceptor', true),
    harmonic: buildFrozenConfluenceSummary('harmonic', true),
  });

export function computeSentinelCoreConfluence(
  sentinelMode: SentinelProtocolMode | null | undefined,
  equippedBossCore: BossEchoCoreId | null | undefined,
  transcendedCores?: readonly BossEchoCoreId[] | null
): SentinelCoreConfluenceSummary {
  if (!equippedBossCore || !isValidBossEchoCoreId(equippedBossCore)) {
    return INACTIVE_CONFLUENCE_SUMMARY;
  }
  const mode: SentinelProtocolMode =
    sentinelMode === 'aegis' || sentinelMode === 'interceptor' || sentinelMode === 'harmonic'
      ? sentinelMode
      : 'off';
  return isBossCoreTranscended(equippedBossCore, transcendedCores)
    ? FROZEN_CONFLUENCE_OMEGA[mode]
    : FROZEN_CONFLUENCE_BASE[mode];
}

// ============================================================================
// v3.6.0 SOVEREIGN ARMAMENT ATTUNEMENT (`ĐỒNG ĐIỆU THẦN BINH: 5 VŨ KHÍ × 5 LÕI`)
// ============================================================================

export const COGNATE_CORE_FOR_WEAPON: Readonly<Record<WeaponId, BossEchoCoreId>> = Object.freeze({
  chrono_edge: 'core_helix_bastion',
  pulsecaster: 'core_choir_chime',
  phase_rail: 'core_matron_siphon',
  grav_breaker: 'core_curator_singularity',
  chrono_scythe: 'core_warden_sovereign',
});

export const COGNATE_WEAPON_FOR_CORE: Readonly<Record<BossEchoCoreId, WeaponId>> = Object.freeze({
  core_helix_bastion: 'chrono_edge',
  core_choir_chime: 'pulsecaster',
  core_matron_siphon: 'phase_rail',
  core_curator_singularity: 'grav_breaker',
  core_warden_sovereign: 'chrono_scythe',
});

export interface WeaponCoreAttunementSummary {
  readonly attuned: boolean;
  readonly weaponId: WeaponId;
  readonly cognateCoreId: BossEchoCoreId;
  readonly isOmega: boolean;
  readonly isUniversalOverride: boolean;
  readonly accentCss: string;
  readonly titleEn: string;
  readonly titleVi: string;
  readonly perkEn: string;
  readonly perkVi: string;
  readonly damageMultiplier: number;
  readonly staggerMultiplier: number;
  readonly heatCostMultiplier: number;
  readonly chargeThresholdMultiplier: number;
  readonly parryConfluenceBonus: number;
  readonly parryResetSwitchCooldown: boolean;
  readonly parryFluxBonus: number;
  readonly heavyFluxRestore: number;
  readonly railUnconditionalSiphon: boolean;
  readonly slamPullRadius: number;
  readonly slamConfluenceBonus: number;
  readonly scytheWaveRadius: number;
  readonly scytheWaveDamage: number;
  readonly scytheWaveStagger: number;
}

function buildAttunementVariant(
  weaponId: WeaponId,
  attuned: boolean,
  isOmega: boolean,
  isUniversalOverride: boolean
): WeaponCoreAttunementSummary {
  const cognateCoreId = COGNATE_CORE_FOR_WEAPON[weaponId];
  const coreSpec = BOSS_ECHO_CORES[cognateCoreId];

  if (!attuned) {
    return Object.freeze({
      attuned: false,
      weaponId,
      cognateCoreId,
      isOmega: false,
      isUniversalOverride: false,
      accentCss: coreSpec.accentCss,
      titleEn: `COGNATE CORE: ${coreSpec.shortBadgeEn}`,
      titleVi: `LÕI ĐỒNG ĐIỆU: ${coreSpec.shortBadgeVi}`,
      perkEn: `Pair with ${coreSpec.titleEn} (or Warden Sovereign Ω) to awaken Armament Attunement.`,
      perkVi: `Trang bị cùng ${coreSpec.titleVi} (hoặc Lõi Biên Niên Ω) để đánh thức Đồng Điệu Thần Binh.`,
      damageMultiplier: 1.0,
      staggerMultiplier: 1.0,
      heatCostMultiplier: 1.0,
      chargeThresholdMultiplier: 1.0,
      parryConfluenceBonus: 0,
      parryResetSwitchCooldown: false,
      parryFluxBonus: 0,
      heavyFluxRestore: 0,
      railUnconditionalSiphon: false,
      slamPullRadius: 0,
      slamConfluenceBonus: 0,
      scytheWaveRadius: 0,
      scytheWaveDamage: 0,
      scytheWaveStagger: 0,
    });
  }

  const tierSuffix = isUniversalOverride ? ' (SOVEREIGN Ω)' : isOmega ? ' Ω' : '';
  const tierSuffixVi = isUniversalOverride ? ' (TỐI THƯỢNG Ω)' : isOmega ? ' Ω' : '';

  if (weaponId === 'chrono_edge') {
    const dmgPct = isOmega ? 20 : 14;
    const confGain = isOmega ? 26 : 18;
    const fluxGain = isOmega ? 6 : 0;
    return Object.freeze({
      attuned: true,
      weaponId,
      cognateCoreId,
      isOmega,
      isUniversalOverride,
      accentCss: isUniversalOverride ? '#fde047' : coreSpec.accentCss,
      titleEn: `AEGIS RIPOSTE${tierSuffix}`,
      titleVi: `KIẾM THẾ PHÁO ĐÀI${tierSuffixVi}`,
      perkEn: `+${dmgPct}% Chrono Edge DMG · Perfect Parry [Q] grants +${confGain} [9] Charge, resets Switch CD${fluxGain > 0 ? ` & +${fluxGain} Flux` : ''}.`,
      perkVi: `+${dmgPct}% ST Kiếm Chrono · Đỡ Đòn [Q] nạp thêm +${confGain}% Tuyệt Kỹ [9], xóa hồi đổi vũ khí${fluxGain > 0 ? ` & +${fluxGain} Flux` : ''}.`,
      damageMultiplier: isOmega ? 1.2 : 1.14,
      staggerMultiplier: 1.0,
      heatCostMultiplier: 1.0,
      chargeThresholdMultiplier: 1.0,
      parryConfluenceBonus: confGain,
      parryResetSwitchCooldown: true,
      parryFluxBonus: fluxGain,
      heavyFluxRestore: 0,
      railUnconditionalSiphon: false,
      slamPullRadius: 0,
      slamConfluenceBonus: 0,
      scytheWaveRadius: 0,
      scytheWaveDamage: 0,
      scytheWaveStagger: 0,
    });
  }

  if (weaponId === 'pulsecaster') {
    const dmgPct = isOmega ? 20 : 14;
    const heatPct = isOmega ? 30 : 22;
    const fluxGain = isOmega ? 12 : 8;
    return Object.freeze({
      attuned: true,
      weaponId,
      cognateCoreId,
      isOmega,
      isUniversalOverride,
      accentCss: isUniversalOverride ? '#fde047' : coreSpec.accentCss,
      titleEn: `HARMONIC CADENCE${tierSuffix}`,
      titleVi: `NHỊP XUNG GIAO HƯỞNG${tierSuffixVi}`,
      perkEn: `+${dmgPct}% Pulsecaster DMG · -${heatPct}% Heat cost per shot · Heavy Burst [E] restores +${fluxGain} Flux.`,
      perkVi: `+${dmgPct}% ST Súng Xung Nhịp · -${heatPct}% Nhiệt mỗi phát bắn · Đạn Mạnh [E] hồi ngay +${fluxGain} Flux.`,
      damageMultiplier: isOmega ? 1.2 : 1.14,
      staggerMultiplier: 1.0,
      heatCostMultiplier: isOmega ? 0.7 : 0.78,
      chargeThresholdMultiplier: 1.0,
      parryConfluenceBonus: 0,
      parryResetSwitchCooldown: false,
      parryFluxBonus: 0,
      heavyFluxRestore: fluxGain,
      railUnconditionalSiphon: false,
      slamPullRadius: 0,
      slamConfluenceBonus: 0,
      scytheWaveRadius: 0,
      scytheWaveDamage: 0,
      scytheWaveStagger: 0,
    });
  }

  if (weaponId === 'phase_rail') {
    const dmgPct = isOmega ? 24 : 16;
    const chargePct = isOmega ? 28 : 20;
    return Object.freeze({
      attuned: true,
      weaponId,
      cognateCoreId,
      isOmega,
      isUniversalOverride,
      accentCss: isUniversalOverride ? '#fde047' : coreSpec.accentCss,
      titleEn: `SURGICAL APERTURE${tierSuffix}`,
      titleVi: `MŨI TIÊM PHẪU THUẬT${tierSuffixVi}`,
      perkEn: `+${dmgPct}% Phase Rail DMG · -${chargePct}% Heavy Charge time · Heavy Rail [E] triggers Nanite Siphon on any target.`,
      perkVi: `+${dmgPct}% ST Giáo Điện Từ · -${chargePct}% thời gian tụ Đòn Mạnh · Bắn Mạnh [E] kích hoạt Hút Sinh Lực lên mọi mục tiêu.`,
      damageMultiplier: isOmega ? 1.24 : 1.16,
      staggerMultiplier: 1.0,
      heatCostMultiplier: 1.0,
      chargeThresholdMultiplier: isOmega ? 0.72 : 0.8,
      parryConfluenceBonus: 0,
      parryResetSwitchCooldown: false,
      parryFluxBonus: 0,
      heavyFluxRestore: 0,
      railUnconditionalSiphon: true,
      slamPullRadius: 0,
      slamConfluenceBonus: 0,
      scytheWaveRadius: 0,
      scytheWaveDamage: 0,
      scytheWaveStagger: 0,
    });
  }

  if (weaponId === 'grav_breaker') {
    const dmgPct = isOmega ? 24 : 16;
    const pullRadius = isOmega ? 5.8 : 4.8;
    const confGain = isOmega ? 22 : 16;
    return Object.freeze({
      attuned: true,
      weaponId,
      cognateCoreId,
      isOmega,
      isUniversalOverride,
      accentCss: isUniversalOverride ? '#fde047' : coreSpec.accentCss,
      titleEn: `SINGULARITY MAUL${tierSuffix}`,
      titleVi: `BÚA DỊ ĐIỂM${tierSuffixVi}`,
      perkEn: `+${dmgPct}% Grav-Breaker DMG & Stagger · 3rd Light Slam & Heavy [E] pull foes within ${pullRadius}m & grant +${confGain} [9] Charge.`,
      perkVi: `+${dmgPct}% ST & Choáng Búa Trọng Trường · Đòn 3 & Đòn Mạnh [E] hút địch trong ${pullRadius}m & nạp +${confGain}% Tuyệt Kỹ [9].`,
      damageMultiplier: isOmega ? 1.24 : 1.16,
      staggerMultiplier: isOmega ? 1.24 : 1.16,
      heatCostMultiplier: 1.0,
      chargeThresholdMultiplier: 1.0,
      parryConfluenceBonus: 0,
      parryResetSwitchCooldown: false,
      parryFluxBonus: 0,
      heavyFluxRestore: 0,
      railUnconditionalSiphon: false,
      slamPullRadius: pullRadius,
      slamConfluenceBonus: confGain,
      scytheWaveRadius: 0,
      scytheWaveDamage: 0,
      scytheWaveStagger: 0,
    });
  }

  // chrono_scythe
  const dmgPct = isOmega ? 24 : 16;
  const waveRadius = isOmega ? 5.4 : 4.6;
  const waveDamage = isOmega ? 34 : 24;
  const waveStagger = isOmega ? 24 : 18;
  return Object.freeze({
    attuned: true,
    weaponId,
    cognateCoreId,
    isOmega,
    isUniversalOverride,
    accentCss: coreSpec.accentCss,
    titleEn: `SOVEREIGN REAPER${tierSuffix}`,
    titleVi: `LƯỠI HÁI PHÁN QUYẾT${tierSuffixVi}`,
    perkEn: `+${dmgPct}% Chrono Scythe DMG · Heavy Vortex [E] unleashes a ${waveRadius}m Sovereign Wave (${waveDamage} DMG, +${waveStagger} Stagger).`,
    perkVi: `+${dmgPct}% ST Lưỡi Hái · Xoáy Đòn Mạnh [E] phóng Sóng Phán Quyết ${waveRadius}m (${waveDamage} ST, +${waveStagger} Choáng).`,
    damageMultiplier: isOmega ? 1.24 : 1.16,
    staggerMultiplier: 1.0,
    heatCostMultiplier: 1.0,
    chargeThresholdMultiplier: 1.0,
    parryConfluenceBonus: 0,
    parryResetSwitchCooldown: false,
    parryFluxBonus: 0,
    heavyFluxRestore: 0,
    railUnconditionalSiphon: false,
    slamPullRadius: 0,
    slamConfluenceBonus: 0,
    scytheWaveRadius: waveRadius,
    scytheWaveDamage: waveDamage,
    scytheWaveStagger: waveStagger,
  });
}

const ALL_WEAPON_IDS_FOR_ATTUNEMENT: readonly WeaponId[] = [
  'chrono_edge',
  'pulsecaster',
  'phase_rail',
  'grav_breaker',
  'chrono_scythe',
];

type AttunementVariantSet = {
  readonly inactive: WeaponCoreAttunementSummary;
  readonly base: WeaponCoreAttunementSummary;
  readonly omega: WeaponCoreAttunementSummary;
  readonly universal: WeaponCoreAttunementSummary;
};

const FROZEN_ATTUNEMENT_TABLE: Readonly<Record<WeaponId, AttunementVariantSet>> = Object.freeze(
  ALL_WEAPON_IDS_FOR_ATTUNEMENT.reduce(
    (acc, wId) => {
      acc[wId] = Object.freeze({
        inactive: buildAttunementVariant(wId, false, false, false),
        base: buildAttunementVariant(wId, true, false, false),
        omega: buildAttunementVariant(wId, true, true, false),
        universal: buildAttunementVariant(wId, true, false, true),
      });
      return acc;
    },
    {} as Record<WeaponId, AttunementVariantSet>
  )
);

export function computeWeaponCoreAttunement(
  weaponId: WeaponId | null | undefined,
  equippedBossCore: BossEchoCoreId | null | undefined,
  transcendedCores?: readonly BossEchoCoreId[] | null
): WeaponCoreAttunementSummary {
  const safeWeapon: WeaponId =
    weaponId === 'pulsecaster' ||
    weaponId === 'phase_rail' ||
    weaponId === 'grav_breaker' ||
    weaponId === 'chrono_scythe'
      ? weaponId
      : 'chrono_edge';
  const variants = FROZEN_ATTUNEMENT_TABLE[safeWeapon];
  if (!equippedBossCore || !isValidBossEchoCoreId(equippedBossCore)) {
    return variants.inactive;
  }
  const cognate = COGNATE_CORE_FOR_WEAPON[safeWeapon];
  if (equippedBossCore === cognate) {
    return isBossCoreTranscended(equippedBossCore, transcendedCores)
      ? variants.omega
      : variants.base;
  }
  if (
    equippedBossCore === 'core_warden_sovereign' &&
    isBossCoreTranscended('core_warden_sovereign', transcendedCores)
  ) {
    return variants.universal;
  }
  return variants.inactive;
}

export function isWeaponAttunedToBossCore(
  weaponId: WeaponId | null | undefined,
  equippedBossCore: BossEchoCoreId | null | undefined,
  transcendedCores?: readonly BossEchoCoreId[] | null
): boolean {
  return computeWeaponCoreAttunement(weaponId, equippedBossCore, transcendedCores).attuned;
}

export function createInitialChronoConfluenceState(
  sentinelMode: SentinelProtocolMode = 'off',
  equippedBossCore: BossEchoCoreId | null = null,
  transcendedCores: readonly BossEchoCoreId[] = [],
  initialCharge = 35
): ChronoConfluenceState {
  const summary = computeSentinelCoreConfluence(sentinelMode, equippedBossCore, transcendedCores);
  const clampedCharge = Math.max(0, Math.min(100, initialCharge));
  return {
    doctrineId: summary.doctrineId,
    charge: clampedCharge,
    cooldownTimer: 0,
    maxCooldown: CONFLUENCE_BURST_COOLDOWN_SEC,
    ready: summary.active && clampedCharge >= 100,
    isOmega: summary.isOmega,
    totalBursts: 0,
  };
}

export function formatBossCoreHudBadge(
  coreId: BossEchoCoreId | null | undefined,
  locale: AppLocale,
  isOmega = false
): string | null {
  if (!coreId || !isValidBossEchoCoreId(coreId)) return null;
  const spec = BOSS_ECHO_CORES[coreId];
  const omegaSuffix = isOmega ? ' Ω' : '';
  return locale === 'vi'
    ? `LÕI: ${spec.shortBadgeVi}${omegaSuffix}`
    : `CORE: ${spec.shortBadgeEn}${omegaSuffix}`;
}
