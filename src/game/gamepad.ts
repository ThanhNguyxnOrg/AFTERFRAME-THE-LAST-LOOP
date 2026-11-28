import { GAME_CONFIG } from './config.ts';
import type { CombatEvent } from './types.ts';

export const GAMEPAD_STICK_DEADZONE = 0.18;
export const GAMEPAD_TRIGGER_THRESHOLD = 0.35;

export interface HapticImpulse {
  strongMagnitude: number;
  weakMagnitude: number;
  durationMs: number;
  priority: number;
}

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
    confluenceBurst: boolean;
    overdrive: boolean;
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
 *  Chords: LB + RB (4 + 5) -> Confluence Burst [9]; LT + RT (6 + 7) -> Stasis Overdrive [`]
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
        confluenceBurst: false,
        overdrive: false,
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
  const prevHeld = (idx: number): boolean => (prevButtonsMask & (1 << idx)) !== 0;

  // Shoulder & Trigger Chords (suppress constituent single-button edges on chord activation frame)
  const lbRbNow = held(4) && held(5);
  const lbRbPrev = prevHeld(4) && prevHeld(5);
  const confluenceBurstEdge = lbRbNow && !lbRbPrev;

  const ltRtNow = held(6) && held(7);
  const ltRtPrev = prevHeld(6) && prevHeld(7);
  const overdriveEdge = ltRtNow && !ltRtPrev;

  return {
    connected: true,
    moveX,
    moveZ,
    lookYawDelta,
    lookPitchDelta,
    lightHeld: !lbRbNow && (held(2) || held(5)),
    justPressed: {
      dodge: edge(0),
      interact: edge(1),
      light: edge(2) || (!confluenceBurstEdge && edge(5)),
      heavy: edge(3) || (!overdriveEdge && edge(7)),
      parry: !confluenceBurstEdge && edge(4),
      echoRelay: !overdriveEdge && edge(6),
      map: edge(8),
      pause: edge(9),
      echoCollapse: edge(10),
      gravityPin: edge(11),
      confluenceBurst: confluenceBurstEdge,
      overdrive: overdriveEdge,
      echoRecord: edge(12),
      echoClear: edge(13),
      switchWeapon: edge(14),
      echoReplay: edge(15),
    },
    nextButtonsMask,
  };
}

export function computeHapticImpulseForEvents(
  events: readonly CombatEvent[] | null | undefined,
  reducedMotion: boolean
): HapticImpulse | null {
  if (!events || events.length === 0) return null;

  let best: HapticImpulse | null = null;
  const consider = (candidate: HapticImpulse) => {
    if (!best || candidate.priority > best.priority) {
      best = candidate;
    }
  };

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    switch (ev.type) {
      case 'chrono_execution_finisher':
      case 'boss_defeated':
      case 'confluence_burst_triggered':
      case 'boss_core_omega_awakened':
        consider({ strongMagnitude: 0.96, weakMagnitude: 0.76, durationMs: 200, priority: 6 });
        break;
      case 'boss_phase_transition':
      case 'boss_staggered':
      case 'resonance_convergence':
      case 'chrono_overdrive_activated':
        consider({ strongMagnitude: 0.78, weakMagnitude: 0.56, durationMs: 160, priority: 5 });
        break;
      case 'player_parry_success':
      case 'player_riposte_strike':
      case 'boss_core_pulse':
      case 'chrono_ward_shatter':
        consider({ strongMagnitude: 0.7, weakMagnitude: 0.44, durationMs: 135, priority: 4 });
        break;
      case 'breaker_shockwave_slam':
      case 'player_breaker_heavy_slam':
      case 'active_vent_success':
      case 'echo_collapse_detonated':
      case 'echo_doctrine_nova_pulse':
        consider({ strongMagnitude: 0.58, weakMagnitude: 0.36, durationMs: 120, priority: 3 });
        break;
      case 'player_perfect_dodge':
      case 'player_damaged':
      case 'timed_hazard_damaged_player':
        consider({ strongMagnitude: 0.44, weakMagnitude: 0.28, durationMs: 100, priority: 2 });
        break;
      case 'adrenaline_tier_changed':
        if ((ev.postureBonus ?? 0) > 0 && (ev.amount ?? 0) >= 3) {
          consider({ strongMagnitude: 0.48, weakMagnitude: 0.3, durationMs: 105, priority: 2 });
        }
        break;
      case 'player_hit_enemy':
        if (ev.isCriticalOrVulnerable) {
          consider({ strongMagnitude: 0.3, weakMagnitude: 0.18, durationMs: 75, priority: 1 });
        }
        break;
      default:
        break;
    }
  }

  if (!best) return null;
  const impulse: HapticImpulse = best;
  if (!reducedMotion) return impulse;

  return {
    priority: impulse.priority,
    strongMagnitude: Math.min(0.35, Number((impulse.strongMagnitude * 0.4).toFixed(3))),
    weakMagnitude: Math.min(0.25, Number((impulse.weakMagnitude * 0.35).toFixed(3))),
    durationMs: Math.min(90, Math.round(impulse.durationMs * 0.5)),
  };
}

interface ActuatorLike {
  playEffect?: (
    type: string,
    params: {
      startDelay: number;
      duration: number;
      weakMagnitude: number;
      strongMagnitude: number;
    }
  ) => Promise<unknown>;
}

export function triggerGamepadHaptics(
  events: readonly CombatEvent[] | null | undefined,
  reducedMotion: boolean,
  activeIndex?: number | null
): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.getGamepads !== 'function') {
    return false;
  }
  const impulse = computeHapticImpulseForEvents(events, reducedMotion);
  if (!impulse) return false;

  try {
    const pads = navigator.getGamepads();
    let pad: Gamepad | null = null;

    if (typeof activeIndex === 'number') {
      pad = pads?.[activeIndex] ?? null;
    } else if (pads) {
      for (let i = 0; i < pads.length; i++) {
        if (pads[i]?.connected) {
          pad = pads[i];
          break;
        }
      }
    }

    const actuator = (pad as (Gamepad & { vibrationActuator?: ActuatorLike }) | null)
      ?.vibrationActuator;
    const playEffect = actuator?.playEffect;
    if (typeof playEffect !== 'function') return false;
    void playEffect
      .call(actuator, 'dual-rumble', {
        startDelay: 0,
        duration: impulse.durationMs,
        weakMagnitude: Math.max(0, Math.min(1, impulse.weakMagnitude)),
        strongMagnitude: Math.max(0, Math.min(1, impulse.strongMagnitude)),
      })
      ?.catch?.(() => {});
    return true;
  } catch {
    return false;
  }
}

