import React, { useEffect, useState } from 'react';
import { GAME_CONFIG } from '../game/config.ts';
import {
  MESHY_SLOT_SPECS,
  meshyAssetRegistry,
  type MeshyLoadedAssetSummary,
  type MeshyAssetSlotId,
} from '../game/meshy-assets.ts';
import {
  FPS_LIMIT_OPTIONS,
  RENDER_SCALE_OPTIONS,
  resolveGraphicsSettings,
} from '../game/performance.ts';
import {
  RIG_MODULES,
  RIG_SLOT_LABELS,
  VALID_RIG_MODULE_SLOTS,
  isRigModuleOverclocked,
} from '../game/rig-progression.ts';
import {
  RIG_OVERCLOCK_COST,
  SENTINEL_PROTOCOL_SPECS,
  VALID_SENTINEL_MODES,
  computeMaxChronoWard,
  computeRigSetSynergy,
} from '../game/chrono-aegis.ts';
import {
  ECHO_DOCTRINE_SPECS,
  VALID_ECHO_DOCTRINE_IDS,
  normalizeEchoDoctrineId,
} from '../game/echo-synergy.ts';
import {
  BOSS_CORE_OMEGA_COST,
  BOSS_ECHO_CORES,
  VALID_BOSS_ECHO_CORE_IDS,
  computeBossCoreModifiers,
  computeSentinelCoreConfluence,
  computeWeaponCoreAttunement,
  isBossCoreTranscended,
} from '../game/boss-echo-cores.ts';
import {
  WEAPON_OVERCLOCK_COST,
  getAllNeuralProtocolDefinitions,
} from '../game/chronicle-expansion.ts';
import { DEFAULT_LOADOUT_PRESET_NAMES } from '../game/simulation.ts';
import { computeWeaponMasteryRankInfo } from '../game/recursion-mode.ts';
import { formatGauntletClock } from '../game/chrono-overdrive.ts';
import {
  CHRONO_ACHIEVEMENTS,
  CHRONO_MUTATORS,
  SERA_RIG_SKINS,
  computeMutatorModifiers,
  formatSpeedrunClock,
  isSeraRigSkinUnlocked,
} from '../game/paradox-expansion.ts';
import {
  WEAPON_MOD_CHIPS,
  generateDailyTrialConfig,
} from '../game/ascension-expansion.ts';
import {
  DIFFICULTY_TIERS,
  LYSA_HOLO_MEMORIES,
  VALID_DIFFICULTY_TIERS,
  computeHoloMemoryResonanceBonus,
} from '../game/chronicle-narrative.ts';
import {
  CAMPAIGN_CHAPTER_DRAWER_VI,
  WEAPON_AWAKENING_COST,
  computeStanceDoctrineModifiers,
  localizeMasteryRankLabel,
  localizeNeuralProtocol,
  localizeRigModule,
  localizeRigSlotLabel,
  localizeStanceLabel,
  localizeWeaponUpgrade,
} from '../game/chronicle-awakening.ts';
import { computeMasterySealModifiers } from '../game/combat-mastery.ts';
import { t } from '../game/i18n.ts';
import { MasteryLedgerPanel } from './MasteryLedgerPanel.tsx';
import type {
  AppLocale,
  BossCheckpointState,
  BossEchoCoreId,
  BossEncounterId,
  CameraSettings,
  CampaignChapterId,
  ChronicleLoomEndingId,
  ChronoMutatorState,
  DailyTrialConfig,
  DailyTrialRecord,
  DifficultyTierId,
  EchoDoctrineId,
  EncounterCompositionId,
  HudWeaponProgressionSnapshot,
  MasteryBountyKind,
  MasteryTargetId,
  NeuralProtocolId,
  RigModuleId,
  RigModuleSlot,
  SentinelProtocolMode,
  SeraRigSkinId,
  TacticalLoadoutPresetSlot,
  WeaponId,
  WeaponModChipId,
  WeaponProgressionState,
  WeaponUpgradeId,
  WorldExplorationState,
} from '../game/types.ts';

const TITLE_NEURAL_PROTOCOLS = getAllNeuralProtocolDefinitions();

const CONCEPT_SHEET_SLOT_IDS: ReadonlySet<MeshyAssetSlotId> = new Set<MeshyAssetSlotId>([
  'player',
  'phase_stalker',
  'chrono_mortar',
  'resonance_warden',
  'bastion',
  'scrapper',
  'scout',
  'helix',
  'warden_prime',
  'arena_pillar',
]);

type BlueprintSheetId =
  | 'sheet1'
  | 'sheet2'
  | 'sheet3'
  | 'sheet4'
  | 'sheet5'
  | 'sheet6'
  | 'sheet7'
  | 'sheet8'
  | 'sheet9'
  | 'sheet10'
  | 'sheet11'
  | 'sheet12'
  | 'sheet13'
  | 'sheet14';

const CONCEPT_BLUEPRINT_SHEETS: Record<
  BlueprintSheetId,
  {
    tabLabel: string;
    src: string;
    alt: string;
    caption: string;
  }
> = {
  sheet1: {
    tabLabel: 'SHEET 1 · HEROES & APEX (8)',
    src: '/assets/aistudio/a50d34e7-1376-414f-9273-904aa05a42bf_4fc71ec7.webp',
    alt: 'Sheet 1: Sera Venn, Stalker-V9, Obelisk-M4, Conductor-R2, Aegis Bastion, Scrapper-X2, Warden Prime, Nadir-9 Pillar',
    caption: 'Sera Venn, Stalker-V9, Obelisk-M4, Conductor-R2, Aegis Bastion, Scrapper-X2, Warden Prime & Nadir-9 Pillars.',
  },
  sheet2: {
    tabLabel: 'SHEET 2 · WARDENS & ELITES (8)',
    src: '/assets/aistudio/image_bc9a74c3.png',
    alt: 'Sheet 2: Helix-04, The Choir, The Curator, Matron-V, Scout-L1, Siphon-K7, Eraser-Z0, Null Weaver',
    caption: 'Helix-04, The Choir, The Curator, Matron-V, Scout-L1, Siphon-K7, Eraser-Z0 & Null Weaver.',
  },
  sheet3: {
    tabLabel: 'SHEET 3 · WEAPONS & PROPS (8)',
    src: '/assets/aistudio/image_1194779d.png',
    alt: 'Sheet 3: Chrono Edge, Pulsecaster, Phase Rail, Grav-Breaker, Aegis Sentinel, Chronicle Loom, Flux Crate, Harmonic Pylon',
    caption: 'Chrono Edge, Pulsecaster, Phase Rail, Grav-Breaker, Aegis Sentinel, Chronicle Loom, Flux Crate & Harmonic Pylon.',
  },
  sheet4: {
    tabLabel: 'SHEET 4 · ARENA TECH (8)',
    src: '/assets/aistudio/image_62081e2e.png',
    alt: 'Sheet 4: Tactical Cover, Lore Terminal, Boost Pad, Fragment Cache, Sector Beacon, Anchor Pad, Echo Decoy, Chrono Rig',
    caption: 'Tactical Cover, Lore Terminal, Boost Pad, Fragment Cache, Sector Beacon, Anchor Pad, Echo Decoy & Chrono Rig.',
  },
  sheet5: {
    tabLabel: 'SHEET 5 · ARCHITECTURE & GEAR (8)',
    src: '/assets/aistudio/image_fe13df15.png',
    alt: 'Sheet 5: Vault Bulkhead, Harmonic Organ, Archive Monolith, Stasis Pod, Med Nanite Pod, Gravity Mine, Overclock Core, Orbital Arch',
    caption: 'Vault Bulkhead, Harmonic Organ, Archive Monolith, Stasis Pod, Med Nanite Pod, Gravity Mine, Overclock Core & Orbital Arch.',
  },
  sheet6: {
    tabLabel: 'SHEET 6 · SECTOR LANDMARKS (8)',
    src: '/assets/aistudio/image_76e4a45c.png',
    alt: 'Sheet 6: Calibration Gate, Sovereign Seal, Containment Pylon, Chrono Receiver, Lockdown Beacon, Orbital Drydock, Deck Turbine, Waypoint Spire',
    caption: 'Calibration Gate, Sovereign Seal, Containment Pylon, Chrono Receiver, Lockdown Beacon, Orbital Drydock, Deck Turbine & Waypoint Spire.',
  },
  sheet7: {
    tabLabel: 'SHEET 7 · COMBAT TECH & DAIS (8)',
    src: '/assets/aistudio/image_9a8dd2fa.png',
    alt: 'Sheet 7: Echo Collapse, Artillery Shell, Tether Node, Surge Pool, Observation Wall, Data Console, Sanctum Chime, Loom Dais',
    caption: 'Echo Collapse, Artillery Shell, Tether Node, Surge Pool, Observation Wall, Data Console, Sanctum Chime & Loom Dais.',
  },
  sheet8: {
    tabLabel: 'SHEET 8 · BOSS ARMS & SKILLS (8)',
    src: '/assets/aistudio/image_cb497380.png',
    alt: 'Sheet 8: Helical Drill, Harmonic Fork, Archive Staff, Excision Saw, Directive Lance, Parry Aegis, Chrono Sever, False Echo',
    caption: 'Helical Drill, Harmonic Fork, Archive Staff, Excision Saw, Directive Lance, Parry Aegis, Chrono Sever & False Echo.',
  },
  sheet9: {
    tabLabel: 'SHEET 9 · GATES & LOOM TECH (8)',
    src: '/assets/aistudio/image_da3ce7ee.png',
    alt: 'Sheet 9: Barrier Bollard, Final Gate, Relay Beacon, Floodlight Pod, Gantry Crane, Memory Slab, Origin Anchor, Directive Core',
    caption: 'Barrier Bollard, Final Gate, Relay Beacon, Floodlight Pod, Gantry Crane, Memory Slab, Origin Anchor & Directive Core.',
  },
  sheet10: {
    tabLabel: 'SHEET 10 · RIFT & ORBITAL TECH (8)',
    src: '/assets/aistudio/image_8c4b8cb2.png',
    alt: 'Sheet 10: Temporal Rift, Escape Shuttle, Convergence Pillar, Orbital Debris, Cryo Med-Table, Tactical Holo-Table, Warp Relay Pad, Blast Strobe',
    caption: 'Temporal Rift, Escape Shuttle, Convergence Pillar, Orbital Debris, Cryo Med-Table, Tactical Holo-Table, Warp Relay Pad & Blast Strobe.',
  },
  sheet11: {
    tabLabel: 'SHEET 11 · OVERDRIVE & GAUNTLET (8)',
    src: '/assets/aistudio/image_c5feb58e.png',
    alt: 'Sheet 11: Chrono Stasis Core, Sovereign Obelisk, Field Refit Drone, Overdrive Conduit, Phase-Blade MK.II, Singularity Grenade, Orbital Watchtower, Quantum Archive Vault',
    caption: 'Chrono Stasis Core, Sovereign Obelisk, Field Refit Drone, Overdrive Conduit, Phase-Blade MK.II, Singularity Grenade, Orbital Watchtower & Quantum Archive Vault.',
  },
  sheet12: {
    tabLabel: 'SHEET 12 · EXPEDITION & SAFE-ROOM (8)',
    src: '/assets/aistudio/image_84a84594.png',
    alt: 'Sheet 12: Med-Supply Cryo Bay, Field Refit Workbench, Lysa Venn Holo-Console, Secret Echo Relic Vault, Echo Pressure Switch Pad, Laser Cage Emitter, Station Holo-Map Table, Sovereign NG+ Crest',
    caption: 'Med-Supply Cryo Bay, Field Refit Workbench, Lysa Venn Holo-Console, Secret Echo Relic Vault, Echo Pressure Switch Pad, Laser Cage Emitter, Station Holo-Map Table & Sovereign NG+ Crest.',
  },
  sheet13: {
    tabLabel: 'SHEET 13 · PARADOX BREAK (8)',
    src: '/assets/aistudio/image_f8f9592b.png',
    alt: 'Sheet 13: ECHO-ZERO, Combat Drone Mk.II, Field Fabricator Kiosk, Paradox Rift Gate, Med-Nanite Injector, Aegis Shield Emitter, Sovereign Prime Rig, Paradox Prism Rig',
    caption: 'ECHO-ZERO Mirror-Sera Boss, Manta Combat Drone Mk.II, Field Fabricator Kiosk, Paradox Rift Gate, Med-Nanite Injector, Honeycomb Aegis Shield Emitter, Sovereign Prime Crown Rig & Paradox Prism Crystal Rig.',
  },
  sheet14: {
    tabLabel: 'SHEET 14 · CHRONO ASCENSION (8)',
    src: '/assets/aistudio/sheet14_chrono_ascension.jpg',
    alt: 'Sheet 14: Chrono Scythe, Volt Arc Chip, Siphon Leech Chip, Chrono Nova Chip, Style SSS Crest, Daily Trial Obelisk, Chrono Finisher Rift, Photo Drone Lens',
    caption: 'Chrono Scythe Polearm [5], Volt Arc / Siphon Leech / Chrono Nova Weapon Mod Chips, Style SSS Holographic Crest, Daily Trial Obelisk, Chrono Finisher Rift Burst & 3D Photo Drone Lens.',
  },
};

type ActiveTitleDrawer = 'none' | 'chapters' | 'practice' | 'archive' | 'controls';

interface TitleScreenProps {
  onStartCampaign: () => void;
  onStartExpeditionJourney?: () => void;
  onStartNewGamePlus?: () => void;
  onStartPracticeStandard?: (encounterId?: EncounterCompositionId) => void;
  onStartRecursion?: () => void;
  onStartBossGauntlet?: () => void;
  onToggleOverdrive?: (enabled: boolean) => void;
  onSelectDifficultyTier?: (tier: DifficultyTierId) => void;
  onStartBoss?: (bossId?: BossEncounterId) => void;
  unlockedChapters?: CampaignChapterId[];
  completedChapters?: CampaignChapterId[];
  recoveredLogs?: string[];
  completedEndings?: ChronicleLoomEndingId[];
  activeChapter?: CampaignChapterId;
  savedCampaignChapter?: CampaignChapterId | null;
  savedCampaignCheckpoint?: BossCheckpointState | null;
  onSelectCampaignChapter?: (chapter: CampaignChapterId) => void;
  hasSavedCampaignSnapshot?: boolean;
  onRestoreSavedCampaign?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  tutorialEnabled?: boolean;
  onToggleTutorial?: () => void;
  cameraSettings?: CameraSettings;
  onUpdateCameraSettings?: (settings: Partial<CameraSettings>) => void;
  progression?: WeaponProgressionState | HudWeaponProgressionSnapshot;
  exploration?: WorldExplorationState;
  equippedWeaponId?: WeaponId;
  onSelectWeapon?: (weaponId: WeaponId) => void;
  onPurchaseUpgrade?: (upgradeId: WeaponUpgradeId) => void;
  onEquipUpgrade?: (weaponId: WeaponId, upgradeId: WeaponUpgradeId | null) => void;
  onPurchaseRigModule?: (moduleId: RigModuleId) => void;
  onEquipRigModule?: (slot: RigModuleSlot, moduleId: RigModuleId | null) => void;
  onOverclockUpgrade?: (upgradeId: WeaponUpgradeId) => void;
  onAwakenUpgrade?: (upgradeId: WeaponUpgradeId) => void;
  onPurchaseNeuralProtocol?: (protocolId: NeuralProtocolId) => void;
  onEquipSkin?: (skinId: SeraRigSkinId) => void;
  onToggleMutator?: (key: keyof ChronoMutatorState) => void;
  onToggleSpeedrunHud?: () => void;
  onStartEchoZero?: () => void;
  locale?: AppLocale;
  onToggleLocale?: () => void;
  dailyTrialConfig?: DailyTrialConfig;
  dailyTrialRecord?: DailyTrialRecord | null;
  onStartDailyTrial?: () => void;
  onUnlockChronoScythe?: () => void;
  onEquipModChip?: (chipId: WeaponModChipId | null) => void;
  onOverclockRigModule?: (moduleId: RigModuleId) => void;
  onSetSentinelProtocol?: (mode: SentinelProtocolMode) => void;
  onSetEchoDoctrine?: (doctrineId: EchoDoctrineId) => void;
  onUnlockBossCore?: (coreId: BossEchoCoreId) => void;
  onEquipBossCore?: (coreId: BossEchoCoreId | null) => void;
  onTranscendBossCore?: (coreId: BossEchoCoreId) => void;
  onSaveLoadoutPreset?: (slotIndex: TacticalLoadoutPresetSlot) => void;
  onApplyLoadoutPreset?: (slotIndex: TacticalLoadoutPresetSlot) => void;
  onClaimMasteryBounty?: (targetId: MasteryTargetId, kind: MasteryBountyKind) => void;
  onClaimAllMasteryBounties?: () => void;
}

const CHAPTER_METADATA: Array<{
  id: CampaignChapterId;
  code: string;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  unlockRequirement: string;
}> = [
  {
    id: 'prologue',
    code: 'PROLOGUE',
    label: 'Prologue · Wake',
    title: 'Prologue: Wake',
    subtitle: 'Calibration Bay 04',
    description:
      'Bring Sera Venn’s Chrono Rig online, neutralize 3 WARDEN security proxies, and unlock the 3-stage Calibration Gate.',
    unlockRequirement: 'Available on initial launch',
  },
  {
    id: 'chapter_1_helix',
    code: 'CHAPTER I',
    label: 'Ch.I · HELIX-04',
    title: 'Chapter I: A Place That Remembers',
    subtitle: 'Marshal HELIX-04',
    description:
      'Breach Primary Containment and dismantle WARDEN Security Marshal HELIX-04 using directional parries and Echo Convergence.',
    unlockRequirement: 'Complete Prologue: Wake in Calibration Bay 04 to unlock',
  },
  {
    id: 'chapter_2_choir',
    code: 'CHAPTER II',
    label: 'Ch.II · THE CHOIR',
    title: 'Chapter II: Garden of Repeated Days',
    subtitle: 'THE CHOIR',
    description:
      'Shatter the Harmonic Confluence shield by priming one pylon with a Chrono Echo and striking a linked pylon with live Sera.',
    unlockRequirement: 'Defeat Marshal HELIX-04 in Chapter I to unlock',
  },
  {
    id: 'chapter_3_curator',
    code: 'CHAPTER III',
    label: 'Ch.III · THE CURATOR',
    title: 'Chapter III: The Archive That Answers',
    subtitle: 'THE CURATOR',
    description:
      'Read reconstructed attack traces and deploy Gravity Pin [G] to anchor false-Echo decoys and interrupt boss telegraphs.',
    unlockRequirement: 'Defeat THE CHOIR in Chapter II to unlock',
  },
  {
    id: 'chapter_4_matron',
    code: 'CHAPTER IV',
    label: 'Ch.IV · MATRON-V',
    title: 'Chapter IV: A System That Wants You Dead',
    subtitle: 'MATRON-V, The Surgeon',
    description:
      'Counter Siphon and Eraser units while detonating active Echoes with Echo Collapse [X] before Chrono Sever purges your track.',
    unlockRequirement: 'Defeat THE CURATOR in Chapter III to unlock',
  },
  {
    id: 'chapter_5_loom',
    code: 'CHAPTER V',
    label: 'Ch.V · Chronicle Loom',
    title: 'Chapter V: The Last Loop',
    subtitle: 'Chronicle Loom Core',
    description:
      'Access the central behavioral archive of Nadir-9 and choose humanity’s final directive: Silence, Witness, or Continuity.',
    unlockRequirement: 'Defeat MATRON-V in Chapter IV to unlock',
  },
];

const PRACTICE_ENCOUNTERS: Array<{
  testId: string;
  bossId?: BossEncounterId;
  encounterId?: EncounterCompositionId;
  code: string;
  codeVi: string;
  title: string;
  titleVi: string;
  focus: string;
  focusVi: string;
  accentClass: string;
}> = [
  {
    testId: 'title-btn-practice-standard',
    encounterId: 'prologue_calibration_bay',
    code: 'TEACH · 1 WAVE',
    codeVi: 'HƯỚNG DẪN · 1 ĐỢT',
    title: 'Practice · Calibration Bay',
    titleVi: 'Tập Luyện · Khoang Hiệu Chuẩn 04',
    focus: 'Echo recording [T], replay [Y], Relay warp [V], and the 3-step Calibration puzzle.',
    focusVi: 'Ghi Vọng Âm [T], phát lại [Y], Dịch Chuyển [V] và giải đố Cổng Hiệu Chuẩn 3 bước.',
    accentClass: 'border-slate-700 hover:border-cyan-400/70 text-slate-200',
  },
  {
    testId: 'title-btn-practice-mastery',
    encounterId: 'tactical_mastery_gauntlet',
    code: 'MASTER · 2 WAVES',
    codeVi: 'TINH THÔNG · 2 ĐỢT',
    title: 'Practice · Tactical Mastery Gauntlet',
    titleVi: 'Tập Luyện · Thử Thách Chiến Thuật 2 Đợt',
    focus: 'Two-wave mastery trial: Wave 1 Shield + Flank + Ranged -> Wave 2 Siphon + Eraser + Bastion.',
    focusVi: 'Thử thách 2 đợt: Đợt 1 Khiên + Bọc Sườn + Tầm Xa -> Đợt 2 Siphon + Eraser + Bastion.',
    accentClass: 'border-rose-500/60 hover:border-rose-400 text-rose-200',
  },
  {
    testId: 'title-btn-practice-apex-bestiary',
    encounterId: 'tactical_apex_bestiary',
    code: 'NEW · 2 WAVES',
    codeVi: 'MỚI · 2 ĐỢT',
    title: 'Practice · Apex Bestiary Trial',
    titleVi: 'Tập Luyện · Tinh Anh & Quái Đỉnh Cao',
    focus: 'Fight Phase Stalker (blink flank), Siege Mortar Tripod (3-ring artillery), Harmonic Conductor (shield tether) & Elite Affixes.',
    focusVi: 'Đối đầu Stalker Dịch Chuyển, Pháo Cối 3 Vòng, Nhạc Trưởng Dây Khiên và các Quái Tinh Anh.',
    accentClass: 'border-emerald-500/70 hover:border-emerald-300 text-emerald-200',
  },
  {
    testId: 'title-btn-practice-guard-flank',
    encounterId: 'tactical_guard_and_flank',
    code: 'PRACTICE · 1 WAVE',
    codeVi: 'CƠ BẢN · 1 ĐỢT',
    title: 'Practice · Guard & Flank Drill',
    titleVi: 'Tập Luyện · Phá Khiên & Bọc Sườn',
    focus: '1 Bastion Shield + 2 Scrapper Flankers. Practice Echo distraction or Breaker Cleave.',
    focusVi: '1 Khiên Bastion + 2 Scrapper Bọc Sườn. Luyện mồi nhử Vọng Âm hoặc chém phá khiên.',
    accentClass: 'border-sky-500/50 hover:border-sky-400 text-sky-200',
  },
  {
    testId: 'title-btn-practice-crossfire',
    encounterId: 'tactical_crossfire_suppression',
    code: 'COMBINE · 1 WAVE',
    codeVi: 'PHỐI HỢP · 1 ĐỢT',
    title: 'Practice · Crossfire Suppression',
    titleVi: 'Tập Luyện · Chế Áp Làn Đạn Chéo',
    focus: '1 Bastion + 2 Ranged Scouts. Use pillar LOS cover and Pulsecaster Lance interrupts.',
    focusVi: '1 Bastion + 2 Trinh Sát Tầm Xa. Tận dụng cột chắn tầm nhìn và Xung Kích ngắt đòn.',
    accentClass: 'border-indigo-500/50 hover:border-indigo-400 text-indigo-200',
  },
  {
    testId: 'title-btn-practice-disruption',
    encounterId: 'tactical_temporal_disruption',
    code: 'COMBINE · 1 WAVE',
    codeVi: 'PHỐI HỢP · 1 ĐỢT',
    title: 'Practice · Temporal Disruption',
    titleVi: 'Tập Luyện · Nhiễu Loạn Thời Không',
    focus: 'Siphon, Null Weaver, Eraser, Aegis Sentinel & Bastion with Gravity Pin [G] and Echo Collapse [X].',
    focusVi: 'Siphon, Null Weaver, Eraser, Aegis & Bastion kết hợp Ghim Trọng Trường [G] và Kích Nổ Echo [X].',
    accentClass: 'border-purple-500/50 hover:border-purple-400 text-purple-200',
  },
  {
    testId: 'title-btn-boss',
    bossId: 'helix-04',
    code: 'WARDEN 01',
    codeVi: 'THỐNG LĨNH 01',
    title: 'Practice · HELIX-04 [B]',
    titleVi: 'Đấu Trùm · HELIX-04 [B]',
    focus: 'Frontal armor counterplay, Vector Ram dodges, Helical Sweep parries, and Convergence.',
    focusVi: 'Khắc chế giáp trước, né Húc Vector, Đỡ Đòn [Q] Quét Xoắn Ốc và đòn Hội Tụ Vọng Âm.',
    accentClass: 'border-amber-500/50 hover:border-amber-400 text-amber-300',
  },
  {
    testId: 'title-btn-boss-choir',
    bossId: 'the-choir',
    code: 'WARDEN 02',
    codeVi: 'THỐNG LĨNH 02',
    title: 'THE CHOIR',
    titleVi: 'Đấu Trùm · DÀN ĐỒNG CA (THE CHOIR)',
    focus: 'Multi-target Harmonic Node synchronization within the 8.5s resonance window.',
    focusVi: 'Đồng bộ Trụ Hòa Âm đa mục tiêu cùng Vọng Âm trong khung cộng hưởng 8.5 giây.',
    accentClass: 'border-cyan-500/50 hover:border-cyan-400 text-cyan-300',
  },
  {
    testId: 'title-btn-boss-curator',
    bossId: 'the-curator',
    code: 'WARDEN 03',
    codeVi: 'THỐNG LĨNH 03',
    title: 'THE CURATOR',
    titleVi: 'Đấu Trùm · KẺ GIÁM TUYỂN (THE CURATOR)',
    focus: 'Reconstructed trace reading, False-Echo decoys, and Gravity Pin [G] interrupts.',
    focusVi: 'Đọc vệt đòn tái tạo, phân biệt Vọng Âm Giả và dùng Ghim Trọng Trường [G] ngắt chiêu.',
    accentClass: 'border-purple-500/50 hover:border-purple-400 text-purple-300',
  },
  {
    testId: 'title-btn-boss-matron',
    bossId: 'matron-v',
    code: 'WARDEN 04',
    codeVi: 'THỐNG LĨNH 04',
    title: 'MATRON-V',
    titleVi: 'Đấu Trùm · MATRON-V',
    focus: 'Siphon Flux defense, Chrono Sever evasion, and Echo Collapse [X] detonation.',
    focusVi: 'Chống hút Flux, né Cắt Đứt Thời Không và chủ động Kích Nổ Vọng Âm [X].',
    accentClass: 'border-rose-500/50 hover:border-rose-400 text-rose-300',
  },
  {
    testId: 'title-btn-boss-warden-prime',
    bossId: 'warden-prime',
    code: 'WARDEN 05',
    codeVi: 'THỐNG LĨNH 05',
    title: 'WARDEN PRIME',
    titleVi: 'Đấu Trùm · WARDEN PRIME',
    focus: 'Sovereign Loom Architect: Directive Lance, Convergence Grid, and Purge Wave.',
    focusVi: 'Kiến Trúc Sư Khung Cửi Tối Thượng: Thương Chỉ Thị, Lưới Hội Tụ và Sóng Thanh Trừng.',
    accentClass: 'border-emerald-500/50 hover:border-emerald-400 text-emerald-300',
  },
  {
    testId: 'title-btn-boss-echo-zero',
    bossId: 'echo-zero',
    code: 'SECRET WARDEN 06',
    codeVi: 'TRÙM ẨN 06',
    title: 'ECHO-ZERO · MIRROR-SERA',
    titleVi: 'TRÙM ẨN · ECHO-ZERO (BẢN SAO SERA)',
    focus: 'Hidden Paradox Super-Boss (920 HP): Blink Slash, Rail Lance & Twin Pincer. Unlocks Paradox Break Ending.',
    focusVi: 'Siêu Trùm Nghịch Lý (920 HP): Chém Chớp Nhoáng, Thương Điện Từ & Gọng Kìm Đôi. Mở khóa Kết Cục Nghịch Lý.',
    accentClass: 'border-fuchsia-500/70 hover:border-fuchsia-300 text-fuchsia-200',
  },
];

function getChapterShortName(chapter: CampaignChapterId | null | undefined): string {
  const found = CHAPTER_METADATA.find((c) => c.id === chapter);
  return found ? found.label : 'Active Sector';
}

export const TitleScreen: React.FC<TitleScreenProps> = React.memo(({
  onStartCampaign,
  onStartExpeditionJourney,
  onStartNewGamePlus,
  onStartPracticeStandard,
  onStartRecursion,
  onStartBossGauntlet,
  onToggleOverdrive,
  onSelectDifficultyTier,
  onStartBoss,
  unlockedChapters = ['prologue'],
  completedChapters = [],
  recoveredLogs = ['LOG-00'],
  completedEndings = [],
  activeChapter = 'prologue',
  savedCampaignChapter = null,
  savedCampaignCheckpoint = null,
  onSelectCampaignChapter,
  hasSavedCampaignSnapshot = false,
  onRestoreSavedCampaign,
  isMuted,
  onToggleMute,
  tutorialEnabled = true,
  onToggleTutorial,
  cameraSettings,
  onUpdateCameraSettings,
  progression,
  exploration,
  equippedWeaponId = 'chrono_edge',
  onSelectWeapon,
  onPurchaseUpgrade,
  onEquipUpgrade,
  onPurchaseRigModule,
  onEquipRigModule,
  onOverclockUpgrade,
  onAwakenUpgrade,
  onPurchaseNeuralProtocol,
  onEquipSkin,
  onToggleMutator,
  onToggleSpeedrunHud,
  onStartEchoZero,
  locale = 'en',
  onToggleLocale,
  dailyTrialConfig,
  dailyTrialRecord = null,
  onStartDailyTrial,
  onUnlockChronoScythe,
  onEquipModChip,
  onOverclockRigModule,
  onSetSentinelProtocol,
  onSetEchoDoctrine,
  onUnlockBossCore,
  onEquipBossCore,
  onTranscendBossCore,
  onSaveLoadoutPreset,
  onApplyLoadoutPreset,
  onClaimMasteryBounty,
  onClaimAllMasteryBounties,
}) => {
  const [activeDrawer, setActiveDrawer] = useState<ActiveTitleDrawer>('none');
  const [practiceSubTab, setPracticeSubTab] = useState<'arenas' | 'mastery'>('arenas');
  const [archiveTab, setArchiveTab] = useState<'arsenal' | 'meshy'>('arsenal');
  const [activeBlueprintSheet, setActiveBlueprintSheet] = useState<BlueprintSheetId>('sheet14');
  const resolvedDailyTrial = dailyTrialConfig ?? generateDailyTrialConfig();
  const [meshyLoaded, setMeshyLoaded] = useState<
    Partial<Record<MeshyAssetSlotId, MeshyLoadedAssetSummary>>
  >(() => meshyAssetRegistry.getLoadedSummaries());
  const [copiedSlotId, setCopiedSlotId] = useState<MeshyAssetSlotId | null>(null);
  const [meshyStatusMsg, setMeshyStatusMsg] = useState<string | null>(null);
  const [bundleDownloadStatus, setBundleDownloadStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    return meshyAssetRegistry.subscribe(() => {
      setMeshyLoaded(meshyAssetRegistry.getLoadedSummaries());
    });
  }, []);

  const meshyLoadedCount = Object.keys(meshyLoaded).length;

  const handleCopyMeshyPrompt = (slotId: MeshyAssetSlotId, promptText: string) => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        void navigator.clipboard.writeText(promptText).catch(() => {});
      }
    } catch {
      // Clipboard fallback silently ignored in restricted iframes
    }
    setCopiedSlotId(slotId);
    setMeshyStatusMsg(`Copied Meshy.ai prompt for ${slotId.toUpperCase()} — paste into Meshy Text-to-3D!`);
    setTimeout(() => setCopiedSlotId((prev) => (prev === slotId ? null : prev)), 2200);
  };

  const handleImportMeshyGlb = async (slotId: MeshyAssetSlotId, file: File | null) => {
    if (!file) return;
    setMeshyStatusMsg(`Parsing ${file.name}...`);
    try {
      const summary = await meshyAssetRegistry.loadFromFile(slotId, file);
      setMeshyStatusMsg(
        `Hot-swapped ${slotId.toUpperCase()} with ${summary.fileName} (${summary.triangleCount.toLocaleString()} tris, ${summary.meshCount} meshes).`
      );
    } catch (err) {
      setMeshyStatusMsg(
        `Failed to load ${file.name}: ${err instanceof Error ? err.message : 'Invalid GLB file'}`
      );
    }
  };

  const handleMarkBundleDownloaded = () => {
    setBundleDownloadStatus('saved');
    setTimeout(() => setBundleDownloadStatus('idle'), 3000);
  };

  const toggleDrawer = (drawer: Exclude<ActiveTitleDrawer, 'none'>) => {
    setActiveDrawer((prev) => (prev === drawer ? 'none' : drawer));
  };

  const [chaptersViewMode, setChaptersViewMode] = useState<'sectors' | 'holo'>('sectors');
  const [selectedTitleHoloId, setSelectedTitleHoloId] = useState<string>('holo_prologue_lysa');

  const unlockedCount = CHAPTER_METADATA.filter((ch) =>
    unlockedChapters.includes(ch.id)
  ).length;
  const unlockedWeaponIds = progression?.unlockedWeaponIds ?? ['chrono_edge', 'pulsecaster'];
  const codexCount = exploration?.discoveredCodexIds?.length ?? 0;
  const secretCount = exploration?.discoveredSecretIds?.length ?? 0;
  const discoveredHoloIds = exploration?.discoveredHoloMemoryIds ?? [];
  const holoResonance = computeHoloMemoryResonanceBonus(discoveredHoloIds);
  const stanceMods = computeStanceDoctrineModifiers(exploration?.resolvedStoryChoices);
  const masterySeal = computeMasterySealModifiers(progression?.combatMastery);

  return (
    <div
      className="fixed inset-0 z-20 flex flex-col justify-between p-3 sm:p-5 lg:p-7 pointer-events-auto overflow-y-auto"
      style={{
        background:
          'linear-gradient(92deg, rgba(4,8,15,0.93) 0%, rgba(4,8,15,0.78) 36%, rgba(4,8,15,0.16) 68%, rgba(4,8,15,0.06) 100%)',
      }}
    >
      {/* Top Bar: Station Designation & Clean Horological Utility Controls */}
      <header className="flex items-center justify-between w-full gap-3 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] tracking-[0.18em] text-slate-400 font-mono-tabular uppercase min-w-0">
          <span className="text-cyan-300 font-semibold whitespace-nowrap">
            {t(locale, 'stationHeader')}
          </span>
          <span aria-hidden="true" className="hidden sm:inline text-slate-600">·</span>
          <span className="hidden md:inline text-slate-300/90 truncate">
            {unlockedCount}/6 {t(locale, 'progressSectors')} · {recoveredLogs.length}/6{' '}
            {t(locale, 'progressLogs')} · {completedEndings.length}/3{' '}
            {t(locale, 'progressEndings')}
            {masterySeal.tier >= 1 && (
              <span data-testid="title-header-seal-tier" className="text-amber-300 font-semibold">
                {' · '}
                {locale === 'vi' ? `ẤN ${['', 'I', 'II', 'III', 'IV Ω'][masterySeal.tier]}` : `SEAL ${['', 'I', 'II', 'III', 'IV Ω'][masterySeal.tier]}`}
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onToggleLocale && (
            <button
              type="button"
              data-testid="title-btn-locale"
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleLocale();
              }}
              aria-label="Toggle Language English / Vietnamese"
              className="pointer-events-auto flex items-center px-2.5 py-1.5 text-[11px] font-mono-tabular font-bold border-t border-b border-amber-400/45 bg-[#060b14]/86 hover:bg-[#101c2e] text-amber-200 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>{t(locale, 'languageToggle')}</span>
            </button>
          )}
          <button
            type="button"
            data-testid="title-header-btn-settings"
            aria-expanded={activeDrawer === 'controls'}
            onClick={(e) => {
              e.currentTarget.blur();
              toggleDrawer('controls');
            }}
            className={`pointer-events-auto flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono-tabular border-t border-b transition-colors cursor-pointer whitespace-nowrap ${
              activeDrawer === 'controls'
                ? 'bg-[#102033] border-cyan-400 text-cyan-200 font-bold'
                : 'bg-[#060b14]/86 hover:bg-[#101c2e] border-white/15 text-slate-200'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 text-cyan-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.85 1 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>{t(locale, 'settings')}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-mono-tabular text-slate-200 bg-[#060b14]/86 hover:bg-[#101c2e] border-t border-b border-white/15 transition-colors cursor-pointer whitespace-nowrap"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 text-cyan-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {isMuted ? (
                <>
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </>
              ) : (
                <>
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </>
              )}
            </svg>
            <span>{isMuted ? t(locale, 'audioMuted') : t(locale, 'audioActive')}</span>
          </button>
        </div>
      </header>

      {/* Main Two-Column Composition */}
      <div className="my-auto py-2 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-center w-full max-w-7xl mx-auto">
        {/* Left Column: Bespoke Borderless Horological Identity & Sleek Command Hierarchy */}
        <section className="lg:col-span-5 pointer-events-auto flex flex-col items-start">
          {/* Borderless Luminous Horological Emblem & Title Lockup */}
          <div className="mb-3 w-full">
            <svg
              viewBox="0 0 500 116"
              className="w-full max-w-[430px] h-auto overflow-visible"
              role="img"
              aria-label="AFTERFRAME: THE LAST LOOP"
            >
              <g transform="translate(44, 58)">
                <circle
                  cx="0"
                  cy="0"
                  r="36"
                  fill="rgba(6, 11, 20, 0.72)"
                  stroke="rgba(34, 211, 238, 0.3)"
                  strokeWidth="1.25"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="29"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2.2"
                  strokeDasharray="40 12 16 12"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="19"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="22 10"
                />
                <polygon
                  points="0,-13 11,0 0,13 -11,0"
                  fill="#22d3ee"
                  stroke="#f8fafc"
                  strokeWidth="1.2"
                />
                <line x1="-42" y1="0" x2="-31" y2="0" stroke="#22d3ee" strokeWidth="1.8" />
                <line x1="31" y1="0" x2="42" y2="0" stroke="#22d3ee" strokeWidth="1.8" />
                <line x1="0" y1="-42" x2="0" y2="-31" stroke="#f59e0b" strokeWidth="1.8" />
                <line x1="0" y1="31" x2="0" y2="42" stroke="#f59e0b" strokeWidth="1.8" />
              </g>

              <text
                x="104"
                y="62"
                fill="#f8fafc"
                fontFamily="'Chakra Petch', sans-serif"
                fontWeight="700"
                fontSize="46"
                letterSpacing="4.5"
              >
                AFTERFRAME
              </text>

              <line x1="106" y1="74" x2="296" y2="74" stroke="rgba(34, 211, 238, 0.55)" strokeWidth="1.2" />
              <line x1="296" y1="74" x2="438" y2="74" stroke="rgba(245, 158, 11, 0.7)" strokeWidth="1.2" />

              <text
                x="106"
                y="95"
                fill="#67e8f9"
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="600"
                fontSize="12.5"
                letterSpacing="5.5"
              >
                THE LAST LOOP
              </text>
            </svg>
          </div>

          {/* Concise Localized Premise */}
          <p className="text-slate-300/95 text-xs sm:text-[13px] leading-relaxed mb-4 max-w-[420px]">
            {t(locale, 'heroPremisePrefix')}{' '}
            <span className="text-white font-semibold">Nadir-9</span>
            {t(locale, 'heroPremiseMid')}{' '}
            <span className="text-cyan-300 font-semibold">Sera Venn</span>{' '}
            {t(locale, 'heroPremiseSuffix')}
          </p>

          {/* Tier 1 — Primary Hero CTA (Single dominant visual anchor) */}
          <div className="w-full max-w-[420px] flex flex-col gap-2 mb-3">
            {hasSavedCampaignSnapshot && onRestoreSavedCampaign && (
              <button
                type="button"
                data-testid="title-btn-restore-campaign"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onRestoreSavedCampaign();
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 text-slate-950 font-display font-bold text-sm sm:text-base tracking-wider uppercase transition-colors cursor-pointer shadow-[0_0_24px_rgba(34,211,238,0.28)]"
              >
                <span>{t(locale, 'campaignContinue')}</span>
                <span
                  data-testid="title-saved-campaign-badge"
                  className="text-[11px] font-mono-tabular font-semibold bg-slate-950/15 px-2 py-0.5"
                >
                  {getChapterShortName(savedCampaignChapter)}
                  {savedCampaignCheckpoint
                    ? ` · ${savedCampaignCheckpoint.integrity} HP`
                    : ''}
                </span>
              </button>
            )}

            <button
              type="button"
              data-start="true"
              data-testid="title-btn-new-run"
              onClick={(e) => {
                e.currentTarget.blur();
                onStartCampaign();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 font-display font-bold text-sm sm:text-base tracking-wider uppercase transition-colors cursor-pointer ${
                hasSavedCampaignSnapshot
                  ? 'bg-gradient-to-r from-[#0a1626]/95 to-[#0d1d33]/85 hover:from-[#122640] hover:to-[#152d4b] border-t border-cyan-400/80 border-b border-white/10 text-cyan-100'
                  : 'bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.3)]'
              }`}
            >
              <span>{t(locale, 'campaignStart')} [ENTER]</span>
              <span
                className={`text-[10px] font-mono-tabular font-semibold ${
                  hasSavedCampaignSnapshot ? 'text-cyan-300/90' : 'text-slate-900'
                }`}
              >
                {t(locale, 'campaignPrologueTag')}
              </span>
            </button>
          </div>

          {/* Tier 2 — Sleek Horological 2x2 Mode Tiles (Top-hairline obsidian gradients, zero wireframe clutter) */}
          <div className="w-full max-w-[420px] grid grid-cols-2 gap-2 mb-3">
            {/* Slot 1: Expedition Journey + inline NG+ trigger */}
            {(onStartExpeditionJourney || onStartNewGamePlus) && (
              <div className="flex flex-col justify-between bg-gradient-to-b from-[#08121f]/90 to-[#050a12]/78 border-t border-emerald-400/55 border-b border-white/10 hover:from-[#0d1c2e]/95 transition-colors p-2.5 gap-1.5">
                {onStartExpeditionJourney && (
                  <button
                    type="button"
                    data-testid="title-btn-expedition-journey"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onStartExpeditionJourney();
                    }}
                    className="w-full text-left cursor-pointer group"
                  >
                    <div className="text-xs font-display font-bold uppercase tracking-wider text-emerald-300 group-hover:text-emerald-200 truncate">
                      {t(locale, 'expeditionBtn')}
                    </div>
                    <div className="text-[9px] font-mono-tabular text-slate-400 truncate mt-0.5">
                      {t(locale, 'expeditionSub')}
                    </div>
                  </button>
                )}
                {onStartNewGamePlus && (
                  <button
                    type="button"
                    data-testid="title-btn-new-game-plus"
                    data-ng-cycle={progression?.ngPlusCycle ?? 0}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onStartNewGamePlus();
                    }}
                    className="w-full flex items-center justify-between pt-1.5 border-t border-white/8 text-[9px] font-mono-tabular font-bold uppercase text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
                  >
                    <span>{t(locale, 'newGamePlusBtn')}{(progression?.ngPlusCycle ?? 0) + 1}</span>
                    <span className="text-amber-200/80">+35% HP →</span>
                  </button>
                )}
              </div>
            )}

            {/* Slot 2: Daily Chrono Trial */}
            {onStartDailyTrial && (
              <button
                type="button"
                data-testid="title-btn-daily-trial"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onStartDailyTrial();
                }}
                className="flex flex-col justify-between bg-gradient-to-b from-[#15110a]/92 to-[#090806]/80 hover:from-[#211a0e]/95 border-t border-amber-400/70 border-b border-white/10 p-2.5 text-left transition-colors cursor-pointer"
              >
                <div className="w-full">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-display font-bold uppercase tracking-wider text-amber-300 truncate">
                      {t(locale, 'dailyTrialBtn')}
                    </span>
                    <span className="text-[8px] font-mono-tabular text-amber-200/75 shrink-0">
                      {resolvedDailyTrial.seedCode.replace('TRIAL-', '')}
                    </span>
                  </div>
                  <div className="text-[9px] font-mono-tabular text-slate-400 truncate mt-0.5">
                    {resolvedDailyTrial.bossLabel}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono-tabular pt-1.5 mt-1 border-t border-white/8">
                  <span className="text-cyan-300 font-bold truncate">
                    {dailyTrialRecord
                      ? `${dailyTrialRecord.bestScore} · ${dailyTrialRecord.peakRank}`
                      : t(locale, 'dailyNoClear')}
                  </span>
                  <span className="text-amber-300/80 shrink-0">
                    {dailyTrialRecord ? formatSpeedrunClock(dailyTrialRecord.bestTimeSec) : '[5]'}
                  </span>
                </div>
              </button>
            )}

            {/* Slot 3: Sovereign Boss Gauntlet */}
            {onStartBossGauntlet && (
              <button
                type="button"
                data-testid="title-btn-boss-gauntlet"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onStartBossGauntlet();
                }}
                className="flex flex-col justify-between bg-gradient-to-b from-[#08121f]/90 to-[#050a12]/78 hover:from-[#121c2c]/95 border-t border-amber-300/45 border-b border-white/10 p-2.5 text-left transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-xs font-display font-bold uppercase tracking-wider text-amber-200 truncate">
                    {t(locale, 'bossGauntlet')}
                  </div>
                  <div className="text-[9px] font-mono-tabular text-slate-400 truncate mt-0.5">
                    {t(locale, 'bossGauntletSub')}
                  </div>
                </div>
                <div className="text-[9px] font-mono-tabular text-amber-300/90 pt-1.5 mt-1 border-t border-white/8 truncate">
                  {progression?.bestGauntletTimeSec
                    ? `${t(locale, 'dailyBest')} ${formatGauntletClock(progression.bestGauntletTimeSec)}`
                    : `CLR ${progression?.totalGauntletClears ?? 0}`}
                </div>
              </button>
            )}

            {/* Slot 4: Endless Recursion + inline Difficulty selector */}
            {(onStartRecursion || onToggleOverdrive) && (
              <div className="flex flex-col justify-between bg-gradient-to-b from-[#0c1020]/90 to-[#060912]/78 border-t border-fuchsia-400/55 border-b border-white/10 hover:from-[#141730]/95 transition-colors p-2.5 gap-1.5">
                {onStartRecursion && (
                  <button
                    type="button"
                    data-testid="title-btn-recursion"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onStartRecursion();
                    }}
                    className="w-full text-left cursor-pointer group"
                  >
                    <div className="text-xs font-display font-bold uppercase tracking-wider text-fuchsia-300 group-hover:text-fuchsia-200 truncate">
                      {t(locale, 'endlessRecursion')}
                    </div>
                    <div className="text-[9px] font-mono-tabular text-slate-400 truncate mt-0.5">
                      LOOP {progression?.bestRecursionLoop ?? 0} · CLR{' '}
                      {progression?.totalRecursionClears ?? 0}
                    </div>
                  </button>
                )}
                {(onSelectDifficultyTier || onToggleOverdrive) && (() => {
                  const activeTier: DifficultyTierId =
                    progression?.difficultyTier ??
                    (progression?.overdriveDifficulty ? 'veteran' : 'standard');
                  return (
                    <div
                      data-testid="title-difficulty-selector"
                      data-difficulty={activeTier}
                      className="flex items-center justify-between gap-1 pt-1 border-t border-white/8"
                    >
                      {VALID_DIFFICULTY_TIERS.map((tierId) => {
                        const spec = DIFFICULTY_TIERS[tierId];
                        const selected = activeTier === spec.id;
                        return (
                          <button
                            key={spec.id}
                            type="button"
                            data-testid={
                              spec.id === 'veteran'
                                ? 'title-btn-overdrive'
                                : `title-btn-difficulty-${spec.id}`
                            }
                            data-overdrive={activeTier !== 'standard' ? 'true' : 'false'}
                            aria-pressed={selected}
                            title={locale === 'vi' ? spec.subtitleVi : spec.subtitleEn}
                            onClick={(e) => {
                              e.currentTarget.blur();
                              if (onSelectDifficultyTier) {
                                onSelectDifficultyTier(spec.id);
                              } else if (onToggleOverdrive) {
                                onToggleOverdrive(spec.id !== 'standard');
                              }
                            }}
                            className={`px-1 py-0.5 text-[8px] font-mono-tabular font-bold uppercase tracking-tight transition-colors cursor-pointer whitespace-nowrap ${
                              selected
                                ? spec.id === 'singularity'
                                  ? 'bg-fuchsia-500/25 text-fuchsia-200 border-b border-fuchsia-400'
                                  : spec.id === 'veteran'
                                    ? 'bg-amber-500/20 text-amber-200 border-b border-amber-400'
                                    : 'bg-cyan-500/20 text-cyan-200 border-b border-cyan-400'
                                : 'text-slate-400 hover:text-slate-200 border-b border-transparent'
                            }`}
                          >
                            {locale === 'vi' ? spec.labelVi : spec.labelEn}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Tier 3 — Unified 4-Tab Horological Utility Strip (zero truncation, zero wireframe soup) */}
          <nav
            aria-label="Secondary Game Modes and Configuration"
            className="w-full max-w-[420px] grid grid-cols-4 gap-1.5 pt-2 border-t border-white/10"
          >
            <button
              type="button"
              data-testid="title-nav-chapters"
              aria-expanded={activeDrawer === 'chapters'}
              onClick={(e) => {
                e.currentTarget.blur();
                toggleDrawer('chapters');
              }}
              className={`px-2 py-2 text-left border-t border-b transition-colors cursor-pointer ${
                activeDrawer === 'chapters'
                  ? 'bg-[#102035] border-t-cyan-400 border-b-cyan-400/30 text-cyan-100'
                  : 'bg-[#060c16]/85 hover:bg-[#0e1a2c] border-t-white/15 border-b-white/8 text-slate-300'
              }`}
            >
              <div className="text-[8px] font-mono-tabular uppercase tracking-wider text-cyan-400 truncate">
                {t(locale, 'navCampaignKicker')}
              </div>
              <div className="text-[11px] font-display font-bold uppercase tracking-wider mt-0.5 truncate">
                {t(locale, 'navChapters')}
              </div>
            </button>

            <button
              type="button"
              data-testid="title-nav-practice"
              aria-expanded={activeDrawer === 'practice'}
              onClick={(e) => {
                e.currentTarget.blur();
                toggleDrawer('practice');
              }}
              className={`px-2 py-2 text-left border-t border-b transition-colors cursor-pointer ${
                activeDrawer === 'practice'
                  ? 'bg-[#1c160e] border-t-amber-400 border-b-amber-400/30 text-amber-100'
                  : 'bg-[#060c16]/85 hover:bg-[#0e1a2c] border-t-white/15 border-b-white/8 text-slate-300'
              }`}
            >
              <div className="text-[8px] font-mono-tabular uppercase tracking-wider text-amber-400 truncate">
                {t(locale, 'navSimulationKicker')}
              </div>
              <div className="text-[11px] font-display font-bold uppercase tracking-wider mt-0.5 truncate">
                {t(locale, 'navPractice')}
              </div>
            </button>

            <button
              type="button"
              data-testid="title-nav-archive"
              aria-expanded={activeDrawer === 'archive'}
              onClick={(e) => {
                e.currentTarget.blur();
                toggleDrawer('archive');
              }}
              className={`px-2 py-2 text-left border-t border-b transition-colors cursor-pointer ${
                activeDrawer === 'archive'
                  ? 'bg-[#151128] border-t-violet-400 border-b-violet-400/30 text-violet-100'
                  : 'bg-[#060c16]/85 hover:bg-[#0e1a2c] border-t-white/15 border-b-white/8 text-slate-300'
              }`}
            >
              <div className="text-[8px] font-mono-tabular uppercase tracking-wider text-violet-300 truncate">
                {t(locale, 'navArmoryKicker')}
              </div>
              <div className="text-[11px] font-display font-bold uppercase tracking-wider mt-0.5 truncate">
                {t(locale, 'navArmory')}
              </div>
            </button>

            <button
              type="button"
              data-testid="title-btn-controls"
              aria-expanded={activeDrawer === 'controls'}
              onClick={(e) => {
                e.currentTarget.blur();
                toggleDrawer('controls');
              }}
              className={`px-2 py-2 text-left border-t border-b transition-colors cursor-pointer ${
                activeDrawer === 'controls'
                  ? 'bg-[#102035] border-t-cyan-400 border-b-cyan-400/30 text-cyan-100'
                  : 'bg-[#060c16]/85 hover:bg-[#0e1a2c] border-t-white/15 border-b-white/8 text-slate-300'
              }`}
            >
              <div className="text-[8px] font-mono-tabular uppercase tracking-wider text-cyan-400 truncate">
                {t(locale, 'navSystemKicker')}
              </div>
              <div className="text-[11px] font-display font-bold uppercase tracking-wider mt-0.5 truncate">
                {t(locale, 'navSettings')}
              </div>
            </button>
          </nav>
        </section>

        {/* Right Column: Contextual Drawer Only (Live 3D Nadir-9 Arena stays 100% open & unobstructed by default) */}
        <section className="lg:col-span-7 flex flex-col lg:items-end pointer-events-auto">

          {/* Drawer 1: Campaign Chapter Select (Always mounted in DOM for testability; visible when activeDrawer === 'chapters') */}
          {onSelectCampaignChapter && (
            <div
              data-testid="title-chapter-select"
              className={
                activeDrawer === 'chapters'
                  ? 'w-full max-w-lg bg-[#090e17]/95 border border-cyan-500/50 p-4 text-slate-200 shadow-[0_16px_48px_rgba(0,0,0,0.85)]'
                  : 'sr-only'
              }
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
                <div>
                  <div className="text-[10px] font-mono-tabular uppercase tracking-widest text-cyan-400">
                    {chaptersViewMode === 'holo'
                      ? t(locale, 'chronicleTheaterSub')
                      : locale === 'vi'
                        ? `HỒ SƠ CHIẾN DỊCH · ĐÃ MỞ ${unlockedCount} / 6 CHƯƠNG`
                        : `CAMPAIGN ARCHIVE · ${unlockedCount} OF 6 UNLOCKED`}
                  </div>
                  <h2 className="text-sm sm:text-base font-display font-bold uppercase tracking-wider text-white">
                    {chaptersViewMode === 'holo'
                      ? t(locale, 'chronicleTheaterTitle')
                      : locale === 'vi'
                        ? 'CHỌN CHƯƠNG CHIẾN DỊCH'
                        : 'SELECT CAMPAIGN CHAPTER'}
                  </h2>
                </div>
                <button
                  type="button"
                  data-testid="title-drawer-close-chapters"
                  onClick={() => setActiveDrawer('none')}
                  className="px-2.5 py-1 text-xs font-mono-tabular uppercase bg-[#111a29] hover:bg-[#1b2940] border border-slate-700 text-slate-300 cursor-pointer shrink-0"
                >
                  {locale === 'vi' ? '← Đóng' : '← Close'}
                </button>
              </div>

              {/* v3.8.0: Chapters vs. Story Chronicle & Lysa Holo-Theater Segmented Bar */}
              <div className="flex items-center gap-1.5 mb-2.5">
                <button
                  type="button"
                  data-testid="title-chapters-sectors-btn"
                  aria-pressed={chaptersViewMode === 'sectors'}
                  onClick={() => setChaptersViewMode('sectors')}
                  className={`flex-1 px-2.5 py-1.5 text-[10px] font-mono-tabular font-bold uppercase border transition-colors cursor-pointer whitespace-nowrap ${
                    chaptersViewMode === 'sectors'
                      ? 'bg-cyan-400/20 border-cyan-400 text-cyan-200'
                      : 'bg-[#080d16] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t(locale, 'sectorsTab')} ({unlockedCount}/6)
                </button>
                <button
                  type="button"
                  data-testid="title-chronicle-theater-btn"
                  aria-pressed={chaptersViewMode === 'holo'}
                  onClick={() => setChaptersViewMode('holo')}
                  className={`flex-1 px-2.5 py-1.5 text-[10px] font-mono-tabular font-bold uppercase border transition-colors cursor-pointer whitespace-nowrap ${
                    chaptersViewMode === 'holo'
                      ? 'bg-amber-400/20 border-amber-400 text-amber-200'
                      : 'bg-[#080d16] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t(locale, 'chronicleTheaterTab')} ({holoResonance.discoveredCount}/6)
                </button>
              </div>

              {chaptersViewMode === 'holo' ? (
                <div
                  data-testid="title-chronicle-theater-panel"
                  className="space-y-2.5 max-h-[480px] overflow-y-auto pr-0.5"
                >
                  {/* Causal Stance Alignment & Sovereign Doctrine */}
                  <div className="bg-[#070c15] border border-slate-800 p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono-tabular text-cyan-300 font-bold">
                      <span>{t(locale, 'stanceAlignmentTitle')}</span>
                      <span className="text-slate-400">
                        {stanceMods.totalResolved}/6
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono-tabular">
                      {(
                        [
                          { key: 'defiance', count: stanceMods.defiance, tone: 'text-rose-300 border-rose-500/35' },
                          { key: 'empathy', count: stanceMods.empathy, tone: 'text-cyan-300 border-cyan-500/35' },
                          { key: 'pragmatism', count: stanceMods.pragmatism, tone: 'text-amber-300 border-amber-500/35' },
                        ] as const
                      ).map((st) => (
                        <div
                          key={st.key}
                          className={`bg-[#050911] border ${st.tone} px-2 py-1 flex items-center justify-between`}
                        >
                          <span>{localizeStanceLabel(st.key, locale)}</span>
                          <span className="font-bold">{st.count}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] text-slate-300 leading-snug">
                      {stanceMods.totalResolved > 0 ? (
                        <>
                          <span className="text-amber-300 font-semibold">
                            {locale === 'vi'
                              ? stanceMods.sovereignPerkTitleVi || localizeStanceLabel(stanceMods.dominantStance === 'balanced' ? 'empathy' : stanceMods.dominantStance, 'vi')
                              : stanceMods.sovereignPerkTitleEn || stanceMods.dominantStance.toUpperCase()}
                            :
                          </span>{' '}
                          {locale === 'vi'
                            ? stanceMods.sovereignPerkDescVi ||
                              `+${Math.round((stanceMods.damageMult - 1) * 100)}% ST · +${stanceMods.maxIntegrityBonus} HP · +${Math.round((stanceMods.fluxGainMult - 1) * 100)}% Flux`
                            : stanceMods.sovereignPerkDescEn ||
                              `+${Math.round((stanceMods.damageMult - 1) * 100)}% DMG · +${stanceMods.maxIntegrityBonus} HP · +${Math.round((stanceMods.fluxGainMult - 1) * 100)}% Flux`}
                        </>
                      ) : (
                        <span className="text-slate-400">{t(locale, 'stanceDoctrineInactive')}</span>
                      )}
                    </div>
                  </div>

                  {/* Holo-Memory Resonance Meter */}
                  <div className="bg-[#070c15] border border-cyan-500/35 p-2.5 space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono-tabular font-bold">
                      <span className="text-cyan-300">{t(locale, 'holoResonanceTitle')}</span>
                      <span className="text-emerald-300">
                        {holoResonance.discoveredCount} / {holoResonance.totalCount}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-300">
                      {holoResonance.discoveredCount > 0
                        ? locale === 'vi'
                          ? `+${Math.round((holoResonance.allDamageMult - 1) * 100)}% Sát Thương Toàn Phần · +${holoResonance.bonusMaxWard} Giáp Chrono Tối Đa`
                          : `+${Math.round((holoResonance.allDamageMult - 1) * 100)}% Outgoing Damage · +${holoResonance.bonusMaxWard} Max Chrono Ward`
                        : t(locale, 'holoResonanceInactive')}
                    </div>
                  </div>

                  {/* 6-Act Reconstructed Lysa Holo-Memory Selector & Transcript */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono-tabular text-amber-300 font-bold uppercase tracking-wider">
                      {t(locale, 'holoArchiveTitle')}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                      {LYSA_HOLO_MEMORIES.map((mem, idx) => {
                        const isDiscovered = discoveredHoloIds.includes(mem.id);
                        const isSelected = selectedTitleHoloId === mem.id;
                        return (
                          <button
                            key={mem.id}
                            type="button"
                            data-testid={`title-holo-select-${mem.id}`}
                            onClick={() => setSelectedTitleHoloId(mem.id)}
                            className={`px-1.5 py-1 text-[9px] font-mono-tabular font-bold border transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-400/20 border-cyan-300 text-cyan-100'
                                : isDiscovered
                                  ? 'bg-[#0b1524] border-emerald-500/45 text-emerald-300'
                                  : 'bg-[#060a11] border-slate-800 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {`HOLO-0${idx + 1}`}
                          </button>
                        );
                      })}
                    </div>

                    {(() => {
                      const activeHolo =
                        LYSA_HOLO_MEMORIES.find((m) => m.id === selectedTitleHoloId) ??
                        LYSA_HOLO_MEMORIES[0];
                      const unlockedHolo = discoveredHoloIds.includes(activeHolo.id);
                      return (
                        <div
                          data-testid="title-holo-transcript-card"
                          data-holo-id={activeHolo.id}
                          data-discovered={unlockedHolo ? 'true' : 'false'}
                          className="bg-[#060b13] border border-slate-800 p-2.5 space-y-1.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] font-mono-tabular text-slate-400">
                            <span>
                              {activeHolo.loopCode} · {activeHolo.timestampLabel} ·{' '}
                              {locale === 'vi' ? activeHolo.locationVi : activeHolo.locationEn}
                            </span>
                            <span className={unlockedHolo ? 'text-emerald-300 font-bold' : 'text-amber-300'}>
                              {unlockedHolo
                                ? locale === 'vi'
                                  ? 'ĐÃ GIẢI MÃ'
                                  : 'RECONSTRUCTED'
                                : `(${activeHolo.x.toFixed(1)}, ${activeHolo.z.toFixed(1)})`}
                            </span>
                          </div>
                          <div className="text-xs font-display font-bold text-slate-100">
                            {unlockedHolo
                              ? locale === 'vi'
                                ? activeHolo.titleVi
                                : activeHolo.titleEn
                              : locale === 'vi'
                                ? 'TÍN HIỆU HOLO ĐANG PHÂN TÁN'
                                : 'ENCRYPTED ASTROLABE HOLO-TRACE'}
                          </div>
                          {unlockedHolo ? (
                            <>
                              <div className="space-y-1 text-[11px] leading-snug">
                                {activeHolo.beats.map((b, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-[#09111e] border border-slate-800/80 px-2 py-1"
                                  >
                                    <span className="text-[9px] font-mono-tabular font-bold text-cyan-300">
                                      {locale === 'vi' ? b.speakerVi : b.speakerEn}:
                                    </span>{' '}
                                    <span className="text-slate-200">
                                      “{locale === 'vi' ? b.lineVi : b.lineEn}”
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <p className="text-[10px] text-emerald-200/90 pt-1 border-t border-slate-800/80">
                                {locale === 'vi' ? activeHolo.summaryVi : activeHolo.summaryEn}
                              </p>
                            </>
                          ) : (
                            <p className="text-[11px] text-slate-400 leading-snug">
                              {t(locale, 'holoLockedHint')} (X {activeHolo.x.toFixed(1)}, Z{' '}
                              {activeHolo.z.toFixed(1)})
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <>
              <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-0.5">
                {CHAPTER_METADATA.map((ch) => {
                  const unlocked = unlockedChapters.includes(ch.id);
                  const completed = completedChapters.includes(ch.id);
                  const isCurrent = activeChapter === ch.id && unlocked;
                  const chVi = locale === 'vi' ? CAMPAIGN_CHAPTER_DRAWER_VI[ch.id] : null;
                  const statusLabel = completed
                    ? locale === 'vi'
                      ? 'HOÀN THÀNH'
                      : 'COMPLETED'
                    : isCurrent
                      ? locale === 'vi'
                        ? 'ĐANG CHỌN'
                        : 'ACTIVE'
                      : unlocked
                        ? locale === 'vi'
                          ? 'ĐÃ MỞ'
                          : 'UNLOCKED'
                        : locale === 'vi'
                          ? 'ĐANG KHÓA'
                          : 'LOCKED';

                  return (
                    <button
                      key={ch.id}
                      type="button"
                      disabled={!unlocked}
                      data-testid={`title-chapter-${ch.id}`}
                      data-unlocked={unlocked ? 'true' : 'false'}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        if (unlocked) {
                          onSelectCampaignChapter(ch.id);
                        }
                      }}
                      className={`w-full text-left px-3 py-2 border transition-colors ${
                        unlocked
                          ? 'bg-[#0d1624] hover:bg-[#16243a] border-cyan-500/50 cursor-pointer'
                          : 'bg-[#070b12]/80 border-slate-800/80 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span
                          className={`font-display font-bold text-xs uppercase tracking-wider ${
                            unlocked ? 'text-white' : 'text-slate-500'
                          }`}
                        >
                          {chVi ? `${chVi.label} — ${chVi.subtitle}` : `${ch.label} — ${ch.subtitle}`}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {unlocked && (
                            <span className="text-[9px] font-mono-tabular px-1.5 py-0.5 bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 uppercase tracking-wider">
                              {GAME_CONFIG.campaignChapters[ch.id].archiveLog.id} ·{' '}
                              {GAME_CONFIG.campaignChapters[ch.id].archiveLog.title}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-mono-tabular font-semibold uppercase tracking-widest ${
                              completed
                                ? 'text-emerald-400'
                                : unlocked
                                  ? 'text-cyan-300'
                                  : 'text-slate-500'
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug line-clamp-1">
                        {unlocked
                          ? chVi
                            ? chVi.description
                            : ch.description
                          : chVi
                            ? `KHÓA · ${chVi.unlockRequirement}`
                            : `LOCKED · ${ch.unlockRequirement}`}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Persistent Chronicle Loom Ending Archive Strip */}
              <div
                data-testid="title-ending-archive-bar"
                className="mt-2.5 pt-2.5 border-t border-slate-800/90"
              >
                <div className="flex items-center justify-between text-[9px] font-mono-tabular uppercase tracking-widest text-slate-400 mb-1.5">
                  <span>
                    {locale === 'vi'
                      ? 'CÁC KẾT CỤC KHUNG CỬI ĐÃ GHI NHẬN'
                      : 'CHRONICLE LOOM DIRECTIVES RECORDED'}
                  </span>
                  <span className="text-cyan-300 font-bold">
                    {completedEndings.length + (progression?.paradoxEndingUnlocked ? 1 : 0)} / 4
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(
                    [
                      { id: 'silence', label: locale === 'vi' ? 'TĨNH LẶNG' : 'SILENCE' },
                      { id: 'witness', label: locale === 'vi' ? 'NHÂN CHỨNG' : 'WITNESS' },
                      { id: 'continuity', label: locale === 'vi' ? 'TIẾP NỐI' : 'CONTINUITY' },
                    ] as const
                  ).map((ending) => {
                    const recorded = completedEndings.includes(ending.id);
                    return (
                      <div
                        key={ending.id}
                        data-testid={`title-ending-badge-${ending.id}`}
                        data-recorded={recorded ? 'true' : 'false'}
                        className={`px-2 py-1 border text-[9px] font-mono-tabular flex items-center justify-between ${
                          recorded
                            ? 'bg-emerald-950/35 border-emerald-500/60 text-emerald-300'
                            : 'bg-[#070b12] border-slate-800 text-slate-500'
                        }`}
                      >
                        <span className="font-bold">{ending.label}</span>
                        <span>{recorded ? 'OK' : 'LOCKED'}</span>
                      </div>
                    );
                  })}
                  <div
                    data-testid="title-ending-badge-paradox"
                    data-recorded={progression?.paradoxEndingUnlocked ? 'true' : 'false'}
                    className={`px-2 py-1 border text-[9px] font-mono-tabular flex items-center justify-between ${
                      progression?.paradoxEndingUnlocked
                        ? 'bg-fuchsia-950/45 border-fuchsia-400/75 text-fuchsia-200'
                        : 'bg-[#070b12] border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="font-bold">PARADOX</span>
                    <span>{progression?.paradoxEndingUnlocked ? 'SECRET ✓' : 'ECHO-ZERO'}</span>
                  </div>
                </div>
              </div>
                </>
              )}
            </div>
          )}

          {/* Drawer 2: Practice Arena (Always mounted in DOM for testability; visible when activeDrawer === 'practice') */}
          <div
            data-testid="title-practice-panel"
            className={
              activeDrawer === 'practice'
                ? 'w-full max-w-lg bg-[#090e17]/95 border border-amber-500/50 p-4 text-slate-200 shadow-[0_16px_48px_rgba(0,0,0,0.85)]'
                : 'sr-only'
            }
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2">
              <div>
                <div className="text-[10px] font-mono-tabular uppercase tracking-widest text-amber-400">
                  {t(locale, 'practiceDrawerSub')}
                </div>
                <h2 className="text-sm sm:text-base font-display font-bold uppercase tracking-wider text-white">
                  {t(locale, 'practiceDrawerTitle')}
                </h2>
              </div>
              <button
                type="button"
                data-testid="title-drawer-close-practice"
                onClick={() => setActiveDrawer('none')}
                className="px-2.5 py-1 text-xs font-mono-tabular uppercase bg-[#111a29] hover:bg-[#1b2940] border border-slate-700 text-slate-300 cursor-pointer"
              >
                {t(locale, 'drawerClose')}
              </button>
            </div>

            <div className="flex items-center gap-2 mb-2.5 border-b border-slate-800 pb-2">
              <button
                type="button"
                data-testid="title-practice-arenas-btn"
                onClick={() => setPracticeSubTab('arenas')}
                className={`px-3 py-1 text-[10px] font-mono-tabular font-bold uppercase tracking-wider border cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                  practiceSubTab === 'arenas'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-100'
                    : 'bg-[#0b111d] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t(locale, 'practiceArenasTab')}
              </button>
              <button
                type="button"
                data-testid="title-mastery-ledger-btn"
                onClick={() => setPracticeSubTab('mastery')}
                className={`px-3 py-1 text-[10px] font-mono-tabular font-bold uppercase tracking-wider border cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                  practiceSubTab === 'mastery'
                    ? 'bg-cyan-500/20 border-cyan-300 text-cyan-100'
                    : 'bg-[#0b111d] border-cyan-500/45 text-cyan-300 hover:text-cyan-100'
                }`}
              >
                {t(locale, 'masteryLedgerTab')} ({masterySeal.claimedSealsCount}/24)
                {masterySeal.pendingBountyCount > 0 ? ` · +${masterySeal.pendingBountyCount}◆` : ''}
              </button>
            </div>

            {practiceSubTab === 'mastery' ? (
              <MasteryLedgerPanel
                variant="title"
                locale={locale}
                combatMastery={progression?.combatMastery}
                unlockedChapters={unlockedChapters}
                onClaimMasteryBounty={onClaimMasteryBounty}
                onClaimAllMasteryBounties={onClaimAllMasteryBounties}
                onStartBoss={onStartBoss}
                onStartEchoZero={onStartEchoZero}
                onStartPracticeStandard={onStartPracticeStandard}
                onSelectCampaignChapter={onSelectCampaignChapter}
              />
            ) : (
              <>
                <p className="text-[11px] font-mono-tabular text-slate-400 mb-2.5">
                  {t(locale, 'practiceDrawerDesc')}
                </p>

                <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-0.5">
                  {PRACTICE_ENCOUNTERS.map((item) => {
                    const handleClick = () => {
                      if (!item.bossId) {
                        onStartPracticeStandard?.(item.encounterId);
                      } else if (item.bossId === 'echo-zero' && onStartEchoZero) {
                        onStartEchoZero();
                      } else {
                        onStartBoss?.(item.bossId);
                      }
                    };
                    return (
                      <button
                        key={item.testId}
                        type="button"
                        data-testid={item.testId}
                        onClick={(e) => {
                          e.currentTarget.blur();
                          handleClick();
                        }}
                        className={`w-full text-left px-3 py-2 bg-[#0d1420] hover:bg-[#152033] border transition-colors cursor-pointer ${item.accentClass}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="font-display font-bold text-xs uppercase tracking-wider">
                            {locale === 'vi' ? item.titleVi : item.title}
                          </span>
                          <span className="text-[10px] font-mono-tabular text-slate-400">
                            {locale === 'vi' ? item.codeVi : item.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug line-clamp-1">
                          {locale === 'vi' ? item.focusVi : item.focus}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Drawer 2.5: Arsenal & Codex Archive */}
          {activeDrawer === 'archive' && (
            <div
              data-testid="title-archive-panel"
              className="w-full max-w-2xl max-h-[82vh] overflow-y-auto bg-[#090e17]/95 border border-violet-500/50 p-3.5 text-xs font-mono-tabular text-slate-300 shadow-[0_16px_48px_rgba(0,0,0,0.85)]"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-violet-400">
                    {locale === 'vi'
                      ? `KHO TRANG BỊ CHRONO RIG · ${unlockedWeaponIds.length}/5 VŨ KHÍ · ${codexCount}/8 DỮ LIỆU`
                      : `CHRONO RIG ARMORY · ${unlockedWeaponIds.length}/5 WEAPONS · ${codexCount}/8 CODEX`}
                  </div>
                  <h2 className="text-sm sm:text-base font-display font-bold uppercase tracking-wider text-white">
                    {locale === 'vi' ? 'KHO VŨ KHÍ & HỒ SƠ MÃ HÓA' : 'ARSENAL & CODEX ARCHIVE'}
                  </h2>
                </div>
                <button
                  type="button"
                  data-testid="title-drawer-close-archive"
                  onClick={() => setActiveDrawer('none')}
                  className="px-2.5 py-1 text-xs font-mono-tabular uppercase bg-[#111a29] hover:bg-[#1b2940] border border-slate-700 text-slate-300 cursor-pointer"
                >
                  {locale === 'vi' ? '← ĐÓNG' : '← Close'}
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                <button
                  type="button"
                  data-testid="title-archive-tab-arsenal"
                  onClick={() => setArchiveTab('arsenal')}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border cursor-pointer transition-colors ${
                    archiveTab === 'arsenal'
                      ? 'bg-violet-500/25 border-violet-400 text-violet-100'
                      : 'bg-[#0b111d] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {locale === 'vi' ? 'VŨ KHÍ & KHUNG GIÁP' : 'ARSENAL & RIGS'}
                </button>
                <button
                  type="button"
                  data-testid="title-archive-tab-meshy"
                  onClick={() => setArchiveTab('meshy')}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border cursor-pointer transition-colors ${
                    archiveTab === 'meshy'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100'
                      : 'bg-[#0b111d] border-cyan-500/40 text-cyan-300 hover:text-cyan-100'
                  }`}
                >
                  {locale === 'vi' ? 'THƯ VIỆN MÔ HÌNH 3D' : '3D MODEL GALLERY'}
                  {meshyLoadedCount > 0 ? ` (+${meshyLoadedCount} MOD)` : ''}
                </button>
              </div>

              {archiveTab === 'meshy' ? (
                <div data-testid="title-meshy-studio-panel" className="space-y-2.5">
                  <div className="p-2.5 border border-cyan-400/50 bg-[#081722] text-[11px] text-slate-200 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                        HELION-9 VISUAL ARCHIVE · 14 DESIGN PLATES
                      </span>
                      <span
                        data-testid="meshy-studio-applied-badge"
                        className="text-[9px] font-mono-tabular px-1.5 py-0.5 bg-cyan-500/15 border border-cyan-400/50 text-cyan-200 uppercase font-semibold"
                      >
                        112 BUILT-IN 3D ASSETS
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(['sheet1', 'sheet2', 'sheet3', 'sheet4', 'sheet5', 'sheet6', 'sheet7', 'sheet8', 'sheet9', 'sheet10', 'sheet11', 'sheet12', 'sheet13', 'sheet14'] as BlueprintSheetId[]).map((sheetId) => {
                        const isSelected = activeBlueprintSheet === sheetId;
                        return (
                          <button
                            key={sheetId}
                            type="button"
                            data-testid={`meshy-sheet-tab-${sheetId}`}
                            onClick={() => setActiveBlueprintSheet(sheetId)}
                            className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-100'
                                : 'bg-[#070f18] border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-500'
                            }`}
                          >
                            {CONCEPT_BLUEPRINT_SHEETS[sheetId].tabLabel}
                          </button>
                        );
                      })}
                    </div>
                    <img
                      src={CONCEPT_BLUEPRINT_SHEETS[activeBlueprintSheet].src}
                      alt={CONCEPT_BLUEPRINT_SHEETS[activeBlueprintSheet].alt}
                      data-testid="meshy-concept-blueprint-img"
                      className="w-full h-auto border border-slate-700/80 block"
                    />
                    <p className="text-[10px] text-slate-300/95 leading-relaxed">
                      <span className="text-emerald-300 font-semibold">Live 3D Roster:</span>{' '}
                      {CONCEPT_BLUEPRINT_SHEETS[activeBlueprintSheet].caption} All 6 Wardens, 10 enemies, Sera Venn + 5 weapons + 3 Mod Chips, Style SSS Crest, Daily Trial Obelisk, Chrono Finisher Rift &amp; Photo Drone are sculpted live in-game.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {onStartPracticeStandard && (
                        <button
                          type="button"
                          data-testid="meshy-preview-prologue"
                          onClick={() => onStartPracticeStandard('prologue_calibration_bay')}
                          className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/70 text-sky-100 cursor-pointer transition-colors"
                        >
                          PROLOGUE BAY 04
                        </button>
                      )}
                      {onStartBoss && (
                        <>
                          <button
                            type="button"
                            data-testid="meshy-preview-helix"
                            onClick={() => onStartBoss('helix-04')}
                            className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/70 text-amber-100 cursor-pointer transition-colors"
                          >
                            HELIX-04
                          </button>
                          <button
                            type="button"
                            data-testid="meshy-preview-choir"
                            onClick={() => onStartBoss('the-choir')}
                            className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-teal-500/20 hover:bg-teal-500/35 border border-teal-400/70 text-teal-100 cursor-pointer transition-colors"
                          >
                            THE CHOIR + PYLONS
                          </button>
                          <button
                            type="button"
                            data-testid="meshy-preview-curator"
                            onClick={() => onStartBoss('the-curator')}
                            className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-violet-500/20 hover:bg-violet-500/35 border border-violet-400/70 text-violet-100 cursor-pointer transition-colors"
                          >
                            THE CURATOR
                          </button>
                          <button
                            type="button"
                            data-testid="meshy-preview-matron"
                            onClick={() => onStartBoss('matron-v')}
                            className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/70 text-rose-100 cursor-pointer transition-colors"
                          >
                            MATRON-V
                          </button>
                          <button
                            type="button"
                            data-testid="meshy-preview-warden"
                            onClick={() => onStartBoss('warden-prime')}
                            className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/70 text-cyan-100 cursor-pointer transition-colors"
                          >
                            WARDEN PRIME
                          </button>
                        </>
                      )}
                      {onStartPracticeStandard && (
                        <>
                          <button
                            type="button"
                            data-testid="meshy-preview-disruption"
                            onClick={() => onStartPracticeStandard('tactical_temporal_disruption')}
                            className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-fuchsia-500/20 hover:bg-fuchsia-500/35 border border-fuchsia-400/70 text-fuchsia-100 cursor-pointer transition-colors"
                          >
                            DISRUPTION SQUAD (SIPHON / ERASER / NULL / SENTINEL)
                          </button>
                          <button
                            type="button"
                            data-testid="meshy-preview-scout"
                            onClick={() => onStartPracticeStandard('tactical_crossfire_suppression')}
                            className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/70 text-sky-100 cursor-pointer transition-colors"
                          >
                            SCOUT-L1 &amp; BASTION
                          </button>
                          <button
                            type="button"
                            data-testid="meshy-preview-apex"
                            onClick={() => onStartPracticeStandard('tactical_apex_bestiary')}
                            className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/70 text-emerald-100 cursor-pointer transition-colors"
                          >
                            APEX TRIO
                          </button>
                          <button
                            type="button"
                            data-testid="meshy-preview-guard"
                            onClick={() => onStartPracticeStandard('tactical_guard_and_flank')}
                            className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider bg-slate-600/30 hover:bg-slate-600/50 border border-slate-400/60 text-slate-100 cursor-pointer transition-colors"
                          >
                            SCRAPPER &amp; BASTION
                          </button>
                        </>
                      )}
                    </div>
                    {meshyStatusMsg && (
                      <div
                        data-testid="meshy-studio-status"
                        className="pt-1 text-[10px] text-emerald-300 font-semibold"
                      >
                        {meshyStatusMsg}
                      </div>
                    )}
                  </div>

                  <details className="border border-slate-800 bg-[#070d16]">
                    <summary className="px-2.5 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-cyan-200 cursor-pointer select-none flex items-center justify-between">
                      <span>ADVANCED MODDING · CUSTOM .GLB MODEL OVERRIDES (OPTIONAL)</span>
                      <span className="text-[9px] font-mono-tabular text-slate-500">
                        {meshyLoadedCount > 0 ? `${meshyLoadedCount} OVERRIDDEN` : 'ALL BUILT-IN ACTIVE'}
                      </span>
                    </summary>
                    <div className="p-2 pt-0 grid grid-cols-1 gap-2">
                    {MESHY_SLOT_SPECS.map((spec) => {
                      const activeSummary = meshyLoaded[spec.id] ?? null;
                      const isConceptModel = CONCEPT_SHEET_SLOT_IDS.has(spec.id);
                      const isCopied = copiedSlotId === spec.id;
                      return (
                        <div
                          key={spec.id}
                          data-testid={`meshy-slot-${spec.id}`}
                          className={`p-2.5 border transition-colors ${
                            activeSummary
                              ? 'bg-[#0c1d27] border-amber-400/75'
                              : isConceptModel
                                ? 'bg-[#0a1621] border-cyan-500/35 hover:border-cyan-400/60'
                                : 'bg-[#0b111d] border-slate-800 hover:border-cyan-500/40'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 border border-slate-700 bg-[#070b12] text-cyan-300">
                                {spec.category.toUpperCase()}
                              </span>
                              <span className="font-display font-bold text-xs uppercase tracking-wider text-white">
                                {spec.label}
                              </span>
                              <span
                                data-testid={`meshy-slot-status-${spec.id}`}
                                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border ${
                                  activeSummary
                                    ? 'bg-amber-500/20 border-amber-400/70 text-amber-200'
                                    : 'bg-slate-800/80 border-slate-600/60 text-slate-300'
                                }`}
                              >
                                {activeSummary ? 'CUSTOM .GLB MOD' : 'BUILT-IN 3D'}
                              </span>
                              <span className="text-[9px] text-slate-400">
                                H: {spec.targetHeight}m · {spec.polyBudget}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                data-testid={`meshy-copy-${spec.id}`}
                                onClick={() => handleCopyMeshyPrompt(spec.id, spec.meshyPrompt)}
                                className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                                  isCopied
                                    ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                                    : 'bg-[#121e33] hover:bg-[#1a2c4a] text-cyan-200 border-cyan-500/50'
                                }`}
                              >
                                {isCopied ? 'COPIED!' : 'COPY PROMPT'}
                              </button>
                              <label
                                data-testid={`meshy-import-label-${spec.id}`}
                                className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border bg-slate-800/80 hover:bg-amber-500/25 text-slate-200 hover:text-amber-200 border-slate-600 hover:border-amber-400/60 cursor-pointer transition-colors"
                              >
                                LOAD .GLB MOD
                                <input
                                  type="file"
                                  accept=".glb,.gltf"
                                  data-testid={`meshy-file-input-${spec.id}`}
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    void handleImportMeshyGlb(spec.id, file);
                                    e.currentTarget.value = '';
                                  }}
                                />
                              </label>
                              {activeSummary && (
                                <>
                                  <button
                                    type="button"
                                    data-testid={`meshy-rotate-${spec.id}`}
                                    onClick={() => meshyAssetRegistry.rotateSlotYaw(spec.id, 90)}
                                    className="px-2 py-0.5 text-[9px] font-bold uppercase border bg-[#111c2d] hover:bg-[#1d304d] text-slate-200 border-slate-600 cursor-pointer"
                                  >
                                    +90° ({activeSummary.yawOffsetDeg}°)
                                  </button>
                                  <button
                                    type="button"
                                    data-testid={`meshy-reset-${spec.id}`}
                                    onClick={() => meshyAssetRegistry.clearSlot(spec.id)}
                                    className="px-2 py-0.5 text-[9px] font-bold uppercase border bg-rose-950/60 hover:bg-rose-900/70 text-rose-200 border-rose-500/60 cursor-pointer"
                                  >
                                    RESET
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-[10px] text-slate-400 bg-[#060910] border border-slate-800/80 p-1.5 select-all leading-snug">
                            {spec.meshyPrompt}
                          </div>
                          {activeSummary && (
                            <div className="mt-1 text-[9px] text-amber-300 font-semibold">
                              ACTIVE GLB MOD: {activeSummary.fileName} · {activeSummary.triangleCount.toLocaleString()} tris · {activeSummary.meshCount} meshes
                            </div>
                          )}
                        </div>
                      );
                    })}
                    </div>
                  </details>
                </div>
              ) : (
                <>
              {/* v3.6.0: 3-Slot Tactical Loadout Presets (ALPHA · BETA · GAMMA) */}
              {(onSaveLoadoutPreset || onApplyLoadoutPreset) && (
                <div
                  data-testid="title-loadout-presets-bar"
                  className="mb-2.5 pb-2 border-b border-slate-800 space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] uppercase tracking-wider">
                    <span className="text-amber-300 font-bold">{t(locale, 'presetBarTitle')}</span>
                    <span className="text-slate-400 text-[9px]">{t(locale, 'presetBarSub')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {([0, 1, 2] as const).map((slotIdx) => {
                      const preset = progression?.loadoutPresets?.[slotIdx] ?? null;
                      const slotName = preset?.name || DEFAULT_LOADOUT_PRESET_NAMES[slotIdx];
                      const weaponShort = preset
                        ? preset.weaponId === 'chrono_edge'
                          ? t(locale, 'hudWeaponEdge')
                          : preset.weaponId === 'pulsecaster'
                            ? t(locale, 'hudWeaponPulse')
                            : preset.weaponId === 'phase_rail'
                              ? t(locale, 'hudWeaponRail')
                              : preset.weaponId === 'grav_breaker'
                                ? t(locale, 'hudWeaponMaul')
                                : t(locale, 'hudWeaponScythe')
                        : null;
                      const coreShort =
                        preset?.equippedBossCore && BOSS_ECHO_CORES[preset.equippedBossCore]
                          ? locale === 'vi'
                            ? BOSS_ECHO_CORES[preset.equippedBossCore].shortBadgeVi
                            : BOSS_ECHO_CORES[preset.equippedBossCore].shortBadgeEn
                          : null;
                      return (
                        <div
                          key={slotIdx}
                          data-testid={`title-preset-slot-${slotIdx}`}
                          data-populated={preset ? 'true' : 'false'}
                          className="bg-[#0b1524] border border-slate-800 px-2 py-1.5 flex items-center justify-between gap-1.5"
                        >
                          <div className="min-w-0">
                            <div className="text-[9px] font-mono-tabular font-bold uppercase text-cyan-200 truncate">
                              [{slotIdx + 1}] {slotName}
                            </div>
                            <div className="text-[8px] font-mono-tabular uppercase text-slate-400 truncate">
                              {preset
                                ? `${weaponShort}${coreShort ? ` · ${coreShort}` : ''}${
                                    preset.sentinelMode !== 'off'
                                      ? ` · ${preset.sentinelMode.toUpperCase()}`
                                      : ''
                                  }${
                                    preset.echoDoctrine && preset.echoDoctrine !== 'standard'
                                      ? ` · ${
                                          locale === 'vi'
                                            ? ECHO_DOCTRINE_SPECS[preset.echoDoctrine].shortBadgeVi
                                            : ECHO_DOCTRINE_SPECS[preset.echoDoctrine].shortBadgeEn
                                        }`
                                      : ''
                                  }`
                                : t(locale, 'presetEmptyTag')}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {onSaveLoadoutPreset && (
                              <button
                                type="button"
                                data-testid={`title-preset-save-${slotIdx}`}
                                onClick={() => onSaveLoadoutPreset(slotIdx)}
                                className="px-1.5 py-0.5 text-[8px] font-mono-tabular font-bold uppercase bg-cyan-500/15 hover:bg-cyan-500/30 border border-cyan-400/60 text-cyan-200 cursor-pointer whitespace-nowrap"
                              >
                                {t(locale, 'presetSaveBtn')}
                              </button>
                            )}
                            {onApplyLoadoutPreset && (
                              <button
                                type="button"
                                data-testid={`title-preset-load-${slotIdx}`}
                                disabled={!preset}
                                onClick={() => preset && onApplyLoadoutPreset(slotIdx)}
                                className={`px-1.5 py-0.5 text-[8px] font-mono-tabular font-bold uppercase border whitespace-nowrap ${
                                  preset
                                    ? 'bg-amber-500/20 hover:bg-amber-500/35 border-amber-400/75 text-amber-200 cursor-pointer'
                                    : 'bg-[#070b12] border-slate-800 text-slate-600 cursor-not-allowed'
                                }`}
                              >
                                {t(locale, 'presetLoadBtn')}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* v2.3.0: Live 3D Sera Rig Skins (5) — Top of Arsenal for immediate Live Preview */}
              <div
                data-testid="title-rig-skins-section"
                className="mb-2.5 pb-2 border-b border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-fuchsia-300 font-bold">
                  <span>{t(locale, 'rigSkinsTitleLive')}</span>
                  <span className="text-slate-400">
                    {progression?.equippedSkinId?.replace('_', ' ') ?? 'NADIR STANDARD'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {SERA_RIG_SKINS.map((skin) => {
                    const unlocked = isSeraRigSkinUnlocked(
                      skin.id,
                      progression?.unlockedAchievementIds ?? [],
                      progression?.echoZeroDefeatedCount ?? 0
                    );
                    const equipped = (progression?.equippedSkinId ?? 'nadir_standard') === skin.id;
                    return (
                      <button
                        key={skin.id}
                        type="button"
                        data-testid={`title-skin-${skin.id}`}
                        disabled={!unlocked}
                        title={`${skin.name} — ${skin.subtitle} (${skin.unlockRequirementText})`}
                        onClick={() => unlocked && onEquipSkin?.(skin.id)}
                        className={`p-1.5 border text-left transition-colors ${
                          equipped
                            ? 'bg-[#161a2c] border-amber-400 text-white cursor-default'
                            : unlocked
                              ? 'bg-[#0b1320] hover:bg-[#152236] border-slate-700 text-slate-200 cursor-pointer'
                              : 'bg-[#070a10] border-slate-800/80 text-slate-500 cursor-default opacity-75'
                        }`}
                      >
                        <div
                          className="h-2.5 w-full mb-1 border border-white/20"
                          style={{ background: skin.swatchCss }}
                        />
                        <div className="text-[8px] font-bold uppercase truncate">{skin.name}</div>
                        <div className="text-[7px] uppercase text-slate-400 truncate">
                          {equipped
                            ? t(locale, 'skinEquipped')
                            : unlocked
                              ? t(locale, 'skinEquip')
                              : t(locale, 'skinLocked')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* v2.4.0: Weapon Mod Socket Chips (Live 3D Dorsal Chrono Rig Chip Preview) */}
              <div
                data-testid="title-mod-chips-section"
                className="mb-2.5 pb-2 border-b border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-cyan-300 font-bold">
                  <span>{t(locale, 'modSockets')}</span>
                  <span className="text-slate-400">
                    {progression?.equippedModChipId
                      ? WEAPON_MOD_CHIPS.find((c) => c.id === progression.equippedModChipId)?.shortLabel
                      : locale === 'vi'
                        ? 'TRỐNG'
                        : 'NONE'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {WEAPON_MOD_CHIPS.map((chip) => {
                    const unlockedChips = progression?.unlockedModChipIds ?? ['mod_volt_arc'];
                    const isUnlocked = unlockedChips.includes(chip.id) || chip.cost === 0;
                    const isEquipped = progression?.equippedModChipId === chip.id;
                    const canAfford = (progression?.memoryFragments ?? 0) >= chip.cost;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        data-testid={`title-mod-chip-${chip.id}`}
                        onClick={() => onEquipModChip?.(isEquipped ? null : chip.id)}
                        disabled={!isUnlocked && !canAfford}
                        className={`p-2 border text-left transition-colors ${
                          isEquipped
                            ? 'bg-[#102230] border-cyan-300 text-white cursor-pointer'
                            : isUnlocked || canAfford
                              ? 'bg-[#0b1320] hover:bg-[#142338] border-slate-700 text-slate-200 cursor-pointer'
                              : 'bg-[#070a10] border-slate-800 text-slate-500 cursor-not-allowed opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span
                            className="text-[9px] font-bold uppercase truncate"
                            style={{ color: chip.accentCss }}
                          >
                            {locale === 'vi' ? chip.nameVi : chip.name}
                          </span>
                          <span className="text-[8px] font-mono-tabular text-amber-300 shrink-0">
                            {isEquipped
                              ? t(locale, 'modEquipped')
                              : isUnlocked
                                ? t(locale, 'modEquip')
                                : `${chip.cost}◆`}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-300/90 leading-snug">
                          {locale === 'vi' ? chip.summaryVi : chip.summaryEn}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5">
                {(
                  [
                    {
                      id: 'chrono_edge',
                      slot: '[1]',
                      title: locale === 'vi' ? t(locale, 'weaponEdge') : 'CHRONO EDGE',
                      role:
                        locale === 'vi'
                          ? 'Kiếm Pha Cận Chiến · Liên Kích 3 Đòn & Chém Phá Khiên'
                          : 'Close-Combat Phase Blade · 3-Hit Combo & Breaker Cleave',
                      unlockHint:
                        locale === 'vi'
                          ? 'Vũ khí cận chiến mặc định của Khung Chrono'
                          : 'Default Chrono Rig Sidearm',
                    },
                    {
                      id: 'pulsecaster',
                      slot: '[2]',
                      title: locale === 'vi' ? t(locale, 'weaponPulse') : 'PULSECASTER',
                      role:
                        locale === 'vi'
                          ? 'Súng Xung Pha Tầm Trung · Bắn Nhanh & Tia Xuyên Phá'
                          : 'Mid-Range Phase Projector · Rapid Bolts & Piercing Lance',
                      unlockHint:
                        locale === 'vi'
                          ? 'Súng xung tầm xa mặc định của Khung Chrono'
                          : 'Default Chrono Rig Projector',
                    },
                    {
                      id: 'phase_rail',
                      slot: '[3]',
                      title: locale === 'vi' ? t(locale, 'weaponRail') : 'NULL-POINT RAIL LANCE',
                      role:
                        locale === 'vi'
                          ? 'Thương Điện Từ Tầm Xa · ×1.75 Sát Thương Lõi Lộ Diện'
                          : 'Long-Range Precision Lance · 1.75x Exposed-Core Multiplier',
                      unlockHint:
                        locale === 'vi'
                          ? 'Mở khóa: Hoàn thành Mở Đầu hoặc tìm Hòm Vũ Khí Thống Chế'
                          : 'Unlock: Complete Prologue or discover Marshal Armory Cache',
                    },
                    {
                      id: 'grav_breaker',
                      slot: '[4]',
                      title: locale === 'vi' ? t(locale, 'weaponMaul') : 'GRAV-BREAKER MAUL',
                      role:
                        locale === 'vi'
                          ? 'Búa Trọng Lực Hạng Nặng · Xuyên 85% Khiên & Chấn Động Địa Chấn'
                          : 'Heavy Armor-Shatter Maul · 85% Shield Pierce & Seismic Slam',
                      unlockHint:
                        locale === 'vi'
                          ? 'Mở khóa: Hạ HELIX-04 hoặc tìm Kho Vũ Khí Thủy Canh / Lưu Trữ'
                          : 'Unlock: Defeat HELIX-04 or discover Hydroponic / Archive Vault',
                    },
                    {
                      id: 'chrono_scythe',
                      slot: '[5]',
                      title: locale === 'vi' ? t(locale, 'weaponScythe') : 'CHRONO SCYTHE',
                      role:
                        locale === 'vi'
                          ? 'Lưỡi Hái Thời Không Diện Rộng · Quét 3 Đòn & Xoáy Hút 5.4m'
                          : 'Wide-Arc Temporal Polearm · 3-Hit Cleave & Heavy Vortex Pull (5.4m)',
                      unlockHint:
                        locale === 'vi'
                          ? 'Cổ vật Lưỡi Hái · Mở khóa miễn phí ngay cho Chiến Đấu 3D & Thử Thách Ngày'
                          : 'v2.4.0 Relic Polearm · Unlock instantly for Live 3D Combat & Daily Trial',
                    },
                  ] as const
                ).map((w) => {
                  const unlocked = unlockedWeaponIds.includes(w.id);
                  const isEquippedWeapon = equippedWeaponId === w.id;
                  const equippedUpgrade = progression?.equippedUpgrades?.[w.id] ?? null;
                  const weaponUpgrades = Object.values(GAME_CONFIG.weapons.upgrades).filter(
                    (u) => u.weaponId === w.id
                  );
                  return (
                    <div
                      key={w.id}
                      data-testid={`title-arsenal-weapon-${w.id}`}
                      data-unlocked={unlocked ? 'true' : 'false'}
                      data-equipped={isEquippedWeapon ? 'true' : 'false'}
                      className={`p-2.5 border transition-colors ${
                        w.id === 'chrono_scythe' ? 'sm:col-span-2 ' : ''
                      }${
                        isEquippedWeapon
                          ? 'bg-[#101c30] border-cyan-400/80 text-slate-100'
                          : unlocked
                            ? 'bg-[#0e1626] border-violet-500/40 text-slate-200'
                            : 'bg-[#070b12] border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-0.5">
                        <span className="font-display font-bold text-xs uppercase tracking-wider text-white">
                          <span className="text-cyan-400 mr-1.5">{w.slot}</span>
                          {w.title}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {unlocked && equippedUpgrade && GAME_CONFIG.weapons.upgrades[equippedUpgrade] && (
                            <span className="text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 border bg-emerald-950/40 border-emerald-500/50 text-emerald-300">
                              MOD:{' '}
                              {
                                localizeWeaponUpgrade(
                                  GAME_CONFIG.weapons.upgrades[equippedUpgrade],
                                  locale
                                ).shortLabel
                              }
                            </span>
                          )}
                          {unlocked ? (
                            <button
                              type="button"
                              data-testid={`title-select-weapon-${w.id}`}
                              aria-pressed={isEquippedWeapon}
                              onClick={() => onSelectWeapon?.(w.id)}
                              className={`text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 border transition-colors cursor-pointer ${
                                isEquippedWeapon
                                  ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-bold'
                                  : 'bg-[#111e34] hover:bg-[#1a2e4d] text-cyan-200 border-cyan-500/50'
                              }`}
                            >
                              {isEquippedWeapon
                                ? t(locale, 'benchActiveWeapon')
                                : t(locale, 'benchEquipWeapon')}
                            </button>
                          ) : w.id === 'chrono_scythe' && onUnlockChronoScythe ? (
                            <button
                              type="button"
                              data-testid="title-unlock-chrono-scythe"
                              onClick={() => onUnlockChronoScythe()}
                              className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 border bg-amber-400/20 hover:bg-amber-400/35 text-amber-200 border-amber-400/80 transition-colors cursor-pointer"
                            >
                              {t(locale, 'scytheUnlockFree')}
                            </button>
                          ) : (
                            <span className="text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 border bg-slate-900 border-slate-800 text-slate-500">
                              {t(locale, 'benchWeaponLocked')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-300 mb-1.5">
                        {unlocked ? w.role : w.unlockHint}
                      </div>
                      {(() => {
                        const mastery = computeWeaponMasteryRankInfo(
                          progression?.weaponMasteryXp?.[w.id] ?? 0
                        );
                        const dmgPct = Math.round((mastery.damageMultiplier - 1) * 100);
                        return (
                          <div
                            data-testid={`title-weapon-mastery-${w.id}`}
                            data-rank={mastery.rank}
                            className="mb-1.5 px-2 py-1 bg-[#070b12] border border-slate-800/90 space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2 text-[9px] font-mono-tabular uppercase">
                              <span className="text-amber-300 font-bold">
                                {t(locale, 'benchRankLabel')}{' '}
                                {localizeMasteryRankLabel(mastery.rankLabel, locale)}
                              </span>
                              <span className="text-slate-400">
                                {dmgPct > 0 ? `+${dmgPct}% DMG · ` : ''}
                                {mastery.xp}
                                {mastery.nextRankXp !== null ? `/${mastery.nextRankXp}` : ' MAX'} XP
                              </span>
                            </div>
                            <div className="relative h-1 w-full bg-[#04070c] overflow-hidden">
                              <div
                                className="absolute inset-y-0 left-0 bg-amber-400"
                                style={{ width: `${Math.round(mastery.progressRatio * 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()}
                      {unlocked && weaponUpgrades.length > 0 && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800/80">
                          {weaponUpgrades.map((upg) => {
                            const localUpg = localizeWeaponUpgrade(upg, locale);
                            const isOwned =
                              progression?.purchasedUpgrades?.includes(upg.id) ?? false;
                            const isOverclocked =
                              progression?.overclockedUpgrades?.includes(upg.id) ?? false;
                            const isAwakened =
                              progression?.awakenedUpgrades?.includes(upg.id) ?? false;
                            const isModEquipped = equippedUpgrade === upg.id;
                            const canAfford =
                              (progression?.memoryFragments ?? 0) >= upg.cost;
                            const canAffordOverclock =
                              (progression?.memoryFragments ?? 0) >= WEAPON_OVERCLOCK_COST;
                            const canAffordAwaken =
                              (progression?.memoryFragments ?? 0) >= WEAPON_AWAKENING_COST;
                            return (
                              <div key={upg.id} className="space-y-1">
                                <button
                                  type="button"
                                  data-testid={`title-upgrade-action-${upg.id}`}
                                  onClick={() => {
                                    if (isModEquipped) {
                                      onEquipUpgrade?.(w.id, null);
                                    } else if (isOwned) {
                                      onEquipUpgrade?.(w.id, upg.id);
                                    } else {
                                      onPurchaseUpgrade?.(upg.id);
                                    }
                                  }}
                                  className={`w-full px-2 py-1 text-[9px] font-mono-tabular uppercase tracking-wider border text-left transition-colors cursor-pointer ${
                                    isAwakened
                                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100 font-bold'
                                      : isOverclocked
                                        ? 'bg-amber-500/20 border-amber-400 text-amber-100 font-bold'
                                        : isModEquipped
                                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 font-bold'
                                          : isOwned
                                            ? 'bg-[#0b1524] hover:bg-[#13233b] border-slate-700 text-slate-200'
                                            : canAfford
                                              ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-400/60 text-amber-200'
                                              : 'bg-[#080d16] border-slate-800 text-slate-500'
                                  }`}
                                >
                                  <div className="truncate font-semibold">
                                    {localUpg.shortLabel}
                                    {isAwakened
                                      ? ' · MK.III'
                                      : isOverclocked
                                        ? ' · MK.II'
                                        : ''}
                                  </div>
                                  <div className="text-[8px] opacity-80">
                                    {isModEquipped
                                      ? `${t(locale, 'benchEquippedTag')} · ${t(locale, 'benchUnequip')}`
                                      : isOwned
                                        ? `${t(locale, 'benchOwnedTag')} · ${t(locale, 'benchEquipMod')}`
                                        : `${t(locale, 'benchUnlock')} (${upg.cost} ${t(locale, 'benchFragShort')})`}
                                  </div>
                                </button>
                                {isOwned && !isOverclocked && onOverclockUpgrade && (
                                  <button
                                    type="button"
                                    data-testid={`title-upgrade-overclock-${upg.id}`}
                                    onClick={() => onOverclockUpgrade(upg.id)}
                                    className={`w-full px-2 py-0.5 text-[8px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors text-center cursor-pointer ${
                                      canAffordOverclock
                                        ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-400/80 text-amber-200'
                                        : 'bg-[#090d14] border-slate-800 text-slate-500'
                                    }`}
                                  >
                                    {t(locale, 'benchOverclock')}
                                  </button>
                                )}
                                {isOwned && isOverclocked && !isAwakened && onAwakenUpgrade && (
                                  <button
                                    type="button"
                                    data-testid={`title-upgrade-awaken-${upg.id}`}
                                    onClick={() => onAwakenUpgrade(upg.id)}
                                    className={`w-full px-2 py-0.5 text-[8px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors text-center cursor-pointer ${
                                      canAffordAwaken
                                        ? 'bg-emerald-500/20 hover:bg-emerald-500/35 border-emerald-400 text-emerald-200'
                                        : 'bg-[#090d14] border-slate-800 text-slate-500'
                                    }`}
                                  >
                                    {t(locale, 'benchAwaken')}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* v3.5.0: Live Effective Build Telemetry, Confluence Doctrine & Sovereign Boss Echo Cores (OMEGA Ω) */}
              {(() => {
                const titleRigSyn = computeRigSetSynergy(
                  progression?.equippedRigModules,
                  progression?.overclockedRigModules
                );
                const transcendedCores = progression?.transcendedBossCores ?? [];
                const bossCoreMods = computeBossCoreModifiers(
                  progression?.equippedBossCore ?? null,
                  transcendedCores
                );
                const confluence = computeSentinelCoreConfluence(
                  progression?.sentinelMode ?? 'off',
                  progression?.equippedBossCore ?? null,
                  transcendedCores
                );
                const attunement = computeWeaponCoreAttunement(
                  equippedWeaponId,
                  progression?.equippedBossCore ?? null,
                  transcendedCores
                );
                const effectiveDmgMult =
                  titleRigSyn.damageMultiplier *
                  bossCoreMods.allDamageMultiplier *
                  confluence.allDamageMultiplier *
                  attunement.damageMultiplier;
                const effectiveMaxWard = computeMaxChronoWard(
                  progression?.sentinelMode ?? 'off',
                  titleRigSyn,
                  bossCoreMods.bonusWard + confluence.bonusWard
                );
                const effectiveSkillCostPct = Math.round(
                  titleRigSyn.skillFluxCostMultiplier * confluence.skillFluxCostMultiplier * 100
                );
                const effectiveOverdrivePct = Math.round(
                  bossCoreMods.overdriveChargeMultiplier * 100
                );
                const unlockedCores = progression?.unlockedBossCores ?? [];
                const equippedCore = progression?.equippedBossCore ?? null;

                return (
                  <div
                    data-testid="title-boss-cores-section"
                    className="mb-2.5 pt-2 border-t border-slate-800 space-y-1.5"
                  >
                    <div
                      data-testid="title-effective-build-telemetry"
                      className="bg-[#08121f] border border-cyan-500/35 px-2 py-1 flex flex-wrap items-center justify-between gap-1.5 font-mono-tabular text-[9px] tabular-nums"
                    >
                      <span className="uppercase tracking-wider text-cyan-300 font-bold">
                        {t(locale, 'buildSynergyTitle')}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-slate-300">
                          {t(locale, 'buildStatDmg')}{' '}
                          <strong className="text-amber-300">×{effectiveDmgMult.toFixed(2)}</strong>
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-slate-300">
                          {t(locale, 'buildStatWard')}{' '}
                          <strong className="text-emerald-300">{effectiveMaxWard}</strong>
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-slate-300">
                          {t(locale, 'buildStatSkillCost')}{' '}
                          <strong className="text-cyan-300">{effectiveSkillCostPct}%</strong>
                        </span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-slate-300">
                          {t(locale, 'buildStatOverdrive')}{' '}
                          <strong className="text-violet-300">{effectiveOverdrivePct}%</strong>
                        </span>
                      </div>
                    </div>

                    <div
                      data-testid="title-confluence-doctrine-banner"
                      data-doctrine={confluence.doctrineId}
                      className={`px-2 py-1 border font-mono-tabular text-[9px] space-y-0.5 ${
                        confluence.active
                          ? 'bg-[#0c1828] border-amber-400/55 text-slate-200'
                          : 'bg-[#070e18] border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="uppercase tracking-wider font-bold text-amber-300">
                          {t(locale, 'confluenceDoctrineLabel')} ·{' '}
                          {locale === 'vi' ? confluence.titleVi : confluence.titleEn}
                        </span>
                        <span className="text-[8px] uppercase text-cyan-300 font-bold">
                          {locale === 'vi' ? confluence.burstTitleVi : confluence.burstTitleEn}
                        </span>
                      </div>
                      <div className="text-[8px] text-slate-300 leading-snug">
                        {locale === 'vi' ? confluence.passiveVi : confluence.passiveEn}
                      </div>
                    </div>

                    <div
                      data-testid="title-armament-attunement-banner"
                      data-attuned={attunement.attuned ? 'true' : 'false'}
                      data-cognate-core={attunement.cognateCoreId}
                      className={`px-2 py-1 border font-mono-tabular text-[9px] space-y-0.5 ${
                        attunement.attuned
                          ? 'bg-[#101827] border-cyan-400/65 text-slate-100'
                          : 'bg-[#070e18] border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="uppercase tracking-wider font-bold text-cyan-300">
                          {t(locale, 'attunementDoctrineLabel')} ·{' '}
                          {locale === 'vi' ? attunement.titleVi : attunement.titleEn}
                        </span>
                        <span
                          className={`text-[8px] uppercase font-bold ${
                            attunement.attuned ? 'text-amber-300' : 'text-slate-500'
                          }`}
                        >
                          {attunement.attuned
                            ? `✦ ${t(locale, 'attunementActiveTag')}${
                                attunement.isUniversalOverride ? ' · SOVEREIGN Ω' : ''
                              }`
                            : t(locale, 'attunementStandbyTag')}
                        </span>
                      </div>
                      <div className="text-[8px] text-slate-300 leading-snug">
                        {locale === 'vi' ? attunement.perkVi : attunement.perkEn}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-amber-300 font-bold">
                      <span>{t(locale, 'bossCoreSectionTitle')}</span>
                      <span className="text-slate-400 text-[9px]">
                        {locale === 'vi' ? '5 THỐNG LĨNH · OMEGA Ω' : '5 SOVEREIGNS · OMEGA Ω'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5">
                      {VALID_BOSS_ECHO_CORE_IDS.map((coreId) => {
                        const spec = BOSS_ECHO_CORES[coreId];
                        const isUnlocked = unlockedCores.includes(coreId);
                        const isEquipped = equippedCore === coreId;
                        const isOmega = isBossCoreTranscended(coreId, transcendedCores);
                        const canAfford =
                          (progression?.memoryFragments ?? 0) >= spec.synthesisCost;
                        const canAffordOmega =
                          (progression?.memoryFragments ?? 0) >= BOSS_CORE_OMEGA_COST;
                        return (
                          <div key={coreId} className="flex flex-col gap-1">
                            <button
                              type="button"
                              data-testid={`title-boss-core-btn-${coreId}`}
                              data-unlocked={isUnlocked ? 'true' : 'false'}
                              data-equipped={isEquipped ? 'true' : 'false'}
                              data-omega={isOmega ? 'true' : 'false'}
                              onClick={() => {
                                if (!isUnlocked) {
                                  onUnlockBossCore?.(coreId);
                                } else if (isEquipped) {
                                  onEquipBossCore?.(null);
                                } else {
                                  onEquipBossCore?.(coreId);
                                }
                              }}
                              disabled={!isUnlocked && !canAfford}
                              title={
                                locale === 'vi'
                                  ? `${spec.titleVi}${isOmega ? ' (OMEGA Ω)' : ''} — ${
                                      isOmega ? spec.omegaSummaryVi : spec.summaryVi
                                    }`
                                  : `${spec.titleEn}${isOmega ? ' (OMEGA Ω)' : ''} — ${
                                      isOmega ? spec.omegaSummaryEn : spec.summaryEn
                                    }`
                              }
                              style={{
                                borderColor: isEquipped
                                  ? isOmega
                                    ? '#fbbf24'
                                    : spec.accentCss
                                  : undefined,
                              }}
                              className={`px-2 py-1.5 text-[9px] font-mono-tabular uppercase tracking-wider border text-left transition-colors ${
                                isEquipped
                                  ? 'bg-[#0e1b2d] text-white font-bold cursor-pointer'
                                  : isUnlocked
                                    ? 'bg-[#09121e] hover:bg-[#112138] border-slate-700 text-slate-200 cursor-pointer'
                                    : canAfford
                                      ? 'bg-[#0b1320] hover:bg-[#142033] border-amber-500/60 text-amber-200 cursor-pointer'
                                      : 'bg-[#070b12] border-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              <div
                                className="truncate font-bold"
                                style={{ color: isOmega ? '#fbbf24' : spec.accentCss }}
                              >
                                {locale === 'vi' ? spec.shortBadgeVi : spec.shortBadgeEn}
                                {isOmega ? ' Ω' : ''}
                              </div>
                              <div className="text-[8px] text-slate-300 truncate">
                                {isEquipped
                                  ? t(locale, 'bossCoreUnequip')
                                  : isUnlocked
                                    ? t(locale, 'bossCoreEquip')
                                    : `${t(locale, 'bossCoreSynthesize')} ${spec.synthesisCost}◆`}
                              </div>
                            </button>
                            {isUnlocked && !isOmega && (
                              <button
                                type="button"
                                data-testid={`title-boss-core-awaken-${coreId}`}
                                disabled={!canAffordOmega}
                                onClick={() => onTranscendBossCore?.(coreId)}
                                className={`px-1.5 py-0.5 text-[8px] font-mono-tabular font-bold uppercase tracking-wider border text-center transition-colors ${
                                  canAffordOmega
                                    ? 'bg-amber-500/20 hover:bg-amber-500/35 border-amber-400/80 text-amber-200 cursor-pointer'
                                    : 'bg-[#060a10] border-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                {t(locale, 'bossCoreAwakenOmega')} ({BOSS_CORE_OMEGA_COST}◆)
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* v3.3.0: LYS-04 Chrono Sentinel Protocol [8] */}
              <div
                data-testid="title-sentinel-section"
                className="mb-2.5 pt-2 border-t border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-emerald-300 font-bold">
                  <span>{t(locale, 'sentinelSectionTitle')}</span>
                  <span className="text-slate-400">[8]</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {VALID_SENTINEL_MODES.map((mode) => {
                    const spec = SENTINEL_PROTOCOL_SPECS[mode];
                    const active = (progression?.sentinelMode ?? 'off') === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        data-testid={`title-sentinel-mode-${mode}`}
                        onClick={() => onSetSentinelProtocol?.(mode)}
                        title={locale === 'vi' ? spec.summaryVi : spec.summaryEn}
                        className={`px-2 py-1.5 text-[9px] font-mono-tabular uppercase tracking-wider border text-left transition-colors cursor-pointer ${
                          active
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100 font-bold'
                            : 'bg-[#09111d] hover:bg-[#112036] border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="truncate font-bold">
                          {locale === 'vi' ? spec.shortBadgeVi : spec.shortBadgeEn}
                        </div>
                        <div className="text-[8px] text-cyan-300/85 truncate">
                          {spec.baseWard > 0
                            ? locale === 'vi'
                              ? `+${spec.baseWard} HỘ THUẪN`
                              : `+${spec.baseWard} WARD`
                            : locale === 'vi'
                              ? 'ĐÓNG KÉN'
                              : 'DOCKED'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* v3.7.0: Echo Behavioral Doctrine [0] */}
              <div
                data-testid="title-echo-doctrine-section"
                className="mb-2.5 pt-2 border-t border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-sky-300 font-bold">
                  <span>{t(locale, 'echoDoctrineSectionTitle')}</span>
                  <span className="text-slate-400">[0]</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {VALID_ECHO_DOCTRINE_IDS.map((docId) => {
                    const spec = ECHO_DOCTRINE_SPECS[docId];
                    const active = normalizeEchoDoctrineId(progression?.echoDoctrine) === docId;
                    return (
                      <button
                        key={docId}
                        type="button"
                        data-testid={`title-echo-doctrine-${docId}`}
                        data-active={active ? 'true' : 'false'}
                        onClick={() => onSetEchoDoctrine?.(docId)}
                        title={locale === 'vi' ? spec.summaryVi : spec.summaryEn}
                        className={`px-2 py-1.5 text-[9px] font-mono-tabular uppercase tracking-wider border text-left transition-colors cursor-pointer ${
                          active
                            ? docId === 'vanguard'
                              ? 'bg-orange-500/20 border-orange-400 text-orange-100 font-bold'
                              : docId === 'bastion'
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100 font-bold'
                                : docId === 'nova'
                                  ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-100 font-bold'
                                  : 'bg-sky-500/20 border-sky-400 text-sky-100 font-bold'
                            : 'bg-[#09111d] hover:bg-[#112036] border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="truncate font-bold">
                          {locale === 'vi' ? spec.shortBadgeVi : spec.shortBadgeEn}
                        </div>
                        <div className="text-[8px] text-cyan-300/85 truncate">
                          {locale === 'vi' ? spec.roleVi : spec.roleEn}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chrono Rig Chassis Modules (3-Slot Rig Customization + MK.II + Set Synergy) */}
              <div
                data-testid="title-rig-modules-section"
                className="mb-2.5 pt-2 border-t border-slate-800 space-y-1.5"
              >
                {(() => {
                  const rigSyn = computeRigSetSynergy(
                    progression?.equippedRigModules,
                    progression?.overclockedRigModules
                  );
                  return (
                    <div
                      data-testid="title-rig-synergy-banner"
                      className={`px-2 py-1 border text-[9px] font-mono-tabular flex flex-wrap items-center justify-between gap-1 ${
                        rigSyn.tier === 3
                          ? 'bg-[#121f1c] border-amber-400/85 text-amber-200'
                          : rigSyn.tier >= 1
                            ? 'bg-[#0b1824] border-emerald-400/70 text-emerald-200'
                            : 'bg-[#090e17] border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="font-bold uppercase">
                        {locale === 'vi' ? rigSyn.titleVi : rigSyn.titleEn}
                      </span>
                      <span className="text-[8px] text-slate-300">
                        {locale === 'vi' ? rigSyn.perkSummaryVi : rigSyn.perkSummaryEn}
                      </span>
                    </div>
                  );
                })()}
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-amber-300 font-bold">
                  <span>{t(locale, 'benchRigModulesTitle')}</span>
                  <span className="text-slate-400">
                    {locale === 'vi' ? 'MỖI KHE 1 MÔ-ĐUN' : '1 ACTIVE PER SLOT'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {VALID_RIG_MODULE_SLOTS.map((slot) => {
                    const slotModules = Object.values(RIG_MODULES).filter(
                      (m) => m.slot === slot
                    );
                    const equippedInSlot =
                      progression?.equippedRigModules?.[slot] ?? null;
                    return (
                      <div
                        key={slot}
                        data-testid={`title-rig-slot-${slot}`}
                        className="p-2 bg-[#0b111c] border border-slate-800/90 space-y-1"
                      >
                        <div className="text-[9px] font-bold uppercase tracking-wider text-cyan-300 border-b border-slate-800/80 pb-0.5">
                          {localizeRigSlotLabel(slot, locale)}
                        </div>
                        {slotModules.map((mod) => {
                          const localMod = localizeRigModule(mod, locale);
                          const isOwned =
                            progression?.purchasedRigModules?.includes(mod.id) ??
                            false;
                          const isEquipped = equippedInSlot === mod.id;
                          const isMk2 = isRigModuleOverclocked(
                            mod.id,
                            progression?.overclockedRigModules
                          );
                          const canAfford =
                            (progression?.memoryFragments ?? 0) >= mod.cost;
                          const canAffordMk2 =
                            (progression?.memoryFragments ?? 0) >= RIG_OVERCLOCK_COST;
                          return (
                            <div key={mod.id} className="space-y-0.5">
                              <button
                                type="button"
                                data-testid={`title-rig-action-${mod.id}`}
                                title={`${localMod.benefitText} | - ${localMod.tradeoffText}`}
                                onClick={() => {
                                  if (isEquipped) {
                                    onEquipRigModule?.(mod.slot, null);
                                  } else if (isOwned) {
                                    onEquipRigModule?.(mod.slot, mod.id);
                                  } else {
                                    onPurchaseRigModule?.(mod.id);
                                  }
                                }}
                                className={`w-full px-2 py-1 text-[9px] font-mono-tabular uppercase tracking-wider border text-left transition-colors cursor-pointer ${
                                  isEquipped
                                    ? 'bg-amber-500/20 border-amber-400 text-amber-100 font-bold'
                                    : isOwned
                                      ? 'bg-[#0b1524] hover:bg-[#13233b] border-slate-700 text-slate-200'
                                      : canAfford
                                        ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-400/60 text-amber-200'
                                        : 'bg-[#080d16] border-slate-800 text-slate-500'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="truncate font-semibold">{localMod.shortLabel}</span>
                                  {isMk2 && (
                                    <span className="text-[7px] px-1 border border-emerald-400 text-emerald-200 shrink-0">
                                      MK.II
                                    </span>
                                  )}
                                </div>
                                <div className="text-[8px] opacity-80">
                                  {isEquipped
                                    ? `${t(locale, 'benchEquippedTag')} · ${t(locale, 'benchUnequip')}`
                                    : isOwned
                                      ? `${t(locale, 'benchOwnedTag')} · ${t(locale, 'benchEquipModule')}`
                                      : `${t(locale, 'benchUnlock')} (${mod.cost} ${t(locale, 'benchFragShort')})`}
                                </div>
                              </button>
                              {isOwned && !isMk2 && (
                                <button
                                  type="button"
                                  data-testid={`title-rig-overclock-${mod.id}`}
                                  onClick={() => onOverclockRigModule?.(mod.id)}
                                  className={`w-full px-1.5 py-0.5 text-[8px] font-mono-tabular uppercase tracking-wider border text-center transition-colors cursor-pointer ${
                                    canAffordMk2
                                      ? 'bg-emerald-500/20 hover:bg-emerald-400/30 border-emerald-400/75 text-emerald-200'
                                      : 'bg-[#080d16] border-slate-800 text-slate-500'
                                  }`}
                                >
                                  MK.II ({RIG_OVERCLOCK_COST} {t(locale, 'benchFragShort')})
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chrono Neural Protocols (Suit Buildcraft) */}
              <div
                data-testid="title-neural-protocols-section"
                className="mb-2.5 pt-2 border-t border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-cyan-300 font-bold">
                  <span>{t(locale, 'neuralProtocolsTitle')}</span>
                  <span className="text-slate-400">
                    {(progression?.purchasedNeuralProtocols ?? []).length}/4{' '}
                    {locale === 'vi' ? 'ĐANG BẬT' : 'ACTIVE'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {TITLE_NEURAL_PROTOCOLS.map((proto) => {
                    const localProto = localizeNeuralProtocol(proto, locale);
                    const isInstalled =
                      progression?.purchasedNeuralProtocols?.includes(proto.id) ?? false;
                    const canAfford =
                      (progression?.memoryFragments ?? 0) >= proto.cost;
                    return (
                      <button
                        key={proto.id}
                        type="button"
                        data-testid={`title-neural-action-${proto.id}`}
                        disabled={isInstalled}
                        title={`${localProto.benefitText} | - ${localProto.tradeoffText}`}
                        onClick={() => {
                          if (!isInstalled) {
                            onPurchaseNeuralProtocol?.(proto.id);
                          }
                        }}
                        className={`p-2 text-[9px] font-mono-tabular uppercase tracking-wider border text-left transition-colors ${
                          isInstalled
                            ? 'bg-[#0a1c28] border-cyan-400/90 text-cyan-100 cursor-default'
                            : canAfford
                              ? 'bg-[#0b1524] hover:bg-[#13263e] border-cyan-500/60 text-slate-100 cursor-pointer'
                              : 'bg-[#080d16] border-slate-800 text-slate-400 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 font-bold">
                          <span className="truncate text-white">{localProto.name}</span>
                          <span
                            className={
                              isInstalled
                                ? 'text-emerald-300'
                                : canAfford
                                  ? 'text-amber-300'
                                  : 'text-slate-500'
                            }
                          >
                            {isInstalled
                              ? locale === 'vi'
                                ? 'ĐANG BẬT'
                                : 'ACTIVE'
                              : `${proto.cost} ${t(locale, 'benchFragShort')}`}
                          </span>
                        </div>
                        <div className="text-[8px] text-emerald-300/95 truncate mt-0.5">
                          + {localProto.benefitText}
                        </div>
                        <div className="text-[8px] text-amber-300/85 truncate">
                          - {localProto.tradeoffText}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* v2.3.0: 12 Chrono Achievements Checklist */}
              <div
                data-testid="title-achievements-section"
                className="mb-2.5 pt-2 border-t border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-amber-300 font-bold">
                  <span>CHRONO ACHIEVEMENTS</span>
                  <span className="text-slate-300">
                    {(progression?.unlockedAchievementIds ?? []).length} / {CHRONO_ACHIEVEMENTS.length} UNLOCKED
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  {CHRONO_ACHIEVEMENTS.map((ach) => {
                    const done = progression?.unlockedAchievementIds?.includes(ach.id) ?? false;
                    return (
                      <div
                        key={ach.id}
                        data-testid={`title-ach-${ach.id}`}
                        data-unlocked={done ? 'true' : 'false'}
                        title={ach.description}
                        className={`px-1.5 py-1 border text-[8px] font-mono-tabular ${
                          done
                            ? 'bg-amber-950/35 border-amber-400/70 text-amber-100'
                            : 'bg-[#070b12] border-slate-800/90 text-slate-500'
                        }`}
                      >
                        <div className="font-bold uppercase truncate">
                          {done ? '★ ' : '○ '}
                          {ach.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  FRAGMENTS:{' '}
                  <strong className="text-amber-300">
                    {progression?.memoryFragments ?? 0} AVAIL
                  </strong>{' '}
                  ({unlockedWeaponIds.length}/4 ARSENAL)
                </span>
                <span>
                  SECRETS: <strong className="text-cyan-300">{secretCount}/4</strong> · CODEX:{' '}
                  <strong className="text-violet-300">{codexCount}/8</strong>
                </span>
              </div>
                </>
              )}
            </div>
          )}

          {/* Drawer 3: System Settings & Controls */}
          {activeDrawer === 'controls' && (
            <div
              data-testid="title-controls-panel"
              className="w-full max-w-xl max-h-[82vh] overflow-y-auto bg-[#090e17]/95 border border-cyan-500/50 p-4 text-xs font-mono-tabular text-slate-300 shadow-[0_16px_48px_rgba(0,0,0,0.85)]"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-cyan-400">
                    NADIR-9 FIELD SPECIFICATION · LIVE CONFIG
                  </div>
                  <h2 className="text-sm sm:text-base font-display font-bold uppercase tracking-wider text-white">
                    SYSTEM SETTINGS &amp; CONTROLS
                  </h2>
                </div>
                <button
                  type="button"
                  data-testid="title-drawer-close-controls"
                  onClick={() => setActiveDrawer('none')}
                  className="px-2.5 py-1 text-xs font-mono-tabular uppercase bg-[#111a29] hover:bg-[#1b2940] border border-slate-700 text-slate-300 cursor-pointer"
                >
                  ← Close
                </button>
              </div>

              {/* Live Settings Controls (Placed First for Instant Access on All Viewports) */}
              <div className="space-y-2.5 mb-4">
                <div className="text-[10px] uppercase tracking-widest text-cyan-300 font-semibold">
                  GRAPHICS, AUDIO, CAMERA &amp; ACCESSIBILITY PREFERENCES
                </div>

                {cameraSettings && onUpdateCameraSettings && (() => {
                  const gfx = resolveGraphicsSettings(cameraSettings);
                  return (
                    <div className="bg-[#0a1019] border border-slate-800/90 p-2.5 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-cyan-300 font-bold">
                            GRAPHICS & PERFORMANCE
                          </span>
                          <span
                            data-testid="title-setting-preset-active"
                            className="text-[9px] uppercase px-1.5 py-0.5 bg-[#0d1522] border border-cyan-500/40 text-cyan-300 font-bold"
                          >
                            {gfx.graphicsPreset === 'performance'
                              ? 'MAX FPS'
                              : gfx.graphicsPreset === 'balanced'
                                ? 'BALANCED'
                                : gfx.graphicsPreset === 'quality'
                                  ? 'HIGH'
                                  : 'CUSTOM'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(
                            [
                              { id: 'performance', label: 'MAX FPS' },
                              { id: 'balanced', label: 'BALANCED' },
                              { id: 'quality', label: 'HIGH' },
                            ] as const
                          ).map((preset) => {
                            const active = gfx.graphicsPreset === preset.id;
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                data-testid={`title-setting-preset-${preset.id}`}
                                aria-pressed={active}
                                onClick={() =>
                                  onUpdateCameraSettings({ graphicsPreset: preset.id })
                                }
                                className={`px-2 py-0.5 text-[10px] font-bold uppercase border cursor-pointer ${
                                  active
                                    ? 'bg-cyan-400/20 border-cyan-400 text-cyan-300'
                                    : 'bg-[#0b1018] border-slate-700 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {preset.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px]">
                        <div className="flex items-center justify-between gap-2 bg-[#070b12] border border-slate-800 px-2.5 py-1.5">
                          <span className="text-slate-300 uppercase">RENDER SCALE</span>
                          <div className="flex gap-1">
                            {RENDER_SCALE_OPTIONS.map((scale) => {
                              const active = Math.abs(gfx.renderScale - scale) < 0.02;
                              return (
                                <button
                                  key={scale}
                                  type="button"
                                  data-testid={`title-setting-render-scale-${scale}`}
                                  aria-pressed={active}
                                  onClick={() =>
                                    onUpdateCameraSettings({
                                      graphicsPreset: 'custom',
                                      renderScale: scale,
                                    })
                                  }
                                  className={`px-1.5 py-0.5 border cursor-pointer ${
                                    active
                                      ? 'bg-cyan-400/20 border-cyan-400 text-cyan-300 font-bold'
                                      : 'bg-[#0b1018] border-slate-700 text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  {Math.round(scale * 100)}%
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 bg-[#070b12] border border-slate-800 px-2.5 py-1.5">
                          <span className="text-slate-300 uppercase">FPS CAP</span>
                          <div className="flex gap-1">
                            {FPS_LIMIT_OPTIONS.map((cap) => {
                              const active = gfx.fpsLimit === cap;
                              return (
                                <button
                                  key={cap}
                                  type="button"
                                  data-testid={`title-setting-fps-${cap}`}
                                  aria-pressed={active}
                                  onClick={() =>
                                    onUpdateCameraSettings({
                                      graphicsPreset: 'custom',
                                      fpsLimit: cap,
                                    })
                                  }
                                  className={`px-1.5 py-0.5 border cursor-pointer ${
                                    active
                                      ? 'bg-cyan-400/20 border-cyan-400 text-cyan-300 font-bold'
                                      : 'bg-[#0b1018] border-slate-700 text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  {cap === 0 ? 'MAX' : cap}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 bg-[#070b12] border border-slate-800 px-2.5 py-1.5">
                          <span className="text-slate-300 uppercase">SHADOWS</span>
                          <div className="flex gap-1">
                            {(
                              [
                                { id: 'off', label: 'OFF' },
                                { id: 'medium', label: '512' },
                                { id: 'high', label: '1024' },
                              ] as const
                            ).map((opt) => {
                              const active = gfx.shadowQuality === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  data-testid={`title-setting-shadows-${opt.id}`}
                                  aria-pressed={active}
                                  onClick={() =>
                                    onUpdateCameraSettings({
                                      graphicsPreset: 'custom',
                                      shadowQuality: opt.id,
                                    })
                                  }
                                  className={`px-1.5 py-0.5 border cursor-pointer ${
                                    active
                                      ? 'bg-cyan-400/20 border-cyan-400 text-cyan-300 font-bold'
                                      : 'bg-[#0b1018] border-slate-700 text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 bg-[#070b12] border border-slate-800 px-2.5 py-1.5">
                          <span className="text-slate-300 uppercase">VFX & PARTICLES</span>
                          <div className="flex gap-1">
                            {(
                              [
                                { id: 'low', label: 'LOW' },
                                { id: 'medium', label: 'MED' },
                                { id: 'high', label: 'HIGH' },
                              ] as const
                            ).map((opt) => {
                              const active = gfx.particleQuality === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  data-testid={`title-setting-particles-${opt.id}`}
                                  aria-pressed={active}
                                  onClick={() =>
                                    onUpdateCameraSettings({
                                      graphicsPreset: 'custom',
                                      particleQuality: opt.id,
                                    })
                                  }
                                  className={`px-1.5 py-0.5 border cursor-pointer ${
                                    active
                                      ? 'bg-cyan-400/20 border-cyan-400 text-cyan-300 font-bold'
                                      : 'bg-[#0b1018] border-slate-700 text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 bg-[#070b12] border border-slate-800 px-2.5 py-1.5">
                          <span className="text-slate-300 uppercase">LIGHTING</span>
                          <div className="flex gap-1">
                            {(
                              [
                                { id: 'lite', label: 'LITE' },
                                { id: 'standard', label: 'STD' },
                              ] as const
                            ).map((opt) => {
                              const active = gfx.lightingQuality === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  data-testid={`title-setting-lighting-${opt.id}`}
                                  aria-pressed={active}
                                  onClick={() =>
                                    onUpdateCameraSettings({
                                      graphicsPreset: 'custom',
                                      lightingQuality: opt.id,
                                    })
                                  }
                                  className={`px-1.5 py-0.5 border cursor-pointer ${
                                    active
                                      ? 'bg-cyan-400/20 border-cyan-400 text-cyan-300 font-bold'
                                      : 'bg-[#0b1018] border-slate-700 text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          type="button"
                          data-testid="title-setting-perf-hud"
                          aria-pressed={gfx.showPerfHud}
                          onClick={() =>
                            onUpdateCameraSettings({ showPerfHud: !gfx.showPerfHud })
                          }
                          className="flex items-center justify-between px-2.5 py-1.5 bg-[#070b12] hover:bg-[#162236] border border-slate-800 cursor-pointer"
                        >
                          <span className="text-slate-300 uppercase">FPS & LATENCY HUD [F3]</span>
                          <span
                            className={
                              gfx.showPerfHud
                                ? 'text-cyan-300 font-bold'
                                : 'text-slate-500 font-bold'
                            }
                          >
                            {gfx.showPerfHud ? 'ON' : 'OFF'}
                          </span>
                        </button>

                        <button
                          type="button"
                          data-testid="title-setting-adaptive-fps"
                          aria-pressed={gfx.adaptiveResolution}
                          title={t(locale, 'adaptiveFpsDesc')}
                          onClick={() =>
                            onUpdateCameraSettings({
                              adaptiveResolution: !gfx.adaptiveResolution,
                            })
                          }
                          className="flex items-center justify-between px-2.5 py-1.5 bg-[#070b12] hover:bg-[#162236] border border-slate-800 cursor-pointer sm:col-span-2"
                        >
                          <span className="text-slate-300 uppercase">
                            {t(locale, 'adaptiveFpsLabel')}
                          </span>
                          <span
                            className={
                              gfx.adaptiveResolution
                                ? 'text-emerald-300 font-bold'
                                : 'text-slate-500 font-bold'
                            }
                          >
                            {gfx.adaptiveResolution ? 'ON' : 'OFF'}
                          </span>
                        </button>

                        {/* v3.8.0: Celestial Sky Grade Selector */}
                        <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 bg-[#070b12] border border-slate-800">
                          <span
                            className="text-slate-300 uppercase"
                            title={t(locale, 'celestialGradeDesc')}
                          >
                            {t(locale, 'celestialGradeLabel')}
                          </span>
                          <div className="flex items-center gap-1">
                            {(
                              [
                                { id: 'natural', label: t(locale, 'celestialNatural') },
                                { id: 'aurora', label: t(locale, 'celestialAurora') },
                                { id: 'eclipse', label: t(locale, 'celestialEclipse') },
                              ] as const
                            ).map((grade) => {
                              const active = gfx.celestialGrade === grade.id;
                              return (
                                <button
                                  key={grade.id}
                                  type="button"
                                  data-testid={`title-setting-celestial-${grade.id}`}
                                  aria-pressed={active}
                                  onClick={() =>
                                    onUpdateCameraSettings({ celestialGrade: grade.id })
                                  }
                                  className={`px-2 py-0.5 text-[10px] font-mono-tabular font-bold uppercase border transition-colors cursor-pointer whitespace-nowrap ${
                                    active
                                      ? 'bg-cyan-400/20 border-cyan-400 text-cyan-200'
                                      : 'bg-[#0b121e] border-slate-700 text-slate-400 hover:text-slate-200'
                                  }`}
                                >
                                  {grade.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    data-testid="title-setting-mute"
                    aria-pressed={isMuted}
                    onClick={onToggleMute}
                    className="flex items-center justify-between px-3 py-2 bg-[#0d1522] hover:bg-[#162236] border border-slate-700 text-[11px] cursor-pointer"
                  >
                    <span>Audio [M]</span>
                    <span className={isMuted ? 'text-amber-400 font-bold' : 'text-cyan-300 font-bold'}>
                      {isMuted ? 'MUTED' : 'ACTIVE'}
                    </span>
                  </button>

                  {onToggleTutorial && (
                    <button
                      type="button"
                      data-testid="title-setting-hints"
                      aria-pressed={tutorialEnabled}
                      onClick={onToggleTutorial}
                      className="flex items-center justify-between px-3 py-2 bg-[#0d1522] hover:bg-[#162236] border border-slate-700 text-[11px] cursor-pointer"
                    >
                      <span>Tutorial Hints [H]</span>
                      <span
                        className={
                          tutorialEnabled ? 'text-cyan-300 font-bold' : 'text-slate-500 font-bold'
                        }
                      >
                        {tutorialEnabled ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  )}
                </div>

                {cameraSettings && onUpdateCameraSettings && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <label className="flex flex-col gap-1 bg-[#0d1522] border border-slate-800 px-3 py-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span>Master Volume</span>
                        <span className="text-cyan-300">
                          {Math.round((cameraSettings.masterVolume ?? 0.85) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        data-testid="title-setting-master-volume"
                        min="0"
                        max="1"
                        step="0.05"
                        value={cameraSettings.masterVolume ?? 0.85}
                        onChange={(e) =>
                          onUpdateCameraSettings({
                            masterVolume: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </label>

                    <label className="flex flex-col gap-1 bg-[#0d1522] border border-slate-800 px-3 py-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span>SFX / Combat Bus</span>
                        <span className="text-cyan-300">
                          {Math.round((cameraSettings.sfxVolume ?? 0.9) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        data-testid="title-setting-sfx-volume"
                        min="0"
                        max="1"
                        step="0.05"
                        value={cameraSettings.sfxVolume ?? 0.9}
                        onChange={(e) =>
                          onUpdateCameraSettings({
                            sfxVolume: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </label>

                    <label className="flex flex-col gap-1 bg-[#0d1522] border border-slate-800 px-3 py-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span>Music / Stinger Bus</span>
                        <span className="text-cyan-300">
                          {Math.round((cameraSettings.musicVolume ?? 0.7) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        data-testid="title-setting-music-volume"
                        min="0"
                        max="1"
                        step="0.05"
                        value={cameraSettings.musicVolume ?? 0.7}
                        onChange={(e) =>
                          onUpdateCameraSettings({
                            musicVolume: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </label>

                    <label className="flex flex-col gap-1 bg-[#0d1522] border border-slate-800 px-3 py-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span>Camera Sensitivity</span>
                        <span className="text-cyan-300">
                          {cameraSettings.sensitivity.toFixed(1)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        data-testid="title-setting-sensitivity"
                        min="0.3"
                        max="2.5"
                        step="0.1"
                        value={cameraSettings.sensitivity}
                        onChange={(e) =>
                          onUpdateCameraSettings({
                            sensitivity: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </label>

                    <button
                      type="button"
                      data-testid="title-setting-invert-y"
                      aria-pressed={cameraSettings.invertY}
                      onClick={() =>
                        onUpdateCameraSettings({ invertY: !cameraSettings.invertY })
                      }
                      className="flex items-center justify-between px-3 py-2 bg-[#0d1522] hover:bg-[#162236] border border-slate-800 text-[11px] cursor-pointer"
                    >
                      <span>Invert Y-Axis</span>
                      <span
                        className={
                          cameraSettings.invertY ? 'text-cyan-300 font-bold' : 'text-slate-500'
                        }
                      >
                        {cameraSettings.invertY ? 'INVERTED' : 'STANDARD'}
                      </span>
                    </button>

                    <button
                      type="button"
                      data-testid="title-setting-camera-shake"
                      aria-pressed={cameraSettings.cameraShake ?? true}
                      onClick={() =>
                        onUpdateCameraSettings({
                          cameraShake: !(cameraSettings.cameraShake ?? true),
                        })
                      }
                      className="flex items-center justify-between px-3 py-2 bg-[#0d1522] hover:bg-[#162236] border border-slate-800 text-[11px] cursor-pointer"
                    >
                      <span>Camera Shake</span>
                      <span
                        className={
                          (cameraSettings.cameraShake ?? true)
                            ? 'text-cyan-300 font-bold'
                            : 'text-slate-500'
                        }
                      >
                        {(cameraSettings.cameraShake ?? true) ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    <button
                      type="button"
                      data-testid="title-setting-screen-effects"
                      aria-pressed={cameraSettings.screenEffects ?? true}
                      onClick={() =>
                        onUpdateCameraSettings({
                          screenEffects: !(cameraSettings.screenEffects ?? true),
                        })
                      }
                      className="flex items-center justify-between px-3 py-2 bg-[#0d1522] hover:bg-[#162236] border border-slate-800 text-[11px] cursor-pointer"
                    >
                      <span>Screen Effects</span>
                      <span
                        className={
                          (cameraSettings.screenEffects ?? true)
                            ? 'text-cyan-300 font-bold'
                            : 'text-slate-500'
                        }
                      >
                        {(cameraSettings.screenEffects ?? true) ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    <button
                      type="button"
                      data-testid="title-setting-subtitles"
                      aria-pressed={cameraSettings.subtitlesEnabled ?? true}
                      onClick={() =>
                        onUpdateCameraSettings({
                          subtitlesEnabled: !(cameraSettings.subtitlesEnabled ?? true),
                        })
                      }
                      className="flex items-center justify-between px-3 py-2 bg-[#0d1522] hover:bg-[#162236] border border-slate-800 text-[11px] cursor-pointer"
                    >
                      <span>Comms Subtitles</span>
                      <span
                        className={
                          (cameraSettings.subtitlesEnabled ?? true)
                            ? 'text-cyan-300 font-bold'
                            : 'text-slate-500'
                        }
                      >
                        {(cameraSettings.subtitlesEnabled ?? true) ? 'ON' : 'OFF'}
                      </span>
                    </button>

                    <div className="sm:col-span-2 space-y-1">
                      <button
                        type="button"
                        id="title-setting-reduced-motion"
                        data-testid="title-setting-reduced-motion"
                        aria-label="Reduced motion"
                        aria-pressed={cameraSettings.reducedMotion}
                        aria-describedby="title-reduced-motion-description"
                        onClick={() =>
                          onUpdateCameraSettings({ reducedMotion: !cameraSettings.reducedMotion })
                        }
                        className="w-full flex items-center justify-between px-3 py-2 bg-[#0d1522] hover:bg-[#162236] border border-slate-800 text-[11px] cursor-pointer"
                      >
                        <span>Reduced motion</span>
                        <span className={cameraSettings.reducedMotion ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                          {cameraSettings.reducedMotion ? 'ON' : 'OFF'}
                        </span>
                      </button>
                      <p id="title-reduced-motion-description" className="text-[10px] text-slate-400">
                        Stops camera shake and title orbit; softens ambient motion. Combat cues stay visible.
                      </p>
                    </div>
                  </div>
                )}

                {/* v2.3.0: Custom Chrono Mutators (4) & Speedrun Split Timer */}
                <div
                  data-testid="title-mutators-section"
                  className="pt-2.5 border-t border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                    <span className="text-fuchsia-300 font-bold">
                      CHRONO MUTATORS &amp; SPEEDRUN TIMER
                    </span>
                    <span className="text-amber-300 font-bold">
                      +{Math.round((computeMutatorModifiers(progression?.mutators).bonusFragmentMultiplier - 1) * 100)}% FRAG BONUS
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {CHRONO_MUTATORS.map((mut) => {
                      const active = Boolean(progression?.mutators?.[mut.key]);
                      return (
                        <button
                          key={mut.key}
                          type="button"
                          data-testid={`title-mutator-${mut.key}`}
                          aria-pressed={active}
                          onClick={() => onToggleMutator?.(mut.key)}
                          className={`p-2 border text-left transition-colors cursor-pointer ${
                            active
                              ? 'bg-fuchsia-950/45 border-fuchsia-400 text-fuchsia-100'
                              : 'bg-[#0c1320] hover:bg-[#142034] border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 text-[10px] font-bold uppercase">
                            <span>{mut.label}</span>
                            <span className={active ? 'text-fuchsia-300' : 'text-slate-500'}>
                              {active ? 'ON' : mut.shortTag}
                            </span>
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5 leading-snug">
                            {mut.description} (+{mut.bonusFragmentPct}% Frags)
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    data-testid="title-setting-speedrun-hud"
                    aria-pressed={Boolean(progression?.speedrunHudEnabled)}
                    onClick={() => onToggleSpeedrunHud?.()}
                    className="w-full flex items-center justify-between px-3 py-2 bg-[#0d1522] hover:bg-[#162236] border border-cyan-500/40 text-[11px] cursor-pointer"
                  >
                    <span className="text-slate-200 uppercase font-semibold">
                      Live Speedrun Split Timer HUD
                      {progression?.bestSpeedrunFullSec != null && (
                        <span className="ml-2 text-cyan-300">
                          (PB {formatSpeedrunClock(progression.bestSpeedrunFullSec)})
                        </span>
                      )}
                    </span>
                    <span
                      className={
                        progression?.speedrunHudEnabled
                          ? 'text-cyan-300 font-bold'
                          : 'text-slate-500'
                      }
                    >
                      {progression?.speedrunHudEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Compact Field Controls Reference Below Settings */}
              <div className="border-t border-slate-800 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] leading-relaxed">
                <div className="bg-[#0d1422] border border-slate-800 p-2">
                  <div className="text-white font-semibold mb-1 uppercase tracking-wider">
                    MOVEMENT &amp; ARSENAL
                  </div>
                  <div className="space-y-0.5 text-slate-300">
                    <div>
                      <span className="text-cyan-300">[WASD]</span> Move ·{' '}
                      <span className="text-cyan-300">[Mouse / Arrows]</span> Aim
                    </div>
                    <div>
                      <span className="text-sky-300">[1-4 / Tab / Z]</span> Arsenal (Edge · Pulse · Rail · Breaker)
                    </div>
                    <div>
                      <span className="text-cyan-300">[LMB / F]</span> Light ·{' '}
                      <span className="text-amber-300">[E / RMB]</span> Heavy ·{' '}
                      <span className="text-cyan-300">[Space]</span> Dodge ·{' '}
                      <span className="text-amber-300">[Q / L]</span> Parry (+35 Flux)
                    </div>
                  </div>
                </div>

                <div className="bg-[#0d1422] border border-slate-800 p-2">
                  <div className="text-white font-semibold mb-1 uppercase tracking-wider">
                    CHRONO RIG &amp; SYSTEM
                  </div>
                  <div className="space-y-0.5 text-slate-300">
                    <div>
                      <span className="text-amber-300">[T]</span> Record ·{' '}
                      <span className="text-cyan-300">[Y]</span> Replay ·{' '}
                      <span className="text-cyan-300">[V]</span> Relay ·{' '}
                      <span className="text-slate-300">[C]</span> Clear
                    </div>
                    <div>
                      <span className="text-cyan-300">[G]</span> Gravity Pin ·{' '}
                      <span className="text-cyan-300">[X]</span> Echo Collapse
                    </div>
                    <div>
                      <span className="text-slate-200">[P/Esc]</span> Pause ·{' '}
                      <span className="text-slate-200">[N]</span> Map ·{' '}
                      <span className="text-slate-200">[U]</span> Armory ·{' '}
                      <span className="text-slate-200">[M]</span> Audio ·{' '}
                      <span className="text-slate-200">[H]</span> Hints
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 bg-[#0d1422] border border-slate-800 px-2.5 py-1.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-cyan-300 font-semibold uppercase tracking-wider mr-2">
                      GAMEPAD (XBOX / PS):
                    </span>
                    <span className="text-slate-300">
                      L-Stick Move · R-Stick Aim · A Dodge · X/RB Light · Y/RT Heavy · LB Parry · LT Relay · B Interact
                    </span>
                  </div>
                  <a
                    data-testid="title-download-bundle"
                    href="./AFTERFRAME-v4.2.0-horological.bundle"
                    download="AFTERFRAME-v4.2.0-horological.bundle"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      handleMarkBundleDownloaded();
                    }}
                    className="pointer-events-auto shrink-0 px-2 py-1 bg-[#0b1320] hover:bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 font-bold tracking-wider uppercase transition-colors cursor-pointer no-underline"
                  >
                    {bundleDownloadStatus === 'saved'
                      ? t(locale, 'bundleSaved')
                      : t(locale, 'downloadBundle')}
                  </a>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Whisper-Thin Atmospheric Footer */}
      <footer className="pointer-events-auto flex items-center justify-between gap-3 text-[10px] font-mono-tabular tracking-[0.16em] uppercase text-slate-400/90 border-t border-white/8 pt-2 shrink-0">
        <span className="truncate">{t(locale, 'footerLaunchHint')}</span>
        <span className="hidden sm:inline text-slate-500 whitespace-nowrap">
          NADIR-9 · CHRONO RIG v4.2
        </span>
      </footer>
    </div>
  );
});
