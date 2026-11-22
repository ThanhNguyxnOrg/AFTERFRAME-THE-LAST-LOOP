import assert from 'node:assert/strict';
import test from 'node:test';
import { CampaignSaveTracker } from './save-status.ts';
import { CAMPAIGN_STORAGE_KEY, createInitialWorld, startCampaignRun } from './simulation.ts';

function createToggleableStorage() {
  const writes: string[] = [];
  const storage = {
    blocked: false,
    readBlocked: false,
    stored: null as string | null,
    getItem(key: string): string | null {
      if (storage.readBlocked) {
        throw new DOMException('Access is denied for this document.', 'SecurityError');
      }
      assert.equal(key, CAMPAIGN_STORAGE_KEY);
      return storage.stored;
    },
    setItem(key: string, value: string): void {
      if (storage.blocked) {
        throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
      }
      assert.equal(key, CAMPAIGN_STORAGE_KEY);
      writes.push(value);
      storage.stored = value;
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

test('a save the game could not read at launch is never overwritten without the player choosing to', () => {
  const { storage, writes } = createToggleableStorage();
  const earlier = createInitialWorld('playing');
  startCampaignRun(earlier, true);
  earlier.progression.memoryFragments = 42;
  new CampaignSaveTracker(storage).save(earlier);
  const earlierSave = storage.stored;
  writes.length = 0;

  storage.readBlocked = true;
  storage.blocked = true;
  const tracker = new CampaignSaveTracker(storage);
  const seen: string[] = [];
  tracker.subscribe((status) => seen.push(status));
  const world = createInitialWorld('playing');
  assert.equal(tracker.load(world), false);
  startCampaignRun(world, true);
  assert.equal(tracker.save(world), 'failed');

  // Storage becomes usable mid-session: neither autosave nor Retry may replace the unread save.
  storage.readBlocked = false;
  storage.blocked = false;
  world.progression.memoryFragments += 1;
  assert.equal(tracker.save(world), 'unread-save');
  assert.equal(tracker.retry(world), 'unread-save');
  assert.equal(writes.length, 0);
  assert.equal(storage.stored, earlierSave);

  // Only an explicit overwrite replaces it; later autosaves then proceed normally.
  assert.equal(tracker.overwrite(world), 'ok');
  assert.equal(writes.length, 1);
  assert.notEqual(storage.stored, earlierSave);
  world.progression.memoryFragments += 1;
  assert.equal(tracker.save(world), 'ok');
  assert.equal(writes.length, 2);
  assert.deepEqual(seen, ['failed', 'unread-save', 'ok']);
});

test('after an unreadable launch, saving resumes once storage turns out to hold no earlier save', () => {
  const { storage, writes } = createToggleableStorage();
  storage.readBlocked = true;
  storage.blocked = true;
  const tracker = new CampaignSaveTracker(storage);
  const world = createInitialWorld('playing');
  tracker.load(world);
  startCampaignRun(world, true);
  assert.equal(tracker.save(world), 'failed');

  storage.readBlocked = false;
  storage.blocked = false;
  assert.equal(tracker.retry(world), 'ok');
  assert.equal(writes.length, 1);
});

test('a launch that read storage normally does not block later saves', () => {
  const { storage, writes } = createToggleableStorage();
  const tracker = new CampaignSaveTracker(storage);
  const world = createInitialWorld('playing');
  tracker.load(world);
  startCampaignRun(world, true);
  assert.equal(tracker.save(world), 'ok');
  assert.equal(writes.length, 1);
});

test('if storage rejects the chosen overwrite, Retry completes it without asking again', () => {
  const { storage, writes } = createToggleableStorage();
  storage.stored = '{"earlier":true}';
  storage.readBlocked = true;
  const tracker = new CampaignSaveTracker(storage);
  const world = createInitialWorld('playing');
  tracker.load(world);
  startCampaignRun(world, true);
  storage.readBlocked = false;
  assert.equal(tracker.save(world), 'unread-save');

  storage.blocked = true;
  assert.equal(tracker.overwrite(world), 'failed');
  assert.equal(tracker.retry(world), 'failed');
  storage.blocked = false;
  assert.equal(tracker.retry(world), 'ok');
  assert.equal(writes.length, 1);
  assert.notEqual(storage.stored, '{"earlier":true}');
});
