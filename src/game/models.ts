import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { GAME_CONFIG } from './config.ts';
import type { CampaignChapterId, EnemyArchetype, ObstacleCollider } from './types.ts';
import { applyVerticalVertexAO } from './visual-palette.ts';

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
  chronoAccentMaterial?: THREE.MeshStandardMaterial;
  phaseRailGroup?: THREE.Group;
  phaseRailCoils?: THREE.Mesh[];
  gravBreakerGroup?: THREE.Group;
  gravBreakerOrbs?: THREE.Mesh[];
  pulsecasterCoreMesh: THREE.Mesh;
  pulsecasterMaterial: THREE.MeshStandardMaterial;
  slashArcPivot: THREE.Group;
  slashArcMesh: THREE.Mesh;
  slashArcMaterial: THREE.MeshBasicMaterial;
  parryShieldMesh: THREE.Mesh;
  parryShieldMaterial: THREE.MeshBasicMaterial;
  chargeRingMesh: THREE.Mesh;
  chargeRingMaterial: THREE.MeshBasicMaterial;
  echoPhaseRingMesh?: THREE.Mesh;
  echoSecondPhaseRingMesh?: THREE.Mesh;
  echoInnerWireMesh?: THREE.Mesh;
  echoBaseRippleMesh?: THREE.Mesh;
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
}

/**
 * Generates an equirectangular studio reflection environment map in <3ms so all PBR metallic
 * surfaces (Sera's armor, Bastion's gunmetal carapace, Scrapper's copper plating, and the
 * Chronicle Loom pylon) reflect rich industrial highlights in both desktop GPU and headless WebGL.
 */
export function createStudioEnvironmentTexture(): THREE.CanvasTexture {
  const width = 256;
  const height = 128;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Base vertical sky-to-deck gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0.0, '#1e3a5f');
    bgGrad.addColorStop(0.28, '#2b4c73');
    bgGrad.addColorStop(0.48, '#476b94');
    bgGrad.addColorStop(0.52, '#1a2738');
    bgGrad.addColorStop(0.75, '#0f1726');
    bgGrad.addColorStop(1.0, '#070b12');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Overhead warm studio light softboxes (for crisp specular armor highlights)
    ctx.fillStyle = 'rgba(255, 251, 235, 0.85)';
    ctx.fillRect(32, 14, 56, 16);
    ctx.fillRect(156, 18, 64, 14);

    // Cool cyan orbital rim light strips
    ctx.fillStyle = 'rgba(56, 189, 248, 0.78)';
    ctx.fillRect(16, 42, 84, 8);
    ctx.fillRect(140, 44, 92, 8);

    // Subtle warm amber industrial horizon reflections
    ctx.fillStyle = 'rgba(245, 158, 11, 0.52)';
    ctx.fillRect(68, 60, 42, 6);
    ctx.fillRect(188, 60, 38, 6);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
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

export function createArmorDetailBumpTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    // Subtle brushed micro-grain and panel seam lines
    ctx.strokeStyle = '#686868';
    ctx.lineWidth = 1;
    for (let y = 0; y < size; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#383838';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, size - 20, size - 20);
    ctx.beginPath();
    ctx.moveTo(10, size * 0.5);
    ctx.lineTo(size - 10, size * 0.5);
    ctx.moveTo(size * 0.5, 10);
    ctx.lineTo(size * 0.5, size - 10);
    ctx.stroke();

    // Corner rivet indentations
    ctx.fillStyle = '#484848';
    for (const [rx, ry] of [
      [20, 20],
      [size - 20, 20],
      [20, size - 20],
      [size - 20, size - 20],
    ]) {
      ctx.beginPath();
      ctx.arc(rx, ry, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createIndustrialDeckTextures(maxAnisotropy: number): {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 512;
  const tile = 128;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d');

  if (cCtx) {
    // Deep recessed carbon-slate channel bed
    cCtx.fillStyle = '#050911';
    cCtx.fillRect(0, 0, size, size);

    const palette = ['#131f2f', '#172538', '#111b2a', '#19293e'];

    for (let y = 0; y < size; y += tile) {
      for (let x = 0; x < size; x += tile) {
        const tx = x / tile;
        const ty = y / tile;
        const idx = (tx + ty * 2) % palette.length;

        // Primary modular deck plate
        cCtx.fillStyle = palette[idx];
        cCtx.fillRect(x + 4, y + 4, tile - 8, tile - 8);

        // Crisp machined inner bevel highlight & dark recess outline
        cCtx.strokeStyle = '#334b6b';
        cCtx.lineWidth = 2;
        cCtx.strokeRect(x + 7, y + 7, tile - 14, tile - 14);

        cCtx.strokeStyle = '#0a101b';
        cCtx.lineWidth = 1;
        cCtx.strokeRect(x + 14, y + 14, tile - 28, tile - 28);

        // Subtle axial brushed aluminum grain (aligned with deck seam axes)
        cCtx.strokeStyle = 'rgba(186, 210, 238, 0.055)';
        cCtx.lineWidth = 1;
        for (let by = y + 20; by < y + tile - 20; by += 7) {
          cCtx.beginPath();
          cCtx.moveTo(x + 18, by);
          cCtx.lineTo(x + tile - 18, by);
          cCtx.stroke();
        }

        // Recessed service louver grate on every 4th alternating bay plate
        if ((tx + ty) % 4 === 2) {
          cCtx.fillStyle = '#070c15';
          cCtx.fillRect(x + 22, y + 22, tile - 44, tile - 44);
          cCtx.strokeStyle = '#253954';
          cCtx.lineWidth = 2;
          for (let gy = y + 28; gy < y + tile - 24; gy += 7) {
            cCtx.beginPath();
            cCtx.moveTo(x + 26, gy);
            cCtx.lineTo(x + tile - 26, gy);
            cCtx.stroke();
          }
          // Subtle amber industrial hazard chevron bar on utility hatches
          cCtx.fillStyle = 'rgba(245, 158, 11, 0.28)';
          for (let hx = x + 26; hx < x + tile - 32; hx += 12) {
            cCtx.fillRect(hx, y + tile - 20, 6, 3);
          }
        } else if ((tx + ty) % 4 === 0) {
          // Recessed maintenance cross-seam + center inspection access cap
          cCtx.strokeStyle = '#0c1522';
          cCtx.lineWidth = 2;
          cCtx.beginPath();
          cCtx.moveTo(x + 16, y + tile * 0.5);
          cCtx.lineTo(x + tile - 16, y + tile * 0.5);
          cCtx.moveTo(x + tile * 0.5, y + 16);
          cCtx.lineTo(x + tile * 0.5, y + tile - 16);
          cCtx.stroke();
        }

        // Machined corner fastener sockets
        cCtx.fillStyle = '#060a12';
        const sockets = [
          [x + 12, y + 12],
          [x + tile - 12, y + 12],
          [x + 12, y + tile - 12],
          [x + tile - 12, y + tile - 12],
        ];
        for (const [sx, sy] of sockets) {
          cCtx.beginPath();
          cCtx.arc(sx, sy, 2.5, 0, Math.PI * 2);
          cCtx.fill();
        }

        // Crisp sector alignment micro-strips
        if ((tx + ty) % 2 === 0) {
          cCtx.fillStyle = 'rgba(56, 189, 248, 0.28)';
          cCtx.fillRect(x + 22, y + tile - 17, 24, 2);
        }
      }
    }
  }

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(10, 10);
  colorMap.anisotropy = maxAnisotropy;

  // Grayscale bump map for crisp panel relief, recessed grating & bevel seams
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');
  if (bCtx) {
    bCtx.fillStyle = '#929292';
    bCtx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += tile) {
      for (let x = 0; x < size; x += tile) {
        const tx = x / tile;
        const ty = y / tile;
        bCtx.strokeStyle = '#141414';
        bCtx.lineWidth = 6;
        bCtx.strokeRect(x + 2, y + 2, tile - 4, tile - 4);

        bCtx.strokeStyle = '#dcdcdc';
        bCtx.lineWidth = 2;
        bCtx.strokeRect(x + 7, y + 7, tile - 14, tile - 14);

        if ((tx + ty) % 4 === 2) {
          bCtx.fillStyle = '#343434';
          bCtx.fillRect(x + 22, y + 22, tile - 44, tile - 44);
        }
      }
    }
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(10, 10);
  bumpMap.anisotropy = maxAnisotropy;

  // High-contrast roughness variation map (matte seams & vents vs satin-brushed deck armor)
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d');
  if (rCtx) {
    rCtx.fillStyle = '#cfcfcf';
    rCtx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += tile) {
      for (let x = 0; x < size; x += tile) {
        const tx = x / tile;
        const ty = y / tile;
        rCtx.fillStyle = (tx + ty) % 2 === 0 ? '#4a4a4a' : '#646464';
        rCtx.fillRect(x + 8, y + 8, tile - 16, tile - 16);
        if ((tx + ty) % 4 === 2) {
          rCtx.fillStyle = '#b4b4b4';
          rCtx.fillRect(x + 22, y + 22, tile - 44, tile - 44);
        }
      }
    }
  }
  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(10, 10);
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
  beamConeMat: THREE.MeshBasicMaterial;
  loomLightShaftMat: THREE.MeshBasicMaterial;
  obstacleMeshes: THREE.Object3D[];
  obstacleMeshById: Map<string, THREE.Object3D>;
} {
  const { colorMap, bumpMap, roughnessMap } = createIndustrialDeckTextures(maxAnisotropy);
  const armorBump = createArmorDetailBumpTexture();
  const arenaRadius = GAME_CONFIG.arena.radius;

  // 0. GLSL Orbital Nebula Sky Dome (replaces flat background void with deep atmospheric horizon + subtle nebula bands)
  const skyDomeMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uZenith: { value: new THREE.Color(0x040812) },
      uHorizon: { value: new THREE.Color(0x10243d) },
      uNebula: { value: new THREE.Color(0x22d3ee) },
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
      varying vec3 vWorldDir;
      void main() {
        float h = clamp(vWorldDir.y * 0.5 + 0.5, 0.0, 1.0);
        float horizonBand = exp(-abs(vWorldDir.y - 0.04) * 5.2);
        vec3 baseSky = mix(uZenith, uHorizon, smoothstep(0.32, 0.56, h) * 0.85 + horizonBand * 0.55);
        float waveA = sin(vWorldDir.x * 5.5 + vWorldDir.z * 3.8 + uTime * 0.045) * 0.5 + 0.5;
        float waveB = sin(vWorldDir.z * 7.2 - vWorldDir.y * 6.0 - uTime * 0.03) * 0.5 + 0.5;
        float nebulaMask = smoothstep(-0.1, 0.45, vWorldDir.y) * (1.0 - smoothstep(0.55, 0.92, vWorldDir.y));
        float cloud = pow(waveA * waveB, 1.35) * nebulaMask;
        vec3 col = baseSky + uNebula * (cloud * 0.24 + horizonBand * 0.08);
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

  // 1. Main Layered Industrial Deck Floor
  const floorGeo = new THREE.CylinderGeometry(arenaRadius + 1.15, arenaRadius + 2.1, 0.9, 64);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: colorMap,
    bumpMap,
    bumpScale: 0.032,
    roughnessMap,
    roughness: 0.54,
    metalness: 0.5,
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

  // Low beveled Central Loom Dais rim (keeps player floor height clean while anchoring the central spire)
  const loomDaisMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(5.32, 5.56, 0.026, 48),
    conduitEdgeMat
  );
  loomDaisMesh.position.set(0, 0.013, -2);
  loomDaisMesh.receiveShadow = enableShadows;
  loomDaisMesh.updateMatrix();
  loomDaisMesh.matrixAutoUpdate = false;
  scene.add(loomDaisMesh);

  // Concentric Loom Floor Conduit Rings
  const loomCenterRingEdge = new THREE.Mesh(
    new THREE.RingGeometry(5.36, 5.92, 64),
    conduitEdgeMat
  );
  loomCenterRingEdge.rotation.x = -Math.PI / 2;
  loomCenterRingEdge.position.set(0, 0.016, -2);
  loomCenterRingEdge.updateMatrix();
  loomCenterRingEdge.matrixAutoUpdate = false;
  scene.add(loomCenterRingEdge);

  const loomCenterRingGlow = new THREE.Mesh(
    new THREE.RingGeometry(5.54, 5.7, 64),
    conduitGlowMat
  );
  loomCenterRingGlow.rotation.x = -Math.PI / 2;
  loomCenterRingGlow.position.set(0, 0.02, -2);
  loomCenterRingGlow.updateMatrix();
  loomCenterRingGlow.matrixAutoUpdate = false;
  scene.add(loomCenterRingGlow);

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
        float alpha = clamp((innerEdge * 0.55 + outerEdge * 0.45 + ticks * 0.55 + sweep * 0.4) * 0.34, 0.0, 0.28);
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

  // 3. Shared Environment PBR Materials (Calibrated Albedo + Roughness/Metalness Contrast + Vertex AO Materials)
  const obstacleMeshes: THREE.Object3D[] = [];
  const obstacleMeshById = new Map<string, THREE.Object3D>();

  const deepGraphiteMat = new THREE.MeshStandardMaterial({
    color: 0x1b2638,
    bumpMap: armorBump,
    bumpScale: 0.014,
    roughness: 0.46,
    metalness: 0.64,
  });
  const deepGraphiteAoMat = new THREE.MeshStandardMaterial({
    color: 0x1e2b3f,
    bumpMap: armorBump,
    bumpScale: 0.014,
    roughness: 0.48,
    metalness: 0.62,
    vertexColors: true,
  });
  const steelBlueMat = new THREE.MeshStandardMaterial({
    color: 0x334966,
    bumpMap: armorBump,
    bumpScale: 0.01,
    roughness: 0.28,
    metalness: 0.76,
  });
  const steelBlueAoMat = new THREE.MeshStandardMaterial({
    color: 0x354d6b,
    bumpMap: armorBump,
    bumpScale: 0.01,
    roughness: 0.3,
    metalness: 0.75,
    vertexColors: true,
  });
  const paleAlloyTrimMat = new THREE.MeshStandardMaterial({
    color: 0x8ea0b8,
    roughness: 0.22,
    metalness: 0.86,
  });
  const warmBronzeTrimMat = new THREE.MeshStandardMaterial({
    color: 0xc2610c,
    roughness: 0.28,
    metalness: 0.82,
  });
  const darkRubberMat = new THREE.MeshStandardMaterial({
    color: 0x0b111c,
    roughness: 0.82,
    metalness: 0.22,
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
  const wallBoxGeo = applyVerticalVertexAO(
    new RoundedBoxGeometry(4.9, 1.72, 0.82, 1, 0.12),
    0.46,
    1.0
  );
  const recessedPanelGeo = new RoundedBoxGeometry(3.86, 0.94, 0.88, 1, 0.08);
  const verticalRibGeo = new RoundedBoxGeometry(0.24, 1.68, 0.94, 1, 0.04);
  const topRailGeo = new RoundedBoxGeometry(5.36, 0.32, 0.98, 1, 0.1);
  const stanchionGeo = new RoundedBoxGeometry(0.78, 3.4, 1.12, 1, 0.12);
  const postCapGeo = new RoundedBoxGeometry(0.88, 0.26, 1.2, 1, 0.06);
  const bumperCylGeo = new THREE.CylinderGeometry(0.12, 0.12, 4.4, 10);
  bumperCylGeo.rotateZ(Math.PI / 2);
  const upperConduitGeo = new THREE.CylinderGeometry(0.065, 0.065, 4.6, 8);
  upperConduitGeo.rotateZ(Math.PI / 2);
  const braceStrutGeo = new RoundedBoxGeometry(0.24, 1.35, 0.32, 1, 0.04);
  const radialTrussGeo = new THREE.BoxGeometry(0.7, 0.46, 14.5);
  const sillLightGeo = new THREE.BoxGeometry(1.5, 0.055, 0.92);
  const archColumnGeo = new RoundedBoxGeometry(1.12, 11.4, 1.35, 1, 0.14);
  const archKneeGeo = new RoundedBoxGeometry(1.02, 0.82, 3.4, 1, 0.1);
  const archUpperBoomGeo = new RoundedBoxGeometry(0.86, 0.56, 4.8, 1, 0.08);
  const floodPodGeo = new RoundedBoxGeometry(0.95, 0.38, 0.58, 1, 0.06);
  const floodLensGeo = new THREE.BoxGeometry(0.76, 0.1, 0.42);
  const beamConeGeo = new THREE.CylinderGeometry(0.32, 2.5, 7.6, 16, 1, true);
  const archLightGeo = new THREE.BoxGeometry(0.18, 7.6, 0.18);
  const beaconCapGeo = new THREE.BoxGeometry(0.55, 0.12, 0.55);
  const ventHousingGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.2, 14);
  ventHousingGeo.rotateX(Math.PI / 2);
  const fanBladeGeo = new THREE.BoxGeometry(0.72, 0.11, 0.035);
  const hatchDoorGeo = new RoundedBoxGeometry(1.18, 0.84, 0.14, 1, 0.04);
  const hatchLatchGeo = new THREE.BoxGeometry(0.18, 0.08, 0.16);
  const monitorFrameGeo = new RoundedBoxGeometry(1.52, 0.72, 0.14, 1, 0.04);
  const monitorScreenGeo = new THREE.PlaneGeometry(1.36, 0.54);

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
  const vRibInst = createStaticInstanced(verticalRibGeo, paleAlloyTrimMat, numSegments * 2);
  const lowerPipeInst = createStaticInstanced(bumperCylGeo, paleAlloyTrimMat, numSegments);
  const upperPipeInst = createStaticInstanced(upperConduitGeo, warmBronzeTrimMat, numSegments);
  const topRailInst = createStaticInstanced(topRailGeo, paleAlloyTrimMat, numSegments);
  const postInst = createStaticInstanced(stanchionGeo, steelBlueMat, numSegments);
  const deckBraceInst = createStaticInstanced(braceStrutGeo, paleAlloyTrimMat, numSegments);
  const postCapInst = createStaticInstanced(postCapGeo, paleAlloyTrimMat, numSegments);
  const sillLightInst = createStaticInstanced(sillLightGeo, cyanEmissiveMat, numSegments);

  const ventCount = 4; // i % 4 === 1
  const hatchCount = 4; // i % 4 === 2
  const monitorCount = 4; // i % 4 === 3
  const archCount = 4; // i % 4 === 0

  const ventHousingInst = createStaticInstanced(ventHousingGeo, darkRubberMat, ventCount);
  const hatchInst = createStaticInstanced(hatchDoorGeo, deepGraphiteMat, hatchCount);
  const hatchLatchInst = createStaticInstanced(hatchLatchGeo, hazardAmberMat, hatchCount * 2);
  const monitorFrameInst = createStaticInstanced(monitorFrameGeo, deepGraphiteMat, monitorCount);
  const archRibInst = createStaticInstanced(archColumnGeo, deepGraphiteMat, archCount);
  const archKneeInst = createStaticInstanced(archKneeGeo, steelBlueMat, archCount);
  const archBoomInst = createStaticInstanced(archUpperBoomGeo, steelBlueMat, archCount);
  const floodPodInst = createStaticInstanced(floodPodGeo, deepGraphiteMat, archCount);
  const floodLensInst = createStaticInstanced(floodLensGeo, cyanEmissiveMat, archCount);
  const beamConeInst = createStaticInstanced(beamConeGeo, beamConeMat, archCount);
  const archLightInst = createStaticInstanced(archLightGeo, cyanEmissiveMat, archCount);
  const beaconCapInst = createStaticInstanced(beaconCapGeo, hazardAmberMat, archCount);

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
  let monIdx = 0;
  let archIdx = 0;

  for (let i = 0; i < numSegments; i++) {
    const angle = (i / numSegments) * Math.PI * 2;
    const dist = arenaRadius + 0.35;
    segPivot.position.set(Math.sin(angle) * dist, 0, Math.cos(angle) * dist);
    segPivot.rotation.set(0, angle, 0);
    segPivot.updateMatrixWorld(true);

    setInstPart(trussInst, i, 0, -1.05, 7.2);
    setInstPart(baseWallInst, i, 0, 0.86, 0);
    setInstPart(insetPanelInst, i, 0, 0.9, 0);
    setInstPart(vRibInst, vRibIdx++, -1.75, 0.88, -0.02);
    setInstPart(vRibInst, vRibIdx++, 1.75, 0.88, -0.02);
    setInstPart(lowerPipeInst, i, 0, 0.26, -0.44);
    setInstPart(upperPipeInst, i, 0, 1.6, -0.45);
    setInstPart(topRailInst, i, 0, 1.84, 0);
    setInstPart(postInst, i, 2.65, 1.7, 0);
    setInstPart(deckBraceInst, i, 2.65, 0.56, -0.6, 0.42, 0, 0);
    setInstPart(postCapInst, i, 2.65, 3.45, 0);
    setInstPart(sillLightInst, i, 0, 1.5, 0);

    if (i % 4 === 1) {
      setInstPart(ventHousingInst, ventIdx++, 0, 0.9, -0.4);
      const fanAnchor = new THREE.Group();
      fanAnchor.position.copy(segPivot.position);
      fanAnchor.rotation.y = angle;
      fanAnchor.updateMatrix();
      fanAnchor.matrixAutoUpdate = false;

      const fanRotor = new THREE.Mesh(fanBladeGeo, paleAlloyTrimMat);
      fanRotor.position.set(0, 0.9, -0.46);
      const crossBlade = new THREE.Mesh(fanBladeGeo, paleAlloyTrimMat);
      crossBlade.rotation.z = Math.PI * 0.5;
      crossBlade.updateMatrix();
      crossBlade.matrixAutoUpdate = false;
      fanRotor.add(crossBlade);
      fanAnchor.add(fanRotor);
      scene.add(fanAnchor);
      ventFanMeshes.push(fanRotor);
    } else if (i % 4 === 2) {
      setInstPart(hatchInst, hatchIdx++, 0, 0.88, -0.43);
      for (const ly of [0.7, 1.06]) {
        setInstPart(hatchLatchInst, latchIdx++, 0.46, ly, -0.46);
      }
    } else if (i % 4 === 3) {
      setInstPart(monitorFrameInst, monIdx++, 0, 0.92, -0.43);
      localObj.position.set(0, 0.92, -0.51);
      localObj.rotation.set(0, Math.PI, 0);
      localObj.scale.set(1, 1, 1);
      localObj.updateMatrixWorld(true);
      const screen = new THREE.Mesh(
        monitorScreenGeo,
        i % 8 === 3 ? signBay04 : signCalSector
      );
      localObj.matrixWorld.decompose(screen.position, screen.quaternion, screen.scale);
      screen.updateMatrix();
      screen.matrixAutoUpdate = false;
      scene.add(screen);
    }

    if (i % 4 === 0) {
      setInstPart(archRibInst, archIdx, 0, 5.6, 1.45);
      setInstPart(archKneeInst, archIdx, 0, 10.6, 0.15);
      setInstPart(archBoomInst, archIdx, 0, 11.2, -1.65, -0.18, 0, 0);
      setInstPart(floodPodInst, archIdx, 0, 8.6, 0.55, 0.34, 0, 0);
      setInstPart(floodLensInst, archIdx, 0, 8.42, 0.48, 0.34, 0, 0);
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
    hatchLatchInst,
    monitorFrameInst,
    archRibInst,
    archKneeInst,
    archBoomInst,
    floodPodInst,
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
      varying vec3 vNormalDir;
      varying vec3 vViewPos;
      varying vec3 vLocalPos;
      void main() {
        vec3 n = normalize(vNormalDir);
        vec3 v = normalize(vViewPos);
        vec3 lightDir = normalize(vec3(0.62, 0.56, 0.52));
        float ndl = clamp(dot(n, lightDir) * 0.85 + 0.18, 0.0, 1.0);
        float lat = vLocalPos.y;
        float band = sin(lat * 20.0 + sin(vLocalPos.x * 5.2 + uTime * 0.04) * 0.72) * 0.5 + 0.5;
        vec3 deepBody = vec3(0.055, 0.095, 0.175);
        vec3 stormBand = mix(vec3(0.10, 0.21, 0.34), uAccent * 0.52, 0.45);
        vec3 baseCol = mix(deepBody, stormBand, band);
        float fresnel = pow(clamp(1.0 - max(dot(n, v), 0.0), 0.0, 1.0), 2.35);
        vec3 rim = uAccent * (fresnel * 0.88 * (0.45 + ndl * 0.55));
        vec3 finalCol = baseCol * (0.28 + ndl * 0.92) + rim;
        gl_FragColor = vec4(finalCol, 1.0);
      }
    `,
    fog: false,
  });

  const orbitalPlanetMesh = new THREE.Mesh(
    new THREE.SphereGeometry(16.5, 36, 26),
    planetMat
  );
  orbitalPlanetMesh.position.set(-24, 11.5, -45);
  orbitalVistaGroup.add(orbitalPlanetMesh);

  const planetRingMat = new THREE.ShaderMaterial({
    uniforms: {
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
      uniform vec3 uAccent;
      varying vec3 vLocalPos;
      void main() {
        float r = length(vLocalPos.xy);
        float normR = clamp((r - 20.0) / 9.5, 0.0, 1.0);
        float bands = sin(normR * 30.0) * 0.5 + 0.5;
        float gap = smoothstep(0.42, 0.46, normR) * (1.0 - smoothstep(0.52, 0.56, normR));
        float edgeFade = smoothstep(0.0, 0.16, normR) * (1.0 - smoothstep(0.84, 1.0, normR));
        float alpha = edgeFade * (1.0 - gap * 0.85) * (0.24 + bands * 0.32);
        vec3 col = mix(vec3(0.22, 0.34, 0.52), uAccent * 0.78, bands * 0.68);
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  });

  const planetRingMesh = new THREE.Mesh(
    new THREE.RingGeometry(20.0, 29.5, 64),
    planetRingMat
  );
  planetRingMesh.position.copy(orbitalPlanetMesh.position);
  planetRingMesh.rotation.set(Math.PI * 0.38, 0.2, -0.24);
  orbitalVistaGroup.add(planetRingMesh);

  // Drifting Distant Orbital Drydock Arcs & Relay Beacons (outer Layer 1 silhouettes, fog-exempt)
  const orbitalDrydockGroup = new THREE.Group();
  orbitalDrydockGroup.name = 'NadirOrbitalDrydockGroup';
  const drydockHullMat = new THREE.MeshStandardMaterial({
    color: 0x1e2c42,
    roughness: 0.48,
    metalness: 0.72,
    fog: false,
  });
  const drydockNavMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    fog: false,
  });
  const drydockArcGeo = new THREE.BoxGeometry(11.5, 1.35, 1.85);
  const drydockSpineGeo = new THREE.BoxGeometry(1.1, 4.8, 1.2);
  const drydockNavGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
  for (let d = 0; d < 4; d++) {
    const orbitAngle = (d / 4) * Math.PI * 2 + 0.42;
    const dRadius = 52;
    const dPivot = new THREE.Group();
    dPivot.position.set(
      Math.sin(orbitAngle) * dRadius,
      6.8 + (d % 2) * 3.4,
      Math.cos(orbitAngle) * dRadius
    );
    dPivot.rotation.y = orbitAngle;
    const arcHull = new THREE.Mesh(drydockArcGeo, drydockHullMat);
    const spine = new THREE.Mesh(drydockSpineGeo, drydockHullMat);
    spine.position.set(3.8 * (d % 2 === 0 ? 1 : -1), 0.4, 0);
    const navA = new THREE.Mesh(drydockNavGeo, drydockNavMat);
    navA.position.set(-5.2, 0.75, 0);
    const navB = new THREE.Mesh(drydockNavGeo, drydockNavMat);
    navB.position.set(5.2, 0.75, 0);
    dPivot.add(arcHull, spine, navA, navB);
    orbitalDrydockGroup.add(dPivot);
  }
  orbitalVistaGroup.add(orbitalDrydockGroup);

  // 4 Outer Station Superstructure Trusses & Diagonal Sub-Deck Trench Turbine Wells
  const superTrussGeo = new THREE.BoxGeometry(1.8, 16.5, 2.2);
  const turbineRimGeo = new THREE.TorusGeometry(2.55, 0.22, 10, 28);
  const turbineBladeGeo = new THREE.BoxGeometry(4.3, 0.12, 0.46);
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

    // Sub-Deck Maintenance Trench Turbine Well (r = 26.5m, y = -1.75m)
    const wx = Math.sin(diagAngle) * 26.5;
    const wz = Math.cos(diagAngle) * 26.5;
    const wellRim = new THREE.Mesh(turbineRimGeo, steelBlueMat);
    wellRim.rotation.x = Math.PI / 2;
    wellRim.position.set(wx, -1.72, wz);
    orbitalVistaGroup.add(wellRim);

    const turbineHub = new THREE.Group();
    turbineHub.position.set(wx, -1.84, wz);
    const bladeA = new THREE.Mesh(turbineBladeGeo, paleAlloyTrimMat);
    const bladeB = new THREE.Mesh(turbineBladeGeo, paleAlloyTrimMat);
    bladeB.rotation.y = Math.PI * 0.5;
    turbineHub.add(bladeA, bladeB);
    orbitalVistaGroup.add(turbineHub);
    subDeckFans.push(turbineHub);
  }

  // 2 Recessed Sub-Deck Reactor Grate Inspection Windows on the North Deck Floor ((±4.4, 0, -12.6))
  const grateFrameGeo = new THREE.BoxGeometry(2.35, 0.04, 0.14);
  const grateBarGeo = new THREE.BoxGeometry(2.08, 0.024, 0.055);
  const gratePaneMat = new THREE.MeshBasicMaterial({
    color: 0x040912,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  const subDeckCoolantMat = new THREE.MeshBasicMaterial({
    color: 0x0891b2,
    transparent: true,
    opacity: 0.45,
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

    const coolantPipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 2.0, 10),
      subDeckCoolantMat
    );
    coolantPipe.rotation.z = Math.PI / 2;
    coolantPipe.position.y = -0.45;
    grateGroup.add(coolantPipe);

    const underRotor = new THREE.Group();
    underRotor.position.y = -0.3;
    const rb1 = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.05, 0.22), paleAlloyTrimMat);
    const rb2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 1.55), paleAlloyTrimMat);
    underRotor.add(rb1, rb2);
    grateGroup.add(underRotor);
    subDeckFans.push(underRotor);

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

  // 4 Cantilevered Perimeter Overhead Gantry Cranes (perimeter only r > 19m, y = 9.4–10.8m -> zero camera clipping)
  const gantryBoomGeo = new RoundedBoxGeometry(1.1, 0.68, 3.2, 1, 0.08);
  const gantryHoistGeo = new THREE.BoxGeometry(0.62, 0.42, 0.9);
  for (let i = 0; i < 4; i++) {
    const archAngle = (i * Math.PI) / 2;
    const gantryPivot = new THREE.Group();
    gantryPivot.position.set(
      Math.sin(archAngle) * (arenaRadius - 0.8),
      9.95,
      Math.cos(archAngle) * (arenaRadius - 0.8)
    );
    gantryPivot.rotation.y = archAngle;
    const boom = new THREE.Mesh(gantryBoomGeo, deepGraphiteMat);
    const hoist = new THREE.Mesh(gantryHoistGeo, warmBronzeTrimMat);
    hoist.position.set(0, -0.45, -1.0);
    const gantryLamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.08, 0.22),
      tealSubtleMat
    );
    gantryLamp.position.set(0, -0.68, -1.0);
    gantryPivot.add(boom, hoist, gantryLamp);
    orbitalVistaGroup.add(gantryPivot);
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
      loomPylonGroup = group;
      const lowerPlinth = new THREE.Mesh(
        applyVerticalVertexAO(
          new THREE.CylinderGeometry(obs.radius * 1.06, obs.radius * 1.16, 0.5, 24),
          0.42,
          1.0
        ),
        deepGraphiteAoMat
      );
      lowerPlinth.position.y = 0.25;
      lowerPlinth.castShadow = enableShadows;
      lowerPlinth.receiveShadow = enableShadows;
      group.add(lowerPlinth);

      const upperPlinth = new THREE.Mesh(
        applyVerticalVertexAO(
          new THREE.CylinderGeometry(obs.radius * 0.9, obs.radius * 1.02, 0.56, 24),
          0.54,
          1.0
        ),
        steelBlueAoMat
      );
      upperPlinth.position.y = 0.74;
      upperPlinth.castShadow = enableShadows;
      group.add(upperPlinth);

      // 4 Stabilizer Buttress Struts anchoring the Chronicle Loom Core to its armored plinth
      const strutGeo = new RoundedBoxGeometry(0.2, 1.35, 0.34, 1, 0.04);
      for (let s = 0; s < 4; s++) {
        const sAngle = (s / 4) * Math.PI * 2;
        const strutPivot = new THREE.Group();
        strutPivot.rotation.y = sAngle;
        const strut = new THREE.Mesh(strutGeo, steelBlueMat);
        strut.position.set(0, 0.85, obs.radius * 0.84);
        strut.rotation.x = 0.42;
        strutPivot.add(strut);
        group.add(strutPivot);
      }

      const baseGlowRing = new THREE.Mesh(
        new THREE.TorusGeometry(obs.radius * 0.96, 0.05, 12, 36),
        cyanEmissiveMat
      );
      baseGlowRing.rotation.x = Math.PI / 2;
      baseGlowRing.position.y = 0.52;
      group.add(baseGlowRing);

      const coreColumn = new THREE.Mesh(
        new THREE.CylinderGeometry(obs.radius * 0.54, obs.radius * 0.66, obs.height, 24),
        steelBlueMat
      );
      coreColumn.position.y = obs.height * 0.5;
      coreColumn.castShadow = enableShadows;
      coreColumn.receiveShadow = enableShadows;
      group.add(coreColumn);

      const innerPlasmaCore = new THREE.Mesh(
        new THREE.CylinderGeometry(obs.radius * 0.57, obs.radius * 0.57, 2.35, 24),
        cyanEmissiveMat
      );
      innerPlasmaCore.position.y = 2.6;
      group.add(innerPlasmaCore);

      for (const cy of [1.65, 2.6, 3.55]) {
        const cageRing = new THREE.Mesh(
          new THREE.TorusGeometry(obs.radius * 0.62, 0.04, 10, 28),
          warmBronzeTrimMat
        );
        cageRing.rotation.x = Math.PI / 2;
        cageRing.position.y = cy;
        group.add(cageRing);
      }

      const upperCrown = new THREE.Mesh(
        new THREE.CylinderGeometry(obs.radius * 0.84, obs.radius * 0.58, 1.15, 20),
        paleAlloyTrimMat
      );
      upperCrown.position.y = obs.height - 0.45;
      group.add(upperCrown);

      for (let f = 0; f < 4; f++) {
        const finAngle = (f / 4) * Math.PI * 2 + Math.PI / 4;
        const finPivot = new THREE.Group();
        finPivot.rotation.y = finAngle;
        const finMesh = new THREE.Mesh(loomFinGeo, paleAlloyTrimMat);
        finMesh.position.set(0, 2.65, obs.radius * 0.68);
        finMesh.castShadow = enableShadows;
        finPivot.add(finMesh);

        const finNode = new THREE.Mesh(
          new RoundedBoxGeometry(0.16, 0.52, 0.2, 2, 0.04),
          hazardAmberMat
        );
        finNode.position.set(0, 1.65, obs.radius * 1.08);
        finPivot.add(finNode);

        group.add(finPivot);
      }

      const outerGyroMat = new THREE.MeshStandardMaterial({
        color: 0xcbd5e1,
        roughness: 0.2,
        metalness: 0.88,
      });
      loomOuterRingMesh = new THREE.Mesh(
        new THREE.TorusGeometry(obs.radius * 1.34, 0.085, 16, 48),
        outerGyroMat
      );
      loomOuterRingMesh.position.y = 4.35;
      loomOuterRingMesh.rotation.x = Math.PI * 0.22;
      group.add(loomOuterRingMesh);

      loomRingMesh = new THREE.Mesh(
        new THREE.TorusGeometry(obs.radius * 1.14, 0.098, 16, 48),
        cyanEmissiveMat
      );
      loomRingMesh.position.y = 4.35;
      loomRingMesh.rotation.x = Math.PI * 0.36;
      group.add(loomRingMesh);

      loomInnerRingMesh = new THREE.Mesh(
        new THREE.TorusGeometry(obs.radius * 0.92, 0.065, 12, 36),
        hazardAmberMat
      );
      loomInnerRingMesh.position.y = 4.35;
      loomInnerRingMesh.rotation.y = Math.PI * 0.3;
      group.add(loomInnerRingMesh);
    } else {
      // High-Detail Conduit Cover Pillar with Analytical Base Vertex-AO Grounding
      const basePedestal = new THREE.Mesh(
        applyVerticalVertexAO(
          new THREE.CylinderGeometry(obs.radius * 0.94, obs.radius * 1.04, 0.56, 20),
          0.42,
          1.0
        ),
        steelBlueAoMat
      );
      basePedestal.position.y = 0.28;
      basePedestal.castShadow = enableShadows;
      basePedestal.receiveShadow = enableShadows;
      group.add(basePedestal);

      const baseCollar = new THREE.Mesh(
        new THREE.TorusGeometry(obs.radius * 0.9, 0.06, 12, 32),
        paleAlloyTrimMat
      );
      baseCollar.rotation.x = Math.PI / 2;
      baseCollar.position.y = 0.56;
      group.add(baseCollar);

      const mainShaft = new THREE.Mesh(
        applyVerticalVertexAO(
          new THREE.CylinderGeometry(obs.radius * 0.72, obs.radius * 0.76, obs.height - 0.8, 24),
          0.52,
          1.0
        ),
        deepGraphiteAoMat
      );
      mainShaft.position.y = obs.height * 0.5;
      mainShaft.castShadow = enableShadows;
      mainShaft.receiveShadow = enableShadows;
      group.add(mainShaft);

      for (let r = 0; r < 4; r++) {
        const rAngle = (r / 4) * Math.PI * 2;
        const rib = new THREE.Mesh(pillarRibGeo, paleAlloyTrimMat);
        rib.position.set(
          Math.sin(rAngle) * (obs.radius * 0.72),
          obs.height * 0.48,
          Math.cos(rAngle) * (obs.radius * 0.72)
        );
        rib.rotation.y = rAngle;
        group.add(rib);

        const clamp = new THREE.Mesh(pillarClampGeo, warmBronzeTrimMat);
        clamp.position.set(
          Math.sin(rAngle) * (obs.radius * 0.74),
          1.25,
          Math.cos(rAngle) * (obs.radius * 0.74)
        );
        clamp.rotation.y = rAngle;
        group.add(clamp);
      }

      const cyanBand = new THREE.Mesh(
        new THREE.CylinderGeometry(obs.radius * 0.76, obs.radius * 0.76, 0.24, 20),
        cyanEmissiveMat
      );
      cyanBand.position.y = 2.15;
      group.add(cyanBand);

      const amberBand = new THREE.Mesh(
        new THREE.CylinderGeometry(obs.radius * 0.75, obs.radius * 0.75, 0.1, 20),
        hazardAmberMat
      );
      amberBand.position.y = 3.65;
      group.add(amberBand);

      const topCrown = new THREE.Mesh(
        new THREE.CylinderGeometry(obs.radius * 0.92, obs.radius * 0.78, 0.54, 18),
        paleAlloyTrimMat
      );
      topCrown.position.y = obs.height - 0.27;
      group.add(topCrown);

      const topDome = new THREE.Mesh(
        new THREE.SphereGeometry(obs.radius * 0.64, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
        steelBlueMat
      );
      topDome.position.y = obs.height;
      group.add(topDome);

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

  if (chapter === 'prologue') {
    for (const [gx, gz] of [[-12.4, -5], [12.4, -5], [0, -16.2]] as const) {
      const gantry = new THREE.Group();
      gantry.position.set(gx, 0, gz);
      group.add(gantry);
      for (const side of [-1, 1]) {
        mesh(gantry, postGeo, structureMat, side * 1.55, 2.1, 0);
        box(gantry, accentMat, side * 1.55, 0.42, 0.1, 0.52, 0.28, 0.58);
      }
      mesh(gantry, beamGeo, shellMat, 0, 4.18, 0);
      const scanner = box(gantry, glowMat, 0, 3.84, 0.02, 2.6, 0.08, 0.16, 0.015);
      rotors.push(scanner);
      const scanField = mesh(gantry, new THREE.PlaneGeometry(2.8, 3.2), pulseMat, 0, 2.05, 0.05);
      scanField.rotation.y = Math.PI;
    }
    const echoHalo = mesh(group, new THREE.TorusGeometry(2.15, 0.035, 8, 36), glowMat, -4.8, 0.05, 1.5);
    echoHalo.rotation.x = Math.PI / 2;
    rotors.push(echoHalo);
    const diagPylon = new THREE.Group();
    diagPylon.position.set(-12.2, 0, -11.4);
    group.add(diagPylon);
    box(diagPylon, structureMat, 0, 1.35, 0, 0.65, 2.7, 0.65, 0.05);
    const diagCrystal = mesh(diagPylon, crystalGeo, glowMat, 0, 3.05, 0);
    rotors.push(diagCrystal);
  } else if (chapter === 'chapter_1_helix') {
    const ribGeo = new RoundedBoxGeometry(0.54, 7.2, 0.72, 3, 0.08);
    const boltGeo = new THREE.CylinderGeometry(0.32, 0.32, 2.1, 12);
    for (const side of [-1, 1]) {
      const door = new THREE.Group();
      door.position.set(side * 8.4, 0, -15.8);
      group.add(door);
      for (let r = 0; r < 5; r++) {
        mesh(door, ribGeo, r % 2 === 0 ? structureMat : shellMat, (r - 2) * 0.74, 3.6, 0);
      }
      const bolt = mesh(door, boltGeo, accentMat, 0, 3.1, 0.48);
      bolt.rotation.z = Math.PI / 2;
      rotors.push(bolt);
      for (const braceSide of [-1, 1]) {
        const brace = box(door, structureMat, braceSide * 2.3, 2.3, 0.3, 0.46, 5.1, 0.62);
        brace.rotation.z = braceSide * 0.34;
      }
    }
    for (const side of [-1, 1]) {
      for (const z of [-3.5, 6.2]) {
        const pylon = new THREE.Group();
        pylon.position.set(side * 14.8, 0, z);
        group.add(pylon);
        mesh(pylon, new THREE.CylinderGeometry(0.48, 0.68, 3.4, 10), structureMat, 0, 1.7, 0);
        for (const y of [0.8, 2.3, 3.25]) {
          const collar = mesh(pylon, new THREE.TorusGeometry(0.58, 0.07, 8, 20), y === 2.3 ? glowMat : accentMat, 0, y, 0);
          collar.rotation.x = Math.PI / 2;
        }
      }
    }
    const lockdownBeacon = new THREE.Group();
    lockdownBeacon.position.set(-12.6, 0, -11.8);
    group.add(lockdownBeacon);
    box(lockdownBeacon, structureMat, 0, 1.4, 0, 0.72, 2.8, 0.72, 0.05);
    const lockRing = mesh(lockdownBeacon, new THREE.TorusGeometry(0.68, 0.05, 8, 24), accentMat, 0, 2.95, 0);
    lockRing.rotation.x = Math.PI * 0.35;
    rotors.push(lockRing);
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
    for (const side of [-1, 1]) {
      const organ = new THREE.Group();
      organ.position.set(side * 12.6, 0, -9.8);
      group.add(organ);
      box(organ, structureMat, 0, 0.36, 0, 2.2, 0.72, 1.15, 0.08);
      for (let p = 0; p < 7; p++) {
        const h = 2.8 + (3 - Math.abs(p - 3)) * 0.72;
        const pipe = mesh(organ, pipeGeo, p === 3 ? glowMat : shellMat, (p - 3) * 0.28, h * 0.5 + 0.65, 0);
        pipe.scale.y = h;
        mesh(organ, new THREE.ConeGeometry(0.16, 0.34, 10), accentMat, (p - 3) * 0.28, h + 0.82, 0);
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
    const sanctumChime = mesh(group, crystalGeo, accentMat, 13.8, 2.4, 9.6);
    sanctumChime.scale.set(0.85, 1.65, 0.85);
    rotors.push(sanctumChime);
  } else if (chapter === 'chapter_3_curator') {
    const slabGeo = new RoundedBoxGeometry(0.82, 0.42, 0.72, 2, 0.045);
    for (const side of [-1, 1]) {
      for (const z of [-11.5, -3.5]) {
        const rack = new THREE.Group();
        rack.position.set(side * 14.4, 0, z);
        group.add(rack);
        box(rack, structureMat, 0, 2.2, 0, 1.35, 4.4, 1.0, 0.08);
        for (let s = 0; s < 6; s++) {
          const slab = mesh(rack, slabGeo, s % 2 === 0 ? shellMat : accentMat, 0, 0.62 + s * 0.62, 0.58);
          slab.rotation.y = (s % 2 === 0 ? -1 : 1) * 0.1;
        }
        const crystal = mesh(rack, crystalGeo, glowMat, 0, 4.95, 0);
        crystal.scale.set(0.72, 1.7, 0.62);
        rotors.push(crystal);
      }
      for (let r = 0; r < 4; r++) {
        const slab = box(group, r % 2 === 0 ? shellMat : structureMat, side * (4.8 + r * 0.72), 2.1 + r * 0.46, -15.6, 0.58, 1.35, 0.24, 0.03);
        slab.rotation.z = side * (0.08 + r * 0.03);
      }
    }
    const vaultMonolith = new THREE.Group();
    vaultMonolith.position.set(-13.8, 0, 9.4);
    group.add(vaultMonolith);
    box(vaultMonolith, structureMat, 0, 1.5, 0, 0.85, 3.0, 0.85, 0.06);
    const unindexedOrb = mesh(vaultMonolith, crystalGeo, glowMat, 0, 3.45, 0);
    unindexedOrb.scale.set(0.95, 1.85, 0.95);
    rotors.push(unindexedOrb);
  } else if (chapter === 'chapter_4_matron') {
    for (const side of [-1, 1]) {
      for (const z of [-9.5, -1.5]) {
        const pod = new THREE.Group();
        pod.position.set(side * 14.2, 0, z);
        group.add(pod);
        mesh(pod, new THREE.CylinderGeometry(0.58, 0.72, 3.5, 16), structureMat, 0, 1.75, 0);
        for (const y of [0.32, 3.3]) {
          mesh(pod, new THREE.CylinderGeometry(0.82, 0.82, 0.26, 16), shellMat, 0, y, 0);
        }
        for (const panelSide of [-1, 1]) {
          const panel = box(pod, shellMat, panelSide * 0.62, 1.82, 0, 0.18, 2.45, 0.82, 0.06);
          panel.rotation.z = -panelSide * 0.08;
        }
        const scan = mesh(pod, new THREE.TorusGeometry(0.73, 0.04, 8, 24), glowMat, 0, 2.0, 0);
        scan.rotation.x = Math.PI / 2;
        rotors.push(scan);
        box(pod, shellMat, 0, 4.5, 0, 2.5, 0.16, 1.15, 0.04);
        box(pod, glowMat, 0, 4.38, 0, 1.75, 0.06, 0.72, 0.015);
      }
    }
    const cradleBeacon = mesh(group, new THREE.TorusGeometry(1.9, 0.045, 8, 32), glowMat, 12.6, 0.06, 9.2);
    cradleBeacon.rotation.x = Math.PI / 2;
    rotors.push(cradleBeacon);
  } else {
    for (const side of [-1, 1]) {
      for (const z of [-11.0, 3.8]) {
        const sealTower = new THREE.Group();
        sealTower.position.set(side * 14.2, 0, z);
        group.add(sealTower);
        mesh(sealTower, new THREE.CylinderGeometry(0.38, 0.58, 4.4, 12), structureMat, 0, 2.2, 0);
        const crown = mesh(sealTower, new THREE.TorusGeometry(0.82, 0.055, 10, 32), accentMat, 0, 4.45, 0);
        crown.rotation.x = 0.36;
        rotors.push(crown);
        const crystal = mesh(sealTower, crystalGeo, glowMat, 0, 4.48, 0);
        crystal.scale.set(0.7, 1.45, 0.7);
      }
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

  // Ground Contact Shadow Disc
  const contactShadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.88, 32),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
    })
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.015;
  root.add(contactShadow);

  // Calibrated Sera Venn PBR Materials:
  // 1. Dark Navy Tech Undersuit (Matte, low metalness)
  const navySuitMat = new THREE.MeshStandardMaterial({
    color: 0x17253b,
    bumpMap: armorBump,
    bumpScale: 0.008,
    roughness: 0.74,
    metalness: 0.22,
  });
  // 2. Pale Silver-Titanium Contoured Armor Plates (Crisp metallic sheen)
  const silverArmorMat = new THREE.MeshStandardMaterial({
    color: 0xe2eaf4,
    bumpMap: armorBump,
    bumpScale: 0.006,
    roughness: 0.2,
    metalness: 0.78,
  });
  // 3. Dark Graphite Mechanical Joints & Greave Frames
  const graphiteJointMat = new THREE.MeshStandardMaterial({
    color: 0x2c3b50,
    roughness: 0.44,
    metalness: 0.72,
  });
  // 4. Warm Bronze/Gold Equipment Clasps & Actuators
  const warmBronzeMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.26,
    metalness: 0.86,
  });
  // 5. Dark Reflective Visor Glass
  const darkVisorMat = new THREE.MeshStandardMaterial({
    color: 0x06162c,
    emissive: 0x0891b2,
    emissiveIntensity: 0.65,
    roughness: 0.08,
    metalness: 0.92,
  });
  // 6. Cyan Chrono Rig Luminescent Energy
  const chronoCyanMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.5,
    roughness: 0.14,
    metalness: 0.4,
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

  // --- 3. Articulated Dorsal Chrono Rig Pivot (Secondary Motion & Spring Lag) ---
  const chronoRigPivot = new THREE.Group();
  chronoRigPivot.position.set(0, 0.32, -0.2);
  torsoPivot.add(chronoRigPivot);

  const spineMount = new THREE.Mesh(
    new RoundedBoxGeometry(0.29, 0.42, 0.18, 3, 0.05),
    graphiteJointMat
  );
  chronoRigPivot.add(spineMount);

  for (const side of [-1, 1]) {
    const capacitorCell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.29, 12),
      warmBronzeMat
    );
    capacitorCell.position.set(side * 0.145, 0, -0.04);
    capacitorCell.rotation.z = side * 0.15;
    chronoRigPivot.add(capacitorCell);

    const capacitorGlow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.053, 0.053, 0.13, 12),
      chronoCyanMat
    );
    capacitorGlow.position.set(side * 0.145, 0, -0.04);
    capacitorGlow.rotation.z = side * 0.15;
    chronoRigPivot.add(capacitorGlow);
  }

  const outerRigFrame = new THREE.Mesh(
    new THREE.TorusGeometry(0.4, 0.03, 12, 36, Math.PI * 1.65),
    silverArmorMat
  );
  outerRigFrame.rotation.z = Math.PI * 0.175;
  outerRigFrame.position.set(0, 0, -0.08);
  chronoRigPivot.add(outerRigFrame);

  const chronoRingMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.335, 0.044, 14, 36),
    chronoCyanMat
  );
  chronoRingMesh.position.set(0, 0, -0.09);
  chronoRigPivot.add(chronoRingMesh);

  const chronoInnerRingMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.225, 0.024, 10, 28),
    warmBronzeMat
  );
  chronoInnerRingMesh.position.set(0, 0, -0.09);
  chronoRigPivot.add(chronoInnerRingMesh);

  // 4 Radial Node Clasps on the Chrono Rig
  for (let c = 0; c < 4; c++) {
    const ca = (c / 4) * Math.PI * 2 + Math.PI / 4;
    const clasp = new THREE.Mesh(
      new RoundedBoxGeometry(0.072, 0.115, 0.095, 2, 0.02),
      warmBronzeMat
    );
    clasp.position.set(Math.cos(ca) * 0.34, Math.sin(ca) * 0.34, -0.09);
    clasp.rotation.z = ca + Math.PI / 2;
    chronoRigPivot.add(clasp);
  }

  // --- 4. Sculpted Rounded Helmet & Reflective Curved Visor ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.72, 0.02);
  torsoPivot.add(headGroup);

  const neckMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.105, 0.16, 14),
    navySuitMat
  );
  neckMesh.position.set(0, -0.14, -0.01);
  headGroup.add(neckMesh);

  const helmetDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.208, 24, 20),
    silverArmorMat
  );
  helmetDome.scale.set(0.94, 1.04, 1.08);
  helmetDome.castShadow = enableShadows;
  headGroup.add(helmetDome);

  const helmetCrest = new THREE.Mesh(
    new RoundedBoxGeometry(0.09, 0.14, 0.36, 3, 0.035),
    graphiteJointMat
  );
  helmetCrest.position.set(0, 0.15, -0.02);
  helmetCrest.rotation.x = -0.15;
  headGroup.add(helmetCrest);

  // Wrap-around Dark Reflective Visor + Thin Cyan Optics Strip
  const visorMesh = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.198,
      20,
      16,
      -Math.PI * 0.36,
      Math.PI * 0.72,
      Math.PI * 0.32,
      Math.PI * 0.32
    ),
    darkVisorMat
  );
  visorMesh.rotation.y = Math.PI * 0.5;
  visorMesh.position.set(0, 0.01, 0.035);
  headGroup.add(visorMesh);

  const visorOpticLine = new THREE.Mesh(
    new THREE.TorusGeometry(0.19, 0.013, 8, 24, Math.PI * 0.58),
    chronoCyanMat
  );
  visorOpticLine.rotation.x = Math.PI / 2;
  visorOpticLine.rotation.z = -Math.PI * 0.29;
  visorOpticLine.position.set(0, 0.015, 0.03);
  headGroup.add(visorOpticLine);

  // Side Comms Ear Pods + Swept Antennae
  for (const side of [-1, 1]) {
    const earPod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.056, 0.056, 0.052, 12),
      graphiteJointMat
    );
    earPod.rotation.z = Math.PI / 2;
    earPod.position.set(side * 0.19, 0.0, -0.01);
    headGroup.add(earPod);

    const antenna = new THREE.Mesh(
      new RoundedBoxGeometry(0.026, 0.23, 0.062, 2, 0.01),
      silverArmorMat
    );
    antenna.position.set(side * 0.196, 0.11, -0.07);
    antenna.rotation.x = -0.38;
    headGroup.add(antenna);
  }

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

  // Integrated Pulsecaster Forearm Cannon
  const pulsecasterHousing = new THREE.Mesh(
    new RoundedBoxGeometry(0.155, 0.155, 0.37, 3, 0.04),
    graphiteJointMat
  );
  pulsecasterHousing.position.set(-0.04, -0.17, 0.15);
  pulsecasterHousing.rotation.x = 0.35;
  leftForearmPivot.add(pulsecasterHousing);

  const pulsecasterMaterial = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.55,
    roughness: 0.14,
    metalness: 0.55,
  });

  const pulsecasterCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.048, 0.28, 12),
    pulsecasterMaterial
  );
  pulsecasterCore.rotation.x = Math.PI / 2 + 0.35;
  pulsecasterCore.position.set(-0.05, -0.16, 0.17);
  leftForearmPivot.add(pulsecasterCore);

  const pulsecasterMuzzle = new THREE.Mesh(
    new THREE.TorusGeometry(0.054, 0.016, 8, 16),
    warmBronzeMat
  );
  pulsecasterMuzzle.rotation.x = 0.35;
  pulsecasterMuzzle.position.set(-0.05, -0.22, 0.32);
  leftForearmPivot.add(pulsecasterMuzzle);

  // --- 6. Right Arm, Pauldron Pivot, Wrist WeaponPivot & Contoured Chrono Edge ---
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

  const hiltGrip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.046, 0.44, 14),
    graphiteJointMat
  );
  hiltGrip.rotation.x = Math.PI / 2;
  weaponPivot.add(hiltGrip);

  const pommelRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.058, 0.019, 10, 20),
    warmBronzeMat
  );
  pommelRing.rotation.y = Math.PI / 2;
  pommelRing.position.set(0, 0, -0.23);
  weaponPivot.add(pommelRing);

  const crossguard = new THREE.Mesh(
    new RoundedBoxGeometry(0.17, 0.3, 0.19, 3, 0.04),
    silverArmorMat
  );
  crossguard.position.set(0, 0, 0.22);
  weaponPivot.add(crossguard);

  const crossguardCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 12, 12),
    warmBronzeMat
  );
  crossguardCore.position.set(0, 0, 0.24);
  weaponPivot.add(crossguardCore);

  // Twin Forward Plasma Tuning Prongs framing the blade root
  for (const py of [-0.095, 0.115]) {
    const emitterProng = new THREE.Mesh(
      new RoundedBoxGeometry(0.052, 0.042, 0.3, 2, 0.015),
      silverArmorMat
    );
    emitterProng.position.set(0, py, 0.37);
    weaponPivot.add(emitterProng);
  }

  // Metallic Sword Spine Backing
  const bladeSpine = new THREE.Mesh(
    new RoundedBoxGeometry(0.048, 0.072, 1.4, 2, 0.02),
    graphiteJointMat
  );
  bladeSpine.position.set(0, 0.04, 0.95);
  weaponPivot.add(bladeSpine);

  // Tapered Beveled Chrono Edge Energy Blade
  const bladeMaterial = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 1.72,
    roughness: 0.12,
    metalness: 0.72,
  });
  const customBladeGeo = createCurvedBladeGeometry(1.52, 0.21, 0.044);
  const bladeMesh = new THREE.Mesh(customBladeGeo, bladeMaterial);
  bladeMesh.position.set(0.02, -0.02, 0.28);
  weaponPivot.add(bladeMesh);

  // Phase 21: Null-Point Rail Lance 3D Weapon Assembly (visible when phase_rail equipped)
  const phaseRailGroup = new THREE.Group();
  phaseRailGroup.visible = false;
  weaponPivot.add(phaseRailGroup);

  const railBarrelTop = new THREE.Mesh(
    new RoundedBoxGeometry(0.055, 0.05, 1.95, 2, 0.015),
    silverArmorMat
  );
  railBarrelTop.position.set(0, 0.065, 0.98);
  phaseRailGroup.add(railBarrelTop);

  const railBarrelBottom = new THREE.Mesh(
    new RoundedBoxGeometry(0.055, 0.05, 1.85, 2, 0.015),
    graphiteJointMat
  );
  railBarrelBottom.position.set(0, -0.065, 0.92);
  phaseRailGroup.add(railBarrelBottom);

  const railCoreBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.032, 1.9, 12),
    chronoCyanMat
  );
  railCoreBeam.rotation.x = Math.PI / 2;
  railCoreBeam.position.set(0, 0, 0.96);
  phaseRailGroup.add(railCoreBeam);

  const phaseRailCoils: THREE.Mesh[] = [];
  for (const rz of [0.55, 1.05, 1.55]) {
    const railCoil = new THREE.Mesh(
      new THREE.TorusGeometry(0.088, 0.016, 8, 20),
      rz === 1.05 ? chronoCyanMat : warmBronzeMat
    );
    railCoil.position.set(0, 0, rz);
    phaseRailGroup.add(railCoil);
    phaseRailCoils.push(railCoil);
  }

  // Phase 21: Grav-Breaker Maul 3D Weapon Assembly (visible when grav_breaker equipped)
  const gravBreakerGroup = new THREE.Group();
  gravBreakerGroup.visible = false;
  weaponPivot.add(gravBreakerGroup);

  const maulHaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.044, 0.05, 1.48, 12),
    graphiteJointMat
  );
  maulHaft.rotation.x = Math.PI / 2;
  maulHaft.position.set(0, 0, 0.72);
  gravBreakerGroup.add(maulHaft);

  const maulHead = new THREE.Mesh(
    new RoundedBoxGeometry(0.46, 0.36, 0.54, 3, 0.06),
    silverArmorMat
  );
  maulHead.position.set(0, 0, 1.38);
  gravBreakerGroup.add(maulHead);

  const maulAnvilFace = new THREE.Mesh(
    new THREE.CylinderGeometry(0.19, 0.19, 0.56, 16),
    warmBronzeMat
  );
  maulAnvilFace.rotation.z = Math.PI / 2;
  maulAnvilFace.position.set(0, 0, 1.42);
  gravBreakerGroup.add(maulAnvilFace);

  const gravBreakerOrbs: THREE.Mesh[] = [];
  for (const mz of [1.22, 1.54]) {
    const singularityRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.026, 8, 20),
      chronoCyanMat
    );
    singularityRing.position.set(0, 0, mz);
    gravBreakerGroup.add(singularityRing);
    gravBreakerOrbs.push(singularityRing);
  }
  const maulCoreSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.125, 12, 12),
    chronoCyanMat
  );
  maulCoreSphere.position.set(0, 0, 1.38);
  gravBreakerGroup.add(maulCoreSphere);
  gravBreakerOrbs.push(maulCoreSphere);

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

  // --- 8. Parry Deflection Barrier Arc ---
  const parryShieldGeo = new THREE.CylinderGeometry(
    1.18,
    1.18,
    1.55,
    24,
    1,
    true,
    -Math.PI * 0.36,
    Math.PI * 0.72
  );
  const parryShieldMaterial = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const parryShieldMesh = new THREE.Mesh(parryShieldGeo, parryShieldMaterial);
  parryShieldMesh.position.y = 1.1;
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

  return {
    root,
    bodyGroup,
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
    chronoAccentMaterial: chronoCyanMat,
    phaseRailGroup,
    phaseRailCoils,
    gravBreakerGroup,
    gravBreakerOrbs,
    pulsecasterCoreMesh: pulsecasterCore,
    pulsecasterMaterial,
    slashArcPivot,
    slashArcMesh,
    slashArcMaterial,
    parryShieldMesh,
    parryShieldMaterial,
    chargeRingMesh,
    chargeRingMaterial,
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

  const darkMetal = new THREE.MeshStandardMaterial({
    color: archetype === 'choir' ? 0x102631 : archetype === 'curator' ? 0x17132f : 0x270b16,
    bumpMap: armorBump,
    bumpScale: 0.012,
    roughness: 0.46,
    metalness: 0.72,
  });
  const structuralMetal = new THREE.MeshStandardMaterial({
    color: archetype === 'choir' ? 0x315468 : archetype === 'curator' ? 0x4c4177 : 0x6b1d34,
    bumpMap: armorBump,
    bumpScale: 0.008,
    roughness: 0.3,
    metalness: 0.82,
  });
  const paleShell = new THREE.MeshStandardMaterial({
    color: archetype === 'choir' ? 0xd7edf0 : archetype === 'curator' ? 0xc4b5fd : 0xfff1f2,
    bumpMap: armorBump,
    bumpScale: 0.006,
    roughness: archetype === 'matron' ? 0.28 : 0.22,
    metalness: archetype === 'matron' ? 0.28 : 0.62,
  });
  const warmMetal = new THREE.MeshStandardMaterial({
    color: archetype === 'curator' ? 0xd97706 : archetype === 'matron' ? 0x9f1239 : 0xc59032,
    roughness: 0.26,
    metalness: 0.86,
  });
  const signalMat = new THREE.MeshStandardMaterial({
    color: archetype === 'choir' ? 0x67e8f9 : archetype === 'curator' ? 0xc084fc : 0xfb7185,
    emissive: archetype === 'choir' ? 0x0891b2 : archetype === 'curator' ? 0x7e22ce : 0xe11d48,
    emissiveIntensity: 1.45,
    roughness: 0.2,
    metalness: 0.42,
  });

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
  const ring = (radius: number, tube: number, material: THREE.Material): THREE.Mesh =>
    new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 40), material);

  torsoPivot.add(weaponPivot, secondaryPivot, outerHelixRing, innerHelixRing, headPivot);

  let coreMesh: THREE.Mesh;
  let coreRimMesh: THREE.Mesh;

  if (archetype === 'choir') {
    hero(mesh(bodyGroup, new THREE.CylinderGeometry(0.52, 0.88, 0.42, 12), darkMetal, 0, 0.62, 0));
    const lowerResonator = hero(mesh(bodyGroup, new THREE.OctahedronGeometry(0.52, 0), structuralMetal, 0, 1.02, 0));
    lowerResonator.scale.set(0.82, 1.28, 0.82);
    mesh(bodyGroup, new THREE.CylinderGeometry(0.2, 0.34, 0.88, 12), warmMetal, 0, 1.35, -0.08);

    coreMesh = hero(mesh(torsoPivot, new THREE.SphereGeometry(0.4, 24, 18), coreMaterial, 0, 2.08, 0.26));
    coreMesh.scale.set(1, 1.12, 0.78);
    coreRimMesh = mesh(torsoPivot, new THREE.RingGeometry(0.47, 0.62, 36), coreRimMaterial, 0, 2.08, 0.42);

    const spineGeo = new THREE.CylinderGeometry(0.11, 0.16, 1.45, 10);
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const support = mesh(torsoPivot, spineGeo, structuralMetal, Math.sin(angle) * 0.56, 1.62, Math.cos(angle) * 0.4 - 0.12);
      support.rotation.z = Math.sin(angle) * 0.34;
      support.rotation.x = Math.cos(angle) * 0.24;
    }

    outerHelixRing.position.set(0, 2.08, -0.02);
    innerHelixRing.position.set(0, 2.08, -0.02);
    const outerHalo = ring(1.58, 0.065, warmMetal);
    outerHalo.rotation.x = 0.32;
    outerHelixRing.add(outerHalo);
    const innerHalo = ring(1.12, 0.045, signalMat);
    innerHalo.rotation.y = 0.48;
    innerHelixRing.add(innerHalo);

    const spireConfigs = [
      { x: -0.98, z: -0.24, h: 2.35, y: 1.18 },
      { x: 0, z: -0.48, h: 3.25, y: 1.06 },
      { x: 0.98, z: -0.24, h: 2.35, y: 1.18 },
    ];
    const pipeGeo = new THREE.CylinderGeometry(0.12, 0.17, 1, 12);
    const capGeo = new THREE.ConeGeometry(0.2, 0.52, 12);
    const bandGeo = new THREE.TorusGeometry(0.19, 0.026, 8, 20);
    for (let i = 0; i < spireConfigs.length; i++) {
      const cfg = spireConfigs[i];
      const spire = new THREE.Group();
      spire.position.set(cfg.x, cfg.y, cfg.z);
      spire.userData.baseY = cfg.y;
      torsoPivot.add(spire);
      auxiliaryPivots.push(spire);

      const pipe = hero(mesh(spire, pipeGeo, paleShell, 0, cfg.h * 0.5, 0));
      pipe.scale.y = cfg.h;
      mesh(spire, capGeo, i === 1 ? warmMetal : structuralMetal, 0, cfg.h + 0.24, 0);
      mesh(spire, new THREE.CylinderGeometry(0.055, 0.07, cfg.h * 0.68, 10), signalMat, 0, cfg.h * 0.55, 0.13);
      for (const ratio of [0.18, 0.5, 0.78]) {
        const band = mesh(spire, bandGeo, ratio === 0.5 ? signalMat : warmMetal, 0, cfg.h * ratio, 0);
        band.rotation.x = Math.PI / 2;
      }
    }

    const organPipeGeo = new THREE.CylinderGeometry(0.065, 0.09, 1, 10);
    for (const side of [-1, 1]) {
      const bank = new THREE.Group();
      bank.position.set(side * 1.42, 1.22, -0.12);
      bank.userData.baseY = bank.position.y;
      torsoPivot.add(bank);
      auxiliaryPivots.push(bank);
      mesh(bank, new RoundedBoxGeometry(0.48, 0.24, 0.54, 2, 0.05), darkMetal, 0, 0, 0);
      for (let p = 0; p < 4; p++) {
        const h = 0.78 + p * 0.22;
        const pipe = mesh(bank, organPipeGeo, p === 3 ? signalMat : paleShell, (p - 1.5) * 0.12, h * 0.5 + 0.1, -0.04 * p);
        pipe.scale.y = h;
      }
    }

    for (const side of [-1, 1]) {
      const shutter = side < 0 ? leftShutterPivot : rightShutterPivot;
      shutter.position.set(side * 0.28, 2.08, 0.48);
      torsoPivot.add(shutter);
      const baffle = hero(mesh(shutter, new RoundedBoxGeometry(0.32, 0.88, 0.12, 3, 0.04), structuralMetal, side * 0.08, 0, 0));
      baffle.rotation.z = -side * 0.12;
      for (const y of [-0.26, 0, 0.26]) {
        mesh(shutter, new RoundedBoxGeometry(0.3, 0.045, 0.15, 1, 0.015), signalMat, side * 0.08, y, 0.04);
      }
    }

    headPivot.position.set(0, 3.08, 0.1);
    mesh(headPivot, new THREE.CylinderGeometry(0.2, 0.3, 0.5, 12), darkMetal);
    const crown = ring(0.46, 0.035, warmMetal);
    crown.position.y = 0.32;
    headPivot.add(crown);
    mesh(headPivot, new RoundedBoxGeometry(0.1, 0.42, 0.14, 2, 0.025), signalMat, 0, 0.02, 0.24);

    weaponPivot.position.set(1.42, 1.72, 0.08);
    secondaryPivot.position.set(-1.42, 1.72, 0.08);
    const forkStem = mesh(weaponPivot, new THREE.CylinderGeometry(0.07, 0.1, 1.72, 12), warmMetal, 0, 0, 0.72);
    forkStem.rotation.x = Math.PI / 2;
    for (const x of [-0.24, 0.24]) {
      const prong = mesh(weaponPivot, new THREE.CylinderGeometry(0.04, 0.06, 0.92, 10), signalMat, x, 0, 1.62);
      prong.rotation.x = Math.PI / 2;
    }
    for (const z of [1.2, 1.5, 1.8]) {
      const sonic = ring(0.32, 0.028, signalMat);
      sonic.position.z = z;
      weaponPivot.add(sonic);
    }
    for (let c = -1; c <= 1; c++) {
      const chime = mesh(secondaryPivot, new THREE.CylinderGeometry(0.07, 0.07, 1.1 + (1 - Math.abs(c)) * 0.35, 10), c === 0 ? signalMat : paleShell, c * 0.22, 0, 0.82);
      chime.rotation.x = Math.PI / 2;
    }
  } else if (archetype === 'curator') {
    const base = hero(mesh(bodyGroup, new THREE.OctahedronGeometry(0.74, 0), darkMetal, 0, 0.72, 0));
    base.scale.set(0.78, 1.15, 0.78);
    mesh(bodyGroup, new THREE.CylinderGeometry(0.24, 0.46, 0.5, 8), warmMetal, 0, 1.12, 0);

    const slabGeo = new RoundedBoxGeometry(0.92, 0.5, 0.72, 2, 0.055);
    for (let i = 0; i < 5; i++) {
      const slab = new THREE.Group();
      const y = 1.22 + i * 0.42;
      slab.position.set((i % 2 === 0 ? -1 : 1) * 0.06, y, -0.08);
      slab.rotation.y = (i - 2) * 0.08;
      slab.userData.baseY = y;
      slab.userData.baseRotY = slab.rotation.y;
      torsoPivot.add(slab);
      auxiliaryPivots.push(slab);
      const shell = hero(mesh(slab, slabGeo, i === 2 ? structuralMetal : darkMetal));
      shell.scale.set(1 - i * 0.055, 1, 1 - i * 0.04);
      mesh(slab, new RoundedBoxGeometry(0.64, 0.055, 0.76, 1, 0.015), i % 2 === 0 ? signalMat : warmMetal, 0, 0.18, 0.02);
    }

    coreMesh = hero(mesh(torsoPivot, new THREE.OctahedronGeometry(0.46, 0), coreMaterial, 0, 1.96, 0.5));
    coreMesh.scale.set(0.86, 1.18, 0.68);
    coreRimMesh = mesh(torsoPivot, new THREE.RingGeometry(0.48, 0.64, 6), coreRimMaterial, 0, 1.96, 0.64);

    outerHelixRing.position.set(0, 2.18, -0.06);
    innerHelixRing.position.set(0, 2.18, -0.06);
    const outerAstrolabe = ring(1.52, 0.048, warmMetal);
    outerAstrolabe.rotation.x = 0.46;
    outerHelixRing.add(outerAstrolabe);
    const shardGeo = new THREE.OctahedronGeometry(0.28, 0);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const holder = new THREE.Group();
      holder.rotation.z = angle;
      outerHelixRing.add(holder);
      const shard = hero(mesh(holder, shardGeo, i % 2 === 0 ? signalMat : paleShell, 0, 1.5, -0.08));
      shard.scale.set(0.56, 1.72, 0.48);
    }
    const innerMatrix = ring(1.04, 0.035, signalMat);
    innerMatrix.rotation.y = 0.58;
    innerHelixRing.add(innerMatrix);

    for (const side of [-1, 1]) {
      const shutter = side < 0 ? leftShutterPivot : rightShutterPivot;
      shutter.position.set(side * 0.3, 1.96, 0.54);
      torsoPivot.add(shutter);
      const panel = hero(mesh(shutter, new RoundedBoxGeometry(0.3, 0.94, 0.12, 2, 0.035), structuralMetal, side * 0.06, 0, 0));
      panel.rotation.z = side * 0.12;
      mesh(shutter, new THREE.OctahedronGeometry(0.12, 0), signalMat, side * 0.08, 0.2, 0.1);
    }

    headPivot.position.set(0, 3.42, -0.02);
    const crown = hero(mesh(headPivot, new THREE.OctahedronGeometry(0.52, 0), darkMetal));
    crown.scale.set(0.78, 1.48, 0.72);
    const crownWire = mesh(headPivot, new THREE.OctahedronGeometry(0.6, 0), new THREE.MeshBasicMaterial({ color: 0xc084fc, wireframe: true, transparent: true, opacity: 0.72 }));
    crownWire.scale.set(0.78, 1.35, 0.72);
    for (const y of [-0.18, 0.02, 0.22]) {
      mesh(headPivot, new THREE.OctahedronGeometry(0.09, 0), y === 0.02 ? warmMetal : signalMat, 0, y, 0.38);
    }

    weaponPivot.position.set(1.18, 1.88, 0.02);
    secondaryPivot.position.set(-1.18, 1.88, 0.02);
    const staff = mesh(weaponPivot, new THREE.CylinderGeometry(0.065, 0.09, 2.25, 10), warmMetal, 0, 0, 0.92);
    staff.rotation.x = Math.PI / 2;
    const staffHead = hero(mesh(weaponPivot, new THREE.OctahedronGeometry(0.38, 0), signalMat, 0, 0, 1.92));
    staffHead.scale.set(0.8, 0.8, 1.45);
    for (const side of [-1, 1]) {
      const wing = mesh(weaponPivot, createCurvedBladeGeometry(1.12, 0.24, 0.05), paleShell, side * 0.28, 0, 1.42);
      wing.rotation.z = side * Math.PI * 0.5;
    }
    const projector = ring(0.46, 0.045, warmMetal);
    projector.position.z = 0.82;
    secondaryPivot.add(projector);
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const emitter = mesh(secondaryPivot, new THREE.OctahedronGeometry(0.18, 0), signalMat, Math.cos(angle) * 0.36, Math.sin(angle) * 0.36, 1.02);
      emitter.scale.set(0.6, 0.6, 1.5);
    }
  } else {
    const legGeo = new THREE.CapsuleGeometry(0.13, 0.42, 6, 10);
    for (const side of [-1, 1]) {
      for (const z of [-0.36, 0.36]) {
        const leg = hero(mesh(bodyGroup, legGeo, darkMetal, side * 0.66, 0.58, z));
        leg.rotation.z = -side * 0.22;
        mesh(bodyGroup, new RoundedBoxGeometry(0.42, 0.18, 0.5, 2, 0.05), structuralMetal, side * 0.74, 0.24, z + 0.08);
      }
    }
    const cradle = hero(mesh(torsoPivot, new RoundedBoxGeometry(1.62, 0.74, 1.24, 5, 0.2), paleShell, 0, 1.22, 0));
    cradle.scale.set(1.06, 1, 1);
    mesh(torsoPivot, new RoundedBoxGeometry(1.2, 0.32, 1.34, 3, 0.08), darkMetal, 0, 0.9, -0.02);
    mesh(torsoPivot, new THREE.CylinderGeometry(0.5, 0.5, 0.28, 24), darkMetal, 0, 1.34, 0.54).rotation.x = Math.PI / 2;
    const port = ring(0.5, 0.065, warmMetal);
    port.position.set(0, 1.34, 0.69);
    torsoPivot.add(port);

    coreMesh = hero(mesh(torsoPivot, new THREE.SphereGeometry(0.37, 24, 18), coreMaterial, 0, 1.34, 0.67));
    coreMesh.scale.set(1, 1, 0.72);
    coreRimMesh = mesh(torsoPivot, new THREE.RingGeometry(0.43, 0.57, 36), coreRimMaterial, 0, 1.34, 0.76);

    outerHelixRing.position.set(0, 1.48, -0.08);
    innerHelixRing.position.set(0, 1.48, -0.08);
    const outerSurgicalHalo = ring(1.36, 0.045, warmMetal);
    outerSurgicalHalo.rotation.x = 0.3;
    outerHelixRing.add(outerSurgicalHalo);
    const innerSurgicalHalo = ring(1.02, 0.032, signalMat);
    innerSurgicalHalo.rotation.y = 0.52;
    innerHelixRing.add(innerSurgicalHalo);

    for (const side of [-1, 1]) {
      for (const upper of [true, false]) {
        const limb = new THREE.Group();
        const restZ = -side * (upper ? 0.46 : 0.82);
        limb.position.set(side * (upper ? 0.68 : 0.82), upper ? 1.64 : 1.18, -0.38);
        limb.rotation.z = restZ;
        limb.userData.restZ = restZ;
        limb.userData.side = side;
        limb.userData.upper = upper ? 1 : 0;
        torsoPivot.add(limb);
        auxiliaryPivots.push(limb);

        const shoulder = mesh(limb, new THREE.SphereGeometry(0.17, 12, 10), darkMetal);
        hero(shoulder);
        const upperStrut = hero(mesh(limb, new THREE.CapsuleGeometry(0.085, 0.68, 6, 10), paleShell, side * 0.32, 0.28, 0));
        upperStrut.rotation.z = -side * 0.72;
        mesh(limb, new THREE.SphereGeometry(0.12, 10, 8), warmMetal, side * 0.62, 0.52, 0.04);
        const forearm = mesh(limb, new THREE.CylinderGeometry(0.055, 0.075, 0.78, 10), darkMetal, side * 0.74, 0.46, 0.34);
        forearm.rotation.x = Math.PI * 0.42;
        const scalpel = hero(mesh(limb, createCurvedBladeGeometry(0.96, 0.2, 0.04), signalMat, side * 0.76, 0.36, 0.72));
        scalpel.rotation.z = side * 0.12;
      }
    }

    for (const side of [-1, 1]) {
      const shutter = side < 0 ? leftShutterPivot : rightShutterPivot;
      shutter.position.set(side * 0.27, 1.34, 0.73);
      torsoPivot.add(shutter);
      const petal = hero(mesh(shutter, new THREE.SphereGeometry(0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), paleShell, side * 0.08, 0, 0));
      petal.scale.set(0.64, 1.12, 0.28);
      petal.rotation.z = -side * 0.18;
      mesh(shutter, new RoundedBoxGeometry(0.07, 0.52, 0.1, 2, 0.02), signalMat, side * 0.06, 0, 0.08);
      const canister = mesh(torsoPivot, new THREE.CylinderGeometry(0.13, 0.13, 0.78, 12), signalMat, side * 0.58, 1.62, -0.48);
      canister.rotation.x = -0.2;
    }

    headPivot.position.set(0, 2.14, 0.1);
    hero(mesh(headPivot, new RoundedBoxGeometry(0.58, 0.5, 0.56, 4, 0.13), paleShell));
    for (const x of [-0.17, 0, 0.17]) {
      const lens = mesh(headPivot, new THREE.CylinderGeometry(0.065, 0.065, 0.15, 12), signalMat, x, x === 0 ? 0.08 : -0.03, 0.29);
      lens.rotation.x = Math.PI / 2;
    }
    const lamp = ring(0.43, 0.035, signalMat);
    lamp.rotation.x = Math.PI * 0.42;
    lamp.position.y = 0.4;
    headPivot.add(lamp);

    weaponPivot.position.set(1.22, 1.16, 0.12);
    secondaryPivot.position.set(-1.22, 1.16, 0.12);
    const syringe = mesh(weaponPivot, new RoundedBoxGeometry(0.48, 0.42, 0.78, 3, 0.08), darkMetal, 0, 0, 0.72);
    hero(syringe);
    for (const x of [-0.17, 0.17]) {
      const needle = mesh(weaponPivot, new THREE.ConeGeometry(0.075, 0.96, 10), signalMat, x, 0, 1.42);
      needle.rotation.x = Math.PI / 2;
    }
    for (const y of [-0.12, 0.12]) {
      const saw = mesh(secondaryPivot, new THREE.CylinderGeometry(0.54, 0.54, 0.045, 24), darkMetal, 0, y, 0.82);
      const rim = ring(0.54, 0.035, signalMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(0, y, 0.82);
      secondaryPivot.add(rim);
      saw.rotation.x = 0.08;
    }
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

  // Ground Contact Shadow Disc
  const contactShadow = new THREE.Mesh(
    new THREE.CircleGeometry(cfg.radius * 1.45, 32),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.64,
      depthWrite: false,
    })
  );
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
      archetype === 'bastion' || archetype === 'siphon'
        ? 0xf59e0b
        : archetype === 'scrapper'
          ? 0xf97316
          : archetype === 'eraser' || archetype === 'matron'
            ? 0xf43f5e
            : archetype === 'curator' || archetype === 'curator_decoy'
              ? 0xa855f7
              : isBossArchetype
                ? 0x38bdf8
                : 0x22d3ee,
    emissive:
      archetype === 'bastion' || archetype === 'siphon'
        ? 0xea580c
        : archetype === 'scrapper'
          ? 0xea580c
          : archetype === 'eraser' || archetype === 'matron'
            ? 0xe11d48
            : archetype === 'curator' || archetype === 'curator_decoy'
              ? 0x9333ea
              : isBossArchetype
                ? 0x06b6d4
                : 0x06b6d4,
    emissiveIntensity: isBossArchetype ? 1.85 : 1.45,
    roughness: 0.15,
    metalness: 0.45,
  });

  const coreRimMaterial = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });

  if (
    archetype === 'bastion' ||
    archetype === 'eraser' ||
    archetype === 'aegis_sentinel'
  ) {
    const isEraser = archetype === 'eraser';
    const isSentinel = archetype === 'aegis_sentinel';
    // =========================================================================
    // BASTION-09 / ERASER-09 / SENTINEL-A7 — Heavy Enforcer, Nullifier & Phalanx
    // Calibrated Gunmetal/Slate/Bronze/Amber/Cyan PBR Materials so silhouette reads
    // clearly against the dark deck with heavy hydraulic articulation.
    // =========================================================================
    const graphiteChassisMat = new THREE.MeshStandardMaterial({
      color: isEraser ? 0x31102f : isSentinel ? 0x162d3d : 0x293548,
      bumpMap: armorBump,
      bumpScale: 0.012,
      roughness: 0.54,
      metalness: 0.58,
    });
    const gunmetalPlateMat = new THREE.MeshStandardMaterial({
      color: isEraser ? 0x881337 : isSentinel ? 0x0e7490 : 0x4b5d73,
      bumpMap: armorBump,
      bumpScale: 0.01,
      roughness: 0.26,
      metalness: 0.78,
    });
    const slateSteelMat = new THREE.MeshStandardMaterial({
      color: isEraser ? 0xfda4af : isSentinel ? 0xcffafe : 0x8496ad,
      roughness: 0.22,
      metalness: 0.85,
    });
    const bronzePistonMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.28,
      metalness: 0.82,
    });
    const amberGlowMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xea580c,
      emissiveIntensity: 1.45,
      roughness: 0.2,
      metalness: 0.5,
    });

    // Articulated Heavy Hydraulic Legs (Hip + Knee/Shin)
    const buildBastionLeg = (sign: number) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(sign * 0.44, 0.76, 0);

      const upperPiston = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.18, 0.28, 8, 16),
        graphiteChassisMat
      );
      upperPiston.position.y = -0.16;
      upperPiston.castShadow = enableShadows;
      legGroup.add(upperPiston);

      const thighArmor = new THREE.Mesh(
        new RoundedBoxGeometry(0.36, 0.32, 0.4, 3, 0.06),
        gunmetalPlateMat
      );
      thighArmor.position.set(sign * 0.03, -0.16, 0.02);
      legGroup.add(thighArmor);

      const shinGroup = new THREE.Group();
      shinGroup.position.set(0, -0.34, 0);
      legGroup.add(shinGroup);

      const kneeJoint = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.38, 12),
        bronzePistonMat
      );
      kneeJoint.rotation.z = Math.PI / 2;
      shinGroup.add(kneeJoint);

      const shinGuard = new THREE.Mesh(
        new RoundedBoxGeometry(0.38, 0.4, 0.44, 3, 0.08),
        gunmetalPlateMat
      );
      shinGuard.position.set(0, -0.18, 0.04);
      shinGuard.castShadow = enableShadows;
      shinGroup.add(shinGuard);

      const heavyFoot = new THREE.Mesh(
        new RoundedBoxGeometry(0.44, 0.2, 0.56, 3, 0.06),
        slateSteelMat
      );
      heavyFoot.position.set(0, -0.36, 0.08);
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

    // Pelvis & Hydraulic Waist Cylinder
    const pelvisBlock = new THREE.Mesh(
      new RoundedBoxGeometry(1.14, 0.38, 0.88, 4, 0.1),
      graphiteChassisMat
    );
    pelvisBlock.position.y = 0.82;
    pelvisBlock.castShadow = enableShadows;
    bodyGroup.add(pelvisBlock);
    primaryMeshes.push(pelvisBlock);

    torsoPivot.position.set(0, 1.05, 0);

    const waistRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.54, 0.32, 16),
      slateSteelMat
    );
    waistRing.position.y = 0.08;
    torsoPivot.add(waistRing);

    // Broad Rounded Carapace Upper Torso + Segmented Reactive Breastplates
    const carapaceTorso = new THREE.Mesh(
      new RoundedBoxGeometry(1.5, 0.96, 1.08, 5, 0.18),
      gunmetalPlateMat
    );
    carapaceTorso.position.set(0, 0.53, 0.02);
    carapaceTorso.castShadow = enableShadows;
    torsoPivot.add(carapaceTorso);
    primaryMeshes.push(carapaceTorso);

    for (const side of [-1, 1]) {
      const chestFlankPlate = new THREE.Mesh(
        new RoundedBoxGeometry(0.42, 0.72, 0.24, 3, 0.05),
        slateSteelMat
      );
      chestFlankPlate.position.set(side * 0.52, 0.52, 0.48);
      chestFlankPlate.rotation.y = -side * 0.22;
      torsoPivot.add(chestFlankPlate);
    }

    // Contoured Upper Back Dome & Twin Exhaust Vents
    const backShell = new THREE.Mesh(
      new THREE.SphereGeometry(0.68, 20, 16),
      graphiteChassisMat
    );
    backShell.scale.set(1.05, 0.78, 0.85);
    backShell.position.set(0, 0.61, -0.18);
    torsoPivot.add(backShell);

    for (const side of [-1, 1]) {
      const exhaustStack = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.14, 0.46, 12),
        slateSteelMat
      );
      exhaustStack.rotation.x = -0.32;
      exhaustStack.rotation.z = -side * 0.18;
      exhaustStack.position.set(side * 0.44, 0.94, -0.34);
      torsoPivot.add(exhaustStack);

      const exhaustGlow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.082, 0.082, 0.07, 12),
        amberGlowMat
      );
      exhaustGlow.rotation.x = -0.32;
      exhaustGlow.rotation.z = -side * 0.18;
      exhaustGlow.position.set(side * 0.47, 1.14, -0.41);
      torsoPivot.add(exhaustGlow);
    }

    // Rotating Dorsal Aegis Projector Halo so heavy shield bearers have unmistakable rear telemetry
    const aegisHaloPivot = new THREE.Group();
    aegisHaloPivot.position.set(0, 0.72, -0.58);
    const aegisRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.035, 8, 20),
      isEraser ? coreMaterial : amberGlowMat
    );
    aegisHaloPivot.add(aegisRing);
    torsoPivot.add(aegisHaloPivot);
    auxiliaryPivots.push(aegisHaloPivot);

    // Articulated Armored Head & Amber Visor Slit
    headPivot.position.set(0, 1.03, 0.12);
    const helmGuard = new THREE.Mesh(
      new RoundedBoxGeometry(0.58, 0.38, 0.56, 4, 0.1),
      slateSteelMat
    );
    headPivot.add(helmGuard);

    const helmBrow = new THREE.Mesh(
      new RoundedBoxGeometry(0.62, 0.12, 0.34, 2, 0.03),
      gunmetalPlateMat
    );
    helmBrow.position.set(0, 0.12, 0.18);
    headPivot.add(helmBrow);

    const helmVisor = new THREE.Mesh(
      new RoundedBoxGeometry(0.46, 0.1, 0.12, 2, 0.03),
      amberGlowMat
    );
    helmVisor.position.set(0, 0, 0.24);
    headPivot.add(helmVisor);

    // Massive Rounded Shoulder Pauldron Domes with Amber Vent Slits
    for (const side of [-1, 1]) {
      const shoulderDome = new THREE.Mesh(
        new THREE.SphereGeometry(0.47, 18, 16, 0, Math.PI * 2, 0, Math.PI * 0.65),
        gunmetalPlateMat
      );
      shoulderDome.rotation.z = -side * 0.42;
      shoulderDome.position.set(side * 0.88, 0.77, 0.02);
      shoulderDome.castShadow = enableShadows;
      torsoPivot.add(shoulderDome);
      primaryMeshes.push(shoulderDome);

      const pauldronTrim = new THREE.Mesh(
        new THREE.TorusGeometry(0.43, 0.048, 10, 24),
        slateSteelMat
      );
      pauldronTrim.rotation.y = Math.PI / 2;
      pauldronTrim.rotation.x = 0.35;
      pauldronTrim.position.set(side * 0.82, 0.67, 0.02);
      torsoPivot.add(pauldronTrim);

      const ventGlow = new THREE.Mesh(
        new RoundedBoxGeometry(0.12, 0.28, 0.38, 2, 0.03),
        amberGlowMat
      );
      ventGlow.position.set(side * 1.06, 0.73, 0.02);
      torsoPivot.add(ventGlow);
    }

    // Left Forearm Riot-Shield Buckler on secondaryPivot (attached to torsoPivot)
    secondaryPivot.position.set(-0.92, 0.5, 0.12);
    torsoPivot.add(secondaryPivot);
    const leftArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.16, 0.42, 8, 12),
      graphiteChassisMat
    );
    leftArm.position.set(0, -0.24, 0.15);
    leftArm.rotation.x = 0.45;
    secondaryPivot.add(leftArm);

    const bucklerShield = new THREE.Mesh(
      new RoundedBoxGeometry(0.24, 0.94, 0.82, 4, 0.09),
      gunmetalPlateMat
    );
    bucklerShield.position.set(-0.14, -0.28, 0.36);
    bucklerShield.rotation.y = 0.28;
    secondaryPivot.add(bucklerShield);

    const bucklerInnerFrame = new THREE.Mesh(
      new RoundedBoxGeometry(0.26, 0.72, 0.56, 3, 0.05),
      slateSteelMat
    );
    bucklerInnerFrame.position.set(-0.15, -0.28, 0.36);
    bucklerInnerFrame.rotation.y = 0.28;
    secondaryPivot.add(bucklerInnerFrame);

    for (const bz of [0.14, 0.58]) {
      const bucklerEnergyTrim = new THREE.Mesh(
        new RoundedBoxGeometry(0.07, 0.76, 0.08, 2, 0.02),
        amberGlowMat
      );
      bucklerEnergyTrim.position.set(-0.24, -0.28, bz);
      bucklerEnergyTrim.rotation.y = 0.28;
      secondaryPivot.add(bucklerEnergyTrim);
    }

    // Central Chest Reactor Core + Containment Bezel + Exposed Cyan Rim
    const coreBezel = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.058, 12, 24),
      bronzePistonMat
    );
    coreBezel.position.set(0, 0.49, 0.54);
    torsoPivot.add(coreBezel);

    coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 20), coreMaterial);
    coreMesh.scale.set(1, 1, 0.72);
    coreMesh.position.set(0, 0.49, 0.52);
    torsoPivot.add(coreMesh);

    coreRimMesh = new THREE.Mesh(new THREE.RingGeometry(0.33, 0.44, 32), coreRimMaterial);
    coreRimMesh.position.set(0, 0.49, 0.58);
    torsoPivot.add(coreRimMesh);

    // Right Arm & Oversized Shock-Maul on weaponPivot (attached to torsoPivot)
    weaponPivot.position.set(0.92, 0.57, 0.15);
    torsoPivot.add(weaponPivot);

    const rightUpperArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.17, 0.45, 8, 14),
      graphiteChassisMat
    );
    rightUpperArm.position.set(0, -0.2, 0.15);
    rightUpperArm.rotation.x = Math.PI * 0.35;
    weaponPivot.add(rightUpperArm);

    const maulShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.078, 0.088, 1.9, 14),
      slateSteelMat
    );
    maulShaft.rotation.x = Math.PI / 2;
    maulShaft.position.set(0, -0.15, 0.8);
    weaponPivot.add(maulShaft);

    const maulHeadHousing = new THREE.Mesh(
      new RoundedBoxGeometry(0.64, 0.58, 0.8, 4, 0.11),
      gunmetalPlateMat
    );
    maulHeadHousing.position.set(0, -0.15, 1.54);
    maulHeadHousing.castShadow = enableShadows;
    weaponPivot.add(maulHeadHousing);

    const maulImpactCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.29, 0.29, 0.92, 18),
      slateSteelMat
    );
    maulImpactCylinder.rotation.z = Math.PI / 2;
    maulImpactCylinder.position.set(0, -0.15, 1.58);
    weaponPivot.add(maulImpactCylinder);

    for (const offsetZ of [1.34, 1.74]) {
      const maulCoil = new THREE.Mesh(
        new THREE.TorusGeometry(0.33, 0.044, 10, 24),
        coreMaterial
      );
      maulCoil.position.set(0, -0.15, offsetZ);
      weaponPivot.add(maulCoil);
    }
  } else if (
    archetype === 'scrapper' ||
    archetype === 'siphon' ||
    archetype === 'curator_decoy'
  ) {
    const isSiphon = archetype === 'siphon';
    const isDecoy = archetype === 'curator_decoy';
    // =========================================================================
    // SCRAPPER-X2 / SIPHON-03 / CURATOR FALSE-ECHO DECOY
    // Articulated reverse-jointed digitigrade legs + independent left/right
    // mantis scimitar arms for predatory weaving and scissor-strike animations.
    // =========================================================================
    const copperArmorMat = new THREE.MeshStandardMaterial({
      color: isDecoy ? 0xf59e0b : isSiphon ? 0x10b981 : 0xd96b27,
      emissive: isDecoy ? 0x9333ea : isSiphon ? 0x047857 : 0x000000,
      emissiveIntensity: isDecoy ? 1.15 : isSiphon ? 0.45 : 0,
      bumpMap: armorBump,
      bumpScale: 0.01,
      roughness: 0.26,
      metalness: 0.78,
      transparent: isDecoy,
      opacity: isDecoy ? 0.74 : 1,
    });
    const crimsonPlateMat = new THREE.MeshStandardMaterial({
      color: isDecoy ? 0xc084fc : isSiphon ? 0xf59e0b : 0x991b1b,
      roughness: 0.36,
      metalness: 0.65,
      transparent: isDecoy,
      opacity: isDecoy ? 0.78 : 1,
    });
    const darkBronzeMat = new THREE.MeshStandardMaterial({
      color: isDecoy ? 0x3b0764 : isSiphon ? 0x064e3b : 0x33241e,
      roughness: 0.52,
      metalness: 0.65,
      transparent: isDecoy,
      opacity: isDecoy ? 0.72 : 1,
    });

    // Articulated Reverse-Jointed Predator Legs (Thigh + Lower Shin/Talon)
    const buildScrapperLeg = (sign: number) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(sign * 0.29, 0.74, -0.05);

      const thigh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.098, 0.32, 8, 12),
        copperArmorMat
      );
      thigh.position.set(0, -0.15, 0.08);
      thigh.rotation.x = -0.45;
      legGroup.add(thigh);

      const shinGroup = new THREE.Group();
      shinGroup.position.set(0, -0.3, 0.16);
      legGroup.add(shinGroup);

      const kneeJoint = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), darkBronzeMat);
      shinGroup.add(kneeJoint);

      const lowerShin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.078, 0.052, 0.42, 12),
        darkBronzeMat
      );
      lowerShin.position.set(0, -0.16, -0.18);
      lowerShin.rotation.x = 0.42;
      shinGroup.add(lowerShin);

      const talonFoot = new THREE.Mesh(
        new RoundedBoxGeometry(0.17, 0.1, 0.34, 3, 0.03),
        crimsonPlateMat
      );
      talonFoot.position.set(0, -0.38, -0.06);
      shinGroup.add(talonFoot);

      bodyGroup.add(legGroup);
      return { legGroup, shinGroup };
    };

    const sLeft = buildScrapperLeg(-1);
    const sRight = buildScrapperLeg(1);
    leftLegPivot = sLeft.legGroup;
    leftShinPivot = sLeft.shinGroup;
    rightLegPivot = sRight.legGroup;
    rightShinPivot = sRight.shinGroup;

    // Lean Agile Pelvis
    const pelvis = new THREE.Mesh(
      new RoundedBoxGeometry(0.52, 0.26, 0.56, 3, 0.07),
      darkBronzeMat
    );
    pelvis.position.set(0, 0.75, -0.04);
    bodyGroup.add(pelvis);
    primaryMeshes.push(pelvis);

    torsoPivot.position.set(0, 0.88, 0);

    const torsoShell = new THREE.Mesh(
      new RoundedBoxGeometry(0.68, 0.52, 0.88, 4, 0.12),
      copperArmorMat
    );
    torsoShell.position.set(0, 0.24, 0.12);
    torsoShell.rotation.x = 0.34;
    torsoShell.castShadow = enableShadows;
    torsoPivot.add(torsoShell);
    primaryMeshes.push(torsoShell);

    // Asymmetrical Shoulder Armor: Enlarged Right Strike-Pauldron + Left Crimson Sensor Pod
    const rightStrikePauldron = new THREE.Mesh(
      new THREE.ConeGeometry(0.32, 0.68, 12),
      crimsonPlateMat
    );
    rightStrikePauldron.rotation.z = -Math.PI * 0.38;
    rightStrikePauldron.rotation.x = 0.25;
    rightStrikePauldron.position.set(0.46, 0.44, 0.14);
    torsoPivot.add(rightStrikePauldron);
    primaryMeshes.push(rightStrikePauldron);

    const leftSensorShoulder = new THREE.Mesh(
      new RoundedBoxGeometry(0.24, 0.28, 0.42, 3, 0.06),
      copperArmorMat
    );
    leftSensorShoulder.position.set(-0.42, 0.36, 0.12);
    torsoPivot.add(leftSensorShoulder);

    // 3 Pointed Dorsal Spine Fins + Rear Twin Thruster Pack
    const spineFinGeo = createExtrudedFinGeometry(0.08, 0.34, 0.28, 0.25);
    for (let s = 0; s < 3; s++) {
      const fin = new THREE.Mesh(spineFinGeo, crimsonPlateMat);
      fin.position.set(0, 0.5 - s * 0.11, 0.08 - s * 0.24);
      fin.rotation.x = -0.5;
      torsoPivot.add(fin);
    }

    for (const side of [-1, 1]) {
      const thruster = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.11, 0.28, 12),
        darkBronzeMat
      );
      thruster.rotation.x = Math.PI * 0.38;
      thruster.position.set(side * 0.2, 0.3, -0.36);
      torsoPivot.add(thruster);
    }

    // Articulated Counterbalance Predator Tail Stabilizer on secondaryPivot
    secondaryPivot.position.set(0, 0.76, -0.28);
    bodyGroup.add(secondaryPivot);
    const tailSpine = new THREE.Mesh(
      new THREE.ConeGeometry(0.095, 0.72, 8),
      copperArmorMat
    );
    tailSpine.rotation.x = -Math.PI * 0.42;
    tailSpine.position.set(0, 0.08, -0.34);
    secondaryPivot.add(tailSpine);

    // Articulated Predator Sensor Head & Compact Reactor Core
    headPivot.position.set(0, 0.4, 0.58);
    const headPod = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.52, 12),
      darkBronzeMat
    );
    headPod.rotation.x = Math.PI * 0.56;
    headPivot.add(headPod);

    const predatorVisor = new THREE.Mesh(
      new RoundedBoxGeometry(0.26, 0.065, 0.14, 2, 0.02),
      coreMaterial
    );
    predatorVisor.position.set(0, 0, 0.14);
    headPivot.add(predatorVisor);

    coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 18, 18), coreMaterial);
    coreMesh.position.set(0, 0.2, 0.54);
    torsoPivot.add(coreMesh);

    coreRimMesh = new THREE.Mesh(new THREE.RingGeometry(0.25, 0.33, 28), coreRimMaterial);
    coreRimMesh.position.set(0, 0.2, 0.58);
    torsoPivot.add(coreRimMesh);

    // Independent Left & Right Articulated Mantis Arms with Curved Beveled Scimitar Blades
    weaponPivot.position.set(0, 0.24, 0.26);
    torsoPivot.add(weaponPivot);

    const curvedMantisGeo = createCurvedBladeGeometry(1.22, 0.25, 0.048);

    const buildMantisArm = (side: number) => {
      const armGroup = new THREE.Group();
      armGroup.position.set(side * 0.42, 0, 0);
      weaponPivot.add(armGroup);

      const upperLimb = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.078, 0.34, 8, 12),
        darkBronzeMat
      );
      upperLimb.rotation.x = Math.PI * 0.32;
      upperLimb.position.set(0, -0.08, 0.18);
      armGroup.add(upperLimb);

      const bladeBack = new THREE.Mesh(
        new RoundedBoxGeometry(0.075, 0.12, 0.94, 2, 0.025),
        crimsonPlateMat
      );
      bladeBack.position.set(0, -0.12, 0.56);
      armGroup.add(bladeBack);

      const plasmaEdge = new THREE.Mesh(curvedMantisGeo, coreMaterial);
      plasmaEdge.position.set(0, -0.18, 0.15);
      armGroup.add(plasmaEdge);

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
          ? 0xcffafe
          : archetype === 'curator'
            ? 0xddd6fe
            : archetype === 'matron'
              ? 0xfecdd3
              : 0xdbe6f2,
      bumpMap: armorBump,
      bumpScale: 0.012,
      roughness: 0.24,
      metalness: 0.72,
    });
    const darkTitaniumMat = new THREE.MeshStandardMaterial({
      color:
        archetype === 'choir'
          ? 0x0f2942
          : archetype === 'curator'
            ? 0x1e1b4b
            : archetype === 'matron'
              ? 0x3f0d1c
              : 0x1e293b,
      bumpMap: armorBump,
      bumpScale: 0.014,
      roughness: 0.46,
      metalness: 0.68,
    });
    const slateFrameMat = new THREE.MeshStandardMaterial({
      color:
        archetype === 'choir'
          ? 0x38bdf8
          : archetype === 'curator'
            ? 0x7c3aed
            : archetype === 'matron'
              ? 0xbe123c
              : 0x475569,
      roughness: 0.3,
      metalness: 0.82,
    });
    const bronzeActuatorMat = new THREE.MeshStandardMaterial({
      color: archetype === 'matron' ? 0xf43f5e : 0xd97706,
      roughness: 0.26,
      metalness: 0.85,
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

    if (archetype !== 'helix' && archetype !== 'warden_prime') {
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
      // HELIX-04 — Security Marshal: Helical Cutter Cage, Anchor Maul & Cleaver
      // =======================================================================
      const outerTorus = new THREE.Mesh(
        new THREE.TorusGeometry(1.52, 0.075, 14, 48),
        slateFrameMat
      );
      outerTorus.rotation.x = Math.PI * 0.36;
      outerHelixRing.add(outerTorus);

      const helixBladeGeo = createExtrudedFinGeometry(0.14, 0.92, 0.56, 0.32);
      for (let b = 0; b < 4; b++) {
        const bAngle = (b / 4) * Math.PI * 2;
        const bladeHolder = new THREE.Group();
        bladeHolder.rotation.y = bAngle;
        outerHelixRing.add(bladeHolder);

        const cutterFin = new THREE.Mesh(helixBladeGeo, ceramicArmorMat);
        cutterFin.position.set(0, 0, 1.52);
        cutterFin.rotation.x = 0.35;
        bladeHolder.add(cutterFin);

        const cutterEdge = new THREE.Mesh(
          new RoundedBoxGeometry(0.06, 0.78, 0.12, 2, 0.02),
          cyanConduitMat
        );
        cutterEdge.position.set(0, 0, 1.78);
        cutterEdge.rotation.x = 0.35;
        bladeHolder.add(cutterEdge);
      }

      const innerTorus = new THREE.Mesh(
        new THREE.TorusGeometry(1.22, 0.055, 12, 40),
        bronzeActuatorMat
      );
      innerTorus.rotation.x = -Math.PI * 0.32;
      innerHelixRing.add(innerTorus);

      const innerEnergyTorus = new THREE.Mesh(
        new THREE.TorusGeometry(1.18, 0.032, 10, 36),
        cyanConduitMat
      );
      innerEnergyTorus.rotation.y = Math.PI * 0.28;
      innerHelixRing.add(innerEnergyTorus);

      // Massive Articulated Shoulder Pauldrons & Dorsal Reactor Pylons
      for (const side of [-1, 1]) {
        const shoulderArmor = new THREE.Mesh(
          new RoundedBoxGeometry(0.76, 0.68, 0.96, 4, 0.12),
          ceramicArmorMat
        );
        shoulderArmor.position.set(side * 1.24, 1.04, 0.02);
        shoulderArmor.rotation.z = -side * 0.22;
        shoulderArmor.castShadow = enableShadows;
        torsoPivot.add(shoulderArmor);
        primaryMeshes.push(shoulderArmor);

        const shoulderCoil = new THREE.Mesh(
          new RoundedBoxGeometry(0.18, 0.48, 0.56, 2, 0.04),
          warningAmberMat
        );
        shoulderCoil.position.set(side * 1.56, 1.02, 0.02);
        torsoPivot.add(shoulderCoil);

        const dorsalPylon = new THREE.Mesh(
          new THREE.CylinderGeometry(0.14, 0.2, 0.96, 14),
          darkTitaniumMat
        );
        dorsalPylon.position.set(side * 0.62, 1.48, -0.44);
        dorsalPylon.rotation.x = -0.28;
        dorsalPylon.rotation.z = -side * 0.18;
        torsoPivot.add(dorsalPylon);

        const pylonCap = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.14, 12),
          cyanConduitMat
        );
        pylonCap.position.set(side * 0.7, 1.92, -0.56);
        pylonCap.rotation.x = -0.28;
        pylonCap.rotation.z = -side * 0.18;
        torsoPivot.add(pylonCap);
      }

      // Crowned Warden Sensor Head Unit
      const wardenHelm = new THREE.Mesh(
        new RoundedBoxGeometry(0.74, 0.52, 0.68, 4, 0.1),
        darkTitaniumMat
      );
      headPivot.add(wardenHelm);

      const helmCrest = new THREE.Mesh(
        new RoundedBoxGeometry(0.22, 0.36, 0.76, 3, 0.05),
        ceramicArmorMat
      );
      helmCrest.position.set(0, 0.26, -0.02);
      headPivot.add(helmCrest);

      const visorArray = new THREE.Mesh(
        new RoundedBoxGeometry(0.58, 0.14, 0.14, 2, 0.03),
        warningAmberMat
      );
      visorArray.position.set(0, 0.02, 0.32);
      headPivot.add(visorArray);

      // Right Arm (weaponPivot): Pile-Bunker Anchor Maul (Vector Ram + Anchor Slam)
      const rightUpperLimb = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.22, 0.56, 8, 14),
        darkTitaniumMat
      );
      rightUpperLimb.position.set(0, -0.26, 0.18);
      rightUpperLimb.rotation.x = Math.PI * 0.34;
      weaponPivot.add(rightUpperLimb);

      const bunkerShaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.13, 2.35, 16),
        slateFrameMat
      );
      bunkerShaft.rotation.x = Math.PI / 2;
      bunkerShaft.position.set(0, -0.22, 0.96);
      weaponPivot.add(bunkerShaft);

      const anchorMaulHead = new THREE.Mesh(
        new RoundedBoxGeometry(0.88, 0.78, 1.06, 4, 0.14),
        ceramicArmorMat
      );
      anchorMaulHead.position.set(0, -0.22, 1.92);
      anchorMaulHead.castShadow = enableShadows;
      weaponPivot.add(anchorMaulHead);
      primaryMeshes.push(anchorMaulHead);

      const maulRamPiston = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.44, 1.18, 20),
        darkTitaniumMat
      );
      maulRamPiston.rotation.z = Math.PI / 2;
      maulRamPiston.position.set(0, -0.22, 1.98);
      weaponPivot.add(maulRamPiston);

      for (const mz of [1.62, 2.22]) {
        const gravCoil = new THREE.Mesh(
          new THREE.TorusGeometry(0.45, 0.055, 12, 28),
          warningAmberMat
        );
        gravCoil.position.set(0, -0.22, mz);
        weaponPivot.add(gravCoil);
      }

      // Left Arm (secondaryPivot): Tri-Blade Helical Cleaver Assembly (Helical Sweep)
      const leftUpperLimb = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.2, 0.52, 8, 14),
        darkTitaniumMat
      );
      leftUpperLimb.position.set(0, -0.24, 0.2);
      leftUpperLimb.rotation.x = Math.PI * 0.36;
      secondaryPivot.add(leftUpperLimb);

      const cleaverHub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.36, 0.36, 0.24, 18),
        bronzeActuatorMat
      );
      cleaverHub.position.set(-0.08, -0.32, 0.86);
      secondaryPivot.add(cleaverHub);

      const sweepBladeGeo = createCurvedBladeGeometry(1.68, 0.34, 0.065);
      for (let sb = 0; sb < 3; sb++) {
        const sbPivot = new THREE.Group();
        sbPivot.position.set(-0.08, -0.32, 0.86);
        sbPivot.rotation.y = (sb - 1) * 0.38;
        secondaryPivot.add(sbPivot);

        const sweepBlade = new THREE.Mesh(sweepBladeGeo, cyanConduitMat);
        sweepBlade.position.set(0, 0, 0.12);
        sbPivot.add(sweepBlade);
      }
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
  } else {
    // =========================================================================
    // SCOUT-D4 — Pulse Recon Drone
    // =========================================================================
    const pearlShellMat = new THREE.MeshStandardMaterial({
      color: 0xeef4fb,
      bumpMap: armorBump,
      bumpScale: 0.006,
      roughness: 0.18,
      metalness: 0.65,
    });
    const darkChassisMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.75,
    });
    const magentaAccentMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xd946ef,
      emissiveIntensity: 1.25,
      roughness: 0.2,
      metalness: 0.5,
    });

    const upperCarapace = new THREE.Mesh(
      new THREE.SphereGeometry(0.56, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.62),
      pearlShellMat
    );
    upperCarapace.scale.set(1.04, 0.82, 1.18);
    upperCarapace.position.set(0, 1.72, -0.04);
    upperCarapace.castShadow = enableShadows;
    bodyGroup.add(upperCarapace);
    primaryMeshes.push(upperCarapace);

    const lowerChassis = new THREE.Mesh(
      new THREE.CylinderGeometry(0.52, 0.32, 0.34, 24),
      darkChassisMat
    );
    lowerChassis.position.set(0, 1.54, -0.02);
    lowerChassis.castShadow = enableShadows;
    bodyGroup.add(lowerChassis);
    primaryMeshes.push(lowerChassis);

    secondaryPivot.position.set(0, 1.66, -0.02);
    bodyGroup.add(secondaryPivot);

    const stabilizerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.68, 0.032, 10, 36),
      darkChassisMat
    );
    stabilizerRing.rotation.x = Math.PI / 2;
    secondaryPivot.add(stabilizerRing);

    const droneFinGeo = createExtrudedFinGeometry(0.06, 0.38, 0.42, 0.35);
    for (let r = 0; r < 3; r++) {
      const a = (r / 3) * Math.PI * 2 + Math.PI / 3;
      const finHolder = new THREE.Group();
      finHolder.rotation.y = a;
      secondaryPivot.add(finHolder);

      const finMesh = new THREE.Mesh(droneFinGeo, pearlShellMat);
      finMesh.position.set(0, 0.04, -0.68);
      finHolder.add(finMesh);

      const finTip = new THREE.Mesh(
        new RoundedBoxGeometry(0.08, 0.08, 0.24, 2, 0.02),
        magentaAccentMat
      );
      finTip.position.set(0, 0.14, -0.72);
      finHolder.add(finTip);
    }

    const opticShroud = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.32, 0.22, 24),
      darkChassisMat
    );
    opticShroud.rotation.x = Math.PI / 2;
    opticShroud.position.set(0, 1.64, 0.46);
    bodyGroup.add(opticShroud);

    const targetingRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.024, 10, 28),
      magentaAccentMat
    );
    targetingRing.position.set(0, 1.64, 0.56);
    bodyGroup.add(targetingRing);

    coreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.21, 20, 20), coreMaterial);
    coreMesh.position.set(0, 1.64, 0.5);
    bodyGroup.add(coreMesh);

    coreRimMesh = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.36, 28), coreRimMaterial);
    coreRimMesh.position.set(0, 1.64, 0.58);
    bodyGroup.add(coreRimMesh);

    weaponPivot.position.set(0, 1.36, 0.18);
    bodyGroup.add(weaponPivot);

    const emitterMount = new THREE.Mesh(
      new RoundedBoxGeometry(0.22, 0.18, 0.38, 3, 0.04),
      pearlShellMat
    );
    weaponPivot.add(emitterMount);

    const emitterBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.095, 0.56, 16),
      darkChassisMat
    );
    emitterBarrel.rotation.x = Math.PI / 2;
    emitterBarrel.position.set(0, -0.02, 0.28);
    weaponPivot.add(emitterBarrel);

    const emitterMuzzle = new THREE.Mesh(
      new THREE.TorusGeometry(0.075, 0.022, 10, 20),
      magentaAccentMat
    );
    emitterMuzzle.position.set(0, -0.02, 0.55);
    weaponPivot.add(emitterMuzzle);
  }

  // Ground Telegraph AoE Disc & Expanding Warning Ring
  const telegraphRadius =
    archetype === 'scout' || archetype === 'null_weaver'
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

  if (archetype === 'scout' || archetype === 'null_weaver') {
    laserSightMaterial = new THREE.MeshBasicMaterial({
      color: archetype === 'null_weaver' ? 0xa855f7 : 0xec4899,
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
  };
}

function ramFieldFlipZ(mesh: THREE.Mesh): void {
  mesh.rotation.z = Math.PI;
}

export interface ChronoPlateAndReceiverRig {
  root: THREE.Group;
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

  // Ground Chrono Echo Footprint Ring + Outer Temporal Ripple Ring + Directional Facing Chevron
  const echoBaseRing = new THREE.Mesh(
    new THREE.RingGeometry(0.62, 0.76, 36),
    new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  echoBaseRing.rotation.x = -Math.PI / 2;
  echoBaseRing.position.y = 0.032;
  rig.root.add(echoBaseRing);

  const echoBaseRippleMesh = new THREE.Mesh(
    new THREE.RingGeometry(0.78, 0.9, 36),
    new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.42,
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

  // Inner Holographic Wireframe Core Lattice + Dual Rising Temporal Scan Rings
  const echoInnerWireMesh = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.28, 1),
    new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    })
  );
  echoInnerWireMesh.position.set(0, 0.36, 0.02);
  rig.torsoPivot.add(echoInnerWireMesh);
  rig.echoInnerWireMesh = echoInnerWireMesh;

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

  // 1. Chrono Anchor Pressure Plate 01 (Stage 1 TEACH) at (cfg.x, 0, cfg.z)
  const plateBaseGroup = new THREE.Group();
  plateBaseGroup.position.set(cfg.x, 0, cfg.z);
  root.add(plateBaseGroup);

  // Octagonal beveled socket rim + 4 corner bronze hydraulic stanchion pods
  const outerRim = new THREE.Mesh(
    new THREE.CylinderGeometry(cfg.radius * 1.08, cfg.radius * 1.18, 0.09, 16),
    housingMat
  );
  outerRim.position.y = 0.045;
  outerRim.receiveShadow = enableShadows;
  plateBaseGroup.add(outerRim);

  for (let c = 0; c < 4; c++) {
    const ca = (c / 4) * Math.PI * 2;
    const pod = new THREE.Mesh(
      new RoundedBoxGeometry(0.28, 0.14, 0.36, 2, 0.03),
      bronzeAccentMat
    );
    pod.rotation.y = ca;
    pod.position.set(
      Math.sin(ca) * (cfg.radius * 1.12),
      0.07,
      Math.cos(ca) * (cfg.radius * 1.12)
    );
    plateBaseGroup.add(pod);
  }

  const outerTriggerRing = new THREE.Mesh(
    new THREE.RingGeometry(cfg.radius - 0.09, cfg.radius + 0.04, 40),
    padRingMaterial
  );
  outerTriggerRing.rotation.x = -Math.PI / 2;
  outerTriggerRing.position.y = 0.028;
  plateBaseGroup.add(outerTriggerRing);

  // Depressible Inner Pad Group
  const padGroup = new THREE.Group();
  padGroup.position.y = 0.075;
  plateBaseGroup.add(padGroup);

  const innerPadPlate = new THREE.Mesh(
    new THREE.CylinderGeometry(cfg.radius * 0.78, cfg.radius * 0.84, 0.07, 24),
    alloyMat
  );
  innerPadPlate.receiveShadow = enableShadows;
  padGroup.add(innerPadPlate);

  const centerCoreDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(cfg.radius * 0.48, cfg.radius * 0.48, 0.085, 20),
    padCoreMaterial
  );
  centerCoreDisc.position.y = 0.01;
  padGroup.add(centerCoreDisc);

  // 4 Mechanical Chevron Claws around the Pressure Plate
  const clawPivots: THREE.Group[] = [];
  const clawGeo = new RoundedBoxGeometry(0.24, 0.15, 0.4, 2, 0.03);
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const pivot = new THREE.Group();
    pivot.rotation.y = angle;
    pivot.position.set(
      Math.sin(angle) * (cfg.radius * 0.88),
      0.08,
      Math.cos(angle) * (cfg.radius * 0.88)
    );
    const clawMesh = new THREE.Mesh(clawGeo, alloyMat);
    clawMesh.position.set(0, 0.04, -0.08);
    pivot.add(clawMesh);
    plateBaseGroup.add(pivot);
    clawPivots.push(pivot);
  }

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
  root.add(conduitHousing);

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
  root.add(conduitCore);

  // 3. Stage 1 Receiver Socket, Twin Gate Jamb Pylons & Retractable Containment Barrier at (cfg.receiverX, 0, cfg.receiverZ)
  const receiverRoot = new THREE.Group();
  receiverRoot.position.set(cfg.receiverX, 0, cfg.receiverZ);
  root.add(receiverRoot);

  const socketRim = new THREE.Mesh(
    new THREE.CylinderGeometry(cfg.receiverRadius * 1.14, cfg.receiverRadius * 1.24, 0.13, 24),
    housingMat
  );
  socketRim.position.y = 0.065;
  receiverRoot.add(socketRim);

  // Side Gate Jamb Stanchions framing the security barrier threshold
  for (const sideZ of [-1.25, 1.25]) {
    const jambPost = new THREE.Mesh(
      new RoundedBoxGeometry(0.34, cfg.receiverHeight + 0.35, 0.34, 2, 0.04),
      housingMat
    );
    jambPost.position.set(0, (cfg.receiverHeight + 0.35) * 0.5, sideZ);
    receiverRoot.add(jambPost);

    const jambTrim = new THREE.Mesh(
      new RoundedBoxGeometry(0.38, 0.22, 0.38, 2, 0.03),
      bronzeAccentMat
    );
    jambTrim.position.set(0, cfg.receiverHeight + 0.2, sideZ);
    receiverRoot.add(jambTrim);
  }

  const barrierColumnGroup = new THREE.Group();
  receiverRoot.add(barrierColumnGroup);

  const mainBollard = new THREE.Mesh(
    new THREE.CylinderGeometry(
      cfg.receiverRadius * 0.82,
      cfg.receiverRadius * 0.9,
      cfg.receiverHeight,
      20
    ),
    housingMat
  );
  mainBollard.position.y = cfg.receiverHeight * 0.5;
  mainBollard.castShadow = enableShadows;
  mainBollard.receiveShadow = enableShadows;
  barrierColumnGroup.add(mainBollard);

  const barrierCap = new THREE.Mesh(
    new THREE.CylinderGeometry(
      cfg.receiverRadius * 0.92,
      cfg.receiverRadius * 0.84,
      0.28,
      20
    ),
    alloyMat
  );
  barrierCap.position.y = cfg.receiverHeight - 0.14;
  barrierColumnGroup.add(barrierCap);

  const barrierStripMaterial = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 1.45,
    roughness: 0.2,
    metalness: 0.5,
  });

  for (const h of [0.85, 1.75]) {
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(
        cfg.receiverRadius * 0.86,
        cfg.receiverRadius * 0.86,
        0.13,
        20
      ),
      barrierStripMaterial
    );
    band.position.y = h;
    barrierColumnGroup.add(band);
  }

  const receiverBeaconMaterial = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 1.15,
    roughness: 0.2,
    metalness: 0.6,
  });
  const receiverBeaconMesh = new THREE.Mesh(
    new THREE.TorusGeometry(cfg.receiverRadius * 0.72, 0.068, 12, 32),
    receiverBeaconMaterial
  );
  receiverBeaconMesh.position.y = cfg.receiverHeight + 0.55;
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

  // 5. Recorded Origin Anchor Marker on the deck when clip is Ready or in Playback
  const originMarkerGroup = new THREE.Group();
  originMarkerGroup.visible = false;
  const originMarkerRing = new THREE.Mesh(
    new THREE.RingGeometry(0.48, 0.64, 28),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.68,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  originMarkerRing.rotation.x = -Math.PI / 2;
  originMarkerRing.position.y = 0.03;
  originMarkerGroup.add(originMarkerRing);
  root.add(originMarkerGroup);

  // 6. Phase 3 Stage 2 (TEST): Kinetic Resonance Receiver 01 (Strike Pad + Waveguide Rails + Induction Core)
  const hrCfg = puzzleCfg.heavyReceiver;
  const heavyStrikeGroup = new THREE.Group();
  heavyStrikeGroup.position.set(hrCfg.x, 0, hrCfg.z);
  root.add(heavyStrikeGroup);

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

  // Induction Receptor Core Anvil at (hrCfg.targetX, 0, hrCfg.targetZ)
  const receptorGroup = new THREE.Group();
  receptorGroup.position.set(hrCfg.targetX, 0, hrCfg.targetZ);
  root.add(receptorGroup);

  const heavyReceptorCoreMaterial = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 1.3,
    roughness: 0.2,
    metalness: 0.55,
  });

  const floorAnvilBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.76, 0.9, 0.085, 16),
    housingMat
  );
  floorAnvilBase.position.y = 0.042;
  receptorGroup.add(floorAnvilBase);

  const floorAnvilCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.54, 0.1, 16),
    heavyReceptorCoreMaterial
  );
  floorAnvilCore.position.y = 0.052;
  receptorGroup.add(floorAnvilCore);

  // Twin side capacitor stanchions + overhead gantry arch framing the walk lane
  const stanchionOffset = 1.44;
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(
      new RoundedBoxGeometry(0.38, 1.95, 0.46, 2, 0.04),
      housingMat
    );
    post.position.set(side * stanchionOffset, 0.975, 0);
    receptorGroup.add(post);

    const postCore = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 1.4, 0.5),
      heavyReceptorCoreMaterial
    );
    postCore.position.set(side * stanchionOffset, 0.98, 0);
    receptorGroup.add(postCore);
  }

  const overheadArch = new THREE.Mesh(
    new RoundedBoxGeometry(stanchionOffset * 2 + 0.5, 0.24, 0.42, 2, 0.04),
    alloyMat
  );
  overheadArch.position.set(0, 2.55, 0);
  receptorGroup.add(overheadArch);

  const heavyReceptorGyroLeft = new THREE.Mesh(
    new THREE.TorusGeometry(0.38, 0.048, 10, 24),
    heavyReceptorCoreMaterial
  );
  heavyReceptorGyroLeft.position.set(-stanchionOffset, 2.18, 0);
  receptorGroup.add(heavyReceptorGyroLeft);

  const heavyReceptorGyroRight = new THREE.Mesh(
    new THREE.TorusGeometry(0.38, 0.048, 10, 24),
    heavyReceptorCoreMaterial
  );
  heavyReceptorGyroRight.position.set(stanchionOffset, 2.18, 0);
  receptorGroup.add(heavyReceptorGyroRight);

  // 7. Phase 3 Stage 3 (COMBINE): Chrono Anchor Pad 02 at (cpCfg.x, 0, cpCfg.z)
  const cpCfg = puzzleCfg.combinePlate;
  const combinePlateBase = new THREE.Group();
  combinePlateBase.position.set(cpCfg.x, 0, cpCfg.z);
  root.add(combinePlateBase);

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
  root.add(r2bHousing);

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
  root.add(r2bCore);

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
  root.add(p2bHousing);

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
  root.add(p2bCore);

  // 9. Stage 3 Final Combine Barrier (Archive Calibration Barrier) at (fbCfg.x, 0, fbCfg.z)
  const finalBarrierRoot = new THREE.Group();
  finalBarrierRoot.position.set(fbCfg.x, 0, fbCfg.z);
  root.add(finalBarrierRoot);

  const fbSocketRim = new THREE.Mesh(
    new THREE.CylinderGeometry(fbCfg.radius * 1.16, fbCfg.radius * 1.24, 0.13, 24),
    housingMat
  );
  fbSocketRim.position.y = 0.065;
  finalBarrierRoot.add(fbSocketRim);

  for (const sideZ of [-1.28, 1.28]) {
    const fbJamb = new THREE.Mesh(
      new RoundedBoxGeometry(0.36, fbCfg.height + 0.4, 0.36, 2, 0.04),
      housingMat
    );
    fbJamb.position.set(0, (fbCfg.height + 0.4) * 0.5, sideZ);
    finalBarrierRoot.add(fbJamb);
  }

  const finalBarrierColumnGroup = new THREE.Group();
  finalBarrierRoot.add(finalBarrierColumnGroup);

  const fbBollard = new THREE.Mesh(
    new THREE.CylinderGeometry(
      fbCfg.radius * 0.84,
      fbCfg.radius * 0.92,
      fbCfg.height,
      20
    ),
    housingMat
  );
  fbBollard.position.y = fbCfg.height * 0.5;
  fbBollard.castShadow = enableShadows;
  fbBollard.receiveShadow = enableShadows;
  finalBarrierColumnGroup.add(fbBollard);

  const fbCap = new THREE.Mesh(
    new THREE.CylinderGeometry(
      fbCfg.radius * 0.94,
      fbCfg.radius * 0.86,
      0.3,
      20
    ),
    alloyMat
  );
  fbCap.position.y = fbCfg.height - 0.15;
  finalBarrierColumnGroup.add(fbCap);

  const finalBarrierReceiverBandMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 1.4,
    roughness: 0.2,
    metalness: 0.5,
  });
  const fbUpperBand = new THREE.Mesh(
    new THREE.CylinderGeometry(fbCfg.radius * 0.88, fbCfg.radius * 0.88, 0.16, 20),
    finalBarrierReceiverBandMat
  );
  fbUpperBand.position.y = 1.9;
  finalBarrierColumnGroup.add(fbUpperBand);

  const finalBarrierPlateBandMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 1.4,
    roughness: 0.2,
    metalness: 0.5,
  });
  const fbLowerBand = new THREE.Mesh(
    new THREE.CylinderGeometry(fbCfg.radius * 0.88, fbCfg.radius * 0.88, 0.16, 20),
    finalBarrierPlateBandMat
  );
  fbLowerBand.position.y = 0.95;
  finalBarrierColumnGroup.add(fbLowerBand);

  const finalBarrierBeaconMaterial = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 1.25,
    roughness: 0.2,
    metalness: 0.6,
  });
  const finalBarrierBeaconMesh = new THREE.Mesh(
    new THREE.TorusGeometry(fbCfg.radius * 0.76, 0.072, 12, 32),
    finalBarrierBeaconMaterial
  );
  finalBarrierBeaconMesh.position.y = fbCfg.height + 0.58;
  finalBarrierRoot.add(finalBarrierBeaconMesh);

  // 10. Calibration Completion Node West of Final Barrier at (fbCfg.completionX, 0, fbCfg.completionZ)
  const completionRoot = new THREE.Group();
  completionRoot.position.set(fbCfg.completionX, 0, fbCfg.completionZ);
  root.add(completionRoot);

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

  // 11. Phase 4 Echo-Anchor Relay Landing Reticle & Phase Column on Deck
  const relayTargetGroup = new THREE.Group();
  relayTargetGroup.visible = false;
  root.add(relayTargetGroup);

  const relayTargetRingMaterial = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const relayTargetRingMesh = new THREE.Mesh(
    new THREE.RingGeometry(0.48, 0.66, 32),
    relayTargetRingMaterial
  );
  relayTargetRingMesh.rotation.x = -Math.PI / 2;
  relayTargetRingMesh.position.y = 0.036;
  relayTargetGroup.add(relayTargetRingMesh);

  const relayTargetInnerMaterial = new THREE.MeshBasicMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.38,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const relayTargetDisc = new THREE.Mesh(
    new THREE.CircleGeometry(0.4, 24),
    relayTargetInnerMaterial
  );
  relayTargetDisc.rotation.x = -Math.PI / 2;
  relayTargetDisc.position.y = 0.033;
  relayTargetGroup.add(relayTargetDisc);

  const relayTargetColumnMaterial = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.24,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const relayTargetColumnMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.48, 1.35, 20, 1, true),
    relayTargetColumnMaterial
  );
  relayTargetColumnMesh.position.y = 0.68;
  relayTargetGroup.add(relayTargetColumnMesh);

  return {
    root,
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
