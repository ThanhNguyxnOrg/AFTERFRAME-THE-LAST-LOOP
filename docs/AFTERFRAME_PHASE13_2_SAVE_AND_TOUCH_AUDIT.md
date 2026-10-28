# AFTERFRAME: THE LAST LOOP — PHASE 13.2 SAVE & TOUCH CAMERA AUDIT

## 1. Executive Summary & Baseline Sync

- **Starting Git Commit (`main`)**: `f94dfba24f213da350cbc32152e20086c814002d` (`https://github.com/ThanhNguyxnOrg/AFTERFRAME-THE-LAST-LOOP`)
- **Phase 13.2 Objectives Completed**:
  1. **Durable, Versioned Campaign Save Continuity (`PersistedCampaignSaveV2`, `version: 2`)**: Exact campaign chapter, stage, pending chapter transition, and boss checkpoint state (`integrity`, `flux`, `replenishedIntegrity`, `elapsedTimeAtCheckpoint`, and `statsAtCheckpoint`) now survive full page reloads under `afterframe_campaign_progress_v1` with seamless legacy v1 save migration and strict runtime validation.
  2. **Dedicated Touch Camera Orbit (`[CAM ORBIT]`, `data-testid="touch-camera-look"`)**: Touch and mobile viewports now provide a dedicated camera-look surface alongside the 4-directional movement pad (`data-testid="touch-move-pad"`), supporting independent yaw/pitch camera rotation, sensitivity and invert-Y preferences, zero accidental attack triggers, zero page scroll (`touch-action: none`), and deterministic input cleanup on blur, visibility loss, and pause.

---

## 2. Stage A — Versioned Save Schema & Migration Rules

### 2.1 Storage Key & Versioned Schema (`src/game/types.ts`, `src/game/simulation.ts`)

- **Storage Key**: `CAMPAIGN_STORAGE_KEY = 'afterframe_campaign_progress_v1'`
- **Schema Version**: `CAMPAIGN_SAVE_VERSION = 2`

```ts
export interface PersistedActiveCampaignState {
  chapter: CampaignChapterId;
  stage: RunStage;
  pendingNextChapter: CampaignChapterId | null;
  bossCheckpoint: BossCheckpointSnapshot | null;
}

export interface PersistedCampaignSaveV2 {
  version: 2;
  unlockedChapters: CampaignChapterId[];
  completedChapters: CampaignChapterId[];
  recoveredLogs: string[];
  completedEndings: ChronicleLoomEndingId[];
  activeCampaign: PersistedActiveCampaignState | null;
}
```

### 2.2 Backward-Compatible Migration & Validation Rules

1. **Legacy v1 Migration (`version` omitted or `version: 1`)**:
   - Preserves all valid `unlockedChapters` (`prologue` always guaranteed), `completedChapters`, `recoveredLogs`, and `completedEndings`.
   - Sets `activeCampaign: null` (`world.run.savedCampaignSnapshot = null`) so legacy saves upgrade cleanly to `version: 2` on next write without losing progression.
2. **Unsupported Version / Malformed Payload Rejection**:
   - Malformed JSON strings, `null`, primitives, arrays, or objects with an unsupported `version` (e.g., `version: 99`, `version: 0`, `version: "2"`) safely fall back to the default `prologue` unlocked state without throwing.
3. **Strict `activeCampaign` & `bossCheckpoint` Sanitization (`sanitizeActiveCampaign`, `sanitizeBossCheckpoint`)**:
   - Validates `chapter` against canonical `CAMPAIGN_CHAPTER_ORDER`.
   - Validates `stage` against chapter-specific allowed stages (`isValidStageForChapter`):
     - `prologue`: `'intro' | 'calibration' | 'transition_to_boss' | 'completed'`
     - `chapter_1_helix` .. `chapter_4_matron`: `'boss_intro' | 'boss_fight' | 'completed'`
     - `chapter_5_loom`: `'chronicle_loom'` (`'completed'` in `chapter_5_loom` is a finished campaign and never resumable as an active run).
   - Validates `pendingNextChapter`: required and matched to `getNextCampaignChapter(chapter)` when `stage === 'completed'`; forced to `null` otherwise.
   - Validates `bossCheckpoint`: rejects non-finite, `NaN`, or negative numbers; clamps `integrity` (`1..maxIntegrity`) and `flux` (`0..maxFlux`); ensures `bossCheckpoint.chapter === activeCampaign.chapter` for boss stages (`boss_intro`, `boss_fight`).
4. **Completed Campaign Handling**:
   - Selecting any Chronicle Loom ending (`selectChronicleLoomEnding`) sets `world.run.savedCampaignSnapshot = null` and serializes `activeCampaign: null` while preserving all unlocked/completed chapters, archive logs, and completed endings.
5. **Replay & Practice Isolation Across Reloads**:
   - Starting an active campaign run or reloading from `localStorage` populates `world.run.savedCampaignSnapshot`.
   - Launching a Chapter Select replay (`isChapterReplay === true`) or Practice mode (`practice_standard`, `practice_boss`) preserves `world.run.savedCampaignSnapshot` both in memory and in `localStorage` (`extractActiveCampaignForSave` reads from `savedCampaignSnapshot` whenever `mode !== 'campaign'` or `isChapterReplay === true`).
   - Clicking **CONTINUE CAMPAIGN** (`data-testid="title-btn-restore-campaign"` on Title Screen or `data-testid="modal-btn-restore-campaign"` in StatusModal) invokes `restoreSavedCampaignProgress(world)`, restoring the exact chapter, stage, `pendingNextChapter`, and `bossCheckpoint` (`integrity`, `flux`, `elapsedTime`, and `summary` stats: `damageDealt`, `damageTaken`, `parriesLanded`, `vulnerableHits`, `echoesRecorded`, `echoesReplayed`, `relayActivations`, `convergenceTriggers`, `platesActivated`).
6. **Write Deduplication**:
   - `App.tsx` caches `lastPersistedCampaignJson` and only writes to `localStorage` when the serialized JSON changes, preventing redundant per-frame storage writes during 60 FPS gameplay.

---

## 3. Confirmed Fixes & Modified Files

| File | Summary of Changes |
| --- | --- |
| `src/game/types.ts` | Added `PersistedActiveCampaignState` and `PersistedCampaignSaveV2` (`version: 2`) interfaces. |
| `src/game/simulation.ts` | Added `CAMPAIGN_STORAGE_KEY`, `CAMPAIGN_SAVE_VERSION = 2`, `sanitizeBossCheckpoint`, `sanitizeActiveCampaign`, `extractActiveCampaignForSave`, v2 `serializeCampaignProgress`, v1/v2 `parseAndApplyCampaignProgress`, `loadCampaignProgressFromStorage`, `saveCampaignProgressToStorage`; updated `restoreSavedCampaignProgress` to restore exact checkpoint `integrity`, `flux`, `elapsedTime`, and `statsAtCheckpoint`; cleared `savedCampaignSnapshot` on campaign completion in `selectChronicleLoomEnding`. |
| `src/game/input.ts` | Added touch camera-look state and methods (`startTouchCameraLook`, `moveTouchCameraLook`, `endTouchCameraLook`, `isTouchCameraActive`) and pointer-tracked movement hold (`setTouchMoveHold`, `getTouchMoveHold`), integrated with `sensitivity`, `invertY`, and `clearAllInputs()`. |
| `src/App.tsx` | Connected `loadCampaignProgressFromStorage` and `saveCampaignProgressToStorage` with `lastPersistedCampaignJson` deduplication; passed touch camera callbacks to `GameHud`; exposed save/load and touch-camera helpers on `window.__afterframeTest`; passed `savedCampaignCheckpoint` to `TitleScreen` and `StatusModal`. |
| `src/components/GameHud.tsx` | Added `[CAM ORBIT]` (`data-testid="touch-camera-look"`) with `touchAction: 'none'` and pointer/touch handlers; added `touchAction: 'none'` to `touch-move-pad`; refined `390×844` portrait and `844×390` landscape layout spacing so all HUD controls and banners have zero overlap or clipping. |
| `src/components/TitleScreen.tsx` | Updated `title-saved-campaign-badge` on **CONTINUE CAMPAIGN** to display checkpoint Integrity & Flux (`CH.II · THE CHOIR · 75 HP / 78 FLX`). |
| `src/components/StatusModal.tsx` | Updated `modal-btn-restore-campaign` to display saved checkpoint Integrity & Flux when replaying an earlier chapter. |
| `src/game/campaign-release.test.ts` | Preserved Phase 13.1 release-hardening test and added 13 new unit tests covering v2 save round-trip, v1 migration, malformed JSON/version/number rejection, replay & practice reload isolation, campaign completion clearing, write deduplication, and touch camera-look controls. |
| `scripts/phase13_2_browser_verify.mjs` | Automated Playwright + CDP touch verification across desktop (`1440×900`) and mobile viewports (`390×844`, `430×932`, `844×390`). |

---

## 4. Automated Test Results

### 4.1 TypeScript & Production Build
- `npm run lint` (`tsc --noEmit`): **PASSED** (0 errors)
- `npm run build` (`vite build`): **PASSED**

### 4.2 Node Simulation & Release-Hardening Test Suites (`165/165` Passing)
Executed via:
```bash
npx --yes tsx --test src/game/simulation.test.ts src/game/reduced-motion.test.ts src/game/campaign-release.test.ts src/game/asset-lifecycle.test.ts
```
- `src/game/simulation.test.ts`: **145/145 PASSED**
- `src/game/reduced-motion.test.ts`: **3/3 PASSED**
- `src/game/campaign-release.test.ts`: **14/14 PASSED**
  1. Full campaign progression Prologue -> Chapters I–V -> all 3 Chronicle Loom endings + replay preservation
  2. Version 2 campaign save round-trip preserves exact active chapter, stage, and boss checkpoint stats across reload
  3. Reload during `boss_fight` + `restoreSavedCampaignProgress` + defeat + `retryBossFromCheckpoint` restores exact persisted checkpoint stats
  4. Reload during post-boss `completed` stage with `pendingNextChapter` restores and advances to next chapter without re-fighting boss
  5. Reload while replaying Chapter I via Chapter Select preserves saved Chapter III campaign snapshot and checkpoint
  6. Reload while in `practice_standard` or `practice_boss` preserves saved campaign snapshot
  7. Completing Chapter V (`Silence`, `Witness`, `Continuity`) clears `activeCampaign` so completed campaign is not marked resumable
  8. Legacy Version 1 save payload migrates cleanly without losing unlocked/completed chapters, logs, or endings
  9. Malformed JSON, `null`, primitive values, and unsupported save versions fall back safely without throwing
  10. Corrupted `activeCampaign` chapter/stage or `NaN`/negative checkpoint numbers are rejected while preserving valid unlock lists
  11. Storage helper `saveCampaignProgressToStorage` deduplicates identical payloads and `loadCampaignProgressFromStorage` hydrates state
  12. Touch camera-look orbits `aimYaw` and `aimPitch` independently of movement hold without triggering attacks
  13. Touch camera-look respects camera `sensitivity` and `invertY` settings and clamps pitch within bounds
  14. Touch camera-look and touch movement hold clear cleanly on `endTouchCameraLook`, `blur`, and `clearAllInputs`
- `src/game/asset-lifecycle.test.ts`: **3/3 PASSED**

---

## 5. Browser & Touch Verification Results (`scripts/phase13_2_browser_verify.mjs`)

Executed against the live application in headless Chromium with Playwright and Chrome DevTools Protocol (`Input.dispatchTouchEvent`):

1. **Desktop (`1440×900`) Durable Checkpoint & Reload Verification**:
   - Reached Chapter II (`THE CHOIR`) with custom checkpoint state (`75 HP`, `78 FLX`, `damageDealt: 1850`, `parriesLanded: 5`, `vulnerableHits: 8`, `convergenceTriggers: 2`, `relayActivations: 4`).
   - Performed full `page.reload()`.
   - Verified Title Screen **CONTINUE CAMPAIGN** button (`data-testid="title-btn-restore-campaign"`) and badge (`CH.II · THE CHOIR · 75 HP / 78 FLX`).
   - Clicked **CONTINUE CAMPAIGN** and verified restored `world.run.chapter === 'chapter_2_choir'`, `stage === 'boss_fight'`, `bossCheckpoint.integrity === 75`, `bossCheckpoint.flux === 78`, and `summary.damageDealt === 1850`.
   - Triggered player defeat and clicked **RETRY BOSS CHECKPOINT** (`data-testid="modal-btn-retry-boss"`), confirming `THE CHOIR` reset to `380/380` HP while Sera restored `75 HP`, `78+ FLX`, and `damageDealt: 1850`.
   - Verified Chapter I replay (`title-chapter-chapter_1_helix`) and Practice mode (`title-btn-practice-standard`) across full `page.reload()` cycles — both preserved `CH.II · THE CHOIR · 75 HP / 78 FLX`.
   - Verified Chapter V ending completion clears `activeCampaign: null` and hides `title-btn-restore-campaign` after reload.
   - Verified corrupted `localStorage` (`"{corrupted_json!!!"`) recovers on reload with `0` console/page errors.
2. **Touch Emulation & Viewport Verification (`390×844`, `430×932`, `844×390`)**:
   - Dispatched multi-step CDP `touchStart` / `touchMove` / `touchEnd` / `touchCancel` gestures on `touch-move-up`, `touch-move-left`, and `touch-camera-look`.
   - Confirmed `touch-camera-look` orbits `aimYaw` and `aimPitch` with `actionState === 'idle'` (zero accidental Light/Heavy attacks) and `window.scrollX === 0, window.scrollY === 0`.
   - Confirmed `sensitivity` (`0.5` vs `2.0`) and `invertY` (`true` vs `false`) scale and invert touch camera pitch deltas accurately.
   - Confirmed touch Record (`echo-btn-record`), Light Attack (`combat-btn-light`), Stop, and Replay (`echo-btn-replay`) operate cleanly via touch taps.
   - Confirmed tapping Pause (`hud-btn-pause`) clears active touch movement/camera states and tapping Resume (`modal-btn-resume`) does not leak through to the 3D arena.
   - Confirmed `scrollWidth === innerWidth`, `scrollHeight === innerHeight`, and zero bounding-box overlap between `player-hud`, `touch-move-pad`, and `touch-camera-look` across `390×844` portrait, `430×932` portrait, and `844×390` landscape.
   - Confirmed `0` console errors and `0` uncaught page errors.

### Visual Evidence Artifacts (`.playwright-cli/`)
- `.playwright-cli/phase13_2_title_continue_campaign_desktop.png`
- `.playwright-cli/phase13_2_title_mobile_390x844.png`
- `.playwright-cli/phase13_2_hud_mobile_390x844.png`
- `.playwright-cli/phase13_2_hud_390x844_portrait.png`
- `.playwright-cli/phase13_2_hud_430x932_portrait.png`
- `.playwright-cli/phase13_2_hud_844x390_landscape.png`
- `.playwright-cli/phase13_2_verification_report.json`

---

## 6. Physical Device Verification Status & Manual QA Checklist

- **Environment Disclosure**: All automated touch and viewport checks in this phase were executed using **headless Chromium touch emulation (`hasTouch: true, isMobile: true`) and CDP `Input.dispatchTouchEvent`**, not on physical iOS Safari or Android Chrome hardware.
- **Physical Device Manual QA Checklist (iOS Safari / Android Chrome)**:
  1. Open the game in portrait (`390×844` / `430×932`) and landscape (`844×390`) on a physical phone.
  2. Hold left thumb on `[W] FWD` (`touch-move-pad`) while dragging right thumb across `[CAM ORBIT]` (`touch-camera-look`) — verify simultaneous movement and smooth camera orbit with no browser pinch-zoom or rubber-band scrolling.
  3. Tap `[LIGHT]`, `[HEAVY]`, `[DODGE]`, `[PARRY]`, `[REC]`, and `[PLAY]` during movement and verify responsive actuation without text selection popups.
  4. Lock/unlock the phone screen or switch tabs while holding `[W] FWD` or dragging `[CAM ORBIT]` — verify inputs release cleanly on resume.

---

## 7. Remaining Known Limitations

1. **Chunk Size Warning on Production Bundle**: `three.module.js` + `GLTFLoader` produce a ~656 kB minified bundle (~176 kB gzipped). This is expected for a single-page Three.js application and does not affect runtime performance or asset disposal.
2. **Physical Multi-Touch Hardware Nuances**: While `InputController` tracks independent pointer/touch identifiers for movement (`touchMovePointerId`) and camera look (`touchCameraPointerId`), OS-level system gestures (such as iOS bottom home-indicator swipe) should be avoided near the very bottom 8px edge on physical devices.
