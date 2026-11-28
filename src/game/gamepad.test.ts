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

test('pollGamepadInput detects LB+RB Confluence Burst [9] and LT+RT Stasis Overdrive [`] chords while suppressing single-button edges', () => {
  // Simultaneous LB (4) + RB (5) press triggers confluenceBurst and suppresses parry/light
  const lbRbBtns = Array.from({ length: 16 }, () => ({ pressed: false, value: 0 }));
  lbRbBtns[4] = { pressed: true, value: 1 };
  lbRbBtns[5] = { pressed: true, value: 1 };

  const f1 = pollGamepadInput(makePad({ buttons: lbRbBtns }), 0, 1.0, false, 1 / 60);
  assert.equal(f1.justPressed.confluenceBurst, true);
  assert.equal(f1.justPressed.parry, false);
  assert.equal(f1.justPressed.light, false);
  assert.equal(f1.lightHeld, false);

  // Holding LB + RB on frame 2 does NOT re-trigger confluenceBurst
  const f2 = pollGamepadInput(makePad({ buttons: lbRbBtns }), f1.nextButtonsMask, 1.0, false, 1 / 60);
  assert.equal(f2.justPressed.confluenceBurst, false);

  // Sequential LT (6) on frame A -> adding RT (7) on frame B triggers overdrive without firing heavy
  const ltOnly = Array.from({ length: 16 }, () => ({ pressed: false, value: 0 }));
  ltOnly[6] = { pressed: false, value: 0.85 };
  const fA = pollGamepadInput(makePad({ buttons: ltOnly }), 0, 1.0, false, 1 / 60);
  assert.equal(fA.justPressed.echoRelay, true);
  assert.equal(fA.justPressed.overdrive, false);

  const ltRt = Array.from({ length: 16 }, () => ({ pressed: false, value: 0 }));
  ltRt[6] = { pressed: false, value: 0.85 };
  ltRt[7] = { pressed: false, value: 0.9 };
  const fB = pollGamepadInput(makePad({ buttons: ltRt }), fA.nextButtonsMask, 1.0, false, 1 / 60);
  assert.equal(fB.justPressed.overdrive, true);
  assert.equal(fB.justPressed.heavy, false);
  assert.equal(fB.justPressed.echoRelay, false);
});

test('computeHapticImpulseForEvents covers Confluence Burst, OMEGA Awakening, Stasis Overdrive, and Nova Pulse priorities', () => {
  const confluence = computeHapticImpulseForEvents(
    [{ type: 'confluence_burst_triggered', x: 0, z: 0 }],
    false
  );
  const overdrive = computeHapticImpulseForEvents(
    [{ type: 'chrono_overdrive_activated', x: 0, z: 0 }],
    false
  );
  const nova = computeHapticImpulseForEvents(
    [{ type: 'echo_doctrine_nova_pulse', x: 0, z: 0 }],
    false
  );
  assert.ok(confluence !== null && confluence.priority === 6);
  assert.ok(overdrive !== null && overdrive.priority === 5);
  assert.ok(nova !== null && nova.priority === 3);
  assert.ok(confluence.strongMagnitude > overdrive.strongMagnitude);
  assert.ok(overdrive.strongMagnitude > nova.strongMagnitude);
});


