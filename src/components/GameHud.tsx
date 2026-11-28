import React from 'react';
import { GAME_CONFIG } from '../game/config.ts';
import {
  CHRONO_RELICS,
  getDraftRelicSynergyPreview,
} from '../game/recursion-mode.ts';
import { BOSS_GAUNTLET_STAGES, formatGauntletClock } from '../game/chrono-overdrive.ts';
import { EXPEDITION_SECTORS } from '../game/expedition-path.ts';
import { getCurrentCalibrationObjective } from '../game/simulation.ts';
import {
  formatSpeedrunClock,
  formatSpeedrunDelta,
} from '../game/paradox-expansion.ts';
import {
  PHOTO_FILTER_PRESETS,
  WEAPON_MOD_CHIPS,
  getStyleRankMeta,
} from '../game/ascension-expansion.ts';
import { WEAPON_OVERCHARGE_PERKS } from '../game/kinetic-overcharge.ts';
import {
  TWIN_SYNC_TIER_SPECS,
  formatEchoDoctrineHudBadge,
  getEchoDoctrineSpec,
  normalizeEchoDoctrineId,
} from '../game/echo-synergy.ts';
import { MOMENTUM_TIER_SPECS } from '../game/chrono-momentum.ts';
import { CHRONO_NEXUS_TIER_SPECS } from '../game/chrono-nexus.ts';
import { WEAPON_RESONANCE_SPECS } from '../game/chrono-resonance.ts';
import {
  localizeEnemyTacticalText,
  localizeHudObjectiveText,
  localizeStanceLabel,
  localizeStoryArc,
  localizeTutorialHud,
} from '../game/chronicle-awakening.ts';
import {
  HudLiveCommsStrip,
  HudUpperNarrativeOverlays,
} from './HudNarrativeOverlays.tsx';
import {
  HudIconArmory,
  HudIconEchoGlyph,
  HudIconFocus,
  HudIconMap,
  HudIconPause,
  HudIconVitalCrest,
  HudIconWeaponGlyph,
  HudSafeRoomDock,
} from './HudSafeRoomDock.tsx';
import {
  SENTINEL_PROTOCOL_SPECS,
  formatSentinelHudLabel,
} from '../game/chrono-aegis.ts';
import {
  BOSS_ECHO_CORES,
  computeSentinelCoreConfluence,
  computeWeaponCoreAttunement,
  formatBossCoreHudBadge,
  isBossCoreTranscended,
  isWeaponAttunedToBossCore,
} from '../game/boss-echo-cores.ts';
import { t } from '../game/i18n.ts';
import type {
  AppLocale,
  CameraSettings,
  ChronicleLoomEndingId,
  ChronoRelicId,
  DamageNumberKind,
  FabricatorItemId,
  HudSnapshot,
  PhotoModeState,
  StoryArcId,
  TutorialStep,
  WeaponId,
} from '../game/types.ts';

export interface ProjectedDamagePopup {
  id: number;
  amount: number;
  x: number;
  y: number;
  kind: DamageNumberKind;
  progress: number;
}

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
  onDismissHoloMemory?: () => void;
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
  onTriggerOverdrive?: () => void;
  onTriggerExpeditionBreach?: () => void;
  onEnterExpeditionAirlock?: () => void;
  onSafeRoomMedBay?: () => void;
  onSafeRoomLysaBriefing?: () => void;
  onClaimSecretVault?: () => void;
  projectedDamagePopups?: ProjectedDamagePopup[];
  onUseNanite?: () => void;
  onPurchaseFabricator?: (itemId: FabricatorItemId) => void;
  onEnterParadoxRift?: () => void;
  onToggleLockOn?: () => void;
  onCycleLockOn?: () => void;
  onSwitchWeapon?: () => void;
  onSelectWeapon?: (weaponId: WeaponId) => void;
  onInteract?: () => void;
  onOpenMap?: () => void;
  onOpenArmory?: () => void;
  onEngageWardenPrime?: () => void;
  onSelectLoomEnding?: (ending: ChronicleLoomEndingId) => void;
  onSelectRecursionRelic?: (relicId: ChronoRelicId) => boolean | void;
  onRestoreCampaign?: () => void;
  onResolveStoryChoice?: (arcId: StoryArcId, optionId: string) => void;
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
  locale?: AppLocale;
  onToggleLocale?: () => void;
  onTriggerChronoFinisher?: () => void;
  onCycleSentinelProtocol?: () => void;
  onCycleEchoDoctrine?: () => void;
  onTriggerConfluenceBurst?: () => void;
  photoMode?: PhotoModeState;
  onTogglePhotoMode?: () => void;
  onUpdatePhotoMode?: (patch: Partial<PhotoModeState>) => void;
  onCapturePhoto?: () => void;
  focusMode?: boolean;
  onToggleFocusMode?: () => void;
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
  onTogglePause,
  onRestart,
  onStartBoss,
  onSkipIntro,
  onSkipTransition,
  onSkipBossIntro,
  onDismissComms,
  onDismissHoloMemory,
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
  onTriggerOverdrive,
  onTriggerExpeditionBreach,
  onEnterExpeditionAirlock,
  onSafeRoomMedBay,
  onSafeRoomLysaBriefing,
  onClaimSecretVault,
  projectedDamagePopups = [],
  onUseNanite,
  onPurchaseFabricator,
  onEnterParadoxRift,
  onToggleLockOn,
  onCycleLockOn,
  onSelectWeapon,
  onInteract,
  onOpenMap,
  onOpenArmory,
  onEngageWardenPrime,
  onSelectLoomEnding,
  onSelectRecursionRelic,
  onRestoreCampaign,
  onResolveStoryChoice,
  cameraSettings,
  onTouchMoveHold,
  onTouchMovePulse,
  onTouchCameraStart,
  onTouchCameraMove,
  onTouchCameraEnd,
  locale = 'en',
  onTriggerChronoFinisher,
  onCycleSentinelProtocol,
  onCycleEchoDoctrine,
  onTriggerConfluenceBurst,
  photoMode,
  onTogglePhotoMode,
  onUpdatePhotoMode,
  onCapturePhoto,
  focusMode = false,
  onToggleFocusMode,
}) => {
  const [inspectingLoomChamber, setInspectingLoomChamber] = React.useState(false);
  const [storyDrawerOpen, setStoryDrawerOpen] = React.useState(false);
  const [actCurtainVisible, setActCurtainVisible] = React.useState(true);

  React.useEffect(() => {
    if (hud.run.stage !== 'chronicle_loom') {
      setInspectingLoomChamber(false);
    }
  }, [hud.run.stage]);
  React.useEffect(() => {
    setStoryDrawerOpen(false);
    setActCurtainVisible(true);
    const timer = window.setTimeout(() => {
      setActCurtainVisible(false);
    }, 4200);
    return () => window.clearTimeout(timer);
  }, [hud.run.chapter, hud.encounterMode]);
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
  const localizedTutorial = localizeTutorialHud(hud.tutorial, tutorialMeta.badge, locale);

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
      ? `${t(locale, 'echoRec')} ${echo.recordingTime.toFixed(1)}s/${echo.maxDuration.toFixed(1)}s`
      : echo.state === 'playback'
        ? `${t(locale, 'echoPlay')} ${echo.playbackTime.toFixed(1)}s/${echo.clipDuration.toFixed(1)}s`
        : echo.state === 'ready' || echo.state === 'finished'
          ? `${locale === 'vi' ? 'SẴN SÀNG' : 'READY'} (${echo.clipDuration.toFixed(1)}s)`
          : t(locale, 'echoIdleTrack');

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

  if (photoMode?.active) {
    return (
      <div
        data-testid="hud-photo-mode-root"
        className="fixed inset-0 z-30 pointer-events-none select-none overflow-hidden"
      >
        {photoMode.hideUi ? (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            className="fixed top-4 right-4 flex items-center gap-2 pointer-events-auto"
          >
            <button
              type="button"
              data-testid="photo-btn-show-ui"
              onClick={() => onUpdatePhotoMode?.({ hideUi: false })}
              className="px-3 py-1.5 text-[10px] font-mono-tabular font-bold uppercase bg-[#070b12]/90 hover:bg-[#121e30] border border-cyan-400/70 text-cyan-200 cursor-pointer"
            >
              {t(locale, 'photoShowUi')}
            </button>
            <button
              type="button"
              data-testid="photo-btn-exit"
              onClick={() => onTogglePhotoMode?.()}
              className="px-3 py-1.5 text-[10px] font-mono-tabular font-bold uppercase bg-[#1a0d12]/90 hover:bg-[#2c141d] border border-rose-400/80 text-rose-200 cursor-pointer"
            >
              {t(locale, 'photoExit')}
            </button>
          </div>
        ) : (
          <>
            {/* Minimal Viewfinder Corner Brackets */}
            <div className="fixed inset-6 pointer-events-none">
              <div className="absolute top-0 left-0 w-7 h-7 border-t-2 border-l-2 border-cyan-400/75" />
              <div className="absolute top-0 right-0 w-7 h-7 border-t-2 border-r-2 border-cyan-400/75" />
              <div className="absolute bottom-0 left-0 w-7 h-7 border-b-2 border-l-2 border-cyan-400/75" />
              <div className="absolute bottom-0 right-0 w-7 h-7 border-b-2 border-r-2 border-cyan-400/75" />
            </div>

            {/* Bottom-Center 3D Photo Drone Dock (Isolated from canvas drag-orbit, zero backdrop-blur) */}
            <div
              data-testid="hud-photo-mode-dock"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerMove={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[min(94vw,760px)] bg-[#070b12]/94 border border-cyan-400/60 px-4 py-3 pointer-events-auto shadow-[0_14px_40px_rgba(0,0,0,0.8)] font-mono-tabular text-slate-200 space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div>
                  <div className="text-xs font-display font-bold uppercase tracking-widest text-cyan-300">
                    {t(locale, 'photoTitle')}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {t(locale, 'photoOrbitHint')}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    data-testid="photo-btn-drone-toggle"
                    onClick={() => onUpdatePhotoMode?.({ showDrone: !photoMode.showDrone })}
                    className={`px-2.5 py-1 text-[10px] font-bold uppercase border cursor-pointer transition-colors ${
                      photoMode.showDrone
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-[#0d1420] border-slate-700 text-slate-400'
                    }`}
                  >
                    {t(locale, 'photoDroneToggle')}: {photoMode.showDrone ? 'ON' : 'OFF'}
                  </button>
                  <button
                    type="button"
                    data-testid="photo-btn-hide-ui"
                    onClick={() => onUpdatePhotoMode?.({ hideUi: true })}
                    className="px-2.5 py-1 text-[10px] font-bold uppercase bg-[#0d1420] hover:bg-[#162236] border border-slate-700 text-slate-200 cursor-pointer"
                  >
                    {t(locale, 'photoHideUi')}
                  </button>
                  <button
                    type="button"
                    data-testid="photo-btn-capture"
                    onClick={() => onCapturePhoto?.()}
                    className="px-3 py-1 text-[10px] font-bold uppercase bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-200 cursor-pointer"
                  >
                    {t(locale, 'photoCapture')}
                  </button>
                  <button
                    type="button"
                    data-testid="photo-btn-exit"
                    onClick={() => onTogglePhotoMode?.()}
                    className="px-2.5 py-1 text-[10px] font-bold uppercase bg-rose-950/80 hover:bg-rose-900/90 border border-rose-400/70 text-rose-100 cursor-pointer"
                  >
                    {t(locale, 'photoExit')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
                <label className="flex items-center gap-2">
                  <span className="text-cyan-300 uppercase whitespace-nowrap shrink-0">
                    {t(locale, 'photoZoom')} ({photoMode.distance.toFixed(1)}m)
                  </span>
                  <input
                    type="range"
                    min={2.8}
                    max={14}
                    step={0.2}
                    value={photoMode.distance}
                    onChange={(e) => onUpdatePhotoMode?.({ distance: Number(e.target.value) })}
                    className="flex-1 accent-cyan-400 cursor-pointer"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="text-amber-300 uppercase whitespace-nowrap shrink-0">
                    {t(locale, 'photoFov')} ({Math.round(photoMode.fov)}°)
                  </span>
                  <input
                    type="range"
                    min={30}
                    max={80}
                    step={1}
                    value={photoMode.fov}
                    onChange={(e) => onUpdatePhotoMode?.({ fov: Number(e.target.value) })}
                    className="flex-1 accent-amber-400 cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 mr-1">
                  {t(locale, 'photoFilterLabel')}:
                </span>
                {PHOTO_FILTER_PRESETS.map((preset) => {
                  const active = photoMode.filter === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      data-testid={`photo-filter-${preset.id}`}
                      onClick={() => onUpdatePhotoMode?.({ filter: preset.id })}
                      className={`px-2 py-1 text-[9px] font-bold uppercase border cursor-pointer transition-colors ${
                        active
                          ? 'bg-fuchsia-500/25 border-fuchsia-400 text-fuchsia-100'
                          : 'bg-[#0b111d] hover:bg-[#142034] border-slate-700 text-slate-300'
                      }`}
                    >
                      {locale === 'vi' ? preset.labelVi : preset.labelEn}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  const styleState = hud.ascension?.style;
  const styleMeta = styleState ? getStyleRankMeta(styleState.tier) : null;
  const styleProgressPct = styleState
    ? Math.max(0, Math.min(100, (styleState.points / 280) * 100))
    : 0;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none select-none overflow-hidden">
      {/* Floating Style Rank (D → SSS) & Daily Trial Clock — Clean Typographic Readout Below Radar */}
      {hud.appState === 'playing' && styleState && styleMeta && (
        <div
          data-testid="hud-style-rank-panel"
          data-style-tier={styleState.tier}
          data-finisher-ready={styleState.finisherReady ? 'true' : 'false'}
          className="fixed top-[168px] right-4 z-20 min-w-[148px] max-w-[240px] pointer-events-none flex flex-col items-end gap-1"
        >
          {hud.ascension?.dailyTrialActive && hud.ascension.dailyTrialConfig && (
            <div
              data-testid="hud-daily-trial-badge"
              className="px-2 py-1 bg-[#0b1019]/84 border border-amber-400/60 text-right font-mono-tabular"
            >
              <div className="text-[8px] font-bold uppercase tracking-widest text-amber-300">
                {t(locale, 'dailyActiveBadge')} · {hud.ascension.dailyTrialConfig.seedCode}
              </div>
              <div className="text-[11px] font-bold text-white leading-tight">
                {formatSpeedrunClock(hud.ascension.dailyTrialElapsedSec)}
              </div>
            </div>
          )}

          {(hud.combatFlow?.temporalSlipRemaining ?? 0) > 0 && (() => {
            const slipRem = hud.combatFlow?.temporalSlipRemaining ?? 0;
            const slipMax = Math.max(0.1, hud.combatFlow?.temporalSlipMax || 1.35);
            const slipRatio = Math.max(0, Math.min(1, slipRem / slipMax));
            return (
              <div
                data-testid="hud-temporal-slip-badge"
                data-slip-remaining={slipRem.toFixed(2)}
                className="w-full px-2 py-1 bg-[#061523]/92 border border-cyan-300/75 text-right font-mono-tabular shadow-[0_6px_18px_rgba(34,211,238,0.28)]"
              >
                <div className="flex items-center justify-between gap-1 text-[8px] font-bold tracking-wider text-cyan-200 whitespace-nowrap">
                  <span>{t(locale, 'temporalSlipHud')}</span>
                  <span className="text-white">{slipRem.toFixed(1)}s</span>
                </div>
                <div className="relative h-1 w-full bg-[#040911] mt-1 overflow-hidden">
                  <div
                    className="absolute inset-0 origin-right bg-cyan-300 transition-transform duration-75"
                    style={{ transform: `scaleX(${slipRatio.toFixed(4)})` }}
                  />
                </div>
              </div>
            );
          })()}

          {hud.liveRankForecast &&
            !(
              hud.expedition?.enabled &&
              (hud.expedition.phase === 'safe_room' ||
                hud.expedition.phase === 'explore' ||
                hud.expedition.phase === 'airlock_open')
            ) &&
            (hud.enemiesAlive > 0 || Boolean(hud.boss)) && (
            <div
              data-testid="hud-live-rank-forecast"
              data-forecast-grade={hud.liveRankForecast.grade}
              data-forecast-hitless={hud.liveRankForecast.hitless ? 'true' : 'false'}
              className="w-auto text-right pr-0.5 font-mono-tabular text-[9px] leading-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] whitespace-nowrap"
            >
              <span className="text-slate-300/90">{t(locale, 'liveRankLabel')} </span>
              <strong
                className={
                  hud.liveRankForecast.grade === 'S+'
                    ? 'text-cyan-300 font-extrabold'
                    : hud.liveRankForecast.grade === 'S'
                      ? 'text-amber-300 font-bold'
                      : hud.liveRankForecast.grade === 'A'
                        ? 'text-emerald-300 font-bold'
                        : 'text-slate-100 font-bold'
                }
              >
                {hud.liveRankForecast.grade}
              </strong>
              <span aria-hidden="true" className="text-slate-400"> · </span>
              <span className="text-slate-200">{Math.round(hud.liveRankForecast.score)}</span>
              {hud.liveRankForecast.hitless && (
                <>
                  <span aria-hidden="true" className="text-slate-400"> · </span>
                  <span className="text-emerald-300 font-semibold">{t(locale, 'liveHitlessTag')}</span>
                </>
              )}
            </div>
          )}

          {!(
            hud.expedition?.enabled &&
            (hud.expedition.phase === 'safe_room' ||
              hud.expedition.phase === 'explore' ||
              hud.expedition.phase === 'airlock_open')
          ) &&
            (styleState.points >= 8 ||
              styleState.finisherReady ||
              hud.ascension?.dailyTrialActive) && (
            <div className="w-full text-right pr-0.5">
              <div className="flex items-baseline justify-end gap-1.5">
                <span className="text-[9px] font-mono-tabular uppercase tracking-widest text-slate-300/80 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                  {t(locale, 'styleRank')}
                </span>
                <span
                  data-testid="hud-style-tier-letter"
                  className="font-display font-extrabold text-3xl leading-none tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
                  style={{ color: styleMeta.accentCss }}
                >
                  {styleState.tier}
                </span>
              </div>
              <div
                className="text-[9px] font-mono-tabular font-bold uppercase tracking-wider truncate drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]"
                style={{ color: styleMeta.accentCss }}
              >
                {locale === 'vi' ? styleMeta.titleVi : styleMeta.titleEn}
              </div>
              <div className="relative h-1 w-full bg-[#04070c]/90 mt-1 overflow-hidden">
                <div
                  className="absolute inset-y-0 right-0 transition-all duration-100"
                  style={{
                    width: `${styleProgressPct}%`,
                    backgroundColor: styleMeta.accentCss,
                  }}
                />
              </div>
              {styleState.lastActionLabel && (
                <div className="text-[8px] font-mono-tabular text-slate-200/85 uppercase truncate mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                  {styleState.lastActionLabel} · {Math.round(styleState.points)}
                </div>
              )}
            </div>
          )}

          {styleState.finisherReady && (
            <button
              type="button"
              tabIndex={-1}
              data-testid="hud-btn-chrono-finisher"
              onClick={(e) => {
                e.currentTarget.blur();
                onTriggerChronoFinisher?.();
              }}
              className="pointer-events-auto mt-0.5 px-2.5 py-1 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-display font-extrabold text-[10px] uppercase tracking-wider shadow-[0_0_16px_rgba(251,191,36,0.45)] cursor-pointer transition-colors whitespace-nowrap"
            >
              ⚡ {t(locale, 'finisherReady')}
            </button>
          )}

          {hud.singularity &&
            (hud.singularity.hitComboCount >= 2 ||
              hud.singularity.flashSwapAmpTimer > 0 ||
              hud.singularity.phantomRiposteTimer > 0) && (
              <div
                data-testid="hud-singularity-combo"
                data-hit-combo={hud.singularity.hitComboCount}
                data-flash-swap={hud.singularity.flashSwapAmpTimer > 0 ? 'true' : 'false'}
                data-phantom-riposte={hud.singularity.phantomRiposteTimer > 0 ? 'true' : 'false'}
                className="mt-1 flex flex-col items-end gap-0.5 text-right font-mono-tabular"
              >
                {hud.singularity.hitComboCount >= 2 && (
                  <div className="flex items-baseline gap-1 drop-shadow-[0_1px_5px_rgba(0,0,0,0.95)]">
                    <span className="font-display font-extrabold text-xl leading-none text-cyan-300">
                      ×{hud.singularity.hitComboCount}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-200">
                      {t(locale, 'hitComboLabel')}
                    </span>
                  </div>
                )}
                {hud.singularity.flashSwapAmpTimer > 0 && (
                  <div className="px-1.5 py-0.5 bg-[#071521]/88 border-r-2 border-cyan-300 text-[8px] font-bold uppercase tracking-wider text-cyan-200 whitespace-nowrap">
                    {t(locale, 'flashSwapActive')} · {hud.singularity.flashSwapAmpTimer.toFixed(1)}s
                  </div>
                )}
                {hud.singularity.phantomRiposteTimer > 0 && (
                  <div className="px-1.5 py-0.5 bg-[#1b1207]/88 border-r-2 border-amber-300 text-[8px] font-bold uppercase tracking-wider text-amber-200 whitespace-nowrap">
                    {t(locale, 'phantomRiposteActive')} · {hud.singularity.phantomRiposteTimer.toFixed(1)}s
                  </div>
                )}
              </div>
            )}

          {hud.momentum && (hud.momentum.weakpointTimer > 0 || hud.momentum.tier > 0) && (() => {
            const mom = hud.momentum;
            const mSpec = MOMENTUM_TIER_SPECS[mom.tier];
            return (
              <div
                data-testid="hud-chrono-momentum"
                data-momentum-tier={mom.tier}
                data-weakpoint-active={mom.weakpointTimer > 0 ? 'true' : 'false'}
                className="mt-0.5 flex flex-col items-end gap-0.5 text-right font-mono-tabular"
              >
                {mom.weakpointTimer > 0 && (
                  <div className="px-1.5 py-0.5 bg-[#1f1606]/90 border-r-2 border-amber-400 text-[8px] font-bold uppercase tracking-wider text-amber-200 whitespace-nowrap">
                    {t(locale, 'weakpointBreakBadge')} · {mom.weakpointTimer.toFixed(1)}s
                  </div>
                )}
                {mom.tier > 0 && (
                  <div
                    className="px-1.5 py-0.5 bg-[#0b101d]/88 border-r-2 text-[8px] font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ borderColor: mSpec.accentCss, color: mSpec.accentCss }}
                  >
                    {locale === 'vi' ? mSpec.labelVi : mSpec.labelEn} · {mom.streakTimer.toFixed(1)}s
                  </div>
                )}
              </div>
            );
          })()}

          {hud.nexus && hud.nexus.linkCount >= 2 && (() => {
            const nx = hud.nexus;
            const nSpec = CHRONO_NEXUS_TIER_SPECS[nx.tier];
            return (
              <div
                data-testid="hud-chrono-nexus"
                data-nexus-tier={nx.tier}
                data-nexus-links={nx.linkCount}
                className="mt-0.5 px-1.5 py-0.5 bg-[#0c0a1d]/92 border-r-2 text-[8px] font-mono-tabular font-extrabold uppercase tracking-wider whitespace-nowrap shadow-[0_0_12px_rgba(167,139,250,0.3)]"
                style={{ borderColor: nSpec.accentCss, color: nSpec.accentCss }}
              >
                {locale === 'vi' ? nSpec.labelVi : nSpec.labelEn}
              </div>
            );
          })()}

          {hud.weaponResonance && hud.weaponResonance.activeId && hud.weaponResonance.timer > 0 && (() => {
            const wr = hud.weaponResonance;
            const wSpec = WEAPON_RESONANCE_SPECS[wr.activeId!];
            return (
              <div
                data-testid="hud-weapon-resonance"
                data-resonance-id={wr.activeId}
                className="mt-0.5 px-1.5 py-0.5 bg-[#08121f]/92 border-r-2 text-[8px] font-mono-tabular font-bold uppercase tracking-wider whitespace-nowrap"
                style={{ borderColor: wSpec.accentCss, color: wSpec.accentCss }}
              >
                {locale === 'vi' ? wSpec.labelVi : wSpec.labelEn} · {wr.timer.toFixed(1)}s
              </div>
            );
          })()}
        </div>
      )}
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

      {/* v2.3.0: 3D-Projected Floating Damage Numbers */}
      {projectedDamagePopups.length > 0 && (
        <div
          data-testid="hud-damage-numbers"
          className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
          aria-hidden="true"
        >
          {projectedDamagePopups.map((popup) => {
            const opacity = Math.max(0, Math.min(1, 1 - Math.pow(popup.progress, 1.8)));
            const risePx = Math.round(popup.progress * 38);
            const scale =
              popup.kind === 'convergence'
                ? 1.2
                : popup.kind === 'crit' || popup.kind === 'parry'
                  ? 1.08
                  : 0.96;
            const styleClass =
              popup.kind === 'convergence'
                ? 'text-fuchsia-300 font-black text-base drop-shadow-[0_2px_8px_rgba(232,121,249,0.8)]'
                : popup.kind === 'crit'
                  ? 'text-amber-300 font-black text-sm drop-shadow-[0_2px_6px_rgba(251,191,36,0.7)]'
                  : popup.kind === 'parry'
                    ? 'text-emerald-300 font-black text-xs drop-shadow-[0_2px_6px_rgba(52,211,153,0.75)]'
                    : popup.kind === 'drone'
                      ? 'text-cyan-300 font-bold text-xs drop-shadow-[0_1px_5px_rgba(34,211,238,0.7)]'
                      : 'text-slate-100 font-bold text-xs drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]';
            const label =
              popup.kind === 'convergence'
                ? `⚡ ${popup.amount}`
                : popup.kind === 'parry'
                  ? `PARRY +${popup.amount}`
                  : popup.kind === 'drone'
                    ? `DRONE ${popup.amount}`
                    : `${popup.amount}`;
            return (
              <div
                key={popup.id}
                data-testid={`hud-dmg-popup-${popup.kind}`}
                className={`absolute font-mono-tabular whitespace-nowrap select-none ${styleClass}`}
                style={{
                  left: `${Math.round(popup.x)}px`,
                  top: `${Math.round(popup.y - risePx)}px`,
                  opacity,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      )}

      {/* Boss Kill-Cam Slow-Mo Cinematic Banner (positioned cleanly below Boss Bar, never obscuring Sera) */}
      {(hud.paradox?.killCamTimer ?? 0) > 0 && (
        <div
          data-testid="hud-killcam-banner"
          className="fixed inset-x-0 top-[116px] pointer-events-none z-20 flex justify-center"
        >
          <div className="px-4 py-1 bg-[#070b12]/84 border-y border-amber-400/75 text-amber-200 font-display font-bold text-[11px] tracking-[0.24em] uppercase shadow-[0_0_20px_rgba(251,191,36,0.28)]">
            CHRONO TERMINATION · 0.24× KILL-CAM
          </div>
        </div>
      )}

      {/* Dedicated Non-Blocking Chrono Finisher Banner */}
      {(hud.ascension?.style.finisherActiveTimer ?? 0) > 0 && (hud.paradox?.killCamTimer ?? 0) <= 0 && (
        <div
          data-testid="hud-finisher-banner"
          className="fixed inset-x-0 top-[116px] pointer-events-none z-20 flex justify-center"
        >
          <div className="px-4 py-1 bg-[#0b0a14]/84 border-y border-cyan-400/75 text-amber-200 font-display font-bold text-[11px] tracking-[0.22em] uppercase shadow-[0_0_20px_rgba(34,211,238,0.26)]">
            ⚡ {t(locale, 'finisherBanner')}
          </div>
        </div>
      )}

      {/* v4.1.0: Non-blocking Top-Right Chrono Achievement Toast (never occludes center viewport) */}
      {hud.paradox?.activeToast && (
        <div
          data-testid="hud-achievement-toast"
          className="fixed top-[156px] right-4 z-30 pointer-events-none bg-gradient-to-l from-[#060b14]/94 to-[#0a1222]/86 border-t border-amber-400/80 border-b border-white/10 px-3 py-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.78)] max-w-[260px] text-right"
        >
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-[9px] font-mono-tabular font-bold uppercase tracking-[0.18em] text-amber-300">
              ★ ACHIEVEMENT UNLOCKED
            </span>
          </div>
          <div className="text-[11px] font-display font-bold uppercase tracking-wider text-white mt-0.5 truncate">
            {hud.paradox.activeToast.title}
          </div>
          <div className="text-[9px] font-mono-tabular text-slate-300 leading-snug line-clamp-2">
            {hud.paradox.activeToast.description}
          </div>
        </div>
      )}

      {/* v2.3.0: Live Speedrun Split Timer Pill (anchored cleanly left of Tactical Radar) */}
      {hud.paradox?.speedrun.enabled && (
        <div
          data-testid="hud-speedrun-timer"
          className="fixed top-[54px] right-[112px] sm:right-[134px] z-20 pointer-events-none bg-[#070b12]/88 border border-cyan-500/50 px-2.5 py-1.5 font-mono-tabular shadow-[0_8px_22px_rgba(0,0,0,0.65)] min-w-[140px]"
        >
          <div className="flex items-center justify-between gap-2 text-[9px] uppercase tracking-wider text-cyan-400">
            <span>SPEEDRUN SPLIT</span>
            {hud.paradox.speedrun.bestFullRunSec !== null && (
              <span className="text-slate-400">
                PB {formatSpeedrunClock(hud.paradox.speedrun.bestFullRunSec)}
              </span>
            )}
          </div>
          <div className="flex items-baseline justify-between gap-2 mt-0.5">
            <span className="text-sm font-bold text-white tracking-tight">
              {formatSpeedrunClock(hud.paradox.speedrun.runElapsedSec)}
            </span>
            {hud.paradox.speedrun.lastDeltaSec !== null && (
              <span
                className={`text-[10px] font-bold ${
                  hud.paradox.speedrun.lastDeltaSec <= 0 ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {formatSpeedrunDelta(hud.paradox.speedrun.lastDeltaSec)}
              </span>
            )}
          </div>
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
        {/* Cluster 1 (Top-Left): Diegetic Horological Vitals & Sync Strip */}
        <div
          data-testid="player-hud"
          className="relative order-1 w-[154px] sm:w-[222px] [@media(max-height:540px)]:w-[184px] bg-gradient-to-r from-[#040811]/92 via-[#070e1b]/82 to-[#070e1b]/35 border-t border-amber-300/45 border-b border-cyan-400/20 px-2.5 py-2 shadow-[0_10px_28px_rgba(0,0,0,0.65)] shrink-0"
        >
          <div className="space-y-1.5 mb-1">
            {/* Integrity */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <HudIconVitalCrest lowHp={isLowHp} />
                  <span className="text-[9px] font-mono-tabular uppercase tracking-widest text-cyan-300 font-semibold">
                    {t(locale, 'hudIntegrity')}
                  </span>
                </div>
                <div className="flex items-baseline gap-0.5 font-mono-tabular">
                  <span
                    className={`text-base sm:text-lg font-extrabold leading-none tracking-tight ${
                      isLowHp ? 'text-red-400' : 'text-white'
                    }`}
                  >
                    {Math.round(hud.integrity)}
                  </span>
                  <span className="text-[9px] text-slate-400">/{Math.round(hud.maxIntegrity)}</span>
                </div>
              </div>
              <div className="relative h-2 w-full bg-[#03060b]/95 border border-white/10 -skew-x-12 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-amber-400/75 transition-all duration-75"
                  style={{ width: `${ghostIntegrityPct}%` }}
                />
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-75 ${
                    isLowHp ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-500 to-cyan-300'
                  }`}
                  style={{ width: `${integrityPct}%` }}
                />
              </div>
              {(hud.paradox?.loadout.aegisShieldHp ?? 0) > 0 && (
                <div data-testid="hud-aegis-shield" className="mt-1">
                  <div className="flex items-baseline justify-between text-[8px] font-mono-tabular uppercase tracking-wider">
                    <span className="text-sky-300 font-bold">AEGIS SHIELD</span>
                    <span className="text-sky-200 font-bold">
                      +{Math.ceil(hud.paradox?.loadout.aegisShieldHp ?? 0)}
                    </span>
                  </div>
                  <div className="relative h-1 w-full bg-[#04070c] overflow-hidden mt-0.5">
                    <div
                      className="absolute inset-y-0 left-0 bg-sky-400 transition-all duration-75"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((hud.paradox?.loadout.aegisShieldHp ?? 0) /
                              Math.max(1, hud.paradox?.loadout.maxAegisShieldHp ?? 40)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              {(hud.chronoAegis?.maxWard ?? 0) > 0 && (
                <div data-testid="hud-chrono-ward" className="mt-1">
                  <div className="flex items-baseline justify-between text-[8px] font-mono-tabular uppercase tracking-wider">
                    <span className="text-emerald-300 font-bold">
                      {t(locale, 'hudChronoWard')}
                    </span>
                    <span className="text-emerald-200 font-bold">
                      {(hud.chronoAegis?.ward ?? 0) <= 0 &&
                      (hud.chronoAegis?.rechargeDelayTimer ?? 0) > 0
                        ? `${t(locale, 'hudWardRecharging')} ${(hud.chronoAegis?.rechargeDelayTimer ?? 0).toFixed(1)}s`
                        : `${Math.ceil(hud.chronoAegis?.ward ?? 0)}/${hud.chronoAegis?.maxWard ?? 0}`}
                    </span>
                  </div>
                  <div className="relative h-1 w-full bg-[#04070c] overflow-hidden mt-0.5">
                    <div
                      className="absolute inset-y-0 left-0 bg-emerald-400 transition-all duration-75"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((hud.chronoAegis?.ward ?? 0) /
                              Math.max(1, hud.chronoAegis?.maxWard ?? 30)) *
                              100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Chrono Flux */}
            <div data-flux-dampened={(hud.fluxDampenedTimer ?? 0) > 0 ? 'true' : 'false'}>
              <div className="flex items-baseline justify-between mb-0.5">
                <span className="text-[9px] font-mono-tabular uppercase tracking-widest text-amber-300 font-semibold flex items-center gap-1">
                  <span>{t(locale, 'hudFlux')}</span>
                  {(hud.fluxDampenedTimer ?? 0) > 0 && (
                    <span
                      data-testid="hud-flux-dampened-badge"
                      className="text-[8px] font-mono-tabular text-fuchsia-300"
                    >
                      · DAMP {(hud.fluxDampenedTimer ?? 0).toFixed(1)}s
                    </span>
                  )}
                </span>
                <span className="text-xs font-mono-tabular font-bold text-amber-200 leading-none">
                  {Math.round(hud.flux)}
                  <span className="text-[9px] text-slate-400 font-normal">/{Math.round(hud.maxFlux)}</span>
                </span>
              </div>
              <div className="relative h-1.5 w-full bg-[#03060b]/95 border border-white/10 -skew-x-12 overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-75 ${
                    (hud.fluxDampenedTimer ?? 0) > 0
                      ? 'bg-fuchsia-400'
                      : 'bg-gradient-to-r from-amber-500 to-amber-300'
                  }`}
                  style={{ width: `${fluxPct}%` }}
                />
              </div>
            </div>

            {/* v2.3.0: Compact Tactical Loadout Strip (Med-Nanite [6], Overclock Core, Combat Drone) */}
            {hud.paradox && (
              <div
                data-testid="hud-tactical-loadout"
                className="pt-1 border-t border-white/8 flex flex-wrap items-center gap-1 text-[8px] font-mono-tabular"
              >
                <button
                  type="button"
                  data-testid="hud-btn-nanite"
                  disabled={
                    hud.paradox.mutators.ironmanNoHeal ||
                    hud.paradox.loadout.naniteInjectors <= 0 ||
                    hud.paradox.loadout.naniteCooldown > 0
                  }
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onUseNanite?.();
                  }}
                  title="Med-Nanite Injector [6] — Restores +42 Integrity & +18 Flux"
                  className={`pointer-events-auto px-1.5 py-0.5 border font-bold uppercase tracking-wider transition-colors ${
                    hud.paradox.mutators.ironmanNoHeal
                      ? 'bg-slate-900/80 border-slate-700 text-slate-500 cursor-default'
                      : hud.paradox.loadout.naniteInjectors > 0 &&
                          hud.paradox.loadout.naniteCooldown <= 0
                        ? 'bg-emerald-500/20 hover:bg-emerald-400/30 border-emerald-400/80 text-emerald-200 cursor-pointer'
                        : 'bg-slate-900/70 border-slate-700/80 text-slate-400 cursor-default'
                  }`}
                >
                  {hud.paradox.mutators.ironmanNoHeal
                    ? 'NANITE OFF'
                    : hud.paradox.loadout.naniteCooldown > 0
                      ? `NANITE ${hud.paradox.loadout.naniteCooldown.toFixed(0)}s`
                      : `NANITE [6] ×${hud.paradox.loadout.naniteInjectors}`}
                </button>
                <button
                  type="button"
                  data-testid="hud-btn-sentinel"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onCycleSentinelProtocol?.();
                  }}
                  title={
                    locale === 'vi'
                      ? SENTINEL_PROTOCOL_SPECS[hud.progression?.sentinelMode ?? 'off']
                          ?.summaryVi
                      : SENTINEL_PROTOCOL_SPECS[hud.progression?.sentinelMode ?? 'off']
                          ?.summaryEn
                  }
                  className={`pointer-events-auto px-1.5 py-0.5 border font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                    (hud.progression?.sentinelMode ?? 'off') === 'aegis'
                      ? 'bg-emerald-500/20 hover:bg-emerald-400/30 border-emerald-400/80 text-emerald-200'
                      : (hud.progression?.sentinelMode ?? 'off') === 'interceptor'
                        ? 'bg-cyan-500/20 hover:bg-cyan-400/30 border-cyan-400/80 text-cyan-200'
                        : (hud.progression?.sentinelMode ?? 'off') === 'harmonic'
                          ? 'bg-violet-500/20 hover:bg-violet-400/30 border-violet-400/80 text-violet-200'
                          : 'bg-slate-900/70 hover:bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {formatSentinelHudLabel(hud.progression?.sentinelMode ?? 'off', locale)}
                </button>
                {hud.progression?.equippedBossCore && (() => {
                  const activeCoreId = hud.progression.equippedBossCore;
                  const coreSpec = BOSS_ECHO_CORES[activeCoreId];
                  const isOmega = isBossCoreTranscended(
                    activeCoreId,
                    hud.progression.transcendedBossCores
                  );
                  const confSummary = computeSentinelCoreConfluence(
                    hud.progression.sentinelMode ?? 'off',
                    activeCoreId,
                    hud.progression.transcendedBossCores
                  );
                  const confState = hud.chronoConfluence;
                  const confCharge = Math.max(0, Math.min(100, Math.round(confState?.charge ?? 0)));
                  const confCooldown = Math.max(0, confState?.cooldownTimer ?? 0);
                  const confReady = Boolean(confState?.ready);
                  const attunement = computeWeaponCoreAttunement(
                    hud.weapon.equippedWeaponId,
                    activeCoreId,
                    hud.progression.transcendedBossCores
                  );
                  return (
                    <>
                      <button
                        type="button"
                        data-testid="hud-boss-core-badge"
                        data-core-id={activeCoreId}
                        data-omega={isOmega ? 'true' : 'false'}
                        data-attuned={attunement.attuned ? 'true' : 'false'}
                        onClick={(e) => {
                          e.currentTarget.blur();
                          onOpenArmory?.();
                        }}
                        title={
                          locale === 'vi'
                            ? `${coreSpec?.titleVi}${isOmega ? ' (OMEGA Ω)' : ''}: ${
                                isOmega ? coreSpec?.omegaSummaryVi : coreSpec?.summaryVi
                              }${attunement.attuned ? ` · ✦ ${attunement.titleVi}: ${attunement.perkVi}` : ''}`
                            : `${coreSpec?.titleEn}${isOmega ? ' (OMEGA Ω)' : ''}: ${
                                isOmega ? coreSpec?.omegaSummaryEn : coreSpec?.summaryEn
                              }${attunement.attuned ? ` · ✦ ${attunement.titleEn}: ${attunement.perkEn}` : ''}`
                        }
                        style={{
                          borderColor: isOmega ? '#fbbf24' : coreSpec?.accentCss ?? '#34d399',
                        }}
                        className="pointer-events-auto px-1.5 py-0.5 bg-[#0a1420] hover:bg-[#112235] border text-white font-bold uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer"
                      >
                        {formatBossCoreHudBadge(activeCoreId, locale, isOmega)}
                        {attunement.attuned ? ' ✦' : ''}
                      </button>
                      <button
                        type="button"
                        data-testid="hud-btn-confluence"
                        data-confluence-ready={confReady ? 'true' : 'false'}
                        data-doctrine={confSummary.doctrineId}
                        disabled={!confReady}
                        onClick={(e) => {
                          e.currentTarget.blur();
                          onTriggerConfluenceBurst?.();
                        }}
                        title={
                          locale === 'vi'
                            ? `${confSummary.titleVi} — ${confSummary.burstDescVi}`
                            : `${confSummary.titleEn} — ${confSummary.burstDescEn}`
                        }
                        className={`pointer-events-auto px-1.5 py-0.5 border font-mono-tabular font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                          confReady
                            ? 'bg-amber-500/25 hover:bg-amber-400/35 border-amber-300 text-amber-100 cursor-pointer'
                            : 'bg-[#09121e] border-slate-700 text-slate-300 cursor-default'
                        }`}
                      >
                        {confReady
                          ? `[9] ${locale === 'vi' ? 'HỢP LƯU' : 'BURST'} · ${t(locale, 'hudConfluenceReady')}`
                          : confCooldown > 0
                            ? `[9] ${confCooldown.toFixed(1)}s`
                            : `[9] ${confCharge}%`}
                      </button>
                    </>
                  );
                })()}
                {(hud.paradox.loadout.combatDroneTier > 0 ||
                  hud.paradox.loadout.overclockCoreActive) && (
                  <div className="w-full flex items-center gap-1.5 pt-0.5 text-[9px] font-mono-tabular tracking-[0.12em] uppercase">
                    {hud.paradox.loadout.combatDroneTier > 0 && (
                      <span
                        data-testid="hud-drone-badge"
                        className="text-cyan-300/95 font-semibold"
                      >
                        DRONE MK.{hud.paradox.loadout.combatDroneTier === 2 ? 'II' : 'I'}
                      </span>
                    )}
                    {hud.paradox.loadout.combatDroneTier > 0 &&
                      hud.paradox.loadout.overclockCoreActive && (
                        <span className="text-slate-600" aria-hidden="true">
                          ·
                        </span>
                      )}
                    {hud.paradox.loadout.overclockCoreActive && (
                      <span
                        data-testid="hud-overclock-badge"
                        className="text-amber-300 font-semibold"
                      >
                        +25% DMG
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Chrono Stasis Overdrive [`] Ultimate Gauge (Auto-collapses when empty at 0% to keep HUD clean) */}
            {(() => {
              const od = hud.overdrive;
              const odActive = Boolean(od?.active);
              const odCharge = Math.max(0, Math.min(100, Math.floor(od?.charge ?? 0)));
              const odReady = !odActive && odCharge >= 100;
              const odPct = odActive
                ? Math.max(0, Math.min(100, ((od?.remainingTimer ?? 0) / Math.max(0.1, od?.maxDuration ?? 4.5)) * 100))
                : odCharge;
              const isDormant = !odActive && odCharge === 0;
              return (
                <button
                  type="button"
                  data-testid="hud-chrono-overdrive"
                  data-overdrive-active={odActive ? 'true' : 'false'}
                  data-overdrive-ready={odReady ? 'true' : 'false'}
                  disabled={!odReady}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onTriggerOverdrive?.();
                  }}
                  title="Chrono Stasis Overdrive [`] — Dilate enemy time to 0.32x, +30% damage, 0 heat for 4.5s"
                  className={
                    isDormant
                      ? 'sr-only'
                      : `pointer-events-auto w-full text-left pt-1 border-t border-white/8 transition-colors ${
                          odReady
                            ? 'cursor-pointer hover:bg-amber-500/15'
                            : 'cursor-default'
                        }`
                  }
                >
                  <div className="flex items-baseline justify-between mb-0.5 gap-1">
                    <span
                      className={`text-[9px] font-mono-tabular uppercase tracking-wider font-bold whitespace-nowrap ${
                        odActive
                          ? 'text-cyan-200'
                          : odReady
                            ? 'text-amber-300'
                            : 'text-sky-300/85'
                      }`}
                    >
                      {odActive
                        ? t(locale, 'hudStasisActive')
                        : odReady
                          ? t(locale, 'hudOverdriveReady')
                          : t(locale, 'hudStasis')}
                    </span>
                    <span
                      className={`text-[10px] font-mono-tabular font-bold leading-none whitespace-nowrap ${
                        odActive
                          ? 'text-amber-300'
                          : odReady
                            ? 'text-amber-200'
                            : 'text-slate-300'
                      }`}
                    >
                      {odActive
                        ? `${(od?.remainingTimer ?? 0).toFixed(1)}s`
                        : odReady
                          ? 'READY'
                          : `${odCharge}%`}
                    </span>
                  </div>
                  <div className="relative h-1.5 w-full bg-[#04070c] overflow-hidden border border-white/10 -skew-x-12">
                    <div
                      className={`absolute inset-y-0 left-0 transition-all duration-75 ${
                        odActive
                          ? 'bg-gradient-to-r from-cyan-300 via-amber-300 to-cyan-200'
                          : odReady
                            ? 'bg-amber-400'
                            : 'bg-sky-400/85'
                      }`}
                      style={{ width: `${odPct}%` }}
                    />
                  </div>
                </button>
              );
            })()}
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

          {/* Chronicle Expansion: Compact Interactive Story Signal Intercept (Top-Left, Zero Center Occlusion) */}
          {hud.exploration.activeChapterStory &&
            hud.run.stage !== 'intro' &&
            hud.run.stage !== 'transition_to_boss' &&
            hud.run.stage !== 'chronicle_loom' &&
            !boss &&
            (() => {
              const localStory = localizeStoryArc(hud.exploration.activeChapterStory, locale);
              return (
                <div className="mt-1.5 pt-1 border-t border-white/10 pointer-events-auto relative">
                  <button
                    type="button"
                    tabIndex={-1}
                    data-testid="hud-story-signal-toggle"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      setStoryDrawerOpen((prev) => !prev);
                    }}
                    className={`w-full flex items-center justify-between gap-1.5 px-2 py-1 text-[9px] font-mono-tabular uppercase tracking-wider border transition-colors cursor-pointer ${
                      localStory.resolved
                        ? 'bg-[#071314]/85 border-emerald-500/45 text-emerald-300'
                        : 'bg-[#0e1524]/92 hover:bg-[#162238] border-amber-400/65 text-amber-200'
                    }`}
                  >
                    <span className="truncate font-semibold">
                      {localStory.resolved
                        ? `${locale === 'vi' ? 'TƯ TƯỞNG' : 'STANCE'} · ${localizeStanceLabel(localStory.chosenStance, locale)}`
                        : `✦ ${locale === 'vi' ? 'TÍN HIỆU' : 'SIGNAL'} · +1◆`}
                    </span>
                    <span className="shrink-0 text-[8px] font-bold text-cyan-300">
                      {storyDrawerOpen
                        ? locale === 'vi'
                          ? 'ẨN'
                          : 'HIDE'
                        : localStory.resolved
                          ? locale === 'vi'
                            ? 'NHẬT KÝ'
                            : 'LOG'
                          : locale === 'vi'
                            ? 'MỞ'
                            : 'OPEN'}
                    </span>
                  </button>

                  {storyDrawerOpen && (
                    <div
                      data-testid="hud-story-signal-panel"
                      className="mt-1 w-72 sm:w-80 bg-[#070c14]/96 border border-cyan-500/55 p-2 space-y-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.85)] relative z-30"
                    >
                      <div className="space-y-0.5 max-h-28 overflow-y-auto pr-0.5">
                        {localStory.lines.map((ln, idx) => (
                          <div key={idx} className="text-[9px] leading-snug text-slate-200">
                            <strong
                              className={`font-mono-tabular uppercase mr-1 ${
                                ln.accent === 'cyan'
                                  ? 'text-cyan-300'
                                  : ln.accent === 'rose'
                                    ? 'text-rose-300'
                                    : ln.accent === 'amber'
                                      ? 'text-amber-300'
                                      : ln.accent === 'purple'
                                        ? 'text-purple-300'
                                        : 'text-emerald-300'
                              }`}
                            >
                              {ln.speaker}:
                            </strong>
                            {ln.line}
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1">
                        {localStory.choices.map((ch) => {
                          const isPicked = localStory.chosenOptionId === ch.id;
                          const resolved = Boolean(localStory.resolved);
                          return (
                            <button
                              key={ch.id}
                              type="button"
                              tabIndex={-1}
                              data-testid={`hud-story-choice-${ch.id}`}
                              disabled={resolved}
                              onClick={(e) => {
                                e.currentTarget.blur();
                                onResolveStoryChoice?.(localStory.id, ch.id);
                              }}
                              className={`w-full text-left px-2 py-1 border text-[9px] font-mono-tabular transition-colors ${
                                isPicked
                                  ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200'
                                  : resolved
                                    ? 'bg-[#080d14] border-slate-800 text-slate-500 opacity-65 cursor-default'
                                    : 'bg-[#0c1626] hover:bg-[#142640] border-cyan-500/60 text-slate-100 cursor-pointer'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 font-bold">
                                <span className="uppercase text-amber-300">
                                  {localizeStanceLabel(ch.stance, locale)}
                                </span>
                                <span className="text-emerald-300">{ch.blessingLabel}</span>
                              </div>
                              <div className="text-[10px] text-slate-200 leading-tight">
                                {ch.label}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
        </div>

        {/* Cluster 2 (Top-Center): Dead-Centered Slim Single-Focus Objective OR Boss Telemetry */}
        <div className="order-3 md:order-2 flex flex-col items-center w-full md:fixed md:top-3 md:left-1/2 md:-translate-x-1/2 md:w-[404px] md:z-15 pointer-events-none">
          {hud.run.mode === 'recursion' && hud.recursion && (
            <div
              data-testid="hud-recursion-bar"
              data-loop-index={hud.recursion.loopIndex}
              data-warden-surge={hud.recursion.isWardenSurge ? 'true' : 'false'}
              className="w-full mb-1 bg-[#120b1e]/92 border border-fuchsia-400/70 px-2.5 py-1 flex flex-wrap items-center justify-between gap-1.5 text-[9px] sm:text-[10px] font-mono-tabular uppercase"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-fuchsia-300 tracking-wider whitespace-nowrap">
                  RECURSION · LOOP {hud.recursion.loopIndex}
                </span>
                {hud.recursion.isWardenSurge && (
                  <span className="px-1.5 py-0.5 bg-amber-400/20 border border-amber-400 text-amber-200 font-bold text-[8px] whitespace-nowrap">
                    WARDEN SURGE
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1 justify-end">
                {(Object.entries(hud.recursion.relicStacks ?? {}) as Array<[ChronoRelicId, number]>)
                  .filter(([, count]) => count > 0)
                  .map(([relicId, count]) => (
                    <span
                      key={relicId}
                      data-testid={`hud-relic-badge-${relicId}`}
                      className="px-1.5 py-0.5 bg-[#091220] border border-cyan-400/50 text-cyan-200 text-[8px] font-bold whitespace-nowrap"
                    >
                      {CHRONO_RELICS[relicId]?.shortLabel ?? relicId} ×{count}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {hud.temporalRift && (
            <div
              data-testid="hud-temporal-rift-alert"
              data-rift-id={hud.temporalRift.id}
              className="w-full mb-1 bg-[#190b24]/94 border border-fuchsia-400/85 px-2.5 py-1 flex items-center justify-between gap-2 text-[9px] sm:text-[10px] font-mono-tabular uppercase shadow-[0_6px_18px_rgba(217,70,239,0.28)]"
            >
              <span className="font-bold text-fuchsia-200 truncate">
                TEMPORAL RIFT UNSTABLE · {hud.temporalRift.remainingTimer.toFixed(1)}s
              </span>
              <span className="text-cyan-300 font-semibold whitespace-nowrap shrink-0">
                SEAL [I] (+28 FLX / +12 HP)
              </span>
            </div>
          )}

          <div
            className={
              boss ||
              (hud.expedition?.enabled &&
                (hud.expedition.phase === 'explore' ||
                  hud.expedition.phase === 'airlock_open' ||
                  hud.expedition.phase === 'safe_room' ||
                  hud.expedition.phase === 'combat'))
                ? 'sr-only'
                : 'bg-gradient-to-b from-[#040811]/92 to-[#060c18]/74 border-t border-cyan-400/55 border-b border-white/10 px-3 py-1.5 w-full shadow-[0_8px_22px_rgba(0,0,0,0.55)]'
            }
          >
            <div className="flex items-center justify-between gap-2 text-[10px] font-mono-tabular tracking-wider uppercase">
              <span className="font-bold text-cyan-300 truncate">
                {localizeHudObjectiveText(
                  !boss && !hud.loom.active
                    ? hud.encounter.encounterId !== 'prologue_calibration_bay'
                      ? hud.objectiveText
                      : calGuidance.headline
                    : hud.objectiveText,
                  locale
                )}
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
              className={
                hud.enemiesAlive > 0 && !boss && !hud.loom.active
                  ? 'sr-only'
                  : 'text-[10px] text-slate-300/95 leading-snug mt-0.5 line-clamp-1'
              }
            >
              {!boss && !hud.loom.active
                ? echo.statusMessage &&
                  (echo.statusMessage.includes('REJECTED') ||
                    echo.statusMessage.includes('MISALIGNED') ||
                    echo.statusMessage.includes('NO VALID'))
                  ? echo.statusMessage
                  : localizeHudObjectiveText(calGuidance.instruction, locale)
                : echo.state !== 'idle' && echo.statusMessage
                  ? echo.statusMessage
                  : localizeHudObjectiveText(hud.objectiveSubtext, locale)}
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
                {locale === 'vi'
                  ? `1. Bệ ${plate.active ? 'Đang Giữ' : puzzle.teachCompleted ? 'Xong' : '[Y]'}`
                  : `1. Pad ${plate.active ? 'Active' : puzzle.teachCompleted ? 'Done' : '[Y]'}`}
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
                  {locale === 'vi' ? '2. Thu ' : '2. Rcv '}
                  {puzzle.receiverCharged
                    ? `${puzzle.receiverChargeTimer.toFixed(1)}s`
                    : puzzle.testCompleted
                      ? locale === 'vi'
                        ? 'Xong'
                        : 'Done'
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
                  {locale === 'vi'
                    ? `3. Cổng ${puzzle.finalBarrierOpen ? 'Đã Mở' : 'Khóa'}`
                    : `3. Gate ${puzzle.finalBarrierOpen ? 'Open' : 'Locked'}`}
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
                  {locale === 'vi'
                    ? `VAN NGUY HIỂM: ${
                        hud.exploration.hazards[0].phase === 'active'
                          ? 'PHUN LỬA'
                          : hud.exploration.hazards[0].phase === 'warning'
                            ? 'CẢNH BÁO'
                            : 'AN TOÀN'
                      }`
                    : `HAZARD VENT: ${hud.exploration.hazards[0].phase.toUpperCase()}`}
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

          {/* Sovereign Boss Gauntlet 5-Trial Progress Strip */}
          {hud.gauntlet?.active && (
            <div
              data-testid="hud-gauntlet-bar"
              data-stage-index={hud.gauntlet.stageIndex}
              className="w-full max-w-[404px] mb-1.5 bg-[#0c0a06]/90 border border-amber-400/70 px-2.5 py-1 shadow-[0_6px_18px_rgba(0,0,0,0.65)]"
            >
              <div className="flex items-center justify-between gap-2 text-[9px] font-mono-tabular uppercase">
                <span className="font-bold tracking-wider text-amber-300 truncate">
                  {locale === 'vi' ? 'LIÊN ĐẤU' : 'GAUNTLET'} ·{' '}
                  {hud.gauntlet.currentStageLabel.replace(/^TRIAL\s+/i, '#')}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center gap-1">
                    {BOSS_GAUNTLET_STAGES.map((st) => {
                      const done = hud.gauntlet!.defeatedBossIds.includes(st.bossId);
                      const current = hud.gauntlet!.stageIndex === st.index && !done;
                      return (
                        <span
                          key={st.bossId}
                          className={`px-1.5 py-0.5 text-[9px] font-bold border ${
                            done
                              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                              : current
                                ? 'bg-amber-400/25 border-amber-300 text-amber-100'
                                : 'bg-slate-900/80 border-slate-700 text-slate-500'
                          }`}
                        >
                          {st.shortCode}
                        </span>
                      );
                    })}
                  </div>
                  <span className="text-amber-200 font-bold pl-1 border-l border-amber-500/35">
                    {formatGauntletClock(hud.gauntlet.totalElapsedTime)}
                  </span>
                </div>
              </div>
              {hud.gauntlet.refitBannerTimer > 0 && hud.gauntlet.refitBannerText && (
                <div className="mt-1 pt-1 border-t border-amber-500/30 text-[9px] font-mono-tabular font-semibold text-emerald-300 uppercase tracking-wider truncate">
                  {hud.gauntlet.refitBannerText}
                </div>
              )}
            </div>
          )}

          {/* Razor-Slim Horological Horizon Compass Strip (Safe-Room stations & Fabricator live cleanly in Bottom Dock) */}
          {hud.expedition?.enabled && (
            <div
              data-testid="hud-expedition-bar"
              data-phase={hud.expedition.phase}
              data-sector-code={hud.expedition.sectorCode}
              data-ng-cycle={hud.expedition.ngPlusCycle ?? 0}
              className={`pointer-events-auto w-full mb-1 px-3 py-1 bg-gradient-to-b from-[#040811]/92 via-[#060d1a]/80 to-[#060d1a]/45 border-t border-b shadow-[0_6px_18px_rgba(0,0,0,0.55)] ${
                hud.expedition.phase === 'safe_room'
                  ? 'border-t-amber-300/55 border-b-teal-400/25'
                  : hud.expedition.phase === 'airlock_open'
                    ? 'border-t-emerald-400/65 border-b-emerald-400/25'
                    : hud.expedition.phase === 'explore'
                      ? 'border-t-cyan-400/60 border-b-cyan-400/20'
                      : 'border-t-amber-400/65 border-b-amber-400/25'
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[9px] sm:text-[10px] font-mono-tabular uppercase">
                <div className="flex items-center gap-1.5 min-w-0">
                  {(hud.expedition.ngPlusCycle ?? 0) > 0 && (
                    <>
                      <span
                        data-testid="hud-ng-plus-badge"
                        className="shrink-0 text-amber-300 font-bold tracking-wider"
                      >
                        NG+{hud.expedition.ngPlusCycle}
                      </span>
                      <span aria-hidden="true" className="text-slate-500">·</span>
                    </>
                  )}
                  <span
                    className={`font-bold tracking-wider truncate ${
                      hud.expedition.phase === 'safe_room'
                        ? 'text-teal-200'
                        : hud.expedition.phase === 'airlock_open'
                          ? 'text-emerald-300'
                          : hud.expedition.phase === 'explore'
                            ? 'text-cyan-200'
                            : 'text-amber-200'
                    }`}
                  >
                    {hud.expedition.phase === 'safe_room'
                      ? locale === 'vi'
                        ? 'THÁNH ĐỊA TRẠM DỪNG · TIẾP TẾ'
                        : 'SANCTUARY HUB · REFIT'
                      : `SEC ${hud.expedition.sectorCode} · ${hud.expedition.sectorTitle}`}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-[8px]">
                  {EXPEDITION_SECTORS.map((sec, idx) => {
                    const cleared =
                      hud.run.completedChapters.includes(sec.chapter) ||
                      sec.index < hud.expedition!.sectorIndex;
                    const active = sec.index === hud.expedition!.sectorIndex;
                    return (
                      <React.Fragment key={sec.chapter}>
                        {idx > 0 && (
                          <span aria-hidden="true" className="text-slate-600">·</span>
                        )}
                        <span
                          title={`Sector ${sec.code}: ${sec.title}`}
                          className={`font-bold ${
                            cleared
                              ? 'text-emerald-300'
                              : active
                                ? 'text-cyan-200 underline decoration-amber-300 underline-offset-2'
                                : 'text-slate-500'
                          }`}
                        >
                          {sec.code}
                        </span>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {hud.expedition.phase !== 'safe_room' &&
                (hud.expedition.phase !== 'combat' ||
                  Boolean(
                    hud.expedition.secretVault &&
                      hud.expedition.secretVault.gateOpen &&
                      !hud.expedition.secretVault.looted
                  )) && (
                <div className="mt-1 pt-1 border-t border-white/8 flex items-center justify-between gap-2 text-[9px] font-mono-tabular">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-slate-300 whitespace-nowrap">
                      CACHE{' '}
                      <strong className="text-amber-300">
                        {hud.expedition.cachesFound}/{hud.expedition.cachesTotal}
                      </strong>
                      {' · '}LORE{' '}
                      <strong className="text-cyan-300">
                        {hud.expedition.terminalsScanned}/{hud.expedition.terminalsTotal}
                      </strong>
                      {hud.expedition.secretVault && (
                        <>
                          {' · '}
                          <span
                            data-testid="hud-secret-vault-badge"
                            className={
                              hud.expedition.secretVault.looted
                                ? 'text-emerald-300 font-bold'
                                : hud.expedition.secretVault.gateOpen
                                  ? 'text-amber-300 font-bold'
                                  : 'text-rose-300'
                            }
                          >
                            {hud.expedition.secretVault.looted
                              ? 'VAULT ✓'
                              : hud.expedition.secretVault.gateOpen
                                ? `VAULT ${hud.expedition.secretVault.overrideTimer.toFixed(0)}s`
                                : 'VAULT'}
                          </span>
                        </>
                      )}
                    </span>
                    {hud.expedition.guideTarget && (
                      <span className="text-slate-200 truncate pl-1.5 border-l border-white/10">
                        {hud.expedition.guideTarget.label}{' '}
                        <strong className="text-cyan-300">
                          {hud.expedition.guideTarget.distance.toFixed(0)}m
                        </strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {hud.expedition.secretVault &&
                      hud.expedition.secretVault.gateOpen &&
                      !hud.expedition.secretVault.looted &&
                      onClaimSecretVault && (
                        <button
                          type="button"
                          data-testid="hud-btn-claim-vault"
                          onClick={(e) => {
                            e.currentTarget.blur();
                            onClaimSecretVault();
                          }}
                          className="shrink-0 px-2 py-0.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold tracking-wider uppercase cursor-pointer whitespace-nowrap"
                        >
                          CLAIM VAULT [I]
                        </button>
                      )}

                    {hud.expedition.phase === 'explore' && onTriggerExpeditionBreach && (
                      <button
                        type="button"
                        data-testid="hud-btn-breach-seal"
                        onClick={(e) => {
                          e.currentTarget.blur();
                          onTriggerExpeditionBreach();
                        }}
                        className="shrink-0 px-2 py-0.5 bg-amber-500/25 hover:bg-amber-400/35 border border-amber-400 text-amber-100 font-bold tracking-wider uppercase cursor-pointer whitespace-nowrap"
                      >
                        BREACH SEAL [I]
                      </button>
                    )}

                    {hud.expedition.phase === 'airlock_open' && onEnterExpeditionAirlock && (
                      <button
                        type="button"
                        data-testid="hud-btn-enter-airlock"
                        onClick={(e) => {
                          e.currentTarget.blur();
                          onEnterExpeditionAirlock();
                        }}
                        className="shrink-0 px-2 py-0.5 bg-emerald-500/30 hover:bg-emerald-400/40 border border-emerald-300 text-emerald-100 font-bold tracking-wider uppercase cursor-pointer whitespace-nowrap"
                      >
                        ENTER TRANSIT HUB →
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Consolidated Boss Encounter HUD (Sleek horological top-hairline boss bar) */}
          {boss &&
          !(
            hud.expedition?.enabled &&
            (hud.expedition.phase === 'explore' || hud.expedition.phase === 'safe_room')
          ) ? (
            <div
              data-testid="boss-hud"
              data-boss-phase={boss.phase}
              data-boss-state={boss.aiState}
              data-boss-attack={boss.activeAttack ?? 'none'}
              data-boss-core-exposed={boss.coreExposed ? 'true' : 'false'}
              className={`w-full max-w-[404px] bg-gradient-to-b from-[#060b14]/92 to-[#050911]/72 border-t border-b border-b-white/10 px-3 py-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.7)] ${
                boss.coreExposed
                  ? 'border-t-white'
                  : boss.isResonanceMarked
                    ? 'border-t-cyan-300'
                    : boss.aiState === 'phase_transition' || boss.phase === 2
                      ? 'border-t-red-500'
                      : boss.aiState === 'telegraph'
                        ? 'border-t-amber-400'
                        : 'border-t-amber-400/60'
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
                    {boss.coreExposed
                      ? t(locale, 'bossCoreExposed')
                      : t(locale, 'bossCoreShielded')}
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
              <div className="relative h-2.5 w-full bg-[#04070c]/95 overflow-hidden mb-1 -skew-x-12">
                <div
                  className="absolute inset-y-0 left-0 bg-amber-300/60 transition-all duration-75"
                  style={{ width: `${bossGhostPct}%` }}
                />
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-75 ${
                    boss.coreExposed
                      ? 'bg-white'
                      : boss.phase === 2
                        ? 'bg-gradient-to-r from-red-600 to-rose-400'
                        : 'bg-gradient-to-r from-amber-500 to-amber-300'
                  }`}
                  style={{ width: `${bossHpPct}%` }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-y-0 left-1/2 w-[2px] bg-slate-950/90 z-10"
                />
              </div>

              {/* Boss Stagger Posture Bar */}
              <div className="relative h-1 w-full bg-[#04070c]/95 overflow-hidden mb-1 -skew-x-12">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-sky-300 transition-all duration-75"
                  style={{ width: `${bossStaggerPct}%` }}
                />
              </div>

              {/* Clean Souls-Like Telemetry Row: Phase Label & Stagger Meter */}
              <div className="flex items-center justify-between gap-2 text-[9px] font-mono-tabular uppercase">
                <span
                  data-testid="boss-phase"
                  className={`font-bold whitespace-nowrap shrink-0 ${
                    boss.phase === 2 ? 'text-red-400' : 'text-amber-300'
                  }`}
                >
                  {boss.phase === 2 ? t(locale, 'bossPhase2') : t(locale, 'bossPhase1')}
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
                          : 'text-slate-400'
                  }`}
                >
                  {boss.statusLabel.replace(/^PHASE\s+(I|II)\s*·\s*/i, '')}
                </span>
                <span
                  data-testid="boss-stagger"
                  className="text-cyan-300 font-semibold whitespace-nowrap shrink-0"
                >
                  {boss.stagger}/{boss.maxStagger}
                </span>
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
            /* Standard Focused Enemy Status Bar (Sleek floating horological target bar) */
            focused &&
            !(hud.expedition?.enabled && hud.expedition.phase === 'explore') && (
              <div
                className={`mt-0.5 w-full max-w-[356px] bg-gradient-to-b from-[#060b14]/88 to-[#050911]/58 border-t border-b border-b-white/8 px-3 py-1 shadow-[0_8px_20px_rgba(0,0,0,0.55)] ${
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
                    ? 'border-t-white'
                    : focused.isDecoy
                      ? 'border-t-purple-400'
                      : focused.isResonanceMarked
                        ? 'border-t-cyan-300'
                        : isEnemyTelegraphing
                          ? 'border-t-amber-400'
                          : 'border-t-red-500/65'
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
                    {focused.modifier && (
                      <span
                        data-testid="enemy-modifier-badge"
                        className={`font-bold uppercase px-1 py-0.2 border ${
                          focused.modifier === 'overclocked'
                            ? 'text-amber-300 border-amber-400/60 bg-amber-950/60'
                            : focused.modifier === 'phase_shielded'
                              ? 'text-cyan-300 border-cyan-400/60 bg-cyan-950/60'
                              : 'text-red-300 border-red-400/60 bg-red-950/60'
                        }`}
                      >
                        {focused.modifier === 'phase_shielded'
                          ? locale === 'vi'
                            ? 'KHIÊN PHA'
                            : 'PHASE-SHIELD'
                          : focused.modifier === 'overclocked' && locale === 'vi'
                            ? 'ÉP XUNG'
                            : focused.modifier === 'volatile' && locale === 'vi'
                              ? 'BÙNG NỔ'
                              : focused.modifier.toUpperCase()}
                      </span>
                    )}
                    {focused.isTetherProtected && (
                      <span
                        data-testid="enemy-tether-badge"
                        className="text-emerald-300 font-bold uppercase px-1 py-0.2 border border-emerald-400/60 bg-emerald-950/60"
                      >
                        {locale === 'vi' ? 'NỐI DÂY -25%' : 'TETHERED -25%'}
                      </span>
                    )}
                    {focused.isDecoy && (
                      <span data-testid="enemy-decoy-badge" className="text-purple-300 font-bold uppercase">
                        {locale === 'vi' ? 'MỒI NHỬ' : 'DECOY'}
                      </span>
                    )}
                    {(focused.pinnedTimer ?? 0) > 0 && (
                      <span data-testid="enemy-pinned-badge" className="text-cyan-300 font-bold uppercase">
                        {locale === 'vi' ? 'ĐÃ GHIM' : 'PINNED'}
                      </span>
                    )}
                    {focused.isResonanceMarked && (
                      <span data-testid="enemy-resonance-badge" className="text-cyan-300 font-bold uppercase">
                        {locale === 'vi' ? 'CỘNG HƯỞNG' : 'RESONANCE'} {focused.resonanceRemaining.toFixed(1)}s
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
                      {localizeEnemyTacticalText(focused.statusLabel, locale)
                        .split('·')[0]
                        .trim()}
                    </span>
                    <span className="text-slate-300 font-bold">
                      {focused.hp}/{focused.maxHp}
                    </span>
                  </div>
                </div>

                <div className="relative h-1.5 w-full bg-[#04070c]/90 overflow-hidden mb-0.5 -skew-x-12">
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
                          : 'bg-gradient-to-r from-red-600 to-rose-400'
                    }`}
                    style={{ width: `${enemyHpPct}%` }}
                  />
                </div>

                <div className="relative h-0.5 w-full bg-[#04070c]/90 overflow-hidden -skew-x-12">
                  <div
                    className="absolute inset-y-0 left-0 bg-cyan-400"
                    style={{ width: `${enemyStaggerPct}%` }}
                  />
                </div>
              </div>
            )
          )}

        </div>

        {/* Cluster 3 (Top-Right): Decluttered 3-Button Utility Strip + Live Tactical Radar */}
        <div className="order-2 md:order-3 flex flex-col items-end gap-1.5 pointer-events-none shrink-0">
          <div className="flex items-center gap-1 pointer-events-auto">
          {onToggleLockOn && hud.lockOn?.active && (
            <div className="flex items-center">
              <button
                type="button"
                tabIndex={-1}
                data-testid="lock-on-hud-badge"
                data-locked="true"
                aria-label="Toggle Target Lock-On [O / MMB]"
                title="Release Lock-On [O / Middle Mouse]"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onToggleLockOn();
                }}
                className={`h-8 px-2 flex items-center gap-1 justify-center border font-mono-tabular text-[9px] font-semibold uppercase transition-colors cursor-pointer whitespace-nowrap ${
                  hud.lockOn.isStaggered
                    ? 'bg-amber-500/20 border-amber-400/80 text-amber-200'
                    : 'bg-cyan-500/18 border-cyan-400/80 text-cyan-200'
                }`}
              >
                <span className="max-w-[84px] sm:max-w-[116px] truncate">
                  LOCK · {(hud.lockOn.targetName ?? 'TARGET').split('·')[0].trim()}
                </span>
              </button>
              {onCycleLockOn && (
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
                  className="h-8 px-1.5 flex items-center justify-center bg-[#070b12]/86 hover:bg-[#131e30] border border-l-0 border-cyan-400/70 text-cyan-200 transition-colors cursor-pointer"
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
            data-testid="hud-armory-btn"
            aria-label="Open Chrono Rig Armory [U]"
            title="Open Weapons, Upgrades & Chrono Rig Armory [U]"
            onClick={(e) => {
              e.currentTarget.blur();
              if (onOpenArmory) {
                onOpenArmory();
              } else {
                onTogglePause();
              }
            }}
            className="relative w-8 h-8 flex items-center justify-center bg-[#050912]/90 hover:bg-[#101b2d] border border-amber-400/35 hover:border-amber-300 text-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <HudIconArmory />
            <span className="absolute bottom-0.5 right-0.5 text-[7px] leading-none font-mono-tabular text-amber-300/90">
              U
            </span>
          </button>
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
            className="relative w-8 h-8 flex items-center justify-center bg-[#050912]/90 hover:bg-[#101b2d] border border-cyan-400/35 hover:border-cyan-300 text-cyan-200 transition-colors cursor-pointer shrink-0"
          >
            <HudIconMap />
            <span className="absolute bottom-0.5 right-0.5 text-[7px] leading-none font-mono-tabular text-cyan-300/90">
              N
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
                className="h-8 px-2 flex items-center justify-center font-mono-tabular text-[9px] font-bold uppercase bg-[#0d1c2e] hover:bg-[#17314f] border border-cyan-400/80 text-cyan-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                RESTORE
              </button>
            )}
          {onToggleFocusMode && (
            <button
              type="button"
              tabIndex={-1}
              data-testid="hud-btn-focus-mode"
              aria-pressed={focusMode}
              aria-label="Toggle Combat Focus Mode [F8]"
              title="Toggle Combat Focus Mode [F8]"
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleFocusMode();
              }}
              className={`relative w-8 h-8 flex items-center justify-center border transition-colors cursor-pointer shrink-0 ${
                focusMode
                  ? 'bg-amber-400/20 border-amber-300 text-amber-200'
                  : 'bg-[#050912]/90 hover:bg-[#101b2d] border-white/15 hover:border-amber-400/70 text-slate-200'
              }`}
            >
              <HudIconFocus active={focusMode} />
              <span className="absolute bottom-0.5 right-0.5 text-[6px] leading-none font-mono-tabular text-slate-400">
                F8
              </span>
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            data-testid="hud-btn-pause"
            aria-label="Pause Game [P]"
            title="Pause / Settings / Audio [P / Esc]"
            onClick={(e) => {
              e.currentTarget.blur();
              onTogglePause();
            }}
            className="relative w-8 h-8 flex items-center justify-center bg-[#050912]/90 hover:bg-[#101b2d] border border-white/15 hover:border-slate-300 text-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <HudIconPause />
            <span className="absolute bottom-0.5 right-0.5 text-[7px] leading-none font-mono-tabular text-slate-400">
              P
            </span>
          </button>
          </div>

          {/* Live Compact Circular Astrolabe Radar (Click or [N] for Full Schematic; collapsed in Focus Mode) */}
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
              className={
                focusMode
                  ? 'sr-only'
                  : 'relative group pointer-events-auto w-[56px] sm:w-[94px] [@media(max-height:540px)]:hidden rounded-full bg-[#040810]/88 hover:bg-[#0c1626] border border-amber-300/35 hover:border-cyan-400/80 p-1 shadow-[0_8px_22px_rgba(0,0,0,0.65)] transition-colors cursor-pointer'
              }
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

                {/* Arena Fragment Caches & Sector Tactical Beacons */}
                {(hud.radar.fragmentCaches ?? []).map((fc) => (
                  <polygon
                    key={fc.id}
                    data-testid={`radar-cache-${fc.id}`}
                    points={`${fc.x},${fc.z - 1.35} ${fc.x + 1.35},${fc.z} ${fc.x},${fc.z + 1.35} ${fc.x - 1.35},${fc.z}`}
                    fill={fc.claimed ? '#10b981' : '#fbbf24'}
                    stroke="#020617"
                    strokeWidth="0.35"
                  />
                ))}
                {(hud.radar.sectorBeacons ?? []).map((sb) => (
                  <rect
                    key={sb.id}
                    data-testid={`radar-beacon-${sb.id}`}
                    x={sb.x - 1.15}
                    y={sb.z - 1.15}
                    width="2.3"
                    height="2.3"
                    fill={sb.ready ? '#22d3ee' : '#475569'}
                    stroke="#ffffff"
                    strokeWidth="0.3"
                  />
                ))}

                {/* Temporal Anomaly Rift Marker */}
                {hud.radar.temporalRift && (
                  <g data-testid="radar-temporal-rift">
                    <circle
                      cx={hud.radar.temporalRift.x}
                      cy={hud.radar.temporalRift.z}
                      r={Math.max(1.8, hud.radar.temporalRift.radius * 0.9)}
                      fill="rgba(232, 121, 249, 0.24)"
                      stroke="#e879f9"
                      strokeWidth="0.5"
                      strokeDasharray="1.2 0.8"
                    />
                    <polygon
                      points={`${hud.radar.temporalRift.x},${hud.radar.temporalRift.z - 1.45} ${hud.radar.temporalRift.x + 1.45},${hud.radar.temporalRift.z} ${hud.radar.temporalRift.x},${hud.radar.temporalRift.z + 1.45} ${hud.radar.temporalRift.x - 1.45},${hud.radar.temporalRift.z}`}
                      fill="#22d3ee"
                      stroke="#e879f9"
                      strokeWidth="0.4"
                    />
                  </g>
                )}

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

                {/* Lysa 3D Holo-Memory Astrolabe Projector Blip */}
                {hud.radar.holoProjector && (
                  <g data-testid="radar-holo-projector">
                    <circle
                      cx={hud.radar.holoProjector.x}
                      cy={hud.radar.holoProjector.z}
                      r="1.95"
                      fill="none"
                      stroke={hud.radar.holoProjector.discovered ? '#34d399' : '#38bdf8'}
                      strokeWidth="0.4"
                      strokeDasharray="1.1 0.7"
                    />
                    <polygon
                      points={`${hud.radar.holoProjector.x},${hud.radar.holoProjector.z - 1.25} ${hud.radar.holoProjector.x + 1.25},${hud.radar.holoProjector.z} ${hud.radar.holoProjector.x},${hud.radar.holoProjector.z + 1.25} ${hud.radar.holoProjector.x - 1.25},${hud.radar.holoProjector.z}`}
                      fill={hud.radar.holoProjector.discovered ? '#10b981' : '#38bdf8'}
                      stroke="#fde68a"
                      strokeWidth="0.32"
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
              {locale === 'vi'
                ? 'MỞ ĐẦU · LOG-00 · LYSA VENN'
                : 'PROLOGUE · LOG-00 · LYSA VENN'}
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
              {locale === 'vi' ? 'BẮT ĐẦU [SPACE]' : 'BEGIN [SPACE]'}
            </button>
          </div>
          {locale === 'vi' ? (
            <p className="text-xs sm:text-sm text-slate-200 leading-snug mb-2">
              “Sera — nếu Khoang 04 đã nhận diện sinh trắc của em, bộ Chrono Rig giờ thuộc về em.
              Di chuyển bằng{' '}
              <span className="text-cyan-300 font-mono-tabular font-semibold">[WASD]</span> hoặc
              nhấn <span className="text-cyan-300 font-mono-tabular font-semibold">[SPACE]</span>{' '}
              để đồng bộ khoang và phá khóa phong tỏa của Thống Lĩnh{' '}
              <span className="text-amber-300 font-semibold">HELIX-04</span>.”
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-slate-200 leading-snug mb-2">
              “Sera—if Bay 04 recognized your biometrics, the Chrono Rig is yours. Move with{' '}
              <span className="text-cyan-300 font-mono-tabular font-semibold">[WASD]</span> or press{' '}
              <span className="text-cyan-300 font-mono-tabular font-semibold">[SPACE]</span> to
              synchronize the bay and breach Marshal{' '}
              <span className="text-amber-300 font-semibold">HELIX-04</span>’s containment lock.”
            </p>
          )}
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
                      {chapterCfg.sectorName} · {chapterCfg.wardenRole}
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
                    {locale === 'vi' ? 'THAM CHIẾN' : 'ENGAGE'} {boss?.name ?? 'MARSHAL'} [SPACE]
                  </button>
                </div>
                <div className="text-sm sm:text-base font-display font-bold uppercase tracking-wider text-white mb-0.5">
                  {chapterCfg.title} — {chapterCfg.subtitle}
                </div>
                {!focusMode && (
                  <p className="text-[11px] sm:text-xs text-slate-200 leading-snug mb-2">
                    {chapterCfg.arrivalBriefing}
                  </p>
                )}
                <div className="relative h-1 w-full bg-[#05080c] overflow-hidden mt-1">
                  <div
                    className="h-full w-full bg-amber-400 origin-left transition-transform duration-75"
                    style={{ transform: `scaleX(${Math.max(0, Math.min(1, introPct / 100))})` }}
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
                    {locale === 'vi' ? 'THAM CHIẾN NGAY [SPACE]' : 'ENGAGE NOW [SPACE]'}
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

      {/* v4.0.0: Modular Chapter Act Curtain & 3D Dr. Lysa Venn Holo-Memory Card */}
      <HudUpperNarrativeOverlays
        hud={hud}
        locale={locale}
        actCurtainVisible={actCurtainVisible}
        focusMode={focusMode}
        photoMode={photoMode}
        onDismissHoloMemory={onDismissHoloMemory}
      />

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
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Decide the Fate of the Chronicle Loom"
          className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[#05080e]/78 pointer-events-auto"
        >
          <div
            data-testid="chronicle-loom-panel"
            className="w-[95vw] max-w-5xl bg-[#090e17]/98 border-2 border-cyan-400 p-3.5 sm:p-5 shadow-[0_24px_64px_rgba(0,0,0,0.95)] max-h-[92vh] overflow-y-auto"
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
            <h2 className="text-lg sm:text-xl font-display font-bold uppercase tracking-wider text-slate-100 mb-1">
              Decide the Fate of the Chronicle Loom
            </h2>
            <p className="text-xs text-slate-300 leading-snug mb-2">
              WARDEN’s four sector marshals have fallen. Ahead stands the Chronicle Loom, holding
              Lysa Venn’s preserved neural trace alongside the station’s recursive behavioral
              archive.
            </p>

            {/* Causal Sector Evidence Strip (Chapters I–IV Recovered Override Seals) */}
            <div
              data-testid="loom-recovered-evidence-strip"
              className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2 bg-[#060b12] border border-slate-800 p-1.5"
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
                className="bg-[#07101c] border border-cyan-500/45 px-2.5 py-1.5 mb-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] sm:text-[10px] font-mono-tabular uppercase tracking-wider text-cyan-300 font-bold mb-0.5">
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
                <p className="text-[10px] text-slate-300 leading-snug">
                  {hud.exploration.convergenceSummary.synthesisSummary}
                </p>
              </div>
            )}

            <div
              data-testid="loom-lysa-transmission"
              className="bg-[#081220] border border-cyan-400/75 px-3 py-1.5 mb-2"
            >
              <div className="text-[10px] font-mono-tabular font-bold uppercase tracking-wider text-cyan-300 mb-0.5">
                {GAME_CONFIG.campaignChapters.chapter_5_loom.archiveLog.id} ·{' '}
                {GAME_CONFIG.campaignChapters.chapter_5_loom.archiveLog.speaker}
              </div>
              <p className="text-[11px] text-slate-200 italic leading-snug">
                {GAME_CONFIG.chronicleLoom.lysaFinalTransmission}
              </p>
            </div>

            {/* Phase 21: Optional / Climactic Confrontation with WARDEN PRIME in Chronicle Loom Core */}
            {onEngageWardenPrime && (
              <div
                data-testid="loom-warden-prime-bar"
                className="flex flex-wrap items-center justify-between gap-2 bg-[#120b18] border border-amber-500/60 px-3 py-1.5 mb-2.5"
              >
                <div className="text-[10px] font-mono-tabular text-amber-200">
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
                  className="px-3 py-1 text-[10px] font-mono-tabular font-bold uppercase bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  CONFRONT WARDEN PRIME [BOSS]
                </button>
              </div>
            )}

            {/* Chronicle Expansion: Accumulated Story Stance Resonance */}
            {hud.exploration.stanceSummary &&
              hud.exploration.stanceSummary.defiance +
                hud.exploration.stanceSummary.empathy +
                hud.exploration.stanceSummary.pragmatism >
                0 && (
                <div
                  data-testid="loom-stance-resonance"
                  className="bg-[#08101c] border border-amber-400/50 px-3 py-1.5 mb-2.5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-tabular"
                >
                  <div className="uppercase tracking-wider text-amber-300 font-bold">
                    CHRONICLE STANCE RESONANCE · DOMINANT:{' '}
                    <span className="text-white">
                      {hud.exploration.stanceSummary.dominantStance.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-slate-300">
                    DEFIANCE {hud.exploration.stanceSummary.defiance} · EMPATHY{' '}
                    {hud.exploration.stanceSummary.empathy} · PRAGMATISM{' '}
                    {hud.exploration.stanceSummary.pragmatism}
                  </div>
                </div>
              )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {LOOM_ENDING_CARDS.map((card) => {
                const cfg = GAME_CONFIG.chronicleLoom.endings[card.id];
                const alreadyCompleted = hud.run.completedEndings.includes(card.id);
                const dominant = hud.exploration.stanceSummary?.dominantStance ?? 'balanced';
                const isStanceAligned =
                  (dominant === 'defiance' && card.id === 'silence') ||
                  (dominant === 'empathy' && card.id === 'continuity') ||
                  (dominant === 'pragmatism' && card.id === 'witness');
                return (
                  <button
                    key={card.id}
                    type="button"
                    data-testid={`loom-ending-${card.id}`}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onSelectLoomEnding?.(card.id);
                    }}
                    className={`flex flex-col justify-between text-left bg-[#0c1422] hover:bg-[#142238] border p-3 transition-colors cursor-pointer ${card.accentBorder}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`text-[10px] font-mono-tabular font-bold uppercase tracking-widest ${card.accentText}`}
                        >
                          {card.consequenceTag}
                        </span>
                        <div className="flex items-center gap-1">
                          {isStanceAligned && (
                            <span className="text-[8px] font-mono-tabular font-bold uppercase px-1 py-0.5 bg-amber-500/20 border border-amber-400/70 text-amber-200">
                              STANCE ALIGNED
                            </span>
                          )}
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
                      <div className="text-[10px] font-mono-tabular uppercase text-slate-400 mb-1">
                        {cfg.subtitle}
                      </div>
                      <p className="text-[11px] text-slate-200 leading-snug mb-1.5">
                        {cfg.rationale}
                      </p>
                      <div className="space-y-1 text-[9px] font-mono-tabular leading-snug mb-2 pt-1.5 border-t border-slate-800/80">
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

      {/* Recursion Protocol: 3-Card Chrono Relic Draft Modal */}
      {hud.appState === 'playing' &&
        hud.recursion?.active &&
        hud.recursion.awaitingRelicDraft &&
        hud.recursion.draftOptions.length > 0 && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Select Recursion Protocol Module"
            className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[#05080e]/86 pointer-events-auto"
          >
            <div
              data-testid="recursion-relic-draft-modal"
              data-loop-index={hud.recursion.loopIndex}
              className="w-[94vw] max-w-3xl bg-[#0b0e18]/98 border-2 border-fuchsia-400 p-4 sm:p-6 shadow-[0_24px_64px_rgba(0,0,0,0.95)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="text-[10px] sm:text-xs font-mono-tabular font-bold uppercase tracking-widest text-fuchsia-300">
                  RECURSION LOOP {hud.recursion.loopIndex} CLEARED · CHRONO RELIC SYNTHESIS
                </span>
                <span className="text-[10px] font-mono-tabular text-slate-400">
                  KEYS [1] · [2] · [3] OR CLICK
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-display font-bold uppercase tracking-wider text-white mb-1">
                Select Recursion Protocol Module
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-snug mb-4">
                Imprint a Chrono Relic onto Sera Venn’s rig before warping to Loop{' '}
                {hud.recursion.loopIndex + 1}. Duplicate imprints stack multiplicatively.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {hud.recursion.draftOptions.map((opt, idx) => {
                  const currentStacks = hud.recursion?.relicStacks?.[opt.id] ?? 0;
                  const synergyPreview = getDraftRelicSynergyPreview(
                    opt.id,
                    hud.recursion?.relicStacks
                  );
                  const completesNew = synergyPreview.status === 'completes';
                  const alreadyActive = synergyPreview.status === 'active';
                  const partnerDef = synergyPreview.partnerRelic;
                  const accentBorder =
                    opt.accent === 'emerald'
                      ? 'border-emerald-400/80 hover:border-emerald-300'
                      : opt.accent === 'amber'
                        ? 'border-amber-400/80 hover:border-amber-300'
                        : opt.accent === 'rose'
                          ? 'border-rose-400/80 hover:border-rose-300'
                          : opt.accent === 'purple'
                            ? 'border-fuchsia-400/80 hover:border-fuchsia-300'
                            : 'border-cyan-400/80 hover:border-cyan-300';
                  const accentText =
                    opt.accent === 'emerald'
                      ? 'text-emerald-300'
                      : opt.accent === 'amber'
                        ? 'text-amber-300'
                        : opt.accent === 'rose'
                          ? 'text-rose-300'
                          : opt.accent === 'purple'
                            ? 'text-fuchsia-300'
                            : 'text-cyan-300';
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      data-testid={`relic-draft-card-${idx}`}
                      data-relic-id={opt.id}
                      data-constellation-ready={completesNew ? 'true' : 'false'}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        onSelectRecursionRelic?.(opt.id);
                      }}
                      className={`flex flex-col justify-between text-left bg-[#0c1322] hover:bg-[#152038] border p-3.5 transition-colors cursor-pointer ${accentBorder}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span
                            className={`text-[9px] font-mono-tabular font-bold uppercase tracking-widest ${accentText}`}
                          >
                            {currentStacks > 0 ? `STACK ×${currentStacks} → ×${currentStacks + 1}` : 'NEW RELIC'}
                          </span>
                          <span className="text-[10px] font-mono-tabular font-bold text-slate-200 bg-slate-900 px-1.5 py-0.5 border border-slate-700">
                            [{idx + 1}]
                          </span>
                        </div>
                        <div className="text-sm sm:text-base font-display font-bold text-white uppercase tracking-wider mb-1">
                          {opt.name}
                        </div>
                        <p className="text-[11px] text-slate-200 leading-snug mb-2">
                          {opt.benefitText}
                        </p>
                        <div
                          data-testid={`relic-constellation-preview-${idx}`}
                          className={`mb-2.5 px-2 py-1 border text-[9px] font-mono-tabular leading-tight ${
                            completesNew
                              ? 'bg-amber-500/15 border-amber-400/80 text-amber-200'
                              : alreadyActive
                                ? 'bg-emerald-500/15 border-emerald-400/70 text-emerald-200'
                                : 'bg-slate-900/90 border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="font-bold uppercase tracking-wider">
                            {completesNew
                              ? `${t(locale, 'constellationReadyBadge')} · ${
                                  locale === 'vi'
                                    ? synergyPreview.constellation.titleVi
                                    : synergyPreview.constellation.titleEn
                                }`
                              : alreadyActive
                                ? `${t(locale, 'constellationActiveBadge')} · ${
                                    locale === 'vi'
                                      ? synergyPreview.constellation.titleVi
                                      : synergyPreview.constellation.titleEn
                                  }`
                                : `◇ ${
                                    locale === 'vi'
                                      ? synergyPreview.constellation.titleVi
                                      : synergyPreview.constellation.titleEn
                                  } (+ ${partnerDef.shortLabel})`}
                          </div>
                          <div className="text-[8px] text-slate-300 mt-0.5">
                            {locale === 'vi'
                              ? synergyPreview.constellation.summaryVi
                              : synergyPreview.constellation.summaryEn}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono-tabular font-bold uppercase tracking-wider ${accentText}`}>
                        IMPRINT {opt.shortLabel} →
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
        {/* v4.0.0: Modular Compact Diegetic Live Comms Strip */}
        <HudLiveCommsStrip
          hud={hud}
          locale={locale}
          cameraSettings={cameraSettings}
          inspectingLoomChamber={inspectingLoomChamber}
          focusMode={focusMode}
          onDismissComms={onDismissComms}
        />

        <div className="grid grid-cols-2 gap-1 items-end [@media(min-width:640px)_and_(min-height:541px)]:contents">
          {/* Bottom-Left Dock: Diegetic Horological Echo Rig Strip */}
          <div
            data-testid="echo-hud-module"
            data-echo-state={echo.state}
            className="relative [@media(min-width:640px)_and_(min-height:541px)]:fixed [@media(min-width:640px)_and_(min-height:541px)]:bottom-3 [@media(min-width:640px)_and_(min-height:541px)]:left-4 [@media(min-width:640px)_and_(min-height:541px)]:z-20 [@media(min-width:640px)_and_(min-height:541px)]:w-[224px] bg-gradient-to-t from-[#040811]/92 via-[#070d19]/84 to-[#070d19]/55 border-t border-cyan-400/35 border-b border-white/10 px-2.5 py-2 shadow-[0_10px_28px_rgba(0,0,0,0.68)] pointer-events-auto"
          >
            <div className="flex items-center justify-between gap-1.5 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <HudIconEchoGlyph state={echo.state} hasClip={echo.hasClip} />
                <span className="text-[9px] font-mono-tabular font-semibold uppercase tracking-widest text-slate-200 truncate">
                  ECHO
                </span>
                {(() => {
                  const docId = normalizeEchoDoctrineId(hud.progression?.echoDoctrine);
                  const docSpec = getEchoDoctrineSpec(docId);
                  return (
                    <button
                      type="button"
                      data-testid="hud-echo-doctrine-badge"
                      data-doctrine={docId}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        onCycleEchoDoctrine?.();
                      }}
                      title={locale === 'vi' ? docSpec.summaryVi : docSpec.summaryEn}
                      className={`pointer-events-auto px-1 py-0.5 text-[8px] font-mono-tabular font-bold uppercase border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        docId === 'vanguard'
                          ? 'bg-orange-500/15 border-orange-400/70 text-orange-200 hover:bg-orange-500/30'
                          : docId === 'bastion'
                            ? 'bg-emerald-500/15 border-emerald-400/70 text-emerald-200 hover:bg-emerald-500/30'
                            : docId === 'nova'
                              ? 'bg-fuchsia-500/15 border-fuchsia-400/70 text-fuchsia-200 hover:bg-fuchsia-500/30'
                              : 'bg-sky-500/10 border-sky-400/50 text-sky-200 hover:bg-sky-500/25'
                      }`}
                    >
                      {formatEchoDoctrineHudBadge(docId, locale)}
                    </button>
                  );
                })()}
              </div>
              <span
                data-testid="echo-state-badge"
                className={`text-[8px] font-mono-tabular font-bold uppercase whitespace-nowrap shrink-0 ${
                  echo.state === 'recording'
                    ? 'text-amber-300'
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

            <div className="relative h-1 w-full bg-[#03060b] -skew-x-12 overflow-hidden mb-1.5">
              <div
                className={`absolute inset-y-0 left-0 ${
                  echo.state === 'recording'
                    ? 'bg-amber-400'
                    : echo.state === 'playback'
                      ? 'bg-cyan-300'
                      : echo.hasClip
                        ? 'bg-cyan-500/80'
                        : 'bg-slate-700/60'
                }`}
                style={{ width: `${echoPct}%` }}
              />
            </div>

            {/* v2.8.0: Compact 1-Line Echo Twin-Sync Resonance Readout (visible while linked or charged) */}
            {hud.twinSync && (hud.twinSync.linkActive || hud.twinSync.charge > 0) && (() => {
              const sync = hud.twinSync;
              const tierSpec = TWIN_SYNC_TIER_SPECS[sync.tier];
              const pct = Math.max(0, Math.min(100, Math.round(sync.charge)));
              return (
                <div
                  data-testid="hud-twin-sync"
                  data-sync-tier={sync.tier}
                  data-sync-active={sync.linkActive ? 'true' : 'false'}
                  className="mb-1.5"
                >
                  <div className="flex items-center justify-between gap-1 text-[8px] font-mono-tabular uppercase tracking-wider mb-0.5">
                    <span
                      className="font-bold truncate"
                      style={{ color: tierSpec.accentCss }}
                    >
                      {t(locale, 'twinSyncLabel')} ·{' '}
                      {locale === 'vi' ? tierSpec.labelVi : tierSpec.labelEn}
                    </span>
                    <span className="font-bold text-slate-200 whitespace-nowrap shrink-0">
                      {pct}%
                    </span>
                  </div>
                  <div className="relative h-1 w-full bg-[#04070c] overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 transition-all duration-100"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: tierSpec.accentCss,
                      }}
                    />
                  </div>
                </div>
              );
            })()}

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
                {echo.state === 'recording' ? t(locale, 'echoStop') : t(locale, 'echoRec')}
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
                <span className="hidden [@media(min-width:640px)_and_(min-height:541px)]:inline">[Y] </span>
                {t(locale, 'echoPlay')}
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
                      <span className="hidden [@media(min-width:640px)_and_(min-height:541px)]:inline">[V] </span>
                      {t(locale, 'echoWarp')}
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
                <span className="hidden [@media(min-width:640px)_and_(min-height:541px)]:inline">[C] </span>
                {t(locale, 'echoClear')}
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
                    ? locale === 'vi'
                      ? `HỘI TỤ SẴN SÀNG ${resonance.remainingWindow.toFixed(1)}s · [E]`
                      : `SYNC PRIMED ${resonance.remainingWindow.toFixed(1)}s · [E]`
                    : locale === 'vi'
                      ? 'HỘI TỤ SẴN SÀNG · THIẾU FLUX'
                      : 'SYNC PRIMED · LOW FLUX'
                  : relay.canRelay
                    ? locale === 'vi'
                      ? `BIẾN ẢNH SẴN SÀNG (${relay.distance.toFixed(1)}m)`
                      : `WARP READY (${relay.distance.toFixed(1)}m)`
                    : echo.state === 'playback'
                      ? locale === 'vi'
                        ? 'ĐANG PHÁT BÓNG'
                        : 'ECHO REPLAYING'
                      : locale === 'vi'
                        ? 'CHỜ LỆNH'
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

          {/* Bottom-Right Dock: Diegetic Horological Arsenal Strip */}
          <div
            data-testid="weapon-dock-card"
            className="relative [@media(min-width:640px)_and_(min-height:541px)]:fixed [@media(min-width:640px)_and_(min-height:541px)]:bottom-3 [@media(min-width:640px)_and_(min-height:541px)]:right-4 [@media(min-width:640px)_and_(min-height:541px)]:z-20 [@media(min-width:640px)_and_(min-height:541px)]:w-[260px] bg-gradient-to-t from-[#040811]/92 via-[#070d19]/84 to-[#070d19]/55 border-t border-amber-300/40 border-b border-white/10 px-2.5 py-2 shadow-[0_10px_28px_rgba(0,0,0,0.68)] pointer-events-auto"
          >
            <div
              data-testid="weapon-hud-module"
              data-equipped-weapon={hud.weapon.equippedWeaponId}
              data-equipped-upgrade={hud.weapon.equippedUpgradeId ?? 'none'}
              data-overheated={hud.weapon.overheated ? 'true' : 'false'}
              className="mb-0.5"
            >
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <HudIconWeaponGlyph
                    weaponId={hud.weapon.equippedWeaponId}
                    overheated={hud.weapon.overheated}
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
                            : 'text-cyan-200'
                    }`}
                  >
                    {hud.weapon.label}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
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
                    className={`px-1.5 py-0.5 text-[8px] font-mono-tabular font-semibold uppercase border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      hud.progression.memoryFragments >= 2
                        ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/75 text-amber-200'
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

              {/* 5-Slot Arsenal Quick-Select Bar (v2.4.0 includes [5] SCYTHE) */}
              <div
                data-testid="weapon-arsenal-slots"
                className="grid grid-cols-5 gap-1 mb-1"
              >
                {(
                  [
                    { id: 'chrono_edge', key: '1', short: t(locale, 'hudWeaponEdge') },
                    { id: 'pulsecaster', key: '2', short: t(locale, 'hudWeaponPulse') },
                    { id: 'phase_rail', key: '3', short: t(locale, 'hudWeaponRail') },
                    { id: 'grav_breaker', key: '4', short: t(locale, 'hudWeaponMaul') },
                    { id: 'chrono_scythe', key: '5', short: t(locale, 'hudWeaponScythe') },
                  ] as const
                ).map((slot) => {
                  const unlockedList = hud.progression.unlockedWeaponIds ?? [
                    'chrono_edge',
                    'pulsecaster',
                  ];
                  const unlocked = unlockedList.includes(slot.id);
                  const active = hud.weapon.equippedWeaponId === slot.id;
                  const attuned =
                    unlocked &&
                    isWeaponAttunedToBossCore(
                      slot.id,
                      hud.progression.equippedBossCore ?? null,
                      hud.progression.transcendedBossCores
                    );
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      tabIndex={-1}
                      disabled={!unlocked}
                      data-testid={`weapon-slot-${slot.id}`}
                      data-unlocked={unlocked ? 'true' : 'false'}
                      data-active={active ? 'true' : 'false'}
                      data-attuned={attuned ? 'true' : 'false'}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        if (unlocked) {
                          onSelectWeapon?.(slot.id);
                        }
                      }}
                      className={`px-0.5 py-0.5 text-[7px] font-mono-tabular font-bold uppercase border transition-colors truncate ${
                        active
                          ? attuned
                            ? 'bg-amber-500/25 border-amber-300 text-amber-100 cursor-pointer'
                            : 'bg-cyan-500/25 border-cyan-300 text-white cursor-pointer'
                          : unlocked
                            ? attuned
                              ? 'bg-[#121826] hover:bg-[#1b2438] border-amber-400/65 text-amber-200 cursor-pointer'
                              : 'bg-[#0b121e] hover:bg-[#142238] border-slate-700 text-slate-300 cursor-pointer'
                            : 'bg-[#06090f] border-slate-800/70 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <span className="hidden sm:inline">{slot.key}·</span>
                      {slot.short}
                      {attuned ? '✦' : ''}
                    </button>
                  );
                })}
              </div>

              {/* v2.7.0: Weapon Kinetic Overcharge Gauge (Auto-collapses when empty at 0% to eliminate idle clutter) */}
              {hud.kineticOvercharge && (() => {
                const ov = hud.kineticOvercharge;
                const wId = hud.weapon.equippedWeaponId;
                const perk = WEAPON_OVERCHARGE_PERKS[wId];
                const isActive = ov.activeWeaponId === wId && ov.activeTimer > 0;
                const maxDur = ov.maxDuration || 6.0;
                const pct = isActive
                  ? Math.max(0, Math.min(100, (ov.activeTimer / maxDur) * 100))
                  : Math.max(0, Math.min(100, ov.charges[wId] ?? 0));
                const isIdleZero = !isActive && Math.round(pct) === 0;
                return (
                  <div
                    data-testid="hud-weapon-overcharge"
                    data-active={isActive ? 'true' : 'false'}
                    data-charge={Math.round(pct)}
                    className={isIdleZero ? 'sr-only' : 'mb-1'}
                  >
                    <div className="flex items-center justify-between gap-1 text-[8px] font-mono-tabular uppercase leading-none mb-0.5">
                      <span
                        className="font-bold truncate"
                        style={{ color: isActive ? perk.accentCss : '#94a3b8' }}
                      >
                        {isActive
                          ? `⚡ ${t(locale, 'overchargeActive')} ${ov.activeTimer.toFixed(1)}s · ${locale === 'vi' ? perk.perkVi : perk.perkEn}`
                          : t(locale, 'overchargeLabel')}
                      </span>
                      <span
                        className="font-bold shrink-0"
                        style={{ color: isActive ? '#fde047' : perk.accentCss }}
                      >
                        {isActive ? 'MAX' : `${Math.round(pct)}%`}
                      </span>
                    </div>
                    <div className="relative h-1 w-full bg-[#04070c] -skew-x-12 overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 transition-all duration-75"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: isActive ? '#fde047' : perk.accentCss,
                        }}
                      />
                    </div>
                  </div>
                );
              })()}

              {hud.progression.equippedModChipId && (() => {
                const activeChip = WEAPON_MOD_CHIPS.find(
                  (c) => c.id === hud.progression.equippedModChipId
                );
                if (!activeChip) return null;
                return (
                  <div
                    data-testid="hud-active-mod-chip"
                    className="flex items-center justify-between text-[8px] font-mono-tabular uppercase mb-0.5"
                  >
                    <span className="text-slate-500">CHIP</span>
                    <span className="font-bold" style={{ color: activeChip.accentCss }}>
                      {locale === 'vi' ? activeChip.nameVi : activeChip.shortLabel}
                    </span>
                  </div>
                );
              })()}

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
                            ? t(locale, 'hudHeavyReady')
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
                      ? `[G] ${t(locale, 'skillPinShort')} ${hud.gravityPin.activeDurationTimer.toFixed(1)}s`
                      : hud.gravityPin.cooldownTimer > 0
                        ? `[G] ${t(locale, 'skillPinShort')} ${hud.gravityPin.cooldownTimer.toFixed(1)}s`
                        : `[G] ${t(locale, 'skillPinShort')} (${hud.gravityPin.fluxCost})`}
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
                      ? `[X] ${t(locale, 'skillCollapseShort')} ${hud.echoCollapse.cooldownTimer.toFixed(1)}s`
                      : `[X] ${t(locale, 'skillCollapseShort')} (${hud.echoCollapse.fluxCost})`}
                  </button>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Bottom-Center Cluster: Sanctuary Dock + Context Prompt + Discovery Toast + Checkpoint + Tutorial + Mobile Touch Controls */}
        <div
          data-testid="hud-bottom-cluster"
          data-run-mode={hud.run.mode}
          data-run-stage={hud.run.stage}
          className="[@media(min-width:640px)_and_(min-height:541px)]:fixed [@media(min-width:640px)_and_(min-height:541px)]:bottom-3 [@media(min-width:640px)_and_(min-height:541px)]:left-1/2 [@media(min-width:640px)_and_(min-height:541px)]:-translate-x-1/2 [@media(min-width:640px)_and_(min-height:541px)]:z-20 [@media(min-width:640px)_and_(min-height:541px)]:w-auto [@media(min-width:640px)_and_(min-height:541px)]:max-w-[calc(100vw-536px)] flex flex-col items-center gap-1"
        >
          <HudSafeRoomDock
            hud={hud}
            locale={locale}
            onSafeRoomMedBay={onSafeRoomMedBay}
            onSafeRoomLysaBriefing={onSafeRoomLysaBriefing}
            onOpenArmory={onOpenArmory}
            onEnterExpeditionAirlock={onEnterExpeditionAirlock}
            onPurchaseFabricator={onPurchaseFabricator}
            onEnterParadoxRift={onEnterParadoxRift}
          />
          {/* Single Contextual Environmental Interaction Prompt (Sleek 1-line obsidian/brass diegetic strip) */}
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
                className={`w-full max-w-md bg-gradient-to-r from-[#050a14]/92 via-[#091222]/88 to-[#050a14]/92 border-t border-b border-b-white/10 px-3 py-1 shadow-[0_8px_20px_rgba(0,0,0,0.65)] pointer-events-auto ${
                  hud.exploration.prompt.canInteract
                    ? 'border-t-emerald-400 text-emerald-200'
                    : hud.exploration.prompt.status === 'already_activated'
                      ? 'border-t-cyan-400/65 text-cyan-200'
                      : 'border-t-amber-400/55 text-amber-200/90'
                }`}
              >
                <div className="flex items-center justify-between gap-2.5 text-[10px] font-mono-tabular uppercase font-bold">
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
                        : 'text-amber-300/90 hover:text-amber-200'
                    }`}
                  >
                    {hud.exploration.prompt.canInteract ? 'ACTIVATE [I]' : '[I]'}
                  </button>
                </div>
                {hud.exploration.prompt.canInteract && hud.exploration.prompt.detailText && (
                  <div className="text-[9px] font-mono-tabular text-slate-300/90 truncate mt-0.5">
                    {hud.exploration.prompt.detailText}
                  </div>
                )}
              </div>
            )}

          {/* Chronicle Expansion: Fragment Cache & Sector Beacon Proximity Prompt */}
          {!hud.exploration.prompt.interactableId &&
            hud.exploration.nearbyExpansionPrompt &&
            hud.run.stage !== 'intro' &&
            hud.run.stage !== 'boss_intro' &&
            hud.run.stage !== 'transition_to_boss' &&
            (!hud.loom.active || inspectingLoomChamber) && (
              <div
                data-testid="hud-expansion-prompt"
                data-node-kind={hud.exploration.nearbyExpansionPrompt.kind}
                data-node-id={hud.exploration.nearbyExpansionPrompt.id}
                className={`w-full max-w-md bg-[#070b12]/90 border px-3 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.65)] pointer-events-auto ${
                  hud.exploration.nearbyExpansionPrompt.kind === 'temporal_rift'
                    ? 'border-fuchsia-400/90 text-fuchsia-200'
                    : hud.exploration.nearbyExpansionPrompt.kind === 'holo_memory'
                      ? 'border-cyan-300/95 text-cyan-100'
                      : hud.exploration.nearbyExpansionPrompt.kind === 'fragment_cache'
                        ? 'border-cyan-400/85 text-cyan-200'
                        : hud.exploration.nearbyExpansionPrompt.ready
                          ? 'border-amber-400/85 text-amber-200'
                          : 'border-slate-600/75 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono-tabular uppercase font-bold">
                  <span className="truncate">
                    {hud.exploration.nearbyExpansionPrompt.promptText}
                  </span>
                  <button
                    type="button"
                    tabIndex={-1}
                    data-testid="hud-btn-expansion-interact"
                    disabled={!hud.exploration.nearbyExpansionPrompt.ready}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onInteract?.();
                    }}
                    className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider shrink-0 whitespace-nowrap ${
                      hud.exploration.nearbyExpansionPrompt.ready
                        ? hud.exploration.nearbyExpansionPrompt.kind === 'temporal_rift'
                          ? 'bg-fuchsia-400 hover:bg-fuchsia-300 text-slate-950 cursor-pointer'
                          : hud.exploration.nearbyExpansionPrompt.kind === 'holo_memory'
                            ? 'bg-cyan-300 hover:bg-cyan-200 text-slate-950 cursor-pointer'
                            : hud.exploration.nearbyExpansionPrompt.kind === 'fragment_cache'
                              ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 cursor-pointer'
                              : 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                        : 'bg-[#0e1624] border border-slate-700 text-slate-400 cursor-default'
                    }`}
                  >
                    {hud.exploration.nearbyExpansionPrompt.ready
                      ? hud.exploration.nearbyExpansionPrompt.kind === 'temporal_rift'
                        ? 'SEAL [I]'
                        : hud.exploration.nearbyExpansionPrompt.kind === 'holo_memory'
                          ? t(locale, 'holoProjectBtn')
                          : hud.exploration.nearbyExpansionPrompt.kind === 'fragment_cache'
                            ? 'RECOVER [I]'
                            : 'PULSE [I]'
                      : `${hud.exploration.nearbyExpansionPrompt.cooldown.toFixed(1)}s`}
                  </button>
                </div>
                <div className="text-[9px] sm:text-[10px] font-mono-tabular text-slate-300 truncate mt-0.5">
                  {hud.exploration.nearbyExpansionPrompt.detailText}
                </div>
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

          {/* Checkpoint Saved / Restored Notice Toast (suppressed in Safe-Room so Sanctuary Dock stays anchored cleanly) */}
          {hud.run.checkpointNotice &&
            hud.run.checkpointNoticeTimer > 0 &&
            hud.expedition?.phase !== 'safe_room' &&
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
              focusMode ||
              actCurtainVisible ||
              hud.expedition?.phase === 'safe_room' ||
              Boolean(hud.comms.active?.tacticalHint) ||
              hud.run.stage === 'intro' ||
              hud.run.stage === 'boss_intro' ||
              hud.run.stage === 'transition_to_boss' ||
              hud.loom.active ||
              Boolean(hud.gauntlet?.active) ||
              Boolean(hud.ascension?.dailyTrialActive) ||
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
                    {localizedTutorial.badge} ·{' '}
                    <span className="text-cyan-300">
                      {localizedTutorial.shortTitle}
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
                    {locale === 'vi' ? 'ẨN [H]' : 'HIDE [H]'}
                  </button>
                </div>
                <p
                  data-testid="tutorial-desktop-prompt"
                  className="hidden [@media(min-width:640px)_and_(min-height:541px)]:block text-[11px] text-slate-200 leading-snug line-clamp-1"
                >
                  {localizedTutorial.desktopPrompt}
                </p>
                <p
                  data-testid="tutorial-mobile-prompt"
                  className="[@media(min-width:640px)_and_(min-height:541px)]:hidden text-[10px] text-slate-200 leading-snug line-clamp-2"
                >
                  {localizedTutorial.mobilePrompt}
                </p>
                {hud.tutorial.stuckHintActive && localizedTutorial.stuckHint && (
                  <p
                    data-testid="tutorial-stuck-hint"
                    className="mt-1 pt-1 border-t border-amber-500/30 text-[10px] font-mono-tabular text-amber-300 leading-snug"
                  >
                    {locale === 'vi' ? 'GỢI Ý: ' : 'HINT: '}
                    {localizedTutorial.stuckHint}
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
                    {locale === 'vi' ? 'GỢI Ý [H]' : 'HINTS [H]'}
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

          {/* Quiet Borderless Single-Line Desktop Control Hint (Hidden in Safe-Room & Focus Mode) */}
          {!focusMode &&
            hud.expedition?.phase !== 'safe_room' &&
            (!hud.tutorial.enabled || hud.tutorial.step === 'completed') && (
              <div className="hidden [@media(min-width:640px)_and_(min-height:541px)]:block text-center text-[9px] font-mono-tabular text-slate-400/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] px-2 py-0.5 whitespace-nowrap">
                WASD Move · O Lock · 1-5 Weapon · F/E Strike · Space Dodge · Q Parry · T/Y/V Echo · F8 Focus
              </div>
            )}
        </div>
      </div>
    </div>
  );
});

