import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
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
import { SENTINEL_PROTOCOL_SPECS } from './chrono-aegis.ts';
import {
  getEchoDoctrineSpec,
  normalizeEchoDoctrineId,
} from './echo-synergy.ts';
import {
  BOSS_ECHO_CORES,
  isBossCoreTranscended,
  isValidBossEchoCoreId,
  isWeaponAttunedToBossCore,
} from './boss-echo-cores.ts';
import { computeMasterySealModifiers } from './combat-mastery.ts';
import {
  buildArenaEnvironment,
  buildChapterEnvironment,
  createAutonomousCombatDroneRig,
  createBreachSealRig,
  createChronoFinisherRiftRig,
  createChronoPlateAndReceiverRig,
  createChronoStasisCoreRig,
  createDustMoteTexture,
  createEchoAfterimageGhost,
  createEchoPlayerRig,
  createEnemyRig,
  createEntryBoardingAirlockRig,
  createExpeditionTrailRig,
  createFieldRefitDroneRig,
  createHazardStripeTexture,
  createLysaHoloProjectorRig,
  createPhotoDroneRig,
  createRadialShadowTexture,
  createSafeRoomHubRig,
  createScorchDecalTexture,
  createSecretEchoVaultRig,
  createSectorTransitAirlockRig,
  createSeraPlayerRig,
  createSingularityGrenadeRig,
  createSovereignObeliskRig,
  createStudioEnvironmentTexture,
  type AutonomousCombatDroneRig,
  type BreachSealRig,
  type ChapterEnvironmentRig,
  type ChronoFinisherRiftRig,
  type ChronoPlateAndReceiverRig,
  type ChronoStasisCoreRig,
  type EchoAfterimageGhost,
  type EnemyRig,
  type EntryBoardingAirlockRig,
  type ExpeditionTrailRig,
  type FieldRefitDroneRig,
  type LysaHoloProjectorRig,
  type PhotoDroneRig,
  type PlayerRig,
  type SafeRoomHubRig,
  type SecretEchoVaultRig,
  type SectorTransitAirlockRig,
  type SingularityGrenadeRig,
  type SovereignObeliskRig,
} from './models.ts';
import { getHoloMemoryForChapter } from './chronicle-narrative.ts';
import { getSeraRigSkinDefinition } from './paradox-expansion.ts';
import {
  formatCombatCallouts,
  projectNdcToViewport,
  type CombatCalloutTone,
} from './tactical-hud.ts';
import {
  meshyAssetRegistry,
  type MeshyAssetSlotId,
} from './meshy-assets.ts';
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
import {
  computeDampAlpha,
  computeDirectionalDodgeTilt,
  computeOrganicBreath,
  computePropFloatMotion,
  computeSquashStretch,
  computeStrobeIntensity,
  dampScalar,
} from './animation-kinematics.ts';
import type {
  AppLocale,
  CameraSettings,
  CampaignChapterId,
  CelestialAtmosphereGrade,
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
const _droneUpVec = new THREE.Vector3(0, 1, 0);
const _droneDirVec = new THREE.Vector3();
const _astralCrownDummy = new THREE.Object3D();
const _astralCrownColor = new THREE.Color();

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
    if (object.geometry && !object.geometry.userData?.sharedAsset) {
      geometries.add(object.geometry);
    }
    const collectMaterial = (material: THREE.Material | undefined) => {
      if (!material) return;
      materials.add(material);
      const matRecord = material as unknown as Record<string, unknown>;
      for (let i = 0; i < MATERIAL_TEXTURE_SLOTS.length; i++) {
        const tex = matRecord[MATERIAL_TEXTURE_SLOTS[i]];
        if (tex instanceof THREE.Texture && !tex.userData?.sharedAsset) {
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
  mat: THREE.ShaderMaterial;
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
  private lastEchoDoctrineTint = '';
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

  // v2.7.0: 4-Slot Pooled Additive GLSL Plasma Shockwave Rings (zero-GC)
  private impactRingPool: Array<{
    mesh: THREE.Mesh;
    mat: THREE.ShaderMaterial;
    timer: number;
    duration: number;
    maxScale: number;
  }> = [];
  private impactRingNextIdx = 0;
  private impactRingMesh?: THREE.Mesh;
  private impactRingTimer = 0;
  private overchargeSparkCooldown = 0;
  // v2.8.0: 3D Orbital Atmospheric Motes & Live Twin-Sync Plasma Tether GLSL Shader
  private ambientMotesPoints?: THREE.Points;
  private ambientMotesMat?: THREE.ShaderMaterial;
  private twinSyncBeamMesh?: THREE.Mesh;
  private twinSyncBeamMat?: THREE.ShaderMaterial;
  // v2.9.0: Holographic Arena Floor Scan Pulse, Volumetric Ceiling Light Shafts & Diegetic Weakpoint Halo
  private arenaPulseMesh?: THREE.Mesh;
  private arenaPulseMat?: THREE.ShaderMaterial;
  private lightShaftsGroup?: THREE.Group;
  private lightShaftMat?: THREE.ShaderMaterial;
  private weakpointHaloMesh?: THREE.Mesh;
  private weakpointHaloMat?: THREE.ShaderMaterial;
  // v3.0.0: 3D Diegetic Chrono Nexus Constellation Mandala Aura beneath Sera when 2+ systems link
  private nexusAuraMesh?: THREE.Mesh;
  private nexusAuraMat?: THREE.ShaderMaterial;

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
  // v3.9.0: 6-slot Pose-Matched 3D Sera Holographic Afterimage Pool + 3D Chrono Clockwork Slip-Ring
  private playerAfterimagePool: Array<{
    active: boolean;
    age: number;
    maxAge: number;
    baseOpacity: number;
    ghost: EchoAfterimageGhost;
  }> = [];
  private playerAfterimageNextIdx = 0;
  private slipTrailSpawnCooldown = 0;
  private temporalSlipRingGroup?: THREE.Group;
  private temporalSlipOuterRing?: THREE.Mesh;
  private temporalSlipOuterMat?: THREE.MeshBasicMaterial;
  private temporalSlipInnerRing?: THREE.Mesh;
  private temporalSlipInnerMat?: THREE.MeshBasicMaterial;
  private temporalSlipTicksMesh?: THREE.InstancedMesh;
  private temporalSlipTicksMat?: THREE.MeshBasicMaterial;
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
  private gravityMineGroup: THREE.Group;
  private chronoSeverMesh: THREE.Mesh;
  private chronoSeverMat: THREE.MeshBasicMaterial;
  private chronoSeverWallMesh: THREE.Mesh;
  private chronoSeverWallMat: THREE.MeshBasicMaterial;
  private chronoSeverStrutsGroup: THREE.Group;
  private chronoSeverStrutMat: THREE.MeshBasicMaterial;
  private echoCollapseWaveMesh: THREE.Mesh;
  private echoCollapseWaveMat: THREE.MeshBasicMaterial;
  private echoCollapseCoreGroup: THREE.Group;
  private echoCollapsePetals: THREE.Group[] = [];
  private echoCollapseGyroA?: THREE.Mesh;
  private echoCollapseGyroB?: THREE.Mesh;
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
  private celestialAstrolabeOuterRing?: THREE.Mesh;
  private celestialAstrolabeInnerRing?: THREE.Mesh;
  private lysaHoloProjectorRig?: LysaHoloProjectorRig;
  private orbitalShuttles: THREE.Group[] = [];
  private orbitalDebris: THREE.Group[] = [];
  private blastStrobeMat?: THREE.MeshStandardMaterial;
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
  private artilleryZonesGroup?: THREE.Group;
  private artilleryZoneRigs: Array<{
    group: THREE.Group;
    outerRing: THREE.Mesh;
    fillDisc: THREE.Mesh;
    shellMesh: THREE.Mesh;
    ringMat: THREE.MeshBasicMaterial;
    discMat: THREE.MeshBasicMaterial;
    shellMat: THREE.MeshBasicMaterial;
  }> = [];
  private conductorTethersGroup?: THREE.Group;
  private conductorTetherRigs: Array<{
    group: THREE.Group;
    beamMesh: THREE.Mesh;
    beamMat: THREE.MeshBasicMaterial;
    allyHaloMesh: THREE.Mesh;
    allyHaloMat: THREE.MeshBasicMaterial;
    nodeGroup: THREE.Group;
  }> = [];
  private readonly _tetherVecA = new THREE.Vector3();
  private readonly _tetherVecB = new THREE.Vector3();
  private readonly _tetherMid = new THREE.Vector3();
  private readonly _tetherDir = new THREE.Vector3();
  private readonly _tetherUp = new THREE.Vector3(0, 1, 0);
  private readonly _tetherQuat = new THREE.Quaternion();
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
  private fragmentCachesGroup?: THREE.Group;
  private fragmentCacheRigs: Array<{
    group: THREE.Group;
    prismMesh: THREE.Mesh;
    prismMat: THREE.MeshBasicMaterial;
    ringMesh: THREE.Mesh;
    ringMat: THREE.MeshBasicMaterial;
    beamMesh: THREE.Mesh;
    beamMat: THREE.MeshBasicMaterial;
  }> = [];
  private sectorBeaconsGroup?: THREE.Group;
  private sectorBeaconRigs: Array<{
    group: THREE.Group;
    pylonMesh: THREE.Mesh;
    pylonMat: THREE.MeshStandardMaterial;
    haloMesh: THREE.Mesh;
    haloMat: THREE.MeshBasicMaterial;
    ringMesh: THREE.Mesh;
    ringMat: THREE.MeshBasicMaterial;
  }> = [];
  private chapterOrbitalCrownGroup: THREE.Group;
  private orbitalCrownOuterRing: THREE.Mesh;
  private orbitalCrownInnerRing: THREE.Mesh;
  private orbitalCrownMat: THREE.MeshBasicMaterial;
  private orbitalCrownInnerMat: THREE.MeshBasicMaterial;
  private floorConduitsGroup: THREE.Group;
  private floorConduitMat: THREE.MeshBasicMaterial;
  private temporalRiftGroup: THREE.Group;
  private temporalRiftRingMesh: THREE.Mesh;
  private temporalRiftRingMat: THREE.MeshBasicMaterial;
  private temporalRiftOuterTorus: THREE.Mesh;
  private temporalRiftOuterTorusMat: THREE.MeshBasicMaterial;
  private temporalRiftInnerTorus: THREE.Mesh;
  private temporalRiftInnerTorusMat: THREE.MeshBasicMaterial;
  private temporalRiftCoreMesh: THREE.Mesh;
  private temporalRiftCoreMat: THREE.MeshBasicMaterial;
  private temporalRiftBeamMesh: THREE.Mesh;
  private temporalRiftBeamMat: THREE.MeshBasicMaterial;
  private overdriveDomeGroup: THREE.Group;
  private overdriveShellMesh: THREE.Mesh;
  private overdriveShellMat: THREE.MeshBasicMaterial;
  private overdriveOuterRing: THREE.Mesh;
  private overdriveOuterRingMat: THREE.MeshBasicMaterial;
  private overdriveInnerRing: THREE.Mesh;
  private overdriveInnerRingMat: THREE.MeshBasicMaterial;
  private overdriveGroundRing: THREE.Mesh;
  private overdriveGroundRingMat: THREE.MeshBasicMaterial;
  private overdriveVisualAlpha = 0;
  private watchtowerHeads: THREE.Group[] = [];
  private vaultWheels: THREE.Group[] = [];
  private stasisCoreRig: ChronoStasisCoreRig;
  private sovereignObelisks: SovereignObeliskRig[] = [];
  private fieldRefitDroneRig: FieldRefitDroneRig;
  private singularityGrenadeRig?: SingularityGrenadeRig;
  private transitAirlockRig?: SectorTransitAirlockRig;
  private entryAirlockRig?: EntryBoardingAirlockRig;
  private breachSealRig?: BreachSealRig;
  private expeditionTrailRig?: ExpeditionTrailRig;
  private safeRoomHubRig?: SafeRoomHubRig;
  private secretVaultRig?: SecretEchoVaultRig;
  private combatDroneRig?: AutonomousCombatDroneRig;
  private bossCoreSigilRig?: {
    root: THREE.Group;
    crystalMesh: THREE.Mesh;
    outerRing: THREE.Mesh;
    innerRing: THREE.Mesh;
    omegaCrownRing: THREE.Mesh;
    omegaWingLeft: THREE.Mesh;
    omegaWingRight: THREE.Mesh;
    crystalMat: THREE.MeshStandardMaterial;
    ringMat: THREE.MeshStandardMaterial;
    omegaMat: THREE.MeshStandardMaterial;
  };
  private bossCorePulseTimer = 0;
  private finisherRiftRig?: ChronoFinisherRiftRig;
  private photoDroneRig?: PhotoDroneRig;
  private photoModeCam = {
    active: false,
    yawOffset: 0.45,
    pitchOffset: 0.16,
    distance: 7.4,
    fov: 50,
    showDrone: true,
  };
  private droneBeamTimer = 0;
  private lastAppliedSkinId: string | null = null;
  private disposed = false;

  private viewportWidth = 1280;
  private viewportHeight = 720;
  private graphicsPreset: GraphicsPreset = getDefaultGraphicsSettings().graphicsPreset;
  private renderScale = getDefaultGraphicsSettings().renderScale;
  private dynamicScaleFactor = 1.0;
  private shadowQuality: ShadowQuality = getDefaultGraphicsSettings().shadowQuality;
  private particleQuality: ParticleQuality = getDefaultGraphicsSettings().particleQuality;
  private particleScale = getParticleScaleFactor(getDefaultGraphicsSettings().particleQuality);
  private lightingQuality: LightingQuality = getDefaultGraphicsSettings().lightingQuality;
  private fpsLimit: FpsLimitOption = getDefaultGraphicsSettings().fpsLimit;
  private celestialGrade: CelestialAtmosphereGrade = getDefaultGraphicsSettings().celestialGrade;
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
  private locale: AppLocale = 'en';
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
          this.renderScale * this.dynamicScaleFactor,
          this.isHeadless,
          true
        );
      }
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(this.appliedPixelRatio);
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.12;
      this.renderer.shadowMap.enabled =
        !this.isHeadless && !this.isSoftwareGl && this.shadowQuality !== 'off';
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    const bgHex = 0x060b14;
    this.scene.background = new THREE.Color(bgHex);
    this.sceneFog = new THREE.FogExp2(bgHex, 0.0135);
    this.scene.fog = this.sceneFog;

    // High-contrast Orbital Sci-Fi Studio PMREM Reflection Map (dark cavity + warm/cyan softbox speculars)
    this.studioEnvTex = createStudioEnvironmentTexture();
    if (this.renderer) {
      try {
        const pmrem = new THREE.PMREMGenerator(this.renderer);
        pmrem.compileEquirectangularShader();
        this.pmremEnvTarget = pmrem.fromEquirectangular(this.studioEnvTex);
        pmrem.dispose();
        this.scene.environment = this.pmremEnvTarget.texture;
        this.scene.environmentIntensity = 0.94;
      } catch {
        try {
          const pmrem = new THREE.PMREMGenerator(this.renderer);
          const roomEnv = new RoomEnvironment();
          this.pmremEnvTarget = pmrem.fromScene(roomEnv, 0.04);
          roomEnv.dispose();
          pmrem.dispose();
          this.scene.environment = this.pmremEnvTarget.texture;
          this.scene.environmentIntensity = 0.82;
        } catch {
          this.scene.environment = this.studioEnvTex;
          this.scene.environmentIntensity = 0.85;
        }
      }
    } else {
      this.scene.environment = this.studioEnvTex;
      this.scene.environmentIntensity = 0.85;
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

    // High-Contrast 3-Point Orbital Studio Lighting Rig (eliminates washed-out plastic fill)
    const hemiLight = new THREE.HemisphereLight(0x7ab8f5, 0x090f1b, 0.62);
    hemiLight.position.set(0, 28, 0);
    this.scene.add(hemiLight);
    this.hemiLight = hemiLight;

    const keyLight = new THREE.DirectionalLight(0xfff5e0, 2.85);
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

    // Crisp Cool Rim/Back Directional Light to sculpt dark metallic silhouettes
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.05);
    rimLight.position.set(-14, 19, -17);
    this.scene.add(rimLight);
    this.rimLight = rimLight;

    // Point light on the central Chronicle Loom Pylon
    const loomLight = new THREE.PointLight(0x22d3ee, 5.8, 26, 1.55);
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
    this.celestialAstrolabeOuterRing = env.celestialAstrolabeOuterRing;
    this.celestialAstrolabeInnerRing = env.celestialAstrolabeInnerRing;
    this.orbitalShuttles = env.orbitalShuttles ?? [];
    this.orbitalDebris = env.orbitalDebris ?? [];
    this.watchtowerHeads = env.watchtowerHeads ?? [];
    this.vaultWheels = env.vaultWheels ?? [];
    this.blastStrobeMat = env.blastStrobeMat;
    this.beamConeMat = env.beamConeMat;
    this.obstacleMeshes = env.obstacleMeshes;
    this.obstacleMeshById = env.obstacleMeshById;

    this.lysaHoloProjectorRig = createLysaHoloProjectorRig(this.shadowTex);
    this.scene.add(this.lysaHoloProjectorRig.root);

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

    // LORE TERMINAL — Obsidian-Steel Archival Pedestal, Copper Trim, Angled Cyan Screen & Floating Diamond Holo (Sheet 4, Panel 2)
    this.interactablesGroup = new THREE.Group();
    this.interactablesGroup.name = 'EnvironmentalInteractablesPool';
    const termFootGeo = new RoundedBoxGeometry(0.68, 0.1, 0.56, 2, 0.025);
    const termColGeo = new RoundedBoxGeometry(0.46, 1.02, 0.36, 2, 0.04);
    const termCopperTrimGeo = new RoundedBoxGeometry(0.5, 0.34, 0.24, 2, 0.025);
    const termNeckGeo = new RoundedBoxGeometry(0.32, 0.14, 0.26, 2, 0.02);
    const termScreenHousingGeo = new RoundedBoxGeometry(0.76, 0.48, 0.09, 2, 0.03);
    const intHoloScreenGeo = new THREE.BoxGeometry(0.62, 0.36, 0.022);
    const intCoreGeo = new THREE.OctahedronGeometry(0.22, 0);
    const intRingGeo = new THREE.RingGeometry(0.55, 0.72, 24);
    intRingGeo.rotateX(-Math.PI * 0.5);
    const termObsidianMat = new THREE.MeshStandardMaterial({
      color: 0x161b24,
      roughness: 0.34,
      metalness: 0.78,
    });
    const termCopperMat = new THREE.MeshStandardMaterial({
      color: 0x9a6443,
      roughness: 0.36,
      metalness: 0.84,
    });
    for (let i = 0; i < 6; i++) {
      const iGroup = new THREE.Group();
      iGroup.visible = false;

      const foot = new THREE.Mesh(termFootGeo, termObsidianMat);
      foot.position.y = 0.05;
      iGroup.add(foot);

      const ped = new THREE.Mesh(termColGeo, termObsidianMat);
      ped.position.y = 0.58;
      iGroup.add(ped);

      // Subtle copper side accent plates & front data port trim
      const copperSide = new THREE.Mesh(termCopperTrimGeo, termCopperMat);
      copperSide.position.set(0, 0.28, 0.06);
      iGroup.add(copperSide);

      const neck = new THREE.Mesh(termNeckGeo, pillarStructMat);
      neck.position.set(0, 1.12, 0.04);
      iGroup.add(neck);

      const screenBezel = new THREE.Mesh(termScreenHousingGeo, termObsidianMat);
      screenBezel.position.set(0, 1.24, 0.14);
      screenBezel.rotation.x = -0.58;
      iGroup.add(screenBezel);

      const holoPaneMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.78,
        depthWrite: false,
      });
      const holoScreen = new THREE.Mesh(intHoloScreenGeo, holoPaneMat);
      holoScreen.position.set(0, 1.26, 0.178);
      holoScreen.rotation.x = -0.58;
      iGroup.add(holoScreen);

      const coreMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.9,
      });
      const coreMesh = new THREE.Mesh(intCoreGeo, coreMat);
      coreMesh.scale.set(0.85, 1.22, 0.85);
      coreMesh.position.set(0, 1.72, 0.06);
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

    // TACTICAL COVER (Sheet 4, Panel 1) & FLUX CRATE (Sheet 3, Panel 7) Dynamic Obstacle Pool
    this.dynamicObstaclesGroup = new THREE.Group();
    this.dynamicObstaclesGroup.name = 'DynamicChapterObstaclesPool';
    const wallBodyGeo = new RoundedBoxGeometry(2.05, 1.08, 0.44, 2, 0.06);
    const wallSkirtGeo = new RoundedBoxGeometry(2.14, 0.34, 0.56, 2, 0.04);
    const wallHazardGeo = new THREE.BoxGeometry(1.76, 0.16, 0.59);
    const wallSideCapGeo = new RoundedBoxGeometry(0.28, 1.24, 0.52, 2, 0.05);
    const wallTrimGeo = new RoundedBoxGeometry(1.48, 0.14, 0.14, 2, 0.03);
    const wallStrutFootGeo = new RoundedBoxGeometry(0.22, 0.12, 0.58, 2, 0.03);
    const wallPistonGeo = new THREE.CylinderGeometry(0.052, 0.065, 0.78, 8);
    // FLUX CRATE — Destructible Roll-Cage Volatile Capacitor Crate (Sheet 3, Panel 7 Match)
    const crateFrameBarHGeo = new THREE.BoxGeometry(1.16, 0.085, 0.085);
    const crateFrameBarVGeo = new THREE.BoxGeometry(0.085, 1.08, 0.085);
    const crateFrameBarDGeo = new THREE.BoxGeometry(0.085, 0.085, 1.16);
    const crateBaseGeo = new THREE.BoxGeometry(1.12, 0.14, 1.12);
    const crateCanisterGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.82, 12);
    const crateCanisterCapGeo = new THREE.CylinderGeometry(0.23, 0.23, 0.12, 12);
    const crateInnerAmberGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.68, 10);
    const crateHazardBandGeo = new THREE.BoxGeometry(1.2, 0.14, 1.2);
    const crateHazardTex = createHazardStripeTexture();
    const crateHazardMat = new THREE.MeshStandardMaterial({
      map: crateHazardTex,
      roughness: 0.45,
      metalness: 0.35,
    });
    const crateCyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.8,
      transparent: true,
      opacity: 0.82,
      roughness: 0.14,
      metalness: 0.2,
    });
    const dynBodyMat = new THREE.MeshStandardMaterial({
      color: 0x262d38,
      roughness: 0.4,
      metalness: 0.72,
    });
    const dynFrameMat = new THREE.MeshStandardMaterial({
      color: 0x475364,
      roughness: 0.3,
      metalness: 0.84,
    });
    for (let i = 0; i < 8; i++) {
      const dGroup = new THREE.Group();
      dGroup.visible = false;

      const trimMat = new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.35,
        roughness: 0.2,
        metalness: 0.35,
      });
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.92,
      });

      // TACTICAL COVER — Matte Gunmetal Ballistic Barricade, Hydraulic Struts, Hazard Base & Cyan Top Crest
      const wallGroup = new THREE.Group();
      const wBody = new THREE.Mesh(wallBodyGeo, dynBodyMat);
      wBody.position.y = 0.68;
      wBody.castShadow = !this.isHeadless;
      wBody.receiveShadow = !this.isHeadless;
      const wSkirt = new THREE.Mesh(wallSkirtGeo, dynFrameMat);
      wSkirt.position.y = 0.18;
      const wHazard = new THREE.Mesh(wallHazardGeo, crateHazardMat);
      wHazard.position.y = 0.16;
      const wTrim = new THREE.Mesh(wallTrimGeo, trimMat);
      wTrim.position.y = 1.24;
      wallGroup.add(wBody, wSkirt, wHazard, wTrim);

      for (const side of [-1, 1]) {
        // Raised heavy armored shoulder cheeks flanking the cyan barrier top crest
        const cheek = new THREE.Mesh(wallSideCapGeo, dynFrameMat);
        cheek.position.set(side * 0.94, 0.64, 0);
        cheek.castShadow = !this.isHeadless;
        wallGroup.add(cheek);
        // Angled hydraulic stabilizer struts gripping the deck on both front & rear
        for (const zDir of [-1, 1]) {
          const foot = new THREE.Mesh(wallStrutFootGeo, dynBodyMat);
          foot.position.set(side * 0.86, 0.06, zDir * 0.34);
          wallGroup.add(foot);
          const piston = new THREE.Mesh(wallPistonGeo, dynFrameMat);
          piston.position.set(side * 0.86, 0.42, zDir * 0.32);
          piston.rotation.x = zDir * 0.46;
          wallGroup.add(piston);
        }
      }
      dGroup.add(wallGroup);

      const crateGroup = new THREE.Group();
      const cBase = new THREE.Mesh(crateBaseGeo, dynBodyMat);
      cBase.position.y = 0.08;
      cBase.castShadow = !this.isHeadless;
      cBase.receiveShadow = !this.isHeadless;
      crateGroup.add(cBase);

      // 4 Glowing Unstable Cyan-Amber Plasma Canisters Inside the Cage
      for (const cx of [-0.26, 0.26]) {
        for (const cz of [-0.26, 0.26]) {
          const canGlass = new THREE.Mesh(crateCanisterGeo, crateCyanGlowMat);
          canGlass.position.set(cx, 0.58, cz);
          crateGroup.add(canGlass);

          const canCore = new THREE.Mesh(crateInnerAmberGeo, coreMat);
          canCore.position.set(cx, 0.58, cz);
          crateGroup.add(canCore);

          const capTop = new THREE.Mesh(crateCanisterCapGeo, dynFrameMat);
          capTop.position.set(cx, 1.0, cz);
          crateGroup.add(capTop);
        }
      }

      // Heavy Dark-Steel Roll-Cage Outer Frame (4 corner posts + top/bottom rails)
      for (const sx of [-0.56, 0.56]) {
        for (const sz of [-0.56, 0.56]) {
          const post = new THREE.Mesh(crateFrameBarVGeo, dynFrameMat);
          post.position.set(sx, 0.58, sz);
          post.castShadow = !this.isHeadless;
          crateGroup.add(post);
        }
      }
      for (const sy of [0.1, 1.08]) {
        for (const sz of [-0.56, 0.56]) {
          const railX = new THREE.Mesh(crateFrameBarHGeo, dynFrameMat);
          railX.position.set(0, sy, sz);
          crateGroup.add(railX);
        }
        for (const sx of [-0.56, 0.56]) {
          const railZ = new THREE.Mesh(crateFrameBarDGeo, dynFrameMat);
          railZ.position.set(sx, sy, 0);
          crateGroup.add(railZ);
        }
      }

      // Signature Diagonal Yellow-and-Black Hazard Stripe Band Around Upper Perimeter
      const hazardBand = new THREE.Mesh(crateHazardBandGeo, crateHazardMat);
      hazardBand.position.y = 0.84;
      crateGroup.add(hazardBand);

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

    // BOOST PAD — Brushed-Titanium Circular Accelerator Pad, 4 Glowing Amber Corner Clamps & Turbine Core (Sheet 4, Panel 3)
    this.boostPadsGroup = new THREE.Group();
    this.boostPadsGroup.name = 'KineticBoostPadsPool';
    const padBaseGeo = new THREE.CylinderGeometry(1.36, 1.48, 0.09, 28);
    const padBezelTorusGeo = new THREE.TorusGeometry(1.28, 0.095, 10, 32);
    padBezelTorusGeo.rotateX(Math.PI * 0.5);
    const padWellGeo = new THREE.CylinderGeometry(0.54, 0.48, 0.095, 24);
    const padClampGeo = new RoundedBoxGeometry(0.42, 0.16, 0.52, 2, 0.04);
    const padClampGlowGeo = new RoundedBoxGeometry(0.28, 0.12, 0.36, 2, 0.03);
    const padBladeGeo = new THREE.BoxGeometry(0.055, 0.04, 0.42);
    const padOuterRingGeo = new THREE.RingGeometry(0.92, 1.14, 32);
    padOuterRingGeo.rotateX(-Math.PI * 0.5);
    const padInnerHaloGeo = new THREE.RingGeometry(0.62, 0.78, 28);
    padInnerHaloGeo.rotateX(-Math.PI * 0.5);
    const padChevronGeo = new THREE.RingGeometry(0.32, 0.46, 16);
    padChevronGeo.rotateX(-Math.PI * 0.5);
    const padTitaniumMat = new THREE.MeshStandardMaterial({
      color: 0x7b8798,
      roughness: 0.28,
      metalness: 0.86,
    });
    const padDarkWellMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.48,
      metalness: 0.74,
    });
    const padAmberClampMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 1.55,
      roughness: 0.2,
      metalness: 0.3,
    });
    for (let i = 0; i < 2; i++) {
      const pGroup = new THREE.Group();
      pGroup.visible = false;
      const pBase = new THREE.Mesh(padBaseGeo, padDarkWellMat);
      pBase.position.y = 0.045;
      pBase.receiveShadow = !this.isHeadless;
      pGroup.add(pBase);

      const pBezel = new THREE.Mesh(padBezelTorusGeo, padTitaniumMat);
      pBezel.position.y = 0.09;
      pGroup.add(pBezel);

      // 4 Heavy Glowing Amber Corner Clamp Brackets around the circular rim
      for (let c = 0; c < 4; c++) {
        const ca = (c / 4) * Math.PI * 2 + Math.PI / 4;
        const clamp = new THREE.Mesh(padClampGeo, padTitaniumMat);
        clamp.position.set(Math.sin(ca) * 1.24, 0.11, Math.cos(ca) * 1.24);
        clamp.rotation.y = ca;
        pGroup.add(clamp);

        const clampLight = new THREE.Mesh(padClampGlowGeo, padAmberClampMat);
        clampLight.position.set(Math.sin(ca) * 1.28, 0.145, Math.cos(ca) * 1.28);
        clampLight.rotation.y = ca;
        pGroup.add(clampLight);
      }

      const well = new THREE.Mesh(padWellGeo, padDarkWellMat);
      well.position.y = 0.055;
      pGroup.add(well);

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.82,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const outerRing = new THREE.Mesh(padOuterRingGeo, ringMat);
      outerRing.position.y = 0.098;
      pGroup.add(outerRing);

      const innerHalo = new THREE.Mesh(padInnerHaloGeo, ringMat);
      innerHalo.position.y = 0.101;
      pGroup.add(innerHalo);

      // Rotating Turbine Fan Core & Illuminated Hub inside chevronMesh
      const chevronMat = new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const chevronMesh = new THREE.Mesh(padChevronGeo, chevronMat);
      chevronMesh.position.y = 0.106;
      for (let b = 0; b < 8; b++) {
        const ba = (b / 8) * Math.PI * 2;
        const blade = new THREE.Mesh(padBladeGeo, padTitaniumMat);
        blade.position.set(Math.sin(ba) * 0.24, 0, Math.cos(ba) * 0.24);
        blade.rotation.y = ba + 0.32;
        chevronMesh.add(blade);
      }
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

    // OVERCLOCK CORE (Sheet 5, Panel 7) & MED NANITE POD (Sheet 5, Panel 5) in Secret Alcove Caches
    this.secretsGroup = new THREE.Group();
    this.secretsGroup.name = 'SecretAreasGroup';
    const secRingGeo = new THREE.RingGeometry(0.72, 0.94, 24);
    secRingGeo.rotateX(-Math.PI * 0.5);
    const overclockHexEndGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.16, 6);
    overclockHexEndGeo.rotateZ(Math.PI * 0.5);
    const overclockCoilGeo = new THREE.TorusGeometry(0.2, 0.048, 8, 20);
    overclockCoilGeo.rotateY(Math.PI * 0.5);
    const overclockGunmetalMat = new THREE.MeshStandardMaterial({
      color: 0x2a323f,
      roughness: 0.34,
      metalness: 0.86,
    });
    const overclockGoldMat = new THREE.MeshStandardMaterial({
      color: 0xd4ad52,
      roughness: 0.26,
      metalness: 0.9,
    });
    const overclockAmberMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 1.6,
      roughness: 0.14,
      metalness: 0.22,
    });
    const medWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.22,
      metalness: 0.22,
    });
    const medTealMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      roughness: 0.34,
      metalness: 0.45,
    });
    const medMintGlowMat = new THREE.MeshStandardMaterial({
      color: 0x5eead4,
      emissive: 0x10b981,
      emissiveIntensity: 1.45,
      roughness: 0.14,
      metalness: 0.2,
    });
    const buildMedNanitePodMesh = (scale = 1.0): THREE.Group => {
      const pod = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.24 * scale, 0.36 * scale, 8, 16), medTealMat);
      pod.add(body);
      for (const side of [-1, 1]) {
        const shell = new THREE.Mesh(
          new RoundedBoxGeometry(0.18 * scale, 0.54 * scale, 0.34 * scale, 2, 0.05 * scale),
          medWhiteMat
        );
        shell.position.x = side * 0.18 * scale;
        pod.add(shell);
      }
      // Glowing Mint-Green 3D Cross (+) Nanite Core Window on Front & Back
      for (const zDir of [-1, 1]) {
        const crossV = new THREE.Mesh(
          new RoundedBoxGeometry(0.11 * scale, 0.34 * scale, 0.05 * scale, 1, 0.015 * scale),
          medMintGlowMat
        );
        crossV.position.z = zDir * 0.24 * scale;
        pod.add(crossV);
        const crossH = new THREE.Mesh(
          new RoundedBoxGeometry(0.32 * scale, 0.11 * scale, 0.05 * scale, 1, 0.015 * scale),
          medMintGlowMat
        );
        crossH.position.z = zDir * 0.24 * scale;
        pod.add(crossH);
      }
      return pod;
    };
    for (let i = 0; i < 2; i++) {
      const sGroup = new THREE.Group();
      sGroup.visible = false;
      const coreMat = new THREE.MeshBasicMaterial({
        color: i === 0 ? 0xf59e0b : 0x34d399,
        transparent: true,
        opacity: 0.9,
      });
      const coreMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), coreMat);
      coreMesh.position.y = 1.15;
      if (i === 0) {
        // OVERCLOCK CORE — Precision Hexagonal Gunmetal & Gold Circuit Casing with Blazing Amber Plasma Coils
        for (const ex of [-0.26, 0.26]) {
          const cap = new THREE.Mesh(overclockHexEndGeo, overclockGunmetalMat);
          cap.position.x = ex;
          coreMesh.add(cap);
          const goldRim = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.028, 6, 6), overclockGoldMat);
          goldRim.rotation.y = Math.PI * 0.5;
          goldRim.position.x = ex + Math.sign(ex) * 0.08;
          coreMesh.add(goldRim);
        }
        for (const cx of [-0.1, 0, 0.1]) {
          const coil = new THREE.Mesh(overclockCoilGeo, overclockAmberMat);
          coil.position.x = cx;
          coreMesh.add(coil);
        }
        for (let b = 0; b < 3; b++) {
          const ba = (b / 3) * Math.PI * 2;
          const rail = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.055, 0.065), overclockGoldMat);
          rail.position.set(0, Math.cos(ba) * 0.28, Math.sin(ba) * 0.28);
          coreMesh.add(rail);
        }
      } else {
        // MED NANITE POD — Glossy White & Emerald-Teal Capsule with Glowing Mint Cross Window
        coreMesh.add(buildMedNanitePodMesh(1.05));
      }
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

    // SURGE POOL — Recessed Octagonal Gunmetal Titanium Energy Grate Pad with Cyan-Emerald Flux Vortex (Sheet 7, Panel 4)
    this.fluxPoolsGroup = new THREE.Group();
    this.fluxPoolsGroup.name = 'ChargedFluxPoolsGroup';
    const surgeRimMat = new THREE.MeshStandardMaterial({
      color: 0x3b4452,
      roughness: 0.36,
      metalness: 0.84,
    });
    const surgeGrateDarkMat = new THREE.MeshStandardMaterial({
      color: 0x1b232e,
      roughness: 0.44,
      metalness: 0.78,
    });
    const surgeCyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x0d9488,
      emissiveIntensity: 1.45,
      roughness: 0.14,
      metalness: 0.2,
    });
    const fluxRingGeo = new THREE.RingGeometry(0.84, 1.0, 8);
    fluxRingGeo.rotateX(-Math.PI * 0.5);
    const fluxDiscGeo = new THREE.CircleGeometry(0.42, 6);
    fluxDiscGeo.rotateX(-Math.PI * 0.5);
    const surgeBaseOctGeo = new THREE.CylinderGeometry(0.92, 1.02, 0.08, 8);
    const surgeInnerHexRimGeo = new THREE.TorusGeometry(0.42, 0.04, 6, 6);
    surgeInnerHexRimGeo.rotateX(Math.PI * 0.5);
    const surgeLouverGeo = new THREE.BoxGeometry(0.58, 0.024, 0.045);
    for (let i = 0; i < 4; i++) {
      const fGroup = new THREE.Group();
      fGroup.visible = false;
      // Beveled octagonal titanium outer pad frame + underglow ring
      const octPad = new THREE.Mesh(surgeBaseOctGeo, surgeRimMat);
      octPad.position.y = 0.036;
      fGroup.add(octPad);
      const octRecess = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.84, 0.045, 8), surgeGrateDarkMat);
      octRecess.position.y = 0.06;
      fGroup.add(octRecess);
      // 8 metallic deck louver vent ribs around the octagonal grate
      for (let lv = 0; lv < 8; lv++) {
        const la = (lv / 8) * Math.PI * 2;
        const bar = new THREE.Mesh(surgeLouverGeo, surgeRimMat);
        bar.position.set(Math.sin(la) * 0.62, 0.084, Math.cos(la) * 0.62);
        bar.rotation.y = la;
        fGroup.add(bar);
      }
      // Glowing cyan-emerald hexagonal core rim & swirling liquid flux plasma vortex
      const innerHexRim = new THREE.Mesh(surgeInnerHexRimGeo, surgeRimMat);
      innerHexRim.position.y = 0.088;
      fGroup.add(innerHexRim);
      const underRim = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.025, 6, 8), surgeCyanGlowMat);
      underRim.rotation.x = Math.PI * 0.5;
      underRim.position.y = 0.024;
      fGroup.add(underRim);

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x2dd4bf,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const outerRing = new THREE.Mesh(fluxRingGeo, ringMat);
      outerRing.position.y = 0.095;
      fGroup.add(outerRing);

      const discMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.82,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const innerDisc = new THREE.Mesh(fluxDiscGeo, discMat);
      innerDisc.position.y = 0.09;
      fGroup.add(innerDisc);

      // Floating Med Nanite Pod hovering inside the Flux/Nanite Surge Pool
      const poolPod = buildMedNanitePodMesh(0.46);
      poolPod.position.y = 0.42;
      outerRing.add(poolPod);

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

    // ARTILLERY SHELL — Heavy Industrial Charcoal Mortar Warhead with Hazard Stripes, 4 Tail Fins & Molten-Amber Plasma Nose (Sheet 7, Panel 2)
    this.artilleryZonesGroup = new THREE.Group();
    this.artilleryZonesGroup.name = 'ArtilleryZonesGroup';
    const artRingGeo = new THREE.RingGeometry(0.88, 1.0, 36);
    artRingGeo.rotateX(-Math.PI * 0.5);
    const artDiscGeo = new THREE.CircleGeometry(0.88, 32);
    artDiscGeo.rotateX(-Math.PI * 0.5);
    const artShellCoreGeo = new THREE.CylinderGeometry(0.22, 0.24, 0.78, 12);
    const artShellNoseGeo = new THREE.CylinderGeometry(0.11, 0.24, 0.34, 12);
    const artShellFinGeo = new THREE.BoxGeometry(0.04, 0.34, 0.24);
    const artShellCasingMat = new THREE.MeshStandardMaterial({
      color: 0x2c333e,
      roughness: 0.44,
      metalness: 0.78,
    });
    const artShellHazardMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      emissive: 0xb45309,
      emissiveIntensity: 0.45,
      roughness: 0.35,
      metalness: 0.5,
    });
    const artShellPlasmaMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 1.65,
      roughness: 0.16,
      metalness: 0.2,
    });
    for (let i = 0; i < 12; i++) {
      const aGroup = new THREE.Group();
      aGroup.visible = false;
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.86,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const outerRing = new THREE.Mesh(artRingGeo, ringMat);
      outerRing.position.y = 0.052;
      aGroup.add(outerRing);

      const discMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const fillDisc = new THREE.Mesh(artDiscGeo, discMat);
      fillDisc.position.y = 0.042;
      aGroup.add(fillDisc);

      const shellMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.94,
      });
      // Descending Nose-Down Artillery Warhead Pod
      const shellMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), shellMat);
      shellMesh.position.y = 5.0;
      const bodyCyl = new THREE.Mesh(artShellCoreGeo, artShellCasingMat);
      bodyCyl.position.y = 0.44;
      shellMesh.add(bodyCyl);
      // Hazard stripe collar around midsection
      const hazardBand = new THREE.Mesh(new THREE.CylinderGeometry(0.245, 0.245, 0.14, 12), artShellHazardMat);
      hazardBand.position.y = 0.42;
      shellMesh.add(hazardBand);
      // Tapered nose cone pointing downward with 6 glowing molten-amber plasma vent slots
      const noseCone = new THREE.Mesh(artShellNoseGeo, artShellCasingMat);
      noseCone.rotation.x = Math.PI;
      noseCone.position.y = -0.06;
      shellMesh.add(noseCone);
      for (let v = 0; v < 6; v++) {
        const va = (v / 6) * Math.PI * 2;
        const vent = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.22, 0.045), artShellPlasmaMat);
        vent.position.set(Math.sin(va) * 0.18, -0.04, Math.cos(va) * 0.18);
        vent.rotation.y = va;
        shellMesh.add(vent);
      }
      // 4 Stabilizer Tail Fins at upper tail + rear exhaust booster glow
      for (let fn = 0; fn < 4; fn++) {
        const fa = (fn / 4) * Math.PI * 2 + Math.PI / 4;
        const fin = new THREE.Mesh(artShellFinGeo, artShellCasingMat);
        fin.position.set(Math.sin(fa) * 0.26, 0.78, Math.cos(fa) * 0.26);
        fin.rotation.y = fa;
        shellMesh.add(fin);
      }
      const tailExhaust = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.36, 8), artShellPlasmaMat);
      tailExhaust.position.y = 1.02;
      shellMesh.add(tailExhaust);
      aGroup.add(shellMesh);

      this.artilleryZoneRigs.push({
        group: aGroup,
        outerRing,
        fillDisc,
        shellMesh,
        ringMat,
        discMat,
        shellMat,
      });
      this.artilleryZonesGroup.add(aGroup);
    }
    this.scene.add(this.artilleryZonesGroup);

    // TETHER NODE — Floating Harmonic Shield Relay Orb with Antique-Brass Gimbal Rings, White Armor Plates & Emerald Crystal Core (Sheet 7, Panel 3)
    this.conductorTethersGroup = new THREE.Group();
    this.conductorTethersGroup.name = 'ConductorTethersGroup';
    const tetherBeamGeo = new THREE.CylinderGeometry(0.065, 0.065, 1.0, 10, 1, true);
    const tetherHaloGeo = new THREE.RingGeometry(0.82, 1.04, 32);
    tetherHaloGeo.rotateX(-Math.PI * 0.5);
    const tetherBrassMat = new THREE.MeshStandardMaterial({
      color: 0xc9a24b,
      roughness: 0.28,
      metalness: 0.88,
    });
    const tetherCeramicMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.24,
      metalness: 0.26,
    });
    const tetherEmeraldMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x059669,
      emissiveIntensity: 1.65,
      roughness: 0.14,
      metalness: 0.2,
    });
    for (let i = 0; i < 4; i++) {
      const tGroup = new THREE.Group();
      tGroup.visible = false;
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const beamMesh = new THREE.Mesh(tetherBeamGeo, beamMat);
      tGroup.add(beamMesh);

      // Floating TETHER NODE relay drone orb suspended at beam midpoint
      const nodeGroup = new THREE.Group();
      const brassRingOuter = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.048, 8, 24), tetherBrassMat);
      nodeGroup.add(brassRingOuter);
      const brassRingInner = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.036, 8, 24), tetherBrassMat);
      brassRingInner.rotation.y = Math.PI * 0.5;
      nodeGroup.add(brassRingInner);
      for (let ap = 0; ap < 4; ap++) {
        const aa = (ap / 4) * Math.PI * 2 + Math.PI / 4;
        const plate = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.26, 0.16, 2, 0.04), tetherCeramicMat);
        plate.position.set(Math.cos(aa) * 0.38, Math.sin(aa) * 0.38, 0);
        plate.rotation.z = aa;
        nodeGroup.add(plate);
      }
      const emeraldCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), tetherEmeraldMat);
      emeraldCrystal.scale.set(0.85, 1.45, 0.85);
      nodeGroup.add(emeraldCrystal);
      tGroup.add(nodeGroup);

      const allyHaloMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const allyHaloMesh = new THREE.Mesh(tetherHaloGeo, allyHaloMat);
      allyHaloMesh.position.y = 0.055;
      tGroup.add(allyHaloMesh);

      this.conductorTetherRigs.push({
        group: tGroup,
        beamMesh,
        beamMat,
        allyHaloMesh,
        allyHaloMat,
        nodeGroup,
      });
      this.conductorTethersGroup.add(tGroup);
    }
    this.scene.add(this.conductorTethersGroup);

    // WAYPOINT SPIRE — Gilded Dark-Titanium Circular Projector Base, Warm Amber Beam & Spinning Cyan Octahedron (Sheet 6, Panel 8)
    this.waypointBeaconGroup = new THREE.Group();
    this.waypointBeaconGroup.name = 'TacticalWaypointBeaconGroup';
    this.waypointBeaconGroup.visible = false;
    const wpGoldMat = new THREE.MeshStandardMaterial({
      color: 0xd4ad52,
      roughness: 0.26,
      metalness: 0.9,
    });
    const wpBaseSlateMat = new THREE.MeshStandardMaterial({
      color: 0x262f3b,
      roughness: 0.38,
      metalness: 0.82,
    });
    const wpPlinthLower = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.88, 0.14, 24), wpGoldMat);
    wpPlinthLower.position.y = 0.07;
    this.waypointBeaconGroup.add(wpPlinthLower);
    const wpPlinthUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 0.1, 24), wpBaseSlateMat);
    wpPlinthUpper.position.y = 0.17;
    this.waypointBeaconGroup.add(wpPlinthUpper);
    const wpEmitterCollar = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.04, 8, 24), wpGoldMat);
    wpEmitterCollar.rotation.x = Math.PI * 0.5;
    wpEmitterCollar.position.y = 0.22;
    this.waypointBeaconGroup.add(wpEmitterCollar);

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
    wpRingMesh.position.y = 0.05;
    this.waypointBeaconGroup.add(wpRingMesh);

    const wpColGeo = new THREE.CylinderGeometry(0.26, 0.34, 3.2, 18, 1, true);
    const wpColMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const wpColMesh = new THREE.Mesh(wpColGeo, wpColMat);
    wpColMesh.position.y = 1.78;
    this.waypointBeaconGroup.add(wpColMesh);

    const wpDiamondGeo = new THREE.OctahedronGeometry(0.38, 0);
    const wpDiamondMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.94,
    });
    const wpDiamondMesh = new THREE.Mesh(wpDiamondGeo, wpDiamondMat);
    wpDiamondMesh.position.y = 2.45;
    const wpWire = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.41, 0),
      new THREE.MeshBasicMaterial({ color: 0xe0f2fe, wireframe: true, transparent: true, opacity: 0.72 })
    );
    wpDiamondMesh.add(wpWire);
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

    // FRAGMENT CACHE — Dark Octagonal Pedestal, 4 Charcoal-and-Gold Lotus Containment Petals & Floating Amber Crystal (Sheet 4, Panel 4)
    this.fragmentCachesGroup = new THREE.Group();
    this.fragmentCachesGroup.name = 'FragmentCachesGroup';
    const fcBaseOctGeo = new THREE.CylinderGeometry(0.68, 0.78, 0.24, 8);
    const fcGoldRimGeo = new THREE.TorusGeometry(0.62, 0.035, 8, 8);
    fcGoldRimGeo.rotateX(Math.PI * 0.5);
    const fcPetalGeo = new RoundedBoxGeometry(0.34, 1.08, 0.14, 2, 0.04);
    const fcPetalGoldGeo = new RoundedBoxGeometry(0.39, 0.86, 0.08, 2, 0.025);
    const fcPrismGeo = new THREE.IcosahedronGeometry(0.32, 0);
    const fcRingGeo = new THREE.RingGeometry(0.76, 0.98, 24);
    fcRingGeo.rotateX(-Math.PI * 0.5);
    const fcBeamGeo = new THREE.CylinderGeometry(0.06, 0.16, 2.2, 10, 1, true);
    const fcObsidianMat = new THREE.MeshStandardMaterial({
      color: 0x1d232d,
      roughness: 0.38,
      metalness: 0.78,
    });
    const fcGoldMat = new THREE.MeshStandardMaterial({
      color: 0xd4ad52,
      roughness: 0.24,
      metalness: 0.9,
    });
    for (let i = 0; i < 2; i++) {
      const group = new THREE.Group();
      group.visible = false;

      const baseOct = new THREE.Mesh(fcBaseOctGeo, fcObsidianMat);
      baseOct.position.y = 0.12;
      group.add(baseOct);
      const goldTrim = new THREE.Mesh(fcGoldRimGeo, fcGoldMat);
      goldTrim.position.y = 0.23;
      group.add(goldTrim);

      // 4 Sculpted Charcoal-and-Gold Curved Containment Lotus Petals Opening Around the Relic Crystal
      for (let p = 0; p < 4; p++) {
        const pa = (p / 4) * Math.PI * 2 + Math.PI / 4;
        const pPivot = new THREE.Group();
        pPivot.position.y = 0.24;
        pPivot.rotation.y = pa;
        group.add(pPivot);

        const petal = new THREE.Mesh(fcPetalGeo, fcObsidianMat);
        petal.position.set(0, 0.52, 0.44);
        petal.rotation.x = 0.14;
        pPivot.add(petal);

        const petalGold = new THREE.Mesh(fcPetalGoldGeo, fcGoldMat);
        petalGold.position.set(0, 0.54, 0.41);
        petalGold.rotation.x = 0.14;
        pPivot.add(petalGold);
      }

      const prismMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.96,
      });
      const prismMesh = new THREE.Mesh(fcPrismGeo, prismMat);
      prismMesh.position.y = 1.05;
      group.add(prismMesh);

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.78,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ringMesh = new THREE.Mesh(fcRingGeo, ringMat);
      ringMesh.position.y = 0.055;
      group.add(ringMesh);

      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xfef3c7,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const beamMesh = new THREE.Mesh(fcBeamGeo, beamMat);
      beamMesh.position.y = 1.12;
      group.add(beamMesh);

      this.fragmentCacheRigs.push({
        group,
        prismMesh,
        prismMat,
        ringMesh,
        ringMat,
        beamMesh,
        beamMat,
      });
      this.fragmentCachesGroup.add(group);
    }
    this.scene.add(this.fragmentCachesGroup);

    // SECTOR BEACON — White-Ceramic & Gunmetal Bio-Flux Spire, Cyan Core Column & Twin Floating Holo Halos (Sheet 4, Panel 5)
    this.sectorBeaconsGroup = new THREE.Group();
    this.sectorBeaconsGroup.name = 'SectorBeaconsGroup';
    const sbBasePadGeo = new THREE.CylinderGeometry(0.84, 0.94, 0.12, 24);
    const sbBaseWhiteGeo = new THREE.CylinderGeometry(0.68, 0.76, 0.14, 24);
    const sbSpireWhiteGeo = new THREE.CylinderGeometry(0.14, 0.34, 1.92, 14);
    const sbPylonGeo = new THREE.CylinderGeometry(0.11, 0.13, 1.56, 12);
    const sbHaloGeo = new THREE.TorusGeometry(0.56, 0.032, 8, 32);
    const sbHaloLowerGeo = new THREE.TorusGeometry(0.46, 0.026, 8, 28);
    const sbRingGeo = new THREE.RingGeometry(0.95, 1.18, 28);
    sbRingGeo.rotateX(-Math.PI * 0.5);
    const sbWhiteCeramicMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.22,
      metalness: 0.24,
    });
    const sbGunmetalMat = new THREE.MeshStandardMaterial({
      color: 0x262e3c,
      roughness: 0.36,
      metalness: 0.82,
    });
    for (let i = 0; i < 2; i++) {
      const group = new THREE.Group();
      group.visible = false;

      // Circular White-Ceramic & Gunmetal Emitter Floor Base
      const baseDark = new THREE.Mesh(sbBasePadGeo, sbGunmetalMat);
      baseDark.position.y = 0.06;
      group.add(baseDark);
      const baseWhite = new THREE.Mesh(sbBaseWhiteGeo, sbWhiteCeramicMat);
      baseWhite.position.y = 0.12;
      group.add(baseWhite);

      // Tapered White-Ceramic Spire with Dark Gunmetal Split Spine
      const spireBody = new THREE.Mesh(sbSpireWhiteGeo, sbWhiteCeramicMat);
      spireBody.position.y = 1.12;
      group.add(spireBody);
      const spireSpine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.26, 2.04, 10),
        sbGunmetalMat
      );
      spireSpine.position.set(0, 1.16, -0.04);
      group.add(spireSpine);

      // Vertical Glowing Turquoise-Cyan Bio-Flux Energy Column (`pylonMesh`)
      const pylonMat = new THREE.MeshStandardMaterial({
        color: 0x2dd4bf,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.35,
        roughness: 0.16,
        metalness: 0.25,
      });
      const pylonMesh = new THREE.Mesh(sbPylonGeo, pylonMat);
      pylonMesh.position.set(0, 1.14, 0.14);
      group.add(pylonMesh);

      // Docked Mini MED NANITE POD Canister mounted on the Emitter Collar
      const dockedPod = buildMedNanitePodMesh(0.42);
      dockedPod.position.set(0.46, 0.34, 0.22);
      group.add(dockedPod);

      // Twin Delicate Floating Holographic Cyan Halo Rings Around the Upper Spire
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.88,
      });
      const haloMesh = new THREE.Mesh(sbHaloGeo, haloMat);
      haloMesh.position.y = 1.88;
      haloMesh.rotation.x = Math.PI * 0.5;
      const lowerHalo = new THREE.Mesh(sbHaloLowerGeo, haloMat);
      lowerHalo.position.z = 0.34;
      haloMesh.add(lowerHalo);
      group.add(haloMesh);

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const ringMesh = new THREE.Mesh(sbRingGeo, ringMat);
      ringMesh.position.y = 0.05;
      group.add(ringMesh);

      this.sectorBeaconRigs.push({
        group,
        pylonMesh,
        pylonMat,
        haloMesh,
        haloMat,
        ringMesh,
        ringMat,
      });
      this.sectorBeaconsGroup.add(group);
    }
    this.scene.add(this.sectorBeaconsGroup);

    // Dual Counter-Rotating Chapter Orbital Crown Rings (Mesh-only, zero allocations per frame)
    const initialLook = resolveChapterVisualLook(initialWorld.run.chapter, null);
    this.chapterOrbitalCrownGroup = new THREE.Group();
    this.chapterOrbitalCrownGroup.position.set(0, 7.4, 0);
    this.orbitalCrownMat = new THREE.MeshBasicMaterial({
      color: initialLook.rim,
      transparent: true,
      opacity: 0.42,
    });
    this.orbitalCrownInnerMat = new THREE.MeshBasicMaterial({
      color: initialLook.conduit,
      transparent: true,
      opacity: 0.34,
    });
    const crownOuterGeo = new THREE.TorusGeometry(15.6, 0.075, 10, 64);
    crownOuterGeo.rotateX(Math.PI * 0.5);
    this.orbitalCrownOuterRing = new THREE.Mesh(crownOuterGeo, this.orbitalCrownMat);
    this.chapterOrbitalCrownGroup.add(this.orbitalCrownOuterRing);

    const crownInnerGeo = new THREE.TorusGeometry(13.2, 0.055, 10, 56);
    crownInnerGeo.rotateX(Math.PI * 0.5);
    this.orbitalCrownInnerRing = new THREE.Mesh(crownInnerGeo, this.orbitalCrownInnerMat);
    this.chapterOrbitalCrownGroup.add(this.orbitalCrownInnerRing);

    const crownNodeGeo = new THREE.OctahedronGeometry(0.28, 0);
    for (let i = 0; i < 4; i++) {
      const ang = (i * Math.PI) / 2;
      const nodeMesh = new THREE.Mesh(crownNodeGeo, this.orbitalCrownMat);
      nodeMesh.position.set(Math.cos(ang) * 15.6, 0, Math.sin(ang) * 15.6);
      this.orbitalCrownOuterRing.add(nodeMesh);
    }
    this.scene.add(this.chapterOrbitalCrownGroup);

    // 8 Radial Floor Energy Conduits
    this.floorConduitsGroup = new THREE.Group();
    this.floorConduitMat = new THREE.MeshBasicMaterial({
      color: initialLook.conduit,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
    });
    const conduitStripGeo = new THREE.BoxGeometry(0.16, 0.014, 13.8);
    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI) / 4;
      const strip = new THREE.Mesh(conduitStripGeo, this.floorConduitMat);
      strip.position.set(Math.sin(ang) * 11.2, 0.024, Math.cos(ang) * 11.2);
      strip.rotation.y = ang;
      this.floorConduitsGroup.add(strip);
    }
    this.scene.add(this.floorConduitsGroup);

    // Dynamic Arena Anomaly: Pre-allocated 3D TEMPORAL RIFT Rig (Sheet 10, Panel 1)
    // Swirling cyan-gold vertical space-time fracture portal framed by fractured obsidian-steel stabilizer rings
    this.temporalRiftGroup = new THREE.Group();
    this.temporalRiftGroup.visible = false;
    const riftRingGeo = new THREE.RingGeometry(0.84, 1.0, 36);
    riftRingGeo.rotateX(-Math.PI * 0.5);
    this.temporalRiftRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.82,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.temporalRiftRingMesh = new THREE.Mesh(riftRingGeo, this.temporalRiftRingMat);
    this.temporalRiftRingMesh.position.y = 0.04;
    this.temporalRiftGroup.add(this.temporalRiftRingMesh);

    const riftObsidianMat = new THREE.MeshStandardMaterial({
      color: 0x263140,
      roughness: 0.34,
      metalness: 0.86,
    });
    const riftGoldRimMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.94,
    });

    // Outer fractured obsidian-steel stabilizer ring (segmented armored torus + bolted clamps)
    const riftOuterTorusGeo = new THREE.TorusGeometry(1.18, 0.075, 10, 28);
    this.temporalRiftOuterTorusMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.9,
    });
    this.temporalRiftOuterTorus = new THREE.Mesh(riftOuterTorusGeo, riftObsidianMat);
    this.temporalRiftOuterTorus.position.y = 1.52;
    for (let s = 0; s < 6; s++) {
      const sa = (s / 6) * Math.PI * 2;
      const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.18), riftObsidianMat);
      clamp.position.set(Math.cos(sa) * 1.18, Math.sin(sa) * 1.18, 0);
      clamp.rotation.z = sa;
      this.temporalRiftOuterTorus.add(clamp);
    }
    const outerEnergyArc = new THREE.Mesh(new THREE.TorusGeometry(1.06, 0.036, 8, 32), this.temporalRiftOuterTorusMat);
    this.temporalRiftOuterTorus.add(outerEnergyArc);
    this.temporalRiftGroup.add(this.temporalRiftOuterTorus);

    // Inner counter-rotating dark-steel stabilizer ring + golden fracture corona
    const riftInnerTorusGeo = new THREE.TorusGeometry(0.92, 0.055, 10, 24);
    this.temporalRiftInnerTorusMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.94,
    });
    this.temporalRiftInnerTorus = new THREE.Mesh(riftInnerTorusGeo, riftObsidianMat);
    this.temporalRiftInnerTorus.position.y = 1.52;
    const goldInnerHalo = new THREE.Mesh(new THREE.TorusGeometry(0.84, 0.052, 10, 32), riftGoldRimMat);
    this.temporalRiftInnerTorus.add(goldInnerHalo);
    this.temporalRiftGroup.add(this.temporalRiftInnerTorus);

    // Swirling vertical cyan-to-gold portal vortex core
    const riftCoreGeo = new THREE.CircleGeometry(0.82, 28);
    this.temporalRiftCoreMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.temporalRiftCoreMesh = new THREE.Mesh(riftCoreGeo, this.temporalRiftCoreMat);
    this.temporalRiftCoreMesh.position.y = 1.52;
    const vortexSwirlA = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.048, 8, 24, Math.PI * 1.45),
      new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.92 })
    );
    vortexSwirlA.position.z = 0.03;
    this.temporalRiftCoreMesh.add(vortexSwirlA);
    const vortexEye = new THREE.Mesh(
      new THREE.CircleGeometry(0.24, 18),
      new THREE.MeshBasicMaterial({ color: 0x082f49, transparent: true, opacity: 0.92, side: THREE.DoubleSide })
    );
    vortexEye.position.z = 0.04;
    this.temporalRiftCoreMesh.add(vortexEye);
    const vortexGoldEdge = new THREE.Mesh(
      new THREE.TorusGeometry(0.76, 0.042, 8, 30),
      riftGoldRimMat
    );
    this.temporalRiftCoreMesh.add(vortexGoldEdge);
    this.temporalRiftGroup.add(this.temporalRiftCoreMesh);

    const riftBeamGeo = new THREE.CylinderGeometry(0.22, 0.48, 5.2, 16, 1, true);
    this.temporalRiftBeamMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.temporalRiftBeamMesh = new THREE.Mesh(riftBeamGeo, this.temporalRiftBeamMat);
    this.temporalRiftBeamMesh.position.y = 2.6;
    this.temporalRiftGroup.add(this.temporalRiftBeamMesh);
    this.scene.add(this.temporalRiftGroup);

    // Chrono Stasis Overdrive [5] 3D Temporal Dilation Dome & Astrolabe Rings
    this.overdriveDomeGroup = new THREE.Group();
    this.overdriveDomeGroup.visible = false;
    const odShellGeo = new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.52);
    this.overdriveShellMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.overdriveShellMesh = new THREE.Mesh(odShellGeo, this.overdriveShellMat);
    this.overdriveDomeGroup.add(this.overdriveShellMesh);

    const odOuterRingGeo = new THREE.TorusGeometry(1, 0.018, 8, 48);
    this.overdriveOuterRingMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.overdriveOuterRing = new THREE.Mesh(odOuterRingGeo, this.overdriveOuterRingMat);
    this.overdriveOuterRing.rotation.x = Math.PI / 2;
    this.overdriveOuterRing.position.y = 1.6;
    const chevronGeo = new THREE.BoxGeometry(0.08, 0.04, 0.04);
    for (let ci = 0; ci < 12; ci++) {
      const ca = (ci / 12) * Math.PI * 2;
      const tick = new THREE.Mesh(chevronGeo, this.overdriveOuterRingMat);
      tick.position.set(Math.cos(ca) * 1.03, Math.sin(ca) * 1.03, 0);
      tick.rotation.z = ca;
      this.overdriveOuterRing.add(tick);
    }
    this.overdriveDomeGroup.add(this.overdriveOuterRing);

    const odInnerRingGeo = new THREE.TorusGeometry(0.76, 0.014, 8, 40);
    this.overdriveInnerRingMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.overdriveInnerRing = new THREE.Mesh(odInnerRingGeo, this.overdriveInnerRingMat);
    this.overdriveInnerRing.rotation.x = Math.PI / 2;
    this.overdriveInnerRing.position.y = 2.8;
    this.overdriveDomeGroup.add(this.overdriveInnerRing);

    const odGroundGeo = new THREE.RingGeometry(0.88, 1.0, 48);
    odGroundGeo.rotateX(-Math.PI / 2);
    this.overdriveGroundRingMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.overdriveGroundRing = new THREE.Mesh(odGroundGeo, this.overdriveGroundRingMat);
    this.overdriveGroundRing.position.y = 0.06;
    this.overdriveDomeGroup.add(this.overdriveGroundRing);
    this.scene.add(this.overdriveDomeGroup);

    // SHEET 11 · CHRONO STASIS CORE (Panel 1) — Orbits Sera when Overdrive is 100% READY & ascends above the dome when ACTIVE
    this.stasisCoreRig = createChronoStasisCoreRig();
    this.stasisCoreRig.root.visible = false;
    this.scene.add(this.stasisCoreRig.root);

    // SHEET 11 · SOVEREIGN OBELISKS (Panel 2) — Twin Boss-Rush Trophy Monoliths with live Roman Numeral I-V progression & spinning cyan crowns
    for (const [ox, oz] of [
      [-4.2, -17.6],
      [4.2, -17.6],
    ] as const) {
      const obelisk = createSovereignObeliskRig();
      obelisk.root.position.set(ox, 0, oz);
      obelisk.root.visible = false;
      this.scene.add(obelisk.root);
      this.sovereignObelisks.push(obelisk);
    }

    // SHEET 11 · FIELD REFIT DRONE (Panel 3) — Hovering White-and-Gold Repair Drone accompanying Sera in Sovereign Gauntlet & Overdrive
    this.fieldRefitDroneRig = createFieldRefitDroneRig();
    this.fieldRefitDroneRig.root.visible = false;
    this.scene.add(this.fieldRefitDroneRig.root);

    // EXPEDITION JOURNEY 3D ARCHITECTURE — South Entry Boarding Airlock, North Sector Transit Airlock, Central Breach Seal & 3D Floor Chevron Guide Trail
    this.entryAirlockRig = createEntryBoardingAirlockRig();
    this.entryAirlockRig.root.position.set(0, 0, 17.4);
    this.entryAirlockRig.root.visible = false;
    this.scene.add(this.entryAirlockRig.root);

    this.transitAirlockRig = createSectorTransitAirlockRig();
    this.transitAirlockRig.root.position.set(0, 0, -16.4);
    this.transitAirlockRig.root.visible = false;
    this.scene.add(this.transitAirlockRig.root);

    this.breachSealRig = createBreachSealRig();
    this.breachSealRig.root.position.set(0, 0.02, 0);
    this.breachSealRig.root.visible = false;
    this.scene.add(this.breachSealRig.root);

    this.expeditionTrailRig = createExpeditionTrailRig(8);
    this.expeditionTrailRig.root.visible = false;
    this.scene.add(this.expeditionTrailRig.root);

    this.safeRoomHubRig = createSafeRoomHubRig();
    this.safeRoomHubRig.root.visible = false;
    this.scene.add(this.safeRoomHubRig.root);

    this.secretVaultRig = createSecretEchoVaultRig();
    this.secretVaultRig.root.visible = false;
    this.scene.add(this.secretVaultRig.root);

    this.combatDroneRig = createAutonomousCombatDroneRig();
    this.combatDroneRig.root.visible = false;
    this.scene.add(this.combatDroneRig.root);

    // Pre-allocated 4-part Dorsal Boss Echo Core Sigil (Octahedron crystal + 2 gyroscopic rings + spine mount)
    {
      const sigilRoot = new THREE.Group();
      sigilRoot.visible = false;
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        emissiveIntensity: 2.1,
        metalness: 0.35,
        roughness: 0.18,
      });
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x22d3ee,
        emissiveIntensity: 1.75,
        metalness: 0.72,
        roughness: 0.22,
      });
      const mountMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.85,
        roughness: 0.32,
      });
      const spineMount = new THREE.Mesh(
        new THREE.CylinderGeometry(0.032, 0.052, 0.22, 8),
        mountMat
      );
      spineMount.rotation.x = Math.PI * 0.5;
      spineMount.position.set(0, 0, 0.12);
      const crystalMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.145, 0), crystalMat);
      const outerRing = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.02, 8, 28), ringMat);
      const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.016, 8, 24), ringMat);
      innerRing.rotation.y = Math.PI * 0.28;

      const omegaMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfbbf24,
        emissiveIntensity: 2.1,
        metalness: 0.9,
        roughness: 0.16,
      });
      const omegaCrownRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.014, 8, 24, Math.PI * 1.45),
        omegaMat
      );
      omegaCrownRing.position.set(0, 0.27, 0);
      omegaCrownRing.rotation.z = -Math.PI * 0.225;
      omegaCrownRing.visible = false;

      const wingGeom = new THREE.ConeGeometry(0.055, 0.34, 4);
      const omegaWingLeft = new THREE.Mesh(wingGeom, omegaMat);
      omegaWingLeft.position.set(-0.34, 0.06, -0.02);
      omegaWingLeft.rotation.z = Math.PI * 0.32;
      omegaWingLeft.visible = false;

      const omegaWingRight = new THREE.Mesh(wingGeom, omegaMat);
      omegaWingRight.position.set(0.34, 0.06, -0.02);
      omegaWingRight.rotation.z = -Math.PI * 0.32;
      omegaWingRight.visible = false;

      sigilRoot.add(
        spineMount,
        crystalMesh,
        outerRing,
        innerRing,
        omegaCrownRing,
        omegaWingLeft,
        omegaWingRight
      );
      this.scene.add(sigilRoot);
      this.bossCoreSigilRig = {
        root: sigilRoot,
        crystalMesh,
        outerRing,
        innerRing,
        omegaCrownRing,
        omegaWingLeft,
        omegaWingRight,
        crystalMat,
        ringMat,
        omegaMat,
      };
    }

    this.finisherRiftRig = createChronoFinisherRiftRig();
    this.finisherRiftRig.root.visible = false;
    this.scene.add(this.finisherRiftRig.root);

    this.photoDroneRig = createPhotoDroneRig();
    this.photoDroneRig.root.visible = false;
    this.scene.add(this.photoDroneRig.root);

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

    // v2.7.0: 4-Slot Pooled Additive GLSL Plasma Shockwave Rings (Heavy hits, Parries, Overcharges, Staggers)
    const impactGeo = new THREE.PlaneGeometry(2.6, 2.6, 1, 1);
    impactGeo.rotateX(-Math.PI * 0.5);
    impactGeo.userData.sharedAsset = true;
    this.impactRingPool = [];
    for (let i = 0; i < 4; i++) {
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: new THREE.Color(0x22d3ee) },
          uProgress: { value: 0 },
          uOpacity: { value: 0 },
          uTime: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uProgress;
          uniform float uOpacity;
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vec2 p = vUv * 2.0 - 1.0;
            float r = length(p);
            if (r > 1.0) discard;
            float angle = atan(p.y, p.x);
            float wave = 0.018 * sin(angle * 8.0 + uTime * 11.0) + 0.012 * cos(angle * 13.0 - uTime * 7.0);
            float radius = mix(0.24, 0.94, uProgress) + wave * (1.0 - uProgress * 0.5);
            float outerBand = smoothstep(radius - 0.14, radius, r) * (1.0 - smoothstep(radius, radius + 0.055, r));
            float coreEdge = exp(-pow((r - radius) / 0.028, 2.0));
            float innerWake = smoothstep(radius - 0.34, radius - 0.04, r) * (1.0 - smoothstep(radius - 0.04, radius, r)) * 0.36;
            float alpha = clamp((outerBand * 0.85 + coreEdge * 1.15 + innerWake) * uOpacity, 0.0, 1.0);
            vec3 col = mix(uColor, vec3(1.0, 0.99, 0.95), coreEdge * 0.72);
            gl_FragColor = vec4(col, alpha);
          }
        `,
      });
      const mesh = new THREE.Mesh(impactGeo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.impactRingPool.push({ mesh, mat, timer: 0, duration: 0.28, maxScale: 3.1 });
    }
    this.impactRingMesh = this.impactRingPool[0]?.mesh;

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

    // v2.6.0: Pooled Custom GLSL Energy Slash Arc Ribbons (6 additive plasma crescents)
    const slashRibbonGeo = new THREE.RingGeometry(
      0.88,
      2.18,
      28,
      1,
      -Math.PI * 0.48,
      Math.PI * 0.96
    );
    slashRibbonGeo.rotateX(-Math.PI * 0.5);
    const slashVertexShader = `
      varying vec2 vPos2d;
      void main() {
        vPos2d = position.xz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    const slashFragmentShader = `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uProgress;
      varying vec2 vPos2d;
      void main() {
        float r = length(vPos2d);
        float radialNorm = clamp((r - 0.88) / (2.18 - 0.88), 0.0, 1.0);
        // Razor-sharp outer cutting edge with soft plasma inner wake
        float outerEdge = smoothstep(0.68, 0.98, radialNorm) * (1.0 - smoothstep(0.96, 1.0, radialNorm));
        float bodyGlow = pow(radialNorm, 1.35) * (1.0 - smoothstep(0.93, 1.0, radialNorm));
        // Angular taper from leading blade tip to trailing wake
        float angle = atan(vPos2d.y, vPos2d.x);
        float angNorm = clamp((angle + 1.508) / 3.016, 0.0, 1.0);
        float leadTip = smoothstep(0.0, 0.25, angNorm) * smoothstep(1.0, 0.84, angNorm);
        float streak = 0.78 + 0.22 * sin(radialNorm * 18.0 - uProgress * 12.0);
        float alpha = (bodyGlow * 0.65 + outerEdge * 1.15) * leadTip * streak * uOpacity;
        vec3 hotCore = mix(uColor, vec3(1.0, 0.98, 0.94), clamp(outerEdge * 0.85 + pow(angNorm, 3.0) * 0.4, 0.0, 1.0));
        gl_FragColor = vec4(hotCore * 1.25, alpha);
      }
    `;
    for (let i = 0; i < SLASH_RIBBON_POOL_SIZE; i++) {
      const rGroup = new THREE.Group();
      rGroup.visible = false;
      const rMat = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(0x22d3ee) },
          uOpacity: { value: 0 },
          uProgress: { value: 0 },
        },
        vertexShader: slashVertexShader,
        fragmentShader: slashFragmentShader,
        transparent: true,
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

    // v3.9.0: Pre-allocate 6-slot Pose-Matched 3D Sera Holographic Afterimage Pool & 3D Clockwork Slip-Ring (Zero-GC)
    for (let i = 0; i < 6; i++) {
      const ghost = createEchoAfterimageGhost(0.42);
      ghost.root.visible = false;
      this.scene.add(ghost.root);
      this.playerAfterimagePool.push({
        active: false,
        age: 0,
        maxAge: 0.45,
        baseOpacity: 0.42,
        ghost,
      });
    }

    const slipGroup = new THREE.Group();
    slipGroup.visible = false;
    const slipOuterGeo = new THREE.RingGeometry(2.08, 2.32, 36);
    slipOuterGeo.rotateX(-Math.PI * 0.5);
    const slipOuterMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const slipOuterMesh = new THREE.Mesh(slipOuterGeo, slipOuterMat);
    slipOuterMesh.position.y = 0.045;
    slipGroup.add(slipOuterMesh);

    const slipInnerGeo = new THREE.RingGeometry(1.12, 1.26, 24);
    slipInnerGeo.rotateX(-Math.PI * 0.5);
    const slipInnerMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const slipInnerMesh = new THREE.Mesh(slipInnerGeo, slipInnerMat);
    slipInnerMesh.position.y = 0.055;
    slipGroup.add(slipInnerMesh);

    const slipTickGeo = new THREE.BoxGeometry(0.055, 0.015, 0.34);
    const slipTicksMat = new THREE.MeshBasicMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.68,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const slipTicksMesh = new THREE.InstancedMesh(slipTickGeo, slipTicksMat, 12);
    const tickDummy = new THREE.Object3D();
    for (let t = 0; t < 12; t++) {
      const ang = (t / 12) * Math.PI * 2;
      tickDummy.position.set(Math.sin(ang) * 1.72, 0.05, Math.cos(ang) * 1.72);
      tickDummy.rotation.set(0, ang, 0);
      tickDummy.scale.setScalar(t % 3 === 0 ? 1.25 : 0.85);
      tickDummy.updateMatrix();
      slipTicksMesh.setMatrixAt(t, tickDummy.matrix);
    }
    slipTicksMesh.instanceMatrix.needsUpdate = true;
    slipTicksMesh.computeBoundingSphere();
    slipGroup.add(slipTicksMesh);
    this.scene.add(slipGroup);
    this.temporalSlipRingGroup = slipGroup;
    this.temporalSlipOuterRing = slipOuterMesh;
    this.temporalSlipOuterMat = slipOuterMat;
    this.temporalSlipInnerRing = slipInnerMesh;
    this.temporalSlipInnerMat = slipInnerMat;
    this.temporalSlipTicksMesh = slipTicksMesh;
    this.temporalSlipTicksMat = slipTicksMat;

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

    // v2.8.0: Custom Additive GLSL Twin-Sync Plasma Tether Beam wrapping Sera <-> Echo link
    const twinSyncGeo = new THREE.CylinderGeometry(0.085, 0.085, 1, 12, 1, true);
    twinSyncGeo.rotateX(Math.PI * 0.5);
    twinSyncGeo.userData.sharedAsset = true;
    this.twinSyncBeamMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uColor: { value: new THREE.Color(0x22d3ee) },
        uTime: { value: 0 },
        uIntensity: { value: 0.7 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uTime;
        uniform float uIntensity;
        varying vec2 vUv;
        void main() {
          float endFade = smoothstep(0.0, 0.14, vUv.y) * smoothstep(1.0, 0.86, vUv.y);
          float pulseA = 0.5 + 0.5 * sin(vUv.y * 22.0 - uTime * 9.5);
          float pulseB = 0.5 + 0.5 * cos(vUv.y * 13.0 + uTime * 6.2);
          float core = 0.42 + 0.58 * pow(pulseA * 0.65 + pulseB * 0.35, 1.4);
          vec3 col = mix(uColor, vec3(1.0, 0.98, 0.94), core * 0.45);
          float alpha = clamp(endFade * core * uIntensity, 0.0, 0.95);
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
    this.twinSyncBeamMesh = new THREE.Mesh(twinSyncGeo, this.twinSyncBeamMat);
    this.twinSyncBeamMesh.visible = false;
    this.scene.add(this.twinSyncBeamMesh);

    // v2.8.0: 160 Floating 3D Orbital Atmospheric Motes (GPU-animated soft radial bokeh GLSL)
    const moteCount = 160;
    const motePositions = new Float32Array(moteCount * 3);
    const motePhases = new Float32Array(moteCount);
    const moteSizes = new Float32Array(moteCount);
    for (let i = 0; i < moteCount; i++) {
      const seedA = Math.sin(i * 12.9898 + 4.1414) * 43758.5453;
      const seedB = Math.sin(i * 78.233 + 1.618) * 24634.6345;
      const seedC = Math.sin(i * 39.425 + 9.21) * 19191.1919;
      const fracA = seedA - Math.floor(seedA);
      const fracB = seedB - Math.floor(seedB);
      const fracC = seedC - Math.floor(seedC);
      motePositions[i * 3] = (fracA * 2 - 1) * 17.5;
      motePositions[i * 3 + 1] = 0.65 + fracB * 5.6;
      motePositions[i * 3 + 2] = (fracC * 2 - 1) * 17.5;
      motePhases[i] = fracA * Math.PI * 2;
      moteSizes[i] = 10.0 + fracB * 14.0;
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePositions, 3));
    moteGeo.setAttribute('aPhase', new THREE.BufferAttribute(motePhases, 1));
    moteGeo.setAttribute('aSize', new THREE.BufferAttribute(moteSizes, 1));
    this.ambientMotesMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x38bdf8) },
        uOpacity: { value: 0.42 },
      },
      vertexShader: `
        attribute float aPhase;
        attribute float aSize;
        uniform float uTime;
        varying float vTwinkle;
        void main() {
          vec3 pos = position;
          pos.x += sin(uTime * 0.42 + aPhase) * 0.55;
          pos.y += mod(uTime * 0.16 + aPhase, 5.4) - 2.4;
          pos.z += cos(uTime * 0.36 + aPhase * 1.3) * 0.55;
          vTwinkle = 0.55 + 0.45 * sin(uTime * 1.8 + aPhase * 2.1);
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = clamp(aSize * (16.0 / max(2.5, -mvPosition.z)), 2.0, 26.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        varying float vTwinkle;
        void main() {
          vec2 c = gl_PointCoord - vec2(0.5);
          float d = length(c);
          if (d > 0.5) discard;
          float glow = pow(1.0 - d * 2.0, 2.0);
          vec3 col = mix(uColor, vec3(1.0, 0.99, 0.96), glow * 0.5);
          gl_FragColor = vec4(col, glow * uOpacity * vTwinkle);
        }
      `,
    });
    this.ambientMotesPoints = new THREE.Points(moteGeo, this.ambientMotesMat);
    this.ambientMotesPoints.frustumCulled = false;
    this.scene.add(this.ambientMotesPoints);

    // v2.9.0: Animated 3D Holographic Arena Floor Scan Pulse Shader (subtle radial deck sweep)
    const arenaPulseGeo = new THREE.PlaneGeometry(34, 34);
    arenaPulseGeo.rotateX(-Math.PI * 0.5);
    arenaPulseGeo.userData.sharedAsset = true;
    this.arenaPulseMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x22d3ee) },
        uIntensity: { value: 0.16 },
        uSpeed: { value: 0.26 },
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
        uniform float uIntensity;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float r = length(p);
          if (r > 0.98) discard;
          float sweep = fract(uTime * uSpeed);
          float band = exp(-pow((r - sweep) / 0.032, 2.0));
          float trail = smoothstep(sweep - 0.16, sweep, r) * (1.0 - smoothstep(sweep, sweep + 0.015, r)) * 0.35;
          float edgeFade = smoothstep(0.04, 0.18, r) * (1.0 - smoothstep(0.75, 0.98, r));
          float alpha = clamp((band + trail) * edgeFade * uIntensity, 0.0, 0.45);
          if (alpha < 0.004) discard;
          vec3 col = mix(uColor, vec3(0.96, 0.99, 1.0), band * 0.45);
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
    this.arenaPulseMesh = new THREE.Mesh(arenaPulseGeo, this.arenaPulseMat);
    this.arenaPulseMesh.position.y = 0.044;
    this.scene.add(this.arenaPulseMesh);

    // v2.9.0: 4 Volumetric Overhead Orbital Light Shaft Cones (soft Fresnel-faded GLSL atmosphere)
    this.lightShaftsGroup = new THREE.Group();
    const shaftGeo = new THREE.CylinderGeometry(1.15, 3.8, 15.5, 18, 1, true);
    shaftGeo.userData.sharedAsset = true;
    this.lightShaftMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uColor: { value: new THREE.Color(0x38bdf8) },
        uOpacity: { value: 0.055 },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormalDir;
        varying vec3 vViewDir;
        void main() {
          vUv = uv;
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vNormalDir = normalize(normalMatrix * normal);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormalDir;
        varying vec3 vViewDir;
        void main() {
          float vertFade = smoothstep(0.0, 0.38, vUv.y) * smoothstep(1.0, 0.48, vUv.y);
          float edgeSoft = pow(abs(dot(vNormalDir, vViewDir)), 1.65);
          float shimmer = 0.88 + 0.12 * sin(uTime * 0.9 + vUv.x * 6.2831);
          float alpha = vertFade * edgeSoft * uOpacity * shimmer;
          if (alpha < 0.002) discard;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
    });
    const shaftConfigs: Array<[number, number, number, number]> = [
      [-8.5, -8.5, 0.24, -0.24],
      [8.5, -8.5, 0.24, 0.24],
      [-9.2, 7.2, -0.22, -0.24],
      [9.2, 7.2, -0.22, 0.24],
    ];
    for (let s = 0; s < shaftConfigs.length; s++) {
      const [sx, sz, rx, rz] = shaftConfigs[s];
      const cone = new THREE.Mesh(shaftGeo, this.lightShaftMat);
      cone.position.set(sx, 7.2, sz);
      cone.rotation.set(rx, 0, rz);
      this.lightShaftsGroup.add(cone);
    }
    this.scene.add(this.lightShaftsGroup);

    // v2.9.0: Diegetic 3D Weakpoint Execution Halo (hovers over staggered / core-exposed priority target)
    const wpHaloGeo = new THREE.PlaneGeometry(3.2, 3.2);
    wpHaloGeo.rotateX(-Math.PI * 0.5);
    wpHaloGeo.userData.sharedAsset = true;
    this.weakpointHaloMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xfbbf24) },
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
        varying vec2 vUv;
        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float r = length(p);
          if (r > 1.0) discard;
          float ang = atan(p.y, p.x);
          float seg = step(0.15, sin(ang * 4.0 + uTime * 4.2));
          float outerRing = exp(-pow((r - 0.84) / 0.045, 2.0)) * (0.45 + 0.55 * seg);
          float innerRing = exp(-pow((r - 0.54) / 0.028, 2.0)) * 0.72;
          float pulse = 0.75 + 0.25 * sin(uTime * 8.5);
          float alpha = clamp((outerRing + innerRing) * pulse, 0.0, 0.92);
          if (alpha < 0.01) discard;
          vec3 col = mix(uColor, vec3(1.0, 0.98, 0.92), innerRing * 0.65);
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
    this.weakpointHaloMesh = new THREE.Mesh(wpHaloGeo, this.weakpointHaloMat);
    this.weakpointHaloMesh.visible = false;
    this.scene.add(this.weakpointHaloMesh);

    // v3.0.0: 3D Diegetic Chrono Nexus Constellation Mandala beneath Sera (visible at Nexus ×2 / ×3 / ×4)
    const nexusAuraGeo = new THREE.PlaneGeometry(4.2, 4.2, 1, 1);
    nexusAuraGeo.rotateX(-Math.PI * 0.5);
    nexusAuraGeo.userData.sharedAsset = true;
    this.nexusAuraMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0x22d3ee) },
        uLinks: { value: 2.0 },
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
        uniform float uLinks;
        varying vec2 vUv;
        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float r = length(p);
          if (r > 1.0 || r < 0.22) discard;
          float ang = atan(p.y, p.x);
          float petals = max(4.0, uLinks * 2.0);
          float wave = 0.5 + 0.5 * cos(ang * petals - uTime * 2.6);
          float outerBand = exp(-pow((r - 0.86) / 0.032, 2.0)) * (0.45 + 0.55 * wave);
          float innerHex = exp(-pow((r - (0.58 + 0.05 * sin(ang * petals + uTime * 3.2))) / 0.024, 2.0)) * 0.72;
          float spokes = exp(-pow(abs(sin(ang * (petals * 0.5) - uTime * 1.3)), 2.0) * 65.0) * smoothstep(0.9, 0.35, r) * 0.28;
          float alpha = clamp((outerBand + innerHex + spokes) * (0.52 + 0.1 * uLinks), 0.0, 0.85);
          if (alpha < 0.01) discard;
          vec3 col = mix(uColor, vec3(1.0, 0.98, 0.94), innerHex * 0.48);
          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
    this.nexusAuraMesh = new THREE.Mesh(nexusAuraGeo, this.nexusAuraMat);
    this.nexusAuraMesh.visible = false;
    this.scene.add(this.nexusAuraMesh);

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

    // HARMONIC PYLON — Tapered Gold-Banded Cyan Resonance Obelisk (Sheet 3, Panel 8 Match)
    this.choirNodesGroup = new THREE.Group();
    this.choirNodesGroup.visible = false;
    const pylonDarkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x252f3d,
      roughness: 0.36,
      metalness: 0.78,
    });
    const pylonGoldBandMat = new THREE.MeshStandardMaterial({
      color: 0xd4a948,
      roughness: 0.24,
      metalness: 0.9,
    });
    const pylonBaseSlateMat = new THREE.MeshStandardMaterial({
      color: 0x161f2b,
      roughness: 0.42,
      metalness: 0.74,
    });
    for (let n = 0; n < 3; n++) {
      const nGroup = new THREE.Group();

      // Illuminated Hexagonal Floor Plinth Base
      const hexBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.92, 1.08, 0.2, 6),
        pylonBaseSlateMat
      );
      hexBase.position.y = 0.1;
      nGroup.add(hexBase);

      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x06b6d4,
        emissiveIntensity: 1.75,
        roughness: 0.14,
        metalness: 0.35,
      });

      // Glowing Hexagonal Floor Border Trace
      const hexGlowBorder = new THREE.Mesh(
        new THREE.TorusGeometry(0.94, 0.036, 8, 6),
        coreMat
      );
      hexGlowBorder.rotation.x = Math.PI / 2;
      hexGlowBorder.position.y = 0.21;
      nGroup.add(hexGlowBorder);

      // Tapered Hexagonal Dark-Metallic Obelisk Spire (lower taper + main upper taper)
      const lowerSpire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.46, 0.28, 0.52, 6),
        pylonDarkSteelMat
      );
      lowerSpire.position.y = 0.46;
      nGroup.add(lowerSpire);

      const upperSpire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.46, 1.72, 6),
        pylonDarkSteelMat
      );
      upperSpire.position.y = 1.58;
      nGroup.add(upperSpire);

      // 2 Crisp Antique-Gold Conductor Bands Wrapping the Obelisk
      const lowerGoldBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.46, 0.09, 6),
        pylonGoldBandMat
      );
      lowerGoldBand.position.y = 0.72;
      nGroup.add(lowerGoldBand);

      const upperGoldBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.34, 0.09, 6),
        pylonGoldBandMat
      );
      upperGoldBand.position.y = 1.88;
      nGroup.add(upperGoldBand);

      // 3 Vertical Glowing Cyan Energy Channels Recessed Up the Obelisk Faces
      for (let ch = 0; ch < 3; ch++) {
        const chAngle = (ch * Math.PI * 2) / 3 + Math.PI / 6;
        const channel = new THREE.Mesh(
          new THREE.BoxGeometry(0.068, 1.66, 0.068),
          coreMat
        );
        channel.position.set(Math.cos(chAngle) * 0.36, 1.48, Math.sin(chAngle) * 0.36);
        channel.rotation.y = -chAngle;
        channel.rotation.z = -0.11;
        nGroup.add(channel);
      }

      // Floating Crown Resonance Beacon Crystal (coreMesh — rotates & pulses smoothly)
      const columnMesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.24, 0),
        coreMat
      );
      columnMesh.position.y = 2.66;
      nGroup.add(columnMesh);

      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const rGeo = new THREE.RingGeometry(1.15, 1.38, 6);
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

    // GRAVITY MINE — Spherical Brushed-Titanium Snare Core, 3 Articulated Stabilizer Fins & Ultraviolet Singularity Lens (Sheet 5, Panel 6)
    const gPinGeo = new THREE.RingGeometry(0.4, 1.0, 36);
    gPinGeo.rotateX(-Math.PI * 0.5);
    this.gravityPinMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.gravityPinMesh = new THREE.Mesh(gPinGeo, this.gravityPinMat);
    this.gravityPinMesh.visible = false;
    this.gravityPinMesh.position.y = 0.05;
    this.scene.add(this.gravityPinMesh);

    // SHEET 11 · SINGULARITY GRENADE (Panel 6) — Spherical Gunmetal Gravity Device with Amber Arming Ring & Violet-Cyan Micro Black Hole Core
    this.singularityGrenadeRig = createSingularityGrenadeRig();
    this.gravityMineGroup = this.singularityGrenadeRig.root;
    this.gravityMineGroup.visible = false;
    this.scene.add(this.gravityMineGroup);

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

    // CHRONO SEVER — Glossy White-Ceramic & Crimson Cylindrical Laser-Cage Projector Stakes with 3-Prong Titanium Claws & Red Scanner Rings (Sheet 8, Panel 7)
    this.chronoSeverStrutsGroup = new THREE.Group();
    this.chronoSeverStrutsGroup.visible = false;
    this.chronoSeverStrutMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    });
    const severCeramicMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.22,
      metalness: 0.24,
    });
    const severTitaniumMat = new THREE.MeshStandardMaterial({
      color: 0x262c36,
      roughness: 0.36,
      metalness: 0.85,
    });
    const severRingMat = new THREE.MeshBasicMaterial({
      color: 0xe11d48,
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const severBodyGeo = new THREE.CylinderGeometry(0.068, 0.068, 1.32, 10);
    const severCapGeo = new THREE.CylinderGeometry(0.072, 0.072, 0.1, 10);
    const severSlitGeo = new THREE.BoxGeometry(0.028, 1.05, 0.145);
    const severClawGeo = new THREE.BoxGeometry(0.032, 0.42, 0.055);
    const severRingGeo = new THREE.TorusGeometry(0.115, 0.022, 8, 18);
    severRingGeo.rotateX(Math.PI / 2);

    for (let s = 0; s < 12; s++) {
      const angle = (s / 12) * Math.PI * 2;
      const stake = new THREE.Group();
      stake.position.set(Math.sin(angle), 0, Math.cos(angle));
      stake.rotation.y = angle;
      // 3-prong dark-titanium ground anchor claws
      for (let c = 0; c < 3; c++) {
        const ca = (c / 3) * Math.PI * 2;
        const claw = new THREE.Mesh(severClawGeo, severTitaniumMat);
        claw.position.set(Math.sin(ca) * 0.085, 0.22, Math.cos(ca) * 0.085);
        claw.rotation.y = ca;
        claw.rotation.x = 0.2;
        stake.add(claw);
      }
      // White ceramic cylindrical stake shaft + crimson top collar + vertical glowing crimson emitter slits
      const body = new THREE.Mesh(severBodyGeo, severCeramicMat);
      body.position.y = 1.08;
      stake.add(body);
      const topTrim = new THREE.Mesh(severCapGeo, this.chronoSeverStrutMat);
      topTrim.position.y = 1.72;
      stake.add(topTrim);
      const slit = new THREE.Mesh(severSlitGeo, this.chronoSeverStrutMat);
      slit.position.y = 1.08;
      stake.add(slit);
      // Glowing translucent crimson scanner ring collar around lower stake
      const scannerRing = new THREE.Mesh(severRingGeo, severRingMat);
      scannerRing.position.y = 0.56;
      stake.add(scannerRing);
      this.chronoSeverStrutsGroup.add(stake);
    }
    this.scene.add(this.chronoSeverStrutsGroup);

    // ECHO COLLAPSE — Fractured Dark-Titanium & Antique-Gold Containment Cage around Blazing Cyan-Gold Rift Core (Sheet 7, Panel 1)
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

    this.echoCollapseCoreGroup = new THREE.Group();
    this.echoCollapseCoreGroup.visible = false;
    const ecShellMat = new THREE.MeshStandardMaterial({
      color: 0x252e3a,
      roughness: 0.34,
      metalness: 0.84,
    });
    const ecGoldMat = new THREE.MeshStandardMaterial({
      color: 0xd4ad52,
      roughness: 0.26,
      metalness: 0.9,
    });
    const ecCyanMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x22d3ee,
      emissiveIntensity: 1.75,
      roughness: 0.12,
      metalness: 0.2,
    });
    const ecRiftOrb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.42, 1),
      new THREE.MeshBasicMaterial({ color: 0xe0f2fe })
    );
    this.echoCollapseCoreGroup.add(ecRiftOrb);
    this.echoCollapseGyroA = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.036, 8, 28), ecCyanMat);
    this.echoCollapseGyroA.rotation.set(0.6, 0.25, 0);
    this.echoCollapseCoreGroup.add(this.echoCollapseGyroA);
    this.echoCollapseGyroB = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.032, 8, 28), ecCyanMat);
    this.echoCollapseGyroB.rotation.set(-0.55, 0.95, 0.4);
    this.echoCollapseCoreGroup.add(this.echoCollapseGyroB);
    this.echoCollapsePetals = [];
    for (let ep = 0; ep < 4; ep++) {
      const ea = (ep / 4) * Math.PI * 2;
      const petalPivot = new THREE.Group();
      petalPivot.rotation.y = ea;
      const armor = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.95, 0.16, 2, 0.04), ecShellMat);
      armor.position.z = 0.78;
      petalPivot.add(armor);
      const goldTrim = new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.72, 0.07, 1, 0.02), ecGoldMat);
      goldTrim.position.z = 0.84;
      petalPivot.add(goldTrim);
      this.echoCollapseCoreGroup.add(petalPivot);
      this.echoCollapsePetals.push(petalPivot);
    }
    this.scene.add(this.echoCollapseCoreGroup);

    // Enemy Rigs
    this.syncEnemyRigs(initialWorld);
    this.syncCustomMeshyModels(initialWorld);

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
      dynamicScaleFactor: number;
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
        dynamicScaleFactor: this.dynamicScaleFactor ?? 1.0,
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
    if (this.impactRingPool) {
      for (let i = 0; i < this.impactRingPool.length; i++) {
        this.impactRingPool[i].timer = 0;
        this.impactRingPool[i].mesh.visible = false;
      }
    }
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
    this.syncCustomMeshyModels(world);
  }

  private applyMeshySlotOverride(
    slotGroup: THREE.Group | undefined,
    proceduralGroup: THREE.Group | undefined,
    slotId: MeshyAssetSlotId | null
  ): void {
    if (!slotGroup || !proceduralGroup) return;
    while (slotGroup.children.length > 0) {
      const child = slotGroup.children[0];
      slotGroup.remove(child);
    }
    if (!slotId || !meshyAssetRegistry.hasSlot(slotId)) {
      slotGroup.visible = false;
      proceduralGroup.visible = true;
      return;
    }
    const clone = meshyAssetRegistry.cloneForRig(slotId);
    if (!clone) {
      slotGroup.visible = false;
      proceduralGroup.visible = true;
      return;
    }
    slotGroup.add(clone);
    slotGroup.visible = true;
    proceduralGroup.visible = false;
  }

  public syncCustomMeshyModels(_world?: WorldState | null): void {
    if (this.disposed) return;
    this.applyMeshySlotOverride(
      this.playerRig?.customMeshySlot,
      this.playerRig?.bodyGroup,
      'player'
    );
    if (this.enemyRigs) {
      for (const rig of this.enemyRigs.values()) {
        const mappedSlot: MeshyAssetSlotId | null =
          rig.archetype === 'phase_stalker' ||
          rig.archetype === 'chrono_mortar' ||
          rig.archetype === 'resonance_warden' ||
          rig.archetype === 'bastion' ||
          rig.archetype === 'scrapper' ||
          rig.archetype === 'scout' ||
          rig.archetype === 'helix' ||
          rig.archetype === 'warden_prime'
            ? rig.archetype
            : null;
        this.applyMeshySlotOverride(rig.customMeshySlot, rig.bodyGroup, mappedSlot);
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
    duration = 0.28,
    maxScale = 2.95
  ): void {
    if (this.screenEffectsEnabled === false || !this.impactRingPool || this.impactRingPool.length === 0) {
      return;
    }
    const slot = this.impactRingPool[this.impactRingNextIdx % this.impactRingPool.length];
    this.impactRingNextIdx = (this.impactRingNextIdx + 1) % this.impactRingPool.length;
    slot.mesh.position.set(x, y, z);
    slot.mesh.scale.setScalar(0.65);
    slot.mat.uniforms.uColor.value.setHex(hexColor);
    slot.mat.uniforms.uProgress.value = 0;
    slot.mat.uniforms.uOpacity.value = 0.95;
    slot.mesh.visible = true;
    slot.duration = Math.max(0.1, duration);
    slot.timer = slot.duration;
    slot.maxScale = maxScale;
    this.impactRingTimer = Math.max(this.impactRingTimer, slot.timer);
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

  public setLocale(locale: AppLocale): void {
    this.locale = locale;
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
    const specs = formatCombatCallouts(events, this.locale);
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

  public projectWorldToViewport(
    x: number,
    y: number,
    z: number
  ): { x: number; y: number; visible: boolean } {
    if (!this.camera) {
      return { x: 0, y: 0, visible: false };
    }
    const vw = this.viewportWidth || 1280;
    const vh = this.viewportHeight || 720;
    _projVec.set(x, y, z).project(this.camera);
    const projected = projectNdcToViewport(_projVec.x, _projVec.y, _projVec.z, vw, vh);
    return {
      x: projected.x,
      y: projected.y,
      visible: projected.visible,
    };
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
        case 'player_perfect_dodge': {
          this.spawnBurst(ev.x, 1.05, ev.z, 18, 0x67e8f9, 7.8);
          this.spawnBurst(ev.x, 1.15, ev.z, 10, 0xffffff, 6.2);
          this.triggerImpactRing(ev.x, 0.18, ev.z, 0x67e8f9, 0.3);
          const pdYaw = this.playerRig?.root?.rotation?.y ?? 0;
          this.spawnPlayerAfterimage(ev.x, ev.z, pdYaw, 0x67e8f9, 0.48, 0.52);
          if (!this.reducedMotion) {
            this.hitstopTimer = Math.max(this.hitstopTimer ?? 0, 0.042);
            this.fovKick = Math.max(this.fovKick ?? 0, 1.85);
          }
          break;
        }
        case 'temporal_slip_triggered': {
          const slipYaw = this.playerRig?.root?.rotation?.y ?? 0;
          const backX = -Math.sin(slipYaw);
          const backZ = -Math.cos(slipYaw);
          const sideX = Math.cos(slipYaw);
          const sideZ = -Math.sin(slipYaw);
          this.spawnPlayerAfterimage(ev.x + backX * 0.42 + sideX * 0.68, ev.z + backZ * 0.42 + sideZ * 0.68, slipYaw + 0.14, 0x67e8f9, 0.58, 0.32);
          this.spawnPlayerAfterimage(ev.x + backX * 0.48 - sideX * 0.68, ev.z + backZ * 0.48 - sideZ * 0.68, slipYaw - 0.14, 0xc084fc, 0.58, 0.28);
          this.spawnPlayerAfterimage(ev.x + backX * 0.92, ev.z + backZ * 0.92, slipYaw, 0x38bdf8, 0.52, 0.22);
          this.spawnBurst(ev.x, 1.2, ev.z, 22, 0xc084fc, 8.2);
          this.triggerImpactRing(ev.x, 0.12, ev.z, 0xc084fc, 0.52, 2.8);
          if (!this.reducedMotion) {
            this.fovKick = Math.max(this.fovKick ?? 0, 2.35);
          }
          break;
        }
        case 'sovereign_astral_pulse': {
          this.spawnBurst(ev.x, 1.32, ev.z, 26, 0xfde047, 9.2);
          this.spawnBurst(ev.x, 1.05, ev.z, 18, 0x67e8f9, 7.6);
          this.triggerImpactRing(ev.x, 0.14, ev.z, 0xfbbf24, 0.56, 3.6);
          this.triggerImpactRing(ev.x, 0.22, ev.z, 0xc084fc, 0.42, 2.7);
          if (!this.reducedMotion) {
            this.fovKick = Math.max(this.fovKick ?? 0, 2.65);
          }
          break;
        }
        case 'mastery_bounty_claimed':
          this.spawnBurst(ev.x, 1.55, ev.z, 28, 0xfde047, 8.4);
          this.spawnBurst(ev.x, 1.2, ev.z, 16, 0x67e8f9, 6.4);
          this.triggerImpactRing(ev.x, 0.18, ev.z, 0xfbbf24, 0.48, 2.4);
          break;
        case 'player_damaged':
          this.spawnBurst(ev.x, 1.1, ev.z, 14, 0xef4444, 6.5);
          break;
        case 'player_dodge': {
          this.spawnBurst(ev.x, 0.4, ev.z, 6, 0x22d3ee, 3.8);
          const dYaw = this.playerRig?.root?.rotation?.y ?? 0;
          this.spawnPlayerAfterimage(ev.x, ev.z, dYaw, 0x22d3ee, 0.34, 0.38);
          break;
        }
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
        case 'phase_stalker_blink':
          if (typeof ev.originX === 'number' && typeof ev.originZ === 'number') {
            this.spawnBurst(ev.originX, 1.0, ev.originZ, 16, 0xa855f7, 6.2);
          }
          this.spawnBurst(ev.x, 1.05, ev.z, 20, 0xe879f9, 7.6);
          this.triggerImpactRing(ev.x, 0.16, ev.z, 0xa855f7, 0.28);
          break;
        case 'chrono_mortar_barrage_fired':
          if (typeof ev.originX === 'number' && typeof ev.originZ === 'number') {
            this.spawnBurst(ev.originX, 2.2, ev.originZ, 16, 0xf59e0b, 6.8);
          }
          break;
        case 'chrono_mortar_detonated':
          this.spawnBurst(ev.x, 0.7, ev.z, 24, 0xf97316, 9.0);
          this.spawnBurst(ev.x, 0.9, ev.z, 14, 0xfef08a, 7.2);
          this.triggerImpactRing(ev.x, 0.15, ev.z, 0xf59e0b, 0.36);
          break;
        case 'conductor_tether_severed':
          this.spawnBurst(ev.x, 1.2, ev.z, 20, 0x34d399, 7.4);
          this.spawnBurst(ev.x, 1.25, ev.z, 10, 0xffffff, 6.0);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0x10b981, 0.32);
          break;
        case 'volatile_core_detonated':
          this.spawnBurst(ev.x, 1.0, ev.z, 30, 0xef4444, 10.2);
          this.spawnBurst(ev.x, 1.15, ev.z, 18, 0xf59e0b, 8.2);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0xef4444, 0.44);
          break;
        case 'echo_relay_success':
          if (typeof ev.originX === 'number' && typeof ev.originZ === 'number') {
            this.spawnBurst(ev.originX, 1.0, ev.originZ, 18, 0x38bdf8, 6.8);
            this.spawnPlayerAfterimage(
              ev.originX,
              ev.originZ,
              this.playerRig?.root?.rotation?.y ?? 0,
              0x38bdf8,
              0.44,
              0.46
            );
            if (this.screenEffectsEnabled !== false) {
              this.relayOriginPillarMesh.position.set(ev.originX, 1.4, ev.originZ);
              this.relayOriginPillarMesh.visible = true;
            }
          }
          this.spawnBurst(ev.x, 1.0, ev.z, 24, 0xe0f2fe, 7.6);
          this.spawnPlayerAfterimage(
            ev.x,
            ev.z,
            this.playerRig?.root?.rotation?.y ?? 0,
            0xe0f2fe,
            0.36,
            0.38
          );
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
        case 'temporal_rift_spawned':
          this.spawnBurst(ev.x, 1.1, ev.z, 18, 0xe879f9, 6.8);
          this.spawnBurst(ev.x, 0.9, ev.z, 10, 0x22d3ee, 5.2);
          this.triggerImpactRing(ev.x, 0.16, ev.z, 0xe879f9, 0.42);
          break;
        case 'temporal_rift_sealed':
          this.spawnBurst(ev.x, 1.2, ev.z, 24, 0x22d3ee, 8.6);
          this.spawnBurst(ev.x, 1.35, ev.z, 14, 0xe0f2fe, 6.8);
          this.triggerImpactRing(ev.x, 0.18, ev.z, 0x22d3ee, 0.46);
          this.spawnImpactDecal(ev.x, ev.z, 0x22d3ee, 2.4, 6.5);
          break;
        case 'temporal_rift_ruptured':
          this.spawnBurst(ev.x, 1.25, ev.z, 26, 0xf43f5e, 9.0);
          this.spawnBurst(ev.x, 1.0, ev.z, 16, 0xf59e0b, 7.2);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0xf43f5e, 0.5);
          break;
        case 'recursion_loop_cleared':
          this.spawnBurst(ev.x, 1.3, ev.z, 28, 0x22d3ee, 8.8);
          this.spawnBurst(ev.x, 1.4, ev.z, 16, 0xfbbf24, 7.0);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0xfbbf24, 0.48);
          break;
        case 'recursion_relic_picked':
          this.spawnBurst(ev.x, 1.25, ev.z, 22, 0x34d399, 7.8);
          this.triggerImpactRing(ev.x, 0.18, ev.z, 0x34d399, 0.36);
          break;
        case 'chrono_overdrive_activated':
          this.spawnBurst(ev.x, 1.35, ev.z, 34, 0xfbbf24, 10.5);
          this.spawnBurst(ev.x, 1.25, ev.z, 26, 0x22d3ee, 8.8);
          this.triggerImpactRing(ev.x, 0.22, ev.z, 0xfbbf24, 0.62);
          this.spawnImpactDecal(ev.x, ev.z, 0x38bdf8, 3.6, 4.5);
          break;
        case 'chrono_overdrive_ended':
          this.spawnBurst(ev.x, 1.2, ev.z, 16, 0x38bdf8, 5.4);
          this.triggerImpactRing(ev.x, 0.16, ev.z, 0x38bdf8, 0.32);
          break;
        case 'gauntlet_stage_cleared':
          this.spawnBurst(ev.x, 1.4, ev.z, 30, 0xfbbf24, 9.4);
          this.spawnBurst(ev.x, 1.2, ev.z, 20, 0x34d399, 7.2);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0xfbbf24, 0.56);
          break;
        case 'gauntlet_victory':
          this.spawnBurst(ev.x, 1.6, ev.z, 44, 0xfbbf24, 11.2);
          this.spawnBurst(ev.x, 1.4, ev.z, 32, 0x22d3ee, 9.5);
          this.triggerImpactRing(ev.x, 0.24, ev.z, 0xfbbf24, 0.72);
          break;
        case 'expedition_breach_triggered':
          this.spawnBurst(ev.x, 1.4, ev.z, 34, 0xf59e0b, 9.6);
          this.spawnBurst(ev.x, 1.2, ev.z, 22, 0x38bdf8, 8.0);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0xf59e0b, 0.62);
          break;
        case 'expedition_airlock_unlocked':
          this.spawnBurst(ev.x, 2.1, ev.z, 36, 0x10b981, 9.4);
          this.spawnBurst(ev.x, 1.6, ev.z, 24, 0x22d3ee, 7.8);
          this.triggerImpactRing(ev.x, 0.24, ev.z, 0x10b981, 0.68);
          break;
        case 'expedition_sector_transit':
          this.spawnBurst(ev.x, 1.35, ev.z, 32, 0x38bdf8, 9.0);
          this.spawnBurst(ev.x, 1.25, ev.z, 20, 0x34d399, 7.2);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0x38bdf8, 0.56);
          break;
        case 'safe_room_entered':
          this.spawnBurst(ev.x, 1.4, ev.z, 24, 0x34d399, 7.6);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0x38bdf8, 0.52);
          break;
        case 'safe_room_med_used':
          this.spawnBurst(ev.x, 1.6, ev.z, 34, 0x34d399, 8.8);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0x10b981, 0.62);
          break;
        case 'safe_room_lysa_briefing':
          this.spawnBurst(ev.x, 1.9, ev.z, 28, 0x38bdf8, 8.2);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0x38bdf8, 0.58);
          break;
        case 'secret_vault_unlocked':
          this.spawnBurst(ev.x, 1.5, ev.z, 30, 0x34d399, 9.2);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0x10b981, 0.64);
          break;
        case 'secret_vault_looted':
          this.spawnBurst(ev.x, 1.5, ev.z, 40, 0xfbbf24, 10.4);
          this.spawnBurst(ev.x, 1.4, ev.z, 24, 0x38bdf8, 8.4);
          this.triggerImpactRing(ev.x, 0.24, ev.z, 0xfbbf24, 0.72);
          break;
        case 'ng_plus_started':
          this.spawnBurst(ev.x, 1.6, ev.z, 42, 0xfbbf24, 11.0);
          this.spawnBurst(ev.x, 1.4, ev.z, 28, 0xa855f7, 9.2);
          this.triggerImpactRing(ev.x, 0.24, ev.z, 0xfbbf24, 0.76);
          break;
        case 'nanite_injector_used':
          this.spawnBurst(ev.x, 1.35, ev.z, 28, 0x34d399, 7.6);
          this.triggerImpactRing(ev.x, 0.18, ev.z, 0x10b981, 0.56);
          break;
        case 'aegis_shield_absorbed':
          this.spawnBurst(ev.x, 1.25, ev.z, 18, 0x38bdf8, 6.4);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0x38bdf8, 0.44);
          break;
        case 'combat_drone_fired': {
          this.spawnBurst(ev.x, 1.35, ev.z, 10, 0x67e8f9, 5.2);
          if (this.combatDroneRig) {
            const ox = ev.originX ?? ev.x;
            const oz = ev.originZ ?? ev.z;
            const dx = ev.x - ox;
            const dz = ev.z - oz;
            const dy = 1.35 - 1.85;
            const len = Math.max(0.2, Math.hypot(dx, dy, dz));
            const beam = this.combatDroneRig.beamMesh;
            beam.visible = true;
            beam.position.set(
              (ox + ev.x) * 0.5 - this.combatDroneRig.root.position.x,
              (1.85 + 1.35) * 0.5 - this.combatDroneRig.root.position.y,
              (oz + ev.z) * 0.5 - this.combatDroneRig.root.position.z
            );
            beam.scale.set(1, len, 1);
            _droneDirVec.set(dx, dy, dz).normalize();
            beam.quaternion.setFromUnitVectors(_droneUpVec, _droneDirVec);
            this.combatDroneRig.beamMat.opacity = 0.9;
            this.combatDroneRig.muzzleFlashMesh.visible = true;
            this.droneBeamTimer = 0.18;
          }
          break;
        }
        case 'combat_drone_shield_triggered':
          this.spawnBurst(ev.x, 1.3, ev.z, 30, 0xfbbf24, 8.2);
          this.triggerImpactRing(ev.x, 0.22, ev.z, 0x38bdf8, 0.62);
          break;
        case 'fabricator_purchased':
        case 'skin_equipped':
          this.spawnBurst(ev.x, 1.35, ev.z, 24, 0xfbbf24, 7.2);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0x38bdf8, 0.52);
          break;
        case 'boss_killcam_triggered':
        case 'echo_zero_defeated':
          this.spawnBurst(ev.x, 1.9, ev.z, 52, 0xe879f9, 12.5);
          this.spawnBurst(ev.x, 1.6, ev.z, 38, 0xfde047, 10.2);
          this.triggerImpactRing(ev.x, 0.25, ev.z, 0xe879f9, 0.92);
          break;
        case 'paradox_rift_entered':
          this.spawnBurst(ev.x, 1.5, ev.z, 36, 0xc084fc, 9.8);
          this.triggerImpactRing(ev.x, 0.22, ev.z, 0xe879f9, 0.72);
          break;
        case 'achievement_unlocked':
          this.spawnBurst(ev.x, 1.8, ev.z, 20, 0xfde047, 6.8);
          break;
        case 'flash_swap_triggered': {
          this.spawnBurst(ev.x, 1.25, ev.z, 24, 0x22d3ee, 8.6);
          this.spawnBurst(ev.x, 1.25, ev.z, 14, 0xfbbf24, 6.8);
          this.triggerImpactRing(ev.x, 0.22, ev.z, 0xfbbf24, 0.5);
          const swapYaw = this.playerRig?.root?.rotation?.y ?? 0;
          this.spawnDashGhost(ev.x, ev.z, swapYaw, 0xfbbf24);
          this.spawnPlayerAfterimage(ev.x, ev.z, swapYaw, 0xfbbf24, 0.44, 0.5);
          this.triggerSlashRibbon(ev.x, 1.15, ev.z, swapYaw, 0.22, 0xfbbf24, 1.28, 0.22, 1);
          if (!this.reducedMotion) {
            this.fovKick = Math.max(this.fovKick ?? 0, 2.2);
          }
          break;
        }
        case 'chrono_chain_milestone':
          this.spawnBurst(ev.x, 1.5, ev.z, 28, 0xfde047, 9.2);
          this.triggerImpactRing(ev.x, 0.22, ev.z, 0xfde047, 0.58);
          break;
        case 'weapon_overcharge_ready': {
          const ovColor =
            ev.weaponId === 'chrono_scythe'
              ? 0xe879f9
              : ev.weaponId === 'grav_breaker'
                ? 0xf59e0b
                : ev.weaponId === 'phase_rail'
                  ? 0xe0f2fe
                  : ev.weaponId === 'pulsecaster'
                    ? 0x38bdf8
                    : 0x22d3ee;
          this.spawnBurst(ev.x, 1.35, ev.z, 34, ovColor, 9.8);
          this.spawnBurst(ev.x, 1.15, ev.z, 18, 0xfde047, 7.6);
          this.triggerImpactRing(ev.x, 0.22, ev.z, ovColor, 0.56, 3.6);
          this.triggerImpactRing(ev.x, 0.45, ev.z, 0xfde047, 0.36, 2.4);
          if (!this.reducedMotion) {
            this.fovKick = Math.max(this.fovKick ?? 0, 2.6);
          }
          break;
        }
        case 'twin_sync_tier_up': {
          const syncHex = (ev.amount ?? 1) >= 3 ? 0xfbbf24 : (ev.amount ?? 1) === 2 ? 0x818cf8 : 0x22d3ee;
          this.spawnBurst(ev.x, 1.35, ev.z, 26, syncHex, 8.8);
          this.triggerImpactRing(ev.x, 0.25, ev.z, syncHex, 0.46, 3.3);
          if (!this.reducedMotion) {
            this.fovKick = Math.max(this.fovKick ?? 0, 1.9);
          }
          break;
        }
        case 'twin_sync_pincer':
          this.spawnBurst(ev.x, 1.25, ev.z, 22, 0xfbbf24, 8.4);
          this.spawnBurst(ev.x, 1.15, ev.z, 14, 0x22d3ee, 6.8);
          this.triggerImpactRing(ev.x, 0.22, ev.z, 0xfbbf24, 0.36, 2.7);
          break;
        case 'weakpoint_break_triggered':
          this.spawnBurst(ev.x, 1.45, ev.z, 30, 0xfbbf24, 9.6);
          this.spawnBurst(ev.x, 1.2, ev.z, 18, 0xfef08a, 7.2);
          this.triggerImpactRing(ev.x, 0.24, ev.z, 0xfbbf24, 0.52, 3.9);
          if (!this.reducedMotion) {
            this.fovKick = Math.max(this.fovKick ?? 0, 2.4);
          }
          break;
        case 'chrono_momentum_tier_up': {
          const momHex = (ev.amount ?? 1) >= 3 ? 0xfbbf24 : (ev.amount ?? 1) === 2 ? 0xa78bfa : 0x22d3ee;
          this.spawnBurst(ev.x, 1.35, ev.z, 22, momHex, 8.2);
          this.triggerImpactRing(ev.x, 0.22, ev.z, momHex, 0.42, 3.0);
          break;
        }
        case 'chrono_nexus_linked': {
          const nxHex = (ev.amount ?? 2) >= 4 ? 0xfbbf24 : (ev.amount ?? 2) === 3 ? 0xa78bfa : 0x22d3ee;
          this.spawnBurst(ev.x, 1.4, ev.z, 28, nxHex, 9.2);
          this.spawnBurst(ev.x, 1.15, ev.z, 16, 0xf8fafc, 6.4);
          this.triggerImpactRing(ev.x, 0.2, ev.z, nxHex, 0.5, 3.6);
          if (!this.reducedMotion) {
            this.fovKick = Math.max(this.fovKick ?? 0, 2.6);
          }
          break;
        }
        case 'chrono_nexus_pulse': {
          const pHex = (ev.amount ?? 3) >= 4 ? 0xfbbf24 : 0xa78bfa;
          this.spawnBurst(ev.x, 1.1, ev.z, 24, pHex, 10.2);
          this.triggerImpactRing(ev.x, 0.18, ev.z, pHex, 0.56, 4.8);
          break;
        }
        case 'weapon_swap_resonance': {
          const wrHex = typeof ev.amount === 'number' && ev.amount > 0xff ? ev.amount : 0x22d3ee;
          this.spawnBurst(ev.x, 1.25, ev.z, 26, wrHex, 9.4);
          this.spawnBurst(ev.x, 1.05, ev.z, 14, 0xf8fafc, 6.2);
          this.triggerImpactRing(ev.x, 0.2, ev.z, wrHex, 0.48, 4.4);
          if (!this.reducedMotion) {
            this.fovKick = Math.max(this.fovKick ?? 0, 2.2);
          }
          break;
        }
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
          this.triggerImpactRing(ev.x, 0.22, ev.z, 0xfbbf24, 0.48, 3.8);
          this.triggerImpactRing(ev.x, 0.46, ev.z, 0x22d3ee, 0.34, 2.5);
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
        case 'fragment_cache_claimed':
          this.spawnBurst(ev.x, 1.35, ev.z, 24, 0xfbbf24, 7.4);
          this.spawnBurst(ev.x, 1.45, ev.z, 12, 0xffffff, 5.8);
          this.triggerImpactRing(ev.x, 0.16, ev.z, 0xfbbf24, 0.4);
          break;
        case 'sector_beacon_activated':
          this.spawnBurst(ev.x, 1.3, ev.z, 26, 0x22d3ee, 8.2);
          this.spawnBurst(ev.x, 1.2, ev.z, 14, 0x34d399, 6.2);
          this.triggerImpactRing(ev.x, 0.18, ev.z, 0x22d3ee, 0.44);
          break;
        case 'weapon_upgrade_overclocked':
          this.spawnBurst(ev.x, 1.25, ev.z, 18, 0xfbbf24, 6.4);
          this.triggerImpactRing(ev.x, 0.14, ev.z, 0xfbbf24, 0.34);
          break;
        case 'weapon_mythic_awakened':
          this.spawnBurst(ev.x, 1.35, ev.z, 26, 0xfbbf24, 7.6);
          this.spawnBurst(ev.x, 1.2, ev.z, 16, 0x34d399, 6.2);
          this.triggerImpactRing(ev.x, 0.16, ev.z, 0xfbbf24, 0.42);
          break;
        case 'rig_module_overclocked':
          this.spawnBurst(ev.x, 1.3, ev.z, 22, 0x34d399, 7.0);
          this.spawnBurst(ev.x, 1.15, ev.z, 12, 0xfbbf24, 5.6);
          this.triggerImpactRing(ev.x, 0.15, ev.z, 0x34d399, 0.36);
          break;
        case 'sentinel_mode_switched':
          this.spawnBurst(ev.x, 1.65, ev.z, 16, 0x22d3ee, 5.8);
          this.triggerImpactRing(ev.x, 0.14, ev.z, 0x22d3ee, 0.3);
          break;
        case 'echo_doctrine_switched':
          this.spawnBurst(ev.x, 1.35, ev.z, 18, 0x38bdf8, 6.2);
          this.triggerImpactRing(ev.x, 0.16, ev.z, 0x38bdf8, 0.34);
          break;
        case 'echo_doctrine_nova_pulse':
          this.spawnBurst(ev.x, 1.2, ev.z, 28, 0xe879f9, 8.8);
          this.spawnBurst(ev.x, 1.05, ev.z, 14, 0xf0abfc, 6.4);
          this.triggerImpactRing(ev.x, 0.18, ev.z, 0xe879f9, 0.56);
          break;
        case 'holo_memory_projected':
          this.spawnBurst(ev.x, 1.45, ev.z, 26, 0x22d3ee, 7.8);
          this.spawnBurst(ev.x, 1.65, ev.z, 18, 0xfbbf24, 6.4);
          this.triggerImpactRing(ev.x, 0.16, ev.z, 0x22d3ee, 0.48);
          this.resonanceFlash = Math.max(this.resonanceFlash ?? 0, 0.72);
          break;
        case 'chrono_ward_absorbed':
          this.spawnBurst(ev.x, 1.15, ev.z, 14, 0x34d399, 6.2);
          this.triggerImpactRing(ev.x, 0.16, ev.z, 0x34d399, 0.28);
          break;
        case 'chrono_ward_shatter':
          this.spawnBurst(ev.x, 1.2, ev.z, 30, 0x34d399, 9.2);
          this.spawnBurst(ev.x, 1.35, ev.z, 16, 0xffffff, 7.4);
          this.triggerImpactRing(ev.x, 0.18, ev.z, 0x34d399, 0.52);
          break;
        case 'phantom_afterimage_strike':
          this.spawnBurst(ev.x, 1.25, ev.z, 20, 0xa78bfa, 7.6);
          this.spawnBurst(ev.x, 1.1, ev.z, 10, 0x22d3ee, 5.8);
          this.triggerImpactRing(ev.x, 0.15, ev.z, 0xa78bfa, 0.34);
          break;
        case 'boss_core_unlocked':
          this.bossCorePulseTimer = 0.75;
          this.spawnBurst(ev.x, 1.45, ev.z, 28, 0xfbbf24, 8.6);
          this.spawnBurst(ev.x, 1.3, ev.z, 16, 0x22d3ee, 6.8);
          this.triggerImpactRing(ev.x, 0.18, ev.z, 0xfbbf24, 0.5);
          break;
        case 'boss_core_equipped':
          this.bossCorePulseTimer = 0.55;
          this.spawnBurst(ev.x, 1.4, ev.z, 18, 0x38bdf8, 6.2);
          this.triggerImpactRing(ev.x, 0.15, ev.z, 0x38bdf8, 0.34);
          break;
        case 'boss_core_pulse': {
          this.bossCorePulseTimer = 0.48;
          const pulseColor = this.bossCoreSigilRig?.root.visible
            ? this.bossCoreSigilRig.crystalMat.color.getHex()
            : 0xfbbf24;
          const ringColor = this.bossCoreSigilRig?.root.visible
            ? this.bossCoreSigilRig.ringMat.color.getHex()
            : 0x22d3ee;
          this.spawnBurst(ev.x, 1.25, ev.z, 24, pulseColor, 8.2);
          this.spawnBurst(ev.x, 1.05, ev.z, 12, ringColor, 6.4);
          this.triggerImpactRing(ev.x, 0.16, ev.z, pulseColor, 0.44);
          break;
        }
        case 'boss_core_omega_awakened': {
          this.bossCorePulseTimer = 0.95;
          this.spawnBurst(ev.x, 1.55, ev.z, 34, 0xfde047, 9.8);
          this.spawnBurst(ev.x, 1.35, ev.z, 22, 0x22d3ee, 7.6);
          this.triggerImpactRing(ev.x, 0.2, ev.z, 0xfde047, 0.56);
          break;
        }
        case 'confluence_burst_triggered': {
          this.bossCorePulseTimer = 0.85;
          const burstCrystalHex = this.bossCoreSigilRig?.root.visible
            ? this.bossCoreSigilRig.crystalMat.color.getHex()
            : 0x38bdf8;
          this.spawnBurst(ev.x, 1.4, ev.z, 36, burstCrystalHex, 10.6);
          this.spawnBurst(ev.x, 1.2, ev.z, 24, 0xffffff, 8.4);
          this.triggerImpactRing(ev.x, 0.22, ev.z, burstCrystalHex, 0.58);
          this.spawnImpactDecal(ev.x, ev.z, burstCrystalHex, 3.1, 7.2);
          if (!this.reducedMotion) {
            this.hitstopTimer = Math.max(this.hitstopTimer ?? 0, 0.045);
            this.fovKick = Math.max(this.fovKick ?? 0, 2.4);
          }
          break;
        }
        case 'neural_protocol_purchased':
          this.spawnBurst(ev.x, 1.25, ev.z, 18, 0x38bdf8, 6.4);
          this.triggerImpactRing(ev.x, 0.14, ev.z, 0x38bdf8, 0.34);
          break;
        case 'story_choice_resolved':
          this.spawnBurst(ev.x, 1.4, ev.z, 22, 0x34d399, 7.0);
          this.triggerImpactRing(ev.x, 0.18, ev.z, 0x34d399, 0.38);
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
    slot.mat.uniforms.uColor.value.setHex(colorHex);
    slot.mat.uniforms.uOpacity.value = 0.94;
    slot.mat.uniforms.uProgress.value = 0;
    slot.group.visible = true;
  }

  private spawnPlayerAfterimage(
    x: number,
    z: number,
    yaw: number,
    colorHex = 0x67e8f9,
    maxAge = 0.42,
    baseOpacity = 0.44
  ): void {
    if (this.reducedMotion || this.screenEffectsEnabled === false) {
      return;
    }
    if (!this.playerAfterimagePool || this.playerAfterimagePool.length === 0) return;
    const poolLen = this.playerAfterimagePool.length;
    const slot = this.playerAfterimagePool[this.playerAfterimageNextIdx % poolLen];
    this.playerAfterimageNextIdx = (this.playerAfterimageNextIdx + 1) % poolLen;
    slot.active = true;
    slot.age = 0;
    slot.maxAge = Math.max(0.12, maxAge);
    slot.baseOpacity = baseOpacity;
    const g = slot.ghost;
    g.root.position.set(x, 0, z);
    g.root.rotation.set(0, yaw, 0);
    g.root.scale.setScalar(1);
    if (this.playerRig) {
      g.bodyGroup.position.y = this.playerRig.bodyGroup.position.y;
      g.bodyGroup.rotation.copy(this.playerRig.bodyGroup.rotation);
      g.torsoPivot.rotation.copy(this.playerRig.torsoPivot.rotation);
      g.rightArmPivot.rotation.copy(this.playerRig.rightArmPivot.rotation);
      g.leftArmPivot.rotation.copy(this.playerRig.leftArmPivot.rotation);
      g.leftLegPivot.rotation.copy(this.playerRig.leftLegPivot.rotation);
      g.rightLegPivot.rotation.copy(this.playerRig.rightLegPivot.rotation);
    }
    g.material.color.setHex(colorHex);
    g.material.opacity = baseOpacity;
    g.root.visible = true;
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
      slot.group.scale.setScalar(slot.startScale * (0.72 + eased * 0.52));
      slot.mesh.rotation.y += slot.spinDir * dt * 11.2;
      slot.mat.uniforms.uProgress.value = progress;
      slot.mat.uniforms.uOpacity.value = slot.baseOpacity * Math.max(0, 1 - progress * progress);
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

    for (let i = 0; i < this.playerAfterimagePool.length; i++) {
      const slot = this.playerAfterimagePool[i];
      if (!slot.active) continue;
      slot.age += dt;
      if (slot.age >= slot.maxAge) {
        slot.active = false;
        slot.ghost.root.visible = false;
        continue;
      }
      const progress = slot.age / slot.maxAge;
      slot.ghost.root.scale.setScalar(1 + progress * 0.07);
      slot.ghost.material.opacity = slot.baseOpacity * Math.pow(Math.max(0, 1 - progress), 1.35);
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
      if (this.impactRingPool) {
        for (let i = 0; i < this.impactRingPool.length; i++) {
          this.impactRingPool[i].timer = 0;
          this.impactRingPool[i].mesh.visible = false;
        }
      }
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
      if (this.playerAfterimagePool) {
        for (let i = 0; i < this.playerAfterimagePool.length; i++) {
          this.playerAfterimagePool[i].active = false;
          this.playerAfterimagePool[i].ghost.root.visible = false;
        }
      }
      if (this.temporalSlipRingGroup) {
        this.temporalSlipRingGroup.visible = false;
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

  public setDynamicRenderScaleFactor(factor: number): void {
    if (this.isHeadless || this.isSoftwareGl || !this.renderer) return;
    const clamped = Math.max(0.55, Math.min(1.0, Number.isFinite(factor) ? factor : 1.0));
    if (Math.abs(clamped - this.dynamicScaleFactor) < 0.015) return;
    this.dynamicScaleFactor = clamped;
    const nextDpr = computeEffectivePixelRatio(
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
      GAME_CONFIG.camera.maxPixelRatio,
      this.renderScale * this.dynamicScaleFactor,
      this.isHeadless,
      this.isSoftwareGl
    );
    if (Math.abs(nextDpr - (this.appliedPixelRatio ?? 1)) >= 0.02) {
      this.appliedPixelRatio = nextDpr;
      this.renderer.setPixelRatio?.(nextDpr);
      this.composer?.setPixelRatio?.(nextDpr);
      if (this.viewportWidth > 0 && this.viewportHeight > 0) {
        this.renderer.setSize?.(this.viewportWidth, this.viewportHeight, false);
        this.composer?.setSize?.(this.viewportWidth, this.viewportHeight);
      }
    }
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
    this.celestialGrade = resolved.celestialGrade;
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

    if (settings.adaptiveResolution === false) {
      this.dynamicScaleFactor = 1.0;
    }

    const nextDpr = computeEffectivePixelRatio(
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
      GAME_CONFIG.camera.maxPixelRatio,
      resolved.renderScale * this.dynamicScaleFactor,
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
        resolved.lightingQuality === 'lite' ? 0.68 : 0.94;
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
      this.scene.environmentIntensity = look.envIntensity;
      this.conduitGlowMat.color.setHex(look.conduit);
      this.floorTelemetryMat?.uniforms?.uColor?.value?.setHex?.(look.conduit);
      this.skyDomeMat?.uniforms?.uZenith?.value?.setHex?.(look.skyZenith);
      this.skyDomeMat?.uniforms?.uHorizon?.value?.setHex?.(look.skyHorizon);
      this.skyDomeMat?.uniforms?.uNebula?.value?.setHex?.(look.nebulaTint);
      this.skyDomeMat?.uniforms?.uAurora?.value?.setHex?.(look.auroraTint);
      this.planetMat?.uniforms?.uAccent?.value?.setHex?.(look.rim);
      this.planetMat?.uniforms?.uRimTint?.value?.setHex?.(look.planetRimTint);
      this.planetRingMat?.uniforms?.uAccent?.value?.setHex?.(look.conduit);
      this.beamConeMat?.color?.setHex?.(look.rim);
      this.loomLightShaftMat?.color.setHex(look.loom);
      this.dustMat?.color.setHex(look.rim);
      this.orbitalCrownMat?.color.setHex(look.rim);
      this.orbitalCrownInnerMat?.color.setHex(look.conduit);
      this.floorConduitMat?.color.setHex(look.conduit);
    }

    if (this.visibleChapterEnv) {
      for (let r = 0; r < this.visibleChapterEnv.rotors.length; r++) {
        const rotor = this.visibleChapterEnv.rotors[r];
        const ud = rotor.userData as {
          animKind?: string;
          baseY?: number;
          baseZ?: number;
          amp?: number;
          speed?: number;
          phase?: number;
          rx?: number;
          ry?: number;
          rz?: number;
        };
        const kind = ud?.animKind;
        if (kind === 'scanY') {
          const baseY = ud.baseY ?? rotor.position.y;
          const amp = ud.amp ?? 1.2;
          const speed = ud.speed ?? 1.3;
          const phase = ud.phase ?? r * 0.8;
          rotor.position.y = baseY + Math.sin(ambientTime * speed + phase) * amp * ambientScale;
        } else if (kind === 'scanZ') {
          const baseZ = ud.baseZ ?? rotor.position.z;
          const amp = ud.amp ?? 0.4;
          const speed = ud.speed ?? 1.15;
          const phase = ud.phase ?? r * 0.8;
          rotor.position.z = baseZ + Math.sin(ambientTime * speed + phase) * amp * ambientScale;
        } else if (kind === 'floatSpin') {
          const baseY = ud.baseY ?? rotor.position.y;
          const amp = ud.amp ?? 0.12;
          const speed = ud.speed ?? 0.9;
          const phase = ud.phase ?? r * 1.1;
          const sample = computePropFloatMotion(ambientTime, phase, amp, this.reducedMotion);
          rotor.position.y = baseY + sample.offsetY;
          rotor.rotation.y += ambientDt * speed * ringSpeedScale;
          rotor.rotation.x = sample.tiltX;
          rotor.rotation.z = sample.tiltZ;
        } else if (kind === 'gyroSpin') {
          rotor.rotation.x += ambientDt * (ud.rx ?? 0.5) * ringSpeedScale;
          rotor.rotation.y += ambientDt * (ud.ry ?? 0.9) * ringSpeedScale;
          rotor.rotation.z += ambientDt * (ud.rz ?? 0.4) * ringSpeedScale;
        } else {
          rotor.rotation.y += ambientDt * (r % 2 === 0 ? 0.46 : -0.34) * ringSpeedScale;
        }
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
    if (this.celestialAstrolabeOuterRing) {
      this.celestialAstrolabeOuterRing.rotation.z += ambientDt * 0.022 * ringSpeedScale;
    }
    if (this.celestialAstrolabeInnerRing) {
      this.celestialAstrolabeInnerRing.rotation.z -= ambientDt * 0.034 * ringSpeedScale;
    }
    if (this.orbitalShuttles) {
      for (let i = 0; i < this.orbitalShuttles.length; i++) {
        const sh = this.orbitalShuttles[i];
        const baseY = Number(sh.userData.baseY) || sh.position.y;
        const baseRotX = Number(sh.userData.baseRotX) || 0.04;
        const baseRotZ = Number(sh.userData.baseRotZ) || 0;
        const phase = i * 2.15;
        sh.position.y = baseY + Math.sin(ambientTime * 0.85 + phase) * 0.55 * ambientScale;
        sh.rotation.x = baseRotX + Math.sin(ambientTime * 0.6 + phase) * 0.04 * ambientScale;
        sh.rotation.z = baseRotZ + Math.cos(ambientTime * 0.72 + phase) * 0.06 * ambientScale;
      }
    }
    if (this.orbitalDebris) {
      for (let i = 0; i < this.orbitalDebris.length; i++) {
        const db = this.orbitalDebris[i];
        const baseY = Number(db.userData.baseY) || db.position.y;
        const dir = i % 2 === 0 ? 1 : -1;
        db.rotation.x += ambientDt * 0.08 * dir * ringSpeedScale;
        db.rotation.y += ambientDt * 0.12 * ringSpeedScale;
        db.rotation.z += ambientDt * 0.06 * -dir * ringSpeedScale;
        db.position.y = baseY + Math.sin(ambientTime * 0.45 + i * 1.9) * 0.42 * ambientScale;
      }
    }
    if (this.blastStrobeMat) {
      this.blastStrobeMat.emissiveIntensity =
        selectedEnding === 'silence'
          ? 0.25
          : computeStrobeIntensity(ambientTime, 0, 1.35, this.reducedMotion);
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
    if (this.planetRingMat?.uniforms?.uTime) {
      this.planetRingMat.uniforms.uTime.value = ambientTime;
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
    const holoProjectingNow = (world.exploration?.activeHoloMemoryTimer ?? 0) > 0;
    const mood = computeArenaMoodModulation(baseChapterLook, {
      bossPhase: isBossActive ? world.boss!.phase : 1,
      bossCoreExposed: Boolean(isBossActive && world.boss?.coreExposed),
      adrenalineTier: Math.min(5, Math.max(0, Math.floor(world.player?.adrenalineScore ?? 0))),
      resonanceFlash: this.resonanceFlash ?? 0,
      reducedMotion: this.reducedMotion,
      overdriveActive: Boolean(world.overdrive?.active),
      holoActive: holoProjectingNow,
      celestialGrade: this.celestialGrade,
    });
    if (this.skyDomeMat?.uniforms) {
      if (this.skyDomeMat.uniforms.uAuroraIntensity) {
        this.skyDomeMat.uniforms.uAuroraIntensity.value =
          selectedEnding === 'silence' ? 0.15 : mood.auroraIntensity;
      }
      if (this.skyDomeMat.uniforms.uNebulaBoost) {
        this.skyDomeMat.uniforms.uNebulaBoost.value =
          selectedEnding === 'silence' ? 0.45 : mood.nebulaBoost;
      }
      if (this.skyDomeMat.uniforms.uStarTwinkle) {
        this.skyDomeMat.uniforms.uStarTwinkle.value = mood.starTwinkle;
      }
      if (this.skyDomeMat.uniforms.uEclipseRim) {
        this.skyDomeMat.uniforms.uEclipseRim.value =
          selectedEnding === 'silence' ? 0.12 : mood.eclipseRim;
      }
    }
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
        const floatSample = computePropFloatMotion(ambientTime, i + 0.5, isPrompted ? 0.1 : 0.075, this.reducedMotion);
        rig.coreMesh.rotation.y += ambientDt * (isPrompted ? 2.6 : 1.25);
        rig.coreMesh.rotation.x = floatSample.tiltX * 1.4;
        rig.coreMesh.rotation.z = floatSample.tiltZ * 1.4;
        rig.coreMesh.position.y = 1.56 + floatSample.offsetY;
        rig.ringMesh.scale.setScalar(
          item.status === 'activated' ? 0.92 : isPrompted ? floatSample.pulseScale * 1.08 : floatSample.pulseScale
        );
        rig.ringMat.opacity =
          item.status === 'activated'
            ? 0.32
            : isPrompted
              ? 0.82 + Math.sin(ambientTime * 5.2 + i) * 0.1 * ambientScale
              : 0.48 + Math.sin(ambientTime * 3.2 + i) * 0.14 * ambientScale;
      }
    }

    const inSafeRoom = Boolean(
      world.expedition?.enabled && world.expedition.phase === 'safe_room'
    );

    // Phase 19: Retract unlocked corner containment pylons smoothly into the deck floor (instant in Safe-Room)
    if (world.obstacles && this.obstacleMeshById && this.obstacleMeshById.size > 0) {
      for (let i = 0; i < world.obstacles.length; i++) {
        const obs = world.obstacles[i];
        if (!obs || obs.id === 'loom-pylon') continue;
        const meshGroup = this.obstacleMeshById.get(obs.id);
        if (!meshGroup) continue;
        const targetY = obs.disabled || inSafeRoom ? -(obs.height + 0.35) : 0;
        if (this.reducedMotion || inSafeRoom) {
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
        const targetY = obs.disabled || inSafeRoom ? -(obs.height + 0.35) : 0;
        if (this.reducedMotion || inSafeRoom) {
          meshGroup.position.y = targetY;
        } else {
          meshGroup.position.y +=
            (targetY - meshGroup.position.y) * Math.min(1, dt * 6.5);
        }
      }
    }

    // v1.5.0 Package B: Update Dynamic Chapter Cover Barricades & Destructible Capacitors
    if (this.dynamicObstaclesGroup && this.dynamicObstacleRigs && world.obstacles) {
      const lookAccent = (CHAPTER_VISUAL_LOOKS[ch] ?? CHAPTER_VISUAL_LOOKS.prologue).conduit;
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
        const maxHp = Math.max(1, obs.maxHp ?? 45);
        const hpRatio = obs.destructible ? curHp / maxHp : 1;
        const criticalJitter =
          obs.kind === 'destructible_crate' && hpRatio < 0.55 && !this.reducedMotion
            ? Math.sin(ambientTime * 34 + i * 2.1) * 0.022
            : 0;
        const wobble = rig.hitTimer > 0 && !this.reducedMotion ? Math.sin(rig.hitTimer * 52) * 0.065 : criticalJitter;
        rig.group.rotation.z = wobble;
        if (obs.kind === 'destructible_crate') {
          const coreBreath = 1 + Math.sin(ambientTime * (hpRatio < 0.55 ? 10.5 : 3.4) + i) * 0.028 * ambientScale;
          rig.crateGroup.scale.set(coreBreath, 1 / Math.sqrt(coreBreath), coreBreath);
        } else {
          rig.crateGroup.scale.setScalar(1);
        }

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
        bRig.chevronMesh.rotation.y += ambientDt * (ready ? 2.85 : 0.4);
        bRig.outerRing.rotation.z -= ambientDt * (ready ? 1.35 : 0.25);
        const padPulse = ready ? 1 + Math.sin(ambientTime * 4.8 + i) * 0.055 * ambientScale : 0.92;
        bRig.outerRing.scale.setScalar(padPulse);
        bRig.ringMat.color.setHex(ready ? 0x22d3ee : 0x475569);
        bRig.ringMat.opacity = ready
          ? 0.56 + Math.sin(ambientTime * 4.2 + i) * 0.14 * ambientScale
          : 0.24;
        bRig.chevronMat.color.setHex(ready ? 0x67e8f9 : 0x64748b);
        bRig.chevronMat.opacity = ready ? 0.84 : 0.26;
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

    // Update Pooled Artillery Strike & Volatile Detonation Warning Zones
    if (this.artilleryZonesGroup && this.artilleryZoneRigs.length > 0) {
      const zones = world.artilleryZones ?? [];
      for (let i = 0; i < this.artilleryZoneRigs.length; i++) {
        const aRig = this.artilleryZoneRigs[i];
        const zone = zones[i];
        if (!zone || zone.remainingTimer <= 0) {
          aRig.group.visible = false;
          continue;
        }
        aRig.group.visible = true;
        aRig.group.position.set(zone.x, 0, zone.z);
        const progress = Math.max(
          0,
          Math.min(1, 1 - zone.remainingTimer / Math.max(0.05, zone.maxDuration))
        );
        const isVolatile = zone.kind === 'volatile_core';
        aRig.outerRing.scale.setScalar(zone.radius);
        aRig.outerRing.rotation.z = ambientTime * (isVolatile ? -3.4 : 2.2);
        aRig.ringMat.color.setHex(isVolatile ? 0xef4444 : 0xf59e0b);
        aRig.ringMat.opacity = 0.65 + progress * 0.32;

        aRig.fillDisc.scale.setScalar(Math.max(0.08, zone.radius * progress));
        aRig.discMat.color.setHex(isVolatile ? 0xdc2626 : 0xf97316);
        aRig.discMat.opacity = 0.16 + progress * 0.34;

        if (isVolatile) {
          aRig.shellMesh.visible = true;
          aRig.shellMesh.position.y = 0.85;
          const pulse = 0.8 + progress * 1.4 + Math.sin(ambientTime * 22) * 0.14;
          aRig.shellMesh.scale.setScalar(pulse);
          aRig.shellMat.color.setHex(0xfef08a);
        } else {
          aRig.shellMesh.visible = true;
          // Parabolic descent arc toward ground impact
          const fallY = Math.max(0.22, (1 - progress) * (1 - progress) * 10.5);
          aRig.shellMesh.position.y = fallY;
          aRig.shellMesh.scale.setScalar(0.85 + progress * 0.45);
          aRig.shellMat.color.setHex(0xfbbf24);
        }
      }
    }

    // Update Pooled Harmonic Conductor Shield-Tether Beams & Ally Shield Halos
    if (this.conductorTethersGroup && this.conductorTetherRigs.length > 0) {
      let tetherUsed = 0;
      for (let i = 0; i < world.enemies.length && tetherUsed < this.conductorTetherRigs.length; i++) {
        const conductor = world.enemies[i];
        if (
          conductor.archetype !== 'resonance_warden' ||
          conductor.hp <= 0 ||
          conductor.aiState === 'ko' ||
          conductor.aiState === 'staggered' ||
          !conductor.tetherTargetId
        ) {
          continue;
        }
        const ally = world.enemies.find(
          (e) => e.id === conductor.tetherTargetId && e.hp > 0 && e.aiState !== 'ko'
        );
        if (!ally) continue;

        const tRig = this.conductorTetherRigs[tetherUsed++];
        tRig.group.visible = true;
        this._tetherVecA.set(conductor.x, 1.65, conductor.z);
        this._tetherVecB.set(ally.x, 1.25, ally.z);
        const beamLen = Math.max(0.1, this._tetherVecA.distanceTo(this._tetherVecB));
        this._tetherMid.addVectors(this._tetherVecA, this._tetherVecB).multiplyScalar(0.5);
        this._tetherDir.subVectors(this._tetherVecB, this._tetherVecA).normalize();
        this._tetherQuat.setFromUnitVectors(this._tetherUp, this._tetherDir);

        tRig.beamMesh.position.copy(this._tetherMid);
        tRig.beamMesh.quaternion.copy(this._tetherQuat);
        const pulseThick = 0.85 + Math.sin(ambientTime * 8.0 + tetherUsed) * 0.25;
        tRig.beamMesh.scale.set(pulseThick, beamLen, pulseThick);
        tRig.beamMat.opacity = 0.65 + Math.sin(ambientTime * 6.5) * 0.2;

        // Hover & rotate the TETHER NODE harmonic relay drone at the beam midpoint
        tRig.nodeGroup.position.copy(this._tetherMid);
        tRig.nodeGroup.rotation.y = ambientTime * 2.4 + tetherUsed;
        tRig.nodeGroup.rotation.x = Math.sin(ambientTime * 1.8 + tetherUsed) * 0.3;

        tRig.allyHaloMesh.position.set(ally.x, 0.06, ally.z);
        tRig.allyHaloMesh.scale.setScalar(Math.max(0.95, ally.radius * 1.45));
        tRig.allyHaloMesh.rotation.z = ambientTime * 2.1;
        tRig.allyHaloMat.opacity = 0.6 + Math.sin(ambientTime * 5.0) * 0.18;
      }
      for (let i = tetherUsed; i < this.conductorTetherRigs.length; i++) {
        this.conductorTetherRigs[i].group.visible = false;
      }
    }

    // WAYPOINT SPIRE — Animate Gilded Projector Base, Amber Beam & Spinning Cyan Octahedron
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
          0.26 + Math.sin(ambientTime * 3.8) * 0.08 * ambientScale;
        this.waypointBeaconRig.diamondMesh.rotation.y += ambientDt * 2.6;
        this.waypointBeaconRig.diamondMesh.position.y =
          2.45 + Math.sin(ambientTime * 3.2) * 0.16 * ambientScale;
      }
    }

    // Chronicle Expansion: Update Pooled Arena Fragment Caches
    if (this.fragmentCachesGroup && this.fragmentCacheRigs.length > 0) {
      const caches = world.fragmentCaches ?? [];
      for (let i = 0; i < this.fragmentCacheRigs.length; i++) {
        const fcRig = this.fragmentCacheRigs[i];
        const cache = caches[i];
        if (!cache) {
          fcRig.group.visible = false;
          continue;
        }
        fcRig.group.visible = true;
        fcRig.group.position.set(cache.x, 0, cache.z);
        const claimed = Boolean(cache.claimed);
        const fcFloat = computePropFloatMotion(ambientTime, i * 1.4, claimed ? 0.045 : 0.12, this.reducedMotion);
        fcRig.prismMesh.rotation.y += ambientDt * (claimed ? 0.7 : 2.45);
        fcRig.prismMesh.rotation.x = fcFloat.tiltX * 1.5;
        fcRig.prismMesh.rotation.z = fcFloat.tiltZ * 1.5;
        fcRig.prismMesh.position.y = (claimed ? 0.92 : 1.25) + fcFloat.offsetY;
        fcRig.prismMesh.scale.setScalar(claimed ? 0.62 : fcFloat.pulseScale);
        fcRig.prismMat.color.setHex(claimed ? 0x34d399 : 0xfbbf24);
        fcRig.prismMat.opacity = claimed ? 0.48 : 0.95;
        fcRig.ringMesh.rotation.z -= ambientDt * (claimed ? 0.4 : 1.4);
        fcRig.ringMesh.scale.setScalar(claimed ? 0.72 : 1 + Math.sin(ambientTime * 4.2 + i) * 0.08 * ambientScale);
        fcRig.ringMat.color.setHex(claimed ? 0x10b981 : 0xf59e0b);
        fcRig.ringMat.opacity = claimed ? 0.28 : 0.78 + Math.sin(ambientTime * 4.5 + i) * 0.14 * ambientScale;
        fcRig.beamMesh.visible = !claimed;
        fcRig.beamMat.opacity = claimed ? 0 : 0.2 + Math.sin(ambientTime * 3.6 + i) * 0.06 * ambientScale;
      }
    }

    // Chronicle Expansion: Update Pooled Sector Tactical Beacons
    if (this.sectorBeaconsGroup && this.sectorBeaconRigs.length > 0) {
      const beacons = world.sectorBeacons ?? [];
      for (let i = 0; i < this.sectorBeaconRigs.length; i++) {
        const sbRig = this.sectorBeaconRigs[i];
        const beacon = beacons[i];
        if (!beacon) {
          sbRig.group.visible = false;
          continue;
        }
        sbRig.group.visible = true;
        sbRig.group.position.set(beacon.x, 0, beacon.z);
        const ready = beacon.cooldown <= 0;
        const sbFloat = computePropFloatMotion(ambientTime, i * 1.7, ready ? 0.11 : 0.03, this.reducedMotion);
        sbRig.haloMesh.rotation.z += ambientDt * (ready ? 2.4 : 0.5);
        sbRig.haloMesh.rotation.y += ambientDt * (ready ? 1.55 : 0.32);
        sbRig.haloMesh.position.y = 1.65 + sbFloat.offsetY;
        sbRig.pylonMat.emissive.setHex(ready ? 0x06b6d4 : 0x334155);
        sbRig.pylonMat.emissiveIntensity = ready
          ? 1.05 + Math.sin(ambientTime * 4.8 + i) * 0.28 * ambientScale
          : 0.25;
        sbRig.haloMat.color.setHex(ready ? 0x22d3ee : 0x64748b);
        sbRig.haloMat.opacity = ready ? 0.92 : 0.42;
        sbRig.ringMat.color.setHex(ready ? 0x38bdf8 : 0x475569);
        sbRig.ringMat.opacity = ready
          ? 0.68 + Math.sin(ambientTime * 4.2 + i) * 0.15 * ambientScale
          : 0.24;
      }
    }

    // v3.8.0: Update Interactive 3D Dr. Lysa Venn Holo-Memory Astrolabe Projector
    if (this.lysaHoloProjectorRig) {
      const holoRig = this.lysaHoloProjectorRig;
      const holoDef = getHoloMemoryForChapter(ch);
      const showHolo = world.run.mode !== 'boss_gauntlet' && !inSafeRoom;
      holoRig.root.visible = showHolo;
      if (showHolo) {
        holoRig.root.position.set(holoDef.x, 0, holoDef.z);
        const discoveredIds = world.exploration?.discoveredHoloMemoryIds;
        const isDiscovered = Boolean(discoveredIds && discoveredIds.includes(holoDef.id));
        const isProjecting =
          world.exploration?.activeHoloMemoryId === holoDef.id &&
          (world.exploration?.activeHoloMemoryTimer ?? 0) > 0;

        holoRig.holoShaderMat.uniforms.uTime.value = ambientTime;
        const primaryHex = isProjecting ? 0x67e8f9 : isDiscovered ? 0x34d399 : 0x22d3ee;
        const secondaryHex = isProjecting ? 0xfef08a : 0xfbbf24;
        holoRig.holoShaderMat.uniforms.uPrimaryColor.value.setHex(primaryHex);
        holoRig.holoShaderMat.uniforms.uSecondaryColor.value.setHex(secondaryHex);
        holoRig.holoShaderMat.uniforms.uOpacity.value = isProjecting
          ? 0.96
          : isDiscovered
            ? 0.68
            : 0.88;

        const floatSample = computePropFloatMotion(
          ambientTime,
          1.15,
          isProjecting ? 0.09 : 0.055,
          this.reducedMotion
        );
        holoRig.hologramFigureGroup.position.y =
          (isProjecting ? 0.3 : 0.22) + floatSample.offsetY;
        const dxToPlayer = world.player.x - holoDef.x;
        const dzToPlayer = world.player.z - holoDef.z;
        if (dxToPlayer * dxToPlayer + dzToPlayer * dzToPlayer > 0.04) {
          holoRig.hologramFigureGroup.rotation.y = Math.atan2(dxToPlayer, dzToPlayer);
        }

        const spinMult = isProjecting ? 2.4 : isDiscovered ? 0.85 : 1.35;
        holoRig.outerGimbalRing.rotation.z += ambientDt * 0.9 * spinMult * ringSpeedScale;
        holoRig.innerHarmonicRing.rotation.y -= ambientDt * 1.35 * spinMult * ringSpeedScale;
        holoRig.innerHarmonicRing.rotation.z += ambientDt * 0.65 * spinMult * ringSpeedScale;
        holoRig.seedCrystalMesh.rotation.y += ambientDt * 2.2 * spinMult * ringSpeedScale;
        holoRig.seedCrystalMesh.scale.setScalar(
          isProjecting ? 1.24 + Math.sin(ambientTime * 6.0) * 0.1 * ambientScale : 1.0
        );

        holoRig.floorHaloMat.color.setHex(isProjecting ? 0xfbbf24 : primaryHex);
        holoRig.floorHaloMat.opacity = isProjecting
          ? 0.92
          : (isDiscovered ? 0.44 : 0.72) + Math.sin(ambientTime * 4.0) * 0.12 * ambientScale;
        holoRig.beamConeMat.color.setHex(primaryHex);
        holoRig.beamConeMat.opacity = isProjecting
          ? 0.26
          : isDiscovered
            ? 0.09
            : 0.16 + Math.sin(ambientTime * 3.2) * 0.04 * ambientScale;
        holoRig.apertureLensMat.emissiveIntensity = isProjecting ? 3.2 : isDiscovered ? 1.4 : 2.2;
      }
    }

    // Chapter Orbital Crown Rings & Radial Floor Energy Conduits
    if (this.orbitalCrownOuterRing && this.orbitalCrownInnerRing) {
      this.orbitalCrownOuterRing.rotation.y += ambientDt * 0.14 * ringSpeedScale;
      this.orbitalCrownInnerRing.rotation.y -= ambientDt * 0.22 * ringSpeedScale;
      const crownOpacity =
        selectedEnding === 'silence'
          ? 0.12
          : 0.34 + Math.sin(ambientTime * 2.2) * 0.08 * ambientScale;
      this.orbitalCrownMat.opacity = crownOpacity;
      this.orbitalCrownInnerMat.opacity = crownOpacity * 0.85;
    }
    if (this.floorConduitMat) {
      this.floorConduitMat.opacity =
        selectedEnding === 'silence'
          ? 0.08
          : 0.22 + Math.sin(ambientTime * 3.1) * 0.07 * ambientScale;
    }

    // Dynamic Arena Anomaly: 3D Temporal Rift Rig
    if (this.temporalRiftGroup) {
      const rift = world.temporalRift ?? null;
      if (!rift || rift.remainingTimer <= 0) {
        this.temporalRiftGroup.visible = false;
      } else {
        this.temporalRiftGroup.visible = true;
        this.temporalRiftGroup.position.set(rift.x, 0, rift.z);
        const ratio = Math.max(0.05, Math.min(1, rift.remainingTimer / Math.max(0.1, rift.maxDuration)));
        const urgent = rift.remainingTimer <= 4.0;
        const pulse = 1 + Math.sin(ambientTime * (urgent ? 11.0 : 5.2)) * 0.06 * ambientScale;
        this.temporalRiftRingMesh.scale.setScalar(rift.radius * pulse);
        this.temporalRiftRingMesh.rotation.z -= ambientDt * (urgent ? 3.2 : 1.5);
        this.temporalRiftOuterTorus.rotation.y += ambientDt * 2.1;
        this.temporalRiftOuterTorus.rotation.x += ambientDt * 1.1;
        this.temporalRiftInnerTorus.rotation.y -= ambientDt * 2.9;
        this.temporalRiftInnerTorus.rotation.z += ambientDt * 1.6;
        this.temporalRiftCoreMesh.rotation.z -= ambientDt * 3.2;
        this.temporalRiftCoreMesh.rotation.y += ambientDt * 1.1;
        this.temporalRiftCoreMesh.position.y =
          1.52 + Math.sin(ambientTime * 3.8) * 0.12 * ambientScale;
        this.temporalRiftCoreMesh.scale.setScalar(0.88 + (1 - ratio) * 0.3);
        this.temporalRiftRingMat.color.setHex(urgent ? 0xf59e0b : 0x38bdf8);
        this.temporalRiftOuterTorusMat.color.setHex(urgent ? 0xf43f5e : 0xfbbf24);
        this.temporalRiftBeamMat.color.setHex(urgent ? 0xf59e0b : 0x22d3ee);
        this.temporalRiftBeamMat.opacity =
          (urgent ? 0.32 : 0.2) + Math.sin(ambientTime * 7.5) * 0.05 * ambientScale;
      }
    }

    // Chrono Stasis Overdrive [5] Expanding Geodesic Time-Dilation Dome
    if (this.overdriveDomeGroup) {
      const od = world.overdrive;
      const odActive = Boolean(od?.active);
      const targetAlpha = odActive ? 1 : 0;
      const dampRate = odActive ? 11 : 7;
      this.overdriveVisualAlpha +=
        (targetAlpha - this.overdriveVisualAlpha) * (1 - Math.exp(-dampRate * Math.max(0.001, dt)));
      if (this.overdriveVisualAlpha < 0.015 && !odActive) {
        this.overdriveVisualAlpha = 0;
        this.overdriveDomeGroup.visible = false;
      } else {
        this.overdriveDomeGroup.visible = true;
        this.overdriveDomeGroup.position.set(world.player.x, 0, world.player.z);
        const radius = 3.2 + this.overdriveVisualAlpha * 14.5;
        const flicker =
          od && od.active && od.remainingTimer < 1.0
            ? 0.65 + Math.sin(ambientTime * 22) * 0.35
            : 1.0;
        const a = this.overdriveVisualAlpha * flicker;
        this.overdriveShellMesh.scale.set(radius, radius * 0.56, radius);
        this.overdriveShellMesh.rotation.y += ambientDt * 0.22;
        this.overdriveShellMat.opacity = a * 0.14;

        this.overdriveOuterRing.scale.setScalar(radius * 0.92);
        this.overdriveOuterRing.rotation.z -= ambientDt * 0.65;
        this.overdriveOuterRingMat.opacity = a * 0.42;

        this.overdriveInnerRing.scale.setScalar(radius * 0.68);
        this.overdriveInnerRing.rotation.z += ambientDt * 1.05;
        this.overdriveInnerRingMat.opacity = a * 0.36;

        this.overdriveGroundRing.scale.setScalar(radius * 0.98);
        this.overdriveGroundRing.rotation.y += ambientDt * 0.45;
        this.overdriveGroundRingMat.opacity = a * 0.34;
      }
    }

    // SHEET 11 · Animate Perimeter Orbital Watchtower Scanner Heads & Quantum Archive Vault Locking Wheels
    if (this.watchtowerHeads) {
      for (let wi = 0; wi < this.watchtowerHeads.length; wi++) {
        const head = this.watchtowerHeads[wi];
        const phase = typeof head.userData?.phase === 'number' ? head.userData.phase : wi;
        head.rotation.y = Math.sin(ambientTime * 0.85 + phase) * 0.68 * ambientScale;
      }
    }
    if (this.vaultWheels) {
      for (let vi = 0; vi < this.vaultWheels.length; vi++) {
        this.vaultWheels[vi].rotation.z += ambientDt * (vi % 2 === 0 ? 0.52 : -0.44);
      }
    }

    // SHEET 11 · Chrono Stasis Core (Panel 1) — Orbits Sera when Overdrive is 100% READY or ascends above active Dome
    if (this.stasisCoreRig) {
      const od = world.overdrive;
      const odActive = Boolean(od?.active);
      const odReady = Boolean(od && !od.active && od.charge >= 100);
      if (odActive || odReady) {
        this.stasisCoreRig.root.visible = true;
        const bob = Math.sin(ambientTime * 3.8) * 0.12 * ambientScale;
        if (odActive) {
          this.stasisCoreRig.root.position.set(world.player.x, 3.65 + bob, world.player.z);
          this.stasisCoreRig.root.scale.setScalar(1.25);
        } else {
          const orbA = ambientTime * 1.4;
          this.stasisCoreRig.root.position.set(
            world.player.x + Math.cos(orbA) * 0.95,
            2.35 + bob,
            world.player.z + Math.sin(orbA) * 0.95
          );
          this.stasisCoreRig.root.scale.setScalar(0.54);
        }
        const spinMult = odActive ? 2.4 : 1.1;
        this.stasisCoreRig.geodesicShell.rotation.y += ambientDt * 0.9 * spinMult;
        this.stasisCoreRig.outerBrassRing.rotation.y -= ambientDt * 1.3 * spinMult;
        this.stasisCoreRig.midDarkRing.rotation.x += ambientDt * 1.5 * spinMult;
        this.stasisCoreRig.innerGoldRing.rotation.z -= ambientDt * 1.8 * spinMult;
        const corePulse = 0.94 + Math.sin(ambientTime * 7.2) * 0.08 * ambientScale;
        this.stasisCoreRig.innerCore.scale.setScalar(corePulse);
      } else {
        this.stasisCoreRig.root.visible = false;
      }
    }

    // SHEET 11 · Sovereign Obelisks (Panel 2) — Visible in Sovereign Gauntlet & Chapter V, lighting Roman Numerals I-V live
    if (this.sovereignObelisks) {
      const showObelisks = Boolean(world.gauntlet?.active || world.run?.chapter === 'chapter_5_loom');
      const clearedTrials = world.gauntlet?.active
        ? world.gauntlet.defeatedBossIds.length
        : world.run?.completedChapters?.length ?? 0;
      const currentTrialIdx = world.gauntlet?.active ? world.gauntlet.stageIndex : -1;
      for (let oi = 0; oi < this.sovereignObelisks.length; oi++) {
        const ob = this.sovereignObelisks[oi];
        ob.root.visible = showObelisks;
        if (!showObelisks) continue;
        ob.crownGroup.rotation.y += ambientDt * (oi === 0 ? 1.15 : -1.15);
        ob.crownGroup.position.y = 4.72 + Math.sin(ambientTime * 2.6 + oi * 1.8) * 0.14 * ambientScale;
        for (let t = 0; t < ob.runeMaterials.length; t++) {
          const mat = ob.runeMaterials[t];
          if (t < clearedTrials) {
            mat.emissive.setHex(0x10b981);
            mat.emissiveIntensity = 1.65;
          } else if (t === currentTrialIdx) {
            mat.emissive.setHex(0xf59e0b);
            mat.emissiveIntensity = 1.25 + Math.sin(ambientTime * 6.5) * 0.45 * ambientScale;
          } else {
            mat.emissive.setHex(0x92400e);
            mat.emissiveIntensity = 0.32;
          }
        }
      }
    }

    // SHEET 11 · Field Refit Drone (Panel 3) — Hovering Repair Companion in Sovereign Gauntlet & Overdrive
    if (this.fieldRefitDroneRig) {
      const showDrone = Boolean(world.gauntlet?.active || world.overdrive?.active);
      this.fieldRefitDroneRig.root.visible = showDrone;
      if (showDrone) {
        const refitActive = Boolean(world.gauntlet && world.gauntlet.refitBannerTimer > 0);
        const orbitAngle = world.player.rotationY - 1.15 + Math.sin(ambientTime * 1.2) * 0.25;
        const orbitDist = refitActive ? 1.15 : 1.68;
        const targetX = world.player.x + Math.sin(orbitAngle) * orbitDist;
        const targetZ = world.player.z + Math.cos(orbitAngle) * orbitDist;
        const targetY = (refitActive ? 1.75 : 2.12) + Math.sin(ambientTime * 4.4) * 0.14 * ambientScale;
        this.fieldRefitDroneRig.root.position.set(targetX, targetY, targetZ);
        this.fieldRefitDroneRig.root.rotation.y = Math.atan2(
          world.player.x - targetX,
          world.player.z - targetZ
        );
        const weldSwing = Math.sin(ambientTime * (refitActive ? 14 : 4.2)) * (refitActive ? 0.35 : 0.12);
        this.fieldRefitDroneRig.leftWelderArm.rotation.x = weldSwing;
        this.fieldRefitDroneRig.rightWelderArm.rotation.x = -weldSwing;
        const plumeScale = 0.85 + Math.sin(ambientTime * 24) * 0.22 * ambientScale;
        for (let pi = 0; pi < this.fieldRefitDroneRig.thrusterPlumes.length; pi++) {
          this.fieldRefitDroneRig.thrusterPlumes[pi].scale.set(1, plumeScale, 1);
        }
        this.fieldRefitDroneRig.naniteCanisterMat.emissive.setHex(refitActive ? 0x10b981 : 0x06b6d4);
        this.fieldRefitDroneRig.naniteCanisterMat.emissiveIntensity = refitActive ? 2.6 : 1.6;
      }
    }

    // EXPEDITION JOURNEY 3D GATEWAYS, BREACH SEAL & FLOOR GUIDE TRAIL (guarded for headless tests)
    const exp = world.expedition;
    const isExpedition = Boolean(exp?.enabled);
    const isLoomFinal = world.run?.chapter === 'chapter_5_loom';

    if (this.entryAirlockRig) {
      this.entryAirlockRig.root.visible = isExpedition;
      if (isExpedition) {
        this.entryAirlockRig.beaconMat.emissiveIntensity =
          1.15 + Math.sin(ambientTime * 3.0) * 0.28 * ambientScale;
      }
    }

    if (this.transitAirlockRig) {
      const showNorthAirlock =
        isExpedition && (!isLoomFinal || exp?.phase === 'safe_room');
      this.transitAirlockRig.root.visible = showNorthAirlock;
      if (showNorthAirlock && exp) {
        const unlocked = exp.airlockUnlocked;
        this.transitAirlockRig.lockBarsGroup.visible = !unlocked;
        if (unlocked) {
          const pulse = 0.5 + 0.5 * Math.sin(ambientTime * 4.6) * ambientScale;
          this.transitAirlockRig.statusStripMat.color.setHex(0x34d399);
          this.transitAirlockRig.statusStripMat.emissive.setHex(0x10b981);
          this.transitAirlockRig.statusStripMat.emissiveIntensity = 1.65 + pulse * 0.75;
          this.transitAirlockRig.portalMat.opacity = 0.44 + pulse * 0.24;
          this.transitAirlockRig.portalRingMat.opacity = 0.85;
          this.transitAirlockRig.portalRing.rotation.z += ambientDt * 2.1;
          const ringScale = 0.96 + pulse * 0.08;
          this.transitAirlockRig.portalRing.scale.set(ringScale, ringScale, 1);
          this.transitAirlockRig.thresholdMat.color.setHex(0x10b981);
          this.transitAirlockRig.thresholdMat.opacity = 0.34 + pulse * 0.22;
        } else {
          this.transitAirlockRig.statusStripMat.color.setHex(0xf43f5e);
          this.transitAirlockRig.statusStripMat.emissive.setHex(0xe11d48);
          this.transitAirlockRig.statusStripMat.emissiveIntensity =
            1.1 + Math.sin(ambientTime * 3.2) * 0.35 * ambientScale;
          this.transitAirlockRig.portalMat.opacity = 0.0;
          this.transitAirlockRig.portalRingMat.opacity = 0.0;
          this.transitAirlockRig.thresholdMat.color.setHex(0xf43f5e);
          this.transitAirlockRig.thresholdMat.opacity = 0.18;
        }
      }
    }

    if (this.breachSealRig) {
      const showSeal = Boolean(isExpedition && exp?.phase === 'explore');
      this.breachSealRig.root.visible = showSeal;
      if (showSeal && exp) {
        this.breachSealRig.root.position.set(exp.breachSealPos.x, 0.02, exp.breachSealPos.z);
        this.breachSealRig.outerRing.rotation.z += ambientDt * 0.75;
        this.breachSealRig.innerRing.rotation.z -= ambientDt * 1.35;
        this.breachSealRig.crystalPrism.rotation.y += ambientDt * 1.9;
        this.breachSealRig.crystalPrism.position.y =
          1.62 + Math.sin(ambientTime * 3.2) * 0.16 * ambientScale;
        const inside = exp.playerInsideBreachSeal;
        this.breachSealRig.zoneMat.opacity = inside
          ? 0.3 + Math.sin(ambientTime * 8.0) * 0.08 * ambientScale
          : 0.14;
        this.breachSealRig.prismMat.emissiveIntensity = inside ? 2.3 : 1.35;
      }
    }

    if (this.safeRoomHubRig) {
      const showSafeRoom = Boolean(
        isExpedition && exp?.phase === 'safe_room' && exp.safeRoom?.active
      );
      this.safeRoomHubRig.root.visible = showSafeRoom;
      if (showSafeRoom && exp?.safeRoom) {
        const sr = exp.safeRoom;
        const pulse = 0.5 + 0.5 * Math.sin(ambientTime * 3.6) * ambientScale;
        this.safeRoomHubRig.workbenchHolo.rotation.y += ambientDt * 1.15;
        this.safeRoomHubRig.workbenchHolo.position.y =
          1.98 + Math.sin(ambientTime * 2.8) * 0.07 * ambientScale;
        for (let i = 0; i < this.safeRoomHubRig.welderArms.length; i++) {
          this.safeRoomHubRig.welderArms[i].rotation.y =
            Math.sin(ambientTime * 1.6 + i * 1.9) * 0.14 * ambientScale;
        }
        this.safeRoomHubRig.medCore.rotation.y += ambientDt * 1.4;
        this.safeRoomHubRig.medCore.position.y =
          2.52 + Math.sin(ambientTime * 3.2) * 0.09 * ambientScale;
        this.safeRoomHubRig.medRing.rotation.z += ambientDt * 0.85;
        this.safeRoomHubRig.medGlowMat.emissiveIntensity = sr.medBayUsed
          ? 0.55
          : 1.55 + pulse * 0.65;
        this.safeRoomHubRig.lysaHoloGroup.rotation.y =
          Math.sin(ambientTime * 0.7) * 0.22 * ambientScale;
        this.safeRoomHubRig.lysaHoloGroup.position.y =
          1.98 + Math.sin(ambientTime * 2.4) * 0.06 * ambientScale;
        this.safeRoomHubRig.lysaOuterRing.rotation.z += ambientDt * 0.95;
        this.safeRoomHubRig.lysaInnerRing.rotation.z -= ambientDt * 1.35;
        this.safeRoomHubRig.lysaRing.rotation.z -= ambientDt * 0.9;
        this.safeRoomHubRig.lysaMat.emissiveIntensity = sr.lysaBriefingClaimed
          ? 0.85
          : 1.5 + pulse * 0.55;

        // Station Holo-Map Table (Sheet 12, Panel 7) — highlight cleared sectors in emerald
        this.safeRoomHubRig.holoMapGroup.rotation.y += ambientDt * 0.42;
        this.safeRoomHubRig.holoMapGroup.position.y =
          1.58 + Math.sin(ambientTime * 2.1) * 0.05 * ambientScale;
        for (let i = 0; i < this.safeRoomHubRig.holoMapNodeMats.length; i++) {
          const cleared = i <= exp.sectorIndex;
          this.safeRoomHubRig.holoMapNodeMats[i].color.setHex(cleared ? 0x6ee7b7 : 0x7dd3fc);
          this.safeRoomHubRig.holoMapNodeMats[i].emissive.setHex(cleared ? 0x10b981 : 0x0ea5e9);
        }

        // Sovereign NG+ Crest (Sheet 12, Panel 8) — twin gyro rings & golden crown
        const ngCycle = world.progression.ngPlusCycle ?? 0;
        const ngSpeed = ngCycle > 0 ? 1.55 : 0.85;
        this.safeRoomHubRig.crestOuterRing.rotation.z += ambientDt * 1.15 * ngSpeed;
        this.safeRoomHubRig.crestInnerRing.rotation.x += ambientDt * 1.45 * ngSpeed;
        this.safeRoomHubRig.crestCrown.rotation.y += ambientDt * 0.9 * ngSpeed;
        this.safeRoomHubRig.crestCrown.position.y =
          1.58 + Math.sin(ambientTime * 2.7) * 0.07 * ambientScale;
        this.safeRoomHubRig.crestCrownMat.emissiveIntensity =
          (ngCycle > 0 ? 2.0 : 1.35) + pulse * 0.55;

        // Paradox Rift Gate (0, 0, -6.2) — Sheet 13 Panel 4 (vortex + orbiting crystal shards)
        const riftReady = Boolean(world.paradox?.paradoxRiftUnlocked);
        const riftSpeed = riftReady ? 1.65 : 0.45;
        this.safeRoomHubRig.paradoxRiftOuterRing.rotation.z += ambientDt * 1.15 * riftSpeed;
        this.safeRoomHubRig.paradoxRiftInnerRing.rotation.z -= ambientDt * 1.55 * riftSpeed;
        this.safeRoomHubRig.paradoxRiftInnerRing.rotation.y = Math.sin(ambientTime * 1.4) * 0.24;
        if (this.safeRoomHubRig.paradoxVortexMesh) {
          this.safeRoomHubRig.paradoxVortexMesh.rotation.z -= ambientDt * 1.4 * riftSpeed;
        }
        if (this.safeRoomHubRig.paradoxCrystalShards) {
          for (let s = 0; s < this.safeRoomHubRig.paradoxCrystalShards.length; s++) {
            const shard = this.safeRoomHubRig.paradoxCrystalShards[s];
            const baseAngle = Number(shard.userData.baseAngle) || 0;
            const orbitRad = Number(shard.userData.orbitRadius) || 1.45;
            const a = baseAngle + ambientTime * (s % 2 === 0 ? 0.36 : -0.52) * riftSpeed;
            shard.position.x = Math.cos(a) * orbitRad;
            shard.position.y = 1.72 + Math.sin(a) * orbitRad;
            shard.rotation.z = a - Math.PI * 0.5;
            shard.rotation.y += ambientDt * 1.4;
          }
        }
        this.safeRoomHubRig.paradoxRiftRingMat.color.setHex(riftReady ? 0xe879f9 : 0x475569);
        this.safeRoomHubRig.paradoxRiftRingMat.emissive.setHex(riftReady ? 0xa855f7 : 0x1e293b);
        this.safeRoomHubRig.paradoxRiftRingMat.emissiveIntensity = riftReady
          ? 1.7 + pulse * 0.75
          : 0.45;
        this.safeRoomHubRig.paradoxRiftCoreMat.opacity = riftReady
          ? 0.78 + pulse * 0.18
          : 0.22;

        // Field Fabricator Kiosk (-3.2, 0, -0.6) — Sheet 13 Panel 3 amber holo blueprint
        if (this.safeRoomHubRig.fabricatorHoloMesh) {
          this.safeRoomHubRig.fabricatorHoloMesh.position.y =
            1.88 + Math.sin(ambientTime * 2.6) * 0.04 * ambientScale;
        }
        if (this.safeRoomHubRig.fabricatorHoloMat) {
          this.safeRoomHubRig.fabricatorHoloMat.opacity = 0.82 + pulse * 0.16;
        }

        // Daily Trial Obelisk (3.2, 0, -0.6) — Sheet 14 Panel 6 chronometer hologram
        if (this.safeRoomHubRig.dailyObeliskChronoGroup) {
          this.safeRoomHubRig.dailyObeliskChronoGroup.rotation.y += ambientDt * 1.15;
          this.safeRoomHubRig.dailyObeliskChronoGroup.position.y =
            1.78 + Math.sin(ambientTime * 2.4) * 0.06 * ambientScale;
        }
        if (this.safeRoomHubRig.dailyObeliskBeamMat) {
          this.safeRoomHubRig.dailyObeliskBeamMat.opacity = 0.26 + pulse * 0.14;
        }
      }
    }

    // Sheet 14 Panel 7: Sleek Chrono Finisher Rift VFX eruption
    if (this.finisherRiftRig) {
      const riftTimer = world.ascension?.finisherRiftTimer ?? 0;
      const showRift = riftTimer > 0.01;
      this.finisherRiftRig.root.visible = showRift;
      if (showRift) {
        const progress = Math.max(0, Math.min(1, 1 - riftTimer / 1.45));
        const expandScale = 0.45 + Math.sin(Math.min(1, progress * 2.1) * Math.PI * 0.5) * 1.65;
        const fade = Math.pow(Math.max(0, Math.min(1, riftTimer / 0.58)), 1.3);
        this.finisherRiftRig.root.position.set(
          world.ascension?.finisherRiftX ?? world.player.x,
          0,
          world.ascension?.finisherRiftZ ?? world.player.z
        );
        this.finisherRiftRig.root.scale.set(expandScale, 0.92 + progress * 0.25, expandScale);
        this.finisherRiftRig.outerRing.rotation.z += ambientDt * 3.4;
        this.finisherRiftRig.slashShardsGroup.rotation.y -= ambientDt * 5.2;
        this.finisherRiftRig.voidMat.opacity = 0.32 * fade;
        this.finisherRiftRig.goldSlashMat.opacity = 0.68 * fade;
        this.finisherRiftRig.violetSlashMat.opacity = 0.56 * fade;
      }
    }

    // Sheet 14 Panel 8: Photo Drone Lens orbiting Sera during 3D Photo Mode
    if (this.photoDroneRig) {
      const showPhotoDrone = Boolean(this.photoModeCam?.active && this.photoModeCam?.showDrone);
      this.photoDroneRig.root.visible = showPhotoDrone;
      if (showPhotoDrone && this.photoModeCam) {
        const orbitAngle = this.photoModeCam.yawOffset + 0.65;
        const px = world.player.x + Math.sin(orbitAngle) * 1.85;
        const pz = world.player.z + Math.cos(orbitAngle) * 1.85;
        const py = 2.05 + Math.sin(ambientTime * 2.8) * 0.08;
        this.photoDroneRig.root.position.set(px, py, pz);
        this.photoDroneRig.bodyGroup.rotation.y = Math.atan2(
          world.player.x - px,
          world.player.z - pz
        );
        this.photoDroneRig.lensRing.rotation.z += ambientDt * 2.2;
      }
    }

    // Live 3D Sera Rig Skin Application (applies live on Title Screen & in Gameplay)
    const activeSkinId = world.progression?.equippedSkinId ?? 'nadir_standard';
    if (this.playerRig && this.lastAppliedSkinId !== activeSkinId) {
      this.lastAppliedSkinId = activeSkinId;
      const skinDef = getSeraRigSkinDefinition(activeSkinId);
      if (this.playerRig.armorMaterial) {
        this.playerRig.armorMaterial.color.setHex(skinDef.armorHex);
      }
      if (this.playerRig.suitMaterial) {
        this.playerRig.suitMaterial.color.setHex(skinDef.suitHex);
      }
      if (this.playerRig.visorMaterial) {
        this.playerRig.visorMaterial.color.setHex(skinDef.accentHex);
        this.playerRig.visorMaterial.emissive.setHex(skinDef.accentHex);
      }
      if (this.playerRig.chronoAccentMaterial) {
        this.playerRig.chronoAccentMaterial.color.setHex(skinDef.ringHex);
        this.playerRig.chronoAccentMaterial.emissive.setHex(skinDef.accentHex);
      }
      if (this.playerRig.bladeMaterial) {
        this.playerRig.bladeMaterial.color.setHex(skinDef.bladeHex);
        this.playerRig.bladeMaterial.emissive.setHex(skinDef.accentHex);
      }
      if (this.playerRig.sovereignCrownHaloGroup) {
        this.playerRig.sovereignCrownHaloGroup.visible = activeSkinId === 'sovereign_gold';
      }
      if (this.playerRig.paradoxPrismSpikesGroup) {
        this.playerRig.paradoxPrismSpikesGroup.visible = activeSkinId === 'paradox_prism';
      }
      if (this.playerRig.paradoxPrismHeadFinsGroup) {
        this.playerRig.paradoxPrismHeadFinsGroup.visible = activeSkinId === 'paradox_prism';
      }
    }
    if (this.playerRig?.sovereignCrownHaloGroup?.visible) {
      this.playerRig.sovereignCrownHaloGroup.rotation.y += ambientDt * 1.15;
      this.playerRig.sovereignCrownHaloGroup.position.y =
        0.25 + Math.sin(ambientTime * 3.1) * 0.018 * ambientScale;
    }

    // v4.0.0: Zero-GC 3D Sovereign Astral Crown Rig (Mastery Seal Tiers 0..4)
    if (this.playerRig?.astralCrownRig) {
      const crown = this.playerRig.astralCrownRig;
      const sealTier = computeMasterySealModifiers(world.progression?.combatMastery).tier;
      const crownVisible = sealTier >= 1 && world.player.actionState !== 'dead';
      crown.group.visible = crownVisible;
      if (crownVisible) {
        const slipActive = (world.player.temporalSlipTimer ?? 0) > 0;
        const overdriveActive = Boolean(world.overdrive?.active);
        const flareBoost = slipActive ? 1.0 : overdriveActive ? 0.55 : 0;
        const bladeCount = sealTier * 2;
        crown.bladesInstancedMesh.count = bladeCount;
        crown.innerGimbalArc.visible = sealTier >= 2;
        crown.omegaKeystoneGroup.visible = sealTier >= 4;

        const arcHex =
          sealTier === 1
            ? 0xd97706
            : sealTier === 2
              ? 0x94a3b8
              : sealTier === 3
                ? 0xfbbf24
                : 0xfde047;
        const bladeEmissiveHex =
          sealTier === 1
            ? 0xf59e0b
            : sealTier === 2
              ? 0x38bdf8
              : sealTier === 3
                ? 0xfacc15
                : slipActive
                  ? 0x67e8f9
                  : 0xc084fc;
        crown.arcMaterial.color.setHex(arcHex);
        crown.arcMaterial.emissive.setHex(bladeEmissiveHex);
        crown.arcMaterial.emissiveIntensity = 0.42 + flareBoost * 0.55;
        crown.bladeMaterial.emissive.setHex(bladeEmissiveHex);
        crown.bladeMaterial.emissiveIntensity = 0.78 + flareBoost * 0.75;

        const spinRate = (0.72 + sealTier * 0.18 + flareBoost * 1.45) * ambientScale;
        crown.outerAstrolabeArc.rotation.z += ambientDt * spinRate;
        crown.innerGimbalArc.rotation.z -= ambientDt * spinRate * 1.32;
        if (crown.omegaKeystoneGroup.visible) {
          crown.omegaKeystoneGroup.position.y =
            0.73 + Math.sin(ambientTime * 3.4) * 0.025 * ambientScale + flareBoost * 0.05;
        }

        const baseRadius = 0.74 + sealTier * 0.025 + flareBoost * 0.14;
        const orbitPhase = ambientTime * (0.95 + flareBoost * 1.35) * ambientScale;
        for (let b = 0; b < bladeCount; b += 1) {
          const theta = orbitPhase + (b / bladeCount) * Math.PI * 2;
          const radialPulse =
            baseRadius + Math.sin(ambientTime * 2.8 + b * 1.1) * 0.024 * ambientScale;
          const zWave = Math.cos(ambientTime * 2.2 + b * 0.85) * 0.055 * ambientScale;
          _astralCrownDummy.position.set(
            Math.cos(theta) * radialPulse,
            Math.sin(theta) * radialPulse,
            zWave
          );
          _astralCrownDummy.rotation.set(
            zWave * 1.8,
            Math.sin(theta) * 0.24,
            theta - Math.PI * 0.5
          );
          const s = (0.9 + (b % 2) * 0.14) * (1 + flareBoost * 0.16);
          _astralCrownDummy.scale.set(s, s, s);
          _astralCrownDummy.updateMatrix();
          crown.bladesInstancedMesh.setMatrixAt(b, _astralCrownDummy.matrix);

          if (sealTier === 4) {
            _astralCrownColor.setHex(
              b % 3 === 0 ? 0xfde047 : b % 3 === 1 ? 0x67e8f9 : 0xc084fc
            );
          } else if (sealTier === 3) {
            _astralCrownColor.setHex(b % 2 === 0 ? 0xfef08a : 0x67e8f9);
          } else if (sealTier === 2) {
            _astralCrownColor.setHex(b % 2 === 0 ? 0x7dd3fc : 0xe2e8f0);
          } else {
            _astralCrownColor.setHex(0xfcd34d);
          }
          crown.bladesInstancedMesh.setColorAt(b, _astralCrownColor);
        }
        crown.bladesInstancedMesh.instanceMatrix.needsUpdate = true;
        if (crown.bladesInstancedMesh.instanceColor) {
          crown.bladesInstancedMesh.instanceColor.needsUpdate = true;
        }
      }
    }

    // Tactical Med-Nanite Canister (Sheet 13 Panel 5) holstered on Sera's left hip
    const naniteCount = world.paradox?.loadout?.naniteInjectors ?? 0;
    if (this.playerRig?.naniteCanisterGroup) {
      this.playerRig.naniteCanisterGroup.visible =
        naniteCount > 0 && world.player.actionState !== 'dead';
    }

    // Reactive 3D Aegis Honeycomb Shield Dome + Regenerative Chrono Ward (Sheet 13 Panel 6)
    const aegisHp = world.paradox?.loadout?.aegisShieldHp ?? 0;
    const chronoWard = world.chronoAegis?.ward ?? 0;
    const totalWardHp = aegisHp + chronoWard;
    const hasAegis = totalWardHp > 0 && world.player.actionState !== 'dead';
    if (this.playerRig?.aegisEmitterGroup) {
      this.playerRig.aegisEmitterGroup.visible = hasAegis;
    }
    if (this.playerRig?.aegisShieldMesh && this.playerRig?.aegisShieldMaterial) {
      this.playerRig.aegisShieldMesh.visible = hasAegis;
      if (hasAegis) {
        this.playerRig.aegisShieldMesh.rotation.y += ambientDt * 0.65;
        this.playerRig.aegisShieldMesh.rotation.x = Math.sin(ambientTime * 1.2) * 0.1;
        this.playerRig.aegisShieldMaterial.color.setHex(aegisHp > 0 ? 0x38bdf8 : 0x34d399);
        this.playerRig.aegisShieldMaterial.opacity =
          0.32 + Math.min(0.32, (totalWardHp / 65) * 0.28) + Math.sin(ambientTime * 4.2) * 0.05;
      }
    }

    if (this.bossCorePulseTimer > 0) {
      this.bossCorePulseTimer = Math.max(0, this.bossCorePulseTimer - ambientDt);
    }

    // v3.4.0 Dorsal Boss Echo Core 3D Sigil behind Sera's Chrono Rig
    if (this.bossCoreSigilRig) {
      const equippedCoreId = world.progression?.equippedBossCore;
      const showCoreSigil = Boolean(
        equippedCoreId &&
          isValidBossEchoCoreId(equippedCoreId) &&
          world.player.actionState !== 'dead'
      );
      this.bossCoreSigilRig.root.visible = showCoreSigil;
      if (showCoreSigil && equippedCoreId && isValidBossEchoCoreId(equippedCoreId)) {
        const coreSpec = BOSS_ECHO_CORES[equippedCoreId];
        const isOmegaCore = isBossCoreTranscended(
          equippedCoreId,
          world.progression?.transcendedBossCores
        );
        const isAttuned = isWeaponAttunedToBossCore(
          world.player.equippedWeaponId,
          equippedCoreId,
          world.progression?.transcendedBossCores
        );
        const attuneSpinMult = isAttuned ? 1.45 : 1.0;
        const attuneGlowBonus = isAttuned ? 0.35 : 0;
        const yaw = world.player.rotationY;
        const backDist = 0.4;
        const bobY = 1.46 + Math.sin(ambientTime * 3.4) * 0.042 * ambientScale;
        this.bossCoreSigilRig.root.position.set(
          world.player.x - Math.sin(yaw) * backDist,
          bobY,
          world.player.z - Math.cos(yaw) * backDist
        );
        this.bossCoreSigilRig.root.rotation.y = yaw;
        const flare =
          (isOmegaCore ? 1.12 : 1) +
          (isAttuned ? 0.06 : 0) +
          this.bossCorePulseTimer * 0.65;
        this.bossCoreSigilRig.root.scale.setScalar(flare);
        this.bossCoreSigilRig.outerRing.rotation.z +=
          ambientDt * 2.15 * attuneSpinMult * ambientScale;
        this.bossCoreSigilRig.innerRing.rotation.x +=
          ambientDt * 2.85 * attuneSpinMult * ambientScale;
        this.bossCoreSigilRig.crystalMesh.rotation.y +=
          ambientDt * 1.9 * attuneSpinMult * ambientScale;
        this.bossCoreSigilRig.crystalMat.color.setHex(coreSpec.crystalHex);
        this.bossCoreSigilRig.crystalMat.emissive.setHex(coreSpec.crystalHex);
        this.bossCoreSigilRig.crystalMat.emissiveIntensity =
          (isOmegaCore ? 2.45 : 2.05) +
          attuneGlowBonus +
          this.bossCorePulseTimer * 2.2 +
          Math.sin(ambientTime * 5.0) * 0.25;
        this.bossCoreSigilRig.ringMat.color.setHex(coreSpec.ringHex);
        this.bossCoreSigilRig.ringMat.emissive.setHex(coreSpec.ringHex);
        this.bossCoreSigilRig.ringMat.emissiveIntensity =
          (isOmegaCore ? 2.05 : 1.65) + attuneGlowBonus + this.bossCorePulseTimer * 1.6;

        this.bossCoreSigilRig.omegaCrownRing.visible = isOmegaCore;
        this.bossCoreSigilRig.omegaWingLeft.visible = isOmegaCore;
        this.bossCoreSigilRig.omegaWingRight.visible = isOmegaCore;
        if (isOmegaCore) {
          const wingBreath = Math.sin(ambientTime * 4.2) * 0.08 * ambientScale;
          this.bossCoreSigilRig.omegaWingLeft.rotation.z = Math.PI * 0.32 + wingBreath;
          this.bossCoreSigilRig.omegaWingRight.rotation.z = -Math.PI * 0.32 - wingBreath;
          this.bossCoreSigilRig.omegaMat.emissive.setHex(coreSpec.crystalHex);
          this.bossCoreSigilRig.omegaMat.emissiveIntensity =
            2.25 + this.bossCorePulseTimer * 1.8 + Math.sin(ambientTime * 6.0) * 0.28;
        }
      }
    }

    // Autonomous 3D Combat Drone Wingman & LYS-04 Chrono Sentinel Companion (Sheet 13 Panel 2)
    if (this.combatDroneRig) {
      const loadout = world.paradox?.loadout;
      const aegisCompanion = world.chronoAegis;
      const hasParadoxDrone = Boolean(loadout && loadout.combatDroneTier > 0);
      const hasSentinelDrone = Boolean(
        aegisCompanion &&
          aegisCompanion.mode !== 'off' &&
          world.player.actionState !== 'dead'
      );
      const showDrone = hasParadoxDrone || hasSentinelDrone;
      this.combatDroneRig.root.visible = showDrone;
      if (showDrone) {
        const hoverY = 1.85 + Math.sin(ambientTime * 3.8) * 0.12 * ambientScale;
        if (hasParadoxDrone && loadout) {
          const isMk2 = loadout.combatDroneTier >= 2;
          this.combatDroneRig.root.position.set(loadout.droneX, hoverY, loadout.droneZ);
          this.combatDroneRig.haloRing.rotation.z += ambientDt * (isMk2 ? 3.2 : 1.9);
          this.combatDroneRig.haloMat.color.setHex(isMk2 ? 0x67e8f9 : 0x38bdf8);
          this.combatDroneRig.haloMat.emissive.setHex(isMk2 ? 0x06b6d4 : 0x0ea5e9);
          this.combatDroneRig.haloMat.emissiveIntensity = isMk2 ? 2.35 : 1.65;
          this.combatDroneRig.coreMat.color.setHex(isMk2 ? 0x67e8f9 : 0x38bdf8);
          this.combatDroneRig.coreMat.emissive.setHex(isMk2 ? 0x06b6d4 : 0x0284c7);

          if (this.combatDroneRig.thrusterFlames) {
            const flamePulse = 0.85 + Math.sin(ambientTime * 24) * 0.22;
            for (let f = 0; f < this.combatDroneRig.thrusterFlames.length; f++) {
              this.combatDroneRig.thrusterFlames[f].scale.set(
                1,
                isMk2 ? flamePulse * 1.2 : flamePulse * 0.85,
                1
              );
            }
          }

          const targetEnemy = loadout.droneTargetId
            ? world.enemies.find((e) => e.id === loadout.droneTargetId && e.hp > 0)
            : null;
          if (targetEnemy) {
            this.combatDroneRig.bodyGroup.rotation.y = Math.atan2(
              targetEnemy.x - loadout.droneX,
              targetEnemy.z - loadout.droneZ
            );
          } else {
            this.combatDroneRig.bodyGroup.rotation.y = world.player.rotationY;
          }
        } else if (aegisCompanion) {
          const spec =
            SENTINEL_PROTOCOL_SPECS[aegisCompanion.mode] ?? SENTINEL_PROTOCOL_SPECS.aegis;
          this.combatDroneRig.root.position.set(
            aegisCompanion.droneX,
            hoverY,
            aegisCompanion.droneZ
          );
          this.combatDroneRig.haloRing.rotation.z += ambientDt * 2.45;
          this.combatDroneRig.haloMat.color.setHex(spec.haloHex);
          this.combatDroneRig.haloMat.emissive.setHex(spec.emissiveHex);
          this.combatDroneRig.haloMat.emissiveIntensity = 2.05;
          this.combatDroneRig.coreMat.color.setHex(spec.haloHex);
          this.combatDroneRig.coreMat.emissive.setHex(spec.emissiveHex);

          if (this.combatDroneRig.thrusterFlames) {
            const flamePulse = 0.88 + Math.sin(ambientTime * 22) * 0.2;
            for (let f = 0; f < this.combatDroneRig.thrusterFlames.length; f++) {
              this.combatDroneRig.thrusterFlames[f].scale.set(1, flamePulse, 1);
            }
          }

          const targetEnemy = aegisCompanion.lastTargetId
            ? world.enemies.find((e) => e.id === aegisCompanion.lastTargetId && e.hp > 0)
            : null;
          if (targetEnemy) {
            this.combatDroneRig.bodyGroup.rotation.y = Math.atan2(
              targetEnemy.x - aegisCompanion.droneX,
              targetEnemy.z - aegisCompanion.droneZ
            );
          } else {
            this.combatDroneRig.bodyGroup.rotation.y = world.player.rotationY;
          }
        }

        if (this.droneBeamTimer > 0) {
          this.droneBeamTimer = Math.max(0, this.droneBeamTimer - ambientDt);
          this.combatDroneRig.beamMat.opacity = Math.min(0.95, this.droneBeamTimer / 0.18);
          this.combatDroneRig.muzzleFlashMesh.visible = this.droneBeamTimer > 0.09;
          if (this.droneBeamTimer <= 0) {
            this.combatDroneRig.beamMesh.visible = false;
            this.combatDroneRig.muzzleFlashMesh.visible = false;
          }
        }
      }
    }

    if (this.secretVaultRig) {
      const vault = isExpedition && exp?.phase !== 'safe_room' ? exp?.secretVault ?? null : null;
      this.secretVaultRig.root.visible = Boolean(vault);
      if (vault) {
        this.secretVaultRig.switchGroup.position.set(vault.switchPos.x, 0, vault.switchPos.z);
        this.secretVaultRig.vaultGroup.position.set(vault.vaultPos.x, 0, vault.vaultPos.z);

        // Stretch floor energy conduit between West Switch Pad and East Secret Vault
        const cdx = vault.vaultPos.x - vault.switchPos.x;
        const cdz = vault.vaultPos.z - vault.switchPos.z;
        const cLen = Math.hypot(cdx, cdz);
        this.secretVaultRig.conduitLine.position.set(
          (vault.switchPos.x + vault.vaultPos.x) * 0.5,
          0.045,
          (vault.switchPos.z + vault.vaultPos.z) * 0.5
        );
        this.secretVaultRig.conduitLine.scale.set(Math.max(1, cLen - 3.4), 1, 1);
        this.secretVaultRig.conduitLine.rotation.z = -Math.atan2(cdz, cdx);

        const open = vault.gateOpen;
        this.secretVaultRig.laserBarsGroup.visible = !open;
        this.secretVaultRig.emitterBeamsGroup.visible = !open;
        this.secretVaultRig.relicCore.visible = !vault.looted;

        this.secretVaultRig.switchCrystal.rotation.y += ambientDt * (vault.switchPressed ? 3.4 : 1.2);
        this.secretVaultRig.switchCrystal.position.y =
          (vault.switchPressed ? 1.22 : 1.0) + Math.sin(ambientTime * 3.2) * 0.08 * ambientScale;
        this.secretVaultRig.switchRingMat.color.setHex(
          vault.heldByEcho ? 0x34d399 : vault.switchPressed ? 0xfbbf24 : 0x38bdf8
        );

        this.secretVaultRig.relicCore.rotation.y += ambientDt * 2.1;
        this.secretVaultRig.relicCore.position.y =
          1.54 + Math.sin(ambientTime * 3.0) * 0.11 * ambientScale;

        const vaultColor = vault.looted ? 0x38bdf8 : open ? 0x10b981 : 0xf43f5e;
        this.secretVaultRig.vaultRingMat.color.setHex(vaultColor);
        this.secretVaultRig.conduitMat.color.setHex(vaultColor);
        this.secretVaultRig.conduitMat.opacity = open ? 0.66 : 0.3;
      }
    }

    if (this.expeditionTrailRig) {
      const guide = exp?.guideTarget ?? null;
      const showTrail = Boolean(
        isExpedition &&
          guide &&
          (exp?.phase === 'explore' ||
            exp?.phase === 'airlock_open' ||
            exp?.phase === 'safe_room') &&
          guide.distance > 1.8
      );
      this.expeditionTrailRig.root.visible = showTrail;
      if (showTrail && guide) {
        const dx = guide.x - world.player.x;
        const dz = guide.z - world.player.z;
        const dist = Math.hypot(dx, dz);
        const dirX = dist > 0.001 ? dx / dist : 0;
        const dirZ = dist > 0.001 ? dz / dist : -1;
        // ShapeGeometry points toward -Z after -PI/2 X rotation; align with (dirX, dirZ)
        const yaw = Math.atan2(dirX, dirZ) + Math.PI;
        const trailColor =
          guide.kind === 'transit_gate' || guide.kind === 'safe_room_med'
            ? 0x10b981
            : guide.kind === 'cache' || guide.kind === 'secret_vault'
              ? 0xfbbf24
              : guide.kind === 'terminal' || guide.kind === 'safe_room_lysa'
                ? 0x38bdf8
                : guide.kind === 'beacon'
                  ? 0x34d399
                  : 0xf59e0b;

        const chevrons = this.expeditionTrailRig.chevrons;
        const mats = this.expeditionTrailRig.materials;
        const maxSteps = chevrons.length;
        const startOffset = 1.65;
        const span = Math.max(0, dist - startOffset - 1.0);
        const stepDist = Math.min(2.15, Math.max(1.15, span / Math.max(1, maxSteps)));
        const wavePhase = (ambientTime * 3.8) % maxSteps;

        for (let ci = 0; ci < maxSteps; ci++) {
          const along = startOffset + ci * stepDist;
          const mesh = chevrons[ci];
          const mat = mats[ci];
          if (along < dist - 0.85) {
            mesh.visible = true;
            mesh.position.set(
              world.player.x + dirX * along,
              0.08,
              world.player.z + dirZ * along
            );
            mesh.rotation.y = yaw;
            const pulseDist = Math.abs(((ci - wavePhase + maxSteps) % maxSteps));
            const waveBoost = pulseDist < 1.5 ? 1 - pulseDist / 1.5 : 0;
            const scale = 0.82 + waveBoost * 0.28 * ambientScale;
            mesh.scale.set(scale, 1, scale);
            mat.color.setHex(trailColor);
            mat.opacity = 0.34 + waveBoost * 0.56;
          } else {
            mesh.visible = false;
          }
        }
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

    if (this.impactRingPool) {
      let maxRemaining = 0;
      for (let i = 0; i < this.impactRingPool.length; i++) {
        const slot = this.impactRingPool[i];
        if (slot.timer > 0) {
          slot.timer = Math.max(0, slot.timer - dt);
          if (slot.timer > maxRemaining) maxRemaining = slot.timer;
          const progress = 1 - slot.timer / Math.max(0.05, slot.duration);
          const eased = 1 - Math.pow(1 - progress, 2.2);
          slot.mesh.scale.setScalar(0.65 + eased * slot.maxScale);
          slot.mat.uniforms.uProgress.value = eased;
          slot.mat.uniforms.uOpacity.value = Math.max(0, (1 - progress * progress) * 0.92);
          slot.mat.uniforms.uTime.value = world.elapsedTime;
          slot.mesh.rotation.y += dt * 1.9;
          if (slot.timer <= 0) {
            slot.mesh.visible = false;
          }
        }
      }
      this.impactRingTimer = maxRemaining;
    }

    // v2.8.0: Animate 3D Orbital Atmospheric Motes tinted by active chapter palette (zero-GC)
    if (this.ambientMotesPoints && this.ambientMotesMat) {
      const motesEnabled = this.screenEffectsEnabled !== false && this.particleQuality !== 'low';
      this.ambientMotesPoints.visible = motesEnabled;
      if (motesEnabled) {
        const chapterId = world.run?.chapter ?? 'prologue';
        const moteHex =
          chapterId === 'chapter_2_choir'
            ? 0x34d399
            : chapterId === 'chapter_3_curator'
              ? 0xa78bfa
              : chapterId === 'chapter_4_matron'
                ? 0xfb7185
                : chapterId === 'chapter_5_loom'
                  ? 0xfbbf24
                  : 0x38bdf8;
        this.ambientMotesMat.uniforms.uColor.value.setHex(moteHex);
        this.ambientMotesMat.uniforms.uTime.value = this.reducedMotion ? 0 : world.elapsedTime;
        this.ambientMotesMat.uniforms.uOpacity.value =
          world.overdrive?.active ? 0.56 : 0.38;
      }
    }

    // v2.9.0: Animate Holographic Floor Scan Pulse, Volumetric Light Shafts & Diegetic Weakpoint Halo
    const v29Chapter = world.run?.chapter ?? 'prologue';
    const v29AccentHex =
      (world.momentum?.weakpointTimer ?? 0) > 0
        ? 0xfbbf24
        : world.boss && world.boss.hp > 0 && world.boss.phase === 2
          ? 0xf97316
          : v29Chapter === 'chapter_2_choir'
            ? 0x34d399
            : v29Chapter === 'chapter_3_curator'
              ? 0xa78bfa
              : v29Chapter === 'chapter_4_matron'
                ? 0xfb7185
                : v29Chapter === 'chapter_5_loom'
                  ? 0xfbbf24
                  : 0x22d3ee;

    if (this.arenaPulseMesh && this.arenaPulseMat) {
      const pulseOn = this.screenEffectsEnabled !== false && this.particleQuality !== 'low';
      this.arenaPulseMesh.visible = pulseOn;
      if (pulseOn) {
        const resBoost = (world.weaponResonance?.timer ?? 0) > 0;
        const phase2Boost = Boolean(world.boss && world.boss.hp > 0 && world.boss.phase === 2);
        this.arenaPulseMat.uniforms.uColor.value.setHex(v29AccentHex);
        this.arenaPulseMat.uniforms.uTime.value = this.reducedMotion ? 0.35 : world.elapsedTime;
        this.arenaPulseMat.uniforms.uSpeed.value =
          (world.momentum?.weakpointTimer ?? 0) > 0 || world.overdrive?.active || resBoost
            ? 0.48
            : phase2Boost
              ? 0.36
              : 0.24;
        this.arenaPulseMat.uniforms.uIntensity.value =
          (world.momentum?.weakpointTimer ?? 0) > 0 || resBoost
            ? 0.28
            : phase2Boost
              ? 0.22
              : 0.15;
      }
    }

    if (this.lightShaftsGroup && this.lightShaftMat) {
      const shaftsOn = this.screenEffectsEnabled !== false && this.particleQuality !== 'low';
      this.lightShaftsGroup.visible = shaftsOn;
      if (shaftsOn) {
        this.lightShaftMat.uniforms.uColor.value.setHex(v29AccentHex);
        this.lightShaftMat.uniforms.uTime.value = this.reducedMotion ? 0 : world.elapsedTime;
        this.lightShaftMat.uniforms.uOpacity.value =
          world.overdrive?.active ? 0.08 : 0.052;
      }
    }

    if (this.weakpointHaloMesh && this.weakpointHaloMat) {
      let wpTargetX: number | null = null;
      let wpTargetZ: number | null = null;
      let wpScale = 1.0;
      if (
        world.boss &&
        world.boss.hp > 0 &&
        (world.boss.coreExposed || world.boss.aiState === 'staggered')
      ) {
        wpTargetX = world.boss.x;
        wpTargetZ = world.boss.z;
        wpScale = 1.55;
      } else {
        for (let wi = 0; wi < world.enemies.length; wi++) {
          const we = world.enemies[wi];
          if (we.hp > 0 && we.aiState === 'staggered') {
            wpTargetX = we.x;
            wpTargetZ = we.z;
            wpScale = 1.0;
            break;
          }
        }
      }
      if (wpTargetX !== null && wpTargetZ !== null && this.screenEffectsEnabled !== false) {
        this.weakpointHaloMesh.visible = true;
        this.weakpointHaloMesh.position.set(wpTargetX, 0.12, wpTargetZ);
        this.weakpointHaloMesh.scale.setScalar(wpScale);
        this.weakpointHaloMat.uniforms.uTime.value = this.reducedMotion ? 0 : world.elapsedTime;
      } else {
        this.weakpointHaloMesh.visible = false;
      }
    }

    if (this.nexusAuraMesh && this.nexusAuraMat) {
      const linkCount = world.nexus?.linkCount ?? 0;
      if (linkCount >= 2 && this.screenEffectsEnabled !== false) {
        this.nexusAuraMesh.visible = true;
        this.nexusAuraMesh.position.set(world.player.x, 0.08, world.player.z);
        const auraScale = linkCount >= 4 ? 1.24 : linkCount === 3 ? 1.12 : 1.0;
        this.nexusAuraMesh.scale.setScalar(auraScale);
        this.nexusAuraMat.uniforms.uTime.value = this.reducedMotion ? 0 : world.elapsedTime;
        this.nexusAuraMat.uniforms.uLinks.value = linkCount;
        this.nexusAuraMat.uniforms.uColor.value.setHex(
          linkCount >= 4 ? 0xfbbf24 : linkCount === 3 ? 0xa78bfa : 0x22d3ee
        );
      } else {
        this.nexusAuraMesh.visible = false;
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

    const seraBreath = computeOrganicBreath(world.elapsedTime, 0, 2.35, this.reducedMotion);
    const idleBreath = seraBreath.chest;
    const idleSway = seraBreath.sway;
    const idleHeadScan = seraBreath.headScan;
    const idleWeaponFloat = seraBreath.weaponFloat;

    // Target leg, shin & ankle pivots (preventing foot sliding during contact & push-off)
    let targetLeftLegX = swing;
    let targetRightLegX = -swing;
    let targetLeftLegZ = isMoving ? -0.035 * speedRatio : -0.032 + idleSway * 0.008;
    let targetRightLegZ = isMoving ? 0.035 * speedRatio : 0.032 + idleSway * 0.008;
    let targetLeftShinX = isMoving
      ? Math.max(0.05, -Math.sin(phase + 0.55)) * (0.38 + 0.46 * speedRatio)
      : 0.095 + idleBreath * 0.022;
    let targetRightShinX = isMoving
      ? Math.max(0.05, Math.sin(phase + 0.55)) * (0.38 + 0.46 * speedRatio)
      : 0.095 - idleBreath * 0.018;
    let targetLeftFootX = isMoving
      ? -targetLeftLegX * 0.45 - targetLeftShinX * 0.35 + cosPhase * 0.16 * speedRatio
      : -0.045 - idleBreath * 0.01;
    let targetRightFootX = isMoving
      ? -targetRightLegX * 0.45 - targetRightShinX * 0.35 - cosPhase * 0.16 * speedRatio
      : -0.045 + idleBreath * 0.01;

    // Pelvis weight transfer & hip counter-rotation
    let targetPelvisX = isMoving ? 0.045 * speedRatio : -idleBreath * 0.018;
    let targetPelvisY = isMoving ? swing * 0.26 : -idleSway * 0.045;
    let targetPelvisZ = isMoving ? -cosPhase * 0.06 * speedRatio : idleSway * 0.024;

    // Body group bounce, pitch & turn banking
    let targetBodyY = isMoving
      ? Math.abs(Math.sin(phase)) * 0.088 * speedRatio
      : idleBreath * 0.022;
    let targetBodyRotX = isMoving
      ? 0.075 * speedRatio + this.smoothedFwdAccel * 0.45
      : this.smoothedFwdAccel * 0.35 + idleBreath * 0.012;
    const turnBank = isMoving
      ? THREE.MathUtils.clamp(-this.smoothedPlayerTurnRate * 0.038 * speedRatio, -0.17, 0.17)
      : idleSway * 0.018;
    let targetBodyRotZ = turnBank - this.smoothedSideAccel * 0.35;

    // Torso baseline before combat state overrides
    let targetTorsoY = 1.02 + (isMoving ? 0 : idleBreath * 0.015);
    let targetTorsoRotX = isMoving ? 0.15 * speedRatio : idleBreath * 0.036;
    let targetTorsoRotY = isMoving ? -swing * 0.4 : idleSway * 0.068;
    let targetTorsoRotZ = isMoving ? swing * 0.09 : -idleSway * 0.026;

    // Default arm, forearm & weapon wrist pose (combat-ready organic poise)
    let targetRightArmX = -0.24 + swing * 0.48 + (isMoving ? 0 : idleBreath * 0.045);
    let targetRightArmY = 0.16 + (isMoving ? 0 : idleSway * 0.06);
    let targetRightArmZ = 0.07 + (isMoving ? 0 : idleBreath * 0.024);
    let targetRightForearmX = -0.34 + (isMoving ? Math.abs(swing) * 0.16 : idleWeaponFloat * 0.055);

    let targetLeftArmX = -0.14 - swing * 0.5 + (isMoving ? 0 : -idleBreath * 0.035);
    let targetLeftArmY = -0.08 + (isMoving ? 0 : -idleSway * 0.045);
    let targetLeftArmZ = -0.07 - (isMoving ? 0 : idleBreath * 0.02);
    let targetLeftForearmX = -0.28 - (isMoving ? Math.abs(swing) * 0.14 : -idleWeaponFloat * 0.04);

    let targetWeaponRotX = isMoving ? 0.07 * speedRatio : idleWeaponFloat * 0.055;
    let targetWeaponRotY = isMoving ? 0 : idleSway * 0.04;
    let targetWeaponRotZ = isMoving ? 0 : idleBreath * 0.025;

    // Reset transient VFX meshes
    this.playerRig.slashArcMaterial.opacity = 0;
    this.playerRig.parryShieldMaterial.opacity = 0;
    this.playerRig.parryShieldMesh.visible = false;
    this.playerRig.chargeRingMaterial.opacity = 0;
    this.playerRig.slashArcMesh.rotation.z = 0;
    this.playerRig.slashArcPivot.rotation.set(0, 0, 0);

    const isPulsecaster =
      p.equippedWeaponId === 'pulsecaster' || p.equippedWeaponId === 'phase_rail';
    const isPhaseRail = p.equippedWeaponId === 'phase_rail';
    const isGravBreaker = p.equippedWeaponId === 'grav_breaker';
    const isChronoScythe = p.equippedWeaponId === 'chrono_scythe';

    // Visually distinguish active weapon on Sera's rig across all 5 Arsenal weapons (+ Sheet 11 Phase-Blade MK.II)
    const usePhaseBladeMk2 =
      p.equippedWeaponId === 'chrono_edge' &&
      Boolean(
        world.overdrive?.active ||
          world.gauntlet?.active ||
          (world.progression?.overclockedUpgrades ?? []).some((u) => u.startsWith('edge_'))
      );
    this.playerRig.bladeMesh.visible =
      (p.equippedWeaponId === 'chrono_edge' && !usePhaseBladeMk2) ||
      p.equippedWeaponId === 'pulsecaster';
    if (this.playerRig.phaseBladeMk2Group) {
      this.playerRig.phaseBladeMk2Group.visible = usePhaseBladeMk2;
    }
    if (this.playerRig.phaseRailGroup) {
      this.playerRig.phaseRailGroup.visible = isPhaseRail;
    }
    if (this.playerRig.gravBreakerGroup) {
      this.playerRig.gravBreakerGroup.visible = isGravBreaker;
    }
    if (this.playerRig.chronoScytheGroup) {
      this.playerRig.chronoScytheGroup.visible = isChronoScythe;
    }
    const ovState = world.kineticOvercharge;
    const activeEquippedMod = world.progression?.equippedUpgrades?.[p.equippedWeaponId];
    const isEquippedModMythic = Boolean(
      activeEquippedMod &&
        (world.progression?.awakenedUpgrades ?? []).includes(activeEquippedMod)
    );
    const isWeaponOvercharged = Boolean(
      (ovState && ovState.activeWeaponId === p.equippedWeaponId && ovState.activeTimer > 0) ||
        isEquippedModMythic
    );
    const overchargeSpinMult = isWeaponOvercharged ? 2.25 : 1.0;

    if (isChronoScythe && this.playerRig.chronoScytheHaloRing) {
      this.playerRig.chronoScytheHaloRing.rotation.z += dt * 3.1 * overchargeSpinMult;
      this.playerRig.chronoScytheHaloRing.rotation.y += dt * 1.4 * overchargeSpinMult;
    }

    // Periodic orbital plasma sparks when Weapon Kinetic Overcharge is active
    if (isWeaponOvercharged && world.appState === 'playing' && !this.reducedMotion) {
      this.overchargeSparkCooldown = Math.max(0, (this.overchargeSparkCooldown ?? 0) - dt);
      if (this.overchargeSparkCooldown <= 0) {
        const sparkCol =
          isChronoScythe
            ? 0xe879f9
            : isGravBreaker
              ? 0xf59e0b
              : isPhaseRail
                ? 0xe0f2fe
                : isPulsecaster
                  ? 0x38bdf8
                  : 0x22d3ee;
        this.spawnBurst(p.x, 1.18, p.z, 2, sparkCol, 2.9);
        this.overchargeSparkCooldown = 0.085;
      }
    }

    // Sheet 14 Panels 2–4: Live 3D Weapon Mod Socket Chip mounted on Sera's dorsal Chrono Rig
    const equippedChip = world.progression?.equippedModChipId ?? null;
    if (this.playerRig.modChipSocketGroup) {
      this.playerRig.modChipSocketGroup.visible = Boolean(equippedChip);
      if (this.playerRig.modChipVoltGroup) {
        this.playerRig.modChipVoltGroup.visible = equippedChip === 'mod_volt_arc';
      }
      if (this.playerRig.modChipSiphonGroup) {
        this.playerRig.modChipSiphonGroup.visible = equippedChip === 'mod_siphon_leech';
      }
      if (this.playerRig.modChipNovaGroup) {
        this.playerRig.modChipNovaGroup.visible = equippedChip === 'mod_chrono_nova';
      }
    }

    // Sheet 14 Panel 5: Floating Winged Style SSS Ascension Crest behind Sera when Rank is S or SSS
    if (this.playerRig.styleCrestGroup) {
      const styleTier = world.ascension?.style?.tier ?? 'D';
      const showCrest = styleTier === 'S' || styleTier === 'SSS';
      this.playerRig.styleCrestGroup.visible = showCrest;
      if (showCrest) {
        const isPeak = styleTier === 'SSS';
        const crestScale = isPeak ? 1.18 : 0.88;
        this.playerRig.styleCrestGroup.scale.setScalar(crestScale);
        this.playerRig.styleCrestGroup.position.y =
          0.9 + Math.sin(world.elapsedTime * 3.6) * 0.05;
        if (this.playerRig.styleCrestHaloRing) {
          this.playerRig.styleCrestHaloRing.rotation.z += dt * (isPeak ? 3.2 : 1.8) * overchargeSpinMult;
        }
        if (this.playerRig.styleCrestWingMat) {
          this.playerRig.styleCrestWingMat.emissiveIntensity = isPeak ? 1.35 : 0.85;
        }
      }
    }

    const adrTier = Math.min(5, Math.max(0, Math.floor(p.adrenalineScore ?? 0)));
    const adrGlowBoost = adrTier * 0.14 + (isWeaponOvercharged ? 0.85 : 0);

    if (this.playerRig.chronoAccentMaterial) {
      this.playerRig.chronoAccentMaterial.emissive.setHex(
        isWeaponOvercharged
          ? isChronoScythe
            ? 0xe879f9
            : 0xfde047
          : adrTier >= 5
            ? 0xfbbf24
            : adrTier >= 3
              ? 0x38bdf8
              : 0x22d3ee
      );
      this.playerRig.chronoAccentMaterial.emissiveIntensity =
        1.2 + adrTier * 0.24 + (isWeaponOvercharged ? 1.1 : 0);
    }
    if (isPhaseRail && this.playerRig.phaseRailCoils) {
      const coilSpin = (p.actionState === 'charging_heavy' ? 8.5 : 2.1 + adrTier * 0.4) * overchargeSpinMult;
      for (let c = 0; c < this.playerRig.phaseRailCoils.length; c++) {
        this.playerRig.phaseRailCoils[c].rotation.z += dt * coilSpin * (c % 2 === 0 ? 1 : -1);
      }
    }
    if (isGravBreaker && this.playerRig.gravBreakerOrbs) {
      const chargeScale =
        p.actionState === 'charging_heavy'
          ? 1.28
          : (isWeaponOvercharged ? 1.16 : 1) + Math.sin(world.elapsedTime * 6) * 0.08;
      for (let g = 0; g < this.playerRig.gravBreakerOrbs.length; g++) {
        const orb = this.playerRig.gravBreakerOrbs[g];
        orb.rotation.y += dt * (g === 0 ? 2.6 : -3.4) * overchargeSpinMult;
        orb.rotation.x += dt * (g === 1 ? 1.8 : 0.9) * overchargeSpinMult;
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

    let playerSquash = 0;
    let playerStretch = 0;

    if (isPhaseRail) {
      // Two-handed precision Rail Lance carry stance (right hand grip, left hand forward barrel support)
      targetRightArmX = -0.78 + swing * 0.14 + (isMoving ? 0 : idleBreath * 0.028);
      targetRightArmY = -0.14;
      targetRightArmZ = 0.08;
      targetRightForearmX = -0.34;
      targetLeftArmX = -0.94 - swing * 0.12 + (isMoving ? 0 : idleBreath * 0.025);
      targetLeftArmY = 0.42;
      targetLeftArmZ = -0.22;
      targetLeftForearmX = -0.48;
      targetWeaponRotX = 0.12 + (isMoving ? 0 : idleWeaponFloat * 0.02);
    } else if (isGravBreaker) {
      // Heavy two-handed Gravity Maul low-ready poise
      targetRightArmX = -0.36 + swing * 0.34 + (isMoving ? 0 : idleBreath * 0.04);
      targetRightArmY = 0.24;
      targetRightArmZ = 0.12;
      targetRightForearmX = -0.42;
      targetLeftArmX = -0.46 - swing * 0.32 + (isMoving ? 0 : idleBreath * 0.035);
      targetLeftArmY = 0.42;
      targetLeftArmZ = -0.24;
      targetLeftForearmX = -0.38;
      targetWeaponRotX = -0.16 + (isMoving ? 0 : idleWeaponFloat * 0.04);
    } else if (isChronoScythe) {
      // v2.7.0: Two-handed diagonal Chrono Scythe polearm ready stance (swept across body, scythe crescent high behind right shoulder)
      targetTorsoRotY = isMoving ? targetTorsoRotY - 0.14 : -0.22;
      targetRightArmX = -0.58 + swing * 0.28 + (isMoving ? 0 : idleBreath * 0.036);
      targetRightArmY = -0.28;
      targetRightArmZ = 0.34;
      targetRightForearmX = -0.52;
      targetLeftArmX = -0.78 - swing * 0.24 + (isMoving ? 0 : idleBreath * 0.03);
      targetLeftArmY = 0.56;
      targetLeftArmZ = -0.32;
      targetLeftForearmX = -0.46;
      targetWeaponRotX = -0.28 + (isMoving ? 0 : idleWeaponFloat * 0.035);
      targetWeaponRotZ = 0.32;
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
        if (isPhaseRail) {
          // Precision crouched two-handed Rail Lance overcharge brace
          targetBodyY = -0.07 * ratio;
          targetBodyRotX = 0.08 * ratio;
          targetPelvisY = -0.24 - ratio * 0.12;
          targetTorsoRotX = 0.06 * ratio;
          targetTorsoRotY = -0.32 - ratio * 0.14;
          targetTorsoRotZ = 0.05;
          targetRightArmX = -1.32 - ratio * 0.12;
          targetRightArmY = -0.18;
          targetRightArmZ = 0.06;
          targetRightForearmX = -0.16;
          targetLeftArmX = -1.24 - ratio * 0.1;
          targetLeftArmY = 0.48;
          targetLeftArmZ = -0.24;
          targetLeftForearmX = -0.36;
          targetWeaponRotX = 0.24;
          playerSquash = 0.28 * ratio;
        } else if (isPulsecaster) {
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
        } else if (isGravBreaker) {
          // Colossal two-handed overhead Gravity Maul hoist
          targetBodyY = -0.06 * ratio;
          targetBodyRotX = -0.14 * ratio;
          targetPelvisY = -0.22 * ratio;
          targetTorsoRotX = -0.34 * ratio;
          targetTorsoRotY = -0.28 * ratio;
          targetTorsoRotZ = 0.08 * ratio;
          targetRightArmX = -1.82 - ratio * 0.42;
          targetRightArmY = -0.22;
          targetRightArmZ = 0.28;
          targetRightForearmX = -0.58 - ratio * 0.2;
          targetLeftArmX = -1.72 - ratio * 0.36;
          targetLeftArmY = 0.34;
          targetLeftArmZ = -0.32;
          targetLeftForearmX = -0.54;
          targetWeaponRotX = -0.45 * ratio;
          playerStretch = 0.36 * ratio;
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
        if (isPhaseRail) {
          targetBodyRotX = 0.05;
          targetTorsoRotY = -0.3;
          targetRightArmX = -1.28;
          targetRightArmY = -0.16;
          targetRightForearmX = -0.18;
          targetLeftArmX = -1.18;
          targetLeftArmY = 0.44;
          targetLeftForearmX = -0.36;
          targetWeaponRotX = 0.22;
          break;
        }
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
          playerSquash = 0.32;
        }
        break;
      }
      case 'light_active': {
        if (isPhaseRail) {
          // Sharp sniper discharge shoulder recoil
          targetBodyRotX = -0.12;
          targetTorsoRotX = -0.14;
          targetTorsoRotY = -0.36;
          targetRightArmX = -1.48;
          targetRightArmY = -0.2;
          targetRightForearmX = -0.08;
          targetLeftArmX = -1.36;
          targetLeftArmY = 0.46;
          targetLeftForearmX = -0.24;
          targetWeaponRotX = 0.08;
          playerSquash = 0.3;
          break;
        }
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
        playerStretch = p.comboIndex >= 2 ? 0.34 : 0.16;
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
        if (isPhaseRail) {
          targetTorsoRotY = -0.24;
          targetRightArmX = -1.08;
          targetRightArmY = -0.14;
          targetRightForearmX = -0.24;
          targetLeftArmX = -1.04;
          targetLeftArmY = 0.42;
          targetLeftForearmX = -0.38;
          break;
        }
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
        if (isPhaseRail) {
          targetBodyY = -0.08;
          targetTorsoRotY = -0.4;
          targetRightArmX = -1.4;
          targetRightArmY = -0.2;
          targetRightForearmX = -0.14;
          targetLeftArmX = -1.32;
          targetLeftArmY = 0.5;
          targetLeftForearmX = -0.3;
          targetWeaponRotX = 0.24;
          playerSquash = 0.35;
          break;
        }
        if (isPulsecaster) {
          targetBodyY = -0.05;
          targetTorsoRotY = 0.44;
          targetLeftArmX = -1.38;
          targetLeftArmY = -0.22;
          targetLeftForearmX = -0.14;
          break;
        }
        if (isGravBreaker) {
          // Colossal overhead maul windup lift
          targetBodyY = 0.04;
          targetBodyRotX = -0.22;
          targetPelvisY = -0.24;
          targetLeftLegX = -0.24;
          targetRightLegX = 0.28;
          targetLeftShinX = 0.38;
          targetRightShinX = 0.42;
          targetTorsoRotX = -0.42;
          targetTorsoRotY = -0.3;
          targetTorsoRotZ = 0.1;
          targetRightArmX = -2.18;
          targetRightArmY = -0.18;
          targetRightArmZ = 0.24;
          targetRightForearmX = -0.68;
          targetLeftArmX = -2.08;
          targetLeftArmY = 0.3;
          targetLeftArmZ = -0.28;
          targetLeftForearmX = -0.64;
          targetWeaponRotX = -0.5;
          playerStretch = 0.58;
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
        playerSquash = 0.28;
        break;
      }
      case 'heavy_active': {
        if (isPhaseRail) {
          // Heavy Rail Lance beam kickback
          targetBodyY = -0.06;
          targetBodyRotX = -0.24;
          targetTorsoRotX = -0.26;
          targetTorsoRotY = -0.44;
          targetRightArmX = -1.68;
          targetRightArmY = -0.24;
          targetRightForearmX = -0.06;
          targetLeftArmX = -1.52;
          targetLeftArmY = 0.48;
          targetLeftForearmX = -0.18;
          targetWeaponRotX = -0.08;
          playerSquash = 0.62;
          break;
        }
        if (isPulsecaster) {
          targetBodyRotX = -0.12;
          targetTorsoRotY = 0.42;
          targetLeftArmX = -1.58;
          targetLeftArmY = -0.18;
          targetLeftForearmX = -0.06;
          playerSquash = 0.35;
          break;
        }
        if (isGravBreaker) {
          // Seismic two-handed overhead ground slam!
          targetBodyY = -0.16;
          targetBodyRotX = 0.38;
          targetPelvisY = 0.26;
          targetLeftLegX = 0.52;
          targetRightLegX = -0.48;
          targetLeftShinX = 0.62;
          targetRightShinX = 0.36;
          targetTorsoRotX = 0.48;
          targetTorsoRotY = 0.28;
          targetTorsoRotZ = -0.08;
          targetRightArmX = 0.56;
          targetRightArmY = 0.24;
          targetRightArmZ = -0.22;
          targetRightForearmX = -0.12;
          targetLeftArmX = 0.48;
          targetLeftArmY = -0.28;
          targetLeftArmZ = 0.22;
          targetLeftForearmX = -0.16;
          targetWeaponRotX = 0.54;
          playerSquash = 0.85;
          this.playerRig.slashArcPivot.rotation.set(0.62, 0, 0);
          this.playerRig.slashArcMaterial.color.setHex(0xfbbf24);
          this.playerRig.slashArcMaterial.opacity = 0.96;
          this.playerRig.slashArcMesh.scale.setScalar(1.62);
          break;
        }
        if (isChronoScythe) {
          // v2.7.0: Chrono Scythe 360-degree Vortex Whirl-Cleave horizontal reaper spin
          const whirlPhase = world.elapsedTime * 22;
          targetBodyY = -0.09;
          targetBodyRotX = 0.24;
          targetPelvisY = 0.72;
          targetTorsoRotX = 0.32;
          targetTorsoRotY = 1.28 + Math.sin(whirlPhase) * 0.35;
          targetTorsoRotZ = -0.26;
          targetRightArmX = -0.18;
          targetRightArmY = 1.56;
          targetRightArmZ = -0.82;
          targetRightForearmX = -0.1;
          targetLeftArmX = -0.26;
          targetLeftArmY = -0.68;
          targetLeftArmZ = -0.44;
          targetLeftForearmX = -0.22;
          targetWeaponRotX = 0.24;
          targetWeaponRotZ = -0.92;
          playerStretch = 0.54;
          this.playerRig.slashArcPivot.rotation.set(0.08, whirlPhase * 0.2, 0);
          this.playerRig.slashArcMaterial.color.setHex(p.isEmpoweredHeavy ? 0xe879f9 : 0xc084fc);
          this.playerRig.slashArcMaterial.opacity = 0.98;
          this.playerRig.slashArcMesh.scale.setScalar(1.76);
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
        playerStretch = 0.42;

        this.playerRig.slashArcPivot.rotation.set(0.42, 0.15, -0.68);
        this.playerRig.slashArcMaterial.color.setHex(
          p.isEmpoweredHeavy ? 0xf59e0b : 0x38bdf8
        );
        this.playerRig.slashArcMaterial.opacity = 0.96;
        this.playerRig.slashArcMesh.scale.setScalar(1.38);
        break;
      }
      case 'heavy_recovery': {
        if (isPhaseRail) {
          targetTorsoRotY = -0.26;
          targetRightArmX = -1.1;
          targetRightArmY = -0.14;
          targetRightForearmX = -0.26;
          targetLeftArmX = -1.04;
          targetLeftArmY = 0.4;
          targetLeftForearmX = -0.4;
          break;
        }
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
        this.playerRig.parryShieldMesh.visible = true;
        break;
      }
      case 'dodging': {
        if (this.dashGhostSpawnCooldown <= 0 && world.appState === 'playing') {
          this.spawnDashGhost(p.x, p.z, p.rotationY, 0x22d3ee);
          this.dashGhostSpawnCooldown = 0.042;
        }
        const dodgeTilt = computeDirectionalDodgeTilt(
          p.vx,
          p.vz,
          p.rotationY,
          this.reducedMotion
        );
        targetBodyY = -0.14;
        targetBodyRotX = dodgeTilt.bodyRotX;
        targetBodyRotZ = dodgeTilt.bodyRotZ;
        targetPelvisX = 0.16;
        targetLeftLegX = -0.45;
        targetRightLegX = 0.32;
        targetLeftShinX = 0.68;
        targetRightShinX = 0.54;
        targetTorsoRotX = dodgeTilt.bodyRotX * 0.55;
        targetTorsoRotY = dodgeTilt.torsoRotY;
        targetTorsoRotZ = dodgeTilt.bodyRotZ * 0.35;
        targetRightArmX = 0.42;
        targetRightArmY = -0.26;
        targetRightArmZ = 0.22;
        targetRightForearmX = -0.48;
        targetLeftArmX = 0.38;
        targetLeftArmY = 0.26;
        targetLeftArmZ = -0.22;
        targetLeftForearmX = -0.44;
        playerStretch = 0.55;
        break;
      }
      case 'dead': {
        targetBodyRotX = -Math.PI * 0.44;
        targetBodyRotZ = 0.14;
        targetBodyY = 0.22;
        targetLeftLegX = 0.28;
        targetRightLegX = -0.12;
        targetLeftShinX = 0.55;
        targetRightShinX = 0.42;
        targetTorsoRotX = -0.12;
        targetTorsoRotY = 0.18;
        targetTorsoRotZ = 0.08;
        targetRightArmX = 0.54;
        targetRightArmZ = 0.48;
        targetLeftArmX = 0.42;
        targetLeftArmZ = -0.42;
        break;
      }
      default:
        break;
    }

    // Apply upper-body recoil jolt & squash compression when damaged (hurtFlashTimer > 0)
    if (p.hurtFlashTimer > 0 && p.actionState !== 'dead') {
      const hurtRatio = Math.min(1, p.hurtFlashTimer / 0.22);
      targetTorsoRotX -= 0.32 * hurtRatio;
      targetTorsoRotZ += 0.18 * hurtRatio;
      playerSquash = Math.max(playerSquash, 0.52 * hurtRatio);
    }

    // Smoothly damp all Sera joints + volume-preserving squash & stretch toward target pose
    this.playerRig.bodyGroup.position.y +=
      (targetBodyY - this.playerRig.bodyGroup.position.y) * poseAlpha;
    this.playerRig.bodyGroup.rotation.x +=
      (targetBodyRotX - this.playerRig.bodyGroup.rotation.x) * poseAlpha;
    this.playerRig.bodyGroup.rotation.z +=
      (targetBodyRotZ - this.playerRig.bodyGroup.rotation.z) * poseAlpha;
    const pScale = computeSquashStretch(playerSquash, playerStretch, this.reducedMotion);
    this.playerRig.bodyGroup.scale.x = dampScalar(
      this.playerRig.bodyGroup.scale.x,
      pScale.scaleXZ,
      poseAlpha
    );
    this.playerRig.bodyGroup.scale.y = dampScalar(
      this.playerRig.bodyGroup.scale.y,
      pScale.scaleY,
      poseAlpha
    );
    this.playerRig.bodyGroup.scale.z = dampScalar(
      this.playerRig.bodyGroup.scale.z,
      pScale.scaleXZ,
      poseAlpha
    );

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

    const targetLeftPauldronZ = 0.22 + Math.max(0, -targetLeftArmX * 0.18) + idleBreath * 0.032;
    const targetRightPauldronZ = -0.22 - Math.max(0, -targetRightArmX * 0.18) - idleBreath * 0.032;
    this.playerRig.leftPauldronPivot.rotation.z = dampScalar(
      this.playerRig.leftPauldronPivot.rotation.z,
      targetLeftPauldronZ,
      rigLagAlpha
    );
    this.playerRig.rightPauldronPivot.rotation.z = dampScalar(
      this.playerRig.rightPauldronPivot.rotation.z,
      targetRightPauldronZ,
      rigLagAlpha
    );

    // Head stabilization, subtle idle readiness scan & target look counter-rotation
    dampEuler(
      this.playerRig.headGroup.rotation,
      isMoving ? -0.06 * speedRatio : idleBreath * 0.034 - Math.abs(idleHeadScan) * 0.015,
      -this.playerRig.torsoPivot.rotation.y * 0.48 + (isMoving ? 0 : idleHeadScan * 0.11),
      -this.playerRig.bodyGroup.rotation.z * 0.35 + (isMoving ? 0 : idleHeadScan * 0.028),
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

      const activeDocId = normalizeEchoDoctrineId(world.progression?.echoDoctrine);
      if (this.lastEchoDoctrineTint !== activeDocId) {
        this.lastEchoDoctrineTint = activeDocId;
        const docSpec = getEchoDoctrineSpec(activeDocId);
        const ringMatA = this.echoRig.chronoRingMesh.material as THREE.MeshBasicMaterial | undefined;
        if (ringMatA) ringMatA.color.setHex(docSpec.ringHex);
        const ringMatB = this.echoRig.chronoInnerRingMesh.material as THREE.MeshBasicMaterial | undefined;
        if (ringMatB) ringMatB.color.setHex(docSpec.accentHex);
        const phaseMatA = this.echoRig.echoPhaseRingMesh?.material as THREE.MeshBasicMaterial | undefined;
        if (phaseMatA) phaseMatA.color.setHex(docSpec.ringHex);
        const phaseMatB = this.echoRig.echoSecondPhaseRingMesh?.material as THREE.MeshBasicMaterial | undefined;
        if (phaseMatB) phaseMatB.color.setHex(docSpec.accentHex);
        const baseRipMat = this.echoRig.echoBaseRippleMesh?.material as THREE.MeshBasicMaterial | undefined;
        if (baseRipMat) baseRipMat.color.setHex(docSpec.ringHex);
      }

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
      const echoBreath = computeOrganicBreath(world.elapsedTime, 1.7, 2.8, this.reducedMotion);
      const echoPoseAlpha = computeDampAlpha(22, animDt, this.reducedMotion);

      const echoLeftLegX = echoSwing;
      const echoRightLegX = -echoSwing;
      const echoLeftShinX = echoMoving
        ? Math.max(0.05, -Math.sin(echoPhase + 0.55)) * 0.72
        : 0.09 + echoBreath.chest * 0.018;
      const echoRightShinX = echoMoving
        ? Math.max(0.05, Math.sin(echoPhase + 0.55)) * 0.72
        : 0.09 - echoBreath.chest * 0.018;
      const echoLeftFootX = echoMoving
        ? -echoSwing * 0.42 + echoCosPhase * 0.14
        : -0.04;
      const echoRightFootX = echoMoving
        ? echoSwing * 0.42 - echoCosPhase * 0.14
        : -0.04;

      const echoPelvisX = echoMoving ? 0.04 : -echoBreath.chest * 0.014;
      const echoPelvisY = echoMoving ? echoSwing * 0.22 : -echoBreath.sway * 0.035;
      const echoPelvisZ = echoMoving ? -echoCosPhase * 0.05 : echoBreath.sway * 0.018;

      let echoBodyY = echoMoving
        ? Math.abs(Math.sin(echoPhase)) * 0.082
        : echoBreath.chest * 0.028;
      let echoBodyRotX = echoMoving ? 0.07 : echoBreath.chest * 0.012;
      const echoBodyRotZ = echoMoving
        ? THREE.MathUtils.clamp(-this.smoothedEchoTurnRate * 0.034, -0.16, 0.16)
        : echoBreath.sway * 0.015;

      let echoTorsoX = echoMoving ? 0.14 : echoBreath.chest * 0.03;
      let echoTorsoY = echoMoving ? -echoSwing * 0.36 : echoBreath.sway * 0.055;
      let echoTorsoZ = echoMoving ? echoSwing * 0.08 : -echoBreath.sway * 0.02;

      this.echoRig.slashArcMaterial.opacity = 0;
      this.echoRig.parryShieldMaterial.opacity = 0;
      this.echoRig.parryShieldMesh.visible = false;
      this.echoRig.chargeRingMaterial.opacity = 0;
      this.echoRig.slashArcMesh.rotation.z = 0;
      this.echoRig.slashArcPivot.rotation.set(0, 0, 0);

      const echoPulsecaster =
        actor.weaponId === 'pulsecaster' || actor.weaponId === 'phase_rail';
      const echoPhaseRail = actor.weaponId === 'phase_rail';
      const echoGravBreaker = actor.weaponId === 'grav_breaker';
      const echoChronoScythe = actor.weaponId === 'chrono_scythe';
      this.echoRig.bladeMesh.visible =
        actor.weaponId === 'chrono_edge' || actor.weaponId === 'pulsecaster';
      if (this.echoRig.phaseRailGroup) {
        this.echoRig.phaseRailGroup.visible = echoPhaseRail;
      }
      if (this.echoRig.gravBreakerGroup) {
        this.echoRig.gravBreakerGroup.visible = echoGravBreaker;
      }
      if (this.echoRig.chronoScytheGroup) {
        this.echoRig.chronoScytheGroup.visible = echoChronoScythe;
      }
      if (echoPulsecaster) {
        this.echoRig.bladeMesh.scale.set(0.72, 0.72, 0.28);
      } else {
        this.echoRig.bladeMesh.scale.set(1, 1, 1);
      }

      if (echoPhaseRail && this.echoRig.phaseRailCoils) {
        const coilSpin = actor.actionState === 'charging_heavy' ? 8.2 : 2.2;
        for (let c = 0; c < this.echoRig.phaseRailCoils.length; c++) {
          this.echoRig.phaseRailCoils[c].rotation.z += dt * coilSpin * (c % 2 === 0 ? 1 : -1);
        }
      }
      if (echoGravBreaker && this.echoRig.gravBreakerOrbs) {
        for (let g = 0; g < this.echoRig.gravBreakerOrbs.length; g++) {
          this.echoRig.gravBreakerOrbs[g].rotation.y += dt * (g === 0 ? 2.6 : -3.4);
          this.echoRig.gravBreakerOrbs[g].rotation.x += dt * (g === 1 ? 1.8 : 0.9);
        }
      }

      let echoRightArmX = echoPhaseRail
        ? -0.78 + echoSwing * 0.14
        : echoGravBreaker
          ? -0.36 + echoSwing * 0.34
          : echoPulsecaster
            ? 0.18 + echoSwing * 0.24
            : -0.2 + echoSwing * 0.44;
      let echoRightArmY = echoPhaseRail ? -0.14 : echoGravBreaker ? 0.24 : echoPulsecaster ? -0.12 : 0.14;
      let echoRightArmZ = echoPhaseRail ? 0.08 : echoGravBreaker ? 0.12 : echoPulsecaster ? 0.14 : 0.05;
      let echoRightForearmX = echoPhaseRail ? -0.34 : echoGravBreaker ? -0.42 : echoPulsecaster ? -0.48 : -0.3;

      let echoLeftArmX = echoPhaseRail
        ? -0.94 - echoSwing * 0.12
        : echoGravBreaker
          ? -0.46 - echoSwing * 0.32
          : echoPulsecaster
            ? -0.58 - echoSwing * 0.18
            : -0.1 - echoSwing * 0.46;
      let echoLeftArmY = echoPhaseRail || echoGravBreaker ? 0.42 : echoPulsecaster ? 0.16 : -0.06;
      let echoLeftArmZ = echoPhaseRail || echoGravBreaker ? -0.22 : echoPulsecaster ? -0.14 : -0.05;
      let echoLeftForearmX = echoPhaseRail ? -0.48 : echoGravBreaker ? -0.38 : echoPulsecaster ? -0.44 : -0.24;

      switch (actor.actionState) {
        case 'charging_heavy': {
          const ratio = Math.min(1, actor.chargeRatio);
          if (echoPulsecaster) {
            echoTorsoX = 0.08 * ratio;
            echoTorsoY = 0.36 + ratio * 0.14;
            echoTorsoZ = -0.06;
            echoLeftArmX = -1.28 - ratio * 0.14;
            echoLeftArmY = -0.18;
            echoLeftArmZ = -0.08;
            echoLeftForearmX = -0.18;
            echoRightArmX = 0.28;
            echoRightArmY = -0.24;
            echoRightArmZ = 0.22;
          } else {
            echoTorsoX = -0.2 - ratio * 0.16;
            echoTorsoY = -0.48 - ratio * 0.28;
            echoTorsoZ = 0.1;
            echoRightArmX = -1.12 - ratio * 0.48;
            echoRightArmY = -0.66;
            echoRightArmZ = 0.46;
            echoRightForearmX = -0.62 - ratio * 0.24;
            echoLeftArmX = -0.54;
            echoLeftArmY = 0.42;
            echoLeftArmZ = -0.3;
          }
          this.echoRig.chargeRingMaterial.opacity = 0.45 + ratio * 0.5;
          this.echoRig.chargeRingMaterial.color.setHex(0x38bdf8);
          this.echoRig.chargeRingMesh.scale.setScalar(0.72 + ratio * 0.56);
          break;
        }
        case 'light_windup': {
          if (echoPulsecaster) {
            echoTorsoX = 0.06;
            echoTorsoY = 0.34;
            echoTorsoZ = 0;
            echoLeftArmX = -1.32;
            echoLeftArmY = -0.18;
            echoLeftArmZ = -0.08;
            echoLeftForearmX = -0.16;
          } else if (actor.comboIndex === 1) {
            echoTorsoX = -0.04;
            echoTorsoY = 0.52;
            echoTorsoZ = -0.08;
            echoRightArmX = -0.46;
            echoRightArmY = 0.86;
            echoRightArmZ = -0.4;
            echoRightForearmX = -0.6;
          } else {
            echoTorsoX = -0.08;
            echoTorsoY = -0.52;
            echoTorsoZ = 0.08;
            echoRightArmX = -0.62;
            echoRightArmY = -0.84;
            echoRightArmZ = 0.42;
            echoRightForearmX = -0.52;
          }
          break;
        }
        case 'light_active': {
          if (echoPulsecaster) {
            echoTorsoX = -0.06;
            echoTorsoY = 0.38;
            echoTorsoZ = 0;
            echoLeftArmX = -1.48;
            echoLeftArmY = -0.16;
            echoLeftArmZ = -0.06;
            echoLeftForearmX = -0.08;
            break;
          }
          const dir = actor.comboIndex === 1 ? -1 : 1;
          const isFinisher = actor.comboIndex >= 2;
          echoTorsoX = 0.2;
          echoTorsoY = dir * (isFinisher ? 0.82 : 0.56);
          echoTorsoZ = -0.1 * dir;
          echoRightArmX = -0.14;
          echoRightArmY = dir * 1.24;
          echoRightArmZ = -0.46 * dir;
          echoRightForearmX = -0.1;
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
            echoTorsoX = 0;
            echoTorsoY = 0.26;
            echoTorsoZ = 0;
            echoLeftArmX = -1.16;
            echoLeftArmY = -0.12;
            echoLeftArmZ = -0.06;
            echoLeftForearmX = -0.26;
            break;
          }
          const dir = actor.comboIndex === 1 ? -1 : 1;
          echoTorsoX = 0.12;
          echoTorsoY = dir * 0.36;
          echoTorsoZ = 0;
          echoRightArmX = -0.18;
          echoRightArmY = dir * 0.68;
          echoRightArmZ = -0.22 * dir;
          echoRightForearmX = -0.22;
          break;
        }
        case 'heavy_windup': {
          if (echoPhaseRail) {
            echoTorsoX = 0.04;
            echoTorsoY = -0.38;
            echoTorsoZ = 0;
            echoRightArmX = -1.4;
            echoRightArmY = -0.2;
            echoRightForearmX = -0.14;
            echoLeftArmX = -1.32;
            echoLeftArmY = 0.5;
            echoLeftForearmX = -0.3;
            break;
          }
          if (echoPulsecaster) {
            echoTorsoX = -0.05;
            echoTorsoY = 0.44;
            echoTorsoZ = 0;
            echoLeftArmX = -1.38;
            echoLeftArmY = -0.22;
            echoLeftArmZ = -0.08;
            echoLeftForearmX = -0.14;
            break;
          }
          if (echoGravBreaker) {
            echoTorsoX = -0.4;
            echoTorsoY = -0.28;
            echoTorsoZ = 0.1;
            echoRightArmX = -2.14;
            echoRightArmY = -0.18;
            echoRightArmZ = 0.24;
            echoRightForearmX = -0.66;
            echoLeftArmX = -2.04;
            echoLeftArmY = 0.3;
            echoLeftArmZ = -0.28;
            echoLeftForearmX = -0.62;
            break;
          }
          echoTorsoX = -0.3;
          echoTorsoY = -0.68;
          echoTorsoZ = 0.14;
          echoRightArmX = -1.38;
          echoRightArmY = -0.96;
          echoRightArmZ = 0.54;
          echoRightForearmX = -0.66;
          break;
        }
        case 'heavy_active': {
          if (echoPhaseRail) {
            echoTorsoX = -0.24;
            echoTorsoY = -0.42;
            echoTorsoZ = 0;
            echoRightArmX = -1.66;
            echoRightArmY = -0.24;
            echoRightForearmX = -0.06;
            echoLeftArmX = -1.5;
            echoLeftArmY = 0.48;
            echoLeftForearmX = -0.18;
            break;
          }
          if (echoPulsecaster) {
            echoTorsoX = -0.12;
            echoTorsoY = 0.42;
            echoTorsoZ = 0;
            echoLeftArmX = -1.58;
            echoLeftArmY = -0.18;
            echoLeftArmZ = -0.06;
            echoLeftForearmX = -0.06;
            break;
          }
          if (echoGravBreaker) {
            echoBodyY = -0.14;
            echoBodyRotX = 0.36;
            echoTorsoX = 0.46;
            echoTorsoY = 0.26;
            echoTorsoZ = -0.08;
            echoRightArmX = 0.54;
            echoRightArmY = 0.24;
            echoRightArmZ = -0.22;
            echoRightForearmX = -0.12;
            echoLeftArmX = 0.46;
            echoLeftArmY = -0.28;
            echoLeftArmZ = 0.22;
            echoLeftForearmX = -0.16;
            this.echoRig.slashArcPivot.rotation.set(0.62, 0, 0);
            this.echoRig.slashArcMaterial.color.setHex(0xfbbf24);
            this.echoRig.slashArcMaterial.opacity = 0.94;
            this.echoRig.slashArcMesh.scale.setScalar(1.56);
            break;
          }
          echoTorsoX = 0.36;
          echoTorsoY = 0.78;
          echoTorsoZ = -0.18;
          echoRightArmX = 0.34;
          echoRightArmY = 1.44;
          echoRightArmZ = -0.7;
          echoRightForearmX = -0.08;
          this.echoRig.slashArcPivot.rotation.set(0.42, 0.15, -0.68);
          this.echoRig.slashArcMaterial.color.setHex(0xe0f2fe);
          this.echoRig.slashArcMaterial.opacity = 0.92;
          this.echoRig.slashArcMesh.scale.setScalar(1.34);
          break;
        }
        case 'heavy_recovery': {
          if (echoPulsecaster) {
            echoTorsoX = 0;
            echoTorsoY = 0.28;
            echoTorsoZ = 0;
            echoLeftArmX = -1.12;
            echoLeftArmY = -0.12;
            echoLeftArmZ = -0.06;
            echoLeftForearmX = -0.24;
            break;
          }
          echoTorsoX = 0.2;
          echoTorsoY = 0.46;
          echoTorsoZ = -0.1;
          echoRightArmX = 0.08;
          echoRightArmY = 0.88;
          echoRightArmZ = -0.38;
          echoRightForearmX = -0.18;
          break;
        }
        case 'parry_active':
        case 'parry_recovery': {
          echoTorsoX = 0.08;
          echoTorsoY = 0.26;
          echoTorsoZ = 0;
          echoRightArmX = -0.78;
          echoRightArmY = 0.52;
          echoRightArmZ = 0.68;
          echoRightForearmX = -0.68;
          echoLeftArmX = -0.68;
          echoLeftArmY = -0.38;
          echoLeftArmZ = -0.32;
          this.echoRig.parryShieldMaterial.opacity =
            actor.actionState === 'parry_active' ? 0.68 : 0.22;
          this.echoRig.parryShieldMesh.visible = true;
          break;
        }
        case 'dodging': {
          echoBodyY = -0.12;
          echoBodyRotX = 0.44;
          echoTorsoX = 0.24;
          echoTorsoY = 0;
          echoTorsoZ = 0;
          echoRightArmX = 0.36;
          echoRightArmY = -0.2;
          echoRightArmZ = 0.18;
          echoRightForearmX = -0.4;
          break;
        }
        default:
          break;
      }

      // Smoothly damp all Chrono Echo joints so playback glides without snapping
      this.echoRig.bodyGroup.position.y = dampScalar(this.echoRig.bodyGroup.position.y, echoBodyY, echoPoseAlpha);
      dampEuler(this.echoRig.bodyGroup.rotation, echoBodyRotX, 0, echoBodyRotZ, echoPoseAlpha);
      dampEuler(this.echoRig.pelvisPivot.rotation, echoPelvisX, echoPelvisY, echoPelvisZ, echoPoseAlpha);
      this.echoRig.torsoPivot.position.y = 1.02 + (echoMoving ? 0 : echoBreath.chest * 0.012);
      dampEuler(this.echoRig.torsoPivot.rotation, echoTorsoX, echoTorsoY, echoTorsoZ, echoPoseAlpha);
      dampEuler(
        this.echoRig.chronoRigPivot.rotation,
        -this.echoRig.torsoPivot.rotation.x * 0.3,
        -this.echoRig.torsoPivot.rotation.y * 0.25,
        -this.echoRig.bodyGroup.rotation.z * 0.35,
        echoPoseAlpha
      );
      dampEuler(
        this.echoRig.headGroup.rotation,
        echoMoving ? -0.05 : echoBreath.chest * 0.025,
        -this.echoRig.torsoPivot.rotation.y * 0.45 + (echoMoving ? 0 : echoBreath.headScan * 0.08),
        -this.echoRig.bodyGroup.rotation.z * 0.3,
        echoPoseAlpha
      );
      dampEuler(this.echoRig.rightArmPivot.rotation, echoRightArmX, echoRightArmY, echoRightArmZ, echoPoseAlpha);
      this.echoRig.rightForearmPivot.rotation.x = dampScalar(
        this.echoRig.rightForearmPivot.rotation.x,
        echoRightForearmX,
        echoPoseAlpha
      );
      dampEuler(this.echoRig.leftArmPivot.rotation, echoLeftArmX, echoLeftArmY, echoLeftArmZ, echoPoseAlpha);
      this.echoRig.leftForearmPivot.rotation.x = dampScalar(
        this.echoRig.leftForearmPivot.rotation.x,
        echoLeftForearmX,
        echoPoseAlpha
      );
      dampEuler(this.echoRig.weaponPivot.rotation, echoBreath.weaponFloat * 0.04, 0, 0, echoPoseAlpha);
      this.echoRig.leftLegPivot.rotation.x = dampScalar(this.echoRig.leftLegPivot.rotation.x, echoLeftLegX, echoPoseAlpha);
      this.echoRig.rightLegPivot.rotation.x = dampScalar(this.echoRig.rightLegPivot.rotation.x, echoRightLegX, echoPoseAlpha);
      this.echoRig.leftShinPivot.rotation.x = dampScalar(this.echoRig.leftShinPivot.rotation.x, echoLeftShinX, echoPoseAlpha);
      this.echoRig.rightShinPivot.rotation.x = dampScalar(this.echoRig.rightShinPivot.rotation.x, echoRightShinX, echoPoseAlpha);
      this.echoRig.leftFootPivot.rotation.x = dampScalar(this.echoRig.leftFootPivot.rotation.x, echoLeftFootX, echoPoseAlpha);
      this.echoRig.rightFootPivot.rotation.x = dampScalar(this.echoRig.rightFootPivot.rotation.x, echoRightFootX, echoPoseAlpha);

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
          if (this.twinSyncBeamMesh && this.twinSyncBeamMat) {
            const syncTier = world.twinSync?.tier ?? 0;
            const syncHex =
              syncTier >= 3 ? 0xfbbf24 : syncTier === 2 ? 0x818cf8 : 0x22d3ee;
            const beamRadius = 0.85 + syncTier * 0.28;
            this.twinSyncBeamMesh.visible = true;
            this.twinSyncBeamMesh.position.set(
              (p.x + actor.x) * 0.5,
              1.12,
              (p.z + actor.z) * 0.5
            );
            this.twinSyncBeamMesh.lookAt(actor.x, 1.12, actor.z);
            this.twinSyncBeamMesh.scale.set(beamRadius, beamRadius, dist);
            this.twinSyncBeamMat.uniforms.uColor.value.setHex(syncHex);
            this.twinSyncBeamMat.uniforms.uTime.value = world.elapsedTime;
            this.twinSyncBeamMat.uniforms.uIntensity.value =
              0.42 + syncTier * 0.16;
          }
        } else {
          this.echoTetherMesh.visible = false;
          if (this.twinSyncBeamMesh) {
            this.twinSyncBeamMesh.visible = false;
          }
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
      if (this.twinSyncBeamMesh) {
        this.twinSyncBeamMesh.visible = false;
      }
    }

    // =========================================================================
    // 3. CHRONO ANCHOR PRESSURE PLATES, RECEIVER, BARRIERS & RELAY RETICLE
    // =========================================================================
    const plate = world.pressurePlate;
    const pr = this.chronoPlateRig;
    const isPrologueChapter =
      (world.run?.chapter ?? 'prologue') === 'prologue' &&
      !(world.expedition?.enabled && world.expedition.phase === 'safe_room');
    pr.puzzleFixturesGroup.visible = isPrologueChapter;
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
        nRig.coreMesh.position.y = 2.66 + Math.sin(world.elapsedTime * 3.5 + n) * 0.07;
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
      this.gravityPinMat.opacity = 0.52 + Math.sin(world.elapsedTime * 8) * 0.14;
      this.gravityMineGroup.visible = true;
      this.gravityMineGroup.position.set(
        world.gravityPin.centerX,
        0.58 + Math.sin(world.elapsedTime * 5.2) * 0.08,
        world.gravityPin.centerZ
      );
      this.gravityMineGroup.rotation.y += dt * 3.1;
      if (this.singularityGrenadeRig) {
        this.singularityGrenadeRig.accretionHalo.rotation.z -= dt * 6.5;
        this.singularityGrenadeRig.armingRing.rotation.z += dt * 4.2;
      }
    } else {
      this.gravityPinMesh.visible = false;
      this.gravityMineGroup.visible = false;
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

      // Animate ECHO COLLAPSE fractured containment core expanding & spinning at blast epicenter
      this.echoCollapseCoreGroup.visible = true;
      this.echoCollapseCoreGroup.position.set(
        world.echoCollapse.blastX,
        1.15 + progress * 0.4,
        world.echoCollapse.blastZ
      );
      const coreScale = Math.max(0.01, (1 - progress * 0.55) * 1.35);
      this.echoCollapseCoreGroup.scale.setScalar(coreScale);
      this.echoCollapseCoreGroup.rotation.y = progress * 5.2;
      if (this.echoCollapseGyroA) this.echoCollapseGyroA.rotation.z = progress * 8.0;
      if (this.echoCollapseGyroB) this.echoCollapseGyroB.rotation.x = -progress * 7.0;
      for (let ep = 0; ep < this.echoCollapsePetals.length; ep++) {
        const petal = this.echoCollapsePetals[ep];
        petal.children.forEach((child) => {
          child.position.z = 0.78 + progress * 0.85;
        });
      }
    } else {
      this.echoCollapseWaveMesh.visible = false;
      this.echoCollapseCoreGroup.visible = false;
    }

    // 3. Pressure Plate mechanical depression, claw lock & holographic sync ring
    const mechAlpha = computeDampAlpha(11, dt, this.reducedMotion);
    const gateAlpha = computeDampAlpha(7.5, dt, this.reducedMotion);
    pr.padGroup.position.y = dampScalar(pr.padGroup.position.y, 0.075 - act * 0.042, mechAlpha);
    for (let i = 0; i < pr.clawPivots.length; i++) {
      pr.clawPivots[i].rotation.x = dampScalar(pr.clawPivots[i].rotation.x, act * 0.46, mechAlpha);
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

    // 4. Conduit & Smooth Hydraulic Containment Barrier Column
    pr.conduitCoreMaterial.color.setHex(plate.active ? 0x22d3ee : 0x0891b2);
    pr.conduitCoreMaterial.opacity = 0.42 + act * 0.52;

    const maxRetract = GAME_CONFIG.arena.chronoPlate.receiverHeight - 0.16;
    pr.barrierColumnGroup.position.y = dampScalar(
      pr.barrierColumnGroup.position.y,
      -act * maxRetract,
      gateAlpha
    );

    if (plate.barrierOpen) {
      pr.barrierStripMaterial.color.setHex(0x22d3ee);
      pr.barrierStripMaterial.emissive.setHex(0x06b6d4);
      pr.receiverBeaconMaterial.color.setHex(0xe0f2fe);
      pr.receiverBeaconMaterial.emissive.setHex(0x22d3ee);
      pr.receiverBeaconMaterial.emissiveIntensity = 1.9;
    } else {
      pr.barrierStripMaterial.color.setHex(0xf59e0b);
      pr.barrierStripMaterial.emissive.setHex(0xd97706);
      pr.receiverBeaconMaterial.color.setHex(0xd4ad52);
      pr.receiverBeaconMaterial.emissive.setHex(0xd97706);
      pr.receiverBeaconMaterial.emissiveIntensity = 0.65;
    }
    pr.receiverBeaconMesh.rotation.z += dt * (1.2 + act * 2.8);
    pr.receiverBeaconMesh.rotation.x = Math.PI * 0.5 + Math.sin(world.elapsedTime * 2.4) * 0.1;

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

      pr.combinePadGroup.position.y = dampScalar(
        pr.combinePadGroup.position.y,
        0.075 - cpAct * 0.042,
        mechAlpha
      );
      for (let i = 0; i < pr.combineClawPivots.length; i++) {
        pr.combineClawPivots[i].rotation.x = dampScalar(
          pr.combineClawPivots[i].rotation.x,
          cpAct * 0.46,
          mechAlpha
        );
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

      // Stage 3 Final Combine Barrier dual-lock rings & smooth hydraulic retraction
      const fbOpen = finalBarrier.open ? 1 : 0;
      const fbMaxRetract = GAME_CONFIG.arena.chronoPuzzle.finalBarrier.height - 0.16;
      pr.finalBarrierColumnGroup.position.y = dampScalar(
        pr.finalBarrierColumnGroup.position.y,
        -fbOpen * fbMaxRetract,
        gateAlpha
      );

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

      // Scale squash-and-stretch is now smoothly damped per-rig below (do not reset to 1,1,1 every frame)

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
        const isHoverBoss =
          rig.archetype === 'choir' ||
          rig.archetype === 'curator' ||
          rig.archetype === 'warden_prime';
        const walkCycle = world.elapsedTime * (bPhase === 2 ? 6.2 : 4.5);
        const bossBreath = computeOrganicBreath(
          world.elapsedTime,
          enemy.id.charCodeAt(0) * 0.41,
          bPhase === 2 ? 2.85 : 2.1,
          this.reducedMotion
        );
        const bossPoseAlpha = computeDampAlpha(
          bState === 'attack' ? 24 : bState === 'phase_transition' ? 18 : 13.5,
          animDt,
          this.reducedMotion
        );

        // 1. Smoothly Damped Hydraulic Leg & Shin Stride
        if (rig.leftLegPivot && rig.rightLegPivot) {
          const legSwing = isMoving
            ? Math.sin(walkCycle) * (isHoverBoss ? 0.2 : 0.44)
            : isHoverBoss
              ? bossBreath.sway * 0.08
              : 0;
          rig.leftLegPivot.rotation.x = dampScalar(rig.leftLegPivot.rotation.x, legSwing, bossPoseAlpha);
          rig.rightLegPivot.rotation.x = dampScalar(rig.rightLegPivot.rotation.x, -legSwing, bossPoseAlpha);
          if (rig.leftShinPivot && rig.rightShinPivot) {
            const targetLShin = isMoving
              ? Math.max(0.05, -Math.sin(walkCycle + 0.5)) * (isHoverBoss ? 0.25 : 0.5)
              : 0.08 + bossBreath.chest * 0.02;
            const targetRShin = isMoving
              ? Math.max(0.05, Math.sin(walkCycle + 0.5)) * (isHoverBoss ? 0.25 : 0.5)
              : 0.08 - bossBreath.chest * 0.02;
            rig.leftShinPivot.rotation.x = dampScalar(rig.leftShinPivot.rotation.x, targetLShin, bossPoseAlpha);
            rig.rightShinPivot.rotation.x = dampScalar(rig.rightShinPivot.rotation.x, targetRShin, bossPoseAlpha);
          }
        }

        // 2. Helical Containment Cage / Sovereign Halo Counter-Rotation
        const ringRate =
          bState === 'phase_transition' || bState === 'attack'
            ? 4.8
            : bState === 'telegraph'
              ? 3.4
              : bState === 'recovery' || bState === 'staggered'
                ? 0.42
                : bPhase === 2
                  ? 2.5
                  : 1.45;
        if (rig.outerHelixRing) {
          rig.outerHelixRing.rotation.z += dt * ringRate;
          rig.outerHelixRing.rotation.y = Math.sin(world.elapsedTime * 1.8) * 0.24;
        }
        if (rig.innerHelixRing) {
          rig.innerHelixRing.rotation.z -= dt * (ringRate * 1.38);
          rig.innerHelixRing.rotation.x = Math.cos(world.elapsedTime * 2.1) * 0.26;
        }

        if (rig.auxiliaryPivots) {
          for (let a = 0; a < rig.auxiliaryPivots.length; a++) {
            const pivot = rig.auxiliaryPivots[a];
            if (rig.archetype === 'matron') {
              const side = Number(pivot.userData.side) || 1;
              const restZ = Number(pivot.userData.restZ) || 0;
              const flex =
                bState === 'telegraph'
                  ? 0.34
                  : bState === 'attack'
                    ? -0.48
                    : bState === 'recovery' || bState === 'staggered'
                      ? 0.24
                      : bossBreath.chest * 0.06;
              const targetAuxZ =
                restZ + side * flex + Math.sin(world.elapsedTime * 2.8 + a * 1.3) * 0.045;
              const targetAuxX = bState === 'staggered' ? -0.2 : bossBreath.sway * 0.05;
              pivot.rotation.z = dampScalar(pivot.rotation.z, targetAuxZ, bossPoseAlpha);
              pivot.rotation.x = dampScalar(pivot.rotation.x, targetAuxX, bossPoseAlpha);
            } else {
              const baseY = Number(pivot.userData.baseY);
              if (Number.isFinite(baseY)) {
                const motionScale = bState === 'attack' || bState === 'phase_transition' ? 2.4 : 1.25;
                const targetAuxY =
                  baseY + Math.sin(world.elapsedTime * 2.4 + a * 1.15) * 0.045 * motionScale;
                pivot.position.y = dampScalar(pivot.position.y, targetAuxY, bossPoseAlpha);
              }
              if (rig.archetype === 'curator') {
                const targetAuxYRot =
                  (Number(pivot.userData.baseRotY) || 0) +
                  Math.sin(world.elapsedTime * 1.8 + a) * 0.1;
                pivot.rotation.y = dampScalar(pivot.rotation.y, targetAuxYRot, bossPoseAlpha);
              }
            }
          }
        }

        // 3. Physical Core Shutters (Slide/pivot open when coreExposed is true)
        const shutterTargetX = bCoreExposed ? 0.34 : 0;
        const shutterTargetRotY = bCoreExposed ? 0.54 : 0;
        if (rig.leftShutterPivot && rig.rightShutterPivot) {
          rig.leftShutterPivot.position.x = dampScalar(rig.leftShutterPivot.position.x, -shutterTargetX, bossPoseAlpha);
          rig.rightShutterPivot.position.x = dampScalar(rig.rightShutterPivot.position.x, shutterTargetX, bossPoseAlpha);
          rig.leftShutterPivot.rotation.y = dampScalar(rig.leftShutterPivot.rotation.y, shutterTargetRotY, bossPoseAlpha);
          rig.rightShutterPivot.rotation.y = dampScalar(rig.rightShutterPivot.rotation.y, -shutterTargetRotY, bossPoseAlpha);
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

        // 5. Smoothly Damped Boss Choreography, Archetype Poise & Spatial Floor Telegraphs
        rig.telegraphDiscMaterial.opacity = 0;
        rig.telegraphRingMaterial.opacity = 0;

        const progress =
          enemy.stateDuration > 0
            ? Math.max(0, Math.min(1, 1 - enemy.stateTimer / enemy.stateDuration))
            : 0;

        // Archetype baseline breathing / hover cadence
        let bTargetBodyY = isHoverBoss
          ? 0.14 + bossBreath.chest * 0.085
          : isMoving
            ? Math.pow(Math.abs(Math.sin(walkCycle)), 1.6) * 0.09
            : bossBreath.chest * 0.028;
        let bTargetBodyRotX = isMoving ? (isHoverBoss ? 0.12 : 0.085) : 0.02 + bossBreath.chest * 0.016;
        let bTargetBodyRotZ = isMoving
          ? Math.cos(walkCycle) * (isHoverBoss ? 0.045 : 0.06)
          : bossBreath.sway * (isHoverBoss ? 0.055 : 0.024);

        let bTargetTorsoX = isMoving ? 0.065 : bossBreath.chest * 0.035;
        let bTargetTorsoY = isMoving ? -Math.sin(walkCycle) * 0.17 : bossBreath.sway * 0.075;
        let bTargetTorsoZ = isMoving ? Math.cos(walkCycle) * 0.04 : -bossBreath.sway * 0.025;

        let bTargetHeadX = -bTargetTorsoX * 0.4 + bossBreath.chest * 0.025;
        let bTargetHeadY = -bTargetTorsoY * 0.45 + bossBreath.headScan * 0.14;
        let bTargetHeadZ = bossBreath.headScan * 0.035;

        const guardRatio = guardRecoil / 0.22;
        const weaponRevJitter =
          (rig.archetype === 'helix' || rig.archetype === 'matron') &&
          (bState === 'telegraph' || bState === 'attack') &&
          !this.reducedMotion
            ? Math.sin(world.elapsedTime * 46) * 0.045
            : 0;
        let bTargetWeaponX =
          (isMoving ? Math.sin(walkCycle) * 0.2 : -0.1 + bossBreath.weaponFloat * 0.065) -
          0.18 * guardRatio;
        let bTargetWeaponY = 0.12 + bossBreath.sway * 0.055;
        let bTargetWeaponZ = bossBreath.weaponFloat * 0.04;

        let bTargetSecX =
          (isMoving ? -Math.sin(walkCycle) * 0.2 : -0.12 - bossBreath.weaponFloat * 0.055) -
          0.18 * guardRatio;
        let bTargetSecY = -0.16 - bossBreath.sway * 0.055;
        let bTargetSecZ = -bossBreath.weaponFloat * 0.04;

        let bSquash = 0;
        let bStretch = 0;

        if (bState === 'dormant') {
          const wakeRatio = progress;
          bTargetBodyY = -0.26 * (1 - wakeRatio) + bossBreath.chest * 0.02;
          bTargetBodyRotX = 0.24 * (1 - wakeRatio);
          bTargetBodyRotZ = 0;
          bTargetTorsoX = 0.18 * (1 - wakeRatio);
          bTargetTorsoY = 0;
          bTargetTorsoZ = 0;
          bTargetWeaponX = 0.32 * (1 - wakeRatio);
          bTargetWeaponY = 0;
          bTargetWeaponZ = 0;
          bTargetSecX = 0.28 * (1 - wakeRatio);
          bTargetSecY = 0;
          bTargetSecZ = 0;
          rig.telegraphRingMaterial.color.setHex(0xf59e0b);
          rig.telegraphRingMaterial.opacity = 0.55 * (1 - wakeRatio * 0.5);
        } else if (bState === 'phase_transition') {
          bTargetBodyY = (isHoverBoss ? 0.28 : 0.16) * Math.sin(progress * Math.PI);
          bTargetBodyRotX = -0.24;
          bTargetBodyRotZ = Math.sin(world.elapsedTime * 22) * 0.065;
          bTargetTorsoX = -0.3;
          bTargetTorsoY = Math.sin(progress * Math.PI * 2) * 0.24;
          bTargetTorsoZ = 0;
          bTargetHeadX = -0.28;
          bTargetWeaponX = -1.2;
          bTargetWeaponY = -0.4;
          bTargetWeaponZ = 0.38;
          bTargetSecX = -1.1;
          bTargetSecY = 0.44;
          bTargetSecZ = -0.38;
          bStretch = Math.sin(progress * Math.PI) * 0.75;
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
            const tv = computeBossTelegraphVisuals(bAttack, progress, locked, this.reducedMotion);
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
            bTargetBodyY = -0.11 * progress;
            bTargetBodyRotX = 0.26 * progress;
            bTargetBodyRotZ = weaponRevJitter;
            bTargetTorsoX = 0.24 * progress;
            bTargetTorsoY = 0.16 * progress;
            bTargetTorsoZ = 0;
            bTargetWeaponX = 0.48 * progress + weaponRevJitter;
            bTargetWeaponY = 0.25 * progress;
            bTargetWeaponZ = -0.15 * progress;
            bTargetSecX = -0.45 * progress;
            bTargetSecY = -0.35 * progress;
            bTargetSecZ = 0.2 * progress;
            bSquash = 0.45 * progress;
          } else if (bAttack === 'helical_sweep') {
            const tv = computeBossTelegraphVisuals(bAttack, progress, locked, this.reducedMotion);
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
            bTargetBodyY = -0.06 * progress;
            bTargetBodyRotX = 0.08 * progress;
            bTargetBodyRotZ = -0.09 * progress;
            bTargetTorsoX = -0.1 * progress;
            bTargetTorsoY = -0.76 * progress;
            bTargetTorsoZ = 0.12 * progress;
            bTargetWeaponX = 0.25 * progress + weaponRevJitter;
            bTargetWeaponY = 0.2 * progress;
            bTargetWeaponZ = 0;
            bTargetSecX = -0.42 * progress;
            bTargetSecY = -1.32 * progress;
            bTargetSecZ = -0.28 * progress;
            bSquash = 0.3 * progress;
          } else {
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

            bTargetBodyY = (isHoverBoss ? 0.28 : 0.06) * progress - 0.06 * progress;
            bTargetBodyRotX = -0.24 * progress;
            bTargetBodyRotZ = weaponRevJitter;
            bTargetTorsoX = -0.3 * progress;
            bTargetTorsoY = -0.38 * progress;
            bTargetTorsoZ = 0.15 * progress;
            bTargetWeaponX = -1.62 * progress + weaponRevJitter;
            bTargetWeaponY = -0.3 * progress;
            bTargetWeaponZ = 0.26 * progress;
            bTargetSecX = -0.68 * progress;
            bTargetSecY = 0.3 * progress;
            bTargetSecZ = -0.24 * progress;
            bStretch = 0.45 * progress;
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
            bTargetBodyY = -0.06;
            bTargetBodyRotX = 0.36;
            bTargetBodyRotZ = weaponRevJitter;
            bTargetTorsoX = 0.3;
            bTargetTorsoY = 0.24;
            bTargetTorsoZ = 0;
            bTargetWeaponX = 0.68 + weaponRevJitter;
            bTargetWeaponY = 0.35;
            bTargetWeaponZ = -0.18;
            bTargetSecX = 0.45;
            bTargetSecY = -0.25;
            bTargetSecZ = 0.15;
            bStretch = 0.55;
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
            bTargetBodyY = -0.04;
            bTargetBodyRotX = 0.2;
            bTargetBodyRotZ = 0.12 * sweepRatio;
            bTargetTorsoX = 0.18;
            bTargetTorsoY = -0.74 + sweepRatio * 1.62;
            bTargetTorsoZ = 0;
            bTargetWeaponX = 0.4 + weaponRevJitter;
            bTargetWeaponY = -0.22;
            bTargetWeaponZ = 0.16;
            bTargetSecX = 0.24;
            bTargetSecY = -1.3 + sweepRatio * 2.6;
            bTargetSecZ = 0.22;
            bStretch = 0.35;
          } else {
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

            bTargetBodyY = -0.15;
            bTargetBodyRotX = 0.34;
            bTargetBodyRotZ = 0;
            bTargetTorsoX = 0.4;
            bTargetTorsoY = 0.36;
            bTargetTorsoZ = -0.14;
            bTargetWeaponX = 0.98 + weaponRevJitter;
            bTargetWeaponY = 0.24;
            bTargetWeaponZ = -0.16;
            bTargetSecX = 0.44;
            bTargetSecY = -0.28;
            bTargetSecZ = 0.18;
            bSquash = 0.85 * (1 - progress * 0.55);
          }
        } else if (bState === 'recovery' || bState === 'staggered') {
          const isStagger = bState === 'staggered';
          rig.telegraphRingMaterial.color.setHex(0xffffff);
          rig.telegraphRingMaterial.opacity = 0.48;
          bTargetBodyY = (isStagger ? -0.14 : -0.05) + bossBreath.chest * 0.025;
          bTargetBodyRotX = isStagger ? -0.25 : 0.2;
          bTargetBodyRotZ = isStagger ? Math.sin(world.elapsedTime * 16) * 0.095 : bossBreath.sway * 0.03;
          bTargetTorsoX = isStagger ? -0.22 : 0.22;
          bTargetTorsoY = isStagger ? Math.cos(world.elapsedTime * 13) * 0.16 : 0.18;
          bTargetTorsoZ = 0;
          bTargetHeadX = isStagger ? 0.28 : 0.16;
          bTargetHeadY = isStagger ? Math.sin(world.elapsedTime * 15) * 0.26 : 0;
          bTargetWeaponX = 0.54;
          bTargetWeaponY = -0.48;
          bTargetWeaponZ = 0.3;
          bTargetSecX = 0.5;
          bTargetSecY = 0.48;
          bTargetSecZ = -0.3;
          bSquash = isStagger ? 0.4 : 0.18;
        }

        if (enemy.aiState === 'staggered' && !this.reducedMotion) {
          bTargetTorsoZ += Math.sin(world.elapsedTime * 36 + enemy.id.length) * 0.085;
          bTargetHeadZ -= Math.sin(world.elapsedTime * 28) * 0.07;
        }
        if (enemy.hitFlashTimer > 0) {
          const hitRatio = Math.min(1, enemy.hitFlashTimer / 0.14);
          bTargetBodyRotX -= 0.22 * hitRatio;
          bTargetTorsoX -= 0.21 * hitRatio;
          bTargetTorsoZ += Math.sin(world.elapsedTime * 55) * 0.06 * hitRatio;
          bSquash = Math.max(bSquash, 0.56 * hitRatio);
        }

        // Apply smooth damped poses + volume-preserving squash & stretch to Boss rig
        rig.bodyGroup.position.y = dampScalar(rig.bodyGroup.position.y, bTargetBodyY, bossPoseAlpha);
        dampEuler(rig.bodyGroup.rotation, bTargetBodyRotX, 0, bTargetBodyRotZ, bossPoseAlpha);
        const bScale = computeSquashStretch(bSquash, bStretch, this.reducedMotion);
        rig.bodyGroup.scale.x = dampScalar(rig.bodyGroup.scale.x, bScale.scaleXZ, bossPoseAlpha);
        rig.bodyGroup.scale.y = dampScalar(rig.bodyGroup.scale.y, bScale.scaleY, bossPoseAlpha);
        rig.bodyGroup.scale.z = dampScalar(rig.bodyGroup.scale.z, bScale.scaleXZ, bossPoseAlpha);

        if (rig.torsoPivot) {
          dampEuler(rig.torsoPivot.rotation, bTargetTorsoX, bTargetTorsoY, bTargetTorsoZ, bossPoseAlpha);
        }
        if (rig.headPivot) {
          dampEuler(rig.headPivot.rotation, bTargetHeadX, bTargetHeadY, bTargetHeadZ, bossPoseAlpha);
        }
        dampEuler(rig.weaponPivot.rotation, bTargetWeaponX, bTargetWeaponY, bTargetWeaponZ, bossPoseAlpha);
        dampEuler(rig.secondaryPivot.rotation, bTargetSecX, bTargetSecY, bTargetSecZ, bossPoseAlpha);
        continue;
      }

      const enemySpeed = Math.hypot(enemy.vx, enemy.vz);
      const isEnemyMoving =
        (enemy.aiState === 'pursue' || enemy.aiState === 'idle') && enemySpeed > 0.12;
      const seedOffset = enemy.id.charCodeAt(0) * 0.73 + (enemy.id.charCodeAt(enemy.id.length - 1) || 1) * 0.37;
      const walkCycle =
        world.elapsedTime *
          (enemy.archetype === 'scrapper' || enemy.archetype === 'phase_stalker' ? 10.6 : 5.0) +
        seedOffset;
      const enemyBreath = computeOrganicBreath(
        world.elapsedTime,
        seedOffset,
        enemy.archetype === 'scrapper' || enemy.archetype === 'phase_stalker' ? 3.2 : 2.25,
        this.reducedMotion
      );
      const enemyPoseAlpha = computeDampAlpha(
        enemy.aiState === 'attack' ? 24 : enemy.aiState === 'staggered' ? 16 : 14,
        animDt,
        this.reducedMotion
      );

      // 1. Smoothly Damped Leg & Shin Articulation
      if (rig.leftLegPivot && rig.rightLegPivot) {
        const legAmp = enemy.archetype === 'scrapper' || enemy.archetype === 'phase_stalker' ? 0.56 : 0.4;
        const targetLegSwing = isEnemyMoving ? Math.sin(walkCycle) * legAmp : 0;
        rig.leftLegPivot.rotation.x = dampScalar(rig.leftLegPivot.rotation.x, targetLegSwing, enemyPoseAlpha);
        rig.rightLegPivot.rotation.x = dampScalar(rig.rightLegPivot.rotation.x, -targetLegSwing, enemyPoseAlpha);

        if (rig.leftShinPivot && rig.rightShinPivot) {
          let targetLShin = 0.08;
          let targetRShin = 0.08;
          if (enemy.archetype === 'bastion' || enemy.archetype === 'aegis_sentinel') {
            targetLShin = isEnemyMoving
              ? Math.max(0.06, -Math.sin(walkCycle + 0.5)) * 0.5
              : 0.09 + enemyBreath.chest * 0.02;
            targetRShin = isEnemyMoving
              ? Math.max(0.06, Math.sin(walkCycle + 0.5)) * 0.5
              : 0.09 - enemyBreath.chest * 0.02;
          } else {
            // Digitigrade spring knee
            targetLShin = isEnemyMoving
              ? -0.22 + Math.sin(walkCycle + 0.7) * 0.4
              : -0.18 + enemyBreath.chest * 0.035;
            targetRShin = isEnemyMoving
              ? -0.22 - Math.sin(walkCycle + 0.7) * 0.4
              : -0.18 - enemyBreath.chest * 0.035;
          }
          rig.leftShinPivot.rotation.x = dampScalar(rig.leftShinPivot.rotation.x, targetLShin, enemyPoseAlpha);
          rig.rightShinPivot.rotation.x = dampScalar(rig.rightShinPivot.rotation.x, targetRShin, enemyPoseAlpha);
        }
      }

      if (rig.eliteCrownMesh && rig.eliteCrownMaterial) {
        if (enemy.modifier) {
          rig.eliteCrownMesh.visible = true;
          rig.eliteCrownMesh.rotation.z = world.elapsedTime * 2.4;
          const crownColor =
            enemy.modifier === 'overclocked'
              ? 0xf59e0b
              : enemy.modifier === 'phase_shielded'
                ? 0x38bdf8
                : 0xef4444;
          rig.eliteCrownMaterial.color.setHex(crownColor);
          rig.eliteCrownMaterial.opacity = 0.72 + Math.sin(world.elapsedTime * 6.0) * 0.2;
        } else {
          rig.eliteCrownMesh.visible = false;
        }
      }

      // 2. Archetype Baseline Locomotion & Organic Idle Breathing Targets
      let eTargetBodyY = enemyBreath.chest * 0.022;
      let eTargetBodyRotX = 0.02 + enemyBreath.chest * 0.015;
      let eTargetBodyRotZ = enemyBreath.sway * 0.022;

      let eTargetTorsoX = enemyBreath.chest * 0.028;
      let eTargetTorsoY = enemyBreath.sway * 0.07;
      let eTargetTorsoZ = -enemyBreath.sway * 0.022;

      let eTargetHeadX = -enemyBreath.chest * 0.02;
      let eTargetHeadY = enemyBreath.headScan * 0.16;
      let eTargetHeadZ = enemyBreath.headScan * 0.03;

      let eTargetWeaponX = isEnemyMoving ? Math.sin(walkCycle) * 0.18 : enemyBreath.weaponFloat * 0.06;
      let eTargetWeaponY = enemyBreath.sway * 0.04;
      let eTargetWeaponZ = enemyBreath.weaponFloat * 0.035;

      let eTargetSecX = 0;
      let eTargetSecY = 0;
      let eTargetSecZ = 0;
      let dampSecondary = false;

      let eTargetLeftArmX = -0.18;
      let eTargetLeftArmY = 0.16;
      let eTargetLeftArmZ = -0.1;
      let eTargetRightArmX = -0.18;
      let eTargetRightArmY = -0.16;
      let eTargetRightArmZ = 0.1;
      let driveDualArms = false;

      let eSquash = 0;
      let eStretch = 0;

      if (enemy.archetype === 'null_weaver') {
        const hoverPhase = world.elapsedTime * 3.1 + seedOffset;
        eTargetBodyY = Math.sin(hoverPhase) * 0.15 + enemyBreath.chest * 0.03;
        eTargetBodyRotX = isEnemyMoving ? 0.14 : Math.sin(hoverPhase * 0.6) * 0.055;
        eTargetBodyRotZ = Math.cos(hoverPhase * 0.8) * 0.07;
        const gyroRate =
          enemy.aiState === 'telegraph' ? 5.2 : enemy.aiState === 'recovery' ? 0.55 : 1.85;
        if (rig.outerHelixRing) {
          rig.outerHelixRing.rotation.z += dt * gyroRate;
          rig.outerHelixRing.rotation.y += dt * gyroRate * 0.65;
        }
        if (rig.innerHelixRing) {
          rig.innerHelixRing.rotation.x -= dt * gyroRate * 1.45;
          rig.innerHelixRing.rotation.z -= dt * gyroRate * 0.8;
        }
      } else if (enemy.archetype === 'siphon') {
        const hoverPhase = world.elapsedTime * 3.3 + seedOffset;
        eTargetBodyY = Math.sin(hoverPhase) * 0.15 + enemyBreath.chest * 0.025;
        eTargetBodyRotX = isEnemyMoving ? 0.2 : 0.05 + enemyBreath.chest * 0.025;
        eTargetBodyRotZ = Math.cos(hoverPhase * 0.8) * 0.075;
        rig.secondaryPivot.rotation.y += dt * (enemy.aiState === 'telegraph' ? 3.5 : 1.25);
      } else if (enemy.archetype === 'aegis_sentinel') {
        const hoverPhase = world.elapsedTime * 2.8 + seedOffset;
        eTargetBodyY = Math.sin(hoverPhase) * 0.13 + enemyBreath.chest * 0.025;
        eTargetBodyRotX = isEnemyMoving ? 0.11 : enemyBreath.chest * 0.02;
        eTargetBodyRotZ = Math.cos(hoverPhase * 0.7) * 0.05;
        rig.secondaryPivot.rotation.z += dt * (enemy.aiState === 'telegraph' ? 2.6 : 1.0);
      } else if (enemy.archetype === 'scout') {
        const strideWave = Math.sin(walkCycle);
        eTargetBodyY = isEnemyMoving
          ? Math.abs(strideWave) * 0.06
          : enemyBreath.chest * 0.02;
        eTargetBodyRotX = isEnemyMoving ? 0.13 : 0.03 + enemyBreath.chest * 0.015;
        eTargetBodyRotZ = isEnemyMoving ? Math.cos(walkCycle) * 0.045 : enemyBreath.sway * 0.02;
        eTargetTorsoY = isEnemyMoving ? -strideWave * 0.18 : enemyBreath.sway * 0.08;
        eTargetWeaponX = isEnemyMoving ? Math.sin(walkCycle) * 0.12 : -0.06 + enemyBreath.weaponFloat * 0.05;
      } else if (enemy.archetype === 'resonance_warden') {
        const hoverPhase = world.elapsedTime * 2.9 + seedOffset;
        eTargetBodyY = Math.sin(hoverPhase) * 0.17 + enemyBreath.chest * 0.03;
        eTargetBodyRotX = isEnemyMoving ? 0.1 : enemyBreath.chest * 0.02;
        eTargetBodyRotZ = Math.cos(hoverPhase * 0.7) * 0.06;
        const ringSpin = enemy.tetherTargetId ? 3.1 : 1.5;
        if (rig.outerHelixRing) {
          rig.outerHelixRing.rotation.z += dt * ringSpin;
          rig.outerHelixRing.rotation.x = Math.sin(hoverPhase * 0.8) * 0.28;
        }
        if (rig.innerHelixRing) {
          rig.innerHelixRing.rotation.y -= dt * ringSpin * 1.5;
          rig.innerHelixRing.rotation.z -= dt * ringSpin * 0.75;
        }
      } else if (enemy.archetype === 'chrono_mortar') {
        eTargetBodyY = isEnemyMoving
          ? Math.abs(Math.sin(walkCycle)) * 0.05
          : enemyBreath.chest * 0.015;
        eTargetBodyRotX = 0;
        eTargetBodyRotZ = isEnemyMoving ? Math.cos(walkCycle) * 0.04 : enemyBreath.sway * 0.015;
        eTargetWeaponX = -0.14 + enemyBreath.weaponFloat * 0.04;
      } else if (enemy.archetype === 'phase_stalker' || enemy.archetype === 'eraser') {
        const phasePulse = (enemy.phaseShiftTimer ?? 0) > 0 ? 0.14 : 0;
        const prowlWave = Math.sin(walkCycle * 1.15);
        eTargetBodyY =
          (isEnemyMoving ? Math.abs(prowlWave) * 0.085 : enemyBreath.chest * 0.03) +
          phasePulse;
        eTargetBodyRotX = isEnemyMoving ? 0.27 : 0.13 + enemyBreath.chest * 0.025;
        eTargetBodyRotZ = isEnemyMoving ? Math.cos(walkCycle * 1.15) * 0.095 : enemyBreath.sway * 0.035;
        eTargetTorsoX = isEnemyMoving ? 0.16 : 0.05 + enemyBreath.chest * 0.035;
        eTargetTorsoY = isEnemyMoving ? -prowlWave * 0.26 : enemyBreath.sway * 0.1;
        eTargetHeadY = enemyBreath.headScan * 0.22;
        if (rig.leftArmPivot && rig.rightArmPivot) {
          driveDualArms = true;
          const weave = isEnemyMoving ? prowlWave * 0.34 : enemyBreath.weaponFloat * 0.12;
          eTargetLeftArmX = -0.22 + weave;
          eTargetRightArmX = -0.22 - weave;
        }
      } else if (enemy.archetype === 'bastion') {
        const stompBounce = isEnemyMoving
          ? Math.pow(Math.abs(Math.sin(walkCycle)), 1.7) * 0.078
          : enemyBreath.chest * 0.02;
        eTargetBodyY = stompBounce;
        eTargetBodyRotZ = isEnemyMoving ? Math.cos(walkCycle) * 0.056 : enemyBreath.sway * 0.018;
        eTargetBodyRotX = isEnemyMoving ? 0.075 : 0.025 + enemyBreath.chest * 0.015;
        eTargetTorsoX = isEnemyMoving ? 0.065 : enemyBreath.chest * 0.024;
        eTargetTorsoY = isEnemyMoving ? -Math.sin(walkCycle) * 0.15 : 0.1 + enemyBreath.sway * 0.055;
        eTargetHeadY = isEnemyMoving ? Math.sin(walkCycle) * 0.1 : -0.06 + enemyBreath.headScan * 0.12;

        dampSecondary = true;
        const guardRecoilRatio = guardRecoil / 0.22;
        if (enemy.aiState === 'recovery' || enemy.aiState === 'staggered') {
          eTargetSecX = 0.14;
          eTargetSecY = -0.82;
          eTargetSecZ = -0.2;
        } else if (enemy.aiState === 'telegraph') {
          eTargetSecX = -0.08;
          eTargetSecY = -0.48;
          eTargetSecZ = 0;
        } else {
          eTargetSecX = -0.18 * guardRecoilRatio + enemyBreath.chest * 0.025;
          eTargetSecY = 0.28 - 0.22 * guardRecoilRatio + enemyBreath.sway * 0.03;
          eTargetSecZ = 0.08 * guardRecoilRatio;
        }
      } else {
        // SCRAPPER-X2: Agile low-slung digitigrade stalk, twitchy head scan, counter-balancing tail whip
        const prowlWave = Math.sin(walkCycle);
        const prowlCos = Math.cos(walkCycle);
        eTargetBodyRotX = isEnemyMoving ? 0.23 : 0.09 + enemyBreath.chest * 0.025;
        eTargetBodyRotZ = isEnemyMoving ? prowlCos * 0.09 : enemyBreath.sway * 0.03;
        eTargetBodyY = isEnemyMoving
          ? Math.abs(prowlWave) * 0.08
          : enemyBreath.chest * 0.03;
        dampSecondary = true;
        eTargetSecY = isEnemyMoving
          ? prowlCos * 0.38
          : Math.sin(world.elapsedTime * 3.1 + seedOffset) * 0.2;
        eTargetTorsoX = isEnemyMoving ? 0.13 : enemyBreath.chest * 0.04;
        eTargetTorsoY = isEnemyMoving ? -prowlWave * 0.28 : enemyBreath.sway * 0.1;
        eTargetTorsoZ = isEnemyMoving ? prowlCos * 0.065 : -enemyBreath.sway * 0.03;
        eTargetHeadX = isEnemyMoving ? -0.1 : enemyBreath.chest * 0.03;
        eTargetHeadY = enemyBreath.headScan * 0.24;
        if (rig.leftArmPivot && rig.rightArmPivot) {
          driveDualArms = true;
          const weave = isEnemyMoving ? prowlWave * 0.34 : enemyBreath.weaponFloat * 0.12;
          eTargetLeftArmX = -0.18 + weave;
          eTargetRightArmX = -0.18 - weave;
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

      // 3. Telegraph, Attack, Recovery & Stagger Target Overrides
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
          eTargetBodyY = -0.04 * progress;
          eTargetBodyRotX = -0.2 * progress;
          eTargetTorsoX = -0.24 * progress;
          eTargetTorsoY = -0.45 * progress;
          eTargetTorsoZ = 0.11 * progress;
          eTargetWeaponX = -1.36 * progress;
          eTargetWeaponY = -0.34 * progress;
          eTargetWeaponZ = 0.26 * progress;
          eStretch = 0.3 * progress;
        } else if (
          enemy.archetype === 'scrapper' ||
          enemy.archetype === 'phase_stalker' ||
          enemy.archetype === 'eraser'
        ) {
          eTargetBodyY = -0.15 * progress;
          eTargetBodyRotX = -0.22 * progress;
          eTargetTorsoX = -0.18 * progress;
          eTargetTorsoY = 0;
          if (rig.leftArmPivot && rig.rightArmPivot) {
            driveDualArms = true;
            eTargetLeftArmX = -0.96 * progress;
            eTargetLeftArmY = 0.62 * progress;
            eTargetLeftArmZ = -0.38 * progress;
            eTargetRightArmX = -0.96 * progress;
            eTargetRightArmY = -0.62 * progress;
            eTargetRightArmZ = 0.38 * progress;
          } else {
            eTargetWeaponX = -0.9 * progress;
          }
          eSquash = 0.55 * progress;
        } else if (enemy.archetype === 'chrono_mortar') {
          eTargetBodyY = -0.12 * progress;
          eTargetWeaponX = -0.46 * progress;
          eSquash = 0.45 * progress;
        } else {
          eTargetBodyRotX = -0.1 * progress;
          eTargetWeaponX = -0.28 * progress;
          eStretch = 0.22 * progress;
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
          eTargetBodyY = -0.07;
          eTargetBodyRotX = 0.3;
          eTargetTorsoX = 0.34;
          eTargetTorsoY = 0.46;
          eTargetTorsoZ = -0.12;
          eTargetWeaponX = 0.92;
          eTargetWeaponY = 0.24;
          eTargetWeaponZ = -0.18;
          eSquash = 0.68;
        } else if (
          enemy.archetype === 'scrapper' ||
          enemy.archetype === 'phase_stalker' ||
          enemy.archetype === 'eraser'
        ) {
          eTargetBodyY = 0.05;
          eTargetBodyRotX = 0.36;
          eTargetTorsoX = 0.3;
          eTargetTorsoY = 0;
          if (rig.leftArmPivot && rig.rightArmPivot) {
            driveDualArms = true;
            eTargetLeftArmX = 0.8;
            eTargetLeftArmY = -0.66;
            eTargetLeftArmZ = 0.3;
            eTargetRightArmX = 0.8;
            eTargetRightArmY = 0.66;
            eTargetRightArmZ = -0.3;
          } else {
            eTargetWeaponX = 0.78;
          }
          eStretch = 0.65;
        } else if (enemy.archetype === 'chrono_mortar') {
          eTargetBodyY = -0.18;
          eTargetWeaponX = -0.62;
          eSquash = 0.82;
        } else {
          eTargetBodyRotX = -0.2;
          eTargetWeaponX = 0.24;
          eSquash = 0.35;
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
        eTargetBodyY = (isStagger ? -0.1 : -0.04) + enemyBreath.chest * 0.02;
        eTargetBodyRotX = isStagger ? -0.24 : 0.18;
        eTargetBodyRotZ = isStagger ? Math.sin(world.elapsedTime * 16 + seedOffset) * 0.1 : 0;
        eTargetTorsoX = isStagger ? -0.2 : 0.22;
        eTargetTorsoY = isStagger ? Math.cos(world.elapsedTime * 13 + seedOffset) * 0.16 : 0.24;
        eTargetHeadX = isStagger ? 0.26 : 0.15;
        eTargetHeadY = isStagger ? Math.sin(world.elapsedTime * 15 + seedOffset) * 0.28 : 0;
        if (rig.leftArmPivot && rig.rightArmPivot && (enemy.archetype === 'scrapper' || enemy.archetype === 'phase_stalker' || enemy.archetype === 'eraser')) {
          driveDualArms = true;
          eTargetLeftArmX = 0.44;
          eTargetLeftArmY = 0.4;
          eTargetLeftArmZ = -0.28;
          eTargetRightArmX = 0.44;
          eTargetRightArmY = -0.4;
          eTargetRightArmZ = 0.28;
        } else {
          eTargetWeaponX = 0.54;
          eTargetWeaponY = 0.16;
        }
        eSquash = isStagger ? 0.38 : 0.15;
        if (rig.laserSightMaterial) rig.laserSightMaterial.opacity = 0;
      } else {
        rig.telegraphDiscMaterial.opacity = 0;
        rig.telegraphRingMaterial.opacity = 0;
        rig.telegraphRingMaterial.color.setHex(0xef4444);
        if (rig.laserSightMaterial) rig.laserSightMaterial.opacity = 0;
      }

      // 4. Hit-flash & guard recoil jolt + volume-preserving squash-and-stretch
      if (guardRecoil > 0) {
        const gRatio = Math.min(1, guardRecoil / 0.22);
        eTargetBodyRotX -= 0.15 * gRatio;
        eSquash = Math.max(eSquash, 0.35 * gRatio);
      }
      if (enemy.aiState === 'staggered' && !this.reducedMotion) {
        eTargetTorsoZ += Math.sin(world.elapsedTime * 38 + enemy.id.length) * 0.09;
        eTargetHeadZ -= Math.sin(world.elapsedTime * 30) * 0.08;
      }
      if (enemy.hitFlashTimer > 0) {
        const hitRatio = Math.min(1, enemy.hitFlashTimer / 0.14);
        eTargetBodyRotX -= 0.24 * hitRatio;
        eTargetTorsoX -= 0.22 * hitRatio;
        eTargetTorsoZ += Math.sin(world.elapsedTime * 58) * 0.07 * hitRatio;
        eSquash = Math.max(eSquash, 0.62 * hitRatio);
      }

      // 5. Apply smooth damped joint transforms to Enemy rig
      rig.bodyGroup.position.y = dampScalar(rig.bodyGroup.position.y, eTargetBodyY, enemyPoseAlpha);
      dampEuler(rig.bodyGroup.rotation, eTargetBodyRotX, 0, eTargetBodyRotZ, enemyPoseAlpha);
      const eScale = computeSquashStretch(eSquash, eStretch, this.reducedMotion);
      rig.bodyGroup.scale.x = dampScalar(rig.bodyGroup.scale.x, eScale.scaleXZ, enemyPoseAlpha);
      rig.bodyGroup.scale.y = dampScalar(rig.bodyGroup.scale.y, eScale.scaleY, enemyPoseAlpha);
      rig.bodyGroup.scale.z = dampScalar(rig.bodyGroup.scale.z, eScale.scaleXZ, enemyPoseAlpha);

      if (rig.torsoPivot) {
        dampEuler(rig.torsoPivot.rotation, eTargetTorsoX, eTargetTorsoY, eTargetTorsoZ, enemyPoseAlpha);
      }
      if (rig.headPivot) {
        dampEuler(rig.headPivot.rotation, eTargetHeadX, eTargetHeadY, eTargetHeadZ, enemyPoseAlpha);
      }
      dampEuler(rig.weaponPivot.rotation, eTargetWeaponX, eTargetWeaponY, eTargetWeaponZ, enemyPoseAlpha);
      if (dampSecondary) {
        dampEuler(rig.secondaryPivot.rotation, eTargetSecX, eTargetSecY, eTargetSecZ, enemyPoseAlpha);
      }
      if (driveDualArms && rig.leftArmPivot && rig.rightArmPivot) {
        dampEuler(rig.leftArmPivot.rotation, eTargetLeftArmX, eTargetLeftArmY, eTargetLeftArmZ, enemyPoseAlpha);
        dampEuler(rig.rightArmPivot.rotation, eTargetRightArmX, eTargetRightArmY, eTargetRightArmZ, enemyPoseAlpha);
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
    if (this.slipTrailSpawnCooldown > 0) {
      this.slipTrailSpawnCooldown = Math.max(0, this.slipTrailSpawnCooldown - dt);
    }
    const slipRemaining = world.player.temporalSlipTimer ?? 0;
    const slipMax = Math.max(0.01, world.player.temporalSlipMaxDuration || 1.35);
    if (
      this.temporalSlipRingGroup &&
      world.appState === 'playing' &&
      slipRemaining > 0 &&
      this.screenEffectsEnabled !== false
    ) {
      const slipRatio = Math.max(0, Math.min(1, slipRemaining / slipMax));
      this.temporalSlipRingGroup.visible = true;
      this.temporalSlipRingGroup.position.set(world.player.x, 0, world.player.z);
      const pulseScale = 0.94 + Math.sin(world.elapsedTime * 11) * 0.04;
      this.temporalSlipRingGroup.scale.setScalar(pulseScale);
      if (this.temporalSlipOuterRing) {
        this.temporalSlipOuterRing.rotation.z += dt * 1.4;
      }
      if (this.temporalSlipInnerRing) {
        this.temporalSlipInnerRing.rotation.z -= dt * 2.2;
      }
      if (this.temporalSlipTicksMesh) {
        this.temporalSlipTicksMesh.rotation.y += dt * 0.9;
      }
      if (this.temporalSlipOuterMat) {
        this.temporalSlipOuterMat.opacity = 0.24 + slipRatio * 0.48;
      }
      if (this.temporalSlipInnerMat) {
        this.temporalSlipInnerMat.opacity = 0.2 + slipRatio * 0.42;
      }
      if (this.temporalSlipTicksMat) {
        this.temporalSlipTicksMat.opacity = 0.28 + slipRatio * 0.45;
      }
      const pSpeed = Math.hypot(world.player.vx, world.player.vz);
      if (pSpeed > 1.2 && this.slipTrailSpawnCooldown <= 0) {
        this.spawnPlayerAfterimage(
          world.player.x,
          world.player.z,
          world.player.rotationY,
          0xc084fc,
          0.32,
          0.34
        );
        this.slipTrailSpawnCooldown = 0.14;
      }
    } else if (this.temporalSlipRingGroup) {
      this.temporalSlipRingGroup.visible = false;
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
    if (this.photoModeCam?.active) {
      const yaw = p.rotationY + this.photoModeCam.yawOffset;
      const pitch = Math.max(-0.32, Math.min(1.15, this.photoModeCam.pitchOffset));
      const dist = Math.max(2.6, Math.min(14.5, this.photoModeCam.distance));
      const cosP = Math.cos(pitch);
      const targetY = 1.45;
      this.currentCamPos.set(
        p.x + Math.sin(yaw) * cosP * dist,
        Math.max(0.55, targetY + Math.sin(pitch) * dist),
        p.z + Math.cos(yaw) * cosP * dist
      );
      this.currentLookAt.set(p.x, targetY, p.z);
      if (typeof this.camera.updateProjectionMatrix === 'function') {
        const clampedFov = Math.max(28, Math.min(82, this.photoModeCam.fov));
        if (Math.abs(this.camera.fov - clampedFov) > 0.05) {
          this.camera.fov = clampedFov;
          this.camera.updateProjectionMatrix();
        }
      }
      this.camera.position.copy(this.currentCamPos);
      this.camera.lookAt(this.currentLookAt);
      return;
    }

    if (world.appState === 'title') {
      const tourDamp = 1 - Math.exp(-8 * dt);
      if (!this.reducedMotion) this.titleTourAngle += dt * 0.22;
      const tourX = p.x + Math.sin(this.titleTourAngle) * 4.4 + 2.1;
      const tourZ = p.z + Math.cos(this.titleTourAngle) * 3.8 + 2.85;
      _desiredCamPos.set(tourX, 2.95, tourZ);
      _lookAtTarget.set(p.x - 0.9, 1.38, p.z - 2.6);
      this.currentCamPos.lerp(_desiredCamPos, tourDamp);
      this.currentLookAt.lerp(_lookAtTarget, tourDamp);
      if (this.keyLight) this.keyLight.intensity = 3.15;
      if (this.rimLight) this.rimLight.intensity = 2.45;
    } else {
      if (this.keyLight && world.run) {
        const activeLook = resolveChapterVisualLook(world.run.chapter, world.loom?.selectedEnding ?? null);
        this.keyLight.intensity = activeLook.keyIntensity;
      }
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

  public setPhotoModeCamera(opts: {
    active: boolean;
    yawOffset: number;
    pitchOffset: number;
    distance: number;
    fov: number;
    showDrone: boolean;
  }): void {
    this.photoModeCam.active = opts.active;
    this.photoModeCam.yawOffset = opts.yawOffset;
    this.photoModeCam.pitchOffset = opts.pitchOffset;
    this.photoModeCam.distance = opts.distance;
    this.photoModeCam.fov = opts.fov;
    this.photoModeCam.showDrone = opts.showDrone;
  }

  public capturePhotoDataUrl(filterCss = 'none'): string | null {
    if (!this.renderer || this.webglContextLost) return null;
    try {
      // Render synchronously right before reading the WebGL drawing buffer
      if (this.bloomEnabled && this.composer) {
        this.composer.render();
      } else {
        this.renderer.render(this.scene, this.camera);
      }
      const glCanvas = this.renderer.domElement;
      if (typeof document === 'undefined' || !filterCss || filterCss === 'none') {
        return glCanvas.toDataURL('image/png');
      }
      const out = document.createElement('canvas');
      out.width = glCanvas.width;
      out.height = glCanvas.height;
      const ctx = out.getContext('2d');
      if (!ctx) return glCanvas.toDataURL('image/png');
      ctx.filter = filterCss;
      ctx.drawImage(glCanvas, 0, 0);
      return out.toDataURL('image/png');
    } catch {
      return null;
    }
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
