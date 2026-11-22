import assert from 'node:assert/strict';
import test from 'node:test';
import { CampaignSaveTracker } from './save-status.ts';
import { CAMPAIGN_STORAGE_KEY, createInitialWorld, startCampaignRun } from './simulation.ts';

function createToggleableStorage() {
  const writes: string[] = [];
  const storage = {
    blocked: false,
    setItem(key: string, value: string): void {
      if (storage.blocked) {
        throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
      }
      assert.equal(key, CAMPAIGN_STORAGE_KEY);
      writes.push(value);
    },
  };
  return { storage, writes };
}

test('a rejected campaign write marks progress as unsaved and notifies listeners once', () => {
  const { storage, writes } = createToggleableStorage();
  storage.blocked = true;
  const tracker = new CampaignSaveTracker(storage);
  const seen: string[] = [];
  tracker.subscribe((status) => seen.push(status));

  const world = createInitialWorld('playing');
  startCampaignRun(world, true);

  assert.equal(tracker.save(world), 'failed');
  assert.equal(tracker.save(world), 'failed');
  assert.equal(tracker.getStatus(), 'failed');
  assert.deepEqual(seen, ['failed']);
  assert.equal(writes.length, 0);
});

test('retry writes the current progress once storage accepts it again and clears the warning', () => {
  const { storage, writes } = createToggleableStorage();
  storage.blocked = true;
  const tracker = new CampaignSaveTracker(storage);
  const seen: string[] = [];
  tracker.subscribe((status) => seen.push(status));

  const world = createInitialWorld('playing');
  startCampaignRun(world, true);
  tracker.save(world);

  assert.equal(tracker.retry(world), 'failed');
  storage.blocked = false;
  assert.equal(tracker.retry(world), 'ok');
  assert.equal(writes.length, 1);
  assert.deepEqual(seen, ['failed', 'ok']);

  // A later unchanged autosave does not rewrite or flip status.
  assert.equal(tracker.save(world), 'ok');
  assert.equal(writes.length, 1);
});

test('missing storage (non-browser) is not reported as a failed save', () => {
  const tracker = new CampaignSaveTracker(null);
  const world = createInitialWorld('title');
  assert.equal(tracker.save(world), 'ok');
  assert.equal(tracker.retry(world), 'ok');
});

test('a later failure after successful saves is still reported', () => {
  const { storage, writes } = createToggleableStorage();
  const tracker = new CampaignSaveTracker(storage);
  const world = createInitialWorld('playing');
  startCampaignRun(world, true);

  assert.equal(tracker.save(world), 'ok');
  assert.equal(writes.length, 1);
  storage.blocked = true;
  world.progression.memoryFragments += 5;
  assert.equal(tracker.save(world), 'failed');
});
