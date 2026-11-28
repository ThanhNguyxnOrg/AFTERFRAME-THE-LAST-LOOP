import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeGlobalArsenalMasteryBonus,
  createInitialWeaponResonanceState,
  getActiveWeaponResonanceModifiers,
  resolveWeaponSwapResonanceId,
  tickWeaponResonanceState,
  triggerWeaponSwapResonance,
} from './chrono-resonance.ts';

test('v3.1.0 resolveWeaponSwapResonanceId maps all 4 signature weapon pairing archetypes accurately', () => {
  assert.equal(resolveWeaponSwapResonanceId('chrono_edge', 'chrono_scythe'), 'blade_reaper');
  assert.equal(resolveWeaponSwapResonanceId('pulsecaster', 'phase_rail'), 'plasma_overload');
  assert.equal(resolveWeaponSwapResonanceId('grav_breaker', 'chrono_edge'), 'seismic_vortex');
  assert.equal(resolveWeaponSwapResonanceId('chrono_edge', 'pulsecaster'), 'temporal_flux_shift');
  assert.equal(resolveWeaponSwapResonanceId('chrono_edge', 'chrono_edge'), null);
});

test('v3.1.0 triggerWeaponSwapResonance enforces 3.5s cooldown and cleanly expires active modifiers', () => {
  const state = createInitialWeaponResonanceState();
  const spec = triggerWeaponSwapResonance(state, 'grav_breaker', 'chrono_scythe');
  assert.ok(spec);
  assert.equal(spec.id, 'seismic_vortex');
  assert.equal(spec.shockwaveRadius, 4.4);
  assert.equal(state.totalTriggers, 1);

  const mods = getActiveWeaponResonanceModifiers(state);
  assert.equal(mods.damageMult, 1.15);
  assert.equal(mods.staggerMult, 1.25);

  // Blocked during cooldown
  assert.equal(triggerWeaponSwapResonance(state, 'pulsecaster', 'phase_rail'), null);

  // Expires cleanly after duration and allows next trigger after cooldown
  tickWeaponResonanceState(state, 3.6);
  assert.equal(state.activeId, null);
  assert.equal(getActiveWeaponResonanceModifiers(state).damageMult, 1.0);
  assert.ok(triggerWeaponSwapResonance(state, 'pulsecaster', 'phase_rail'));
});

test('v3.1.0 computeGlobalArsenalMasteryBonus stays neutral at Rank 1 baseline and scales as weapons level up', () => {
  const base = computeGlobalArsenalMasteryBonus(undefined);
  assert.equal(base.totalRanks, 5);
  assert.equal(base.bonusRanks, 0);
  assert.equal(base.damageMult, 1.0);
  assert.equal(base.staggerMult, 1.0);
  assert.equal(base.fluxGainMult, 1.0);

  const leveled = computeGlobalArsenalMasteryBonus({
    chrono_edge: 400,
    pulsecaster: 400,
    chrono_scythe: 900,
  });
  assert.ok(leveled.bonusRanks > 0);
  assert.ok(leveled.damageMult > 1.0);
  assert.ok(leveled.staggerMult > 1.0);
  assert.ok(leveled.fluxGainMult > 1.0);
});
