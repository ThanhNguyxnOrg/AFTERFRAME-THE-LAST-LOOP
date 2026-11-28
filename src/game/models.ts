import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GAME_CONFIG } from './config.ts';
import type { CampaignChapterId, EnemyArchetype, ObstacleCollider } from './types.ts';
import { applyVerticalVertexAO } from './visual-palette.ts';

export interface SovereignAstralCrownRig {
  group: THREE.Group;
  outerAstrolabeArc: THREE.Mesh;
  innerGimbalArc: THREE.Mesh;
  omegaKeystoneGroup: THREE.Group;
  bladesInstancedMesh: THREE.InstancedMesh;
  arcMaterial: THREE.MeshStandardMaterial;
  bladeMaterial: THREE.MeshStandardMaterial;
}

export interface PlayerRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  pelvisPivot: THREE.Group;
  torsoPivot: THREE.Group;
  torsoMesh: THREE.Mesh;
  headGroup: THREE.Group;
  chronoRigPivot: THREE.Group;
  chronoRingMesh: THREE.Mesh;
  chronoInnerRingMesh: THREE.Mesh;
  visorMesh: THREE.Mesh;
  rightArmPivot: THREE.Group;
  rightPauldronPivot: THREE.Group;
  rightForearmPivot: THREE.Group;
  weaponPivot: THREE.Group;
  leftArmPivot: THREE.Group;
  leftPauldronPivot: THREE.Group;
  leftForearmPivot: THREE.Group;
  leftLegPivot: THREE.Group;
  leftShinPivot: THREE.Group;
  leftFootPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  rightShinPivot: THREE.Group;
  rightFootPivot: THREE.Group;
  bladeMesh: THREE.Mesh;
  bladeMaterial: THREE.MeshStandardMaterial;
  armorMaterial?: THREE.MeshStandardMaterial;
  suitMaterial?: THREE.MeshStandardMaterial;
  visorMaterial?: THREE.MeshStandardMaterial;
  phaseBladeMk2Group?: THREE.Group;
  chronoAccentMaterial?: THREE.MeshStandardMaterial;
  aegisShieldMesh?: THREE.Mesh;
  aegisShieldMaterial?: THREE.MeshBasicMaterial;
  aegisEmitterGroup?: THREE.Group;
  naniteCanisterGroup?: THREE.Group;
  sovereignCrownHaloGroup?: THREE.Group;
  astralCrownRig?: SovereignAstralCrownRig;
  paradoxPrismSpikesGroup?: THREE.Group;
  paradoxPrismHeadFinsGroup?: THREE.Group;
  phaseRailGroup?: THREE.Group;
  phaseRailCoils?: THREE.Mesh[];
  gravBreakerGroup?: THREE.Group;
  gravBreakerOrbs?: THREE.Mesh[];
  chronoScytheGroup?: THREE.Group;
  chronoScytheHaloRing?: THREE.Mesh;
  modChipSocketGroup?: THREE.Group;
  modChipVoltGroup?: THREE.Group;
  modChipSiphonGroup?: THREE.Group;
  modChipNovaGroup?: THREE.Group;
  styleCrestGroup?: THREE.Group;
  styleCrestHaloRing?: THREE.Mesh;
  styleCrestWingMat?: THREE.MeshStandardMaterial;
  pulsecasterCoreMesh: THREE.Mesh;
  pulsecasterMaterial: THREE.MeshStandardMaterial;
  slashArcPivot: THREE.Group;
  slashArcMesh: THREE.Mesh;
  slashArcMaterial: THREE.MeshBasicMaterial;
  parryShieldMesh: THREE.Mesh;
  parryShieldMaterial: THREE.MeshBasicMaterial;
  chargeRingMesh: THREE.Mesh;
  chargeRingMaterial: THREE.MeshBasicMaterial;
  chronoAuraMesh?: THREE.Mesh;
  chronoAuraMaterial?: THREE.MeshBasicMaterial;
  echoPhaseRingMesh?: THREE.Mesh;
  echoSecondPhaseRingMesh?: THREE.Mesh;
  echoInnerWireMesh?: THREE.Mesh;
  echoBaseRippleMesh?: THREE.Mesh;
  customMeshySlot?: THREE.Group;
}

export interface EchoAfterimageGhost {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  torsoPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftArmPivot: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  material: THREE.MeshBasicMaterial;
}

export interface EnemyRig {
  id: string;
  archetype: EnemyArchetype;
  root: THREE.Group;
  bodyGroup: THREE.Group;
  torsoPivot: THREE.Group;
  headPivot: THREE.Group;
  primaryMeshes: THREE.Mesh[];
  coreMesh: THREE.Mesh;
  coreMaterial: THREE.MeshStandardMaterial;
  coreRimMesh: THREE.Mesh;
  coreRimMaterial: THREE.MeshBasicMaterial;
  weaponPivot: THREE.Group;
  secondaryPivot: THREE.Group;
  leftArmPivot?: THREE.Group;
  rightArmPivot?: THREE.Group;
  leftLegPivot?: THREE.Group;
  leftShinPivot?: THREE.Group;
  rightLegPivot?: THREE.Group;
  rightShinPivot?: THREE.Group;
  outerHelixRing?: THREE.Group;
  innerHelixRing?: THREE.Group;
  leftShutterPivot?: THREE.Group;
  rightShutterPivot?: THREE.Group;
  ramLaneGroup?: THREE.Group;
  ramLaneFillMat?: THREE.MeshBasicMaterial;
  ramLaneBorderMat?: THREE.MeshBasicMaterial;
  ramLaneShaderMat?: THREE.ShaderMaterial;
  sweepSectorGroup?: THREE.Group;
  sweepSectorFillMat?: THREE.MeshBasicMaterial;
  sweepSectorRimMat?: THREE.MeshBasicMaterial;
  sweepSectorShaderMat?: THREE.ShaderMaterial;
  slamShockwaveRing?: THREE.Mesh;
  slamShockwaveMat?: THREE.MeshBasicMaterial;
  telegraphDisc: THREE.Mesh;
  telegraphDiscMaterial: THREE.MeshBasicMaterial;
  telegraphRing: THREE.Mesh;
  telegraphRingMaterial: THREE.MeshBasicMaterial;
  telegraphShaderDisc?: THREE.Mesh;
  telegraphShaderMat?: THREE.ShaderMaterial;
  laserSightMesh?: THREE.Mesh;
  laserSightMaterial?: THREE.MeshBasicMaterial;
  auxiliaryPivots?: THREE.Group[];
  eliteCrownMesh?: THREE.Mesh;
  eliteCrownMaterial?: THREE.MeshBasicMaterial;
  customMeshySlot?: THREE.Group;
}

/**
 * Generates an equirectangular studio reflection environment map in <3ms so all PBR metallic
 * surfaces (Sera's armor, Bastion's gunmetal carapace, Scrapper's copper plating, and the
 * Chronicle Loom pylon) reflect rich industrial highlights in both desktop GPU and headless WebGL.
 */
export function createStudioEnvironmentTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // High-contrast orbital sci-fi studio cavity (deep obsidian shadows + crisp horizon separation)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0.0, '#050a14');
    bgGrad.addColorStop(0.24, '#0c1a2e');
    bgGrad.addColorStop(0.45, '#1b3554');
    bgGrad.addColorStop(0.5, '#2b4f73');
    bgGrad.addColorStop(0.53, '#0b121f');
    bgGrad.addColorStop(0.76, '#060a12');
    bgGrad.addColorStop(1.0, '#03050a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Primary overhead warm-ivory studio softbox key panels (sharp metallic bevel speculars)
    const drawSoftbox = (x: number, y: number, w: number, h: number, inner: string, outer: string) => {
      const g = ctx.createRadialGradient(x + w * 0.5, y + h * 0.5, 4, x + w * 0.5, y + h * 0.5, Math.max(w, h) * 0.65);
      g.addColorStop(0, inner);
      g.addColorStop(0.6, outer);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 16, y - 16, w + 32, h + 32);
    };
    drawSoftbox(64, 24, 128, 30, 'rgba(255, 250, 236, 1.0)', 'rgba(255, 244, 214, 0.42)');
    drawSoftbox(310, 30, 140, 26, 'rgba(248, 252, 255, 0.96)', 'rgba(186, 230, 253, 0.34)');

    // Crisp electric-cyan orbital architectural rim light strips
    drawSoftbox(28, 86, 176, 14, 'rgba(103, 232, 249, 0.92)', 'rgba(14, 165, 233, 0.25)');
    drawSoftbox(284, 90, 192, 14, 'rgba(56, 189, 248, 0.88)', 'rgba(2, 132, 199, 0.22)');

    // Warm brushed-amber industrial horizon bounce accents (sculpts dark undersides & gold seams)
    drawSoftbox(144, 122, 92, 10, 'rgba(251, 191, 36, 0.72)', 'rgba(217, 119, 6, 0.16)');
    drawSoftbox(384, 122, 82, 10, 'rgba(245, 158, 11, 0.68)', 'rgba(180, 83, 9, 0.14)');

    // Subtle crisp zenith specular pinpoints for polished weapon blades & gold trim
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(108, 34, 42, 6);
    ctx.fillRect(356, 38, 48, 5);
    ctx.fillStyle = 'rgba(125, 211, 252, 0.88)';
    ctx.fillRect(70, 91, 90, 3);
    ctx.fillRect(326, 95, 102, 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Sheet 13 Panel 6 — Node-safe procedural cyan-blue hexagonal honeycomb texture for the Aegis Shield dome.
 */
function createHoneycombShieldTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = 'rgba(14, 165, 233, 0.28)';
  ctx.fillRect(0, 0, 256, 256);

  const hexR = 20;
  const hexH = Math.sqrt(3) * hexR;
  ctx.strokeStyle = 'rgba(125, 249, 255, 0.92)';
  ctx.lineWidth = 2.4;

  for (let row = -1; row < 12; row++) {
    for (let col = -1; col < 10; col++) {
      const cx = col * hexR * 1.5;
      const cy = row * hexH + (col % 2 === 0 ? 0 : hexH * 0.5);
      ctx.beginPath();
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const px = cx + Math.cos(a) * hexR;
        const py = cy + Math.sin(a) * hexR;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Subtle inner cyan highlight on alternating cells
      if ((row + col) % 3 === 0) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.fill();
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 3);
  return tex;
}

/**
 * Sheet 13 Panel 4 — Node-safe procedural violet-magenta & astral-gold swirling spiral vortex texture.
 */
function createParadoxVortexTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const cx = 128;
  const cy = 128;
  const bg = ctx.createRadialGradient(cx, cy, 6, cx, cy, 124);
  bg.addColorStop(0, 'rgba(254, 249, 195, 1.0)');
  bg.addColorStop(0.22, 'rgba(250, 204, 21, 0.92)');
  bg.addColorStop(0.5, 'rgba(217, 70, 239, 0.86)');
  bg.addColorStop(0.82, 'rgba(107, 33, 168, 0.78)');
  bg.addColorStop(1, 'rgba(46, 16, 101, 0.0)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 256);

  // Swirling multi-arm astral-gold & magenta spiral filaments
  for (let arm = 0; arm < 5; arm++) {
    const baseAngle = (arm / 5) * Math.PI * 2;
    ctx.beginPath();
    for (let t = 0; t <= 1; t += 0.025) {
      const r = 8 + t * 110;
      const a = baseAngle + t * 4.4;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (t === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = arm % 2 === 0 ? 'rgba(254, 240, 138, 0.72)' : 'rgba(240, 171, 252, 0.78)';
    ctx.lineWidth = arm % 2 === 0 ? 5.5 : 8;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Luminous astral flecks along the spiral arms
  for (let i = 0; i < 42; i++) {
    const t = (i + 1) / 43;
    const r = 18 + t * 98;
    const a = i * 1.9;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    ctx.fillStyle = i % 3 === 0 ? '#fef08a' : '#f5d0fe';
    ctx.beginPath();
    ctx.arc(x, y, 1.8 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Sheet 13 Panel 3 — Node-safe procedural amber-gold holographic weapon blueprint panel texture.
 */
function createFabricatorHoloTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 144;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = 'rgba(217, 119, 6, 0.24)';
  ctx.fillRect(0, 0, 256, 144);

  // Blueprint grid
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.28)';
  ctx.lineWidth = 1;
  for (let x = 16; x < 256; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 144);
    ctx.stroke();
  }
  for (let y = 16; y < 144; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  // Glowing outer frame
  ctx.strokeStyle = 'rgba(253, 224, 71, 0.92)';
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, 244, 132);

  // Stylized sci-fi tactical rifle wireframe blueprint in center
  ctx.strokeStyle = '#fef08a';
  ctx.fillStyle = 'rgba(251, 191, 36, 0.48)';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(34, 62);
  ctx.lineTo(74, 54);
  ctx.lineTo(156, 54);
  ctx.lineTo(170, 62);
  ctx.lineTo(220, 62);
  ctx.lineTo(220, 74);
  ctx.lineTo(172, 76);
  ctx.lineTo(154, 84);
  ctx.lineTo(132, 84);
  ctx.lineTo(142, 108);
  ctx.lineTo(124, 108);
  ctx.lineTo(112, 84);
  ctx.lineTo(84, 84);
  ctx.lineTo(72, 104);
  ctx.lineTo(56, 104);
  ctx.lineTo(66, 82);
  ctx.lineTo(34, 86);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Top rail scope & schematic callout bars
  ctx.strokeRect(94, 42, 44, 10);
  ctx.fillStyle = '#fde68a';
  ctx.fillRect(24, 20, 62, 5);
  ctx.fillRect(24, 30, 38, 4);
  ctx.fillRect(178, 114, 54, 5);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createRadialShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
    grad.addColorStop(0, 'rgba(2, 4, 8, 0.78)');
    grad.addColorStop(0.5, 'rgba(4, 8, 16, 0.38)');
    grad.addColorStop(1, 'rgba(4, 8, 16, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(canvas);
}

export function createSlashArcTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 256);

    // Radial energy falloff from outer cutting edge to inner trail
    const radGrad = ctx.createRadialGradient(128, 128, 42, 128, 128, 126);
    radGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    radGrad.addColorStop(0.42, 'rgba(34, 211, 238, 0.16)');
    radGrad.addColorStop(0.76, 'rgba(56, 189, 248, 0.78)');
    radGrad.addColorStop(0.93, 'rgba(255, 255, 255, 0.98)');
    radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, 256, 256);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createScorchDecalTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, size, size);
    const cx = 64;
    const cy = 64;
    const baseGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 60);
    baseGrad.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
    baseGrad.addColorStop(0.28, 'rgba(255, 255, 255, 0.65)');
    baseGrad.addColorStop(0.62, 'rgba(148, 163, 184, 0.24)');
    baseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 60, 0, Math.PI * 2);
    ctx.fill();

    // Jagged radial plasma fracture lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + (i % 2) * 0.22;
      const r0 = 10 + (i % 3) * 4;
      const r1 = 44 + ((i * 7) % 14);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
      ctx.lineTo(cx + Math.cos(a + 0.08) * ((r0 + r1) * 0.5), cy + Math.sin(a + 0.08) * ((r0 + r1) * 0.5));
      ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createDustMoteTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.35, 'rgba(224, 242, 254, 0.55)');
    grad.addColorStop(1, 'rgba(224, 242, 254, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createTemporalScanlineTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#164e63';
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += 4) {
      ctx.fillStyle = y % 8 === 0 ? '#67e8f9' : '#0891b2';
      ctx.fillRect(0, y, size, 2);
    }

    // Bright phase band
    const bandGrad = ctx.createLinearGradient(0, 24, 0, 72);
    bandGrad.addColorStop(0, 'rgba(224, 242, 254, 0)');
    bandGrad.addColorStop(0.5, 'rgba(224, 242, 254, 0.92)');
    bandGrad.addColorStop(1, 'rgba(224, 242, 254, 0)');
    ctx.fillStyle = bandGrad;
    ctx.fillRect(0, 24, size, 48);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createFacilitySignTexture(
  code: string,
  subtitle: string,
  accentHex: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#07111e';
    ctx.fillRect(0, 0, 256, 96);

    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, 248, 88);

    ctx.fillStyle = accentHex;
    ctx.fillRect(12, 14, 8, 68);

    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = '#f1f5f9';
    ctx.fillText(code, 30, 44);

    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = accentHex;
    ctx.fillText(subtitle, 30, 70);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let cachedArmorBumpTex: THREE.CanvasTexture | null = null;
let cachedArmorRoughnessTex: THREE.CanvasTexture | null = null;

export function createArmorDetailBumpTexture(): THREE.CanvasTexture {
  if (cachedArmorBumpTex) return cachedArmorBumpTex;
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#848484';
    ctx.fillRect(0, 0, size, size);

    // Fine directional brushed-titanium grain (eliminates smooth plastic-toy look)
    for (let y = 0; y < size; y += 2) {
      const shade = 114 + ((y * 19 + (y % 5) * 11) % 30);
      ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
      ctx.fillRect(0, y, size, 1);
    }

    // Subtle micro-wear diagonal hairline scratches (deterministic, zero Math.random)
    ctx.strokeStyle = 'rgba(182, 182, 182, 0.24)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 36; i++) {
      const sx = (i * 89) % size;
      const sy = (i * 137) % size;
      const len = 18 + (i % 4) * 12;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + len, sy + ((i % 3) - 1) * 4);
      ctx.stroke();
    }

    // Machined outer bevel highlight & deep panel seam channels
    ctx.strokeStyle = '#bcbcbc';
    ctx.lineWidth = 3;
    ctx.strokeRect(18, 18, size - 36, size - 36);

    ctx.strokeStyle = '#282828';
    ctx.lineWidth = 4;
    ctx.strokeRect(14, 14, size - 28, size - 28);

    ctx.strokeStyle = '#343434';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(14, size * 0.5);
    ctx.lineTo(size - 14, size * 0.5);
    ctx.moveTo(size * 0.5, 14);
    ctx.lineTo(size * 0.5, size - 14);
    ctx.stroke();

    // Recessed corner fastener sockets with specular rim
    for (const [rx, ry] of [
      [34, 34],
      [size - 34, 34],
      [34, size - 34],
      [size - 34, size - 34],
    ]) {
      ctx.fillStyle = '#323232';
      ctx.beginPath();
      ctx.arc(rx, ry, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b4b4b4';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.userData.sharedAsset = true;
  cachedArmorBumpTex = tex;
  return tex;
}

export function createArmorRoughnessTexture(): THREE.CanvasTexture {
  if (cachedArmorRoughnessTex) return cachedArmorRoughnessTex;
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Satin brushed metal base with subtle tonal break-up
    ctx.fillStyle = '#787878';
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 3) {
      const v = 96 + ((y * 17) % 42);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(0, y, size, 2);
    }
    // Polished bevel edges (lower roughness -> crisper metallic speculars)
    ctx.strokeStyle = '#424242';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, size - 20, size - 20);
    // Matte recessed dirt/grime inside seams (higher roughness)
    ctx.strokeStyle = '#d4d4d4';
    ctx.lineWidth = 5;
    ctx.strokeRect(6, 6, size - 12, size - 12);
    ctx.beginPath();
    ctx.moveTo(6, size * 0.5);
    ctx.lineTo(size - 6, size * 0.5);
    ctx.moveTo(size * 0.5, 6);
    ctx.lineTo(size * 0.5, size - 6);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.userData.sharedAsset = true;
  cachedArmorRoughnessTex = tex;
  return tex;
}

let sharedEnemyContactShadowGeo: THREE.CircleGeometry | null = null;
let cachedHazardStripeTex: THREE.CanvasTexture | null = null;
export function createHazardStripeTexture(): THREE.CanvasTexture {
  if (cachedHazardStripeTex) return cachedHazardStripeTex;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#eab308';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#181c24';
    const stripeW = 24;
    for (let i = -size; i < size * 2; i += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + stripeW, 0);
      ctx.lineTo(i + stripeW - size, size);
      ctx.lineTo(i - size, size);
      ctx.closePath();
      ctx.fill();
    }
    // Subtle industrial grime lines
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
    for (let y = 0; y < size; y += 8) {
      ctx.fillRect(0, y, size, 1);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedHazardStripeTex = tex;
  return tex;
}

export function createIndustrialDeckTextures(maxAnisotropy: number): {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 1024;
  const tile = 256;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d');

  if (cCtx) {
    // Deep recessed obsidian-slate channel bed
    cCtx.fillStyle = '#04070d';
    cCtx.fillRect(0, 0, size, size);

    const palette = ['#101927', '#142032', '#0e1724', '#162438'];

    for (let y = 0; y < size; y += tile) {
      for (let x = 0; x < size; x += tile) {
        const tx = x / tile;
        const ty = y / tile;
        const idx = (tx + ty * 2) % palette.length;

        // Primary modular titanium deck plate with subtle directional gradient
        const plateGrad = cCtx.createLinearGradient(x + 8, y + 8, x + tile - 8, y + tile - 8);
        plateGrad.addColorStop(0, palette[idx]);
        plateGrad.addColorStop(0.55, '#1a293f');
        plateGrad.addColorStop(1, '#0d1522');
        cCtx.fillStyle = plateGrad;
        cCtx.fillRect(x + 6, y + 6, tile - 12, tile - 12);

        // Subtle inner edge ambient occlusion shadow (adds realistic plate depth)
        cCtx.strokeStyle = 'rgba(3, 6, 12, 0.72)';
        cCtx.lineWidth = 6;
        cCtx.strokeRect(x + 9, y + 9, tile - 18, tile - 18);

        // Crisp machined inner bevel highlight
        cCtx.strokeStyle = '#3b5578';
        cCtx.lineWidth = 2.5;
        cCtx.strokeRect(x + 13, y + 13, tile - 26, tile - 26);

        cCtx.strokeStyle = '#09101a';
        cCtx.lineWidth = 2;
        cCtx.strokeRect(x + 26, y + 26, tile - 52, tile - 52);

        // Fine brushed titanium micro-grain aligned with panel axis
        for (let by = y + 32; by < y + tile - 32; by += 6) {
          cCtx.strokeStyle =
            (by + tx) % 12 === 0
              ? 'rgba(203, 222, 245, 0.065)'
              : 'rgba(6, 11, 20, 0.14)';
          cCtx.lineWidth = 1;
          cCtx.beginPath();
          cCtx.moveTo(x + 30, by);
          cCtx.lineTo(x + tile - 30, by);
          cCtx.stroke();
        }

        // Recessed service louver grate on every 4th alternating bay plate
        if ((tx + ty) % 4 === 2) {
          cCtx.fillStyle = '#050911';
          cCtx.fillRect(x + 42, y + 42, tile - 84, tile - 84);
          cCtx.strokeStyle = '#2b4160';
          cCtx.lineWidth = 3.5;
          for (let gy = y + 54; gy < y + tile - 46; gy += 13) {
            cCtx.beginPath();
            cCtx.moveTo(x + 50, gy);
            cCtx.lineTo(x + tile - 50, gy);
            cCtx.stroke();
          }
          // Subtle antique-amber industrial hazard chevron strip
          cCtx.fillStyle = 'rgba(245, 158, 11, 0.34)';
          for (let hx = x + 50; hx < x + tile - 62; hx += 22) {
            cCtx.fillRect(hx, y + tile - 38, 11, 5);
          }
        } else if ((tx + ty) % 4 === 0) {
          // Recessed maintenance cross-seam + octagonal center access cap
          cCtx.strokeStyle = '#08101c';
          cCtx.lineWidth = 3.5;
          cCtx.beginPath();
          cCtx.moveTo(x + 30, y + tile * 0.5);
          cCtx.lineTo(x + tile - 30, y + tile * 0.5);
          cCtx.moveTo(x + tile * 0.5, y + 30);
          cCtx.lineTo(x + tile * 0.5, y + tile - 30);
          cCtx.stroke();
          cCtx.fillStyle = '#18263b';
          cCtx.fillRect(x + tile * 0.5 - 18, y + tile * 0.5 - 18, 36, 36);
          cCtx.strokeStyle = '#334b6b';
          cCtx.lineWidth = 2;
          cCtx.strokeRect(x + tile * 0.5 - 18, y + tile * 0.5 - 18, 36, 36);
        }

        // Machined corner fastener bolts
        const sockets = [
          [x + 22, y + 22],
          [x + tile - 22, y + 22],
          [x + 22, y + tile - 22],
          [x + tile - 22, y + tile - 22],
        ];
        for (const [sx, sy] of sockets) {
          cCtx.fillStyle = '#050910';
          cCtx.beginPath();
          cCtx.arc(sx, sy, 4.5, 0, Math.PI * 2);
          cCtx.fill();
          cCtx.strokeStyle = '#3c5576';
          cCtx.lineWidth = 1.2;
          cCtx.stroke();
        }

        // Subtle cyan alignment micro-strips & precision hex micro-etching
        if ((tx + ty) % 2 === 0) {
          cCtx.fillStyle = 'rgba(56, 189, 248, 0.42)';
          cCtx.fillRect(x + 42, y + tile - 32, 46, 3);
          cCtx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
          cCtx.lineWidth = 1;
          cCtx.beginPath();
          for (let s = 0; s < 6; s++) {
            const ha = (s / 6) * Math.PI * 2;
            const hx = x + tile * 0.5 + Math.cos(ha) * 24;
            const hy = y + tile * 0.5 + Math.sin(ha) * 24;
            if (s === 0) cCtx.moveTo(hx, hy);
            else cCtx.lineTo(hx, hy);
          }
          cCtx.closePath();
          cCtx.stroke();
        }
      }
    }
  }

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(9, 9);
  colorMap.anisotropy = maxAnisotropy;

  // High-contrast linear bump map for crisp panel relief, recessed grating & bevel seams
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');
  if (bCtx) {
    bCtx.fillStyle = '#909090';
    bCtx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += tile) {
      for (let x = 0; x < size; x += tile) {
        const tx = x / tile;
        const ty = y / tile;
        bCtx.strokeStyle = '#101010';
        bCtx.lineWidth = 10;
        bCtx.strokeRect(x + 3, y + 3, tile - 6, tile - 6);

        bCtx.strokeStyle = '#e8e8e8';
        bCtx.lineWidth = 3.5;
        bCtx.strokeRect(x + 13, y + 13, tile - 26, tile - 26);

        if ((tx + ty) % 4 === 2) {
          bCtx.fillStyle = '#242424';
          bCtx.fillRect(x + 42, y + 42, tile - 84, tile - 84);
          bCtx.strokeStyle = '#a8a8a8';
          bCtx.lineWidth = 3;
          for (let gy = y + 54; gy < y + tile - 46; gy += 13) {
            bCtx.beginPath();
            bCtx.moveTo(x + 50, gy);
            bCtx.lineTo(x + tile - 50, gy);
            bCtx.stroke();
          }
        }
      }
    }
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(9, 9);
  bumpMap.anisotropy = maxAnisotropy;

  // High-contrast roughness variation map (matte oil/grime seams vs sleek satin-reflective titanium plates)
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d');
  if (rCtx) {
    rCtx.fillStyle = '#dcdcdc';
    rCtx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += tile) {
      for (let x = 0; x < size; x += tile) {
        const tx = x / tile;
        const ty = y / tile;
        rCtx.fillStyle = (tx + ty) % 2 === 0 ? '#3a3a3a' : '#525252';
        rCtx.fillRect(x + 14, y + 14, tile - 28, tile - 28);
        // Subtle polished wear band across panel center
        rCtx.fillStyle = '#2e2e2e';
        rCtx.fillRect(x + 36, y + 36, tile - 72, tile - 72);
        if ((tx + ty) % 4 === 2) {
          rCtx.fillStyle = '#c4c4c4';
          rCtx.fillRect(x + 42, y + 42, tile - 84, tile - 84);
        }
      }
    }
  }
  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(9, 9);
  roughnessMap.anisotropy = maxAnisotropy;

  return { colorMap, bumpMap, roughnessMap };
}

function createExtrudedFinGeometry(
  width: number,
  height: number,
  depth: number,
  topTaper = 0.55
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, -height * 0.5);
  shape.lineTo(depth, -height * 0.42);
  shape.lineTo(depth * topTaper, height * 0.5);
  shape.lineTo(0, height * 0.5);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: width,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 3,
  });
  geo.center();
  return geo;
}

function createCurvedBladeGeometry(
  length: number,
  baseWidth: number,
  thickness: number
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, -baseWidth * 0.5);
  shape.quadraticCurveTo(length * 0.55, -baseWidth * 0.45, length, 0);
  shape.quadraticCurveTo(length * 0.5, baseWidth * 0.55, 0, baseWidth * 0.35);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.45,
    bevelSize: baseWidth * 0.14,
    bevelSegments: 3,
  });
  geo.rotateY(-Math.PI / 2);
  return geo;
}

export function buildArenaEnvironment(
  scene: THREE.Scene,
  obstacles: ObstacleCollider[],
  shadowTex: THREE.Texture,
  maxAnisotropy: number,
  enableShadows: boolean
): {
  loomPylonGroup: THREE.Group;
  loomRingMesh: THREE.Mesh;
  loomInnerRingMesh: THREE.Mesh;
  loomOuterRingMesh: THREE.Mesh;
  ventFanMeshes: THREE.Mesh[];
  subDeckFans: THREE.Object3D[];
  conduitGlowMat: THREE.MeshBasicMaterial;
  floorTelemetryMat: THREE.ShaderMaterial;
  skyDomeMat: THREE.ShaderMaterial;
  planetMat: THREE.ShaderMaterial;
  planetRingMat: THREE.ShaderMaterial;
  orbitalDrydockGroup: THREE.Group;
  celestialAstrolabeOuterRing: THREE.Mesh;
  celestialAstrolabeInnerRing: THREE.Mesh;
  orbitalShuttles: THREE.Group[];
  orbitalDebris: THREE.Group[];
  watchtowerHeads: THREE.Group[];
  vaultWheels: THREE.Group[];
  blastStrobeMat: THREE.MeshStandardMaterial;
  beamConeMat: THREE.MeshBasicMaterial;
  loomLightShaftMat: THREE.MeshBasicMaterial;
  obstacleMeshes: THREE.Object3D[];
  obstacleMeshById: Map<string, THREE.Object3D>;
} {
  const { colorMap, bumpMap, roughnessMap } = createIndustrialDeckTextures(maxAnisotropy);
  const armorBump = createArmorDetailBumpTexture();
  const armorRoughness = createArmorRoughnessTexture();
  const arenaRadius = GAME_CONFIG.arena.radius;

  // 0. GLSL Celestial Sky Dome v3.8.0 (multi-octave nebula filaments, Temporal Rift Aurora Borealis curtains, starlight scintillation & solar-eclipse corona)
  const skyDomeMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uZenith: { value: new THREE.Color(0x03060d) },
      uHorizon: { value: new THREE.Color(0x0d2038) },
      uNebula: { value: new THREE.Color(0x22d3ee) },
      uAurora: { value: new THREE.Color(0x38bdf8) },
      uAuroraIntensity: { value: 0.38 },
      uNebulaBoost: { value: 1.0 },
      uStarTwinkle: { value: 0.65 },
      uEclipseRim: { value: 0.0 },
    },
    vertexShader: `
      varying vec3 vWorldDir;
      void main() {
        vWorldDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uZenith;
      uniform vec3 uHorizon;
      uniform vec3 uNebula;
      uniform vec3 uAurora;
      uniform float uAuroraIntensity;
      uniform float uNebulaBoost;
      uniform float uStarTwinkle;
      uniform float uEclipseRim;
      varying vec3 vWorldDir;

      float hash31(vec3 p) {
        p = fract(p * 0.1031);
        p += dot(p, p.yzx + 33.33);
        return fract((p.x + p.y) * p.z);
      }

      void main() {
        vec3 dir = normalize(vWorldDir);
        float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);
        float horizonBand = exp(-abs(dir.y - 0.04) * 5.2);
        vec3 baseSky = mix(uZenith, uHorizon, smoothstep(0.30, 0.56, h) * 0.86 + horizonBand * 0.56);

        // Multi-octave volumetric nebula filaments
        float waveA = sin(dir.x * 5.4 + dir.z * 3.8 + uTime * 0.042) * 0.5 + 0.5;
        float waveB = sin(dir.z * 7.4 - dir.y * 6.2 - uTime * 0.028) * 0.5 + 0.5;
        float waveC = sin((dir.x - dir.z) * 11.2 + dir.y * 8.4 + uTime * 0.065) * 0.5 + 0.5;
        float nebulaMask = smoothstep(-0.10, 0.44, dir.y) * (1.0 - smoothstep(0.58, 0.95, dir.y));
        float cloud = (pow(waveA * waveB, 1.32) * 0.78 + pow(waveB * waveC, 1.85) * 0.42) * nebulaMask;

        // Undulating Temporal Rift Aurora Borealis curtains across upper sky band
        float azim = atan(dir.z, dir.x);
        float fold1 = sin(azim * 5.0 + dir.y * 4.2 + uTime * 0.16);
        float fold2 = sin(azim * 9.0 - dir.y * 6.8 - uTime * 0.23 + fold1 * 1.15);
        float curtain = pow(max(0.0, fold1 * 0.55 + fold2 * 0.45), 2.1);
        float auroraElevation = smoothstep(0.08, 0.28, dir.y) * (1.0 - smoothstep(0.56, 0.88, dir.y));
        float verticalStreaks = 0.65 + 0.35 * sin(azim * 26.0 + fold2 * 2.4 + uTime * 0.35);
        float auroraMask = curtain * auroraElevation * verticalStreaks * uAuroraIntensity;
        vec3 auroraCol = mix(uAurora, vec3(0.98, 0.78, 0.28), smoothstep(0.32, 0.68, dir.y) * 0.36);

        // Crisp procedural deep-space starlight scintillation
        vec3 starCell = floor(dir * 115.0);
        float starSeed = hash31(starCell);
        float starMask = step(0.9935, starSeed) * smoothstep(0.02, 0.22, dir.y);
        float twinkle = 0.55 + 0.45 * sin(uTime * (2.2 + starSeed * 4.5) + starSeed * 62.8);
        vec3 starGlow = mix(vec3(0.82, 0.93, 1.0), uAurora, fract(starSeed * 17.3) * 0.45) * starMask * twinkle * uStarTwinkle * 0.85;

        // Solar-eclipse horizon corona rim (intensifies under 'eclipse' grade or Chapter V climax)
        float sunAlign = max(0.0, dot(normalize(vec3(dir.x, 0.0, dir.z)), normalize(vec3(-0.58, 0.0, -0.81))));
        float eclipseBand = exp(-abs(dir.y - 0.14) * 7.5) * pow(sunAlign, 4.0) * uEclipseRim;
        vec3 eclipseCol = mix(vec3(0.98, 0.58, 0.18), uAurora, 0.28) * eclipseBand * 0.72;

        vec3 col = baseSky
          + uNebula * (cloud * 0.26 * uNebulaBoost + horizonBand * 0.08)
          + auroraCol * (auroraMask * 0.68)
          + starGlow
          + eclipseCol;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
  const skyDomeMesh = new THREE.Mesh(new THREE.SphereGeometry(88, 32, 20), skyDomeMat);
  skyDomeMesh.name = 'NadirOrbitalSkyDome';
  skyDomeMesh.matrixAutoUpdate = false;
  skyDomeMesh.updateMatrix();
  scene.add(skyDomeMesh);

  // 1. Main Layered Industrial Deck Floor (satin-reflective brushed titanium panels + matte recessed seams)
  const floorGeo = new THREE.CylinderGeometry(arenaRadius + 1.15, arenaRadius + 2.1, 0.9, 64);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: colorMap,
    bumpMap,
    bumpScale: 0.048,
    roughnessMap,
    roughness: 0.72,
    metalness: 0.66,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.y = -0.45;
  floorMesh.receiveShadow = enableShadows;
  floorMesh.updateMatrix();
  floorMesh.matrixAutoUpdate = false;
  scene.add(floorMesh);

  // Sculpted Orbital Deck Apron & Sub-Deck Maintenance Trench
  const deckApronMat = new THREE.MeshStandardMaterial({
    color: 0x162133,
    roughness: 0.44,
    metalness: 0.68,
  });
  const deckApron = new THREE.Mesh(
    new THREE.TorusGeometry(arenaRadius + 1.05, 0.28, 10, 64),
    deckApronMat
  );
  deckApron.rotation.x = Math.PI / 2;
  deckApron.position.y = -0.08;
  deckApron.updateMatrix();
  deckApron.matrixAutoUpdate = false;
  scene.add(deckApron);

  const outerTrenchGeo = new THREE.RingGeometry(arenaRadius + 0.8, arenaRadius + 36, 64);
  const outerTrenchMat = new THREE.MeshStandardMaterial({
    color: 0x060b13,
    roughness: 0.86,
    metalness: 0.28,
    side: THREE.DoubleSide,
  });
  const outerTrench = new THREE.Mesh(outerTrenchGeo, outerTrenchMat);
  outerTrench.rotation.x = -Math.PI / 2;
  outerTrench.position.y = -2.45;
  outerTrench.updateMatrix();
  outerTrench.matrixAutoUpdate = false;
  scene.add(outerTrench);

  // Outer Orbital Station Spine Ring & Continuous Overhead Containment Halo
  const orbitalRingMat = new THREE.MeshStandardMaterial({
    color: 0x1d2b3f,
    roughness: 0.4,
    metalness: 0.74,
  });
  const outerStationRing = new THREE.Mesh(
    new THREE.TorusGeometry(arenaRadius + 13.5, 0.65, 12, 72),
    orbitalRingMat
  );
  outerStationRing.rotation.x = Math.PI / 2;
  outerStationRing.position.y = -1.2;
  outerStationRing.updateMatrix();
  outerStationRing.matrixAutoUpdate = false;
  scene.add(outerStationRing);

  const upperHaloRing = new THREE.Mesh(
    new THREE.TorusGeometry(arenaRadius + 1.75, 0.34, 12, 64),
    orbitalRingMat
  );
  upperHaloRing.rotation.x = Math.PI / 2;
  upperHaloRing.position.y = 10.6;
  upperHaloRing.updateMatrix();
  upperHaloRing.matrixAutoUpdate = false;
  scene.add(upperHaloRing);

  // Pre-allocated single-draw-call Orbital Starfield Dome (deterministic, zero Math.random())
  const starCount = 160;
  const starGeo = new THREE.OctahedronGeometry(0.14, 0);
  const starMat = new THREE.MeshBasicMaterial({
    color: 0xe2f1ff,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
  });
  const starfield = new THREE.InstancedMesh(starGeo, starMat, starCount);
  const starDummy = new THREE.Object3D();
  const starColor = new THREE.Color();
  for (let s = 0; s < starCount; s++) {
    const theta = (s * 2.3999632) % (Math.PI * 2);
    const elevation = ((s * 0.6180339) % 1) * 0.75 + 0.04;
    const dist = 54 + ((s * 17) % 28);
    const horiz = dist * Math.cos(elevation);
    starDummy.position.set(
      Math.cos(theta) * horiz,
      Math.sin(elevation) * dist - 2,
      Math.sin(theta) * horiz
    );
    const scale = 0.55 + ((s * 7) % 10) * 0.11;
    starDummy.scale.setScalar(scale);
    starDummy.updateMatrix();
    starfield.setMatrixAt(s, starDummy.matrix);
    starColor.setHex(s % 5 === 0 ? 0x7dd3fc : s % 7 === 0 ? 0xfde68a : 0xe2e8f0);
    starfield.setColorAt(s, starColor);
  }
  starfield.instanceMatrix.needsUpdate = true;
  if (starfield.instanceColor) starfield.instanceColor.needsUpdate = true;
  scene.add(starfield);

  // 2. Embedded Glowing Cyan Floor Conduits, Dais Plinth & Circuitry Channels
  const conduitEdgeMat = new THREE.MeshStandardMaterial({
    color: 0x243449,
    roughness: 0.34,
    metalness: 0.78,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const conduitGlowMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const tealSubtleMat = new THREE.MeshBasicMaterial({
    color: 0x0891b2,
    transparent: true,
    opacity: 0.32,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  // LOOM DAIS — Grand Circular Layered Titanium & Antique-Gold Centerpiece Platform Plinth (Sheet 7, Panel 8)
  const loomDaisGoldMat = new THREE.MeshStandardMaterial({
    color: 0xc9a24b,
    roughness: 0.28,
    metalness: 0.88,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const loomDaisDarkMat = new THREE.MeshStandardMaterial({
    color: 0x1e2938,
    roughness: 0.36,
    metalness: 0.8,
  });
  const loomDaisMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(5.34, 5.64, 0.032, 48),
    loomDaisDarkMat
  );
  loomDaisMesh.position.set(0, 0.016, -2);
  loomDaisMesh.receiveShadow = enableShadows;
  loomDaisMesh.updateMatrix();
  loomDaisMesh.matrixAutoUpdate = false;
  scene.add(loomDaisMesh);

  // Inner stepped titanium deck tier
  const loomInnerPlinth = new THREE.Mesh(
    new THREE.CylinderGeometry(3.85, 4.02, 0.036, 48),
    conduitEdgeMat
  );
  loomInnerPlinth.position.set(0, 0.018, -2);
  loomInnerPlinth.receiveShadow = enableShadows;
  loomInnerPlinth.updateMatrix();
  loomInnerPlinth.matrixAutoUpdate = false;
  scene.add(loomInnerPlinth);

  // Antique-gold outer bevel trim ring + inner collar ring + 8 radial geometric gold seam dividers
  const daisGoldOuter = new THREE.Mesh(
    new THREE.RingGeometry(5.26, 5.42, 48),
    loomDaisGoldMat
  );
  daisGoldOuter.rotation.x = -Math.PI / 2;
  daisGoldOuter.position.set(0, 0.034, -2);
  daisGoldOuter.updateMatrix();
  daisGoldOuter.matrixAutoUpdate = false;
  scene.add(daisGoldOuter);

  const daisGoldMid = new THREE.Mesh(
    new THREE.RingGeometry(3.74, 3.88, 48),
    loomDaisGoldMat
  );
  daisGoldMid.rotation.x = -Math.PI / 2;
  daisGoldMid.position.set(0, 0.037, -2);
  daisGoldMid.updateMatrix();
  daisGoldMid.matrixAutoUpdate = false;
  scene.add(daisGoldMid);

  const goldSeamGeo = new THREE.BoxGeometry(0.11, 0.012, 1.48);
  for (let gs = 0; gs < 8; gs++) {
    const ga = (gs / 8) * Math.PI * 2 + Math.PI / 8;
    const seam = new THREE.Mesh(goldSeamGeo, loomDaisGoldMat);
    seam.position.set(Math.sin(ga) * 4.56, 0.034, -2 + Math.cos(ga) * 4.56);
    seam.rotation.y = ga;
    seam.updateMatrix();
    seam.matrixAutoUpdate = false;
    scene.add(seam);
  }

  // Concentric Glowing Electric-Cyan Chronicle Loom Circuitry Rings (outer, mid, inner)
  const loomCenterRingEdge = new THREE.Mesh(
    new THREE.RingGeometry(5.42, 5.92, 64),
    conduitEdgeMat
  );
  loomCenterRingEdge.rotation.x = -Math.PI / 2;
  loomCenterRingEdge.position.set(0, 0.018, -2);
  loomCenterRingEdge.updateMatrix();
  loomCenterRingEdge.matrixAutoUpdate = false;
  scene.add(loomCenterRingEdge);

  const loomCenterRingGlow = new THREE.Mesh(
    new THREE.RingGeometry(5.56, 5.72, 64),
    conduitGlowMat
  );
  loomCenterRingGlow.rotation.x = -Math.PI / 2;
  loomCenterRingGlow.position.set(0, 0.022, -2);
  loomCenterRingGlow.updateMatrix();
  loomCenterRingGlow.matrixAutoUpdate = false;
  scene.add(loomCenterRingGlow);

  for (const [rIn, rOut] of [[1.32, 1.48], [2.72, 2.86], [3.34, 3.44]] as const) {
    const innerGlow = new THREE.Mesh(
      new THREE.RingGeometry(rIn, rOut, 48),
      conduitGlowMat
    );
    innerGlow.rotation.x = -Math.PI / 2;
    innerGlow.position.set(0, 0.039, -2);
    innerGlow.updateMatrix();
    innerGlow.matrixAutoUpdate = false;
    scene.add(innerGlow);
  }

  const floorTelemetryMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x0891b2) },
    },
    vertexShader: `
      varying vec3 vLocalPos;
      void main() {
        vLocalPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec3 vLocalPos;
      void main() {
        float r = length(vLocalPos.xy);
        float ang = atan(vLocalPos.y, vLocalPos.x);
        float innerEdge = smoothstep(12.01, 12.06, r) * (1.0 - smoothstep(12.08, 12.13, r));
        float outerEdge = smoothstep(12.60, 12.65, r) * (1.0 - smoothstep(12.67, 12.72, r));
        float ticks = smoothstep(0.65, 0.92, cos(ang * 36.0)) * smoothstep(12.16, 12.22, r) * (1.0 - smoothstep(12.50, 12.56, r));
        float sweepPhase = fract((ang - uTime * 0.45) / 6.2831853);
        float sweep = smoothstep(0.84, 1.0, sweepPhase) * 0.85;
        float radialWave = smoothstep(0.88, 1.0, sin((r - uTime * 1.35) * 8.0) * 0.5 + 0.5) * 0.35;
        float alpha = clamp((innerEdge * 0.58 + outerEdge * 0.48 + ticks * 0.58 + sweep * 0.42 + radialWave) * 0.36, 0.0, 0.32);
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  const midArenaRing = new THREE.Mesh(
    new THREE.RingGeometry(11.98, 12.74, 72),
    floorTelemetryMat
  );
  midArenaRing.rotation.x = -Math.PI / 2;
  midArenaRing.position.set(0, 0.017, 0);
  midArenaRing.updateMatrix();
  midArenaRing.matrixAutoUpdate = false;
  scene.add(midArenaRing);

  const outerCircuit = new THREE.Mesh(
    new THREE.RingGeometry(arenaRadius - 0.68, arenaRadius - 0.44, 64),
    conduitGlowMat
  );
  outerCircuit.rotation.x = -Math.PI / 2;
  outerCircuit.position.y = 0.02;
  outerCircuit.updateMatrix();
  outerCircuit.matrixAutoUpdate = false;
  scene.add(outerCircuit);

  // Radial Energy Conduit Channels linking the Central Loom Pylon (0, -2) to the 4 structural corner pillars (Instanced)
  const teachBarrierId = GAME_CONFIG.arena.chronoPlate.receiverId;
  const combineBarrierId = GAME_CONFIG.arena.chronoPuzzle.finalBarrier.id;
  const radialObstacles = obstacles.filter(
    (obs) =>
      obs.id !== 'loom-pylon' &&
      obs.id !== teachBarrierId &&
      obs.id !== combineBarrierId &&
      obs.kind !== 'cover_wall' &&
      obs.kind !== 'destructible_crate'
  );
  if (radialObstacles.length > 0) {
    const channelHousingInst = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(0.46, 1),
      conduitEdgeMat,
      radialObstacles.length
    );
    const channelCoreInst = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(0.13, 1),
      conduitGlowMat,
      radialObstacles.length
    );
    const chanDummy = new THREE.Object3D();
    for (let idx = 0; idx < radialObstacles.length; idx++) {
      const obs = radialObstacles[idx];
      const dx = obs.x - 0;
      const dz = obs.z - -2;
      const len = Math.hypot(dx, dz);
      const angle = Math.atan2(dx, dz);
      const midX = dx * 0.5;
      const midZ = -2 + dz * 0.5;

      chanDummy.rotation.set(-Math.PI / 2, 0, -angle);
      chanDummy.scale.set(1, len, 1);

      chanDummy.position.set(midX, 0.015, midZ);
      chanDummy.updateMatrix();
      channelHousingInst.setMatrixAt(idx, chanDummy.matrix);

      chanDummy.position.set(midX, 0.021, midZ);
      chanDummy.updateMatrix();
      channelCoreInst.setMatrixAt(idx, chanDummy.matrix);
    }
    channelHousingInst.instanceMatrix.needsUpdate = true;
    channelCoreInst.instanceMatrix.needsUpdate = true;
    channelHousingInst.frustumCulled = false;
    channelCoreInst.frustumCulled = false;
    channelHousingInst.matrixAutoUpdate = false;
    channelCoreInst.matrixAutoUpdate = false;
    scene.add(channelHousingInst);
    scene.add(channelCoreInst);
  }

  // Outer Perimeter Sector Ring + Cardinal Cable Raceway Strips (visual floor zoning without obstructing footwork)
  const outerSectorRing = new THREE.Mesh(
    new THREE.RingGeometry(16.12, 16.36, 72),
    tealSubtleMat
  );
  outerSectorRing.rotation.x = -Math.PI / 2;
  outerSectorRing.position.set(0, 0.015, 0);
  outerSectorRing.updateMatrix();
  outerSectorRing.matrixAutoUpdate = false;
  scene.add(outerSectorRing);

  const cardinalRacewayGeo = new RoundedBoxGeometry(0.42, 0.024, 11.4, 1, 0.008);
  const cardinalFiberGeo = new THREE.PlaneGeometry(0.09, 11.2);
  cardinalFiberGeo.rotateX(-Math.PI / 2);
  const racewayInst = new THREE.InstancedMesh(cardinalRacewayGeo, conduitEdgeMat, 4);
  const racewayGlowInst = new THREE.InstancedMesh(cardinalFiberGeo, conduitGlowMat, 4);
  const rwDummy = new THREE.Object3D();
  for (let i = 0; i < 4; i++) {
    const cAngle = (i * Math.PI) / 2;
    const dist = 11.55;
    rwDummy.position.set(Math.sin(cAngle) * dist, 0.01, -2 * Math.cos(cAngle) * 0.25 + Math.cos(cAngle) * dist);
    // Keep anchor center at (0, 0) on outer perimeter ring radial alignment
    rwDummy.position.set(Math.sin(cAngle) * 11.4, 0.011, Math.cos(cAngle) * 11.4);
    rwDummy.rotation.set(0, cAngle, 0);
    rwDummy.updateMatrix();
    racewayInst.setMatrixAt(i, rwDummy.matrix);
    rwDummy.position.y = 0.024;
    rwDummy.updateMatrix();
    racewayGlowInst.setMatrixAt(i, rwDummy.matrix);
  }
  racewayInst.instanceMatrix.needsUpdate = true;
  racewayGlowInst.instanceMatrix.needsUpdate = true;
  racewayInst.frustumCulled = false;
  racewayGlowInst.frustumCulled = false;
  racewayInst.matrixAutoUpdate = false;
  racewayGlowInst.matrixAutoUpdate = false;
  scene.add(racewayInst);
  scene.add(racewayGlowInst);

  // Tactical Combat Runway Chevrons (Spawn-to-Center lane + West/East Boost Pad approach guides)
  const chevronShape = new THREE.Shape();
  chevronShape.moveTo(0, 0.44);
  chevronShape.lineTo(0.68, -0.18);
  chevronShape.lineTo(0.46, -0.34);
  chevronShape.lineTo(0, 0.08);
  chevronShape.lineTo(-0.46, -0.34);
  chevronShape.lineTo(-0.68, -0.18);
  chevronShape.closePath();
  const floorChevronGeo = new THREE.ShapeGeometry(chevronShape);
  floorChevronGeo.rotateX(-Math.PI / 2);
  const floorChevronMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.44,
    side: THREE.DoubleSide,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  const chevronSpecs: ReadonlyArray<{ x: number; z: number; rotY: number; scale: number }> = [
    // South Spawn-to-Center Runway pointing North (-Z)
    { x: 0, z: 11.4, rotY: 0, scale: 1.05 },
    { x: 0, z: 9.2, rotY: 0, scale: 1.05 },
    { x: 0, z: 7.0, rotY: 0, scale: 1.05 },
    // West Boost Pad Approach Lane pointing West (-X)
    { x: -8.6, z: 0, rotY: Math.PI / 2, scale: 0.92 },
    { x: -10.8, z: 0, rotY: Math.PI / 2, scale: 0.92 },
    // East Boost Pad Approach Lane pointing East (+X)
    { x: 8.6, z: 0, rotY: -Math.PI / 2, scale: 0.92 },
    { x: 10.8, z: 0, rotY: -Math.PI / 2, scale: 0.92 },
  ];
  const floorChevronInst = new THREE.InstancedMesh(
    floorChevronGeo,
    floorChevronMat,
    chevronSpecs.length
  );
  const chevDummy = new THREE.Object3D();
  for (let i = 0; i < chevronSpecs.length; i++) {
    const spec = chevronSpecs[i];
    chevDummy.position.set(spec.x, 0.025, spec.z);
    chevDummy.rotation.set(0, spec.rotY, 0);
    chevDummy.scale.setScalar(spec.scale);
    chevDummy.updateMatrix();
    floorChevronInst.setMatrixAt(i, chevDummy.matrix);
  }
  floorChevronInst.instanceMatrix.needsUpdate = true;
  floorChevronInst.frustumCulled = false;
  floorChevronInst.matrixAutoUpdate = false;
  scene.add(floorChevronInst);

  // 3. Shared Environment PBR Materials (Calibrated Albedo + Roughness/Metalness Contrast + Vertex AO Materials)
  const obstacleMeshes: THREE.Object3D[] = [];
  const obstacleMeshById = new Map<string, THREE.Object3D>();

  const deepGraphiteMat = new THREE.MeshStandardMaterial({
    color: 0x162030,
    bumpMap: armorBump,
    bumpScale: 0.022,
    roughnessMap: armorRoughness,
    roughness: 0.52,
    metalness: 0.74,
  });
  const deepGraphiteAoMat = new THREE.MeshStandardMaterial({
    color: 0x182436,
    bumpMap: armorBump,
    bumpScale: 0.022,
    roughnessMap: armorRoughness,
    roughness: 0.54,
    metalness: 0.72,
    vertexColors: true,
  });
  const steelBlueMat = new THREE.MeshStandardMaterial({
    color: 0x2b405c,
    bumpMap: armorBump,
    bumpScale: 0.016,
    roughnessMap: armorRoughness,
    roughness: 0.34,
    metalness: 0.84,
  });
  const steelBlueAoMat = new THREE.MeshStandardMaterial({
    color: 0x2e4564,
    bumpMap: armorBump,
    bumpScale: 0.016,
    roughnessMap: armorRoughness,
    roughness: 0.36,
    metalness: 0.82,
    vertexColors: true,
  });
  const paleAlloyTrimMat = new THREE.MeshStandardMaterial({
    color: 0x9aaec7,
    bumpMap: armorBump,
    bumpScale: 0.008,
    roughness: 0.2,
    metalness: 0.92,
  });
  const warmBronzeTrimMat = new THREE.MeshStandardMaterial({
    color: 0xc97a2b,
    bumpMap: armorBump,
    bumpScale: 0.008,
    roughness: 0.24,
    metalness: 0.9,
  });
  const darkRubberMat = new THREE.MeshStandardMaterial({
    color: 0x090e17,
    roughness: 0.88,
    metalness: 0.14,
  });
  const hazardAmberMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 1.28,
    roughness: 0.2,
    metalness: 0.5,
  });
  const cyanEmissiveMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.45,
    roughness: 0.16,
    metalness: 0.42,
  });
  const beamConeMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.036,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // Diegetic Facility Signage Textures
  const signBay04 = new THREE.MeshBasicMaterial({
    map: createFacilitySignTexture('NADIR-9 // BAY 04', 'CHRONICLE LOOM TEST SECTOR', '#22d3ee'),
  });
  const signCalSector = new THREE.MeshBasicMaterial({
    map: createFacilitySignTexture('CAL-01 // ANCHOR', 'TEMPORAL ECHO CALIBRATION', '#f59e0b'),
  });

  // 4. Unified 16-Segment Observation Containment Ring + Sub-Deck Radial Trusses (InstancedMesh Draw-Call Batching)
  // OBSERVATION WALL & DATA CONSOLE — Curved Dark-Graphite Armored Bulkhead Viewports + Triple-Screen Command Desks (Sheet 7, Panels 5 & 6)
  const obsViewportGlassMat = new THREE.MeshStandardMaterial({
    color: 0x0f2536,
    emissive: 0x083344,
    emissiveIntensity: 0.45,
    roughness: 0.12,
    metalness: 0.72,
  });
  const obsCyanTrimMat = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.45,
    roughness: 0.16,
    metalness: 0.25,
  });
  const consoleCopperMat = new THREE.MeshStandardMaterial({
    color: 0x9a6443,
    roughness: 0.34,
    metalness: 0.82,
  });
  const consoleSlateMat = new THREE.MeshStandardMaterial({
    color: 0x2c3440,
    roughness: 0.38,
    metalness: 0.78,
  });
  const wallBoxGeo = applyVerticalVertexAO(
    new RoundedBoxGeometry(4.92, 1.82, 0.84, 1, 0.12),
    0.46,
    1.0
  );
  const recessedPanelGeo = new RoundedBoxGeometry(3.86, 0.96, 0.88, 1, 0.08);
  const viewportFrameGeo = new RoundedBoxGeometry(2.35, 0.82, 0.18, 1, 0.06);
  const viewportGlassGeo = new THREE.PlaneGeometry(2.04, 0.58);
  const verticalRibGeo = new RoundedBoxGeometry(0.24, 1.76, 0.94, 1, 0.04);
  const topRailGeo = new RoundedBoxGeometry(5.36, 0.34, 1.0, 1, 0.1);
  const stanchionGeo = new RoundedBoxGeometry(0.78, 3.4, 1.12, 1, 0.12);
  const postCapGeo = new RoundedBoxGeometry(0.88, 0.26, 1.2, 1, 0.06);
  const bumperCylGeo = new THREE.CylinderGeometry(0.12, 0.12, 4.4, 10);
  bumperCylGeo.rotateZ(Math.PI / 2);
  const upperConduitGeo = new THREE.CylinderGeometry(0.065, 0.065, 4.6, 8);
  upperConduitGeo.rotateZ(Math.PI / 2);
  const braceStrutGeo = new RoundedBoxGeometry(0.24, 1.35, 0.32, 1, 0.04);
  const radialTrussGeo = new THREE.BoxGeometry(0.7, 0.46, 14.5);
  const sillLightGeo = new THREE.BoxGeometry(2.45, 0.065, 0.98);
  const archColumnGeo = new RoundedBoxGeometry(1.12, 11.4, 1.35, 1, 0.14);
  const archKneeGeo = new RoundedBoxGeometry(1.02, 0.82, 3.4, 1, 0.1);
  const archUpperBoomGeo = new RoundedBoxGeometry(0.86, 0.56, 4.8, 1, 0.08);
  const floodPodGeo = new RoundedBoxGeometry(1.18, 0.56, 0.78, 2, 0.08);
  const floodTrimGeo = new RoundedBoxGeometry(1.24, 0.62, 0.14, 2, 0.04);
  const floodGimbalGeo = new RoundedBoxGeometry(1.42, 0.14, 0.24, 1, 0.03);
  const floodLensGeo = new THREE.CylinderGeometry(0.21, 0.22, 0.12, 16);
  floodLensGeo.rotateX(Math.PI / 2);
  const beamConeGeo = new THREE.CylinderGeometry(0.32, 2.5, 7.6, 16, 1, true);
  const archLightGeo = new THREE.BoxGeometry(0.18, 7.6, 0.18);
  const beaconCapGeo = new THREE.BoxGeometry(0.55, 0.12, 0.55);
  const ventHousingGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.2, 14);
  ventHousingGeo.rotateX(Math.PI / 2);
  const fanBladeGeo = new THREE.BoxGeometry(0.72, 0.11, 0.035);
  const hatchDoorGeo = new RoundedBoxGeometry(1.18, 1.12, 0.16, 1, 0.04);
  const hatchCyanBarGeo = new THREE.BoxGeometry(0.72, 0.055, 0.18);
  const hatchLatchGeo = new THREE.BoxGeometry(0.18, 0.08, 0.16);
  const deskMonitorScreenGeo = new THREE.PlaneGeometry(0.72, 0.42);

  const ventFanMeshes: THREE.Mesh[] = [];
  const numSegments = 16;

  const createStaticInstanced = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    count: number,
    receiveShadow = false
  ) => {
    const inst = new THREE.InstancedMesh(geo, mat, count);
    inst.receiveShadow = receiveShadow;
    inst.castShadow = false;
    inst.frustumCulled = false;
    inst.matrixAutoUpdate = false;
    scene.add(inst);
    return inst;
  };

  const trussInst = createStaticInstanced(radialTrussGeo, orbitalRingMat, numSegments);
  const baseWallInst = createStaticInstanced(wallBoxGeo, deepGraphiteAoMat, numSegments, enableShadows);
  const insetPanelInst = createStaticInstanced(recessedPanelGeo, steelBlueMat, numSegments);
  const viewportFrameInst = createStaticInstanced(viewportFrameGeo, deepGraphiteMat, numSegments);
  const viewportGlassInst = createStaticInstanced(viewportGlassGeo, obsViewportGlassMat, numSegments);
  const vRibInst = createStaticInstanced(verticalRibGeo, paleAlloyTrimMat, numSegments * 2);
  const lowerPipeInst = createStaticInstanced(bumperCylGeo, paleAlloyTrimMat, numSegments);
  const upperPipeInst = createStaticInstanced(upperConduitGeo, warmBronzeTrimMat, numSegments);
  const topRailInst = createStaticInstanced(topRailGeo, paleAlloyTrimMat, numSegments);
  const postInst = createStaticInstanced(stanchionGeo, steelBlueMat, numSegments);
  const deckBraceInst = createStaticInstanced(braceStrutGeo, paleAlloyTrimMat, numSegments);
  const postCapInst = createStaticInstanced(postCapGeo, paleAlloyTrimMat, numSegments);
  const sillLightInst = createStaticInstanced(sillLightGeo, obsCyanTrimMat, numSegments);

  const ventCount = 4; // i % 4 === 1
  const hatchCount = 4; // i % 4 === 2
  const archCount = 4; // i % 4 === 0

  const ventHousingInst = createStaticInstanced(ventHousingGeo, darkRubberMat, ventCount);
  const hatchInst = createStaticInstanced(hatchDoorGeo, deepGraphiteMat, hatchCount);
  const hatchCyanBarInst = createStaticInstanced(hatchCyanBarGeo, obsCyanTrimMat, hatchCount);
  const hatchLatchInst = createStaticInstanced(hatchLatchGeo, hazardAmberMat, hatchCount * 2);
  const archRibInst = createStaticInstanced(archColumnGeo, deepGraphiteMat, archCount);
  const archKneeInst = createStaticInstanced(archKneeGeo, steelBlueMat, archCount);
  const archBoomInst = createStaticInstanced(archUpperBoomGeo, steelBlueMat, archCount);
  const floodPodInst = createStaticInstanced(floodPodGeo, deepGraphiteMat, archCount);
  const floodTrimInst = createStaticInstanced(floodTrimGeo, warmBronzeTrimMat, archCount);
  const floodGimbalInst = createStaticInstanced(floodGimbalGeo, steelBlueMat, archCount);
  const floodLensInst = createStaticInstanced(floodLensGeo, cyanEmissiveMat, archCount * 2);
  const beamConeInst = createStaticInstanced(beamConeGeo, beamConeMat, archCount);
  const archLightInst = createStaticInstanced(archLightGeo, cyanEmissiveMat, archCount);
  const beaconCapInst = createStaticInstanced(beaconCapGeo, hazardAmberMat, archCount);
  const blastStrobeMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xea580c,
    emissiveIntensity: 1.25,
    roughness: 0.2,
    metalness: 0.3,
  });
  const orbitalShuttles: THREE.Group[] = [];
  const orbitalDebris: THREE.Group[] = [];
  const watchtowerHeads: THREE.Group[] = [];
  const vaultWheels: THREE.Group[] = [];

  const segPivot = new THREE.Object3D();
  const localObj = new THREE.Object3D();
  segPivot.add(localObj);

  const setInstPart = (
    inst: THREE.InstancedMesh,
    idx: number,
    lx: number,
    ly: number,
    lz: number,
    rx = 0,
    ry = 0,
    rz = 0
  ) => {
    localObj.position.set(lx, ly, lz);
    localObj.rotation.set(rx, ry, rz);
    localObj.scale.set(1, 1, 1);
    localObj.updateMatrixWorld(true);
    inst.setMatrixAt(idx, localObj.matrixWorld);
  };

  let vRibIdx = 0;
  let ventIdx = 0;
  let hatchIdx = 0;
  let latchIdx = 0;
  let archIdx = 0;

  for (let i = 0; i < numSegments; i++) {
    const angle = (i / numSegments) * Math.PI * 2;
    const dist = arenaRadius + 0.35;
    segPivot.position.set(Math.sin(angle) * dist, 0, Math.cos(angle) * dist);
    segPivot.rotation.set(0, angle, 0);
    segPivot.updateMatrixWorld(true);

    setInstPart(trussInst, i, 0, -1.05, 7.2);
    setInstPart(baseWallInst, i, 0, 0.91, 0);
    setInstPart(insetPanelInst, i, 0, 0.92, 0);
    // Recessed beveled Observation Viewport Window on the inner face of every perimeter wall
    setInstPart(viewportFrameInst, i, -0.78, 0.96, -0.42);
    setInstPart(viewportGlassInst, i, -0.78, 0.96, -0.52, 0, Math.PI, 0);
    setInstPart(vRibInst, vRibIdx++, -1.92, 0.92, -0.02);
    setInstPart(vRibInst, vRibIdx++, 1.92, 0.92, -0.02);
    setInstPart(lowerPipeInst, i, 0, 0.24, -0.45);
    setInstPart(upperPipeInst, i, 0, 1.62, -0.45);
    setInstPart(topRailInst, i, 0, 1.9, 0);
    setInstPart(postInst, i, 2.65, 1.7, 0);
    setInstPart(deckBraceInst, i, 2.65, 0.56, -0.6, 0.42, 0, 0);
    setInstPart(postCapInst, i, 2.65, 3.45, 0);
    // Crisp glowing cyan telemetry cornice strip along upper rim
    setInstPart(sillLightInst, i, 0, 1.56, -0.04);

    if (i % 4 === 1) {
      setInstPart(ventHousingInst, ventIdx++, 1.15, 0.92, -0.42);
      const fanAnchor = new THREE.Group();
      fanAnchor.position.copy(segPivot.position);
      fanAnchor.rotation.y = angle;
      fanAnchor.updateMatrix();
      fanAnchor.matrixAutoUpdate = false;

      const fanRotor = new THREE.Mesh(fanBladeGeo, paleAlloyTrimMat);
      fanRotor.position.set(1.15, 0.92, -0.48);
      const crossBlade = new THREE.Mesh(fanBladeGeo, paleAlloyTrimMat);
      crossBlade.rotation.z = Math.PI * 0.5;
      crossBlade.updateMatrix();
      crossBlade.matrixAutoUpdate = false;
      fanRotor.add(crossBlade);
      fanAnchor.add(fanRotor);
      scene.add(fanAnchor);
      ventFanMeshes.push(fanRotor);

      // BLAST STROBE — Wall-Mounted Industrial Gunmetal Emergency Beacon with Glowing Amber-Red Fresnel Lens (Sheet 10, Panel 8)
      const strobeUnit = new THREE.Group();
      localObj.position.set(-1.12, 1.38, -0.46);
      localObj.rotation.set(0, Math.PI, 0);
      localObj.scale.set(1, 1, 1);
      localObj.updateMatrixWorld(true);
      localObj.matrixWorld.decompose(strobeUnit.position, strobeUnit.quaternion, strobeUnit.scale);
      const strobePlate = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.72, 0.14, 1, 0.03), deepGraphiteMat);
      strobeUnit.add(strobePlate);
      const strobeTopCap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 0.16, 14), steelBlueMat);
      strobeTopCap.position.set(0, 0.22, 0.14);
      strobeUnit.add(strobeTopCap);
      const strobeBotCap = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.18, 0.14, 14), steelBlueMat);
      strobeBotCap.position.set(0, -0.22, 0.14);
      strobeUnit.add(strobeBotCap);
      const strobeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.3, 14), blastStrobeMat);
      strobeLens.position.set(0, 0, 0.14);
      strobeUnit.add(strobeLens);
      for (const gx of [-0.17, 0.17]) {
        const guardBar = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.36, 0.045), deepGraphiteMat);
        guardBar.position.set(gx, 0, 0.24);
        strobeUnit.add(guardBar);
      }
      strobeUnit.updateMatrixWorld(true);
      strobeUnit.traverse((c) => {
        c.matrixAutoUpdate = false;
      });
      scene.add(strobeUnit);

      // ORBITAL WATCHTOWER — Fortified Octagonal Sentry Pylon with Rotating Cyan Dual-Optic Scanner Head & Corner Amber Beacons (Sheet 11, Panel 7)
      const watchtower = new THREE.Group();
      localObj.position.set(0, 3.05, 0.95);
      localObj.rotation.set(0, Math.PI, 0);
      localObj.scale.set(1, 1, 1);
      localObj.updateMatrixWorld(true);
      localObj.matrixWorld.decompose(watchtower.position, watchtower.quaternion, watchtower.scale);
      const wtBase = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.92, 1.35, 8), steelBlueMat);
      wtBase.position.y = 0.68;
      watchtower.add(wtBase);
      const wtArmorShell = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.78, 1.05, 4), paleAlloyTrimMat);
      wtArmorShell.position.y = 0.72;
      wtArmorShell.rotation.y = Math.PI * 0.25;
      watchtower.add(wtArmorShell);
      const wtCap = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.68, 0.18, 8), deepGraphiteMat);
      wtCap.position.y = 1.42;
      watchtower.add(wtCap);
      for (let b = 0; b < 4; b++) {
        const ba = (b / 4) * Math.PI * 2 + Math.PI * 0.25;
        const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.22, 8), hazardAmberMat);
        beacon.position.set(Math.cos(ba) * 0.52, 1.62, Math.sin(ba) * 0.52);
        watchtower.add(beacon);
      }
      const wtHeadPivot = new THREE.Group();
      wtHeadPivot.position.set(0, 1.88, 0);
      wtHeadPivot.userData = { baseRotY: 0, phase: i * 1.15 };
      const wtHeadBody = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.52, 0.72, 2, 0.06), steelBlueMat);
      wtHeadPivot.add(wtHeadBody);
      const wtOpticHousing = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.42, 0.16, 2, 0.04), cyanEmissiveMat);
      wtOpticHousing.position.set(0, 0, 0.34);
      wtHeadPivot.add(wtOpticHousing);
      const wtOpticLens = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 14), deepGraphiteMat);
      wtOpticLens.rotation.x = Math.PI * 0.5;
      wtOpticLens.position.set(0, 0, 0.42);
      wtHeadPivot.add(wtOpticLens);
      const wtLensCore = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), cyanEmissiveMat);
      wtLensCore.position.set(0, 0, 0.48);
      wtHeadPivot.add(wtLensCore);
      watchtower.add(wtHeadPivot);
      scene.add(watchtower);
      watchtowerHeads.push(wtHeadPivot);
    } else if (i % 4 === 2) {
      // Recessed Observation Wall Maintenance Hatch Door with glowing cyan door bar
      setInstPart(hatchInst, hatchIdx, 1.12, 0.86, -0.44);
      setInstPart(hatchCyanBarInst, hatchIdx, 1.12, 1.34, -0.47);
      hatchIdx++;
      for (const ly of [0.68, 1.04]) {
        setInstPart(hatchLatchInst, latchIdx++, 1.54, ly, -0.48);
      }

      // QUANTUM ARCHIVE VAULT — Octagonal Gunmetal Bulkhead Door with Glowing Cyan Holographic Data Rings & 6-Spoke Rotating Golden Locking Wheel (Sheet 11, Panel 8)
      if (i === 2 || i === 10) {
        const vaultGroup = new THREE.Group();
        localObj.position.set(-1.18, 1.58, -0.44);
        localObj.rotation.set(0, Math.PI, 0);
        localObj.scale.set(1, 1, 1);
        localObj.updateMatrixWorld(true);
        localObj.matrixWorld.decompose(vaultGroup.position, vaultGroup.quaternion, vaultGroup.scale);
        const vaultFrame = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.26, 0.24, 8), deepGraphiteMat);
        vaultFrame.rotation.x = Math.PI * 0.5;
        vaultGroup.add(vaultFrame);
        const vaultDoorPlate = new THREE.Mesh(new THREE.CylinderGeometry(1.04, 1.04, 0.18, 8), steelBlueMat);
        vaultDoorPlate.rotation.x = Math.PI * 0.5;
        vaultDoorPlate.position.z = 0.08;
        vaultGroup.add(vaultDoorPlate);
        const vaultOuterCyanRing = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.036, 8, 8), cyanEmissiveMat);
        vaultOuterCyanRing.position.z = 0.18;
        vaultGroup.add(vaultOuterCyanRing);
        const vaultInnerCyanRing = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.032, 8, 28), cyanEmissiveMat);
        vaultInnerCyanRing.position.z = 0.19;
        vaultGroup.add(vaultInnerCyanRing);
        const wheelPivot = new THREE.Group();
        wheelPivot.position.z = 0.24;
        const vaultHub = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.14, 12), warmBronzeTrimMat);
        vaultHub.rotation.x = Math.PI * 0.5;
        wheelPivot.add(vaultHub);
        const spokeGeo = new THREE.BoxGeometry(0.1, 1.58, 0.08);
        for (let sp = 0; sp < 3; sp++) {
          const spoke = new THREE.Mesh(spokeGeo, warmBronzeTrimMat);
          spoke.rotation.z = (sp / 3) * Math.PI;
          wheelPivot.add(spoke);
        }
        const hubCore = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.18, 10), cyanEmissiveMat);
        hubCore.rotation.x = Math.PI * 0.5;
        wheelPivot.add(hubCore);
        vaultGroup.add(wheelPivot);
        scene.add(vaultGroup);
        vaultWheels.push(wheelPivot);
      }
    } else if (i % 4 === 3) {
      // DATA CONSOLE — Wide Freestanding Orbital Command Desk with Copper Trim & Triple Angled Holographic Monitors (Sheet 7, Panel 6)
      const consoleDesk = new THREE.Group();
      localObj.position.set(0.35, 0, -1.08);
      localObj.rotation.set(0, Math.PI, 0);
      localObj.scale.set(1, 1, 1);
      localObj.updateMatrixWorld(true);
      localObj.matrixWorld.decompose(consoleDesk.position, consoleDesk.quaternion, consoleDesk.scale);

      // Two slate-steel pedestal legs with copper foot trim
      for (const lx of [-1.05, 1.05]) {
        const leg = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.78, 0.66, 2, 0.04), consoleSlateMat);
        leg.position.set(lx, 0.41, 0);
        consoleDesk.add(leg);
        const foot = new THREE.Mesh(new RoundedBoxGeometry(0.34, 0.08, 0.72, 1, 0.02), consoleCopperMat);
        foot.position.set(lx, 0.04, 0);
        consoleDesk.add(foot);
      }
      // Back modesty panel & wide copper-beveled command desktop
      const backPanel = new THREE.Mesh(new RoundedBoxGeometry(1.9, 0.62, 0.14, 1, 0.03), deepGraphiteMat);
      backPanel.position.set(0, 0.44, -0.22);
      consoleDesk.add(backPanel);
      const desktop = new THREE.Mesh(new RoundedBoxGeometry(2.55, 0.11, 0.84, 2, 0.04), consoleSlateMat);
      desktop.position.set(0, 0.82, 0.02);
      consoleDesk.add(desktop);
      const copperTrim = new THREE.Mesh(new RoundedBoxGeometry(2.62, 0.065, 0.88, 1, 0.025), consoleCopperMat);
      copperTrim.position.set(0, 0.81, 0.02);
      consoleDesk.add(copperTrim);
      // Angled tactical keyboard deck on the desktop
      const kbDeck = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.055, 0.3, 1, 0.015), paleAlloyTrimMat);
      kbDeck.position.set(0, 0.895, 0.18);
      kbDeck.rotation.x = 0.2;
      consoleDesk.add(kbDeck);
      // Triple Angled Holographic Telemetry Monitors (Left, Center, Right)
      const screenMat = i % 8 === 3 ? signBay04 : signCalSector;
      for (const [mx, mz, ry, w] of [
        [-0.82, -0.14, 0.24, 0.76],
        [0, -0.24, 0, 0.88],
        [0.82, -0.14, -0.24, 0.76],
      ] as const) {
        const monPivot = new THREE.Group();
        monPivot.position.set(mx, 1.24, mz);
        monPivot.rotation.set(-0.14, ry, 0);
        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.34, 0.08), consoleSlateMat);
        stand.position.set(0, -0.24, -0.02);
        monPivot.add(stand);
        const frame = new THREE.Mesh(new RoundedBoxGeometry(w, 0.48, 0.055, 1, 0.02), consoleSlateMat);
        monPivot.add(frame);
        const screen = new THREE.Mesh(deskMonitorScreenGeo, screenMat);
        screen.scale.x = w / 0.76;
        screen.position.z = 0.032;
        monPivot.add(screen);
        consoleDesk.add(monPivot);
      }

      consoleDesk.updateMatrixWorld(true);
      consoleDesk.traverse((c) => {
        c.matrixAutoUpdate = false;
      });
      scene.add(consoleDesk);
    }

    if (i % 4 === 0) {
      setInstPart(archRibInst, archIdx, 0, 5.6, 1.45);
      setInstPart(archKneeInst, archIdx, 0, 10.6, 0.15);
      setInstPart(archBoomInst, archIdx, 0, 11.2, -1.65, -0.18, 0, 0);
      // FLOODLIGHT POD — Ribbed Graphite Housing, Hydraulic Gimbal & Twin Circular Ice-Cyan Lenses (Sheet 9, Panel 4)
      setInstPart(floodPodInst, archIdx, 0, 8.62, 0.52, 0.34, 0, 0);
      setInstPart(floodTrimInst, archIdx, 0, 8.48, 0.14, 0.34, 0, 0);
      setInstPart(floodGimbalInst, archIdx, 0, 8.95, 0.62, 0.34, 0, 0);
      setInstPart(floodLensInst, archIdx * 2, -0.28, 8.46, 0.12, 0.34, 0, 0);
      setInstPart(floodLensInst, archIdx * 2 + 1, 0.28, 8.46, 0.12, 0.34, 0, 0);
      setInstPart(beamConeInst, archIdx, 0, 5.05, -0.9, 0.34, 0, 0);
      setInstPart(archLightInst, archIdx, 0, 6.2, 0.78);
      setInstPart(beaconCapInst, archIdx, 0, 3.64, 0);
      archIdx++;
    }
  }

  for (const inst of [
    trussInst,
    baseWallInst,
    insetPanelInst,
    viewportFrameInst,
    viewportGlassInst,
    vRibInst,
    lowerPipeInst,
    upperPipeInst,
    topRailInst,
    postInst,
    deckBraceInst,
    postCapInst,
    sillLightInst,
    ventHousingInst,
    hatchInst,
    hatchCyanBarInst,
    hatchLatchInst,
    archRibInst,
    archKneeInst,
    archBoomInst,
    floodPodInst,
    floodTrimInst,
    floodGimbalInst,
    floodLensInst,
    beamConeInst,
    archLightInst,
    beaconCapInst,
  ]) {
    inst.instanceMatrix.needsUpdate = true;
  }

  // 4B. Package A + v1.7.0 Vista: Orbital Planet Vista, Drydock Ring Silhouettes, Outer Trusses, Sub-Deck Turbines & Gantries
  const subDeckFans: THREE.Object3D[] = [];
  const orbitalVistaGroup = new THREE.Group();
  orbitalVistaGroup.name = 'NadirOrbitalVistaGroup';

  const planetMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color(0x0ea5e9) },
      uRimTint: { value: new THREE.Color(0x38bdf8) },
    },
    vertexShader: `
      varying vec3 vNormalDir;
      varying vec3 vViewPos;
      varying vec3 vLocalPos;
      void main() {
        vLocalPos = normalize(position);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPos.xyz;
        vNormalDir = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uAccent;
      uniform vec3 uRimTint;
      varying vec3 vNormalDir;
      varying vec3 vViewPos;
      varying vec3 vLocalPos;
      void main() {
        vec3 n = normalize(vNormalDir);
        vec3 v = normalize(vViewPos);
        vec3 lightDir = normalize(vec3(0.62, 0.56, 0.52));
        float rawDot = dot(n, lightDir);
        float ndl = clamp(rawDot * 0.85 + 0.18, 0.0, 1.0);
        float lat = vLocalPos.y;
        float lon = atan(vLocalPos.z, vLocalPos.x) + uTime * 0.012;
        float band = sin(lat * 20.0 + sin(lon * 3.2 + uTime * 0.04) * 0.72) * 0.5 + 0.5;
        float swirl = cos(lon * 6.0 - lat * 12.0 + uTime * 0.025) * 0.5 + 0.5;
        vec3 deepBody = vec3(0.045, 0.085, 0.165);
        vec3 stormBand = mix(vec3(0.10, 0.22, 0.36), uAccent * 0.56, 0.48);
        vec3 cloudTop = mix(stormBand, vec3(0.72, 0.86, 0.98), pow(band * swirl, 2.2) * 0.38);
        vec3 baseCol = mix(deepBody, cloudTop, band);

        // Illuminated night-side orbital & continental colony arcs on dark hemisphere
        float nightMask = smoothstep(0.16, -0.28, rawDot);
        float gridA = smoothstep(0.92, 0.99, sin(lon * 18.0 + lat * 9.0) * 0.5 + 0.5);
        float gridB = smoothstep(0.90, 0.985, cos(lat * 26.0 - lon * 7.0) * 0.5 + 0.5);
        float cityArc = (gridA * 0.65 + gridB * 0.55) * smoothstep(0.75, 0.15, abs(lat)) * nightMask;
        vec3 cityLights = vec3(1.0, 0.76, 0.36) * (cityArc * 0.62);

        // Rayleigh atmospheric limb scattering
        float fresnel = pow(clamp(1.0 - max(dot(n, v), 0.0), 0.0, 1.0), 2.55);
        vec3 rim = mix(uAccent, uRimTint, 0.55) * (fresnel * 1.05 * (0.38 + ndl * 0.62));
        vec3 finalCol = baseCol * (0.24 + ndl * 0.96) + cityLights + rim;
        gl_FragColor = vec4(finalCol, 1.0);
      }
    `,
    fog: false,
  });

  const orbitalPlanetMesh = new THREE.Mesh(
    new THREE.SphereGeometry(16.5, 40, 28),
    planetMat
  );
  orbitalPlanetMesh.position.set(-24, 11.5, -45);
  orbitalVistaGroup.add(orbitalPlanetMesh);

  const planetRingMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color(0x38bdf8) },
    },
    vertexShader: `
      varying vec3 vLocalPos;
      void main() {
        vLocalPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uAccent;
      varying vec3 vLocalPos;
      void main() {
        float r = length(vLocalPos.xy);
        float ang = atan(vLocalPos.y, vLocalPos.x);
        float normR = clamp((r - 20.0) / 9.5, 0.0, 1.0);
        float bands = sin(normR * 34.0) * 0.5 + 0.5;
        float fineRinglets = cos(normR * 86.0) * 0.5 + 0.5;
        float cassiniGap = smoothstep(0.41, 0.45, normR) * (1.0 - smoothstep(0.52, 0.56, normR));
        float enckeGap = smoothstep(0.76, 0.78, normR) * (1.0 - smoothstep(0.80, 0.82, normR));
        float edgeFade = smoothstep(0.0, 0.14, normR) * (1.0 - smoothstep(0.85, 1.0, normR));
        float shimmer = 0.88 + 0.12 * sin(ang * 5.0 - uTime * 0.35);
        float alpha = edgeFade * (1.0 - cassiniGap * 0.88) * (1.0 - enckeGap * 0.65) * (0.22 + bands * 0.28 + fineRinglets * 0.12) * shimmer;
        vec3 col = mix(vec3(0.22, 0.35, 0.54), mix(uAccent, vec3(0.98, 0.82, 0.48), 0.22) * 0.86, bands * 0.72);
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  });

  const planetRingMesh = new THREE.Mesh(
    new THREE.RingGeometry(20.0, 29.5, 72),
    planetRingMat
  );
  planetRingMesh.position.copy(orbitalPlanetMesh.position);
  planetRingMesh.rotation.set(Math.PI * 0.38, 0.2, -0.24);
  orbitalVistaGroup.add(planetRingMesh);

  // v3.8.0 Monumental Counter-Rotating Chrono Astrolabe Horizon Rings framing Nadir-9's sky
  const astrolabeBrassMat = new THREE.MeshStandardMaterial({
    color: 0xd4a948,
    emissive: 0x784f12,
    emissiveIntensity: 0.42,
    roughness: 0.26,
    metalness: 0.88,
    fog: false,
  });
  const astrolabeCyanMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.48,
    fog: false,
  });
  const celestialAstrolabeOuterRing = new THREE.Mesh(
    new THREE.TorusGeometry(46.5, 0.16, 8, 96),
    astrolabeBrassMat
  );
  celestialAstrolabeOuterRing.position.set(0, 8.5, -2);
  celestialAstrolabeOuterRing.rotation.set(Math.PI * 0.36, 0.18, -0.14);
  const astrolabeTickGeo = new THREE.OctahedronGeometry(0.42, 0);
  for (let t = 0; t < 12; t++) {
    const ta = (t / 12) * Math.PI * 2;
    const node = new THREE.Mesh(
      astrolabeTickGeo,
      t % 3 === 0 ? astrolabeCyanMat : astrolabeBrassMat
    );
    node.position.set(Math.cos(ta) * 46.5, Math.sin(ta) * 46.5, 0);
    celestialAstrolabeOuterRing.add(node);
  }
  orbitalVistaGroup.add(celestialAstrolabeOuterRing);

  const celestialAstrolabeInnerRing = new THREE.Mesh(
    new THREE.TorusGeometry(43.2, 0.11, 8, 88),
    astrolabeCyanMat
  );
  celestialAstrolabeInnerRing.position.set(0, 8.5, -2);
  celestialAstrolabeInnerRing.rotation.set(-Math.PI * 0.31, -0.22, 0.2);
  orbitalVistaGroup.add(celestialAstrolabeInnerRing);

  // ORBITAL DRYDOCK — Monumental Skeletal Gantry Rings, Maintenance Arms & Navigation Beacons (Sheet 6, Panel 6)
  const orbitalDrydockGroup = new THREE.Group();
  orbitalDrydockGroup.name = 'NadirOrbitalDrydockGroup';
  const drydockHullMat = new THREE.MeshStandardMaterial({
    color: 0x243144,
    roughness: 0.42,
    metalness: 0.78,
    fog: false,
  });
  const drydockAmberMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    fog: false,
  });
  const drydockNavMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    fog: false,
  });
  const drydockMainArcGeo = new THREE.TorusGeometry(6.8, 0.48, 8, 32, Math.PI * 1.48);
  const drydockCrossRingGeo = new THREE.TorusGeometry(6.2, 0.34, 8, 32, Math.PI * 1.35);
  const drydockArmGeo = new THREE.BoxGeometry(2.6, 0.32, 0.34);
  const drydockNavGeo = new THREE.BoxGeometry(0.52, 0.52, 0.52);
  for (let d = 0; d < 4; d++) {
    const orbitAngle = (d / 4) * Math.PI * 2 + 0.42;
    const dRadius = 52;
    const dPivot = new THREE.Group();
    dPivot.position.set(
      Math.sin(orbitAngle) * dRadius,
      7.4 + (d % 2) * 3.2,
      Math.cos(orbitAngle) * dRadius
    );
    dPivot.rotation.y = orbitAngle;
    // Twin parallel semicircular dark-titanium gantry arcs
    for (const zOff of [-0.75, 0.75]) {
      const arc = new THREE.Mesh(drydockMainArcGeo, drydockHullMat);
      arc.rotation.z = -Math.PI * 0.24;
      arc.position.z = zOff;
      dPivot.add(arc);
    }
    // Perpendicular equatorial docking ring cradle
    const eqRing = new THREE.Mesh(drydockCrossRingGeo, drydockHullMat);
    eqRing.rotation.x = Math.PI * 0.5;
    eqRing.rotation.z = -0.35;
    dPivot.add(eqRing);
    // Articulated inward docking maintenance arms + amber joints
    for (const armSide of [-1, 1]) {
      const arm = new THREE.Mesh(drydockArmGeo, drydockHullMat);
      arm.position.set(armSide * 4.4, 2.2, 0);
      arm.rotation.z = -armSide * 0.42;
      dPivot.add(arm);
      const amberNode = new THREE.Mesh(drydockNavGeo, drydockAmberMat);
      amberNode.position.set(armSide * 6.5, 1.4, 0);
      dPivot.add(amberNode);
    }
    // Apex amber beacons & ice-cyan docking light strips
    const topAmberA = new THREE.Mesh(drydockNavGeo, drydockAmberMat);
    topAmberA.position.set(-2.4, 6.7, 0);
    const topAmberB = new THREE.Mesh(drydockNavGeo, drydockAmberMat);
    topAmberB.position.set(2.4, 6.7, 0);
    const cyanStrip = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.28, 0.42), drydockNavMat);
    cyanStrip.position.set(0, -0.3, 6.1);
    dPivot.add(topAmberA, topAmberB, cyanStrip);
    orbitalDrydockGroup.add(dPivot);
  }
  orbitalVistaGroup.add(orbitalDrydockGroup);

  // DECK TURBINE — Heavy Circular Sub-Deck Industrial Cooling Turbine Modules with Louver Blades & Cyan Rotor Hub (Sheet 6, Panel 7)
  const turbineHousingMat = new THREE.MeshStandardMaterial({
    color: 0x2a313c,
    roughness: 0.42,
    metalness: 0.82,
  });
  const turbineBladeMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.32,
    metalness: 0.86,
  });
  const turbineCyanHubMat = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.55,
    roughness: 0.16,
    metalness: 0.35,
  });
  const buildDeckTurbineAssembly = (outerRadius: number): { housing: THREE.Group; rotor: THREE.Group } => {
    const housing = new THREE.Group();
    // Heavy riveted outer steel shroud torus + inner bezel
    const outerShroud = new THREE.Mesh(
      new THREE.TorusGeometry(outerRadius, outerRadius * 0.13, 12, 28),
      turbineHousingMat
    );
    outerShroud.rotation.x = Math.PI / 2;
    housing.add(outerShroud);
    // 4 subtle amber caution strips around the steel shroud rim
    for (let c = 0; c < 4; c++) {
      const ca = (c / 4) * Math.PI * 2;
      const tick = new THREE.Mesh(
        new THREE.BoxGeometry(outerRadius * 0.26, 0.05, outerRadius * 0.08),
        hazardAmberMat
      );
      tick.position.set(Math.sin(ca) * outerRadius, outerRadius * 0.11, Math.cos(ca) * outerRadius);
      tick.rotation.y = ca;
      housing.add(tick);
    }
    const rotor = new THREE.Group();
    const bladeGeo = new THREE.BoxGeometry(outerRadius * 0.15, 0.04, outerRadius * 0.72);
    for (let b = 0; b < 12; b++) {
      const ba = (b / 12) * Math.PI * 2;
      const bladePivot = new THREE.Group();
      bladePivot.rotation.y = ba;
      const blade = new THREE.Mesh(bladeGeo, turbineBladeMat);
      blade.position.set(0, 0, outerRadius * 0.52);
      blade.rotation.z = 0.36;
      bladePivot.add(blade);
      rotor.add(bladePivot);
    }
    // Glowing cyan central rotor hub & illuminated inner ring
    const hubRing = new THREE.Mesh(
      new THREE.TorusGeometry(outerRadius * 0.26, outerRadius * 0.045, 10, 24),
      turbineCyanHubMat
    );
    hubRing.rotation.x = Math.PI / 2;
    hubRing.position.y = 0.03;
    rotor.add(hubRing);
    const hubCap = new THREE.Mesh(
      new THREE.CylinderGeometry(outerRadius * 0.2, outerRadius * 0.24, 0.09, 16),
      turbineHousingMat
    );
    rotor.add(hubCap);
    const coreDot = new THREE.Mesh(
      new THREE.TorusGeometry(outerRadius * 0.13, outerRadius * 0.025, 8, 18),
      turbineCyanHubMat
    );
    coreDot.rotation.x = Math.PI / 2;
    coreDot.position.y = 0.05;
    rotor.add(coreDot);
    housing.add(rotor);
    return { housing, rotor };
  };

  // 4 Outer Station Superstructure Trusses & Diagonal Sub-Deck Trench Turbine Wells
  const superTrussGeo = new THREE.BoxGeometry(1.8, 16.5, 2.2);
  for (let i = 0; i < 4; i++) {
    const diagAngle = Math.PI * 0.25 + (i * Math.PI) / 2;
    const tx = Math.sin(diagAngle) * 41.5;
    const tz = Math.cos(diagAngle) * 41.5;
    const trussPivot = new THREE.Group();
    trussPivot.position.set(tx, -3.2, tz);
    trussPivot.rotation.y = diagAngle;
    const mast = new THREE.Mesh(superTrussGeo, deepGraphiteMat);
    mast.rotation.x = 0.22;
    trussPivot.add(mast);
    const navStrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 8.5, 0.22),
      tealSubtleMat
    );
    navStrip.position.set(0, 1.5, -1.12);
    navStrip.rotation.x = 0.22;
    trussPivot.add(navStrip);
    orbitalVistaGroup.add(trussPivot);

    // Sub-Deck Maintenance Trench DECK TURBINE Well (r = 26.5m, y = -1.72m)
    const wx = Math.sin(diagAngle) * 26.5;
    const wz = Math.cos(diagAngle) * 26.5;
    const trenchTurbine = buildDeckTurbineAssembly(2.55);
    trenchTurbine.housing.position.set(wx, -1.72, wz);
    orbitalVistaGroup.add(trenchTurbine.housing);
    subDeckFans.push(trenchTurbine.rotor);
  }

  // 2 Recessed Sub-Deck Reactor Grate Inspection Windows with DECK TURBINE Rotors on the North Deck Floor ((±4.4, 0, -12.6))
  const grateFrameGeo = new THREE.BoxGeometry(2.35, 0.04, 0.14);
  const grateBarGeo = new THREE.BoxGeometry(2.08, 0.024, 0.055);
  const gratePaneMat = new THREE.MeshBasicMaterial({
    color: 0x040912,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  for (const gx of [-4.4, 4.4]) {
    const grateGroup = new THREE.Group();
    grateGroup.position.set(gx, 0, -12.6);

    const pitFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(2.15, 2.15),
      darkRubberMat
    );
    pitFloor.rotation.x = -Math.PI / 2;
    pitFloor.position.y = -0.68;
    grateGroup.add(pitFloor);

    const floorTurbine = buildDeckTurbineAssembly(0.95);
    floorTurbine.housing.position.y = -0.22;
    grateGroup.add(floorTurbine.housing);
    subDeckFans.push(floorTurbine.rotor);

    const pane = new THREE.Mesh(new THREE.PlaneGeometry(2.08, 2.08), gratePaneMat);
    pane.rotation.x = -Math.PI / 2;
    pane.position.y = 0.011;
    grateGroup.add(pane);

    for (const s of [-1.1, 1.1]) {
      const fBarH = new THREE.Mesh(grateFrameGeo, conduitEdgeMat);
      fBarH.position.set(0, 0.02, s);
      const fBarV = new THREE.Mesh(grateFrameGeo, conduitEdgeMat);
      fBarV.rotation.y = Math.PI / 2;
      fBarV.position.set(s, 0.02, 0);
      grateGroup.add(fBarH, fBarV);
    }
    for (const gOff of [-0.66, -0.22, 0.22, 0.66]) {
      const bar = new THREE.Mesh(grateBarGeo, steelBlueMat);
      bar.position.set(0, 0.014, gOff);
      grateGroup.add(bar);
    }
    orbitalVistaGroup.add(grateGroup);
  }

  // 4 Industrial Perimeter ORBITAL ARCH Structural Gateways + Overhead GANTRY CRANES (Sheet 5 Panel 8 & Sheet 9 Panel 5)
  const gantryRailGeo = new THREE.BoxGeometry(0.14, 0.14, 4.2);
  const gantryStrutGeo = new THREE.BoxGeometry(0.09, 0.72, 0.09);
  const gantryDiagGeo = new THREE.BoxGeometry(0.08, 0.92, 0.08);
  const gantryMastGeo = new RoundedBoxGeometry(0.54, 2.2, 0.64, 1, 0.05);
  const gantryHazardGeo = new THREE.BoxGeometry(0.62, 0.14, 0.42);
  const gantryCableGeo = new THREE.CylinderGeometry(0.032, 0.032, 1.45, 8);
  const gantryPulleyGeo = new RoundedBoxGeometry(0.42, 0.52, 0.28, 2, 0.04);
  const gantryClawJawGeo = new RoundedBoxGeometry(0.12, 0.42, 0.14, 1, 0.02);
  const archFootGeo = new RoundedBoxGeometry(1.05, 0.42, 0.95, 2, 0.06);
  const archRailGeo = new THREE.BoxGeometry(0.16, 4.6, 0.22);
  const archCrossGeo = new THREE.BoxGeometry(0.72, 0.12, 0.18);
  const archTopBeamGeo = new RoundedBoxGeometry(4.4, 0.72, 0.78, 2, 0.08);
  const archDiagShoulderGeo = new RoundedBoxGeometry(1.9, 0.62, 0.72, 2, 0.06);
  const archCyanInnerVGeo = new THREE.BoxGeometry(0.11, 3.85, 0.14);
  const archCyanInnerDiagGeo = new THREE.BoxGeometry(1.35, 0.11, 0.14);
  const archBeaconGeo = new RoundedBoxGeometry(0.32, 0.24, 0.32, 2, 0.04);
  for (let i = 0; i < 4; i++) {
    const archAngle = (i * Math.PI) / 2;
    // Heavy Dark-Slate Steel ORBITAL ARCH standing at the perimeter bay
    const orbitalArch = new THREE.Group();
    orbitalArch.position.set(
      Math.sin(archAngle) * (arenaRadius - 0.15),
      0,
      Math.cos(archAngle) * (arenaRadius - 0.15)
    );
    orbitalArch.rotation.y = archAngle;
    for (const side of [-1, 1]) {
      const lx = side * 2.55;
      // Heavy bolted footplate
      const foot = new THREE.Mesh(archFootGeo, deepGraphiteMat);
      foot.position.set(lx, 0.21, 0);
      orbitalArch.add(foot);
      // Twin vertical open truss leg rails
      for (const railOff of [-0.28, 0.28]) {
        const rail = new THREE.Mesh(archRailGeo, steelBlueMat);
        rail.position.set(lx + railOff, 2.55, 0);
        orbitalArch.add(rail);
      }
      // Horizontal & diagonal truss cross-braces inside each leg
      for (let b = 0; b < 5; b++) {
        const cross = new THREE.Mesh(archCrossGeo, deepGraphiteMat);
        cross.position.set(lx, 0.75 + b * 0.88, 0);
        orbitalArch.add(cross);
        const diag = new THREE.Mesh(archCrossGeo, deepGraphiteMat);
        diag.position.set(lx, 1.18 + b * 0.88, 0);
        diag.rotation.z = (b % 2 === 0 ? 1 : -1) * 0.58;
        orbitalArch.add(diag);
      }
      // Angled 45-degree chamfered steel shoulder truss
      const shoulder = new THREE.Mesh(archDiagShoulderGeo, steelBlueMat);
      shoulder.position.set(side * 1.98, 5.18, 0);
      shoulder.rotation.z = side * 0.78;
      orbitalArch.add(shoulder);
      // Glowing Ice-Cyan Inner Frame Conduit Strips (vertical + chamfer)
      const innerCyanV = new THREE.Mesh(archCyanInnerVGeo, cyanEmissiveMat);
      innerCyanV.position.set(side * 2.18, 2.35, -0.18);
      orbitalArch.add(innerCyanV);
      const innerCyanDiag = new THREE.Mesh(archCyanInnerDiagGeo, cyanEmissiveMat);
      innerCyanDiag.position.set(side * 1.72, 4.78, -0.18);
      innerCyanDiag.rotation.z = side * 0.78;
      orbitalArch.add(innerCyanDiag);
      // Twin Glowing Amber Apex Warning Beacons
      const apexBeacon = new THREE.Mesh(archBeaconGeo, hazardAmberMat);
      apexBeacon.position.set(side * 1.48, 6.18, 0);
      orbitalArch.add(apexBeacon);
    }
    // Chamfered Top Crossbar Beam + Center Nameplate Housing
    const topBeam = new THREE.Mesh(archTopBeamGeo, deepGraphiteMat);
    topBeam.position.set(0, 5.72, 0);
    orbitalArch.add(topBeam);
    const topCyanStrip = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.1, 0.14),
      cyanEmissiveMat
    );
    topCyanStrip.position.set(0, 5.34, -0.2);
    orbitalArch.add(topCyanStrip);
    orbitalVistaGroup.add(orbitalArch);

    // GANTRY CRANE — Open Diagonal Steel-Truss Boom, Hazard Strips, Amber Apex Beacon & Suspended Hoist Claw (Sheet 9, Panel 5)
    const gantryPivot = new THREE.Group();
    gantryPivot.position.set(
      Math.sin(archAngle) * (arenaRadius - 0.6),
      9.65,
      Math.cos(archAngle) * (arenaRadius - 0.6)
    );
    gantryPivot.rotation.y = archAngle;
    // Angled rear truss support mast anchoring into the orbital arch
    const craneMast = new THREE.Mesh(gantryMastGeo, deepGraphiteMat);
    craneMast.position.set(0, -1.05, 0.85);
    craneMast.rotation.x = 0.26;
    gantryPivot.add(craneMast);
    // 4-rail open skeletal box-truss cantilever boom
    for (const rx of [-0.36, 0.36]) {
      for (const ry of [-0.32, 0.32]) {
        const rail = new THREE.Mesh(gantryRailGeo, steelBlueMat);
        rail.position.set(rx, ry, -0.55);
        gantryPivot.add(rail);
      }
      for (let b = 0; b < 5; b++) {
        const bz = 1.15 - b * 0.86;
        const vert = new THREE.Mesh(gantryStrutGeo, deepGraphiteMat);
        vert.position.set(rx, 0, bz);
        gantryPivot.add(vert);
        const diag = new THREE.Mesh(gantryDiagGeo, deepGraphiteMat);
        diag.position.set(rx, 0, bz - 0.42);
        diag.rotation.x = (b % 2 === 0 ? 1 : -1) * 0.72;
        gantryPivot.add(diag);
      }
    }
    // Yellow-amber industrial hazard plates along lower boom + glowing amber apex warning beacon
    for (const hz of [0.85, -1.65]) {
      const haz = new THREE.Mesh(gantryHazardGeo, hazardAmberMat);
      haz.position.set(0, -0.34, hz);
      gantryPivot.add(haz);
    }
    const apexLight = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.28, 10), hazardAmberMat);
    apexLight.position.set(0, 0.54, -2.15);
    gantryPivot.add(apexLight);
    // Steel hoist cable, pulley block & twin dark-steel magnetic grapple jaws
    const cable = new THREE.Mesh(gantryCableGeo, paleAlloyTrimMat);
    cable.position.set(0, -1.05, -2.05);
    gantryPivot.add(cable);
    const pulley = new THREE.Mesh(gantryPulleyGeo, deepGraphiteMat);
    pulley.position.set(0, -1.85, -2.05);
    gantryPivot.add(pulley);
    const pulleyStripe = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.09, 0.31), hazardAmberMat);
    pulleyStripe.position.set(0, -1.82, -2.05);
    gantryPivot.add(pulleyStripe);
    for (const jawSide of [-1, 1]) {
      const upperJaw = new THREE.Mesh(gantryClawJawGeo, steelBlueMat);
      upperJaw.position.set(jawSide * 0.24, -2.22, -2.05);
      upperJaw.rotation.z = jawSide * 0.42;
      gantryPivot.add(upperJaw);
      const lowerJaw = new THREE.Mesh(gantryClawJawGeo, deepGraphiteMat);
      lowerJaw.position.set(jawSide * 0.22, -2.52, -2.05);
      lowerJaw.rotation.z = -jawSide * 0.36;
      gantryPivot.add(lowerJaw);
    }
    orbitalVistaGroup.add(gantryPivot);
  }

  // ESCAPE SHUTTLE — Angular Ceramic-White & Gunmetal Orbital Extraction Shuttles with Twin Cyan Ion Thrusters (Sheet 10, Panel 2)
  const shuttleCeramicMat = new THREE.MeshStandardMaterial({
    color: 0xe8eef5,
    roughness: 0.26,
    metalness: 0.28,
  });
  const shuttleCanopyMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: 0x0284c7,
    emissiveIntensity: 0.45,
    roughness: 0.12,
    metalness: 0.85,
  });
  const shuttleSpecs: Array<{ x: number; y: number; z: number; rotY: number; rotZ: number; scale: number }> = [
    { x: 16.5, y: 4.8, z: -28.5, rotY: -0.58, rotZ: 0.06, scale: 1.35 },
    { x: -22.0, y: 8.2, z: -26.0, rotY: 0.72, rotZ: -0.09, scale: 1.15 },
  ];
  for (const sh of shuttleSpecs) {
    const shuttle = new THREE.Group();
    shuttle.position.set(sh.x, sh.y, sh.z);
    shuttle.rotation.set(0.04, sh.rotY, sh.rotZ);
    shuttle.scale.setScalar(sh.scale);
    // Main gunmetal chassis under-hull + ceramic armored dorsal body
    const underHull = new THREE.Mesh(new RoundedBoxGeometry(2.0, 0.56, 4.1, 2, 0.09), deepGraphiteMat);
    shuttle.add(underHull);
    const upperBody = new THREE.Mesh(new RoundedBoxGeometry(1.56, 0.62, 3.45, 2, 0.1), shuttleCeramicMat);
    upperBody.position.set(0, 0.34, -0.1);
    shuttle.add(upperBody);
    // Tapered forward nose cone + dark faceted cockpit canopy
    const nose = new THREE.Mesh(new RoundedBoxGeometry(1.08, 0.48, 1.45, 2, 0.08), shuttleCeramicMat);
    nose.position.set(0, 0.12, 2.28);
    nose.rotation.x = 0.14;
    shuttle.add(nose);
    const canopy = new THREE.Mesh(new RoundedBoxGeometry(0.86, 0.36, 1.25, 1, 0.05), shuttleCanopyMat);
    canopy.position.set(0, 0.54, 1.35);
    canopy.rotation.x = 0.28;
    shuttle.add(canopy);
    // Swept delta wing sponsons + glowing cyan lateral thruster intakes + twin rear engine nacelles
    for (const wSide of [-1, 1]) {
      const wing = new THREE.Mesh(new RoundedBoxGeometry(1.55, 0.28, 1.95, 2, 0.06), shuttleCeramicMat);
      wing.position.set(wSide * 1.38, -0.02, -0.45);
      wing.rotation.y = wSide * -0.32;
      shuttle.add(wing);
      const wingIntake = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.42), cyanEmissiveMat);
      wingIntake.position.set(wSide * 1.48, -0.02, 0.38);
      shuttle.add(wingIntake);
      const nacelle = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.58, 1.55, 2, 0.08), deepGraphiteMat);
      nacelle.position.set(wSide * 0.92, 0.28, -1.55);
      shuttle.add(nacelle);
      const nacelleCowl = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.24, 1.15, 1, 0.04), shuttleCeramicMat);
      nacelleCowl.position.set(wSide * 0.92, 0.52, -1.48);
      shuttle.add(nacelleCowl);
      const thrusterGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.12, 0.42, 12), cyanEmissiveMat);
      thrusterGlow.rotation.x = Math.PI / 2;
      thrusterGlow.position.set(wSide * 0.92, 0.26, -2.42);
      shuttle.add(thrusterGlow);
    }
    shuttle.userData.baseY = sh.y;
    shuttle.userData.baseRotX = 0.04;
    shuttle.userData.baseRotY = sh.rotY;
    shuttle.userData.baseRotZ = sh.rotZ;
    orbitalVistaGroup.add(shuttle);
    orbitalShuttles.push(shuttle);
  }

  // ORBITAL DEBRIS — Sheared Space-Station Hull Trusses with Hazard-Striped Bulkheads & Amber Cables (Sheet 10, Panel 4)
  const debrisSpecs: Array<{ x: number; y: number; z: number; rx: number; ry: number; rz: number; s: number }> = [
    { x: -16.8, y: 3.4, z: -27.2, rx: 0.24, ry: 0.52, rz: -0.35, s: 1.15 },
    { x: 25.5, y: 6.4, z: -14.8, rx: -0.18, ry: -0.68, rz: 0.28, s: 1.05 },
    { x: -26.4, y: 5.2, z: 9.6, rx: 0.32, ry: 1.12, rz: -0.22, s: 1.1 },
    { x: 24.8, y: 4.1, z: 14.5, rx: -0.26, ry: -1.35, rz: 0.42, s: 1.0 },
  ];
  for (const db of debrisSpecs) {
    const wreckage = new THREE.Group();
    wreckage.position.set(db.x, db.y, db.z);
    wreckage.rotation.set(db.rx, db.ry, db.rz);
    wreckage.scale.setScalar(db.s);
    // Open steel lattice hull truss
    for (const tz of [-0.55, 0.55]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.14, 0.14), deepGraphiteMat);
      rail.position.set(0, 0.72, tz);
      wreckage.add(rail);
    }
    for (let k = -1; k <= 1; k++) {
      const crossStrut = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 1.15), steelBlueMat);
      crossStrut.position.set(k * 1.1, 0.72, 0);
      wreckage.add(crossStrut);
    }
    // Torn ceramic-slate bulkhead plating + bold amber-yellow hazard band
    const plateMain = new THREE.Mesh(new RoundedBoxGeometry(2.65, 1.45, 0.18, 1, 0.03), paleAlloyTrimMat);
    plateMain.position.set(0.25, -0.05, 0.52);
    plateMain.rotation.x = 0.22;
    wreckage.add(plateMain);
    const hazStrip = new THREE.Mesh(new THREE.BoxGeometry(2.68, 0.24, 0.21), hazardAmberMat);
    hazStrip.position.set(0.25, 0.46, 0.42);
    hazStrip.rotation.x = 0.22;
    wreckage.add(hazStrip);
    // Curled trailing amber power conduit cables
    for (let c = 0; c < 3; c++) {
      const cableArc = new THREE.Mesh(new THREE.TorusGeometry(0.42 + c * 0.12, 0.035, 6, 12, Math.PI * 0.9), hazardAmberMat);
      cableArc.position.set(-0.7 + c * 0.75, -0.68, 0.35 - c * 0.15);
      cableArc.rotation.set(0.4, c * 0.5, Math.PI);
      wreckage.add(cableArc);
    }
    wreckage.userData.baseY = db.y;
    orbitalVistaGroup.add(wreckage);
    orbitalDebris.push(wreckage);
  }

  scene.add(orbitalVistaGroup);

  // 5. Central Chronicle Loom Pylon & 4 Retractable Conduit Cover Pillars
  let loomPylonGroup: THREE.Group | null = null;
  let loomRingMesh: THREE.Mesh | null = null;
  let loomInnerRingMesh: THREE.Mesh | null = null;
  let loomOuterRingMesh: THREE.Mesh | null = null;

  const loomFinGeo = createExtrudedFinGeometry(0.3, 4.9, 1.02, 0.44);
  const pillarRibGeo = new RoundedBoxGeometry(0.3, 3.65, 0.44, 1, 0.08);
  const pillarClampGeo = new RoundedBoxGeometry(0.36, 0.2, 0.5, 1, 0.04);

  for (const obs of obstacles) {
    if (
      obs.id === teachBarrierId ||
      obs.id === combineBarrierId ||
      obs.kind === 'cover_wall' ||
      obs.kind === 'destructible_crate'
    ) {
      continue;
    }

    // Flush deck retraction socket housing so unlocked pillars recess cleanly into the floor
    if (obs.id !== 'loom-pylon') {
      const socketRing = new THREE.Mesh(
        new THREE.RingGeometry(obs.radius * 0.92, obs.radius * 1.24, 24),
        conduitEdgeMat
      );
      socketRing.rotation.x = -Math.PI / 2;
      socketRing.position.set(obs.x, 0.017, obs.z);
      socketRing.updateMatrix();
      socketRing.matrixAutoUpdate = false;
      scene.add(socketRing);

      const socketRecess = new THREE.Mesh(
        new THREE.CircleGeometry(obs.radius * 0.92, 24),
        darkRubberMat
      );
      socketRecess.rotation.x = -Math.PI / 2;
      socketRecess.position.set(obs.x, 0.012, obs.z);
      socketRecess.updateMatrix();
      socketRecess.matrixAutoUpdate = false;
      scene.add(socketRecess);
    }

    const group = new THREE.Group();
    group.position.set(obs.x, 0, obs.z);
    group.userData.obstacleId = obs.id;

    // Ground Contact Shadow Disc
    const cShadow = new THREE.Mesh(
      new THREE.CircleGeometry(obs.radius * 1.48, 32),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
      })
    );
    cShadow.rotation.x = -Math.PI / 2;
    cShadow.position.y = 0.015;
    group.add(cShadow);

    if (obs.id === 'loom-pylon') {
      // =========================================================================
      // CHRONICLE LOOM — Monumental Quantum Core Shrine (Sheet 3, Panel 6 Match)
      // Stepped obsidian octagonal pedestal with glowing cyan rim trace, 3 nested
      // upright concentric antique-gold & cyan holographic memory rings, and a
      // central floating 6-point glowing starlight crystal.
      // =========================================================================
      loomPylonGroup = group;

      const loomObsidianMat = new THREE.MeshStandardMaterial({
        color: 0x111722,
        roughness: 0.42,
        metalness: 0.72,
      });
      const loomChromeBevelMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.28,
        metalness: 0.85,
      });
      const loomAntiqueGoldMat = new THREE.MeshStandardMaterial({
        color: 0xd4a948,
        emissive: 0x784f12,
        emissiveIntensity: 0.35,
        roughness: 0.24,
        metalness: 0.9,
      });
      const loomCyanHaloMat = new THREE.MeshStandardMaterial({
        color: 0x67e8f9,
        emissive: 0x06b6d4,
        emissiveIntensity: 2.1,
        roughness: 0.12,
        metalness: 0.25,
      });
      const loomStarlightMat = new THREE.MeshStandardMaterial({
        color: 0xf0f9ff,
        emissive: 0x38bdf8,
        emissiveIntensity: 2.8,
        roughness: 0.08,
        metalness: 0.15,
      });

      // Stepped Octagonal Obsidian Pedestal Base
      const baseTier1 = new THREE.Mesh(
        applyVerticalVertexAO(
          new THREE.CylinderGeometry(obs.radius * 1.05, obs.radius * 1.24, 0.42, 8),
          0.42,
          1.0
        ),
        loomObsidianMat
      );
      baseTier1.position.y = 0.21;
      baseTier1.rotation.y = Math.PI / 8;
      baseTier1.castShadow = enableShadows;
      baseTier1.receiveShadow = enableShadows;
      group.add(baseTier1);

      const baseTier2 = new THREE.Mesh(
        new THREE.CylinderGeometry(obs.radius * 0.84, obs.radius * 1.0, 0.34, 8),
        loomChromeBevelMat
      );
      baseTier2.position.y = 0.58;
      baseTier2.rotation.y = Math.PI / 8;
      baseTier2.castShadow = enableShadows;
      group.add(baseTier2);

      // Glowing Cyan Octagonal Pedestal Top Trace
      const pedestalGlowRim = new THREE.Mesh(
        new THREE.TorusGeometry(obs.radius * 0.86, 0.042, 8, 8),
        loomCyanHaloMat
      );
      pedestalGlowRim.rotation.x = Math.PI / 2;
      pedestalGlowRim.rotation.z = Math.PI / 8;
      pedestalGlowRim.position.y = 0.76;
      group.add(pedestalGlowRim);

      // Antique-Gold Ring Cradle Socket
      const cradleMount = new THREE.Mesh(
        new THREE.CylinderGeometry(obs.radius * 0.42, obs.radius * 0.58, 0.38, 12),
        loomAntiqueGoldMat
      );
      cradleMount.position.y = 0.92;
      group.add(cradleMount);

      const ringCenterY = 2.85;

      // 3 Nested Upright Concentric Antique-Gold & Cyan Holographic Memory Rings
      loomOuterRingMesh = new THREE.Mesh(
        new THREE.TorusGeometry(obs.radius * 1.28, 0.11, 14, 48),
        loomAntiqueGoldMat
      );
      loomOuterRingMesh.position.y = ringCenterY;
      loomOuterRingMesh.castShadow = enableShadows;
      const outerCyanInlay = new THREE.Mesh(
        new THREE.TorusGeometry(obs.radius * 1.18, 0.045, 10, 44),
        loomCyanHaloMat
      );
      loomOuterRingMesh.add(outerCyanInlay);
      group.add(loomOuterRingMesh);

      loomRingMesh = new THREE.Mesh(
        new THREE.TorusGeometry(obs.radius * 0.96, 0.082, 12, 44),
        loomCyanHaloMat
      );
      loomRingMesh.position.y = ringCenterY;
      loomRingMesh.rotation.y = Math.PI * 0.14;
      const midGoldBand = new THREE.Mesh(
        new THREE.TorusGeometry(obs.radius * 0.88, 0.042, 10, 36),
        loomAntiqueGoldMat
      );
      loomRingMesh.add(midGoldBand);
      group.add(loomRingMesh);

      loomInnerRingMesh = new THREE.Mesh(
        new THREE.TorusGeometry(obs.radius * 0.64, 0.056, 12, 36),
        loomAntiqueGoldMat
      );
      loomInnerRingMesh.position.y = ringCenterY;
      loomInnerRingMesh.rotation.y = -Math.PI * 0.18;
      const innerCyanTrim = new THREE.Mesh(
        new THREE.TorusGeometry(obs.radius * 0.57, 0.03, 8, 32),
        loomCyanHaloMat
      );
      loomInnerRingMesh.add(innerCyanTrim);
      group.add(loomInnerRingMesh);

      // Central Floating 6-Point Starlight Crystal (Interlocking Dual Octahedron Star)
      const starCoreA = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.46, 0),
        loomStarlightMat
      );
      starCoreA.position.y = ringCenterY;
      starCoreA.scale.set(0.72, 1.18, 0.72);
      group.add(starCoreA);

      const starCoreB = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.46, 0),
        loomStarlightMat
      );
      starCoreB.position.y = ringCenterY;
      starCoreB.rotation.z = Math.PI / 3;
      starCoreB.scale.set(0.72, 1.18, 0.72);
      group.add(starCoreB);

      const starCoreC = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.46, 0),
        loomStarlightMat
      );
      starCoreC.position.y = ringCenterY;
      starCoreC.rotation.z = -Math.PI / 3;
      starCoreC.scale.set(0.72, 1.18, 0.72);
      group.add(starCoreC);
    } else {
      // NADIR-9 Brutalist Octagonal Monolith Pillar with Recessed Vertical Cyan Conduits
      const monolithSteelAoMat = new THREE.MeshStandardMaterial({
        color: 0x3b444f,
        bumpMap: armorBump,
        bumpScale: 0.015,
        roughness: 0.44,
        metalness: 0.68,
        vertexColors: true,
      });
      const monolithBevelMat = new THREE.MeshStandardMaterial({
        color: 0x4b5663,
        bumpMap: armorBump,
        bumpScale: 0.01,
        roughness: 0.36,
        metalness: 0.74,
      });
      const monolithRecessMat = new THREE.MeshStandardMaterial({
        color: 0x1b212a,
        roughness: 0.6,
        metalness: 0.52,
      });
      const hazardStencilMat = new THREE.MeshStandardMaterial({
        map: createHazardStripeTexture(),
        roughness: 0.42,
        metalness: 0.35,
      });

      const octR = obs.radius * 0.96;
      const bodyH = Math.max(2.6, obs.height - 0.78);

      // Chamfered bottom octagonal plinth
      const baseFoot = new THREE.Mesh(
        applyVerticalVertexAO(
          new THREE.CylinderGeometry(octR * 0.98, octR * 0.84, 0.34, 8),
          0.38,
          0.95
        ),
        monolithRecessMat
      );
      baseFoot.rotation.y = Math.PI / 8;
      baseFoot.position.y = 0.17;
      baseFoot.castShadow = enableShadows;
      baseFoot.receiveShadow = enableShadows;
      group.add(baseFoot);

      // Main chunky octagonal weathered dark-steel monolith body
      const mainShaft = new THREE.Mesh(
        applyVerticalVertexAO(
          new THREE.CylinderGeometry(octR, octR, bodyH, 8),
          0.56,
          1.0
        ),
        monolithSteelAoMat
      );
      mainShaft.rotation.y = Math.PI / 8;
      mainShaft.position.y = 0.34 + bodyH * 0.5;
      mainShaft.castShadow = enableShadows;
      mainShaft.receiveShadow = enableShadows;
      group.add(mainShaft);

      // Chamfered top crown cap (brutalist sloped bevel)
      const topCrown = new THREE.Mesh(
        new THREE.CylinderGeometry(octR * 0.82, octR, 0.38, 8),
        monolithBevelMat
      );
      topCrown.rotation.y = Math.PI / 8;
      topCrown.position.y = 0.34 + bodyH + 0.19;
      topCrown.castShadow = enableShadows;
      group.add(topCrown);

      const topRoofCap = new THREE.Mesh(
        new THREE.CylinderGeometry(octR * 0.68, octR * 0.78, 0.12, 8),
        monolithRecessMat
      );
      topRoofCap.rotation.y = Math.PI / 8;
      topRoofCap.position.y = 0.34 + bodyH + 0.42;
      group.add(topRoofCap);

      // Recessed vertical glowing cyan conduit light strips on 4 alternating octagonal faces
      const faceDist = octR * Math.cos(Math.PI / 8);
      const conduitH = bodyH * 0.66;
      const conduitY = 0.34 + bodyH * 0.5;
      for (let f = 0; f < 4; f++) {
        const fAngle = (f / 4) * Math.PI * 2;
        const faceGroup = new THREE.Group();
        faceGroup.rotation.y = fAngle;

        // Recessed dark metallic conduit housing frame
        const slotFrame = new THREE.Mesh(
          new RoundedBoxGeometry(0.32, conduitH + 0.24, 0.08, 2, 0.02),
          monolithRecessMat
        );
        slotFrame.position.set(0, conduitY, faceDist + 0.01);
        faceGroup.add(slotFrame);

        // Tall luminous cyan vertical energy tube
        const cyanStrip = new THREE.Mesh(
          new RoundedBoxGeometry(0.15, conduitH, 0.09, 2, 0.03),
          cyanEmissiveMat
        );
        cyanStrip.position.set(0, conduitY, faceDist + 0.025);
        faceGroup.add(cyanStrip);

        // Upper & lower horizontal cyan telemetry micro-bars
        for (const barY of [0.58, 0.34 + bodyH - 0.26]) {
          const microBar = new THREE.Mesh(
            new THREE.BoxGeometry(0.38, 0.045, 0.06),
            cyanEmissiveMat
          );
          microBar.position.set(0, barY, faceDist + 0.02);
          faceGroup.add(microBar);
        }
        group.add(faceGroup);
      }

      // Alternate 4 octagonal faces: recessed service armor panels + amber warning stencils
      for (let s = 0; s < 4; s++) {
        const sAngle = (s / 4) * Math.PI * 2 + Math.PI / 4;
        const sideGroup = new THREE.Group();
        sideGroup.rotation.y = sAngle;

        const hatchPanel = new THREE.Mesh(
          new RoundedBoxGeometry(octR * 0.56, bodyH * 0.54, 0.07, 2, 0.015),
          monolithBevelMat
        );
        hatchPanel.position.set(0, conduitY - 0.12, faceDist + 0.008);
        sideGroup.add(hatchPanel);

        const hatchSeam = new THREE.Mesh(
          new THREE.BoxGeometry(octR * 0.46, 0.04, 0.085),
          monolithRecessMat
        );
        hatchSeam.position.set(0, conduitY - 0.12, faceDist + 0.012);
        sideGroup.add(hatchSeam);

        // Small industrial amber hazard warning stencil badge near top & base
        const topStencil = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 0.12, 0.05),
          hazardAmberMat
        );
        topStencil.position.set(0, 0.34 + bodyH - 0.42, faceDist + 0.016);
        sideGroup.add(topStencil);

        const baseHazard = new THREE.Mesh(
          new THREE.BoxGeometry(octR * 0.5, 0.14, 0.055),
          hazardStencilMat
        );
        baseHazard.position.set(0, 0.62, faceDist + 0.016);
        sideGroup.add(baseHazard);

        group.add(sideGroup);
      }

      for (let c = 0; c < group.children.length; c++) {
        const ch = group.children[c];
        ch.updateMatrix();
        ch.matrixAutoUpdate = false;
      }
    }

    scene.add(group);
    obstacleMeshes.push(group);
    obstacleMeshById.set(obs.id, group);
  }

  // Volumetric additive light shaft anchored to the central Loom Pylon
  const loomLightShaftMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.036,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  if (loomPylonGroup) {
    const shaftCone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.95, 3.8, 12.5, 24, 1, true),
      loomLightShaftMat
    );
    shaftCone.position.y = 6.3;
    loomPylonGroup.add(shaftCone);
  }

  return {
    loomPylonGroup: loomPylonGroup || new THREE.Group(),
    loomRingMesh: loomRingMesh || new THREE.Mesh(),
    loomInnerRingMesh: loomInnerRingMesh || new THREE.Mesh(),
    loomOuterRingMesh: loomOuterRingMesh || new THREE.Mesh(),
    ventFanMeshes,
    subDeckFans,
    conduitGlowMat,
    floorTelemetryMat,
    skyDomeMat,
    planetMat,
    planetRingMat,
    orbitalDrydockGroup,
    celestialAstrolabeOuterRing,
    celestialAstrolabeInnerRing,
    orbitalShuttles,
    orbitalDebris,
    watchtowerHeads,
    vaultWheels,
    blastStrobeMat,
    beamConeMat,
    loomLightShaftMat,
    obstacleMeshes,
    obstacleMeshById,
  };
}

export interface ChapterEnvironmentRig {
  group: THREE.Group;
  rotors: THREE.Object3D[];
  pulseMaterials: THREE.MeshBasicMaterial[];
}

export function buildChapterEnvironment(chapter: CampaignChapterId): ChapterEnvironmentRig {
  const group = new THREE.Group();
  const rotors: THREE.Object3D[] = [];
  const pulseMaterials: THREE.MeshBasicMaterial[] = [];

  const palette =
    chapter === 'chapter_2_choir'
      ? { structure: 0x243746, shell: 0x9db7bd, accent: 0xd6a84b, glow: 0x67e8f9 }
      : chapter === 'chapter_3_curator'
        ? { structure: 0x211a3d, shell: 0x7c6ba8, accent: 0xb45bd9, glow: 0xc084fc }
        : chapter === 'chapter_4_matron'
          ? { structure: 0x32101c, shell: 0xf3dfe2, accent: 0xb91c3c, glow: 0xfb7185 }
          : chapter === 'chapter_5_loom'
            ? { structure: 0x1c2837, shell: 0x8b9bad, accent: 0xc59a45, glow: 0x7dd3fc }
            : chapter === 'chapter_1_helix'
              ? { structure: 0x242c36, shell: 0x8a99a8, accent: 0xd97706, glow: 0x38bdf8 }
              : { structure: 0x213142, shell: 0x8fa8b8, accent: 0xd18a2d, glow: 0x22d3ee };

  const structureMat = new THREE.MeshStandardMaterial({
    color: palette.structure,
    roughness: 0.48,
    metalness: 0.7,
  });
  const shellMat = new THREE.MeshStandardMaterial({
    color: palette.shell,
    roughness: chapter === 'chapter_4_matron' ? 0.3 : 0.25,
    metalness: chapter === 'chapter_4_matron' ? 0.3 : 0.76,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: palette.accent,
    roughness: 0.3,
    metalness: 0.82,
  });
  const glowMat = new THREE.MeshStandardMaterial({
    color: palette.glow,
    emissive: palette.glow,
    emissiveIntensity: 1.15,
    roughness: 0.22,
    metalness: 0.38,
  });
  const pulseMat = new THREE.MeshBasicMaterial({
    color: palette.glow,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  pulseMaterials.push(pulseMat);

  const mesh = (
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    x: number,
    y: number,
    z: number
  ): THREE.Mesh => {
    const part = new THREE.Mesh(geometry, material);
    part.position.set(x, y, z);
    parent.add(part);
    return part;
  };
  const box = (
    parent: THREE.Object3D,
    material: THREE.Material,
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    radius = 0.04
  ): THREE.Mesh => mesh(parent, new RoundedBoxGeometry(w, h, d, 1, radius), material, x, y, z);
  const postGeo = new RoundedBoxGeometry(0.34, 4.2, 0.42, 1, 0.05);
  const beamGeo = new RoundedBoxGeometry(3.6, 0.34, 0.46, 1, 0.05);
  const pipeGeo = new THREE.CylinderGeometry(0.1, 0.14, 1, 10);
  const crystalGeo = new THREE.OctahedronGeometry(0.32, 0);

  // TACTICAL HOLO-TABLE Helper — Octagonal Dark-Steel Command Table Projecting a Rotating Cyan Wireframe Orbital Map (Sheet 10, Panel 6)
  const addTacticalHoloTable = (x: number, z: number): void => {
    const tableSteelMat = new THREE.MeshStandardMaterial({
      color: 0x262e3a,
      roughness: 0.38,
      metalness: 0.84,
    });
    const tableBezelMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.32,
      metalness: 0.78,
    });
    const tableCyanHoloMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.84,
      wireframe: true,
    });
    const tableCyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.45,
      roughness: 0.16,
      metalness: 0.25,
    });
    const holoTable = new THREE.Group();
    holoTable.position.set(x, 0, z);
    group.add(holoTable);
    // Stepped octagonal pedestal foot & central support column
    mesh(holoTable, new THREE.CylinderGeometry(0.76, 0.94, 0.22, 8), tableSteelMat, 0, 0.11, 0);
    mesh(holoTable, new THREE.CylinderGeometry(0.56, 0.68, 0.52, 8), tableSteelMat, 0, 0.48, 0);
    // Wide beveled octagonal command console rim + glowing cyan projector disc
    mesh(holoTable, new THREE.CylinderGeometry(1.18, 1.02, 0.22, 8), tableBezelMat, 0, 0.84, 0);
    mesh(holoTable, new THREE.CylinderGeometry(0.92, 0.96, 0.06, 8), tableSteelMat, 0, 0.96, 0);
    mesh(holoTable, new THREE.CylinderGeometry(0.68, 0.68, 0.03, 16), tableCyanGlowMat, 0, 0.985, 0);
    const rimRing = mesh(holoTable, new THREE.TorusGeometry(0.84, 0.024, 8, 8), tableCyanGlowMat, 0, 1.0, 0);
    rimRing.rotation.x = Math.PI / 2;
    // Floating rotating miniature cyan wireframe orbital station ring hologram
    const holoMapRig = new THREE.Group();
    holoMapRig.position.set(0, 1.68, 0);
    holoTable.add(holoMapRig);
    const holoOuterRing = mesh(holoMapRig, new THREE.TorusGeometry(0.66, 0.09, 8, 20), tableCyanHoloMat, 0, 0, 0);
    holoOuterRing.rotation.x = Math.PI * 0.42;
    const holoInnerRing = mesh(holoMapRig, new THREE.TorusGeometry(0.32, 0.045, 6, 16), tableCyanHoloMat, 0, 0.04, 0);
    holoInnerRing.rotation.x = Math.PI * 0.42;
    const holoConeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    pulseMaterials.push(holoConeMat);
    const holoConeBeam = mesh(
      holoTable,
      new THREE.CylinderGeometry(0.66, 0.36, 0.66, 16, 1, true),
      holoConeMat,
      0,
      1.32,
      0
    );
    void holoConeBeam;
    holoMapRig.userData = { animKind: 'floatSpin', baseY: 1.68, amp: 0.085, speed: 0.85, phase: x * 0.25 };
    rotors.push(holoMapRig);
  };

  if (chapter === 'prologue') {
    // CALIBRATION GATE — Sleek Gunmetal & White-Ceramic Archway Gantry with Amber Hydraulic Feet & Cyan Scan Curtain (Sheet 6, Panel 1)
    const gateSteelMat = new THREE.MeshStandardMaterial({
      color: 0x333c48,
      roughness: 0.38,
      metalness: 0.82,
    });
    const gateCeramicMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.24,
      metalness: 0.24,
    });
    const gateAmberMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0xb45309,
      emissiveIntensity: 0.65,
      roughness: 0.28,
      metalness: 0.78,
    });
    const gateCyanEmitterMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.55,
      roughness: 0.14,
      metalness: 0.3,
    });
    const gateScanMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    pulseMaterials.push(gateScanMat);

    for (const gateSpec of GAME_CONFIG.arena.sanctumLandmarks.prologue.calibrationGates) {
      const gantry = new THREE.Group();
      gantry.position.set(gateSpec.x, 0, gateSpec.z);
      gantry.rotation.y = gateSpec.rotY;
      group.add(gantry);
      for (const side of [-1, 1]) {
        // Dark steel outer gantry column + matte white ceramic inner vertical armor plate
        box(gantry, gateSteelMat, side * 1.72, 2.05, 0, 0.38, 4.1, 0.48, 0.05);
        box(gantry, gateCeramicMat, side * 1.62, 1.95, 0.04, 0.28, 3.05, 0.52, 0.04);
        // Heavy hydraulic base foot & warm amber hydraulic damper clamps
        box(gantry, gateSteelMat, side * 1.72, 0.18, 0.04, 0.64, 0.36, 0.72, 0.05);
        box(gantry, gateAmberMat, side * 1.88, 0.42, 0.16, 0.18, 0.78, 0.22, 0.03);
        box(gantry, gateAmberMat, side * 1.72, 0.07, 0.34, 0.54, 0.12, 0.18, 0.02);
        // Chamfered angled upper shoulder strut
        const shoulder = box(gantry, gateSteelMat, side * 1.38, 4.25, 0, 0.92, 0.38, 0.46, 0.05);
        shoulder.rotation.z = side * -0.58;
      }
      // Top crossbeam bridge + centered downward cyan laser emitter pod
      box(gantry, gateSteelMat, 0, 4.52, 0, 2.38, 0.38, 0.48, 0.05);
      mesh(gantry, new THREE.CylinderGeometry(0.24, 0.18, 0.22, 14), gateSteelMat, 0, 4.28, 0);
      mesh(gantry, new THREE.CylinderGeometry(0.16, 0.14, 0.08, 14), gateCyanEmitterMat, 0, 4.16, 0);
      // Glowing top/bottom scan border rails + translucent cyan laser curtain
      const scanner = box(gantry, gateCyanEmitterMat, 0, 2.12, 0.02, 2.86, 0.07, 0.12, 0.015);
      scanner.userData = { animKind: 'scanY', baseY: 2.12, amp: 1.62, speed: 1.45, phase: gateSpec.x * 0.2 };
      rotors.push(scanner);
      box(gantry, gateCyanEmitterMat, 0, 0.38, 0.02, 2.86, 0.06, 0.1, 0.015);
      const scanField = mesh(gantry, new THREE.PlaneGeometry(2.86, 3.46), gateScanMat, 0, 2.12, 0.02);
      scanField.rotation.y = Math.PI;
    }
    const echoHalo = mesh(group, new THREE.TorusGeometry(2.15, 0.035, 8, 36), glowMat, -4.8, 0.05, 1.5);
    echoHalo.rotation.x = Math.PI / 2;
    rotors.push(echoHalo);
    const diagPylonSpec = GAME_CONFIG.arena.sanctumLandmarks.prologue.diagPylon;
    const diagPylon = new THREE.Group();
    diagPylon.position.set(diagPylonSpec.x, 0, diagPylonSpec.z);
    group.add(diagPylon);
    box(diagPylon, gateSteelMat, 0, 1.35, 0, 0.65, 2.7, 0.65, 0.05);
    const diagCrystal = mesh(diagPylon, crystalGeo, gateCyanEmitterMat, 0, 3.05, 0);
    diagCrystal.userData = { animKind: 'floatSpin', baseY: 3.05, amp: 0.14, speed: 1.15, phase: 0.6 };
    rotors.push(diagCrystal);
    const pHoloSpec = GAME_CONFIG.arena.sanctumLandmarks.prologue.tacticalHoloTable;
    addTacticalHoloTable(pHoloSpec.x, pHoloSpec.z);
  } else if (chapter === 'chapter_1_helix') {
    // VAULT BULKHEAD — Massive Reinforced Industrial Blast Containment Gates (Sheet 5, Panel 1)
    const bulkheadSteelMat = new THREE.MeshStandardMaterial({
      color: 0x333942,
      roughness: 0.48,
      metalness: 0.72,
    });
    const bulkheadDarkMat = new THREE.MeshStandardMaterial({
      color: 0x1b1f26,
      roughness: 0.56,
      metalness: 0.65,
    });
    const bronzeClampMat = new THREE.MeshStandardMaterial({
      color: 0x8b6b42,
      roughness: 0.36,
      metalness: 0.84,
    });
    const amberStripMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 1.5,
      roughness: 0.2,
      metalness: 0.3,
    });
    const ribGeo = new RoundedBoxGeometry(0.36, 5.2, 0.42, 2, 0.05);
    for (const bhSpec of GAME_CONFIG.arena.sanctumLandmarks.chapter_1_helix.vaultBulkheads) {
      const door = new THREE.Group();
      door.position.set(bhSpec.x, 0, bhSpec.z);
      group.add(door);
      // Recessed heavy dark blast backing plate
      box(door, bulkheadDarkMat, 0, 3.1, -0.16, 4.6, 5.8, 0.45, 0.06);
      // Heavy chamfered outer steel bulkhead frame (left/right posts + top/bottom lintels)
      for (const fSide of [-1, 1]) {
        box(door, bulkheadSteelMat, fSide * 2.15, 3.1, 0.14, 0.76, 6.2, 0.72, 0.08);
        // Heavy weathered bronze locking hinge clamps (upper & lower)
        for (const hy of [1.45, 4.45]) {
          box(door, bronzeClampMat, fSide * 2.18, hy, 0.48, 0.94, 0.56, 0.36, 0.05);
        }
        // Vertical glowing amber warning strip lights recessed between clamps
        box(door, amberStripMat, fSide * 2.15, 2.95, 0.52, 0.14, 1.55, 0.08, 0.02);
      }
      box(door, bulkheadSteelMat, 0, 5.95, 0.14, 4.85, 0.72, 0.72, 0.08);
      box(door, bulkheadSteelMat, 0, 0.28, 0.14, 5.0, 0.56, 0.78, 0.06);
      // Top glowing amber status warning bar
      box(door, amberStripMat, 0, 5.92, 0.52, 1.85, 0.14, 0.08, 0.02);
      // 6 Interlocking vertical hydraulic blast ribs + horizontal locking cross-bars
      for (let r = 0; r < 6; r++) {
        mesh(door, ribGeo, r % 2 === 0 ? bulkheadSteelMat : bulkheadDarkMat, -1.45 + r * 0.58, 3.1, 0.18);
      }
      for (const barY of [1.95, 4.25]) {
        box(door, bulkheadSteelMat, 0, barY, 0.34, 3.55, 0.26, 0.22, 0.04);
      }
    }
    // CONTAINMENT PYLON — Armored Industrial Reactor Columns with Layered Bronze Compression Rings & Cyan Plasma Band (Sheet 6, Panel 3)
    const pylonCyanBandMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.55,
      roughness: 0.16,
      metalness: 0.25,
    });
    for (const pSpec of GAME_CONFIG.arena.sanctumLandmarks.chapter_1_helix.containmentPylons) {
      const pylon = new THREE.Group();
      pylon.position.set(pSpec.x, 0, pSpec.z);
      group.add(pylon);
      // Heavy dark weathered steel cylindrical column + flared base & crowned top cap
      mesh(pylon, new THREE.CylinderGeometry(0.76, 0.84, 0.42, 16), bulkheadSteelMat, 0, 0.21, 0);
      mesh(pylon, new THREE.CylinderGeometry(0.66, 0.68, 3.15, 16), bulkheadDarkMat, 0, 1.92, 0);
      mesh(pylon, new THREE.CylinderGeometry(0.74, 0.72, 0.52, 16), bulkheadSteelMat, 0, 3.68, 0);
      mesh(pylon, new THREE.CylinderGeometry(0.56, 0.66, 0.16, 16), bronzeClampMat, 0, 4.02, 0);
      // Stacked weathered bronze compression collars (lower pair & upper pair)
      for (const cy of [0.68, 0.94, 3.06, 3.32]) {
        const collar = mesh(pylon, new THREE.TorusGeometry(0.72, 0.085, 8, 22), bronzeClampMat, 0, cy, 0);
        collar.rotation.x = Math.PI / 2;
      }
      // Ribbed industrial armor struts around cooling grates
      for (let r = 0; r < 6; r++) {
        const ra = (r / 6) * Math.PI * 2;
        const rib = box(pylon, bulkheadSteelMat, Math.sin(ra) * 0.67, 1.92, Math.cos(ra) * 0.67, 0.11, 2.1, 0.14, 0.02);
        rib.rotation.y = ra;
      }
      // Bright glowing cyan plasma conduit band wrapping the midsection
      mesh(pylon, new THREE.CylinderGeometry(0.71, 0.71, 0.46, 20), pylonCyanBandMat, 0, 1.98, 0);
    }
    // LOCKDOWN BEACON — Tactical Alert Obelisk with Splayed Buttress Base, Amber Core, Tilted Bronze Gyro Ring & Armored Cap (Sheet 6, Panel 5)
    const lbSpec = GAME_CONFIG.arena.sanctumLandmarks.chapter_1_helix.lockdownBeacon;
    const lockdownBeacon = new THREE.Group();
    lockdownBeacon.position.set(lbSpec.x, 0, lbSpec.z);
    group.add(lockdownBeacon);
    // Cruciform splayed charcoal alloy pedestal with hazard-amber armor struts
    box(lockdownBeacon, bulkheadSteelMat, 0, 0.16, 0, 1.52, 0.32, 1.52, 0.05);
    box(lockdownBeacon, bulkheadDarkMat, 0, 0.88, 0, 0.98, 1.32, 0.98, 0.06);
    for (let s = 0; s < 4; s++) {
      const sa = (s / 4) * Math.PI * 2;
      const buttress = box(
        lockdownBeacon,
        bulkheadSteelMat,
        Math.sin(sa) * 0.62,
        0.58,
        Math.cos(sa) * 0.62,
        0.28,
        0.92,
        0.48,
        0.04
      );
      buttress.rotation.y = sa;
      const amberPlate = box(
        lockdownBeacon,
        amberStripMat,
        Math.sin(sa) * 0.56,
        1.14,
        Math.cos(sa) * 0.56,
        0.24,
        0.42,
        0.22,
        0.03
      );
      amberPlate.rotation.y = sa;
    }
    // Exposed glowing molten-amber cylindrical warning core
    mesh(lockdownBeacon, new THREE.CylinderGeometry(0.28, 0.28, 0.84, 14), amberStripMat, 0, 2.02, 0);
    // Inclined rotating weathered bronze gyroscope ring around the amber core
    const lockRing = mesh(lockdownBeacon, new THREE.TorusGeometry(0.84, 0.09, 10, 28), bronzeClampMat, 0, 2.02, 0);
    lockRing.rotation.x = Math.PI * 0.36;
    rotors.push(lockRing);
    // Floating tapered dark charcoal armored crown cap with amber top stripes
    mesh(lockdownBeacon, new THREE.CylinderGeometry(0.42, 0.62, 1.04, 8), bulkheadSteelMat, 0, 3.12, 0);
    for (let a = 0; a < 4; a++) {
      const aa = (a / 4) * Math.PI * 2 + Math.PI / 4;
      const capAmber = box(
        lockdownBeacon,
        amberStripMat,
        Math.sin(aa) * 0.44,
        3.46,
        Math.cos(aa) * 0.44,
        0.16,
        0.24,
        0.1,
        0.02
      );
      capAmber.rotation.y = aa;
    }

    // OVERDRIVE CONDUIT — Octagonal Dark-Steel Floor Energy Pylon with 4 Copper-Gold Induction Coils & Crackling Vertical Cyan Plasma Arcs (Sheet 11, Panel 4)
    const odcSpec = GAME_CONFIG.arena.sanctumLandmarks.chapter_1_helix.overdriveConduit;
    const overdriveConduit = new THREE.Group();
    overdriveConduit.position.set(odcSpec.x, 0, odcSpec.z);
    group.add(overdriveConduit);
    mesh(overdriveConduit, new THREE.CylinderGeometry(0.96, 1.12, 0.28, 8), bulkheadDarkMat, 0, 0.14, 0);
    mesh(overdriveConduit, new THREE.CylinderGeometry(0.76, 0.88, 0.34, 8), bulkheadSteelMat, 0, 0.44, 0);
    // Glowing cyan central plasma aperture well
    mesh(overdriveConduit, new THREE.CylinderGeometry(0.32, 0.36, 0.16, 14), pylonCyanBandMat, 0, 0.68, 0);
    // 4 vertical copper-gold induction coils + glowing emitter caps + animated vertical cyan plasma bolts
    const odArcMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.88,
    });
    for (let c = 0; c < 4; c++) {
      const ca = (c / 4) * Math.PI * 2 + Math.PI * 0.25;
      const cx = Math.cos(ca) * 0.56;
      const cz = Math.sin(ca) * 0.56;
      mesh(overdriveConduit, new THREE.CylinderGeometry(0.18, 0.2, 0.72, 12), bronzeClampMat, cx, 0.92, cz);
      mesh(overdriveConduit, new THREE.CylinderGeometry(0.14, 0.17, 0.14, 10), bulkheadSteelMat, cx, 1.32, cz);
      mesh(overdriveConduit, new THREE.SphereGeometry(0.1, 10, 8), pylonCyanBandMat, cx, 1.44, cz);
      const arcCol = mesh(
        overdriveConduit,
        new THREE.CylinderGeometry(0.032, 0.068, 1.18, 6),
        odArcMat,
        cx,
        2.02,
        cz
      );
      arcCol.userData = { animKind: 'floatSpin', baseY: 2.02, amp: 0.14, speed: 3.4 + c * 0.35, phase: c * 1.4 };
      rotors.push(arcCol);
    }
    const centerArc = mesh(overdriveConduit, new THREE.CylinderGeometry(0.055, 0.12, 1.55, 8), odArcMat, 0, 1.55, 0);
    centerArc.userData = { animKind: 'floatSpin', baseY: 1.55, amp: 0.18, speed: 4.1, phase: 0.6 };
    rotors.push(centerArc);
  } else if (chapter === 'chapter_2_choir') {
    for (let tier = 0; tier < 3; tier++) {
      const radius = 12.2 + tier * 1.65;
      for (let i = 0; i < 9; i++) {
        const angle = -1.04 + (i / 8) * 2.08;
        const step = box(
          group,
          tier === 2 ? shellMat : structureMat,
          Math.sin(angle) * radius,
          0.22 + tier * 0.36,
          -Math.cos(angle) * radius - 1.5,
          1.75,
          0.42 + tier * 0.1,
          1.15,
          0.06
        );
        step.rotation.y = -angle;
      }
    }
    // HARMONIC ORGAN — Monumental White-Porcelain & Antique-Gold Acoustic Pipe Organ Towers (Sheet 5, Panel 2)
    const organPorcelainMat = new THREE.MeshStandardMaterial({
      color: 0xf4f7fa,
      roughness: 0.22,
      metalness: 0.22,
    });
    const organGoldMat = new THREE.MeshStandardMaterial({
      color: 0xd4ad52,
      roughness: 0.24,
      metalness: 0.9,
    });
    const organTealSlitMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x0d9488,
      emissiveIntensity: 1.35,
      roughness: 0.16,
      metalness: 0.25,
    });
    for (const orgSpec of GAME_CONFIG.arena.sanctumLandmarks.chapter_2_choir.harmonicOrgans) {
      const organ = new THREE.Group();
      organ.position.set(orgSpec.x, 0, orgSpec.z);
      organ.rotation.y = orgSpec.rotY;
      group.add(organ);
      // Ornate sculpted white porcelain console base with gold trim & turquoise vertical resonance slits
      box(organ, organGoldMat, 0, 0.1, 0, 3.6, 0.2, 1.38, 0.04);
      box(organ, organPorcelainMat, 0, 0.78, 0, 3.4, 1.22, 1.24, 0.1);
      box(organ, organGoldMat, 0, 1.4, 0, 3.52, 0.1, 1.3, 0.03);
      // Recessed central keyboard console bay & turquoise vertical slits
      box(organ, organPorcelainMat, 0, 0.84, 0.48, 1.4, 0.68, 0.46, 0.06);
      for (let sl = -4; sl <= 4; sl++) {
        if (Math.abs(sl) <= 1) continue;
        box(organ, organTealSlitMat, sl * 0.34, 0.78, 0.63, 0.055, 0.76, 0.04, 0.01);
      }
      box(organ, organTealSlitMat, 0, 0.34, 0.66, 0.96, 0.14, 0.05, 0.02);
      // 11 Symmetrical ascending fluted porcelain resonator pipes crowned with golden spire finials
      const pipeHeights = [3.0, 3.45, 2.4, 3.8, 4.45, 5.15, 4.45, 3.8, 2.4, 3.45, 3.0];
      for (let p = 0; p < pipeHeights.length; p++) {
        const px = (p - 5) * 0.285;
        const pz = Math.abs(p - 5) >= 4 ? 0.16 : 0;
        const h = pipeHeights[p];
        const pipe = mesh(organ, pipeGeo, organPorcelainMat, px, h * 0.5 + 1.42, pz);
        pipe.scale.set(0.92, h, 0.92);
        // Gold mouthpiece collar near pipe base + cyan acoustic mouth slit
        mesh(organ, new THREE.TorusGeometry(0.145, 0.024, 8, 16), organGoldMat, px, 1.56, pz).rotation.x = Math.PI / 2;
        if (Math.abs(p - 5) <= 2) {
          box(organ, organTealSlitMat, px, 1.88, pz + 0.13, 0.06, 0.42, 0.04, 0.01);
        }
        // Tall pointed antique-gold spire finial on top of each pipe
        mesh(organ, new THREE.ConeGeometry(0.14, 0.54, 8), organGoldMat, px, h + 1.68, pz);
      }
    }
    for (const [r, y] of [[3.2, 5.8], [4.15, 6.25]] as const) {
      const halo = mesh(group, new THREE.TorusGeometry(r, 0.065, 10, 56), r > 4 ? accentMat : glowMat, 0, y, -4.5);
      halo.rotation.x = Math.PI * 0.42;
      rotors.push(halo);
    }
    const duetRing = mesh(group, new THREE.TorusGeometry(2.05, 0.04, 8, 36), glowMat, -7.8, 0.05, 5.2);
    duetRing.rotation.x = Math.PI / 2;
    rotors.push(duetRing);
    // SANCTUM CHIME — Floating White-Porcelain & Antique-Gold Acoustic Tuning Crystal Spires (Sheet 7, Panel 7)
    for (const side of [-1, 1]) {
      const chime = new THREE.Group();
      chime.position.set(side * 9.8, 2.65, -7.8);
      group.add(chime);
      // Tapered white-porcelain & gold upper and lower finial spires
      const upperSpire = mesh(chime, new THREE.ConeGeometry(0.28, 1.15, 6), organPorcelainMat, 0, 1.42, 0);
      void upperSpire;
      const lowerSpire = mesh(chime, new THREE.ConeGeometry(0.28, 0.92, 6), organPorcelainMat, 0, -1.32, 0);
      lowerSpire.rotation.x = Math.PI;
      mesh(chime, new THREE.TorusGeometry(0.29, 0.045, 8, 18), organGoldMat, 0, 0.86, 0).rotation.x = Math.PI / 2;
      mesh(chime, new THREE.TorusGeometry(0.29, 0.045, 8, 18), organGoldMat, 0, -0.86, 0).rotation.x = Math.PI / 2;
      // 3 Symmetrical slender golden resonance prongs framing the floating crystal
      for (let pr = 0; pr < 3; pr++) {
        const pa = (pr / 3) * Math.PI * 2;
        const prong = mesh(
          chime,
          new THREE.CylinderGeometry(0.032, 0.048, 2.55, 6),
          organGoldMat,
          Math.sin(pa) * 0.44,
          0.1,
          Math.cos(pa) * 0.44
        );
        void prong;
        const tip = mesh(
          chime,
          new THREE.ConeGeometry(0.042, 0.34, 6),
          organGoldMat,
          Math.sin(pa) * 0.44,
          1.52,
          Math.cos(pa) * 0.44
        );
        void tip;
      }
      // Suspended luminous turquoise-cyan harmonic diamond crystal
      const chimeCrystal = mesh(chime, crystalGeo, organTealSlitMat, 0, 0, 0);
      chimeCrystal.scale.set(0.82, 1.65, 0.82);
      rotors.push(chime);
    }
  } else if (chapter === 'chapter_3_curator') {
    // ARCHIVE MONOLITH — Obsidian-Indigo Server Racks with Glowing Amethyst Memory Drawers (Sheet 5, Panel 3)
    const monolithIndigoMat = new THREE.MeshStandardMaterial({
      color: 0x222038,
      roughness: 0.34,
      metalness: 0.76,
    });
    const monolithRailMat = new THREE.MeshStandardMaterial({
      color: 0x383458,
      roughness: 0.28,
      metalness: 0.86,
    });
    const drawerPurpleMat = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0x9333ea,
      emissiveIntensity: 1.45,
      transparent: true,
      opacity: 0.86,
      roughness: 0.14,
      metalness: 0.2,
    });
    const crystalVioletMat = new THREE.MeshStandardMaterial({
      color: 0xd8b4fe,
      emissive: 0x9333ea,
      emissiveIntensity: 1.65,
      transparent: true,
      opacity: 0.88,
      roughness: 0.1,
      metalness: 0.2,
    });
    const drawerGeo = new RoundedBoxGeometry(1.12, 0.4, 0.24, 2, 0.03);
    const hexCrystalGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.95, 6);
    for (const mSpec of GAME_CONFIG.arena.sanctumLandmarks.chapter_3_curator.archiveMonoliths) {
      const rack = new THREE.Group();
      rack.position.set(mSpec.x, 0, mSpec.z);
      rack.rotation.y = mSpec.rotY;
      group.add(rack);
      // Main obsidian-indigo server chassis + beveled crown & plinth
      box(rack, monolithIndigoMat, 0, 2.32, 0, 1.62, 4.64, 1.18, 0.1);
      box(rack, monolithRailMat, 0, 0.16, 0, 1.76, 0.32, 1.3, 0.06);
      box(rack, monolithRailMat, 0, 4.68, 0, 1.74, 0.26, 1.28, 0.06);
      // Twin vertical metallic side rails flanking the memory bays
      for (const rSide of [-1, 1]) {
        box(rack, monolithRailMat, rSide * 0.72, 2.32, 0.56, 0.22, 4.5, 0.2, 0.04);
      }
      // 6 Stacked glowing amethyst-purple holographic memory drawer bays
      for (let s = 0; s < 6; s++) {
        const dy = 0.66 + s * 0.66;
        mesh(rack, drawerGeo, drawerPurpleMat, 0, dy, 0.56);
        box(rack, monolithIndigoMat, 0, dy + 0.26, 0.59, 1.18, 0.08, 0.16, 0.015);
      }
      // Floating faceted translucent violet hexagonal crystal prism hovering above crown
      const crystalHolder = new THREE.Group();
      crystalHolder.position.set(0, 5.65, 0);
      rack.add(crystalHolder);
      mesh(crystalHolder, hexCrystalGeo, crystalVioletMat, 0, 0, 0);
      mesh(crystalHolder, new THREE.ConeGeometry(0.32, 0.36, 6), crystalVioletMat, 0, 0.65, 0);
      const bottomTip = mesh(crystalHolder, new THREE.ConeGeometry(0.32, 0.36, 6), crystalVioletMat, 0, -0.65, 0);
      bottomTip.rotation.x = Math.PI;
      rotors.push(crystalHolder);
    }
    // MEMORY SLAB — Floating Beveled Obsidian-Indigo Archive Tablets with Silver Clamps & Amethyst Runes (Sheet 9, Panel 6)
    const slabSilverMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.24,
      metalness: 0.88,
    });
    const slabObsidianMat = new THREE.MeshStandardMaterial({
      color: 0x262447,
      roughness: 0.28,
      metalness: 0.62,
    });
    const slabRuneMat = new THREE.MeshStandardMaterial({
      color: 0xd8b4fe,
      emissive: 0x9333ea,
      emissiveIntensity: 1.55,
      roughness: 0.14,
      metalness: 0.22,
    });
    for (const side of [-1, 1]) {
      for (let r = 0; r < 4; r++) {
        const memSlab = new THREE.Group();
        memSlab.position.set(side * (5.2 + r * 1.18), 2.3 + r * 0.42, -16.4 + r * 0.38);
        memSlab.rotation.y = -side * (0.28 - r * 0.04);
        memSlab.rotation.z = side * (0.04 + r * 0.015);
        group.add(memSlab);
        // Tall chamfered obsidian-indigo crystalline data tablet
        box(memSlab, slabObsidianMat, 0, 0.18, 0, 0.86, 1.88, 0.22, 0.05);
        // Brushed-silver side clamp brackets
        for (const sx of [-0.45, 0.45]) {
          box(memSlab, slabSilverMat, sx, 0.12, 0, 0.08, 0.92, 0.26, 0.02);
        }
        // Vertical etched glowing amethyst data-glyph strips (front & back)
        for (const sz of [-0.115, 0.115]) {
          box(memSlab, slabRuneMat, -0.09, 0.22, sz, 0.04, 1.38, 0.025, 0.008);
          box(memSlab, slabRuneMat, 0.08, 0.16, sz, 0.04, 1.24, 0.025, 0.008);
          box(memSlab, slabRuneMat, 0, 0.64, sz, 0.28, 0.045, 0.025, 0.008);
          box(memSlab, slabRuneMat, 0, -0.18, sz, 0.24, 0.045, 0.025, 0.008);
        }
        // Compact hovering emitter pod floating cleanly beneath the tablet
        box(memSlab, slabObsidianMat, 0, -0.96, 0, 0.62, 0.12, 0.24, 0.03);
        const podGlow = mesh(memSlab, new THREE.TorusGeometry(0.18, 0.024, 8, 18), slabRuneMat, 0, -1.04, 0);
        podGlow.rotation.x = Math.PI / 2;
      }
    }
    // Hero Foreground MEMORY SLAB Monument (Sheet 9, Panel 6)
    const heroSlabSpec = GAME_CONFIG.arena.sanctumLandmarks.chapter_3_curator.heroMemorySlab;
    const vaultMonolith = new THREE.Group();
    vaultMonolith.position.set(heroSlabSpec.x, 0, heroSlabSpec.z);
    vaultMonolith.rotation.y = heroSlabSpec.rotY;
    group.add(vaultMonolith);
    const heroSlabSilverMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.24,
      metalness: 0.88,
    });
    const heroSlabBodyMat = new THREE.MeshStandardMaterial({
      color: 0x262447,
      roughness: 0.26,
      metalness: 0.64,
    });
    const heroSlabRuneMat = new THREE.MeshStandardMaterial({
      color: 0xd8b4fe,
      emissive: 0x9333ea,
      emissiveIntensity: 1.55,
      roughness: 0.14,
      metalness: 0.22,
    });
    // Hovering emitter pod base
    box(vaultMonolith, heroSlabBodyMat, 0, 0.38, 0, 1.15, 0.2, 0.42, 0.05);
    const heroPodRing = mesh(vaultMonolith, new THREE.TorusGeometry(0.36, 0.038, 8, 24), heroSlabRuneMat, 0, 0.22, 0);
    heroPodRing.rotation.x = Math.PI / 2;
    // Tall beveled hero Memory Slab tablet
    box(vaultMonolith, heroSlabBodyMat, 0, 2.28, 0, 1.48, 3.2, 0.36, 0.08);
    for (const sx of [-0.77, 0.77]) {
      box(vaultMonolith, heroSlabSilverMat, sx, 2.2, 0, 0.14, 1.65, 0.42, 0.03);
    }
    for (const sz of [-0.19, 0.19]) {
      box(vaultMonolith, heroSlabRuneMat, -0.16, 2.34, sz, 0.06, 2.38, 0.035, 0.01);
      box(vaultMonolith, heroSlabRuneMat, 0.15, 2.24, sz, 0.06, 2.15, 0.035, 0.01);
      for (const ry of [1.55, 2.18, 2.86]) {
        box(vaultMonolith, heroSlabRuneMat, 0, ry, sz, 0.46, 0.065, 0.035, 0.01);
      }
    }
    const unindexedOrb = mesh(vaultMonolith, crystalGeo, heroSlabRuneMat, 0, 4.35, 0);
    unindexedOrb.scale.set(0.75, 1.45, 0.75);
    rotors.push(unindexedOrb);
    const c3HoloSpec = GAME_CONFIG.arena.sanctumLandmarks.chapter_3_curator.tacticalHoloTable;
    addTacticalHoloTable(c3HoloSpec.x, c3HoloSpec.z);
  } else if (chapter === 'chapter_4_matron') {
    // STASIS POD — Cylindrical White Ceramic & Crimson Cryo Quarantine Chambers (Sheet 5, Panel 4)
    const podCeramicMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.22,
      metalness: 0.22,
    });
    const podTitaniumMat = new THREE.MeshStandardMaterial({
      color: 0x272d38,
      roughness: 0.34,
      metalness: 0.84,
    });
    const podCrimsonGlassMat = new THREE.MeshStandardMaterial({
      color: 0xbe123c,
      emissive: 0x9f1239,
      emissiveIntensity: 0.95,
      transparent: true,
      opacity: 0.68,
      roughness: 0.12,
      metalness: 0.18,
    });
    const podLaserRedMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xe11d48,
      emissiveIntensity: 1.65,
      roughness: 0.12,
      metalness: 0.2,
    });
    for (const podSpec of GAME_CONFIG.arena.sanctumLandmarks.chapter_4_matron.stasisPods) {
      const pod = new THREE.Group();
      pod.position.set(podSpec.x, 0, podSpec.z);
      pod.rotation.y = podSpec.rotY;
      group.add(pod);
      // Dark titanium top & bottom heavy cylindrical end-caps
      mesh(pod, new THREE.CylinderGeometry(0.92, 0.96, 0.42, 20), podTitaniumMat, 0, 0.21, 0);
      mesh(pod, new THREE.CylinderGeometry(0.88, 0.94, 0.46, 20), podTitaniumMat, 0, 3.68, 0);
      // Small crimson indicator light on lower cap
      box(pod, podLaserRedMat, 0, 0.24, 0.95, 0.38, 0.055, 0.05, 0.01);
      // Translucent glowing crimson cryo glass core cylinder
      mesh(pod, new THREE.CylinderGeometry(0.76, 0.76, 3.06, 20), podCrimsonGlassMat, 0, 1.94, 0);
      // Inner glowing red top & bottom containment rings inside the glass
      for (const ry of [0.56, 3.34]) {
        const innerRing = mesh(pod, new THREE.TorusGeometry(0.68, 0.032, 8, 24), podLaserRedMat, 0, ry, 0);
        innerRing.rotation.x = Math.PI / 2;
      }
      // Glossy white ceramic curved side armor shell plates with thin crimson horizontal seam notches
      for (const panelSide of [-1, 1]) {
        const shellArc = mesh(
          pod,
          new THREE.CylinderGeometry(0.94, 0.94, 2.98, 12, 1, false, panelSide < 0 ? Math.PI * 0.22 : -Math.PI * 0.78, Math.PI * 0.56),
          podCeramicMat,
          0,
          1.94,
          0
        );
        void shellArc;
        box(pod, podLaserRedMat, panelSide * 0.88, 1.94, 0.32, 0.16, 0.05, 0.36, 0.01);
      }
      // Active horizontal glowing red scanner ring sweeping vertically inside the cryo pod
      const scan = mesh(pod, new THREE.TorusGeometry(0.81, 0.035, 8, 28), podLaserRedMat, 0, 1.95, 0);
      scan.rotation.x = Math.PI / 2;
      scan.userData = { animKind: 'scanY', baseY: 1.95, amp: 1.18, speed: 1.25, phase: pod.position.x * 0.3 };
      rotors.push(scan);
      // Overhead sterile clinical light canopy
      box(pod, podCeramicMat, 0, 4.5, 0, 2.5, 0.16, 1.15, 0.04);
      box(pod, podLaserRedMat, 0, 4.38, 0, 1.75, 0.06, 0.72, 0.015);
    }
    // CRYO MED-TABLE — Sleek White-and-Crimson Surgical Stasis Tables with Overhead Holographic Biometric Scanner Arc (Sheet 10, Panel 5)
    const medCrimsonPadMat = new THREE.MeshStandardMaterial({
      color: 0x9f1239,
      roughness: 0.42,
      metalness: 0.25,
    });
    const medHoloScanMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    pulseMaterials.push(medHoloScanMat);
    const medHoloRibMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.82,
    });
    for (const tblSpec of GAME_CONFIG.arena.sanctumLandmarks.chapter_4_matron.cryoMedTables) {
      const medTable = new THREE.Group();
      medTable.position.set(tblSpec.x, 0, tblSpec.z);
      medTable.rotation.y = tblSpec.rotY;
      group.add(medTable);
      // White ceramic base chassis & crimson hydraulic trim strip
      box(medTable, podCeramicMat, 0, 0.16, 0, 1.08, 0.28, 2.25, 0.05);
      box(medTable, podTitaniumMat, 0, 0.48, 0, 0.86, 0.44, 1.88, 0.04);
      box(medTable, podLaserRedMat, 0, 0.18, 0, 1.12, 0.06, 1.95, 0.015);
      // Raised beveled white surgical deck + crimson cushioned stasis mattress slabs
      box(medTable, podCeramicMat, 0, 0.82, 0, 1.16, 0.18, 2.38, 0.05);
      box(medTable, medCrimsonPadMat, 0, 0.94, 0.34, 0.86, 0.1, 1.25, 0.04);
      const headrest = box(medTable, medCrimsonPadMat, 0, 1.0, -0.62, 0.82, 0.1, 0.68, 0.04);
      headrest.rotation.x = 0.18;
      // Curved overhead holographic biometric rib-scanner arc sweeping smoothly along the stasis deck
      const medScanRig = new THREE.Group();
      medScanRig.position.set(0, 1.48, -0.18);
      medScanRig.userData = { animKind: 'scanZ', baseZ: -0.18, amp: 0.42, speed: 1.15, phase: tblSpec.x * 0.2 };
      medTable.add(medScanRig);
      const scanArc = mesh(
        medScanRig,
        new THREE.CylinderGeometry(0.76, 0.76, 0.56, 16, 1, true, -Math.PI * 0.45, Math.PI * 0.9),
        medHoloScanMat,
        0,
        0,
        0
      );
      scanArc.rotation.z = Math.PI / 2;
      scanArc.rotation.y = Math.PI / 2;
      for (let rb = -2; rb <= 2; rb++) {
        const ribLine = mesh(
          medScanRig,
          new THREE.TorusGeometry(0.72, 0.016, 6, 16, Math.PI * 0.68),
          medHoloRibMat,
          0,
          0,
          rb * 0.1
        );
        ribLine.rotation.z = Math.PI * 0.16;
      }
      rotors.push(medScanRig);
    }
    const cradleBeacon = mesh(group, new THREE.TorusGeometry(1.9, 0.045, 8, 32), glowMat, 12.6, 0.06, 9.2);
    cradleBeacon.rotation.x = Math.PI / 2;
    rotors.push(cradleBeacon);
  } else {
    // SOVEREIGN SEAL — Regal Fluted Obsidian & Antique-Gold Monolith Towers with Twin Interlocking Gyro Halos & Ice-Blue Crystal (Sheet 6, Panel 2)
    const sealObsidianMat = new THREE.MeshStandardMaterial({
      color: 0x151b26,
      roughness: 0.34,
      metalness: 0.82,
    });
    const sealGoldMat = new THREE.MeshStandardMaterial({
      color: 0xd4ad52,
      roughness: 0.26,
      metalness: 0.9,
    });
    const sealIceCrystalMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x0ea5e9,
      emissiveIntensity: 1.45,
      roughness: 0.12,
      metalness: 0.25,
    });
    for (const sealSpec of GAME_CONFIG.arena.sanctumLandmarks.chapter_5_loom.sovereignSeals) {
      const sealTower = new THREE.Group();
      sealTower.position.set(sealSpec.x, 0, sealSpec.z);
      group.add(sealTower);
      // Stepped obsidian & antique-gold octagonal pedestal base
      mesh(sealTower, new THREE.CylinderGeometry(0.92, 1.06, 0.26, 8), sealGoldMat, 0, 0.13, 0);
      mesh(sealTower, new THREE.CylinderGeometry(0.84, 0.92, 0.22, 8), sealObsidianMat, 0, 0.36, 0);
      // Tall tapered fluted obsidian monolith shaft with vertical antique-gold filigree inlays
      mesh(sealTower, new THREE.CylinderGeometry(0.52, 0.72, 3.6, 8), sealObsidianMat, 0, 2.24, 0);
      for (let f = 0; f < 4; f++) {
        const fa = (f / 4) * Math.PI * 2 + Math.PI / 4;
        const goldFiligree = box(
          sealTower,
          sealGoldMat,
          Math.sin(fa) * 0.6,
          2.24,
          Math.cos(fa) * 0.6,
          0.09,
          3.45,
          0.09,
          0.015
        );
        goldFiligree.rotation.y = fa;
      }
      // Ornate gold capital collar
      mesh(sealTower, new THREE.CylinderGeometry(0.68, 0.56, 0.24, 8), sealGoldMat, 0, 4.12, 0);
      // Twin interlocking tilted rotating antique-gold gyroscope halo rings + floating faceted ice-blue crystal
      const crownRig = new THREE.Group();
      crownRig.position.y = 5.25;
      sealTower.add(crownRig);
      const outerGyro = mesh(crownRig, new THREE.TorusGeometry(0.96, 0.085, 10, 32), sealGoldMat, 0, 0, 0);
      outerGyro.rotation.set(0.45, 0.32, 0.22);
      const innerGyro = mesh(crownRig, new THREE.TorusGeometry(0.88, 0.075, 10, 32), sealGoldMat, 0, 0, 0);
      innerGyro.rotation.set(-0.52, -0.4, 1.15);
      const crystal = mesh(crownRig, crystalGeo, sealIceCrystalMat, 0, 0, 0);
      crystal.scale.set(0.95, 1.85, 0.95);
      crownRig.userData = { animKind: 'floatSpin', baseY: 5.25, amp: 0.12, speed: 0.72, phase: sealSpec.x * 0.25 };
      rotors.push(crownRig);
    }

    // CONVERGENCE PILLAR — Hexagonal Brushed-Brass & Slate Resonance Spires with Twin Intersecting Cyan-Amber Rings (Sheet 10, Panel 3)
    const cpAmberRingMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.94,
    });
    const cpCyanRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.94,
    });
    for (const cpSpec of GAME_CONFIG.arena.sanctumLandmarks.chapter_5_loom.convergencePillars) {
      const cpPillar = new THREE.Group();
      cpPillar.position.set(cpSpec.x, 0, cpSpec.z);
      group.add(cpPillar);
      // Stepped hexagonal slate & antique-gold pedestal base
      mesh(cpPillar, new THREE.CylinderGeometry(0.84, 0.94, 0.34, 6), sealObsidianMat, 0, 0.17, 0);
      mesh(cpPillar, new THREE.CylinderGeometry(0.72, 0.82, 0.24, 6), sealGoldMat, 0, 0.44, 0);
      // Tall hexagonal brushed-brass & slate resonance shaft + vertical cyan energy channels
      mesh(cpPillar, new THREE.CylinderGeometry(0.54, 0.62, 3.45, 6), sealGoldMat, 0, 2.28, 0);
      mesh(cpPillar, new THREE.CylinderGeometry(0.58, 0.65, 3.15, 6), sealObsidianMat, 0, 2.28, 0);
      for (let f = 0; f < 3; f++) {
        const fa = (f / 3) * Math.PI * 2;
        const slit = box(
          cpPillar,
          sealIceCrystalMat,
          Math.sin(fa) * 0.56,
          2.28,
          Math.cos(fa) * 0.56,
          0.11,
          2.85,
          0.08,
          0.015
        );
        slit.rotation.y = fa;
      }
      // Stepped brass-slate crown finial
      mesh(cpPillar, new THREE.CylinderGeometry(0.48, 0.58, 0.36, 6), sealGoldMat, 0, 4.18, 0);
      // Twin intersecting tilted cyan & amber resonance energy rings
      const cpRingPivot = new THREE.Group();
      cpRingPivot.position.y = 2.48;
      cpPillar.add(cpRingPivot);
      const cyanOrbit = mesh(cpRingPivot, new THREE.TorusGeometry(1.18, 0.052, 8, 36), cpCyanRingMat, 0, 0, 0);
      cyanOrbit.rotation.set(0.64, 0.22, 0.52);
      cyanOrbit.userData = { animKind: 'gyroSpin', rx: 0.55, ry: 1.1, rz: 0.4 };
      const amberOrbit = mesh(cpRingPivot, new THREE.TorusGeometry(1.14, 0.052, 8, 36), cpAmberRingMat, 0, 0, 0);
      amberOrbit.rotation.set(-0.62, 0.18, -0.58);
      amberOrbit.userData = { animKind: 'gyroSpin', rx: -0.62, ry: -0.95, rz: 0.48 };
      rotors.push(cpRingPivot, cyanOrbit, amberOrbit);
    }

    // DIRECTIVE CORE — Ceremonial Hexagonal Dark-Titanium & Antique-Gold Final Protocol Altar with Triad Decision Prisms (Sheet 9, Panel 8)
    const dcSpec = GAME_CONFIG.arena.sanctumLandmarks.chapter_5_loom.directiveCore;
    const directiveCoreAltar = new THREE.Group();
    directiveCoreAltar.position.set(dcSpec.x, 0, dcSpec.z);
    group.add(directiveCoreAltar);

    const dcAmberPrismMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.88,
      roughness: 0.12,
      metalness: 0.2,
    });
    const dcCyanPrismMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.55,
      transparent: true,
      opacity: 0.9,
      roughness: 0.12,
      metalness: 0.2,
    });
    const dcVioletPrismMat = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0x7e22ce,
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.88,
      roughness: 0.12,
      metalness: 0.2,
    });

    // Stepped hexagonal dark-titanium altar base + 6 radial antique-gold corner flanges
    mesh(directiveCoreAltar, new THREE.CylinderGeometry(2.15, 2.38, 0.28, 6), sealObsidianMat, 0, 0.14, 0);
    mesh(directiveCoreAltar, new THREE.CylinderGeometry(1.75, 2.02, 0.42, 6), sealObsidianMat, 0, 0.49, 0);
    const altarTopGoldRing = mesh(directiveCoreAltar, new THREE.TorusGeometry(1.12, 0.065, 10, 36), sealGoldMat, 0, 0.72, 0);
    altarTopGoldRing.rotation.x = Math.PI / 2;
    const altarEdgeGoldRing = mesh(directiveCoreAltar, new THREE.TorusGeometry(1.72, 0.045, 8, 6), sealGoldMat, 0, 0.71, 0);
    altarEdgeGoldRing.rotation.x = Math.PI / 2;
    for (let c = 0; c < 6; c++) {
      const ca = (c / 6) * Math.PI * 2;
      const flange = box(
        directiveCoreAltar,
        sealGoldMat,
        Math.sin(ca) * 2.08,
        0.26,
        Math.cos(ca) * 2.08,
        0.28,
        0.48,
        0.38,
        0.04
      );
      flange.rotation.y = ca;
    }

    // Triad of Floating Tall Hexagonal Decision Prisms: Amber (Left), Tall Cyan (Center), Violet (Right)
    const prismSpecs: Array<{ x: number; y: number; h: number; r: number; mat: THREE.Material }> = [
      { x: -1.18, y: 2.35, h: 1.65, r: 0.34, mat: dcAmberPrismMat },
      { x: 0, y: 2.88, h: 2.05, r: 0.38, mat: dcCyanPrismMat },
      { x: 1.18, y: 2.35, h: 1.65, r: 0.34, mat: dcVioletPrismMat },
    ];
    for (let pi = 0; pi < prismSpecs.length; pi++) {
      const ps = prismSpecs[pi];
      const prismGroup = new THREE.Group();
      prismGroup.position.set(ps.x, ps.y, 0);
      directiveCoreAltar.add(prismGroup);
      mesh(prismGroup, new THREE.CylinderGeometry(ps.r, ps.r, ps.h, 6), ps.mat, 0, 0, 0);
      mesh(prismGroup, new THREE.ConeGeometry(ps.r, ps.r * 1.15, 6), ps.mat, 0, ps.h * 0.5 + ps.r * 0.57, 0);
      const botTip = mesh(prismGroup, new THREE.ConeGeometry(ps.r, ps.r * 1.15, 6), ps.mat, 0, -ps.h * 0.5 - ps.r * 0.57, 0);
      botTip.rotation.x = Math.PI;
      prismGroup.userData = { animKind: 'floatSpin', baseY: ps.y, amp: 0.16, speed: 0.92, phase: pi * 2.1 };
      rotors.push(prismGroup);
    }

    for (const [radius, tube, mat] of [[4.8, 0.07, accentMat], [5.45, 0.045, glowMat]] as const) {
      const orbital = mesh(group, new THREE.TorusGeometry(radius, tube, 10, 64), mat, 0, 7.0, -2);
      orbital.rotation.x = Math.PI * 0.44;
      rotors.push(orbital);
    }
    const anchorRing = mesh(group, new THREE.TorusGeometry(2.05, 0.045, 8, 36), glowMat, -7.4, 0.05, 4.8);
    anchorRing.rotation.x = Math.PI / 2;
    rotors.push(anchorRing);
    const sovereignRing = mesh(group, new THREE.TorusGeometry(9.2, 0.055, 10, 64), accentMat, 0, 0.045, -2.0);
    sovereignRing.rotation.x = Math.PI / 2;
    rotors.push(sovereignRing);
  }

  const rotorSet = new Set<THREE.Object3D>(rotors);
  group.traverse((obj) => {
    if (obj !== group && !rotorSet.has(obj)) {
      obj.updateMatrix();
      obj.matrixAutoUpdate = false;
    }
  });

  return { group, rotors, pulseMaterials };
}

export function createSeraPlayerRig(shadowTex: THREE.Texture, enableShadows: boolean): PlayerRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const armorBump = createArmorDetailBumpTexture();
  const armorRoughness = createArmorRoughnessTexture();

  // Ground Contact Shadow Disc
  const contactShadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.92, 32),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    })
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.015;
  root.add(contactShadow);

  // Calibrated Sera Venn PBR Materials (AAA Ceramic-Titanium + Matte Carbon Weave Separation):
  // 1. Matte Charcoal Carbon-Weave Tactical Undersuit (high roughness for crisp contrast vs armor)
  const navySuitMat = new THREE.MeshStandardMaterial({
    color: 0x121822,
    bumpMap: armorBump,
    bumpScale: 0.016,
    roughness: 0.86,
    metalness: 0.14,
  });
  // 2. Satin Brushed Ceramic-Titanium Tactical Armor Plates (real specular sheen, zero plastic look)
  const silverArmorMat = new THREE.MeshStandardMaterial({
    color: 0xe6edf5,
    bumpMap: armorBump,
    bumpScale: 0.012,
    roughnessMap: armorRoughness,
    roughness: 0.36,
    metalness: 0.56,
  });
  // 3. Machined Gunmetal Joints, Seam Piping & Armored Boots
  const graphiteJointMat = new THREE.MeshStandardMaterial({
    color: 0x1f2836,
    bumpMap: armorBump,
    bumpScale: 0.01,
    roughness: 0.34,
    metalness: 0.78,
  });
  // 4. Brushed Champagne-Titanium Clasps & Chrono Ring Nodes
  const warmBronzeMat = new THREE.MeshStandardMaterial({
    color: 0xc8a96e,
    roughness: 0.2,
    metalness: 0.92,
  });
  // 5. Translucent Glowing Cyan Wrap-Around Holographic Visor
  const darkVisorMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.4,
    roughness: 0.08,
    metalness: 0.35,
    transparent: true,
    opacity: 0.84,
  });
  // 6. Luminous Cyan Chrono-Rig Halo Energy
  const chronoCyanMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x22d3ee,
    emissiveIntensity: 1.65,
    roughness: 0.12,
    metalness: 0.32,
  });
  // 7. Subtle Warm Skin Tone for Lower Face / Chin below Holographic Visor
  const faceSkinMat = new THREE.MeshStandardMaterial({
    color: 0xd4ad98,
    roughness: 0.66,
    metalness: 0.03,
  });
  // 8. Dark Hair & Tactical Headband Cap
  const hairCapMat = new THREE.MeshStandardMaterial({
    color: 0x161b23,
    roughness: 0.82,
    metalness: 0.08,
  });

  // --- 1. Articulated Pelvis Pivot & Multi-Segment Legs/Feet ---
  const pelvisPivot = new THREE.Group();
  pelvisPivot.position.set(0, 0.89, 0);
  bodyGroup.add(pelvisPivot);

  const pelvisMesh = new THREE.Mesh(
    new RoundedBoxGeometry(0.46, 0.22, 0.31, 4, 0.08),
    graphiteJointMat
  );
  pelvisMesh.castShadow = enableShadows;
  pelvisPivot.add(pelvisMesh);

  // Tactical Utility Belt with Warm Bronze Buckle & Side Flux Canisters
  const beltBand = new THREE.Mesh(
    new RoundedBoxGeometry(0.49, 0.09, 0.34, 3, 0.03),
    navySuitMat
  );
  beltBand.position.set(0, 0.1, 0);
  pelvisPivot.add(beltBand);

  const beltBuckle = new THREE.Mesh(
    new RoundedBoxGeometry(0.14, 0.1, 0.06, 2, 0.02),
    warmBronzeMat
  );
  beltBuckle.position.set(0, 0.1, 0.17);
  pelvisPivot.add(beltBuckle);

  for (const side of [-1, 1]) {
    const hipCanister = new THREE.Mesh(
      new THREE.CylinderGeometry(0.044, 0.044, 0.17, 12),
      silverArmorMat
    );
    hipCanister.rotation.z = side * 0.18;
    hipCanister.position.set(side * 0.26, 0.06, -0.04);
    pelvisPivot.add(hipCanister);

    const canisterCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.046, 0.046, 0.04, 12),
      warmBronzeMat
    );
    canisterCap.rotation.z = side * 0.18;
    canisterCap.position.set(side * 0.27, 0.13, -0.04);
    pelvisPivot.add(canisterCap);
  }

  const buildLeg = (isLeft: boolean) => {
    const sign = isLeft ? -1 : 1;
    const hipPivot = new THREE.Group();
    hipPivot.position.set(sign * 0.19, -0.03, 0);

    // Spherical Hip Joint + Upper Thigh (Capsule) + Contoured Silver Thigh Armor Plate
    const hipBall = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 12), graphiteJointMat);
    hipPivot.add(hipBall);

    const thighMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.105, 0.26, 8, 16),
      navySuitMat
    );
    thighMesh.position.set(0, -0.19, 0);
    thighMesh.castShadow = enableShadows;
    hipPivot.add(thighMesh);

    const thighArmor = new THREE.Mesh(
      new RoundedBoxGeometry(0.21, 0.3, 0.24, 3, 0.06),
      silverArmorMat
    );
    thighArmor.position.set(sign * 0.015, -0.18, 0.02);
    thighArmor.castShadow = enableShadows;
    hipPivot.add(thighArmor);

    const thighPiston = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.26, 8),
      warmBronzeMat
    );
    thighPiston.position.set(sign * 0.11, -0.18, -0.02);
    hipPivot.add(thighPiston);

    // Spherical Knee Joint & Beveled Knee Guard
    const shinPivot = new THREE.Group();
    shinPivot.position.set(0, -0.39, 0);
    hipPivot.add(shinPivot);

    const kneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.095, 14, 14), graphiteJointMat);
    shinPivot.add(kneeJoint);

    const kneePad = new THREE.Mesh(
      new RoundedBoxGeometry(0.16, 0.17, 0.15, 3, 0.05),
      silverArmorMat
    );
    kneePad.position.set(0, 0.01, 0.095);
    shinPivot.add(kneePad);

    // Tapered Shin Greave + Calf Stabilizer Ridge
    const shinGreave = new THREE.Mesh(
      new THREE.CylinderGeometry(0.102, 0.082, 0.34, 16),
      silverArmorMat
    );
    shinGreave.position.set(0, -0.2, 0.01);
    shinGreave.castShadow = enableShadows;
    shinPivot.add(shinGreave);

    const calfGuard = new THREE.Mesh(
      new RoundedBoxGeometry(0.14, 0.24, 0.12, 2, 0.03),
      graphiteJointMat
    );
    calfGuard.position.set(0, -0.19, -0.06);
    shinPivot.add(calfGuard);

    // Articulated Foot & Ankle Pivot (eliminates foot-sliding look during stride & stops)
    const footPivot = new THREE.Group();
    footPivot.position.set(0, -0.39, 0.02);
    shinPivot.add(footPivot);

    const bootChassis = new THREE.Mesh(
      new RoundedBoxGeometry(0.21, 0.15, 0.35, 3, 0.055),
      graphiteJointMat
    );
    bootChassis.position.set(0, 0, 0.03);
    bootChassis.castShadow = enableShadows;
    footPivot.add(bootChassis);

    const bootToePlate = new THREE.Mesh(
      new RoundedBoxGeometry(0.19, 0.11, 0.2, 3, 0.045),
      silverArmorMat
    );
    bootToePlate.position.set(0, -0.01, 0.11);
    footPivot.add(bootToePlate);

    const heelAccent = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.18, 10),
      warmBronzeMat
    );
    heelAccent.rotation.z = Math.PI / 2;
    heelAccent.position.set(0, 0.03, -0.12);
    footPivot.add(heelAccent);

    pelvisPivot.add(hipPivot);
    return { hipPivot, shinPivot, footPivot };
  };

  const leftLeg = buildLeg(true);
  const rightLeg = buildLeg(false);

  // --- 2. Articulated Waist TorsoPivot & Contoured Chest Cuirass ---
  const torsoPivot = new THREE.Group();
  torsoPivot.position.set(0, 1.02, 0);
  bodyGroup.add(torsoPivot);

  // Tapered Midsection / Abdomen (Capsule) + Segmented Rib Plates
  const abdomenMesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.19, 0.22, 8, 16),
    navySuitMat
  );
  abdomenMesh.position.set(0, 0.13, 0);
  abdomenMesh.scale.set(1.08, 1, 0.82);
  torsoPivot.add(abdomenMesh);

  const ribPlate = new THREE.Mesh(
    new RoundedBoxGeometry(0.45, 0.14, 0.3, 3, 0.04),
    graphiteJointMat
  );
  ribPlate.position.set(0, 0.16, 0.01);
  torsoPivot.add(ribPlate);

  // Sculpted Pale-Silver Chest Cuirass (Torso Mesh)
  const torsoMesh = new THREE.Mesh(
    new RoundedBoxGeometry(0.55, 0.44, 0.37, 4, 0.1),
    silverArmorMat
  );
  torsoMesh.position.set(0, 0.32, 0.01);
  torsoMesh.castShadow = enableShadows;
  torsoPivot.add(torsoMesh);

  // Angled Clavicle / Upper-Chest Armor Plates
  for (const side of [-1, 1]) {
    const claviclePlate = new THREE.Mesh(
      new RoundedBoxGeometry(0.23, 0.12, 0.29, 2, 0.035),
      graphiteJointMat
    );
    claviclePlate.position.set(side * 0.16, 0.49, 0.03);
    claviclePlate.rotation.z = -side * 0.22;
    torsoPivot.add(claviclePlate);
  }

  // Front Chest Sternum Core & Collar Guard
  const chestCoreBezel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.088, 0.098, 0.06, 16),
    warmBronzeMat
  );
  chestCoreBezel.rotation.x = Math.PI / 2;
  chestCoreBezel.position.set(0, 0.34, 0.185);
  torsoPivot.add(chestCoreBezel);

  const chestCoreLight = new THREE.Mesh(
    new THREE.CircleGeometry(0.064, 16),
    chronoCyanMat
  );
  chestCoreLight.position.set(0, 0.34, 0.218);
  torsoPivot.add(chestCoreLight);

  const collarRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.165, 0.044, 10, 24),
    graphiteJointMat
  );
  collarRing.rotation.x = Math.PI / 2 - 0.12;
  collarRing.position.set(0, 0.54, 0.01);
  torsoPivot.add(collarRing);

  // --- 3. CHRONO RIG — Matte-White Ceramic Backpack, Twin Glowing Cyan Flux Canisters & Gyro Halo (Sheet 4, Panel 8) ---
  const chronoRigPivot = new THREE.Group();
  chronoRigPivot.position.set(0, 0.56, -0.22);
  torsoPivot.add(chronoRigPivot);

  // Dark gunmetal inner backpack chassis
  const spineMount = new THREE.Mesh(
    new RoundedBoxGeometry(0.3, 0.42, 0.18, 3, 0.05),
    graphiteJointMat
  );
  spineMount.position.set(0, -0.14, -0.01);
  chronoRigPivot.add(spineMount);

  // Sculpted matte-white ceramic upper shell & side cheek armor shrouds
  const packWhiteShell = new THREE.Mesh(
    new RoundedBoxGeometry(0.33, 0.24, 0.2, 3, 0.06),
    silverArmorMat
  );
  packWhiteShell.position.set(0, -0.02, -0.04);
  chronoRigPivot.add(packWhiteShell);

  for (const side of [-1, 1]) {
    // Side ceramic cheek housing + circular cyan-lit gyro bearing coupler
    const sideShell = new THREE.Mesh(
      new RoundedBoxGeometry(0.09, 0.36, 0.18, 2, 0.03),
      silverArmorMat
    );
    sideShell.position.set(side * 0.145, -0.15, -0.04);
    chronoRigPivot.add(sideShell);

    const sideBearing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.04, 14),
      graphiteJointMat
    );
    sideBearing.rotation.z = Math.PI / 2;
    sideBearing.position.set(side * 0.19, -0.08, -0.04);
    chronoRigPivot.add(sideBearing);

    // Lower Recessed Glowing Cyan Flux Capacitor Canisters (Sheet 4, Panel 8 signature detail)
    const capacitorGlow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.046, 0.046, 0.17, 12),
      chronoCyanMat
    );
    capacitorGlow.position.set(side * 0.068, -0.22, -0.12);
    chronoRigPivot.add(capacitorGlow);

    for (const capY of [-0.13, -0.31]) {
      const capClamp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.054, 0.054, 0.035, 12),
        graphiteJointMat
      );
      capClamp.position.set(side * 0.068, capY, -0.12);
      chronoRigPivot.add(capClamp);
    }
  }

  // Outer brushed-alloy temporal gyroscope ring arc framing the floating Chrono Halo
  const outerRigFrame = new THREE.Mesh(
    new THREE.TorusGeometry(0.51, 0.024, 10, 44, Math.PI * 1.76),
    silverArmorMat
  );
  outerRigFrame.rotation.z = Math.PI * 0.12;
  outerRigFrame.position.set(0, 0.06, -0.07);
  chronoRigPivot.add(outerRigFrame);

  // Signature Large Luminous Cyan Chrono Halo Ring
  const chronoRingMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.45, 0.036, 14, 48),
    chronoCyanMat
  );
  chronoRingMesh.position.set(0, 0.06, -0.08);
  chronoRigPivot.add(chronoRingMesh);

  // Inner Concentric Metallic-Cyan Ring
  const chronoInnerRingMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.35, 0.02, 10, 36),
    graphiteJointMat
  );
  chronoInnerRingMesh.position.set(0, 0.06, -0.08);
  chronoRigPivot.add(chronoInnerRingMesh);

  // 4 Radial Metallic Node Clasps locking the Twin Halo Rings
  for (let c = 0; c < 4; c++) {
    const ca = (c / 4) * Math.PI * 2 + Math.PI / 4;
    const clasp = new THREE.Mesh(
      new RoundedBoxGeometry(0.06, 0.11, 0.07, 2, 0.018),
      silverArmorMat
    );
    clasp.position.set(Math.cos(ca) * 0.45, 0.06 + Math.sin(ca) * 0.45, -0.08);
    clasp.rotation.z = ca + Math.PI / 2;
    chronoRigPivot.add(clasp);
  }

  // v4.0.0: Composite 3D Sovereign Astral Crown Rig (Mastery Seal Tiers I..IV)
  const astralCrownGroup = new THREE.Group();
  astralCrownGroup.position.set(0, 0.1, -0.15);
  astralCrownGroup.visible = false;
  chronoRigPivot.add(astralCrownGroup);

  const astralArcMaterial = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.45,
    metalness: 0.92,
    roughness: 0.16,
  });
  const astralHousingMaterial = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.42,
    roughness: 0.56,
  });
  const astralBladeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.82,
    metalness: 0.78,
    roughness: 0.18,
  });

  const outerAstrolabeArc = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.017, 10, 48, Math.PI * 1.46),
    astralArcMaterial
  );
  outerAstrolabeArc.rotation.z = -Math.PI * 0.23;
  astralCrownGroup.add(outerAstrolabeArc);

  const innerGimbalArc = new THREE.Mesh(
    new THREE.TorusGeometry(0.57, 0.013, 10, 40, Math.PI * 1.66),
    astralArcMaterial
  );
  innerGimbalArc.rotation.z = Math.PI * 0.17;
  innerGimbalArc.position.z = -0.02;
  astralCrownGroup.add(innerGimbalArc);

  for (let n = 0; n < 4; n += 1) {
    const na = (n / 4) * Math.PI * 2;
    const bearingMount = new THREE.Mesh(
      new RoundedBoxGeometry(0.048, 0.078, 0.052, 2, 0.012),
      astralHousingMaterial
    );
    bearingMount.position.set(Math.cos(na) * 0.62, Math.sin(na) * 0.62, -0.01);
    bearingMount.rotation.z = na + Math.PI * 0.5;
    bearingMount.matrixAutoUpdate = false;
    bearingMount.updateMatrix();
    astralCrownGroup.add(bearingMount);
  }

  // Bevelled Omega Keystone Finial (Revealed at Sovereign Seal Tier IV)
  const omegaKeystoneGroup = new THREE.Group();
  omegaKeystoneGroup.position.set(0, 0.72, -0.01);
  omegaKeystoneGroup.visible = false;
  astralCrownGroup.add(omegaKeystoneGroup);

  const keystoneShape = new THREE.Shape();
  keystoneShape.moveTo(0, 0.14);
  keystoneShape.lineTo(0.068, 0.02);
  keystoneShape.lineTo(0.032, -0.09);
  keystoneShape.lineTo(0, -0.05);
  keystoneShape.lineTo(-0.032, -0.09);
  keystoneShape.lineTo(-0.068, 0.02);
  keystoneShape.closePath();
  const keystoneGeo = new THREE.ExtrudeGeometry(keystoneShape, {
    steps: 1,
    depth: 0.026,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.007,
    bevelSegments: 2,
  });
  keystoneGeo.center();
  const keystoneFinial = new THREE.Mesh(keystoneGeo, astralArcMaterial);
  omegaKeystoneGroup.add(keystoneFinial);

  const keystoneCollar = new THREE.Mesh(
    new RoundedBoxGeometry(0.09, 0.036, 0.046, 2, 0.008),
    astralHousingMaterial
  );
  keystoneCollar.position.set(0, -0.07, 0);
  omegaKeystoneGroup.add(keystoneCollar);

  // 8-Slot Faceted Extruded Chrono Blades InstancedMesh (Zero-GC per-frame orbit)
  const bladeProfile = new THREE.Shape();
  bladeProfile.moveTo(0, 0.17);
  bladeProfile.lineTo(0.038, 0.03);
  bladeProfile.lineTo(0.022, -0.11);
  bladeProfile.lineTo(0, -0.15);
  bladeProfile.lineTo(-0.022, -0.11);
  bladeProfile.lineTo(-0.038, 0.03);
  bladeProfile.closePath();
  const bladeExtrudeGeo = new THREE.ExtrudeGeometry(bladeProfile, {
    steps: 1,
    depth: 0.018,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.005,
    bevelSegments: 2,
  });
  bladeExtrudeGeo.center();

  const bladesInstancedMesh = new THREE.InstancedMesh(bladeExtrudeGeo, astralBladeMaterial, 8);
  bladesInstancedMesh.frustumCulled = false;
  bladesInstancedMesh.count = 0;
  const initDummy = new THREE.Object3D();
  const initCol = new THREE.Color(0x67e8f9);
  for (let b = 0; b < 8; b += 1) {
    const ba = (b / 8) * Math.PI * 2;
    initDummy.position.set(Math.cos(ba) * 0.78, Math.sin(ba) * 0.78, 0);
    initDummy.rotation.set(0, 0, ba - Math.PI * 0.5);
    initDummy.scale.setScalar(1);
    initDummy.updateMatrix();
    bladesInstancedMesh.setMatrixAt(b, initDummy.matrix);
    bladesInstancedMesh.setColorAt(b, initCol);
  }
  bladesInstancedMesh.instanceMatrix.needsUpdate = true;
  if (bladesInstancedMesh.instanceColor) {
    bladesInstancedMesh.instanceColor.needsUpdate = true;
  }
  bladesInstancedMesh.computeBoundingSphere();
  astralCrownGroup.add(bladesInstancedMesh);

  const astralCrownRig: SovereignAstralCrownRig = {
    group: astralCrownGroup,
    outerAstrolabeArc,
    innerGimbalArc,
    omegaKeystoneGroup,
    bladesInstancedMesh,
    arcMaterial: astralArcMaterial,
    bladeMaterial: astralBladeMaterial,
  };

  // --- 4. Sera Venn Sculpted Head, Dark Tactical Crown & Translucent Cyan Holographic Visor ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.72, 0.02);
  torsoPivot.add(headGroup);

  const neckMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.078, 0.098, 0.16, 14),
    navySuitMat
  );
  neckMesh.position.set(0, -0.14, -0.01);
  headGroup.add(neckMesh);

  // Sculpted lower face / head form
  const helmetDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.185, 22, 18),
    faceSkinMat
  );
  helmetDome.scale.set(0.88, 1.04, 0.98);
  helmetDome.castShadow = enableShadows;
  headGroup.add(helmetDome);

  // Dark swept hair / tactical crown cap over upper & rear skull
  const hairCrown = new THREE.Mesh(
    new THREE.SphereGeometry(0.194, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
    hairCapMat
  );
  hairCrown.scale.set(0.92, 1.02, 1.04);
  hairCrown.rotation.x = -0.22;
  hairCrown.position.set(0, 0.02, -0.015);
  headGroup.add(hairCrown);

  const helmetCrest = new THREE.Mesh(
    new RoundedBoxGeometry(0.16, 0.07, 0.24, 3, 0.025),
    graphiteJointMat
  );
  helmetCrest.position.set(0, 0.145, -0.02);
  helmetCrest.rotation.x = -0.12;
  headGroup.add(helmetCrest);

  // Translucent Glowing Cyan Wrap-Around Holographic Visor (Concept Panel 1 signature)
  const visorMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.196, 0.19, 0.108, 24, 1, true, -Math.PI * 0.36, Math.PI * 0.72),
    darkVisorMat
  );
  visorMesh.position.set(0, 0.032, 0.018);
  headGroup.add(visorMesh);

  const visorOpticLine = new THREE.Mesh(
    new THREE.TorusGeometry(0.198, 0.012, 8, 28, Math.PI * 0.72),
    chronoCyanMat
  );
  visorOpticLine.rotation.x = Math.PI / 2;
  visorOpticLine.rotation.z = -Math.PI * 0.36;
  visorOpticLine.position.set(0, 0.078, 0.018);
  headGroup.add(visorOpticLine);

  // Compact White-Silver Side Comms Ear Pods
  for (const side of [-1, 1]) {
    const earPod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.048, 0.044, 12),
      silverArmorMat
    );
    earPod.rotation.z = Math.PI / 2;
    earPod.position.set(side * 0.175, 0.025, 0.0);
    headGroup.add(earPod);

    const earGlow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.048, 10),
      chronoCyanMat
    );
    earGlow.rotation.z = Math.PI / 2;
    earGlow.position.set(side * 0.178, 0.025, 0.0);
    headGroup.add(earGlow);
  }

  // --- Sheet 13 Panel 7: SOVEREIGN PRIME Radiant Golden Crown Halo (visible when sovereign_gold equipped) ---
  const sovereignCrownHaloGroup = new THREE.Group();
  sovereignCrownHaloGroup.position.set(0, 0.25, -0.02);
  sovereignCrownHaloGroup.rotation.x = -0.18;
  sovereignCrownHaloGroup.visible = false;
  headGroup.add(sovereignCrownHaloGroup);

  const sovereignHaloMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 2.35,
    roughness: 0.14,
    metalness: 0.85,
  });
  const sovereignRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.026, 10, 32),
    sovereignHaloMat
  );
  sovereignRing.rotation.x = Math.PI * 0.5;
  sovereignCrownHaloGroup.add(sovereignRing);

  // 4 radiating star-spurs around the Sovereign Prime halo ring
  for (let sp = 0; sp < 4; sp++) {
    const sa = (sp / 4) * Math.PI * 2 + Math.PI * 0.25;
    const spur = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.13, 4), sovereignHaloMat);
    spur.position.set(Math.cos(sa) * 0.285, 0, Math.sin(sa) * 0.285);
    spur.rotation.z = -Math.PI * 0.5;
    spur.rotation.y = -sa;
    sovereignCrownHaloGroup.add(spur);
  }

  // --- Sheet 13 Panel 8: PARADOX PRISM Angled Crystalline Helmet Ear-Fins & Shoulder Crystal Shards ---
  const prismMagentaMat = new THREE.MeshStandardMaterial({
    color: 0xf5d0fe,
    emissive: 0xe879f9,
    emissiveIntensity: 2.55,
    roughness: 0.1,
    metalness: 0.25,
    flatShading: true,
  });
  const prismCyanMat = new THREE.MeshStandardMaterial({
    color: 0xa5f3fc,
    emissive: 0x22d3ee,
    emissiveIntensity: 2.55,
    roughness: 0.1,
    metalness: 0.25,
    flatShading: true,
  });

  const paradoxPrismHeadFinsGroup = new THREE.Group();
  paradoxPrismHeadFinsGroup.visible = false;
  headGroup.add(paradoxPrismHeadFinsGroup);

  for (const side of [-1, 1]) {
    const earFin = new THREE.Mesh(new THREE.OctahedronGeometry(0.088, 0), prismCyanMat);
    earFin.scale.set(0.42, 2.35, 0.72);
    earFin.position.set(side * 0.2, 0.19, -0.04);
    earFin.rotation.z = -side * 0.42;
    earFin.rotation.x = -0.32;
    paradoxPrismHeadFinsGroup.add(earFin);
  }

  const paradoxPrismSpikesGroup = new THREE.Group();
  paradoxPrismSpikesGroup.visible = false;
  torsoPivot.add(paradoxPrismSpikesGroup);

  // Bold diagonal faceted magenta-cyan prism crystal clusters jutting from both shoulders
  for (const side of [-1, 1]) {
    const primaryShard = new THREE.Mesh(new THREE.OctahedronGeometry(0.155, 0), prismMagentaMat);
    primaryShard.scale.set(0.48, 2.6, 0.56);
    primaryShard.position.set(side * 0.52, 0.68, -0.02);
    primaryShard.rotation.z = -side * 0.62;
    primaryShard.rotation.x = -0.14;
    paradoxPrismSpikesGroup.add(primaryShard);

    const secondaryShard = new THREE.Mesh(new THREE.OctahedronGeometry(0.125, 0), prismCyanMat);
    secondaryShard.scale.set(0.46, 2.15, 0.52);
    secondaryShard.position.set(side * 0.59, 0.56, 0.06);
    secondaryShard.rotation.z = -side * 0.94;
    secondaryShard.rotation.x = 0.16;
    paradoxPrismSpikesGroup.add(secondaryShard);

    const rearShard = new THREE.Mesh(new THREE.OctahedronGeometry(0.105, 0), prismCyanMat);
    rearShard.scale.set(0.46, 1.9, 0.46);
    rearShard.position.set(side * 0.45, 0.64, -0.12);
    rearShard.rotation.z = -side * 0.42;
    rearShard.rotation.x = -0.38;
    paradoxPrismSpikesGroup.add(rearShard);

    // Iridescent chest V-vein highlights
    const chestVein = new THREE.Mesh(
      new RoundedBoxGeometry(0.2, 0.034, 0.035, 1, 0.008),
      side < 0 ? prismCyanMat : prismMagentaMat
    );
    chestVein.position.set(side * 0.13, 0.38, 0.198);
    chestVein.rotation.z = -side * 0.48;
    paradoxPrismSpikesGroup.add(chestVein);
  }

  // --- Sheet 13 Panel 5: MED-NANITE INJECTOR holstered on Sera's left hip ---
  const naniteCanisterGroup = new THREE.Group();
  naniteCanisterGroup.position.set(-0.27, 0.05, 0.06);
  naniteCanisterGroup.rotation.set(0.32, 0.15, 0.24);
  naniteCanisterGroup.visible = false;
  pelvisPivot.add(naniteCanisterGroup);

  const naniteBodyMat = new THREE.MeshStandardMaterial({
    color: 0x3b4859,
    roughness: 0.32,
    metalness: 0.84,
  });
  const naniteGoldMat = new THREE.MeshStandardMaterial({
    color: 0xd9a844,
    roughness: 0.24,
    metalness: 0.9,
  });
  const naniteEmeraldMat = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x10b981,
    emissiveIntensity: 2.1,
    roughness: 0.14,
    metalness: 0.18,
  });
  const naniteCrossMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 2.0,
    roughness: 0.14,
    metalness: 0.2,
  });

  // Tactical titanium canister housing + glowing emerald nanite fluid glass chamber
  const naniteLower = new THREE.Mesh(
    new THREE.CylinderGeometry(0.036, 0.024, 0.09, 12),
    naniteBodyMat
  );
  naniteLower.position.y = -0.14;
  naniteCanisterGroup.add(naniteLower);

  const naniteNozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.01, 0.05, 10),
    naniteGoldMat
  );
  naniteNozzle.position.y = -0.2;
  naniteCanisterGroup.add(naniteNozzle);

  const naniteCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.034, 0.034, 0.16, 12),
    naniteEmeraldMat
  );
  naniteCore.position.y = -0.02;
  naniteCanisterGroup.add(naniteCore);

  // Twin side titanium ribs framing the glass window
  for (const sx of [-0.036, 0.036]) {
    const rib = new THREE.Mesh(new RoundedBoxGeometry(0.014, 0.17, 0.022, 1, 0.004), naniteBodyMat);
    rib.position.set(sx, -0.02, 0);
    naniteCanisterGroup.add(rib);
  }

  // Brushed gold winged trigger collar
  const naniteCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.044, 0.055, 12),
    naniteGoldMat
  );
  naniteCollar.position.y = 0.085;
  naniteCanisterGroup.add(naniteCollar);

  const naniteWings = new THREE.Mesh(
    new RoundedBoxGeometry(0.145, 0.024, 0.034, 1, 0.006),
    naniteGoldMat
  );
  naniteWings.position.y = 0.09;
  naniteCanisterGroup.add(naniteWings);

  // Top dark cap with glowing cyan medical cross
  const naniteCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.044, 0.065, 12),
    naniteBodyMat
  );
  naniteCap.position.y = 0.14;
  naniteCanisterGroup.add(naniteCap);

  const crossBarA = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.014, 0.012), naniteCrossMat);
  crossBarA.position.set(0, 0.14, 0.042);
  naniteCanisterGroup.add(crossBarA);
  const crossBarB = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.042, 0.012), naniteCrossMat);
  crossBarB.position.set(0, 0.14, 0.042);
  naniteCanisterGroup.add(crossBarB);

  // --- Sheet 13 Panel 6: AEGIS SHIELD HEXAGONAL EMITTER HUB mounted on Sera's belt ---
  const aegisEmitterGroup = new THREE.Group();
  aegisEmitterGroup.position.set(0.26, 0.08, -0.06);
  aegisEmitterGroup.rotation.y = Math.PI * 0.32;
  aegisEmitterGroup.visible = false;
  pelvisPivot.add(aegisEmitterGroup);

  const emitterBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.085, 0.07, 6),
    naniteBodyMat
  );
  emitterBody.rotation.x = Math.PI * 0.5;
  aegisEmitterGroup.add(emitterBody);

  const emitterRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.065, 0.014, 6, 6),
    silverArmorMat
  );
  emitterRim.position.z = 0.038;
  aegisEmitterGroup.add(emitterRim);

  const emitterLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.044, 0.044, 0.025, 6),
    naniteCrossMat
  );
  emitterLens.rotation.x = Math.PI * 0.5;
  emitterLens.position.z = 0.036;
  aegisEmitterGroup.add(emitterLens);

  // --- 5. Left Arm, Pauldron Pivot & Integrated Forearm Pulsecaster Gauntlet ---
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.34, 0.45, 0);
  torsoPivot.add(leftArmPivot);

  const leftPauldronPivot = new THREE.Group();
  leftPauldronPivot.position.set(-0.04, 0.03, 0);
  leftArmPivot.add(leftPauldronPivot);

  const leftPauldron = new THREE.Mesh(
    new THREE.SphereGeometry(0.158, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.62),
    silverArmorMat
  );
  leftPauldron.rotation.z = 0.42;
  leftPauldron.castShadow = enableShadows;
  leftPauldronPivot.add(leftPauldron);

  const leftPauldronTrim = new THREE.Mesh(
    new THREE.TorusGeometry(0.145, 0.016, 8, 20),
    warmBronzeMat
  );
  leftPauldronTrim.rotation.x = Math.PI * 0.42;
  leftPauldronTrim.rotation.y = 0.35;
  leftPauldronPivot.add(leftPauldronTrim);

  const leftUpperArm = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.076, 0.2, 8, 12),
    navySuitMat
  );
  leftUpperArm.position.set(-0.03, -0.15, 0);
  leftArmPivot.add(leftUpperArm);

  const leftForearmPivot = new THREE.Group();
  leftForearmPivot.position.set(-0.03, -0.3, 0.02);
  leftArmPivot.add(leftForearmPivot);

  const leftElbow = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 12), graphiteJointMat);
  leftForearmPivot.add(leftElbow);

  const leftForearm = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.074, 0.2, 8, 12),
    silverArmorMat
  );
  leftForearm.position.set(0, -0.14, 0.05);
  leftForearm.rotation.x = 0.35;
  leftForearmPivot.add(leftForearm);

  // PULSECASTER — Tactical White/Charcoal Energy Carbine (Sheet 3, Panel 2 Match)
  const pulsecasterMaterial = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.65,
    roughness: 0.14,
    metalness: 0.45,
  });
  const amberHeatVentMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xea580c,
    emissiveIntensity: 1.75,
    roughness: 0.18,
    metalness: 0.38,
  });
  const pulsecasterGroup = new THREE.Group();
  pulsecasterGroup.position.set(-0.04, -0.18, 0.18);
  pulsecasterGroup.rotation.x = 0.35;
  leftForearmPivot.add(pulsecasterGroup);

  // Matte-White Upper Receiver + Charcoal Lower Frame
  const pulsecasterUpper = new THREE.Mesh(
    new RoundedBoxGeometry(0.11, 0.11, 0.5, 2, 0.025),
    silverArmorMat
  );
  pulsecasterUpper.position.set(0, 0.04, 0.04);
  pulsecasterGroup.add(pulsecasterUpper);

  const pulsecasterLower = new THREE.Mesh(
    new RoundedBoxGeometry(0.095, 0.09, 0.42, 2, 0.02),
    graphiteJointMat
  );
  pulsecasterLower.position.set(0, -0.04, 0.02);
  pulsecasterGroup.add(pulsecasterLower);

  // Glowing Cyan Electromagnetic Barrel Rails (pulsecasterCore)
  const pulsecasterCore = new THREE.Mesh(
    new RoundedBoxGeometry(0.125, 0.044, 0.34, 2, 0.012),
    pulsecasterMaterial
  );
  pulsecasterCore.position.set(0, 0.025, 0.14);
  pulsecasterGroup.add(pulsecasterCore);

  // Glowing Amber Underbarrel Heat-Vent Coils + Curved Forward Magazine
  for (let v = 0; v < 4; v++) {
    const heatVent = new THREE.Mesh(
      new RoundedBoxGeometry(0.098, 0.022, 0.03, 1, 0.005),
      amberHeatVentMat
    );
    heatVent.position.set(0, -0.072, 0.04 + v * 0.052);
    pulsecasterGroup.add(heatVent);
  }
  const pulseMag = new THREE.Mesh(
    new RoundedBoxGeometry(0.064, 0.16, 0.085, 2, 0.015),
    graphiteJointMat
  );
  pulseMag.position.set(0, -0.13, 0.05);
  pulseMag.rotation.x = 0.25;
  pulsecasterGroup.add(pulseMag);

  const pulseMuzzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.036, 0.042, 0.1, 12),
    graphiteJointMat
  );
  pulseMuzzle.rotation.x = Math.PI / 2;
  pulseMuzzle.position.set(0, 0.015, 0.31);
  pulsecasterGroup.add(pulseMuzzle);

  // --- 6. Right Arm, Pauldron Pivot, Wrist WeaponPivot & Concept 3D Weapon Arsenal ---
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.34, 0.45, 0);
  torsoPivot.add(rightArmPivot);

  const rightPauldronPivot = new THREE.Group();
  rightPauldronPivot.position.set(0.04, 0.03, 0);
  rightArmPivot.add(rightPauldronPivot);

  const rightPauldron = new THREE.Mesh(
    new THREE.SphereGeometry(0.162, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.62),
    silverArmorMat
  );
  rightPauldron.rotation.z = -0.42;
  rightPauldron.castShadow = enableShadows;
  rightPauldronPivot.add(rightPauldron);

  const rightPauldronTrim = new THREE.Mesh(
    new THREE.TorusGeometry(0.148, 0.016, 8, 20),
    warmBronzeMat
  );
  rightPauldronTrim.rotation.x = Math.PI * 0.42;
  rightPauldronTrim.rotation.y = -0.35;
  rightPauldronPivot.add(rightPauldronTrim);

  const rightUpperArm = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.078, 0.2, 8, 12),
    navySuitMat
  );
  rightUpperArm.position.set(0.03, -0.15, 0);
  rightArmPivot.add(rightUpperArm);

  const rightForearmPivot = new THREE.Group();
  rightForearmPivot.position.set(0.03, -0.3, 0.02);
  rightArmPivot.add(rightForearmPivot);

  const rightElbow = new THREE.Mesh(new THREE.SphereGeometry(0.074, 12, 12), graphiteJointMat);
  rightForearmPivot.add(rightElbow);

  const rightForearm = new THREE.Mesh(
    new RoundedBoxGeometry(0.155, 0.28, 0.165, 3, 0.045),
    silverArmorMat
  );
  rightForearm.position.set(0, -0.14, 0.04);
  rightForearmPivot.add(rightForearm);

  // Articulated Wrist / Weapon Pivot (allows distinct blade angles across Light 1, Light 2, Finisher & Heavy Cleave)
  const weaponPivot = new THREE.Group();
  weaponPivot.position.set(0, -0.22, 0.18);
  rightForearmPivot.add(weaponPivot);

  // CHRONO EDGE — Matte-White & Gunmetal Katana with Circular Cyan Chrono-Ring Guard (Sheet 3, Panel 1)
  const hiltGrip = new THREE.Mesh(
    new RoundedBoxGeometry(0.068, 0.095, 0.46, 2, 0.024),
    silverArmorMat
  );
  weaponPivot.add(hiltGrip);

  const hiltWrap = new THREE.Mesh(
    new RoundedBoxGeometry(0.074, 0.06, 0.26, 2, 0.015),
    graphiteJointMat
  );
  hiltWrap.position.set(0, -0.01, -0.02);
  weaponPivot.add(hiltWrap);

  // Signature Circular Glowing Cyan Chrono-Ring Handguard
  const chronoGuardOuter = new THREE.Mesh(
    new THREE.TorusGeometry(0.135, 0.028, 12, 28),
    silverArmorMat
  );
  chronoGuardOuter.rotation.y = Math.PI / 2;
  chronoGuardOuter.position.set(0, 0.01, 0.26);
  weaponPivot.add(chronoGuardOuter);

  const chronoGuardGlow = new THREE.Mesh(
    new THREE.TorusGeometry(0.102, 0.02, 10, 24),
    chronoCyanMat
  );
  chronoGuardGlow.rotation.y = Math.PI / 2;
  chronoGuardGlow.position.set(0, 0.01, 0.26);
  weaponPivot.add(chronoGuardGlow);

  // Tapered Metallic Katana Spine Backing
  const bladeSpine = new THREE.Mesh(
    new RoundedBoxGeometry(0.042, 0.066, 1.05, 2, 0.016),
    graphiteJointMat
  );
  bladeSpine.position.set(0, 0.042, 0.84);
  weaponPivot.add(bladeSpine);

  // Razor-Sharp Translucent Ice-Cyan Plasma Katana Blade
  const bladeMaterial = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.95,
    roughness: 0.1,
    metalness: 0.52,
  });
  const customBladeGeo = createCurvedBladeGeometry(1.58, 0.2, 0.04);
  const bladeMesh = new THREE.Mesh(customBladeGeo, bladeMaterial);
  bladeMesh.position.set(0.015, -0.02, 0.32);
  weaponPivot.add(bladeMesh);

  // PHASE-BLADE MK.II — Overclocked High-Frequency Katana with Golden Gyro-Ring Tsuba & Dual Cyan-Gold Plasma Edge (Sheet 11, Panel 5)
  const phaseBladeMk2Group = new THREE.Group();
  phaseBladeMk2Group.visible = false;
  weaponPivot.add(phaseBladeMk2Group);
  const mk2GoldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 1.15,
    roughness: 0.18,
    metalness: 0.84,
  });
  const mk2CyanEdgeMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x22d3ee,
    emissiveIntensity: 2.25,
    roughness: 0.08,
    metalness: 0.45,
  });
  const mk2TsubaRing = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.022, 8, 20), mk2GoldMat);
  mk2TsubaRing.position.set(0, 0.01, 0.27);
  phaseBladeMk2Group.add(mk2TsubaRing);
  const mk2GoldCore = new THREE.Mesh(createCurvedBladeGeometry(1.68, 0.21, 0.042), mk2GoldMat);
  mk2GoldCore.position.set(0.014, -0.026, 0.31);
  phaseBladeMk2Group.add(mk2GoldCore);
  const mk2CyanEdge = new THREE.Mesh(createCurvedBladeGeometry(1.74, 0.12, 0.028), mk2CyanEdgeMat);
  mk2CyanEdge.position.set(0.016, 0.024, 0.33);
  phaseBladeMk2Group.add(mk2CyanEdge);
  const mk2Pommel = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.028, 0.09, 8), mk2GoldMat);
  mk2Pommel.rotation.x = Math.PI * 0.5;
  mk2Pommel.position.set(0, 0.01, -0.17);
  phaseBladeMk2Group.add(mk2Pommel);

  // PHASE RAIL — Twin Black-Chrome Magnetic Railgun + Ice-Blue Core Strips + Optic Scope (Sheet 3, Panel 3)
  const phaseRailGroup = new THREE.Group();
  phaseRailGroup.visible = false;
  weaponPivot.add(phaseRailGroup);

  const railReceiver = new THREE.Mesh(
    new RoundedBoxGeometry(0.11, 0.16, 0.68, 2, 0.025),
    graphiteJointMat
  );
  railReceiver.position.set(0, 0, 0.24);
  phaseRailGroup.add(railReceiver);

  // Boxy White-and-Gunmetal Top Holographic Scope
  const railScopeHousing = new THREE.Mesh(
    new RoundedBoxGeometry(0.09, 0.095, 0.28, 2, 0.02),
    silverArmorMat
  );
  railScopeHousing.position.set(0, 0.14, 0.34);
  phaseRailGroup.add(railScopeHousing);

  const railScopeLens = new THREE.Mesh(
    new THREE.BoxGeometry(0.072, 0.055, 0.03),
    chronoCyanMat
  );
  railScopeLens.position.set(0, 0.14, 0.48);
  phaseRailGroup.add(railScopeLens);

  // Twin Extended Black-Chrome Magnetic Accelerator Barrels
  const railBarrelTop = new THREE.Mesh(
    new RoundedBoxGeometry(0.068, 0.058, 1.85, 2, 0.014),
    graphiteJointMat
  );
  railBarrelTop.position.set(0, 0.065, 1.18);
  phaseRailGroup.add(railBarrelTop);

  const railBarrelBottom = new THREE.Mesh(
    new RoundedBoxGeometry(0.068, 0.058, 1.78, 2, 0.014),
    graphiteJointMat
  );
  railBarrelBottom.position.set(0, -0.065, 1.14);
  phaseRailGroup.add(railBarrelBottom);

  // Glowing Ice-Blue Energy Core Strip Sandwiched Between Twin Rails
  const railCoreBeam = new THREE.Mesh(
    new RoundedBoxGeometry(0.044, 0.052, 1.72, 2, 0.01),
    chronoCyanMat
  );
  railCoreBeam.position.set(0, 0, 1.14);
  phaseRailGroup.add(railCoreBeam);

  const phaseRailCoils: THREE.Mesh[] = [];
  for (const rz of [0.68, 1.24, 1.78]) {
    const railCoil = new THREE.Mesh(
      new THREE.TorusGeometry(0.082, 0.014, 8, 20),
      rz === 1.24 ? chronoCyanMat : silverArmorMat
    );
    railCoil.position.set(0, 0, rz);
    phaseRailGroup.add(railCoil);
    phaseRailCoils.push(railCoil);
  }

  // GRAV-BREAKER — Heavy Dark-Titanium Kinetic Warhammer with Molten-Amber Singularity Core (Sheet 3, Panel 4)
  const gravBreakerGroup = new THREE.Group();
  gravBreakerGroup.visible = false;
  weaponPivot.add(gravBreakerGroup);

  const moltenAmberMat = new THREE.MeshStandardMaterial({
    color: 0xfde047,
    emissive: 0xf97316,
    emissiveIntensity: 2.35,
    roughness: 0.12,
    metalness: 0.25,
  });

  const maulHaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.042, 0.048, 1.56, 12),
    graphiteJointMat
  );
  maulHaft.rotation.x = Math.PI / 2;
  maulHaft.position.set(0, 0, 0.68);
  gravBreakerGroup.add(maulHaft);

  for (const cz of [0.12, 0.98, 1.16]) {
    const collar = new THREE.Mesh(
      new THREE.TorusGeometry(0.062, 0.016, 8, 16),
      warmBronzeMat
    );
    collar.position.set(0, 0, cz);
    gravBreakerGroup.add(collar);
  }

  // Brutal Chamfered Dark-Titanium Warhammer Head + Impact Flanges
  const maulHead = new THREE.Mesh(
    new RoundedBoxGeometry(0.58, 0.42, 0.5, 3, 0.06),
    graphiteJointMat
  );
  maulHead.position.set(0, 0, 1.44);
  gravBreakerGroup.add(maulHead);

  for (const side of [-1, 1]) {
    const strikePlate = new THREE.Mesh(
      new RoundedBoxGeometry(0.14, 0.48, 0.56, 2, 0.04),
      silverArmorMat
    );
    strikePlate.position.set(side * 0.3, 0, 1.44);
    gravBreakerGroup.add(strikePlate);

    const sidePiston = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, 0.34, 8),
      warmBronzeMat
    );
    sidePiston.rotation.x = Math.PI / 2;
    sidePiston.position.set(side * 0.16, 0.06, 1.15);
    gravBreakerGroup.add(sidePiston);
  }

  // Blazing Molten-Amber Gravity Singularity Core Recessed in Center of Head
  const gravBreakerOrbs: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    const coreRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.155, 0.028, 10, 24),
      warmBronzeMat
    );
    coreRing.position.set(0, 0, 1.44 + side * 0.25);
    gravBreakerGroup.add(coreRing);
    gravBreakerOrbs.push(coreRing);
  }
  const maulCoreSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.145, 16, 14),
    moltenAmberMat
  );
  maulCoreSphere.scale.set(1, 1, 1.85);
  maulCoreSphere.position.set(0, 0, 1.44);
  gravBreakerGroup.add(maulCoreSphere);
  gravBreakerOrbs.push(maulCoreSphere);

  // =========================================================================
  // CHRONO SCYTHE — Curved Ceramic-White & Gold Plasma Crescent Polearm (Sheet 14, Panel 1)
  // =========================================================================
  const chronoScytheGroup = new THREE.Group();
  chronoScytheGroup.visible = false;
  weaponPivot.add(chronoScytheGroup);

  const scytheShaftLower = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.038, 1.05, 12),
    graphiteJointMat
  );
  scytheShaftLower.rotation.x = Math.PI * 0.5;
  scytheShaftLower.position.set(0, 0, 0.35);
  chronoScytheGroup.add(scytheShaftLower);

  const scytheShaftUpper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.036, 0.032, 0.86, 12),
    silverArmorMat
  );
  scytheShaftUpper.rotation.x = Math.PI * 0.5 - 0.14;
  scytheShaftUpper.position.set(0, 0.06, 1.24);
  chronoScytheGroup.add(scytheShaftUpper);

  const scythePommel = new THREE.Mesh(
    new THREE.ConeGeometry(0.052, 0.18, 8),
    warmBronzeMat
  );
  scythePommel.rotation.x = -Math.PI * 0.5;
  scythePommel.position.set(0, 0, -0.24);
  chronoScytheGroup.add(scythePommel);

  for (const sz of [0.08, 0.86, 1.56]) {
    const scCollar = new THREE.Mesh(
      new THREE.TorusGeometry(0.056, 0.015, 8, 16),
      warmBronzeMat
    );
    scCollar.position.set(0, sz > 1.0 ? 0.11 : 0, sz);
    chronoScytheGroup.add(scCollar);
  }

  // Sculpted sweeping crescent plasma blade (cyan outer edge + violet core) matching Sheet 14 Panel 1
  const scytheBladeShape = new THREE.Shape();
  scytheBladeShape.moveTo(0, 0);
  scytheBladeShape.quadraticCurveTo(0.42, 0.26, 0.96, 0.18);
  scytheBladeShape.quadraticCurveTo(1.38, 0.08, 1.54, -0.44);
  scytheBladeShape.quadraticCurveTo(1.06, -0.08, 0.58, -0.05);
  scytheBladeShape.quadraticCurveTo(0.24, -0.04, 0, -0.14);
  scytheBladeShape.closePath();

  const scythePlasmaMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 2.35,
    roughness: 0.12,
    metalness: 0.2,
    side: THREE.DoubleSide,
  });
  const scytheVioletMat = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0x9333ea,
    emissiveIntensity: 1.85,
    roughness: 0.16,
    metalness: 0.25,
    side: THREE.DoubleSide,
  });

  const scytheBladeMesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(scytheBladeShape, {
      depth: 0.036,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 2,
    }),
    scythePlasmaMat
  );
  scytheBladeMesh.rotation.y = Math.PI * 0.5;
  scytheBladeMesh.rotation.x = 0.08;
  scytheBladeMesh.position.set(-0.02, 0.16, 1.62);
  chronoScytheGroup.add(scytheBladeMesh);

  const scytheCoreRib = new THREE.Mesh(
    new THREE.ExtrudeGeometry(scytheBladeShape, {
      depth: 0.048,
      bevelEnabled: false,
    }),
    scytheVioletMat
  );
  scytheCoreRib.scale.set(0.76, 0.65, 1);
  scytheCoreRib.rotation.y = Math.PI * 0.5;
  scytheCoreRib.rotation.x = 0.08;
  scytheCoreRib.position.set(-0.024, 0.18, 1.6);
  chronoScytheGroup.add(scytheCoreRib);

  // Ceramic-white dorsal spine hood over the scythe neck
  const scytheSpine = new THREE.Mesh(
    new RoundedBoxGeometry(0.11, 0.14, 0.42, 2, 0.03),
    silverArmorMat
  );
  scytheSpine.position.set(0, 0.2, 1.56);
  chronoScytheGroup.add(scytheSpine);

  // Floating miniature brushed-gold Chrono Halo Ring above the scythe head joint
  const chronoScytheHaloRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.022, 10, 28),
    warmBronzeMat
  );
  chronoScytheHaloRing.position.set(0, 0.42, 1.58);
  chronoScytheGroup.add(chronoScytheHaloRing);

  // =========================================================================
  // WEAPON MOD SOCKET CHIPS — Mounted on Dorsal Chrono Rig (Sheet 14, Panels 2, 3, 4)
  // =========================================================================
  const modChipSocketGroup = new THREE.Group();
  modChipSocketGroup.position.set(0, 0.04, -0.14);
  modChipSocketGroup.visible = false;
  chronoRigPivot.add(modChipSocketGroup);

  const chipBodyGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.055, 6);
  const chipPinGeo = new THREE.BoxGeometry(0.032, 0.018, 0.075);

  // Panel 2: VOLT ARC CHIP (Electric Cyan twin coils + gold pins)
  const modChipVoltGroup = new THREE.Group();
  modChipVoltGroup.visible = false;
  modChipSocketGroup.add(modChipVoltGroup);
  const voltBase = new THREE.Mesh(chipBodyGeo, graphiteJointMat);
  voltBase.rotation.x = Math.PI * 0.5;
  modChipVoltGroup.add(voltBase);
  const voltMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 2.5,
    roughness: 0.14,
    metalness: 0.25,
  });
  for (const sx of [-0.045, 0.045]) {
    const coil = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.012, 6, 14), voltMat);
    coil.position.set(sx, 0, -0.034);
    modChipVoltGroup.add(coil);
  }
  for (const px of [-0.055, 0, 0.055]) {
    const pin = new THREE.Mesh(chipPinGeo, warmBronzeMat);
    pin.position.set(px, -0.14, 0);
    modChipVoltGroup.add(pin);
  }

  // Panel 3: SIPHON LEECH CHIP (Bio-Emerald bubbling core + obsidian hex housing)
  const modChipSiphonGroup = new THREE.Group();
  modChipSiphonGroup.visible = false;
  modChipSocketGroup.add(modChipSiphonGroup);
  const siphonBase = new THREE.Mesh(chipBodyGeo, graphiteJointMat);
  siphonBase.rotation.x = Math.PI * 0.5;
  modChipSiphonGroup.add(siphonBase);
  const siphonMat = new THREE.MeshStandardMaterial({
    color: 0x6ee7b7,
    emissive: 0x10b981,
    emissiveIntensity: 2.45,
    roughness: 0.12,
    metalness: 0.2,
  });
  const siphonCore = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), siphonMat);
  siphonCore.position.set(0, 0, -0.035);
  modChipSiphonGroup.add(siphonCore);
  for (const px of [-0.055, 0, 0.055]) {
    const pin = new THREE.Mesh(chipPinGeo, warmBronzeMat);
    pin.position.set(px, -0.14, 0);
    modChipSiphonGroup.add(pin);
  }

  // Panel 4: CHRONO NOVA CHIP (Gold-Violet faceted crystal prism + brushed-gold hex bezel)
  const modChipNovaGroup = new THREE.Group();
  modChipNovaGroup.visible = false;
  modChipSocketGroup.add(modChipNovaGroup);
  const novaBase = new THREE.Mesh(chipBodyGeo, warmBronzeMat);
  novaBase.rotation.x = Math.PI * 0.5;
  modChipNovaGroup.add(novaBase);
  const novaMat = new THREE.MeshStandardMaterial({
    color: 0xfde047,
    emissive: 0xd946ef,
    emissiveIntensity: 2.55,
    roughness: 0.1,
    metalness: 0.3,
    flatShading: true,
  });
  const novaPrism = new THREE.Mesh(new THREE.OctahedronGeometry(0.075, 0), novaMat);
  novaPrism.position.set(0, 0, -0.045);
  modChipNovaGroup.add(novaPrism);

  // =========================================================================
  // STYLE SSS CREST — Sleek Tapered Metallic-Gold & Holographic Pinion Crest
  // =========================================================================
  const styleCrestGroup = new THREE.Group();
  styleCrestGroup.position.set(0, 0.92, -0.3);
  styleCrestGroup.visible = false;
  chronoRigPivot.add(styleCrestGroup);

  const styleCrestWingMat = new THREE.MeshStandardMaterial({
    color: 0xe2b95c,
    emissive: 0xd97706,
    emissiveIntensity: 0.95,
    roughness: 0.18,
    metalness: 0.92,
  });
  const styleCrestCyanMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.45,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.78,
  });

  // Tapered diamond crest core
  const crestDiamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.105, 0), styleCrestCyanMat);
  crestDiamond.scale.set(0.62, 1.55, 0.32);
  styleCrestGroup.add(crestDiamond);

  // Tapered swept metallic-gold & translucent cyan pinion blades
  const pinionShape = new THREE.Shape();
  pinionShape.moveTo(0, -0.018);
  pinionShape.lineTo(0.32, 0.026);
  pinionShape.lineTo(0.4, 0);
  pinionShape.lineTo(0.28, -0.022);
  pinionShape.closePath();
  const pinionGeo = new THREE.ExtrudeGeometry(pinionShape, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 1,
  });
  pinionGeo.center();

  for (const side of [-1, 1]) {
    for (let feather = 0; feather < 3; feather++) {
      const wingBlade = new THREE.Mesh(
        pinionGeo,
        feather === 1 ? styleCrestCyanMat : styleCrestWingMat
      );
      const scaleLen = 1.0 - feather * 0.18;
      wingBlade.scale.set(side * scaleLen, 0.9, 1);
      wingBlade.position.set(
        side * (0.22 + feather * 0.03),
        0.1 - feather * 0.085,
        -0.015
      );
      wingBlade.rotation.z = side * (0.42 - feather * 0.15);
      styleCrestGroup.add(wingBlade);
    }
  }

  // Fine holographic cyan halo ring crowning the SSS emblem
  const styleCrestHaloRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.25, 0.011, 10, 40),
    styleCrestCyanMat
  );
  styleCrestHaloRing.position.set(0, 0.22, -0.02);
  styleCrestGroup.add(styleCrestHaloRing);

  // --- 7. 3D-Orientable Feathered Weapon Cleave Trail Arc ---
  const slashArcPivot = new THREE.Group();
  slashArcPivot.position.set(0, 1.12, 0.08);
  root.add(slashArcPivot);

  const slashTex = createSlashArcTexture();
  const slashArcGeo = new THREE.RingGeometry(
    1.12,
    2.98,
    36,
    1,
    -Math.PI * 0.45,
    Math.PI * 0.9
  );
  const slashArcMaterial = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    map: slashTex,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const slashArcMesh = new THREE.Mesh(slashArcGeo, slashArcMaterial);
  slashArcMesh.rotation.x = -Math.PI / 2;
  slashArcPivot.add(slashArcMesh);

  // --- 8. PARRY AEGIS — Hexagonal Translucent Cyan Holographic Buckler & 3-Prong Titanium/Gold Emitter Hub (Sheet 8, Panel 6) ---
  const parryShieldGeo = new THREE.CylinderGeometry(0.92, 0.92, 0.06, 6);
  parryShieldGeo.rotateX(Math.PI / 2);
  const parryShieldMaterial = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const parryShieldMesh = new THREE.Mesh(parryShieldGeo, parryShieldMaterial);
  parryShieldMesh.position.set(0, 1.18, 0.96);
  parryShieldMesh.visible = false;

  // Concentric Chrono holographic ring etchings across the hexagonal Aegis face
  for (const [rIn, rOut, zOff] of [
    [0.84, 0.91, 0.035],
    [0.62, 0.66, 0.036],
    [0.44, 0.47, 0.036],
  ] as const) {
    const aegisRing = new THREE.Mesh(
      new THREE.RingGeometry(rIn, rOut, 6),
      parryShieldMaterial
    );
    aegisRing.position.z = zOff;
    parryShieldMesh.add(aegisRing);
  }

  // Central Dark-Titanium & Antique-Gold 3-Spoked Emitter Hub
  const aegisTitaniumMat = new THREE.MeshStandardMaterial({
    color: 0x242c38,
    roughness: 0.3,
    metalness: 0.86,
  });
  const aegisGoldMat = new THREE.MeshStandardMaterial({
    color: 0xd4ad52,
    roughness: 0.24,
    metalness: 0.9,
  });
  const aegisCenterCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.25, 0.12, 16),
    aegisTitaniumMat
  );
  aegisCenterCore.rotation.x = Math.PI / 2;
  aegisCenterCore.position.z = 0.04;
  parryShieldMesh.add(aegisCenterCore);

  const aegisGoldTrim = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.026, 8, 20),
    aegisGoldMat
  );
  aegisGoldTrim.position.z = 0.1;
  parryShieldMesh.add(aegisGoldTrim);

  const aegisCyanLens = new THREE.Mesh(
    new THREE.CircleGeometry(0.11, 16),
    parryShieldMaterial
  );
  aegisCyanLens.position.z = 0.105;
  parryShieldMesh.add(aegisCyanLens);

  for (let sp = 0; sp < 3; sp++) {
    const spAngle = (sp / 3) * Math.PI * 2 + Math.PI / 2;
    const spokeGroup = new THREE.Group();
    spokeGroup.rotation.z = spAngle;
    const spokeArm = new THREE.Mesh(
      new RoundedBoxGeometry(0.13, 0.44, 0.09, 2, 0.02),
      aegisTitaniumMat
    );
    spokeArm.position.set(0, 0.34, 0.05);
    spokeGroup.add(spokeArm);
    const spokeGoldCap = new THREE.Mesh(
      new RoundedBoxGeometry(0.15, 0.09, 0.105, 1, 0.015),
      aegisGoldMat
    );
    spokeGoldCap.position.set(0, 0.22, 0.052);
    spokeGroup.add(spokeGoldCap);
    parryShieldMesh.add(spokeGroup);
  }
  root.add(parryShieldMesh);

  // --- 9. Ground Heavy Charge Indicator Ring ---
  const chargeRingGeo = new THREE.RingGeometry(0.76, 0.94, 40);
  const chargeRingMaterial = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const chargeRingMesh = new THREE.Mesh(chargeRingGeo, chargeRingMaterial);
  chargeRingMesh.rotation.x = -Math.PI / 2;
  chargeRingMesh.position.y = 0.03;
  root.add(chargeRingMesh);

  // --- 10. Ground Adrenaline Chrono Sync Aura Halo ---
  const chronoAuraGeo = new THREE.RingGeometry(0.56, 0.72, 36);
  const chronoAuraMaterial = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const chronoAuraMesh = new THREE.Mesh(chronoAuraGeo, chronoAuraMaterial);
  chronoAuraMesh.rotation.x = -Math.PI / 2;
  chronoAuraMesh.position.y = 0.024;
  chronoAuraMesh.visible = false;
  root.add(chronoAuraMesh);

  // Reactive Aegis Barrier Shell — Sheet 13 Panel 6 Cyan-Blue Honeycomb Geodesic Dome
  const honeycombTex = createHoneycombShieldTexture();
  const aegisShieldMaterial = new THREE.MeshBasicMaterial({
    color: honeycombTex ? 0xffffff : 0x38bdf8,
    map: honeycombTex ?? undefined,
    transparent: true,
    opacity: 0.42,
    wireframe: !honeycombTex,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const aegisShieldMesh = new THREE.Mesh(
    new THREE.SphereGeometry(1.18, 24, 18),
    aegisShieldMaterial
  );
  aegisShieldMesh.position.y = 1.05;
  aegisShieldMesh.visible = false;

  // Sleek titanium equatorial emitter belt + glowing hexagonal projector node on front of dome
  const aegisEqBand = new THREE.Mesh(
    new THREE.TorusGeometry(1.185, 0.024, 8, 36),
    aegisTitaniumMat
  );
  aegisEqBand.rotation.x = Math.PI * 0.5;
  aegisShieldMesh.add(aegisEqBand);

  const aegisHexProjector = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.2, 0.09, 6),
    aegisTitaniumMat
  );
  aegisHexProjector.rotation.x = Math.PI * 0.5;
  aegisHexProjector.position.set(0, 0, 1.18);
  aegisShieldMesh.add(aegisHexProjector);

  const aegisHexLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.1, 6),
    new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.92 })
  );
  aegisHexLens.rotation.x = Math.PI * 0.5;
  aegisHexLens.position.set(0, 0, 1.19);
  aegisShieldMesh.add(aegisHexLens);

  root.add(aegisShieldMesh);

  const customMeshySlot = new THREE.Group();
  customMeshySlot.name = 'PlayerCustomMeshySlot';
  customMeshySlot.visible = false;
  root.add(customMeshySlot);

  return {
    root,
    bodyGroup,
    customMeshySlot,
    pelvisPivot,
    torsoPivot,
    torsoMesh,
    headGroup,
    chronoRigPivot,
    chronoRingMesh,
    chronoInnerRingMesh,
    visorMesh,
    rightArmPivot,
    rightPauldronPivot,
    rightForearmPivot,
    weaponPivot,
    leftArmPivot,
    leftPauldronPivot,
    leftForearmPivot,
    leftLegPivot: leftLeg.hipPivot,
    leftShinPivot: leftLeg.shinPivot,
    leftFootPivot: leftLeg.footPivot,
    rightLegPivot: rightLeg.hipPivot,
    rightShinPivot: rightLeg.shinPivot,
    rightFootPivot: rightLeg.footPivot,
    bladeMesh,
    bladeMaterial,
    armorMaterial: silverArmorMat,
    suitMaterial: navySuitMat,
    visorMaterial: darkVisorMat,
    phaseBladeMk2Group,
    chronoAccentMaterial: chronoCyanMat,
    aegisShieldMesh,
    aegisShieldMaterial,
    aegisEmitterGroup,
    naniteCanisterGroup,
    sovereignCrownHaloGroup,
    astralCrownRig,
    paradoxPrismSpikesGroup,
    paradoxPrismHeadFinsGroup,
    phaseRailGroup,
    phaseRailCoils,
    gravBreakerGroup,
    gravBreakerOrbs,
    chronoScytheGroup,
    chronoScytheHaloRing,
    modChipSocketGroup,
    modChipVoltGroup,
    modChipSiphonGroup,
    modChipNovaGroup,
    styleCrestGroup,
    styleCrestHaloRing,
    styleCrestWingMat,
    pulsecasterCoreMesh: pulsecasterCore,
    pulsecasterMaterial,
    slashArcPivot,
    slashArcMesh,
    slashArcMaterial,
    parryShieldMesh,
    parryShieldMaterial,
    chargeRingMesh,
    chargeRingMaterial,
    chronoAuraMesh,
    chronoAuraMaterial,
  };
}

/**
 * Creates a lightweight holographic afterimage silhouette used to render delayed
 * temporal echoes behind the active Echo actor during playback.
 */
export function createEchoAfterimageGhost(opacity: number): EchoAfterimageGhost {
  const root = new THREE.Group();
  root.visible = false;
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const material = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const torsoPivot = new THREE.Group();
  torsoPivot.position.set(0, 1.02, 0);
  bodyGroup.add(torsoPivot);

  const torso = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.54, 0.34, 2, 0.08), material);
  torso.position.set(0, 0.28, 0);
  torsoPivot.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8), material);
  head.position.set(0, 0.72, 0.02);
  torsoPivot.add(head);

  const chronoRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.035, 8, 20), material);
  chronoRing.position.set(0, 0.32, -0.26);
  torsoPivot.add(chronoRing);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.34, 0.45, 0);
  torsoPivot.add(rightArmPivot);
  const rightArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.45, 4, 8), material);
  rightArm.position.set(0, -0.24, 0.08);
  rightArmPivot.add(rightArm);
  const ghostBlade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 1.35), material);
  ghostBlade.position.set(0, -0.38, 0.78);
  rightArmPivot.add(ghostBlade);

  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.34, 0.45, 0);
  torsoPivot.add(leftArmPivot);
  const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.42, 4, 8), material);
  leftArm.position.set(0, -0.22, 0.06);
  leftArmPivot.add(leftArm);

  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.19, 0.86, 0);
  bodyGroup.add(leftLegPivot);
  const leftLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.56, 4, 8), material);
  leftLeg.position.set(0, -0.34, 0);
  leftLegPivot.add(leftLeg);

  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.19, 0.86, 0);
  bodyGroup.add(rightLegPivot);
  const rightLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.56, 4, 8), material);
  rightLeg.position.set(0, -0.34, 0);
  rightLegPivot.add(rightLeg);

  return {
    root,
    bodyGroup,
    torsoPivot,
    rightArmPivot,
    leftArmPivot,
    leftLegPivot,
    rightLegPivot,
    material,
  };
}

interface BespokeBossChassis {
  coreMesh: THREE.Mesh;
  coreRimMesh: THREE.Mesh;
  weaponPivot: THREE.Group;
  secondaryPivot: THREE.Group;
  outerHelixRing: THREE.Group;
  innerHelixRing: THREE.Group;
  leftShutterPivot: THREE.Group;
  rightShutterPivot: THREE.Group;
  auxiliaryPivots: THREE.Group[];
}

function buildBespokeBossChassis(
  archetype: 'choir' | 'curator' | 'matron',
  bodyGroup: THREE.Group,
  torsoPivot: THREE.Group,
  headPivot: THREE.Group,
  coreMaterial: THREE.MeshStandardMaterial,
  coreRimMaterial: THREE.MeshBasicMaterial,
  primaryMeshes: THREE.Mesh[],
  enableShadows: boolean,
  armorBump: THREE.CanvasTexture
): BespokeBossChassis {
  const weaponPivot = new THREE.Group();
  const secondaryPivot = new THREE.Group();
  const outerHelixRing = new THREE.Group();
  const innerHelixRing = new THREE.Group();
  const leftShutterPivot = new THREE.Group();
  const rightShutterPivot = new THREE.Group();
  const auxiliaryPivots: THREE.Group[] = [];

  const mesh = (
    parent: THREE.Object3D,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    x = 0,
    y = 0,
    z = 0
  ): THREE.Mesh => {
    const part = new THREE.Mesh(geometry, material);
    part.position.set(x, y, z);
    parent.add(part);
    return part;
  };
  const hero = (part: THREE.Mesh): THREE.Mesh => {
    part.castShadow = enableShadows;
    primaryMeshes.push(part);
    return part;
  };

  torsoPivot.add(weaponPivot, secondaryPivot, outerHelixRing, innerHelixRing, headPivot);

  let coreMesh: THREE.Mesh;
  let coreRimMesh: THREE.Mesh;

  if (archetype === 'choir') {
    // =========================================================================
    // THE CHOIR — Ethereal White Porcelain & Gold Harmonic Sentinel (Sheet 2, Panel 2)
    // Floating petal-skirt armor, glowing cyan-turquoise triangular acoustic prism
    // core, ornate white/gold shoulder petals, featureless white oval helm with
    // twin gold crescent horns, and twin tall floating golden tuning-fork wings.
    // =========================================================================
    const porcelainMat = new THREE.MeshStandardMaterial({
      color: 0xf4f7fa,
      bumpMap: armorBump,
      bumpScale: 0.005,
      roughness: 0.2,
      metalness: 0.22,
    });
    const antiqueGoldMat = new THREE.MeshStandardMaterial({
      color: 0xd8b153,
      roughness: 0.24,
      metalness: 0.9,
    });
    const choirSlateMat = new THREE.MeshStandardMaterial({
      color: 0x1e2b36,
      roughness: 0.44,
      metalness: 0.72,
    });
    const tealPrismMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x14b8a6,
      emissiveIntensity: 1.25,
      roughness: 0.14,
      metalness: 0.28,
    });

    // Floating Lower Petal-Skirt Armor (6 sculpted porcelain leaf-petals trimmed in gold)
    const petalInnerCore = mesh(bodyGroup, new THREE.ConeGeometry(0.46, 1.05, 8), tealPrismMat, 0, 1.02, 0);
    petalInnerCore.rotation.x = Math.PI;

    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.quadraticCurveTo(0.28, 0.36, 0.16, 0.98);
    petalShape.lineTo(0, 1.16);
    petalShape.lineTo(-0.16, 0.98);
    petalShape.quadraticCurveTo(-0.28, 0.36, 0, 0);
    const petalGeo = new THREE.ExtrudeGeometry(petalShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    petalGeo.center();

    for (let p = 0; p < 6; p++) {
      const a = (p / 6) * Math.PI * 2 + Math.PI / 6;
      const pHolder = new THREE.Group();
      pHolder.position.set(0, 1.12, 0);
      pHolder.rotation.y = a;
      bodyGroup.add(pHolder);

      const petal = hero(mesh(pHolder, petalGeo, porcelainMat, 0, -0.05, 0.56));
      petal.rotation.x = 0.24;
      const trim = mesh(pHolder, new THREE.BoxGeometry(0.05, 0.96, 0.05), antiqueGoldMat, 0, -0.05, 0.62);
      trim.rotation.x = 0.24;
    }

    // Slender Porcelain & Gold Torso
    mesh(torsoPivot, new THREE.CylinderGeometry(0.32, 0.22, 0.72, 12), choirSlateMat, 0, 1.78, 0);
    const chestArmor = hero(mesh(torsoPivot, new RoundedBoxGeometry(0.92, 0.94, 0.58, 4, 0.14), porcelainMat, 0, 2.22, 0));
    chestArmor.scale.set(1.0, 1.0, 0.85);

    // Signature Glowing Cyan-Turquoise Triangular Acoustic Prism Core on Chest
    const triBezel = mesh(torsoPivot, new THREE.CylinderGeometry(0.46, 0.46, 0.14, 3), antiqueGoldMat, 0, 2.24, 0.25);
    triBezel.rotation.x = Math.PI / 2;
    triBezel.rotation.y = Math.PI;
    const triInnerDark = mesh(torsoPivot, new THREE.CylinderGeometry(0.39, 0.39, 0.15, 3), choirSlateMat, 0, 2.24, 0.27);
    triInnerDark.rotation.x = Math.PI / 2;
    triInnerDark.rotation.y = Math.PI;
    const triCyanPrism = hero(mesh(torsoPivot, new THREE.CylinderGeometry(0.34, 0.34, 0.17, 3), tealPrismMat, 0, 2.24, 0.29));
    triCyanPrism.rotation.x = Math.PI / 2;
    triCyanPrism.rotation.y = Math.PI;
    coreMesh = hero(mesh(torsoPivot, new THREE.CylinderGeometry(0.16, 0.16, 0.19, 3), coreMaterial, 0, 2.24, 0.31));
    coreMesh.rotation.x = Math.PI / 2;
    coreMesh.rotation.y = Math.PI;
    coreRimMesh = mesh(torsoPivot, new THREE.RingGeometry(0.44, 0.54, 3), coreRimMaterial, 0, 2.24, 0.41);
    coreRimMesh.rotation.z = Math.PI / 2;

    // Ornate Swept White & Gold Winged Shoulder Petals
    for (const side of [-1, 1]) {
      const shoulder = hero(mesh(torsoPivot, petalGeo, porcelainMat, side * 0.74, 2.52, 0.02));
      shoulder.scale.set(0.86, 0.76, 1.15);
      shoulder.rotation.set(0.15, side * 0.35, -side * 0.98);
      const shoulderGold = mesh(torsoPivot, new THREE.TorusGeometry(0.24, 0.032, 8, 20, Math.PI), antiqueGoldMat, side * 0.62, 2.56, 0.08);
      shoulderGold.rotation.z = -side * 0.6;
    }

    // Compact Tucked Harmonic Resonator Rings Behind Upper Back (keeps tuning-fork silhouette clean)
    outerHelixRing.position.set(0, 2.26, -0.34);
    innerHelixRing.position.set(0, 2.26, -0.34);
    outerHelixRing.add(new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.024, 8, 32), antiqueGoldMat));
    innerHelixRing.add(new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.018, 8, 28), tealPrismMat));

    // HARMONIC FORK — Twin Floating White-Porcelain & Antique-Gold Acoustic Tuning-Fork Wings with Turquoise Energy Wave (Sheet 8, Panel 2)
    for (const side of [-1, 1]) {
      const forkWing = new THREE.Group();
      forkWing.position.set(side * 1.48, 2.6, -0.14);
      forkWing.userData.baseY = 2.6;
      torsoPivot.add(forkWing);
      auxiliaryPivots.push(forkWing);

      // Sculpted glossy white-porcelain handle & antique-gold pommel/collars
      mesh(forkWing, new THREE.SphereGeometry(0.088, 12, 10), antiqueGoldMat, 0, -0.92, 0);
      mesh(forkWing, new THREE.CylinderGeometry(0.072, 0.082, 0.56, 12), porcelainMat, 0, -0.62, 0);
      mesh(forkWing, new THREE.TorusGeometry(0.095, 0.026, 8, 18), antiqueGoldMat, 0, -0.36, 0).rotation.x = Math.PI / 2;
      // Sculpted Porcelain & Gold U-Shaped Yoke Cradle
      hero(mesh(forkWing, new RoundedBoxGeometry(0.5, 0.2, 0.13, 2, 0.05), porcelainMat, 0, -0.2, 0));
      mesh(forkWing, new THREE.TorusGeometry(0.24, 0.036, 8, 20, Math.PI), antiqueGoldMat, 0, -0.14, 0).rotation.z = Math.PI;
      // Twin Long Tapered Antique-Gold Tuning-Fork Tines
      for (const tx of [-0.21, 0.21]) {
        hero(mesh(forkWing, new RoundedBoxGeometry(0.095, 1.46, 0.095, 2, 0.035), antiqueGoldMat, tx, 0.54, 0));
        mesh(forkWing, new THREE.CylinderGeometry(0.068, 0.068, 0.08, 10), antiqueGoldMat, tx, -0.06, 0);
      }
      // Luminous Diamond-Flared Turquoise Acoustic Energy Wave pulsing between the tines
      const waveCore = mesh(forkWing, new THREE.OctahedronGeometry(0.18, 0), tealPrismMat, 0, 0.56, 0);
      waveCore.scale.set(0.85, 2.25, 0.28);
      mesh(forkWing, new THREE.CylinderGeometry(0.026, 0.026, 1.18, 8), tealPrismMat, 0, 0.56, 0);
      mesh(forkWing, new THREE.BoxGeometry(0.36, 0.045, 0.045), tealPrismMat, 0, 0.56, 0);
    }

    // Porcelain Core Shutters
    for (const side of [-1, 1]) {
      const shutter = side < 0 ? leftShutterPivot : rightShutterPivot;
      shutter.position.set(side * 0.34, 2.24, 0.4);
      torsoPivot.add(shutter);
      const baffle = hero(mesh(shutter, new RoundedBoxGeometry(0.22, 0.66, 0.09, 2, 0.03), porcelainMat, side * 0.06, 0, 0));
      baffle.rotation.z = -side * 0.14;
    }

    // Smooth Featureless White Porcelain Oval Helm + Twin Golden Crescent Horns
    headPivot.position.set(0, 3.06, 0.06);
    const headOval = hero(mesh(headPivot, new THREE.SphereGeometry(0.24, 18, 16), porcelainMat, 0, 0.02, 0));
    headOval.scale.set(0.84, 1.24, 0.94);
    for (const side of [-1, 1]) {
      const horn = mesh(headPivot, new THREE.TorusGeometry(0.32, 0.036, 8, 20, Math.PI * 0.72), antiqueGoldMat, side * 0.12, 0.14, 0.02);
      horn.rotation.z = side < 0 ? Math.PI * 0.35 : -Math.PI * 0.05;
    }

    // Articulated Slender Porcelain/Gold Arms
    weaponPivot.position.set(0.88, 2.26, 0.04);
    secondaryPivot.position.set(-0.88, 2.26, 0.04);
    for (const [piv, s] of [[weaponPivot, 1], [secondaryPivot, -1]] as const) {
      const uArm = mesh(piv, new THREE.CapsuleGeometry(0.075, 0.42, 6, 10), porcelainMat, s * 0.08, -0.26, 0.06);
      uArm.rotation.z = s * 0.24;
      const fArm = mesh(piv, new THREE.CapsuleGeometry(0.065, 0.44, 6, 10), porcelainMat, s * 0.16, -0.68, 0.18);
      fArm.rotation.x = 0.36;
      mesh(piv, new THREE.TorusGeometry(0.085, 0.02, 8, 14), antiqueGoldMat, s * 0.16, -0.82, 0.26).rotation.x = Math.PI / 2;
    }
  } else if (archetype === 'curator') {
    // =========================================================================
    // THE CURATOR — Tall Hooded Obsidian-Violet Cyber-Archivist (Sheet 2, Panel 3)
    // Layered dark obsidian-indigo armored cloak/coat tails, deep pointed hood
    // with glowing amethyst holographic mask visor, semicircular floating halo of
    // purple holographic data-tablets behind shoulders, and double-ended glowing
    // violet chrono-staff.
    // =========================================================================
    const cloakObsidianMat = new THREE.MeshStandardMaterial({
      color: 0x1a1826,
      bumpMap: armorBump,
      bumpScale: 0.01,
      roughness: 0.42,
      metalness: 0.56,
    });
    const indigoArmorMat = new THREE.MeshStandardMaterial({
      color: 0x2d2846,
      bumpMap: armorBump,
      bumpScale: 0.008,
      roughness: 0.32,
      metalness: 0.72,
    });
    const amethystGlowMat = new THREE.MeshStandardMaterial({
      color: 0xd8b4fe,
      emissive: 0x9333ea,
      emissiveIntensity: 2.2,
      roughness: 0.12,
      metalness: 0.25,
    });
    const holoTabletMat = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0x7e22ce,
      emissiveIntensity: 1.65,
      transparent: true,
      opacity: 0.76,
      roughness: 0.15,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });

    // Tall Armored Legs + Flowing Split Obsidian Cloak Tails
    for (const side of [-1, 1]) {
      hero(mesh(bodyGroup, new THREE.CapsuleGeometry(0.13, 0.96, 6, 12), cloakObsidianMat, side * 0.28, 0.62, 0));
      mesh(bodyGroup, new RoundedBoxGeometry(0.22, 0.14, 0.42, 2, 0.04), indigoArmorMat, side * 0.28, 0.08, 0.08);
      // Long Armored Cloak Side-Tails
      const cloakTail = hero(mesh(bodyGroup, new RoundedBoxGeometry(0.38, 1.32, 0.12, 2, 0.03), cloakObsidianMat, side * 0.42, 0.88, -0.06));
      cloakTail.rotation.y = side * 0.26;
      cloakTail.rotation.z = -side * 0.08;
    }
    const backCloak = hero(mesh(bodyGroup, new RoundedBoxGeometry(0.92, 1.46, 0.1, 2, 0.03), cloakObsidianMat, 0, 0.96, -0.3));
    backCloak.rotation.x = 0.12;

    // Sleek Layered Armored Coat Torso
    const coatChest = hero(mesh(torsoPivot, new RoundedBoxGeometry(0.86, 1.12, 0.56, 3, 0.1), indigoArmorMat, 0, 2.02, 0));
    coatChest.scale.set(1.0, 1.0, 0.92);
    // Vertical Tabard Sash
    mesh(torsoPivot, new RoundedBoxGeometry(0.24, 1.05, 0.08, 2, 0.02), cloakObsidianMat, 0, 1.94, 0.29);

    coreMesh = hero(mesh(torsoPivot, new THREE.OctahedronGeometry(0.28, 0), coreMaterial, 0, 2.12, 0.36));
    coreMesh.scale.set(0.82, 1.18, 0.58);
    coreRimMesh = mesh(torsoPivot, new THREE.RingGeometry(0.34, 0.46, 6), coreRimMaterial, 0, 2.12, 0.44);

    // Semicircular Floating Halo of Translucent Glowing Purple Holographic Data-Tablets!
    outerHelixRing.position.set(0, 2.74, -0.22);
    innerHelixRing.position.set(0, 2.74, -0.22);
    const tabletCount = 8;
    for (let t = 0; t < tabletCount; t++) {
      const frac = t / (tabletCount - 1);
      const angle = -Math.PI * 0.72 + frac * Math.PI * 1.44;
      const tabletHolder = new THREE.Group();
      tabletHolder.position.set(Math.sin(angle) * 1.18, 0.06 + Math.cos(angle) * 0.12, -Math.cos(angle) * 0.42);
      tabletHolder.rotation.y = -angle;
      tabletHolder.userData.baseY = tabletHolder.position.y;
      tabletHolder.userData.baseRotY = tabletHolder.rotation.y;
      outerHelixRing.add(tabletHolder);
      auxiliaryPivots.push(tabletHolder);

      mesh(tabletHolder, new RoundedBoxGeometry(0.32, 0.46, 0.025, 1, 0.008), holoTabletMat);
      mesh(tabletHolder, new THREE.BoxGeometry(0.24, 0.03, 0.032), amethystGlowMat, 0, 0.12, 0);
      mesh(tabletHolder, new THREE.BoxGeometry(0.2, 0.025, 0.032), amethystGlowMat, 0, 0, 0);
      mesh(tabletHolder, new THREE.BoxGeometry(0.18, 0.025, 0.032), amethystGlowMat, 0, -0.11, 0);
    }
    const innerRuneRing = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.022, 8, 36), amethystGlowMat);
    innerRuneRing.rotation.x = Math.PI * 0.42;
    innerHelixRing.add(innerRuneRing);

    // Core Shutters
    for (const side of [-1, 1]) {
      const shutter = side < 0 ? leftShutterPivot : rightShutterPivot;
      shutter.position.set(side * 0.28, 2.12, 0.42);
      torsoPivot.add(shutter);
      hero(mesh(shutter, new RoundedBoxGeometry(0.22, 0.74, 0.09, 2, 0.025), indigoArmorMat, side * 0.05, 0, 0));
    }

    // Deep Pointed Obsidian Hood + Glowing Amethyst Holographic Mask Visor
    headPivot.position.set(0, 2.86, 0.04);
    const hoodCone = hero(mesh(headPivot, new THREE.ConeGeometry(0.38, 0.68, 6), cloakObsidianMat, 0, 0.16, -0.04));
    hoodCone.rotation.x = 0.12;
    const hoodDrape = mesh(headPivot, new THREE.CylinderGeometry(0.26, 0.38, 0.4, 8, 1, true, Math.PI * 0.28, Math.PI * 1.44), cloakObsidianMat, 0, -0.02, -0.02);
    hoodDrape.rotation.y = Math.PI;
    const visorMask = hero(mesh(headPivot, new THREE.SphereGeometry(0.21, 14, 12), amethystGlowMat, 0, 0.02, 0.12));
    visorMask.scale.set(0.82, 1.18, 0.54);
    // Vertical Cyber-Archivist Mask Rune Slits
    mesh(headPivot, new THREE.BoxGeometry(0.032, 0.22, 0.04), cloakObsidianMat, 0, 0.02, 0.24);

    // ARCHIVE STAFF — Obsidian-Indigo Shaft, Silver Collars, 3-Pronged Emitter Cradle & Faceted Amethyst Crystal Spearhead (Sheet 8, Panel 3)
    weaponPivot.position.set(0.86, 2.18, 0.14);
    secondaryPivot.position.set(-0.86, 2.18, 0.14);

    const staffSilverMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.22,
      metalness: 0.9,
    });
    const staffShaft = mesh(weaponPivot, new THREE.CylinderGeometry(0.044, 0.048, 3.28, 12), indigoArmorMat, 0, 0, 0.52);
    staffShaft.rotation.x = Math.PI / 2;
    // Brushed-silver segmented grip rings along the obsidian shaft
    for (const rz of [-0.82, -0.18, 0.52, 1.22, 1.56]) {
      mesh(weaponPivot, new THREE.TorusGeometry(0.068, 0.022, 8, 16), staffSilverMat, 0, 0, rz);
    }
    // Curved 3-pronged dark-silver emitter cradle gripping the main amethyst crystal spearhead
    for (let p = 0; p < 3; p++) {
      const pa = (p / 3) * Math.PI * 2;
      const prongPivot = new THREE.Group();
      prongPivot.position.set(0, 0, 1.62);
      prongPivot.rotation.z = pa;
      weaponPivot.add(prongPivot);
      const lowerProng = mesh(prongPivot, new RoundedBoxGeometry(0.055, 0.34, 0.16, 2, 0.015), staffSilverMat, 0, 0.14, 0.14);
      lowerProng.rotation.x = 0.65;
      const upperProng = mesh(prongPivot, new RoundedBoxGeometry(0.048, 0.36, 0.12, 2, 0.015), indigoArmorMat, 0, 0.24, 0.38);
      upperProng.rotation.x = -0.35;
    }
    // Faceted Glowing Amethyst Crystal Spearhead (front) + Pointed Crystal Pommel (rear)
    const frontCrystalBase = hero(mesh(weaponPivot, new THREE.CylinderGeometry(0.13, 0.08, 0.54, 6), amethystGlowMat, 0, 0, 1.98));
    frontCrystalBase.rotation.x = Math.PI / 2;
    frontCrystalBase.scale.set(0.75, 1.0, 1.0);
    const frontBlade = hero(mesh(weaponPivot, new THREE.ConeGeometry(0.13, 0.72, 6), amethystGlowMat, 0, 0, 2.61));
    frontBlade.rotation.x = Math.PI / 2;
    frontBlade.scale.set(0.75, 1.0, 1.0);
    const rearBlade = mesh(weaponPivot, new THREE.ConeGeometry(0.095, 0.58, 6), amethystGlowMat, 0, 0, -1.32);
    rearBlade.rotation.x = -Math.PI / 2;
    rearBlade.scale.set(0.75, 1.0, 1.0);

    // Left Arm (secondaryPivot): Armored Archivist Gauntlet & Glowing Violet Palm Emitter
    mesh(secondaryPivot, new THREE.CapsuleGeometry(0.09, 0.52, 6, 10), cloakObsidianMat, 0, -0.22, 0.14).rotation.x = 0.45;
    mesh(secondaryPivot, new THREE.OctahedronGeometry(0.16, 0), amethystGlowMat, 0, -0.34, 0.46);
  } else {
    // =========================================================================
    // MATRON-V — Glossy White Ceramic & Crimson Cyber-Surgeon (Sheet 2, Panel 4)
    // Anatomical white/crimson surgical armor, skull-like white head with single
    // glowing ruby optic eye, 4 articulated metallic dorsal surgical mech-arms
    // arching from her back, and crimson industrial plasma bone-saw/chainsaw.
    // =========================================================================
    const ceramicWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf4f6f9,
      bumpMap: armorBump,
      bumpScale: 0.006,
      roughness: 0.22,
      metalness: 0.18,
    });
    const crimsonMuscleMat = new THREE.MeshStandardMaterial({
      color: 0x8f162e,
      bumpMap: armorBump,
      bumpScale: 0.01,
      roughness: 0.38,
      metalness: 0.42,
    });
    const surgicalSteelMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.2,
      metalness: 0.92,
    });
    const darkJointMat = new THREE.MeshStandardMaterial({
      color: 0x262c36,
      roughness: 0.45,
      metalness: 0.78,
    });
    const rubyGlowMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      emissive: 0xbe123c,
      emissiveIntensity: 1.25,
      roughness: 0.18,
      metalness: 0.28,
    });

    // Tall Athletic White Ceramic & Crimson Anatomical Surgical Legs
    for (const side of [-1, 1]) {
      const thigh = hero(mesh(bodyGroup, new THREE.CapsuleGeometry(0.14, 0.48, 8, 12), crimsonMuscleMat, side * 0.28, 0.96, 0));
      const thighShell = hero(mesh(bodyGroup, new RoundedBoxGeometry(0.24, 0.44, 0.24, 3, 0.06), ceramicWhiteMat, side * 0.3, 0.98, 0.06));
      thighShell.rotation.y = side * 0.16;
      const shin = hero(mesh(bodyGroup, new THREE.CapsuleGeometry(0.115, 0.54, 8, 12), ceramicWhiteMat, side * 0.3, 0.42, 0.02));
      mesh(bodyGroup, new RoundedBoxGeometry(0.12, 0.44, 0.08, 2, 0.02), crimsonMuscleMat, side * 0.3, 0.42, 0.12);
      mesh(bodyGroup, new RoundedBoxGeometry(0.22, 0.14, 0.4, 2, 0.04), darkJointMat, side * 0.3, 0.08, 0.08);
      void thigh;
      void shin;
    }

    // Anatomical Crimson & White Surgical Torso
    mesh(torsoPivot, new THREE.CylinderGeometry(0.24, 0.3, 0.44, 12), crimsonMuscleMat, 0, 1.48, 0);
    const chestArmor = hero(mesh(torsoPivot, new RoundedBoxGeometry(0.76, 0.78, 0.48, 4, 0.14), ceramicWhiteMat, 0, 2.02, 0));
    chestArmor.scale.set(1.0, 1.0, 0.92);
    // Crimson Center Sternum & Rib Striations
    mesh(torsoPivot, new RoundedBoxGeometry(0.28, 0.76, 0.52, 2, 0.04), crimsonMuscleMat, 0, 1.98, 0.01);

    coreMesh = hero(mesh(torsoPivot, new THREE.SphereGeometry(0.14, 18, 14), coreMaterial, 0, 2.02, 0.26));
    coreMesh.scale.set(1, 1, 0.55);
    coreRimMesh = mesh(torsoPivot, new THREE.RingGeometry(0.2, 0.28, 24), coreRimMaterial, 0, 2.02, 0.34);

    // Subtle Surgical Halo Rings tucked behind dorsal pack
    outerHelixRing.position.set(0, 2.12, -0.32);
    innerHelixRing.position.set(0, 2.12, -0.32);
    outerHelixRing.add(new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.02, 8, 28), surgicalSteelMat));
    innerHelixRing.add(new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.016, 8, 24), rubyGlowMat));

    // Signature 4 Articulated Metallic Silver-Steel Dorsal Surgical Mech-Arms!
    for (const side of [-1, 1]) {
      for (const upper of [true, false]) {
        const limb = new THREE.Group();
        const restZ = -side * (upper ? 0.36 : 0.78);
        limb.position.set(side * (upper ? 0.32 : 0.38), upper ? 2.28 : 1.92, -0.26);
        limb.rotation.z = restZ;
        limb.userData.restZ = restZ;
        limb.userData.side = side;
        limb.userData.upper = upper ? 1 : 0;
        torsoPivot.add(limb);
        auxiliaryPivots.push(limb);

        mesh(limb, new THREE.SphereGeometry(0.11, 10, 8), darkJointMat);
        const seg1 = hero(mesh(limb, new THREE.CapsuleGeometry(0.055, 0.76, 6, 10), surgicalSteelMat, side * 0.36, 0.36, -0.06));
        seg1.rotation.z = -side * 0.78;
        mesh(limb, new THREE.SphereGeometry(0.085, 10, 8), darkJointMat, side * 0.7, 0.68, -0.08);
        const seg2 = hero(mesh(limb, new THREE.CapsuleGeometry(0.044, 0.72, 6, 10), surgicalSteelMat, side * 0.94, 0.38, 0.16));
        seg2.rotation.z = side * 0.42;
        seg2.rotation.x = 0.45;
        // Precision Surgical Pincer Claws & Ruby Laser Tips
        for (const clawSign of [-1, 1]) {
          const pincer = mesh(limb, new THREE.ConeGeometry(0.036, 0.28, 4), upper ? rubyGlowMat : surgicalSteelMat, side * 1.12 + clawSign * 0.06, 0.06, 0.42);
          pincer.rotation.x = Math.PI * 0.62;
        }
      }
    }

    // Core Shutters
    for (const side of [-1, 1]) {
      const shutter = side < 0 ? leftShutterPivot : rightShutterPivot;
      shutter.position.set(side * 0.24, 2.02, 0.34);
      torsoPivot.add(shutter);
      hero(mesh(shutter, new RoundedBoxGeometry(0.18, 0.56, 0.08, 2, 0.025), ceramicWhiteMat, side * 0.04, 0, 0));
    }

    // Smooth White Ceramic Skull-Helm + Single Glowing Ruby Cyclops Optic + Crimson Seam
    headPivot.position.set(0, 2.68, 0.04);
    const skull = hero(mesh(headPivot, new THREE.SphereGeometry(0.22, 18, 16), ceramicWhiteMat, 0, 0.02, 0));
    skull.scale.set(0.88, 1.14, 0.98);
    mesh(headPivot, new THREE.BoxGeometry(0.035, 0.38, 0.42), crimsonMuscleMat, 0, 0.04, 0.01);
    const rubyEyeBezel = mesh(headPivot, new THREE.CylinderGeometry(0.082, 0.082, 0.08, 16), darkJointMat, 0, 0.02, 0.19);
    rubyEyeBezel.rotation.x = Math.PI / 2;
    const rubyEye = mesh(headPivot, new THREE.SphereGeometry(0.062, 14, 12), rubyGlowMat, 0, 0.02, 0.22);
    rubyEye.scale.set(1, 1, 0.55);

    // EXCISION SAW — Glossy White-Ceramic Surgical Casing, Dark Titanium Motor Hub & Blazing Crimson Laser-Toothed Blade (Sheet 8, Panel 4)
    weaponPivot.position.set(0.62, 2.22, 0.06);
    secondaryPivot.position.set(-0.62, 2.22, 0.06);

    mesh(weaponPivot, new THREE.CapsuleGeometry(0.085, 0.48, 6, 10), ceramicWhiteMat, 0.08, -0.26, 0.1).rotation.x = 0.32;
    const sawAssembly = new THREE.Group();
    sawAssembly.position.set(0.16, -0.52, 0.38);
    sawAssembly.rotation.set(0.28, 0.36, -0.18);
    weaponPivot.add(sawAssembly);
    // Ergonomic glossy white-ceramic surgical motor casing + rear loop handle
    hero(mesh(sawAssembly, new RoundedBoxGeometry(0.24, 0.34, 0.62, 3, 0.06), ceramicWhiteMat, 0, 0.04, 0.02));
    mesh(sawAssembly, new RoundedBoxGeometry(0.14, 0.22, 0.3, 2, 0.04), darkJointMat, 0, 0.02, -0.34);
    mesh(sawAssembly, new RoundedBoxGeometry(0.16, 0.07, 0.36, 2, 0.02), ceramicWhiteMat, 0, 0.14, -0.34);
    // Circular dark titanium rotary drive drum + crimson seam trim
    const sawDriveHub = mesh(sawAssembly, new THREE.CylinderGeometry(0.14, 0.14, 0.27, 16), darkJointMat, 0, 0.01, 0.12);
    sawDriveHub.rotation.z = Math.PI / 2;
    mesh(sawAssembly, new RoundedBoxGeometry(0.255, 0.036, 0.56, 1, 0.01), rubyGlowMat, 0, 0.16, 0.12);
    // White-ceramic upper blade shroud over brushed-steel guide bar
    hero(mesh(sawAssembly, new RoundedBoxGeometry(0.15, 0.14, 1.24, 2, 0.03), ceramicWhiteMat, 0, 0.12, 0.88));
    hero(mesh(sawAssembly, new RoundedBoxGeometry(0.08, 0.22, 1.38, 2, 0.02), darkJointMat, 0, -0.02, 0.92));
    // Blazing crimson laser-toothed chain edge running along the bottom and rounded nose of the saw
    mesh(sawAssembly, new RoundedBoxGeometry(0.055, 0.08, 1.42, 2, 0.02), rubyGlowMat, 0, -0.14, 0.94);
    mesh(sawAssembly, new THREE.TorusGeometry(0.12, 0.036, 8, 16), rubyGlowMat, 0, -0.01, 1.56).rotation.y = Math.PI / 2;
    for (let tooth = 0; tooth < 9; tooth++) {
      const sawTooth = mesh(sawAssembly, new THREE.ConeGeometry(0.038, 0.11, 4), rubyGlowMat, 0, -0.19, 0.32 + tooth * 0.15);
      sawTooth.rotation.x = Math.PI;
    }

    // Left Arm (secondaryPivot): Ceramic & Crimson Surgical Gauntlet
    mesh(secondaryPivot, new THREE.CapsuleGeometry(0.082, 0.5, 6, 10), ceramicWhiteMat, -0.06, -0.28, 0.12).rotation.x = 0.36;
    mesh(secondaryPivot, new RoundedBoxGeometry(0.14, 0.14, 0.38, 2, 0.03), crimsonMuscleMat, -0.08, -0.44, 0.36);
  }

  return {
    coreMesh,
    coreRimMesh,
    weaponPivot,
    secondaryPivot,
    outerHelixRing,
    innerHelixRing,
    leftShutterPivot,
    rightShutterPivot,
    auxiliaryPivots,
  };
}

export function createEnemyRig(
  id: string,
  archetype: EnemyArchetype,
  shadowTex: THREE.Texture,
  enableShadows: boolean
): EnemyRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const torsoPivot = new THREE.Group();
  bodyGroup.add(torsoPivot);

  const headPivot = new THREE.Group();
  torsoPivot.add(headPivot);

  const cfg = GAME_CONFIG.enemies[archetype];
  const armorBump = createArmorDetailBumpTexture();
  const armorRoughness = createArmorRoughnessTexture();

  // Ground Contact Shadow Disc (shared unit CircleGeometry scaled per archetype for zero GC)
  if (!sharedEnemyContactShadowGeo) {
    sharedEnemyContactShadowGeo = new THREE.CircleGeometry(1, 24);
    sharedEnemyContactShadowGeo.userData.sharedAsset = true;
  }
  const contactShadow = new THREE.Mesh(
    sharedEnemyContactShadowGeo,
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
    })
  );
  contactShadow.scale.setScalar(cfg.radius * 1.45);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.015;
  root.add(contactShadow);

  const primaryMeshes: THREE.Mesh[] = [];
  let weaponPivot = new THREE.Group();
  let secondaryPivot = new THREE.Group();
  let leftArmPivot: THREE.Group | undefined;
  let rightArmPivot: THREE.Group | undefined;
  let leftLegPivot: THREE.Group | undefined;
  let leftShinPivot: THREE.Group | undefined;
  let rightLegPivot: THREE.Group | undefined;
  let rightShinPivot: THREE.Group | undefined;
  let outerHelixRing: THREE.Group | undefined;
  let innerHelixRing: THREE.Group | undefined;
  let leftShutterPivot: THREE.Group | undefined;
  let rightShutterPivot: THREE.Group | undefined;
  let ramLaneGroup: THREE.Group | undefined;
  let ramLaneFillMat: THREE.MeshBasicMaterial | undefined;
  let ramLaneBorderMat: THREE.MeshBasicMaterial | undefined;
  let ramLaneShaderMat: THREE.ShaderMaterial | undefined;
  let sweepSectorGroup: THREE.Group | undefined;
  let sweepSectorFillMat: THREE.MeshBasicMaterial | undefined;
  let sweepSectorRimMat: THREE.MeshBasicMaterial | undefined;
  let sweepSectorShaderMat: THREE.ShaderMaterial | undefined;
  let slamShockwaveRing: THREE.Mesh | undefined;
  let slamShockwaveMat: THREE.MeshBasicMaterial | undefined;
  let auxiliaryPivots: THREE.Group[] = [];
  let coreMesh: THREE.Mesh;
  let coreRimMesh: THREE.Mesh;

  const isBossArchetype =
    archetype === 'helix' ||
    archetype === 'choir' ||
    archetype === 'curator' ||
    archetype === 'matron' ||
    archetype === 'warden_prime';

  const coreMaterial = new THREE.MeshStandardMaterial({
    color:
      archetype === 'bastion' || archetype === 'siphon' || archetype === 'chrono_mortar'
        ? 0xf59e0b
        : archetype === 'scrapper'
          ? 0xf97316
          : archetype === 'eraser' || archetype === 'matron'
            ? 0xf43f5e
            : archetype === 'curator' ||
                archetype === 'curator_decoy' ||
                archetype === 'phase_stalker'
              ? 0xa855f7
              : archetype === 'resonance_warden'
                ? 0x10b981
                : isBossArchetype
                  ? 0x38bdf8
                  : 0x22d3ee,
    emissive:
      archetype === 'bastion' || archetype === 'siphon' || archetype === 'chrono_mortar'
        ? 0xea580c
        : archetype === 'scrapper'
          ? 0xea580c
          : archetype === 'eraser' || archetype === 'matron'
            ? 0xe11d48
            : archetype === 'curator' ||
                archetype === 'curator_decoy' ||
                archetype === 'phase_stalker'
              ? 0x9333ea
              : archetype === 'resonance_warden'
                ? 0x059669
                : isBossArchetype
                  ? 0x06b6d4
                  : 0x06b6d4,
    emissiveIntensity: isBossArchetype ? 1.85 : 1.5,
    roughness: 0.15,
    metalness: 0.45,
  });

  const coreRimMaterial = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });

  if (archetype === 'bastion') {
    const isEraser = false;
    const isSentinel = false;
    // =========================================================================
    // AEGIS BASTION / ERASER-09 / SENTINEL-A7 — Heavy Riot Mech Enforcer
    // Matte slate-grey armor slabs, fiery amber visor & inverted-triangle chest
    // reactor core, colossal notched hexagonal tower shield & shock-maul hammer.
    // =========================================================================
    const graphiteChassisMat = new THREE.MeshStandardMaterial({
      color: isEraser ? 0x2c102a : isSentinel ? 0x162d3d : 0x1c222b,
      bumpMap: armorBump,
      bumpScale: 0.018,
      roughnessMap: armorRoughness,
      roughness: 0.64,
      metalness: 0.66,
      envMapIntensity: 1.15,
    });
    const gunmetalPlateMat = new THREE.MeshStandardMaterial({
      color: isEraser ? 0x881337 : isSentinel ? 0x0e7490 : 0x526072,
      bumpMap: armorBump,
      bumpScale: 0.02,
      roughnessMap: armorRoughness,
      roughness: 0.36,
      metalness: 0.78,
      envMapIntensity: 1.22,
    });
    const slateSteelMat = new THREE.MeshStandardMaterial({
      color: isEraser ? 0xfda4af : isSentinel ? 0xcffafe : 0x7b8a9d,
      bumpMap: armorBump,
      bumpScale: 0.014,
      roughnessMap: armorRoughness,
      roughness: 0.28,
      metalness: 0.84,
      envMapIntensity: 1.25,
    });
    const bronzePistonMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      bumpMap: armorBump,
      bumpScale: 0.01,
      roughnessMap: armorRoughness,
      roughness: 0.24,
      metalness: 0.9,
      envMapIntensity: 1.28,
    });
    const amberGlowMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf97316,
      emissiveIntensity: 1.8,
      roughness: 0.16,
      metalness: 0.35,
    });

    // Articulated Heavy Hydraulic Legs (Chunky Matte-Slate Armor Slabs)
    const buildBastionLeg = (sign: number) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(sign * 0.46, 0.78, 0);

      const upperPiston = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.18, 0.28, 8, 14),
        graphiteChassisMat
      );
      upperPiston.position.y = -0.16;
      upperPiston.castShadow = enableShadows;
      legGroup.add(upperPiston);

      const thighArmor = new THREE.Mesh(
        new RoundedBoxGeometry(0.4, 0.36, 0.44, 3, 0.06),
        gunmetalPlateMat
      );
      thighArmor.position.set(sign * 0.04, -0.15, 0.02);
      thighArmor.castShadow = enableShadows;
      legGroup.add(thighArmor);

      const shinGroup = new THREE.Group();
      shinGroup.position.set(0, -0.35, 0);
      legGroup.add(shinGroup);

      const kneeJoint = new THREE.Mesh(
        new RoundedBoxGeometry(0.32, 0.24, 0.3, 3, 0.05),
        slateSteelMat
      );
      kneeJoint.position.set(0, 0.02, 0.12);
      shinGroup.add(kneeJoint);

      const shinGuard = new THREE.Mesh(
        new RoundedBoxGeometry(0.42, 0.42, 0.46, 3, 0.07),
        gunmetalPlateMat
      );
      shinGuard.position.set(0, -0.19, 0.04);
      shinGuard.castShadow = enableShadows;
      shinGroup.add(shinGuard);

      const heavyFoot = new THREE.Mesh(
        new RoundedBoxGeometry(0.46, 0.2, 0.58, 3, 0.06),
        graphiteChassisMat
      );
      heavyFoot.position.set(0, -0.37, 0.08);
      shinGroup.add(heavyFoot);

      bodyGroup.add(legGroup);
      primaryMeshes.push(shinGuard);
      return { legGroup, shinGroup };
    };

    const bLeft = buildBastionLeg(-1);
    const bRight = buildBastionLeg(1);
    leftLegPivot = bLeft.legGroup;
    leftShinPivot = bLeft.shinGroup;
    rightLegPivot = bRight.legGroup;
    rightShinPivot = bRight.shinGroup;

    // Pelvis & Segmented Armored Abdomen
    const pelvisBlock = new THREE.Mesh(
      new RoundedBoxGeometry(1.18, 0.38, 0.88, 3, 0.08),
      gunmetalPlateMat
    );
    pelvisBlock.position.y = 0.82;
    pelvisBlock.castShadow = enableShadows;
    bodyGroup.add(pelvisBlock);
    primaryMeshes.push(pelvisBlock);

    torsoPivot.position.set(0, 1.05, 0);

    const waistRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.54, 0.32, 12),
      graphiteChassisMat
    );
    waistRing.position.y = 0.08;
    torsoPivot.add(waistRing);

    // Broad Angled Matte-Slate Carapace Upper Torso
    const carapaceTorso = new THREE.Mesh(
      new RoundedBoxGeometry(1.52, 0.98, 1.04, 4, 0.14),
      gunmetalPlateMat
    );
    carapaceTorso.position.set(0, 0.54, 0.02);
    carapaceTorso.castShadow = enableShadows;
    torsoPivot.add(carapaceTorso);
    primaryMeshes.push(carapaceTorso);

    // Angled Chest Armor Slabs flanking the Inverted Triangular Reactor Core
    for (const side of [-1, 1]) {
      const chestFlankPlate = new THREE.Mesh(
        new RoundedBoxGeometry(0.44, 0.68, 0.24, 3, 0.05),
        slateSteelMat
      );
      chestFlankPlate.position.set(side * 0.5, 0.54, 0.46);
      chestFlankPlate.rotation.y = -side * 0.24;
      torsoPivot.add(chestFlankPlate);

      const collarButtress = new THREE.Mesh(
        new RoundedBoxGeometry(0.28, 0.22, 0.42, 2, 0.04),
        slateSteelMat
      );
      collarButtress.position.set(side * 0.42, 1.04, 0.06);
      collarButtress.rotation.z = -side * 0.25;
      torsoPivot.add(collarButtress);
    }

    // Armored Upper Back Pack & Twin Exhaust Stacks
    const backShell = new THREE.Mesh(
      new RoundedBoxGeometry(1.12, 0.86, 0.56, 3, 0.1),
      graphiteChassisMat
    );
    backShell.position.set(0, 0.6, -0.36);
    torsoPivot.add(backShell);

    for (const side of [-1, 1]) {
      const exhaustStack = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.14, 0.44, 10),
        slateSteelMat
      );
      exhaustStack.rotation.x = -0.28;
      exhaustStack.rotation.z = -side * 0.16;
      exhaustStack.position.set(side * 0.44, 0.94, -0.4);
      torsoPivot.add(exhaustStack);

      const exhaustGlow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.07, 10),
        amberGlowMat
      );
      exhaustGlow.rotation.x = -0.28;
      exhaustGlow.rotation.z = -side * 0.16;
      exhaustGlow.position.set(side * 0.46, 1.13, -0.46);
      torsoPivot.add(exhaustGlow);
    }

    // Rotating Dorsal Aegis Projector Halo
    const aegisHaloPivot = new THREE.Group();
    aegisHaloPivot.position.set(0, 0.72, -0.66);
    const aegisRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.032, 8, 20),
      isEraser ? coreMaterial : amberGlowMat
    );
    aegisHaloPivot.add(aegisRing);
    torsoPivot.add(aegisHaloPivot);
    auxiliaryPivots.push(aegisHaloPivot);

    // Recessed Square Armored Helmet tucked between huge shoulders + Fiery Amber Visor
    headPivot.position.set(0, 1.02, 0.14);
    const helmGuard = new THREE.Mesh(
      new RoundedBoxGeometry(0.48, 0.36, 0.48, 3, 0.08),
      slateSteelMat
    );
    headPivot.add(helmGuard);

    const helmBrow = new THREE.Mesh(
      new RoundedBoxGeometry(0.52, 0.12, 0.32, 2, 0.03),
      gunmetalPlateMat
    );
    helmBrow.position.set(0, 0.11, 0.15);
    headPivot.add(helmBrow);

    const helmVisor = new THREE.Mesh(
      new RoundedBoxGeometry(0.36, 0.11, 0.12, 2, 0.02),
      amberGlowMat
    );
    helmVisor.position.set(0, 0.0, 0.21);
    headPivot.add(helmVisor);

    // Giant Blocky Beveled Shoulder Pauldrons (Panel 5 silhouette)
    for (const side of [-1, 1]) {
      const shoulderBlock = new THREE.Mesh(
        new RoundedBoxGeometry(0.68, 0.62, 0.76, 3, 0.12),
        gunmetalPlateMat
      );
      shoulderBlock.rotation.z = -side * 0.18;
      shoulderBlock.position.set(side * 0.94, 0.84, 0.02);
      shoulderBlock.castShadow = enableShadows;
      torsoPivot.add(shoulderBlock);
      primaryMeshes.push(shoulderBlock);

      const pauldronCap = new THREE.Mesh(
        new RoundedBoxGeometry(0.54, 0.16, 0.64, 2, 0.04),
        slateSteelMat
      );
      pauldronCap.rotation.z = -side * 0.18;
      pauldronCap.position.set(side * 0.97, 1.12, 0.02);
      torsoPivot.add(pauldronCap);

      const ventGlow = new THREE.Mesh(
        new RoundedBoxGeometry(0.08, 0.24, 0.34, 2, 0.02),
        amberGlowMat
      );
      ventGlow.position.set(side * 1.24, 0.82, 0.02);
      torsoPivot.add(ventGlow);
    }

    // Left Arm: Colossal Notched Hexagonal Tower Riot Shield on secondaryPivot
    secondaryPivot.position.set(-0.96, 0.56, 0.14);
    torsoPivot.add(secondaryPivot);
    const leftArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.16, 0.42, 8, 12),
      graphiteChassisMat
    );
    leftArm.position.set(0, -0.24, 0.15);
    leftArm.rotation.x = 0.42;
    secondaryPivot.add(leftArm);

    // Extruded Beveled Hexagonal/Notched Tower Riot Shield matching Concept Panel 5
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(-0.34, 0.98);
    shieldShape.lineTo(0.34, 0.98);
    shieldShape.lineTo(0.5, 0.74);
    shieldShape.lineTo(0.5, 0.12);
    shieldShape.lineTo(0.42, -0.02);
    shieldShape.lineTo(0.48, -0.18);
    shieldShape.lineTo(0.44, -0.82);
    shieldShape.lineTo(0.26, -1.04);
    shieldShape.lineTo(-0.26, -1.04);
    shieldShape.lineTo(-0.44, -0.82);
    shieldShape.lineTo(-0.48, -0.18);
    shieldShape.lineTo(-0.42, -0.02);
    shieldShape.lineTo(-0.5, 0.12);
    shieldShape.lineTo(-0.5, 0.74);
    shieldShape.closePath();

    const towerShieldGeo = new THREE.ExtrudeGeometry(shieldShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.045,
      bevelSegments: 2,
    });
    towerShieldGeo.center();

    const shieldGroup = new THREE.Group();
    shieldGroup.position.set(-0.22, -0.22, 0.42);
    shieldGroup.rotation.y = Math.PI * 0.42;
    secondaryPivot.add(shieldGroup);

    const bucklerShield = new THREE.Mesh(towerShieldGeo, gunmetalPlateMat);
    bucklerShield.castShadow = enableShadows;
    shieldGroup.add(bucklerShield);
    primaryMeshes.push(bucklerShield);

    // Shield Vertical Armor Spine & Beveled Upper/Lower Plates
    const shieldSpine = new THREE.Mesh(
      new RoundedBoxGeometry(0.18, 1.88, 0.24, 2, 0.03),
      graphiteChassisMat
    );
    shieldSpine.position.set(0, 0, 0.05);
    shieldGroup.add(shieldSpine);

    const shieldUpperPlate = new THREE.Mesh(
      new RoundedBoxGeometry(0.76, 0.72, 0.09, 2, 0.03),
      slateSteelMat
    );
    shieldUpperPlate.position.set(0, 0.44, 0.11);
    shieldGroup.add(shieldUpperPlate);

    const shieldLowerPlate = new THREE.Mesh(
      new RoundedBoxGeometry(0.68, 0.72, 0.09, 2, 0.03),
      slateSteelMat
    );
    shieldLowerPlate.position.set(0, -0.46, 0.11);
    shieldGroup.add(shieldLowerPlate);

    // Shield Glowing Amber Observation/Vent Slits
    for (const sy of [0.58, -0.22]) {
      const shieldSlit = new THREE.Mesh(
        new RoundedBoxGeometry(0.46, 0.07, 0.08, 2, 0.015),
        amberGlowMat
      );
      shieldSlit.position.set(0, sy, 0.145);
      shieldGroup.add(shieldSlit);
    }

    // Central Inverted Triangular Glowing Amber Chest Reactor Core (Concept Panel 5)
    const triHousing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.42, 0.14, 3),
      graphiteChassisMat
    );
    triHousing.rotation.x = Math.PI / 2;
    triHousing.position.set(0, 0.56, 0.5);
    torsoPivot.add(triHousing);

    const triBezel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.34, 0.16, 3),
      bronzePistonMat
    );
    triBezel.rotation.x = Math.PI / 2;
    triBezel.position.set(0, 0.56, 0.52);
    torsoPivot.add(triBezel);

    coreMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.26, 0.18, 3),
      coreMaterial
    );
    coreMesh.rotation.x = Math.PI / 2;
    coreMesh.position.set(0, 0.56, 0.54);
    torsoPivot.add(coreMesh);

    coreRimMesh = new THREE.Mesh(new THREE.RingGeometry(0.34, 0.46, 32), coreRimMaterial);
    coreRimMesh.position.set(0, 0.56, 0.64);
    torsoPivot.add(coreRimMesh);

    // Right Arm & Heavy Pneumatic Industrial Shock-Maul Hammer on weaponPivot
    weaponPivot.position.set(0.96, 0.58, 0.14);
    torsoPivot.add(weaponPivot);

    const rightUpperArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.17, 0.44, 8, 12),
      graphiteChassisMat
    );
    rightUpperArm.position.set(0, -0.2, 0.14);
    rightUpperArm.rotation.x = Math.PI * 0.34;
    weaponPivot.add(rightUpperArm);

    const maulShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.085, 1.72, 12),
      graphiteChassisMat
    );
    maulShaft.rotation.x = Math.PI / 2;
    maulShaft.position.set(0, -0.18, 0.74);
    weaponPivot.add(maulShaft);

    const maulHeadHousing = new THREE.Mesh(
      new RoundedBoxGeometry(0.68, 0.54, 0.74, 3, 0.09),
      gunmetalPlateMat
    );
    maulHeadHousing.position.set(0, -0.18, 1.44);
    maulHeadHousing.castShadow = enableShadows;
    weaponPivot.add(maulHeadHousing);

    const maulImpactBlock = new THREE.Mesh(
      new RoundedBoxGeometry(0.76, 0.44, 0.42, 3, 0.06),
      slateSteelMat
    );
    maulImpactBlock.position.set(0, -0.18, 1.46);
    weaponPivot.add(maulImpactBlock);

    for (const offsetZ of [1.22, 1.66]) {
      const maulGlowSeam = new THREE.Mesh(
        new RoundedBoxGeometry(0.74, 0.12, 0.09, 2, 0.02),
        amberGlowMat
      );
      maulGlowSeam.position.set(0, -0.18, offsetZ);
      weaponPivot.add(maulGlowSeam);
    }
  } else if (archetype === 'curator_decoy') {
    // =========================================================================
    // FALSE ECHO — Holographic Amethyst-Purple Wireframe Decoy with Glitch Shards
    // & Fractured Purple Floor Ring (Sheet 8, Panel 8)
    // =========================================================================
    const feHoloBodyMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7e22ce,
      emissiveIntensity: 1.35,
      transparent: true,
      opacity: 0.56,
      roughness: 0.18,
      metalness: 0.2,
    });
    const feWireMat = new THREE.MeshBasicMaterial({
      color: 0xe879f9,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const feGlitchShardMat = new THREE.MeshBasicMaterial({
      color: 0xf0abfc,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const feVisorMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.95,
    });

    const addHoloPart = (parent: THREE.Object3D, geo: THREE.BufferGeometry, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) => {
      const solid = new THREE.Mesh(geo, feHoloBodyMat);
      solid.position.set(x, y, z);
      solid.rotation.set(rx, ry, rz);
      parent.add(solid);
      const wire = new THREE.Mesh(geo, feWireMat);
      wire.scale.setScalar(1.03);
      solid.add(wire);
      return solid;
    };

    // Agile Humanoid Combat-Stance Holographic Legs
    const buildFalseEchoLeg = (sign: number) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(sign * 0.22, 0.96, 0);
      addHoloPart(legGroup, new THREE.CapsuleGeometry(0.088, 0.36, 6, 10), sign * 0.04, -0.22, 0.04, -0.14, 0, sign * 0.1);
      const shinGroup = new THREE.Group();
      shinGroup.position.set(sign * 0.06, -0.46, 0.06);
      legGroup.add(shinGroup);
      addHoloPart(shinGroup, new THREE.CapsuleGeometry(0.072, 0.38, 6, 10), 0, -0.24, -0.04, 0.14, 0, -sign * 0.06);
      addHoloPart(shinGroup, new RoundedBoxGeometry(0.14, 0.1, 0.26, 1, 0.03), 0, -0.45, 0.04);
      bodyGroup.add(legGroup);
      return { legGroup, shinGroup };
    };

    const feLeft = buildFalseEchoLeg(-1);
    const feRight = buildFalseEchoLeg(1);
    leftLegPivot = feLeft.legGroup;
    leftShinPivot = feLeft.shinGroup;
    rightLegPivot = feRight.legGroup;
    rightShinPivot = feRight.shinGroup;

    // Humanoid Wireframe Pelvis & Torso
    torsoPivot.position.set(0, 1.0, 0);
    const feChest = addHoloPart(torsoPivot, new RoundedBoxGeometry(0.46, 0.56, 0.26, 2, 0.08), 0, 0.34, 0);
    primaryMeshes.push(feChest);
    addHoloPart(torsoPivot, new THREE.CylinderGeometry(0.16, 0.2, 0.22, 10), 0, 0.02, 0);

    coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.15, 0), coreMaterial);
    coreMesh.position.set(0, 0.36, 0.16);
    torsoPivot.add(coreMesh);
    coreRimMesh = new THREE.Mesh(new THREE.RingGeometry(0.19, 0.26, 6), coreRimMaterial);
    coreRimMesh.position.set(0, 0.36, 0.19);
    torsoPivot.add(coreRimMesh);

    // Smooth Wireframe Humanoid Head with Bright Horizontal Visor Slit
    headPivot.position.set(0, 0.78, 0.02);
    const feHead = addHoloPart(headPivot, new THREE.SphereGeometry(0.16, 12, 10), 0, 0.04, 0);
    feHead.scale.set(0.86, 1.12, 0.96);
    const feVisor = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.032, 0.06), feVisorMat);
    feVisor.position.set(0, 0.05, 0.14);
    headPivot.add(feVisor);

    // Humanoid Arms in Ready Combat Stance
    weaponPivot.position.set(0, 0.54, 0);
    torsoPivot.add(weaponPivot);
    const buildFalseEchoArm = (sign: number) => {
      const armGroup = new THREE.Group();
      armGroup.position.set(sign * 0.3, 0, 0);
      addHoloPart(armGroup, new THREE.CapsuleGeometry(0.062, 0.3, 6, 8), sign * 0.08, -0.14, 0.04, -0.22, 0, sign * 0.36);
      addHoloPart(armGroup, new THREE.CapsuleGeometry(0.052, 0.28, 6, 8), sign * 0.18, -0.34, 0.16, 0.52, 0, sign * 0.14);
      weaponPivot.add(armGroup);
      return armGroup;
    };
    leftArmPivot = buildFalseEchoArm(-1);
    rightArmPivot = buildFalseEchoArm(1);

    // Floating Horizontal Glitch-Distortion Shards orbiting the decoy body
    secondaryPivot.position.set(0, 1.1, 0);
    bodyGroup.add(secondaryPivot);
    const shardSpecs: Array<[number, number, number, number, number]> = [
      [-0.44, 0.52, 0.08, 0.24, 0.045],
      [0.48, 0.42, -0.06, 0.28, 0.05],
      [-0.36, 0.12, 0.18, 0.22, 0.04],
      [0.4, -0.16, 0.14, 0.26, 0.048],
      [-0.42, -0.42, -0.1, 0.2, 0.04],
      [0.32, 0.72, 0.12, 0.18, 0.036],
    ];
    for (const [sx, sy, sz, sw, sh] of shardSpecs) {
      const shard = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, 0.03), feGlitchShardMat);
      shard.position.set(sx, sy, sz);
      secondaryPivot.add(shard);
    }

    // Fractured Segmented Amethyst Holographic Floor Ring underneath False Echo
    for (let seg = 0; seg < 6; seg++) {
      const startAngle = (seg / 6) * Math.PI * 2;
      const arcMesh = new THREE.Mesh(
        new THREE.RingGeometry(0.56, 0.68, 8, 1, startAngle, Math.PI * 0.24),
        feGlitchShardMat
      );
      arcMesh.rotation.x = -Math.PI / 2;
      arcMesh.position.y = 0.035;
      bodyGroup.add(arcMesh);
    }
  } else if (archetype === 'scrapper') {
    const isSiphon = false;
    const isDecoy = false;
    // =========================================================================
    // SCRAPPER-X2 — Weathered Burnished-Copper Skeletal Hunter (Sheet 1, Panel 6)
    // Exposed dark steel pistons, 3-eyed orange insectoid head, twin dorsal
    // thrusters, reverse-jointed digitigrade legs with 3-claw feet & twin
    // silver-steel scissor pincer claws.
    // =========================================================================
    const copperArmorMat = new THREE.MeshStandardMaterial({
      color: isDecoy ? 0xf59e0b : isSiphon ? 0x10b981 : 0xa5623d,
      emissive: isDecoy ? 0x9333ea : isSiphon ? 0x047857 : 0x000000,
      emissiveIntensity: isDecoy ? 1.15 : isSiphon ? 0.45 : 0,
      bumpMap: armorBump,
      bumpScale: 0.012,
      roughness: 0.36,
      metalness: 0.72,
      transparent: isDecoy,
      opacity: isDecoy ? 0.74 : 1,
    });
    const crimsonPlateMat = new THREE.MeshStandardMaterial({
      color: isDecoy ? 0xc084fc : isSiphon ? 0xf59e0b : 0x6e3b24,
      roughness: 0.42,
      metalness: 0.68,
      transparent: isDecoy,
      opacity: isDecoy ? 0.78 : 1,
    });
    const darkBronzeMat = new THREE.MeshStandardMaterial({
      color: isDecoy ? 0x3b0764 : isSiphon ? 0x064e3b : 0x242931,
      roughness: 0.48,
      metalness: 0.76,
      transparent: isDecoy,
      opacity: isDecoy ? 0.72 : 1,
    });
    const pincerSteelMat = new THREE.MeshStandardMaterial({
      color: isDecoy ? 0xe9d5ff : 0xd0dae5,
      roughness: 0.18,
      metalness: 0.92,
      transparent: isDecoy,
      opacity: isDecoy ? 0.85 : 1,
    });
    const orangeOpticMat = new THREE.MeshStandardMaterial({
      color: 0xfdba74,
      emissive: 0xf97316,
      emissiveIntensity: 2.0,
      roughness: 0.12,
      metalness: 0.25,
    });

    // Articulated Reverse-Jointed Digitigrade Spring Legs with 3-Claw Feet
    const buildScrapperLeg = (sign: number) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(sign * 0.28, 0.82, -0.02);

      const thigh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.088, 0.34, 8, 12),
        copperArmorMat
      );
      thigh.position.set(0, -0.17, 0.09);
      thigh.rotation.x = -0.44;
      thigh.castShadow = enableShadows;
      legGroup.add(thigh);

      const thighPiston = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.028, 0.36, 8),
        darkBronzeMat
      );
      thighPiston.position.set(sign * 0.06, -0.17, 0.02);
      thighPiston.rotation.x = -0.44;
      legGroup.add(thighPiston);

      const shinGroup = new THREE.Group();
      shinGroup.position.set(0, -0.34, 0.18);
      legGroup.add(shinGroup);

      const kneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.082, 10, 10), darkBronzeMat);
      shinGroup.add(kneeJoint);

      const lowerShin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.068, 0.044, 0.46, 10),
        copperArmorMat
      );
      lowerShin.position.set(0, -0.18, -0.14);
      lowerShin.rotation.x = 0.36;
      lowerShin.castShadow = enableShadows;
      shinGroup.add(lowerShin);

      const shinStrut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.026, 0.42, 8),
        darkBronzeMat
      );
      shinStrut.position.set(0, -0.19, -0.08);
      shinStrut.rotation.x = 0.28;
      shinGroup.add(shinStrut);

      // 3-Claw Mechanical Foot
      for (const clawYaw of [-0.42, 0, 0.42]) {
        const clawToe = new THREE.Mesh(
          new THREE.ConeGeometry(0.032, 0.24, 5),
          darkBronzeMat
        );
        clawToe.rotation.x = Math.PI * 0.5;
        clawToe.rotation.z = -clawYaw;
        clawToe.position.set(Math.sin(clawYaw) * 0.08, -0.42, -0.18 + Math.cos(clawYaw) * 0.12);
        shinGroup.add(clawToe);
      }

      bodyGroup.add(legGroup);
      return { legGroup, shinGroup };
    };

    const sLeft = buildScrapperLeg(-1);
    const sRight = buildScrapperLeg(1);
    leftLegPivot = sLeft.legGroup;
    leftShinPivot = sLeft.shinGroup;
    rightLegPivot = sRight.legGroup;
    rightShinPivot = sRight.shinGroup;

    // Skeletal Pelvis & Exposed Hydraulic Spine
    const pelvis = new THREE.Mesh(
      new RoundedBoxGeometry(0.46, 0.22, 0.42, 3, 0.06),
      copperArmorMat
    );
    pelvis.position.set(0, 0.82, -0.02);
    bodyGroup.add(pelvis);
    primaryMeshes.push(pelvis);

    torsoPivot.position.set(0, 0.94, 0);

    const spineColumn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.11, 0.52, 10),
      darkBronzeMat
    );
    spineColumn.position.set(0, 0.22, 0.02);
    spineColumn.rotation.x = 0.24;
    torsoPivot.add(spineColumn);

    // Segmented Copper Skeletal Ribcage & Chest Carapace
    const torsoShell = new THREE.Mesh(
      new RoundedBoxGeometry(0.62, 0.36, 0.56, 3, 0.09),
      copperArmorMat
    );
    torsoShell.position.set(0, 0.44, 0.1);
    torsoShell.rotation.x = 0.22;
    torsoShell.castShadow = enableShadows;
    torsoPivot.add(torsoShell);
    primaryMeshes.push(torsoShell);

    for (let r = 0; r < 3; r++) {
      const rib = new THREE.Mesh(
        new THREE.TorusGeometry(0.22 - r * 0.025, 0.032, 8, 16, Math.PI * 1.3),
        crimsonPlateMat
      );
      rib.rotation.x = Math.PI / 2 + 0.2;
      rib.rotation.z = -Math.PI * 0.15;
      rib.position.set(0, 0.3 - r * 0.09, 0.08 - r * 0.02);
      torsoPivot.add(rib);
    }

    // Symmetrical Angular Burnished-Copper Shoulder Caps
    for (const side of [-1, 1]) {
      const shoulderPlate = new THREE.Mesh(
        new RoundedBoxGeometry(0.28, 0.2, 0.36, 3, 0.05),
        copperArmorMat
      );
      shoulderPlate.position.set(side * 0.42, 0.52, 0.08);
      shoulderPlate.rotation.z = -side * 0.28;
      shoulderPlate.castShadow = enableShadows;
      torsoPivot.add(shoulderPlate);
      primaryMeshes.push(shoulderPlate);
    }

    // Twin Prominent Dorsal Angled Exhaust Thrusters (Concept Panel 6)
    for (const side of [-1, 1]) {
      const thruster = new THREE.Mesh(
        new THREE.CylinderGeometry(0.095, 0.12, 0.48, 12),
        darkBronzeMat
      );
      thruster.rotation.x = -0.52;
      thruster.rotation.z = -side * 0.24;
      thruster.position.set(side * 0.24, 0.66, -0.22);
      thruster.castShadow = enableShadows;
      torsoPivot.add(thruster);

      const thrusterCollar = new THREE.Mesh(
        new THREE.TorusGeometry(0.1, 0.024, 8, 14),
        copperArmorMat
      );
      thrusterCollar.rotation.x = Math.PI / 2 - 0.52;
      thrusterCollar.rotation.y = side * 0.24;
      thrusterCollar.position.set(side * 0.29, 0.84, -0.33);
      torsoPivot.add(thrusterCollar);
    }

    // Articulated Rear Stabilizer Spine on secondaryPivot
    secondaryPivot.position.set(0, 0.82, -0.22);
    bodyGroup.add(secondaryPivot);
    const tailSpine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.075, 0.36, 8),
      darkBronzeMat
    );
    tailSpine.rotation.x = -Math.PI * 0.38;
    tailSpine.position.set(0, 0.04, -0.18);
    secondaryPivot.add(tailSpine);

    // Insectoid Oval Copper Head with 3 Glowing Orange Optic Eyes in Triangle Cluster
    headPivot.position.set(0, 0.64, 0.26);
    const headPod = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 14),
      copperArmorMat
    );
    headPod.scale.set(0.86, 0.78, 1.15);
    headPod.castShadow = enableShadows;
    headPivot.add(headPod);

    const headFaceMask = new THREE.Mesh(
      new RoundedBoxGeometry(0.24, 0.19, 0.14, 2, 0.04),
      darkBronzeMat
    );
    headFaceMask.position.set(0, -0.02, 0.17);
    headPivot.add(headFaceMask);

    // 3 Glowing Orange Insectoid Optic Eyes (2 upper outer + 1 lower center)
    const eyeCoords: Array<[number, number, number, number]> = [
      [-0.075, 0.032, 0.23, 0.034],
      [0.075, 0.032, 0.23, 0.034],
      [0, -0.042, 0.24, 0.03],
    ];
    for (const [ex, ey, ez, er] of eyeCoords) {
      const eyeMesh = new THREE.Mesh(
        new THREE.SphereGeometry(er, 10, 10),
        isSiphon || isDecoy ? coreMaterial : orangeOpticMat
      );
      eyeMesh.position.set(ex, ey, ez);
      headPivot.add(eyeMesh);
    }

    // Compact Recessed Chest Core
    coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), coreMaterial);
    coreMesh.position.set(0, 0.38, 0.38);
    torsoPivot.add(coreMesh);

    coreRimMesh = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.27, 24), coreRimMaterial);
    coreRimMesh.position.set(0, 0.38, 0.42);
    torsoPivot.add(coreRimMesh);

    // Independent Left & Right Articulated Arms with Curved Silver-Steel Dual-Blade Scissor Pincers
    weaponPivot.position.set(0, 0.46, 0.12);
    torsoPivot.add(weaponPivot);

    const buildPincerBlade = (isOuter: boolean) => {
      const pShape = new THREE.Shape();
      pShape.moveTo(0, 0);
      pShape.quadraticCurveTo(isOuter ? 0.18 : -0.14, 0.26, isOuter ? 0.04 : -0.02, 0.64);
      pShape.quadraticCurveTo(isOuter ? 0.08 : -0.06, 0.28, isOuter ? 0.03 : -0.03, 0.02);
      pShape.closePath();
      const geo = new THREE.ExtrudeGeometry(pShape, {
        depth: 0.032,
        bevelEnabled: true,
        bevelThickness: 0.008,
        bevelSize: 0.008,
        bevelSegments: 1,
      });
      geo.rotateX(Math.PI / 2);
      return geo;
    };
    const outerPincerGeo = buildPincerBlade(true);
    const innerPincerGeo = buildPincerBlade(false);

    const buildMantisArm = (side: number) => {
      const armGroup = new THREE.Group();
      armGroup.position.set(side * 0.48, 0, 0);
      weaponPivot.add(armGroup);

      const upperLimb = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.062, 0.32, 6, 10),
        darkBronzeMat
      );
      upperLimb.rotation.x = Math.PI * 0.24;
      upperLimb.position.set(side * 0.04, -0.14, 0.12);
      armGroup.add(upperLimb);

      const forearmCuff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.072, 0.056, 0.34, 10),
        copperArmorMat
      );
      forearmCuff.rotation.x = Math.PI * 0.44;
      forearmCuff.position.set(side * 0.06, -0.26, 0.34);
      armGroup.add(forearmCuff);

      const wristHub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.068, 0.068, 0.08, 10),
        darkBronzeMat
      );
      wristHub.position.set(side * 0.06, -0.3, 0.5);
      armGroup.add(wristHub);

      // Dual Opposing Curved Silver-Steel Scissor Pincer Jaws
      const outerJaw = new THREE.Mesh(outerPincerGeo, pincerSteelMat);
      outerJaw.position.set(side * 0.06, -0.3, 0.5);
      outerJaw.scale.x = side;
      outerJaw.castShadow = enableShadows;
      armGroup.add(outerJaw);

      const innerJaw = new THREE.Mesh(innerPincerGeo, pincerSteelMat);
      innerJaw.position.set(side * 0.06, -0.3, 0.5);
      innerJaw.scale.x = side;
      armGroup.add(innerJaw);

      return armGroup;
    };

    leftArmPivot = buildMantisArm(-1);
    rightArmPivot = buildMantisArm(1);
  } else if (isBossArchetype) {
    // =========================================================================
    // BOSS RIG: HELIX-04 / THE CHOIR / THE CURATOR / MATRON-V
    // Towering industrial containment machine with articulated hydraulic legs,
    // chapter-distinct segmented armor, physical left/right core shutters,
    // dual counter-rotating containment cage rings, right Pile-Bunker
    // Anchor Maul, and left Tri-Blade Helical Cleaver Assembly.
    // =========================================================================
    const ceramicArmorMat = new THREE.MeshStandardMaterial({
      color:
        archetype === 'choir'
          ? 0xd6f4ff
          : archetype === 'curator'
            ? 0xe2dcff
            : archetype === 'matron'
              ? 0xffd2da
              : 0x526072,
      bumpMap: armorBump,
      bumpScale: 0.02,
      roughnessMap: armorRoughness,
      roughness: 0.32,
      metalness: 0.78,
      envMapIntensity: 1.24,
    });
    const darkTitaniumMat = new THREE.MeshStandardMaterial({
      color:
        archetype === 'choir'
          ? 0x0d263e
          : archetype === 'curator'
            ? 0x1a1744
            : archetype === 'matron'
              ? 0x3b0b1a
              : 0x1a2029,
      bumpMap: armorBump,
      bumpScale: 0.022,
      roughnessMap: armorRoughness,
      roughness: 0.54,
      metalness: 0.72,
      envMapIntensity: 1.16,
    });
    const slateFrameMat = new THREE.MeshStandardMaterial({
      color:
        archetype === 'choir'
          ? 0x38bdf8
          : archetype === 'curator'
            ? 0x7c3aed
            : archetype === 'matron'
              ? 0xbe123c
              : 0x3c4757,
      bumpMap: armorBump,
      bumpScale: 0.012,
      roughnessMap: armorRoughness,
      roughness: 0.26,
      metalness: 0.88,
      envMapIntensity: 1.28,
    });
    const bronzeActuatorMat = new THREE.MeshStandardMaterial({
      color: archetype === 'matron' ? 0xf43f5e : 0xeab308,
      bumpMap: armorBump,
      bumpScale: 0.01,
      roughnessMap: armorRoughness,
      roughness: 0.22,
      metalness: 0.92,
      envMapIntensity: 1.32,
    });
    const warningAmberMat = new THREE.MeshStandardMaterial({
      color: archetype === 'curator' ? 0xa855f7 : archetype === 'matron' ? 0xf43f5e : 0xf59e0b,
      emissive: archetype === 'curator' ? 0x7e22ce : archetype === 'matron' ? 0xe11d48 : 0xea580c,
      emissiveIntensity: 1.55,
      roughness: 0.2,
      metalness: 0.5,
    });
    const cyanConduitMat = new THREE.MeshStandardMaterial({
      color: archetype === 'matron' ? 0xfda4af : 0x38bdf8,
      emissive: archetype === 'matron' ? 0xe11d48 : 0x06b6d4,
      emissiveIntensity: 1.65,
      roughness: 0.15,
      metalness: 0.45,
    });

    if (archetype === 'warden_prime') {
      // =========================================================================
      // WARDEN PRIME — Sovereign Obsidian & Mirror-Chrome Knight Mech (Panel 7)
      // Golden V-crested sovereign helm, 3 glowing cyan-gold trefoil crown halos,
      // angular white-chrome shoulder wings, glowing cyan circular chest reactor
      // core + cyan veins, and long precision plasma rail-lance.
      // =========================================================================
      const wpObsidianMat = new THREE.MeshStandardMaterial({
        color: 0x10151e,
        bumpMap: armorBump,
        bumpScale: 0.008,
        roughness: 0.32,
        metalness: 0.72,
      });
      const wpChromeMat = new THREE.MeshStandardMaterial({
        color: 0xedf4fc,
        bumpMap: armorBump,
        bumpScale: 0.005,
        roughness: 0.13,
        metalness: 0.94,
      });
      const wpGoldMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.45,
        roughness: 0.18,
        metalness: 0.92,
      });
      const wpHaloGoldMat = new THREE.MeshStandardMaterial({
        color: 0xfde047,
        emissive: 0x84cc16,
        emissiveIntensity: 1.45,
        roughness: 0.16,
        metalness: 0.6,
      });
      const wpCyanGlowMat = new THREE.MeshStandardMaterial({
        color: 0x7dd3fc,
        emissive: 0x06b6d4,
        emissiveIntensity: 2.0,
        roughness: 0.1,
        metalness: 0.3,
      });

      // 1. Tall Sleek Sovereign Knight Legs (Obsidian Undersuit + Mirror-Chrome Greaves)
      const buildWardenLeg = (sign: number) => {
        const legGroup = new THREE.Group();
        legGroup.position.set(sign * 0.42, 1.18, 0);

        const thighCore = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.18, 0.5, 8, 14),
          wpObsidianMat
        );
        thighCore.position.y = -0.26;
        thighCore.castShadow = enableShadows;
        legGroup.add(thighCore);

        const thighChromePlate = new THREE.Mesh(
          new RoundedBoxGeometry(0.32, 0.54, 0.34, 3, 0.07),
          wpChromeMat
        );
        thighChromePlate.position.set(sign * 0.08, -0.24, 0.06);
        thighChromePlate.rotation.y = sign * 0.2;
        thighChromePlate.castShadow = enableShadows;
        legGroup.add(thighChromePlate);
        primaryMeshes.push(thighChromePlate);

        const thighVein = new THREE.Mesh(
          new THREE.BoxGeometry(0.036, 0.44, 0.04),
          wpCyanGlowMat
        );
        thighVein.position.set(sign * 0.02, -0.24, 0.22);
        legGroup.add(thighVein);

        const shinGroup = new THREE.Group();
        shinGroup.position.set(0, -0.58, 0);
        legGroup.add(shinGroup);

        const kneeFin = new THREE.Mesh(
          new THREE.ConeGeometry(0.14, 0.3, 4),
          wpChromeMat
        );
        kneeFin.position.set(0, 0.04, 0.16);
        kneeFin.rotation.x = 0.22;
        shinGroup.add(kneeFin);

        const shinObsidian = new THREE.Mesh(
          new THREE.CylinderGeometry(0.16, 0.11, 0.62, 12),
          wpObsidianMat
        );
        shinObsidian.position.set(0, -0.28, 0);
        shinObsidian.castShadow = enableShadows;
        shinGroup.add(shinObsidian);

        const shinChromeGreave = new THREE.Mesh(
          new RoundedBoxGeometry(0.26, 0.56, 0.26, 3, 0.06),
          wpChromeMat
        );
        shinChromeGreave.position.set(sign * 0.05, -0.28, 0.08);
        shinChromeGreave.castShadow = enableShadows;
        shinGroup.add(shinChromeGreave);
        primaryMeshes.push(shinChromeGreave);

        const sabatonFoot = new THREE.Mesh(
          new RoundedBoxGeometry(0.3, 0.16, 0.54, 3, 0.05),
          wpChromeMat
        );
        sabatonFoot.position.set(0, -0.56, 0.1);
        shinGroup.add(sabatonFoot);

        bodyGroup.add(legGroup);
        return { legGroup, shinGroup };
      };

      const wLeft = buildWardenLeg(-1);
      const wRight = buildWardenLeg(1);
      leftLegPivot = wLeft.legGroup;
      leftShinPivot = wLeft.shinGroup;
      rightLegPivot = wRight.legGroup;
      rightShinPivot = wRight.shinGroup;

      // 2. Tapered Sovereign Pelvis & Layered V-Armor Torso
      const wpPelvis = new THREE.Mesh(
        new RoundedBoxGeometry(0.96, 0.34, 0.68, 3, 0.08),
        wpObsidianMat
      );
      wpPelvis.position.y = 1.24;
      wpPelvis.castShadow = enableShadows;
      bodyGroup.add(wpPelvis);
      primaryMeshes.push(wpPelvis);

      const pelvisFrontCrest = new THREE.Mesh(
        new THREE.ConeGeometry(0.28, 0.42, 4),
        wpChromeMat
      );
      pelvisFrontCrest.rotation.x = Math.PI;
      pelvisFrontCrest.position.set(0, 1.18, 0.3);
      bodyGroup.add(pelvisFrontCrest);

      torsoPivot.position.set(0, 1.44, 0);

      const wpWaist = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.29, 0.44, 12),
        wpObsidianMat
      );
      wpWaist.position.y = 0.18;
      torsoPivot.add(wpWaist);

      // Sculpted V-Tapered Obsidian & Mirror-Chrome Knight Breastplate
      const wpChestBase = new THREE.Mesh(
        new RoundedBoxGeometry(1.06, 0.88, 0.7, 4, 0.12),
        wpObsidianMat
      );
      wpChestBase.position.set(0, 0.72, 0);
      wpChestBase.castShadow = enableShadows;
      torsoPivot.add(wpChestBase);
      primaryMeshes.push(wpChestBase);

      for (const side of [-1, 1]) {
        const chestChromeWing = new THREE.Mesh(
          new RoundedBoxGeometry(0.46, 0.58, 0.2, 3, 0.05),
          wpChromeMat
        );
        chestChromeWing.position.set(side * 0.4, 0.8, 0.3);
        chestChromeWing.rotation.z = side * 0.32;
        chestChromeWing.rotation.y = -side * 0.24;
        chestChromeWing.castShadow = enableShadows;
        torsoPivot.add(chestChromeWing);
        primaryMeshes.push(chestChromeWing);

        // Glowing Cyan Rib Energy Veins
        const ribVein = new THREE.Mesh(
          new THREE.BoxGeometry(0.055, 0.48, 0.055),
          wpCyanGlowMat
        );
        ribVein.position.set(side * 0.22, 0.42, 0.35);
        ribVein.rotation.z = -side * 0.24;
        torsoPivot.add(ribVein);
      }

      // Always-Visible Glowing Cyan Circular Chest Reactor Core + Exposure Ring (Panel 7)
      const coreFrame = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.044, 12, 28),
        wpChromeMat
      );
      coreFrame.position.set(0, 0.76, 0.38);
      torsoPivot.add(coreFrame);

      const coreCyanHalo = new THREE.Mesh(
        new THREE.TorusGeometry(0.21, 0.036, 12, 28),
        wpCyanGlowMat
      );
      coreCyanHalo.position.set(0, 0.76, 0.41);
      torsoPivot.add(coreCyanHalo);

      coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 20), coreMaterial);
      coreMesh.scale.set(1, 1, 0.56);
      coreMesh.position.set(0, 0.76, 0.39);
      torsoPivot.add(coreMesh);

      coreRimMesh = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.44, 32), coreRimMaterial);
      coreRimMesh.position.set(0, 0.76, 0.46);
      torsoPivot.add(coreRimMesh);

      // Sleek Winged Side Core Shutters flanking the Cyan Core (swing open wider when exposed)
      const buildWpShutter = (sign: number) => {
        const sp = new THREE.Group();
        sp.position.set(sign * 0.31, 0.76, 0.42);
        torsoPivot.add(sp);
        const plate = new THREE.Mesh(
          new RoundedBoxGeometry(0.18, 0.46, 0.08, 2, 0.02),
          wpChromeMat
        );
        plate.position.set(sign * 0.05, 0, 0);
        sp.add(plate);
        return sp;
      };
      leftShutterPivot = buildWpShutter(-1);
      rightShutterPivot = buildWpShutter(1);

      // Sweeping Angular Mirror-Chrome Shoulder Wing Pauldrons
      const wingPauldronGeo = createExtrudedFinGeometry(0.14, 0.74, 0.88, 0.46);
      for (const side of [-1, 1]) {
        const shoulderWing = new THREE.Mesh(wingPauldronGeo, wpChromeMat);
        shoulderWing.position.set(side * 0.94, 1.06, 0.02);
        shoulderWing.rotation.z = -side * 0.62;
        shoulderWing.rotation.y = side * 0.18;
        shoulderWing.castShadow = enableShadows;
        torsoPivot.add(shoulderWing);
        primaryMeshes.push(shoulderWing);

        const shoulderSubPlate = new THREE.Mesh(
          new RoundedBoxGeometry(0.48, 0.32, 0.64, 3, 0.06),
          wpObsidianMat
        );
        shoulderSubPlate.position.set(side * 0.86, 0.94, 0.02);
        shoulderSubPlate.rotation.z = -side * 0.25;
        torsoPivot.add(shoulderSubPlate);
      }

      // 3. Sovereign Golden V-Crested Knight Helm
      headPivot.position.set(0, 1.44, 0.08);
      const wpHelm = new THREE.Mesh(
        new THREE.ConeGeometry(0.28, 0.56, 6),
        wpChromeMat
      );
      wpHelm.position.set(0, 0.08, 0);
      wpHelm.castShadow = enableShadows;
      headPivot.add(wpHelm);

      const wpFaceplate = new THREE.Mesh(
        new RoundedBoxGeometry(0.3, 0.34, 0.26, 3, 0.06),
        wpObsidianMat
      );
      wpFaceplate.position.set(0, -0.02, 0.08);
      headPivot.add(wpFaceplate);

      const wpVisor = new THREE.Mesh(
        new RoundedBoxGeometry(0.24, 0.07, 0.08, 2, 0.02),
        wpCyanGlowMat
      );
      wpVisor.position.set(0, 0.01, 0.21);
      headPivot.add(wpVisor);

      // Prominent Golden V-Crown Forehead Crest
      for (const side of [-1, 1]) {
        const vHorn = new THREE.Mesh(
          new RoundedBoxGeometry(0.06, 0.34, 0.05, 2, 0.012),
          wpGoldMat
        );
        vHorn.position.set(side * 0.13, 0.2, 0.18);
        vHorn.rotation.z = -side * 0.54;
        headPivot.add(vHorn);
      }

      // 4. Signature 3 Glowing Cyan-Gold Concentric Floating Halo Crown Rings (Trefoil Triad!)
      const buildHaloCrown = (outerR: number, innerR: number) => {
        const g = new THREE.Group();
        const outerGoldHalo = new THREE.Mesh(
          new THREE.TorusGeometry(outerR, 0.036, 12, 42),
          wpHaloGoldMat
        );
        g.add(outerGoldHalo);
        const innerCyanHalo = new THREE.Mesh(
          new THREE.TorusGeometry(innerR, 0.032, 12, 42),
          wpCyanGlowMat
        );
        g.add(innerCyanHalo);
        const chromeArc = new THREE.Mesh(
          new THREE.TorusGeometry((outerR + innerR) * 0.5, 0.016, 8, 32, Math.PI * 1.4),
          wpChromeMat
        );
        g.add(chromeArc);
        return g;
      };

      // Top Sovereign Halo (centered directly behind the crown of the head)
      outerHelixRing = new THREE.Group();
      outerHelixRing.position.set(0, 1.66, -0.24);
      outerHelixRing.add(buildHaloCrown(0.5, 0.4));
      torsoPivot.add(outerHelixRing);

      // Inner Counter-Rotating Radiant Ring inside Top Halo
      innerHelixRing = new THREE.Group();
      innerHelixRing.position.set(0, 1.66, -0.24);
      const topAccentRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.32, 0.02, 8, 28, Math.PI * 1.2),
        wpCyanGlowMat
      );
      innerHelixRing.add(topAccentRing);
      torsoPivot.add(innerHelixRing);

      // Left & Right Shoulder Flank Halos (Trefoil Triad!)
      for (const side of [-1, 1]) {
        const flankHalo = buildHaloCrown(0.46, 0.36);
        flankHalo.position.set(side * 0.98, 1.24, -0.26);
        flankHalo.userData.baseY = 1.24;
        torsoPivot.add(flankHalo);
        auxiliaryPivots.push(flankHalo);
      }

      // 5. Right Arm (weaponPivot): DIRECTIVE LANCE — Regal Obsidian-Gold Winged Polearm Halberd with Ice-Cyan Plasma Spearhead (Sheet 8, Panel 5)
      weaponPivot.position.set(0.92, 0.78, 0.14);
      torsoPivot.add(weaponPivot);

      const wpRightArm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.14, 0.48, 8, 12),
        wpObsidianMat
      );
      wpRightArm.position.set(0, -0.22, 0.16);
      wpRightArm.rotation.x = Math.PI * 0.35;
      weaponPivot.add(wpRightArm);

      const wpRightGauntlet = new THREE.Mesh(
        new RoundedBoxGeometry(0.24, 0.24, 0.42, 3, 0.05),
        wpChromeMat
      );
      wpRightGauntlet.position.set(0, -0.28, 0.38);
      weaponPivot.add(wpRightGauntlet);

      // Long obsidian-chrome halberd shaft with antique-gold filigree grip collars
      const lanceShaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.052, 0.058, 3.05, 12),
        wpObsidianMat
      );
      lanceShaft.rotation.x = Math.PI / 2;
      lanceShaft.position.set(0, -0.28, 0.88);
      lanceShaft.castShadow = enableShadows;
      weaponPivot.add(lanceShaft);

      for (const cz of [-0.42, 0.32, 1.05, 1.65, 2.02]) {
        const goldCollar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.088, 0.088, 0.11, 12),
          wpGoldMat
        );
        goldCollar.rotation.x = Math.PI / 2;
        goldCollar.position.set(0, -0.28, cz);
        weaponPivot.add(goldCollar);
      }

      // Sculpted Swept-Back Silver & Antique-Gold Winged Crossguard
      for (const wSide of [-1, 1]) {
        const wingPrimary = new THREE.Mesh(
          new RoundedBoxGeometry(0.46, 0.14, 0.12, 2, 0.025),
          wpChromeMat
        );
        wingPrimary.position.set(wSide * 0.22, -0.28, 2.06);
        wingPrimary.rotation.y = -wSide * 0.54;
        weaponPivot.add(wingPrimary);

        const wingFeather = new THREE.Mesh(
          new RoundedBoxGeometry(0.32, 0.09, 0.09, 2, 0.02),
          wpGoldMat
        );
        wingFeather.position.set(wSide * 0.28, -0.28, 1.94);
        wingFeather.rotation.y = -wSide * 0.72;
        weaponPivot.add(wingFeather);
      }

      // Blazing Ice-Cyan Faceted Plasma Spearhead (front) & Glowing Cyan Counterweight Tip (rear)
      const lanceSpearhead = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 1.18, 4),
        wpCyanGlowMat
      );
      lanceSpearhead.rotation.x = Math.PI / 2;
      lanceSpearhead.scale.set(0.48, 1.0, 1.0);
      lanceSpearhead.position.set(0, -0.28, 2.74);
      weaponPivot.add(lanceSpearhead);

      const lanceInnerCore = new THREE.Mesh(
        new THREE.ConeGeometry(0.095, 0.92, 4),
        wpChromeMat
      );
      lanceInnerCore.rotation.x = Math.PI / 2;
      lanceInnerCore.scale.set(0.55, 1.0, 1.0);
      lanceInnerCore.position.set(0, -0.28, 2.52);
      weaponPivot.add(lanceInnerCore);

      const lanceRearTip = new THREE.Mesh(
        new THREE.ConeGeometry(0.085, 0.42, 4),
        wpCyanGlowMat
      );
      lanceRearTip.rotation.x = -Math.PI / 2;
      lanceRearTip.position.set(0, -0.28, -0.82);
      weaponPivot.add(lanceRearTip);

      // Left Arm (secondaryPivot): Armored Knight Gauntlet & Phase Buckler Fin
      secondaryPivot.position.set(-0.92, 0.78, 0.14);
      torsoPivot.add(secondaryPivot);

      const wpLeftArm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.14, 0.48, 8, 12),
        wpObsidianMat
      );
      wpLeftArm.position.set(0, -0.22, 0.16);
      wpLeftArm.rotation.x = Math.PI * 0.34;
      secondaryPivot.add(wpLeftArm);

      const wpLeftGauntlet = new THREE.Mesh(
        new RoundedBoxGeometry(0.24, 0.24, 0.48, 3, 0.05),
        wpChromeMat
      );
      wpLeftGauntlet.position.set(-0.04, -0.3, 0.42);
      secondaryPivot.add(wpLeftGauntlet);

      const wpForearmBlade = new THREE.Mesh(
        createCurvedBladeGeometry(1.05, 0.22, 0.045),
        wpCyanGlowMat
      );
      wpForearmBlade.position.set(-0.12, -0.3, 0.46);
      secondaryPivot.add(wpForearmBlade);
    } else if (id === 'echo-zero') {
      // =========================================================================
      // ECHO-ZERO — Secret Mirror-Sera Paradox Boss (Sheet 13, Panel 1)
      // Sleek humanoid obsidian-violet articulated armor with brushed gold trim,
      // glowing magenta V-visor, dual crossed pairs of floating golden-violet
      // Chrono Halo rings behind BOTH shoulders, and right-hand violet-gold
      // twin-fullered energy phase-blade.
      // =========================================================================
      const echoObsidianMat = new THREE.MeshStandardMaterial({
        color: 0x261d3c,
        bumpMap: armorBump,
        bumpScale: 0.008,
        roughness: 0.3,
        metalness: 0.72,
      });
      const echoSuitMat = new THREE.MeshStandardMaterial({
        color: 0x110c21,
        roughness: 0.56,
        metalness: 0.42,
      });
      const echoGoldMat = new THREE.MeshStandardMaterial({
        color: 0xdca846,
        emissive: 0x78490c,
        emissiveIntensity: 0.32,
        roughness: 0.22,
        metalness: 0.92,
      });
      const echoMagentaMat = new THREE.MeshStandardMaterial({
        color: 0xf542ff,
        emissive: 0xd946ef,
        emissiveIntensity: 2.35,
        roughness: 0.12,
        metalness: 0.25,
      });
      const echoVioletBladeMat = new THREE.MeshStandardMaterial({
        color: 0xd8b4fe,
        emissive: 0x9333ea,
        emissiveIntensity: 2.1,
        roughness: 0.12,
        metalness: 0.65,
      });

      coreMaterial.color.setHex(0xfde047);
      coreMaterial.emissive.setHex(0xe879f9);
      coreMaterial.emissiveIntensity = 2.4;
      coreRimMaterial.color.setHex(0xfde047);

      // Heroic 1.28x boss scale on sleek humanoid proportions
      bodyGroup.scale.setScalar(1.28);

      // 1. Articulated Obsidian-Violet & Gold Legs
      const buildEchoLeg = (sign: number) => {
        const legPivot = new THREE.Group();
        legPivot.position.set(sign * 0.2, 1.02, 0);

        const thigh = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.115, 0.34, 8, 14),
          echoObsidianMat
        );
        thigh.position.y = -0.22;
        thigh.castShadow = enableShadows;
        legPivot.add(thigh);
        primaryMeshes.push(thigh);

        // Glowing violet thigh seam
        const thighStrip = new THREE.Mesh(
          new RoundedBoxGeometry(0.032, 0.26, 0.04, 1, 0.008),
          echoMagentaMat
        );
        thighStrip.position.set(sign * 0.1, -0.22, 0.04);
        legPivot.add(thighStrip);

        const shinPivot = new THREE.Group();
        shinPivot.position.set(0, -0.46, 0);
        legPivot.add(shinPivot);

        const kneeGold = new THREE.Mesh(
          new RoundedBoxGeometry(0.14, 0.14, 0.12, 2, 0.03),
          echoGoldMat
        );
        kneeGold.position.set(0, 0.01, 0.08);
        shinPivot.add(kneeGold);

        const shin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.105, 0.084, 0.38, 14),
          echoObsidianMat
        );
        shin.position.set(0, -0.22, 0.01);
        shin.castShadow = enableShadows;
        shinPivot.add(shin);
        primaryMeshes.push(shin);

        const boot = new THREE.Mesh(
          new RoundedBoxGeometry(0.2, 0.14, 0.34, 3, 0.05),
          echoObsidianMat
        );
        boot.position.set(0, -0.46, 0.05);
        shinPivot.add(boot);

        const ankleGold = new THREE.Mesh(
          new THREE.TorusGeometry(0.095, 0.022, 8, 18),
          echoGoldMat
        );
        ankleGold.rotation.x = Math.PI * 0.5;
        ankleGold.position.set(0, -0.39, 0.02);
        shinPivot.add(ankleGold);

        bodyGroup.add(legPivot);
        return { legPivot, shinPivot };
      };

      const echoLeftLeg = buildEchoLeg(-1);
      const echoRightLeg = buildEchoLeg(1);
      leftLegPivot = echoLeftLeg.legPivot;
      leftShinPivot = echoLeftLeg.shinPivot;
      rightLegPivot = echoRightLeg.legPivot;
      rightShinPivot = echoRightLeg.shinPivot;

      // 2. Sculpted Pelvis & V-Tapered Obsidian-Gold Torso Cuirass
      const pelvis = new THREE.Mesh(
        new RoundedBoxGeometry(0.46, 0.22, 0.3, 3, 0.06),
        echoSuitMat
      );
      pelvis.position.set(0, 1.0, 0);
      bodyGroup.add(pelvis);

      const beltGold = new THREE.Mesh(
        new RoundedBoxGeometry(0.49, 0.075, 0.33, 2, 0.02),
        echoGoldMat
      );
      beltGold.position.set(0, 1.09, 0.01);
      bodyGroup.add(beltGold);

      torsoPivot.position.set(0, 1.08, 0);

      const abdomen = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.18, 0.24, 8, 14),
        echoSuitMat
      );
      abdomen.position.set(0, 0.16, 0);
      abdomen.scale.set(1.06, 1, 0.8);
      torsoPivot.add(abdomen);

      const chestCuirass = new THREE.Mesh(
        new RoundedBoxGeometry(0.56, 0.44, 0.36, 4, 0.09),
        echoObsidianMat
      );
      chestCuirass.position.set(0, 0.38, 0.02);
      chestCuirass.castShadow = enableShadows;
      torsoPivot.add(chestCuirass);
      primaryMeshes.push(chestCuirass);

      // Brushed gold V-chevron breastplate collar trim (Sheet 13 Panel 1 signature)
      for (const side of [-1, 1]) {
        const chestGoldBar = new THREE.Mesh(
          new RoundedBoxGeometry(0.24, 0.068, 0.055, 2, 0.018),
          echoGoldMat
        );
        chestGoldBar.position.set(side * 0.13, 0.46, 0.195);
        chestGoldBar.rotation.z = -side * 0.42;
        torsoPivot.add(chestGoldBar);
      }

      // Chest Chrono Core & Rim
      coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), coreMaterial);
      coreMesh.position.set(0, 0.36, 0.21);
      torsoPivot.add(coreMesh);

      coreRimMesh = new THREE.Mesh(new THREE.RingGeometry(0.13, 0.19, 20), coreRimMaterial);
      coreRimMesh.position.set(0, 0.36, 0.23);
      torsoPivot.add(coreRimMesh);

      // 3. Sleek Helmet with Glowing Magenta V-Visor (Sheet 13 Panel 1)
      headPivot.position.set(0, 0.78, 0.02);
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.14, 12), echoSuitMat);
      neck.position.set(0, -0.11, 0);
      headPivot.add(neck);

      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 16), echoObsidianMat);
      helmet.scale.set(0.92, 1.08, 1.02);
      helmet.castShadow = enableShadows;
      headPivot.add(helmet);
      primaryMeshes.push(helmet);

      const helmetGoldRidge = new THREE.Mesh(
        new RoundedBoxGeometry(0.06, 0.12, 0.28, 2, 0.02),
        echoGoldMat
      );
      helmetGoldRidge.position.set(0, 0.16, -0.02);
      headPivot.add(helmetGoldRidge);

      // Glowing Magenta V-Visor face shield
      const visorVLeft = new THREE.Mesh(
        new RoundedBoxGeometry(0.14, 0.12, 0.05, 2, 0.015),
        echoMagentaMat
      );
      visorVLeft.position.set(-0.058, 0.02, 0.175);
      visorVLeft.rotation.z = -0.35;
      visorVLeft.rotation.y = -0.32;
      headPivot.add(visorVLeft);

      const visorVRight = new THREE.Mesh(
        new RoundedBoxGeometry(0.14, 0.12, 0.05, 2, 0.015),
        echoMagentaMat
      );
      visorVRight.position.set(0.058, 0.02, 0.175);
      visorVRight.rotation.z = 0.35;
      visorVRight.rotation.y = 0.32;
      headPivot.add(visorVRight);

      const visorVTip = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.12, 4), echoMagentaMat);
      visorVTip.position.set(0, -0.035, 0.185);
      visorVTip.rotation.z = Math.PI;
      headPivot.add(visorVTip);

      // 4. Dual Crossed Pairs of Floating Golden-Violet Chrono Halo Rings behind BOTH Shoulders!
      const buildCrossedShoulderHalos = (side: number): THREE.Group => {
        const cluster = new THREE.Group();
        cluster.position.set(side * 0.56, 0.78, -0.28);

        for (let r = 0; r < 2; r++) {
          const ringSub = new THREE.Group();
          ringSub.rotation.z = side * (r === 0 ? 0.58 : -0.58);
          ringSub.rotation.y = side * (r === 0 ? 0.24 : -0.24);
          ringSub.scale.set(1.25, 0.68, 1);

          const goldOuter = new THREE.Mesh(
            new THREE.TorusGeometry(0.42, 0.028, 10, 32),
            echoGoldMat
          );
          ringSub.add(goldOuter);

          const violetInner = new THREE.Mesh(
            new THREE.TorusGeometry(0.37, 0.022, 8, 28),
            echoMagentaMat
          );
          ringSub.add(violetInner);

          cluster.add(ringSub);
        }
        return cluster;
      };

      outerHelixRing = buildCrossedShoulderHalos(-1);
      innerHelixRing = buildCrossedShoulderHalos(1);
      torsoPivot.add(outerHelixRing);
      torsoPivot.add(innerHelixRing);

      // 5. Left Arm (secondaryPivot) & Right Sword Arm (weaponPivot) with Violet-Gold Phase-Blade
      secondaryPivot = new THREE.Group();
      secondaryPivot.position.set(-0.38, 0.52, 0);
      torsoPivot.add(secondaryPivot);

      const leftPauldron = new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.65),
        echoObsidianMat
      );
      leftPauldron.rotation.z = 0.45;
      secondaryPivot.add(leftPauldron);
      primaryMeshes.push(leftPauldron);

      const leftPauldronGold = new THREE.Mesh(
        new THREE.TorusGeometry(0.16, 0.022, 8, 20),
        echoGoldMat
      );
      leftPauldronGold.rotation.x = Math.PI * 0.46;
      leftPauldronGold.rotation.y = 0.35;
      secondaryPivot.add(leftPauldronGold);

      const leftArmLimb = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.082, 0.44, 8, 12),
        echoObsidianMat
      );
      leftArmLimb.position.set(-0.04, -0.28, 0.04);
      leftArmLimb.rotation.x = -0.18;
      secondaryPivot.add(leftArmLimb);

      const leftCuffGold = new THREE.Mesh(
        new THREE.TorusGeometry(0.082, 0.018, 8, 16),
        echoGoldMat
      );
      leftCuffGold.rotation.x = Math.PI * 0.5;
      leftCuffGold.position.set(-0.04, -0.44, 0.08);
      secondaryPivot.add(leftCuffGold);

      weaponPivot = new THREE.Group();
      weaponPivot.position.set(0.38, 0.52, 0);
      torsoPivot.add(weaponPivot);

      const rightPauldron = new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.65),
        echoObsidianMat
      );
      rightPauldron.rotation.z = -0.45;
      weaponPivot.add(rightPauldron);
      primaryMeshes.push(rightPauldron);

      const rightPauldronGold = new THREE.Mesh(
        new THREE.TorusGeometry(0.16, 0.022, 8, 20),
        echoGoldMat
      );
      rightPauldronGold.rotation.x = Math.PI * 0.46;
      rightPauldronGold.rotation.y = -0.35;
      weaponPivot.add(rightPauldronGold);

      const rightArmLimb = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.082, 0.44, 8, 12),
        echoObsidianMat
      );
      rightArmLimb.position.set(0.04, -0.28, 0.06);
      rightArmLimb.rotation.x = -0.26;
      weaponPivot.add(rightArmLimb);

      // Right-hand Violet-Gold Twin-Fullered Energy Phase-Blade (Sheet 13 Panel 1)
      const bladeGroup = new THREE.Group();
      bladeGroup.position.set(0.06, -0.5, 0.22);
      bladeGroup.rotation.x = 0.28;
      weaponPivot.add(bladeGroup);

      const swordGrip = new THREE.Mesh(
        new THREE.CylinderGeometry(0.032, 0.036, 0.34, 10),
        echoSuitMat
      );
      swordGrip.rotation.x = Math.PI * 0.5;
      bladeGroup.add(swordGrip);

      const swordGuard = new THREE.Mesh(
        new RoundedBoxGeometry(0.24, 0.07, 0.08, 2, 0.02),
        echoGoldMat
      );
      swordGuard.position.z = 0.18;
      bladeGroup.add(swordGuard);

      const swordBlade = new THREE.Mesh(
        createCurvedBladeGeometry(1.38, 0.16, 0.038),
        echoVioletBladeMat
      );
      swordBlade.position.set(0, 0, 0.22);
      bladeGroup.add(swordBlade);

      const swordFuller = new THREE.Mesh(
        new RoundedBoxGeometry(0.026, 0.042, 1.05, 1, 0.008),
        echoMagentaMat
      );
      swordFuller.position.set(0, 0, 0.78);
      bladeGroup.add(swordFuller);

      // Empty shutter pivots so boss core-exposure animation never errors
      leftShutterPivot = new THREE.Group();
      rightShutterPivot = new THREE.Group();
      torsoPivot.add(leftShutterPivot, rightShutterPivot);
    } else if (archetype !== 'helix') {
      const bespoke = buildBespokeBossChassis(
        archetype,
        bodyGroup,
        torsoPivot,
        headPivot,
        coreMaterial,
        coreRimMaterial,
        primaryMeshes,
        enableShadows,
        armorBump
      );
      coreMesh = bespoke.coreMesh;
      coreRimMesh = bespoke.coreRimMesh;
      weaponPivot = bespoke.weaponPivot;
      secondaryPivot = bespoke.secondaryPivot;
      outerHelixRing = bespoke.outerHelixRing;
      innerHelixRing = bespoke.innerHelixRing;
      leftShutterPivot = bespoke.leftShutterPivot;
      rightShutterPivot = bespoke.rightShutterPivot;
      auxiliaryPivots = bespoke.auxiliaryPivots;
    } else {
    // 1. Articulated Heavy Hydraulic Containment Legs
    const buildHelixLeg = (sign: number) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(sign * 0.64, 1.02, 0);

      const upperStrut = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.24, 0.42, 8, 16),
        darkTitaniumMat
      );
      upperStrut.position.y = -0.22;
      upperStrut.castShadow = enableShadows;
      legGroup.add(upperStrut);

      const thighPlate = new THREE.Mesh(
        new RoundedBoxGeometry(0.52, 0.48, 0.56, 3, 0.08),
        ceramicArmorMat
      );
      thighPlate.position.set(sign * 0.05, -0.2, 0.04);
      thighPlate.castShadow = enableShadows;
      legGroup.add(thighPlate);
      primaryMeshes.push(thighPlate);

      const shinGroup = new THREE.Group();
      shinGroup.position.set(0, -0.46, 0);
      legGroup.add(shinGroup);

      const kneeActuator = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.54, 14),
        bronzeActuatorMat
      );
      kneeActuator.rotation.z = Math.PI / 2;
      shinGroup.add(kneeActuator);

      const shinArmor = new THREE.Mesh(
        new RoundedBoxGeometry(0.54, 0.56, 0.62, 3, 0.09),
        ceramicArmorMat
      );
      shinArmor.position.set(0, -0.26, 0.05);
      shinArmor.castShadow = enableShadows;
      shinGroup.add(shinArmor);
      primaryMeshes.push(shinArmor);

      const stabilizerFoot = new THREE.Mesh(
        new RoundedBoxGeometry(0.64, 0.24, 0.82, 3, 0.07),
        slateFrameMat
      );
      stabilizerFoot.position.set(0, -0.5, 0.1);
      shinGroup.add(stabilizerFoot);

      bodyGroup.add(legGroup);
      return { legGroup, shinGroup };
    };

    const hLeft = buildHelixLeg(-1);
    const hRight = buildHelixLeg(1);
    leftLegPivot = hLeft.legGroup;
    leftShinPivot = hLeft.shinGroup;
    rightLegPivot = hRight.legGroup;
    rightShinPivot = hRight.shinGroup;

    // 2. Heavy Pelvis Plinth & Gyroscopic Waist Coupling
    const pelvisHousing = new THREE.Mesh(
      new RoundedBoxGeometry(1.56, 0.46, 1.18, 4, 0.12),
      darkTitaniumMat
    );
    pelvisHousing.position.y = 1.06;
    pelvisHousing.castShadow = enableShadows;
    bodyGroup.add(pelvisHousing);
    primaryMeshes.push(pelvisHousing);

    torsoPivot.position.set(0, 1.32, 0);

    const waistColumn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.66, 0.76, 0.42, 20),
      slateFrameMat
    );
    waistColumn.position.y = 0.12;
    torsoPivot.add(waistColumn);

    // 3. Central Containment Reactor Chassis
    const centralChassis = new THREE.Mesh(
      new RoundedBoxGeometry(1.96, 1.28, 1.38, 5, 0.2),
      ceramicArmorMat
    );
    centralChassis.position.set(0, 0.74, -0.04);
    centralChassis.castShadow = enableShadows;
    torsoPivot.add(centralChassis);
    primaryMeshes.push(centralChassis);

    // Recessed Dark Reactor Cavity on Chest
    const reactorCavity = new THREE.Mesh(
      new THREE.CylinderGeometry(0.52, 0.52, 0.34, 24),
      darkTitaniumMat
    );
    reactorCavity.rotation.x = Math.PI / 2;
    reactorCavity.position.set(0, 0.72, 0.56);
    torsoPivot.add(reactorCavity);

    const reactorBezel = new THREE.Mesh(
      new THREE.TorusGeometry(0.52, 0.068, 14, 32),
      bronzeActuatorMat
    );
    reactorBezel.position.set(0, 0.72, 0.68);
    torsoPivot.add(reactorBezel);

    // Glowing Chrono-Reactor Core & Exposed Vulnerability Rim
    coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.4, 24, 24), coreMaterial);
    coreMesh.scale.set(1, 1, 0.76);
    coreMesh.position.set(0, 0.72, 0.64);
    torsoPivot.add(coreMesh);

    coreRimMesh = new THREE.Mesh(new THREE.RingGeometry(0.46, 0.62, 36), coreRimMaterial);
    coreRimMesh.position.set(0, 0.72, 0.74);
    torsoPivot.add(coreRimMesh);

    // 4. Physical Left & Right Armored Core Shutters (Slide/Rotate open when Core Exposed!)
    const buildCoreShutter = (sign: number) => {
      const shutterPivot = new THREE.Group();
      shutterPivot.position.set(sign * 0.22, 0.72, 0.72);
      torsoPivot.add(shutterPivot);

      const shutterPlate = new THREE.Mesh(
        new RoundedBoxGeometry(0.44, 0.86, 0.16, 3, 0.04),
        slateFrameMat
      );
      shutterPlate.position.set(sign * 0.04, 0, 0);
      shutterPivot.add(shutterPlate);
      primaryMeshes.push(shutterPlate);

      const shutterTrim = new THREE.Mesh(
        new RoundedBoxGeometry(0.08, 0.72, 0.18, 2, 0.02),
        warningAmberMat
      );
      shutterTrim.position.set(-sign * 0.14, 0, 0.02);
      shutterPivot.add(shutterTrim);

      return shutterPivot;
    };

    leftShutterPivot = buildCoreShutter(-1);
    rightShutterPivot = buildCoreShutter(1);

    // 5. Archetype-Distinct Dorsal Apparatus, Head Unit & Weapon Assemblies
    outerHelixRing = new THREE.Group();
    outerHelixRing.position.set(0, 0.78, 0);
    torsoPivot.add(outerHelixRing);

    innerHelixRing = new THREE.Group();
    innerHelixRing.position.set(0, 0.78, 0);
    torsoPivot.add(innerHelixRing);

    headPivot.position.set(0, 1.48, 0.14);
    weaponPivot.position.set(1.28, 0.82, 0.18);
    torsoPivot.add(weaponPivot);
    secondaryPivot.position.set(-1.28, 0.82, 0.18);
    torsoPivot.add(secondaryPivot);

    {
      // =======================================================================
      // HELIX-04 — Heavy Armored Orbital Marshal Juggernaut (Sheet 2, Panel 1)
      // Massive twin wing-like directional vertical shoulder shields, dark
      // gunmetal armor, fiery amber T-visor, and blazing molten-orange rotary
      // double-helix spiral glaive on right arm.
      // =======================================================================
      const moltenHelixMat = new THREE.MeshStandardMaterial({
        color: 0xfde047,
        emissive: 0xf97316,
        emissiveIntensity: 2.45,
        roughness: 0.14,
        metalness: 0.25,
      });

      // Dorsal Containment Gyro Rings (tighter dark gunmetal/amber marshal frame)
      const outerTorus = new THREE.Mesh(
        new THREE.TorusGeometry(1.12, 0.055, 12, 36),
        slateFrameMat
      );
      outerTorus.position.z = -0.58;
      outerHelixRing.add(outerTorus);

      const innerTorus = new THREE.Mesh(
        new THREE.TorusGeometry(0.84, 0.04, 10, 32),
        warningAmberMat
      );
      innerTorus.position.z = -0.58;
      innerHelixRing.add(innerTorus);

      // Massive Wing-Like Vertical Directional Shield Slabs flanking BOTH Shoulders!
      const wingShieldGeo = new RoundedBoxGeometry(0.28, 2.38, 0.94, 3, 0.07);
      const wingShieldSubGeo = new RoundedBoxGeometry(0.32, 1.85, 0.42, 2, 0.05);
      for (const side of [-1, 1]) {
        const shoulderPivot = new THREE.Group();
        shoulderPivot.position.set(side * 1.38, 0.72, -0.02);
        shoulderPivot.rotation.z = -side * 0.2;
        shoulderPivot.rotation.y = side * 0.18;
        torsoPivot.add(shoulderPivot);

        const shieldSlab = new THREE.Mesh(wingShieldGeo, ceramicArmorMat);
        shieldSlab.castShadow = enableShadows;
        shoulderPivot.add(shieldSlab);
        primaryMeshes.push(shieldSlab);

        const shieldRidge = new THREE.Mesh(wingShieldSubGeo, slateFrameMat);
        shieldRidge.position.set(side * 0.08, 0.04, 0.12);
        shoulderPivot.add(shieldRidge);

        const shieldVent = new THREE.Mesh(
          new RoundedBoxGeometry(0.34, 0.65, 0.16, 2, 0.02),
          darkTitaniumMat
        );
        shieldVent.position.set(side * 0.06, 0.35, 0.26);
        shoulderPivot.add(shieldVent);

        const mountJoint = new THREE.Mesh(
          new RoundedBoxGeometry(0.54, 0.48, 0.62, 3, 0.08),
          darkTitaniumMat
        );
        mountJoint.position.set(-side * 0.3, 0.24, 0);
        shoulderPivot.add(mountJoint);
      }

      // Compact Armored Marshal Helmet with Glowing Fiery Amber T-Visor
      const wardenHelm = new THREE.Mesh(
        new RoundedBoxGeometry(0.68, 0.56, 0.64, 4, 0.12),
        ceramicArmorMat
      );
      headPivot.add(wardenHelm);
      primaryMeshes.push(wardenHelm);

      const helmCollar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.46, 0.52, 0.2, 12),
        darkTitaniumMat
      );
      helmCollar.position.y = -0.26;
      headPivot.add(helmCollar);

      // Fiery Amber T-Visor (horizontal brow bar + vertical nose slit)
      const visorBar = new THREE.Mesh(
        new RoundedBoxGeometry(0.44, 0.12, 0.12, 2, 0.025),
        moltenHelixMat
      );
      visorBar.position.set(0, 0.06, 0.3);
      headPivot.add(visorBar);

      const visorStem = new THREE.Mesh(
        new RoundedBoxGeometry(0.12, 0.24, 0.12, 2, 0.025),
        moltenHelixMat
      );
      visorStem.position.set(0, -0.04, 0.3);
      headPivot.add(visorStem);

      // Right Arm (weaponPivot): HELICAL DRILL — Heavy Gunmetal Hydraulic Drum, Twin Bronze Collars & Twisting Molten-Amber Auger (Sheet 8, Panel 1)
      const rightUpperLimb = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.22, 0.56, 8, 14),
        darkTitaniumMat
      );
      rightUpperLimb.position.set(0, -0.26, 0.18);
      rightUpperLimb.rotation.x = Math.PI * 0.34;
      weaponPivot.add(rightUpperLimb);

      // Heavy cylindrical hydraulic forearm drum with side reinforcement braces
      const drillDrum = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.3, 0.88, 14),
        darkTitaniumMat
      );
      drillDrum.rotation.x = Math.PI / 2;
      drillDrum.position.set(0, -0.3, 0.74);
      weaponPivot.add(drillDrum);

      for (const braceAngle of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
        const brace = new THREE.Mesh(
          new RoundedBoxGeometry(0.12, 0.12, 0.78, 1, 0.02),
          slateFrameMat
        );
        brace.position.set(
          Math.cos(braceAngle) * 0.34,
          -0.3 + Math.sin(braceAngle) * 0.34,
          0.72
        );
        weaponPivot.add(brace);
      }

      // Twin heavy weathered-bronze hydraulic recoil collars
      for (const [cz, cr] of [[0.36, 0.34], [1.14, 0.38], [1.34, 0.35]] as const) {
        const bronzeCollar = new THREE.Mesh(
          new THREE.CylinderGeometry(cr, cr * 1.04, 0.18, 16),
          bronzeActuatorMat
        );
        bronzeCollar.rotation.x = Math.PI / 2;
        bronzeCollar.position.set(0, -0.3, cz);
        weaponPivot.add(bronzeCollar);
      }

      // Dark tapered steel auger core & sharp hardened drill point
      const augerCore = new THREE.Mesh(
        new THREE.ConeGeometry(0.26, 1.56, 10),
        darkTitaniumMat
      );
      augerCore.rotation.x = Math.PI / 2;
      augerCore.position.set(0, -0.3, 2.18);
      weaponPivot.add(augerCore);

      const drillPoint = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.56, 6),
        slateFrameMat
      );
      drillPoint.rotation.x = Math.PI / 2;
      drillPoint.position.set(0, -0.3, 2.98);
      weaponPivot.add(drillPoint);

      // Thick twisting twin-strand molten-amber plasma spiral blades wrapping the dark steel auger
      const spiralSegments = 9;
      for (let s = 0; s < spiralSegments; s++) {
        const frac = s / (spiralSegments - 1);
        const zPos = 1.44 + frac * 1.32;
        const spiralRadius = 0.32 * (1 - frac * 0.58);
        for (const strand of [0, Math.PI]) {
          const a = frac * Math.PI * 3.4 + strand;
          const fin = new THREE.Mesh(
            new RoundedBoxGeometry(0.13, 0.3, 0.28, 2, 0.04),
            moltenHelixMat
          );
          fin.position.set(
            Math.cos(a) * spiralRadius,
            -0.3 + Math.sin(a) * spiralRadius,
            zPos
          );
          fin.rotation.z = a;
          fin.rotation.y = 0.42;
          weaponPivot.add(fin);
        }
      }

      // Left Arm (secondaryPivot): Heavy Armored Marshal Forearm Gauntlet & Impact Claw
      const leftUpperLimb = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.22, 0.56, 8, 14),
        darkTitaniumMat
      );
      leftUpperLimb.position.set(0, -0.26, 0.18);
      leftUpperLimb.rotation.x = Math.PI * 0.34;
      secondaryPivot.add(leftUpperLimb);

      const leftGauntlet = new THREE.Mesh(
        new RoundedBoxGeometry(0.42, 0.42, 0.72, 3, 0.08),
        ceramicArmorMat
      );
      leftGauntlet.position.set(-0.04, -0.32, 0.62);
      leftGauntlet.castShadow = enableShadows;
      secondaryPivot.add(leftGauntlet);
      primaryMeshes.push(leftGauntlet);

      const leftKnuckleGlow = new THREE.Mesh(
        new RoundedBoxGeometry(0.36, 0.14, 0.18, 2, 0.03),
        warningAmberMat
      );
      leftKnuckleGlow.position.set(-0.04, -0.32, 1.0);
      secondaryPivot.add(leftKnuckleGlow);
    }

    }

    // 10. Boss Spatial Floor Telegraphs (Attached to root so they orient with HELIX-04)
    // 10a. Vector Ram Directional Charge Lane (2.2m wide x 9.0m long)
    ramLaneGroup = new THREE.Group();
    ramLaneGroup.position.y = 0.028;
    ramLaneGroup.visible = false;
    root.add(ramLaneGroup);

    const ramWidth = GAME_CONFIG.boss.attacks.vector_ram.laneWidth;
    const ramLen = GAME_CONFIG.boss.attacks.vector_ram.maxReach;
    ramLaneFillMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ramFillGeo = new THREE.PlaneGeometry(ramWidth, ramLen);
    ramFillGeo.translate(0, ramLen * 0.5, 0);
    const ramFillMesh = new THREE.Mesh(ramFillGeo, ramLaneFillMat);
    ramFillMesh.rotation.x = -Math.PI / 2;
    ramFieldFlipZ(ramFillMesh);
    ramLaneGroup.add(ramFillMesh);

    ramLaneBorderMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    for (const side of [-1, 1]) {
      const railGeo = new THREE.PlaneGeometry(0.14, ramLen);
      railGeo.translate(side * (ramWidth * 0.5), ramLen * 0.5, 0);
      const railMesh = new THREE.Mesh(railGeo, ramLaneBorderMat);
      railMesh.rotation.x = -Math.PI / 2;
      ramFieldFlipZ(railMesh);
      ramLaneGroup.add(railMesh);
    }

    ramLaneShaderMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uLocked: { value: 0 },
        uChevronSpeed: { value: 2.6 },
        uColor: { value: new THREE.Color(0xf59e0b) },
        uReducedMotion: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uProgress;
        uniform float uTime;
        uniform float uOpacity;
        uniform float uLocked;
        uniform float uChevronSpeed;
        uniform vec3 uColor;
        uniform float uReducedMotion;
        varying vec2 vUv;
        void main() {
          float along = vUv.y;
          float across = abs(vUv.x - 0.5) * 2.0;

          float fillMask = 1.0 - smoothstep(uProgress - 0.04, uProgress + 0.02, along);
          float frontLine = smoothstep(0.045, 0.0, abs(along - clamp(uProgress, 0.02, 0.98)));

          float flow = (1.0 - uReducedMotion) * uTime * uChevronSpeed;
          float chevronCoord = along * 6.5 - flow - across * 1.15;
          float chevronBand = smoothstep(0.28, 0.62, sin(chevronCoord * 6.2831853));
          float railEdge = smoothstep(0.84, 0.98, across);

          float alpha = (fillMask * 0.24 + chevronBand * 0.42 * (0.45 + uProgress * 0.55) + frontLine * 0.95 + railEdge * (0.45 + uLocked * 0.4)) * uOpacity;
          if (alpha <= 0.01) discard;

          vec3 hotCol = mix(uColor, vec3(1.0, 0.97, 0.88), frontLine * 0.72 + railEdge * uLocked * 0.5 + chevronBand * 0.25);
          gl_FragColor = vec4(hotCol, min(0.92, alpha));
        }
      `,
    });
    const ramShaderGeo = new THREE.PlaneGeometry(ramWidth, ramLen);
    ramShaderGeo.translate(0, ramLen * 0.5, 0);
    const ramShaderMesh = new THREE.Mesh(ramShaderGeo, ramLaneShaderMat);
    ramShaderMesh.rotation.x = -Math.PI / 2;
    ramShaderMesh.position.y = 0.008;
    ramFieldFlipZ(ramShaderMesh);
    ramLaneGroup.add(ramShaderMesh);

    // 10b. Helical Sweep Frontal Arc Sector (207 deg arc, 4.5m reach)
    sweepSectorGroup = new THREE.Group();
    sweepSectorGroup.position.y = 0.03;
    sweepSectorGroup.visible = false;
    root.add(sweepSectorGroup);

    const sweepRadius = GAME_CONFIG.boss.attacks.helical_sweep.range;
    const sweepArc = GAME_CONFIG.boss.attacks.helical_sweep.arcRadians;
    // In RingGeometry/CircleGeometry rotated by rotation.x = -Math.PI/2, local +Y maps to local -Z,
    // so we rotate the group by Math.PI around Y so the arc faces local +Z (forward)!
    const thetaStart = -Math.PI * 0.5 - sweepArc * 0.5;
    sweepSectorFillMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const sectorFillMesh = new THREE.Mesh(
      new THREE.RingGeometry(0.9, sweepRadius, 48, 1, thetaStart, sweepArc),
      sweepSectorFillMat
    );
    sectorFillMesh.rotation.x = -Math.PI / 2;
    sweepSectorGroup.add(sectorFillMesh);

    sweepSectorRimMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const sectorRimMesh = new THREE.Mesh(
      new THREE.RingGeometry(sweepRadius - 0.18, sweepRadius, 48, 1, thetaStart, sweepArc),
      sweepSectorRimMat
    );
    sectorRimMesh.rotation.x = -Math.PI / 2;
    sectorRimMesh.position.y = 0.005;
    sweepSectorGroup.add(sectorRimMesh);

    sweepSectorShaderMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uLocked: { value: 0 },
        uArcHalf: { value: sweepArc * 0.5 },
        uColor: { value: new THREE.Color(0xf59e0b) },
        uReducedMotion: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec2 vLocalPos;
        void main() {
          vLocalPos = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uProgress;
        uniform float uTime;
        uniform float uOpacity;
        uniform float uLocked;
        uniform float uArcHalf;
        uniform vec3 uColor;
        uniform float uReducedMotion;
        varying vec2 vLocalPos;
        void main() {
          float r = length(vLocalPos);
          float normR = clamp((r - 0.9) / ${Math.max(0.5, sweepRadius - 0.9).toFixed(3)}, 0.0, 1.0);
          float angle = atan(vLocalPos.x, -vLocalPos.y);
          float arcFrac = clamp((angle + uArcHalf) / max(0.01, uArcHalf * 2.0), 0.0, 1.0);

          float progR = clamp(uProgress, 0.06, 0.98);
          float radialWave = smoothstep(0.06, 0.0, abs(normR - progR));
          float outerBladeEdge = smoothstep(0.88, 0.98, normR);
          float sweepBeam = smoothstep(0.09, 0.0, abs(arcFrac - clamp(uProgress, 0.0, 1.0)));
          float sectorFill = (1.0 - smoothstep(progR - 0.05, progR + 0.03, normR)) * 0.28;
          float tick = (1.0 - uReducedMotion) * (0.5 + 0.5 * sin(uTime * 16.0)) * uLocked * 0.25;

          float alpha = (sectorFill + radialWave * 0.85 + sweepBeam * 0.72 + outerBladeEdge * (0.48 + tick)) * uOpacity;
          if (alpha <= 0.01) discard;

          vec3 col = mix(uColor, vec3(1.0, 0.96, 0.88), radialWave * 0.55 + sweepBeam * 0.65 + outerBladeEdge * uLocked * 0.4);
          gl_FragColor = vec4(col, min(0.92, alpha));
        }
      `,
    });
    const sectorShaderMesh = new THREE.Mesh(
      new THREE.RingGeometry(0.9, sweepRadius, 48, 1, thetaStart, sweepArc),
      sweepSectorShaderMat
    );
    sectorShaderMesh.rotation.x = -Math.PI / 2;
    sectorShaderMesh.position.y = 0.009;
    sweepSectorGroup.add(sectorShaderMesh);

    // 10c. Anchor Slam Expanding Temporal Shockwave Ring
    slamShockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    slamShockwaveRing = new THREE.Mesh(
      new THREE.RingGeometry(0.86, 1.0, 56),
      slamShockwaveMat
    );
    slamShockwaveRing.rotation.x = -Math.PI / 2;
    slamShockwaveRing.position.y = 0.045;
    slamShockwaveRing.visible = false;
    root.add(slamShockwaveRing);
  } else if (archetype === 'phase_stalker') {
    // =========================================================================
    // STALKER-V9 — Phase Blink Assassin (Panel 2 Concept Art Match)
    // Lean obsidian-indigo angular stealth armor, cyber-hood with single vertical
    // cyan optic slit, 4 swept dorsal thruster fins, twin sweeping curved
    // neon-violet forearm plasma mantis blades.
    // =========================================================================
    const obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x161924,
      bumpMap: armorBump,
      bumpScale: 0.008,
      roughness: 0.36,
      metalness: 0.68,
    });
    const gunmetalPlateMat = new THREE.MeshStandardMaterial({
      color: 0x2c3244,
      bumpMap: armorBump,
      bumpScale: 0.006,
      roughness: 0.26,
      metalness: 0.82,
    });
    const indigoAccentMat = new THREE.MeshStandardMaterial({
      color: 0x3b2d63,
      roughness: 0.32,
      metalness: 0.76,
    });
    const bladePlasmaMat = new THREE.MeshStandardMaterial({
      color: 0xd946ef,
      emissive: 0xa855f7,
      emissiveIntensity: 2.2,
      roughness: 0.12,
      metalness: 0.25,
    });
    const bladeEdgeWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xfaf5ff,
      emissive: 0xe879f9,
      emissiveIntensity: 2.6,
      roughness: 0.08,
      metalness: 0.15,
    });
    const cyanVisorMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x06b6d4,
      emissiveIntensity: 2.3,
      roughness: 0.1,
      metalness: 0.25,
    });

    // Lean Armored Ninja Legs with Angular Knee & Shin Guards
    const buildStalkerLeg = (sign: number) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(sign * 0.21, 0.92, 0);

      const thigh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.088, 0.38, 8, 12),
        obsidianMat
      );
      thigh.position.set(0, -0.22, 0.02);
      thigh.rotation.x = -0.14;
      thigh.castShadow = enableShadows;
      legGroup.add(thigh);
      primaryMeshes.push(thigh);

      const thighPlate = new THREE.Mesh(
        new RoundedBoxGeometry(0.16, 0.34, 0.19, 2, 0.04),
        gunmetalPlateMat
      );
      thighPlate.position.set(sign * 0.03, -0.21, 0.04);
      legGroup.add(thighPlate);

      const shinGroup = new THREE.Group();
      shinGroup.position.set(0, -0.46, 0.04);

      const kneeGuard = new THREE.Mesh(
        new THREE.ConeGeometry(0.082, 0.19, 4),
        gunmetalPlateMat
      );
      kneeGuard.position.set(0, 0.02, 0.09);
      kneeGuard.rotation.x = 0.22;
      shinGroup.add(kneeGuard);

      const shin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.082, 0.058, 0.44, 10),
        obsidianMat
      );
      shin.position.set(0, -0.22, -0.02);
      shin.castShadow = enableShadows;
      shinGroup.add(shin);

      const shinGreave = new THREE.Mesh(
        new RoundedBoxGeometry(0.14, 0.34, 0.12, 2, 0.03),
        indigoAccentMat
      );
      shinGreave.position.set(0, -0.21, 0.05);
      shinGroup.add(shinGreave);

      const stealthBoot = new THREE.Mesh(
        new RoundedBoxGeometry(0.15, 0.11, 0.3, 2, 0.035),
        gunmetalPlateMat
      );
      stealthBoot.position.set(0, -0.43, 0.06);
      shinGroup.add(stealthBoot);

      legGroup.add(shinGroup);
      bodyGroup.add(legGroup);
      return { legGroup, shinGroup };
    };
    const lLeg = buildStalkerLeg(-1);
    const rLeg = buildStalkerLeg(1);
    leftLegPivot = lLeg.legGroup;
    leftShinPivot = lLeg.shinGroup;
    rightLegPivot = rLeg.legGroup;
    rightShinPivot = rLeg.shinGroup;

    // Slim Armored Pelvis
    const stalkerPelvis = new THREE.Mesh(
      new RoundedBoxGeometry(0.46, 0.22, 0.3, 3, 0.06),
      obsidianMat
    );
    stalkerPelvis.position.set(0, 0.94, 0);
    bodyGroup.add(stalkerPelvis);

    torsoPivot.position.set(0, 1.04, 0);

    // Tapered Obsidian Torso + Layered Gunmetal Chevron Breastplate
    const chest = new THREE.Mesh(
      new RoundedBoxGeometry(0.56, 0.62, 0.34, 3, 0.07),
      obsidianMat
    );
    chest.position.set(0, 0.32, 0.01);
    chest.rotation.x = 0.1;
    chest.castShadow = enableShadows;
    torsoPivot.add(chest);
    primaryMeshes.push(chest);

    for (const side of [-1, 1]) {
      const chevronPlate = new THREE.Mesh(
        new RoundedBoxGeometry(0.28, 0.28, 0.12, 2, 0.03),
        gunmetalPlateMat
      );
      chevronPlate.position.set(side * 0.15, 0.42, 0.15);
      chevronPlate.rotation.z = side * 0.26;
      chevronPlate.rotation.y = -side * 0.2;
      torsoPivot.add(chevronPlate);
    }

    // 4 Swept-Back Diagonal Angular Dorsal Thruster Fins (2 upper long + 2 lower short)
    const upperFinGeo = createExtrudedFinGeometry(0.045, 0.62, 0.36, 0.42);
    const lowerFinGeo = createExtrudedFinGeometry(0.04, 0.42, 0.26, 0.32);
    for (const sign of [-1, 1]) {
      const upperFin = new THREE.Mesh(upperFinGeo, gunmetalPlateMat);
      upperFin.position.set(sign * 0.26, 0.64, -0.24);
      upperFin.rotation.set(-0.48, sign * 0.28, -sign * 0.56);
      upperFin.castShadow = enableShadows;
      torsoPivot.add(upperFin);

      const lowerFin = new THREE.Mesh(lowerFinGeo, indigoAccentMat);
      lowerFin.position.set(sign * 0.22, 0.36, -0.22);
      lowerFin.rotation.set(-0.56, sign * 0.22, -sign * 0.72);
      lowerFin.castShadow = enableShadows;
      torsoPivot.add(lowerFin);
    }

    // Pointed Cyber-Hood/Cowl over Obsidian Mask with Single Vertical Cyan Optic Slit
    headPivot.position.set(0, 0.74, 0.04);
    torsoPivot.add(headPivot);

    const cowl = new THREE.Mesh(
      new THREE.ConeGeometry(0.24, 0.44, 6),
      obsidianMat
    );
    cowl.rotation.x = Math.PI * 0.08;
    cowl.position.set(0, 0.1, -0.02);
    cowl.castShadow = enableShadows;
    headPivot.add(cowl);

    const hoodSides = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 0.26, 8, 1, true, Math.PI * 0.32, Math.PI * 1.36),
      gunmetalPlateMat
    );
    hoodSides.position.set(0, 0.02, -0.01);
    headPivot.add(hoodSides);

    const obsidianMask = new THREE.Mesh(
      new THREE.SphereGeometry(0.165, 14, 12),
      obsidianMat
    );
    obsidianMask.scale.set(0.86, 1.06, 0.94);
    obsidianMask.position.set(0, 0.0, 0.03);
    headPivot.add(obsidianMask);

    // Signature Single Intense Vertical Cyan Optic Sensor Slit
    const verticalOpticSlit = new THREE.Mesh(
      new RoundedBoxGeometry(0.042, 0.16, 0.06, 2, 0.014),
      cyanVisorMat
    );
    verticalOpticSlit.position.set(0, 0.02, 0.175);
    headPivot.add(verticalOpticSlit);

    coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), coreMaterial);
    coreMesh.position.set(0, 0.34, 0.19);
    torsoPivot.add(coreMesh);
    coreRimMesh = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.23, 24), coreRimMaterial);
    coreRimMesh.position.set(0, 0.34, 0.23);
    torsoPivot.add(coreRimMesh);

    // Twin Forearm-Mounted Sweeping Curved Neon-Violet Plasma Mantis Blades
    const stalkerBladeGeo = createCurvedBladeGeometry(1.18, 0.22, 0.036);
    const stalkerInnerEdgeGeo = createCurvedBladeGeometry(1.06, 0.085, 0.044);

    const buildStalkerArm = (sign: number) => {
      const armPivot = new THREE.Group();
      armPivot.position.set(sign * 0.36, 0.52, 0.02);

      const pauldron = new THREE.Mesh(
        new RoundedBoxGeometry(0.22, 0.16, 0.28, 2, 0.04),
        gunmetalPlateMat
      );
      pauldron.rotation.z = -sign * 0.28;
      armPivot.add(pauldron);

      const upperArm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.064, 0.24, 6, 10),
        obsidianMat
      );
      upperArm.position.set(sign * 0.03, -0.15, 0.04);
      armPivot.add(upperArm);

      const forearmGuard = new THREE.Mesh(
        new RoundedBoxGeometry(0.12, 0.13, 0.38, 2, 0.03),
        gunmetalPlateMat
      );
      forearmGuard.rotation.x = Math.PI * 0.28;
      forearmGuard.position.set(sign * 0.05, -0.28, 0.22);
      armPivot.add(forearmGuard);

      // Sweeping Neon-Violet Plasma Mantis Blade + Bright Lavender-White Inner Spine
      const bladePivot = new THREE.Group();
      bladePivot.position.set(sign * 0.11, -0.32, 0.34);
      bladePivot.rotation.set(0.16, sign * 0.14, sign * 0.22);

      const plasmaBlade = new THREE.Mesh(stalkerBladeGeo, bladePlasmaMat);
      bladePivot.add(plasmaBlade);

      const brightEdge = new THREE.Mesh(stalkerInnerEdgeGeo, bladeEdgeWhiteMat);
      brightEdge.position.set(0, 0.02, 0.04);
      bladePivot.add(brightEdge);

      armPivot.add(bladePivot);
      torsoPivot.add(armPivot);
      return armPivot;
    };
    leftArmPivot = buildStalkerArm(-1);
    rightArmPivot = buildStalkerArm(1);
    weaponPivot.position.set(0, 0.42, 0.25);
    torsoPivot.add(weaponPivot);
  } else if (archetype === 'chrono_mortar') {
    // =========================================================================
    // OBELISK-M4 — Quad-Legged Industrial Siege Mortar Walker (Panel 3 Match)
    // 4 articulated spider-walker legs with yellow/black hazard stripe plates,
    // boxy armored turret, twin massive angled glowing amber plasma canisters
    // with vertical steel cage bars, and thick elevated siege mortar cannon.
    // =========================================================================
    const gunmetalMat = new THREE.MeshStandardMaterial({
      color: 0x3b444f,
      bumpMap: armorBump,
      bumpScale: 0.014,
      roughness: 0.44,
      metalness: 0.72,
    });
    const darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x1d232b,
      roughness: 0.54,
      metalness: 0.68,
    });
    const weatheredTrimMat = new THREE.MeshStandardMaterial({
      color: 0x576370,
      roughness: 0.34,
      metalness: 0.78,
    });
    const hazardPlateMat = new THREE.MeshStandardMaterial({
      map: createHazardStripeTexture(),
      roughness: 0.42,
      metalness: 0.32,
    });
    const siegeAmberMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.1,
      roughness: 0.14,
      metalness: 0.25,
    });

    // Central Under-Chassis Hub & 4 Articulated Quad-Walker Spider Legs
    const lowerHub = new THREE.Mesh(
      new RoundedBoxGeometry(0.92, 0.34, 0.92, 3, 0.06),
      darkSteelMat
    );
    lowerHub.position.y = 0.88;
    lowerHub.castShadow = enableShadows;
    bodyGroup.add(lowerHub);
    primaryMeshes.push(lowerHub);

    // Hazard-striped Front & Rear Lower Skirt Bands
    for (const sz of [0.47, -0.47]) {
      const lowerHazard = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.14, 0.04),
        hazardPlateMat
      );
      lowerHazard.position.set(0, 0.88, sz);
      bodyGroup.add(lowerHazard);
    }

    for (let l = 0; l < 4; l++) {
      const a = (l / 4) * Math.PI * 2 + Math.PI / 4;
      const legRoot = new THREE.Group();
      legRoot.position.set(0, 0.88, 0);
      legRoot.rotation.y = a;

      // Hip Hydraulic Bracket
      const hipBracket = new THREE.Mesh(
        new RoundedBoxGeometry(0.24, 0.24, 0.32, 2, 0.04),
        weatheredTrimMat
      );
      hipBracket.position.set(0, 0, 0.5);
      legRoot.add(hipBracket);

      // Arched Upper Spider Thigh
      const upperStrut = new THREE.Mesh(
        new RoundedBoxGeometry(0.18, 0.18, 0.62, 2, 0.03),
        gunmetalMat
      );
      upperStrut.position.set(0, 0.06, 0.78);
      upperStrut.rotation.x = -0.32;
      upperStrut.castShadow = enableShadows;
      legRoot.add(upperStrut);
      primaryMeshes.push(upperStrut);

      // Cylindrical Hydraulic Knee Joint
      const kneeHub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.11, 0.26, 10),
        darkSteelMat
      );
      kneeHub.rotation.z = Math.PI / 2;
      kneeHub.position.set(0, 0.12, 1.04);
      legRoot.add(kneeHub);

      // Heavy Vertical Armored Lower Leg Strut + Hazard-Striped Knee Armor Plate
      const lowerLeg = new THREE.Mesh(
        new RoundedBoxGeometry(0.2, 0.94, 0.22, 2, 0.03),
        gunmetalMat
      );
      lowerLeg.position.set(0, -0.36, 1.06);
      lowerLeg.rotation.x = 0.06;
      lowerLeg.castShadow = enableShadows;
      legRoot.add(lowerLeg);

      const kneeHazard = new THREE.Mesh(
        new THREE.BoxGeometry(0.21, 0.22, 0.24),
        hazardPlateMat
      );
      kneeHazard.position.set(0, -0.02, 1.07);
      legRoot.add(kneeHazard);

      // Articulated Mechanical Claw Foot
      const footPad = new THREE.Mesh(
        new RoundedBoxGeometry(0.28, 0.14, 0.34, 2, 0.03),
        darkSteelMat
      );
      footPad.position.set(0, -0.82, 1.1);
      legRoot.add(footPad);

      bodyGroup.add(legRoot);
    }

    // Rotating Turntable Collar + Boxy Industrial Armored Turret Housing
    torsoPivot.position.set(0, 1.12, 0);

    const turretRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.56, 0.6, 0.18, 16),
      darkSteelMat
    );
    turretRing.position.y = -0.06;
    torsoPivot.add(turretRing);

    const turretBody = new THREE.Mesh(
      new RoundedBoxGeometry(1.12, 0.72, 1.06, 3, 0.07),
      gunmetalMat
    );
    turretBody.position.set(0, 0.36, -0.02);
    turretBody.castShadow = enableShadows;
    torsoPivot.add(turretBody);
    primaryMeshes.push(turretBody);

    // Front Armored Turret Apron with Industrial Yellow-Black Hazard Stripes
    const frontHazardPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.74, 0.17, 0.06),
      hazardPlateMat
    );
    frontHazardPlate.position.set(0, 0.12, 0.52);
    torsoPivot.add(frontHazardPlate);

    // Twin Massive Angled Glowing Amber-Gold Plasma Ammo Canisters with Protective Steel Cage Bars
    for (const sign of [-1, 1]) {
      const canGroup = new THREE.Group();
      canGroup.position.set(sign * 0.72, 0.42, -0.06);
      canGroup.rotation.z = -sign * 0.18;
      canGroup.rotation.x = -0.18;

      const glowCylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.68, 14),
        siegeAmberMat
      );
      canGroup.add(glowCylinder);

      for (const endY of [-0.36, 0.36]) {
        const endCap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.24, 0.12, 14),
          weatheredTrimMat
        );
        endCap.position.y = endY;
        canGroup.add(endCap);
      }

      // 3 Vertical Protective Dark-Steel Cage Bars around each Glowing Canister
      for (let b = 0; b < 3; b++) {
        const ba = (b / 3) * Math.PI * 2 + (sign > 0 ? 0 : Math.PI);
        const bar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.024, 0.024, 0.72, 6),
          darkSteelMat
        );
        bar.position.set(Math.cos(ba) * 0.22, 0, Math.sin(ba) * 0.22);
        canGroup.add(bar);
      }

      torsoPivot.add(canGroup);
    }

    // Large Thick Cylindrical Heavy Siege Mortar Cannon Tilted Upward (~42°) on weaponPivot
    weaponPivot.position.set(0, 0.68, 0.02);
    torsoPivot.add(weaponPivot);

    const cannonBreech = new THREE.Mesh(
      new RoundedBoxGeometry(0.62, 0.44, 0.72, 3, 0.05),
      weatheredTrimMat
    );
    cannonBreech.position.set(0, 0.04, -0.06);
    weaponPivot.add(cannonBreech);

    // Reinforced Recoil Collar
    const recoilCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.35, 0.44, 18),
      darkSteelMat
    );
    recoilCollar.rotation.x = Math.PI * 0.23;
    recoilCollar.position.set(0, 0.24, 0.22);
    weaponPivot.add(recoilCollar);

    // Thick Heavy Siege Mortar Barrel
    const mortarBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.28, 1.48, 20),
      gunmetalMat
    );
    mortarBarrel.rotation.x = Math.PI * 0.23;
    mortarBarrel.position.set(0, 0.66, 0.58);
    mortarBarrel.castShadow = enableShadows;
    weaponPivot.add(mortarBarrel);
    primaryMeshes.push(mortarBarrel);

    // Thick Beveled Muzzle Lip + Dark Inner Cannon Bore
    const muzzleLip = new THREE.Mesh(
      new THREE.TorusGeometry(0.255, 0.048, 10, 24),
      weatheredTrimMat
    );
    muzzleLip.rotation.x = -Math.PI * 0.27;
    muzzleLip.position.set(0, 1.18, 1.02);
    weaponPivot.add(muzzleLip);

    const muzzleBore = new THREE.Mesh(
      new THREE.CircleGeometry(0.21, 18),
      darkSteelMat
    );
    muzzleBore.rotation.x = -Math.PI * 0.27;
    muzzleBore.position.set(0, 1.19, 1.03);
    weaponPivot.add(muzzleBore);

    // Front Optical Targeting Core
    coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), coreMaterial);
    coreMesh.position.set(0, 0.38, 0.54);
    torsoPivot.add(coreMesh);
    coreRimMesh = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.3, 24), coreRimMaterial);
    coreRimMesh.position.set(0, 0.38, 0.58);
    torsoPivot.add(coreRimMesh);
  } else if (archetype === 'resonance_warden') {
    // =========================================================================
    // CONDUCTOR-R2 — Floating Symmetrical Crystal Gimbal Construct (Panel 4)
    // Large faceted glowing emerald Icosahedron crystal encased inside an
    // ornate antique-gold geometric wireframe cage, framed by 2 concentric
    // brushed-silver/chrome gimbal rings with 3 symmetrical disc resonator pods.
    // =========================================================================
    const brushedSilverMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      bumpMap: armorBump,
      bumpScale: 0.004,
      roughness: 0.2,
      metalness: 0.92,
    });
    const darkChromeMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.32,
      metalness: 0.84,
    });
    const antiqueGoldMat = new THREE.MeshStandardMaterial({
      color: 0xd4a44a,
      emissive: 0x784c12,
      emissiveIntensity: 0.25,
      roughness: 0.26,
      metalness: 0.88,
    });
    const emeraldCrystalMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 1.85,
      roughness: 0.12,
      metalness: 0.22,
      flatShading: true,
    });

    torsoPivot.position.set(0, 1.72, 0);

    // Center: Large Faceted Glowing Emerald-Green Icosahedron Crystal Core
    coreMaterial.color.setHex(0x34d399);
    coreMaterial.emissive.setHex(0x10b981);
    coreMaterial.emissiveIntensity = 1.85;
    coreMaterial.flatShading = true;
    coreMaterial.needsUpdate = true;
    const crystalGeo = new THREE.IcosahedronGeometry(0.42, 0);
    coreMesh = new THREE.Mesh(crystalGeo, coreMaterial);
    coreMesh.castShadow = enableShadows;
    torsoPivot.add(coreMesh);
    primaryMeshes.push(coreMesh);

    // Ornate Brushed Antique-Gold Geometric Wireframe Cage Encasing the Crystal
    const cageGeo = new THREE.IcosahedronGeometry(0.47, 0);
    const goldCageWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(cageGeo),
      new THREE.LineBasicMaterial({ color: 0xf6c963 })
    );
    torsoPivot.add(goldCageWire);

    // Physical 3D Metallic Gold Cage Struts along every Icosahedron edge so it catches PBR specular light
    const posAttr = new THREE.EdgesGeometry(cageGeo).attributes.position;
    const vA = new THREE.Vector3();
    const vB = new THREE.Vector3();
    const mid = new THREE.Vector3();
    const dir = new THREE.Vector3();
    const upAxis = new THREE.Vector3(0, 1, 0);
    const strutQuat = new THREE.Quaternion();
    const strutGeo = new THREE.CylinderGeometry(0.022, 0.022, 1, 6);
    for (let i = 0; i < posAttr.count; i += 2) {
      vA.fromBufferAttribute(posAttr, i);
      vB.fromBufferAttribute(posAttr, i + 1);
      const len = vA.distanceTo(vB);
      mid.addVectors(vA, vB).multiplyScalar(0.5);
      dir.subVectors(vB, vA).normalize();
      strutQuat.setFromUnitVectors(upAxis, dir);
      const strut = new THREE.Mesh(strutGeo, antiqueGoldMat);
      strut.position.copy(mid);
      strut.quaternion.copy(strutQuat);
      strut.scale.set(1, len, 1);
      torsoPivot.add(strut);
    }

    // Subtle Exposure Ring in front of crystal
    coreRimMesh = new THREE.Mesh(new THREE.RingGeometry(0.48, 0.56, 28), coreRimMaterial);
    coreRimMesh.position.set(0, 0, 0.48);
    torsoPivot.add(coreRimMesh);

    // Inner Concentric Brushed-Silver Circular Gimbal Ring (innerHelixRing)
    innerHelixRing = new THREE.Group();
    const innerRingMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.036, 12, 44),
      brushedSilverMat
    );
    innerHelixRing.add(innerRingMesh);
    const innerAccentTrack = new THREE.Mesh(
      new THREE.TorusGeometry(0.67, 0.015, 8, 36),
      antiqueGoldMat
    );
    innerHelixRing.add(innerAccentTrack);
    torsoPivot.add(innerHelixRing);

    // Outer Thicker Beveled Brushed-Silver Gimbal Ring + 3 Symmetrical Round Disc Resonator Pods
    // Positioned at 12 o'clock (90°), 4 o'clock (-30°), and 8 o'clock (210°) matching Panel 4!
    outerHelixRing = new THREE.Group();
    const outerRingMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.96, 0.062, 14, 52),
      brushedSilverMat
    );
    outerHelixRing.add(outerRingMesh);

    const outerBevelRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.91, 0.024, 10, 44),
      darkChromeMat
    );
    outerHelixRing.add(outerBevelRing);

    const podAngles = [Math.PI / 2, -Math.PI / 6, (7 * Math.PI) / 6];
    for (const pa of podAngles) {
      const podGroup = new THREE.Group();
      podGroup.position.set(Math.cos(pa) * 1.1, Math.sin(pa) * 1.1, 0);
      podGroup.rotation.z = pa - Math.PI / 2;

      const podMount = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.055, 0.14, 10),
        darkChromeMat
      );
      podMount.position.y = -0.06;
      podGroup.add(podMount);

      const podBaseDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.12, 0.075, 18),
        brushedSilverMat
      );
      podGroup.add(podBaseDisc);

      const podGoldTrim = new THREE.Mesh(
        new THREE.TorusGeometry(0.145, 0.018, 8, 20),
        antiqueGoldMat
      );
      podGoldTrim.rotation.x = Math.PI / 2;
      podGoldTrim.position.y = 0.025;
      podGroup.add(podGoldTrim);

      const podEmitterDot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.082, 12),
        emeraldCrystalMat
      );
      podEmitterDot.position.y = 0.015;
      podGroup.add(podEmitterDot);

      outerHelixRing.add(podGroup);
    }
    torsoPivot.add(outerHelixRing);

    weaponPivot.position.set(0, 0, 0.56);
    torsoPivot.add(weaponPivot);
  } else if (archetype === 'eraser') {
    // =========================================================================
    // ERASER-Z0 — Matte-Black & Crimson Stealth Hunter Android (Sheet 2, Panel 7)
    // Sleek angular obsidian-black & crimson plating, glitching red horizontal
    // optic visor strip, and dual wrist-mounted crimson laser erasure blades.
    // =========================================================================
    const eraserBlackMat = new THREE.MeshStandardMaterial({
      color: 0x161920,
      bumpMap: armorBump,
      bumpScale: 0.008,
      roughness: 0.36,
      metalness: 0.65,
    });
    const eraserCrimsonMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      bumpMap: armorBump,
      bumpScale: 0.006,
      roughness: 0.3,
      metalness: 0.55,
    });
    const eraserLaserMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0xef4444,
      emissiveIntensity: 1.35,
      roughness: 0.14,
      metalness: 0.2,
    });

    const buildEraserLeg = (sign: number) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(sign * 0.21, 0.92, 0);
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.38, 6, 10), eraserBlackMat);
      thigh.position.set(0, -0.22, 0);
      thigh.castShadow = enableShadows;
      legGroup.add(thigh);
      primaryMeshes.push(thigh);

      const thighStripe = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.28, 0.18, 2, 0.03), eraserCrimsonMat);
      thighStripe.position.set(sign * 0.04, -0.22, 0.02);
      legGroup.add(thighStripe);

      const shinGroup = new THREE.Group();
      shinGroup.position.set(0, -0.46, 0);
      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.056, 0.44, 10), eraserBlackMat);
      shin.position.set(0, -0.22, 0);
      shin.castShadow = enableShadows;
      shinGroup.add(shin);

      const kneeCap = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.13, 0.12, 2, 0.025), eraserCrimsonMat);
      kneeCap.position.set(0, 0, 0.07);
      shinGroup.add(kneeCap);

      const boot = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.11, 0.28, 2, 0.03), eraserBlackMat);
      boot.position.set(0, -0.43, 0.05);
      shinGroup.add(boot);

      legGroup.add(shinGroup);
      bodyGroup.add(legGroup);
      return { legGroup, shinGroup };
    };
    const eL = buildEraserLeg(-1);
    const eR = buildEraserLeg(1);
    leftLegPivot = eL.legGroup;
    leftShinPivot = eL.shinGroup;
    rightLegPivot = eR.legGroup;
    rightShinPivot = eR.shinGroup;

    torsoPivot.position.set(0, 1.0, 0);
    const chest = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.62, 0.34, 3, 0.07), eraserBlackMat);
    chest.position.set(0, 0.34, 0);
    chest.castShadow = enableShadows;
    torsoPivot.add(chest);
    primaryMeshes.push(chest);

    // Bold Crimson Chest Chevron Plate
    const crimsonChest = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.26, 0.38, 2, 0.04), eraserCrimsonMat);
    crimsonChest.position.set(0, 0.42, 0.02);
    torsoPivot.add(crimsonChest);

    coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), coreMaterial);
    coreMesh.position.set(0, 0.34, 0.21);
    torsoPivot.add(coreMesh);
    coreRimMesh = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.22, 20), coreRimMaterial);
    coreRimMesh.position.set(0, 0.34, 0.24);
    torsoPivot.add(coreRimMesh);

    // Sleek Rounded Dark Helmet + Signature Glitching Horizontal Red Visor Strip
    headPivot.position.set(0, 0.78, 0.02);
    torsoPivot.add(headPivot);
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 14), eraserBlackMat);
    helm.scale.set(0.92, 1.08, 1.02);
    helm.castShadow = enableShadows;
    headPivot.add(helm);

    const redVisor = new THREE.Mesh(new RoundedBoxGeometry(0.35, 0.068, 0.11, 2, 0.015), eraserLaserMat);
    redVisor.position.set(0, 0.02, 0.15);
    headPivot.add(redVisor);

    // Dual Wrist-Mounted Crimson Laser Erasure Blades
    const eraserBladeGeo = createCurvedBladeGeometry(0.92, 0.13, 0.028);
    const buildEraserArm = (sign: number) => {
      const arm = new THREE.Group();
      arm.position.set(sign * 0.36, 0.52, 0);
      const shoulder = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.16, 0.24, 2, 0.04), eraserCrimsonMat);
      shoulder.rotation.z = -sign * 0.2;
      arm.add(shoulder);
      const limb = new THREE.Mesh(new THREE.CapsuleGeometry(0.062, 0.44, 6, 10), eraserBlackMat);
      limb.position.set(sign * 0.04, -0.26, 0.08);
      limb.rotation.x = 0.25;
      arm.add(limb);

      const laserBlade = new THREE.Mesh(eraserBladeGeo, eraserLaserMat);
      laserBlade.position.set(sign * 0.08, -0.44, 0.24);
      laserBlade.rotation.set(0.24, sign * 0.1, 0);
      arm.add(laserBlade);

      torsoPivot.add(arm);
      return arm;
    };
    leftArmPivot = buildEraserArm(-1);
    rightArmPivot = buildEraserArm(1);
    weaponPivot.position.set(0, 0.42, 0.24);
    torsoPivot.add(weaponPivot);
  } else if (archetype === 'siphon') {
    // =========================================================================
    // SIPHON-K7 — Floating Dark-Teal Energy-Leech Drone (Sheet 2, Panel 6)
    // Armored dark-teal organic-tech chassis, exposed glowing magenta-violet
    // horizontal siphon rib-coils, glowing magenta top optic, and 4 curved
    // metallic silver-steel hanging intake mandibles.
    // =========================================================================
    const tealArmorMat = new THREE.MeshStandardMaterial({
      color: 0x2b4148,
      bumpMap: armorBump,
      bumpScale: 0.01,
      roughness: 0.36,
      metalness: 0.68,
    });
    const obsidianTrimMat = new THREE.MeshStandardMaterial({
      color: 0x131d24,
      roughness: 0.48,
      metalness: 0.78,
    });
    const mandibleSteelMat = new THREE.MeshStandardMaterial({
      color: 0xb8c5d1,
      roughness: 0.24,
      metalness: 0.9,
    });
    const magentaCoilMat = new THREE.MeshStandardMaterial({
      color: 0xc026d3,
      emissive: 0xa21caf,
      emissiveIntensity: 1.15,
      roughness: 0.18,
      metalness: 0.2,
    });

    torsoPivot.position.set(0, 1.48, 0);

    // Bulky Armored Dark-Teal Upper Leech Carapace
    const upperHull = new THREE.Mesh(new RoundedBoxGeometry(0.84, 0.92, 0.78, 4, 0.18), tealArmorMat);
    upperHull.position.set(0, 0.16, -0.04);
    upperHull.castShadow = enableShadows;
    torsoPivot.add(upperHull);
    primaryMeshes.push(upperHull);

    // Shoulder Cowls Framing the Glowing Magenta Siphon Chamber
    for (const side of [-1, 1]) {
      const cowl = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.88, 0.56, 3, 0.08), obsidianTrimMat);
      cowl.position.set(side * 0.36, 0.18, 0.12);
      cowl.rotation.y = side * 0.26;
      torsoPivot.add(cowl);
    }

    // Dark Recessed Cavity Behind Neon Magenta Horizontal Rib-Coils
    const coilBacking = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.62, 12), obsidianTrimMat);
    coilBacking.position.set(0, 0.08, 0.21);
    torsoPivot.add(coilBacking);

    // Exposed Glowing Neon Magenta Horizontal Rib-Coil Core Chamber
    for (let c = 0; c < 5; c++) {
      const coil = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.034, 8, 22), magentaCoilMat);
      coil.rotation.x = Math.PI / 2;
      coil.position.set(0, -0.14 + c * 0.11, 0.25);
      torsoPivot.add(coil);
    }

    coreMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.44, 12), coreMaterial);
    coreMesh.position.set(0, 0.08, 0.18);
    torsoPivot.add(coreMesh);
    coreRimMesh = new THREE.Mesh(new THREE.RingGeometry(0.24, 0.32, 24), coreRimMaterial);
    coreRimMesh.position.set(0, 0.08, 0.42);
    torsoPivot.add(coreRimMesh);

    // Small Glowing Magenta Top Optic Eye
    headPivot.position.set(0, 0.42, 0.32);
    torsoPivot.add(headPivot);
    const opticBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.1, 12), obsidianTrimMat);
    opticBezel.rotation.x = Math.PI / 2;
    headPivot.add(opticBezel);
    const opticEye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), magentaCoilMat);
    opticEye.position.z = 0.05;
    headPivot.add(opticEye);

    // 4 Curved Metallic Silver-Steel Hanging Intake Mandibles
    secondaryPivot.position.set(0, -0.34, 0);
    torsoPivot.add(secondaryPivot);
    for (let m = 0; m < 4; m++) {
      const mAngle = (m / 4) * Math.PI * 2 + Math.PI / 4;
      const mHolder = new THREE.Group();
      mHolder.rotation.y = mAngle;
      secondaryPivot.add(mHolder);

      const upperJaw = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.32, 6, 10), obsidianTrimMat);
      upperJaw.position.set(0, -0.14, 0.38);
      upperJaw.rotation.x = -0.58;
      mHolder.add(upperJaw);

      const clawTip = new THREE.Mesh(new THREE.ConeGeometry(0.072, 0.54, 6), mandibleSteelMat);
      clawTip.position.set(0, -0.46, 0.44);
      clawTip.rotation.x = Math.PI + 0.34;
      clawTip.castShadow = enableShadows;
      mHolder.add(clawTip);
    }

    weaponPivot.position.set(0, 0.05, 0.42);
    torsoPivot.add(weaponPivot);
  } else if (archetype === 'aegis_sentinel') {
    // =========================================================================
    // AEGIS SENTINEL — Hovering Hexagonal Shield-Support Drone (Sheet 3, Panel 5)
    // Brushed silver-grey & cobalt-blue spherical core chassis, 4 detached curved
    // armor fins orbiting perimeter, and front golden-cyan hexagonal barrier core.
    // =========================================================================
    const brushedSilverMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      bumpMap: armorBump,
      bumpScale: 0.006,
      roughness: 0.24,
      metalness: 0.84,
    });
    const cobaltSteelMat = new THREE.MeshStandardMaterial({
      color: 0x3b5998,
      bumpMap: armorBump,
      bumpScale: 0.008,
      roughness: 0.32,
      metalness: 0.72,
    });
    const darkChassisMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.46,
      metalness: 0.78,
    });
    const hexGoldMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.9,
      roughness: 0.16,
      metalness: 0.5,
    });
    const hexCyanMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x06b6d4,
      emissiveIntensity: 2.1,
      roughness: 0.12,
      metalness: 0.28,
    });

    torsoPivot.position.set(0, 1.56, 0);

    // Compact Spherical-Octagonal Cobalt & Silver Core Chassis
    const coreSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(0.46, 1), cobaltSteelMat);
    coreSphere.castShadow = enableShadows;
    torsoPivot.add(coreSphere);
    primaryMeshes.push(coreSphere);

    const silverCage = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.06, 10, 6), brushedSilverMat);
    silverCage.rotation.z = Math.PI / 6;
    torsoPivot.add(silverCage);

    // Prominent Front Hexagonal Golden-Cyan Barrier Projector Core
    const hexGoldRim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.048, 8, 6), hexGoldMat);
    hexGoldRim.position.set(0, 0, 0.44);
    torsoPivot.add(hexGoldRim);

    coreMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 6), coreMaterial);
    coreMesh.rotation.x = Math.PI / 2;
    coreMesh.position.set(0, 0, 0.42);
    torsoPivot.add(coreMesh);

    const hexCyanLens = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.12, 6), hexCyanMat);
    hexCyanLens.rotation.x = Math.PI / 2;
    hexCyanLens.position.set(0, 0, 0.44);
    torsoPivot.add(hexCyanLens);

    coreRimMesh = new THREE.Mesh(new THREE.RingGeometry(0.36, 0.46, 6), coreRimMaterial);
    coreRimMesh.position.set(0, 0, 0.52);
    torsoPivot.add(coreRimMesh);

    // 4 Detached Curved Brushed-Silver Heavy Shield Petal Fins Orbiting the Core
    secondaryPivot.position.set(0, 0, 0);
    torsoPivot.add(secondaryPivot);
    for (let f = 0; f < 4; f++) {
      const fAngle = (f / 4) * Math.PI * 2 + Math.PI / 4;
      const finGroup = new THREE.Group();
      finGroup.rotation.z = fAngle;
      secondaryPivot.add(finGroup);

      const outerFin = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.62, 0.44, 3, 0.06), brushedSilverMat);
      outerFin.position.set(0.68, 0, 0);
      outerFin.rotation.y = 0.22;
      outerFin.castShadow = enableShadows;
      finGroup.add(outerFin);
      primaryMeshes.push(outerFin);

      const cobaltBacking = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.48, 0.34, 2, 0.03), darkChassisMat);
      cobaltBacking.position.set(0.56, 0, -0.02);
      finGroup.add(cobaltBacking);
    }

    weaponPivot.position.set(0, 0, 0.54);
    torsoPivot.add(weaponPivot);
  } else if (archetype === 'null_weaver') {
    // =========================================================================
    // NULL WEAVER — Hovering Geometric Gyroscope Void-Disruptor (Sheet 2, Panel 8)
    // 4 nested spinning brushed-gunmetal beveled gyroscope rings orbiting around
    // a pulsing bright ultraviolet disruption energy orb.
    // =========================================================================
    const gyroGunmetalMat = new THREE.MeshStandardMaterial({
      color: 0x6b768f,
      bumpMap: armorBump,
      bumpScale: 0.008,
      roughness: 0.24,
      metalness: 0.88,
    });
    const gyroDarkChromeMat = new THREE.MeshStandardMaterial({
      color: 0x384154,
      roughness: 0.22,
      metalness: 0.9,
    });
    const violetOrbMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7c3aed,
      emissiveIntensity: 1.5,
      roughness: 0.1,
      metalness: 0.15,
    });
    const violetGlowShellMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });

    torsoPivot.position.set(0, 1.62, 0);

    // Pulsing Bright Ultraviolet Disruption Orb Dead-Center
    coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 16), coreMaterial);
    torsoPivot.add(coreMesh);

    const innerVioletStar = new THREE.Mesh(new THREE.IcosahedronGeometry(0.29, 1), violetOrbMat);
    torsoPivot.add(innerVioletStar);

    const violetAura = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 16), violetGlowShellMat);
    torsoPivot.add(violetAura);

    coreRimMesh = new THREE.Mesh(new THREE.RingGeometry(0.38, 0.48, 28), coreRimMaterial);
    coreRimMesh.position.z = 0.4;
    torsoPivot.add(coreRimMesh);

    // Outer Spinning Gyroscope Ring Assembly (outerHelixRing)
    outerHelixRing = new THREE.Group();
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.068, 12, 44), gyroGunmetalMat);
    ring1.castShadow = enableShadows;
    outerHelixRing.add(ring1);
    primaryMeshes.push(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.056, 12, 40), gyroDarkChromeMat);
    ring2.rotation.y = Math.PI * 0.34;
    ring2.rotation.x = Math.PI * 0.22;
    ring2.castShadow = enableShadows;
    outerHelixRing.add(ring2);
    torsoPivot.add(outerHelixRing);

    // Inner Counter-Rotating Gyroscope Ring Assembly (innerHelixRing + secondaryPivot)
    innerHelixRing = new THREE.Group();
    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.048, 10, 36), gyroGunmetalMat);
    ring3.rotation.x = Math.PI * 0.42;
    ring3.rotation.y = -Math.PI * 0.28;
    innerHelixRing.add(ring3);

    const ring4 = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.036, 10, 32), gyroDarkChromeMat);
    ring4.rotation.y = Math.PI * 0.5;
    ring4.rotation.z = Math.PI * 0.25;
    innerHelixRing.add(ring4);
    torsoPivot.add(innerHelixRing);

    secondaryPivot.position.set(0, 0, 0);
    torsoPivot.add(secondaryPivot);

    weaponPivot.position.set(0, 0, 0.55);
    torsoPivot.add(weaponPivot);
  } else {
    // =========================================================================
    // SCOUT-L1 — Bipedal White & Slate-Blue Recon Sniper Robot (Sheet 2, Panel 5)
    // Agile white/slate-blue humanoid recon frame, rounded matte-white helm with
    // twin glowing cyan binocular sniper optics, carrying a long precision plasma
    // sniper carbine.
    // =========================================================================
    const scoutWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xe6edf5,
      bumpMap: armorBump,
      bumpScale: 0.006,
      roughness: 0.24,
      metalness: 0.32,
    });
    const scoutSlateBlueMat = new THREE.MeshStandardMaterial({
      color: 0x475c74,
      bumpMap: armorBump,
      bumpScale: 0.008,
      roughness: 0.34,
      metalness: 0.72,
    });
    const scoutJointMat = new THREE.MeshStandardMaterial({
      color: 0x1e2530,
      roughness: 0.5,
      metalness: 0.75,
    });
    const scoutCyanOpticMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x06b6d4,
      emissiveIntensity: 2.35,
      roughness: 0.1,
      metalness: 0.2,
    });

    // Agile Bipedal Recon Legs
    const buildScoutLeg = (sign: number) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(sign * 0.2, 0.9, 0);
      const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.088, 0.36, 6, 12), scoutWhiteMat);
      thigh.position.set(0, -0.2, 0);
      thigh.castShadow = enableShadows;
      legGroup.add(thigh);
      primaryMeshes.push(thigh);

      const shinGroup = new THREE.Group();
      shinGroup.position.set(0, -0.44, 0);
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), scoutJointMat);
      shinGroup.add(knee);
      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.056, 0.44, 10), scoutSlateBlueMat);
      shin.position.set(0, -0.22, -0.02);
      shin.castShadow = enableShadows;
      shinGroup.add(shin);
      const shinGuard = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.32, 0.1, 2, 0.025), scoutWhiteMat);
      shinGuard.position.set(0, -0.22, 0.05);
      shinGroup.add(shinGuard);
      const foot = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.1, 0.26, 2, 0.03), scoutJointMat);
      foot.position.set(0, -0.43, 0.04);
      shinGroup.add(foot);

      legGroup.add(shinGroup);
      bodyGroup.add(legGroup);
      return { legGroup, shinGroup };
    };
    const sL = buildScoutLeg(-1);
    const sR = buildScoutLeg(1);
    leftLegPivot = sL.legGroup;
    leftShinPivot = sL.shinGroup;
    rightLegPivot = sR.legGroup;
    rightShinPivot = sR.shinGroup;

    const pelvis = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.2, 0.28, 2, 0.05), scoutJointMat);
    pelvis.position.y = 0.92;
    bodyGroup.add(pelvis);

    torsoPivot.position.set(0, 1.0, 0);
    const chest = new THREE.Mesh(new RoundedBoxGeometry(0.54, 0.58, 0.32, 3, 0.08), scoutWhiteMat);
    chest.position.set(0, 0.32, 0);
    chest.castShadow = enableShadows;
    torsoPivot.add(chest);
    primaryMeshes.push(chest);

    const chestVest = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.38, 0.36, 2, 0.04), scoutSlateBlueMat);
    chestVest.position.set(0, 0.36, 0.02);
    torsoPivot.add(chestVest);

    coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 12), coreMaterial);
    coreMesh.position.set(0, 0.36, 0.2);
    torsoPivot.add(coreMesh);
    coreRimMesh = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.21, 20), coreRimMaterial);
    coreRimMesh.position.set(0, 0.36, 0.24);
    torsoPivot.add(coreRimMesh);

    // Rounded Matte-White Helmet + Twin Glowing Cyan Binocular Sniper Optics!
    headPivot.position.set(0, 0.74, 0.02);
    torsoPivot.add(headPivot);
    const helmet = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.26, 0.34, 3, 0.08), scoutWhiteMat);
    helmet.castShadow = enableShadows;
    headPivot.add(helmet);

    const goggleHousing = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.13, 0.14, 2, 0.03), scoutSlateBlueMat);
    goggleHousing.position.set(0, 0.02, 0.14);
    headPivot.add(goggleHousing);

    for (const gx of [-0.085, 0.085]) {
      const opticBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.062, 0.12, 14), scoutJointMat);
      opticBarrel.rotation.x = Math.PI / 2;
      opticBarrel.position.set(gx, 0.02, 0.2);
      headPivot.add(opticBarrel);

      const opticLens = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.04, 14), scoutCyanOpticMat);
      opticLens.rotation.x = Math.PI / 2;
      opticLens.position.set(gx, 0.02, 0.25);
      headPivot.add(opticLens);
    }

    // Arms + Long Precision Slate-Blue Plasma Sniper Carbine
    for (const side of [-1, 1]) {
      const arm = new THREE.Group();
      arm.position.set(side * 0.34, 0.5, 0.04);
      const pauldron = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.16, 0.2, 2, 0.04), scoutWhiteMat);
      arm.add(pauldron);
      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.38, 6, 10), scoutSlateBlueMat);
      forearm.position.set(-side * 0.06, -0.18, 0.22);
      forearm.rotation.x = Math.PI * 0.38;
      arm.add(forearm);
      torsoPivot.add(arm);
      if (side < 0) leftArmPivot = arm;
      else rightArmPivot = arm;
    }

    weaponPivot.position.set(0.12, 0.34, 0.22);
    torsoPivot.add(weaponPivot);

    const rifleReceiver = new THREE.Mesh(new RoundedBoxGeometry(0.095, 0.14, 0.72, 2, 0.02), scoutSlateBlueMat);
    rifleReceiver.position.set(0, 0, 0.32);
    rifleReceiver.castShadow = enableShadows;
    weaponPivot.add(rifleReceiver);

    const rifleScope = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.32, 10), scoutJointMat);
    rifleScope.rotation.x = Math.PI / 2;
    rifleScope.position.set(0, 0.11, 0.36);
    weaponPivot.add(rifleScope);

    const rifleBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.032, 0.96, 10), scoutJointMat);
    rifleBarrel.rotation.x = Math.PI / 2;
    rifleBarrel.position.set(0, 0.02, 1.02);
    weaponPivot.add(rifleBarrel);

    const rifleMuzzleGlow = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.012, 8, 16), scoutCyanOpticMat);
    rifleMuzzleGlow.position.set(0, 0.02, 1.48);
    weaponPivot.add(rifleMuzzleGlow);
  }

  // Ground Telegraph AoE Disc & Expanding Warning Ring
  const telegraphRadius =
    archetype === 'scout' ||
    archetype === 'null_weaver' ||
    archetype === 'chrono_mortar' ||
    archetype === 'resonance_warden'
      ? 1.15
      : isBossArchetype
        ? GAME_CONFIG.boss.attacks.anchor_slam.innerRadius
        : cfg.attackRange;
  const telegraphDiscMaterial = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const telegraphDisc = new THREE.Mesh(
    new THREE.CircleGeometry(telegraphRadius, 40),
    telegraphDiscMaterial
  );
  telegraphDisc.rotation.x = -Math.PI / 2;
  telegraphDisc.position.y = 0.025;
  root.add(telegraphDisc);

  const telegraphRingMaterial = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const telegraphRing = new THREE.Mesh(
    new THREE.RingGeometry(telegraphRadius - 0.14, telegraphRadius, 40),
    telegraphRingMaterial
  );
  telegraphRing.rotation.x = -Math.PI / 2;
  telegraphRing.position.y = 0.032;
  root.add(telegraphRing);

  const telegraphShaderMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    uniforms: {
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uColor: { value: new THREE.Color(0xf59e0b) },
      uReducedMotion: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uProgress;
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uColor;
      uniform float uReducedMotion;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float dist = length(p);
        if (dist > 1.0) discard;

        float angle = atan(p.y, p.x);
        float spin = (1.0 - uReducedMotion) * uTime * 3.8;
        float sweepAngle = mod(angle + spin + 3.14159265, 6.2831853);
        float arcMask = step(0.15, sin(sweepAngle * 6.0));

        float progR = clamp(uProgress, 0.08, 0.93);
        float outerRing = smoothstep(0.055, 0.0, abs(dist - 0.93));
        float fillRing = smoothstep(0.048, 0.0, abs(dist - progR));
        float innerWave = smoothstep(0.04, 0.0, abs(dist - mod(progR + 0.35, 0.9))) * 0.45;
        float fillInterior = (1.0 - smoothstep(progR - 0.04, progR + 0.02, dist)) * 0.18;
        float hazardSector = outerRing * (0.35 + 0.65 * arcMask);
        float alpha = (hazardSector + fillRing * 1.15 + innerWave + fillInterior) * uOpacity;
        if (alpha <= 0.01) discard;

        vec3 col = mix(uColor, vec3(1.0, 0.96, 0.88), fillRing * 0.62 + outerRing * arcMask * 0.3);
        gl_FragColor = vec4(col, min(0.92, alpha));
      }
    `,
  });
  const telegraphShaderDisc = new THREE.Mesh(
    new THREE.PlaneGeometry(telegraphRadius * 2.15, telegraphRadius * 2.15),
    telegraphShaderMat
  );
  telegraphShaderDisc.rotation.x = -Math.PI / 2;
  telegraphShaderDisc.position.y = 0.042;
  telegraphShaderDisc.visible = false;
  root.add(telegraphShaderDisc);

  let laserSightMesh: THREE.Mesh | undefined;
  let laserSightMaterial: THREE.MeshBasicMaterial | undefined;

  if (
    archetype === 'scout' ||
    archetype === 'null_weaver' ||
    archetype === 'resonance_warden'
  ) {
    laserSightMaterial = new THREE.MeshBasicMaterial({
      color:
        archetype === 'null_weaver'
          ? 0xa855f7
          : archetype === 'resonance_warden'
            ? 0x10b981
            : 0xec4899,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beamLen = cfg.attackRange;
    const beamGeo = new THREE.PlaneGeometry(0.24, beamLen);
    beamGeo.translate(0, beamLen * 0.5, 0);
    laserSightMesh = new THREE.Mesh(beamGeo, laserSightMaterial);
    laserSightMesh.rotation.x = -Math.PI / 2;
    laserSightMesh.position.y = 0.04;
    root.add(laserSightMesh);
  }

  // Elite Affix Floating Crown Halo (hidden unless enemy has an Elite Modifier)
  const eliteCrownMaterial = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const eliteCrownMesh = new THREE.Mesh(
    new THREE.TorusGeometry(Math.max(0.46, cfg.radius * 0.65), 0.032, 8, 28),
    eliteCrownMaterial
  );
  eliteCrownMesh.rotation.x = Math.PI / 2;
  eliteCrownMesh.position.y = isBossArchetype ? 3.9 : 2.65;
  eliteCrownMesh.visible = false;
  root.add(eliteCrownMesh);

  // Meshy GLB Custom Model Override Slot (toggled by ArenaSceneRenderer.syncCustomMeshyModels)
  const customMeshySlot = new THREE.Group();
  customMeshySlot.name = `CustomMeshySlot_${id}`;
  customMeshySlot.visible = false;
  root.add(customMeshySlot);

  return {
    id,
    archetype,
    root,
    bodyGroup,
    torsoPivot,
    headPivot,
    primaryMeshes,
    coreMesh,
    coreMaterial,
    coreRimMesh,
    coreRimMaterial,
    weaponPivot,
    secondaryPivot,
    leftArmPivot,
    rightArmPivot,
    leftLegPivot,
    leftShinPivot,
    rightLegPivot,
    rightShinPivot,
    outerHelixRing,
    innerHelixRing,
    leftShutterPivot,
    rightShutterPivot,
    ramLaneGroup,
    ramLaneFillMat,
    ramLaneBorderMat,
    ramLaneShaderMat,
    sweepSectorGroup,
    sweepSectorFillMat,
    sweepSectorRimMat,
    sweepSectorShaderMat,
    slamShockwaveRing,
    slamShockwaveMat,
    auxiliaryPivots,
    telegraphDisc,
    telegraphDiscMaterial,
    telegraphRing,
    telegraphRingMaterial,
    telegraphShaderDisc,
    telegraphShaderMat,
    laserSightMesh,
    laserSightMaterial,
    eliteCrownMesh,
    eliteCrownMaterial,
    customMeshySlot,
  };
}

function ramFieldFlipZ(mesh: THREE.Mesh): void {
  mesh.rotation.z = Math.PI;
}

export interface ChronoPlateAndReceiverRig {
  root: THREE.Group;
  puzzleFixturesGroup: THREE.Group;
  padGroup: THREE.Group;
  padCoreMaterial: THREE.MeshStandardMaterial;
  padRingMaterial: THREE.MeshBasicMaterial;
  syncRingMesh: THREE.Mesh;
  syncRingMaterial: THREE.MeshBasicMaterial;
  clawPivots: THREE.Group[];
  conduitCoreMaterial: THREE.MeshBasicMaterial;
  barrierColumnGroup: THREE.Group;
  barrierStripMaterial: THREE.MeshStandardMaterial;
  receiverBeaconMesh: THREE.Mesh;
  receiverBeaconMaterial: THREE.MeshStandardMaterial;
  recordingRingGroup: THREE.Group;
  recordingRingMaterial: THREE.MeshBasicMaterial;
  originMarkerGroup: THREE.Group;
  originMarkerRing: THREE.Mesh;
  // Phase 3: Stage 2 Heavy Action Receiver & Stage 3 Combine Plate + Final Barrier
  heavyStrikePadRingMaterial: THREE.MeshBasicMaterial;
  heavyStrikeChevronMaterial: THREE.MeshBasicMaterial;
  heavyReceptorCoreMaterial: THREE.MeshStandardMaterial;
  heavyReceptorGyroLeft: THREE.Mesh;
  heavyReceptorGyroRight: THREE.Mesh;
  combinePadGroup: THREE.Group;
  combinePadCoreMaterial: THREE.MeshStandardMaterial;
  combinePadRingMaterial: THREE.MeshBasicMaterial;
  combineSyncRingMesh: THREE.Mesh;
  combineSyncRingMaterial: THREE.MeshBasicMaterial;
  combineClawPivots: THREE.Group[];
  receiverToCombineConduitMaterial: THREE.MeshBasicMaterial;
  combinePlateConduitMaterial: THREE.MeshBasicMaterial;
  finalBarrierColumnGroup: THREE.Group;
  finalBarrierReceiverBandMat: THREE.MeshStandardMaterial;
  finalBarrierPlateBandMat: THREE.MeshStandardMaterial;
  finalBarrierBeaconMesh: THREE.Mesh;
  finalBarrierBeaconMaterial: THREE.MeshStandardMaterial;
  completionBeaconMesh: THREE.Mesh;
  completionBeaconMaterial: THREE.MeshStandardMaterial;
  relayTargetGroup: THREE.Group;
  relayTargetRingMesh: THREE.Mesh;
  relayTargetRingMaterial: THREE.MeshBasicMaterial;
  relayTargetInnerMaterial: THREE.MeshBasicMaterial;
  relayTargetColumnMesh: THREE.Mesh;
  relayTargetColumnMaterial: THREE.MeshBasicMaterial;
}

export function createEchoPlayerRig(shadowTex: THREE.Texture): PlayerRig {
  const rig = createSeraPlayerRig(shadowTex, false);
  const scanlineTex = createTemporalScanlineTexture();

  const holoPrimaryMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x06b6d4,
    emissiveMap: scanlineTex,
    emissiveIntensity: 1.45,
    roughness: 0.14,
    metalness: 0.35,
    transparent: true,
    opacity: 0.68,
  });

  const holoAccentMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.85,
    roughness: 0.1,
    metalness: 0.45,
    transparent: true,
    opacity: 0.88,
  });

  const preservedMaterials = new Set<THREE.Material>([
    rig.bladeMaterial,
    rig.slashArcMaterial,
    rig.parryShieldMaterial,
    rig.chargeRingMaterial,
  ]);
  const disposedMaterials = new Set<THREE.Material>();

  rig.bodyGroup.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = false;
      obj.receiveShadow = false;
      const oldMat = obj.material as THREE.Material;
      if (!preservedMaterials.has(oldMat)) {
        if (!disposedMaterials.has(oldMat)) {
          disposedMaterials.add(oldMat);
        }
        obj.material =
          obj === rig.chronoRingMesh || obj === rig.visorMesh
            ? holoAccentMat
            : holoPrimaryMat;
      }
    }
  });

  for (const m of disposedMaterials) {
    m.dispose();
  }

  rig.bladeMaterial.color.setHex(0xe0f2fe);
  rig.bladeMaterial.emissive.setHex(0x22d3ee);
  rig.bladeMaterial.emissiveIntensity = 2.1;
  rig.bladeMaterial.transparent = true;
  rig.bladeMaterial.opacity = 0.92;

  // ECHO DECOY — Electric-Cyan Holographic Projection Rings, Wireframe Lattice & Data Particles (Sheet 4, Panel 7)
  const echoBaseRing = new THREE.Mesh(
    new THREE.RingGeometry(0.56, 0.74, 36),
    new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.86,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  echoBaseRing.rotation.x = -Math.PI / 2;
  echoBaseRing.position.y = 0.032;
  rig.root.add(echoBaseRing);

  const echoBaseRippleMesh = new THREE.Mesh(
    new THREE.RingGeometry(0.78, 0.94, 36),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.52,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  echoBaseRippleMesh.rotation.x = -Math.PI / 2;
  echoBaseRippleMesh.position.y = 0.036;
  rig.root.add(echoBaseRippleMesh);
  rig.echoBaseRippleMesh = echoBaseRippleMesh;

  const chevronGeo = new THREE.ConeGeometry(0.2, 0.36, 3);
  chevronGeo.rotateX(Math.PI / 2);
  const facingChevron = new THREE.Mesh(
    chevronGeo,
    new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    })
  );
  facingChevron.position.set(0, 0.04, 0.88);
  rig.root.add(facingChevron);

  // Full-Torso Holographic Wireframe Scanline Lattice + Floating Hologram Data Particles
  const echoInnerWireMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.22, 0.88, 12, 5, true),
    new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  echoInnerWireMesh.position.set(0, 0.34, 0.02);
  rig.torsoPivot.add(echoInnerWireMesh);
  rig.echoInnerWireMesh = echoInnerWireMesh;

  const echoParticleMat = new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const echoParticleGeo = new THREE.OctahedronGeometry(0.026, 0);
  for (let ep = 0; ep < 10; ep++) {
    const a = (ep / 10) * Math.PI * 2;
    const r = 0.44 + (ep % 3) * 0.1;
    const speck = new THREE.Mesh(echoParticleGeo, echoParticleMat);
    speck.position.set(Math.cos(a) * r, 0.25 + (ep % 5) * 0.32, Math.sin(a) * r);
    rig.bodyGroup.add(speck);
  }

  const echoPhaseRingMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.54, 0.018, 8, 32),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  echoPhaseRingMesh.rotation.x = Math.PI / 2;
  echoPhaseRingMesh.position.y = 0.8;
  rig.bodyGroup.add(echoPhaseRingMesh);
  rig.echoPhaseRingMesh = echoPhaseRingMesh;

  const echoSecondPhaseRingMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.014, 8, 28),
    new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  echoSecondPhaseRingMesh.rotation.x = Math.PI / 2;
  echoSecondPhaseRingMesh.position.y = 1.25;
  rig.bodyGroup.add(echoSecondPhaseRingMesh);
  rig.echoSecondPhaseRingMesh = echoSecondPhaseRingMesh;

  return rig;
}

export function createChronoPlateAndReceiverRig(
  enableShadows: boolean
): ChronoPlateAndReceiverRig {
  const cfg = GAME_CONFIG.arena.chronoPlate;
  const puzzleCfg = GAME_CONFIG.arena.chronoPuzzle;
  const root = new THREE.Group();
  const puzzleFixturesGroup = new THREE.Group();
  root.add(puzzleFixturesGroup);

  const housingMat = new THREE.MeshStandardMaterial({
    color: 0x1e2d42,
    roughness: 0.38,
    metalness: 0.75,
  });
  const alloyMat = new THREE.MeshStandardMaterial({
    color: 0x7c8ea6,
    roughness: 0.24,
    metalness: 0.85,
  });
  const bronzeAccentMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.28,
    metalness: 0.84,
  });
  const padCoreMaterial = new THREE.MeshStandardMaterial({
    color: 0x0e7490,
    emissive: 0x0891b2,
    emissiveIntensity: 0.85,
    roughness: 0.2,
    metalness: 0.5,
  });
  const padRingMaterial = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.62,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const syncRingMaterial = new THREE.MeshBasicMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // 1. ANCHOR PAD — Beveled Hexagonal Calibration Platform, Glowing Circuit Traces & Holo Projection Ring (Sheet 4, Panel 6)
  const plateBaseGroup = new THREE.Group();
  plateBaseGroup.position.set(cfg.x, 0, cfg.z);
  puzzleFixturesGroup.add(plateBaseGroup);

  const anchorCyanPinMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.45,
    roughness: 0.16,
    metalness: 0.2,
  });

  // Heavy beveled dark-steel hexagonal outer base housing
  const outerRim = new THREE.Mesh(
    new THREE.CylinderGeometry(cfg.radius * 1.06, cfg.radius * 1.18, 0.12, 6),
    housingMat
  );
  outerRim.position.y = 0.06;
  outerRim.receiveShadow = enableShadows;
  plateBaseGroup.add(outerRim);

  // 4 Low Corner Emitter Pins with glowing cyan optical tops
  for (let c = 0; c < 4; c++) {
    const ca = (c / 4) * Math.PI * 2;
    const pod = new THREE.Mesh(
      new RoundedBoxGeometry(0.28, 0.13, 0.34, 2, 0.03),
      alloyMat
    );
    pod.rotation.y = ca;
    pod.position.set(
      Math.sin(ca) * (cfg.radius * 1.16),
      0.065,
      Math.cos(ca) * (cfg.radius * 1.16)
    );
    plateBaseGroup.add(pod);

    const pinCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.075, 0.04, 10),
      anchorCyanPinMat
    );
    pinCap.position.set(
      Math.sin(ca) * (cfg.radius * 1.16),
      0.145,
      Math.cos(ca) * (cfg.radius * 1.16)
    );
    plateBaseGroup.add(pinCap);
  }

  // Hexagonal recessed glowing cyan circuit border trace
  const outerTriggerRing = new THREE.Mesh(
    new THREE.RingGeometry(cfg.radius * 0.86, cfg.radius * 0.94, 6),
    padRingMaterial
  );
  outerTriggerRing.rotation.x = -Math.PI / 2;
  outerTriggerRing.rotation.z = Math.PI / 6;
  outerTriggerRing.position.y = 0.128;
  plateBaseGroup.add(outerTriggerRing);

  // Depressible Inner Hexagonal Pad Group with etched glowing cyan circuit traces
  const padGroup = new THREE.Group();
  padGroup.position.y = 0.075;
  plateBaseGroup.add(padGroup);

  const innerPadPlate = new THREE.Mesh(
    new THREE.CylinderGeometry(cfg.radius * 0.82, cfg.radius * 0.88, 0.075, 6),
    alloyMat
  );
  innerPadPlate.receiveShadow = enableShadows;
  padGroup.add(innerPadPlate);

  const centerCoreDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(cfg.radius * 0.44, cfg.radius * 0.44, 0.086, 6),
    padCoreMaterial
  );
  centerCoreDisc.position.y = 0.01;
  padGroup.add(centerCoreDisc);

  // Radial glowing cyan circuit trace bars connecting center core to outer hex rim
  for (let tr = 0; tr < 6; tr++) {
    const ta = (tr / 6) * Math.PI * 2;
    const trace = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.014, cfg.radius * 0.42),
      anchorCyanPinMat
    );
    trace.rotation.y = ta;
    trace.position.set(
      Math.sin(ta) * (cfg.radius * 0.62),
      0.044,
      Math.cos(ta) * (cfg.radius * 0.62)
    );
    padGroup.add(trace);
  }

  // 4 Mechanical Chevron Claws around the Pressure Plate
  const clawPivots: THREE.Group[] = [];
  const clawGeo = new RoundedBoxGeometry(0.22, 0.13, 0.36, 2, 0.03);
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const pivot = new THREE.Group();
    pivot.rotation.y = angle;
    pivot.position.set(
      Math.sin(angle) * (cfg.radius * 0.9),
      0.09,
      Math.cos(angle) * (cfg.radius * 0.9)
    );
    const clawMesh = new THREE.Mesh(clawGeo, alloyMat);
    clawMesh.position.set(0, 0.04, -0.08);
    pivot.add(clawMesh);
    plateBaseGroup.add(pivot);
    clawPivots.push(pivot);
  }

  // Soft Upward Translucent Holographic Cyan Projection Curtain + Floating Sync Halo Ring
  const holoCurtain = new THREE.Mesh(
    new THREE.CylinderGeometry(cfg.radius * 0.72, cfg.radius * 0.72, 0.92, 28, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  holoCurtain.position.y = 0.56;
  plateBaseGroup.add(holoCurtain);

  const staticHaloRing = new THREE.Mesh(
    new THREE.TorusGeometry(cfg.radius * 0.72, 0.026, 8, 36),
    anchorCyanPinMat
  );
  staticHaloRing.rotation.x = Math.PI / 2;
  staticHaloRing.position.y = 1.02;
  plateBaseGroup.add(staticHaloRing);

  // Rising Holographic Sync Ring when Echo activates the plate
  const syncRingMesh = new THREE.Mesh(
    new THREE.TorusGeometry(cfg.radius * 0.72, 0.038, 10, 36),
    syncRingMaterial
  );
  syncRingMesh.rotation.x = Math.PI / 2;
  syncRingMesh.position.y = 0.18;
  plateBaseGroup.add(syncRingMesh);

  // 2. Connecting Floor Conduit Channel between Plate 01 and Stage 1 Barrier
  const dx = cfg.receiverX - cfg.x;
  const dz = cfg.receiverZ - cfg.z;
  const conduitLen = Math.hypot(dx, dz);
  const conduitAngle = Math.atan2(dx, dz);
  const midX = (cfg.x + cfg.receiverX) * 0.5;
  const midZ = (cfg.z + cfg.receiverZ) * 0.5;

  const conduitHousing = new THREE.Mesh(
    new THREE.BoxGeometry(0.44, 0.03, conduitLen),
    housingMat
  );
  conduitHousing.position.set(midX, 0.015, midZ);
  conduitHousing.rotation.y = conduitAngle;
  puzzleFixturesGroup.add(conduitHousing);

  const conduitCoreMaterial = new THREE.MeshBasicMaterial({
    color: 0x0891b2,
    transparent: true,
    opacity: 0.48,
  });
  const conduitCore = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.036, conduitLen),
    conduitCoreMaterial
  );
  conduitCore.position.set(midX, 0.02, midZ);
  conduitCore.rotation.y = conduitAngle;
  puzzleFixturesGroup.add(conduitCore);

  // 3. Stage 1 Receiver Socket, Twin Gate Jamb Pylons & Retractable Containment Barrier at (cfg.receiverX, 0, cfg.receiverZ)
  const receiverRoot = new THREE.Group();
  receiverRoot.position.set(cfg.receiverX, 0, cfg.receiverZ);
  puzzleFixturesGroup.add(receiverRoot);

  const socketRim = new THREE.Mesh(
    new THREE.CylinderGeometry(cfg.receiverRadius * 1.14, cfg.receiverRadius * 1.24, 0.13, 24),
    housingMat
  );
  socketRim.position.y = 0.065;
  receiverRoot.add(socketRim);

  // BARRIER BOLLARD — Recessed Steel Socket, Twin Bronze Side Clamp Jambs, Cylindrical Charcoal Bollard with Twin Amber Bands & Floating Gold Lock Ring (Sheet 9, Panel 1)
  const socketOuterRing = new THREE.Mesh(
    new THREE.TorusGeometry(cfg.receiverRadius * 1.18, 0.09, 10, 28),
    alloyMat
  );
  socketOuterRing.rotation.x = Math.PI / 2;
  socketOuterRing.position.y = 0.08;
  receiverRoot.add(socketOuterRing);

  // Heavy weathered-bronze vertical side clamp jambs framing the bollard
  for (const sideZ of [-cfg.receiverRadius * 0.92, cfg.receiverRadius * 0.92]) {
    const jambPost = new THREE.Mesh(
      new RoundedBoxGeometry(0.24, cfg.receiverHeight * 0.88, 0.24, 2, 0.04),
      bronzeAccentMat
    );
    jambPost.position.set(0, cfg.receiverHeight * 0.46, sideZ);
    receiverRoot.add(jambPost);

    const jambFoot = new THREE.Mesh(
      new RoundedBoxGeometry(0.32, 0.18, 0.32, 2, 0.03),
      housingMat
    );
    jambFoot.position.set(0, 0.14, sideZ);
    receiverRoot.add(jambFoot);
  }

  const barrierColumnGroup = new THREE.Group();
  receiverRoot.add(barrierColumnGroup);

  const mainBollard = new THREE.Mesh(
    new THREE.CylinderGeometry(
      cfg.receiverRadius * 0.82,
      cfg.receiverRadius * 0.86,
      cfg.receiverHeight,
      24
    ),
    housingMat
  );
  mainBollard.position.y = cfg.receiverHeight * 0.5;
  mainBollard.castShadow = enableShadows;
  mainBollard.receiveShadow = enableShadows;
  barrierColumnGroup.add(mainBollard);

  const barrierCap = new THREE.Mesh(
    new THREE.CylinderGeometry(
      cfg.receiverRadius * 0.74,
      cfg.receiverRadius * 0.86,
      0.24,
      24
    ),
    alloyMat
  );
  barrierCap.position.y = cfg.receiverHeight + 0.02;
  barrierColumnGroup.add(barrierCap);

  const barrierStripMaterial = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 1.5,
    roughness: 0.2,
    metalness: 0.35,
  });

  // Twin recessed glowing horizontal amber status bands + dark frame collars
  for (const h of [cfg.receiverHeight * 0.36, cfg.receiverHeight * 0.68]) {
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(
        cfg.receiverRadius * 0.855,
        cfg.receiverRadius * 0.855,
        0.16,
        24
      ),
      barrierStripMaterial
    );
    band.position.y = h;
    barrierColumnGroup.add(band);
  }

  const receiverBeaconMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4ad52,
    emissive: 0xd97706,
    emissiveIntensity: 0.65,
    roughness: 0.24,
    metalness: 0.88,
  });
  // Floating horizontal antique-gold lock ring with glowing amber front jewel hovering above the cap
  const receiverBeaconMesh = new THREE.Mesh(
    new THREE.TorusGeometry(cfg.receiverRadius * 0.72, 0.075, 12, 32),
    receiverBeaconMaterial
  );
  receiverBeaconMesh.rotation.x = Math.PI / 2;
  receiverBeaconMesh.position.y = cfg.receiverHeight + 0.56;
  const lockJewel = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 12, 10),
    barrierStripMaterial
  );
  lockJewel.position.set(0, cfg.receiverRadius * 0.72, 0);
  receiverBeaconMesh.add(lockJewel);
  receiverRoot.add(receiverBeaconMesh);

  // 4. Amber Recording Ring around Sera while recording
  const recordingRingGroup = new THREE.Group();
  recordingRingGroup.visible = false;
  const recordingRingMaterial = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const recRingMesh = new THREE.Mesh(
    new THREE.RingGeometry(0.84, 1.0, 36),
    recordingRingMaterial
  );
  recRingMesh.rotation.x = -Math.PI / 2;
  recRingMesh.position.y = 0.04;
  recordingRingGroup.add(recRingMesh);
  root.add(recordingRingGroup);

  // 5. ORIGIN ANCHOR — Circular Brass/Titanium Chronometer Base with Translucent Amber Projection Cone & Concentric Timestamp Rings (Sheet 9, Panel 7)
  const originMarkerGroup = new THREE.Group();
  originMarkerGroup.visible = false;
  const originBaseDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.54, 0.66, 0.1, 20),
    housingMat
  );
  originBaseDisc.position.y = 0.05;
  originMarkerGroup.add(originBaseDisc);

  const originBrassRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.045, 8, 28),
    bronzeAccentMat
  );
  originBrassRing.rotation.x = Math.PI / 2;
  originBrassRing.position.y = 0.11;
  originMarkerGroup.add(originBrassRing);

  for (let ft = 0; ft < 4; ft++) {
    const fa = (ft / 4) * Math.PI * 2 + Math.PI / 4;
    const foot = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.09, 0.2, 1, 0.02), bronzeAccentMat);
    foot.position.set(Math.sin(fa) * 0.58, 0.05, Math.cos(fa) * 0.58);
    foot.rotation.y = fa;
    originMarkerGroup.add(foot);
  }

  // Upward flaring translucent warm-amber holographic time cone
  const originCone = new THREE.Mesh(
    new THREE.CylinderGeometry(0.76, 0.36, 1.08, 24, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  originCone.position.y = 0.65;
  originMarkerGroup.add(originCone);

  // Stacked concentric glowing amber & cyan timestamp rings floating inside the projection cone
  let originMarkerRing!: THREE.Mesh;
  for (const [ry, rIn, rOut, col, op] of [
    [0.14, 0.34, 0.42, 0xfbbf24, 0.82],
    [0.54, 0.38, 0.46, 0x38bdf8, 0.78],
    [1.12, 0.64, 0.76, 0xfbbf24, 0.85],
  ] as const) {
    const stampRing = new THREE.Mesh(
      new THREE.RingGeometry(rIn, rOut, 32),
      new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: op,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    stampRing.rotation.x = -Math.PI / 2;
    stampRing.position.y = ry;
    originMarkerGroup.add(stampRing);
    originMarkerRing = stampRing;
  }
  root.add(originMarkerGroup);

  // 6. Phase 3 Stage 2 (TEST): Kinetic Resonance Receiver 01 (Strike Pad + Waveguide Rails + Induction Core)
  const hrCfg = puzzleCfg.heavyReceiver;
  const heavyStrikeGroup = new THREE.Group();
  heavyStrikeGroup.position.set(hrCfg.x, 0, hrCfg.z);
  puzzleFixturesGroup.add(heavyStrikeGroup);

  const strikeRim = new THREE.Mesh(
    new THREE.CylinderGeometry(hrCfg.radius * 0.98, hrCfg.radius * 1.06, 0.07, 8),
    housingMat
  );
  strikeRim.position.y = 0.035;
  heavyStrikeGroup.add(strikeRim);

  // Dual lateral waveguide rails pointing North toward the receptor core
  for (const rx of [-0.95, 0.95]) {
    const rail = new THREE.Mesh(
      new RoundedBoxGeometry(0.18, 0.16, 1.65, 2, 0.03),
      alloyMat
    );
    rail.position.set(rx, 0.08, -0.55);
    heavyStrikeGroup.add(rail);
  }

  const heavyStrikePadRingMaterial = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const strikeOuterRing = new THREE.Mesh(
    new THREE.RingGeometry(hrCfg.radius - 0.1, hrCfg.radius + 0.04, 32),
    heavyStrikePadRingMaterial
  );
  strikeOuterRing.rotation.x = -Math.PI / 2;
  strikeOuterRing.position.y = 0.032;
  heavyStrikeGroup.add(strikeOuterRing);

  const heavyStrikeChevronMaterial = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const aimChevronGeo = new THREE.ConeGeometry(0.38, 0.7, 3);
  aimChevronGeo.rotateX(-Math.PI / 2); // Points North (-Z) toward receptor core
  const aimChevronMesh = new THREE.Mesh(aimChevronGeo, heavyStrikeChevronMaterial);
  aimChevronMesh.position.set(0, 0.072, -0.45);
  heavyStrikeGroup.add(aimChevronMesh);

  // CHRONO RECEIVER — Hexagonal Dark-Slate Pedestal, Twin Curved White-Ceramic Antenna Fins & Floating Cyan Core Ring (Sheet 6, Panel 4)
  const receptorGroup = new THREE.Group();
  receptorGroup.position.set(hrCfg.targetX, 0, hrCfg.targetZ);
  puzzleFixturesGroup.add(receptorGroup);

  const receiverCeramicMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.22,
    metalness: 0.24,
  });
  const heavyReceptorCoreMaterial = new THREE.MeshStandardMaterial({
    color: 0x22d3ee,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.5,
    roughness: 0.16,
    metalness: 0.35,
  });

  // Stepped hexagonal dark-slate receiver base + recessed glowing cyan emitter pad
  const floorAnvilBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.84, 1.02, 0.16, 6),
    housingMat
  );
  floorAnvilBase.position.y = 0.08;
  receptorGroup.add(floorAnvilBase);

  const floorAnvilCore = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.045, 10, 24),
    heavyReceptorCoreMaterial
  );
  floorAnvilCore.rotation.x = Math.PI / 2;
  floorAnvilCore.position.y = 0.17;
  receptorGroup.add(floorAnvilCore);

  // Twin side CHRONO RECEIVER pedestals with curved white-ceramic antenna fins flanking the walk lane
  const stanchionOffset = 1.44;
  for (const side of [-1, 1]) {
    const pod = new THREE.Group();
    pod.position.set(side * stanchionOffset, 0, 0);
    receptorGroup.add(pod);

    const hexFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.84, 0.22, 6), housingMat);
    hexFoot.position.y = 0.11;
    pod.add(hexFoot);
    const hexTop = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.66, 0.12, 6), alloyMat);
    hexTop.position.y = 0.28;
    pod.add(hexTop);
    const baseGlow = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.032, 8, 20), heavyReceptorCoreMaterial);
    baseGlow.rotation.x = Math.PI / 2;
    baseGlow.position.y = 0.35;
    pod.add(baseGlow);

    // Twin sweeping curved glossy white-ceramic antenna fins cradling the levitating ring core
    for (const finSide of [-1, 1]) {
      const lowerFin = new THREE.Mesh(
        new RoundedBoxGeometry(0.14, 0.88, 0.24, 2, 0.04),
        receiverCeramicMat
      );
      lowerFin.position.set(finSide * 0.52, 0.72, 0);
      lowerFin.rotation.z = finSide * -0.28;
      pod.add(lowerFin);

      const upperFin = new THREE.Mesh(
        new RoundedBoxGeometry(0.12, 0.96, 0.2, 2, 0.035),
        receiverCeramicMat
      );
      upperFin.position.set(finSide * 0.56, 1.56, 0);
      upperFin.rotation.z = finSide * 0.18;
      pod.add(upperFin);
    }
  }

  const overheadArch = new THREE.Mesh(
    new RoundedBoxGeometry(stanchionOffset * 2 + 0.4, 0.18, 0.32, 2, 0.04),
    alloyMat
  );
  overheadArch.position.set(0, 2.52, 0);
  receptorGroup.add(overheadArch);

  const buildReceiverFloatingCore = (xPos: number): THREE.Mesh => {
    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, 0.045, 10, 24),
      heavyReceptorCoreMaterial
    );
    outerRing.position.set(xPos, 1.38, 0);
    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.032, 8, 20),
      heavyReceptorCoreMaterial
    );
    innerRing.rotation.x = Math.PI * 0.5;
    outerRing.add(innerRing);
    receptorGroup.add(outerRing);
    return outerRing;
  };

  const heavyReceptorGyroLeft = buildReceiverFloatingCore(-stanchionOffset);
  const heavyReceptorGyroRight = buildReceiverFloatingCore(stanchionOffset);

  // 7. Phase 3 Stage 3 (COMBINE): Chrono Anchor Pad 02 at (cpCfg.x, 0, cpCfg.z)
  const cpCfg = puzzleCfg.combinePlate;
  const combinePlateBase = new THREE.Group();
  combinePlateBase.position.set(cpCfg.x, 0, cpCfg.z);
  puzzleFixturesGroup.add(combinePlateBase);

  const cpOuterRim = new THREE.Mesh(
    new THREE.CylinderGeometry(cpCfg.radius * 1.08, cpCfg.radius * 1.18, 0.09, 16),
    housingMat
  );
  cpOuterRim.position.y = 0.045;
  cpOuterRim.receiveShadow = enableShadows;
  combinePlateBase.add(cpOuterRim);

  const combinePadRingMaterial = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.62,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const cpOuterTriggerRing = new THREE.Mesh(
    new THREE.RingGeometry(cpCfg.radius - 0.09, cpCfg.radius + 0.04, 40),
    combinePadRingMaterial
  );
  cpOuterTriggerRing.rotation.x = -Math.PI / 2;
  cpOuterTriggerRing.position.y = 0.028;
  combinePlateBase.add(cpOuterTriggerRing);

  const combinePadGroup = new THREE.Group();
  combinePadGroup.position.y = 0.075;
  combinePlateBase.add(combinePadGroup);

  const cpInnerPlate = new THREE.Mesh(
    new THREE.CylinderGeometry(cpCfg.radius * 0.78, cpCfg.radius * 0.84, 0.07, 24),
    alloyMat
  );
  cpInnerPlate.receiveShadow = enableShadows;
  combinePadGroup.add(cpInnerPlate);

  const combinePadCoreMaterial = new THREE.MeshStandardMaterial({
    color: 0x0e7490,
    emissive: 0x0891b2,
    emissiveIntensity: 0.85,
    roughness: 0.2,
    metalness: 0.5,
  });
  const cpCenterDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(cpCfg.radius * 0.48, cpCfg.radius * 0.48, 0.085, 20),
    combinePadCoreMaterial
  );
  cpCenterDisc.position.y = 0.01;
  combinePadGroup.add(cpCenterDisc);

  const combineClawPivots: THREE.Group[] = [];
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const pivot = new THREE.Group();
    pivot.rotation.y = angle;
    pivot.position.set(
      Math.sin(angle) * (cpCfg.radius * 0.88),
      0.08,
      Math.cos(angle) * (cpCfg.radius * 0.88)
    );
    const clawMesh = new THREE.Mesh(clawGeo, alloyMat);
    clawMesh.position.set(0, 0.04, -0.08);
    pivot.add(clawMesh);
    combinePlateBase.add(pivot);
    combineClawPivots.push(pivot);
  }

  const combineSyncRingMaterial = new THREE.MeshBasicMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const combineSyncRingMesh = new THREE.Mesh(
    new THREE.TorusGeometry(cpCfg.radius * 0.72, 0.038, 10, 36),
    combineSyncRingMaterial
  );
  combineSyncRingMesh.rotation.x = Math.PI / 2;
  combineSyncRingMesh.position.y = 0.18;
  combinePlateBase.add(combineSyncRingMesh);

  // WARP RELAY PAD Upgrade — Recessed Metallic Beveled Diamond/Hex Deck Frame, Corner Lock Clamps & Vertical Golden-Cyan Light Curtains (Sheet 10, Panel 7)
  const warpRimGoldMat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    transparent: true,
    opacity: 0.78,
  });
  const warpCurtainMat = new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const warpOuterBevel = new THREE.Mesh(
    new THREE.CylinderGeometry(cpCfg.radius * 0.96, cpCfg.radius * 1.04, 0.09, 4),
    housingMat
  );
  warpOuterBevel.rotation.y = Math.PI / 4;
  warpOuterBevel.position.y = 0.045;
  combinePlateBase.add(warpOuterBevel);
  const warpGoldFrame = new THREE.Mesh(
    new THREE.TorusGeometry(cpCfg.radius * 0.68, 0.032, 6, 4),
    warpRimGoldMat
  );
  warpGoldFrame.rotation.x = Math.PI / 2;
  warpGoldFrame.rotation.z = Math.PI / 4;
  warpGoldFrame.position.y = 0.115;
  combinePlateBase.add(warpGoldFrame);
  const warpLightCurtain = new THREE.Mesh(
    new THREE.CylinderGeometry(cpCfg.radius * 0.66, cpCfg.radius * 0.66, 1.45, 4, 1, true),
    warpCurtainMat
  );
  warpLightCurtain.rotation.y = Math.PI / 4;
  warpLightCurtain.position.y = 0.84;
  combinePlateBase.add(warpLightCurtain);

  // 8. Dual Conduits feeding into Final Combine Barrier at (fbCfg.x, 0, fbCfg.z)
  const fbCfg = puzzleCfg.finalBarrier;

  const r2bDx = fbCfg.x - hrCfg.targetX;
  const r2bDz = fbCfg.z - hrCfg.targetZ;
  const r2bLen = Math.hypot(r2bDx, r2bDz);
  const r2bAngle = Math.atan2(r2bDx, r2bDz);
  const r2bMidX = (hrCfg.targetX + fbCfg.x) * 0.5;
  const r2bMidZ = (hrCfg.targetZ + fbCfg.z) * 0.5;

  const r2bHousing = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.028, r2bLen),
    housingMat
  );
  r2bHousing.position.set(r2bMidX, 0.014, r2bMidZ);
  r2bHousing.rotation.y = r2bAngle;
  puzzleFixturesGroup.add(r2bHousing);

  const receiverToCombineConduitMaterial = new THREE.MeshBasicMaterial({
    color: 0xd97706,
    transparent: true,
    opacity: 0.45,
  });
  const r2bCore = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.034, r2bLen),
    receiverToCombineConduitMaterial
  );
  r2bCore.position.set(r2bMidX, 0.019, r2bMidZ);
  r2bCore.rotation.y = r2bAngle;
  puzzleFixturesGroup.add(r2bCore);

  const p2bDx = fbCfg.x - cpCfg.x;
  const p2bDz = fbCfg.z - cpCfg.z;
  const p2bLen = Math.hypot(p2bDx, p2bDz);
  const p2bAngle = Math.atan2(p2bDx, p2bDz);
  const p2bMidX = (cpCfg.x + fbCfg.x) * 0.5;
  const p2bMidZ = (cpCfg.z + fbCfg.z) * 0.5;

  const p2bHousing = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.03, p2bLen),
    housingMat
  );
  p2bHousing.position.set(p2bMidX, 0.015, p2bMidZ);
  p2bHousing.rotation.y = p2bAngle;
  puzzleFixturesGroup.add(p2bHousing);

  const combinePlateConduitMaterial = new THREE.MeshBasicMaterial({
    color: 0x0891b2,
    transparent: true,
    opacity: 0.45,
  });
  const p2bCore = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.036, p2bLen),
    combinePlateConduitMaterial
  );
  p2bCore.position.set(p2bMidX, 0.02, p2bMidZ);
  p2bCore.rotation.y = p2bAngle;
  puzzleFixturesGroup.add(p2bCore);

  // 9. FINAL GATE — Armored Rectangular Titanium Monolith Slab, Twin Hydraulic Clamp Posts, Dual Cyan+Amber Sync Bars & Floating Completion Crystal (Sheet 9, Panel 2)
  const finalBarrierRoot = new THREE.Group();
  finalBarrierRoot.position.set(fbCfg.x, 0, fbCfg.z);
  puzzleFixturesGroup.add(finalBarrierRoot);

  const fbSocketRim = new THREE.Mesh(
    new RoundedBoxGeometry(1.45, 0.16, fbCfg.radius * 2.35, 2, 0.04),
    housingMat
  );
  fbSocketRim.position.y = 0.08;
  finalBarrierRoot.add(fbSocketRim);

  // Twin vertical hydraulic side clamp posts with bronze footings
  for (const sideZ of [-fbCfg.radius * 1.02, fbCfg.radius * 1.02]) {
    const fbJamb = new THREE.Mesh(
      new RoundedBoxGeometry(0.32, fbCfg.height * 0.92, 0.28, 2, 0.04),
      alloyMat
    );
    fbJamb.position.set(0, fbCfg.height * 0.46, sideZ);
    finalBarrierRoot.add(fbJamb);

    const fbJambBase = new THREE.Mesh(
      new RoundedBoxGeometry(0.38, 0.22, 0.36, 2, 0.03),
      bronzeAccentMat
    );
    fbJambBase.position.set(0, 0.16, sideZ);
    finalBarrierRoot.add(fbJambBase);

    for (const clampY of [fbCfg.height * 0.36, fbCfg.height * 0.68]) {
      const clampRing = new THREE.Mesh(
        new RoundedBoxGeometry(0.4, 0.14, 0.36, 1, 0.02),
        housingMat
      );
      clampRing.position.set(0, clampY, sideZ);
      finalBarrierRoot.add(clampRing);
    }
  }

  const finalBarrierColumnGroup = new THREE.Group();
  finalBarrierRoot.add(finalBarrierColumnGroup);

  // Tall chamfered rectangular armored titanium monolith gate slab
  const fbSlab = new THREE.Mesh(
    new RoundedBoxGeometry(0.92, fbCfg.height, fbCfg.radius * 1.82, 3, 0.1),
    housingMat
  );
  fbSlab.position.y = fbCfg.height * 0.5;
  fbSlab.castShadow = enableShadows;
  fbSlab.receiveShadow = enableShadows;
  finalBarrierColumnGroup.add(fbSlab);

  // Center brushed-alloy vertical armored spine plate on both faces
  const fbSpine = new THREE.Mesh(
    new RoundedBoxGeometry(0.98, fbCfg.height * 0.92, fbCfg.radius * 0.84, 2, 0.04),
    alloyMat
  );
  fbSpine.position.y = fbCfg.height * 0.5;
  finalBarrierColumnGroup.add(fbSpine);

  const fbCap = new THREE.Mesh(
    new RoundedBoxGeometry(0.84, 0.2, fbCfg.radius * 1.65, 2, 0.04),
    alloyMat
  );
  fbCap.position.y = fbCfg.height + 0.02;
  finalBarrierColumnGroup.add(fbCap);

  // Upper Electric-Cyan Sync Energy Bar (Receiver Signal)
  const finalBarrierReceiverBandMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.55,
    roughness: 0.18,
    metalness: 0.35,
  });
  const fbUpperBand = new THREE.Mesh(
    new RoundedBoxGeometry(1.04, 0.15, fbCfg.radius * 1.72, 2, 0.03),
    finalBarrierReceiverBandMat
  );
  fbUpperBand.position.y = fbCfg.height * 0.66;
  finalBarrierColumnGroup.add(fbUpperBand);

  // Lower Warm-Amber Sync Energy Bar (Chrono Plate Signal)
  const finalBarrierPlateBandMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 1.5,
    roughness: 0.18,
    metalness: 0.35,
  });
  const fbLowerBand = new THREE.Mesh(
    new RoundedBoxGeometry(1.04, 0.15, fbCfg.radius * 1.72, 2, 0.03),
    finalBarrierPlateBandMat
  );
  fbLowerBand.position.y = fbCfg.height * 0.44;
  finalBarrierColumnGroup.add(fbLowerBand);

  // Levitating Faceted Ice-Cyan Completion Crystal hovering above the Final Gate crown
  const finalBarrierBeaconMaterial = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0ea5e9,
    emissiveIntensity: 1.55,
    roughness: 0.12,
    metalness: 0.25,
  });
  const finalBarrierBeaconMesh = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.42, 0),
    finalBarrierBeaconMaterial
  );
  finalBarrierBeaconMesh.scale.set(0.75, 1.45, 0.75);
  finalBarrierBeaconMesh.position.y = fbCfg.height + 0.72;
  finalBarrierRoot.add(finalBarrierBeaconMesh);

  // 10. Calibration Completion Node West of Final Barrier at (fbCfg.completionX, 0, fbCfg.completionZ)
  const completionRoot = new THREE.Group();
  completionRoot.position.set(fbCfg.completionX, 0, fbCfg.completionZ);
  puzzleFixturesGroup.add(completionRoot);

  const compPlinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.96, 1.1, 0.12, 24),
    housingMat
  );
  compPlinth.position.y = 0.06;
  completionRoot.add(compPlinth);

  const completionBeaconMaterial = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0891b2,
    emissiveIntensity: 1.25,
    roughness: 0.18,
    metalness: 0.5,
  });
  const completionBeaconMesh = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.34, 0),
    completionBeaconMaterial
  );
  completionBeaconMesh.position.y = 0.85;
  completionRoot.add(completionBeaconMesh);

  // 11. RELAY BEACON — Sleek Circular Brushed-Silver Pad, 3 Angled Cyan Phase-Emitter Fins & Shimmering Warp Vortex Column (Sheet 9, Panel 3)
  const relayTargetGroup = new THREE.Group();
  relayTargetGroup.visible = false;
  root.add(relayTargetGroup);

  const relayPadSilverMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.24,
    metalness: 0.86,
  });
  const relayPadRim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.72, 0.11, 24),
    relayPadSilverMat
  );
  relayPadRim.position.y = 0.055;
  relayTargetGroup.add(relayPadRim);

  const relayPadInner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.48, 0.12, 24),
    housingMat
  );
  relayPadInner.position.y = 0.06;
  relayTargetGroup.add(relayPadInner);

  const relayTargetRingMaterial = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const relayTargetRingMesh = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.54, 32),
    relayTargetRingMaterial
  );
  relayTargetRingMesh.rotation.x = -Math.PI / 2;
  relayTargetRingMesh.position.y = 0.125;
  relayTargetGroup.add(relayTargetRingMesh);

  // 3 Angled Brushed-Silver & Glowing Cyan Phase-Emitter Tripod Fins
  for (let fin = 0; fin < 3; fin++) {
    const fa = (fin / 3) * Math.PI * 2;
    const finGroup = new THREE.Group();
    finGroup.rotation.y = fa;
    const finBody = new THREE.Mesh(
      new RoundedBoxGeometry(0.18, 0.14, 0.44, 2, 0.03),
      relayPadSilverMat
    );
    finBody.position.set(0, 0.08, 0.72);
    finBody.rotation.x = 0.34;
    finGroup.add(finBody);
    const finCyanStrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.04, 0.38),
      relayTargetRingMaterial
    );
    finCyanStrip.position.set(0, 0.15, 0.74);
    finCyanStrip.rotation.x = 0.34;
    finGroup.add(finCyanStrip);
    relayTargetGroup.add(finGroup);
  }

  const relayTargetInnerMaterial = new THREE.MeshBasicMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const relayTargetDisc = new THREE.Mesh(
    new THREE.CircleGeometry(0.4, 24),
    relayTargetInnerMaterial
  );
  relayTargetDisc.rotation.x = -Math.PI / 2;
  relayTargetDisc.position.y = 0.128;
  relayTargetGroup.add(relayTargetDisc);

  const relayTargetColumnMaterial = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const relayTargetColumnMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.44, 1.95, 24, 1, true),
    relayTargetColumnMaterial
  );
  relayTargetColumnMesh.position.y = 1.08;
  relayTargetGroup.add(relayTargetColumnMesh);

  // Inner shimmering vertical core vortex beam
  const relayInnerVortex = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.28, 1.9, 18, 1, true),
    relayTargetColumnMaterial
  );
  relayInnerVortex.position.y = 1.05;
  relayTargetGroup.add(relayInnerVortex);

  return {
    root,
    puzzleFixturesGroup,
    padGroup,
    padCoreMaterial,
    padRingMaterial,
    syncRingMesh,
    syncRingMaterial,
    clawPivots,
    conduitCoreMaterial,
    barrierColumnGroup,
    barrierStripMaterial,
    receiverBeaconMesh,
    receiverBeaconMaterial,
    recordingRingGroup,
    recordingRingMaterial,
    originMarkerGroup,
    originMarkerRing,
    heavyStrikePadRingMaterial,
    heavyStrikeChevronMaterial,
    heavyReceptorCoreMaterial,
    heavyReceptorGyroLeft,
    heavyReceptorGyroRight,
    combinePadGroup,
    combinePadCoreMaterial,
    combinePadRingMaterial,
    combineSyncRingMesh,
    combineSyncRingMaterial,
    combineClawPivots,
    receiverToCombineConduitMaterial,
    combinePlateConduitMaterial,
    finalBarrierColumnGroup,
    finalBarrierReceiverBandMat,
    finalBarrierPlateBandMat,
    finalBarrierBeaconMesh,
    finalBarrierBeaconMaterial,
    completionBeaconMesh,
    completionBeaconMaterial,
    relayTargetGroup,
    relayTargetRingMesh,
    relayTargetRingMaterial,
    relayTargetInnerMaterial,
    relayTargetColumnMesh,
    relayTargetColumnMaterial,
  };
}

// ============================================================================
// SHEET 11 · CHRONO OVERDRIVE & SOVEREIGN GAUNTLET 3D RIG BUILDERS
// ============================================================================

export interface ChronoStasisCoreRig {
  root: THREE.Group;
  geodesicShell: THREE.Mesh;
  innerCore: THREE.Mesh;
  outerBrassRing: THREE.Group;
  midDarkRing: THREE.Group;
  innerGoldRing: THREE.Group;
}

/**
 * CHRONO STASIS CORE (Sheet 11, Panel 1)
 * Floating golden-cyan geodesic energy sphere nested inside 3 counter-rotating brass & dark titanium astrolabe rings with glowing cyan chrono-chevrons.
 */
export function createChronoStasisCoreRig(): ChronoStasisCoreRig {
  const root = new THREE.Group();
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd9a13b,
    emissive: 0x78350f,
    emissiveIntensity: 0.35,
    roughness: 0.26,
    metalness: 0.86,
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x2a3342,
    roughness: 0.35,
    metalness: 0.82,
  });
  const cyanGlowMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.92,
  });
  const geodesicWireMat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    wireframe: true,
    transparent: true,
    opacity: 0.88,
  });

  const innerCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 2), cyanGlowMat);
  root.add(innerCore);
  const geodesicShell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.47, 1), geodesicWireMat);
  root.add(geodesicShell);

  const outerBrassRing = new THREE.Group();
  const outerTorus = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.048, 8, 36), brassMat);
  outerTorus.rotation.x = Math.PI * 0.5;
  outerBrassRing.add(outerTorus);
  const chevGeo = new THREE.BoxGeometry(0.08, 0.032, 0.032);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const chev = new THREE.Mesh(chevGeo, cyanGlowMat);
    chev.position.set(Math.cos(a) * 0.81, 0, Math.sin(a) * 0.81);
    chev.rotation.y = -a;
    outerBrassRing.add(chev);
  }
  root.add(outerBrassRing);

  const midDarkRing = new THREE.Group();
  const midTorus = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.042, 8, 32), darkMetalMat);
  midTorus.rotation.set(0.72, 0.25, 0.4);
  midDarkRing.add(midTorus);
  root.add(midDarkRing);

  const innerGoldRing = new THREE.Group();
  const innerTorus = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.036, 8, 28), brassMat);
  innerTorus.rotation.set(-0.68, -0.3, 0.55);
  innerGoldRing.add(innerTorus);
  root.add(innerGoldRing);

  return { root, geodesicShell, innerCore, outerBrassRing, midDarkRing, innerGoldRing };
}

export interface SovereignObeliskRig {
  root: THREE.Group;
  crownGroup: THREE.Group;
  runeMaterials: THREE.MeshStandardMaterial[];
}

/**
 * SOVEREIGN OBELISK (Sheet 11, Panel 2)
 * Ceremonial dark-steel boss-rush trophy pillar inlaid with 5 glowing golden Roman numeral tiers (I-V) and a floating holographic cyan crown prism.
 */
export function createSovereignObeliskRig(): SovereignObeliskRig {
  const root = new THREE.Group();
  const obsidianMat = new THREE.MeshStandardMaterial({
    color: 0x1e2634,
    roughness: 0.34,
    metalness: 0.82,
  });
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0x92400e,
    emissiveIntensity: 0.45,
    roughness: 0.24,
    metalness: 0.88,
  });
  const cyanHoloMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
  });

  // Stepped dark-steel & gold pedestal base
  const base1 = new THREE.Mesh(new RoundedBoxGeometry(1.32, 0.24, 1.32, 2, 0.04), obsidianMat);
  base1.position.y = 0.12;
  root.add(base1);
  const baseGold = new THREE.Mesh(new RoundedBoxGeometry(1.14, 0.12, 1.14, 1, 0.02), goldTrimMat);
  baseGold.position.y = 0.3;
  root.add(baseGold);

  // Tall tapered square monolith shaft
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.62, 3.65, 4), obsidianMat);
  shaft.rotation.y = Math.PI * 0.25;
  shaft.position.y = 2.18;
  root.add(shaft);

  // Cyan top apex emitter plate
  const apexPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.14, 4), cyanHoloMat);
  apexPlate.rotation.y = Math.PI * 0.25;
  apexPlate.position.y = 4.06;
  root.add(apexPlate);

  // 5 Glowing Golden Roman Numeral Rune Bars (I to V from top to bottom)
  const runeMaterials: THREE.MeshStandardMaterial[] = [];
  for (let tier = 0; tier < 5; tier++) {
    const rMat = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.6,
    });
    runeMaterials.push(rMat);
    const ty = 3.45 - tier * 0.56;
    for (const faceAngle of [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5]) {
      const runeBar = new THREE.Mesh(new THREE.BoxGeometry(0.36 - tier * 0.01, 0.11, 0.05), rMat);
      runeBar.position.set(Math.sin(faceAngle) * 0.38, ty, Math.cos(faceAngle) * 0.38);
      runeBar.rotation.y = faceAngle;
      root.add(runeBar);
    }
  }

  // Floating Holographic Cyan Crown Prism above the apex
  const crownGroup = new THREE.Group();
  crownGroup.position.y = 4.72;
  const crownBase = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.032, 6, 4), cyanHoloMat);
  crownBase.rotation.x = Math.PI * 0.5;
  crownGroup.add(crownBase);
  for (let p = 0; p < 4; p++) {
    const pa = (p / 4) * Math.PI * 2 + Math.PI * 0.25;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.44, 4), cyanHoloMat);
    spike.position.set(Math.cos(pa) * 0.24, 0.22, Math.sin(pa) * 0.24);
    crownGroup.add(spike);
  }
  root.add(crownGroup);

  return { root, crownGroup, runeMaterials };
}

export interface FieldRefitDroneRig {
  root: THREE.Group;
  leftWelderArm: THREE.Group;
  rightWelderArm: THREE.Group;
  thrusterPlumes: THREE.Mesh[];
  naniteCanisterMat: THREE.MeshStandardMaterial;
}

/**
 * FIELD REFIT DRONE (Sheet 11, Panel 3)
 * Compact hovering white-and-gold orbital repair drone with dual cyan laser welder arms, medical nanite canister, and twin blue ion thrusters.
 */
export function createFieldRefitDroneRig(): FieldRefitDroneRig {
  const root = new THREE.Group();
  const ceramicWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.28,
    metalness: 0.22,
  });
  const goldTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0x92400e,
    emissiveIntensity: 0.35,
    roughness: 0.24,
    metalness: 0.82,
  });
  const darkFrameMat = new THREE.MeshStandardMaterial({
    color: 0x263142,
    roughness: 0.42,
    metalness: 0.78,
  });
  const cyanGlowMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.9,
    roughness: 0.12,
    metalness: 0.2,
  });
  const plumeMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.78,
  });

  // Main ceramic-white & gold armored chassis
  const hull = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.34, 0.64, 2, 0.06), ceramicWhiteMat);
  root.add(hull);
  const dorsalGold = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.12, 0.48, 2, 0.03), goldTrimMat);
  dorsalGold.position.set(0, 0.18, 0.04);
  root.add(dorsalGold);
  const frontVisor = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.22, 0.06, 1, 0.02), cyanGlowMat);
  frontVisor.position.set(0, -0.02, 0.32);
  root.add(frontVisor);

  // Twin rear angled ion thruster pods + glowing blue exhaust cones
  const thrusterPlumes: THREE.Mesh[] = [];
  for (const sx of [-0.36, 0.36]) {
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.42, 12), ceramicWhiteMat);
    pod.rotation.x = Math.PI * 0.5;
    pod.position.set(sx, 0.08, -0.22);
    root.add(pod);
    const podRing = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.022, 6, 14), goldTrimMat);
    podRing.position.set(sx, 0.08, -0.4);
    root.add(podRing);
    const plume = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.48, 10), plumeMat);
    plume.rotation.x = -Math.PI * 0.5;
    plume.position.set(sx, 0.08, -0.66);
    root.add(plume);
    thrusterPlumes.push(plume);
  }

  // Hanging side medical nanite canister
  const naniteCanisterMat = cyanGlowMat.clone();
  const canister = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.32, 12), naniteCanisterMat);
  canister.position.set(0.36, -0.2, 0.04);
  root.add(canister);
  const canisterCap = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 12), darkFrameMat);
  canisterCap.position.set(0.36, -0.02, 0.04);
  root.add(canisterCap);

  // Dual articulated cyan laser-welder arms
  const buildWelderArm = (sx: number): THREE.Group => {
    const armPivot = new THREE.Group();
    armPivot.position.set(sx * 0.26, -0.18, 0.16);
    const strut = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.08, 0.34, 1, 0.02), darkFrameMat);
    strut.position.set(0, -0.04, 0.16);
    armPivot.add(strut);
    const emitter = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.055, 0.24, 8), cyanGlowMat);
    emitter.rotation.x = Math.PI * 0.5;
    emitter.position.set(0, -0.06, 0.42);
    armPivot.add(emitter);
    root.add(armPivot);
    return armPivot;
  };
  const leftWelderArm = buildWelderArm(-1);
  const rightWelderArm = buildWelderArm(1);

  return { root, leftWelderArm, rightWelderArm, thrusterPlumes, naniteCanisterMat };
}

export interface SingularityGrenadeRig {
  root: THREE.Group;
  accretionHalo: THREE.Mesh;
  armingRing: THREE.Mesh;
}

/**
 * SINGULARITY GRENADE (Sheet 11, Panel 6)
 * Spherical gunmetal tactical gravity device with top amber-gold arming ring, side cyan-trimmed vents, and swirling violet-cyan micro black-hole core.
 */
export function createSingularityGrenadeRig(): SingularityGrenadeRig {
  const root = new THREE.Group();
  const gunmetalMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.28,
    metalness: 0.88,
  });
  const darkHousingMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.35,
    metalness: 0.8,
  });
  const amberGoldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xb45309,
    emissiveIntensity: 0.65,
    roughness: 0.24,
    metalness: 0.85,
  });
  const cyanVentMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
  });
  const violetHaloMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  });
  const blackHoleMat = new THREE.MeshBasicMaterial({
    color: 0x05050a,
  });

  // Spherical armored gunmetal body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 16), gunmetalMat);
  root.add(body);

  // Top beveled amber-gold arming collar
  const armingRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.042, 8, 20), amberGoldMat);
  armingRing.rotation.x = Math.PI * 0.5;
  armingRing.position.y = 0.29;
  root.add(armingRing);

  // Recessed violet-cyan micro black-hole aperture on front & back
  for (const sz of [-1, 1]) {
    const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.036, 8, 22), darkHousingMat);
    bezel.position.z = sz * 0.29;
    root.add(bezel);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), blackHoleMat);
    core.position.z = sz * 0.3;
    root.add(core);
  }
  const accretionHalo = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.034, 8, 24), violetHaloMat);
  accretionHalo.position.z = 0.31;
  root.add(accretionHalo);

  // Side amber-gold trimmed cyan vent rings
  for (const sx of [-1, 1]) {
    const sideGold = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.028, 8, 16), amberGoldMat);
    sideGold.rotation.y = Math.PI * 0.5;
    sideGold.position.x = sx * 0.31;
    root.add(sideGold);
    const sideCyan = new THREE.Mesh(new THREE.CircleGeometry(0.085, 14), cyanVentMat);
    sideCyan.rotation.y = sx * Math.PI * 0.5;
    sideCyan.position.x = sx * 0.32;
    root.add(sideCyan);
  }

  return { root, accretionHalo, armingRing };
}

export interface SectorTransitAirlockRig {
  root: THREE.Group;
  lockBarsGroup: THREE.Group;
  portalDisc: THREE.Mesh;
  portalMat: THREE.MeshBasicMaterial;
  portalRing: THREE.Mesh;
  portalRingMat: THREE.MeshBasicMaterial;
  statusStripMat: THREE.MeshStandardMaterial;
  thresholdMat: THREE.MeshBasicMaterial;
}

/**
 * NORTH SECTOR TRANSIT AIRLOCK — Monumental exit stargate archway at the northern perimeter.
 * Displays crimson containment bars while sealed and opens into a blazing emerald-cyan transit vortex once the sector is cleared.
 */
export function createSectorTransitAirlockRig(): SectorTransitAirlockRig {
  const root = new THREE.Group();
  const titaniumMat = new THREE.MeshStandardMaterial({
    color: 0x2a3342,
    roughness: 0.34,
    metalness: 0.82,
  });
  const darkArmorMat = new THREE.MeshStandardMaterial({
    color: 0x131924,
    roughness: 0.42,
    metalness: 0.78,
  });
  const brassTrimMat = new THREE.MeshStandardMaterial({
    color: 0xd4a44a,
    roughness: 0.28,
    metalness: 0.86,
  });
  const statusStripMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xe11d48,
    emissiveIntensity: 1.5,
    roughness: 0.18,
    metalness: 0.3,
  });

  // Twin armored vertical stanchion pylons
  for (const sx of [-2.35, 2.35]) {
    const base = new THREE.Mesh(new RoundedBoxGeometry(1.15, 0.45, 1.35, 2, 0.06), darkArmorMat);
    base.position.set(sx, 0.225, 0);
    root.add(base);

    const pillar = new THREE.Mesh(new RoundedBoxGeometry(0.84, 4.35, 1.05, 2, 0.08), titaniumMat);
    pillar.position.set(sx, 2.35, 0);
    root.add(pillar);

    const collar = new THREE.Mesh(new RoundedBoxGeometry(0.96, 0.22, 1.15, 2, 0.04), brassTrimMat);
    collar.position.set(sx, 3.85, 0);
    root.add(collar);

    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.2, 0.08), statusStripMat);
    strip.position.set(sx - Math.sign(sx) * 0.34, 2.2, 0.52);
    root.add(strip);
  }

  // Sweeping overhead armored transom arch & crown
  const lintel = new THREE.Mesh(new RoundedBoxGeometry(6.1, 0.72, 1.22, 2, 0.08), titaniumMat);
  lintel.position.set(0, 4.62, 0);
  root.add(lintel);

  const crownBar = new THREE.Mesh(new RoundedBoxGeometry(4.4, 0.2, 0.9, 2, 0.04), brassTrimMat);
  crownBar.position.set(0, 5.06, 0);
  root.add(crownBar);

  const headerLight = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.14, 0.1), statusStripMat);
  headerLight.position.set(0, 4.55, 0.62);
  root.add(headerLight);

  // Crimson security lock bars (visible while locked)
  const lockBarsGroup = new THREE.Group();
  const lockBarMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: 0.78,
  });
  for (const by of [1.05, 1.85, 2.65, 3.45]) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 3.9, 8), lockBarMat);
    bar.rotation.z = Math.PI * 0.5;
    bar.position.set(0, by, 0.12);
    lockBarsGroup.add(bar);
  }
  root.add(lockBarsGroup);

  // Swirling portal vortex membrane & outer energy ring (blazes emerald-cyan when unlocked)
  const portalMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const portalDisc = new THREE.Mesh(new THREE.PlaneGeometry(3.85, 4.1), portalMat);
  portalDisc.position.set(0, 2.2, 0.04);
  root.add(portalDisc);

  const portalRingMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const portalRing = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.09, 8, 28), portalRingMat);
  portalRing.position.set(0, 2.25, 0.14);
  root.add(portalRing);

  // Floor threshold runway pad extending toward the arena
  const thresholdMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const thresholdPad = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 2.6), thresholdMat);
  thresholdPad.rotation.x = -Math.PI * 0.5;
  thresholdPad.position.set(0, 0.045, 1.35);
  root.add(thresholdPad);

  return {
    root,
    lockBarsGroup,
    portalDisc,
    portalMat,
    portalRing,
    portalRingMat,
    statusStripMat,
    thresholdMat,
  };
}

export interface EntryBoardingAirlockRig {
  root: THREE.Group;
  beaconMat: THREE.MeshStandardMaterial;
}

/**
 * SOUTH ENTRY BOARDING AIRLOCK — Open-top pressurized boarding threshold behind Sera's spawn.
 * Uses wide flanking titanium bollards & illuminated floor deck so the 3rd-person camera sightline is 100% unobstructed.
 */
export function createEntryBoardingAirlockRig(): EntryBoardingAirlockRig {
  const root = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x263140,
    roughness: 0.36,
    metalness: 0.78,
  });
  const brassTrimMat = new THREE.MeshStandardMaterial({
    color: 0xd4a44a,
    roughness: 0.28,
    metalness: 0.85,
  });
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 1.45,
    roughness: 0.2,
    metalness: 0.25,
  });

  // Wide flanking low-profile boarding stanchions (open center sightline for camera)
  for (const sx of [-2.85, 2.85]) {
    const stanchion = new THREE.Mesh(new RoundedBoxGeometry(0.68, 2.05, 0.85, 2, 0.06), steelMat);
    stanchion.position.set(sx, 1.025, 0);
    root.add(stanchion);

    const cap = new THREE.Mesh(new RoundedBoxGeometry(0.76, 0.16, 0.92, 2, 0.04), brassTrimMat);
    cap.position.set(sx, 2.1, 0);
    root.add(cap);

    const beacon = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.45, 0.08), beaconMat);
    beacon.position.set(sx - Math.sign(sx) * 0.32, 1.05, -0.44);
    root.add(beacon);
  }

  // Illuminated floor threshold sill & runway strip pointing North into the sector
  const sill = new THREE.Mesh(new RoundedBoxGeometry(5.6, 0.08, 0.72, 1, 0.02), steelMat);
  sill.position.set(0, 0.04, 0);
  root.add(sill);

  const runwayMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const runway = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 5.2), runwayMat);
  runway.rotation.x = -Math.PI * 0.5;
  runway.position.set(0, 0.045, -2.9);
  root.add(runway);

  return { root, beaconMat };
}

export interface BreachSealRig {
  root: THREE.Group;
  outerRing: THREE.Mesh;
  innerRing: THREE.Mesh;
  crystalPrism: THREE.Mesh;
  zoneMat: THREE.MeshBasicMaterial;
  prismMat: THREE.MeshStandardMaterial;
}

/**
 * CENTRAL BREACH SEAL — Rotating golden-cyan rune ring & hovering holographic diamond at (0, 0).
 * Stepping inside and pressing [I] shatters stasis standby and initiates the Sector Warden encounter.
 */
export function createBreachSealRig(): BreachSealRig {
  const root = new THREE.Group();

  const zoneMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const zoneDisc = new THREE.Mesh(new THREE.CircleGeometry(3.05, 36), zoneMat);
  zoneDisc.rotation.x = -Math.PI * 0.5;
  zoneDisc.position.y = 0.035;
  root.add(zoneDisc);

  const outerRingMat = new THREE.MeshBasicMaterial({
    color: 0xfbbf24,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const outerRing = new THREE.Mesh(new THREE.RingGeometry(2.85, 3.08, 36), outerRingMat);
  outerRing.rotation.x = -Math.PI * 0.5;
  outerRing.position.y = 0.05;
  root.add(outerRing);

  const innerRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.78,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const innerRing = new THREE.Mesh(new THREE.RingGeometry(1.65, 1.82, 24), innerRingMat);
  innerRing.rotation.x = -Math.PI * 0.5;
  innerRing.position.y = 0.055;
  root.add(innerRing);

  const prismMat = new THREE.MeshStandardMaterial({
    color: 0xfde68a,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.45,
    roughness: 0.14,
    metalness: 0.6,
    transparent: true,
    opacity: 0.88,
  });
  const crystalPrism = new THREE.Mesh(new THREE.OctahedronGeometry(0.46, 0), prismMat);
  crystalPrism.position.y = 1.65;
  root.add(crystalPrism);

  return { root, outerRing, innerRing, crystalPrism, zoneMat, prismMat };
}

export interface ExpeditionTrailRig {
  root: THREE.Group;
  chevrons: THREE.Mesh[];
  materials: THREE.MeshBasicMaterial[];
}

/**
 * 3D HOLOGRAPHIC FLOOR CHEVRON GUIDE TRAIL — 8 animated directional floor arrows leading Sera toward caches, lore archives, Breach Seal, or the unlocked North Transit Airlock.
 */
export function createExpeditionTrailRig(count = 8): ExpeditionTrailRig {
  const root = new THREE.Group();
  const chevrons: THREE.Mesh[] = [];
  const materials: THREE.MeshBasicMaterial[] = [];

  // Build crisp forward-pointing chevron geometry lying flat on XZ plane (+Z forward)
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.42);
  shape.lineTo(0.44, -0.18);
  shape.lineTo(0.24, -0.32);
  shape.lineTo(0, 0.04);
  shape.lineTo(-0.24, -0.32);
  shape.lineTo(-0.44, -0.18);
  shape.closePath();

  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI * 0.5);

  for (let i = 0; i < count; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.075;
    mesh.visible = false;
    root.add(mesh);
    chevrons.push(mesh);
    materials.push(mat);
  }

  return { root, chevrons, materials };
}

export interface SafeRoomHubRig {
  root: THREE.Group;
  medRing: THREE.Mesh;
  medCore: THREE.Group;
  medGlowMat: THREE.MeshStandardMaterial;
  workbenchHolo: THREE.Group;
  welderArms: THREE.Group[];
  lysaHoloGroup: THREE.Group;
  lysaOuterRing: THREE.Mesh;
  lysaInnerRing: THREE.Mesh;
  lysaRing: THREE.Mesh;
  lysaMat: THREE.MeshStandardMaterial;
  holoMapGroup: THREE.Group;
  holoMapNodeMats: THREE.MeshStandardMaterial[];
  crestOuterRing: THREE.Mesh;
  crestInnerRing: THREE.Mesh;
  crestCrown: THREE.Group;
  crestCrownMat: THREE.MeshStandardMaterial;
  paradoxRiftGroup: THREE.Group;
  paradoxRiftOuterRing: THREE.Mesh;
  paradoxRiftInnerRing: THREE.Mesh;
  paradoxRiftCoreMat: THREE.MeshBasicMaterial;
  paradoxRiftRingMat: THREE.MeshStandardMaterial;
  paradoxVortexMesh?: THREE.Mesh;
  paradoxCrystalShards?: THREE.Mesh[];
  fabricatorKioskGroup?: THREE.Group;
  fabricatorHoloMesh?: THREE.Mesh;
  fabricatorHoloMat?: THREE.MeshBasicMaterial;
  dailyObeliskGroup?: THREE.Group;
  dailyObeliskChronoGroup?: THREE.Group;
  dailyObeliskBeamMat?: THREE.MeshBasicMaterial;
}

/**
 * PRESSURIZED TRANSIT SAFE-ROOM HUB — Sheet 12 Concept Blueprints (Panels 1, 2, 3, 7, 8):
 * - West (-5.2, 2.2): MED-SUPPLY CRYO BAY (Sheet 12, Panel 1)
 * - Center (0, 1.4): FIELD REFIT WORKBENCH (Sheet 12, Panel 2)
 * - East (5.2, 2.2): LYSA VENN HOLO-CONSOLE (Sheet 12, Panel 3)
 * - North-West (-4.2, -3.6): STATION HOLO-MAP TABLE (Sheet 12, Panel 7)
 * - North-East (4.2, -3.6): SOVEREIGN NG+ CREST (Sheet 12, Panel 8)
 */
export function createSafeRoomHubRig(): SafeRoomHubRig {
  const root = new THREE.Group();

  const gunmetalMat = new THREE.MeshStandardMaterial({
    color: 0x25303f,
    roughness: 0.42,
    metalness: 0.74,
  });
  const darkSlateMat = new THREE.MeshStandardMaterial({
    color: 0x161e29,
    roughness: 0.52,
    metalness: 0.65,
  });
  const ceramicMat = new THREE.MeshStandardMaterial({
    color: 0xdce4ee,
    roughness: 0.24,
    metalness: 0.16,
  });
  const bronzeMat = new THREE.MeshStandardMaterial({
    color: 0xc99344,
    roughness: 0.26,
    metalness: 0.88,
  });
  const cyanScreenMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.5,
    roughness: 0.18,
    metalness: 0.25,
  });
  const amberCellMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.75,
    roughness: 0.16,
    metalness: 0.3,
  });

  // =========================================================================
  // 0. SANCTUARY HOROLOGICAL FLOOR COMPASS MEDALLION (0, 0.024, -2.4)
  // =========================================================================
  const compassFloorGroup = new THREE.Group();
  compassFloorGroup.position.set(0, 0.024, -2.4);
  root.add(compassFloorGroup);

  const compassBrassRingMat = new THREE.MeshBasicMaterial({
    color: 0xd4a054,
    transparent: true,
    opacity: 0.48,
    side: THREE.DoubleSide,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const compassCyanRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.34,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });

  const outerSanctuaryRing = new THREE.Mesh(
    new THREE.RingGeometry(6.35, 6.52, 64),
    compassBrassRingMat
  );
  outerSanctuaryRing.rotation.x = -Math.PI * 0.5;
  compassFloorGroup.add(outerSanctuaryRing);

  const midSanctuaryRing = new THREE.Mesh(
    new THREE.RingGeometry(4.15, 4.24, 48),
    compassCyanRingMat
  );
  midSanctuaryRing.rotation.x = -Math.PI * 0.5;
  compassFloorGroup.add(midSanctuaryRing);

  for (let t = 0; t < 12; t++) {
    const a = (t / 12) * Math.PI * 2;
    const isCardinal = t % 3 === 0;
    const tick = new THREE.Mesh(
      new THREE.PlaneGeometry(isCardinal ? 0.14 : 0.06, isCardinal ? 0.95 : 0.45),
      isCardinal ? compassBrassRingMat : compassCyanRingMat
    );
    tick.rotation.x = -Math.PI * 0.5;
    tick.rotation.z = -a;
    tick.position.set(Math.sin(a) * 5.85, 0.004, Math.cos(a) * 5.85);
    compassFloorGroup.add(tick);
  }

  // =========================================================================
  // 1. MED-SUPPLY CRYO BAY (-5.8, 0, 1.6) — West Sanctuary Alcove
  // =========================================================================
  const medGroup = new THREE.Group();
  medGroup.position.set(-5.8, 0, 1.6);
  medGroup.rotation.y = 0.45;
  root.add(medGroup);

  // Lower dark plinth + brushed ceramic stepped circular base
  const medPlinth = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.24, 0.18, 16), darkSlateMat);
  medPlinth.position.y = 0.09;
  medGroup.add(medPlinth);

  const medCeramicRing = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 1.06, 0.26, 16), ceramicMat);
  medCeramicRing.position.y = 0.31;
  medGroup.add(medCeramicRing);

  const medInnerCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.74, 0.16, 16), gunmetalMat);
  medInnerCollar.position.y = 0.48;
  medGroup.add(medInnerCollar);

  // Emerald-cyan cryo fluid core + translucent glass cylinder + internal micro-bubbles
  const medGlowMat = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x10b981,
    emissiveIntensity: 1.75,
    roughness: 0.14,
    metalness: 0.15,
    transparent: true,
    opacity: 0.86,
  });
  const medFluidCore = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 1.32, 16), medGlowMat);
  medFluidCore.position.y = 1.22;
  medGroup.add(medFluidCore);

  const medGlassMat = new THREE.MeshStandardMaterial({
    color: 0xa7f3d0,
    emissive: 0x059669,
    emissiveIntensity: 0.45,
    roughness: 0.08,
    metalness: 0.1,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  });
  const medGlassShell = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 1.36, 18), medGlassMat);
  medGlassShell.position.y = 1.22;
  medGroup.add(medGlassShell);

  const bubbleMat = new THREE.MeshBasicMaterial({
    color: 0xd1fae5,
    transparent: true,
    opacity: 0.82,
  });
  const bubbleOffsets: [number, number, number, number][] = [
    [0.14, 0.92, 0.12, 0.06],
    [-0.18, 1.18, -0.1, 0.05],
    [0.08, 1.48, -0.16, 0.045],
    [-0.12, 1.62, 0.14, 0.055],
  ];
  for (const [bx, by, bz, br] of bubbleOffsets) {
    const bubble = new THREE.Mesh(new THREE.SphereGeometry(br, 8, 8), bubbleMat);
    bubble.position.set(bx, by, bz);
    medGroup.add(bubble);
  }

  // Ceramic + gunmetal top flange collar
  const medTopFlange = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.68, 0.22, 16), ceramicMat);
  medTopFlange.position.y = 2.0;
  medGroup.add(medTopFlange);

  const medTopInner = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.08, 16), darkSlateMat);
  medTopInner.position.y = 2.13;
  medGroup.add(medTopInner);

  // 4 bronze-gold corner locking feet + lower & upper vertical locking clamps
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI * 0.25;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const foot = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.26, 0.34, 2, 0.03), bronzeMat);
    foot.position.set(cos * 1.06, 0.15, sin * 1.06);
    foot.rotation.y = -angle + Math.PI * 0.5;
    medGroup.add(foot);

    const lowClamp = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.38, 0.22, 2, 0.03), bronzeMat);
    lowClamp.position.set(cos * 0.64, 0.62, sin * 0.64);
    lowClamp.rotation.y = -angle + Math.PI * 0.5;
    medGroup.add(lowClamp);

    const highClamp = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.36, 0.22, 2, 0.03), bronzeMat);
    highClamp.position.set(cos * 0.66, 1.88, sin * 0.66);
    highClamp.rotation.y = -angle + Math.PI * 0.5;
    medGroup.add(highClamp);
  }

  // Floating Holographic Medical Cross Disc (medCore)
  const medCore = new THREE.Group();
  medCore.position.set(0, 2.52, 0);
  medGroup.add(medCore);

  const medHoloDiscMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const medHoloDisc = new THREE.Mesh(new THREE.CircleGeometry(0.56, 24), medHoloDiscMat);
  medHoloDisc.rotation.x = -Math.PI * 0.5;
  medCore.add(medHoloDisc);

  const medHoloRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.56, 0.025, 8, 28),
    new THREE.MeshBasicMaterial({ color: 0x6ee7b7 })
  );
  medHoloRim.rotation.x = Math.PI * 0.5;
  medCore.add(medHoloRim);

  const crossMat = new THREE.MeshStandardMaterial({
    color: 0xa7f3d0,
    emissive: 0x34d399,
    emissiveIntensity: 2.0,
    roughness: 0.15,
    metalness: 0.1,
  });
  const crossBarA = new THREE.Mesh(new RoundedBoxGeometry(0.54, 0.06, 0.16, 1, 0.02), crossMat);
  const crossBarB = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.06, 0.54, 1, 0.02), crossMat);
  medCore.add(crossBarA, crossBarB);

  const medRingMat = new THREE.MeshBasicMaterial({
    color: 0x34d399,
    transparent: true,
    opacity: 0.64,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const medRing = new THREE.Mesh(new THREE.RingGeometry(1.42, 1.6, 28), medRingMat);
  medRing.rotation.x = -Math.PI * 0.5;
  medRing.position.y = 0.05;
  medGroup.add(medRing);

  // =========================================================================
  // 2. FIELD REFIT WORKBENCH (0, 0, -2.4) — Central Sanctuary Altar
  // =========================================================================
  const benchGroup = new THREE.Group();
  benchGroup.position.set(0, 0, -2.4);
  root.add(benchGroup);

  // L-shaped heavy gunmetal & bronze-trimmed workbench table
  const benchMainTop = new THREE.Mesh(new RoundedBoxGeometry(2.35, 0.14, 1.08, 2, 0.03), gunmetalMat);
  benchMainTop.position.set(-0.1, 0.96, -0.15);
  benchGroup.add(benchMainTop);

  const benchMainTrim = new THREE.Mesh(new RoundedBoxGeometry(2.44, 0.08, 1.16, 2, 0.02), bronzeMat);
  benchMainTrim.position.set(-0.1, 0.91, -0.15);
  benchGroup.add(benchMainTrim);

  // Right-side L-wing extension
  const benchWingTop = new THREE.Mesh(new RoundedBoxGeometry(0.95, 0.14, 1.02, 2, 0.03), gunmetalMat);
  benchWingTop.position.set(0.6, 0.96, 0.68);
  benchGroup.add(benchWingTop);

  const benchWingTrim = new THREE.Mesh(new RoundedBoxGeometry(1.04, 0.08, 1.1, 2, 0.02), bronzeMat);
  benchWingTrim.position.set(0.6, 0.91, 0.68);
  benchGroup.add(benchWingTrim);

  // Under-desk cabinet & heavy corner support legs
  const legPositions: [number, number][] = [
    [-1.16, -0.58],
    [-1.16, 0.3],
    [0.98, -0.58],
    [0.2, 1.08],
    [0.98, 1.08],
  ];
  for (const [lx, lz] of legPositions) {
    const leg = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.88, 0.16, 2, 0.02), darkSlateMat);
    leg.position.set(lx, 0.44, lz);
    benchGroup.add(leg);
  }
  const underDrawer = new THREE.Mesh(new RoundedBoxGeometry(1.45, 0.34, 0.78, 2, 0.03), darkSlateMat);
  underDrawer.position.set(-0.35, 0.68, -0.18);
  benchGroup.add(underDrawer);

  // Angled glowing cyan weapon schematic monitor + keyboard tray
  const monitorHousing = new THREE.Mesh(new RoundedBoxGeometry(0.96, 0.62, 0.08, 2, 0.02), darkSlateMat);
  monitorHousing.position.set(-0.42, 1.38, -0.34);
  monitorHousing.rotation.x = -0.32;
  benchGroup.add(monitorHousing);

  const monitorScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.5), cyanScreenMat);
  monitorScreen.position.set(-0.42, 1.38, -0.295);
  monitorScreen.rotation.x = -0.32;
  benchGroup.add(monitorScreen);

  const keyboardPad = new THREE.Mesh(new RoundedBoxGeometry(0.74, 0.04, 0.3, 1, 0.01), ceramicMat);
  keyboardPad.position.set(-0.42, 1.05, 0.08);
  benchGroup.add(keyboardPad);

  // Twin articulated bronze-gold micro-welding robotic arms on rear-left
  const welderArms: THREE.Group[] = [];
  const armBaseOffsets: [number, number][] = [
    [-1.08, -0.36],
    [-0.95, -0.52],
  ];
  for (let i = 0; i < armBaseOffsets.length; i++) {
    const [ax, az] = armBaseOffsets[i];
    const armRoot = new THREE.Group();
    armRoot.position.set(ax, 1.04, az);
    benchGroup.add(armRoot);

    const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.18, 10), darkSlateMat);
    turret.position.y = 0.09;
    armRoot.add(turret);

    const lowerBoom = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.62, 0.1, 1, 0.02), bronzeMat);
    lowerBoom.position.set(0.12, 0.44, 0.06);
    lowerBoom.rotation.z = -0.38;
    armRoot.add(lowerBoom);

    const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), darkSlateMat);
    elbowJoint.position.set(0.24, 0.72, 0.12);
    armRoot.add(elbowJoint);

    const upperArm = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.48, 0.08, 1, 0.02), bronzeMat);
    upperArm.position.set(0.42, 0.6, 0.22);
    upperArm.rotation.z = -1.1;
    armRoot.add(upperArm);

    const nozzleTip = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.14, 8), cyanScreenMat);
    nozzleTip.position.set(0.62, 0.48, 0.28);
    nozzleTip.rotation.z = -Math.PI * 0.75;
    armRoot.add(nozzleTip);

    welderArms.push(armRoot);
  }

  // Right vertical tool pegboard wall + hanging bronze wrenches
  const pegboard = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.88, 0.08, 2, 0.02), gunmetalMat);
  pegboard.position.set(0.55, 1.48, -0.58);
  benchGroup.add(pegboard);

  for (let w = 0; w < 3; w++) {
    const wrench = new THREE.Mesh(new RoundedBoxGeometry(0.07, 0.36, 0.04, 1, 0.01), bronzeMat);
    wrench.position.set(0.28 + w * 0.24, 1.54, -0.52);
    benchGroup.add(wrench);
  }

  // Twin glowing amber vertical glass energy canisters + bronze battery packs
  for (let c = 0; c < 2; c++) {
    const canister = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.28, 12), amberCellMat);
    canister.position.set(0.18 + c * 0.2, 1.18, -0.24);
    benchGroup.add(canister);

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.05, 10), bronzeMat);
    cap.position.set(0.18 + c * 0.2, 1.33, -0.24);
    benchGroup.add(cap);
  }

  for (let b = 0; b < 2; b++) {
    const cellBox = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.18, 0.42, 1, 0.02), darkSlateMat);
    cellBox.position.set(0.46 + b * 0.32, 1.12, 0.56);
    benchGroup.add(cellBox);
    const cellGlow = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.06, 0.3, 1, 0.01), amberCellMat);
    cellGlow.position.set(0.46 + b * 0.32, 1.22, 0.56);
    benchGroup.add(cellGlow);
  }

  // Floating weapon hologram hovering above the workbench schematic
  const workbenchHolo = new THREE.Group();
  workbenchHolo.position.set(-0.35, 1.98, -0.05);
  benchGroup.add(workbenchHolo);

  const benchHoloMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 1.6,
    roughness: 0.14,
    metalness: 0.25,
    transparent: true,
    opacity: 0.85,
  });
  const bladeHologram = new THREE.Mesh(
    new RoundedBoxGeometry(1.16, 0.07, 0.13, 1, 0.02),
    benchHoloMat
  );
  bladeHologram.rotation.z = 0.14;
  workbenchHolo.add(bladeHologram);

  const benchHalo = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.02, 8, 24), amberCellMat);
  benchHalo.rotation.x = Math.PI * 0.44;
  workbenchHolo.add(benchHalo);

  // =========================================================================
  // 3. LYSA VENN NEURAL ASTROLABE CONSOLE (5.8, 0, 1.6) — East Sanctuary Alcove
  // Sculpted brass-and-obsidian telemetry dais with dual counter-rotating
  // horological gimbals, faceted sapphire neural crystal, vertical holographic
  // data fins, and angular geometric projection visor (no snowman spheres).
  // =========================================================================
  const lysaGroup = new THREE.Group();
  lysaGroup.position.set(5.8, 0, 1.6);
  lysaGroup.rotation.y = -0.45;
  root.add(lysaGroup);

  // Stepped octagonal dark obsidian & gunmetal telemetry plinth
  const lysaBaseLow = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.22, 0.28, 8), darkSlateMat);
  lysaBaseLow.position.y = 0.14;
  lysaGroup.add(lysaBaseLow);

  const lysaBaseMid = new THREE.Mesh(new THREE.CylinderGeometry(0.84, 0.96, 0.34, 8), gunmetalMat);
  lysaBaseMid.position.y = 0.45;
  lysaGroup.add(lysaBaseMid);

  const lysaBrassBezel = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.045, 8, 24), bronzeMat);
  lysaBrassBezel.rotation.x = Math.PI * 0.5;
  lysaBrassBezel.position.y = 0.64;
  lysaGroup.add(lysaBrassBezel);

  const lysaEmitterCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.72, 0.16, 16), darkSlateMat);
  lysaEmitterCollar.position.y = 0.72;
  lysaGroup.add(lysaEmitterCollar);

  const lysaDish = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 0.05, 20),
    cyanScreenMat
  );
  lysaDish.position.y = 0.82;
  lysaGroup.add(lysaDish);

  // 4 Angled Brushed-Bronze Gimbal Stanchions rising around the emitter lens
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI * 0.25;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const buttress = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.44, 0.26, 2, 0.03), bronzeMat);
    buttress.position.set(cos * 1.02, 0.24, sin * 1.02);
    buttress.rotation.y = -angle + Math.PI * 0.5;
    lysaGroup.add(buttress);

    const stanchion = new THREE.Mesh(new RoundedBoxGeometry(0.09, 0.78, 0.14, 2, 0.02), bronzeMat);
    stanchion.position.set(cos * 0.74, 1.08, sin * 0.74);
    stanchion.rotation.y = -angle + Math.PI * 0.5;
    stanchion.rotation.x = 0.18;
    lysaGroup.add(stanchion);
  }

  // Subtle upward optical projection veil (very low opacity so interior facets stay razor-crisp)
  const holoBeamCone = new THREE.Mesh(
    new THREE.CylinderGeometry(0.68, 0.34, 1.38, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  holoBeamCone.position.y = 1.52;
  lysaGroup.add(holoBeamCone);

  const lysaMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0284c7,
    emissiveIntensity: 1.55,
    roughness: 0.14,
    metalness: 0.32,
    flatShading: true,
    transparent: true,
    opacity: 0.88,
  });

  const lysaHoloGroup = new THREE.Group();
  lysaHoloGroup.position.set(0, 1.88, 0);
  lysaGroup.add(lysaHoloGroup);

  // Faceted Geometric Neural Archive Core + Angular Bust Mantle (Zero round spheres!)
  const lysaCoreCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0), lysaMat);
  lysaCoreCrystal.scale.set(0.88, 1.48, 0.88);
  lysaCoreCrystal.position.y = 0.04;
  lysaHoloGroup.add(lysaCoreCrystal);

  const lysaGoldSeed = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), amberCellMat);
  lysaGoldSeed.position.y = 0.04;
  lysaHoloGroup.add(lysaGoldSeed);

  // Sculpted angular shoulder/collar chevron wings
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.09, 0.16, 1, 0.015), lysaMat);
    wing.position.set(side * 0.32, -0.18, 0);
    wing.rotation.z = side * -0.32;
    lysaHoloGroup.add(wing);

    const dataFin = new THREE.Mesh(
      new THREE.PlaneGeometry(0.14, 0.68),
      new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.36,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    dataFin.position.set(side * 0.52, 0.12, 0);
    dataFin.rotation.y = side * 0.42;
    lysaHoloGroup.add(dataFin);
  }

  // Sleek Brushed-Gold Neural Crown Halo above the crystal core
  const lysaVisorHalo = new THREE.Mesh(
    new THREE.TorusGeometry(0.26, 0.022, 6, 24, Math.PI * 1.4),
    bronzeMat
  );
  lysaVisorHalo.rotation.x = Math.PI * 0.5;
  lysaVisorHalo.rotation.z = -Math.PI * 0.2;
  lysaVisorHalo.position.y = 0.36;
  lysaHoloGroup.add(lysaVisorHalo);

  const lysaOuterRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.76, 0.024, 8, 36),
    bronzeMat
  );
  lysaOuterRing.rotation.x = Math.PI * 0.44;
  lysaOuterRing.rotation.y = 0.24;
  lysaOuterRing.position.y = 0.06;
  lysaHoloGroup.add(lysaOuterRing);

  const lysaInnerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.58, 0.016, 8, 32),
    new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.78 })
  );
  lysaInnerRing.rotation.x = Math.PI * 0.56;
  lysaInnerRing.rotation.y = -0.32;
  lysaInnerRing.position.y = 0.06;
  lysaHoloGroup.add(lysaInnerRing);

  const lysaRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.52,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const lysaRing = new THREE.Mesh(new THREE.RingGeometry(1.36, 1.48, 32), lysaRingMat);
  lysaRing.rotation.x = -Math.PI * 0.5;
  lysaRing.position.y = 0.04;
  lysaGroup.add(lysaRing);

  // =========================================================================
  // 4. STATION HOLO-MAP TABLE (-4.6, 0, -5.8) — North-West Sanctuary Flank
  // =========================================================================
  const mapTableGroup = new THREE.Group();
  mapTableGroup.position.set(-4.6, 0, -5.8);
  mapTableGroup.rotation.y = 0.38;
  root.add(mapTableGroup);

  const tableFoot = new THREE.Mesh(new RoundedBoxGeometry(2.36, 0.24, 1.48, 2, 0.05), darkSlateMat);
  tableFoot.position.y = 0.12;
  mapTableGroup.add(tableFoot);

  const tableChassis = new THREE.Mesh(new RoundedBoxGeometry(2.18, 0.64, 1.32, 2, 0.06), gunmetalMat);
  tableChassis.position.y = 0.56;
  mapTableGroup.add(tableChassis);

  const tableTopRim = new THREE.Mesh(new RoundedBoxGeometry(2.38, 0.14, 1.52, 2, 0.04), gunmetalMat);
  tableTopRim.position.y = 0.94;
  mapTableGroup.add(tableTopRim);

  // Bronze side trim brackets
  for (const sx of [-1.14, 1.14]) {
    const trim = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.22, 0.88, 2, 0.02), bronzeMat);
    trim.position.set(sx, 0.36, 0);
    mapTableGroup.add(trim);
  }

  const tableGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.04, 1.18), cyanScreenMat);
  tableGlass.rotation.x = -Math.PI * 0.5;
  tableGlass.position.y = 1.02;
  mapTableGroup.add(tableGlass);

  // Floating 3D 6-Sector Interconnected Station Holo-Map
  const holoMapGroup = new THREE.Group();
  holoMapGroup.position.set(0, 1.58, 0);
  mapTableGroup.add(holoMapGroup);

  const holoCorridorMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.78,
  });

  // Central Hub Core Ring
  const hubCoreRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 8, 20), holoCorridorMat);
  hubCoreRing.rotation.x = Math.PI * 0.5;
  holoMapGroup.add(hubCoreRing);

  const hubSpire = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.34, 12), holoCorridorMat);
  holoMapGroup.add(hubSpire);

  // 6 interconnected circular sector nodes arranged in a hexagonal ring
  const holoMapNodeMats: THREE.MeshStandardMaterial[] = [];
  const nodeRadius = 0.74;
  const nodePositions: THREE.Vector3[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const nx = Math.cos(angle) * nodeRadius;
    const nz = Math.sin(angle) * nodeRadius * 0.78;
    nodePositions.push(new THREE.Vector3(nx, 0, nz));

    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      emissive: 0x0ea5e9,
      emissiveIntensity: 1.65,
      roughness: 0.18,
      metalness: 0.2,
      transparent: true,
      opacity: 0.88,
    });
    holoMapNodeMats.push(nodeMat);

    const nodeDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 16), nodeMat);
    nodeDisc.position.set(nx, 0, nz);
    holoMapGroup.add(nodeDisc);

    // Radial spoke corridor to central hub
    const spokeLen = Math.hypot(nx, nz);
    const spoke = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, spokeLen, 6),
      holoCorridorMat
    );
    spoke.position.set(nx * 0.5, 0, nz * 0.5);
    spoke.rotation.z = Math.PI * 0.5;
    spoke.rotation.y = -Math.atan2(nz, nx);
    holoMapGroup.add(spoke);
  }
  // Outer perimeter corridors connecting the 6 sector nodes
  for (let i = 0; i < 6; i++) {
    const a = nodePositions[i];
    const b = nodePositions[(i + 1) % 6];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    const link = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, len, 6),
      holoCorridorMat
    );
    link.position.set((a.x + b.x) * 0.5, 0, (a.z + b.z) * 0.5);
    link.rotation.z = Math.PI * 0.5;
    link.rotation.y = -Math.atan2(dz, dx);
    holoMapGroup.add(link);
  }

  // =========================================================================
  // 5. SOVEREIGN NG+ CREST (4.6, 0, -5.8) — North-East Sanctuary Flank
  // =========================================================================
  const crestGroup = new THREE.Group();
  crestGroup.position.set(4.6, 0, -5.8);
  crestGroup.rotation.y = -0.38;
  root.add(crestGroup);

  const crestPlinthLow = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.92, 0.28, 8), darkSlateMat);
  crestPlinthLow.position.y = 0.14;
  crestGroup.add(crestPlinthLow);

  const crestPlinthTop = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 0.34, 8), gunmetalMat);
  crestPlinthTop.position.y = 0.45;
  crestGroup.add(crestPlinthTop);

  // 4 bronze pedestal corner ribs
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI * 0.25;
    const rib = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.52, 0.16, 1, 0.02), bronzeMat);
    rib.position.set(Math.cos(angle) * 0.74, 0.28, Math.sin(angle) * 0.74);
    rib.rotation.y = -angle;
    crestGroup.add(rib);
  }

  // Glowing cyan engraved rune ring on pedestal top
  const runeRing = new THREE.Mesh(
    new THREE.RingGeometry(0.32, 0.52, 24),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    })
  );
  runeRing.rotation.x = -Math.PI * 0.5;
  runeRing.position.y = 0.63;
  crestGroup.add(runeRing);

  // Bronze outer crescent cradle supporting the twin gyro rings
  const cradleArc = new THREE.Mesh(
    new THREE.TorusGeometry(0.92, 0.055, 8, 24, Math.PI * 1.1),
    bronzeMat
  );
  cradleArc.position.y = 1.56;
  cradleArc.rotation.z = Math.PI * 0.95;
  crestGroup.add(cradleArc);

  const gyroRingMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 1.45,
    roughness: 0.18,
    metalness: 0.7,
  });
  const crestOuterRing = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.042, 10, 32), gyroRingMat);
  crestOuterRing.position.y = 1.58;
  crestOuterRing.rotation.x = 0.35;
  crestGroup.add(crestOuterRing);

  const crestInnerRing = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.036, 10, 32), gyroRingMat);
  crestInnerRing.position.y = 1.58;
  crestInnerRing.rotation.y = 0.6;
  crestInnerRing.rotation.x = -0.5;
  crestGroup.add(crestInnerRing);

  // Levitating 3-pointed faceted Golden-Amber Sovereign Crown
  const crestCrownMat = new THREE.MeshStandardMaterial({
    color: 0xfde047,
    emissive: 0xd97706,
    emissiveIntensity: 1.55,
    roughness: 0.18,
    metalness: 0.88,
  });
  const crestCrown = new THREE.Group();
  crestCrown.position.y = 1.58;
  crestGroup.add(crestCrown);

  const crownBand = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.24, 6), crestCrownMat);
  crownBand.position.y = -0.12;
  crestCrown.add(crownBand);

  // 3 tall golden crown spires (center tall + left/right flared peaks matching Sheet 12 Panel 8)
  const spireSpecs: [number, number, number, number][] = [
    [0, 0.16, 0, 0.42],
    [-0.22, 0.08, 0, 0.3],
    [0.22, 0.08, 0, 0.3],
  ];
  for (const [sx, sy, sz, sh] of spireSpecs) {
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.14, sh, 4), crestCrownMat);
    spire.position.set(sx, sy, sz);
    spire.rotation.z = sx === 0 ? 0 : sx < 0 ? 0.22 : -0.22;
    crestCrown.add(spire);
  }

  // =========================================================================
  // 6. PARADOX RIFT GATE (0, 0, -7.8) — Central North Sanctuary Focal Landmark
  // =========================================================================
  const paradoxRiftGroup = new THREE.Group();
  paradoxRiftGroup.position.set(0, 0, -7.8);
  root.add(paradoxRiftGroup);

  // Stepped crescent obsidian & brushed gold pedestal
  const riftPlinthLower = new THREE.Mesh(
    new THREE.CylinderGeometry(1.78, 2.02, 0.22, 24),
    darkSlateMat
  );
  riftPlinthLower.position.y = 0.11;
  paradoxRiftGroup.add(riftPlinthLower);

  const riftPlinthTrim = new THREE.Mesh(
    new THREE.TorusGeometry(1.86, 0.048, 8, 32),
    bronzeMat
  );
  riftPlinthTrim.rotation.x = Math.PI * 0.5;
  riftPlinthTrim.position.y = 0.22;
  paradoxRiftGroup.add(riftPlinthTrim);

  // Curved front crescent dais step
  const riftCrescentStep = new THREE.Mesh(
    new THREE.CylinderGeometry(1.12, 1.24, 0.18, 20),
    gunmetalMat
  );
  riftCrescentStep.position.set(0, 0.26, 0.52);
  paradoxRiftGroup.add(riftCrescentStep);

  const riftCrescentGold = new THREE.Mesh(
    new THREE.TorusGeometry(1.14, 0.036, 8, 28, Math.PI * 1.15),
    bronzeMat
  );
  riftCrescentGold.rotation.x = Math.PI * 0.5;
  riftCrescentGold.rotation.z = -Math.PI * 0.08;
  riftCrescentGold.position.set(0, 0.35, 0.52);
  paradoxRiftGroup.add(riftCrescentGold);

  // Flared left/right obsidian arch buttresses anchoring the circular portal frame
  for (const px of [-1.42, 1.42]) {
    const buttress = new THREE.Mesh(
      new RoundedBoxGeometry(0.46, 0.92, 0.56, 2, 0.05),
      gunmetalMat
    );
    buttress.position.set(px, 0.56, 0);
    buttress.rotation.z = px < 0 ? -0.34 : 0.34;
    paradoxRiftGroup.add(buttress);

    const buttressTrim = new THREE.Mesh(
      new RoundedBoxGeometry(0.5, 0.14, 0.6, 2, 0.02),
      bronzeMat
    );
    buttressTrim.position.set(px * 0.94, 0.96, 0);
    buttressTrim.rotation.z = px < 0 ? -0.34 : 0.34;
    paradoxRiftGroup.add(buttressTrim);
  }

  // Heavy circular obsidian-gunmetal arch housing + brushed gold filigree inner rim
  const riftArchHousing = new THREE.Mesh(
    new THREE.TorusGeometry(1.48, 0.16, 12, 40),
    gunmetalMat
  );
  riftArchHousing.position.y = 1.72;
  paradoxRiftGroup.add(riftArchHousing);

  const riftGoldFiligree = new THREE.Mesh(
    new THREE.TorusGeometry(1.34, 0.055, 10, 40),
    bronzeMat
  );
  riftGoldFiligree.position.y = 1.72;
  paradoxRiftGroup.add(riftGoldFiligree);

  // 4 Cardinal Brushed Gold Arch Clasps (Top, Bottom, Left, Right)
  for (let c = 0; c < 4; c++) {
    const ca = (c / 4) * Math.PI * 2;
    const clasp = new THREE.Mesh(
      new RoundedBoxGeometry(0.24, 0.34, 0.38, 2, 0.04),
      bronzeMat
    );
    clasp.position.set(Math.cos(ca) * 1.48, 1.72 + Math.sin(ca) * 1.48, 0);
    clasp.rotation.z = ca + Math.PI * 0.5;
    paradoxRiftGroup.add(clasp);
  }

  const paradoxRiftRingMat = new THREE.MeshStandardMaterial({
    color: 0xe879f9,
    emissive: 0xa855f7,
    emissiveIntensity: 1.9,
    roughness: 0.18,
    metalness: 0.72,
  });
  const paradoxRiftOuterRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.26, 0.048, 10, 36),
    paradoxRiftRingMat
  );
  paradoxRiftOuterRing.position.y = 1.72;
  paradoxRiftGroup.add(paradoxRiftOuterRing);

  const paradoxRiftInnerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.92, 0.036, 10, 32),
    crestCrownMat
  );
  paradoxRiftInnerRing.position.y = 1.72;
  paradoxRiftGroup.add(paradoxRiftInnerRing);

  // Swirling multi-layered violet-magenta & astral-gold spiral vortex disc
  const vortexTex = createParadoxVortexTexture();
  const paradoxRiftCoreMat = new THREE.MeshBasicMaterial({
    color: vortexTex ? 0xffffff : 0xc084fc,
    map: vortexTex ?? undefined,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const paradoxVortexMesh = new THREE.Mesh(
    new THREE.CircleGeometry(1.24, 36),
    paradoxRiftCoreMat
  );
  paradoxVortexMesh.position.y = 1.72;
  paradoxRiftGroup.add(paradoxVortexMesh);

  // 8 Floating Faceted Violet Crystal Shards orbiting around the Rift Gate arch
  const riftCrystalMat = new THREE.MeshStandardMaterial({
    color: 0xd8b4fe,
    emissive: 0xa855f7,
    emissiveIntensity: 1.85,
    roughness: 0.14,
    metalness: 0.3,
    flatShading: true,
  });
  const paradoxCrystalShards: THREE.Mesh[] = [];
  for (let s = 0; s < 8; s++) {
    const sa = (s / 8) * Math.PI * 2 + 0.25;
    const rad = s % 2 === 0 ? 1.74 : 1.12;
    const shard = new THREE.Mesh(
      new THREE.OctahedronGeometry(s % 2 === 0 ? 0.16 : 0.11, 0),
      riftCrystalMat
    );
    shard.scale.set(0.55, 1.55, 0.55);
    shard.position.set(
      Math.cos(sa) * rad,
      1.72 + Math.sin(sa) * rad,
      s % 2 === 0 ? 0.22 : 0.28
    );
    shard.rotation.z = sa - Math.PI * 0.5;
    shard.userData.baseAngle = sa;
    shard.userData.orbitRadius = rad;
    paradoxRiftGroup.add(shard);
    paradoxCrystalShards.push(shard);
  }

  // =========================================================================
  // 7. FIELD FABRICATOR KIOSK (-6.2, 0, -2.4) — Mid-West Sanctuary Alcove
  // =========================================================================
  const fabricatorKioskGroup = new THREE.Group();
  fabricatorKioskGroup.position.set(-6.2, 0, -2.4);
  fabricatorKioskGroup.rotation.y = 0.92;
  root.add(fabricatorKioskGroup);

  // Dark stepped plinth base
  const fabBase = new THREE.Mesh(
    new RoundedBoxGeometry(1.32, 0.24, 1.08, 2, 0.05),
    darkSlateMat
  );
  fabBase.position.y = 0.12;
  fabricatorKioskGroup.add(fabBase);

  // Ceramic-white tall rounded vertical monolith housing
  const fabBody = new THREE.Mesh(
    new RoundedBoxGeometry(1.18, 2.38, 0.88, 4, 0.14),
    ceramicMat
  );
  fabBody.position.set(0, 1.4, -0.06);
  fabricatorKioskGroup.add(fabBody);

  // Dark recessed upper fabrication chamber bay
  const fabChamber = new THREE.Mesh(
    new RoundedBoxGeometry(0.86, 0.96, 0.36, 2, 0.04),
    darkSlateMat
  );
  fabChamber.position.set(0, 1.88, 0.24);
  fabricatorKioskGroup.add(fabChamber);

  const fabChamberGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.76, 0.84),
    new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.35,
    })
  );
  fabChamberGlow.position.set(0, 1.88, 0.43);
  fabricatorKioskGroup.add(fabChamberGlow);

  // Angled lower console desk housing the 3 illuminated fragment canister slots
  const fabConsole = new THREE.Mesh(
    new RoundedBoxGeometry(1.12, 0.56, 0.52, 2, 0.06),
    gunmetalMat
  );
  fabConsole.position.set(0, 0.92, 0.32);
  fabConsole.rotation.x = -0.35;
  fabricatorKioskGroup.add(fabConsole);

  // 3 Illuminated Square Fragment Canister Slots (Amber, Orange, Cyan — Sheet 13 Panel 3)
  const slotColors: [number, number][] = [
    [0xfbbf24, 0xd97706],
    [0xfb923c, 0xea580c],
    [0x38bdf8, 0x0284c7],
  ];
  for (let i = 0; i < 3; i++) {
    const slotMat = new THREE.MeshStandardMaterial({
      color: slotColors[i][0],
      emissive: slotColors[i][1],
      emissiveIntensity: 1.9,
      roughness: 0.18,
      metalness: 0.22,
    });
    const slot = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.28, 0.08, 1, 0.015), slotMat);
    slot.position.set((i - 1) * 0.31, 0.98, 0.56);
    slot.rotation.x = -0.35;
    fabricatorKioskGroup.add(slot);
  }

  // Twin Brushed Gold Articulated Side Fabrication Nozzle Arms
  for (const sx of [-0.66, 0.66]) {
    const shoulder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.16, 12),
      bronzeMat
    );
    shoulder.rotation.z = Math.PI * 0.5;
    shoulder.position.set(sx, 1.38, 0.12);
    fabricatorKioskGroup.add(shoulder);

    const armBeam = new THREE.Mesh(
      new RoundedBoxGeometry(0.11, 0.11, 0.54, 2, 0.025),
      bronzeMat
    );
    armBeam.position.set(sx * 1.06, 1.36, 0.36);
    armBeam.rotation.y = sx < 0 ? 0.26 : -0.26;
    fabricatorKioskGroup.add(armBeam);

    const nozzleTip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.07, 0.14, 10),
      gunmetalMat
    );
    nozzleTip.rotation.x = Math.PI * 0.5;
    nozzleTip.position.set(sx * 0.94, 1.36, 0.64);
    fabricatorKioskGroup.add(nozzleTip);
  }

  // Floating Translucent Amber-Gold Holographic Weapon Blueprint Panel
  const holoBlueprintTex = createFabricatorHoloTexture();
  const fabricatorHoloMat = new THREE.MeshBasicMaterial({
    color: holoBlueprintTex ? 0xffffff : 0xfbbf24,
    map: holoBlueprintTex ?? undefined,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const fabricatorHoloMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.18, 0.68),
    fabricatorHoloMat
  );
  fabricatorHoloMesh.position.set(0, 1.88, 0.66);
  fabricatorKioskGroup.add(fabricatorHoloMesh);

  // =========================================================================
  // 8. CHRONO TRIAL ASTROLABE (6.2, 0, -2.4) — Mid-East Sanctuary Alcove
  // Sleek open-frame obsidian & brushed-bronze horological spire housing a
  // skeletonized floating tourbillon escapement (replaces bulky cyan tube).
  // =========================================================================
  const dailyObeliskGroup = new THREE.Group();
  dailyObeliskGroup.position.set(6.2, 0, -2.4);
  dailyObeliskGroup.rotation.y = -0.92;
  root.add(dailyObeliskGroup);

  const obeliskBaseLow = new THREE.Mesh(
    new THREE.CylinderGeometry(0.84, 0.98, 0.22, 6),
    darkSlateMat
  );
  obeliskBaseLow.position.y = 0.11;
  dailyObeliskGroup.add(obeliskBaseLow);

  const obeliskBaseMid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.64, 0.76, 0.3, 6),
    gunmetalMat
  );
  obeliskBaseMid.position.y = 0.37;
  dailyObeliskGroup.add(obeliskBaseMid);

  const obeliskGoldCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.54, 0.62, 0.1, 6),
    bronzeMat
  );
  obeliskGoldCap.position.y = 0.57;
  dailyObeliskGroup.add(obeliskGoldCap);

  // 3 Slender Tapered Gunmetal & Bronze Astrolabe Columns + Top Celestial Crown Ring
  for (let p = 0; p < 3; p++) {
    const pa = (p / 3) * Math.PI * 2 + Math.PI * 0.5;
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.055, 1.78, 8),
      gunmetalMat
    );
    strut.position.set(Math.cos(pa) * 0.56, 1.46, Math.sin(pa) * 0.56);
    dailyObeliskGroup.add(strut);

    const clasp = new THREE.Mesh(
      new RoundedBoxGeometry(0.12, 0.16, 0.12, 1, 0.02),
      bronzeMat
    );
    clasp.position.set(Math.cos(pa) * 0.56, 1.72, Math.sin(pa) * 0.56);
    clasp.rotation.y = -pa;
    dailyObeliskGroup.add(clasp);
  }

  const obeliskTopCrown = new THREE.Mesh(
    new THREE.TorusGeometry(0.56, 0.038, 8, 28),
    bronzeMat
  );
  obeliskTopCrown.rotation.x = Math.PI * 0.5;
  obeliskTopCrown.position.y = 2.36;
  dailyObeliskGroup.add(obeliskTopCrown);

  // Whisper-thin optical core filament instead of an opaque cyan cylinder
  const dailyObeliskBeamMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.11,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const obeliskPrism = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.32, 1.68, 6, 1, true),
    dailyObeliskBeamMat
  );
  obeliskPrism.position.y = 1.48;
  dailyObeliskGroup.add(obeliskPrism);

  const dailyObeliskChronoGroup = new THREE.Group();
  dailyObeliskChronoGroup.position.set(0, 1.66, 0);
  dailyObeliskGroup.add(dailyObeliskChronoGroup);

  const amberChronoMat = new THREE.MeshStandardMaterial({
    color: 0xfde047,
    emissive: 0xd97706,
    emissiveIntensity: 1.55,
    roughness: 0.2,
    metalness: 0.85,
  });
  const chronoBezel = new THREE.Mesh(
    new THREE.TorusGeometry(0.38, 0.026, 10, 32),
    bronzeMat
  );
  dailyObeliskChronoGroup.add(chronoBezel);

  const chronoInnerTiltRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.018, 8, 28),
    amberChronoMat
  );
  chronoInnerTiltRing.rotation.x = 0.52;
  chronoInnerTiltRing.rotation.y = 0.38;
  dailyObeliskChronoGroup.add(chronoInnerTiltRing);

  const escapementJewel = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.11, 0),
    cyanScreenMat
  );
  escapementJewel.scale.set(0.82, 1.35, 0.82);
  dailyObeliskChronoGroup.add(escapementJewel);

  // Tapered horological spear hands
  const chronoHandNorth = new THREE.Mesh(
    new THREE.ConeGeometry(0.028, 0.32, 4),
    amberChronoMat
  );
  chronoHandNorth.position.set(0, 0.16, 0);
  dailyObeliskChronoGroup.add(chronoHandNorth);

  const chronoHandEast = new THREE.Mesh(
    new THREE.ConeGeometry(0.022, 0.24, 4),
    amberChronoMat
  );
  chronoHandEast.rotation.z = -Math.PI * 0.5;
  chronoHandEast.position.set(0.12, 0, 0);
  dailyObeliskChronoGroup.add(chronoHandEast);

  return {
    root,
    medRing,
    medCore,
    medGlowMat,
    workbenchHolo,
    welderArms,
    lysaHoloGroup,
    lysaOuterRing,
    lysaInnerRing,
    lysaRing,
    lysaMat,
    holoMapGroup,
    holoMapNodeMats,
    crestOuterRing,
    crestInnerRing,
    crestCrown,
    crestCrownMat,
    paradoxRiftGroup,
    paradoxRiftOuterRing,
    paradoxRiftInnerRing,
    paradoxRiftCoreMat,
    paradoxRiftRingMat,
    paradoxVortexMesh,
    paradoxCrystalShards,
    fabricatorKioskGroup,
    fabricatorHoloMesh,
    fabricatorHoloMat,
    dailyObeliskGroup,
    dailyObeliskChronoGroup,
    dailyObeliskBeamMat,
  };
}

export interface SecretEchoVaultRig {
  root: THREE.Group;
  switchGroup: THREE.Group;
  switchCrystal: THREE.Group;
  switchRingMat: THREE.MeshBasicMaterial;
  vaultGroup: THREE.Group;
  laserBarsGroup: THREE.Group;
  emitterBeamsGroup: THREE.Group;
  laserMat: THREE.MeshStandardMaterial;
  relicCore: THREE.Mesh;
  vaultRingMat: THREE.MeshBasicMaterial;
  conduitLine: THREE.Mesh;
  conduitMat: THREE.MeshBasicMaterial;
}

/**
 * SECRET ECHO VAULT & PRESSURE SWITCH PUZZLE — Sheet 12 Concept Blueprints (Panels 4, 5, 6):
 * - West Switch: ECHO PRESSURE SWITCH PAD (Sheet 12, Panel 5)
 * - East Vault: SECRET ECHO RELIC VAULT (Sheet 12, Panel 4)
 * - Twin Flanking Towers: LASER CAGE EMITTERS (Sheet 12, Panel 6)
 */
export function createSecretEchoVaultRig(): SecretEchoVaultRig {
  const root = new THREE.Group();

  const gunmetalMat = new THREE.MeshStandardMaterial({
    color: 0x263141,
    roughness: 0.4,
    metalness: 0.78,
  });
  const darkSlateMat = new THREE.MeshStandardMaterial({
    color: 0x161e29,
    roughness: 0.48,
    metalness: 0.72,
  });
  const bronzeMat = new THREE.MeshStandardMaterial({
    color: 0xc99245,
    roughness: 0.26,
    metalness: 0.88,
  });
  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xd97736,
    roughness: 0.24,
    metalness: 0.86,
  });

  // =========================================================================
  // 1. WEST ECHO PRESSURE SWITCH PAD — Sheet 12, Panel 5
  // =========================================================================
  const switchGroup = new THREE.Group();
  root.add(switchGroup);

  const switchOuterBase = new THREE.Mesh(new THREE.CylinderGeometry(1.52, 1.72, 0.2, 24), darkSlateMat);
  switchOuterBase.position.y = 0.1;
  switchGroup.add(switchOuterBase);

  const switchBezel = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.38, 0.14, 24), gunmetalMat);
  switchBezel.position.y = 0.24;
  switchGroup.add(switchBezel);

  // 6 heavy bronze-gold hydraulic locking clamp brackets around the perimeter
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const clamp = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.24, 0.46, 2, 0.03), bronzeMat);
    clamp.position.set(Math.cos(angle) * 1.44, 0.2, Math.sin(angle) * 1.44);
    clamp.rotation.y = -angle + Math.PI * 0.5;
    switchGroup.add(clamp);
  }

  // Concentric segmented glowing cyan chevron rings recessed inside the pad
  const switchRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.86,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const padCoreDisc = new THREE.Mesh(new THREE.CircleGeometry(0.42, 20), switchRingMat);
  padCoreDisc.rotation.x = -Math.PI * 0.5;
  padCoreDisc.position.y = 0.32;
  switchGroup.add(padCoreDisc);

  const arcRadii: [number, number][] = [
    [0.54, 0.72],
    [0.84, 1.04],
  ];
  for (const [innerR, outerR] of arcRadii) {
    for (let s = 0; s < 3; s++) {
      const start = (s / 3) * Math.PI * 2 + 0.18;
      const seg = new THREE.Mesh(
        new THREE.RingGeometry(innerR, outerR, 12, 1, start, (Math.PI * 2) / 3 - 0.36),
        switchRingMat
      );
      seg.rotation.x = -Math.PI * 0.5;
      seg.position.y = 0.325;
      switchGroup.add(seg);
    }
  }

  const switchOuterGlow = new THREE.Mesh(new THREE.RingGeometry(1.78, 2.02, 28), switchRingMat);
  switchOuterGlow.rotation.x = -Math.PI * 0.5;
  switchOuterGlow.position.y = 0.05;
  switchGroup.add(switchOuterGlow);

  // Floating luminous holographic activation halo ring (switchCrystal)
  const switchCrystal = new THREE.Group();
  switchCrystal.position.y = 1.02;
  switchGroup.add(switchCrystal);

  const haloOuter = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.032, 8, 32),
    switchRingMat
  );
  haloOuter.rotation.x = Math.PI * 0.5;
  switchCrystal.add(haloOuter);

  const haloInner = new THREE.Mesh(
    new THREE.TorusGeometry(0.78, 0.016, 8, 28),
    switchRingMat
  );
  haloInner.rotation.x = Math.PI * 0.5;
  haloInner.position.y = 0.14;
  switchCrystal.add(haloInner);

  // =========================================================================
  // 2. EAST SECRET ECHO RELIC VAULT — Sheet 12, Panel 4
  // =========================================================================
  const vaultGroup = new THREE.Group();
  root.add(vaultGroup);

  // Stepped armored octagonal titanium base + dark crimson chamber floor
  const vaultBase = new THREE.Mesh(new THREE.CylinderGeometry(1.72, 1.92, 0.3, 8), darkSlateMat);
  vaultBase.position.y = 0.15;
  vaultGroup.add(vaultBase);

  const vaultInnerPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.78, 0.58, 6), gunmetalMat);
  vaultInnerPedestal.position.y = 0.56;
  vaultGroup.add(vaultInnerPedestal);

  // Open-front octagonal armored chamber walls (leave west-facing doorway open toward player!)
  const wallRadius = 1.46;
  const chamberInteriorMat = new THREE.MeshStandardMaterial({
    color: 0x3b182a,
    emissive: 0x4c0519,
    emissiveIntensity: 0.45,
    roughness: 0.42,
    metalness: 0.55,
  });
  for (let side = 0; side < 8; side++) {
    const angle = (side / 8) * Math.PI * 2;
    // Skip side 4 (angle = PI, facing West toward arena center & Switch Pad) as open doorway
    if (side === 4) continue;
    const isFlankBay = side === 3 || side === 5;
    const panelW = isFlankBay ? 0.52 : 1.12;
    const wall = new THREE.Mesh(
      new RoundedBoxGeometry(0.28, 2.35, panelW, 2, 0.03),
      side % 2 === 0 ? gunmetalMat : darkSlateMat
    );
    wall.position.set(Math.cos(angle) * wallRadius, 1.46, Math.sin(angle) * wallRadius);
    wall.rotation.y = -angle;
    vaultGroup.add(wall);

    if (!isFlankBay) {
      const liner = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.05, 0.96), chamberInteriorMat);
      liner.position.set(Math.cos(angle) * (wallRadius - 0.16), 1.42, Math.sin(angle) * (wallRadius - 0.16));
      liner.rotation.y = -angle;
      vaultGroup.add(liner);
    }
  }

  // Heavy beveled octagonal upper armor rim collar
  const vaultUpperRing = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.16, 8, 8), gunmetalMat);
  vaultUpperRing.rotation.x = Math.PI * 0.5;
  vaultUpperRing.rotation.z = Math.PI / 8;
  vaultUpperRing.position.y = 2.66;
  vaultGroup.add(vaultUpperRing);

  // Horizontal stacked crimson-magenta laser barrier bars (Sheet 12, Panel 4)
  const laserBarsGroup = new THREE.Group();
  vaultGroup.add(laserBarsGroup);

  const laserMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xe11d48,
    emissiveIntensity: 2.0,
    roughness: 0.12,
    metalness: 0.15,
    transparent: true,
    opacity: 0.9,
  });

  // 4 stacked horizontal laser bars across the front doorway & flanking bays
  const barHeights = [0.68, 1.18, 1.68, 2.18];
  for (const hy of barHeights) {
    const frontBar = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 1.42, 8), laserMat);
    frontBar.rotation.x = Math.PI * 0.5;
    frontBar.position.set(-1.38, hy, 0);
    laserBarsGroup.add(frontBar);

    for (const sz of [-1, 1]) {
      const sideBar = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.84, 8), laserMat);
      sideBar.rotation.x = Math.PI * 0.5;
      sideBar.rotation.y = sz * 0.76;
      sideBar.position.set(-1.04, hy, sz * 1.02);
      laserBarsGroup.add(sideBar);
    }
  }

  // Levitating tall bi-pyramidal Golden Faceted Chrono-Relic Crystal (Sheet 12, Panel 4)
  const relicCoreMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.9,
    roughness: 0.14,
    metalness: 0.78,
  });
  const relicCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 0), relicCoreMat);
  relicCore.scale.set(0.88, 1.55, 0.88);
  relicCore.position.y = 1.54;
  vaultGroup.add(relicCore);

  // =========================================================================
  // 3. TWIN FLANKING LASER CAGE EMITTER TOWERS — Sheet 12, Panel 6
  // =========================================================================
  const emitterBeamsGroup = new THREE.Group();
  vaultGroup.add(emitterBeamsGroup);

  for (const flankZ of [-2.25, 2.25]) {
    const emitterTower = new THREE.Group();
    emitterTower.position.set(-0.72, 0, flankZ);
    emitterTower.rotation.y = flankZ < 0 ? 0.35 : -0.35;
    vaultGroup.add(emitterTower);

    // Heavy stabilizer base & outward angled triangular feet
    const eBase = new THREE.Mesh(new RoundedBoxGeometry(1.15, 0.22, 0.62, 2, 0.03), darkSlateMat);
    eBase.position.y = 0.11;
    emitterTower.add(eBase);

    for (const sx of [-0.54, 0.54]) {
      const fin = new THREE.Mesh(new RoundedBoxGeometry(0.24, 1.95, 0.44, 2, 0.03), gunmetalMat);
      fin.position.set(sx, 1.05, 0);
      fin.rotation.z = sx < 0 ? -0.16 : 0.16;
      emitterTower.add(fin);

      const footStrut = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.56, 0.56, 1, 0.02), darkSlateMat);
      footStrut.position.set(sx * 1.15, 0.28, 0.24);
      emitterTower.add(footStrut);
    }

    // Dual copper-bronze induction coils between the armor fins
    for (const cx of [-0.22, 0.22]) {
      const coilCore = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.82, 12), darkSlateMat);
      coilCore.position.set(cx, 0.58, 0);
      emitterTower.add(coilCore);

      for (let r = 0; r < 5; r++) {
        const coilRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 6, 14), copperMat);
        coilRing.rotation.x = Math.PI * 0.5;
        coilRing.position.set(cx, 0.34 + r * 0.12, 0);
        emitterTower.add(coilRing);
      }

      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.09, 12), bronzeMat);
      cap.position.set(cx, 1.02, 0);
      emitterTower.add(cap);
    }

    // 3 razor-sharp crimson-magenta vertical laser beams firing upward when locked
    const beamOffsets: [number, number][] = [
      [-0.22, 1.9],
      [0, 2.3],
      [0.22, 1.9],
    ];
    for (const [bx, bh] of beamOffsets) {
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, bh, 8), laserMat);
      beam.position.set(
        emitterTower.position.x + bx,
        1.05 + bh * 0.5,
        emitterTower.position.z
      );
      emitterBeamsGroup.add(beam);
    }
  }

  const vaultRingMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: 0.68,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const vaultRing = new THREE.Mesh(new THREE.RingGeometry(1.96, 2.22, 28), vaultRingMat);
  vaultRing.rotation.x = -Math.PI * 0.5;
  vaultRing.position.y = 0.06;
  vaultGroup.add(vaultRing);

  // --- FLOOR POWER CONDUIT LINE CONNECTING SWITCH TO VAULT ---
  const conduitMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: 0.38,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const conduitLine = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.24), conduitMat);
  conduitLine.rotation.x = -Math.PI * 0.5;
  conduitLine.position.y = 0.045;
  root.add(conduitLine);

  return {
    root,
    switchGroup,
    switchCrystal,
    switchRingMat,
    vaultGroup,
    laserBarsGroup,
    emitterBeamsGroup,
    laserMat,
    relicCore,
    vaultRingMat,
    conduitLine,
    conduitMat,
  };
}

export interface AutonomousCombatDroneRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  haloRing: THREE.Mesh;
  haloMat: THREE.MeshStandardMaterial;
  coreMat: THREE.MeshStandardMaterial;
  thrusterFlames?: THREE.Mesh[];
  muzzleFlashMesh: THREE.Mesh;
  beamMesh: THREE.Mesh;
  beamMat: THREE.MeshBasicMaterial;
}

/**
 * AUTONOMOUS COMBAT DRONE MK.II — Sheet 13, Panel 2
 * Wide swept manta-winged white ceramic + brushed gold V-frame chassis, amber wing-edge
 * vent slits, twin rear orange-gold rocket exhaust cones, glowing cyan oval front
 * eye-sensor, twin under-slung boxy cyan plasma micro-blasters, and an elevated
 * horizontal glowing cyan holographic halo ring hovering above the top dorsal disc.
 */
export function createAutonomousCombatDroneRig(): AutonomousCombatDroneRig {
  const root = new THREE.Group();
  root.visible = false;

  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const hullMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.22,
    metalness: 0.28,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.44,
    metalness: 0.76,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xdca844,
    roughness: 0.24,
    metalness: 0.9,
  });
  const amberVentMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 2.0,
    roughness: 0.16,
    metalness: 0.2,
  });
  const thrusterFlameMat = new THREE.MeshBasicMaterial({
    color: 0xfb923c,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x06b6d4,
    emissiveIntensity: 2.2,
    roughness: 0.12,
    metalness: 0.2,
  });
  const haloMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x0ea5e9,
    emissiveIntensity: 2.0,
    roughness: 0.14,
    metalness: 0.45,
  });

  // Central dark recessed armored nose housing
  const noseBody = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.28, 0.56, 3, 0.06), darkMat);
  bodyGroup.add(noseBody);

  // Swept White Ceramic Manta Wing-Chassis (Left & Right flared gull wings)
  for (const side of [-1, 1]) {
    const wingPlate = new THREE.Mesh(
      new RoundedBoxGeometry(0.56, 0.14, 0.46, 3, 0.045),
      hullMat
    );
    wingPlate.position.set(side * 0.42, 0.05, -0.06);
    wingPlate.rotation.y = side * -0.34;
    wingPlate.rotation.z = side * 0.12;
    bodyGroup.add(wingPlate);

    // Brushed gold V-frame leading edge collar & wingtip trim
    const goldEdge = new THREE.Mesh(
      new RoundedBoxGeometry(0.58, 0.06, 0.08, 2, 0.02),
      goldMat
    );
    goldEdge.position.set(side * 0.42, 0.05, 0.17);
    goldEdge.rotation.y = side * -0.34;
    goldEdge.rotation.z = side * 0.12;
    bodyGroup.add(goldEdge);

    // Amber glowing wing-edge vent slits (3 micro-vents per side)
    for (let v = 0; v < 3; v++) {
      const vent = new THREE.Mesh(
        new RoundedBoxGeometry(0.08, 0.036, 0.05, 1, 0.008),
        amberVentMat
      );
      vent.position.set(side * (0.28 + v * 0.12), 0.02, 0.19 - v * 0.04);
      vent.rotation.y = side * -0.34;
      bodyGroup.add(vent);
    }

    // Rear angled thruster pod + glowing orange-gold rocket exhaust cone
    const thrusterPod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.105, 0.34, 12),
      goldMat
    );
    thrusterPod.rotation.x = Math.PI * 0.5;
    thrusterPod.position.set(side * 0.24, 0.08, -0.34);
    bodyGroup.add(thrusterPod);

    const thrusterNozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.085, 0.1, 12),
      darkMat
    );
    thrusterNozzle.rotation.x = Math.PI * 0.5;
    thrusterNozzle.position.set(side * 0.24, 0.08, -0.52);
    bodyGroup.add(thrusterNozzle);

    // Twin Under-Slung Boxy Cyan Plasma Micro-Blasters extending forward
    const blasterHousing = new THREE.Mesh(
      new RoundedBoxGeometry(0.13, 0.13, 0.42, 2, 0.024),
      darkMat
    );
    blasterHousing.position.set(side * 0.34, -0.15, 0.26);
    bodyGroup.add(blasterHousing);

    const blasterCyanRail = new THREE.Mesh(
      new RoundedBoxGeometry(0.145, 0.07, 0.32, 1, 0.015),
      coreMat
    );
    blasterCyanRail.position.set(side * 0.34, -0.15, 0.32);
    bodyGroup.add(blasterCyanRail);

    const blasterMuzzle = new THREE.Mesh(
      new RoundedBoxGeometry(0.09, 0.09, 0.08, 1, 0.01),
      coreMat
    );
    blasterMuzzle.position.set(side * 0.34, -0.15, 0.5);
    bodyGroup.add(blasterMuzzle);
  }

  // Twin Rocket Thruster Exhaust Cones (animated in renderer.ts)
  const thrusterFlames: THREE.Mesh[] = [];
  for (const side of [-1, 1]) {
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.34, 10), thrusterFlameMat);
    flame.rotation.x = -Math.PI * 0.5;
    flame.position.set(side * 0.24, 0.08, -0.7);
    bodyGroup.add(flame);
    thrusterFlames.push(flame);
  }

  // Brushed Gold Dorsal Collar & Top White Ceramic Disc
  const dorsalGoldRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.045, 10, 24),
    goldMat
  );
  dorsalGoldRim.rotation.x = Math.PI * 0.5;
  dorsalGoldRim.position.set(0, 0.16, -0.02);
  bodyGroup.add(dorsalGoldRim);

  const dorsalCap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.08, 16), hullMat);
  dorsalCap.position.set(0, 0.17, -0.02);
  bodyGroup.add(dorsalCap);

  const dorsalCoreDot = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.09, 14), coreMat);
  dorsalCoreDot.position.set(0, 0.18, -0.02);
  bodyGroup.add(dorsalCoreDot);

  // Glowing Cyan Oval Front Eye-Sensor framed in brushed gold bezel
  const eyeBezel = new THREE.Mesh(new RoundedBoxGeometry(0.16, 0.22, 0.08, 2, 0.03), goldMat);
  eyeBezel.position.set(0, -0.01, 0.28);
  bodyGroup.add(eyeBezel);

  const opticEye = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.075, 6, 12), coreMat);
  opticEye.position.set(0, -0.01, 0.32);
  bodyGroup.add(opticEye);

  // Elevated Horizontal Glowing Cyan Holographic Halo Ring hovering above top dorsal disc
  const haloRing = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.028, 10, 32), haloMat);
  haloRing.rotation.x = Math.PI * 0.5;
  haloRing.position.set(0, 0.36, -0.02);
  bodyGroup.add(haloRing);

  const muzzleFlashMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 8, 8),
    new THREE.MeshBasicMaterial({
      color: 0xa5f3fc,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  muzzleFlashMesh.position.set(0, -0.15, 0.56);
  muzzleFlashMesh.visible = false;
  bodyGroup.add(muzzleFlashMesh);

  // World-space plasma beam tracer stretched between drone & target on fire
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const beamMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1, 8), beamMat);
  beamMesh.visible = false;
  root.add(beamMesh);

  return {
    root,
    bodyGroup,
    haloRing,
    haloMat,
    coreMat,
    thrusterFlames,
    muzzleFlashMesh,
    beamMesh,
    beamMat,
  };
}





export interface ChronoFinisherRiftRig {
  root: THREE.Group;
  outerRing: THREE.Mesh;
  voidDisc: THREE.Mesh;
  voidMat: THREE.MeshBasicMaterial;
  slashShardsGroup: THREE.Group;
  goldSlashMat: THREE.MeshBasicMaterial;
  violetSlashMat: THREE.MeshBasicMaterial;
}

/**
 * CHRONO FINISHER RIFT — Sheet 14, Panel 7
 * Circular brushed-gold astral void portal crossed by jagged glowing gold & violet slash bolts.
 */
export function createChronoFinisherRiftRig(): ChronoFinisherRiftRig {
  const root = new THREE.Group();

  // Razor-thin metallic-gold outer shockwave halo + tilted inner cyan orbital filament
  const goldRingMat = new THREE.MeshStandardMaterial({
    color: 0xf6d167,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.5,
    roughness: 0.14,
    metalness: 0.92,
    transparent: true,
    opacity: 0.88,
  });
  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.38, 0.026, 10, 64),
    goldRingMat
  );
  outerRing.rotation.x = Math.PI * 0.5;
  outerRing.position.y = 0.86;
  root.add(outerRing);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.75, 0.016, 8, 56),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  innerRing.rotation.set(Math.PI * 0.42, 0.25, 0);
  innerRing.position.y = 0.96;
  outerRing.add(innerRing);

  // Hollow translucent ground shockwave ring (never covers floor like a flat purple sticker)
  const voidMat = new THREE.MeshBasicMaterial({
    color: 0x7c3aed,
    transparent: true,
    opacity: 0.34,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const voidDisc = new THREE.Mesh(new THREE.RingGeometry(1.84, 2.38, 64), voidMat);
  voidDisc.rotation.x = -Math.PI * 0.5;
  voidDisc.position.y = 0.06;
  root.add(voidDisc);

  const slashShardsGroup = new THREE.Group();
  slashShardsGroup.position.y = 1.05;
  root.add(slashShardsGroup);

  const goldSlashMat = new THREE.MeshBasicMaterial({
    color: 0xfde68a,
    transparent: true,
    opacity: 0.68,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const violetSlashMat = new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
    transparent: true,
    opacity: 0.56,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // Tapered diamond-blade slash geometry (sleek razor ribbons, zero boxy rectangles)
  const slashShape = new THREE.Shape();
  slashShape.moveTo(-2.6, 0);
  slashShape.quadraticCurveTo(0, 0.095, 2.6, 0);
  slashShape.quadraticCurveTo(0, -0.095, -2.6, 0);
  const slashBladeGeo = new THREE.ShapeGeometry(slashShape, 12);

  for (let i = 0; i < 6; i++) {
    const isGold = i % 2 === 0;
    const slash = new THREE.Mesh(
      slashBladeGeo,
      isGold ? goldSlashMat : violetSlashMat
    );
    slash.rotation.y = (i / 6) * Math.PI + 0.2;
    slash.rotation.z = ((i % 3) - 1) * 0.42;
    slash.rotation.x = (i % 2 === 0 ? 1 : -1) * 0.22;
    slash.position.y = (i - 2.5) * 0.09;
    slashShardsGroup.add(slash);
  }

  return {
    root,
    outerRing,
    voidDisc,
    voidMat,
    slashShardsGroup,
    goldSlashMat,
    violetSlashMat,
  };
}

export interface PhotoDroneRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  lensRing: THREE.Mesh;
  lensMat: THREE.MeshStandardMaterial;
}

/**
 * PHOTO DRONE LENS — Sheet 14, Panel 8
 * Hovering ceramic-white & brushed-gold spherical camera orb with recessed cyan aperture & micro-fins.
 */
export function createPhotoDroneRig(): PhotoDroneRig {
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const ceramicMat = new THREE.MeshStandardMaterial({
    color: 0xe6edf6,
    roughness: 0.22,
    metalness: 0.18,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd9a84e,
    roughness: 0.28,
    metalness: 0.84,
  });
  const darkApertureMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.35,
    metalness: 0.72,
  });
  const lensMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 2.6,
    roughness: 0.08,
    metalness: 0.2,
  });

  const orbHull = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 16), ceramicMat);
  bodyGroup.add(orbHull);

  // Equatorial brushed-gold seam band
  const goldBand = new THREE.Mesh(new THREE.TorusGeometry(0.262, 0.022, 8, 28), goldMat);
  goldBand.rotation.x = Math.PI * 0.5;
  bodyGroup.add(goldBand);

  // Recessed front camera aperture barrel + glowing cyan lens ring
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.145, 0.16, 0.12, 18),
    darkApertureMat
  );
  barrel.rotation.x = Math.PI * 0.5;
  barrel.position.set(0, 0, 0.22);
  bodyGroup.add(barrel);

  const lensRing = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.018, 8, 22), lensMat);
  lensRing.position.set(0, 0, 0.28);
  bodyGroup.add(lensRing);

  const lensCore = new THREE.Mesh(new THREE.CircleGeometry(0.085, 18), lensMat);
  lensCore.position.set(0, 0, 0.285);
  bodyGroup.add(lensCore);

  // Twin horizontal aerodynamic micro-fins
  for (const side of [-1, 1]) {
    const fin = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.032, 0.12, 1, 0.01), ceramicMat);
    fin.position.set(side * 0.34, 0.02, -0.02);
    fin.rotation.z = side * -0.14;
    bodyGroup.add(fin);

    const finTrim = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.014, 0.036, 1, 0.005), goldMat);
    finTrim.position.set(side * 0.34, 0.02, 0.035);
    finTrim.rotation.z = side * -0.14;
    bodyGroup.add(finTrim);
  }

  return {
    root,
    bodyGroup,
    lensRing,
    lensMat,
  };
}

export interface LysaHoloProjectorRig {
  root: THREE.Group;
  outerGimbalRing: THREE.Mesh;
  innerHarmonicRing: THREE.Mesh;
  hologramFigureGroup: THREE.Group;
  seedCrystalMesh: THREE.Mesh;
  floorHaloMat: THREE.MeshBasicMaterial;
  beamConeMat: THREE.MeshBasicMaterial;
  holoShaderMat: THREE.ShaderMaterial;
  apertureLensMat: THREE.MeshStandardMaterial;
}

/**
 * v3.8.0 — 3D DR. LYSA VENN HOLO-MEMORY ASTROLABE PROJECTOR RIG
 * Flush-mounted 10-part titanium-brass astrolabe floor emitter (height <= 0.048m, zero footwork snag)
 * projecting a volumetric Fresnel/scanline hologram of Dr. Lysa Venn holding a Chronicle Seed Crystal.
 */
export function createLysaHoloProjectorRig(shadowTex: THREE.Texture): LysaHoloProjectorRig {
  const root = new THREE.Group();
  root.name = 'LysaHoloProjectorRig';

  // 1. Soft radial contact shadow disc
  const contactShadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.42, 28),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.46,
      depthWrite: false,
    })
  );
  contactShadow.rotation.x = -Math.PI * 0.5;
  contactShadow.position.y = 0.012;
  root.add(contactShadow);

  const darkTitaniumMat = new THREE.MeshStandardMaterial({
    color: 0x162030,
    roughness: 0.36,
    metalness: 0.84,
  });
  const antiqueBrassMat = new THREE.MeshStandardMaterial({
    color: 0xd4a948,
    emissive: 0x784f12,
    emissiveIntensity: 0.32,
    roughness: 0.24,
    metalness: 0.9,
  });
  const apertureLensMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 2.1,
    roughness: 0.1,
    metalness: 0.2,
  });

  // 2. Flush beveled dark-titanium octagonal emitter plinth
  const basePlinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.98, 1.12, 0.044, 8),
    darkTitaniumMat
  );
  basePlinth.position.y = 0.022;
  basePlinth.rotation.y = Math.PI / 8;
  root.add(basePlinth);

  // 3. Antique-brass astrolabe bezel collar + 4 cardinal clamps
  const brassCollar = new THREE.Mesh(
    new THREE.TorusGeometry(0.84, 0.032, 8, 32),
    antiqueBrassMat
  );
  brassCollar.rotation.x = Math.PI * 0.5;
  brassCollar.position.y = 0.045;
  root.add(brassCollar);

  const clampGeo = new RoundedBoxGeometry(0.22, 0.05, 0.14, 1, 0.015);
  for (let c = 0; c < 4; c++) {
    const ca = (c / 4) * Math.PI * 2 + Math.PI * 0.25;
    const clamp = new THREE.Mesh(clampGeo, antiqueBrassMat);
    clamp.position.set(Math.cos(ca) * 0.94, 0.032, Math.sin(ca) * 0.94);
    clamp.rotation.y = -ca;
    root.add(clamp);
  }

  // 4. Glowing optical aperture lens core + floor interaction ring
  const lensDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.02, 24), apertureLensMat);
  lensDisc.position.y = 0.044;
  root.add(lensDisc);

  const floorHaloGeo = new THREE.RingGeometry(1.18, 1.34, 36);
  floorHaloGeo.rotateX(-Math.PI * 0.5);
  const floorHaloMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const floorHalo = new THREE.Mesh(floorHaloGeo, floorHaloMat);
  floorHalo.position.y = 0.024;
  root.add(floorHalo);

  // 5 & 6. Counter-rotating brass & cyan astrolabe gimbal rings
  const outerGimbalRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.72, 0.02, 8, 36),
    antiqueBrassMat
  );
  outerGimbalRing.rotation.x = Math.PI * 0.5;
  outerGimbalRing.position.y = 0.12;
  root.add(outerGimbalRing);

  const innerHarmonicRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.016, 8, 32),
    new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    })
  );
  innerHarmonicRing.position.y = 1.12;
  innerHarmonicRing.rotation.x = Math.PI * 0.36;
  root.add(innerHarmonicRing);

  // 7. Volumetric projection beam cone
  const beamConeMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const beamConeMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.68, 0.36, 2.05, 24, 1, true),
    beamConeMat
  );
  beamConeMesh.position.y = 1.06;
  root.add(beamConeMesh);

  // 8. Custom Fresnel + Scanline GLSL Hologram Shader for Dr. Lysa Venn
  const holoShaderMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPrimaryColor: { value: new THREE.Color(0x22d3ee) },
      uSecondaryColor: { value: new THREE.Color(0xfbbf24) },
      uOpacity: { value: 0.86 },
    },
    vertexShader: `
      varying vec3 vNormalView;
      varying vec3 vViewDir;
      varying float vLocalY;
      void main() {
        vLocalY = position.y;
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPos.xyz);
        vNormalView = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uPrimaryColor;
      uniform vec3 uSecondaryColor;
      uniform float uOpacity;
      varying vec3 vNormalView;
      varying vec3 vViewDir;
      varying float vLocalY;
      void main() {
        float fresnel = pow(clamp(1.0 - abs(dot(normalize(vNormalView), normalize(vViewDir))), 0.0, 1.0), 1.85);
        float scanline = sin(vLocalY * 54.0 - uTime * 6.5) * 0.5 + 0.5;
        float sweepBand = smoothstep(0.75, 1.0, sin(vLocalY * 5.0 - uTime * 2.1) * 0.5 + 0.5);
        vec3 col = mix(uPrimaryColor, uSecondaryColor, fresnel * 0.42 + sweepBand * 0.35);
        float alpha = clamp((0.24 + fresnel * 0.72) * (0.72 + scanline * 0.28) * uOpacity, 0.0, 0.96);
        gl_FragColor = vec4(col * (1.1 + sweepBand * 0.35), alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  // Sculpted 3D Silhouette of Chief Temporal Architect Dr. Lysa Venn
  const hologramFigureGroup = new THREE.Group();
  hologramFigureGroup.position.y = 0.22;

  // Architectural flared temporal scientist coat lower skirt
  const coatSkirt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.33, 0.78, 16, 1, true),
    holoShaderMat
  );
  coatSkirt.position.y = 0.44;
  hologramFigureGroup.add(coatSkirt);

  // Tailored torso & high architect collar mantle
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.155, 0.36, 6, 14), holoShaderMat);
  torso.position.y = 1.02;
  hologramFigureGroup.add(torso);

  const collarMantle = new THREE.Mesh(
    new THREE.TorusGeometry(0.19, 0.032, 8, 20, Math.PI * 1.35),
    holoShaderMat
  );
  collarMantle.position.set(0, 1.26, -0.02);
  collarMantle.rotation.set(Math.PI * 0.42, 0, Math.PI * 0.82);
  hologramFigureGroup.add(collarMantle);

  // Twin Chrono-Architect coat tail fins
  for (const side of [-1, 1]) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.58, 0.16), holoShaderMat);
    fin.position.set(side * 0.21, 0.68, -0.1);
    fin.rotation.set(0.18, 0, side * -0.18);
    hologramFigureGroup.add(fin);
  }

  // Head, swept hair crest & neural architect visor
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 14), holoShaderMat);
  head.position.set(0, 1.44, 0.01);
  hologramFigureGroup.add(head);

  const visor = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.052, 0.12, 1, 0.015), holoShaderMat);
  visor.position.set(0, 1.45, 0.085);
  hologramFigureGroup.add(visor);

  // Left arm resting at chest, Right arm outstretched offering the Chronicle Seed Crystal
  const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.046, 0.34, 4, 8), holoShaderMat);
  leftArm.position.set(-0.21, 1.02, 0.06);
  leftArm.rotation.set(-0.45, 0, 0.28);
  hologramFigureGroup.add(leftArm);

  const rightArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.046, 0.38, 4, 8), holoShaderMat);
  rightArm.position.set(0.2, 1.08, 0.18);
  rightArm.rotation.set(-1.05, 0, -0.22);
  hologramFigureGroup.add(rightArm);

  const seedCrystalMesh = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.11, 0),
    new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.94,
      depthWrite: false,
    })
  );
  seedCrystalMesh.position.set(0.24, 1.24, 0.38);
  hologramFigureGroup.add(seedCrystalMesh);

  root.add(hologramFigureGroup);

  return {
    root,
    outerGimbalRing,
    innerHarmonicRing,
    hologramFigureGroup,
    seedCrystalMesh,
    floorHaloMat,
    beamConeMat,
    holoShaderMat,
    apertureLensMat,
  };
}

