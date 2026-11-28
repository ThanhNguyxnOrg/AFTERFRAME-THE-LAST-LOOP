import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  computeLoadoutPresetsStamp,
  computeMasteryPersistenceStamp,
  createHudSyncTracker,
  evaluateHudSyncTick,
} from './hud-sync.ts';
import {
  claimAllReadyMasteryBounties,
  claimCombatMasteryBounty,
  computeMasterySealModifiers,
  recordCombatMasteryVictory,
  tryTriggerTemporalSlip,
} from './combat-mastery.ts';
import {
  SOVEREIGN_ASTRAL_PULSE_CONFIG,
  applySovereignAstralPulse,
  createInitialWorld,
} from './simulation.ts';
import { createSeraPlayerRig } from './models.ts';
import type { RunSummary } from './types.ts';

const PERFECT_RUN_SUMMARY: RunSummary = {
  outcome: 'victory',
  chapter: 'prologue',
  bossId: 'helix-04',
  selectedEnding: null,
  elapsedTime: 22.5,
  enemiesDefeated: 4,
  totalEnemies: 4,
  damageDealt: 960,
  damageTaken: 0,
  parriesLanded: 4,
  perfectDodges: 3,
  vulnerableHits: 5,
  convergencesTriggered: 2,
  relaysUsed: 2,
  remainingTargetHp: 0,
};

test('HudSyncTracker stays silent on idle title ticks and flags immediate HUD & persistence changes', () => {
  const world = createInitialWorld('title');
  const tracker = createHudSyncTracker(world);

  const idle1 = evaluateHudSyncTick(tracker, world, null, false, 16);
  assert.equal(idle1.shouldSyncHud, false);
  assert.equal(idle1.persistenceChanged, false);

  const idle2 = evaluateHudSyncTick(tracker, world, null, false, 200);
  assert.equal(idle2, idle1, 'evaluateHudSyncTick reuses a shared zero-GC result object');
  assert.equal(idle2.shouldSyncHud, false);
  assert.equal(idle2.persistenceChanged, false);

  world.appState = 'playing';
  world.player.integrity = 82.4;
  const activeTick = evaluateHudSyncTick(tracker, world, null, false, 216);
  assert.equal(activeTick.shouldSyncHud, true);
  assert.equal(activeTick.persistenceChanged, true);

  // Subsequent frame with no living enemies and no discrete state changes stays quiet
  world.enemies = [];
  world.boss = null;
  world.comms.active = null;
  world.run.stage = 'calibration';
  evaluateHudSyncTick(tracker, world, null, false, 232);

  const quietPlayTick = evaluateHudSyncTick(tracker, world, null, false, 248);
  assert.equal(quietPlayTick.shouldSyncHud, false);
  assert.equal(quietPlayTick.persistenceChanged, false);

  // Discrete weapon swap triggers immediate HUD sync without persistence write
  world.player.equippedWeaponId = 'pulsecaster';
  const swapTick = evaluateHudSyncTick(tracker, world, null, false, 264);
  assert.equal(swapTick.shouldSyncHud, true);
  assert.equal(swapTick.persistenceChanged, false);
});

test('HudSyncTracker detects Sovereign Combat Mastery clear & bounty claim persistence changes', () => {
  const world = createInitialWorld('title');
  world.progression.combatMastery = {};
  const tracker = createHudSyncTracker(world);

  const baseStamp = computeMasteryPersistenceStamp(world.progression.combatMastery);
  assert.equal(baseStamp, 0);

  const clearOutcome = recordCombatMasteryVictory(
    world.progression.combatMastery,
    ['boss_helix_04'],
    PERFECT_RUN_SUMMARY
  );
  world.progression.combatMastery = clearOutcome.ledger;
  const afterClearStamp = computeMasteryPersistenceStamp(world.progression.combatMastery);
  assert.ok(afterClearStamp > baseStamp, 'Mastery clear updates persistence stamp');

  const clearSync = evaluateHudSyncTick(tracker, world, null, false, 100);
  assert.equal(clearSync.persistenceChanged, true);
  assert.equal(clearSync.shouldSyncHud, true);

  const claimRes = claimCombatMasteryBounty(
    world.progression.combatMastery,
    'boss_helix_04',
    's_rank'
  );
  assert.equal(claimRes.claimed, true);
  world.progression.combatMastery = claimRes.ledger;
  world.progression.memoryFragments += claimRes.fragmentsAwarded;

  const claimSync = evaluateHudSyncTick(tracker, world, null, false, 120);
  assert.equal(claimSync.persistenceChanged, true);
  assert.equal(claimSync.shouldSyncHud, true);

  assert.ok(computeLoadoutPresetsStamp(world.progression.loadoutPresets) >= 0);
});

test('applySovereignAstralPulse scales Chrono damage and stagger by Mastery Seal tier (0..4)', () => {
  const world = createInitialWorld('playing');
  world.outcome = 'none';
  world.player.x = 0;
  world.player.z = 0;
  world.events = [];

  const baseEnemy = world.enemies[0];
  assert.ok(baseEnemy, 'Initial playing world spawns at least one enemy');

  const nearEnemy = {
    ...baseEnemy,
    id: 'pulse-near',
    x: 3.2,
    z: 0,
    hp: 200,
    maxHp: 200,
    stagger: 0,
    maxStagger: 100,
    aiState: 'pursue' as const,
  };
  const farEnemy = {
    ...baseEnemy,
    id: 'pulse-far',
    x: 12.5,
    z: 0,
    hp: 200,
    maxHp: 200,
    stagger: 0,
    maxStagger: 100,
    aiState: 'pursue' as const,
  };
  world.enemies = [nearEnemy, farEnemy];
  world.boss = null;

  // Tier 0: zero pulse, preserves legacy unsealed combat determinism
  const hitsTier0 = applySovereignAstralPulse(world, 0);
  assert.equal(hitsTier0, 0);
  assert.equal(nearEnemy.hp, 200);
  assert.equal(
    world.events.some((ev) => ev.type === 'sovereign_astral_pulse'),
    false
  );

  // Tier 3: 54 Chrono DMG + 24 Stagger within 5.8m radius, ignores far enemy
  const hitsTier3 = applySovereignAstralPulse(world, 3);
  assert.equal(hitsTier3, 1);
  assert.equal(nearEnemy.hp, 200 - SOVEREIGN_ASTRAL_PULSE_CONFIG.damagePerTier * 3);
  assert.equal(nearEnemy.stagger, SOVEREIGN_ASTRAL_PULSE_CONFIG.staggerPerTier * 3);
  assert.equal(farEnemy.hp, 200);
  assert.equal(farEnemy.stagger, 0);
  assert.equal(
    world.events.some(
      (ev) =>
        ev.type === 'sovereign_astral_pulse' &&
        ev.amount === SOVEREIGN_ASTRAL_PULSE_CONFIG.damagePerTier * 3
    ),
    true
  );
});

test('Temporal Slip + Mastery Seal Tier >= 1 unleashes Sovereign Astral Pulse', () => {
  const world = createInitialWorld('playing');
  world.outcome = 'none';
  world.player.x = 0;
  world.player.z = 0;
  world.player.temporalSlipCooldown = 0;
  world.player.temporalSlipTimer = 0;
  world.events = [];

  const rec = recordCombatMasteryVictory(
    {},
    ['sector_prologue', 'boss_helix_04'],
    PERFECT_RUN_SUMMARY
  );
  const claimed = claimAllReadyMasteryBounties(rec.ledger);
  assert.equal(claimed.claimedCount, 4, '4 claimed seals unlocks Mastery Seal Tier 1');
  world.progression.combatMastery = claimed.ledger;

  const seal = computeMasterySealModifiers(world.progression.combatMastery);
  assert.equal(seal.tier, 1);

  const target = world.enemies[0];
  target.x = 2.4;
  target.z = 0;
  target.hp = 150;
  target.maxHp = 150;
  target.stagger = 0;
  target.aiState = 'pursue';
  world.enemies = [target];
  world.boss = null;

  const slip = tryTriggerTemporalSlip(world.player, seal.bonusSlipDurationSec);
  assert.equal(slip.triggered, true);
  assert.equal(slip.durationSec, 1.5);
  if (seal.tier >= 1) {
    applySovereignAstralPulse(world, seal.tier);
  }
  assert.equal(target.hp, 150 - SOVEREIGN_ASTRAL_PULSE_CONFIG.damagePerTier);
  assert.equal(
    world.events.some((ev) => ev.type === 'sovereign_astral_pulse'),
    true
  );
});

test('createSeraPlayerRig builds composite SovereignAstralCrownRig with 8-slot InstancedMesh', () => {
  const prevDoc = (globalThis as Record<string, unknown>).document;
  if (typeof prevDoc === 'undefined') {
    (globalThis as Record<string, unknown>).document = {
      createElement: () => ({
        width: 1,
        height: 1,
        getContext: () => null,
      }),
    };
  }
  try {
    const dummyTex = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    dummyTex.needsUpdate = true;
    const rig = createSeraPlayerRig(dummyTex, false);

    assert.ok(rig.astralCrownRig, 'PlayerRig exposes composite astralCrownRig');
    assert.equal(rig.astralCrownRig.group.visible, false, 'Hidden at Mastery Seal Tier 0 by default');
    assert.equal(rig.astralCrownRig.bladesInstancedMesh.count, 0);
    assert.equal(rig.astralCrownRig.bladesInstancedMesh.frustumCulled, false);
    assert.ok(
      rig.astralCrownRig.bladesInstancedMesh.instanceColor !== null,
      'Pre-initializes per-instance color buffer for zero-GC tier tinting'
    );
    assert.equal(rig.astralCrownRig.group.parent, rig.chronoRigPivot);
  } finally {
    if (typeof prevDoc === 'undefined') {
      delete (globalThis as Record<string, unknown>).document;
    }
  }
});
