import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RIG_OVERCLOCK_COST,
  SENTINEL_PROTOCOL_SPECS,
  absorbDamageWithChronoWard,
  computeMaxChronoWard,
  computeRigSetSynergy,
  createInitialChronoAegisState,
  cycleNextSentinelMode,
  formatSentinelHudLabel,
  shouldTriggerPhantomAfterimage,
  syncChronoAegisMaxWard,
  tickChronoAegisSystem,
} from './chrono-aegis.ts';
import {
  computeEffectiveRigModifiers,
  isRigModuleOverclocked,
} from './rig-progression.ts';
import { localizeBenchActionMessage } from './chronicle-awakening.ts';
import {
  createInitialWorld,
  cycleSentinelProtocol,
  extractHudSnapshot,
  overclockRigModule,
  purchaseRigModule,
  sanitizePersistedWeaponProgressionState,
  setSentinelProtocol,
  startPracticeStandardRun,
  stepWorld,
} from './simulation.ts';
import type { PlayerInputFrame } from './types.ts';

const IDLE_INPUT: PlayerInputFrame = {
  moveX: 0,
  moveZ: 0,
  aimYaw: 0,
  aimPitch: 0.35,
  lightAttackJustPressed: false,
  heavyHoldActive: false,
  heavyJustReleased: false,
  heavyAttackJustPressed: false,
  dodgeJustPressed: false,
  parryJustPressed: false,
};

test('Rig MK.II Overclock scales benefits by +35% and cuts tradeoff penalties by -50%', () => {
  assert.equal(RIG_OVERCLOCK_COST, 1);

  const world = createInitialWorld('paused');
  world.progression.memoryFragments = 12;

  // Cannot overclock an unowned Rig module
  const unownedRes = overclockRigModule(world, 'rig_chrono_spool');
  assert.equal(unownedRes.success, false);
  assert.equal(unownedRes.outcome, 'invalid_upgrade');

  assert.equal(purchaseRigModule(world, 'rig_chrono_spool').success, true);
  assert.equal(purchaseRigModule(world, 'rig_reactive_plating').success, true);
  assert.equal(purchaseRigModule(world, 'rig_executioner_bus').success, true);

  const equipped = {
    temporal_core: 'rig_chrono_spool' as const,
    defensive_chassis: 'rig_reactive_plating' as const,
    tactical_harness: 'rig_executioner_bus' as const,
  };

  const mk1Mods = computeEffectiveRigModifiers(equipped, false, []);
  assert.equal(mk1Mods.echoMaxDurationBonus, 2.0);
  assert.equal(mk1Mods.relayFluxCostDelta, -5);
  assert.equal(mk1Mods.relayCooldownDelta, 0.25);
  assert.equal(mk1Mods.maxIntegrityBonus, 25);
  assert.equal(mk1Mods.moveSpeedMultiplier, 0.94);
  assert.equal(mk1Mods.executionDamageMult, 1.25);
  assert.equal(mk1Mods.heavyChargeDelayDelta, 0.05);

  const fragsBefore = world.progression.memoryFragments;
  const ocRes = overclockRigModule(world, 'rig_chrono_spool');
  assert.equal(ocRes.success, true);
  assert.equal(ocRes.outcome, 'purchased');
  assert.equal(world.progression.memoryFragments, fragsBefore - RIG_OVERCLOCK_COST);
  assert.equal(
    isRigModuleOverclocked('rig_chrono_spool', world.progression.overclockedRigModules),
    true
  );
  assert.ok(world.events.some((ev) => ev.type === 'rig_module_overclocked'));

  // Duplicate overclock rejected cleanly
  const dupRes = overclockRigModule(world, 'rig_chrono_spool');
  assert.equal(dupRes.success, false);
  assert.equal(dupRes.outcome, 'already_owned');

  // Insufficient fragments check
  world.progression.memoryFragments = 0;
  const brokeRes = overclockRigModule(world, 'rig_reactive_plating');
  assert.equal(brokeRes.success, false);
  assert.equal(brokeRes.outcome, 'insufficient_fragments');

  const mk2Mods = computeEffectiveRigModifiers(equipped, false, [
    'rig_chrono_spool',
    'rig_reactive_plating',
    'rig_executioner_bus',
  ]);
  assert.equal(mk2Mods.echoMaxDurationBonus, 2.8);
  assert.equal(mk2Mods.relayFluxCostDelta, -7);
  assert.equal(mk2Mods.relayCooldownDelta, 0.12);
  assert.equal(mk2Mods.maxIntegrityBonus, 34);
  assert.equal(mk2Mods.moveSpeedMultiplier, 0.97);
  assert.equal(mk2Mods.executionDamageMult, 1.35);
  assert.equal(mk2Mods.executionIntegrityHeal, 19);
  assert.equal(mk2Mods.heavyChargeDelayDelta, 0.02);
});

test('Chrono Rig Set Synergy progresses cleanly from 0/3 -> Duo (2/3) -> Triad (3/3) -> Sovereign (3/3 MK.II)', () => {
  const none = computeRigSetSynergy({}, []);
  assert.equal(none.tier, 0);
  assert.equal(none.damageMultiplier, 1.0);
  assert.equal(none.bonusWard, 0);
  assert.equal(none.phantomAfterimageUnlocked, false);

  const duo = computeRigSetSynergy(
    {
      temporal_core: 'rig_chrono_spool',
      defensive_chassis: 'rig_reactive_plating',
      tactical_harness: null,
    },
    []
  );
  assert.equal(duo.tier, 1);
  assert.equal(duo.damageMultiplier, 1.06);
  assert.equal(duo.bonusWard, 10);
  assert.equal(duo.fluxGainMultiplier, 1.08);

  const triad = computeRigSetSynergy(
    {
      temporal_core: 'rig_chrono_spool',
      defensive_chassis: 'rig_reactive_plating',
      tactical_harness: 'rig_executioner_bus',
    },
    ['rig_chrono_spool']
  );
  assert.equal(triad.tier, 2);
  assert.equal(triad.damageMultiplier, 1.12);
  assert.equal(triad.bonusWard, 20);
  assert.equal(triad.skillFluxCostMultiplier, 0.9);
  assert.equal(triad.phantomAfterimageUnlocked, false);

  const sovereign = computeRigSetSynergy(
    {
      temporal_core: 'rig_chrono_spool',
      defensive_chassis: 'rig_reactive_plating',
      tactical_harness: 'rig_executioner_bus',
    },
    ['rig_chrono_spool', 'rig_reactive_plating', 'rig_executioner_bus']
  );
  assert.equal(sovereign.tier, 3);
  assert.equal(sovereign.damageMultiplier, 1.2);
  assert.equal(sovereign.bonusWard, 35);
  assert.equal(sovereign.fluxGainMultiplier, 1.2);
  assert.equal(sovereign.skillFluxCostMultiplier, 0.8);
  assert.equal(sovereign.sentinelRateMultiplier, 1.25);
  assert.equal(sovereign.phantomAfterimageUnlocked, true);
  assert.equal(computeMaxChronoWard('aegis', sovereign), 65);
});

test('LYS-04 Sentinel Protocol cycles free of cost, syncs live Rig stats & localizes VI/EN labels', () => {
  assert.equal(cycleNextSentinelMode('off'), 'aegis');
  assert.equal(cycleNextSentinelMode('aegis'), 'interceptor');
  assert.equal(cycleNextSentinelMode('interceptor'), 'harmonic');
  assert.equal(cycleNextSentinelMode('harmonic'), 'off');

  assert.equal(formatSentinelHudLabel('aegis', 'en'), 'LYS-04 [8]: AEGIS');
  assert.equal(formatSentinelHudLabel('aegis', 'vi'), 'LYS-04 [8]: HỘ VỆ');

  const world = createInitialWorld('paused');
  world.progression.memoryFragments = 15;

  // Default is 'off' with 0 Ward
  assert.equal(world.progression.sentinelMode, 'off');
  assert.equal(extractHudSnapshot(world).chronoAegis?.maxWard ?? 0, 0);

  // Unlock (auto-equips) & overclock all 3 Rig slots for Sovereign Rig Overdrive
  for (const id of [
    'rig_chrono_spool',
    'rig_reactive_plating',
    'rig_executioner_bus',
  ] as const) {
    assert.equal(purchaseRigModule(world, id).success, true);
    assert.equal(overclockRigModule(world, id).success, true);
  }

  // Verify Sovereign Rig -20% skill Flux cost scaling
  assert.equal(world.gravityPin.fluxCost, 24);
  assert.equal(world.echoCollapse.fluxCost, 20);

  const ocViMsg = localizeBenchActionMessage(world.progression.lastActionMessage, 'vi');
  assert.ok(ocViMsg.includes('MK.II'));

  // Switch to Aegis -> 30 base + 35 Sovereign bonus = 65 Max Ward
  const cyc1 = cycleSentinelProtocol(world);
  assert.equal(cyc1.success, true);
  assert.equal(cyc1.mode, 'aegis');
  assert.ok(world.events.some((ev) => ev.type === 'sentinel_mode_switched'));

  const snap = extractHudSnapshot(world);
  assert.equal(snap.chronoAegis?.mode, 'aegis');
  assert.equal(snap.chronoAegis?.maxWard, 65);
  assert.equal(snap.chronoAegis?.ward, 65);

  const senViMsg = localizeBenchActionMessage(world.progression!.lastActionMessage, 'vi');
  assert.ok(senViMsg.includes(SENTINEL_PROTOCOL_SPECS.aegis.titleVi));
});

test('Chrono Ward absorbs damage before hull Integrity, triggers shatter pulse, and recharges after 3.4s', () => {
  const aegis = createInitialChronoAegisState('aegis');
  const baseSynergy = computeRigSetSynergy({}, []);
  syncChronoAegisMaxWard(aegis, 'aegis', baseSynergy, true);
  assert.equal(aegis.ward, 30);
  assert.equal(aegis.maxWard, 30);

  // Partial hit: absorbs all 12 damage, no shatter
  const hit1 = absorbDamageWithChronoWard(aegis, 12);
  assert.equal(hit1.absorbed, 12);
  assert.equal(hit1.remainingDamage, 0);
  assert.equal(hit1.shatteredShockwave, false);
  assert.equal(aegis.ward, 18);
  assert.equal(aegis.rechargeDelayTimer, 3.4);

  // Breaking hit from >= 15 Ward triggers shatter shockwave and passes spillover damage
  const hit2 = absorbDamageWithChronoWard(aegis, 25);
  assert.equal(hit2.absorbed, 18);
  assert.equal(hit2.remainingDamage, 7);
  assert.equal(hit2.shatteredShockwave, true);
  assert.equal(aegis.ward, 0);

  // Tick through 3.4s recharge delay, then 2.0s regeneration
  tickChronoAegisSystem({
    aegis,
    rigSynergy: baseSynergy,
    playerX: 0,
    playerZ: 0,
    elapsedTime: 1.0,
    overdriveActive: false,
    echoActiveOrRecording: false,
    canAttack: true,
    targets: [],
    dt: 3.4,
  });
  assert.equal(aegis.rechargeDelayTimer, 0);
  assert.equal(aegis.ward, 0);

  tickChronoAegisSystem({
    aegis,
    rigSynergy: baseSynergy,
    playerX: 0,
    playerZ: 0,
    elapsedTime: 3.0,
    overdriveActive: false,
    echoActiveOrRecording: false,
    canAttack: true,
    targets: [],
    dt: 2.0,
  });
  assert.equal(aegis.ward, 13);
});

test('LYS-04 Interceptor fires autonomous plasma bolts in stepWorld and deals damage, stagger & Flux', () => {
  const world = createInitialWorld();
  startPracticeStandardRun(world);
  setSentinelProtocol(world, 'interceptor');
  world.events.length = 0;

  const target = world.enemies.find((e) => e.hp > 0);
  assert.ok(target, 'Expected at least one live enemy in practice run');
  target.x = world.player.x;
  target.z = world.player.z + 5.0;
  const hpBefore = target.hp;
  const staggerBefore = target.stagger;
  world.player.flux = 10;
  world.chronoAegis!.fireCooldown = 0.02;

  stepWorld(world, IDLE_INPUT, 0.05);

  assert.equal(world.chronoAegis!.totalSentinelShots, 1);
  assert.ok(target.hp < hpBefore, 'Interceptor bolt should damage nearby enemy');
  assert.ok(target.stagger > staggerBefore, 'Interceptor bolt should build enemy stagger');
  assert.ok(world.player.flux >= 13, 'Interceptor bolt should grant Flux');
  assert.ok(
    world.events.some((ev) => ev.type === 'combat_drone_fired'),
    'Expected combat_drone_fired event for 3D beam VFX'
  );
});

test('Harmonic Protocol & Sovereign Rig trigger Phantom Afterimage Strikes on qualifying hits', () => {
  const baseSynergy = computeRigSetSynergy({}, []);
  const sovereignSynergy = computeRigSetSynergy(
    {
      temporal_core: 'rig_chrono_spool',
      defensive_chassis: 'rig_reactive_plating',
      tactical_harness: 'rig_executioner_bus',
    },
    ['rig_chrono_spool', 'rig_reactive_plating', 'rig_executioner_bus']
  );

  assert.equal(shouldTriggerPhantomAfterimage('off', baseSynergy, true), false);
  assert.equal(shouldTriggerPhantomAfterimage('harmonic', baseSynergy, false), false);
  assert.equal(shouldTriggerPhantomAfterimage('harmonic', baseSynergy, true), true);
  assert.equal(shouldTriggerPhantomAfterimage('aegis', sovereignSynergy, true), true);

  const world = createInitialWorld();
  startPracticeStandardRun(world);
  setSentinelProtocol(world, 'harmonic');

  const enemy = world.enemies.find((e) => e.hp > 0)!;
  enemy.hp = 500;
  enemy.maxHp = 500;
  enemy.x = world.player.x;
  enemy.z = world.player.z - 1.35;
  const aimToEnemy = Math.atan2(enemy.x - world.player.x, enemy.z - world.player.z);

  // Activate Dual-Weapon Resonance window so the melee strike qualifies for Phantom Afterimage
  world.weaponResonance = {
    activeId: 'blade_reaper',
    timer: 2.5,
    cooldown: 1.0,
    fromWeaponId: 'chrono_scythe',
    toWeaponId: 'chrono_edge',
    totalTriggers: 1,
  };
  world.events.length = 0;

  let sawAfterimageEvent = false;
  stepWorld(
    world,
    {
      ...IDLE_INPUT,
      aimYaw: aimToEnemy,
      lightAttackJustPressed: true,
    },
    0.05
  );
  if (world.events.some((ev) => ev.type === 'phantom_afterimage_strike')) {
    sawAfterimageEvent = true;
  }
  for (let i = 0; i < 6 && !sawAfterimageEvent; i++) {
    stepWorld(world, { ...IDLE_INPUT, aimYaw: aimToEnemy }, 0.05);
    if (world.events.some((ev) => ev.type === 'phantom_afterimage_strike')) {
      sawAfterimageEvent = true;
    }
  }

  assert.equal(sawAfterimageEvent, true, 'Expected phantom_afterimage_strike event on melee hit');
  assert.ok((world.chronoAegis?.totalAfterimages ?? 0) >= 1);
});

test('sanitizePersistedWeaponProgressionState preserves valid Rig MK.II overclocks and Sentinel mode', () => {
  const sanitized = sanitizePersistedWeaponProgressionState({
    memoryFragments: 9,
    purchasedRigModules: ['rig_chrono_spool', 'rig_reactive_plating'],
    equippedRigModules: {
      temporal_core: 'rig_chrono_spool',
      defensive_chassis: 'rig_reactive_plating',
      tactical_harness: null,
    },
    overclockedRigModules: [
      'rig_chrono_spool',
      'rig_executioner_bus', // unowned -> must be stripped
      'rig_chrono_spool', // duplicate -> deduplicated
      'invalid_id',
    ],
    sentinelMode: 'harmonic',
  });

  assert.deepEqual(sanitized.overclockedRigModules, ['rig_chrono_spool']);
  assert.equal(sanitized.sentinelMode, 'harmonic');

  const fallback = sanitizePersistedWeaponProgressionState({
    sentinelMode: 'corrupted_mode',
  });
  assert.equal(fallback.sentinelMode, 'off');
});
