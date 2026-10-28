import { GAME_CONFIG } from './config.ts';
import type { CameraSettings, PlayerInputFrame } from './types.ts';
import { wrapAngle } from './simulation.ts';

const CAMERA_SETTINGS_STORAGE_KEY = 'afterframe_camera_settings_v1';

export class InputController {
  private heldKeys = new Set<string>();
  private justPressedKeys = new Set<string>();
  private leftMouseDown = false;
  private leftMouseJustPressed = false;
  private leftMouseJustReleased = false;
  private rightMouseJustPressed = false;

  public aimYaw: number = GAME_CONFIG.camera.defaultYaw;
  public aimPitch: number = GAME_CONFIG.camera.defaultPitch;

  private settings: CameraSettings = {
    sensitivity: 1.0,
    invertY: false,
    reducedMotion: false,
  };

  private lastPointerX: number | null = null;
  private lastPointerY: number | null = null;
  private isDraggingCamera = false;
  private cameraDragJustStarted = false;
  private dragDistancePx = 0;
  private pointerLocked = false;

  private touchHoldX = 0;
  private touchHoldZ = 0;
  private touchMovePointerId: number | null = null;
  private touchPulseX = 0;
  private touchPulseZ = 0;
  private touchPulseTimer = 0;

  private touchCameraPointerId: number | null = null;
  private touchCameraSource: 'pointer' | 'touch' | null = null;
  private touchCameraLastX: number | null = null;
  private touchCameraLastY: number | null = null;
  private touchCameraActive = false;

  private canvasEl: HTMLElement | null = null;

  private onKeyDownBound: (e: KeyboardEvent) => void;
  private onKeyUpBound: (e: KeyboardEvent) => void;
  private onMouseDownBound: (e: MouseEvent) => void;
  private onMouseUpBound: (e: MouseEvent) => void;
  private onMouseMoveBound: (e: MouseEvent) => void;
  private onContextMenuBound: (e: MouseEvent) => void;
  private onBlurBound: () => void;
  private onVisibilityChangeBound: () => void;
  private onPointerLockChangeBound: () => void;
  private onPointerLockErrorBound: () => void;

  private onPauseToggleCallback: (() => void) | null = null;
  private onPointerLockLostCallback: (() => void) | null = null;
  private onRestartCallback: (() => void) | null = null;
  private onMuteCallback: (() => void) | null = null;
  private onStartGameCallback: (() => void) | null = null;
  private onStartBossCallback: (() => void) | null = null;
  private onTogglePerfOverlayCallback: (() => void) | null = null;
  private onToggleTutorialCallback: (() => void) | null = null;
  private onSkipSequenceCallback: (() => boolean) | null = null;
  private onAdvanceChapterCallback: (() => boolean) | null = null;
  private onSelectLoomEndingCallback: ((endingId: 'silence' | 'witness' | 'continuity') => boolean) | null = null;

  constructor() {
    this.loadSettings();
    this.onKeyDownBound = this.handleKeyDown.bind(this);
    this.onKeyUpBound = this.handleKeyUp.bind(this);
    this.onMouseDownBound = this.handleMouseDown.bind(this);
    this.onMouseUpBound = this.handleMouseUp.bind(this);
    this.onMouseMoveBound = this.handleMouseMove.bind(this);
    this.onContextMenuBound = (e: MouseEvent) => e.preventDefault();
    this.onBlurBound = this.clearAllInputs.bind(this);
    this.onVisibilityChangeBound = () => {
      if (document.hidden) {
        this.clearAllInputs();
      }
    };
    this.onPointerLockChangeBound = this.handlePointerLockChange.bind(this);
    this.onPointerLockErrorBound = () => {
      // Fallback to unlocked/drag-to-orbit camera look if pointer lock is denied
      this.pointerLocked = false;
    };
  }

  private loadSettings(): void {
    try {
      this.settings.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
    } catch {
      this.settings.reducedMotion = false;
    }
    try {
      const raw = window.localStorage.getItem(CAMERA_SETTINGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CameraSettings> | null;
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return;
        if (typeof parsed.sensitivity === 'number' && Number.isFinite(parsed.sensitivity)) {
          this.settings.sensitivity = Math.max(0.3, Math.min(2.5, parsed.sensitivity));
        }
        if (typeof parsed.invertY === 'boolean') {
          this.settings.invertY = parsed.invertY;
        }
        if (typeof parsed.reducedMotion === 'boolean') {
          this.settings.reducedMotion = parsed.reducedMotion;
        }
      }
    } catch {
      // Ignore storage access errors
    }
  }

  public getCameraSettings(): CameraSettings {
    return { ...this.settings };
  }

  public setCameraSettings(next: Partial<CameraSettings>): CameraSettings {
    if (typeof next.sensitivity === 'number' && Number.isFinite(next.sensitivity)) {
      this.settings.sensitivity = Math.max(0.3, Math.min(2.5, Number(next.sensitivity.toFixed(2))));
    }
    if (typeof next.invertY === 'boolean') {
      this.settings.invertY = next.invertY;
    }
    if (typeof next.reducedMotion === 'boolean') {
      this.settings.reducedMotion = next.reducedMotion;
    }
    try {
      window.localStorage.setItem(CAMERA_SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // Ignore storage errors
    }
    return this.getCameraSettings();
  }

  public isPointerLockActive(): boolean {
    return this.pointerLocked;
  }

  public requestPointerLock(): void {
    if (typeof document === 'undefined' || !this.canvasEl) return;
    if (
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /Headless/i.test(navigator.userAgent))
    ) {
      return;
    }
    if (document.body.dataset.state !== 'playing') return;
    if (document.pointerLockElement) {
      this.pointerLocked = true;
      return;
    }
    try {
      const req = this.canvasEl.requestPointerLock?.() as unknown as Promise<void> | undefined;
      if (req && typeof req.catch === 'function') {
        req.catch(() => {
          this.pointerLocked = false;
        });
      }
    } catch {
      this.pointerLocked = false;
    }
  }

  public exitPointerLock(): void {
    if (typeof document === 'undefined') return;
    try {
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
    } catch {
      // Ignore exit errors
    }
    this.pointerLocked = false;
  }

  private handlePointerLockChange(): void {
    const wasLocked = this.pointerLocked;
    const isNowLocked = Boolean(
      document.pointerLockElement &&
        this.canvasEl &&
        (document.pointerLockElement === this.canvasEl ||
          this.canvasEl.contains(document.pointerLockElement))
    );
    this.pointerLocked = isNowLocked;

    // If user pressed Escape while pointer-locked during active gameplay, browser releases pointer lock first:
    // transition cleanly into Pause so the player is never caught with unlocked cursor during live combat
    if (wasLocked && !isNowLocked && document.body.dataset.state === 'playing') {
      this.clearAllInputs();
      this.onPointerLockLostCallback?.();
    }
  }

  public attach(
    canvasContainer: HTMLElement,
    callbacks: {
      onPauseToggle: () => void;
      onPointerLockLost?: () => void;
      onRestart: () => void;
      onMuteToggle: () => void;
      onStartFromTitle: () => void;
      onStartBoss?: () => void;
      onTogglePerfOverlay?: () => void;
      onToggleTutorial?: () => void;
      onSkipSequence?: () => boolean;
      onAdvanceChapter?: () => boolean;
      onSelectLoomEnding?: (endingId: 'silence' | 'witness' | 'continuity') => boolean;
    }
  ): void {
    this.canvasEl = canvasContainer;
    this.onPauseToggleCallback = callbacks.onPauseToggle;
    this.onPointerLockLostCallback = callbacks.onPointerLockLost ?? callbacks.onPauseToggle;
    this.onRestartCallback = callbacks.onRestart;
    this.onMuteCallback = callbacks.onMuteToggle;
    this.onStartGameCallback = callbacks.onStartFromTitle;
    this.onStartBossCallback = callbacks.onStartBoss ?? null;
    this.onTogglePerfOverlayCallback = callbacks.onTogglePerfOverlay ?? null;
    this.onToggleTutorialCallback = callbacks.onToggleTutorial ?? null;
    this.onSkipSequenceCallback = callbacks.onSkipSequence ?? null;
    this.onAdvanceChapterCallback = callbacks.onAdvanceChapter ?? null;
    this.onSelectLoomEndingCallback = callbacks.onSelectLoomEnding ?? null;

    window.addEventListener('keydown', this.onKeyDownBound);
    window.addEventListener('keyup', this.onKeyUpBound);
    window.addEventListener('mousedown', this.onMouseDownBound);
    window.addEventListener('mouseup', this.onMouseUpBound);
    window.addEventListener('mousemove', this.onMouseMoveBound);
    window.addEventListener('contextmenu', this.onContextMenuBound);
    window.addEventListener('blur', this.onBlurBound);
    document.addEventListener('visibilitychange', this.onVisibilityChangeBound);
    document.addEventListener('pointerlockchange', this.onPointerLockChangeBound);
    document.addEventListener('pointerlockerror', this.onPointerLockErrorBound);
  }

  public detach(): void {
    this.exitPointerLock();
    window.removeEventListener('keydown', this.onKeyDownBound);
    window.removeEventListener('keyup', this.onKeyUpBound);
    window.removeEventListener('mousedown', this.onMouseDownBound);
    window.removeEventListener('mouseup', this.onMouseUpBound);
    window.removeEventListener('mousemove', this.onMouseMoveBound);
    window.removeEventListener('contextmenu', this.onContextMenuBound);
    window.removeEventListener('blur', this.onBlurBound);
    document.removeEventListener('visibilitychange', this.onVisibilityChangeBound);
    document.removeEventListener('pointerlockchange', this.onPointerLockChangeBound);
    document.removeEventListener('pointerlockerror', this.onPointerLockErrorBound);
    this.canvasEl = null;
  }

  public updateCanvasBounds(): void {
    // Maintained for interface compatibility
  }

  public clearAllInputs(): void {
    this.heldKeys.clear();
    this.justPressedKeys.clear();
    this.leftMouseDown = false;
    this.leftMouseJustPressed = false;
    this.leftMouseJustReleased = false;
    this.rightMouseJustPressed = false;
    this.isDraggingCamera = false;
    this.cameraDragJustStarted = false;
    this.dragDistancePx = 0;
    this.lastPointerX = null;
    this.lastPointerY = null;
    this.touchHoldX = 0;
    this.touchHoldZ = 0;
    this.touchMovePointerId = null;
    this.touchPulseX = 0;
    this.touchPulseZ = 0;
    this.touchPulseTimer = 0;
    this.touchCameraPointerId = null;
    this.touchCameraSource = null;
    this.touchCameraLastX = null;
    this.touchCameraLastY = null;
    this.touchCameraActive = false;
  }

  public resetCameraAngles(): void {
    this.aimYaw = GAME_CONFIG.camera.defaultYaw;
    this.aimPitch = GAME_CONFIG.camera.defaultPitch;
  }

  public rotateCameraByDelta(dxPixels: number, dyPixels: number): void {
    const clampedDx = Math.max(-350, Math.min(350, dxPixels));
    const clampedDy = Math.max(-350, Math.min(350, dyPixels));

    const yawSens = GAME_CONFIG.camera.baseYawSensitivity * this.settings.sensitivity;
    const pitchSens = GAME_CONFIG.camera.basePitchSensitivity * this.settings.sensitivity;
    const invertSign = this.settings.invertY ? -1 : 1;

    this.aimYaw = wrapAngle(this.aimYaw - clampedDx * yawSens);
    this.aimPitch = Math.max(
      GAME_CONFIG.camera.minPitch,
      Math.min(GAME_CONFIG.camera.maxPitch, this.aimPitch + clampedDy * pitchSens * invertSign)
    );
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const code = e.code;
    const state = document.body.dataset.state;

    // Development-only F3 Performance Overlay Toggle
    if (code === 'F3') {
      e.preventDefault();
      this.onTogglePerfOverlayCallback?.();
      return;
    }

    // Global Boss Encounter Launch Shortcut [B]
    if (code === 'KeyB') {
      e.preventDefault();
      this.onStartBossCallback?.();
      return;
    }

    // Title screen Enter/Space start handshake
    if (state === 'title' && (code === 'Enter' || code === 'Space')) {
      if ((e.target as HTMLElement | null)?.closest?.('button, input, a, select, textarea')) return;
      e.preventDefault();
      this.onStartGameCallback?.();
      return;
    }

    // Campaign Victory Modal / Pending Transition [Enter] Advance Chapter shortcut
    if (
      (state === 'gameover' || state === 'playing') &&
      code === 'Enter' &&
      this.onAdvanceChapterCallback?.()
    ) {
      e.preventDefault();
      return;
    }

    // Global Pause shortcut (Escape or P)
    if (code === 'Escape' || code === 'KeyP') {
      if (state === 'playing' || state === 'paused') {
        e.preventDefault();
        this.onPauseToggleCallback?.();
        return;
      }
    }

    if (
      (code === 'KeyR' || code === 'Backspace') &&
      (state === 'playing' || state === 'paused' || state === 'gameover')
    ) {
      e.preventDefault();
      this.onRestartCallback?.();
      return;
    }

    if (code === 'KeyM') {
      e.preventDefault();
      this.onMuteCallback?.();
      return;
    }

    if (code === 'KeyH' && (state === 'playing' || state === 'paused')) {
      e.preventDefault();
      this.onToggleTutorialCallback?.();
      return;
    }

    if (state !== 'playing') return;

    if ((code === 'Space' || code === 'Enter') && this.onSkipSequenceCallback?.()) {
      e.preventDefault();
      return;
    }

    // Chronicle Loom Chapter V [1] / [2] / [3] ending directive shortcuts
    if (code === 'Digit1' && this.onSelectLoomEndingCallback?.('silence')) {
      e.preventDefault();
      return;
    }
    if (code === 'Digit2' && this.onSelectLoomEndingCallback?.('witness')) {
      e.preventDefault();
      return;
    }
    if (code === 'Digit3' && this.onSelectLoomEndingCallback?.('continuity')) {
      e.preventDefault();
      return;
    }

    if (!this.heldKeys.has(code)) {
      this.justPressedKeys.add(code);
    }
    this.heldKeys.add(code);
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.heldKeys.delete(e.code);
  }

  private handleMouseDown(e: MouseEvent): void {
    const state = document.body.dataset.state;
    if (state !== 'playing') return;

    // Ignore clicks on HUD buttons or interactive overlays
    const target = e.target as HTMLElement | null;
    if (
      target &&
      typeof target.closest === 'function' &&
      target.closest('button, input, a, [role="dialog"], .pointer-events-auto')
    ) {
      return;
    }

    // Request Pointer Lock when clicking into the active 3D viewport
    if (!document.pointerLockElement) {
      this.requestPointerLock();
    }

    this.dragDistancePx = 0;

    if (e.button === 0) {
      this.leftMouseDown = true;
      this.leftMouseJustPressed = true;
    } else if (e.button === 2) {
      this.rightMouseJustPressed = true;
    } else if (e.button === 1) {
      this.isDraggingCamera = true;
    }
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
  }

  private handleMouseUp(e: MouseEvent): void {
    if (e.button === 0) {
      if (this.leftMouseDown && !this.isDraggingCamera) {
        this.leftMouseJustReleased = true;
      }
      this.leftMouseDown = false;
      this.isDraggingCamera = false;
      this.dragDistancePx = 0;
    } else if (e.button === 1) {
      this.isDraggingCamera = false;
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    const state = document.body.dataset.state;
    if (state !== 'playing') {
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      return;
    }

    const isLocked = Boolean(document.pointerLockElement);
    this.pointerLocked = isLocked;

    let dx = 0;
    let dy = 0;

    if (isLocked) {
      dx = e.movementX || 0;
      dy = e.movementY || 0;
    } else {
      const fallbackDx = this.lastPointerX !== null ? e.clientX - this.lastPointerX : 0;
      const fallbackDy = this.lastPointerY !== null ? e.clientY - this.lastPointerY : 0;
      dx = e.movementX !== undefined && e.movementX !== 0 ? e.movementX : fallbackDx;
      dy = e.movementY !== undefined && e.movementY !== 0 ? e.movementY : fallbackDy;

      // Drag-to-orbit fallback when pointer lock is unavailable/denied:
      // If holding left mouse button and dragging beyond 8px, convert into camera drag and cancel accidental attack
      if (this.leftMouseDown) {
        this.dragDistancePx += Math.hypot(dx, dy);
        if (this.dragDistancePx > 8) {
          if (!this.isDraggingCamera) {
            this.cameraDragJustStarted = true;
          }
          this.isDraggingCamera = true;
          this.leftMouseDown = false;
          this.leftMouseJustPressed = false;
          this.leftMouseJustReleased = false;
        }
      }
    }

    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;

    const shouldRotateUnlockedCamera = this.isDraggingCamera || (e.buttons & 4) !== 0;
    if ((isLocked || shouldRotateUnlockedCamera) && (dx !== 0 || dy !== 0)) {
      this.rotateCameraByDelta(dx, dy);
    }
  }

  public consumeFrameInput(dt: number): PlayerInputFrame {
    // Allow Arrow keys to smoothly orbit camera yaw & pitch
    const keyTurn = GAME_CONFIG.camera.keyboardTurnSpeed * this.settings.sensitivity;
    if (this.heldKeys.has('ArrowLeft')) {
      this.aimYaw = wrapAngle(this.aimYaw + keyTurn * dt);
    }
    if (this.heldKeys.has('ArrowRight')) {
      this.aimYaw = wrapAngle(this.aimYaw - keyTurn * dt);
    }
    if (this.heldKeys.has('ArrowUp')) {
      this.aimPitch = Math.max(
        GAME_CONFIG.camera.minPitch,
        Math.min(GAME_CONFIG.camera.maxPitch, this.aimPitch - keyTurn * 0.65 * dt)
      );
    }
    if (this.heldKeys.has('ArrowDown')) {
      this.aimPitch = Math.max(
        GAME_CONFIG.camera.minPitch,
        Math.min(GAME_CONFIG.camera.maxPitch, this.aimPitch + keyTurn * 0.65 * dt)
      );
    }

    let moveX = 0;
    let moveZ = 0;

    if (this.heldKeys.has('KeyW')) moveZ -= 1;
    if (this.heldKeys.has('KeyS')) moveZ += 1;
    if (this.heldKeys.has('KeyA')) moveX -= 1;
    if (this.heldKeys.has('KeyD')) moveX += 1;

    if (this.touchPulseTimer > 0) {
      this.touchPulseTimer = Math.max(0, this.touchPulseTimer - dt);
      if (this.touchPulseTimer <= 0) {
        this.touchPulseX = 0;
        this.touchPulseZ = 0;
      }
    }

    if (this.touchHoldX !== 0 || this.touchHoldZ !== 0) {
      moveX += this.touchHoldX;
      moveZ += this.touchHoldZ;
    } else if (this.touchPulseTimer > 0) {
      moveX += this.touchPulseX;
      moveZ += this.touchPulseZ;
    }

    const lightAttackJustPressed =
      (!this.isDraggingCamera && this.leftMouseJustPressed) ||
      this.justPressedKeys.has('KeyJ') ||
      this.justPressedKeys.has('KeyF');

    const heavyHoldActive =
      (!this.isDraggingCamera && this.leftMouseDown) || this.heldKeys.has('KeyJ');

    const heavyJustReleased =
      !this.isDraggingCamera && this.leftMouseJustReleased;

    const heavyAttackJustPressed =
      this.rightMouseJustPressed ||
      this.justPressedKeys.has('KeyE') ||
      this.justPressedKeys.has('KeyK');

    const dodgeJustPressed =
      this.justPressedKeys.has('Space') ||
      this.justPressedKeys.has('ShiftLeft') ||
      this.justPressedKeys.has('ShiftRight');

    const parryJustPressed = this.justPressedKeys.has('KeyQ');
    const echoRecordJustPressed = this.justPressedKeys.has('KeyT');
    const echoPlayJustPressed = this.justPressedKeys.has('KeyY');
    const echoClearJustPressed = this.justPressedKeys.has('KeyC');
    const echoRelayJustPressed = this.justPressedKeys.has('KeyV');
    const gravityPinJustPressed = this.justPressedKeys.has('KeyG');
    const echoCollapseJustPressed = this.justPressedKeys.has('KeyX');
    const cameraDragJustStarted = this.cameraDragJustStarted;

    // Clear one-shot edge triggers
    this.justPressedKeys.clear();
    this.leftMouseJustPressed = false;
    this.leftMouseJustReleased = false;
    this.rightMouseJustPressed = false;
    this.cameraDragJustStarted = false;

    return {
      moveX,
      moveZ,
      aimYaw: this.aimYaw,
      aimPitch: this.aimPitch,
      lightAttackJustPressed,
      heavyHoldActive,
      heavyJustReleased,
      heavyAttackJustPressed,
      dodgeJustPressed,
      parryJustPressed,
      cameraDragJustStarted,
      echoRecordJustPressed,
      echoPlayJustPressed,
      echoClearJustPressed,
      echoRelayJustPressed,
      gravityPinJustPressed,
      echoCollapseJustPressed,
    };
  }

  public triggerEchoRecord(): void {
    this.justPressedKeys.add('KeyT');
  }

  public triggerEchoReplay(): void {
    this.justPressedKeys.add('KeyY');
  }

  public triggerEchoClear(): void {
    this.justPressedKeys.add('KeyC');
  }

  public triggerEchoRelay(): void {
    this.justPressedKeys.add('KeyV');
  }

  public triggerGravityPin(): void {
    this.justPressedKeys.add('KeyG');
  }

  public triggerEchoCollapse(): void {
    this.justPressedKeys.add('KeyX');
  }

  public triggerLightAttack(): void {
    this.justPressedKeys.add('KeyF');
  }

  public triggerHeavyAttack(): void {
    this.justPressedKeys.add('KeyE');
  }

  public triggerDodge(): void {
    this.justPressedKeys.add('Space');
  }

  public triggerParry(): void {
    this.justPressedKeys.add('KeyQ');
  }

  public setTouchMoveHold(dx: number, dz: number, pointerId?: number | null): void {
    if (dx === 0 && dz === 0) {
      if (
        pointerId !== undefined &&
        pointerId !== null &&
        this.touchMovePointerId !== null &&
        this.touchMovePointerId !== pointerId
      ) {
        return;
      }
      this.touchHoldX = 0;
      this.touchHoldZ = 0;
      this.touchMovePointerId = null;
      return;
    }
    this.touchHoldX = dx;
    this.touchHoldZ = dz;
    this.touchMovePointerId = pointerId ?? null;
  }

  public getTouchMoveHold(): { x: number; z: number; pointerId: number | null } {
    return {
      x: this.touchHoldX,
      z: this.touchHoldZ,
      pointerId: this.touchMovePointerId,
    };
  }

  public startTouchCameraLook(
    id: number,
    clientX: number,
    clientY: number,
    source: 'pointer' | 'touch' = 'pointer'
  ): boolean {
    if (this.touchCameraActive) {
      if (this.touchCameraSource === 'pointer' && source === 'touch') {
        this.touchCameraSource = 'touch';
        this.touchCameraPointerId = id;
        this.touchCameraLastX = clientX;
        this.touchCameraLastY = clientY;
        return true;
      }
      if (this.touchCameraSource !== source || this.touchCameraPointerId !== id) {
        return false;
      }
    }
    this.touchCameraActive = true;
    this.touchCameraSource = source;
    this.touchCameraPointerId = id;
    this.touchCameraLastX = clientX;
    this.touchCameraLastY = clientY;
    this.cameraDragJustStarted = true;
    this.leftMouseDown = false;
    this.leftMouseJustPressed = false;
    this.leftMouseJustReleased = false;
    this.rightMouseJustPressed = false;
    return true;
  }

  public moveTouchCameraLook(
    id: number,
    clientX: number,
    clientY: number,
    source: 'pointer' | 'touch' = 'pointer'
  ): boolean {
    if (
      !this.touchCameraActive ||
      this.touchCameraSource !== source ||
      this.touchCameraPointerId !== id
    ) {
      return false;
    }
    const dx = this.touchCameraLastX !== null ? clientX - this.touchCameraLastX : 0;
    const dy = this.touchCameraLastY !== null ? clientY - this.touchCameraLastY : 0;
    this.touchCameraLastX = clientX;
    this.touchCameraLastY = clientY;
    if (dx !== 0 || dy !== 0) {
      this.rotateCameraByDelta(dx, dy);
      return true;
    }
    return false;
  }

  public endTouchCameraLook(id?: number, source?: 'pointer' | 'touch'): void {
    if (!this.touchCameraActive) return;
    if (
      source !== undefined &&
      this.touchCameraSource !== null &&
      this.touchCameraSource !== source
    ) {
      return;
    }
    if (
      id !== undefined &&
      this.touchCameraPointerId !== null &&
      this.touchCameraPointerId !== id
    ) {
      return;
    }
    this.touchCameraActive = false;
    this.touchCameraSource = null;
    this.touchCameraPointerId = null;
    this.touchCameraLastX = null;
    this.touchCameraLastY = null;
  }

  public isTouchCameraActive(): boolean {
    return this.touchCameraActive;
  }

  public triggerTouchMovePulse(dx: number, dz: number, durationSec = 0.28): void {
    this.touchPulseX = dx;
    this.touchPulseZ = dz;
    this.touchPulseTimer = Math.max(this.touchPulseTimer, durationSec);
  }
}
