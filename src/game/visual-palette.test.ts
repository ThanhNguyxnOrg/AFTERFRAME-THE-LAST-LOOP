import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  CHAPTER_VISUAL_LOOKS,
  applyVerticalVertexAO,
  computeArenaMoodModulation,
  resolveChapterVisualLook,
} from './visual-palette.ts';
import type { CampaignChapterId, ChronicleLoomEndingId } from './types.ts';

const ALL_CHAPTERS: CampaignChapterId[] = [
  'prologue',
  'chapter_1_helix',
  'chapter_2_choir',
  'chapter_3_curator',
  'chapter_4_matron',
  'chapter_5_loom',
];

test('v1.7.0 visual palette defines valid distinct sky, lighting, and intensity settings for all 6 chapters', () => {
  for (const ch of ALL_CHAPTERS) {
    const look = resolveChapterVisualLook(ch, null);
    assert.ok(look.keyIntensity > 1.0 && look.keyIntensity <= 3.5);
    assert.ok(look.rimIntensity > 0.5 && look.rimIntensity <= 3.0);
    assert.ok(look.loomIntensity > 1.0);
    assert.ok(look.envIntensity >= 0.3 && look.envIntensity <= 1.0);
    assert.ok(look.fogDensity > 0 && look.fogDensity < 0.03);
    assert.notEqual(
      look.skyZenith,
      look.skyHorizon,
      `${ch} must preserve atmospheric sky dome gradient contrast`
    );
    assert.notEqual(
      look.hemi,
      look.hemiGround,
      `${ch} must keep hemisphere sky vs ground bounce separation`
    );
  }
  assert.equal(Object.keys(CHAPTER_VISUAL_LOOKS).length, 6);
});

test('v1.7.0 visual palette applies ending-specific overrides only in chapter_5_loom', () => {
  const endings: ChronicleLoomEndingId[] = ['silence', 'witness', 'continuity'];
  const baseCh5 = resolveChapterVisualLook('chapter_5_loom', null);

  for (const ending of endings) {
    const prologueWithEnding = resolveChapterVisualLook('prologue', ending);
    assert.deepEqual(
      prologueWithEnding,
      CHAPTER_VISUAL_LOOKS.prologue,
      'Non-Chapter-V chapters must ignore selectedEnding visual overrides'
    );

    const ch5Ending = resolveChapterVisualLook('chapter_5_loom', ending);
    assert.notDeepEqual(ch5Ending, baseCh5);
  }

  const silenceLook = resolveChapterVisualLook('chapter_5_loom', 'silence');
  const witnessLook = resolveChapterVisualLook('chapter_5_loom', 'witness');
  assert.ok(silenceLook.loomIntensity < witnessLook.loomIntensity);
  assert.ok(silenceLook.envIntensity < witnessLook.envIntensity);
});

test('applyVerticalVertexAO attaches normalized linear-space vertex AO gradient attribute', () => {
  const geo = new THREE.BoxGeometry(1, 2, 1);
  applyVerticalVertexAO(geo, 0.4, 1.0);
  const colorAttr = geo.getAttribute('color') as THREE.BufferAttribute;
  const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
  assert.ok(colorAttr, 'color attribute must be attached');
  assert.equal(colorAttr.count, posAttr.count);

  let minFound = Infinity;
  let maxFound = -Infinity;
  for (let i = 0; i < posAttr.count; i++) {
    const r = colorAttr.getX(i);
    const g = colorAttr.getY(i);
    const b = colorAttr.getZ(i);
    assert.equal(r, g);
    assert.equal(g, b);
    minFound = Math.min(minFound, r);
    maxFound = Math.max(maxFound, r);
    if (posAttr.getY(i) < 0) {
      assert.ok(Math.abs(r - 0.4) < 1e-4, 'Bottom vertices receive bottomShade AO');
    } else {
      assert.ok(Math.abs(r - 1.0) < 1e-4, 'Top vertices receive topShade');
    }
  }
  assert.ok(minFound <= 0.41 && maxFound >= 0.99);
});

test('computeArenaMoodModulation intensifies rim, beams, and loom during Boss Phase II and Core Exposed', () => {
  const baseLook = resolveChapterVisualLook('prologue', null);
  const calm = computeArenaMoodModulation(baseLook, {
    bossPhase: 1,
    bossCoreExposed: false,
    adrenalineTier: 0,
    resonanceFlash: 0,
    reducedMotion: false,
  });
  assert.equal(calm.rimIntensity, baseLook.rimIntensity);
  assert.equal(calm.beamHex, baseLook.conduit);

  const phase2 = computeArenaMoodModulation(baseLook, {
    bossPhase: 2,
    bossCoreExposed: false,
    adrenalineTier: 4,
    resonanceFlash: 0.5,
    reducedMotion: false,
  });
  assert.ok(phase2.rimIntensity > calm.rimIntensity);
  assert.ok(phase2.beamOpacity > calm.beamOpacity);
  assert.equal(phase2.beamHex, 0xf59e0b);

  const exposed = computeArenaMoodModulation(baseLook, {
    bossPhase: 2,
    bossCoreExposed: true,
    adrenalineTier: 2,
    resonanceFlash: 0,
    reducedMotion: true,
  });
  assert.equal(exposed.beamHex, 0xe0f2fe);
  assert.equal(exposed.rimHex, 0x67e8f9);
  assert.ok(exposed.loomIntensity > calm.loomIntensity);
});

test('v3.8.0 celestial visual palette defines auroraTint, planetRimTint, starTwinkle and modulates natural/aurora/eclipse grades', async () => {
  const { mergeGraphicsSettingsPatch, resolveGraphicsSettings } = await import('./performance.ts');

  for (const ch of ALL_CHAPTERS) {
    const look = resolveChapterVisualLook(ch, null);
    assert.equal(typeof look.auroraTint, 'number');
    assert.equal(typeof look.planetRimTint, 'number');
    assert.ok(look.starTwinkle > 0 && look.starTwinkle <= 2.0);
  }

  const baseLook = resolveChapterVisualLook('chapter_2_choir', null);
  const natural = computeArenaMoodModulation(baseLook, {
    bossPhase: 1,
    bossCoreExposed: false,
    adrenalineTier: 0,
    resonanceFlash: 0,
    reducedMotion: false,
    celestialGrade: 'natural',
    holoActive: false,
  });
  const aurora = computeArenaMoodModulation(baseLook, {
    bossPhase: 1,
    bossCoreExposed: false,
    adrenalineTier: 0,
    resonanceFlash: 0,
    reducedMotion: false,
    celestialGrade: 'aurora',
    holoActive: true,
  });
  const eclipse = computeArenaMoodModulation(baseLook, {
    bossPhase: 1,
    bossCoreExposed: false,
    adrenalineTier: 0,
    resonanceFlash: 0,
    reducedMotion: true,
    celestialGrade: 'eclipse',
    holoActive: false,
  });

  assert.ok(aurora.auroraIntensity > natural.auroraIntensity);
  assert.ok(aurora.nebulaBoost > natural.nebulaBoost);
  assert.ok(eclipse.eclipseRim > natural.eclipseRim);
  assert.ok(eclipse.starTwinkle < natural.starTwinkle, 'reducedMotion damps star scintillation');

  const defaultGfx = resolveGraphicsSettings({});
  assert.equal(defaultGfx.celestialGrade, 'natural');
  const patchedGfx = mergeGraphicsSettingsPatch(defaultGfx, { celestialGrade: 'aurora' });
  assert.equal(patchedGfx.celestialGrade, 'aurora');
});


