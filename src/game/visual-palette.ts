import * as THREE from 'three';
import type { CampaignChapterId, ChronicleLoomEndingId } from './types.ts';

export interface ChapterVisualLook {
  background: number;
  skyZenith: number;
  skyHorizon: number;
  nebulaTint: number;
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
    background: 0x09111d,
    skyZenith: 0x040812,
    skyHorizon: 0x10243d,
    nebulaTint: 0x22d3ee,
    fogDensity: 0.0135,
    hemi: 0x93c5fd,
    hemiGround: 0x162235,
    key: 0xfffbeb,
    rim: 0x38bdf8,
    loom: 0x22d3ee,
    conduit: 0x22d3ee,
    practical: 0xf59e0b,
    keyIntensity: 2.7,
    rimIntensity: 1.65,
    loomIntensity: 5.6,
    envIntensity: 0.68,
  },
  chapter_1_helix: {
    background: 0x0d1018,
    skyZenith: 0x05060b,
    skyHorizon: 0x1e1b29,
    nebulaTint: 0xf59e0b,
    fogDensity: 0.015,
    hemi: 0xa5b4fc,
    hemiGround: 0x1a1822,
    key: 0xffedd5,
    rim: 0x38bdf8,
    loom: 0xf59e0b,
    conduit: 0x22d3ee,
    practical: 0xf59e0b,
    keyIntensity: 2.55,
    rimIntensity: 1.72,
    loomIntensity: 5.6,
    envIntensity: 0.65,
  },
  chapter_2_choir: {
    background: 0x07151c,
    skyZenith: 0x030a0f,
    skyHorizon: 0x0f2c38,
    nebulaTint: 0x38bdf8,
    fogDensity: 0.014,
    hemi: 0x67e8f9,
    hemiGround: 0x10262e,
    key: 0xfff3c4,
    rim: 0xfbbf24,
    loom: 0x38bdf8,
    conduit: 0x38bdf8,
    practical: 0xd97706,
    keyIntensity: 2.45,
    rimIntensity: 1.6,
    loomIntensity: 6.0,
    envIntensity: 0.7,
  },
  chapter_3_curator: {
    background: 0x100a1f,
    skyZenith: 0x06040f,
    skyHorizon: 0x231342,
    nebulaTint: 0xa855f7,
    fogDensity: 0.0155,
    hemi: 0xc4b5fd,
    hemiGround: 0x1a102e,
    key: 0xede9fe,
    rim: 0xa855f7,
    loom: 0xc084fc,
    conduit: 0xa855f7,
    practical: 0x7c3aed,
    keyIntensity: 2.38,
    rimIntensity: 1.78,
    loomIntensity: 6.2,
    envIntensity: 0.66,
  },
  chapter_4_matron: {
    background: 0x17090f,
    skyZenith: 0x080306,
    skyHorizon: 0x34111d,
    nebulaTint: 0xf43f5e,
    fogDensity: 0.015,
    hemi: 0xfecdd3,
    hemiGround: 0x260d16,
    key: 0xfff1f2,
    rim: 0xf43f5e,
    loom: 0xfb7185,
    conduit: 0xf43f5e,
    practical: 0xe11d48,
    keyIntensity: 2.48,
    rimIntensity: 1.65,
    loomIntensity: 5.8,
    envIntensity: 0.66,
  },
  chapter_5_loom: {
    background: 0x09111f,
    skyZenith: 0x040710,
    skyHorizon: 0x132740,
    nebulaTint: 0x38bdf8,
    fogDensity: 0.013,
    hemi: 0x7dd3fc,
    hemiGround: 0x182130,
    key: 0xfff7d6,
    rim: 0xfbbf24,
    loom: 0x22d3ee,
    conduit: 0x22d3ee,
    practical: 0xf59e0b,
    keyIntensity: 2.65,
    rimIntensity: 1.75,
    loomIntensity: 7.6,
    envIntensity: 0.72,
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
      background: 0x05070a,
      skyZenith: 0x020305,
      skyHorizon: 0x0c1118,
      nebulaTint: 0x475569,
      fogDensity: 0.02,
      hemi: 0x64748b,
      hemiGround: 0x0b0f17,
      key: 0x94a3b8,
      keyIntensity: 1.25,
      rim: 0x475569,
      rimIntensity: 1.0,
      loom: 0x475569,
      loomIntensity: 1.35,
      conduit: 0x475569,
      practical: 0x475569,
      envIntensity: 0.36,
    };
  }

  if (selectedEnding === 'witness') {
    return {
      ...base,
      skyZenith: 0x05101f,
      skyHorizon: 0x1a3e5e,
      nebulaTint: 0x7dd3fc,
      fogDensity: 0.0115,
      hemi: 0xe0f2fe,
      hemiGround: 0x182d44,
      key: 0xf0f9ff,
      keyIntensity: 2.85,
      rim: 0x38bdf8,
      rimIntensity: 1.9,
      loom: 0xffffff,
      loomIntensity: 10.5,
      conduit: 0xe0f2fe,
      envIntensity: 0.78,
    };
  }

  // continuity
  return {
    ...base,
    skyZenith: 0x0a0705,
    skyHorizon: 0x2b1d0d,
    nebulaTint: 0xfbbf24,
    fogDensity: 0.0125,
    hemi: 0xfef3c7,
    hemiGround: 0x241a0d,
    key: 0xfffbeb,
    keyIntensity: 2.7,
    rim: 0xf59e0b,
    rimIntensity: 1.85,
    loom: 0xfbbf24,
    loomIntensity: 8.4,
    conduit: 0xfbbf24,
    practical: 0xfbbf24,
    envIntensity: 0.74,
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
