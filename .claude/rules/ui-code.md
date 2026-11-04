---
paths:
  - "src/App.tsx"
  - "src/components/**/*.tsx"
  - "src/ui/**"
---

# React 19 UI & HUD Rules (AFTERFRAME: THE LAST LOOP)

- **Display-Only HUD & Modals**: React components (`src/App.tsx`, `src/components/GameHud.tsx`, `src/components/StatusModal.tsx`, `src/components/TitleScreen.tsx`, `src/components/TouchControls.tsx`, `src/components/TutorialOverlay.tsx`) must NEVER directly mutate `WorldState` fields. All actions must invoke exported simulation functions (`switchPlayerWeapon`, `purchaseWeaponUpgrade`, `equipWeaponUpgrade`, `startCampaignChapterSelect`, `engageWardenPrimeInLoom`, `selectChronicleLoomEnding`, `retryBossFromCheckpoint`).
- **No 60Hz React State Thrashing**: Mount the Three.js canvas once (`useEffect(..., [])`) and throttle `HudSnapshot` React state updates so `requestAnimationFrame` never tears down the WebGL context or resets camera/player position.
- **Accessible & Testable Controls**:
  - Use semantic `<button>`, `<nav>`, `<main>`, and `<dialog>` elements with descriptive `aria-label` and `data-testid` attributes so `playwright-cli` snapshots and real operators can interact with every weapon slot (`[1]`–`[4]`), upgrade card, boss practice button (`WARDEN 01`–`WARDEN 05`), and Chronicle Loom directive.
- **Responsive Viewport Support**:
  - Verify all HUD panels and modals at both Desktop (`1280x800`) and Mobile (`390x844`) resolutions without horizontal overflow or overlapping action buttons.
- **Clean Game-First Aesthetic**: Avoid generic SaaS website cards, debug telemetry dumps, or `window.alert`/`window.open`.
