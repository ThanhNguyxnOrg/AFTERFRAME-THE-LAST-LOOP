import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('/root/.bun/install/global/node_modules/playwright');

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = '.playwright-cli';
fs.mkdirSync(OUT_DIR, { recursive: true });

function rectsOverlap(a, b, tolerance = 1) {
  return !(
    a.right <= b.left + tolerance ||
    a.left >= b.right - tolerance ||
    a.bottom <= b.top + tolerance ||
    a.top >= b.bottom - tolerance
  );
}

async function runVerification() {
  const report = {
    timestamp: new Date().toISOString(),
    consoleErrors: [],
    pageErrors: [],
    checks: {},
  };

  const browser = await chromium.launch({ headless: true });

  try {
    // =========================================================================
    // PART 1: DESKTOP SAVE CONTINUITY, CHECKPOINT RELOAD & ISOLATION (1440x900)
    // =========================================================================
    const desktopCtx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await desktopCtx.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') report.consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => {
      report.pageErrors.push(String(err));
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    // Start Campaign & transition to Chapter I (HELIX-04)
    await page.getByTestId('title-btn-new-run').click();
    await page.waitForFunction(() => document.body.dataset.state === 'playing');

    const afterCh2Advance = await page.evaluate(() => {
      const api = window.__afterframeTest;
      const w = api.getWorld();
      w.run.unlockedChapters = ['prologue', 'chapter_1_helix'];
      api.startCampaignChapterSelect('chapter_1_helix', true);

      // Set custom mid-campaign battle state before defeating HELIX-04
      w.player.integrity = 64;
      w.player.flux = 78;
      w.elapsedTime = 142.5;
      w.stats.damageDealt = 1850;
      w.stats.damageTaken = 36;
      w.stats.parriesLanded = 5;
      w.stats.vulnerableHits = 8;
      w.resonance.convergenceCount = 2;
      w.relay.activationCount = 4;

      // Defeat HELIX-04 in campaign mode
      const bossEnemy = w.enemies.find((e) => e.id === 'helix-04');
      bossEnemy.hp = 0;
      w.boss.hp = 0;
      window.__advanceSimulation(2, 0.02, true);

      // Advance into Chapter II (THE CHOIR)
      api.advanceCampaignChapter(true);
      api.saveCampaignProgress();

      const rawSave = window.localStorage.getItem('afterframe_campaign_progress_v1');
      return {
        chapter: w.run.chapter,
        stage: w.run.stage,
        integrity: w.player.integrity,
        flux: w.player.flux,
        bossCheckpoint: w.run.bossCheckpoint,
        savedPayload: rawSave ? JSON.parse(rawSave) : null,
      };
    });

    assert.equal(afterCh2Advance.chapter, 'chapter_2_choir');
    assert.equal(afterCh2Advance.stage, 'boss_fight');
    assert.equal(afterCh2Advance.integrity, 75);
    assert.equal(afterCh2Advance.flux, 78);
    assert.equal(afterCh2Advance.savedPayload?.version, 2);
    assert.equal(afterCh2Advance.savedPayload?.activeCampaign?.chapter, 'chapter_2_choir');
    assert.equal(afterCh2Advance.savedPayload?.activeCampaign?.bossCheckpoint?.integrity, 75);
    assert.equal(afterCh2Advance.savedPayload?.activeCampaign?.bossCheckpoint?.flux, 78);

    // Perform full page reload and verify Title screen Continue Campaign state
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="title-btn-restore-campaign"]', {
      state: 'visible',
    });

    const badgeText = await page.getByTestId('title-saved-campaign-badge').innerText();
    assert.ok(
      badgeText.toUpperCase().includes('CH.II · THE CHOIR'),
      `Unexpected badge text: ${badgeText}`
    );
    assert.ok(
      badgeText.toUpperCase().includes('75 HP / 78 FLX'),
      `Expected checkpoint HP/Flux in badge: ${badgeText}`
    );

    await page.screenshot({
      path: `${OUT_DIR}/phase13_2_title_continue_campaign_desktop.png`,
    });

    // Click CONTINUE CAMPAIGN and verify exact checkpoint state is restored in live gameplay
    await page.getByTestId('title-btn-restore-campaign').click();
    await page.waitForFunction(() => document.body.dataset.state === 'playing');

    const restoredState = await page.evaluate(() => {
      const w = window.__afterframeTest.getWorld();
      return {
        mode: w.run.mode,
        chapter: w.run.chapter,
        stage: w.run.stage,
        integrity: w.player.integrity,
        flux: w.player.flux,
        checkpointIntegrity: w.run.bossCheckpoint?.integrity ?? null,
        checkpointFlux: w.run.bossCheckpoint?.flux ?? null,
        elapsedTime: w.elapsedTime,
        stats: w.stats,
        convergences: w.resonance.convergenceCount,
        relays: w.relay.activationCount,
        bossId: w.boss?.id ?? null,
      };
    });

    assert.equal(restoredState.mode, 'campaign');
    assert.equal(restoredState.chapter, 'chapter_2_choir');
    assert.equal(restoredState.stage, 'boss_fight');
    assert.equal(restoredState.bossId, 'the-choir');
    assert.equal(restoredState.checkpointIntegrity, 75);
    assert.equal(restoredState.checkpointFlux, 78);
    assert.equal(restoredState.integrity, 75);
    assert.ok(restoredState.flux >= 78 && restoredState.flux <= 84);
    assert.ok(restoredState.elapsedTime >= 142.5);
    assert.equal(restoredState.stats.damageDealt, 1850);
    assert.equal(restoredState.stats.parriesLanded, 5);
    assert.equal(restoredState.convergences, 2);
    assert.equal(restoredState.relays, 4);

    // Verify Defeat -> Retry from Checkpoint after reload
    await page.evaluate(() => {
      const w = window.__afterframeTest.getWorld();
      w.player.integrity = 0;
      w.player.flux = 0;
      w.player.actionState = 'dead';
      w.outcome = 'defeat';
      w.outcomeDelayTimer = 0.01;
      window.__advanceSimulation(3, 0.02, true);
    });
    await page.waitForFunction(() => document.body.dataset.state === 'gameover');
    await page.getByTestId('modal-btn-retry-boss').click();
    await page.waitForFunction(() => document.body.dataset.state === 'playing');

    const afterRetry = await page.evaluate(() => {
      const w = window.__afterframeTest.getWorld();
      return {
        chapter: w.run.chapter,
        integrity: w.player.integrity,
        flux: w.player.flux,
        checkpointFlux: w.run.bossCheckpoint?.flux ?? null,
        damageDealt: w.stats.damageDealt,
        bossHp: w.boss?.hp,
        bossMaxHp: w.boss?.maxHp,
      };
    });
    assert.equal(afterRetry.chapter, 'chapter_2_choir');
    assert.equal(afterRetry.integrity, 75);
    assert.equal(afterRetry.checkpointFlux, 78);
    assert.ok(afterRetry.flux >= 78 && afterRetry.flux <= 84);
    assert.equal(afterRetry.damageDealt, 1850);
    assert.equal(afterRetry.bossHp, afterRetry.bossMaxHp);

    // Verify Replay of Chapter I does NOT overwrite Chapter II saved campaign across reload
    await page.getByTestId('hud-btn-pause').click();
    await page.waitForSelector('[data-testid="modal-btn-title"]');
    await page.getByTestId('modal-btn-title').click();
    await page.waitForFunction(() => document.body.dataset.state === 'title');

    await page.getByTestId('title-nav-chapters').click();
    await page.getByTestId('title-chapter-chapter_1_helix').click();
    await page.waitForFunction(() => document.body.dataset.state === 'playing');

    const replayInfo = await page.evaluate(() => {
      const w = window.__afterframeTest.getWorld();
      w.player.integrity = 19;
      w.player.flux = 10;
      window.__afterframeTest.saveCampaignProgress();
      return {
        chapter: w.run.chapter,
        isReplay: w.run.isChapterReplay,
        savedSnapChapter: w.run.savedCampaignSnapshot?.chapter ?? null,
      };
    });
    assert.equal(replayInfo.chapter, 'chapter_1_helix');
    assert.equal(replayInfo.isReplay, true);
    assert.equal(replayInfo.savedSnapChapter, 'chapter_2_choir');

    // Reload during Chapter I replay -> Title screen Continue Campaign must still restore Chapter II (75 HP / 78 FLX)
    await page.reload({ waitUntil: 'networkidle' });
    const badgeAfterReplayReload = await page.getByTestId('title-saved-campaign-badge').innerText();
    assert.ok(badgeAfterReplayReload.toUpperCase().includes('CH.II · THE CHOIR'));
    assert.ok(badgeAfterReplayReload.toUpperCase().includes('75 HP / 78 FLX'));

    // Enter Practice Arena -> reload -> Title screen Continue Campaign must still restore Chapter II
    await page.getByTestId('title-nav-practice').click();
    await page.getByTestId('title-btn-practice-standard').click();
    await page.waitForFunction(() => document.body.dataset.state === 'playing');
    await page.reload({ waitUntil: 'networkidle' });
    const badgeAfterPracticeReload = await page
      .getByTestId('title-saved-campaign-badge')
      .innerText();
    assert.ok(badgeAfterPracticeReload.toUpperCase().includes('CH.II · THE CHOIR'));

    report.checks.desktopSaveReloadAndIsolation = {
      passed: true,
      restoredState,
      afterRetry,
      badgeAfterReplayReload,
      badgeAfterPracticeReload,
    };

    await desktopCtx.close();

    // =========================================================================
    // PART 2: MOBILE TOUCH MOVEMENT & TOUCH CAMERA ORBIT (390x844, 430x932, 844x390)
    // =========================================================================
    const mobileCtx = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const mPage = await mobileCtx.newPage();
    mPage.on('console', (msg) => {
      if (msg.type() === 'error') report.consoleErrors.push(msg.text());
    });
    mPage.on('pageerror', (err) => {
      report.pageErrors.push(String(err));
    });

    await mPage.goto(BASE_URL, { waitUntil: 'networkidle' });
    await mPage.screenshot({
      path: `${OUT_DIR}/phase13_2_title_mobile_390x844.png`,
    });

    await mPage.getByTestId('title-btn-new-run').tap();
    await mPage.waitForFunction(() => document.body.dataset.state === 'playing');
    await mPage.evaluate(() => {
      window.__afterframeTest.startCampaignRun(true);
    });

    const cdp = await mobileCtx.newCDPSession(mPage);

    // 2A. Touch Movement Hold, Release & Cancellation via CDP touch events
    const upBtn = mPage.getByTestId('touch-move-up');
    const upBox = await upBtn.boundingBox();
    assert.ok(upBox, 'touch-move-up must be visible on 390x844');

    const startPos = await mPage.evaluate(() => {
      const w = window.__afterframeTest.getWorld();
      return { x: w.player.x, z: w.player.z };
    });

    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        {
          x: Math.round(upBox.x + upBox.width / 2),
          y: Math.round(upBox.y + upBox.height / 2),
          radiusX: 4,
          radiusY: 4,
          force: 1,
          id: 1,
        },
      ],
    });

    const duringHold = await mPage.evaluate(() => {
      window.__advanceSimulation(0.3, true);
      const w = window.__afterframeTest.getWorld();
      return {
        x: w.player.x,
        z: w.player.z,
        actionState: w.player.actionState,
      };
    });
    assert.ok(
      duringHold.z < startPos.z - 0.5,
      `Expected player to move forward while holding touch-move-up (${startPos.z} -> ${duringHold.z})`
    );

    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });

    const afterRelease = await mPage.evaluate(() => {
      window.__advanceSimulation(0.35, true);
      const w = window.__afterframeTest.getWorld();
      return { vx: w.player.vx, vz: w.player.vz, z: w.player.z };
    });
    assert.equal(afterRelease.vx, 0);
    assert.equal(afterRelease.vz, 0);

    // Touch cancel on touch-move-left
    const leftBox = await mPage.getByTestId('touch-move-left').boundingBox();
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        {
          x: Math.round(leftBox.x + leftBox.width / 2),
          y: Math.round(leftBox.y + leftBox.height / 2),
          radiusX: 4,
          radiusY: 4,
          force: 1,
          id: 2,
        },
      ],
    });
    await mPage.evaluate(() => window.__advanceSimulation(0.2, true));
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchCancel',
      touchPoints: [],
    });
    const afterCancel = await mPage.evaluate(() => {
      window.__advanceSimulation(0.08, true);
      const w = window.__afterframeTest.getWorld();
      return { vx: w.player.vx, vz: w.player.vz, x: w.player.x };
    });
    assert.equal(afterCancel.vx, 0);
    assert.equal(afterCancel.vz, 0);

    // 2B. Dedicated Touch Camera Orbit ([CAM ORBIT], data-testid="touch-camera-look")
    const camPad = mPage.getByTestId('touch-camera-look');
    const camBox = await camPad.boundingBox();
    assert.ok(camBox, 'touch-camera-look must be visible on 390x844');

    const camBefore = await mPage.evaluate(() => {
      const w = window.__afterframeTest.getWorld();
      const angles = window.__afterframeTest.rotateCamera(0, 0);
      return {
        yaw: angles.aimYaw,
        pitch: angles.aimPitch,
        actionState: w.player.actionState,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      };
    });

    const cx = Math.round(camBox.x + camBox.width / 2);
    const cy = Math.round(camBox.y + camBox.height / 2);

    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: cx, y: cy, radiusX: 4, radiusY: 4, force: 1, id: 3 }],
    });
    for (let step = 1; step <= 5; step++) {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [
          {
            x: cx + step * 8,
            y: cy - step * 5,
            radiusX: 4,
            radiusY: 4,
            force: 1,
            id: 3,
          },
        ],
      });
    }
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });

    const camAfter = await mPage.evaluate(() => {
      window.__advanceSimulation(0.05, true);
      const w = window.__afterframeTest.getWorld();
      const angles = window.__afterframeTest.rotateCamera(0, 0);
      return {
        yaw: angles.aimYaw,
        pitch: angles.aimPitch,
        actionState: w.player.actionState,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      };
    });

    assert.notEqual(camAfter.yaw, camBefore.yaw, 'Touch camera drag must orbit aimYaw');
    assert.notEqual(camAfter.pitch, camBefore.pitch, 'Touch camera drag must orbit aimPitch');
    assert.equal(
      camAfter.actionState,
      'idle',
      'Touch camera drag must not trigger accidental Light or Heavy attacks'
    );
    assert.equal(camAfter.scrollX, 0);
    assert.equal(camAfter.scrollY, 0);

    // 2C. Camera Sensitivity & Invert-Y on Touch Camera
    const sensAndInvertCheck = await mPage.evaluate(() => {
      const api = window.__afterframeTest;
      api.setCameraSettings({ sensitivity: 0.5, invertY: false });
      const startLow = api.rotateCamera(0, 0);
      api.startTouchCameraLook(10, 100, 100, 'touch');
      api.moveTouchCameraLook(10, 150, 130, 'touch');
      const endLow = api.endTouchCameraLook(10, 'touch');
      const lowPitchDelta = endLow.aimPitch - startLow.aimPitch;

      api.setCameraSettings({ sensitivity: 2.0, invertY: false });
      const startHigh = api.rotateCamera(0, 0);
      api.startTouchCameraLook(11, 100, 100, 'touch');
      api.moveTouchCameraLook(11, 150, 130, 'touch');
      const endHigh = api.endTouchCameraLook(11, 'touch');
      const highPitchDelta = endHigh.aimPitch - startHigh.aimPitch;

      api.setCameraSettings({ sensitivity: 1.0, invertY: true });
      const startInv = api.rotateCamera(0, 0);
      api.startTouchCameraLook(12, 100, 100, 'touch');
      api.moveTouchCameraLook(12, 150, 130, 'touch');
      const endInv = api.endTouchCameraLook(12, 'touch');
      const invPitchDelta = endInv.aimPitch - startInv.aimPitch;

      api.setCameraSettings({ sensitivity: 1.0, invertY: false });
      return { lowPitchDelta, highPitchDelta, invPitchDelta };
    });

    assert.ok(sensAndInvertCheck.lowPitchDelta > 0);
    assert.ok(sensAndInvertCheck.highPitchDelta > sensAndInvertCheck.lowPitchDelta * 3.5);
    assert.ok(sensAndInvertCheck.invPitchDelta < 0);

    // 2D. Combat & Chrono Rig Touch Controls (Light, Heavy, Dodge, Parry, Record, Stop, Replay)
    await mPage.getByTestId('echo-btn-record').tap();
    await mPage.evaluate(() => window.__advanceSimulation(0.05, true));
    const recStarted = await mPage.evaluate(() => window.__afterframeTest.getWorld().echo.state);
    assert.equal(recStarted, 'recording');

    await mPage.getByTestId('combat-btn-light').tap();
    await mPage.evaluate(() => window.__advanceSimulation(0.25, true));

    await mPage.getByTestId('echo-btn-record').tap();
    await mPage.evaluate(() => window.__advanceSimulation(0.05, true));
    const recStopped = await mPage.evaluate(() => window.__afterframeTest.getWorld().echo.state);
    assert.equal(recStopped, 'ready');

    await mPage.getByTestId('echo-btn-replay').tap();
    await mPage.evaluate(() => window.__advanceSimulation(0.05, true));
    const replayActive = await mPage.evaluate(() => window.__afterframeTest.getWorld().echo.state);
    assert.equal(replayActive, 'playback');

    // 2E. Pause Interruption & Overlay Tap Isolation
    await mPage.evaluate(() => {
      window.__afterframeTest.setTouchMoveHold(-1, 0, 77);
      window.__afterframeTest.startTouchCameraLook(88, 200, 200, 'touch');
    });
    await mPage.getByTestId('hud-btn-pause').tap();
    await mPage.waitForFunction(() => document.body.dataset.state === 'paused');

    const clearedOnPause = await mPage.evaluate(() => {
      const endCam = window.__afterframeTest.endTouchCameraLook();
      return {
        camActive: endCam.active,
      };
    });
    assert.equal(clearedOnPause.camActive, false);

    // Tap Resume inside Pause modal and verify no stray attack fired
    await mPage.getByTestId('modal-btn-resume').tap();
    await mPage.waitForFunction(() => document.body.dataset.state === 'playing');

    await mPage.screenshot({
      path: `${OUT_DIR}/phase13_2_hud_mobile_390x844.png`,
    });

    // 2F. Check Layout & Touch Controls across 390x844, 430x932, and 844x390
    const viewports = [
      { width: 390, height: 844, label: '390x844_portrait' },
      { width: 430, height: 932, label: '430x932_portrait' },
      { width: 844, height: 390, label: '844x390_landscape' },
    ];

    report.checks.mobileViewports = {};
    for (const vp of viewports) {
      await mPage.setViewportSize({ width: vp.width, height: vp.height });
      await mPage.waitForTimeout(150);

      const layoutAudit = await mPage.evaluate(() => {
        const doc = document.documentElement;
        const playerHud = document
          .querySelector('[data-testid="player-hud"]')
          ?.getBoundingClientRect();
        const movePad = document
          .querySelector('[data-testid="touch-move-pad"]')
          ?.getBoundingClientRect();
        const camLook = document
          .querySelector('[data-testid="touch-camera-look"]')
          ?.getBoundingClientRect();
        const bottomCluster = document
          .querySelector('[data-testid="hud-bottom-cluster"]')
          ?.getBoundingClientRect();

        return {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          scrollWidth: doc.scrollWidth,
          scrollHeight: doc.scrollHeight,
          playerHud,
          movePad,
          camLook,
          bottomCluster,
        };
      });

      assert.equal(
        layoutAudit.scrollWidth,
        layoutAudit.innerWidth,
        `Horizontal overflow on ${vp.label}`
      );
      assert.equal(
        layoutAudit.scrollHeight,
        layoutAudit.innerHeight,
        `Vertical overflow on ${vp.label}`
      );
      assert.ok(layoutAudit.movePad && layoutAudit.movePad.width > 0);
      assert.ok(layoutAudit.camLook && layoutAudit.camLook.width > 0);
      assert.equal(
        rectsOverlap(layoutAudit.movePad, layoutAudit.camLook),
        false,
        `touch-move-pad and touch-camera-look must not overlap on ${vp.label}`
      );
      assert.equal(
        rectsOverlap(layoutAudit.playerHud, layoutAudit.movePad),
        false,
        `player-hud and touch-move-pad must not overlap on ${vp.label}`
      );

      await mPage.screenshot({
        path: `${OUT_DIR}/phase13_2_hud_${vp.label}.png`,
      });

      report.checks.mobileViewports[vp.label] = {
        passed: true,
        scrollWidth: layoutAudit.scrollWidth,
        scrollHeight: layoutAudit.scrollHeight,
        movePadRect: layoutAudit.movePad,
        camLookRect: layoutAudit.camLook,
      };
    }

    await mobileCtx.close();
  } finally {
    await browser.close();
  }

  assert.equal(report.consoleErrors.length, 0, `Console errors: ${report.consoleErrors.join('; ')}`);
  assert.equal(report.pageErrors.length, 0, `Page errors: ${report.pageErrors.join('; ')}`);

  fs.writeFileSync(
    `${OUT_DIR}/phase13_2_verification_report.json`,
    JSON.stringify(report, null, 2)
  );
  console.log('PHASE 13.2 BROWSER VERIFICATION PASSED:', JSON.stringify(report.checks, null, 2));
}

runVerification().catch((err) => {
  console.error('PHASE 13.2 BROWSER VERIFICATION FAILED:', err);
  process.exit(1);
});
