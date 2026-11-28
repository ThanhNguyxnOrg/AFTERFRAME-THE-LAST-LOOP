import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { EnemyArchetype } from './types.ts';

export type MeshyAssetSlotId =
  | 'player'
  | 'phase_stalker'
  | 'chrono_mortar'
  | 'resonance_warden'
  | 'bastion'
  | 'scrapper'
  | 'scout'
  | 'helix'
  | 'warden_prime'
  | 'arena_pillar';

export interface MeshySlotSpec {
  id: MeshyAssetSlotId;
  label: string;
  shortLabel: string;
  category: 'hero' | 'enemy' | 'boss' | 'map_prop';
  targetHeight: number;
  archetype?: EnemyArchetype;
  polyBudget: string;
  recommendedSettings: string;
  meshyPrompt: string;
}

export interface MeshyNormalizationTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  rotationY: number;
}

export interface MeshyLoadedAssetSummary {
  slotId: MeshyAssetSlotId;
  fileName: string;
  meshCount: number;
  triangleCount: number;
  yawOffsetDeg: number;
}

export const MESHY_SLOT_SPECS: readonly MeshySlotSpec[] = [
  {
    id: 'player',
    label: 'Sera Venn · Chrono Rig Engineer',
    shortLabel: 'SERA VENN',
    category: 'hero',
    targetHeight: 1.85,
    polyBudget: '10k–15k tris',
    recommendedSettings: 'GLB · PBR · Standing A-Pose · No base/pedestal',
    meshyPrompt:
      'Stylized sci-fi female orbital engineer in sleek charcoal and white armored flight suit, glowing cyan circular Chrono-Rig halo backpack, cyan holographic visor, tactical boots, game-ready low-mid poly character, standing neutral A-pose facing forward, clean topology, PBR textures, no pedestal, no floor base, no background',
  },
  {
    id: 'phase_stalker',
    label: 'STALKER-V9 · Phase Blink Assassin',
    shortLabel: 'STALKER-V9',
    category: 'enemy',
    targetHeight: 1.92,
    archetype: 'phase_stalker',
    polyBudget: '8k–12k tris',
    recommendedSettings: 'GLB · PBR · Combat ready stance · No base',
    meshyPrompt:
      'Sleek cybernetic stealth assassin robot, obsidian dark titanium angular armor, twin forearm-mounted glowing violet plasma mantis blades, hooded sensor head with single cyan eye slit, back phase-thruster fins, agile predatory silhouette, sci-fi action game enemy, PBR metallic textures, no pedestal, no base',
  },
  {
    id: 'chrono_mortar',
    label: 'OBELISK-M4 · Siege Mortar Tripod',
    shortLabel: 'OBELISK-M4',
    category: 'enemy',
    targetHeight: 2.35,
    archetype: 'chrono_mortar',
    polyBudget: '8k–14k tris',
    recommendedSettings: 'GLB · PBR · Symmetrical tripod · No base',
    meshyPrompt:
      'Heavy sci-fi mechanical three-legged artillery tripod walker mech, gunmetal armored turret body, large dorsal mortar cannon barrel tilted upward, glowing amber plasma ammo canisters on flanks, industrial hazard stripes, game-ready boss minion robot, clean PBR metallic and emissive textures, no ground base',
  },
  {
    id: 'resonance_warden',
    label: 'CONDUCTOR-R2 · Harmonic Shield Drone',
    shortLabel: 'CONDUCTOR-R2',
    category: 'enemy',
    targetHeight: 1.8,
    archetype: 'resonance_warden',
    polyBudget: '6k–10k tris',
    recommendedSettings: 'GLB · PBR · Floating symmetrical construct',
    meshyPrompt:
      'Futuristic levitating sci-fi support drone construct, central glowing emerald and gold crystal octahedron core surrounded by two concentric brushed-steel gimbal rings and three floating resonator pylons, hard-surface industrial sci-fi design, PBR textures with emissive accents, no stand, no base',
  },
  {
    id: 'bastion',
    label: 'Aegis Bastion · Heavy Shield Enforcer',
    shortLabel: 'BASTION',
    category: 'enemy',
    targetHeight: 2.25,
    archetype: 'bastion',
    polyBudget: '10k–14k tris',
    recommendedSettings: 'GLB · PBR · Upright heavy stance · No base',
    meshyPrompt:
      'Bulky industrial sci-fi security juggernaut mech, dark slate and bronze heavy hydraulic armor, massive reinforced hexagonal energy riot shield on left arm, heavy shock maul on right arm, glowing amber chest reactor core, standing upright facing forward, game-ready PBR model, no pedestal',
  },
  {
    id: 'scrapper',
    label: 'Scrapper-X2 · Agile Flanker Bot',
    shortLabel: 'SCRAPPER',
    category: 'enemy',
    targetHeight: 1.65,
    archetype: 'scrapper',
    polyBudget: '6k–10k tris',
    recommendedSettings: 'GLB · PBR · Forward crouch · No base',
    meshyPrompt:
      'Fast rusted-orange and gunmetal cybernetic flanker hound-humanoid droid, digitigrade mechanical legs, jagged twin scrap-metal arc claws, glowing orange optical sensor bar, exposed cables and hydraulic pistons, gritty sci-fi arena enemy, game-ready PBR model, no base',
  },
  {
    id: 'scout',
    label: 'Pulse Scout · Hover Recon Drone',
    shortLabel: 'PULSE SCOUT',
    category: 'enemy',
    targetHeight: 1.55,
    archetype: 'scout',
    polyBudget: '5k–8k tris',
    recommendedSettings: 'GLB · PBR · Symmetrical hover drone',
    meshyPrompt:
      'Compact spherical white and matte-graphite orbital security recon drone, large glowing magenta sniper optic lens in front, twin lateral stabilizer wing fins, underslung pulse rail barrel, sleek hard-surface sci-fi design, PBR textures, no stand, no base',
  },
  {
    id: 'helix',
    label: 'Marshal HELIX-04 · Sector I Boss',
    shortLabel: 'HELIX-04',
    category: 'boss',
    targetHeight: 3.1,
    archetype: 'helix',
    polyBudget: '15k–22k tris',
    recommendedSettings: 'GLB · PBR · Heroic upright boss · No base',
    meshyPrompt:
      'Towering sci-fi orbital warden boss mech, dark titanium and brushed gold ceremonial armor, giant dual interlocking cyan-glowing gyroscopic rings mounted behind shoulders, chest reactor core behind blast shutters, heavy plasma halberd, menacing silhouette, game-ready PBR model, no pedestal',
  },
  {
    id: 'warden_prime',
    label: 'WARDEN PRIME · Sovereign Architect',
    shortLabel: 'WARDEN PRIME',
    category: 'boss',
    targetHeight: 3.4,
    archetype: 'warden_prime',
    polyBudget: '16k–24k tris',
    recommendedSettings: 'GLB · PBR · Symmetrical god-mech · No base',
    meshyPrompt:
      'Regal monolithic sci-fi AI sovereign boss mech, white porcelain and obsidian cybernetic armor with gold filigree circuitry, floating radiant cyan and gold halo crown behind winged shoulders, central chronicle loom prism core, epic final boss design, PBR textures, no base',
  },
  {
    id: 'arena_pillar',
    label: 'Nadir-9 Chrono Pillar · Arena Map Cover',
    shortLabel: 'ARENA PILLAR',
    category: 'map_prop',
    targetHeight: 3.6,
    polyBudget: '4k–8k tris',
    recommendedSettings: 'GLB · PBR · Flat bottom vertical prop',
    meshyPrompt:
      'Sci-fi orbital station structural energy conduit pillar, octagonal dark brushed-steel armored column, vertical glowing cyan plasma glass tube channels, copper cooling fins at base and capital, heavy industrial sci-fi environment prop, flat grounded bottom, clean PBR textures',
  },
];

export function getMeshySlotSpec(slotId: MeshyAssetSlotId): MeshySlotSpec {
  return MESHY_SLOT_SPECS.find((s) => s.id === slotId) ?? MESHY_SLOT_SPECS[0];
}

export function isValidMeshySlotId(value: unknown): value is MeshyAssetSlotId {
  return typeof value === 'string' && MESHY_SLOT_SPECS.some((s) => s.id === value);
}

/**
 * Pure deterministic bounding-box normalization transform for imported GLB models.
 * Scales uniformly to `targetHeight`, centers X and Z to 0, and places the lowest vertex flush at y = 0.
 */
export function computeMeshyNormalizationTransform(
  bboxMin: { x: number; y: number; z: number },
  bboxMax: { x: number; y: number; z: number },
  targetHeight: number,
  yawOffsetDeg = 0
): MeshyNormalizationTransform {
  const safeTarget = Math.max(0.25, Math.min(12, Number.isFinite(targetHeight) ? targetHeight : 1.8));
  const rawW = Math.max(0, bboxMax.x - bboxMin.x);
  const rawH = Math.max(0, bboxMax.y - bboxMin.y);
  const rawD = Math.max(0, bboxMax.z - bboxMin.z);
  const dominantAxis = rawH > 0.001 ? rawH : Math.max(rawW, rawD, 1);
  const scale = Number((safeTarget / dominantAxis).toFixed(5));

  const centerX = (bboxMin.x + bboxMax.x) * 0.5;
  const centerZ = (bboxMin.z + bboxMax.z) * 0.5;
  const minY = bboxMin.y;

  const normalizedYawDeg = (((Math.round(yawOffsetDeg) % 360) + 360) % 360);
  const rotationY = (normalizedYawDeg * Math.PI) / 180;

  return {
    scale,
    offsetX: Number((-centerX * scale).toFixed(5)),
    offsetY: Number((-minY * scale).toFixed(5)),
    offsetZ: Number((-centerZ * scale).toFixed(5)),
    rotationY,
  };
}

interface StoredMeshyEntry {
  slotId: MeshyAssetSlotId;
  fileName: string;
  template: THREE.Group;
  meshCount: number;
  triangleCount: number;
  yawOffsetDeg: number;
}

function disposeObject3DResources(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (let i = 0; i < mats.length; i++) {
      const m = mats[i];
      if (!m) continue;
      const std = m as THREE.MeshStandardMaterial;
      std.map?.dispose();
      std.normalMap?.dispose();
      std.roughnessMap?.dispose();
      std.metalnessMap?.dispose();
      std.emissiveMap?.dispose();
      std.aoMap?.dispose();
      m.dispose();
    }
  });
}

class MeshyAssetRegistryImpl {
  private readonly loader = new GLTFLoader();
  private readonly entries = new Map<MeshyAssetSlotId, StoredMeshyEntry>();
  private readonly listeners = new Set<() => void>();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => {
      try {
        fn();
      } catch {
        // Ignore subscriber errors
      }
    });
  }

  public hasSlot(slotId: MeshyAssetSlotId): boolean {
    return this.entries.has(slotId);
  }

  public getLoadedSummaries(): Partial<Record<MeshyAssetSlotId, MeshyLoadedAssetSummary>> {
    const out: Partial<Record<MeshyAssetSlotId, MeshyLoadedAssetSummary>> = {};
    this.entries.forEach((entry, key) => {
      out[key] = {
        slotId: entry.slotId,
        fileName: entry.fileName,
        meshCount: entry.meshCount,
        triangleCount: entry.triangleCount,
        yawOffsetDeg: entry.yawOffsetDeg,
      };
    });
    return out;
  }

  public async loadFromArrayBuffer(
    slotId: MeshyAssetSlotId,
    buffer: ArrayBuffer,
    fileName: string,
    yawOffsetDeg = 0
  ): Promise<MeshyLoadedAssetSummary> {
    const spec = getMeshySlotSpec(slotId);
    const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
      this.loader.parse(
        buffer,
        '',
        (parsed) => resolve(parsed),
        (err) => reject(err instanceof Error ? err : new Error(String(err)))
      );
    });

    const rawModel = gltf.scene;
    rawModel.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(rawModel);
    const norm = computeMeshyNormalizationTransform(
      box.min,
      box.max,
      spec.targetHeight,
      yawOffsetDeg
    );

    const wrapper = new THREE.Group();
    wrapper.name = `meshy-slot-${slotId}`;
    const innerPivot = new THREE.Group();
    innerPivot.name = 'meshy-yaw-pivot';
    innerPivot.rotation.y = norm.rotationY;

    rawModel.scale.setScalar(norm.scale);
    rawModel.position.set(norm.offsetX, norm.offsetY, norm.offsetZ);

    let meshCount = 0;
    let triangleCount = 0;
    rawModel.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      meshCount += 1;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const geo = mesh.geometry;
      if (geo) {
        if (geo.index) {
          triangleCount += Math.floor(geo.index.count / 3);
        } else if (geo.attributes.position) {
          triangleCount += Math.floor(geo.attributes.position.count / 3);
        }
      }
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (let i = 0; i < mats.length; i++) {
        const mat = mats[i] as THREE.MeshStandardMaterial | undefined;
        if (mat && 'envMapIntensity' in mat) {
          mat.envMapIntensity = 0.85;
        }
      }
    });

    innerPivot.add(rawModel);
    wrapper.add(innerPivot);

    const existing = this.entries.get(slotId);
    if (existing) {
      disposeObject3DResources(existing.template);
    }

    const stored: StoredMeshyEntry = {
      slotId,
      fileName,
      template: wrapper,
      meshCount,
      triangleCount,
      yawOffsetDeg: (((Math.round(yawOffsetDeg) % 360) + 360) % 360),
    };
    this.entries.set(slotId, stored);
    this.notify();

    return {
      slotId: stored.slotId,
      fileName: stored.fileName,
      meshCount: stored.meshCount,
      triangleCount: stored.triangleCount,
      yawOffsetDeg: stored.yawOffsetDeg,
    };
  }

  public async loadFromFile(
    slotId: MeshyAssetSlotId,
    file: File
  ): Promise<MeshyLoadedAssetSummary> {
    const buffer = await file.arrayBuffer();
    return this.loadFromArrayBuffer(slotId, buffer, file.name, 0);
  }

  public rotateSlotYaw(slotId: MeshyAssetSlotId, deltaDeg = 90): number | null {
    const entry = this.entries.get(slotId);
    if (!entry) return null;
    entry.yawOffsetDeg = (((entry.yawOffsetDeg + Math.round(deltaDeg)) % 360) + 360) % 360;
    const pivot = entry.template.getObjectByName('meshy-yaw-pivot');
    if (pivot) {
      pivot.rotation.y = (entry.yawOffsetDeg * Math.PI) / 180;
    }
    this.notify();
    return entry.yawOffsetDeg;
  }

  public cloneForRig(slotId: MeshyAssetSlotId): THREE.Group | null {
    const entry = this.entries.get(slotId);
    if (!entry) return null;
    return entry.template.clone(true);
  }

  public clearSlot(slotId: MeshyAssetSlotId): boolean {
    const entry = this.entries.get(slotId);
    if (!entry) return false;
    disposeObject3DResources(entry.template);
    this.entries.delete(slotId);
    this.notify();
    return true;
  }

  public clearAll(): void {
    this.entries.forEach((entry) => disposeObject3DResources(entry.template));
    this.entries.clear();
    this.notify();
  }
}

export const meshyAssetRegistry = new MeshyAssetRegistryImpl();
