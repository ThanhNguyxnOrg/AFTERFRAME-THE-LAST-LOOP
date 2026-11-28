import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MASTERY_SEAL_TIERS,
  MASTERY_TARGETS,
  TEMPORAL_SLIP_CONFIG,
  claimAllReadyMasteryBounties,
  claimCombatMasteryBounty,
  computeEffectiveHostileTimeScale,
  computeLiveTacticalRankForecast,
  computeMasterySealModifiers,
  recordCombatMasteryVictory,
  sanitizeCombatMasteryLedger,
  tickTemporalSlipTimers,
  tryTriggerTemporalSlip,
} from './combat-mastery.ts';
import {
  applyDamageToPlayer,
  claimAllMasteryBountiesInWorld,
  claimMasteryBountyInWorld,
  createEmptyInput,
  createInitialWorld,
  extractHudSnapshot,
  parseAndApplyCampaignProgress,
  serializeCampaignProgress,
  startPracticeBossRun,
  stepWorld,
  triggerBossDefeat,
  transitionCampaignToBoss,
} from './simulation.ts';
import type { CombatMasteryLedgerMap, RunSummary } from './types.ts';

function makeVictorySummary(overrides: Partial<RunSummary> = {}): RunSummary {
  return {
    outcome: 'victory',
    chapter: 'chapter_1_helix',
    bossId: 'helix-04',
    selectedEnding: null,
    elapsedTime: 34,
    enemiesDefeated: 1,
    totalEnemies: 1,
    damageDealt: 450,
    damageTaken: 0,
    parriesLanded: 3,
    perfectDodges: 2,
    vulnerableHits: 4,
    convergencesTriggered: 2,
    relaysUsed: 1,
    remainingTargetHp: 0,
    ...overrides,
  };
}

test('v3.9.0 Temporal Slip-Time: triggers 1.35s base dilation with 2.4s ICD and scales only hostile dt (0.38x)', () => {
  const player = createInitialWorld('playing').player;
  assert.equal(computeEffectiveHostileTimeScale(1.0, player.temporalSlipTimer), 1.0);

  const first = tryTriggerTemporalSlip(player, 0.3);
  assert.equal(first.triggered, true);
  assert.equal(first.durationSec, 1.65);
  assert.equal(player.temporalSlipTimer, 1.65);
  assert.equal(player.temporalSlipMaxDuration, 1.65);
  assert.equal(player.temporalSlipCooldown, TEMPORAL_SLIP_CONFIG.cooldownSec);
  assert.equal(
    computeEffectiveHostileTimeScale(1.0, player.temporalSlipTimer),
    TEMPORAL_SLIP_CONFIG.hostileTimeScale
  );

  // Cooldown prevents chain-stunlocking during ICD
  const blocked = tryTriggerTemporalSlip(player, 0.3);
  assert.equal(blocked.triggered, false);

  // Overdrive (0.28x) takes min(0.28, 0.38) = 0.28
  assert.equal(computeEffectiveHostileTimeScale(0.28, player.temporalSlipTimer), 0.28);

  // Tick past active duration; cooldown still finishing
  tickTemporalSlipTimers(player, 1.7);
  assert.equal(player.temporalSlipTimer, 0);
  assert.equal(player.temporalSlipMaxDuration, 0);
  assert.ok((player.temporalSlipCooldown ?? 0) > 0);
  assert.equal(computeEffectiveHostileTimeScale(1.0, player.temporalSlipTimer), 1.0);

  // Tick past ICD; ready again
  tickTemporalSlipTimers(player, 1.0);
  assert.equal(player.temporalSlipCooldown, 0);
  const retriggered = tryTriggerTemporalSlip(player, 0);
  assert.equal(retriggered.triggered, true);
  assert.equal(retriggered.durationSec, TEMPORAL_SLIP_CONFIG.baseDurationSec);
});

test('v3.9.0 In-World Perfect Dodge: emits temporal_slip_triggered and slows hostile projectiles without slowing Sera', () => {
  const world = createInitialWorld('playing');
  startPracticeBossRun(world, true, 'helix-04');
  world.obstacles = [];

  const p = world.player;
  p.actionState = 'dodging';
  p.stateTimer = 0.18;
  p.invulnTimer = 0.18;
  p.dodgeCounterTriggered = false;

  const bossEnemy = world.enemies[0];
  const tookDamage = applyDamageToPlayer(world, 25, bossEnemy);
  assert.equal(tookDamage, false);
  assert.ok(
    world.events.some((ev) => ev.type === 'temporal_slip_triggered'),
    'Timed Perfect Dodge must emit temporal_slip_triggered'
  );
  assert.equal(p.temporalSlipTimer, TEMPORAL_SLIP_CONFIG.baseDurationSec);

  const snap = extractHudSnapshot(world);
  assert.equal(snap.combatFlow?.temporalSlipRemaining, TEMPORAL_SLIP_CONFIG.baseDurationSec);
  assert.equal(snap.combatFlow?.temporalSlipMax, TEMPORAL_SLIP_CONFIG.baseDurationSec);
  assert.equal(snap.liveRankForecast?.hitless, true);

  // Verify hostile boss AI timers tick at 0.38x (enemyDt) while Sera ticks at full 1.0x (playerDt)
  world.hitstopTimer = 0;
  world.boss!.aiState = 'pursue';
  world.boss!.cooldownTimer = 2.0;
  p.stateTimer = 0.18;
  stepWorld(world, createEmptyInput(), 0.04);
  const bossDtElapsed = 2.0 - world.boss!.cooldownTimer;
  const playerDtElapsed = 0.18 - p.stateTimer;
  assert.ok(
    Math.abs(bossDtElapsed - 0.04 * TEMPORAL_SLIP_CONFIG.hostileTimeScale) < 1e-4,
    `Expected hostile boss timer to advance at 0.38x (${0.04 * 0.38}), got ${bossDtElapsed}`
  );
  assert.ok(
    Math.abs(playerDtElapsed - 0.04) < 1e-4,
    `Expected Sera stateTimer to advance at 1.0x (0.04), got ${playerDtElapsed}`
  );
});

test('v3.9.0 Sovereign Mastery Ledger: records bestGrade/hitless across 12 canonical trials, claims +1◆ bounties once, and scales Mastery Seals Tiers 0..4', () => {
  assert.equal(MASTERY_TARGETS.length, 12);

  let ledger: CombatMasteryLedgerMap = {};
  assert.equal(computeMasterySealModifiers(ledger).tier, 0);
  assert.equal(computeMasterySealModifiers(ledger).allDamageMult, 1.0);

  // First clear at B-rank with damage taken -> 0 bounties
  const recB = recordCombatMasteryVictory(
    ledger,
    ['boss_helix_04'],
    makeVictorySummary({
      elapsedTime: 185,
      damageTaken: 65,
      parriesLanded: 0,
      perfectDodges: 0,
      vulnerableHits: 0,
      convergencesTriggered: 0,
      relaysUsed: 0,
    })
  );
  ledger = recB.ledger;
  assert.equal(ledger.boss_helix_04?.bestGrade, 'B');
  assert.equal(ledger.boss_helix_04?.hitless, false);
  assert.equal(recB.newlyUnlockedBounties, 0);

  // Second clear at S+ Hitless -> upgrades bestGrade to S+, unlocks 2 bounties (s_rank + hitless)
  const recSPlus = recordCombatMasteryVictory(ledger, ['boss_helix_04'], makeVictorySummary());
  ledger = recSPlus.ledger;
  assert.equal(recSPlus.grade, 'S+');
  assert.equal(recSPlus.isNewBestGrade, true);
  assert.equal(recSPlus.newlyUnlockedBounties, 2);
  assert.equal(ledger.boss_helix_04?.bestGrade, 'S+');
  assert.equal(ledger.boss_helix_04?.hitless, true);
  assert.equal(ledger.boss_helix_04?.clears, 2);

  // Unclaimed seals keep modifiers at Tier 0 (1.0x) while reporting pendingBountyCount === 2
  const beforeClaim = computeMasterySealModifiers(ledger);
  assert.equal(beforeClaim.tier, 0);
  assert.equal(beforeClaim.pendingBountyCount, 2);
  assert.equal(beforeClaim.allDamageMult, 1.0);

  // Claim S-Rank (+1◆) and Hitless (+1◆) -> 2 claimed seals activates Seal I (Bronze Chronomancer)
  const c1 = claimCombatMasteryBounty(ledger, 'boss_helix_04', 's_rank');
  assert.equal(c1.claimed, true);
  assert.equal(c1.fragmentsAwarded, 1);
  // Duplicate claim is rejected
  assert.equal(claimCombatMasteryBounty(c1.ledger, 'boss_helix_04', 's_rank').claimed, false);

  const c2 = claimCombatMasteryBounty(c1.ledger, 'boss_helix_04', 'hitless');
  assert.equal(c2.claimed, true);
  ledger = c2.ledger;

  const seal1 = computeMasterySealModifiers(ledger);
  assert.equal(seal1.tier, 1);
  assert.equal(seal1.claimedSealsCount, 2);
  assert.equal(seal1.pendingBountyCount, 0);
  assert.equal(seal1.allDamageMult, MASTERY_SEAL_TIERS[1].allDamageMult);
  assert.equal(seal1.bonusMaxWard, MASTERY_SEAL_TIERS[1].bonusMaxWard);
  assert.equal(seal1.bonusSlipDurationSec, MASTERY_SEAL_TIERS[1].bonusSlipDurationSec);

  // Clear 5 more targets at S+ Hitless (10 more bounties -> 12 total seals -> Seal IV Sovereign Ω)
  const moreTargets = [
    'sector_prologue',
    'sector_ch1_helix',
    'boss_the_choir',
    'boss_the_curator',
    'boss_echo_zero',
  ] as const;
  const recBatch = recordCombatMasteryVictory(ledger, moreTargets, makeVictorySummary());
  const claimedAll = claimAllReadyMasteryBounties(recBatch.ledger);
  assert.equal(claimedAll.claimedCount, 10);
  assert.equal(claimedAll.fragmentsAwarded, 10);

  const seal4 = computeMasterySealModifiers(claimedAll.ledger);
  assert.equal(seal4.tier, 4);
  assert.equal(seal4.claimedSealsCount, 12);
  assert.equal(seal4.allDamageMult, 1.16);
  assert.equal(seal4.bonusMaxWard, 24);
  assert.equal(seal4.overdriveChargeMult, 1.28);
  assert.equal(seal4.bonusSlipDurationSec, 0.6);
  assert.equal(seal4.nextTierMinSeals, null);
});

test('v3.9.0 World & Save V2 Integration: boss defeat records ledger without auto-mutating fragments until claimed, and Save V2 round-trips combatMastery', () => {
  const world = createInitialWorld('playing');
  transitionCampaignToBoss(world, true, 'chapter_1_helix');
  world.stats.parriesLanded = 3;
  world.stats.perfectDodges = 2;
  world.stats.vulnerableHits = 4;
  world.resonance.convergenceCount = 2;

  triggerBossDefeat(world);
  // Campaign Chapter 1 boss defeat grants exactly 3 fragments (unchanged); bounties wait for explicit claim
  assert.equal(world.progression.memoryFragments, 3);
  assert.equal(world.progression.combatMastery.boss_helix_04?.bestGrade, 'S+');
  assert.equal(world.progression.combatMastery.sector_ch1_helix?.bestGrade, 'S+');

  // Claim all ready bounties (2 targets * 2 bounties = +4◆ -> Seal I active)
  const claimedCount = claimAllMasteryBountiesInWorld(world);
  assert.equal(claimedCount, 4);
  assert.equal(world.progression.memoryFragments, 7);
  assert.ok(world.events.some((e) => e.type === 'mastery_bounty_claimed'));

  // Export & re-import Save V2
  const rawSave = serializeCampaignProgress(world);
  const restoredWorld = createInitialWorld('title');
  const imported = parseAndApplyCampaignProgress(restoredWorld, rawSave);
  assert.equal(imported, true);
  assert.equal(restoredWorld.progression.memoryFragments, 7);
  assert.equal(restoredWorld.progression.combatMastery.boss_helix_04?.bestGrade, 'S+');
  assert.equal(restoredWorld.progression.combatMastery.boss_helix_04?.sRankRewardClaimed, true);
  assert.equal(restoredWorld.progression.combatMastery.boss_helix_04?.hitlessRewardClaimed, true);

  // Sanitizer rejects malformed grades and reward flags when grade < S
  const sanitized = sanitizeCombatMasteryLedger({
    boss_helix_04: {
      bestGrade: 'B',
      bestScore: 55,
      bestTimeSec: 90,
      hitless: false,
      clears: 1,
      sRankRewardClaimed: true,
      hitlessRewardClaimed: true,
    },
    unknown_id: { bestGrade: 'S+' },
  });
  assert.equal(sanitized.boss_helix_04?.sRankRewardClaimed, false);
  assert.equal(sanitized.boss_helix_04?.hitlessRewardClaimed, false);
  assert.equal((sanitized as Record<string, unknown>).unknown_id, undefined);

  // Claim single bounty helper check
  const w2 = createInitialWorld('playing');
  startPracticeBossRun(w2, true, 'the-choir');
  w2.stats.parriesLanded = 3;
  w2.stats.perfectDodges = 2;
  w2.stats.vulnerableHits = 4;
  triggerBossDefeat(w2);
  assert.equal(w2.progression.memoryFragments, 0);
  assert.equal(claimMasteryBountyInWorld(w2, 'boss_the_choir', 's_rank'), true);
  assert.equal(w2.progression.memoryFragments, 1);

  // Live rank forecast sanity check
  const forecast = computeLiveTacticalRankForecast({
    elapsedTime: 20,
    damageTaken: 0,
    parriesLanded: 1,
    perfectDodges: 0,
    vulnerableHits: 0,
    convergencesTriggered: 0,
    relaysUsed: 0,
  });
  assert.equal(forecast.hitless, true);
  assert.ok(forecast.score >= 72);
});
