import {
  CAMPAIGN_STORAGE_KEY,
  loadCampaignProgressFromStorage,
  saveCampaignProgressToStorage,
} from './simulation.ts';
import type { WorldState } from './types.ts';

/**
 * - `ok`: the latest progress is in storage (or there is no storage to save to).
 * - `failed`: storage rejected the write (full or blocked).
 * - `unread-save`: storage could not be read at launch and now holds a save this
 *   session never loaded; nothing is written until the player chooses to overwrite it.
 */
export type CampaignSaveStatus = 'ok' | 'failed' | 'unread-save';

type SaveStatusListener = (status: CampaignSaveStatus) => void;
type CampaignStorage = Pick<Storage, 'getItem' | 'setItem'>;

/**
 * Tracks whether campaign autosaves reach browser storage, so the UI can warn the
 * player when progress only lives in memory and let them retry the write.
 */
export class CampaignSaveTracker {
  private lastPersistedJson: string | null = null;
  private status: CampaignSaveStatus = 'ok';
  private storageUnreadAtLoad = false;
  private readonly listeners = new Set<SaveStatusListener>();
  private readonly storage: CampaignStorage | null | undefined;

  constructor(storage?: CampaignStorage | null) {
    this.storage = storage;
  }

  load(world: WorldState): boolean {
    let readFailed = false;
    let loaded = false;
    try {
      const storage = this.resolveStorage();
      if (storage) {
        loaded = loadCampaignProgressFromStorage(world, {
          getItem: (key) => {
            try {
              return storage.getItem(key);
            } catch (err) {
              readFailed = true;
              throw err;
            }
          },
        });
      }
    } catch {
      readFailed = true;
    }
    this.storageUnreadAtLoad = readFailed;
    return loaded;
  }

  save(world: WorldState): CampaignSaveStatus {
    return this.write(world, this.lastPersistedJson, false);
  }

  retry(world: WorldState): CampaignSaveStatus {
    return this.write(world, null, false);
  }

  /** Writes this session over a save it never loaded; only on the player's explicit choice. */
  overwrite(world: WorldState): CampaignSaveStatus {
    return this.write(world, null, true);
  }

  getLastPersistedJson(): string | null {
    return this.lastPersistedJson;
  }

  getStatus(): CampaignSaveStatus {
    return this.status;
  }

  subscribe(listener: SaveStatusListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private write(
    world: WorldState,
    previousJson: string | null,
    overwriteUnread: boolean
  ): CampaignSaveStatus {
    if (this.storageUnreadAtLoad && !overwriteUnread) {
      let existing: string | null;
      try {
        existing = this.resolveStorage()?.getItem(CAMPAIGN_STORAGE_KEY) ?? null;
      } catch {
        this.setStatus('failed');
        return this.status;
      }
      if (existing !== null) {
        this.setStatus('unread-save');
        return this.status;
      }
    }
    const res = saveCampaignProgressToStorage(world, this.storage, previousJson);
    if (res.written) {
      this.storageUnreadAtLoad = false;
      this.lastPersistedJson = res.json;
      this.setStatus('ok');
    } else if (res.failed) {
      this.setStatus('failed');
    }
    return this.status;
  }

  private resolveStorage(): CampaignStorage | null {
    if (this.storage !== undefined) return this.storage;
    return typeof window !== 'undefined' ? window.localStorage : null;
  }

  private setStatus(next: CampaignSaveStatus): void {
    if (next === this.status) return;
    this.status = next;
    for (const listener of this.listeners) listener(next);
  }
}
