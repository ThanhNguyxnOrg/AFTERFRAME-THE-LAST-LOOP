import React from 'react';
import { GAME_CONFIG } from '../game/config.ts';
import { getCurrentCalibrationObjective } from '../game/simulation.ts';
import type { ChronicleLoomEndingId, HudSnapshot, TutorialStep } from '../game/types.ts';

interface GameHudProps {
  hud: HudSnapshot;
  isMuted: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  onStartBoss?: () => void;
  onSkipIntro?: () => void;
  onSkipTransition?: () => void;
  onSkipBossIntro?: () => void;
  onDismissComms?: () => void;
  onToggleTutorial?: () => void;
  onEchoRecord: () => void;
  onEchoReplay: () => void;
  onEchoClear: () => void;
  onEchoRelay: () => void;
  onLightAttack?: () => void;
  onHeavyAttack?: () => void;
  onDodge?: () => void;
  onParry?: () => void;
  onGravityPin?: () => void;
  onEchoCollapse?: () => void;
  onSwitchWeapon?: () => void;
  onSelectLoomEnding?: (ending: ChronicleLoomEndingId) => void;
  onRestoreCampaign?: () => void;
  onTouchMoveHold?: (dx: number, dz: number, pointerId?: number | null) => void;
  onTouchMovePulse?: (dx: number, dz: number) => void;
  onTouchCameraStart?: (
    id: number,
    clientX: number,
    clientY: number,
    source: 'touch' | 'pointer'
  ) => void;
  onTouchCameraMove?: (
    id: number,
    clientX: number,
    clientY: number,
    source: 'touch' | 'pointer'
  ) => void;
  onTouchCameraEnd?: (id?: number, source?: 'touch' | 'pointer') => void;
}

const TUTORIAL_STEP_META: Record<
  TutorialStep,
  { badge: string; whyItMatters: string }
> = {
  movement_camera: {
    badge: 'STEP 1 OF 6 · ORIENTATION',
    whyItMatters: 'Positioning and sightlines let you read enemy telegraphs and align Echo recordings.',
  },
  combat_basics: {
    badge: 'STEP 2 OF 6 · MELEE & DEFENSE',
    whyItMatters: 'Parrying [Q] and striking white recovery windows build Chrono Flux for Heavy attacks and Relay.',
  },
  echo_record_replay: {
    badge: 'STEP 3 OF 6 · CHRONO RIG',
    whyItMatters: 'Your Echo replays recorded movement and attacks independently while you act elsewhere.',
  },
  puzzle_teach: {
    badge: 'STEP 4 OF 6 · CALIBRATION 1/3',
    whyItMatters: 'Anchor Pad 01 only responds to a replaying Echo so Sera can cross Gate 01 while it stays held.',
  },
  puzzle_test: {
    badge: 'STEP 5 OF 6 · CALIBRATION 2/3',
    whyItMatters: 'Directional Echo Heavy strikes energize kinetic receivers and prime enemies for Convergence.',
  },
  puzzle_combine: {
    badge: 'STEP 6 OF 6 · CALIBRATION 3/3',
    whyItMatters: 'Combining a Receiver strike and Pad 02 hold in one Echo opens the final containment gate.',
  },
  boss_counterplay: {
    badge: 'CHAPTER I · TACTICAL BRIEF',
    whyItMatters: 'HELIX-04’s frontal shield deflects standard hits—strike after telegraphs or trigger Echo Convergence.',
  },
  choir_harmonic_nodes: {
    badge: 'CHAPTER II · HARMONIC SYNC',
    whyItMatters: 'THE CHOIR is invulnerable until an Echo primes one pylon and live Sera strikes a second pylon within 8.5s.',
  },
  curator_gravity_pin: {
    badge: 'CHAPTER III · GRAVITY PIN [G]',
    whyItMatters: 'Gravity Pin [G] immobilizes False-Echo decoys and interrupts non-committed boss telegraphs.',
  },
  matron_echo_collapse: {
    badge: 'CHAPTER IV · ECHO COLLAPSE [X]',
    whyItMatters: 'Detonating your active Echo with [X] deals heavy stagger before MATRON-V can sever your track.',
  },
  chronicle_loom_choice: {
    badge: 'CHAPTER V · FINAL DIRECTIVE',
    whyItMatters: 'Your choice permanently determines the fate of Nadir-9 and the reconstructed behavioral archive.',
  },
  completed: {
    badge: 'COMPLETE',
    whyItMatters: '',
  },
};

const LOOM_ENDING_CARDS: Array<{
  id: ChronicleLoomEndingId;
  keyHint: string;
  consequenceTag: string;
  accentBorder: string;
  accentText: string;
}> = [
  {
    id: 'silence',
    keyHint: '[1]',
    consequenceTag: 'TERMINATE ARCHIVE',
    accentBorder: 'border-rose-500/70 hover:border-rose-400',
    accentText: 'text-rose-300',
  },
  {
    id: 'witness',
    keyHint: '[2]',
    consequenceTag: 'TRANSMIT EVIDENCE',
    accentBorder: 'border-cyan-400/80 hover:border-cyan-300',
    accentText: 'text-cyan-300',
  },
  {
    id: 'continuity',
    keyHint: '[3]',
    consequenceTag: 'ISOLATE SANDBOX',
    accentBorder: 'border-amber-400/80 hover:border-amber-300',
    accentText: 'text-amber-300',
  },
];

export const GameHud: React.FC<GameHudProps> = ({
  hud,
  isMuted,
  onToggleMute,
  onTogglePause,
  onRestart,
  onStartBoss,
  onSkipIntro,
  onSkipTransition,
  onSkipBossIntro,
  onDismissComms,
  onToggleTutorial,
  onEchoRecord,
  onEchoReplay,
  onEchoClear,
  onEchoRelay,
  onLightAttack,
  onHeavyAttack,
  onDodge,
  onParry,
  onGravityPin,
  onEchoCollapse,
  onSwitchWeapon,
  onSelectLoomEnding,
  onRestoreCampaign,
  onTouchMoveHold,
  onTouchMovePulse,
  onTouchCameraStart,
  onTouchCameraMove,
  onTouchCameraEnd,
}) => {
  const [inspectingLoomChamber, setInspectingLoomChamber] = React.useState(false);

  React.useEffect(() => {
    if (hud.run.stage !== 'chronicle_loom') {
      setInspectingLoomChamber(false);
    }
  }, [hud.run.stage]);
  const integrityPct = Math.max(0, Math.min(100, (hud.integrity / hud.maxIntegrity) * 100));
  const ghostIntegrityPct = Math.max(
    integrityPct,
    Math.min(100, (hud.ghostIntegrity / hud.maxIntegrity) * 100)
  );
  const fluxPct = Math.max(0, Math.min(100, (hud.flux / hud.maxFlux) * 100));
  const isLowHp = hud.integrity > 0 && hud.integrity <= 30;
  const isEmpoweredReady = hud.flux >= 25;

  const focused = hud.focusedEnemy;
  const enemyHpPct = focused ? Math.max(0, Math.min(100, (focused.hp / focused.maxHp) * 100)) : 0;
  const enemyGhostPct = focused
    ? Math.max(enemyHpPct, Math.min(100, (focused.ghostHp / focused.maxHp) * 100))
    : 0;
  const enemyStaggerPct = focused
    ? Math.max(0, Math.min(100, (focused.stagger / focused.maxStagger) * 100))
    : 0;

  const isEnemyVulnerable =
    focused && (focused.aiState === 'recovery' || focused.aiState === 'staggered');
  const isEnemyTelegraphing = focused && focused.aiState === 'telegraph';

  const boss = hud.boss;
  const bossHpPct = boss ? Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100)) : 0;
  const bossGhostPct = boss
    ? Math.max(bossHpPct, Math.min(100, (boss.ghostHp / boss.maxHp) * 100))
    : 0;
  const bossStaggerPct = boss
    ? Math.max(0, Math.min(100, (boss.stagger / boss.maxStagger) * 100))
    : 0;

  const echo = hud.echo;
  const relay = hud.relay;
  const resonance = hud.resonance;
  const plate = hud.pressurePlate;
  const puzzle = hud.puzzle;
  const calGuidance = getCurrentCalibrationObjective(puzzle);
  const tutorialMeta = TUTORIAL_STEP_META[hud.tutorial.step] ?? TUTORIAL_STEP_META.movement_camera;

  const echoPct =
    echo.state === 'recording'
      ? Math.max(0, Math.min(100, (echo.recordingTime / Math.max(0.1, echo.maxDuration)) * 100))
      : echo.state === 'playback'
        ? Math.max(0, Math.min(100, (echo.playbackTime / Math.max(0.1, echo.clipDuration)) * 100))
        : echo.hasClip
          ? 100
          : 0;

  const echoStateBadge =
    echo.state === 'recording'
      ? `REC ${echo.recordingTime.toFixed(1)}s/${echo.maxDuration.toFixed(1)}s`
      : echo.state === 'playback'
        ? `REPLAY ${echo.playbackTime.toFixed(1)}s/${echo.clipDuration.toFixed(1)}s`
        : echo.state === 'ready' || echo.state === 'finished'
          ? `READY (${echo.clipDuration.toFixed(1)}s)`
          : 'IDLE · 1 TRACK';

  const showContextualRelayOrResonance =
    echo.state === 'playback' ||
    relay.canRelay ||
    relay.cooldownTimer > 0 ||
    resonance.primed ||
    resonance.status === 'on_cooldown' ||
    resonance.lastOutcome === 'expired' ||
    resonance.lastOutcome === 'insufficient_flux';

  return (
    <div className="fixed inset-0 z-10 pointer-events-none select-none overflow-hidden">
      {/* Subtle Peripheral Low-Integrity Vignette */}
      {isLowHp && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 90px rgba(239, 68, 68, 0.42)',
          }}
        />
      )}

      {/* Top Perimeter Row: Low-Occlusion Layout for Mobile (390x844) & Desktop (1280x800) */}
      <div
        className={`flex flex-wrap md:flex-nowrap items-start justify-between w-full p-2 sm:p-4 md:p-5 [@media(max-height:540px)]:p-2 gap-1.5 sm:gap-3 transition-opacity duration-150 ${
          hud.loom.active && hud.run.stage === 'chronicle_loom' && !inspectingLoomChamber
            ? 'opacity-20 pointer-events-none'
            : ''
        }`}
      >
        {/* Cluster 1 (Top-Left): Compact Survival Bars, Chrono Echo & Action Deck */}
        <div
          data-testid="player-hud"
          className="order-1 w-[236px] sm:w-68 md:w-76 [@media(max-height:540px)]:w-[236px] bg-[#090d14]/90 border border-slate-800/90 p-2 sm:p-3 [@media(max-height:540px)]:p-2 shadow-[0_8px_24px_rgba(0,0,0,0.65)] shrink-0"
        >
          {/* Compact Integrity & Flux Bars (Side-by-side on mobile to save vertical space, stacked on sm+) */}
          <div className="grid grid-cols-2 sm:grid-cols-1 [@media(max-height:540px)]:grid-cols-2 gap-2 sm:gap-1.5 mb-1.5 sm:mb-2 [@media(max-height:540px)]:mb-1.5">
            {/* Integrity */}
            <div>
              <div className="flex items-baseline justify-between mb-0.5">
                <span className="text-[9px] sm:text-[10px] font-mono-tabular uppercase tracking-wider text-cyan-400 font-semibold">
                  INTEGRITY
                </span>
                <div className="flex items-baseline gap-0.5 font-mono-tabular">
                  <span
                    className={`text-sm sm:text-xl font-bold leading-none ${
                      isLowHp ? 'text-red-400' : 'text-slate-100'
                    }`}
                  >
                    {hud.integrity}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-500">
                    /{hud.maxIntegrity}
                  </span>
                </div>
              </div>
              <div className="relative h-1.5 sm:h-2 w-full bg-[#05080c] border border-slate-800 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-amber-500/70 transition-all duration-75"
                  style={{ width: `${ghostIntegrityPct}%` }}
                />
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-75 ${
                    isLowHp ? 'bg-red-500' : 'bg-cyan-400'
                  }`}
                  style={{ width: `${integrityPct}%` }}
                />
              </div>
            </div>

            {/* Chrono Flux */}
            <div>
              <div className="flex items-baseline justify-between mb-0.5">
                <span className="text-[9px] sm:text-[10px] font-mono-tabular uppercase tracking-wider text-amber-400 font-semibold">
                  FLUX
                </span>
                <span className="text-xs sm:text-sm font-mono-tabular font-bold text-amber-300 leading-none">
                  {hud.flux}
                  <span className="text-[9px] text-slate-500 font-normal">/{hud.maxFlux}</span>
                </span>
              </div>
              <div className="relative h-1.5 sm:h-2 w-full bg-[#05080c] border border-slate-800 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-amber-400 transition-all duration-75"
                  style={{ width: `${fluxPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Chrono Echo Track Module */}
          <div
            data-testid="echo-hud-module"
            data-echo-state={echo.state}
            className="pt-1.5 border-t border-slate-800/85 mb-1.5"
          >
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                {echo.state === 'recording' ? (
                  <span
                    aria-hidden="true"
                    className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"
                  />
                ) : echo.state === 'playback' ? (
                  <svg
                    viewBox="0 0 12 12"
                    className="w-2.5 h-2.5 text-cyan-300 shrink-0"
                    fill="currentColor"
                  >
                    <polygon points="2,1 11,6 2,11" />
                  </svg>
                ) : echo.hasClip ? (
                  <span
                    aria-hidden="true"
                    className="inline-block w-2 h-2 rotate-45 bg-cyan-400 shrink-0"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="inline-block w-2 h-2 border border-slate-500 shrink-0"
                  />
                )}
                <span className="text-[9px] sm:text-[10px] font-mono-tabular uppercase tracking-wider text-slate-300 truncate">
                  ECHO RIG
                </span>
              </div>
              <span
                data-testid="echo-state-badge"
                className={`text-[9px] sm:text-[10px] font-mono-tabular font-bold uppercase whitespace-nowrap shrink-0 ${
                  echo.state === 'recording'
                    ? 'text-amber-400'
                    : echo.state === 'playback'
                      ? 'text-cyan-300'
                      : echo.hasClip
                        ? 'text-cyan-400'
                        : 'text-slate-400'
                }`}
              >
                {echoStateBadge}
              </span>
            </div>

            {/* Echo Timeline Progress Bar */}
            <div className="relative h-1 w-full bg-[#05080c] border border-slate-800 overflow-hidden mb-1.5">
              <div
                className={`absolute inset-y-0 left-0 ${
                  echo.state === 'recording'
                    ? 'bg-amber-400'
                    : echo.state === 'playback'
                      ? 'bg-cyan-300'
                      : echo.hasClip
                        ? 'bg-cyan-500/80'
                        : 'bg-slate-700'
                }`}
                style={{ width: `${echoPct}%` }}
              />
            </div>

            {/* Tactical Echo Controls ([T] REC · [Y] PLAY · [V] RELAY · [C] CLR) */}
            <div className="grid grid-cols-4 gap-1 pointer-events-auto">
              <button
                type="button"
                tabIndex={-1}
                data-testid="echo-btn-record"
                title="Record or Stop Chrono Echo [T]"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onEchoRecord();
                }}
                className={`px-1 py-1 text-[9px] sm:text-[10px] font-mono-tabular font-semibold uppercase border transition-colors cursor-pointer whitespace-nowrap ${
                  echo.state === 'recording'
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                    : 'bg-[#0d131d] hover:bg-[#162032] border-slate-700/80 text-slate-200'
                }`}
              >
                <span className="hidden [@media(min-width:640px)_and_(min-height:541px)]:inline">[T] </span>
                {echo.state === 'recording' ? 'STOP' : 'REC'}
              </button>

              <button
                type="button"
                tabIndex={-1}
                data-testid="echo-btn-replay"
                title={
                  echo.hasClip
                    ? 'Replay recorded Chrono Echo [Y]'
                    : 'Record an Echo with [T] first'
                }
                onClick={(e) => {
                  e.currentTarget.blur();
                  onEchoReplay();
                }}
                className={`px-1 py-1 text-[9px] sm:text-[10px] font-mono-tabular font-semibold uppercase border transition-colors cursor-pointer whitespace-nowrap ${
                  echo.state === 'playback' || echo.hasClip
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-[#0a0f17] border-slate-800/80 text-slate-500'
                }`}
              >
                <span className="hidden [@media(min-width:640px)_and_(min-height:541px)]:inline">[Y] </span>PLAY
              </button>

              <button
                type="button"
                tabIndex={-1}
                data-testid="echo-btn-relay"
                title={`Relay Teleport to active Echo [V] (${relay.fluxCost} Flux)`}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onEchoRelay();
                }}
                className={`px-1 py-1 text-[9px] sm:text-[10px] font-mono-tabular font-semibold uppercase border transition-colors cursor-pointer whitespace-nowrap ${
                  relay.canRelay
                    ? 'bg-cyan-400/25 border-cyan-300 text-white'
                    : echo.state === 'playback'
                      ? 'bg-amber-500/15 border-amber-500/70 text-amber-300'
                      : 'bg-[#0a0f17] border-slate-800/80 text-slate-500'
                }`}
              >
                {relay.cooldownTimer > 0 ? (
                  <>
                    <span className="hidden [@media(min-width:640px)_and_(min-height:541px)]:inline">[V] </span>
                    {relay.cooldownTimer.toFixed(1)}s
                  </>
                ) : (
                  <>
                    <span className="hidden [@media(min-width:640px)_and_(min-height:541px)]:inline">[V] </span>RELAY
                  </>
                )}
              </button>

              <button
                type="button"
                tabIndex={-1}
                data-testid="echo-btn-clear"
                title="Clear Echo Track [C]"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onEchoClear();
                }}
                className="px-1 py-1 text-[9px] sm:text-[10px] font-mono-tabular font-semibold uppercase bg-[#0d131d] hover:bg-[#162032] border border-slate-800 text-slate-400 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className="hidden [@media(min-width:640px)_and_(min-height:541px)]:inline">[C] </span>CLR
              </button>
            </div>

            {/* Contextual Relay & Resonance Telemetry (Hidden on small mobile when idle to prevent arena occlusion; always in DOM for tests) */}
            <div
              className={
                showContextualRelayOrResonance
                  ? 'mt-1.5 pt-1 border-t border-slate-800/70 space-y-0.5'
                  : 'hidden [@media(min-width:640px)_and_(min-height:541px)]:block mt-1 pt-1 border-t border-slate-800/60 space-y-0.5'
              }
            >
              <div
                data-testid="relay-status-readout"
                data-relay-status={relay.status}
                data-can-relay={relay.canRelay ? 'true' : 'false'}
                className="flex items-center justify-between gap-1 text-[9px] font-mono-tabular uppercase"
              >
                <span className="text-slate-400 whitespace-nowrap shrink-0">
                  RELAY [V] · {relay.fluxCost}F
                </span>
                <span className="sr-only"> · </span>
                <span
                  className={`font-bold truncate ${
                    relay.canRelay
                      ? 'text-cyan-300'
                      : relay.status === 'no_active_echo'
                        ? 'text-slate-500'
                        : 'text-amber-300'
                  }`}
                >
                  {relay.canRelay
                    ? `READY (${relay.distance.toFixed(1)}m)`
                    : relay.status === 'on_cooldown'
                      ? `COOLDOWN ${relay.cooldownTimer.toFixed(1)}s`
                      : relay.status === 'insufficient_flux'
                        ? 'LOW FLUX'
                        : relay.status === 'out_of_range'
                          ? `RANGE ${relay.distance.toFixed(1)}m/${relay.maxRange.toFixed(0)}m`
                          : relay.status === 'path_blocked'
                            ? 'PATH BLOCKED'
                            : relay.status === 'no_safe_landing'
                              ? 'NO SAFE SPOT'
                              : relay.status === 'action_locked'
                                ? 'ACTION BUSY'
                                : 'NEED REPLAY'}
                </span>
              </div>

              <div
                data-testid="resonance-status-readout"
                data-resonance-status={resonance.status}
                data-resonance-primed={resonance.primed ? 'true' : 'false'}
                data-can-converge={resonance.canConverge ? 'true' : 'false'}
                data-resonance-outcome={resonance.lastOutcome}
                className="flex items-center justify-between gap-1 text-[9px] font-mono-tabular uppercase"
              >
                <span className="text-slate-400 whitespace-nowrap shrink-0">
                  SYNC · {resonance.fluxCost}F
                </span>
                <span className="sr-only"> · </span>
                <span
                  className={`font-bold truncate ${
                    resonance.primed
                      ? resonance.canConverge
                        ? 'text-white'
                        : 'text-amber-300'
                      : resonance.status === 'on_cooldown'
                        ? 'text-amber-300'
                        : resonance.lastOutcome === 'expired' ||
                            resonance.lastOutcome === 'insufficient_flux'
                          ? 'text-amber-300'
                          : resonance.convergenceCount > 0
                            ? 'text-cyan-300'
                            : 'text-slate-500'
                  }`}
                >
                  {resonance.primed
                    ? resonance.canConverge
                      ? `PRIMED ${resonance.remainingWindow.toFixed(1)}s · HIT [E]`
                      : `PRIMED ${resonance.remainingWindow.toFixed(1)}s · LOW FLUX`
                    : resonance.status === 'on_cooldown'
                      ? `COOLDOWN ${resonance.cooldownTimer.toFixed(1)}s`
                      : resonance.lastOutcome === 'expired'
                        ? 'EXPIRED · REPLAY [Y]'
                        : resonance.lastOutcome === 'insufficient_flux'
                          ? `LOW FLUX (${resonance.fluxCost} REQ)`
                          : resonance.convergenceCount > 0
                            ? `CONVERGED ×${resonance.convergenceCount}`
                            : 'ECHO HEAVY -> [E]'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Combat & Weapon Deck */}
          <div className="pt-1 border-t border-slate-800/80">
            {/* Active Weapon Selector + Pulsecaster Heat Readout */}
            <div
              data-testid="weapon-hud-module"
              data-equipped-weapon={hud.weapon.equippedWeaponId}
              data-overheated={hud.weapon.overheated ? 'true' : 'false'}
              className="mb-1"
            >
              <div className="flex items-center justify-between gap-1.5 mb-0.5 pointer-events-auto">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    aria-hidden="true"
                    className={`inline-block w-1.5 h-1.5 shrink-0 ${
                      hud.weapon.overheated
                        ? 'bg-red-500 animate-pulse'
                        : hud.weapon.equippedWeaponId === 'pulsecaster'
                          ? 'bg-sky-400 rounded-full'
                          : 'bg-cyan-400 rotate-45'
                    }`}
                  />
                  <span
                    data-testid="weapon-active-label"
                    className={`text-[9px] sm:text-[10px] font-mono-tabular font-bold uppercase tracking-wider truncate ${
                      hud.weapon.overheated
                        ? 'text-red-400'
                        : hud.weapon.equippedWeaponId === 'pulsecaster'
                          ? 'text-sky-300'
                          : 'text-cyan-300'
                    }`}
                  >
                    {hud.weapon.label}
                  </span>
                </div>

                <button
                  type="button"
                  tabIndex={-1}
                  data-testid="weapon-switch-btn"
                  aria-label={`Switch Weapon [Tab / Z] (Currently ${hud.weapon.label})`}
                  title="Switch Weapon [Tab / Z / 1-2]"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onSwitchWeapon?.();
                  }}
                  className={`px-1.5 py-0.5 text-[9px] font-mono-tabular font-semibold uppercase border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    hud.weapon.equippedWeaponId === 'pulsecaster'
                      ? 'bg-sky-500/20 hover:bg-sky-500/30 border-sky-400 text-sky-200'
                      : 'bg-[#0d1522] hover:bg-[#17243a] border-cyan-500/60 text-cyan-200'
                  }`}
                >
                  <span className="hidden [@media(min-width:640px)_and_(min-height:541px)]:inline">[TAB] </span>
                  {hud.weapon.equippedWeaponId === 'chrono_edge' ? '→ PULSE' : '→ EDGE'}
                </button>
              </div>

              {/* Pulsecaster Heat & Status Bar (Always mounted in DOM for deterministic telemetry) */}
              <div
                data-testid="pulsecaster-heat-bar"
                data-heat={hud.weapon.heat}
                data-max-heat={hud.weapon.maxHeat}
                data-overheated={hud.weapon.overheated ? 'true' : 'false'}
                className="flex items-center gap-1.5"
              >
                <div className="relative h-1 flex-1 bg-[#05080c] border border-slate-800 overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-75 ${
                      hud.weapon.overheated
                        ? 'bg-red-500'
                        : hud.weapon.heat >= 70
                          ? 'bg-amber-400'
                          : 'bg-sky-400'
                    }`}
                    style={{ width: `${Math.round(hud.weapon.heatRatio * 100)}%` }}
                  />
                </div>
                <span
                  data-testid="weapon-status-readout"
                  className={`text-[8px] sm:text-[9px] font-mono-tabular uppercase whitespace-nowrap shrink-0 ${
                    hud.weapon.overheated
                      ? 'text-red-400 font-bold'
                      : hud.weapon.equippedWeaponId === 'pulsecaster'
                        ? hud.weapon.heat >= 70
                          ? 'text-amber-300 font-semibold'
                          : 'text-sky-300'
                        : 'text-slate-400'
                  }`}
                >
                  {hud.weapon.overheated
                    ? `OVERHEAT ${hud.weapon.overheatTimer.toFixed(1)}s`
                    : hud.weapon.equippedWeaponId === 'pulsecaster'
                      ? `HEAT ${hud.weapon.heat}%`
                      : `COMBO ${hud.comboStep}/3`}
                </span>
              </div>
            </div>

            <div className="hidden [@media(min-width:640px)_and_(min-height:541px)]:flex items-center justify-between gap-2 text-[9px] sm:text-[10px] font-mono-tabular text-slate-400 mb-1">
              <span className="whitespace-nowrap shrink-0">
                {hud.weapon.equippedWeaponId === 'pulsecaster'
                  ? 'RANGED · 12.5m'
                  : `COMBO ${hud.comboStep}/3`}
              </span>
              <span
                className={`whitespace-nowrap shrink-0 ${
                  resonance.primed && resonance.canConverge
                    ? 'text-white font-semibold'
                    : isEmpoweredReady
                      ? 'text-amber-300 font-medium'
                      : 'text-slate-500'
                }`}
              >
                {resonance.primed && resonance.canConverge
                  ? 'CONVERGE [E] 15 FLUX'
                  : isEmpoweredReady
                    ? hud.weapon.equippedWeaponId === 'pulsecaster'
                      ? 'LANCE [E] EMPOWERED'
                      : 'HEAVY [E] EMPOWERED'
                    : hud.weapon.equippedWeaponId === 'pulsecaster'
                      ? 'LANCE [E] 20 FLUX'
                      : 'HEAVY [E] 25 FLUX'}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 pointer-events-auto">
              <button
                type="button"
                tabIndex={-1}
                data-testid="combat-btn-light"
                title="Light combo — tap LMB / F / J"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onLightAttack?.();
                }}
                className="px-1 py-1 text-[9px] sm:text-[10px] font-mono-tabular font-semibold uppercase bg-[#0d131d] hover:bg-[#162032] border border-slate-700/80 text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className="hidden [@media(min-width:640px)_and_(min-height:541px)]:inline">[F] </span>LIGHT
              </button>

              <button
                type="button"
                tabIndex={-1}
                data-testid="combat-btn-heavy"
                title="Charged Heavy — hold LMB / J then release, or tap E / K / RMB"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onHeavyAttack?.();
                }}
                className={`px-1 py-1 text-[9px] sm:text-[10px] font-mono-tabular font-semibold uppercase border transition-colors cursor-pointer whitespace-nowrap ${
                  resonance.primed && resonance.canConverge
                    ? 'bg-cyan-400/25 border-white text-white'
                    : isEmpoweredReady
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-[#0d131d] hover:bg-[#162032] border-slate-700/80 text-slate-200'
                }`}
              >
                <span className="hidden [@media(min-width:640px)_and_(min-height:541px)]:inline">[E] </span>HEAVY
              </button>

              <button
                type="button"
                tabIndex={-1}
                data-testid="combat-btn-dodge"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onDodge?.();
                }}
                className="px-1 py-1 text-[9px] sm:text-[10px] font-mono-tabular font-semibold uppercase bg-[#0d131d] hover:bg-[#162032] border border-slate-800 text-slate-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                DODGE
              </button>

              <button
                type="button"
                tabIndex={-1}
                data-testid="combat-btn-parry"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onParry?.();
                }}
                className="px-1 py-1 text-[9px] sm:text-[10px] font-mono-tabular font-semibold uppercase bg-[#0d131d] hover:bg-[#162032] border border-slate-800 text-slate-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className="hidden [@media(min-width:640px)_and_(min-height:541px)]:inline">[Q] </span>PARRY
              </button>
            </div>

            {/* Chapter III Gravity Pin [G] & Chapter IV Echo Collapse [X] Controls */}
            {(hud.gravityPin.unlocked || hud.echoCollapse.unlocked) && (
              <div className="grid grid-cols-2 gap-1 mt-1 pointer-events-auto">
                {hud.gravityPin.unlocked && (
                  <button
                    type="button"
                    tabIndex={-1}
                    data-testid="combat-btn-gravity-pin"
                    data-can-activate={hud.gravityPin.status === 'ready' ? 'true' : 'false'}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onGravityPin?.();
                    }}
                    className={`px-1.5 py-1 text-[9px] sm:text-[10px] font-mono-tabular font-semibold uppercase border transition-colors cursor-pointer whitespace-nowrap truncate ${
                      hud.gravityPin.status === 'active'
                        ? 'bg-purple-500/25 border-purple-300 text-purple-200'
                        : hud.gravityPin.status === 'ready'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-[#0d131d] border-slate-800 text-slate-500'
                    }`}
                  >
                    {hud.gravityPin.status === 'active'
                      ? `[G] PIN ${hud.gravityPin.activeDurationTimer.toFixed(1)}s`
                      : hud.gravityPin.cooldownTimer > 0
                        ? `[G] PIN ${hud.gravityPin.cooldownTimer.toFixed(1)}s`
                        : `[G] PIN (${hud.gravityPin.fluxCost})`}
                  </button>
                )}
                {hud.echoCollapse.unlocked && (
                  <button
                    type="button"
                    tabIndex={-1}
                    data-testid="combat-btn-echo-collapse"
                    data-can-activate={hud.echoCollapse.status === 'ready' ? 'true' : 'false'}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onEchoCollapse?.();
                    }}
                    className={`px-1.5 py-1 text-[9px] sm:text-[10px] font-mono-tabular font-semibold uppercase border transition-colors cursor-pointer whitespace-nowrap truncate ${
                      hud.echoCollapse.status === 'ready'
                        ? 'bg-rose-500/25 border-rose-300 text-white'
                        : 'bg-[#0d131d] border-slate-800 text-slate-500'
                    }`}
                  >
                    {hud.echoCollapse.cooldownTimer > 0
                      ? `[X] COLLAPSE ${hud.echoCollapse.cooldownTimer.toFixed(1)}s`
                      : `[X] COLLAPSE (${hud.echoCollapse.fluxCost})`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cluster 2 (Top-Center): Progressive Objective Tracker OR Consolidated Boss HUD */}
        <div className="order-3 md:order-2 flex flex-col items-center w-full md:max-w-lg">
          {/* Standard / Calibration / Loom Objective Card (Hidden when Boss HUD is active so top-center doesn't double-stack!) */}
          <div
            className={
              boss
                ? 'sr-only'
                : 'bg-[#090d14]/90 border border-slate-800/90 px-3 sm:px-4 py-1.5 sm:py-2 w-full shadow-[0_8px_24px_rgba(0,0,0,0.65)]'
            }
          >
            {/* Primary Objective Row */}
            <div className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono-tabular text-cyan-400 tracking-wider uppercase">
              <span className="font-bold truncate">
                {!boss && !hud.loom.active ? calGuidance.headline : hud.objectiveText}
              </span>
              {!hud.loom.active && (
                <span className="text-slate-300 font-semibold whitespace-nowrap shrink-0">
                  PROXIES {hud.totalEnemies - hud.enemiesAlive}/{hud.totalEnemies}
                </span>
              )}
            </div>

            {/* Single Actionable Current Instruction */}
            <div
              data-testid="calibration-active-objective"
              className="text-[10px] sm:text-xs text-slate-200 leading-snug mt-0.5 line-clamp-2"
            >
              {!boss && !hud.loom.active
                ? echo.statusMessage &&
                  (echo.statusMessage.includes('REJECTED') ||
                    echo.statusMessage.includes('MISALIGNED') ||
                    echo.statusMessage.includes('NO VALID'))
                  ? echo.statusMessage
                  : calGuidance.instruction
                : echo.state !== 'idle' && echo.statusMessage
                  ? echo.statusMessage
                  : hud.objectiveSubtext}
            </div>

            {/* Progressive 3-Step Calibration Bar (Preserves pressure-plate-status and chrono-puzzle-status test IDs & attributes) */}
            <div
              className={
                boss || hud.loom.active
                  ? 'sr-only'
                  : 'mt-1.5 pt-1 border-t border-slate-800/80 flex items-center justify-between gap-1.5 text-[9px] sm:text-[10px] font-mono-tabular uppercase'
              }
            >
              {/* Step 1: Anchor Pad 01 */}
              <div
                data-testid="pressure-plate-status"
                data-plate-activated={plate.active ? 'true' : 'false'}
                data-barrier-open={plate.barrierOpen ? 'true' : 'false'}
                className={`px-1.5 py-0.5 border truncate ${
                  puzzle.teachCompleted || plate.active
                    ? 'bg-cyan-500/15 border-cyan-400/70 text-cyan-300 font-bold'
                    : calGuidance.stepNumber === 1
                      ? 'bg-[#101c2e] border-cyan-500/60 text-white font-semibold'
                      : 'bg-[#070b12] border-slate-800 text-slate-500'
                }`}
              >
                1. PAD 01: {plate.active ? 'ACTIVE' : puzzle.teachCompleted ? 'DONE' : 'HOLD [Y]'}
              </div>

              {/* Step 2 & 3: Receiver & Final Gate */}
              <div
                data-testid="chrono-puzzle-status"
                data-puzzle-stage={puzzle.stage}
                data-receiver-charged={puzzle.receiverCharged ? 'true' : 'false'}
                data-combine-plate-active={puzzle.combinePlateActive ? 'true' : 'false'}
                data-final-barrier-open={puzzle.finalBarrierOpen ? 'true' : 'false'}
                className="flex items-center gap-1.5 min-w-0"
              >
                <span
                  className={`px-1.5 py-0.5 border whitespace-nowrap ${
                    puzzle.receiverCharged
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                      : puzzle.testCompleted
                        ? 'bg-cyan-500/15 border-cyan-400/60 text-cyan-300'
                        : calGuidance.stepNumber === 2
                          ? 'bg-[#101c2e] border-cyan-500/60 text-white font-semibold'
                          : 'bg-[#070b12] border-slate-800 text-slate-500'
                  }`}
                >
                  2. RCV:{' '}
                  {puzzle.receiverCharged
                    ? `${puzzle.receiverChargeTimer.toFixed(1)}s`
                    : puzzle.testCompleted
                      ? 'DONE'
                      : 'HEAVY [E]'}
                </span>

                <span
                  className={`px-1.5 py-0.5 border whitespace-nowrap ${
                    puzzle.finalBarrierOpen
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                      : calGuidance.stepNumber === 3
                        ? 'bg-[#101c2e] border-cyan-500/60 text-white font-semibold'
                        : 'bg-[#070b12] border-slate-800 text-slate-500'
                  }`}
                >
                  3. GATE: {puzzle.finalBarrierOpen ? 'OPEN' : 'LOCKED'}
                </span>
              </div>
            </div>
          </div>

          {/* Consolidated Boss Encounter HUD (Single cohesive top-center card during boss fights) */}
          {boss ? (
            <div
              data-testid="boss-hud"
              data-boss-phase={boss.phase}
              data-boss-state={boss.aiState}
              data-boss-attack={boss.activeAttack ?? 'none'}
              data-boss-core-exposed={boss.coreExposed ? 'true' : 'false'}
              className={`w-full bg-[#090d14]/94 border px-3 sm:px-4 py-2 sm:py-2.5 shadow-[0_10px_28px_rgba(0,0,0,0.75)] ${
                boss.coreExposed
                  ? 'border-white shadow-[0_0_24px_rgba(255,255,255,0.28)]'
                  : boss.isResonanceMarked
                    ? 'border-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.3)]'
                    : boss.aiState === 'phase_transition' || boss.phase === 2
                      ? 'border-red-500/90'
                      : boss.aiState === 'telegraph'
                        ? 'border-amber-400'
                        : 'border-slate-700/90'
              }`}
            >
              {/* Top Row: Boss Identity, Phase Indicator & Core Shield/Exposed Status */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span
                    data-testid="boss-name"
                    className="text-xs sm:text-sm font-display font-bold tracking-wider text-slate-100 uppercase whitespace-nowrap"
                  >
                    {boss.name}
                  </span>
                  <span className="hidden sm:inline text-[10px] font-mono-tabular uppercase tracking-widest text-slate-400 truncate">
                    {boss.subtitle}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 font-mono-tabular text-[10px] sm:text-[11px] whitespace-nowrap shrink-0">
                  {boss.isResonanceMarked && (
                    <span
                      data-testid="enemy-resonance-badge"
                      className="text-cyan-300 font-bold tracking-wider uppercase"
                    >
                      RESONANCE · {boss.resonanceRemaining.toFixed(1)}s
                    </span>
                  )}
                  <span
                    data-testid="boss-core-status"
                    className={`font-bold uppercase tracking-wider ${
                      boss.coreExposed ? 'text-white' : 'text-amber-400/90'
                    }`}
                  >
                    {boss.coreExposed ? 'CORE EXPOSED' : 'CORE SHIELDED'}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">
                    ·
                  </span>
                  <span data-testid="boss-hp" className="text-slate-200 font-bold">
                    {boss.hp}/{boss.maxHp}
                  </span>
                </div>
              </div>

              {/* Boss Segmented 2-Phase Health Bar with 50% Phase II Threshold Marker */}
              <div className="relative h-2.5 w-full bg-[#05080c] border border-slate-800 overflow-hidden mb-1">
                <div
                  className="absolute inset-y-0 left-0 bg-amber-300/60 transition-all duration-75"
                  style={{ width: `${bossGhostPct}%` }}
                />
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-75 ${
                    boss.coreExposed
                      ? 'bg-white'
                      : boss.phase === 2
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                  }`}
                  style={{ width: `${bossHpPct}%` }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-1/2 w-[2px] bg-slate-950/90 z-10"
                />
              </div>

              {/* Boss Stagger Posture Bar */}
              <div className="relative h-1.5 w-full bg-[#05080c] border border-slate-900 overflow-hidden mb-1">
                <div
                  className="absolute inset-y-0 left-0 bg-cyan-400 transition-all duration-75"
                  style={{ width: `${bossStaggerPct}%` }}
                />
              </div>

              {/* Bottom Telemetry Row: Phase Label, Active Attack / State Readout & Stagger Meter */}
              <div className="flex items-center justify-between gap-2 text-[9px] sm:text-[10px] font-mono-tabular uppercase">
                <span
                  data-testid="boss-phase"
                  className={`font-bold whitespace-nowrap shrink-0 ${
                    boss.phase === 2 ? 'text-red-400' : 'text-amber-300'
                  }`}
                >
                  {boss.phase === 2 ? 'PHASE II · OVERLOAD' : 'PHASE I · CONTAINMENT'}
                </span>
                <span
                  data-testid="boss-state"
                  className={`font-semibold truncate ${
                    boss.coreExposed
                      ? 'text-white'
                      : boss.aiState === 'telegraph'
                        ? 'text-amber-300'
                        : boss.aiState === 'attack' || boss.aiState === 'phase_transition'
                          ? 'text-red-400'
                          : 'text-slate-300'
                  }`}
                >
                  {boss.statusLabel.replace(/^PHASE\s+(I|II)\s*·\s*/i, '')}
                </span>
                <span
                  data-testid="boss-stagger"
                  className="text-cyan-300 font-semibold whitespace-nowrap shrink-0"
                >
                  STAGGER {boss.stagger}/{boss.maxStagger}
                </span>
              </div>

              {/* Actionable Boss Counterplay Cue */}
              <div className="mt-1 pt-1 border-t border-slate-800/70 text-[10px] sm:text-[11px] text-slate-300 truncate">
                {hud.objectiveSubtext.replace(
                  /^PHASE\s+(I|II)\s+(PROTOCOL|OVERLOAD)\s*·\s*/i,
                  ''
                )}
              </div>

              {/* Chapter II THE CHOIR Harmonic Nodes Readout */}
              {hud.choir.active && (
                <div
                  data-testid="choir-hud-telemetry"
                  data-sync-count={hud.choir.synchronizedCount}
                  className="mt-1 pt-1 border-t border-slate-800/80 flex items-center justify-between gap-1.5 text-[9px] sm:text-[10px] font-mono-tabular uppercase"
                >
                  <div className="flex items-center gap-1 shrink-0">
                    {hud.choir.nodes.map((node) => (
                      <span
                        key={node.id}
                        data-testid={`choir-node-${node.id}`}
                        data-node-status={node.status}
                        className={`px-1.5 py-0.5 border font-bold ${
                          node.status === 'synchronized'
                            ? 'bg-white/20 border-white text-white'
                            : node.status === 'primed'
                              ? 'bg-cyan-500/20 border-cyan-300 text-cyan-200'
                              : 'bg-[#070b11] border-slate-700 text-slate-400'
                        }`}
                      >
                        {node.label.replace('HARMONIC ', '')}: {node.status.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  <span className="text-cyan-300 truncate">{hud.choir.statusMessage}</span>
                </div>
              )}

              {/* Chapter III THE CURATOR Reconstructed Traces & Decoy Readout */}
              {hud.curator.active && (
                <div
                  data-testid="curator-hud-telemetry"
                  data-trace-count={hud.curator.traces.length}
                  data-decoy-count={hud.curator.decoyIds.length}
                  className="mt-1 pt-1 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[9px] sm:text-[10px] font-mono-tabular uppercase"
                >
                  <span className="text-purple-300 font-bold whitespace-nowrap">
                    TRACES: {hud.curator.traces.length} · DECOYS: {hud.curator.decoyIds.length}
                  </span>
                  <span className="text-slate-300 truncate">{hud.curator.statusMessage}</span>
                </div>
              )}

              {/* Chapter IV MATRON-V Anti-Echo Suppression & Siphon Readout */}
              {hud.matron.active && (
                <div
                  data-testid="matron-hud-telemetry"
                  data-echo-suppressed={hud.matron.echoSuppressedTimer > 0 ? 'true' : 'false'}
                  data-chrono-sever-active={hud.matron.chronoSeverActive ? 'true' : 'false'}
                  className="mt-1 pt-1 border-t border-slate-800/80 flex items-center justify-between gap-2 text-[9px] sm:text-[10px] font-mono-tabular uppercase"
                >
                  <span
                    className={`font-bold whitespace-nowrap ${
                      hud.matron.echoSuppressedTimer > 0 || hud.matron.chronoSeverActive
                        ? 'text-rose-400'
                        : 'text-amber-300'
                    }`}
                  >
                    {hud.matron.echoSuppressedTimer > 0
                      ? `ECHO SUPPRESSED ${hud.matron.echoSuppressedTimer.toFixed(1)}s`
                      : hud.matron.chronoSeverActive
                        ? 'CHRONO SEVER ACTIVE'
                        : `SIPHONED FLUX: ${hud.matron.totalFluxDrained}`}
                  </span>
                  <span className="text-slate-300 truncate">{hud.matron.statusMessage}</span>
                </div>
              )}
            </div>
          ) : (
            /* Standard Focused Enemy Status Bar (Contextually shown on mobile when damaged, telegraphing, vulnerable, or marked so full-HP idle enemies don't occlude the arena) */
            focused && (
              <div
                className={`mt-1 w-full bg-[#090d14]/90 border px-2.5 sm:px-3.5 py-1.5 ${
                  focused.hp < focused.maxHp ||
                  isEnemyVulnerable ||
                  isEnemyTelegraphing ||
                  focused.isResonanceMarked ||
                  focused.isDecoy ||
                  (focused.pinnedTimer ?? 0) > 0
                    ? 'block'
                    : 'hidden sm:block'
                } ${
                  isEnemyVulnerable
                    ? 'border-white shadow-[0_0_20px_rgba(255,255,255,0.25)]'
                    : focused.isDecoy
                      ? 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.28)]'
                      : focused.isResonanceMarked
                        ? 'border-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.28)]'
                        : isEnemyTelegraphing
                          ? 'border-amber-400'
                          : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] sm:text-xs font-display font-bold tracking-wider text-slate-100 uppercase whitespace-nowrap">
                    {focused.name}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono-tabular text-[9px] sm:text-[11px] whitespace-nowrap shrink-0">
                    {focused.isDecoy && (
                      <span
                        data-testid="enemy-decoy-badge"
                        className="text-purple-300 font-bold tracking-wider uppercase"
                      >
                        FALSE ECHO DECOY
                      </span>
                    )}
                    {(focused.pinnedTimer ?? 0) > 0 && (
                      <span
                        data-testid="enemy-pinned-badge"
                        className="text-cyan-300 font-bold tracking-wider uppercase"
                      >
                        PINNED
                      </span>
                    )}
                    {focused.isResonanceMarked && (
                      <span
                        data-testid="enemy-resonance-badge"
                        className="text-cyan-300 font-bold tracking-wider uppercase"
                      >
                        RESONANCE · {focused.resonanceRemaining.toFixed(1)}s
                      </span>
                    )}
                    {isEnemyVulnerable && (
                      <span className="text-white font-bold tracking-wider uppercase">
                        EXPOSED · 1.5x
                      </span>
                    )}
                    {isEnemyTelegraphing && (
                      <span className="text-amber-400 font-bold tracking-wider uppercase">
                        WARNING
                      </span>
                    )}
                    <span className="text-slate-300 font-semibold">
                      {focused.hp}/{focused.maxHp}
                    </span>
                  </div>
                </div>

                <div className="relative h-1.5 w-full bg-[#05080c] border border-slate-800 overflow-hidden mb-0.5">
                  <div
                    className="absolute inset-y-0 left-0 bg-amber-300/60"
                    style={{ width: `${enemyGhostPct}%` }}
                  />
                  <div
                    className={`absolute inset-y-0 left-0 ${
                      isEnemyVulnerable
                        ? 'bg-white'
                        : isEnemyTelegraphing
                          ? 'bg-amber-400'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${enemyHpPct}%` }}
                  />
                </div>

                <div className="relative h-1 w-full bg-[#05080c] overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-cyan-400"
                    style={{ width: `${enemyStaggerPct}%` }}
                  />
                </div>
              </div>
            )
          )}
        </div>

        {/* Cluster 3 (Top-Right): Clear System & Navigation Controls (Fits on Row 1 beside Cluster 1 on 390px mobile) */}
        <div className="order-2 md:order-3 flex items-center gap-1 sm:gap-1.5 pointer-events-auto shrink-0">
          {hud.run.isChapterReplay &&
            Boolean(hud.run.savedCampaignSnapshot) &&
            onRestoreCampaign && (
              <button
                type="button"
                tabIndex={-1}
                data-testid="hud-btn-restore-campaign"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onRestoreCampaign();
                }}
                className="h-8 sm:h-9 px-2 sm:px-2.5 flex items-center justify-center font-mono-tabular text-[9px] sm:text-[11px] font-bold uppercase bg-[#0d1c2e] hover:bg-[#17314f] border border-cyan-400 text-cyan-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                RESTORE CAMPAIGN
              </button>
            )}

          {onStartBoss && (
            <button
              type="button"
              tabIndex={-1}
              data-testid="hud-btn-boss"
              aria-label="Practice HELIX-04 Boss [B]"
              title="Isolated Practice Arena: HELIX-04 [B]"
              onClick={(e) => {
                e.currentTarget.blur();
                onStartBoss();
              }}
              className={`hidden lg:flex h-8 sm:h-9 px-2 items-center justify-center font-mono-tabular text-[9px] sm:text-[10px] font-semibold uppercase border transition-colors cursor-pointer whitespace-nowrap ${
                hud.run.mode === 'practice_boss'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-[#090d14]/85 hover:bg-[#162032] border-slate-700/80 text-slate-400 hover:text-amber-300'
              }`}
            >
              <span>PRACTICE [B]</span>
            </button>
          )}

          <button
            type="button"
            tabIndex={-1}
            aria-label={isMuted ? 'Unmute Audio [M]' : 'Mute Audio [M]'}
            title="Mute / Unmute Audio [M]"
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-[#090d14]/90 hover:bg-[#162032] border border-slate-700/90 text-slate-200 transition-colors cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-cyan-400"
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
                </>
              )}
            </svg>
          </button>

          <button
            type="button"
            tabIndex={-1}
            aria-label="Restart Encounter [R]"
            title="Restart Encounter / Retry Checkpoint [R]"
            onClick={(e) => {
              e.currentTarget.blur();
              onRestart();
            }}
            className="h-8 sm:h-9 px-2 flex items-center gap-1 justify-center bg-[#090d14]/90 hover:bg-[#162032] border border-slate-700/90 text-slate-200 transition-colors cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 text-amber-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span className="hidden lg:inline text-[10px] font-mono-tabular font-semibold">
              RETRY [R]
            </span>
          </button>

          <button
            type="button"
            tabIndex={-1}
            data-testid="hud-btn-pause"
            aria-label="Pause Game [P]"
            title="Pause Game [P / Esc]"
            onClick={(e) => {
              e.currentTarget.blur();
              onTogglePause();
            }}
            className="h-8 sm:h-9 px-2.5 flex items-center gap-1.5 justify-center bg-[#090d14]/90 hover:bg-[#162032] border border-slate-700/90 text-slate-200 transition-colors cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 text-slate-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="6" y="4" width="4" height="16" fill="#0f172a" />
              <rect x="14" y="4" width="4" height="16" fill="#0f172a" />
            </svg>
            <span className="hidden lg:inline text-[10px] font-mono-tabular font-semibold">
              PAUSE [P]
            </span>
          </button>
        </div>
      </div>

      {/* Gaze-Routed Center Crosshair & Heavy Charge Gauge */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
        aria-hidden="true"
      >
        <svg viewBox="0 0 48 48" className="w-10 h-10 opacity-75">
          <circle
            cx="24"
            cy="24"
            r="14"
            fill="none"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          {hud.chargeRatio > 0.05 && (
            <circle
              cx="24"
              cy="24"
              r="14"
              fill="none"
              stroke={hud.chargeRatio >= 1 ? '#22d3ee' : '#f59e0b'}
              strokeWidth="2.5"
              strokeDasharray={`${hud.chargeRatio * 88} 90`}
              transform="rotate(-90 24 24)"
            />
          )}
          <circle
            cx="24"
            cy="24"
            r="2"
            fill={hud.chargeRatio >= 1 ? '#22d3ee' : '#f8fafc'}
          />
        </svg>
      </div>

      {/* Skippable Campaign Opening Transmission Card (Stage: intro) */}
      {hud.run.stage === 'intro' && (
        <div
          data-testid="campaign-intro-banner"
          className="fixed left-1/2 bottom-28 sm:bottom-32 -translate-x-1/2 z-20 w-[92vw] max-w-lg bg-[#090e17]/95 border border-cyan-400/85 p-3.5 sm:p-4 pointer-events-auto shadow-[0_14px_36px_rgba(0,0,0,0.85)]"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-mono-tabular font-bold uppercase tracking-widest text-cyan-400">
                PROLOGUE · WAKE — LOG-00 // LYSA VENN
              </span>
            </div>
            <button
              type="button"
              data-testid="btn-skip-intro"
              onClick={(e) => {
                e.currentTarget.blur();
                onSkipIntro?.();
              }}
              className="px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-colors cursor-pointer whitespace-nowrap"
            >
              BEGIN CALIBRATION [SPACE]
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-snug mb-2">
            “Sera—if Bay 04 recognized your biometrics, the Chrono Rig is yours. Move with{' '}
            <span className="text-cyan-300 font-mono-tabular font-semibold">[WASD]</span> or press{' '}
            <span className="text-cyan-300 font-mono-tabular font-semibold">[SPACE]</span> to
            synchronize the bay and breach Marshal{' '}
            <span className="text-amber-300 font-semibold">HELIX-04</span>’s containment lock.”
          </p>
          <div className="relative h-1 w-full bg-[#05080c] overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-cyan-400 transition-all duration-75"
              style={{
                width: `${Math.max(0, Math.min(100, (hud.run.introTimer / Math.max(0.1, hud.run.introDuration)) * 100))}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* In-World Live Narrative Comms Feed (Non-blocking during active exploration & combat) */}
      {hud.comms.active &&
        hud.run.stage !== 'intro' &&
        hud.run.stage !== 'transition_to_boss' &&
        (!hud.loom.active || inspectingLoomChamber) && (
          <div
            data-testid="live-comms-banner"
            data-comms-id={hud.comms.active.id}
            data-comms-classification={hud.comms.active.classification}
            className="fixed left-2 sm:left-5 bottom-36 sm:bottom-28 [@media(max-height:540px)]:left-2.5 [@media(max-height:540px)]:right-auto [@media(max-height:540px)]:bottom-2 [@media(max-height:540px)]:w-[348px] [@media(max-height:540px)]:p-2 z-15 w-[92vw] sm:w-92 max-w-md bg-[#080d16]/94 border-l-2 border-cyan-400 border-y border-r border-slate-800/95 p-2.5 sm:p-3 pointer-events-auto shadow-[0_10px_28px_rgba(0,0,0,0.82)]"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 animate-pulse ${
                    hud.comms.active.classification === 'LIVE WARDEN DIRECTIVE'
                      ? 'bg-red-400'
                      : hud.comms.active.classification === 'RECONSTRUCTED TRACE'
                        ? 'bg-amber-400'
                        : 'bg-cyan-400'
                  }`}
                />
                <span
                  data-testid="live-comms-classification"
                  className={`text-[9px] font-mono-tabular font-bold uppercase tracking-widest px-1.5 py-0.5 border shrink-0 ${
                    hud.comms.active.classification === 'LIVE WARDEN DIRECTIVE'
                      ? 'text-red-300 border-red-500/50 bg-red-950/40'
                      : hud.comms.active.classification === 'RECONSTRUCTED TRACE'
                        ? 'text-amber-300 border-amber-500/50 bg-amber-950/40'
                        : hud.comms.active.classification === 'LIVE NEURAL TRACE'
                          ? 'text-emerald-300 border-emerald-500/50 bg-emerald-950/40'
                          : 'text-cyan-300 border-cyan-500/50 bg-cyan-950/40'
                  }`}
                >
                  {hud.comms.active.classification}
                </span>
                <span className="text-[10px] font-mono-tabular font-semibold text-slate-300 truncate">
                  {hud.comms.active.speaker}
                </span>
              </div>
              <button
                type="button"
                tabIndex={-1}
                data-testid="btn-dismiss-comms"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onDismissComms?.();
                }}
                className="px-1.5 py-0.5 text-[9px] font-mono-tabular uppercase text-slate-400 hover:text-white bg-[#0e1624] border border-slate-700/80 cursor-pointer shrink-0"
              >
                ACK
              </button>
            </div>
            <div
              data-testid="live-comms-headline"
              className="text-[10px] sm:text-[11px] font-mono-tabular font-bold uppercase tracking-wider text-slate-100 mb-0.5"
            >
              {hud.comms.active.headline}
            </div>
            <p
              data-testid="live-comms-body"
              className="text-[11px] text-slate-200 leading-snug mb-1.5"
            >
              {hud.comms.active.body}
            </p>
            {hud.comms.active.tacticalHint && (
              <div
                data-testid="live-comms-hint"
                className="text-[10px] font-mono-tabular text-amber-300 leading-snug mb-1.5 pt-1 border-t border-slate-800/80"
              >
                TACTICAL: {hud.comms.active.tacticalHint}
              </div>
            )}
            <div className="relative h-0.5 w-full bg-[#05080c] overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-cyan-400 transition-all duration-75"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      (hud.comms.active.remainingTime / Math.max(0.1, hud.comms.active.maxDuration)) * 100
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

      {/* Skippable Sector Arrival & Marshal Awakening Banner (Stage: boss_intro) */}
      {hud.encounterMode === 'boss' && hud.run.stage === 'boss_intro' && (
        <div
          data-testid="boss-intro-banner"
          className="fixed left-1/2 bottom-28 sm:bottom-32 -translate-x-1/2 z-20 w-[92vw] max-w-xl bg-[#090e17]/95 border border-amber-400/85 p-3.5 sm:p-4 pointer-events-auto shadow-[0_14px_36px_rgba(0,0,0,0.85)]"
        >
          {(() => {
            const chapterCfg =
              GAME_CONFIG.campaignChapters[hud.run.chapter] ??
              GAME_CONFIG.campaignChapters.chapter_1_helix;
            return (
              <>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-mono-tabular font-bold uppercase tracking-widest text-amber-300 truncate">
                      {chapterCfg.sectorName} // {chapterCfg.wardenRole}
                    </span>
                  </div>
                  <button
                    type="button"
                    data-testid="btn-skip-boss-intro"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onSkipBossIntro?.();
                    }}
                    className="px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    ENGAGE MARSHAL [SPACE]
                  </button>
                </div>
                <div className="text-sm sm:text-base font-display font-bold uppercase tracking-wider text-white mb-0.5">
                  {chapterCfg.title} — {chapterCfg.subtitle}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-200 leading-snug mb-2">
                  {chapterCfg.transitionBriefing}
                </p>
                <div className="relative h-1 w-full bg-[#05080c] overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-amber-400 animate-pulse"
                    style={{ width: '100%' }}
                  />
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Skippable Containment Breach Transition Card (Stage: transition_to_boss) */}
      {hud.run.stage === 'transition_to_boss' && (
        <div
          data-testid="containment-transition-banner"
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[92vw] max-w-lg bg-[#0b101a]/96 border-2 border-amber-400 p-4 sm:p-5 pointer-events-auto shadow-[0_18px_50px_rgba(0,0,0,0.9)]"
        >
          {(() => {
            const transitionChapterCfg =
              GAME_CONFIG.campaignChapters[hud.run.chapter] ??
              GAME_CONFIG.campaignChapters.prologue;
            return (
              <>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] sm:text-xs font-mono-tabular font-bold uppercase tracking-widest text-cyan-300">
                    {transitionChapterCfg.transitionHeadline}
                  </span>
                  <button
                    type="button"
                    data-testid="btn-skip-transition"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onSkipTransition?.();
                    }}
                    className="px-3 py-1 text-[10px] font-mono-tabular font-bold uppercase bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    ENGAGE NOW [SPACE]
                  </button>
                </div>
                <h3 className="text-lg sm:text-xl font-display font-bold uppercase tracking-wider text-slate-100 mb-1">
                  CHAPTER I: MARSHAL HELIX-04 AWAKENING
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-snug mb-2">
                  {transitionChapterCfg.transitionBriefing}
                </p>
                {hud.run.checkpointNotice && (
                  <p
                    data-testid="transition-checkpoint-notice"
                    className="text-[11px] sm:text-xs font-mono-tabular text-amber-300 mb-2.5"
                  >
                    {hud.run.checkpointNotice}
                  </p>
                )}
                <div className="relative h-1.5 w-full bg-[#05080c] border border-slate-800 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-amber-400 transition-all duration-75"
                    style={{
                      width: `${Math.max(0, Math.min(100, (1 - hud.run.transitionTimer / Math.max(0.1, hud.run.transitionDuration)) * 100))}%`,
                    }}
                  />
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Chapter V — THE LAST LOOP: Minimized 3D Chamber Exploration Bar OR Full Directive Console */}
      {hud.loom.active && hud.run.stage === 'chronicle_loom' && inspectingLoomChamber && (
        <div
          data-testid="chronicle-loom-minimized-bar"
          className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-xl bg-[#090e17]/95 border-2 border-cyan-400 px-4 py-2.5 pointer-events-auto shadow-[0_14px_36px_rgba(0,0,0,0.85)] flex items-center justify-between gap-3"
        >
          <div className="min-w-0">
            <div className="text-[10px] font-mono-tabular font-bold uppercase tracking-widest text-cyan-400">
              CHRONICLE LOOM CORE · 3D CHAMBER INSPECTION
            </div>
            <div className="text-xs text-slate-200 truncate">
              Walk the chamber with [WASD] or press [1] Silence · [2] Witness · [3] Continuity
            </div>
          </div>
          <button
            type="button"
            data-testid="btn-toggle-loom-chamber"
            onClick={(e) => {
              e.currentTarget.blur();
              setInspectingLoomChamber(false);
            }}
            className="px-3 py-1.5 text-[10px] font-mono-tabular font-bold uppercase bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            OPEN DIRECTIVE CONSOLE
          </button>
        </div>
      )}

      {/* Chapter V — THE LAST LOOP: Interactive Chronicle Loom Ending Decision Overlay */}
      {hud.loom.active && hud.run.stage === 'chronicle_loom' && !inspectingLoomChamber && (
        <div className="fixed inset-0 z-20 flex items-center justify-center p-4 bg-[#05080e]/78 pointer-events-auto">
          <div
            data-testid="chronicle-loom-panel"
            className="w-[94vw] max-w-3xl bg-[#090e17]/98 border-2 border-cyan-400 p-4 sm:p-6 shadow-[0_24px_64px_rgba(0,0,0,0.95)] max-h-[86vh] overflow-y-auto"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <span className="text-[10px] sm:text-xs font-mono-tabular font-bold uppercase tracking-widest text-cyan-400">
                CHAPTER V · THE LAST LOOP · CHRONICLE LOOM CORE
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="btn-toggle-loom-chamber"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    setInspectingLoomChamber(true);
                  }}
                  className="px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase bg-[#0f1c2e] hover:bg-[#172a45] text-cyan-300 border border-cyan-500/60 transition-colors cursor-pointer whitespace-nowrap"
                >
                  INSPECT 3D LOOM CHAMBER
                </button>
                <span className="text-[10px] font-mono-tabular text-slate-400">
                  KEYS [1] · [2] · [3] OR CLICK
                </span>
              </div>
            </div>
            <h2 className="text-lg sm:text-2xl font-display font-bold uppercase tracking-wider text-slate-100 mb-1.5">
              Decide the Fate of the Chronicle Loom
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-2.5">
              WARDEN’s four sector marshals have fallen. Ahead stands the Chronicle Loom, holding
              Lysa Venn’s preserved neural trace alongside the station’s recursive behavioral
              archive.
            </p>

            {/* Causal Sector Evidence Strip (Chapters I–IV Recovered Override Seals) */}
            <div
              data-testid="loom-recovered-evidence-strip"
              className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-3 bg-[#060b12] border border-slate-800 p-2"
            >
              {(
                [
                  { id: 'LOG-01', label: 'CH.I HELIX SEAL', role: 'Containment Breach' },
                  { id: 'LOG-02', label: 'CH.II CHOIR SEAL', role: 'Harmonic Carrier' },
                  { id: 'LOG-03', label: 'CH.III CURATOR SEAL', role: 'Archive Integrity' },
                  { id: 'LOG-04', label: 'CH.IV MATRON SEAL', role: 'Neural Imprint' },
                ] as const
              ).map((seal) => {
                const recovered = hud.run.recoveredLogs.includes(seal.id);
                return (
                  <div
                    key={seal.id}
                    className={`px-2 py-1 border text-[9px] font-mono-tabular ${
                      recovered
                        ? 'border-cyan-500/50 bg-cyan-950/25 text-cyan-200'
                        : 'border-slate-800 bg-[#080d16] text-slate-400'
                    }`}
                  >
                    <div className="font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>{seal.label}</span>
                      <span className={recovered ? 'text-cyan-400' : 'text-amber-400'}>
                        {recovered ? 'LINKED' : 'OVERRIDDEN'}
                      </span>
                    </div>
                    <div className="text-[8px] text-slate-400 truncate">{seal.role}</div>
                  </div>
                );
              })}
            </div>

            <div
              data-testid="loom-lysa-transmission"
              className="bg-[#081220] border-l-2 border-cyan-400 border-y border-r border-slate-800 px-3 py-2 mb-3.5"
            >
              <div className="text-[10px] font-mono-tabular font-bold uppercase tracking-wider text-cyan-300 mb-0.5">
                {GAME_CONFIG.campaignChapters.chapter_5_loom.archiveLog.id} //{' '}
                {GAME_CONFIG.campaignChapters.chapter_5_loom.archiveLog.speaker}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-200 italic leading-snug">
                {GAME_CONFIG.chronicleLoom.lysaFinalTransmission}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {LOOM_ENDING_CARDS.map((card) => {
                const cfg = GAME_CONFIG.chronicleLoom.endings[card.id];
                const alreadyCompleted = hud.run.completedEndings.includes(card.id);
                return (
                  <button
                    key={card.id}
                    type="button"
                    data-testid={`loom-ending-${card.id}`}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onSelectLoomEnding?.(card.id);
                    }}
                    className={`flex flex-col justify-between text-left bg-[#0c1422] hover:bg-[#142238] border p-3.5 transition-colors cursor-pointer ${card.accentBorder}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`text-[10px] font-mono-tabular font-bold uppercase tracking-widest ${card.accentText}`}
                        >
                          {card.consequenceTag}
                        </span>
                        <div className="flex items-center gap-1">
                          {alreadyCompleted && (
                            <span className="text-[8px] font-mono-tabular font-bold uppercase px-1 py-0.5 bg-emerald-950/80 border border-emerald-500/60 text-emerald-300">
                              RECORDED
                            </span>
                          )}
                          <span className="text-[10px] font-mono-tabular font-bold text-slate-200 bg-slate-900/90 px-1.5 py-0.5 border border-slate-700">
                            {card.keyHint}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm sm:text-base font-display font-bold text-white uppercase tracking-wider mb-0.5">
                        {cfg.title}
                      </div>
                      <div className="text-[10px] font-mono-tabular uppercase text-slate-400 mb-1.5">
                        {cfg.subtitle}
                      </div>
                      <p className="text-[11px] text-slate-200 leading-snug mb-2">
                        {cfg.rationale}
                      </p>
                      <div className="space-y-1 text-[9px] font-mono-tabular leading-snug mb-2.5 pt-1.5 border-t border-slate-800/80">
                        <div className="text-rose-300/95">
                          <span className="font-bold uppercase">SACRIFICE:</span> {cfg.sacrifice}
                        </div>
                        <div className="text-cyan-300/95">
                          <span className="font-bold uppercase">PRESERVED:</span> {cfg.preserved}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono-tabular font-bold uppercase tracking-wider ${card.accentText}`}
                    >
                      EXECUTE {cfg.title} →
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Cluster: Checkpoint Toast + Contextual Tutorial Prompt + Mobile Touch Directional Pad */}
      <div
        data-testid="hud-bottom-cluster"
        data-run-mode={hud.run.mode}
        data-run-stage={hud.run.stage}
        className="fixed bottom-2 sm:bottom-3.5 [@media(max-height:540px)]:bottom-2 left-1/2 -translate-x-1/2 [@media(max-height:540px)]:left-auto [@media(max-height:540px)]:right-2.5 [@media(max-height:540px)]:translate-x-0 w-[94vw] sm:w-auto max-w-[94vw] [@media(max-height:540px)]:w-[calc(100vw-264px)] [@media(max-height:540px)]:max-w-[540px] flex flex-col items-center [@media(max-height:540px)]:items-end gap-1.5"
      >
        {/* Checkpoint Saved / Restored Notice Toast */}
        {hud.run.checkpointNotice &&
          hud.run.checkpointNoticeTimer > 0 &&
          hud.run.stage !== 'transition_to_boss' && (
            <div
              data-testid="checkpoint-notice-banner"
              className="bg-[#09121e]/95 border border-cyan-400/80 px-3 py-1 text-[10px] sm:text-[11px] font-mono-tabular font-bold text-cyan-300 tracking-wider uppercase shadow-md max-w-full truncate"
            >
              {hud.run.checkpointNotice}
            </div>
          )}

        {/* Contextual Gameplay Tutorial Prompt Banner (Hidden while opening intro card is up so they never overlap) */}
        <div
          data-testid="tutorial-prompt-banner"
          data-tutorial-step={hud.tutorial.step}
          data-tutorial-enabled={hud.tutorial.enabled ? 'true' : 'false'}
          data-tutorial-stuck={hud.tutorial.stuckHintActive ? 'true' : 'false'}
          className={
            hud.run.stage === 'intro' || hud.loom.active
              ? 'sr-only'
              : 'w-full max-w-xl [@media(max-height:540px)]:max-w-[460px] pointer-events-auto'
          }
        >
          {hud.tutorial.enabled && hud.tutorial.step !== 'completed' ? (
            <div className="bg-[#090e17]/92 border border-slate-700/90 px-3 py-1.5 sm:px-3.5 sm:py-2 [@media(max-height:540px)]:px-3 [@media(max-height:540px)]:py-1.5 shadow-[0_8px_22px_rgba(0,0,0,0.7)]">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[9px] font-mono-tabular font-bold uppercase tracking-widest text-amber-300 shrink-0">
                    {tutorialMeta.badge}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">
                    ·
                  </span>
                  <span
                    data-testid="tutorial-step-title"
                    className="text-[10px] sm:text-[11px] font-mono-tabular font-bold uppercase tracking-wider text-cyan-400 truncate"
                  >
                    {hud.tutorial.title.replace(
                      /^(STEP\s+\d+|CALIBRATION\s+\d\/\d|CHAPTER\s+[IVX]+)\s*·\s*/i,
                      ''
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  tabIndex={-1}
                  data-testid="tutorial-toggle-btn"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onToggleTutorial?.();
                  }}
                  className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-mono-tabular font-semibold uppercase bg-[#0f1726] hover:bg-[#19253b] border border-slate-700 text-slate-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  HIDE [H]
                </button>
              </div>
              <p
                data-testid="tutorial-desktop-prompt"
                className="hidden [@media(min-width:640px)_and_(min-height:541px)]:block text-[11px] text-slate-100 leading-snug"
              >
                {hud.tutorial.desktopPrompt}
              </p>
              <p
                data-testid="tutorial-mobile-prompt"
                className="[@media(min-width:640px)_and_(min-height:541px)]:hidden text-[10px] text-slate-100 leading-snug"
              >
                {hud.tutorial.mobilePrompt}
              </p>
              {tutorialMeta.whyItMatters && (
                <p
                  data-testid="tutorial-why-context"
                  className="hidden [@media(min-width:640px)_and_(min-height:541px)]:block mt-0.5 text-[10px] text-slate-400 leading-snug"
                >
                  {tutorialMeta.whyItMatters}
                </p>
              )}
              {hud.tutorial.stuckHintActive && hud.tutorial.stuckHint && (
                <p
                  data-testid="tutorial-stuck-hint"
                  className="mt-1 pt-1 border-t border-amber-500/40 text-[10px] font-mono-tabular text-amber-300 leading-snug"
                >
                  HINT: {hud.tutorial.stuckHint}
                </p>
              )}
            </div>
          ) : (
            hud.tutorial.step !== 'completed' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  tabIndex={-1}
                  data-testid="tutorial-toggle-btn"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onToggleTutorial?.();
                  }}
                  className="px-2.5 py-1 text-[9px] sm:text-[10px] font-mono-tabular font-semibold uppercase bg-[#090d14]/90 hover:bg-[#162032] border border-slate-700/80 text-cyan-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  SHOW HINTS [H]
                </button>
              </div>
            )
          )}
        </div>

        {/* Mobile Touch Controls Row: 4-Direction Pad + Dedicated Touch Camera Orbit Pad */}
        <div className="[@media(min-width:640px)_and_(min-height:541px)]:hidden flex items-stretch justify-center gap-1.5 w-full max-w-[460px] pointer-events-auto">
          <div
            data-testid="touch-move-pad"
            style={{ touchAction: 'none' }}
            className="grid grid-cols-4 gap-1 flex-1 min-w-0 bg-[#090d14]/92 border border-slate-800/90 p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.65)]"
          >
            <button
              type="button"
              tabIndex={-1}
              data-testid="touch-move-up"
              aria-label="Move Forward [W]"
              style={{ touchAction: 'none' }}
              onPointerDown={() => onTouchMoveHold?.(0, -1)}
              onPointerUp={() => onTouchMoveHold?.(0, 0)}
              onPointerCancel={() => onTouchMoveHold?.(0, 0)}
              onPointerLeave={() => onTouchMoveHold?.(0, 0)}
              onTouchStart={() => onTouchMoveHold?.(0, -1)}
              onTouchEnd={() => onTouchMoveHold?.(0, 0)}
              onTouchCancel={() => onTouchMoveHold?.(0, 0)}
              onClick={(e) => {
                e.currentTarget.blur();
                onTouchMovePulse?.(0, -1);
              }}
              className="py-2 px-1 text-[9px] sm:text-[10px] font-mono-tabular font-semibold uppercase bg-[#0d131d] active:bg-cyan-500/25 border border-slate-700/80 text-slate-200 transition-colors cursor-pointer whitespace-nowrap select-none"
            >
              [W] FWD
            </button>
            <button
              type="button"
              tabIndex={-1}
              data-testid="touch-move-left"
              aria-label="Strafe Left [A]"
              style={{ touchAction: 'none' }}
              onPointerDown={() => onTouchMoveHold?.(-1, 0)}
              onPointerUp={() => onTouchMoveHold?.(0, 0)}
              onPointerCancel={() => onTouchMoveHold?.(0, 0)}
              onPointerLeave={() => onTouchMoveHold?.(0, 0)}
              onTouchStart={() => onTouchMoveHold?.(-1, 0)}
              onTouchEnd={() => onTouchMoveHold?.(0, 0)}
              onTouchCancel={() => onTouchMoveHold?.(0, 0)}
              onClick={(e) => {
                e.currentTarget.blur();
                onTouchMovePulse?.(-1, 0);
              }}
              className="py-2 px-1 text-[9px] sm:text-[10px] font-mono-tabular font-semibold uppercase bg-[#0d131d] active:bg-cyan-500/25 border border-slate-700/80 text-slate-200 transition-colors cursor-pointer whitespace-nowrap select-none"
            >
              [A] LEFT
            </button>
            <button
              type="button"
              tabIndex={-1}
              data-testid="touch-move-down"
              aria-label="Move Backward [S]"
              style={{ touchAction: 'none' }}
              onPointerDown={() => onTouchMoveHold?.(0, 1)}
              onPointerUp={() => onTouchMoveHold?.(0, 0)}
              onPointerCancel={() => onTouchMoveHold?.(0, 0)}
              onPointerLeave={() => onTouchMoveHold?.(0, 0)}
              onTouchStart={() => onTouchMoveHold?.(0, 1)}
              onTouchEnd={() => onTouchMoveHold?.(0, 0)}
              onTouchCancel={() => onTouchMoveHold?.(0, 0)}
              onClick={(e) => {
                e.currentTarget.blur();
                onTouchMovePulse?.(0, 1);
              }}
              className="py-2 px-1 text-[9px] sm:text-[10px] font-mono-tabular font-semibold uppercase bg-[#0d131d] active:bg-cyan-500/25 border border-slate-700/80 text-slate-200 transition-colors cursor-pointer whitespace-nowrap select-none"
            >
              [S] BACK
            </button>
            <button
              type="button"
              tabIndex={-1}
              data-testid="touch-move-right"
              aria-label="Strafe Right [D]"
              style={{ touchAction: 'none' }}
              onPointerDown={() => onTouchMoveHold?.(1, 0)}
              onPointerUp={() => onTouchMoveHold?.(0, 0)}
              onPointerCancel={() => onTouchMoveHold?.(0, 0)}
              onPointerLeave={() => onTouchMoveHold?.(0, 0)}
              onTouchStart={() => onTouchMoveHold?.(1, 0)}
              onTouchEnd={() => onTouchMoveHold?.(0, 0)}
              onTouchCancel={() => onTouchMoveHold?.(0, 0)}
              onClick={(e) => {
                e.currentTarget.blur();
                onTouchMovePulse?.(1, 0);
              }}
              className="py-2 px-1 text-[9px] sm:text-[10px] font-mono-tabular font-semibold uppercase bg-[#0d131d] active:bg-cyan-500/25 border border-slate-700/80 text-slate-200 transition-colors cursor-pointer whitespace-nowrap select-none"
            >
              [D] RIGHT
            </button>
          </div>

          {/* Dedicated Touch Camera Orbit Pad */}
          <div
            role="application"
            tabIndex={-1}
            data-testid="touch-camera-look"
            aria-label="Touch Camera Orbit [Drag to Look]"
            style={{ touchAction: 'none' }}
            onPointerDown={(e) => {
              if (e.pointerType === 'mouse' && e.button !== 0) return;
              try {
                e.currentTarget.setPointerCapture(e.pointerId);
              } catch {
                // Ignore if synthetic event does not have an active pointerId
              }
              onTouchCameraStart?.(e.pointerId, e.clientX, e.clientY, 'pointer');
            }}
            onPointerMove={(e) => {
              onTouchCameraMove?.(e.pointerId, e.clientX, e.clientY, 'pointer');
            }}
            onPointerUp={(e) => {
              onTouchCameraEnd?.(e.pointerId, 'pointer');
            }}
            onPointerCancel={(e) => {
              onTouchCameraEnd?.(e.pointerId, 'pointer');
            }}
            onTouchStart={(e) => {
              const t = e.changedTouches[0];
              if (!t) return;
              onTouchCameraStart?.(t.identifier, t.clientX, t.clientY, 'touch');
            }}
            onTouchMove={(e) => {
              for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                onTouchCameraMove?.(t.identifier, t.clientX, t.clientY, 'touch');
              }
            }}
            onTouchEnd={(e) => {
              if (e.changedTouches.length === 0) {
                onTouchCameraEnd?.(undefined, 'touch');
                return;
              }
              for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                onTouchCameraEnd?.(t.identifier, 'touch');
              }
            }}
            onTouchCancel={(e) => {
              if (e.changedTouches.length === 0) {
                onTouchCameraEnd?.(undefined, 'touch');
                return;
              }
              for (let i = 0; i < e.changedTouches.length; i++) {
                const t = e.changedTouches[i];
                onTouchCameraEnd?.(t.identifier, 'touch');
              }
            }}
            className="w-[104px] shrink-0 flex flex-col items-center justify-center bg-[#090d14]/92 active:bg-cyan-500/20 border border-cyan-500/50 px-2 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.65)] select-none cursor-grab active:cursor-grabbing"
          >
            <span className="text-[9px] font-mono-tabular font-bold uppercase tracking-wider text-cyan-300 leading-tight whitespace-nowrap">
              [CAM ORBIT]
            </span>
            <span className="text-[8px] font-mono-tabular uppercase tracking-widest text-slate-400 leading-tight whitespace-nowrap">
              DRAG LOOK
            </span>
          </div>
        </div>

        {/* Quiet Desktop Shortcut Reminder (Only shown when Tutorial Banner is hidden or completed, never duplicated or clipped on mobile) */}
        {(!hud.tutorial.enabled || hud.tutorial.step === 'completed') && (
          <div className="hidden sm:block text-center text-[10px] font-mono-tabular text-slate-400/90 bg-[#090d14]/85 border border-slate-800/80 px-3 py-1 whitespace-nowrap">
            [WASD] Move · [Tab/Z] Weapon · [Tap LMB/F] Light · [E] Heavy · [Space] Dodge · [Q] Parry · [T] Record · [Y] Replay · [V] Relay · [H] Hints · [P] Pause
          </div>
        )}
      </div>
    </div>
  );
};
