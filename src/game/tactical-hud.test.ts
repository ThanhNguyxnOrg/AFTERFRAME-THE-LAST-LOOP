import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCommsCodecProfile,
  computePeripheralThreats,
  computeRelativeBearingDeg,
  computeTacticalRadarSnapshot,
  formatCombatCallouts,
  projectNdcToViewport,
} from './tactical-hud.ts';
import {
  advanceArenaBoostPads,
  applyDamageToDestructibleObstacle,
  buildObstaclesForChapter,
  createInitialWorld,
  dismissActiveTransmission,
  startBossEncounter,
  stepWorld,
  triggerNarrativeTransmission,
} from './simulation.ts';
import type { PlayerInputFrame } from './types.ts';

const IDLE_INPUT: PlayerInputFrame = {
  moveX: 0,
  moveZ: 0,
  aimYaw: Math.PI,
  aimPitch: 0.35,
  lightAttackJustPressed: false,
  heavyHoldActive: false,
  heavyJustReleased: false,
  heavyAttackJustPressed: false,
  dodgeJustPressed: false,
  parryJustPressed: false,
};

test('computeRelativeBearingDeg matches Three.js camera forward & right conventions across cardinals', () => {
  const player = { x: 0, z: 0 };
  const aimYaw = Math.PI; // Default camera faces North (-Z)

  assert.ok(Math.abs(computeRelativeBearingDeg(0, 0, 0, -5, aimYaw)) < 0.01);
  assert.ok(Math.abs(computeRelativeBearingDeg(0, 0, 5, 0, aimYaw) - 90) < 0.01);
  assert.ok(Math.abs(computeRelativeBearingDeg(0, 0, -5, 0, aimYaw) + 90) < 0.01);
  assert.ok(Math.abs(Math.abs(computeRelativeBearingDeg(0, 0, 0, 5, aimYaw)) - 180) < 0.01);

  // Rotate camera 90° clockwise (aimYaw = PI/2 -> facing +X East)
  const eastYaw = Math.PI / 2;
  assert.ok(Math.abs(computeRelativeBearingDeg(player.x, player.z, 5, 0, eastYaw)) < 0.01);
  assert.ok(Math.abs(computeRelativeBearingDeg(player.x, player.z, 0, 5, eastYaw) - 90) < 0.01);
});

test('computePeripheralThreats prioritizes urgent projectiles & telegraphing flankers while hiding in-front targets', () => {
  const player = { x: 0, z: 0 };
  const aimYaw = Math.PI; // Facing -Z

  const threats = computePeripheralThreats(
    player,
    [
      { id: 'front', x: 0, z: -6, hp: 50, aiState: 'pursue' }, // Directly in front -> ignored
      { id: 'rear-hostile', x: 0, z: 8, hp: 50, aiState: 'pursue' }, // Directly behind -> hostile
      { id: 'right-telegraph', x: 9, z: 0, hp: 50, aiState: 'telegraph' }, // Right -> telegraph
      { id: 'ko-enemy', x: -5, z: 5, hp: 0, aiState: 'ko' }, // Dead -> ignored
    ],
    { id: 'boss-1', x: -10, z: 2, hp: 300, aiState: 'attack' }, // Left-rear attacking boss -> urgent
    [
      // Approaching projectile from behind
      { id: 1, owner: 'enemy', x: 1, z: 7, vx: -1, vz: -7 },
      // Player projectile -> ignored
      { id: 2, owner: 'player', x: 2, z: 6, vx: 0, vz: 8 },
      // Enemy projectile moving away -> ignored
      { id: 3, owner: 'enemy', x: -4, z: 4, vx: -5, vz: 5 },
    ],
    aimYaw,
    4
  );

  assert.equal(threats.length, 4);
  assert.equal(threats[0].id, 'proj:1');
  assert.equal(threats[0].severity, 'urgent');
  assert.equal(threats[1].id, 'boss:boss-1');
  assert.equal(threats[1].severity, 'urgent');
  assert.equal(threats[1].isBoss, true);
  assert.equal(threats[2].id, 'enemy:right-telegraph');
  assert.equal(threats[2].severity, 'telegraph');
  assert.equal(threats[3].id, 'enemy:rear-hostile');
  assert.equal(threats[3].severity, 'hostile');
});

test('formatCombatCallouts converts combat events cleanly and projectNdcToViewport enforces [-1, 1] Z guard', () => {
  const callouts = formatCombatCallouts([
    { type: 'player_parry_success', x: 1, z: 2 },
    { type: 'player_perfect_dodge', x: 0, z: 0, amount: 18 },
    { type: 'resonance_convergence', x: -2, z: 3, amount: 112 },
    { type: 'player_hit_enemy', x: 2, z: -1, amount: 42, isCriticalOrVulnerable: true, flowKind: 'riposte' },
    { type: 'player_hit_enemy', x: 2, z: -1, amount: 9, isGuarded: true },
    { type: 'player_damaged', x: 0, z: 0, amount: 15 },
    { type: 'flux_pool_spawned', x: 5, z: 0 },
    { type: 'temporal_thread_triggered', x: 4, z: 4, amount: 14 },
  ]);

  assert.equal(callouts.length, 8);
  assert.equal(callouts[0].text, 'PARRY! +35F');
  assert.equal(callouts[0].tone, 'parry');
  assert.equal(callouts[1].text, 'CHRONO SLIP +18F');
  assert.equal(callouts[1].tone, 'slip');
  assert.equal(callouts[2].text, 'CONVERGE! 112');
  assert.equal(callouts[2].tone, 'converge');
  assert.equal(callouts[3].text, 'RIPOSTE 42!');
  assert.equal(callouts[3].tone, 'crit');
  assert.equal(callouts[4].text, 'GUARD 9');
  assert.equal(callouts[4].tone, 'blocked');
  assert.equal(callouts[5].text, '-15');
  assert.equal(callouts[5].tone, 'hurt');
  assert.equal(callouts[6].text, 'FLUX POOL 7s');
  assert.equal(callouts[6].tone, 'converge');
  assert.equal(callouts[7].text, 'THREAD! +14F · SURGE');
  assert.equal(callouts[7].tone, 'slip');

  const center = projectNdcToViewport(0, 0, 0.2, 1440, 900);
  assert.deepEqual(center, { visible: true, x: 720, y: 450 });

  const behindCam = projectNdcToViewport(0, 0, 1.05, 1440, 900);
  assert.equal(behindCam.visible, false);

  const clippedNear = projectNdcToViewport(0, 0, -1.2, 1440, 900);
  assert.equal(clippedNear.visible, false);
});

test('computeTacticalRadarSnapshot excludes KOs, clamps coords, preserves Echo & sorts boss/staggered/telegraph first', () => {
  const radar = computeTacticalRadarSnapshot(
    { x: 1.5, z: -2.0, rotationY: 0.4 },
    Math.PI,
    22,
    [
      { id: 'far-idle', x: 18, z: 10, hp: 50, aiState: 'pursue' },
      { id: 'dead', x: 0, z: 0, hp: 0, aiState: 'ko' },
      { id: 'stag', x: 6, z: -4, hp: 20, aiState: 'staggered' },
      { id: 'warn', x: -30, z: 4, hp: 80, aiState: 'telegraph' },
    ],
    { id: 'helix-04', x: 0, z: -12, hp: 400, aiState: 'pursue' },
    { state: 'playback', activeActor: { x: -4.2, z: 3.1 } },
    { x: -10, z: -14 },
    [
      { id: 'relay-1', x: 5, z: 5, status: 'available' },
      { id: 'relay-done', x: -5, z: -5, status: 'activated' },
    ],
    4,
    [
      { id: 'cover-1', x: -4, z: -5, radius: 1.0, disabled: false, kind: 'cover_wall' },
      { id: 'broken-crate', x: 5, z: 0, radius: 0.85, disabled: true, kind: 'destructible_crate', hp: 0, maxHp: 45 },
      { id: 'teach-barrier', x: -6, z: 7, radius: 1.1, disabled: false, kind: 'barrier' },
    ],
    [
      { id: 'boost_pad_west', x: -14, z: 0, cooldown: 0 },
      { id: 'boost_pad_east', x: 14, z: 0, cooldown: 3.2 },
    ],
    [
      {
        id: 'flux-pool-1',
        x: 6,
        z: 2,
        radius: 3.4,
        remainingTime: 3.5,
        maxDuration: 7.0,
      },
    ],
    {
      id: 'boost_pad_west',
      kind: 'boost_pad',
      label: 'WEST FLANK BOOST PAD',
      x: -14,
      z: 0,
    }
  );

  assert.equal(radar.arenaRadius, 22);
  assert.equal(radar.echoActive, true);
  assert.equal(radar.echoX, -4.2);
  assert.equal(radar.echoZ, 3.1);
  assert.equal(radar.objectiveX, -10);
  assert.equal(radar.objectiveZ, -14);
  assert.equal(radar.blips.length, 4);
  assert.equal(radar.blips[0].id, 'boss:helix-04');
  assert.equal(radar.blips[0].kind, 'boss');
  assert.equal(radar.blips[1].id, 'enemy:stag');
  assert.equal(radar.blips[1].kind, 'staggered');
  assert.equal(radar.blips[2].id, 'enemy:warn');
  assert.equal(radar.blips[2].kind, 'telegraph');
  assert.equal(radar.blips[2].x, -22); // Clamped cleanly to -arenaRadius
  assert.equal(radar.blips[3].id, 'enemy:far-idle');
  assert.equal(radar.obstacles?.length, 1);
  assert.equal(radar.obstacles?.[0].id, 'cover-1');
  assert.equal(radar.boostPads?.length, 2);
  assert.equal(radar.boostPads?.[0].ready, true);
  assert.equal(radar.boostPads?.[1].ready, false);
  assert.equal(radar.fluxPools?.length, 1);
  assert.equal(radar.fluxPools?.[0].remainingRatio, 0.5);
  assert.equal(radar.waypoint?.id, 'boost_pad_west');
});

test('buildObstaclesForChapter and startBossEncounter deploy distinct chapter cover and destructible capacitors', () => {
  const prologueObs = buildObstaclesForChapter('prologue', false);
  const ch1Obs = buildObstaclesForChapter('chapter_1_helix', false);
  const ch3Obs = buildObstaclesForChapter('chapter_3_curator', false);

  assert.ok(prologueObs.some((o) => o.id === 'prop_prologue_crate_e'));
  assert.ok(ch1Obs.some((o) => o.id === 'cover_ch1_barricade_w'));
  assert.ok(!ch1Obs.some((o) => o.id === 'prop_prologue_crate_e'));
  assert.ok(ch3Obs.some((o) => o.id === 'cover_ch3_stack_w'));

  const world = createInitialWorld('playing');
  startBossEncounter(world, true, 'helix-04');
  assert.ok(world.obstacles.some((o) => o.id === 'prop_ch1_cap_w' && o.destructible));
  assert.equal(world.obstacles.find((o) => o.id === 'loom-pylon')?.disabled, true);
  assert.equal(world.boostPads?.length, 2);
});

test('Destructible capacitors shatter into +12 Flux and 3.8m shockwave damage & stagger on nearby enemies', () => {
  const world = createInitialWorld('playing');
  const crate = world.obstacles.find((o) => o.id === 'prop_prologue_crate_e' && o.destructible)!;
  assert.ok(crate);
  const enemy = world.enemies[0];
  enemy.x = crate.x + 1.8;
  enemy.z = crate.z;
  const hpBefore = enemy.hp;
  const staggerBefore = enemy.stagger;
  world.player.flux = 20;

  applyDamageToDestructibleObstacle(world, crate, 20, true);
  assert.equal(crate.disabled, false);
  assert.equal(crate.hp, 25);
  assert.equal(world.events.some((e) => e.type === 'obstacle_damaged' && e.obstacleId === crate.id), true);

  applyDamageToDestructibleObstacle(world, crate, 30, true);
  assert.equal(crate.disabled, true);
  assert.equal(crate.hp, 0);
  assert.equal(world.player.flux, 32);
  assert.equal(enemy.hp, Math.max(0, hpBefore - 18));
  assert.equal(enemy.stagger, Math.min(enemy.maxStagger, staggerBefore + 14));
  assert.equal(world.events.some((e) => e.type === 'obstacle_destroyed' && e.obstacleId === crate.id), true);
});

test('Kinetic boost pads grant 1.6s surge (+24% speed), trim dodge cooldown, reward +8 Flux, and enforce cooldown', () => {
  const world = createInitialWorld('playing');
  const westPad = world.boostPads!.find((p) => p.id === 'boost_pad_west')!;
  world.player.x = westPad.x;
  world.player.z = westPad.z;
  world.player.flux = 10;
  world.player.dodgeCooldownTimer = 0.8;

  advanceArenaBoostPads(world, 1 / 60);
  assert.ok(westPad.cooldown > 8.5);
  assert.ok((world.player.surgeTimer ?? 0) > 1.5);
  assert.equal(world.player.flux, 18);
  assert.ok(Math.abs(world.player.dodgeCooldownTimer - 0.3) < 0.01);
  assert.equal(world.events.some((e) => e.type === 'boost_pad_triggered' && e.boostPadId === westPad.id), true);

  // Verify surge accelerates Sera movement velocity cleanly during stepSimulation
  world.enemies = [];
  world.obstacles = [];
  world.player.x = 0;
  world.player.z = 0;
  world.player.surgeTimer = 1.0;
  stepWorld(world, { ...IDLE_INPUT, moveZ: -1 }, 1 / 60);
  const surgedSpeed = Math.hypot(world.player.vx, world.player.vz);

  world.player.surgeTimer = 0;
  stepWorld(world, { ...IDLE_INPUT, moveZ: -1 }, 1 / 60);
  const baseSpeed = Math.hypot(world.player.vx, world.player.vz);
  assert.ok(surgedSpeed > baseSpeed * 1.2, `Expected surged speed (${surgedSpeed}) > base*1.2 (${baseSpeed * 1.2})`);
});

test('computeCommsCodecProfile derives speaker channel, glyph, frequency & reduced-motion waveform', () => {
  const lysa = computeCommsCodecProfile('LYSA VENN · BAY 04 BEACON', 'RECORDED LOG', 4.2, 8.0, false);
  assert.equal(lysa.glyph, 'lysa');
  assert.equal(lysa.channelCode, 'CH-04');
  assert.equal(lysa.frequencyLabel, '142.8 MHz');
  assert.equal(lysa.bars.length, 7);
  assert.ok(lysa.bars.every((b) => b >= 0.2 && b <= 1.0));

  const warden = computeCommsCodecProfile('WARDEN // MARSHAL HELIX-04', 'LIVE WARDEN DIRECTIVE', 3.0, 6.0, false);
  assert.equal(warden.glyph, 'warden');
  assert.equal(warden.channelCode, 'SYS-00');
  assert.equal(warden.frequencyLabel, 'OVR // 00.0');

  const sera = computeCommsCodecProfile('SERA VENN', 'LIVE NEURAL TRACE', 2.0, 5.0, true);
  assert.equal(sera.glyph, 'sera');
  assert.equal(sera.channelCode, 'RIG-01');
  assert.ok(sera.bars.every((b) => Math.abs(b - 0.45) < 0.001));
});

test('triggerNarrativeTransmission and dismissActiveTransmission tag comms_transmission_started with speaker & classification', () => {
  const world = createInitialWorld('playing');
  world.events = [];
  triggerNarrativeTransmission(world, 'prologue_step1_teach', true);
  const firstEvent = world.events.find((e) => e.type === 'comms_transmission_started');
  assert.ok(firstEvent?.commsSpeaker?.includes('LYSA'));
  assert.equal(firstEvent?.commsClassification, 'RECORDED LOG');

  triggerNarrativeTransmission(world, 'prologue_step2_test', false);
  world.events = [];
  dismissActiveTransmission(world);
  const promotedEvent = world.events.find((e) => e.type === 'comms_transmission_started');
  assert.ok(promotedEvent?.commsSpeaker?.includes('WARDEN'));
  assert.equal(promotedEvent?.commsClassification, 'LIVE WARDEN DIRECTIVE');
});


