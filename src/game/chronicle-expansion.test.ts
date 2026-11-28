import test from 'node:test';
import assert from 'node:assert/strict';
import {
  activateSectorBeacon,
  attemptEnvironmentalInteraction,
  claimFragmentCache,
  createInitialWorld,
  equipRigModule,
  extractHudSnapshot,
  loadCampaignProgressFromStorage,
  overclockWeaponUpgrade,
  purchaseNeuralProtocol,
  purchaseRigModule,
  purchaseWeaponUpgrade,
  resolveStoryArcChoice,
  saveCampaignProgressToStorage,
  skipContainmentTransition,
  startCampaignChapterSelect,
  startCampaignRun,
  stepWorld,
} from './simulation.ts';
import {
  FRAGMENT_CACHES,
  SECTOR_BEACONS,
  STORY_ARCS,
  VALID_NEURAL_PROTOCOL_IDS,
  WEAPON_OVERCLOCK_COST,
  computeNeuralProtocolModifiers,
} from './chronicle-expansion.ts';
import type { CampaignChapterId, PlayerInputFrame } from './types.ts';

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

test('Overclock MK.II requires owned upgrade + 1 Fragment, is idempotent, and scales combat stats', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);
  world.appState = 'paused';
  world.progression.memoryFragments = 5;

  // Reject unowned overclock
  const unowned = overclockWeaponUpgrade(world, 'edge_breaker_cleave');
  assert.equal(unowned.success, false);
  assert.equal(unowned.outcome, 'invalid_upgrade');

  // Purchase upgrade (edge_breaker_cleave costs 2 frags -> 3 left, auto-equips)
  const bought = purchaseWeaponUpgrade(world, 'edge_breaker_cleave');
  assert.equal(bought.success, true);
  assert.equal(world.progression.memoryFragments, 3);

  // Measure single strike damage against Prologue enemy in recovery state
  world.appState = 'playing';
  const dummy1 = world.enemies[0];
  assert.ok(dummy1);
  dummy1.aiState = 'recovery';
  dummy1.stateTimer = 3.0;
  dummy1.hp = 120;
  dummy1.maxHp = 120;
  world.player.x = dummy1.x;
  world.player.z = dummy1.z + 1.4;
  world.player.rotationY = Math.PI;

  stepWorld(world, { ...IDLE_INPUT, lightAttackJustPressed: true }, 1 / 60);
  for (let i = 0; i < 40; i++) {
    stepWorld(world, IDLE_INPUT, 1 / 60);
  }
  const dmgMk1 = 120 - dummy1.hp;
  assert.ok(dmgMk1 > 0, `Expected MK.I hit damage > 0, got ${dmgMk1}`);

  // Overclock MK.II in paused bench (costs 1 frag -> 2 left)
  const beforeOcFrags = world.progression.memoryFragments;
  world.appState = 'paused';
  const ocRes = overclockWeaponUpgrade(world, 'edge_breaker_cleave');
  assert.equal(ocRes.success, true);
  assert.equal(world.progression.memoryFragments, beforeOcFrags - WEAPON_OVERCLOCK_COST);
  assert.equal(world.progression.overclockedUpgrades?.includes('edge_breaker_cleave'), true);

  // Idempotent: second overclock rejected
  const ocDup = overclockWeaponUpgrade(world, 'edge_breaker_cleave');
  assert.equal(ocDup.success, false);
  assert.equal(ocDup.outcome, 'already_owned');

  // Hit dummy with MK.II -> deals strictly > MK.I damage (+25% bonus)
  world.appState = 'playing';
  dummy1.hp = 120;
  dummy1.stagger = 0;
  dummy1.aiState = 'recovery';
  dummy1.stateTimer = 3.0;
  world.player.actionState = 'idle';
  world.player.stateTimer = 0;
  world.player.x = dummy1.x;
  world.player.z = dummy1.z + 1.4;
  world.player.rotationY = Math.PI;

  stepWorld(world, { ...IDLE_INPUT, lightAttackJustPressed: true }, 1 / 60);
  for (let i = 0; i < 40; i++) {
    stepWorld(world, IDLE_INPUT, 1 / 60);
  }
  const dmgMk2 = 120 - dummy1.hp;
  assert.ok(dmgMk2 > dmgMk1, `Expected MK.II damage (${dmgMk2}) > MK.I damage (${dmgMk1})`);
});

test('All 4 Neural Protocols purchase cleanly and modify live Flux cap, Echo potency, Surge duration, and Cache yield', () => {
  assert.equal(VALID_NEURAL_PROTOCOL_IDS.length, 4);
  const world = createInitialWorld('playing');
  startCampaignRun(world, false);
  world.appState = 'paused';
  world.progression.memoryFragments = 10;

  // Buy Flux Reservoir (2 frags -> 125 maxFlux)
  const pFlux = purchaseNeuralProtocol(world, 'proto_flux_reservoir');
  assert.equal(pFlux.success, true);
  assert.equal(world.player.maxFlux, 125);
  assert.equal(world.progression.memoryFragments, 8);

  // Buy Echo Harmonics (+20% Echo playback damage & +0.15s convergence cooldown delta)
  const pEcho = purchaseNeuralProtocol(world, 'proto_echo_harmonics');
  assert.equal(pEcho.success, true);
  // Buy Vanguard Reflex (+25% surgeDuration, +10% dodge, +2 non-surge heat)
  const pReflex = purchaseNeuralProtocol(world, 'proto_vanguard_reflex');
  assert.equal(pReflex.success, true);
  // Buy Salvage Telemetry (+25% yields)
  const pSalvage = purchaseNeuralProtocol(world, 'proto_salvage_telemetry');
  assert.equal(pSalvage.success, true);
  assert.equal(world.progression.memoryFragments, 2);

  // Duplicate purchase rejected
  const dup = purchaseNeuralProtocol(world, 'proto_flux_reservoir');
  assert.equal(dup.success, false);
  assert.equal(dup.outcome, 'already_owned');

  const mods = computeNeuralProtocolModifiers(
    world.progression.purchasedNeuralProtocols,
    world.player.flux,
    false
  );
  assert.equal(mods.maxFluxBonus, 25);
  assert.equal(mods.echoDamageMultiplier, 1.2);
  assert.equal(mods.echoStaggerMultiplier, 1.2);
  assert.equal(mods.convergenceCooldownDelta, 0.15);
  assert.equal(mods.surgeDurationMultiplier, 1.25);
  assert.equal(mods.dodgeImpulseMultiplier, 1.1);
  assert.equal(mods.nonSurgeHeatPenalty, 2);
  assert.equal(mods.salvageYieldMultiplier, 1.25);
  assert.equal(mods.guardPenetrationDelta, -0.06);

  // Live salvage verification: claim cache with < 100% HP & Flux -> +25% bonus yields
  world.appState = 'playing';
  world.player.integrity = 40;
  world.player.flux = 10;
  const okClaim = claimFragmentCache(world, 'cache_prologue_east');
  assert.equal(okClaim, true);
  // Base +14 HP * 1.25 = 18 HP -> 58; base +18 Flux * 1.25 = 23 Flux -> 33; Surge = 1.5 * 1.25 = 1.875s
  assert.equal(world.player.integrity, 58);
  assert.equal(world.player.flux, 33);
  assert.ok((world.player.surgeTimer ?? 0) >= 1.85);
});

test('New Tier 3 Rig Modules (Echo Synchronizer, Aegis Bastion, Executioner Bus) purchase, equip, and sync cleanly', () => {
  const world = createInitialWorld('paused');
  world.progression.memoryFragments = 12;

  assert.equal(purchaseRigModule(world, 'rig_echo_synchronizer').success, true);
  assert.equal(purchaseRigModule(world, 'rig_aegis_bastion_frame').success, true);
  assert.equal(purchaseRigModule(world, 'rig_executioner_bus').success, true);

  // Echo Synchronizer lowers echo.maxDuration by 1s & widens syncWindowBonus
  assert.equal(world.echo.maxDuration, 7);
  assert.equal(world.progression.equippedRigModules?.temporal_core, 'rig_echo_synchronizer');
  assert.equal(world.progression.equippedRigModules?.defensive_chassis, 'rig_aegis_bastion_frame');
  assert.equal(world.progression.equippedRigModules?.tactical_harness, 'rig_executioner_bus');

  // Equip / unequip round-trip restores default 8s maxDuration
  assert.equal(equipRigModule(world, 'temporal_core', null).success, true);
  assert.equal(world.echo.maxDuration, 8);
  assert.equal(equipRigModule(world, 'temporal_core', 'rig_echo_synchronizer').success, true);
  assert.equal(world.echo.maxDuration, 7);
});

test('All 8 Arena Fragment Caches grant +1 Fragment, heal/Flux, and appear on radar & localMap cleanly', () => {
  assert.equal(FRAGMENT_CACHES.length, 8);
  const chapters: CampaignChapterId[] = [
    'prologue',
    'chapter_1_helix',
    'chapter_2_choir',
    'chapter_3_curator',
    'chapter_4_matron',
    'chapter_5_loom',
  ];

  const world = createInitialWorld('playing');
  world.run.unlockedChapters = [...chapters];

  for (const ch of chapters) {
    startCampaignChapterSelect(world, ch, false);
    const chCaches = FRAGMENT_CACHES.filter((c) => c.chapter === ch);
    assert.ok(chCaches.length >= 1, `Chapter ${ch} should have at least 1 cache`);
    assert.equal(world.fragmentCaches?.length, chCaches.length);

    for (const c of chCaches) {
      const beforeFrags = world.progression.memoryFragments;
      world.player.x = c.x;
      world.player.z = c.z;
      const nearHud = extractHudSnapshot(world);
      assert.equal(nearHud.exploration.nearbyExpansionPrompt?.kind, 'fragment_cache');
      assert.equal(nearHud.exploration.nearbyExpansionPrompt?.id, c.id);
      assert.equal(nearHud.exploration.nearbyExpansionPrompt?.ready, true);
      const interactRes = attemptEnvironmentalInteraction(world);
      assert.equal(interactRes.success, true, `Failed to interact/claim ${c.id}`);
      assert.equal(world.progression.memoryFragments, beforeFrags + 1);
      // Idempotent claim check
      assert.equal(claimFragmentCache(world, c.id), false);
    }

    const hud = extractHudSnapshot(world);
    assert.equal(hud.radar?.fragmentCaches?.length, chCaches.length);
    assert.equal(hud.exploration.localMap.fragmentCaches?.length, chCaches.length);
    assert.equal(
      hud.radar?.fragmentCaches?.every((fc) => fc.claimed),
      true
    );
  }
});

test('All 6 Sector Tactical Beacons activate unique chapter combat effects and enforce 14s cooldown', () => {
  assert.equal(SECTOR_BEACONS.length, 6);
  const world = createInitialWorld('playing');
  world.run.unlockedChapters = [
    'prologue',
    'chapter_1_helix',
    'chapter_2_choir',
    'chapter_3_curator',
    'chapter_4_matron',
    'chapter_5_loom',
  ];

  for (const beacon of SECTOR_BEACONS) {
    startCampaignChapterSelect(world, beacon.chapter, true);
    assert.equal(world.sectorBeacons?.length, 1);
    world.player.x = beacon.x;
    world.player.z = beacon.z;
    world.player.weaponHeat = 80;
    world.player.flux = 20;
    world.player.integrity = 60;

    const nearBeaconHud = extractHudSnapshot(world);
    assert.equal(nearBeaconHud.exploration.nearbyExpansionPrompt?.kind, 'sector_beacon');
    assert.equal(nearBeaconHud.exploration.nearbyExpansionPrompt?.id, beacon.id);
    assert.equal(nearBeaconHud.exploration.nearbyExpansionPrompt?.ready, true);

    const ok = activateSectorBeacon(world, beacon.id);
    assert.equal(ok, true, `Failed to activate ${beacon.id}`);
    assert.equal(world.sectorBeacons![0].cooldown, 14);
    assert.equal(world.sectorBeacons![0].activationCount, 1);
    assert.equal(
      world.events.some((e) => e.type === 'sector_beacon_activated'),
      true
    );

    if (beacon.id === 'beacon_prologue_cryo_vent') {
      assert.equal(world.player.weaponHeat, 0);
    } else if (beacon.id === 'beacon_ch4_med_cradle') {
      assert.equal(world.player.integrity, 82);
    } else if (beacon.id === 'beacon_ch5_loom_capacitor') {
      assert.equal(world.player.flux, 55);
      assert.ok((world.player.surgeTimer ?? 0) >= 2.4);
    }

    // Cannot activate again while on cooldown
    assert.equal(activateSectorBeacon(world, beacon.id), false);

    // HUD radar & map reflect recharging status
    const hud = extractHudSnapshot(world);
    assert.equal(hud.radar?.sectorBeacons?.[0].ready, false);
    assert.equal(hud.exploration.localMap.sectorBeacons?.[0].cooldown, 14);
    assert.equal(hud.exploration.nearbyExpansionPrompt?.ready, false);
  }
});

test('All 6 Story Arcs resolve stance choices, grant +1 Fragment, apply blessings, and compute stanceSummary', () => {
  assert.equal(STORY_ARCS.length, 6);
  const world = createInitialWorld('playing');
  startCampaignRun(world, false);
  const startFrags = world.progression.memoryFragments;

  // Resolve 3 defiance, 2 empathy, 1 pragmatism choices across the 6 arcs
  assert.equal(resolveStoryArcChoice(world, 'story_prologue_wake', 'pro_defiance'), true);
  assert.equal(world.activeStoryBlessing, 'flux_surge');
  assert.ok((world.player.surgeTimer ?? 0) >= 2.4);

  // Second attempt on same arc returns false
  assert.equal(resolveStoryArcChoice(world, 'story_prologue_wake', 'pro_empathy'), false);

  world.player.integrity = 50;
  assert.equal(resolveStoryArcChoice(world, 'story_ch1_containment', 'ch1_empathy'), true);
  assert.equal(world.activeStoryBlessing, 'integrity_shield');
  assert.equal(world.player.maxIntegrity, 105);
  assert.equal(world.player.integrity, 80);

  assert.equal(resolveStoryArcChoice(world, 'story_ch2_chorus', 'ch2_defiance'), true);
  assert.equal(world.activeStoryBlessing, 'posture_edge');

  assert.equal(resolveStoryArcChoice(world, 'story_ch3_archive', 'ch3_pragmatism'), true);
  assert.equal(resolveStoryArcChoice(world, 'story_ch4_quarantine', 'ch4_defiance'), true);
  assert.equal(resolveStoryArcChoice(world, 'story_ch5_reckoning', 'ch5_empathy'), true);

  assert.equal(world.progression.memoryFragments, startFrags + 6);
  assert.deepEqual(world.exploration.stanceSummary, {
    defiance: 3,
    empathy: 2,
    pragmatism: 1,
    dominantStance: 'defiance',
  });
});

test('Save V2 round-trip preserves Overclock MK.II, Neural Protocols, and resolved Story Arcs + V1 compatibility', () => {
  const store = new Map<string, string>();
  const mockStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
  };

  const w1 = createInitialWorld('paused');
  startCampaignRun(w1, false);
  w1.progression.memoryFragments = 12;
  purchaseWeaponUpgrade(w1, 'edge_breaker_cleave');
  overclockWeaponUpgrade(w1, 'edge_breaker_cleave');
  purchaseNeuralProtocol(w1, 'proto_flux_reservoir');
  purchaseNeuralProtocol(w1, 'proto_echo_harmonics');
  resolveStoryArcChoice(w1, 'story_prologue_wake', 'pro_pragmatism');
  skipContainmentTransition(w1);
  saveCampaignProgressToStorage(w1, mockStorage);

  const w2 = createInitialWorld('title');
  const loaded = loadCampaignProgressFromStorage(w2, mockStorage);
  assert.equal(loaded, true);
  assert.equal(w2.progression.overclockedUpgrades?.includes('edge_breaker_cleave'), true);
  assert.equal(w2.progression.purchasedNeuralProtocols?.includes('proto_flux_reservoir'), true);
  assert.equal(w2.progression.purchasedNeuralProtocols?.includes('proto_echo_harmonics'), true);
  assert.equal(w2.player.maxFlux, 125);
  assert.equal(w2.exploration.resolvedStoryChoices?.story_prologue_wake, 'pro_pragmatism');
  assert.equal(w2.exploration.stanceSummary?.pragmatism, 1);

  // V1 legacy save payload without expansion fields loads cleanly with safe defaults
  const v1Payload = JSON.stringify({
    version: 1,
    unlockedChapters: ['prologue'],
    completedChapters: [],
    recoveredLogs: [],
    completedEndings: [],
    memoryFragments: 2,
    unlockedWeaponIds: ['chrono_edge', 'pulsecaster'],
    purchasedUpgrades: [],
    equippedUpgrades: { chrono_edge: null, pulsecaster: null },
    rewardedIds: [],
  });
  mockStorage.setItem('afterframe_campaign_progress_v1', v1Payload);
  const wV1 = createInitialWorld('title');
  assert.equal(loadCampaignProgressFromStorage(wV1, mockStorage), true);
  assert.deepEqual(wV1.progression.overclockedUpgrades ?? [], []);
  assert.deepEqual(wV1.progression.purchasedNeuralProtocols ?? [], []);
  assert.deepEqual(wV1.exploration.resolvedStoryChoices ?? {}, {});
  assert.equal(wV1.player.maxFlux, 100);
});
