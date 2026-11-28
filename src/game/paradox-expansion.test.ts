import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHRONO_ACHIEVEMENTS,
  CHRONO_MUTATORS,
  FIELD_FABRICATOR_ITEMS,
  SERA_RIG_SKINS,
  absorbIncomingDamageWithAegis,
  computeMutatorModifiers,
  createDefaultMutators,
  createInitialParadoxState,
  formatSpeedrunClock,
  formatSpeedrunDelta,
  isParadoxRiftEligible,
  isSeraRigSkinUnlocked,
  pushDamagePopup,
  recordSpeedrunSectorSplit,
  tickCombatDrone,
  tickDamagePopups,
} from './paradox-expansion.ts';
import {
  createInitialWorld,
  equipSeraRigSkin,
  extractHudSnapshot,
  purchaseFabricatorItem,
  startEchoZeroParadoxEncounter,
  stepWorld,
  toggleChronoMutator,
  toggleSpeedrunHud,
  unlockChronoAchievement,
  useMedNaniteInjector,
} from './simulation.ts';
import type { PlayerInputFrame } from './types.ts';

function createIdleInput(): PlayerInputFrame {
  return {
    moveX: 0,
    moveZ: 0,
    aimYaw: 0,
    aimPitch: 0,
    lightAttackJustPressed: false,
    heavyHoldActive: false,
    heavyJustReleased: false,
    heavyAttackJustPressed: false,
    dodgeJustPressed: false,
    parryJustPressed: false,
    switchWeaponJustPressed: false,
    selectWeaponId: null,
    echoRecordJustPressed: false,
    echoPlayJustPressed: false,
    echoClearJustPressed: false,
    echoRelayJustPressed: false,
    gravityPinJustPressed: false,
    echoCollapseJustPressed: false,
    interactJustPressed: false,
    lockOnToggleJustPressed: false,
    lockOnCycleJustPressed: false,
    overdriveJustPressed: false,
    useNaniteJustPressed: false,
  };
}

test('5 Sera Rig Skins and unlock requirements work deterministically', () => {
  assert.equal(SERA_RIG_SKINS.length, 5);
  assert.equal(isSeraRigSkinUnlocked('nadir_standard', [], 0), true);
  assert.equal(isSeraRigSkinUnlocked('sovereign_gold', [], 0), true);
  assert.equal(isSeraRigSkinUnlocked('warden_crimson', [], 0), true);
  assert.equal(isSeraRigSkinUnlocked('phantom_emerald', ['first_breach'], 0), false);
  assert.equal(
    isSeraRigSkinUnlocked('phantom_emerald', ['first_breach', 'vault_raider'], 0),
    true
  );
  assert.equal(isSeraRigSkinUnlocked('paradox_prism', [], 0), false);
  assert.equal(isSeraRigSkinUnlocked('paradox_prism', [], 1), true);

  const world = createInitialWorld();
  assert.equal(equipSeraRigSkin(world, 'sovereign_gold'), true);
  assert.equal(world.progression.equippedSkinId, 'sovereign_gold');
  assert.equal(equipSeraRigSkin(world, 'paradox_prism'), false);
  world.progression.echoZeroDefeatedCount = 1;
  assert.equal(equipSeraRigSkin(world, 'paradox_prism'), true);
  assert.equal(world.progression.equippedSkinId, 'paradox_prism');
});

test('12 Chrono Achievements unlock once and emit a decaying HUD toast', () => {
  assert.equal(CHRONO_ACHIEVEMENTS.length, 12);
  const world = createInitialWorld();
  assert.equal(unlockChronoAchievement(world, 'first_breach'), true);
  assert.equal(unlockChronoAchievement(world, 'first_breach'), false);
  assert.equal(world.progression.unlockedAchievementIds?.includes('first_breach'), true);
  assert.equal(world.paradox?.activeToast?.id, 'first_breach');
  assert.ok((world.paradox?.activeToast?.remaining ?? 0) > 3.5);
});

test('Field Fabricator purchases deduct fragments and upgrade tactical loadout + Drone achievement', () => {
  assert.equal(FIELD_FABRICATOR_ITEMS.length, 5);
  const world = createInitialWorld();
  world.progression.memoryFragments = 12;
  world.paradox!.loadout.naniteInjectors = 1;

  assert.equal(purchaseFabricatorItem(world, 'nanite_pack'), true);
  assert.equal(world.paradox!.loadout.naniteInjectors, 2);
  assert.equal(world.progression.memoryFragments, 11);

  assert.equal(purchaseFabricatorItem(world, 'aegis_shield'), true);
  assert.equal(world.paradox!.loadout.aegisShieldHp, 40);
  assert.equal(world.progression.memoryFragments, 9);

  assert.equal(purchaseFabricatorItem(world, 'overclock_core'), true);
  assert.equal(world.paradox!.loadout.overclockCoreActive, true);
  assert.equal(world.progression.memoryFragments, 7);

  assert.equal(purchaseFabricatorItem(world, 'drone_mk1'), true);
  assert.equal(world.paradox!.loadout.combatDroneTier, 1);
  assert.equal(world.progression.memoryFragments, 4);

  assert.equal(purchaseFabricatorItem(world, 'drone_mk2'), true);
  assert.equal(world.paradox!.loadout.combatDroneTier, 2);
  assert.equal(world.progression.memoryFragments, 0);
  assert.equal(world.progression.unlockedAchievementIds?.includes('drone_commander'), true);
});

test('Med-Nanite Injector restores +42 Integrity and +18 Flux, respects cooldown & Ironman mutator', () => {
  const world = createInitialWorld();
  world.appState = 'playing';
  world.player.integrity = 40;
  world.player.flux = 20;

  assert.equal(useMedNaniteInjector(world), true);
  assert.equal(world.player.integrity, 82);
  assert.equal(world.player.flux, 38);
  assert.equal(world.paradox!.loadout.naniteInjectors, 1);
  assert.ok(world.paradox!.loadout.naniteCooldown > 0);

  // Blocked while on cooldown
  assert.equal(useMedNaniteInjector(world), false);

  // Blocked under Ironman Protocol
  world.paradox!.loadout.naniteCooldown = 0;
  toggleChronoMutator(world, 'ironmanNoHeal');
  assert.equal(useMedNaniteInjector(world), false);
});

test('Aegis Shield absorbs incoming damage before hull integrity', () => {
  const paradox = createInitialParadoxState();
  paradox.loadout.aegisShieldHp = 30;
  const hit1 = absorbIncomingDamageWithAegis(paradox.loadout, 18);
  assert.equal(hit1.absorbed, 18);
  assert.equal(hit1.remainingDamage, 0);
  assert.equal(paradox.loadout.aegisShieldHp, 12);

  const hit2 = absorbIncomingDamageWithAegis(paradox.loadout, 20);
  assert.equal(hit2.absorbed, 12);
  assert.equal(hit2.remainingDamage, 8);
  assert.equal(paradox.loadout.aegisShieldHp, 0);
});

test('Autonomous Combat Drone Mk.I/Mk.II fires plasma bolts and deploys Mk.II emergency shield', () => {
  const paradox = createInitialParadoxState({ droneTier: 2 });
  paradox.loadout.droneFireCooldown = 0;
  paradox.loadout.droneShieldCooldown = 0;
  const result = tickCombatDrone({
    loadout: paradox.loadout,
    playerX: 0,
    playerZ: 0,
    playerIntegrity: 25,
    playerMaxIntegrity: 100,
    canAttack: true,
    dt: 0.1,
    targets: [{ id: 'enemy-1', x: 4, z: 0, hp: 100 }],
  });

  assert.equal(result.fired, true);
  assert.equal(result.targetId, 'enemy-1');
  assert.equal(result.damage, 17);
  assert.equal(result.fluxGain, 4);
  assert.equal(result.triggeredEmergencyShield, true);
  assert.equal(paradox.loadout.aegisShieldHp, 25);
});

test('4 Chrono Mutators compute combined modifiers and toggle cleanly', () => {
  assert.equal(CHRONO_MUTATORS.length, 4);
  const muts = createDefaultMutators();
  muts.glassCannon = true;
  muts.hyperSpeed = true;
  muts.ironmanNoHeal = true;
  const mods = computeMutatorModifiers(muts);
  assert.equal(mods.playerDamageMult, 2.0);
  assert.equal(mods.incomingDamageMult, 2.0);
  assert.equal(mods.speedMult, 1.3);
  assert.equal(mods.allowHealing, false);
  assert.equal(mods.activeCount, 3);
  assert.ok(Math.abs(mods.bonusFragmentMultiplier - 1.85) < 0.001);
});

test('Floating Damage Popups cap & expire and Speedrun Splits compute PB deltas', () => {
  const paradox = createInitialParadoxState({ speedrunEnabled: true });
  pushDamagePopup(paradox, 44, 1, 2, 3, 'convergence');
  assert.equal(paradox.damagePopups.length, 1);
  assert.equal(paradox.damagePopups[0].kind, 'convergence');
  tickDamagePopups(paradox, 1.2);
  assert.equal(paradox.damagePopups.length, 0);

  paradox.speedrun.bestSplits.prologue = 50;
  paradox.speedrun.runElapsedSec = 42.5;
  const split = recordSpeedrunSectorSplit(paradox.speedrun, 'prologue');
  assert.equal(split.isNewBest, true);
  assert.equal(split.deltaSec, -7.5);
  assert.equal(formatSpeedrunClock(65.4), '01:05.4');
  assert.equal(formatSpeedrunDelta(-7.5), '-7.5s');
  assert.equal(formatSpeedrunDelta(2.3), '+2.3s');
});

test('Paradox Rift eligibility & Secret 6th Boss ECHO-ZERO defeat unlocks Paradox Break Ending, Kill-Cam, +5 Frags & Prism Skin', () => {
  assert.equal(isParadoxRiftEligible(['prologue'], 0, 0), false);
  assert.equal(isParadoxRiftEligible(['prologue', 'chapter_1_helix'], 0, 0), true);
  assert.equal(isParadoxRiftEligible([], 1, 0), true);
  assert.equal(isParadoxRiftEligible([], 0, 1), true);

  const world = createInitialWorld();
  toggleSpeedrunHud(world);
  assert.equal(world.progression.speedrunHudEnabled, true);
  toggleChronoMutator(world, 'glassCannon');

  startEchoZeroParadoxEncounter(world, true);
  assert.equal(world.appState, 'playing');
  assert.equal(world.boss?.id, 'echo-zero');
  assert.equal(world.boss?.maxHp, 920);
  const startFrags = world.progression.memoryFragments;

  // Position Sera directly in front of ECHO-ZERO and deal fatal blow via light attack
  world.boss!.hp = 1;
  for (const e of world.enemies) {
    e.hp = 1;
  }
  world.player.x = world.boss!.x;
  world.player.z = world.boss!.z + 1.6;
  world.player.rotationY = Math.PI;
  const inp = createIdleInput();
  inp.lightAttackJustPressed = true;
  stepWorld(world, inp, 0.016);
  const idle = createIdleInput();
  for (let i = 0; i < 15; i += 1) {
    stepWorld(world, idle, 0.016);
  }

  assert.equal(world.boss?.hp, 0);
  assert.ok((world.paradox?.killCamTimer ?? 0) > 1.0, 'Kill-cam slow-mo triggers on boss defeat');
  assert.equal(world.progression.paradoxEndingUnlocked, true);
  assert.equal(world.progression.echoZeroDefeatedCount, 1);
  assert.ok(
    world.progression.memoryFragments >= startFrags + 5,
    'Defeating ECHO-ZERO awards at least +5 Memory Fragments'
  );
  assert.equal(world.progression.unlockedAchievementIds?.includes('paradox_breaker'), true);
  assert.equal(world.progression.unlockedAchievementIds?.includes('untouchable_warden'), true);
  assert.equal(world.progression.unlockedAchievementIds?.includes('mutator_daredevil'), true);
  assert.equal(equipSeraRigSkin(world, 'paradox_prism'), true);

  const hud = extractHudSnapshot(world);
  assert.equal(hud.paradox?.speedrun.enabled, true);
  assert.equal(hud.progression.paradoxEndingUnlocked, true);
  assert.equal(hud.progression.equippedSkinId, 'paradox_prism');
});
