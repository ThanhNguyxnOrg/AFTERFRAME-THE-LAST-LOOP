import React from 'react';
import { GAME_CONFIG } from '../game/config.ts';
import { getCurrentCalibrationObjective } from '../game/simulation.ts';
import { computeCommsCodecProfile } from '../game/tactical-hud.ts';
import type {
  CameraSettings,
  ChronicleLoomEndingId,
  HudSnapshot,
  TutorialStep,
  WeaponId,
} from '../game/types.ts';

interface GameHudProps {
  hud: HudSnapshot;
  saveWarning?: React.ReactNode;
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
  onToggleLockOn?: () => void;
  onCycleLockOn?: () => void;
  onSwitchWeapon?: () => void;
  onSelectWeapon?: (weaponId: WeaponId) => void;
  onInteract?: () => void;
  onOpenMap?: () => void;
  onEngageWardenPrime?: () => void;
  onSelectLoomEnding?: (ending: ChronicleLoomEndingId) => void;
  onRestoreCampaign?: () => void;
  cameraSettings?: CameraSettings;
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

export const GameHud: React.FC<GameHudProps> = React.memo(({
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
  onToggleLockOn,
  onCycleLockOn,
  onSwitchWeapon,
  onSelectWeapon,
  onInteract,
  onOpenMap,
  onEngageWardenPrime,
  onSelectLoomEnding,
  onRestoreCampaign,
  cameraSettings,
  saveWarning,
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

  const showCenterReticle =
    hud.appState === 'playing' &&
    !(hud.loom.active && hud.run.stage === 'chronicle_loom' && !inspectingLoomChamber);
  const reticleAccent =
    resonance.primed && resonance.canConverge
      ? '#ffffff'
      : hud.weapon.overheated
        ? '#f87171'
        : hud.weapon.equippedWeaponId === 'grav_breaker'
          ? '#fbbf24'
          : hud.weapon.equippedWeaponId === 'phase_rail'
            ? '#e0f2fe'
            : hud.weapon.equippedWeaponId === 'pulsecaster'
              ? '#38bdf8'
              : '#22d3ee';
  const reticleGap = hud.weapon.equippedWeaponId === 'phase_rail' ? 4 : hud.weapon.equippedWeaponId === 'grav_breaker' ? 9 : 6;
  const peripheralThreats =
    (cameraSettings?.screenEffects ?? true) && Array.isArray(hud.threats) ? hud.threats : [];

  return (
    <div className="fixed inset-0 z-10 pointer-events-none select-none overflow-hidden">
      {/* Subtle Peripheral Low-Integrity Vignette */}
      {isLowHp && (cameraSettings?.screenEffects ?? true) && (
        <div
          data-testid="low-integrity-vignette"
          className="fixed inset-0 pointer-events-none"
          style={{
            boxShadow: 'inset 0 0 90px rgba(239, 68, 68, 0.42)',
          }}
        />
      )}

      {/* Center Tactical Reticle & 360-Degree Peripheral Threat Radar */}
      {showCenterReticle && (
        <div
          data-testid="center-tactical-reticle"
          data-weapon={hud.weapon.equippedWeaponId}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <svg
            width="44"
            height="44"
            viewBox="-22 -22 44 44"
            className="block opacity-80"
            aria-hidden="true"
          >
            <circle
              cx="0"
              cy="0"
              r={hud.weapon.equippedWeaponId === 'phase_rail' ? '1.8' : '1.5'}
              fill={hud.chargeRatio >= 1 ? '#22d3ee' : reticleAccent}
            />
            <line x1={-reticleGap - 5} y1="0" x2={-reticleGap} y2="0" stroke={reticleAccent} strokeWidth="1.5" />
            <line x1={reticleGap} y1="0" x2={reticleGap + 5} y2="0" stroke={reticleAccent} strokeWidth="1.5" />
            <line x1="0" y1={-reticleGap - 5} x2="0" y2={-reticleGap} stroke={reticleAccent} strokeWidth="1.5" />
            <line x1="0" y1={reticleGap} x2="0" y2={reticleGap + 5} stroke={reticleAccent} strokeWidth="1.5" />
            {hud.chargeRatio > 0.05 && (
              <circle
                cx="0"
                cy="0"
                r="13"
                fill="none"
                stroke={hud.chargeRatio >= 1 ? '#22d3ee' : '#f59e0b'}
                strokeWidth="2"
                strokeDasharray={`${hud.chargeRatio * 82} 84`}
                transform="rotate(-90)"
              />
            )}
            {hud.weapon.overheated && (
              <circle cx="0" cy="0" r="15" fill="none" stroke="#ef4444" strokeWidth="1.4" strokeDasharray="4 3" />
            )}
            {resonance.primed && resonance.canConverge && (
              <circle cx="0" cy="0" r="16.5" fill="none" stroke="#22d3ee" strokeWidth="1.2" strokeDasharray="3 3" />
            )}
          </svg>

          {peripheralThreats.map((threat) => {
            const color =
              threat.severity === 'urgent'
                ? '#f43f5e'
                : threat.severity === 'telegraph'
                  ? '#f59e0b'
                  : '#94a3b8';
            const radiusPx = threat.severity === 'urgent' ? 54 : 60;
            return (
              <div
                key={threat.id}
                data-testid="threat-radar-chevron"
                data-threat-id={threat.id}
                data-threat-severity={threat.severity}
                className="absolute left-1/2 top-1/2 pointer-events-none"
                style={{
                  transform: `translate(-50%, -50%) rotate(${threat.angleDeg}deg) translateY(-${radiusPx}px)`,
                }}
              >
                <svg
                  width={threat.isBoss ? '16' : '12'}
                  height={threat.isBoss ? '12' : '9'}
                  viewBox="0 0 12 9"
                  className="block"
                  aria-hidden="true"
                >
                  <polygon
                    points="6,0 12,9 6,6.2 0,9"
                    fill={color}
                    fillOpacity={threat.severity === 'hostile' ? '0.68' : '0.96'}
                  />
                </svg>
              </div>
            );
          })}

          {hud.weapon.overheated && hud.weapon.activeVent && (
            <div
              data-testid="active-vent-reticle-bar"
              data-attempted={hud.weapon.activeVent.attempted ? 'true' : 'false'}
              className="absolute left-1/2 top-[34px] -translate-x-1/2 w-32 bg-[#080c13]/92 border border-slate-700/90 px-1.5 py-1 pointer-events-none shadow-[0_4px_12px_rgba(0,0,0,0.75)]"
            >
              <div className="relative h-2 w-full bg-[#05080c] border border-slate-700 overflow-hidden">
                {!hud.weapon.activeVent.attempted && (
                  <div
                    className="absolute inset-y-0 bg-cyan-400/55 border-x border-cyan-200"
                    style={{
                      left: `${Math.round(hud.weapon.activeVent.windowStart * 100)}%`,
                      width: `${Math.round(
                        (hud.weapon.activeVent.windowEnd - hud.weapon.activeVent.windowStart) * 100
                      )}%`,
                    }}
                  />
                )}
                <div
                  className={`absolute inset-y-0 w-1 ${
                    hud.weapon.activeVent.attempted
                      ? 'bg-red-500'
                      : hud.weapon.activeVent.progress >= hud.weapon.activeVent.windowStart &&
                          hud.weapon.activeVent.progress <= hud.weapon.activeVent.windowEnd
                        ? 'bg-white'
                        : 'bg-amber-300'
                  }`}
                  style={{
                    left: `calc(${Math.round(hud.weapon.activeVent.progress * 100)}% - 2px)`,
                  }}
                />
              </div>
              <div
                className={`mt-0.5 text-center text-[8px] font-mono-tabular font-bold uppercase tracking-wider leading-none ${
                  hud.weapon.activeVent.attempted
                    ? 'text-red-400'
                    : hud.weapon.activeVent.progress >= hud.weapon.activeVent.windowStart &&
                        hud.weapon.activeVent.progress <= hud.weapon.activeVent.windowEnd
                      ? 'text-cyan-200'
                      : 'text-amber-300'
                }`}
              >
                {hud.weapon.activeVent.attempted ? 'VENT JAMMED' : '[F] ACTIVE VENT'}
              </div>
            </div>
          )}

          {!hud.weapon.overheated && (hud.weapon.activeVent?.empoweredShots ?? 0) > 0 && (
            <div
              data-testid="active-vent-overcharged-badge"
              className="absolute left-1/2 top-[28px] -translate-x-1/2 px-1.5 py-0.5 bg-[#080c13]/92 border border-cyan-400/80 text-[8px] font-mono-tabular font-bold uppercase tracking-wider text-cyan-200 whitespace-nowrap"
            >
              OVERCHARGED ×{hud.weapon.activeVent?.empoweredShots}
            </div>
          )}
        </div>
      )}

      {/* Top Perimeter Row: Slim Vitals, Consolidated Objective/Boss Telemetry & Top-Right System Strip */}
      <div
        className={`flex flex-wrap md:flex-nowrap items-start justify-between w-full p-2 sm:p-4 [@media(max-height:540px)]:p-2 gap-1.5 sm:gap-3 transition-opacity duration-150 ${
          hud.loom.active && hud.run.stage === 'chronicle_loom' && !inspectingLoomChamber
            ? 'opacity-20 pointer-events-none'
            : ''
        }`}
      >
        {/* Cluster 1 (Top-Left): Sleek Survival Vitals & Sync Bar */}
        <div
          data-testid="player-hud"
          className="relative order-1 w-[148px] sm:w-[214px] [@media(max-height:540px)]:w-[184px] bg-[#070b12]/80 border border-white/10 px-2.5 py-2 shadow-[0_8px_22px_rgba(0,0,0,0.55)] shrink-0"
        >
          <div className="space-y-1.5 mb-1.5">
            {/* Integrity */}
            <div>
              <div className="flex items-baseline justify-between mb-0.5">
                <span className="text-[9px] font-mono-tabular uppercase tracking-wider text-cyan-400 font-semibold">
                  INTEGRITY
                </span>
                <div className="flex items-baseline gap-0.5 font-mono-tabular">
                  <span
                    className={`text-sm sm:text-base font-bold leading-none ${
                      isLowHp ? 'text-red-400' : 'text-slate-100'
                    }`}
                  >
                    {hud.integrity}
                  </span>
                  <span className="text-[9px] text-slate-500">/{hud.maxIntegrity}</span>
                </div>
              </div>
              <div className="relative h-1.5 w-full bg-[#04070c] overflow-hidden">
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
            <div data-flux-dampened={(hud.fluxDampenedTimer ?? 0) > 0 ? 'true' : 'false'}>
              <div className="flex items-baseline justify-between mb-0.5">
                <span className="text-[9px] font-mono-tabular uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-1">
                  <span>FLUX</span>
                  {(hud.fluxDampenedTimer ?? 0) > 0 && (
                    <span
                      data-testid="hud-flux-dampened-badge"
                      className="text-[8px] font-mono-tabular text-fuchsia-300"
                    >
                      · DAMP {(hud.fluxDampenedTimer ?? 0).toFixed(1)}s
                    </span>
                  )}
                </span>
                <span className="text-xs font-mono-tabular font-bold text-amber-300 leading-none">
                  {hud.flux}
                  <span className="text-[9px] text-slate-500 font-normal">/{hud.maxFlux}</span>
                </span>
              </div>
              <div className="relative h-1 w-full bg-[#04070c] overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-75 ${
                    (hud.fluxDampenedTimer ?? 0) > 0 ? 'bg-fuchsia-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${fluxPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Live Adrenaline Sync Tier Strip (Tier 0-5) */}
          {(() => {
            const adr = hud.adrenaline ?? {
              tier: 0,
              score: 0,
              progressToNext: 0,
              label: 'SYNC LV 0',
              perkLabel: 'BASE CALIBRATION',
              decayGraceTimer: 0,
            };
            const isOverdrive = adr.tier >= 4;
            const isActiveTier = adr.tier >= 1;
            return (
              <div
                data-testid="adrenaline-hud-bar"
                data-tier={adr.tier}
                className={
                  adr.tier === 0 && adr.progressToNext <= 0.02
                    ? 'sr-only'
                    : 'pt-1 border-t border-white/8'
                }
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span
                    className={`text-[8px] font-mono-tabular font-semibold uppercase tracking-wider whitespace-nowrap ${
                      isOverdrive
                        ? 'text-amber-300'
                        : isActiveTier
                          ? 'text-cyan-300'
                          : 'text-slate-400'
                    }`}
                  >
                    {adr.label}
                  </span>
                  {adr.tier > 0 && (
                    <span className="hidden sm:inline text-[8px] font-mono-tabular uppercase tracking-wide text-slate-400 truncate">
                      {adr.perkLabel}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const filled = adr.tier > idx;
                    const filling = adr.tier === idx;
                    const cellPct = filled ? 100 : filling ? Math.round(adr.progressToNext * 100) : 0;
                    return (
                      <div key={idx} className="relative h-1 bg-[#04070c] overflow-hidden">
                        {cellPct > 0 && (
                          <div
                            className={`absolute inset-y-0 left-0 transition-all duration-75 ${
                              idx >= 3 ? 'bg-amber-400' : 'bg-cyan-400'
                            } ${filled ? 'opacity-100' : 'opacity-70'}`}
                            style={{ width: `${cellPct}%` }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {hud.combatFlow?.active && (
            <div
              data-testid="combat-flow-indicator"
              data-flow-kind={hud.combatFlow.kind}
              className={`mt-1 text-[8px] font-mono-tabular font-bold uppercase tracking-wider truncate ${
                hud.combatFlow.kind === 'riposte'
                  ? 'text-amber-300'
                  : hud.combatFlow.kind === 'chrono_slip'
                    ? 'text-white'
                    : 'text-cyan-300'
              }`}
            >
              {hud.combatFlow.label}
            </div>
          )}
        </div>

        {/* Cluster 2 (Top-Center): Slim Single-Focus Objective OR Boss Telemetry */}
        <div className="order-3 md:order-2 flex flex-col items-center w-full md:max-w-[410px] lg:max-w-[436px]">
          <div
            className={
              boss
                ? 'sr-only'
                : 'bg-[#070b12]/80 border border-white/10 px-3 py-1.5 w-full shadow-[0_8px_22px_rgba(0,0,0,0.55)]'
            }
          >
            <div className="flex items-center justify-between gap-2 text-[10px] font-mono-tabular tracking-wider uppercase">
              <span className="font-bold text-cyan-400 truncate">
                {!boss && !hud.loom.active
                  ? hud.encounter.encounterId !== 'prologue_calibration_bay'
                    ? hud.objectiveText
                    : calGuidance.headline
                  : hud.objectiveText}
              </span>
              {!hud.loom.active && (
                <span
                  data-testid="hud-encounter-status"
                  data-encounter-id={hud.encounter.encounterId}
                  data-pacing-tier={hud.encounter.pacingTier}
                  data-wave-index={hud.encounter.currentWaveIndex}
                  data-total-waves={hud.encounter.totalWaves}
                  className="text-slate-300 font-semibold whitespace-nowrap shrink-0"
                >
                  {hud.encounter.totalWaves > 1
                    ? `W${hud.encounter.currentWaveIndex}/${hud.encounter.totalWaves} · `
                    : ''}
                  {hud.totalEnemies - hud.enemiesAlive}/{hud.totalEnemies}
                </span>
              )}
            </div>

            <div
              data-testid="calibration-active-objective"
              className="text-[10px] sm:text-[11px] text-slate-200 leading-snug mt-0.5 line-clamp-2"
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

            {/* Clean Unboxed Calibration Checklist */}
            <div
              className={
                boss || hud.loom.active
                  ? 'sr-only'
                  : 'mt-1 pt-1 border-t border-white/8 flex items-center justify-between gap-2 text-[9px] font-mono-tabular uppercase'
              }
            >
              <span
                data-testid="pressure-plate-status"
                data-plate-activated={plate.active ? 'true' : 'false'}
                data-barrier-open={plate.barrierOpen ? 'true' : 'false'}
                className={`truncate ${
                  puzzle.teachCompleted || plate.active
                    ? 'text-cyan-300 font-bold'
                    : calGuidance.stepNumber === 1
                      ? 'text-slate-100 font-semibold'
                      : 'text-slate-300/80'
                }`}
              >
                1. Pad {plate.active ? 'Active' : puzzle.teachCompleted ? 'Done' : '[Y]'}
              </span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <div
                data-testid="chrono-puzzle-status"
                data-puzzle-stage={puzzle.stage}
                data-receiver-charged={puzzle.receiverCharged ? 'true' : 'false'}
                data-combine-plate-active={puzzle.combinePlateActive ? 'true' : 'false'}
                data-final-barrier-open={puzzle.finalBarrierOpen ? 'true' : 'false'}
                className="flex items-center gap-2 min-w-0"
              >
                <span
                  className={`whitespace-nowrap ${
                    puzzle.receiverCharged
                      ? 'text-amber-300 font-bold'
                      : puzzle.testCompleted
                        ? 'text-cyan-300'
                        : calGuidance.stepNumber === 2
                          ? 'text-slate-100 font-semibold'
                          : 'text-slate-300/80'
                  }`}
                >
                  2. Rcv{' '}
                  {puzzle.receiverCharged
                    ? `${puzzle.receiverChargeTimer.toFixed(1)}s`
                    : puzzle.testCompleted
                      ? 'Done'
                      : '[E]'}
                </span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span
                  className={`whitespace-nowrap ${
                    puzzle.finalBarrierOpen
                      ? 'text-emerald-300 font-bold'
                      : calGuidance.stepNumber === 3
                        ? 'text-slate-100 font-semibold'
                        : 'text-slate-300/80'
                  }`}
                >
                  3. Gate {puzzle.finalBarrierOpen ? 'Open' : 'Locked'}
                </span>
              </div>
            </div>

            {/* Active Hazard Alert Only (Secrets/Codex counters live cleanly in Sector Map [N]) */}
            <div
              data-testid="hud-optional-objective"
              data-mission-id={hud.exploration.mission.id}
              data-active-objective-id={hud.exploration.mission.activeMainObjectiveId ?? 'none'}
              data-secrets-discovered={hud.exploration.discoveredSecretIds?.length ?? 0}
              data-chapter-theme={hud.exploration.chapterIdentity?.themeLabel ?? ''}
              data-narrative-events-triggered={
                hud.exploration.narrativeEvents?.filter((e) => e.completed).length ?? 0
              }
              className={
                hud.exploration.hazards &&
                hud.exploration.hazards.length > 0 &&
                hud.exploration.hazards[0].phase !== 'safe'
                  ? 'mt-1 pt-1 border-t border-white/8 flex items-center justify-between gap-2 text-[9px] font-mono-tabular uppercase'
                  : 'sr-only'
              }
            >
              {hud.exploration.hazards && hud.exploration.hazards.length > 0 && (
                <span
                  data-testid="hud-hazard-telemetry"
                  data-hazard-id={hud.exploration.hazards[0].id}
                  data-hazard-phase={hud.exploration.hazards[0].phase}
                  className={`font-bold ${
                    hud.exploration.hazards[0].phase === 'active'
                      ? 'text-red-300'
                      : 'text-amber-300'
                  }`}
                >
                  HAZARD VENT: {hud.exploration.hazards[0].phase.toUpperCase()}
                </span>
              )}
              <span
                data-testid="hud-narrative-event-badge"
                data-triggered-count={
                  hud.exploration.narrativeEvents?.filter((e) => e.completed).length ?? 0
                }
                data-total-count={hud.exploration.narrativeEvents?.length ?? 4}
                className="sr-only"
              />
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
            /* Standard Focused Enemy Status Bar (Clean 2-row readout, no clipped text) */
            focused && (
              <div
                className={`mt-1 w-full max-w-[360px] bg-[#070b12]/80 border px-3 py-1.5 ${
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
                    ? 'border-white/70'
                    : focused.isDecoy
                      ? 'border-purple-400/70'
                      : focused.isResonanceMarked
                        ? 'border-cyan-300/70'
                        : isEnemyTelegraphing
                          ? 'border-amber-400/70'
                          : 'border-white/10'
                }`}
                data-testid="focused-enemy-hud"
                data-enemy-archetype={focused.archetype}
                data-enemy-role={focused.roleLabel}
                data-enemy-status={focused.statusLabel}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-display font-bold tracking-wider text-slate-100 uppercase truncate">
                    {focused.name.split('·')[0].trim()}
                  </span>
                  <div className="flex items-center gap-2 font-mono-tabular text-[9px] shrink-0">
                    {focused.isDecoy && (
                      <span data-testid="enemy-decoy-badge" className="text-purple-300 font-bold uppercase">
                        DECOY
                      </span>
                    )}
                    {(focused.pinnedTimer ?? 0) > 0 && (
                      <span data-testid="enemy-pinned-badge" className="text-cyan-300 font-bold uppercase">
                        PINNED
                      </span>
                    )}
                    {focused.isResonanceMarked && (
                      <span data-testid="enemy-resonance-badge" className="text-cyan-300 font-bold uppercase">
                        RESONANCE {focused.resonanceRemaining.toFixed(1)}s
                      </span>
                    )}
                    <span
                      data-testid="enemy-status-badge"
                      className={`font-semibold uppercase ${
                        isEnemyVulnerable
                          ? 'text-white'
                          : isEnemyTelegraphing
                            ? focused.telegraphLocked
                              ? 'text-red-400'
                              : 'text-amber-300'
                            : 'text-slate-400'
                      }`}
                    >
                      {focused.statusLabel.split('·')[0].trim()}
                    </span>
                    <span className="text-slate-300 font-bold">
                      {focused.hp}/{focused.maxHp}
                    </span>
                  </div>
                </div>

                <div className="relative h-1.5 w-full bg-[#04070c] overflow-hidden mb-0.5">
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

                <div className="relative h-0.5 w-full bg-[#04070c] overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-cyan-400"
                    style={{ width: `${enemyStaggerPct}%` }}
                  />
                </div>
              </div>
            )
          )}

        </div>

        {/* Cluster 3 (Top-Right): System Controls + Live Diegetic Tactical Radar */}
        <div className="order-2 md:order-3 flex flex-col items-end gap-1.5 pointer-events-none shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto">
          {onToggleLockOn && (
            <div className={`${hud.lockOn?.active ? 'flex' : 'hidden sm:flex'} items-center`}>
              <button
                type="button"
                tabIndex={-1}
                data-testid="lock-on-hud-badge"
                data-locked={hud.lockOn?.active ? 'true' : 'false'}
                aria-label="Toggle Target Lock-On [O / MMB]"
                title="Toggle Target Lock-On [O / Middle Mouse]"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onToggleLockOn();
                }}
                className={`h-8 sm:h-9 px-2 flex items-center gap-1 justify-center border font-mono-tabular text-[9px] sm:text-[10px] font-semibold uppercase transition-colors cursor-pointer whitespace-nowrap ${
                  hud.lockOn?.active
                    ? hud.lockOn.isStaggered
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                      : 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-[#080d15]/90 hover:bg-[#162032] border-slate-700/90 text-slate-300'
                }`}
              >
                <span className="max-w-[92px] sm:max-w-[136px] truncate">
                  {hud.lockOn?.active
                    ? `LOCK · ${(hud.lockOn.targetName ?? 'TARGET').split('·')[0].trim()}`
                    : 'LOCK [O]'}
                </span>
              </button>
              {hud.lockOn?.active && onCycleLockOn && (
                <button
                  type="button"
                  tabIndex={-1}
                  data-testid="lock-on-cycle-btn"
                  aria-label="Cycle Lock-On Target [Wheel / ]]"
                  title="Switch Lock-On Target [Mouse Wheel / ] ]"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onCycleLockOn();
                  }}
                  className="h-8 sm:h-9 px-1.5 flex items-center justify-center bg-[#080d15]/90 hover:bg-[#162032] border border-l-0 border-cyan-400/80 text-cyan-200 transition-colors cursor-pointer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 16h5v5" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <button
            type="button"
            tabIndex={-1}
            data-testid="hud-map-btn"
            aria-label="Open Sector Map [N]"
            title="Open Sector Schematic Map & Exploration Status [N]"
            onClick={(e) => {
              e.currentTarget.blur();
              if (onOpenMap) {
                onOpenMap();
              } else {
                onTogglePause();
              }
            }}
            className="h-8 sm:h-9 px-1.5 sm:px-2 flex items-center gap-1 justify-center bg-[#080d15]/90 hover:bg-[#162032] border border-cyan-500/60 text-cyan-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span className="text-[9px] sm:text-[10px] font-mono-tabular font-semibold uppercase">
              <span className="sm:hidden">MAP</span>
              <span className="hidden sm:inline">MAP [N]</span>
            </span>
          </button>
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
                className="h-8 px-2 flex items-center justify-center font-mono-tabular text-[9px] font-bold uppercase bg-[#0d1c2e] hover:bg-[#17314f] border border-cyan-400 text-cyan-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                RESTORE CAMPAIGN
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
            className="w-8 h-8 flex items-center justify-center bg-[#070b12]/80 hover:bg-[#162032] border border-white/10 text-slate-200 transition-colors cursor-pointer"
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
            data-testid="hud-btn-pause"
            aria-label="Pause Game [P]"
            title="Pause / Menu [P / Esc]"
            onClick={(e) => {
              e.currentTarget.blur();
              onTogglePause();
            }}
            className="h-8 px-2.5 flex items-center gap-1.5 justify-center bg-[#070b12]/80 hover:bg-[#162032] border border-white/10 text-slate-200 transition-colors cursor-pointer"
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
              MENU [P]
            </span>
          </button>
          </div>

          {/* Live Compact Circular Tactical Radar (Click or [N] for Full Schematic) */}
          {hud.radar && (
            <button
              type="button"
              tabIndex={-1}
              data-testid="hud-tactical-radar"
              data-radar-blips={hud.radar.blips.length}
              data-echo-active={hud.radar.echoActive ? 'true' : 'false'}
              aria-label="Sector Tactical Radar — Open Full Sector Map [N]"
              title="Sector Radar — Click or press [N] for Map"
              onClick={(e) => {
                e.currentTarget.blur();
                if (onOpenMap) {
                  onOpenMap();
                } else {
                  onTogglePause();
                }
              }}
              className="relative group pointer-events-auto w-[56px] sm:w-[106px] [@media(max-height:540px)]:hidden rounded-full bg-[#05080e]/82 hover:bg-[#0c1626] border border-white/15 hover:border-cyan-400/80 p-1 shadow-[0_8px_22px_rgba(0,0,0,0.65)] transition-colors cursor-pointer"
            >
              <svg
                viewBox="-24 -24 48 48"
                className="w-full aspect-square block rounded-full bg-[#04070c]"
                aria-hidden="true"
              >
                {/* Arena Perimeter & Mid-Range Rings */}
                <circle
                  cx="0"
                  cy="0"
                  r={hud.radar.arenaRadius}
                  fill="#060b12"
                  stroke="#1e3a5f"
                  strokeWidth="0.7"
                />
                <circle
                  cx="0"
                  cy="0"
                  r={hud.radar.arenaRadius * 0.52}
                  fill="none"
                  stroke="#132338"
                  strokeWidth="0.45"
                  strokeDasharray="1.6 1.6"
                />
                <line x1="-22" y1="0" x2="22" y2="0" stroke="#0d1726" strokeWidth="0.35" />
                <line x1="0" y1="-22" x2="0" y2="22" stroke="#0d1726" strokeWidth="0.35" />
                <text
                  x="0"
                  y="-18.6"
                  textAnchor="middle"
                  fill="#475569"
                  fontSize="3.6"
                  fontFamily="monospace"
                >
                  N
                </text>

                {/* Timed Energy Hazards */}
                {(hud.exploration.localMap?.hazards ?? []).map((hz) => (
                  <circle
                    key={hz.id}
                    cx={hz.x}
                    cy={hz.z}
                    r={hz.radius}
                    fill={
                      hz.phase === 'active'
                        ? 'rgba(239, 68, 68, 0.34)'
                        : hz.phase === 'warning'
                          ? 'rgba(245, 158, 11, 0.24)'
                          : 'rgba(34, 211, 238, 0.08)'
                    }
                    stroke={
                      hz.phase === 'active'
                        ? '#ef4444'
                        : hz.phase === 'warning'
                          ? '#f59e0b'
                          : '#164e63'
                    }
                    strokeWidth="0.45"
                  />
                ))}

                {/* Charged Flux Pools (Shattered Capacitor Fields) */}
                {(hud.radar.fluxPools ?? []).map((pool) => (
                  <circle
                    key={pool.id}
                    data-testid={`radar-flux-pool-${pool.id}`}
                    cx={pool.x}
                    cy={pool.z}
                    r={pool.radius}
                    fill="rgba(34, 211, 238, 0.2)"
                    stroke="#22d3ee"
                    strokeWidth="0.4"
                    strokeDasharray="1.4 0.8"
                  />
                ))}

                {/* Tactical Arena Boost Pads (West/East Flanks) */}
                {(hud.radar.boostPads ?? []).map((pad) => (
                  <g key={pad.id} data-testid={`radar-boost-${pad.id}`}>
                    <circle
                      cx={pad.x}
                      cy={pad.z}
                      r="1.45"
                      fill={pad.ready ? 'rgba(34, 211, 238, 0.22)' : 'rgba(51, 65, 85, 0.22)'}
                      stroke={pad.ready ? '#22d3ee' : '#475569'}
                      strokeWidth="0.45"
                    />
                    <polygon
                      points={`${pad.x},${pad.z - 0.85} ${pad.x + 0.72},${pad.z + 0.55} ${pad.x},${pad.z + 0.12} ${pad.x - 0.72},${pad.z + 0.55}`}
                      fill={pad.ready ? '#67e8f9' : '#64748b'}
                    />
                  </g>
                ))}

                {/* Live Structural Pillars, Blast Cover & Destructible Capacitors */}
                {(hud.radar.obstacles ?? []).map((obs) => {
                  if (obs.kind === 'destructible_crate') {
                    return (
                      <polygon
                        key={obs.id}
                        points={`${obs.x},${obs.z - 1.1} ${obs.x + 1.1},${obs.z} ${obs.x},${obs.z + 1.1} ${obs.x - 1.1},${obs.z}`}
                        fill={obs.hpRatio < 0.6 ? '#f97316' : '#f59e0b'}
                        stroke="#020617"
                        strokeWidth="0.3"
                      />
                    );
                  }
                  if (obs.kind === 'cover_wall') {
                    return (
                      <rect
                        key={obs.id}
                        x={obs.x - 1.15}
                        y={obs.z - 0.6}
                        width="2.3"
                        height="1.2"
                        rx="0.25"
                        fill="#334155"
                        stroke="#64748b"
                        strokeWidth="0.35"
                      />
                    );
                  }
                  return (
                    <circle
                      key={obs.id}
                      cx={obs.x}
                      cy={obs.z}
                      r={Math.max(0.9, obs.radius * 0.88)}
                      fill="#1e293b"
                      stroke="#475569"
                      strokeWidth="0.35"
                    />
                  );
                })}

                {/* Camera Aim Sight-Cone Wedge */}
                {(() => {
                  const coneLen = 11.5;
                  const halfSpread = 0.44;
                  const px = hud.radar.playerX;
                  const pz = hud.radar.playerZ;
                  const lx = px + Math.sin(hud.radar.aimYaw - halfSpread) * coneLen;
                  const lz = pz + Math.cos(hud.radar.aimYaw - halfSpread) * coneLen;
                  const rx = px + Math.sin(hud.radar.aimYaw + halfSpread) * coneLen;
                  const rz = pz + Math.cos(hud.radar.aimYaw + halfSpread) * coneLen;
                  return (
                    <polygon
                      points={`${px},${pz} ${lx},${lz} ${rx},${rz}`}
                      fill="rgba(34, 211, 238, 0.14)"
                    />
                  );
                })()}

                {/* Objective Target Diamond */}
                {hud.radar.objectiveX !== null && hud.radar.objectiveZ !== null && (
                  <polygon
                    points={`${hud.radar.objectiveX},${hud.radar.objectiveZ - 1.7} ${hud.radar.objectiveX + 1.7},${hud.radar.objectiveZ} ${hud.radar.objectiveX},${hud.radar.objectiveZ + 1.7} ${hud.radar.objectiveX - 1.7},${hud.radar.objectiveZ}`}
                    fill="#f59e0b"
                    stroke="#fffbeb"
                    strokeWidth="0.35"
                  />
                )}

                {/* Enemy / Boss / Stagger / Interactable Telemetry Blips */}
                {hud.radar.blips.map((blip) => {
                  if (blip.kind === 'boss') {
                    return (
                      <g key={blip.id}>
                        <circle
                          cx={blip.x}
                          cy={blip.z}
                          r="2.4"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="0.55"
                        />
                        <polygon
                          points={`${blip.x},${blip.z - 1.85} ${blip.x + 1.85},${blip.z} ${blip.x},${blip.z + 1.85} ${blip.x - 1.85},${blip.z}`}
                          fill="#ef4444"
                        />
                      </g>
                    );
                  }
                  if (blip.kind === 'staggered') {
                    return (
                      <rect
                        key={blip.id}
                        x={blip.x - 1.35}
                        y={blip.z - 1.35}
                        width="2.7"
                        height="2.7"
                        fill="#fbbf24"
                        stroke="#ffffff"
                        strokeWidth="0.4"
                      />
                    );
                  }
                  if (blip.kind === 'telegraph') {
                    return (
                      <circle
                        key={blip.id}
                        cx={blip.x}
                        cy={blip.z}
                        r="1.45"
                        fill="#f97316"
                        stroke="#fef08a"
                        strokeWidth="0.4"
                      />
                    );
                  }
                  if (blip.kind === 'interactable') {
                    return (
                      <rect
                        key={blip.id}
                        x={blip.x - 1.0}
                        y={blip.z - 1.0}
                        width="2.0"
                        height="2.0"
                        fill="#34d399"
                      />
                    );
                  }
                  return (
                    <circle
                      key={blip.id}
                      cx={blip.x}
                      cy={blip.z}
                      r="1.15"
                      fill="#fb7185"
                    />
                  );
                })}

                {/* Active Chrono Echo Hologram Marker */}
                {hud.radar.echoActive &&
                  hud.radar.echoX !== null &&
                  hud.radar.echoZ !== null && (
                    <g>
                      <circle
                        cx={hud.radar.echoX}
                        cy={hud.radar.echoZ}
                        r="1.95"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="0.45"
                      />
                      <circle
                        cx={hud.radar.echoX}
                        cy={hud.radar.echoZ}
                        r="1.05"
                        fill="#bae6fd"
                      />
                    </g>
                  )}

                {/* Tactical Waypoint Vector & Beacon Diamond */}
                {hud.radar.waypoint && (
                  <g data-testid="radar-waypoint-marker">
                    <line
                      x1={hud.radar.playerX}
                      y1={hud.radar.playerZ}
                      x2={hud.radar.waypoint.x}
                      y2={hud.radar.waypoint.z}
                      stroke="#fbbf24"
                      strokeWidth="0.45"
                      strokeDasharray="1.3 1.0"
                    />
                    <circle
                      cx={hud.radar.waypoint.x}
                      cy={hud.radar.waypoint.z}
                      r="2.15"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="0.45"
                    />
                    <polygon
                      points={`${hud.radar.waypoint.x},${hud.radar.waypoint.z - 1.4} ${hud.radar.waypoint.x + 1.4},${hud.radar.waypoint.z} ${hud.radar.waypoint.x},${hud.radar.waypoint.z + 1.4} ${hud.radar.waypoint.x - 1.4},${hud.radar.waypoint.z}`}
                      fill="#fbbf24"
                      stroke="#22d3ee"
                      strokeWidth="0.35"
                    />
                  </g>
                )}

                {/* Sera Live Position & Heading Vector */}
                <g transform={`translate(${hud.radar.playerX}, ${hud.radar.playerZ})`}>
                  <line
                    x1="0"
                    y1="0"
                    x2={Math.sin(hud.radar.playerRotationY) * 3.1}
                    y2={Math.cos(hud.radar.playerRotationY) * 3.1}
                    stroke="#ffffff"
                    strokeWidth="0.65"
                  />
                  <circle
                    cx="0"
                    cy="0"
                    r="1.45"
                    fill="#22d3ee"
                    stroke="#ffffff"
                    strokeWidth="0.45"
                  />
                </g>
              </svg>
            </button>
          )}
          {hud.radar?.waypoint && (
            <div
              data-testid="hud-waypoint-readout"
              className="pointer-events-none px-1.5 py-0.5 bg-[#05080e]/90 border border-amber-400/70 text-[9px] font-mono-tabular uppercase tracking-wider text-amber-200 whitespace-nowrap max-w-[184px] flex items-center gap-1"
            >
              <span className="truncate">WP · {hud.radar.waypoint.label}</span>
              <span className="text-amber-300 font-bold shrink-0">
                ·{' '}
                {Math.hypot(
                  hud.radar.waypoint.x - hud.radar.playerX,
                  hud.radar.waypoint.z - hud.radar.playerZ
                ).toFixed(0)}
                M
              </span>
            </div>
          )}
          {saveWarning}
        </div>
      </div>

      {/* Duplicate center SVG reticle merged cleanly into center-tactical-reticle above */}

      {/* Contextual Chrono Break Execution Prompt on Staggered Target */}
      {hud.lockOn?.canExecute && (
        <div
          data-testid="chrono-execution-prompt"
          data-target-id={hud.lockOn.targetId ?? ''}
          className="fixed left-1/2 top-[56%] -translate-x-1/2 z-25 pointer-events-auto"
        >
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onHeavyAttack?.();
            }}
            className="px-3.5 py-1.5 bg-[#120e06]/95 hover:bg-[#221909] border border-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.45)] flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
          >
            <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-mono-tabular font-bold uppercase">
              [E]
            </span>
            <span className="text-[11px] sm:text-xs font-mono-tabular font-bold uppercase tracking-wider text-amber-200">
              CHRONO BREAK · EXECUTE {hud.lockOn.executeTargetName ?? 'TARGET'}
            </span>
          </button>
        </div>
      )}

      {/* Skippable Campaign Opening Transmission Card (Stage: intro — docked low so center arena stays unobstructed) */}
      {hud.run.stage === 'intro' && (
        <div
          data-testid="campaign-intro-banner"
          className="fixed left-1/2 bottom-3 sm:bottom-5 -translate-x-1/2 z-20 w-[92vw] max-w-lg bg-[#070b12]/92 border border-cyan-400/75 p-3 sm:p-3.5 pointer-events-auto shadow-[0_14px_36px_rgba(0,0,0,0.8)]"
        >
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-mono-tabular font-bold uppercase tracking-widest text-cyan-400 truncate">
              PROLOGUE · LOG-00 // LYSA VENN
            </span>
            <button
              type="button"
              data-testid="btn-skip-intro"
              onClick={(e) => {
                e.currentTarget.blur();
                onSkipIntro?.();
              }}
              className="px-2.5 py-1 text-[10px] font-mono-tabular font-bold uppercase bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              BEGIN [SPACE]
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
            const introPct = Math.max(
              0,
              Math.min(
                100,
                ((boss?.introRemaining ?? 0) /
                  Math.max(0.1, boss?.introDuration ?? GAME_CONFIG.boss.introDuration)) *
                  100
              )
            );
            return (
              <>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="inline-block w-2 h-2 rotate-45 bg-amber-400 shrink-0" />
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
                    ENGAGE {boss?.name ?? 'MARSHAL'} [SPACE]
                  </button>
                </div>
                <div className="text-sm sm:text-base font-display font-bold uppercase tracking-wider text-white mb-0.5">
                  {chapterCfg.title} — {chapterCfg.subtitle}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-200 leading-snug mb-2">
                  {chapterCfg.arrivalBriefing}
                </p>
                <div className="relative h-1 w-full bg-[#05080c] overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-amber-400 transition-all duration-75"
                    style={{ width: `${introPct}%` }}
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
            const destChapterId =
              hud.run.pendingNextChapter ??
              (hud.run.chapter === 'prologue' ? 'chapter_1_helix' : hud.run.chapter);
            const destChapterCfg =
              GAME_CONFIG.campaignChapters[destChapterId] ??
              GAME_CONFIG.campaignChapters.chapter_1_helix;
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
                  {destChapterCfg.numberLabel}: {destChapterCfg.title}
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

            {/* Phase 20: Campaign Convergence Discovery Synthesis */}
            {hud.exploration.convergenceSummary && (
              <div
                data-testid="loom-convergence-summary"
                data-synthesis-tier={hud.exploration.convergenceSummary.synthesisTier}
                className="bg-[#07101c] border border-cyan-500/45 p-2.5 mb-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] sm:text-[10px] font-mono-tabular uppercase tracking-wider text-cyan-300 font-bold mb-1">
                  <span>{hud.exploration.convergenceSummary.synthesisHeadline}</span>
                  <span className="text-emerald-300">
                    LOGS {hud.exploration.convergenceSummary.recoveredLogsCount}/
                    {hud.exploration.convergenceSummary.totalLogsCount} · CODEX{' '}
                    {hud.exploration.convergenceSummary.discoveredCodexCount}/
                    {hud.exploration.convergenceSummary.totalCodexCount} · SECRETS{' '}
                    {hud.exploration.convergenceSummary.discoveredSecretsCount}/
                    {hud.exploration.convergenceSummary.totalSecretsCount} · ECHO MEMORIES{' '}
                    {hud.exploration.convergenceSummary.discoveredEchoMemoriesCount}/
                    {hud.exploration.convergenceSummary.totalEchoMemoriesCount}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug">
                  {hud.exploration.convergenceSummary.synthesisSummary}
                </p>
              </div>
            )}

            <div
              data-testid="loom-lysa-transmission"
              className="bg-[#081220] border border-cyan-400/75 px-3 py-2 mb-3"
            >
              <div className="text-[10px] font-mono-tabular font-bold uppercase tracking-wider text-cyan-300 mb-0.5">
                {GAME_CONFIG.campaignChapters.chapter_5_loom.archiveLog.id} //{' '}
                {GAME_CONFIG.campaignChapters.chapter_5_loom.archiveLog.speaker}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-200 italic leading-snug">
                {GAME_CONFIG.chronicleLoom.lysaFinalTransmission}
              </p>
            </div>

            {/* Phase 21: Optional / Climactic Confrontation with WARDEN PRIME in Chronicle Loom Core */}
            {onEngageWardenPrime && (
              <div
                data-testid="loom-warden-prime-bar"
                className="flex flex-wrap items-center justify-between gap-2 bg-[#120b18] border border-amber-500/60 px-3 py-2 mb-3"
              >
                <div className="text-[10px] sm:text-[11px] font-mono-tabular text-amber-200">
                  <strong className="text-amber-400 uppercase tracking-wider">
                    SOVEREIGN OVERRIDE DETECTED:
                  </strong>{' '}
                  WARDEN PRIME’s Sovereign Architect chassis guards the Loom core. Confront it directly or execute an immediate override directive below.
                </div>
                <button
                  type="button"
                  data-testid="loom-btn-confront-warden-prime"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onEngageWardenPrime();
                  }}
                  className="px-3 py-1.5 text-[10px] font-mono-tabular font-bold uppercase bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  CONFRONT WARDEN PRIME [BOSS]
                </button>
              </div>
            )}

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

      {/* Bottom Perimeter Docks: Comms, Echo Rig (Left), Context/Hints/Touch (Center), Weapon & Action Dock (Right) */}
      <div
        className={`fixed inset-x-2 bottom-1.5 z-20 flex flex-col gap-1 pointer-events-none [@media(min-width:640px)_and_(min-height:541px)]:contents transition-opacity duration-150 ${
          hud.loom.active && hud.run.stage === 'chronicle_loom' && !inspectingLoomChamber
            ? 'opacity-20'
            : ''
        }`}
      >
        {/* In-World Live Narrative Comms Feed (Stacks above Echo/Weapon dock on mobile; floats cleanly above Echo Rig on desktop) */}
        {hud.comms.active &&
          (cameraSettings?.subtitlesEnabled ?? true) &&
          hud.run.stage !== 'intro' &&
          hud.run.stage !== 'boss_intro' &&
          hud.run.stage !== 'transition_to_boss' &&
          (!hud.loom.active || inspectingLoomChamber) &&
          (() => {
            const codec = computeCommsCodecProfile(
              hud.comms.active.speaker,
              hud.comms.active.classification,
              hud.comms.active.remainingTime,
              hud.comms.active.maxDuration,
              Boolean(cameraSettings?.reducedMotion)
            );
            return (
              <div
                data-testid="live-comms-banner"
                data-comms-id={hud.comms.active.id}
                data-comms-classification={hud.comms.active.classification}
                data-comms-channel={codec.channelCode}
                className="[@media(min-width:640px)_and_(min-height:541px)]:fixed [@media(min-width:640px)_and_(min-height:541px)]:left-4 [@media(min-width:640px)_and_(min-height:541px)]:bottom-[96px] [@media(min-width:640px)_and_(min-height:541px)]:z-20 [@media(min-width:640px)_and_(min-height:541px)]:w-[348px] w-full bg-[#070b12]/90 border border-cyan-400/55 p-2 sm:p-2.5 pointer-events-auto shadow-[0_10px_28px_rgba(0,0,0,0.75)]"
              >
                <div className="flex items-start gap-2 mb-1">
                  {/* Diegetic Speaker Codec Sigil */}
                  <div className="hidden sm:flex flex-col items-center justify-center w-8 h-8 shrink-0 bg-[#050911] border border-white/10">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                      {codec.glyph === 'warden' ? (
                        <>
                          <polygon points="12,3 20,8 20,16 12,21 4,16 4,8" fill="none" stroke={codec.accentHex} strokeWidth="1.5" />
                          <polygon points="12,7 16,12 12,17 8,12" fill={codec.accentHex} fillOpacity="0.3" stroke={codec.accentHex} strokeWidth="1" />
                          <line x1="7" y1="12" x2="17" y2="12" stroke="#f8fafc" strokeWidth="1.3" />
                        </>
                      ) : codec.glyph === 'lysa' ? (
                        <>
                          <circle cx="12" cy="12" r="8" fill="none" stroke={codec.accentHex} strokeWidth="1.4" strokeDasharray="16 6" />
                          <polygon points="12,6 17,12 12,18 7,12" fill={codec.accentHex} fillOpacity="0.28" stroke={codec.accentHex} strokeWidth="1.2" />
                          <circle cx="12" cy="12" r="1.8" fill="#f8fafc" />
                        </>
                      ) : codec.glyph === 'sera' ? (
                        <>
                          <circle cx="12" cy="12" r="8" fill="none" stroke={codec.accentHex} strokeWidth="1.5" />
                          <polygon points="12,6 17,15 12,13 7,15" fill={codec.accentHex} />
                        </>
                      ) : (
                        <>
                          <rect x="4" y="4" width="16" height="16" fill="none" stroke={codec.accentHex} strokeWidth="1.4" />
                          <line x1="6" y1="6" x2="18" y2="18" stroke={codec.accentHex} strokeWidth="1.2" />
                          <line x1="18" y1="6" x2="6" y2="18" stroke={codec.accentHex} strokeWidth="1.2" />
                        </>
                      )}
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`inline-block w-1.5 h-1.5 rotate-45 shrink-0 ${
                            hud.comms.active.classification === 'LIVE WARDEN DIRECTIVE'
                              ? 'bg-red-400'
                              : hud.comms.active.classification === 'RECONSTRUCTED TRACE'
                                ? 'bg-amber-400'
                                : 'bg-cyan-400'
                          }`}
                        />
                        <span
                          data-testid="live-comms-classification"
                          className={`text-[8px] sm:text-[9px] font-mono-tabular font-bold uppercase tracking-wider shrink-0 ${
                            hud.comms.active.classification === 'LIVE WARDEN DIRECTIVE'
                              ? 'text-red-300'
                              : hud.comms.active.classification === 'RECONSTRUCTED TRACE'
                                ? 'text-amber-300'
                                : hud.comms.active.classification === 'LIVE NEURAL TRACE'
                                  ? 'text-emerald-300'
                                  : 'text-cyan-300'
                          }`}
                        >
                          {hud.comms.active.classification}
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
                        className="px-1.5 py-0.5 text-[8px] font-mono-tabular uppercase text-slate-400 hover:text-white bg-[#0e1624] border border-white/10 cursor-pointer shrink-0"
                      >
                        ACK
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className="text-[8px] sm:text-[9px] font-mono-tabular text-slate-300 tracking-wide uppercase truncate">
                        {hud.comms.active.speaker} · {codec.frequencyLabel}
                      </span>
                      <svg
                        viewBox="0 0 28 10"
                        className="w-6 h-2 shrink-0"
                        aria-hidden="true"
                        data-testid="live-comms-waveform"
                      >
                        {codec.bars.map((amp, idx) => {
                          const h = Math.max(2, Number((amp * 10).toFixed(1)));
                          return (
                            <rect
                              key={idx}
                              x={idx * 4}
                              y={10 - h}
                              width="2.5"
                              height={h}
                              fill={codec.accentHex}
                              fillOpacity={0.85}
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>
                </div>
                <div
                  data-testid="live-comms-headline"
                  className="text-[10px] sm:text-[11px] font-mono-tabular font-bold uppercase tracking-wider text-slate-100 mb-0.5 truncate"
                >
                  {hud.comms.active.headline}
                </div>
                <p
                  data-testid="live-comms-body"
                  className="text-[10px] sm:text-[11px] text-slate-200 leading-snug mb-1 max-sm:line-clamp-2"
                >
                  {hud.comms.active.body}
                </p>
                {hud.comms.active.tacticalHint && (
                  <div
                    data-testid="live-comms-hint"
                    className="hidden sm:block text-[9px] sm:text-[10px] font-mono-tabular text-amber-300 leading-snug mb-1 pt-1 border-t border-white/8"
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
            );
          })()}

        <div className="grid grid-cols-2 gap-1 items-end [@media(min-width:640px)_and_(min-height:541px)]:contents">
          {/* Bottom-Left Dock: Slim Chrono Echo Rig Module */}
          <div
            data-testid="echo-hud-module"
            data-echo-state={echo.state}
            className="relative [@media(min-width:640px)_and_(min-height:541px)]:fixed [@media(min-width:640px)_and_(min-height:541px)]:bottom-3.5 [@media(min-width:640px)_and_(min-height:541px)]:left-4 [@media(min-width:640px)_and_(min-height:541px)]:z-20 [@media(min-width:640px)_and_(min-height:541px)]:w-[236px] bg-[#070b12]/80 border border-white/10 p-2 shadow-[0_8px_22px_rgba(0,0,0,0.55)] pointer-events-auto"
          >
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                {echo.state === 'recording' ? (
                  <span aria-hidden="true" className="inline-block w-2 h-2 bg-amber-400 shrink-0" />
                ) : echo.state === 'playback' ? (
                  <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-cyan-300 shrink-0" fill="currentColor">
                    <polygon points="2,1 11,6 2,11" />
                  </svg>
                ) : echo.hasClip ? (
                  <span aria-hidden="true" className="inline-block w-2 h-2 rotate-45 bg-cyan-400 shrink-0" />
                ) : (
                  <span aria-hidden="true" className="inline-block w-2 h-2 border border-slate-500 shrink-0" />
                )}
                <span className="text-[9px] font-mono-tabular font-semibold uppercase tracking-wider text-slate-300 truncate">
                  ECHO
                </span>
              </div>
              <span
                data-testid="echo-state-badge"
                className={`text-[9px] font-mono-tabular font-bold uppercase whitespace-nowrap shrink-0 ${
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

            <div className="relative h-1 w-full bg-[#04070c] overflow-hidden mb-1.5">
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

            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                tabIndex={-1}
                data-testid="echo-btn-record"
                title="Record or Stop Chrono Echo [T]"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onEchoRecord();
                }}
                className={`px-0.5 py-1 text-[8px] sm:text-[9px] font-mono-tabular font-semibold uppercase border transition-colors cursor-pointer whitespace-nowrap ${
                  echo.state === 'recording'
                    ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                    : 'bg-[#0c121c] hover:bg-[#162032] border-white/10 text-slate-200'
                }`}
              >
                <span className="hidden [@media(min-width:640px)_and_(min-height:541px)]:inline">[T] </span>
                {echo.state === 'recording' ? 'STOP' : 'REC'}
              </button>

              <button
                type="button"
                tabIndex={-1}
                data-testid="echo-btn-replay"
                title={echo.hasClip ? 'Replay recorded Chrono Echo [Y]' : 'Record an Echo with [T] first'}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onEchoReplay();
                }}
                className={`px-0.5 py-1 text-[8px] sm:text-[9px] font-mono-tabular font-semibold uppercase border transition-colors cursor-pointer whitespace-nowrap ${
                  echo.state === 'playback' || echo.hasClip
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-[#0a0f17] border-white/5 text-slate-500'
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
                className={`px-0.5 py-1 text-[8px] sm:text-[9px] font-mono-tabular font-semibold uppercase border transition-colors cursor-pointer whitespace-nowrap ${
                  relay.canRelay
                    ? 'bg-cyan-400/25 border-cyan-300 text-white'
                    : echo.state === 'playback'
                      ? 'bg-amber-500/15 border-amber-500/70 text-amber-300'
                      : 'bg-[#0a0f17] border-white/5 text-slate-500'
                }`}
              >
                {relay.cooldownTimer > 0
                  ? `${relay.cooldownTimer.toFixed(1)}s`
                  : (
                    <>
                      <span className="hidden [@media(min-width:640px)_and_(min-height:541px)]:inline">[V] </span>WARP
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
                className="px-0.5 py-1 text-[8px] sm:text-[9px] font-mono-tabular font-semibold uppercase bg-[#0c121c] hover:bg-[#162032] border border-white/10 text-slate-400 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className="hidden [@media(min-width:640px)_and_(min-height:541px)]:inline">[C] </span>CLR
              </button>
            </div>

            {/* Single Prioritized Echo/Resonance Status Line (Shown only during active Replay / Relay / Resonance) */}
            <div
              className={
                showContextualRelayOrResonance
                  ? 'mt-1 pt-1 border-t border-white/8 flex items-center justify-between gap-2 text-[9px] font-mono-tabular uppercase'
                  : 'sr-only'
              }
            >
              <span
                data-testid="resonance-status-readout"
                data-resonance-status={resonance.status}
                data-resonance-primed={resonance.primed ? 'true' : 'false'}
                data-can-converge={resonance.canConverge ? 'true' : 'false'}
                data-resonance-outcome={resonance.lastOutcome}
                className={`font-semibold truncate ${
                  resonance.primed
                    ? resonance.canConverge
                      ? 'text-white'
                      : 'text-amber-300'
                    : resonance.status === 'on_cooldown'
                      ? 'text-amber-300'
                      : 'text-slate-300'
                }`}
              >
                {resonance.primed
                  ? resonance.canConverge
                    ? `SYNC PRIMED ${resonance.remainingWindow.toFixed(1)}s · [E]`
                    : 'SYNC PRIMED · LOW FLUX'
                  : relay.canRelay
                    ? `WARP READY (${relay.distance.toFixed(1)}m)`
                    : echo.state === 'playback'
                      ? 'ECHO REPLAYING'
                      : 'STANDBY'}
              </span>
              <span
                data-testid="relay-status-readout"
                data-relay-status={relay.status}
                data-can-relay={relay.canRelay ? 'true' : 'false'}
                className="text-slate-400 shrink-0"
              >
                {relay.fluxCost}F
              </span>
            </div>
          </div>

          {/* Bottom-Right Dock: Sleek Action-RPG Arsenal Card */}
          <div
            data-testid="weapon-dock-card"
            className="relative [@media(min-width:640px)_and_(min-height:541px)]:fixed [@media(min-width:640px)_and_(min-height:541px)]:bottom-3.5 [@media(min-width:640px)_and_(min-height:541px)]:right-4 [@media(min-width:640px)_and_(min-height:541px)]:z-20 [@media(min-width:640px)_and_(min-height:541px)]:w-[276px] bg-[#070b12]/80 border border-white/10 p-2 shadow-[0_8px_22px_rgba(0,0,0,0.55)] pointer-events-auto"
          >
            <div
              data-testid="weapon-hud-module"
              data-equipped-weapon={hud.weapon.equippedWeaponId}
              data-equipped-upgrade={hud.weapon.equippedUpgradeId ?? 'none'}
              data-overheated={hud.weapon.overheated ? 'true' : 'false'}
              className="mb-1"
            >
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <div className="flex items-center gap-1 min-w-0">
                  <span
                    aria-hidden="true"
                    className={`inline-block w-1.5 h-1.5 shrink-0 ${
                      hud.weapon.overheated
                        ? 'bg-red-500 rotate-45'
                        : hud.weapon.equippedWeaponId === 'pulsecaster'
                          ? 'bg-sky-400 rounded-full'
                          : 'bg-cyan-400 rotate-45'
                    }`}
                  />
                  <span
                    data-testid="weapon-active-label"
                    className={`text-[9px] sm:text-[10px] font-mono-tabular font-bold uppercase tracking-wider whitespace-nowrap ${
                      hud.weapon.overheated
                        ? 'text-red-400'
                        : hud.weapon.equippedWeaponId === 'pulsecaster' ||
                            hud.weapon.equippedWeaponId === 'phase_rail'
                          ? 'text-sky-300'
                          : hud.weapon.equippedWeaponId === 'grav_breaker'
                            ? 'text-amber-300'
                            : 'text-cyan-300'
                    }`}
                  >
                    {hud.weapon.label}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    tabIndex={-1}
                    data-testid="weapon-switch-btn"
                    aria-label={`Switch Weapon [Tab / Z] (Currently ${hud.weapon.label})`}
                    title="Cycle Unlocked Arsenal Weapon [Tab / Z / 1-4]"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onSwitchWeapon?.();
                    }}
                    className={`px-1 sm:px-1.5 py-0.5 text-[8px] font-mono-tabular font-semibold uppercase border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      hud.weapon.equippedWeaponId === 'pulsecaster' ||
                      hud.weapon.equippedWeaponId === 'phase_rail'
                        ? 'bg-sky-500/20 hover:bg-sky-500/30 border-sky-400 text-sky-200'
                        : hud.weapon.equippedWeaponId === 'grav_breaker'
                          ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400 text-amber-200'
                          : 'bg-[#0d1522] hover:bg-[#17243a] border-cyan-500/60 text-cyan-200'
                    }`}
                  >
                    {(() => {
                      const cycleList: readonly WeaponId[] =
                        hud.progression.unlockedWeaponIds.length > 0
                          ? hud.progression.unlockedWeaponIds
                          : ['chrono_edge', 'pulsecaster'];
                      const curIdx = cycleList.indexOf(hud.weapon.equippedWeaponId);
                      const nextW =
                        curIdx >= 0
                          ? cycleList[(curIdx + 1) % cycleList.length]
                          : cycleList[0];
                      return nextW === 'pulsecaster'
                        ? 'TAB → PULSE'
                        : nextW === 'phase_rail'
                          ? 'TAB → RAIL'
                          : nextW === 'grav_breaker'
                            ? 'TAB → MAUL'
                            : 'TAB → EDGE';
                    })()}
                  </button>

                  <button
                    type="button"
                    tabIndex={-1}
                    data-testid="hud-btn-upgrade-bench"
                    aria-label={`Open Chrono Rig Upgrade Bench [U] (${hud.progression.memoryFragments} Memory Fragments)`}
                    title="Open Chrono Rig Upgrade Bench [U / P]"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onTogglePause();
                    }}
                    className={`px-1 sm:px-1.5 py-0.5 text-[8px] font-mono-tabular font-semibold uppercase border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      hud.progression.memoryFragments >= 2
                        ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400 text-amber-200'
                        : 'bg-[#0d131d] hover:bg-[#162032] border-white/10 text-slate-300'
                    }`}
                  >
                    <span
                      data-testid="hud-memory-fragments"
                      data-fragments={hud.progression.memoryFragments}
                    >
                      {hud.progression.memoryFragments}◆
                    </span>
                    <span className="hidden [@media(min-width:640px)_and_(min-height:541px)]:inline">
                      {' '}
                      [U]
                    </span>
                  </button>
                </div>
              </div>

              {/* 4-Slot Arsenal Quick-Select Bar */}
              <div
                data-testid="weapon-arsenal-slots"
                className="grid grid-cols-4 gap-1 mb-0.5"
              >
                {(
                  [
                    { id: 'chrono_edge', key: '1', short: 'EDGE' },
                    { id: 'pulsecaster', key: '2', short: 'PULSE' },
                    { id: 'phase_rail', key: '3', short: 'RAIL' },
                    { id: 'grav_breaker', key: '4', short: 'MAUL' },
                  ] as const
                ).map((slot) => {
                  const unlockedList = hud.progression.unlockedWeaponIds ?? [
                    'chrono_edge',
                    'pulsecaster',
                  ];
                  const unlocked = unlockedList.includes(slot.id);
                  const active = hud.weapon.equippedWeaponId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      tabIndex={-1}
                      disabled={!unlocked}
                      data-testid={`weapon-slot-${slot.id}`}
                      data-unlocked={unlocked ? 'true' : 'false'}
                      data-active={active ? 'true' : 'false'}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        if (unlocked) {
                          onSelectWeapon?.(slot.id);
                        }
                      }}
                      className={`px-0.5 py-0.5 text-[7px] sm:text-[8px] font-mono-tabular font-bold uppercase border transition-colors truncate ${
                        active
                          ? 'bg-cyan-500/25 border-cyan-300 text-white cursor-pointer'
                          : unlocked
                            ? 'bg-[#0b121e] hover:bg-[#142238] border-slate-700 text-slate-300 cursor-pointer'
                            : 'bg-[#06090f] border-slate-800/70 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <span className="hidden sm:inline">[{slot.key}] </span>
                      {slot.short}
                    </button>
                  );
                })}
              </div>

              {/* Active Mod Core (Only shown when a mod is equipped) */}
              {hud.weapon.equippedUpgradeId && (
                <div className="hidden [@media(min-width:640px)_and_(min-height:541px)]:flex items-center justify-between gap-1 text-[8px] font-mono-tabular uppercase mb-0.5">
                  <span className="text-slate-500">MOD</span>
                  <span
                    data-testid="weapon-active-upgrade"
                    data-upgrade-id={hud.weapon.equippedUpgradeId}
                    className="truncate font-semibold text-cyan-300"
                  >
                    {hud.weapon.equippedUpgradeLabel}
                  </span>
                </div>
              )}

              <div
                data-testid="pulsecaster-heat-bar"
                data-heat={hud.weapon.heat}
                data-max-heat={hud.weapon.maxHeat}
                data-overheated={hud.weapon.overheated ? 'true' : 'false'}
                className="flex items-center gap-1.5"
              >
                <div className="relative h-1.5 flex-1 bg-[#04070c] overflow-hidden">
                  {hud.weapon.overheated && hud.weapon.activeVent && !hud.weapon.activeVent.attempted && (
                    <div
                      className="absolute inset-y-0 bg-cyan-400/40 border-x border-cyan-300 z-10"
                      style={{
                        left: `${Math.round(hud.weapon.activeVent.windowStart * 100)}%`,
                        width: `${Math.round(
                          (hud.weapon.activeVent.windowEnd - hud.weapon.activeVent.windowStart) * 100
                        )}%`,
                      }}
                    />
                  )}
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
                  {hud.weapon.overheated && hud.weapon.activeVent && (
                    <div
                      className="absolute inset-y-0 w-0.5 bg-white z-20"
                      style={{ left: `${Math.round(hud.weapon.activeVent.progress * 100)}%` }}
                    />
                  )}
                </div>
                <span
                  data-testid="weapon-status-readout"
                  className={`text-[8px] sm:text-[9px] font-mono-tabular uppercase whitespace-nowrap shrink-0 ${
                    hud.weapon.overheated
                      ? 'text-red-400 font-bold'
                      : (hud.weapon.activeVent?.empoweredShots ?? 0) > 0
                        ? 'text-cyan-300 font-bold'
                        : resonance.primed && resonance.canConverge
                          ? 'text-white font-bold'
                          : isEmpoweredReady
                            ? 'text-amber-300 font-semibold'
                            : 'text-slate-400'
                  }`}
                >
                  {hud.weapon.overheated
                    ? hud.weapon.activeVent && !hud.weapon.activeVent.attempted
                      ? `VENT [F] ${hud.weapon.overheatTimer.toFixed(1)}s`
                      : `OVERHEAT ${hud.weapon.overheatTimer.toFixed(1)}s`
                    : (hud.weapon.activeVent?.empoweredShots ?? 0) > 0
                      ? `OVERCHARGED ×${hud.weapon.activeVent?.empoweredShots}`
                      : resonance.primed && resonance.canConverge
                        ? `CONVERGE [E]`
                        : hud.weapon.equippedWeaponId === 'pulsecaster' ||
                            hud.weapon.equippedWeaponId === 'phase_rail'
                          ? `HEAT ${hud.weapon.heat}%`
                          : isEmpoweredReady
                            ? 'HEAVY [E] READY'
                            : `COMBO ${hud.comboStep}/3`}
                </span>
              </div>
            </div>

            {/* Mobile / Touch 4-Action Combat Bar (Hidden on desktop so keyboard/mouse users get clean HUD) */}
            <div className="[@media(min-width:640px)_and_(min-height:541px)]:hidden grid grid-cols-4 gap-1">
              <button
                type="button"
                tabIndex={-1}
                data-testid="combat-btn-light"
                title="Light combo — tap LMB / F / J"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onLightAttack?.();
                }}
                className="px-0.5 py-1 text-[8px] font-mono-tabular font-semibold uppercase bg-[#0d131d] active:bg-[#162032] border border-white/10 text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                LIGHT
              </button>

              <button
                type="button"
                tabIndex={-1}
                data-testid="combat-btn-heavy"
                title="Charged Heavy"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onHeavyAttack?.();
                }}
                className={`px-0.5 py-1 text-[8px] font-mono-tabular font-semibold uppercase border transition-colors cursor-pointer whitespace-nowrap ${
                  resonance.primed && resonance.canConverge
                    ? 'bg-cyan-400/25 border-white text-white'
                    : isEmpoweredReady
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-[#0d131d] active:bg-[#162032] border-white/10 text-slate-200'
                }`}
              >
                HEAVY
              </button>

              <button
                type="button"
                tabIndex={-1}
                data-testid="combat-btn-dodge"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onDodge?.();
                }}
                className="px-0.5 py-1 text-[8px] font-mono-tabular font-semibold uppercase bg-[#0d131d] active:bg-[#162032] border border-white/10 text-slate-300 transition-colors cursor-pointer whitespace-nowrap"
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
                className="px-0.5 py-1 text-[8px] font-mono-tabular font-semibold uppercase bg-[#0d131d] active:bg-[#162032] border border-white/10 text-slate-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                PARRY
              </button>
            </div>

            {/* Chapter III Gravity Pin [G] & Chapter IV Echo Collapse [X] Controls */}
            {(hud.gravityPin.unlocked || hud.echoCollapse.unlocked) && (
              <div className="grid grid-cols-2 gap-1 mt-1">
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
                    className={`px-1 py-0.5 text-[8px] font-mono-tabular font-semibold uppercase border transition-colors cursor-pointer whitespace-nowrap truncate ${
                      hud.gravityPin.status === 'active'
                        ? 'bg-purple-500/25 border-purple-300 text-purple-200'
                        : hud.gravityPin.status === 'ready'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-[#0c121c] border-white/10 text-slate-500'
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
                    className={`px-1 py-0.5 text-[8px] font-mono-tabular font-semibold uppercase border transition-colors cursor-pointer whitespace-nowrap truncate ${
                      hud.echoCollapse.status === 'ready'
                        ? 'bg-rose-500/25 border-rose-300 text-white'
                        : 'bg-[#0c121c] border-white/10 text-slate-500'
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

        {/* Bottom-Center Cluster: Context Prompt + Discovery Toast + Checkpoint + Tutorial + Mobile Touch Controls */}
        <div
          data-testid="hud-bottom-cluster"
          data-run-mode={hud.run.mode}
          data-run-stage={hud.run.stage}
          className="[@media(min-width:640px)_and_(min-height:541px)]:fixed [@media(min-width:640px)_and_(min-height:541px)]:bottom-3.5 [@media(min-width:640px)_and_(min-height:541px)]:left-1/2 [@media(min-width:640px)_and_(min-height:541px)]:-translate-x-1/2 [@media(min-width:640px)_and_(min-height:541px)]:z-20 [@media(min-width:640px)_and_(min-height:541px)]:w-auto [@media(min-width:640px)_and_(min-height:541px)]:max-w-[calc(100vw-620px)] flex flex-col items-center gap-1"
        >
          {/* Single Contextual Environmental Interaction Prompt (Suppressed during intro/transition banners to prevent overlap) */}
          {hud.exploration.prompt.interactableId &&
            hud.run.stage !== 'intro' &&
            hud.run.stage !== 'boss_intro' &&
            hud.run.stage !== 'transition_to_boss' &&
            (!hud.loom.active || inspectingLoomChamber) && (
              <div
                data-testid="hud-interaction-prompt"
                data-interactable-id={hud.exploration.prompt.interactableId}
                data-interaction-status={hud.exploration.prompt.status}
                data-can-interact={hud.exploration.prompt.canInteract ? 'true' : 'false'}
                className={`w-full max-w-md bg-[#070b12]/88 border px-3 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.65)] pointer-events-auto ${
                  hud.exploration.prompt.canInteract
                    ? 'border-emerald-400/80 text-emerald-200'
                    : hud.exploration.prompt.status === 'already_activated'
                      ? 'border-cyan-500/50 text-cyan-200'
                      : 'border-amber-400/55 text-amber-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono-tabular uppercase font-bold">
                  <span className="truncate">{hud.exploration.prompt.promptText}</span>
                  <button
                    type="button"
                    tabIndex={-1}
                    data-testid="hud-btn-interact"
                    data-can-interact={hud.exploration.prompt.canInteract ? 'true' : 'false'}
                    data-interactable-id={hud.exploration.prompt.interactableId}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onInteract?.();
                    }}
                    className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider cursor-pointer shrink-0 whitespace-nowrap ${
                      hud.exploration.prompt.canInteract
                        ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                        : 'bg-[#0e1624] border border-amber-400/50 text-amber-200'
                    }`}
                  >
                    {hud.exploration.prompt.canInteract ? 'ACTIVATE [I]' : '[I] NODE'}
                  </button>
                </div>
                {hud.exploration.prompt.detailText && (
                  <div className="text-[9px] sm:text-[10px] font-mono-tabular text-slate-300 truncate mt-0.5">
                    {hud.exploration.prompt.detailText}
                  </div>
                )}
              </div>
            )}

          {/* Secret Area Discovery Banner */}
          {hud.exploration.lastDiscoveryBanner && (
            <div
              data-testid="hud-secret-discovery-banner"
              data-secret-id={hud.exploration.lastDiscoveryBanner.secretId}
              className="w-full max-w-md bg-[#071518]/95 border border-emerald-400 px-3 py-1.5 shadow-[0_8px_24px_rgba(16,185,129,0.28)]"
            >
              <div className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono-tabular uppercase font-bold text-emerald-300">
                <span className="truncate">
                  SECRET DISCOVERED · {hud.exploration.lastDiscoveryBanner.title}
                </span>
                <span className="text-cyan-200 whitespace-nowrap shrink-0">
                  {hud.exploration.lastDiscoveryBanner.rewardSummary}
                </span>
              </div>
              <div className="text-[9px] font-mono-tabular text-slate-300 truncate mt-0.5">
                {hud.exploration.lastDiscoveryBanner.subtitle} · LOGGED TO SECTOR MAP [N]
              </div>
            </div>
          )}

          {/* Checkpoint Saved / Restored Notice Toast */}
          {hud.run.checkpointNotice &&
            hud.run.checkpointNoticeTimer > 0 &&
            hud.run.stage !== 'transition_to_boss' &&
            hud.run.stage !== 'boss_intro' && (
              <div
                data-testid="checkpoint-notice-banner"
                className="bg-[#09121e]/95 border border-cyan-400/80 px-3 py-1 text-[10px] sm:text-[11px] font-mono-tabular font-bold text-cyan-300 tracking-wider uppercase shadow-md max-w-full truncate"
              >
                {hud.run.checkpointNotice}
              </div>
            )}

          {/* Contextual Gameplay Tutorial Prompt (Compact 1-line strip; hides during intro, loom, or urgent interact prompt so never double-stacks) */}
          <div
            data-testid="tutorial-prompt-banner"
            data-tutorial-step={hud.tutorial.step}
            data-tutorial-enabled={hud.tutorial.enabled ? 'true' : 'false'}
            data-tutorial-stuck={hud.tutorial.stuckHintActive ? 'true' : 'false'}
            className={
              hud.run.stage === 'intro' ||
              hud.run.stage === 'boss_intro' ||
              hud.run.stage === 'transition_to_boss' ||
              hud.loom.active ||
              Boolean(hud.exploration.prompt.interactableId)
                ? 'sr-only'
                : 'w-full max-w-md pointer-events-auto'
            }
          >
            {hud.tutorial.enabled && hud.tutorial.step !== 'completed' ? (
              <div className="bg-[#070b12]/80 border border-white/10 px-3 py-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.55)]">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span
                    data-testid="tutorial-step-title"
                    className="text-[9px] font-mono-tabular font-bold uppercase tracking-wider text-amber-300 truncate"
                  >
                    {tutorialMeta.badge} ·{' '}
                    <span className="text-cyan-300">
                      {hud.tutorial.title.replace(
                        /^(STEP\s+\d+|CALIBRATION\s+\d\/\d|CHAPTER\s+[IVX]+)\s*·\s*/i,
                        ''
                      )}
                    </span>
                  </span>
                  <button
                    type="button"
                    tabIndex={-1}
                    data-testid="tutorial-toggle-btn"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onToggleTutorial?.();
                    }}
                    className="text-[8px] font-mono-tabular uppercase text-slate-400 hover:text-white cursor-pointer whitespace-nowrap shrink-0"
                  >
                    HIDE [H]
                  </button>
                </div>
                <p
                  data-testid="tutorial-desktop-prompt"
                  className="hidden [@media(min-width:640px)_and_(min-height:541px)]:block text-[11px] text-slate-200 leading-snug line-clamp-1"
                >
                  {hud.tutorial.desktopPrompt}
                </p>
                <p
                  data-testid="tutorial-mobile-prompt"
                  className="[@media(min-width:640px)_and_(min-height:541px)]:hidden text-[10px] text-slate-200 leading-snug line-clamp-2"
                >
                  {hud.tutorial.mobilePrompt}
                </p>
                {hud.tutorial.stuckHintActive && hud.tutorial.stuckHint && (
                  <p
                    data-testid="tutorial-stuck-hint"
                    className="mt-1 pt-1 border-t border-amber-500/30 text-[10px] font-mono-tabular text-amber-300 leading-snug"
                  >
                    HINT: {hud.tutorial.stuckHint}
                  </p>
                )}
              </div>
            ) : (
              hud.tutorial.step !== 'completed' && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    tabIndex={-1}
                    data-testid="tutorial-toggle-btn"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onToggleTutorial?.();
                    }}
                    className="px-2.5 py-1 text-[9px] font-mono-tabular uppercase bg-[#070b12]/75 hover:bg-[#162032] border border-white/10 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    HINTS [H]
                  </button>
                </div>
              )
            )}
          </div>

          {/* Mobile Touch Controls Row: 4-Direction Pad + Dedicated Touch Camera Orbit Pad */}
          <div className="[@media(min-width:640px)_and_(min-height:541px)]:hidden flex items-stretch justify-center gap-1 w-full pointer-events-auto">
            <div
              data-testid="touch-move-pad"
              style={{ touchAction: 'none' }}
              className="grid grid-cols-4 gap-1 flex-1 min-w-0 bg-[#080d15]/92 border border-slate-800/90 p-1 shadow-[0_8px_20px_rgba(0,0,0,0.65)]"
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
                className="py-1.5 px-0.5 text-[8px] sm:text-[10px] font-mono-tabular font-semibold uppercase bg-[#0d131d] active:bg-cyan-500/25 border border-slate-700/80 text-slate-200 transition-colors cursor-pointer whitespace-nowrap select-none"
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
                className="py-1.5 px-0.5 text-[8px] sm:text-[10px] font-mono-tabular font-semibold uppercase bg-[#0d131d] active:bg-cyan-500/25 border border-slate-700/80 text-slate-200 transition-colors cursor-pointer whitespace-nowrap select-none"
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
                className="py-1.5 px-0.5 text-[8px] sm:text-[10px] font-mono-tabular font-semibold uppercase bg-[#0d131d] active:bg-cyan-500/25 border border-slate-700/80 text-slate-200 transition-colors cursor-pointer whitespace-nowrap select-none"
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
                className="py-1.5 px-0.5 text-[8px] sm:text-[10px] font-mono-tabular font-semibold uppercase bg-[#0d131d] active:bg-cyan-500/25 border border-slate-700/80 text-slate-200 transition-colors cursor-pointer whitespace-nowrap select-none"
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
              className="w-[88px] shrink-0 flex flex-col items-center justify-center bg-[#080d15]/92 active:bg-cyan-500/20 border border-cyan-500/50 px-1.5 py-1 shadow-[0_8px_20px_rgba(0,0,0,0.65)] select-none cursor-grab active:cursor-grabbing"
            >
              <span className="text-[8px] font-mono-tabular font-bold uppercase tracking-wider text-cyan-300 leading-tight whitespace-nowrap">
                [CAM ORBIT]
              </span>
              <span className="text-[7px] font-mono-tabular uppercase tracking-widest text-slate-400 leading-tight whitespace-nowrap">
                DRAG LOOK
              </span>
            </div>
          </div>

          {/* Quiet Desktop Shortcut Reminder */}
          {(!hud.tutorial.enabled || hud.tutorial.step === 'completed') && (
            <div className="hidden [@media(min-width:640px)_and_(min-height:541px)]:block text-center text-[10px] font-mono-tabular text-slate-400/90 bg-[#080d15]/88 border border-slate-800/80 px-3 py-1 whitespace-nowrap">
              [WASD] Move · [O/Wheel] Lock · [Tab/1-4] Weapon · [F/E] Strike/Exec · [Space] Dodge · [Q] Parry · [T/Y/V] Echo
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

