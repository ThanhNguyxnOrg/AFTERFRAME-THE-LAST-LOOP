import assert from 'node:assert/strict';
import test from 'node:test';
import { InputController } from './input.ts';
import { createEmptyInput, createInitialWorld, stepWorld } from './simulation.ts';
import {
  GRAPHICS_PRESET_CONFIGS,
  clampRenderScale,
  computeEffectivePixelRatio,
  computeFrameSimulationDt,
  detectMatchingGraphicsPreset,
  getDefaultGraphicsSettings,
  getParticleScaleFactor,
  getShadowMapSizeForQuality,
  mergeGraphicsSettingsPatch,
  normalizeFpsLimit,
  normalizeLightingQuality,
  normalizeParticleQuality,
  normalizeShadowQuality,
  resolveGraphicsSettings,
  shouldSkipRedundantStaticRender,
  shouldStepPacedFrame,
} from './performance.ts';

test('frame elapsed time reaches simulation without losing slow-frame time', () => {
  for (const elapsedMs of [16.7, 33.3, 64, 100]) {
    const world = createInitialWorld('playing');
    world.enemies = [];
    for (let i = 0; i < 100; i++) {
      stepWorld(world, createEmptyInput(), computeFrameSimulationDt(elapsedMs));
    }
    assert.ok(Math.abs(world.elapsedTime - elapsedMs / 10) < 1e-9);
  }
});

test('simulation caps long stalls and ignores tab-resume zero or invalid intervals', () => {
  const world = createInitialWorld('playing');
  world.enemies = [];
  stepWorld(world, createEmptyInput(), computeFrameSimulationDt(5000));
  assert.ok(Math.abs(world.elapsedTime - 0.25) < 1e-9);
  for (const elapsedMs of [0, -1, NaN, Infinity]) {
    stepWorld(world, createEmptyInput(), computeFrameSimulationDt(elapsedMs));
  }
  assert.ok(Math.abs(world.elapsedTime - 0.25) < 1e-9);
});

test('getDefaultGraphicsSettings returns balanced preset defaults', () => {
  const defaults = getDefaultGraphicsSettings();
  assert.equal(defaults.graphicsPreset, 'balanced');
  assert.equal(defaults.renderScale, GRAPHICS_PRESET_CONFIGS.balanced.renderScale);
  assert.equal(defaults.shadowQuality, GRAPHICS_PRESET_CONFIGS.balanced.shadowQuality);
  assert.equal(defaults.particleQuality, GRAPHICS_PRESET_CONFIGS.balanced.particleQuality);
  assert.equal(defaults.lightingQuality, GRAPHICS_PRESET_CONFIGS.balanced.lightingQuality);
  assert.equal(defaults.fpsLimit, GRAPHICS_PRESET_CONFIGS.balanced.fpsLimit);
  assert.equal(defaults.showPerfHud, false);
});

test('mergeGraphicsSettingsPatch expands named presets while preserving showPerfHud', () => {
  const afterPerf = mergeGraphicsSettingsPatch(
    { showPerfHud: true, graphicsPreset: 'balanced' },
    { graphicsPreset: 'performance' }
  );
  assert.equal(afterPerf.graphicsPreset, 'performance');
  assert.equal(afterPerf.renderScale, 0.7);
  assert.equal(afterPerf.shadowQuality, 'off');
  assert.equal(afterPerf.particleQuality, 'low');
  assert.equal(afterPerf.lightingQuality, 'lite');
  assert.equal(afterPerf.fpsLimit, 0);
  assert.equal(afterPerf.showPerfHud, true);

  const afterQuality = mergeGraphicsSettingsPatch(afterPerf, {
    graphicsPreset: 'quality',
  });
  assert.equal(afterQuality.graphicsPreset, 'quality');
  assert.equal(afterQuality.renderScale, 1.0);
  assert.equal(afterQuality.shadowQuality, 'high');
  assert.equal(afterQuality.particleQuality, 'high');
  assert.equal(afterQuality.lightingQuality, 'standard');
  assert.equal(afterQuality.fpsLimit, 0);
  assert.equal(afterQuality.showPerfHud, true);
});

test('detectMatchingGraphicsPreset switches between custom and matching named preset', () => {
  const custom = mergeGraphicsSettingsPatch(getDefaultGraphicsSettings(), {
    graphicsPreset: 'custom',
    renderScale: 0.6,
  });
  assert.equal(custom.graphicsPreset, 'custom');
  assert.equal(custom.renderScale, 0.6);

  const restored = mergeGraphicsSettingsPatch(custom, {
    graphicsPreset: 'custom',
    renderScale: 0.85,
  });
  assert.equal(restored.graphicsPreset, 'balanced');
  assert.equal(
    detectMatchingGraphicsPreset({
      renderScale: 1.0,
      shadowQuality: 'high',
      particleQuality: 'high',
      lightingQuality: 'standard',
      fpsLimit: 0,
    }),
    'quality'
  );
});

test('normalizers clamp out-of-range and invalid values safely', () => {
  assert.equal(clampRenderScale(0.1), 0.55);
  assert.equal(clampRenderScale(2.5), 1.0);
  assert.equal(clampRenderScale(Number.NaN, 0.85), 0.85);
  assert.equal(normalizeShadowQuality('ultra', 'medium'), 'medium');
  assert.equal(normalizeParticleQuality('extreme', 'low'), 'low');
  assert.equal(normalizeLightingQuality('raytraced', 'lite'), 'lite');
  assert.equal(normalizeFpsLimit(144, 60), 60);

  const resolved = resolveGraphicsSettings({
    renderScale: 99,
    shadowQuality: 'off',
    particleQuality: 'high',
    lightingQuality: 'lite',
    fpsLimit: 45,
    showPerfHud: true,
  });
  assert.equal(resolved.renderScale, 1.0);
  assert.equal(resolved.shadowQuality, 'off');
  assert.equal(resolved.particleQuality, 'high');
  assert.equal(resolved.lightingQuality, 'lite');
  assert.equal(resolved.fpsLimit, 45);
  assert.equal(resolved.showPerfHud, true);
  assert.equal(resolved.graphicsPreset, 'custom');
});

test('pixel ratio, particle scale, and shadow map helpers scale correctly', () => {
  assert.equal(computeEffectivePixelRatio(2, 1.5, 1.0, false, false), 1.5);
  assert.equal(computeEffectivePixelRatio(2, 1.5, 0.7, false, false), 1.05);
  assert.equal(computeEffectivePixelRatio(2, 1.5, 0.6, false, true), 0.6);
  assert.equal(computeEffectivePixelRatio(2, 1.5, 1.0, true, false), 0.8);

  assert.equal(getParticleScaleFactor('low'), 0.35);
  assert.equal(getParticleScaleFactor('medium'), 0.7);
  assert.equal(getParticleScaleFactor('high'), 1.0);

  assert.equal(getShadowMapSizeForQuality('off'), 0);
  assert.equal(getShadowMapSizeForQuality('medium'), 512);
  assert.equal(getShadowMapSizeForQuality('high'), 1024);
});

test('shouldSkipRedundantStaticRender skips only repeated frames in paused/gameover', () => {
  assert.equal(shouldSkipRedundantStaticRender('playing', true, false), false);
  assert.equal(shouldSkipRedundantStaticRender('title', true, false), false);
  assert.equal(shouldSkipRedundantStaticRender('paused', false, false), false);
  assert.equal(shouldSkipRedundantStaticRender('paused', true, false), true);
  assert.equal(shouldSkipRedundantStaticRender('paused', true, true), false);
  assert.equal(shouldSkipRedundantStaticRender('gameover', true, false), true);
  assert.equal(shouldSkipRedundantStaticRender('gameover', false, false), false);
});

test('shouldStepPacedFrame enforces fpsLimit and allows unlimited at 0', () => {
  assert.equal(shouldStepPacedFrame(1001, 1000, 0), true);
  assert.equal(shouldStepPacedFrame(1008, 1000, 60), false);
  assert.equal(shouldStepPacedFrame(1016, 1000, 60), true);
  assert.equal(shouldStepPacedFrame(1020, 1000, 30), false);
  assert.equal(shouldStepPacedFrame(1033, 1000, 30), true);
});

test('InputController persists and restores graphics & performance settings', () => {
  const store = new Map<string, string>();
  const originalWindow = (globalThis as { window?: unknown }).window;
  (globalThis as { window?: unknown }).window = {
    matchMedia: () => ({ matches: false }),
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    },
  };
  try {
    const controllerA = new InputController();
    assert.equal(controllerA.getResolvedGraphicsSettings().graphicsPreset, 'balanced');

    const updated = controllerA.setCameraSettings({
      graphicsPreset: 'performance',
      showPerfHud: true,
    });
    assert.equal(updated.graphicsPreset, 'performance');
    assert.equal(updated.shadowQuality, 'off');
    assert.equal(updated.showPerfHud, true);

    const custom = controllerA.setCameraSettings({
      fpsLimit: 30,
    });
    assert.equal(custom.graphicsPreset, 'custom');
    assert.equal(custom.fpsLimit, 30);

    const controllerB = new InputController();
    const loaded = controllerB.getCameraSettings();
    assert.equal(loaded.graphicsPreset, 'custom');
    assert.equal(loaded.renderScale, 0.7);
    assert.equal(loaded.shadowQuality, 'off');
    assert.equal(loaded.particleQuality, 'low');
    assert.equal(loaded.lightingQuality, 'lite');
    assert.equal(loaded.fpsLimit, 30);
    assert.equal(loaded.showPerfHud, true);
  } finally {
    if (originalWindow === undefined) {
      delete (globalThis as { window?: unknown }).window;
    } else {
      (globalThis as { window?: unknown }).window = originalWindow;
    }
  }
});

test('touch move pulse covers its full duration on slow frames', () => {
  const prevDoc = (globalThis as { document?: unknown }).document;
  (globalThis as { document?: unknown }).document = {
    body: { dataset: { state: 'playing', runMode: 'campaign' } },
    hidden: false,
    pointerLockElement: null,
  };
  try {
    for (const frameSec of [1 / 60, 0.05, 0.1]) {
      const input = new InputController();
      input.triggerTouchMovePulse(1, 0, 0.25);
      let movedSec = 0;
      for (let i = 0; i < 20; i++) {
        if (input.consumeFrameInput(frameSec).moveX !== 0) movedSec += frameSec;
      }
      assert.ok(movedSec >= 0.25 - 1e-9, `pulse moved ${movedSec}s at ${frameSec}s frames`);
      assert.ok(movedSec <= 0.25 + frameSec + 1e-9, `pulse overran: ${movedSec}s at ${frameSec}s frames`);
    }
  } finally {
    (globalThis as { document?: unknown }).document = prevDoc;
  }
});
