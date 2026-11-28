import React from 'react';
import { evaluateCombatRank } from '../game/combat-flow.ts';
import { GAME_CONFIG } from '../game/config.ts';
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
import { computeWeaponMasteryRankInfo } from '../game/recursion-mode.ts';
import {
  DEFAULT_LOADOUT_PRESET_NAMES,
  getAllNeuralProtocolDefinitions,
  getAllWeaponUpgradeDefinitions,
} from '../game/simulation.ts';
import { computeCommsCodecProfile } from '../game/tactical-hud.ts';
import { formatGauntletClock } from '../game/chrono-overdrive.ts';
import { buildStationSectorMapNodes } from '../game/expedition-path.ts';
import {
  CHRONO_ACHIEVEMENTS,
  CHRONO_MUTATORS,
  FIELD_FABRICATOR_ITEMS,
  SERA_RIG_SKINS,
  isSeraRigSkinUnlocked,
} from '../game/paradox-expansion.ts';
import {
  DIFFICULTY_TIERS,
  LYSA_HOLO_MEMORIES,
  VALID_DIFFICULTY_TIERS,
  computeHoloMemoryResonanceBonus,
  getChapterStoryBeat,
  getEndingChronicleSummary,
} from '../game/chronicle-narrative.ts';
import {
  CHRONICLE_LINK_CHAIN,
  computeChroniclePassiveBonus,
} from '../game/chrono-nexus.ts';
import {
  ORDERED_WEAPON_RESONANCE_IDS,
  WEAPON_RESONANCE_SPECS,
  computeGlobalArsenalMasteryBonus,
} from '../game/chrono-resonance.ts';
import { WEAPON_MOD_CHIPS } from '../game/ascension-expansion.ts';
import {
  WEAPON_AWAKENING_COST,
  computeStanceDoctrineModifiers,
  getStanceLoomCoda,
  localizeBenchActionMessage,
  localizeMasteryRankLabel,
  localizeNeuralProtocol,
  localizeRigModule,
  localizeRigSlotLabel,
  localizeStanceLabel,
  localizeStoryArc,
  localizeWeaponUpgrade,
} from '../game/chronicle-awakening.ts';
import { computeMasterySealModifiers } from '../game/combat-mastery.ts';
import { t } from '../game/i18n.ts';
import { MasteryLedgerPanel } from './MasteryLedgerPanel.tsx';
import type {
  AppLocale,
  ArenaTemporalRift,
  BossCheckpointState,
  BossEchoCoreId,
  BossGauntletState,
  CameraSettings,
  CampaignChapterId,
  ChronicleLoomEndingId,
  ChronoMutatorState,
  CodexEntryId,
  DifficultyTierId,
  EchoDoctrineId,
  EncounterMode,
  FabricatorItemId,
  GameAppState,
  GameOutcome,
  HudRadarSnapshot,
  HudWeaponProgressionSnapshot,
  MasteryBountyKind,
  MasteryTargetId,
  NeuralProtocolId,
  ParadoxRuntimeState,
  RecursionRunState,
  RigModuleId,
  RigModuleSlot,
  RunMode,
  RunSummary,
  SentinelProtocolMode,
  SeraRigSkinId,
  StoryArcId,
  TacticalLoadoutPresetSlot,
  TacticalWaypointState,
  WeaponId,
  WeaponModChipId,
  WeaponUpgradeId,
  WorldExplorationState,
} from '../game/types.ts';

interface StatusModalProps {
  appState: GameAppState;
  encounterMode?: EncounterMode;
  runMode?: RunMode;
  chapter?: CampaignChapterId;
  pendingNextChapter?: CampaignChapterId | null;
  hasSavedCampaignSnapshot?: boolean;
  savedCampaignChapter?: CampaignChapterId | null;
  savedCampaignCheckpoint?: BossCheckpointState | null;
  bossCheckpoint?: BossCheckpointState | null;
  recoveredLogs?: string[];
  completedEndings?: ChronicleLoomEndingId[];
  outcome: GameOutcome;
  summary: RunSummary | null;
  elapsedTime: number;
  enemiesDefeated: number;
  totalEnemies: number;
  progression?: HudWeaponProgressionSnapshot;
  exploration?: WorldExplorationState;
  radar?: HudRadarSnapshot;
  recursion?: RecursionRunState | null;
  gauntlet?: BossGauntletState | null;
  temporalRift?: ArenaTemporalRift | null;
  initialExplorationTab?: 'missions' | 'map' | 'codex' | 'holo' | 'mastery';
  equippedWeaponId?: WeaponId;
  onSelectWeapon?: (weaponId: WeaponId) => void;
  onPurchaseUpgrade?: (upgradeId: WeaponUpgradeId) => void;
  onEquipUpgrade?: (weaponId: WeaponId, upgradeId: WeaponUpgradeId | null) => void;
  onOverclockUpgrade?: (upgradeId: WeaponUpgradeId) => void;
  onAwakenUpgrade?: (upgradeId: WeaponUpgradeId) => void;
  onEquipModChip?: (chipId: WeaponModChipId | null) => void;
  onPurchaseRigModule?: (moduleId: RigModuleId) => void;
  onEquipRigModule?: (slot: RigModuleSlot, moduleId: RigModuleId | null) => void;
  onOverclockRigModule?: (moduleId: RigModuleId) => void;
  onSetSentinelProtocol?: (mode: SentinelProtocolMode) => void;
  onSetEchoDoctrine?: (doctrineId: EchoDoctrineId) => void;
  onUnlockBossCore?: (coreId: BossEchoCoreId) => void;
  onEquipBossCore?: (coreId: BossEchoCoreId | null) => void;
  onTranscendBossCore?: (coreId: BossEchoCoreId) => void;
  onSaveLoadoutPreset?: (slotIndex: TacticalLoadoutPresetSlot) => void;
  onApplyLoadoutPreset?: (slotIndex: TacticalLoadoutPresetSlot) => void;
  onPurchaseNeuralProtocol?: (protocolId: NeuralProtocolId) => void;
  onToggleOverdrive?: (enabled: boolean) => void;
  onSelectDifficultyTier?: (tier: DifficultyTierId) => void;
  onResolveStoryChoice?: (arcId: StoryArcId, optionId: string) => void;
  onSetTacticalWaypoint?: (waypoint: TacticalWaypointState | null) => void;
  cameraSettings: CameraSettings;
  onUpdateCameraSettings: (next: Partial<CameraSettings>) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onPlayCodexAudio?: (speaker?: string, classification?: string) => void;
  tutorialEnabled?: boolean;
  onToggleTutorial?: () => void;
  onResume: () => void;
  onRestart: () => void;
  onAdvanceNextChapter?: () => void;
  onRestoreSavedCampaign?: () => void;
  onRetryBossCheckpoint?: () => void;
  onRestartFullRun?: () => void;
  onStartBoss?: () => void;
  onReturnToTitle: () => void;
  unlockedChapters?: CampaignChapterId[];
  completedChapters?: CampaignChapterId[];
  onJumpToExpeditionSector?: (chapter: CampaignChapterId) => void;
  onStartNewGamePlus?: () => void;
  paradox?: ParadoxRuntimeState;
  onEquipSkin?: (skinId: SeraRigSkinId) => void;
  onPurchaseFabricator?: (itemId: FabricatorItemId) => void;
  onToggleMutator?: (key: keyof ChronoMutatorState) => void;
  onToggleSpeedrunHud?: () => void;
  onClaimMasteryBounty?: (targetId: MasteryTargetId, kind: MasteryBountyKind) => void;
  onClaimAllMasteryBounties?: () => void;
  locale?: AppLocale;
}

const NEXT_CHAPTER_LABELS: Record<CampaignChapterId, string> = {
  prologue: 'Prologue · Wake',
  chapter_1_helix: 'Chapter I · HELIX-04',
  chapter_2_choir: 'Chapter II · THE CHOIR',
  chapter_3_curator: 'Chapter III · THE CURATOR',
  chapter_4_matron: 'Chapter IV · MATRON-V',
  chapter_5_loom: 'Chapter V · Chronicle Loom',
};

const NEXT_CHAPTER_LABELS_VI: Record<CampaignChapterId, string> = {
  prologue: 'Mở Đầu · Thức Tỉnh',
  chapter_1_helix: 'Chương I · HELIX-04',
  chapter_2_choir: 'Chương II · DÀN ĐỒNG CA',
  chapter_3_curator: 'Chương III · KẺ GIÁM TUYỂN',
  chapter_4_matron: 'Chương IV · MATRON-V',
  chapter_5_loom: 'Chương V · Khung Cửi Biên Niên',
};

function getLocalizedChapterLabel(ch: CampaignChapterId, locale: AppLocale): string {
  return locale === 'vi' ? NEXT_CHAPTER_LABELS_VI[ch] ?? ch : NEXT_CHAPTER_LABELS[ch] ?? ch;
}

const ALL_UPGRADE_DEFINITIONS = getAllWeaponUpgradeDefinitions();
const ALL_NEURAL_PROTOCOLS = getAllNeuralProtocolDefinitions();

export const StatusModal: React.FC<StatusModalProps> = React.memo(({
  appState,
  encounterMode = 'standard',
  runMode = 'practice_standard',
  chapter = 'prologue',
  pendingNextChapter = null,
  hasSavedCampaignSnapshot = false,
  savedCampaignChapter = null,
  savedCampaignCheckpoint = null,
  bossCheckpoint = null,
  recoveredLogs = [],
  completedEndings = [],
  outcome,
  summary,
  elapsedTime,
  enemiesDefeated,
  totalEnemies,
  progression,
  exploration,
  radar,
  recursion,
  gauntlet = null,
  temporalRift = null,
  initialExplorationTab = 'missions',
  equippedWeaponId = 'chrono_edge',
  onSelectWeapon,
  onPurchaseUpgrade,
  onEquipUpgrade,
  onOverclockUpgrade,
  onAwakenUpgrade,
  onEquipModChip,
  onPurchaseRigModule,
  onEquipRigModule,
  onOverclockRigModule,
  onSetSentinelProtocol,
  onSetEchoDoctrine,
  onUnlockBossCore,
  onEquipBossCore,
  onTranscendBossCore,
  onSaveLoadoutPreset,
  onApplyLoadoutPreset,
  onPurchaseNeuralProtocol,
  onToggleOverdrive,
  onSelectDifficultyTier,
  onResolveStoryChoice,
  onSetTacticalWaypoint,
  cameraSettings,
  onUpdateCameraSettings,
  isMuted = false,
  onToggleMute,
  onPlayCodexAudio,
  tutorialEnabled = true,
  onToggleTutorial,
  onResume,
  onRestart,
  onAdvanceNextChapter,
  onRestoreSavedCampaign,
  onRetryBossCheckpoint,
  onRestartFullRun,
  onStartBoss,
  onReturnToTitle,
  unlockedChapters = ['prologue'] as CampaignChapterId[],
  completedChapters = [] as CampaignChapterId[],
  onJumpToExpeditionSector,
  onStartNewGamePlus,
  paradox,
  onEquipSkin,
  onPurchaseFabricator,
  onToggleMutator,
  onToggleSpeedrunHud,
  onClaimMasteryBounty,
  onClaimAllMasteryBounties,
  locale = 'en',
}) => {
  const [activeExplorationTab, setActiveExplorationTab] = React.useState<
    'missions' | 'map' | 'codex' | 'holo' | 'mastery'
  >(initialExplorationTab);
  const [selectedCodexId, setSelectedCodexId] = React.useState<CodexEntryId>('CODEX-01');
  const [selectedModalHoloId, setSelectedModalHoloId] = React.useState<string>('holo_prologue_lysa');
  const [selectedMapNode, setSelectedMapNode] = React.useState<{
    id: string;
    kind: TacticalWaypointState['kind'];
    label: string;
    x: number;
    z: number;
    statusLabel: string;
    details: string;
  } | null>(null);
  const [playingCodexAudioId, setPlayingCodexAudioId] = React.useState<CodexEntryId | null>(null);
  const [codexAudioPhase, setCodexAudioPhase] = React.useState<number>(1.8);
  const codexAudioTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (codexAudioTimerRef.current !== null) {
        window.clearTimeout(codexAudioTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!playingCodexAudioId || cameraSettings.reducedMotion) return;
    const interval = window.setInterval(() => {
      setCodexAudioPhase((prev) => Math.max(0.05, prev - 0.12));
    }, 120);
    return () => window.clearInterval(interval);
  }, [playingCodexAudioId, cameraSettings.reducedMotion]);

  const handleToggleCodexAudio = (
    entryId: CodexEntryId,
    author: string,
    categoryLabel: string
  ) => {
    if (codexAudioTimerRef.current !== null) {
      window.clearTimeout(codexAudioTimerRef.current);
      codexAudioTimerRef.current = null;
    }
    if (playingCodexAudioId === entryId) {
      setPlayingCodexAudioId(null);
      return;
    }
    setCodexAudioPhase(1.72);
    setPlayingCodexAudioId(entryId);
    onPlayCodexAudio?.(author, categoryLabel);
    codexAudioTimerRef.current = window.setTimeout(() => {
      setPlayingCodexAudioId(null);
      codexAudioTimerRef.current = null;
    }, 1800);
  };

  const isPaused = appState === 'paused';
  const isVictory =
    appState === 'gameover' && (summary?.outcome === 'victory' || outcome === 'victory');
  const isBossMode = encounterMode === 'boss';
  const isCampaign = runMode === 'campaign';
  const isRecursion = runMode === 'recursion';
  const isGauntlet = runMode === 'boss_gauntlet' || Boolean(gauntlet?.active);
  const hasBossCheckpoint = Boolean(isCampaign && bossCheckpoint);
  const canAdvanceChapter = Boolean(
    !isPaused && isVictory && isCampaign && pendingNextChapter && onAdvanceNextChapter
  );
  const selectedEnding = summary?.selectedEnding ?? null;
  const endingDetails = selectedEnding
    ? GAME_CONFIG.chronicleLoom.endings[selectedEnding]
    : null;
  const chapterConfig = GAME_CONFIG.campaignChapters[chapter];
  const showUpgradeBench = Boolean((isPaused || (isVictory && !endingDetails)) && progression);

  const [activeModalSection, setActiveModalSection] = React.useState<
    'arsenal' | 'exploration' | 'telemetry' | 'settings'
  >(() => {
    if (initialExplorationTab === 'map' || initialExplorationTab === 'holo') return 'exploration';
    if (showUpgradeBench) return 'arsenal';
    return 'telemetry';
  });

  React.useEffect(() => {
    if (appState === 'paused' || appState === 'gameover') {
      setActiveExplorationTab(initialExplorationTab);
      if (initialExplorationTab === 'map' || initialExplorationTab === 'holo') {
        setActiveModalSection('exploration');
      } else if (showUpgradeBench) {
        setActiveModalSection('arsenal');
      } else {
        setActiveModalSection('telemetry');
      }
    }
  }, [appState, initialExplorationTab, showUpgradeBench]);

  if (appState !== 'paused' && appState !== 'gameover') {
    return null;
  }

  const displayTime = summary ? summary.elapsedTime : elapsedTime;
  const displayDefeated = summary ? summary.enemiesDefeated : enemiesDefeated;
  const displayTotal = summary ? summary.totalEnemies : totalEnemies;
  const displayDamageDealt = summary ? summary.damageDealt : 0;
  const displayDamageTaken = summary ? summary.damageTaken : 0;
  const displayParries = summary ? summary.parriesLanded : 0;
  const displayPerfectDodges = summary ? (summary.perfectDodges ?? 0) : 0;
  const displayVulnerableHits = summary ? summary.vulnerableHits : 0;
  const displayConvergences = summary ? summary.convergencesTriggered : 0;
  const displayRelays = summary ? summary.relaysUsed : 0;
  const displayRemainingHp = summary ? summary.remainingTargetHp : 0;
  const rankEval = summary ? evaluateCombatRank(summary) : null;
  const masterySeal = computeMasterySealModifiers(progression?.combatMastery);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-status-heading"
      data-testid="status-modal"
      data-modal-state={appState}
      data-modal-outcome={outcome}
      data-run-mode={runMode}
      data-chapter={chapter}
      className="fixed inset-0 z-30 flex items-center justify-center p-2 sm:p-4 pointer-events-auto"
      style={{
        backgroundColor: 'rgba(7, 9, 13, 0.86)',
      }}
    >
      <div
        className={`w-full ${
          showUpgradeBench ? 'max-w-[960px]' : 'max-w-[760px]'
        } max-h-[94vh] flex flex-col bg-[#0b1018] border border-slate-700/90 shadow-[0_20px_60px_rgba(0,0,0,0.92)] overflow-hidden`}
      >
        {/* Pinned Top Header: Status Kicker, Title, Compact Telemetry Strip & Console Switcher */}
        <div className="shrink-0 px-4 sm:px-5 pt-3.5 pb-2.5 bg-[#080d15] border-b border-slate-800/90">
          {/* Status Kicker */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs font-mono-tabular uppercase tracking-widest mb-0.5">
            {isPaused ? (
              <span className="text-amber-400">
                {isGauntlet
                  ? `${t(locale, 'modalGauntletTrial')} ${(gauntlet?.stageIndex ?? 0) + 1}/${gauntlet?.totalStages ?? 5} · ${t(locale, 'modalPausedTag')}`
                  : isRecursion
                    ? locale === 'vi'
                      ? `GIAO THỨC ĐỆ QUY · VÒNG ${recursion?.loopIndex ?? 1} · ${getLocalizedChapterLabel(chapter, locale)}`
                      : `RECURSION PROTOCOL · LOOP ${recursion?.loopIndex ?? 1} · ${getLocalizedChapterLabel(chapter, locale)}`
                    : isCampaign
                      ? locale === 'vi'
                        ? `CHIẾN DỊCH NADIR-9 · ${getLocalizedChapterLabel(chapter, locale)}`
                        : `NADIR-9 CAMPAIGN · ${getLocalizedChapterLabel(chapter, locale)}`
                      : t(locale, 'modalPracticePaused')}
              </span>
            ) : isVictory ? (
              <span className="text-cyan-400">
                {endingDetails
                  ? `${locale === 'vi' ? 'KHUNG CỬI BIÊN NIÊN' : 'CHRONICLE LOOM'} · ${endingDetails.subtitle}`
                  : isGauntlet
                    ? locale === 'vi'
                      ? `LIÊN ĐẤU THỐNG LĨNH · ĐÃ CHINH PHỤC ${gauntlet?.totalStages ?? 5} THỐNG LĨNH`
                      : `SOVEREIGN GAUNTLET · ALL ${gauntlet?.totalStages ?? 5} SOVEREIGNS CONQUERED`
                    : isRecursion
                      ? locale === 'vi'
                        ? `GIAO THỨC ĐỆ QUY · ĐÃ ỔN ĐỊNH VÒNG ${recursion?.loopIndex ?? 1}`
                        : `RECURSION PROTOCOL · LOOP ${recursion?.loopIndex ?? 1} STABILIZED`
                      : isCampaign
                        ? `${getLocalizedChapterLabel(chapter, locale)} · ${locale === 'vi' ? 'HOÀN THÀNH' : 'CLEARED'}`
                        : isBossMode
                          ? locale === 'vi'
                            ? 'MÔ PHỎNG TẬP LUYỆN · ĐÃ HẠ THỐNG LĨNH'
                            : 'PRACTICE SIMULATION · WARDEN DEFEATED'
                          : locale === 'vi'
                            ? 'KHOANG THỬ 04 · ĐÃ KIỂM SOÁT'
                            : 'TEST BAY 04 · SECURED'}
              </span>
            ) : (
              <span className="text-red-400">
                {isGauntlet
                  ? locale === 'vi'
                    ? `LIÊN ĐẤU THỐNG LĨNH KẾT THÚC · ẢI ${(gauntlet?.stageIndex ?? 0) + 1}/${gauntlet?.totalStages ?? 5}`
                    : `SOVEREIGN GAUNTLET ENDED · TRIAL ${(gauntlet?.stageIndex ?? 0) + 1}/${gauntlet?.totalStages ?? 5}`
                  : isRecursion
                    ? locale === 'vi'
                      ? `ĐỆ QUY CHẤM DỨT · VÒNG ${recursion?.loopIndex ?? 1}`
                      : `RECURSION TERMINATED · LOOP ${recursion?.loopIndex ?? 1}`
                    : locale === 'vi'
                      ? 'GIÁP THỜI GIAN · CẠN KIỆT ĐỘ BỀN'
                      : 'CHRONO RIG · SUIT INTEGRITY DEPLETED'}
              </span>
            )}

            {canAdvanceChapter && pendingNextChapter && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 px-2 py-0.5">
                {locale === 'vi' ? 'ĐÃ MỞ KHÓA:' : 'UNLOCKED:'} {getLocalizedChapterLabel(pendingNextChapter, locale)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            {/* Modal Heading */}
            <h2
              id="modal-status-heading"
              className="text-xl sm:text-2xl font-display font-bold tracking-wide text-slate-100 uppercase leading-tight"
            >
              {isPaused
                ? t(locale, 'pausedTitle')
                : isVictory
                  ? endingDetails
                    ? endingDetails.epilogueTitle
                    : isGauntlet
                      ? t(locale, 'modalGauntletVictory')
                      : isBossMode
                        ? t(locale, 'modalWardenVictory')
                        : t(locale, 'modalVictoryHeading')
                  : isGauntlet
                    ? t(locale, 'modalGauntletDefeat')
                    : t(locale, 'modalDefeatHeading')}
            </h2>

            {/* Compact Inline Quick Telemetry Strip */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono-tabular">
              <span className="px-2 py-0.5 bg-[#0b121e] border border-slate-800 text-slate-300">
                {isVictory ? t(locale, 'modalStatClear') : t(locale, 'modalStatTime')}{' '}
                <strong className="text-slate-100">{displayTime.toFixed(1)}s</strong>
              </span>
              <span className="px-2 py-0.5 bg-[#0b121e] border border-slate-800 text-slate-300">
                {t(locale, 'modalStatHostiles')}{' '}
                <strong className="text-cyan-400">
                  {displayDefeated}/{displayTotal}
                </strong>
              </span>
              <span className="px-2 py-0.5 bg-[#0b121e] border border-slate-800 text-slate-300">
                {isPaused || isVictory
                  ? t(locale, 'modalStatDmg')
                  : t(locale, 'modalStatHostileHp')}{' '}
                <strong className="text-amber-400">
                  {isPaused || isVictory
                    ? `${displayDamageDealt} (${displayVulnerableHits}x)`
                    : displayRemainingHp}
                </strong>
              </span>
              <span className="px-2 py-0.5 bg-[#0b121e] border border-slate-800 text-slate-300">
                {t(locale, 'modalStatParry')}{' '}
                <strong className="text-amber-300">{displayParries}</strong> ·{' '}
                {locale === 'vi' ? 'LƯỚT' : 'SLIP'}{' '}
                <strong className="text-cyan-300">{displayPerfectDodges}</strong> ·{' '}
                {locale === 'vi' ? 'HỘI TỤ' : 'CONV'}{' '}
                <strong className="text-cyan-200">{displayConvergences}</strong>
              </span>
              {!isPaused && rankEval && (
                <span
                  data-testid="modal-combat-rank"
                  data-rank-grade={rankEval.grade}
                  className={`px-2 py-0.5 border font-bold ${
                    rankEval.grade === 'S+' || rankEval.grade === 'S'
                      ? 'bg-cyan-500/20 border-cyan-300 text-white'
                      : rankEval.grade === 'A'
                        ? 'bg-emerald-500/15 border-emerald-400 text-emerald-200'
                        : 'bg-[#0b121e] border-slate-700 text-slate-200'
                  }`}
                >
                  {t(locale, 'styleRank')} {rankEval.grade}
                </span>
              )}
              {progression && (
                <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-400/60 text-amber-300 font-bold">
                  {t(locale, 'modalStatFrags')}: {progression.memoryFragments}
                </span>
              )}
            </div>
          </div>

          {/* Unified Top-Level Console Switcher Tabs */}
          <div
            data-testid="modal-section-tabs"
            className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-slate-800/80"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              {showUpgradeBench && (
                <button
                  type="button"
                  data-testid="modal-section-arsenal"
                  aria-pressed={activeModalSection === 'arsenal'}
                  onClick={() => setActiveModalSection('arsenal')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors cursor-pointer whitespace-nowrap ${
                    activeModalSection === 'arsenal'
                      ? 'bg-cyan-400 text-slate-950 border-cyan-300'
                      : 'bg-[#0b1018] hover:bg-[#131f31] border-slate-700 text-cyan-200'
                  }`}
                >
                  <svg viewBox="0 0 16 16" className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <path d="M13 2L7.5 7.5M10.5 2H13v2.5M4.5 10.5L2 13m2.5-2.5l2 2M6 8l2 2" />
                  </svg>
                  <span>
                    {t(locale, 'modalTabArsenal')} (
                    {(progression?.unlockedWeaponIds ?? ['chrono_edge', 'pulsecaster']).length}/5)
                  </span>
                </button>
              )}

              {(isPaused || isVictory) && exploration && (
                <button
                  type="button"
                  data-testid="modal-section-exploration"
                  aria-pressed={activeModalSection === 'exploration'}
                  onClick={() => setActiveModalSection('exploration')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors cursor-pointer whitespace-nowrap ${
                    activeModalSection === 'exploration'
                      ? 'bg-emerald-400/20 border-emerald-400 text-emerald-200'
                      : 'bg-[#0b1018] hover:bg-[#131f31] border-slate-700 text-slate-300'
                  }`}
                >
                  <svg viewBox="0 0 16 16" className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <polygon points="2,3.5 6,2 10,3.5 14,2 14,12.5 10,14 6,12.5 2,14" />
                    <line x1="6" y1="2" x2="6" y2="12.5" />
                    <line x1="10" y1="3.5" x2="10" y2="14" />
                  </svg>
                  <span>
                    {t(locale, 'modalTabMap')} ({exploration.discoveredCodexIds.length}/
                    {exploration.codexEntries.length})
                  </span>
                </button>
              )}

              <button
                type="button"
                data-testid="modal-section-telemetry"
                aria-pressed={activeModalSection === 'telemetry'}
                onClick={() => setActiveModalSection('telemetry')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors cursor-pointer whitespace-nowrap ${
                  activeModalSection === 'telemetry'
                    ? 'bg-amber-400/20 border-amber-400 text-amber-200'
                    : 'bg-[#0b1018] hover:bg-[#131f31] border-slate-700 text-slate-300'
                }`}
              >
                <svg viewBox="0 0 16 16" className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="2" y="8" width="2.5" height="6" />
                  <rect x="6.75" y="5" width="2.5" height="9" />
                  <rect x="11.5" y="2" width="2.5" height="12" />
                </svg>
                <span>{t(locale, 'modalTabLogs')}</span>
              </button>

              {isPaused && (
                <button
                  type="button"
                  data-testid="modal-section-settings"
                  aria-pressed={activeModalSection === 'settings'}
                  onClick={() => setActiveModalSection('settings')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors cursor-pointer whitespace-nowrap ${
                    activeModalSection === 'settings'
                      ? 'bg-cyan-400/20 border-cyan-400 text-cyan-200'
                      : 'bg-[#0b1018] hover:bg-[#131f31] border-slate-700 text-slate-300'
                  }`}
                >
                  <svg viewBox="0 0 16 16" className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <circle cx="8" cy="8" r="2.2" />
                    <path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M12.6 3.4l-1.3 1.3M4.7 11.3l-1.3 1.3" />
                  </svg>
                  <span>{t(locale, 'modalTabSettings')}</span>
                </button>
              )}
            </div>

            {!isPaused && isVictory && isCampaign && !endingDetails && chapterConfig?.archiveLog && (
              <button
                type="button"
                onClick={() => setActiveModalSection('telemetry')}
                className="px-2 py-0.5 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-[9px] font-mono-tabular text-cyan-200 uppercase cursor-pointer"
              >
                RECOVERED: {chapterConfig.archiveLog.id} — {chapterConfig.archiveLog.title} →
              </button>
            )}
          </div>
        </div>

        {/* Bounded Scrollable Main Console Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3">
          {/* SECTION 1: TELEMETRY & RECOVERED ARCHIVE LOG */}
          <div className={activeModalSection === 'telemetry' ? 'space-y-3' : 'sr-only'}>
            {isVictory && masterySeal.pendingBountyCount > 0 && (
              <div
                data-testid="victory-mastery-bounty-notice"
                className="bg-[#071320] border border-cyan-400/60 px-3 py-2 flex flex-wrap items-center justify-between gap-2 font-mono-tabular text-xs"
              >
                <div className="text-slate-200">
                  <span className="text-cyan-300 font-bold">{t(locale, 'masteryPendingNotice')}</span>
                  <span aria-hidden="true"> · </span>
                  <span>
                    +{masterySeal.pendingBountyCount}◆ ({locale === 'vi' ? masterySeal.titleVi : masterySeal.titleEn})
                  </span>
                </div>
                {onClaimAllMasteryBounties && (
                  <button
                    type="button"
                    data-testid="victory-claim-mastery-all"
                    onClick={() => onClaimAllMasteryBounties()}
                    className="px-2.5 py-1 text-[10px] font-bold uppercase bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-200 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {t(locale, 'masteryClaimAll')} (+{masterySeal.pendingBountyCount}◆)
                  </button>
                )}
              </div>
            )}
            <p
              data-testid={selectedEnding ? 'modal-ending-summary' : undefined}
              className="text-xs sm:text-sm text-slate-300 leading-relaxed"
            >
              {isPaused
                ? t(locale, 'modalPausedTelemetryDesc')
                : isVictory
                  ? endingDetails
                    ? endingDetails.epilogueBody
                    : canAdvanceChapter && pendingNextChapter
                      ? chapterConfig.transitionBriefing
                      : isCampaign && hasSavedCampaignSnapshot
                        ? `${NEXT_CHAPTER_LABELS[chapter]} replay complete. Your primary campaign progress remains safely preserved in the archive.`
                        : isCampaign
                          ? chapterConfig.transitionBriefing
                          : isBossMode
                            ? 'Practice encounter complete. Campaign progression remains untouched.'
                            : 'All WARDEN security proxies in Test Bay 04 have been neutralized.'
                  : isBossMode && hasBossCheckpoint && bossCheckpoint
                    ? `Sera Venn’s suit integrity failed. Retry Boss Checkpoint [R] restores your saved arena-entry state (${bossCheckpoint.integrity} Integrity · ${bossCheckpoint.flux} Flux), while Restart Full Campaign resets to Prologue.`
                    : 'Sera Venn’s suit integrity failed before the sector could be cleared. Press [R] to restart this sector immediately.'}
            </p>

            {/* v2.7.0: Interconnected Chronicle Story Beat & Dr. Lysa Venn Clue */}
            {(() => {
              const storyBeat = getChapterStoryBeat(chapter);
              return (
                <div
                  data-testid="modal-chronicle-story-beat"
                  className="bg-[#070f1b] border border-cyan-500/40 p-2.5 space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-tabular uppercase tracking-wider">
                    <span className="text-cyan-300 font-bold">
                      {t(locale, 'storyBriefHeader')} · {storyBeat.actNumber}
                    </span>
                    <span className="text-slate-400 font-semibold">
                      {locale === 'vi' ? storyBeat.titleVi : storyBeat.titleEn}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    {locale === 'vi' ? storyBeat.synopsisVi : storyBeat.synopsisEn}
                  </p>
                  <div className="text-[10px] font-mono-tabular text-amber-300/95 bg-[#12100a]/80 border-l-2 border-amber-400 px-2 py-1">
                    <strong className="uppercase mr-1.5">{t(locale, 'lysaClueLabel')}:</strong>
                    {locale === 'vi' ? storyBeat.lysaClueVi : storyBeat.lysaClueEn}
                  </div>
                </div>
              );
            })()}

            {/* v3.0.0: 7-Node Interconnected Chronicle Link Chain & Unified Combat Synergy Loop */}
            {(() => {
              const chronPassive = computeChroniclePassiveBonus(
                recoveredLogs,
                completedChapters
              );
              return (
                <div
                  data-testid="modal-chronicle-link-chain"
                  className="bg-[#070b14] border border-indigo-400/35 p-2.5 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-tabular uppercase tracking-wider">
                    <span className="text-indigo-300 font-bold">
                      {t(locale, 'chronicleChainHeader')}
                    </span>
                    <span className="text-cyan-300 font-semibold">
                      {chronPassive.completedChapterCount}/6 {t(locale, 'progressSectors')} · {chronPassive.recoveredLogCount}/6 {t(locale, 'progressLogs')}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
                    {CHRONICLE_LINK_CHAIN.map((node) => {
                      const isCleared =
                        node.id === 'echo_zero'
                          ? completedEndings.length > 0
                          : completedChapters.includes(node.id);
                      const isActive = node.id !== 'echo_zero' && chapter === node.id;
                      const statusLabel = isCleared
                        ? t(locale, 'chronicleNodeCleared')
                        : isActive
                          ? t(locale, 'chronicleNodeActive')
                          : t(locale, 'chronicleNodeLocked');
                      return (
                        <div
                          key={node.id}
                          className={`p-1.5 border text-[9px] font-mono-tabular transition-colors ${
                            isCleared
                              ? 'bg-emerald-950/35 border-emerald-400/55 text-emerald-100'
                              : isActive
                                ? 'bg-cyan-950/45 border-cyan-400/75 text-cyan-100'
                                : 'bg-[#0a101b] border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 font-bold uppercase tracking-wider">
                            <span className="truncate">
                              {locale === 'vi' ? node.codeVi : node.codeEn}
                            </span>
                            <span
                              className={`text-[8px] shrink-0 ${
                                isCleared
                                  ? 'text-emerald-300'
                                  : isActive
                                    ? 'text-cyan-300'
                                    : 'text-slate-500'
                              }`}
                            >
                              {isCleared ? `✓ ${statusLabel}` : statusLabel}
                            </span>
                          </div>
                          <div className="text-[9px] font-sans text-slate-300 leading-tight mt-0.5">
                            {locale === 'vi' ? node.linkClueVi : node.linkClueEn}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-1.5 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-1.5 text-[9px] font-mono-tabular">
                    <span className="text-amber-300 font-bold uppercase tracking-wider">
                      {t(locale, 'chronicleCombatLoopLabel')}:
                    </span>
                    <span className="text-slate-200">
                      {t(locale, 'chronicleCombatLoopFlow')}
                    </span>
                  </div>
                </div>
              );
            })()}

            {isGauntlet && gauntlet && (
              <div
                data-testid="modal-gauntlet-summary"
                className="bg-[#120e09] border border-amber-400/70 p-3 flex flex-wrap items-center justify-between gap-2 font-mono-tabular text-[11px]"
              >
                <div>
                  <div className="text-amber-300 font-bold uppercase tracking-wider">
                    SOVEREIGN GAUNTLET · {gauntlet.defeatedBossIds.length}/{gauntlet.totalStages} TRIALS CLEARED
                  </div>
                  <div className="text-slate-300 text-[10px] mt-0.5">
                    {isVictory
                      ? 'All 5 Sovereign Bosses defeated in a single unbroken run with Chrono Stasis Overdrive.'
                      : `Active Trial: ${gauntlet.currentStageLabel}`}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-cyan-200">
                    CLOCK <strong className="text-white">{formatGauntletClock(gauntlet.totalElapsedTime)}</strong>
                  </span>
                  {(gauntlet.bestClearTimeSec ?? progression?.bestGauntletTimeSec ?? null) !== null && (
                    <span className="text-amber-300">
                      BEST{' '}
                      <strong>
                        {formatGauntletClock(
                          (gauntlet.bestClearTimeSec ?? progression?.bestGauntletTimeSec) as number
                        )}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Recovered Archive Log (Shown on Campaign Chapter Victory) */}
            {!isPaused && isVictory && isCampaign && !endingDetails && chapterConfig?.archiveLog && (
              <div
                data-testid="modal-recovered-archive-log"
                className="bg-[#08111d] border border-cyan-400/70 p-3"
              >
                <div className="flex items-center justify-between gap-2 text-[10px] font-mono-tabular uppercase tracking-wider text-cyan-300 mb-1">
                  <span className="font-bold">
                    RECOVERED ARCHIVE · {chapterConfig.archiveLog.id} — {chapterConfig.archiveLog.title}
                  </span>
                  <span className="text-slate-400 shrink-0">{chapterConfig.archiveLog.timestamp}</span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-200 italic leading-snug">
                  {chapterConfig.archiveLog.excerpt}
                </p>
              </div>
            )}

            {/* Chronicle Loom Final Exchange (Shown when a Final Ending is Selected) */}
            {!isPaused && isVictory && endingDetails && (
              <div
                data-testid="modal-ending-dialogue"
                className="bg-[#08111d] border border-amber-400/70 p-3 space-y-1 font-mono-tabular text-[11px]"
              >
                <div className="text-amber-300">{endingDetails.wardenQuote}</div>
                <div className="text-cyan-300 font-semibold">{endingDetails.seraQuote}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] pt-1.5 mt-1 border-t border-slate-800/80">
                  <div className="text-rose-300">
                    <span className="font-bold uppercase">SACRIFICE:</span> {endingDetails.sacrifice}
                  </div>
                  <div className="text-cyan-300">
                    <span className="font-bold uppercase">PRESERVED:</span> {endingDetails.preserved}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>WORLD STATE: {endingDetails.worldEffect}</span>
                  <span className="text-emerald-300 font-bold">
                    ENDINGS RECORDED: {completedEndings.length}/3 · LOGS: {recoveredLogs.length}/6
                  </span>
                </div>
                {(() => {
                  const epilogue = getEndingChronicleSummary(selectedEnding ?? 'witness');
                  const stanceCoda = getStanceLoomCoda(
                    exploration?.resolvedStoryChoices,
                    locale
                  );
                  return (
                    <div
                      data-testid="modal-ending-chronicle-epilogue"
                      className="mt-2 pt-2 border-t border-amber-400/35 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider">
                        <span className="text-amber-200 font-bold">
                          {t(locale, 'endingEpilogueHeader')} — {locale === 'vi' ? epilogue.titleVi : epilogue.titleEn}
                        </span>
                        <span className="text-cyan-300">
                          {locale === 'vi' ? epilogue.badgeVi : epilogue.badgeEn}
                        </span>
                      </div>
                      <p className="text-[11px] font-sans text-slate-200 leading-relaxed">
                        {locale === 'vi' ? epilogue.epilogueVi : epilogue.epilogueEn}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px]">
                        <div className="bg-[#0b1322] border border-cyan-500/35 px-2 py-1 text-cyan-200">
                          <strong className="uppercase mr-1">{t(locale, 'lysaFateLabel')}:</strong>
                          {locale === 'vi' ? epilogue.lysaFateVi : epilogue.lysaFateEn}
                        </div>
                        <div className="bg-[#0b1322] border border-amber-500/35 px-2 py-1 text-amber-200">
                          <strong className="uppercase mr-1">{t(locale, 'stationFateLabel')}:</strong>
                          {locale === 'vi' ? epilogue.stationFateVi : epilogue.stationFateEn}
                        </div>
                      </div>
                      {stanceCoda && (
                        <div
                          data-testid="modal-ending-stance-coda"
                          className="bg-[#08121d] border border-emerald-500/40 px-2.5 py-1.5 space-y-0.5"
                        >
                          <div className="text-[9px] font-mono-tabular font-bold uppercase tracking-wider text-emerald-300">
                            {stanceCoda.title}
                          </div>
                          <p className="text-[10px] font-sans text-slate-200 leading-snug">
                            {stanceCoda.body}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Phase 20: Campaign Finale Discovery & Synthesis Summary */}
            {!isPaused && isVictory && endingDetails && exploration?.convergenceSummary && (
              <div
                data-testid="modal-campaign-discovery-summary"
                data-synthesis-tier={exploration.convergenceSummary.synthesisTier}
                className="bg-[#07111c] border border-cyan-500/50 p-3 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] sm:text-[11px] font-mono-tabular font-bold uppercase tracking-wider text-cyan-300">
                    {exploration.convergenceSummary.synthesisHeadline}
                  </span>
                  <span
                    className={`text-[9px] font-mono-tabular font-bold uppercase px-1.5 py-0.5 border ${
                      exploration.convergenceSummary.synthesisTier === 'complete_chronicle'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : exploration.convergenceSummary.synthesisTier === 'reconstructed'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-amber-500/20 border-amber-400 text-amber-300'
                    }`}
                  >
                    {exploration.convergenceSummary.synthesisTier.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {exploration.convergenceSummary.synthesisSummary}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1 font-mono-tabular text-[9px] uppercase">
                  <div className="bg-[#050911] border border-slate-800 p-1.5 flex items-center justify-between">
                    <span className="text-slate-400">CHAPTERS</span>
                    <span className="text-cyan-300 font-bold">
                      {exploration.convergenceSummary.completedChaptersCount}/
                      {exploration.convergenceSummary.totalChaptersCount}
                    </span>
                  </div>
                  <div className="bg-[#050911] border border-slate-800 p-1.5 flex items-center justify-between">
                    <span className="text-slate-400">ARCHIVE LOGS</span>
                    <span className="text-cyan-300 font-bold">
                      {exploration.convergenceSummary.recoveredLogsCount}/
                      {exploration.convergenceSummary.totalLogsCount}
                    </span>
                  </div>
                  <div className="bg-[#050911] border border-slate-800 p-1.5 flex items-center justify-between">
                    <span className="text-slate-400">CODEX RECORDS</span>
                    <span className="text-amber-300 font-bold">
                      {exploration.convergenceSummary.discoveredCodexCount}/
                      {exploration.convergenceSummary.totalCodexCount}
                    </span>
                  </div>
                  <div className="bg-[#050911] border border-slate-800 p-1.5 flex items-center justify-between">
                    <span className="text-slate-400">SECRETS</span>
                    <span className="text-emerald-300 font-bold">
                      {exploration.convergenceSummary.discoveredSecretsCount}/
                      {exploration.convergenceSummary.totalSecretsCount}
                    </span>
                  </div>
                  <div className="bg-[#050911] border border-slate-800 p-1.5 flex items-center justify-between">
                    <span className="text-slate-400">ROUTES OPEN</span>
                    <span className="text-emerald-300 font-bold">
                      {exploration.convergenceSummary.unlockedRoutesCount}/
                      {exploration.convergenceSummary.totalRoutesCount}
                    </span>
                  </div>
                  <div className="bg-[#050911] border border-slate-800 p-1.5 flex items-center justify-between">
                    <span className="text-slate-400">EVENTS / ECHOES</span>
                    <span className="text-cyan-300 font-bold">
                      {exploration.convergenceSummary.completedNarrativeEventsCount}/
                      {exploration.convergenceSummary.totalNarrativeEventsCount} (
                      {exploration.convergenceSummary.discoveredEchoMemoriesCount}/
                      {exploration.convergenceSummary.totalEchoMemoriesCount})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Primary Telemetry Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#070a0f] border border-slate-800 p-2.5">
                <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-slate-400 mb-0.5">
                  {isVictory ? t(locale, 'modalStatClearTime') : t(locale, 'modalStatLoopTime')}
                </div>
                <div className="text-base sm:text-lg font-mono-tabular font-bold text-slate-100">
                  {displayTime.toFixed(1)}s
                </div>
              </div>

              <div className="bg-[#070a0f] border border-slate-800 p-2.5">
                <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-slate-400 mb-0.5">
                  {t(locale, 'modalStatHostiles')}
                </div>
                <div className="text-base sm:text-lg font-mono-tabular font-bold text-cyan-400">
                  {displayDefeated}/{displayTotal}
                </div>
              </div>

              <div className="bg-[#070a0f] border border-slate-800 p-2.5">
                <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-slate-400 mb-0.5">
                  {isPaused || isVictory ? t(locale, 'modalStatDamageDealt') : t(locale, 'modalStatHostileHp')}
                </div>
                <div className="text-base sm:text-lg font-mono-tabular font-bold text-amber-400">
                  {isPaused || isVictory
                    ? `${displayDamageDealt} (${displayVulnerableHits}x)`
                    : displayRemainingHp}
                </div>
              </div>
            </div>

            {/* Secondary Tactical Breakdown (Shown on Victory/Defeat Result Screen) */}
            {!isPaused && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-[#070a0f] border border-slate-800/80 p-2">
                  <div className="text-[9px] sm:text-[10px] font-mono-tabular uppercase tracking-wider text-slate-400">
                    PARRIES / SLIPS
                  </div>
                  <div className="text-sm sm:text-base font-mono-tabular font-bold text-amber-300">
                    {displayParries}{' '}
                    <span className="text-cyan-300">/ {displayPerfectDodges}</span>
                  </div>
                </div>
                <div className="bg-[#070a0f] border border-slate-800/80 p-2">
                  <div className="text-[9px] sm:text-[10px] font-mono-tabular uppercase tracking-wider text-slate-400">
                    CONVERGENCES
                  </div>
                  <div className="text-sm sm:text-base font-mono-tabular font-bold text-cyan-300">
                    {displayConvergences}
                  </div>
                </div>
                <div className="bg-[#070a0f] border border-slate-800/80 p-2">
                  <div className="text-[9px] sm:text-[10px] font-mono-tabular uppercase tracking-wider text-slate-400">
                    DMG TAKEN / RELAYS
                  </div>
                  <div className="text-sm sm:text-base font-mono-tabular font-bold text-slate-200">
                    {displayDamageTaken} / {displayRelays}
                  </div>
                </div>
                <div className="bg-[#070a0f] border border-slate-800/80 p-2">
                  <div className="flex items-center justify-between gap-1 text-[9px] sm:text-[10px] font-mono-tabular uppercase tracking-wider text-slate-400">
                    <span>COMBAT RANK</span>
                    {rankEval && (
                      <span className="text-[9px] text-slate-400 font-semibold">
                        {rankEval.hitless ? 'HITLESS · ' : ''}
                        {rankEval.score} PTS
                      </span>
                    )}
                  </div>
                  <div className="text-sm sm:text-base font-mono-tabular font-bold text-white flex items-baseline gap-1.5">
                    <span
                      className={
                        rankEval?.grade === 'S+' || rankEval?.grade === 'S'
                          ? 'text-cyan-300'
                          : rankEval?.grade === 'A'
                            ? 'text-emerald-300'
                            : 'text-amber-300'
                      }
                    >
                      {rankEval?.grade ?? '—'}
                    </span>
                    <span className="text-[9px] text-slate-400 font-normal truncate">
                      {rankEval?.summaryTag ?? ''}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: COMPACT 2x2 CHRONO RIG UPGRADE BENCH */}
          {showUpgradeBench && progression && (
            <div
              data-testid="upgrade-bench-panel"
              className={
                activeModalSection === 'arsenal'
                  ? 'bg-[#070a0f] border border-cyan-500/45 p-3 space-y-2'
                  : 'sr-only'
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-800/90">
                <div>
                  <div className="text-[11px] font-mono-tabular uppercase tracking-widest text-cyan-300 font-bold">
                    {t(locale, 'benchTitle')}
                  </div>
                  <div className="text-[10px] font-mono-tabular text-slate-400">
                    {t(locale, 'benchSubtitle')}
                  </div>
                  {(() => {
                    const cb = computeChroniclePassiveBonus(recoveredLogs, completedChapters);
                    const hasBonus =
                      cb.allWeaponDamageBonusPct > 0 || cb.maxIntegrityBonusPct > 0;
                    return (
                      <div
                        data-testid="bench-chronicle-resonance"
                        className="mt-1 inline-flex flex-wrap items-center gap-2 text-[9px] font-mono-tabular"
                      >
                        <span className="text-indigo-300 font-bold uppercase tracking-wider">
                          {t(locale, 'chronicleResonanceLabel')}:
                        </span>
                        {hasBonus ? (
                          <span className="text-emerald-300 font-semibold">
                            +{cb.allWeaponDamageBonusPct}% {t(locale, 'modalStatDmg')} · +{cb.overdriveChargeBonusPct}% {t(locale, 'overdriveLabel')} · +{cb.maxIntegrityBonusPct}% {t(locale, 'hudIntegrity')}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            {t(locale, 'chronicleResonanceInactive')}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                  {(() => {
                    const gm = computeGlobalArsenalMasteryBonus(progression.weaponMasteryXp);
                    return (
                      <div
                        data-testid="bench-mastery-sync"
                        className="mt-0.5 flex flex-wrap items-center gap-2 text-[9px] font-mono-tabular"
                      >
                        <span className="text-cyan-300 font-bold uppercase tracking-wider">
                          {t(locale, 'masterySyncLabel')} ({t(locale, 'benchRankLabel')} {gm.totalRanks}):
                        </span>
                        {gm.bonusRanks > 0 ? (
                          <span className="text-amber-300 font-semibold">
                            +{gm.damageBonusPct}% {t(locale, 'modalStatDmg')} · +{gm.staggerBonusPct}% STAGGER · +{gm.fluxGainBonusPct}% {t(locale, 'hudFlux')}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            {t(locale, 'masterySyncInactive')}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                  {(() => {
                    const docMods = computeStanceDoctrineModifiers(
                      exploration?.resolvedStoryChoices
                    );
                    const dmgBonusPct = Math.round((docMods.damageMult - 1) * 100);
                    const stagBonusPct = Math.round((docMods.staggerMult - 1) * 100);
                    const heatReliefPct = Math.round((1 - docMods.heatCostMult) * 100);
                    const fluxBonusPct = Math.round((docMods.fluxGainMult - 1) * 100);
                    const activeParts: string[] = [];
                    if (dmgBonusPct > 0) activeParts.push(`+${dmgBonusPct}% DMG`);
                    if (stagBonusPct > 0) activeParts.push(`+${stagBonusPct}% STAGGER`);
                    if (docMods.maxIntegrityBonus > 0)
                      activeParts.push(`+${docMods.maxIntegrityBonus} HP`);
                    if (docMods.parryHealBonus > 0)
                      activeParts.push(
                        `+${docMods.parryHealBonus} ${locale === 'vi' ? 'HP ĐỠ ĐÒN' : 'PARRY HP'}`
                      );
                    if (heatReliefPct > 0)
                      activeParts.push(
                        `-${heatReliefPct}% ${locale === 'vi' ? 'NHIỆT' : 'HEAT'}`
                      );
                    if (fluxBonusPct > 0) activeParts.push(`+${fluxBonusPct}% FLUX`);
                    return (
                      <div
                        data-testid="bench-stance-doctrine"
                        data-resolved-count={docMods.totalResolved}
                        className="mt-0.5 flex flex-wrap items-center gap-2 text-[9px] font-mono-tabular"
                      >
                        <span className="text-emerald-300 font-bold uppercase tracking-wider">
                          {t(locale, 'stanceDoctrineLabel')} ({docMods.totalResolved}/6):
                        </span>
                        {docMods.totalResolved > 0 ? (
                          <>
                            <span className="text-slate-200 font-semibold">
                              {activeParts.join(' · ')}
                            </span>
                            {docMods.sovereignPerkId && (
                              <span
                                data-testid="bench-stance-sovereign-perk"
                                className="text-amber-200 font-bold uppercase"
                                title={
                                  locale === 'vi'
                                    ? docMods.sovereignPerkDescVi
                                    : docMods.sovereignPerkDescEn
                                }
                              >
                                · ★{' '}
                                {locale === 'vi'
                                  ? docMods.sovereignPerkTitleVi
                                  : docMods.sovereignPerkTitleEn}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-slate-400">
                            {t(locale, 'stanceDoctrineInactive')}
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(onSelectDifficultyTier || onToggleOverdrive) && (() => {
                    const activeTier: DifficultyTierId =
                      progression.difficultyTier ??
                      (progression.overdriveDifficulty ? 'veteran' : 'standard');
                    return (
                      <div
                        data-testid="bench-difficulty-selector"
                        className="flex items-center gap-1"
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
                                  ? 'bench-btn-overdrive'
                                  : `bench-btn-difficulty-${spec.id}`
                              }
                              data-overdrive={activeTier !== 'standard' ? 'true' : 'false'}
                              aria-pressed={selected}
                              title={locale === 'vi' ? spec.subtitleVi : spec.subtitleEn}
                              onClick={() => {
                                if (onSelectDifficultyTier) {
                                  onSelectDifficultyTier(spec.id);
                                } else if (onToggleOverdrive) {
                                  onToggleOverdrive(spec.id !== 'standard');
                                }
                              }}
                              className={`px-2 py-0.5 border font-mono-tabular text-[9px] font-bold tracking-wider uppercase cursor-pointer transition-colors whitespace-nowrap ${
                                selected
                                  ? spec.id === 'singularity'
                                    ? 'bg-fuchsia-500/25 border-fuchsia-400 text-fuchsia-100'
                                    : spec.id === 'veteran'
                                      ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                                      : 'bg-cyan-500/20 border-cyan-400 text-cyan-100'
                                  : 'bg-[#0b121e] hover:bg-[#141f32] border-slate-700 text-slate-400'
                              }`}
                            >
                              {locale === 'vi' ? spec.labelVi : spec.labelEn}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                  <div
                    data-testid="upgrade-fragments-balance"
                    data-fragments={progression.memoryFragments}
                    className="px-2.5 py-0.5 bg-amber-500/15 border border-amber-400/60 text-amber-300 font-mono-tabular text-xs font-bold tracking-wider uppercase whitespace-nowrap"
                  >
                    {t(locale, 'benchFragmentsLabel')}: {progression.memoryFragments}
                  </div>
                </div>
              </div>

              {progression.lastActionMessage && (
                <div
                  data-testid="upgrade-status-message"
                  className="px-2.5 py-1 bg-[#0b1422] border border-cyan-400/70 text-[10px] font-mono-tabular text-cyan-200"
                >
                  {localizeBenchActionMessage(progression.lastActionMessage, locale)}
                </div>
              )}

              {/* v3.6.0: 3-Slot Tactical Loadout Presets (ALPHA · BETA · GAMMA) */}
              {(onSaveLoadoutPreset || onApplyLoadoutPreset) && (
                <div
                  data-testid="loadout-presets-bar"
                  className="bg-[#08111d] border border-slate-800/90 p-2 space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono-tabular uppercase tracking-wider">
                    <span className="text-amber-300 font-bold">{t(locale, 'presetBarTitle')}</span>
                    <span className="text-slate-400 text-[9px]">{t(locale, 'presetBarSub')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {([0, 1, 2] as const).map((slotIdx) => {
                      const preset = progression.loadoutPresets?.[slotIdx] ?? null;
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
                          data-testid={`loadout-preset-slot-${slotIdx}`}
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
                                data-testid={`preset-save-${slotIdx}`}
                                onClick={() => onSaveLoadoutPreset(slotIdx)}
                                className="px-1.5 py-0.5 text-[8px] font-mono-tabular font-bold uppercase bg-cyan-500/15 hover:bg-cyan-500/30 border border-cyan-400/60 text-cyan-200 cursor-pointer whitespace-nowrap"
                              >
                                {t(locale, 'presetSaveBtn')}
                              </button>
                            )}
                            {onApplyLoadoutPreset && (
                              <button
                                type="button"
                                data-testid={`preset-load-${slotIdx}`}
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

              {/* v3.2.0: In-Game Weapon Mod Socket Chips */}
              {onEquipModChip && (
                <div
                  data-testid="bench-mod-sockets"
                  className="bg-[#09111c] border border-slate-800/90 p-2 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono-tabular uppercase tracking-wider text-cyan-300 font-bold">
                    <span>{t(locale, 'modSockets')}</span>
                    <span className="text-slate-400">
                      {progression.equippedModChipId
                        ? WEAPON_MOD_CHIPS.find((c) => c.id === progression.equippedModChipId)?.shortLabel
                        : locale === 'vi'
                          ? 'CHƯA GẮN'
                          : 'NONE'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                    {WEAPON_MOD_CHIPS.map((chip) => {
                      const unlockedChips = progression.unlockedModChipIds ?? ['mod_volt_arc'];
                      const isUnlocked = unlockedChips.includes(chip.id) || chip.cost === 0;
                      const isEquipped = progression.equippedModChipId === chip.id;
                      const canAfford = progression.memoryFragments >= chip.cost;
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          data-testid={`bench-mod-chip-${chip.id}`}
                          onClick={() => onEquipModChip(isEquipped ? null : chip.id)}
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
                              className="text-[9px] font-mono-tabular font-bold uppercase truncate"
                              style={{ color: chip.accentCss }}
                            >
                              {locale === 'vi' ? chip.nameVi : chip.name}
                            </span>
                            <span className="text-[8px] font-mono-tabular text-amber-300 shrink-0">
                              {isEquipped
                                ? t(locale, 'modEquipped')
                                : isUnlocked
                                  ? t(locale, 'modEquip')
                                  : `${chip.cost} ${t(locale, 'benchFragShort')}`}
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
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(
                  [
                    'chrono_edge',
                    'pulsecaster',
                    'phase_rail',
                    'grav_breaker',
                    'chrono_scythe',
                  ] as const
                ).map((weaponId) => {
                  const weaponUpgrades = ALL_UPGRADE_DEFINITIONS.filter(
                    (u) => u.weaponId === weaponId
                  );
                  const activeUpgradeId = progression.equippedUpgrades[weaponId];
                  const activeUpgradeDef = weaponUpgrades.find((u) => u.id === activeUpgradeId);
                  const isCurrentWeapon = equippedWeaponId === weaponId;
                  const unlockedWeapons = progression.unlockedWeaponIds ?? [
                    'chrono_edge',
                    'pulsecaster',
                  ];
                  const isWeaponUnlocked = unlockedWeapons.includes(weaponId);
                  const weaponTitle =
                    weaponId === 'chrono_edge'
                      ? locale === 'vi'
                        ? `[1] KIẾM THỜI KHÔNG (${t(locale, 'weaponRoleMelee')})`
                        : `[1] CHRONO EDGE (${t(locale, 'weaponRoleMelee')})`
                      : weaponId === 'pulsecaster'
                        ? locale === 'vi'
                          ? `[2] SÚNG XUNG PULSECASTER (${t(locale, 'weaponRoleRanged')})`
                          : `[2] PULSECASTER (${t(locale, 'weaponRoleRanged')})`
                        : weaponId === 'phase_rail'
                          ? locale === 'vi'
                            ? '[3] THƯƠNG RAIL ĐIỂM KHÔNG'
                            : '[3] NULL-POINT RAIL LANCE'
                          : weaponId === 'grav_breaker'
                            ? locale === 'vi'
                              ? '[4] BÚA TRỌNG LỰC GRAV-BREAKER'
                              : '[4] GRAV-BREAKER MAUL'
                            : locale === 'vi'
                              ? `[5] ${t(locale, 'weaponScythe')} (${t(locale, 'weaponRolePolearm')})`
                              : `[5] CHRONO SCYTHE (${t(locale, 'weaponRolePolearm')})`;
                  const mastery = computeWeaponMasteryRankInfo(
                    progression.weaponMasteryXp?.[weaponId] ?? 0
                  );
                  return (
                    <div
                      key={weaponId}
                      data-testid={`upgrade-column-${weaponId}`}
                      data-weapon-unlocked={isWeaponUnlocked ? 'true' : 'false'}
                      data-weapon-equipped={isCurrentWeapon ? 'true' : 'false'}
                      className={`bg-[#0a1019] border p-2 space-y-1.5 transition-colors ${
                        weaponId === 'chrono_scythe' ? 'md:col-span-2 ' : ''
                      }${
                        isCurrentWeapon
                          ? 'border-cyan-400/80 shadow-[0_0_16px_rgba(34,211,238,0.12)]'
                          : 'border-slate-800/90'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1 border-b border-slate-800/80">
                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                          <span
                            className={`text-[10px] font-mono-tabular font-bold uppercase tracking-wider truncate ${
                              weaponId === 'pulsecaster' || weaponId === 'phase_rail'
                                ? 'text-sky-300'
                                : weaponId === 'grav_breaker'
                                  ? 'text-amber-300'
                                  : weaponId === 'chrono_scythe'
                                    ? 'text-cyan-200'
                                    : 'text-cyan-300'
                            }`}
                          >
                            {weaponTitle}
                          </span>
                          <span
                            data-testid={`bench-weapon-mastery-${weaponId}`}
                            data-rank={mastery.rank}
                            className="text-[8px] font-mono-tabular font-bold uppercase px-1.5 py-0.5 bg-[#091524] border border-cyan-500/45 text-cyan-200 whitespace-nowrap"
                          >
                            {t(locale, 'benchRankLabel')}{' '}
                            {localizeMasteryRankLabel(mastery.rankLabel, locale)} ({mastery.xp} XP)
                          </span>
                          {activeUpgradeDef && (
                            <span className="text-[9px] font-mono-tabular uppercase px-1.5 py-0.5 bg-cyan-500/15 border border-cyan-500/40 text-cyan-200 whitespace-nowrap">
                              {localizeWeaponUpgrade(activeUpgradeDef, locale).shortLabel}
                            </span>
                          )}
                        </div>

                        {isWeaponUnlocked ? (
                          <button
                            type="button"
                            data-testid={`bench-select-weapon-${weaponId}`}
                            aria-pressed={isCurrentWeapon}
                            onClick={() => onSelectWeapon?.(weaponId)}
                            className={`px-2 py-0.5 text-[9px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors cursor-pointer whitespace-nowrap ${
                              isCurrentWeapon
                                ? 'bg-cyan-400 text-slate-950 border-cyan-300'
                                : 'bg-[#101c2e] hover:bg-[#182a44] text-cyan-200 border-cyan-500/50'
                            }`}
                          >
                            {isCurrentWeapon ? t(locale, 'benchActiveWeapon') : t(locale, 'benchEquipWeapon')}
                          </button>
                        ) : (
                          <span className="text-[9px] font-mono-tabular uppercase px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-500 whitespace-nowrap">
                            {t(locale, 'benchWeaponLocked')}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {weaponUpgrades.map((upg) => {
                          const localUpg = localizeWeaponUpgrade(upg, locale);
                          const isOwned = progression.purchasedUpgrades.includes(upg.id);
                          const isEquipped = activeUpgradeId === upg.id;
                          const isOverclocked = (progression.overclockedUpgrades ?? []).includes(upg.id);
                          const isAwakened = (progression.awakenedUpgrades ?? []).includes(upg.id);
                          const canAfford = progression.memoryFragments >= upg.cost;
                          const canAffordOverclock = progression.memoryFragments >= 1;
                          const canAffordAwaken =
                            progression.memoryFragments >= WEAPON_AWAKENING_COST;

                          return (
                            <div
                              key={upg.id}
                              data-testid={`upgrade-card-${upg.id}`}
                              data-owned={isOwned ? 'true' : 'false'}
                              data-equipped={isEquipped ? 'true' : 'false'}
                              data-overclocked={isOverclocked ? 'true' : 'false'}
                              data-awakened={isAwakened ? 'true' : 'false'}
                              className={`p-2 border flex flex-col justify-between transition-colors ${
                                isAwakened
                                  ? 'bg-[#0a1b1b] border-emerald-400/90'
                                  : isEquipped
                                    ? 'bg-[#0e1b2c] border-cyan-400/90'
                                    : isOwned
                                      ? 'bg-[#0b131e] border-slate-700'
                                      : 'bg-[#080d14] border-slate-800/90'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className="text-[10px] font-display font-bold uppercase tracking-wide text-slate-100 truncate">
                                    {localUpg.name}
                                    {isAwakened ? ' MK.III' : isOverclocked ? ' MK.II' : ''}
                                  </span>
                                  <span
                                    className={`text-[8px] font-mono-tabular font-bold uppercase px-1 py-0.5 border whitespace-nowrap shrink-0 ${
                                      isAwakened
                                        ? 'bg-emerald-500/20 border-emerald-300 text-emerald-200'
                                        : isOverclocked
                                          ? 'bg-amber-400/25 border-amber-300 text-amber-200'
                                          : isEquipped
                                            ? 'bg-cyan-400/20 border-cyan-400 text-cyan-200'
                                            : isOwned
                                              ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                                              : canAfford
                                                ? 'bg-amber-500/15 border-amber-400/60 text-amber-300'
                                                : 'bg-slate-900 border-slate-700 text-slate-400'
                                    }`}
                                  >
                                    {isAwakened
                                      ? t(locale, 'benchMythicTag')
                                      : isOverclocked
                                        ? 'MK.II'
                                        : isEquipped
                                          ? t(locale, 'benchEquippedTag')
                                          : isOwned
                                            ? t(locale, 'benchOwnedTag')
                                            : `${upg.cost} ${t(locale, 'benchFragShort')}`}
                                  </span>
                                </div>

                                <div
                                  className="text-[9px] text-emerald-300 leading-tight mb-0.5 line-clamp-2"
                                  title={localUpg.benefitText}
                                >
                                  <span className="font-mono-tabular font-bold">+ </span>
                                  {localUpg.benefitText}
                                </div>
                                <div
                                  className="text-[9px] text-amber-300/90 leading-tight mb-1 line-clamp-1"
                                  title={localUpg.tradeoffText}
                                >
                                  <span className="font-mono-tabular font-bold">- </span>
                                  {localUpg.tradeoffText}
                                </div>
                                {isAwakened && (
                                  <div className="text-[8px] font-mono-tabular text-cyan-200 leading-tight mb-1">
                                    ★ MK.III: +8% DMG · +10% STAGGER · -2 HEAT · +2 FLUX
                                  </div>
                                )}
                              </div>

                              <div className="space-y-1">
                                <button
                                  type="button"
                                  data-testid={`upgrade-action-${upg.id}`}
                                  disabled={!isWeaponUnlocked && !isOwned}
                                  onClick={() => {
                                    if (!isWeaponUnlocked && !isOwned) return;
                                    if (isEquipped) {
                                      onEquipUpgrade?.(upg.weaponId, null);
                                    } else if (isOwned) {
                                      onEquipUpgrade?.(upg.weaponId, upg.id);
                                    } else {
                                      onPurchaseUpgrade?.(upg.id);
                                    }
                                  }}
                                  className={`w-full px-2 py-1 text-[9px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors whitespace-nowrap text-center ${
                                    !isWeaponUnlocked && !isOwned
                                      ? 'bg-[#090d14] border-slate-800 text-slate-500 cursor-not-allowed'
                                      : isEquipped
                                        ? 'bg-cyan-400/20 hover:bg-cyan-400/30 border-cyan-300 text-white cursor-pointer'
                                        : isOwned
                                          ? 'bg-[#122236] hover:bg-[#19304b] border-cyan-500/60 text-cyan-200 cursor-pointer'
                                          : canAfford
                                            ? 'bg-amber-400 hover:bg-amber-300 border-amber-300 text-slate-950 cursor-pointer'
                                            : 'bg-[#0d121a] hover:bg-[#141c28] border-slate-700 text-slate-400 cursor-pointer'
                                  }`}
                                >
                                  {!isWeaponUnlocked && !isOwned
                                    ? t(locale, 'benchWeaponLocked')
                                    : isEquipped
                                      ? t(locale, 'benchUnequip')
                                      : isOwned
                                        ? t(locale, 'benchEquipMod')
                                        : `${t(locale, 'benchUnlock')} (${upg.cost} ${t(locale, 'benchFragShort')})`}
                                </button>

                                {isOwned && !isOverclocked && onOverclockUpgrade && (
                                  <button
                                    type="button"
                                    data-testid={`upgrade-overclock-${upg.id}`}
                                    onClick={() => onOverclockUpgrade(upg.id)}
                                    className={`w-full px-2 py-0.5 text-[8px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors whitespace-nowrap text-center cursor-pointer ${
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
                                    data-testid={`upgrade-awaken-${upg.id}`}
                                    onClick={() => onAwakenUpgrade(upg.id)}
                                    className={`w-full px-2 py-0.5 text-[8px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors whitespace-nowrap text-center cursor-pointer ${
                                      canAffordAwaken
                                        ? 'bg-emerald-500/20 hover:bg-emerald-500/35 border-emerald-400 text-emerald-200'
                                        : 'bg-[#090d14] border-slate-800 text-slate-500'
                                    }`}
                                  >
                                    {t(locale, 'benchAwaken')}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* v3.1.0: Dual-Weapon Flash Swap Resonance Pairing Guide */}
              <div
                data-testid="bench-weapon-pairings"
                className="pt-2 mt-2 border-t border-slate-800/90 space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[10px] font-mono-tabular uppercase tracking-widest text-cyan-300 font-bold">
                    {t(locale, 'weaponPairingsTitle')}
                  </div>
                  <div className="text-[9px] font-mono-tabular text-slate-400">
                    {t(locale, 'weaponPairingsSub')}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5">
                  {ORDERED_WEAPON_RESONANCE_IDS.map((resId) => {
                    const spec = WEAPON_RESONANCE_SPECS[resId];
                    return (
                      <div
                        key={resId}
                        className="bg-[#09101c] border border-slate-800/90 p-2 space-y-0.5"
                      >
                        <div
                          className="text-[9px] font-mono-tabular font-bold uppercase tracking-wider truncate"
                          style={{ color: spec.accentCss }}
                        >
                          {locale === 'vi' ? spec.labelVi : spec.labelEn}
                        </div>
                        <div className="text-[9px] font-mono-tabular text-slate-200 font-semibold">
                          {locale === 'vi' ? spec.pairRuleVi : spec.pairRuleEn}
                        </div>
                        <div className="text-[9px] text-slate-400 leading-tight">
                          {locale === 'vi' ? spec.effectVi : spec.effectEn}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* v3.5.0: Live Effective Build Telemetry, Confluence Doctrine & Sovereign Boss Echo Cores (OMEGA Ω) */}
              {(() => {
                const buildRigSyn = computeRigSetSynergy(
                  progression.equippedRigModules,
                  progression.overclockedRigModules
                );
                const transcendedCores = progression.transcendedBossCores ?? [];
                const bossCoreMods = computeBossCoreModifiers(
                  progression.equippedBossCore ?? null,
                  transcendedCores
                );
                const confluence = computeSentinelCoreConfluence(
                  progression.sentinelMode ?? 'off',
                  progression.equippedBossCore ?? null,
                  transcendedCores
                );
                const attunement = computeWeaponCoreAttunement(
                  equippedWeaponId,
                  progression.equippedBossCore ?? null,
                  transcendedCores
                );
                const effectiveDmgMult =
                  buildRigSyn.damageMultiplier *
                  bossCoreMods.allDamageMultiplier *
                  confluence.allDamageMultiplier *
                  attunement.damageMultiplier *
                  (paradox?.loadout?.overclockCoreActive ? 1.25 : 1);
                const effectiveMaxWard = computeMaxChronoWard(
                  progression.sentinelMode ?? 'off',
                  buildRigSyn,
                  bossCoreMods.bonusWard + confluence.bonusWard
                );
                const effectiveSkillCostPct = Math.round(
                  buildRigSyn.skillFluxCostMultiplier * confluence.skillFluxCostMultiplier * 100
                );
                const effectiveOverdrivePct = Math.round(
                  bossCoreMods.overdriveChargeMultiplier * 100
                );
                const unlockedCores = progression.unlockedBossCores ?? [];
                const equippedCore = progression.equippedBossCore ?? null;

                return (
                  <div className="pt-2 mt-2 border-t border-slate-800/90 space-y-2">
                    <div
                      data-testid="effective-build-telemetry"
                      className="bg-[#08121f] border border-cyan-500/35 px-2.5 py-1.5 flex flex-wrap items-center justify-between gap-2 font-mono-tabular text-[10px]"
                    >
                      <span className="uppercase tracking-wider text-cyan-300 font-bold">
                        {t(locale, 'buildSynergyTitle')}
                      </span>
                      <div className="flex flex-wrap items-center gap-3 tabular-nums">
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
                      data-testid="confluence-doctrine-banner"
                      data-doctrine={confluence.doctrineId}
                      className={`px-2.5 py-1.5 border font-mono-tabular text-[10px] space-y-0.5 ${
                        confluence.active
                          ? 'bg-[#0c1828] border-amber-400/55 text-slate-200'
                          : 'bg-[#070e18] border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="uppercase tracking-wider font-bold text-amber-300">
                          {t(locale, 'confluenceDoctrineLabel')} ·{' '}
                          {locale === 'vi' ? confluence.titleVi : confluence.titleEn}
                        </span>
                        <span className="text-[9px] uppercase text-cyan-300 font-bold">
                          {locale === 'vi' ? confluence.burstTitleVi : confluence.burstTitleEn}
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-300 leading-snug">
                        {locale === 'vi' ? confluence.passiveVi : confluence.passiveEn}
                      </div>
                      {equippedCore && (
                        <div className="text-[9px] text-amber-200/90 leading-snug">
                          {locale === 'vi' ? confluence.burstDescVi : confluence.burstDescEn}
                        </div>
                      )}
                    </div>

                    <div
                      data-testid="armament-attunement-banner"
                      data-attuned={attunement.attuned ? 'true' : 'false'}
                      data-cognate-core={attunement.cognateCoreId}
                      className={`px-2.5 py-1.5 border font-mono-tabular text-[10px] space-y-0.5 ${
                        attunement.attuned
                          ? 'bg-[#101827] border-cyan-400/65 text-slate-100'
                          : 'bg-[#070e18] border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="uppercase tracking-wider font-bold text-cyan-300">
                          {t(locale, 'attunementDoctrineLabel')} ·{' '}
                          {locale === 'vi' ? attunement.titleVi : attunement.titleEn}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-bold ${
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
                      <div className="text-[9px] text-slate-300 leading-snug">
                        {locale === 'vi' ? attunement.perkVi : attunement.perkEn}
                      </div>
                    </div>

                    <div
                      data-testid="boss-echo-cores-section"
                      className="space-y-1.5"
                    >
                      <div>
                        <div className="text-[11px] font-mono-tabular uppercase tracking-widest text-amber-300 font-bold">
                          {t(locale, 'bossCoreSectionTitle')}
                        </div>
                        <div className="text-[10px] font-mono-tabular text-slate-400">
                          {t(locale, 'bossCoreSectionSub')}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                        {VALID_BOSS_ECHO_CORE_IDS.map((coreId) => {
                          const spec = BOSS_ECHO_CORES[coreId];
                          const isUnlocked = unlockedCores.includes(coreId);
                          const isEquipped = equippedCore === coreId;
                          const isOmega = isBossCoreTranscended(coreId, transcendedCores);
                          const canAfford =
                            (progression.memoryFragments ?? 0) >= spec.synthesisCost;
                          const canAffordOmega =
                            (progression.memoryFragments ?? 0) >= BOSS_CORE_OMEGA_COST;
                          return (
                            <div
                              key={coreId}
                              data-testid={`boss-core-card-${coreId}`}
                              data-unlocked={isUnlocked ? 'true' : 'false'}
                              data-equipped={isEquipped ? 'true' : 'false'}
                              data-omega={isOmega ? 'true' : 'false'}
                              style={{
                                borderColor: isEquipped
                                  ? isOmega
                                    ? '#fbbf24'
                                    : spec.accentCss
                                  : undefined,
                              }}
                              className={`p-2 border flex flex-col justify-between gap-1.5 transition-colors ${
                                isEquipped
                                  ? 'bg-[#0d1929] text-white'
                                  : isUnlocked
                                    ? 'bg-[#09121e] border-slate-700 text-slate-200'
                                    : 'bg-[#080d16] border-slate-800/90 text-slate-400'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center justify-between gap-1">
                                  <span
                                    className="text-[10px] font-display font-bold uppercase tracking-wide truncate"
                                    style={{ color: isOmega ? '#fbbf24' : spec.accentCss }}
                                  >
                                    {locale === 'vi' ? spec.titleVi : spec.titleEn}
                                  </span>
                                  <span
                                    className={`text-[8px] font-mono-tabular uppercase shrink-0 ${
                                      isOmega ? 'text-amber-300 font-bold' : 'text-slate-400'
                                    }`}
                                  >
                                    {isOmega
                                      ? t(locale, 'bossCoreOmegaTag')
                                      : isUnlocked
                                        ? t(locale, 'bossCoreHarvestedTag')
                                        : `${spec.synthesisCost}◆`}
                                  </span>
                                </div>
                                <div className="text-[8px] font-mono-tabular uppercase text-slate-400 truncate">
                                  {spec.bossName}
                                </div>
                                <div className="text-[9px] text-slate-200 leading-tight font-medium">
                                  {locale === 'vi'
                                    ? isOmega
                                      ? spec.omegaRoleVi
                                      : spec.roleVi
                                    : isOmega
                                      ? spec.omegaRoleEn
                                      : spec.roleEn}
                                </div>
                                <div className="text-[9px] text-slate-400 leading-tight">
                                  {locale === 'vi'
                                    ? isOmega
                                      ? spec.omegaSummaryVi
                                      : spec.summaryVi
                                    : isOmega
                                      ? spec.omegaSummaryEn
                                      : spec.summaryEn}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <button
                                  type="button"
                                  data-testid={`boss-core-btn-${coreId}`}
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
                                  className={`w-full px-2 py-1 text-[9px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors whitespace-nowrap text-center ${
                                    isEquipped
                                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400 text-emerald-200 cursor-pointer'
                                      : isUnlocked
                                        ? 'bg-cyan-500/15 hover:bg-cyan-500/30 border-cyan-400/70 text-cyan-200 cursor-pointer'
                                        : canAfford
                                          ? 'bg-amber-500/15 hover:bg-amber-500/30 border-amber-400/80 text-amber-200 cursor-pointer'
                                          : 'bg-[#060a10] border-slate-800 text-slate-500 cursor-not-allowed'
                                  }`}
                                >
                                  {isEquipped
                                    ? t(locale, 'bossCoreUnequip')
                                    : isUnlocked
                                      ? t(locale, 'bossCoreEquip')
                                      : `${t(locale, 'bossCoreSynthesize')} (${spec.synthesisCost}◆)`}
                                </button>
                                {isUnlocked && !isOmega && (
                                  <button
                                    type="button"
                                    data-testid={`boss-core-awaken-${coreId}`}
                                    disabled={!canAffordOmega}
                                    onClick={() => onTranscendBossCore?.(coreId)}
                                    className={`w-full px-2 py-0.5 text-[8px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors whitespace-nowrap text-center ${
                                      canAffordOmega
                                        ? 'bg-amber-500/20 hover:bg-amber-500/35 border-amber-400/80 text-amber-200 cursor-pointer'
                                        : 'bg-[#060a10] border-slate-800 text-slate-500 cursor-not-allowed'
                                    }`}
                                  >
                                    {t(locale, 'bossCoreAwakenOmega')} ({BOSS_CORE_OMEGA_COST}◆)
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* v3.3.0: LYS-04 Chrono Sentinel Protocol [8] */}
              <div
                data-testid="sentinel-protocol-section"
                className="pt-2 mt-2 border-t border-slate-800/90 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-mono-tabular uppercase tracking-widest text-emerald-300 font-bold">
                      {t(locale, 'sentinelSectionTitle')}
                    </div>
                    <div className="text-[10px] font-mono-tabular text-slate-400">
                      {t(locale, 'sentinelSectionSub')}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {VALID_SENTINEL_MODES.map((mode) => {
                    const spec = SENTINEL_PROTOCOL_SPECS[mode];
                    const active = (progression.sentinelMode ?? 'off') === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        data-testid={`sentinel-mode-btn-${mode}`}
                        data-active={active ? 'true' : 'false'}
                        onClick={() => onSetSentinelProtocol?.(mode)}
                        className={`p-2 border text-left transition-colors cursor-pointer flex flex-col justify-between gap-1 ${
                          active
                            ? mode === 'aegis'
                              ? 'bg-[#0b1f1c] border-emerald-400 text-emerald-100'
                              : mode === 'interceptor'
                                ? 'bg-[#0b1d28] border-cyan-400 text-cyan-100'
                                : mode === 'harmonic'
                                  ? 'bg-[#17122a] border-violet-400 text-violet-100'
                                  : 'bg-[#111824] border-slate-400 text-slate-100'
                            : 'bg-[#090f18] hover:bg-[#0f1928] border-slate-800 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-[10px] font-display font-bold uppercase tracking-wide text-white truncate">
                              {locale === 'vi' ? spec.titleVi : spec.titleEn}
                            </span>
                            <span
                              className={`text-[8px] font-mono-tabular font-bold uppercase px-1 py-0.5 border whitespace-nowrap shrink-0 ${
                                active
                                  ? 'bg-emerald-400/20 border-emerald-400 text-emerald-200'
                                  : 'bg-slate-900 border-slate-700 text-slate-400'
                              }`}
                            >
                              {active
                                ? t(locale, 'benchActiveWeapon')
                                : locale === 'vi'
                                  ? spec.shortBadgeVi
                                  : spec.shortBadgeEn}
                            </span>
                          </div>
                          <div className="text-[8px] font-mono-tabular uppercase tracking-wider text-cyan-300/90 mb-0.5">
                            {locale === 'vi' ? spec.roleVi : spec.roleEn}
                          </div>
                          <div className="text-[9px] text-slate-300 leading-tight">
                            {locale === 'vi' ? spec.summaryVi : spec.summaryEn}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* v3.7.0: Echo Behavioral Doctrine [0] Selector */}
              <div
                data-testid="echo-doctrine-section"
                className="pt-2 mt-2 border-t border-slate-800/90 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-mono-tabular uppercase tracking-widest text-sky-300 font-bold">
                      {t(locale, 'echoDoctrineSectionTitle')}
                    </div>
                    <div className="text-[10px] font-mono-tabular text-slate-400">
                      {t(locale, 'echoDoctrineSectionSub')}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {VALID_ECHO_DOCTRINE_IDS.map((docId) => {
                    const spec = ECHO_DOCTRINE_SPECS[docId];
                    const active = normalizeEchoDoctrineId(progression.echoDoctrine) === docId;
                    return (
                      <button
                        key={docId}
                        type="button"
                        data-testid={`echo-doctrine-btn-${docId}`}
                        data-active={active ? 'true' : 'false'}
                        onClick={() => onSetEchoDoctrine?.(docId)}
                        className={`p-2 border text-left transition-colors cursor-pointer flex flex-col justify-between gap-1 ${
                          active
                            ? docId === 'vanguard'
                              ? 'bg-[#23140b] border-orange-400 text-orange-100'
                              : docId === 'bastion'
                                ? 'bg-[#0b1f1c] border-emerald-400 text-emerald-100'
                                : docId === 'nova'
                                  ? 'bg-[#211028] border-fuchsia-400 text-fuchsia-100'
                                  : 'bg-[#0b1928] border-sky-400 text-sky-100'
                            : 'bg-[#090f18] hover:bg-[#0f1928] border-slate-800 text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-[10px] font-display font-bold uppercase tracking-wide text-white truncate">
                              {locale === 'vi' ? spec.titleVi : spec.titleEn}
                            </span>
                            <span
                              className={`text-[8px] font-mono-tabular font-bold uppercase px-1 py-0.5 border whitespace-nowrap shrink-0 ${
                                active
                                  ? 'bg-sky-400/20 border-sky-400 text-sky-200'
                                  : 'bg-slate-900 border-slate-700 text-slate-400'
                              }`}
                            >
                              {active
                                ? t(locale, 'benchActiveWeapon')
                                : locale === 'vi'
                                  ? spec.shortBadgeVi
                                  : spec.shortBadgeEn}
                            </span>
                          </div>
                          <div className="text-[8px] font-mono-tabular uppercase tracking-wider text-cyan-300/90 mb-0.5">
                            {locale === 'vi' ? spec.roleVi : spec.roleEn}
                          </div>
                          <div className="text-[9px] text-slate-300 leading-tight">
                            {locale === 'vi' ? spec.summaryVi : spec.summaryEn}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chrono Rig Chassis Modules (3-Slot Rig Customization + MK.II Overclock + Set Synergy) */}
              <div
                data-testid="rig-modules-section"
                className="pt-2 mt-2 border-t border-slate-800/90 space-y-2"
              >
                {(() => {
                  const rigSyn = computeRigSetSynergy(
                    progression.equippedRigModules,
                    progression.overclockedRigModules
                  );
                  return (
                    <div
                      data-testid="rig-set-synergy-banner"
                      data-synergy-tier={rigSyn.tier}
                      className={`px-2.5 py-1.5 border flex flex-wrap items-center justify-between gap-2 ${
                        rigSyn.tier === 3
                          ? 'bg-[#121f1c] border-amber-400/90'
                          : rigSyn.tier >= 1
                            ? 'bg-[#0b1824] border-emerald-400/70'
                            : 'bg-[#090e17] border-slate-800'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-mono-tabular font-bold uppercase tracking-wider ${
                          rigSyn.tier === 3
                            ? 'text-amber-300'
                            : rigSyn.tier >= 1
                              ? 'text-emerald-300'
                              : 'text-slate-400'
                        }`}
                      >
                        {locale === 'vi' ? rigSyn.titleVi : rigSyn.titleEn}
                      </span>
                      <span className="text-[9px] font-mono-tabular text-slate-200">
                        {locale === 'vi' ? rigSyn.perkSummaryVi : rigSyn.perkSummaryEn}
                      </span>
                    </div>
                  );
                })()}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-mono-tabular uppercase tracking-widest text-amber-300 font-bold">
                      {t(locale, 'benchRigModulesTitle')}
                    </div>
                    <div className="text-[10px] font-mono-tabular text-slate-400">
                      {t(locale, 'benchRigModulesSub')}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {VALID_RIG_MODULE_SLOTS.map((slot) => {
                    const slotModules = Object.values(RIG_MODULES).filter(
                      (m) => m.slot === slot
                    );
                    const equippedInSlot =
                      progression.equippedRigModules?.[slot] ?? null;
                    return (
                      <div
                        key={slot}
                        data-testid={`rig-slot-${slot}`}
                        className="bg-[#0a1019] border border-slate-800/90 p-2 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-1 pb-1 border-b border-slate-800/80">
                          <span className="text-[10px] font-mono-tabular font-bold uppercase tracking-wider text-cyan-300">
                            {localizeRigSlotLabel(slot, locale)}
                          </span>
                          <span className="text-[8px] font-mono-tabular uppercase text-slate-400">
                            {equippedInSlot
                              ? localizeRigModule(RIG_MODULES[equippedInSlot], locale).shortLabel
                              : t(locale, 'benchSlotEmpty')}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {slotModules.map((mod) => {
                            const localMod = localizeRigModule(mod, locale);
                            const isOwned =
                              progression.purchasedRigModules?.includes(mod.id) ??
                              false;
                            const isEquipped = equippedInSlot === mod.id;
                            const isMk2 = isRigModuleOverclocked(
                              mod.id,
                              progression.overclockedRigModules
                            );
                            const canAfford =
                              progression.memoryFragments >= mod.cost;
                            const canAffordMk2 =
                              progression.memoryFragments >= RIG_OVERCLOCK_COST;
                            return (
                              <div
                                key={mod.id}
                                data-testid={`rig-module-card-${mod.id}`}
                                data-owned={isOwned ? 'true' : 'false'}
                                data-equipped={isEquipped ? 'true' : 'false'}
                                data-overclocked={isMk2 ? 'true' : 'false'}
                                className={`p-2 border flex flex-col justify-between gap-1 transition-colors ${
                                  isEquipped
                                    ? 'bg-[#0e1b2c] border-amber-400/90'
                                    : isOwned
                                      ? 'bg-[#0b131e] border-slate-700'
                                      : 'bg-[#080d14] border-slate-800/90'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <span className="text-[10px] font-display font-bold uppercase tracking-wide text-slate-100 truncate">
                                      {localMod.name}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {isMk2 && (
                                        <span className="text-[8px] font-mono-tabular font-bold uppercase px-1 py-0.5 border bg-emerald-500/20 border-emerald-400 text-emerald-200 whitespace-nowrap">
                                          MK.II
                                        </span>
                                      )}
                                      <span
                                        className={`text-[8px] font-mono-tabular font-bold uppercase px-1 py-0.5 border whitespace-nowrap shrink-0 ${
                                          isEquipped
                                            ? 'bg-amber-400/20 border-amber-400 text-amber-200'
                                            : isOwned
                                              ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                                              : canAfford
                                                ? 'bg-amber-500/15 border-amber-400/60 text-amber-300'
                                                : 'bg-slate-900 border-slate-700 text-slate-400'
                                        }`}
                                      >
                                        {isEquipped
                                          ? t(locale, 'benchEquippedTag')
                                          : isOwned
                                            ? t(locale, 'benchOwnedTag')
                                            : `${mod.cost} ${t(locale, 'benchFragShort')}`}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-[9px] text-emerald-300 leading-tight mb-0.5">
                                    <span className="font-mono-tabular font-bold">+ </span>
                                    {localMod.benefitText}
                                  </div>
                                  <div className="text-[9px] text-amber-300/90 leading-tight mb-1">
                                    <span className="font-mono-tabular font-bold">- </span>
                                    {localMod.tradeoffText}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <button
                                    type="button"
                                    data-testid={`rig-module-action-${mod.id}`}
                                    onClick={() => {
                                      if (isEquipped) {
                                        onEquipRigModule?.(mod.slot, null);
                                      } else if (isOwned) {
                                        onEquipRigModule?.(mod.slot, mod.id);
                                      } else {
                                        onPurchaseRigModule?.(mod.id);
                                      }
                                    }}
                                    className={`w-full px-2 py-1 text-[9px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors whitespace-nowrap text-center cursor-pointer ${
                                      isEquipped
                                        ? 'bg-amber-400/20 hover:bg-amber-400/30 border-amber-300 text-white'
                                        : isOwned
                                          ? 'bg-[#122236] hover:bg-[#19304b] border-cyan-500/60 text-cyan-200'
                                          : canAfford
                                            ? 'bg-amber-400 hover:bg-amber-300 border-amber-300 text-slate-950'
                                            : 'bg-[#0d121a] hover:bg-[#141c28] border-slate-700 text-slate-400'
                                    }`}
                                  >
                                    {isEquipped
                                      ? t(locale, 'benchUnequip')
                                      : isOwned
                                        ? t(locale, 'benchEquipModule')
                                        : `${t(locale, 'benchUnlock')} (${mod.cost} ${t(locale, 'benchFragShort')})`}
                                  </button>
                                  {isOwned && !isMk2 && (
                                    <button
                                      type="button"
                                      data-testid={`rig-module-overclock-${mod.id}`}
                                      onClick={() => onOverclockRigModule?.(mod.id)}
                                      className={`w-full px-2 py-1 text-[8px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors truncate text-center cursor-pointer ${
                                        canAffordMk2
                                          ? 'bg-emerald-500/20 hover:bg-emerald-400/30 border-emerald-400/80 text-emerald-200'
                                          : 'bg-[#0c121b] border-slate-800 text-slate-500'
                                      }`}
                                    >
                                      {t(locale, 'rigOverclockBtn')}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chronicle Expansion: Suit Neural Protocols (Permanent Buildcraft Layer) */}
              <div
                data-testid="neural-protocols-section"
                className="pt-2 mt-2 border-t border-slate-800/90 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-mono-tabular uppercase tracking-widest text-cyan-300 font-bold">
                      {t(locale, 'neuralProtocolsTitle')}
                    </div>
                    <div className="text-[10px] font-mono-tabular text-slate-400">
                      {t(locale, 'neuralProtocolsSub')} (
                      {(progression.purchasedNeuralProtocols ?? []).length}/4{' '}
                      {locale === 'vi' ? 'ĐANG BẬT' : 'ACTIVE'})
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {ALL_NEURAL_PROTOCOLS.map((proto) => {
                    const localProto = localizeNeuralProtocol(proto, locale);
                    const isInstalled =
                      progression.purchasedNeuralProtocols?.includes(proto.id) ?? false;
                    const canAfford = progression.memoryFragments >= proto.cost;
                    return (
                      <div
                        key={proto.id}
                        data-testid={`neural-protocol-card-${proto.id}`}
                        data-installed={isInstalled ? 'true' : 'false'}
                        className={`p-2 border flex flex-col justify-between gap-1 ${
                          isInstalled
                            ? 'bg-[#0a1c28] border-cyan-400/90'
                            : 'bg-[#080d14] border-slate-800/90'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1.5 mb-0.5">
                            <span className="text-[10px] font-display font-bold uppercase tracking-wide text-slate-100">
                              {localProto.name}
                            </span>
                            <span
                              className={`text-[8px] font-mono-tabular font-bold uppercase px-1 py-0.5 border whitespace-nowrap shrink-0 ${
                                isInstalled
                                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                                  : canAfford
                                    ? 'bg-amber-500/15 border-amber-400/70 text-amber-300'
                                    : 'bg-slate-900 border-slate-700 text-slate-400'
                              }`}
                            >
                              {isInstalled
                                ? locale === 'vi'
                                  ? 'ĐÃ CÀI'
                                  : 'INSTALLED'
                                : `${proto.cost} ${t(locale, 'benchFragShort')}`}
                            </span>
                          </div>
                          <div className="text-[9px] text-emerald-300 leading-tight mb-0.5">
                            <span className="font-mono-tabular font-bold">+ </span>
                            {localProto.benefitText}
                          </div>
                          <div className="text-[9px] text-amber-300/90 leading-tight mb-1">
                            <span className="font-mono-tabular font-bold">- </span>
                            {localProto.tradeoffText}
                          </div>
                        </div>
                        <button
                          type="button"
                          data-testid={`neural-protocol-action-${proto.id}`}
                          disabled={isInstalled}
                          onClick={() => {
                            if (!isInstalled) {
                              onPurchaseNeuralProtocol?.(proto.id);
                            }
                          }}
                          className={`w-full px-2 py-1 text-[9px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors whitespace-nowrap text-center ${
                            isInstalled
                              ? 'bg-emerald-500/15 border-emerald-400/70 text-emerald-200 cursor-default'
                              : canAfford
                                ? 'bg-cyan-400 hover:bg-cyan-300 border-cyan-300 text-slate-950 cursor-pointer'
                                : 'bg-[#0d121a] hover:bg-[#141c28] border-slate-700 text-slate-400 cursor-pointer'
                          }`}
                        >
                          {isInstalled
                            ? locale === 'vi'
                              ? 'GIAO THỨC ĐANG BẬT'
                              : 'PROTOCOL ACTIVE'
                            : locale === 'vi'
                              ? `CÀI ĐẶT GIAO THỨC (${proto.cost} ${t(locale, 'benchFragShort')})`
                              : `INSTALL PROTOCOL (${proto.cost} FRAG)`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* v2.3.0: Field Fabricator Quick-Buy & Live 3D Rig Skins */}
              <div
                data-testid="modal-fabricator-skins-section"
                className="pt-2 mt-2 border-t border-slate-800/90 space-y-2.5"
              >
                {paradox && onPurchaseFabricator && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono-tabular uppercase tracking-wider text-amber-300 font-bold">
                      <span>FIELD FABRICATOR TACTICAL LOADOUT</span>
                      <span className="text-slate-300">
                        NANITE ×{paradox.loadout.naniteInjectors} · SHIELD +{Math.ceil(paradox.loadout.aegisShieldHp)} · DRONE MK.{paradox.loadout.combatDroneTier}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {FIELD_FABRICATOR_ITEMS.map((item) => {
                        const loadout = paradox.loadout;
                        const alreadyMaxed =
                          (item.id === 'nanite_pack' &&
                            loadout.naniteInjectors >= loadout.maxNaniteInjectors) ||
                          (item.id === 'aegis_shield' &&
                            loadout.aegisShieldHp >= loadout.maxAegisShieldHp) ||
                          (item.id === 'overclock_core' && loadout.overclockCoreActive) ||
                          (item.id === 'drone_mk1' && loadout.combatDroneTier >= 1) ||
                          (item.id === 'drone_mk2' && loadout.combatDroneTier >= 2);
                        const disabled = alreadyMaxed || progression.memoryFragments < item.cost;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            data-testid={`modal-fab-${item.id}`}
                            disabled={disabled}
                            title={item.description}
                            onClick={() => onPurchaseFabricator(item.id)}
                            className={`p-1.5 border text-[9px] font-mono-tabular uppercase text-left transition-colors ${
                              alreadyMaxed
                                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 cursor-default'
                                : !disabled
                                  ? 'bg-[#0c1626] hover:bg-amber-500/20 border-amber-400/70 text-amber-100 cursor-pointer'
                                  : 'bg-[#080c12] border-slate-800 text-slate-500 cursor-default'
                            }`}
                          >
                            <div className="font-bold truncate">{item.shortLabel}</div>
                            <div className="text-[8px] text-slate-400">
                              {alreadyMaxed ? 'ACTIVE ✓' : `${item.cost} FRAG`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {onEquipSkin && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono-tabular uppercase tracking-wider text-fuchsia-300 font-bold">
                      <span>{t(locale, 'rigSkinsTitle')}</span>
                      <span className="text-slate-400">
                        {progression.equippedSkinId?.replace('_', ' ') ?? 'NADIR STANDARD'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {SERA_RIG_SKINS.map((skin) => {
                        const unlocked = isSeraRigSkinUnlocked(
                          skin.id,
                          progression.unlockedAchievementIds ?? [],
                          progression.echoZeroDefeatedCount ?? 0
                        );
                        const equipped = (progression.equippedSkinId ?? 'nadir_standard') === skin.id;
                        return (
                          <button
                            key={skin.id}
                            type="button"
                            data-testid={`modal-skin-${skin.id}`}
                            disabled={!unlocked}
                            title={`${skin.name} — ${skin.unlockRequirementText}`}
                            onClick={() => unlocked && onEquipSkin(skin.id)}
                            className={`p-1.5 border text-left transition-colors ${
                              equipped
                                ? 'bg-[#171c30] border-amber-400 text-white cursor-default'
                                : unlocked
                                  ? 'bg-[#0b1320] hover:bg-[#142236] border-slate-700 text-slate-200 cursor-pointer'
                                  : 'bg-[#070a10] border-slate-800/80 text-slate-500 cursor-default opacity-70'
                            }`}
                          >
                            <div
                              className="h-2 w-full mb-1 border border-white/20"
                              style={{ background: skin.swatchCss }}
                            />
                            <div className="text-[8px] font-bold uppercase truncate">{skin.name}</div>
                            <div className="text-[7px] uppercase text-slate-400">
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
                )}
              </div>
            </div>
          )}

          {/* SECTION 3: MISSION JOURNAL, SECTOR MAP & ARCHIVE CODEX */}
          {(isPaused || isVictory) && exploration && (
            <div
              data-testid="modal-exploration-panel"
              className={
                activeModalSection === 'exploration'
                  ? 'bg-[#070a0f] border border-slate-800/90 p-3 space-y-2.5'
                  : 'sr-only'
              }
            >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/90">
              <div>
                <div className="text-[11px] font-mono-tabular uppercase tracking-widest text-cyan-300 font-bold">
                  {locale === 'vi'
                    ? 'NHẬT KÝ CHIẾN TRƯỜNG NADIR-9, BẢN ĐỒ KHU VỰC & HỒ SƠ MẬT'
                    : 'NADIR-9 FIELD JOURNAL, SECTOR MAP & ARCHIVE CODEX'}
                </div>
                <div className="text-[10px] font-mono-tabular text-slate-400">
                  {locale === 'vi'
                    ? `${exploration.mission.code} · NÚT MẠNG: ${exploration.activatedNodeIds.length} · TUYẾN MỞ: ${exploration.unlockedRouteIds.length} · BÍ MẬT: ${exploration.discoveredSecretIds?.length ?? 0}/${exploration.localMap?.totalSecretsCampaign ?? 4}`
                    : `${exploration.mission.code} · NODES: ${exploration.activatedNodeIds.length} · ROUTES: ${exploration.unlockedRouteIds.length} · SECRETS: ${exploration.discoveredSecretIds?.length ?? 0}/${exploration.localMap?.totalSecretsCampaign ?? 4}`}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  data-testid="modal-tab-missions"
                  aria-pressed={activeExplorationTab === 'missions'}
                  onClick={() => {
                    setActiveModalSection('exploration');
                    setActiveExplorationTab('missions');
                  }}
                  className={`px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase border transition-colors cursor-pointer ${
                    activeExplorationTab === 'missions'
                      ? 'bg-cyan-400/20 border-cyan-400 text-cyan-200'
                      : 'bg-[#0b1018] border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {locale === 'vi' ? 'NHIỆM VỤ' : 'MISSIONS'} ({exploration.mission.objectives.filter((o) => o.status === 'completed').length}/{exploration.mission.objectives.length})
                </button>
                <button
                  type="button"
                  data-testid="modal-tab-map"
                  aria-pressed={activeExplorationTab === 'map'}
                  onClick={() => {
                    setActiveModalSection('exploration');
                    setActiveExplorationTab('map');
                  }}
                  className={`px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase border transition-colors cursor-pointer ${
                    activeExplorationTab === 'map'
                      ? 'bg-emerald-400/20 border-emerald-400 text-emerald-200'
                      : 'bg-[#0b1018] border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {locale === 'vi' ? 'BẢN ĐỒ [N]' : 'SECTOR MAP [N]'} ({exploration.localMap?.discoveredSecretsInChapter ?? 0}/{exploration.localMap?.totalSecretsInChapter ?? 0})
                </button>
                <button
                  type="button"
                  data-testid="modal-tab-codex"
                  aria-pressed={activeExplorationTab === 'codex'}
                  onClick={() => {
                    setActiveModalSection('exploration');
                    setActiveExplorationTab('codex');
                  }}
                  className={`px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase border transition-colors cursor-pointer ${
                    activeExplorationTab === 'codex'
                      ? 'bg-amber-400/20 border-amber-400 text-amber-200'
                      : 'bg-[#0b1018] border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {locale === 'vi' ? 'HỒ SƠ' : 'CODEX'} ({exploration.discoveredCodexIds.length}/{exploration.codexEntries.length})
                </button>
                <button
                  type="button"
                  data-testid="modal-tab-holo"
                  aria-pressed={activeExplorationTab === 'holo'}
                  onClick={() => {
                    setActiveModalSection('exploration');
                    setActiveExplorationTab('holo');
                  }}
                  className={`px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase border transition-colors cursor-pointer ${
                    activeExplorationTab === 'holo'
                      ? 'bg-cyan-300/20 border-cyan-300 text-cyan-100'
                      : 'bg-[#0b1018] border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t(locale, 'chronicleTheaterTab')} ({(exploration.discoveredHoloMemoryIds ?? []).length}/6)
                </button>
                <button
                  type="button"
                  data-testid="modal-tab-mastery"
                  aria-pressed={activeExplorationTab === 'mastery'}
                  onClick={() => {
                    setActiveModalSection('exploration');
                    setActiveExplorationTab('mastery');
                  }}
                  className={`px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase border transition-colors cursor-pointer whitespace-nowrap ${
                    activeExplorationTab === 'mastery'
                      ? 'bg-amber-400/20 border-amber-300 text-amber-100'
                      : 'bg-[#0b1018] border-amber-500/45 text-amber-200 hover:text-amber-100'
                  }`}
                >
                  {t(locale, 'masteryLedgerTab')} ({masterySeal.claimedSealsCount}/24)
                  {masterySeal.pendingBountyCount > 0 ? ` · +${masterySeal.pendingBountyCount}◆` : ''}
                </button>
              </div>
            </div>

            {activeExplorationTab === 'missions' ? (
              <div data-testid="mission-journal-view" className="space-y-2">
                {exploration.chapterIdentity && (
                  <div
                    data-testid="journal-chapter-identity"
                    data-theme-label={exploration.chapterIdentity.themeLabel}
                    className="bg-[#08111c] border border-cyan-500/40 p-2.5 space-y-1"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-tabular uppercase tracking-wider text-cyan-300 font-bold">
                      <span>SECTOR IDENTITY · {exploration.chapterIdentity.themeLabel}</span>
                      <span className="text-amber-300">{exploration.chapterIdentity.arrivalHeadline}</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-100 italic">
                      “{exploration.chapterIdentity.coreFeeling}”
                    </div>
                    <p className="text-[10px] text-slate-300 leading-snug">
                      {exploration.chapterIdentity.atmosphereSummary}
                    </p>
                  </div>
                )}

                <div className="bg-[#0a1019] border border-slate-800/90 p-2.5">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-xs font-display font-bold uppercase tracking-wide text-slate-100">
                      {exploration.mission.title}
                    </span>
                    <span className="text-[9px] font-mono-tabular uppercase px-1.5 py-0.5 border border-cyan-500/50 text-cyan-300">
                      {exploration.mission.completed
                        ? locale === 'vi'
                          ? 'HOÀN THÀNH NHIỆM VỤ'
                          : 'MISSION COMPLETE'
                        : locale === 'vi'
                          ? 'ĐANG THỰC HIỆN'
                          : 'IN PROGRESS'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    {exploration.mission.summary}
                  </p>
                </div>

                <div className="space-y-1.5">
                  {exploration.mission.objectives.map((obj) => (
                    <div
                      key={obj.id}
                      data-testid={`mission-objective-${obj.id}`}
                      data-objective-status={obj.status}
                      data-objective-category={obj.category}
                      className={`p-2 border flex flex-col gap-0.5 ${
                        obj.status === 'completed'
                          ? 'bg-[#091518] border-emerald-500/50'
                          : obj.status === 'active'
                            ? 'bg-[#0c1624] border-cyan-400/80'
                            : obj.status === 'available'
                              ? 'bg-[#0b111b] border-amber-400/50'
                              : 'bg-[#080c12] border-slate-800/80 opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono-tabular font-bold text-slate-100">
                          <span
                            className={`mr-1.5 text-[9px] px-1 py-0.5 border ${
                              obj.category === 'optional'
                                ? 'border-amber-400/60 text-amber-300'
                                : 'border-cyan-400/60 text-cyan-300'
                            }`}
                          >
                            {obj.category === 'optional'
                              ? locale === 'vi'
                                ? 'PHỤ'
                                : 'OPTIONAL'
                              : locale === 'vi'
                                ? 'CHÍNH'
                                : 'MAIN'}
                          </span>
                          {obj.title}
                        </span>
                        <span
                          className={`text-[9px] font-mono-tabular font-bold uppercase px-1.5 py-0.5 border whitespace-nowrap ${
                            obj.status === 'completed'
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                              : obj.status === 'active'
                                ? 'bg-cyan-400/20 border-cyan-300 text-cyan-200'
                                : obj.status === 'available'
                                  ? 'bg-amber-500/15 border-amber-400/60 text-amber-300'
                                  : 'bg-slate-900 border-slate-700 text-slate-400'
                          }`}
                        >
                          {locale === 'vi'
                            ? obj.status === 'completed'
                              ? 'HOÀN THÀNH'
                              : obj.status === 'active'
                                ? 'ĐANG LÀM'
                                : obj.status === 'available'
                                  ? 'KHẢ DỤNG'
                                  : 'ĐÃ KHÓA'
                            : obj.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-snug">
                        {obj.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Chronicle Expansion: Interactive Chapter Story Signal & Stance Matrix */}
                {exploration.activeChapterStory &&
                  (() => {
                    const localStory = localizeStoryArc(exploration.activeChapterStory, locale);
                    return (
                      <div
                        data-testid="journal-story-signals-panel"
                        data-story-arc={localStory.id}
                        data-resolved={localStory.resolved ? 'true' : 'false'}
                        className="bg-[#09121e] border border-amber-400/55 p-2.5 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-[10px] font-mono-tabular uppercase tracking-widest text-amber-300 font-bold">
                              {locale === 'vi' ? 'TÍN HIỆU BIÊN NIÊN' : 'CHRONICLE SIGNAL'} ·{' '}
                              {localStory.title}
                            </div>
                            <div className="text-[9px] font-mono-tabular text-slate-400">
                              {localStory.subtitle} ·{' '}
                              {locale === 'vi' ? 'NHÂN CHỨNG' : 'SUBJECT'}:{' '}
                              {localStory.crewCharacter}
                            </div>
                          </div>
                          {exploration.stanceSummary && (
                            <div
                              data-testid="journal-stance-tally"
                              className="text-[9px] font-mono-tabular uppercase px-2 py-0.5 bg-[#060b12] border border-slate-700 text-cyan-200"
                            >
                              {locale === 'vi'
                                ? `PHẢN KHÁNG ${exploration.stanceSummary.defiance} · THẤU CẢM ${exploration.stanceSummary.empathy} · THỰC DỤNG ${exploration.stanceSummary.pragmatism} (${localizeStanceLabel(exploration.stanceSummary.dominantStance, locale)})`
                                : `DEF ${exploration.stanceSummary.defiance} · EMP ${exploration.stanceSummary.empathy} · PRG ${exploration.stanceSummary.pragmatism} (${exploration.stanceSummary.dominantStance.toUpperCase()})`}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 bg-[#060a10] border border-slate-800/90 p-2">
                          {localStory.lines.map((line, idx) => (
                            <div key={idx} className="text-[10px] leading-snug">
                              <span
                                className={`font-mono-tabular font-bold uppercase mr-1.5 ${
                                  line.accent === 'cyan'
                                    ? 'text-cyan-300'
                                    : line.accent === 'rose'
                                      ? 'text-rose-300'
                                      : line.accent === 'amber'
                                        ? 'text-amber-300'
                                        : line.accent === 'purple'
                                          ? 'text-purple-300'
                                          : 'text-emerald-300'
                                }`}
                              >
                                [{line.speaker} · {line.role}]:
                              </span>
                              <span className="text-slate-200">{line.line}</span>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                          {localStory.choices.map((choice) => {
                            const isPicked = localStory.chosenOptionId === choice.id;
                            const resolved = Boolean(localStory.resolved);
                            return (
                              <button
                                key={choice.id}
                                type="button"
                                data-testid={`journal-story-choice-${choice.id}`}
                                disabled={resolved}
                                onClick={() => onResolveStoryChoice?.(localStory.id, choice.id)}
                                className={`text-left p-2 border transition-colors ${
                                  isPicked
                                    ? 'bg-emerald-950/50 border-emerald-400 text-white'
                                    : resolved
                                      ? 'bg-[#070b10] border-slate-800 text-slate-500 opacity-70 cursor-default'
                                      : 'bg-[#0b1523] hover:bg-[#13253b] border-cyan-500/60 text-slate-100 cursor-pointer'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 text-[8px] font-mono-tabular font-bold uppercase mb-0.5">
                                  <span
                                    className={
                                      choice.stance === 'defiance'
                                        ? 'text-rose-300'
                                        : choice.stance === 'empathy'
                                          ? 'text-cyan-300'
                                          : 'text-amber-300'
                                    }
                                  >
                                    {localizeStanceLabel(choice.stance, locale)}
                                  </span>
                                  <span className="text-emerald-300">
                                    {locale === 'vi' ? '+1 MẢNH' : '+1 FRAG'}
                                  </span>
                                </div>
                                <div className="text-[10px] font-bold leading-tight mb-1">
                                  {choice.label}
                                </div>
                                <div className="text-[8px] font-mono-tabular text-cyan-200/90">
                                  {isPicked
                                    ? `${locale === 'vi' ? 'ĐANG BẬT' : 'ACTIVE'}: ${choice.blessingLabel}`
                                    : choice.blessingLabel}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {localStory.resolved && (
                          <div className="text-[9px] font-mono-tabular text-emerald-300 bg-[#061311] border border-emerald-500/40 px-2 py-1">
                            {
                              localStory.choices.find(
                                (c) => c.id === localStory.chosenOptionId
                              )?.responseLine
                            }
                          </div>
                        )}
                      </div>
                    );
                  })()}

                {/* Phase 20: Authored Narrative Events & Echo Memories */}
                {exploration.narrativeEvents && exploration.narrativeEvents.length > 0 && (
                  <div
                    data-testid="journal-narrative-events-section"
                    data-triggered-count={
                      exploration.narrativeEvents.filter((e) => e.completed).length
                    }
                    className="bg-[#080d15] border border-slate-800/90 p-2.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono-tabular uppercase tracking-wider text-cyan-300 font-bold">
                      <span>SECTOR NARRATIVE EVENTS & ECHO MEMORIES</span>
                      <span className="text-slate-400">
                        RECORDED: {exploration.narrativeEvents.filter((e) => e.completed).length}/
                        {exploration.narrativeEvents.length} · CAMPAIGN:{' '}
                        {exploration.completedNarrativeEventIds?.length ?? 0}/24
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {exploration.narrativeEvents.map((ev) => (
                        <div
                          key={ev.id}
                          data-testid={`narrative-event-${ev.id}`}
                          data-triggered={ev.completed ? 'true' : 'false'}
                          data-category={ev.category}
                          className={`p-2 border flex flex-col justify-between gap-1 ${
                            ev.completed
                              ? ev.category === 'echo_memory'
                                ? 'bg-[#091822] border-cyan-400/80'
                                : 'bg-[#091518] border-emerald-500/50'
                              : 'bg-[#070b11] border-slate-800/85 opacity-80'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span
                              className={`text-[8px] font-mono-tabular font-bold uppercase px-1 py-0.5 border ${
                                ev.category === 'echo_memory'
                                  ? 'border-cyan-400/70 text-cyan-300'
                                  : ev.category === 'optional'
                                    ? 'border-amber-400/70 text-amber-300'
                                    : 'border-slate-600 text-slate-300'
                              }`}
                            >
                              {ev.category === 'echo_memory'
                                ? 'ECHO MEMORY'
                                : ev.category === 'optional'
                                  ? 'EVIDENCE'
                                  : 'STORY BEAT'}
                            </span>
                            <span
                              className={`text-[8px] font-mono-tabular font-bold uppercase ${
                                ev.completed ? 'text-emerald-300' : 'text-slate-500'
                              }`}
                            >
                              {ev.completed ? 'RECORDED' : 'UNINDEXED'}
                            </span>
                          </div>
                          <div className="text-[10px] font-mono-tabular font-bold text-slate-100">
                            {ev.completed || ev.category === 'main'
                              ? ev.title
                              : 'UNINDEXED TEMPORAL TRACE'}
                          </div>
                          <div className="text-[9px] text-slate-300 leading-snug">
                            {ev.completed
                              ? ev.summary
                              : ev.category === 'echo_memory'
                                ? 'Replay or synchronize a Chrono Rig Echo at this sector’s temporal anchor to reconstruct Lysa’s residual memory.'
                                : 'Explore sector terminals, bypass routes, or secret sanctuaries to uncover this record.'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : activeExplorationTab === 'map' && exploration.localMap ? (
              <div
                data-testid="local-sector-map"
                data-current-region={exploration.localMap.currentRegionId}
                data-discovered-secrets-chapter={exploration.localMap.discoveredSecretsInChapter}
                data-total-secrets-chapter={exploration.localMap.totalSecretsInChapter}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3"
              >
                {/* Interconnected 6-Sector Nadir-9 Station Map with % Discovery & Secret Echo Vault Status */}
                {(() => {
                  const stationNodes = buildStationSectorMapNodes({
                    completedChapters,
                    unlockedChapters,
                    activeChapter: chapter,
                    claimedRewardIds: progression?.claimedRewardIds ?? [],
                    activatedNodeIds: exploration.interactables
                      .filter((it) => it.status === 'activated' || it.activationCount > 0)
                      .map((it) => it.id),
                    unlockedVaultChapters: progression?.unlockedVaultChapters ?? [],
                  });
                  const totalDiscovery = Math.round(
                    stationNodes.reduce((acc, n) => acc + n.discoveryPercent, 0) /
                      Math.max(1, stationNodes.length)
                  );
                  return (
                    <div
                      data-testid="station-sector-map"
                      className="sm:col-span-12 bg-[#060b14] border border-cyan-500/40 p-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 text-[10px] font-mono-tabular uppercase tracking-wider">
                          <span className="text-cyan-300 font-bold">
                            NADIR-9 INTERCONNECTED 6-SECTOR STATION MAP
                          </span>
                          {(progression?.ngPlusCycle ?? 0) > 0 && (
                            <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-400/70 text-amber-300 font-bold">
                              NG+{progression?.ngPlusCycle}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono-tabular">
                          <span className="text-slate-400 uppercase">STATION DISCOVERY</span>
                          <span
                            data-testid="station-total-discovery"
                            className="text-emerald-300 font-bold"
                          >
                            {totalDiscovery}%
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5">
                        {stationNodes.map((node) => {
                          const canJump =
                            node.status !== 'locked' && Boolean(onJumpToExpeditionSector);
                          return (
                            <button
                              key={node.chapter}
                              type="button"
                              disabled={!canJump}
                              data-testid={`station-map-node-${node.code}`}
                              data-status={node.status}
                              data-discovery={node.discoveryPercent}
                              onClick={() => {
                                if (canJump) {
                                  onJumpToExpeditionSector?.(node.chapter);
                                }
                              }}
                              className={`text-left p-2 border transition-colors font-mono-tabular ${
                                node.status === 'active'
                                  ? 'bg-cyan-950/55 border-cyan-400 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                                  : node.status === 'cleared'
                                    ? 'bg-emerald-950/35 border-emerald-500/70 text-emerald-100 hover:bg-emerald-900/40 cursor-pointer'
                                    : node.status === 'unlocked'
                                      ? 'bg-[#0c1626] border-slate-600 text-slate-200 hover:border-cyan-400/70 cursor-pointer'
                                      : 'bg-[#080c14] border-slate-800/80 text-slate-500 opacity-65 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 text-[9px] font-bold">
                                <span>
                                  {node.code} {node.shortName}
                                </span>
                                <span
                                  className={
                                    node.status === 'active'
                                      ? 'text-cyan-300'
                                      : node.status === 'cleared'
                                        ? 'text-emerald-300'
                                        : 'text-slate-500'
                                  }
                                >
                                  {node.discoveryPercent}%
                                </span>
                              </div>
                              <div className="mt-1 h-1 bg-slate-900 overflow-hidden">
                                <div
                                  className={`h-full ${
                                    node.status === 'cleared'
                                      ? 'bg-emerald-400'
                                      : node.status === 'active'
                                        ? 'bg-cyan-400'
                                        : 'bg-amber-400'
                                  }`}
                                  style={{ width: `${node.discoveryPercent}%` }}
                                />
                              </div>
                              <div className="mt-1 flex items-center justify-between text-[8px] uppercase tracking-wide text-slate-400">
                                <span>
                                  {node.status === 'active'
                                    ? 'HERE'
                                    : node.status === 'cleared'
                                      ? 'CLEAR'
                                      : node.status === 'unlocked'
                                        ? 'OPEN'
                                        : 'SEALED'}
                                </span>
                                {node.chapter !== 'chapter_5_loom' && (
                                  <span
                                    className={
                                      node.vaultLooted ? 'text-amber-300 font-bold' : 'text-slate-500'
                                    }
                                  >
                                    {node.vaultLooted ? 'VAULT ✓' : 'VAULT'}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* 2D Top-Down Tactical Sector Schematic SVG */}
                <div className="sm:col-span-5 bg-[#05080e] border border-slate-800 p-2.5 flex flex-col items-center justify-between">
                  <div className="w-full flex items-center justify-between gap-2 text-[9px] font-mono-tabular uppercase text-slate-400 mb-1.5">
                    <span className="shrink-0">{exploration.localMap.sectorCode} SCHEMATIC</span>
                    <span data-testid="map-current-region" className="text-cyan-300 font-bold truncate text-right">
                      {exploration.localMap.currentRegionLabel}
                    </span>
                  </div>

                  <svg
                    viewBox="-24 -24 48 48"
                    className="w-full max-w-[220px] aspect-square bg-[#04070c] border border-slate-800/80"
                    role="img"
                    aria-label="Sector Tactical Schematic Map"
                  >
                    {/* Arena Outer Bulkhead Perimeter & Range Rings */}
                    <circle
                      cx="0"
                      cy="0"
                      r={exploration.localMap.arenaRadius}
                      fill="#070c14"
                      stroke="#1e293b"
                      strokeWidth="0.6"
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r={16}
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="0.35"
                      strokeDasharray="1.2 1.2"
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r={8}
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="0.35"
                      strokeDasharray="1.2 1.2"
                    />
                    {/* Tactical Grid Crosshairs & Cardinals */}
                    <line x1="-22" y1="0" x2="22" y2="0" stroke="#0f172a" strokeWidth="0.3" />
                    <line x1="0" y1="-22" x2="0" y2="22" stroke="#0f172a" strokeWidth="0.3" />
                    <text x="0" y="-19.5" textAnchor="middle" fill="#64748b" fontSize="2.4" fontFamily="monospace">N</text>
                    <text x="0" y="21.4" textAnchor="middle" fill="#475569" fontSize="2.2" fontFamily="monospace">S</text>
                    <text x="-20.4" y="0.8" textAnchor="middle" fill="#475569" fontSize="2.2" fontFamily="monospace">W</text>
                    <text x="20.4" y="0.8" textAnchor="middle" fill="#475569" fontSize="2.2" fontFamily="monospace">E</text>
                    <circle cx="0" cy="-2" r="2.1" fill="#0f172a" stroke="#334155" strokeWidth="0.4" />

                    {/* Sector Regions (with Fog-of-Discovery for undiscovered secret alcoves) */}
                    {exploration.localMap.regions.map((reg) => {
                      const isCurrent = reg.id === exploration.localMap.currentRegionId;
                      const isSelected = selectedMapNode?.id === reg.id;
                      const canInspect = !reg.hiddenByFog || reg.discovered;
                      return (
                        <g
                          key={reg.id}
                          data-testid={`map-region-${reg.id}`}
                          data-hidden-by-fog={reg.hiddenByFog ? 'true' : 'false'}
                          data-discovered={reg.discovered ? 'true' : 'false'}
                          role={canInspect ? 'button' : undefined}
                          tabIndex={canInspect ? 0 : undefined}
                          aria-label={canInspect ? `Inspect ${reg.label}` : undefined}
                          className={canInspect ? 'cursor-pointer' : undefined}
                          onClick={() => {
                            if (!canInspect) return;
                            setSelectedMapNode({
                              id: reg.id,
                              kind: reg.kind === 'secret_alcove' ? 'secret' : 'region',
                              label: reg.label,
                              x: reg.x,
                              z: reg.z,
                              statusLabel: isCurrent ? 'CURRENT SECTOR' : reg.discovered ? 'SURVEYED' : 'UNEXPLORED',
                              details:
                                reg.kind === 'secret_alcove'
                                  ? 'Perimeter alcove housing hidden archive cache & tactical salvage.'
                                  : 'Named combat zone inside Nadir-9 containment ring.',
                            });
                          }}
                          onKeyDown={(e) => {
                            if (canInspect && (e.key === 'Enter' || e.key === ' ')) {
                              e.preventDefault();
                              setSelectedMapNode({
                                id: reg.id,
                                kind: reg.kind === 'secret_alcove' ? 'secret' : 'region',
                                label: reg.label,
                                x: reg.x,
                                z: reg.z,
                                statusLabel: isCurrent ? 'CURRENT SECTOR' : reg.discovered ? 'SURVEYED' : 'UNEXPLORED',
                                details:
                                  reg.kind === 'secret_alcove'
                                    ? 'Perimeter alcove housing hidden archive cache & tactical salvage.'
                                    : 'Named combat zone inside Nadir-9 containment ring.',
                              });
                            }
                          }}
                        >
                          <circle
                            cx={reg.x}
                            cy={reg.z}
                            r={reg.radius}
                            fill={
                              reg.hiddenByFog
                                ? 'rgba(15, 23, 42, 0.78)'
                                : reg.kind === 'secret_alcove'
                                  ? 'rgba(16, 185, 129, 0.16)'
                                  : isCurrent
                                    ? 'rgba(34, 211, 238, 0.12)'
                                    : 'rgba(14, 116, 144, 0.06)'
                            }
                            stroke={
                              isSelected
                                ? '#fbbf24'
                                : reg.hiddenByFog
                                  ? '#475569'
                                  : reg.kind === 'secret_alcove'
                                    ? '#34d399'
                                    : isCurrent
                                      ? '#22d3ee'
                                      : '#1e3a5f'
                            }
                            strokeWidth={isSelected ? '0.75' : isCurrent ? '0.55' : '0.38'}
                            strokeDasharray={reg.hiddenByFog ? '1.1 0.9' : undefined}
                          />
                        </g>
                      );
                    })}

                    {/* Traversal Routes & Gateways */}
                    {exploration.localMap.routes.map((rt) => {
                      const midX = (rt.fromX + rt.toX) * 0.5;
                      const midZ = (rt.fromZ + rt.toZ) * 0.5;
                      return (
                        <g
                          key={rt.id}
                          data-testid={`map-route-${rt.id}`}
                          data-route-status={rt.status}
                          role="button"
                          tabIndex={0}
                          aria-label={`Inspect route ${rt.label}`}
                          className="cursor-pointer"
                          onClick={() =>
                            setSelectedMapNode({
                              id: rt.id,
                              kind: 'route',
                              label: rt.label,
                              x: midX,
                              z: midZ,
                              statusLabel: rt.status.toUpperCase(),
                              details: rt.statusMessage,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedMapNode({
                                id: rt.id,
                                kind: 'route',
                                label: rt.label,
                                x: midX,
                                z: midZ,
                                statusLabel: rt.status.toUpperCase(),
                                details: rt.statusMessage,
                              });
                            }
                          }}
                        >
                          <line
                            x1={rt.fromX}
                            y1={rt.fromZ}
                            x2={rt.toX}
                            y2={rt.toZ}
                            stroke={
                              selectedMapNode?.id === rt.id
                                ? '#fbbf24'
                                : rt.status === 'open'
                                  ? '#34d399'
                                  : rt.status === 'powered'
                                    ? '#f59e0b'
                                    : '#f43f5e'
                            }
                            strokeWidth={selectedMapNode?.id === rt.id ? '1.05' : '0.7'}
                            strokeDasharray={rt.status === 'open' ? undefined : '1.0 0.8'}
                          />
                        </g>
                      );
                    })}

                    {/* Timed Energy Passages */}
                    {exploration.localMap.hazards.map((hz) => (
                      <circle
                        key={hz.id}
                        data-testid={`map-hazard-${hz.id}`}
                        data-hazard-phase={hz.phase}
                        role="button"
                        tabIndex={0}
                        aria-label={`Inspect hazard ${hz.label}`}
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedMapNode({
                            id: hz.id,
                            kind: 'hazard',
                            label: hz.label,
                            x: hz.x,
                            z: hz.z,
                            statusLabel: hz.phase.toUpperCase(),
                            details: `Cycle: ${hz.safeDuration.toFixed(1)}s Safe / ${hz.warningDuration.toFixed(1)}s Warn / ${hz.activeDuration.toFixed(1)}s Arc (${hz.damage} DMG). Dodge or Relay during active arc for Temporal Thread (+14 Flux & 1.4s Surge).`,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedMapNode({
                              id: hz.id,
                              kind: 'hazard',
                              label: hz.label,
                              x: hz.x,
                              z: hz.z,
                              statusLabel: hz.phase.toUpperCase(),
                              details: `Cycle: ${hz.safeDuration.toFixed(1)}s Safe / ${hz.warningDuration.toFixed(1)}s Warn / ${hz.activeDuration.toFixed(1)}s Arc (${hz.damage} DMG). Dodge or Relay during active arc for Temporal Thread (+14 Flux & 1.4s Surge).`,
                            });
                          }
                        }}
                        cx={hz.x}
                        cy={hz.z}
                        r={hz.radius}
                        fill={
                          hz.phase === 'active'
                            ? 'rgba(239, 68, 68, 0.35)'
                            : hz.phase === 'warning'
                              ? 'rgba(245, 158, 11, 0.28)'
                              : 'rgba(34, 211, 238, 0.14)'
                        }
                        stroke={
                          selectedMapNode?.id === hz.id
                            ? '#ffffff'
                            : hz.phase === 'active'
                              ? '#ef4444'
                              : hz.phase === 'warning'
                                ? '#f59e0b'
                                : '#22d3ee'
                        }
                        strokeWidth={selectedMapNode?.id === hz.id ? '0.7' : '0.45'}
                      />
                    ))}

                    {/* Charged Flux Pools (Shattered Capacitor Fields) */}
                    {(exploration.localMap.fluxPools ?? radar?.fluxPools ?? []).map((pool) => (
                      <circle
                        key={pool.id}
                        data-testid={`map-flux-pool-${pool.id}`}
                        cx={pool.x}
                        cy={pool.z}
                        r={pool.radius}
                        fill="rgba(34, 211, 238, 0.2)"
                        stroke="#22d3ee"
                        strokeWidth="0.45"
                        strokeDasharray="1.2 0.7"
                      />
                    ))}

                    {/* Kinetic Vector Boost Pads */}
                    {(radar?.boostPads ?? []).map((pad, idx) => (
                      <g
                        key={pad.id}
                        data-testid={`map-boost-pad-${pad.id}`}
                        data-pad-ready={pad.ready ? 'true' : 'false'}
                        role="button"
                        tabIndex={0}
                        aria-label={`Inspect Boost Pad ${idx + 1}`}
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedMapNode({
                            id: pad.id,
                            kind: 'boost_pad',
                            label: pad.x < 0 ? 'WEST FLANK BOOST PAD' : 'EAST FLANK BOOST PAD',
                            x: pad.x,
                            z: pad.z,
                            statusLabel: pad.ready ? 'READY' : 'RECHARGING',
                            details:
                              'Grants +10 Flux and 2.5s Mobility Surge (+28% speed, +15% dodge distance). Kinetic Flux Dynamo also repairs +8 Integrity.',
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedMapNode({
                              id: pad.id,
                              kind: 'boost_pad',
                              label: pad.x < 0 ? 'WEST FLANK BOOST PAD' : 'EAST FLANK BOOST PAD',
                              x: pad.x,
                              z: pad.z,
                              statusLabel: pad.ready ? 'READY' : 'RECHARGING',
                              details:
                                'Grants +10 Flux and 2.5s Mobility Surge (+28% speed, +15% dodge distance). Kinetic Flux Dynamo also repairs +8 Integrity.',
                            });
                          }
                        }}
                      >
                        <circle
                          cx={pad.x}
                          cy={pad.z}
                          r="1.35"
                          fill={pad.ready ? 'rgba(34, 211, 238, 0.22)' : 'rgba(51, 65, 85, 0.22)'}
                          stroke={
                            selectedMapNode?.id === pad.id
                              ? '#fbbf24'
                              : pad.ready
                                ? '#22d3ee'
                                : '#475569'
                          }
                          strokeWidth={selectedMapNode?.id === pad.id ? '0.75' : '0.4'}
                        />
                        <polygon
                          points={`${pad.x},${pad.z - 0.8} ${pad.x + 0.65},${pad.z + 0.45} ${pad.x},${pad.z + 0.1} ${pad.x - 0.65},${pad.z + 0.45}`}
                          fill={pad.ready ? '#67e8f9' : '#64748b'}
                        />
                      </g>
                    ))}

                    {/* Chapter Cover Barricades, Pillars & Destructible Capacitors */}
                    {(radar?.obstacles ?? []).map((obs) => {
                      const selectObstacle = () =>
                        setSelectedMapNode({
                          id: obs.id,
                          kind: 'obstacle',
                          label:
                            obs.kind === 'destructible_crate'
                              ? 'CHRONO-CAPACITOR CELL'
                              : obs.kind === 'cover_wall'
                                ? 'BLAST COVER BARRICADE'
                                : 'STRUCTURAL PILLAR',
                          x: obs.x,
                          z: obs.z,
                          statusLabel:
                            obs.kind === 'destructible_crate'
                              ? `${Math.round(obs.hpRatio * 100)}% INTEGRITY`
                              : 'SOLID COVER',
                          details:
                            obs.kind === 'destructible_crate'
                              ? 'Shatter to trigger an AoE Flux Overload (35 DMG + Stagger) and leave a 3.4m Charged Flux Pool (+9 Flux/s for 7.0s).'
                              : 'Provides line-of-sight cover against ranged locks and boss projectile volleys.',
                        });

                      if (obs.kind === 'destructible_crate') {
                        return (
                          <polygon
                            key={obs.id}
                            data-testid={`map-obstacle-${obs.id}`}
                            data-obstacle-kind={obs.kind}
                            role="button"
                            tabIndex={0}
                            aria-label="Inspect Chrono-Capacitor"
                            className="cursor-pointer"
                            onClick={selectObstacle}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                selectObstacle();
                              }
                            }}
                            points={`${obs.x},${obs.z - 0.95} ${obs.x + 0.95},${obs.z} ${obs.x},${obs.z + 0.95} ${obs.x - 0.95},${obs.z}`}
                            fill={obs.hpRatio < 0.6 ? '#f97316' : '#f59e0b'}
                            stroke={selectedMapNode?.id === obs.id ? '#ffffff' : '#020617'}
                            strokeWidth={selectedMapNode?.id === obs.id ? '0.5' : '0.25'}
                          />
                        );
                      }
                      if (obs.kind === 'cover_wall') {
                        return (
                          <rect
                            key={obs.id}
                            data-testid={`map-obstacle-${obs.id}`}
                            data-obstacle-kind={obs.kind}
                            role="button"
                            tabIndex={0}
                            aria-label="Inspect Blast Cover Barricade"
                            className="cursor-pointer"
                            onClick={selectObstacle}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                selectObstacle();
                              }
                            }}
                            x={obs.x - 1.05}
                            y={obs.z - 0.55}
                            width="2.1"
                            height="1.1"
                            rx="0.2"
                            fill="#334155"
                            stroke={selectedMapNode?.id === obs.id ? '#fbbf24' : '#94a3b8'}
                            strokeWidth={selectedMapNode?.id === obs.id ? '0.55' : '0.3'}
                          />
                        );
                      }
                      return (
                        <circle
                          key={obs.id}
                          data-testid={`map-obstacle-${obs.id}`}
                          data-obstacle-kind={obs.kind}
                          role="button"
                          tabIndex={0}
                          aria-label="Inspect Structural Pillar"
                          className="cursor-pointer"
                          onClick={selectObstacle}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              selectObstacle();
                            }
                          }}
                          cx={obs.x}
                          cy={obs.z}
                          r={Math.max(0.85, obs.radius * 0.85)}
                          fill="#1e293b"
                          stroke={selectedMapNode?.id === obs.id ? '#fbbf24' : '#475569'}
                          strokeWidth={selectedMapNode?.id === obs.id ? '0.55' : '0.35'}
                        />
                      );
                    })}

                    {/* Chapter Sanctum Landmarks (1:1 synchronized with 3D arena) */}
                    {(() => {
                      const activeChap: CampaignChapterId = chapter ?? 'prologue';
                      const lm = GAME_CONFIG.arena.sanctumLandmarks;
                      type LandmarkPin = {
                        id: string;
                        label: string;
                        x: number;
                        z: number;
                        r: number;
                        color: string;
                        details: string;
                      };
                      const pins: LandmarkPin[] = [];
                      if (activeChap === 'prologue') {
                        lm.prologue.calibrationGates.forEach((g, idx) =>
                          pins.push({
                            id: `lm_cal_gate_${idx}`,
                            label: `CALIBRATION GATE 0${idx + 1}`,
                            x: g.x,
                            z: g.z,
                            r: 1.05,
                            color: '#38bdf8',
                            details: 'Test Bay 04 perimeter laser archway gantry framing the calibration sector.',
                          })
                        );
                        pins.push({
                          id: 'lm_prologue_holo',
                          label: 'TACTICAL HOLO-TABLE',
                          x: lm.prologue.tacticalHoloTable.x,
                          z: lm.prologue.tacticalHoloTable.z,
                          r: 1.15,
                          color: '#22d3ee',
                          details: 'Octagonal orbital station holo-projector displaying live Nadir-9 ring telemetry.',
                        });
                      } else if (activeChap === 'chapter_1_helix') {
                        lm.chapter_1_helix.vaultBulkheads.forEach((bh, idx) =>
                          pins.push({
                            id: `lm_bulkhead_${idx}`,
                            label: idx === 0 ? 'NORTH-WEST VAULT BULKHEAD' : 'NORTH-EAST VAULT BULKHEAD',
                            x: bh.x,
                            z: bh.z,
                            r: 1.2,
                            color: '#f59e0b',
                            details: 'Heavy armored perimeter blast door sealing the Industrial Containment Bay.',
                          })
                        );
                        lm.chapter_1_helix.containmentPylons.forEach((p, idx) =>
                          pins.push({
                            id: `lm_pylon_${idx}`,
                            label: `CONTAINMENT PYLON 0${idx + 1}`,
                            x: p.x,
                            z: p.z,
                            r: 0.9,
                            color: '#38bdf8',
                            details: 'Industrial plasma-ring pylon providing perimeter flank cover.',
                          })
                        );
                        pins.push({
                          id: 'lm_lockdown_beacon',
                          label: 'LOCKDOWN BEACON',
                          x: lm.chapter_1_helix.lockdownBeacon.x,
                          z: lm.chapter_1_helix.lockdownBeacon.z,
                          r: 0.95,
                          color: '#f59e0b',
                          details: 'Sector quarantine siren emitter mounted along the NW deck.',
                        });
                      } else if (activeChap === 'chapter_2_choir') {
                        lm.chapter_2_choir.harmonicOrgans.forEach((org, idx) =>
                          pins.push({
                            id: `lm_organ_${idx}`,
                            label: idx === 0 ? 'HARMONIC ORGAN WEST' : 'HARMONIC ORGAN EAST',
                            x: org.x,
                            z: org.z,
                            r: 1.35,
                            color: '#eab308',
                            details: 'Gilded acoustic pipe monument amplifying Choir resonance harmonics.',
                          })
                        );
                      } else if (activeChap === 'chapter_3_curator') {
                        lm.chapter_3_curator.archiveMonoliths.forEach((m, idx) =>
                          pins.push({
                            id: `lm_monolith_${idx}`,
                            label: `ARCHIVE MONOLITH 0${idx + 1}`,
                            x: m.x,
                            z: m.z,
                            r: 1.0,
                            color: '#c084fc',
                            details: 'Crystalline violet memory server tower lining the Curator Archive.',
                          })
                        );
                        pins.push({
                          id: 'lm_memory_slab',
                          label: 'MEMORY SLAB MONUMENT',
                          x: lm.chapter_3_curator.heroMemorySlab.x,
                          z: lm.chapter_3_curator.heroMemorySlab.z,
                          r: 1.0,
                          color: '#a855f7',
                          details: 'Hovering engraved data monolith storing redacted crew timelines.',
                        });
                        pins.push({
                          id: 'lm_ch3_holo',
                          label: 'TACTICAL HOLO-TABLE',
                          x: lm.chapter_3_curator.tacticalHoloTable.x,
                          z: lm.chapter_3_curator.tacticalHoloTable.z,
                          r: 1.15,
                          color: '#22d3ee',
                          details: 'Archive navigation command console projecting Nadir-9 orbital paths.',
                        });
                      } else if (activeChap === 'chapter_4_matron') {
                        lm.chapter_4_matron.stasisPods.forEach((pod, idx) =>
                          pins.push({
                            id: `lm_stasis_pod_${idx}`,
                            label: `STASIS POD 0${idx + 1}`,
                            x: pod.x,
                            z: pod.z,
                            r: 1.0,
                            color: '#fb7185',
                            details: 'Crimson cryo-containment chamber lining the Surgical Quarantine Wing.',
                          })
                        );
                        lm.chapter_4_matron.cryoMedTables.forEach((tbl, idx) =>
                          pins.push({
                            id: `lm_med_table_${idx}`,
                            label: idx === 0 ? 'CRYO MED-TABLE WEST' : 'CRYO MED-TABLE EAST',
                            x: tbl.x,
                            z: tbl.z,
                            r: 1.1,
                            color: '#f43f5e',
                            details: 'Surgical holo-scanner med-table flanking the south quarantine ward.',
                          })
                        );
                      } else if (activeChap === 'chapter_5_loom') {
                        lm.chapter_5_loom.sovereignSeals.forEach((seal, idx) =>
                          pins.push({
                            id: `lm_seal_${idx}`,
                            label: `SOVEREIGN SEAL 0${idx + 1}`,
                            x: seal.x,
                            z: seal.z,
                            r: 1.0,
                            color: '#eab308',
                            details: 'Gilded gyroscopic spire anchoring the Chronicle Loom containment field.',
                          })
                        );
                        lm.chapter_5_loom.convergencePillars.forEach((cp, idx) =>
                          pins.push({
                            id: `lm_conv_pillar_${idx}`,
                            label: idx === 0 ? 'CONVERGENCE PILLAR WEST' : 'CONVERGENCE PILLAR EAST',
                            x: cp.x,
                            z: cp.z,
                            r: 1.0,
                            color: '#38bdf8',
                            details: 'Dual-ring temporal stabilizer channeling cyan & gold phase arcs.',
                          })
                        );
                        pins.push({
                          id: 'lm_directive_core',
                          label: 'DIRECTIVE CORE ALTAR',
                          x: lm.chapter_5_loom.directiveCore.x,
                          z: lm.chapter_5_loom.directiveCore.z,
                          r: 1.75,
                          color: '#7dd3fc',
                          details: 'Tri-crystal Chronicle Loom centerpiece governing Nadir-9 timeline convergence.',
                        });
                      }
                      return pins.map((pin) => {
                        const selectPin = () =>
                          setSelectedMapNode({
                            id: pin.id,
                            kind: 'landmark',
                            label: pin.label,
                            x: pin.x,
                            z: pin.z,
                            statusLabel: 'SANCTUM LANDMARK',
                            details: pin.details,
                          });
                        const isSel = selectedMapNode?.id === pin.id;
                        const s = pin.r * 0.85;
                        return (
                          <polygon
                            key={pin.id}
                            data-testid={`map-landmark-${pin.id}`}
                            role="button"
                            tabIndex={0}
                            aria-label={`Inspect Landmark ${pin.label}`}
                            className="cursor-pointer"
                            onClick={selectPin}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                selectPin();
                              }
                            }}
                            points={`${pin.x},${pin.z - s} ${pin.x + s * 0.88},${pin.z - s * 0.45} ${pin.x + s * 0.88},${pin.z + s * 0.45} ${pin.x},${pin.z + s} ${pin.x - s * 0.88},${pin.z + s * 0.45} ${pin.x - s * 0.88},${pin.z - s * 0.45}`}
                            fill="rgba(15, 23, 42, 0.72)"
                            stroke={isSel ? '#ffffff' : pin.color}
                            strokeWidth={isSel ? '0.55' : '0.32'}
                          />
                        );
                      });
                    })()}

                    {/* Environmental Interactable Nodes */}
                    {exploration.interactables.map((node) => (
                      <rect
                        key={node.id}
                        data-testid={`map-interactable-${node.id}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`Inspect ${node.label}`}
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedMapNode({
                            id: node.id,
                            kind: 'interactable',
                            label: node.label,
                            x: node.x,
                            z: node.z,
                            statusLabel: node.status.toUpperCase(),
                            details:
                              node.id === 'int_ch4_quarantine_override_node' ||
                              node.id === 'int_ch5_temporal_anchor_conduit'
                                ? `${node.statusMessage} Bonus: Salvage +1 Memory Fragment on activation.`
                                : node.statusMessage,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedMapNode({
                              id: node.id,
                              kind: 'interactable',
                              label: node.label,
                              x: node.x,
                              z: node.z,
                              statusLabel: node.status.toUpperCase(),
                              details:
                                node.id === 'int_ch4_quarantine_override_node' ||
                                node.id === 'int_ch5_temporal_anchor_conduit'
                                  ? `${node.statusMessage} Bonus: Salvage +1 Memory Fragment on activation.`
                                  : node.statusMessage,
                            });
                          }
                        }}
                        x={node.x - 0.65}
                        y={node.z - 0.65}
                        width="1.3"
                        height="1.3"
                        fill={
                          node.status === 'activated'
                            ? '#34d399'
                            : node.status === 'locked'
                              ? '#f59e0b'
                              : '#38bdf8'
                        }
                        stroke={selectedMapNode?.id === node.id ? '#fbbf24' : '#020617'}
                        strokeWidth={selectedMapNode?.id === node.id ? '0.5' : '0.25'}
                      />
                    ))}

                    {/* Fragment Caches (Chronicle Expansion) */}
                    {(exploration.localMap.fragmentCaches ?? []).map((fc) => (
                      <polygon
                        key={fc.id}
                        data-testid={`map-cache-${fc.id}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`Inspect Fragment Cache ${fc.label}`}
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedMapNode({
                            id: fc.id,
                            kind: 'fragment_cache',
                            label: fc.label,
                            x: fc.x,
                            z: fc.z,
                            statusLabel: fc.claimed ? 'CLAIMED' : 'UNCLAIMED (+1 FRAG)',
                            details: fc.claimed
                              ? `${fc.crewAuthor} — “${fc.memoryExcerpt}”`
                              : `Approach or press [I] nearby to recover +1 Memory Fragment, Integrity & Chrono Flux (${fc.crewAuthor}).`,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedMapNode({
                              id: fc.id,
                              kind: 'fragment_cache',
                              label: fc.label,
                              x: fc.x,
                              z: fc.z,
                              statusLabel: fc.claimed ? 'CLAIMED' : 'UNCLAIMED (+1 FRAG)',
                              details: fc.claimed
                                ? `${fc.crewAuthor} — “${fc.memoryExcerpt}”`
                                : `Approach or press [I] nearby to recover +1 Memory Fragment, Integrity & Chrono Flux (${fc.crewAuthor}).`,
                            });
                          }
                        }}
                        points={`${fc.x},${fc.z - 1.15} ${fc.x + 1.15},${fc.z} ${fc.x},${fc.z + 1.15} ${fc.x - 1.15},${fc.z}`}
                        fill={fc.claimed ? '#10b981' : '#fbbf24'}
                        stroke={selectedMapNode?.id === fc.id ? '#ffffff' : '#020617'}
                        strokeWidth={selectedMapNode?.id === fc.id ? '0.5' : '0.28'}
                      />
                    ))}

                    {/* Sector Tactical Beacons (Chronicle Expansion) */}
                    {(exploration.localMap.sectorBeacons ?? []).map((sb) => (
                      <polygon
                        key={sb.id}
                        data-testid={`map-beacon-${sb.id}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`Inspect Sector Beacon ${sb.label}`}
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedMapNode({
                            id: sb.id,
                            kind: 'sector_beacon',
                            label: sb.label,
                            x: sb.x,
                            z: sb.z,
                            statusLabel: sb.cooldown <= 0 ? 'READY [I]' : `RECHARGING (${Math.ceil(sb.cooldown)}s)`,
                            details: `${sb.effectLabel} — ${sb.description}`,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedMapNode({
                              id: sb.id,
                              kind: 'sector_beacon',
                              label: sb.label,
                              x: sb.x,
                              z: sb.z,
                              statusLabel: sb.cooldown <= 0 ? 'READY [I]' : `RECHARGING (${Math.ceil(sb.cooldown)}s)`,
                              details: `${sb.effectLabel} — ${sb.description}`,
                            });
                          }
                        }}
                        points={`${sb.x},${sb.z - 1.3} ${sb.x + 1.12},${sb.z - 0.65} ${sb.x + 1.12},${sb.z + 0.65} ${sb.x},${sb.z + 1.3} ${sb.x - 1.12},${sb.z + 0.65} ${sb.x - 1.12},${sb.z - 0.65}`}
                        fill={sb.cooldown <= 0 ? '#22d3ee' : '#475569'}
                        stroke={selectedMapNode?.id === sb.id ? '#fbbf24' : '#020617'}
                        strokeWidth={selectedMapNode?.id === sb.id ? '0.5' : '0.28'}
                      />
                    ))}

                    {/* Live Temporal Anomaly Rift Marker */}
                    {(() => {
                      const activeRift =
                        exploration.localMap.temporalRift ?? radar?.temporalRift ?? temporalRift;
                      if (!activeRift) return null;
                      return (
                        <g
                          data-testid="map-temporal-rift"
                          role="button"
                          tabIndex={0}
                          aria-label={`Inspect Temporal Rift ${activeRift.label}`}
                          className="cursor-pointer"
                          onClick={() =>
                            setSelectedMapNode({
                              id: activeRift.id,
                              kind: 'hazard',
                              label: `TEMPORAL RIFT · ${activeRift.label}`,
                              x: activeRift.x,
                              z: activeRift.z,
                              statusLabel: `SEAL BEFORE ${activeRift.remainingTimer.toFixed(1)}S`,
                              details:
                                'Seal at <=2.4m or [I] for +28 Flux, +12 Integrity, and Surge; rupture heals hostiles.',
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedMapNode({
                                id: activeRift.id,
                                kind: 'hazard',
                                label: `TEMPORAL RIFT · ${activeRift.label}`,
                                x: activeRift.x,
                                z: activeRift.z,
                                statusLabel: `SEAL BEFORE ${activeRift.remainingTimer.toFixed(1)}S`,
                                details:
                                  'Seal at <=2.4m or [I] for +28 Flux, +12 Integrity, and Surge; rupture heals hostiles.',
                              });
                            }
                          }}
                        >
                          <circle
                            cx={activeRift.x}
                            cy={activeRift.z}
                            r={activeRift.radius}
                            fill="rgba(244, 63, 94, 0.16)"
                            stroke="#fb7185"
                            strokeWidth="0.4"
                            strokeDasharray="0.9 0.6"
                          />
                          <polygon
                            points={`${activeRift.x},${activeRift.z - 1.35} ${activeRift.x + 1.35},${activeRift.z} ${activeRift.x},${activeRift.z + 1.35} ${activeRift.x - 1.35},${activeRift.z}`}
                            fill="#a855f7"
                            stroke="#fdf4ff"
                            strokeWidth="0.32"
                          />
                        </g>
                      );
                    })()}

                    {/* v3.8.0: 3D Lysa Holo-Memory Astrolabe Projector Pin */}
                    {exploration.localMap.holoProjector && (() => {
                      const hp = exploration.localMap.holoProjector;
                      const selectHoloPin = () =>
                        setSelectedMapNode({
                          id: hp.id,
                          kind: 'landmark',
                          label: hp.label,
                          x: hp.x,
                          z: hp.z,
                          statusLabel: hp.discovered ? 'RECONSTRUCTED [I]' : 'READY TO PROJECT [I]',
                          details:
                            'Titanium-Brass Chrono Astrolabe emitter pad. Approach and press [I] to reconstruct Dr. Lysa Venn’s 3D Holo-Memory (+22 Flux, +16 HP, +12 Ward on first sync + permanent Holo Resonance).',
                        });
                      return (
                        <g
                          data-testid="map-holo-projector"
                          data-discovered={hp.discovered ? 'true' : 'false'}
                          role="button"
                          tabIndex={0}
                          aria-label={`Inspect Lysa Holo-Memory Projector ${hp.label}`}
                          className="cursor-pointer"
                          onClick={selectHoloPin}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              selectHoloPin();
                            }
                          }}
                        >
                          <circle
                            cx={hp.x}
                            cy={hp.z}
                            r="1.55"
                            fill="rgba(56, 189, 248, 0.16)"
                            stroke={hp.discovered ? '#34d399' : '#38bdf8'}
                            strokeWidth="0.35"
                            strokeDasharray="0.8 0.5"
                          />
                          <polygon
                            points={`${hp.x},${hp.z - 1.15} ${hp.x + 1.15},${hp.z} ${hp.x},${hp.z + 1.15} ${hp.x - 1.15},${hp.z}`}
                            fill={hp.discovered ? '#10b981' : '#38bdf8'}
                            stroke={selectedMapNode?.id === hp.id ? '#fbbf24' : '#fde68a'}
                            strokeWidth={selectedMapNode?.id === hp.id ? '0.5' : '0.28'}
                          />
                        </g>
                      );
                    })()}

                    {/* Main Objective Marker */}
                    {exploration.localMap.objectiveTarget && (
                      <polygon
                        data-testid="map-objective-marker"
                        points={`${exploration.localMap.objectiveTarget.x},${exploration.localMap.objectiveTarget.z - 1.2} ${exploration.localMap.objectiveTarget.x + 1.2},${exploration.localMap.objectiveTarget.z} ${exploration.localMap.objectiveTarget.x},${exploration.localMap.objectiveTarget.z + 1.2} ${exploration.localMap.objectiveTarget.x - 1.2},${exploration.localMap.objectiveTarget.z}`}
                        fill="#f59e0b"
                        stroke="#ffffff"
                        strokeWidth="0.3"
                      />
                    )}

                    {/* Live Tactical Hostiles & Boss Blips */}
                    {radar?.blips.map((blip) => {
                      if (blip.kind === 'interactable') return null;
                      return (
                        <g key={blip.id} data-testid="map-radar-blip" data-blip-kind={blip.kind}>
                          {blip.kind === 'boss' ? (
                            <>
                              <circle cx={blip.x} cy={blip.z} r="1.75" fill="none" stroke="#f59e0b" strokeWidth="0.4" />
                              <polygon
                                points={`${blip.x},${blip.z - 1.3} ${blip.x + 1.3},${blip.z} ${blip.x},${blip.z + 1.3} ${blip.x - 1.3},${blip.z}`}
                                fill="#ef4444"
                              />
                            </>
                          ) : blip.kind === 'staggered' ? (
                            <rect
                              x={blip.x - 0.95}
                              y={blip.z - 0.95}
                              width="1.9"
                              height="1.9"
                              fill="#fbbf24"
                              stroke="#ffffff"
                              strokeWidth="0.28"
                            />
                          ) : (
                            <circle
                              cx={blip.x}
                              cy={blip.z}
                              r={blip.kind === 'telegraph' ? 1.05 : 0.82}
                              fill={blip.kind === 'telegraph' ? '#f97316' : '#fb7185'}
                            />
                          )}
                        </g>
                      );
                    })}

                    {/* Active Chrono Echo Hologram Marker */}
                    {radar?.echoActive && radar.echoX !== null && radar.echoZ !== null && (
                      <g data-testid="map-echo-marker" transform={`translate(${radar.echoX}, ${radar.echoZ})`}>
                        <circle cx="0" cy="0" r="1.45" fill="none" stroke="#38bdf8" strokeWidth="0.38" />
                        <circle cx="0" cy="0" r="0.78" fill="#bae6fd" />
                      </g>
                    )}

                    {/* Active Tactical Waypoint Beacon */}
                    {(exploration.localMap.waypoint ?? radar?.waypoint) && (
                      (() => {
                        const wp = (exploration.localMap.waypoint ?? radar?.waypoint)!;
                        return (
                          <g data-testid="map-waypoint-marker">
                            <line
                              x1={exploration.localMap.playerX}
                              y1={exploration.localMap.playerZ}
                              x2={wp.x}
                              y2={wp.z}
                              stroke="#fbbf24"
                              strokeWidth="0.45"
                              strokeDasharray="1.1 0.8"
                            />
                            <circle
                              cx={wp.x}
                              cy={wp.z}
                              r="1.9"
                              fill="none"
                              stroke="#fbbf24"
                              strokeWidth="0.45"
                            />
                            <polygon
                              points={`${wp.x},${wp.z - 1.25} ${wp.x + 1.25},${wp.z} ${wp.x},${wp.z + 1.25} ${wp.x - 1.25},${wp.z}`}
                              fill="#fbbf24"
                              stroke="#22d3ee"
                              strokeWidth="0.32"
                            />
                          </g>
                        );
                      })()
                    )}

                    {/* Sera Venn Live Position, Camera Cone & Facing Marker */}
                    <g
                      data-testid="map-player-marker"
                      transform={`translate(${exploration.localMap.playerX}, ${exploration.localMap.playerZ})`}
                    >
                      {radar && (
                        <polygon
                          points={`0,0 ${Math.sin(radar.aimYaw - 0.42) * 8.5},${Math.cos(radar.aimYaw - 0.42) * 8.5} ${Math.sin(radar.aimYaw + 0.42) * 8.5},${Math.cos(radar.aimYaw + 0.42) * 8.5}`}
                          fill="rgba(34, 211, 238, 0.10)"
                        />
                      )}
                      <circle cx="0" cy="0" r="1.05" fill="#22d3ee" stroke="#ffffff" strokeWidth="0.35" />
                      <line
                        x1="0"
                        y1="0"
                        x2={Math.sin(exploration.localMap.playerRotationY) * 2.1}
                        y2={Math.cos(exploration.localMap.playerRotationY) * 2.1}
                        stroke="#ffffff"
                        strokeWidth="0.45"
                      />
                    </g>
                  </svg>

                  {/* Compact Legend */}
                  <div className="w-full flex flex-wrap items-center justify-between gap-1 text-[8px] font-mono-tabular uppercase text-slate-400 mt-1.5 pt-1 border-t border-slate-800/80">
                    <span className="text-cyan-300">● SERA</span>
                    <span className="text-sky-300">◎ ECHO</span>
                    <span className="text-rose-400">● HOSTILE</span>
                    <span className="text-amber-300">◆ CAP / OBJ</span>
                    <span className="text-cyan-200">▲ BOOST</span>
                    <span className="text-purple-300">⬡ LANDMARK</span>
                    <span className="text-emerald-300">━ ROUTE</span>
                  </div>

                  {/* Phase 21: Sector Checkpoint & Armory Cache Status */}
                  <div
                    data-testid="map-checkpoint-armory-status"
                    className="w-full mt-1.5 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[8px] font-mono-tabular uppercase text-slate-300"
                  >
                    <span>
                      CHECKPOINT:{' '}
                      <strong className="text-cyan-300">
                        {bossCheckpoint
                          ? `${(bossCheckpoint.chapter ?? chapter ?? 'prologue').toUpperCase()} (${bossCheckpoint.integrity} HP)`
                          : 'SECTOR ENTRY ANCHOR'}
                      </strong>
                    </span>
                    <span>
                      ARMORY:{' '}
                      <strong className="text-emerald-300">
                        {(progression?.unlockedWeaponIds ?? ['chrono_edge', 'pulsecaster']).length}/4 UNLOCKED
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Right Column: Tactical Node Inspector, Traversal Routes, Timed Hazards & Secrets */}
                <div className="sm:col-span-7 space-y-2">
                  {/* Tactical Node Inspector & Waypoint Beacon Controls */}
                  {(() => {
                    const activeWp = exploration.localMap.waypoint ?? radar?.waypoint ?? null;
                    const distMeters = selectedMapNode
                      ? Math.hypot(
                          selectedMapNode.x - exploration.localMap.playerX,
                          selectedMapNode.z - exploration.localMap.playerZ
                        )
                      : activeWp
                        ? Math.hypot(
                            activeWp.x - exploration.localMap.playerX,
                            activeWp.z - exploration.localMap.playerZ
                          )
                        : null;
                    return (
                      <div
                        data-testid="map-node-inspector"
                        className="bg-[#09121e] border border-cyan-500/45 p-2.5 space-y-1.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] font-mono-tabular uppercase tracking-wider text-cyan-300 font-bold">
                            TACTICAL NODE INSPECTOR
                          </span>
                          {selectedMapNode ? (
                            <span className="text-[8px] font-mono-tabular font-bold uppercase px-1.5 py-0.5 border border-amber-400/60 text-amber-300">
                              {selectedMapNode.kind.replace('_', ' ')} · {selectedMapNode.statusLabel}
                            </span>
                          ) : activeWp ? (
                            <span className="text-[8px] font-mono-tabular font-bold uppercase px-1.5 py-0.5 border border-amber-400/70 bg-amber-500/15 text-amber-200">
                              ACTIVE WP · {distMeters?.toFixed(1)}M
                            </span>
                          ) : (
                            <span className="text-[8px] font-mono-tabular uppercase text-slate-400">
                              CLICK SCHEMATIC NODE
                            </span>
                          )}
                        </div>

                        {selectedMapNode ? (
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-tabular">
                              <span className="font-bold text-slate-100">{selectedMapNode.label}</span>
                              <span className="text-cyan-300">
                                ({selectedMapNode.x.toFixed(1)}, {selectedMapNode.z.toFixed(1)}) ·{' '}
                                {distMeters?.toFixed(1)}M AWAY
                              </span>
                            </div>
                            <p className="text-[9px] font-mono-tabular text-slate-300 leading-snug">
                              {selectedMapNode.details}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <button
                                type="button"
                                data-testid="map-set-waypoint-btn"
                                onClick={() =>
                                  onSetTacticalWaypoint?.({
                                    id: selectedMapNode.id,
                                    kind: selectedMapNode.kind,
                                    label: selectedMapNode.label,
                                    x: selectedMapNode.x,
                                    z: selectedMapNode.z,
                                  })
                                }
                                className="px-2.5 py-1 text-[9px] font-mono-tabular font-bold uppercase tracking-wider bg-amber-400 hover:bg-amber-300 border border-amber-300 text-slate-950 cursor-pointer transition-colors"
                              >
                                {activeWp?.id === selectedMapNode.id
                                  ? 'WAYPOINT LOCKED'
                                  : 'SET TACTICAL WAYPOINT'}
                              </button>
                              {activeWp && (
                                <button
                                  type="button"
                                  data-testid="map-clear-waypoint-btn"
                                  onClick={() => onSetTacticalWaypoint?.(null)}
                                  className="px-2 py-1 text-[9px] font-mono-tabular font-bold uppercase tracking-wider bg-[#101927] hover:bg-[#19273c] border border-slate-600 text-slate-200 cursor-pointer transition-colors"
                                >
                                  CLEAR WAYPOINT
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-[9px] font-mono-tabular text-slate-300 leading-snug">
                              Select any Boost Pad, Chrono-Capacitor, Route, Hazard, Conduit, or Alcove on the schematic to inspect telemetry and project a 3D Tactical Waypoint beacon.
                            </p>
                            {activeWp && (
                              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[9px] font-mono-tabular">
                                <span className="text-amber-200 font-bold truncate">
                                  LOCKED: {activeWp.label} ({distMeters?.toFixed(1)}M)
                                </span>
                                <button
                                  type="button"
                                  data-testid="map-clear-waypoint-btn"
                                  onClick={() => onSetTacticalWaypoint?.(null)}
                                  className="px-2 py-0.5 text-[9px] font-mono-tabular font-bold uppercase bg-[#101927] hover:bg-[#19273c] border border-slate-600 text-slate-200 cursor-pointer shrink-0"
                                >
                                  CLEAR WAYPOINT
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Traversal Routes */}
                  <div className="bg-[#0a1019] border border-slate-800/90 p-2.5 space-y-1.5">
                    <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-cyan-300 font-bold">
                      SECTOR TRAVERSAL ROUTES & GATES
                    </div>
                    {exploration.localMap.routes.map((rt) => (
                      <div
                        key={rt.id}
                        data-testid={`map-route-card-${rt.id}`}
                        data-route-status={rt.status}
                        className="p-1.5 bg-[#070b12] border border-slate-800 flex flex-col gap-0.5"
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[10px] font-mono-tabular font-bold text-slate-100">
                            {rt.label}
                          </span>
                          <span
                            className={`text-[8px] font-mono-tabular font-bold uppercase px-1.5 py-0.5 border ${
                              rt.status === 'open'
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                                : rt.status === 'powered'
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                                  : 'bg-rose-500/15 border-rose-500/60 text-rose-300'
                            }`}
                          >
                            {rt.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[9px] font-mono-tabular text-slate-400">
                          {rt.statusMessage}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Timed Energy Passages */}
                  {exploration.localMap.hazards.length > 0 && (
                    <div className="bg-[#0a1019] border border-slate-800/90 p-2.5 space-y-1.5">
                      <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-amber-300 font-bold">
                        TIMED ENERGY PASSAGES
                      </div>
                      {exploration.localMap.hazards.map((hz) => (
                        <div
                          key={hz.id}
                          data-testid={`map-hazard-card-${hz.id}`}
                          className="p-1.5 bg-[#070b12] border border-slate-800 flex items-center justify-between gap-2 text-[9px] font-mono-tabular"
                        >
                          <div>
                            <div className="text-slate-200 font-bold">{hz.label}</div>
                            <div className="text-slate-400">
                              CYCLE: {hz.safeDuration.toFixed(1)}s SAFE / {hz.warningDuration.toFixed(1)}s WARN / {hz.activeDuration.toFixed(1)}s ARC ({hz.damage} DMG)
                            </div>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 border font-bold uppercase shrink-0 ${
                              hz.phase === 'active'
                                ? 'bg-red-500/20 border-red-400 text-red-300'
                                : hz.phase === 'warning'
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                                  : 'bg-cyan-500/15 border-cyan-400 text-cyan-300'
                            }`}
                          >
                            {hz.phase.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Secret Exploration Areas (Fog-of-Discovery Protected) */}
                  <div className="bg-[#0a1019] border border-slate-800/90 p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-[10px] font-mono-tabular uppercase tracking-wider text-emerald-300 font-bold">
                      <span>SECRET EXPLORATION ALCOVES</span>
                      <span className="text-slate-400">
                        CAMPAIGN: {exploration.localMap.totalDiscoveredSecretsCampaign}/{exploration.localMap.totalSecretsCampaign}
                      </span>
                    </div>
                    {exploration.localMap.secrets.length === 0 ? (
                      <div className="text-[10px] font-mono-tabular text-slate-400">
                        No hidden alcoves indexed in this sector.
                      </div>
                    ) : (
                      exploration.localMap.secrets.map((sec) => (
                        <div
                          key={sec.id}
                          data-testid={`map-secret-${sec.id}`}
                          data-discovered={sec.discovered ? 'true' : 'false'}
                          data-accessible={sec.accessible ? 'true' : 'false'}
                          className={`p-2 border ${
                            sec.discovered
                              ? 'bg-[#081715] border-emerald-400/80'
                              : sec.accessible
                                ? 'bg-[#0b1420] border-cyan-400/70'
                                : 'bg-[#070b12] border-slate-800/90'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono-tabular font-bold text-slate-100">
                              {sec.discovered
                                ? sec.title
                                : 'UNINDEXED SECTOR SIGNAL · FOG OF DISCOVERY'}
                            </span>
                            <span
                              className={`text-[8px] font-mono-tabular font-bold uppercase px-1.5 py-0.5 border ${
                                sec.discovered
                                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                                  : sec.accessible
                                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                                    : 'bg-slate-900 border-slate-700 text-slate-400'
                              }`}
                            >
                              {sec.discovered
                                ? 'DISCOVERED'
                                : sec.accessible
                                  ? 'ROUTE OPEN · ENTER ALCOVE'
                                  : 'SEALED'}
                            </span>
                          </div>
                          <div className="text-[9px] font-mono-tabular text-slate-300 mt-0.5">
                            {sec.discovered
                              ? `${sec.subtitle} · ${sec.rewardSummary}`
                              : sec.accessible
                                ? 'Bypass route unsealed. Traverse outer perimeter alcove to uncover cache.'
                                : 'Unseal the sector bypass route to clear fog-of-discovery.'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Chronicle Expansion: Arena Fragment Caches & Sector Tactical Beacons */}
                  {((exploration.localMap.fragmentCaches?.length ?? 0) > 0 ||
                    (exploration.localMap.sectorBeacons?.length ?? 0) > 0) && (
                    <div
                      data-testid="map-caches-beacons-panel"
                      className="bg-[#0a1019] border border-slate-800/90 p-2.5 space-y-2"
                    >
                      {(exploration.localMap.fragmentCaches?.length ?? 0) > 0 && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2 text-[10px] font-mono-tabular uppercase tracking-wider text-amber-300 font-bold">
                            <span>ARENA FRAGMENT CACHES</span>
                            <span className="text-slate-400">
                              {exploration.localMap.fragmentCaches!.filter((c) => c.claimed).length}/
                              {exploration.localMap.fragmentCaches!.length} CLAIMED
                            </span>
                          </div>
                          {exploration.localMap.fragmentCaches!.map((fc) => (
                            <div
                              key={fc.id}
                              data-testid={`map-cache-card-${fc.id}`}
                              data-claimed={fc.claimed ? 'true' : 'false'}
                              className={`p-1.5 border text-[9px] font-mono-tabular ${
                                fc.claimed
                                  ? 'bg-[#081715] border-emerald-500/50'
                                  : 'bg-[#070b12] border-amber-500/45'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-slate-100">{fc.label}</span>
                                <span
                                  className={`px-1.5 py-0.5 border font-bold uppercase ${
                                    fc.claimed
                                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                                      : 'bg-amber-500/20 border-amber-400 text-amber-200'
                                  }`}
                                >
                                  {fc.claimed ? 'CLAIMED' : '+1 FRAG · READY'}
                                </span>
                              </div>
                              <div className="text-slate-300 mt-0.5">
                                {fc.claimed
                                  ? `${fc.crewAuthor}: “${fc.memoryExcerpt}”`
                                  : `Coordinates (${fc.x.toFixed(1)}, ${fc.z.toFixed(1)}) · Approach or press [I] to salvage`}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {(exploration.localMap.sectorBeacons?.length ?? 0) > 0 && (
                        <div className="space-y-1 pt-1 border-t border-slate-800/80">
                          <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-cyan-300 font-bold">
                            SECTOR TACTICAL BEACONS [I]
                          </div>
                          {exploration.localMap.sectorBeacons!.map((sb) => (
                            <div
                              key={sb.id}
                              data-testid={`map-beacon-card-${sb.id}`}
                              className="p-1.5 bg-[#070b12] border border-cyan-500/40 flex items-center justify-between gap-2 text-[9px] font-mono-tabular"
                            >
                              <div>
                                <div className="text-slate-100 font-bold">
                                  {sb.label} · <span className="text-cyan-300">{sb.effectLabel}</span>
                                </div>
                                <div className="text-slate-400">{sb.description}</div>
                              </div>
                              <span
                                className={`px-1.5 py-0.5 border font-bold uppercase shrink-0 ${
                                  sb.cooldown <= 0
                                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                                    : 'bg-slate-900 border-slate-700 text-slate-400'
                                }`}
                              >
                                {sb.cooldown <= 0 ? 'READY' : `${Math.ceil(sb.cooldown)}s`}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : activeExplorationTab === 'holo' ? (
              (() => {
                const discoveredHoloIds = exploration.discoveredHoloMemoryIds ?? [];
                const holoResonance = computeHoloMemoryResonanceBonus(discoveredHoloIds);
                const stanceMods = computeStanceDoctrineModifiers(exploration.resolvedStoryChoices);
                const activeHolo =
                  LYSA_HOLO_MEMORIES.find((m) => m.id === selectedModalHoloId) ??
                  LYSA_HOLO_MEMORIES.find((m) => m.chapter === chapter) ??
                  LYSA_HOLO_MEMORIES[0];
                const isHoloDiscovered = discoveredHoloIds.includes(activeHolo.id);

                return (
                  <div data-testid="modal-holo-theater-view" className="space-y-2.5">
                    {/* Causal Stance Alignment + Holo-Memory Resonance Header Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="bg-[#08101a] border border-slate-800 p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-[10px] font-mono-tabular font-bold text-cyan-300">
                          <span>{t(locale, 'stanceAlignmentTitle')}</span>
                          <span className="text-slate-400">{stanceMods.totalResolved}/6</span>
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

                      <div className="bg-[#08101a] border border-cyan-500/40 p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-[10px] font-mono-tabular font-bold">
                          <span className="text-cyan-300">{t(locale, 'holoResonanceTitle')}</span>
                          <span
                            data-testid="modal-holo-resonance-count"
                            className="text-emerald-300"
                          >
                            {holoResonance.discoveredCount} / {holoResonance.totalCount}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-snug">
                          {holoResonance.discoveredCount > 0
                            ? locale === 'vi'
                              ? `+${Math.round((holoResonance.allDamageMult - 1) * 100)}% Sát Thương Toàn Phần · +${holoResonance.bonusMaxWard} Giáp Chrono Tối Đa`
                              : `+${Math.round((holoResonance.allDamageMult - 1) * 100)}% Outgoing Damage · +${holoResonance.bonusMaxWard} Max Chrono Ward`
                            : t(locale, 'holoResonanceInactive')}
                        </p>
                      </div>
                    </div>

                    {/* 6-Act Lysa Holo-Memory Selector & Bilingual Transcript */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <div className="sm:col-span-4 space-y-1">
                        {LYSA_HOLO_MEMORIES.map((mem, idx) => {
                          const unlocked = discoveredHoloIds.includes(mem.id);
                          const selected = activeHolo.id === mem.id;
                          return (
                            <button
                              key={mem.id}
                              type="button"
                              data-testid={`modal-holo-entry-${mem.id}`}
                              data-discovered={unlocked ? 'true' : 'false'}
                              onClick={() => setSelectedModalHoloId(mem.id)}
                              className={`w-full text-left px-2.5 py-1.5 border text-[10px] font-mono-tabular transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                                selected
                                  ? 'bg-cyan-400/20 border-cyan-300 text-cyan-100'
                                  : unlocked
                                    ? 'bg-[#091422] border-emerald-500/45 text-emerald-200 hover:bg-[#102036]'
                                    : 'bg-[#070b12] border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <span className="truncate font-bold">
                                {unlocked
                                  ? locale === 'vi'
                                    ? mem.titleVi
                                    : mem.titleEn
                                  : `HOLO-0${idx + 1} · ${getLocalizedChapterLabel(mem.chapter, locale)}`}
                              </span>
                              <span className="shrink-0 text-[9px]">
                                {unlocked ? 'SYNCED' : 'LOCKED'}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div
                        data-testid="modal-holo-detail-card"
                        data-holo-id={activeHolo.id}
                        data-discovered={isHoloDiscovered ? 'true' : 'false'}
                        className="sm:col-span-8 bg-[#070c14] border border-slate-800 p-3 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-tabular text-slate-400 border-b border-slate-800/90 pb-1.5">
                          <span>
                            {activeHolo.loopCode} · {activeHolo.timestampLabel} ·{' '}
                            {locale === 'vi' ? activeHolo.locationVi : activeHolo.locationEn}
                          </span>
                          <span className={isHoloDiscovered ? 'text-emerald-300 font-bold' : 'text-amber-300'}>
                            {isHoloDiscovered
                              ? locale === 'vi'
                                ? 'ĐÃ TÁI HIỆN 3D'
                                : '3D RECONSTRUCTED'
                              : `X ${activeHolo.x.toFixed(1)} · Z ${activeHolo.z.toFixed(1)}`}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-display font-bold text-slate-100">
                          {isHoloDiscovered
                            ? locale === 'vi'
                              ? activeHolo.titleVi
                              : activeHolo.titleEn
                            : locale === 'vi'
                              ? 'TÍN HIỆU KÝ ỨC HOLO CHƯA KÍCH HOẠT'
                              : 'UNDISCOVERED LYSA HOLO-MEMORY PROJECTOR'}
                        </h4>

                        {isHoloDiscovered ? (
                          <>
                            <div className="space-y-1.5 text-[11px] leading-snug">
                              {activeHolo.beats.map((b, idx) => (
                                <div
                                  key={idx}
                                  className="bg-[#0a1322] border border-slate-800/80 px-2.5 py-1.5"
                                >
                                  <div className="text-[9px] font-mono-tabular text-cyan-300 font-bold mb-0.5">
                                    {locale === 'vi' ? b.speakerVi : b.speakerEn} ·{' '}
                                    <span className="text-amber-200/85 font-normal">
                                      {locale === 'vi' ? b.roleVi : b.roleEn}
                                    </span>
                                  </div>
                                  <p className="text-slate-200">
                                    “{locale === 'vi' ? b.lineVi : b.lineEn}”
                                  </p>
                                </div>
                              ))}
                            </div>
                            <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-emerald-300/95">
                              {locale === 'vi' ? activeHolo.summaryVi : activeHolo.summaryEn}
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2 text-xs text-slate-300">
                            <p>{t(locale, 'holoLockedHint')}</p>
                            {activeHolo.chapter === chapter && onSetTacticalWaypoint && (
                              <button
                                type="button"
                                data-testid="modal-holo-set-waypoint-btn"
                                onClick={() =>
                                  onSetTacticalWaypoint({
                                    kind: 'landmark',
                                    id: activeHolo.id,
                                    label: activeHolo.loopCode,
                                    x: activeHolo.x,
                                    z: activeHolo.z,
                                  })
                                }
                                className="px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-400 text-cyan-200 cursor-pointer"
                              >
                                {locale === 'vi'
                                  ? `ĐẶT ĐIỂM ĐỊNH VỊ (${activeHolo.x.toFixed(1)}, ${activeHolo.z.toFixed(1)})`
                                  : `SET SECTOR WAYPOINT (${activeHolo.x.toFixed(1)}, ${activeHolo.z.toFixed(1)})`}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : activeExplorationTab === 'mastery' ? (
              <MasteryLedgerPanel
                variant="modal"
                locale={locale}
                combatMastery={progression?.combatMastery}
                onClaimMasteryBounty={onClaimMasteryBounty}
                onClaimAllMasteryBounties={onClaimAllMasteryBounties}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div
                  data-testid="codex-entry-list"
                  className="sm:col-span-5 space-y-1 max-h-52 overflow-y-auto pr-1"
                >
                  {exploration.codexEntries.map((entry) => {
                    const isSelected = selectedCodexId === entry.id;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        data-testid={`codex-entry-btn-${entry.id}`}
                        data-discovered={entry.discovered ? 'true' : 'false'}
                        onClick={() => setSelectedCodexId(entry.id)}
                        className={`w-full text-left px-2.5 py-1.5 border transition-colors cursor-pointer flex items-center justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-[#102033] border-cyan-400 text-white'
                            : entry.discovered
                              ? 'bg-[#0b121c] hover:bg-[#111c2b] border-slate-700 text-slate-200'
                              : 'bg-[#080c12] hover:bg-[#0d131d] border-slate-800/80 text-slate-500'
                        }`}
                      >
                        <div className="truncate">
                          <div className="text-[9px] font-mono-tabular uppercase text-cyan-400">
                            {entry.id}
                          </div>
                          <div className="text-[10px] font-mono-tabular font-semibold truncate">
                            {entry.discovered ? entry.title : 'ENCRYPTED RECORD'}
                          </div>
                        </div>
                        <span
                          className={`text-[8px] font-mono-tabular uppercase px-1 py-0.5 border shrink-0 ${
                            entry.discovered
                              ? 'border-emerald-400/60 text-emerald-300'
                              : 'border-slate-700 text-slate-500'
                          }`}
                        >
                          {entry.discovered ? 'DECRYPTED' : 'LOCKED'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {(() => {
                  const activeEntry =
                    exploration.codexEntries.find((e) => e.id === selectedCodexId) ??
                    exploration.codexEntries[0];
                  if (!activeEntry) return null;
                  const isAudioPlaying = playingCodexAudioId === activeEntry.id;
                  const codecProfile = computeCommsCodecProfile(
                    activeEntry.author || activeEntry.title,
                    activeEntry.categoryLabel || activeEntry.category,
                    isAudioPlaying ? codexAudioPhase : 1.8,
                    1.8,
                    Boolean(cameraSettings.reducedMotion)
                  );
                  return (
                    <div
                      data-testid="codex-entry-reader"
                      data-entry-id={activeEntry.id}
                      data-entry-discovered={activeEntry.discovered ? 'true' : 'false'}
                      className="sm:col-span-7 bg-[#0a1019] border border-slate-800/90 p-3 flex flex-col justify-between gap-2.5"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 text-[9px] font-mono-tabular uppercase text-amber-300 mb-1">
                          <span>{activeEntry.id} · {activeEntry.categoryLabel || activeEntry.category}</span>
                          <span className="text-slate-400 truncate">{activeEntry.locationTag}</span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-display font-bold uppercase tracking-wide text-slate-100 mb-0.5">
                          {activeEntry.title}
                        </h3>
                        <div className="text-[10px] font-mono-tabular text-cyan-300 mb-2">
                          {activeEntry.subtitle}
                        </div>
                        <div className="flex items-center justify-between gap-2 px-2 py-1.5 mb-2.5 bg-[#070b12] border border-slate-800">
                          <div className="flex items-center gap-2 min-w-0">
                            <svg
                              data-testid="codex-audio-waveform"
                              width="34"
                              height="16"
                              viewBox="0 0 34 16"
                              className="shrink-0"
                              aria-hidden="true"
                            >
                              {codecProfile.bars.map((bar, barIdx) => {
                                const h = Math.max(2, Math.round((isAudioPlaying ? bar : 0.25 + (barIdx % 3) * 0.15) * 14));
                                const y = Math.round((16 - h) / 2);
                                return (
                                  <rect
                                    key={barIdx}
                                    x={barIdx * 5}
                                    y={y}
                                    width="3"
                                    height={h}
                                    fill={isAudioPlaying ? codecProfile.accentHex : activeEntry.discovered ? '#64748b' : '#334155'}
                                  />
                                );
                              })}
                            </svg>
                            <span className="text-[9px] font-mono-tabular uppercase tracking-wider text-slate-400 truncate">
                              {activeEntry.discovered ? `${codecProfile.channelCode} · ${codecProfile.frequencyLabel}` : 'ENCRYPTED STREAM'}
                            </span>
                          </div>
                          <button
                            type="button"
                            data-testid="codex-audio-play-btn"
                            disabled={!activeEntry.discovered}
                            onClick={() =>
                              handleToggleCodexAudio(
                                activeEntry.id,
                                activeEntry.author || activeEntry.title,
                                activeEntry.categoryLabel || activeEntry.category
                              )
                            }
                            className={`px-2 py-0.5 text-[9px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors shrink-0 ${
                              !activeEntry.discovered
                                ? 'bg-[#080c12] border-slate-800 text-slate-600 cursor-not-allowed'
                                : isAudioPlaying
                                  ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 cursor-pointer'
                                  : 'bg-[#0c1624] hover:bg-[#132238] border-cyan-500/60 text-cyan-300 cursor-pointer'
                            }`}
                          >
                            {!activeEntry.discovered
                              ? 'LOCKED'
                              : isAudioPlaying
                                ? 'STOP TRACE'
                                : 'PLAY AUDIO LOG'}
                          </button>
                        </div>
                        <div className="space-y-1.5 text-[11px] text-slate-200 leading-relaxed">
                          {(Array.isArray(activeEntry.body)
                            ? activeEntry.body
                            : [String(activeEntry.body)]
                          ).map((para, pIdx) => (
                            <p key={pIdx}>{para}</p>
                          ))}
                        </div>
                      </div>
                      {activeEntry.tacticalNote && (
                        <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono-tabular text-emerald-300/95">
                          <span className="font-bold uppercase tracking-wider">TACTICAL NOTE: </span>
                          <span>{activeEntry.tacticalNote}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

          {/* SECTION 4: CONSOLIDATED SYSTEM SETTINGS (Visible on Pause Screen) */}
          {isPaused && (() => {
            const gfx = resolveGraphicsSettings(cameraSettings);
            return (
            <div
              className={
                activeModalSection === 'settings'
                  ? 'bg-[#070a0f] border border-slate-800/90 p-3.5 space-y-3'
                  : 'sr-only'
              }
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] font-mono-tabular uppercase tracking-widest text-cyan-400 font-semibold">
                  GRAPHICS, PERFORMANCE & SYSTEM SETTINGS
                </div>
                <span
                  data-testid="modal-setting-preset-active"
                  className="text-[10px] font-mono-tabular uppercase px-1.5 py-0.5 bg-[#0d1522] border border-cyan-500/40 text-cyan-300 font-bold"
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

              {/* Graphics & Performance Optimization Controls */}
              <div className="bg-[#0a1019] border border-slate-800/90 p-2.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-mono-tabular uppercase tracking-wider text-slate-300">
                    QUALITY PRESET
                  </span>
                  <div className="flex flex-wrap gap-1.5">
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
                          data-testid={`modal-setting-preset-${preset.id}`}
                          aria-pressed={active}
                          onClick={() =>
                            onUpdateCameraSettings({ graphicsPreset: preset.id })
                          }
                          className={`px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase border transition-colors cursor-pointer ${
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono-tabular">
                  {/* Render Scale */}
                  <div className="flex items-center justify-between gap-2 bg-[#070b12] border border-slate-800/90 px-2.5 py-1.5">
                    <span className="text-slate-300 uppercase">RENDER SCALE</span>
                    <div className="flex gap-1">
                      {RENDER_SCALE_OPTIONS.map((scale) => {
                        const active = Math.abs(gfx.renderScale - scale) < 0.02;
                        return (
                          <button
                            key={scale}
                            type="button"
                            data-testid={`modal-setting-render-scale-${scale}`}
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

                  {/* FPS Cap */}
                  <div className="flex items-center justify-between gap-2 bg-[#070b12] border border-slate-800/90 px-2.5 py-1.5">
                    <span className="text-slate-300 uppercase">FPS CAP</span>
                    <div className="flex gap-1">
                      {FPS_LIMIT_OPTIONS.map((cap) => {
                        const active = gfx.fpsLimit === cap;
                        return (
                          <button
                            key={cap}
                            type="button"
                            data-testid={`modal-setting-fps-${cap}`}
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

                  {/* Shadows */}
                  <div className="flex items-center justify-between gap-2 bg-[#070b12] border border-slate-800/90 px-2.5 py-1.5">
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
                            data-testid={`modal-setting-shadows-${opt.id}`}
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

                  {/* VFX / Particles */}
                  <div className="flex items-center justify-between gap-2 bg-[#070b12] border border-slate-800/90 px-2.5 py-1.5">
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
                            data-testid={`modal-setting-particles-${opt.id}`}
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

                  {/* Lighting Quality */}
                  <div className="flex items-center justify-between gap-2 bg-[#070b12] border border-slate-800/90 px-2.5 py-1.5">
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
                            data-testid={`modal-setting-lighting-${opt.id}`}
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

                  {/* FPS & Latency HUD [F3] */}
                  <button
                    type="button"
                    data-testid="modal-setting-perf-hud"
                    aria-pressed={gfx.showPerfHud}
                    onClick={() =>
                      onUpdateCameraSettings({ showPerfHud: !gfx.showPerfHud })
                    }
                    className="flex items-center justify-between px-2.5 py-1.5 bg-[#070b12] hover:bg-[#131d2d] border border-slate-800/90 cursor-pointer"
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

                  {/* Adaptive 60 FPS Governor */}
                  <button
                    type="button"
                    data-testid="modal-setting-adaptive-fps"
                    aria-pressed={gfx.adaptiveResolution}
                    title={t(locale, 'adaptiveFpsDesc')}
                    onClick={() =>
                      onUpdateCameraSettings({
                        adaptiveResolution: !gfx.adaptiveResolution,
                      })
                    }
                    className="flex items-center justify-between px-2.5 py-1.5 bg-[#070b12] hover:bg-[#131d2d] border border-slate-800/90 cursor-pointer"
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
                  <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 bg-[#070b12] border border-slate-800/90 text-[10px] font-mono-tabular">
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
                            data-testid={`modal-setting-celestial-${grade.id}`}
                            aria-pressed={active}
                            onClick={() =>
                              onUpdateCameraSettings({ celestialGrade: grade.id })
                            }
                            className={`px-2 py-0.5 text-[10px] font-mono-tabular font-bold uppercase border transition-colors cursor-pointer whitespace-nowrap ${
                              active
                                ? 'bg-cyan-400/20 border-cyan-400 text-cyan-200'
                                : 'bg-[#0b1018] border-slate-700 text-slate-400 hover:text-slate-200'
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

            {/* Audio Mute [M] & Tutorial Hints [H] Toggles */}
            <div className="grid grid-cols-2 gap-2">
              {onToggleMute && (
                <button
                  type="button"
                  data-testid="modal-setting-mute"
                  aria-pressed={isMuted}
                  onClick={onToggleMute}
                  className="flex items-center justify-between px-3 py-2 bg-[#0b1018] hover:bg-[#131d2d] border border-slate-700 text-[11px] font-mono-tabular cursor-pointer"
                >
                  <span className="text-slate-300">AUDIO [M]</span>
                  <span
                    className={
                      isMuted ? 'text-amber-400 font-bold' : 'text-cyan-300 font-bold'
                    }
                  >
                    {isMuted ? 'MUTED' : 'ACTIVE'}
                  </span>
                </button>
              )}

              {onToggleTutorial && (
                <button
                  type="button"
                  data-testid="modal-setting-hints"
                  aria-pressed={tutorialEnabled}
                  onClick={onToggleTutorial}
                  className="flex items-center justify-between px-3 py-2 bg-[#0b1018] hover:bg-[#131d2d] border border-slate-700 text-[11px] font-mono-tabular cursor-pointer"
                >
                  <span className="text-slate-300">HINTS [H]</span>
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

            {/* Camera Sensitivity Slider */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <label
                  htmlFor="camera-sensitivity-slider"
                  className="text-[11px] font-mono-tabular uppercase tracking-wider text-slate-300"
                >
                  CAMERA SENSITIVITY
                </label>
                <span className="text-xs font-mono-tabular font-bold text-cyan-400">
                  {cameraSettings.sensitivity.toFixed(1)}x
                </span>
              </div>
              <input
                id="camera-sensitivity-slider"
                type="range"
                min="0.3"
                max="2.5"
                step="0.1"
                value={cameraSettings.sensitivity}
                onChange={(e) =>
                  onUpdateCameraSettings({ sensitivity: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Invert Y-Axis Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-mono-tabular uppercase tracking-wider text-slate-300">
                INVERT VERTICAL LOOK (Y-AXIS)
              </span>
              <button
                type="button"
                data-testid="modal-setting-invert-y"
                aria-pressed={cameraSettings.invertY}
                onClick={() =>
                  onUpdateCameraSettings({ invertY: !cameraSettings.invertY })
                }
                className={`px-3 py-1 text-[11px] font-mono-tabular font-semibold uppercase border transition-colors cursor-pointer ${
                  cameraSettings.invertY
                    ? 'bg-cyan-400/20 border-cyan-400 text-cyan-300'
                    : 'bg-[#0b1018] border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cameraSettings.invertY ? 'INVERTED' : 'STANDARD'}
              </button>
            </div>
            {/* Master, SFX & Music Volume Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label
                    htmlFor="modal-master-volume-slider"
                    className="text-[10px] font-mono-tabular uppercase tracking-wider text-slate-300"
                  >
                    MASTER VOLUME
                  </label>
                  <span className="text-[11px] font-mono-tabular font-bold text-cyan-400">
                    {Math.round((cameraSettings.masterVolume ?? 0.85) * 100)}%
                  </span>
                </div>
                <input
                  id="modal-master-volume-slider"
                  data-testid="modal-setting-master-volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={cameraSettings.masterVolume ?? 0.85}
                  onChange={(e) =>
                    onUpdateCameraSettings({ masterVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label
                    htmlFor="modal-sfx-volume-slider"
                    className="text-[10px] font-mono-tabular uppercase tracking-wider text-slate-300"
                  >
                    SFX / COMBAT BUS
                  </label>
                  <span className="text-[11px] font-mono-tabular font-bold text-cyan-400">
                    {Math.round((cameraSettings.sfxVolume ?? 0.9) * 100)}%
                  </span>
                </div>
                <input
                  id="modal-sfx-volume-slider"
                  data-testid="modal-setting-sfx-volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={cameraSettings.sfxVolume ?? 0.9}
                  onChange={(e) =>
                    onUpdateCameraSettings({ sfxVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label
                    htmlFor="modal-music-volume-slider"
                    className="text-[10px] font-mono-tabular uppercase tracking-wider text-slate-300"
                  >
                    MUSIC / STINGER BUS
                  </label>
                  <span className="text-[11px] font-mono-tabular font-bold text-cyan-400">
                    {Math.round((cameraSettings.musicVolume ?? 0.7) * 100)}%
                  </span>
                </div>
                <input
                  id="modal-music-volume-slider"
                  data-testid="modal-setting-music-volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={cameraSettings.musicVolume ?? 0.7}
                  onChange={(e) =>
                    onUpdateCameraSettings({ musicVolume: parseFloat(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Camera Shake, Screen Effects & Subtitles Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                data-testid="modal-setting-camera-shake"
                aria-pressed={cameraSettings.cameraShake ?? true}
                onClick={() =>
                  onUpdateCameraSettings({
                    cameraShake: !(cameraSettings.cameraShake ?? true),
                  })
                }
                className="flex items-center justify-between px-3 py-1.5 bg-[#0b1018] hover:bg-[#131d2d] border border-slate-700 text-[10px] font-mono-tabular cursor-pointer"
              >
                <span className="text-slate-300">CAMERA SHAKE</span>
                <span
                  className={
                    (cameraSettings.cameraShake ?? true)
                      ? 'text-cyan-300 font-bold'
                      : 'text-slate-500 font-bold'
                  }
                >
                  {(cameraSettings.cameraShake ?? true) ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                type="button"
                data-testid="modal-setting-screen-effects"
                aria-pressed={cameraSettings.screenEffects ?? true}
                onClick={() =>
                  onUpdateCameraSettings({
                    screenEffects: !(cameraSettings.screenEffects ?? true),
                  })
                }
                className="flex items-center justify-between px-3 py-1.5 bg-[#0b1018] hover:bg-[#131d2d] border border-slate-700 text-[10px] font-mono-tabular cursor-pointer"
              >
                <span className="text-slate-300">SCREEN EFFECTS</span>
                <span
                  className={
                    (cameraSettings.screenEffects ?? true)
                      ? 'text-cyan-300 font-bold'
                      : 'text-slate-500 font-bold'
                  }
                >
                  {(cameraSettings.screenEffects ?? true) ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                type="button"
                data-testid="modal-setting-subtitles"
                aria-pressed={cameraSettings.subtitlesEnabled ?? true}
                onClick={() =>
                  onUpdateCameraSettings({
                    subtitlesEnabled: !(cameraSettings.subtitlesEnabled ?? true),
                  })
                }
                className="flex items-center justify-between px-3 py-1.5 bg-[#0b1018] hover:bg-[#131d2d] border border-slate-700 text-[10px] font-mono-tabular cursor-pointer"
              >
                <span className="text-slate-300">COMMS SUBTITLES</span>
                <span
                  className={
                    (cameraSettings.subtitlesEnabled ?? true)
                      ? 'text-cyan-300 font-bold'
                      : 'text-slate-500 font-bold'
                  }
                >
                  {(cameraSettings.subtitlesEnabled ?? true) ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            <div className="space-y-1">
              <button
                type="button"
                id="modal-setting-reduced-motion"
                data-testid="modal-setting-reduced-motion"
                aria-label="Reduced motion"
                aria-pressed={cameraSettings.reducedMotion}
                aria-describedby="modal-reduced-motion-description"
                onClick={() =>
                  onUpdateCameraSettings({ reducedMotion: !cameraSettings.reducedMotion })
                }
                className="w-full flex items-center justify-between px-3 py-2 bg-[#0b1018] hover:bg-[#131d2d] border border-slate-700 text-[11px] font-mono-tabular cursor-pointer"
              >
                <span className="text-slate-300">Reduced motion</span>
                <span className={cameraSettings.reducedMotion ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                  {cameraSettings.reducedMotion ? 'ON' : 'OFF'}
                </span>
              </button>
              <p id="modal-reduced-motion-description" className="text-[10px] font-mono-tabular text-slate-400">
                Stops camera shake and title orbit; softens ambient motion. Combat cues stay visible.
              </p>
            </div>

            {/* v2.3.0: Mutators, Speedrun HUD & Achievements Summary */}
            {progression && (
              <div
                data-testid="modal-mutators-achievements-section"
                className="bg-[#0a1019] border border-slate-800/90 p-2.5 space-y-2 text-[10px] font-mono-tabular"
              >
                <div className="flex items-center justify-between text-fuchsia-300 font-bold uppercase tracking-wider">
                  <span>CHRONO MUTATORS &amp; SPEEDRUN HUD</span>
                  <span className="text-amber-300">
                    ACHIEVEMENTS {(progression.unlockedAchievementIds ?? []).length}/{CHRONO_ACHIEVEMENTS.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {CHRONO_MUTATORS.map((mut) => {
                    const active = Boolean(progression.mutators?.[mut.key]);
                    return (
                      <button
                        key={mut.key}
                        type="button"
                        data-testid={`modal-mutator-${mut.key}`}
                        onClick={() => onToggleMutator?.(mut.key)}
                        className={`flex items-center justify-between px-2.5 py-1.5 border text-left cursor-pointer ${
                          active
                            ? 'bg-fuchsia-950/45 border-fuchsia-400 text-fuchsia-100'
                            : 'bg-[#0b1018] hover:bg-[#131d2d] border-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="font-bold uppercase">{mut.label}</span>
                        <span className={active ? 'text-fuchsia-300 font-bold' : 'text-slate-500'}>
                          {active ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {onToggleSpeedrunHud && (
                  <button
                    type="button"
                    data-testid="modal-setting-speedrun-hud"
                    onClick={() => onToggleSpeedrunHud()}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 bg-[#0b1018] hover:bg-[#131d2d] border border-cyan-500/40 cursor-pointer"
                  >
                    <span className="text-slate-200 uppercase">Live Speedrun Split Timer HUD</span>
                    <span className={progression.speedrunHudEnabled ? 'text-cyan-300 font-bold' : 'text-slate-500'}>
                      {progression.speedrunHudEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>
                )}
              </div>
            )}

            <div className="bg-[#0a1019] border border-slate-800/90 px-3 py-2 text-[10px] font-mono-tabular text-slate-300">
              <span className="text-cyan-300 font-bold uppercase mr-2">GAMEPAD (AUTO-DETECT):</span>
              L-Stick Move · R-Stick Aim · A Dodge · X/RB Light · Y/RT Heavy · LB Parry · LT Relay · B Interact · D-Pad Echo &amp; Weapons · Start Pause
            </div>
            </div>
            );
          })()}
        </div>

        {/* Pinned Sticky Action Footer: Always visible without scrolling */}
        <div className="shrink-0 px-4 sm:px-5 py-2.5 bg-[#080d15] border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-2">
          {/* Left: Quiet Return to Title + Optional Restore / Boss Practice */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="modal-btn-title"
              onClick={(e) => {
                e.currentTarget.blur();
                onReturnToTitle();
              }}
              className="px-3 py-2 bg-[#0a0f18] hover:bg-[#141e2e] text-slate-300 hover:text-white border border-slate-700/90 font-display font-semibold text-xs tracking-[0.08em] uppercase transition-colors cursor-pointer whitespace-nowrap"
            >
              ← {t(locale, 'returnTitle')}
            </button>

            {(isPaused || !isVictory || canAdvanceChapter) &&
              hasSavedCampaignSnapshot &&
              onRestoreSavedCampaign && (
                <button
                  type="button"
                  data-testid="modal-btn-restore-campaign"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onRestoreSavedCampaign();
                  }}
                  className="px-3 py-2 bg-[#112233] hover:bg-[#19324a] text-cyan-300 border border-cyan-400/80 font-display font-bold text-xs tracking-[0.06em] uppercase transition-colors cursor-pointer whitespace-nowrap"
                >
                  {locale === 'vi' ? 'Khôi Phục Chiến Dịch Đã Lưu' : 'Restore Saved Campaign'}
                  {savedCampaignChapter ? ` · ${NEXT_CHAPTER_LABELS[savedCampaignChapter]}` : ''}
                </button>
              )}

            {onStartBoss && !isBossMode && !isCampaign && (
              <button
                type="button"
                data-testid="modal-btn-boss"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onStartBoss();
                }}
                className="px-3 py-2 bg-[#161c28] hover:bg-[#222c3e] text-amber-300 border border-amber-500/70 font-display font-bold text-xs tracking-[0.06em] uppercase transition-colors cursor-pointer whitespace-nowrap"
              >
                {locale === 'vi' ? 'Tập Đấu HELIX-04 [B]' : 'Practice HELIX-04 [B]'}
              </button>
            )}
          </div>

          {/* Right: Secondary Retry/Restart + Primary Action CTA */}
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {isCampaign && isBossMode && hasBossCheckpoint ? (
              <>
                <button
                  type="button"
                  data-start={!isVictory ? 'true' : undefined}
                  data-testid="modal-btn-retry-boss"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    (onRetryBossCheckpoint ?? onRestart)();
                  }}
                  className={`px-3.5 py-2 font-display font-bold text-xs tracking-[0.08em] uppercase transition-colors cursor-pointer whitespace-nowrap ${
                    !isPaused && !isVictory
                      ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.3)]'
                      : 'bg-[#121c2c] hover:bg-[#1a2840] text-cyan-300 border border-cyan-500/60'
                  }`}
                >
                  {isVictory ? t(locale, 'modalReplayBoss') : t(locale, 'modalRetryBoss')}
                </button>

                <button
                  type="button"
                  data-start={
                    isVictory && !canAdvanceChapter && !hasSavedCampaignSnapshot
                      ? 'true'
                      : undefined
                  }
                  data-testid="modal-btn-restart-full-run"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    (onRestartFullRun ?? onRestart)();
                  }}
                  className={`px-3.5 py-2 font-display font-bold text-xs tracking-[0.08em] uppercase transition-colors cursor-pointer whitespace-nowrap ${
                    !isPaused &&
                    isVictory &&
                    !canAdvanceChapter &&
                    !hasSavedCampaignSnapshot
                      ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
                      : 'bg-[#161219] hover:bg-[#241a26] text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {isVictory
                    ? locale === 'vi'
                      ? 'Chiến Dịch Mới · Toàn Trình'
                      : 'New Campaign · Full Run'
                    : locale === 'vi'
                      ? 'Khởi Động Lại Toàn Chiến Dịch'
                      : 'Restart Full Campaign'}
                </button>
              </>
            ) : (
              <button
                type="button"
                data-start={
                  !canAdvanceChapter && !(isVictory && hasSavedCampaignSnapshot)
                    ? 'true'
                    : undefined
                }
                data-testid="modal-btn-restart"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onRestart();
                }}
                className={`px-3.5 py-2 font-display font-bold text-xs tracking-[0.08em] uppercase transition-colors cursor-pointer whitespace-nowrap ${
                  isPaused || canAdvanceChapter || (isVictory && hasSavedCampaignSnapshot)
                    ? 'bg-[#121a28] hover:bg-[#1b273b] text-slate-200 border border-slate-700'
                    : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(34,211,238,0.3)]'
                }`}
              >
                {isPaused
                  ? t(locale, 'modalRestartSector')
                  : isVictory
                    ? t(locale, 'modalPlayAgain')
                    : t(locale, 'modalTryAgain')}
              </button>
            )}

            {isPaused && (
              <button
                type="button"
                data-testid="modal-btn-resume"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onResume();
                }}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-display font-bold text-xs sm:text-sm tracking-wider uppercase transition-colors cursor-pointer whitespace-nowrap shadow-[0_0_20px_rgba(34,211,238,0.3)]"
              >
                {t(locale, 'modalResumeCta')}
              </button>
            )}

            {canAdvanceChapter && pendingNextChapter && (
              <button
                type="button"
                data-start="true"
                data-testid="modal-btn-next-chapter"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onAdvanceNextChapter?.();
                }}
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-display font-bold text-xs sm:text-sm tracking-wider uppercase transition-colors cursor-pointer whitespace-nowrap shadow-[0_0_24px_rgba(34,211,238,0.35)]"
              >
                {t(locale, 'modalAdvanceTo')} {NEXT_CHAPTER_LABELS[pendingNextChapter]} [Enter] →
              </button>
            )}

            {!isPaused &&
              isVictory &&
              !canAdvanceChapter &&
              hasSavedCampaignSnapshot &&
              onRestoreSavedCampaign && (
                <button
                  type="button"
                  data-start="true"
                  data-testid="modal-btn-restore-campaign"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onRestoreSavedCampaign();
                  }}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-display font-bold text-xs sm:text-sm tracking-wider uppercase transition-colors cursor-pointer whitespace-nowrap shadow-[0_0_24px_rgba(34,211,238,0.35)]"
                >
                  {locale === 'vi' ? 'Khôi Phục Chiến Dịch Đã Lưu' : 'Restore Saved Campaign'}
                  {savedCampaignChapter ? ` (${NEXT_CHAPTER_LABELS[savedCampaignChapter]})` : ''}
                </button>
              )}

            {!isPaused && isVictory && onStartNewGamePlus && (
              <button
                type="button"
                data-testid="modal-btn-new-game-plus"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onStartNewGamePlus();
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-xs sm:text-sm tracking-wider uppercase transition-colors cursor-pointer whitespace-nowrap shadow-[0_0_22px_rgba(245,158,11,0.38)]"
              >
                {locale === 'vi'
                  ? `CHU KỲ MỚI+ (NG+${(progression?.ngPlusCycle ?? 0) + 1}) →`
                  : `NEW GAME+ (NG+${(progression?.ngPlusCycle ?? 0) + 1}) →`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
