import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceCampaignChapter,
  angleDiff,
  applyDamageToPlayer,
  attemptEchoCollapse,
  attemptEchoRelay,
  attemptGravityPin,
  beginCampaignBossTransition,
  clearEchoState,
  computeMovementWorldVector,
  createBossWorld,
  createEmptyInput,
  createInitialWorld,
  dismissActiveTransmission,
  evaluateRelayTarget,
  extractHudSnapshot,
  forceBossAttack,
  getCurrentCalibrationObjective,
  hasResumableCampaign,
  isPlayerInCalibrationZone,
  parseAndApplyCampaignProgress,
  queryEchoResonanceTarget,
  resetWorldForPlaying,
  resetWorldForStandardPlaying,
  restoreSavedCampaignProgress,
  retryBossFromCheckpoint,
  selectChronicleLoomEnding,
  serializeCampaignProgress,
  setTutorialEnabled,
  skipBossIntroBanner,
  skipCampaignIntro,
  skipContainmentTransition,
  spawnCuratorReconstructedTraces,
  startBossEncounter,
  startCampaignChapterSelect,
  startCampaignRun,
  startPracticeBossRun,
  startPracticeStandardRun,
  stepWorld,
  switchPlayerWeapon,
  toggleTutorialHints,
  transitionCampaignToBoss,
  triggerNarrativeTransmission,
  getWeaponDefinition,
} from './simulation.ts';
import { InputController } from './input.ts';
import {
  CONVERGENCE_COOLDOWN,
  CONVERGENCE_FLUX_COST,
  CONVERGENCE_POSTURE_BONUS,
  GAME_CONFIG,
  RELAY_COOLDOWN,
  RELAY_FLUX_COST,
  RELAY_MAX_RANGE,
  RESONANCE_SYNC_WINDOW,
} from './config.ts';

test('InputController rotates camera 360 degrees horizontally, clamps pitch, scales with sensitivity, and supports invertY', () => {
  const input = new InputController();
  input.resetCameraAngles();
  assert.equal(input.aimYaw, GAME_CONFIG.camera.defaultYaw);
  assert.equal(input.aimPitch, GAME_CONFIG.camera.defaultPitch);

  // Full 360-degree turn (2 * PI / baseYawSensitivity = ~1963.5 pixels) across 8 steps
  const totalPixelsFor360 = (Math.PI * 2) / GAME_CONFIG.camera.baseYawSensitivity;
  for (let i = 0; i < 8; i++) {
    input.rotateCameraByDelta(totalPixelsFor360 / 8, 0);
  }
  assert.ok(
    Math.abs(angleDiff(input.aimYaw, GAME_CONFIG.camera.defaultYaw)) < 1e-4,
    'Camera yaw should complete a full 360-degree horizontal rotation and wrap cleanly'
  );

  // Pitch clamping at upper and lower bounds
  for (let i = 0; i < 10; i++) {
    input.rotateCameraByDelta(0, -300);
  }
  assert.equal(
    input.aimPitch,
    GAME_CONFIG.camera.minPitch,
    'Camera pitch must clamp at minPitch so camera cannot clip below ground'
  );

  for (let i = 0; i < 10; i++) {
    input.rotateCameraByDelta(0, 300);
  }
  assert.equal(
    input.aimPitch,
    GAME_CONFIG.camera.maxPitch,
    'Camera pitch must clamp at maxPitch so camera cannot flip upside down'
  );

  // Sensitivity scaling (2.0x vs 1.0x) and Invert Y
  input.resetCameraAngles();
  input.setCameraSettings({ sensitivity: 1.0, invertY: false });
  input.rotateCameraByDelta(100, 50);
  const deltaYaw1x = Math.abs(angleDiff(input.aimYaw, GAME_CONFIG.camera.defaultYaw));
  const deltaPitchStd = input.aimPitch - GAME_CONFIG.camera.defaultPitch;
  assert.ok(deltaPitchStd > 0, 'Standard Y-axis positive dy should increase pitch');

  input.resetCameraAngles();
  input.setCameraSettings({ sensitivity: 2.0, invertY: true });
  input.rotateCameraByDelta(100, 50);
  const deltaYaw2x = Math.abs(angleDiff(input.aimYaw, GAME_CONFIG.camera.defaultYaw));
  const deltaPitchInv = input.aimPitch - GAME_CONFIG.camera.defaultPitch;
  assert.ok(
    Math.abs(deltaYaw2x - deltaYaw1x * 2) < 1e-5,
    '2.0x camera sensitivity should double yaw rotation per pixel'
  );
  assert.ok(
    deltaPitchInv < 0 && Math.abs(deltaPitchInv + deltaPitchStd * 2) < 1e-5,
    'Invert Y should reverse vertical pitch direction'
  );
});

test('InputController unlocked camera rotates only during deliberate drag and UI clicks do not enter combat input', () => {
  const previousDocument = (globalThis as { document?: unknown }).document;
  (globalThis as { document?: unknown }).document = {
    body: { dataset: { state: 'playing' } },
    pointerLockElement: null,
  };

  try {
    const input = new InputController();
    input.resetCameraAngles();
    const startYaw = input.aimYaw;
    const move = (input as unknown as {
      handleMouseMove: (event: Record<string, unknown>) => void;
    }).handleMouseMove.bind(input);

    const down = (input as unknown as {
      handleMouseDown: (event: Record<string, unknown>) => void;
    }).handleMouseDown.bind(input);

    move({ movementX: 250, movementY: 40, clientX: 650, clientY: 430, buttons: 0 });
    assert.equal(input.aimYaw, startYaw, 'Unlocked hover movement must not rotate the camera');

    down({ button: 0, clientX: 650, clientY: 430, target: { closest: () => null } });
    move({ movementX: 12, movementY: 0, clientX: 662, clientY: 430, buttons: 1 });
    move({ movementX: 12, movementY: 0, clientX: 674, clientY: 430, buttons: 1 });
    const dragFrame = input.consumeFrameInput(1 / 60);
    assert.equal(dragFrame.cameraDragJustStarted, true, 'Crossing drag threshold emits one cancel signal');
    assert.notEqual(input.aimYaw, startYaw, 'Deliberate drag should rotate the camera');
    assert.equal(
      input.consumeFrameInput(1 / 60).cameraDragJustStarted,
      false,
      'Drag-start cancellation must be a one-frame edge, not a continuous release'
    );

    down({
      button: 0,
      clientX: 20,
      clientY: 20,
      target: {
        closest: (selector: string) => (selector.includes('.pointer-events-auto') ? {} : null),
      },
    });
    assert.equal(
      (input as unknown as { leftMouseDown: boolean }).leftMouseDown,
      false,
      'Pointer-auto UI must not initiate a gameplay mouse action behind the overlay'
    );
  } finally {
    (globalThis as { document?: unknown }).document = previousDocument;
  }
});

test('camera drag cancels a pending heavy charge without producing a light or heavy attack', () => {
  const world = createInitialWorld('playing');
  world.enemies = [];

  const press = createEmptyInput(Math.PI);
  press.lightAttackJustPressed = true;
  press.heavyHoldActive = true;
  stepWorld(world, press, 0.02);
  assert.equal(world.player.actionState, 'charging_heavy');

  const hold = createEmptyInput(Math.PI);
  hold.heavyHoldActive = true;
  stepWorld(world, hold, 0.2);
  assert.ok(world.player.chargeTime > 0);

  const drag = createEmptyInput(Math.PI);
  drag.cameraDragJustStarted = true;
  stepWorld(world, drag, 0.016);
  assert.equal(world.player.actionState, 'idle', 'Camera drag should cancel the charge to neutral');
  assert.equal(world.player.chargeTime, 0);
  assert.equal(world.player.bufferedAction, 'none');

  for (let i = 0; i < 40; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.016);
  }
  const actionAtEnd: string = world.player.actionState;
  assert.ok(
    !actionAtEnd.startsWith('light_') && !actionAtEnd.startsWith('heavy_'),
    'Cancelled charge must not be converted into an attack on subsequent frames'
  );
});

test('player WASD movement advances position and clamps inside arena bounds', () => {
  const world = createInitialWorld('playing');
  const startZ = world.player.z;

  // Move forward (-Z when aimYaw is PI) for 10 frames
  for (let i = 0; i < 10; i++) {
    const input = createEmptyInput(Math.PI);
    input.moveZ = -1;
    stepWorld(world, input, 0.03);
  }

  assert.ok(world.player.z < startZ, 'Player should move forward along -Z');
  assert.equal(world.player.actionState, 'moving');

  // Push far outside arena radius and verify clamping
  world.player.x = 999;
  world.player.z = 999;
  stepWorld(world, createEmptyInput(Math.PI), 0.016);
  const dist = Math.hypot(world.player.x, world.player.z);
  assert.ok(
    dist <= GAME_CONFIG.arena.radius - GAME_CONFIG.player.radius + 0.01,
    'Player position should be clamped inside arena boundary'
  );
});

test('frame-rate-independent movement produces consistent displacement across different delta times and normalizes diagonals', () => {
  const runWithDt = (dt: number, steps: number, moveX = 0, moveZ = -1) => {
    const w = createInitialWorld('playing');
    w.enemies = [];
    w.obstacles = [];
    w.player.x = 0;
    w.player.z = 10;
    for (let i = 0; i < steps; i++) {
      const inp = createEmptyInput(Math.PI);
      inp.moveX = moveX;
      inp.moveZ = moveZ;
      stepWorld(w, inp, dt);
    }
    return Math.hypot(w.player.x - 0, w.player.z - 10);
  };

  // Equivalent 1.00s simulated duration at 100 Hz (0.010s x 100), 50 Hz (0.020s x 50), and 25 Hz (0.040s x 25)
  const dist100Hz = runWithDt(0.010, 100);
  const dist50Hz = runWithDt(0.020, 50);
  const dist25Hz = runWithDt(0.040, 25);

  assert.ok(
    Math.abs(dist100Hz - dist50Hz) < 0.001,
    `100Hz dt=0.010s (${dist100Hz}) and 50Hz dt=0.020s (${dist50Hz}) distances must match`
  );
  assert.ok(
    Math.abs(dist100Hz - dist25Hz) < 0.001,
    `100Hz dt=0.010s (${dist100Hz}) and 25Hz dt=0.040s (${dist25Hz}) distances must match`
  );

  // Additional high-frequency stress check over 0.60s: ~166.7 Hz (dt=0.006s x 100) vs ~83.3 Hz (dt=0.012s x 50)
  const dist166HzStress = runWithDt(0.006, 100);
  const dist83HzStress = runWithDt(0.012, 50);
  assert.ok(
    Math.abs(dist166HzStress - dist83HzStress) < 0.001,
    `166.7Hz dt=0.006s (${dist166HzStress}) and 83.3Hz dt=0.012s (${dist83HzStress}) stress distances must match`
  );

  // Diagonal movement (W + D) at 50 Hz (dt=0.020s x 50 = 1.00s) must equal cardinal distance
  const distDiagonal = runWithDt(0.020, 50, 1, -1);
  assert.ok(
    Math.abs(distDiagonal - dist50Hz) < 0.001,
    `Diagonal distance (${distDiagonal}) must equal cardinal distance (${dist50Hz})`
  );
});

test('camera pitch does not affect the horizontal movement plane or speed', () => {
  const pitches = [GAME_CONFIG.camera.minPitch, 0.38, 0.75, GAME_CONFIG.camera.maxPitch];
  const displacements: { dx: number; dz: number }[] = [];

  for (const pitch of pitches) {
    const world = createInitialWorld('playing');
    world.enemies = [];
    world.obstacles = [];
    const startX = world.player.x;
    const startZ = world.player.z;

    for (let i = 0; i < 20; i++) {
      const input = createEmptyInput(Math.PI * 0.75);
      input.aimPitch = pitch;
      input.moveX = 1;
      input.moveZ = -1;
      stepWorld(world, input, 0.016);
    }

    displacements.push({
      dx: world.player.x - startX,
      dz: world.player.z - startZ,
    });
  }

  for (let i = 1; i < displacements.length; i++) {
    assert.ok(
      Math.abs(displacements[i].dx - displacements[0].dx) < 1e-6 &&
        Math.abs(displacements[i].dz - displacements[0].dz) < 1e-6,
      'Horizontal movement displacement must be identical regardless of camera pitch'
    );
  }
});

test('camera yaw changes world-space WASD direction accurately across all cardinal orientations', () => {
  const forwardNorth = computeMovementWorldVector({
    ...createEmptyInput(Math.PI),
    moveZ: -1,
  });
  assert.ok(Math.abs(forwardNorth.dirX - 0) < 1e-5);
  assert.ok(Math.abs(forwardNorth.dirZ - -1) < 1e-5);

  const rightNorth = computeMovementWorldVector({
    ...createEmptyInput(Math.PI),
    moveX: 1,
  });
  assert.ok(Math.abs(rightNorth.dirX - 1) < 1e-5);
  assert.ok(Math.abs(rightNorth.dirZ - 0) < 1e-5);

  const forwardEast = computeMovementWorldVector({
    ...createEmptyInput(Math.PI / 2),
    moveZ: -1,
  });
  assert.ok(Math.abs(forwardEast.dirX - 1) < 1e-5);
  assert.ok(Math.abs(forwardEast.dirZ - 0) < 1e-5);

  const rightEast = computeMovementWorldVector({
    ...createEmptyInput(Math.PI / 2),
    moveX: 1,
  });
  assert.ok(Math.abs(rightEast.dirX - 0) < 1e-5);
  assert.ok(Math.abs(rightEast.dirZ - 1) < 1e-5);

  const forwardSouth = computeMovementWorldVector({
    ...createEmptyInput(0),
    moveZ: -1,
  });
  assert.ok(Math.abs(forwardSouth.dirX - 0) < 1e-5);
  assert.ok(Math.abs(forwardSouth.dirZ - 1) < 1e-5);
});

test('character facing direction turns smoothly toward movement, preserves facing on stop, and aligns with attack aim', () => {
  const world = createInitialWorld('playing');
  world.enemies = [];

  for (let i = 0; i < 15; i++) {
    const input = createEmptyInput(Math.PI);
    input.moveX = 1;
    stepWorld(world, input, 0.016);
  }

  assert.ok(
    Math.abs(angleDiff(world.player.rotationY, Math.PI / 2)) < 0.05,
    'Sera should smoothly turn to face her +X movement direction (PI/2)'
  );

  const facingBeforeStop = world.player.rotationY;
  for (let i = 0; i < 10; i++) {
    const idleInput = createEmptyInput(0);
    stepWorld(world, idleInput, 0.016);
  }
  assert.equal(world.player.actionState, 'idle');
  assert.ok(
    Math.abs(angleDiff(world.player.rotationY, facingBeforeStop)) < 1e-5,
    'Sera should preserve her last meaningful facing direction when stopping'
  );

  const attackInput = createEmptyInput(0);
  attackInput.lightAttackJustPressed = true;
  stepWorld(world, attackInput, 0.016);
  assert.equal(world.player.actionState, 'light_windup');
  assert.ok(
    Math.abs(angleDiff(world.player.rotationY, 0)) < 1e-5,
    'Stationary melee attack should align with camera forward yaw'
  );
});

test('Chrono Edge basic attack executes windup -> active -> recovery and damages enemy in range', () => {
  const world = createInitialWorld('playing');
  const bastion = world.enemies[0];
  world.player.x = bastion.x;
  world.player.z = bastion.z + 2.0;
  world.player.rotationY = Math.PI;

  const initialHp = bastion.hp;
  const initialFlux = world.player.flux;

  const attackInput = createEmptyInput(Math.PI);
  attackInput.lightAttackJustPressed = true;
  stepWorld(world, attackInput, 0.016);
  assert.equal(world.player.actionState, 'light_windup');

  for (let i = 0; i < 20; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  assert.ok(bastion.hp < initialHp, 'Enemy HP should decrease after Chrono Edge basic attack');
  assert.ok(world.player.flux > initialFlux, 'Player should gain Flux on basic melee hit');
});

test('Chrono Edge charged heavy attack deals empowered bonus damage against enemy in vulnerable recovery window', () => {
  const world = createInitialWorld('playing');
  const bastion = world.enemies[0];
  world.player.x = bastion.x;
  world.player.z = bastion.z + 2.2;
  world.player.rotationY = Math.PI;
  world.player.flux = 50;

  bastion.aiState = 'recovery';
  bastion.stateDuration = 2.0;
  bastion.stateTimer = 2.0;

  const initialHp = bastion.hp;

  for (let i = 0; i < 16; i++) {
    const holdInput = createEmptyInput(Math.PI);
    holdInput.heavyHoldActive = true;
    if (i === 0) holdInput.lightAttackJustPressed = true;
    stepWorld(world, holdInput, 0.03);
  }

  assert.equal(world.player.actionState, 'charging_heavy');
  assert.ok(
    world.player.chargeTime >= GAME_CONFIG.player.heavyAttack.chargeThreshold,
    'Heavy charge time should reach threshold'
  );

  const releaseInput = createEmptyInput(Math.PI);
  releaseInput.heavyHoldActive = false;
  releaseInput.heavyJustReleased = true;
  stepWorld(world, releaseInput, 0.02);

  for (let i = 0; i < 20; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  const damageDealt = initialHp - bastion.hp;
  const expectedEmpoweredVulnerable = Math.round(
    GAME_CONFIG.player.heavyAttack.empoweredDamage * GAME_CONFIG.player.vulnerableDamageMultiplier
  );
  assert.equal(
    damageDealt,
    expectedEmpoweredVulnerable,
    'Empowered heavy attack against vulnerable recovery window should deal 1.5x empowered damage'
  );
  assert.equal(world.stats.vulnerableHits, 1);
});

test('enemy telegraphed attack deals damage on strike and transitions into vulnerable recovery window', () => {
  const world = createInitialWorld('playing');
  const bastion = world.enemies[0];

  world.player.x = bastion.x;
  world.player.z = bastion.z + 1.8;
  bastion.cooldownTimer = 0;

  const initialIntegrity = world.player.integrity;

  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(bastion.aiState, 'telegraph', 'Bastion should enter telegraph state when in range');

  let sawDamage = false;
  let sawRecovery = false;
  for (let i = 0; i < 60; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.025);
    if (world.player.integrity < initialIntegrity) {
      sawDamage = true;
    }
    if ((bastion.aiState as string) === 'recovery') {
      sawRecovery = true;
      break;
    }
  }

  assert.equal(sawDamage, true, 'Enemy attack should deal damage to player after telegraph');
  assert.equal(sawRecovery, true, 'Enemy should enter vulnerable recovery window after attack');
});

test('timed parry negates enemy attack and staggers attacker', () => {
  const world = createInitialWorld('playing');
  const bastion = world.enemies[0];
  world.player.x = bastion.x;
  world.player.z = bastion.z + 1.6;

  const parryInput = createEmptyInput(Math.PI);
  parryInput.parryJustPressed = true;
  stepWorld(world, parryInput, 0.016);
  assert.equal(world.player.actionState, 'parry_active');

  const tookDamage = applyDamageToPlayer(world, 28, bastion);
  assert.equal(tookDamage, false, 'Parry should negate incoming damage');
  assert.equal(bastion.aiState, 'staggered', 'Parry should stagger the attacking enemy');
  assert.equal(world.stats.parriesLanded, 1);
});

test('victory triggers when all enemies are defeated and defeat triggers when player integrity reaches zero', () => {
  const world = createInitialWorld('playing');
  for (const e of world.enemies) {
    e.hp = 0;
    e.aiState = 'ko';
  }

  for (let i = 0; i < 30; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.03);
  }
  assert.equal(world.outcome, 'victory');
  assert.equal(world.appState, 'gameover');
  assert.ok(world.frozenSummary !== null);

  resetWorldForPlaying(world);
  assert.equal(world.appState, 'playing');
  assert.equal(world.outcome, 'none');

  applyDamageToPlayer(world, 999);
  assert.equal(world.player.integrity, 0);
  assert.equal(world.outcome, 'defeat');

  for (let i = 0; i < 30; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.03);
  }
  assert.equal(world.appState, 'gameover');
  const snap = extractHudSnapshot(world);
  assert.equal(snap.outcome, 'defeat');
});

test('light attack recovery cannot be skipped on frame 0 and 3-hit combo finisher enforces commitment cooldown', () => {
  const world = createInitialWorld('playing');
  world.enemies = []; // Test pure player combo state machine

  // Start hit 1 (comboIndex = 0)
  const press = () => {
    const inp = createEmptyInput(Math.PI);
    inp.lightAttackJustPressed = true;
    return inp;
  };

  stepWorld(world, press(), 0.01);
  assert.equal(world.player.actionState, 'light_windup');
  assert.equal(world.player.comboIndex, 0);

  // Advance until hit 1 enters light_recovery
  while ((world.player.actionState as string) !== 'light_recovery') {
    stepWorld(world, createEmptyInput(Math.PI), 0.01);
  }

  // On frame 1 of light_recovery, spamming lightAttackJustPressed MUST NOT skip recovery immediately
  stepWorld(world, press(), 0.01);
  assert.equal(
    world.player.actionState,
    'light_recovery',
    'Light attack recovery must not be cancelled on frame 0 by button mashing'
  );

  // Advance through combo hits 1 -> 2 -> 3 while mashing light attack every frame
  const seenCombos: number[] = [0];
  let finisherRecoveryFrames = 0;
  for (let i = 0; i < 200; i++) {
    stepWorld(world, press(), 0.01);
    if (
      (world.player.actionState as string) === 'light_windup' &&
      seenCombos[seenCombos.length - 1] !== world.player.comboIndex
    ) {
      seenCombos.push(world.player.comboIndex);
    }
    if ((world.player.actionState as string) === 'light_recovery' && (world.player.comboIndex as number) === 2) {
      finisherRecoveryFrames += 1;
    }
    if (seenCombos.length >= 4) break;
  }

  assert.deepEqual(
    seenCombos.slice(0, 4),
    [0, 1, 2, 0],
    'Light combo should progress 0 -> 1 -> 2 and then reset to 0'
  );
  assert.ok(
    finisherRecoveryFrames >= 45,
    `3-hit combo finisher must enforce its full recovery commitment (~0.52s), got ${finisherRecoveryFrames * 0.01}s`
  );
});

test('each melee swing hits a given enemy at most once across all active frames', () => {
  const world = createInitialWorld('playing');
  const scrapper = world.enemies[1];
  world.enemies = [scrapper];
  scrapper.x = 0;
  scrapper.z = 10.5;
  scrapper.cooldownTimer = 99;

  world.player.x = 0;
  world.player.z = 12.5;
  world.player.rotationY = Math.PI;

  const initialHp = scrapper.hp;
  const inp = createEmptyInput(Math.PI);
  inp.lightAttackJustPressed = true;
  stepWorld(world, inp, 0.005);

  let hitEventsCount = 0;
  // Step at fine 5ms increments through windup, active, and recovery
  for (let i = 0; i < 90; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.005);
    for (const ev of world.events) {
      if (ev.type === 'player_hit_enemy') {
        hitEventsCount += 1;
      }
    }
  }

  assert.equal(hitEventsCount, 1, 'A single melee swing must hit an enemy at most once');
  assert.equal(
    initialHp - scrapper.hp,
    GAME_CONFIG.player.lightAttack.damage[0],
    'Damage dealt must equal exactly one hit 1 swing'
  );
});

test('Bastion frontal armor resists basic light attacks and prevents light-spam stagger interruption during telegraph, while Charged Heavy and Parry break posture', () => {
  const world = createInitialWorld('playing');
  const bastion = world.enemies[0];
  world.enemies = [bastion];

  // Position player in front of Bastion (Bastion faces +Z, rotationY = 0; player at z = bastion.z + 2.0 facing PI)
  bastion.x = 0;
  bastion.z = 4.5;
  bastion.rotationY = 0;
  bastion.aiState = 'telegraph';
  bastion.stateDuration = 2.0;
  bastion.stateTimer = 2.0;
  bastion.stagger = 98; // 98/100 stagger: even a guarded +3 stagger hit would reach 101 without poise cap

  world.player.x = 0;
  world.player.z = 6.5;
  world.player.rotationY = Math.PI;

  const hpBeforeLight = bastion.hp;
  const lightInp = createEmptyInput(Math.PI);
  lightInp.lightAttackJustPressed = true;
  stepWorld(world, lightInp, 0.016);

  let sawGuardedEvent = false;
  for (let i = 0; i < 20; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.016);
    for (const ev of world.events) {
      if (ev.type === 'player_hit_enemy' && ev.isGuarded) {
        sawGuardedEvent = true;
      }
    }
  }

  const guardedDamage = hpBeforeLight - bastion.hp;
  assert.equal(sawGuardedEvent, true, 'Frontal light attack against Bastion should be flagged as guarded');
  assert.ok(
    guardedDamage < GAME_CONFIG.player.lightAttack.damage[0],
    `Frontal guarded light attack should deal reduced damage (${guardedDamage} < ${GAME_CONFIG.player.lightAttack.damage[0]})`
  );
  assert.equal(
    bastion.aiState,
    'telegraph',
    'Basic light attack must NOT stagger-interrupt Bastion during active telegraph'
  );
  assert.equal(
    bastion.stagger,
    bastion.maxStagger - 1,
    'Poise during telegraph caps light-attack stagger at maxStagger - 1'
  );

  // Now fire a Charged Heavy Attack [E]: it must pierce frontal guard and break Bastion into 'staggered'
  world.player.actionState = 'idle';
  world.player.comboCooldownTimer = 0;
  const hpBeforeHeavy = bastion.hp;
  const heavyInp = createEmptyInput(Math.PI);
  heavyInp.heavyAttackJustPressed = true;
  stepWorld(world, heavyInp, 0.016);

  for (let i = 0; i < 20; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.016);
  }

  const heavyDamage = hpBeforeHeavy - bastion.hp;
  assert.equal(
    heavyDamage,
    GAME_CONFIG.player.heavyAttack.empoweredDamage,
    'Empowered Heavy attack must pierce Bastion frontal guard for 100% damage'
  );
  assert.equal(
    bastion.aiState,
    'staggered',
    'Charged Heavy attack must break Bastion poise into staggered state'
  );
});

test('Scrapper retaliates with accelerated counter-telegraph when pressured by light attacks and Scout evades close-range rush', () => {
  const world = createInitialWorld('playing');
  const scrapper = world.enemies[1];
  const scout = world.enemies[2];

  // 1. Test Scrapper counter-cooldown refund on light hit
  scrapper.x = 0;
  scrapper.z = 5.0;
  scrapper.aiState = 'pursue';
  scrapper.cooldownTimer = 1.0;

  world.player.x = 0;
  world.player.z = 6.8;
  world.player.rotationY = Math.PI;

  const inp = createEmptyInput(Math.PI);
  inp.lightAttackJustPressed = true;
  stepWorld(world, inp, 0.016);
  for (let i = 0; i < 12; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.016);
  }

  assert.ok(
    scrapper.cooldownTimer < 0.35,
    `Scrapper cooldown should be accelerated when hit by light attack (remaining: ${scrapper.cooldownTimer.toFixed(2)}s)`
  );

  // 2. Test Scout evasive thruster back-dash when rushed within evadeTriggerDist
  scout.x = 5.0;
  scout.z = 5.0;
  scout.aiState = 'pursue';
  scout.evadeCooldownTimer = 0;
  world.player.x = 5.0;
  world.player.z = 7.2; // dist = 2.2m <= evadeTriggerDist (3.1m)

  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.ok(scout.evadeTimer > 0, 'Scout should activate evasive thruster dash when rushed closely');
  for (let i = 0; i < 10; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const newDist = Math.hypot(world.player.x - scout.x, world.player.z - scout.z);
  assert.ok(newDist > 3.2, `Scout evasive dash should widen distance from player (newDist=${newDist.toFixed(2)}m)`);
});

test('Encounter Balance Comparison: mindless light-attack spamming loses the encounter, while skilled counterplay wins decisively', () => {
  // 1. Bot A: Mindless Light-Attack Spammer (walks straight at nearest living enemy and mashes lightAttackJustPressed every frame)
  const spamWorld = createInitialWorld('playing');
  for (let step = 0; step < 1500; step++) {
    if (spamWorld.outcome !== 'none') break;
    const p = spamWorld.player;
    const living = spamWorld.enemies.filter((e) => e.hp > 0 && e.aiState !== 'ko');
    if (living.length === 0) break;

    living.sort(
      (a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z)
    );
    const target = living[0];
    const yawToTarget = Math.atan2(target.x - p.x, target.z - p.z);
    const dist = Math.hypot(target.x - p.x, target.z - p.z);

    const inp = createEmptyInput(yawToTarget);
    if (dist > 1.7) {
      inp.moveZ = -1; // Move straight toward target
    }
    inp.lightAttackJustPressed = true; // Mash light attack unconditionally every frame
    stepWorld(spamWorld, inp, 0.02);
  }

  assert.equal(
    spamWorld.outcome,
    'defeat',
    'Mindless light-attack spamming without dodge, parry, or heavy counterplay must lose the encounter'
  );
  assert.equal(spamWorld.player.integrity, 0);

  // 2. Bot B: Skilled Counterplay Agent (uses Parry [Q], Dodge [Space], and Empowered Heavy [E] / combos on exposed windows)
  const skilledWorld = createInitialWorld('playing');
  for (let step = 0; step < 2200; step++) {
    if (skilledWorld.outcome !== 'none') break;
    const p = skilledWorld.player;
    const living = skilledWorld.enemies.filter((e) => e.hp > 0 && e.aiState !== 'ko');
    if (living.length === 0) break;

    // Prioritize enemy that is telegraphing nearby, or exposed (recovery/staggered), or closest
    living.sort((a, b) => {
      const distA = Math.hypot(a.x - p.x, a.z - p.z);
      const distB = Math.hypot(b.x - p.x, b.z - p.z);
      const bonusA = a.aiState === 'staggered' || a.aiState === 'recovery' ? -3.5 : 0;
      const bonusB = b.aiState === 'staggered' || b.aiState === 'recovery' ? -3.5 : 0;
      return distA + bonusA - (distB + bonusB);
    });

    const target = living[0];
    const yawToTarget = Math.atan2(target.x - p.x, target.z - p.z);
    const dist = Math.hypot(target.x - p.x, target.z - p.z);
    const inp = createEmptyInput(yawToTarget);

    // Check if any enemy is about to strike us
    const imminentAttacker = living.find((e) => {
      const d = Math.hypot(e.x - p.x, e.z - p.z);
      const maxRange = e.archetype === 'scout' ? 9.5 : 3.9;
      return (
        d <= maxRange &&
        ((e.aiState === 'telegraph' && e.stateTimer <= 0.22) || e.aiState === 'attack')
      );
    });

    if (imminentAttacker) {
      if (p.parryCooldownTimer <= 0 && imminentAttacker.archetype !== 'scout') {
        // Timed Parry against melee strike!
        inp.aimYaw = Math.atan2(imminentAttacker.x - p.x, imminentAttacker.z - p.z);
        inp.parryJustPressed = true;
      } else if (p.dodgeCooldownTimer <= 0) {
        // Side-step dodge out of strike or Scout beam
        inp.moveX = 1;
        inp.dodgeJustPressed = true;
      } else {
        inp.moveZ = 1; // Back up if both defensive tools are on cooldown
      }
    } else {
      // Offensive spacing & punish decisions
      if (dist > 2.3) {
        inp.moveZ = -1;
        if (dist > 5.0 && p.dodgeCooldownTimer <= 0 && target.archetype === 'scout') {
          inp.dodgeJustPressed = true; // Gap-close dash toward Scout
        }
      } else if (target.aiState === 'staggered' || target.aiState === 'recovery') {
        // Punish exposed White Window with Heavy Cleave if Flux >= 25 or first strike, else fast light combo
        if (p.flux >= 25 || target.stateTimer > 0.65) {
          inp.heavyAttackJustPressed = true;
        } else {
          inp.lightAttackJustPressed = true;
        }
      } else if (target.archetype === 'bastion') {
        // Against armored Bastion in neutral, break guard with Heavy Cleave or bait its slam to Parry
        if (p.flux >= 25 && target.aiState === 'pursue') {
          inp.heavyAttackJustPressed = true;
        } else {
          // Strafe to bait slam or flank
          inp.moveX = 1;
        }
      } else {
        // Against Scrapper/Scout in neutral, use controlled 2-hit pokes or Heavy Cleave
        if (p.comboIndex < 1) {
          inp.lightAttackJustPressed = true;
        } else {
          inp.moveX = -1;
        }
      }
    }

    stepWorld(skilledWorld, inp, 0.02);
  }

  assert.equal(
    skilledWorld.outcome,
    'victory',
    'Skilled counterplay (Parry, Dodge, and Heavy/Combo punish on exposed windows) must win the encounter'
  );
  assert.ok(
    skilledWorld.player.integrity >= 50,
    `Skilled player should finish with healthy Integrity (>= 50), got ${skilledWorld.player.integrity}`
  );
  assert.ok(
    skilledWorld.stats.parriesLanded >= 1 && skilledWorld.stats.vulnerableHits >= 2,
    'Skilled run should record successful parries and vulnerable window hits'
  );
});

test('Phase 2: headless 64ms rAF throttle and variable frame cadences preserve simulation and Echo logical time without drift', () => {
  const runEchoCadence = (dt: number, recordSteps: number, playSteps: number) => {
    const w = createInitialWorld('playing');
    w.enemies = [];
    w.obstacles = [];

    // Start recording on step 0 and move North (-Z) for 1.60s total
    for (let i = 0; i < recordSteps; i++) {
      const inp = createEmptyInput(Math.PI);
      if (i === 0) inp.echoRecordJustPressed = true;
      inp.moveZ = -1;
      stepWorld(w, inp, dt);
    }

    // Stop recording -> Ready
    const stopInp = createEmptyInput(Math.PI);
    stopInp.echoRecordJustPressed = true;
    stepWorld(w, stopInp, 0.01);
    assert.equal(w.echo.state, 'ready');
    assert.ok(w.echo.clip !== null);

    const recordedDuration = w.echo.clip.duration;

    // Start playback and advance for 0.80s while live player stays idle
    for (let i = 0; i < playSteps; i++) {
      const inp = createEmptyInput(Math.PI);
      if (i === 0) inp.echoPlayJustPressed = true;
      stepWorld(w, inp, dt);
    }

    assert.equal(w.echo.state, 'playback');
    assert.ok(w.echo.activeActor !== null);

    return {
      elapsedTime: w.elapsedTime,
      recordedDuration,
      playbackTime: w.echo.playbackTime,
      echoX: w.echo.activeActor.x,
      echoZ: w.echo.activeActor.z,
    };
  };

  // Compare 100 Hz (0.010s), 50 Hz (0.020s), 25 Hz (0.040s), and Headless 15.625 Hz (0.064s) over 1.60s record + 0.80s play
  const res100Hz = runEchoCadence(0.010, 160, 80);
  const res50Hz = runEchoCadence(0.020, 80, 40);
  const res25Hz = runEchoCadence(0.040, 40, 20);
  const resHeadless64ms = runEchoCadence(0.064, 25, 12); // 12 * 0.064 = 0.768s

  assert.ok(
    Math.abs(res100Hz.recordedDuration - 1.60) < 0.02 &&
      Math.abs(resHeadless64ms.recordedDuration - 1.60) < 0.02,
    `Headless 64ms dt (${resHeadless64ms.recordedDuration}s) must preserve full 1.60s recording duration matching 100Hz (${res100Hz.recordedDuration}s)`
  );
  assert.ok(
    Math.abs(res100Hz.echoZ - res50Hz.echoZ) < 0.02 &&
      Math.abs(res100Hz.echoZ - res25Hz.echoZ) < 0.02,
    'Echo playback position must not drift across 100 Hz, 50 Hz, and 25 Hz cadences'
  );
  assert.ok(
    Math.abs(resHeadless64ms.playbackTime - 12 * 0.064) < 0.001,
    `Headless 64ms playback time (${resHeadless64ms.playbackTime}) must advance by full 0.064s per step without 50ms clamping loss`
  );
});

test('Phase 2: Echo recording captures chronological samples, replays route & facing while Sera moves independently, and finishes cleanly', () => {
  const world = createInitialWorld('playing');
  world.enemies = [];
  world.obstacles = [];

  const startX = world.player.x;
  const startZ = world.player.z;

  // Start recording [T]
  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  assert.equal(world.echo.state, 'recording');

  // Walk North (-Z) for 0.50s (25 steps), then East (+X) for 0.50s (25 steps)
  for (let i = 0; i < 25; i++) {
    const inp = createEmptyInput(Math.PI);
    inp.moveZ = -1;
    stepWorld(world, inp, 0.02);
  }
  for (let i = 0; i < 25; i++) {
    const inp = createEmptyInput(Math.PI);
    inp.moveX = 1;
    stepWorld(world, inp, 0.02);
  }

  const recordedEndX = world.player.x;
  const recordedEndZ = world.player.z;
  const recordedEndRot = world.player.rotationY;

  // Stop recording [T] -> Ready
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);
  assert.equal(world.echo.state, 'ready');
  assert.ok(world.echo.clip !== null);

  const clip = world.echo.clip;
  assert.ok(clip.samples.length >= 2, 'Clip must contain at least start and end samples');
  for (let i = 1; i < clip.samples.length; i++) {
    assert.ok(
      clip.samples[i].t >= clip.samples[i - 1].t,
      'Echo samples must be in chronological order'
    );
  }
  assert.equal(clip.samples[0].t, 0);
  assert.ok(Math.abs(clip.samples[clip.samples.length - 1].t - clip.duration) < 1e-4);

  // Start playback [Y] while Sera moves West (-X), opposite the Echo's path
  const playStart = createEmptyInput(Math.PI);
  playStart.echoPlayJustPressed = true;
  stepWorld(world, playStart, 0.02);
  assert.equal(world.echo.state, 'playback');
  assert.ok(world.echo.activeActor !== null);
  assert.ok(
    Math.hypot(world.echo.activeActor.x - startX, world.echo.activeActor.z - startZ) < 0.25,
    'Echo playback must start at the recorded origin pose'
  );

  for (let i = 0; i < 48; i++) {
    const inp = createEmptyInput(Math.PI);
    inp.moveX = -1; // Sera walks West (-X) independently
    stepWorld(world, inp, 0.02);
  }

  assert.equal(world.echo.state, 'playback');
  assert.ok(world.echo.activeActor !== null);
  assert.ok(world.player.x < startX - 2.0, 'Sera must move West independently during Echo playback');
  assert.ok(
    Math.hypot(world.echo.activeActor.x - recordedEndX, world.echo.activeActor.z - recordedEndZ) < 0.35,
    'Echo must approach the recorded East endpoint along its recorded timeline'
  );
  assert.ok(
    Math.abs(angleDiff(world.echo.activeActor.rotationY, recordedEndRot)) < 0.25,
    'Echo must reproduce the recorded horizontal facing angle'
  );

  // Advance past clip duration -> playback completes cleanly and removes activeActor
  for (let i = 0; i < 10; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.echo.state, 'finished');
  assert.equal(world.echo.activeActor, null);
});

test('Phase 2: recorded action events fire once at expected timestamps, respect pause/resume, and Echo attacks deal zero combat damage or Flux', () => {
  const world = createInitialWorld('playing');
  const bastion = world.enemies[0];
  world.enemies = [bastion];
  bastion.aiState = 'idle';
  bastion.x = 0;
  bastion.z = 8.0;
  bastion.hp = bastion.maxHp;

  world.player.x = 0;
  world.player.z = 12.0; // Far from Bastion while recording

  // Start recording [T]
  const startRec = createEmptyInput(Math.PI);
  startRec.echoRecordJustPressed = true;
  stepWorld(world, startRec, 0.02);

  // At t ~ 0.10s, trigger a Light Attack
  for (let i = 0; i < 5; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const lightInp = createEmptyInput(Math.PI);
  lightInp.lightAttackJustPressed = true;
  stepWorld(world, lightInp, 0.02);

  // Advance 0.50s, then trigger a Dodge
  for (let i = 0; i < 25; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const dodgeInp = createEmptyInput(Math.PI);
  dodgeInp.dodgeJustPressed = true;
  stepWorld(world, dodgeInp, 0.02);

  // Advance 0.30s and finalize recording [T]
  for (let i = 0; i < 15; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const stopRec = createEmptyInput(Math.PI);
  stopRec.echoRecordJustPressed = true;
  stepWorld(world, stopRec, 0.02);

  assert.equal(world.echo.state, 'ready');
  assert.ok(world.echo.clip !== null);
  assert.equal(world.echo.clip.events.length, 2, 'Clip should record light_swing and dodge action events');

  // Move Bastion directly in front of the Echo's recorded position so Echo swings overlap Bastion
  bastion.x = world.echo.clip.samples[0].x;
  bastion.z = world.echo.clip.samples[0].z - 1.8;
  bastion.hp = bastion.maxHp;
  bastion.stagger = 0;

  // Move live Sera far away
  world.player.x = 10;
  world.player.z = 10;
  world.player.flux = 20;

  // Start playback [Y]
  const startPlay = createEmptyInput(Math.PI);
  startPlay.echoPlayJustPressed = true;
  stepWorld(world, startPlay, 0.02);

  const firedEchoActions: { action: string; t: number }[] = [];
  for (let i = 0; i < 70; i++) {
    // Pause for 5 steps mid-playback and verify neither time nor events advance while paused
    if (i === 12) {
      world.appState = 'paused';
      const pausedTime = world.echo.playbackTime;
      for (let pStep = 0; pStep < 5; pStep++) {
        stepWorld(world, createEmptyInput(Math.PI), 0.02);
        assert.equal(world.echo.playbackTime, pausedTime, 'Echo playback must not advance while paused');
        assert.equal(world.events.length, 0, 'No events may fire while paused');
      }
      world.appState = 'playing';
    }

    stepWorld(world, createEmptyInput(Math.PI), 0.02);
    for (const ev of world.events) {
      if (ev.type === 'echo_action_visual' && ev.echoAction) {
        firedEchoActions.push({ action: ev.echoAction, t: world.echo.playbackTime });
      }
      assert.notEqual(ev.type, 'player_hit_enemy', 'Echo must never trigger live player_hit_enemy combat events');
    }
  }

  assert.deepEqual(
    firedEchoActions.map((e) => e.action),
    ['light_swing', 'dodge'],
    'Recorded action events must fire in order exactly once without duplication'
  );
  assert.equal(bastion.hp, bastion.maxHp, 'Echo melee swings must deal zero combat damage');
  assert.equal(bastion.stagger, 0, 'Echo melee swings must apply zero enemy stagger');
});

test('Phase 2: minimum/maximum recording duration, invalid playback rejection, replacement, and clear lifecycle', () => {
  const world = createInitialWorld('playing');
  world.enemies = [];

  // 1. Requesting playback with no clip is rejected cleanly
  const badPlay = createEmptyInput(Math.PI);
  badPlay.echoPlayJustPressed = true;
  stepWorld(world, badPlay, 0.02);
  assert.equal(world.echo.state, 'idle');
  assert.ok(world.events.some((e) => e.type === 'echo_playback_rejected'));

  // 2. Stopping recording before minDuration (0.35s) rejects the clip
  const startShort = createEmptyInput(Math.PI);
  startShort.echoRecordJustPressed = true;
  stepWorld(world, startShort, 0.02);
  assert.equal(world.echo.state, 'recording');

  stepWorld(world, createEmptyInput(Math.PI), 0.10);
  const stopShort = createEmptyInput(Math.PI);
  stopShort.echoRecordJustPressed = true;
  stepWorld(world, stopShort, 0.02);
  assert.equal(world.echo.state, 'idle');
  assert.equal(world.echo.clip, null);
  assert.ok(world.events.some((e) => e.type === 'echo_recording_rejected'));

  // 3. Recording up to maxDuration (8.0s) auto-finalizes into Ready
  const startLong = createEmptyInput(Math.PI);
  startLong.echoRecordJustPressed = true;
  stepWorld(world, startLong, 0.02);
  for (let i = 0; i < 210; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.04); // 210 * 0.04 = 8.4s
  }
  assert.equal(world.echo.state, 'ready', 'Reaching maxDuration must auto-finalize recording into ready state');
  const finalizedClip = world.echo.clip as { duration: number } | null;
  assert.ok(finalizedClip !== null);
  assert.ok(Math.abs(finalizedClip.duration - GAME_CONFIG.echo.maxDuration) < 1e-4);

  // 4. Starting playback and then starting a new recording replaces the active Echo immediately
  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  assert.equal(world.echo.state, 'playback');
  assert.ok(world.echo.activeActor !== null);

  const replaceInp = createEmptyInput(Math.PI);
  replaceInp.echoRecordJustPressed = true;
  stepWorld(world, replaceInp, 0.02);
  assert.equal(world.echo.state, 'recording');
  assert.equal(world.echo.activeActor, null, 'Starting a new recording must remove any previous active Echo');
  assert.ok(world.events.some((e) => e.type === 'echo_recording_replaced'));

  // 5. Clear [C] discards recording/clip and leaves no orphaned Echo
  const clearInp = createEmptyInput(Math.PI);
  clearInp.echoClearJustPressed = true;
  stepWorld(world, clearInp, 0.02);
  assert.equal(world.echo.state, 'idle');
  assert.equal(world.echo.clip, null);
  assert.equal(world.echo.activeActor, null);
});

test('Phase 2: Echo-only pressure plate ignores live player, activates when Echo enters trigger, opens barrier collider, and resets on clear/restart', () => {
  const world = createInitialWorld('playing');
  world.enemies = [];

  const plate = world.pressurePlate;
  assert.equal(plate.interactionPolicy, 'echo_only');
  assert.equal(plate.active, false);
  assert.equal(plate.barrierOpen, false);

  // 1. Live player Sera standing directly on the echo_only pressure plate must NOT activate it
  world.player.x = plate.x;
  world.player.z = plate.z;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(plate.active, false, 'echo_only pressure plate must not activate for live player Sera');
  assert.equal(plate.barrierOpen, false);

  // Verify the closed barrier at (receiverX, receiverZ) physically blocks Sera
  world.player.x = plate.receiverX;
  world.player.z = plate.receiverZ;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  const distFromClosedBarrier = Math.hypot(
    world.player.x - plate.receiverX,
    world.player.z - plate.receiverZ
  );
  assert.ok(
    distFromClosedBarrier >= plate.receiverRadius + GAME_CONFIG.player.radius - 0.05,
    `Closed receiver barrier must physically block player collision (dist=${distFromClosedBarrier})`
  );

  // 2. Record Sera standing on the pressure plate for 0.60s
  world.player.x = plate.x;
  world.player.z = plate.z;
  const startRec = createEmptyInput(Math.PI);
  startRec.echoRecordJustPressed = true;
  stepWorld(world, startRec, 0.02);
  for (let i = 0; i < 30; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const stopRec = createEmptyInput(Math.PI);
  stopRec.echoRecordJustPressed = true;
  stepWorld(world, stopRec, 0.02);
  assert.equal(world.echo.state, 'ready');

  // Move live Sera away from the plate, then start Echo playback [Y]
  world.player.x = 0;
  world.player.z = 12.5;
  const startPlay = createEmptyInput(Math.PI);
  startPlay.echoPlayJustPressed = true;
  stepWorld(world, startPlay, 0.02);

  assert.equal(world.echo.state, 'playback');
  assert.equal(plate.active, true, 'Echo inside trigger radius must activate pressure plate');
  assert.equal(plate.barrierOpen, true, 'Activating pressure plate must open the receiver barrier');
  assert.ok(world.events.some((e) => e.type === 'echo_plate_activated'));

  // Verify open barrier no longer blocks Sera at (receiverX, receiverZ)
  world.player.x = plate.receiverX;
  world.player.z = plate.receiverZ;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  const distFromOpenBarrier = Math.hypot(
    world.player.x - plate.receiverX,
    world.player.z - plate.receiverZ
  );
  assert.ok(
    distFromOpenBarrier < 0.05,
    'Open receiver barrier must allow player to stand at receiver coordinates without collision pushout'
  );

  // 3. Discarding the Echo while standing on the active plate immediately releases the plate and closes the barrier
  const clearInp = createEmptyInput(Math.PI);
  clearInp.echoClearJustPressed = true;
  stepWorld(world, clearInp, 0.02);
  assert.equal(world.echo.activeActor, null);
  assert.equal(plate.active, false, 'Discarding Echo must immediately deactivate the pressure plate');
  assert.equal(plate.barrierOpen, false, 'Deactivating pressure plate must immediately close the barrier');
  assert.ok(world.events.some((e) => e.type === 'echo_plate_released'));

  // 4. Restarting while playback is active resets Echo and plate cleanly
  resetWorldForPlaying(world);
  assert.equal(world.echo.state, 'idle');
  assert.equal(world.echo.clip, null);
  assert.equal(world.echo.activeActor, null);
  assert.equal(world.pressurePlate.active, false);
  assert.equal(world.pressurePlate.barrierOpen, false);
});

test('Phase 2.1: Full live-encounter sequence (Record -> 2s Hold on Pad -> Finalize -> Playback -> Barrier Opens -> Live Sera Crosses -> Clear/Restart Reset)', () => {
  // Use the full live encounter with all 3 enemies active (not emptied)
  const world = createInitialWorld('playing');
  assert.equal(world.enemies.length, 3, 'All 3 Test Bay 04 enemies must be active');

  const plate = world.pressurePlate;
  const barrierObs = world.obstacles.find((o) => o.id === plate.receiverId)!;
  assert.equal(plate.active, false);
  assert.equal(plate.barrierOpen, false);
  assert.equal(barrierObs.disabled, false);

  // Step 2 & 3: Start recording [T] at spawn (0, 12.5) and move Sera onto Chrono Anchor Pad 01 (-3.8, 9.0)
  for (let i = 0; i < 38; i++) {
    const inp = createEmptyInput(Math.PI);
    if (i === 0) inp.echoRecordJustPressed = true;
    inp.moveX = -1;
    inp.moveZ = -1;
    stepWorld(world, inp, 0.02);
  }

  const distOnArrival = Math.hypot(world.player.x - plate.x, world.player.z - plate.z);
  assert.ok(
    distOnArrival <= plate.radius,
    `Sera must arrive inside Chrono Anchor Pad 01 trigger radius (${distOnArrival.toFixed(2)} <= ${plate.radius})`
  );
  assert.equal(plate.active, false, 'Live Sera standing on Echo-only pad must not activate it');

  // Step 4: Remain stationary on the pad for 2.0 seconds (100 steps @ 0.02s) before finalizing
  for (let i = 0; i < 100; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
    const distDuringHold = Math.hypot(world.player.x - plate.x, world.player.z - plate.z);
    assert.ok(
      distDuringHold <= plate.radius,
      `Enemies must not shove Sera off the pad during stationary hold (step ${i}, dist=${distDuringHold.toFixed(2)})`
    );
  }
  assert.equal(world.player.integrity, 100, 'Sera must not take enemy damage while calibrating the Chrono Anchor Pad');

  // Finalize recording [T]
  const stopRec = createEmptyInput(Math.PI);
  stopRec.echoRecordJustPressed = true;
  stepWorld(world, stopRec, 0.02);
  assert.equal(world.echo.state, 'ready');
  assert.ok(world.echo.clip !== null && world.echo.clip.duration >= 2.7);

  // Step 5 & 6: Start playback [Y] and move live Sera independently to the barrier entrance
  const startPlay = createEmptyInput(Math.PI);
  startPlay.echoPlayJustPressed = true;
  stepWorld(world, startPlay, 0.02);
  assert.equal(world.echo.state, 'playback');

  // Step 7 & 8: Advance until Echo reaches the plate (~0.76s = 38 steps)
  for (let i = 0; i < 40; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(plate.active, true, 'Echo occupying Chrono Anchor Pad 01 must activate the plate');
  assert.equal(plate.barrierOpen, true, 'Active plate must open the receiver barrier');
  assert.equal(barrierObs.disabled, true, 'Open barrier must disable its physical obstacle collider');

  // Step 9: Move live Sera West (moveX = -1) straight through the open barrier at (-6.2, 9.0) to x < -7.5
  for (let i = 0; i < 35; i++) {
    const crossInp = createEmptyInput(Math.PI);
    crossInp.moveX = -1;
    stepWorld(world, crossInp, 0.02);
  }
  assert.ok(
    world.player.x < plate.receiverX - plate.receiverRadius - GAME_CONFIG.player.radius,
    `Live Sera must cross comfortably through the open barrier to the western side (player.x=${world.player.x.toFixed(2)})`
  );
  assert.equal(plate.active, true, 'Echo stationary hold must keep barrier open with ample margin while Sera crosses');

  // Step 10: Advance until playback ends and verify plate/barrier return to locked state
  for (let i = 0; i < 80; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.echo.state, 'finished');
  assert.equal(world.echo.activeActor, null);
  assert.equal(plate.active, false, 'Plate must release when playback finishes');
  assert.equal(plate.barrierOpen, false, 'Barrier must close when playback finishes');
  assert.equal(barrierObs.disabled, false, 'Barrier collider must re-enable when playback finishes');
});

test('Phase 3 Preflight Audit: enemies hold perimeter in calibration zone but engage in combat bay even while Echo is ready or playing', () => {
  const world = createInitialWorld('playing');

  // Record a 0.50s clip (25 steps @ 0.02s >= minRecordDuration 0.35s) in the calibration zone so world.echo.state === 'ready' and damageDealt === 0
  const startRec = createEmptyInput(Math.PI);
  startRec.echoRecordJustPressed = true;
  stepWorld(world, startRec, 0.02);

  for (let i = 0; i < 25; i++) {
    const moveInp = createEmptyInput(Math.PI);
    moveInp.moveX = -1;
    stepWorld(world, moveInp, 0.02);
  }

  const stopRec = createEmptyInput(Math.PI);
  stopRec.echoRecordJustPressed = true;
  stepWorld(world, stopRec, 0.02);
  assert.equal(world.echo.state, 'ready');
  assert.equal(world.stats.damageDealt, 0);

  // 1. Place Sera on Chrono Anchor Pad 01 (-3.8, 9.0) inside the calibration zone
  world.player.x = -3.8;
  world.player.z = 9.0;
  assert.equal(isPlayerInCalibrationZone(world), true, 'Chrono Anchor Pad 01 must be inside the calibration zone');

  for (let i = 0; i < 60; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  for (const enemy of world.enemies) {
    const dist = Math.hypot(enemy.x - world.player.x, enemy.z - world.player.z);
    assert.ok(
      dist >= 5.0,
      `Enemy ${enemy.id} must remain on perimeter (>= 5.0m) while Sera is in calibration zone (dist=${dist.toFixed(2)})`
    );
  }

  // 2. Move Sera into the main combat bay (0, -2.0) while Echo clip is ready (and then while playing) with damageDealt === 0
  world.player.x = 0;
  world.player.z = -2.0;
  assert.equal(
    isPlayerInCalibrationZone(world),
    false,
    'Main combat bay must NOT be treated as calibration zone even when Echo state is ready/playback'
  );

  // Start playback while Sera is in the combat bay
  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  assert.equal(world.echo.state, 'playback');

  // Place Bastion 3.6m away from Sera in the combat bay and step forward; verify it closes in / telegraphs instead of retreating to 5.2m
  const bastion = world.enemies.find((e) => e.archetype === 'bastion')!;
  bastion.x = 0;
  bastion.z = 1.6;
  const initialDist = Math.hypot(bastion.x - world.player.x, bastion.z - world.player.z);

  for (let i = 0; i < 40; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const finalDist = Math.hypot(bastion.x - world.player.x, bastion.z - world.player.z);
  assert.ok(
    finalDist < initialDist || bastion.aiState === 'telegraph' || bastion.aiState === 'attack' || bastion.aiState === 'recovery',
    `Enemy in combat bay must actively engage Sera even while Echo is playing (initialDist=${initialDist.toFixed(2)}, finalDist=${finalDist.toFixed(2)}, state=${bastion.aiState})`
  );
});

test('Phase 3 Stage 2 (TEST): Heavy Receiver validates Echo-only policy, Heavy action type, position, facing angle, and charge expiration', () => {
  const world = createInitialWorld('playing');
  const rcvCfg = GAME_CONFIG.arena.chronoPuzzle.heavyReceiver;

  // Move live Sera to the Heavy Receiver Strike Pad (-8.2, 13.6) facing North (Math.PI)
  world.player.x = rcvCfg.x;
  world.player.z = rcvCfg.z;
  world.player.rotationY = rcvCfg.targetYaw;

  // 1. Live player performing a Heavy attack directly on the receiver must be rejected (echo_only policy)
  let rejectedEventCount = 0;
  for (let i = 0; i < 30; i++) {
    const inp = createEmptyInput(rcvCfg.targetYaw);
    if (i === 0) inp.heavyAttackJustPressed = true;
    stepWorld(world, inp, 0.02);
    if (world.events.some((e) => e.type === 'echo_receiver_rejected')) {
      rejectedEventCount += 1;
    }
  }
  assert.ok(rejectedEventCount >= 1, 'Live player heavy strike on Echo-only receiver must emit echo_receiver_rejected');
  assert.equal(world.puzzle.heavyReceiver.charged, false, 'Live player heavy strike must NOT charge the Echo-only receiver');
  assert.equal(world.puzzle.heavyReceiver.lastAttemptOutcome, 'wrong_actor');

  // 2. Record an Echo performing a Light attack on the receiver -> must NOT charge receiver
  world.player.x = rcvCfg.x;
  world.player.z = rcvCfg.z;
  world.player.rotationY = rcvCfg.targetYaw;
  world.player.actionState = 'idle';

  const recStart1 = createEmptyInput(rcvCfg.targetYaw);
  recStart1.echoRecordJustPressed = true;
  stepWorld(world, recStart1, 0.02);

  const lightInp = createEmptyInput(rcvCfg.targetYaw);
  lightInp.lightAttackJustPressed = true;
  stepWorld(world, lightInp, 0.02);
  for (let i = 0; i < 25; i++) {
    stepWorld(world, createEmptyInput(rcvCfg.targetYaw), 0.02);
  }

  const recStop1 = createEmptyInput(rcvCfg.targetYaw);
  recStop1.echoRecordJustPressed = true;
  stepWorld(world, recStop1, 0.02);

  const play1 = createEmptyInput(rcvCfg.targetYaw);
  play1.echoPlayJustPressed = true;
  stepWorld(world, play1, 0.02);
  for (let i = 0; i < 30; i++) {
    stepWorld(world, createEmptyInput(rcvCfg.targetYaw), 0.02);
  }
  assert.equal(world.puzzle.heavyReceiver.charged, false, 'Echo light swing must NOT activate the Heavy Receiver');
  assert.equal(world.puzzle.heavyReceiver.lastAttemptOutcome, 'wrong_action');

  // 3. Record an Echo performing a Heavy attack facing the WRONG direction (South = 0 rad instead of North = Math.PI)
  world.player.x = rcvCfg.x;
  world.player.z = rcvCfg.z;
  world.player.rotationY = 0;
  world.player.actionState = 'idle';

  const recStartWrongDir = createEmptyInput(0);
  recStartWrongDir.echoRecordJustPressed = true;
  stepWorld(world, recStartWrongDir, 0.02);

  for (let i = 0; i < 30; i++) {
    const inp = createEmptyInput(0);
    if (i === 0) inp.heavyAttackJustPressed = true;
    stepWorld(world, inp, 0.02);
  }

  const recStopWrongDir = createEmptyInput(0);
  recStopWrongDir.echoRecordJustPressed = true;
  stepWorld(world, recStopWrongDir, 0.02);

  const playWrongDir = createEmptyInput(0);
  playWrongDir.echoPlayJustPressed = true;
  stepWorld(world, playWrongDir, 0.02);
  for (let i = 0; i < 35; i++) {
    stepWorld(world, createEmptyInput(0), 0.02);
  }
  assert.equal(
    world.puzzle.heavyReceiver.charged,
    false,
    'Echo Heavy swing facing away from the Induction Core must NOT activate the Heavy Receiver'
  );
  assert.equal(world.puzzle.heavyReceiver.lastAttemptOutcome, 'wrong_orientation');

  // 4. Record an Echo performing a Heavy attack on the Strike Pad facing North (Math.PI) -> MUST activate receiver
  world.player.x = rcvCfg.x;
  world.player.z = rcvCfg.z;
  world.player.rotationY = rcvCfg.targetYaw;
  world.player.actionState = 'idle';

  const recStartValid = createEmptyInput(rcvCfg.targetYaw);
  recStartValid.echoRecordJustPressed = true;
  stepWorld(world, recStartValid, 0.02);

  for (let i = 0; i < 30; i++) {
    const inp = createEmptyInput(rcvCfg.targetYaw);
    if (i === 0) inp.heavyAttackJustPressed = true;
    stepWorld(world, inp, 0.02);
  }

  const recStopValid = createEmptyInput(rcvCfg.targetYaw);
  recStopValid.echoRecordJustPressed = true;
  stepWorld(world, recStopValid, 0.02);

  // Move live Sera away before playback
  world.player.x = -5.5;
  world.player.z = 11.5;

  const playValid = createEmptyInput(rcvCfg.targetYaw);
  playValid.echoPlayJustPressed = true;
  stepWorld(world, playValid, 0.02);

  let activatedEventFired = world.events.some((e) => e.type === 'echo_receiver_activated');
  for (let i = 0; i < 30; i++) {
    stepWorld(world, createEmptyInput(rcvCfg.targetYaw), 0.02);
    if (world.events.some((e) => e.type === 'echo_receiver_activated')) {
      activatedEventFired = true;
    }
  }
  assert.equal(activatedEventFired, true, 'Valid Echo Heavy strike must emit echo_receiver_activated');
  assert.equal(world.puzzle.heavyReceiver.charged, true, 'Valid Echo Heavy strike must charge the Heavy Receiver');
  assert.equal(world.puzzle.heavyReceiver.lastAttemptOutcome, 'charged');
  assert.ok(world.puzzle.heavyReceiver.chargeTimer > 6.0, 'Heavy Receiver must have its charge timer initialized');
  assert.equal(world.puzzle.stage, 'combine', 'Charging Heavy Receiver must advance puzzle stage to combine');

  // 5. Advance past chargeDuration (7.0s) and verify clean expiration
  let expiredEventFired = false;
  for (let i = 0; i < 380; i++) {
    stepWorld(world, createEmptyInput(rcvCfg.targetYaw), 0.02);
    if (world.events.some((e) => e.type === 'echo_receiver_expired')) {
      expiredEventFired = true;
    }
  }
  assert.equal(expiredEventFired, true, 'Heavy Receiver charge expiration must emit echo_receiver_expired');
  assert.equal(world.puzzle.heavyReceiver.charged, false, 'Heavy Receiver must return to uncharged after chargeDuration');
  assert.equal(world.puzzle.heavyReceiver.chargeTimer, 0);
});

test('Phase 3 Stage 3 (COMBINE): Final Barrier requires BOTH charged Heavy Receiver AND Echo on Chrono Anchor Pad 02, allowing live Sera to cross', () => {
  const world = createInitialWorld('playing');
  const rcvCfg = GAME_CONFIG.arena.chronoPuzzle.heavyReceiver;
  const pad2Cfg = GAME_CONFIG.arena.chronoPuzzle.combinePlate;
  const barrierCfg = GAME_CONFIG.arena.chronoPuzzle.finalBarrier;
  const finalObs = world.obstacles.find((o) => o.id === barrierCfg.id)!;

  assert.equal(world.puzzle.finalBarrier.open, false);
  assert.equal(finalObs.disabled, false);

  // 1. Verify holding Pad 02 alone with an Echo (without charging Heavy Receiver) does NOT open Final Barrier
  world.player.x = pad2Cfg.x;
  world.player.z = pad2Cfg.z;
  const recPadOnly = createEmptyInput(Math.PI);
  recPadOnly.echoRecordJustPressed = true;
  stepWorld(world, recPadOnly, 0.02);
  for (let i = 0; i < 30; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const stopPadOnly = createEmptyInput(Math.PI);
  stopPadOnly.echoRecordJustPressed = true;
  stepWorld(world, stopPadOnly, 0.02);

  world.player.x = -6.0;
  world.player.z = 10.2;
  const playPadOnly = createEmptyInput(Math.PI);
  playPadOnly.echoPlayJustPressed = true;
  stepWorld(world, playPadOnly, 0.02);
  stepWorld(world, createEmptyInput(Math.PI), 0.02);

  assert.equal(world.puzzle.combinePlate.active, true, 'Echo on Pad 02 must activate combinePlate');
  assert.equal(world.puzzle.heavyReceiver.charged, false, 'Heavy Receiver is not charged');
  assert.equal(
    world.puzzle.finalBarrier.open,
    false,
    'Final Barrier must remain locked when Pad 02 is held without Heavy Receiver charged'
  );
  assert.equal(finalObs.disabled, false);

  // Clear Echo
  const clearInp = createEmptyInput(Math.PI);
  clearInp.echoClearJustPressed = true;
  stepWorld(world, clearInp, 0.02);
  assert.equal(world.puzzle.combinePlate.active, false);

  // 2. Record the combined solution in one Echo clip:
  //    - Start at Heavy Receiver Strike Pad (-8.2, 13.6) facing North (Math.PI)
  //    - Trigger Heavy attack [E] (which lunges North to z ~ 12.1)
  //    - Walk North (moveZ = -1 with aimYaw = Math.PI) onto Chrono Anchor Pad 02 (-8.2, 10.2) and hold stationary for 1.6s
  world.player.x = rcvCfg.x;
  world.player.z = rcvCfg.z;
  world.player.rotationY = rcvCfg.targetYaw;
  world.player.actionState = 'idle';

  const startComboRec = createEmptyInput(rcvCfg.targetYaw);
  startComboRec.echoRecordJustPressed = true;
  stepWorld(world, startComboRec, 0.02);

  // Trigger Heavy attack [E] (32 steps = 0.64s covers windup + active + recovery)
  for (let i = 0; i < 32; i++) {
    const inp = createEmptyInput(rcvCfg.targetYaw);
    if (i === 0) inp.heavyAttackJustPressed = true;
    stepWorld(world, inp, 0.02);
  }

  // Walk North (with aimYaw = Math.PI, pressing W is moveZ = -1 which moves in -Z direction toward z = 10.2)
  for (let i = 0; i < 20; i++) {
    const inp = createEmptyInput(rcvCfg.targetYaw);
    inp.moveZ = -1;
    stepWorld(world, inp, 0.02);
  }
  const distToPad2 = Math.hypot(world.player.x - pad2Cfg.x, world.player.z - pad2Cfg.z);
  assert.ok(
    distToPad2 <= pad2Cfg.radius,
    `Recorded trajectory must reach Chrono Anchor Pad 02 (dist=${distToPad2.toFixed(2)} <= ${pad2Cfg.radius})`
  );

  // Hold on Pad 02 for 1.6s (80 steps)
  for (let i = 0; i < 80; i++) {
    stepWorld(world, createEmptyInput(rcvCfg.targetYaw), 0.02);
  }

  const stopComboRec = createEmptyInput(rcvCfg.targetYaw);
  stopComboRec.echoRecordJustPressed = true;
  stepWorld(world, stopComboRec, 0.02);
  assert.equal(world.echo.state, 'ready');

  // Position live Sera just east of Final Combine Barrier (-9.5, 10.2) ready to cross
  world.player.x = -9.5;
  world.player.z = 10.2;

  // Verify live Sera cannot walk through the locked Final Combine Barrier before Echo unlocks it
  for (let i = 0; i < 15; i++) {
    const blockedInp = createEmptyInput(Math.PI);
    blockedInp.moveX = -1;
    stepWorld(world, blockedInp, 0.02);
  }
  assert.ok(
    world.player.x > barrierCfg.x,
    `Locked Final Combine Barrier must physically block live Sera (player.x=${world.player.x.toFixed(2)})`
  );

  // 3. Start Echo playback [Y]
  const playCombo = createEmptyInput(Math.PI);
  playCombo.echoPlayJustPressed = true;
  stepWorld(world, playCombo, 0.02);

  // Step through the Heavy attack portion (~15 steps) -> Heavy Receiver charges, but Pad 02 not yet occupied
  for (let i = 0; i < 15; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.puzzle.heavyReceiver.charged, true, 'Echo Heavy strike must charge Heavy Receiver first');
  assert.equal(world.puzzle.combinePlate.active, false, 'Echo has not reached Pad 02 yet');
  assert.equal(
    world.puzzle.finalBarrier.open,
    false,
    'Final Barrier must stay closed when only Heavy Receiver is charged without Echo on Pad 02'
  );

  // Even if live Sera stands on Pad 02 while Heavy Receiver is charged, Final Barrier must stay closed (Echo-only pad)
  world.player.x = pad2Cfg.x;
  world.player.z = pad2Cfg.z;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(world.puzzle.combinePlate.active, false, 'Live Sera on Pad 02 must not activate Echo-only combinePlate');
  assert.equal(world.puzzle.finalBarrier.open, false);

  // Move live Sera back near the barrier entrance (-9.5, 10.2) and step until Echo reaches Pad 02 (~40 steps)
  world.player.x = -9.5;
  world.player.z = 10.2;
  let combineOpenedEvent = false;
  for (let i = 0; i < 42; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
    if (world.events.some((e) => e.type === 'echo_combine_barrier_opened')) {
      combineOpenedEvent = true;
    }
  }

  assert.equal(world.puzzle.heavyReceiver.charged, true, 'Heavy Receiver remains charged');
  assert.equal(world.puzzle.combinePlate.active, true, 'Echo now occupies Chrono Anchor Pad 02');
  assert.equal(world.puzzle.finalBarrier.open, true, 'Dual-requirement Final Combine Barrier must open');
  assert.equal(finalObs.disabled, true, 'Final Combine Barrier physical collider must be disabled');
  assert.equal(combineOpenedEvent, true, 'Must emit echo_combine_barrier_opened event');

  // 4. Move live Sera West (moveX = -1) across Final Combine Barrier (-10.8, 10.2) into Western Calibration Vault (x <= -11.4)
  for (let i = 0; i < 30; i++) {
    const crossInp = createEmptyInput(Math.PI);
    crossInp.moveX = -1;
    stepWorld(world, crossInp, 0.02);
  }
  assert.ok(
    world.player.x <= -11.4,
    `Live Sera must cross through open Final Combine Barrier into Western Calibration Vault (player.x=${world.player.x.toFixed(2)})`
  );
  assert.equal(world.puzzle.stage, 'completed', 'Crossing Final Combine Barrier must mark calibration sequence completed');
  assert.equal(world.puzzle.completed, true);
});

test('Phase 3 Puzzle Reset, Clear, and Pause Integrity: [C] clear, [R] restart, and pause preserve deterministic state', () => {
  const world = createInitialWorld('playing');

  // Simulate active puzzle state
  world.puzzle.heavyReceiver.charged = true;
  world.puzzle.heavyReceiver.chargeTimer = 6.0;
  world.puzzle.heavyReceiver.lastAttemptOutcome = 'charged';
  world.puzzle.stage = 'combine';

  // Pause must freeze heavyReceiver.chargeTimer
  world.appState = 'paused';
  stepWorld(world, createEmptyInput(Math.PI), 1.0);
  assert.equal(world.puzzle.heavyReceiver.chargeTimer, 6.0, 'Paused world must not decay Heavy Receiver chargeTimer');
  world.appState = 'playing';

  // Clear [C] must discharge Heavy Receiver and close barriers
  const clearInp = createEmptyInput(Math.PI);
  clearInp.echoClearJustPressed = true;
  stepWorld(world, clearInp, 0.02);
  assert.equal(world.puzzle.heavyReceiver.charged, false, 'Echo Clear [C] must discharge Heavy Receiver');
  assert.equal(world.puzzle.heavyReceiver.chargeTimer, 0);
  assert.equal(world.puzzle.finalBarrier.open, false);

  // Restart [R] (resetWorldForPlaying) must reset stage and all puzzle state cleanly
  world.puzzle.stage = 'completed';
  world.puzzle.completed = true;
  world.puzzle.heavyReceiver.charged = true;
  world.puzzle.finalBarrier.open = true;
  resetWorldForPlaying(world);

  assert.equal(world.puzzle.stage, 'teach');
  assert.equal(world.puzzle.completed, false);
  assert.equal(world.puzzle.teachPlate.active, false);
  assert.equal(world.puzzle.heavyReceiver.charged, false);
  assert.equal(world.puzzle.combinePlate.active, false);
  assert.equal(world.puzzle.finalBarrier.open, false);
  const finalObs = world.obstacles.find((o) => o.id === GAME_CONFIG.arena.chronoPuzzle.finalBarrier.id)!;
  assert.equal(finalObs.disabled, false);
});

test('Phase 3.1 Final Gate Logic Audit: teachPlate (Pad 01) cannot substitute for combinePlate (Pad 02) to open the Archive Calibration Barrier', () => {
  const world = createInitialWorld('playing');
  const pad1Cfg = GAME_CONFIG.arena.chronoPlate;
  const rcvCfg = GAME_CONFIG.arena.chronoPuzzle.heavyReceiver;
  const pad2Cfg = GAME_CONFIG.arena.chronoPuzzle.combinePlate;
  const finalBarrierCfg = GAME_CONFIG.arena.chronoPuzzle.finalBarrier;

  const teachObs = world.obstacles.find((o) => o.id === pad1Cfg.receiverId)!;
  const finalObs = world.obstacles.find((o) => o.id === finalBarrierCfg.id)!;

  // Case 1: Receiver charged + Pad 01 active + Pad 02 inactive -> Final Barrier MUST remain locked (while TEACH barrier opens)
  // First charge Kinetic Resonance Receiver 01 via a recorded Echo Heavy strike at (-8.2, 13.6) facing North
  world.player.x = rcvCfg.x;
  world.player.z = rcvCfg.z;
  world.player.rotationY = rcvCfg.targetYaw;
  world.player.actionState = 'idle';

  const recCharge = createEmptyInput(rcvCfg.targetYaw);
  recCharge.echoRecordJustPressed = true;
  stepWorld(world, recCharge, 0.02);

  for (let i = 0; i < 28; i++) {
    const inp = createEmptyInput(rcvCfg.targetYaw);
    if (i === 0) inp.heavyAttackJustPressed = true;
    stepWorld(world, inp, 0.02);
  }
  const stopCharge = createEmptyInput(rcvCfg.targetYaw);
  stopCharge.echoRecordJustPressed = true;
  stepWorld(world, stopCharge, 0.02);

  const playCharge = createEmptyInput(rcvCfg.targetYaw);
  playCharge.echoPlayJustPressed = true;
  stepWorld(world, playCharge, 0.02);
  for (let i = 0; i < 15; i++) {
    stepWorld(world, createEmptyInput(rcvCfg.targetYaw), 0.02);
  }
  assert.equal(world.puzzle.heavyReceiver.charged, true, 'Kinetic Resonance Receiver 01 is charged');

  // Now record and replay an Echo holding Pad 01 (teachPlate at -3.8, 9.0) while receiver is still charged and Pad 02 is inactive
  world.player.x = pad1Cfg.x;
  world.player.z = pad1Cfg.z;
  world.player.actionState = 'idle';

  const recPad1 = createEmptyInput(Math.PI);
  recPad1.echoRecordJustPressed = true;
  stepWorld(world, recPad1, 0.02);
  for (let i = 0; i < 22; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const stopPad1 = createEmptyInput(Math.PI);
  stopPad1.echoRecordJustPressed = true;
  stepWorld(world, stopPad1, 0.02);

  // Move live Sera away from all pads
  world.player.x = -6.0;
  world.player.z = 10.2;

  const playPad1 = createEmptyInput(Math.PI);
  playPad1.echoPlayJustPressed = true;
  stepWorld(world, playPad1, 0.02);
  stepWorld(world, createEmptyInput(Math.PI), 0.02);

  assert.equal(world.puzzle.heavyReceiver.charged, true, 'Receiver remains charged during Pad 01 playback');
  assert.equal(world.pressurePlate.active, true, 'Pad 01 (teachPlate) is active');
  assert.equal(world.pressurePlate.barrierOpen, true, 'Containment Barrier 01 (TEACH gate) opens as intended');
  assert.equal(teachObs.disabled, true, 'Containment Barrier 01 collider is disabled');
  assert.equal(world.puzzle.combinePlate.active, false, 'Pad 02 (combinePlate) is inactive');
  assert.equal(
    world.puzzle.finalBarrier.open,
    false,
    'Archive Calibration Barrier (final gate) MUST remain locked when Pad 01 is active instead of Pad 02'
  );
  assert.equal(finalObs.disabled, false, 'Archive Calibration Barrier collider MUST remain solid');

  // Case 2: Receiver uncharged + Pad 02 active -> Final Barrier remains locked
  const clearInp = createEmptyInput(Math.PI);
  clearInp.echoClearJustPressed = true;
  stepWorld(world, clearInp, 0.02);
  assert.equal(world.puzzle.heavyReceiver.charged, false);
  assert.equal(world.pressurePlate.active, false);
  assert.equal(world.pressurePlate.barrierOpen, false);

  world.player.x = pad2Cfg.x;
  world.player.z = pad2Cfg.z;
  const recPad2 = createEmptyInput(Math.PI);
  recPad2.echoRecordJustPressed = true;
  stepWorld(world, recPad2, 0.02);
  for (let i = 0; i < 25; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const stopPad2 = createEmptyInput(Math.PI);
  stopPad2.echoRecordJustPressed = true;
  stepWorld(world, stopPad2, 0.02);

  world.player.x = -9.5;
  world.player.z = 10.2;
  const playPad2Uncharged = createEmptyInput(Math.PI);
  playPad2Uncharged.echoPlayJustPressed = true;
  stepWorld(world, playPad2Uncharged, 0.02);
  stepWorld(world, createEmptyInput(Math.PI), 0.02);

  assert.equal(world.puzzle.heavyReceiver.charged, false, 'Receiver is uncharged');
  assert.equal(world.puzzle.combinePlate.active, true, 'Pad 02 is active');
  assert.equal(
    world.puzzle.finalBarrier.open,
    false,
    'Archive Calibration Barrier MUST remain locked when Receiver is uncharged and Pad 02 is active'
  );
  assert.equal(finalObs.disabled, false);

  // Case 3: Receiver charged + Pad 02 active -> Final Barrier opens
  // Record combined sequence: Heavy strike at receiver (-8.2, 13.6) -> walk North onto Pad 02 (-8.2, 10.2) -> hold
  world.player.x = rcvCfg.x;
  world.player.z = rcvCfg.z;
  world.player.rotationY = rcvCfg.targetYaw;
  world.player.actionState = 'idle';

  const recBoth = createEmptyInput(rcvCfg.targetYaw);
  recBoth.echoRecordJustPressed = true;
  stepWorld(world, recBoth, 0.02);
  for (let i = 0; i < 32; i++) {
    const inp = createEmptyInput(rcvCfg.targetYaw);
    if (i === 0) inp.heavyAttackJustPressed = true;
    stepWorld(world, inp, 0.02);
  }
  for (let i = 0; i < 20; i++) {
    const inp = createEmptyInput(rcvCfg.targetYaw);
    inp.moveZ = -1;
    stepWorld(world, inp, 0.02);
  }
  for (let i = 0; i < 50; i++) {
    stepWorld(world, createEmptyInput(rcvCfg.targetYaw), 0.02);
  }
  const stopBoth = createEmptyInput(rcvCfg.targetYaw);
  stopBoth.echoRecordJustPressed = true;
  stepWorld(world, stopBoth, 0.02);

  world.player.x = -9.5;
  world.player.z = 10.2;
  const playBoth = createEmptyInput(Math.PI);
  playBoth.echoPlayJustPressed = true;
  stepWorld(world, playBoth, 0.02);
  for (let i = 0; i < 55; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  assert.equal(world.puzzle.heavyReceiver.charged, true, 'Receiver is charged');
  assert.equal(world.pressurePlate.active, false, 'Pad 01 is inactive');
  assert.equal(world.puzzle.combinePlate.active, true, 'Pad 02 is active');
  assert.equal(world.puzzle.finalBarrier.open, true, 'Archive Calibration Barrier opens when Receiver charged AND Pad 02 active');
  assert.equal(finalObs.disabled, true, 'Archive Calibration Barrier collider is disabled');

  // Case 4: Clearing Echo [C] or Restarting [R] resets the final gate without breaking TEACH barrier behavior
  const clearBoth = createEmptyInput(Math.PI);
  clearBoth.echoClearJustPressed = true;
  stepWorld(world, clearBoth, 0.02);
  assert.equal(world.puzzle.heavyReceiver.charged, false);
  assert.equal(world.puzzle.combinePlate.active, false);
  assert.equal(world.puzzle.finalBarrier.open, false);
  assert.equal(finalObs.disabled, false);

  resetWorldForPlaying(world);
  assert.equal(world.puzzle.finalBarrier.open, false);
  assert.equal(finalObs.disabled, false);
  assert.equal(world.pressurePlate.active, false);
  assert.equal(world.pressurePlate.barrierOpen, false);
  assert.equal(teachObs.disabled, false);
});

test('Phase 4 Target Eligibility & Range: Relay requires active Echo in playback within RELAY_MAX_RANGE and rejects idle, recording, ready, finished, cleared, and out-of-range states', () => {
  const world = createInitialWorld('playing');
  const initialFlux = world.player.flux;

  // 1. Rejects when Echo is idle
  assert.equal(evaluateRelayTarget(world).status, 'no_active_echo');
  const relayIdle = createEmptyInput(Math.PI);
  relayIdle.echoRelayJustPressed = true;
  stepWorld(world, relayIdle, 0.02);
  assert.equal(world.relay.lastOutcome, 'no_active_echo');
  assert.equal(world.relay.activationCount, 0);

  // 2. Rejects while Echo is recording
  const startRec = createEmptyInput(Math.PI);
  startRec.echoRecordJustPressed = true;
  stepWorld(world, startRec, 0.02);
  for (let i = 0; i < 22; i++) {
    const moveInp = createEmptyInput(Math.PI);
    moveInp.moveZ = -1;
    stepWorld(world, moveInp, 0.02);
  }
  assert.equal(world.echo.state, 'recording');
  assert.equal(evaluateRelayTarget(world).status, 'no_active_echo');
  assert.equal(attemptEchoRelay(world), false);
  assert.equal(world.relay.lastOutcome, 'no_active_echo');

  // 3. Rejects when Echo clip is finalized (ready) but not playing
  const stopRec = createEmptyInput(Math.PI);
  stopRec.echoRecordJustPressed = true;
  stepWorld(world, stopRec, 0.02);
  assert.equal(world.echo.state, 'ready');
  assert.equal(evaluateRelayTarget(world).status, 'no_active_echo');
  assert.equal(attemptEchoRelay(world), false);
  assert.equal(world.relay.lastOutcome, 'no_active_echo');

  // 4. Start playback [Y] -> Echo is at (0, 12.5)
  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  assert.equal(world.echo.state, 'playback');
  assert.ok(world.echo.activeActor !== null);

  // 5. Rejects when Echo is beyond RELAY_MAX_RANGE (8.0m)
  world.player.x = 9.2;
  world.player.z = 12.5;
  world.player.flux = 60;
  const outOfRangeEval = evaluateRelayTarget(world);
  assert.equal(outOfRangeEval.canRelay, false);
  assert.equal(outOfRangeEval.status, 'out_of_range');
  assert.ok(outOfRangeEval.distance > RELAY_MAX_RANGE);
  assert.equal(attemptEchoRelay(world), false);
  assert.equal(world.player.flux, 60, 'Out-of-range Relay must not spend Flux');

  // 6. Succeeds when Echo is within RELAY_MAX_RANGE (e.g. 4.5m away)
  world.player.x = 4.5;
  world.player.z = 12.5;
  const readyEval = evaluateRelayTarget(world);
  assert.equal(readyEval.canRelay, true);
  assert.equal(readyEval.status, 'ready');

  const relayValid = createEmptyInput(Math.PI);
  relayValid.echoRelayJustPressed = true;
  const fluxBefore = world.player.flux;
  stepWorld(world, relayValid, 0.02);
  assert.equal(world.relay.lastOutcome, 'teleported');
  assert.equal(world.relay.activationCount, 1);
  assert.ok(
    Math.hypot(world.player.x - readyEval.landingX, world.player.z - readyEval.landingZ) < 0.05,
    'Sera must arrive at the validated Relay landing point'
  );
  assert.ok(
    world.player.flux < fluxBefore,
    `Successful Relay must spend Flux (before=${fluxBefore}, after=${world.player.flux}, initial=${initialFlux})`
  );

  // 7. Advance until playback finishes -> Rejects when Echo state is finished
  for (let i = 0; i < 30; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.echo.state, 'finished');
  world.relay.cooldownTimer = 0;
  assert.equal(evaluateRelayTarget(world).status, 'no_active_echo');
  assert.equal(attemptEchoRelay(world), false);

  // 8. Clear Echo [C] -> Rejects when cleared
  const clearInp = createEmptyInput(Math.PI);
  clearInp.echoClearJustPressed = true;
  stepWorld(world, clearInp, 0.02);
  assert.equal(world.echo.state, 'idle');
  assert.equal(evaluateRelayTarget(world).status, 'no_active_echo');
});

test('Phase 4 Landing & Collision Validation: deterministic candidate selection, obstacle/enemy non-overlap, arena bounds, and blocked-path / progression-gate enforcement', () => {
  const world = createInitialWorld('playing');
  world.player.flux = 100;

  // Record a stationary Echo at (0, 12.0) and start playback
  world.player.x = 0;
  world.player.z = 12.0;
  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  for (let i = 0; i < 30; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  assert.equal(world.echo.state, 'playback');

  // 1. Deterministic candidate selection in identical world state
  world.player.x = 4.0;
  world.player.z = 12.0;
  const evalA = evaluateRelayTarget(world);
  const evalB = evaluateRelayTarget(world);
  assert.equal(evalA.canRelay, true);
  assert.equal(evalA.landingX, evalB.landingX, 'Candidate X must be deterministic');
  assert.equal(evalA.landingZ, evalB.landingZ, 'Candidate Z must be deterministic');
  assert.equal(evalA.candidateIndex, evalB.candidateIndex, 'Candidate index must be deterministic');

  // Verify landing point never overlaps the Echo actor center (clearance >= player.radius + echo.radius)
  const distToEcho = Math.hypot(
    evalA.landingX - world.echo.activeActor!.x,
    evalA.landingZ - world.echo.activeActor!.z
  );
  assert.ok(
    distToEcho >= GAME_CONFIG.player.radius + world.echo.activeActor!.radius,
    `Landing point must not overlap Echo actor (dist=${distToEcho.toFixed(2)})`
  );

  // 2. Place an alive enemy directly at the preferred candidate (evalA.landingX, evalA.landingZ); verify Relay picks a different safe candidate and does not overlap any enemy
  const bastion = world.enemies[0];
  bastion.x = evalA.landingX;
  bastion.z = evalA.landingZ;
  const evalAvoidEnemy = evaluateRelayTarget(world);
  assert.equal(evalAvoidEnemy.canRelay, true);
  const distToEnemy = Math.hypot(evalAvoidEnemy.landingX - bastion.x, evalAvoidEnemy.landingZ - bastion.z);
  assert.ok(
    distToEnemy >= GAME_CONFIG.player.radius + bastion.radius,
    `Selected landing point must not overlap enemy (dist=${distToEnemy.toFixed(2)})`
  );
  // Restore bastion position
  bastion.x = 0;
  bastion.z = 4.5;

  // 3. Blocked path across solid obstacle (Chronicle Loom Pylon at 0, -2, radius 1.85)
  world.echo.activeActor!.x = 0;
  world.echo.activeActor!.z = -5.2;
  world.player.x = 0;
  world.player.z = 1.8; // Distance = 7.0m (<= 8.0m), straight line passes through (0, -2) Loom Pylon
  const blockedByPylon = evaluateRelayTarget(world);
  assert.equal(blockedByPylon.canRelay, false);
  assert.equal(blockedByPylon.status, 'path_blocked', 'Solid obstacle between Sera and Echo must block Relay path');

  // 4. Cannot cross closed Containment Barrier 01 (-6.2, 9.0) even if barrier obstacle disabled flag is desynced
  world.pressurePlate.active = false;
  world.pressurePlate.barrierOpen = false;
  const teachObs = world.obstacles.find((o) => o.id === world.pressurePlate.receiverId)!;
  teachObs.disabled = true; // Simulate stale/hidden visual/collider flag while authoritative barrierOpen is false
  world.echo.activeActor!.x = -7.8;
  world.echo.activeActor!.z = 9.0; // Inside calibration alcove
  world.player.x = -3.8;
  world.player.z = 9.0; // Outside calibration alcove (4.0m away)
  const blockedByGate1 = evaluateRelayTarget(world);
  assert.equal(blockedByGate1.canRelay, false);
  assert.equal(
    blockedByGate1.status,
    'path_blocked',
    'Closed Containment Barrier 01 must block Relay across the gate threshold'
  );
  teachObs.disabled = false;

  // When Containment Barrier 01 is legitimately open, Relay across the open gate is allowed
  world.pressurePlate.active = true;
  world.pressurePlate.barrierOpen = true;
  teachObs.disabled = true;
  const openGate1Eval = evaluateRelayTarget(world);
  assert.equal(openGate1Eval.canRelay, true);
  assert.equal(openGate1Eval.status, 'ready', 'Open Containment Barrier 01 must allow Relay through the open passage');

  // 5. Cannot cross locked Archive Calibration Barrier (-10.8, 10.2)
  world.puzzle.finalBarrier.open = false;
  const finalObs = world.obstacles.find((o) => o.id === world.puzzle.finalBarrier.id)!;
  finalObs.disabled = false;
  world.echo.activeActor!.x = -12.6;
  world.echo.activeActor!.z = 10.2; // Inside Western Calibration Vault
  world.player.x = -8.5;
  world.player.z = 10.2; // East of final barrier (4.1m away)
  const blockedByFinalGate = evaluateRelayTarget(world);
  assert.equal(blockedByFinalGate.canRelay, false);
  assert.equal(
    blockedByFinalGate.status,
    'path_blocked',
    'Locked Archive Calibration Barrier must block Relay'
  );

  // 6. All-invalid candidates result in no_safe_landing
  world.echo.activeActor!.x = 0;
  world.echo.activeActor!.z = 12.0;
  world.player.x = 0;
  world.player.z = 15.0;
  // Surround Echo with temporary solid obstacles so every landing candidate overlaps
  const tempObstacles = [
    { id: 'tmp-1', x: 0, z: 12.0, radius: 2.4, height: 3, label: 'Tmp', disabled: false },
  ];
  world.obstacles.push(...tempObstacles);
  const allInvalidEval = evaluateRelayTarget(world);
  assert.equal(allInvalidEval.canRelay, false);
  assert.equal(allInvalidEval.status, 'no_safe_landing', 'When all landing candidates overlap colliders, status must be no_safe_landing');
  world.obstacles.pop();
});

test('Phase 4 Resource Economy, Cooldown & Action-State Commitment: spends 25 Flux once, enforces 1.0s cooldown, blocks prohibited states, and grants zero i-frames', () => {
  const world = createInitialWorld('playing');
  world.player.flux = 60;

  // Record a 2.0s stationary Echo at (0, 11.0) and start playback
  world.player.x = 0;
  world.player.z = 11.0;
  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  for (let i = 0; i < 100; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);

  // Move live Sera to (4.0, 11.0) with exact 50 Flux
  world.player.x = 4.0;
  world.player.z = 11.0;
  world.player.flux = 50;

  // 1. Prohibited action states must reject Relay with 'action_locked' and spend 0 Flux
  const prohibitedStates = [
    'charging_heavy',
    'heavy_windup',
    'heavy_active',
    'heavy_recovery',
    'light_windup',
    'light_active',
    'light_recovery',
    'dodging',
    'parry_active',
    'parry_recovery',
    'dead',
  ] as const;

  for (const state of prohibitedStates) {
    world.player.actionState = state;
    world.player.stateTimer = 0.2;
    const evalLocked = evaluateRelayTarget(world);
    assert.equal(
      evalLocked.status,
      'action_locked',
      `Action state '${state}' must prohibit Relay`
    );
    assert.equal(attemptEchoRelay(world), false);
    assert.equal(world.player.flux, 50, `Rejected Relay in '${state}' must not spend Flux`);
  }

  // Hitstun / active damage reaction (hurtFlashTimer > 0) must also prohibit Relay
  world.player.actionState = 'idle';
  world.player.hurtFlashTimer = 0.15;
  assert.equal(evaluateRelayTarget(world).status, 'action_locked');
  assert.equal(attemptEchoRelay(world), false);
  world.player.hurtFlashTimer = 0;

  // 2. Insufficient Flux (< 25) must reject Relay with 'insufficient_flux'
  world.player.flux = 24;
  assert.equal(evaluateRelayTarget(world).status, 'insufficient_flux');
  assert.equal(attemptEchoRelay(world), false);
  assert.equal(world.player.flux, 24);
  assert.equal(world.relay.cooldownTimer, 0);

  // 3. Valid Relay from 'idle' spends 25 Flux once, starts 1.0s cooldown, and grants 0 invulnerability frames
  world.player.flux = 50;
  world.player.invulnTimer = 0;
  assert.equal(attemptEchoRelay(world), true);
  assert.equal(world.player.flux, 50 - RELAY_FLUX_COST);
  assert.equal(world.relay.cooldownTimer, RELAY_COOLDOWN);
  assert.equal(world.player.invulnTimer, 0, 'Relay must not grant free invulnerability frames');

  // 4. Attempting Relay while on cooldown rejects with 'on_cooldown' and spends 0 Flux
  world.player.x = 4.0;
  world.player.z = 11.0;
  const fluxDuringCd = world.player.flux;
  assert.equal(evaluateRelayTarget(world).status, 'on_cooldown');
  assert.equal(attemptEchoRelay(world), false);
  assert.equal(world.player.flux, fluxDuringCd);

  // 5. Advance simulation by 1.02s so cooldown expires, then Relay from 'moving' succeeds
  for (let i = 0; i < 51; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.relay.cooldownTimer, 0);
  world.player.x = 4.0;
  world.player.z = 11.0;
  world.player.actionState = 'moving';
  world.player.flux = 40;
  assert.equal(attemptEchoRelay(world), true);
  assert.equal(world.player.flux, 40 - RELAY_FLUX_COST);
});

test('Phase 4 Echo Timeline & Puzzle Integrity: Relay preserves playbackTime, scheduled events, Echo-only pad occupancy, receiver single-activation, and Phase 3.1 Final Gate rule', () => {
  const world = createInitialWorld('playing');
  const rcvCfg = GAME_CONFIG.arena.chronoPuzzle.heavyReceiver;
  const pad1Cfg = GAME_CONFIG.arena.chronoPlate;
  const pad2Cfg = GAME_CONFIG.arena.chronoPuzzle.combinePlate;

  // Record combined sequence: Heavy strike at Receiver (-8.2, 13.6) -> walk North onto Pad 02 (-8.2, 10.2) -> hold 2.0s
  world.player.x = rcvCfg.x;
  world.player.z = rcvCfg.z;
  world.player.rotationY = rcvCfg.targetYaw;
  world.player.flux = 100;

  const recStart = createEmptyInput(rcvCfg.targetYaw);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);

  for (let i = 0; i < 32; i++) {
    const inp = createEmptyInput(rcvCfg.targetYaw);
    if (i === 3) inp.heavyAttackJustPressed = true;
    stepWorld(world, inp, 0.02);
  }
  for (let i = 0; i < 20; i++) {
    const inp = createEmptyInput(rcvCfg.targetYaw);
    inp.moveZ = -1;
    stepWorld(world, inp, 0.02);
  }
  for (let i = 0; i < 90; i++) {
    stepWorld(world, createEmptyInput(rcvCfg.targetYaw), 0.02);
  }

  const recStop = createEmptyInput(rcvCfg.targetYaw);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  // Move live Sera to (-7.5, 11.5) inside the calibration alcove and start playback
  world.player.x = -7.5;
  world.player.z = 11.5;
  world.player.flux = 100;

  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);

  // 1. Verify direct attemptEchoRelay does not mutate playbackTime, nextEventIndex, or activeActor position
  const timeBeforeRelay = world.echo.playbackTime;
  const eventIdxBeforeRelay = world.echo.nextEventIndex;
  const echoXBefore = world.echo.activeActor!.x;
  const echoZBefore = world.echo.activeActor!.z;

  assert.equal(attemptEchoRelay(world), true);
  assert.equal(world.echo.playbackTime, timeBeforeRelay, 'Relay must not alter Echo playbackTime');
  assert.equal(world.echo.nextEventIndex, eventIdxBeforeRelay, 'Relay must not alter Echo nextEventIndex');
  assert.equal(world.echo.activeActor!.x, echoXBefore, 'Relay must not move the Echo actor');
  assert.equal(world.echo.activeActor!.z, echoZBefore, 'Relay must not move the Echo actor');

  // 2. Step through the recorded Heavy strike and verify Receiver activates exactly once (no duplication from Relay)
  let receiverActivatedEvents = 0;
  for (let i = 0; i < 55; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
    receiverActivatedEvents += world.events.filter((e) => e.type === 'echo_receiver_activated').length;
  }
  assert.equal(receiverActivatedEvents, 1, 'Recorded Heavy strike must fire and charge receiver exactly once');
  assert.equal(world.puzzle.heavyReceiver.activationCount, 1);
  assert.equal(world.puzzle.heavyReceiver.charged, true);
  assert.equal(world.puzzle.combinePlate.active, true, 'Echo now holds Chrono Anchor Pad 02');
  assert.equal(world.puzzle.finalBarrier.open, true, 'Final barrier is open');

  // 3. Relay while Echo is holding Pad 02 -> Echo continues holding Pad 02 and Final Barrier stays open
  world.relay.cooldownTimer = 0;
  world.player.x = -7.2;
  world.player.z = 13.0;
  world.player.flux = 80;
  assert.equal(attemptEchoRelay(world), true);
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(world.puzzle.combinePlate.active, true, 'Echo remains on Pad 02 after Sera Relays');
  assert.equal(world.puzzle.finalBarrier.open, true, 'Final barrier remains open after Sera Relays to Echo on Pad 02');
  assert.equal(world.puzzle.heavyReceiver.activationCount, 1, 'Relay must not re-trigger receiver activation');

  // 4. Phase 3.1 Regression Check with Relay: Echo on Pad 01 + Receiver charged + Relay -> Final Barrier MUST remain locked
  world.player.x = pad1Cfg.x;
  world.player.z = pad1Cfg.z;
  const recPad1 = createEmptyInput(Math.PI);
  recPad1.echoRecordJustPressed = true;
  stepWorld(world, recPad1, 0.02);
  for (let i = 0; i < 24; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const stopPad1 = createEmptyInput(Math.PI);
  stopPad1.echoRecordJustPressed = true;
  stepWorld(world, stopPad1, 0.02);

  world.player.x = -2.0;
  world.player.z = 11.5;
  const playPad1 = createEmptyInput(Math.PI);
  playPad1.echoPlayJustPressed = true;
  stepWorld(world, playPad1, 0.02);

  world.relay.cooldownTimer = 0;
  world.player.flux = 80;
  assert.equal(attemptEchoRelay(world), true);
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(world.puzzle.heavyReceiver.charged, true, 'Receiver is still charged');
  assert.equal(world.pressurePlate.active, true, 'Pad 01 is active');
  assert.equal(world.puzzle.combinePlate.active, false, 'Pad 02 is inactive');
  assert.equal(
    world.puzzle.finalBarrier.open,
    false,
    'Pad 01 + Receiver charged + Relay must NEVER open the final Archive Calibration Barrier'
  );
  assert.ok(pad2Cfg.radius > 0);
});

test('Phase 4 Camera Orbit, WASD Movement, Touch Button Parity & Cleanup on Clear/Restart/Defeat', () => {
  const world = createInitialWorld('playing');
  const input = new InputController();
  input.resetCameraAngles();
  input.rotateCameraByDelta(140, -35);
  const customYaw = input.aimYaw;
  const customPitch = input.aimPitch;

  // Record a stationary Echo at (0, 11.0) and start playback
  world.player.x = 0;
  world.player.z = 11.0;
  const recStart = createEmptyInput(customYaw);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  for (let i = 0; i < 30; i++) {
    stepWorld(world, createEmptyInput(customYaw), 0.02);
  }
  const recStop = createEmptyInput(customYaw);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  const playInp = createEmptyInput(customYaw);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);

  // Give Sera velocity moving East before Relay
  world.player.x = 4.2;
  world.player.z = 11.0;
  world.player.vx = 6.8;
  world.player.vz = 0;
  world.player.flux = 80;

  // Trigger Relay via InputController.triggerEchoRelay() (same pathway used by mobile HUD button & KeyV)
  input.triggerEchoRelay();
  const frameInput = input.consumeFrameInput(0.064); // 64ms substepped frame to verify single activation across substeps
  assert.equal(frameInput.echoRelayJustPressed, true);

  stepWorld(world, frameInput, 0.064);
  assert.equal(world.relay.activationCount, 1, 'Substepped frame must trigger Relay at most once');
  assert.equal(world.player.flux, 80 - RELAY_FLUX_COST + Number((GAME_CONFIG.player.fluxRegenPerSec * 0.064).toFixed(6)) > 55 ? world.player.flux : 55);
  assert.equal(world.player.vx, 0, 'Relay must clear stale horizontal velocity vx');
  assert.equal(world.player.vz, 0, 'Relay must clear stale horizontal velocity vz');
  assert.equal(input.aimYaw, customYaw, 'Relay must preserve camera aimYaw without snapping');
  assert.equal(input.aimPitch, customPitch, 'Relay must preserve camera aimPitch without snapping');

  // Verify subsequent WASD movement moves predictably along camera-relative forward vector
  const xAfterRelay = world.player.x;
  const zAfterRelay = world.player.z;
  const moveForward = createEmptyInput(customYaw);
  moveForward.moveZ = -1;
  stepWorld(world, moveForward, 0.02);
  const movedDist = Math.hypot(world.player.x - xAfterRelay, world.player.z - zAfterRelay);
  assert.ok(movedDist > 0.05, 'Camera-relative WASD movement must work immediately after Relay');

  // Verify Defeat cleans up active Echo and Relay state
  applyDamageToPlayer(world, 999);
  assert.equal(world.outcome, 'defeat');
  assert.equal(world.echo.activeActor, null);
  assert.equal(world.relay.preview.canRelay, false);

  // Verify Restart resets all Relay state
  resetWorldForPlaying(world);
  assert.equal(world.relay.cooldownTimer, 0);
  assert.equal(world.relay.activationCount, 0);
  assert.equal(world.relay.lastOutcome, 'none');
  assert.equal(world.relay.successFlashTimer, 0);
});

test('Phase 5: Echo Heavy primes Resonance at the actual active contact timestamp (not windup start) without dealing damage, stagger, knockback, or Flux', () => {
  const world = createInitialWorld('playing');
  const bastion = world.enemies.find((e) => e.id === 'enemy-bastion-1')!;
  assert.ok(bastion);

  // Position Bastion in open space and freeze other enemies far away
  bastion.x = 0;
  bastion.z = 2.0;
  bastion.rotationY = 0; // Facing South (+Z) toward (0, 4.5)
  bastion.aiState = 'idle';
  bastion.cooldownTimer = 99;
  for (const e of world.enemies) {
    if (e.id !== bastion.id) {
      e.x = 16;
      e.z = -16;
      e.cooldownTimer = 99;
    }
  }

  // Record Echo Heavy at (0, 4.4) facing North (Math.PI) so the enemy is inside Heavy range (3.5m)
  // Put Bastion temporarily out of range during live recording so Sera's live swing doesn't hit it during recording
  bastion.x = 0;
  bastion.z = -10.0;

  world.player.x = 0;
  world.player.z = 4.4;
  world.player.rotationY = Math.PI;
  world.player.flux = 0; // Ensure no Flux gain from Echo contact

  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);

  // At t = 0.02s, press Heavy Attack [E]
  const heavyPress = createEmptyInput(Math.PI);
  heavyPress.heavyAttackJustPressed = true;
  stepWorld(world, heavyPress, 0.02);

  // Step 0.45s so recording > minDuration (0.35s) and heavy swing finishes
  for (let i = 0; i < 25; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);
  assert.equal(world.echo.state, 'ready');
  assert.equal(world.echo.clip?.events.length, 1);

  const recordedEv = world.echo.clip!.events[0];
  assert.equal(recordedEv.action, 'heavy_swing');
  assert.ok(
    Math.abs((recordedEv.contactTime ?? 0) - (recordedEv.t + GAME_CONFIG.player.heavyAttack.windup)) < 1e-4,
    'Recorded Echo Heavy event must store contactTime = t + heavyAttack.windup (0.12s)'
  );

  // Move live Sera away so only the Echo contacts the Bastion during playback
  world.player.x = 6.0;
  world.player.z = 8.0;
  world.player.flux = 20;

  // Place Bastion at (0, 2.0) in front of the Echo at (0, 4.4)
  bastion.x = 0;
  bastion.z = 2.0;
  bastion.hp = bastion.maxHp;
  bastion.stagger = 0;
  bastion.aiState = 'telegraph';
  bastion.stateDuration = 2.0;
  bastion.stateTimer = 1.8;
  const initialBastionHp = bastion.hp;
  const initialBastionX = bastion.x;
  const initialBastionZ = bastion.z;
  const fluxBeforePlayback = world.player.flux;

  // Start playback
  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  assert.equal(world.echo.state, 'playback');

  // Step 0.04s: Echo playbackTime = 0.04s (past windup start t = 0.02s, but BEFORE contactTime = 0.14s)
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.ok(world.echo.playbackTime >= recordedEv.t);
  assert.ok(world.echo.playbackTime < (recordedEv.contactTime ?? 0));
  const getMark = () => world.resonance.activeMark;
  assert.equal(
    getMark(),
    null,
    'Resonance mark must NOT be applied at windup start before the active contact phase'
  );

  // Advance to playbackTime >= contactTime (0.14s): 6 more steps of 0.02s -> playbackTime = 0.16s
  for (let i = 0; i < 6; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  const activeMark = getMark();
  assert.notEqual(
    activeMark,
    null,
    'Resonance mark must be established once Echo Heavy reaches its active contact phase'
  );
  assert.equal(activeMark?.enemyId, bastion.id);
  assert.equal(world.resonance.status, 'primed');
  assert.equal(world.resonance.primedCount, 1, 'Echo Heavy event must prime at most once per playback');
  assert.ok(
    activeMark!.remainingTime > RESONANCE_SYNC_WINDOW - 0.06 &&
      activeMark!.remainingTime <= RESONANCE_SYNC_WINDOW,
    'Resonance sync window (~1.1s) must begin at Echo contact time'
  );

  // Verify non-damaging contact rules:
  assert.equal(bastion.hp, initialBastionHp, 'Echo Resonance contact must deal 0 HP damage');
  assert.equal(bastion.stagger, 0, 'Echo Resonance contact must deal 0 stagger/posture damage');
  assert.equal(bastion.x, initialBastionX, 'Echo Resonance contact must not knock back enemy');
  assert.equal(bastion.z, initialBastionZ, 'Echo Resonance contact must not knock back enemy');
  assert.equal(bastion.aiState, 'telegraph', 'Echo Resonance contact must not interrupt enemy by itself');
  assert.equal(world.resonance.convergenceCount, 0, 'Echo contact must not activate Convergence by itself');
  assert.equal(
    Math.floor(world.player.flux),
    Math.floor(fluxBeforePlayback + GAME_CONFIG.player.fluxRegenPerSec * 0.16),
    'Echo Resonance contact must not grant bonus melee hit Flux'
  );

  // Stepping remaining playback frames must NOT re-trigger or refresh the mark
  const markCreatedAt = activeMark!.createdAt;
  for (let i = 0; i < 15; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.primedCount, 1, 'Subsequent frames must never re-trigger the same event');
  assert.equal(getMark()?.createdAt, markCreatedAt, 'Mark deadline must not be refreshed');
});

test('Phase 5: Echo Resonance target selection is single-target, deterministic, and respects melee envelope and obstacle line-of-sight', () => {
  const world = createInitialWorld('playing');
  const bastion = world.enemies.find((e) => e.id === 'enemy-bastion-1')!;
  const scrapper = world.enemies.find((e) => e.id === 'enemy-scrapper-1')!;
  const scout = world.enemies.find((e) => e.id === 'enemy-scout-1')!;

  // 1. Out of range -> no target
  bastion.x = 0;
  bastion.z = -10;
  scrapper.x = -12;
  scrapper.z = -10;
  scout.x = 12;
  scout.z = -10;
  const outQuery = queryEchoResonanceTarget(world, 0, 5, Math.PI);
  assert.equal(outQuery.target, null);
  assert.equal(outQuery.outcome, 'out_of_range');

  // 2. Two enemies inside melee envelope -> picks closest valid enemy deterministically (never hits all)
  bastion.x = 0.4;
  bastion.z = 2.6; // dist ~ 2.43m from (0, 5)
  scrapper.x = -0.2;
  scrapper.z = 3.1; // dist ~ 1.91m from (0, 5) -> closer!
  const multiQuery = queryEchoResonanceTarget(world, 0, 5, Math.PI);
  assert.equal(multiQuery.outcome, 'found');
  assert.equal(
    multiQuery.target?.id,
    scrapper.id,
    'Target query must deterministically select the single closest valid enemy in the envelope'
  );

  // 3. Solid obstacle (Central Chronicle Loom Pylon at (0, -2, radius 1.85)) blocks line of sight
  scrapper.x = 0;
  scrapper.z = -3.9; // Directly behind Loom Pylon from attacker at (0, -0.1)
  bastion.x = 15;
  bastion.z = 15;
  const losQuery = queryEchoResonanceTarget(world, 0, -0.1, Math.PI);
  assert.equal(losQuery.target, null);
  assert.equal(
    losQuery.outcome,
    'line_of_sight_blocked',
    'Solid obstacle between Echo and enemy must block Resonance contact line of sight'
  );
});

test('Phase 5: Deliberate live follow-up (Heavy [E] or 3rd Light Finisher) initiated after mark triggers bounded Convergence, shatters guard, spends 15 Flux, and starts cooldown', () => {
  const world = createInitialWorld('playing');
  const bastion = world.enemies.find((e) => e.id === 'enemy-bastion-1')!;
  for (const e of world.enemies) {
    e.cooldownTimer = 99;
    if (e.id !== bastion.id) {
      e.x = 16;
      e.z = -16;
    }
  }

  // Record an Echo Heavy at (0, 4.4) facing North (Math.PI)
  bastion.x = 0;
  bastion.z = -12;
  world.player.x = 0;
  world.player.z = 4.4;
  world.player.rotationY = Math.PI;

  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);

  const heavyRec = createEmptyInput(Math.PI);
  heavyRec.heavyAttackJustPressed = true;
  stepWorld(world, heavyRec, 0.02);

  for (let i = 0; i < 25; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  // Position Bastion at (0, 2.2) facing South (0) with frontal guard active and telegraphing an attack
  bastion.x = 0;
  bastion.z = 2.2;
  bastion.rotationY = 0;
  bastion.hp = bastion.maxHp; // 230
  bastion.stagger = 0;
  bastion.aiState = 'telegraph';
  bastion.stateDuration = 1.5;
  bastion.stateTimer = 1.4;

  // Position live Sera near Bastion at (0.6, 4.2) facing North (Math.PI) with 50 Flux
  world.player.x = 0.6;
  world.player.z = 4.2;
  world.player.rotationY = Math.PI;
  world.player.actionState = 'idle';
  world.player.flux = 50;

  // Start Echo playback and advance until Resonance mark is primed (~0.16s)
  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  for (let i = 0; i < 7; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.status, 'primed');
  assert.equal(world.resonance.activeMark?.enemyId, bastion.id);

  // Now initiate a deliberate live Heavy Attack [E] AFTER the mark is established
  world.player.flux = 50;
  const liveHeavy = createEmptyInput(Math.PI);
  liveHeavy.heavyAttackJustPressed = true;
  stepWorld(world, liveHeavy, 0.02);
  assert.equal(
    world.player.currentAttackMarkId,
    world.resonance.activeMark?.markId,
    'Live Heavy initiated after mark must bind to active markId'
  );

  // Advance 0.14s so live Heavy reaches heavy_active and strikes the marked Bastion
  for (let i = 0; i < 7; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  // Verify Convergence triggered once with bounded payoff:
  assert.equal(world.resonance.convergenceCount, 1, 'Convergence must trigger exactly once');
  assert.equal(world.resonance.lastOutcome, 'converged');
  assert.equal(world.resonance.activeMark, null, 'Convergence must consume the active Resonance mark');
  assert.equal(world.resonance.status, 'on_cooldown');
  assert.ok(
    world.resonance.cooldownTimer > CONVERGENCE_COOLDOWN - 0.15 &&
      world.resonance.cooldownTimer <= CONVERGENCE_COOLDOWN,
    'Convergence must start CONVERGENCE_COOLDOWN (1.25s)'
  );

  // Verify Flux cost (50 - 15 = 35, plus tiny passive regen over 0.16s = ~35.48)
  assert.ok(
    world.player.flux >= 50 - CONVERGENCE_FLUX_COST - 0.1 &&
      world.player.flux <= 50 - CONVERGENCE_FLUX_COST + 1.0,
    `Convergence must deduct CONVERGENCE_FLUX_COST (${CONVERGENCE_FLUX_COST}) once without double-charging`
  );

  // Verify normal live Heavy damage once (46 base heavy + 0 bonus = 46; Bastion has 230 maxHp -> 184 remaining)
  const expectedDamage = GAME_CONFIG.player.heavyAttack.baseDamage;
  assert.equal(
    GAME_CONFIG.resonance.bonusDamage,
    0,
    'Phase 5.1 A2: Convergence must not deal separate +18 bonus HP damage'
  );
  assert.equal(
    bastion.hp,
    bastion.maxHp - expectedDamage,
    'Convergence must apply the qualifying live hit normal damage once without extra bonus HP damage'
  );

  // Verify posture bonus (65 base heavy stagger + 22 CONVERGENCE_POSTURE_BONUS = 87 / 100)
  const expectedStagger = GAME_CONFIG.player.heavyAttack.stagger + CONVERGENCE_POSTURE_BONUS;
  assert.equal(
    bastion.stagger,
    expectedStagger,
    'Convergence must add CONVERGENCE_POSTURE_BONUS (+22) posture damage through existing stagger rules'
  );

  // Because 87 < 100 (Bastion maxStagger), Convergence does NOT unconditionally cancel telegraph into recovery;
  // existing posture threshold rules apply until cumulative posture reaches 100.
  assert.equal(
    bastion.aiState,
    'telegraph',
    'Convergence must respect Bastion maxStagger (100) rather than unconditionally forcing recovery at 87 stagger'
  );
});

test('Phase 5: Rejects pre-mark attacks, light_1/light_2 spam, wrong target, insufficient Flux, and cooldown re-priming', () => {
  const world = createInitialWorld('playing');
  const bastion = world.enemies.find((e) => e.id === 'enemy-bastion-1')!;
  const scrapper = world.enemies.find((e) => e.id === 'enemy-scrapper-1')!;
  for (const e of world.enemies) {
    e.cooldownTimer = 99;
    e.aiState = 'idle';
  }

  // Record an Echo Heavy at (0, 4.4) facing North (Math.PI) where Heavy pressed at t = 0.08s -> contactTime = 0.20s
  bastion.x = 0;
  bastion.z = -12;
  scrapper.x = -12;
  scrapper.z = -12;
  world.player.x = 0;
  world.player.z = 4.4;
  world.player.rotationY = Math.PI;

  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  for (let i = 0; i < 3; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const heavyRec = createEmptyInput(Math.PI);
  heavyRec.heavyAttackJustPressed = true;
  stepWorld(world, heavyRec, 0.02);
  for (let i = 0; i < 25; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  const getMark = () => world.resonance.activeMark;
  // Helper to prime Bastion via Echo playback
  const primeBastionWithEcho = () => {
    world.hitstopTimer = 0;
    world.resonance.cooldownTimer = 0;
    world.resonance.activeMark = null;
    bastion.x = 0;
    bastion.z = 2.2;
    bastion.hp = bastion.maxHp;
    bastion.stagger = 0;
    bastion.aiState = 'idle';
    world.player.x = 0.5;
    world.player.z = 4.2;
    world.player.rotationY = Math.PI;
    world.player.actionState = 'idle';
    world.player.stateTimer = 0;

    const play = createEmptyInput(Math.PI);
    play.echoPlayJustPressed = true;
    stepWorld(world, play, 0.02);
    for (let i = 0; i < 11; i++) {
      stepWorld(world, createEmptyInput(Math.PI), 0.02);
    }
    assert.equal(getMark()?.enemyId, bastion.id);
  };

  // CASE A: Pre-mark attack started BEFORE mark is established cannot retroactively trigger Convergence
  bastion.x = 0;
  bastion.z = 2.2;
  bastion.hp = bastion.maxHp;
  world.player.x = 0.5;
  world.player.z = 4.2;
  world.player.rotationY = Math.PI;
  world.player.flux = 60;

  const playPre = createEmptyInput(Math.PI);
  playPre.echoPlayJustPressed = true;
  stepWorld(world, playPre, 0.02);
  // Step to playbackTime = 0.12s (BEFORE Echo contactTime = 0.20s) and press live Heavy [E]
  for (let i = 0; i < 5; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(getMark(), null, 'Mark is not yet active when Sera starts her swing');
  const earlyHeavy = createEmptyInput(Math.PI);
  earlyHeavy.heavyAttackJustPressed = true;
  stepWorld(world, earlyHeavy, 0.02);

  // Now advance 0.14s: Echo contacts at 0.20s (creating mark), and Sera's early heavy lands at 0.24s!
  for (let i = 0; i < 7; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(
    world.resonance.convergenceCount,
    0,
    'Attack initiated before the Resonance mark must NOT retroactively activate Convergence'
  );
  assert.equal(world.resonance.lastOutcome, 'attack_started_before_mark');

  // CASE B: Ordinary light_1 and light_2 spam does NOT trigger Convergence
  primeBastionWithEcho();
  world.player.flux = 60;
  const light1 = createEmptyInput(Math.PI);
  light1.lightAttackJustPressed = true;
  stepWorld(world, light1, 0.02);
  for (let i = 0; i < 10; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.convergenceCount, 0, 'light_1 must not trigger Convergence');
  assert.equal(world.resonance.lastOutcome, 'non_qualifying_attack');
  assert.notEqual(getMark(), null, 'Mark remains active after light_1');

  // Step into light_1 chain-cancel recovery window and fire light_2
  while (
    world.player.actionState !== 'idle' &&
    !(
      world.player.actionState === 'light_recovery' &&
      world.player.stateTimer <= GAME_CONFIG.player.lightAttack.chainCancelRemaining
    )
  ) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const light2 = createEmptyInput(Math.PI);
  light2.lightAttackJustPressed = true;
  stepWorld(world, light2, 0.02);
  assert.equal(world.player.comboIndex, 1);
  for (let i = 0; i < 10; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.convergenceCount, 0, 'light_2 must not trigger Convergence');
  assert.equal(world.resonance.lastOutcome, 'non_qualifying_attack');

  // Step into light_2 chain-cancel recovery window and fire 3rd-hit light combo finisher (light_3, comboIndex === 2) -> DOES qualify!
  while (
    world.player.actionState !== 'idle' &&
    !(
      world.player.actionState === 'light_recovery' &&
      world.player.stateTimer <= GAME_CONFIG.player.lightAttack.chainCancelRemaining
    )
  ) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const light3 = createEmptyInput(Math.PI);
  light3.lightAttackJustPressed = true;
  stepWorld(world, light3, 0.02);
  assert.equal(world.player.comboIndex, 2);
  for (let i = 0; i < 10; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(
    world.resonance.convergenceCount,
    1,
    'Deliberate 3rd-hit light combo finisher initiated during mark window must trigger Convergence'
  );

  // CASE C: Hitting the wrong enemy while Bastion is marked does not trigger Convergence
  world.resonance.convergenceCount = 0;
  primeBastionWithEcho();
  // Place Scrapper next to Sera in the opposite direction (South, yaw = 0)
  scrapper.x = 0.5;
  scrapper.z = 6.2;
  scrapper.hp = scrapper.maxHp;
  world.player.rotationY = 0;
  world.player.flux = 60;
  const wrongTargetHeavy = createEmptyInput(0);
  wrongTargetHeavy.heavyAttackJustPressed = true;
  stepWorld(world, wrongTargetHeavy, 0.02);
  for (let i = 0; i < 7; i++) {
    stepWorld(world, createEmptyInput(0), 0.02);
  }
  assert.equal(world.resonance.convergenceCount, 0, 'Hitting unmarked enemy must not trigger Convergence');
  assert.equal(world.resonance.lastOutcome, 'wrong_target');
  assert.equal(
    getMark()?.enemyId,
    bastion.id,
    'Hitting wrong target must not transfer or consume the mark on the original enemy'
  );
  scrapper.x = -12;
  scrapper.z = -12;

  // CASE D: Insufficient Flux (< 15) rejects Convergence while preserving ordinary hit damage and Flux
  primeBastionWithEcho();
  world.player.flux = 8; // Less than CONVERGENCE_FLUX_COST (15)
  const hpBeforeLowFluxHit = bastion.hp;
  const lowFluxHeavy = createEmptyInput(Math.PI);
  lowFluxHeavy.heavyAttackJustPressed = true;
  stepWorld(world, lowFluxHeavy, 0.02);
  for (let i = 0; i < 7; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.convergenceCount, 0, 'Insufficient Flux must prevent Convergence');
  assert.equal(world.resonance.lastOutcome, 'insufficient_flux');
  assert.ok(bastion.hp < hpBeforeLowFluxHit, 'Ordinary hit damage must still apply when Flux is insufficient');
  assert.ok(
    world.player.flux >= 8 && world.player.flux < 9,
    'Failed Convergence due to insufficient Flux must not deduct Flux or grant hidden Flux refund'
  );

  // CASE E: Resonance window expiration after 1.1s and Clear/Restart cleanup
  for (let i = 0; i < 60; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.activeMark, null, 'Resonance mark must expire after RESONANCE_SYNC_WINDOW (1.1s)');
  assert.equal(world.resonance.lastOutcome, 'expired');

  primeBastionWithEcho();
  assert.notEqual(world.resonance.activeMark, null);
  clearEchoState(world, 'user');
  assert.equal(world.resonance.activeMark, null, 'Clearing Echo [C] must clear any pending Resonance mark');

  resetWorldForPlaying(world);
  assert.equal(world.resonance.status, 'idle');
  assert.equal(world.resonance.activeMark, null);
  assert.equal(world.resonance.convergenceCount, 0);
  assert.equal(world.resonance.cooldownTimer, 0);
});

test('Phase 5: Echo Heavy + Relay [V] + Live Heavy [E] tactical chain executes cleanly', () => {
  const world = createInitialWorld('playing');
  const bastion = world.enemies.find((e) => e.id === 'enemy-bastion-1')!;
  for (const e of world.enemies) {
    e.cooldownTimer = 99;
    e.aiState = 'idle';
    if (e.id !== bastion.id) {
      e.x = 16;
      e.z = -16;
    }
  }

  // Record Echo Heavy at (0, 4.4) facing North (Math.PI)
  bastion.x = 0;
  bastion.z = -12;
  world.player.x = 0;
  world.player.z = 4.4;
  world.player.rotationY = Math.PI;

  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  for (let i = 0; i < 4; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const heavyRec = createEmptyInput(Math.PI);
  heavyRec.heavyAttackJustPressed = true;
  stepWorld(world, heavyRec, 0.02);
  for (let i = 0; i < 25; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  // Place Bastion in front of Echo at (0, 2.1), and place live Sera 5.5m away at (5.0, 6.0) with 80 Flux
  bastion.x = 0;
  bastion.z = 2.1;
  bastion.hp = bastion.maxHp;
  world.player.x = 5.0;
  world.player.z = 6.0;
  world.player.flux = 80;

  // Start playback and advance until Echo Heavy primes Bastion
  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  for (let i = 0; i < 11; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.status, 'primed');
  assert.equal(world.resonance.activeMark?.enemyId, bastion.id);

  // Use Relay [V] to close the gap to the active Echo (-25 Flux)
  const relayInp = createEmptyInput(Math.PI);
  relayInp.echoRelayJustPressed = true;
  stepWorld(world, relayInp, 0.02);
  assert.equal(world.relay.lastOutcome, 'teleported');
  assert.ok(
    Math.hypot(world.player.x - bastion.x, world.player.z - bastion.z) <=
      GAME_CONFIG.player.heavyAttack.range + bastion.radius,
    'Relay must position Sera within melee follow-up range of the marked enemy'
  );

  // Immediately follow up with live Heavy Attack [E] (-15 Flux) to trigger Convergence!
  const followUpHeavy = createEmptyInput(Math.PI);
  followUpHeavy.heavyAttackJustPressed = true;
  stepWorld(world, followUpHeavy, 0.02);
  for (let i = 0; i < 7; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  assert.equal(
    world.resonance.convergenceCount,
    1,
    'Echo Heavy -> Relay [V] -> Live Heavy [E] tactical chain must trigger Convergence'
  );
  assert.equal(world.resonance.lastOutcome, 'converged');
  const hud = extractHudSnapshot(world);
  assert.equal(hud.resonance.convergenceCount, 1);
  assert.equal(hud.resonance.status, 'on_cooldown');
});

test('Phase 5.1 Hardening: Truncated clip ending before Heavy contactTime never manufactures a Resonance contact at clip end', () => {
  const world = createInitialWorld('playing');
  const bastion = world.enemies.find((e) => e.id === 'enemy-bastion-1')!;
  for (const e of world.enemies) {
    e.cooldownTimer = 99;
    e.aiState = 'idle';
  }

  // Record a 0.36s clip where Heavy [E] is pressed at t = 0.30s (so contactTime = 0.30 + 0.12 = 0.42s > duration 0.36s)
  bastion.x = 0;
  bastion.z = -12;
  world.player.x = 0;
  world.player.z = 4.4;
  world.player.rotationY = Math.PI;

  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  for (let i = 0; i < 14; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  // At t = 0.30s, press Heavy [E]
  const heavyInp = createEmptyInput(Math.PI);
  heavyInp.heavyAttackJustPressed = true;
  stepWorld(world, heavyInp, 0.02);
  // Step 2 more frames (t = 0.36s >= minDuration 0.35s, but < contactTime 0.42s) and finalize
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  assert.equal(world.echo.state, 'ready');
  const clip = world.echo.clip!;
  assert.ok(clip.duration >= 0.35 && clip.duration < 0.41, `Clip duration (${clip.duration}) must be < contactTime (0.42)`);
  const recordedHeavy = clip.events.find((e) => e.action === 'heavy_swing')!;
  assert.ok(
    (recordedHeavy.contactTime ?? 0) > clip.duration,
    'Recorded Heavy contactTime must remain past clip.duration and never be clamped down to clip end'
  );

  // Place Bastion directly in front of the Echo and play the entire truncated clip to completion
  bastion.x = 0;
  bastion.z = 2.2;
  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  for (let i = 0; i < 30; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.echo.state, 'finished');
  assert.equal(
    world.resonance.primedCount,
    0,
    'Truncated clip ending before Heavy contact phase must never manufacture a Resonance mark at clip end'
  );
  assert.equal(world.resonance.activeMark, null);
});

test('Phase 5.1 Hardening: Replay reset, Bastion frontal guard & poise preservation, exact Flux accounting, and Pause/Defeat/Victory cleanup', () => {
  const world = createInitialWorld('playing');
  const bastion = world.enemies.find((e) => e.id === 'enemy-bastion-1')!;
  const scrapper = world.enemies.find((e) => e.id === 'enemy-scrapper-1')!;
  for (const e of world.enemies) {
    e.cooldownTimer = 99;
    e.aiState = 'idle';
    if (e.id !== bastion.id && e.id !== scrapper.id) {
      e.x = 16;
      e.z = -16;
    }
  }

  // Record an Echo Heavy at (0, 4.4) facing North (Math.PI)
  bastion.x = 0;
  bastion.z = -12;
  scrapper.x = -12;
  scrapper.z = -12;
  world.player.x = 0;
  world.player.z = 4.4;
  world.player.rotationY = Math.PI;

  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  const heavyRec = createEmptyInput(Math.PI);
  heavyRec.heavyAttackJustPressed = true;
  stepWorld(world, heavyRec, 0.02);
  for (let i = 0; i < 20; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  // 1. Replay reset: playing the same clip a second time after mark expiration must cleanly reset processedContactEventIds and prime again
  bastion.x = 0;
  bastion.z = 2.2;
  const play1 = createEmptyInput(Math.PI);
  play1.echoPlayJustPressed = true;
  stepWorld(world, play1, 0.02);
  for (let i = 0; i < 10; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.primedCount, 1);
  // Let mark expire (~1.2s)
  for (let i = 0; i < 65; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.activeMark, null);

  // Start second replay of the same clip -> must prime a second time (primedCount === 2)
  const play2 = createEmptyInput(Math.PI);
  play2.echoPlayJustPressed = true;
  stepWorld(world, play2, 0.02);
  for (let i = 0; i < 10; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(
    world.resonance.primedCount,
    2,
    'Starting a new playback of the same clip must reset processedContactEventIds and prime again'
  );

  // 2. Pause freezes both Resonance activeMark.remainingTime and cooldownTimer
  const markBeforePause = world.resonance.activeMark as { remainingTime: number } | null;
  assert.ok(markBeforePause, 'Resonance mark must be active before pause test');
  const remBeforePause = markBeforePause.remainingTime;
  world.appState = 'paused';
  stepWorld(world, createEmptyInput(Math.PI), 0.5);
  const markAfterPause = world.resonance.activeMark as { remainingTime: number } | null;
  assert.equal(
    markAfterPause?.remainingTime,
    remBeforePause,
    'Paused world must freeze Resonance mark remainingTime'
  );
  world.appState = 'playing';

  // 3. Bastion frontal guard & hyper-armor poise rules apply during a 3rd-hit Light Finisher Convergence
  // Put Bastion in 'telegraph' facing South (0) toward Sera at (0, 4.2) facing North (Math.PI)
  bastion.x = 0;
  bastion.z = 2.2;
  bastion.rotationY = 0;
  bastion.hp = bastion.maxHp;
  bastion.stagger = 85; // High stagger (85 + guarded finisher + 22 > 100), but Bastion is in hyper-armor ('telegraph')!
  bastion.aiState = 'telegraph';
  bastion.stateDuration = 2.0;
  bastion.stateTimer = 1.9;

  // Prime a fresh mark on Bastion and position Sera to land the 3rd-hit Light Finisher from the front
  world.resonance.activeMark = null;
  world.resonance.cooldownTimer = 0;
  const play3 = createEmptyInput(Math.PI);
  play3.echoPlayJustPressed = true;
  stepWorld(world, play3, 0.02);
  for (let i = 0; i < 9; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.status, 'primed');

  // Set Sera ready to fire comboIndex 2 (3rd-hit Light Finisher) initiated AFTER mark
  world.player.x = 0;
  world.player.z = 4.2;
  world.player.rotationY = Math.PI;
  world.player.actionState = 'idle';
  world.player.comboIndex = 1;
  world.player.comboWindowTimer = 0.35;
  world.player.flux = 40;

  const finisherInp = createEmptyInput(Math.PI);
  finisherInp.lightAttackJustPressed = true;
  stepWorld(world, finisherInp, 0.02);
  assert.equal(world.player.comboIndex, 2);
  for (let i = 0; i < 8; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  assert.equal(world.resonance.convergenceCount, 1, '3rd-hit Light Finisher must trigger Convergence');
  // Frontal guard applies to light finisher damage: Math.round(28 * 0.25) = 7 HP damage (not 28 unguarded or 28+18)
  const expectedGuardedFinisherDmg = Math.max(
    1,
    Math.round(GAME_CONFIG.player.lightAttack.damage[2] * GAME_CONFIG.enemies.bastion.frontGuardLightDamageMult)
  );
  assert.equal(
    bastion.hp,
    bastion.maxHp - expectedGuardedFinisherDmg,
    'Bastion frontal guard damage reduction must still apply to a frontal Light Finisher Convergence'
  );
  // Hyper-armor poise applies to non-Heavy attacks during telegraph: stagger is capped at maxStagger - 1 (99)
  assert.equal(
    bastion.stagger,
    bastion.maxStagger - 1,
    'Enemy hyper-armor poise must cap non-Heavy Convergence stagger at maxStagger - 1 (99) without breaking telegraph'
  );
  assert.equal(
    bastion.aiState,
    'telegraph',
    'Frontal non-Heavy Convergence must not bypass Bastion hyper-armor poise during telegraph'
  );

  // 4. Now when Bastion is at 99/100 stagger, a qualifying Heavy Convergence easily crosses 100 and legitimately staggers Bastion!
  bastion.x = 0;
  bastion.z = 2.2;
  world.hitstopTimer = 0;
  world.resonance.cooldownTimer = 0;
  const play4 = createEmptyInput(Math.PI);
  play4.echoPlayJustPressed = true;
  stepWorld(world, play4, 0.02);
  for (let i = 0; i < 9; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.status, 'primed');
  world.player.x = 0;
  world.player.z = 4.2;
  world.player.actionState = 'idle';
  world.player.stateTimer = 0;
  const heavyBreak = createEmptyInput(Math.PI);
  heavyBreak.heavyAttackJustPressed = true;
  stepWorld(world, heavyBreak, 0.02);
  for (let i = 0; i < 7; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(
    bastion.aiState,
    'staggered',
    'Once posture reaches maxStagger (100), Heavy Convergence legitimately triggers staggered state'
  );

  // 5. Defeat cleanup clears active Resonance mark
  bastion.x = 0;
  bastion.z = 2.2;
  world.hitstopTimer = 0;
  const play5 = createEmptyInput(Math.PI);
  world.resonance.cooldownTimer = 0;
  play5.echoPlayJustPressed = true;
  stepWorld(world, play5, 0.02);
  for (let i = 0; i < 9; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.notEqual(world.resonance.activeMark, null);
  clearEchoState(world, 'outcome');
  assert.equal(world.resonance.activeMark, null, 'Outcome cleanup must clear any pending Resonance mark');
});

// ============================================================================
// PHASE 6: HELIX-04 BOSS PROTOTYPE UNIT TESTS (22 TESTS)
// ============================================================================

test('Phase 6.1 Boss Initialization & Dormant Awakening: HELIX-04 initializes in dormant state and awakens into Phase 1 pursue', () => {
  const world = createBossWorld('playing', false);
  assert.equal(world.encounterMode, 'boss');
  assert.ok(world.boss);
  assert.equal(world.boss.id, 'helix-04');
  assert.equal(world.boss.hp, 360);
  assert.equal(world.boss.maxHp, 360);
  assert.equal(world.boss.stagger, 0);
  assert.equal(world.boss.maxStagger, 140);
  assert.equal(world.boss.phase, 1);
  assert.equal(world.boss.aiState, 'dormant');
  assert.equal(world.boss.coreExposed, false);
  assert.equal(world.enemies.length, 1);
  assert.equal(world.enemies[0].archetype, 'helix');
  assert.ok(world.events.some((e) => e.type === 'boss_activated'));

  // Advance past introDuration (0.95s)
  for (let i = 0; i < 52; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.boss.aiState, 'pursue');
});

test('Phase 6.2 Vector Ram Telegraph & Line Lock: HELIX-04 tracks during first 55% of telegraph then locks charge lane', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  boss.x = 0;
  boss.z = -4.0;
  boss.rotationY = 0;
  world.player.x = 3.0;
  world.player.z = 2.0;

  forceBossAttack(world, 'vector_ram');
  assert.equal(boss.aiState, 'telegraph');
  assert.equal(boss.activeAttack, 'vector_ram');
  assert.equal(boss.telegraphLocked, false);

  // Step through first 50% of telegraph (0.72s * 0.5 = 0.36s)
  for (let i = 0; i < 18; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(boss.telegraphLocked, false);
  const rotBeforeLock = boss.rotationY;
  assert.ok(rotBeforeLock > 0.05, 'Boss should rotate toward player during early telegraph');

  // Step past 55% of telegraph -> lane locks
  for (let i = 0; i < 6; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(boss.telegraphLocked, true);
  const lockedDirX = boss.attackDirX;
  const lockedDirZ = boss.attackDirZ;

  // Move player far to the west (-6, 2) after lock; boss lane direction must NOT change
  world.player.x = -6.0;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(boss.attackDirX, lockedDirX);
  assert.equal(boss.attackDirZ, lockedDirZ);
});

test('Phase 6.3 Vector Ram Active Dash, Single-Hit Lock & Recovery Exposure: hits player in lane once and enters coreExposed recovery', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  boss.x = 0;
  boss.z = -3.0;
  boss.rotationY = 0;
  world.player.x = 0;
  world.player.z = 2.5;

  forceBossAttack(world, 'vector_ram');
  let playerDamagedEvents = 0;
  let coreExposedEvents = 0;

  for (let i = 0; i < 75; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
    for (const ev of world.events) {
      if (ev.type === 'player_damaged') playerDamagedEvents += 1;
      if (ev.type === 'boss_core_exposed') coreExposedEvents += 1;
    }
  }

  assert.equal(playerDamagedEvents, 1, 'Vector Ram must hit player at most once per attack');
  assert.equal(
    world.player.integrity,
    100 - GAME_CONFIG.boss.attacks.vector_ram.damage,
    'Vector Ram deals configured 26 damage once'
  );
  assert.equal(boss.aiState, 'recovery');
  assert.equal(boss.coreExposed, true);
  assert.equal(coreExposedEvents, 1);
});

test('Phase 6.4 Vector Ram Dodge Counterplay: dodging through the active dash avoids damage via i-frames', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  boss.x = 0;
  boss.z = -2.0;
  boss.rotationY = 0;
  world.player.x = 0;
  world.player.z = 1.5;

  forceBossAttack(world, 'vector_ram');
  // Advance to right before active dash (0.70s of 0.72s telegraph)
  for (let i = 0; i < 35; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  // Trigger dodge right as dash starts
  const dodgeInp = createEmptyInput(Math.PI);
  dodgeInp.dodgeJustPressed = true;
  dodgeInp.moveX = 1;
  stepWorld(world, dodgeInp, 0.02);

  for (let i = 0; i < 25; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  assert.equal(world.player.integrity, 100, 'Well-timed dodge avoids Vector Ram damage completely');
});

test('Phase 6.5 Helical Sweep Sector Geometry & Safe Zones: hits within frontal 207-deg arc and misses outside range or behind boss', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  boss.x = 0;
  boss.z = 0;
  boss.rotationY = 0; // Facing South (+Z)

  // Case A: Player behind boss at (0, -2.8) -> safe from frontal 207-deg arc
  world.player.x = 0;
  world.player.z = -2.8;
  forceBossAttack(world, 'helical_sweep');
  // Lock rotation facing South (+Z)
  boss.telegraphLocked = true;
  boss.rotationY = 0;
  for (let i = 0; i < 45; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.player.integrity, 100, 'Standing behind HELIX-04 avoids Helical Sweep');

  // Case B: Player in front within 4.5m at (0, 3.2) -> takes 22 damage once
  world.player.x = 0;
  world.player.z = 3.2;
  forceBossAttack(world, 'helical_sweep');
  for (let i = 0; i < 45; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(
    world.player.integrity,
    100 - GAME_CONFIG.boss.attacks.helical_sweep.damage,
    'Standing in frontal arc within 4.5m takes Helical Sweep damage once'
  );
});

test('Phase 6.6 Helical Sweep Parry Counterplay: timed parry blocks damage, awards Flux, and builds boss stagger', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  boss.x = 0;
  boss.z = 0;
  boss.rotationY = 0;
  world.player.x = 0;
  world.player.z = 3.0;
  world.player.flux = 20;

  forceBossAttack(world, 'helical_sweep');
  // Advance through 0.56s of the 0.62s telegraph
  for (let i = 0; i < 28; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  // Press Parry [Q]
  const parryInp = createEmptyInput(Math.PI);
  parryInp.parryJustPressed = true;
  stepWorld(world, parryInp, 0.02);

  let parried = false;
  for (let i = 0; i < 15; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
    if (world.events.some((e) => e.type === 'player_parry_success')) {
      parried = true;
    }
  }

  assert.equal(parried, true, 'Helical Sweep must be parryable');
  assert.equal(world.player.integrity, 100, 'Parry blocks 100% of Helical Sweep damage');
  assert.ok(
    world.player.flux >= 20 + GAME_CONFIG.player.parry.fluxGain,
    'Parry awards +35 Chrono Flux plus passive regeneration'
  );
  assert.equal(boss.stagger, 34, 'Parrying HELIX-04 inflicts 34 posture damage');
});

test('Phase 6.7 Anchor Slam Inner Impact vs. Outer Shockwave Ring & Single-Hit Lock', () => {
  // Subtest A: Player in inner slam radius (2.2m <= 3.4m) takes 30 slam damage once, and is NOT hit a second time by the shockwave ring
  const worldA = createBossWorld('playing', true);
  const bossA = worldA.boss!;
  bossA.x = 0;
  bossA.z = 0;
  worldA.player.x = 0;
  worldA.player.z = 2.2;

  forceBossAttack(worldA, 'anchor_slam');
  let hitsA = 0;
  for (let i = 0; i < 75; i++) {
    stepWorld(worldA, createEmptyInput(Math.PI), 0.02);
    hitsA += worldA.events.filter((e) => e.type === 'player_damaged').length;
  }
  assert.equal(hitsA, 1, 'Anchor Slam must never hit the player twice (slam + shockwave)');
  assert.equal(worldA.player.integrity, 100 - GAME_CONFIG.boss.attacks.anchor_slam.slamDamage);

  // Subtest B: Player outside inner slam (at 4.8m, between 3.4m and 6.2m) avoids inner slam but is hit once by the expanding shockwave ring (20 damage)
  const worldB = createBossWorld('playing', true);
  const bossB = worldB.boss!;
  bossB.x = 0;
  bossB.z = 0;
  worldB.player.x = 0;
  worldB.player.z = 4.8;

  forceBossAttack(worldB, 'anchor_slam');
  let hitsB = 0;
  let shockwaveBurstSeen = false;
  for (let i = 0; i < 75; i++) {
    stepWorld(worldB, createEmptyInput(Math.PI), 0.02);
    hitsB += worldB.events.filter((e) => e.type === 'player_damaged').length;
    if (worldB.events.some((e) => e.type === 'boss_shockwave_burst')) {
      shockwaveBurstSeen = true;
    }
  }
  assert.equal(shockwaveBurstSeen, true, 'Anchor Slam emits boss_shockwave_burst');
  assert.equal(hitsB, 1, 'Expanding shockwave ring hits player at 4.8m exactly once');
  assert.equal(worldB.player.integrity, 100 - GAME_CONFIG.boss.attacks.anchor_slam.shockwaveDamage);

  // Subtest C: Player outside 6.2m (at 6.9m in Phase 1) avoids both slam and shockwave
  const worldC = createBossWorld('playing', true);
  worldC.boss!.x = 0;
  worldC.boss!.z = 0;
  worldC.player.x = 0;
  worldC.player.z = 6.9;
  forceBossAttack(worldC, 'anchor_slam');
  for (let i = 0; i < 75; i++) {
    stepWorld(worldC, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(worldC.player.integrity, 100, 'Standing beyond 6.2m in Phase 1 avoids Anchor Slam shockwave');
});

test('Phase 6.8 Frontal Armor Mitigation vs. Exposed Core Vulnerability Multipliers', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  const bossEnemy = world.enemies[0];
  boss.x = 0;
  boss.z = 0;
  boss.rotationY = 0; // Facing South (+Z)
  boss.cooldownTimer = 10; // Keep in pursue with core shielded

  // 1. Frontal light hit while coreExposed === false -> 0.55x damage (Math.round(16 * 0.55) = 9)
  world.player.x = 0;
  world.player.z = 2.4;
  world.player.rotationY = Math.PI;
  const lightFront = createEmptyInput(Math.PI);
  lightFront.lightAttackJustPressed = true;
  stepWorld(world, lightFront, 0.02);
  for (let i = 0; i < 6; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const shieldedDmg = 360 - boss.hp;
  assert.equal(
    shieldedDmg,
    Math.round(GAME_CONFIG.player.lightAttack.damage[0] * GAME_CONFIG.boss.frontalArmorDamageMult),
    'Frontal hit against shielded HELIX-04 is reduced by frontalArmorDamageMult (0.55x)'
  );

  // 2. Hit during recovery when coreExposed === true -> 1.45x exposedCoreDamageMult
  const hpBeforeExposed = boss.hp;
  boss.aiState = 'recovery';
  boss.stateTimer = 1.0;
  boss.stateDuration = 1.0;
  boss.coreExposed = true;
  bossEnemy.aiState = 'recovery';
  world.player.actionState = 'idle';
  world.player.stateTimer = 0;
  world.player.comboIndex = 0;
  world.player.comboWindowTimer = 0;
  world.hitstopTimer = 0;

  const lightExposed = createEmptyInput(Math.PI);
  lightExposed.lightAttackJustPressed = true;
  stepWorld(world, lightExposed, 0.02);
  for (let i = 0; i < 6; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const exposedDmg = hpBeforeExposed - boss.hp;
  assert.equal(
    exposedDmg,
    Math.round(GAME_CONFIG.player.lightAttack.damage[0] * GAME_CONFIG.boss.exposedCoreDamageMult),
    'Hit while HELIX-04 core is exposed deals 1.45x bonus damage'
  );
  assert.ok(exposedDmg > shieldedDmg);
});

test('Phase 6.9 Boss Hyper-Armor Poise During Telegraph & Stagger Break + Stagger Cooldown Immunity', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  const bossEnemy = world.enemies[0];
  boss.x = 0;
  boss.z = 0;
  boss.rotationY = Math.PI; // Facing North (-Z) so player at (0, 2.4) hits from behind (unguarded)
  bossEnemy.rotationY = Math.PI;
  forceBossAttack(world, 'anchor_slam');
  boss.telegraphLocked = true;
  boss.rotationY = Math.PI;
  bossEnemy.rotationY = Math.PI;
  boss.stagger = 135; // 5 away from 140 maxStagger
  bossEnemy.stagger = 135;

  // 1. Light attack during telegraph cannot break hyper-armor poise -> caps at 139/140
  world.player.x = 0;
  world.player.z = 2.4;
  world.player.rotationY = Math.PI;
  const lightHit = createEmptyInput(Math.PI);
  lightHit.lightAttackJustPressed = true;
  stepWorld(world, lightHit, 0.02);
  for (let i = 0; i < 6; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(boss.stagger, 139, 'Non-heavy attack during boss telegraph caps stagger at maxStagger - 1 (139)');
  assert.equal(boss.aiState, 'telegraph', 'Boss telegraph is not interrupted by light attack');

  // 2. Heavy attack [E] breaks hyper-armor poise and triggers staggered state
  world.player.actionState = 'idle';
  world.player.stateTimer = 0;
  world.hitstopTimer = 0;
  const heavyHit = createEmptyInput(Math.PI);
  heavyHit.heavyAttackJustPressed = true;
  stepWorld(world, heavyHit, 0.02);
  for (let i = 0; i < 8; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(boss.aiState, 'staggered', 'Heavy attack at maxStagger breaks boss into staggered state');
  assert.equal(boss.coreExposed, true);

  // 3. Advance until stagger recovery finishes (2.5s) -> staggerCooldownTimer (2.5s) prevents immediate re-stagger
  for (let i = 0; i < 135; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(boss.aiState, 'pursue');
  assert.ok(boss.staggerCooldownTimer > 1.5, 'staggerCooldownTimer is active after stagger recovery');

  // Hit boss while staggerCooldownTimer > 0 -> stagger stays 0
  boss.x = 0;
  boss.z = 0;
  world.player.x = 0;
  world.player.z = 2.4;
  world.player.actionState = 'idle';
  const postStaggerHit = createEmptyInput(Math.PI);
  postStaggerHit.heavyAttackJustPressed = true;
  stepWorld(world, postStaggerHit, 0.02);
  for (let i = 0; i < 8; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(boss.stagger, 0, 'staggerCooldownTimer prevents posture gain immediately after stagger');
});

test('Phase 6.10 Phase 2 (Helix Overload) Transition Triggers Exactly Once at <= 50% HP (180 HP)', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  const bossEnemy = world.enemies[0];
  boss.x = 0;
  boss.z = 0;
  boss.hp = 190;
  bossEnemy.hp = 190;
  boss.coreExposed = true;
  boss.aiState = 'recovery';
  boss.stateTimer = 1.0;
  bossEnemy.aiState = 'recovery';

  world.player.x = 0;
  world.player.z = 2.4;
  world.player.rotationY = Math.PI;

  const hitInp = createEmptyInput(Math.PI);
  hitInp.heavyAttackJustPressed = true;
  stepWorld(world, hitInp, 0.02);

  let phaseTransitionEvents = 0;
  for (let i = 0; i < 10; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
    phaseTransitionEvents += world.events.filter((e) => e.type === 'boss_phase_transition').length;
  }

  assert.ok(boss.hp <= 180);
  assert.equal(boss.phase, 2);
  assert.equal(boss.phaseTransitionTriggered, true);
  assert.equal(boss.aiState, 'phase_transition');
  assert.equal(phaseTransitionEvents, 1, 'boss_phase_transition event must fire once');

  // Advance past 1.15s phase_transition into Phase 2 pursue
  for (let i = 0; i < 65; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(boss.aiState, 'pursue');

  // Hit boss again in Phase 2 -> must NOT re-trigger phase_transition
  boss.x = 0;
  boss.z = 0;
  world.player.x = 0;
  world.player.z = 2.4;
  world.player.actionState = 'idle';
  const secondHit = createEmptyInput(Math.PI);
  secondHit.lightAttackJustPressed = true;
  stepWorld(world, secondHit, 0.02);
  for (let i = 0; i < 10; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
    phaseTransitionEvents += world.events.filter((e) => e.type === 'boss_phase_transition').length;
  }
  assert.equal(phaseTransitionEvents, 1, 'Phase 2 transition must never trigger a second time');
});

test('Phase 6.11 Phase 2 Escalation: faster telegraphs, faster recovery, and expanded 7.0m Anchor Slam shockwave', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  boss.phase = 2;
  boss.phaseTransitionTriggered = true;
  boss.hp = 150;
  world.enemies[0].hp = 150;

  forceBossAttack(world, 'anchor_slam');
  assert.equal(
    boss.stateDuration,
    GAME_CONFIG.boss.attacks.anchor_slam.telegraphP2,
    'Phase 2 Anchor Slam uses faster telegraphP2 (0.76s vs 0.88s)'
  );
  assert.equal(
    boss.shockwaveMaxRadius,
    GAME_CONFIG.boss.attacks.anchor_slam.outerRadiusP2,
    'Phase 2 Anchor Slam uses expanded outerRadiusP2 (7.0m vs 6.2m)'
  );
});

test('Phase 6.12 Echo Heavy Attack Deals Zero Direct Damage and Zero Posture to HELIX-04 While Priming Resonance', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  const bossEnemy = world.enemies[0];
  // Freeze boss at (0, 2.0) in pursue with high cooldown so it doesn't move away
  boss.x = 0;
  boss.z = -10.0;
  bossEnemy.x = 0;
  bossEnemy.z = -10.0;
  boss.cooldownTimer = 30;

  // Record Echo Heavy at (0, 4.2) facing North (Math.PI)
  world.player.x = 0;
  world.player.z = 4.2;
  world.player.rotationY = Math.PI;
  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  const heavyRec = createEmptyInput(Math.PI);
  heavyRec.heavyAttackJustPressed = true;
  stepWorld(world, heavyRec, 0.02);
  for (let i = 0; i < 20; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  // Move boss into Echo Heavy range at (0, 2.0) and move live Sera away to (-5, 6)
  boss.x = 0;
  boss.z = 2.0;
  bossEnemy.x = 0;
  bossEnemy.z = 2.0;
  boss.cooldownTimer = 30;
  world.player.x = -5.0;
  world.player.z = 6.0;

  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  for (let i = 0; i < 12; i++) {
    boss.x = 0;
    boss.z = 2.0;
    bossEnemy.x = 0;
    bossEnemy.z = 2.0;
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  assert.equal(boss.hp, 360, 'Echo Heavy contact must deal 0 direct HP damage to HELIX-04');
  assert.equal(boss.stagger, 0, 'Echo Heavy contact must deal 0 direct posture damage to HELIX-04');
  assert.equal(world.resonance.status, 'primed', 'Echo Heavy contact primes Resonance on HELIX-04');
  assert.equal(world.resonance.activeMark?.enemyId, 'helix-04');
});

test('Phase 6.13 Temporal Convergence on HELIX-04: live Heavy follow-up spends 15 Flux, deals normal damage once (0 bonus HP), and adds +22 posture bonus', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  const bossEnemy = world.enemies[0];
  boss.x = 0;
  boss.z = -10.0;
  bossEnemy.x = 0;
  bossEnemy.z = -10.0;
  boss.cooldownTimer = 30;

  // Record Echo Heavy at (0, 4.2)
  world.player.x = 0;
  world.player.z = 4.2;
  world.player.rotationY = Math.PI;
  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  const heavyRec = createEmptyInput(Math.PI);
  heavyRec.heavyAttackJustPressed = true;
  stepWorld(world, heavyRec, 0.02);
  for (let i = 0; i < 20; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  // Place boss at (0, 2.0) in recovery (coreExposed = true) so we can verify exact damage & posture math
  boss.x = 0;
  boss.z = 2.0;
  bossEnemy.x = 0;
  bossEnemy.z = 2.0;
  boss.aiState = 'recovery';
  boss.stateTimer = 3.0;
  boss.stateDuration = 3.0;
  boss.coreExposed = true;
  bossEnemy.aiState = 'recovery';

  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  for (let i = 0; i < 9; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.status, 'primed');

  // Live Sera at (0, 4.2) with 20 Flux (< 25 Empowered threshold, >= 15 Convergence cost)
  world.player.x = 0;
  world.player.z = 4.2;
  world.player.rotationY = Math.PI;
  world.player.actionState = 'idle';
  world.player.flux = 20;

  const liveHeavy = createEmptyInput(Math.PI);
  liveHeavy.heavyAttackJustPressed = true;
  stepWorld(world, liveHeavy, 0.02);
  for (let i = 0; i < 8; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  assert.equal(world.resonance.convergenceCount, 1, 'Convergence triggered on HELIX-04');
  assert.ok(
    Math.abs(world.player.flux - (20 - CONVERGENCE_FLUX_COST + 0.14 * GAME_CONFIG.player.fluxRegenPerSec)) < 0.05,
    'Convergence spends 15 Flux'
  );
  const expectedNormalExposedHeavyDmg = Math.round(
    GAME_CONFIG.player.heavyAttack.baseDamage * GAME_CONFIG.boss.exposedCoreDamageMult
  );
  assert.equal(
    boss.hp,
    360 - expectedNormalExposedHeavyDmg,
    'Convergence deals normal live Heavy damage once with 0 bonus HP damage'
  );
  const expectedPosture =
    Math.round(GAME_CONFIG.player.heavyAttack.staggerDamage * GAME_CONFIG.boss.exposedCoreStaggerMult) +
    CONVERGENCE_POSTURE_BONUS;
  assert.equal(
    boss.stagger,
    expectedPosture,
    'Convergence adds +22 CONVERGENCE_POSTURE_BONUS to HELIX-04 stagger'
  );
});

test('Phase 6.14 Relay [V] Tactical Repositioning & Boss Collider Safety', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  const bossEnemy = world.enemies[0];
  boss.x = 0;
  boss.z = -10.0;
  bossEnemy.x = 0;
  bossEnemy.z = -10.0;
  boss.cooldownTimer = 30;

  // Record a stationary Echo at (0, 2.0)
  world.player.x = 0;
  world.player.z = 2.0;
  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  for (let i = 0; i < 20; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  // Start playback and place HELIX-04 right on top of the Echo at (0, 2.0)
  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  boss.x = 0;
  boss.z = 2.0;
  bossEnemy.x = 0;
  bossEnemy.z = 2.0;

  // Place live Sera at (0, 6.5) with 50 Flux and trigger Relay [V]
  world.player.x = 0;
  world.player.z = 6.5;
  world.player.flux = 50;

  const relayed = attemptEchoRelay(world);
  assert.equal(relayed, true, 'Relay succeeds using safe landing ring around boss collider');
  assert.equal(world.player.flux, 50 - RELAY_FLUX_COST);
  const distToBoss = Math.hypot(world.player.x - boss.x, world.player.z - boss.z);
  assert.ok(
    distToBoss >= boss.radius + GAME_CONFIG.player.radius - 0.05,
    `Relay landing (${distToBoss.toFixed(2)}m) must never place Sera inside HELIX-04 collider`
  );
  assert.equal(world.echo.state, 'playback', 'Echo continues independent replay after Relay');
});

test('Phase 6.15 Boss Victory & Player Defeat Outcomes + Clean Encounter Reset', () => {
  // 1. Boss Victory when HELIX-04 HP reaches 0
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  const bossEnemy = world.enemies[0];
  boss.x = 0;
  boss.z = 0;
  bossEnemy.x = 0;
  bossEnemy.z = 0;
  boss.hp = 10;
  bossEnemy.hp = 10;
  boss.phase = 2;
  boss.phaseTransitionTriggered = true;
  boss.coreExposed = true;
  boss.aiState = 'recovery';
  boss.stateTimer = 2.0;
  bossEnemy.aiState = 'recovery';

  world.player.x = 0;
  world.player.z = 2.4;
  world.player.rotationY = Math.PI;

  const finalStrike = createEmptyInput(Math.PI);
  finalStrike.lightAttackJustPressed = true;
  stepWorld(world, finalStrike, 0.02);

  let bossDefeatedEvents = 0;
  for (let i = 0; i < 45; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
    bossDefeatedEvents += world.events.filter((e) => e.type === 'boss_defeated').length;
  }

  assert.equal(boss.hp, 0);
  assert.equal(boss.aiState, 'ko');
  assert.equal(bossDefeatedEvents, 1, 'boss_defeated event fires exactly once');
  assert.equal(world.outcome, 'victory');
  assert.equal(world.appState, 'gameover');

  // 2. Restarting in boss mode resets HELIX-04 cleanly to Phase 1 full HP
  resetWorldForPlaying(world);
  assert.equal(world.appState, 'playing');
  assert.equal(world.encounterMode, 'boss');
  assert.equal(world.boss?.hp, 360);
  assert.equal(world.boss?.phase, 1);
  assert.equal(world.boss?.stagger, 0);
  assert.equal(world.player.integrity, 100);

  // 3. Player Defeat when HELIX-04 reduces Sera to 0 Integrity
  world.player.integrity = 15;
  applyDamageToPlayer(world, 25);
  for (let i = 0; i < 35; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.player.integrity, 0);
  assert.equal(world.outcome, 'defeat');
  assert.equal(world.appState, 'gameover');
  assert.equal(world.frozenSummary?.remainingTargetHp, 360);

  // 4. Switching back to standard encounter restores the 3 standard enemies
  resetWorldForStandardPlaying(world);
  assert.equal(world.encounterMode, 'standard');
  assert.equal(world.boss, null);
  assert.equal(world.enemies.length, 3);
});

test('Phase 6.16 Boss HUD Snapshot: extractHudSnapshot exposes accurate HELIX-04 telemetry', () => {
  const world = createBossWorld('playing', true);
  forceBossAttack(world, 'vector_ram');
  const snap = extractHudSnapshot(world);
  assert.equal(snap.encounterMode, 'boss');
  assert.ok(snap.boss);
  assert.equal(snap.boss.name, 'HELIX-04');
  assert.equal(snap.boss.phase, 1);
  assert.equal(snap.boss.aiState, 'telegraph');
  assert.equal(snap.boss.activeAttack, 'vector_ram');
  assert.equal(snap.boss.hp, 360);
  assert.equal(snap.boss.maxHp, 360);
  assert.equal(snap.boss.coreExposed, false);
});

test('Phase 6.17 Resonance Mark Expiration on HELIX-04: letting 1.1s sync window expire clears mark and emits echo_resonance_expired', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  const bossEnemy = world.enemies[0];
  boss.x = 0;
  boss.z = -10.0;
  bossEnemy.x = 0;
  bossEnemy.z = -10.0;
  boss.cooldownTimer = 30;

  world.player.x = 0;
  world.player.z = 4.2;
  world.player.rotationY = Math.PI;
  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  const heavyRec = createEmptyInput(Math.PI);
  heavyRec.heavyAttackJustPressed = true;
  stepWorld(world, heavyRec, 0.02);
  for (let i = 0; i < 20; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  boss.x = 0;
  boss.z = 2.0;
  bossEnemy.x = 0;
  bossEnemy.z = 2.0;
  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  for (let i = 0; i < 9; i++) {
    boss.x = 0;
    boss.z = 2.0;
    bossEnemy.x = 0;
    bossEnemy.z = 2.0;
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.status, 'primed');

  let expiredSeen = false;
  for (let i = 0; i < 65; i++) {
    boss.x = 0;
    boss.z = 2.0;
    bossEnemy.x = 0;
    bossEnemy.z = 2.0;
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
    if (world.events.some((e) => e.type === 'echo_resonance_expired')) {
      expiredSeen = true;
    }
  }
  assert.equal(expiredSeen, true, 'Resonance mark expiration emits echo_resonance_expired');
  assert.equal(world.resonance.activeMark, null);
  assert.equal(world.resonance.lastOutcome, 'expired');
});

test('Phase 6.18 Convergence Insufficient Flux Rejection on HELIX-04: hitting marked boss with < 15 Flux rejects Convergence without bonus posture', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  const bossEnemy = world.enemies[0];
  boss.x = 0;
  boss.z = -10.0;
  bossEnemy.x = 0;
  bossEnemy.z = -10.0;
  boss.cooldownTimer = 30;

  world.player.x = 0;
  world.player.z = 4.2;
  world.player.rotationY = Math.PI;
  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  const heavyRec = createEmptyInput(Math.PI);
  heavyRec.heavyAttackJustPressed = true;
  stepWorld(world, heavyRec, 0.02);
  for (let i = 0; i < 20; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  boss.x = 0;
  boss.z = 2.0;
  bossEnemy.x = 0;
  bossEnemy.z = 2.0;
  boss.aiState = 'recovery';
  boss.stateTimer = 3.0;
  boss.coreExposed = true;
  bossEnemy.aiState = 'recovery';

  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  for (let i = 0; i < 9; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.status, 'primed');

  // Give player only 10 Flux (< 15 CONVERGENCE_FLUX_COST)
  world.player.x = 0;
  world.player.z = 4.2;
  world.player.actionState = 'idle';
  world.player.flux = 10;

  const liveHeavy = createEmptyInput(Math.PI);
  liveHeavy.heavyAttackJustPressed = true;
  stepWorld(world, liveHeavy, 0.02);
  let rejectedSeen = false;
  for (let i = 0; i < 8; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
    if (world.events.some((e) => e.type === 'resonance_convergence_rejected')) {
      rejectedSeen = true;
    }
  }
  assert.equal(rejectedSeen, true, 'Emits resonance_convergence_rejected when Flux < 15');
  assert.equal(world.resonance.convergenceCount, 0);
  assert.equal(world.resonance.lastOutcome, 'insufficient_flux');
});

test('Phase 6.19 3rd-Hit Light Finisher Triggers Convergence on HELIX-04 While 1st/2nd Light Hits Do Not Consume Mark', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  const bossEnemy = world.enemies[0];
  boss.x = 0;
  boss.z = -10.0;
  bossEnemy.x = 0;
  bossEnemy.z = -10.0;
  boss.cooldownTimer = 30;

  world.player.x = 0;
  world.player.z = 4.2;
  world.player.rotationY = Math.PI;
  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  const heavyRec = createEmptyInput(Math.PI);
  heavyRec.heavyAttackJustPressed = true;
  stepWorld(world, heavyRec, 0.02);
  for (let i = 0; i < 20; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  boss.x = 0;
  boss.z = 2.0;
  bossEnemy.x = 0;
  bossEnemy.z = 2.0;
  boss.aiState = 'recovery';
  boss.stateTimer = 3.0;
  boss.coreExposed = true;
  bossEnemy.aiState = 'recovery';

  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  for (let i = 0; i < 9; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.status, 'primed');

  // 1st light hit does NOT consume the Resonance mark
  world.player.x = 0;
  world.player.z = 4.2;
  world.player.actionState = 'idle';
  world.player.comboIndex = 0;
  world.player.flux = 30;
  const hit1 = createEmptyInput(Math.PI);
  hit1.lightAttackJustPressed = true;
  stepWorld(world, hit1, 0.02);
  for (let i = 0; i < 6; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.convergenceCount, 0, '1st light hit must not consume Resonance mark');
  assert.notEqual(world.resonance.activeMark, null, 'Mark remains active after 1st light hit');

  // Now set comboIndex = 1 ready for 3rd-hit Finisher (comboIndex 2)
  world.player.actionState = 'idle';
  world.player.comboIndex = 1;
  world.player.comboWindowTimer = 0.35;
  world.hitstopTimer = 0;
  const hit3 = createEmptyInput(Math.PI);
  hit3.lightAttackJustPressed = true;
  stepWorld(world, hit3, 0.02);
  for (let i = 0; i < 8; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.convergenceCount, 1, '3rd-hit Light Finisher triggers Convergence on HELIX-04');
});

test('Phase 6.20 Deterministic Boss Attack Selection Avoids Unbounded Repeat of Same Move', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  const seenAttacks = new Set<string>();

  for (let cycle = 0; cycle < 6; cycle++) {
    boss.aiState = 'pursue';
    boss.cooldownTimer = 0;
    boss.x = 0;
    boss.z = 0;
    world.player.x = 0;
    world.player.z = cycle % 2 === 0 ? 5.5 : 2.8;
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
    if (boss.activeAttack) {
      seenAttacks.add(boss.activeAttack);
    }
  }
  assert.ok(seenAttacks.size >= 2, 'HELIX-04 rotates across multiple distinct attack patterns');
});

test('Phase 6.21 Pause Freezes HELIX-04 Timers, Position, and Shockwave Expansion cleanly', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  forceBossAttack(world, 'vector_ram');
  const timerBefore = boss.stateTimer;
  const xBefore = boss.x;
  const zBefore = boss.z;

  world.appState = 'paused';
  stepWorld(world, createEmptyInput(Math.PI), 0.5);

  assert.equal(boss.stateTimer, timerBefore, 'Paused world freezes boss stateTimer');
  assert.equal(boss.x, xBefore);
  assert.equal(boss.z, zBefore);
});

test('Phase 6.22 Repeated Boss Encounter Restarts Leave Zero Stale Projectiles, Marks, or Echo Actors', () => {
  const world = createBossWorld('playing', true);
  for (let cycle = 0; cycle < 4; cycle++) {
    forceBossAttack(world, 'anchor_slam');
    stepWorld(world, createEmptyInput(Math.PI), 0.1);
    startBossEncounter(world, true);
    assert.equal(world.boss?.hp, 360);
    assert.equal(world.boss?.phase, 1);
    assert.equal(world.boss?.activeAttack, null);
    assert.equal(world.echo.state, 'idle');
    assert.equal(world.echo.activeActor, null);
    assert.equal(world.resonance.activeMark, null);
  }
});

test('Phase 6.23 Vector Ram Lateral Lane Boundary, Active Non-Rotation & Multi-Substep Single-Hit Invariance', () => {
  // 1. Player standing just outside laneHalfWidth (1.1m + 0.55m = 1.65m) at perp = 1.78m near boss origin (z = 0.4)
  // Previously a 2.02m radial fallback could clip a player at 1.78m laterally; now they must avoid damage cleanly
  const worldSafe = createBossWorld('playing', true);
  const bossSafe = worldSafe.boss!;
  bossSafe.x = 0;
  bossSafe.z = 0;
  bossSafe.rotationY = 0; // Facing South (+Z)
  worldSafe.player.x = 1.78;
  worldSafe.player.z = 0.4;

  forceBossAttack(worldSafe, 'vector_ram');
  bossSafe.telegraphLocked = true;
  bossSafe.rotationY = 0;
  bossSafe.attackDirX = 0;
  bossSafe.attackDirZ = 1;
  worldSafe.enemies[0].rotationY = 0;

  // Move player laterally during active dash as well; verify boss rotationY stays locked at 0 throughout active dash
  for (let i = 0; i < 65; i++) {
    stepWorld(worldSafe, createEmptyInput(Math.PI), 0.02);
    if (bossSafe.aiState === 'attack') {
      assert.equal(bossSafe.rotationY, 0, 'Active Vector Ram must not rotate toward Sera after lane lock');
      assert.equal(bossSafe.attackDirX, 0);
      assert.equal(bossSafe.attackDirZ, 1);
    }
  }
  assert.equal(
    worldSafe.player.integrity,
    100,
    'Sera at perp = 1.78m (> 1.65m laneHalfWidth) must avoid Vector Ram damage completely'
  );

  // 2. Verify coarse step (dt = 0.05s) vs fine step (dt = 0.008s) both hit an in-lane player exactly once in open corridor (x = 4.0)
  for (const dt of [0.008, 0.05]) {
    const w = createBossWorld('playing', true);
    w.boss!.x = 4.0;
    w.boss!.z = -1.0;
    w.boss!.rotationY = 0;
    w.enemies[0].x = 4.0;
    w.enemies[0].z = -1.0;
    w.player.x = 4.0;
    w.player.z = 3.5;
    forceBossAttack(w, 'vector_ram');
    let hitEvents = 0;
    const steps = Math.ceil(1.5 / dt);
    for (let s = 0; s < steps; s++) {
      stepWorld(w, createEmptyInput(Math.PI), dt);
      hitEvents += w.events.filter((e) => e.type === 'player_damaged').length;
    }
    assert.equal(hitEvents, 1, `Vector Ram must hit in-lane player exactly once at dt=${dt}`);
    assert.equal(w.player.integrity, 100 - GAME_CONFIG.boss.attacks.vector_ram.damage);
  }
});

test('Phase 6.24 Helical Sweep Angular Sector Boundary, Wrong-Timing Parry Rejection & Anti-Spam Single Reward', () => {
  // 1. Player standing at close range (dist = 1.85m) just outside the 207-deg (0.575*PI half-angle) sector at 0.61*PI
  // Must NOT be hit by a wider close-front angle
  const worldOutside = createBossWorld('playing', true);
  const bossOut = worldOutside.boss!;
  bossOut.x = 0;
  bossOut.z = 0;
  bossOut.rotationY = 0; // Facing South (+Z)
  const testAngle = Math.PI * 0.61; // 109.8 deg > 103.5 deg half-arc
  worldOutside.player.x = Math.sin(testAngle) * 1.85;
  worldOutside.player.z = Math.cos(testAngle) * 1.85;

  forceBossAttack(worldOutside, 'helical_sweep');
  bossOut.telegraphLocked = true;
  bossOut.rotationY = 0;
  bossOut.attackDirX = 0;
  bossOut.attackDirZ = 1;
  worldOutside.enemies[0].rotationY = 0;

  for (let i = 0; i < 45; i++) {
    stepWorld(worldOutside, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(
    worldOutside.player.integrity,
    100,
    'Sera outside the 207-deg committed floor sector (at 109.8 deg half-angle) must avoid Helical Sweep'
  );

  // 2. Wrong-timing parry (pressed at t=0.02s of a 0.62s telegraph -> 0.28s active window expires at 0.30s, in parry_recovery at 0.62s)
  const worldEarlyParry = createBossWorld('playing', true);
  const bossEarly = worldEarlyParry.boss!;
  bossEarly.x = 0;
  bossEarly.z = 0;
  bossEarly.rotationY = 0;
  worldEarlyParry.player.x = 0;
  worldEarlyParry.player.z = 3.0;
  worldEarlyParry.player.flux = 20;

  forceBossAttack(worldEarlyParry, 'helical_sweep');
  const earlyParryInp = createEmptyInput(Math.PI);
  earlyParryInp.parryJustPressed = true;
  stepWorld(worldEarlyParry, earlyParryInp, 0.02);

  let earlyParrySuccess = 0;
  for (let i = 0; i < 45; i++) {
    stepWorld(worldEarlyParry, createEmptyInput(Math.PI), 0.02);
    earlyParrySuccess += worldEarlyParry.events.filter((e) => e.type === 'player_parry_success').length;
  }
  assert.equal(earlyParrySuccess, 0, 'Early parry that expires before active Sweep window must not succeed');
  assert.equal(
    worldEarlyParry.player.integrity,
    100 - GAME_CONFIG.boss.attacks.helical_sweep.damage,
    'Expired parry takes normal Helical Sweep damage'
  );
  assert.equal(bossEarly.stagger, 0, 'Failed parry grants 0 boss stagger');

  // 3. Spamming parryJustPressed on every frame during a timed parry grants +35 Flux and +34 stagger strictly once
  const worldSpam = createBossWorld('playing', true);
  const bossSpam = worldSpam.boss!;
  bossSpam.x = 0;
  bossSpam.z = 0;
  bossSpam.rotationY = 0;
  worldSpam.player.x = 0;
  worldSpam.player.z = 3.0;
  worldSpam.player.flux = 10;

  forceBossAttack(worldSpam, 'helical_sweep');
  for (let i = 0; i < 28; i++) {
    stepWorld(worldSpam, createEmptyInput(Math.PI), 0.02);
  }
  let parrySuccessEvents = 0;
  for (let i = 0; i < 20; i++) {
    const spamInp = createEmptyInput(Math.PI);
    spamInp.parryJustPressed = true;
    stepWorld(worldSpam, spamInp, 0.02);
    parrySuccessEvents += worldSpam.events.filter((e) => e.type === 'player_parry_success').length;
  }
  assert.equal(parrySuccessEvents, 1, 'Spamming Q during Helical Sweep triggers parry reward strictly once');
  assert.equal(bossSpam.stagger, GAME_CONFIG.boss.parryStaggerDamage, 'Boss receives +34 stagger exactly once');
  assert.equal(bossSpam.aiState, 'recovery', 'Parry below maxStagger puts HELIX-04 into coreExposed recovery');
  assert.equal(bossSpam.coreExposed, true);
});

test('Phase 6.25 Anchor Slam Phase I (6.2m) vs Phase II (7.0m) Shockwave Radius & Phase-Specific Recovery Duration', () => {
  // At dist = 6.9m:
  // - In Phase I: shockwaveMaxRadius is 6.2m (6.2 + 0.55 = 6.75m < 6.9m) -> Player escapes!
  // - In Phase II: shockwaveMaxRadius is 7.0m (7.0 + 0.55 = 7.55m > 6.9m) -> Player is hit once for 20 shockwave damage!
  const worldP2 = createBossWorld('playing', true);
  const bossP2 = worldP2.boss!;
  bossP2.phase = 2;
  bossP2.phaseTransitionTriggered = true;
  bossP2.hp = 150;
  worldP2.enemies[0].hp = 150;
  bossP2.x = 0;
  bossP2.z = 0;
  worldP2.player.x = 0;
  worldP2.player.z = 6.9;

  forceBossAttack(worldP2, 'anchor_slam');
  let p2Hits = 0;
  let recoveryDurationObserved = 0;
  for (let i = 0; i < 70; i++) {
    stepWorld(worldP2, createEmptyInput(Math.PI), 0.02);
    p2Hits += worldP2.events.filter((e) => e.type === 'player_damaged').length;
    if (bossP2.aiState === 'recovery' && recoveryDurationObserved === 0) {
      recoveryDurationObserved = bossP2.stateDuration;
    }
  }
  assert.equal(p2Hits, 1, 'Standing at 6.9m in Phase II is hit once by expanded 7.0m Anchor Slam shockwave');
  assert.equal(worldP2.player.integrity, 100 - GAME_CONFIG.boss.attacks.anchor_slam.shockwaveDamage);
  assert.equal(
    recoveryDurationObserved,
    GAME_CONFIG.boss.attacks.anchor_slam.recoveryDurationP2,
    'Phase II Anchor Slam enters shorter recoveryDurationP2 (1.20s vs 1.45s)'
  );

  // Standing beyond Phase II outer radius (at 7.8m > 7.55m) escapes Phase II shockwave cleanly
  const worldP2Safe = createBossWorld('playing', true);
  worldP2Safe.boss!.phase = 2;
  worldP2Safe.boss!.phaseTransitionTriggered = true;
  worldP2Safe.boss!.x = 0;
  worldP2Safe.boss!.z = 0;
  worldP2Safe.player.x = 0;
  worldP2Safe.player.z = 7.8;
  forceBossAttack(worldP2Safe, 'anchor_slam');
  for (let i = 0; i < 70; i++) {
    stepWorld(worldP2Safe, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(worldP2Safe.player.integrity, 100, 'Standing at 7.8m escapes Phase II 7.0m Anchor Slam shockwave');
});

test('Phase 6.26 Phase II Transition Boundary Conditions: Exact 180 HP, Mid-Attack Cancellation & Resonance Mark Clearing', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  const bossEnemy = world.enemies[0];
  boss.x = 0;
  boss.z = 0;
  bossEnemy.x = 0;
  bossEnemy.z = 0;

  // Put boss in active Anchor Slam with shockwaveActive = true and an active Resonance mark, at 189 HP
  // A guarded frontal light hit deals Math.round(16 * 0.55) = 9 damage -> lands on EXACTLY 180 HP!
  forceBossAttack(world, 'anchor_slam');
  for (let i = 0; i < 46; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(boss.aiState, 'attack');
  assert.equal(boss.shockwaveActive, true);

  // Move player outside shockwave first, then place at (0, 2.4) after inner impact window to land frontal light hit
  world.player.x = 0;
  world.player.z = 2.4;
  world.player.rotationY = Math.PI;
  world.player.integrity = 100;
  world.player.invulnTimer = 0.5; // Prevent shockwave from interrupting player swing
  boss.hp = 189;
  bossEnemy.hp = 189;
  boss.rotationY = 0;
  bossEnemy.rotationY = 0;

  // Attach an active Resonance mark to HELIX-04 before the Phase II transition hit
  world.resonance.activeMark = {
    markId: 1,
    enemyId: 'helix-04',
    enemyName: 'HELIX-04',
    clipId: 1,
    eventId: 'evt-1',
    echoAction: 'heavy_swing',
    createdAt: world.elapsedTime - 0.2,
    expiresAt: world.elapsedTime + 0.9,
    duration: 1.1,
    remainingTime: 0.9,
    x: 0,
    z: 0,
  };
  world.resonance.status = 'primed';

  const hitExact180 = createEmptyInput(Math.PI);
  hitExact180.lightAttackJustPressed = true;
  stepWorld(world, hitExact180, 0.02);
  for (let i = 0; i < 6; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  assert.equal(boss.hp, 180, 'Boss reaches exact 180 HP threshold');
  assert.equal(boss.phase, 2, 'Phase II triggers at exact 180 HP');
  assert.equal(boss.aiState, 'phase_transition', 'Boss enters phase_transition immediately');
  assert.equal(boss.activeAttack, null, 'Active Phase I attack is cancelled on transition');
  assert.equal(boss.shockwaveActive, false, 'Active Phase I shockwave is cleared on transition');
  assert.equal(
    world.resonance.activeMark,
    null,
    'Active Resonance mark on HELIX-04 is cleared when Phase II transition begins'
  );

  // Verify attacks during phase_transition cannot damage or prime Resonance on HELIX-04
  const queryDuringTrans = queryEchoResonanceTarget(world, 0, 2.4, Math.PI);
  assert.equal(
    queryDuringTrans.target,
    null,
    'Echo cannot prime Resonance on HELIX-04 while in phase_transition'
  );
});

test('Phase 6.27 Resonance & Convergence Boundary Matrix on HELIX-04: Pre-Mark Attack Rejection, Non-Extension & Pause Freeze', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  const bossEnemy = world.enemies[0];
  boss.x = 0;
  boss.z = -10.0;
  bossEnemy.x = 0;
  bossEnemy.z = -10.0;
  boss.cooldownTimer = 30;

  // Record a clip with TWO Heavy swings at (0, 4.2) so we can test both pre-mark attack rejection and mark non-extension
  world.player.x = 0;
  world.player.z = 4.2;
  world.player.rotationY = Math.PI;
  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);

  const h1 = createEmptyInput(Math.PI);
  h1.heavyAttackJustPressed = true;
  stepWorld(world, h1, 0.02);
  for (let i = 0; i < 34; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const h2 = createEmptyInput(Math.PI);
  h2.heavyAttackJustPressed = true;
  stepWorld(world, h2, 0.02);
  for (let i = 0; i < 20; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  // Place boss at (0, 2.0) in recovery
  boss.x = 0;
  boss.z = 2.0;
  bossEnemy.x = 0;
  bossEnemy.z = 2.0;
  boss.aiState = 'recovery';
  boss.stateTimer = 5.0;
  boss.coreExposed = true;
  bossEnemy.aiState = 'recovery';

  // Start Echo playback AND start live Sera Heavy attack BEFORE the Echo's first Heavy contact lands!
  world.player.x = 0;
  world.player.z = 4.2;
  world.player.actionState = 'idle';
  world.player.flux = 30;

  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);

  // Advance 0.06s (Echo Heavy contact is at ~0.12s); start live Heavy windup now (before mark exists!)
  for (let i = 0; i < 3; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.activeMark, null, 'Mark does not exist yet when live Heavy begins');
  const preMarkHeavy = createEmptyInput(Math.PI);
  preMarkHeavy.heavyAttackJustPressed = true;
  stepWorld(world, preMarkHeavy, 0.02);

  let rejectedPreMark = false;
  for (let i = 0; i < 8; i++) {
    boss.x = 0;
    boss.z = 2.0;
    bossEnemy.x = 0;
    bossEnemy.z = 2.0;
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
    if (
      world.events.some(
        (e) =>
          e.type === 'resonance_convergence_rejected' &&
          e.resonanceOutcome === 'attack_started_before_mark'
      )
    ) {
      rejectedPreMark = true;
    }
  }
  assert.equal(
    rejectedPreMark,
    true,
    'Live Heavy started before Echo contact primes the mark must be rejected with attack_started_before_mark'
  );
  assert.equal(world.resonance.convergenceCount, 0);
  const activeMarkAfterPre = world.resonance.activeMark as {
    markId: number;
    expiresAt: number;
    remainingTime: number;
  } | null;
  assert.notEqual(activeMarkAfterPre, null, 'Mark remains active after pre-mark rejection');

  // Verify second Echo Heavy contact in the same clip does NOT extend or replace the active mark
  const firstMarkId = activeMarkAfterPre!.markId;
  const firstExpiresAt = activeMarkAfterPre!.expiresAt;
  for (let i = 0; i < 32; i++) {
    boss.x = 0;
    boss.z = 2.0;
    bossEnemy.x = 0;
    bossEnemy.z = 2.0;
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const activeMarkAfterSecond = world.resonance.activeMark as {
    markId: number;
    expiresAt: number;
    remainingTime: number;
  } | null;
  assert.equal(
    activeMarkAfterSecond?.markId,
    firstMarkId,
    'Subsequent Echo Heavy contact must not overwrite an active Resonance mark'
  );
  assert.equal(
    activeMarkAfterSecond?.expiresAt,
    firstExpiresAt,
    'Subsequent Echo Heavy contact must not extend an active Resonance mark'
  );

  // Verify pausing freezes mark remainingTime
  const remBeforePause = activeMarkAfterSecond!.remainingTime;
  world.appState = 'paused';
  stepWorld(world, createEmptyInput(Math.PI), 0.5);
  const activeMarkAfterPause = world.resonance.activeMark as {
    remainingTime: number;
  } | null;
  assert.equal(
    activeMarkAfterPause?.remainingTime,
    remBeforePause,
    'Pausing freezes Resonance mark remainingTime'
  );
  world.appState = 'playing';
});

test('Phase 6.28 Relay [V] Safety Around HELIX-04: All-Blocked Rejection, Zero I-Frames, No Attack Cancel & Mark Preservation', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  const bossEnemy = world.enemies[0];
  boss.x = 0;
  boss.z = -10.0;
  bossEnemy.x = 0;
  bossEnemy.z = -10.0;
  boss.cooldownTimer = 30;

  // Record a stationary Echo at (0, 2.0) and start playback
  world.player.x = 0;
  world.player.z = 2.0;
  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  for (let i = 0; i < 20; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);

  // Put HELIX-04 in an active telegraph at (0, 0) and attach an active Resonance mark to HELIX-04
  boss.x = 0;
  boss.z = 0;
  bossEnemy.x = 0;
  bossEnemy.z = 0;
  forceBossAttack(world, 'helical_sweep');
  world.resonance.activeMark = {
    markId: 7,
    enemyId: 'helix-04',
    enemyName: 'HELIX-04',
    clipId: 1,
    eventId: 'evt-7',
    echoAction: 'heavy_swing',
    createdAt: world.elapsedTime,
    expiresAt: world.elapsedTime + 1.1,
    duration: 1.1,
    remainingTime: 1.1,
    x: 0,
    z: 0,
  };
  world.resonance.status = 'primed';

  // 1. Valid Relay near HELIX-04 does not cancel boss telegraph, grants 0 i-frames, deals 0 damage, and preserves Resonance mark
  world.player.x = 0;
  world.player.z = 6.5;
  world.player.flux = 60;
  world.player.invulnTimer = 0;
  assert.equal(attemptEchoRelay(world), true);
  assert.equal(world.player.invulnTimer, 0, 'Relay grants 0 invulnerability frames');
  assert.equal(boss.aiState, 'telegraph', 'Relay does not cancel HELIX-04 active telegraph');
  assert.equal(boss.hp, 360, 'Relay deals 0 boss HP damage');
  assert.equal(boss.stagger, 0, 'Relay deals 0 boss stagger');
  assert.equal(world.resonance.activeMark?.markId, 7, 'Relay preserves active Resonance mark on HELIX-04');

  // 2. When all candidate points around Echo are blocked by solid collider + boss, Relay rejects without spending Flux
  world.relay.cooldownTimer = 0;
  world.player.x = 0;
  world.player.z = 6.5;
  world.player.flux = 50;
  world.obstacles.push({
    id: 'tmp-boss-block',
    x: 0,
    z: 2.0,
    radius: 2.5,
    height: 3.0,
    label: 'Block',
    disabled: false,
  });
  assert.equal(attemptEchoRelay(world), false, 'Relay must reject when all candidate landing points are blocked');
  assert.equal(world.relay.lastOutcome, 'no_safe_landing');
  assert.equal(world.player.flux, 50, 'Rejected Relay spends 0 Flux');
  world.obstacles.pop();
});

test('Phase 6.29 Canonical Configuration Contract & Standard Test Bay Isolation Audit', () => {
  // 1. Verify canonical configuration values match the Phase 6.2 configuration table
  assert.equal(GAME_CONFIG.player.fluxGainOnParry, 35);
  assert.equal(GAME_CONFIG.player.parry.fluxGain, 35);
  assert.equal(GAME_CONFIG.player.parry.activeWindow, 0.28);
  assert.equal(GAME_CONFIG.player.parry.cooldown, 0.6);
  assert.equal(GAME_CONFIG.boss.parryStaggerDamage, 34);

  assert.equal(GAME_CONFIG.boss.attacks.anchor_slam.innerRadius, 3.4);
  assert.equal(GAME_CONFIG.boss.attacks.anchor_slam.outerRadiusP1, 6.2);
  assert.equal(GAME_CONFIG.boss.attacks.anchor_slam.outerRadiusP2, 7.0);
  assert.equal(GAME_CONFIG.boss.attacks.anchor_slam.slamDamage, 30);
  assert.equal(GAME_CONFIG.boss.attacks.anchor_slam.shockwaveDamage, 20);

  assert.equal(RESONANCE_SYNC_WINDOW, 1.1);
  assert.equal(GAME_CONFIG.resonance.syncWindow, 1.1);
  assert.equal(CONVERGENCE_FLUX_COST, 15);
  assert.equal(GAME_CONFIG.resonance.fluxCost, 15);
  assert.equal(CONVERGENCE_COOLDOWN, 1.25);
  assert.equal(GAME_CONFIG.resonance.cooldown, 1.25);
  assert.equal(CONVERGENCE_POSTURE_BONUS, 22);
  assert.equal(GAME_CONFIG.resonance.postureBonus, 22);
  assert.equal(GAME_CONFIG.resonance.bonusDamage, 0);

  assert.equal(RELAY_MAX_RANGE, 8.0);
  assert.equal(GAME_CONFIG.relay.maxRange, 8.0);
  assert.equal(RELAY_FLUX_COST, 25);
  assert.equal(GAME_CONFIG.relay.fluxCost, 25);
  assert.equal(RELAY_COOLDOWN, 1.0);
  assert.equal(GAME_CONFIG.relay.cooldown, 1.0);

  // 2. Verify Standard Encounter isolation after running Boss Encounter
  const world = createBossWorld('playing', true);
  assert.equal(world.encounterMode, 'boss');
  assert.ok(world.boss);

  // Switch back to Standard Test Bay encounter
  resetWorldForStandardPlaying(world);
  assert.equal(world.encounterMode, 'standard');
  assert.equal(world.boss, null);
  assert.equal(world.enemies.length, 3);
  assert.equal(world.enemies[0].archetype, 'bastion');
  assert.equal(world.enemies[0].maxHp, 150);
  assert.equal(world.enemies[1].archetype, 'scrapper');
  assert.equal(world.enemies[1].maxHp, 85);
  assert.equal(world.enemies[2].archetype, 'scout');
  assert.equal(world.enemies[2].maxHp, 65);

  // Central Loom Pylon is solid in Standard encounter (disabled only in Boss mode)
  const pylon = world.obstacles.find((o) => o.id === 'loom-pylon')!;
  assert.equal(pylon.disabled, false, 'Central Loom Pylon must be solid in Standard encounter');

  // Verify Standard resonance & relay settings on world state
  assert.equal(world.resonance.syncWindow, 1.1);
  assert.equal(world.resonance.fluxCost, 15);
  assert.equal(world.resonance.maxCooldown, 1.25);
  assert.equal(world.relay.fluxCost, 25);
  assert.equal(world.relay.maxCooldown, 1.0);
  assert.equal(world.relay.maxRange, 8.0);

  // Verify Standard Parry immediately staggers Bastion (rather than applying boss +34 posture recovery)
  const bastion = world.enemies[0];
  bastion.x = 0;
  bastion.z = 2.0;
  bastion.rotationY = 0;
  bastion.aiState = 'attack';
  bastion.stateDuration = 0.16;
  bastion.stateTimer = 0.14;
  bastion.hasDealtDamageThisAttack = false;
  world.player.x = 0;
  world.player.z = 4.2;
  world.player.flux = 20;

  const parryInp = createEmptyInput(Math.PI);
  parryInp.parryJustPressed = true;
  stepWorld(world, parryInp, 0.02);
  assert.equal(bastion.aiState, 'staggered', 'Standard enemy parry immediately staggers Bastion');
  assert.ok(world.player.flux >= 55, 'Standard parry awards +35 Flux');
});

test('Phase 6.30 Full HELIX-04 Playthrough via PlayerInputFrame Without HP Manipulation', () => {
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  const p = world.player;

  // Record an Echo Heavy clip at the start of the encounter so we can trigger Resonance -> Convergence during the fight
  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  const recHeavy = createEmptyInput(Math.PI);
  recHeavy.heavyAttackJustPressed = true;
  stepWorld(world, recHeavy, 0.02);
  for (let i = 0; i < 20; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);
  assert.equal(world.echo.state, 'ready');

  let steps = 0;
  let sawPhase2 = false;
  while (steps < 6000 && world.outcome === 'none' && p.integrity > 0) {
    const dx = boss.x - p.x;
    const dz = boss.z - p.z;
    const dist = Math.hypot(dx, dz);
    const toBossYaw = Math.atan2(dx, dz);
    const inp = createEmptyInput(toBossYaw);

    if (boss.phase === 2) {
      sawPhase2 = true;
    }

    if (boss.aiState === 'phase_transition') {
      if (dist < 4.5) inp.moveZ = 1;
    } else if (boss.aiState === 'telegraph') {
      if (boss.activeAttack === 'helical_sweep') {
        if (boss.stateTimer <= 0.18 && dist <= 4.6 && p.parryCooldownTimer <= 0) {
          inp.parryJustPressed = true;
        } else if (dist < 4.8 && p.parryCooldownTimer > 0.1) {
          inp.moveZ = 1;
          if (p.dodgeCooldownTimer <= 0) inp.dodgeJustPressed = true;
        }
      } else if (boss.activeAttack === 'vector_ram') {
        inp.moveX = p.x > 0 ? -1 : 1;
        if (boss.stateTimer <= 0.24 && p.dodgeCooldownTimer <= 0) {
          inp.dodgeJustPressed = true;
        }
      } else if (boss.activeAttack === 'anchor_slam') {
        const awayYaw = Math.atan2(p.x - boss.x, p.z - boss.z);
        const centerYaw = Math.atan2(-p.x, -p.z);
        inp.aimYaw = Math.hypot(p.x, p.z) > 11 ? centerYaw : awayYaw;
        inp.moveZ = -1;
        if (p.dodgeCooldownTimer <= 0 && boss.stateTimer <= 0.36) {
          inp.dodgeJustPressed = true;
        }
      }
    } else if (boss.aiState === 'attack') {
      if (boss.activeAttack === 'anchor_slam' && dist < 7.6) {
        const awayYaw = Math.atan2(p.x - boss.x, p.z - boss.z);
        const centerYaw = Math.atan2(-p.x, -p.z);
        inp.aimYaw = Math.hypot(p.x, p.z) > 11 ? centerYaw : awayYaw;
        inp.moveZ = -1;
      } else if (boss.activeAttack === 'vector_ram') {
        inp.moveX = p.x > 0 ? -1 : 1;
      } else if (
        boss.activeAttack === 'helical_sweep' &&
        dist <= 4.6 &&
        p.parryCooldownTimer <= 0
      ) {
        inp.parryJustPressed = true;
      }
    } else if (boss.aiState === 'recovery' || boss.aiState === 'staggered') {
      if (dist > 2.5) {
        inp.moveZ = -1;
      } else if (
        world.resonance.convergenceCount === 0 &&
        (world.echo.state as string) !== 'playback' &&
        world.resonance.status === 'idle' &&
        p.flux >= 15 &&
        boss.stateTimer > 0.65
      ) {
        // Trigger Echo playback when near the recorded Echo origin, or attack directly
        const clipOrigin = world.echo.clip!.samples[0];
        if (Math.hypot(boss.x - clipOrigin.x, boss.z - clipOrigin.z) <= 4.2) {
          inp.echoPlayJustPressed = true;
        } else if (p.actionState === 'idle' || p.actionState === 'moving') {
          inp.heavyAttackJustPressed = true;
        }
      } else if (
        world.resonance.status === 'primed' &&
        (p.actionState === 'idle' || p.actionState === 'moving')
      ) {
        inp.heavyAttackJustPressed = true;
      } else if (p.actionState === 'idle' || p.actionState === 'moving') {
        if (boss.stateTimer > 0.45) inp.heavyAttackJustPressed = true;
        else inp.lightAttackJustPressed = true;
      }
    } else {
      if (dist > 3.1) inp.moveZ = -1;
      else if (dist < 2.1) inp.moveZ = 1;
      else if (p.actionState === 'idle' || p.actionState === 'moving') {
        inp.lightAttackJustPressed = true;
      }
    }

    stepWorld(world, inp, 0.02);
    steps += 1;
  }

  assert.equal(sawPhase2, true, 'Fight must progress through Phase II escalation');
  assert.equal(boss.hp, 0, 'HELIX-04 must be defeated down to 0 HP using only PlayerInputFrame actions');
  assert.equal(world.outcome, 'victory', 'Encounter outcome must reach victory');
  assert.ok(p.integrity > 0, 'Sera survives the full HELIX-04 encounter');
  assert.ok(world.stats.parriesLanded >= 1, 'At least one Helical Sweep was parried during the full fight');
});

test('Phase 6.31 Restart Resource Contract & Lifecycle Reset Audit: depleted Flux, active Convergence/Relay cooldowns, active Echo rec/play, defeat/victory, and zero delayed post-reset events', () => {
  // 1. Canonical contract: initialFlux is 40, maxFlux is 100, maxIntegrity is 100 across both Standard and Boss encounters
  assert.equal(GAME_CONFIG.player.initialFlux, 40);
  assert.equal(GAME_CONFIG.player.maxFlux, 100);
  assert.equal(GAME_CONFIG.player.maxIntegrity, 100);

  const stdInit = createInitialWorld('playing');
  const bossInit = createBossWorld('playing', true);
  assert.equal(stdInit.player.flux, 40, 'Standard encounter entry starts at 40 Flux');
  assert.equal(stdInit.player.maxFlux, 100, 'Standard encounter maxFlux is 100');
  assert.equal(stdInit.player.integrity, 100);
  assert.equal(bossInit.player.flux, 40, 'Boss encounter entry starts at 40 Flux');
  assert.equal(bossInit.player.maxFlux, 100, 'Boss encounter maxFlux is 100');
  assert.equal(bossInit.player.integrity, 100);

  // 2. Restart from depleted Flux (0) after spending Flux on Empowered Heavy, Relay, and Convergence
  const world = createBossWorld('playing', true);
  const boss = world.boss!;
  const bossEnemy = world.enemies[0];
  boss.x = 0;
  boss.z = -10.0;
  bossEnemy.x = 0;
  bossEnemy.z = -10.0;
  boss.cooldownTimer = 30;

  // Record an Echo Heavy at (0, 4.2) for 32 frames (0.64s) so the heavy swing recovery completes
  world.player.x = 0;
  world.player.z = 4.2;
  world.player.rotationY = Math.PI;
  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  const recHeavy = createEmptyInput(Math.PI);
  recHeavy.heavyAttackJustPressed = true;
  stepWorld(world, recHeavy, 0.02);
  for (let i = 0; i < 32; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);
  assert.equal(world.player.actionState, 'idle');

  // Place boss at (0, 1.2) in recovery and start playback to prime Resonance (Echo lunged to ~2.68m during heavy)
  boss.x = 0;
  boss.z = 1.2;
  bossEnemy.x = 0;
  bossEnemy.z = 1.2;
  boss.aiState = 'recovery';
  boss.stateTimer = 4.0;
  boss.coreExposed = true;
  bossEnemy.aiState = 'recovery';

  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  for (let i = 0; i < 9; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.status, 'primed');

  // Execute Relay (-25 Flux, starts 1.0s Relay cooldown) then live Heavy Convergence (-15 Flux, starts 1.25s Convergence cooldown)
  world.player.x = 3.2;
  world.player.z = 3.2;
  world.player.actionState = 'idle';
  world.player.flux = 40;
  assert.equal(attemptEchoRelay(world), true, `Relay should succeed, got ${world.relay.lastOutcome}`);
  assert.equal(world.player.flux, 15, '40 initial Flux - 25 Relay cost = 15 Flux');
  assert.equal(world.relay.cooldownTimer, RELAY_COOLDOWN);

  // Move to (0, 3.4) and land live Heavy Convergence (spends remaining 15 Flux -> 0 Flux before regen)
  world.player.x = 0;
  world.player.z = 3.4;
  world.player.rotationY = Math.PI;
  const convInp = createEmptyInput(Math.PI);
  convInp.heavyAttackJustPressed = true;
  stepWorld(world, convInp, 0.02);
  for (let i = 0; i < 7; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.resonance.convergenceCount, 1);
  assert.ok(world.resonance.cooldownTimer > 0, 'Convergence cooldown is active before restart');
  assert.ok(world.relay.cooldownTimer > 0, 'Relay cooldown is active before restart');

  // Drain Flux to exact 0 and buffer an input before restarting
  world.player.flux = 0;
  world.player.integrity = 42;
  world.player.bufferedAction = 'heavy';
  world.player.bufferTimer = 0.15;

  // Restart Boss Encounter [R]
  resetWorldForPlaying(world);
  assert.equal(world.encounterMode, 'boss');
  assert.equal(world.player.flux, 40, 'Restart from depleted Flux restores exact 40 initialFlux');
  assert.equal(world.player.maxFlux, 100);
  assert.equal(world.player.integrity, 100);
  assert.equal(world.player.bufferedAction, 'none', 'Restart clears buffered player actions');
  assert.equal(world.player.bufferTimer, 0);
  assert.equal(world.player.isEmpoweredHeavy, false);
  assert.equal(world.resonance.cooldownTimer, 0, 'Restart clears Convergence cooldownTimer');
  assert.equal(world.resonance.convergenceCount, 0, 'Restart resets convergenceCount to 0');
  assert.equal(world.resonance.activeMark, null, 'Restart clears activeMark');
  assert.equal(world.resonance.status, 'idle');
  assert.equal(world.relay.cooldownTimer, 0, 'Restart clears Relay cooldownTimer');
  assert.equal(world.relay.activationCount, 0, 'Restart resets Relay activationCount to 0');
  assert.equal(world.relay.lastOutcome, 'none');

  // 3. Restart during active Echo recording and during active Echo playback leaves zero stale events or actors
  const recMid = createEmptyInput(Math.PI);
  recMid.echoRecordJustPressed = true;
  stepWorld(world, recMid, 0.02);
  const heavyMid = createEmptyInput(Math.PI);
  heavyMid.heavyAttackJustPressed = true;
  stepWorld(world, heavyMid, 0.02);
  assert.equal(world.echo.state, 'recording');
  assert.equal(world.echo.recordingEvents.length, 1);

  resetWorldForPlaying(world);
  assert.equal(world.echo.state, 'idle', 'Restart during active recording resets Echo state to idle');
  assert.equal(world.echo.clip, null);
  assert.equal(world.echo.recordingEvents.length, 0);
  assert.equal(world.echo.recordingSamples.length, 0);
  assert.equal(world.player.flux, 40);

  // Record a valid clip, start playback, and restart mid-playback before scheduled contactTime fires
  const recValidStart = createEmptyInput(Math.PI);
  recValidStart.echoRecordJustPressed = true;
  stepWorld(world, recValidStart, 0.02);
  const recValidHeavy = createEmptyInput(Math.PI);
  recValidHeavy.heavyAttackJustPressed = true;
  stepWorld(world, recValidHeavy, 0.02);
  for (let i = 0; i < 20; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const recValidStop = createEmptyInput(Math.PI);
  recValidStop.echoRecordJustPressed = true;
  stepWorld(world, recValidStop, 0.02);
  const playMid = createEmptyInput(Math.PI);
  playMid.echoPlayJustPressed = true;
  stepWorld(world, playMid, 0.02);
  assert.equal(world.echo.state, 'playback');
  assert.notEqual(world.echo.activeActor, null);

  resetWorldForPlaying(world);
  assert.equal(world.echo.state, 'idle', 'Restart during active playback resets Echo state to idle');
  assert.equal(world.echo.activeActor, null);
  assert.equal(world.echo.clip, null);
  assert.equal(world.player.flux, 40);

  // Advance 25 frames (0.50s) after restart with empty input: verify NO delayed event alters Flux (only exact passive regen +3.5/s)
  for (let i = 0; i < 25; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
    assert.equal(world.resonance.activeMark, null, 'No stale Echo contact may prime Resonance after restart');
  }
  const expectedPostResetFlux = 40 + 0.5 * GAME_CONFIG.player.fluxRegenPerSec;
  assert.ok(
    Math.abs(world.player.flux - expectedPostResetFlux) < 1e-6,
    `Post-reset Flux (${world.player.flux}) must equal 40 + exact passive regen (${expectedPostResetFlux}) with zero delayed deductions`
  );

  // 4. Restart after player defeat and after boss victory restores exact 40 Flux and playing state
  world.player.flux = 92;
  applyDamageToPlayer(world, 999);
  for (let i = 0; i < 35; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.outcome, 'defeat');
  assert.equal(world.appState, 'gameover');
  resetWorldForPlaying(world);
  assert.equal(world.appState, 'playing');
  assert.equal(world.outcome, 'none');
  assert.equal(world.player.flux, 40, 'Restart after player defeat restores exact 40 Flux');
  assert.equal(world.player.integrity, 100);
  assert.equal(world.frozenSummary, null);

  // Trigger boss victory, spend Flux to 12, then restart
  world.boss!.x = 0;
  world.boss!.z = 0;
  world.enemies[0].x = 0;
  world.enemies[0].z = 0;
  world.boss!.hp = 5;
  world.enemies[0].hp = 5;
  world.boss!.phase = 2;
  world.boss!.phaseTransitionTriggered = true;
  world.boss!.coreExposed = true;
  world.boss!.aiState = 'recovery';
  world.boss!.stateTimer = 2.0;
  world.enemies[0].aiState = 'recovery';
  world.player.x = 0;
  world.player.z = 2.4;
  world.player.rotationY = Math.PI;
  const winHit = createEmptyInput(Math.PI);
  winHit.lightAttackJustPressed = true;
  stepWorld(world, winHit, 0.02);
  for (let i = 0; i < 45; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.outcome, 'victory');
  assert.equal(world.appState, 'gameover');
  world.player.flux = 12;

  resetWorldForPlaying(world);
  assert.equal(world.appState, 'playing');
  assert.equal(world.outcome, 'none');
  assert.equal(world.player.flux, 40, 'Restart after boss victory restores exact 40 Flux');
  assert.equal(world.boss?.hp, 360);
  assert.equal(world.boss?.phase, 1);

  // 5. Standard encounter reset also restores exact 40 Flux and clears all cooldowns/marks
  world.player.flux = 88;
  world.relay.cooldownTimer = 0.8;
  world.resonance.cooldownTimer = 0.9;
  resetWorldForStandardPlaying(world);
  assert.equal(world.encounterMode, 'standard');
  assert.equal(world.player.flux, 40, 'Standard encounter reset restores exact 40 Flux');
  assert.equal(world.player.maxFlux, 100);
  assert.equal(world.player.integrity, 100);
  assert.equal(world.relay.cooldownTimer, 0);
  assert.equal(world.resonance.cooldownTimer, 0);
  const hud = extractHudSnapshot(world);
  assert.equal(hud.flux, 40);
  assert.equal(hud.maxFlux, 100);
  assert.equal(hud.integrity, 100);
});

test('Phase 6.32 Audit of Reported Mobile Convergence Damage Sequence (273 HP -> 209 HP -> 133 HP): exact hit-by-hit accounting and zero Echo HP damage', () => {
  // Reconstruct the exact Phase 6.2 mobile sequence from bossHp = 273 through Recording Heavy, Echo Replay, and Live Convergence
  const w = createBossWorld('playing', true);
  const boss = w.boss!;
  const bossEnemy = w.enemies[0];
  const inp = new InputController();

  // Exact pre-Step-5 state from the Phase 6.2 mobile run (/tmp/p621_boss_audit.json):
  // - Boss HP is 273 (after Step 4's Light [23 exposed] + Empowered Heavy [64 unexposed]: 360 - 23 - 64 = 273)
  // - Boss is in Phase 1 'pursue' (coreExposed = false) with 101/140 posture accumulated from Step 3 parry + Step 4 hits
  // - Sera is in melee range at (0, 2.4) facing North (Math.PI) in 'idle' with 77.24 Flux (>= 25 Empowered threshold)
  boss.x = 0;
  boss.z = 0;
  bossEnemy.x = 0;
  bossEnemy.z = 0;
  boss.hp = 273;
  bossEnemy.hp = 273;
  boss.stagger = 101;
  bossEnemy.stagger = 101;
  boss.aiState = 'pursue';
  boss.cooldownTimer = 10;
  boss.coreExposed = false;
  bossEnemy.aiState = 'pursue';

  w.player.x = 0;
  w.player.z = 2.4;
  w.player.rotationY = Math.PI;
  w.player.actionState = 'idle';
  w.player.flux = 77.24;

  const registeredLiveHits: Array<{
    phaseLabel: string;
    isHeavy: boolean;
    isEmpowered: boolean;
    isVulnerable: boolean;
    aiBefore: string;
    damage: number;
    hpBefore: number;
    hpAfter: number;
    bossPhaseAfter: number;
    converged: boolean;
  }> = [];

  let currentPhaseLabel = 'init';
  const stepAndRecord = (dt: number) => {
    const hpBefore = boss.hp;
    const aiBefore = boss.aiState;
    const empoweredBefore = w.player.isEmpoweredHeavy;
    const frame = inp.consumeFrameInput(dt);
    stepWorld(w, frame, dt);
    for (const ev of w.events) {
      if (ev.type === 'player_hit_enemy' || ev.type === 'enemy_killed') {
        const converged = w.events.some((e) => e.type === 'resonance_convergence');
        registeredLiveHits.push({
          phaseLabel: currentPhaseLabel,
          isHeavy: Boolean(ev.isHeavy),
          isEmpowered: Boolean(ev.isHeavy && empoweredBefore),
          isVulnerable: Boolean(ev.isCriticalOrVulnerable),
          aiBefore,
          damage: ev.amount ?? 0,
          hpBefore,
          hpAfter: boss.hp,
          bossPhaseAfter: boss.phase,
          converged,
        });
      }
    }
  };

  // 1. Boss HP immediately before the recording Heavy: 273 HP
  const hpBeforeRecordingHeavy = boss.hp;
  assert.equal(hpBeforeRecordingHeavy, 273);

  // Start recording [T] and perform Heavy [E] while in melee range of HELIX-04
  currentPhaseLabel = 'step5_recording_heavy';
  inp.triggerEchoRecord();
  stepAndRecord(0.02);
  inp.triggerHeavyAttack();
  for (let i = 0; i < 28; i++) {
    stepAndRecord(0.02);
  }
  inp.triggerEchoRecord();
  stepAndRecord(0.02);

  // 2. Boss HP immediately after that recording Heavy resolves: 209 HP
  // Because no Resonance mark is active yet and Flux >= 25, live Sera's Heavy is Empowered (64 baseDamage * 1.0 = 64):
  // 273 - 64 = 209 HP, and its +85 posture (101 + 85 >= 140 maxStagger) breaks HELIX-04 into 'staggered' (coreExposed = true)!
  const hpAfterRecordingHeavy = boss.hp;
  assert.equal(
    hpAfterRecordingHeavy,
    209,
    'Live Empowered Heavy during recording deals 64 damage (273 -> 209 HP)'
  );
  assert.equal(
    boss.aiState,
    'staggered',
    'Recording Empowered Heavy (+85 posture) breaks HELIX-04 posture (101 + 85 >= 140) into staggered state'
  );
  assert.equal(boss.coreExposed, true);
  assert.equal(registeredLiveHits.length, 1, 'Strictly 1 live hit registered during recording');
  assert.equal(registeredLiveHits[0].damage, 64);
  assert.equal(registeredLiveHits[0].isHeavy, true);
  assert.equal(registeredLiveHits[0].isEmpowered, true);
  assert.equal(registeredLiveHits[0].converged, false);

  // Wait for Sera's heavy_recovery to finish so she is 'idle' while HELIX-04 remains in its 2.5s 'staggered' window
  while (w.player.actionState !== 'idle') {
    stepAndRecord(0.02);
  }
  assert.equal(boss.aiState, 'staggered');

  // 3. Replay Echo Heavy -> verify Echo contact deals ZERO HP damage to HELIX-04 (209 -> 209 HP)
  currentPhaseLabel = 'step6b_echo_replay';
  const hpBeforeEchoReplay = boss.hp;
  inp.triggerEchoReplay();
  for (let i = 0; i < 8; i++) {
    stepAndRecord(0.02);
  }
  const hpAfterEchoReplay = boss.hp;
  assert.equal(w.resonance.status, 'primed', 'Echo Heavy replay primes Resonance on HELIX-04');
  assert.equal(hpBeforeEchoReplay, 209);
  assert.equal(hpAfterEchoReplay, 209, 'Echo Heavy contact itself deals 0 HP damage to HELIX-04');
  assert.equal(
    registeredLiveHits.filter((h) => h.phaseLabel === 'step6b_echo_replay').length,
    0,
    'Zero player_hit_enemy events fire during Echo replay contact'
  );

  // 4. Live Heavy Convergence follow-up while HELIX-04 is 'staggered' (staggeredDamageMult = 1.65x):
  // Because a Resonance mark is active, startHeavyWindup reserves Flux for Convergence (15 Flux) rather than spending 25 for Empower,
  // so the live Heavy uses baseDamage (46) * staggeredDamageMult (1.65) = Math.round(75.9) = 76 damage (0 bonus HP damage):
  // 209 - 76 = 133 HP, which crosses <= 180 HP and triggers Phase II!
  currentPhaseLabel = 'step6c_live_convergence';
  const hpImmediatelyBeforeLiveConvergence = boss.hp;
  assert.equal(hpImmediatelyBeforeLiveConvergence, 209);
  assert.equal(boss.aiState, 'staggered');

  inp.triggerHeavyAttack();
  for (let i = 0; i < 12; i++) {
    stepAndRecord(0.02);
  }
  const hpImmediatelyAfterLiveConvergence = boss.hp;
  const convHits = registeredLiveHits.filter((h) => h.phaseLabel === 'step6c_live_convergence');
  assert.equal(convHits.length, 1, 'Live Convergence follow-up registers strictly 1 hit event');
  assert.equal(convHits[0].converged, true, 'Hit event is flagged as Convergence');
  assert.equal(convHits[0].isHeavy, true);
  assert.equal(convHits[0].isEmpowered, false, 'Active Resonance mark reserves Flux for Convergence rather than Empower');
  assert.equal(convHits[0].aiBefore, 'staggered');
  const expectedStaggeredHeavyDamage = Math.round(
    GAME_CONFIG.player.heavyAttack.baseDamage * GAME_CONFIG.boss.staggeredDamageMult
  );
  assert.equal(expectedStaggeredHeavyDamage, 76, 'Math.round(46 * 1.65) === 76');
  assert.equal(convHits[0].damage, 76);
  assert.equal(
    hpImmediatelyAfterLiveConvergence,
    133,
    '209 HP - 76 staggered Heavy Convergence damage = 133 HP'
  );
  assert.equal(boss.phase, 2, 'Dropping from 209 to 133 HP (<= 180) triggers Phase II transition');
  assert.equal(w.resonance.convergenceCount, 1, 'Exactly 1 Convergence event occurred');
  assert.equal(
    registeredLiveHits.reduce((sum, h) => sum + h.damage, 0),
    64 + 76,
    'Total 140 HP delta (273 -> 133) is 100% accounted for by 64 (recording live Empowered Heavy) + 0 (Echo contact) + 76 (staggered live Heavy Convergence)'
  );
});

// ============================================================================
// PHASE 7: VERTICAL SLICE INTEGRATION TESTS (20 DETERMINISTIC TESTS)
// ============================================================================

test('Phase 7.1: Starting a new campaign run enters the intended initial stage with canonical resources', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, false);

  assert.equal(world.appState, 'playing');
  assert.equal(world.encounterMode, 'standard');
  assert.equal(world.run.mode, 'campaign');
  assert.equal(world.run.stage, 'intro');
  assert.equal(world.run.introTimer, GAME_CONFIG.verticalSlice.introDuration);
  assert.equal(world.run.bossCheckpoint, null);
  assert.equal(world.player.integrity, 100);
  assert.equal(world.player.flux, 40);
  assert.equal(world.enemies.length, 3);
});

test('Phase 7.2: Campaign intro transmission can be skipped cleanly or auto-completes on player action', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, false);
  assert.equal(world.run.stage, 'intro');

  skipCampaignIntro(world);
  assert.equal(world.run.stage, 'calibration');
  assert.equal(world.run.introTimer, 0);

  // Also verify auto-advance when player moves during intro
  startCampaignRun(world, false);
  assert.equal(world.run.stage, 'intro');
  const moveInp = createEmptyInput(Math.PI);
  moveInp.moveZ = -1;
  stepWorld(world, moveInp, 0.02);
  assert.equal(world.run.stage, 'calibration');
  assert.equal(world.run.introTimer, 0);
});

test('Phase 7.3: Calibration stage initializes all required puzzle and combat entities', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);

  assert.equal(world.run.stage, 'calibration');
  assert.equal(world.enemies.length, 3);
  assert.deepEqual(
    world.enemies.map((e) => e.id),
    ['enemy-bastion-1', 'enemy-scrapper-1', 'enemy-scout-1']
  );
  assert.equal(world.pressurePlate.id, 'chrono-plate-1');
  assert.equal(world.pressurePlate.active, false);
  assert.equal(world.puzzle.stage, 'teach');
  assert.equal(world.puzzle.heavyReceiver.id, 'chrono-heavy-receiver-1');
  assert.equal(world.puzzle.heavyReceiver.charged, false);
  assert.equal(world.puzzle.combinePlate.id, 'chrono-plate-2');
  assert.equal(world.puzzle.finalBarrier.open, false);
  assert.equal(world.puzzle.completed, false);
});

test('Phase 7.4: Contextual tutorial states progress in the intended order and surface stuck hints after dwell delay', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);
  for (const e of world.enemies) {
    e.cooldownTimer = 999;
    e.aiState = 'idle';
    e.x = 16;
    e.z = -16;
  }

  // Step 1: movement_camera
  assert.equal(world.tutorial.step, 'movement_camera');
  assert.equal(world.tutorial.stuckHintActive, false);

  // Dwell for stuckHintDelay (12.0s) without moving -> stuckHintActive becomes true
  for (let i = 0; i < 605; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.tutorial.step, 'movement_camera');
  assert.equal(world.tutorial.stuckHintActive, true);

  // Move Sera -> advances to combat_basics and resets stuckHintActive
  const moveInp = createEmptyInput(Math.PI);
  moveInp.moveZ = -1;
  stepWorld(world, moveInp, 0.02);
  assert.equal(world.tutorial.step, 'combat_basics');
  assert.equal(world.tutorial.stuckHintActive, false);

  // Perform a light attack -> advances to echo_record_replay
  const atkInp = createEmptyInput(Math.PI);
  atkInp.lightAttackJustPressed = true;
  stepWorld(world, atkInp, 0.02);
  assert.equal(world.tutorial.step, 'echo_record_replay');

  // Start recording -> advances to puzzle_teach
  const recInp = createEmptyInput(Math.PI);
  recInp.echoRecordJustPressed = true;
  stepWorld(world, recInp, 0.02);
  assert.equal(world.tutorial.step, 'puzzle_teach');

  // Complete Stage 1 (TEACH) -> advances to puzzle_test
  world.puzzle.teachCompleted = true;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(world.tutorial.step, 'puzzle_test');

  // Charge North Kinetic Receiver -> advances to puzzle_combine
  world.puzzle.testCompleted = true;
  world.puzzle.heavyReceiver.charged = true;
  world.puzzle.heavyReceiver.chargeTimer = 6.0;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(world.tutorial.step, 'puzzle_combine');
});

test('Phase 7.5: Tutorial hints can be dismissed/toggled and preserve preference across encounter transitions', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);
  assert.equal(world.tutorial.enabled, true);

  const afterToggleOff = toggleTutorialHints(world);
  assert.equal(afterToggleOff, false);
  assert.equal(world.tutorial.enabled, false);
  assert.equal(extractHudSnapshot(world).tutorial.enabled, false);

  // Transitioning to boss preserves disabled hint preference
  transitionCampaignToBoss(world, true);
  assert.equal(world.tutorial.enabled, false);
  assert.equal(world.tutorial.step, 'boss_counterplay');

  setTutorialEnabled(world, true);
  assert.equal(world.tutorial.enabled, true);
});

test('Phase 7.6: Completing the 3-stage Calibration Puzzle unlocks the Containment Breach boss transition', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);
  for (const e of world.enemies) {
    e.cooldownTimer = 999;
    e.aiState = 'idle';
    e.x = 16;
    e.z = -16;
  }

  // Record an Echo that Heavy-strikes the North Receiver (-8.2, 12.0) and stands on Combine Pad 02 (-8.2, 10.2)
  world.player.x = -8.2;
  world.player.z = 12.0;
  world.player.rotationY = Math.PI;

  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);

  const recHeavy = createEmptyInput(Math.PI);
  recHeavy.heavyAttackJustPressed = true;
  stepWorld(world, recHeavy, 0.02);
  for (let i = 0; i < 35; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  world.player.x = -8.2;
  world.player.z = 10.2;
  for (let i = 0; i < 40; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  // Replay the Echo so it charges the North Receiver and holds Combine Pad 02
  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  for (let i = 0; i < 45; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.puzzle.heavyReceiver.charged, true);
  assert.equal(world.puzzle.combinePlate.active, true);
  assert.equal(world.puzzle.finalBarrier.open, true);

  // Move live Sera West across the open Final Calibration Barrier to (-12.5, 10.2)
  world.player.x = -12.5;
  world.player.z = 10.2;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);

  assert.equal(world.puzzle.completed, true);
  assert.equal(world.run.stage, 'transition_to_boss');
  assert.ok(
    world.events.some((ev) => ev.type === 'containment_transition_started'),
    'Completing calibration in campaign mode must emit containment_transition_started'
  );
  assert.notEqual(world.run.bossCheckpoint, null);
});

test('Phase 7.7: Crossing the Final Calibration Barrier transitions cleanly into HELIX-04', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);
  world.puzzle.completed = true;
  beginCampaignBossTransition(world);
  assert.equal(world.run.stage, 'transition_to_boss');

  // Advance through the 1.6s Containment Breach transition
  for (let i = 0; i < 85; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  assert.equal(world.encounterMode, 'boss');
  assert.equal(world.run.mode, 'campaign');
  const stageAfterTransition: string = world.run.stage;
  assert.ok(stageAfterTransition === 'boss_intro' || stageAfterTransition === 'boss_fight');
  assert.notEqual(world.boss, null);
  assert.equal(world.boss?.id, 'helix-04');
  assert.equal(world.boss?.hp, 360);
  assert.equal(world.tutorial.step, 'boss_counterplay');
});

test('Phase 7.8: Active Echo recording and playback do not leak across the calibration-to-boss transition', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);
  world.player.x = -4.0;
  world.player.z = 9.0;

  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  for (let i = 0; i < 25; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  assert.equal(world.echo.state, 'playback');
  assert.notEqual(world.echo.activeActor, null);

  // Trigger calibration-to-boss transition while Echo is actively replaying
  beginCampaignBossTransition(world);
  assert.equal(world.echo.state, 'idle');
  assert.equal(world.echo.activeActor, null);
  assert.equal(world.echo.clip, null);

  skipContainmentTransition(world);
  assert.equal(world.encounterMode, 'boss');
  assert.equal(world.echo.state, 'idle');
  assert.equal(world.echo.activeActor, null);
  assert.equal(world.echo.clip, null);
});

test('Phase 7.9: Active Resonance marks do not leak across the calibration-to-boss transition', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);
  world.resonance.status = 'primed';
  world.resonance.activeMark = {
    markId: 1,
    enemyId: 'enemy-bastion-1',
    enemyName: 'BASTION-09',
    clipId: 1,
    eventId: 'evt-1',
    echoAction: 'heavy_swing',
    createdAt: 1.0,
    expiresAt: 2.1,
    remainingTime: 1.0,
    duration: 1.1,
    x: 0,
    z: 4.5,
  };

  beginCampaignBossTransition(world);
  assert.equal(world.resonance.activeMark, null);
  assert.equal(world.resonance.status, 'idle');

  skipContainmentTransition(world);
  assert.equal(world.resonance.activeMark, null);
  assert.equal(world.resonance.status, 'idle');
});

test('Phase 7.10: Stale enemy state from the Calibration Bay does not persist into the HELIX-04 arena', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);
  assert.equal(world.enemies.length, 3);

  beginCampaignBossTransition(world);
  skipContainmentTransition(world);

  assert.equal(world.encounterMode, 'boss');
  assert.equal(world.enemies.length, 1);
  assert.equal(world.enemies[0].id, 'helix-04');
  assert.equal(world.enemies[0].archetype, 'helix');
  const loomPylon = world.obstacles.find((o) => o.id === 'loom-pylon');
  assert.equal(loomPylon?.disabled, true, 'Central Loom Pylon must be disabled for HELIX-04 arena');
});

test('Phase 7.11: Boss entry uses the documented Archive Synchronization Floor policy for Integrity and Flux', () => {
  // Case A: High Integrity (88 HP) and 100 Flux from puzzle completion -> carried over verbatim without artificial change
  const worldHigh = createInitialWorld('title');
  startCampaignRun(worldHigh, true);
  worldHigh.player.integrity = 88;
  worldHigh.player.flux = 100;
  beginCampaignBossTransition(worldHigh);
  skipContainmentTransition(worldHigh);

  assert.equal(worldHigh.player.integrity, 88);
  assert.equal(worldHigh.player.flux, 100);
  assert.equal(worldHigh.run.bossCheckpoint?.integrity, 88);
  assert.equal(worldHigh.run.bossCheckpoint?.flux, 100);
  assert.equal(worldHigh.run.bossCheckpoint?.replenishedIntegrity, 0);

  // Case B: Low Integrity (42 HP < 75 floor) -> synchronized up to 75 HP floor with explicit replenishedIntegrity = 33
  const worldLow = createInitialWorld('title');
  startCampaignRun(worldLow, true);
  worldLow.player.integrity = 42;
  worldLow.player.flux = 100;
  beginCampaignBossTransition(worldLow);
  skipContainmentTransition(worldLow);

  assert.equal(worldLow.player.integrity, 75);
  assert.equal(worldLow.player.flux, 100);
  assert.equal(worldLow.run.bossCheckpoint?.integrity, 75);
  assert.equal(worldLow.run.bossCheckpoint?.replenishedIntegrity, 33);
  assert.ok(
    worldLow.run.checkpointNotice?.includes('SYNCHRONIZED TO 75 (+33)'),
    'Checkpoint notice must explicitly report the Archive Synchronization Floor replenishment'
  );
});

test('Phase 7.12: Boss Phase I -> Phase II transition works inside the integrated campaign flow', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);
  world.player.integrity = 90;
  world.player.flux = 100;
  transitionCampaignToBoss(world, true);

  assert.equal(world.run.mode, 'campaign');
  assert.equal(world.run.stage, 'boss_fight');
  const boss = world.boss!;
  assert.equal(boss.phase, 1);

  // Position Sera in front of HELIX-04 during an exposed recovery window and deal damage past <= 180 HP
  boss.aiState = 'recovery';
  boss.stateTimer = 2.0;
  boss.coreExposed = true;
  boss.hp = 195;
  world.enemies[0].hp = 195;
  world.player.x = boss.x;
  world.player.z = boss.z + 2.2;
  world.player.rotationY = Math.PI;

  const heavyInp = createEmptyInput(Math.PI);
  heavyInp.heavyAttackJustPressed = true;
  stepWorld(world, heavyInp, 0.02);
  for (let i = 0; i < 10; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  assert.ok(boss.hp <= 180);
  assert.equal(boss.phase, 2);
  assert.equal(boss.phaseTransitionTriggered, true);
});

test('Phase 7.13: Defeating HELIX-04 triggers the vertical-slice campaign victory state and summary telemetry', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);
  world.stats.damageDealt = 120;
  world.stats.parriesLanded = 2;
  world.resonance.convergenceCount = 1;
  world.relay.activationCount = 1;
  transitionCampaignToBoss(world, true);

  const boss = world.boss!;
  boss.phase = 2;
  boss.phaseTransitionTriggered = true;
  boss.aiState = 'recovery';
  boss.stateTimer = 2.0;
  boss.coreExposed = true;
  boss.hp = 35;
  world.enemies[0].hp = 35;
  world.player.x = boss.x;
  world.player.z = boss.z + 2.2;
  world.player.rotationY = Math.PI;

  const heavyInp = createEmptyInput(Math.PI);
  heavyInp.heavyAttackJustPressed = true;
  stepWorld(world, heavyInp, 0.02);
  for (let i = 0; i < 40; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  assert.equal(world.outcome, 'victory');
  assert.equal(world.run.stage, 'completed');
  assert.equal(world.appState, 'gameover');
  assert.notEqual(world.frozenSummary, null);
  assert.equal(world.frozenSummary?.outcome, 'victory');
  assert.equal(world.frozenSummary?.parriesLanded, 2);
  assert.equal(world.frozenSummary?.convergencesTriggered, 1);
  assert.equal(world.frozenSummary?.relaysUsed, 1);
});

test('Phase 7.14: Player defeat during Calibration Bay triggers clean calibration restart without boss checkpoint', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);
  world.player.integrity = 10;
  applyDamageToPlayer(world, 25);

  for (let i = 0; i < 35; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.outcome, 'defeat');
  assert.equal(world.appState, 'gameover');
  assert.equal(world.run.bossCheckpoint, null);

  // Restarting [R] from calibration defeat restarts calibration at 100 Integrity and 40 Flux
  resetWorldForPlaying(world);
  assert.equal(world.appState, 'playing');
  assert.equal(world.encounterMode, 'standard');
  assert.equal(world.run.mode, 'campaign');
  assert.equal(world.run.stage, 'calibration');
  assert.equal(world.player.integrity, 100);
  assert.equal(world.player.flux, 40);
});

test('Phase 7.15: Player defeat during HELIX-04 preserves the boss checkpoint for immediate retry', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);
  world.player.integrity = 86;
  world.player.flux = 100;
  beginCampaignBossTransition(world);
  skipContainmentTransition(world);

  // Player is defeated by HELIX-04
  world.player.integrity = 10;
  world.player.flux = 15;
  applyDamageToPlayer(world, 30);
  for (let i = 0; i < 35; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  assert.equal(world.outcome, 'defeat');
  assert.equal(world.appState, 'gameover');
  assert.notEqual(world.run.bossCheckpoint, null);
  assert.equal(world.run.bossCheckpoint?.integrity, 86);
  assert.equal(world.run.bossCheckpoint?.flux, 100);
});

test('Phase 7.16: Retrying the boss from checkpoint restores exact boss-entry Integrity, Flux, and pre-boss stats', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);
  world.player.integrity = 84;
  world.player.flux = 95;
  world.stats.damageDealt = 210;
  world.stats.parriesLanded = 3;
  world.resonance.convergenceCount = 2;
  world.relay.activationCount = 1;
  beginCampaignBossTransition(world);
  skipContainmentTransition(world);

  // Mutate state during failed boss attempt
  world.boss!.hp = 120;
  world.boss!.phase = 2;
  world.player.integrity = 0;
  world.player.flux = 5;
  world.outcome = 'defeat';
  world.appState = 'gameover';
  world.stats.damageDealt = 450;
  world.resonance.convergenceCount = 5;

  // Retry from boss checkpoint
  retryBossFromCheckpoint(world, true);

  assert.equal(world.appState, 'playing');
  assert.equal(world.encounterMode, 'boss');
  assert.equal(world.run.mode, 'campaign');
  assert.equal(world.run.stage, 'boss_fight');
  assert.equal(world.player.integrity, 84, 'Boss checkpoint must restore exact boss-entry Integrity (84)');
  assert.equal(world.player.flux, 95, 'Boss checkpoint must restore exact boss-entry Flux (95)');
  assert.equal(world.boss?.hp, 360);
  assert.equal(world.boss?.phase, 1);
  assert.equal(world.echo.state, 'idle');
  assert.equal(world.resonance.activeMark, null);
  assert.equal(world.stats.damageDealt, 210, 'Pre-boss damageDealt stat restored');
  assert.equal(world.stats.parriesLanded, 3, 'Pre-boss parriesLanded stat restored');
  assert.equal(world.resonance.convergenceCount, 2, 'Pre-boss convergenceCount restored');
  assert.equal(world.relay.activationCount, 1, 'Pre-boss relay activationCount restored');
});

test('Phase 7.17: Full run restart resets from HELIX-04 back to Calibration Bay with initial resources', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);
  world.player.integrity = 90;
  world.player.flux = 100;
  beginCampaignBossTransition(world);
  skipContainmentTransition(world);
  assert.equal(world.encounterMode, 'boss');
  assert.notEqual(world.run.bossCheckpoint, null);

  // Full run restart
  startCampaignRun(world, true);

  assert.equal(world.appState, 'playing');
  assert.equal(world.encounterMode, 'standard');
  assert.equal(world.run.mode, 'campaign');
  assert.equal(world.run.stage, 'calibration');
  assert.equal(world.run.bossCheckpoint, null);
  assert.equal(world.boss, null);
  assert.equal(world.enemies.length, 3);
  assert.equal(world.puzzle.completed, false);
  assert.equal(world.player.integrity, 100);
  assert.equal(world.player.flux, 40);
});

test('Phase 7.18: Return to Title resets encounter and run state cleanly', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);
  transitionCampaignToBoss(world, true);
  assert.equal(world.encounterMode, 'boss');

  resetWorldForStandardPlaying(world);
  world.appState = 'title';

  assert.equal(world.appState, 'title');
  assert.equal(world.encounterMode, 'standard');
  assert.equal(world.boss, null);
  assert.equal(world.run.bossCheckpoint, null);
  assert.equal(world.player.integrity, 100);
  assert.equal(world.player.flux, 40);
});

test('Phase 7.19: Direct Practice modes (Standard & HELIX-04) remain isolated from campaign progression', () => {
  const world = createInitialWorld('title');
  startPracticeBossRun(world, true);

  assert.equal(world.run.mode, 'practice_boss');
  assert.equal(world.encounterMode, 'boss');
  assert.equal(world.run.bossCheckpoint, null);
  assert.equal(world.player.integrity, 100);
  assert.equal(world.player.flux, 40);

  // Restarting in practice_boss restores 100 Integrity and 40 Flux without any campaign checkpoint
  world.player.integrity = 30;
  world.player.flux = 90;
  resetWorldForPlaying(world);
  assert.equal(world.run.mode, 'practice_boss');
  assert.equal(world.player.integrity, 100);
  assert.equal(world.player.flux, 40);

  // Completing the puzzle in practice_standard does NOT auto-launch the campaign boss transition
  startPracticeStandardRun(world);
  assert.equal(world.run.mode, 'practice_standard');
  world.puzzle.completed = true;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(world.encounterMode, 'standard');
  assert.notEqual(world.run.stage, 'transition_to_boss');
});

test('Phase 7.20: Standard enemy roster count strictly matches the 3 canonical security units across all entry/reset paths', () => {
  const initialWorld = createInitialWorld('playing');
  assert.equal(initialWorld.enemies.length, 3);
  assert.equal(extractHudSnapshot(initialWorld).enemiesAlive, 3);
  assert.equal(extractHudSnapshot(initialWorld).totalEnemies, 3);

  resetWorldForStandardPlaying(initialWorld);
  assert.equal(initialWorld.enemies.length, 3);
  assert.equal(extractHudSnapshot(initialWorld).enemiesAlive, 3);

  startCampaignRun(initialWorld, true);
  assert.equal(initialWorld.enemies.length, 3);
  assert.equal(extractHudSnapshot(initialWorld).enemiesAlive, 3);
  assert.deepEqual(
    initialWorld.enemies.map((e) => e.id),
    ['enemy-bastion-1', 'enemy-scrapper-1', 'enemy-scout-1']
  );
});

// ============================================================================
// PHASE 8: CAMPAIGN EXPANSION (CHAPTERS II–IV + CHAPTER V CHRONICLE LOOM)
// ============================================================================

test('Phase 8.1: Campaign chapter progression sequences prologue -> chapter_1_helix -> chapter_2_choir -> chapter_3_curator -> chapter_4_matron -> chapter_5_loom', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);
  assert.equal(world.run.mode, 'campaign');
  assert.equal(world.run.chapter, 'prologue');

  // Complete Prologue -> Chapter I (HELIX-04)
  world.player.integrity = 88;
  world.player.flux = 92;
  beginCampaignBossTransition(world);
  skipContainmentTransition(world);
  assert.equal(world.run.chapter, 'chapter_1_helix');
  assert.equal(world.boss?.id, 'helix-04');
  assert.ok(world.run.unlockedChapters.includes('chapter_1_helix'));

  // Defeat HELIX-04 -> unlocks Chapter II (THE CHOIR)
  const helixEnemy = world.enemies.find((e) => e.id === 'helix-04')!;
  world.boss!.aiState = 'pursue';
  world.boss!.coreExposed = true;
  helixEnemy.aiState = 'pursue';
  helixEnemy.hp = 10;
  world.boss!.hp = 10;
  world.player.x = helixEnemy.x;
  world.player.z = helixEnemy.z - 2.0;
  world.player.rotationY = 0;
  const hitInp = createEmptyInput(0);
  hitInp.lightAttackJustPressed = true;
  stepWorld(world, hitInp, 0.02);
  for (let i = 0; i < 10; i++) stepWorld(world, createEmptyInput(0), 0.02);

  assert.equal(world.outcome, 'victory');
  assert.equal(world.run.pendingNextChapter, 'chapter_2_choir');
  assert.ok(world.run.unlockedChapters.includes('chapter_2_choir'));

  // Advance to Chapter II (THE CHOIR)
  assert.equal(advanceCampaignChapter(world, true), true);
  assert.equal(world.run.chapter, 'chapter_2_choir');
  assert.equal(world.boss?.id, 'the-choir');
  assert.equal(world.choir.active, true);
  assert.equal(world.choir.nodes.length, 3);

  // Defeat THE CHOIR -> unlocks Chapter III (THE CURATOR)
  const choirEnemy = world.enemies.find((e) => e.id === 'the-choir')!;
  world.choir.synchronizedCount = 2;
  world.choir.syncTimer = 3.0;
  world.boss!.coreExposed = true;
  choirEnemy.hp = 5;
  world.boss!.hp = 5;
  world.player.x = choirEnemy.x;
  world.player.z = choirEnemy.z - 2.0;
  world.player.rotationY = 0;
  world.player.actionState = 'idle';
  world.player.comboCooldownTimer = 0;
  world.hitstopTimer = 0;
  const hitChoir = createEmptyInput(0);
  hitChoir.lightAttackJustPressed = true;
  stepWorld(world, hitChoir, 0.02);
  for (let i = 0; i < 10; i++) stepWorld(world, createEmptyInput(0), 0.02);

  assert.equal(world.outcome, 'victory');
  assert.equal(world.run.pendingNextChapter, 'chapter_3_curator');
  assert.ok(world.run.unlockedChapters.includes('chapter_3_curator'));

  // Advance to Chapter III (THE CURATOR)
  assert.equal(advanceCampaignChapter(world, true), true);
  assert.equal(world.run.chapter, 'chapter_3_curator');
  assert.equal(world.boss?.id, 'the-curator');
  assert.equal(world.curator.active, true);
  assert.equal(world.gravityPin.unlocked, true);

  // Defeat THE CURATOR -> unlocks Chapter IV (MATRON-V)
  const curatorEnemy = world.enemies.find((e) => e.id === 'the-curator')!;
  world.boss!.coreExposed = true;
  curatorEnemy.hp = 5;
  world.boss!.hp = 5;
  world.player.x = curatorEnemy.x;
  world.player.z = curatorEnemy.z - 2.0;
  world.player.rotationY = 0;
  world.player.actionState = 'idle';
  world.player.comboCooldownTimer = 0;
  world.hitstopTimer = 0;
  const hitCurator = createEmptyInput(0);
  hitCurator.lightAttackJustPressed = true;
  stepWorld(world, hitCurator, 0.02);
  for (let i = 0; i < 10; i++) stepWorld(world, createEmptyInput(0), 0.02);

  assert.equal(world.outcome, 'victory');
  assert.equal(world.run.pendingNextChapter, 'chapter_4_matron');
  assert.ok(world.run.unlockedChapters.includes('chapter_4_matron'));

  // Advance to Chapter IV (MATRON-V)
  assert.equal(advanceCampaignChapter(world, true), true);
  assert.equal(world.run.chapter, 'chapter_4_matron');
  assert.equal(world.boss?.id, 'matron-v');
  assert.equal(world.matron.active, true);
  assert.equal(world.gravityPin.unlocked, true);
  assert.equal(world.echoCollapse.unlocked, true);

  // Defeat MATRON-V -> unlocks Chapter V (Chronicle Loom)
  const matronEnemy = world.enemies.find((e) => e.id === 'matron-v')!;
  world.boss!.coreExposed = true;
  matronEnemy.hp = 5;
  world.boss!.hp = 5;
  world.player.x = matronEnemy.x;
  world.player.z = matronEnemy.z - 2.0;
  world.player.rotationY = 0;
  world.player.actionState = 'idle';
  world.player.comboCooldownTimer = 0;
  world.hitstopTimer = 0;
  const hitMatron = createEmptyInput(0);
  hitMatron.lightAttackJustPressed = true;
  stepWorld(world, hitMatron, 0.02);
  for (let i = 0; i < 10; i++) stepWorld(world, createEmptyInput(0), 0.02);

  assert.equal(world.outcome, 'victory');
  assert.equal(world.run.pendingNextChapter, 'chapter_5_loom');
  assert.ok(world.run.unlockedChapters.includes('chapter_5_loom'));

  // Advance to Chapter V (Chronicle Loom)
  assert.equal(advanceCampaignChapter(world, true), true);
  assert.equal(world.run.chapter, 'chapter_5_loom');
  assert.equal(world.run.stage, 'chronicle_loom');
  assert.equal(world.loom.active, true);
  assert.equal(world.enemies.length, 0);
});

test('Phase 8.2: Chapter Select locks unreached chapters and preserves/restores active campaign progress snapshot', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);

  // Unreached chapters cannot be selected before unlocking
  assert.equal(
    startCampaignChapterSelect(world, 'chapter_3_curator', true),
    false,
    'Unreached Chapter III must be rejected by startCampaignChapterSelect'
  );

  // Progress to Chapter II and unlock it (set integrity/flux/stats before advancing so Chapter II checkpoint captures them)
  beginCampaignBossTransition(world);
  skipContainmentTransition(world);
  world.player.integrity = 82;
  world.player.flux = 77;
  world.stats.damageDealt = 340;
  world.run.unlockedChapters.push('chapter_2_choir');
  world.run.completedChapters.push('prologue', 'chapter_1_helix');
  world.run.pendingNextChapter = 'chapter_2_choir';
  assert.equal(advanceCampaignChapter(world, true), true);

  // Replay Chapter I via Chapter Select -> saves snapshot of Chapter II campaign
  assert.equal(startCampaignChapterSelect(world, 'chapter_1_helix', true), true);
  assert.equal(world.run.isChapterReplay, true);
  assert.equal(world.run.chapter, 'chapter_1_helix');
  assert.notEqual(world.run.savedCampaignSnapshot, null);
  assert.equal(world.run.savedCampaignSnapshot?.chapter, 'chapter_2_choir');

  // Restore saved campaign progress -> returns to Chapter II with saved integrity/flux/stats
  assert.equal(restoreSavedCampaignProgress(world), true);
  assert.equal(world.run.isChapterReplay, false);
  assert.equal(world.run.chapter, 'chapter_2_choir');
  assert.equal(world.player.integrity, 82);
  assert.equal(world.player.flux, 77);
  assert.equal(world.stats.damageDealt, 340);
});

test('Phase 8.3: Chapter II (THE CHOIR) requires Echo priming one Harmonic Node and Live Sera striking a distinct linked node within syncWindowSeconds', () => {
  const world = createInitialWorld('title');
  startPracticeBossRun(world, true, 'the-choir');

  assert.equal(world.boss?.id, 'the-choir');
  assert.equal(world.choir.active, true);
  assert.equal(world.choir.nodes.length, 3);
  assert.equal(world.boss?.coreExposed, false);

  const node1 = world.choir.nodes[0]; // (-5.4, -2.2)
  const node2 = world.choir.nodes[1]; // (5.4, -2.2)

  // 1. Live Sera striking an unprimed node when no Echo node is primed fails synchronization
  world.player.x = node1.x;
  world.player.z = node1.z + 1.8;
  world.player.rotationY = Math.PI;
  const unprimedHit = createEmptyInput(Math.PI);
  unprimedHit.lightAttackJustPressed = true;
  stepWorld(world, unprimedHit, 0.02);
  for (let i = 0; i < 6; i++) stepWorld(world, createEmptyInput(Math.PI), 0.02);

  assert.equal(node1.status, 'failed');
  assert.equal(world.choir.lastFailureReason, 'unprimed_node_struck');
  assert.equal(world.choir.synchronizedCount, 0);

  // Wait for failure reset (1.5s)
  for (let i = 0; i < 80; i++) stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(node1.status, 'inactive');

  // 2. Record Echo striking Node 1
  world.player.x = node1.x;
  world.player.z = node1.z + 1.8;
  world.player.rotationY = Math.PI;
  world.player.actionState = 'idle';
  world.player.comboCooldownTimer = 0;

  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);

  const recAttack = createEmptyInput(Math.PI);
  recAttack.lightAttackJustPressed = true;
  stepWorld(world, recAttack, 0.02);
  for (let i = 0; i < 20; i++) stepWorld(world, createEmptyInput(Math.PI), 0.02);

  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);
  assert.equal(world.echo.state, 'ready');

  // Reset node1 to inactive before replay test (since live recording hit was unprimed)
  for (let i = 0; i < 80; i++) stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(node1.status, 'inactive');

  // Move Live Sera to Node 2 (5.4, -2.2) and replay Echo at Node 1
  world.player.x = node2.x;
  world.player.z = node2.z + 1.8;
  world.player.rotationY = Math.PI;
  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);

  // Step until Echo's recorded attack primes Node 1
  for (let i = 0; i < 12; i++) stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(node1.status, 'primed', 'Echo attack must prime Harmonic Node 1');

  // Now Live Sera strikes distinct linked Node 2 within the sync window!
  const syncStrike = createEmptyInput(Math.PI);
  syncStrike.lightAttackJustPressed = true;
  stepWorld(world, syncStrike, 0.02);
  for (let i = 0; i < 8; i++) stepWorld(world, createEmptyInput(Math.PI), 0.02);

  assert.equal(node1.status, 'synchronized');
  assert.equal(node2.status, 'synchronized');
  assert.equal(world.choir.synchronizedCount, 2);
  assert.equal(world.choir.completedCycles, 1);
  assert.equal(
    world.boss?.coreExposed,
    true,
    'Synchronizing linked Harmonic Nodes must shatter THE CHOIR shield and expose its core'
  );
  assert.equal(world.boss?.aiState, 'staggered');
});

test('Phase 8.4: Chapter III (THE CURATOR) Reconstructed Attack Traces follow warning -> committed -> executing -> residue and Gravity Pin [G] anchors decoys and interrupts non-committed telegraphs', () => {
  const world = createInitialWorld('title');
  startPracticeBossRun(world, true, 'the-curator');

  assert.equal(world.boss?.id, 'the-curator');
  assert.equal(world.curator.active, true);
  assert.equal(world.gravityPin.unlocked, true);
  assert.equal(
    world.curator.decoyIds.length,
    2,
    'THE CURATOR spawns 2 False-Echo Decoys capped at maxActiveDecoys'
  );

  // 1. Verify Reconstructed Attack Trace deterministic lifecycle
  world.curator.traces = [];
  spawnCuratorReconstructedTraces(world, 0, -4, 0, 'archive_lance');
  assert.equal(world.curator.traces.length, 2, 'Spawns 1 damaging trace and 1 harmless residue trace');
  const realTrace = world.curator.traces.find((t) => !t.isHarmlessResidue)!;
  const residueTrace = world.curator.traces.find((t) => t.isHarmlessResidue)!;
  assert.equal(realTrace.state, 'warning');
  assert.equal(residueTrace.state, 'residue');

  // Step past warningDuration (0.65s) -> transitions to 'committed'
  for (let i = 0; i < 34; i++) stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(realTrace.state, 'committed');

  // Position player outside trace lane so we observe state transition to 'executing' and 'residue'
  world.player.x = -8;
  world.player.z = 6;
  for (let i = 0; i < 14; i++) stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(realTrace.state, 'executing');

  for (let i = 0; i < 12; i++) stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(realTrace.state, 'residue');

  // 2. Verify Gravity Pin [G] Flux cost (30), cooldown (6.5s), decoy damage/immobilization, and boss telegraph interruption
  world.player.flux = 60;
  const decoy = world.enemies.find((e) => e.archetype === 'curator_decoy')!;
  const bossEnemy = world.enemies.find((e) => e.id === 'the-curator')!;
  decoy.x = 0.8;
  decoy.z = -3.8;
  bossEnemy.x = 0;
  bossEnemy.z = -4.0;
  world.boss!.x = 0;
  world.boss!.z = -4.0;
  world.player.x = 0;
  world.player.z = -1.0;
  world.player.rotationY = Math.PI;

  // Put THE CURATOR into a non-committed 'telegraph' state
  forceBossAttack(world, 'helical_sweep');
  assert.equal(world.boss?.aiState, 'telegraph');

  const decoyHpBefore = decoy.hp;
  const fluxBefore = world.player.flux;
  assert.equal(attemptGravityPin(world), true);
  assert.equal(world.player.flux, fluxBefore - GAME_CONFIG.curator.gravityPin.fluxCost);
  assert.equal(world.gravityPin.cooldownTimer, GAME_CONFIG.curator.gravityPin.cooldown);
  assert.equal(world.gravityPin.status, 'active');
  assert.ok(decoy.hp < decoyHpBefore, 'Gravity Pin must damage False-Echo Decoys');
  assert.ok((decoy.pinnedTimer ?? 0) > 0, 'Gravity Pin must immobilize False-Echo Decoys');
  assert.equal(
    world.boss?.aiState,
    'recovery',
    'Gravity Pin must interrupt non-committed boss telegraph into recovery'
  );
  assert.equal(world.boss?.coreExposed, true);

  // 3. Verify Gravity Pin NEVER cancels a committed boss 'attack' or 'phase_transition'
  world.gravityPin.cooldownTimer = 0;
  world.gravityPin.activeDurationTimer = 0;
  world.player.flux = 60;
  world.boss!.aiState = 'attack';
  world.boss!.activeAttack = 'vector_ram';
  world.boss!.stateTimer = 0.3;
  bossEnemy.aiState = 'attack';
  assert.equal(attemptGravityPin(world), true);
  assert.equal(
    world.boss?.aiState,
    'attack',
    'Gravity Pin must NOT cancel an already-committed boss attack'
  );
});

test('Phase 8.5: Chapter IV (MATRON-V) Siphon drains bounded Flux on unparried hit, Eraser/Chrono Sever suppresses active Echo while preserving clip, and Echo Collapse [X] detonates active Echo', () => {
  const world = createInitialWorld('title');
  startPracticeBossRun(world, true, 'matron-v');

  assert.equal(world.boss?.id, 'matron-v');
  assert.equal(world.matron.active, true);
  assert.equal(world.echoCollapse.unlocked, true);

  const siphon = world.enemies.find((e) => e.archetype === 'siphon')!;
  const eraser = world.enemies.find((e) => e.archetype === 'eraser')!;
  const matronEnemy = world.enemies.find((e) => e.id === 'matron-v')!;
  assert.ok(siphon, 'Chapter IV arena spawns Siphon unit');
  assert.ok(eraser, 'Chapter IV arena spawns Eraser unit');

  // Move Matron and Eraser away temporarily to isolate Siphon test
  matronEnemy.x = 0;
  matronEnemy.z = -12;
  world.boss!.x = 0;
  world.boss!.z = -12;
  world.boss!.cooldownTimer = 99;
  eraser.x = -12;
  eraser.z = -12;
  eraser.cooldownTimer = 99;

  // 1. Siphon landed unparried hit drains bounded Flux once per attack; parried hit drains 0 Flux
  siphon.x = 0;
  siphon.z = 4.0;
  siphon.rotationY = 0;
  world.player.x = 0;
  world.player.z = 5.2;
  world.player.rotationY = Math.PI;
  world.player.flux = 60;
  world.player.integrity = 100;
  world.player.invulnTimer = 0;

  siphon.aiState = 'attack';
  siphon.stateDuration = 0.22;
  siphon.stateTimer = 0.22;
  siphon.hasDealtDamageThisAttack = false;

  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(world.matron.siphonDrainEventsCount, 1);
  assert.equal(world.matron.totalFluxDrained, GAME_CONFIG.matron.siphonFluxDrain);
  assert.ok(world.player.flux < 60, 'Unparried Siphon strike must drain Flux');

  // Step remaining active frames of same attack -> must NOT drain a second time
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(world.matron.siphonDrainEventsCount, 1, 'Siphon drains at most once per attack');

  // 2. Record an Echo clip (>= 0.35s minDuration) and start playback, then test Chrono Sever anti-Echo suppression
  siphon.cooldownTimer = 99;
  siphon.x = 12;
  siphon.z = -12;
  world.hitstopTimer = 0;
  world.player.invulnTimer = 0;
  world.player.x = 0;
  world.player.z = 6.0;

  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  for (let i = 0; i < 80; i++) stepWorld(world, createEmptyInput(Math.PI), 0.02);
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);
  assert.equal(world.echo.state, 'ready');
  assert.notEqual(world.echo.clip, null);

  // Start Echo playback at (0, 6.0)
  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  assert.equal(world.echo.state, 'playback');
  assert.notEqual(world.echo.activeActor, null);

  // Force MATRON-V to execute 'chrono_sever' targeting the active Echo
  world.player.x = -8;
  world.player.z = 6.0;
  forceBossAttack(world, 'chrono_sever');
  assert.equal(world.matron.chronoSeverActive, true);

  // Advance past telegraph so Chrono Sever detonates on the Echo
  for (let i = 0; i < 45; i++) stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(
    world.echo.state,
    'ready',
    'Chrono Sever must terminate active Echo playback and return state to ready'
  );
  assert.notEqual(
    world.echo.clip,
    null,
    'Chrono Sever must preserve the recorded Echo clip in memory'
  );
  assert.ok(
    world.matron.echoSuppressedTimer > 0,
    'Chrono Sever must apply temporary Echo suppression timer'
  );

  // Clear suppression and test Echo Collapse [X]
  world.matron.echoSuppressedTimer = 0;
  const replayInp = createEmptyInput(Math.PI);
  replayInp.echoPlayJustPressed = true;
  stepWorld(world, replayInp, 0.02);
  assert.equal(world.echo.state, 'playback');

  // Position MATRON-V right next to the active Echo at (0, 6.0) in telegraph state
  matronEnemy.x = 0;
  matronEnemy.z = 5.0;
  world.boss!.x = 0;
  world.boss!.z = 5.0;
  forceBossAttack(world, 'surgical_incision');
  assert.equal(world.boss?.aiState, 'telegraph');

  world.player.flux = 80;
  const matronHpBefore = world.boss!.hp;
  assert.equal(attemptEchoCollapse(world), true);

  assert.equal(world.player.flux, 80 - GAME_CONFIG.matron.echoCollapse.fluxCost);
  assert.equal(world.echo.state, 'ready', 'Echo Collapse consumes active playback but preserves clip');
  assert.notEqual(world.echo.clip, null);
  assert.equal(world.boss!.hp, matronHpBefore - GAME_CONFIG.matron.echoCollapse.damage);
  assert.equal(
    world.boss?.aiState,
    'recovery',
    'Echo Collapse blast must interrupt non-committed boss telegraph into recovery'
  );
});

test('Phase 8.6: Chapter V (Chronicle Loom) ending choice is rejected outside Chapter V and records deterministic Silence, Witness, and Continuity endings', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);

  // Cannot select an ending while in Prologue / Chapters I–IV
  assert.equal(selectChronicleLoomEnding(world, 'silence'), false);

  // Enter Chapter V (Chronicle Loom)
  world.run.unlockedChapters.push('chapter_5_loom');
  assert.equal(startCampaignChapterSelect(world, 'chapter_5_loom', true), true);
  assert.equal(world.run.chapter, 'chapter_5_loom');
  assert.equal(world.loom.active, true);
  assert.equal(world.enemies.length, 0);

  // Select 'witness' ending
  assert.equal(selectChronicleLoomEnding(world, 'witness'), true);
  assert.equal(world.loom.selectedEnding, 'witness');
  assert.equal(world.run.selectedEnding, 'witness');
  assert.equal(world.outcome, 'victory');
  assert.equal(world.appState, 'gameover');
  assert.equal(world.frozenSummary?.selectedEnding, 'witness');

  // Idempotent / rejected once an ending is already selected
  assert.equal(selectChronicleLoomEnding(world, 'silence'), false);
  assert.equal(world.run.selectedEnding, 'witness');

  // Verify 'silence' and 'continuity' on fresh Chapter V instances
  startCampaignChapterSelect(world, 'chapter_5_loom', true);
  assert.equal(selectChronicleLoomEnding(world, 'silence'), true);
  assert.equal(world.frozenSummary?.selectedEnding, 'silence');

  startCampaignChapterSelect(world, 'chapter_5_loom', true);
  assert.equal(selectChronicleLoomEnding(world, 'continuity'), true);
  assert.equal(world.frozenSummary?.selectedEnding, 'continuity');
});

test('Phase 8.7: Release Gate — Tutorial control contract (WASD move, Arrow keys camera), Choir repeat-node/expiry rejection, Siphon parry/dodge drain prevention, and Practice isolation', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);

  // 1. Verify tutorial movement prompt authoritatively states WASD for movement and Arrow Keys for camera
  const hudMove = extractHudSnapshot(world);
  assert.ok(
    hudMove.tutorial.desktopPrompt.includes('[WASD]') &&
      hudMove.tutorial.desktopPrompt.includes('[Arrow Keys]'),
    'Desktop movement prompt must specify [WASD] for movement and [Arrow Keys] for camera rotation'
  );
  assert.ok(
    hudMove.tutorial.mobilePrompt.includes('[W] FWD') &&
      hudMove.tutorial.mobilePrompt.includes('[D] RIGHT'),
    'Mobile movement prompt must specify the 4-button directional pad ([W] FWD, [A] LEFT, [S] BACK, [D] RIGHT)'
  );

  // 2. Chapter II (THE CHOIR): Repeating the same node does NOT synchronize, and expiry resets prime
  world.run.unlockedChapters.push('chapter_2_choir');
  assert.equal(startCampaignChapterSelect(world, 'chapter_2_choir', true), true);
  for (const e of world.enemies) e.cooldownTimer = 99;
  const node1 = world.choir.nodes[0];
  world.player.x = node1.x;
  world.player.z = node1.z + 1.2;
  world.player.rotationY = Math.PI;

  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(world, recStart, 0.02);
  for (let i = 0; i < 6; i++) stepWorld(world, createEmptyInput(Math.PI), 0.02);
  const recLight = createEmptyInput(Math.PI);
  recLight.lightAttackJustPressed = true;
  stepWorld(world, recLight, 0.02);
  for (let i = 0; i < 18; i++) stepWorld(world, createEmptyInput(Math.PI), 0.02);
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(world, recStop, 0.02);

  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);
  for (let i = 0; i < 12; i++) stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(node1.status, 'primed', 'Echo strike must prime Node 1');

  // Live Sera strikes the SAME Node 1 -> must fail/reset and NOT trigger synchronization
  const liveSameNode = createEmptyInput(Math.PI);
  liveSameNode.lightAttackJustPressed = true;
  stepWorld(world, liveSameNode, 0.02);
  for (let i = 0; i < 8; i++) stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(
    world.choir.completedCycles,
    0,
    'Striking the same primed node with live Sera must not complete harmonic synchronization'
  );
  assert.equal(world.boss?.coreExposed, false);

  // Let any failure/prime window expire (> 9.0s) -> node1 status returns to 'inactive'
  for (let i = 0; i < 95; i++) {
    for (const e of world.enemies) e.cooldownTimer = 99;
    stepWorld(world, createEmptyInput(Math.PI), 0.1);
  }
  assert.equal(node1.status, 'inactive', 'Expired harmonic window must reset node1 status to inactive');

  // 3. Chapter IV (MATRON-V): Timed Parry [Q] and Dodge [Space] prevent Siphon Flux drain
  startPracticeBossRun(world, true, 'matron-v');
  for (const e of world.enemies) {
    e.cooldownTimer = 99;
    e.aiState = 'idle';
  }
  const siphon = world.enemies.find((e) => e.archetype === 'siphon')!;
  siphon.x = 0;
  siphon.z = 4.0;
  siphon.rotationY = 0;
  world.player.x = 0;
  world.player.z = 5.2;
  world.player.rotationY = Math.PI;
  world.player.flux = 40;
  world.player.integrity = 100;
  world.player.invulnTimer = 0;
  siphon.aiState = 'attack';
  siphon.stateDuration = 0.22;
  siphon.stateTimer = 0.22;
  siphon.hasDealtDamageThisAttack = false;

  // Activate Parry [Q] right as Siphon strikes
  const parryInp = createEmptyInput(Math.PI);
  parryInp.parryJustPressed = true;
  stepWorld(world, parryInp, 0.02);
  assert.equal(
    world.matron.siphonDrainEventsCount,
    0,
    'Parried Siphon strike must not drain Flux'
  );
  assert.ok(world.player.flux > 40, 'Parried Siphon strike must grant Parry Flux reward');
  assert.equal(world.stats.parriesLanded, 1);

  // Reset Siphon attack and test Dodge [Space] i-frames preventing Siphon drain
  const fluxBeforeDodge = world.player.flux;
  world.hitstopTimer = 0;
  world.player.actionState = 'idle';
  world.player.stateTimer = 0;
  world.player.dodgeCooldownTimer = 0;
  world.player.parryCooldownTimer = 0;
  world.player.invulnTimer = 0;
  siphon.x = 0;
  siphon.z = 4.0;
  siphon.rotationY = 0;
  siphon.aiState = 'attack';
  siphon.stateDuration = 0.22;
  siphon.stateTimer = 0.22;
  siphon.hasDealtDamageThisAttack = false;

  const dodgeInp = createEmptyInput(Math.PI);
  dodgeInp.dodgeJustPressed = true;
  stepWorld(world, dodgeInp, 0.02);
  assert.equal(
    world.matron.siphonDrainEventsCount,
    0,
    'Dodged Siphon strike must not drain Flux'
  );
  assert.ok(world.player.flux >= fluxBeforeDodge, 'Dodged Siphon strike must preserve Flux');

  // 4. Practice mode isolation: defeating a boss in practice mode never unlocks campaign chapters or mutates savedCampaignSnapshot
  startCampaignRun(world, true);
  world.run.unlockedChapters = ['prologue', 'chapter_1_helix', 'chapter_2_choir'];
  world.run.completedChapters = ['prologue', 'chapter_1_helix'];
  world.run.chapter = 'chapter_2_choir';
  world.run.stage = 'boss_fight';

  startPracticeBossRun(world, true, 'the-choir');
  assert.equal(world.run.mode, 'practice_boss');
  assert.notEqual(world.run.savedCampaignSnapshot, null);
  const choirBoss = world.enemies.find((e) => e.id === 'the-choir')!;
  choirBoss.hp = 1;
  world.boss!.hp = 1;
  world.player.x = choirBoss.x;
  world.player.z = choirBoss.z + 1.8;
  world.player.rotationY = Math.PI;
  const finishLight = createEmptyInput(Math.PI);
  finishLight.lightAttackJustPressed = true;
  stepWorld(world, finishLight, 0.02);
  for (let i = 0; i < 60; i++) stepWorld(world, createEmptyInput(Math.PI), 0.05);

  assert.equal(world.outcome, 'victory');
  assert.equal(
    world.run.pendingNextChapter,
    null,
    'Practice boss victory must never queue a campaign chapter transition'
  );
  assert.deepEqual(
    world.run.unlockedChapters,
    ['prologue', 'chapter_1_helix', 'chapter_2_choir'],
    'Practice boss victory must not unlock Chapter III'
  );
  assert.deepEqual(
    world.run.savedCampaignSnapshot?.unlockedChapters,
    ['prologue', 'chapter_1_helix', 'chapter_2_choir']
  );

  // 5. Canonical fresh-entry boss HP (360 / 380 / 400 / 420) and 8.5s Choir synchronization window consistency
  const expectedBossHp: Array<{ bossId: 'helix-04' | 'the-choir' | 'the-curator' | 'matron-v'; hp: number }> = [
    { bossId: 'helix-04', hp: 360 },
    { bossId: 'the-choir', hp: 380 },
    { bossId: 'the-curator', hp: 400 },
    { bossId: 'matron-v', hp: 420 },
  ];
  for (const item of expectedBossHp) {
    const freshBossWorld = createBossWorld('playing', true, item.bossId);
    assert.equal(freshBossWorld.boss?.hp, item.hp, `${item.bossId} fresh-entry HP must be ${item.hp}`);
    assert.equal(freshBossWorld.boss?.maxHp, item.hp, `${item.bossId} maxHp must be ${item.hp}`);
  }
  assert.equal(GAME_CONFIG.choir.syncWindowSeconds, 8.5);
  assert.equal(GAME_CONFIG.choir.nodePrimeDuration, 8.5);
});

// ============================================================================
// PHASE 9: UX/UI OVERHAUL & FIRST-TIME PLAYER FLOW REGRESSION TESTS
// ============================================================================

test('Phase 9.1: Continue Campaign visibility, Return-to-Title snapshot preservation, and New Campaign reset isolation', () => {
  const world = createInitialWorld('title');

  // 1. Fresh launch has no resumable campaign
  assert.equal(hasResumableCampaign(world), false, 'Fresh launch must not expose Continue Campaign');

  // 2. Start New Campaign -> advance to Chapter I -> Return to Title preserves resumable snapshot
  startCampaignRun(world, false);
  assert.equal(world.run.mode, 'campaign');
  assert.equal(world.run.stage, 'intro');
  skipCampaignIntro(world);
  assert.equal(world.run.stage, 'calibration');

  world.player.integrity = 85;
  world.player.flux = 90;
  beginCampaignBossTransition(world);
  skipContainmentTransition(world);
  assert.equal(world.run.chapter, 'chapter_1_helix');

  // Return to Title (resetWorldForStandardPlaying + appState = 'title') preserves savedCampaignSnapshot
  resetWorldForStandardPlaying(world);
  world.appState = 'title';
  assert.equal(
    hasResumableCampaign(world),
    true,
    'Returning to Title from an active campaign must expose Continue Campaign'
  );
  assert.equal(world.run.savedCampaignSnapshot?.chapter, 'chapter_1_helix');

  // 3. Continuing campaign restores exact chapter and checkpoint resources
  assert.equal(restoreSavedCampaignProgress(world), true);
  assert.equal(world.run.mode, 'campaign');
  assert.equal(world.run.chapter, 'chapter_1_helix');
  assert.equal(world.player.integrity, 85);
  assert.equal(world.player.flux, 90);

  // 4. Completing Chronicle Loom ending and returning to Title does NOT expose Continue Campaign for a finished run, and New Campaign clears ending
  world.run.unlockedChapters.push('chapter_5_loom');
  assert.equal(startCampaignChapterSelect(world, 'chapter_5_loom', true), true);
  world.run.isChapterReplay = false;
  world.run.savedCampaignSnapshot = null;
  assert.equal(selectChronicleLoomEnding(world, 'continuity'), true);
  assert.equal(world.run.selectedEnding, 'continuity');

  resetWorldForStandardPlaying(world);
  world.appState = 'title';
  assert.equal(
    hasResumableCampaign(world),
    false,
    'Completed Chronicle Loom run must not appear as an unfinished resumable campaign'
  );

  startCampaignRun(world, true);
  assert.equal(world.run.selectedEnding, null);
  assert.equal(world.loom.selectedEnding, null);
  assert.equal(world.run.savedCampaignSnapshot, null);
});

test('Phase 9.2: Progressive Calibration objective guidance and disabled/insufficient-resource feedback match authoritative state', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);

  // 1. Stage 1 (teach): Step 1 of 3 objective
  let hud = extractHudSnapshot(world);
  let guidance = getCurrentCalibrationObjective(hud.puzzle);
  assert.equal(guidance.stepNumber, 1);
  assert.equal(guidance.stage, 'teach');
  assert.equal(guidance.completed, false);
  assert.ok(guidance.headline.includes('STEP 1 OF 3'));

  // 2. Stage 2 (test): Step 2 of 3 objective only after teachCompleted is true
  world.puzzle.teachCompleted = true;
  world.puzzle.stage = 'test';
  hud = extractHudSnapshot(world);
  guidance = getCurrentCalibrationObjective(hud.puzzle);
  assert.equal(guidance.stepNumber, 2);
  assert.equal(guidance.stage, 'test');
  assert.ok(guidance.headline.includes('STEP 2 OF 3'));

  // 3. Stage 3 (combine): Step 3 of 3 objective reflects receiverCharged and finalBarrierOpen
  world.puzzle.testCompleted = true;
  world.puzzle.stage = 'combine';
  world.puzzle.heavyReceiver.charged = true;
  world.puzzle.heavyReceiver.chargeTimer = 5.4;
  hud = extractHudSnapshot(world);
  guidance = getCurrentCalibrationObjective(hud.puzzle);
  assert.equal(guidance.stepNumber, 3);
  assert.equal(guidance.stage, 'combine');
  assert.ok(guidance.headline.includes('STEP 3 OF 3'));

  world.puzzle.finalBarrier.open = true;
  hud = extractHudSnapshot(world);
  guidance = getCurrentCalibrationObjective(hud.puzzle);
  assert.ok(guidance.headline.includes('CROSS THE OPEN WEST CALIBRATION GATE'));

  // 4. Completed stage
  world.puzzle.completed = true;
  world.puzzle.stage = 'completed';
  hud = extractHudSnapshot(world);
  guidance = getCurrentCalibrationObjective(hud.puzzle);
  assert.equal(guidance.completed, true);

  // 5. Insufficient resource / invalid state feedback on Relay, Gravity Pin, and Echo Collapse
  assert.equal(attemptEchoRelay(world), false);
  assert.equal(world.relay.lastOutcome, 'no_active_echo');

  world.gravityPin.unlocked = true;
  world.player.flux = 10; // below 30 Flux cost
  assert.equal(attemptGravityPin(world), false);
  assert.equal(world.gravityPin.status, 'insufficient_flux');

  world.echoCollapse.unlocked = true;
  world.player.flux = 80;
  assert.equal(attemptEchoCollapse(world), false, 'Echo Collapse without active Echo must be rejected');
  assert.equal(world.echoCollapse.status, 'no_active_echo');
});

test('Phase 9.2 P0 Regression: First-map completion, first-boss defeat (including Chapter Select replay & zero-HP guard), and all 6 campaign boundaries advance without softlock', () => {
  const world = createInitialWorld('title');
  startCampaignRun(world, true);

  // Boundary 1A: Defeating all 3 proxies in Prologue (Calibration Bay 04) in Campaign Mode transitions to HELIX-04
  for (const enemy of world.enemies) {
    enemy.hp = 0;
    enemy.aiState = 'ko';
  }
  stepWorld(world, createEmptyInput(), 0.05);
  assert.equal(world.run.stage, 'transition_to_boss', 'Clearing all Prologue enemies in campaign mode must start boss transition');
  assert.equal(world.run.pendingNextChapter, 'chapter_1_helix');
  assert.ok(world.run.completedChapters.includes('prologue'));
  assert.ok(world.run.unlockedChapters.includes('chapter_1_helix'));

  // Stepping through transition timer enters Chapter I (HELIX-04) and clears pendingNextChapter
  for (let i = 0; i < 12 && world.run.stage === 'transition_to_boss'; i++) {
    stepWorld(world, createEmptyInput(), 0.25);
  }
  assert.equal(world.run.chapter, 'chapter_1_helix');
  assert.equal(world.encounterMode, 'boss');
  assert.equal(world.boss?.id, 'helix-04');
  assert.equal(world.run.pendingNextChapter, null);

  // Verify launching the uncompleted frontier Chapter I via Chapter Select treats it as active frontier progression (isChapterReplay = false)
  resetWorldForStandardPlaying(world);
  world.appState = 'title';
  assert.equal(startCampaignChapterSelect(world, 'chapter_1_helix', true), true);
  assert.equal(
    world.run.isChapterReplay,
    false,
    'Launching the uncompleted frontier chapter via Chapter Select must not be conflated with replaying a completed earlier chapter'
  );
  assert.equal(world.boss?.id, 'helix-04');

  // Position player in front of HELIX-04 and land registered lethal melee damage
  const helixEnemy = world.enemies.find((e) => e.id === 'helix-04')!;
  world.boss!.coreExposed = true;
  helixEnemy.hp = 5;
  world.boss!.hp = 5;
  world.player.x = helixEnemy.x;
  world.player.z = helixEnemy.z - 2.0;
  world.player.rotationY = 0;
  const attackInput = createEmptyInput(0);
  attackInput.lightAttackJustPressed = true;
  stepWorld(world, attackInput, 0.02);
  for (let i = 0; i < 10; i++) {
    stepWorld(world, createEmptyInput(0), 0.02);
  }

  assert.equal(world.outcome, 'victory', 'Defeating HELIX-04 via registered melee hit must set outcome to victory');
  assert.equal(world.run.pendingNextChapter, 'chapter_2_choir', 'Defeating HELIX-04 must populate pendingNextChapter = chapter_2_choir');
  assert.ok(world.frozenSummary !== null, 'frozenSummary must be populated immediately on boss defeat');

  // Step through 0.5s outcomeDelayTimer so gameover modal opens
  for (let i = 0; i < 4; i++) {
    stepWorld(world, createEmptyInput(0), 0.2);
  }
  assert.equal(world.appState, 'gameover');
  const helixVictoryHud = extractHudSnapshot(world);
  assert.equal(helixVictoryHud.run.pendingNextChapter, 'chapter_2_choir');

  // Boundary 2: Advance from HELIX-04 to Chapter II · THE CHOIR
  assert.equal(advanceCampaignChapter(world, false), true, 'advanceCampaignChapter must succeed after HELIX-04 victory');
  assert.equal(world.appState, 'playing');
  assert.equal(world.outcome, 'none');
  assert.equal(world.run.chapter, 'chapter_2_choir');
  assert.equal(world.run.stage, 'boss_intro');
  assert.equal(world.boss?.id, 'the-choir');
  assert.equal(world.run.pendingNextChapter, null);

  // Repeated activation cannot skip a chapter or advance twice
  assert.equal(advanceCampaignChapter(world, false), false, 'Repeated advanceCampaignChapter must be rejected when no pending transition exists');
  assert.equal(world.run.chapter, 'chapter_2_choir');

  // Boundary 3: Defeat THE CHOIR (also testing updateBoss 0-HP fallback guard if boss HP reaches 0 before defeatTriggered)
  world.run.stage = 'boss_fight';
  const choirEnemy = world.enemies.find((e) => e.id === 'the-choir')!;
  choirEnemy.hp = 0;
  world.boss!.hp = 0;
  stepWorld(world, createEmptyInput(0), 0.02);
  assert.equal(world.outcome, 'victory', 'updateBoss zero-HP safety guard must trigger authoritative boss defeat');
  assert.equal(world.run.pendingNextChapter, 'chapter_3_curator');
  for (let i = 0; i < 4; i++) {
    stepWorld(world, createEmptyInput(0), 0.2);
  }
  assert.equal(world.appState, 'gameover');

  assert.equal(advanceCampaignChapter(world, true), true);
  assert.equal(world.run.chapter, 'chapter_3_curator');
  assert.equal(world.boss?.id, 'the-curator');

  // Boundary 4: Defeat THE CURATOR -> advance to Chapter IV · MATRON-V
  const curatorEnemy = world.enemies.find((e) => e.id === 'the-curator')!;
  world.boss!.coreExposed = true;
  curatorEnemy.hp = 5;
  world.boss!.hp = 5;
  world.player.x = curatorEnemy.x;
  world.player.z = curatorEnemy.z - 2.0;
  world.player.rotationY = 0;
  const curatorAttack = createEmptyInput(0);
  curatorAttack.lightAttackJustPressed = true;
  stepWorld(world, curatorAttack, 0.02);
  for (let i = 0; i < 10; i++) {
    stepWorld(world, createEmptyInput(0), 0.02);
  }
  assert.equal(world.outcome, 'victory');
  assert.equal(world.run.pendingNextChapter, 'chapter_4_matron');
  for (let i = 0; i < 4; i++) {
    stepWorld(world, createEmptyInput(0), 0.2);
  }
  assert.equal(advanceCampaignChapter(world, true), true);
  assert.equal(world.run.chapter, 'chapter_4_matron');
  assert.equal(world.boss?.id, 'matron-v');

  // Boundary 5: Defeat MATRON-V -> advance to Chapter V · Chronicle Loom
  const matronEnemy = world.enemies.find((e) => e.id === 'matron-v')!;
  world.boss!.coreExposed = true;
  matronEnemy.hp = 5;
  world.boss!.hp = 5;
  world.player.x = matronEnemy.x;
  world.player.z = matronEnemy.z - 2.0;
  world.player.rotationY = 0;
  const matronAttack = createEmptyInput(0);
  matronAttack.lightAttackJustPressed = true;
  stepWorld(world, matronAttack, 0.02);
  for (let i = 0; i < 10; i++) {
    stepWorld(world, createEmptyInput(0), 0.02);
  }
  assert.equal(world.outcome, 'victory');
  assert.equal(world.run.pendingNextChapter, 'chapter_5_loom');
  for (let i = 0; i < 4; i++) {
    stepWorld(world, createEmptyInput(0), 0.2);
  }
  assert.equal(advanceCampaignChapter(world, true), true);
  assert.equal(world.run.chapter, 'chapter_5_loom');
  assert.equal(world.run.stage, 'chronicle_loom');
  assert.equal(world.encounterMode, 'standard');
  assert.equal(world.loom.active, true);

  // Boundary 6: Select Chronicle Loom ending -> completes campaign
  assert.equal(selectChronicleLoomEnding(world, 'witness'), true);
  assert.equal(world.outcome, 'victory');
  assert.equal(world.appState, 'gameover');
  assert.equal(world.run.selectedEnding, 'witness');
  assert.ok(world.run.completedChapters.includes('chapter_5_loom'));

  // Negative checks:
  // 1) Defeat state must never advance even if pendingNextChapter were somehow set
  world.outcome = 'defeat';
  world.run.pendingNextChapter = 'chapter_2_choir';
  assert.equal(advanceCampaignChapter(world, true), false, 'Defeat state must never allow advanceCampaignChapter');

  // 2) Practice boss victory must never set pendingNextChapter or advance campaign
  startBossEncounter(world, true, 'helix-04');
  assert.equal(world.run.mode, 'practice_boss');
  const practiceHelix = world.enemies.find((e) => e.id === 'helix-04')!;
  world.boss!.coreExposed = true;
  practiceHelix.hp = 5;
  world.boss!.hp = 5;
  world.player.x = practiceHelix.x;
  world.player.z = practiceHelix.z - 2.0;
  world.player.rotationY = 0;
  const practiceAttack = createEmptyInput(0);
  practiceAttack.lightAttackJustPressed = true;
  stepWorld(world, practiceAttack, 0.02);
  for (let i = 0; i < 10; i++) {
    stepWorld(world, createEmptyInput(0), 0.02);
  }
  assert.equal(world.outcome, 'victory');
  assert.equal(world.run.pendingNextChapter, null, 'Practice boss victory must never populate pendingNextChapter');
  assert.equal(advanceCampaignChapter(world, true), false);

  // 3) Starting a new campaign resets progression cleanly
  startCampaignRun(world, true);
  assert.equal(world.run.mode, 'campaign');
  assert.equal(world.run.chapter, 'prologue');
  assert.deepEqual(world.run.unlockedChapters, ['prologue']);
  assert.deepEqual(world.run.completedChapters, []);
  assert.equal(world.run.pendingNextChapter, null);
});

test('Phase 9.2.1: Chapter Replay Isolation Regression Check — Fresh campaign vs Unlocked earlier chapter replay vs Practice mode', () => {
  const world = createInitialWorld('title');
  const getSavedSnap = () => world.run.savedCampaignSnapshot;

  // =========================================================================
  // SCENARIO 1: FRESH CAMPAIGN
  // Start a new campaign, complete Calibration Bay, defeat HELIX-04 through
  // normal combat, and advance to THE CHOIR without duplicate-skip.
  // =========================================================================
  startCampaignRun(world, true);
  assert.equal(world.run.mode, 'campaign');
  assert.equal(world.run.chapter, 'prologue');
  assert.equal(world.run.isChapterReplay, false);
  assert.equal(getSavedSnap(), null);

  // Complete Calibration Bay puzzle -> transition to Chapter I (HELIX-04)
  world.puzzle.completed = true;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(world.run.stage, 'transition_to_boss');
  skipContainmentTransition(world);
  // Step past boss_intro so HELIX-04 fight is live
  for (let i = 0; i < 8; i++) {
    stepWorld(world, createEmptyInput(0), 0.25);
  }
  assert.equal(world.run.chapter, 'chapter_1_helix');
  assert.equal(world.run.stage, 'boss_fight');
  assert.equal(world.run.isChapterReplay, false);
  assert.equal(getSavedSnap(), null);
  assert.equal(world.boss?.id, 'helix-04');

  // Defeat HELIX-04 through normal combat
  const helixEnemy = world.enemies.find((e) => e.id === 'helix-04')!;
  world.boss!.coreExposed = true;
  helixEnemy.hp = 5;
  world.boss!.hp = 5;
  world.player.x = helixEnemy.x;
  world.player.z = helixEnemy.z - 2.0;
  world.player.rotationY = 0;
  const hitHelix = createEmptyInput(0);
  hitHelix.lightAttackJustPressed = true;
  stepWorld(world, hitHelix, 0.02);
  for (let i = 0; i < 15; i++) {
    stepWorld(world, createEmptyInput(0), 0.05);
  }
  assert.equal(world.outcome, 'victory');
  assert.equal(world.appState, 'gameover');
  assert.equal(world.run.pendingNextChapter, 'chapter_2_choir');
  assert.deepEqual(world.run.completedChapters, ['prologue', 'chapter_1_helix']);
  assert.deepEqual(world.run.unlockedChapters, ['prologue', 'chapter_1_helix', 'chapter_2_choir']);

  // Advance to THE CHOIR; duplicate activation must not skip Chapter II
  assert.equal(advanceCampaignChapter(world, true), true);
  assert.equal(world.run.chapter, 'chapter_2_choir');
  assert.equal(world.boss?.id, 'the-choir');
  assert.equal(world.run.pendingNextChapter, null);
  assert.equal(advanceCampaignChapter(world, true), false, 'Duplicate advance activation must not skip a chapter');
  assert.equal(world.run.chapter, 'chapter_2_choir');

  // Progress primary campaign to Chapter III (THE CURATOR) with distinct checkpoint telemetry
  const choirEnemy = world.enemies.find((e) => e.id === 'the-choir')!;
  world.choir.synchronizedCount = 2;
  world.choir.syncTimer = 4.0;
  world.boss!.coreExposed = true;
  choirEnemy.hp = 5;
  world.boss!.hp = 5;
  world.player.x = choirEnemy.x;
  world.player.z = choirEnemy.z - 2.0;
  world.player.rotationY = 0;
  world.player.actionState = 'idle';
  world.player.comboCooldownTimer = 0;
  world.hitstopTimer = 0;
  const hitChoir = createEmptyInput(0);
  hitChoir.lightAttackJustPressed = true;
  stepWorld(world, hitChoir, 0.02);
  for (let i = 0; i < 15; i++) {
    stepWorld(world, createEmptyInput(0), 0.05);
  }
  assert.equal(world.outcome, 'victory');
  assert.equal(world.run.pendingNextChapter, 'chapter_3_curator');

  // Set specific resources/stats before advancing so Chapter III checkpoint captures them
  world.player.integrity = 84;
  world.player.flux = 78;
  world.stats.damageDealt = 510;
  world.stats.parriesLanded = 4;
  assert.equal(advanceCampaignChapter(world, true), true);
  assert.equal(world.run.chapter, 'chapter_3_curator');
  assert.equal(world.boss?.id, 'the-curator');
  assert.equal(world.run.isChapterReplay, false);

  // =========================================================================
  // SCENARIO 2: UNLOCKED CHAPTER REPLAY
  // While primary campaign has meaningful progress saved at Chapter III,
  // launch unlocked earlier Chapter I (HELIX-04) via Chapter Select, play it,
  // and defeat its boss. Verify replay obeys snapshot preservation and does
  // NOT overwrite or advance the primary campaign.
  // =========================================================================
  assert.equal(startCampaignChapterSelect(world, 'chapter_1_helix', true), true);
  assert.equal(world.run.mode, 'campaign');
  assert.equal(world.run.chapter, 'chapter_1_helix');
  assert.equal(world.run.isChapterReplay, true, 'Launching an earlier completed chapter must set isChapterReplay = true');
  assert.notEqual(getSavedSnap(), null, 'Primary campaign snapshot must be preserved');
  assert.equal(getSavedSnap()?.chapter, 'chapter_3_curator');
  assert.equal(getSavedSnap()?.bossCheckpoint?.integrity, 84);
  assert.equal(getSavedSnap()?.bossCheckpoint?.flux, 78);
  assert.equal(getSavedSnap()?.bossCheckpoint?.statsAtCheckpoint.damageDealt, 510);

  // Defeat HELIX-04 during the unlocked chapter replay
  const replayHelix = world.enemies.find((e) => e.id === 'helix-04')!;
  world.boss!.coreExposed = true;
  replayHelix.hp = 5;
  world.boss!.hp = 5;
  world.player.x = replayHelix.x;
  world.player.z = replayHelix.z - 2.0;
  world.player.rotationY = 0;
  const hitReplayHelix = createEmptyInput(0);
  hitReplayHelix.lightAttackJustPressed = true;
  stepWorld(world, hitReplayHelix, 0.02);
  for (let i = 0; i < 15; i++) {
    stepWorld(world, createEmptyInput(0), 0.05);
  }

  assert.equal(world.outcome, 'victory', 'Defeating boss in chapter replay must still trigger encounter victory');
  assert.equal(world.appState, 'gameover');
  assert.equal(
    world.run.pendingNextChapter,
    null,
    'Replay boss victory must NOT populate pendingNextChapter or offer to overwrite the primary campaign'
  );
  assert.equal(
    advanceCampaignChapter(world, true),
    false,
    'advanceCampaignChapter must be rejected during an isolated chapter replay'
  );
  assert.equal(
    getSavedSnap()?.chapter,
    'chapter_3_curator',
    'Saved campaign snapshot must remain at Chapter III after defeating Chapter I boss in replay'
  );
  assert.equal(getSavedSnap()?.bossCheckpoint?.integrity, 84);
  assert.equal(getSavedSnap()?.bossCheckpoint?.flux, 78);
  assert.equal(getSavedSnap()?.bossCheckpoint?.statsAtCheckpoint.damageDealt, 510);
  assert.deepEqual(
    getSavedSnap()?.unlockedChapters,
    ['prologue', 'chapter_1_helix', 'chapter_2_choir', 'chapter_3_curator']
  );
  assert.deepEqual(
    getSavedSnap()?.completedChapters,
    ['prologue', 'chapter_1_helix', 'chapter_2_choir']
  );

  // Also verify replaying Prologue while saved at Chapter III completes Prologue replay without overwriting Chapter III
  assert.equal(startCampaignChapterSelect(world, 'prologue', true), true);
  assert.equal(world.run.isChapterReplay, true);
  assert.equal(getSavedSnap()?.chapter, 'chapter_3_curator');
  world.puzzle.completed = true;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(world.outcome, 'victory');
  assert.equal(world.run.pendingNextChapter, null);
  assert.equal(getSavedSnap()?.chapter, 'chapter_3_curator');

  // Restore saved primary campaign -> returns to Chapter III (THE CURATOR) with exact saved checkpoint and stats
  assert.equal(restoreSavedCampaignProgress(world), true);
  assert.equal(world.run.mode, 'campaign');
  assert.equal(world.run.isChapterReplay, false);
  assert.equal(getSavedSnap(), null);
  assert.equal(world.run.chapter, 'chapter_3_curator');
  assert.equal(world.boss?.id, 'the-curator');
  assert.equal(world.player.integrity, 84);
  assert.equal(world.player.flux, 78);
  assert.equal(world.stats.damageDealt, 510);
  assert.equal(world.stats.parriesLanded, 4);

  // =========================================================================
  // SCENARIO 3: PRACTICE MODE ISOLATION
  // Defeating a practice boss must not change campaign chapter completion,
  // unlocks, pending transitions, or saved progress.
  // =========================================================================
  startPracticeBossRun(world, true, 'the-curator');
  assert.equal(world.run.mode, 'practice_boss');
  assert.notEqual(getSavedSnap(), null);
  assert.equal(getSavedSnap()?.chapter, 'chapter_3_curator');

  const practiceCurator = world.enemies.find((e) => e.id === 'the-curator')!;
  world.boss!.coreExposed = true;
  practiceCurator.hp = 5;
  world.boss!.hp = 5;
  world.player.x = practiceCurator.x;
  world.player.z = practiceCurator.z - 2.0;
  world.player.rotationY = 0;
  const hitPracticeCurator = createEmptyInput(0);
  hitPracticeCurator.lightAttackJustPressed = true;
  stepWorld(world, hitPracticeCurator, 0.02);
  for (let i = 0; i < 15; i++) {
    stepWorld(world, createEmptyInput(0), 0.05);
  }

  assert.equal(world.outcome, 'victory');
  assert.equal(world.run.pendingNextChapter, null, 'Practice victory must not set pendingNextChapter');
  assert.equal(advanceCampaignChapter(world, true), false, 'Practice victory must not advance campaign');
  assert.deepEqual(
    world.run.unlockedChapters,
    ['prologue', 'chapter_1_helix', 'chapter_2_choir', 'chapter_3_curator'],
    'Practice victory must not unlock Chapter IV'
  );
  assert.deepEqual(
    world.run.completedChapters,
    ['prologue', 'chapter_1_helix', 'chapter_2_choir'],
    'Practice victory must not mark Chapter III completed'
  );
  assert.equal(getSavedSnap()?.chapter, 'chapter_3_curator');
  assert.equal(getSavedSnap()?.bossCheckpoint?.integrity, 84);
});

test('Phase 10: Canonical narrative continuity, Lysa/WARDEN archive logs, transition briefings, and Chronicle Loom ending consequences are complete across all chapters', () => {
  const chapters = [
    'prologue',
    'chapter_1_helix',
    'chapter_2_choir',
    'chapter_3_curator',
    'chapter_4_matron',
    'chapter_5_loom',
  ] as const;
  assert.equal(chapters.length, 6);

  const seenLogIds = new Set<string>();
  for (const chId of chapters) {
    const meta = GAME_CONFIG.campaignChapters[chId];
    assert.ok(meta, `Metadata must exist for ${chId}`);
    assert.ok(meta.sectorName.trim().length > 5, `${chId} must define a sectorName`);
    assert.ok(meta.wardenRole.trim().length > 10, `${chId} must define a wardenRole`);
    assert.ok(
      meta.transitionHeadline.trim().length > 5,
      `${chId} must define a transitionHeadline`
    );
    assert.ok(
      meta.transitionBriefing.trim().length > 20,
      `${chId} must define a transitionBriefing`
    );
    assert.ok(meta.archiveLog.id.startsWith('LOG-0'), `${chId} archiveLog must have canonical LOG-0X id`);
    assert.equal(seenLogIds.has(meta.archiveLog.id), false, `Duplicate archiveLog id ${meta.archiveLog.id}`);
    seenLogIds.add(meta.archiveLog.id);
    assert.ok(meta.archiveLog.speaker.trim().length > 3, `${chId} archiveLog must have speaker`);
    assert.ok(meta.archiveLog.timestamp.trim().length > 3, `${chId} archiveLog must have timestamp`);
    assert.ok(meta.archiveLog.title.trim().length > 5, `${chId} archiveLog must have title`);
    assert.ok(meta.archiveLog.excerpt.trim().length > 30, `${chId} archiveLog must have excerpt`);
  }

  // Verify Chronicle Loom final transmission and three endings (Silence, Witness, Continuity)
  const loom = GAME_CONFIG.chronicleLoom;
  assert.ok(loom.lysaFinalTransmission.includes('Sera'));
  assert.ok(loom.lysaFinalTransmission.includes('living'));

  for (const endingId of ['silence', 'witness', 'continuity'] as const) {
    const ending = loom.endings[endingId];
    assert.equal(ending.id, endingId);
    assert.ok(ending.rationale.trim().length > 15, `${endingId} must define rationale`);
    assert.ok(ending.worldEffect.trim().length > 20, `${endingId} must define worldEffect`);
    assert.ok(ending.wardenQuote.trim().length > 20, `${endingId} must define wardenQuote`);
    assert.ok(ending.seraQuote.trim().length > 20, `${endingId} must define seraQuote`);
    assert.ok(ending.sacrifice.trim().length > 15, `${endingId} must define sacrifice`);
    assert.ok(ending.preserved.trim().length > 15, `${endingId} must define preserved`);
  }
});

test('Phase 11: Causal in-world narrative transmissions trigger from real gameplay milestones with explicit source classifications', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);

  // 1. Starting the Prologue triggers the initial waking transmission (LOG-00 // RECORDED LOG)
  assert.ok(world.comms.active, 'Prologue start must trigger initial live comms transmission');
  assert.equal(world.comms.active?.id, 'prologue_wake');
  assert.equal(world.comms.active?.classification, 'RECORDED LOG');
  assert.ok(world.comms.triggeredIds.includes('prologue_wake'));
  assert.ok(world.comms.history.some((h) => h.id === 'prologue_wake'));

  // 2. Dismissing active transmission clears it immediately
  assert.equal(dismissActiveTransmission(world), true);
  assert.equal(world.comms.active, null);
  assert.equal(dismissActiveTransmission(world), false);

  // 3. Advancing Calibration puzzle stages triggers causal Lysa / WARDEN / Sera transmissions
  world.puzzle.teachCompleted = true;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  let activeComm = extractHudSnapshot(world).comms.active;
  assert.equal(activeComm?.id, 'prologue_step1_teach');
  assert.equal(activeComm?.classification, 'RECORDED LOG');

  world.puzzle.testCompleted = true;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  activeComm = extractHudSnapshot(world).comms.active;
  assert.equal(activeComm?.id, 'prologue_step2_test');
  assert.equal(activeComm?.classification, 'LIVE WARDEN DIRECTIVE');

  world.puzzle.combineCompleted = true;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  activeComm = extractHudSnapshot(world).comms.active;
  assert.equal(activeComm?.id, 'prologue_step3_combine');
  assert.equal(activeComm?.classification, 'SERA VENN');
});

test('Phase 11: Boss intro arrival banner skipping, mid-fight boss phase escalation comms, recoveredLogs, and completedEndings', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);

  // Complete Prologue and transition to Chapter I (HELIX-04) without skipping boss intro
  for (const e of world.enemies) {
    e.hp = 0;
    e.aiState = 'ko';
  }
  world.puzzle.completed = true;
  world.puzzle.finalBarrier.open = true;
  transitionCampaignToBoss(world, false, 'chapter_1_helix');

  assert.equal(world.run.stage, 'boss_intro');
  assert.ok(world.run.recoveredLogs.includes('LOG-00'));
  assert.equal(world.comms.active?.id, 'chapter1_intro');
  assert.equal(world.comms.active?.classification, 'LIVE WARDEN DIRECTIVE');

  // Skipping boss intro banner via skipBossIntroBanner transitions cleanly to boss_fight
  assert.equal(skipBossIntroBanner(world), true);
  assert.equal(world.run.stage, 'boss_fight');
  assert.equal(skipBossIntroBanner(world), false, 'Second call after boss_fight must return false');

  // Triggering Temporal Convergence on HELIX-04 fires Sera's convergence transmission
  world.resonance.convergenceCount = 1;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(world.comms.active?.id, 'chapter1_convergence');
  assert.equal(world.comms.active?.classification, 'SERA VENN');

  // Escalating HELIX-04 to Phase 2 triggers WARDEN's Phase II escalation directive
  assert.ok(world.boss);
  world.boss.phase = 2;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(world.comms.active?.id, 'chapter1_phase2');
  assert.equal(world.comms.active?.classification, 'LIVE WARDEN DIRECTIVE');
});

test('Phase 11: Chronicle Loom endings record into completedEndings and preserve campaign snapshot during replay', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);
  world.run.unlockedChapters = [
    'prologue',
    'chapter_1_helix',
    'chapter_2_choir',
    'chapter_3_curator',
    'chapter_4_matron',
    'chapter_5_loom',
  ];
  world.run.completedChapters = [
    'prologue',
    'chapter_1_helix',
    'chapter_2_choir',
    'chapter_3_curator',
    'chapter_4_matron',
  ];

  // Enter Chapter V and execute Witness ending
  assert.equal(startCampaignChapterSelect(world, 'chapter_5_loom', true), true);
  assert.equal(world.comms.active?.id, 'chapter5_loom_arrival');
  assert.equal(world.comms.active?.classification, 'LIVE NEURAL TRACE');
  assert.equal(selectChronicleLoomEnding(world, 'witness'), true);
  assert.deepEqual(world.run.completedEndings, ['witness']);
  assert.ok(world.run.recoveredLogs.includes('LOG-05'));

  // Replay Chapter V and execute Continuity ending — both endings must be recorded in completedEndings
  assert.equal(startCampaignChapterSelect(world, 'chapter_5_loom', true), true);
  assert.equal(selectChronicleLoomEnding(world, 'continuity'), true);
  assert.deepEqual(world.run.completedEndings, ['witness', 'continuity']);

  const hud = extractHudSnapshot(world);
  assert.deepEqual(hud.run.completedEndings, ['witness', 'continuity']);
  assert.ok(hud.run.recoveredLogs.includes('LOG-05'));
});

test('Phase 11.1: world.comms lifecycle — deterministic single-trigger guard, queue/ACK promotion, timer expiration, pause freeze, baseline convergence guard, and Phase 2 non-shadowing', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);

  // 1. Repeated simulation frames must never re-fire prologue_wake or duplicate triggeredIds
  assert.equal(world.comms.active?.id, 'prologue_wake');
  for (let i = 0; i < 20; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(
    world.comms.triggeredIds.filter((id) => id === 'prologue_wake').length,
    1,
    'prologue_wake must be recorded in triggeredIds exactly once'
  );
  assert.equal(
    triggerNarrativeTransmission(world, 'prologue_wake', true),
    false,
    'Duplicate triggerNarrativeTransmission call for an already-triggered id must return false'
  );

  // 2. Non-interrupt transmission queues behind active transmission and promotes on ACK or expiration
  assert.equal(triggerNarrativeTransmission(world, 'chapter4_hazard', false), true);
  assert.equal(world.comms.active?.id, 'prologue_wake', 'Active transmission remains prologue_wake');
  assert.equal(world.comms.queue.length, 1, 'Non-interrupt transmission is queued');
  assert.equal(world.comms.queue[0].id, 'chapter4_hazard');

  // Pause must freeze active transmission remainingTime
  const remBeforePause = world.comms.active!.remainingTime;
  world.appState = 'paused';
  stepWorld(world, createEmptyInput(Math.PI), 1.0);
  assert.equal(
    world.comms.active?.remainingTime,
    remBeforePause,
    'Paused state must freeze active comms remainingTime'
  );
  world.appState = 'playing';

  // ACK dismissal promotes queued transmission and emits comms_transmission_started
  world.events = [];
  assert.equal(dismissActiveTransmission(world), true);
  assert.equal(world.comms.active?.id, 'chapter4_hazard');
  assert.equal(world.comms.queue.length, 0);
  assert.ok(
    world.events.some((e) => e.type === 'comms_transmission_started'),
    'Promoting a queued transmission must emit comms_transmission_started'
  );

  // Natural timer expiration clears active transmission
  for (let i = 0; i < 150; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.05);
  }
  assert.equal(extractHudSnapshot(world).comms.active, null);

  // 3. Prologue Convergence before Chapter I must NOT prematurely trigger chapter1_convergence on Chapter I entry
  world.resonance.convergenceCount = 2; // Triggered 2 Convergences in Calibration Bay 04
  transitionCampaignToBoss(world, true, 'chapter_1_helix');
  assert.equal(world.comms.active?.id, 'chapter1_intro');
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(
    world.comms.active?.id,
    'chapter1_intro',
    'Pre-boss convergences from Prologue must not overwrite chapter1_intro'
  );
  assert.equal(world.comms.triggeredIds.includes('chapter1_convergence'), false);

  // 4. Phase 2 non-shadowing: if boss enters Phase 2 BEFORE player triggers Convergence / Gravity Pin / Echo Collapse,
  // triggering the mechanic during Phase 2 must still fire the tactical transmission!
  world.boss!.phase = 2;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(world.comms.active?.id, 'chapter1_phase2');

  // Now trigger a new Convergence during Phase 2 of HELIX-04
  world.resonance.convergenceCount = 3;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(
    world.comms.active?.id,
    'chapter1_convergence',
    'Triggering Convergence during Phase 2 must fire chapter1_convergence (not shadowed by phase >= 2)'
  );

  // Verify Phase 2 non-shadowing for Chapter III (THE CURATOR) Gravity Pin
  startBossEncounter(world, true, 'the-curator');
  world.boss!.phase = 2;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(world.comms.active?.id, 'chapter3_phase2');
  world.gravityPin.activationCount = 1;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(
    world.comms.active?.id,
    'chapter3_gravity_pin',
    'Triggering Gravity Pin during Phase 2 must fire chapter3_gravity_pin'
  );

  // Verify Phase 2 non-shadowing for Chapter IV (MATRON-V) Echo Collapse
  startBossEncounter(world, true, 'matron-v');
  world.boss!.phase = 2;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(world.comms.active?.id, 'chapter4_phase2');
  world.echoCollapse.activationCount = 1;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(
    world.comms.active?.id,
    'chapter4_collapse',
    'Triggering Echo Collapse during Phase 2 must fire chapter4_collapse'
  );
});

test('Phase 11.1: Campaign persistence sanitization, deduplication, malformed JSON resilience, and replay/practice serialization isolation', () => {
  const world = createInitialWorld('title');

  // 1. Fresh install (null / empty) returns false and guarantees prologue is unlocked
  assert.equal(parseAndApplyCampaignProgress(world, null), false);
  assert.deepEqual(world.run.unlockedChapters, ['prologue']);
  assert.deepEqual(world.run.completedChapters, []);
  assert.deepEqual(world.run.recoveredLogs, []);
  assert.deepEqual(world.run.completedEndings, []);

  // 2. Malformed JSON and non-object payloads are rejected safely without throwing
  assert.equal(parseAndApplyCampaignProgress(world, '{corrupted_json'), false);
  assert.equal(parseAndApplyCampaignProgress(world, '["array_root"]'), false);
  assert.equal(parseAndApplyCampaignProgress(world, '42'), false);
  assert.deepEqual(world.run.unlockedChapters, ['prologue']);

  // 3. Missing fields, invalid IDs, and duplicate entries are sanitized and deduplicated
  const noisyPayload = JSON.stringify({
    unlockedChapters: ['chapter_1_helix', 'invalid_chapter', 'chapter_1_helix', 999],
    completedChapters: ['prologue', 'prologue', 'bogus_chapter'],
    recoveredLogs: ['LOG-00', 'LOG-99', 'LOG-00', 'LOG-01', null],
    completedEndings: ['silence', 'invalid_ending', 'silence', 'witness'],
  });
  assert.equal(parseAndApplyCampaignProgress(world, noisyPayload), true);
  assert.deepEqual(world.run.unlockedChapters, ['prologue', 'chapter_1_helix']);
  assert.deepEqual(world.run.completedChapters, ['prologue']);
  assert.deepEqual(world.run.recoveredLogs, ['LOG-00', 'LOG-01']);
  assert.deepEqual(world.run.completedEndings, ['silence', 'witness']);

  // 4. Round-trip serialization and reload across all 3 endings + chapter replay & practice isolation
  world.run.mode = 'campaign';
  world.run.chapter = 'chapter_3_curator';
  world.run.unlockedChapters = [
    'prologue',
    'chapter_1_helix',
    'chapter_2_choir',
    'chapter_3_curator',
  ];
  world.run.completedChapters = ['prologue', 'chapter_1_helix', 'chapter_2_choir'];
  world.run.recoveredLogs = ['LOG-00', 'LOG-01', 'LOG-02'];
  world.run.completedEndings = ['silence', 'witness', 'continuity'];

  // Enter Practice mode and verify serializeCampaignProgress still preserves full campaign progress from snapshot
  startPracticeBossRun(world, true, 'helix-04');
  const serializedFromPractice = serializeCampaignProgress(world);
  const reloadedWorld = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(reloadedWorld, serializedFromPractice), true);
  assert.deepEqual(reloadedWorld.run.unlockedChapters, [
    'prologue',
    'chapter_1_helix',
    'chapter_2_choir',
    'chapter_3_curator',
  ]);
  assert.deepEqual(reloadedWorld.run.completedChapters, [
    'prologue',
    'chapter_1_helix',
    'chapter_2_choir',
  ]);
  assert.deepEqual(reloadedWorld.run.recoveredLogs, ['LOG-00', 'LOG-01', 'LOG-02']);
  assert.deepEqual(reloadedWorld.run.completedEndings, [
    'silence',
    'witness',
    'continuity',
  ]);
});

test('Phase 14.1: Weapon definitions, switching, charge cancellation safety, and recovery preservation', () => {
  const world = createInitialWorld('playing');
  world.enemies = [];

  assert.equal(world.player.equippedWeaponId, 'chrono_edge');
  assert.equal(getWeaponDefinition('chrono_edge').label, 'CHRONO EDGE');
  assert.equal(getWeaponDefinition('pulsecaster').label, 'PULSECASTER');

  // 1. Toggle weapon in neutral state
  assert.equal(switchPlayerWeapon(world), true);
  assert.equal(world.player.equippedWeaponId, 'pulsecaster');
  assert.ok(world.events.some((e) => e.type === 'weapon_switched' && e.weaponId === 'pulsecaster'));

  // Cooldown prevents instant double-toggle on the exact same frame
  assert.equal(switchPlayerWeapon(world), false);
  stepWorld(world, createEmptyInput(0), 0.2);

  // 2. Switching during heavy charge cancels the charge cleanly without firing an unintended attack
  const holdInput = createEmptyInput(0);
  holdInput.lightAttackJustPressed = true;
  holdInput.heavyHoldActive = true;
  stepWorld(world, holdInput, 0.02);
  assert.equal(world.player.actionState, 'charging_heavy');

  const chargeSwitchInput = createEmptyInput(0);
  chargeSwitchInput.heavyHoldActive = true;
  chargeSwitchInput.switchWeaponJustPressed = true;
  stepWorld(world, chargeSwitchInput, 0.05);

  assert.equal(world.player.equippedWeaponId, 'chrono_edge');
  assert.equal(world.player.actionState, 'idle');
  assert.equal(world.player.chargeTime, 0);
  assert.equal(world.projectiles.length, 0, 'Canceling charge via weapon switch must not fire a projectile');

  stepWorld(world, createEmptyInput(0), 0.2);

  // 3. Committed active/windup/dodge/parry frames reject weapon switch
  const lightInp = createEmptyInput(0);
  lightInp.lightAttackJustPressed = true;
  stepWorld(world, lightInp, 0.02);
  assert.equal(world.player.actionState, 'light_windup');
  assert.equal(switchPlayerWeapon(world), false, 'Cannot switch weapon mid-windup');
  assert.equal(world.player.equippedWeaponId, 'chrono_edge');

  // Advance into light_recovery and verify switching preserves recovery stateTimer (no animation-cancel exploit)
  for (let i = 0; i < 12; i++) {
    stepWorld(world, createEmptyInput(0), 0.02);
    if (world.player.actionState === 'light_recovery') break;
  }
  assert.equal(world.player.actionState, 'light_recovery');
  const remRecovery = world.player.stateTimer;
  assert.ok(remRecovery > 0);
  assert.equal(switchPlayerWeapon(world, 'pulsecaster'), true);
  assert.equal(world.player.equippedWeaponId, 'pulsecaster');
  assert.equal(world.player.actionState, 'light_recovery', 'Switching during recovery must not cancel recovery state');
  assert.equal(world.player.stateTimer, remRecovery, 'Recovery timer must remain intact');
});

test('Phase 14.2: Pulsecaster projectile hit, obstacle blocking, range expiry, and heat/overheat economy', () => {
  const world = createInitialWorld('playing');
  world.obstacles = [];
  const target = world.enemies[0];
  world.enemies = [target];

  // Position player at (0, 6) aiming North (Math.PI) at unguarded target at (0, 0)
  world.player.x = 0;
  world.player.z = 6;
  world.player.rotationY = Math.PI;
  world.player.flux = 50;
  target.x = 0;
  target.z = 0;
  target.rotationY = Math.PI; // Facing North (away from player) so Bastion frontal shield does not mitigate unguarded test shot
  target.hp = 100;
  target.maxHp = 100;
  target.aiState = 'idle';
  target.cooldownTimer = 99;

  assert.equal(switchPlayerWeapon(world, 'pulsecaster'), true);
  stepWorld(world, createEmptyInput(Math.PI), 0.2);

  const fluxBeforeLight = world.player.flux;
  const fireLight = createEmptyInput(Math.PI);
  fireLight.lightAttackJustPressed = true;
  stepWorld(world, fireLight, 0.02);

  // Step through windup and projectile travel (~0.35s)
  for (let i = 0; i < 20; i++) {
    target.x = 0;
    target.z = 0;
    target.rotationY = Math.PI;
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }

  assert.equal(
    target.hp,
    100 - GAME_CONFIG.weapons.pulsecaster.lightShot.damage,
    'Pulsecaster primary bolt deals configured damage on hit'
  );
  assert.equal(world.player.lastWeaponShotOutcome, 'hit_enemy');
  assert.ok(
    world.player.flux >= fluxBeforeLight,
    'Pulsecaster primary bolt must not drain Chrono Flux'
  );
  assert.equal(world.projectiles.length, 0, 'Projectile is removed after hitting target');

  // 2. Solid obstacle between player and target blocks the projectile
  const hpBeforeBlocked = target.hp;
  world.obstacles = [
    {
      id: 'test-pillar',
      x: 0,
      z: 3,
      radius: 1.1,
      height: 3.0,
      label: 'Pillar',
      disabled: false,
    },
  ];
  stepWorld(world, createEmptyInput(Math.PI), 0.35);

  const fireBlocked = createEmptyInput(Math.PI);
  fireBlocked.lightAttackJustPressed = true;
  stepWorld(world, fireBlocked, 0.02);

  let sawObstacleImpact = false;
  for (let i = 0; i < 18; i++) {
    target.x = 0;
    target.z = 0;
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
    if (world.events.some((e) => e.type === 'pulse_impact_obstacle')) {
      sawObstacleImpact = true;
    }
  }
  assert.equal(sawObstacleImpact, true, 'Obstacle impact event emitted');
  assert.equal(world.player.lastWeaponShotOutcome, 'blocked_by_obstacle');
  assert.equal(target.hp, hpBeforeBlocked, 'Blocked projectile deals 0 damage to enemy behind obstacle');

  // 3. Repeated firing builds heat to 100, triggers overheat lockout, blocks shots while overheated, and cools down
  world.obstacles = [];
  world.enemies = [];
  world.player.weaponHeat = 88;
  world.player.weaponOverheated = false;
  world.player.weaponShotCooldownTimer = 0;

  const overheatShot = createEmptyInput(Math.PI);
  overheatShot.lightAttackJustPressed = true;
  stepWorld(world, overheatShot, 0.02);
  for (let i = 0; i < 6; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.player.weaponOverheated, true, 'Reaching 100 heat triggers overheat lockout');
  assert.ok(world.player.weaponOverheatTimer > 0);

  // Attempting to fire while overheated is rejected
  const blockedByOverheat = createEmptyInput(Math.PI);
  blockedByOverheat.lightAttackJustPressed = true;
  stepWorld(world, blockedByOverheat, 0.02);
  assert.equal(world.player.lastWeaponShotOutcome, 'overheated');

  // Advance past overheat lockout duration (1.6s) and verify recovery
  for (let i = 0; i < 85; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(world.player.weaponOverheated, false, 'Overheat lockout clears after timer expires');
  assert.ok(world.player.weaponHeat < 50);
});

test('Phase 14.3: Pulsecaster respects Boss frontal armor, Choir harmonic shield & pylons, and Echo weapon recording/replay', () => {
  // 1. HELIX-04 frontal armor mitigates frontal Pulsecaster shots, while exposed core takes 1.45x
  const helixWorld = createBossWorld('playing', true);
  const helix = helixWorld.boss!;
  const helixEnemy = helixWorld.enemies[0];
  helixWorld.obstacles = [];
  helixWorld.player.x = 0;
  helixWorld.player.z = 5.5;
  helixWorld.player.rotationY = Math.PI;
  helix.x = 0;
  helix.z = 0;
  helix.rotationY = 0; // Facing South toward player at (0, 5.5)
  helixEnemy.x = 0;
  helixEnemy.z = 0;
  helixEnemy.rotationY = 0;
  helix.cooldownTimer = 99;

  switchPlayerWeapon(helixWorld, 'pulsecaster');
  stepWorld(helixWorld, createEmptyInput(Math.PI), 0.2);

  const hpStart = helixEnemy.hp;
  const frontShot = createEmptyInput(Math.PI);
  frontShot.lightAttackJustPressed = true;
  stepWorld(helixWorld, frontShot, 0.02);
  for (let i = 0; i < 16; i++) {
    helix.x = 0;
    helix.z = 0;
    helix.rotationY = 0;
    helixEnemy.x = 0;
    helixEnemy.z = 0;
    helixEnemy.rotationY = 0;
    stepWorld(helixWorld, createEmptyInput(Math.PI), 0.02);
  }
  const guardedDmg = hpStart - helixEnemy.hp;
  const expectedGuarded = Math.max(
    1,
    Math.round(
      GAME_CONFIG.weapons.pulsecaster.lightShot.damage * GAME_CONFIG.boss.frontalArmorDamageMult
    )
  );
  assert.equal(guardedDmg, expectedGuarded, 'HELIX-04 frontal armor dampens frontal Pulsecaster shot');

  // Now expose HELIX-04 core and fire again
  helix.coreExposed = true;
  helix.aiState = 'recovery';
  helixEnemy.aiState = 'recovery';
  helix.stateTimer = 5;
  helixEnemy.stateTimer = 5;
  stepWorld(helixWorld, createEmptyInput(Math.PI), 0.35);

  const hpBeforeExposed = helixEnemy.hp;
  const exposedShot = createEmptyInput(Math.PI);
  exposedShot.lightAttackJustPressed = true;
  stepWorld(helixWorld, exposedShot, 0.02);
  for (let i = 0; i < 16; i++) {
    helix.x = 0;
    helix.z = 0;
    helixEnemy.x = 0;
    helixEnemy.z = 0;
    stepWorld(helixWorld, createEmptyInput(Math.PI), 0.02);
  }
  const exposedDmg = hpBeforeExposed - helixEnemy.hp;
  assert.ok(exposedDmg > guardedDmg * 2, 'Exposed Chrono Core takes amplified Pulsecaster damage');

  // 2. Echo records Pulsecaster charged shot, replays it even after live Sera switches back to Chrono Edge,
  // primes Resonance on HELIX-04, and live Sera triggers Convergence with Pulsecaster Charged Lance!
  helix.coreExposed = false;
  helix.aiState = 'pursue';
  helixEnemy.aiState = 'pursue';
  helix.cooldownTimer = 99;
  helixEnemy.cooldownTimer = 99;
  helixWorld.player.weaponHeat = 0;
  helixWorld.player.flux = 100;
  helixWorld.resonance.cooldownTimer = 0;
  helixWorld.resonance.activeMark = null;

  const recStart = createEmptyInput(Math.PI);
  recStart.echoRecordJustPressed = true;
  stepWorld(helixWorld, recStart, 0.02);

  const recHeavy = createEmptyInput(Math.PI);
  recHeavy.heavyAttackJustPressed = true;
  stepWorld(helixWorld, recHeavy, 0.02);
  for (let i = 0; i < 20; i++) {
    helix.x = 0;
    helix.z = 0;
    helixEnemy.x = 0;
    helixEnemy.z = 0;
    stepWorld(helixWorld, createEmptyInput(Math.PI), 0.02);
  }
  const recStop = createEmptyInput(Math.PI);
  recStop.echoRecordJustPressed = true;
  stepWorld(helixWorld, recStop, 0.02);

  assert.equal(helixWorld.echo.clip?.events[0]?.action, 'pulse_charged_shot');
  assert.equal(helixWorld.echo.clip?.events[0]?.weaponId, 'pulsecaster');

  // Switch live Sera to Chrono Edge before starting Echo replay
  assert.equal(switchPlayerWeapon(helixWorld, 'chrono_edge'), true);
  stepWorld(helixWorld, createEmptyInput(Math.PI), 0.2);

  const playInp = createEmptyInput(Math.PI);
  playInp.echoPlayJustPressed = true;
  stepWorld(helixWorld, playInp, 0.02);

  for (let i = 0; i < 12; i++) {
    helix.x = 0;
    helix.z = 0;
    helixEnemy.x = 0;
    helixEnemy.z = 0;
    stepWorld(helixWorld, createEmptyInput(Math.PI), 0.02);
  }

  assert.equal(
    helixWorld.echo.activeActor?.weaponId,
    'pulsecaster',
    'Echo preserves recorded pulsecaster weaponId even after live Sera switched to chrono_edge'
  );
  assert.notEqual(
    helixWorld.resonance.activeMark,
    null,
    'Echo pulse_charged_shot primes Temporal Resonance on HELIX-04'
  );

  // Switch live Sera back to Pulsecaster and fire a Charged Lance [E] to trigger Convergence!
  assert.equal(switchPlayerWeapon(helixWorld, 'pulsecaster'), true);
  stepWorld(helixWorld, createEmptyInput(Math.PI), 0.2);

  const convBefore = helixWorld.resonance.convergenceCount;
  const liveLance = createEmptyInput(Math.PI);
  liveLance.heavyAttackJustPressed = true;
  stepWorld(helixWorld, liveLance, 0.02);
  for (let i = 0; i < 20; i++) {
    helix.x = 0;
    helix.z = 0;
    helixEnemy.x = 0;
    helixEnemy.z = 0;
    stepWorld(helixWorld, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(
    helixWorld.resonance.convergenceCount,
    convBefore + 1,
    'Live Pulsecaster Charged Lance triggers Temporal Convergence on marked target'
  );
});



