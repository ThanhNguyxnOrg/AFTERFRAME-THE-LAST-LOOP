import assert from 'node:assert/strict';
import test from 'node:test';
import { GAME_CONFIG } from './config.ts';
import { InputController } from './input.ts';
import {
  CAMPAIGN_SAVE_VERSION,
  CAMPAIGN_STORAGE_KEY,
  advanceCampaignChapter,
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
  switchPlayerWeapon,
  transitionCampaignToBoss,
  triggerBossDefeat,
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


