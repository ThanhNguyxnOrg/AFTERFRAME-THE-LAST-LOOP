import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHRONICLE_STORY_ARC,
  DIFFICULTY_TIERS,
  ENDING_CHRONICLES,
  computeCampaignEstimatedRuntimeMinutes,
  getDifficultySpec,
  getEndingChronicleSummary,
} from './chronicle-narrative.ts';

test('3-tier difficulty specs escalate enemy HP, damage, speed, and bonus fragments monotonically', () => {
  const std = getDifficultySpec('standard');
  const vet = getDifficultySpec('veteran');
  const sing = getDifficultySpec('singularity');

  assert.ok(vet.enemyHpMult > std.enemyHpMult);
  assert.ok(sing.enemyHpMult > vet.enemyHpMult);
  assert.ok(vet.enemyDamageMult > std.enemyDamageMult);
  assert.ok(sing.enemyDamageMult > vet.enemyDamageMult);
  assert.ok(sing.enemySpeedMult > vet.enemySpeedMult);
  assert.ok(sing.bonusFragmentsPerChapter > vet.bonusFragmentsPerChapter);
  assert.equal(DIFFICULTY_TIERS.veteran.bonusFragmentsPerChapter, 1);
});

test('Chronicle story arc links all 6 chapters with EN/VI parity and ~60+ min campaign runtime', () => {
  const ids = Object.keys(CHRONICLE_STORY_ARC) as Array<keyof typeof CHRONICLE_STORY_ARC>;
  assert.equal(ids.length, 6);
  for (const id of ids) {
    const beat = CHRONICLE_STORY_ARC[id];
    assert.ok(beat.titleEn.length > 5 && beat.titleVi.length > 5);
    assert.ok(beat.synopsisEn.length > 30 && beat.synopsisVi.length > 30);
    assert.ok(beat.lysaClueEn.length > 10 && beat.lysaClueVi.length > 10);
    assert.ok(beat.connectionToNextEn.length > 10 && beat.connectionToNextVi.length > 10);
  }
  assert.ok(computeCampaignEstimatedRuntimeMinutes() >= 60);
});

test('All 4 endings provide coherent EN/VI epilogues with Paradox Break as True Ending', () => {
  const ids = Object.keys(ENDING_CHRONICLES) as Array<keyof typeof ENDING_CHRONICLES>;
  assert.equal(ids.length, 4);
  for (const id of ids) {
    const e = getEndingChronicleSummary(id);
    assert.ok(e.epilogueEn.length > 30 && e.epilogueVi.length > 30);
    assert.ok(e.lysaFateEn.length > 10 && e.lysaFateVi.length > 10);
  }
  assert.equal(getEndingChronicleSummary('paradox').isTrueEnding, true);
  assert.equal(getEndingChronicleSummary('silence').isTrueEnding, false);
});

test('v3.8.0 LYSA_HOLO_MEMORIES covers all 6 sectors with complete EN/VI 3-beat scenes inside arena bounds', async () => {
  const {
    LYSA_HOLO_MEMORIES,
    VALID_HOLO_MEMORY_IDS,
    computeHoloMemoryResonanceBonus,
    getHoloMemoryForChapter,
    sanitizeHoloMemoryIds,
  } = await import('./chronicle-narrative.ts');

  assert.equal(LYSA_HOLO_MEMORIES.length, 6);
  assert.equal(VALID_HOLO_MEMORY_IDS.length, 6);

  for (const mem of LYSA_HOLO_MEMORIES) {
    assert.equal(getHoloMemoryForChapter(mem.chapter).id, mem.id);
    assert.ok(mem.titleEn.length > 5 && mem.titleVi.length > 5);
    assert.ok(mem.locationEn.length > 5 && mem.locationVi.length > 5);
    assert.ok(mem.summaryEn.length > 20 && mem.summaryVi.length > 20);
    assert.equal(mem.beats.length, 3);
    for (const beat of mem.beats) {
      assert.ok(beat.speakerEn.length > 2 && beat.speakerVi.length > 2);
      assert.ok(beat.lineEn.length > 15 && beat.lineVi.length > 15);
    }
    const dist = Math.hypot(mem.x, mem.z);
    assert.ok(dist > 4 && dist < 13.5, `${mem.id} must sit in open sightline inside arena`);
  }

  assert.deepEqual(
    sanitizeHoloMemoryIds([
      'holo_prologue_lysa',
      'INVALID',
      'holo_prologue_lysa',
      'holo_ch3_confession',
    ]),
    ['holo_prologue_lysa', 'holo_ch3_confession']
  );

  const zero = computeHoloMemoryResonanceBonus([]);
  assert.equal(zero.discoveredCount, 0);
  assert.equal(zero.allDamageMult, 1);
  assert.equal(zero.bonusMaxWard, 0);

  const three = computeHoloMemoryResonanceBonus(VALID_HOLO_MEMORY_IDS.slice(0, 3));
  assert.equal(three.discoveredCount, 3);
  assert.ok(Math.abs(three.allDamageMult - 1.03) < 1e-6);
  assert.equal(three.bonusMaxWard, 6);

  const full = computeHoloMemoryResonanceBonus(VALID_HOLO_MEMORY_IDS);
  assert.equal(full.discoveredCount, 6);
  assert.ok(Math.abs(full.allDamageMult - 1.08) < 1e-6);
  assert.equal(full.bonusMaxWard, 16);
});

test('v3.8.0 projectChapterHoloMemory grants first-discovery rewards once, activates 3D projection, and persists via Save V2', async () => {
  const {
    createInitialWorld,
    dismissActiveHoloMemory,
    loadCampaignProgressFromStorage,
    projectChapterHoloMemory,
    saveCampaignProgressToStorage,
    startCampaignRun,
  } = await import('./simulation.ts');

  const world = createInitialWorld();
  startCampaignRun(world, true);
  world.player.integrity = 60;
  world.player.flux = 10;
  world.events.length = 0;

  const first = projectChapterHoloMemory(world);
  assert.equal(first, true);
  assert.equal(world.exploration.activeHoloMemoryId, 'holo_prologue_lysa');
  assert.ok((world.exploration.activeHoloMemoryTimer ?? 0) > 9.0);
  assert.equal(world.player.integrity, 76);
  assert.equal(world.player.flux, 32);
  assert.ok(world.events.some((ev) => ev.type === 'holo_memory_projected'));

  // Dismiss and replay in same chapter: activates projection again without duplicating rewards
  assert.equal(dismissActiveHoloMemory(world), true);
  assert.equal(world.exploration.activeHoloMemoryId, null);

  const replay = projectChapterHoloMemory(world);
  assert.equal(replay, true);
  assert.equal(world.player.integrity, 76);
  assert.equal(world.player.flux, 32);

  // Save V2 round-trip preserves discoveredHoloMemoryIds
  const mockStore = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mockStore.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mockStore.set(k, v);
    },
  };
  const saved = saveCampaignProgressToStorage(world, storage);
  assert.equal(saved.written, true);
  const restored = createInitialWorld();
  assert.equal(loadCampaignProgressFromStorage(restored, storage), true);
  assert.deepEqual(restored.exploration.discoveredHoloMemoryIds, ['holo_prologue_lysa']);
});

