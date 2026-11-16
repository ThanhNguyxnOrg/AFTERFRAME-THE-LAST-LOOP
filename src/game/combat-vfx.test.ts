import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeBossTelegraphVisuals,
  computeEnemyDeRezState,
  computeScreenFlashTint,
} from './combat-vfx';

test('computeBossTelegraphVisuals maps vector_ram unlocked and locked states cleanly', () => {
  const unlocked = computeBossTelegraphVisuals('vector_ram', 0.35, false, false);
  assert.equal(unlocked.mode, 'lane');
  assert.equal(unlocked.locked, false);
  assert.equal(unlocked.primaryHex, 0xf59e0b);
  assert.equal(unlocked.progress, 0.35);
  assert.ok(unlocked.chevronSpeed > 0);
  assert.ok(unlocked.fillOpacity > 0.2 && unlocked.fillOpacity < 0.8);

  const locked = computeBossTelegraphVisuals('vector_ram', 1.4, true, false);
  assert.equal(locked.mode, 'lane');
  assert.equal(locked.locked, true);
  assert.equal(locked.progress, 1);
  assert.equal(locked.primaryHex, 0xef4444);
  assert.equal(locked.edgeHex, 0xffffff);
  assert.ok(locked.fillOpacity >= unlocked.fillOpacity);

  const reduced = computeBossTelegraphVisuals('vector_ram', 0.6, true, true);
  assert.equal(reduced.chevronSpeed, 0);
  assert.equal(reduced.pulseStrength, 0);
});

test('computeBossTelegraphVisuals handles helical_sweep and anchor_slam modes', () => {
  const sweep = computeBossTelegraphVisuals('helical_sweep', 0.5, false, false);
  assert.equal(sweep.mode, 'sweep');
  assert.equal(sweep.primaryHex, 0xf59e0b);
  assert.ok(sweep.sweepFillFrac >= 0.45 && sweep.sweepFillFrac <= 0.6);

  const sweepLocked = computeBossTelegraphVisuals('helical_sweep', 0.85, true, false);
  assert.equal(sweepLocked.mode, 'sweep');
  assert.equal(sweepLocked.primaryHex, 0xef4444);
  assert.ok(sweepLocked.sweepFillFrac > sweep.sweepFillFrac);

  const slam = computeBossTelegraphVisuals('anchor_slam', -0.2, false, false);
  assert.equal(slam.mode, 'radial');
  assert.equal(slam.progress, 0);
});

test('computeEnemyDeRezState computes temporal collapse transform and fades cleanly to 0', () => {
  const start = computeEnemyDeRezState(0, false);
  assert.equal(start.toppleAngle, 0);
  assert.equal(start.horizontalScale, 1);
  assert.equal(start.verticalScale, 1);
  assert.equal(start.opacityFade, 1);
  assert.equal(start.sinkY, 0);

  const mid = computeEnemyDeRezState(0.5, false);
  assert.ok(mid.toppleAngle < -0.5);
  assert.ok(mid.horizontalScale > 1);
  assert.ok(mid.verticalScale < 1 && mid.verticalScale > 0.2);
  assert.ok(mid.emissiveIntensity > start.emissiveIntensity);
  assert.ok(mid.opacityFade > 0.2 && mid.opacityFade < 0.9);

  const end = computeEnemyDeRezState(1.2, false);
  assert.equal(end.opacityFade, 0);
  assert.ok(end.verticalScale <= 0.15);
  assert.ok(end.sinkY < -0.25);

  const reducedMid = computeEnemyDeRezState(0.5, true);
  assert.equal(reducedMid.pulseStrength, 0);
  assert.ok(reducedMid.verticalScale < 1);
});

test('computeScreenFlashTint prioritizes parry, convergence, finisher, dodge, and damage', () => {
  assert.equal(computeScreenFlashTint([], false), null);
  assert.equal(computeScreenFlashTint(null, false), null);
  assert.equal(
    computeScreenFlashTint([{ type: 'player_light_swing', x: 0, z: 0 }], false),
    null
  );

  const parry = computeScreenFlashTint([{ type: 'player_parry_success', x: 0, z: 0 }], false);
  assert.ok(parry !== null);
  assert.equal(parry.tone, 'parry');
  assert.ok(parry.maxOpacity > 0.2 && parry.maxOpacity <= 0.5);

  const dodge = computeScreenFlashTint([{ type: 'player_perfect_dodge', x: 0, z: 0 }], false);
  assert.ok(dodge !== null);
  assert.equal(dodge.tone, 'dodge');

  const conv = computeScreenFlashTint(
    [
      { type: 'player_damaged', x: 0, z: 0 },
      { type: 'resonance_convergence', x: 1, z: 1 },
    ],
    false
  );
  assert.ok(conv !== null);
  assert.equal(conv.tone, 'convergence');

  const finisherReduced = computeScreenFlashTint(
    [{ type: 'chrono_execution_finisher', x: 0, z: 0 }],
    true
  );
  assert.ok(finisherReduced !== null);
  assert.equal(finisherReduced.tone, 'finisher');
  assert.ok(finisherReduced.maxOpacity <= 0.14);
  assert.ok(finisherReduced.durationMs <= 140);
});

