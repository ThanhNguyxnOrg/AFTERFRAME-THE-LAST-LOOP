import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { Color, Vector3 } from 'three';
import { GAME_CONFIG } from './config.ts';
import { InputController } from './input.ts';
import { ArenaSceneRenderer } from './renderer.ts';
import { createInitialWorld, stepWorld } from './simulation.ts';
import type { CampaignChapterId, ChronicleLoomEndingId, WorldState } from './types.ts';

const STORAGE_KEY = 'afterframe_camera_settings_v1';

function stubGlobal(t: TestContext, key: 'window' | 'document', value: unknown): void {
  const previous = Object.getOwnPropertyDescriptor(globalThis, key);
  Object.defineProperty(globalThis, key, { configurable: true, value });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, key, previous);
    else Reflect.deleteProperty(globalThis, key);
  });
}

function stubBrowser(t: TestContext, prefersReducedMotion = false, raw: string | null = null) {
  const stored = new Map<string, string>();
  if (raw !== null) stored.set(STORAGE_KEY, raw);
  const browser = {
    matchMedia: (query: string) => {
      assert.equal(query, '(prefers-reduced-motion: reduce)');
      return { matches: prefersReducedMotion };
    },
    localStorage: {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => { stored.set(key, value); },
    },
  };
  stubGlobal(t, 'window', browser);
  return { browser, stored };
}

function close(actual: number, expected: number): void {
  assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} should equal ${expected}`);
}

// Exercise production prototype methods without constructing WebGL, assets, or a DOM.
function rendererFixture(reducedMotion: boolean) {
  const mesh = () => ({ position: new Vector3(), rotation: { x: 0, y: 0, z: 0 }, visible: false });
  const material = () => ({ color: new Color(), opacity: 0 });
  const light = () => ({ color: new Color(), intensity: 0 });
  const chapter = () => ({ group: mesh(), rotors: [mesh(), mesh()], pulseMaterials: [material(), material()] });
  const renderer = Object.assign(Object.create(ArenaSceneRenderer.prototype) as {
    setReducedMotion(enabled: boolean): void;
    updateCameraPresentation(world: WorldState, yaw: number, pitch: number, dt: number): void;
    updateEnvironmentPresentation(world: WorldState, dt: number): void;
  }, {
    reducedMotion: false,
    titleTourAngle: 0,
    camAnchor: new Vector3(0, GAME_CONFIG.camera.anchorHeight, 0),
    currentCamPos: new Vector3(0, 8, 20),
    currentLookAt: new Vector3(0, 1.2, 8),
    currentCamDist: GAME_CONFIG.camera.distance,
    camera: {
      aspect: 16 / 9,
      position: new Vector3(),
      target: new Vector3(),
      lookAt(target: Vector3) { this.target.copy(target); },
    },
    loomPylonGroup: mesh(),
    loomRingMesh: mesh(),
    loomInnerRingMesh: mesh(),
    loomOuterRingMesh: mesh(),
    loomWitnessBeamMesh: mesh(),
    loomWitnessBeamMat: material(),
    loomContinuityDomeMesh: mesh(),
    loomContinuityDomeMat: material(),
    chapterEnvironments: new Map<CampaignChapterId, ReturnType<typeof chapter>>([
      ['prologue', chapter()], ['chapter_5_loom', chapter()],
    ]),
    scene: { background: new Color() },
    sceneFog: { color: new Color(), density: 0 },
    hemiLight: light(),
    keyLight: light(),
    rimLight: light(),
    loomLight: light(),
    calLight: light(),
    conduitGlowMat: material(),
    ventFanMeshes: [mesh(), mesh()],
    helixLandmarksGroup: mesh(),
    choirLandmarksGroup: mesh(),
    curatorLandmarksGroup: mesh(),
    matronLandmarksGroup: mesh(),
    loomSealsGroup: mesh(),
    helixBeaconRings: [],
    choirWaveRingMeshes: [],
    curatorShardMeshes: [],
    matronScanRings: [],
    loomSealCrystals: [mesh()],
    loomSealMats: [material()],
    loomSealTetherMats: [material()],
  });
  renderer.setReducedMotion(reducedMotion);
  return renderer;
}

for (const preference of [false, true]) {
  test(`reducedMotion defaults to OS preference ${preference}`, (t) => {
    const { stored } = stubBrowser(t, preference);
    assert.deepEqual(new InputController().getCameraSettings(), {
      sensitivity: 1, invertY: false, reducedMotion: preference,
    });
    assert.equal(stored.size, 0, 'Reading the OS default must not persist an override');
  });
}

for (const override of [false, true]) {
  test(`saved reducedMotion ${override} overrides the opposite OS preference`, (t) => {
    stubBrowser(t, !override, JSON.stringify({ reducedMotion: override }));
    assert.equal(new InputController().getCameraSettings().reducedMotion, override);
  });
}

test('reducedMotion persists both toggle directions and reloads with other camera settings', (t) => {
  const { stored } = stubBrowser(t, true);
  const input = new InputController();
  for (const reducedMotion of [false, true, false]) {
    const expected = { reducedMotion, sensitivity: 1.75, invertY: true };
    assert.deepEqual(input.setCameraSettings(expected), expected);
    assert.deepEqual(JSON.parse(stored.get(STORAGE_KEY)!), expected);
    assert.deepEqual(new InputController().getCameraSettings(), expected);
  }
  const copy = input.getCameraSettings();
  copy.reducedMotion = true;
  assert.equal(input.getCameraSettings().reducedMotion, false, 'Returned settings are a copy');
});

for (const raw of ['{broken', 'null', '[]', '[false]', 'false', '42', '"false"', '{}',
  '{"reducedMotion":null}', '{"reducedMotion":"false"}', '{"reducedMotion":0}',
  '{"reducedMotion":1}', '{"reducedMotion":[]}', '{"reducedMotion":{}}']) {
  test(`invalid or nonboolean saved reducedMotion retains the OS default: ${raw}`, (t) => {
    const { browser, stored } = stubBrowser(t, true, raw);
    for (const preference of [true, false]) {
      browser.matchMedia = () => ({ matches: preference });
      assert.deepEqual(new InputController().getCameraSettings(), {
        sensitivity: 1, invertY: false, reducedMotion: preference,
      });
    }
    assert.equal(stored.get(STORAGE_KEY), raw, 'Invalid storage is not rewritten on load');
  });
}

test('legacy settings and invalid reducedMotion preserve valid sensitivity and invertY', (t) => {
  const { stored } = stubBrowser(t, true);
  for (const extra of [{}, { reducedMotion: 'false' }]) {
    stored.set(STORAGE_KEY, JSON.stringify({ sensitivity: 2, invertY: true, ...extra }));
    assert.deepEqual(new InputController().getCameraSettings(), {
      sensitivity: 2, invertY: true, reducedMotion: true,
    });
  }
});

for (const mode of ['missing', 'throwing'] as const) {
  test(`OS preference ${mode} safely defaults to false`, (t) => {
    const { browser } = stubBrowser(t);
    if (mode === 'missing') Reflect.deleteProperty(browser, 'matchMedia');
    else browser.matchMedia = () => { throw new Error('unavailable'); };
    assert.equal(new InputController().getCameraSettings().reducedMotion, false);
  });
}

for (const mode of ['getter', 'methods'] as const) {
  test(`throwing storage ${mode} preserves OS default and allows an in-memory override`, (t) => {
    const { browser } = stubBrowser(t, true);
    const fail = () => { throw new Error('Storage disabled'); };
    if (mode === 'getter') Object.defineProperty(browser, 'localStorage', { get: fail });
    else {
      browser.localStorage.getItem = fail;
      browser.localStorage.setItem = fail;
    }
    const input = new InputController();
    assert.equal(input.getCameraSettings().reducedMotion, true);
    assert.equal(input.setCameraSettings({ reducedMotion: false }).reducedMotion, false);
    assert.equal(input.getCameraSettings().reducedMotion, false);
    assert.equal(new InputController().getCameraSettings().reducedMotion, true);
  });
}

test('focused title setting button Enter/Space does not launch campaign or prevent native activation', (t) => {
  stubBrowser(t);
  stubGlobal(t, 'document', { body: { dataset: { state: 'title' } } });
  const input = new InputController() as unknown as {
    handleKeyDown(event: KeyboardEvent): void;
    onStartGameCallback: () => void;
  };
  let starts = 0;
  input.onStartGameCallback = () => { starts++; };
  for (const code of ['Enter', 'Space']) {
    let prevented = false;
    const button = { tagName: 'BUTTON' };
    input.handleKeyDown({
      code,
      target: { closest: (selector: string) => {
        assert.ok(selector.split(', ').includes('button'));
        return button;
      } },
      preventDefault: () => { prevented = true; },
    } as unknown as KeyboardEvent);
    assert.equal(starts, 0);
    assert.equal(prevented, false);
  }
  for (const code of ['Enter', 'Space']) {
    let prevented = false;
    input.handleKeyDown({ code, target: { closest: () => null },
      preventDefault: () => { prevented = true; } } as unknown as KeyboardEvent);
    assert.equal(prevented, true);
  }
  assert.equal(starts, 2, 'Title background shortcuts still launch the campaign');
});

test('camera trauma shakes only with reduced motion off, without mutating world', (t) => {
  const random = t.mock.method(Math, 'random', () => 1);
  const world = createInitialWorld('playing');
  world.cameraTrauma = 0.8;
  const before = structuredClone(world);
  const renderer = rendererFixture(false);
  renderer.updateCameraPresentation(world, 0.5, 0.3, 1 / 60);
  close(renderer.camera.position.x - renderer.currentCamPos.x, 0.8 ** 2 * 0.34);
  close(renderer.camera.position.y - renderer.currentCamPos.y, 0.8 ** 2 * 0.34);
  assert.equal(random.mock.callCount(), 2);
  renderer.setReducedMotion(true);
  renderer.updateCameraPresentation(world, 0.5, 0.3, 1 / 60);
  assert.deepEqual(renderer.camera.position, renderer.currentCamPos);
  assert.deepEqual(renderer.camera.target, renderer.currentLookAt);
  assert.equal(random.mock.callCount(), 2, 'Reduced motion does not sample shake randomness');
  assert.deepEqual(world, before);
});

test('manual orbit, pitch and player follow remain identical across motion settings', (t) => {
  stubBrowser(t);
  const world = createInitialWorld('playing');
  world.obstacles = [];
  world.player.x = 0;
  world.player.z = 0;
  const renderers = [rendererFixture(false), rendererFixture(true)];
  const inputs = [new InputController(), new InputController()];
  inputs[1].setCameraSettings({ reducedMotion: true });
  for (const renderer of renderers) renderer.updateCameraPresentation(world, 0, 0.3, 1 / 60);
  const initialPosition = renderers[1].camera.position.clone();
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].rotateCameraByDelta(100, 35);
    renderers[i].updateCameraPresentation(world, inputs[i].aimYaw, inputs[i].aimPitch, 1 / 60);
  }
  assert.equal(inputs[0].aimYaw, inputs[1].aimYaw);
  assert.equal(inputs[0].aimPitch, inputs[1].aimPitch);
  assert.notDeepEqual(renderers[1].camera.position, initialPosition);
  assert.deepEqual(renderers[0].camera.position, renderers[1].camera.position);
  const beforeFollow = renderers[1].camera.position.clone();
  world.player.x = 2;
  world.player.z = 1;
  for (let i = 0; i < renderers.length; i++) {
    renderers[i].updateCameraPresentation(world, inputs[i].aimYaw, inputs[i].aimPitch, 1 / 60);
    assert.ok(renderers[i].camAnchor.x > 0 && renderers[i].camAnchor.x < 2, 'Follow remains smoothed');
  }
  assert.notDeepEqual(renderers[1].camera.position, beforeFollow);
  assert.deepEqual(renderers[0].camera.position, renderers[1].camera.position);
  assert.deepEqual(renderers[0].camera.target, renderers[1].camera.target);
});

test('title tour stops at its current angle and resumes when reduced motion is disabled', () => {
  const world = createInitialWorld('title');
  const before = structuredClone(world);
  const renderer = rendererFixture(false);
  renderer.updateCameraPresentation(world, 0, 0, 0.5);
  close(renderer.titleTourAngle, 0.11);
  renderer.setReducedMotion(true);
  for (let i = 0; i < 120; i++) renderer.updateCameraPresentation(world, 0, 0, 0.1);
  close(renderer.titleTourAngle, 0.11);
  const stoppedPosition = renderer.camera.position.clone();
  renderer.updateCameraPresentation(world, 0, 0, 0.1);
  close(renderer.camera.position.distanceTo(stoppedPosition), 0);
  renderer.setReducedMotion(false);
  renderer.updateCameraPresentation(world, 0, 0, 0.5);
  close(renderer.titleTourAngle, 0.22);
  assert.notDeepEqual(renderer.camera.position, stoppedPosition);
  assert.deepEqual(world, before);
});

for (const ending of [null, 'silence', 'witness', 'continuity'] as const) {
  test(`ambient rotation speed and pulse amplitude are 15%, preserving ending ${ending}`, () => {
    const world = createInitialWorld('playing');
    world.run.chapter = 'chapter_5_loom';
    world.run.selectedEnding = ending;
    world.elapsedTime = 7.3;
    const before = structuredClone(world);
    const reduced = rendererFixture(true);
    const normal = rendererFixture(false);
    reduced.updateEnvironmentPresentation(world, 0.4);
    normal.updateEnvironmentPresentation(world, 0.4);
    const reducedChapter = reduced.chapterEnvironments.get('chapter_5_loom')!;
    const normalChapter = normal.chapterEnvironments.get('chapter_5_loom')!;
    const rotations = (r: ReturnType<typeof rendererFixture>) => [
      r.loomRingMesh.rotation.z, r.loomRingMesh.rotation.y,
      r.loomInnerRingMesh.rotation.x, r.loomInnerRingMesh.rotation.z,
      r.loomOuterRingMesh.rotation.y, ...r.ventFanMeshes.map((fan) => fan.rotation.z),
      ...r.chapterEnvironments.get('chapter_5_loom')!.rotors.map((rotor) => rotor.rotation.y),
      r.loomWitnessBeamMesh.rotation.y, r.loomContinuityDomeMesh.rotation.y,
      ...r.loomSealCrystals.map((crystal) => crystal.rotation.y),
    ];
    rotations(reduced).forEach((value, i) => close(value, rotations(normal)[i] * 0.15));
    assert.ok(Math.abs(normal.loomRingMesh.rotation.z) > 0, 'Ambient motion actually advances');
    assert.equal(reducedChapter.group.visible, true);
    assert.equal(reduced.chapterEnvironments.get('prologue')!.group.visible, false);
    for (const r of [normal, reduced]) {
      const scale = r === reduced ? 0.15 : 1;
      const time = world.elapsedTime * scale;
      const chapter = r === reduced ? reducedChapter : normalChapter;
      chapter.pulseMaterials.forEach((mat, i) => close(mat.opacity,
        ending === 'silence' ? 0.08 : 0.28 + Math.sin(time * 2.8 + i) * 0.12 * scale));
      close(r.conduitGlowMat.opacity, ending === 'silence' ? 0.22 : 0.68 + Math.sin(time * 3.4) * 0.18 * scale);
      assert.equal(r.loomWitnessBeamMesh.visible, ending === 'witness');
      assert.equal(r.loomContinuityDomeMesh.visible, ending === 'continuity');
      if (ending === 'witness') close(r.loomWitnessBeamMat.opacity, 0.36 + Math.sin(time * 9) * 0.12 * scale);
      if (ending === 'continuity') close(r.loomContinuityDomeMat.opacity, 0.46 + Math.sin(time * 4.5) * 0.12 * scale);
    }
    assert.deepEqual(reduced.scene, normal.scene);
    assert.deepEqual(reduced.sceneFog, normal.sceneFog);
    for (const key of ['hemiLight', 'keyLight', 'rimLight', 'loomLight', 'calLight'] as const) {
      assert.deepEqual(reduced[key], normal[key], `${key} retains ending identity`);
    }
    const endingColors: Record<ChronicleLoomEndingId, number> = {
      silence: 0x475569, witness: 0xe0f2fe, continuity: 0xfbbf24,
    };
    if (ending) assert.equal(reduced.conduitGlowMat.color.getHex(), endingColors[ending]);
    assert.deepEqual(reduced.loomSealMats, normal.loomSealMats);
    reduced.loomSealTetherMats.forEach((mat, i) => {
      assert.deepEqual(mat.color, normal.loomSealTetherMats[i].color);
      const time = world.elapsedTime * 0.15;
      close(mat.opacity, ending === 'silence' ? 0.08
        : ending === 'witness' ? 0.78 + Math.sin(time * 8 + i) * 0.16 * 0.15
        : ending === 'continuity' ? 0.66 + Math.sin(time * 4 + i) * 0.14 * 0.15
        : 0.52 + Math.sin(time * 3.5 + i) * 0.15 * 0.15);
    });
    const ringScale = ending === 'silence' ? 0.08 : ending === 'witness' ? 2.45 : ending === 'continuity' ? 1.35 : 1;
    reduced.loomSealCrystals.forEach((crystal, i) => close(crystal.position.y,
      1.75 + Math.sin(world.elapsedTime * 0.15 * 2.6 + i * 1.5) * 0.12 * ringScale * 0.15));
    assert.deepEqual(world, before, 'Environment presentation does not mutate gameplay');
  });
}

test('deterministic world stepping and input frames are identical across motion settings', (t) => {
  stubBrowser(t);
  t.mock.method(Math, 'random', () => 0.75);
  const worlds = [createInitialWorld('playing'), createInitialWorld('playing')];
  const inputs = [new InputController(), new InputController()];
  const renderers = [rendererFixture(false), rendererFixture(true)];
  inputs[0].setCameraSettings({ reducedMotion: false });
  inputs[1].setCameraSettings({ reducedMotion: true });
  const initial = structuredClone(worlds[0]);
  for (let frame = 0; frame < 240; frame++) {
    const frames = inputs.map((input) => {
      input.setTouchMoveHold(frame < 120 ? 0.4 : -0.4, -1);
      input.rotateCameraByDelta(0.5, 0);
      if (frame % 45 === 0) input.triggerLightAttack();
      if (frame % 80 === 0) input.triggerDodge();
      if (frame === 20 || frame === 100) input.triggerEchoRecord();
      if (frame === 120) input.triggerEchoReplay();
      return input.consumeFrameInput(1 / 60);
    });
    assert.deepEqual(frames[0], frames[1]);
    for (let i = 0; i < worlds.length; i++) {
      stepWorld(worlds[i], frames[i], 1 / 60);
      const beforePresentation = structuredClone(worlds[i]);
      renderers[i].updateEnvironmentPresentation(worlds[i], 1 / 60);
      renderers[i].updateCameraPresentation(worlds[i], frames[i].aimYaw, frames[i].aimPitch!, 1 / 60);
      assert.deepEqual(worlds[i], beforePresentation);
    }
    assert.deepEqual(worlds[0], worlds[1], `Gameplay diverged at frame ${frame}`);
  }
  assert.ok(worlds[0].elapsedTime > initial.elapsedTime);
  assert.notDeepEqual(worlds[0].player, initial.player, 'The simulation actually advances');
});
