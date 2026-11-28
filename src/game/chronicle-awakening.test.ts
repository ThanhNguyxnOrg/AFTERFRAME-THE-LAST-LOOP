import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WEAPON_AWAKENING_COST,
  computeEquippedMythicBonus,
  computeStanceDoctrineModifiers,
  getStanceLoomCoda,
  getUpgradeTierLevel,
  isUpgradeAwakened,
  localizeBenchActionMessage,
  localizeCommsTransmission,
  localizeHudObjectiveText,
  localizeMasteryRankLabel,
  localizeNeuralProtocol,
  localizeRigModule,
  localizeStoryArc,
  localizeWeaponUpgrade,
} from './chronicle-awakening.ts';
import {
  buildStoryArcStates,
  getAllNeuralProtocolDefinitions,
  STORY_ARCS,
} from './chronicle-expansion.ts';
import { getAllRigModuleDefinitions } from './rig-progression.ts';
import { GAME_CONFIG } from './config.ts';
import { CHRONICLE_STORY_ARC, ENDING_CHRONICLES } from './chronicle-narrative.ts';
import { CHRONICLE_LINK_CHAIN } from './chrono-nexus.ts';

test('Stance Doctrine baseline is 100% neutral when no story signals are resolved', () => {
  const empty = computeStanceDoctrineModifiers({});
  assert.equal(empty.totalResolved, 0);
  assert.equal(empty.damageMult, 1.0);
  assert.equal(empty.staggerMult, 1.0);
  assert.equal(empty.maxIntegrityBonus, 0);
  assert.equal(empty.parryHealBonus, 0);
  assert.equal(empty.heatCostMult, 1.0);
  assert.equal(empty.fluxGainMult, 1.0);
  assert.equal(empty.bossExposedBonusMult, 1.0);
  assert.equal(empty.sovereignPerkId, null);
  assert.equal(getStanceLoomCoda({}, 'vi'), null);
});

test('Stance Doctrine scales Defiance, Empathy, Pragmatism, and unlocks Sovereign perks', () => {
  const defianceMods = computeStanceDoctrineModifiers({
    story_prologue_wake: 'pro_defiance',
    story_ch1_containment: 'ch1_defiance',
    story_ch2_chorus: 'ch2_empathy',
  });
  assert.equal(defianceMods.defiance, 2);
  assert.equal(defianceMods.empathy, 1);
  assert.equal(defianceMods.dominantStance, 'defiance');
  assert.equal(defianceMods.sovereignPerkId, 'sovereign_breaker');
  assert.equal(defianceMods.damageMult, 1.06);
  assert.equal(defianceMods.staggerMult, 1.12);
  assert.equal(defianceMods.bossExposedBonusMult, 1.1);
  assert.equal(defianceMods.maxIntegrityBonus, 5);
  assert.equal(defianceMods.parryHealBonus, 3);

  const empathyMods = computeStanceDoctrineModifiers({
    story_prologue_wake: 'pro_empathy',
    story_ch1_containment: 'ch1_empathy',
  });
  assert.equal(empathyMods.sovereignPerkId, 'sovereign_aegis');
  assert.equal(empathyMods.maxIntegrityBonus, 20); // 2*5 + 10 sovereign
  assert.equal(empathyMods.parryHealBonus, 10); // 2*3 + 4 sovereign

  const codaVi = getStanceLoomCoda(
    {
      story_prologue_wake: 'pro_empathy',
      story_ch1_containment: 'ch1_empathy',
    },
    'vi'
  );
  assert.ok(codaVi);
  assert.ok(codaVi.title.includes('THẤU CẢM'));
  assert.ok(codaVi.body.includes('Lysa'));
});

test('Mythic MK.III Awakening tiers and combat bonuses progress cleanly from MK.I -> MK.II -> MK.III', () => {
  assert.equal(WEAPON_AWAKENING_COST, 2);
  const upgId = 'edge_breaker_cleave';

  assert.equal(getUpgradeTierLevel(upgId, [], [], []), 0);
  assert.equal(getUpgradeTierLevel(upgId, [upgId], [], []), 1);
  assert.equal(getUpgradeTierLevel(upgId, [upgId], [upgId], []), 2);
  assert.equal(getUpgradeTierLevel(upgId, [upgId], [upgId], [upgId]), 3);
  assert.equal(isUpgradeAwakened(upgId, [upgId]), true);

  const inactive = computeEquippedMythicBonus(upgId, []);
  assert.equal(inactive.isAwakened, false);
  assert.equal(inactive.damageMult, 1.0);
  assert.equal(inactive.staggerMult, 1.0);

  const active = computeEquippedMythicBonus(upgId, [upgId]);
  assert.equal(active.isAwakened, true);
  assert.equal(active.damageMult, 1.08);
  assert.equal(active.staggerMult, 1.1);
  assert.equal(active.heatRelief, 2);
  assert.equal(active.fluxBonusOnHit, 2);
});

test('Canonical Loop #413 (412 prior loops) is unified across narrative, nexus, and story arcs', () => {
  assert.ok(CHRONICLE_STORY_ARC.prologue.titleEn.includes('#413'));
  assert.ok(CHRONICLE_STORY_ARC.prologue.titleVi.includes('#413'));
  assert.ok(CHRONICLE_STORY_ARC.chapter_2_choir.titleEn.includes('412'));
  assert.ok(ENDING_CHRONICLES.paradox.epilogueEn.includes('413th'));
  assert.ok(CHRONICLE_LINK_CHAIN[0].linkClueEn.includes('#413'));
  assert.ok(CHRONICLE_LINK_CHAIN[3].linkClueEn.includes('412'));
  assert.ok(STORY_ARCS[0].lines[2].role.includes('413'));
});

test('Vietnamese localization covers all 10 weapon mods, 9 rig modules, 4 neural protocols, 6 story arcs, and comms', () => {
  const allUpgrades = Object.values(GAME_CONFIG.weapons.upgrades);
  assert.equal(allUpgrades.length, 10);
  for (const upg of allUpgrades) {
    const vi = localizeWeaponUpgrade(upg, 'vi');
    assert.notEqual(vi.name, upg.name);
    assert.notEqual(vi.benefitText, upg.benefitText);
  }

  const allRig = getAllRigModuleDefinitions();
  assert.equal(allRig.length, 9);
  for (const mod of allRig) {
    const vi = localizeRigModule(mod, 'vi');
    assert.notEqual(vi.name, mod.name);
    assert.notEqual(vi.benefitText, mod.benefitText);
  }

  const allProto = getAllNeuralProtocolDefinitions();
  assert.equal(allProto.length, 4);
  for (const proto of allProto) {
    const vi = localizeNeuralProtocol(proto, 'vi');
    assert.notEqual(vi.name, proto.name);
  }

  const arcs = buildStoryArcStates({});
  assert.equal(arcs.length, 6);
  for (const arc of arcs) {
    const viArc = localizeStoryArc(arc, 'vi');
    assert.notEqual(viArc.title, arc.title);
    assert.equal(viArc.lines.length, 3);
    assert.notEqual(viArc.lines[0].line, arc.lines[0].line);
    assert.notEqual(viArc.choices[0].label, arc.choices[0].label);
  }

  const sampleComms = localizeCommsTransmission(
    {
      ...GAME_CONFIG.narrativeComms.prologue_wake,
      remainingTime: 5,
      maxDuration: 6.5,
    },
    'vi'
  );
  assert.ok(sampleComms.headline.includes('CHRONO RIG'));
  assert.equal(sampleComms.localizedClassification, 'NHẬT KÝ GHI ÂM');
  assert.equal(localizeMasteryRankLabel('I · CALIBRATED', 'vi'), 'I · HIỆU CHUẨN');
  assert.ok(localizeHudObjectiveText('STEP 1 OF 3 · HOLD ANCHOR PAD 01', 'vi').includes('BƯỚC 1 / 3'));
  assert.ok(
    localizeBenchActionMessage(
      'UPGRADE BENCH READY · EARN MEMORY FRAGMENTS IN CAMPAIGN MILESTONES',
      'vi'
    ).includes('BÀN NÂNG CẤP SẴN SÀNG')
  );
});

import {
  awakenWeaponUpgrade,
  createInitialWorld,
  overclockWeaponUpgrade,
  purchaseWeaponUpgrade,
  resolveStoryArcChoice,
  sanitizePersistedWeaponProgressionState,
} from './simulation.ts';

test('Simulation awakenWeaponUpgrade enforces MK.II prerequisite, deducts 2 Fragments, persists in Save V2, and Empathy choices raise Max Integrity', () => {
  const world = createInitialWorld('playing');
  world.progression.memoryFragments = 10;

  // Cannot awaken before purchasing and overclocking
  const earlyAttempt = awakenWeaponUpgrade(world, 'edge_breaker_cleave');
  assert.equal(earlyAttempt.success, false);
  assert.equal(earlyAttempt.outcome, 'invalid_upgrade');

  assert.equal(purchaseWeaponUpgrade(world, 'edge_breaker_cleave').success, true);
  assert.equal(awakenWeaponUpgrade(world, 'edge_breaker_cleave').success, false);

  assert.equal(overclockWeaponUpgrade(world, 'edge_breaker_cleave').success, true);
  world.events.length = 0;

  const beforeFrags = world.progression.memoryFragments;
  const awakenRes = awakenWeaponUpgrade(world, 'edge_breaker_cleave');
  assert.equal(awakenRes.success, true);
  assert.equal(awakenRes.outcome, 'purchased');
  assert.equal(world.progression.memoryFragments, beforeFrags - WEAPON_AWAKENING_COST);
  assert.deepEqual(world.progression.awakenedUpgrades, ['edge_breaker_cleave']);
  assert.ok(world.events.some((ev) => ev.type === 'weapon_mythic_awakened'));

  // Duplicate awakening blocked
  assert.equal(awakenWeaponUpgrade(world, 'edge_breaker_cleave').outcome, 'already_owned');

  // Save V2 round-trip preserves awakenedUpgrades
  const sanitized = sanitizePersistedWeaponProgressionState({
    ...world.progression,
    awakenedUpgrades: ['edge_breaker_cleave', 'edge_breaker_cleave', 'invalid_id' as never],
  });
  assert.deepEqual(sanitized.awakenedUpgrades, ['edge_breaker_cleave']);

  // Resolving Empathy story choice immediately syncs +5 Max Integrity via Stance Doctrine
  const baseMaxHp = world.player.maxIntegrity;
  const resolved = resolveStoryArcChoice(world, 'story_prologue_wake', 'pro_empathy');
  assert.equal(resolved, true);
  assert.equal(world.player.maxIntegrity, baseMaxHp + 5);
});

