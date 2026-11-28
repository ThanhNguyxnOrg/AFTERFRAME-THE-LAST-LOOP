import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WEAPON_MOD_CHIPS,
  canTriggerChronoFinisher,
  computeDailyTrialScore,
  computeStyleRankTier,
  createInitialAscensionState,
  createInitialPhotoModeState,
  createInitialStyleRankState,
  generateDailyTrialConfig,
  getPhotoFilterCss,
  getWeaponModChipDefinition,
  penalizeStyleOnHit,
  recordStyleAction,
  tickStyleRank,
} from './ascension-expansion.ts';
import { TRANSLATIONS, t } from './i18n.ts';

test('v2.4.0 Style Rank escalates from D to SSS with variety bonus and drops on hit/decay', () => {
  const style = createInitialStyleRankState();
  assert.equal(style.tier, 'D');
  assert.equal(canTriggerChronoFinisher(style, false), false);
  assert.equal(canTriggerChronoFinisher(style, true), true);

  const r1 = recordStyleAction(style, 'light_hit', 24, 'LIGHT');
  const r2 = recordStyleAction(style, 'heavy_hit', 36, 'HEAVY');
  const r3 = recordStyleAction(style, 'parry', 48, 'PARRY');
  const r4 = recordStyleAction(style, 'convergence', 55, 'CONVERGENCE');
  const r5 = recordStyleAction(style, 'scythe_vortex', 50, 'VORTEX');
  const r6 = recordStyleAction(style, 'perfect_dodge', 45, 'DODGE');

  assert.ok(r1.pointsAdded > 24, 'Fresh action receives variety multiplier');
  assert.ok(r2.pointsAdded > 36);
  assert.ok(r3.tierChanged || r4.tierChanged || r5.tierChanged || r6.tierChanged);
  assert.equal(style.tier, 'SSS');
  assert.equal(style.peakTier, 'SSS');
  assert.equal(canTriggerChronoFinisher(style, false), true);

  const beforeHit = style.points;
  penalizeStyleOnHit(style);
  assert.equal(style.points, Math.max(0, beforeHit - 55));
  assert.equal(style.hitFreeStreak, 0);

  // Decay kicks in after grace timer elapses
  tickStyleRank(style, 2.0, false);
  const afterGrace = style.points;
  tickStyleRank(style, 3.0, false);
  assert.ok(style.points < afterGrace, 'Style points decay after grace period');
});

test('v2.4.0 Style Rank tier boundaries match canonical thresholds', () => {
  assert.equal(computeStyleRankTier(0), 'D');
  assert.equal(computeStyleRankTier(35), 'C');
  assert.equal(computeStyleRankTier(80), 'B');
  assert.equal(computeStyleRankTier(135), 'A');
  assert.equal(computeStyleRankTier(200), 'S');
  assert.equal(computeStyleRankTier(280), 'SSS');
});

test('v2.4.0 Daily Chrono Trial generation is deterministic per date and distinct across dates', () => {
  const trialA1 = generateDailyTrialConfig('2026-11-24');
  const trialA2 = generateDailyTrialConfig('2026-11-24');
  const trialB = generateDailyTrialConfig('2026-11-25');

  assert.deepEqual(trialA1, trialA2);
  assert.equal(trialA1.seedCode, 'TRIAL-20261124');
  assert.equal(trialA1.mutatorKeys.length, 2);
  assert.notEqual(trialA1.mutatorKeys[0], trialA1.mutatorKeys[1]);
  assert.notEqual(trialA1.seedCode, trialB.seedCode);

  const fastHighStyle = computeDailyTrialScore(52, 290, 0, trialA1.parTimeSec);
  const slowDamaged = computeDailyTrialScore(140, 40, 80, trialA1.parTimeSec);
  assert.ok(fastHighStyle > slowDamaged, 'Faster high-style clean runs score higher');
});

test('v2.4.0 Weapon Mod Chips, Photo Mode presets, and EN/VI i18n dictionary are complete', () => {
  assert.equal(WEAPON_MOD_CHIPS.length, 3);
  assert.equal(getWeaponModChipDefinition('mod_volt_arc')?.shortLabel, 'VOLT ARC');
  assert.equal(getWeaponModChipDefinition('mod_siphon_leech')?.shortLabel, 'SIPHON LEECH');
  assert.equal(getWeaponModChipDefinition('mod_chrono_nova')?.shortLabel, 'CHRONO NOVA');

  const photo = createInitialPhotoModeState();
  assert.equal(photo.active, false);
  assert.equal(getPhotoFilterCss('standard'), 'none');
  assert.ok(getPhotoFilterCss('paradox_violet').includes('hue-rotate'));

  const ascension = createInitialAscensionState();
  assert.equal(ascension.dailyTrialActive, false);
  assert.equal(ascension.style.tier, 'D');

  const enKeys = Object.keys(TRANSLATIONS.en).sort();
  const viKeys = Object.keys(TRANSLATIONS.vi).sort();
  assert.deepEqual(enKeys, viKeys, 'EN and VI translation dictionaries have identical keys');
  assert.equal(t('en', 'weaponScythe'), 'CHRONO SCYTHE');
  assert.equal(t('vi', 'weaponScythe'), 'LƯỠI HÁI THỜI KHÔNG');
});
