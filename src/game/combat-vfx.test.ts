import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeBossTelegraphVisuals,
  computeChronoAuraVisuals,
  computeEchoTetherVisuals,
  computeEnemyDeRezState,
  computeLockOnGroundVisuals,
  computeScreenFlashTint,
} from './combat-vfx';

test('aura and lock visuals reuse caller outputs and fully overwrite inactive state', () => {
  const auraInput = {
    adrenalineScore: 5, riposteActive: true, chronoSlipActive: false,
    kineticSurgeActive: false, isRecording: true, reducedMotion: false, timeSec: 1,
  };
  const aura = computeChronoAuraVisuals(auraInput);
  assert.equal(computeChronoAuraVisuals(auraInput, aura), aura);
  auraInput.adrenalineScore = NaN;
  auraInput.riposteActive = false;
  auraInput.isRecording = false;
  auraInput.reducedMotion = true;
  assert.deepEqual(computeChronoAuraVisuals(auraInput, aura), computeChronoAuraVisuals(auraInput));
  const lockInput = {
    active: true, isBoss: true, targetRadius: NaN, isStaggered: true,
    isTelegraphing: false, isResonanceMarked: true, coreExposed: true,
    reducedMotion: false, timeSec: 1,
  };
  const lock = computeLockOnGroundVisuals(lockInput);
  assert.equal(computeLockOnGroundVisuals(lockInput, lock), lock);
  lockInput.active = false;
  assert.equal(computeLockOnGroundVisuals(lockInput, lock), lock);
  assert.deepEqual(lock, computeLockOnGroundVisuals(lockInput));
  lockInput.active = true;
  lockInput.reducedMotion = true;
  assert.deepEqual(computeLockOnGroundVisuals(lockInput, lock), computeLockOnGroundVisuals(lockInput));
});

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

test('computeChronoAuraVisuals scales dorsal ring intensity, ground aura, and overdrive gold cleanly', () => {
  const idle = computeChronoAuraVisuals({
    adrenalineScore: 0,
    riposteActive: false,
    chronoSlipActive: false,
    kineticSurgeActive: false,
    isRecording: false,
    reducedMotion: false,
    timeSec: 1.0,
  });
  assert.equal(idle.tier, 0);
  assert.equal(idle.groundAuraOpacity, 0);
  assert.equal(idle.ringHex, 0x38bdf8);

  const recording = computeChronoAuraVisuals({
    adrenalineScore: 0,
    riposteActive: false,
    chronoSlipActive: false,
    kineticSurgeActive: false,
    isRecording: true,
    reducedMotion: false,
    timeSec: 1.0,
  });
  assert.equal(recording.ringHex, 0xf59e0b);
  assert.ok(recording.groundAuraOpacity > 0);

  const overdrive = computeChronoAuraVisuals({
    adrenalineScore: 5.4,
    riposteActive: false,
    chronoSlipActive: false,
    kineticSurgeActive: false,
    isRecording: false,
    reducedMotion: false,
    timeSec: 1.0,
  });
  assert.equal(overdrive.tier, 5);
  assert.equal(overdrive.ringHex, 0xfbbf24);
  assert.ok(overdrive.emissiveIntensity > idle.emissiveIntensity);
  assert.ok(overdrive.spinMultiplier > 2.0);
  assert.ok(overdrive.groundAuraOpacity > 0.3);
  assert.ok(overdrive.groundAuraScale > idle.groundAuraScale);

  const reduced = computeChronoAuraVisuals({
    adrenalineScore: 3.1,
    riposteActive: true,
    chronoSlipActive: false,
    kineticSurgeActive: false,
    isRecording: false,
    reducedMotion: true,
    timeSec: 2.3,
  });
  assert.equal(reduced.ringHex, 0xfef08a);
  assert.equal(reduced.echoShimmerOpacity, 0.48);
});

test('computeLockOnGroundVisuals adapts radius, priority colors, and reducedMotion cleanly', () => {
  const inactive = computeLockOnGroundVisuals({
    active: false,
    isBoss: false,
    targetRadius: 0.7,
    isStaggered: false,
    isTelegraphing: false,
    isResonanceMarked: false,
    coreExposed: false,
    reducedMotion: false,
    timeSec: 1.0,
  });
  assert.equal(inactive.visible, false);

  const normal = computeLockOnGroundVisuals({
    active: true,
    isBoss: false,
    targetRadius: 0.65,
    isStaggered: false,
    isTelegraphing: false,
    isResonanceMarked: false,
    coreExposed: false,
    reducedMotion: false,
    timeSec: 1.0,
  });
  assert.equal(normal.visible, true);
  assert.equal(normal.outerHex, 0x38bdf8);
  assert.ok(normal.outerRadius >= 0.9);
  assert.ok(normal.outerSpinRate > 0);

  const bossTelegraph = computeLockOnGroundVisuals({
    active: true,
    isBoss: true,
    targetRadius: 1.4,
    isStaggered: false,
    isTelegraphing: true,
    isResonanceMarked: true,
    coreExposed: false,
    reducedMotion: false,
    timeSec: 1.0,
  });
  assert.equal(bossTelegraph.outerHex, 0xef4444);
  assert.ok(bossTelegraph.outerRadius > normal.outerRadius);

  const staggeredGold = computeLockOnGroundVisuals({
    active: true,
    isBoss: true,
    targetRadius: 1.4,
    isStaggered: true,
    isTelegraphing: true,
    isResonanceMarked: true,
    coreExposed: true,
    reducedMotion: true,
    timeSec: 2.5,
  });
  assert.equal(staggeredGold.outerHex, 0xfbbf24);
  assert.equal(staggeredGold.outerSpinRate, 0);
  assert.equal(staggeredGold.innerSpinRate, 0);
  assert.equal(staggeredGold.pulseScale, 1);
});

test('computeEchoTetherVisuals boosts beam thickness and shifts to gold when Resonance Convergence is primed', () => {
  const tooClose = computeEchoTetherVisuals({
    distance: 0.2,
    resonancePrimed: false,
    relayReady: false,
    reducedMotion: false,
    timeSec: 0.5,
  });
  assert.equal(tooClose.visible, false);

  const relay = computeEchoTetherVisuals({
    distance: 4.5,
    resonancePrimed: false,
    relayReady: true,
    reducedMotion: false,
    timeSec: 0.5,
  });
  assert.equal(relay.visible, true);
  assert.equal(relay.hex, 0x22d3ee);
  assert.ok(relay.thicknessScale > 1);

  const primed = computeEchoTetherVisuals({
    distance: 4.5,
    resonancePrimed: true,
    relayReady: true,
    reducedMotion: true,
    timeSec: 0.5,
  });
  assert.equal(primed.visible, true);
  assert.equal(primed.hex, 0xfde047);
  assert.ok(primed.thicknessScale > relay.thicknessScale);
  assert.ok(primed.opacity > relay.opacity);
});


