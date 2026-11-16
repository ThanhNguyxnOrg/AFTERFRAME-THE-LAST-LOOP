import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTIVE_VENT_CONFIG,
  ADRENALINE_GAINS,
  ADRENALINE_GRACE_DURATION,
  applyAdrenalineDelta,
  evaluateActiveVentTiming,
  getAdrenalineModifiers,
  getAdrenalineTier,
  tickAdrenalineDecay,
} from './adrenaline.ts';
import type { PlayerState } from './types.ts';

function makeMockPlayer(): PlayerState {
  return {
    adrenalineScore: 0,
    adrenalineDecayGraceTimer: 0,
  } as PlayerState;
}

test('Adrenaline tier boundaries and zero-penalty Tier 0/1 damage multipliers stay exact', () => {
  assert.equal(getAdrenalineTier(undefined), 0);
  assert.equal(getAdrenalineTier(0), 0);
  assert.equal(getAdrenalineTier(0.99), 0);
  assert.equal(getAdrenalineTier(1.0), 1);
  assert.equal(getAdrenalineTier(5.95), 5);
  assert.equal(getAdrenalineTier(12), 5);

  const tier0 = getAdrenalineModifiers(0);
  assert.equal(tier0.damageMult, 1.0);
  assert.equal(tier0.staggerMult, 1.0);
  assert.equal(tier0.fluxRegenMult, 1.0);

  // Tier 1 boosts Flux regen cleanly without altering riposte damage arithmetic
  const tier1 = getAdrenalineModifiers(1.0);
  assert.equal(tier1.fluxRegenMult, 1.15);
  assert.equal(tier1.damageMult, 1.0);

  const tier5 = getAdrenalineModifiers(5.4);
  assert.equal(tier5.tier, 5);
  assert.equal(tier5.siphonOnKillHp, 8);
  assert.ok(tier5.damageMult > 1.15);
});

test('applyAdrenalineDelta climbs tiers, refreshes grace, and drops smoothly on damage', () => {
  const player = makeMockPlayer();
  const up1 = applyAdrenalineDelta(player, ADRENALINE_GAINS.parry);
  assert.equal(up1.prevTier, 0);
  assert.equal(up1.nextTier, 1);
  assert.equal(up1.tierDelta, 1);
  assert.equal(player.adrenalineDecayGraceTimer, ADRENALINE_GRACE_DURATION);

  applyAdrenalineDelta(player, ADRENALINE_GAINS.parry * 2);
  assert.equal(getAdrenalineTier(player.adrenalineScore), 3);

  const hit = applyAdrenalineDelta(player, ADRENALINE_GAINS.damageTakenPenalty, false);
  assert.equal(hit.prevTier, 3);
  assert.equal(hit.nextTier, 1);
  assert.equal(hit.tierDelta, -2);
});

test('tickAdrenalineDecay pauses when idle or outside combat and decays after grace expires', () => {
  const player = makeMockPlayer();
  applyAdrenalineDelta(player, 2.2);

  // Safe exploration: grace runs down, score stays intact even after grace hits 0
  tickAdrenalineDecay(player, 10, false);
  assert.equal(player.adrenalineDecayGraceTimer, 0);
  assert.equal(player.adrenalineScore, 2.2);

  // Active combat after grace expired: decays smoothly
  const res = tickAdrenalineDecay(player, 1.0, true);
  assert.ok((player.adrenalineScore ?? 0) < 2.2);
  assert.equal(res.tierDelta, -1);
});

test('evaluateActiveVentTiming accurately scores early, sweet_spot, and late lockout windows', () => {
  const lockout = 2.0;

  // Early (progress = 0.20)
  const early = evaluateActiveVentTiming(1.6, lockout);
  assert.equal(early.inWindow, false);
  assert.equal(early.zone, 'early');

  // Inside [0.36..0.68] (progress = 0.50)
  const midProgress = (ACTIVE_VENT_CONFIG.windowStart + ACTIVE_VENT_CONFIG.windowEnd) * 0.5;
  const sweet = evaluateActiveVentTiming(lockout * (1 - midProgress), lockout);
  assert.equal(sweet.inWindow, true);
  assert.equal(sweet.zone, 'sweet_spot');

  // Late (progress = 0.85)
  const late = evaluateActiveVentTiming(0.3, lockout);
  assert.equal(late.inWindow, false);
  assert.equal(late.zone, 'late');
});
