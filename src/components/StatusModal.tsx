import React from 'react';
import { evaluateCombatRank } from '../game/combat-flow.ts';
import { GAME_CONFIG } from '../game/config.ts';
import {
  FPS_LIMIT_OPTIONS,
  RENDER_SCALE_OPTIONS,
  resolveGraphicsSettings,
} from '../game/performance.ts';
import { getAllWeaponUpgradeDefinitions } from '../game/simulation.ts';
import type {
  BossCheckpointState,
  CameraSettings,
  CampaignChapterId,
  ChronicleLoomEndingId,
  CodexEntryId,
  EncounterMode,
  GameAppState,
  GameOutcome,
  HudRadarSnapshot,
  HudWeaponProgressionSnapshot,
  RunMode,
  RunSummary,
  WeaponId,
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
  initialExplorationTab?: 'missions' | 'map' | 'codex';
  equippedWeaponId?: WeaponId;
  onSelectWeapon?: (weaponId: WeaponId) => void;
  onPurchaseUpgrade?: (upgradeId: WeaponUpgradeId) => void;
  onEquipUpgrade?: (weaponId: WeaponId, upgradeId: WeaponUpgradeId | null) => void;
  cameraSettings: CameraSettings;
  onUpdateCameraSettings: (next: Partial<CameraSettings>) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
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
}

const NEXT_CHAPTER_LABELS: Record<CampaignChapterId, string> = {
  prologue: 'Prologue · Wake',
  chapter_1_helix: 'Chapter I · HELIX-04',
  chapter_2_choir: 'Chapter II · THE CHOIR',
  chapter_3_curator: 'Chapter III · THE CURATOR',
  chapter_4_matron: 'Chapter IV · MATRON-V',
  chapter_5_loom: 'Chapter V · Chronicle Loom',
};

const ALL_UPGRADE_DEFINITIONS = getAllWeaponUpgradeDefinitions();

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
  initialExplorationTab = 'missions',
  equippedWeaponId = 'chrono_edge',
  onSelectWeapon,
  onPurchaseUpgrade,
  onEquipUpgrade,
  cameraSettings,
  onUpdateCameraSettings,
  isMuted = false,
  onToggleMute,
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
}) => {
  const [activeExplorationTab, setActiveExplorationTab] = React.useState<
    'missions' | 'map' | 'codex'
  >(initialExplorationTab);
  const [selectedCodexId, setSelectedCodexId] = React.useState<CodexEntryId>('CODEX-01');

  const isPaused = appState === 'paused';
  const isVictory =
    appState === 'gameover' && (summary?.outcome === 'victory' || outcome === 'victory');
  const isBossMode = encounterMode === 'boss';
  const isCampaign = runMode === 'campaign';
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
    if (initialExplorationTab === 'map') return 'exploration';
    if (showUpgradeBench) return 'arsenal';
    return 'telemetry';
  });

  React.useEffect(() => {
    if (appState === 'paused' || appState === 'gameover') {
      setActiveExplorationTab(initialExplorationTab);
      if (initialExplorationTab === 'map') {
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
                {isCampaign
                  ? `NADIR-9 CAMPAIGN · ${NEXT_CHAPTER_LABELS[chapter]}`
                  : 'ISOLATED PRACTICE SIMULATION · PAUSED'}
              </span>
            ) : isVictory ? (
              <span className="text-cyan-400">
                {endingDetails
                  ? `CHRONICLE LOOM · ${endingDetails.subtitle}`
                  : isCampaign
                    ? `${NEXT_CHAPTER_LABELS[chapter]} · CLEARED`
                    : isBossMode
                      ? 'PRACTICE SIMULATION · WARDEN DEFEATED'
                      : 'TEST BAY 04 · SECURED'}
              </span>
            ) : (
              <span className="text-red-400">CHRONO RIG · SUIT INTEGRITY DEPLETED</span>
            )}

            {canAdvanceChapter && pendingNextChapter && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 px-2 py-0.5">
                UNLOCKED: {NEXT_CHAPTER_LABELS[pendingNextChapter]}
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
                ? 'Simulation Paused'
                : isVictory
                  ? endingDetails
                    ? endingDetails.epilogueTitle
                    : isBossMode
                      ? 'Warden Core Silenced'
                      : 'Loop Stabilized'
                  : 'Loop Terminated'}
            </h2>

            {/* Compact Inline Quick Telemetry Strip */}
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono-tabular">
              <span className="px-2 py-0.5 bg-[#0b121e] border border-slate-800 text-slate-300">
                {isVictory ? 'CLEAR' : 'TIME'}{' '}
                <strong className="text-slate-100">{displayTime.toFixed(1)}s</strong>
              </span>
              <span className="px-2 py-0.5 bg-[#0b121e] border border-slate-800 text-slate-300">
                HOSTILES{' '}
                <strong className="text-cyan-400">
                  {displayDefeated}/{displayTotal}
                </strong>
              </span>
              <span className="px-2 py-0.5 bg-[#0b121e] border border-slate-800 text-slate-300">
                {isPaused || isVictory ? 'DMG' : 'HOSTILE HP'}{' '}
                <strong className="text-amber-400">
                  {isPaused || isVictory
                    ? `${displayDamageDealt} (${displayVulnerableHits}x)`
                    : displayRemainingHp}
                </strong>
              </span>
              <span className="px-2 py-0.5 bg-[#0b121e] border border-slate-800 text-slate-300">
                PARRY <strong className="text-amber-300">{displayParries}</strong> · SLIP{' '}
                <strong className="text-cyan-300">{displayPerfectDodges}</strong> · CONV{' '}
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
                  RANK {rankEval.grade}
                </span>
              )}
              {progression && (
                <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-400/60 text-amber-300 font-bold">
                  FRAGMENTS: {progression.memoryFragments}
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
                  className={`px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                    activeModalSection === 'arsenal'
                      ? 'bg-cyan-400 text-slate-950 border-cyan-300'
                      : 'bg-[#0b1018] hover:bg-[#131f31] border-slate-700 text-cyan-200'
                  }`}
                >
                  ⚔ ARSENAL & UPGRADES [U] (
                  {(progression?.unlockedWeaponIds ?? ['chrono_edge', 'pulsecaster']).length}/4)
                </button>
              )}

              {(isPaused || isVictory) && exploration && (
                <button
                  type="button"
                  data-testid="modal-section-exploration"
                  aria-pressed={activeModalSection === 'exploration'}
                  onClick={() => setActiveModalSection('exploration')}
                  className={`px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                    activeModalSection === 'exploration'
                      ? 'bg-emerald-400/20 border-emerald-400 text-emerald-200'
                      : 'bg-[#0b1018] hover:bg-[#131f31] border-slate-700 text-slate-300'
                  }`}
                >
                  🗺 JOURNAL, MAP & CODEX [N] ({exploration.discoveredCodexIds.length}/
                  {exploration.codexEntries.length})
                </button>
              )}

              <button
                type="button"
                data-testid="modal-section-telemetry"
                aria-pressed={activeModalSection === 'telemetry'}
                onClick={() => setActiveModalSection('telemetry')}
                className={`px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                  activeModalSection === 'telemetry'
                    ? 'bg-amber-400/20 border-amber-400 text-amber-200'
                    : 'bg-[#0b1018] hover:bg-[#131f31] border-slate-700 text-slate-300'
                }`}
              >
                📊 LOGS & TELEMETRY
              </button>

              {isPaused && (
                <button
                  type="button"
                  data-testid="modal-section-settings"
                  aria-pressed={activeModalSection === 'settings'}
                  onClick={() => setActiveModalSection('settings')}
                  className={`px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase tracking-wider border transition-colors cursor-pointer ${
                    activeModalSection === 'settings'
                      ? 'bg-cyan-400/20 border-cyan-400 text-cyan-200'
                      : 'bg-[#0b1018] hover:bg-[#131f31] border-slate-700 text-slate-300'
                  }`}
                >
                  ⚙ SYSTEM SETTINGS
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
            <p
              data-testid={selectedEnding ? 'modal-ending-summary' : undefined}
              className="text-xs sm:text-sm text-slate-300 leading-relaxed"
            >
              {isPaused
                ? 'Temporal telemetry suspended. Resume your active loop, configure weapon modifications at the Upgrade Bench, or adjust system preferences.'
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
                  {isVictory ? 'CLEAR TIME' : 'LOOP TIME'}
                </div>
                <div className="text-base sm:text-lg font-mono-tabular font-bold text-slate-100">
                  {displayTime.toFixed(1)}s
                </div>
              </div>

              <div className="bg-[#070a0f] border border-slate-800 p-2.5">
                <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-slate-400 mb-0.5">
                  HOSTILES
                </div>
                <div className="text-base sm:text-lg font-mono-tabular font-bold text-cyan-400">
                  {displayDefeated}/{displayTotal}
                </div>
              </div>

              <div className="bg-[#070a0f] border border-slate-800 p-2.5">
                <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-slate-400 mb-0.5">
                  {isPaused || isVictory ? 'DAMAGE DEALT' : 'HOSTILE HP'}
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
                  <div className="text-[9px] sm:text-[10px] font-mono-tabular uppercase tracking-wider text-slate-400">
                    COMBAT RANK
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
                    CHRONO RIG UPGRADE BENCH [U]
                  </div>
                  <div className="text-[10px] font-mono-tabular text-slate-400">
                    Click [EQUIP WEAPON] or press [1–4] · 1 Active Core Modification per Weapon
                  </div>
                </div>
                <div
                  data-testid="upgrade-fragments-balance"
                  data-fragments={progression.memoryFragments}
                  className="px-2.5 py-0.5 bg-amber-500/15 border border-amber-400/60 text-amber-300 font-mono-tabular text-xs font-bold tracking-wider uppercase whitespace-nowrap"
                >
                  MEMORY FRAGMENTS: {progression.memoryFragments}
                </div>
              </div>

              {progression.lastActionMessage && (
                <div
                  data-testid="upgrade-status-message"
                  className="px-2.5 py-1 bg-[#0b1422] border border-cyan-400/70 text-[10px] font-mono-tabular text-cyan-200"
                >
                  {progression.lastActionMessage}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(
                  ['chrono_edge', 'pulsecaster', 'phase_rail', 'grav_breaker'] as const
                ).map((weaponId) => {
                  const weaponUpgrades = ALL_UPGRADE_DEFINITIONS.filter(
                    (u) => u.weaponId === weaponId
                  );
                  const activeUpgradeId = progression.equippedUpgrades[weaponId];
                  const isCurrentWeapon = equippedWeaponId === weaponId;
                  const unlockedWeapons = progression.unlockedWeaponIds ?? [
                    'chrono_edge',
                    'pulsecaster',
                  ];
                  const isWeaponUnlocked = unlockedWeapons.includes(weaponId);
                  const weaponTitle =
                    weaponId === 'chrono_edge'
                      ? '[1] CHRONO EDGE (MELEE)'
                      : weaponId === 'pulsecaster'
                        ? '[2] PULSECASTER (RANGED)'
                        : weaponId === 'phase_rail'
                          ? '[3] NULL-POINT RAIL LANCE'
                          : '[4] GRAV-BREAKER MAUL';
                  return (
                    <div
                      key={weaponId}
                      data-testid={`upgrade-column-${weaponId}`}
                      data-weapon-unlocked={isWeaponUnlocked ? 'true' : 'false'}
                      data-weapon-equipped={isCurrentWeapon ? 'true' : 'false'}
                      className={`bg-[#0a1019] border p-2 space-y-1.5 transition-colors ${
                        isCurrentWeapon
                          ? 'border-cyan-400/80 shadow-[0_0_16px_rgba(34,211,238,0.12)]'
                          : 'border-slate-800/90'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1 border-b border-slate-800/80">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`text-[10px] font-mono-tabular font-bold uppercase tracking-wider truncate ${
                              weaponId === 'pulsecaster' || weaponId === 'phase_rail'
                                ? 'text-sky-300'
                                : weaponId === 'grav_breaker'
                                  ? 'text-amber-300'
                                  : 'text-cyan-300'
                            }`}
                          >
                            {weaponTitle}
                          </span>
                          {activeUpgradeId && (
                            <span className="text-[9px] font-mono-tabular uppercase px-1.5 py-0.5 bg-cyan-500/15 border border-cyan-500/40 text-cyan-200 whitespace-nowrap">
                              {weaponUpgrades.find((u) => u.id === activeUpgradeId)?.shortLabel}
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
                            {isCurrentWeapon ? 'ACTIVE WEAPON' : 'EQUIP WEAPON'}
                          </button>
                        ) : (
                          <span className="text-[9px] font-mono-tabular uppercase px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-500 whitespace-nowrap">
                            WEAPON LOCKED
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {weaponUpgrades.map((upg) => {
                          const isOwned = progression.purchasedUpgrades.includes(upg.id);
                          const isEquipped = activeUpgradeId === upg.id;
                          const canAfford = progression.memoryFragments >= upg.cost;

                          return (
                            <div
                              key={upg.id}
                              data-testid={`upgrade-card-${upg.id}`}
                              data-owned={isOwned ? 'true' : 'false'}
                              data-equipped={isEquipped ? 'true' : 'false'}
                              className={`p-2 border flex flex-col justify-between transition-colors ${
                                isEquipped
                                  ? 'bg-[#0e1b2c] border-cyan-400/90'
                                  : isOwned
                                    ? 'bg-[#0b131e] border-slate-700'
                                    : 'bg-[#080d14] border-slate-800/90'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className="text-[10px] font-display font-bold uppercase tracking-wide text-slate-100 truncate">
                                    {upg.name}
                                  </span>
                                  <span
                                    className={`text-[8px] font-mono-tabular font-bold uppercase px-1 py-0.5 border whitespace-nowrap shrink-0 ${
                                      isEquipped
                                        ? 'bg-cyan-400/20 border-cyan-400 text-cyan-200'
                                        : isOwned
                                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                                          : canAfford
                                            ? 'bg-amber-500/15 border-amber-400/60 text-amber-300'
                                            : 'bg-slate-900 border-slate-700 text-slate-400'
                                    }`}
                                  >
                                    {isEquipped
                                      ? 'EQUIPPED'
                                      : isOwned
                                        ? 'OWNED'
                                        : `${upg.cost} FRAG`}
                                  </span>
                                </div>

                                <div
                                  className="text-[9px] text-emerald-300 leading-tight mb-0.5 line-clamp-2"
                                  title={upg.benefitText}
                                >
                                  <span className="font-mono-tabular font-bold">+ </span>
                                  {upg.benefitText}
                                </div>
                                <div
                                  className="text-[9px] text-amber-300/90 leading-tight mb-1.5 line-clamp-1"
                                  title={upg.tradeoffText}
                                >
                                  <span className="font-mono-tabular font-bold">- </span>
                                  {upg.tradeoffText}
                                </div>
                              </div>

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
                                  ? 'LOCKED'
                                  : isEquipped
                                    ? 'EQUIPPED · UNEQUIP'
                                    : isOwned
                                      ? 'EQUIP MOD'
                                      : `UNLOCK (${upg.cost} FRAG)`}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
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
                  NADIR-9 FIELD JOURNAL, SECTOR MAP & ARCHIVE CODEX
                </div>
                <div className="text-[10px] font-mono-tabular text-slate-400">
                  {exploration.mission.code} · NODES: {exploration.activatedNodeIds.length} · ROUTES: {exploration.unlockedRouteIds.length} · SECRETS: {exploration.discoveredSecretIds?.length ?? 0}/{exploration.localMap?.totalSecretsCampaign ?? 4}
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
                  MISSIONS ({exploration.mission.objectives.filter((o) => o.status === 'completed').length}/{exploration.mission.objectives.length})
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
                  SECTOR MAP [N] ({exploration.localMap?.discoveredSecretsInChapter ?? 0}/{exploration.localMap?.totalSecretsInChapter ?? 0})
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
                  CODEX ({exploration.discoveredCodexIds.length}/{exploration.codexEntries.length})
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
                      {exploration.mission.completed ? 'MISSION COMPLETE' : 'IN PROGRESS'}
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
                            {obj.category === 'optional' ? 'OPTIONAL' : 'MAIN'}
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
                          {obj.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-snug">
                        {obj.description}
                      </p>
                    </div>
                  ))}
                </div>

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
                      return (
                        <g
                          key={reg.id}
                          data-testid={`map-region-${reg.id}`}
                          data-hidden-by-fog={reg.hiddenByFog ? 'true' : 'false'}
                          data-discovered={reg.discovered ? 'true' : 'false'}
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
                              reg.hiddenByFog
                                ? '#475569'
                                : reg.kind === 'secret_alcove'
                                  ? '#34d399'
                                  : isCurrent
                                    ? '#22d3ee'
                                    : '#1e3a5f'
                            }
                            strokeWidth={isCurrent ? '0.55' : '0.38'}
                            strokeDasharray={reg.hiddenByFog ? '1.1 0.9' : undefined}
                          />
                        </g>
                      );
                    })}

                    {/* Traversal Routes & Gateways */}
                    {exploration.localMap.routes.map((rt) => (
                      <g
                        key={rt.id}
                        data-testid={`map-route-${rt.id}`}
                        data-route-status={rt.status}
                      >
                        <line
                          x1={rt.fromX}
                          y1={rt.fromZ}
                          x2={rt.toX}
                          y2={rt.toZ}
                          stroke={
                            rt.status === 'open'
                              ? '#34d399'
                              : rt.status === 'powered'
                                ? '#f59e0b'
                                : '#f43f5e'
                          }
                          strokeWidth="0.7"
                          strokeDasharray={rt.status === 'open' ? undefined : '1.0 0.8'}
                        />
                      </g>
                    ))}

                    {/* Timed Energy Passages */}
                    {exploration.localMap.hazards.map((hz) => (
                      <circle
                        key={hz.id}
                        data-testid={`map-hazard-${hz.id}`}
                        data-hazard-phase={hz.phase}
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
                          hz.phase === 'active'
                            ? '#ef4444'
                            : hz.phase === 'warning'
                              ? '#f59e0b'
                              : '#22d3ee'
                        }
                        strokeWidth="0.45"
                      />
                    ))}

                    {/* Kinetic Vector Boost Pads */}
                    {(radar?.boostPads ?? []).map((pad) => (
                      <g
                        key={pad.id}
                        data-testid={`map-boost-pad-${pad.id}`}
                        data-pad-ready={pad.ready ? 'true' : 'false'}
                      >
                        <circle
                          cx={pad.x}
                          cy={pad.z}
                          r="1.35"
                          fill={pad.ready ? 'rgba(34, 211, 238, 0.22)' : 'rgba(51, 65, 85, 0.22)'}
                          stroke={pad.ready ? '#22d3ee' : '#475569'}
                          strokeWidth="0.4"
                        />
                        <polygon
                          points={`${pad.x},${pad.z - 0.8} ${pad.x + 0.65},${pad.z + 0.45} ${pad.x},${pad.z + 0.1} ${pad.x - 0.65},${pad.z + 0.45}`}
                          fill={pad.ready ? '#67e8f9' : '#64748b'}
                        />
                      </g>
                    ))}

                    {/* Chapter Cover Barricades, Pillars & Destructible Capacitors */}
                    {(radar?.obstacles ?? []).map((obs) => {
                      if (obs.kind === 'destructible_crate') {
                        return (
                          <polygon
                            key={obs.id}
                            data-testid={`map-obstacle-${obs.id}`}
                            data-obstacle-kind={obs.kind}
                            points={`${obs.x},${obs.z - 0.95} ${obs.x + 0.95},${obs.z} ${obs.x},${obs.z + 0.95} ${obs.x - 0.95},${obs.z}`}
                            fill={obs.hpRatio < 0.6 ? '#f97316' : '#f59e0b'}
                            stroke="#020617"
                            strokeWidth="0.25"
                          />
                        );
                      }
                      if (obs.kind === 'cover_wall') {
                        return (
                          <rect
                            key={obs.id}
                            data-testid={`map-obstacle-${obs.id}`}
                            data-obstacle-kind={obs.kind}
                            x={obs.x - 1.05}
                            y={obs.z - 0.55}
                            width="2.1"
                            height="1.1"
                            rx="0.2"
                            fill="#334155"
                            stroke="#94a3b8"
                            strokeWidth="0.3"
                          />
                        );
                      }
                      return (
                        <circle
                          key={obs.id}
                          data-testid={`map-obstacle-${obs.id}`}
                          data-obstacle-kind={obs.kind}
                          cx={obs.x}
                          cy={obs.z}
                          r={Math.max(0.85, obs.radius * 0.85)}
                          fill="#1e293b"
                          stroke="#475569"
                          strokeWidth="0.35"
                        />
                      );
                    })}

                    {/* Environmental Interactable Nodes */}
                    {exploration.interactables.map((node) => (
                      <rect
                        key={node.id}
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
                        stroke="#020617"
                        strokeWidth="0.25"
                      />
                    ))}

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
                    <span className="text-emerald-300">━ OPEN ROUTE</span>
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

                {/* Right Column: Traversal Routes, Timed Hazards & Secret Discovery Telemetry */}
                <div className="sm:col-span-7 space-y-2">
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
                                : 'UNINDEXED SECTOR SIGNAL // FOG OF DISCOVERY'}
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
                </div>
              </div>
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
              ← Return to Title
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
                  Restore Saved Campaign
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
                Practice HELIX-04 [B]
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
                  {isVictory ? 'Replay Boss [R]' : 'Retry Boss Checkpoint [R]'}
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
                  {isVictory ? 'New Campaign · Full Run' : 'Restart Full Campaign'}
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
                  ? 'Restart Sector [R]'
                  : isVictory
                    ? 'Play Again [R]'
                    : 'Try Again [R]'}
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
                Resume Gameplay [P / Esc]
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
                Advance to {NEXT_CHAPTER_LABELS[pendingNextChapter]} [Enter] →
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
                  Restore Saved Campaign
                  {savedCampaignChapter ? ` (${NEXT_CHAPTER_LABELS[savedCampaignChapter]})` : ''}
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
});
