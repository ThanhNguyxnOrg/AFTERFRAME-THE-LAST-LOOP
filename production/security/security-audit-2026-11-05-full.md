# Security Audit Report — AFTERFRAME: THE LAST LOOP (Phase 23.4.1 Full Release Audit)

- **Date:** 2026-11-08
- **Scope:** Full Codebase (`src/`, `index.html`, `package.json`, `project.yaml`, `.github/workflows/ci.yml`, `.claude/`)
- **Auditor:** `security-engineer` + `lead-programmer` (CCGS `v1.2.0` `/security-audit full`)
- **Project Posture:** Single-Player Web Application (`platform.online: false`, `platform.multiplayer: false`)

---

## Executive Summary

**Overall Security Posture:** `🟢 PASS` (`0` Critical, `0` High, `0` Open Medium/Low)

`AFTERFRAME: THE LAST LOOP` is a deterministic, client-side single-player 3D action-puzzle RPG with zero server-side databases, zero user authentication endpoints, and zero runtime external network calls. All persistent state is stored locally in `window.localStorage` under two versioned keys (`afterframe_campaign_progress_v1` with Save v2 schema `CAMPAIGN_SAVE_VERSION = 2` and `afterframe_camera_settings_v1`).

---

## Audit Categories

### 1. Save / Deserialization Hardening (`src/game/simulation.ts`, `src/game/input.ts`)
- **Status:** `🟢 PASS` (**VERIFIED SECURE**)
- **Evidence:**
  - `parseAndApplyCampaignProgress` (`src/game/simulation.ts`) enforces `MAX_SAVE_JSON_BYTES = 262_144` (256 KB exact UTF-8 byte ceiling via `TextEncoder`) before `JSON.parse`, wraps parsing in `try/catch`, rejects primitives/arrays/null and unsupported schema versions (`version === undefined || version === 1 || version === CAMPAIGN_SAVE_VERSION (2)`) **before mutating `WorldState`**, caps array scans at `MAX_SAVE_ARRAY_SCAN = 256`, and whitelists every enum and ID (`isValidCampaignChapterId`, `isValidArchiveLogId`, `isValidChronicleLoomEndingId`, `isValidWeaponId`, `isValidWeaponUpgradeId`, `isValidCodexEntryId`, `isValidSecretAreaId`, `isValidEnvironmentalInteractableId`, `isValidUnlockableRouteId`).
  - `activeCampaign.equippedWeaponId` and `bossCheckpoint.equippedWeaponId` are validated against `unlockedWeaponIds` (including legacy V1 chapter-inferred unlocks across `unlockedChapters`, `completedChapters`, `pendingNextChapter`, and `activeCampaign.chapter`) so a tampered save cannot equip a locked vault weapon in Campaign mode (falls back to `'chrono_edge'`).
  - Numeric fields (`memoryFragments`, checkpoint `integrity`/`flux`) are checked with `Number.isFinite`, floored, and clamped to `[0, MAX]` bounds (`MAX_PERSISTED_MEMORY_FRAGMENTS = 999`).
  - `InputController.loadSettings` (`src/game/input.ts`) validates every numeric and boolean setting (`sensitivity` clamped to `[0.25, 2.5]`, volumes clamped to `[0, 1]`, strict `typeof === 'boolean'` checks for `invertY`, `reducedMotion`, `cameraShake`, `screenEffects`, `subtitlesEnabled`) and catches storage exceptions (`SecurityError` / `QuotaExceededError`).
  - Covered by deterministic fuzz/corruption, V1 -> V2 migration idempotency, non-mutating V3/V4 rejection, and weapon-lock tests (`Phase 23.2-B`, `Phase 23.3-B1`, `Phase 23.3-B2`) in `src/game/simulation.test.ts` and `src/game/reduced-motion.test.ts`.

### 2. DOM / XSS / Dynamic Execution Surface (`src/`, `index.html`)
- **Status:** **VERIFIED SECURE**
- **Evidence:**
  - Zero occurrences of `eval(`, `new Function(`, `dangerouslySetInnerHTML`, `document.write`, `window.open`, or `window.alert`.
  - The two `innerHTML = ''` calls in `src/game/renderer.ts` and `src/game/models.ts` only clear container nodes with empty string literals before appending `WebGLRenderer.domElement` or `fallbackEl` (`textContent` only).

### 3. Secrets, Environment Variables & Supply Chain (`package.json`, `bun.lock`, `.github/workflows/ci.yml`)
- **Status:** **VERIFIED SECURE**
- **Evidence:**
  - Zero hardcoded API keys, tokens, or credentials anywhere in the repository (`git grep` verified).
  - `.env.example` contains only placeholder configuration documentation.
  - `.github/workflows/ci.yml` enforces least-privilege `permissions: contents: read` and `bun install --frozen-lockfile`.
  - `project.yaml` explicitly declares `online: false` and `multiplayer: false`.
