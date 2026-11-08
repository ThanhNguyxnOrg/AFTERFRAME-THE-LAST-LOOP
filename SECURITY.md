# 🔒 Security Policy — AFTERFRAME: THE LAST LOOP

## 🛡️ Application Security Posture

**AFTERFRAME: THE LAST LOOP** is a deterministic, client-side single-player 3D browser game (`platform.online: false`, `platform.multiplayer: false`).

| Security Domain | Status | Implementation & Verification |
| :--- | :---: | :--- |
| **Runtime Network Surface** | `🟢 PASS` | Zero external API calls, zero server-side databases, zero authentication tokens, and zero third-party telemetry scripts |
| **Save V2 Deserialization (`src/game/simulation.ts`)** | `🟢 PASS` | Enforces `MAX_SAVE_JSON_BYTES = 262_144` (`256 KB` UTF-8 byte ceiling via `TextEncoder`) before `JSON.parse`, validates `version === undefined \|\| version === 1 \|\| version === 2` before mutating `WorldState`, caps array scans at `MAX_SAVE_ARRAY_SCAN = 256`, whitelists all IDs/enums, and verifies weapon unlock ownership |
| **Settings Storage (`src/game/input.ts`)** | `🟢 PASS` | Validates numeric bounds (`sensitivity` in `[0.25, 2.5]`, volumes in `[0.0, 1.0]`) and boolean types, and catches `SecurityError` / `QuotaExceededError` |
| **DOM & XSS Surface (`src/`)** | `🟢 PASS` | Zero uses of `eval`, `new Function`, `dangerouslySetInnerHTML`, `document.write`, `window.open`, or `window.alert` |
| **CI Workflow Permissions (`.github/workflows/ci.yml`)** | `🟢 PASS` | Enforces least-privilege `permissions: contents: read` and `bun install --frozen-lockfile` |

For the full line-by-line security audit report, see [`production/security/security-audit-2026-11-05-full.md`](production/security/security-audit-2026-11-05-full.md).

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability (such as a client-side deserialization bypass, prototype pollution vector, or dependency vulnerability):

1. **Do not post exploitable payloads in public issues** if they could affect users loading shared save strings.
2. Report the finding via GitHub Security Advisories on `https://github.com/ThanhNguyxnOrg/AFTERFRAME-THE-LAST-LOOP/security` or open a minimal issue describing the affected file and reproduction steps without sensitive personal data.
3. Include the commit SHA, browser/OS version, and a minimal test case reproducible with `bun run test`.
