import { saveCampaignProgressToStorage } from './simulation.ts';
import type { WorldState } from './types.ts';

export type CampaignSaveStatus = 'ok' | 'failed';

type SaveStatusListener = (status: CampaignSaveStatus) => void;

/**
 * Tracks whether campaign autosaves reach browser storage, so the UI can warn the
 * player when progress only lives in memory and let them retry the write.
 */
export class CampaignSaveTracker {
  private lastPersistedJson: string | null = null;
  private status: CampaignSaveStatus = 'ok';
  private readonly listeners = new Set<SaveStatusListener>();
  private readonly storage: Pick<Storage, 'setItem'> | null | undefined;

  constructor(storage?: Pick<Storage, 'setItem'> | null) {
    this.storage = storage;
  }

  save(world: WorldState): CampaignSaveStatus {
    return this.write(world, this.lastPersistedJson);
  }

  retry(world: WorldState): CampaignSaveStatus {
    return this.write(world, null);
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

  private write(world: WorldState, previousJson: string | null): CampaignSaveStatus {
    const res = saveCampaignProgressToStorage(world, this.storage, previousJson);
    if (res.written) {
      this.lastPersistedJson = res.json;
      this.setStatus('ok');
    } else if (res.failed) {
      this.setStatus('failed');
    }
    return this.status;
  }

  private setStatus(next: CampaignSaveStatus): void {
    if (next === this.status) return;
    this.status = next;
    for (const listener of this.listeners) listener(next);
  }
}
