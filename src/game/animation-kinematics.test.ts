import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeDampAlpha,
  dampScalar,
  computeOrganicBreath,
  computeSquashStretch,
  computePropFloatMotion,
  computeStrobeIntensity,
  computeDirectionalDodgeTilt,
} from './animation-kinematics';
import { createInitialWorld, canModifyWeaponUpgrades } from './simulation';

test('computeDampAlpha is frame-rate independent, bounded in [0, 1], and snaps on reducedMotion', () => {
  const a60 = computeDampAlpha(18, 1 / 60, false);
  const a30 = computeDampAlpha(18, 1 / 30, false);
  assert.ok(a60 > 0 && a60 < 1);
  assert.ok(a30 > a60 && a30 < 1);

  // Two 60Hz steps should match one 30Hz step within floating-point tolerance
  const afterTwo60 = dampScalar(dampScalar(0, 1, a60), 1, a60);
  const afterOne30 = dampScalar(0, 1, a30);
  assert.ok(Math.abs(afterTwo60 - afterOne30) < 1e-6);

  assert.equal(computeDampAlpha(18, 1 / 60, true), 1);
  assert.equal(computeDampAlpha(18, 0, false), 0);
});

test('computeOrganicBreath produces bounded, non-static multi-harmonic motion and zeros on reducedMotion', () => {
  const s1 = computeOrganicBreath(0.4, 0, 2.35, false);
  const s2 = computeOrganicBreath(1.15, 0, 2.35, false);
  for (const s of [s1, s2]) {
    assert.ok(s.chest >= -1 && s.chest <= 1);
    assert.ok(s.sway >= -1 && s.sway <= 1);
    assert.ok(s.headScan >= -1 && s.headScan <= 1);
    assert.ok(s.weaponFloat >= -1 && s.weaponFloat <= 1);
  }
  assert.notEqual(s1.chest, s2.chest);
  assert.notEqual(s1.headScan, s2.headScan);

  const reduced = computeOrganicBreath(1.15, 0, 2.35, true);
  assert.deepEqual(reduced, { chest: 0, sway: 0, headScan: 0, weaponFloat: 0 });
});

test('computeSquashStretch preserves approximate volume and clamps extremes', () => {
  const slam = computeSquashStretch(0.9, 0, false);
  assert.ok(slam.scaleY < 1);
  assert.ok(slam.scaleXZ > 1);
  assert.ok(Math.abs(slam.scaleXZ * slam.scaleXZ * slam.scaleY - 1) < 1e-6);

  const lunge = computeSquashStretch(0, 0.9, false);
  assert.ok(lunge.scaleY > 1);
  assert.ok(lunge.scaleXZ < 1);
  assert.ok(Math.abs(lunge.scaleXZ * lunge.scaleXZ * lunge.scaleY - 1) < 1e-6);

  const reduced = computeSquashStretch(1, 0, true);
  assert.deepEqual(reduced, { scaleXZ: 1, scaleY: 1 });
});

test('computePropFloatMotion and computeStrobeIntensity animate smoothly and respect reducedMotion', () => {
  const pA = computePropFloatMotion(0.25, 1, 0.12, false);
  const pB = computePropFloatMotion(1.1, 1, 0.12, false);
  assert.ok(Math.abs(pA.offsetY) <= 0.1201);
  assert.notEqual(pA.offsetY, pB.offsetY);
  assert.ok(pA.pulseScale > 0.9 && pA.pulseScale < 1.1);

  const pReduced = computePropFloatMotion(1.1, 1, 0.12, true);
  assert.deepEqual(pReduced, { offsetY: 0, tiltX: 0, tiltZ: 0, pulseScale: 1 });

  const strobeLow = computeStrobeIntensity(0.75, 0, 1, false);
  const strobePeak = computeStrobeIntensity(0.24, 0, 1, false);
  assert.ok(strobeLow >= 0.35 && strobeLow <= 1.85);
  assert.ok(strobePeak >= 0.35 && strobePeak <= 1.85);
  assert.notEqual(strobeLow, strobePeak);
  assert.equal(computeStrobeIntensity(0.24, 0, 1, true), 0.75);
});

test('computeDirectionalDodgeTilt banks accurately for forward, backward, lateral, and reducedMotion dodges', () => {
  // Facing +Z (yaw = 0)
  const fwd = computeDirectionalDodgeTilt(0, 12, 0, false);
  assert.ok(fwd.bodyRotX > 0.45);
  assert.ok(Math.abs(fwd.bodyRotZ) < 1e-6);

  const back = computeDirectionalDodgeTilt(0, -12, 0, false);
  assert.ok(back.bodyRotX < -0.25);

  const right = computeDirectionalDodgeTilt(12, 0, 0, false);
  const left = computeDirectionalDodgeTilt(-12, 0, 0, false);
  assert.ok(right.bodyRotZ < -0.35);
  assert.ok(left.bodyRotZ > 0.35);
  assert.ok(right.torsoRotY > 0.2 && left.torsoRotY < -0.2);

  const reduced = computeDirectionalDodgeTilt(12, 0, 0, true);
  assert.deepEqual(reduced, { bodyRotX: 0.22, bodyRotZ: 0, torsoRotY: 0 });
});

test('canModifyWeaponUpgrades allows post-victory upgrades even when finishing blow froze actionState', () => {
  const world = createInitialWorld();
  world.outcome = 'none';
  world.player.actionState = 'light_active';
  assert.equal(canModifyWeaponUpgrades(world), false);

  world.outcome = 'victory';
  assert.equal(canModifyWeaponUpgrades(world), true);

  world.player.actionState = 'dodging';
  assert.equal(canModifyWeaponUpgrades(world), true);

  world.outcome = 'defeat';
  assert.equal(canModifyWeaponUpgrades(world), false);
});
