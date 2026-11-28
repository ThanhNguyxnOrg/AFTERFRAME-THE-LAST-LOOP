import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MOMENTUM_STREAK_DURATION_SEC,
  WEAKPOINT_BREAK_DURATION_SEC,
  WEAKPOINT_DAMAGE_MULT,
  createInitialChronoMomentumState,
  getChronoMomentumModifiers,
  registerMomentumStreakEvent,
  tickChronoMomentumState,
  triggerWeakpointBreakWindow,
} from './chrono-momentum.ts';

test('Chrono Momentum scales cleanly across Tiers 0 -> 1 -> 2 -> 3 and awards bonus fragments at Tier 2+', () => {
  const m = createInitialChronoMomentumState();
  assert.equal(m.tier, 0);
  assert.equal(m.multiplier, 1.0);

  let r = registerMomentumStreakEvent(m, 1);
  assert.equal(m.tier, 0);
  assert.equal(r.tierUp, false);

  r = registerMomentumStreakEvent(m, 1);
  assert.equal(m.tier, 1);
  assert.equal(m.multiplier, 1.25);
  assert.equal(r.tierUp, true);
  assert.equal(r.awardBonusFragment, false);

  r = registerMomentumStreakEvent(m, 2);
  assert.equal(m.tier, 2);
  assert.equal(m.multiplier, 1.5);
  assert.equal(r.tierUp, true);
  assert.equal(r.awardBonusFragment, true);

  r = registerMomentumStreakEvent(m, 2);
  assert.equal(m.tier, 3);
  assert.equal(m.multiplier, 2.0);
  assert.equal(r.tierUp, true);
  assert.equal(r.awardBonusFragment, true);
  assert.equal(m.bonusFragmentsAwarded, 2);
  assert.equal(m.peakStreak, 6);
});

test('Weakpoint Break opens 4.5s +20% damage window and stacks multiplicatively with Momentum tier', () => {
  const m = createInitialChronoMomentumState();
  registerMomentumStreakEvent(m, 3); // streak 3 -> tier 1 (1.08x)
  const brk = triggerWeakpointBreakWindow(m); // streak 4 -> tier 2 (1.16x) + weakpoint (1.2x)
  assert.equal(brk.newlyOpened, true);
  assert.equal(brk.newTier, 2);
  assert.equal(m.weakpointTimer, WEAKPOINT_BREAK_DURATION_SEC);

  const mods = getChronoMomentumModifiers(m);
  assert.equal(mods.weakpointActive, true);
  assert.ok(Math.abs(mods.damageMult - 1.16 * WEAKPOINT_DAMAGE_MULT) < 0.0001);
});

test('tickChronoMomentumState decays weakpoint and resets streak cleanly when timer expires', () => {
  const m = createInitialChronoMomentumState();
  triggerWeakpointBreakWindow(m);
  registerMomentumStreakEvent(m, 3);
  assert.equal(m.tier, 2);

  tickChronoMomentumState(m, WEAKPOINT_BREAK_DURATION_SEC + 0.1);
  assert.equal(m.weakpointTimer, 0);
  assert.equal(m.tier, 2); // streak timer is 7.0s so streak is still live

  tickChronoMomentumState(m, MOMENTUM_STREAK_DURATION_SEC);
  assert.equal(m.streak, 0);
  assert.equal(m.tier, 0);
  assert.equal(m.multiplier, 1.0);
  assert.equal(m.peakStreak, 4);
});
