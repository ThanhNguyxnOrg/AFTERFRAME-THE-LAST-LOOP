import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MESHY_SLOT_SPECS,
  computeMeshyNormalizationTransform,
  getMeshySlotSpec,
  isValidMeshySlotId,
} from './meshy-assets.ts';
import {
  advanceArtilleryZones,
  advanceConductorTethers,
  applyEnemyModifier,
  createEnemy,
  createInitialWorld,
  extractHudSnapshot,
  isEnemyProtectedByConductor,
  severConductorTether,
  startAuthoredEncounter,
  startRecursionProtocol,
  stepWorld,
} from './simulation.ts';
import type { PlayerInputFrame } from './types.ts';

function idleInput(): PlayerInputFrame {
  return {
    moveX: 0,
    moveZ: 0,
    aimYaw: 0,
    aimPitch: 0,
    aimWorldX: 0,
    aimWorldZ: 0,
    lightAttackJustPressed: false,
    heavyAttackJustPressed: false,
    heavyHoldActive: false,
    heavyJustReleased: false,
    dodgeJustPressed: false,
    parryJustPressed: false,
    echoRecordJustPressed: false,
    echoPlayJustPressed: false,
    echoClearJustPressed: false,
    echoRelayJustPressed: false,
    gravityPinJustPressed: false,
    echoCollapseJustPressed: false,
    interactJustPressed: false,
    lockOnToggleJustPressed: false,
    lockOnCycleJustPressed: false,
    switchWeaponJustPressed: false,
    selectWeaponId: null,
  };
}

test('Apex Bestiary Trial spawns Phase Stalker, Siege Mortar Tripod, Harmonic Conductor, and Overclocked elite', () => {
  const world = createInitialWorld('playing');
  const ok = startAuthoredEncounter(world, 'tactical_apex_bestiary');
  assert.equal(ok, true);
  assert.equal(world.enemies.length, 4);

  const archetypes = world.enemies.map((e) => e.archetype);
  assert.ok(archetypes.includes('phase_stalker'));
  assert.ok(archetypes.includes('chrono_mortar'));
  assert.ok(archetypes.includes('resonance_warden'));

  const elite = world.enemies.find((e) => e.modifier === 'overclocked');
  assert.ok(elite, 'Wave 1 should include an overclocked elite unit');
  assert.equal(world.gravityPin.unlocked, true);
  assert.equal(world.echoCollapse.unlocked, true);
});

test('Phase Stalker performs flank blink teleport and emits phase_stalker_blink', () => {
  const world = createInitialWorld('playing');
  world.player.x = 0;
  world.player.z = 0;
  world.player.rotationY = 0;
  const stalker = createEnemy('stalker-test', 'phase_stalker', 0, -7.2, 0);
  stalker.blinkCooldownTimer = 0;
  stalker.cooldownTimer = 0;
  world.enemies = [stalker];
  world.stats.damageDealt = 1; // exit calibration perimeter hold

  stepWorld(world, idleInput(), 0.05);

  const blinkEv = world.events.find((ev) => ev.type === 'phase_stalker_blink');
  assert.ok(blinkEv, 'Phase Stalker should emit phase_stalker_blink');
  assert.equal(stalker.aiState, 'telegraph');
  assert.ok((stalker.blinkCooldownTimer ?? 0) > 3.5);
  assert.ok(Math.hypot(stalker.x - world.player.x, stalker.z - world.player.z) < 4.0);
});

test('Chrono Mortar fires 3-zone artillery barrage and detonates to damage player inside blast radius', () => {
  const world = createInitialWorld('playing');
  world.player.x = 0;
  world.player.z = 0;
  world.player.integrity = 100;
  const mortar = createEnemy('mortar-test', 'chrono_mortar', 0, -9.0, 0);
  mortar.aiState = 'telegraph';
  mortar.stateDuration = 0.2;
  mortar.stateTimer = 0.02;
  mortar.targetX = 0;
  mortar.targetZ = 0;
  mortar.telegraphLocked = true;
  world.enemies = [mortar];
  world.stats.damageDealt = 1;

  // Transition telegraph -> attack -> fire barrage
  stepWorld(world, idleInput(), 0.04);
  stepWorld(world, idleInput(), 0.04);

  assert.equal(world.artilleryZones?.length, 3, 'Chrono Mortar should spawn 3 artillery blast zones');
  const firedEv = world.events.find((ev) => ev.type === 'chrono_mortar_barrage_fired');
  assert.ok(firedEv, 'Should emit chrono_mortar_barrage_fired');

  // Advance timers until first central zone detonates
  const prevIntegrity = world.player.integrity;
  let sawDetonation = false;
  for (let i = 0; i < 32; i++) {
    advanceArtilleryZones(world, 0.05);
    if (world.events.some((ev) => ev.type === 'chrono_mortar_detonated')) {
      sawDetonation = true;
    }
  }
  assert.equal(sawDetonation, true, 'Artillery zone should emit chrono_mortar_detonated');
  assert.ok(world.player.integrity < prevIntegrity, 'Player standing in mortar blast ring should take damage');
});

test('Harmonic Conductor tethers ally for healing + 25% DR, and severing deals +18 Stagger', () => {
  const world = createInitialWorld('playing');
  const ally = createEnemy('ally-bastion', 'bastion', 0, -3.5, 0);
  ally.hp = 60;
  const conductor = createEnemy('conductor-1', 'resonance_warden', 3.5, -3.5, 0);
  world.enemies = [ally, conductor];

  advanceConductorTethers(world, 1.0);
  assert.equal(conductor.tetherTargetId, ally.id);
  assert.equal(isEnemyProtectedByConductor(world, ally.id), true);
  assert.ok(ally.hp > 60, 'Tethered ally should regenerate HP');

  // Verify HUD reflects isTetherProtected
  world.player.x = 0;
  world.player.z = -1.5;
  const hud = extractHudSnapshot(world);
  assert.equal(hud.focusedEnemy?.id, ally.id);
  assert.equal(hud.focusedEnemy?.isTetherProtected, true);

  // Severing tether blasts linked ally with +18 Stagger
  const severed = severConductorTether(world, conductor);
  assert.equal(severed, true);
  assert.equal(conductor.tetherTargetId, null);
  assert.equal(ally.stagger, 18);
  assert.ok(world.events.some((ev) => ev.type === 'conductor_tether_severed'));
});

test('Elite Modifiers apply phase_shielded stagger boost and volatile KO detonation damages nearby enemies', () => {
  const world = createInitialWorld('playing');
  const shielded = createEnemy('elite-shield', 'scrapper', -3, -3, 0);
  const baseMaxStagger = shielded.maxStagger;
  applyEnemyModifier(shielded, 'phase_shielded');
  assert.equal(shielded.maxStagger, Math.round(baseMaxStagger * 1.25));

  const volatileUnit = createEnemy('elite-vol', 'scrapper', 0, 1.8, Math.PI);
  applyEnemyModifier(volatileUnit, 'volatile');
  volatileUnit.hp = 1;

  const bystander = createEnemy('bystander', 'bastion', 1.2, 1.8, Math.PI);
  const bystanderStartHp = bystander.hp;
  world.enemies = [volatileUnit, bystander];
  world.obstacles = [];
  world.player.x = 0;
  world.player.z = 0;
  world.player.rotationY = 0; // facing +Z toward volatileUnit

  // Strike volatile unit to KO it
  const strikeInput = idleInput();
  strikeInput.aimYaw = 0;
  strikeInput.aimWorldX = 0;
  strikeInput.aimWorldZ = 1.8;
  strikeInput.lightAttackJustPressed = true;
  stepWorld(world, strikeInput, 0.05);
  for (let i = 0; i < 8 && volatileUnit.hp > 0; i++) {
    stepWorld(world, idleInput(), 0.05);
  }
  assert.equal(volatileUnit.hp, 0, 'Volatile unit should be KOed');
  assert.ok(
    (world.artilleryZones ?? []).some((z) => z.kind === 'volatile_core'),
    'KOing a volatile unit should spawn a volatile_core blast zone'
  );

  // Detonate volatile_core
  for (let i = 0; i < 25; i++) {
    advanceArtilleryZones(world, 0.05);
  }
  assert.ok(
    bystander.hp < bystanderStartHp,
    'Volatile core blast should damage nearby enemy bystander'
  );
  assert.ok(world.events.some((ev) => ev.type === 'volatile_core_detonated'));
});

test('Recursion Mode integrates new enemy archetypes cleanly', () => {
  const world = createInitialWorld('playing');
  startRecursionProtocol(world);
  assert.equal(world.run.mode, 'recursion');
  assert.ok(world.enemies.length >= 2);
});

test('Meshy 3D asset catalog & pure bounding-box normalization math work deterministically', () => {
  assert.equal(MESHY_SLOT_SPECS.length, 10);
  assert.equal(isValidMeshySlotId('player'), true);
  assert.equal(isValidMeshySlotId('phase_stalker'), true);
  assert.equal(isValidMeshySlotId('not_a_slot'), false);

  for (const spec of MESHY_SLOT_SPECS) {
    assert.ok(spec.targetHeight > 0.5 && spec.targetHeight < 10);
    assert.ok(spec.meshyPrompt.length > 40, `Slot ${spec.id} must include a detailed Meshy prompt`);
    assert.equal(getMeshySlotSpec(spec.id)?.id, spec.id);
  }

  // Raw Meshy export sitting from y = -1.0 to y = +3.0 (height 4.0) centered at x=2, z=-4
  // Target height = 2.0 -> uniform scale = 0.5, grounded so y_min aligns to y=0, x/z centered at 0
  const norm = computeMeshyNormalizationTransform(
    { x: 1, y: -1, z: -5 },
    { x: 3, y: 3, z: -3 },
    2.0,
    90
  );
  assert.equal(norm.scale, 0.5);
  assert.equal(norm.offsetX, -1); // -(2) * 0.5
  assert.equal(norm.offsetY, 0.5); // -(-1) * 0.5 -> bottom moves from -0.5 to 0
  assert.equal(norm.offsetZ, 2); // -(-4) * 0.5
  assert.ok(Math.abs(norm.rotationY - Math.PI / 2) < 1e-6);
});
