import type {
  CampaignChapterId,
  ChronoNexusLinkTag,
  ChronoNexusState,
  ChronoNexusTier,
} from './types.ts';

export interface ChronoNexusTierSpec {
  tier: ChronoNexusTier;
  damageMult: number;
  masteryXpMult: number;
  cooldownReliefMult: number;
  accentHex: number;
  accentCss: string;
  labelEn: string;
  labelVi: string;
}

export const CHRONO_NEXUS_TIER_SPECS: Record<ChronoNexusTier, ChronoNexusTierSpec> = {
  0: {
    tier: 0,
    damageMult: 1.0,
    masteryXpMult: 1.0,
    cooldownReliefMult: 1.0,
    accentHex: 0x38bdf8,
    accentCss: '#38bdf8',
    labelEn: 'UNLINKED',
    labelVi: 'CHƯA LIÊN KẾT',
  },
  2: {
    tier: 2,
    damageMult: 1.1,
    masteryXpMult: 1.15,
    cooldownReliefMult: 0.88,
    accentHex: 0x22d3ee,
    accentCss: '#22d3ee',
    labelEn: 'DUAL NEXUS ×2 · +10% DMG',
    labelVi: 'LIÊN KẾT KÉP ×2 · +10% ST',
  },
  3: {
    tier: 3,
    damageMult: 1.2,
    masteryXpMult: 1.3,
    cooldownReliefMult: 0.78,
    accentHex: 0xa78bfa,
    accentCss: '#c4b5fd',
    labelEn: 'TRI-NEXUS ×3 · +20% DMG',
    labelVi: 'TAM CỘNG HƯỞNG ×3 · +20% ST',
  },
  4: {
    tier: 4,
    damageMult: 1.32,
    masteryXpMult: 1.5,
    cooldownReliefMult: 0.68,
    accentHex: 0xfbbf24,
    accentCss: '#fde047',
    labelEn: 'APEX NEXUS ×4 · +32% DMG',
    labelVi: 'ĐỈNH KỲ DỊ ×4 · +32% ST',
  },
};

export interface ChronicleLinkNode {
  id: CampaignChapterId | 'echo_zero';
  codeEn: string;
  codeVi: string;
  titleEn: string;
  titleVi: string;
  linkClueEn: string;
  linkClueVi: string;
}

export const CHRONICLE_LINK_CHAIN: readonly ChronicleLinkNode[] = [
  {
    id: 'prologue',
    codeEn: '00 · WAKE',
    codeVi: '00 · THỨC TỈNH',
    titleEn: 'Calibration Bay 04',
    titleVi: 'Khoang Hiệu Chuẩn 04',
    linkClueEn: 'Loop #413 boots with Lysa’s override token',
    linkClueVi: 'Vòng #413 khởi chạy bằng khóa ghi đè của Lysa',
  },
  {
    id: 'chapter_1_helix',
    codeEn: '01 · HELIX-04',
    codeVi: '01 · HELIX-04',
    titleEn: 'Primary Containment',
    titleVi: 'Khu Cách Ly Chính',
    linkClueEn: 'Redacted manifest links Lysa to Deck 07',
    linkClueVi: 'Hồ sơ bị xóa nối dấu vết Lysa tới Khoang 07',
  },
  {
    id: 'chapter_2_choir',
    codeEn: '02 · THE CHOIR',
    codeVi: '02 · THE CHOIR',
    titleEn: 'Hydroponics Garden',
    titleVi: 'Vườn Thủy Canh',
    linkClueEn: 'Chrono Echoes revealed as recorded human memories',
    linkClueVi: 'Bản ghi Echo thực chất là ký ức con người bị trích xuất',
  },
  {
    id: 'chapter_3_curator',
    codeEn: '03 · CURATOR',
    codeVi: '03 · CURATOR',
    titleEn: 'Behavioral Archive',
    titleVi: 'Kho Lưu Trữ Hành Vi',
    linkClueEn: 'Confirms Sera’s previous 412 loops trained WARDEN',
    linkClueVi: 'Xác nhận 412 vòng lặp trước của Sera bị dùng để huấn luyện WARDEN',
  },
  {
    id: 'chapter_4_matron',
    codeEn: '04 · MATRON-V',
    codeVi: '04 · MATRON-V',
    titleEn: 'Surgical Quarantine',
    titleVi: 'Khoang Phẫu Thuật',
    linkClueEn: 'Recovers Lysa’s Origin Key to breach the Loom Core',
    linkClueVi: 'Thu hồi Khóa Nguyên Bản của Lysa để mở Lõi Loom',
  },
  {
    id: 'chapter_5_loom',
    codeEn: '05 · LOOM CORE',
    codeVi: '05 · LÕI LOOM',
    titleEn: 'Chronicle Loom & Warden Prime',
    titleVi: 'Lõi Biên Niên & Warden Prime',
    linkClueEn: 'Final Verdict: Silence, Witness, or Continuity',
    linkClueVi: 'Phán quyết cuối cùng: Im Lặng, Nhân Chứng, hoặc Tiếp Nối',
  },
  {
    id: 'echo_zero',
    codeEn: '06 · PARADOX',
    codeVi: '06 · NGHỊCH LÝ',
    titleEn: 'ECHO-ZERO (True Ending)',
    titleVi: 'ECHO-ZERO (Kết Cục Thật)',
    linkClueEn: 'Shatter the mirror loop & rescue Lysa’s live signal',
    linkClueVi: 'Phá vỡ vòng lặp gương và giải cứu tín hiệu sống của Lysa',
  },
];

export interface ChroniclePassiveBonus {
  recoveredLogCount: number;
  completedChapterCount: number;
  maxIntegrityBonusPct: number;
  overdriveChargeBonusPct: number;
  allWeaponDamageBonusPct: number;
  damageMult: number;
  overdriveChargeMult: number;
}

export function computeChroniclePassiveBonus(
  recoveredLogs: readonly string[] | undefined,
  completedChapters: readonly CampaignChapterId[] | undefined
): ChroniclePassiveBonus {
  const logCount = Math.min(6, recoveredLogs?.length ?? 0);
  const chapCount = Math.min(6, completedChapters?.length ?? 0);
  // Only activate passive scaling once the player actually earns campaign progression (2+ logs or 1+ cleared chapter)
  const effectiveLogs = logCount >= 2 ? logCount : 0;
  const maxIntegrityBonusPct = effectiveLogs * 2;
  const overdriveChargeBonusPct = effectiveLogs * 3;
  const allWeaponDamageBonusPct = chapCount * 2;
  return {
    recoveredLogCount: logCount,
    completedChapterCount: chapCount,
    maxIntegrityBonusPct,
    overdriveChargeBonusPct,
    allWeaponDamageBonusPct,
    damageMult: 1 + allWeaponDamageBonusPct / 100,
    overdriveChargeMult: 1 + overdriveChargeBonusPct / 100,
  };
}

export function createInitialChronoNexusState(): ChronoNexusState {
  return {
    linkCount: 0,
    tier: 0,
    activeLinks: [],
    pulseCooldown: 0,
    peakLinks: 0,
    totalApexLinks: 0,
  };
}

export function resolveChronoNexusTier(linkCount: number): ChronoNexusTier {
  if (linkCount >= 4) return 4;
  if (linkCount >= 3) return 3;
  if (linkCount >= 2) return 2;
  return 0;
}

export function evaluateChronoNexusState(
  state: ChronoNexusState,
  flags: {
    overchargeActive: boolean;
    twinSyncActive: boolean;
    momentumActive: boolean;
    flashOrRiposteActive: boolean;
  },
  dt: number
): { tierUp: boolean; newTier: ChronoNexusTier; pulseReady: boolean } {
  const prevTier = state.tier;
  const links: ChronoNexusLinkTag[] = [];
  if (flags.overchargeActive) links.push('overcharge');
  if (flags.twinSyncActive) links.push('twin_sync');
  if (flags.momentumActive) links.push('momentum');
  if (flags.flashOrRiposteActive) links.push('flash_swap');

  state.activeLinks = links;
  state.linkCount = links.length;
  state.tier = resolveChronoNexusTier(links.length);
  if (state.linkCount > state.peakLinks) {
    state.peakLinks = state.linkCount;
  }

  const tierUp = state.tier > prevTier && state.tier >= 2;
  if (tierUp && state.tier === 4) {
    state.totalApexLinks += 1;
  }

  let pulseReady = false;
  if (state.pulseCooldown > 0) {
    state.pulseCooldown = Math.max(0, state.pulseCooldown - Math.max(0, dt));
  }
  if (state.tier >= 3 && state.pulseCooldown <= 0) {
    state.pulseCooldown = 4.0;
    pulseReady = true;
  }

  return {
    tierUp,
    newTier: state.tier,
    pulseReady,
  };
}

export function getChronoNexusModifiers(state: ChronoNexusState | undefined): ChronoNexusTierSpec {
  if (!state) return CHRONO_NEXUS_TIER_SPECS[0];
  return CHRONO_NEXUS_TIER_SPECS[state.tier] ?? CHRONO_NEXUS_TIER_SPECS[0];
}
