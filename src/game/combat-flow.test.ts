import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMBAT_FLOW_CONFIG,
  canCancelActionTailForCombatFlow,
  consumeAttackFlowMultipliers,
  evaluateCombatRank,
  getCombatFlowHudSummary,
  getCombatFlowMovementSpeedMultiplier,
  grantChronoSlipWindow,
  grantQuickDrawWindow,
  grantRelayMomentumWindow,
  grantRiposteWindow,
  tickPlayerCombatFlowTimers,
} from './combat-flow.ts';
import { GAME_CONFIG } from './config.ts';
import {
  applyDamageToPlayer,
  attemptEchoRelay,
  createBossWorld,
  createEmptyInput,
  createInitialPlayer,
  createInitialWorld,
  extractHudSnapshot,
  resetWorldForStandardPlaying,
  stepWorld,
  switchPlayerWeapon,
} from './simulation.ts';

test('Combat Flow pure helpers enforce riposte/relay/quick-draw windows and preserve mid-dodge weapon switch block', () => {
  const player = createInitialPlayer();
  assert.equal(getCombatFlowHudSummary(player).active, false);
  assert.equal(getCombatFlowMovementSpeedMultiplier(player), 1);

  // Mid-dodge must block both attack cancel and weapon_switch cancel
  player.actionState = 'dodging';
  player.stateTimer = 0.2;
  assert.equal(canCancelActionTailForCombatFlow(player, false, 'light'), false);
  assert.equal(canCancelActionTailForCombatFlow(player, false, 'heavy'), false);
  assert.equal(canCancelActionTailForCombatFlow(player, false, 'weapon_switch'), false);

  // Late dodge tail (<= 0.075s) permits Dash-Strike attack cancel, never weapon_switch
  player.stateTimer = COMBAT_FLOW_CONFIG.dodgeStrikeCancelRemaining;
  assert.equal(canCancelActionTailForCombatFlow(player, false, 'light'), true);
  assert.equal(canCancelActionTailForCombatFlow(player, false, 'heavy'), true);
  assert.equal(canCancelActionTailForCombatFlow(player, false, 'weapon_switch'), false);

  // Late heavy_recovery tail permits weapon_switch and attacks
  player.actionState = 'heavy_recovery';
  player.stateTimer = COMBAT_FLOW_CONFIG.heavyRecoveryCancelRemaining;
  assert.equal(canCancelActionTailForCombatFlow(player, false, 'weapon_switch'), true);
  assert.equal(canCancelActionTailForCombatFlow(player, false, 'light'), true);

  // Riposte + Relay Momentum stack windup & stagger cleanly and clear on consumption
  grantRiposteWindow(player);
  grantRelayMomentumWindow(player);
  assert.equal(getCombatFlowMovementSpeedMultiplier(player), COMBAT_FLOW_CONFIG.relayMoveSpeedMult);
  const hudSummary = getCombatFlowHudSummary(player);
  assert.equal(hudSummary.active, true);
  assert.equal(hudSummary.kind, 'riposte');

  const consumed = consumeAttackFlowMultipliers(player);
  assert.equal(consumed.triggeredRiposte, true);
  assert.equal(consumed.flowKind, 'riposte');
  assert.equal(consumed.windupMult, COMBAT_FLOW_CONFIG.riposteWindupMult);
  assert.equal(consumed.damageMult, COMBAT_FLOW_CONFIG.riposteDamageMult);
  assert.ok(consumed.staggerMult > COMBAT_FLOW_CONFIG.riposteStaggerMult);
  assert.equal(player.riposteTimer, 0);
  assert.equal(player.relayMomentumTimer, 0);

  grantQuickDrawWindow(player);
  tickPlayerCombatFlowTimers(player, 0.4);
  assert.ok((player.quickDrawTimer ?? 0) > 0.9 && (player.quickDrawTimer ?? 0) < 1.1);
});

test('Timed Parry grants Riposte window: faster windup, +24% counter damage & +30% stagger, consumed on first strike', () => {
  const world = createInitialWorld('playing');
  resetWorldForStandardPlaying(world);
  world.tutorial.enabled = false;
  world.enemies = world.enemies.slice(0, 1);
  const target = world.enemies[0];
  target.archetype = 'scrapper';
  target.x = 0;
  target.z = -1.6;
  target.hp = 400;
  target.maxHp = 400;
  target.aiState = 'attack';

  world.player.x = 0;
  world.player.z = 0;
  world.player.rotationY = Math.PI;
  world.player.actionState = 'parry_active';
  world.player.stateTimer = 0.12;

  // Parrying an incoming attack opens the Riposte Ready state
  const tookDamage = applyDamageToPlayer(world, 20, target);
  assert.equal(tookDamage, false);
  assert.ok((world.player.riposteTimer ?? 0) > 1.5);

  const hud = extractHudSnapshot(world);
  assert.equal(hud.combatFlow?.active, true);
  assert.equal(hud.combatFlow?.kind, 'riposte');

  // Reset target to neutral state so comparison with baseline light_1 is purely from Riposte
  target.aiState = 'pursue';
  target.stateTimer = 0;
  target.rotationY = 0;
  target.stagger = 0;

  const hpBeforeRiposte = target.hp;
  // Press Light Attack immediately during parry hitstop (0.085s): hitstop must preserve the buffer and fire on wake
  const lightInput = createEmptyInput(Math.PI);
  lightInput.lightAttackJustPressed = true;
  stepWorld(world, lightInput, 0.02);
  for (let i = 0; i < 5; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
    if ((world.player.actionState as string) === 'light_windup') break;
  }

  assert.equal(world.player.actionState, 'light_windup');
  assert.ok(
    world.player.stateTimer < GAME_CONFIG.player.lightAttack.windup[0],
    'Riposte strike must accelerate initial windup'
  );
  assert.ok(
    world.events.some((ev) => ev.type === 'player_riposte_strike'),
    'Riposte initiation must emit player_riposte_strike event'
  );

  // Step through light_windup + light_active until strike connects and returns to recovery
  for (let i = 0; i < 12; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const riposteDamage = hpBeforeRiposte - target.hp;
  const baseLight1 = GAME_CONFIG.player.lightAttack.damage[0];
  assert.equal(
    riposteDamage,
    Math.round(baseLight1 * COMBAT_FLOW_CONFIG.riposteDamageMult),
    `Riposte light_1 damage (${riposteDamage}) must apply 1.24x multiplier`
  );

  // Let recovery + combo window expire cleanly, then fire a normal light_1 strike -> returns to baseline
  for (let i = 0; i < 50; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  target.aiState = 'pursue';
  target.x = 0;
  target.z = world.player.z - 1.5;
  const hpBeforeNormal = target.hp;
  const normalInput = createEmptyInput(Math.PI);
  normalInput.lightAttackJustPressed = true;
  stepWorld(world, normalInput, 0.02);
  for (let i = 0; i < 12; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const normalDamage = hpBeforeNormal - target.hp;
  assert.equal(normalDamage, baseLight1, 'Subsequent strike after Riposte is consumed uses baseline damage');
});

test('Echo Relay grants Relay Surge momentum & Quick-Draw + Late-Dodge cancels keep combat fluid without breaking dodge-buffer invariant', () => {
  const world = createInitialWorld('playing');
  resetWorldForStandardPlaying(world);
  world.tutorial.enabled = false;
  world.obstacles = [];
  world.player.x = 0;
  world.player.z = 4.0;
  world.player.flux = 80;

  // Set up an active playback Echo actor 4m away in an open lane
  world.echo.state = 'playback';
  world.echo.playbackTime = 0.2;
  world.echo.clip = {
    id: 1,
    duration: 2.0,
    samples: [
      {
        t: 0,
        x: 3.5,
        z: 4.0,
        rotationY: 0,
        actionState: 'idle',
        gaitPhase: 0,
        comboIndex: 0,
        chargeRatio: 0,
        isEmpoweredHeavy: false,
        weaponId: 'chrono_edge',
      },
    ],
    events: [],
  };
  world.echo.activeActor = {
    id: 'echo-1',
    clipId: 1,
    x: 3.5,
    z: 4.0,
    rotationY: 0,
    radius: GAME_CONFIG.player.radius,
    actionState: 'idle',
    gaitPhase: 0,
    comboIndex: 0,
    chargeRatio: 0,
    isEmpoweredHeavy: false,
    weaponId: 'chrono_edge',
    elapsed: 0.2,
    duration: 2.0,
  };

  assert.equal(attemptEchoRelay(world), true);
  assert.ok((world.player.relayMomentumTimer ?? 0) >= 1.9);
  const hudAfterRelay = extractHudSnapshot(world);
  assert.equal(hudAfterRelay.combatFlow?.kind, 'relay_momentum');

  // Verify 18% faster neutral movement during Relay Surge
  const moveInput = createEmptyInput(0);
  moveInput.moveZ = -1;
  stepWorld(world, moveInput, 0.02);
  const speed = Math.hypot(world.player.vx, world.player.vz);
  assert.ok(
    speed > GAME_CONFIG.player.moveSpeed * 1.1,
    `Relay Surge speed (${speed.toFixed(2)}) must exceed base moveSpeed`
  );

  // Verify Quick-Draw weapon switch during late heavy_recovery tail snaps to idle + accelerates next shot
  world.player.relayMomentumTimer = 0;
  world.player.actionState = 'heavy_recovery';
  world.player.stateTimer = 0.08;
  world.player.weaponSwitchCooldownTimer = 0;
  assert.equal(switchPlayerWeapon(world, 'pulsecaster'), true);
  assert.equal(world.player.actionState, 'idle', 'Late heavy_recovery switch snaps to idle for Quick-Draw');
  assert.ok((world.player.quickDrawTimer ?? 0) > 1.2);

  // Verify Dash-Strike cancel at dodge tail (<= 0.075s), while mid-dodge remains committed
  switchPlayerWeapon(world, 'chrono_edge');
  world.player.quickDrawTimer = 0;
  world.player.weaponSwitchCooldownTimer = 0;
  world.player.actionState = 'dodging';
  world.player.stateTimer = 0.05;
  const dashStrikeInput = createEmptyInput(Math.PI);
  dashStrikeInput.lightAttackJustPressed = true;
  stepWorld(world, dashStrikeInput, 0.016);
  assert.equal(
    world.player.actionState,
    'light_windup',
    'Buffered light attack during dodge tail must transition immediately into Dash-Strike windup'
  );
});

test('Boss intro banner telemetry reports live decreasing introRemaining countdown during dormant awakening', () => {
  const world = createBossWorld('playing', false, 'helix-04');
  assert.equal(world.run.stage, 'boss_intro');
  assert.equal(world.boss?.aiState, 'dormant');

  const hudStart = extractHudSnapshot(world);
  assert.ok((hudStart.boss?.introRemaining ?? 0) >= 0.9);
  assert.ok((hudStart.boss?.introDuration ?? 0) >= 0.9);

  stepWorld(world, createEmptyInput(), 0.35);
  const hudMid = extractHudSnapshot(world);
  assert.ok(
    (hudMid.boss?.introRemaining ?? 0) < (hudStart.boss?.introRemaining ?? 0),
    'introRemaining must count down cleanly so the boss intro progress bar animates'
  );
});

test('Perfect Dodge triggers Chrono Slip counter window once per dodge, grants Flux & 1.18x counter damage', () => {
  const world = createInitialWorld('playing');
  resetWorldForStandardPlaying(world);
  world.tutorial.enabled = false;
  world.enemies = world.enemies.slice(0, 1);
  const target = world.enemies[0];
  target.archetype = 'scrapper';
  target.x = 0;
  target.z = -1.6;
  target.hp = 400;
  target.maxHp = 400;
  target.aiState = 'pursue';
  target.rotationY = 0;

  world.player.x = 0;
  world.player.z = 0;
  world.player.rotationY = Math.PI;
  world.player.flux = 20;
  world.player.actionState = 'dodging';
  world.player.stateTimer = 0.22;
  world.player.invulnTimer = 0.2;
  world.player.dodgeCounterTriggered = false;

  // Non-dodge hurt invulnerability must NOT trigger Chrono Slip
  world.player.actionState = 'idle';
  assert.equal(applyDamageToPlayer(world, 18, target), false);
  assert.equal(world.stats.perfectDodges ?? 0, 0);
  assert.equal(world.player.flux, 20);

  // Active dodge invulnerability triggers Chrono Slip exactly once per dodge
  world.player.actionState = 'dodging';
  assert.equal(applyDamageToPlayer(world, 18, target), false);
  assert.equal(world.stats.perfectDodges, 1);
  assert.equal(world.player.flux, 20 + COMBAT_FLOW_CONFIG.chronoSlipFluxGain);
  assert.ok((world.player.chronoSlipTimer ?? 0) > 1.5);
  assert.ok(
    world.events.some((ev) => ev.type === 'player_perfect_dodge'),
    'Perfect dodge must emit player_perfect_dodge event'
  );

  // Second overlapping hit during the same dodge must NOT double-trigger Flux or stat count
  assert.equal(applyDamageToPlayer(world, 18, target), false);
  assert.equal(world.stats.perfectDodges, 1);
  assert.equal(world.player.flux, 20 + COMBAT_FLOW_CONFIG.chronoSlipFluxGain);

  const hud = extractHudSnapshot(world);
  assert.equal(hud.combatFlow?.active, true);
  assert.equal(hud.combatFlow?.kind, 'chrono_slip');
  assert.ok(hud.combatFlow?.label.includes('CHRONO SLIP'));

  // Let dodge finish & hitstop clear, verify boosted move speed and 1.18x counter damage
  assert.ok(
    getCombatFlowMovementSpeedMultiplier(world.player) ===
      COMBAT_FLOW_CONFIG.chronoSlipMoveSpeedMult
  );
  world.hitstopTimer = 0;
  world.player.actionState = 'idle';
  world.player.stateTimer = 0;
  const hpBeforeCounter = target.hp;
  const lightInput = createEmptyInput(Math.PI);
  lightInput.lightAttackJustPressed = true;
  stepWorld(world, lightInput, 0.02);
  assert.equal(world.player.actionState, 'light_windup');
  assert.ok(world.player.stateTimer < GAME_CONFIG.player.lightAttack.windup[0]);

  for (let i = 0; i < 12; i++) {
    stepWorld(world, createEmptyInput(Math.PI), 0.02);
  }
  const slipDamage = hpBeforeCounter - target.hp;
  assert.equal(
    slipDamage,
    Math.round(GAME_CONFIG.player.lightAttack.damage[0] * COMBAT_FLOW_CONFIG.chronoSlipDamageMult)
  );
  assert.equal(world.player.chronoSlipTimer, 0);
});

test('evaluateCombatRank assigns deterministic S+ through C grades from run summary telemetry', () => {
  const sPlus = evaluateCombatRank({
    outcome: 'victory',
    elapsedTime: 38,
    enemiesDefeated: 3,
    totalEnemies: 3,
    damageDealt: 520,
    damageTaken: 0,
    parriesLanded: 2,
    perfectDodges: 2,
    vulnerableHits: 4,
    convergencesTriggered: 1,
    relaysUsed: 1,
    remainingTargetHp: 0,
  });
  assert.equal(sPlus.grade, 'S+');
  assert.equal(sPlus.hitless, true);
  assert.equal(sPlus.summaryTag, 'UNTOUCHED CHRONOMANCER');

  const bRank = evaluateCombatRank({
    outcome: 'victory',
    elapsedTime: 185,
    enemiesDefeated: 3,
    totalEnemies: 3,
    damageDealt: 360,
    damageTaken: 78,
    parriesLanded: 0,
    perfectDodges: 0,
    vulnerableHits: 1,
    convergencesTriggered: 0,
    relaysUsed: 0,
    remainingTargetHp: 0,
  });
  assert.equal(bRank.grade, 'B');
  assert.equal(bRank.hitless, false);

  const defeatRank = evaluateCombatRank({
    outcome: 'defeat',
    elapsedTime: 70,
    enemiesDefeated: 1,
    totalEnemies: 3,
    damageDealt: 180,
    damageTaken: 100,
    parriesLanded: 0,
    perfectDodges: 1,
    vulnerableHits: 0,
    convergencesTriggered: 0,
    relaysUsed: 0,
    remainingTargetHp: 140,
  });
  assert.equal(defeatRank.grade, 'C');
  assert.equal(defeatRank.summaryTag, 'LOOP TERMINATED');

  // Verify pure grantChronoSlipWindow precedence behind Riposte
  const dummyPlayer = createInitialPlayer();
  grantChronoSlipWindow(dummyPlayer);
  grantRiposteWindow(dummyPlayer);
  const flow = consumeAttackFlowMultipliers(dummyPlayer);
  assert.equal(flow.flowKind, 'riposte');
  assert.equal(dummyPlayer.chronoSlipTimer, 0);
});

