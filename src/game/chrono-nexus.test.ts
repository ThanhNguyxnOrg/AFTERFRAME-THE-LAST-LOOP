import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHRONICLE_LINK_CHAIN,
  computeChroniclePassiveBonus,
  createInitialChronoNexusState,
  evaluateChronoNexusState,
  getChronoNexusModifiers,
} from './chrono-nexus.ts';

test('Chrono Nexus escalates across 0 -> 2 -> 3 -> 4 simultaneous linked systems and tracks Apex links', () => {
  const nx = createInitialChronoNexusState();
  assert.equal(nx.tier, 0);
  assert.equal(getChronoNexusModifiers(nx).damageMult, 1.0);

  // Single active system stays unlinked (tier 0)
  let res = evaluateChronoNexusState(
    nx,
    {
      overchargeActive: true,
      twinSyncActive: false,
      momentumActive: false,
      flashOrRiposteActive: false,
    },
    0.016
  );
  assert.equal(nx.linkCount, 1);
  assert.equal(nx.tier, 0);
  assert.equal(res.tierUp, false);

  // 2 active systems -> DUAL NEXUS (+10% DMG)
  res = evaluateChronoNexusState(
    nx,
    {
      overchargeActive: true,
      twinSyncActive: true,
      momentumActive: false,
      flashOrRiposteActive: false,
    },
    0.016
  );
  assert.equal(nx.tier, 2);
  assert.equal(res.tierUp, true);
  assert.equal(getChronoNexusModifiers(nx).damageMult, 1.1);
  assert.equal(res.pulseReady, false);

  // 3 active systems -> TRI-NEXUS (+20% DMG + pulse ready)
  res = evaluateChronoNexusState(
    nx,
    {
      overchargeActive: true,
      twinSyncActive: true,
      momentumActive: true,
      flashOrRiposteActive: false,
    },
    0.016
  );
  assert.equal(nx.tier, 3);
  assert.equal(res.tierUp, true);
  assert.equal(res.pulseReady, true);
  assert.equal(getChronoNexusModifiers(nx).damageMult, 1.2);

  // 4 active systems -> APEX NEXUS (+32% DMG, +50% XP)
  res = evaluateChronoNexusState(
    nx,
    {
      overchargeActive: true,
      twinSyncActive: true,
      momentumActive: true,
      flashOrRiposteActive: true,
    },
    0.016
  );
  assert.equal(nx.tier, 4);
  assert.equal(res.tierUp, true);
  assert.equal(nx.totalApexLinks, 1);
  assert.equal(nx.peakLinks, 4);
  assert.equal(getChronoNexusModifiers(nx).damageMult, 1.32);
  assert.equal(getChronoNexusModifiers(nx).masteryXpMult, 1.5);
});

test('Chrono Nexus pulse enforces 4.0s cooldown while sustaining Tri-Nexus', () => {
  const nx = createInitialChronoNexusState();
  const flags = {
    overchargeActive: true,
    twinSyncActive: true,
    momentumActive: true,
    flashOrRiposteActive: false,
  };
  const first = evaluateChronoNexusState(nx, flags, 0.1);
  assert.equal(first.pulseReady, true);

  const mid = evaluateChronoNexusState(nx, flags, 2.0);
  assert.equal(mid.pulseReady, false);

  const next = evaluateChronoNexusState(nx, flags, 2.1);
  assert.equal(next.pulseReady, true);
});

test('computeChroniclePassiveBonus links recovered Logs & cleared Chapters cleanly with neutral baseline', () => {
  const base = computeChroniclePassiveBonus(['LOG-00'], []);
  assert.equal(base.damageMult, 1.0);
  assert.equal(base.maxIntegrityBonusPct, 0);

  const full = computeChroniclePassiveBonus(
    ['LOG-00', 'LOG-01', 'LOG-02', 'LOG-03', 'LOG-04', 'LOG-05'],
    ['prologue', 'chapter_1_helix', 'chapter_2_choir', 'chapter_3_curator', 'chapter_4_matron', 'chapter_5_loom']
  );
  assert.equal(full.maxIntegrityBonusPct, 12);
  assert.equal(full.overdriveChargeBonusPct, 18);
  assert.equal(full.allWeaponDamageBonusPct, 12);
  assert.ok(Math.abs(full.damageMult - 1.12) < 0.0001);
  assert.equal(CHRONICLE_LINK_CHAIN.length, 7);
});
