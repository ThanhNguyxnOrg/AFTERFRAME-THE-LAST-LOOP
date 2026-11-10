import assert from 'node:assert/strict';
import test from 'node:test';
import { GAME_CONFIG } from './config.ts';
import { InputController } from './input.ts';
import {
  CAMPAIGN_SAVE_VERSION,
  CAMPAIGN_STORAGE_KEY,
  advanceCampaignChapter,
  createEmptyInput,
  createInitialWorld,
  hasResumableCampaign,
  loadCampaignProgressFromStorage,
  parseAndApplyCampaignProgress,
  restoreSavedCampaignProgress,
  retryBossFromCheckpoint,
  saveCampaignProgressToStorage,
  selectChronicleLoomEnding,
  serializeCampaignProgress,
  startBossEncounter,
  startCampaignChapterSelect,
  startCampaignRun,
  startPracticeStandardRun,
  stepWorld,
  switchPlayerWeapon,
  transitionCampaignToBoss,
  triggerBossDefeat,
  grantProgressionReward,
  purchaseWeaponUpgrade,
  equipWeaponUpgrade,
  attemptEnvironmentalInteraction,
  completeMissionObjective,
  discoverCodexEntry,
  discoverSecretArea,
  triggerNarrativeEvent,
  buildCampaignEndingDiscoverySummary,
  getAllNarrativeEventDefinitions,
} from './simulation.ts';

test('completed chapters remain isolated replays after save reload without an in-memory snapshot', () => {
  const world = createInitialWorld('title');
  const saved = JSON.stringify({
    unlockedChapters: ['prologue', 'chapter_1_helix', 'chapter_2_choir', 'chapter_3_curator', 'chapter_4_matron', 'chapter_5_loom'],
    completedChapters: ['prologue', 'chapter_1_helix', 'chapter_2_choir', 'chapter_3_curator', 'chapter_4_matron', 'chapter_5_loom'],
    recoveredLogs: ['LOG-00', 'LOG-01', 'LOG-02', 'LOG-03', 'LOG-04', 'LOG-05'],
    completedEndings: ['silence'],
  });
  assert.equal(parseAndApplyCampaignProgress(world, saved), true);
  const before = serializeCampaignProgress(world);
  assert.equal(world.run.savedCampaignSnapshot, null);
  assert.equal(startCampaignChapterSelect(world, 'chapter_1_helix', true), true);
  assert.equal(world.run.isChapterReplay, true);
  world.run.pendingNextChapter = 'chapter_2_choir';
  assert.equal(advanceCampaignChapter(world), false);
  assert.equal(serializeCampaignProgress(world), before);
  assert.equal(startCampaignChapterSelect(world, 'chapter_5_loom', true), true);
  assert.equal(world.run.isChapterReplay, true);
  assert.equal(selectChronicleLoomEnding(world, 'witness'), true);
  const reloaded = createInitialWorld('title');
  parseAndApplyCampaignProgress(reloaded, serializeCampaignProgress(world));
  assert.deepEqual(reloaded.run.completedEndings, ['silence', 'witness']);
});

test('1. Checkpoint creation & reload restoration: exact chapter, stage, integrity, flux, elapsedTime, and stats survive full reload', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);
  transitionCampaignToBoss(world, true, 'chapter_1_helix');

  // Player fights HELIX-04 with specific battle stats and resource levels
  world.player.integrity = 64;
  world.player.flux = 78;
  world.elapsedTime = 142.5;
  world.stats = {
    damageDealt: 1850,
    damageTaken: 36,
    parriesLanded: 5,
    vulnerableHits: 8,
  };
  world.resonance.convergenceCount = 2;
  world.relay.activationCount = 4;

  triggerBossDefeat(world);
  assert.equal(advanceCampaignChapter(world, true), true);
  assert.equal(world.run.chapter, 'chapter_2_choir');
  assert.equal(world.run.stage, 'boss_fight');
  assert.ok(world.run.bossCheckpoint);

  const expectedCheckpoint = structuredClone(world.run.bossCheckpoint);
  assert.equal(expectedCheckpoint.chapter, 'chapter_2_choir');
  assert.equal(expectedCheckpoint.bossId, 'the-choir');
  assert.equal(expectedCheckpoint.integrity, 75); // synchronized to bossCheckpointMinIntegrityFloor (75) from 64 (+11)
  assert.equal(expectedCheckpoint.flux, 78);
  assert.equal(expectedCheckpoint.replenishedIntegrity, 11);
  assert.equal(expectedCheckpoint.elapsedTimeAtCheckpoint, 142.5);
  assert.deepEqual(expectedCheckpoint.statsAtCheckpoint, {
    damageDealt: 1850,
    damageTaken: 36,
    parriesLanded: 5,
    vulnerableHits: 8,
    convergencesTriggered: 2,
    relaysUsed: 4,
  });

  // Serialize to storage JSON and simulate a full browser reload into Title screen
  const savedJson = serializeCampaignProgress(world);
  const parsedPayload = JSON.parse(savedJson);
  assert.equal(parsedPayload.version, CAMPAIGN_SAVE_VERSION);
  assert.ok(parsedPayload.activeCampaign);
  assert.equal(parsedPayload.activeCampaign.chapter, 'chapter_2_choir');
  assert.deepEqual(parsedPayload.activeCampaign.bossCheckpoint, expectedCheckpoint);

  const reloadedWorld = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(reloadedWorld, savedJson), true);
  assert.equal(hasResumableCampaign(reloadedWorld), true);
  assert.ok(reloadedWorld.run.savedCampaignSnapshot);
  assert.deepEqual(reloadedWorld.run.savedCampaignSnapshot.bossCheckpoint, expectedCheckpoint);

  // Clicking CONTINUE CAMPAIGN on Title screen restores exact checkpoint state
  assert.equal(restoreSavedCampaignProgress(reloadedWorld), true);
  assert.equal(reloadedWorld.run.mode, 'campaign');
  assert.equal(reloadedWorld.run.chapter, 'chapter_2_choir');
  assert.equal(reloadedWorld.run.stage, 'boss_fight');
  assert.equal(reloadedWorld.player.integrity, 75);
  assert.equal(reloadedWorld.player.ghostIntegrity, 75);
  assert.equal(reloadedWorld.player.flux, 78);
  assert.equal(reloadedWorld.elapsedTime, 142.5);
  assert.deepEqual(reloadedWorld.stats, {
    damageDealt: 1850,
    damageTaken: 36,
    parriesLanded: 5,
    vulnerableHits: 8,
  });
  assert.equal(reloadedWorld.resonance.convergenceCount, 2);
  assert.equal(reloadedWorld.relay.activationCount, 4);
  assert.deepEqual(reloadedWorld.run.bossCheckpoint, expectedCheckpoint);
});

test('2. Legacy save migration: unversioned v1 save data upgrades cleanly to v2 without losing unlocked/completed chapters, logs, or endings', () => {
  const legacyV1Save = JSON.stringify({
    unlockedChapters: ['prologue', 'chapter_1_helix', 'chapter_2_choir', 'chapter_3_curator'],
    completedChapters: ['prologue', 'chapter_1_helix', 'chapter_2_choir'],
    recoveredLogs: ['LOG-00', 'LOG-01', 'LOG-02'],
    completedEndings: ['witness'],
  });

  const world = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(world, legacyV1Save), true);
  assert.deepEqual(world.run.unlockedChapters, [
    'prologue',
    'chapter_1_helix',
    'chapter_2_choir',
    'chapter_3_curator',
  ]);
  assert.deepEqual(world.run.completedChapters, [
    'prologue',
    'chapter_1_helix',
    'chapter_2_choir',
  ]);
  assert.deepEqual(world.run.recoveredLogs, ['LOG-00', 'LOG-01', 'LOG-02']);
  assert.deepEqual(world.run.completedEndings, ['witness']);
  assert.equal(world.run.savedCampaignSnapshot, null);

  const upgradedJson = serializeCampaignProgress(world);
  const upgraded = JSON.parse(upgradedJson);
  assert.equal(upgraded.version, 2);
  assert.deepEqual(upgraded.unlockedChapters, [
    'prologue',
    'chapter_1_helix',
    'chapter_2_choir',
    'chapter_3_curator',
  ]);
  assert.deepEqual(upgraded.completedChapters, [
    'prologue',
    'chapter_1_helix',
    'chapter_2_choir',
  ]);
  assert.deepEqual(upgraded.recoveredLogs, ['LOG-00', 'LOG-01', 'LOG-02']);
  assert.deepEqual(upgraded.completedEndings, ['witness']);
  assert.equal(upgraded.activeCampaign, null);
});

test('3. Missing or invalid save data: null, empty, malformed JSON, arrays, primitives, and unsupported versions fail safely', () => {
  const invalidPayloads: Array<string | null | undefined> = [
    null,
    undefined,
    '',
    '{malformed json',
    '[]',
    '"just a string"',
    '42',
    JSON.stringify({ version: 99, unlockedChapters: ['chapter_1_helix'] }),
    JSON.stringify({ version: '2', unlockedChapters: ['chapter_1_helix'] }),
  ];

  for (const payload of invalidPayloads) {
    const world = createInitialWorld('title');
    assert.equal(parseAndApplyCampaignProgress(world, payload), false);
    assert.deepEqual(world.run.unlockedChapters, ['prologue']);
    assert.deepEqual(world.run.completedChapters, []);
    assert.deepEqual(world.run.recoveredLogs, []);
    assert.deepEqual(world.run.completedEndings, []);
    assert.equal(world.run.savedCampaignSnapshot, null);
  }
});

test('4. Malformed numeric values and invalid chapter/stage combinations in activeCampaign are rejected without crashing', () => {
  const malformedActiveCases = [
    // Invalid chapter/stage combination (prologue cannot be in boss_fight)
    {
      chapter: 'prologue',
      stage: 'boss_fight',
      pendingNextChapter: null,
      bossCheckpoint: null,
    },
    // Completed chapter_5_loom is not a valid active resumable stage
    {
      chapter: 'chapter_5_loom',
      stage: 'completed',
      pendingNextChapter: null,
      bossCheckpoint: null,
    },
    // Negative integrity in checkpoint
    {
      chapter: 'chapter_2_choir',
      stage: 'boss_fight',
      pendingNextChapter: null,
      bossCheckpoint: {
        chapter: 'chapter_2_choir',
        bossId: 'the-choir',
        integrity: -15,
        flux: 50,
        replenishedIntegrity: 10,
        elapsedTimeAtCheckpoint: 30,
        statsAtCheckpoint: {
          damageDealt: 100,
          damageTaken: 10,
          parriesLanded: 1,
          vulnerableHits: 1,
          convergencesTriggered: 0,
          relaysUsed: 0,
        },
      },
    },
    // Non-finite stats or mismatched bossId for chapter
    {
      chapter: 'chapter_2_choir',
      stage: 'boss_fight',
      pendingNextChapter: null,
      bossCheckpoint: {
        chapter: 'chapter_2_choir',
        bossId: 'helix-04', // Wrong bossId for chapter_2_choir!
        integrity: 80,
        flux: 50,
        replenishedIntegrity: 10,
        elapsedTimeAtCheckpoint: 30,
        statsAtCheckpoint: {
          damageDealt: 100,
          damageTaken: 10,
          parriesLanded: 1,
          vulnerableHits: 1,
          convergencesTriggered: 0,
          relaysUsed: 0,
        },
      },
    },
  ];

  for (const badActive of malformedActiveCases) {
    const world = createInitialWorld('title');
    const raw = JSON.stringify({
      version: 2,
      unlockedChapters: ['prologue', 'chapter_1_helix', 'chapter_2_choir'],
      completedChapters: ['prologue', 'chapter_1_helix'],
      recoveredLogs: ['LOG-00', 'LOG-01'],
      completedEndings: [],
      activeCampaign: badActive,
    });
    assert.equal(parseAndApplyCampaignProgress(world, raw), true);
    // Valid top-level unlock/completion data is preserved, but malformed activeCampaign is safely rejected
    assert.deepEqual(world.run.unlockedChapters, [
      'prologue',
      'chapter_1_helix',
      'chapter_2_choir',
    ]);
    assert.equal(world.run.savedCampaignSnapshot, null);
    assert.equal(hasResumableCampaign(world), false);
  }
});

test('5. Completed chapters & endings survive save/load round trips alongside post-victory pendingNextChapter transition', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);
  transitionCampaignToBoss(world, true, 'chapter_1_helix');
  world.player.integrity = 82;
  world.player.flux = 60;
  triggerBossDefeat(world);

  // Player is on the Victory modal of Chapter I (pendingNextChapter = 'chapter_2_choir') and reloads before clicking Advance
  const savedOnVictoryModal = serializeCampaignProgress(world);
  const reloaded = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(reloaded, savedOnVictoryModal), true);
  assert.equal(hasResumableCampaign(reloaded), true);
  assert.deepEqual(reloaded.run.completedChapters, ['prologue', 'chapter_1_helix']);
  assert.deepEqual(reloaded.run.recoveredLogs, ['LOG-00', 'LOG-01']);

  // Restoring from a post-victory snapshot advances cleanly into the pending next chapter with the post-victory checkpoint
  assert.equal(restoreSavedCampaignProgress(reloaded), true);
  assert.equal(reloaded.run.chapter, 'chapter_2_choir');
  assert.equal(reloaded.run.stage, 'boss_fight');
  assert.equal(reloaded.run.pendingNextChapter, null);
  assert.equal(reloaded.player.integrity, 82);
  assert.equal(reloaded.player.flux, 60);
});

test('6. Completed campaign does not become resumable after selecting a Chronicle Loom ending', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);
  transitionCampaignToBoss(world, true, 'chapter_4_matron');
  triggerBossDefeat(world);
  assert.equal(advanceCampaignChapter(world, true), true);
  assert.equal(world.run.chapter, 'chapter_5_loom');
  assert.equal(world.run.stage, 'chronicle_loom');

  // Select Chronicle Loom ending
  assert.equal(selectChronicleLoomEnding(world, 'continuity'), true);
  assert.equal(world.run.selectedEnding, 'continuity');
  assert.equal(world.run.savedCampaignSnapshot, null);

  const savedJson = serializeCampaignProgress(world);
  const parsed = JSON.parse(savedJson);
  assert.equal(parsed.activeCampaign, null);
  assert.deepEqual(parsed.completedEndings, ['continuity']);
  assert.ok(parsed.completedChapters.includes('chapter_5_loom'));

  const reloaded = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(reloaded, savedJson), true);
  assert.equal(hasResumableCampaign(reloaded), false);
  assert.equal(reloaded.run.savedCampaignSnapshot, null);
  assert.deepEqual(reloaded.run.completedEndings, ['continuity']);
});

test('7. Earlier chapter replay isolation: replaying an unlocked earlier chapter preserves active campaign checkpoint across reload', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);
  transitionCampaignToBoss(world, true, 'chapter_1_helix');
  world.player.integrity = 83;
  world.player.flux = 66;
  triggerBossDefeat(world);
  assert.equal(advanceCampaignChapter(world, true), true);
  assert.equal(world.run.chapter, 'chapter_2_choir');

  // Now replay Chapter I via Chapter Select while Chapter II is the active campaign
  assert.equal(startCampaignChapterSelect(world, 'chapter_1_helix', true), true);
  assert.equal(world.run.isChapterReplay, true);
  assert.equal(world.run.chapter, 'chapter_1_helix');
  assert.ok(world.run.savedCampaignSnapshot);
  assert.equal(world.run.savedCampaignSnapshot.chapter, 'chapter_2_choir');

  // Mutate player stats during replay and even defeat Chapter I boss again
  world.player.integrity = 12;
  world.player.flux = 5;
  triggerBossDefeat(world);
  assert.equal(advanceCampaignChapter(world, true), false);

  // Save during replay and reload browser
  const savedDuringReplay = serializeCampaignProgress(world);
  const reloaded = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(reloaded, savedDuringReplay), true);
  assert.equal(hasResumableCampaign(reloaded), true);
  assert.equal(reloaded.run.savedCampaignSnapshot?.chapter, 'chapter_2_choir');
  assert.equal(reloaded.run.savedCampaignSnapshot?.bossCheckpoint?.integrity, 83);
  assert.equal(reloaded.run.savedCampaignSnapshot?.bossCheckpoint?.flux, 66);

  // Resume saved campaign from Title screen
  assert.equal(restoreSavedCampaignProgress(reloaded), true);
  assert.equal(reloaded.run.chapter, 'chapter_2_choir');
  assert.equal(reloaded.run.isChapterReplay, false);
  assert.equal(reloaded.player.integrity, 83);
  assert.equal(reloaded.player.flux, 66);
});

test('8. Practice mode isolation: Practice Arena and Boss Select never overwrite saved campaign checkpoint', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);
  transitionCampaignToBoss(world, true, 'chapter_2_choir');
  world.player.integrity = 88;
  world.player.flux = 84;
  triggerBossDefeat(world);
  assert.equal(advanceCampaignChapter(world, true), true);
  assert.equal(world.run.chapter, 'chapter_3_curator');

  // Enter Practice Arena
  startPracticeStandardRun(world);
  assert.equal(world.run.mode, 'practice_standard');
  world.player.integrity = 10;
  world.player.flux = 0;

  // Enter Practice Boss Select
  startBossEncounter(world, true, 'matron-v');
  assert.equal(world.run.mode, 'practice_boss');

  // Serialize during practice mode and reload
  const savedDuringPractice = serializeCampaignProgress(world);
  const reloaded = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(reloaded, savedDuringPractice), true);
  assert.equal(hasResumableCampaign(reloaded), true);
  assert.equal(reloaded.run.savedCampaignSnapshot?.chapter, 'chapter_3_curator');
  assert.equal(reloaded.run.savedCampaignSnapshot?.bossCheckpoint?.integrity, 88);
  assert.equal(reloaded.run.savedCampaignSnapshot?.bossCheckpoint?.flux, 84);
});

test('9. Checkpoint retry after reload restores exact checkpoint Integrity, Flux, and combat stats while resetting boss', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);
  transitionCampaignToBoss(world, true, 'chapter_1_helix');
  world.player.integrity = 86;
  world.player.flux = 45;
  world.stats = {
    damageDealt: 1200,
    damageTaken: 39,
    parriesLanded: 3,
    vulnerableHits: 4,
  };
  triggerBossDefeat(world);
  assert.equal(advanceCampaignChapter(world, true), true);

  // Reload and resume Chapter II
  const savedJson = serializeCampaignProgress(world);
  const reloaded = createInitialWorld('title');
  parseAndApplyCampaignProgress(reloaded, savedJson);
  assert.equal(restoreSavedCampaignProgress(reloaded), true);

  // Player takes fatal damage during Chapter II boss fight
  reloaded.player.integrity = 0;
  reloaded.player.flux = 0;
  reloaded.outcome = 'defeat';
  if (reloaded.boss) {
    reloaded.boss.hp = 120;
  }

  // Retry from checkpoint
  retryBossFromCheckpoint(reloaded);
  assert.equal(reloaded.outcome, 'none');
  assert.equal(reloaded.player.integrity, 86);
  assert.equal(reloaded.player.flux, 45);
  assert.equal(reloaded.stats.damageDealt, 1200);
  assert.equal(reloaded.stats.parriesLanded, 3);
  assert.ok(reloaded.boss);
  assert.equal(reloaded.boss.hp, reloaded.boss.maxHp);
});

test('10. Storage unavailable or throwing: loadCampaignProgressFromStorage and saveCampaignProgressToStorage never throw', () => {
  const world = createInitialWorld('title');
  const throwingStorage = {
    getItem(_key: string): string | null {
      throw new Error('QuotaExceededError / SecurityError');
    },
    setItem(_key: string, _val: string): void {
      throw new Error('QuotaExceededError / SecurityError');
    },
  };

  assert.doesNotThrow(() => {
    const loaded = loadCampaignProgressFromStorage(world, throwingStorage);
    assert.equal(loaded, false);
  });

  assert.doesNotThrow(() => {
    const res = saveCampaignProgressToStorage(world, throwingStorage, null);
    assert.equal(res.written, false);
    assert.ok(res.json.length > 0);
  });

  assert.equal(loadCampaignProgressFromStorage(world, null), false);
  assert.equal(saveCampaignProgressToStorage(world, null, null).written, false);
});

test('11. No redundant writes when save state is unchanged across frames', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);

  const writes: Array<{ key: string; value: string }> = [];
  const mockStorage = {
    setItem(key: string, value: string): void {
      writes.push({ key, value });
    },
  };

  const first = saveCampaignProgressToStorage(world, mockStorage, null);
  assert.equal(first.written, true);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].key, CAMPAIGN_STORAGE_KEY);

  // Subsequent frame checks with identical state must not write to storage
  const second = saveCampaignProgressToStorage(world, mockStorage, first.json);
  assert.equal(second.written, false);
  assert.equal(writes.length, 1);

  // Advancing campaign state triggers exactly one new write
  transitionCampaignToBoss(world, true, 'chapter_1_helix');
  const third = saveCampaignProgressToStorage(world, mockStorage, second.json);
  assert.equal(third.written, true);
  assert.equal(writes.length, 2);
});

test('12. Save/load round trip is idempotent and deterministic', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);
  transitionCampaignToBoss(world, true, 'chapter_3_curator');
  world.player.integrity = 68;
  world.player.flux = 52;
  triggerBossDefeat(world);
  advanceCampaignChapter(world, true);

  const json1 = serializeCampaignProgress(world);
  const world2 = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(world2, json1), true);
  const json2 = serializeCampaignProgress(world2);
  assert.equal(json1, json2);

  assert.equal(restoreSavedCampaignProgress(world2), true);
  const json3 = serializeCampaignProgress(world2);
  assert.equal(json1, json3);
});

test('13. Touch camera orbit rotates aimYaw and aimPitch smoothly, respects sensitivity and invertY, and never triggers unintended attacks', () => {
  const input = new InputController();
  input.resetCameraAngles();
  const initialYaw = input.aimYaw;
  const initialPitch = input.aimPitch;

  assert.equal(input.startTouchCameraLook(1, 200, 300, 'touch'), true);
  assert.equal(input.isTouchCameraActive(), true);
  assert.equal(input.moveTouchCameraLook(1, 260, 250, 'touch'), true);

  const frame1 = input.consumeFrameInput(1 / 60);
  assert.notEqual(frame1.aimYaw, initialYaw);
  assert.notEqual(frame1.aimPitch, initialPitch);
  assert.equal(frame1.cameraDragJustStarted, true);
  assert.equal(frame1.lightAttackJustPressed, false);
  assert.equal(frame1.heavyAttackJustPressed, false);
  assert.equal(frame1.heavyHoldActive, false);

  // Pitch clamps within [minPitch, maxPitch]
  input.moveTouchCameraLook(1, 260, -5000, 'touch');
  assert.ok(input.aimPitch >= GAME_CONFIG.camera.minPitch);
  input.moveTouchCameraLook(1, 260, 5000, 'touch');
  assert.ok(input.aimPitch <= GAME_CONFIG.camera.maxPitch);

  input.endTouchCameraLook(1, 'touch');
  assert.equal(input.isTouchCameraActive(), false);

  // Verify Invert-Y flips vertical pitch direction
  input.resetCameraAngles();
  input.setCameraSettings({ sensitivity: 1.5, invertY: false });
  const basePitch = input.aimPitch;
  input.startTouchCameraLook(2, 100, 100, 'pointer');
  input.moveTouchCameraLook(2, 100, 140, 'pointer');
  const normalPitchDelta = input.aimPitch - basePitch;
  input.endTouchCameraLook(2, 'pointer');

  input.resetCameraAngles();
  input.setCameraSettings({ sensitivity: 1.5, invertY: true });
  input.startTouchCameraLook(3, 100, 100, 'pointer');
  input.moveTouchCameraLook(3, 100, 140, 'pointer');
  const invertedPitchDelta = input.aimPitch - basePitch;
  input.endTouchCameraLook(3, 'pointer');

  assert.ok(normalPitchDelta > 0);
  assert.ok(invertedPitchDelta < 0);
  assert.ok(Math.abs(Math.abs(normalPitchDelta) - Math.abs(invertedPitchDelta)) < 1e-9);

  // Verify clearAllInputs clears active touch camera and touch move hold
  input.setTouchMoveHold(-1, 0, 5);
  input.startTouchCameraLook(6, 150, 150, 'touch');
  input.clearAllInputs();
  assert.equal(input.isTouchCameraActive(), false);
  assert.deepEqual(input.getTouchMoveHold(), { x: 0, z: 0, pointerId: null });
});

test('14. Equipped weapon (chrono_edge / pulsecaster) persists across v2 campaign checkpoints, full reload, and legacy save fallback', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);
  assert.equal(switchPlayerWeapon(world, 'pulsecaster'), true);
  transitionCampaignToBoss(world, true, 'chapter_2_choir');

  assert.equal(world.player.equippedWeaponId, 'pulsecaster');
  assert.equal(world.run.bossCheckpoint?.equippedWeaponId, 'pulsecaster');

  const savedJson = serializeCampaignProgress(world);
  const reloaded = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(reloaded, savedJson), true);
  assert.equal(reloaded.run.savedCampaignSnapshot?.equippedWeaponId, 'pulsecaster');
  assert.equal(
    reloaded.run.savedCampaignSnapshot?.bossCheckpoint?.equippedWeaponId,
    'pulsecaster'
  );

  // Continue Campaign restores pulsecaster
  assert.equal(restoreSavedCampaignProgress(reloaded), true);
  assert.equal(reloaded.player.equippedWeaponId, 'pulsecaster');

  // Switch to chrono_edge mid-fight, then retryBossFromCheckpoint restores checkpoint's pulsecaster
  reloaded.player.equippedWeaponId = 'chrono_edge';
  retryBossFromCheckpoint(reloaded, true);
  assert.equal(reloaded.player.equippedWeaponId, 'pulsecaster');

  // Legacy v2 payload without equippedWeaponId safely defaults to chrono_edge
  const legacyV2 = JSON.parse(savedJson);
  delete legacyV2.activeCampaign.equippedWeaponId;
  delete legacyV2.activeCampaign.bossCheckpoint.equippedWeaponId;
  const fallbackWorld = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(fallbackWorld, JSON.stringify(legacyV2)), true);
  assert.equal(restoreSavedCampaignProgress(fallbackWorld), true);
  assert.equal(fallbackWorld.player.equippedWeaponId, 'chrono_edge');
});

test('15. Phase 15 Weapon Progression (Memory Fragments, claimed rewards, purchased & equipped upgrades) persists across v2 saves, migrates legacy v1/v2 payloads, and isolates Practice / Chapter Replay', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);

  // Earn 6 Memory Fragments across Prologue & Chapter I
  assert.equal(grantProgressionReward(world, 'prologue_calibration_teach'), true); // +1
  assert.equal(grantProgressionReward(world, 'prologue_bay_proxies_cleared'), true); // +2
  transitionCampaignToBoss(world, true, 'chapter_1_helix');
  triggerBossDefeat(world); // +3 -> total 6
  assert.equal(world.progression.memoryFragments, 6);

  // Purchase Breaker Cleave (cost 2) and Thermal Sink (cost 2) -> 2 fragments remaining
  assert.equal(purchaseWeaponUpgrade(world, 'edge_breaker_cleave').outcome, 'purchased');
  assert.equal(purchaseWeaponUpgrade(world, 'pulse_thermal_sink').outcome, 'purchased');
  assert.equal(world.progression.memoryFragments, 2);
  assert.equal(world.progression.equippedUpgrades.chrono_edge, 'edge_breaker_cleave');
  assert.equal(world.progression.equippedUpgrades.pulsecaster, 'pulse_thermal_sink');

  // Advance to Chapter II
  assert.equal(advanceCampaignChapter(world, true), true);
  const savedJson = serializeCampaignProgress(world);

  // Reload into a fresh Title world
  const reloaded = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(reloaded, savedJson), true);
  assert.equal(reloaded.progression.memoryFragments, 2);
  assert.deepEqual(reloaded.progression.purchasedUpgrades, [
    'edge_breaker_cleave',
    'pulse_thermal_sink',
  ]);
  assert.equal(reloaded.progression.equippedUpgrades.chrono_edge, 'edge_breaker_cleave');
  assert.equal(reloaded.progression.equippedUpgrades.pulsecaster, 'pulse_thermal_sink');

  // Continue Campaign from Title restores full progression state
  assert.equal(restoreSavedCampaignProgress(reloaded), true);
  assert.equal(reloaded.progression.memoryFragments, 2);
  assert.equal(reloaded.progression.equippedUpgrades.chrono_edge, 'edge_breaker_cleave');
  assert.equal(reloaded.progression.equippedUpgrades.pulsecaster, 'pulse_thermal_sink');

  // Enter Practice Mode and modify progression in-memory -> serialized campaign save must remain untouched!
  startPracticeStandardRun(reloaded);
  reloaded.progression.memoryFragments = 99;
  equipWeaponUpgrade(reloaded, 'chrono_edge', null);
  const practiceJson = serializeCampaignProgress(reloaded);
  assert.equal(
    practiceJson,
    savedJson,
    'Practice Mode must never overwrite persisted campaign weapon progression'
  );

  // Restore saved campaign from Practice Mode -> restores original 2 fragments & equipped upgrades
  assert.equal(restoreSavedCampaignProgress(reloaded), true);
  assert.equal(reloaded.progression.memoryFragments, 2);
  assert.equal(reloaded.progression.equippedUpgrades.chrono_edge, 'edge_breaker_cleave');

  // Legacy v2 payload without progression field safely migrates to clean default progression
  const legacyObj = JSON.parse(savedJson);
  delete legacyObj.progression;
  if (legacyObj.activeCampaign) {
    delete legacyObj.activeCampaign.progression;
  }
  // Corrupt one upgrade ID to verify sanitization
  const corruptedObj = JSON.parse(savedJson);
  corruptedObj.progression = {
    memoryFragments: 4,
    claimedRewardIds: ['prologue_calibration_teach', 'not_a_real_reward'],
    purchasedUpgrades: ['edge_breaker_cleave', 'fake_upgrade_id'],
    equippedUpgrades: {
      chrono_edge: 'pulse_thermal_sink', // wrong weapon slot!
      pulsecaster: 'fake_upgrade_id', // invalid upgrade!
    },
  };

  const migratedLegacy = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(migratedLegacy, JSON.stringify(legacyObj)), true);
  assert.equal(migratedLegacy.progression.memoryFragments, 0);
  assert.deepEqual(migratedLegacy.progression.purchasedUpgrades, []);

  const sanitizedWorld = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(sanitizedWorld, JSON.stringify(corruptedObj)), true);
  assert.equal(sanitizedWorld.progression.memoryFragments, 4);
  assert.deepEqual(sanitizedWorld.progression.claimedRewardIds, ['prologue_calibration_teach']);
  assert.deepEqual(sanitizedWorld.progression.purchasedUpgrades, ['edge_breaker_cleave']);
  assert.equal(
    sanitizedWorld.progression.equippedUpgrades.chrono_edge,
    null,
    'Sanitizer rejects upgrade equipped in the wrong weapon slot'
  );
  assert.equal(
    sanitizedWorld.progression.equippedUpgrades.pulsecaster,
    null,
    'Sanitizer rejects unknown upgrade ID'
  );
});

test('16. Phase 17.1 Full Real-Simulation Prologue Calibration + Bay 04 Victory -> transition_to_boss -> chapter_1_helix Journey, Duplicate-Advance Protection & Save/Reload Isolation', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);

  assert.equal(world.run.mode, 'campaign');
  assert.equal(world.run.chapter, 'prologue');
  assert.equal(world.run.stage, 'calibration');
  assert.equal(world.encounter.encounterId, 'prologue_calibration_bay');
  assert.equal(world.progression.memoryFragments, 0);

  // Move Bay 04 enemies temporarily out of aggro range while executing the 3 calibration steps
  for (const e of world.enemies) {
    e.x = 12.0;
    e.z = -12.0;
    e.aiState = 'idle';
  }

  // --- STEP 1 (TEACH): Record Echo on Anchor Pad 01, Replay to hold gate open, Cross West ---
  const pad1 = world.pressurePlate;
  world.player.x = pad1.x;
  world.player.z = pad1.z;
  const rec1Start = createEmptyInput(Math.PI);
  rec1Start.echoRecordJustPressed = true;
  stepWorld(world, rec1Start, 0.02);
  for (let i = 0; i < 30; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const rec1Stop = createEmptyInput(Math.PI);
  rec1Stop.echoRecordJustPressed = true;
  stepWorld(world, rec1Stop, 0.02);

  const play1 = createEmptyInput(Math.PI);
  play1.echoPlayJustPressed = true;
  stepWorld(world, play1, 0.02);
  assert.equal(world.pressurePlate.active, true, 'Echo replay activates Anchor Pad 01');
  assert.equal(world.pressurePlate.barrierOpen, true, 'Anchor Pad 01 opens Gate 01');

  // Move live Sera West across Gate 01 while Echo holds Pad 01
  world.player.x = pad1.receiverX - pad1.receiverRadius - GAME_CONFIG.player.radius - 0.1;
  world.player.z = pad1.receiverZ;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(world.puzzle.teachCompleted, true, 'Crossing Gate 01 completes Step 1 (TEACH)');
  assert.equal(world.progression.memoryFragments, 1);
  assert.ok(world.progression.claimedRewardIds.includes('prologue_calibration_teach'));

  // --- STEP 2 (TEST): Record Echo Heavy Cleave at North Kinetic Receiver & Replay ---
  const recPad = world.puzzle.heavyReceiver;
  world.player.x = recPad.x;
  world.player.z = recPad.z;
  world.player.rotationY = recPad.targetYaw;
  const rec2Start = createEmptyInput(recPad.targetYaw);
  rec2Start.echoRecordJustPressed = true;
  stepWorld(world, rec2Start, 0.02);

  const heavyInput = createEmptyInput(recPad.targetYaw);
  heavyInput.heavyAttackJustPressed = true;
  stepWorld(world, heavyInput, 0.02);
  for (let i = 0; i < 30; i++) {
    stepWorld(world, createEmptyInput(recPad.targetYaw), 0.02);
  }
  const rec2Stop = createEmptyInput(recPad.targetYaw);
  rec2Stop.echoRecordJustPressed = true;
  stepWorld(world, rec2Stop, 0.02);

  const play2 = createEmptyInput(recPad.targetYaw);
  play2.echoPlayJustPressed = true;
  stepWorld(world, play2, 0.02);
  for (let i = 0; i < 25; i++) {
    stepWorld(world, createEmptyInput(recPad.targetYaw), 0.02);
  }
  assert.equal(world.puzzle.heavyReceiver.charged, true, 'Echo Heavy strike charges North Receiver');
  assert.equal(world.puzzle.testCompleted, true, 'Charging North Receiver completes Step 2 (TEST)');
  assert.equal(world.progression.memoryFragments, 2);
  assert.ok(world.progression.claimedRewardIds.includes('prologue_calibration_test'));

  // --- STEP 3 (COMBINE): Record Echo holding Combine Pad 02 while Receiver is charged & Cross Final Barrier ---
  const pad2 = world.puzzle.combinePlate;
  world.player.x = pad2.x;
  world.player.z = pad2.z;
  const rec3Start = createEmptyInput(Math.PI);
  rec3Start.echoRecordJustPressed = true;
  stepWorld(world, rec3Start, 0.02);
  for (let i = 0; i < 30; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const rec3Stop = createEmptyInput(Math.PI);
  rec3Stop.echoRecordJustPressed = true;
  stepWorld(world, rec3Stop, 0.02);

  const play3 = createEmptyInput(Math.PI);
  play3.echoPlayJustPressed = true;
  stepWorld(world, play3, 0.02);
  assert.equal(world.puzzle.combinePlate.active, true, 'Echo holds Combine Pad 02');
  assert.equal(world.puzzle.finalBarrier.open, true, 'Dual condition opens Final Calibration Barrier');

  // While only 2 of 3 Bay 04 proxies are defeated and Final Barrier has not yet been crossed, Prologue remains in calibration
  world.enemies[0].hp = 0;
  world.enemies[0].aiState = 'ko';
  world.enemies[1].hp = 0;
  world.enemies[1].aiState = 'ko';
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(world.run.stage, 'calibration', 'Must remain in calibration while 3rd proxy is alive and barrier uncrossed');

  // Defeat the 3rd Bay 04 proxy and move live Sera into the completion zone West of the Final Barrier
  world.enemies[2].hp = 0;
  world.enemies[2].aiState = 'ko';
  world.player.x = world.puzzle.finalBarrier.completionX;
  world.player.z = world.puzzle.finalBarrier.completionZ;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);

  assert.equal(world.puzzle.combineCompleted, true);
  assert.equal(world.puzzle.completed, true);
  assert.ok(world.progression.claimedRewardIds.includes('prologue_calibration_combine'));
  assert.ok(world.progression.claimedRewardIds.includes('prologue_bay_proxies_cleared'));

  assert.equal(world.run.stage, 'transition_to_boss');
  assert.equal(world.run.pendingNextChapter, 'chapter_1_helix');
  assert.equal(world.encounter.completed, true);
  assert.equal(world.echo.state, 'idle', 'Echo actor is cleaned up on transition_to_boss');
  assert.equal(world.projectiles.length, 0);
  assert.equal(world.progression.memoryFragments, 6, 'All 4 Prologue rewards total 6 Memory Fragments');
  assert.ok(world.run.recoveredLogs.includes('LOG-00'));

  // Step through the containment transition timer to enter Chapter I: HELIX-04
  for (let i = 0; i < 160; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
    if ((world.run.chapter as string) === 'chapter_1_helix') break;
  }
  assert.equal(world.run.chapter, 'chapter_1_helix');
  assert.equal(world.run.stage, 'boss_intro');
  // Step through the boss intro arrival banner (or skip) to reach active boss_fight
  for (let i = 0; i < 160; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
    if ((world.run.stage as string) === 'boss_fight') break;
  }
  assert.equal(world.run.stage, 'boss_fight');
  assert.equal(world.encounterMode, 'boss');
  assert.equal(world.boss?.id, 'helix-04');
  assert.equal(world.enemies.length, 1);
  assert.equal(world.enemies[0].id, 'helix-04');

  // Duplicate advanceCampaignChapter call must be rejected
  assert.equal(advanceCampaignChapter(world, true), false);
  assert.equal(world.run.chapter, 'chapter_1_helix');

  // Save/Reload round-trip and Practice Mode isolation
  const savedChapter1 = serializeCampaignProgress(world);
  const reloaded = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(reloaded, savedChapter1), true);
  assert.equal(restoreSavedCampaignProgress(reloaded), true);
  assert.equal(reloaded.run.chapter, 'chapter_1_helix');
  assert.equal(reloaded.boss?.id, 'helix-04');
  assert.equal(reloaded.progression.memoryFragments, 6);

  // Enter Practice Mastery Gauntlet from Chapter I and verify campaign snapshot is never mutated
  startPracticeStandardRun(reloaded, 'tactical_mastery_gauntlet');
  assert.equal(reloaded.run.mode, 'practice_standard');
  assert.equal(reloaded.encounter.encounterId, 'tactical_mastery_gauntlet');
  assert.equal(serializeCampaignProgress(reloaded), savedChapter1);
});

test('10. Phase 18 Exploration Save V2 Persistence, Legacy Migration, Practice Isolation & 18-Fragment Economy Invariance', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);

  // Activate Prologue Diagnostic Terminal, Auxiliary Power Node, and Shortcut Gate
  world.player.x = 2.4;
  world.player.z = 8.3;
  world.player.rotationY = 0;
  assert.equal(
    attemptEnvironmentalInteraction(world, 'int_prologue_diagnostic_terminal').status,
    'ready'
  );

  world.player.x = 5.2;
  world.player.z = 6.7;
  world.player.rotationY = 0;
  assert.equal(
    attemptEnvironmentalInteraction(world, 'int_prologue_aux_power_node').status,
    'ready'
  );

  world.player.x = 6.2;
  world.player.z = -4.3;
  world.player.rotationY = Math.PI;
  assert.equal(
    attemptEnvironmentalInteraction(world, 'int_prologue_shortcut_gate').status,
    'ready'
  );

  // Verify exploration never grants extra Memory Fragments outside the 8 canonical campaign milestones
  assert.equal(
    world.progression.memoryFragments,
    0,
    'Environmental interactions and codex discoveries must never inflate the 18 Memory Fragment economy'
  );
  assert.ok(world.exploration.discoveredCodexIds.includes('CODEX-01'));
  assert.ok(world.exploration.discoveredCodexIds.includes('CODEX-02'));
  assert.ok(world.exploration.unlockedRouteIds.includes('pillar-ne'));
  assert.equal(world.obstacles.find((o) => o.id === 'pillar-ne')?.disabled, true);

  // Serialize and reload into a fresh world -> verify codex, objectives, activated nodes, and unlocked routes persist
  const savedJson = serializeCampaignProgress(world);
  const reloaded = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(reloaded, savedJson), true);
  assert.equal(restoreSavedCampaignProgress(reloaded), true);

  assert.deepEqual(reloaded.exploration.discoveredCodexIds, ['CODEX-01', 'CODEX-02']);
  assert.ok(
    reloaded.exploration.activatedNodeIds.includes('int_prologue_diagnostic_terminal')
  );
  assert.ok(reloaded.exploration.activatedNodeIds.includes('int_prologue_aux_power_node'));
  assert.ok(reloaded.exploration.activatedNodeIds.includes('int_prologue_shortcut_gate'));
  assert.deepEqual(reloaded.exploration.unlockedRouteIds, ['pillar-ne']);
  assert.equal(
    reloaded.obstacles.find((o) => o.id === 'pillar-ne')?.disabled,
    true,
    'Unlocked route obstacle state must be restored on campaign reload'
  );

  // Practice mode and Chapter Replay must not overwrite or corrupt saved campaign exploration state
  startPracticeStandardRun(reloaded, 'tactical_guard_and_flank');
  discoverCodexEntry(reloaded, 'CODEX-08');
  assert.equal(
    serializeCampaignProgress(reloaded),
    savedJson,
    'Practice mode exploration mutations must never overwrite saved campaign progress'
  );

  // Backward compatibility: loading a pre-Phase-18 v2 save without `exploration` or with unknown IDs sanitizes cleanly
  const legacyV2Save = JSON.stringify({
    version: 2,
    unlockedChapters: ['prologue', 'chapter_1_helix'],
    completedChapters: ['prologue'],
    recoveredLogs: ['LOG-00'],
    completedEndings: [],
    activeCampaign: {
      chapter: 'chapter_1_helix',
      stage: 'boss_fight',
      pendingNextChapter: null,
      bossCheckpoint: null,
      selectedEnding: null,
      exploration: {
        discoveredCodexIds: ['CODEX-01', 'INVALID-CODEX', 'CODEX-01'],
        completedObjectiveIds: ['obj_prologue_puzzle_calibration', 'obj_fake'],
        activatedNodeIds: ['int_prologue_diagnostic_terminal', 'int_fake'],
        unlockedRouteIds: ['pillar-ne', 'pillar-invalid'],
      },
    },
  });
  const migratedWorld = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(migratedWorld, legacyV2Save), true);
  assert.deepEqual(migratedWorld.exploration.discoveredCodexIds, ['CODEX-01']);
  assert.deepEqual(migratedWorld.exploration.completedObjectiveIds, [
    'obj_prologue_puzzle_calibration',
  ]);
  assert.deepEqual(migratedWorld.exploration.activatedNodeIds, [
    'int_prologue_diagnostic_terminal',
  ]);
  assert.deepEqual(migratedWorld.exploration.unlockedRouteIds, ['pillar-ne']);
});

test('17. Phase 19 World Traversal & Secret Exploration Save V2 Persistence, Sanitization, Migration & 18-Fragment Economy Invariance', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);

  // 1. Prologue secret requires route_prologue_east_bypass unlocked
  assert.equal(discoverSecretArea(world, 'secret_prologue_calibration_alcove'), false);
  world.exploration.activatedNodeIds.push('int_prologue_aux_power_node', 'int_prologue_shortcut_gate');
  const proEastRoute = world.exploration.localMap.routes.find((r) => r.id === 'route_prologue_east_bypass');
  if (proEastRoute) proEastRoute.unlocked = true;
  assert.equal(discoverSecretArea(world, 'secret_prologue_calibration_alcove'), true);

  // 2. Chapter I secret requires active Chapter I and route_ch1_nw_timed_conduit unlocked
  world.run.unlockedChapters = [
    'prologue',
    'chapter_1_helix',
    'chapter_2_choir',
    'chapter_3_curator',
  ];
  startCampaignChapterSelect(world, 'chapter_1_helix');
  assert.equal(discoverSecretArea(world, 'secret_ch1_marshal_armory_cache'), false);
  world.exploration.activatedNodeIds.push('int_ch1_ballistic_capacitor');
  const ch1Route = world.exploration.localMap.routes.find((r) => r.id === 'route_ch1_nw_timed_conduit');
  if (ch1Route) ch1Route.unlocked = true;
  assert.equal(discoverSecretArea(world, 'secret_ch1_marshal_armory_cache'), true);

  // 3. Chapter II secret requires active Chapter II and route_ch2_sw_echo_bridge unlocked
  startCampaignChapterSelect(world, 'chapter_2_choir');
  assert.equal(discoverSecretArea(world, 'secret_ch2_hydroponic_echo_sanctum'), false);
  world.exploration.activatedNodeIds.push('int_ch2_garden_echo_conduit');
  const ch2Route = world.exploration.localMap.routes.find((r) => r.id === 'route_ch2_sw_echo_bridge');
  if (ch2Route) ch2Route.unlocked = true;
  assert.equal(discoverSecretArea(world, 'secret_ch2_hydroponic_echo_sanctum'), true);

  // 4. Chapter III secret requires active Chapter III and route_ch3_sw_archive_passage unlocked
  startCampaignChapterSelect(world, 'chapter_3_curator');
  assert.equal(discoverSecretArea(world, 'secret_ch3_lysa_unedited_vault'), false);
  world.exploration.activatedNodeIds.push('int_ch3_vault_power_relay');
  const ch3Route = world.exploration.localMap.routes.find((r) => r.id === 'route_ch3_sw_archive_passage');
  if (ch3Route) ch3Route.unlocked = true;
  assert.equal(discoverSecretArea(world, 'secret_ch3_lysa_unedited_vault'), true);

  assert.equal(
    world.progression.memoryFragments,
    0,
    'Discovering all 4 secret areas must never grant extra Memory Fragments'
  );
  assert.equal(world.exploration.discoveredSecretIds.length, 4);
  assert.equal(world.exploration.localMap.totalDiscoveredSecretsCampaign, 4);

  // Save and reload into a fresh world -> verify discoveredSecretIds and discoveredRegionIds persist
  const savedJson = serializeCampaignProgress(world);
  const reloaded = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(reloaded, savedJson), true);
  assert.equal(restoreSavedCampaignProgress(reloaded), true);
  assert.deepEqual(reloaded.exploration.discoveredSecretIds, [
    'secret_prologue_calibration_alcove',
    'secret_ch1_marshal_armory_cache',
    'secret_ch2_hydroponic_echo_sanctum',
    'secret_ch3_lysa_unedited_vault',
  ]);
  assert.ok(
    reloaded.exploration.discoveredRegionIds.includes('region_prologue_secret_alcove')
  );
  assert.equal(reloaded.exploration.localMap.totalDiscoveredSecretsCampaign, 4);

  // Sanitization of malformed/unknown region & secret IDs in v2 save
  const rawWithInvalid = JSON.stringify({
    version: 2,
    unlockedChapters: ['prologue', 'chapter_1_helix'],
    completedChapters: ['prologue'],
    recoveredLogs: ['LOG-00'],
    completedEndings: [],
    exploration: {
      discoveredCodexIds: ['CODEX-01'],
      completedObjectiveIds: [],
      activatedNodeIds: [],
      unlockedRouteIds: ['pillar-ne'],
      discoveredRegionIds: [
        'region_prologue_staging_deck',
        'region_prologue_secret_alcove',
        'region_unknown_fake',
        'region_prologue_secret_alcove',
      ],
      discoveredSecretIds: [
        'secret_prologue_calibration_alcove',
        'secret_unknown_fake',
        'secret_prologue_calibration_alcove',
      ],
    },
    activeCampaign: null,
  });
  const sanitized = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(sanitized, rawWithInvalid), true);
  assert.deepEqual(sanitized.exploration.discoveredSecretIds, [
    'secret_prologue_calibration_alcove',
  ]);
  assert.deepEqual(sanitized.exploration.discoveredRegionIds, [
    'region_prologue_staging_deck',
    'region_prologue_secret_alcove',
  ]);
});

test('18. Phase 20 Full Campaign Narrative Progression (Prologue -> Chapter V), Convergence Synthesis Tiers, Save v2 Persistence, Practice Isolation & Chapter Replay Safety', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);

  // 1. Initial synthesis tier is fragmented
  const initialSummary = buildCampaignEndingDiscoverySummary(world);
  assert.equal(initialSummary.synthesisTier, 'fragmented');
  assert.equal(initialSummary.totalChaptersCount, 6);
  assert.equal(initialSummary.totalLogsCount, 6);
  assert.equal(initialSummary.totalCodexCount, 8);
  assert.equal(initialSummary.totalSecretsCount, 4);
  assert.equal(initialSummary.totalRoutesCount, 7);
  assert.equal(initialSummary.totalNarrativeEventsCount, 24);
  assert.equal(initialSummary.totalEchoMemoriesCount, 4);

  // 2. Complete Prologue calibration & optional discoveries
  world.player.x = 2.4;
  world.player.z = 9.8;
  assert.equal(
    attemptEnvironmentalInteraction(world, 'int_prologue_diagnostic_terminal').status,
    'ready'
  );
  world.pressurePlate.activationCount = 1;
  world.puzzle.teachCompleted = true;
  world.puzzle.testCompleted = true;
  world.puzzle.heavyReceiver.charged = true;
  world.puzzle.combinePlate.active = true;
  world.puzzle.finalBarrier.open = true;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(
    world.exploration.completedNarrativeEventIds.includes('nev_prologue_echo_memory_trace'),
    true
  );
  assert.equal(
    world.exploration.completedNarrativeEventIds.includes('nev_prologue_calibration_revelation'),
    true
  );

  // 3. Progress through Chapters I -> V and verify each chapter's arrival, Phase II, and defeat narrative events
  transitionCampaignToBoss(world, true, 'chapter_1_helix');
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  world.boss!.phase = 2;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  triggerBossDefeat(world);
  assert.equal(advanceCampaignChapter(world, true), true); // -> chapter_2_choir

  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  world.boss!.phase = 2;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  triggerBossDefeat(world);
  assert.equal(advanceCampaignChapter(world, true), true); // -> chapter_3_curator

  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  world.boss!.phase = 2;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  triggerBossDefeat(world);
  assert.equal(advanceCampaignChapter(world, true), true); // -> chapter_4_matron

  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  // Chapter IV Quarantine Override Node at (-3.2, 4.4) triggers nev_ch4_excision_evidence
  world.player.x = -3.2;
  world.player.z = 4.4;
  assert.equal(
    attemptEnvironmentalInteraction(world, 'int_ch4_quarantine_override_node').status,
    'ready'
  );
  assert.equal(
    world.exploration.completedNarrativeEventIds.includes('nev_ch4_excision_evidence'),
    true
  );
  world.boss!.phase = 2;
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  triggerBossDefeat(world);
  assert.equal(advanceCampaignChapter(world, true), true); // -> chapter_5_loom

  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(world.run.chapter, 'chapter_5_loom');
  assert.equal(
    world.exploration.completedNarrativeEventIds.includes('nev_ch5_loom_arrival'),
    true
  );

  // Activate NW Temporal Anchor in Chapter V at (-3.2, 3.4) with active Echo -> triggers nev_ch5_anchor_echo_memory
  world.player.x = -3.2;
  world.player.z = 3.4;
  world.echo.state = 'playback';
  world.echo.activeActor = {
    id: 'echo-ch5',
    clipId: 1,
    x: -3.2,
    z: 3.4,
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
  assert.equal(
    attemptEnvironmentalInteraction(world, 'int_ch5_temporal_anchor_conduit').status,
    'ready'
  );
  assert.equal(
    world.exploration.completedNarrativeEventIds.includes('nev_ch5_anchor_echo_memory'),
    true
  );

  // Access Loom Manifest Terminal at (2.8, 3.4) in Chapter V -> triggers nev_ch5_archive_convergence
  assert.equal(world.run.stage, 'chronicle_loom');
  world.player.x = 2.8;
  world.player.z = 3.4;
  assert.equal(
    attemptEnvironmentalInteraction(world, 'int_ch5_loom_manifest_terminal').status,
    'ready'
  );
  assert.equal(
    world.exploration.completedNarrativeEventIds.includes('nev_ch5_archive_convergence'),
    true
  );
  assert.equal(
    world.exploration.convergenceSummary.synthesisTier,
    'reconstructed',
    'With all 6 logs and multiple Echo memories/events recovered, synthesisTier is reconstructed'
  );

  // Select Witness ending -> triggers nev_ch5_final_resolution
  assert.equal(selectChronicleLoomEnding(world, 'witness'), true);
  assert.equal(
    world.exploration.completedNarrativeEventIds.includes('nev_ch5_final_resolution'),
    true
  );

  // Unlock all 8 Codex entries, all 4 secrets, and all 4 Echo memories -> synthesisTier becomes complete_chronicle
  for (const codexId of [
    'CODEX-01',
    'CODEX-02',
    'CODEX-03',
    'CODEX-04',
    'CODEX-05',
    'CODEX-06',
    'CODEX-07',
    'CODEX-08',
  ] as const) {
    discoverCodexEntry(world, codexId);
  }
  world.exploration.discoveredSecretIds = [
    'secret_prologue_calibration_alcove',
    'secret_ch1_marshal_armory_cache',
    'secret_ch2_hydroponic_echo_sanctum',
    'secret_ch3_lysa_unedited_vault',
  ];
  for (const ev of getAllNarrativeEventDefinitions()) {
    if (!world.exploration.completedNarrativeEventIds.includes(ev.id)) {
      world.exploration.completedNarrativeEventIds.push(ev.id);
    }
  }
  const completeSummary = buildCampaignEndingDiscoverySummary(world);
  assert.equal(completeSummary.synthesisTier, 'complete_chronicle');
  assert.equal(completeSummary.discoveredEchoMemoriesCount, 4);
  assert.equal(completeSummary.completedNarrativeEventsCount, 24);

  // 4. Save v2 round-trip persistence & backward-compatibility when completedNarrativeEventIds is missing
  const savedV2 = serializeCampaignProgress(world);
  const reloadedWorld = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(reloadedWorld, savedV2), true);
  assert.equal(reloadedWorld.exploration.completedNarrativeEventIds.length, 24);

  // Backward compatibility: v2 payload without completedNarrativeEventIds defaults to []
  const prePhase20Save = JSON.stringify({
    version: 2,
    unlockedChapters: ['prologue', 'chapter_1_helix'],
    completedChapters: ['prologue'],
    recoveredLogs: ['LOG-00'],
    completedEndings: [],
    exploration: {
      discoveredCodexIds: ['CODEX-01'],
      completedObjectiveIds: ['obj_prologue_clear_bay'],
      activatedNodeIds: ['int_prologue_diagnostic_terminal'],
      unlockedRouteIds: [],
      discoveredRegionIds: ['region_prologue_staging_deck'],
      discoveredSecretIds: [],
    },
    activeCampaign: null,
  });
  const compatWorld = createInitialWorld('title');
  assert.equal(parseAndApplyCampaignProgress(compatWorld, prePhase20Save), true);
  assert.deepEqual(compatWorld.exploration.completedNarrativeEventIds, []);

  // 5. Practice Mode & Chapter Replay Isolation: must not overwrite saved campaign completedNarrativeEventIds
  const campaignWorld = createInitialWorld('playing');
  startCampaignRun(campaignWorld, true);
  campaignWorld.player.x = 2.4;
  campaignWorld.player.z = 9.8;
  attemptEnvironmentalInteraction(campaignWorld, 'int_prologue_diagnostic_terminal');
  campaignWorld.run.unlockedChapters = ['prologue', 'chapter_1_helix', 'chapter_2_choir'];
  transitionCampaignToBoss(campaignWorld, true, 'chapter_1_helix');
  stepWorld(campaignWorld, createEmptyInput(Math.PI), 0.02);
  const savedEventsBeforePractice = [...campaignWorld.exploration.completedNarrativeEventIds];

  // Enter Practice mode -> isolated exploration state, campaign snapshot preserved
  startPracticeStandardRun(campaignWorld, 'tactical_guard_and_flank');
  assert.equal(campaignWorld.run.mode, 'practice_standard');
  assert.deepEqual(campaignWorld.exploration.completedNarrativeEventIds, []);
  assert.equal(restoreSavedCampaignProgress(campaignWorld), true);
  assert.deepEqual(
    campaignWorld.exploration.completedNarrativeEventIds,
    savedEventsBeforePractice,
    'Restoring campaign after Practice mode preserves exact completedNarrativeEventIds'
  );

  // Enter Chapter Replay of earlier chapter ('prologue') -> isolated exploration state, Restore Campaign restores original campaign events
  assert.equal(startCampaignChapterSelect(campaignWorld, 'prologue', true), true);
  assert.equal(campaignWorld.run.isChapterReplay, true);
  stepWorld(campaignWorld, createEmptyInput(Math.PI), 0.02);
  assert.equal(restoreSavedCampaignProgress(campaignWorld), true);
  assert.equal(campaignWorld.run.isChapterReplay, false);
  assert.equal(campaignWorld.run.chapter, 'chapter_1_helix');
  assert.deepEqual(
    campaignWorld.exploration.completedNarrativeEventIds,
    savedEventsBeforePractice,
    'Restoring campaign after Chapter Replay preserves exact completedNarrativeEventIds'
  );
});

test('Phase 20.1 Independent Ending Acceptance: silence, witness, and continuity verified in separate clean campaign states with full edge-case coverage', () => {
  const endings = ['silence', 'witness', 'continuity'] as const;

  for (const endingId of endings) {
    // Clean, independent campaign state for this specific ending
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
    world.run.recoveredLogs = ['LOG-00', 'LOG-01', 'LOG-02', 'LOG-03', 'LOG-04'];
    assert.equal(startCampaignChapterSelect(world, 'chapter_5_loom', true), true);
    assert.equal(world.run.isChapterReplay, false);
    assert.equal(world.run.chapter, 'chapter_5_loom');
    assert.equal(world.loom.active, true);
    assert.equal(world.loom.endingChoiceAvailable, true);
    assert.equal(world.loom.selectedEnding, null);

    // Selecting invalid ending ID before valid choice must be rejected
    assert.equal(
      selectChronicleLoomEnding(
        world,
        'invalid_ending' as unknown as typeof endingId
      ),
      false
    );
    assert.equal(world.loom.selectedEnding, null);

    // Execute the ending selection
    assert.equal(selectChronicleLoomEnding(world, endingId), true);
    assert.equal(world.loom.selectedEnding, endingId);
    assert.equal(world.run.selectedEnding, endingId);
    assert.equal(world.loom.endingChoiceAvailable, false);
    assert.equal(world.outcome, 'victory');
    assert.equal(world.appState, 'gameover');
    assert.equal(world.run.stage, 'completed');
    assert.deepEqual(world.run.completedEndings, [endingId]);
    assert.equal(world.run.completedChapters.includes('chapter_5_loom'), true);
    assert.equal(world.run.recoveredLogs.includes('LOG-05'), true);
    assert.equal(
      world.exploration.completedObjectiveIds.includes(
        'obj_ch5_select_loom_directive'
      ),
      true
    );
    assert.equal(
      world.exploration.completedNarrativeEventIds.includes(
        'nev_ch5_final_resolution'
      ),
      true
    );

    // Duplicate ending attempt in the same run must be rejected
    for (const secondAttempt of endings) {
      assert.equal(
        selectChronicleLoomEnding(world, secondAttempt),
        false,
        `Duplicate ending selection (${secondAttempt}) after ${endingId} must be rejected`
      );
    }
    assert.equal(world.loom.selectedEnding, endingId);
    assert.equal(world.loom.selectionCount, 1);

    // Save and reload immediately after ending: activeCampaign is cleared (no stale mid-run resume), completedEndings & LOG-05 persist
    const savedAfterEnding = serializeCampaignProgress(world);
    const reloaded = createInitialWorld('title');
    assert.equal(parseAndApplyCampaignProgress(reloaded, savedAfterEnding), true);
    assert.deepEqual(reloaded.run.completedEndings, [endingId]);
    assert.equal(reloaded.run.completedChapters.includes('chapter_5_loom'), true);
    assert.equal(reloaded.run.recoveredLogs.includes('LOG-05'), true);
    assert.equal(hasResumableCampaign(reloaded), false);
  }

  // Edge cases:
  // 1) Ending attempted outside Chapter V must fail
  const ch1World = createInitialWorld('playing');
  startCampaignRun(ch1World, true);
  transitionCampaignToBoss(ch1World, true, 'chapter_1_helix');
  assert.equal(selectChronicleLoomEnding(ch1World, 'silence'), false);

  // 2) Ending attempted in Practice Mode must fail
  const practiceWorld = createInitialWorld('playing');
  startPracticeStandardRun(practiceWorld, 'prologue_calibration_bay');
  assert.equal(selectChronicleLoomEnding(practiceWorld, 'witness'), false);

  // 3) Ending with no optional discoveries -> fragmented synthesis tier
  const minimalWorld = createInitialWorld('playing');
  startCampaignRun(minimalWorld, true);
  minimalWorld.run.unlockedChapters = [
    'prologue',
    'chapter_1_helix',
    'chapter_2_choir',
    'chapter_3_curator',
    'chapter_4_matron',
    'chapter_5_loom',
  ];
  assert.equal(startCampaignChapterSelect(minimalWorld, 'chapter_5_loom', true), true);
  assert.equal(selectChronicleLoomEnding(minimalWorld, 'silence'), true);
  assert.equal(
    minimalWorld.exploration.convergenceSummary.synthesisTier,
    'fragmented'
  );

  // 4) Ending with partial discoveries -> reconstructed synthesis tier
  const partialWorld = createInitialWorld('playing');
  startCampaignRun(partialWorld, true);
  discoverCodexEntry(partialWorld, 'CODEX-01');
  discoverCodexEntry(partialWorld, 'CODEX-02');
  discoverCodexEntry(partialWorld, 'CODEX-05');
  partialWorld.run.unlockedChapters = [
    'prologue',
    'chapter_1_helix',
    'chapter_2_choir',
    'chapter_3_curator',
    'chapter_4_matron',
    'chapter_5_loom',
  ];
  assert.equal(startCampaignChapterSelect(partialWorld, 'chapter_5_loom', true), true);
  assert.equal(selectChronicleLoomEnding(partialWorld, 'witness'), true);
  assert.equal(
    partialWorld.exploration.convergenceSummary.synthesisTier,
    'reconstructed'
  );
  assert.equal(
    partialWorld.exploration.convergenceSummary.lysaTruthUncovered,
    true
  );

  // 5) Ending with full discoveries -> complete_chronicle synthesis tier
  const fullWorld = createInitialWorld('playing');
  startCampaignRun(fullWorld, true);
  for (const codexId of [
    'CODEX-01',
    'CODEX-02',
    'CODEX-03',
    'CODEX-04',
    'CODEX-05',
    'CODEX-06',
    'CODEX-07',
    'CODEX-08',
  ] as const) {
    discoverCodexEntry(fullWorld, codexId);
  }
  fullWorld.exploration.discoveredSecretIds = [
    'secret_prologue_calibration_alcove',
    'secret_ch1_marshal_armory_cache',
    'secret_ch2_hydroponic_echo_sanctum',
    'secret_ch3_lysa_unedited_vault',
  ];
  fullWorld.run.unlockedChapters = [
    'prologue',
    'chapter_1_helix',
    'chapter_2_choir',
    'chapter_3_curator',
    'chapter_4_matron',
    'chapter_5_loom',
  ];
  assert.equal(startCampaignChapterSelect(fullWorld, 'chapter_5_loom', true), true);
  assert.equal(selectChronicleLoomEnding(fullWorld, 'continuity'), true);
  assert.equal(
    fullWorld.exploration.convergenceSummary.synthesisTier,
    'complete_chronicle'
  );
  assert.equal(
    fullWorld.exploration.convergenceSummary.synthesisHeadline,
    'COMPLETE CHRONICLE RECONSTRUCTION · ALL UNINDEXED TRUTHS RECOVERED'
  );
});

test('Phase 20.1 Full Legitimate Campaign Progression Chain: Prologue -> HELIX-04 -> The Choir -> The Curator -> Matron-V -> Chronicle Loom without direct chapter assignment', () => {
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);
  assert.equal(world.run.chapter, 'prologue');

  // Step 1: Prologue calibration & proxy neutralisation -> legitimate transition to Chapter I (HELIX-04)
  for (const enemy of world.enemies) {
    enemy.hp = 0;
    enemy.aiState = 'ko';
  }
  world.puzzle.teachCompleted = true;
  world.puzzle.testCompleted = true;
  world.puzzle.combineCompleted = true;
  world.puzzle.completed = true;
  world.puzzle.finalBarrier.open = true;
  // Stepping the world after puzzle completion and proxy neutralization triggers beginCampaignBossTransition
  stepWorld(world, createEmptyInput(Math.PI), 0.05);
  assert.equal(world.run.stage, 'transition_to_boss');
  assert.equal(world.run.pendingNextChapter, 'chapter_1_helix');

  // Advance transition into Chapter I: HELIX-04
  assert.equal(advanceCampaignChapter(world, true), true);
  assert.equal(world.run.chapter, 'chapter_1_helix');
  assert.equal(world.boss?.id, 'helix-04');
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(
    world.exploration.completedNarrativeEventIds.includes(
      'nev_ch1_containment_arrival'
    ),
    true
  );

  // Step 2: Defeat HELIX-04 via legitimate boss victory flow -> advance to Chapter II: The Choir
  triggerBossDefeat(world);
  assert.equal(world.outcome, 'victory');
  assert.equal(world.run.pendingNextChapter, 'chapter_2_choir');
  assert.equal(world.run.completedChapters.includes('chapter_1_helix'), true);
  assert.equal(world.run.recoveredLogs.includes('LOG-01'), true);
  assert.equal(advanceCampaignChapter(world, true), true);
  assert.equal(world.run.chapter, 'chapter_2_choir');
  assert.equal(world.boss?.id, 'the-choir');
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(
    world.exploration.completedNarrativeEventIds.includes('nev_ch2_garden_arrival'),
    true
  );

  // Step 3: Defeat The Choir via legitimate boss victory flow -> advance to Chapter III: The Curator
  triggerBossDefeat(world);
  assert.equal(world.outcome, 'victory');
  assert.equal(world.run.pendingNextChapter, 'chapter_3_curator');
  assert.equal(world.run.completedChapters.includes('chapter_2_choir'), true);
  assert.equal(world.run.recoveredLogs.includes('LOG-02'), true);
  assert.equal(advanceCampaignChapter(world, true), true);
  assert.equal(world.run.chapter, 'chapter_3_curator');
  assert.equal(world.boss?.id, 'the-curator');
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(
    world.exploration.completedNarrativeEventIds.includes('nev_ch3_vault_arrival'),
    true
  );

  // Step 4: Defeat The Curator via legitimate boss victory flow -> advance to Chapter IV: Matron-V
  triggerBossDefeat(world);
  assert.equal(world.outcome, 'victory');
  assert.equal(world.run.pendingNextChapter, 'chapter_4_matron');
  assert.equal(world.run.completedChapters.includes('chapter_3_curator'), true);
  assert.equal(world.run.recoveredLogs.includes('LOG-03'), true);
  assert.equal(advanceCampaignChapter(world, true), true);
  assert.equal(world.run.chapter, 'chapter_4_matron');
  assert.equal(world.boss?.id, 'matron-v');
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(
    world.exploration.completedNarrativeEventIds.includes(
      'nev_ch4_quarantine_arrival'
    ),
    true
  );

  // Step 5: Defeat Matron-V via legitimate boss victory flow -> advance to Chapter V: Chronicle Loom
  triggerBossDefeat(world);
  assert.equal(world.outcome, 'victory');
  assert.equal(world.run.pendingNextChapter, 'chapter_5_loom');
  assert.equal(world.run.completedChapters.includes('chapter_4_matron'), true);
  assert.equal(world.run.recoveredLogs.includes('LOG-04'), true);
  assert.equal(advanceCampaignChapter(world, true), true);
  assert.equal(world.run.chapter, 'chapter_5_loom');
  assert.equal(world.run.stage, 'chronicle_loom');
  assert.equal(world.loom.active, true);
  assert.equal(world.loom.endingChoiceAvailable, true);
  stepWorld(world, createEmptyInput(Math.PI), 0.02);
  assert.equal(
    world.exploration.completedNarrativeEventIds.includes('nev_ch5_loom_arrival'),
    true
  );

  // Step 6: Execute Chronicle Loom resolution -> verify all 6 chapters & all 6 logs completed
  assert.equal(selectChronicleLoomEnding(world, 'witness'), true);
  assert.deepEqual(world.run.completedChapters, [
    'prologue',
    'chapter_1_helix',
    'chapter_2_choir',
    'chapter_3_curator',
    'chapter_4_matron',
    'chapter_5_loom',
  ]);
  assert.deepEqual(world.run.recoveredLogs, [
    'LOG-00',
    'LOG-01',
    'LOG-02',
    'LOG-03',
    'LOG-04',
    'LOG-05',
  ]);
});

test('Release Documentation Parity: docs/GAMEPLAY_GUIDE.md and README.md weapon upgrades, boss profiles, and enemy stats match canonical GAME_CONFIG values', async () => {
  const { readFileSync } = await import('node:fs');
  const gameplayGuide = readFileSync(
    new URL('../../docs/GAMEPLAY_GUIDE.md', import.meta.url),
    'utf8'
  );
  const readme = readFileSync(
    new URL('../../README.md', import.meta.url),
    'utf8'
  );

  // Every canonical WeaponUpgradeId in GAME_CONFIG must be documented in docs/GAMEPLAY_GUIDE.md and README.md with its canonical cost
  const canonicalUpgrades = GAME_CONFIG.weapons.upgrades;
  for (const [upgradeId, def] of Object.entries(canonicalUpgrades)) {
    const rowRegex = new RegExp(
      `\\|\\s*\`${upgradeId}\`\\s*\\|[^|]+\\|\\s*\`${def.cost}\`\\s*\\|`,
      'm'
    );
    assert.match(
      gameplayGuide,
      rowRegex,
      `docs/GAMEPLAY_GUIDE.md must document canonical upgrade ${upgradeId} with cost ${def.cost}`
    );
    assert.match(
      readme,
      rowRegex,
      `README.md must document canonical upgrade ${upgradeId} with cost ${def.cost}`
    );
  }

  // Every canonical BossEncounterId in GAME_CONFIG must appear in docs/GAMEPLAY_GUIDE.md and README.md with its exact maxHp and phase2HpThreshold
  const canonicalBosses = [
    GAME_CONFIG.boss,
    GAME_CONFIG.choir,
    GAME_CONFIG.curator,
    GAME_CONFIG.matron,
    GAME_CONFIG.wardenPrime,
  ];
  for (const profile of canonicalBosses) {
    const bossRowRegex = new RegExp(
      `\\|\\s*\`${profile.id}\`\\s*\\|[^|]+\\|[^|]+\\|\\s*\`${profile.maxHp}\`\\s*\\|\\s*\`${profile.phase2HpThreshold} HP\`\\s*\\|`,
      'm'
    );
    assert.match(
      gameplayGuide,
      bossRowRegex,
      `docs/GAMEPLAY_GUIDE.md must match GAME_CONFIG for ${profile.id} (maxHp=${profile.maxHp}, phase2=${profile.phase2HpThreshold})`
    );
    assert.match(
      readme,
      bossRowRegex,
      `README.md must match GAME_CONFIG for ${profile.id} (maxHp=${profile.maxHp}, phase2=${profile.phase2HpThreshold})`
    );
  }
});

