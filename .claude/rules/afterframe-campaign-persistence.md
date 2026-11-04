---
paths:
  - "src/game/simulation.ts"
  - "src/game/config.ts"
  - "src/game/types.ts"
---

# Campaign, Save v2 Persistence & Mode Isolation Rules (AFTERFRAME: THE LAST LOOP)

- **Save v2 Schema Integrity**:
  - `serializeCampaignProgress` and `parseAndApplyCampaignProgress` must preserve `version: 2`, `unlockedChapters`, `completedChapters`, `unlockedEndings`, `progression.unlockedWeaponIds`, `progression.purchasedUpgradeIds`, `progression.equippedUpgrades`, `memoryFragments`, and `exploration` state.
  - Legacy v1 saves (or corrupted payloads) must migrate or fall back gracefully without crashing or unlocking locked weapons (`phase_rail`, `grav_breaker`).
- **Practice & Chapter Replay Isolation**:
  - Practice Arena runs (`world.run.mode === 'practice'`) and Chapter Replay runs (`world.run.isChapterReplay === true`) must snapshot campaign state prior to launch and restore it on exit so practice/replay sessions never corrupt live campaign progression or grant duplicate Memory Fragments.
- **Chapter V Chronicle Loom Confrontation**:
  - Players in `chapter_5_loom` must be able to either select a Chronicle Loom ending directly (**Path A**: `silence`, `witness`, `continuity`) or optionally confront `warden-prime` via `engageWardenPrimeInLoom` (**Path B**), retry from the `warden-prime` boss checkpoint on defeat, and return to the Chronicle Loom terminal upon victory to choose their ending.
