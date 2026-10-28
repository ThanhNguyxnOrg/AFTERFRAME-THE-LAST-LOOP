import React from 'react';
import { GAME_CONFIG } from '../game/config.ts';
import type {
  BossCheckpointState,
  CameraSettings,
  CampaignChapterId,
  ChronicleLoomEndingId,
  EncounterMode,
  GameAppState,
  GameOutcome,
  RunMode,
  RunSummary,
} from '../game/types.ts';

interface StatusModalProps {
  appState: GameAppState;
  encounterMode?: EncounterMode;
  runMode?: RunMode;
  chapter?: CampaignChapterId;
  pendingNextChapter?: CampaignChapterId | null;
  hasSavedCampaignSnapshot?: boolean;
  bossCheckpoint?: BossCheckpointState | null;
  recoveredLogs?: string[];
  completedEndings?: ChronicleLoomEndingId[];
  outcome: GameOutcome;
  summary: RunSummary | null;
  elapsedTime: number;
  enemiesDefeated: number;
  totalEnemies: number;
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

export const StatusModal: React.FC<StatusModalProps> = ({
  appState,
  encounterMode = 'standard',
  runMode = 'practice_standard',
  chapter = 'prologue',
  pendingNextChapter = null,
  hasSavedCampaignSnapshot = false,
  bossCheckpoint = null,
  recoveredLogs = [],
  completedEndings = [],
  outcome,
  summary,
  elapsedTime,
  enemiesDefeated,
  totalEnemies,
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
  if (appState !== 'paused' && appState !== 'gameover') {
    return null;
  }

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

  const displayTime = summary ? summary.elapsedTime : elapsedTime;
  const displayDefeated = summary ? summary.enemiesDefeated : enemiesDefeated;
  const displayTotal = summary ? summary.totalEnemies : totalEnemies;
  const displayDamageDealt = summary ? summary.damageDealt : 0;
  const displayDamageTaken = summary ? summary.damageTaken : 0;
  const displayParries = summary ? summary.parriesLanded : 0;
  const displayVulnerableHits = summary ? summary.vulnerableHits : 0;
  const displayConvergences = summary ? summary.convergencesTriggered : 0;
  const displayRelays = summary ? summary.relaysUsed : 0;
  const displayRemainingHp = summary ? summary.remainingTargetHp : 0;

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
      className="fixed inset-0 z-30 flex items-center justify-center p-4 sm:p-6 pointer-events-auto overflow-y-auto"
      style={{
        backgroundColor: 'rgba(7, 9, 13, 0.86)',
      }}
    >
      <div className="w-full max-w-[560px] bg-[#0b1018] border border-slate-700/90 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.88)] my-auto">
        {/* Status Kicker */}
        <div className="flex items-center justify-between gap-2 text-xs font-mono-tabular uppercase tracking-widest mb-1">
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

        {/* Modal Heading */}
        <h2
          id="modal-status-heading"
          className="text-2xl sm:text-3xl font-display font-bold tracking-wide text-slate-100 uppercase mb-2"
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

        <p
          data-testid={selectedEnding ? 'modal-ending-summary' : undefined}
          className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3"
        >
          {isPaused
            ? 'Temporal telemetry suspended. Resume your active loop, adjust audio/camera preferences, or reset from your checkpoint.'
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
            className="bg-[#08111d] border-l-2 border-cyan-400 border-y border-r border-slate-800/90 p-3 mb-3.5"
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
            className="bg-[#08111d] border-l-2 border-amber-400 border-y border-r border-slate-800/90 p-3 mb-3.5 space-y-1 font-mono-tabular text-[11px]"
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

        {/* Primary Telemetry Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-3">
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
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            <div className="bg-[#070a0f] border border-slate-800/80 p-2">
              <div className="text-[9px] sm:text-[10px] font-mono-tabular uppercase tracking-wider text-slate-400">
                PARRIES LANDED
              </div>
              <div className="text-sm sm:text-base font-mono-tabular font-bold text-amber-300">
                {displayParries}
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
                DAMAGE TAKEN / RELAYS
              </div>
              <div className="text-sm sm:text-base font-mono-tabular font-bold text-slate-200">
                {displayDamageTaken} / {displayRelays}
              </div>
            </div>
          </div>
        )}

        {/* Consolidated System Settings (Visible on Pause Screen) */}
        {isPaused && (
          <div className="bg-[#070a0f] border border-slate-800/90 p-3.5 mb-5 space-y-3">
            <div className="text-[10px] font-mono-tabular uppercase tracking-widest text-cyan-400 font-semibold">
              SYSTEM & CAMERA SETTINGS
            </div>

            {/* Audio Mute [M] & Tutorial Hints [H] Toggles */}
            <div className="grid grid-cols-2 gap-2">
              {onToggleMute && (
                <button
                  type="button"
                  data-testid="modal-setting-mute"
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
          </div>
        )}

        {/* Action CTAs: Clear Primary -> Secondary -> Destructive/Quiet Hierarchy */}
        <div className="flex flex-col gap-2.5">
          {/* Primary Action Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isPaused && (
              <button
                type="button"
                data-testid="modal-btn-resume"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onResume();
                }}
                className="w-full px-4 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-display font-bold text-sm tracking-wider uppercase transition-colors cursor-pointer whitespace-nowrap shadow-[0_0_20px_rgba(34,211,238,0.3)]"
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
                className="w-full px-4 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-display font-bold text-sm sm:text-base tracking-wider uppercase transition-colors cursor-pointer whitespace-nowrap shadow-[0_0_24px_rgba(34,211,238,0.35)]"
              >
                Advance to {NEXT_CHAPTER_LABELS[pendingNextChapter]} [Enter]
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
                  className="w-full px-4 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-display font-bold text-sm sm:text-base tracking-wider uppercase transition-colors cursor-pointer whitespace-nowrap shadow-[0_0_24px_rgba(34,211,238,0.35)]"
                >
                  Restore Saved Campaign
                </button>
              )}
          </div>

          {/* Secondary / Recovery Grid (2 columns on desktop so each button has ~250px width and zero clipping) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                  className="sm:col-span-2 w-full px-3.5 py-2.5 bg-[#112233] hover:bg-[#19324a] text-cyan-300 border border-cyan-400/80 font-display font-bold text-xs tracking-[0.08em] uppercase transition-colors cursor-pointer whitespace-nowrap text-center"
                >
                  Restore Saved Campaign
                </button>
              )}

            {/* Campaign Boss Checkpoint Retry vs Full Run Restart */}
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
                  className={`w-full px-3 py-2.5 font-display font-bold text-xs tracking-[0.08em] uppercase transition-colors cursor-pointer whitespace-nowrap text-center ${
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
                  className={`w-full px-3 py-2.5 font-display font-bold text-xs tracking-[0.08em] uppercase transition-colors cursor-pointer whitespace-nowrap text-center ${
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
                className={`w-full px-3.5 py-2.5 font-display font-bold text-xs tracking-[0.08em] uppercase transition-colors cursor-pointer whitespace-nowrap text-center ${
                  onStartBoss && !isBossMode && !isCampaign ? '' : 'sm:col-span-2'
                } ${
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

            {onStartBoss && !isBossMode && !isCampaign && (
              <button
                type="button"
                data-testid="modal-btn-boss"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onStartBoss();
                }}
                className="w-full px-3.5 py-2.5 bg-[#161c28] hover:bg-[#222c3e] text-amber-300 border border-amber-500/70 font-display font-bold text-xs tracking-[0.08em] uppercase transition-colors cursor-pointer whitespace-nowrap text-center"
              >
                Practice HELIX-04 [B]
              </button>
            )}
          </div>

          {/* Quiet Navigation Row */}
          <button
            type="button"
            data-testid="modal-btn-title"
            onClick={(e) => {
              e.currentTarget.blur();
              onReturnToTitle();
            }}
            className="w-full px-3.5 py-2 bg-[#0a0f18] hover:bg-[#141e2e] text-slate-400 hover:text-slate-200 border border-slate-800/90 font-display font-semibold text-xs tracking-[0.1em] uppercase transition-colors cursor-pointer whitespace-nowrap text-center"
          >
            Return to Title
          </button>
        </div>
      </div>
    </div>
  );
};
