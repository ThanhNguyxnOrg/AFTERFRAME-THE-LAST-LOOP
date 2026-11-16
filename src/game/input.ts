import { GAME_CONFIG } from './config.ts';
import { pollGamepadInput } from './gamepad.ts';
import {
  mergeGraphicsSettingsPatch,
  resolveGraphicsSettings,
} from './performance.ts';
import type { CameraSettings, PlayerInputFrame, WeaponId } from './types.ts';
import { wrapAngle } from './simulation.ts';

const CAMERA_SETTINGS_STORAGE_KEY = 'afterframe_camera_settings_v1';

export class InputController {
  private heldKeys = new Set<string>();
  private heldCardinalOrder: string[] = [];
  private justPressedKeys = new Set<string>();
  private pendingSelectWeaponId: WeaponId | null = null;
  private leftMouseDown = false;
  private leftMouseJustPressed = false;
  private leftMouseJustReleased = false;
  private rightMouseJustPressed = false;
  private prevGamepadButtonsMask = 0;
  private prevGamepadLightHeld = false;
  private activeGamepadIndex: number | null = null;

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
  private middleMouseDown = false;
  private middleMouseDragDist = 0;
  private middleMouseTapJustPressed = false;
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
  private onMapToggleCallback: (() => void) | null = null;
  private onSelectWeaponCallback: ((weaponId?: WeaponId) => void) | null = null;

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

  private hasGraphicsKeys(obj: Partial<CameraSettings>): boolean {
    return (
      obj.graphicsPreset !== undefined ||
      obj.renderScale !== undefined ||
      obj.shadowQuality !== undefined ||
      obj.particleQuality !== undefined ||
      obj.lightingQuality !== undefined ||
      obj.fpsLimit !== undefined ||
      obj.showPerfHud !== undefined
    );
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
        if (typeof parsed.masterVolume === 'number' && Number.isFinite(parsed.masterVolume)) {
          this.settings.masterVolume = Math.max(0, Math.min(1, parsed.masterVolume));
        }
        if (typeof parsed.musicVolume === 'number' && Number.isFinite(parsed.musicVolume)) {
          this.settings.musicVolume = Math.max(0, Math.min(1, parsed.musicVolume));
        }
        if (typeof parsed.sfxVolume === 'number' && Number.isFinite(parsed.sfxVolume)) {
          this.settings.sfxVolume = Math.max(0, Math.min(1, parsed.sfxVolume));
        }
        if (typeof parsed.cameraShake === 'boolean') {
          this.settings.cameraShake = parsed.cameraShake;
        }
        if (typeof parsed.screenEffects === 'boolean') {
          this.settings.screenEffects = parsed.screenEffects;
        }
        if (typeof parsed.subtitlesEnabled === 'boolean') {
          this.settings.subtitlesEnabled = parsed.subtitlesEnabled;
        }
        if (this.hasGraphicsKeys(parsed)) {
          const resolvedGfx = resolveGraphicsSettings(parsed);
          this.settings = {
            ...this.settings,
            ...resolvedGfx,
          };
        }
      }
    } catch {
      // Ignore storage access errors
    }
  }

  public getCameraSettings(): CameraSettings {
    return { ...this.settings };
  }

  public getResolvedGraphicsSettings() {
    return resolveGraphicsSettings(this.settings);
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
    if (typeof next.masterVolume === 'number' && Number.isFinite(next.masterVolume)) {
      this.settings.masterVolume = Math.max(0, Math.min(1, Number(next.masterVolume.toFixed(2))));
    }
    if (typeof next.musicVolume === 'number' && Number.isFinite(next.musicVolume)) {
      this.settings.musicVolume = Math.max(0, Math.min(1, Number(next.musicVolume.toFixed(2))));
    }
    if (typeof next.sfxVolume === 'number' && Number.isFinite(next.sfxVolume)) {
      this.settings.sfxVolume = Math.max(0, Math.min(1, Number(next.sfxVolume.toFixed(2))));
    }
    if (typeof next.cameraShake === 'boolean') {
      this.settings.cameraShake = next.cameraShake;
    }
    if (typeof next.screenEffects === 'boolean') {
      this.settings.screenEffects = next.screenEffects;
    }
    if (typeof next.subtitlesEnabled === 'boolean') {
      this.settings.subtitlesEnabled = next.subtitlesEnabled;
    }
    if (this.hasGraphicsKeys(next) || this.hasGraphicsKeys(this.settings)) {
      const resolvedGfx = mergeGraphicsSettingsPatch(this.settings, next);
      this.settings = {
        ...this.settings,
        ...resolvedGfx,
      };
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
      onMapToggle?: () => void;
      onSelectWeapon?: (weaponId?: WeaponId) => void;
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
    this.onMapToggleCallback = callbacks.onMapToggle ?? null;
    this.onSelectWeaponCallback = callbacks.onSelectWeapon ?? null;

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
    this.heldCardinalOrder.length = 0;
    this.justPressedKeys.clear();
    this.pendingSelectWeaponId = null;
    this.leftMouseDown = false;
    this.leftMouseJustPressed = false;
    this.leftMouseJustReleased = false;
    this.rightMouseJustPressed = false;
    this.isDraggingCamera = false;
    this.cameraDragJustStarted = false;
    this.dragDistancePx = 0;
    this.middleMouseDown = false;
    this.middleMouseDragDist = 0;
    this.middleMouseTapJustPressed = false;
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
    this.prevGamepadButtonsMask = 0;
    this.prevGamepadLightHeld = false;
  }

  public isGamepadConnected(): boolean {
    return this.activeGamepadIndex !== null;
  }

  public triggerGamepadRumble(
    strongMagnitude = 0.4,
    weakMagnitude = 0.2,
    durationMs = 110
  ): void {
    if (this.activeGamepadIndex === null) return;
    if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') return;
    try {
      const pads = navigator.getGamepads();
      const pad = pads?.[this.activeGamepadIndex] as
        | (Gamepad & {
            vibrationActuator?: {
              playEffect?: (
                type: string,
                params: {
                  startDelay: number;
                  duration: number;
                  weakMagnitude: number;
                  strongMagnitude: number;
                }
              ) => Promise<unknown>;
            };
          })
        | null
        | undefined;
      pad?.vibrationActuator
        ?.playEffect?.('dual-rumble', {
          startDelay: 0,
          duration: durationMs,
          weakMagnitude: Math.max(0, Math.min(1, weakMagnitude)),
          strongMagnitude: Math.max(0, Math.min(1, strongMagnitude)),
        })
        ?.catch?.(() => {});
    } catch {
      // Ignore rumble failures on unsupported gamepads
    }
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

  /**
   * Resolves physical key codes reliably even when an IME (such as Vietnamese UniKey / EVKey in Telex/VNI mode)
   * intercepts the keystroke and emits an accented character or 'Process' / 'Unidentified' code.
   */
  public resolveKeyCode(e: KeyboardEvent): string {
    const rawCode = typeof e.code === 'string' ? e.code : '';
    if (rawCode && rawCode !== 'Unidentified' && rawCode !== 'Process') {
      return rawCode;
    }
    const rawKey = typeof e.key === 'string' ? e.key.toLowerCase() : '';
    if (!rawKey) return rawCode;

    switch (rawKey) {
      case 'w':
      case 'ư':
      case 'ứ':
      case 'ừ':
      case 'ử':
      case 'ữ':
      case 'ự':
        return 'KeyW';
      case 'a':
      case 'ă':
      case 'â':
      case 'á':
      case 'à':
      case 'ả':
      case 'ã':
      case 'ạ':
      case 'ắ':
      case 'ằ':
      case 'ẳ':
      case 'ẵ':
      case 'ặ':
      case 'ấ':
      case 'ầ':
      case 'ẩ':
      case 'ẫ':
      case 'ậ':
        return 'KeyA';
      case 's':
        return 'KeyS';
      case 'd':
      case 'đ':
        return 'KeyD';
      case 'e':
      case 'ê':
      case 'ế':
      case 'ề':
      case 'ể':
      case 'ễ':
      case 'ệ':
        return 'KeyE';
      case 'q':
        return 'KeyQ';
      case 'r':
        return 'KeyR';
      case 'f':
        return 'KeyF';
      case 'g':
        return 'KeyG';
      case 'v':
        return 'KeyV';
      case 'c':
        return 'KeyC';
      case 'x':
        return 'KeyX';
      case 'z':
        return 'KeyZ';
      case 'j':
        return 'KeyJ';
      case 'k':
        return 'KeyK';
      case 'l':
        return 'KeyL';
      case 'u':
      case 'ú':
      case 'ù':
      case 'ủ':
      case 'ũ':
      case 'ụ':
        return 'KeyU';
      case 'p':
        return 'KeyP';
      case 'o':
      case 'ó':
      case 'ò':
      case 'ỏ':
      case 'õ':
      case 'ọ':
      case 'ô':
      case 'ố':
      case 'ồ':
      case 'ổ':
      case 'ỗ':
      case 'ộ':
      case 'ơ':
      case 'ớ':
      case 'ờ':
      case 'ở':
      case 'ỡ':
      case 'ợ':
        return 'KeyO';
      case 'n':
        return 'KeyN';
      case 'm':
        return 'KeyM';
      case 'h':
        return 'KeyH';
      case 'b':
        return 'KeyB';
      case '1':
        return 'Digit1';
      case '2':
        return 'Digit2';
      case '3':
        return 'Digit3';
      case '4':
        return 'Digit4';
      case ' ':
        return 'Space';
      case 'tab':
        return 'Tab';
      case 'enter':
        return 'Enter';
      case 'escape':
      case 'esc':
        return 'Escape';
      case 'shift':
        return 'ShiftLeft';
      case 'arrowup':
        return 'ArrowUp';
      case 'arrowdown':
        return 'ArrowDown';
      case 'arrowleft':
        return 'ArrowLeft';
      case 'arrowright':
        return 'ArrowRight';
      default:
        return rawCode;
    }
  }

  private isMovementKeyHeld(): boolean {
    return (
      this.heldKeys.has('KeyW') ||
      this.heldKeys.has('KeyA') ||
      this.heldKeys.has('KeyS') ||
      this.heldKeys.has('KeyD')
    );
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const code = this.resolveKeyCode(e);
    const state = document.body.dataset.state;
    const runMode = document.body.dataset.runMode;

    // Development-only F3 Performance Overlay Toggle
    if (code === 'F3') {
      e.preventDefault();
      this.onTogglePerfOverlayCallback?.();
      return;
    }

    // Global Boss Encounter Launch Shortcut [B]
    // Guarded during active Campaign gameplay or while holding WASD so bumping [B] near [V]/[G]/[Space] never aborts a Campaign chapter
    if (code === 'KeyB') {
      if (state === 'playing' && (runMode === 'campaign' || this.isMovementKeyHeld())) {
        return;
      }
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

    // Global Pause / Upgrade Bench shortcut (Escape, P, or U)
    if (code === 'Escape' || code === 'KeyP' || code === 'KeyU') {
      if (state === 'playing' || state === 'paused') {
        e.preventDefault();
        this.onPauseToggleCallback?.();
        return;
      }
    }

    // Sector Map / Navigation Modal shortcut [N]
    if (code === 'KeyN') {
      if (state === 'playing' || state === 'paused') {
        e.preventDefault();
        if (this.onMapToggleCallback) {
          this.onMapToggleCallback();
        } else {
          this.onPauseToggleCallback?.();
        }
        return;
      }
    }

    // Restart shortcut [R]
    // NOTE: Backspace is intentionally NOT bound to restart because Vietnamese IMEs (UniKey / EVKey in Telex mode)
    // inject hardware Backspace events when pressing W ('ư'), A+S ('á'), D+D ('đ'), or A+R ('ả') during WASD movement.
    if (
      code === 'KeyR' &&
      !e.isComposing &&
      !e.repeat &&
      (state === 'playing' || state === 'paused' || state === 'gameover')
    ) {
      if (state === 'playing' && this.isMovementKeyHeld()) {
        return;
      }
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

    // Allow [1]-[4] and [Tab]/[Z] weapon selection while inside the Paused [U] Upgrade Bench or Victory Intermission
    if (state === 'paused' || state === 'gameover') {
      if ((e.target as HTMLElement | null)?.closest?.('input, select, textarea')) return;
      if (code === 'Digit1') {
        e.preventDefault();
        this.onSelectWeaponCallback?.('chrono_edge');
        return;
      }
      if (code === 'Digit2') {
        e.preventDefault();
        this.onSelectWeaponCallback?.('pulsecaster');
        return;
      }
      if (code === 'Digit3') {
        e.preventDefault();
        this.onSelectWeaponCallback?.('phase_rail');
        return;
      }
      if (code === 'Digit4') {
        e.preventDefault();
        this.onSelectWeaponCallback?.('grav_breaker');
        return;
      }
      if (code === 'Tab' || code === 'KeyZ') {
        e.preventDefault();
        this.onSelectWeaponCallback?.();
        return;
      }
    }

    if (state !== 'playing') return;
    if ((e.target as HTMLElement | null)?.closest?.('input, select, textarea')) return;

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

    if (code === 'Tab') {
      e.preventDefault();
    }

    if (!this.heldKeys.has(code)) {
      this.justPressedKeys.add(code);
    }
    this.heldKeys.add(code);
    if (code === 'KeyW' || code === 'KeyS' || code === 'KeyA' || code === 'KeyD') {
      const existingIdx = this.heldCardinalOrder.indexOf(code);
      if (existingIdx !== -1) {
        this.heldCardinalOrder.splice(existingIdx, 1);
      }
      this.heldCardinalOrder.push(code);
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    const code = this.resolveKeyCode(e);
    if (typeof e.code === 'string' && e.code) {
      this.heldKeys.delete(e.code);
    }
    if (code) {
      this.heldKeys.delete(code);
      const idx = this.heldCardinalOrder.indexOf(code);
      if (idx !== -1) {
        this.heldCardinalOrder.splice(idx, 1);
      }
    }
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
      e.preventDefault();
      this.isDraggingCamera = true;
      this.middleMouseDown = true;
      this.middleMouseDragDist = 0;
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
      if (this.middleMouseDown && this.middleMouseDragDist < 6) {
        this.middleMouseTapJustPressed = true;
      }
      this.middleMouseDown = false;
      this.middleMouseDragDist = 0;
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

    if (this.middleMouseDown) {
      this.middleMouseDragDist += Math.hypot(dx, dy);
    }

    const shouldRotateUnlockedCamera = this.isDraggingCamera || (e.buttons & 4) !== 0;
    if ((isLocked || shouldRotateUnlockedCamera) && (dx !== 0 || dy !== 0)) {
      this.rotateCameraByDelta(dx, dy);
    }
  }

  public consumeFrameInput(dt: number): PlayerInputFrame {
    let activePad: Gamepad | null = null;
    if (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function') {
      try {
        const pads = navigator.getGamepads();
        if (pads) {
          for (let i = 0; i < pads.length; i++) {
            const cand = pads[i];
            if (cand && cand.connected !== false) {
              activePad = cand;
              this.activeGamepadIndex = cand.index ?? i;
              break;
            }
          }
        }
      } catch {
        activePad = null;
      }
    }
    if (!activePad) {
      this.activeGamepadIndex = null;
    }

    const gp = pollGamepadInput(
      activePad,
      this.prevGamepadButtonsMask,
      this.settings.sensitivity,
      this.settings.invertY,
      dt
    );
    this.prevGamepadButtonsMask = gp.nextButtonsMask;
    const gpLightJustReleased = !gp.lightHeld && this.prevGamepadLightHeld;
    this.prevGamepadLightHeld = gp.lightHeld;

    const docState = typeof document !== 'undefined' ? document.body?.dataset?.state : undefined;
    if (gp.connected) {
      if (docState === 'title' && gp.justPressed.pause) {
        this.onStartGameCallback?.();
      } else if (docState === 'playing' || docState === 'paused') {
        if (gp.justPressed.pause) {
          this.onPauseToggleCallback?.();
        } else if (gp.justPressed.map) {
          if (this.onMapToggleCallback) {
            this.onMapToggleCallback();
          } else {
            this.onPauseToggleCallback?.();
          }
        }
      }
    }

    // Allow Arrow keys & Gamepad right stick to smoothly orbit camera yaw & pitch
    const keyTurn = GAME_CONFIG.camera.keyboardTurnSpeed * this.settings.sensitivity;
    const invertSign = this.settings.invertY ? -1 : 1;
    if (this.heldKeys.has('ArrowLeft')) {
      this.aimYaw = wrapAngle(this.aimYaw + keyTurn * dt);
    }
    if (this.heldKeys.has('ArrowRight')) {
      this.aimYaw = wrapAngle(this.aimYaw - keyTurn * dt);
    }
    if (this.heldKeys.has('ArrowUp')) {
      this.aimPitch = Math.max(
        GAME_CONFIG.camera.minPitch,
        Math.min(
          GAME_CONFIG.camera.maxPitch,
          this.aimPitch - keyTurn * 0.65 * dt * invertSign
        )
      );
    }
    if (this.heldKeys.has('ArrowDown')) {
      this.aimPitch = Math.max(
        GAME_CONFIG.camera.minPitch,
        Math.min(
          GAME_CONFIG.camera.maxPitch,
          this.aimPitch + keyTurn * 0.65 * dt * invertSign
        )
      );
    }

    const gpPlaying = gp.connected && docState === 'playing';
    if (gpPlaying) {
      if (gp.lookYawDelta !== 0) {
        this.aimYaw = wrapAngle(this.aimYaw + gp.lookYawDelta);
      }
      if (gp.lookPitchDelta !== 0) {
        this.aimPitch = Math.max(
          GAME_CONFIG.camera.minPitch,
          Math.min(GAME_CONFIG.camera.maxPitch, this.aimPitch + gp.lookPitchDelta)
        );
      }
    }

    let moveX = 0;
    let moveZ = 0;

    const hasW = this.heldKeys.has('KeyW');
    const hasS = this.heldKeys.has('KeyS');
    if (hasW && hasS) {
      const wIdx = this.heldCardinalOrder.lastIndexOf('KeyW');
      const sIdx = this.heldCardinalOrder.lastIndexOf('KeyS');
      moveZ = sIdx > wIdx ? 1 : -1;
    } else if (hasW) {
      moveZ = -1;
    } else if (hasS) {
      moveZ = 1;
    }

    const hasA = this.heldKeys.has('KeyA');
    const hasD = this.heldKeys.has('KeyD');
    if (hasA && hasD) {
      const aIdx = this.heldCardinalOrder.lastIndexOf('KeyA');
      const dIdx = this.heldCardinalOrder.lastIndexOf('KeyD');
      moveX = dIdx > aIdx ? 1 : -1;
    } else if (hasA) {
      moveX = -1;
    } else if (hasD) {
      moveX = 1;
    }

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

    if (gpPlaying) {
      moveX += gp.moveX;
      moveZ += gp.moveZ;
      const mag = Math.hypot(moveX, moveZ);
      if (mag > 1) {
        moveX /= mag;
        moveZ /= mag;
      }
    }

    const lightAttackJustPressed =
      (!this.isDraggingCamera && this.leftMouseJustPressed) ||
      this.justPressedKeys.has('KeyJ') ||
      this.justPressedKeys.has('KeyF') ||
      (gpPlaying && gp.justPressed.light);

    const heavyHoldActive =
      (!this.isDraggingCamera && this.leftMouseDown) ||
      this.heldKeys.has('KeyJ') ||
      (gpPlaying && gp.lightHeld);

    const heavyJustReleased =
      (!this.isDraggingCamera && this.leftMouseJustReleased) ||
      (gpPlaying && gpLightJustReleased);

    const heavyAttackJustPressed =
      this.rightMouseJustPressed ||
      this.justPressedKeys.has('KeyE') ||
      this.justPressedKeys.has('KeyK') ||
      (gpPlaying && gp.justPressed.heavy);

    const dodgeJustPressed =
      this.justPressedKeys.has('Space') ||
      this.justPressedKeys.has('ShiftLeft') ||
      this.justPressedKeys.has('ShiftRight') ||
      (gpPlaying && gp.justPressed.dodge);

    const parryJustPressed =
      this.justPressedKeys.has('KeyQ') ||
      this.justPressedKeys.has('KeyL') ||
      (gpPlaying && gp.justPressed.parry);
    const switchWeaponJustPressed =
      this.justPressedKeys.has('Tab') ||
      this.justPressedKeys.has('KeyZ') ||
      (gpPlaying && gp.justPressed.switchWeapon);
    const selectWeaponId: WeaponId | null =
      this.pendingSelectWeaponId ??
      (this.justPressedKeys.has('Digit1')
        ? 'chrono_edge'
        : this.justPressedKeys.has('Digit2')
          ? 'pulsecaster'
          : this.justPressedKeys.has('Digit3')
            ? 'phase_rail'
            : this.justPressedKeys.has('Digit4')
              ? 'grav_breaker'
              : null);
    const echoRecordJustPressed =
      this.justPressedKeys.has('KeyT') || (gpPlaying && gp.justPressed.echoRecord);
    const echoPlayJustPressed =
      this.justPressedKeys.has('KeyY') || (gpPlaying && gp.justPressed.echoReplay);
    const echoClearJustPressed =
      this.justPressedKeys.has('KeyC') || (gpPlaying && gp.justPressed.echoClear);
    const echoRelayJustPressed =
      this.justPressedKeys.has('KeyV') || (gpPlaying && gp.justPressed.echoRelay);
    const gravityPinJustPressed =
      this.justPressedKeys.has('KeyG') || (gpPlaying && gp.justPressed.gravityPin);
    const echoCollapseJustPressed =
      this.justPressedKeys.has('KeyX') || (gpPlaying && gp.justPressed.echoCollapse);
    const interactJustPressed =
      this.justPressedKeys.has('KeyI') || (gpPlaying && gp.justPressed.interact);
    const lockOnToggleJustPressed =
      this.justPressedKeys.has('KeyO') || this.middleMouseTapJustPressed;
    const cameraDragJustStarted = this.cameraDragJustStarted;

    // Clear one-shot edge triggers
    this.justPressedKeys.clear();
    this.pendingSelectWeaponId = null;
    this.leftMouseJustPressed = false;
    this.leftMouseJustReleased = false;
    this.rightMouseJustPressed = false;
    this.middleMouseTapJustPressed = false;
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
      switchWeaponJustPressed,
      selectWeaponId,
      echoRecordJustPressed,
      echoPlayJustPressed,
      echoClearJustPressed,
      echoRelayJustPressed,
      gravityPinJustPressed,
      echoCollapseJustPressed,
      interactJustPressed,
      lockOnToggleJustPressed,
    };
  }

  public triggerInteract(): void {
    this.justPressedKeys.add('KeyI');
  }

  public triggerToggleLockOn(): void {
    this.justPressedKeys.add('KeyO');
  }

  public triggerSwitchWeapon(): void {
    this.justPressedKeys.add('KeyZ');
  }

  public triggerSelectWeapon(weaponId: WeaponId): void {
    this.pendingSelectWeaponId = weaponId;
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
