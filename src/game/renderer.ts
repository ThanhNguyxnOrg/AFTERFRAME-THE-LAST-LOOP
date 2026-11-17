import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GAME_CONFIG } from './config.ts';
import {
  computeEffectivePixelRatio,
  getDefaultGraphicsSettings,
  getParticleScaleFactor,
  getShadowMapSizeForQuality,
  resolveGraphicsSettings,
} from './performance.ts';
import {
  buildArenaEnvironment,
  buildChapterEnvironment,
  createChronoPlateAndReceiverRig,
  createDustMoteTexture,
  createEchoAfterimageGhost,
  createEchoPlayerRig,
  createEnemyRig,
  createRadialShadowTexture,
  createScorchDecalTexture,
  createSeraPlayerRig,
  createStudioEnvironmentTexture,
  type ChapterEnvironmentRig,
  type ChronoPlateAndReceiverRig,
  type EchoAfterimageGhost,
  type EnemyRig,
  type PlayerRig,
} from './models.ts';
import {
  formatCombatCallouts,
  projectNdcToViewport,
  type CombatCalloutTone,
} from './tactical-hud.ts';
import { resolveActiveLockOnTarget } from './lock-on.ts';
import {
  computeBossTelegraphVisuals,
  computeChronoAuraVisuals,
  computeEchoTetherVisuals,
  computeEnemyDeRezState,
  computeLockOnGroundVisuals,
} from './combat-vfx.ts';
import {
  CHAPTER_VISUAL_LOOKS,
  computeArenaMoodModulation,
  resolveChapterVisualLook,
} from './visual-palette.ts';
import type {
  CameraSettings,
  CampaignChapterId,
  ChronicleLoomEndingId,
  CombatEvent,
  FpsLimitOption,
  GraphicsPreset,
  LightingQuality,
  ObstacleCollider,
  ParticleQuality,
  ShadowQuality,
  WorldState,
} from './types.ts';

// Pre-allocated module-scope math helpers (Zero GC inside requestAnimationFrame)
const _targetAnchor = new THREE.Vector3();
const _desiredCamPos = new THREE.Vector3();
const _lookAtTarget = new THREE.Vector3();
const _dummyObj = new THREE.Object3D();
const _color = new THREE.Color();
const _projVec = new THREE.Vector3();

interface FloatingCalloutSlot {
  active: boolean;
  text: string;
  tone: CombatCalloutTone;
  worldX: number;
  worldY: number;
  worldZ: number;
  age: number;
  maxAge: number;
  driftX: number;
  scale: number;
}

const CALLOUT_POOL_SIZE = 14;
const CALLOUT_TONE_COLOR: Record<CombatCalloutTone, string> = {
  crit: '#ffffff',
  parry: '#38bdf8',
  slip: '#67e8f9',
  converge: '#22d3ee',
  stagger: '#fbbf24',
  normal: '#e2e8f0',
  blocked: '#f59e0b',
  hurt: '#f87171',
};

const MATERIAL_TEXTURE_SLOTS = [
  'map',
  'bumpMap',
  'roughnessMap',
  'emissiveMap',
  'alphaMap',
  'normalMap',
  'metalnessMap',
  'aoMap',
  'lightMap',
] as const;

function disposeMeshResources(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.Points)) return;
    if (object.geometry) geometries.add(object.geometry);
    const collectMaterial = (material: THREE.Material | undefined) => {
      if (!material) return;
      materials.add(material);
      const matRecord = material as unknown as Record<string, unknown>;
      for (let i = 0; i < MATERIAL_TEXTURE_SLOTS.length; i++) {
        const tex = matRecord[MATERIAL_TEXTURE_SLOTS[i]];
        if (tex instanceof THREE.Texture) {
          textures.add(tex);
        }
      }
    };
    if (Array.isArray(object.material)) {
      object.material.forEach(collectMaterial);
    } else {
      collectMaterial(object.material);
    }
    if (object instanceof THREE.InstancedMesh && typeof object.dispose === 'function') {
      object.dispose();
    }
  });
  textures.forEach((texture) => texture.dispose());
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}

interface PooledParticle {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  age: number;
  maxAge: number;
  size: number;
  r: number;
  g: number;
  b: number;
}

interface EchoPoseSample {
  valid: boolean;
  time: number;
  x: number;
  z: number;
  rotY: number;
  bodyY: number;
  bodyRotX: number;
  bodyRotZ: number;
  torsoRotX: number;
  torsoRotY: number;
  torsoRotZ: number;
  leftLegX: number;
  rightLegX: number;
  leftArmX: number;
  leftArmY: number;
  leftArmZ: number;
  rightArmX: number;
  rightArmY: number;
  rightArmZ: number;
}

const PARTICLE_POOL_SIZE = 144;
const ECHO_HISTORY_SIZE = 24;
const SLASH_RIBBON_POOL_SIZE = 6;
const DASH_GHOST_POOL_SIZE = 4;
const EXEC_BEACON_POOL_SIZE = 4;
const DECAL_POOL_SIZE = 12;
const DUST_MOTE_COUNT = 120;

interface ScorchDecalSlot {
  active: boolean;
  age: number;
  maxAge: number;
  baseOpacity: number;
  targetScale: number;
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
}

interface SlashRibbonSlot {
  active: boolean;
  age: number;
  maxAge: number;
  spinDir: number;
  startScale: number;
  baseOpacity: number;
  group: THREE.Group;
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
}

interface DashGhostSlot {
  active: boolean;
  age: number;
  maxAge: number;
  group: THREE.Group;
  mat: THREE.MeshBasicMaterial;
}

interface StaggerBeaconSlot {
  group: THREE.Group;
  outerRing: THREE.Mesh;
  innerRing: THREE.Mesh;
  pillar: THREE.Mesh;
  ringMat: THREE.MeshBasicMaterial;
  pillarMat: THREE.MeshBasicMaterial;
}

function dampAngle(current: number, target: number, alpha: number): number {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return current + diff * alpha;
}

function dampEuler(
  euler: THREE.Euler,
  tx: number,
  ty: number,
  tz: number,
  alpha: number
): void {
  euler.x += (tx - euler.x) * alpha;
  euler.y = dampAngle(euler.y, ty, alpha);
  euler.z += (tz - euler.z) * alpha;
}

/**
 * Analytical 3D camera collision solver against the circular arena boundary and cylindrical pillars.
 * Replaces expensive per-frame recursive triangle raycasting with zero allocations.
 */
function computeCameraClearDistance(
  anchorX: number,
  anchorY: number,
  anchorZ: number,
  dirX: number,
  dirY: number,
  dirZ: number,
  desiredDist: number,
  obstacles: ObstacleCollider[],
  arenaRadius: number
): number {
  let bestDist = desiredDist;
  const horizLenSq = dirX * dirX + dirZ * dirZ;

  // 1. Clamp inside circular arena perimeter bulkhead (radius - margin)
  const wallLimitRadius = arenaRadius - 0.55;
  if (horizLenSq > 0.0001) {
    const b = 2 * (anchorX * dirX + anchorZ * dirZ);
    const c = anchorX * anchorX + anchorZ * anchorZ - wallLimitRadius * wallLimitRadius;
    const disc = b * b - 4 * horizLenSq * c;
    if (disc > 0) {
      const tWall = (-b + Math.sqrt(disc)) / (2 * horizLenSq);
      if (tWall > 0 && tWall < bestDist) {
        bestDist = Math.max(GAME_CONFIG.camera.minDistance, tWall);
      }
    }
  }

  // 2. Check cylindrical cover pillars & central Loom pylon
  if (horizLenSq > 0.0001) {
    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      if (obs.disabled) continue;
      const padRadius = obs.radius + 0.38;
      const ox = anchorX - obs.x;
      const oz = anchorZ - obs.z;
      const b = 2 * (ox * dirX + oz * dirZ);
      const c = ox * ox + oz * oz - padRadius * padRadius;
      const disc = b * b - 4 * horizLenSq * c;
      if (disc <= 0) continue;

      const sqrtDisc = Math.sqrt(disc);
      const tHit = (-b - sqrtDisc) / (2 * horizLenSq);
      if (tHit > 0.1 && tHit < bestDist) {
        const hitY = anchorY + dirY * tHit;
        if (hitY <= obs.height + 0.25) {
          bestDist = Math.max(GAME_CONFIG.camera.minDistance, tHit - 0.15);
        }
      }
    }
  }

  return bestDist;
}

const CHAPTER_IDS: CampaignChapterId[] = [
  'prologue',
  'chapter_1_helix',
  'chapter_2_choir',
  'chapter_3_curator',
  'chapter_4_matron',
  'chapter_5_loom',
];

const PUBLIC_ASSET_BASE = (() => {
  try {
    return import.meta.env.BASE_URL || '/';
  } catch {
    // The Node-based asset lifecycle tests execute outside Vite.
    return '/';
  }
})();

const BLENDER_CHAPTER_ASSETS: Partial<
  Record<CampaignChapterId, { url: string; x: number; z: number; scale: number; rotationY: number }>
> = {
  chapter_1_helix: {
    url: `${PUBLIC_ASSET_BASE}assets/blender/phase12/helix_containment_gate.glb`,
    x: 0,
    z: -16.5,
    scale: 1,
    rotationY: 0,
  },
  chapter_2_choir: {
    url: `${PUBLIC_ASSET_BASE}assets/blender/phase12/choir_acoustic_organ.glb`,
    x: 0,
    z: -14.2,
    scale: 0.95,
    rotationY: 0,
  },
  chapter_3_curator: {
    url: `${PUBLIC_ASSET_BASE}assets/blender/phase12/curator_archive_monolith.glb`,
    x: 0,
    z: -14.2,
    scale: 1.05,
    rotationY: 0,
  },
  chapter_4_matron: {
    url: `${PUBLIC_ASSET_BASE}assets/blender/phase12/matron_surgical_pod.glb`,
    x: 0,
    z: -14,
    scale: 1,
    rotationY: 0,
  },
};

export class ArenaSceneRenderer {
  private renderer: THREE.WebGLRenderer | null = null;
  private webglAvailable = false;
  private webglContextLost = false;
  private readonly onContextLostBound = (e: Event) => {
    e.preventDefault();
    this.webglContextLost = true;
  };
  private readonly onContextRestoredBound = () => {
    this.webglContextLost = false;
  };
  private scene: THREE.Scene;
  private sceneFog: THREE.FogExp2;
  private camera: THREE.PerspectiveCamera;
  private isHeadless: boolean;
  private appliedPixelRatio: number;

  private playerRig: PlayerRig;
  private echoRig: PlayerRig;
  private echoGhosts: EchoAfterimageGhost[] = [];
  private echoHistory: EchoPoseSample[] = [];
  private echoHistoryHead = 0;
  private echoSampleTimer = 0;

  private chronoPlateRig: ChronoPlateAndReceiverRig;
  private enemyRigs = new Map<string, EnemyRig>();
  private enemyGuardRecoilTimers = new Map<string, number>();

  private loomPylonGroup: THREE.Group;
  private loomRingMesh: THREE.Mesh;
  private loomInnerRingMesh: THREE.Mesh;
  private loomOuterRingMesh: THREE.Mesh;
  private loomWitnessBeamMesh: THREE.Mesh;
  private loomWitnessBeamMat: THREE.MeshBasicMaterial;
  private loomContinuityDomeMesh: THREE.Mesh;
  private loomContinuityDomeMat: THREE.MeshBasicMaterial;
  private composer?: EffectComposer | null = null;
  private bloomPass?: UnrealBloomPass | null = null;
  private bloomEnabled = false;
  private loomLightShaftMat: THREE.MeshBasicMaterial;
  private ventFanMeshes: THREE.Mesh[];
  private conduitGlowMat: THREE.MeshBasicMaterial;
  private hemiLight: THREE.HemisphereLight;
  private keyLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private loomLight: THREE.PointLight;
  private calLight: THREE.PointLight;
  private shadowTex: THREE.CanvasTexture;
  private studioEnvTex: THREE.CanvasTexture;
  private pmremEnvTarget?: THREE.WebGLRenderTarget | null = null;
  private scorchTex: THREE.CanvasTexture;
  private decalSlots: ScorchDecalSlot[] = [];
  private decalNextIdx = 0;
  private dustMoteTex: THREE.CanvasTexture;
  private dustPoints: THREE.Points;
  private dustPositions: Float32Array;
  private dustPhases: Float32Array;
  private dustMat: THREE.PointsMaterial;
  private echoTetherMesh: THREE.Mesh;
  private echoTetherMat: THREE.MeshBasicMaterial;

  private particleInstancedMesh: THREE.InstancedMesh;
  private particles: PooledParticle[] = [];
  private nextParticleIdx = 0;
  private particleColorsDirty = false;

  private calloutMountEl: HTMLElement | null = null;
  private calloutSlots: FloatingCalloutSlot[] = Array.from({ length: CALLOUT_POOL_SIZE }, () => ({
    active: false,
    text: '',
    tone: 'normal',
    worldX: 0,
    worldY: 0,
    worldZ: 0,
    age: 0,
    maxAge: 0.7,
    driftX: 0,
    scale: 1,
  }));
  private calloutNodes: HTMLDivElement[] = [];
  private calloutNextIdx = 0;
  private hasActiveCallouts = false;

  private resonanceMarkerGroup: THREE.Group;
  private resonanceOuterRingMesh: THREE.Mesh;
  private resonanceOuterRingMat: THREE.MeshBasicMaterial;
  private resonanceInnerRingMesh: THREE.Mesh;
  private resonanceInnerRingMat: THREE.MeshBasicMaterial;
  private resonanceCrownMesh: THREE.Mesh;
  private resonanceCrownMat: THREE.MeshBasicMaterial;
  private convergenceWaveMesh: THREE.Mesh;
  private convergenceWaveMat: THREE.MeshBasicMaterial;
  private convergencePillarMesh: THREE.Mesh;
  private convergencePillarMat: THREE.MeshBasicMaterial;

  // Single-trigger authoritative combat & Relay VFX meshes
  private relayOriginPillarMesh: THREE.Mesh;
  private relayOriginPillarMat: THREE.MeshBasicMaterial;
  private relayArrivalPillarMesh: THREE.Mesh;
  private relayArrivalPillarMat: THREE.MeshBasicMaterial;
  private relayVfxTimer = 0;

  private impactRingMesh: THREE.Mesh;
  private impactRingMat: THREE.MeshBasicMaterial;
  private impactRingTimer = 0;
  private impactRingDuration = 0.28;

  private railBeamMesh?: THREE.Mesh;
  private railBeamMat?: THREE.MeshBasicMaterial;
  private railBeamTimer = 0;
  private hitstopTimer = 0;
  private fovKick = 0;
  private resonanceFlash = 0;

  // v1.2.0 Pooled Weapon Slash Arc Ribbons, Dash Afterimage Ghosts & 60fps Lock-On Reticle DOM Ref
  private slashRibbonSlots: SlashRibbonSlot[] = [];
  private slashRibbonNextIdx = 0;
  private dashGhostSlots: DashGhostSlot[] = [];
  private dashGhostNextIdx = 0;
  private dashGhostSpawnCooldown = 0;
  private staggerBeaconSlots: StaggerBeaconSlot[] = [];
  private lockOnEl: HTMLDivElement | null = null;
  private lockOnGroundGroup?: THREE.Group;
  private lockOnOuterRingMesh?: THREE.Mesh;
  private lockOnOuterRingMat?: THREE.MeshBasicMaterial;
  private lockOnInnerDiscMesh?: THREE.Mesh;
  private lockOnInnerDiscMat?: THREE.MeshBasicMaterial;

  // Phase 14 Pooled Pulsecaster Projectile Meshes
  private projectilesGroup: THREE.Group;
  private projectileRigs: Array<{
    group: THREE.Group;
    coreMesh: THREE.Mesh;
    coreMat: THREE.MeshBasicMaterial;
    haloMesh: THREE.Mesh;
    haloMat: THREE.MeshBasicMaterial;
  }> = [];

  // Chapter II-IV Arena Mechanics Meshes
  private choirNodesGroup: THREE.Group;
  private choirNodeRigs: Array<{
    group: THREE.Group;
    coreMesh: THREE.Mesh;
    coreMat: THREE.MeshStandardMaterial;
    ringMesh: THREE.Mesh;
    ringMat: THREE.MeshBasicMaterial;
    tetherMesh: THREE.Mesh;
    tetherMat: THREE.MeshBasicMaterial;
  }> = [];
  private gravityPinMesh: THREE.Mesh;
  private gravityPinMat: THREE.MeshBasicMaterial;
  private chronoSeverMesh: THREE.Mesh;
  private chronoSeverMat: THREE.MeshBasicMaterial;
  private chronoSeverWallMesh: THREE.Mesh;
  private chronoSeverWallMat: THREE.MeshBasicMaterial;
  private chronoSeverStrutsGroup: THREE.Group;
  private chronoSeverStrutMat: THREE.MeshBasicMaterial;
  private echoCollapseWaveMesh: THREE.Mesh;
  private echoCollapseWaveMat: THREE.MeshBasicMaterial;
  private curatorTraceMeshes: Array<{
    mesh: THREE.Mesh;
    mat: THREE.MeshBasicMaterial;
    curtainMesh: THREE.Mesh;
    curtainMat: THREE.MeshBasicMaterial;
    edgeMeshes: THREE.Mesh[];
    edgeMat: THREE.MeshBasicMaterial;
  }> = [];

  // Phase 11 Sector Storytelling 3D Landmarks (Zero-GC pre-allocated groups)
  private helixLandmarksGroup: THREE.Group;
  private helixBeaconMats: THREE.MeshBasicMaterial[] = [];
  private helixBeaconRings: THREE.Mesh[] = [];
  private choirLandmarksGroup: THREE.Group;
  private choirWaveRingMats: THREE.MeshBasicMaterial[] = [];
  private choirWaveRingMeshes: THREE.Mesh[] = [];
  private curatorLandmarksGroup: THREE.Group;
  private curatorShardMeshes: THREE.Mesh[] = [];
  private curatorShardMats: THREE.MeshBasicMaterial[] = [];
  private matronLandmarksGroup: THREE.Group;
  private matronScanRings: THREE.Mesh[] = [];
  private matronScanMats: THREE.MeshBasicMaterial[] = [];
  private loomSealsGroup: THREE.Group;
  private loomSealCrystals: THREE.Mesh[] = [];
  private loomSealMats: THREE.MeshBasicMaterial[] = [];
  private loomSealTetherMats: THREE.MeshBasicMaterial[] = [];
  private chapterEnvironments = new Map<CampaignChapterId, ChapterEnvironmentRig>();
  private obstacleMeshes: THREE.Object3D[] = [];
  private obstacleMeshById?: Map<string, THREE.Object3D>;
  private subDeckFans: THREE.Object3D[] = [];
  private floorTelemetryMat?: THREE.ShaderMaterial;
  private skyDomeMat?: THREE.ShaderMaterial;
  private planetMat?: THREE.ShaderMaterial;
  private planetRingMat?: THREE.ShaderMaterial;
  private orbitalDrydockGroup?: THREE.Group;
  private beamConeMat?: THREE.MeshBasicMaterial;
  private dynamicObstaclesGroup?: THREE.Group;
  private dynamicObstacleRigs: Array<{
    group: THREE.Group;
    wallGroup: THREE.Group;
    crateGroup: THREE.Group;
    trimMat: THREE.MeshStandardMaterial;
    coreMat: THREE.MeshBasicMaterial;
    hitTimer: number;
    lastHp: number;
    lastObstacleId: string | null;
  }> = [];
  private boostPadsGroup?: THREE.Group;
  private boostPadRigs: Array<{
    group: THREE.Group;
    outerRing: THREE.Mesh;
    chevronMesh: THREE.Mesh;
    ringMat: THREE.MeshBasicMaterial;
    chevronMat: THREE.MeshBasicMaterial;
  }> = [];
  private interactablesGroup: THREE.Group;
  private interactableRigs: Array<{
    group: THREE.Group;
    coreMesh: THREE.Mesh;
    coreMat: THREE.MeshBasicMaterial;
    holoPaneMat: THREE.MeshBasicMaterial;
    ringMesh: THREE.Mesh;
    ringMat: THREE.MeshBasicMaterial;
  }> = [];
  private hazardsGroup: THREE.Group;
  private hazardRigs: Array<{
    group: THREE.Group;
    ringMesh: THREE.Mesh;
    ringMat: THREE.MeshBasicMaterial;
    columnMesh: THREE.Mesh;
    columnMat: THREE.ShaderMaterial;
  }> = [];
  private secretsGroup: THREE.Group;
  private secretRigs: Array<{
    group: THREE.Group;
    coreMesh: THREE.Mesh;
    coreMat: THREE.MeshBasicMaterial;
    ringMesh: THREE.Mesh;
    ringMat: THREE.MeshBasicMaterial;
  }> = [];
  private fluxPoolsGroup?: THREE.Group;
  private fluxPoolRigs: Array<{
    group: THREE.Group;
    outerRing: THREE.Mesh;
    innerDisc: THREE.Mesh;
    ringMat: THREE.MeshBasicMaterial;
    discMat: THREE.MeshBasicMaterial;
  }> = [];
  private waypointBeaconGroup?: THREE.Group;
  private waypointBeaconRig?: {
    group: THREE.Group;
    ringMesh: THREE.Mesh;
    ringMat: THREE.MeshBasicMaterial;
    columnMesh: THREE.Mesh;
    columnMat: THREE.MeshBasicMaterial;
    diamondMesh: THREE.Mesh;
    diamondMat: THREE.MeshBasicMaterial;
  };
  private disposed = false;

  private viewportWidth = 1280;
  private viewportHeight = 720;
  private graphicsPreset: GraphicsPreset = getDefaultGraphicsSettings().graphicsPreset;
  private renderScale = getDefaultGraphicsSettings().renderScale;
  private shadowQuality: ShadowQuality = getDefaultGraphicsSettings().shadowQuality;
  private particleQuality: ParticleQuality = getDefaultGraphicsSettings().particleQuality;
  private particleScale = getParticleScaleFactor(getDefaultGraphicsSettings().particleQuality);
  private lightingQuality: LightingQuality = getDefaultGraphicsSettings().lightingQuality;
  private fpsLimit: FpsLimitOption = getDefaultGraphicsSettings().fpsLimit;
  private hasActiveParticles = false;
  private lastEnvChapter: CampaignChapterId | null = null;
  private lastEnvEnding: ChronicleLoomEndingId | null | undefined = undefined;
  private lastEnvLightingQuality: LightingQuality | null = null;
  private visibleChapterEnv: ChapterEnvironmentRig | null = null;

  private camAnchor = new THREE.Vector3();
  private currentCamDist: number = GAME_CONFIG.camera.distance;
  private currentCamPos = new THREE.Vector3(0, 8, 20);
  private currentLookAt = new THREE.Vector3(0, 1.2, 8);
  private titleTourAngle = 0;
  private reducedMotion = false;
  private cameraShakeEnabled = true;
  private screenEffectsEnabled = true;
  private isSoftwareGl = false;
  private glVendor = '';
  private glRenderer = '';
  private fallbackEl: { remove?: () => void } | null = null;
  private activeEnemyIdsSet = new Set<string>();
  private prevPlayerRotY = 0;
  private smoothedPlayerTurnRate = 0;
  private prevPlayerVx = 0;
  private prevPlayerVz = 0;
  private smoothedFwdAccel = 0;
  private smoothedSideAccel = 0;
  private prevEchoRotY = 0;
  private smoothedEchoTurnRate = 0;

  constructor(mountEl: HTMLElement, initialWorld: WorldState) {
    this.isHeadless =
      Boolean(navigator.webdriver) || /HeadlessChrome/i.test(navigator.userAgent);

    const width = mountEl.clientWidth || window.innerWidth || 1280;
    const height = mountEl.clientHeight || window.innerHeight || 720;
    this.viewportWidth = width;
    this.viewportHeight = height;

    this.appliedPixelRatio = computeEffectivePixelRatio(
      window.devicePixelRatio || 1,
      GAME_CONFIG.camera.maxPixelRatio,
      this.renderScale,
      this.isHeadless,
      false
    );

    mountEl.innerHTML = '';
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: !this.isHeadless,
        powerPreference: 'high-performance',
      });
      this.webglAvailable = true;
      try {
        const gl = this.renderer.getContext?.();
        if (gl && typeof gl.getParameter === 'function') {
          const debugExt = gl.getExtension?.('WEBGL_debug_renderer_info');
          const vendorStr = String(
            (debugExt ? gl.getParameter(debugExt.UNMASKED_VENDOR_WEBGL) : '') ||
              gl.getParameter(gl.VENDOR) ||
              ''
          );
          const rendererStr = String(
            (debugExt ? gl.getParameter(debugExt.UNMASKED_RENDERER_WEBGL) : '') ||
              gl.getParameter(gl.RENDERER) ||
              ''
          );
          this.glVendor = vendorStr;
          this.glRenderer = rendererStr;
          if (/SwiftShader|llvmpipe|Software|Microsoft Basic Render/i.test(rendererStr)) {
            this.isSoftwareGl = true;
          }
        }
      } catch {
        // Ignore GL renderer query errors
      }
      if (this.isSoftwareGl) {
        this.appliedPixelRatio = computeEffectivePixelRatio(
          window.devicePixelRatio || 1,
          GAME_CONFIG.camera.maxPixelRatio,
          this.renderScale,
          this.isHeadless,
          true
        );
      }
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(this.appliedPixelRatio);
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.02;
      this.renderer.shadowMap.enabled =
        !this.isHeadless && !this.isSoftwareGl && this.shadowQuality !== 'off';
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
      mountEl.appendChild(this.renderer.domElement);

      // WebGL context loss safety listeners
      this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLostBound);
      this.renderer.domElement.addEventListener('webglcontextrestored', this.onContextRestoredBound);
    } catch {
      this.renderer = null;
      this.webglAvailable = false;
      const fallbackEl = document.createElement('div');
      fallbackEl.dataset.testid = 'webgl-fallback-notice';
      fallbackEl.setAttribute('data-testid', 'webgl-fallback-notice');
      fallbackEl.setAttribute('role', 'status');
      fallbackEl.className =
        'w-full h-full flex items-center justify-center bg-[#07090d] text-slate-300 p-6 text-center font-mono text-xs uppercase tracking-widest';
      fallbackEl.textContent =
        '3D SCENE RENDERING DISABLED · WEBGL CONTEXT UNAVAILABLE — HUD & SIMULATION ONLY';
      this.fallbackEl = fallbackEl;
      mountEl.appendChild(fallbackEl);
    }

    this.scene = new THREE.Scene();
    const bgHex = 0x080d16;
    this.scene.background = new THREE.Color(bgHex);
    this.sceneFog = new THREE.FogExp2(bgHex, 0.0165);
    this.scene.fog = this.sceneFog;

    // PBR Studio Reflection Map via PMREMGenerator + RoomEnvironment (falls back to equirectangular studioEnvTex)
    this.studioEnvTex = createStudioEnvironmentTexture();
    if (this.renderer) {
      try {
        const pmrem = new THREE.PMREMGenerator(this.renderer);
        pmrem.compileEquirectangularShader();
        const roomEnv = new RoomEnvironment();
        this.pmremEnvTarget = pmrem.fromScene(roomEnv, 0.04);
        roomEnv.dispose();
        pmrem.dispose();
        this.scene.environment = this.pmremEnvTarget.texture;
        this.scene.environmentIntensity = this.isHeadless || this.isSoftwareGl ? 0.62 : 0.68;
      } catch {
        if (!this.isHeadless && !this.isSoftwareGl) {
          this.scene.environment = this.studioEnvTex;
        }
      }
    } else if (!this.isHeadless && !this.isSoftwareGl) {
      this.scene.environment = this.studioEnvTex;
    }

    this.camera = new THREE.PerspectiveCamera(width / height < 0.75 ? 60 : 52, width / height, 0.1, 120);

    // Initialize camera anchor at player spawn
    this.camAnchor.set(
      initialWorld.player.x,
      GAME_CONFIG.camera.anchorHeight,
      initialWorld.player.z
    );
    this.snapCameraToPlayer(
      initialWorld,
      GAME_CONFIG.camera.defaultYaw,
      GAME_CONFIG.camera.defaultPitch
    );

    // Balanced 3-Point + Practical Industrial Sci-Fi Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x162235, 1.24);
    hemiLight.position.set(0, 28, 0);
    this.scene.add(hemiLight);
    this.hemiLight = hemiLight;

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.65);
    keyLight.position.set(15, 25, 16);
    if (!this.isHeadless) {
      const initShadowSize = getShadowMapSizeForQuality(this.shadowQuality) || 512;
      keyLight.castShadow = !this.isSoftwareGl && this.shadowQuality !== 'off';
      keyLight.shadow.mapSize.width = initShadowSize;
      keyLight.shadow.mapSize.height = initShadowSize;
      const d = 22;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.camera.near = 2;
      keyLight.shadow.camera.far = 60;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);
    this.keyLight = keyLight;

    // Cool Rim/Back Directional Light to sculpt dark metallic silhouettes against the north bulkhead
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.55);
    rimLight.position.set(-14, 19, -17);
    this.scene.add(rimLight);
    this.rimLight = rimLight;

    // Point light on the central Chronicle Loom Pylon
    const loomLight = new THREE.PointLight(0x22d3ee, 5.4, 24, 1.65);
    loomLight.position.set(0, 4.1, -2);
    this.scene.add(loomLight);
    this.loomLight = loomLight;

    // Warm industrial practical accent light near the west calibration sector
    const calLight = new THREE.PointLight(0xf59e0b, 2.6, 17, 1.8);
    calLight.position.set(-6.5, 2.8, 5.2);
    this.scene.add(calLight);
    this.calLight = calLight;

    this.shadowTex = createRadialShadowTexture();
    const maxAniso = this.renderer
      ? this.renderer.capabilities.getMaxAnisotropy()
      : 1;

    const env = buildArenaEnvironment(
      this.scene,
      initialWorld.obstacles,
      this.shadowTex,
      maxAniso,
      !this.isHeadless
    );
    this.loomPylonGroup = env.loomPylonGroup;
    this.loomRingMesh = env.loomRingMesh;
    this.loomInnerRingMesh = env.loomInnerRingMesh;
    this.loomOuterRingMesh = env.loomOuterRingMesh;
    this.loomLightShaftMat = env.loomLightShaftMat;
    this.ventFanMeshes = env.ventFanMeshes;
    this.subDeckFans = env.subDeckFans;
    this.conduitGlowMat = env.conduitGlowMat;
    this.floorTelemetryMat = env.floorTelemetryMat;
    this.skyDomeMat = env.skyDomeMat;
    this.planetMat = env.planetMat;
    this.planetRingMat = env.planetRingMat;
    this.orbitalDrydockGroup = env.orbitalDrydockGroup;
    this.beamConeMat = env.beamConeMat;
    this.obstacleMeshes = env.obstacleMeshes;
    this.obstacleMeshById = env.obstacleMeshById;

    // GPU-only HDR Selective Bloom pipeline (bypassed automatically on Headless / Software-GL / Low preset)
    if (this.renderer && !this.isHeadless && !this.isSoftwareGl) {
      try {
        const composer = new EffectComposer(this.renderer);
        composer.setPixelRatio(this.appliedPixelRatio);
        composer.setSize(width, height);
        composer.addPass(new RenderPass(this.scene, this.camera));
        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(width, height),
          0.12,
          0.22,
          0.94
        );
        composer.addPass(bloomPass);
        composer.addPass(new OutputPass());
        this.composer = composer;
        this.bloomPass = bloomPass;
      } catch {
        this.composer = null;
        this.bloomPass = null;
      }
    }
    this.syncBloomState();

    for (let i = 0; i < CHAPTER_IDS.length; i++) {
      const chapter = CHAPTER_IDS[i];
      const chapterEnv = buildChapterEnvironment(chapter);
      chapterEnv.group.visible = false;
      this.chapterEnvironments.set(chapter, chapterEnv);
      this.scene.add(chapterEnv.group);
    }

    // Chapter V Ending-Reactive Chronicle Loom Visual Assemblies (Witness Orbital Beam & Continuity Sanctuary Dome)
    const witnessBeamGeo = new THREE.CylinderGeometry(0.72, 1.65, 24, 24, 1, true);
    this.loomWitnessBeamMat = new THREE.MeshBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.loomWitnessBeamMesh = new THREE.Mesh(witnessBeamGeo, this.loomWitnessBeamMat);
    this.loomWitnessBeamMesh.position.set(0, 12.5, 0);
    this.loomWitnessBeamMesh.visible = false;
    this.loomPylonGroup.add(this.loomWitnessBeamMesh);

    const continuityDomeGeo = new THREE.IcosahedronGeometry(3.35, 1);
    this.loomContinuityDomeMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0,
      wireframe: true,
      depthWrite: false,
    });
    this.loomContinuityDomeMesh = new THREE.Mesh(
      continuityDomeGeo,
      this.loomContinuityDomeMat
    );
    this.loomContinuityDomeMesh.position.set(0, 2.4, 0);
    this.loomContinuityDomeMesh.visible = false;
    this.loomPylonGroup.add(this.loomContinuityDomeMesh);

    // =========================================================================
    // Phase 11: Chapter I–V 3D Sector Storytelling Landmarks (Pre-allocated)
    // =========================================================================
    const pillarStructMat = new THREE.MeshStandardMaterial({
      color: 0x111a28,
      roughness: 0.42,
      metalness: 0.78,
    });

    // 1. Chapter I (HELIX-04): 4 Perimeter Containment Lockdown Pylons
    this.helixLandmarksGroup = new THREE.Group();
    this.helixLandmarksGroup.visible = false;
    const helixCoords: Array<[number, number]> = [
      [-16.4, -9.2],
      [16.4, -9.2],
      [-16.4, 8.8],
      [16.4, 8.8],
    ];
    const helixPostGeo = new THREE.CylinderGeometry(0.28, 0.36, 3.6, 8);
    const helixRingGeo = new THREE.TorusGeometry(0.56, 0.05, 8, 24);
    for (let i = 0; i < helixCoords.length; i++) {
      const [hx, hz] = helixCoords[i];
      const pGroup = new THREE.Group();
      pGroup.position.set(hx, 0, hz);
      const post = new THREE.Mesh(helixPostGeo, pillarStructMat);
      post.position.y = 1.8;
      pGroup.add(post);

      const bMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.85,
      });
      const bRing = new THREE.Mesh(helixRingGeo, bMat);
      bRing.position.y = 3.1;
      pGroup.add(bRing);

      this.helixBeaconMats.push(bMat);
      this.helixBeaconRings.push(bRing);
      this.helixLandmarksGroup.add(pGroup);
    }
    this.scene.add(this.helixLandmarksGroup);

    // 2. Chapter II (THE CHOIR): 3 Concentric Acoustic Wave Floor Rings
    this.choirLandmarksGroup = new THREE.Group();
    this.choirLandmarksGroup.visible = false;
    const waveRadii = [4.6, 8.2, 11.8];
    for (let i = 0; i < waveRadii.length; i++) {
      const r = waveRadii[i];
      const wGeo = new THREE.RingGeometry(r - 0.12, r, 48);
      wGeo.rotateX(-Math.PI * 0.5);
      const wMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const wMesh = new THREE.Mesh(wGeo, wMat);
      wMesh.position.set(0, 0.032 + i * 0.004, -1.0);
      this.choirWaveRingMats.push(wMat);
      this.choirWaveRingMeshes.push(wMesh);
      this.choirLandmarksGroup.add(wMesh);
    }
    this.scene.add(this.choirLandmarksGroup);

    // 3. Chapter III (THE CURATOR): 4 Perimeter Reconstructed Memory Archive Monoliths
    this.curatorLandmarksGroup = new THREE.Group();
    this.curatorLandmarksGroup.visible = false;
    const curatorCoords: Array<[number, number]> = [
      [-16.2, -9.0],
      [16.2, -9.0],
      [-16.2, 8.8],
      [16.2, 8.8],
    ];
    const monolithGeo = new THREE.BoxGeometry(0.65, 3.2, 0.65);
    const shardGeo = new THREE.OctahedronGeometry(0.45, 0);
    for (let i = 0; i < curatorCoords.length; i++) {
      const [cx, cz] = curatorCoords[i];
      const mGroup = new THREE.Group();
      mGroup.position.set(cx, 0, cz);
      const base = new THREE.Mesh(monolithGeo, pillarStructMat);
      base.position.y = 1.6;
      mGroup.add(base);

      const sMat = new THREE.MeshBasicMaterial({
        color: 0xc084fc,
        wireframe: true,
        transparent: true,
        opacity: 0.85,
      });
      const shard = new THREE.Mesh(shardGeo, sMat);
      shard.position.y = 3.85;
      mGroup.add(shard);

      this.curatorShardMeshes.push(shard);
      this.curatorShardMats.push(sMat);
      this.curatorLandmarksGroup.add(mGroup);
    }
    this.scene.add(this.curatorLandmarksGroup);

    // 4. Chapter IV (MATRON-V): 4 Surgical Quarantine Stasis Columns with Bio-Scan Rings
    this.matronLandmarksGroup = new THREE.Group();
    this.matronLandmarksGroup.visible = false;
    const matronCoords: Array<[number, number]> = [
      [-16.0, -9.0],
      [16.0, -9.0],
      [-16.0, 8.8],
      [16.0, 8.8],
    ];
    const stasisColGeo = new THREE.CylinderGeometry(0.38, 0.38, 3.8, 12);
    const scanRingGeo = new THREE.TorusGeometry(0.58, 0.045, 8, 24);
    scanRingGeo.rotateX(Math.PI * 0.5);
    for (let i = 0; i < matronCoords.length; i++) {
      const [mx, mz] = matronCoords[i];
      const sGroup = new THREE.Group();
      sGroup.position.set(mx, 0, mz);
      const col = new THREE.Mesh(stasisColGeo, pillarStructMat);
      col.position.y = 1.9;
      sGroup.add(col);

      const scMat = new THREE.MeshBasicMaterial({
        color: 0xf43f5e,
        transparent: true,
        opacity: 0.82,
      });
      const scRing = new THREE.Mesh(scanRingGeo, scMat);
      scRing.position.y = 2.0;
      sGroup.add(scRing);

      this.matronScanMats.push(scMat);
      this.matronScanRings.push(scRing);
      this.matronLandmarksGroup.add(sGroup);
    }
    this.scene.add(this.matronLandmarksGroup);

    // 5. Chapter V (THE LAST LOOP): 4 Orbital Override Seal Pedestals linked to Chronicle Loom Core
    this.loomSealsGroup = new THREE.Group();
    this.loomSealsGroup.visible = false;
    const sealCoords: Array<[number, number, number]> = [
      [-4.2, -4.8, 0xf59e0b], // Ch.I HELIX-04 Seal
      [4.2, -4.8, 0x38bdf8],  // Ch.II THE CHOIR Seal
      [-4.8, 0.8, 0xc084fc],  // Ch.III THE CURATOR Seal
      [4.8, 0.8, 0xf43f5e],   // Ch.IV MATRON-V Seal
    ];
    const sealBaseGeo = new THREE.CylinderGeometry(0.32, 0.44, 1.35, 8);
    const sealCrystalGeo = new THREE.OctahedronGeometry(0.32, 0);
    for (let i = 0; i < sealCoords.length; i++) {
      const [sx, sz, sColor] = sealCoords[i];
      const sGroup = new THREE.Group();
      sGroup.position.set(sx, 0, sz);

      const pedestal = new THREE.Mesh(sealBaseGeo, pillarStructMat);
      pedestal.position.y = 0.675;
      sGroup.add(pedestal);

      const cMat = new THREE.MeshBasicMaterial({
        color: sColor,
        transparent: true,
        opacity: 0.9,
      });
      const crystal = new THREE.Mesh(sealCrystalGeo, cMat);
      crystal.position.y = 1.75;
      sGroup.add(crystal);

      // Energy tether connecting the Override Seal crystal (sx, 1.75, sz) to the central Chronicle Loom Core at (0, 2.4, -2)
      const dx = 0 - sx;
      const dy = 2.4 - 1.75;
      const dz = -2 - sz;
      const dist = Math.hypot(dx, dy, dz);
      const tetherGeo = new THREE.CylinderGeometry(0.035, 0.035, dist, 6);
      tetherGeo.rotateX(Math.PI * 0.5);
      const tMat = new THREE.MeshBasicMaterial({
        color: sColor,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      });
      const tether = new THREE.Mesh(tetherGeo, tMat);
      tether.position.set(sx + dx * 0.5, 1.75 + dy * 0.5, sz + dz * 0.5);
      tether.lookAt(0, 2.4, -2);
      this.loomSealsGroup.add(tether);

      this.loomSealCrystals.push(crystal);
      this.loomSealMats.push(cMat);
      this.loomSealTetherMats.push(tMat);
      this.loomSealsGroup.add(sGroup);
    }
    this.scene.add(this.loomSealsGroup);

    // Phase 18: Pre-allocate Pooled Environmental Interactable Rigs (Terminals with Holographic Slabs, Power Nodes, Gate Controls)
    this.interactablesGroup = new THREE.Group();
    this.interactablesGroup.name = 'EnvironmentalInteractablesPool';
    const intPedestalGeo = new THREE.CylinderGeometry(0.28, 0.38, 1.05, 8);
    const intCollarGeo = new THREE.CylinderGeometry(0.35, 0.37, 0.1, 8);
    const intScreenBezelGeo = new THREE.BoxGeometry(0.6, 0.34, 0.042);
    const intHoloScreenGeo = new THREE.BoxGeometry(0.5, 0.24, 0.016);
    const intCoreGeo = new THREE.OctahedronGeometry(0.22, 0);
    const intRingGeo = new THREE.RingGeometry(0.55, 0.72, 24);
    intRingGeo.rotateX(-Math.PI * 0.5);
    for (let i = 0; i < 6; i++) {
      const iGroup = new THREE.Group();
      iGroup.visible = false;
      const ped = new THREE.Mesh(intPedestalGeo, pillarStructMat);
      ped.position.y = 0.525;
      iGroup.add(ped);

      const collar = new THREE.Mesh(intCollarGeo, pillarStructMat);
      collar.position.y = 1.05;
      iGroup.add(collar);

      const screenBezel = new THREE.Mesh(intScreenBezelGeo, pillarStructMat);
      screenBezel.position.set(0, 1.14, 0.14);
      screenBezel.rotation.x = -0.52;
      iGroup.add(screenBezel);

      const holoPaneMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.38,
        depthWrite: false,
      });
      const holoScreen = new THREE.Mesh(intHoloScreenGeo, holoPaneMat);
      holoScreen.position.set(0, 1.152, 0.158);
      holoScreen.rotation.x = -0.52;
      iGroup.add(holoScreen);

      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.9,
      });
      const coreMesh = new THREE.Mesh(intCoreGeo, coreMat);
      coreMesh.position.set(0, 1.56, -0.04);
      iGroup.add(coreMesh);

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ringMesh = new THREE.Mesh(intRingGeo, ringMat);
      ringMesh.position.y = 0.04;
      iGroup.add(ringMesh);

      this.interactableRigs.push({
        group: iGroup,
        coreMesh,
        coreMat,
        holoPaneMat,
        ringMesh,
        ringMat,
      });
      this.interactablesGroup.add(iGroup);
    }
    this.scene.add(this.interactablesGroup);

    // Phase 19: Pre-allocate Pooled 3D Timed Energy Passages (Upgraded with Scrolling GLSL Energy Field Shader) & Secret Area Beacons
    this.hazardsGroup = new THREE.Group();
    this.hazardsGroup.name = 'TimedEnergyHazardsGroup';
    const hazRingGeo = new THREE.RingGeometry(0.75, 1.0, 28);
    hazRingGeo.rotateX(-Math.PI * 0.5);
    const hazColGeo = new THREE.CylinderGeometry(0.85, 0.95, 2.2, 24, 1, true);
    for (let i = 0; i < 2; i++) {
      const hGroup = new THREE.Group();
      hGroup.visible = false;
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ringMesh = new THREE.Mesh(hazRingGeo, ringMat);
      ringMesh.position.y = 0.045;
      hGroup.add(ringMesh);

      const columnMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(0xef4444) },
          uOpacity: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uColor;
          uniform float uOpacity;
          varying vec2 vUv;
          void main() {
            float scroll = sin((vUv.y * 16.0 - uTime * 5.2)) * 0.5 + 0.5;
            float rib = smoothstep(0.65, 0.95, cos(vUv.x * 37.699 + uTime * 1.4));
            float edgeFade = smoothstep(0.0, 0.18, vUv.y) * (1.0 - smoothstep(0.76, 1.0, vUv.y));
            float alpha = uOpacity * edgeFade * (0.42 + scroll * 0.42 + rib * 0.25);
            if (alpha < 0.01) discard;
            gl_FragColor = vec4(uColor, alpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const columnMesh = new THREE.Mesh(hazColGeo, columnMat);
      columnMesh.position.y = 1.1;
      hGroup.add(columnMesh);

      this.hazardRigs.push({
        group: hGroup,
        ringMesh,
        ringMat,
        columnMesh,
        columnMat,
      });
      this.hazardsGroup.add(hGroup);
    }
    this.scene.add(this.hazardsGroup);

    // v1.5.0 Package B + v1.7.0 Composite Silhouettes: Dynamic Cover Barricades & Bolted Pressurized Capacitors
    this.dynamicObstaclesGroup = new THREE.Group();
    this.dynamicObstaclesGroup.name = 'DynamicChapterObstaclesPool';
    const wallBodyGeo = new THREE.BoxGeometry(1.75, 1.15, 0.72);
    const wallCapGeo = new THREE.BoxGeometry(1.88, 0.22, 0.84);
    const wallTrimGeo = new THREE.BoxGeometry(1.62, 0.14, 0.78);
    const wallButtressGeo = new THREE.BoxGeometry(0.2, 0.72, 1.04);
    const crateShellGeo = new THREE.CylinderGeometry(0.62, 0.72, 1.25, 8);
    const crateCoreGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.34, 8);
    const crateTopGeo = new THREE.CylinderGeometry(0.46, 0.6, 0.22, 8);
    const crateRibGeo = new THREE.BoxGeometry(0.11, 1.04, 0.16);
    const crateValveGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.12, 8);
    const dynBodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.44,
      metalness: 0.68,
    });
    const dynFrameMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.28,
      metalness: 0.82,
    });
    for (let i = 0; i < 8; i++) {
      const dGroup = new THREE.Group();
      dGroup.visible = false;

      const trimMat = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        emissive: 0x0891b2,
        emissiveIntensity: 0.55,
        roughness: 0.3,
        metalness: 0.5,
      });
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.88,
      });

      const wallGroup = new THREE.Group();
      const wBody = new THREE.Mesh(wallBodyGeo, dynBodyMat);
      wBody.position.y = 0.58;
      wBody.castShadow = !this.isHeadless;
      wBody.receiveShadow = !this.isHeadless;
      const wCap = new THREE.Mesh(wallCapGeo, dynFrameMat);
      wCap.position.y = 1.24;
      const wTrim = new THREE.Mesh(wallTrimGeo, trimMat);
      wTrim.position.y = 0.96;
      const wButtressL = new THREE.Mesh(wallButtressGeo, dynFrameMat);
      wButtressL.position.set(-0.74, 0.36, 0);
      const wButtressR = new THREE.Mesh(wallButtressGeo, dynFrameMat);
      wButtressR.position.set(0.74, 0.36, 0);
      wallGroup.add(wBody, wCap, wTrim, wButtressL, wButtressR);
      dGroup.add(wallGroup);

      const crateGroup = new THREE.Group();
      const cShell = new THREE.Mesh(crateShellGeo, dynBodyMat);
      cShell.position.y = 0.64;
      cShell.castShadow = !this.isHeadless;
      cShell.receiveShadow = !this.isHeadless;
      const cCore = new THREE.Mesh(crateCoreGeo, coreMat);
      cCore.position.y = 0.68;
      const cTop = new THREE.Mesh(crateTopGeo, dynFrameMat);
      cTop.position.y = 1.36;
      const cValve = new THREE.Mesh(crateValveGeo, dynFrameMat);
      cValve.position.y = 1.5;
      crateGroup.add(cShell, cCore, cTop, cValve);
      for (let r = 0; r < 4; r++) {
        const ribAngle = (r * Math.PI) / 2;
        const rib = new THREE.Mesh(crateRibGeo, dynFrameMat);
        rib.position.set(Math.sin(ribAngle) * 0.65, 0.68, Math.cos(ribAngle) * 0.65);
        rib.rotation.y = ribAngle;
        crateGroup.add(rib);
      }
      dGroup.add(crateGroup);

      this.dynamicObstacleRigs.push({
        group: dGroup,
        wallGroup,
        crateGroup,
        trimMat,
        coreMat,
        hitTimer: 0,
        lastHp: -1,
        lastObstacleId: null,
      });
      this.dynamicObstaclesGroup.add(dGroup);
    }
    this.scene.add(this.dynamicObstaclesGroup);

    // v1.5.0 Package C + v1.7.0 Octagonal Housing: Pooled Kinetic Vector Boost Pads (2 Flank Pads)
    this.boostPadsGroup = new THREE.Group();
    this.boostPadsGroup.name = 'KineticBoostPadsPool';
    const padBaseGeo = new THREE.CylinderGeometry(1.24, 1.38, 0.07, 8);
    const padOuterRingGeo = new THREE.RingGeometry(0.98, 1.18, 28);
    padOuterRingGeo.rotateX(-Math.PI * 0.5);
    const padInnerHaloGeo = new THREE.RingGeometry(0.68, 0.78, 8);
    padInnerHaloGeo.rotateX(-Math.PI * 0.5);
    const padChevronGeo = new THREE.RingGeometry(0.36, 0.58, 4);
    padChevronGeo.rotateX(-Math.PI * 0.5);
    const padBaseMat = new THREE.MeshStandardMaterial({
      color: 0x162234,
      roughness: 0.36,
      metalness: 0.8,
    });
    for (let i = 0; i < 2; i++) {
      const pGroup = new THREE.Group();
      pGroup.visible = false;
      const pBase = new THREE.Mesh(padBaseGeo, padBaseMat);
      pBase.position.y = 0.035;
      pBase.receiveShadow = !this.isHeadless;
      pGroup.add(pBase);

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const outerRing = new THREE.Mesh(padOuterRingGeo, ringMat);
      outerRing.position.y = 0.074;
      pGroup.add(outerRing);

      const innerHalo = new THREE.Mesh(padInnerHaloGeo, ringMat);
      innerHalo.position.y = 0.075;
      pGroup.add(innerHalo);

      const chevronMat = new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const chevronMesh = new THREE.Mesh(padChevronGeo, chevronMat);
      chevronMesh.position.y = 0.078;
      pGroup.add(chevronMesh);

      this.boostPadRigs.push({
        group: pGroup,
        outerRing,
        chevronMesh,
        ringMat,
        chevronMat,
      });
      this.boostPadsGroup.add(pGroup);
    }
    this.scene.add(this.boostPadsGroup);

    this.secretsGroup = new THREE.Group();
    this.secretsGroup.name = 'SecretAreasGroup';
    const secRingGeo = new THREE.RingGeometry(0.72, 0.94, 24);
    secRingGeo.rotateX(-Math.PI * 0.5);
    const secCoreGeo = new THREE.OctahedronGeometry(0.32, 0);
    for (let i = 0; i < 2; i++) {
      const sGroup = new THREE.Group();
      sGroup.visible = false;
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.9,
      });
      const coreMesh = new THREE.Mesh(secCoreGeo, coreMat);
      coreMesh.position.y = 1.15;
      sGroup.add(coreMesh);

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ringMesh = new THREE.Mesh(secRingGeo, ringMat);
      ringMesh.position.y = 0.05;
      sGroup.add(ringMesh);

      this.secretRigs.push({
        group: sGroup,
        coreMesh,
        coreMat,
        ringMesh,
        ringMat,
      });
      this.secretsGroup.add(sGroup);
    }
    this.scene.add(this.secretsGroup);

    // v1.9.0: Pooled Charged Flux Pools (spawned by shattered Chrono-Capacitors)
    this.fluxPoolsGroup = new THREE.Group();
    this.fluxPoolsGroup.name = 'ChargedFluxPoolsGroup';
    const fluxRingGeo = new THREE.RingGeometry(0.84, 1.0, 32);
    fluxRingGeo.rotateX(-Math.PI * 0.5);
    const fluxDiscGeo = new THREE.CircleGeometry(0.84, 28);
    fluxDiscGeo.rotateX(-Math.PI * 0.5);
    for (let i = 0; i < 4; i++) {
      const fGroup = new THREE.Group();
      fGroup.visible = false;
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const outerRing = new THREE.Mesh(fluxRingGeo, ringMat);
      outerRing.position.y = 0.045;
      fGroup.add(outerRing);

      const discMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const innerDisc = new THREE.Mesh(fluxDiscGeo, discMat);
      innerDisc.position.y = 0.036;
      fGroup.add(innerDisc);

      this.fluxPoolRigs.push({
        group: fGroup,
        outerRing,
        innerDisc,
        ringMat,
        discMat,
      });
      this.fluxPoolsGroup.add(fGroup);
    }
    this.scene.add(this.fluxPoolsGroup);

    // v1.9.0: Tactical Sector Waypoint 3D Ground Beacon
    this.waypointBeaconGroup = new THREE.Group();
    this.waypointBeaconGroup.name = 'TacticalWaypointBeaconGroup';
    this.waypointBeaconGroup.visible = false;
    const wpRingGeo = new THREE.RingGeometry(0.88, 1.08, 28);
    wpRingGeo.rotateX(-Math.PI * 0.5);
    const wpRingMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const wpRingMesh = new THREE.Mesh(wpRingGeo, wpRingMat);
    wpRingMesh.position.y = 0.06;
    this.waypointBeaconGroup.add(wpRingMesh);

    const wpColGeo = new THREE.CylinderGeometry(0.14, 0.28, 4.6, 14, 1, true);
    const wpColMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const wpColMesh = new THREE.Mesh(wpColGeo, wpColMat);
    wpColMesh.position.y = 2.32;
    this.waypointBeaconGroup.add(wpColMesh);

    const wpDiamondGeo = new THREE.OctahedronGeometry(0.28, 0);
    const wpDiamondMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.94,
    });
    const wpDiamondMesh = new THREE.Mesh(wpDiamondGeo, wpDiamondMat);
    wpDiamondMesh.position.y = 1.65;
    this.waypointBeaconGroup.add(wpDiamondMesh);

    this.waypointBeaconRig = {
      group: this.waypointBeaconGroup,
      ringMesh: wpRingMesh,
      ringMat: wpRingMat,
      columnMesh: wpColMesh,
      columnMat: wpColMat,
      diamondMesh: wpDiamondMesh,
      diamondMat: wpDiamondMat,
    };
    this.scene.add(this.waypointBeaconGroup);

    // Player Rig
    this.playerRig = createSeraPlayerRig(this.shadowTex, !this.isHeadless);
    this.scene.add(this.playerRig.root);

    // Chrono Echo Holographic Rig (reused across all replays with zero per-spawn allocations)
    this.echoRig = createEchoPlayerRig(this.shadowTex);
    this.echoRig.root.visible = false;
    this.scene.add(this.echoRig.root);

    // Pre-allocate 2 Temporal Afterimage Ghosts & Pose History Ring Buffer
    const ghost1 = createEchoAfterimageGhost(0.28);
    const ghost2 = createEchoAfterimageGhost(0.14);
    this.echoGhosts.push(ghost1, ghost2);
    this.scene.add(ghost1.root);
    this.scene.add(ghost2.root);

    for (let i = 0; i < ECHO_HISTORY_SIZE; i++) {
      this.echoHistory.push({
        valid: false,
        time: 0,
        x: 0,
        z: 0,
        rotY: 0,
        bodyY: 0,
        bodyRotX: 0,
        bodyRotZ: 0,
        torsoRotX: 0,
        torsoRotY: 0,
        torsoRotZ: 0,
        leftLegX: 0,
        rightLegX: 0,
        leftArmX: 0,
        leftArmY: 0,
        leftArmZ: 0,
        rightArmX: 0,
        rightArmY: 0,
        rightArmZ: 0,
      });
    }

    // Chrono Anchor Pressure Plate & Retractable Containment Barrier Assembly
    this.chronoPlateRig = createChronoPlateAndReceiverRig(!this.isHeadless);
    this.scene.add(this.chronoPlateRig.root);

    // Phase 14: Pre-allocate Pooled Pulsecaster Projectile Meshes
    this.projectilesGroup = new THREE.Group();
    this.projectilesGroup.name = 'PulsecasterProjectilesPool';
    this.scene.add(this.projectilesGroup);

    const projCoreGeo = new THREE.CylinderGeometry(0.06, 0.085, 0.72, 10);
    projCoreGeo.rotateX(Math.PI * 0.5);
    const projHaloGeo = new THREE.CylinderGeometry(0.13, 0.16, 0.96, 10);
    projHaloGeo.rotateX(Math.PI * 0.5);

    const maxPooledProjectiles = GAME_CONFIG.weapons.pulsecaster.maxActiveProjectiles + 4;
    for (let i = 0; i < maxPooledProjectiles; i++) {
      const group = new THREE.Group();
      group.visible = false;
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xe0f2fe,
        transparent: true,
        opacity: 0.96,
      });
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.48,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const coreMesh = new THREE.Mesh(projCoreGeo, coreMat);
      const haloMesh = new THREE.Mesh(projHaloGeo, haloMat);
      group.add(coreMesh);
      group.add(haloMesh);
      this.projectilesGroup.add(group);
      this.projectileRigs.push({
        group,
        coreMesh,
        coreMat,
        haloMesh,
        haloMat,
      });
    }

    // Phase 5: Temporal Resonance Target Reticle & Convergence Shockwave Ring
    this.resonanceMarkerGroup = new THREE.Group();
    this.resonanceMarkerGroup.visible = false;

    const outerRingGeo = new THREE.RingGeometry(1.18, 1.36, 32);
    outerRingGeo.rotateX(-Math.PI * 0.5);
    this.resonanceOuterRingMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.resonanceOuterRingMesh = new THREE.Mesh(outerRingGeo, this.resonanceOuterRingMat);
    this.resonanceOuterRingMesh.position.y = 0.06;
    this.resonanceMarkerGroup.add(this.resonanceOuterRingMesh);

    const innerRingGeo = new THREE.RingGeometry(0.88, 1.04, 28);
    innerRingGeo.rotateX(-Math.PI * 0.5);
    this.resonanceInnerRingMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.resonanceInnerRingMesh = new THREE.Mesh(innerRingGeo, this.resonanceInnerRingMat);
    this.resonanceInnerRingMesh.position.y = 0.08;
    this.resonanceMarkerGroup.add(this.resonanceInnerRingMesh);

    const crownGeo = new THREE.OctahedronGeometry(0.26, 0);
    this.resonanceCrownMat = new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.94,
      wireframe: true,
    });
    this.resonanceCrownMesh = new THREE.Mesh(crownGeo, this.resonanceCrownMat);
    this.resonanceCrownMesh.position.y = 2.65;
    this.resonanceMarkerGroup.add(this.resonanceCrownMesh);

    this.scene.add(this.resonanceMarkerGroup);

    const waveGeo = new THREE.RingGeometry(0.85, 1.18, 36);
    waveGeo.rotateX(-Math.PI * 0.5);
    this.convergenceWaveMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.convergenceWaveMesh = new THREE.Mesh(waveGeo, this.convergenceWaveMat);
    this.convergenceWaveMesh.visible = false;
    this.convergenceWaveMesh.position.y = 0.12;
    this.scene.add(this.convergenceWaveMesh);

    const pillarGeo = new THREE.CylinderGeometry(0.45, 0.85, 4.4, 24, 1, true);
    this.convergencePillarMat = new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.convergencePillarMesh = new THREE.Mesh(pillarGeo, this.convergencePillarMat);
    this.convergencePillarMesh.visible = false;
    this.convergencePillarMesh.position.y = 2.2;
    this.scene.add(this.convergencePillarMesh);

    // Relay Departure & Arrival Phase Columns
    const relayColGeo = new THREE.CylinderGeometry(0.32, 0.52, 2.8, 20, 1, true);
    this.relayOriginPillarMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.relayOriginPillarMesh = new THREE.Mesh(relayColGeo, this.relayOriginPillarMat);
    this.relayOriginPillarMesh.visible = false;
    this.scene.add(this.relayOriginPillarMesh);

    this.relayArrivalPillarMat = new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.relayArrivalPillarMesh = new THREE.Mesh(relayColGeo, this.relayArrivalPillarMat);
    this.relayArrivalPillarMesh.visible = false;
    this.scene.add(this.relayArrivalPillarMesh);

    // Single-Trigger Combat Impact Shockwave Ring (Heavy hits, Parries, Guard Clangs, Staggers)
    const impactGeo = new THREE.RingGeometry(0.42, 0.68, 28);
    impactGeo.rotateX(-Math.PI * 0.5);
    this.impactRingMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.impactRingMesh = new THREE.Mesh(impactGeo, this.impactRingMat);
    this.impactRingMesh.visible = false;
    this.scene.add(this.impactRingMesh);

    // Pooled Additive Phase Rail Muzzle Lance Beam
    const railBeamGeo = new THREE.CylinderGeometry(0.08, 0.14, 16, 12, 1, true);
    railBeamGeo.rotateX(Math.PI * 0.5);
    railBeamGeo.translate(0, 0, 8);
    this.railBeamMat = new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.railBeamMesh = new THREE.Mesh(railBeamGeo, this.railBeamMat);
    this.railBeamMesh.visible = false;
    this.scene.add(this.railBeamMesh);

    // v1.2.0: Pooled Weapon Slash Arc Ribbons (6 additive crescent slots)
    const slashRibbonGeo = new THREE.RingGeometry(
      0.95,
      2.05,
      20,
      1,
      -Math.PI * 0.45,
      Math.PI * 0.9
    );
    slashRibbonGeo.rotateX(-Math.PI * 0.5);
    for (let i = 0; i < SLASH_RIBBON_POOL_SIZE; i++) {
      const rGroup = new THREE.Group();
      rGroup.visible = false;
      const rMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const rMesh = new THREE.Mesh(slashRibbonGeo, rMat);
      rMesh.rotation.y = Math.PI * 0.5;
      rGroup.add(rMesh);
      this.scene.add(rGroup);
      this.slashRibbonSlots.push({
        active: false,
        age: 0,
        maxAge: 0.18,
        spinDir: 1,
        startScale: 1,
        baseOpacity: 0.85,
        group: rGroup,
        mesh: rMesh,
        mat: rMat,
      });
    }

    // v1.2.0: Pooled Dash & Execution Afterimage Ghosts (4 additive silhouettes)
    const ghostTorsoGeo = new THREE.CapsuleGeometry(0.18, 0.44, 4, 8);
    const ghostHeadGeo = new THREE.SphereGeometry(0.14, 8, 8);
    const ghostPauldronGeo = new THREE.BoxGeometry(0.18, 0.12, 0.18);
    for (let i = 0; i < DASH_GHOST_POOL_SIZE; i++) {
      const gGroup = new THREE.Group();
      gGroup.visible = false;
      const gMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const torsoMesh = new THREE.Mesh(ghostTorsoGeo, gMat);
      torsoMesh.position.y = 1.05;
      gGroup.add(torsoMesh);
      const headMesh = new THREE.Mesh(ghostHeadGeo, gMat);
      headMesh.position.y = 1.56;
      gGroup.add(headMesh);
      const leftPad = new THREE.Mesh(ghostPauldronGeo, gMat);
      leftPad.position.set(-0.26, 1.32, 0);
      gGroup.add(leftPad);
      const rightPad = new THREE.Mesh(ghostPauldronGeo, gMat);
      rightPad.position.set(0.26, 1.32, 0);
      gGroup.add(rightPad);
      this.scene.add(gGroup);
      this.dashGhostSlots.push({
        active: false,
        age: 0,
        maxAge: 0.24,
        group: gGroup,
        mat: gMat,
      });
    }

    // v1.3.0: Pooled Stagger Execution Floor Beacons (4 additive execution halos beneath staggered targets)
    const beaconOuterGeo = new THREE.RingGeometry(0.95, 1.26, 32);
    beaconOuterGeo.rotateX(-Math.PI * 0.5);
    const beaconInnerGeo = new THREE.RingGeometry(0.42, 0.66, 24);
    beaconInnerGeo.rotateX(-Math.PI * 0.5);
    const beaconPillarGeo = new THREE.CylinderGeometry(0.86, 1.04, 1.45, 24, 1, true);
    for (let i = 0; i < EXEC_BEACON_POOL_SIZE; i++) {
      const bGroup = new THREE.Group();
      bGroup.visible = false;
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const outerRing = new THREE.Mesh(beaconOuterGeo, ringMat);
      outerRing.position.y = 0.04;
      bGroup.add(outerRing);

      const innerRing = new THREE.Mesh(beaconInnerGeo, ringMat);
      innerRing.position.y = 0.05;
      bGroup.add(innerRing);

      const pillarMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.14,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const pillar = new THREE.Mesh(beaconPillarGeo, pillarMat);
      pillar.position.y = 0.74;
      bGroup.add(pillar);

      this.scene.add(bGroup);
      this.staggerBeaconSlots.push({
        group: bGroup,
        outerRing,
        innerRing,
        pillar,
        ringMat,
        pillarMat,
      });
    }

    // v1.4.0: Pooled Ground Impact Scorch & Singularity Decals (12 reusable planes)
    this.scorchTex = createScorchDecalTexture();
    const decalGeo = new THREE.PlaneGeometry(1, 1);
    decalGeo.rotateX(-Math.PI * 0.5);
    for (let i = 0; i < DECAL_POOL_SIZE; i++) {
      const dMat = new THREE.MeshBasicMaterial({
        map: this.scorchTex,
        color: 0x22d3ee,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -3,
      });
      const dMesh = new THREE.Mesh(decalGeo, dMat);
      dMesh.visible = false;
      dMesh.position.y = 0.032;
      this.scene.add(dMesh);
      this.decalSlots.push({
        active: false,
        age: 0,
        maxAge: 6.5,
        baseOpacity: 0.46,
        targetScale: 1.6,
        mesh: dMesh,
        mat: dMat,
      });
    }

    // v1.4.0: Atmospheric Orbital Dust Motes (120 soft drifting points)
    this.dustMoteTex = createDustMoteTexture();
    this.dustPositions = new Float32Array(DUST_MOTE_COUNT * 3);
    this.dustPhases = new Float32Array(DUST_MOTE_COUNT);
    for (let i = 0; i < DUST_MOTE_COUNT; i++) {
      const r = 3.2 + Math.random() * 17.5;
      const a = Math.random() * Math.PI * 2;
      this.dustPositions[i * 3] = Math.cos(a) * r;
      this.dustPositions[i * 3 + 1] = 0.35 + Math.random() * 7.1;
      this.dustPositions[i * 3 + 2] = Math.sin(a) * r;
      this.dustPhases[i] = Math.random() * Math.PI * 2;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(this.dustPositions, 3));
    this.dustMat = new THREE.PointsMaterial({
      map: this.dustMoteTex,
      color: 0x38bdf8,
      size: 0.13,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.dustPoints = new THREE.Points(dustGeo, this.dustMat);
    this.dustPoints.frustumCulled = false;
    this.scene.add(this.dustPoints);

    // v1.4.0: Chrono Echo Sync Tether Beam connecting Sera and active Echo during playback
    const tetherGeo = new THREE.CylinderGeometry(0.028, 0.028, 1, 8, 1, true);
    tetherGeo.rotateX(Math.PI * 0.5);
    this.echoTetherMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.echoTetherMesh = new THREE.Mesh(tetherGeo, this.echoTetherMat);
    this.echoTetherMesh.visible = false;
    this.scene.add(this.echoTetherMesh);

    // v1.9.0: Pre-allocated 3D Diegetic Target Lock-On Ground Ring (tracks locked hostile in floor space)
    this.lockOnGroundGroup = new THREE.Group();
    this.lockOnGroundGroup.visible = false;
    this.lockOnGroundGroup.position.y = 0.058;

    const lockOuterGeo = new THREE.RingGeometry(0.84, 1.0, 8, 1);
    lockOuterGeo.rotateX(-Math.PI * 0.5);
    this.lockOnOuterRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.lockOnOuterRingMesh = new THREE.Mesh(lockOuterGeo, this.lockOnOuterRingMat);
    this.lockOnGroundGroup.add(this.lockOnOuterRingMesh);

    const lockInnerGeo = new THREE.RingGeometry(0.54, 0.64, 4, 1);
    lockInnerGeo.rotateX(-Math.PI * 0.5);
    this.lockOnInnerDiscMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.lockOnInnerDiscMesh = new THREE.Mesh(lockInnerGeo, this.lockOnInnerDiscMat);
    this.lockOnGroundGroup.add(this.lockOnInnerDiscMesh);

    this.scene.add(this.lockOnGroundGroup);

    // Chapter II Harmonic Nodes (3 linked acoustic resonator pylons + 3D harmonic tether beams to THE CHOIR)
    this.choirNodesGroup = new THREE.Group();
    this.choirNodesGroup.visible = false;
    const nodePipeMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.3,
      metalness: 0.82,
    });
    for (let n = 0; n < 3; n++) {
      const nGroup = new THREE.Group();
      const baseMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.9, 0.32, 16),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.78 })
      );
      baseMesh.position.y = 0.16;
      nGroup.add(baseMesh);

      // 3 Fluted Acoustic Organ-Pipe Columns surrounding the Harmonic Node core
      for (let pIdx = 0; pIdx < 3; pIdx++) {
        const pAngle = (pIdx * Math.PI * 2) / 3;
        const pipe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.065, 0.08, 1.65, 10),
          nodePipeMat
        );
        pipe.position.set(Math.cos(pAngle) * 0.56, 0.92, Math.sin(pAngle) * 0.56);
        nGroup.add(pipe);
      }

      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0891b2,
        emissiveIntensity: 1.35,
        roughness: 0.2,
        metalness: 0.5,
      });
      const columnMesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.46, 0),
        coreMat
      );
      columnMesh.position.y = 1.22;
      nGroup.add(columnMesh);

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const rGeo = new THREE.RingGeometry(1.15, 1.38, 32);
      rGeo.rotateX(-Math.PI * 0.5);
      const ringMesh = new THREE.Mesh(rGeo, ringMat);
      ringMesh.position.y = 0.04;
      nGroup.add(ringMesh);

      // 3D Harmonic Shield Tether Beam linking node to THE CHOIR
      const tetherGeo = new THREE.PlaneGeometry(0.24, 1);
      tetherGeo.translate(0, 0.5, 0);
      tetherGeo.rotateX(Math.PI * 0.5);
      const tetherMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const tetherMesh = new THREE.Mesh(tetherGeo, tetherMat);
      tetherMesh.visible = false;
      this.choirNodesGroup.add(tetherMesh);

      this.choirNodesGroup.add(nGroup);
      this.choirNodeRigs.push({
        group: nGroup,
        coreMesh: columnMesh,
        coreMat,
        ringMesh,
        ringMat,
        tetherMesh,
        tetherMat,
      });
    }
    this.scene.add(this.choirNodesGroup);

    // Chapter III Gravity Pin [G] Field & Reconstructed Trace Lanes (Floor Lane + 3D Vertical Energy Curtain)
    const gPinGeo = new THREE.RingGeometry(0.4, 1.0, 36);
    gPinGeo.rotateX(-Math.PI * 0.5);
    this.gravityPinMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.gravityPinMesh = new THREE.Mesh(gPinGeo, this.gravityPinMat);
    this.gravityPinMesh.visible = false;
    this.gravityPinMesh.position.y = 0.05;
    this.scene.add(this.gravityPinMesh);

    for (let t = 0; t < 4; t++) {
      const tGeo = new THREE.PlaneGeometry(1, 1);
      tGeo.translate(0, 0.5, 0);
      tGeo.rotateX(-Math.PI * 0.5);
      tGeo.rotateY(Math.PI);
      const tMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const tMesh = new THREE.Mesh(tGeo, tMat);
      tMesh.visible = false;

      // Vertical 3D Energy Curtain along the trace centerline for unambiguous 3D readability
      const curtainGeo = new THREE.PlaneGeometry(1, 0.85);
      curtainGeo.translate(0.5, 0.425, 0);
      curtainGeo.rotateY(Math.PI * 0.5);
      const curtainMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const curtainMesh = new THREE.Mesh(curtainGeo, curtainMat);
      tMesh.add(curtainMesh);

      this.scene.add(tMesh);

      const edgeMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const edgeMeshes: THREE.Mesh[] = [];
      const edgeGeo = new THREE.BoxGeometry(0.12, 0.46, 1);
      edgeGeo.translate(0, 0.23, 0.5);
      for (let e = 0; e < 2; e++) {
        const edge = new THREE.Mesh(edgeGeo, edgeMat);
        edge.visible = false;
        edgeMeshes.push(edge);
        this.scene.add(edge);
      }
      this.curatorTraceMeshes.push({
        mesh: tMesh,
        mat: tMat,
        curtainMesh,
        curtainMat,
        edgeMeshes,
        edgeMat,
      });
    }

    // Chapter IV Chrono Sever Anti-Echo Quarantine Zone & Echo Collapse [X] Detonation Wave
    const severGeo = new THREE.RingGeometry(0.78, 1.0, 40);
    severGeo.rotateX(-Math.PI * 0.5);
    this.chronoSeverMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.chronoSeverMesh = new THREE.Mesh(severGeo, this.chronoSeverMat);
    this.chronoSeverMesh.visible = false;
    this.chronoSeverMesh.position.y = 0.055;
    this.scene.add(this.chronoSeverMesh);

    // 3D Vertical Laser Quarantine Cylinder around Matron's Chrono Sever Zone
    const severWallGeo = new THREE.CylinderGeometry(1, 1, 1.85, 36, 1, true);
    this.chronoSeverWallMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.chronoSeverWallMesh = new THREE.Mesh(severWallGeo, this.chronoSeverWallMat);
    this.chronoSeverWallMesh.visible = false;
    this.chronoSeverWallMesh.position.y = 0.95;
    this.scene.add(this.chronoSeverWallMesh);

    this.chronoSeverStrutsGroup = new THREE.Group();
    this.chronoSeverStrutsGroup.visible = false;
    this.chronoSeverStrutMat = new THREE.MeshBasicMaterial({
      color: 0xfb7185,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });
    const severStrutGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.85, 6);
    for (let s = 0; s < 12; s++) {
      const angle = (s / 12) * Math.PI * 2;
      const strut = new THREE.Mesh(severStrutGeo, this.chronoSeverStrutMat);
      strut.position.set(Math.sin(angle), 0.95, Math.cos(angle));
      this.chronoSeverStrutsGroup.add(strut);
    }
    this.scene.add(this.chronoSeverStrutsGroup);

    const collapseGeo = new THREE.RingGeometry(0.65, 1.0, 36);
    collapseGeo.rotateX(-Math.PI * 0.5);
    this.echoCollapseWaveMat = new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.echoCollapseWaveMesh = new THREE.Mesh(collapseGeo, this.echoCollapseWaveMat);
    this.echoCollapseWaveMesh.visible = false;
    this.echoCollapseWaveMesh.position.y = 0.12;
    this.scene.add(this.echoCollapseWaveMesh);

    // Enemy Rigs
    this.syncEnemyRigs(initialWorld);

    // Zero-GC Pooled Particle Ring Buffer (Faceted Octahedron Energy Sparks)
    const pGeo = new THREE.OctahedronGeometry(0.11, 0);
    const pMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    this.particleInstancedMesh = new THREE.InstancedMesh(
      pGeo,
      pMat,
      PARTICLE_POOL_SIZE
    );
    this.particleInstancedMesh.frustumCulled = false;

    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: -100,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        age: 0,
        maxAge: 0.4,
        size: 1,
        r: 1,
        g: 1,
        b: 1,
      });
      _dummyObj.position.set(0, -100, 0);
      _dummyObj.scale.setScalar(0.001);
      _dummyObj.updateMatrix();
      this.particleInstancedMesh.setMatrixAt(i, _dummyObj.matrix);
      _color.setRGB(1, 1, 1);
      this.particleInstancedMesh.setColorAt(i, _color);
    }
    this.particleInstancedMesh.instanceMatrix.needsUpdate = true;
    if (this.particleInstancedMesh.instanceColor) {
      this.particleInstancedMesh.instanceColor.needsUpdate = true;
    }
    this.scene.add(this.particleInstancedMesh);

    this.loadChapterAssets();

    // Pre-warm shaders once after initialization on hardware GPU
    if (!this.isHeadless && this.renderer) {
      this.renderer.compile(this.scene, this.camera);
    }
  }

  private loadChapterAssets(): void {
    if (!this.webglAvailable) return;
    const loader = new GLTFLoader();
    for (let i = 0; i < CHAPTER_IDS.length; i++) {
      const chapter = CHAPTER_IDS[i];
      const config = BLENDER_CHAPTER_ASSETS[chapter];
      const target = this.chapterEnvironments.get(chapter);
      if (!config || !target) continue;
      loader.load(
        config.url,
        (gltf) => {
          if (this.disposed) {
            disposeMeshResources(gltf.scene);
            return;
          }
          const asset = gltf.scene;
          asset.name = `BlenderAsset_${chapter}`;
          asset.position.set(config.x, 0, config.z);
          asset.rotation.y = config.rotationY;
          asset.scale.setScalar(config.scale);
          asset.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              object.castShadow = false;
              object.receiveShadow = !this.isHeadless;
            }
          });
          target.group.add(asset);
        },
        undefined,
        (error) => {
          console.error(`Failed to load Blender asset: ${config.url}`, error);
        }
      );
    }
  }

  public isHeadlessBrowser(): boolean {
    return this.isHeadless;
  }

  public isWebGLAvailable(): boolean {
    return this.webglAvailable;
  }

  public getAppliedPixelRatio(): number {
    return this.appliedPixelRatio;
  }

  public isSoftwareWebGL(): boolean {
    return Boolean(this.isSoftwareGl);
  }

  public getWebGLContext(): WebGLRenderingContext | WebGL2RenderingContext | null {
    return this.renderer?.getContext?.() ?? null;
  }

  public getDiagnostics(): {
    webglAvailable: boolean;
    webglContextLost: boolean;
    isHeadless: boolean;
    isSoftwareGl: boolean;
    glVendor: string;
    glRenderer: string;
    disposed: boolean;
    appliedPixelRatio: number;
    activeEnemyRigCount: number;
    hydratedChapterAssets: CampaignChapterId[];
    memory: {
      geometries: number;
      textures: number;
      programs: number;
    };
    render: {
      calls: number;
      triangles: number;
      frame: number;
    };
    graphics?: {
      preset: GraphicsPreset;
      renderScale: number;
      shadowQuality: ShadowQuality;
      particleQuality: ParticleQuality;
      lightingQuality: LightingQuality;
      fpsLimit: FpsLimitOption;
    };
  } {
    const hydratedChapterAssets: CampaignChapterId[] = [];
    if (this.chapterEnvironments) {
      for (const [chapter, env] of this.chapterEnvironments.entries()) {
        if (env.group.children.length > 0) {
          hydratedChapterAssets.push(chapter);
        }
      }
    }
    const info = this.renderer?.info;
    return {
      webglAvailable: Boolean(this.webglAvailable),
      webglContextLost: Boolean(this.webglContextLost),
      isHeadless: Boolean(this.isHeadless),
      isSoftwareGl: Boolean(this.isSoftwareGl),
      glVendor: this.glVendor ?? '',
      glRenderer: this.glRenderer ?? '',
      disposed: Boolean(this.disposed),
      appliedPixelRatio: this.appliedPixelRatio ?? 1,
      activeEnemyRigCount: this.enemyRigs?.size ?? 0,
      hydratedChapterAssets,
      memory: {
        geometries: info?.memory?.geometries ?? 0,
        textures: info?.memory?.textures ?? 0,
        programs: Array.isArray(info?.programs) ? info.programs.length : 0,
      },
      render: {
        calls: info?.render?.calls ?? 0,
        triangles: info?.render?.triangles ?? 0,
        frame: info?.render?.frame ?? 0,
      },
      graphics: {
        preset: this.graphicsPreset ?? 'balanced',
        renderScale: this.renderScale ?? 0.85,
        shadowQuality: this.shadowQuality ?? 'medium',
        particleQuality: this.particleQuality ?? 'medium',
        lightingQuality: this.lightingQuality ?? 'standard',
        fpsLimit: this.fpsLimit ?? 60,
      },
    };
  }

  public snapCameraToPlayer(world: WorldState, aimYaw: number, aimPitch: number): void {
    const p = world.player;
    this.camAnchor.set(p.x, GAME_CONFIG.camera.anchorHeight, p.z);
    this.currentCamDist = GAME_CONFIG.camera.distance;

    const fwdX = Math.sin(aimYaw);
    const fwdZ = Math.cos(aimYaw);
    const cosPitch = Math.cos(aimPitch);
    const sinPitch = Math.sin(aimPitch);

    const dirX = -fwdX * cosPitch;
    const dirY = sinPitch;
    const dirZ = -fwdZ * cosPitch;

    this.currentCamPos.set(
      this.camAnchor.x + dirX * this.currentCamDist,
      Math.max(0.45, this.camAnchor.y + dirY * this.currentCamDist),
      this.camAnchor.z + dirZ * this.currentCamDist
    );
    this.currentLookAt.set(
      this.camAnchor.x + fwdX * GAME_CONFIG.camera.lookAheadDistance,
      this.camAnchor.y - sinPitch * 0.4,
      this.camAnchor.z + fwdZ * GAME_CONFIG.camera.lookAheadDistance
    );
    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookAt);
  }

  public syncEnemyRigs(world: WorldState): void {
    this.clearEchoHistory();
    this.clearCallouts();
    this.relayVfxTimer = 0;
    this.impactRingTimer = 0;
    this.railBeamTimer = 0;
    this.hitstopTimer = 0;
    this.fovKick = 0;
    this.resonanceFlash = 0;
    if (this.relayOriginPillarMesh) this.relayOriginPillarMesh.visible = false;
    if (this.relayArrivalPillarMesh) this.relayArrivalPillarMesh.visible = false;
    if (this.impactRingMesh) this.impactRingMesh.visible = false;
    if (this.railBeamMesh) this.railBeamMesh.visible = false;
    if (this.staggerBeaconSlots) {
      for (let i = 0; i < this.staggerBeaconSlots.length; i++) {
        this.staggerBeaconSlots[i].group.visible = false;
      }
    }
    this.reconcileEnemyRigs(world);
    if (this.enemyRigs) {
      for (const rig of this.enemyRigs.values()) {
        rig.bodyGroup?.position.set(0, 0, 0);
        rig.bodyGroup?.rotation.set(0, 0, 0);
      }
    }
  }

  public reconcileEnemyRigs(world: WorldState): void {
    const activeIds = this.activeEnemyIdsSet ?? (this.activeEnemyIdsSet = new Set<string>());
    activeIds.clear();
    for (let i = 0; i < world.enemies.length; i++) {
      const enemy = world.enemies[i];
      activeIds.add(enemy.id);
      let rig = this.enemyRigs.get(enemy.id);
      if (rig && rig.archetype !== enemy.archetype) {
        this.scene.remove(rig.root);
        disposeMeshResources(rig.root);
        this.enemyRigs.delete(enemy.id);
        rig = undefined;
      }
      if (!rig) {
        rig = createEnemyRig(
          enemy.id,
          enemy.archetype,
          this.shadowTex,
          !this.isHeadless && !this.isSoftwareGl
        );
        this.scene.add(rig.root);
        this.enemyRigs.set(enemy.id, rig);
      }
      rig.root.visible = true;
    }

    for (const [id, rig] of this.enemyRigs.entries()) {
      if (!activeIds.has(id)) {
        this.scene.remove(rig.root);
        disposeMeshResources(rig.root);
        this.enemyRigs.delete(id);
        this.enemyGuardRecoilTimers?.delete(id);
      }
    }
  }

  private clearEchoHistory(): void {
    if (this.echoHistory) {
      for (let i = 0; i < this.echoHistory.length; i++) {
        this.echoHistory[i].valid = false;
      }
    }
    this.echoHistoryHead = 0;
    this.echoSampleTimer = 0;
    if (this.echoGhosts) {
      for (let i = 0; i < this.echoGhosts.length; i++) {
        this.echoGhosts[i].root.visible = false;
      }
    }
  }

  private triggerImpactRing(
    x: number,
    y: number,
    z: number,
    hexColor: number,
    duration = 0.26
  ): void {
    if (this.screenEffectsEnabled === false) return;
    this.impactRingMesh.position.set(x, y, z);
    this.impactRingMesh.scale.setScalar(0.5);
    this.impactRingMat.color.setHex(hexColor);
    this.impactRingMat.opacity = 0.9;
    this.impactRingMesh.visible = true;
    this.impactRingDuration = Math.max(0.08, duration);
    this.impactRingTimer = this.impactRingDuration;
  }

  private spawnBurst(
    x: number,
    y: number,
    z: number,
    count: number,
    hexColor: number,
    speed = 5.5
  ): void {
    const scale = this.particleScale ?? 1;
    const scaledCount = scale >= 0.99 ? count : Math.max(1, Math.round(count * scale));
    this.hasActiveParticles = true;
    _color.setHex(hexColor);
    for (let i = 0; i < scaledCount; i++) {
      const slotIdx = this.nextParticleIdx;
      const p = this.particles[slotIdx];
      this.nextParticleIdx = (slotIdx + 1) % PARTICLE_POOL_SIZE;
      const angle = Math.random() * Math.PI * 2;
      const elev = (Math.random() - 0.2) * Math.PI * 0.5;
      const spd = speed * (0.45 + Math.random() * 0.75);
      p.active = true;
      p.x = x;
      p.y = y;
      p.z = z;
      p.vx = Math.cos(angle) * Math.cos(elev) * spd;
      p.vy = Math.sin(elev) * spd + 2.2;
      p.vz = Math.sin(angle) * Math.cos(elev) * spd;
      p.age = 0;
      p.maxAge = 0.24 + Math.random() * 0.22;
      p.size = 0.75 + Math.random() * 0.85;
      p.r = _color.r;
      p.g = _color.g;
      p.b = _color.b;
      if (this.particleInstancedMesh) {
        this.particleInstancedMesh.setColorAt(slotIdx, _color);
        this.particleColorsDirty = true;
      }
    }
  }

  public attachCalloutLayer(el: HTMLElement | null): void {
    if (this.calloutMountEl === el) return;
    if (!this.calloutNodes) this.calloutNodes = [];
    for (let i = 0; i < this.calloutNodes.length; i++) {
      this.calloutNodes[i].remove?.();
    }
    this.calloutNodes.length = 0;
    this.calloutMountEl = el;
    if (!el || typeof document === 'undefined') return;
    for (let i = 0; i < CALLOUT_POOL_SIZE; i++) {
      const div = document.createElement('div');
      div.setAttribute('data-callout-slot', String(i));
      div.style.position = 'absolute';
      div.style.left = '0px';
      div.style.top = '0px';
      div.style.pointerEvents = 'none';
      div.style.willChange = 'transform, opacity';
      div.style.fontFamily = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace";
      div.style.fontWeight = '800';
      div.style.fontSize = '13px';
      div.style.letterSpacing = '0.06em';
      div.style.whiteSpace = 'nowrap';
      div.style.textShadow = '0 2px 6px rgba(0, 0, 0, 0.92), 0 0 10px rgba(8, 12, 19, 0.75)';
      div.style.opacity = '0';
      el.appendChild(div);
      this.calloutNodes.push(div);
    }
  }

  private clearCallouts(): void {
    this.hasActiveCallouts = false;
    if (!this.calloutSlots || !this.calloutNodes) return;
    for (let i = 0; i < CALLOUT_POOL_SIZE; i++) {
      const slot = this.calloutSlots[i];
      if (slot) slot.active = false;
      const node = this.calloutNodes[i];
      if (node && node.style.opacity !== '0') {
        node.style.opacity = '0';
      }
    }
  }

  private spawnCombatCallouts(events: CombatEvent[]): void {
    if (
      this.screenEffectsEnabled === false ||
      !this.calloutNodes ||
      this.calloutNodes.length === 0 ||
      !this.calloutSlots
    ) {
      return;
    }
    const specs = formatCombatCallouts(events);
    if (specs.length === 0) return;
    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i];
      const idx = (this.calloutNextIdx ?? 0) % CALLOUT_POOL_SIZE;
      this.calloutNextIdx = (idx + 1) % CALLOUT_POOL_SIZE;
      const slot = this.calloutSlots[idx];
      if (!slot) continue;
      slot.active = true;
      slot.text = spec.text;
      slot.tone = spec.tone;
      slot.worldX = spec.worldX;
      slot.worldY = spec.worldY;
      slot.worldZ = spec.worldZ;
      slot.age = 0;
      slot.maxAge = spec.duration;
      slot.driftX = ((idx % 3) - 1) * 14;
      slot.scale = spec.scale;
      const node = this.calloutNodes[idx];
      if (node) {
        node.textContent = spec.text;
        node.style.color = CALLOUT_TONE_COLOR[spec.tone] ?? '#e2e8f0';
        node.style.fontSize = spec.scale > 1.12 ? '15px' : '13px';
      }
      this.hasActiveCallouts = true;
    }
  }

  private updateCallouts(dt: number, appState: WorldState['appState']): void {
    if (
      !this.hasActiveCallouts ||
      !this.calloutNodes ||
      this.calloutNodes.length === 0 ||
      !this.calloutSlots
    ) {
      return;
    }
    if (appState !== 'playing' || this.screenEffectsEnabled === false) {
      this.clearCallouts();
      return;
    }
    const vw = this.viewportWidth || (typeof window !== 'undefined' ? window.innerWidth : 0);
    const vh = this.viewportHeight || (typeof window !== 'undefined' ? window.innerHeight : 0);
    let anyActive = false;

    for (let i = 0; i < CALLOUT_POOL_SIZE; i++) {
      const slot = this.calloutSlots[i];
      const node = this.calloutNodes[i];
      if (!slot || !slot.active) continue;
      slot.age += dt;
      if (slot.age >= slot.maxAge) {
        slot.active = false;
        if (node) node.style.opacity = '0';
        continue;
      }
      anyActive = true;
      if (!node) continue;

      const progress = slot.age / Math.max(0.05, slot.maxAge);
      const liftY = this.reducedMotion ? 0.35 : progress * 0.72;
      _projVec.set(slot.worldX, slot.worldY + liftY, slot.worldZ).project(this.camera);
      const projected = projectNdcToViewport(_projVec.x, _projVec.y, _projVec.z, vw, vh);
      if (!projected.visible) {
        node.style.opacity = '0';
        continue;
      }
      const alpha = progress < 0.16 ? progress / 0.16 : Math.max(0, 1 - (progress - 0.16) / 0.84);
      const pop = progress < 0.18 && !this.reducedMotion ? slot.scale * (1 + (0.18 - progress) * 0.9) : slot.scale;
      const sx = projected.x + slot.driftX * progress;
      const sy = projected.y;
      node.style.opacity = alpha.toFixed(2);
      node.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -50%) scale(${pop.toFixed(2)})`;
    }
    this.hasActiveCallouts = anyActive;
  }

  public handleCombatEvents(events: CombatEvent[]): void {
    this.spawnCombatCallouts(events);
    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      switch (ev.type) {
        case 'player_light_swing':
          this.spawnBurst(ev.x, 1.1, ev.z, 6, 0x22d3ee, 4.2);
          this.triggerSlashRibbon(
            ev.x,
            1.08,
            ev.z,
            this.playerRig?.root?.rotation?.y ?? 0,
            this.slashRibbonNextIdx % 2 === 0 ? 0.26 : -0.3,
            0x22d3ee,
            1.02,
            0.16,
            this.slashRibbonNextIdx % 2 === 0 ? 1 : -1
          );
          break;
        case 'player_heavy_charge_ready':
          this.spawnBurst(ev.x, 1.0, ev.z, 12, 0xf59e0b, 4.8);
          this.triggerImpactRing(ev.x, 0.14, ev.z, 0xf59e0b, 0.24);
          break;
        case 'player_heavy_swing':
          this.spawnBurst(ev.x, 1.1, ev.z, 16, 0x38bdf8, 7.0);
          this.triggerSlashRibbon(
            ev.x,
            1.12,
            ev.z,
            this.playerRig?.root?.rotation?.y ?? 0,
            -0.22,
            0x38bdf8,
            1.36,
            0.24,
            1
          );
          break;
        case 'player_hit_enemy':
          this.spawnBurst(
            ev.x,
            1.25,
            ev.z,
            ev.isHeavy ? 18 : ev.isGuarded ? 8 : 10,
            ev.isCriticalOrVulnerable
              ? 0xffffff
              : ev.isGuarded
                ? 0xf59e0b
                : 0x22d3ee,
            ev.isHeavy ? 7.8 : ev.isGuarded ? 4.4 : 5.4
          );
          if (ev.isGuarded) {
            if (ev.enemyId) {
              this.enemyGuardRecoilTimers.set(ev.enemyId, 0.22);
            }
            this.spawnBurst(ev.x, 1.28, ev.z, 6, 0xfef08a, 6.4);
            this.triggerImpactRing(ev.x, 1.15, ev.z, 0xf59e0b, 0.22);
          } else if (ev.isHeavy || ev.isCriticalOrVulnerable) {
            this.triggerImpactRing(
              ev.x,
              1.1,
              ev.z,
              ev.isCriticalOrVulnerable ? 0xffffff : 0x22d3ee,
              0.28
            );
            if (!this.reducedMotion) {
              this.hitstopTimer = Math.max(this.hitstopTimer ?? 0, ev.isCriticalOrVulnerable ? 0.052 : 0.042);
              this.fovKick = Math.max(this.fovKick ?? 0, ev.isCriticalOrVulnerable ? 2.4 : 1.6);
            }
          }
          break;
        case 'enemy_staggered':
        case 'boss_staggered':
          this.spawnBurst(ev.x, 1.5, ev.z, 24, 0xffffff, 8.8);
          this.spawnBurst(ev.x, 1.3, ev.z, 14, 0x22d3ee, 7.2);
          this.triggerImpactRing(ev.x, 0.18, ev.z, 0xffffff, 0.38);
          if (!this.reducedMotion) {
            this.hitstopTimer = Math.max(this.hitstopTimer ?? 0, 0.055);
            this.fovKick = Math.max(this.fovKick ?? 0, 2.6);
          }
          break;
        case 'enemy_killed':
          this.spawnBurst(ev.x, 1.2, ev.z, 24, 0xf59e0b, 9.2);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0xf59e0b, 0.36);
          break;
        case 'boss_activated':
          this.spawnBurst(ev.x, 1.75, ev.z, 22, 0xf59e0b, 7.4);
          this.triggerImpactRing(ev.x, 0.18, ev.z, 0xf59e0b, 0.38);
          break;
        case 'boss_telegraph_start':
          this.spawnBurst(
            ev.x,
            1.55,
            ev.z,
            14,
            ev.bossAttack === 'anchor_slam' ? 0xef4444 : 0xf59e0b,
            5.8
          );
          break;
        case 'boss_attack_strike':
          this.spawnBurst(ev.x, 1.2, ev.z, 22, 0xef4444, 8.6);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0xef4444, 0.34);
          this.spawnImpactDecal(ev.x, ev.z, 0xef4444, 2.2, 6.5);
          break;
        case 'boss_shockwave_burst':
          this.spawnBurst(ev.x, 0.35, ev.z, 28, 0xf59e0b, 9.8);
          this.triggerImpactRing(ev.x, 0.16, ev.z, 0xef4444, 0.42);
          this.spawnImpactDecal(ev.x, ev.z, 0xf59e0b, 3.0, 7.5);
          break;
        case 'boss_core_exposed':
          this.spawnBurst(ev.x, 1.55, ev.z, 16, 0xffffff, 6.2);
          this.triggerImpactRing(ev.x, 1.35, ev.z, 0x22d3ee, 0.28);
          this.resonanceFlash = Math.max(this.resonanceFlash ?? 0, 0.85);
          if (!this.reducedMotion) {
            this.hitstopTimer = Math.max(this.hitstopTimer ?? 0, 0.048);
            this.fovKick = Math.max(this.fovKick ?? 0, 2.0);
          }
          break;
        case 'boss_phase_transition':
          this.spawnBurst(ev.x, 1.65, ev.z, 32, 0xef4444, 10.4);
          this.spawnBurst(ev.x, 1.85, ev.z, 20, 0xf59e0b, 8.2);
          this.triggerImpactRing(ev.x, 0.24, ev.z, 0xef4444, 0.48);
          this.resonanceFlash = 1.0;
          if (!this.reducedMotion) {
            this.fovKick = Math.max(this.fovKick ?? 0, 2.8);
          }
          break;
        case 'boss_defeated':
          this.spawnBurst(ev.x, 1.6, ev.z, 36, 0xffffff, 11.0);
          this.spawnBurst(ev.x, 1.35, ev.z, 26, 0x22d3ee, 9.2);
          this.triggerImpactRing(ev.x, 0.24, ev.z, 0x22d3ee, 0.52);
          break;
        case 'player_parry_success':
          this.spawnBurst(ev.x, 1.2, ev.z, 18, 0x38bdf8, 8.0);
          this.spawnBurst(ev.x, 1.24, ev.z, 10, 0xfef08a, 6.8);
          this.triggerImpactRing(ev.x, 1.15, ev.z, 0xe0f2fe, 0.3);
          this.triggerSlashRibbon(
            ev.x,
            1.18,
            ev.z,
            this.playerRig?.root?.rotation?.y ?? 0,
            0.32,
            0xe0f2fe,
            1.15,
            0.18,
            1
          );
          if (!this.reducedMotion) {
            this.hitstopTimer = Math.max(this.hitstopTimer ?? 0, 0.052);
            this.fovKick = Math.max(this.fovKick ?? 0, 2.2);
          }
          break;
        case 'player_riposte_strike':
          this.spawnBurst(ev.x, 1.2, ev.z, 16, 0xfbbf24, 7.2);
          this.spawnBurst(ev.x, 1.25, ev.z, 10, 0x38bdf8, 6.0);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0xfbbf24, 0.28);
          if (!this.reducedMotion) {
            this.fovKick = Math.max(this.fovKick ?? 0, 1.6);
          }
          break;
        case 'player_perfect_dodge':
          this.spawnBurst(ev.x, 1.05, ev.z, 18, 0x67e8f9, 7.8);
          this.spawnBurst(ev.x, 1.15, ev.z, 10, 0xffffff, 6.2);
          this.triggerImpactRing(ev.x, 0.18, ev.z, 0x67e8f9, 0.3);
          if (!this.reducedMotion) {
            this.hitstopTimer = Math.max(this.hitstopTimer ?? 0, 0.042);
            this.fovKick = Math.max(this.fovKick ?? 0, 1.85);
          }
          break;
        case 'player_damaged':
          this.spawnBurst(ev.x, 1.1, ev.z, 14, 0xef4444, 6.5);
          break;
        case 'player_dodge':
          this.spawnBurst(ev.x, 0.4, ev.z, 6, 0x22d3ee, 3.8);
          break;
        case 'echo_recording_started':
        case 'echo_recording_replaced':
          this.clearEchoHistory();
          this.spawnBurst(ev.x, 1.0, ev.z, 10, 0xf59e0b, 4.2);
          break;
        case 'echo_recording_ready':
          this.spawnBurst(ev.x, 1.0, ev.z, 14, 0x22d3ee, 5.2);
          break;
        case 'echo_playback_started':
          this.clearEchoHistory();
          this.spawnBurst(ev.x, 1.0, ev.z, 16, 0x38bdf8, 5.8);
          this.triggerImpactRing(ev.x, 0.12, ev.z, 0x22d3ee, 0.28);
          break;
        case 'echo_playback_completed':
        case 'echo_cleared':
          this.clearEchoHistory();
          this.spawnBurst(ev.x, 1.0, ev.z, 12, 0x22d3ee, 4.5);
          break;
        case 'echo_recording_rejected':
        case 'echo_playback_rejected':
          this.spawnBurst(ev.x, 0.4, ev.z, 6, 0xf59e0b, 3.2);
          break;
        case 'echo_action_visual':
          if (ev.echoAction === 'dodge') {
            this.spawnBurst(ev.x, 0.4, ev.z, 6, 0x38bdf8, 3.8);
          } else if (ev.echoAction === 'parry') {
            this.spawnBurst(ev.x, 1.15, ev.z, 10, 0xe0f2fe, 5.0);
          } else {
            const isHeavy = Boolean(ev.isHeavy || ev.echoAction === 'heavy_swing');
            this.spawnBurst(ev.x, 1.1, ev.z, isHeavy ? 12 : 6, 0x38bdf8, isHeavy ? 6.0 : 4.2);
          }
          break;
        case 'echo_plate_activated':
          this.spawnBurst(ev.x, 0.35, ev.z, 18, 0x22d3ee, 6.2);
          this.triggerImpactRing(ev.x, 0.12, ev.z, 0x22d3ee, 0.32);
          break;
        case 'echo_plate_released':
          this.spawnBurst(ev.x, 0.35, ev.z, 10, 0xf59e0b, 4.0);
          break;
        case 'echo_receiver_activated':
          this.spawnBurst(ev.x, 0.85, ev.z, 22, 0xffffff, 7.6);
          this.triggerImpactRing(ev.x, 0.25, ev.z, 0x22d3ee, 0.34);
          break;
        case 'echo_receiver_expired':
        case 'echo_receiver_rejected':
          this.spawnBurst(ev.x, 0.55, ev.z, 10, 0xf59e0b, 4.2);
          break;
        case 'echo_combine_barrier_opened':
          this.spawnBurst(ev.x, 1.1, ev.z, 24, 0x22d3ee, 7.8);
          break;
        case 'echo_combine_barrier_closed':
          this.spawnBurst(ev.x, 0.65, ev.z, 10, 0xf59e0b, 4.0);
          break;
        case 'echo_puzzle_completed':
          this.spawnBurst(ev.x, 1.2, ev.z, 28, 0xffffff, 8.8);
          break;
        case 'echo_relay_success':
          if (typeof ev.originX === 'number' && typeof ev.originZ === 'number') {
            this.spawnBurst(ev.originX, 1.0, ev.originZ, 18, 0x38bdf8, 6.8);
            if (this.screenEffectsEnabled !== false) {
              this.relayOriginPillarMesh.position.set(ev.originX, 1.4, ev.originZ);
              this.relayOriginPillarMesh.visible = true;
            }
          }
          this.spawnBurst(ev.x, 1.0, ev.z, 24, 0xe0f2fe, 7.6);
          if (this.screenEffectsEnabled !== false) {
            this.relayArrivalPillarMesh.position.set(ev.x, 1.4, ev.z);
            this.relayArrivalPillarMesh.visible = true;
            this.relayVfxTimer = 0.32;
          }
          this.triggerImpactRing(ev.x, 0.14, ev.z, 0xe0f2fe, 0.32);
          break;
        case 'echo_relay_rejected':
          this.spawnBurst(ev.x, 0.45, ev.z, 6, 0xf59e0b, 3.2);
          break;
        case 'echo_resonance_primed':
          if (typeof ev.originX === 'number' && typeof ev.originZ === 'number') {
            this.spawnBurst(ev.originX, 1.1, ev.originZ, 12, 0x38bdf8, 5.4);
          }
          this.spawnBurst(ev.x, 1.25, ev.z, 20, 0x22d3ee, 6.8);
          this.spawnBurst(ev.x, 1.35, ev.z, 10, 0xffffff, 5.2);
          this.triggerImpactRing(ev.x, 0.16, ev.z, 0x22d3ee, 0.3);
          break;
        case 'echo_resonance_expired':
          this.spawnBurst(ev.x, 0.95, ev.z, 8, 0x38bdf8, 3.4);
          break;
        case 'resonance_convergence':
          this.spawnBurst(ev.x, 1.3, ev.z, 26, 0xffffff, 9.2);
          this.spawnBurst(ev.x, 1.15, ev.z, 20, 0x22d3ee, 7.8);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0xffffff, 0.38);
          this.spawnImpactDecal(ev.x, ev.z, 0x22d3ee, 2.5, 7.5);
          this.resonanceFlash = Math.max(this.resonanceFlash ?? 0, 0.9);
          if (!this.reducedMotion) {
            this.hitstopTimer = Math.max(this.hitstopTimer ?? 0, 0.055);
            this.fovKick = Math.max(this.fovKick ?? 0, 2.8);
          }
          break;
        case 'resonance_convergence_rejected':
          this.spawnBurst(ev.x, 0.85, ev.z, 6, 0xf59e0b, 3.5);
          break;
        case 'choir_node_primed':
          this.spawnBurst(ev.x, 1.15, ev.z, 18, 0x22d3ee, 6.2);
          this.triggerImpactRing(ev.x, 0.14, ev.z, 0x22d3ee, 0.3);
          break;
        case 'choir_node_synchronized':
        case 'choir_sync_completed':
          this.spawnBurst(ev.x, 1.35, ev.z, 28, 0xffffff, 8.8);
          this.triggerImpactRing(ev.x, 0.18, ev.z, 0xffffff, 0.42);
          break;
        case 'choir_sync_failed':
          this.spawnBurst(ev.x, 0.9, ev.z, 10, 0xf59e0b, 4.4);
          break;
        case 'gravity_pin_activated':
          this.spawnBurst(ev.x, 1.0, ev.z, 22, 0x38bdf8, 7.2);
          this.triggerImpactRing(ev.x, 0.14, ev.z, 0x38bdf8, 0.36);
          break;
        case 'curator_trace_spawned':
          this.spawnBurst(ev.x, 0.9, ev.z, 10, 0xa855f7, 4.6);
          break;
        case 'curator_trace_executed':
          this.spawnBurst(ev.x, 0.9, ev.z, 16, 0xef4444, 6.8);
          break;
        case 'curator_decoy_eliminated':
          this.spawnBurst(ev.x, 1.1, ev.z, 18, 0xc084fc, 6.5);
          break;
        case 'siphon_flux_drained':
          this.spawnBurst(ev.x, 1.1, ev.z, 14, 0xf59e0b, 5.6);
          break;
        case 'eraser_echo_disrupted':
        case 'matron_chrono_sever':
          this.spawnBurst(ev.x, 1.1, ev.z, 24, 0xf43f5e, 7.8);
          this.triggerImpactRing(ev.x, 0.16, ev.z, 0xf43f5e, 0.38);
          break;
        case 'echo_collapse_detonated':
          this.spawnBurst(ev.x, 1.25, ev.z, 28, 0xe0f2fe, 9.2);
          this.spawnBurst(ev.x, 1.1, ev.z, 18, 0x22d3ee, 7.4);
          this.triggerImpactRing(ev.x, 0.18, ev.z, 0xffffff, 0.4);
          this.spawnImpactDecal(ev.x, ev.z, 0x38bdf8, 2.6, 7.0);
          break;
        case 'chronicle_loom_ending_selected':
          this.spawnBurst(0, 2.2, -2, 32, 0x22d3ee, 9.5);
          this.triggerImpactRing(0, 0.2, -2, 0xffffff, 0.5);
          break;
        case 'obstacle_damaged':
          this.spawnBurst(ev.x, 0.85, ev.z, 10, 0xf59e0b, 5.2);
          break;
        case 'obstacle_destroyed':
          this.spawnBurst(ev.x, 1.0, ev.z, 26, 0x22d3ee, 9.2);
          this.spawnBurst(ev.x, 0.8, ev.z, 16, 0xf59e0b, 7.2);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0x22d3ee, 0.42);
          this.spawnImpactDecal(ev.x, ev.z, 0xf59e0b, 3.2, 7.0);
          break;
        case 'boost_pad_triggered':
          this.spawnBurst(ev.x, 0.45, ev.z, 18, 0x38bdf8, 6.8);
          this.triggerImpactRing(ev.x, 0.14, ev.z, 0x22d3ee, 0.34);
          break;
        case 'flux_pool_spawned':
          this.spawnBurst(ev.x, 0.45, ev.z, 22, 0x22d3ee, 7.6);
          this.triggerImpactRing(ev.x, 0.12, ev.z, 0x06b6d4, 0.46);
          break;
        case 'temporal_thread_triggered':
          this.spawnBurst(ev.x, 1.15, ev.z, 20, 0x22d3ee, 8.2);
          this.spawnBurst(ev.x, 1.25, ev.z, 12, 0xfbbf24, 6.4);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0xfbbf24, 0.38);
          break;
        case 'weapon_switched':
          this.spawnBurst(
            ev.x,
            1.15,
            ev.z,
            8,
            ev.weaponId === 'grav_breaker'
              ? 0xf59e0b
              : ev.weaponId === 'phase_rail'
                ? 0xe0f2fe
                : ev.weaponId === 'pulsecaster'
                  ? 0x38bdf8
                  : 0x22d3ee,
            3.8
          );
          break;
        case 'player_pulse_shot':
          this.spawnBurst(ev.x, 1.15, ev.z, 8, 0x38bdf8, 5.2);
          break;
        case 'player_pulse_heavy_shot':
          this.spawnBurst(ev.x, 1.15, ev.z, 16, 0xf59e0b, 7.4);
          this.triggerImpactRing(ev.x, 0.22, ev.z, 0x38bdf8, 0.22);
          break;
        case 'player_rail_shot':
          this.spawnBurst(ev.x, 1.15, ev.z, 14, 0xe0f2fe, 6.8);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0x38bdf8, 0.24);
          if (this.screenEffectsEnabled !== false && this.railBeamMesh && this.railBeamMat) {
            this.railBeamMesh.position.set(ev.x, 1.15, ev.z);
            this.railBeamMesh.rotation.y = this.playerRig?.root?.rotation?.y ?? 0;
            this.railBeamMesh.scale.set(0.95, 0.95, 1);
            this.railBeamMat.color.setHex(0x38bdf8);
            this.railBeamMat.opacity = 0.72;
            this.railBeamMesh.visible = true;
            this.railBeamTimer = 0.14;
          }
          if (!this.reducedMotion) {
            this.fovKick = Math.max(this.fovKick ?? 0, 1.4);
          }
          break;
        case 'player_rail_heavy_shot':
          this.spawnBurst(ev.x, 1.15, ev.z, 26, 0xffffff, 9.4);
          this.spawnBurst(ev.x, 1.15, ev.z, 16, 0x22d3ee, 7.6);
          this.triggerImpactRing(ev.x, 0.22, ev.z, 0xffffff, 0.34);
          this.spawnImpactDecal(ev.x, ev.z, 0x38bdf8, 1.85, 6.0);
          if (this.screenEffectsEnabled !== false && this.railBeamMesh && this.railBeamMat) {
            this.railBeamMesh.position.set(ev.x, 1.15, ev.z);
            this.railBeamMesh.rotation.y = this.playerRig?.root?.rotation?.y ?? 0;
            this.railBeamMesh.scale.set(1.6, 1.6, 1);
            this.railBeamMat.color.setHex(0xffffff);
            this.railBeamMat.opacity = 0.92;
            this.railBeamMesh.visible = true;
            this.railBeamTimer = 0.18;
          }
          if (!this.reducedMotion) {
            this.hitstopTimer = Math.max(this.hitstopTimer ?? 0, 0.045);
            this.fovKick = Math.max(this.fovKick ?? 0, 2.6);
          }
          break;
        case 'breaker_shockwave_slam':
          this.spawnBurst(
            ev.x,
            0.35,
            ev.z,
            ev.isHeavy ? 32 : 20,
            ev.isHeavy ? 0xf59e0b : 0xfbbf24,
            ev.isHeavy ? 9.8 : 7.2
          );
          this.triggerImpactRing(
            ev.x,
            0.16,
            ev.z,
            ev.isHeavy ? 0xf59e0b : 0x38bdf8,
            ev.isHeavy ? 0.44 : 0.3
          );
          this.spawnImpactDecal(
            ev.x,
            ev.z,
            ev.isHeavy ? 0xf59e0b : 0xfbbf24,
            ev.isHeavy ? 2.8 : 1.9,
            7.0
          );
          this.triggerSlashRibbon(
            ev.x,
            0.95,
            ev.z,
            this.playerRig?.root?.rotation?.y ?? 0,
            0.08,
            ev.isHeavy ? 0xf59e0b : 0xfbbf24,
            ev.isHeavy ? 1.62 : 1.24,
            0.24,
            1
          );
          if (!this.reducedMotion) {
            this.hitstopTimer = Math.max(this.hitstopTimer ?? 0, ev.isHeavy ? 0.052 : 0.036);
            this.fovKick = Math.max(this.fovKick ?? 0, ev.isHeavy ? 2.6 : 1.6);
          }
          break;
        case 'chrono_execution_finisher': {
          this.spawnBurst(ev.x, 1.35, ev.z, 34, 0xfbbf24, 10.6);
          this.spawnBurst(ev.x, 1.25, ev.z, 24, 0x22d3ee, 8.8);
          this.triggerImpactRing(ev.x, 0.22, ev.z, 0xfbbf24, 0.48);
          this.spawnImpactDecal(ev.x, ev.z, 0xfbbf24, 2.4, 7.5);
          const execYaw =
            typeof ev.originX === 'number' && typeof ev.originZ === 'number'
              ? Math.atan2(ev.x - ev.originX, ev.z - ev.originZ)
              : (this.playerRig?.root?.rotation?.y ?? 0);
          this.triggerSlashRibbon(ev.x, 1.2, ev.z, execYaw, 0.44, 0xfbbf24, 1.55, 0.34, 1);
          this.triggerSlashRibbon(ev.x, 1.2, ev.z, execYaw, -0.44, 0x22d3ee, 1.45, 0.3, -1);
          if (typeof ev.originX === 'number' && typeof ev.originZ === 'number') {
            this.spawnDashGhost(ev.originX, ev.originZ, execYaw, 0xfbbf24);
            this.spawnDashGhost(
              (ev.originX + ev.x) * 0.5,
              (ev.originZ + ev.z) * 0.5,
              execYaw,
              0x22d3ee
            );
          }
          if (!this.reducedMotion) {
            this.hitstopTimer = Math.max(this.hitstopTimer ?? 0, 0.085);
            this.fovKick = Math.max(this.fovKick ?? 0, 3.8);
          }
          break;
        }
        case 'pulse_overheated':
          this.spawnBurst(ev.x, 1.2, ev.z, 14, 0xef4444, 5.5);
          break;
        case 'pulse_overheat_cleared':
          this.spawnBurst(ev.x, 1.15, ev.z, 8, 0x22d3ee, 3.6);
          break;
        case 'active_vent_success':
          this.spawnBurst(ev.x, 1.25, ev.z, 20, 0x22d3ee, 7.6);
          this.spawnBurst(ev.x, 1.3, ev.z, 10, 0xffffff, 5.8);
          this.triggerImpactRing(ev.x, 0.24, ev.z, 0x22d3ee, 0.36);
          if (!this.reducedMotion) {
            this.fovKick = Math.max(this.fovKick ?? 0, 2.2);
          }
          break;
        case 'active_vent_missed':
          this.spawnBurst(ev.x, 1.2, ev.z, 12, 0xf59e0b, 4.8);
          break;
        case 'adrenaline_tier_changed':
          if ((ev.postureBonus ?? 0) > 0 && (ev.amount ?? 0) >= 1) {
            const tierColor = (ev.amount ?? 0) >= 4 ? 0xfbbf24 : 0x22d3ee;
            this.spawnBurst(ev.x, 1.15, ev.z, 14, tierColor, 5.4);
            this.triggerImpactRing(ev.x, 0.14, ev.z, tierColor, 0.28);
            if ((ev.amount ?? 0) >= 4) {
              this.resonanceFlash = Math.max(this.resonanceFlash ?? 0, 0.65);
            }
          }
          break;
        case 'pulse_impact_obstacle':
          this.spawnBurst(
            ev.x,
            1.1,
            ev.z,
            ev.isHeavy ? 14 : 8,
            ev.isHeavy ? 0xf59e0b : 0x38bdf8,
            ev.isHeavy ? 5.6 : 4.2
          );
          break;
        case 'environmental_interaction_completed':
          this.spawnBurst(ev.x, 1.25, ev.z, 20, 0x34d399, 6.4);
          this.spawnBurst(ev.x, 1.35, ev.z, 12, 0x22d3ee, 5.2);
          this.triggerImpactRing(ev.x, 0.14, ev.z, 0x34d399, 0.34);
          break;
        case 'environmental_interaction_rejected':
          this.spawnBurst(ev.x, 1.0, ev.z, 6, 0xf59e0b, 3.2);
          break;
        case 'traversal_route_unlocked':
          this.spawnBurst(ev.x, 1.35, ev.z, 22, 0x22d3ee, 7.2);
          this.triggerImpactRing(ev.x, 0.16, ev.z, 0x22d3ee, 0.36);
          break;
        case 'timed_hazard_active':
          this.spawnBurst(ev.x, 0.9, ev.z, 12, 0xef4444, 5.8);
          break;
        case 'timed_hazard_damaged_player':
          this.spawnBurst(ev.x, 1.1, ev.z, 18, 0xef4444, 7.2);
          this.triggerImpactRing(ev.x, 0.14, ev.z, 0xef4444, 0.32);
          break;
        case 'secret_area_discovered':
          this.spawnBurst(ev.x, 1.35, ev.z, 28, 0xffffff, 8.4);
          this.spawnBurst(ev.x, 1.15, ev.z, 20, 0x34d399, 6.8);
          this.triggerImpactRing(ev.x, 0.16, ev.z, 0x34d399, 0.42);
          break;
      }
    }
  }

  private updateParticles(dt: number): void {
    if (!this.hasActiveParticles) return;
    let anyChanged = false;
    let anyStillActive = false;
    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
      const p = this.particles[i];
      if (!p.active) continue;
      anyChanged = true;
      p.age += dt;
      if (p.age >= p.maxAge) {
        p.active = false;
        _dummyObj.position.set(0, -100, 0);
        _dummyObj.scale.setScalar(0.001);
        _dummyObj.updateMatrix();
        this.particleInstancedMesh.setMatrixAt(i, _dummyObj.matrix);
        continue;
      }
      anyStillActive = true;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.vy -= 14 * dt; // Gravity
      const lifeRatio = 1 - p.age / p.maxAge;
      _dummyObj.position.set(p.x, Math.max(0.05, p.y), p.z);
      _dummyObj.rotation.set(p.age * 8, p.age * 6, 0);
      _dummyObj.scale.set(
        p.size * lifeRatio * 0.75,
        p.size * lifeRatio * 1.45,
        p.size * lifeRatio * 0.75
      );
      _dummyObj.updateMatrix();
      this.particleInstancedMesh.setMatrixAt(i, _dummyObj.matrix);
    }

    this.hasActiveParticles = anyStillActive;
    if (anyChanged) {
      this.particleInstancedMesh.instanceMatrix.needsUpdate = true;
    }
    if (this.particleColorsDirty && this.particleInstancedMesh.instanceColor) {
      this.particleInstancedMesh.instanceColor.needsUpdate = true;
      this.particleColorsDirty = false;
    }
  }

  public attachLockOnElement(el: HTMLDivElement | null): void {
    this.lockOnEl = el;
    if (el) {
      el.dataset.active = 'false';
      el.style.opacity = '0';
    }
  }

  private triggerSlashRibbon(
    x: number,
    y: number,
    z: number,
    yaw: number,
    rollTilt: number,
    colorHex: number,
    scale: number,
    duration: number,
    spinDir: number
  ): void {
    if (this.reducedMotion || this.screenEffectsEnabled === false) return;
    if (!this.slashRibbonSlots || this.slashRibbonSlots.length === 0) return;
    const slot = this.slashRibbonSlots[this.slashRibbonNextIdx % SLASH_RIBBON_POOL_SIZE];
    this.slashRibbonNextIdx = (this.slashRibbonNextIdx + 1) % SLASH_RIBBON_POOL_SIZE;
    slot.active = true;
    slot.age = 0;
    slot.maxAge = Math.max(0.08, duration);
    slot.spinDir = spinDir >= 0 ? 1 : -1;
    slot.startScale = scale;
    slot.baseOpacity = 0.88;
    slot.group.position.set(x, y, z);
    slot.group.rotation.set(0, yaw, rollTilt);
    slot.mesh.rotation.y = Math.PI * 0.5 - slot.spinDir * 0.45;
    slot.group.scale.setScalar(scale * 0.72);
    slot.mat.color.setHex(colorHex);
    slot.mat.opacity = 0.88;
    slot.group.visible = true;
  }

  private spawnDashGhost(
    x: number,
    z: number,
    yaw: number,
    colorHex = 0x22d3ee
  ): void {
    if (this.reducedMotion || this.screenEffectsEnabled === false || this.particleQuality === 'low') {
      return;
    }
    if (!this.dashGhostSlots || this.dashGhostSlots.length === 0) return;
    const slot = this.dashGhostSlots[this.dashGhostNextIdx % DASH_GHOST_POOL_SIZE];
    this.dashGhostNextIdx = (this.dashGhostNextIdx + 1) % DASH_GHOST_POOL_SIZE;
    slot.active = true;
    slot.age = 0;
    slot.maxAge = 0.24;
    slot.group.position.set(x, 0, z);
    slot.group.rotation.y = yaw;
    slot.group.scale.setScalar(1);
    slot.mat.color.setHex(colorHex);
    slot.mat.opacity = 0.44;
    slot.group.visible = true;
  }

  private updateSlashRibbonsAndGhosts(dt: number): void {
    for (let i = 0; i < this.slashRibbonSlots.length; i++) {
      const slot = this.slashRibbonSlots[i];
      if (!slot.active) continue;
      slot.age += dt;
      if (slot.age >= slot.maxAge) {
        slot.active = false;
        slot.group.visible = false;
        continue;
      }
      const progress = slot.age / slot.maxAge;
      const eased = 1 - Math.pow(1 - progress, 2);
      slot.group.scale.setScalar(slot.startScale * (0.72 + eased * 0.48));
      slot.mesh.rotation.y += slot.spinDir * dt * 10.5;
      slot.mat.opacity = slot.baseOpacity * Math.max(0, 1 - progress * progress);
    }

    for (let i = 0; i < this.dashGhostSlots.length; i++) {
      const slot = this.dashGhostSlots[i];
      if (!slot.active) continue;
      slot.age += dt;
      if (slot.age >= slot.maxAge) {
        slot.active = false;
        slot.group.visible = false;
        continue;
      }
      const progress = slot.age / slot.maxAge;
      slot.group.scale.setScalar(1 + progress * 0.08);
      slot.mat.opacity = 0.44 * Math.max(0, 1 - progress);
    }

    if (this.decalSlots) {
      for (let i = 0; i < this.decalSlots.length; i++) {
        const slot = this.decalSlots[i];
        if (!slot.active) continue;
        slot.age += dt;
        if (slot.age >= slot.maxAge) {
          slot.active = false;
          slot.mesh.visible = false;
          continue;
        }
        const progress = slot.age / slot.maxAge;
        const popAlpha = Math.min(1, slot.age / 0.12);
        slot.mesh.scale.setScalar(slot.targetScale * (0.65 + 0.35 * popAlpha));
        const fade = progress > 0.65 ? Math.max(0, 1 - (progress - 0.65) / 0.35) : 1;
        slot.mat.opacity = slot.baseOpacity * fade;
      }
    }
  }

  private spawnImpactDecal(
    x: number,
    z: number,
    colorHex: number,
    scale = 1.6,
    maxAge = 6.5
  ): void {
    if (
      this.screenEffectsEnabled === false ||
      this.particleQuality === 'low' ||
      !this.decalSlots ||
      this.decalSlots.length === 0
    ) {
      return;
    }
    const slot = this.decalSlots[this.decalNextIdx % DECAL_POOL_SIZE];
    this.decalNextIdx = (this.decalNextIdx + 1) % DECAL_POOL_SIZE;
    slot.active = true;
    slot.age = 0;
    slot.maxAge = maxAge;
    slot.baseOpacity = 0.46;
    slot.targetScale = scale;
    slot.mesh.position.set(x, 0.032, z);
    slot.mesh.rotation.y = Math.random() * Math.PI * 2;
    slot.mesh.scale.setScalar(scale * 0.65);
    slot.mat.color.setHex(colorHex);
    slot.mat.opacity = 0.46;
    slot.mesh.visible = true;
  }

  private syncBloomState(): void {
    this.bloomEnabled = Boolean(
      this.composer &&
        this.renderer &&
        !this.isHeadless &&
        !this.isSoftwareGl &&
        this.graphicsPreset !== 'performance' &&
        this.lightingQuality !== 'lite' &&
        this.screenEffectsEnabled !== false
    );
  }

  private updateLockOnReticle(world: WorldState, dt = 0.016): void {
    const target =
      world.appState === 'playing'
        ? resolveActiveLockOnTarget(world, world.player.lockOnTargetId)
        : null;
    const lockedEnemy = target ? world.enemies?.find?.((e) => e.id === target.id) ?? null : null;
    const lockVis = computeLockOnGroundVisuals({
      active: Boolean(target),
      isBoss: Boolean(target?.isBoss),
      targetRadius: lockedEnemy?.radius ?? (target?.isBoss ? 1.45 : 0.7),
      isStaggered: Boolean(target?.isStaggered),
      isTelegraphing: lockedEnemy?.aiState === 'telegraph',
      isResonanceMarked: Boolean(
        target &&
          world.resonance?.activeMark?.enemyId === target.id &&
          world.resonance.activeMark.remainingTime > 0
      ),
      coreExposed: Boolean(target?.isBoss && world.boss?.coreExposed),
      reducedMotion: this.reducedMotion,
      timeSec: world.elapsedTime,
    });

    if (this.lockOnGroundGroup) {
      if (lockVis.visible && target) {
        this.lockOnGroundGroup.visible = true;
        this.lockOnGroundGroup.position.set(target.x, 0.058, target.z);
        this.lockOnGroundGroup.scale.setScalar(lockVis.outerRadius * lockVis.pulseScale);
        if (this.lockOnOuterRingMesh && this.lockOnOuterRingMat) {
          this.lockOnOuterRingMesh.rotation.y += lockVis.outerSpinRate * dt;
          this.lockOnOuterRingMat.color.setHex(lockVis.outerHex);
          this.lockOnOuterRingMat.opacity = lockVis.outerOpacity;
        }
        if (this.lockOnInnerDiscMesh && this.lockOnInnerDiscMat) {
          this.lockOnInnerDiscMesh.rotation.y += lockVis.innerSpinRate * dt;
          this.lockOnInnerDiscMat.color.setHex(lockVis.innerHex);
          this.lockOnInnerDiscMat.opacity = lockVis.innerOpacity;
        }
      } else {
        this.lockOnGroundGroup.visible = false;
      }
    }

    const el = this.lockOnEl;
    if (!el) return;
    if (world.appState !== 'playing' || !target) {
      el.dataset.active = 'false';
      el.style.opacity = '0';
      return;
    }
    const vw = this.viewportWidth || (typeof window !== 'undefined' ? window.innerWidth : 1280);
    const vh = this.viewportHeight || (typeof window !== 'undefined' ? window.innerHeight : 720);
    _projVec
      .set(target.x, target.isBoss ? 1.65 : 1.08, target.z)
      .project(this.camera);
    const projected = projectNdcToViewport(_projVec.x, _projVec.y, _projVec.z, vw, vh);
    if (!projected.visible) {
      el.dataset.active = 'true';
      el.dataset.staggered = target.isStaggered ? 'true' : 'false';
      el.dataset.targetId = target.id;
      el.style.opacity = '0';
      return;
    }
    el.dataset.active = 'true';
    el.dataset.staggered = target.isStaggered ? 'true' : 'false';
    el.dataset.targetId = target.id;
    el.style.opacity = '1';
    el.style.transform = `translate3d(${projected.x.toFixed(1)}px, ${projected.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
  }

  public setReducedMotion(enabled: boolean): void {
    this.reducedMotion = Boolean(enabled);
  }

  public setCameraShake(enabled: boolean): void {
    this.cameraShakeEnabled = Boolean(enabled);
  }

  public setScreenEffects(enabled: boolean): void {
    this.screenEffectsEnabled = Boolean(enabled);
    if (!this.screenEffectsEnabled) {
      this.relayVfxTimer = 0;
      this.impactRingTimer = 0;
      if (this.relayOriginPillarMesh) this.relayOriginPillarMesh.visible = false;
      if (this.relayArrivalPillarMesh) this.relayArrivalPillarMesh.visible = false;
      if (this.impactRingMesh) this.impactRingMesh.visible = false;
      if (this.slashRibbonSlots) {
        for (let i = 0; i < this.slashRibbonSlots.length; i++) {
          this.slashRibbonSlots[i].active = false;
          this.slashRibbonSlots[i].group.visible = false;
        }
      }
      if (this.dashGhostSlots) {
        for (let i = 0; i < this.dashGhostSlots.length; i++) {
          this.dashGhostSlots[i].active = false;
          this.dashGhostSlots[i].group.visible = false;
        }
      }
      if (this.staggerBeaconSlots) {
        for (let i = 0; i < this.staggerBeaconSlots.length; i++) {
          this.staggerBeaconSlots[i].group.visible = false;
        }
      }
      if (this.decalSlots) {
        for (let i = 0; i < this.decalSlots.length; i++) {
          this.decalSlots[i].active = false;
          this.decalSlots[i].mesh.visible = false;
        }
      }
      if (this.dustPoints) {
        this.dustPoints.visible = false;
      }
      if (this.echoTetherMesh) {
        this.echoTetherMesh.visible = false;
      }
    }
    this.syncBloomState();
  }

  public applyPerformanceSettings(settings: Partial<CameraSettings>): void {
    const resolved = resolveGraphicsSettings(settings);
    this.graphicsPreset = resolved.graphicsPreset;
    this.renderScale = resolved.renderScale;
    this.shadowQuality = resolved.shadowQuality;
    this.particleQuality = resolved.particleQuality;
    this.particleScale = getParticleScaleFactor(resolved.particleQuality);
    this.lightingQuality = resolved.lightingQuality;
    this.fpsLimit = resolved.fpsLimit;
    this.lastEnvLightingQuality = null;

    if (typeof settings.reducedMotion === 'boolean') {
      this.setReducedMotion(settings.reducedMotion);
    }
    if (typeof settings.cameraShake === 'boolean') {
      this.setCameraShake(settings.cameraShake);
    }
    if (typeof settings.screenEffects === 'boolean') {
      this.setScreenEffects(settings.screenEffects);
    }

    const nextDpr = computeEffectivePixelRatio(
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
      GAME_CONFIG.camera.maxPixelRatio,
      resolved.renderScale,
      this.isHeadless,
      this.isSoftwareGl
    );
    if (Math.abs(nextDpr - (this.appliedPixelRatio ?? 1)) > 0.01) {
      this.appliedPixelRatio = nextDpr;
      this.renderer?.setPixelRatio?.(nextDpr);
      this.composer?.setPixelRatio?.(nextDpr);
      if (this.viewportWidth > 0 && this.viewportHeight > 0) {
        this.renderer?.setSize?.(this.viewportWidth, this.viewportHeight, false);
        this.composer?.setSize?.(this.viewportWidth, this.viewportHeight);
      }
    }

    if (this.renderer && !this.isHeadless && !this.isSoftwareGl) {
      const wantShadows = resolved.shadowQuality !== 'off';
      const targetSize = getShadowMapSizeForQuality(resolved.shadowQuality);
      this.renderer.shadowMap.enabled = wantShadows;
      this.keyLight.castShadow = wantShadows;
      if (wantShadows && targetSize > 0 && this.keyLight.shadow.mapSize.width !== targetSize) {
        this.keyLight.shadow.mapSize.set(targetSize, targetSize);
        this.keyLight.shadow.map?.dispose?.();
        this.keyLight.shadow.map = null;
      }
      this.renderer.shadowMap.needsUpdate = true;
    }

    if (this.calLight) {
      this.calLight.visible = resolved.lightingQuality === 'standard';
    }
    if (this.scene) {
      this.scene.environmentIntensity =
        this.isHeadless || this.isSoftwareGl
          ? resolved.lightingQuality === 'lite'
            ? 0.36
            : 0.54
          : resolved.lightingQuality === 'lite'
            ? 0.38
            : 0.58;
    }
    if (resolved.particleQuality === 'low') {
      if (this.echoGhosts) {
        for (let g = 0; g < this.echoGhosts.length; g++) {
          this.echoGhosts[g].root.visible = false;
        }
      }
      if (this.decalSlots) {
        for (let i = 0; i < this.decalSlots.length; i++) {
          this.decalSlots[i].active = false;
          this.decalSlots[i].mesh.visible = false;
        }
      }
      if (this.dustPoints) {
        this.dustPoints.visible = false;
      }
      if (this.echoTetherMesh) {
        this.echoTetherMesh.visible = false;
      }
    }
    this.syncBloomState();
  }

  private updateEnvironmentPresentation(world: WorldState, dt: number): void {
    const ambientScale = this.reducedMotion ? 0.15 : 1;
    const ambientDt = dt * ambientScale;
    const ambientTime = world.elapsedTime * ambientScale;

    // Retract central Chronicle Loom Pylon into floor during Boss Encounter (except Chapter V Chronicle Loom finale!)
    this.loomPylonGroup.position.y =
      world.encounterMode === 'boss' && !world.loom?.active ? -6.5 : 0;

    // Dynamic Chapter Lighting, Sector Atmosphere & Chronicle Loom Ending Transformation
    const selectedEnding = world.run.selectedEnding ?? world.loom?.selectedEnding ?? null;
    const ringSpeedScale =
      selectedEnding === 'silence'
        ? 0.08
        : selectedEnding === 'witness'
          ? 2.45
          : selectedEnding === 'continuity'
            ? 1.35
            : 1.0;

    // Rotate concentric Chronicle Loom Pylon gyroscopic rings & bulkhead ventilation fans
    this.loomRingMesh.rotation.z += ambientDt * 0.68 * ringSpeedScale;
    this.loomRingMesh.rotation.y += ambientDt * 0.36 * ringSpeedScale;
    this.loomInnerRingMesh.rotation.x -= ambientDt * 0.92 * ringSpeedScale;
    this.loomInnerRingMesh.rotation.z += ambientDt * 0.48 * ringSpeedScale;
    this.loomOuterRingMesh.rotation.y -= ambientDt * 0.28 * ringSpeedScale;

    if (selectedEnding === 'witness') {
      this.loomWitnessBeamMesh.visible = true;
      this.loomWitnessBeamMat.opacity = 0.36 + Math.sin(ambientTime * 9) * 0.12 * ambientScale;
      this.loomWitnessBeamMesh.rotation.y += ambientDt * 2.4;
      this.loomContinuityDomeMesh.visible = false;
    } else if (selectedEnding === 'continuity') {
      this.loomContinuityDomeMesh.visible = true;
      this.loomContinuityDomeMat.opacity = 0.46 + Math.sin(ambientTime * 4.5) * 0.12 * ambientScale;
      this.loomContinuityDomeMesh.rotation.y += ambientDt * 0.65;
      this.loomWitnessBeamMesh.visible = false;
    } else {
      this.loomWitnessBeamMesh.visible = false;
      this.loomContinuityDomeMesh.visible = false;
    }

    // Chapter architecture and lighting remain presentation-only; cache static updates across frames
    const ch = world.run.chapter;
    const envDirty =
      ch !== this.lastEnvChapter ||
      selectedEnding !== this.lastEnvEnding ||
      this.lightingQuality !== this.lastEnvLightingQuality;

    if (envDirty) {
      this.lastEnvChapter = ch;
      this.lastEnvEnding = selectedEnding;
      this.lastEnvLightingQuality = this.lightingQuality;
      this.visibleChapterEnv = null;
      for (let i = 0; i < CHAPTER_IDS.length; i++) {
        const chapterEnv = this.chapterEnvironments.get(CHAPTER_IDS[i]);
        if (!chapterEnv) continue;
        const isVis = CHAPTER_IDS[i] === ch;
        chapterEnv.group.visible = isVis;
        if (isVis) {
          this.visibleChapterEnv = chapterEnv;
        }
      }

      const look = resolveChapterVisualLook(ch, selectedEnding);
      (this.scene.background as THREE.Color).setHex(look.background);
      this.sceneFog.color.setHex(look.background);
      this.sceneFog.density = look.fogDensity;
      this.hemiLight.color.setHex(look.hemi);
      this.hemiLight.groundColor?.setHex?.(look.hemiGround);
      this.keyLight.color.setHex(look.key);
      this.keyLight.intensity = look.keyIntensity;
      this.rimLight.color.setHex(look.rim);
      this.rimLight.intensity = look.rimIntensity;
      this.loomLight.color.setHex(look.loom);
      this.loomLight.intensity = look.loomIntensity;
      this.calLight.color.setHex(look.practical);
      this.calLight.visible = this.lightingQuality !== 'lite';
      if (!this.isHeadless && !this.isSoftwareGl) {
        this.scene.environmentIntensity = look.envIntensity;
      }
      this.conduitGlowMat.color.setHex(look.conduit);
      this.floorTelemetryMat?.uniforms?.uColor?.value?.setHex?.(look.conduit);
      this.skyDomeMat?.uniforms?.uZenith?.value?.setHex?.(look.skyZenith);
      this.skyDomeMat?.uniforms?.uHorizon?.value?.setHex?.(look.skyHorizon);
      this.skyDomeMat?.uniforms?.uNebula?.value?.setHex?.(look.nebulaTint);
      this.planetMat?.uniforms?.uAccent?.value?.setHex?.(look.rim);
      this.planetRingMat?.uniforms?.uAccent?.value?.setHex?.(look.conduit);
      this.beamConeMat?.color?.setHex?.(look.rim);
      this.loomLightShaftMat?.color.setHex(look.loom);
      this.dustMat?.color.setHex(look.rim);
    }

    if (this.visibleChapterEnv) {
      for (let r = 0; r < this.visibleChapterEnv.rotors.length; r++) {
        this.visibleChapterEnv.rotors[r].rotation.y +=
          ambientDt * (r % 2 === 0 ? 0.46 : -0.34) * ringSpeedScale;
      }
      for (let m = 0; m < this.visibleChapterEnv.pulseMaterials.length; m++) {
        this.visibleChapterEnv.pulseMaterials[m].opacity =
          selectedEnding === 'silence'
            ? 0.08
            : 0.28 + Math.sin(ambientTime * 2.8 + m) * 0.12 * ambientScale;
      }
    }

    for (let i = 0; i < this.ventFanMeshes.length; i++) {
      this.ventFanMeshes[i].rotation.z += ambientDt * (2.6 + (i % 2) * 0.6) * ringSpeedScale;
    }
    if (this.subDeckFans) {
      for (let i = 0; i < this.subDeckFans.length; i++) {
        this.subDeckFans[i].rotation.y += ambientDt * (1.25 + (i % 2) * 0.45) * ringSpeedScale;
      }
    }
    if (this.orbitalDrydockGroup) {
      this.orbitalDrydockGroup.rotation.y += ambientDt * 0.016 * ringSpeedScale;
    }
    if (this.skyDomeMat?.uniforms?.uTime) {
      this.skyDomeMat.uniforms.uTime.value = ambientTime;
    }
    if (this.floorTelemetryMat?.uniforms?.uTime) {
      this.floorTelemetryMat.uniforms.uTime.value = ambientTime;
    }
    if (this.planetMat?.uniforms?.uTime) {
      this.planetMat.uniforms.uTime.value = ambientTime;
    }
    this.conduitGlowMat.opacity =
      selectedEnding === 'silence'
        ? 0.22
        : 0.68 + Math.sin(ambientTime * 3.4) * 0.18 * ambientScale;

    if ((this.resonanceFlash ?? 0) > 0.005) {
      this.resonanceFlash = Math.max(0, (this.resonanceFlash ?? 0) * Math.exp(-4.2 * Math.max(0.001, dt)));
    } else {
      this.resonanceFlash = 0;
    }
    const baseChapterLook = resolveChapterVisualLook(ch, selectedEnding);
    const isBossActive = Boolean(
      world.boss && world.boss.hp > 0 && world.boss.aiState !== 'defeated'
    );
    const mood = computeArenaMoodModulation(baseChapterLook, {
      bossPhase: isBossActive ? world.boss!.phase : 1,
      bossCoreExposed: Boolean(isBossActive && world.boss?.coreExposed),
      adrenalineTier: Math.min(5, Math.max(0, Math.floor(world.player?.adrenalineScore ?? 0))),
      resonanceFlash: this.resonanceFlash ?? 0,
      reducedMotion: this.reducedMotion,
    });
    if (selectedEnding !== 'silence') {
      if (this.rimLight) {
        this.rimLight.color?.setHex?.(mood.rimHex);
        this.rimLight.intensity = mood.rimIntensity;
      }
      if (this.loomLight) {
        this.loomLight.intensity = mood.loomIntensity;
      }
    }
    if (this.beamConeMat) {
      this.beamConeMat.color?.setHex?.(mood.beamHex);
      this.beamConeMat.opacity =
        selectedEnding === 'silence'
          ? 0.01
          : Math.min(
              0.22,
              mood.beamOpacity * 0.45 + Math.sin(ambientTime * 1.4) * 0.008 * ambientScale
            );
    }
    if (this.loomLightShaftMat) {
      this.loomLightShaftMat.opacity =
        selectedEnding === 'silence'
          ? 0.012
          : selectedEnding === 'witness'
            ? 0.072
            : 0.036 + Math.sin(ambientTime * 1.8) * 0.01 * ambientScale;
    }

    if (this.dustPoints && this.dustPositions && this.dustPhases) {
      const showDust = this.particleQuality !== 'low' && this.screenEffectsEnabled !== false;
      this.dustPoints.visible = showDust;
      if (showDust && !this.reducedMotion) {
        for (let i = 0; i < DUST_MOTE_COUNT; i++) {
          const idx = i * 3;
          let y = this.dustPositions[idx + 1] + ambientDt * (0.22 + (i % 5) * 0.04);
          if (y > 7.6) y = 0.35;
          this.dustPositions[idx + 1] = y;
          const phase = this.dustPhases[i] + ambientTime * 0.55;
          this.dustPositions[idx] += Math.sin(phase) * ambientDt * 0.14;
          this.dustPositions[idx + 2] += Math.cos(phase) * ambientDt * 0.14;
        }
        const posAttr = this.dustPoints.geometry.getAttribute('position') as THREE.BufferAttribute | undefined;
        if (posAttr) posAttr.needsUpdate = true;
      }
    }

    // Update Phase 11 Sector Storytelling 3D Landmarks (Gameplay-Reactive)
    const activeBossId = world.boss?.id ?? null;
    const showHelixLandmarks =
      world.encounterMode === 'boss' &&
      (ch === 'chapter_1_helix' || activeBossId === 'helix-04');
    const showChoirLandmarks =
      world.encounterMode === 'boss' &&
      (ch === 'chapter_2_choir' || activeBossId === 'the-choir');
    const showCuratorLandmarks =
      world.encounterMode === 'boss' &&
      (ch === 'chapter_3_curator' || activeBossId === 'the-curator');
    const showMatronLandmarks =
      world.encounterMode === 'boss' &&
      (ch === 'chapter_4_matron' || activeBossId === 'matron-v');
    const showLoomSeals = ch === 'chapter_5_loom' || Boolean(world.loom?.active);

    this.helixLandmarksGroup.visible = showHelixLandmarks;
    if (showHelixLandmarks) {
      const helixVulnerable =
        Boolean(world.boss?.coreExposed) ||
        world.boss?.aiState === 'staggered' ||
        world.boss?.aiState === 'recovery' ||
        world.outcome === 'victory';
      for (let i = 0; i < this.helixBeaconRings.length; i++) {
        this.helixBeaconRings[i].rotation.y += dt * (helixVulnerable ? 3.2 : 1.4);
        this.helixBeaconRings[i].rotation.x = Math.sin(world.elapsedTime * 2 + i) * 0.35;
        this.helixBeaconMats[i].color.setHex(helixVulnerable ? 0x22d3ee : 0xf59e0b);
        this.helixBeaconMats[i].opacity =
          0.65 + Math.sin(world.elapsedTime * 5 + i) * 0.22;
      }
    }

    this.choirLandmarksGroup.visible = showChoirLandmarks;
    if (showChoirLandmarks && world.boss) {
      const nodes = world.choir.nodes;
      const allSynced =
        world.choir.synchronizedCount >= world.choir.requiredNodeCount ||
        world.boss.coreExposed ||
        world.boss.aiState === 'staggered' ||
        world.outcome === 'victory';
      for (let i = 0; i < this.choirWaveRingMeshes.length; i++) {
        const node = nodes[i];
        const primed = Boolean(node && node.status === 'primed');
        this.choirWaveRingMeshes[i].rotation.z +=
          dt * (allSynced ? 1.2 : primed ? 0.65 : 0.18) * (i % 2 === 0 ? 1 : -1);
        this.choirWaveRingMats[i].color.setHex(
          allSynced ? 0xfbbf24 : primed ? 0x22d3ee : 0x38bdf8
        );
        this.choirWaveRingMats[i].opacity = allSynced
          ? 0.72 + Math.sin(world.elapsedTime * 7 + i) * 0.18
          : primed
            ? 0.58
            : 0.22;
      }
    }

    this.curatorLandmarksGroup.visible = showCuratorLandmarks;
    if (showCuratorLandmarks) {
      const pinStabilized =
        world.gravityPin.activeDurationTimer > 0 ||
        Boolean(world.boss?.coreExposed) ||
        world.boss?.aiState === 'staggered' ||
        world.boss?.aiState === 'recovery' ||
        world.outcome === 'victory';
      for (let i = 0; i < this.curatorShardMeshes.length; i++) {
        const shard = this.curatorShardMeshes[i];
        shard.rotation.y += dt * (pinStabilized ? 2.6 : 1.1);
        shard.rotation.x += dt * 0.7;
        shard.position.y = 3.85 + Math.sin(world.elapsedTime * 2.8 + i) * 0.18;
        this.curatorShardMats[i].color.setHex(pinStabilized ? 0x22d3ee : 0xc084fc);
      }
    }

    this.matronLandmarksGroup.visible = showMatronLandmarks;
    if (showMatronLandmarks) {
      const severActive = Boolean(world.matron.chronoSeverActive);
      const collapseStabilized =
        world.echoCollapse.blastTimer > 0 ||
        Boolean(world.boss?.coreExposed) ||
        world.boss?.aiState === 'staggered' ||
        world.boss?.aiState === 'recovery' ||
        world.outcome === 'victory';
      for (let i = 0; i < this.matronScanRings.length; i++) {
        const ring = this.matronScanRings[i];
        ring.position.y =
          1.9 + Math.sin(world.elapsedTime * (severActive ? 5.2 : 2.2) + i * 1.2) * 1.3;
        this.matronScanMats[i].color.setHex(
          collapseStabilized ? 0x22d3ee : severActive ? 0xef4444 : 0xf43f5e
        );
        this.matronScanMats[i].opacity = severActive ? 0.92 : 0.68;
      }
    }

    this.loomSealsGroup.visible = showLoomSeals;
    if (showLoomSeals) {
      for (let i = 0; i < this.loomSealCrystals.length; i++) {
        const defaultSealColor =
          i === 0 ? 0xf59e0b : i === 1 ? 0x38bdf8 : i === 2 ? 0xc084fc : 0xf43f5e;
        const crystal = this.loomSealCrystals[i];
        crystal.rotation.y += ambientDt * 1.6 * ringSpeedScale;
        crystal.position.y =
          1.75 + Math.sin(ambientTime * 2.6 + i * 1.5) * 0.12 * ringSpeedScale * ambientScale;
        if (selectedEnding === 'silence') {
          this.loomSealMats[i].color.setHex(0x475569);
          this.loomSealMats[i].opacity = 0.35;
          this.loomSealTetherMats[i].opacity = 0.08;
        } else if (selectedEnding === 'witness') {
          this.loomSealMats[i].color.setHex(0xe0f2fe);
          this.loomSealMats[i].opacity = 0.96;
          this.loomSealTetherMats[i].color.setHex(0x38bdf8);
          this.loomSealTetherMats[i].opacity =
            0.78 + Math.sin(ambientTime * 8 + i) * 0.16 * ambientScale;
        } else if (selectedEnding === 'continuity') {
          this.loomSealMats[i].color.setHex(0xfbbf24);
          this.loomSealMats[i].opacity = 0.92;
          this.loomSealTetherMats[i].color.setHex(0xf59e0b);
          this.loomSealTetherMats[i].opacity =
            0.66 + Math.sin(ambientTime * 4 + i) * 0.14 * ambientScale;
        } else {
          this.loomSealMats[i].color.setHex(defaultSealColor);
          this.loomSealMats[i].opacity = 0.88;
          this.loomSealTetherMats[i].color.setHex(defaultSealColor);
          this.loomSealTetherMats[i].opacity =
            0.52 + Math.sin(ambientTime * 3.5 + i) * 0.15 * ambientScale;
        }
      }
    }

    // Phase 18: Update Pooled 3D Environmental Interactable Props (Guarded for mock prototype fixtures)
    if (this.interactablesGroup && world.exploration?.interactables) {
      const interactables = world.exploration.interactables;
      const focusedId = world.exploration.prompt?.interactableId ?? null;
      for (let i = 0; i < this.interactableRigs.length; i++) {
        const rig = this.interactableRigs[i];
        const item = interactables[i];
        if (!item) {
          rig.group.visible = false;
          continue;
        }
        rig.group.visible = true;
        rig.group.position.set(item.x, 0, item.z);
        const isPrompted = item.id === focusedId;
        const hexColor =
          item.status === 'activated'
            ? 0x34d399
            : item.status === 'locked'
              ? 0xf59e0b
              : isPrompted
                ? 0xe0f2fe
                : item.kind === 'echo_conduit'
                  ? 0x38bdf8
                  : 0x22d3ee;
        const paneHexColor =
          item.status === 'activated'
            ? 0x10b981
            : item.status === 'locked'
              ? 0xd97706
              : isPrompted
                ? 0x67e8f9
                : 0x0ea5e9;
        rig.coreMat.color.setHex(hexColor);
        rig.holoPaneMat.color.setHex(paneHexColor);
        rig.holoPaneMat.opacity =
          item.status === 'activated'
            ? 0.24
            : isPrompted
              ? 0.52
              : 0.36;
        rig.ringMat.color.setHex(hexColor);
        rig.coreMesh.rotation.y += ambientDt * (isPrompted ? 2.4 : 1.1);
        rig.coreMesh.position.y =
          1.56 + Math.sin(ambientTime * 2.8 + i) * 0.07 * ambientScale;
        rig.ringMat.opacity =
          item.status === 'activated'
            ? 0.32
            : isPrompted
              ? 0.82
              : 0.48 + Math.sin(ambientTime * 3.2 + i) * 0.14 * ambientScale;
      }
    }

    // Phase 19: Retract unlocked corner containment pylons smoothly into the deck floor
    if (world.obstacles && this.obstacleMeshById && this.obstacleMeshById.size > 0) {
      for (let i = 0; i < world.obstacles.length; i++) {
        const obs = world.obstacles[i];
        if (!obs || obs.id === 'loom-pylon') continue;
        const meshGroup = this.obstacleMeshById.get(obs.id);
        if (!meshGroup) continue;
        const targetY = obs.disabled ? -(obs.height + 0.35) : 0;
        if (this.reducedMotion) {
          meshGroup.position.y = targetY;
        } else {
          meshGroup.position.y +=
            (targetY - meshGroup.position.y) * Math.min(1, dt * 6.5);
        }
      }
    } else if (this.obstacleMeshes && this.obstacleMeshes.length > 0 && world.obstacles) {
      for (let i = 0; i < this.obstacleMeshes.length; i++) {
        const meshGroup = this.obstacleMeshes[i];
        const obs = world.obstacles[i];
        if (!meshGroup || !obs || obs.id === 'loom-pylon') continue;
        const targetY = obs.disabled ? -(obs.height + 0.35) : 0;
        if (this.reducedMotion) {
          meshGroup.position.y = targetY;
        } else {
          meshGroup.position.y +=
            (targetY - meshGroup.position.y) * Math.min(1, dt * 6.5);
        }
      }
    }

    // v1.5.0 Package B: Update Dynamic Chapter Cover Barricades & Destructible Capacitors
    if (this.dynamicObstaclesGroup && this.dynamicObstacleRigs && world.obstacles) {
      const lookAccent = CHAPTER_VISUAL_LOOKS[ch].conduit;
      let rigIdx = 0;
      for (let i = 0; i < world.obstacles.length && rigIdx < this.dynamicObstacleRigs.length; i++) {
        const obs = world.obstacles[i];
        if (obs.disabled || (obs.kind !== 'cover_wall' && obs.kind !== 'destructible_crate')) {
          continue;
        }
        const rig = this.dynamicObstacleRigs[rigIdx++];
        rig.group.visible = true;
        rig.group.position.set(obs.x, 0, obs.z);
        const faceCenterYaw = Math.atan2(-obs.x, -obs.z);
        rig.group.rotation.y = obs.kind === 'cover_wall' ? faceCenterYaw : 0;
        rig.wallGroup.visible = obs.kind === 'cover_wall';
        rig.crateGroup.visible = obs.kind === 'destructible_crate';
        rig.trimMat.color.setHex(lookAccent);
        rig.trimMat.emissive.setHex(lookAccent);

        const curHp = obs.hp ?? obs.maxHp ?? 45;
        if (rig.lastObstacleId !== obs.id) {
          rig.lastObstacleId = obs.id;
          rig.lastHp = curHp;
          rig.hitTimer = 0;
        } else if (curHp < rig.lastHp) {
          rig.lastHp = curHp;
          rig.hitTimer = 0.16;
        }
        if (rig.hitTimer > 0) {
          rig.hitTimer = Math.max(0, rig.hitTimer - dt);
        }
        const wobble = rig.hitTimer > 0 && !this.reducedMotion ? Math.sin(rig.hitTimer * 52) * 0.06 : 0;
        rig.group.rotation.z = wobble;

        const maxHp = Math.max(1, obs.maxHp ?? 45);
        const hpRatio = obs.destructible ? curHp / maxHp : 1;
        rig.coreMat.color.setHex(
          rig.hitTimer > 0 ? 0xffffff : hpRatio < 0.6 ? 0xef4444 : 0xf59e0b
        );
      }
      for (; rigIdx < this.dynamicObstacleRigs.length; rigIdx++) {
        this.dynamicObstacleRigs[rigIdx].group.visible = false;
      }
    }

    // v1.5.0 Package C: Update Kinetic Vector Boost Pads
    if (this.boostPadsGroup && this.boostPadRigs) {
      const pads = world.boostPads ?? [];
      for (let i = 0; i < this.boostPadRigs.length; i++) {
        const bRig = this.boostPadRigs[i];
        const pad = pads[i];
        if (!pad) {
          bRig.group.visible = false;
          continue;
        }
        bRig.group.visible = true;
        bRig.group.position.set(pad.x, 0, pad.z);
        const ready = pad.cooldown <= 0;
        bRig.chevronMesh.rotation.y += ambientDt * (ready ? 2.4 : 0.35);
        bRig.ringMat.color.setHex(ready ? 0x22d3ee : 0x475569);
        bRig.ringMat.opacity = ready
          ? 0.56 + Math.sin(ambientTime * 4.2 + i) * 0.14 * ambientScale
          : 0.24;
        bRig.chevronMat.color.setHex(ready ? 0x67e8f9 : 0x64748b);
        bRig.chevronMat.opacity = ready ? 0.8 : 0.26;
      }
    }

    // Phase 19: Update Pooled Timed Energy Passages (with Scrolling GLSL Energy Field Shader)
    if (this.hazardsGroup) {
      const hazards = world.exploration?.hazards ?? [];
      for (let i = 0; i < this.hazardRigs.length; i++) {
        const hRig = this.hazardRigs[i];
        const h = hazards[i];
        if (!h) {
          hRig.group.visible = false;
          continue;
        }
        hRig.group.visible = true;
        hRig.group.position.set(h.x, 0, h.z);
        hRig.ringMesh.scale.setScalar(h.radius);
        hRig.columnMesh.scale.set(h.radius * 0.85, 1, h.radius * 0.85);
        hRig.ringMesh.rotation.z += ambientDt * (h.active ? 3.6 : 1.4);
        if (hRig.columnMat.uniforms?.uTime) {
          hRig.columnMat.uniforms.uTime.value = ambientTime;
        }

        if (h.phase === 'active') {
          hRig.ringMat.color.setHex(0xef4444);
          hRig.ringMat.opacity = 0.88;
          hRig.columnMesh.visible = true;
          hRig.columnMat.uniforms?.uColor?.value?.setHex?.(0xef4444);
          if (hRig.columnMat.uniforms?.uOpacity) {
            hRig.columnMat.uniforms.uOpacity.value =
              0.42 + Math.sin(ambientTime * 14) * 0.1 * ambientScale;
          }
        } else if (h.phase === 'warning') {
          hRig.ringMat.color.setHex(0xf59e0b);
          hRig.ringMat.opacity =
            0.64 + Math.sin(ambientTime * 10) * 0.16 * ambientScale;
          hRig.columnMesh.visible = true;
          hRig.columnMat.uniforms?.uColor?.value?.setHex?.(0xf59e0b);
          if (hRig.columnMat.uniforms?.uOpacity) {
            hRig.columnMat.uniforms.uOpacity.value = 0.2;
          }
        } else {
          hRig.ringMat.color.setHex(0x22d3ee);
          hRig.ringMat.opacity = 0.36;
          hRig.columnMesh.visible = false;
          if (hRig.columnMat.uniforms?.uOpacity) {
            hRig.columnMat.uniforms.uOpacity.value = 0;
          }
        }
      }
    }

    // Phase 19: Update Pooled Secret Exploration Alcove Beacons
    if (this.secretsGroup) {
      const secrets = world.exploration?.secrets ?? [];
      for (let i = 0; i < this.secretRigs.length; i++) {
        const sRig = this.secretRigs[i];
        const s = secrets[i];
        if (!s || (!s.accessible && !s.discovered)) {
          sRig.group.visible = false;
          continue;
        }
        sRig.group.visible = true;
        sRig.group.position.set(s.x, 0, s.z);
        sRig.ringMesh.scale.setScalar(s.radius * 0.68);
        sRig.coreMesh.rotation.y += ambientDt * (s.discovered ? 1.0 : 2.4);
        sRig.coreMesh.position.y =
          1.15 + Math.sin(ambientTime * 3.0 + i) * 0.08 * ambientScale;
        const hex = s.discovered ? 0x34d399 : 0xe0f2fe;
        sRig.coreMat.color.setHex(hex);
        sRig.ringMat.color.setHex(s.discovered ? 0x34d399 : 0x22d3ee);
        sRig.ringMat.opacity = s.discovered
          ? 0.35
          : 0.72 + Math.sin(ambientTime * 4.0) * 0.15 * ambientScale;
      }
    }

    // v1.9.0: Update Pooled Charged Flux Pools
    if (this.fluxPoolsGroup && this.fluxPoolRigs) {
      const pools = world.fluxPools ?? [];
      for (let i = 0; i < this.fluxPoolRigs.length; i++) {
        const fRig = this.fluxPoolRigs[i];
        const pool = pools[i];
        if (!pool || pool.remainingTime <= 0) {
          fRig.group.visible = false;
          continue;
        }
        fRig.group.visible = true;
        fRig.group.position.set(pool.x, 0, pool.z);
        const fade = Math.min(1, pool.remainingTime / 1.25);
        const pulse = 1 + Math.sin(ambientTime * 5.2 + i * 1.3) * 0.045 * ambientScale;
        fRig.group.scale.setScalar(pool.radius * pulse);
        fRig.outerRing.rotation.z -= ambientDt * 1.8;
        fRig.ringMat.opacity = (0.68 + Math.sin(ambientTime * 6.0 + i) * 0.14 * ambientScale) * fade;
        fRig.discMat.opacity = (0.2 + Math.sin(ambientTime * 4.2 + i) * 0.06 * ambientScale) * fade;
      }
    }

    // v1.9.0: Update Tactical Waypoint 3D Ground Beacon
    if (this.waypointBeaconRig) {
      const wp = world.exploration?.tacticalWaypoint ?? null;
      if (!wp) {
        this.waypointBeaconRig.group.visible = false;
      } else {
        this.waypointBeaconRig.group.visible = true;
        this.waypointBeaconRig.group.position.set(wp.x, 0, wp.z);
        const pulse = 1 + Math.sin(ambientTime * 4.5) * 0.1 * ambientScale;
        this.waypointBeaconRig.ringMesh.scale.setScalar(pulse);
        this.waypointBeaconRig.ringMat.opacity =
          0.72 + Math.sin(ambientTime * 5.0) * 0.18 * ambientScale;
        this.waypointBeaconRig.columnMat.opacity =
          0.2 + Math.sin(ambientTime * 3.8) * 0.07 * ambientScale;
        this.waypointBeaconRig.diamondMesh.rotation.y += ambientDt * 2.6;
        this.waypointBeaconRig.diamondMesh.position.y =
          1.65 + Math.sin(ambientTime * 3.2) * 0.14 * ambientScale;
      }
    }
  }

  public updateAndRender(
    world: WorldState,
    aimYaw: number,
    aimPitch: number,
    dt: number,
    shouldRender = true
  ): void {
    if ((this.hitstopTimer ?? 0) > 0) {
      this.hitstopTimer = Math.max(0, (this.hitstopTimer ?? 0) - dt);
    }
    const animDt = (this.hitstopTimer ?? 0) > 0 && !this.reducedMotion ? dt * 0.08 : dt;
    const poseAlpha = 1 - Math.exp(-26 * animDt);
    this.updateEnvironmentPresentation(world, animDt);

    if ((this.railBeamTimer ?? 0) > 0 && this.railBeamMesh && this.railBeamMat) {
      this.railBeamTimer = Math.max(0, (this.railBeamTimer ?? 0) - dt);
      const ratio = this.railBeamTimer / 0.16;
      this.railBeamMat.opacity = Math.max(0, Math.min(0.92, ratio * 0.85));
      const beamScale = 0.4 + ratio * 0.8;
      this.railBeamMesh.scale.x = beamScale;
      this.railBeamMesh.scale.y = beamScale;
      if (this.railBeamTimer <= 0) {
        this.railBeamMesh.visible = false;
      }
    }

    // Update Relay Departure/Arrival VFX Columns & Impact Shockwave Ring
    if (this.relayVfxTimer > 0) {
      this.relayVfxTimer = Math.max(0, this.relayVfxTimer - dt);
      const rRatio = this.relayVfxTimer / 0.32;
      this.relayOriginPillarMat.opacity = rRatio * 0.62;
      this.relayOriginPillarMesh.scale.set(1.4 - rRatio * 0.4, 1, 1.4 - rRatio * 0.4);
      this.relayArrivalPillarMat.opacity = rRatio * 0.78;
      this.relayArrivalPillarMesh.scale.set(0.6 + (1 - rRatio) * 0.7, 1, 0.6 + (1 - rRatio) * 0.7);
      if (this.relayVfxTimer <= 0) {
        this.relayOriginPillarMesh.visible = false;
        this.relayArrivalPillarMesh.visible = false;
      }
    }

    if (this.impactRingTimer > 0) {
      this.impactRingTimer = Math.max(0, this.impactRingTimer - dt);
      const progress = 1 - this.impactRingTimer / this.impactRingDuration;
      this.impactRingMesh.scale.setScalar(0.55 + progress * 2.25);
      this.impactRingMat.opacity = Math.max(0, (1 - progress) * 0.85);
      this.impactRingMesh.rotation.z += dt * 3.5;
      if (this.impactRingTimer <= 0) {
        this.impactRingMesh.visible = false;
      }
    }

    // =========================================================================
    // 1. SERA VENN ARTICULATED RIG & LAYERED PROCEDURAL MOTION
    // =========================================================================
    const p = world.player;
    this.playerRig.root.position.set(p.x, 0, p.z);
    this.playerRig.root.rotation.y = p.rotationY;
    this.playerRig.bodyGroup.scale.set(p.squashX, p.squashY, p.squashX);

    // Compute smooth angular turn velocity & world-to-local acceleration lean
    let rotDiff = p.rotationY - this.prevPlayerRotY;
    while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
    while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
    this.prevPlayerRotY = p.rotationY;
    const rawTurnRate = dt > 0.0001 ? rotDiff / dt : 0;
    this.smoothedPlayerTurnRate +=
      (rawTurnRate - this.smoothedPlayerTurnRate) * Math.min(1, dt * 14);

    const dvx = dt > 0.0001 ? (p.vx - this.prevPlayerVx) / dt : 0;
    const dvz = dt > 0.0001 ? (p.vz - this.prevPlayerVz) / dt : 0;
    this.prevPlayerVx = p.vx;
    this.prevPlayerVz = p.vz;

    const sinRot = Math.sin(p.rotationY);
    const cosRot = Math.cos(p.rotationY);
    const rawFwdAccel = THREE.MathUtils.clamp((dvx * sinRot + dvz * cosRot) * 0.012, -0.22, 0.22);
    const rawSideAccel = THREE.MathUtils.clamp((dvx * cosRot - dvz * sinRot) * 0.012, -0.18, 0.18);
    this.smoothedFwdAccel += (rawFwdAccel - this.smoothedFwdAccel) * Math.min(1, dt * 10);
    this.smoothedSideAccel += (rawSideAccel - this.smoothedSideAccel) * Math.min(1, dt * 10);

    // Rotate Dorsal Chrono Rig harmonic rings & drive Adrenaline Overdrive ground halo
    const auraSpec = computeChronoAuraVisuals({
      adrenalineScore: p.adrenalineScore ?? 0,
      riposteActive: (p.riposteTimer ?? 0) > 0,
      chronoSlipActive: (p.chronoSlipTimer ?? 0) > 0,
      kineticSurgeActive: (p.surgeTimer ?? 0) > 0,
      isRecording: world.echo?.state === 'recording',
      reducedMotion: this.reducedMotion,
      timeSec: world.elapsedTime ?? 0,
    });
    this.playerRig.chronoRingMesh.rotation.z += dt * 0.92 * auraSpec.spinMultiplier;
    this.playerRig.chronoInnerRingMesh.rotation.z -= dt * 1.55 * auraSpec.spinMultiplier;
    if (this.playerRig.chronoAccentMaterial) {
      this.playerRig.chronoAccentMaterial.color?.setHex?.(auraSpec.ringHex);
      this.playerRig.chronoAccentMaterial.emissive?.setHex?.(auraSpec.ringHex);
      this.playerRig.chronoAccentMaterial.emissiveIntensity = auraSpec.emissiveIntensity;
    }
    if (this.playerRig.chronoAuraMesh && this.playerRig.chronoAuraMaterial) {
      const showGroundAura =
        this.screenEffectsEnabled !== false && auraSpec.groundAuraOpacity > 0.01;
      this.playerRig.chronoAuraMesh.visible = showGroundAura;
      if (showGroundAura) {
        this.playerRig.chronoAuraMaterial.color.setHex(auraSpec.ringHex);
        this.playerRig.chronoAuraMaterial.opacity = auraSpec.groundAuraOpacity;
        this.playerRig.chronoAuraMesh.scale.setScalar(auraSpec.groundAuraScale);
        if (!this.reducedMotion) {
          this.playerRig.chronoAuraMesh.rotation.z -= dt * 1.15 * auraSpec.spinMultiplier;
        }
      }
    }

    // Velocity-proportional locomotion stride, knee bend, ankle planting & pelvis weight shift
    const moveSpeed = Math.hypot(p.vx, p.vz);
    const speedRatio = Math.min(1, moveSpeed / Math.max(0.1, GAME_CONFIG.player.moveSpeed));
    const isMoving =
      (p.actionState === 'moving' || p.actionState === 'charging_heavy') &&
      speedRatio > 0.03;
    const phase = p.gaitPhase * 2.25;
    const strideAmp = isMoving ? 0.18 + 0.52 * speedRatio : 0;
    const swing = isMoving ? Math.sin(phase) * strideAmp : 0;
    const cosPhase = Math.cos(phase);

    const idleBreath = Math.sin(world.elapsedTime * 2.5);
    const idleSway = Math.cos(world.elapsedTime * 1.35);

    // Target leg, shin & ankle pivots (preventing foot sliding during contact & push-off)
    let targetLeftLegX = swing;
    let targetRightLegX = -swing;
    let targetLeftLegZ = isMoving ? -0.035 * speedRatio : -0.028;
    let targetRightLegZ = isMoving ? 0.035 * speedRatio : 0.028;
    let targetLeftShinX = isMoving
      ? Math.max(0.05, -Math.sin(phase + 0.55)) * (0.38 + 0.46 * speedRatio)
      : 0.08 + idleBreath * 0.015;
    let targetRightShinX = isMoving
      ? Math.max(0.05, Math.sin(phase + 0.55)) * (0.38 + 0.46 * speedRatio)
      : 0.08 - idleBreath * 0.015;
    let targetLeftFootX = isMoving
      ? -targetLeftLegX * 0.45 - targetLeftShinX * 0.35 + cosPhase * 0.16 * speedRatio
      : -0.04;
    let targetRightFootX = isMoving
      ? -targetRightLegX * 0.45 - targetRightShinX * 0.35 - cosPhase * 0.16 * speedRatio
      : -0.04;

    // Pelvis weight transfer & hip counter-rotation
    let targetPelvisX = isMoving ? 0.04 * speedRatio : -idleBreath * 0.012;
    let targetPelvisY = isMoving ? swing * 0.24 : -idleSway * 0.032;
    let targetPelvisZ = isMoving ? -cosPhase * 0.055 * speedRatio : idleSway * 0.016;

    // Body group bounce, pitch & turn banking
    let targetBodyY = isMoving
      ? Math.abs(Math.sin(phase)) * 0.084 * speedRatio
      : idleBreath * 0.016;
    let targetBodyRotX = isMoving
      ? 0.07 * speedRatio + this.smoothedFwdAccel * 0.45
      : this.smoothedFwdAccel * 0.35;
    const turnBank = isMoving
      ? THREE.MathUtils.clamp(-this.smoothedPlayerTurnRate * 0.035 * speedRatio, -0.16, 0.16)
      : idleSway * 0.012;
    let targetBodyRotZ = turnBank - this.smoothedSideAccel * 0.35;

    // Torso baseline before combat state overrides
    let targetTorsoY = 1.02 + (isMoving ? 0 : idleBreath * 0.01);
    let targetTorsoRotX = isMoving ? 0.14 * speedRatio : idleBreath * 0.024;
    let targetTorsoRotY = isMoving ? -swing * 0.38 : idleSway * 0.048;
    let targetTorsoRotZ = isMoving ? swing * 0.085 : -idleSway * 0.018;

    // Default arm, forearm & weapon wrist pose
    let targetRightArmX = -0.22 + swing * 0.46;
    let targetRightArmY = 0.16 + (isMoving ? 0 : idleSway * 0.045);
    let targetRightArmZ = 0.06;
    let targetRightForearmX = -0.32 + (isMoving ? Math.abs(swing) * 0.15 : idleBreath * 0.035);

    let targetLeftArmX = -0.12 - swing * 0.48;
    let targetLeftArmY = -0.08;
    let targetLeftArmZ = -0.06;
    let targetLeftForearmX = -0.26 - (isMoving ? Math.abs(swing) * 0.13 : -idleBreath * 0.025);

    let targetWeaponRotX = isMoving ? 0.06 * speedRatio : idleSway * 0.03;
    let targetWeaponRotY = 0;
    let targetWeaponRotZ = 0;

    // Reset transient VFX meshes
    this.playerRig.slashArcMaterial.opacity = 0;
    this.playerRig.parryShieldMaterial.opacity = 0;
    this.playerRig.chargeRingMaterial.opacity = 0;
    this.playerRig.slashArcMesh.rotation.z = 0;
    this.playerRig.slashArcPivot.rotation.set(0, 0, 0);

    const isPulsecaster =
      p.equippedWeaponId === 'pulsecaster' || p.equippedWeaponId === 'phase_rail';
    const isPhaseRail = p.equippedWeaponId === 'phase_rail';
    const isGravBreaker = p.equippedWeaponId === 'grav_breaker';

    // Visually distinguish active weapon on Sera's rig across all 4 Arsenal weapons
    this.playerRig.bladeMesh.visible =
      p.equippedWeaponId === 'chrono_edge' || p.equippedWeaponId === 'pulsecaster';
    if (this.playerRig.phaseRailGroup) {
      this.playerRig.phaseRailGroup.visible = isPhaseRail;
    }
    if (this.playerRig.gravBreakerGroup) {
      this.playerRig.gravBreakerGroup.visible = isGravBreaker;
    }

    const adrTier = Math.min(5, Math.max(0, Math.floor(p.adrenalineScore ?? 0)));
    const adrGlowBoost = adrTier * 0.14;

    if (this.playerRig.chronoAccentMaterial) {
      this.playerRig.chronoAccentMaterial.emissive.setHex(
        adrTier >= 5 ? 0xfbbf24 : adrTier >= 3 ? 0x38bdf8 : 0x22d3ee
      );
      this.playerRig.chronoAccentMaterial.emissiveIntensity = 1.2 + adrTier * 0.24;
    }
    if (isPhaseRail && this.playerRig.phaseRailCoils) {
      const coilSpin = p.actionState === 'charging_heavy' ? 8.5 : 2.1 + adrTier * 0.4;
      for (let c = 0; c < this.playerRig.phaseRailCoils.length; c++) {
        this.playerRig.phaseRailCoils[c].rotation.z += dt * coilSpin * (c % 2 === 0 ? 1 : -1);
      }
    }
    if (isGravBreaker && this.playerRig.gravBreakerOrbs) {
      const chargeScale = p.actionState === 'charging_heavy' ? 1.28 : 1 + Math.sin(world.elapsedTime * 6) * 0.08;
      for (let g = 0; g < this.playerRig.gravBreakerOrbs.length; g++) {
        const orb = this.playerRig.gravBreakerOrbs[g];
        orb.rotation.y += dt * (g === 0 ? 2.6 : -3.4);
        orb.rotation.x += dt * (g === 1 ? 1.8 : 0.9);
        if (g === this.playerRig.gravBreakerOrbs.length - 1) {
          orb.scale.setScalar(chargeScale);
        }
      }
    }

    if (isPulsecaster) {
      this.playerRig.bladeMesh.scale.set(0.72, 0.72, 0.28);
      this.playerRig.bladeMaterial.emissiveIntensity = 0.42 + adrGlowBoost * 0.4;
      if (p.weaponOverheated) {
        this.playerRig.pulsecasterMaterial.color.setHex(0xfca5a5);
        this.playerRig.pulsecasterMaterial.emissive.setHex(0xef4444);
        this.playerRig.pulsecasterMaterial.emissiveIntensity = 2.4;
      } else if (p.actionState === 'charging_heavy' || p.actionState.startsWith('heavy_')) {
        this.playerRig.pulsecasterMaterial.color.setHex(0xfde68a);
        this.playerRig.pulsecasterMaterial.emissive.setHex(0xf59e0b);
        this.playerRig.pulsecasterMaterial.emissiveIntensity = 2.5 + adrGlowBoost * 0.5;
      } else {
        this.playerRig.pulsecasterMaterial.color.setHex(0xe0f2fe);
        this.playerRig.pulsecasterMaterial.emissive.setHex(adrTier >= 4 ? 0xfbbf24 : 0x38bdf8);
        this.playerRig.pulsecasterMaterial.emissiveIntensity = 2.15 + adrGlowBoost * 0.6;
      }
      // Ready the left-forearm projector or right-hand Rail Lance forward in neutral/moving states
      targetLeftArmX = -0.58 - swing * 0.18;
      targetLeftArmY = 0.16;
      targetLeftArmZ = -0.14;
      targetLeftForearmX = -0.44;
      targetRightArmX = isPhaseRail ? -0.52 + swing * 0.16 : 0.18 + swing * 0.24;
      targetRightArmY = isPhaseRail ? -0.08 : -0.12;
      targetRightArmZ = 0.14;
      targetRightForearmX = -0.48;
    } else {
      this.playerRig.bladeMesh.scale.set(1, 1, 1);
      this.playerRig.bladeMaterial.emissiveIntensity = 1.72 + adrGlowBoost;
      this.playerRig.pulsecasterMaterial.color.setHex(0x67e8f9);
      this.playerRig.pulsecasterMaterial.emissive.setHex(0x06b6d4);
      this.playerRig.pulsecasterMaterial.emissiveIntensity = 0.85 + adrGlowBoost * 0.5;
    }

    if (p.hurtFlashTimer > 0) {
      this.playerRig.bladeMaterial.emissive.setHex(0xef4444);
    } else if ((p.riposteTimer ?? 0) > 0) {
      this.playerRig.bladeMaterial.emissive.setHex(0xfbbf24);
      this.playerRig.bladeMaterial.emissiveIntensity = 2.35 + adrGlowBoost * 0.4;
      if (isPulsecaster) {
        this.playerRig.pulsecasterMaterial.emissive.setHex(0xfbbf24);
        this.playerRig.pulsecasterMaterial.emissiveIntensity = 2.6 + adrGlowBoost * 0.4;
      }
    } else if ((p.chronoSlipTimer ?? 0) > 0) {
      this.playerRig.bladeMaterial.emissive.setHex(0x67e8f9);
      this.playerRig.bladeMaterial.emissiveIntensity = 2.45 + adrGlowBoost * 0.4;
      if (isPulsecaster) {
        this.playerRig.pulsecasterMaterial.emissive.setHex(0x67e8f9);
        this.playerRig.pulsecasterMaterial.emissiveIntensity = 2.65 + adrGlowBoost * 0.4;
      }
    } else if ((p.relayMomentumTimer ?? 0) > 0) {
      this.playerRig.bladeMaterial.emissive.setHex(0x38bdf8);
      this.playerRig.bladeMaterial.emissiveIntensity = 2.15 + adrGlowBoost * 0.4;
    } else if (
      isGravBreaker ||
      p.actionState === 'charging_heavy' ||
      p.actionState.startsWith('heavy_')
    ) {
      this.playerRig.bladeMaterial.emissive.setHex(0xf59e0b);
    } else {
      this.playerRig.bladeMaterial.emissive.setHex(
        adrTier >= 5 ? 0xfbbf24 : adrTier >= 3 ? 0x38bdf8 : 0x06b6d4
      );
    }

    switch (p.actionState) {
      case 'charging_heavy': {
        const threshold = isPhaseRail
          ? GAME_CONFIG.weapons.phase_rail.heavyShot.chargeThreshold
          : p.equippedWeaponId === 'pulsecaster'
            ? GAME_CONFIG.weapons.pulsecaster.heavyShot.chargeThreshold
            : isGravBreaker
              ? GAME_CONFIG.weapons.grav_breaker.heavySlam.chargeThreshold
              : GAME_CONFIG.player.heavyAttack.chargeThreshold;
        const ratio = Math.min(1, p.chargeTime / Math.max(0.01, threshold));
        if (isPulsecaster) {
          targetBodyY = -0.04 * ratio;
          targetBodyRotX = 0.06 * ratio;
          targetPelvisY = 0.24 + ratio * 0.12;
          targetTorsoRotX = 0.08 * ratio;
          targetTorsoRotY = 0.36 + ratio * 0.14;
          targetTorsoRotZ = -0.06;
          targetLeftArmX = -1.28 - ratio * 0.14;
          targetLeftArmY = -0.18;
          targetLeftArmZ = -0.08;
          targetLeftForearmX = -0.18;
          targetRightArmX = 0.28;
          targetRightArmY = -0.24;
          targetRightArmZ = 0.22;
        } else {
          targetBodyY = -0.05 * ratio;
          targetBodyRotX = -0.06 * ratio;
          targetPelvisY = -0.28 - ratio * 0.18;
          targetTorsoRotX = -0.22 - ratio * 0.18;
          targetTorsoRotY = -0.52 - ratio * 0.28;
          targetTorsoRotZ = 0.12;
          targetRightArmX = -1.18 - ratio * 0.52;
          targetRightArmY = -0.68;
          targetRightArmZ = 0.48;
          targetRightForearmX = -0.64 - ratio * 0.24;
          targetWeaponRotX = -0.26 * ratio;
          targetLeftArmX = -0.58;
          targetLeftArmY = 0.44;
          targetLeftArmZ = -0.32;
          targetLeftForearmX = -0.46;
        }

        this.playerRig.chargeRingMaterial.opacity = 0.42 + ratio * 0.54;
        this.playerRig.chargeRingMaterial.color.setHex(
          ratio >= 1 ? 0x22d3ee : 0xf59e0b
        );
        const ringScale = 0.72 + ratio * 0.58;
        this.playerRig.chargeRingMesh.scale.setScalar(ringScale);
        this.playerRig.chargeRingMesh.rotation.z += dt * (2.5 + ratio * 4.0);
        break;
      }
      case 'light_windup': {
        if (isPulsecaster) {
          targetBodyRotX = 0.06;
          targetTorsoRotY = 0.34;
          targetLeftArmX = -1.32;
          targetLeftArmY = -0.18;
          targetLeftArmZ = -0.08;
          targetLeftForearmX = -0.16;
          break;
        }
        targetBodyRotX = 0.08;
        if (p.comboIndex === 0) {
          // Strike 1 windup: right shoulder coils back for high-to-low diagonal cleave
          targetPelvisY = -0.22;
          targetTorsoRotX = -0.08;
          targetTorsoRotY = -0.52;
          targetTorsoRotZ = 0.08;
          targetRightArmX = -0.64;
          targetRightArmY = -0.86;
          targetRightArmZ = 0.44;
          targetRightForearmX = -0.54;
          targetWeaponRotX = -0.18;
          targetLeftArmX = -0.32;
          targetLeftArmY = 0.28;
          targetLeftArmZ = -0.24;
        } else if (p.comboIndex === 1) {
          // Strike 2 windup: coiled across chest for low-to-high backhand cross-slash
          targetPelvisY = 0.24;
          targetTorsoRotX = -0.05;
          targetTorsoRotY = 0.54;
          targetTorsoRotZ = -0.09;
          targetRightArmX = -0.48;
          targetRightArmY = 0.88;
          targetRightArmZ = -0.42;
          targetRightForearmX = -0.62;
          targetWeaponRotZ = 0.28;
          targetLeftArmX = 0.22;
          targetLeftArmY = -0.28;
          targetLeftArmZ = -0.34;
        } else {
          // Strike 3 Finisher windup: deep crouched torsion coil before lunging spin cleave
          targetBodyY = -0.08;
          targetPelvisY = -0.38;
          targetLeftLegX = -0.35;
          targetRightLegX = 0.38;
          targetLeftShinX = 0.52;
          targetRightShinX = 0.48;
          targetTorsoRotX = 0.24;
          targetTorsoRotY = -0.78;
          targetTorsoRotZ = 0.18;
          targetRightArmX = -0.98;
          targetRightArmY = -1.04;
          targetRightArmZ = 0.54;
          targetRightForearmX = -0.66;
          targetWeaponRotX = -0.24;
          targetLeftArmX = -0.58;
          targetLeftArmY = 0.48;
          targetLeftArmZ = -0.38;
        }
        break;
      }
      case 'light_active': {
        if (isPulsecaster) {
          targetBodyRotX = -0.06;
          targetTorsoRotY = 0.38;
          targetLeftArmX = -1.48;
          targetLeftArmY = -0.16;
          targetLeftArmZ = -0.06;
          targetLeftForearmX = -0.08;
          break;
        }
        targetBodyRotX = 0.15;
        if (p.comboIndex === 0) {
          // Strike 1 active: crisp right-to-left diagonal slash
          targetPelvisY = 0.24;
          targetTorsoRotX = 0.18;
          targetTorsoRotY = 0.58;
          targetTorsoRotZ = -0.1;
          targetRightArmX = -0.16;
          targetRightArmY = 1.22;
          targetRightArmZ = -0.42;
          targetRightForearmX = -0.12;
          targetWeaponRotX = 0.22;
          targetLeftArmX = 0.28;
          targetLeftArmY = -0.34;
          targetLeftArmZ = -0.26;

          this.playerRig.slashArcPivot.rotation.set(0.18, 0, -0.32);
          this.playerRig.slashArcMaterial.color.setHex(
            isGravBreaker ? 0xf59e0b : isPhaseRail ? 0xe0f2fe : 0x22d3ee
          );
          this.playerRig.slashArcMaterial.opacity = 0.84;
          this.playerRig.slashArcMesh.scale.setScalar(isGravBreaker ? 1.18 : 1.04);
          this.playerRig.slashArcMesh.rotation.z = -0.14;
        } else if (p.comboIndex === 1) {
          // Strike 2 active: sweeping left-to-right upward reverse slash
          targetPelvisY = -0.26;
          targetTorsoRotX = 0.14;
          targetTorsoRotY = -0.62;
          targetTorsoRotZ = 0.11;
          targetRightArmX = -0.1;
          targetRightArmY = -1.24;
          targetRightArmZ = 0.46;
          targetRightForearmX = -0.1;
          targetWeaponRotX = 0.18;
          targetWeaponRotZ = -0.24;
          targetLeftArmX = -0.36;
          targetLeftArmY = 0.38;
          targetLeftArmZ = -0.22;

          this.playerRig.slashArcPivot.rotation.set(-0.16, 0, 0.34);
          this.playerRig.slashArcMaterial.color.setHex(
            isGravBreaker ? 0xfbbf24 : isPhaseRail ? 0xe0f2fe : 0x38bdf8
          );
          this.playerRig.slashArcMaterial.opacity = 0.88;
          const arcScale2 = isGravBreaker ? 1.22 : 1.08;
          this.playerRig.slashArcMesh.scale.set(-arcScale2, arcScale2, arcScale2);
          this.playerRig.slashArcMesh.rotation.z = 0.16;
        } else {
          // Strike 3 Finisher active: high-commitment lunging horizontal vortex cleave
          targetBodyY = -0.04;
          targetBodyRotX = 0.24;
          targetPelvisY = 0.42;
          targetLeftLegX = 0.42;
          targetRightLegX = -0.46;
          targetLeftShinX = 0.45;
          targetRightShinX = 0.22;
          targetTorsoRotX = 0.32;
          targetTorsoRotY = 0.88;
          targetTorsoRotZ = -0.18;
          targetRightArmX = 0.22;
          targetRightArmY = 1.44;
          targetRightArmZ = -0.58;
          targetRightForearmX = -0.06;
          targetWeaponRotX = 0.32;
          targetLeftArmX = 0.44;
          targetLeftArmY = -0.54;
          targetLeftArmZ = -0.38;

          this.playerRig.slashArcPivot.rotation.set(0.06, 0.12, -0.1);
          this.playerRig.slashArcMaterial.color.setHex(
            isGravBreaker ? 0xfde68a : 0xe0f2fe
          );
          this.playerRig.slashArcMaterial.opacity = 0.96;
          this.playerRig.slashArcMesh.scale.setScalar(isGravBreaker ? 1.46 : 1.32);
          this.playerRig.slashArcMesh.rotation.z = -0.26;
        }
        break;
      }
      case 'light_recovery': {
        if (isPulsecaster) {
          targetTorsoRotY = 0.26;
          targetLeftArmX = -1.16;
          targetLeftArmY = -0.12;
          targetLeftForearmX = -0.26;
          break;
        }
        const recDur = Math.max(
          0.01,
          GAME_CONFIG.player.lightAttack.recovery[p.comboIndex] ?? 0.18
        );
        const recAlpha = Math.max(0, Math.min(1, p.stateTimer / recDur));
        const dir = p.comboIndex === 1 ? -1 : 1;
        const isFinisher = p.comboIndex >= 2;
        targetBodyRotX = (isFinisher ? 0.16 : 0.1) * recAlpha;
        targetPelvisY = dir * (isFinisher ? 0.28 : 0.16) * recAlpha;
        targetTorsoRotX = (isFinisher ? 0.22 : 0.14) * recAlpha;
        targetTorsoRotY = dir * (isFinisher ? 0.64 : 0.46) * recAlpha;
        targetTorsoRotZ = -dir * 0.08 * recAlpha;
        targetRightArmX = -0.16 + (1 - recAlpha) * -0.06;
        targetRightArmY = dir * ((isFinisher ? 1.12 : 0.92) * recAlpha + 0.14 * (1 - recAlpha));
        targetRightArmZ = -dir * 0.32 * recAlpha;
        targetRightForearmX = -0.16 - (1 - recAlpha) * 0.14;
        targetWeaponRotX = 0.16 * recAlpha;
        targetLeftArmX = 0.22 * recAlpha;
        targetLeftArmY = -0.24 * recAlpha;
        targetLeftArmZ = -0.2;

        this.playerRig.slashArcPivot.rotation.set(
          p.comboIndex === 1 ? -0.16 : 0.14,
          0,
          p.comboIndex === 1 ? 0.34 : -0.26
        );
        this.playerRig.slashArcMaterial.opacity = 0.32 * recAlpha;
        break;
      }
      case 'heavy_windup': {
        if (isPulsecaster) {
          targetBodyY = -0.05;
          targetTorsoRotY = 0.44;
          targetLeftArmX = -1.38;
          targetLeftArmY = -0.22;
          targetLeftForearmX = -0.14;
          break;
        }
        targetBodyY = -0.07;
        targetBodyRotX = -0.1;
        targetPelvisY = -0.36;
        targetLeftLegX = -0.28;
        targetRightLegX = 0.32;
        targetLeftShinX = 0.42;
        targetRightShinX = 0.46;
        targetTorsoRotX = -0.32;
        targetTorsoRotY = -0.72;
        targetTorsoRotZ = 0.16;
        targetRightArmX = -1.42;
        targetRightArmY = -0.98;
        targetRightArmZ = 0.56;
        targetRightForearmX = -0.68;
        targetWeaponRotX = -0.32;
        targetLeftArmX = -0.64;
        targetLeftArmY = 0.48;
        targetLeftArmZ = -0.36;
        targetLeftForearmX = -0.52;
        break;
      }
      case 'heavy_active': {
        if (isPulsecaster) {
          targetBodyRotX = -0.12;
          targetTorsoRotY = 0.42;
          targetLeftArmX = -1.58;
          targetLeftArmY = -0.18;
          targetLeftForearmX = -0.06;
          break;
        }
        targetBodyY = -0.06;
        targetBodyRotX = 0.28;
        targetPelvisY = 0.44;
        targetLeftLegX = 0.48;
        targetRightLegX = -0.44;
        targetLeftShinX = 0.52;
        targetRightShinX = 0.24;
        targetTorsoRotX = 0.38;
        targetTorsoRotY = 0.82;
        targetTorsoRotZ = -0.2;
        targetRightArmX = 0.36;
        targetRightArmY = 1.46;
        targetRightArmZ = -0.72;
        targetRightForearmX = -0.06;
        targetWeaponRotX = 0.38;
        targetLeftArmX = 0.48;
        targetLeftArmY = -0.52;
        targetLeftArmZ = -0.38;

        this.playerRig.slashArcPivot.rotation.set(0.42, 0.15, -0.68);
        this.playerRig.slashArcMaterial.color.setHex(
          isGravBreaker
            ? 0xfbbf24
            : isPhaseRail
              ? 0xe0f2fe
              : p.isEmpoweredHeavy
                ? 0xf59e0b
                : 0x38bdf8
        );
        this.playerRig.slashArcMaterial.opacity = 0.96;
        this.playerRig.slashArcMesh.scale.setScalar(isGravBreaker ? 1.52 : 1.38);
        break;
      }
      case 'heavy_recovery': {
        if (isPulsecaster) {
          targetTorsoRotY = 0.28;
          targetLeftArmX = -1.12;
          targetLeftArmY = -0.12;
          targetLeftForearmX = -0.24;
          break;
        }
        const recDur = Math.max(0.01, GAME_CONFIG.player.heavyAttack.recovery);
        const recAlpha = Math.max(0, Math.min(1, p.stateTimer / recDur));
        targetBodyY = -0.05 * recAlpha;
        targetBodyRotX = 0.22 * recAlpha;
        targetPelvisY = 0.32 * recAlpha;
        targetTorsoRotX = 0.3 * recAlpha;
        targetTorsoRotY = 0.64 * recAlpha;
        targetTorsoRotZ = -0.15 * recAlpha;
        targetRightArmX = 0.22 * recAlpha - 0.22 * (1 - recAlpha);
        targetRightArmY = 1.16 * recAlpha + 0.16 * (1 - recAlpha);
        targetRightArmZ = -0.52 * recAlpha;
        targetRightForearmX = -0.12 - 0.18 * (1 - recAlpha);
        targetWeaponRotX = 0.28 * recAlpha;
        targetLeftArmX = 0.34 * recAlpha;
        targetLeftArmY = -0.34 * recAlpha;
        targetLeftArmZ = -0.28;

        this.playerRig.slashArcPivot.rotation.set(0.42, 0.15, -0.68);
        this.playerRig.slashArcMaterial.opacity = 0.38 * recAlpha;
        break;
      }
      case 'parry_active':
      case 'parry_recovery': {
        const isActiveParry = p.actionState === 'parry_active';
        targetBodyY = -0.03;
        targetBodyRotX = -0.05;
        targetPelvisY = 0.18;
        targetLeftLegX = 0.22;
        targetRightLegX = -0.24;
        targetLeftShinX = 0.32;
        targetRightShinX = 0.34;
        targetTorsoRotX = 0.08;
        targetTorsoRotY = 0.28;
        targetTorsoRotZ = -0.06;
        targetRightArmX = -0.82;
        targetRightArmY = 0.58;
        targetRightArmZ = 0.72;
        targetRightForearmX = -0.74;
        targetWeaponRotZ = 0.35;
        targetLeftArmX = -0.74;
        targetLeftArmY = -0.42;
        targetLeftArmZ = -0.36;
        targetLeftForearmX = -0.48;
        this.playerRig.parryShieldMaterial.opacity = isActiveParry ? 0.78 : 0.24;
        break;
      }
      case 'dodging': {
        if (this.dashGhostSpawnCooldown <= 0 && world.appState === 'playing') {
          this.spawnDashGhost(p.x, p.z, p.rotationY, 0x22d3ee);
          this.dashGhostSpawnCooldown = 0.042;
        }
        targetBodyY = -0.14;
        targetBodyRotX = 0.48;
        targetBodyRotZ = turnBank * 1.45;
        targetPelvisX = 0.16;
        targetLeftLegX = -0.45;
        targetRightLegX = 0.32;
        targetLeftShinX = 0.68;
        targetRightShinX = 0.54;
        targetTorsoRotX = 0.28;
        targetTorsoRotY = 0;
        targetTorsoRotZ = 0;
        targetRightArmX = 0.42;
        targetRightArmY = -0.26;
        targetRightArmZ = 0.22;
        targetRightForearmX = -0.48;
        targetLeftArmX = 0.38;
        targetLeftArmY = 0.26;
        targetLeftArmZ = -0.22;
        targetLeftForearmX = -0.44;
        break;
      }
      case 'dead': {
        targetBodyRotX = -Math.PI * 0.42;
        targetBodyY = 0.25;
        targetTorsoRotX = 0;
        targetTorsoRotY = 0;
        targetTorsoRotZ = 0;
        break;
      }
      default:
        break;
    }

    // Apply upper-body recoil jolt when damaged (hurtFlashTimer > 0)
    if (p.hurtFlashTimer > 0 && p.actionState !== 'dead') {
      const hurtRatio = Math.min(1, p.hurtFlashTimer / 0.22);
      targetTorsoRotX -= 0.32 * hurtRatio;
      targetTorsoRotZ += 0.18 * hurtRatio;
    }

    // Smoothly damp all Sera joints toward target pose
    this.playerRig.bodyGroup.position.y +=
      (targetBodyY - this.playerRig.bodyGroup.position.y) * poseAlpha;
    this.playerRig.bodyGroup.rotation.x +=
      (targetBodyRotX - this.playerRig.bodyGroup.rotation.x) * poseAlpha;
    this.playerRig.bodyGroup.rotation.z +=
      (targetBodyRotZ - this.playerRig.bodyGroup.rotation.z) * poseAlpha;

    dampEuler(
      this.playerRig.pelvisPivot.rotation,
      targetPelvisX,
      targetPelvisY,
      targetPelvisZ,
      poseAlpha
    );

    this.playerRig.torsoPivot.position.y +=
      (targetTorsoY - this.playerRig.torsoPivot.position.y) * poseAlpha;
    dampEuler(
      this.playerRig.torsoPivot.rotation,
      targetTorsoRotX,
      targetTorsoRotY,
      targetTorsoRotZ,
      poseAlpha
    );

    // Secondary motion on dorsal Chrono Rig & segmented shoulder pauldrons
    const rigLagAlpha = 1 - Math.exp(-14 * dt);
    const targetRigPitch =
      -targetTorsoRotX * 0.35 + (isMoving ? Math.abs(Math.cos(phase)) * 0.06 * speedRatio : idleBreath * 0.02);
    const targetRigYaw = -targetTorsoRotY * 0.28 - this.smoothedPlayerTurnRate * 0.015;
    const targetRigRoll = -targetBodyRotZ * 0.4;
    dampEuler(
      this.playerRig.chronoRigPivot.rotation,
      targetRigPitch,
      targetRigYaw,
      targetRigRoll,
      rigLagAlpha
    );

    this.playerRig.leftPauldronPivot.rotation.z =
      0.22 + Math.max(0, -targetLeftArmX * 0.18) + idleBreath * 0.025;
    this.playerRig.rightPauldronPivot.rotation.z =
      -0.22 - Math.max(0, -targetRightArmX * 0.18) - idleBreath * 0.025;

    // Head stabilization & target look counter-rotation
    dampEuler(
      this.playerRig.headGroup.rotation,
      isMoving ? -0.06 * speedRatio : idleBreath * 0.028,
      -this.playerRig.torsoPivot.rotation.y * 0.48,
      -this.playerRig.bodyGroup.rotation.z * 0.35,
      poseAlpha
    );

    // Arms, Forearms & Chrono Edge wrist pivot
    dampEuler(
      this.playerRig.rightArmPivot.rotation,
      targetRightArmX,
      targetRightArmY,
      targetRightArmZ,
      poseAlpha
    );
    this.playerRig.rightForearmPivot.rotation.x +=
      (targetRightForearmX - this.playerRig.rightForearmPivot.rotation.x) * poseAlpha;
    dampEuler(
      this.playerRig.weaponPivot.rotation,
      targetWeaponRotX,
      targetWeaponRotY,
      targetWeaponRotZ,
      poseAlpha
    );

    dampEuler(
      this.playerRig.leftArmPivot.rotation,
      targetLeftArmX,
      targetLeftArmY,
      targetLeftArmZ,
      poseAlpha
    );
    this.playerRig.leftForearmPivot.rotation.x +=
      (targetLeftForearmX - this.playerRig.leftForearmPivot.rotation.x) * poseAlpha;

    // Legs, Shins & Feet
    this.playerRig.leftLegPivot.rotation.x +=
      (targetLeftLegX - this.playerRig.leftLegPivot.rotation.x) * poseAlpha;
    this.playerRig.leftLegPivot.rotation.z +=
      (targetLeftLegZ - this.playerRig.leftLegPivot.rotation.z) * poseAlpha;
    this.playerRig.rightLegPivot.rotation.x +=
      (targetRightLegX - this.playerRig.rightLegPivot.rotation.x) * poseAlpha;
    this.playerRig.rightLegPivot.rotation.z +=
      (targetRightLegZ - this.playerRig.rightLegPivot.rotation.z) * poseAlpha;

    this.playerRig.leftShinPivot.rotation.x +=
      (targetLeftShinX - this.playerRig.leftShinPivot.rotation.x) * poseAlpha;
    this.playerRig.rightShinPivot.rotation.x +=
      (targetRightShinX - this.playerRig.rightShinPivot.rotation.x) * poseAlpha;

    this.playerRig.leftFootPivot.rotation.x +=
      (targetLeftFootX - this.playerRig.leftFootPivot.rotation.x) * poseAlpha;
    this.playerRig.rightFootPivot.rotation.x +=
      (targetRightFootX - this.playerRig.rightFootPivot.rotation.x) * poseAlpha;

    // =========================================================================
    // 2. CHRONO ECHO HOLOGRAPHIC RIG & DELAYED AFTERIMAGE TRAIL
    // =========================================================================
    const echo = world.echo;
    if (echo.state === 'playback' && echo.activeActor) {
      const actor = echo.activeActor;
      this.echoRig.root.visible = true;
      this.echoRig.root.position.set(actor.x, 0, actor.z);
      this.echoRig.root.rotation.y = actor.rotationY;

      let echoRotDiff = actor.rotationY - this.prevEchoRotY;
      while (echoRotDiff > Math.PI) echoRotDiff -= Math.PI * 2;
      while (echoRotDiff < -Math.PI) echoRotDiff += Math.PI * 2;
      this.prevEchoRotY = actor.rotationY;
      const rawEchoTurn = dt > 0.0001 ? echoRotDiff / dt : 0;
      this.smoothedEchoTurnRate +=
        (rawEchoTurn - this.smoothedEchoTurnRate) * Math.min(1, dt * 14);

      this.echoRig.chronoRingMesh.rotation.z -= dt * 1.85;
      this.echoRig.chronoInnerRingMesh.rotation.z += dt * 2.6;

      if (this.echoRig.echoInnerWireMesh) {
        this.echoRig.echoInnerWireMesh.rotation.y += dt * 3.1;
        this.echoRig.echoInnerWireMesh.rotation.x -= dt * 1.8;
      }
      if (this.echoRig.echoPhaseRingMesh) {
        const scanCycle = (world.elapsedTime * 1.45) % 1;
        this.echoRig.echoPhaseRingMesh.position.y = 0.22 + scanCycle * 1.55;
        const scanScale = 1 - Math.abs(scanCycle - 0.5) * 0.42;
        this.echoRig.echoPhaseRingMesh.scale.setScalar(scanScale);
      }
      if (this.echoRig.echoSecondPhaseRingMesh) {
        const scanCycle2 = (1 - ((world.elapsedTime * 1.15) % 1));
        this.echoRig.echoSecondPhaseRingMesh.position.y = 0.25 + scanCycle2 * 1.48;
        this.echoRig.echoSecondPhaseRingMesh.rotation.z -= dt * 2.2;
      }
      if (this.echoRig.echoBaseRippleMesh) {
        this.echoRig.echoBaseRippleMesh.rotation.z += dt * 1.8;
        const ripplePulse = 0.92 + Math.sin(world.elapsedTime * 6.5) * 0.1;
        this.echoRig.echoBaseRippleMesh.scale.setScalar(ripplePulse);
        const rippleMat = this.echoRig.echoBaseRippleMesh.material as THREE.MeshBasicMaterial | undefined;
        if (rippleMat) {
          rippleMat.opacity = auraSpec.echoShimmerOpacity;
        }
      }

      const echoMoving =
        actor.actionState === 'moving' || actor.actionState === 'charging_heavy';
      const echoPhase = actor.gaitPhase * 2.25;
      const echoSwing = echoMoving ? Math.sin(echoPhase) * 0.64 : 0;
      const echoCosPhase = Math.cos(echoPhase);

      this.echoRig.leftLegPivot.rotation.x = echoSwing;
      this.echoRig.rightLegPivot.rotation.x = -echoSwing;
      this.echoRig.leftShinPivot.rotation.x = echoMoving
        ? Math.max(0.05, -Math.sin(echoPhase + 0.55)) * 0.72
        : 0.08;
      this.echoRig.rightShinPivot.rotation.x = echoMoving
        ? Math.max(0.05, Math.sin(echoPhase + 0.55)) * 0.72
        : 0.08;
      this.echoRig.leftFootPivot.rotation.x = echoMoving
        ? -echoSwing * 0.42 + echoCosPhase * 0.14
        : -0.04;
      this.echoRig.rightFootPivot.rotation.x = echoMoving
        ? echoSwing * 0.42 - echoCosPhase * 0.14
        : -0.04;

      this.echoRig.pelvisPivot.rotation.set(
        echoMoving ? 0.04 : 0,
        echoMoving ? echoSwing * 0.22 : 0,
        echoMoving ? -echoCosPhase * 0.05 : 0
      );

      this.echoRig.bodyGroup.position.y = echoMoving
        ? Math.abs(Math.sin(echoPhase)) * 0.08
        : Math.sin(world.elapsedTime * 3.4) * 0.024;
      this.echoRig.bodyGroup.rotation.z = echoMoving
        ? THREE.MathUtils.clamp(-this.smoothedEchoTurnRate * 0.032, -0.15, 0.15)
        : 0;

      this.echoRig.torsoPivot.position.y = 1.02;
      this.echoRig.torsoPivot.rotation.set(
        echoMoving ? 0.14 : Math.sin(world.elapsedTime * 2.8) * 0.025,
        echoMoving ? -echoSwing * 0.36 : Math.cos(world.elapsedTime * 1.6) * 0.05,
        echoMoving ? echoSwing * 0.08 : 0
      );
      this.echoRig.chronoRigPivot.rotation.set(
        -this.echoRig.torsoPivot.rotation.x * 0.3,
        -this.echoRig.torsoPivot.rotation.y * 0.25,
        0
      );

      this.echoRig.slashArcMaterial.opacity = 0;
      this.echoRig.parryShieldMaterial.opacity = 0;
      this.echoRig.chargeRingMaterial.opacity = 0;
      this.echoRig.slashArcMesh.rotation.z = 0;
      this.echoRig.slashArcPivot.rotation.set(0, 0, 0);
      this.echoRig.weaponPivot.rotation.set(0, 0, 0);

      const echoPulsecaster =
        actor.weaponId === 'pulsecaster' || actor.weaponId === 'phase_rail';
      const echoPhaseRail = actor.weaponId === 'phase_rail';
      const echoGravBreaker = actor.weaponId === 'grav_breaker';
      this.echoRig.bladeMesh.visible =
        actor.weaponId === 'chrono_edge' || actor.weaponId === 'pulsecaster';
      if (this.echoRig.phaseRailGroup) {
        this.echoRig.phaseRailGroup.visible = echoPhaseRail;
      }
      if (this.echoRig.gravBreakerGroup) {
        this.echoRig.gravBreakerGroup.visible = echoGravBreaker;
      }
      if (echoPulsecaster) {
        this.echoRig.bladeMesh.scale.set(0.72, 0.72, 0.28);
      } else {
        this.echoRig.bladeMesh.scale.set(1, 1, 1);
      }

      switch (actor.actionState) {
        case 'charging_heavy': {
          const ratio = Math.min(1, actor.chargeRatio);
          if (echoPulsecaster) {
            this.echoRig.torsoPivot.rotation.set(0.08 * ratio, 0.36 + ratio * 0.14, -0.06);
            this.echoRig.leftArmPivot.rotation.set(-1.28 - ratio * 0.14, -0.18, -0.08);
            this.echoRig.leftForearmPivot.rotation.set(-0.18, 0, 0);
            this.echoRig.rightArmPivot.rotation.set(0.28, -0.24, 0.22);
          } else {
            this.echoRig.torsoPivot.rotation.set(-0.2 - ratio * 0.16, -0.48 - ratio * 0.28, 0.1);
            this.echoRig.rightArmPivot.rotation.set(-1.12 - ratio * 0.48, -0.66, 0.46);
            this.echoRig.rightForearmPivot.rotation.set(-0.62 - ratio * 0.24, 0, 0);
            this.echoRig.leftArmPivot.rotation.set(-0.54, 0.42, -0.3);
          }
          this.echoRig.chargeRingMaterial.opacity = 0.45 + ratio * 0.5;
          this.echoRig.chargeRingMaterial.color.setHex(0x38bdf8);
          this.echoRig.chargeRingMesh.scale.setScalar(0.72 + ratio * 0.56);
          break;
        }
        case 'light_windup': {
          if (echoPulsecaster) {
            this.echoRig.torsoPivot.rotation.set(0.06, 0.34, 0);
            this.echoRig.leftArmPivot.rotation.set(-1.32, -0.18, -0.08);
            this.echoRig.leftForearmPivot.rotation.set(-0.16, 0, 0);
          } else if (actor.comboIndex === 1) {
            this.echoRig.torsoPivot.rotation.set(-0.04, 0.52, -0.08);
            this.echoRig.rightArmPivot.rotation.set(-0.46, 0.86, -0.4);
            this.echoRig.rightForearmPivot.rotation.set(-0.6, 0, 0);
          } else {
            this.echoRig.torsoPivot.rotation.set(-0.08, -0.52, 0.08);
            this.echoRig.rightArmPivot.rotation.set(-0.62, -0.84, 0.42);
            this.echoRig.rightForearmPivot.rotation.set(-0.52, 0, 0);
          }
          break;
        }
        case 'light_active': {
          if (echoPulsecaster) {
            this.echoRig.torsoPivot.rotation.set(-0.06, 0.38, 0);
            this.echoRig.leftArmPivot.rotation.set(-1.48, -0.16, -0.06);
            this.echoRig.leftForearmPivot.rotation.set(-0.08, 0, 0);
            break;
          }
          const dir = actor.comboIndex === 1 ? -1 : 1;
          const isFinisher = actor.comboIndex >= 2;
          this.echoRig.torsoPivot.rotation.set(0.2, dir * (isFinisher ? 0.82 : 0.56), -0.1 * dir);
          this.echoRig.rightArmPivot.rotation.set(-0.14, dir * 1.24, -0.46 * dir);
          this.echoRig.rightForearmPivot.rotation.set(-0.1, 0, 0);
          this.echoRig.slashArcPivot.rotation.set(
            actor.comboIndex === 1 ? -0.16 : 0.18,
            0,
            actor.comboIndex === 1 ? 0.34 : -0.32
          );
          this.echoRig.slashArcMaterial.color.setHex(isFinisher ? 0xe0f2fe : 0x38bdf8);
          this.echoRig.slashArcMaterial.opacity = isFinisher ? 0.92 : 0.78;
          this.echoRig.slashArcMesh.scale.set(
            dir * (isFinisher ? 1.26 : 1.04),
            isFinisher ? 1.26 : 1.04,
            isFinisher ? 1.26 : 1.04
          );
          break;
        }
        case 'light_recovery': {
          if (echoPulsecaster) {
            this.echoRig.torsoPivot.rotation.set(0, 0.26, 0);
            this.echoRig.leftArmPivot.rotation.set(-1.16, -0.12, -0.06);
            this.echoRig.leftForearmPivot.rotation.set(-0.26, 0, 0);
            break;
          }
          const dir = actor.comboIndex === 1 ? -1 : 1;
          this.echoRig.torsoPivot.rotation.set(0.12, dir * 0.36, 0);
          this.echoRig.rightArmPivot.rotation.set(-0.18, dir * 0.68, -0.22 * dir);
          this.echoRig.rightForearmPivot.rotation.set(-0.22, 0, 0);
          break;
        }
        case 'heavy_windup': {
          if (echoPulsecaster) {
            this.echoRig.torsoPivot.rotation.set(-0.05, 0.44, 0);
            this.echoRig.leftArmPivot.rotation.set(-1.38, -0.22, -0.08);
            this.echoRig.leftForearmPivot.rotation.set(-0.14, 0, 0);
            break;
          }
          this.echoRig.torsoPivot.rotation.set(-0.3, -0.68, 0.14);
          this.echoRig.rightArmPivot.rotation.set(-1.38, -0.96, 0.54);
          this.echoRig.rightForearmPivot.rotation.set(-0.66, 0, 0);
          break;
        }
        case 'heavy_active': {
          if (echoPulsecaster) {
            this.echoRig.torsoPivot.rotation.set(-0.12, 0.42, 0);
            this.echoRig.leftArmPivot.rotation.set(-1.58, -0.18, -0.06);
            this.echoRig.leftForearmPivot.rotation.set(-0.06, 0, 0);
            break;
          }
          this.echoRig.torsoPivot.rotation.set(0.36, 0.78, -0.18);
          this.echoRig.rightArmPivot.rotation.set(0.34, 1.44, -0.7);
          this.echoRig.rightForearmPivot.rotation.set(-0.08, 0, 0);
          this.echoRig.slashArcPivot.rotation.set(0.42, 0.15, -0.68);
          this.echoRig.slashArcMaterial.color.setHex(0xe0f2fe);
          this.echoRig.slashArcMaterial.opacity = 0.92;
          this.echoRig.slashArcMesh.scale.setScalar(1.34);
          break;
        }
        case 'heavy_recovery': {
          if (echoPulsecaster) {
            this.echoRig.torsoPivot.rotation.set(0, 0.28, 0);
            this.echoRig.leftArmPivot.rotation.set(-1.12, -0.12, -0.06);
            this.echoRig.leftForearmPivot.rotation.set(-0.24, 0, 0);
            break;
          }
          this.echoRig.torsoPivot.rotation.set(0.2, 0.46, -0.1);
          this.echoRig.rightArmPivot.rotation.set(0.08, 0.88, -0.38);
          this.echoRig.rightForearmPivot.rotation.set(-0.18, 0, 0);
          break;
        }
        case 'parry_active':
        case 'parry_recovery': {
          this.echoRig.torsoPivot.rotation.set(0.08, 0.26, 0);
          this.echoRig.rightArmPivot.rotation.set(-0.78, 0.52, 0.68);
          this.echoRig.rightForearmPivot.rotation.set(-0.68, 0, 0);
          this.echoRig.leftArmPivot.rotation.set(-0.68, -0.38, -0.32);
          this.echoRig.parryShieldMaterial.opacity =
            actor.actionState === 'parry_active' ? 0.68 : 0.22;
          break;
        }
        case 'dodging': {
          this.echoRig.bodyGroup.position.y = -0.12;
          this.echoRig.bodyGroup.rotation.x = 0.44;
          this.echoRig.torsoPivot.rotation.set(0.24, 0, 0);
          this.echoRig.rightArmPivot.rotation.set(0.36, -0.2, 0.18);
          this.echoRig.rightForearmPivot.rotation.set(-0.4, 0, 0);
          break;
        }
        default: {
          this.echoRig.bodyGroup.rotation.x = echoMoving ? 0.07 : 0;
          if (echoPulsecaster) {
            this.echoRig.leftArmPivot.rotation.set(-0.58 - echoSwing * 0.18, 0.16, -0.14);
            this.echoRig.leftForearmPivot.rotation.set(-0.44, 0, 0);
            this.echoRig.rightArmPivot.rotation.set(0.18 + echoSwing * 0.24, -0.12, 0.14);
            this.echoRig.rightForearmPivot.rotation.set(-0.48, 0, 0);
          } else {
            this.echoRig.rightArmPivot.rotation.set(-0.2 + echoSwing * 0.44, 0.14, 0.05);
            this.echoRig.rightForearmPivot.rotation.set(-0.3, 0, 0);
            this.echoRig.leftArmPivot.rotation.set(-0.1 - echoSwing * 0.46, -0.06, -0.05);
            this.echoRig.leftForearmPivot.rotation.set(-0.24, 0, 0);
          }
          break;
        }
      }

      // Sample Echo pose into circular history buffer every 25ms for Temporal Afterimage Ghosts (skip on Low VFX)
      if (this.particleQuality === 'low') {
        for (let g = 0; g < this.echoGhosts.length; g++) {
          this.echoGhosts[g].root.visible = false;
        }
      } else {
        this.echoSampleTimer += dt;
        if (this.echoSampleTimer >= 0.025) {
          this.echoSampleTimer = 0;
          const sample = this.echoHistory[this.echoHistoryHead];
          sample.valid = true;
          sample.time = world.elapsedTime;
          sample.x = actor.x;
          sample.z = actor.z;
          sample.rotY = actor.rotationY;
          sample.bodyY = this.echoRig.bodyGroup.position.y;
          sample.bodyRotX = this.echoRig.bodyGroup.rotation.x;
          sample.bodyRotZ = this.echoRig.bodyGroup.rotation.z;
          sample.torsoRotX = this.echoRig.torsoPivot.rotation.x;
          sample.torsoRotY = this.echoRig.torsoPivot.rotation.y;
          sample.torsoRotZ = this.echoRig.torsoPivot.rotation.z;
          sample.leftLegX = this.echoRig.leftLegPivot.rotation.x;
          sample.rightLegX = this.echoRig.rightLegPivot.rotation.x;
          sample.leftArmX = this.echoRig.leftArmPivot.rotation.x;
          sample.leftArmY = this.echoRig.leftArmPivot.rotation.y;
          sample.leftArmZ = this.echoRig.leftArmPivot.rotation.z;
          sample.rightArmX = this.echoRig.rightArmPivot.rotation.x;
          sample.rightArmY = this.echoRig.rightArmPivot.rotation.y;
          sample.rightArmZ = this.echoRig.rightArmPivot.rotation.z;
          this.echoHistoryHead = (this.echoHistoryHead + 1) % ECHO_HISTORY_SIZE;
        }

        // Position delayed afterimage ghosts (~75ms and ~150ms behind live Echo)
        const ghostOffsets = [3, 6];
        for (let g = 0; g < this.echoGhosts.length; g++) {
          const ghost = this.echoGhosts[g];
          const idx =
            (this.echoHistoryHead - 1 - ghostOffsets[g] + ECHO_HISTORY_SIZE * 2) %
            ECHO_HISTORY_SIZE;
          const sample = this.echoHistory[idx];
          const distSq = sample.valid
            ? (sample.x - actor.x) * (sample.x - actor.x) +
              (sample.z - actor.z) * (sample.z - actor.z)
            : 0;
          const isActionPose =
            actor.actionState !== 'idle' && actor.actionState !== 'moving';
          if (sample.valid && (distSq > 0.008 || isActionPose)) {
            ghost.root.visible = true;
            ghost.root.position.set(sample.x, 0, sample.z);
            ghost.root.rotation.y = sample.rotY;
            ghost.bodyGroup.position.y = sample.bodyY;
            ghost.bodyGroup.rotation.x = sample.bodyRotX;
            ghost.bodyGroup.rotation.z = sample.bodyRotZ;
            ghost.torsoPivot.rotation.set(
              sample.torsoRotX,
              sample.torsoRotY,
              sample.torsoRotZ
            );
            ghost.leftLegPivot.rotation.x = sample.leftLegX;
            ghost.rightLegPivot.rotation.x = sample.rightLegX;
            ghost.leftArmPivot.rotation.set(
              sample.leftArmX,
              sample.leftArmY,
              sample.leftArmZ
            );
            ghost.rightArmPivot.rotation.set(
              sample.rightArmX,
              sample.rightArmY,
              sample.rightArmZ
            );
          } else {
            ghost.root.visible = false;
          }
        }
      }
      if (this.echoTetherMesh && this.echoTetherMat) {
        const dx = actor.x - p.x;
        const dz = actor.z - p.z;
        const dist = Math.hypot(dx, dz);
        const resonancePrimed = Boolean(
          world.resonance?.status === 'primed' &&
            world.resonance.activeMark &&
            world.resonance.activeMark.remainingTime > 0
        );
        const tetherVis = computeEchoTetherVisuals({
          distance: dist,
          resonancePrimed,
          relayReady: Boolean(world.relay?.preview?.canRelay),
          reducedMotion: this.reducedMotion,
          timeSec: world.elapsedTime,
        });
        if (
          tetherVis.visible &&
          this.screenEffectsEnabled !== false &&
          this.particleQuality !== 'low'
        ) {
          this.echoTetherMesh.visible = true;
          this.echoTetherMesh.position.set((p.x + actor.x) * 0.5, 1.05, (p.z + actor.z) * 0.5);
          this.echoTetherMesh.lookAt(actor.x, 1.05, actor.z);
          this.echoTetherMesh.scale.set(
            tetherVis.thicknessScale,
            tetherVis.thicknessScale,
            dist
          );
          this.echoTetherMat.color.setHex(tetherVis.hex);
          this.echoTetherMat.opacity = tetherVis.opacity;
        } else {
          this.echoTetherMesh.visible = false;
        }
      }
    } else {
      this.echoRig.root.visible = false;
      for (let g = 0; g < this.echoGhosts.length; g++) {
        this.echoGhosts[g].root.visible = false;
      }
      if (this.echoTetherMesh) {
        this.echoTetherMesh.visible = false;
      }
    }

    // =========================================================================
    // 3. CHRONO ANCHOR PRESSURE PLATES, RECEIVER, BARRIERS & RELAY RETICLE
    // =========================================================================
    const plate = world.pressurePlate;
    const pr = this.chronoPlateRig;
    const act = plate.active ? 1 : 0;
    const playerOnPlate =
      Math.hypot(p.x - plate.x, p.z - plate.z) <=
      plate.radius + GAME_CONFIG.player.radius * 0.55;

    // 1. Recording indicator ring around Sera during recording
    if (echo.state === 'recording') {
      pr.recordingRingGroup.visible = true;
      pr.recordingRingGroup.position.set(p.x, 0, p.z);
      pr.recordingRingGroup.rotation.y += dt * 2.4;
      const pulse = 0.94 + Math.sin(world.elapsedTime * 8) * 0.08;
      pr.recordingRingGroup.scale.setScalar(pulse);
    } else {
      pr.recordingRingGroup.visible = false;
    }

    // 2. Origin Anchor Marker when a recorded clip is Ready, Replaying, or Finished
    if (
      echo.clip &&
      echo.clip.samples.length > 0 &&
      (echo.state === 'ready' || echo.state === 'playback' || echo.state === 'finished')
    ) {
      const origin = echo.clip.samples[0];
      pr.originMarkerGroup.visible = true;
      pr.originMarkerGroup.position.set(origin.x, 0, origin.z);
      pr.originMarkerRing.rotation.z += dt * 1.4;
    } else {
      pr.originMarkerGroup.visible = false;
    }

    // 2b. Phase 4 Relay Landing Reticle & Phase Column adjacent to active Echo during playback
    if (echo.state === 'playback' && echo.activeActor) {
      const relayPreview = world.relay.preview;
      pr.relayTargetGroup.visible = true;
      pr.relayTargetGroup.position.set(relayPreview.landingX, 0, relayPreview.landingZ);
      pr.relayTargetRingMesh.rotation.z -= dt * 2.2;
      pr.relayTargetColumnMesh.rotation.y += dt * 1.8;
      if (relayPreview.canRelay) {
        pr.relayTargetRingMaterial.color.setHex(0x22d3ee);
        pr.relayTargetRingMaterial.opacity = 0.9;
        pr.relayTargetInnerMaterial.color.setHex(0xe0f2fe);
        pr.relayTargetInnerMaterial.opacity = 0.38;
        pr.relayTargetColumnMaterial.color.setHex(0x22d3ee);
        pr.relayTargetColumnMaterial.opacity = 0.24 + Math.sin(world.elapsedTime * 6) * 0.08;
      } else {
        pr.relayTargetRingMaterial.color.setHex(0xf59e0b);
        pr.relayTargetRingMaterial.opacity = 0.65;
        pr.relayTargetInnerMaterial.color.setHex(0xd97706);
        pr.relayTargetInnerMaterial.opacity = 0.2;
        pr.relayTargetColumnMaterial.color.setHex(0xf59e0b);
        pr.relayTargetColumnMaterial.opacity = 0.14;
      }
    } else {
      pr.relayTargetGroup.visible = false;
    }

    // 2c. Phase 5 Temporal Resonance Target Reticle & Convergence Shockwave
    const activeMark = world.resonance?.activeMark;
    if (world.appState === 'playing' && activeMark && activeMark.remainingTime > 0) {
      this.resonanceMarkerGroup.visible = true;
      this.resonanceMarkerGroup.position.set(activeMark.x, 0, activeMark.z);
      this.resonanceOuterRingMesh.rotation.z += dt * 2.8;
      this.resonanceCrownMesh.rotation.y -= dt * 3.4;
      this.resonanceCrownMesh.rotation.x += dt * 1.8;
      this.resonanceCrownMesh.position.y =
        2.65 + Math.sin(world.elapsedTime * 7.5) * 0.12;

      const ratio = Math.max(
        0,
        Math.min(1, activeMark.remainingTime / Math.max(0.01, activeMark.duration))
      );
      const shrinkScale = 0.52 + ratio * 0.65;
      this.resonanceInnerRingMesh.scale.setScalar(shrinkScale);
      const canConverge =
        world.resonance.cooldownTimer <= 0 &&
        world.player.flux >= world.resonance.fluxCost;
      this.resonanceOuterRingMat.color.setHex(canConverge ? 0x22d3ee : 0xf59e0b);
      this.resonanceInnerRingMat.color.setHex(canConverge ? 0xffffff : 0xfde68a);
      this.resonanceCrownMat.color.setHex(canConverge ? 0xe0f2fe : 0xf59e0b);
    } else {
      this.resonanceMarkerGroup.visible = false;
    }

    if (world.resonance && world.resonance.flashTimer > 0) {
      const flashProgress =
        1 -
        world.resonance.flashTimer /
          Math.max(0.01, GAME_CONFIG.resonance.flashDuration);
      this.convergenceWaveMesh.visible = true;
      this.convergenceWaveMesh.position.set(
        world.resonance.lastConvergedX,
        0.14,
        world.resonance.lastConvergedZ
      );
      const waveScale = 0.8 + flashProgress * 2.8;
      this.convergenceWaveMesh.scale.setScalar(waveScale);
      this.convergenceWaveMat.opacity = Math.max(0, (1 - flashProgress) * 0.92);
      this.convergenceWaveMat.color.setHex(flashProgress < 0.35 ? 0xffffff : 0x22d3ee);

      this.convergencePillarMesh.visible = true;
      this.convergencePillarMesh.position.set(
        world.resonance.lastConvergedX,
        2.2,
        world.resonance.lastConvergedZ
      );
      const pillarRadiusScale = Math.max(0.15, 1.35 - flashProgress * 1.1);
      this.convergencePillarMesh.scale.set(
        pillarRadiusScale,
        1 + flashProgress * 0.35,
        pillarRadiusScale
      );
      this.convergencePillarMat.opacity = Math.max(0, (1 - flashProgress) * 0.68);
      this.convergencePillarMat.color.setHex(flashProgress < 0.4 ? 0xffffff : 0x38bdf8);
    } else {
      this.convergenceWaveMesh.visible = false;
      this.convergencePillarMesh.visible = false;
    }

    // 2d. Chapter II-IV Arena Mechanics Visuals (Choir Harmonic Nodes + 3D Tether Beams, Curator Traces + 3D Curtains, Gravity Pin, Chrono Sever Cage, Echo Collapse)
    if (world.choir?.active && world.choir.nodes.length > 0) {
      this.choirNodesGroup.visible = true;
      const bossEnemy = world.boss ? world.enemies.find((e) => e.id === world.boss?.id) : null;
      const bossX = bossEnemy && bossEnemy.hp > 0 ? bossEnemy.x : 0;
      const bossZ = bossEnemy && bossEnemy.hp > 0 ? bossEnemy.z : -4.5;
      const showTethers = Boolean(world.boss && world.boss.hp > 0 && !world.boss.coreExposed);

      for (let n = 0; n < this.choirNodeRigs.length; n++) {
        const nodeState = world.choir.nodes[n];
        const nRig = this.choirNodeRigs[n];
        if (!nodeState) {
          nRig.group.visible = false;
          nRig.tetherMesh.visible = false;
          continue;
        }
        nRig.group.visible = true;
        nRig.group.position.set(nodeState.x, 0, nodeState.z);
        nRig.coreMesh.rotation.y += dt * (nodeState.status === 'inactive' ? 1.4 : 4.2);
        nRig.coreMesh.position.y = 1.22 + Math.sin(world.elapsedTime * 3.5 + n) * 0.08;
        nRig.ringMesh.rotation.z += dt * (nodeState.status === 'inactive' ? 1.2 : 3.2);

        if (nodeState.status === 'synchronized') {
          nRig.coreMat.color.setHex(0xffffff);
          nRig.coreMat.emissive.setHex(0x22d3ee);
          nRig.coreMat.emissiveIntensity = 2.2;
          nRig.ringMat.color.setHex(0xffffff);
          nRig.ringMat.opacity = 0.92;
          nRig.tetherMesh.visible = false;
        } else if (nodeState.status === 'primed') {
          nRig.coreMat.color.setHex(0x22d3ee);
          nRig.coreMat.emissive.setHex(0x06b6d4);
          nRig.coreMat.emissiveIntensity = 1.9;
          nRig.ringMat.color.setHex(0x22d3ee);
          nRig.ringMat.opacity = 0.88;
          if (showTethers) {
            nRig.tetherMesh.visible = true;
            const dx = bossX - nodeState.x;
            const dz = bossZ - nodeState.z;
            const dist = Math.max(0.1, Math.hypot(dx, dz));
            nRig.tetherMesh.position.set(nodeState.x, 1.28, nodeState.z);
            nRig.tetherMesh.rotation.y = Math.atan2(dx, dz);
            nRig.tetherMesh.scale.set(1.25, 1, dist);
            nRig.tetherMat.color.setHex(0x22d3ee);
            nRig.tetherMat.opacity = 0.65 + Math.sin(world.elapsedTime * 14) * 0.2;
          } else {
            nRig.tetherMesh.visible = false;
          }
        } else {
          nRig.coreMat.color.setHex(0xf59e0b);
          nRig.coreMat.emissive.setHex(0xd97706);
          nRig.coreMat.emissiveIntensity = 1.1;
          nRig.ringMat.color.setHex(0xf59e0b);
          nRig.ringMat.opacity = 0.54;
          if (showTethers) {
            nRig.tetherMesh.visible = true;
            const dx = bossX - nodeState.x;
            const dz = bossZ - nodeState.z;
            const dist = Math.max(0.1, Math.hypot(dx, dz));
            nRig.tetherMesh.position.set(nodeState.x, 1.28, nodeState.z);
            nRig.tetherMesh.rotation.y = Math.atan2(dx, dz);
            nRig.tetherMesh.scale.set(0.85, 1, dist);
            nRig.tetherMat.color.setHex(0xf59e0b);
            nRig.tetherMat.opacity = 0.38 + Math.sin(world.elapsedTime * 5 + n) * 0.1;
          } else {
            nRig.tetherMesh.visible = false;
          }
        }
      }
    } else {
      this.choirNodesGroup.visible = false;
    }

    if (world.gravityPin?.status === 'active') {
      this.gravityPinMesh.visible = true;
      this.gravityPinMesh.position.set(world.gravityPin.centerX, 0.05, world.gravityPin.centerZ);
      this.gravityPinMesh.scale.setScalar(world.gravityPin.radius);
      this.gravityPinMesh.rotation.z -= dt * 2.8;
      this.gravityPinMat.opacity = 0.48 + Math.sin(world.elapsedTime * 8) * 0.14;
    } else {
      this.gravityPinMesh.visible = false;
    }

    const traces = world.curator?.traces ?? [];
    for (let t = 0; t < this.curatorTraceMeshes.length; t++) {
      const tEntry = this.curatorTraceMeshes[t];
      const trace = traces[t];
      if (!trace || !world.curator?.active) {
        tEntry.mesh.visible = false;
        for (let e = 0; e < tEntry.edgeMeshes.length; e++) {
          tEntry.edgeMeshes[e].visible = false;
        }
        continue;
      }
      tEntry.mesh.visible = true;
      tEntry.mesh.position.set(trace.originX, 0.036, trace.originZ);
      tEntry.mesh.rotation.y = Math.atan2(trace.dirX, trace.dirZ);
      tEntry.mesh.scale.set(trace.width, 1, trace.length);
      const perpX = trace.dirZ;
      const perpZ = -trace.dirX;
      for (let e = 0; e < tEntry.edgeMeshes.length; e++) {
        const side = e === 0 ? -1 : 1;
        const edge = tEntry.edgeMeshes[e];
        edge.visible = true;
        edge.position.set(
          trace.originX + perpX * side * trace.width * 0.5,
          0.04,
          trace.originZ + perpZ * side * trace.width * 0.5
        );
        edge.rotation.y = tEntry.mesh.rotation.y;
        edge.scale.set(1, 1, trace.length);
      }
      if (trace.isHarmlessResidue || trace.state === 'residue') {
        tEntry.mat.color.setHex(0xa855f7);
        tEntry.mat.opacity = 0.22;
        tEntry.curtainMat.color.setHex(0xa855f7);
        tEntry.curtainMat.opacity = 0.12;
        tEntry.edgeMat.color.setHex(0xc084fc);
        tEntry.edgeMat.opacity = 0.32;
      } else if (trace.state === 'executing') {
        tEntry.mat.color.setHex(0xef4444);
        tEntry.mat.opacity = 0.72;
        tEntry.curtainMat.color.setHex(0xef4444);
        tEntry.curtainMat.opacity = 0.52;
        tEntry.edgeMat.color.setHex(0xffffff);
        tEntry.edgeMat.opacity = 0.94;
      } else if (trace.state === 'committed') {
        tEntry.mat.color.setHex(0xef4444);
        tEntry.mat.opacity = 0.48;
        tEntry.curtainMat.color.setHex(0xef4444);
        tEntry.curtainMat.opacity = 0.34;
        tEntry.edgeMat.color.setHex(0xef4444);
        tEntry.edgeMat.opacity = 0.86;
      } else {
        tEntry.mat.color.setHex(0xf59e0b);
        tEntry.mat.opacity = 0.36;
        tEntry.curtainMat.color.setHex(0xf59e0b);
        tEntry.curtainMat.opacity = 0.24;
        tEntry.edgeMat.color.setHex(0xfbbf24);
        tEntry.edgeMat.opacity = 0.72;
      }
    }

    if (world.matron?.chronoSeverActive) {
      this.chronoSeverMesh.visible = true;
      this.chronoSeverMesh.position.set(
        world.matron.chronoSeverZoneX,
        0.055,
        world.matron.chronoSeverZoneZ
      );
      this.chronoSeverMesh.scale.setScalar(world.matron.chronoSeverRadius);
      this.chronoSeverMesh.rotation.z += dt * 3.5;
      this.chronoSeverMat.opacity = 0.62 + Math.sin(world.elapsedTime * 12) * 0.2;

      this.chronoSeverWallMesh.visible = true;
      this.chronoSeverWallMesh.position.set(
        world.matron.chronoSeverZoneX,
        0.95,
        world.matron.chronoSeverZoneZ
      );
      this.chronoSeverWallMesh.scale.set(
        world.matron.chronoSeverRadius,
        1,
        world.matron.chronoSeverRadius
      );
      this.chronoSeverWallMesh.rotation.y -= dt * 2.2;
      this.chronoSeverWallMat.opacity = 0.14 + Math.sin(world.elapsedTime * 10) * 0.06;

      this.chronoSeverStrutsGroup.visible = true;
      this.chronoSeverStrutsGroup.position.set(
        world.matron.chronoSeverZoneX,
        0,
        world.matron.chronoSeverZoneZ
      );
      this.chronoSeverStrutsGroup.scale.set(
        world.matron.chronoSeverRadius,
        1,
        world.matron.chronoSeverRadius
      );
      this.chronoSeverStrutsGroup.rotation.y += dt * 0.35;
      this.chronoSeverStrutMat.opacity = 0.62 + Math.sin(world.elapsedTime * 10) * 0.18;
    } else {
      this.chronoSeverMesh.visible = false;
      this.chronoSeverWallMesh.visible = false;
      this.chronoSeverStrutsGroup.visible = false;
    }

    if (world.echoCollapse && world.echoCollapse.blastTimer > 0) {
      const progress =
        1 -
        world.echoCollapse.blastTimer /
          Math.max(0.01, GAME_CONFIG.matron.echoCollapse.blastVisualDuration);
      this.echoCollapseWaveMesh.visible = true;
      this.echoCollapseWaveMesh.position.set(
        world.echoCollapse.blastX,
        0.12,
        world.echoCollapse.blastZ
      );
      this.echoCollapseWaveMesh.scale.setScalar(
        0.4 + progress * world.echoCollapse.blastRadius
      );
      this.echoCollapseWaveMat.opacity = Math.max(0, (1 - progress) * 0.9);
    } else {
      this.echoCollapseWaveMesh.visible = false;
    }

    // 3. Pressure Plate mechanical depression, claw lock & holographic sync ring
    pr.padGroup.position.y = 0.075 - act * 0.042;
    for (let i = 0; i < pr.clawPivots.length; i++) {
      pr.clawPivots[i].rotation.x = act * 0.46;
    }

    if (plate.active) {
      pr.padCoreMaterial.color.setHex(0xe0f2fe);
      pr.padCoreMaterial.emissive.setHex(0x22d3ee);
      pr.padCoreMaterial.emissiveIntensity = 1.85;
      pr.padRingMaterial.color.setHex(0xe0f2fe);
      pr.padRingMaterial.opacity = 0.92;
    } else if (playerOnPlate && plate.interactionPolicy === 'echo_only') {
      pr.padCoreMaterial.color.setHex(0xf59e0b);
      pr.padCoreMaterial.emissive.setHex(0xd97706);
      pr.padCoreMaterial.emissiveIntensity = 1.25;
      pr.padRingMaterial.color.setHex(0xf59e0b);
      pr.padRingMaterial.opacity = 0.78;
    } else {
      pr.padCoreMaterial.color.setHex(0x0e7490);
      pr.padCoreMaterial.emissive.setHex(0x0891b2);
      pr.padCoreMaterial.emissiveIntensity = 0.78;
      pr.padRingMaterial.color.setHex(0x22d3ee);
      pr.padRingMaterial.opacity = 0.55;
    }

    pr.syncRingMaterial.opacity = act * 0.85;
    pr.syncRingMesh.position.y =
      0.16 + act * 0.25 + Math.sin(world.elapsedTime * 5.0) * 0.05 * act;
    pr.syncRingMesh.rotation.z += dt * 1.8;

    // 4. Conduit & Retractable Containment Barrier Column
    pr.conduitCoreMaterial.color.setHex(plate.active ? 0x22d3ee : 0x0891b2);
    pr.conduitCoreMaterial.opacity = 0.42 + act * 0.52;

    const maxRetract = GAME_CONFIG.arena.chronoPlate.receiverHeight - 0.16;
    pr.barrierColumnGroup.position.y = -act * maxRetract;

    if (plate.barrierOpen) {
      pr.barrierStripMaterial.color.setHex(0x22d3ee);
      pr.barrierStripMaterial.emissive.setHex(0x06b6d4);
      pr.receiverBeaconMaterial.color.setHex(0xe0f2fe);
      pr.receiverBeaconMaterial.emissive.setHex(0x22d3ee);
      pr.receiverBeaconMaterial.emissiveIntensity = 1.9;
    } else {
      pr.barrierStripMaterial.color.setHex(0xf59e0b);
      pr.barrierStripMaterial.emissive.setHex(0xd97706);
      pr.receiverBeaconMaterial.color.setHex(0xf59e0b);
      pr.receiverBeaconMaterial.emissive.setHex(0xd97706);
      pr.receiverBeaconMaterial.emissiveIntensity = 1.1;
    }
    pr.receiverBeaconMesh.rotation.y += dt * (1.2 + act * 2.8);
    pr.receiverBeaconMesh.rotation.x = Math.sin(world.elapsedTime * 2.4) * 0.28;

    // 5. Phase 3 Stage 2 (TEST): Kinetic Resonance Receiver 01 & Stage 3 (COMBINE): Pad 02 + Final Barrier
    const puzzle = world.puzzle;
    if (puzzle) {
      const receiver = puzzle.heavyReceiver;
      const combinePlate = puzzle.combinePlate;
      const finalBarrier = puzzle.finalBarrier;

      // Stage 2 Heavy Receiver visual state
      if (receiver.charged) {
        pr.heavyStrikePadRingMaterial.color.setHex(0xe0f2fe);
        pr.heavyStrikePadRingMaterial.opacity = 0.92;
        pr.heavyStrikeChevronMaterial.color.setHex(0x22d3ee);
        pr.heavyReceptorCoreMaterial.color.setHex(0xffffff);
        pr.heavyReceptorCoreMaterial.emissive.setHex(0x22d3ee);
        pr.heavyReceptorCoreMaterial.emissiveIntensity = 2.1;
        pr.receiverToCombineConduitMaterial.color.setHex(0x22d3ee);
        pr.receiverToCombineConduitMaterial.opacity = 0.95;
      } else {
        pr.heavyStrikePadRingMaterial.color.setHex(0xf59e0b);
        pr.heavyStrikePadRingMaterial.opacity = 0.68;
        pr.heavyStrikeChevronMaterial.color.setHex(0xf59e0b);
        pr.heavyReceptorCoreMaterial.color.setHex(0xf59e0b);
        pr.heavyReceptorCoreMaterial.emissive.setHex(0xd97706);
        pr.heavyReceptorCoreMaterial.emissiveIntensity = 1.25;
        pr.receiverToCombineConduitMaterial.color.setHex(0xd97706);
        pr.receiverToCombineConduitMaterial.opacity = 0.42;
      }

      const gyroSpin = receiver.charged ? 4.2 : 1.1;
      pr.heavyReceptorGyroLeft.rotation.y += dt * gyroSpin;
      pr.heavyReceptorGyroLeft.rotation.x += dt * (gyroSpin * 0.6);
      pr.heavyReceptorGyroRight.rotation.y -= dt * gyroSpin;
      pr.heavyReceptorGyroRight.rotation.x -= dt * (gyroSpin * 0.6);

      // Stage 3 Combine Pressure Plate 02 visual state
      const cpAct = combinePlate.active ? 1 : 0;
      const playerOnCombinePlate =
        Math.hypot(p.x - combinePlate.x, p.z - combinePlate.z) <=
        combinePlate.radius + GAME_CONFIG.player.radius * 0.55;

      pr.combinePadGroup.position.y = 0.075 - cpAct * 0.042;
      for (let i = 0; i < pr.combineClawPivots.length; i++) {
        pr.combineClawPivots[i].rotation.x = cpAct * 0.46;
      }

      if (combinePlate.active) {
        pr.combinePadCoreMaterial.color.setHex(0xe0f2fe);
        pr.combinePadCoreMaterial.emissive.setHex(0x22d3ee);
        pr.combinePadCoreMaterial.emissiveIntensity = 1.85;
        pr.combinePadRingMaterial.color.setHex(0xe0f2fe);
        pr.combinePadRingMaterial.opacity = 0.92;
      } else if (playerOnCombinePlate && combinePlate.interactionPolicy === 'echo_only') {
        pr.combinePadCoreMaterial.color.setHex(0xf59e0b);
        pr.combinePadCoreMaterial.emissive.setHex(0xd97706);
        pr.combinePadCoreMaterial.emissiveIntensity = 1.25;
        pr.combinePadRingMaterial.color.setHex(0xf59e0b);
        pr.combinePadRingMaterial.opacity = 0.78;
      } else {
        pr.combinePadCoreMaterial.color.setHex(0x0e7490);
        pr.combinePadCoreMaterial.emissive.setHex(0x0891b2);
        pr.combinePadCoreMaterial.emissiveIntensity = 0.78;
        pr.combinePadRingMaterial.color.setHex(0x22d3ee);
        pr.combinePadRingMaterial.opacity = 0.55;
      }

      pr.combineSyncRingMaterial.opacity = cpAct * 0.85;
      pr.combineSyncRingMesh.position.y =
        0.16 + cpAct * 0.25 + Math.sin(world.elapsedTime * 5.0) * 0.05 * cpAct;
      pr.combineSyncRingMesh.rotation.z -= dt * 1.8;

      pr.combinePlateConduitMaterial.color.setHex(combinePlate.active ? 0x22d3ee : 0x0891b2);
      pr.combinePlateConduitMaterial.opacity = combinePlate.active ? 0.94 : 0.42;

      // Stage 3 Final Combine Barrier dual-lock rings & retraction
      const fbOpen = finalBarrier.open ? 1 : 0;
      const fbMaxRetract = GAME_CONFIG.arena.chronoPuzzle.finalBarrier.height - 0.16;
      pr.finalBarrierColumnGroup.position.y = -fbOpen * fbMaxRetract;

      if (receiver.charged) {
        pr.finalBarrierReceiverBandMat.color.setHex(0xe0f2fe);
        pr.finalBarrierReceiverBandMat.emissive.setHex(0x22d3ee);
      } else {
        pr.finalBarrierReceiverBandMat.color.setHex(0xf59e0b);
        pr.finalBarrierReceiverBandMat.emissive.setHex(0xd97706);
      }

      if (combinePlate.active) {
        pr.finalBarrierPlateBandMat.color.setHex(0x22d3ee);
        pr.finalBarrierPlateBandMat.emissive.setHex(0x06b6d4);
      } else {
        pr.finalBarrierPlateBandMat.color.setHex(0xf59e0b);
        pr.finalBarrierPlateBandMat.emissive.setHex(0xd97706);
      }

      if (finalBarrier.open) {
        pr.finalBarrierBeaconMaterial.color.setHex(0xffffff);
        pr.finalBarrierBeaconMaterial.emissive.setHex(0x22d3ee);
        pr.finalBarrierBeaconMaterial.emissiveIntensity = 2.0;
      } else {
        pr.finalBarrierBeaconMaterial.color.setHex(0xf59e0b);
        pr.finalBarrierBeaconMaterial.emissive.setHex(0xd97706);
        pr.finalBarrierBeaconMaterial.emissiveIntensity = 1.2;
      }
      pr.finalBarrierBeaconMesh.rotation.y += dt * (1.2 + fbOpen * 3.0);
      pr.finalBarrierBeaconMesh.rotation.z = Math.cos(world.elapsedTime * 2.2) * 0.26;

      // Completion node beacon
      pr.completionBeaconMesh.rotation.y += dt * (puzzle.completed ? 3.2 : 1.1);
      pr.completionBeaconMesh.position.y =
        0.85 + Math.sin(world.elapsedTime * 3.0) * 0.08;
      if (puzzle.completed) {
        pr.completionBeaconMaterial.color.setHex(0xffffff);
        pr.completionBeaconMaterial.emissive.setHex(0x22d3ee);
        pr.completionBeaconMaterial.emissiveIntensity = 2.2;
      } else {
        pr.completionBeaconMaterial.color.setHex(0x38bdf8);
        pr.completionBeaconMaterial.emissive.setHex(0x0891b2);
        pr.completionBeaconMaterial.emissiveIntensity = 1.15;
      }
    }

    // =========================================================================
    // 4. ENEMY & BOSS VISUAL RIGS: BASTION, SCRAPPER, SCOUT & HELIX-04 MOTION
    // =========================================================================
    this.reconcileEnemyRigs(world);
    let staggerBeaconUsed = 0;
    const beaconPoolEnabled =
      this.screenEffectsEnabled !== false &&
      Boolean(this.staggerBeaconSlots && this.staggerBeaconSlots.length > 0);

    for (let i = 0; i < world.enemies.length; i++) {
      const enemy = world.enemies[i];
      const rig = this.enemyRigs.get(enemy.id);
      if (!rig) continue;

      rig.root.position.set(enemy.x, 0, enemy.z);
      rig.root.rotation.y = enemy.rotationY;

      let guardRecoil = this.enemyGuardRecoilTimers.get(enemy.id) ?? 0;
      if (guardRecoil > 0) {
        guardRecoil = Math.max(0, guardRecoil - dt);
        this.enemyGuardRecoilTimers.set(enemy.id, guardRecoil);
      }

      if (guardRecoil > 0) {
        const gRatio = Math.min(1, guardRecoil / 0.22);
        rig.bodyGroup.scale.set(1 + 0.05 * gRatio, 1 - 0.06 * gRatio, 1 + 0.05 * gRatio);
      } else {
        rig.bodyGroup.scale.set(1, 1, 1);
      }

      const isBossEnemy = Boolean(world.boss && world.boss.id === enemy.id);
      const isExecutableWindow =
        enemy.aiState !== 'ko' &&
        enemy.hp > 0 &&
        (enemy.aiState === 'staggered' ||
          (isBossEnemy && Boolean(world.boss?.coreExposed)));
      if (
        beaconPoolEnabled &&
        isExecutableWindow &&
        staggerBeaconUsed < this.staggerBeaconSlots.length
      ) {
        const bSlot = this.staggerBeaconSlots[staggerBeaconUsed++];
        const pulseScale = isBossEnemy ? 1.48 : 1.0;
        const animPulse = this.reducedMotion
          ? 1
          : 1 + Math.sin(world.elapsedTime * 7.2 + staggerBeaconUsed) * 0.07;
        bSlot.group.visible = true;
        bSlot.group.position.set(enemy.x, 0, enemy.z);
        bSlot.group.scale.setScalar(pulseScale * animPulse);
        bSlot.outerRing.rotation.y = this.reducedMotion ? 0 : world.elapsedTime * 1.4;
        bSlot.innerRing.rotation.y = this.reducedMotion ? 0 : -world.elapsedTime * 2.2;
        const isResReady =
          world.resonance?.activeMark?.enemyId === enemy.id &&
          world.resonance.activeMark.remainingTime > 0;
        bSlot.ringMat.color.setHex(isResReady ? 0x22d3ee : 0xfbbf24);
        bSlot.pillarMat.color.setHex(isResReady ? 0x38bdf8 : 0xf59e0b);
        bSlot.ringMat.opacity = this.reducedMotion
          ? 0.78
          : 0.7 + Math.sin(world.elapsedTime * 8) * 0.18;
      }

      if (rig.ramLaneGroup) rig.ramLaneGroup.visible = false;
      if (rig.ramLaneShaderMat) rig.ramLaneShaderMat.uniforms.uOpacity.value = 0;
      if (rig.sweepSectorGroup) rig.sweepSectorGroup.visible = false;
      if (rig.sweepSectorShaderMat) rig.sweepSectorShaderMat.uniforms.uOpacity.value = 0;
      if (rig.slamShockwaveRing) rig.slamShockwaveRing.visible = false;
      this.syncTelegraphShader(rig, false, 0, 0xf59e0b, 0, world.elapsedTime);

      // KO Temporal De-Rez Collapse transition
      if (enemy.aiState === 'ko') {
        const deRez = computeEnemyDeRezState(enemy.koProgress, this.reducedMotion);
        rig.bodyGroup.rotation.x = deRez.toppleAngle;
        rig.bodyGroup.position.y = deRez.sinkY;
        rig.bodyGroup.scale.set(
          deRez.horizontalScale,
          deRez.verticalScale,
          deRez.horizontalScale
        );
        rig.telegraphDiscMaterial.opacity = 0;
        rig.telegraphRingMaterial.opacity = 0;
        rig.coreRimMaterial.opacity = deRez.pulseStrength * 0.65;
        if (rig.laserSightMaterial) rig.laserSightMaterial.opacity = 0;
        rig.coreMaterial.color.setHex(deRez.opacityFade > 0.25 ? deRez.emissiveHex : 0x334155);
        rig.coreMaterial.emissive.setHex(deRez.emissiveHex);
        rig.coreMaterial.emissiveIntensity = deRez.emissiveIntensity * deRez.opacityFade;
        continue;
      }

      if (
        enemy.archetype === 'helix' ||
        enemy.archetype === 'choir' ||
        enemy.archetype === 'curator' ||
        enemy.archetype === 'matron' ||
        enemy.archetype === 'warden_prime'
      ) {
        const boss = world.boss;
        const bState = boss ? boss.aiState : enemy.aiState;
        const bPhase = boss ? boss.phase : 1;
        const bAttack = boss ? boss.activeAttack : null;
        const bCoreExposed = boss
          ? boss.coreExposed
          : enemy.aiState === 'recovery' || enemy.aiState === 'staggered';
        const enemySpeed = Math.hypot(enemy.vx, enemy.vz);
        const isMoving = bState === 'pursue' && enemySpeed > 0.12;
        const walkCycle = world.elapsedTime * (bPhase === 2 ? 6.2 : 4.5);

        // 1. Hydraulic Leg & Shin Stride
        if (rig.leftLegPivot && rig.rightLegPivot) {
          const legSwing = isMoving ? Math.sin(walkCycle) * 0.42 : 0;
          rig.leftLegPivot.rotation.x = legSwing;
          rig.rightLegPivot.rotation.x = -legSwing;
          if (rig.leftShinPivot && rig.rightShinPivot) {
            rig.leftShinPivot.rotation.x = isMoving
              ? Math.max(0.05, -Math.sin(walkCycle + 0.5)) * 0.48
              : 0.08;
            rig.rightShinPivot.rotation.x = isMoving
              ? Math.max(0.05, Math.sin(walkCycle + 0.5)) * 0.48
              : 0.08;
          }
        }

        // 2. Helical Containment Cage Counter-Rotation
        const ringRate =
          bState === 'phase_transition' || bState === 'attack'
            ? 4.6
            : bState === 'telegraph'
              ? 3.2
              : bState === 'recovery' || bState === 'staggered'
                ? 0.38
                : bPhase === 2
                  ? 2.4
                  : 1.35;
        if (rig.outerHelixRing) {
          rig.outerHelixRing.rotation.z += dt * ringRate;
          rig.outerHelixRing.rotation.y = Math.sin(world.elapsedTime * 1.8) * 0.22;
        }
        if (rig.innerHelixRing) {
          rig.innerHelixRing.rotation.z -= dt * (ringRate * 1.35);
          rig.innerHelixRing.rotation.x = Math.cos(world.elapsedTime * 2.1) * 0.25;
        }

        if (rig.auxiliaryPivots) {
          for (let a = 0; a < rig.auxiliaryPivots.length; a++) {
            const pivot = rig.auxiliaryPivots[a];
            if (rig.archetype === 'matron') {
              const side = Number(pivot.userData.side) || 1;
              const restZ = Number(pivot.userData.restZ) || 0;
              const flex =
                bState === 'telegraph'
                  ? 0.3
                  : bState === 'attack'
                    ? -0.44
                    : bState === 'recovery' || bState === 'staggered'
                      ? 0.2
                      : 0;
              pivot.rotation.z =
                restZ + side * flex + Math.sin(world.elapsedTime * 2.4 + a * 1.3) * 0.035;
              pivot.rotation.x = bState === 'staggered' ? -0.18 : 0;
            } else {
              const baseY = Number(pivot.userData.baseY);
              if (Number.isFinite(baseY)) {
                const motionScale = bState === 'attack' || bState === 'phase_transition' ? 2.4 : 1;
                pivot.position.y =
                  baseY + Math.sin(world.elapsedTime * 2.2 + a * 1.15) * 0.035 * motionScale;
              }
              if (rig.archetype === 'curator') {
                pivot.rotation.y =
                  (Number(pivot.userData.baseRotY) || 0) +
                  Math.sin(world.elapsedTime * 1.6 + a) * 0.075;
              }
            }
          }
        }

        // 3. Physical Core Shutters (Slide/pivot open when coreExposed is true)
        const shutterTargetX = bCoreExposed ? 0.34 : 0;
        const shutterTargetRotY = bCoreExposed ? 0.54 : 0;
        if (rig.leftShutterPivot && rig.rightShutterPivot) {
          rig.leftShutterPivot.position.x +=
            (-shutterTargetX - rig.leftShutterPivot.position.x) * poseAlpha;
          rig.rightShutterPivot.position.x +=
            (shutterTargetX - rig.rightShutterPivot.position.x) * poseAlpha;
          rig.leftShutterPivot.rotation.y +=
            (shutterTargetRotY - rig.leftShutterPivot.rotation.y) * poseAlpha;
          rig.rightShutterPivot.rotation.y +=
            (-shutterTargetRotY - rig.rightShutterPivot.rotation.y) * poseAlpha;
        }

        // 4. Core & Resonance Illumination
        const isResonanceMarked =
          world.resonance?.activeMark?.enemyId === enemy.id &&
          world.resonance.activeMark.remainingTime > 0;
        rig.coreRimMaterial.opacity = isResonanceMarked || bCoreExposed ? 0.92 : 0.24;

        if (enemy.hitFlashTimer > 0) {
          rig.coreMaterial.color.setHex(0xffffff);
          rig.coreMaterial.emissive.setHex(0xffffff);
          rig.coreMaterial.emissiveIntensity = 2.6;
        } else if (bCoreExposed) {
          rig.coreMaterial.color.setHex(0xffffff);
          rig.coreMaterial.emissive.setHex(isResonanceMarked ? 0x22d3ee : 0xf8fafc);
          rig.coreMaterial.emissiveIntensity = 2.25;
        } else if (isResonanceMarked) {
          rig.coreMaterial.color.setHex(0xe0f2fe);
          rig.coreMaterial.emissive.setHex(0x22d3ee);
          rig.coreMaterial.emissiveIntensity = 2.1;
        } else if (bState === 'phase_transition' || bState === 'attack') {
          rig.coreMaterial.color.setHex(0xef4444);
          rig.coreMaterial.emissive.setHex(0xdc2626);
          rig.coreMaterial.emissiveIntensity = 2.2;
        } else if (bState === 'telegraph') {
          rig.coreMaterial.color.setHex(0xf59e0b);
          rig.coreMaterial.emissive.setHex(0xf59e0b);
          rig.coreMaterial.emissiveIntensity = 1.95;
        } else {
          rig.coreMaterial.color.setHex(bPhase === 2 ? 0xef4444 : 0xf59e0b);
          rig.coreMaterial.emissive.setHex(bPhase === 2 ? 0xdc2626 : 0xd97706);
          rig.coreMaterial.emissiveIntensity = bPhase === 2 ? 1.65 : 1.35;
        }

        // 5. State & Attack Choreography + Spatial Floor Telegraphs
        rig.telegraphDiscMaterial.opacity = 0;
        rig.telegraphRingMaterial.opacity = 0;

        const progress =
          enemy.stateDuration > 0
            ? Math.max(0, Math.min(1, 1 - enemy.stateTimer / enemy.stateDuration))
            : 0;

        if (bState === 'dormant') {
          const wakeRatio = progress;
          rig.bodyGroup.position.y = -0.26 * (1 - wakeRatio);
          rig.bodyGroup.rotation.set(0.24 * (1 - wakeRatio), 0, 0);
          if (rig.torsoPivot) {
            rig.torsoPivot.rotation.set(0.18 * (1 - wakeRatio), 0, 0);
          }
          rig.weaponPivot.rotation.set(0.32 * (1 - wakeRatio), 0, 0);
          rig.secondaryPivot.rotation.set(0.28 * (1 - wakeRatio), 0, 0);
          rig.telegraphRingMaterial.color.setHex(0xf59e0b);
          rig.telegraphRingMaterial.opacity = 0.55 * (1 - wakeRatio * 0.5);
        } else if (bState === 'phase_transition') {
          rig.bodyGroup.position.y = Math.sin(progress * Math.PI) * 0.16;
          rig.bodyGroup.rotation.set(-0.22, 0, Math.sin(world.elapsedTime * 22) * 0.06);
          if (rig.torsoPivot) {
            rig.torsoPivot.rotation.set(-0.28, Math.sin(progress * Math.PI * 2) * 0.22, 0);
          }
          rig.weaponPivot.rotation.set(-1.15, -0.38, 0.35);
          rig.secondaryPivot.rotation.set(-1.05, 0.42, -0.35);
          rig.telegraphDiscMaterial.color.setHex(0xef4444);
          rig.telegraphDiscMaterial.opacity = 0.32;
          rig.telegraphDisc.scale.setScalar(0.5 + progress * 0.7);
          rig.telegraphRingMaterial.color.setHex(0xef4444);
          rig.telegraphRingMaterial.opacity = 0.92;
          this.syncTelegraphShader(rig, true, progress, 0xef4444, 0.85, world.elapsedTime);
        } else if (bState === 'telegraph') {
          const locked = Boolean(boss?.telegraphLocked);
          const teleColor = locked ? 0xef4444 : 0xf59e0b;

          if (bAttack === 'vector_ram') {
            const tv = computeBossTelegraphVisuals(
              bAttack,
              progress,
              locked,
              this.reducedMotion
            );
            if (rig.ramLaneGroup && rig.ramLaneFillMat && rig.ramLaneBorderMat) {
              rig.ramLaneGroup.visible = true;
              rig.ramLaneGroup.position.set(0, 0.028, 0);
              rig.ramLaneFillMat.color.setHex(tv.primaryHex);
              rig.ramLaneFillMat.opacity = 0.14 + tv.progress * 0.2;
              rig.ramLaneBorderMat.color.setHex(tv.edgeHex);
              rig.ramLaneBorderMat.opacity = tv.borderOpacity;
            }
            if (rig.ramLaneShaderMat) {
              rig.ramLaneShaderMat.uniforms.uProgress.value = tv.progress;
              rig.ramLaneShaderMat.uniforms.uTime.value = world.elapsedTime;
              rig.ramLaneShaderMat.uniforms.uOpacity.value = tv.fillOpacity;
              rig.ramLaneShaderMat.uniforms.uLocked.value = tv.locked ? 1 : 0;
              rig.ramLaneShaderMat.uniforms.uChevronSpeed.value = tv.chevronSpeed;
              rig.ramLaneShaderMat.uniforms.uReducedMotion.value = this.reducedMotion ? 1 : 0;
              (rig.ramLaneShaderMat.uniforms.uColor.value as THREE.Color).setHex(tv.primaryHex);
            }
            rig.bodyGroup.position.y = -0.1 * progress;
            rig.bodyGroup.rotation.set(0.24 * progress, 0, 0);
            if (rig.torsoPivot) {
              rig.torsoPivot.rotation.set(0.22 * progress, 0.15 * progress, 0);
            }
            rig.weaponPivot.rotation.set(0.45 * progress, 0.25 * progress, -0.15 * progress);
            rig.secondaryPivot.rotation.set(-0.45 * progress, -0.35 * progress, 0.2 * progress);
          } else if (bAttack === 'helical_sweep') {
            const tv = computeBossTelegraphVisuals(
              bAttack,
              progress,
              locked,
              this.reducedMotion
            );
            if (rig.sweepSectorGroup && rig.sweepSectorFillMat && rig.sweepSectorRimMat) {
              rig.sweepSectorGroup.visible = true;
              rig.sweepSectorFillMat.color.setHex(tv.primaryHex);
              rig.sweepSectorFillMat.opacity = 0.14 + tv.progress * 0.18;
              rig.sweepSectorRimMat.color.setHex(tv.edgeHex);
              rig.sweepSectorRimMat.opacity = tv.borderOpacity;
            }
            if (rig.sweepSectorShaderMat) {
              rig.sweepSectorShaderMat.uniforms.uProgress.value = tv.progress;
              rig.sweepSectorShaderMat.uniforms.uTime.value = world.elapsedTime;
              rig.sweepSectorShaderMat.uniforms.uOpacity.value = tv.fillOpacity;
              rig.sweepSectorShaderMat.uniforms.uLocked.value = tv.locked ? 1 : 0;
              rig.sweepSectorShaderMat.uniforms.uReducedMotion.value = this.reducedMotion ? 1 : 0;
              (rig.sweepSectorShaderMat.uniforms.uColor.value as THREE.Color).setHex(tv.primaryHex);
            }
            rig.bodyGroup.position.y = -0.06 * progress;
            rig.bodyGroup.rotation.set(0.08 * progress, 0, -0.08 * progress);
            if (rig.torsoPivot) {
              rig.torsoPivot.rotation.set(-0.1 * progress, -0.72 * progress, 0.12 * progress);
            }
            rig.weaponPivot.rotation.set(0.25 * progress, 0.2 * progress, 0);
            rig.secondaryPivot.rotation.set(
              -0.42 * progress,
              -1.28 * progress,
              -0.28 * progress
            );
          } else {
            // anchor_slam telegraph: inner slam disc (base radius = innerRadius 3.4m) + outer shockwave ring preview (base radius = 1.0m)
            rig.telegraphDisc.scale.setScalar(0.25 + progress * 0.75);
            rig.telegraphDiscMaterial.color.setHex(0xef4444);
            rig.telegraphDiscMaterial.opacity = 0.22 + progress * 0.32;
            rig.telegraphRingMaterial.color.setHex(teleColor);
            rig.telegraphRingMaterial.opacity = 0.65 + progress * 0.35;
            this.syncTelegraphShader(rig, true, progress, teleColor, 0.78 + progress * 0.2, world.elapsedTime);

            if (rig.slamShockwaveRing && rig.slamShockwaveMat) {
              rig.slamShockwaveRing.visible = true;
              const outerMax =
                bPhase === 2
                  ? GAME_CONFIG.boss.attacks.anchor_slam.outerRadiusP2
                  : GAME_CONFIG.boss.attacks.anchor_slam.outerRadiusP1;
              rig.slamShockwaveRing.scale.setScalar(outerMax);
              rig.slamShockwaveMat.color.setHex(0xf59e0b);
              rig.slamShockwaveMat.opacity = 0.28 + progress * 0.35;
            }

            rig.bodyGroup.position.y = -0.08 * progress;
            rig.bodyGroup.rotation.set(-0.22 * progress, 0, 0);
            if (rig.torsoPivot) {
              rig.torsoPivot.rotation.set(-0.28 * progress, -0.35 * progress, 0.14 * progress);
            }
            rig.weaponPivot.rotation.set(-1.58 * progress, -0.28 * progress, 0.24 * progress);
            rig.secondaryPivot.rotation.set(-0.65 * progress, 0.28 * progress, -0.22 * progress);
          }
        } else if (bState === 'attack') {
          if (bAttack === 'vector_ram') {
            if (rig.ramLaneGroup && rig.ramLaneFillMat && rig.ramLaneBorderMat) {
              const traveled = boss
                ? Math.hypot(boss.x - boss.attackOriginX, boss.z - boss.attackOriginZ)
                : 0;
              rig.ramLaneGroup.visible = true;
              rig.ramLaneGroup.position.set(0, 0.028, -traveled);
              rig.ramLaneFillMat.color.setHex(0xef4444);
              rig.ramLaneFillMat.opacity = 0.24 * (1 - progress * 0.6);
              rig.ramLaneBorderMat.color.setHex(0xffffff);
              rig.ramLaneBorderMat.opacity = 0.85 * (1 - progress * 0.5);
            }
            if (rig.ramLaneShaderMat) {
              rig.ramLaneShaderMat.uniforms.uProgress.value = 1;
              rig.ramLaneShaderMat.uniforms.uTime.value = world.elapsedTime;
              rig.ramLaneShaderMat.uniforms.uOpacity.value = 0.85 * (1 - progress * 0.55);
              rig.ramLaneShaderMat.uniforms.uLocked.value = 1;
              rig.ramLaneShaderMat.uniforms.uReducedMotion.value = this.reducedMotion ? 1 : 0;
              (rig.ramLaneShaderMat.uniforms.uColor.value as THREE.Color).setHex(0xef4444);
            }
            rig.bodyGroup.position.y = -0.06;
            rig.bodyGroup.rotation.set(0.34, 0, 0);
            if (rig.torsoPivot) {
              rig.torsoPivot.rotation.set(0.28, 0.22, 0);
            }
            rig.weaponPivot.rotation.set(0.65, 0.35, -0.18);
            rig.secondaryPivot.rotation.set(0.45, -0.25, 0.15);
          } else if (bAttack === 'helical_sweep') {
            if (rig.sweepSectorGroup && rig.sweepSectorFillMat && rig.sweepSectorRimMat) {
              rig.sweepSectorGroup.visible = true;
              rig.sweepSectorFillMat.color.setHex(0xef4444);
              rig.sweepSectorFillMat.opacity = 0.28 * (1 - progress * 0.5);
              rig.sweepSectorRimMat.color.setHex(0xffffff);
              rig.sweepSectorRimMat.opacity = 0.92 * (1 - progress * 0.4);
            }
            if (rig.sweepSectorShaderMat) {
              rig.sweepSectorShaderMat.uniforms.uProgress.value = 1;
              rig.sweepSectorShaderMat.uniforms.uTime.value = world.elapsedTime;
              rig.sweepSectorShaderMat.uniforms.uOpacity.value = 0.88 * (1 - progress * 0.5);
              rig.sweepSectorShaderMat.uniforms.uLocked.value = 1;
              rig.sweepSectorShaderMat.uniforms.uReducedMotion.value = this.reducedMotion ? 1 : 0;
              (rig.sweepSectorShaderMat.uniforms.uColor.value as THREE.Color).setHex(0xef4444);
            }
            const sweepRatio = Math.min(1, progress * 1.35);
            rig.bodyGroup.position.y = -0.04;
            rig.bodyGroup.rotation.set(0.18, 0, 0.1 * sweepRatio);
            if (rig.torsoPivot) {
              rig.torsoPivot.rotation.set(0.16, -0.72 + sweepRatio * 1.58, 0);
            }
            rig.weaponPivot.rotation.set(0.38, -0.2, 0.15);
            rig.secondaryPivot.rotation.set(
              0.24,
              -1.28 + sweepRatio * 2.55,
              0.22
            );
          } else {
            // anchor_slam impact + expanding temporal shockwave ring
            rig.telegraphDisc.scale.setScalar(1);
            rig.telegraphDiscMaterial.color.setHex(0xef4444);
            rig.telegraphDiscMaterial.opacity = 0.48 * (1 - progress);
            rig.telegraphRingMaterial.color.setHex(0xffffff);
            rig.telegraphRingMaterial.opacity = 0.85 * (1 - progress);
            this.syncTelegraphShader(rig, true, 1, 0xef4444, 0.82 * (1 - progress), world.elapsedTime);

            if (rig.slamShockwaveRing && rig.slamShockwaveMat && boss?.shockwaveActive) {
              rig.slamShockwaveRing.visible = true;
              rig.slamShockwaveRing.scale.setScalar(Math.max(0.25, boss.shockwaveRadius));
              rig.slamShockwaveMat.color.setHex(0xef4444);
              rig.slamShockwaveMat.opacity = 0.92;
            }

            rig.bodyGroup.position.y = -0.14;
            rig.bodyGroup.rotation.set(0.32, 0, 0);
            if (rig.torsoPivot) {
              rig.torsoPivot.rotation.set(0.38, 0.34, -0.14);
            }
            rig.weaponPivot.rotation.set(0.95, 0.22, -0.16);
            rig.secondaryPivot.rotation.set(0.42, -0.28, 0.18);
          }
        } else if (bState === 'recovery' || bState === 'staggered') {
          const isStagger = bState === 'staggered';
          rig.telegraphRingMaterial.color.setHex(0xffffff);
          rig.telegraphRingMaterial.opacity = 0.48;
          rig.bodyGroup.position.y = isStagger ? -0.12 : -0.05;
          rig.bodyGroup.rotation.set(
            isStagger ? -0.24 : 0.2,
            0,
            isStagger ? Math.sin(world.elapsedTime * 18) * 0.08 : 0
          );
          if (rig.torsoPivot) {
            rig.torsoPivot.rotation.set(
              isStagger ? -0.2 : 0.22,
              isStagger ? Math.cos(world.elapsedTime * 14) * 0.14 : 0.18,
              0
            );
          }
          // Arms drop wide open to expose the unshielded Chrono-Reactor Core
          rig.weaponPivot.rotation.set(0.52, -0.45, 0.28);
          rig.secondaryPivot.rotation.set(0.48, 0.45, -0.28);
        } else {
          // Pursue / Heavy Stomp
          const stomp = isMoving
            ? Math.pow(Math.abs(Math.sin(walkCycle)), 1.6) * 0.085
            : Math.sin(world.elapsedTime * 2.2) * 0.018;
          rig.bodyGroup.position.y = stomp;
          rig.bodyGroup.rotation.set(
            isMoving ? 0.08 : 0.02,
            0,
            isMoving ? Math.cos(walkCycle) * 0.055 : 0
          );
          if (rig.torsoPivot) {
            rig.torsoPivot.rotation.set(
              isMoving ? 0.06 : Math.sin(world.elapsedTime * 2.2) * 0.02,
              isMoving ? -Math.sin(walkCycle) * 0.16 : 0,
              0
            );
          }
          const guardRatio = guardRecoil / 0.22;
          rig.weaponPivot.rotation.set(
            (isMoving ? Math.sin(walkCycle) * 0.18 : -0.1) - 0.18 * guardRatio,
            0.12,
            0
          );
          rig.secondaryPivot.rotation.set(
            (isMoving ? -Math.sin(walkCycle) * 0.18 : -0.12) - 0.18 * guardRatio,
            -0.16,
            0
          );
        }

        if (enemy.hitFlashTimer > 0) {
          const hitRatio = Math.min(1, enemy.hitFlashTimer / 0.14);
          rig.bodyGroup.rotation.x -= 0.18 * hitRatio;
          if (rig.torsoPivot) {
            rig.torsoPivot.rotation.x -= 0.16 * hitRatio;
          }
        }
        continue;
      }

      const enemySpeed = Math.hypot(enemy.vx, enemy.vz);
      const isEnemyMoving =
        (enemy.aiState === 'pursue' || enemy.aiState === 'idle') && enemySpeed > 0.12;
      const walkCycle =
        world.elapsedTime * (enemy.archetype === 'scrapper' ? 10.6 : 4.8) +
        enemy.id.charCodeAt(0);

      // Leg & Shin Articulation
      if (rig.leftLegPivot && rig.rightLegPivot) {
        const legAmp = enemy.archetype === 'scrapper' ? 0.54 : 0.38;
        const legSwing = isEnemyMoving ? Math.sin(walkCycle) * legAmp : 0;
        rig.leftLegPivot.rotation.x = legSwing;
        rig.rightLegPivot.rotation.x = -legSwing;

        if (rig.leftShinPivot && rig.rightShinPivot) {
          if (
            enemy.archetype === 'bastion' ||
            enemy.archetype === 'aegis_sentinel'
          ) {
            rig.leftShinPivot.rotation.x = isEnemyMoving
              ? Math.max(0.06, -Math.sin(walkCycle + 0.5)) * 0.48
              : 0.08;
            rig.rightShinPivot.rotation.x = isEnemyMoving
              ? Math.max(0.06, Math.sin(walkCycle + 0.5)) * 0.48
              : 0.08;
          } else {
            // Scrapper reverse-jointed digitigrade spring knee
            rig.leftShinPivot.rotation.x = isEnemyMoving
              ? -0.22 + Math.sin(walkCycle + 0.7) * 0.38
              : -0.18;
            rig.rightShinPivot.rotation.x = isEnemyMoving
              ? -0.22 - Math.sin(walkCycle + 0.7) * 0.38
              : -0.18;
          }
        }
      }

      if (enemy.archetype === 'scout' || enemy.archetype === 'null_weaver') {
        const hoverPhase = world.elapsedTime * 3.8 + enemy.x * 0.4;
        rig.bodyGroup.position.y =
          Math.sin(hoverPhase) * 0.14 + Math.cos(hoverPhase * 1.9) * 0.04;
        rig.bodyGroup.rotation.x = isEnemyMoving ? 0.14 : Math.sin(hoverPhase * 0.7) * 0.04;
        rig.bodyGroup.rotation.z = Math.cos(hoverPhase * 0.85) * 0.06;
        const gyroRate =
          enemy.aiState === 'telegraph' ? 4.8 : enemy.aiState === 'recovery' ? 0.45 : 1.65;
        rig.secondaryPivot.rotation.y += dt * gyroRate;
      } else if (
        enemy.archetype === 'bastion' ||
        enemy.archetype === 'eraser' ||
        enemy.archetype === 'aegis_sentinel'
      ) {
        // BASTION-09: Heavy, deliberate hydraulic stomp, fortified shield brace, high-mass weight transfer
        const stompBounce = isEnemyMoving
          ? Math.pow(Math.abs(Math.sin(walkCycle)), 1.7) * 0.072
          : Math.sin(world.elapsedTime * 2.1) * 0.014;
        rig.bodyGroup.position.y = stompBounce;
        rig.bodyGroup.rotation.z = isEnemyMoving ? Math.cos(walkCycle) * 0.052 : 0;
        rig.bodyGroup.rotation.x = isEnemyMoving ? 0.07 : 0.02;

        if (rig.torsoPivot) {
          rig.torsoPivot.rotation.set(
            isEnemyMoving ? 0.06 : Math.sin(world.elapsedTime * 2.1) * 0.015,
            isEnemyMoving ? -Math.sin(walkCycle) * 0.14 : 0.12,
            0
          );
        }
        if (rig.headPivot) {
          rig.headPivot.rotation.y = isEnemyMoving ? Math.sin(walkCycle) * 0.08 : -0.08;
        }

        // Aegis Tower Shield posture: braced forward in guard, swung wide open during recovery/stagger, recoils on blocked hit
        const guardRecoilRatio = guardRecoil / 0.22;
        if (enemy.aiState === 'recovery' || enemy.aiState === 'staggered') {
          rig.secondaryPivot.rotation.set(0.14, -0.78, -0.18);
        } else if (enemy.aiState === 'telegraph') {
          rig.secondaryPivot.rotation.set(-0.08, -0.46, 0);
        } else {
          rig.secondaryPivot.rotation.set(
            -0.18 * guardRecoilRatio,
            0.28 - 0.22 * guardRecoilRatio,
            0.08 * guardRecoilRatio
          );
        }
      } else {
        // SCRAPPER-X2: Agile low-slung digitigrade stalk, twitchy head scan, counter-balancing tail whip
        const prowlWave = Math.sin(walkCycle);
        const prowlCos = Math.cos(walkCycle);
        rig.bodyGroup.rotation.x = isEnemyMoving ? 0.22 : 0.08;
        rig.bodyGroup.rotation.z = isEnemyMoving ? prowlCos * 0.085 : 0;
        rig.bodyGroup.position.y = isEnemyMoving
          ? Math.abs(prowlWave) * 0.075
          : Math.sin(world.elapsedTime * 4.2) * 0.024;
        rig.secondaryPivot.rotation.y = isEnemyMoving
          ? prowlCos * 0.34
          : Math.sin(world.elapsedTime * 2.8) * 0.16;

        if (rig.torsoPivot) {
          rig.torsoPivot.rotation.set(
            isEnemyMoving ? 0.12 : Math.sin(world.elapsedTime * 4.2) * 0.03,
            isEnemyMoving ? -prowlWave * 0.26 : Math.cos(world.elapsedTime * 2.6) * 0.08,
            isEnemyMoving ? prowlCos * 0.06 : 0
          );
        }
        if (rig.headPivot) {
          rig.headPivot.rotation.set(
            isEnemyMoving ? -0.1 : 0,
            Math.sin(world.elapsedTime * 5.5 + i) * 0.14,
            0
          );
        }
      }

      const isResonanceMarked =
        world.resonance?.activeMark?.enemyId === enemy.id &&
        world.resonance.activeMark.remainingTime > 0;
      rig.coreRimMaterial.opacity = isResonanceMarked ? 0.78 : 0;
      if (enemy.hitFlashTimer > 0) {
        rig.coreMaterial.color.setHex(0xffffff);
        rig.coreMaterial.emissive.setHex(0xffffff);
        rig.coreMaterial.emissiveIntensity = 2.4;
      } else if (enemy.aiState === 'recovery' || enemy.aiState === 'staggered') {
        rig.coreMaterial.color.setHex(0xffffff);
        rig.coreMaterial.emissive.setHex(0xf8fafc);
        rig.coreMaterial.emissiveIntensity = 1.9;
        rig.coreRimMaterial.opacity = 0.88;
      } else if (isResonanceMarked) {
        rig.coreMaterial.color.setHex(0xe0f2fe);
        rig.coreMaterial.emissive.setHex(0x22d3ee);
        rig.coreMaterial.emissiveIntensity = 2.0;
      } else if (enemy.aiState === 'telegraph') {
        rig.coreMaterial.color.setHex(0xf59e0b);
        rig.coreMaterial.emissive.setHex(0xf59e0b);
        rig.coreMaterial.emissiveIntensity = 1.7;
      } else if (enemy.aiState === 'attack') {
        rig.coreMaterial.color.setHex(0xef4444);
        rig.coreMaterial.emissive.setHex(0xdc2626);
        rig.coreMaterial.emissiveIntensity = 1.9;
      } else {
        if (enemy.archetype === 'bastion') {
          rig.coreMaterial.color.setHex(0xf59e0b);
          rig.coreMaterial.emissive.setHex(0xd97706);
        } else if (enemy.archetype === 'scrapper') {
          rig.coreMaterial.color.setHex(0xf97316);
          rig.coreMaterial.emissive.setHex(0xea580c);
        } else {
          rig.coreMaterial.color.setHex(0x22d3ee);
          rig.coreMaterial.emissive.setHex(0x06b6d4);
        }
        rig.coreMaterial.emissiveIntensity = 1.28;
      }

      // Telegraph ground rings & archetype-specific weapon windup / strike / recovery poses
      if (enemy.aiState === 'telegraph') {
        const progress =
          enemy.stateDuration > 0
            ? Math.max(0, Math.min(1, 1 - enemy.stateTimer / enemy.stateDuration))
            : 0;
        const isLocked = Boolean(enemy.telegraphLocked) || progress >= 0.55;
        const shaderHex = isLocked ? 0xef4444 : 0xf59e0b;
        rig.telegraphDiscMaterial.opacity = 0.16 + progress * 0.28;
        rig.telegraphDisc.scale.setScalar(Math.max(0.1, progress));
        rig.telegraphRingMaterial.color.setHex(shaderHex);
        rig.telegraphRingMaterial.opacity = 0.58 + progress * 0.4;
        this.syncTelegraphShader(rig, true, progress, shaderHex, 0.72 + progress * 0.25, world.elapsedTime);

        if (enemy.archetype === 'bastion' || enemy.archetype === 'aegis_sentinel') {
          // Bastion / Sentinel raises heavy shock-maul high overhead while planting legs
          rig.bodyGroup.position.y = -0.04 * progress;
          rig.bodyGroup.rotation.x = -0.18 * progress;
          if (rig.torsoPivot) {
            rig.torsoPivot.rotation.set(-0.22 * progress, -0.42 * progress, 0.1 * progress);
          }
          rig.weaponPivot.rotation.set(-1.32 * progress, -0.32 * progress, 0.24 * progress);
        } else if (enemy.archetype === 'scrapper') {
          // Scrapper coils low and spreads twin mantis blades wide
          rig.bodyGroup.position.y = -0.14 * progress;
          rig.bodyGroup.rotation.x = -0.22 * progress;
          if (rig.torsoPivot) {
            rig.torsoPivot.rotation.set(-0.18 * progress, 0, 0);
          }
          if (rig.leftArmPivot && rig.rightArmPivot) {
            rig.leftArmPivot.rotation.set(-0.92 * progress, 0.58 * progress, -0.36 * progress);
            rig.rightArmPivot.rotation.set(-0.92 * progress, -0.58 * progress, 0.36 * progress);
          } else {
            rig.weaponPivot.rotation.set(-0.85 * progress, 0, 0);
          }
        } else {
          rig.weaponPivot.rotation.set(-0.24 * progress, 0, 0);
        }

        if (rig.laserSightMaterial) {
          rig.laserSightMaterial.opacity = 0.45 + progress * 0.5;
          rig.laserSightMaterial.color.setHex(isLocked ? 0xef4444 : 0xf59e0b);
        }
      } else if (enemy.aiState === 'attack') {
        rig.telegraphDiscMaterial.opacity = 0.46;
        rig.telegraphRingMaterial.opacity = 0.92;
        this.syncTelegraphShader(rig, true, 1, 0xef4444, 0.88, world.elapsedTime);
        if (enemy.archetype === 'bastion' || enemy.archetype === 'aegis_sentinel') {
          // Bastion commits to heavy downward ground-slam
          rig.bodyGroup.position.y = -0.06;
          rig.bodyGroup.rotation.x = 0.28;
          if (rig.torsoPivot) {
            rig.torsoPivot.rotation.set(0.32, 0.44, -0.12);
          }
          rig.weaponPivot.rotation.set(0.88, 0.22, -0.18);
        } else if (enemy.archetype === 'scrapper') {
          // Scrapper lunges forward with twin scissor-cross slash
          rig.bodyGroup.position.y = 0.04;
          rig.bodyGroup.rotation.x = 0.34;
          if (rig.torsoPivot) {
            rig.torsoPivot.rotation.set(0.28, 0, 0);
          }
          if (rig.leftArmPivot && rig.rightArmPivot) {
            rig.leftArmPivot.rotation.set(0.76, -0.64, 0.28);
            rig.rightArmPivot.rotation.set(0.76, 0.64, -0.28);
          } else {
            rig.weaponPivot.rotation.set(0.74, 0, 0);
          }
        } else {
          rig.bodyGroup.rotation.x = -0.18;
          rig.weaponPivot.rotation.set(0.2, 0, 0);
        }
        if (rig.laserSightMaterial) {
          rig.laserSightMaterial.opacity = 0.95;
          rig.laserSightMaterial.color.setHex(0xef4444);
        }
      } else if (enemy.aiState === 'recovery' || enemy.aiState === 'staggered') {
        rig.telegraphDiscMaterial.opacity = 0;
        rig.telegraphRingMaterial.opacity = 0.4;
        rig.telegraphRingMaterial.color.setHex(0xffffff);
        const isStagger = enemy.aiState === 'staggered';
        rig.bodyGroup.rotation.x = isStagger ? -0.22 : 0.18;
        rig.bodyGroup.rotation.z = isStagger
          ? Math.sin(world.elapsedTime * 18) * 0.09
          : 0;
        if (rig.torsoPivot) {
          rig.torsoPivot.rotation.set(
            isStagger ? -0.18 : 0.22,
            isStagger ? Math.cos(world.elapsedTime * 14) * 0.14 : 0.24,
            0
          );
        }
        if (enemy.archetype === 'scrapper' && rig.leftArmPivot && rig.rightArmPivot) {
          rig.leftArmPivot.rotation.set(0.42, 0.38, -0.25);
          rig.rightArmPivot.rotation.set(0.42, -0.38, 0.25);
        } else {
          rig.weaponPivot.rotation.set(0.52, 0.15, 0);
        }
        if (rig.laserSightMaterial) rig.laserSightMaterial.opacity = 0;
      } else {
        rig.telegraphDiscMaterial.opacity = 0;
        rig.telegraphRingMaterial.opacity = 0;
        rig.telegraphRingMaterial.color.setHex(0xef4444);
        if (enemy.archetype === 'scrapper' && rig.leftArmPivot && rig.rightArmPivot) {
          const weave = isEnemyMoving
            ? Math.sin(walkCycle) * 0.32
            : Math.sin(world.elapsedTime * 3.8) * 0.08;
          rig.leftArmPivot.rotation.set(-0.18 + weave, 0.16, -0.1);
          rig.rightArmPivot.rotation.set(-0.18 - weave, -0.16, 0.1);
        } else {
          rig.weaponPivot.rotation.set(
            isEnemyMoving ? Math.sin(walkCycle) * 0.16 : 0,
            0,
            0
          );
        }
        if (rig.laserSightMaterial) rig.laserSightMaterial.opacity = 0;
      }

      // Hit-flash & guard recoil jolt on enemy chassis
      if (guardRecoil > 0) {
        rig.bodyGroup.rotation.x -= 0.14 * Math.min(1, guardRecoil / 0.22);
      }
      if (enemy.hitFlashTimer > 0) {
        const hitRatio = Math.min(1, enemy.hitFlashTimer / 0.14);
        rig.bodyGroup.rotation.x -= 0.2 * hitRatio;
        if (rig.torsoPivot) {
          rig.torsoPivot.rotation.x -= 0.18 * hitRatio;
        }
      }
    }

    if (this.staggerBeaconSlots) {
      for (let i = staggerBeaconUsed; i < this.staggerBeaconSlots.length; i++) {
        this.staggerBeaconSlots[i].group.visible = false;
      }
    }

    // Phase 14 & Phase 21: Sync Pooled Pulsecaster & Rail Lance Projectile Meshes
    const projs = world.projectiles ?? [];
    for (let i = 0; i < this.projectileRigs.length; i++) {
      const pRig = this.projectileRigs[i];
      const proj = projs[i];
      if (!proj || !proj.active) {
        pRig.group.visible = false;
        continue;
      }
      pRig.group.visible = true;
      pRig.group.position.set(proj.x, 1.15, proj.z);
      pRig.group.rotation.y = proj.rotationY;
      const isRailProj =
        proj.attackMode === 'rail_light' || proj.attackMode === 'rail_heavy';
      if (proj.isHeavy) {
        pRig.group.scale.set(
          isRailProj ? 1.55 : 1.35,
          isRailProj ? 1.55 : 1.35,
          isRailProj ? 3.8 : 1.75
        );
        pRig.coreMat.color.setHex(0xffffff);
        pRig.haloMat.color.setHex(
          isRailProj
            ? 0xe0f2fe
            : proj.owner === 'echo'
              ? 0x38bdf8
              : proj.isEmpowered
                ? 0xf59e0b
                : 0x22d3ee
        );
        pRig.haloMat.opacity = isRailProj ? 0.88 : 0.68;
      } else {
        pRig.group.scale.set(
          isRailProj ? 1.18 : 1,
          isRailProj ? 1.18 : 1,
          isRailProj ? 2.6 : 1
        );
        pRig.coreMat.color.setHex(
          isRailProj ? 0xffffff : proj.owner === 'echo' ? 0xbae6fd : 0xe0f2fe
        );
        pRig.haloMat.color.setHex(
          isRailProj ? 0x22d3ee : proj.owner === 'echo' ? 0x38bdf8 : 0x22d3ee
        );
        pRig.haloMat.opacity = isRailProj ? 0.72 : 0.48;
      }
    }

    if (this.dashGhostSpawnCooldown > 0) {
      this.dashGhostSpawnCooldown = Math.max(0, this.dashGhostSpawnCooldown - dt);
    }
    this.updateSlashRibbonsAndGhosts(dt);
    this.updateParticles(dt);

    this.updateCameraPresentation(world, aimYaw, aimPitch, dt);

    if (shouldRender && this.renderer && !this.webglContextLost) {
      if (this.bloomEnabled && this.composer) {
        this.composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }
    }
    this.updateCallouts(dt, world.appState);
    this.updateLockOnReticle(world, dt);
  }

  private updateCameraPresentation(
    world: WorldState,
    aimYaw: number,
    aimPitch: number,
    dt: number
  ): void {
    const p = world.player;
    if (world.appState === 'title') {
      const tourDamp = 1 - Math.exp(-8 * dt);
      if (!this.reducedMotion) this.titleTourAngle += dt * 0.22;
      const tourX = p.x + Math.sin(this.titleTourAngle) * 5.2 + 2.2;
      const tourZ = p.z + Math.cos(this.titleTourAngle) * 4.5 + 3.5;
      _desiredCamPos.set(tourX, 3.6, tourZ);
      _lookAtTarget.set(p.x - 1.2, 1.45, p.z - 3.5);
      this.currentCamPos.lerp(_desiredCamPos, tourDamp);
      this.currentLookAt.lerp(_lookAtTarget, tourDamp);
    } else {
      // Smoothly follow Sera's torso anchor while keeping rotation 100% immediate
      _targetAnchor.set(p.x, GAME_CONFIG.camera.anchorHeight, p.z);
      if (this.camAnchor.distanceToSquared(_targetAnchor) > 25) {
        this.camAnchor.copy(_targetAnchor);
      } else {
        const followAlpha = 1 - Math.exp(-GAME_CONFIG.camera.followResponse * dt);
        this.camAnchor.lerp(_targetAnchor, followAlpha);
      }

      const fwdX = Math.sin(aimYaw);
      const fwdZ = Math.cos(aimYaw);
      const cosPitch = Math.cos(aimPitch);
      const sinPitch = Math.sin(aimPitch);

      const dirX = -fwdX * cosPitch;
      const dirY = sinPitch;
      const dirZ = -fwdZ * cosPitch;

      const clearDist = computeCameraClearDistance(
        this.camAnchor.x,
        this.camAnchor.y,
        this.camAnchor.z,
        dirX,
        dirY,
        dirZ,
        GAME_CONFIG.camera.distance * (this.camera.aspect < 0.75 ? 1.4 : 1),
        world.obstacles,
        GAME_CONFIG.arena.radius
      );

      // Pull in immediately if an obstacle blocks line-of-sight; recover smoothly when clear
      if (clearDist < this.currentCamDist) {
        this.currentCamDist = clearDist;
      } else {
        const recoverAlpha = 1 - Math.exp(-GAME_CONFIG.camera.collisionRecoverResponse * dt);
        this.currentCamDist += (clearDist - this.currentCamDist) * recoverAlpha;
      }

      this.currentCamPos.set(
        this.camAnchor.x + dirX * this.currentCamDist,
        Math.max(0.45, this.camAnchor.y + dirY * this.currentCamDist),
        this.camAnchor.z + dirZ * this.currentCamDist
      );

      this.currentLookAt.set(
        this.camAnchor.x + fwdX * GAME_CONFIG.camera.lookAheadDistance,
        this.camAnchor.y - sinPitch * 0.4,
        this.camAnchor.z + fwdZ * GAME_CONFIG.camera.lookAheadDistance
      );
    }

    // Apply decaying trauma * trauma camera shake
    const shakeAllowed = !this.reducedMotion && this.cameraShakeEnabled !== false;
    const shakeMag = shakeAllowed ? world.cameraTrauma * world.cameraTrauma * 0.34 : 0;
    const shakeX = shakeMag > 0.001 ? (Math.random() * 2 - 1) * shakeMag : 0;
    const shakeY = shakeMag > 0.001 ? (Math.random() * 2 - 1) * shakeMag : 0;

    if (typeof this.camera.updateProjectionMatrix === 'function') {
      const baseFov = this.camera.aspect < 0.75 ? 60 : 52;
      if (this.reducedMotion) {
        this.fovKick = 0;
        if (this.camera.fov !== baseFov) {
          this.camera.fov = baseFov;
          this.camera.updateProjectionMatrix();
        }
      } else {
        const adrTier = Math.min(5, Math.max(0, Math.floor(p.adrenalineScore ?? 0)));
        const speedFov = adrTier * 0.55 + (p.actionState === 'dodging' ? 2.2 : 0);
        if ((this.fovKick ?? 0) > 0.01) {
          this.fovKick = Math.max(0, (this.fovKick ?? 0) * Math.exp(-14 * dt));
        } else {
          this.fovKick = 0;
        }
        const targetFov = baseFov + speedFov + this.fovKick;
        const fovAlpha = 1 - Math.exp(-10 * dt);
        const nextFov = this.camera.fov + (targetFov - this.camera.fov) * fovAlpha;
        if (Math.abs(this.camera.fov - nextFov) > 0.02) {
          this.camera.fov = nextFov;
          this.camera.updateProjectionMatrix();
        }
      }
    }

    this.camera.position.set(
      this.currentCamPos.x + shakeX,
      this.currentCamPos.y + shakeY,
      this.currentCamPos.z
    );
    this.camera.lookAt(this.currentLookAt);
  }

  private syncTelegraphShader(
    rig: EnemyRig,
    visible: boolean,
    progress: number,
    colorHex: number,
    opacity: number,
    elapsedTime: number
  ): void {
    const disc = rig.telegraphShaderDisc;
    const mat = rig.telegraphShaderMat;
    if (!disc || !mat) return;
    if (!visible || opacity <= 0.01) {
      disc.visible = false;
      mat.uniforms.uOpacity.value = 0;
      return;
    }
    disc.visible = true;
    mat.uniforms.uProgress.value = progress;
    mat.uniforms.uTime.value = elapsedTime;
    mat.uniforms.uOpacity.value = opacity;
    mat.uniforms.uReducedMotion.value = this.reducedMotion ? 1 : 0;
    (mat.uniforms.uColor.value as THREE.Color).setHex(colorHex);
  }

  public resize(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.camera.aspect = width / height;
    this.camera.fov = this.camera.aspect < 0.75 ? 60 : 52;
    this.camera.updateProjectionMatrix();
    this.renderer?.setSize(width, height);
    this.composer?.setSize(width, height);
    this.bloomPass?.resolution.set(width, height);
  }

  public dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.attachCalloutLayer(null);
    this.attachLockOnElement(null);
    if (this.renderer?.domElement) {
      this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLostBound);
      this.renderer.domElement.removeEventListener(
        'webglcontextrestored',
        this.onContextRestoredBound
      );
      this.renderer.domElement.remove?.();
    }
    if (this.fallbackEl) {
      this.fallbackEl.remove?.();
      this.fallbackEl = null;
    }
    disposeMeshResources(this.scene);
    this.enemyRigs?.clear();
    this.enemyGuardRecoilTimers?.clear();
    this.shadowTex?.dispose?.();
    this.studioEnvTex?.dispose?.();
    this.scorchTex?.dispose?.();
    this.dustMoteTex?.dispose?.();
    this.pmremEnvTarget?.dispose();
    this.pmremEnvTarget = null;
    this.composer?.dispose();
    this.composer = null;
    this.bloomPass = null;
    this.renderer?.dispose();
  }
}
