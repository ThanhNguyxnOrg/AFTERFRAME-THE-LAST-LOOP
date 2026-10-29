import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GAME_CONFIG } from './config.ts';
import {
  buildArenaEnvironment,
  buildChapterEnvironment,
  createChronoPlateAndReceiverRig,
  createEchoAfterimageGhost,
  createEchoPlayerRig,
  createEnemyRig,
  createRadialShadowTexture,
  createSeraPlayerRig,
  createStudioEnvironmentTexture,
  type ChapterEnvironmentRig,
  type ChronoPlateAndReceiverRig,
  type EchoAfterimageGhost,
  type EnemyRig,
  type PlayerRig,
} from './models.ts';
import type { CampaignChapterId, CombatEvent, ObstacleCollider, WorldState } from './types.ts';

// Pre-allocated module-scope math helpers (Zero GC inside requestAnimationFrame)
const _targetAnchor = new THREE.Vector3();
const _desiredCamPos = new THREE.Vector3();
const _lookAtTarget = new THREE.Vector3();
const _dummyObj = new THREE.Object3D();
const _color = new THREE.Color();

function disposeMeshResources(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    if (Array.isArray(object.material)) {
      object.material.forEach((material) => materials.add(material));
    } else {
      materials.add(object.material);
    }
  });
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

const PARTICLE_POOL_SIZE = 96;
const ECHO_HISTORY_SIZE = 24;

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

const BLENDER_CHAPTER_ASSETS: Partial<
  Record<CampaignChapterId, { url: string; x: number; z: number; scale: number; rotationY: number }>
> = {
  chapter_1_helix: {
    url: '/assets/blender/phase12/helix_containment_gate.glb',
    x: 0,
    z: -16.5,
    scale: 1,
    rotationY: 0,
  },
  chapter_2_choir: {
    url: '/assets/blender/phase12/choir_acoustic_organ.glb',
    x: 0,
    z: -14.2,
    scale: 0.95,
    rotationY: 0,
  },
  chapter_3_curator: {
    url: '/assets/blender/phase12/curator_archive_monolith.glb',
    x: 0,
    z: -14.2,
    scale: 1.05,
    rotationY: 0,
  },
  chapter_4_matron: {
    url: '/assets/blender/phase12/matron_surgical_pod.glb',
    x: 0,
    z: -14,
    scale: 1,
    rotationY: 0,
  },
};

const CHAPTER_LOOKS: Record<
  CampaignChapterId,
  {
    background: number;
    fogDensity: number;
    hemi: number;
    key: number;
    rim: number;
    loom: number;
    conduit: number;
    practical: number;
    keyIntensity: number;
    rimIntensity: number;
    loomIntensity: number;
  }
> = {
  prologue: {
    background: 0x080d16, fogDensity: 0.0165, hemi: 0x7dd3fc, key: 0xfffbeb,
    rim: 0x38bdf8, loom: 0x22d3ee, conduit: 0x22d3ee, practical: 0xf59e0b,
    keyIntensity: 2.65, rimIntensity: 1.55, loomIntensity: 5.4,
  },
  chapter_1_helix: {
    background: 0x0c0d12, fogDensity: 0.018, hemi: 0xa5b4fc, key: 0xffedd5,
    rim: 0x38bdf8, loom: 0xf59e0b, conduit: 0x22d3ee, practical: 0xf59e0b,
    keyIntensity: 2.45, rimIntensity: 1.65, loomIntensity: 5.4,
  },
  chapter_2_choir: {
    background: 0x071217, fogDensity: 0.017, hemi: 0x67e8f9, key: 0xfff3c4,
    rim: 0xfbbf24, loom: 0x38bdf8, conduit: 0x38bdf8, practical: 0xd97706,
    keyIntensity: 2.35, rimIntensity: 1.5, loomIntensity: 5.8,
  },
  chapter_3_curator: {
    background: 0x0d0818, fogDensity: 0.019, hemi: 0xc4b5fd, key: 0xede9fe,
    rim: 0xa855f7, loom: 0xc084fc, conduit: 0xa855f7, practical: 0x7c3aed,
    keyIntensity: 2.25, rimIntensity: 1.7, loomIntensity: 6.0,
  },
  chapter_4_matron: {
    background: 0x14080d, fogDensity: 0.0185, hemi: 0xfecdd3, key: 0xfff1f2,
    rim: 0xf43f5e, loom: 0xfb7185, conduit: 0xf43f5e, practical: 0xe11d48,
    keyIntensity: 2.4, rimIntensity: 1.55, loomIntensity: 5.6,
  },
  chapter_5_loom: {
    background: 0x080d16, fogDensity: 0.0155, hemi: 0x7dd3fc, key: 0xfff7d6,
    rim: 0xfbbf24, loom: 0x22d3ee, conduit: 0x22d3ee, practical: 0xf59e0b,
    keyIntensity: 2.55, rimIntensity: 1.65, loomIntensity: 7.6,
  },
};

export class ArenaSceneRenderer {
  private renderer: THREE.WebGLRenderer;
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
  private ventFanMeshes: THREE.Mesh[];
  private conduitGlowMat: THREE.MeshBasicMaterial;
  private hemiLight: THREE.HemisphereLight;
  private keyLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private loomLight: THREE.PointLight;
  private calLight: THREE.PointLight;
  private shadowTex: THREE.CanvasTexture;
  private studioEnvTex: THREE.CanvasTexture;

  private particleInstancedMesh: THREE.InstancedMesh;
  private particles: PooledParticle[] = [];
  private nextParticleIdx = 0;

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
  private disposed = false;

  private camAnchor = new THREE.Vector3();
  private currentCamDist: number = GAME_CONFIG.camera.distance;
  private currentCamPos = new THREE.Vector3(0, 8, 20);
  private currentLookAt = new THREE.Vector3(0, 1.2, 8);
  private titleTourAngle = 0;
  private reducedMotion = false;
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

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isHeadless,
      powerPreference: 'high-performance',
    });

    const width = mountEl.clientWidth || window.innerWidth || 1280;
    const height = mountEl.clientHeight || window.innerHeight || 720;

    this.appliedPixelRatio = this.isHeadless
      ? 0.8
      : Math.min(window.devicePixelRatio || 1, GAME_CONFIG.camera.maxPixelRatio);

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.appliedPixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.22;
    this.renderer.shadowMap.enabled = !this.isHeadless;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountEl.innerHTML = '';
    mountEl.appendChild(this.renderer.domElement);

    // WebGL context loss safety listeners
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
    });

    this.scene = new THREE.Scene();
    const bgHex = 0x080d16;
    this.scene.background = new THREE.Color(bgHex);
    this.sceneFog = new THREE.FogExp2(bgHex, 0.0165);
    this.scene.fog = this.sceneFog;

    // Equirectangular Studio Reflection Map (enabled on GPU; skipped on headless SwiftShader CPU to avoid per-pixel PMREM stalls)
    this.studioEnvTex = createStudioEnvironmentTexture();
    if (!this.isHeadless) {
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
    const hemiLight = new THREE.HemisphereLight(0x7dd3fc, 0x162238, 1.48);
    hemiLight.position.set(0, 28, 0);
    this.scene.add(hemiLight);
    this.hemiLight = hemiLight;

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.65);
    keyLight.position.set(15, 25, 16);
    if (!this.isHeadless) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
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
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();

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
    this.ventFanMeshes = env.ventFanMeshes;
    this.conduitGlowMat = env.conduitGlowMat;

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
      [-13.8, -10.5],
      [13.8, -10.5],
      [-13.8, 8.5],
      [13.8, 8.5],
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
      [-13.6, -9.8],
      [13.6, -9.8],
      [-13.6, 9.0],
      [13.6, 9.0],
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
      [-13.5, -9.6],
      [13.5, -9.6],
      [-13.5, 8.8],
      [13.5, 8.8],
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
    if (!this.isHeadless) {
      this.renderer.compile(this.scene, this.camera);
    }
  }

  private loadChapterAssets(): void {
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

  public getAppliedPixelRatio(): number {
    return this.appliedPixelRatio;
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
    this.relayVfxTimer = 0;
    this.impactRingTimer = 0;
    this.relayOriginPillarMesh.visible = false;
    this.relayArrivalPillarMesh.visible = false;
    this.impactRingMesh.visible = false;

    const activeIds = new Set<string>();
    for (let i = 0; i < world.enemies.length; i++) {
      const enemy = world.enemies[i];
      activeIds.add(enemy.id);
      let rig = this.enemyRigs.get(enemy.id);
      if (rig && rig.archetype !== enemy.archetype) {
        this.scene.remove(rig.root);
        rig.root.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry?.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material?.dispose();
            }
          }
        });
        this.enemyRigs.delete(enemy.id);
        rig = undefined;
      }
      if (!rig) {
        rig = createEnemyRig(
          enemy.id,
          enemy.archetype,
          this.shadowTex,
          !this.isHeadless
        );
        this.scene.add(rig.root);
        this.enemyRigs.set(enemy.id, rig);
      }
      rig.root.visible = true;
    }

    for (const [id, rig] of this.enemyRigs.entries()) {
      if (!activeIds.has(id)) {
        rig.root.visible = false;
        this.enemyGuardRecoilTimers.delete(id);
      }
    }
  }

  private clearEchoHistory(): void {
    for (let i = 0; i < ECHO_HISTORY_SIZE; i++) {
      this.echoHistory[i].valid = false;
    }
    this.echoHistoryHead = 0;
    this.echoSampleTimer = 0;
    for (let i = 0; i < this.echoGhosts.length; i++) {
      this.echoGhosts[i].root.visible = false;
    }
  }

  private triggerImpactRing(
    x: number,
    y: number,
    z: number,
    hexColor: number,
    duration = 0.26
  ): void {
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
    _color.setHex(hexColor);
    for (let i = 0; i < count; i++) {
      const p = this.particles[this.nextParticleIdx];
      this.nextParticleIdx = (this.nextParticleIdx + 1) % PARTICLE_POOL_SIZE;
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
    }
  }

  public handleCombatEvents(events: CombatEvent[]): void {
    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      switch (ev.type) {
        case 'player_light_swing':
          this.spawnBurst(ev.x, 1.1, ev.z, 6, 0x22d3ee, 4.2);
          break;
        case 'player_heavy_charge_ready':
          this.spawnBurst(ev.x, 1.0, ev.z, 12, 0xf59e0b, 4.8);
          this.triggerImpactRing(ev.x, 0.14, ev.z, 0xf59e0b, 0.24);
          break;
        case 'player_heavy_swing':
          this.spawnBurst(ev.x, 1.1, ev.z, 16, 0x38bdf8, 7.0);
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
            this.triggerImpactRing(ev.x, 1.15, ev.z, 0xf59e0b, 0.22);
          } else if (ev.isHeavy || ev.isCriticalOrVulnerable) {
            this.triggerImpactRing(
              ev.x,
              1.1,
              ev.z,
              ev.isCriticalOrVulnerable ? 0xffffff : 0x22d3ee,
              0.28
            );
          }
          break;
        case 'enemy_staggered':
        case 'boss_staggered':
          this.spawnBurst(ev.x, 1.5, ev.z, 24, 0xffffff, 8.8);
          this.spawnBurst(ev.x, 1.3, ev.z, 14, 0x22d3ee, 7.2);
          this.triggerImpactRing(ev.x, 0.18, ev.z, 0xffffff, 0.38);
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
          break;
        case 'boss_shockwave_burst':
          this.spawnBurst(ev.x, 0.35, ev.z, 28, 0xf59e0b, 9.8);
          this.triggerImpactRing(ev.x, 0.16, ev.z, 0xef4444, 0.42);
          break;
        case 'boss_core_exposed':
          this.spawnBurst(ev.x, 1.55, ev.z, 16, 0xffffff, 6.2);
          this.triggerImpactRing(ev.x, 1.35, ev.z, 0x22d3ee, 0.28);
          break;
        case 'boss_phase_transition':
          this.spawnBurst(ev.x, 1.65, ev.z, 32, 0xef4444, 10.4);
          this.spawnBurst(ev.x, 1.85, ev.z, 20, 0xf59e0b, 8.2);
          this.triggerImpactRing(ev.x, 0.24, ev.z, 0xef4444, 0.48);
          break;
        case 'boss_defeated':
          this.spawnBurst(ev.x, 1.6, ev.z, 36, 0xffffff, 11.0);
          this.spawnBurst(ev.x, 1.35, ev.z, 26, 0x22d3ee, 9.2);
          this.triggerImpactRing(ev.x, 0.24, ev.z, 0x22d3ee, 0.52);
          break;
        case 'player_parry_success':
          this.spawnBurst(ev.x, 1.2, ev.z, 18, 0x38bdf8, 8.0);
          this.triggerImpactRing(ev.x, 1.15, ev.z, 0xe0f2fe, 0.3);
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
            this.relayOriginPillarMesh.position.set(ev.originX, 1.4, ev.originZ);
            this.relayOriginPillarMesh.visible = true;
          }
          this.spawnBurst(ev.x, 1.0, ev.z, 24, 0xe0f2fe, 7.6);
          this.relayArrivalPillarMesh.position.set(ev.x, 1.4, ev.z);
          this.relayArrivalPillarMesh.visible = true;
          this.relayVfxTimer = 0.32;
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
          break;
        case 'chronicle_loom_ending_selected':
          this.spawnBurst(0, 2.2, -2, 32, 0x22d3ee, 9.5);
          this.triggerImpactRing(0, 0.2, -2, 0xffffff, 0.5);
          break;
        case 'weapon_switched':
          this.spawnBurst(
            ev.x,
            1.15,
            ev.z,
            8,
            ev.weaponId === 'pulsecaster' ? 0x38bdf8 : 0x22d3ee,
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
        case 'pulse_overheated':
          this.spawnBurst(ev.x, 1.2, ev.z, 14, 0xef4444, 5.5);
          break;
        case 'pulse_overheat_cleared':
          this.spawnBurst(ev.x, 1.15, ev.z, 8, 0x22d3ee, 3.6);
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
      }
    }
  }

  private updateParticles(dt: number): void {
    let anyChanged = false;
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
      _color.setRGB(p.r, p.g, p.b);
      this.particleInstancedMesh.setColorAt(i, _color);
    }

    if (anyChanged) {
      this.particleInstancedMesh.instanceMatrix.needsUpdate = true;
      if (this.particleInstancedMesh.instanceColor) {
        this.particleInstancedMesh.instanceColor.needsUpdate = true;
      }
    }
  }

  public setReducedMotion(enabled: boolean): void {
    this.reducedMotion = enabled;
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

    // Chapter architecture and lighting remain presentation-only.
    const ch = world.run.chapter;
    for (let i = 0; i < CHAPTER_IDS.length; i++) {
      const chapterEnv = this.chapterEnvironments.get(CHAPTER_IDS[i]);
      if (!chapterEnv) continue;
      chapterEnv.group.visible = CHAPTER_IDS[i] === ch;
      if (chapterEnv.group.visible) {
        for (let r = 0; r < chapterEnv.rotors.length; r++) {
          chapterEnv.rotors[r].rotation.y += ambientDt * (r % 2 === 0 ? 0.46 : -0.34) * ringSpeedScale;
        }
        for (let m = 0; m < chapterEnv.pulseMaterials.length; m++) {
          chapterEnv.pulseMaterials[m].opacity =
            selectedEnding === 'silence' ? 0.08 : 0.28 + Math.sin(ambientTime * 2.8 + m) * 0.12 * ambientScale;
        }
      }
    }

    const look = CHAPTER_LOOKS[ch];
    (this.scene.background as THREE.Color).setHex(look.background);
    this.sceneFog.color.setHex(look.background);
    this.sceneFog.density = look.fogDensity;
    this.hemiLight.color.setHex(look.hemi);
    this.keyLight.color.setHex(look.key);
    this.keyLight.intensity = look.keyIntensity;
    this.rimLight.color.setHex(look.rim);
    this.rimLight.intensity = look.rimIntensity;
    this.loomLight.color.setHex(look.loom);
    this.loomLight.intensity = look.loomIntensity;
    this.calLight.color.setHex(look.practical);
    this.conduitGlowMat.color.setHex(look.conduit);

    if (ch === 'chapter_5_loom' && selectedEnding) {
      if (selectedEnding === 'silence') {
        (this.scene.background as THREE.Color).setHex(0x05070a);
        this.sceneFog.color.setHex(0x05070a);
        this.sceneFog.density = 0.022;
        this.hemiLight.color.setHex(0x64748b);
        this.keyLight.color.setHex(0x94a3b8);
        this.keyLight.intensity = 1.2;
        this.rimLight.color.setHex(0x475569);
        this.loomLight.color.setHex(0x475569);
        this.loomLight.intensity = 1.25;
        this.conduitGlowMat.color.setHex(0x475569);
      } else if (selectedEnding === 'witness') {
        this.hemiLight.color.setHex(0xe0f2fe);
        this.keyLight.color.setHex(0xf0f9ff);
        this.keyLight.intensity = 2.8;
        this.rimLight.color.setHex(0x38bdf8);
        this.loomLight.color.setHex(0xffffff);
        this.loomLight.intensity = 10.5;
        this.conduitGlowMat.color.setHex(0xe0f2fe);
      } else if (selectedEnding === 'continuity') {
        this.hemiLight.color.setHex(0xfef3c7);
        this.keyLight.color.setHex(0xfffbeb);
        this.keyLight.intensity = 2.65;
        this.rimLight.color.setHex(0xf59e0b);
        this.loomLight.color.setHex(0xfbbf24);
        this.loomLight.intensity = 8.2;
        this.conduitGlowMat.color.setHex(0xfbbf24);
      }
    }

    for (let i = 0; i < this.ventFanMeshes.length; i++) {
      this.ventFanMeshes[i].rotation.z += ambientDt * (2.6 + (i % 2) * 0.6) * ringSpeedScale;
    }
    this.conduitGlowMat.opacity =
      selectedEnding === 'silence'
        ? 0.22
        : 0.68 + Math.sin(ambientTime * 3.4) * 0.18 * ambientScale;

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

  }

  public updateAndRender(
    world: WorldState,
    aimYaw: number,
    aimPitch: number,
    dt: number,
    shouldRender = true
  ): void {
    const poseAlpha = 1 - Math.exp(-26 * dt);
    this.updateEnvironmentPresentation(world, dt);

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

    // Rotate Dorsal Chrono Rig harmonic rings
    this.playerRig.chronoRingMesh.rotation.z += dt * 0.92;
    this.playerRig.chronoInnerRingMesh.rotation.z -= dt * 1.55;

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

    const isPulsecaster = p.equippedWeaponId === 'pulsecaster';

    // Visually distinguish active weapon on Sera's rig
    if (isPulsecaster) {
      this.playerRig.bladeMesh.scale.set(0.72, 0.72, 0.28);
      this.playerRig.bladeMaterial.emissiveIntensity = 0.42;
      if (p.weaponOverheated) {
        this.playerRig.pulsecasterMaterial.color.setHex(0xfca5a5);
        this.playerRig.pulsecasterMaterial.emissive.setHex(0xef4444);
        this.playerRig.pulsecasterMaterial.emissiveIntensity = 2.4;
      } else if (p.actionState === 'charging_heavy' || p.actionState.startsWith('heavy_')) {
        this.playerRig.pulsecasterMaterial.color.setHex(0xfde68a);
        this.playerRig.pulsecasterMaterial.emissive.setHex(0xf59e0b);
        this.playerRig.pulsecasterMaterial.emissiveIntensity = 2.5;
      } else {
        this.playerRig.pulsecasterMaterial.color.setHex(0xe0f2fe);
        this.playerRig.pulsecasterMaterial.emissive.setHex(0x38bdf8);
        this.playerRig.pulsecasterMaterial.emissiveIntensity = 2.15;
      }
      // Ready the left-forearm Pulsecaster forward in neutral/moving states
      targetLeftArmX = -0.58 - swing * 0.18;
      targetLeftArmY = 0.16;
      targetLeftArmZ = -0.14;
      targetLeftForearmX = -0.44;
      targetRightArmX = 0.18 + swing * 0.24;
      targetRightArmY = -0.12;
      targetRightArmZ = 0.14;
      targetRightForearmX = -0.48;
    } else {
      this.playerRig.bladeMesh.scale.set(1, 1, 1);
      this.playerRig.bladeMaterial.emissiveIntensity = 1.72;
      this.playerRig.pulsecasterMaterial.color.setHex(0x67e8f9);
      this.playerRig.pulsecasterMaterial.emissive.setHex(0x06b6d4);
      this.playerRig.pulsecasterMaterial.emissiveIntensity = 0.85;
    }

    if (p.hurtFlashTimer > 0) {
      this.playerRig.bladeMaterial.emissive.setHex(0xef4444);
    } else if (p.actionState === 'charging_heavy' || p.actionState.startsWith('heavy_')) {
      this.playerRig.bladeMaterial.emissive.setHex(0xf59e0b);
    } else {
      this.playerRig.bladeMaterial.emissive.setHex(0x06b6d4);
    }

    switch (p.actionState) {
      case 'charging_heavy': {
        const threshold = isPulsecaster
          ? GAME_CONFIG.weapons.pulsecaster.heavyShot.chargeThreshold
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
          this.playerRig.slashArcMaterial.color.setHex(0x22d3ee);
          this.playerRig.slashArcMaterial.opacity = 0.84;
          this.playerRig.slashArcMesh.scale.setScalar(1.04);
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
          this.playerRig.slashArcMaterial.color.setHex(0x38bdf8);
          this.playerRig.slashArcMaterial.opacity = 0.88;
          this.playerRig.slashArcMesh.scale.set(-1.08, 1.08, 1.08);
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
          this.playerRig.slashArcMaterial.color.setHex(0xe0f2fe);
          this.playerRig.slashArcMaterial.opacity = 0.96;
          this.playerRig.slashArcMesh.scale.setScalar(1.32);
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
          p.isEmpoweredHeavy ? 0xf59e0b : 0x38bdf8
        );
        this.playerRig.slashArcMaterial.opacity = 0.96;
        this.playerRig.slashArcMesh.scale.setScalar(1.38);
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

      const echoPulsecaster = actor.weaponId === 'pulsecaster';
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

      // Sample Echo pose into circular history buffer every 25ms for Temporal Afterimage Ghosts
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
    } else {
      this.echoRig.root.visible = false;
      for (let g = 0; g < this.echoGhosts.length; g++) {
        this.echoGhosts[g].root.visible = false;
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
    this.syncEnemyRigs(world);

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

      if (rig.ramLaneGroup) rig.ramLaneGroup.visible = false;
      if (rig.sweepSectorGroup) rig.sweepSectorGroup.visible = false;
      if (rig.slamShockwaveRing) rig.slamShockwaveRing.visible = false;

      // KO topple transition
      if (enemy.aiState === 'ko') {
        rig.bodyGroup.rotation.x = -enemy.koProgress * (Math.PI * 0.46);
        rig.bodyGroup.position.y = -enemy.koProgress * 0.35;
        rig.telegraphDiscMaterial.opacity = 0;
        rig.telegraphRingMaterial.opacity = 0;
        rig.coreRimMaterial.opacity = 0;
        if (rig.laserSightMaterial) rig.laserSightMaterial.opacity = 0;
        rig.coreMaterial.color.setHex(0x334155);
        rig.coreMaterial.emissive.setHex(0x0f172a);
        continue;
      }

      if (
        enemy.archetype === 'helix' ||
        enemy.archetype === 'choir' ||
        enemy.archetype === 'curator' ||
        enemy.archetype === 'matron'
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
        } else if (bState === 'telegraph') {
          const locked = Boolean(boss?.telegraphLocked);
          const teleColor = locked ? 0xef4444 : 0xf59e0b;

          if (bAttack === 'vector_ram') {
            if (rig.ramLaneGroup && rig.ramLaneFillMat && rig.ramLaneBorderMat) {
              rig.ramLaneGroup.visible = true;
              rig.ramLaneGroup.position.set(0, 0.028, 0);
              rig.ramLaneFillMat.color.setHex(teleColor);
              rig.ramLaneFillMat.opacity = 0.18 + progress * 0.32;
              rig.ramLaneBorderMat.color.setHex(locked ? 0xffffff : 0xef4444);
              rig.ramLaneBorderMat.opacity = 0.65 + progress * 0.35;
            }
            rig.bodyGroup.position.y = -0.1 * progress;
            rig.bodyGroup.rotation.set(0.24 * progress, 0, 0);
            if (rig.torsoPivot) {
              rig.torsoPivot.rotation.set(0.22 * progress, 0.15 * progress, 0);
            }
            rig.weaponPivot.rotation.set(0.45 * progress, 0.25 * progress, -0.15 * progress);
            rig.secondaryPivot.rotation.set(-0.45 * progress, -0.35 * progress, 0.2 * progress);
          } else if (bAttack === 'helical_sweep') {
            if (rig.sweepSectorGroup && rig.sweepSectorFillMat && rig.sweepSectorRimMat) {
              rig.sweepSectorGroup.visible = true;
              rig.sweepSectorFillMat.color.setHex(teleColor);
              rig.sweepSectorFillMat.opacity = 0.18 + progress * 0.3;
              rig.sweepSectorRimMat.color.setHex(locked ? 0xffffff : 0xef4444);
              rig.sweepSectorRimMat.opacity = 0.68 + progress * 0.32;
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
              rig.ramLaneFillMat.opacity = 0.36 * (1 - progress * 0.6);
              rig.ramLaneBorderMat.color.setHex(0xffffff);
              rig.ramLaneBorderMat.opacity = 0.85 * (1 - progress * 0.5);
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
              rig.sweepSectorFillMat.opacity = 0.45 * (1 - progress * 0.5);
              rig.sweepSectorRimMat.color.setHex(0xffffff);
              rig.sweepSectorRimMat.opacity = 0.92 * (1 - progress * 0.4);
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
          if (enemy.archetype === 'bastion') {
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

      if (enemy.archetype === 'scout') {
        const hoverPhase = world.elapsedTime * 3.8 + enemy.x * 0.4;
        rig.bodyGroup.position.y =
          Math.sin(hoverPhase) * 0.14 + Math.cos(hoverPhase * 1.9) * 0.04;
        rig.bodyGroup.rotation.x = isEnemyMoving ? 0.14 : Math.sin(hoverPhase * 0.7) * 0.04;
        rig.bodyGroup.rotation.z = Math.cos(hoverPhase * 0.85) * 0.06;
        const gyroRate =
          enemy.aiState === 'telegraph' ? 4.8 : enemy.aiState === 'recovery' ? 0.45 : 1.65;
        rig.secondaryPivot.rotation.y += dt * gyroRate;
      } else if (enemy.archetype === 'bastion' || enemy.archetype === 'eraser') {
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
        rig.telegraphDiscMaterial.opacity = 0.16 + progress * 0.28;
        rig.telegraphDisc.scale.setScalar(Math.max(0.1, progress));
        rig.telegraphRingMaterial.color.setHex(isLocked ? 0xef4444 : 0xf59e0b);
        rig.telegraphRingMaterial.opacity = 0.58 + progress * 0.4;

        if (enemy.archetype === 'bastion') {
          // Bastion raises heavy shock-maul high overhead while planting legs
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
        if (enemy.archetype === 'bastion') {
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

      // Hit-flash recoil jolt on enemy chassis
      if (enemy.hitFlashTimer > 0) {
        const hitRatio = Math.min(1, enemy.hitFlashTimer / 0.14);
        rig.bodyGroup.rotation.x -= 0.2 * hitRatio;
        if (rig.torsoPivot) {
          rig.torsoPivot.rotation.x -= 0.18 * hitRatio;
        }
      }
    }

    // Phase 14: Sync Pooled Pulsecaster Projectile Meshes
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
      if (proj.isHeavy) {
        pRig.group.scale.set(1.35, 1.35, 1.75);
        pRig.coreMat.color.setHex(0xffffff);
        pRig.haloMat.color.setHex(
          proj.owner === 'echo'
            ? 0x38bdf8
            : proj.isEmpowered
              ? 0xf59e0b
              : 0x22d3ee
        );
        pRig.haloMat.opacity = 0.68;
      } else {
        pRig.group.scale.set(1, 1, 1);
        pRig.coreMat.color.setHex(proj.owner === 'echo' ? 0xbae6fd : 0xe0f2fe);
        pRig.haloMat.color.setHex(proj.owner === 'echo' ? 0x38bdf8 : 0x22d3ee);
        pRig.haloMat.opacity = 0.48;
      }
    }

    this.updateParticles(dt);

    this.updateCameraPresentation(world, aimYaw, aimPitch, dt);

    if (shouldRender) {
      this.renderer.render(this.scene, this.camera);
    }
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
    const shakeMag = this.reducedMotion ? 0 : world.cameraTrauma * world.cameraTrauma * 0.34;
    const shakeX = shakeMag > 0.001 ? (Math.random() * 2 - 1) * shakeMag : 0;
    const shakeY = shakeMag > 0.001 ? (Math.random() * 2 - 1) * shakeMag : 0;

    this.camera.position.set(
      this.currentCamPos.x + shakeX,
      this.currentCamPos.y + shakeY,
      this.currentCamPos.z
    );
    this.camera.lookAt(this.currentLookAt);
  }

  public resize(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.fov = this.camera.aspect < 0.75 ? 60 : 52;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose(): void {
    this.disposed = true;
    disposeMeshResources(this.scene);
    this.shadowTex.dispose();
    this.studioEnvTex.dispose();
    this.renderer.dispose();
  }
}
