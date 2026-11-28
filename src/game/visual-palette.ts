import * as THREE from 'three';
import type {
  CampaignChapterId,
  CelestialAtmosphereGrade,
  ChronicleLoomEndingId,
} from './types.ts';

export interface ChapterVisualLook {
  background: number;
  skyZenith: number;
  skyHorizon: number;
  nebulaTint: number;
  auroraTint: number;
  planetRimTint: number;
  starTwinkle: number;
  fogDensity: number;
  hemi: number;
  hemiGround: number;
  key: number;
  rim: number;
  loom: number;
  conduit: number;
  practical: number;
  keyIntensity: number;
  rimIntensity: number;
  loomIntensity: number;
  envIntensity: number;
}

export const CHAPTER_VISUAL_LOOKS: Record<CampaignChapterId, ChapterVisualLook> = {
  prologue: {
    background: 0x060b14,
    skyZenith: 0x03060d,
    skyHorizon: 0x0d2038,
    nebulaTint: 0x22d3ee,
    auroraTint: 0x34d399,
    planetRimTint: 0x38bdf8,
    starTwinkle: 0.72,
    fogDensity: 0.0128,
    hemi: 0x7ab8f5,
    hemiGround: 0x090f1b,
    key: 0xfff5e0,
    rim: 0x38bdf8,
    loom: 0x22d3ee,
    conduit: 0x22d3ee,
    practical: 0xf59e0b,
    keyIntensity: 2.85,
    rimIntensity: 2.05,
    loomIntensity: 5.8,
    envIntensity: 0.94,
  },
  chapter_1_helix: {
    background: 0x090b12,
    skyZenith: 0x040509,
    skyHorizon: 0x1a1726,
    nebulaTint: 0xf59e0b,
    auroraTint: 0x38bdf8,
    planetRimTint: 0xfbbf24,
    starTwinkle: 0.68,
    fogDensity: 0.014,
    hemi: 0x94a3e8,
    hemiGround: 0x0c0b14,
    key: 0xffe8cc,
    rim: 0x38bdf8,
    loom: 0xf59e0b,
    conduit: 0x22d3ee,
    practical: 0xf59e0b,
    keyIntensity: 2.75,
    rimIntensity: 2.1,
    loomIntensity: 5.8,
    envIntensity: 0.9,
  },
  chapter_2_choir: {
    background: 0x051017,
    skyZenith: 0x02070c,
    skyHorizon: 0x0b2633,
    nebulaTint: 0x38bdf8,
    auroraTint: 0xfbbf24,
    planetRimTint: 0x67e8f9,
    starTwinkle: 0.84,
    fogDensity: 0.0132,
    hemi: 0x67e8f9,
    hemiGround: 0x08161d,
    key: 0xfff1c2,
    rim: 0xfbbf24,
    loom: 0x38bdf8,
    conduit: 0x38bdf8,
    practical: 0xd97706,
    keyIntensity: 2.65,
    rimIntensity: 1.95,
    loomIntensity: 6.2,
    envIntensity: 0.94,
  },
  chapter_3_curator: {
    background: 0x0b0716,
    skyZenith: 0x04020b,
    skyHorizon: 0x1d0f38,
    nebulaTint: 0xa855f7,
    auroraTint: 0x22d3ee,
    planetRimTint: 0xc084fc,
    starTwinkle: 0.78,
    fogDensity: 0.0145,
    hemi: 0xb7a6f7,
    hemiGround: 0x0f081d,
    key: 0xede9fe,
    rim: 0xa855f7,
    loom: 0xc084fc,
    conduit: 0xa855f7,
    practical: 0x7c3aed,
    keyIntensity: 2.6,
    rimIntensity: 2.12,
    loomIntensity: 6.4,
    envIntensity: 0.9,
  },
  chapter_4_matron: {
    background: 0x11060b,
    skyZenith: 0x060205,
    skyHorizon: 0x2b0d18,
    nebulaTint: 0xf43f5e,
    auroraTint: 0xfb7185,
    planetRimTint: 0xfda4af,
    starTwinkle: 0.65,
    fogDensity: 0.014,
    hemi: 0xf9b4c4,
    hemiGround: 0x17060d,
    key: 0xffecee,
    rim: 0xf43f5e,
    loom: 0xfb7185,
    conduit: 0xf43f5e,
    practical: 0xe11d48,
    keyIntensity: 2.7,
    rimIntensity: 2.05,
    loomIntensity: 6.0,
    envIntensity: 0.9,
  },
  chapter_5_loom: {
    background: 0x060c18,
    skyZenith: 0x03050d,
    skyHorizon: 0x0f233b,
    nebulaTint: 0x38bdf8,
    auroraTint: 0xfbbf24,
    planetRimTint: 0x7dd3fc,
    starTwinkle: 0.92,
    fogDensity: 0.0124,
    hemi: 0x7dd3fc,
    hemiGround: 0x0a111f,
    key: 0xfff4cf,
    rim: 0xfbbf24,
    loom: 0x22d3ee,
    conduit: 0x22d3ee,
    practical: 0xf59e0b,
    keyIntensity: 2.85,
    rimIntensity: 2.15,
    loomIntensity: 7.8,
    envIntensity: 0.96,
  },
};

export function resolveChapterVisualLook(
  chapter: CampaignChapterId,
  selectedEnding: ChronicleLoomEndingId | null = null
): ChapterVisualLook {
  const base = CHAPTER_VISUAL_LOOKS[chapter] ?? CHAPTER_VISUAL_LOOKS.prologue;
  if (chapter !== 'chapter_5_loom' || !selectedEnding) {
    return { ...base };
  }

  if (selectedEnding === 'silence') {
    return {
      ...base,
      background: 0x040609,
      skyZenith: 0x020305,
      skyHorizon: 0x0a0f16,
      nebulaTint: 0x475569,
      auroraTint: 0x64748b,
      planetRimTint: 0x64748b,
      starTwinkle: 0.35,
      fogDensity: 0.019,
      hemi: 0x64748b,
      hemiGround: 0x06090f,
      key: 0x94a3b8,
      keyIntensity: 1.4,
      rim: 0x475569,
      rimIntensity: 1.15,
      loom: 0x475569,
      loomIntensity: 1.45,
      conduit: 0x475569,
      practical: 0x475569,
      envIntensity: 0.45,
    };
  }

  if (selectedEnding === 'witness') {
    return {
      ...base,
      skyZenith: 0x040d1a,
      skyHorizon: 0x163858,
      nebulaTint: 0x7dd3fc,
      auroraTint: 0xe0f2fe,
      planetRimTint: 0xbae6fd,
      starTwinkle: 1.0,
      fogDensity: 0.0112,
      hemi: 0xdbeafe,
      hemiGround: 0x0f1f34,
      key: 0xf0f9ff,
      keyIntensity: 2.95,
      rim: 0x38bdf8,
      rimIntensity: 2.2,
      loom: 0xffffff,
      loomIntensity: 10.5,
      conduit: 0xe0f2fe,
      envIntensity: 1.0,
    };
  }

  // continuity
  return {
    ...base,
    skyZenith: 0x080604,
    skyHorizon: 0x26190b,
    nebulaTint: 0xfbbf24,
    auroraTint: 0xfde68a,
    planetRimTint: 0xf59e0b,
    starTwinkle: 0.88,
    fogDensity: 0.012,
    hemi: 0xfef3c7,
    hemiGround: 0x160f07,
    key: 0xfff8dc,
    keyIntensity: 2.85,
    rim: 0xf59e0b,
    rimIntensity: 2.15,
    loom: 0xfbbf24,
    loomIntensity: 8.4,
    conduit: 0xfbbf24,
    practical: 0xfbbf24,
    envIntensity: 0.96,
  };
}

/**
 * Computes and attaches a deterministic vertical Ambient Occlusion vertex color attribute
 * to any BufferGeometry whose vertices span [minY, maxY] in local Y space.
 * Only assign the resulting geometry to materials configured with `vertexColors: true`.
 */
export function applyVerticalVertexAO(
  geometry: THREE.BufferGeometry,
  bottomShade = 0.42,
  topShade = 1.0,
  minY?: number,
  maxY?: number
): THREE.BufferGeometry {
  const pos = geometry.getAttribute('position');
  if (!pos) return geometry;

  let lo = minY;
  let hi = maxY;
  if (lo === undefined || hi === undefined) {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    lo = lo ?? box?.min.y ?? -0.5;
    hi = hi ?? box?.max.y ?? 0.5;
  }
  const span = Math.max(0.0001, hi - lo);
  const colors = new Float32Array(pos.count * 3);

  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = Math.min(1, Math.max(0, (y - lo) / span));
    // Smooth curve concentrates darkening near base contact seam while preserving upper face brightness
    const curved = Math.pow(t, 0.72);
    const shade = bottomShade + (topShade - bottomShade) * curved;
    const idx = i * 3;
    colors[idx] = shade;
    colors[idx + 1] = shade;
    colors[idx + 2] = shade;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geometry;
}

export interface ArenaMoodInput {
  bossPhase: number;
  bossCoreExposed: boolean;
  adrenalineTier: number;
  resonanceFlash: number;
  reducedMotion: boolean;
  overdriveActive?: boolean;
  holoActive?: boolean;
  celestialGrade?: CelestialAtmosphereGrade;
}

export interface ArenaMoodModulation {
  rimIntensity: number;
  loomIntensity: number;
  beamOpacity: number;
  beamHex: number;
  rimHex: number;
  auroraIntensity: number;
  nebulaBoost: number;
  starTwinkle: number;
  eclipseRim: number;
}

export function computeArenaMoodModulation(
  look: ChapterVisualLook,
  input: ArenaMoodInput
): ArenaMoodModulation {
  const phase2Surge = input.bossPhase >= 2 ? 1 : 0;
  const flash = Math.max(0, Math.min(1, input.resonanceFlash)) * (input.reducedMotion ? 0.3 : 1);
  const adrBonus = Math.max(0, Math.min(5, Math.floor(input.adrenalineTier))) * 0.04;
  const overdriveBoost = input.overdriveActive ? 0.14 : 0;
  const holoBoost = input.holoActive ? 0.12 : 0;
  const grade: CelestialAtmosphereGrade = input.celestialGrade ?? 'natural';

  const gradeRimScale = grade === 'aurora' ? 1.08 : grade === 'eclipse' ? 0.94 : 1.0;
  const gradeLoomScale = grade === 'aurora' ? 1.06 : grade === 'eclipse' ? 1.12 : 1.0;

  const rimIntensity = Number(
    (
      look.rimIntensity *
      gradeRimScale *
      (1 + phase2Surge * 0.24 + adrBonus + flash * 0.28 + overdriveBoost)
    ).toFixed(3)
  );
  const loomIntensity = Number(
    (
      look.loomIntensity *
      gradeLoomScale *
      (1 +
        phase2Surge * 0.14 +
        (input.bossCoreExposed ? 0.18 : 0) +
        flash * 0.22 +
        holoBoost)
    ).toFixed(3)
  );
  const beamOpacity = Number(
    Math.min(
      0.24,
      0.085 +
        phase2Surge * 0.038 +
        (input.bossCoreExposed ? 0.028 : 0) +
        flash * 0.04 +
        (input.holoActive ? 0.022 : 0)
    ).toFixed(4)
  );

  let beamHex = look.conduit;
  let rimHex = look.rim;
  if (input.bossCoreExposed) {
    beamHex = 0xe0f2fe;
    rimHex = 0x67e8f9;
  } else if (phase2Surge) {
    beamHex = 0xf59e0b;
    rimHex = look.rim === 0x38bdf8 ? 0xf59e0b : look.rim;
  } else if (grade === 'eclipse') {
    beamHex = 0xfbbf24;
  }

  const baseAurora =
    grade === 'aurora' ? 1.35 : grade === 'eclipse' ? 0.42 : 0.78;
  const auroraIntensity = Number(
    Math.min(
      1.85,
      (baseAurora + phase2Surge * 0.22 + flash * 0.25 + (input.holoActive ? 0.24 : 0)) *
        (input.reducedMotion ? 0.65 : 1.0)
    ).toFixed(3)
  );
  const nebulaBoost = Number(
    (
      (grade === 'aurora' ? 1.28 : grade === 'eclipse' ? 0.86 : 1.05) +
      overdriveBoost +
      flash * 0.18
    ).toFixed(3)
  );
  const starTwinkle = Number(
    (
      look.starTwinkle *
      (grade === 'eclipse' ? 1.22 : 1.0) *
      (input.reducedMotion ? 0.25 : 1.0)
    ).toFixed(3)
  );
  const eclipseRim = Number(
    (grade === 'eclipse' ? 0.92 : grade === 'aurora' ? 0.28 : 0.45).toFixed(3)
  );

  return {
    rimIntensity,
    loomIntensity,
    beamOpacity,
    beamHex,
    rimHex,
    auroraIntensity,
    nebulaBoost,
    starTwinkle,
    eclipseRim,
  };
}

