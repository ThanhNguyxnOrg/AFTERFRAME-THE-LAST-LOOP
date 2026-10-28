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
