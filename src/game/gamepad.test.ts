import test from 'node:test';
import assert from 'node:assert/strict';
import {
  pollGamepadInput,
  computeHapticImpulseForEvents,
  type GamepadLike,
} from './gamepad.ts';

function makePad(overrides: Partial<GamepadLike> = {}): GamepadLike {
  return {
    connected: true,
    axes: [0, 0, 0, 0],
    buttons: Array.from({ length: 16 }, () => ({ pressed: false, value: 0 })),
    ...overrides,
  };
}

test('pollGamepadInput enforces radial deadzone and clamps diagonal stick movement', () => {
  const smallDrift = makePad({ axes: [0.1, -0.15, 0.08, -0.05] });
  const r1 = pollGamepadInput(smallDrift, 0, 1.0, false, 1 / 60);
  assert.equal(r1.connected, true);
  assert.equal(r1.moveX, 0);
  assert.equal(r1.moveZ, 0);
  assert.equal(r1.lookYawDelta, 0);
  assert.equal(r1.lookPitchDelta, 0);

  const diagMove = makePad({ axes: [1, 1, 0.8, -0.6] });
  const r2 = pollGamepadInput(diagMove, 0, 1.0, false, 1 / 60);
  assert.ok(Math.hypot(r2.moveX, r2.moveZ) <= 1.0001);
  assert.ok(r2.lookYawDelta < 0);
  assert.ok(r2.lookPitchDelta < 0);

  const inverted = pollGamepadInput(diagMove, 0, 1.0, true, 1 / 60);
  assert.ok(inverted.lookPitchDelta > 0);
});

test('pollGamepadInput emits single-frame edge triggers for combat/echo buttons and supports triggers', () => {
  const btns = Array.from({ length: 16 }, () => ({ pressed: false, value: 0 }));
  btns[0] = { pressed: true, value: 1 }; // A -> Dodge
  btns[4] = { pressed: true, value: 1 }; // LB -> Parry
  btns[7] = { pressed: false, value: 0.72 }; // RT analog -> Heavy
  btns[12] = { pressed: true, value: 1 }; // D-Up -> Echo Record
  btns[9] = { pressed: true, value: 1 }; // Start -> Pause

  const frame1 = pollGamepadInput(makePad({ buttons: btns }), 0, 1.0, false, 1 / 60);
  assert.equal(frame1.justPressed.dodge, true);
  assert.equal(frame1.justPressed.parry, true);
  assert.equal(frame1.justPressed.heavy, true);
  assert.equal(frame1.justPressed.echoRecord, true);
  assert.equal(frame1.justPressed.pause, true);

  // Holding the exact same buttons on frame 2 must NOT re-trigger edge events
  const frame2 = pollGamepadInput(
    makePad({ buttons: btns }),
    frame1.nextButtonsMask,
    1.0,
    false,
    1 / 60
  );
  assert.equal(frame2.justPressed.dodge, false);
  assert.equal(frame2.justPressed.parry, false);
  assert.equal(frame2.justPressed.heavy, false);
  assert.equal(frame2.justPressed.echoRecord, false);
  assert.equal(frame2.justPressed.pause, false);

  // Disconnected pad clears safely
  const disconnected = pollGamepadInput(null, frame1.nextButtonsMask, 1.0, false, 1 / 60);
  assert.equal(disconnected.connected, false);
  assert.equal(disconnected.nextButtonsMask, 0);
});

test('computeHapticImpulseForEvents prioritizes finishers/boss beats and clamps for reducedMotion', () => {
  assert.equal(computeHapticImpulseForEvents([], false), null);
  assert.equal(computeHapticImpulseForEvents(null, false), null);
  assert.equal(
    computeHapticImpulseForEvents([{ type: 'player_light_swing', x: 0, z: 0 }], false),
    null
  );

  const mixed = computeHapticImpulseForEvents(
    [
      { type: 'player_damaged', x: 0, z: 0 },
      { type: 'player_parry_success', x: 1, z: 1 },
      { type: 'chrono_execution_finisher', x: 2, z: 2 },
    ],
    false
  );
  assert.ok(mixed !== null);
  assert.ok(mixed.strongMagnitude >= 0.85 && mixed.strongMagnitude <= 1);
  assert.ok(mixed.weakMagnitude >= 0.65 && mixed.weakMagnitude <= 1);
  assert.ok(mixed.durationMs >= 160);

  const parry = computeHapticImpulseForEvents(
    [{ type: 'player_parry_success', x: 0, z: 0 }],
    false
  );
  assert.ok(parry !== null);
  assert.ok(parry.strongMagnitude < mixed.strongMagnitude);

  const reduced = computeHapticImpulseForEvents(
    [{ type: 'boss_defeated', x: 0, z: 0 }],
    true
  );
  assert.ok(reduced !== null);
  assert.ok(reduced.strongMagnitude <= 0.35);
  assert.ok(reduced.weakMagnitude <= 0.25);
  assert.ok(reduced.durationMs <= 90);
});

