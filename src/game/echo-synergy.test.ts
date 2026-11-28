import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ECHO_DOCTRINE_SPECS,
  VALID_ECHO_DOCTRINE_IDS,
  addTwinSyncBonus,
  createInitialTwinSyncState,
  cycleNextEchoDoctrineId,
  formatEchoDoctrineHudBadge,
  getEchoDoctrineSpec,
  getTwinSyncModifiers,
  isPincerFlankGeometry,
  isValidEchoDoctrineId,
  normalizeEchoDoctrineId,
  registerTwinSyncCombatHit,
  tickTwinSyncState,
} from './echo-synergy.ts';
import {
  applyDamageToPlayer,
  applyLoadoutPreset,
  attemptEchoRelay,
  createEmptyInput,
  createInitialWorld,
  cycleEchoDoctrine,
  extractHudSnapshot,
  loadCampaignProgressFromStorage,
  saveCampaignProgressToStorage,
  saveLoadoutPreset,
  setEchoDoctrine,
  setSentinelProtocol,
  stepWorld,
} from './simulation.ts';

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

test('isPincerFlankGeometry detects opposite-side flanking and rejects same-side stacking', () => {
  // Sera north of enemy, Echo south of enemy -> true pincer
  assert.equal(isPincerFlankGeometry(0, 3, 0, -3, 0, 0), true);
  // Sera & Echo side-by-side on north -> not a pincer
  assert.equal(isPincerFlankGeometry(-0.5, 3, 0.5, 3, 0, 0), false);
});

test('registerTwinSyncCombatHit climbs through Sync tiers I -> II -> III on coordinated pincer strikes', () => {
  const state = createInitialTwinSyncState();

  const h1 = registerTwinSyncCombatHit(state, 'echo', 1.0, true, false);
  assert.equal(h1.tierUp, false);
  assert.equal(state.charge, 8);

  // Player strikes within 1.25s from opposite side -> Pincer bonus (+28 -> 36 = Tier 1)
  const h2 = registerTwinSyncCombatHit(state, 'player', 1.4, true, true);
  assert.equal(h2.pincerTriggered, true);
  assert.equal(h2.tierUp, true);
  assert.equal(h2.newTier, 1);
  assert.equal(state.totalPincers, 1);
  assert.equal(getTwinSyncModifiers(state).damageMult, 1.15);

  // Two more pincer strikes reach Tier III Singularity
  registerTwinSyncCombatHit(state, 'echo', 1.8, true, true);
  const h4 = registerTwinSyncCombatHit(state, 'player', 2.1, true, true);
  assert.equal(h4.newTier, 3);
  assert.equal(getTwinSyncModifiers(state).damageMult, 1.35);
  assert.equal(state.peakTier, 3);
});

test('tickTwinSyncState builds passive link hum while Echo is active and decays cleanly when Echo ends', () => {
  const state = createInitialTwinSyncState();
  addTwinSyncBonus(state, 55, true);
  assert.equal(state.tier, 2);

  // Active Echo within tactical tether range sustains & builds charge
  tickTwinSyncState(state, 2.0, true, 5.0);
  assert.ok(state.charge > 55);
  assert.equal(state.linkActive, true);

  // When Echo ends, link drops immediately and charge decays
  tickTwinSyncState(state, 2.0, false, 99);
  assert.equal(state.linkActive, false);
  assert.equal(getTwinSyncModifiers(state).damageMult, 1.0);
  assert.ok(state.charge < 55);
});

test('Echo Behavioral Doctrine registry normalizes, cycles [0], and formats EN/VI badges deterministically', () => {
  assert.deepEqual(VALID_ECHO_DOCTRINE_IDS, ['standard', 'vanguard', 'bastion', 'nova']);
  assert.equal(isValidEchoDoctrineId('vanguard'), true);
  assert.equal(isValidEchoDoctrineId('invalid_doctrine'), false);
  assert.equal(normalizeEchoDoctrineId(undefined), 'standard');
  assert.equal(normalizeEchoDoctrineId('bastion'), 'bastion');

  assert.equal(cycleNextEchoDoctrineId('standard'), 'vanguard');
  assert.equal(cycleNextEchoDoctrineId('vanguard'), 'bastion');
  assert.equal(cycleNextEchoDoctrineId('bastion'), 'nova');
  assert.equal(cycleNextEchoDoctrineId('nova'), 'standard');

  assert.equal(formatEchoDoctrineHudBadge('vanguard', 'en'), '[0] VANGUARD');
  assert.equal(formatEchoDoctrineHudBadge('vanguard', 'vi'), '[0] TIÊN PHONG');
  assert.equal(getEchoDoctrineSpec('nova').novaPulseDamage, 22);
  assert.equal(Object.isFrozen(ECHO_DOCTRINE_SPECS), true);
  assert.equal(Object.isFrozen(ECHO_DOCTRINE_SPECS.bastion), true);
});

test('Vanguard & Bastion doctrines scale Twin-Sync charge gain (+25%) and decay (-30%)', () => {
  const stdState = createInitialTwinSyncState();
  const vanState = createInitialTwinSyncState();
  registerTwinSyncCombatHit(stdState, 'echo', 1.0, true, false, 'standard');
  registerTwinSyncCombatHit(vanState, 'echo', 1.0, true, false, 'vanguard');
  assert.equal(stdState.charge, 8);
  assert.equal(vanState.charge, 10); // 8 * 1.25 = 10

  // Bastion reduces Twin-Sync decay by 30% (0.7x)
  const stdDecay = createInitialTwinSyncState();
  const basDecay = createInitialTwinSyncState();
  addTwinSyncBonus(stdDecay, 80, true);
  addTwinSyncBonus(basDecay, 80, true);
  tickTwinSyncState(stdDecay, 2.0, false, 20.0, 'standard');
  tickTwinSyncState(basDecay, 2.0, false, 20.0, 'bastion');
  assert.equal(stdDecay.charge, 80 - 36); // 18/s * 2s = 36
  assert.ok(Math.abs(basDecay.charge - (80 - 36 * 0.7)) < 1e-6);
});

test('Bastion Doctrine projects 9.5m Temporal Tether granting +4.5/s Ward regen, +2.0/s Flux regen, and -18% incoming damage', () => {
  const world = createInitialWorld('playing');
  // Enable AEGIS sentinel so Sera has Max Chrono Ward capacity (30)
  setSentinelProtocol(world, 'aegis');
  setEchoDoctrine(world, 'bastion');
  assert.equal(world.progression.echoDoctrine, 'bastion');

  // Clear enemies so we measure pure Bastion tether regeneration cleanly
  world.enemies = [];
  const aegis = world.chronoAegis!;
  aegis.ward = 10;
  aegis.rechargeDelayTimer = 9.0; // normal Ward regen paused, only Bastion tether active
  world.player.flux = 20;

  // Record a short stationary Echo clip and start playback right next to Sera (< 9.5m)
  const recInp = createEmptyInput();
  recInp.echoRecordJustPressed = true;
  stepWorld(world, recInp, 0.05);
  assert.equal(world.echo.state, 'recording');
  for (let i = 0; i < 12; i++) {
    stepWorld(world, createEmptyInput(), 0.05);
  }
  stepWorld(world, recInp, 0.05); // stop recording -> ready
  assert.equal(world.echo.state, 'ready');

  const playInp = createEmptyInput();
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.05);
  assert.equal(world.echo.state, 'playback');

  const wardBefore = aegis.ward;
  const fluxBefore = world.player.flux;
  for (let i = 0; i < 8; i++) {
    stepWorld(world, createEmptyInput(), 0.05);
  }
  assert.ok(
    aegis.ward >= wardBefore + 1.7,
    `Expected Bastion tether Ward regen (+4.5/s * 0.4s = +1.8), got ${aegis.ward - wardBefore}`
  );
  assert.ok(
    world.player.flux >= fluxBefore + 0.75,
    `Expected Bastion tether Flux regen (+2.0/s * 0.4s = +0.8), got ${world.player.flux - fluxBefore}`
  );

  // Verify Bastion -18% incoming damage reduction while tethered (clear Ward so HP takes direct hit)
  aegis.ward = 0;
  world.player.integrity = 100;
  world.player.invulnTimer = 0;
  applyDamageToPlayer(world, 30);
  // 30 * 0.82 = 24.6 -> rounds to 25 (vs 30 on Standard)
  assert.ok(
    world.player.integrity >= 75,
    `Expected Bastion tether -18% incoming damage reduction, integrity=${world.player.integrity}`
  );
});

test('Nova Doctrine unleashes 4.4m Temporal Rift Pulse on [Y] Replay & [V] Relay with 1.8s ICD and -25% Collapse cooldown', () => {
  const world = createInitialWorld('playing');
  setEchoDoctrine(world, 'nova');
  world.player.x = 0;
  world.player.z = 5.0;
  world.player.flux = 100;

  // Position a hostile enemy 3.2m from the Echo spawn point (inside 4.4m Nova radius)
  const target = world.enemies[0];
  for (let i = 1; i < world.enemies.length; i++) {
    world.enemies[i].x = 24;
    world.enemies[i].z = 24;
  }
  target.x = 3.2;
  target.z = 5.0;
  target.stagger = 0;
  const hpBeforeReplay = target.hp;
  const distBeforeReplay = Math.hypot(target.x - 0, target.z - 5.0);

  // Record a short Echo at (0, 5.0), then walk Sera away to (-4.0, 5.0) and press [Y] Replay
  const recInp = createEmptyInput();
  recInp.echoRecordJustPressed = true;
  stepWorld(world, recInp, 0.05);
  for (let i = 0; i < 15; i++) {
    stepWorld(world, createEmptyInput(), 0.05);
  }
  // Stop recording early by pressing [T] again
  stepWorld(world, recInp, 0.05);
  assert.equal(world.echo.state, 'ready');

  world.player.x = -4.0;
  world.player.z = 5.0;
  world.events = [];

  const playInp = createEmptyInput();
  playInp.echoPlayJustPressed = true;
  stepWorld(world, playInp, 0.02);

  assert.equal(world.echo.state, 'playback');
  assert.ok(world.events.some((ev) => ev.type === 'echo_doctrine_nova_pulse'));
  assert.ok(target.hp < hpBeforeReplay, 'Nova pulse on [Y] Replay must deal AoE damage');
  assert.ok(target.stagger >= 18, 'Nova pulse must inflict +18 Stagger');
  const distAfterReplay = Math.hypot(target.x - 0, target.z - 5.0);
  assert.ok(distAfterReplay < distBeforeReplay, 'Nova pulse must pull enemies inward toward the rift');
  assert.ok((world.echo.novaPulseCooldownTimer ?? 0) > 1.5, 'Nova 1.8s ICD timer must arm');

  // Immediate [V] Relay while ICD > 0 must NOT double-trigger Nova pulse
  world.events = [];
  const relayedDuringIcd = attemptEchoRelay(world);
  assert.equal(relayedDuringIcd, true);
  assert.equal(world.events.some((ev) => ev.type === 'echo_doctrine_nova_pulse'), false);

  // Detonate Echo Collapse [X] under Nova doctrine -> cooldown must be 0.75x shorter than Standard (8.0s * 0.75 = 6.0s)
  world.echoCollapse.unlocked = true;
  world.player.flux = 100;
  const collapseInp = createEmptyInput();
  collapseInp.echoCollapseJustPressed = true;
  stepWorld(world, collapseInp, 0.02);
  assert.ok(world.events.some((ev) => ev.type === 'echo_collapse_detonated'));
  assert.ok(
    world.echoCollapse.maxCooldown <= 6.1,
    `Expected Nova -25% Collapse cooldown (<= 6.0s), got ${world.echoCollapse.maxCooldown}`
  );
});

test('cycleEchoDoctrine, Save V2 storage, and ALPHA/BETA/GAMMA Loadout Presets persist echoDoctrine end-to-end', () => {
  const storage = createMemoryStorage();
  const world = createInitialWorld('title');
  assert.equal(world.progression.echoDoctrine, 'standard');

  const c1 = cycleEchoDoctrine(world);
  assert.equal(c1.success, true);
  assert.equal(c1.doctrineId, 'vanguard');

  // Save Preset ALPHA (slot 0) with 'vanguard', then switch to 'nova' and save Preset BETA (slot 1)
  const savedAlpha = saveLoadoutPreset(world, 0);
  assert.equal(savedAlpha.success, true);
  assert.equal(world.progression.loadoutPresets[0]?.echoDoctrine, 'vanguard');

  setEchoDoctrine(world, 'nova');
  saveLoadoutPreset(world, 1);
  assert.equal(world.progression.loadoutPresets[1]?.echoDoctrine, 'nova');

  // Persist to Save V2 storage and reload into a fresh world
  const written = saveCampaignProgressToStorage(world, storage);
  assert.equal(written.written, true);

  const restored = createInitialWorld('title');
  const loaded = loadCampaignProgressFromStorage(restored, storage);
  assert.equal(loaded, true);
  assert.equal(restored.progression.echoDoctrine, 'nova');
  assert.equal(extractHudSnapshot(restored).progression.echoDoctrine, 'nova');

  // Apply Preset ALPHA -> restores 'vanguard' immediately
  const applied = applyLoadoutPreset(restored, 0);
  assert.equal(applied.success, true);
  assert.equal(restored.progression.echoDoctrine, 'vanguard');
});

