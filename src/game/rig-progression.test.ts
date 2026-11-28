import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceArenaBoostPads,
  advanceArenaFluxPools,
  applyDamageToDestructibleObstacle,
  attemptEnvironmentalInteraction,
  clearTacticalWaypoint,
  createInitialWorld,
  discoverSecretArea,
  equipRigModule,
  extractHudSnapshot,
  grantProgressionReward,
  loadCampaignProgressFromStorage,
  purchaseRigModule,
  saveCampaignProgressToStorage,
  setTacticalWaypoint,
  skipContainmentTransition,
  startCampaignChapterSelect,
  startCampaignRun,
  startPracticeStandardRun,
  stepWorld,
} from './simulation.ts';
import {
  RIG_MODULES,
  VALID_RIG_MODULE_IDS,
  VALID_RIG_MODULE_SLOTS,
  computeEffectiveRigModifiers,
  normalizeRigProgressionFields,
} from './rig-progression.ts';
import type { PlayerInputFrame } from './types.ts';

const IDLE_INPUT: PlayerInputFrame = {
  moveX: 0,
  moveZ: 0,
  aimYaw: Math.PI,
  aimPitch: 0.35,
  lightAttackJustPressed: false,
  heavyHoldActive: false,
  heavyJustReleased: false,
  heavyAttackJustPressed: false,
  dodgeJustPressed: false,
  parryJustPressed: false,
};

test('Rig module catalog & normalizeRigProgressionFields enforce 3-slot schema and ownership invariants', () => {
  assert.equal(VALID_RIG_MODULE_SLOTS.length, 3);
  assert.equal(VALID_RIG_MODULE_IDS.length, 9);
  for (const id of VALID_RIG_MODULE_IDS) {
    assert.ok(RIG_MODULES[id]);
    assert.ok(RIG_MODULES[id].cost >= 2 && RIG_MODULES[id].cost <= 3);
  }

  const normalized = normalizeRigProgressionFields(
    [
      'rig_chrono_spool',
      'invalid_mod',
      'rig_chrono_spool',
      'rig_reactive_plating',
      'rig_echo_synchronizer',
      'rig_aegis_bastion_frame',
      'rig_executioner_bus',
    ],
    {
      temporal_core: 'rig_echo_synchronizer',
      defensive_chassis: 'rig_kinetic_dynamo', // Not owned -> cleared
      tactical_harness: 'rig_reactive_plating', // Wrong slot -> cleared
    }
  );
  assert.deepEqual(normalized.purchasedRigModules, [
    'rig_chrono_spool',
    'rig_reactive_plating',
    'rig_echo_synchronizer',
    'rig_aegis_bastion_frame',
    'rig_executioner_bus',
  ]);
  assert.equal(normalized.equippedRigModules.temporal_core, 'rig_echo_synchronizer');
  assert.equal(normalized.equippedRigModules.defensive_chassis, null);
  assert.equal(normalized.equippedRigModules.tactical_harness, null);

  const newMods = computeEffectiveRigModifiers(
    {
      temporal_core: 'rig_echo_synchronizer',
      defensive_chassis: 'rig_aegis_bastion_frame',
      tactical_harness: 'rig_executioner_bus',
    },
    false
  );
  assert.equal(newMods.echoMaxDurationBonus, -1.0);
  assert.equal(newMods.echoSyncWindowBonus, 0.8);
  assert.equal(newMods.convergenceFluxRefund, 8);
  assert.equal(newMods.parryShockwaveStagger, 22);
  assert.equal(newMods.parryIntegrityHeal, 10);
  assert.equal(newMods.parryRecoveryDelta, 0.1);
  assert.equal(newMods.executionDamageMult, 1.25);
  assert.equal(newMods.executionIntegrityHeal, 14);
  assert.equal(newMods.executionFluxRefund, 16);
  assert.equal(newMods.heavyChargeDelayDelta, 0.05);
});

test('Purchasing & equipping Chrono Rig modules deducts fragments, enforces slot exclusivity, and syncs live stats', () => {
  const world = createInitialWorld('paused');
  world.progression.memoryFragments = 10;

  // Reject equipping unowned module
  const unownedRes = equipRigModule(world, 'temporal_core', 'rig_chrono_spool');
  assert.equal(unownedRes.success, false);
  assert.equal(unownedRes.outcome, 'not_owned');

  // Purchase Chrono Spool (2 frags -> 8 remaining, auto-equipped)
  const buySpool = purchaseRigModule(world, 'rig_chrono_spool');
  assert.equal(buySpool.success, true);
  assert.equal(world.progression.memoryFragments, 8);
  assert.equal(world.progression.equippedRigModules?.temporal_core, 'rig_chrono_spool');
  assert.equal(world.echo.maxDuration, 10);
  assert.equal(world.relay.fluxCost, 20);
  assert.equal(world.relay.maxCooldown, 1.25);

  // Purchase Reactive Aegis Plating (2 frags -> 6 remaining, +25 maxIntegrity -> 125 HP)
  const buyPlating = purchaseRigModule(world, 'rig_reactive_plating');
  assert.equal(buyPlating.success, true);
  assert.equal(world.progression.memoryFragments, 6);
  assert.equal(world.player.maxIntegrity, 125);
  assert.equal(world.player.integrity, 125);

  // Unequip Reactive Plating restores 100 maxIntegrity & clamps integrity cleanly
  const unequipPlating = equipRigModule(world, 'defensive_chassis', null);
  assert.equal(unequipPlating.success, true);
  assert.equal(world.player.maxIntegrity, 100);
  assert.equal(world.player.integrity, 100);

  // Slot mismatch rejected
  const mismatch = equipRigModule(world, 'tactical_harness', 'rig_reactive_plating');
  assert.equal(mismatch.success, false);
  assert.equal(mismatch.outcome, 'incompatible_weapon');
});

test('computeEffectiveRigModifiers applies trade-offs accurately for Surge & non-Surge states', () => {
  const idleMods = computeEffectiveRigModifiers(
    {
      temporal_core: 'rig_resonance_prism',
      defensive_chassis: 'rig_reactive_plating',
      tactical_harness: 'rig_adrenaline_overclock',
    },
    false
  );
  assert.equal(idleMods.convergenceBonusDamage, 14);
  assert.equal(idleMods.convergenceFluxCostDelta, 3);
  assert.equal(idleMods.staggerDurationBonus, 0.45);
  assert.equal(idleMods.moveSpeedMultiplier, 0.94);
  assert.equal(idleMods.surgeDamageMultiplier, 1.0);
  assert.equal(idleMods.surgeCooldownTickMultiplier, 1.0);
  assert.equal(idleMods.surgeRangedHeatPenalty, 0);

  const surgeMods = computeEffectiveRigModifiers(
    {
      temporal_core: 'rig_resonance_prism',
      defensive_chassis: 'rig_reactive_plating',
      tactical_harness: 'rig_adrenaline_overclock',
    },
    true
  );
  assert.equal(surgeMods.moveSpeedMultiplier, 1.0);
  assert.equal(surgeMods.surgeDamageMultiplier, 1.15);
  assert.equal(surgeMods.surgeCooldownTickMultiplier, 1.25);
  assert.equal(surgeMods.surgeRangedHeatPenalty, 4);
});

test('Shattered Capacitor spawns a 3.4m Charged Flux Pool that regenerates Flux and heals with Kinetic Flux Dynamo', () => {
  const world = createInitialWorld('playing');
  world.progression.memoryFragments = 6;
  purchaseRigModule(world, 'rig_kinetic_dynamo');
  purchaseRigModule(world, 'rig_flux_salvager');

  const crate = world.obstacles.find((o) => o.id === 'prop_prologue_crate_e' && o.destructible)!;
  assert.ok(crate);

  world.player.flux = 10;
  world.player.integrity = 60;
  world.events = [];

  applyDamageToDestructibleObstacle(world, crate, 60, true);
  assert.equal(crate.disabled, true);
  assert.equal(world.player.flux, 28); // +18 Flux with Field Salvager
  assert.ok((world.player.surgeTimer ?? 0) >= 1.35);
  assert.equal(world.fluxPools?.length, 1);
  assert.equal(world.fluxPools![0].radius, 3.4);
  assert.equal(
    world.events.some((e) => e.type === 'flux_pool_spawned' && e.obstacleId === crate.id),
    true
  );

  // Move Sera into the pool and advance 2.0s -> +18 Flux (+9/s) & +7.0 HP (+3.5/s with Dynamo)
  world.player.x = crate.x;
  world.player.z = crate.z;
  const fluxBeforePool = world.player.flux;
  const hpBeforePool = world.player.integrity;
  advanceArenaFluxPools(world, 2.0);
  assert.ok(world.player.flux - fluxBeforePool >= 17.9);
  assert.ok(world.player.integrity - hpBeforePool >= 6.9);

  // Boost pad with Kinetic Flux Dynamo heals +8 Integrity
  const westPad = world.boostPads!.find((p) => p.id === 'boost_pad_west')!;
  world.player.x = westPad.x;
  world.player.z = westPad.z;
  const hpBeforePad = world.player.integrity;
  advanceArenaBoostPads(world, 1 / 60);
  assert.ok(world.player.integrity - hpBeforePad >= 7.9);
});

test('Temporal Thread awards Flux, Surge, Adrenaline, and Salvager Integrity repair once per hazard cycle', () => {
  const world = createInitialWorld('playing');
  world.progression.memoryFragments = 4;
  purchaseRigModule(world, 'rig_flux_salvager');

  const hazard = world.exploration.hazards[0];
  assert.ok(hazard);

  // Put Sera right inside the hazard while dodging during active window
  world.enemies = [];
  world.obstacles = [];
  world.player.x = hazard.x;
  world.player.z = hazard.z;
  world.player.flux = 20;
  world.player.integrity = 70;
  world.player.actionState = 'dodging';
  world.player.stateTimer = 0.25;
  world.player.invulnTimer = 0.25;
  hazard.cycleTime = hazard.safeDuration + hazard.warningDuration + 0.05; // Active arc window

  stepWorld(world, IDLE_INPUT, 1 / 60);

  assert.equal(
    world.events.some((e) => e.type === 'temporal_thread_triggered' && e.hazardId === hazard.id),
    true
  );
  assert.ok(world.player.flux >= 34); // +14 Flux
  assert.ok(world.player.integrity >= 78); // +8 Integrity from Field Salvager
  assert.ok((world.player.surgeTimer ?? 0) > 1.3);
  assert.ok((world.player.adrenalineScore ?? 0) >= 0.34);

  // Stepping again in the same cycle does not double-trigger
  world.events = [];
  stepWorld(world, IDLE_INPUT, 1 / 60);
  assert.equal(
    world.events.some((e) => e.type === 'temporal_thread_triggered'),
    false
  );
});

test('Ch4/Ch5 optional override conduits award +1 Fragment each while discoverSecretArea still awards 0 extra fragments', () => {
  // Verify discoverSecretArea grants 0 extra Memory Fragments (18-Fragment campaign invariance)
  const wSecret = createInitialWorld('playing');
  startCampaignRun(wSecret, false);
  wSecret.exploration.activatedNodeIds.push(
    'int_prologue_aux_power_node',
    'int_prologue_shortcut_gate'
  );
  wSecret.exploration.unlockedRouteIds.push('route_prologue_east_bypass');
  const fragsBeforeSecret = wSecret.progression.memoryFragments;
  const secretRes = discoverSecretArea(wSecret, 'secret_prologue_calibration_alcove');
  assert.equal(secretRes, true);
  assert.equal(wSecret.progression.memoryFragments, fragsBeforeSecret);

  // Chapter 4 Quarantine Override Conduit awards +1 Fragment once
  const wCh4 = createInitialWorld('playing');
  wCh4.run.unlockedChapters.push('chapter_4_matron');
  startCampaignChapterSelect(wCh4, 'chapter_4_matron', true);
  const ch4Conduit = wCh4.exploration.interactables.find(
    (n) => n.id === 'int_ch4_quarantine_override_node'
  )!;
  assert.ok(ch4Conduit);
  wCh4.player.x = ch4Conduit.x;
  wCh4.player.z = ch4Conduit.z;
  const fragsCh4Before = wCh4.progression.memoryFragments;
  const ch4Interact = attemptEnvironmentalInteraction(wCh4, 'int_ch4_quarantine_override_node');
  assert.equal(ch4Interact.success, true);
  assert.equal(wCh4.progression.memoryFragments, fragsCh4Before + 1);

  // Chapter 5 Temporal Anchor Conduit requires active Echo and awards +1 Fragment once
  const wCh5 = createInitialWorld('playing');
  wCh5.run.unlockedChapters.push('chapter_5_loom');
  startCampaignChapterSelect(wCh5, 'chapter_5_loom', true);
  const ch5Conduit = wCh5.exploration.interactables.find(
    (n) => n.id === 'int_ch5_temporal_anchor_conduit'
  )!;
  assert.ok(ch5Conduit);
  wCh5.player.x = ch5Conduit.x;
  wCh5.player.z = ch5Conduit.z;
  wCh5.echo.state = 'playback';
  wCh5.echo.activeActor = {
    id: 'echo-ch5-test',
    clipId: 1,
    x: ch5Conduit.x,
    z: ch5Conduit.z,
    rotationY: 0,
    radius: 0.45,
    actionState: 'idle',
    gaitPhase: 0,
    comboIndex: 0,
    chargeRatio: 0,
    isEmpoweredHeavy: false,
    weaponId: 'chrono_edge',
    equippedUpgradeId: null,
    elapsed: 0.5,
    duration: 3.0,
  };
  const fragsCh5Before = wCh5.progression.memoryFragments;
  const ch5Interact = attemptEnvironmentalInteraction(wCh5, 'int_ch5_temporal_anchor_conduit');
  assert.equal(ch5Interact.success, true);
  assert.equal(wCh5.progression.memoryFragments, fragsCh5Before + 1);
});

test('Save V2 persists Rig modules, preserves 125 HP checkpoint integrity, and isolates Practice Mode', () => {
  const store = new Map<string, string>();
  const mockStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
  };

  const w1 = createInitialWorld('paused');
  startCampaignRun(w1, false);
  grantProgressionReward(w1, 'conduit_ch4_quarantine_override_frag');
  grantProgressionReward(w1, 'conduit_ch5_temporal_anchor_frag');
  purchaseRigModule(w1, 'rig_reactive_plating'); // Costs 2 frags, sets 125 maxIntegrity
  w1.run.unlockedChapters.push('chapter_1_helix');
  startCampaignChapterSelect(w1, 'chapter_1_helix', false);
  skipContainmentTransition(w1);
  saveCampaignProgressToStorage(w1, mockStorage);

  const w2 = createInitialWorld('title');
  const loaded = loadCampaignProgressFromStorage(w2, mockStorage);
  assert.equal(loaded, true);
  assert.equal(w2.progression.purchasedRigModules?.includes('rig_reactive_plating'), true);
  assert.equal(w2.progression.equippedRigModules?.defensive_chassis, 'rig_reactive_plating');
  assert.equal(w2.player.maxIntegrity, 125);
  assert.equal(w2.run.savedCampaignSnapshot?.bossCheckpoint?.integrity, 125);

  // Practice Mode preserves Campaign snapshot without overwriting rig progress
  startPracticeStandardRun(w2, 'prologue_calibration_bay');
  saveCampaignProgressToStorage(w2, mockStorage);
  const w3 = createInitialWorld('title');
  loadCampaignProgressFromStorage(w3, mockStorage);
  assert.equal(w3.progression.equippedRigModules?.defensive_chassis, 'rig_reactive_plating');
});

test('Tactical Waypoint attaches to HUD snapshot and auto-clears upon arrival (< 2.3m)', () => {
  const world = createInitialWorld('playing');
  world.enemies = [];
  world.obstacles = [];

  setTacticalWaypoint(world, {
    id: 'boost_pad_west',
    kind: 'boost_pad',
    label: 'WEST FLANK BOOST PAD',
    x: -14,
    z: 0,
  });

  let hud = extractHudSnapshot(world);
  assert.equal(hud.radar?.waypoint?.id, 'boost_pad_west');
  assert.equal(hud.exploration.localMap?.waypoint?.label, 'WEST FLANK BOOST PAD');

  // Move Sera within 2.3m of waypoint and step -> auto-arrives & clears waypoint
  world.player.x = -13.2;
  world.player.z = 0.5;
  stepWorld(world, IDLE_INPUT, 1 / 60);
  hud = extractHudSnapshot(world);
  assert.equal(hud.radar?.waypoint, null);
  assert.equal(world.exploration.tacticalWaypoint, null);

  // Explicit clear works from any distance
  setTacticalWaypoint(world, {
    id: 'boost_pad_east',
    kind: 'boost_pad',
    label: 'EAST FLANK BOOST PAD',
    x: 14,
    z: 0,
  });
  clearTacticalWaypoint(world);
  assert.equal(world.exploration.tacticalWaypoint, null);
});
