import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EXPEDITION_BREACH_SEAL,
  EXPEDITION_ENTRY_AIRLOCK,
  EXPEDITION_SECTORS,
  EXPEDITION_TRANSIT_AIRLOCK,
  buildStationSectorMapNodes,
  computeExpeditionGuideTarget,
  computeSectorDiscoveryRatio,
  createInitialExpeditionState,
  createSafeRoomState,
  createSecretVaultForChapter,
  getExpeditionSectorSpec,
  getNgPlusModifiers,
  isPlayerInsideBreachSeal,
  isPlayerInsideTransitAirlock,
  tickSecretEchoVault,
} from './expedition-path.ts';
import {
  attemptEnvironmentalInteraction,
  claimSafeRoomLysaBriefing,
  claimSecretEchoVault,
  createInitialWorld,
  enterExpeditionTransitAirlock,
  extractHudSnapshot,
  startExpeditionJourneyRun,
  startNewGamePlusRun,
  stepWorld,
  triggerExpeditionBreach,
  useSafeRoomMedBay,
} from './simulation.ts';
import type { PlayerInputFrame } from './types.ts';

function createIdleInput(): PlayerInputFrame {
  return {
    moveX: 0,
    moveZ: 0,
    aimYaw: Math.PI,
    aimPitch: 0,
    lightAttackJustPressed: false,
    heavyHoldActive: false,
    heavyJustReleased: false,
    heavyAttackJustPressed: false,
    dodgeJustPressed: false,
    parryJustPressed: false,
    echoRecordJustPressed: false,
    echoPlayJustPressed: false,
    echoClearJustPressed: false,
    echoRelayJustPressed: false,
    gravityPinJustPressed: false,
    echoCollapseJustPressed: false,
    interactJustPressed: false,
    switchWeaponJustPressed: false,
    selectWeaponId: null,
    lockOnToggleJustPressed: false,
    lockOnCycleJustPressed: false,
    overdriveJustPressed: false,
  };
}

test('Expedition sectors form a complete 6-sector path from Prologue to Chronicle Loom', () => {
  assert.equal(EXPEDITION_SECTORS.length, 6);
  assert.equal(EXPEDITION_SECTORS[0].chapter, 'prologue');
  assert.equal(EXPEDITION_SECTORS[0].nextChapter, 'chapter_1_helix');
  assert.equal(EXPEDITION_SECTORS[5].chapter, 'chapter_5_loom');
  assert.equal(EXPEDITION_SECTORS[5].nextChapter, null);
  assert.ok(EXPEDITION_ENTRY_AIRLOCK.z > 12);
  assert.ok(EXPEDITION_TRANSIT_AIRLOCK.z < -12);
  assert.equal(getExpeditionSectorSpec('chapter_3_curator').code, '04');
});

test('computeExpeditionGuideTarget prioritizes Safe-Room stations, unlocked airlock, explore discoveries, secret vault, breach seal, then combat', () => {
  const base = {
    enabled: true,
    playerX: 0,
    playerZ: 12,
    breachSealPos: { x: 0, z: 0 },
    transitGatePos: { x: 0, z: -15.4 },
    nextSectorTitle: 'Primary Containment Vault',
    wardenLabel: 'Security Proxies',
    unclaimedCaches: [{ x: -5, z: 4, label: 'Bay Cache' }],
    unscannedTerminals: [{ x: 6, z: 2, label: 'Console A' }],
    inactiveBeacons: [{ x: 0, z: 6, label: 'Cryo Vent' }],
    activeHostiles: [{ x: 0, z: -4, label: 'Bastion Unit' }],
  };

  const sr = createSafeRoomState('prologue', 'chapter_1_helix');
  const srMedTarget = computeExpeditionGuideTarget({ ...base, phase: 'safe_room', safeRoom: sr });
  assert.equal(srMedTarget?.kind, 'safe_room_med');

  sr.medBayUsed = true;
  const srLysaTarget = computeExpeditionGuideTarget({ ...base, phase: 'safe_room', safeRoom: sr });
  assert.equal(srLysaTarget?.kind, 'safe_room_lysa');

  sr.lysaBriefingClaimed = true;
  const srDepartTarget = computeExpeditionGuideTarget({ ...base, phase: 'safe_room', safeRoom: sr });
  assert.equal(srDepartTarget?.kind, 'transit_gate');

  const airlockTarget = computeExpeditionGuideTarget({ ...base, phase: 'airlock_open' });
  assert.equal(airlockTarget?.kind, 'transit_gate');
  assert.match(airlockTarget?.label ?? '', /PRIMARY CONTAINMENT VAULT/);

  const cacheTarget = computeExpeditionGuideTarget({ ...base, phase: 'explore' });
  assert.equal(cacheTarget?.kind, 'cache');

  const vault = createSecretVaultForChapter('prologue', false)!;
  const vaultSwitchTarget = computeExpeditionGuideTarget({
    ...base,
    phase: 'explore',
    unclaimedCaches: [],
    secretVault: vault,
  });
  assert.equal(vaultSwitchTarget?.kind, 'secret_vault');

  const termTarget = computeExpeditionGuideTarget({
    ...base,
    phase: 'explore',
    unclaimedCaches: [],
  });
  assert.equal(termTarget?.kind, 'terminal');

  const beaconTarget = computeExpeditionGuideTarget({
    ...base,
    phase: 'explore',
    unclaimedCaches: [],
    unscannedTerminals: [],
  });
  assert.equal(beaconTarget?.kind, 'beacon');

  const sealTarget = computeExpeditionGuideTarget({
    ...base,
    phase: 'explore',
    unclaimedCaches: [],
    unscannedTerminals: [],
    inactiveBeacons: [],
  });
  assert.equal(sealTarget?.kind, 'breach_seal');

  const combatTarget = computeExpeditionGuideTarget({ ...base, phase: 'combat' });
  assert.equal(combatTarget?.kind, 'combat');
});

test('Trigger zone helpers detect Breach Seal, Safe-Room Departure Airlock, and unlocked North Transit Airlock accurately', () => {
  const exploreState = createInitialExpeditionState('prologue', true, 'explore');
  assert.equal(isPlayerInsideBreachSeal(0, 0, exploreState), true);
  assert.equal(
    isPlayerInsideBreachSeal(0, EXPEDITION_BREACH_SEAL.triggerRadius + 2, exploreState),
    false
  );
  assert.equal(isPlayerInsideTransitAirlock(0, -15.4, exploreState), false);

  const openState = createInitialExpeditionState('prologue', true, 'airlock_open', true);
  assert.equal(isPlayerInsideBreachSeal(0, 0, openState), false);
  assert.equal(isPlayerInsideTransitAirlock(0, -15.4, openState), true);
  assert.equal(isPlayerInsideTransitAirlock(0, 0, openState), false);

  openState.cachesTotal = 2;
  openState.cachesFound = 1;
  openState.terminalsTotal = 2;
  openState.terminalsScanned = 1;
  // With alreadyLootedVault=true, total=5, found=3 => 0.6
  assert.equal(computeSectorDiscoveryRatio(openState), 0.6);
});

test('Expedition Journey flows cleanly: Explore -> Breach [I] -> Clear -> North Airlock -> Safe-Room Hub (Med Bay + Lysa Intel) -> Departure Airlock -> Sector 02', () => {
  const world = createInitialWorld('title');
  startExpeditionJourneyRun(world, 'prologue');

  assert.equal(world.appState, 'playing');
  assert.equal(world.expedition?.enabled, true);
  assert.equal(world.expedition?.phase, 'explore');
  assert.equal(world.expedition?.sectorCode, '01');
  assert.ok(world.player.z > 10, 'Sera spawns at South Entry Boarding Airlock');

  const initialHp = world.player.integrity;
  for (let i = 0; i < 40; i++) {
    stepWorld(world, createIdleInput(), 0.05);
  }
  assert.equal(world.player.integrity, initialHp, 'Sera stays safe during Explore phase');
  assert.equal(world.expedition?.phase, 'explore');

  // Step into Central Breach Seal and press [I]
  world.player.x = 0;
  world.player.z = 0.2;
  stepWorld(world, createIdleInput(), 0.016);
  assert.equal(world.expedition?.playerInsideBreachSeal, true);

  const interactRes = attemptEnvironmentalInteraction(world);
  assert.equal(interactRes.success, true);
  assert.equal(world.expedition?.phase, 'combat');

  // Clear all prologue proxies -> unlocks North Sector Transit Airlock
  for (const e of world.enemies) {
    e.hp = 0;
    e.aiState = 'ko';
  }
  stepWorld(world, createIdleInput(), 0.05);
  assert.equal(world.appState, 'playing');
  assert.equal(world.outcome, 'none');
  assert.equal(world.expedition?.phase, 'airlock_open');
  assert.equal(world.expedition?.airlockUnlocked, true);
  assert.equal(world.expedition?.nextChapter, 'chapter_1_helix');

  // Step 1: Walk Sera into North Sector Airlock -> arrives in Safe-Room Intermission Hub!
  world.player.x = 0;
  world.player.z = -15.3;
  stepWorld(world, createIdleInput(), 0.016);

  assert.equal(world.expedition?.phase, 'safe_room', 'Enters Pressurized Safe-Room Hub before Sector 02');
  assert.equal(world.enemies.length, 0, 'Safe-Room is completely enemy-free');
  assert.equal(world.fragmentCaches?.length ?? 0, 0, 'Safe-Room clears sector fragment caches');
  assert.equal(world.sectorBeacons?.length ?? 0, 0, 'Safe-Room clears sector beacons');
  assert.equal(
    world.exploration.interactables.length,
    0,
    'Safe-Room clears leftover sector exploration pedestals'
  );
  assert.ok(
    world.obstacles.every((obs) => obs.id === 'loom-pylon' || obs.disabled),
    'Safe-Room retracts combat cover silos out of sightlines'
  );
  assert.equal(world.expedition?.safeRoom?.nextChapter, 'chapter_1_helix');
  assert.ok(world.player.z > 10, 'Spawns cleanly at South entrance of Safe-Room');

  // Verify amphitheater station proximity detection (West Med-Bay, Center Workbench, East Lysa Astrolabe)
  world.player.x = -5.8;
  world.player.z = 1.6;
  stepWorld(world, createIdleInput(), 0.016);
  assert.equal(world.expedition?.safeRoom?.nearbyStation, 'med_bay');

  world.player.x = 0;
  world.player.z = -2.4;
  stepWorld(world, createIdleInput(), 0.016);
  assert.equal(world.expedition?.safeRoom?.nearbyStation, 'workbench');

  world.player.x = 5.8;
  world.player.z = 1.6;
  stepWorld(world, createIdleInput(), 0.016);
  assert.equal(world.expedition?.safeRoom?.nearbyStation, 'lysa_holo');

  // Use Med-Supply Bay & Lysa Venn Hologram inside Safe-Room
  world.player.integrity = 40;
  world.player.flux = 20;
  const fragsBefore = world.progression.memoryFragments;
  assert.equal(useSafeRoomMedBay(world), true);
  assert.equal(world.player.integrity, world.player.maxIntegrity);
  assert.equal(world.player.flux, world.player.maxFlux);
  assert.equal(useSafeRoomMedBay(world), false, 'Med Bay can only be used once per intermission');

  assert.equal(claimSafeRoomLysaBriefing(world), true);
  assert.equal(world.progression.memoryFragments, fragsBefore + 1);
  assert.equal(claimSafeRoomLysaBriefing(world), false, 'Lysa briefing can only be claimed once');

  const hudSafe = extractHudSnapshot(world);
  assert.equal(hudSafe.expedition?.phase, 'safe_room');
  assert.equal(hudSafe.expedition?.safeRoom?.medBayUsed, true);
  assert.equal(hudSafe.expedition?.safeRoom?.lysaBriefingClaimed, true);

  // Step 2: Walk Sera into Safe-Room North Departure Airlock -> enters Sector 02 (HELIX-04)
  world.player.x = 0;
  world.player.z = -15.3;
  stepWorld(world, createIdleInput(), 0.016);

  assert.equal(world.run.chapter, 'chapter_1_helix', 'Seamless departure from Safe-Room into Sector 02');
  assert.equal(world.expedition?.sectorCode, '02');
  assert.equal(world.expedition?.phase, 'explore');
  assert.equal(world.expedition?.airlockUnlocked, false);
  assert.ok(world.player.z > 10, 'Arrives cleanly at South Entry Boarding Airlock of Sector 02');
  assert.equal(world.boss?.id, 'helix-04');

  assert.equal(triggerExpeditionBreach(world), true);
  assert.equal(world.expedition?.phase, 'combat');
  assert.equal(enterExpeditionTransitAirlock(world), false);
});

test('Secret Echo Vault opens via Echo or player pressure switch and grants Memory Fragments, Overdrive, and permanent discovery', () => {
  const vault = createSecretVaultForChapter('prologue', false)!;
  assert.equal(vault.gateOpen, false);

  // Echo holding switch keeps gate open permanently
  const echoTick = tickSecretEchoVault(vault, 0, 0, true, vault.switchPos.x, vault.switchPos.z, 0.1);
  assert.equal(echoTick.justOpened, true);
  assert.equal(vault.heldByEcho, true);
  assert.equal(vault.gateOpen, true);

  // When Echo leaves, 7s override timer counts down cleanly
  tickSecretEchoVault(vault, 0, 0, false, 0, 0, 3.0);
  assert.equal(vault.gateOpen, true);
  assert.ok(vault.overrideTimer > 3.5 && vault.overrideTimer <= 4.1);

  tickSecretEchoVault(vault, 0, 0, false, 0, 0, 5.0);
  assert.equal(vault.gateOpen, false);

  // Integration check in live WorldState
  const world = createInitialWorld('title');
  startExpeditionJourneyRun(world, 'prologue');
  const liveVault = world.expedition!.secretVault!;
  assert.equal(liveVault.gateOpen, false);

  // Step Sera onto West Switch Pad -> opens gate
  world.player.x = liveVault.switchPos.x;
  world.player.z = liveVault.switchPos.z;
  stepWorld(world, createIdleInput(), 0.05);
  assert.equal(liveVault.gateOpen, true);

  const fragsBefore = world.progression.memoryFragments;
  world.player.integrity = 60;
  assert.equal(claimSecretEchoVault(world), true);
  assert.equal(liveVault.looted, true);
  assert.equal(world.progression.memoryFragments, fragsBefore + 2);
  assert.equal(world.player.integrity, 85);
  assert.ok(world.progression.unlockedVaultChapters.includes('prologue'));
  assert.equal(claimSecretEchoVault(world), false, 'Cannot loot the same Secret Vault twice');
});

test('Interconnected 6-Sector Station Map tracks live statuses and % Discovery accurately', () => {
  const nodes = buildStationSectorMapNodes({
    completedChapters: ['prologue'],
    unlockedChapters: ['prologue', 'chapter_1_helix'],
    activeChapter: 'chapter_1_helix',
    claimedRewardIds: ['cache_prologue_east'],
    activatedNodeIds: ['prologue_console_a', 'prologue_console_b', 'prologue_console_c'],
    unlockedVaultChapters: ['prologue'],
  });

  assert.equal(nodes.length, 6);
  assert.equal(nodes[0].status, 'cleared');
  assert.equal(nodes[0].vaultLooted, true);
  assert.equal(nodes[0].discoveryPercent, 100);
  assert.equal(nodes[1].status, 'active');
  assert.equal(nodes[1].vaultLooted, false);
  assert.equal(nodes[2].status, 'locked');
});

test('New Game+ preserves all upgrades & fragments, unlocks all 4 weapons, increments cycle, and scales enemy HP by +35%', () => {
  const mods0 = getNgPlusModifiers(0);
  assert.equal(mods0.active, false);
  assert.equal(mods0.enemyHpMultiplier, 1);

  const mods1 = getNgPlusModifiers(1);
  assert.equal(mods1.active, true);
  assert.equal(mods1.enemyHpMultiplier, 1.35);
  assert.equal(mods1.badgeLabel, 'NG+1');

  const baseWorld = createInitialWorld('title');
  startExpeditionJourneyRun(baseWorld, 'prologue');
  const baseEnemyHp = baseWorld.enemies[0].maxHp;

  const ngWorld = createInitialWorld('title');
  ngWorld.progression.memoryFragments = 9;
  ngWorld.progression.purchasedUpgrades.push('edge_breaker_cleave');
  const cycle = startNewGamePlusRun(ngWorld);

  assert.equal(cycle, 1);
  assert.equal(ngWorld.progression.ngPlusCycle, 1);
  assert.equal(ngWorld.progression.memoryFragments, 9, 'Memory Fragments preserved in NG+');
  assert.ok(
    ngWorld.progression.purchasedUpgrades.includes('edge_breaker_cleave'),
    'Weapon upgrades preserved in NG+'
  );
  assert.equal(ngWorld.progression.unlockedWeaponIds.length, 4, 'All 4 weapons unlocked in NG+');
  assert.equal(ngWorld.expedition?.ngPlusCycle, 1);
  assert.equal(
    ngWorld.enemies[0].maxHp,
    Math.round(baseEnemyHp * 1.35),
    'Enemy HP scaled by +35% in NG+1'
  );
});
