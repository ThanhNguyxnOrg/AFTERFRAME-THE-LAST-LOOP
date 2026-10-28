/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { GameHud } from './components/GameHud.tsx';
import { StatusModal } from './components/StatusModal.tsx';
import { TitleScreen } from './components/TitleScreen.tsx';
import { SoundEngine } from './game/audio.ts';
import { InputController } from './game/input.ts';
import { ArenaSceneRenderer } from './game/renderer.ts';
import {
  advanceCampaignChapter,
  createBossWorld,
  createInitialWorld,
  dismissActiveTransmission,
  extractHudSnapshot,
  forceBossAttack,
  parseAndApplyCampaignProgress,
  resetWorldForPlaying,
  resetWorldForStandardPlaying,
  restoreSavedCampaignProgress,
  retryBossFromCheckpoint,
  selectChronicleLoomEnding,
  serializeCampaignProgress,
  skipBossIntroBanner,
  skipCampaignIntro,
  skipContainmentTransition,
  startBossEncounter,
  startCampaignChapterSelect,
  startCampaignRun,
  startPracticeStandardRun,
  stepWorld,
  toggleTutorialHints,
  transitionCampaignToBoss,
} from './game/simulation.ts';
import type {
  BossAttackType,
  BossEncounterId,
  CameraSettings,
  CampaignChapterId,
  ChronicleLoomEndingId,
  GameAppState,
  HudSnapshot,
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

const CAMPAIGN_STORAGE_KEY = 'afterframe_campaign_progress_v1';

function loadPersistedCampaignProgress(world: WorldState): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(CAMPAIGN_STORAGE_KEY);
    parseAndApplyCampaignProgress(world, raw);
  } catch {
    // Ignore storage read errors in restricted environments
  }
}

function savePersistedCampaignProgress(world: WorldState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      CAMPAIGN_STORAGE_KEY,
      serializeCampaignProgress(world)
    );
  } catch {
    // Ignore storage write errors in restricted environments
  }
}

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const perfOverlayRef = useRef<HTMLDivElement | null>(null);
  const perfVisibleRef = useRef<boolean>(false);

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
  const [isMuted, setIsMuted] = useState<boolean>(() =>
    soundRef.current ? soundRef.current.isMuted() : false
  );
  const [cameraSettings, setCameraSettings] = useState<CameraSettings>(() =>
    inputRef.current
      ? inputRef.current.getCameraSettings()
      : { sensitivity: 1.0, invertY: false }
  );

  const syncDomAndReactHud = useCallback(() => {
    const w = worldRef.current;
    if (!w) return;
    document.body.dataset.state = w.appState;
    document.body.dataset.encounter = w.encounterMode;
    document.body.dataset.runMode = w.run.mode;
    savePersistedCampaignProgress(w);
    setHud(extractHudSnapshot(w));
  }, []);

  const syncRendererAndCamera = useCallback(() => {
    const w = worldRef.current;
    const input = inputRef.current;
    const renderer = rendererRef.current;
    if (!w) return;

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
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w) return;

    startCampaignRun(w, false);
    if (w.events.length > 0) {
      soundRef.current?.playEvents(w.events);
      renderer?.handleCombatEvents(w.events);
    }
    syncRendererAndCamera();
    syncDomAndReactHud();
  }, [syncDomAndReactHud, syncRendererAndCamera]);

  const handleStartPracticeStandard = useCallback(() => {
    const w = worldRef.current;
    const renderer = rendererRef.current;
    if (!w) return;

    startPracticeStandardRun(w);
    if (w.events.length > 0) {
      soundRef.current?.playEvents(w.events);
      renderer?.handleCombatEvents(w.events);
    }
    syncRendererAndCamera();
    syncDomAndReactHud();
  }, [syncDomAndReactHud, syncRendererAndCamera]);

  const handleStartOrRestart = useCallback(() => {
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

      if (selectChronicleLoomEnding(w, endingId)) {
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
    [syncDomAndReactHud]
  );

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
    const nextMuted = soundRef.current.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  const handleUpdateCameraSettings = useCallback((next: Partial<CameraSettings>) => {
    if (!inputRef.current) return;
    const updated = inputRef.current.setCameraSettings(next);
    setCameraSettings(updated);
  }, []);

  const handleTogglePerfOverlay = useCallback(() => {
    perfVisibleRef.current = !perfVisibleRef.current;
    if (perfOverlayRef.current) {
      perfOverlayRef.current.style.display = perfVisibleRef.current ? 'block' : 'none';
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

  const handleTouchMoveHold = useCallback((dx: number, dz: number) => {
    inputRef.current?.setTouchMoveHold(dx, dz);
  }, []);

  const handleTouchMovePulse = useCallback((dx: number, dz: number) => {
    inputRef.current?.triggerTouchMovePulse(dx, dz);
  }, []);

  useEffect(() => {
    const mountEl = canvasMountRef.current;
    const world = worldRef.current;
    const input = inputRef.current;
    if (!mountEl || !world || !input) return;

    document.body.dataset.state = world.appState;
    document.body.dataset.encounter = world.encounterMode;
    document.body.dataset.runMode = world.run.mode;

    const sceneRenderer = new ArenaSceneRenderer(mountEl, world);
    rendererRef.current = sceneRenderer;

    input.attach(mountEl, {
      onPauseToggle: handleTogglePause,
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
    });

    const handleResize = () => {
      if (!canvasMountRef.current) return;
      sceneRenderer.resize(
        canvasMountRef.current.clientWidth || window.innerWidth,
        canvasMountRef.current.clientHeight || window.innerHeight
      );
      input.updateCanvasBounds();
    };
    window.addEventListener('resize', handleResize);

    let rafId = 0;
    let lastTime = performance.now();
    let lastHudSyncTime = 0;
    let lastPerfUpdateTime = 0;
    let frameCount = 0;
    let accumFrameMs = 0;
    let accumExecMs = 0;
    let prevIntegrity = world.player.integrity;
    let prevAppState = world.appState;
    let prevEncounterMode = world.encounterMode;
    let prevRunStage = world.run.stage;
    let prevRunChapter = world.run.chapter;
    let prevPendingNextChapter = world.run.pendingNextChapter;
    let prevTutorialStep = world.tutorial.step;
    let prevTutorialEnabled = world.tutorial.enabled;
    let prevTutorialStuck = world.tutorial.stuckHintActive;
    let prevOutcome = world.outcome;
    let prevEchoState = world.echo.state;
    let prevPlateActive = world.pressurePlate.active;
    let prevPuzzleStage = world.puzzle.stage;
    let prevReceiverCharged = world.puzzle.heavyReceiver.charged;
    let prevCombinePlateActive = world.puzzle.combinePlate.active;
    let prevFinalBarrierOpen = world.puzzle.finalBarrier.open;
    let prevCanRelay = world.relay.preview.canRelay;
    let prevRelayStatus = world.relay.preview.status;
    let prevRelayCount = world.relay.activationCount;
    let prevResonanceStatus = world.resonance.status;
    let prevResonanceMarkId = world.resonance.activeMark?.markId ?? null;
    let prevConvergenceCount = world.resonance.convergenceCount;
    let prevBossPhase = world.boss?.phase ?? null;
    let prevBossState = world.boss?.aiState ?? null;
    let prevBossAttack = world.boss?.activeAttack ?? null;
    let prevBossCoreExposed = world.boss?.coreExposed ?? false;
    let prevBossHp = world.boss?.hp ?? 0;
    let prevCommsId = world.comms.active?.id ?? null;

    const handleVisibilityResume = () => {
      if (!document.hidden) {
        lastTime = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityResume);

    const stepAndRender = (now: number) => {
      const execStart = performance.now();
      const rawMs = now - lastTime;
      lastTime = now;

      const dt = Math.min(Math.max(rawMs / 1000, 0.001), 0.25);

      const beforeEncounterMode = world.encounterMode;
      const beforeBossId = world.boss?.id ?? null;
      const frameInput = input.consumeFrameInput(dt);
      stepWorld(world, frameInput, dt);

      // If the simulation transitioned between Calibration Bay ('standard') and a boss encounter,
      // synchronize the 3D enemy rigs and snap camera behind Sera facing the boss
      if (world.encounterMode !== beforeEncounterMode || (world.boss?.id ?? null) !== beforeBossId) {
        sceneRenderer.syncEnemyRigs(world);
        input.resetCameraAngles();
        sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
      }

      // Release pointer lock automatically when transitioning into gameover modal
      if (world.appState === 'gameover' && prevAppState !== 'gameover') {
        input.exitPointerLock();
      }

      if (world.events.length > 0) {
        soundRef.current?.playEvents(world.events);
        sceneRenderer.handleCombatEvents(world.events);
      }

      sceneRenderer.updateAndRender(
        world,
        input.aimYaw,
        input.aimPitch,
        dt
      );

      // Track rolling frame interval & synchronous execution time for F3 dev overlay
      const execEnd = performance.now();
      const execMs = execEnd - execStart;
      frameCount += 1;
      accumFrameMs += Math.min(Math.max(rawMs, 1), 100);
      accumExecMs += execMs;
      if (perfVisibleRef.current && perfOverlayRef.current && now - lastPerfUpdateTime >= 200) {
        const avgMs = accumFrameMs / Math.max(1, frameCount);
        const avgExecMs = accumExecMs / Math.max(1, frameCount);
        const approxFps = 1000 / Math.max(0.1, avgMs);
        const lockLabel = input.isPointerLockActive() ? 'LOCKED' : 'UNLOCKED';
        perfOverlayRef.current.textContent = `FPS: ${approxFps.toFixed(0)} · FRAME: ${avgMs.toFixed(1)}ms (CPU: ${avgExecMs.toFixed(1)}ms) · DPR: ${sceneRenderer.getAppliedPixelRatio().toFixed(2)} · PTR: ${lockLabel}`;
        lastPerfUpdateTime = now;
        frameCount = 0;
        accumFrameMs = 0;
        accumExecMs = 0;
      }

      const currMarkId = world.resonance.activeMark?.markId ?? null;
      const currBossPhase = world.boss?.phase ?? null;
      const currBossState = world.boss?.aiState ?? null;
      const currBossAttack = world.boss?.activeAttack ?? null;
      const currBossCoreExposed = world.boss?.coreExposed ?? false;
      const currBossHp = Math.ceil(world.boss?.hp ?? 0);
      const currCommsId = world.comms.active?.id ?? null;

      const stateChanged =
        world.appState !== prevAppState ||
        world.encounterMode !== prevEncounterMode ||
        world.run.stage !== prevRunStage ||
        world.run.chapter !== prevRunChapter ||
        world.run.pendingNextChapter !== prevPendingNextChapter ||
        world.tutorial.step !== prevTutorialStep ||
        world.tutorial.enabled !== prevTutorialEnabled ||
        world.tutorial.stuckHintActive !== prevTutorialStuck ||
        world.outcome !== prevOutcome ||
        world.echo.state !== prevEchoState ||
        world.pressurePlate.active !== prevPlateActive ||
        world.puzzle.stage !== prevPuzzleStage ||
        world.puzzle.heavyReceiver.charged !== prevReceiverCharged ||
        world.puzzle.combinePlate.active !== prevCombinePlateActive ||
        world.puzzle.finalBarrier.open !== prevFinalBarrierOpen ||
        world.relay.preview.canRelay !== prevCanRelay ||
        world.relay.preview.status !== prevRelayStatus ||
        world.relay.activationCount !== prevRelayCount ||
        world.resonance.status !== prevResonanceStatus ||
        currMarkId !== prevResonanceMarkId ||
        world.resonance.convergenceCount !== prevConvergenceCount ||
        currBossPhase !== prevBossPhase ||
        currBossState !== prevBossState ||
        currBossAttack !== prevBossAttack ||
        currBossCoreExposed !== prevBossCoreExposed ||
        currBossHp !== prevBossHp ||
        currCommsId !== prevCommsId ||
        Math.ceil(world.player.integrity) !== Math.ceil(prevIntegrity);

      if (stateChanged || now - lastHudSyncTime >= 100) {
        lastHudSyncTime = now;
        prevIntegrity = world.player.integrity;
        prevAppState = world.appState;
        prevEncounterMode = world.encounterMode;
        prevRunStage = world.run.stage;
        prevRunChapter = world.run.chapter;
        prevPendingNextChapter = world.run.pendingNextChapter;
        prevTutorialStep = world.tutorial.step;
        prevTutorialEnabled = world.tutorial.enabled;
        prevTutorialStuck = world.tutorial.stuckHintActive;
        prevOutcome = world.outcome;
        prevEchoState = world.echo.state;
        prevPlateActive = world.pressurePlate.active;
        prevPuzzleStage = world.puzzle.stage;
        prevReceiverCharged = world.puzzle.heavyReceiver.charged;
        prevCombinePlateActive = world.puzzle.combinePlate.active;
        prevFinalBarrierOpen = world.puzzle.finalBarrier.open;
        prevCanRelay = world.relay.preview.canRelay;
        prevRelayStatus = world.relay.preview.status;
        prevRelayCount = world.relay.activationCount;
        prevResonanceStatus = world.resonance.status;
        prevResonanceMarkId = currMarkId;
        prevConvergenceCount = world.resonance.convergenceCount;
        prevBossPhase = currBossPhase;
        prevBossState = currBossState;
        prevBossAttack = currBossAttack;
        prevBossCoreExposed = currBossCoreExposed;
        prevBossHp = currBossHp;
        prevCommsId = currCommsId;
        document.body.dataset.state = world.appState;
        document.body.dataset.encounter = world.encounterMode;
        document.body.dataset.runMode = world.run.mode;
        savePersistedCampaignProgress(world);
        setHud(extractHudSnapshot(world));
      }
    };

    const isHeadless = sceneRenderer.isHeadlessBrowser();
    let headlessTimerId = 0;
    const tick = (now: number) => {
      stepAndRender(now);
      if (isHeadless) {
        headlessTimerId = window.setTimeout(() => {
          rafId = requestAnimationFrame(tick);
        }, 120);
      } else {
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
        startPracticeStandardRun: () => WorldState;
        startBossEncounter: (skipIntro?: boolean, bossId?: BossEncounterId) => WorldState;
        advanceCampaignChapter: (skipBossIntro?: boolean) => WorldState;
        startCampaignChapterSelect: (
          chapter: CampaignChapterId,
          skipIntro?: boolean
        ) => WorldState;
        restoreSavedCampaignProgress: () => WorldState;
        selectChronicleLoomEnding: (ending: ChronicleLoomEndingId) => WorldState;
        skipBossIntroBanner: () => WorldState;
        dismissActiveTransmission: () => WorldState;
        retryBossCheckpoint: (skipIntro?: boolean) => WorldState;
        forceBossAttack: (attack: BossAttackType) => WorldState;
        rotateCamera: (dx: number, dy: number) => { aimYaw: number; aimPitch: number };
        setCameraSettings: (s: Partial<CameraSettings>) => CameraSettings;
        togglePerfOverlay: () => boolean;
      };
    };

    win.__advanceSimulation = (seconds: number, renderAtEnd = true) => {
      const steps = Math.max(1, Math.ceil(seconds / 0.02));
      const stepDt = seconds / steps;
      for (let i = 0; i < steps; i++) {
        const beforeMode = world.encounterMode;
        const frameInput = input.consumeFrameInput(stepDt);
        stepWorld(world, frameInput, stepDt);
        if (world.encounterMode !== beforeMode) {
          sceneRenderer.syncEnemyRigs(world);
          input.resetCameraAngles();
          sceneRenderer.snapCameraToPlayer(world, input.aimYaw, input.aimPitch);
        }
        if (world.events.length > 0) {
          soundRef.current?.playEvents(world.events);
          sceneRenderer.handleCombatEvents(world.events);
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
      startPracticeStandardRun: () => {
        input.exitPointerLock();
        startPracticeStandardRun(world);
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
      setCameraSettings: (s: Partial<CameraSettings>) => {
        const updated = input.setCameraSettings(s);
        setCameraSettings(updated);
        return updated;
      },
      togglePerfOverlay: () => {
        handleTogglePerfOverlay();
        return perfVisibleRef.current;
      },
    };

    return () => {
      cancelAnimationFrame(rafId);
      if (headlessTimerId) {
        clearTimeout(headlessTimerId);
      }
      delete win.__advanceSimulation;
      delete win.__afterframeTest;
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityResume);
      input.detach();
      sceneRenderer.dispose();
      rendererRef.current = null;
    };
  }, [
    handleAdvanceNextChapter,
    handlePauseFromPointerLockLoss,
    handleSelectLoomEnding,
    handleSkipSequenceShortcut,
    handleStartBoss,
    handleStartCampaignFromTitle,
    handleStartOrRestart,
    handleToggleMute,
    handleTogglePause,
    handleTogglePerfOverlay,
    handleToggleTutorial,
  ]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#07090d]">
      {/* Isolated WebGL Canvas Mount Container */}
      <div
        ref={canvasMountRef}
        data-testid="arena-canvas-container"
        className="w-full h-full"
      />

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
          onStartPracticeStandard={handleStartPracticeStandard}
          onStartBoss={handleStartBoss}
          unlockedChapters={hud.run.unlockedChapters}
          completedChapters={hud.run.completedChapters}
          recoveredLogs={hud.run.recoveredLogs}
          completedEndings={hud.run.completedEndings}
          activeChapter={hud.run.chapter}
          savedCampaignChapter={hud.run.savedCampaignSnapshot?.chapter ?? null}
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
        />
      )}

      {/* Active Gameplay Low-Occlusion HUD */}
      {hud.appState !== 'title' && (
        <GameHud
          hud={hud}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onTogglePause={handleTogglePause}
          onRestart={handleStartOrRestart}
          onStartBoss={() => handleStartBoss('helix-04')}
          onSkipIntro={handleSkipIntro}
          onSkipTransition={handleSkipTransition}
          onSkipBossIntro={handleSkipBossIntro}
          onDismissComms={handleDismissComms}
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
          onSelectLoomEnding={handleSelectLoomEnding}
          onRestoreCampaign={handleRestoreSavedCampaign}
          onTouchMoveHold={handleTouchMoveHold}
          onTouchMovePulse={handleTouchMovePulse}
        />
      )}

      {/* Pause / Victory / Defeat Focused Modal */}
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
        bossCheckpoint={hud.run.bossCheckpoint}
        recoveredLogs={hud.run.recoveredLogs}
        completedEndings={hud.run.completedEndings}
        outcome={hud.outcome}
        summary={hud.summary}
        elapsedTime={hud.elapsedTime}
        enemiesDefeated={hud.totalEnemies - hud.enemiesAlive}
        totalEnemies={hud.totalEnemies}
        cameraSettings={cameraSettings}
        onUpdateCameraSettings={handleUpdateCameraSettings}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        tutorialEnabled={hud.tutorial.enabled}
        onToggleTutorial={handleToggleTutorial}
        onResume={handleTogglePause}
        onRestart={handleStartOrRestart}
        onAdvanceNextChapter={handleAdvanceNextChapter}
        onRestoreSavedCampaign={handleRestoreSavedCampaign}
        onRetryBossCheckpoint={handleRetryBossCheckpoint}
        onRestartFullRun={handleRestartFullRun}
        onStartBoss={() => handleStartBoss('helix-04')}
        onReturnToTitle={handleReturnToTitle}
      />
    </main>
  );
}
