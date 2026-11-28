import test from 'node:test';
import assert from 'node:assert/strict';
import {
  activateSectorBeacon,
  attemptEnvironmentalInteraction,
  createEmptyInput,
  createInitialWorld,
  getAllInteractableDefinitionsForChapter,
  getArenaSolidPropColliders,
  startBossEncounter,
  startCampaignRun,
  stepWorld,
  transitionCampaignToBoss,
} from './simulation.ts';
import { GAME_CONFIG } from './config.ts';
import type { CampaignChapterId } from './types.ts';

const ALL_CHAPTERS: readonly CampaignChapterId[] = [
  'prologue',
  'chapter_1_helix',
  'chapter_2_choir',
  'chapter_3_curator',
  'chapter_4_matron',
  'chapter_5_loom',
];

test('getArenaSolidPropColliders returns solid colliders for all 6 chapters including terminals, caches, beacons, landmarks, and data consoles', () => {
  for (const chapter of ALL_CHAPTERS) {
    const colliders = getArenaSolidPropColliders(chapter);
    assert.ok(colliders.length >= 10, `Expected >= 10 solid prop colliders in ${chapter}, got ${colliders.length}`);
    // 4 perimeter data consoles in every chapter
    const dataConsoles = colliders.filter((c) => c.id.startsWith('prop_col_data_console_'));
    assert.equal(dataConsoles.length, 4, `Expected 4 perimeter data consoles in ${chapter}`);
    // Interactables present
    const interactables = getAllInteractableDefinitionsForChapter(chapter);
    for (const def of interactables) {
      const col = colliders.find((c) => c.id === `prop_col_${def.id}`);
      assert.ok(col, `Missing solid collider for interactable ${def.id} in ${chapter}`);
      assert.equal(col.x, def.x);
      assert.equal(col.z, def.z);
      assert.ok(col.radius >= 0.6);
    }
  }

  // Prologue has Chrono Receiver twin pedestals + calibration gate columns + diagnostic pylon + Sheet 10 Tactical Holo-Table
  const prologueCols = getArenaSolidPropColliders('prologue');
  assert.ok(prologueCols.some((c) => c.id === 'prop_col_chrono_rx_w'));
  assert.ok(prologueCols.some((c) => c.id === 'prop_col_chrono_rx_e'));
  assert.ok(prologueCols.some((c) => c.id === 'prop_col_prologue_diag_pylon'));
  assert.ok(prologueCols.some((c) => c.id === 'prop_col_prologue_holo_table'));

  // Chapter 1 has Sheet 11 Overdrive Conduit solid collider
  assert.ok(getArenaSolidPropColliders('chapter_1_helix').some((c) => c.id === 'prop_col_overdrive_conduit'));

  // Chapter 3 has Sheet 10 Tactical Holo-Table, Chapter 4 has Sheet 10 Cryo Med-Tables
  assert.ok(getArenaSolidPropColliders('chapter_3_curator').some((c) => c.id === 'prop_col_ch3_holo_table'));
  assert.equal(
    getArenaSolidPropColliders('chapter_4_matron').filter((c) => c.id.startsWith('prop_col_cryo_med_table_')).length,
    2
  );

  // Chapter 5 has Directive Core altar + Sovereign Seals + Sheet 10 Convergence Pillars
  const ch5Cols = getArenaSolidPropColliders('chapter_5_loom');
  assert.ok(ch5Cols.some((c) => c.id === 'prop_col_directive_core'));
  assert.ok(ch5Cols.filter((c) => c.id.startsWith('prop_col_sovereign_seal_')).length >= 2);
  assert.equal(ch5Cols.filter((c) => c.id.startsWith('prop_col_convergence_pillar_')).length, 2);
});

test('walking directly into Prologue Lore Terminal, Fragment Cache, Sector Beacon, and Chrono Receiver physically blocks Sera (zero walk-through)', () => {
  const world = createInitialWorld();
  startCampaignRun(world);
  world.appState = 'playing';

  const playerRadius = GAME_CONFIG.player.radius;
  const prologueCols = getArenaSolidPropColliders('prologue');
  const firstInteractable = getAllInteractableDefinitionsForChapter('prologue')[0];
  const firstCache = world.fragmentCaches?.[0];
  const firstBeacon = world.sectorBeacons?.[0];
  assert.ok(firstCache, 'Expected prologue fragment cache');
  assert.ok(firstBeacon, 'Expected prologue sector beacon');
  const targets = [
    prologueCols.find((c) => c.id === `prop_col_${firstInteractable.id}`),
    prologueCols.find((c) => c.id === `prop_col_${firstCache.id}`),
    prologueCols.find((c) => c.id === `prop_col_${firstBeacon.id}`),
    prologueCols.find((c) => c.id === 'prop_col_chrono_rx_w'),
  ];

  for (const prop of targets) {
    assert.ok(prop, 'Expected target solid prop in prologue');
    // Place Sera south of prop and walk north (-Z) straight into it
    const startZ = prop.z + prop.radius + playerRadius + 0.9;
    world.player.x = prop.x;
    world.player.z = startZ;
    world.player.vx = 0;
    world.player.vz = 0;

    for (let step = 0; step < 30; step++) {
      const input = createEmptyInput(Math.PI);
      input.moveZ = -1; // W key: forward along aimYaw=Math.PI (-Z, straight into prop)
      stepWorld(world, input, 1 / 60);
    }

    assert.ok(
      world.player.z < startZ - 0.3,
      `Expected Sera to walk north toward ${prop.id}, startZ=${startZ.toFixed(2)}, endZ=${world.player.z.toFixed(2)}`
    );
    const dist = Math.hypot(world.player.x - prop.x, world.player.z - prop.z);
    const minDist = playerRadius + prop.radius - 0.02;
    assert.ok(
      dist >= minDist,
      `Sera clipped into ${prop.id}: dist=${dist.toFixed(3)} < minDist=${minDist.toFixed(3)}`
    );
  }
});

test('walking directly into Chapter 5 Directive Core altar physically stops Sera', () => {
  const world = createInitialWorld();
  startBossEncounter(world, true, 'warden-prime');
  world.appState = 'playing';

  const playerRadius = GAME_CONFIG.player.radius;
  const dc = getArenaSolidPropColliders('chapter_5_loom').find(
    (c) => c.id === 'prop_col_directive_core'
  );
  assert.ok(dc, 'Expected Directive Core collider in chapter_5_loom');

  const startZ = dc.z + dc.radius + playerRadius + 0.8;
  world.player.x = dc.x;
  world.player.z = startZ;
  world.player.vx = 0;
  world.player.vz = 0;

  for (let step = 0; step < 30; step++) {
    const input = createEmptyInput(Math.PI);
    input.moveZ = -1;
    stepWorld(world, input, 1 / 60);
  }

  assert.ok(world.player.z < startZ - 0.3, 'Expected Sera to walk north into Directive Core');
  const dist = Math.hypot(world.player.x - dc.x, world.player.z - dc.z);
  const minDist = playerRadius + dc.radius - 0.02;
  assert.ok(
    dist >= minDist,
    `Sera clipped into Directive Core: dist=${dist.toFixed(3)} < minDist=${minDist.toFixed(3)}`
  );
});

test('solid prop colliders never block interaction reachability for Lore Terminals, Fragment Caches, or Sector Beacons', () => {
  const world = createInitialWorld();
  startCampaignRun(world);
  world.appState = 'playing';
  const playerRadius = GAME_CONFIG.player.radius;

  // 1. Lore terminal interaction works from right outside solid radius
  const term = getAllInteractableDefinitionsForChapter('prologue')[0];
  assert.ok(term);
  const termCol = getArenaSolidPropColliders('prologue').find((c) => c.id === `prop_col_${term.id}`)!;
  world.player.x = term.x;
  world.player.z = term.z + termCol.radius + playerRadius + 0.12;
  world.player.rotationY = Math.PI; // Facing north (-Z) toward terminal
  const interactResult = attemptEnvironmentalInteraction(world);
  assert.equal(
    interactResult.status,
    'ready',
    `Expected terminal interaction to succeed outside solid radius, got ${interactResult.status}`
  );

  // 2. Fragment cache auto-claim succeeds from right outside solid pedestal radius
  const cache = world.fragmentCaches?.[0];
  assert.ok(cache);
  const cacheCol = getArenaSolidPropColliders('prologue').find((c) => c.id === `prop_col_${cache.id}`)!;
  world.player.x = cache.x;
  world.player.z = cache.z + cacheCol.radius + playerRadius + 0.08;
  stepWorld(world, createEmptyInput(), 1 / 60);
  assert.equal(cache.claimed, true, 'Expected Fragment Cache to auto-claim cleanly from outside solid pedestal radius');

  // 3. Sector Beacon activation succeeds from right outside solid spire radius
  const beacon = world.sectorBeacons?.[0];
  assert.ok(beacon);
  const beaconCol = getArenaSolidPropColliders('prologue').find((c) => c.id === `prop_col_${beacon.id}`)!;
  world.player.x = beacon.x;
  world.player.z = beacon.z + beaconCol.radius + playerRadius + 0.12;
  const beaconOk = activateSectorBeacon(world, beacon.id);
  assert.equal(beaconOk, true, 'Expected Sector Beacon to activate cleanly outside solid spire radius');
});

test('arena layout sanity: player spawn (0, 12) is completely unobstructed across all 6 chapters and boss chapter interactables stay outside the central fighting ring', () => {
  const spawnX = 0;
  const spawnZ = 12;

  for (const chapter of ALL_CHAPTERS) {
    const solidProps = getArenaSolidPropColliders(chapter);
    for (const prop of solidProps) {
      const clearDist = Math.hypot(prop.x - spawnX, prop.z - spawnZ) - prop.radius;
      assert.ok(
        clearDist >= 1.8,
        `Solid prop ${prop.id} in ${chapter} is too close to player spawn (0, 12): clearance=${clearDist.toFixed(2)}m`
      );
    }

    const chapterObstacles = GAME_CONFIG.arena.chapterObstacles[chapter] ?? [];
    for (const obs of chapterObstacles) {
      const clearDist = Math.hypot(obs.x - spawnX, obs.z - spawnZ) - obs.radius;
      assert.ok(
        clearDist >= 1.4,
        `Obstacle ${obs.id} in ${chapter} is too close to player spawn (0, 12): clearance=${clearDist.toFixed(2)}m`
      );
    }

    if (chapter !== 'prologue') {
      const interactables = getAllInteractableDefinitionsForChapter(chapter);
      for (const def of interactables) {
        const radial = Math.hypot(def.x, def.z);
        assert.ok(
          radial >= 9.0,
          `Boss chapter interactable ${def.id} in ${chapter} intrudes on central fighting ring: r=${radial.toFixed(2)}m`
        );
      }
    }
  }
});

test('all 6 chapters enforce >= 0.60m walkable clearance between distinct floor obstacles/props and >= 1.50m clearance around Boost Pads', () => {
  const isCompositePair = (aId: string, bId: string): boolean => {
    if (aId.startsWith('prop_col_bulkhead_') && bId.startsWith('prop_col_bulkhead_')) return true;
    if (aId.startsWith('prop_col_harmonic_organ_') && bId.startsWith('prop_col_harmonic_organ_')) return true;
    if (aId.startsWith('prop_col_cal_gate_') && bId.startsWith('prop_col_cal_gate_')) return true;
    return false;
  };

  for (const chapter of ALL_CHAPTERS) {
    const world = createInitialWorld();
    if (chapter === 'prologue') {
      startCampaignRun(world);
    } else if (chapter === 'chapter_5_loom') {
      startBossEncounter(world, true, 'warden-prime');
    } else {
      transitionCampaignToBoss(world, true, chapter);
    }

    const activeObs = world.obstacles.filter((o) => !o.disabled);
    const solidProps = getArenaSolidPropColliders(chapter);
    const boostPads = world.boostPads ?? [];
    assert.ok(boostPads.length >= 2, `Expected >= 2 boost pads in ${chapter}`);

    // 1. Every Boost Pad must have >= 1.50m walkable gap from all active obstacles and solid props
    for (const pad of boostPads) {
      for (const item of [...activeObs, ...solidProps]) {
        const gap = Math.hypot(pad.x - item.x, pad.z - item.z) - pad.radius - item.radius;
        assert.ok(
          gap >= 1.5,
          `Boost pad ${pad.id} in ${chapter} crowded by ${item.id}: gap=${gap.toFixed(2)}m`
        );
      }
    }

    // 2. Every distinct pair of active obstacles & solid props must have >= 0.60m clearance
    const allItems = [...activeObs, ...solidProps];
    for (let i = 0; i < allItems.length; i++) {
      for (let j = i + 1; j < allItems.length; j++) {
        const a = allItems[i];
        const b = allItems[j];
        if (isCompositePair(a.id, b.id)) continue;
        const gap = Math.hypot(a.x - b.x, a.z - b.z) - a.radius - b.radius;
        assert.ok(
          gap >= 0.6,
          `Tight prop overlap in ${chapter}: ${a.id} (${a.x},${a.z}) <-> ${b.id} (${b.x},${b.z}) gap=${gap.toFixed(2)}m`
        );
      }
    }
  }
});

test('chapter_5_loom deploys true Chapter 5 obstacles (never stale Chapter 4 obstacles) and Boss Chapters 1-5 disable Prologue puzzle barriers', () => {
  // 1. Prologue has calibration barriers enabled
  const prologueWorld = createInitialWorld();
  startCampaignRun(prologueWorld);
  const pLock = prologueWorld.obstacles.find((o) => o.id === 'chrono-lock-barrier');
  const pComb = prologueWorld.obstacles.find((o) => o.id === 'chrono-combine-barrier');
  assert.ok(pLock && !pLock.disabled, 'Prologue chrono-lock-barrier must be active');
  assert.ok(pComb && !pComb.disabled, 'Prologue chrono-combine-barrier must be active');

  // 2. Boss Chapters 1-5 disable Prologue puzzle barriers
  for (const ch of ALL_CHAPTERS.filter((c) => c !== 'prologue')) {
    const w = createInitialWorld();
    transitionCampaignToBoss(w, true, ch);
    const lockB = w.obstacles.find((o) => o.id === 'chrono-lock-barrier');
    const combB = w.obstacles.find((o) => o.id === 'chrono-combine-barrier');
    assert.ok(lockB?.disabled, `chrono-lock-barrier must be disabled in ${ch}`);
    assert.ok(combB?.disabled, `chrono-combine-barrier must be disabled in ${ch}`);
  }

  // 3. Chapter 5 via both transitionCampaignToBoss and startBossEncounter('warden-prime') deploys Ch5 obstacles
  for (const setup of ['campaign', 'warden'] as const) {
    const w = createInitialWorld();
    if (setup === 'campaign') {
      transitionCampaignToBoss(w, true, 'chapter_5_loom');
    } else {
      startBossEncounter(w, true, 'warden-prime');
    }
    assert.ok(
      w.obstacles.some((o) => o.id === 'cover_ch5_ward_w' && !o.disabled),
      `Expected cover_ch5_ward_w in chapter_5_loom (${setup})`
    );
    assert.ok(
      w.obstacles.some((o) => o.id === 'prop_ch5_cap_w' && !o.disabled),
      `Expected prop_ch5_cap_w in chapter_5_loom (${setup})`
    );
    assert.ok(
      !w.obstacles.some((o) => o.id.startsWith('prop_ch4_')),
      `Stale Chapter 4 obstacle leaked into chapter_5_loom (${setup})`
    );
  }
});

