import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceTemporalRiftSystem,
  createEmptyInput,
  createInitialWorld,
  extractHudSnapshot,
  getActiveWeaponMasteryInfo,
  awardWeaponMasteryXp,
  loadCampaignProgressFromStorage,
  resetWorldForPlaying,
  saveCampaignProgressToStorage,
  sealTemporalRift,
  selectRecursionRelic,
  setOverdriveDifficulty,
  startBossEncounter,
  startRecursionProtocol,
  stepWorld,
  triggerBossDefeat,
} from './simulation.ts';
import {
  CHRONO_RELICS,
  RELIC_SYNERGY_CONSTELLATIONS,
  VALID_RELIC_CONSTELLATION_IDS,
  WEAPON_MASTERY_THRESHOLDS,
  computeActiveRelicConstellations,
  computeRecursionModifierSummary,
  computeWeaponMasteryRankInfo,
  getDraftRelicSynergyPreview,
  getRelicDraftChoices,
  pickNextRecursionSector,
} from './recursion-mode.ts';
import { SoundEngine } from './audio.ts';
import type { ArenaTemporalRift } from './types.ts';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

test('Recursion sector rotation cycles through all 6 sectors across infinite loops', () => {
  assert.equal(pickNextRecursionSector(1), 'prologue');
  assert.equal(pickNextRecursionSector(2), 'chapter_1_helix');
  assert.equal(pickNextRecursionSector(3), 'chapter_2_choir');
  assert.equal(pickNextRecursionSector(4), 'chapter_3_curator');
  assert.equal(pickNextRecursionSector(5), 'chapter_4_matron');
  assert.equal(pickNextRecursionSector(6), 'chapter_5_loom');
  assert.equal(pickNextRecursionSector(7), 'prologue');
});

test('Recursion Protocol opens 3-card Relic Draft on loop clear, grants fragments on even loops, and triggers Warden Surge on loop 3', () => {
  const world = createInitialWorld('title');
  startRecursionProtocol(world, 1);

  assert.equal(world.run.mode, 'recursion');
  assert.equal(world.recursion?.loopIndex, 1);
  assert.equal(world.recursion?.isWardenSurge, false);
  assert.equal(world.outcome, 'none');
  assert.ok(world.enemies.length >= 2);

  // Eliminate all loop 1 enemies inside simulation step.
  for (const e of world.enemies) {
    e.hp = 0;
  }
  const input = createEmptyInput();
  stepWorld(world, input, 0.016);

  assert.equal(world.outcome, 'none');
  assert.equal(world.recursion?.awaitingRelicDraft, true);
  assert.equal(world.recursion?.draftOptions.length, 3);
  assert.equal(world.recursion?.totalClears, 1);

  const baselineMaxIntegrity = world.player.maxIntegrity;
  const okPick1 = selectRecursionRelic(world, 'relic_aegis_capacitor');
  assert.equal(okPick1, true);
  assert.equal(world.recursion?.awaitingRelicDraft, false);
  assert.equal(world.recursion?.loopIndex, 2);
  assert.equal(world.run.chapter, 'chapter_1_helix');
  assert.equal(world.player.maxIntegrity, baselineMaxIntegrity + 20);

  // Clear loop 2 (even loop) -> +1 Memory Fragment awarded!
  const fragsBeforeLoop2 = world.progression.memoryFragments;
  for (const e of world.enemies) {
    e.hp = 0;
  }
  stepWorld(world, input, 0.016);
  assert.equal(world.recursion?.awaitingRelicDraft, true);
  assert.equal(world.progression.memoryFragments, fragsBeforeLoop2 + 1);

  // Pick a relic to advance to Loop 3 -> Warden Boss Surge!
  const choices = world.recursion!.draftOptions;
  assert.equal(choices.length, 3);
  const okPick2 = selectRecursionRelic(world, choices[0].id);
  assert.equal(okPick2, true);
  assert.equal(world.recursion?.loopIndex, 3);
  assert.equal(world.recursion?.isWardenSurge, true);
  assert.ok(world.boss !== null);

  // Defeating the Warden Surge boss opens next relic draft instead of ending run.
  triggerBossDefeat(world);
  stepWorld(world, input, 0.016);
  assert.equal(world.outcome, 'none');
  assert.equal(world.recursion?.awaitingRelicDraft, true);
  assert.equal(world.recursion?.bestLoopReached, 3);

  // Restarting (TRY AGAIN / [R]) from Recursion mode must preserve Recursion Protocol.
  resetWorldForPlaying(world);
  assert.equal(world.run.mode, 'recursion');
  assert.equal(world.recursion?.loopIndex, 1);
  assert.equal(world.recursion?.awaitingRelicDraft, false);
});

test('Relic modifiers and 3-card draft choices compute deterministic stacking and activate Constellations', () => {
  const choices = getRelicDraftChoices(4, { relic_kinetic_overdrive: 1 });
  assert.equal(choices.length, 3);
  for (const c of choices) {
    assert.ok(CHRONO_RELICS[c.id]);
  }

  // Pairing kinetic_overdrive + temporal_siphon activates CHRONO VAMPIRISM (+15% DMG, +12% Move, +6 Flux, +6 Ward)
  // Pairing aegis_capacitor + thermal_purge activates CRYO FORTRESS (+25 Max Integrity, -20% Heat, +20% Heavy/Ranged)
  const mods = computeRecursionModifierSummary({
    relic_kinetic_overdrive: 2,
    relic_temporal_siphon: 1,
    relic_thermal_purge: 2,
    relic_aegis_capacitor: 1,
  });
  assert.deepEqual(mods.activeConstellations, [
    'constellation_chrono_vampirism',
    'constellation_cryo_fortress',
  ]);
  assert.ok(Math.abs(mods.moveSpeedMultiplier - 1.28 * 1.12) < 1e-6);
  assert.ok(Math.abs(mods.damageMultiplier - 1.2 * 1.15) < 1e-6);
  assert.equal(mods.killFluxBonus, 12 + 6);
  assert.equal(mods.killHealBonus, 8);
  assert.equal(mods.killWardBonus, 6);
  assert.equal(mods.maxIntegrityBonus, 20 + 25);
  assert.ok(mods.heatMultiplier < 0.6);
});

test('Relic Synergy Constellations O(1) bitmask table returns frozen arrays and previews draft pairings accurately', () => {
  assert.equal(VALID_RELIC_CONSTELLATION_IDS.length, 3);
  assert.equal(Object.isFrozen(RELIC_SYNERGY_CONSTELLATIONS), true);

  // Zero-GC verification: identical active masks return the exact same frozen array reference
  const emptyA = computeActiveRelicConstellations(null);
  const emptyB = computeActiveRelicConstellations({});
  assert.equal(emptyA, emptyB);
  assert.equal(Object.isFrozen(emptyA), true);
  assert.equal(emptyA.length, 0);

  const allThreeA = computeActiveRelicConstellations({
    relic_kinetic_overdrive: 1,
    relic_temporal_siphon: 1,
    relic_echo_amplification: 2,
    relic_singularity_coil: 1,
    relic_aegis_capacitor: 1,
    relic_thermal_purge: 1,
  });
  const allThreeB = computeActiveRelicConstellations({
    relic_kinetic_overdrive: 3,
    relic_temporal_siphon: 2,
    relic_echo_amplification: 1,
    relic_singularity_coil: 4,
    relic_aegis_capacitor: 2,
    relic_thermal_purge: 1,
  });
  assert.equal(allThreeA, allThreeB);
  assert.equal(Object.isFrozen(allThreeA), true);
  assert.deepEqual(allThreeA, VALID_RELIC_CONSTELLATION_IDS);

  // Paradox Singularity checks (-15% Confluence [9] & Collapse CD, +25% Echo DMG, +20% Stagger)
  const paradoxMods = computeRecursionModifierSummary({
    relic_echo_amplification: 1,
    relic_singularity_coil: 1,
  });
  assert.deepEqual(paradoxMods.activeConstellations, ['constellation_paradox_singularity']);
  assert.ok(Math.abs(paradoxMods.confluenceCooldownMultiplier - 0.85) < 1e-6);
  assert.ok(Math.abs(paradoxMods.echoDamageMultiplier - 1.22 * 1.25) < 1e-6);

  // Draft card preview transitions: partner_missing -> completes -> active
  const pMissing = getDraftRelicSynergyPreview('relic_echo_amplification', {});
  assert.equal(pMissing.status, 'partner_missing');
  assert.equal(pMissing.partnerRelic.id, 'relic_singularity_coil');

  const pCompletes = getDraftRelicSynergyPreview('relic_echo_amplification', {
    relic_singularity_coil: 1,
  });
  assert.equal(pCompletes.status, 'completes');
  assert.equal(pCompletes.constellation.id, 'constellation_paradox_singularity');

  const pActive = getDraftRelicSynergyPreview('relic_echo_amplification', {
    relic_echo_amplification: 1,
    relic_singularity_coil: 1,
  });
  assert.equal(pActive.status, 'active');
});

test('Weapon Mastery Rank I adds zero bonuses while Ranks II-V scale monotonically', () => {
  assert.deepEqual(WEAPON_MASTERY_THRESHOLDS, [0, 25, 75, 150, 260]);
  const r1 = computeWeaponMasteryRankInfo(0);
  const r1Max = computeWeaponMasteryRankInfo(24);
  assert.equal(r1.rank, 1);
  assert.equal(r1.damageMultiplier, 1);
  assert.equal(r1.staggerMultiplier, 1);
  assert.equal(r1.fluxGainMultiplier, 1);
  assert.equal(r1.vulnerableBonus, 0);
  assert.equal(r1Max.rank, 1);
  assert.equal(r1Max.damageMultiplier, 1);

  const r2 = computeWeaponMasteryRankInfo(25);
  const r3 = computeWeaponMasteryRankInfo(75);
  const r4 = computeWeaponMasteryRankInfo(150);
  const r5 = computeWeaponMasteryRankInfo(260);
  assert.equal(r2.rank, 2);
  assert.equal(r3.rank, 3);
  assert.equal(r4.rank, 4);
  assert.equal(r5.rank, 5);
  assert.ok(r5.damageMultiplier > r4.damageMultiplier);
  assert.ok(r4.staggerMultiplier > r3.staggerMultiplier);
  assert.ok(r3.fluxGainMultiplier > r2.fluxGainMultiplier);
  assert.ok(r5.vulnerableBonus > 0);

  const world = createInitialWorld('playing');
  const updated = awardWeaponMasteryXp(world, 'chrono_edge', 80);
  assert.equal(updated.rank, 3);
  assert.equal(getActiveWeaponMasteryInfo(world, 'chrono_edge').xp, 80);
});

test('Temporal Rift never spawns before 7.5s, seals for rewards, and ruptures to heal hostiles on timeout', () => {
  const world = createInitialWorld('playing');
  world.player.x = 0;
  world.player.z = 5.2;
  world.player.integrity = 70;
  world.player.flux = 20;

  // Deterministic baseline check: 0-5s stays rift-free.
  for (let i = 0; i < 10; i++) {
    advanceTemporalRiftSystem(world, 0.5);
  }
  assert.equal(world.temporalRift, null);

  // Cross 7.5s -> rift spawns.
  for (let i = 0; i < 6; i++) {
    advanceTemporalRiftSystem(world, 0.5);
  }
  const spawnedRift = world.temporalRift as ArenaTemporalRift | null;
  if (!spawnedRift) {
    assert.fail('Expected temporal rift to spawn after 7.5s');
  }

  // Move nearby enemy within 5.5m of rift and test manual seal [I].
  const nearbyEnemy = world.enemies[0];
  nearbyEnemy.x = spawnedRift.x + 2.0;
  nearbyEnemy.z = spawnedRift.z;
  nearbyEnemy.stagger = 0;

  const sealed = sealTemporalRift(world);
  assert.equal(sealed, true);
  assert.equal(world.temporalRift, null);
  assert.equal(world.player.flux, 48);
  assert.equal(world.player.integrity, 82);
  assert.ok((world.player.surgeTimer ?? 0) >= 2.0);
  assert.equal(nearbyEnemy.stagger, 22);
  assert.ok(world.events.some((ev) => ev.type === 'temporal_rift_sealed'));

  // Force next spawn cooldown to expire and let the 12s rift rupture.
  world.riftCooldownTimer = 0.1;
  advanceTemporalRiftSystem(world, 0.2);
  const ruptureRift = world.temporalRift as ArenaTemporalRift | null;
  if (!ruptureRift) {
    assert.fail('Expected second temporal rift to spawn when cooldown expires');
  }

  const hostile = world.enemies[0];
  hostile.hp = Math.max(1, hostile.maxHp - 30);
  hostile.stagger = 20;
  const hpBeforeRupture = hostile.hp;

  // Move player away so proximity seal doesn't fire while stepping past 12s.
  world.player.x = -ruptureRift.x;
  world.player.z = -ruptureRift.z;
  for (let i = 0; i < 25; i++) {
    advanceTemporalRiftSystem(world, 0.5);
  }
  assert.equal(world.temporalRift, null);
  assert.equal(hostile.hp, Math.min(hostile.maxHp, hpBeforeRupture + 18));
  assert.equal(hostile.stagger, 5);
  assert.ok(world.events.some((ev) => ev.type === 'temporal_rift_ruptured'));
});

test('Overdrive Protocol scales enemy and boss HP by 1.3x and adds Phase II escort', () => {
  const stdWorld = createInitialWorld('title');
  startBossEncounter(stdWorld, false, 'helix-04');
  const stdBossMaxHp = stdWorld.boss!.maxHp;

  const odWorld = createInitialWorld('title');
  setOverdriveDifficulty(odWorld, true);
  startBossEncounter(odWorld, true, 'helix-04');
  const odBossMaxHp = odWorld.boss!.maxHp;
  assert.equal(odBossMaxHp, Math.round(stdBossMaxHp * 1.3));

  // Position Sera right in front of core-exposed boss near Phase II threshold and strike cleanly.
  const boss = odWorld.boss!;
  const enemyBoss = odWorld.enemies.find((e) => e.id === boss.id)!;
  boss.x = 0;
  boss.z = 0;
  enemyBoss.x = 0;
  enemyBoss.z = 0;
  boss.hp = Math.floor(odBossMaxHp * 0.52);
  enemyBoss.hp = boss.hp;
  boss.coreExposed = true;
  boss.aiState = 'recovery';
  boss.stateTimer = 1.0;
  enemyBoss.aiState = 'recovery';

  odWorld.player.x = 0;
  odWorld.player.z = 2.4;
  odWorld.player.rotationY = Math.PI;

  const initialCount = odWorld.enemies.length;
  const hitInp = createEmptyInput(Math.PI);
  hitInp.heavyAttackJustPressed = true;
  stepWorld(odWorld, hitInp, 0.02);
  for (let i = 0; i < 10; i++) {
    stepWorld(odWorld, createEmptyInput(Math.PI), 0.02);
  }
  assert.equal(odWorld.boss?.phase, 2);
  assert.equal(odWorld.enemies.length, initialCount + 1);
  assert.ok(odWorld.enemies.some((e) => e.id.startsWith('enemy-overdrive-escort-')));
});

test('Save V2 storage preserves Weapon Mastery XP, Recursion records, and Overdrive setting', () => {
  const storage = createMemoryStorage();
  const srcWorld = createInitialWorld('title');
  setOverdriveDifficulty(srcWorld, true);
  awardWeaponMasteryXp(srcWorld, 'phase_rail', 165);
  srcWorld.progression.bestRecursionLoop = 6;
  srcWorld.progression.totalRecursionClears = 11;

  const saveRes = saveCampaignProgressToStorage(srcWorld, storage);
  assert.equal(saveRes.written, true);

  const dstWorld = createInitialWorld('title');
  const loaded = loadCampaignProgressFromStorage(dstWorld, storage);
  assert.equal(loaded, true);
  assert.equal(dstWorld.progression.overdriveDifficulty, true);
  assert.equal(dstWorld.progression.weaponMasteryXp.phase_rail, 165);
  assert.equal(dstWorld.progression.bestRecursionLoop, 6);
  assert.equal(dstWorld.progression.totalRecursionClears, 11);

  const hud = extractHudSnapshot(dstWorld);
  assert.equal(hud.progression.overdriveDifficulty, true);
  assert.equal(hud.progression.weaponMasteryXp?.phase_rail, 165);
});

test('SoundEngine resurrect clears disposed flag and recovers diagnostics cleanly across StrictMode cycles', () => {
  const sound = new SoundEngine();
  assert.equal(sound.isDisposed(), false);
  sound.dispose();
  assert.equal(sound.isDisposed(), true);
  sound.resurrect();
  assert.equal(sound.isDisposed(), false);
  const diag = sound.getDiagnostics();
  assert.equal(diag.disposed, false);
  assert.equal(typeof diag.muted, 'boolean');
  assert.equal(typeof diag.contextState, 'string');
});
