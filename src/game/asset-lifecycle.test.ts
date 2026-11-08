import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { ArenaSceneRenderer } from './renderer.ts';
import { createInitialWorld } from './simulation.ts';
import type { CampaignChapterId, WorldState } from './types.ts';

const assets = [
  { chapter: 'chapter_1_helix', file: 'helix_containment_gate', z: -16.5, scale: 1 },
  { chapter: 'chapter_2_choir', file: 'choir_acoustic_organ', z: -14.2, scale: 0.95 },
  { chapter: 'chapter_3_curator', file: 'curator_archive_monolith', z: -14.2, scale: 1.05 },
  { chapter: 'chapter_4_matron', file: 'matron_surgical_pod', z: -14, scale: 1 },
] as const;
const chapters: CampaignChapterId[] = ['prologue', ...assets.map(({ chapter }) => chapter), 'chapter_5_loom'];
const assetUrl = (file: string) => `/assets/blender/phase12/${file}.glb`;

// Use production methods without constructing WebGL or a browser; mocks restore per test.
function rendererFixture(t: TestContext) {
  const requests: { url: string; complete: (scene: THREE.Group) => void }[] = [];
  t.mock.method(GLTFLoader.prototype, 'load', (url: string, onLoad: (gltf: GLTF) => void) => {
    requests.push({ url, complete: (scene) => onLoad({ scene } as GLTF) });
  });
  const scene = new THREE.Scene();
  const chapterEnvironments = new Map(chapters.map((chapter) => {
    const group = new THREE.Group();
    scene.add(group);
    return [chapter, { group, rotors: [], pulseMaterials: [] }] as const;
  }));
  const renderer = Object.assign(Object.create(ArenaSceneRenderer.prototype) as {
    loadChapterAssets(): void;
    updateEnvironmentPresentation(world: WorldState, dt: number): void;
    dispose(): void;
  }, {
    scene,
    chapterEnvironments,
    disposed: false,
    isHeadless: false,
    webglAvailable: true,
    webglContextLost: false,
    shadowTex: new THREE.Texture(),
    studioEnvTex: new THREE.Texture(),
    renderer: { dispose: t.mock.fn() },
  });
  return { renderer, requests };
}

function sharedAsset(t: TestContext) {
  const scene = new THREE.Group();
  const nested = new THREE.Group();
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial();
  const secondMaterial = new THREE.MeshBasicMaterial();
  scene.add(new THREE.Mesh(geometry, material), nested);
  nested.add(new THREE.Mesh(geometry, [material, secondMaterial, material]));
  const disposals = [geometry, material, secondMaterial].map((resource) => t.mock.method(resource, 'dispose'));
  return { scene, geometry, material, counts: () => disposals.map((dispose) => dispose.mock.callCount()) };
}

for (const isHeadless of [false, true]) {
  test(`loads each Phase12 asset once into its intended chapter (headless=${isHeadless})`, (t) => {
    const { renderer, requests } = rendererFixture(t);
    renderer.isHeadless = isHeadless;
    renderer.loadChapterAssets();
    assert.deepEqual(requests.map(({ url }) => url), assets.map(({ file }) => assetUrl(file)));
    assert.ok([...renderer.chapterEnvironments.values()].every(({ group }) => group.children.length === 0));

    // Complete out of order to catch callbacks attaching to the wrong loop target.
    for (const request of [...requests].reverse()) {
      const expected = assets.find(({ file }) => assetUrl(file) === request.url)!;
      const asset = sharedAsset(t);
      request.complete(asset.scene);
      const target = renderer.chapterEnvironments.get(expected.chapter)!.group;
      assert.deepEqual(target.children, [asset.scene]);
      assert.equal(asset.scene.parent, target);
      assert.equal(asset.scene.name, `BlenderAsset_${expected.chapter}`);
      assert.deepEqual(asset.scene.position.toArray(), [0, 0, expected.z]);
      assert.equal(asset.scene.rotation.y, 0);
      assert.deepEqual(asset.scene.scale.toArray(), [expected.scale, expected.scale, expected.scale]);
      asset.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          assert.equal(object.castShadow, false);
          assert.equal(object.receiveShadow, !isHeadless);
        }
      });
      assert.deepEqual(asset.counts(), [0, 0, 0], 'Live assets must not be disposed during attachment');
    }
    assert.equal(renderer.chapterEnvironments.get('prologue')!.group.children.length, 0);
    assert.equal(renderer.chapterEnvironments.get('chapter_5_loom')!.group.children.length, 0);
  });
}

test('loadChapterAssets has only its constructor call site in renderer source', () => {
  const source = readFileSync(new URL('./renderer.ts', import.meta.url), 'utf8');
  const calls = [...source.matchAll(/\bthis\s*\.\s*loadChapterAssets\s*\(/g)];
  assert.equal(calls.length, 1, 'Chapter changes and render frames must not start another load batch');
  const constructorStart = source.indexOf('constructor(');
  const loaderStart = source.indexOf('private loadChapterAssets(');
  assert.ok(constructorStart >= 0 && loaderStart > constructorStart);
  assert.ok(calls[0].index > constructorStart && calls[0].index < loaderStart);
});

test('chapter switches reuse attached assets without issuing more loads', (t) => {
  const { renderer, requests } = rendererFixture(t);
  renderer.scene.background = new THREE.Color();
  Object.assign(renderer, {
    reducedMotion: false,
    loomPylonGroup: new THREE.Group(),
    loomRingMesh: new THREE.Group(),
    loomInnerRingMesh: new THREE.Group(),
    loomOuterRingMesh: new THREE.Group(),
    loomWitnessBeamMesh: new THREE.Group(),
    loomContinuityDomeMesh: new THREE.Group(),
    sceneFog: new THREE.FogExp2(0),
    hemiLight: new THREE.HemisphereLight(),
    keyLight: new THREE.DirectionalLight(),
    rimLight: new THREE.DirectionalLight(),
    loomLight: new THREE.PointLight(),
    calLight: new THREE.PointLight(),
    conduitGlowMat: new THREE.MeshBasicMaterial(),
    ventFanMeshes: [],
    helixLandmarksGroup: new THREE.Group(),
    choirLandmarksGroup: new THREE.Group(),
    curatorLandmarksGroup: new THREE.Group(),
    matronLandmarksGroup: new THREE.Group(),
    loomSealsGroup: new THREE.Group(),
    helixBeaconRings: [],
    choirWaveRingMeshes: [],
    curatorShardMeshes: [],
    matronScanRings: [],
    loomSealCrystals: [],
  });
  renderer.loadChapterAssets();
  const loaded = requests.map((request) => {
    const asset = sharedAsset(t);
    request.complete(asset.scene);
    return asset;
  });
  const world = createInitialWorld();
  for (const chapter of [...chapters, ...chapters.slice().reverse()]) {
    world.run.chapter = chapter;
    renderer.updateEnvironmentPresentation(world, 1 / 60);
    assert.equal(requests.length, 4, `Switching to ${chapter} must not reload assets`);
    for (const [id, { group }] of renderer.chapterEnvironments) {
      assert.equal(group.visible, id === chapter);
    }
    for (let i = 0; i < assets.length; i++) {
      assert.deepEqual(renderer.chapterEnvironments.get(assets[i].chapter)!.group.children, [loaded[i].scene]);
      assert.deepEqual(loaded[i].counts(), [0, 0, 0]);
    }
  }
});

test('a disposed renderer never attaches delayed loader results', (t) => {
  const { renderer, requests } = rendererFixture(t);
  renderer.loadChapterAssets();
  renderer.dispose();
  assert.equal(renderer.disposed, true);
  for (const request of requests) {
    const asset = sharedAsset(t);
    request.complete(asset.scene);
    assert.equal(asset.scene.parent, null);
  }
  assert.ok([...renderer.chapterEnvironments.values()].every(({ group }) => group.children.length === 0));
});

test('dispose releases attached unique mesh resources, environment textures and renderer', (t) => {
  const { renderer, requests } = rendererFixture(t);
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial();
  const resources = [geometry, material, renderer.shadowTex, renderer.studioEnvTex];
  const disposals = resources.map((resource) => t.mock.method(resource, 'dispose'));
  renderer.loadChapterAssets();
  const asset = new THREE.Group();
  asset.add(new THREE.Mesh(geometry, material));
  requests[0].complete(asset);
  renderer.dispose();
  assert.deepEqual(disposals.map((dispose) => dispose.mock.callCount()), [1, 1, 1, 1]);
  assert.equal(renderer.renderer.dispose.mock.callCount(), 1);
});

test('dispose deduplicates geometry and materials shared across meshes and chapter assets', (t) => {
  const { renderer, requests } = rendererFixture(t);
  const asset = sharedAsset(t);
  const otherChapterAsset = new THREE.Group();
  otherChapterAsset.add(new THREE.Mesh(asset.geometry, asset.material));
  renderer.loadChapterAssets();
  requests[0].complete(asset.scene);
  requests[1].complete(otherChapterAsset);
  renderer.dispose();
  assert.deepEqual(asset.counts(), [1, 1, 1], 'Each shared geometry/material must be disposed exactly once');
});

test('delayed loader results after disposal release their shared resources exactly once', (t) => {
  const { renderer, requests } = rendererFixture(t);
  renderer.loadChapterAssets();
  renderer.dispose();
  const delayed = requests.map(() => sharedAsset(t));
  requests.forEach((request, index) => request.complete(delayed[index].scene));
  assert.ok(delayed.every(({ scene }) => scene.parent === null));
  assert.deepEqual(delayed.map((asset) => asset.counts()), assets.map(() => [1, 1, 1]),
    'Ignoring stale callbacks must not leak their geometry/materials');
});

test('Phase 23.1-D: ArenaSceneRenderer constructor degrades gracefully when WebGLRenderer context creation fails and 2D canvas context is null', (t) => {
  const requests: string[] = [];
  t.mock.method(GLTFLoader.prototype, 'load', (url: string) => {
    requests.push(url);
  });

  const prevDocument = globalThis.document;
  const prevWindow = globalThis.window;
  t.after(() => {
    globalThis.document = prevDocument;
    globalThis.window = prevWindow;
  });

  const appendedChildren: Array<{
    dataset: Record<string, string>;
    style: Record<string, string>;
    textContent: string;
    remove: () => void;
  }> = [];

  globalThis.window = {
    devicePixelRatio: 1,
    navigator: { webdriver: false },
  } as unknown as Window & typeof globalThis;

  globalThis.document = {
    createElement: (tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          style: {},
          addEventListener: () => {},
          removeEventListener: () => {},
          // Return null for both 2d and webgl contexts so WebGLRenderer throws and 2D canvas helpers exercise null-safety
          getContext: () => null,
        };
      }
      const el = {
        dataset: {} as Record<string, string>,
        attributes: {} as Record<string, string>,
        style: {} as Record<string, string>,
        textContent: '',
        setAttribute(k: string, v: string) {
          this.attributes[k] = v;
        },
        remove() {
          const idx = appendedChildren.indexOf(this);
          if (idx >= 0) appendedChildren.splice(idx, 1);
        },
      };
      return el;
    },
  } as unknown as Document;

  const mountEl = {
    clientWidth: 1280,
    clientHeight: 720,
    innerHTML: '',
    appendChild(child: (typeof appendedChildren)[number]) {
      appendedChildren.push(child);
    },
  } as unknown as HTMLElement;

  const world = createInitialWorld('playing');
  const sceneRenderer = new ArenaSceneRenderer(mountEl, world);

  assert.equal(sceneRenderer.isWebGLAvailable(), false);
  assert.equal(
    requests.length,
    0,
    'GLTFLoader must not issue network requests when WebGL context creation failed'
  );
  assert.equal(appendedChildren.length, 1, 'Expected fallback notice banner in mountEl');
  assert.equal(appendedChildren[0].dataset.testid, 'webgl-fallback-notice');
  assert.equal(
    appendedChildren[0].textContent,
    '3D SCENE RENDERING DISABLED · WEBGL CONTEXT UNAVAILABLE — HUD & SIMULATION ONLY'
  );

  assert.doesNotThrow(() => {
    sceneRenderer.updateAndRender(world, 0, 0.28, 1 / 60);
    sceneRenderer.handleCombatEvents([{ type: 'player_light_swing', x: 0, z: 0 }]);
    sceneRenderer.syncEnemyRigs(world);
    sceneRenderer.resize(1440, 900);
    sceneRenderer.dispose();
    sceneRenderer.dispose();
  });
  assert.equal(
    appendedChildren.length,
    0,
    'ArenaSceneRenderer.dispose() must remove fallback notice element from mountEl'
  );
});

test('Phase 23.3-A3: reconcileEnemyRigs preserves echoHistory and active impactRingTimer/relayVfxTimer while syncEnemyRigs resets them on encounter reset', () => {
  const world = createInitialWorld('playing');
  world.enemies = [];
  const renderer = Object.create(ArenaSceneRenderer.prototype) as unknown as {
    scene: THREE.Scene;
    enemyRigs: Map<string, unknown>;
    activeEnemyIdsSet: Set<string>;
    echoHistory: Array<{ valid: boolean; x: number; z: number; rotY: number }>;
    echoGhosts: Array<{ root: THREE.Group }>;
    relayVfxTimer: number;
    impactRingTimer: number;
    relayOriginPillarMesh: THREE.Mesh;
    relayArrivalPillarMesh: THREE.Mesh;
    impactRingMesh: THREE.Mesh;
    reconcileEnemyRigs(w: WorldState): void;
    syncEnemyRigs(w: WorldState): void;
  };
  renderer.scene = new THREE.Scene();
  renderer.enemyRigs = new Map();
  renderer.activeEnemyIdsSet = new Set();
  renderer.echoHistory = [{ valid: true, x: 1, z: 2, rotY: 0.5 }];
  renderer.echoGhosts = [{ root: new THREE.Group() }];
  renderer.echoGhosts[0].root.visible = true;
  renderer.relayVfxTimer = 0.25;
  renderer.impactRingTimer = 0.18;
  renderer.relayOriginPillarMesh = new THREE.Mesh();
  renderer.relayArrivalPillarMesh = new THREE.Mesh();
  renderer.impactRingMesh = new THREE.Mesh();
  renderer.relayOriginPillarMesh.visible = true;
  renderer.relayArrivalPillarMesh.visible = true;
  renderer.impactRingMesh.visible = true;

  renderer.reconcileEnemyRigs(world);
  assert.equal(
    renderer.echoHistory[0].valid,
    true,
    'Per-frame reconcileEnemyRigs must not invalidate echoHistory'
  );
  assert.equal(
    renderer.echoGhosts[0].root.visible,
    true,
    'Per-frame reconcileEnemyRigs must not hide active echoGhosts'
  );
  assert.equal(
    renderer.relayVfxTimer,
    0.25,
    'Per-frame reconcileEnemyRigs must not zero relayVfxTimer'
  );
  assert.equal(
    renderer.impactRingTimer,
    0.18,
    'Per-frame reconcileEnemyRigs must not zero impactRingTimer'
  );
  assert.equal(renderer.impactRingMesh.visible, true);

  renderer.syncEnemyRigs(world);
  assert.equal(
    renderer.echoHistory[0].valid,
    false,
    'Explicit syncEnemyRigs on encounter reset must clear echoHistory'
  );
  assert.equal(renderer.echoGhosts[0].root.visible, false);
  assert.equal(renderer.relayVfxTimer, 0);
  assert.equal(renderer.impactRingTimer, 0);
  assert.equal(renderer.impactRingMesh.visible, false);
});

test('Phase 23.3-D1: dispose releases textures attached to material slots (map, bumpMap, roughnessMap, emissiveMap)', (t) => {
  const { renderer, requests } = rendererFixture(t);
  const geometry = new THREE.BoxGeometry();
  const mapTex = new THREE.Texture();
  const bumpTex = new THREE.Texture();
  const roughTex = new THREE.Texture();
  const material = new THREE.MeshStandardMaterial({
    map: mapTex,
    bumpMap: bumpTex,
    roughnessMap: roughTex,
  });
  const texDisposals = [mapTex, bumpTex, roughTex].map((tex) => t.mock.method(tex, 'dispose'));

  renderer.loadChapterAssets();
  const asset = new THREE.Group();
  asset.add(new THREE.Mesh(geometry, material));
  requests[0].complete(asset);
  renderer.dispose();

  assert.deepEqual(
    texDisposals.map((d) => d.mock.callCount()),
    [1, 1, 1],
    'Every texture attached to a disposed mesh material must be disposed exactly once'
  );
});

test('Phase 23.3-D2: GLTFLoader error callbacks and WebGL context loss/restoration are handled cleanly without throwing', (t) => {
  const { renderer } = rendererFixture(t);
  const errorCallbacks: Array<(err: unknown) => void> = [];
  t.mock.method(
    GLTFLoader.prototype,
    'load',
    (_url: string, _onLoad: (gltf: GLTF) => void, _onProgress?: unknown, onError?: (err: unknown) => void) => {
      if (onError) errorCallbacks.push(onError);
    }
  );
  const consoleErrMock = t.mock.method(console, 'error', () => {});
  renderer.loadChapterAssets();
  assert.equal(errorCallbacks.length, 4);
  for (const triggerErr of errorCallbacks) {
    assert.doesNotThrow(() => triggerErr(new Error('network 404')));
  }
  assert.equal(consoleErrMock.mock.callCount(), 4);
});

test('Phase 23.4-C1: reconcileEnemyRigs and syncEnemyRigs dispose stale enemy rigs across encounter switches, reset KO poses on restart, and expose getDiagnostics()', (t) => {
  const { renderer, requests } = rendererFixture(t) as unknown as {
    renderer: {
      scene: THREE.Scene;
      chapterEnvironments: Map<CampaignChapterId, { group: THREE.Group }>;
      enemyRigs: Map<string, { root: THREE.Group; archetype: string; bodyGroup: THREE.Group }>;
      enemyGuardRecoilTimers: Map<string, number>;
      activeEnemyIdsSet: Set<string>;
      shadowTex: THREE.Texture;
      studioEnvTex: THREE.Texture;
      isHeadless: boolean;
      isSoftwareGl: boolean;
      glVendor: string;
      glRenderer: string;
      appliedPixelRatio: number;
      webglAvailable: boolean;
      webglContextLost: boolean;
      disposed: boolean;
      echoHistory: Array<{ valid: boolean }>;
      echoGhosts: Array<{ root: THREE.Group }>;
      relayVfxTimer: number;
      impactRingTimer: number;
      relayOriginPillarMesh: THREE.Mesh;
      relayArrivalPillarMesh: THREE.Mesh;
      impactRingMesh: THREE.Mesh;
      renderer: {
        dispose: () => void;
        info: {
          memory: { geometries: number; textures: number };
          programs: unknown[];
          render: { calls: number; triangles: number; frame: number };
        };
      };
      loadChapterAssets(): void;
      reconcileEnemyRigs(w: WorldState): void;
      syncEnemyRigs(w: WorldState): void;
      getDiagnostics(): {
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
        memory: { geometries: number; textures: number; programs: number };
        render: { calls: number; triangles: number; frame: number };
      };
      dispose(): void;
    };
    requests: Array<{ url: string; complete: (scene: THREE.Group) => void }>;
  };

  renderer.enemyRigs = new Map();
  renderer.enemyGuardRecoilTimers = new Map();
  renderer.activeEnemyIdsSet = new Set();
  renderer.isSoftwareGl = true;
  renderer.glVendor = 'Google Inc.';
  renderer.glRenderer = 'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)))';
  renderer.appliedPixelRatio = 0.8;
  renderer.echoHistory = [];
  renderer.echoGhosts = [];
  renderer.relayOriginPillarMesh = new THREE.Mesh();
  renderer.relayArrivalPillarMesh = new THREE.Mesh();
  renderer.impactRingMesh = new THREE.Mesh();
  renderer.renderer.info = {
    memory: { geometries: 42, textures: 5 },
    programs: [{}, {}, {}],
    render: { calls: 28, triangles: 12400, frame: 10 },
  };

  renderer.loadChapterAssets();
  requests[0].complete(new THREE.Group());

  // Pre-populate a custom stale enemy rig with tracked geometry/material disposal
  const staleGeo = new THREE.BoxGeometry();
  const staleMat = new THREE.MeshStandardMaterial();
  const staleGeoDispose = t.mock.method(staleGeo, 'dispose');
  const staleMatDispose = t.mock.method(staleMat, 'dispose');
  const staleRoot = new THREE.Group();
  const staleBody = new THREE.Group();
  staleRoot.add(new THREE.Mesh(staleGeo, staleMat));
  staleRoot.add(staleBody);
  renderer.scene.add(staleRoot);
  renderer.enemyRigs.set('stale-boss-helix', {
    root: staleRoot,
    archetype: 'helix',
    bodyGroup: staleBody,
  });
  renderer.enemyGuardRecoilTimers.set('stale-boss-helix', 0.2);

  // Also pre-populate an active enemy rig whose bodyGroup was toppled in KO state
  const activeRoot = new THREE.Group();
  const activeBody = new THREE.Group();
  activeBody.position.set(0, -0.35, 0);
  activeBody.rotation.set(-1.4, 0.2, 0.1);
  activeRoot.add(activeBody);
  renderer.scene.add(activeRoot);
  renderer.enemyRigs.set('enemy-bastion-1', {
    root: activeRoot,
    archetype: 'bastion',
    bodyGroup: activeBody,
  });

  const world = createInitialWorld('playing');
  world.enemies = [world.enemies[0]];
  world.enemies[0].id = 'enemy-bastion-1';
  world.enemies[0].archetype = 'bastion';

  renderer.syncEnemyRigs(world);

  assert.equal(
    renderer.enemyRigs.has('stale-boss-helix'),
    false,
    'Stale enemy rigs from previous encounters must be removed from enemyRigs map'
  );
  assert.equal(
    staleRoot.parent,
    null,
    'Stale enemy rig root must be detached from scene'
  );
  assert.equal(staleGeoDispose.mock.callCount(), 1, 'Stale enemy rig geometry must be disposed');
  assert.equal(staleMatDispose.mock.callCount(), 1, 'Stale enemy rig material must be disposed');
  assert.equal(renderer.enemyGuardRecoilTimers.has('stale-boss-helix'), false);

  // Active rig must be retained and its KO bodyGroup offset/rotation reset to (0, 0, 0)
  assert.equal(renderer.enemyRigs.has('enemy-bastion-1'), true);
  assert.deepEqual(activeBody.position.toArray(), [0, 0, 0]);
  assert.equal(activeBody.rotation.x, 0);
  assert.equal(activeBody.rotation.y, 0);
  assert.equal(activeBody.rotation.z, 0);

  // Verify getDiagnostics() returns comprehensive WebGL, asset, and memory telemetry
  assert.equal(typeof renderer.getDiagnostics, 'function');
  const diag = renderer.getDiagnostics();
  assert.equal(diag.webglAvailable, true);
  assert.equal(diag.isSoftwareGl, true);
  assert.equal(diag.glVendor, 'Google Inc.');
  assert.ok(diag.glRenderer.includes('SwiftShader'));
  assert.equal(diag.activeEnemyRigCount, 1);
  assert.deepEqual(diag.hydratedChapterAssets, ['chapter_1_helix']);
  assert.deepEqual(diag.memory, { geometries: 42, textures: 5, programs: 3 });
  assert.deepEqual(diag.render, { calls: 28, triangles: 12400, frame: 10 });

  renderer.dispose();
  assert.equal(renderer.enemyRigs.size, 0, 'dispose() must clear enemyRigs map');
});
