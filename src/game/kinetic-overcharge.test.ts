import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OVERCHARGE_DURATION_SEC,
  addWeaponKineticCharge,
  createInitialKineticOverchargeState,
  getActiveWeaponOverchargeModifiers,
  tickWeaponKineticOvercharge,
} from './kinetic-overcharge.ts';

test('addWeaponKineticCharge builds per-weapon meter and triggers Overcharge at 100%', () => {
  const state = createInitialKineticOverchargeState();

  const r1 = addWeaponKineticCharge(state, 'chrono_scythe', 55);
  assert.equal(r1.triggered, false);
  assert.equal(state.charges.chrono_scythe, 55);
  assert.equal(state.activeWeaponId, null);

  const r2 = addWeaponKineticCharge(state, 'chrono_scythe', 50);
  assert.equal(r2.triggered, true);
  assert.equal(state.activeWeaponId, 'chrono_scythe');
  assert.equal(state.activeTimer, OVERCHARGE_DURATION_SEC);
  assert.equal(state.charges.chrono_scythe, 0);
  assert.equal(state.totalOvercharges, 1);
  assert.ok(r2.perk && r2.perk.vortexPullBonus > 1.5);
});

test('getActiveWeaponOverchargeModifiers returns weapon-specific perks only when matching weapon is equipped', () => {
  const state = createInitialKineticOverchargeState();
  addWeaponKineticCharge(state, 'grav_breaker', 100);

  const activeMaul = getActiveWeaponOverchargeModifiers(state, 'grav_breaker');
  assert.equal(activeMaul.isActive, true);
  assert.equal(activeMaul.damageTakenMult, 0.7);
  assert.equal(activeMaul.staggerMult, 1.35);

  const swappedEdge = getActiveWeaponOverchargeModifiers(state, 'chrono_edge');
  assert.equal(swappedEdge.isActive, false);
  assert.equal(swappedEdge.damageMult, 1.0);
});

test('tickWeaponKineticOvercharge expires active Overcharge cleanly and decays partial meters', () => {
  const state = createInitialKineticOverchargeState();
  addWeaponKineticCharge(state, 'pulsecaster', 100);
  addWeaponKineticCharge(state, 'phase_rail', 30);

  const mid = tickWeaponKineticOvercharge(state, 3.0);
  assert.equal(mid.expired, false);
  assert.equal(state.activeWeaponId, 'pulsecaster');
  assert.ok(state.charges.phase_rail < 30 && state.charges.phase_rail > 20);

  const end = tickWeaponKineticOvercharge(state, 3.5);
  assert.equal(end.expired, true);
  assert.equal(end.expiredWeaponId, 'pulsecaster');
  assert.equal(state.activeWeaponId, null);
  assert.equal(state.activeTimer, 0);
});

test('pulsecaster Overcharge grants zero heat and phase_rail grants fast charge', () => {
  const state = createInitialKineticOverchargeState();
  addWeaponKineticCharge(state, 'pulsecaster', 100);
  const pulse = getActiveWeaponOverchargeModifiers(state, 'pulsecaster');
  assert.equal(pulse.heatMult, 0.0);
  assert.ok(pulse.damageMult > 1.2);

  addWeaponKineticCharge(state, 'phase_rail', 100);
  const rail = getActiveWeaponOverchargeModifiers(state, 'phase_rail');
  assert.ok(rail.chargeSpeedMult >= 1.6);
  assert.ok(rail.damageMult >= 1.28);
});
