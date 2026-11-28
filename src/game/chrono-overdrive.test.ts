import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BOSS_GAUNTLET_STAGES,
  OVERDRIVE_DAMAGE_MULT,
  OVERDRIVE_DURATION_SEC,
  OVERDRIVE_ENEMY_TIME_SCALE,
  OVERDRIVE_PLAYER_SPEED_MULT,
  OVERDRIVE_STAGGER_MULT,
  activateChronoOverdrive,
  addOverdriveCharge,
  advanceBossGauntletStage,
  canActivateChronoOverdrive,
  createInitialBossGauntletState,
  createInitialChronoOverdriveState,
  formatGauntletClock,
  getOverdriveTimeScales,
  tickChronoOverdrive,
} from './chrono-overdrive.ts';

test('Chrono Overdrive builds charge cleanly, rejects activation below 100%, and triggers dilation at 100%', () => {
  let state = createInitialChronoOverdriveState(25);
  assert.equal(state.charge, 25);
  assert.equal(canActivateChronoOverdrive(state, false), false);

  const rejected = activateChronoOverdrive(state, false);
  assert.equal(rejected.activated, false);
  assert.equal(rejected.state.active, false);

  state = addOverdriveCharge(state, 50);
  assert.equal(state.charge, 75);
  state = addOverdriveCharge(state, 40);
  assert.equal(state.charge, 100);
  assert.equal(canActivateChronoOverdrive(state, false), true);
  assert.equal(canActivateChronoOverdrive(state, true), false);

  const triggered = activateChronoOverdrive(state, false);
  assert.equal(triggered.activated, true);
  assert.equal(triggered.state.active, true);
  assert.equal(triggered.state.charge, 0);
  assert.equal(triggered.state.remainingTimer, OVERDRIVE_DURATION_SEC);
  assert.equal(triggered.state.activationCount, 1);

  const scales = getOverdriveTimeScales(triggered.state);
  assert.equal(scales.enemyTimeScale, OVERDRIVE_ENEMY_TIME_SCALE);
  assert.equal(scales.playerSpeedMult, OVERDRIVE_PLAYER_SPEED_MULT);
  assert.equal(scales.damageMult, OVERDRIVE_DAMAGE_MULT);
  assert.equal(scales.staggerMult, OVERDRIVE_STAGGER_MULT);
  assert.equal(scales.heatLockZero, true);

  // Charge does not accumulate while Overdrive is actively running
  const ignoredGain = addOverdriveCharge(triggered.state, 30);
  assert.equal(ignoredGain.charge, 0);
});

test('Chrono Overdrive countdown ticks cleanly and restores normal time scale on expiry', () => {
  const ready = createInitialChronoOverdriveState(100);
  let { state } = activateChronoOverdrive(ready, false);

  const mid = tickChronoOverdrive(state, 2.0);
  assert.equal(mid.justEnded, false);
  assert.equal(mid.state.active, true);
  assert.ok(Math.abs(mid.state.remainingTimer - (OVERDRIVE_DURATION_SEC - 2.0)) < 0.001);

  const end = tickChronoOverdrive(mid.state, 3.0);
  assert.equal(end.justEnded, true);
  assert.equal(end.state.active, false);
  assert.equal(end.state.remainingTimer, 0);

  const normalScales = getOverdriveTimeScales(end.state);
  assert.equal(normalScales.enemyTimeScale, 1);
  assert.equal(normalScales.playerSpeedMult, 1);
  assert.equal(normalScales.damageMult, 1);
  assert.equal(normalScales.heatLockZero, false);
});

test('Sovereign Boss Gauntlet advances through all 5 bosses in order and records best clear time', () => {
  let state = createInitialBossGauntletState(180.5, 1);
  assert.equal(state.active, true);
  assert.equal(state.stageIndex, 0);
  assert.equal(state.totalStages, 5);
  assert.equal(state.currentBossId, 'helix-04');
  assert.equal(state.currentChapter, 'chapter_1_helix');

  const expectedOrder = BOSS_GAUNTLET_STAGES.map((s) => s.bossId);
  assert.deepEqual(expectedOrder, [
    'helix-04',
    'the-choir',
    'the-curator',
    'matron-v',
    'warden-prime',
  ]);

  let elapsed = 22.4;
  for (let i = 0; i < 4; i++) {
    const res = advanceBossGauntletStage(state, elapsed);
    assert.equal(res.completedAll, false);
    assert.ok(res.nextStage);
    assert.equal(res.nextStage?.bossId, expectedOrder[i + 1]);
    assert.equal(res.state.stageIndex, i + 1);
    assert.equal(res.state.defeatedBossIds.length, i + 1);
    state = res.state;
    elapsed += 28.0;
  }

  const finalRes = advanceBossGauntletStage(state, elapsed);
  assert.equal(finalRes.completedAll, true);
  assert.equal(finalRes.nextStage, null);
  assert.equal(finalRes.state.completed, true);
  assert.equal(finalRes.state.defeatedBossIds.length, 5);
  assert.equal(finalRes.state.totalGauntletClears, 2);
  assert.equal(finalRes.state.bestClearTimeSec, Number(elapsed.toFixed(2)));
  assert.equal(formatGauntletClock(134.4), '02:14.4');
});

test('Simulation integration: Chrono Overdrive activates via [5], locks weapon heat, and Boss Gauntlet chains HELIX-04 -> THE CHOIR', async () => {
  const {
    createInitialWorld,
    createEmptyInput,
    startBossGauntletRun,
    grantOverdriveCharge,
    stepWorld,
    extractHudSnapshot,
  } = await import('./simulation.ts');

  const world = createInitialWorld('playing');
  startBossGauntletRun(world, true);
  assert.equal(world.run.mode, 'boss_gauntlet');
  assert.equal(world.gauntlet?.active, true);
  assert.equal(world.gauntlet?.stageIndex, 0);
  assert.equal(world.boss?.id, 'helix-04');
  assert.equal(world.overdrive.charge, 50);

  // Charge to 100% and activate via input [5]
  grantOverdriveCharge(world, 60);
  assert.equal(world.overdrive.charge, 100);
  world.player.weaponHeat = 80;

  const activateInput = createEmptyInput();
  activateInput.overdriveJustPressed = true;
  stepWorld(world, activateInput, 0.016);

  assert.equal(world.overdrive.active, true);
  assert.equal(world.player.weaponHeat, 0);
  assert.ok(world.events.some((e) => e.type === 'chrono_overdrive_activated'));

  const hud = extractHudSnapshot(world, 0);
  assert.equal(hud.overdrive.active, true);
  assert.equal(hud.gauntlet?.stageIndex, 0);
  assert.equal(hud.gauntlet?.totalStages, 5);

  // Bring HELIX-04 to 1 HP and land a melee strike to verify automatic Gauntlet transition to Trial II: THE CHOIR
  const helixEnemy = world.enemies.find((e) => e.id === 'helix-04');
  assert.ok(helixEnemy);
  helixEnemy!.hp = 1;
  if (world.boss) {
    world.boss.hp = 1;
  }
  world.player.x = helixEnemy!.x;
  world.player.z = helixEnemy!.z + 1.6;
  world.player.rotationY = Math.PI;
  world.player.integrity = 55;
  world.player.flux = 20;

  const atkInput = createEmptyInput(Math.PI);
  atkInput.lightAttackJustPressed = true;
  const getActiveBossId = (): string | undefined => world.boss?.id;
  for (let i = 0; i < 12; i++) {
    stepWorld(world, i === 0 ? atkInput : createEmptyInput(Math.PI), 0.03);
    if (getActiveBossId() === 'the-choir') break;
  }

  assert.equal(getActiveBossId(), 'the-choir');
  assert.equal(world.run.chapter, 'chapter_2_choir');
  assert.equal(world.gauntlet?.stageIndex, 1);
  assert.equal(world.gauntlet?.defeatedBossIds.includes('helix-04'), true);
  assert.ok(world.player.integrity >= 85, 'Field Refit should heal +35 Integrity between trials');
});

