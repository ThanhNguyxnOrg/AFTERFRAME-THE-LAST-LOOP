/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHud, type ProjectedDamagePopup } from './components/GameHud.tsx';
import { StatusModal } from './components/StatusModal.tsx';
import { TitleScreen } from './components/TitleScreen.tsx';
import { SoundEngine } from './game/audio.ts';
import { computeScreenFlashTint } from './game/combat-vfx.ts';
import { triggerGamepadHaptics } from './game/gamepad.ts';
import { InputController } from './game/input.ts';
import {
  computeLockedCameraYaw,
  findExecutionCandidate,
  resolveActiveLockOnTarget,
} from './game/lock-on.ts';
import {
  createAdaptiveFrameGovernor,
  getDefaultGraphicsSettings,
  shouldSkipRedundantStaticRender,
  shouldStepPacedFrame,
  stepAdaptiveFrameGovernor,
} from './game/performance.ts';
import { ArenaSceneRenderer } from './game/renderer.ts';
import { meshyAssetRegistry } from './game/meshy-assets.ts';
import {
  createInitialPhotoModeState,
  computeStyleRankTier,
  generateDailyTrialConfig,
  getDailyTrialRecord,
  getPhotoFilterCss,
} from './game/ascension-expansion.ts';
import {
  MASTERY_TARGETS,
  computeMasterySealModifiers,
  recordCombatMasteryVictory,
  tryTriggerTemporalSlip,
} from './game/combat-mastery.ts';
import {
  createHudSyncTracker,
  evaluateHudSyncTick,
} from './game/hud-sync.ts';
import { loadSavedLocale, saveLocale } from './game/i18n.ts';
import {
  activateSectorBeacon,
  advanceCampaignChapter,
  applySovereignAstralPulse,
  attemptActivateChronoOverdrive,
  attemptEnvironmentalInteraction,
  awakenWeaponUpgrade,
  claimAllMasteryBountiesInWorld,
  claimFragmentCache,
  claimMasteryBountyInWorld,
  claimSafeRoomLysaBriefing,
  claimSecretEchoVault,
  clearTacticalWaypoint,
  completeMissionObjective,
  createBossWorld,
  createInitialWorld,
  cycleEchoDoctrine,
  cycleSentinelProtocol,
  discoverCodexEntry,
  discoverSecretArea,
  dismissActiveHoloMemory,
  dismissActiveTransmission,
  engageWardenPrimeInLoom,
  ensureAscensionState,
  equipBenchWeapon,
  equipRigModule,
  equipSeraRigSkin,
  equipWeaponUpgrade,
  evaluateInteractionTarget,
  extractHudSnapshot,
  enterExpeditionTransitAirlock,
  forceBossAttack,
  getWeaponUpgradeDefinition,
  grantOverdriveCharge,
  grantProgressionReward,
  loadCampaignProgressFromStorage,
  overclockRigModule,
  overclockWeaponUpgrade,
  purchaseAndEquipWeaponModChip,
  purchaseFabricatorItem,
  purchaseNeuralProtocol,
  purchaseRigModule,
  purchaseWeaponUpgrade,
  projectChapterHoloMemory,
  pushDamagePopup,
  resetWorldForPlaying,
  resetWorldForStandardPlaying,
  resolveStoryArcChoice,
  restoreSavedCampaignProgress,
  retryBossFromCheckpoint,
  saveCampaignProgressToStorage,
  sealTemporalRift,
  selectChronicleLoomEnding,
  selectRecursionRelic,
  setDifficultyTier,
  setEchoDoctrine,
  setOverdriveDifficulty,
  setSentinelProtocol,
  setTacticalWaypoint,
  shouldExposeTestHooks,
  skipBossIntroBanner,
  skipCampaignIntro,
  skipContainmentTransition,
  startAuthoredEncounter,
  startBossEncounter,
  startBossGauntletRun,
  startCampaignChapterSelect,
  startCampaignRun,
  startDailyChronoTrialRun,
  startEchoZeroParadoxEncounter,
  startExpeditionJourneyRun,
  startNewGamePlusRun,
  startPracticeStandardRun,
  startRecursionProtocol,
  stepWorld,
  switchPlayerWeapon,
  toggleChronoMutator,
  toggleSpeedrunHud,
  toggleTutorialHints,
  transitionCampaignToBoss,
  triggerChronoFinisher,
  triggerExpeditionBreach,
  triggerNarrativeEvent,
  unlockBossEchoCore,
  equipBossEchoCore,
  transcendBossEchoCore,
  saveLoadoutPreset,
  applyLoadoutPreset,
  grantConfluenceCharge,
  triggerConfluenceBurst,
  unlockChronoAchievement,
  unlockChronoScythe,
  useMedNaniteInjector,
  useSafeRoomMedBay,
} from './game/simulation.ts';
import type {
  AppLocale,
  BossAttackType,
  BossEchoCoreId,
  BossEncounterId,
  CameraSettings,
  CampaignChapterId,
  ChronicleLoomEndingId,
  ChronoAchievementId,
  ChronoMutatorState,
  ChronoRelicId,
  CodexEntryId,
  DamageNumberKind,
  EchoDoctrineId,
  EncounterCompositionId,
  FabricatorItemId,
  FpsLimitOption,
  FragmentCacheId,
  GameAppState,
  SeraRigSkinId,
  HudSnapshot,
  InteractableId,
  InteractionTargetEvaluation,
  MasteryBountyKind,
  MasteryTargetId,
  MissionObjectiveId,
  NarrativeEventId,
  NeuralProtocolId,
  PhotoModeState,
  RigModuleId,
  RigModuleSlot,
  SecretAreaId,
  SectorBeaconId,
  SentinelProtocolMode,
  StoryArcId,
  TacticalLoadoutPresetSlot,
  TacticalWaypointState,
  UpgradeEquipOutcome,
  UpgradePurchaseOutcome,
  WeaponId,
  WeaponModChipId,
  WeaponProgressionRewardId,
  WeaponProgressionState,
  WeaponUpgradeId,
  WorldExplorationState,
  WorldState,
} from './game/types.ts';

function getInitialLaunchConfig(): {
  appState: GameAppState;
  bossMode: boolean;
  practiceMode: boolean;
} {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const bossMode = params.get('boss') === '1';
    const practiceMode = params.get('practice') === '1';
    const autostart = params.get('autostart') === '1' || bossMode;
    return {
      appState: autostart ? 'playing' : 'title',
      bossMode,
      practiceMode,
    };
  }
  return { appState: 'title', bossMode: false, practiceMode: false };
}

function loadPersistedCampaignProgress(world: WorldState): void {
  loadCampaignProgressFromStorage(world);
}

let lastPersistedCampaignJson: string | null = null;

function savePersistedCampaignProgress(world: WorldState): void {
  const res = saveCampaignProgressToStorage(
    world,
    undefined,
    lastPersistedCampaignJson
  );
  if (res.written) {
    lastPersistedCampaignJson = res.json;
  }
}

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const calloutMountRef = useRef<HTMLDivElement | null>(null);
  const lockOnReticleRef = useRef<HTMLDivElement | null>(null);
  const perfOverlayRef = useRef<HTMLDivElement | null>(null);
  const perfVisibleRef = useRef<boolean>(false);
  const combatFlashRef = useRef<HTMLDivElement | null>(null);
  const combatFlashTimerRef = useRef<number | null>(null);

  const worldRef = useRef<WorldState | null>(null);
  const inputRef = useRef<InputController | null>(null);
  const soundRef = useRef<SoundEngine | null>(null);
  const rendererRef = useRef<ArenaSceneRenderer | null>(null);

  if (!worldRef.current) {
    const { appState: initialState, bossMode, practiceMode } = getInitialLaunchConfig();
    if (bossMode) {
      worldRef.current = createBossWorld(initialState, false);
    } else {
      const w = createInitialWorld(initialState);
      loadPersistedCampaignProgress(w);
      if (initialState === 'playing' && !practiceMode) {
        startCampaignRun(w, false);
      }
      worldRef.current = w;
    }
    if (typeof document !== 'undefined') {
      document.body.dataset.state = initialState;
      document.body.dataset.encounter = worldRef.current.encounterMode;
      document.body.dataset.runMode = worldRef.current.run.mode;
    }
  }

  if (!soundRef.current && typeof window !== 'undefined') {
    soundRef.current = new SoundEngine();
  }

  if (!inputRef.current && typeof window !== 'undefined') {
    inputRef.current = new InputController();
  }

  const [hud, setHud] = useState<HudSnapshot>(() =>
    extractHudSnapshot(worldRef.current!)
  );
  const [projectedDamagePopups, setProjectedDamagePopups] = useState<ProjectedDamagePopup[]>([]);
  const lastPopupCountRef = useRef<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(() =>
    soundRef.current ? soundRef.current.isMuted() : false
  );
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>(() =>
    inputRef.current
      ? inputRef.current.getCameraSettings()
      : {
          sensitivity: 1.0,
          invertY: false,
          reducedMotion: false,
          masterVolume: 0.85,
          musicVolume: 0.7,
          sfxVolume: 0.9,
          cameraShake: true,
          screenEffects: true,
          subtitlesEnabled: true,
          ...getDefaultGraphicsSettings(),
        }
  );
  const fpsLimitRef = useRef<FpsLimitOption>(cameraSettings.fpsLimit ?? 60);
  const renderScaleRef = useRef<number>(cameraSettings.renderScale ?? 0.85);
  const adaptiveResolutionRef = useRef<boolean>(cameraSettings.adaptiveResolution ?? true);
  const adaptiveGovernorRef = useRef(createAdaptiveFrameGovernor());
  const cameraShakeRef = useRef<boolean>(cameraSettings.cameraShake ?? true);
  const screenEffectsRef = useRef<boolean>(cameraSettings.screenEffects ?? true);
  const reducedMotionRef = useRef<boolean>(cameraSettings.reducedMotion);
  const forcePausedRerenderRef = useRef<boolean>(false);

  // v2.4.0: Bilingual Locale (EN / VI) & 3D Free-Camera Photo Mode state
  const [locale, setLocale] = useState<AppLocale>(() => loadSavedLocale());
  const localeRef = useRef<AppLocale>(locale);
  localeRef.current = locale;
  useEffect(() => {
    rendererRef.current?.setLocale(locale);
  }, [locale]);
  const [photoMode, setPhotoMode] = useState<PhotoModeState>(() =>
    createInitialPhotoModeState()
  );
  const photoModeRef = useRef<PhotoModeState>(photoMode);
  photoModeRef.current = photoMode;
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const focusModeRef = useRef<boolean>(false);
  focusModeRef.current = focusMode;
  const photoDragRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });
  const dailyTrialConfig = generateDailyTrialConfig();
  const dailyTrialRecord = hud.ascension?.lastDailyRecord ?? getDailyTrialRecord();

  const handleToggleFocusMode = useCallback((force?: boolean): boolean => {
    const next = typeof force === 'boolean' ? force : !focusModeRef.current;
    focusModeRef.current = next;
    setFocusMode(next);
    if (typeof document !== 'undefined') {
      document.body.dataset.focusMode = next ? 'true' : 'false';
    }
    return next;
  }, []);

  const emitSensoryCombatFeedback = useCallback((events: WorldState['events']) => {
    if (!events || events.length === 0) return;

    if (inputRef.current?.isGamepadConnected() && cameraShakeRef.current) {
      triggerGamepadHaptics(events, reducedMotionRef.current);
    }

    if (screenEffectsRef.current && combatFlashRef.current) {
      const flash = computeScreenFlashTint(events, reducedMotionRef.current);
      if (flash) {
        const el = combatFlashRef.current;
        el.dataset.tone = flash.tone;
        el.style.transition = 'none';
        el.style.boxShadow = `inset 0 0 110px rgba(${flash.rgba}, ${flash.maxOpacity})`;
        el.style.opacity = '1';
        void el.offsetWidth;
        el.style.transition = `opacity ${flash.durationMs}ms ease-out`;
        el.style.opacity = '0';
        if (combatFlashTimerRef.current !== null) {
          window.clearTimeout(combatFlashTimerRef.current);
        }
        combatFlashTimerRef.current = window.setTimeout(() => {
          if (combatFlashRef.current) {
            combatFlashRef.current.dataset.tone = 'none';
          }
          combatFlashTimerRef.current = null;
        }, flash.durationMs + 20);
      }
    }
  }, []);
  const [initialExplorationTab, setInitialExplorationTab] = useState<
    'missions' | 'map' | 'codex' | 'holo' | 'mastery'
  >('missions');

  const computeProjectedPopups = useCallback(
    (w: WorldState, renderer: ArenaSceneRenderer | null): ProjectedDamagePopup[] => {
      const popups = w.paradox?.damagePopups ?? [];
      if (popups.length === 0 || !renderer) return [];
      const out: ProjectedDamagePopup[] = [];
      for (const p of popups) {
        const proj = renderer.projectWorldToViewport(p.x, p.y, p.z);
        if (!proj.visible) continue;
        out.push({
          id: p.id,
          amount: p.amount,
          x: proj.x,
          y: proj.y,
          kind: p.kind,
          progress: Math.max(0, Math.min(1, p.age / Math.max(0.01, p.lifetime))),
        });
      }
      return out;
    },
    []
  );

  const syncDomAndReactHud = useCallback(() => {
    const w = worldRef.current;
    if (!w) return;
    document.body.dataset.state = w.appState;
    document.body.dataset.encounter = w.encounterMode;
    document.body.dataset.runMode = w.run.mode;
    savePersistedCampaignProgress(w);
    setHud(extractHudSnapshot(w, inputRef.current?.aimYaw));
    const projected = computeProjectedPopups(w, rendererRef.current);
    if (projected.length > 0 || lastPopupCountRef.current > 0) {
      lastPopupCountRef.current = projected.length;
      setProjectedDamagePopups(projected);
    }
  }, [computeProjectedPopups]);

  const syncRendererAndCamera = useCallback(() => {
    const w = worldRef.current;
    const input = inputRef.current;
    const renderer = rendererRef.current;
    if (!w) return;

    document.body.dataset.state = w.appState;
    document.body.dataset.encounter = w.encounterMode;
    document.body.dataset.runMode = w.run.mode;

    if (input) {
      input.clearAllInputs();
      input.resetCameraAngles();
      input.requestPointerLock();
    }
    if (renderer) {
      renderer.syncEnemyRigs(w);
      renderer.snapCameraToPlayer(
        w,
        input ? input.aimYaw : Math.PI,
        input ? input.aimPitch : 0.38
      );
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  const handleStartCampaignFromTitle = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w) return;

    const chosenWeapon = w.player.equippedWeaponId;
    startCampaignRun(w, false);
    if (chosenWeapon && chosenWeapon !== w.player.equippedWeaponId) {
      equipBenchWeapon(w, chosenWeapon);
    }
    if (w.events.length > 0) {
      soundRef.current?.playEvents(w.events);
      renderer?.handleCombatEvents(w.events);
    }
    syncRendererAndCamera();
    syncDomAndReactHud();
  }, [syncDomAndReactHud, syncRendererAndCamera]);

  const handleStartPracticeStandard = useCallback(
    (encounterId?: EncounterCompositionId) => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      const renderer = rendererRef.current;
      if (!w) return;

      startPracticeStandardRun(w, encounterId);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        renderer?.handleCombatEvents(w.events);
      }
      syncRendererAndCamera();
      syncDomAndReactHud();
    },
    [syncDomAndReactHud, syncRendererAndCamera]
  );

  const handleStartRecursionProtocol = useCallback(
    (startLoop = 1) => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      const renderer = rendererRef.current;
      if (!w) return;

      startRecursionProtocol(w, startLoop);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        renderer?.handleCombatEvents(w.events);
      }
      syncRendererAndCamera();
      syncDomAndReactHud();
    },
    [syncDomAndReactHud, syncRendererAndCamera]
  );

  const handleStartBossGauntlet = useCallback(
    (skipIntro = false) => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      const renderer = rendererRef.current;
      if (!w) return;

      startBossGauntletRun(w, skipIntro);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        renderer?.handleCombatEvents(w.events);
      }
      syncRendererAndCamera();
      syncDomAndReactHud();
    },
    [syncDomAndReactHud, syncRendererAndCamera]
  );

  const handleStartExpeditionJourney = useCallback(
    (startChapter: CampaignChapterId = 'prologue') => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      const renderer = rendererRef.current;
      if (!w) return;

      startExpeditionJourneyRun(w, startChapter, false);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        renderer?.handleCombatEvents(w.events);
      }
      syncRendererAndCamera();
      syncDomAndReactHud();
    },
    [syncDomAndReactHud, syncRendererAndCamera]
  );

  const handleTriggerExpeditionBreach = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w || w.appState !== 'playing') return;
    if (triggerExpeditionBreach(w)) {
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        renderer?.handleCombatEvents(w.events);
      }
      syncDomAndReactHud();
    }
  }, [syncDomAndReactHud]);

  const handleEnterExpeditionAirlock = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w || w.appState !== 'playing') return;
    if (enterExpeditionTransitAirlock(w)) {
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        renderer?.handleCombatEvents(w.events);
      }
      syncRendererAndCamera();
      syncDomAndReactHud();
    }
  }, [syncDomAndReactHud, syncRendererAndCamera]);

  const handleStartNewGamePlus = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w) return;
    startNewGamePlusRun(w);
    if (w.events.length > 0) {
      soundRef.current?.playEvents(w.events);
      renderer?.handleCombatEvents(w.events);
    }
    syncRendererAndCamera();
    syncDomAndReactHud();
  }, [syncDomAndReactHud, syncRendererAndCamera]);

  const handleSafeRoomMedBay = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w || w.appState !== 'playing') return;
    if (useSafeRoomMedBay(w)) {
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        renderer?.handleCombatEvents(w.events);
      }
      syncDomAndReactHud();
    }
  }, [syncDomAndReactHud]);

  const handleSafeRoomLysaBriefing = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w || w.appState !== 'playing') return;
    if (claimSafeRoomLysaBriefing(w)) {
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        renderer?.handleCombatEvents(w.events);
      }
      syncDomAndReactHud();
    }
  }, [syncDomAndReactHud]);

  const handleClaimSecretVault = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w || w.appState !== 'playing') return;
    if (claimSecretEchoVault(w)) {
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        renderer?.handleCombatEvents(w.events);
      }
      syncDomAndReactHud();
    }
  }, [syncDomAndReactHud]);

  const handleUseNanite = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w || w.appState !== 'playing') return;
    if (useMedNaniteInjector(w)) {
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        renderer?.handleCombatEvents(w.events);
      }
      syncDomAndReactHud();
    }
  }, [syncDomAndReactHud]);

  const handlePurchaseFabricator = useCallback(
    (itemId: FabricatorItemId) => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      const renderer = rendererRef.current;
      if (!w) return;
      if (purchaseFabricatorItem(w, itemId)) {
        if (w.events.length > 0) {
          soundRef.current?.playEvents(w.events);
          renderer?.handleCombatEvents(w.events);
        }
        forcePausedRerenderRef.current = true;
        syncDomAndReactHud();
      }
    },
    [syncDomAndReactHud]
  );

  const handleEquipSkin = useCallback(
    (skinId: SeraRigSkinId) => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      const renderer = rendererRef.current;
      if (!w) return;
      if (equipSeraRigSkin(w, skinId)) {
        if (w.events.length > 0) {
          soundRef.current?.playEvents(w.events);
          renderer?.handleCombatEvents(w.events);
        }
        forcePausedRerenderRef.current = true;
        renderer?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? 0,
          inputRef.current?.aimPitch ?? 0,
          0.016
        );
        syncDomAndReactHud();
      }
    },
    [syncDomAndReactHud]
  );

  const handleToggleMutator = useCallback(
    (key: keyof ChronoMutatorState) => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      if (!w) return;
      toggleChronoMutator(w, key);
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleToggleSpeedrunHud = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    if (!w) return;
    toggleSpeedrunHud(w);
    syncDomAndReactHud();
  }, [syncDomAndReactHud]);

  const handleEnterParadoxRift = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w) return;
    startEchoZeroParadoxEncounter(w, true);
    if (w.events.length > 0) {
      soundRef.current?.playEvents(w.events);
      renderer?.handleCombatEvents(w.events);
    }
    syncRendererAndCamera();
    syncDomAndReactHud();
  }, [syncDomAndReactHud, syncRendererAndCamera]);

  const handleToggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next: AppLocale = prev === 'en' ? 'vi' : 'en';
      saveLocale(next);
      return next;
    });
  }, []);

  const handleStartDailyTrial = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w) return;
    startDailyChronoTrialRun(w, true);
    if (w.events.length > 0) {
      soundRef.current?.playEvents(w.events);
      renderer?.handleCombatEvents(w.events);
    }
    syncRendererAndCamera();
    syncDomAndReactHud();
  }, [syncDomAndReactHud, syncRendererAndCamera]);

  const handleUnlockChronoScythe = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w) return;
    if (unlockChronoScythe(w)) {
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        renderer?.handleCombatEvents(w.events);
      }
      forcePausedRerenderRef.current = true;
      renderer?.updateAndRender(
        w,
        inputRef.current?.aimYaw ?? 0,
        inputRef.current?.aimPitch ?? 0,
        0.016
      );
      syncDomAndReactHud();
    }
  }, [syncDomAndReactHud]);

  const handleEquipModChip = useCallback(
    (chipId: WeaponModChipId | null) => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      const renderer = rendererRef.current;
      if (!w) return;
      if (purchaseAndEquipWeaponModChip(w, chipId)) {
        if (w.events.length > 0) {
          soundRef.current?.playEvents(w.events);
          renderer?.handleCombatEvents(w.events);
        }
        forcePausedRerenderRef.current = true;
        renderer?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? 0,
          inputRef.current?.aimPitch ?? 0,
          0.016
        );
        syncDomAndReactHud();
      }
    },
    [syncDomAndReactHud]
  );

  const handleTriggerChronoFinisher = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w || w.appState !== 'playing') return;
    if (triggerChronoFinisher(w)) {
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        renderer?.handleCombatEvents(w.events);
        emitSensoryCombatFeedback(w.events);
      }
      syncDomAndReactHud();
    }
  }, [emitSensoryCombatFeedback, syncDomAndReactHud]);

  const handleTogglePhotoMode = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    if (!w || w.appState === 'title') return;
    setPhotoMode((prev) => {
      const nextActive = !prev.active;
      const next: PhotoModeState = nextActive
        ? { ...createInitialPhotoModeState(), active: true }
        : { ...prev, active: false, hideUi: false };
      photoModeRef.current = next;
      if (nextActive) {
        inputRef.current?.exitPointerLock();
      }
      rendererRef.current?.setPhotoModeCamera({
        active: next.active,
        yawOffset: next.yawOffset,
        pitchOffset: next.pitchOffset,
        distance: next.distance,
        fov: next.fov,
        showDrone: next.showDrone,
      });
      forcePausedRerenderRef.current = true;
      return next;
    });
  }, []);

  useEffect(() => {
    if (hud.appState !== 'playing' && photoModeRef.current.active) {
      const next: PhotoModeState = { ...photoModeRef.current, active: false, hideUi: false };
      photoModeRef.current = next;
      setPhotoMode(next);
      rendererRef.current?.setPhotoModeCamera({
        active: false,
        yawOffset: 0,
        pitchOffset: 0.14,
        distance: 5.4,
        fov: 48,
        showDrone: true,
      });
    }
  }, [hud.appState]);

  const handleUpdatePhotoMode = useCallback((patch: Partial<PhotoModeState>) => {
    setPhotoMode((prev) => {
      const next: PhotoModeState = {
        ...prev,
        ...patch,
        pitchOffset: Math.max(-0.32, Math.min(1.12, patch.pitchOffset ?? prev.pitchOffset)),
        distance: Math.max(2.6, Math.min(14.5, patch.distance ?? prev.distance)),
        fov: Math.max(28, Math.min(82, patch.fov ?? prev.fov)),
      };
      photoModeRef.current = next;
      rendererRef.current?.setPhotoModeCamera({
        active: next.active,
        yawOffset: next.yawOffset,
        pitchOffset: next.pitchOffset,
        distance: next.distance,
        fov: next.fov,
        showDrone: next.showDrone,
      });
      forcePausedRerenderRef.current = true;
      return next;
    });
  }, []);

  const handleCapturePhoto = useCallback(() => {
    const renderer = rendererRef.current;
    const w = worldRef.current;
    if (!renderer || !w) return;
    const pm = photoModeRef.current;
    renderer.setPhotoModeCamera({
      active: pm.active,
      yawOffset: pm.yawOffset,
      pitchOffset: pm.pitchOffset,
      distance: pm.distance,
      fov: pm.fov,
      showDrone: pm.showDrone,
    });
    renderer.updateAndRender(
      w,
      inputRef.current?.aimYaw ?? 0,
      inputRef.current?.aimPitch ?? 0,
      0.016
    );
    const dataUrl = renderer.capturePhotoDataUrl(getPhotoFilterCss(pm.filter));
    soundRef.current?.playCameraShutter();
    if (dataUrl && typeof document !== 'undefined') {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `afterframe-photo-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }, []);

  // Global v2.4.0 keyboard shortcuts: [F9] Photo Mode, [7] Chrono Finisher, & Photo Mode WASD/Q-E orbit
  useEffect(() => {
    const onAscensionKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      if (e.code === 'F8') {
        e.preventDefault();
        handleToggleFocusMode();
        return;
      }
      if (e.code === 'F9') {
        e.preventDefault();
        handleTogglePhotoMode();
        return;
      }
      if (photoModeRef.current.active) {
        if (e.code === 'Escape') {
          e.preventDefault();
          handleTogglePhotoMode();
          return;
        }
        const stepYaw = 0.14;
        const stepPitch = 0.08;
        const stepDist = 0.6;
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
          handleUpdatePhotoMode({ yawOffset: photoModeRef.current.yawOffset - stepYaw });
        } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
          handleUpdatePhotoMode({ yawOffset: photoModeRef.current.yawOffset + stepYaw });
        } else if (e.code === 'KeyW' || e.code === 'ArrowUp') {
          handleUpdatePhotoMode({ pitchOffset: photoModeRef.current.pitchOffset + stepPitch });
        } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
          handleUpdatePhotoMode({ pitchOffset: photoModeRef.current.pitchOffset - stepPitch });
        } else if (e.code === 'KeyQ') {
          handleUpdatePhotoMode({ distance: photoModeRef.current.distance - stepDist });
        } else if (e.code === 'KeyE') {
          handleUpdatePhotoMode({ distance: photoModeRef.current.distance + stepDist });
        }
        return;
      }
      if (e.code === 'Digit7') {
        handleTriggerChronoFinisher();
      } else if (e.code === 'Digit8') {
        const w = worldRef.current;
        if (w && w.appState === 'playing') {
          soundRef.current?.unlock();
          w.events.length = 0;
          cycleSentinelProtocol(w);
          if (w.events.length > 0) {
            soundRef.current?.playEvents(w.events);
            rendererRef.current?.handleCombatEvents(w.events);
          }
          syncDomAndReactHud();
        }
      } else if (e.code === 'Digit0') {
        const w = worldRef.current;
        if (w && w.appState === 'playing') {
          soundRef.current?.unlock();
          w.events.length = 0;
          cycleEchoDoctrine(w);
          if (w.events.length > 0) {
            soundRef.current?.playEvents(w.events);
            rendererRef.current?.handleCombatEvents(w.events);
          }
          syncDomAndReactHud();
        }
      }
    };
    window.addEventListener('keydown', onAscensionKeyDown);
    return () => window.removeEventListener('keydown', onAscensionKeyDown);
  }, [
    handleToggleFocusMode,
    handleTogglePhotoMode,
    handleTriggerChronoFinisher,
    handleUpdatePhotoMode,
    syncDomAndReactHud,
  ]);

  const handleJumpToExpeditionSector = useCallback(
    (targetChapter: CampaignChapterId) => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      const renderer = rendererRef.current;
      if (!w) return;
      startExpeditionJourneyRun(w, targetChapter, true);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        renderer?.handleCombatEvents(w.events);
      }
      syncRendererAndCamera();
      syncDomAndReactHud();
    },
    [syncDomAndReactHud, syncRendererAndCamera]
  );

  const handleTriggerChronoOverdrive = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    if (!w || w.appState !== 'playing') return;
    if (inputRef.current) {
      inputRef.current.triggerChronoOverdrive();
    } else {
      attemptActivateChronoOverdrive(w);
      syncDomAndReactHud();
    }
  }, [syncDomAndReactHud]);

  const handleSelectRecursionRelic = useCallback(
    (relicId: ChronoRelicId): boolean => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      const renderer = rendererRef.current;
      if (!w) return false;

      const ok = selectRecursionRelic(w, relicId);
      if (!ok) return false;
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        renderer?.handleCombatEvents(w.events);
      }
      syncRendererAndCamera();
      syncDomAndReactHud();
      return true;
    },
    [syncDomAndReactHud, syncRendererAndCamera]
  );

  const handleToggleOverdriveDifficulty = useCallback(
    (enabled?: boolean) => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      if (!w) return;

      const next = enabled ?? !(w.progression.overdriveDifficulty ?? false);
      setOverdriveDifficulty(w, next);
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleSelectDifficultyTier = useCallback(
    (tier: 'standard' | 'veteran' | 'singularity') => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      if (!w) return;

      setDifficultyTier(w, tier);
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleStartOrRestart = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w) return;

    resetWorldForPlaying(w);

    if (w.events.length > 0) {
      soundRef.current?.playEvents(w.events);
      renderer?.handleCombatEvents(w.events);
    }

    syncRendererAndCamera();
    syncDomAndReactHud();
  }, [syncDomAndReactHud, syncRendererAndCamera]);

  const handleRetryBossCheckpoint = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w) return;

    retryBossFromCheckpoint(w, false);

    if (w.events.length > 0) {
      soundRef.current?.playEvents(w.events);
      renderer?.handleCombatEvents(w.events);
    }

    syncRendererAndCamera();
    syncDomAndReactHud();
  }, [syncDomAndReactHud, syncRendererAndCamera]);

  const handleRestartFullRun = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w) return;

    startCampaignRun(w, true);
    if (w.events.length > 0) {
      soundRef.current?.playEvents(w.events);
      renderer?.handleCombatEvents(w.events);
    }
    syncRendererAndCamera();
    syncDomAndReactHud();
  }, [syncDomAndReactHud, syncRendererAndCamera]);

  const handleStartBoss = useCallback(
    (bossId: BossEncounterId = 'helix-04') => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      const renderer = rendererRef.current;
      if (!w) return;

      if (
        w.appState !== 'title' &&
        w.run.mode === 'campaign' &&
        w.run.chapter === 'prologue' &&
        bossId === 'helix-04'
      ) {
        transitionCampaignToBoss(w, false, 'chapter_1_helix');
      } else {
        startBossEncounter(w, false, bossId);
      }

      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        renderer?.handleCombatEvents(w.events);
      }

      syncRendererAndCamera();
      syncDomAndReactHud();
    },
    [syncDomAndReactHud, syncRendererAndCamera]
  );

  const handleAdvanceNextChapter = useCallback((): boolean => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w) return false;

    if (advanceCampaignChapter(w, false)) {
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        renderer?.handleCombatEvents(w.events);
      }
      syncRendererAndCamera();
      syncDomAndReactHud();
      return true;
    }
    return false;
  }, [syncDomAndReactHud, syncRendererAndCamera]);

  const handleSelectCampaignChapter = useCallback(
    (chapter: CampaignChapterId) => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      const renderer = rendererRef.current;
      if (!w) return;

      if (startCampaignChapterSelect(w, chapter, false)) {
        if (w.events.length > 0) {
          soundRef.current?.playEvents(w.events);
          renderer?.handleCombatEvents(w.events);
        }
        syncRendererAndCamera();
        syncDomAndReactHud();
      }
    },
    [syncDomAndReactHud, syncRendererAndCamera]
  );

  const handleRestoreSavedCampaign = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w) return;

    if (restoreSavedCampaignProgress(w)) {
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        renderer?.handleCombatEvents(w.events);
      }
      syncRendererAndCamera();
      syncDomAndReactHud();
    }
  }, [syncDomAndReactHud, syncRendererAndCamera]);

  const handleSelectLoomEnding = useCallback(
    (endingId: ChronicleLoomEndingId): boolean => {
      const w = worldRef.current;
      const renderer = rendererRef.current;
      if (!w) return false;

      if (
        w.appState === 'playing' &&
        w.recursion?.awaitingRelicDraft &&
        w.recursion.draftOptions.length > 0
      ) {
        const idx = endingId === 'silence' ? 0 : endingId === 'witness' ? 1 : 2;
        const opt = w.recursion.draftOptions[idx];
        if (opt && selectRecursionRelic(w, opt.id)) {
          soundRef.current?.unlock();
          if (w.events.length > 0) {
            soundRef.current?.playEvents(w.events);
            renderer?.handleCombatEvents(w.events);
          }
          syncRendererAndCamera();
          syncDomAndReactHud();
          return true;
        }
      }

      if (selectChronicleLoomEnding(w, endingId)) {
        soundRef.current?.unlock();
        if (w.events.length > 0) {
          soundRef.current?.playEvents(w.events);
          renderer?.handleCombatEvents(w.events);
        }
        inputRef.current?.exitPointerLock();
        syncDomAndReactHud();
        return true;
      }
      return false;
    },
    [syncDomAndReactHud, syncRendererAndCamera]
  );

  const handleEngageWardenPrime = useCallback((): boolean => {
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w) return false;

    if (engageWardenPrimeInLoom(w, false)) {
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        renderer?.handleCombatEvents(w.events);
      }
      syncRendererAndCamera();
      syncDomAndReactHud();
      return true;
    }
    return false;
  }, [syncDomAndReactHud, syncRendererAndCamera]);

  const handleSkipIntro = useCallback(() => {
    const w = worldRef.current;
    if (!w) return;
    skipCampaignIntro(w);
    syncDomAndReactHud();
  }, [syncDomAndReactHud]);

  const handleSkipTransition = useCallback(() => {
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w) return;
    skipContainmentTransition(w);
    if (w.events.length > 0) {
      soundRef.current?.playEvents(w.events);
      renderer?.handleCombatEvents(w.events);
    }
    syncRendererAndCamera();
    syncDomAndReactHud();
  }, [syncDomAndReactHud, syncRendererAndCamera]);

  const handleSkipBossIntro = useCallback(() => {
    const w = worldRef.current;
    if (!w) return;
    skipBossIntroBanner(w);
    syncDomAndReactHud();
  }, [syncDomAndReactHud]);

  const handleDismissComms = useCallback(() => {
    const w = worldRef.current;
    if (!w) return;
    dismissActiveTransmission(w);
    syncDomAndReactHud();
  }, [syncDomAndReactHud]);

  const handleToggleTutorial = useCallback(() => {
    const w = worldRef.current;
    if (!w) return;
    toggleTutorialHints(w);
    syncDomAndReactHud();
  }, [syncDomAndReactHud]);

  const handleSkipSequenceShortcut = useCallback((): boolean => {
    const w = worldRef.current;
    if (!w || w.appState !== 'playing') return false;
    if (w.run.stage === 'intro') {
      handleSkipIntro();
      return true;
    }
    if (w.run.stage === 'transition_to_boss') {
      handleSkipTransition();
      return true;
    }
    if (w.run.stage === 'boss_intro') {
      handleSkipBossIntro();
      return true;
    }
    return false;
  }, [handleSkipBossIntro, handleSkipIntro, handleSkipTransition]);

  const handlePauseFromPointerLockLoss = useCallback(() => {
    const w = worldRef.current;
    if (!w || w.appState !== 'playing') return;
    w.appState = 'paused';
    document.body.dataset.state = 'paused';
    inputRef.current?.clearAllInputs();
    syncDomAndReactHud();
  }, [syncDomAndReactHud]);

  const handleTogglePause = useCallback(() => {
    const w = worldRef.current;
    const input = inputRef.current;
    if (!w) return;

    if (w.appState === 'playing') {
      setInitialExplorationTab('missions');
      w.appState = 'paused';
      document.body.dataset.state = 'paused';
      input?.clearAllInputs();
      input?.exitPointerLock();
      syncDomAndReactHud();
    } else if (w.appState === 'paused') {
      w.appState = 'playing';
      document.body.dataset.state = 'playing';
      input?.clearAllInputs();
      input?.requestPointerLock();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      syncDomAndReactHud();
    }
  }, [syncDomAndReactHud]);

  const handleOpenArmory = useCallback(() => {
    const w = worldRef.current;
    const input = inputRef.current;
    if (!w) return;

    if (w.appState === 'playing') {
      setInitialExplorationTab('missions');
      w.appState = 'paused';
      document.body.dataset.state = 'paused';
      input?.clearAllInputs();
      input?.exitPointerLock();
      syncDomAndReactHud();
    } else if (w.appState === 'paused') {
      w.appState = 'playing';
      document.body.dataset.state = 'playing';
      input?.clearAllInputs();
      input?.requestPointerLock();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      syncDomAndReactHud();
    }
  }, [syncDomAndReactHud]);

  const handleOpenMap = useCallback(() => {
    const w = worldRef.current;
    const input = inputRef.current;
    if (!w) return;

    if (w.appState === 'playing') {
      setInitialExplorationTab('map');
      w.appState = 'paused';
      document.body.dataset.state = 'paused';
      input?.clearAllInputs();
      input?.exitPointerLock();
      syncDomAndReactHud();
    } else if (w.appState === 'paused') {
      w.appState = 'playing';
      document.body.dataset.state = 'playing';
      setInitialExplorationTab('missions');
      input?.clearAllInputs();
      input?.requestPointerLock();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      syncDomAndReactHud();
    }
  }, [syncDomAndReactHud]);

  const handleReturnToTitle = useCallback(() => {
    const w = worldRef.current;
    const input = inputRef.current;
    if (!w) return;

    resetWorldForStandardPlaying(w);
    w.appState = 'title';
    document.body.dataset.state = 'title';
    document.body.dataset.encounter = 'standard';
    document.body.dataset.runMode = w.run.mode;
    input?.clearAllInputs();
    input?.resetCameraAngles();
    input?.exitPointerLock();
    rendererRef.current?.syncEnemyRigs(w);
    syncDomAndReactHud();
  }, [syncDomAndReactHud]);

  const handleToggleMute = useCallback(() => {
    if (!soundRef.current) return;
    soundRef.current.unlock();
    const nextMuted = soundRef.current.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  const handlePlayCodexAudio = useCallback((speaker?: string, classification?: string) => {
    soundRef.current?.unlock();
    soundRef.current?.playArchiveLogSample(speaker, classification);
  }, []);

  const handleUpdateCameraSettings = useCallback((next: Partial<CameraSettings>) => {
    if (!inputRef.current) return;
    soundRef.current?.unlock();
    const updated = inputRef.current.setCameraSettings(next);
    soundRef.current?.setVolumeSettings(updated);
    setCameraSettings(updated);
  }, []);

  const handleTogglePerfOverlay = useCallback(() => {
    const next = !perfVisibleRef.current;
    perfVisibleRef.current = next;
    if (perfOverlayRef.current) {
      perfOverlayRef.current.style.display = next ? 'block' : 'none';
    }
    if (inputRef.current) {
      const updated = inputRef.current.setCameraSettings({ showPerfHud: next });
      setCameraSettings(updated);
    }
  }, []);

  const handleEchoRecord = useCallback(() => {
    inputRef.current?.triggerEchoRecord();
  }, []);

  const handleEchoReplay = useCallback(() => {
    inputRef.current?.triggerEchoReplay();
  }, []);

  const handleEchoClear = useCallback(() => {
    inputRef.current?.triggerEchoClear();
  }, []);

  const handleEchoRelay = useCallback(() => {
    inputRef.current?.triggerEchoRelay();
  }, []);

  const handleLightAttack = useCallback(() => {
    inputRef.current?.triggerLightAttack();
  }, []);

  const handleHeavyAttack = useCallback(() => {
    inputRef.current?.triggerHeavyAttack();
  }, []);

  const handleDodge = useCallback(() => {
    inputRef.current?.triggerDodge();
  }, []);

  const handleParry = useCallback(() => {
    inputRef.current?.triggerParry();
  }, []);

  const handleGravityPin = useCallback(() => {
    inputRef.current?.triggerGravityPin();
  }, []);

  const handleEchoCollapse = useCallback(() => {
    inputRef.current?.triggerEchoCollapse();
  }, []);

  const handleToggleLockOn = useCallback(() => {
    inputRef.current?.triggerToggleLockOn();
  }, []);

  const handleCycleLockOn = useCallback(() => {
    inputRef.current?.triggerCycleLockOn();
  }, []);

  const handleSelectWeapon = useCallback(
    (weaponId?: WeaponId) => {
      const w = worldRef.current;
      if (!w) return;
      w.events.length = 0;
      const switched = equipBenchWeapon(w, weaponId);
      if (w.appState === 'playing' && !switched) {
        if (weaponId) {
          inputRef.current?.triggerSelectWeapon(weaponId);
        } else {
          inputRef.current?.triggerSwitchWeapon();
        }
      }
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        rendererRef.current?.handleCombatEvents(w.events);
      }
      if (switched && w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleSwitchWeapon = useCallback(() => {
    handleSelectWeapon(undefined);
  }, [handleSelectWeapon]);

  const handleInteract = useCallback(() => {
    inputRef.current?.triggerInteract();
  }, []);

  const handleDismissHoloMemory = useCallback(() => {
    const w = worldRef.current;
    if (!w) return;
    if (dismissActiveHoloMemory(w)) {
      syncDomAndReactHud();
    }
  }, [syncDomAndReactHud]);

  const handlePurchaseUpgrade = useCallback(
    (upgradeId: WeaponUpgradeId) => {
      const w = worldRef.current;
      if (!w) return;
      w.events.length = 0;
      const res = purchaseWeaponUpgrade(w, upgradeId);
      if (res.success) {
        const upgDef = getWeaponUpgradeDefinition(upgradeId);
        if (upgDef) {
          equipBenchWeapon(w, upgDef.weaponId);
        }
      }
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        rendererRef.current?.handleCombatEvents(w.events);
      }
      if (w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleEquipUpgrade = useCallback(
    (weaponId: WeaponId, upgradeId: WeaponUpgradeId | null) => {
      const w = worldRef.current;
      if (!w) return;
      w.events.length = 0;
      const res = equipWeaponUpgrade(w, weaponId, upgradeId);
      if (res.success && upgradeId !== null) {
        equipBenchWeapon(w, weaponId);
      }
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        rendererRef.current?.handleCombatEvents(w.events);
      }
      if (w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handlePurchaseRigModule = useCallback(
    (moduleId: RigModuleId) => {
      const w = worldRef.current;
      if (!w) return;
      w.events.length = 0;
      purchaseRigModule(w, moduleId);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        rendererRef.current?.handleCombatEvents(w.events);
      }
      if (w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleEquipRigModule = useCallback(
    (slot: RigModuleSlot, moduleId: RigModuleId | null) => {
      const w = worldRef.current;
      if (!w) return;
      w.events.length = 0;
      equipRigModule(w, slot, moduleId);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        rendererRef.current?.handleCombatEvents(w.events);
      }
      if (w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleOverclockRigModule = useCallback(
    (moduleId: RigModuleId) => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      if (!w) return;
      w.events.length = 0;
      overclockRigModule(w, moduleId);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        rendererRef.current?.handleCombatEvents(w.events);
      }
      if (w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleSetSentinelProtocol = useCallback(
    (mode: SentinelProtocolMode) => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      if (!w) return;
      w.events.length = 0;
      setSentinelProtocol(w, mode);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        rendererRef.current?.handleCombatEvents(w.events);
      }
      if (w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleCycleSentinelProtocol = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    if (!w) return;
    w.events.length = 0;
    cycleSentinelProtocol(w);
    if (w.events.length > 0) {
      soundRef.current?.playEvents(w.events);
      rendererRef.current?.handleCombatEvents(w.events);
    }
    if (w.appState !== 'playing') {
      rendererRef.current?.updateAndRender(
        w,
        inputRef.current?.aimYaw ?? w.player.rotationY,
        inputRef.current?.aimPitch ?? 0.38,
        0.016
      );
    }
    syncDomAndReactHud();
  }, [syncDomAndReactHud]);

  const handleSetEchoDoctrine = useCallback(
    (doctrineId: EchoDoctrineId) => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      if (!w) return;
      w.events.length = 0;
      setEchoDoctrine(w, doctrineId);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        rendererRef.current?.handleCombatEvents(w.events);
      }
      if (w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleCycleEchoDoctrine = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    if (!w) return;
    w.events.length = 0;
    cycleEchoDoctrine(w);
    if (w.events.length > 0) {
      soundRef.current?.playEvents(w.events);
      rendererRef.current?.handleCombatEvents(w.events);
    }
    if (w.appState !== 'playing') {
      rendererRef.current?.updateAndRender(
        w,
        inputRef.current?.aimYaw ?? w.player.rotationY,
        inputRef.current?.aimPitch ?? 0.38,
        0.016
      );
    }
    syncDomAndReactHud();
  }, [syncDomAndReactHud]);

  const handleUnlockBossCore = useCallback(
    (coreId: BossEchoCoreId) => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      if (!w) return;
      w.events.length = 0;
      unlockBossEchoCore(w, coreId);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        rendererRef.current?.handleCombatEvents(w.events);
      }
      if (w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleEquipBossCore = useCallback(
    (coreId: BossEchoCoreId | null) => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      if (!w) return;
      w.events.length = 0;
      equipBossEchoCore(w, coreId);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        rendererRef.current?.handleCombatEvents(w.events);
      }
      if (w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleTranscendBossCore = useCallback(
    (coreId: BossEchoCoreId) => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      if (!w) return;
      w.events.length = 0;
      transcendBossEchoCore(w, coreId);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        rendererRef.current?.handleCombatEvents(w.events);
      }
      if (w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleSaveLoadoutPreset = useCallback(
    (slotIndex: TacticalLoadoutPresetSlot) => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      if (!w) return;
      saveLoadoutPreset(w, slotIndex);
      if (w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleApplyLoadoutPreset = useCallback(
    (slotIndex: TacticalLoadoutPresetSlot) => {
      soundRef.current?.unlock();
      const w = worldRef.current;
      if (!w) return;
      w.events.length = 0;
      applyLoadoutPreset(w, slotIndex);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        rendererRef.current?.handleCombatEvents(w.events);
      }
      forcePausedRerenderRef.current = true;
      if (w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleTriggerConfluenceBurst = useCallback(() => {
    soundRef.current?.unlock();
    const w = worldRef.current;
    if (!w || w.appState !== 'playing') return;
    if (inputRef.current) {
      inputRef.current.triggerConfluenceBurst();
    } else {
      w.events.length = 0;
      triggerConfluenceBurst(w);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        rendererRef.current?.handleCombatEvents(w.events);
      }
      syncDomAndReactHud();
    }
  }, [syncDomAndReactHud]);

  const handleOverclockUpgrade = useCallback(
    (upgradeId: WeaponUpgradeId) => {
      const w = worldRef.current;
      if (!w) return;
      w.events.length = 0;
      overclockWeaponUpgrade(w, upgradeId);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        rendererRef.current?.handleCombatEvents(w.events);
      }
      if (w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleAwakenUpgrade = useCallback(
    (upgradeId: WeaponUpgradeId) => {
      const w = worldRef.current;
      if (!w) return;
      w.events.length = 0;
      awakenWeaponUpgrade(w, upgradeId);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        rendererRef.current?.handleCombatEvents(w.events);
      }
      if (w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handlePurchaseNeuralProtocol = useCallback(
    (protocolId: NeuralProtocolId) => {
      const w = worldRef.current;
      if (!w) return;
      w.events.length = 0;
      purchaseNeuralProtocol(w, protocolId);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        rendererRef.current?.handleCombatEvents(w.events);
      }
      if (w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleResolveStoryChoice = useCallback(
    (arcId: StoryArcId, optionId: string) => {
      const w = worldRef.current;
      if (!w) return;
      w.events.length = 0;
      resolveStoryArcChoice(w, arcId, optionId);
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        rendererRef.current?.handleCombatEvents(w.events);
      }
      if (w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleClaimMasteryBounty = useCallback(
    (targetId: MasteryTargetId, kind: MasteryBountyKind) => {
      const w = worldRef.current;
      if (!w) return;
      w.events.length = 0;
      const claimed = claimMasteryBountyInWorld(w, targetId, kind);
      if (!claimed) return;
      if (w.events.length > 0) {
        soundRef.current?.playEvents(w.events);
        rendererRef.current?.handleCombatEvents(w.events);
      }
      savePersistedCampaignProgress(w);
      if (w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleClaimAllMasteryBounties = useCallback(() => {
    const w = worldRef.current;
    if (!w) return;
    w.events.length = 0;
    const count = claimAllMasteryBountiesInWorld(w);
    if (count <= 0) return;
    if (w.events.length > 0) {
      soundRef.current?.playEvents(w.events);
      rendererRef.current?.handleCombatEvents(w.events);
    }
    savePersistedCampaignProgress(w);
    if (w.appState !== 'playing') {
      rendererRef.current?.updateAndRender(
        w,
        inputRef.current?.aimYaw ?? w.player.rotationY,
        inputRef.current?.aimPitch ?? 0.38,
        0.016
      );
    }
    syncDomAndReactHud();
  }, [syncDomAndReactHud]);

  const handleSetTacticalWaypoint = useCallback(
    (waypoint: TacticalWaypointState | null) => {
      const w = worldRef.current;
      if (!w) return;
      if (waypoint === null) {
        clearTacticalWaypoint(w);
      } else {
        setTacticalWaypoint(w, waypoint);
      }
      if (w.appState !== 'playing') {
        rendererRef.current?.updateAndRender(
          w,
          inputRef.current?.aimYaw ?? w.player.rotationY,
          inputRef.current?.aimPitch ?? 0.38,
          0.016
        );
      }
      syncDomAndReactHud();
    },
    [syncDomAndReactHud]
  );

  const handleTouchMoveHold = useCallback(
    (dx: number, dz: number, pointerId?: number | null) => {
      inputRef.current?.setTouchMoveHold(dx, dz, pointerId);
    },
    []
  );

  const handleTouchMovePulse = useCallback((dx: number, dz: number) => {
    inputRef.current?.triggerTouchMovePulse(dx, dz);
  }, []);

  const handleTouchCameraStart = useCallback(
    (
      id: number,
      clientX: number,
      clientY: number,
      source: 'touch' | 'pointer' = 'pointer'
    ) => {
      inputRef.current?.startTouchCameraLook(id, clientX, clientY, source);
    },
    []
  );

  const handleTouchCameraMove = useCallback(
    (
      id: number,
      clientX: number,
      clientY: number,
      source: 'touch' | 'pointer' = 'pointer'
    ) => {
      inputRef.current?.moveTouchCameraLook(id, clientX, clientY, source);
    },
    []
  );

  const handleTouchCameraEnd = useCallback(
    (id?: number, source?: 'touch' | 'pointer') => {
      inputRef.current?.endTouchCameraLook(id, source);
    },
    []
  );

  useEffect(() => {
    const mountEl = canvasMountRef.current;
    const world = worldRef.current;
    const input = inputRef.current;
    if (!mountEl || !world || !input) return;

    if (!soundRef.current || soundRef.current.isDisposed()) {
      soundRef.current = new SoundEngine();
    } else {
      soundRef.current.resurrect();
    }
    const unlockAudio = () => {
      soundRef.current?.unlock();
    };
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });

    document.body.dataset.state = world.appState;
    document.body.dataset.encounter = world.encounterMode;
    document.body.dataset.runMode = world.run.mode;

    const sceneRenderer = new ArenaSceneRenderer(mountEl, world);
    sceneRenderer.setLocale(localeRef.current);
    sceneRenderer.attachCalloutLayer(calloutMountRef.current);
    sceneRenderer.attachLockOnElement(lockOnReticleRef.current);
    const initialCamSettings = input.getCameraSettings();
    sceneRenderer.setReducedMotion(initialCamSettings.reducedMotion);
    sceneRenderer.setCameraShake(initialCamSettings.cameraShake ?? true);
    sceneRenderer.setScreenEffects(initialCamSettings.screenEffects ?? true);
    sceneRenderer.applyPerformanceSettings(initialCamSettings);
    fpsLimitRef.current = initialCamSettings.fpsLimit ?? 60;
    renderScaleRef.current = initialCamSettings.renderScale ?? 0.85;
    adaptiveResolutionRef.current = initialCamSettings.adaptiveResolution ?? true;
    adaptiveGovernorRef.current = createAdaptiveFrameGovernor();
    cameraShakeRef.current = initialCamSettings.cameraShake ?? true;
    reducedMotionRef.current = initialCamSettings.reducedMotion;
    perfVisibleRef.current = Boolean(initialCamSettings.showPerfHud);
    if (perfOverlayRef.current) {
      perfOverlayRef.current.style.display = perfVisibleRef.current ? 'block' : 'none';
    }
    soundRef.current?.setVolumeSettings(initialCamSettings);
    rendererRef.current = sceneRenderer;
    const unsubscribeMeshy = meshyAssetRegistry.subscribe(() => {
      rendererRef.current?.syncCustomMeshyModels(worldRef.current);
      forcePausedRerenderRef.current = true;
    });

    input.attach(mountEl, {
      onPauseToggle: handleTogglePause,
      onMapToggle: handleOpenMap,
      onPointerLockLost: handlePauseFromPointerLockLoss,
      onRestart: handleStartOrRestart,
      onMuteToggle: handleToggleMute,
      onStartFromTitle: handleStartCampaignFromTitle,
      onStartBoss: handleStartBoss,
      onTogglePerfOverlay: handleTogglePerfOverlay,
      onToggleTutorial: handleToggleTutorial,
      onSkipSequence: handleSkipSequenceShortcut,
      onAdvanceChapter: handleAdvanceNextChapter,
      onSelectLoomEnding: handleSelectLoomEnding,
      onSelectWeapon: handleSelectWeapon,
    });

    const handleResize = () => {
      if (!canvasMountRef.current) return;
      sceneRenderer.resize(
        canvasMountRef.current.clientWidth || window.innerWidth,
        canvasMountRef.current.clientHeight || window.innerHeight
      );
      forcePausedRerenderRef.current = true;
      input.updateCanvasBounds();
    };
    window.addEventListener('resize', handleResize);

    let rafId = 0;
    let lastTime = performance.now();
    let lastPacedTime = lastTime;
    let lastPerfUpdateTime = 0;
    let lastAutosaveTime = lastTime;
    let pausedFrameRendered = false;
    let frameCount = 0;
    let accumFrameMs = 0;
    let accumExecMs = 0;
    const hudSyncTracker = createHudSyncTracker(world);
    let prevLoomChoiceOverlay = Boolean(
      world.loom?.active && world.run.stage === 'chronicle_loom'
    );

    const handleVisibilityResume = () => {
      if (!document.hidden) {
        const resumed = performance.now();
        lastTime = resumed;
        lastPacedTime = resumed;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityResume);

    const stepAndRender = (now: number) => {
      const execStart = performance.now();
      const rawMs = now - lastTime;
      lastTime = now;

      const dt = Math.min(Math.max(rawMs / 1000, 0.001), 0.05);

      const beforeEncounterMode = world.encounterMode;
      const beforeChapter = world.run.chapter;
      const beforeBossId = world.boss?.id ?? null;
      const beforeEncounterId = world.encounter.encounterId;
      const beforeWaveIndex = world.encounter.currentWaveIndex;
      const beforeLoopIndex = world.recursion?.loopIndex ?? 0;
      const pm = photoModeRef.current;
      if (pm.active) {
        sceneRenderer.setPhotoModeCamera({
          active: true,
          yawOffset: pm.yawOffset,
          pitchOffset: pm.pitchOffset,
          distance: pm.distance,
          fov: pm.fov,
          showDrone: pm.showDrone,
        });
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, dt);
        return;
      }

      const frameInput = input.consumeFrameInput(dt);
      stepWorld(world, frameInput, dt);

      // If the simulation transitioned between sectors/chapters or boss encounters,
      // synchronize the 3D enemy rigs and snap camera behind Sera facing north
      if (
        world.encounterMode !== beforeEncounterMode ||
        world.run.chapter !== beforeChapter ||
        (world.boss?.id ?? null) !== beforeBossId ||
        (world.recursion?.loopIndex ?? 0) !== beforeLoopIndex
      ) {
        sceneRenderer.syncEnemyRigs(world);
        input.resetCameraAngles();
        sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
        forcePausedRerenderRef.current = true;
      } else if (
        world.encounter.encounterId !== beforeEncounterId ||
        world.encounter.currentWaveIndex !== beforeWaveIndex
      ) {
        sceneRenderer.syncEnemyRigs(world);
        forcePausedRerenderRef.current = true;
      }

      // Release pointer lock automatically when transitioning into gameover modal
      // or full-screen post-match selection overlays (Recursion Relic Draft / Chronicle Loom Ending)
      const nowRecursionDraft = Boolean(world.recursion?.awaitingRelicDraft);
      const nowLoomChoiceOverlay = Boolean(
        world.loom?.active && world.run.stage === 'chronicle_loom'
      );
      if (
        (world.appState === 'gameover' && hudSyncTracker.prevAppState !== 'gameover') ||
        (nowRecursionDraft && !hudSyncTracker.prevRecursionDraft) ||
        (nowLoomChoiceOverlay && !prevLoomChoiceOverlay)
      ) {
        input.exitPointerLock();
      }
      prevLoomChoiceOverlay = nowLoomChoiceOverlay;

      if (world.events.length > 0) {
        soundRef.current?.playEvents(world.events);
        sceneRenderer.handleCombatEvents(world.events);
        emitSensoryCombatFeedback(world.events);
      }

      soundRef.current?.updateAmbientPulse(dt, {
        appState: world.appState,
        chapter: world.run.chapter,
        bossActive: Boolean(world.boss && world.boss.hp > 0 && world.boss.aiState !== 'defeated'),
        bossPhase: world.boss?.phase ?? 1,
        bossCoreExposed: Boolean(world.boss?.coreExposed),
        adrenalineTier: Math.min(5, Math.max(0, Math.floor(world.player.adrenalineScore ?? 0))),
        selectedEnding: world.run.selectedEnding ?? world.loom?.selectedEnding ?? null,
        styleRankTier: world.ascension?.style.tier ?? 'D',
      });

      const activeLockTarget =
        world.appState === 'playing' && world.player.lockOnTargetId
          ? resolveActiveLockOnTarget(world, world.player.lockOnTargetId)
          : null;
      if (activeLockTarget) {
        input.aimYaw = computeLockedCameraYaw(
          input.aimYaw,
          world.player.x,
          world.player.z,
          activeLockTarget.x,
          activeLockTarget.z,
          dt
        );
      }

      if (world.appState !== 'paused' && world.appState !== 'gameover') {
        pausedFrameRendered = false;
      }

      const skipStaticRender = shouldSkipRedundantStaticRender(
        world.appState,
        pausedFrameRendered,
        forcePausedRerenderRef.current
      );
      if (!skipStaticRender) {
        sceneRenderer.updateAndRender(
          world,
          input.aimYaw,
          input.aimPitch,
          dt
        );
        forcePausedRerenderRef.current = false;
        if (world.appState === 'paused' || world.appState === 'gameover') {
          pausedFrameRendered = true;
        }
      }

      // Track rolling frame interval, Adaptive 60 FPS Governor & synchronous execution time
      const execEnd = performance.now();
      const execMs = execEnd - execStart;
      if (!skipStaticRender && world.appState === 'playing') {
        const dynFactor = stepAdaptiveFrameGovernor(
          adaptiveGovernorRef.current,
          rawMs,
          renderScaleRef.current,
          adaptiveResolutionRef.current,
          isSoftwareWebGL
        );
        sceneRenderer.setDynamicRenderScaleFactor(dynFactor);
      }
      frameCount += 1;
      accumFrameMs += Math.min(Math.max(rawMs, 1), 100);
      accumExecMs += execMs;
      if (perfVisibleRef.current && perfOverlayRef.current && now - lastPerfUpdateTime >= 250) {
        const avgMs = accumFrameMs / Math.max(1, frameCount);
        const avgExecMs = accumExecMs / Math.max(1, frameCount);
        const approxFps = 1000 / Math.max(0.1, avgMs);
        const diag = sceneRenderer.getDiagnostics();
        const effScalePct = Math.round(
          (diag.graphics?.renderScale ?? renderScaleRef.current) *
            (diag.graphics?.dynamicScaleFactor ?? 1) *
            100
        );
        const lockLabel = input.isPointerLockActive() ? 'LOCK' : 'FREE';
        perfOverlayRef.current.textContent = `FPS ${approxFps.toFixed(0)} (${avgMs.toFixed(1)}ms · CPU ${avgExecMs.toFixed(1)}ms) · SCALE ${effScalePct}% · DPR ${diag.appliedPixelRatio.toFixed(2)} · CALLS ${diag.render.calls} · TRIS ${diag.render.triangles} · PTR ${lockLabel}`;
        lastPerfUpdateTime = now;
        frameCount = 0;
        accumFrameMs = 0;
        accumExecMs = 0;
      }

      const currCanExecute =
        world.appState === 'playing' && findExecutionCandidate(world) !== null;
      const syncDecision = evaluateHudSyncTick(
        hudSyncTracker,
        world,
        activeLockTarget,
        currCanExecute,
        now,
        100
      );

      if (syncDecision.shouldSyncHud) {
        document.body.dataset.state = world.appState;
        document.body.dataset.encounter = world.encounterMode;
        document.body.dataset.runMode = world.run.mode;
        if (
          syncDecision.persistenceChanged ||
          (world.run.mode === 'campaign' && now - lastAutosaveTime >= 3000)
        ) {
          lastAutosaveTime = now;
          savePersistedCampaignProgress(world);
        }
        setHud(extractHudSnapshot(world, input.aimYaw));
        if ((world.paradox?.damagePopups.length ?? 0) > 0 || lastPopupCountRef.current > 0) {
          const projected = computeProjectedPopups(world, sceneRenderer);
          lastPopupCountRef.current = projected.length;
          setProjectedDamagePopups(projected);
        }
      }
    };

    const isSoftwareWebGL = sceneRenderer.isSoftwareWebGL() || sceneRenderer.isHeadlessBrowser();
    let headlessTimerId = 0;
    let loopDisposed = false;

    const scheduleNextSoftwareFrame = (onReady: (ts: number) => void) => {
      const gl = sceneRenderer.getWebGLContext() as WebGL2RenderingContext | null;
      if (gl && typeof gl.fenceSync === 'function' && typeof gl.getSyncParameter === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        if (sync) {
          gl.flush();
          let polls = 0;
          const pollFence = () => {
            if (loopDisposed) {
              try {
                gl.deleteSync(sync);
              } catch {
                // Ignore sync deletion error during teardown
              }
              return;
            }
            polls += 1;
            const status = gl.getSyncParameter(sync, gl.SYNC_STATUS);
            if (status === gl.UNSIGNALED && polls < 24) {
              headlessTimerId = window.setTimeout(pollFence, 5);
            } else {
              gl.deleteSync(sync);
              headlessTimerId = window.setTimeout(() => {
                if (!loopDisposed) rafId = requestAnimationFrame(onReady);
              }, 48);
            }
          };
          headlessTimerId = window.setTimeout(pollFence, 5);
          return;
        }
      }
      headlessTimerId = window.setTimeout(() => {
        if (!loopDisposed) rafId = requestAnimationFrame(onReady);
      }, 64);
    };

    const tick = (now: number) => {
      if (loopDisposed) return;
      if (isSoftwareWebGL) {
        stepAndRender(now);
        scheduleNextSoftwareFrame(tick);
      } else {
        if (shouldStepPacedFrame(now, lastPacedTime, fpsLimitRef.current)) {
          lastPacedTime = now;
          stepAndRender(now);
        }
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);

    const win = window as unknown as {
      __advanceSimulation?: (seconds: number, renderAtEnd?: boolean) => void;
      __afterframeTest?: {
        getWorld: () => WorldState;
        getInput: () => InputController;
        startCampaignRun: (skipIntro?: boolean) => WorldState;
        startPracticeStandardRun: (encounterId?: EncounterCompositionId) => WorldState;
        startAuthoredEncounter: (encounterId: EncounterCompositionId) => WorldState;
        startBossEncounter: (skipIntro?: boolean, bossId?: BossEncounterId) => WorldState;
        advanceCampaignChapter: (skipBossIntro?: boolean) => WorldState;
        startCampaignChapterSelect: (
          chapter: CampaignChapterId,
          skipIntro?: boolean
        ) => WorldState;
        restoreSavedCampaignProgress: () => WorldState;
        engageWardenPrimeInLoom: (skipIntro?: boolean) => WorldState;
        selectChronicleLoomEnding: (ending: ChronicleLoomEndingId) => WorldState;
        skipBossIntroBanner: () => WorldState;
        dismissActiveTransmission: () => WorldState;
        retryBossCheckpoint: (skipIntro?: boolean) => WorldState;
        forceBossAttack: (attack: BossAttackType) => WorldState;
        rotateCamera: (dx: number, dy: number) => { aimYaw: number; aimPitch: number };
        startTouchCameraLook: (
          id: number,
          clientX: number,
          clientY: number,
          source?: 'touch' | 'pointer'
        ) => { started: boolean; aimYaw: number; aimPitch: number };
        moveTouchCameraLook: (
          id: number,
          clientX: number,
          clientY: number,
          source?: 'touch' | 'pointer'
        ) => { moved: boolean; aimYaw: number; aimPitch: number };
        endTouchCameraLook: (
          id?: number,
          source?: 'touch' | 'pointer'
        ) => { active: boolean; aimYaw: number; aimPitch: number };
        setTouchMoveHold: (
          dx: number,
          dz: number,
          pointerId?: number | null
        ) => { x: number; z: number; pointerId: number | null };
        saveCampaignProgress: () => string | null;
        loadCampaignProgress: () => WorldState;
        switchWeapon: (targetWeaponId?: WeaponId) => {
          switched: boolean;
          equippedWeaponId: WeaponId;
        };
        getProgressionState: () => WeaponProgressionState;
        grantReward: (rewardId: WeaponProgressionRewardId) => {
          granted: boolean;
          amount: number;
          memoryFragments: number;
        };
        purchaseUpgrade: (upgradeId: WeaponUpgradeId) => {
          outcome: UpgradePurchaseOutcome;
          progression: WeaponProgressionState;
        };
        equipUpgrade: (
          weaponId: WeaponId,
          upgradeId: WeaponUpgradeId | null
        ) => {
          outcome: UpgradeEquipOutcome;
          progression: WeaponProgressionState;
        };
        purchaseRigModule: (moduleId: RigModuleId) => {
          outcome: UpgradePurchaseOutcome;
          progression: WeaponProgressionState;
        };
        equipRigModule: (
          slot: RigModuleSlot,
          moduleId: RigModuleId | null
        ) => {
          outcome: UpgradeEquipOutcome;
          progression: WeaponProgressionState;
        };
        overclockRigModule?: (moduleId: RigModuleId) => {
          outcome: UpgradePurchaseOutcome;
          progression: WeaponProgressionState;
        };
        setSentinelProtocol?: (mode: SentinelProtocolMode) => SentinelProtocolMode;
        unlockBossEchoCore?: (coreId: BossEchoCoreId) => {
          outcome: UpgradePurchaseOutcome;
          progression: WeaponProgressionState;
        };
        equipBossEchoCore?: (coreId: BossEchoCoreId | null) => {
          outcome: UpgradeEquipOutcome;
          progression: WeaponProgressionState;
        };
        transcendBossEchoCore?: (coreId: BossEchoCoreId) => {
          outcome: UpgradePurchaseOutcome;
          progression: WeaponProgressionState;
        };
        grantConfluenceCharge?: (amount: number) => number;
        triggerConfluenceBurst?: () => boolean;
        overclockUpgrade: (upgradeId: WeaponUpgradeId) => {
          outcome: UpgradePurchaseOutcome;
          progression: WeaponProgressionState;
        };
        awakenUpgrade: (upgradeId: WeaponUpgradeId) => {
          outcome: UpgradePurchaseOutcome;
          progression: WeaponProgressionState;
        };
        purchaseNeuralProtocol: (protocolId: NeuralProtocolId) => {
          outcome: UpgradePurchaseOutcome;
          progression: WeaponProgressionState;
        };
        resolveStoryChoice: (arcId: StoryArcId, optionId: string) => boolean;
        claimFragmentCache: (cacheId: FragmentCacheId | string) => boolean;
        activateSectorBeacon: (beaconId: SectorBeaconId | string) => boolean;
        setTacticalWaypoint: (
          waypoint: TacticalWaypointState | null
        ) => TacticalWaypointState | null;
        setCameraSettings: (s: Partial<CameraSettings>) => CameraSettings;
        togglePerfOverlay: () => boolean;
        interact: (targetId?: InteractableId) => InteractionTargetEvaluation;
        evaluateInteraction: (targetId: InteractableId) => InteractionTargetEvaluation;
        completeObjective: (objectiveId: MissionObjectiveId) => boolean;
        discoverCodex: (codexId: CodexEntryId) => boolean;
        equipSkin?: (skinId: SeraRigSkinId) => boolean;
        purchaseFabricator?: (itemId: FabricatorItemId) => boolean;
        useNanite?: () => boolean;
        toggleMutator?: (key: keyof ChronoMutatorState) => boolean;
        toggleSpeedrunHud?: () => boolean;
        enterParadoxRift?: (skipIntro?: boolean) => WorldState;
        unlockAchievement?: (id: ChronoAchievementId) => boolean;
        pushTestDamagePopup?: (amount: number, kind?: DamageNumberKind) => void;
        discoverSecret: (secretId: SecretAreaId) => boolean;
        triggerNarrativeEvent: (eventId: NarrativeEventId) => boolean;
        getExplorationState: () => WorldExplorationState;
        getRendererDiagnostics: () => ReturnType<ArenaSceneRenderer['getDiagnostics']>;
        startRecursionProtocol: (startLoop?: number) => WorldState;
        startBossGauntlet: (skipIntro?: boolean) => WorldState;
        startExpeditionJourney: (chapter?: CampaignChapterId) => WorldState;
        startNewGamePlus: () => number;
        triggerExpeditionBreach: () => boolean;
        enterExpeditionAirlock: () => boolean;
        useSafeRoomMedBay: () => boolean;
        claimSafeRoomLysaBriefing: () => boolean;
        claimSecretEchoVault: () => boolean;
        grantOverdriveCharge: (amount?: number) => boolean;
        activateChronoOverdrive: () => boolean;
        selectRecursionRelic: (relicId: ChronoRelicId | string) => boolean;
        setOverdriveDifficulty: (enabled: boolean) => boolean;
        sealTemporalRift: () => boolean;
        getAudioDiagnostics: () => ReturnType<SoundEngine['getDiagnostics']> | null;
        startDailyTrial?: (skipIntro?: boolean) => WorldState;
        unlockScythe?: () => boolean;
        equipModChip?: (chipId: WeaponModChipId | null) => boolean;
        triggerFinisher?: () => boolean;
        setStylePoints?: (points: number) => void;
        togglePhotoMode?: (patch?: Partial<PhotoModeState>) => PhotoModeState;
        setLocale?: (next: AppLocale) => void;
        projectHoloMemory?: () => boolean;
        dismissHoloMemory?: () => boolean;
        claimMasteryBounty?: (targetId: MasteryTargetId, kind: MasteryBountyKind) => boolean;
        claimAllMasteryBounties?: () => number;
        recordMasteryDemo?: (targetId: MasteryTargetId, hitless?: boolean) => boolean;
        seedMasterySealDemo?: (targetCount?: number) => number;
        triggerTemporalSlip?: () => boolean;
        toggleFocusMode?: (force?: boolean) => boolean;
      };
    };

    if (shouldExposeTestHooks()) {
      win.__advanceSimulation = (seconds: number, renderAtEnd = true) => {
      const steps = Math.max(1, Math.ceil(seconds / 0.02));
      const stepDt = seconds / steps;
      for (let i = 0; i < steps; i++) {
        const beforeMode = world.encounterMode;
        const beforeChapter = world.run.chapter;
        const beforeBossId = world.boss?.id ?? null;
        const beforeEncId = world.encounter.encounterId;
        const beforeWave = world.encounter.currentWaveIndex;
        const frameInput = input.consumeFrameInput(stepDt);
        stepWorld(world, frameInput, stepDt);
        if (
          world.encounterMode !== beforeMode ||
          world.run.chapter !== beforeChapter ||
          (world.boss?.id ?? null) !== beforeBossId
        ) {
          sceneRenderer.syncEnemyRigs(world);
          input.resetCameraAngles();
          sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
        } else if (
          world.encounter.encounterId !== beforeEncId ||
          world.encounter.currentWaveIndex !== beforeWave
        ) {
          sceneRenderer.syncEnemyRigs(world);
        }
        if (world.events.length > 0) {
          soundRef.current?.playEvents(world.events);
          sceneRenderer.handleCombatEvents(world.events);
          emitSensoryCombatFeedback(world.events);
        }
        sceneRenderer.updateAndRender(
          world,
          input.aimYaw,
          input.aimPitch,
          stepDt,
          renderAtEnd && i === steps - 1
        );
      }
      lastTime = performance.now();
      document.body.dataset.state = world.appState;
      document.body.dataset.encounter = world.encounterMode;
      document.body.dataset.runMode = world.run.mode;
      savePersistedCampaignProgress(world);
      if (renderAtEnd) {
        setHud(extractHudSnapshot(world));
      }
    };

    win.__afterframeTest = {
      getWorld: () => world,
      getInput: () => input,
      startCampaignRun: (skipIntro = false) => {
        input.exitPointerLock();
        startCampaignRun(world, skipIntro);
        sceneRenderer.syncEnemyRigs(world);
        input.resetCameraAngles();
        sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        document.body.dataset.state = world.appState;
        document.body.dataset.encounter = world.encounterMode;
        document.body.dataset.runMode = world.run.mode;
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return world;
      },
      startPracticeStandardRun: (encounterId?: EncounterCompositionId) => {
        input.exitPointerLock();
        startPracticeStandardRun(world, encounterId);
        sceneRenderer.syncEnemyRigs(world);
        input.resetCameraAngles();
        sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        document.body.dataset.state = world.appState;
        document.body.dataset.encounter = world.encounterMode;
        document.body.dataset.runMode = world.run.mode;
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return world;
      },
      startAuthoredEncounter: (encounterId: EncounterCompositionId) => {
        input.exitPointerLock();
        startAuthoredEncounter(world, encounterId);
        sceneRenderer.syncEnemyRigs(world);
        input.resetCameraAngles();
        sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        document.body.dataset.state = world.appState;
        document.body.dataset.encounter = world.encounterMode;
        document.body.dataset.runMode = world.run.mode;
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return world;
      },
      startBossEncounter: (skipIntro = true, bossId: BossEncounterId = 'helix-04') => {
        input.exitPointerLock();
        startBossEncounter(world, skipIntro, bossId);
        sceneRenderer.syncEnemyRigs(world);
        input.resetCameraAngles();
        sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        document.body.dataset.state = world.appState;
        document.body.dataset.encounter = world.encounterMode;
        document.body.dataset.runMode = world.run.mode;
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return world;
      },
      advanceCampaignChapter: (skipBossIntro = true) => {
        input.exitPointerLock();
        advanceCampaignChapter(world, skipBossIntro);
        sceneRenderer.syncEnemyRigs(world);
        input.resetCameraAngles();
        sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        document.body.dataset.state = world.appState;
        document.body.dataset.encounter = world.encounterMode;
        document.body.dataset.runMode = world.run.mode;
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return world;
      },
      startCampaignChapterSelect: (chapter: CampaignChapterId, skipIntro = true) => {
        input.exitPointerLock();
        startCampaignChapterSelect(world, chapter, skipIntro);
        sceneRenderer.syncEnemyRigs(world);
        input.resetCameraAngles();
        sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        document.body.dataset.state = world.appState;
        document.body.dataset.encounter = world.encounterMode;
        document.body.dataset.runMode = world.run.mode;
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return world;
      },
      restoreSavedCampaignProgress: () => {
        input.exitPointerLock();
        restoreSavedCampaignProgress(world);
        sceneRenderer.syncEnemyRigs(world);
        input.resetCameraAngles();
        sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        document.body.dataset.state = world.appState;
        document.body.dataset.encounter = world.encounterMode;
        document.body.dataset.runMode = world.run.mode;
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return world;
      },
      engageWardenPrimeInLoom: (skipIntro = true) => {
        input.exitPointerLock();
        engageWardenPrimeInLoom(world, skipIntro);
        sceneRenderer.syncEnemyRigs(world);
        input.resetCameraAngles();
        sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        document.body.dataset.state = world.appState;
        document.body.dataset.encounter = world.encounterMode;
        document.body.dataset.runMode = world.run.mode;
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return world;
      },
      selectChronicleLoomEnding: (ending: ChronicleLoomEndingId) => {
        input.exitPointerLock();
        selectChronicleLoomEnding(world, ending);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        document.body.dataset.state = world.appState;
        document.body.dataset.encounter = world.encounterMode;
        document.body.dataset.runMode = world.run.mode;
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return world;
      },
      skipBossIntroBanner: () => {
        skipBossIntroBanner(world);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        setHud(extractHudSnapshot(world));
        return world;
      },
      dismissActiveTransmission: () => {
        dismissActiveTransmission(world);
        setHud(extractHudSnapshot(world));
        return world;
      },
      retryBossCheckpoint: (skipIntro = true) => {
        input.exitPointerLock();
        retryBossFromCheckpoint(world, skipIntro);
        sceneRenderer.syncEnemyRigs(world);
        input.resetCameraAngles();
        sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        document.body.dataset.state = world.appState;
        document.body.dataset.encounter = world.encounterMode;
        document.body.dataset.runMode = world.run.mode;
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return world;
      },
      forceBossAttack: (attack: BossAttackType) => {
        forceBossAttack(world, attack);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        setHud(extractHudSnapshot(world));
        return world;
      },
      rotateCamera: (dx: number, dy: number) => {
        input.rotateCameraByDelta(dx, dy);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        return { aimYaw: input.aimYaw, aimPitch: input.aimPitch };
      },
      startTouchCameraLook: (
        id: number,
        clientX: number,
        clientY: number,
        source: 'touch' | 'pointer' = 'touch'
      ) => {
        const started = input.startTouchCameraLook(id, clientX, clientY, source);
        return { started, aimYaw: input.aimYaw, aimPitch: input.aimPitch };
      },
      moveTouchCameraLook: (
        id: number,
        clientX: number,
        clientY: number,
        source: 'touch' | 'pointer' = 'touch'
      ) => {
        const moved = input.moveTouchCameraLook(id, clientX, clientY, source);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        return { moved, aimYaw: input.aimYaw, aimPitch: input.aimPitch };
      },
      endTouchCameraLook: (id?: number, source?: 'touch' | 'pointer') => {
        input.endTouchCameraLook(id, source);
        return {
          active: input.isTouchCameraActive(),
          aimYaw: input.aimYaw,
          aimPitch: input.aimPitch,
        };
      },
      setTouchMoveHold: (dx: number, dz: number, pointerId?: number | null) => {
        input.setTouchMoveHold(dx, dz, pointerId);
        return input.getTouchMoveHold();
      },
      saveCampaignProgress: () => {
        savePersistedCampaignProgress(world);
        return lastPersistedCampaignJson;
      },
      loadCampaignProgress: () => {
        loadPersistedCampaignProgress(world);
        sceneRenderer.syncEnemyRigs(world);
        setHud(extractHudSnapshot(world));
        return world;
      },
      switchWeapon: (targetWeaponId?: WeaponId) => {
        const switched = switchPlayerWeapon(world, targetWeaponId);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return {
          switched,
          equippedWeaponId: world.player.equippedWeaponId,
        };
      },
      getProgressionState: () => world.progression,
      grantReward: (rewardId: WeaponProgressionRewardId) => {
        const granted = grantProgressionReward(world, rewardId);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return {
          granted,
          amount: granted ? 1 : 0,
          memoryFragments: world.progression.memoryFragments,
        };
      },
      purchaseUpgrade: (upgradeId: WeaponUpgradeId) => {
        const res = purchaseWeaponUpgrade(world, upgradeId);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return {
          outcome: res.outcome,
          progression: world.progression,
        };
      },
      equipUpgrade: (weaponId: WeaponId, upgradeId: WeaponUpgradeId | null) => {
        const res = equipWeaponUpgrade(world, weaponId, upgradeId);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return {
          outcome: res.outcome,
          progression: world.progression,
        };
      },
      purchaseRigModule: (moduleId: RigModuleId) => {
        const res = purchaseRigModule(world, moduleId);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return {
          outcome: res.outcome,
          progression: world.progression,
        };
      },
      equipRigModule: (slot: RigModuleSlot, moduleId: RigModuleId | null) => {
        const res = equipRigModule(world, slot, moduleId);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return {
          outcome: res.outcome,
          progression: world.progression,
        };
      },
      overclockRigModule: (moduleId: RigModuleId) => {
        const res = overclockRigModule(world, moduleId);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return {
          outcome: res.outcome,
          progression: world.progression,
        };
      },
      setSentinelProtocol: (mode: SentinelProtocolMode) => {
        const res = setSentinelProtocol(world, mode);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return res.mode;
      },
      unlockBossEchoCore: (coreId: BossEchoCoreId) => {
        const res = unlockBossEchoCore(world, coreId);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return {
          outcome: res.outcome,
          progression: world.progression,
        };
      },
      equipBossEchoCore: (coreId: BossEchoCoreId | null) => {
        const res = equipBossEchoCore(world, coreId);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return {
          outcome: res.outcome,
          progression: world.progression,
        };
      },
      transcendBossEchoCore: (coreId: BossEchoCoreId) => {
        world.events.length = 0;
        const res = transcendBossEchoCore(world, coreId);
        if (world.events.length > 0) {
          soundRef.current?.playEvents(world.events);
          rendererRef.current?.handleCombatEvents(world.events);
        }
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return {
          outcome: res.outcome,
          progression: world.progression,
        };
      },
      grantConfluenceCharge: (amount: number) => {
        const charge = grantConfluenceCharge(world, amount);
        setHud(extractHudSnapshot(world));
        return charge;
      },
      triggerConfluenceBurst: () => {
        world.events.length = 0;
        const fired = triggerConfluenceBurst(world);
        if (world.events.length > 0) {
          soundRef.current?.playEvents(world.events);
          rendererRef.current?.handleCombatEvents(world.events);
        }
        setHud(extractHudSnapshot(world));
        return fired;
      },
      overclockUpgrade: (upgradeId: WeaponUpgradeId) => {
        const res = overclockWeaponUpgrade(world, upgradeId);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return {
          outcome: res.outcome,
          progression: world.progression,
        };
      },
      awakenUpgrade: (upgradeId: WeaponUpgradeId) => {
        const res = awakenWeaponUpgrade(world, upgradeId);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return {
          outcome: res.outcome,
          progression: world.progression,
        };
      },
      purchaseNeuralProtocol: (protocolId: NeuralProtocolId) => {
        const res = purchaseNeuralProtocol(world, protocolId);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return {
          outcome: res.outcome,
          progression: world.progression,
        };
      },
      resolveStoryChoice: (arcId: StoryArcId, optionId: string) => {
        const ok = resolveStoryArcChoice(world, arcId, optionId);
        if (world.events.length > 0) {
          soundRef.current?.playEvents(world.events);
          sceneRenderer.handleCombatEvents(world.events);
        }
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return ok;
      },
      claimFragmentCache: (cacheId: FragmentCacheId | string) => {
        const ok = claimFragmentCache(world, cacheId);
        if (world.events.length > 0) {
          soundRef.current?.playEvents(world.events);
          sceneRenderer.handleCombatEvents(world.events);
        }
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return ok;
      },
      activateSectorBeacon: (beaconId: SectorBeaconId | string) => {
        const ok = activateSectorBeacon(world, beaconId);
        if (world.events.length > 0) {
          soundRef.current?.playEvents(world.events);
          sceneRenderer.handleCombatEvents(world.events);
        }
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return ok;
      },
      setTacticalWaypoint: (waypoint: TacticalWaypointState | null) => {
        if (waypoint === null) {
          clearTacticalWaypoint(world);
        } else {
          setTacticalWaypoint(world, waypoint);
        }
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        setHud(extractHudSnapshot(world, input.aimYaw));
        return world.exploration.tacticalWaypoint ?? null;
      },
      setCameraSettings: (s: Partial<CameraSettings>) => {
        const updated = input.setCameraSettings(s);
        soundRef.current?.setVolumeSettings(updated);
        setCameraSettings(updated);
        return updated;
      },
      togglePerfOverlay: () => {
        handleTogglePerfOverlay();
        return perfVisibleRef.current;
      },
      interact: (targetId?: InteractableId) => {
        const res = attemptEnvironmentalInteraction(world, targetId);
        if (world.events.length > 0) {
          soundRef.current?.playEvents(world.events);
          sceneRenderer.handleCombatEvents(world.events);
        }
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return res;
      },
      evaluateInteraction: (targetId: InteractableId) =>
        evaluateInteractionTarget(world, targetId),
      completeObjective: (objectiveId: MissionObjectiveId) => {
        const res = completeMissionObjective(world, objectiveId);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return res;
      },
      discoverCodex: (codexId: CodexEntryId) => {
        const res = discoverCodexEntry(world, codexId);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return res;
      },
      discoverSecret: (secretId: SecretAreaId) => {
        const res = discoverSecretArea(world, secretId);
        if (world.events.length > 0) {
          soundRef.current?.playEvents(world.events);
          sceneRenderer.handleCombatEvents(world.events);
        }
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return res;
      },
      triggerNarrativeEvent: (eventId: NarrativeEventId) => {
        const res = triggerNarrativeEvent(world, eventId);
        if (world.events.length > 0) {
          soundRef.current?.playEvents(world.events);
          sceneRenderer.handleCombatEvents(world.events);
        }
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return res;
      },
      projectHoloMemory: () => {
        world.events.length = 0;
        const res = projectChapterHoloMemory(world);
        if (world.events.length > 0) {
          soundRef.current?.playEvents(world.events);
          sceneRenderer.handleCombatEvents(world.events);
        }
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world, input.aimYaw));
        return res;
      },
      dismissHoloMemory: () => {
        const ok = dismissActiveHoloMemory(world);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        setHud(extractHudSnapshot(world, input.aimYaw));
        return ok;
      },
      getExplorationState: () => world.exploration,
      getRendererDiagnostics: () => sceneRenderer.getDiagnostics(),
      startRecursionProtocol: (startLoop = 1) => {
        soundRef.current?.unlock();
        startRecursionProtocol(world, startLoop);
        if (world.events.length > 0) {
          soundRef.current?.playEvents(world.events);
          sceneRenderer.handleCombatEvents(world.events);
        }
        sceneRenderer.syncEnemyRigs(world);
        input.resetCameraAngles();
        sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
        savePersistedCampaignProgress(world);
        document.body.dataset.state = world.appState;
        document.body.dataset.encounter = world.encounterMode;
        document.body.dataset.runMode = world.run.mode;
        setHud(extractHudSnapshot(world, input.aimYaw));
        return world;
      },
      startBossGauntlet: (skipIntro = true) => {
        soundRef.current?.unlock();
        startBossGauntletRun(world, skipIntro);
        if (world.events.length > 0) {
          soundRef.current?.playEvents(world.events);
          sceneRenderer.handleCombatEvents(world.events);
        }
        sceneRenderer.syncEnemyRigs(world);
        input.resetCameraAngles();
        sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
        savePersistedCampaignProgress(world);
        document.body.dataset.state = world.appState;
        document.body.dataset.encounter = world.encounterMode;
        document.body.dataset.runMode = world.run.mode;
        setHud(extractHudSnapshot(world, input.aimYaw));
        return world;
      },
      startExpeditionJourney: (chapter: CampaignChapterId = 'prologue') => {
        soundRef.current?.unlock();
        startExpeditionJourneyRun(world, chapter, false);
        if (world.events.length > 0) {
          soundRef.current?.playEvents(world.events);
          sceneRenderer.handleCombatEvents(world.events);
        }
        sceneRenderer.syncEnemyRigs(world);
        input.resetCameraAngles();
        sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
        savePersistedCampaignProgress(world);
        document.body.dataset.state = world.appState;
        document.body.dataset.encounter = world.encounterMode;
        document.body.dataset.runMode = world.run.mode;
        setHud(extractHudSnapshot(world, input.aimYaw));
        return world;
      },
      triggerExpeditionBreach: () => {
        const ok = triggerExpeditionBreach(world);
        if (ok) {
          if (world.events.length > 0) {
            soundRef.current?.playEvents(world.events);
            sceneRenderer.handleCombatEvents(world.events);
          }
          sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
          setHud(extractHudSnapshot(world, input.aimYaw));
        }
        return ok;
      },
      enterExpeditionAirlock: () => {
        const ok = enterExpeditionTransitAirlock(world);
        if (ok) {
          if (world.events.length > 0) {
            soundRef.current?.playEvents(world.events);
            sceneRenderer.handleCombatEvents(world.events);
          }
          sceneRenderer.syncEnemyRigs(world);
          input.resetCameraAngles();
          sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
          sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
          setHud(extractHudSnapshot(world, input.aimYaw));
        }
        return ok;
      },
      startNewGamePlus: () => {
        soundRef.current?.unlock();
        const cycle = startNewGamePlusRun(world);
        if (world.events.length > 0) {
          soundRef.current?.playEvents(world.events);
          sceneRenderer.handleCombatEvents(world.events);
        }
        sceneRenderer.syncEnemyRigs(world);
        input.resetCameraAngles();
        sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world, input.aimYaw));
        return cycle;
      },
      useSafeRoomMedBay: () => {
        soundRef.current?.unlock();
        const ok = useSafeRoomMedBay(world);
        if (ok) {
          if (world.events.length > 0) {
            soundRef.current?.playEvents(world.events);
            sceneRenderer.handleCombatEvents(world.events);
          }
          sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
          setHud(extractHudSnapshot(world, input.aimYaw));
        }
        return ok;
      },
      claimSafeRoomLysaBriefing: () => {
        soundRef.current?.unlock();
        const ok = claimSafeRoomLysaBriefing(world);
        if (ok) {
          if (world.events.length > 0) {
            soundRef.current?.playEvents(world.events);
            sceneRenderer.handleCombatEvents(world.events);
          }
          sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
          setHud(extractHudSnapshot(world, input.aimYaw));
        }
        return ok;
      },
      claimSecretEchoVault: () => {
        soundRef.current?.unlock();
        const ok = claimSecretEchoVault(world);
        if (ok) {
          if (world.events.length > 0) {
            soundRef.current?.playEvents(world.events);
            sceneRenderer.handleCombatEvents(world.events);
          }
          sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
          savePersistedCampaignProgress(world);
          setHud(extractHudSnapshot(world, input.aimYaw));
        }
        return ok;
      },
      grantOverdriveCharge: (amount = 100) => {
        const ok = grantOverdriveCharge(world, amount);
        setHud(extractHudSnapshot(world, input.aimYaw));
        return ok;
      },
      activateChronoOverdrive: () => {
        soundRef.current?.unlock();
        const ok = attemptActivateChronoOverdrive(world);
        if (ok) {
          if (world.events.length > 0) {
            soundRef.current?.playEvents(world.events);
            sceneRenderer.handleCombatEvents(world.events);
          }
          sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
          setHud(extractHudSnapshot(world, input.aimYaw));
        }
        return ok;
      },
      selectRecursionRelic: (relicId: ChronoRelicId | string) => {
        soundRef.current?.unlock();
        const ok = selectRecursionRelic(world, relicId as ChronoRelicId);
        if (ok) {
          if (world.events.length > 0) {
            soundRef.current?.playEvents(world.events);
            sceneRenderer.handleCombatEvents(world.events);
          }
          sceneRenderer.syncEnemyRigs(world);
          input.resetCameraAngles();
          sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
          savePersistedCampaignProgress(world);
          setHud(extractHudSnapshot(world, input.aimYaw));
        }
        return ok;
      },
      setOverdriveDifficulty: (enabled: boolean) => {
        const ok = setOverdriveDifficulty(world, enabled);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world, input.aimYaw));
        return ok;
      },
      sealTemporalRift: () => {
        const ok = sealTemporalRift(world);
        if (ok) {
          if (world.events.length > 0) {
            soundRef.current?.playEvents(world.events);
            sceneRenderer.handleCombatEvents(world.events);
          }
          sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
          setHud(extractHudSnapshot(world, input.aimYaw));
        }
        return ok;
      },
      getAudioDiagnostics: () => soundRef.current?.getDiagnostics() ?? null,
      equipSkin: (skinId: SeraRigSkinId) => {
        const ok = equipSeraRigSkin(world, skinId);
        if (ok) {
          savePersistedCampaignProgress(world);
          sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
          setHud(extractHudSnapshot(world, input.aimYaw));
        }
        return ok;
      },
      purchaseFabricator: (itemId: FabricatorItemId) => {
        const ok = purchaseFabricatorItem(world, itemId);
        if (ok) {
          if (world.events.length > 0) {
            soundRef.current?.playEvents(world.events);
            sceneRenderer.handleCombatEvents(world.events);
          }
          savePersistedCampaignProgress(world);
          sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
          setHud(extractHudSnapshot(world, input.aimYaw));
        }
        return ok;
      },
      useNanite: () => {
        const ok = useMedNaniteInjector(world);
        if (ok) {
          if (world.events.length > 0) {
            soundRef.current?.playEvents(world.events);
            sceneRenderer.handleCombatEvents(world.events);
          }
          setHud(extractHudSnapshot(world, input.aimYaw));
        }
        return ok;
      },
      toggleMutator: (key: keyof ChronoMutatorState) => {
        const active = toggleChronoMutator(world, key);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world, input.aimYaw));
        return active;
      },
      toggleSpeedrunHud: () => {
        const enabled = toggleSpeedrunHud(world);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world, input.aimYaw));
        return enabled;
      },
      enterParadoxRift: (skipIntro = true) => {
        startEchoZeroParadoxEncounter(world, skipIntro);
        sceneRenderer.syncEnemyRigs(world);
        input.resetCameraAngles();
        sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        setHud(extractHudSnapshot(world, input.aimYaw));
        return world;
      },
      unlockAchievement: (id: ChronoAchievementId) => {
        const ok = unlockChronoAchievement(world, id);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world, input.aimYaw));
        return ok;
      },
      pushTestDamagePopup: (amount: number, kind: DamageNumberKind = 'crit') => {
        const target = world.boss ?? world.enemies[0] ?? world.player;
        if (world.paradox) {
          pushDamagePopup(world.paradox, amount, target.x, 1.9, target.z, kind);
          sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
          setHud(extractHudSnapshot(world, input.aimYaw));
          const projected = computeProjectedPopups(world, sceneRenderer);
          lastPopupCountRef.current = projected.length;
          setProjectedDamagePopups(projected);
        }
      },
      startDailyTrial: (skipIntro = true) => {
        startDailyChronoTrialRun(world, skipIntro);
        sceneRenderer.syncEnemyRigs(world);
        input.resetCameraAngles();
        sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        setHud(extractHudSnapshot(world, input.aimYaw));
        return world;
      },
      unlockScythe: () => {
        const ok = unlockChronoScythe(world);
        savePersistedCampaignProgress(world);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        setHud(extractHudSnapshot(world, input.aimYaw));
        return ok;
      },
      equipModChip: (chipId: WeaponModChipId | null) => {
        const ok = purchaseAndEquipWeaponModChip(world, chipId);
        savePersistedCampaignProgress(world);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        setHud(extractHudSnapshot(world, input.aimYaw));
        return ok;
      },
      triggerFinisher: () => {
        const ok = triggerChronoFinisher(world);
        if (ok) {
          if (world.events.length > 0) {
            soundRef.current?.playEvents(world.events);
            sceneRenderer.handleCombatEvents(world.events);
          }
          sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
          setHud(extractHudSnapshot(world, input.aimYaw));
        }
        return ok;
      },
      setStylePoints: (points: number) => {
        const asc = ensureAscensionState(world);
        asc.style.points = Math.max(0, Math.min(340, points));
        asc.style.tier = computeStyleRankTier(asc.style.points);
        asc.style.peakPoints = Math.max(asc.style.peakPoints, asc.style.points);
        asc.style.decayGraceTimer = 8;
        asc.style.finisherReady = asc.style.tier === 'S' || asc.style.tier === 'SSS';
        asc.style.lastActionLabel = asc.style.tier === 'SSS' ? 'PARADOX COMBO' : 'SYNC STRIKE';
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        setHud(extractHudSnapshot(world, input.aimYaw));
      },
      togglePhotoMode: (patch?: Partial<PhotoModeState>) => {
        const cur = photoModeRef.current;
        const next: PhotoModeState = {
          ...(patch?.active === true && !cur.active ? createInitialPhotoModeState() : cur),
          active: patch?.active !== undefined ? patch.active : !cur.active,
          ...patch,
        };
        photoModeRef.current = next;
        setPhotoMode(next);
        sceneRenderer.setPhotoModeCamera({
          active: next.active,
          yawOffset: next.yawOffset,
          pitchOffset: next.pitchOffset,
          distance: next.distance,
          fov: next.fov,
          showDrone: next.showDrone,
        });
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        return next;
      },
      setLocale: (next: AppLocale) => {
        saveLocale(next);
        setLocale(next);
      },
      claimMasteryBounty: (targetId: MasteryTargetId, kind: MasteryBountyKind) => {
        world.events.length = 0;
        const ok = claimMasteryBountyInWorld(world, targetId, kind);
        if (ok) {
          soundRef.current?.playEvents(world.events);
          sceneRenderer.handleCombatEvents(world.events);
          savePersistedCampaignProgress(world);
          setHud(extractHudSnapshot(world));
        }
        return ok;
      },
      claimAllMasteryBounties: () => {
        world.events.length = 0;
        const n = claimAllMasteryBountiesInWorld(world);
        if (n > 0) {
          soundRef.current?.playEvents(world.events);
          sceneRenderer.handleCombatEvents(world.events);
          savePersistedCampaignProgress(world);
          setHud(extractHudSnapshot(world));
        }
        return n;
      },
      recordMasteryDemo: (targetId: MasteryTargetId, hitless = true) => {
        const res = recordCombatMasteryVictory(world.progression.combatMastery, [targetId], {
          outcome: 'victory',
          chapter: world.run.chapter,
          bossId: world.boss?.id ?? null,
          selectedEnding: null,
          elapsedTime: 24.5,
          enemiesDefeated: 4,
          totalEnemies: 4,
          damageDealt: 920,
          damageTaken: hitless ? 0 : 12,
          parriesLanded: 4,
          perfectDodges: 3,
          vulnerableHits: 5,
          convergencesTriggered: 2,
          relaysUsed: 2,
          remainingTargetHp: 0,
        });
        world.progression.combatMastery = res.ledger;
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return true;
      },
      seedMasterySealDemo: (targetCount = 6) => {
        const capped = Math.max(1, Math.min(MASTERY_TARGETS.length, Math.floor(targetCount)));
        const targetIds = MASTERY_TARGETS.slice(0, capped).map((t) => t.id);
        const res = recordCombatMasteryVictory(world.progression.combatMastery, targetIds, {
          outcome: 'victory',
          chapter: world.run.chapter,
          bossId: world.boss?.id ?? null,
          selectedEnding: null,
          elapsedTime: 18,
          enemiesDefeated: 4,
          totalEnemies: 4,
          damageDealt: 960,
          damageTaken: 0,
          parriesLanded: 4,
          perfectDodges: 3,
          vulnerableHits: 5,
          convergencesTriggered: 2,
          relaysUsed: 2,
          remainingTargetHp: 0,
        });
        world.progression.combatMastery = res.ledger;
        const claimedCount = claimAllMasteryBountiesInWorld(world);
        sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
        return claimedCount;
      },
      triggerTemporalSlip: () => {
        world.events.length = 0;
        world.player.temporalSlipCooldown = 0;
        const seal = computeMasterySealModifiers(world.progression.combatMastery);
        const slip = tryTriggerTemporalSlip(world.player, seal.bonusSlipDurationSec);
        if (slip.triggered) {
          world.events.push(
            { type: 'player_perfect_dodge', x: world.player.x, z: world.player.z },
            {
              type: 'temporal_slip_triggered',
              x: world.player.x,
              z: world.player.z,
              amount: Math.round(slip.durationSec * 100),
            }
          );
          if (seal.tier >= 1) {
            applySovereignAstralPulse(world, seal.tier);
          }
          soundRef.current?.playEvents(world.events);
          sceneRenderer.handleCombatEvents(world.events);
          sceneRenderer.updateAndRender(world, input.aimYaw, input.aimPitch, 0.016);
          setHud(extractHudSnapshot(world));
        }
        return slip.triggered;
      },
      toggleFocusMode: (force?: boolean) => handleToggleFocusMode(force),
    };
    }

    return () => {
      loopDisposed = true;
      cancelAnimationFrame(rafId);
      if (headlessTimerId) {
        clearTimeout(headlessTimerId);
      }
      delete win.__advanceSimulation;
      delete win.__afterframeTest;
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityResume);
      if (combatFlashTimerRef.current !== null) {
        window.clearTimeout(combatFlashTimerRef.current);
        combatFlashTimerRef.current = null;
      }
      unsubscribeMeshy();
      input.detach();
      sceneRenderer.dispose();
      soundRef.current?.dispose();
      soundRef.current = null;
      rendererRef.current = null;
    };
  }, [
    emitSensoryCombatFeedback,
    handleAdvanceNextChapter,
    handleOpenMap,
    handlePauseFromPointerLockLoss,
    handleSelectLoomEnding,
    handleSelectWeapon,
    handleSkipSequenceShortcut,
    handleStartBoss,
    handleStartCampaignFromTitle,
    handleStartOrRestart,
    handleToggleMute,
    handleTogglePause,
    handleTogglePerfOverlay,
    handleToggleTutorial,
  ]);

  useEffect(() => {
    rendererRef.current?.setReducedMotion(cameraSettings.reducedMotion);
    rendererRef.current?.setCameraShake(cameraSettings.cameraShake ?? true);
    rendererRef.current?.setScreenEffects(cameraSettings.screenEffects ?? true);
    rendererRef.current?.applyPerformanceSettings(cameraSettings);
    fpsLimitRef.current = cameraSettings.fpsLimit ?? 60;
    renderScaleRef.current = cameraSettings.renderScale ?? 0.85;
    const nextAdaptive = cameraSettings.adaptiveResolution ?? true;
    if (!nextAdaptive && adaptiveResolutionRef.current) {
      adaptiveGovernorRef.current.dynamicScaleFactor = 1.0;
    }
    adaptiveResolutionRef.current = nextAdaptive;
    cameraShakeRef.current = cameraSettings.cameraShake ?? true;
    screenEffectsRef.current = cameraSettings.screenEffects ?? true;
    reducedMotionRef.current = cameraSettings.reducedMotion;
    const nextPerfHud = Boolean(cameraSettings.showPerfHud);
    perfVisibleRef.current = nextPerfHud;
    if (perfOverlayRef.current) {
      perfOverlayRef.current.style.display = nextPerfHud ? 'block' : 'none';
    }
    forcePausedRerenderRef.current = true;
    soundRef.current?.setVolumeSettings({
      masterVolume: cameraSettings.masterVolume,
      musicVolume: cameraSettings.musicVolume,
      sfxVolume: cameraSettings.sfxVolume,
    });
    document.body.dataset.reducedMotion = String(cameraSettings.reducedMotion);
    document.body.dataset.screenEffects = String(cameraSettings.screenEffects ?? true);
    return () => {
      delete document.body.dataset.reducedMotion;
      delete document.body.dataset.screenEffects;
    };
  }, [
    cameraSettings,
  ]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#07090d]">
      {/* Isolated WebGL Canvas Mount Container (Supports Photo Mode drag-orbit, wheel-zoom & color grade filter) */}
      <div
        ref={canvasMountRef}
        data-testid="arena-canvas-container"
        style={{
          filter: photoMode.active ? getPhotoFilterCss(photoMode.filter) : undefined,
        }}
        onPointerDown={(e) => {
          if (!photoModeRef.current.active) return;
          photoDragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
        }}
        onPointerMove={(e) => {
          if (!photoModeRef.current.active || !photoDragRef.current.active) return;
          const dx = e.clientX - photoDragRef.current.lastX;
          const dy = e.clientY - photoDragRef.current.lastY;
          photoDragRef.current.lastX = e.clientX;
          photoDragRef.current.lastY = e.clientY;
          handleUpdatePhotoMode({
            yawOffset: photoModeRef.current.yawOffset + dx * 0.008,
            pitchOffset: photoModeRef.current.pitchOffset + dy * 0.006,
          });
        }}
        onPointerUp={() => {
          photoDragRef.current.active = false;
        }}
        onPointerLeave={() => {
          photoDragRef.current.active = false;
        }}
        onWheel={(e) => {
          if (!photoModeRef.current.active) return;
          handleUpdatePhotoMode({
            distance: photoModeRef.current.distance + (e.deltaY > 0 ? 0.55 : -0.55),
          });
        }}
        className={`w-full h-full ${photoMode.active ? 'cursor-grab active:cursor-grabbing' : ''}`}
      />

      {/* Projected World-Space Floating Combat Callout Pool Layer (Zero React re-renders) */}
      <div
        ref={calloutMountRef}
        data-testid="combat-callout-layer"
        className="fixed inset-0 z-[6] pointer-events-none overflow-hidden select-none"
      />

      {/* Peripheral Parry / Convergence / Dodge / Damage Edge Flash (Zero React re-renders) */}
      <div
        ref={combatFlashRef}
        data-testid="combat-screen-flash"
        data-tone="none"
        style={{ opacity: 0 }}
        className="fixed inset-0 z-[7] pointer-events-none select-none"
        aria-hidden="true"
      />

      {/* Projected 60fps Tactical Target Lock-On Diamond Reticle (Zero React re-renders) */}
      <div
        ref={lockOnReticleRef}
        data-testid="lock-on-reticle"
        data-active="false"
        data-staggered="false"
        style={{ opacity: 0 }}
        className="group/reticle fixed left-0 top-0 z-[8] pointer-events-none select-none will-change-transform"
        aria-hidden="true"
      >
        <div className="relative w-11 h-11 flex items-center justify-center">
          <div className="w-7 h-7 rotate-45 border-2 border-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.65)] group-data-[staggered=true]/reticle:border-amber-300 group-data-[staggered=true]/reticle:shadow-[0_0_20px_rgba(251,191,36,0.9)]" />
          <div className="absolute w-1.5 h-1.5 bg-white rotate-45 group-data-[staggered=true]/reticle:bg-amber-300" />
          <span className="hidden group-data-[staggered=true]/reticle:block absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[9px] font-mono-tabular font-bold uppercase tracking-wider whitespace-nowrap">
            [E] EXEC
          </span>
        </div>
      </div>

      {/* Development-Only Performance Overlay (Toggled by F3, hidden by default, zero React re-renders) */}
      <div
        ref={perfOverlayRef}
        data-testid="dev-perf-overlay"
        style={{ display: 'none' }}
        className="fixed bottom-12 left-4 z-40 pointer-events-none bg-[#06090f]/90 border border-cyan-500/40 px-2.5 py-1 text-[11px] font-mono-tabular text-cyan-300 tracking-wider shadow-md"
      >
        FPS: -- · FRAME: --ms
      </div>

      {/* Title Screen Overlay */}
      {hud.appState === 'title' && (
        <TitleScreen
          onStartCampaign={handleStartCampaignFromTitle}
          onStartExpeditionJourney={() => handleStartExpeditionJourney('prologue')}
          onStartNewGamePlus={handleStartNewGamePlus}
          onStartPracticeStandard={handleStartPracticeStandard}
          onStartRecursion={() => handleStartRecursionProtocol(1)}
          onStartBossGauntlet={() => handleStartBossGauntlet(false)}
          onToggleOverdrive={handleToggleOverdriveDifficulty}
          onSelectDifficultyTier={handleSelectDifficultyTier}
          onStartBoss={handleStartBoss}
          unlockedChapters={hud.run.unlockedChapters}
          completedChapters={hud.run.completedChapters}
          recoveredLogs={hud.run.recoveredLogs}
          completedEndings={hud.run.completedEndings}
          activeChapter={hud.run.chapter}
          savedCampaignChapter={
            hud.run.savedCampaignSnapshot
              ? hud.run.savedCampaignSnapshot.stage === 'completed' &&
                hud.run.savedCampaignSnapshot.pendingNextChapter
                ? hud.run.savedCampaignSnapshot.pendingNextChapter
                : hud.run.savedCampaignSnapshot.chapter
              : null
          }
          savedCampaignCheckpoint={hud.run.savedCampaignSnapshot?.bossCheckpoint ?? null}
          onSelectCampaignChapter={handleSelectCampaignChapter}
          hasSavedCampaignSnapshot={Boolean(
            hud.run.savedCampaignSnapshot &&
              hud.run.savedCampaignSnapshot.selectedEnding === null
          )}
          onRestoreSavedCampaign={handleRestoreSavedCampaign}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          tutorialEnabled={hud.tutorial.enabled}
          onToggleTutorial={handleToggleTutorial}
          cameraSettings={cameraSettings}
          onUpdateCameraSettings={handleUpdateCameraSettings}
          progression={hud.progression}
          exploration={hud.exploration}
          equippedWeaponId={hud.weapon.equippedWeaponId}
          onSelectWeapon={handleSelectWeapon}
          onPurchaseUpgrade={handlePurchaseUpgrade}
          onEquipUpgrade={handleEquipUpgrade}
          onPurchaseRigModule={handlePurchaseRigModule}
          onEquipRigModule={handleEquipRigModule}
          onOverclockRigModule={handleOverclockRigModule}
          onSetSentinelProtocol={handleSetSentinelProtocol}
          onSetEchoDoctrine={handleSetEchoDoctrine}
          onUnlockBossCore={handleUnlockBossCore}
          onEquipBossCore={handleEquipBossCore}
          onTranscendBossCore={handleTranscendBossCore}
          onSaveLoadoutPreset={handleSaveLoadoutPreset}
          onApplyLoadoutPreset={handleApplyLoadoutPreset}
          onOverclockUpgrade={handleOverclockUpgrade}
          onAwakenUpgrade={handleAwakenUpgrade}
          onPurchaseNeuralProtocol={handlePurchaseNeuralProtocol}
          onEquipSkin={handleEquipSkin}
          onToggleMutator={handleToggleMutator}
          onToggleSpeedrunHud={handleToggleSpeedrunHud}
          onStartEchoZero={handleEnterParadoxRift}
          locale={locale}
          onToggleLocale={handleToggleLocale}
          dailyTrialConfig={dailyTrialConfig}
          dailyTrialRecord={dailyTrialRecord}
          onStartDailyTrial={handleStartDailyTrial}
          onUnlockChronoScythe={handleUnlockChronoScythe}
          onEquipModChip={handleEquipModChip}
          onClaimMasteryBounty={handleClaimMasteryBounty}
          onClaimAllMasteryBounties={handleClaimAllMasteryBounties}
        />
      )}

      {/* Active Gameplay Low-Occlusion HUD */}
      {hud.appState !== 'title' && (
        <GameHud
          hud={hud}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onTogglePause={handleTogglePause}
          onOpenMap={handleOpenMap}
          onOpenArmory={handleOpenArmory}
          onRestart={handleStartOrRestart}
          onStartBoss={() => handleStartBoss('helix-04')}
          onSkipIntro={handleSkipIntro}
          onSkipTransition={handleSkipTransition}
          onSkipBossIntro={handleSkipBossIntro}
          onDismissComms={handleDismissComms}
          onDismissHoloMemory={handleDismissHoloMemory}
          onToggleTutorial={handleToggleTutorial}
          onEchoRecord={handleEchoRecord}
          onEchoReplay={handleEchoReplay}
          onEchoClear={handleEchoClear}
          onEchoRelay={handleEchoRelay}
          onLightAttack={handleLightAttack}
          onHeavyAttack={handleHeavyAttack}
          onDodge={handleDodge}
          onParry={handleParry}
          onGravityPin={handleGravityPin}
          onEchoCollapse={handleEchoCollapse}
          onTriggerOverdrive={handleTriggerChronoOverdrive}
          onTriggerExpeditionBreach={handleTriggerExpeditionBreach}
          onEnterExpeditionAirlock={handleEnterExpeditionAirlock}
          onSafeRoomMedBay={handleSafeRoomMedBay}
          onSafeRoomLysaBriefing={handleSafeRoomLysaBriefing}
          onClaimSecretVault={handleClaimSecretVault}
          projectedDamagePopups={projectedDamagePopups}
          onUseNanite={handleUseNanite}
          onPurchaseFabricator={handlePurchaseFabricator}
          onEnterParadoxRift={handleEnterParadoxRift}
          onToggleLockOn={handleToggleLockOn}
          onCycleLockOn={handleCycleLockOn}
          onSwitchWeapon={handleSwitchWeapon}
          onSelectWeapon={handleSelectWeapon}
          onInteract={handleInteract}
          onEngageWardenPrime={handleEngageWardenPrime}
          onSelectLoomEnding={handleSelectLoomEnding}
          onSelectRecursionRelic={handleSelectRecursionRelic}
          onRestoreCampaign={handleRestoreSavedCampaign}
          onResolveStoryChoice={handleResolveStoryChoice}
          cameraSettings={cameraSettings}
          onTouchMoveHold={handleTouchMoveHold}
          onTouchMovePulse={handleTouchMovePulse}
          onTouchCameraStart={handleTouchCameraStart}
          onTouchCameraMove={handleTouchCameraMove}
          onTouchCameraEnd={handleTouchCameraEnd}
          locale={locale}
          onToggleLocale={handleToggleLocale}
          onTriggerChronoFinisher={handleTriggerChronoFinisher}
          onCycleSentinelProtocol={handleCycleSentinelProtocol}
          onCycleEchoDoctrine={handleCycleEchoDoctrine}
          onTriggerConfluenceBurst={handleTriggerConfluenceBurst}
          photoMode={photoMode}
          onTogglePhotoMode={handleTogglePhotoMode}
          onUpdatePhotoMode={handleUpdatePhotoMode}
          onCapturePhoto={handleCapturePhoto}
          focusMode={focusMode}
          onToggleFocusMode={handleToggleFocusMode}
        />
      )}

      {/* Pause / Victory / Defeat Focused Modal */}
      {(hud.appState === 'paused' || hud.appState === 'gameover') && (
        <StatusModal
          appState={hud.appState}
          encounterMode={hud.encounterMode}
          runMode={hud.run.mode}
          chapter={hud.run.chapter}
          pendingNextChapter={hud.run.pendingNextChapter}
          hasSavedCampaignSnapshot={Boolean(
            hud.run.savedCampaignSnapshot &&
              hud.run.savedCampaignSnapshot.selectedEnding === null
          )}
          savedCampaignChapter={
            hud.run.savedCampaignSnapshot
              ? hud.run.savedCampaignSnapshot.stage === 'completed' &&
                hud.run.savedCampaignSnapshot.pendingNextChapter
                ? hud.run.savedCampaignSnapshot.pendingNextChapter
                : hud.run.savedCampaignSnapshot.chapter
              : null
          }
          savedCampaignCheckpoint={hud.run.savedCampaignSnapshot?.bossCheckpoint ?? null}
          bossCheckpoint={hud.run.bossCheckpoint}
          recoveredLogs={hud.run.recoveredLogs}
          completedEndings={hud.run.completedEndings}
          outcome={hud.outcome}
          summary={hud.summary}
          elapsedTime={hud.elapsedTime}
          enemiesDefeated={hud.totalEnemies - hud.enemiesAlive}
          totalEnemies={hud.totalEnemies}
          progression={hud.progression}
          exploration={hud.exploration}
          radar={hud.radar}
          recursion={hud.recursion}
          gauntlet={hud.gauntlet}
          temporalRift={hud.temporalRift}
          onToggleOverdrive={handleToggleOverdriveDifficulty}
          onSelectDifficultyTier={handleSelectDifficultyTier}
          equippedWeaponId={hud.weapon.equippedWeaponId}
          onSelectWeapon={handleSelectWeapon}
          onPurchaseUpgrade={handlePurchaseUpgrade}
          onEquipUpgrade={handleEquipUpgrade}
          onOverclockUpgrade={handleOverclockUpgrade}
          onAwakenUpgrade={handleAwakenUpgrade}
          onEquipModChip={handleEquipModChip}
          onPurchaseRigModule={handlePurchaseRigModule}
          onEquipRigModule={handleEquipRigModule}
          onOverclockRigModule={handleOverclockRigModule}
          onSetSentinelProtocol={handleSetSentinelProtocol}
          onSetEchoDoctrine={handleSetEchoDoctrine}
          onUnlockBossCore={handleUnlockBossCore}
          onEquipBossCore={handleEquipBossCore}
          onTranscendBossCore={handleTranscendBossCore}
          onSaveLoadoutPreset={handleSaveLoadoutPreset}
          onApplyLoadoutPreset={handleApplyLoadoutPreset}
          onPurchaseNeuralProtocol={handlePurchaseNeuralProtocol}
          onResolveStoryChoice={handleResolveStoryChoice}
          onSetTacticalWaypoint={handleSetTacticalWaypoint}
          cameraSettings={cameraSettings}
          onUpdateCameraSettings={handleUpdateCameraSettings}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPlayCodexAudio={handlePlayCodexAudio}
          tutorialEnabled={hud.tutorial.enabled}
          onToggleTutorial={handleToggleTutorial}
          initialExplorationTab={initialExplorationTab}
          onResume={handleTogglePause}
          onRestart={handleStartOrRestart}
          onAdvanceNextChapter={handleAdvanceNextChapter}
          onRestoreSavedCampaign={handleRestoreSavedCampaign}
          onRetryBossCheckpoint={handleRetryBossCheckpoint}
          onRestartFullRun={handleRestartFullRun}
          onStartBoss={() => handleStartBoss('helix-04')}
          onReturnToTitle={handleReturnToTitle}
          unlockedChapters={hud.run.unlockedChapters}
          completedChapters={hud.run.completedChapters}
          onJumpToExpeditionSector={handleJumpToExpeditionSector}
          onStartNewGamePlus={handleStartNewGamePlus}
          paradox={hud.paradox}
          onEquipSkin={handleEquipSkin}
          onPurchaseFabricator={handlePurchaseFabricator}
          onToggleMutator={handleToggleMutator}
          onToggleSpeedrunHud={handleToggleSpeedrunHud}
          onClaimMasteryBounty={handleClaimMasteryBounty}
          onClaimAllMasteryBounties={handleClaimAllMasteryBounties}
          locale={locale}
        />
      )}
    </main>
  );
}
