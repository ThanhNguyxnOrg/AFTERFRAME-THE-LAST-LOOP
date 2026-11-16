import { GAME_CONFIG } from './config.ts';

export const GAMEPAD_STICK_DEADZONE = 0.18;
export const GAMEPAD_TRIGGER_THRESHOLD = 0.35;

export interface GamepadButtonLike {
  pressed: boolean;
  value?: number;
}

export interface GamepadLike {
  connected?: boolean;
  axes: readonly number[];
  buttons: readonly GamepadButtonLike[];
}

export interface GamepadPollResult {
  connected: boolean;
  moveX: number;
  moveZ: number;
  lookYawDelta: number;
  lookPitchDelta: number;
  lightHeld: boolean;
  justPressed: {
    light: boolean;
    heavy: boolean;
    dodge: boolean;
    parry: boolean;
    interact: boolean;
    echoRelay: boolean;
    echoRecord: boolean;
    echoReplay: boolean;
    echoClear: boolean;
    switchWeapon: boolean;
    gravityPin: boolean;
    echoCollapse: boolean;
    pause: boolean;
    map: boolean;
  };
  nextButtonsMask: number;
}

function applyStickDeadzone(raw: number, deadzone = GAMEPAD_STICK_DEADZONE): number {
  if (!Number.isFinite(raw)) return 0;
  const abs = Math.abs(raw);
  if (abs <= deadzone) return 0;
  const norm = (abs - deadzone) / (1 - deadzone);
  // Subtle quadratic curve for fine camera aim & responsive movement
  const curved = norm * (0.45 + 0.55 * norm);
  return Math.max(-1, Math.min(1, raw < 0 ? -curved : curved));
}

function isGamepadButtonDown(
  buttons: readonly GamepadButtonLike[],
  index: number
): boolean {
  const b = buttons[index];
  if (!b) return false;
  if (b.pressed) return true;
  return typeof b.value === 'number' && b.value >= GAMEPAD_TRIGGER_THRESHOLD;
}

/**
 * Polls a standard W3C Gamepad snapshot using zero-GC bitmask edge detection.
 * Standard mapping:
 *  0: A (Dodge), 1: B (Interact), 2: X (Light), 3: Y (Heavy)
 *  4: LB (Parry), 5: RB (Light), 6: LT (Echo Relay), 7: RT (Heavy)
 *  8: Back/View (Map), 9: Start/Menu (Pause)
 * 10: L3 (Echo Collapse), 11: R3 (Gravity Pin)
 * 12: D-Up (Echo Record), 13: D-Down (Echo Clear), 14: D-Left (Switch Weapon), 15: D-Right (Echo Replay)
 */
export function pollGamepadInput(
  pad: GamepadLike | null | undefined,
  prevButtonsMask: number,
  sensitivity: number,
  invertY: boolean,
  dt: number
): GamepadPollResult {
  if (!pad || pad.connected === false) {
    return {
      connected: false,
      moveX: 0,
      moveZ: 0,
      lookYawDelta: 0,
      lookPitchDelta: 0,
      lightHeld: false,
      justPressed: {
        light: false,
        heavy: false,
        dodge: false,
        parry: false,
        interact: false,
        echoRelay: false,
        echoRecord: false,
        echoReplay: false,
        echoClear: false,
        switchWeapon: false,
        gravityPin: false,
        echoCollapse: false,
        pause: false,
        map: false,
      },
      nextButtonsMask: 0,
    };
  }

  const axes = pad.axes ?? [];
  const buttons = pad.buttons ?? [];

  let moveX = applyStickDeadzone(axes[0] ?? 0);
  let moveZ = applyStickDeadzone(axes[1] ?? 0);
  const moveMag = Math.hypot(moveX, moveZ);
  if (moveMag > 1) {
    moveX /= moveMag;
    moveZ /= moveMag;
  }

  const rightStickX = applyStickDeadzone(axes[2] ?? 0);
  const rightStickY = applyStickDeadzone(axes[3] ?? 0);
  const turnSpeed = GAME_CONFIG.camera.keyboardTurnSpeed * 1.15 * sensitivity;
  const invertSign = invertY ? -1 : 1;

  const lookYawDelta = rightStickX === 0 ? 0 : -rightStickX * turnSpeed * dt;
  const lookPitchDelta = rightStickY === 0 ? 0 : rightStickY * turnSpeed * 0.7 * dt * invertSign;

  let nextButtonsMask = 0;
  const maxBtns = Math.min(buttons.length, 20);
  for (let i = 0; i < maxBtns; i++) {
    if (isGamepadButtonDown(buttons, i)) {
      nextButtonsMask |= 1 << i;
    }
  }

  const edge = (idx: number): boolean =>
    (nextButtonsMask & (1 << idx)) !== 0 && (prevButtonsMask & (1 << idx)) === 0;
  const held = (idx: number): boolean => (nextButtonsMask & (1 << idx)) !== 0;

  return {
    connected: true,
    moveX,
    moveZ,
    lookYawDelta,
    lookPitchDelta,
    lightHeld: held(2) || held(5),
    justPressed: {
      dodge: edge(0),
      interact: edge(1),
      light: edge(2) || edge(5),
      heavy: edge(3) || edge(7),
      parry: edge(4),
      echoRelay: edge(6),
      map: edge(8),
      pause: edge(9),
      echoCollapse: edge(10),
      gravityPin: edge(11),
      echoRecord: edge(12),
      echoClear: edge(13),
      switchWeapon: edge(14),
      echoReplay: edge(15),
    },
    nextButtonsMask,
  };
}
