import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FLASH_SWAP_COOLDOWN_SEC,
  FLASH_SWAP_DAMAGE_BONUS,
  FLASH_SWAP_FLUX_REWARD,
  FLASH_SWAP_STAGGER_BONUS,
  FLASH_SWAP_STYLE_REWARD,
  HIT_COMBO_WINDOW_SEC,
  PHANTOM_RIPOSTE_DAMAGE_BONUS,
  PHANTOM_RIPOSTE_FLAT_STAGGER,
  armPhantomRiposte,
  consumeSingularityStrikeMultipliers,
  createInitialSingularityCombatState,
  registerSingularityHit,
  resetSingularityComboOnDamage,
  tickSingularityCombat,
  tryTriggerFlashSwap,
} from './singularity-combat.ts';

test('registerSingularityHit increments combo, tracks peak, and awards 10/20/30 milestones once per streak', () => {
  const s = createInitialSingularityCombatState();
  let milestone10 = false;
  for (let i = 0; i < 10; i++) {
    const out = registerSingularityHit(s);
    if (out.milestoneHit === 10) {
      milestone10 = true;
      assert.equal(out.bonusFlux, 10);
      assert.equal(out.bonusStyle, 14);
    }
  }
  assert.equal(milestone10, true);
  assert.equal(s.hitComboCount, 10);
  assert.equal(s.bestHitCombo, 10);
  assert.equal(s.hitComboTimer, HIT_COMBO_WINDOW_SEC);

  // Next hit does not re-trigger milestone 10
  const eleventh = registerSingularityHit(s);
  assert.equal(eleventh.milestoneHit, null);
  assert.equal(s.hitComboCount, 11);

  // Decay resets active streak but preserves bestHitCombo
  tickSingularityCombat(s, HIT_COMBO_WINDOW_SEC + 0.1);
  assert.equal(s.hitComboCount, 0);
  assert.equal(s.bestHitCombo, 11);
  assert.equal(s.lastMilestoneReached, 0);
});

test('tryTriggerFlashSwap succeeds only inside post-hit window and enforces cooldown', () => {
  const s = createInitialSingularityCombatState();

  // Cannot trigger without a recent hit
  const dry = tryTriggerFlashSwap(s);
  assert.equal(dry.triggered, false);

  // Land a hit -> Flash Swap window opens
  registerSingularityHit(s);
  const swap = tryTriggerFlashSwap(s);
  assert.equal(swap.triggered, true);
  assert.equal(swap.bonusFlux, FLASH_SWAP_FLUX_REWARD);
  assert.equal(swap.bonusStyle, FLASH_SWAP_STYLE_REWARD);
  assert.equal(s.flashSwapCount, 1);
  assert.ok(s.flashSwapAmpTimer > 0);
  assert.equal(s.flashSwapCooldown, FLASH_SWAP_COOLDOWN_SEC);

  // Immediate second hit + swap is blocked by cooldown
  registerSingularityHit(s);
  const blocked = tryTriggerFlashSwap(s);
  assert.equal(blocked.triggered, false);

  // After cooldown elapses + fresh hit -> works again
  tickSingularityCombat(s, FLASH_SWAP_COOLDOWN_SEC + 0.05);
  registerSingularityHit(s);
  const secondSwap = tryTriggerFlashSwap(s);
  assert.equal(secondSwap.triggered, true);
  assert.equal(s.flashSwapCount, 2);
});

test('consumeSingularityStrikeMultipliers stacks Flash Swap + Phantom Riposte cleanly and consumes them', () => {
  const s = createInitialSingularityCombatState();
  registerSingularityHit(s);
  tryTriggerFlashSwap(s);
  armPhantomRiposte(s);

  // Ranged strike consumes Flash Swap only, preserving Phantom Riposte for melee/scythe
  const ranged = consumeSingularityStrikeMultipliers(s, false);
  assert.equal(ranged.consumedFlashSwap, true);
  assert.equal(ranged.consumedPhantomRiposte, false);
  assert.ok(Math.abs(ranged.damageMult - (1 + FLASH_SWAP_DAMAGE_BONUS)) < 1e-6);
  assert.ok(Math.abs(ranged.staggerMult - (1 + FLASH_SWAP_STAGGER_BONUS)) < 1e-6);
  assert.equal(ranged.bonusFlatStagger, 0);

  // Next melee strike consumes Phantom Riposte
  const melee = consumeSingularityStrikeMultipliers(s, true);
  assert.equal(melee.consumedFlashSwap, false);
  assert.equal(melee.consumedPhantomRiposte, true);
  assert.ok(Math.abs(melee.damageMult - (1 + PHANTOM_RIPOSTE_DAMAGE_BONUS)) < 1e-6);
  assert.equal(melee.bonusFlatStagger, PHANTOM_RIPOSTE_FLAT_STAGGER);

  // Third strike has baseline multipliers
  const base = consumeSingularityStrikeMultipliers(s, true);
  assert.equal(base.damageMult, 1);
  assert.equal(base.staggerMult, 1);
  assert.equal(base.bonusFlatStagger, 0);
});

test('resetSingularityComboOnDamage clears active streak and Flash Swap window', () => {
  const s = createInitialSingularityCombatState();
  registerSingularityHit(s, 7);
  assert.equal(s.hitComboCount, 7);
  assert.ok(s.flashSwapWindowTimer > 0);

  resetSingularityComboOnDamage(s);
  assert.equal(s.hitComboCount, 0);
  assert.equal(s.hitComboTimer, 0);
  assert.equal(s.flashSwapWindowTimer, 0);
  assert.equal(s.bestHitCombo, 7);
});
