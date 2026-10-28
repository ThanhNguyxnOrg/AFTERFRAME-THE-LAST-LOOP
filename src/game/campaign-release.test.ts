import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialWorld, parseAndApplyCampaignProgress, serializeCampaignProgress, startCampaignChapterSelect, advanceCampaignChapter, selectChronicleLoomEnding } from './simulation.ts';

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
