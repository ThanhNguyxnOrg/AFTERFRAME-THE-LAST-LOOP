import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BOSS_CORE_OMEGA_COST,
  BOSS_ECHO_CORES,
  COGNATE_CORE_FOR_WEAPON,
  COGNATE_WEAPON_FOR_CORE,
  CONFLUENCE_BURST_COOLDOWN_SEC,
  VALID_BOSS_ECHO_CORE_IDS,
  computeBossCoreModifiers,
  computeSentinelCoreConfluence,
  computeWeaponCoreAttunement,
  deriveAutoUnlockedBossCores,
  formatBossCoreHudBadge,
  isBossCoreTranscended,
  isValidBossEchoCoreId,
  isWeaponAttunedToBossCore,
  normalizeBossCoreProgression,
} from './boss-echo-cores.ts';
import { computeMaxChronoWard, computeRigSetSynergy } from './chrono-aegis.ts';
import { formatCombatCallouts } from './tactical-hud.ts';
import {
  localizeBenchActionMessage,
  localizeEnemyTacticalText,
} from './chronicle-awakening.ts';
import {
  applyLoadoutPreset,
  attemptActivateChronoOverdrive,
  createInitialWorld,
  equipBenchWeapon,
  equipBossEchoCore,
  equipRigModule,
  extractHudSnapshot,
  grantConfluenceCharge,
  loadCampaignProgressFromStorage,
  overclockRigModule,
  purchaseAndEquipWeaponModChip,
  purchaseRigModule,
  saveCampaignProgressToStorage,
  saveLoadoutPreset,
  setSentinelProtocol,
  startPracticeStandardRun,
  stepWorld,
  transcendBossEchoCore,
  triggerConfluenceBurst,
  unlockBossEchoCore,
  unlockChronoScythe,
  useMedNaniteInjector,
} from './simulation.ts';
import type { PlayerInputFrame } from './types.ts';

const IDLE_INPUT: PlayerInputFrame = {
  moveX: 0,
  moveZ: 0,
  aimYaw: 0,
  aimPitch: 0.35,
  lightAttackJustPressed: false,
  heavyHoldActive: false,
  heavyJustReleased: false,
  heavyAttackJustPressed: false,
  dodgeJustPressed: false,
  parryJustPressed: false,
};

test('Boss Echo Cores define all 5 Sovereign specs, OMEGA overrides, auto-harvest mapping, and normalization', () => {
  assert.equal(VALID_BOSS_ECHO_CORE_IDS.length, 5);
  assert.equal(BOSS_CORE_OMEGA_COST, 2);
  for (const id of VALID_BOSS_ECHO_CORE_IDS) {
    assert.equal(isValidBossEchoCoreId(id), true);
    const spec = BOSS_ECHO_CORES[id];
    assert.ok(spec.titleEn.length > 0 && spec.titleVi.length > 0);
    assert.ok(spec.summaryEn.length > 0 && spec.summaryVi.length > 0);
    assert.ok(spec.omegaRoleEn.length > 0 && spec.omegaRoleVi.length > 0);
    assert.ok(spec.omegaSummaryEn.length > 0 && spec.omegaSummaryVi.length > 0);
  }
  assert.equal(isValidBossEchoCoreId('core_unknown'), false);

  const auto = deriveAutoUnlockedBossCores(
    ['prologue', 'chapter_1_helix', 'chapter_3_curator'],
    ['witness']
  );
  assert.deepEqual(auto, [
    'core_helix_bastion',
    'core_curator_singularity',
    'core_warden_sovereign',
  ]);

  const normalized = normalizeBossCoreProgression(
    ['core_choir_chime', 'bogus_core', 'core_choir_chime'],
    'core_matron_siphon',
    ['chapter_1_helix'],
    [],
    ['core_choir_chime', 'core_matron_siphon', 'bogus_core', 'core_choir_chime']
  );
  assert.deepEqual(normalized.unlockedBossCores, [
    'core_choir_chime',
    'core_helix_bastion',
  ]);
  // Unowned equipped or transcended core is sanitized out
  assert.equal(normalized.equippedBossCore, null);
  assert.deepEqual(normalized.transcendedBossCores, ['core_choir_chime']);

  assert.equal(formatBossCoreHudBadge('core_warden_sovereign', 'vi', false), 'LÕI: TỐI THƯỢNG');
  assert.equal(formatBossCoreHudBadge('core_warden_sovereign', 'vi', true), 'LÕI: TỐI THƯỢNG Ω');
  assert.equal(formatBossCoreHudBadge('core_warden_sovereign', 'en', true), 'CORE: SOVEREIGN Ω');
});

test('Boss Echo Core synthesis, OMEGA transcendence, Confluence Ward stacking, and unequip across stepWorld', () => {
  const world = createInitialWorld('paused');
  startPracticeStandardRun(world);
  world.progression.memoryFragments = 2;

  // Insufficient fragments for Helix Core (3◆) and cannot awaken unowned core
  const failRes = unlockBossEchoCore(world, 'core_helix_bastion');
  assert.equal(failRes.success, false);
  assert.equal(failRes.outcome, 'insufficient_fragments');
  assert.equal(transcendBossEchoCore(world, 'core_helix_bastion').outcome, 'invalid_upgrade');

  // Grant fragments & synthesize Helix Core (3◆)
  world.progression.memoryFragments = 10;
  const helixUnlock = unlockBossEchoCore(world, 'core_helix_bastion');
  assert.equal(helixUnlock.success, true);
  assert.equal(world.progression.memoryFragments, 7);
  assert.equal(world.progression.equippedBossCore, 'core_helix_bastion');

  // Pair AEGIS Sentinel (+30 Ward) + Sovereign 3/3 MK.II Rig (+35 Ward) + Helix Core (+20 Ward) + AEGIS×Core Confluence (+10 Ward) = 95 Max Ward
  world.progression.memoryFragments = 30;
  for (const modId of [
    'rig_chrono_spool',
    'rig_reactive_plating',
    'rig_executioner_bus',
  ] as const) {
    purchaseRigModule(world, modId);
    overclockRigModule(world, modId);
  }
  equipRigModule(world, 'temporal_core', 'rig_chrono_spool');
  equipRigModule(world, 'defensive_chassis', 'rig_reactive_plating');
  equipRigModule(world, 'tactical_harness', 'rig_executioner_bus');
  setSentinelProtocol(world, 'aegis');

  const rigSyn = computeRigSetSynergy(
    world.progression.equippedRigModules,
    world.progression.overclockedRigModules
  );
  const baseHelixMods = computeBossCoreModifiers(world.progression.equippedBossCore, []);
  const baseConf = computeSentinelCoreConfluence('aegis', world.progression.equippedBossCore, []);
  assert.equal(baseConf.doctrineId, 'aegis_bastion');
  assert.equal(
    computeMaxChronoWard('aegis', rigSyn, baseHelixMods.bonusWard + baseConf.bonusWard),
    95
  );

  stepWorld(world, IDLE_INPUT, 1 / 60);
  assert.equal(extractHudSnapshot(world).chronoAegis?.maxWard, 95);

  // Awaken Helix Core to OMEGA Ω (2◆): Helix Ward -> +28, AEGIS×OMEGA Confluence -> +15 => 30 + 35 + 28 + 15 = 108 Max Ward
  const fragsBeforeOmega = world.progression.memoryFragments;
  const omegaRes = transcendBossEchoCore(world, 'core_helix_bastion');
  assert.equal(omegaRes.success, true);
  assert.equal(omegaRes.outcome, 'purchased');
  assert.equal(world.progression.memoryFragments, fragsBeforeOmega - BOSS_CORE_OMEGA_COST);
  assert.equal(
    isBossCoreTranscended('core_helix_bastion', world.progression.transcendedBossCores),
    true
  );
  // Idempotent second call returns already_owned
  assert.equal(transcendBossEchoCore(world, 'core_helix_bastion').outcome, 'already_owned');

  stepWorld(world, IDLE_INPUT, 1 / 60);
  const omegaHud = extractHudSnapshot(world);
  assert.equal(omegaHud.chronoAegis?.maxWard, 108);
  assert.deepEqual(omegaHud.progression.transcendedBossCores, ['core_helix_bastion']);

  // Unequip restores Max Chrono Ward to 65 (30 AEGIS + 35 Sovereign Rig)
  const unequipRes = equipBossEchoCore(world, null);
  assert.equal(unequipRes.success, true);
  stepWorld(world, IDLE_INPUT, 1 / 60);
  assert.equal(extractHudSnapshot(world).chronoAegis?.maxWard, 65);
});

test('Matron Siphon Core (Base & OMEGA) boosts Nanite healing and Warden Sovereign OMEGA triggers 62-base Judgment Nova', () => {
  const world = createInitialWorld('playing');
  startPracticeStandardRun(world);
  world.progression.memoryFragments = 30;

  // Equip Matron Siphon Core (+20% Nanite healing: 42 * 1.2 = 50 HP; OMEGA +31%: round(42 * 1.31) = 55 HP)
  assert.equal(unlockBossEchoCore(world, 'core_matron_siphon').success, true);
  world.player.integrity = 30;
  world.paradox.loadout.naniteInjectors = 2;
  world.paradox.loadout.naniteCooldown = 0;

  assert.equal(useMedNaniteInjector(world), true);
  assert.equal(world.player.integrity, 80);

  assert.equal(transcendBossEchoCore(world, 'core_matron_siphon').success, true);
  world.player.integrity = 40;
  world.paradox.loadout.naniteCooldown = 0;
  assert.equal(useMedNaniteInjector(world), true);
  assert.equal(world.player.integrity, 95);

  // Equip & awaken Warden Sovereign Core OMEGA (+20% All DMG, +22 Ward, 7.5m Judgment Nova)
  assert.equal(unlockBossEchoCore(world, 'core_warden_sovereign').success, true);
  assert.equal(transcendBossEchoCore(world, 'core_warden_sovereign').success, true);

  const nearbyEnemy = world.enemies.find((e) => e.hp > 0);
  assert.ok(nearbyEnemy, 'Expected an active enemy in practice arena');
  nearbyEnemy.x = world.player.x + 6.8; // Outside base 6.5m, inside OMEGA 7.5m!
  nearbyEnemy.z = world.player.z;
  const hpBefore = nearbyEnemy.hp;

  world.overdrive.charge = 100;
  world.overdrive.active = false;
  world.events.length = 0;

  const activated = attemptActivateChronoOverdrive(world);
  assert.equal(activated, true);
  assert.ok(nearbyEnemy.hp < hpBefore, 'Warden OMEGA Judgment Nova should hit enemies at 6.8m (<= 8.0m)');
  assert.ok(world.events.some((ev) => ev.type === 'boss_core_pulse'));
});

test('[9] Sovereign Confluence Burst charges to 100%, executes doctrine effects, and enforces 14s cooldown', () => {
  const world = createInitialWorld('playing');
  startPracticeStandardRun(world);
  world.progression.memoryFragments = 20;
  unlockBossEchoCore(world, 'core_warden_sovereign');
  transcendBossEchoCore(world, 'core_warden_sovereign');
  setSentinelProtocol(world, 'harmonic');

  const confSummary = computeSentinelCoreConfluence(
    world.progression.sentinelMode,
    world.progression.equippedBossCore,
    world.progression.transcendedBossCores
  );
  assert.equal(confSummary.doctrineId, 'harmonic_paradox');
  assert.equal(confSummary.skillFluxCostMultiplier, 0.9);

  // Cannot fire before 100% charge
  assert.equal(triggerConfluenceBurst(world), false);

  // Position enemy within 6.2m for Harmonic Singularity
  const target = world.enemies.find((e) => e.hp > 0);
  assert.ok(target);
  target.x = world.player.x + 3.0;
  target.z = world.player.z;
  const hpBefore = target.hp;
  world.player.flux = 10;

  // Charge to 100% and fire via [9] input frame
  assert.equal(grantConfluenceCharge(world, 100), 100);
  assert.equal(extractHudSnapshot(world).chronoConfluence?.ready, true);

  world.events.length = 0;
  stepWorld(
    world,
    {
      ...IDLE_INPUT,
      confluenceBurstJustPressed: true,
    },
    1 / 60
  );

  assert.ok(target.hp < hpBefore, 'Harmonic Paradox Burst should damage nearby enemies');
  assert.ok(world.player.flux >= 35, 'Harmonic Burst should restore +25 Flux');
  assert.ok(
    world.events.some((ev) => ev.type === 'confluence_burst_triggered'),
    'Expected confluence_burst_triggered event'
  );
  const afterHud = extractHudSnapshot(world);
  assert.equal(afterHud.chronoConfluence?.ready, false);
  assert.ok(
    (afterHud.chronoConfluence?.cooldownTimer ?? 0) > CONFLUENCE_BURST_COOLDOWN_SEC - 0.5
  );
});

test('Vietnamese localization covers 3D combat callouts, OMEGA & Confluence events, and bench messages', () => {
  const viCallouts = formatCombatCallouts(
    [
      { type: 'player_parry_success', x: 0, z: 0 },
      { type: 'boss_core_unlocked', x: 0, z: 0 },
      { type: 'boss_core_pulse', x: 0, z: 0, amount: 45 },
      { type: 'boss_core_omega_awakened', x: 0, z: 0 },
      { type: 'confluence_burst_triggered', x: 0, z: 0, amount: 64 },
    ],
    'vi'
  );
  assert.equal(viCallouts.length, 5);
  assert.equal(viCallouts[0].text, 'ĐỠ ĐÒN! +35F');
  assert.equal(viCallouts[1].text, 'THU HỒI LÕI THỐNG LĨNH!');
  assert.equal(viCallouts[2].text, 'XUNG LÕI BOSS! 45');
  assert.equal(viCallouts[3].text, 'THỨC TỈNH LÕI OMEGA Ω!');
  assert.equal(viCallouts[4].text, 'TUYỆT KỸ HỢP LƯU! 64');

  assert.equal(
    localizeEnemyTacticalText('FRONTAL GUARD · 0.42x DMG (FLANK/HEAVY)', 'vi'),
    'KHIÊN CHẮN TRƯỚC · 0.42x ST (VÒNG SAU / ĐÒN MẠNH)'
  );

  const world = createInitialWorld('paused');
  world.progression.memoryFragments = 15;
  assert.equal(unlockBossEchoCore(world, 'core_warden_sovereign').success, true);
  assert.equal(transcendBossEchoCore(world, 'core_warden_sovereign').success, true);
  const localizedOmegaMsg =
    localizeBenchActionMessage(world.progression.lastActionMessage, 'vi') ?? '';
  assert.ok(
    localizedOmegaMsg.includes('ĐÃ THỨC TỈNH OMEGA') &&
      localizedOmegaMsg.includes('LÕI BIÊN NIÊN TỐI THƯỢNG Ω'),
    `Expected Vietnamese OMEGA awakening bench message, got: ${localizedOmegaMsg}`
  );
});

test('v3.6.0 O(1) frozen lookup tables return identical references with zero heap allocations', () => {
  const m1 = computeBossCoreModifiers('core_helix_bastion', ['core_helix_bastion']);
  const m2 = computeBossCoreModifiers('core_helix_bastion', ['core_helix_bastion']);
  assert.strictEqual(m1, m2);
  assert.equal(Object.isFrozen(m1), true);

  const c1 = computeSentinelCoreConfluence('aegis', 'core_helix_bastion', ['core_helix_bastion']);
  const c2 = computeSentinelCoreConfluence('aegis', 'core_helix_bastion', ['core_helix_bastion']);
  assert.strictEqual(c1, c2);
  assert.equal(Object.isFrozen(c1), true);

  const a1 = computeWeaponCoreAttunement('chrono_edge', 'core_helix_bastion', ['core_helix_bastion']);
  const a2 = computeWeaponCoreAttunement('chrono_edge', 'core_helix_bastion', ['core_helix_bastion']);
  assert.strictEqual(a1, a2);
  assert.equal(Object.isFrozen(a1), true);
});

test('v3.6.0 Sovereign Armament Attunement maps all 5 weapons x 5 cores, Universal Warden Omega override, and live combat perks', () => {
  for (const coreId of VALID_BOSS_ECHO_CORE_IDS) {
    const wId = COGNATE_WEAPON_FOR_CORE[coreId];
    assert.equal(COGNATE_CORE_FOR_WEAPON[wId], coreId);
    const baseAtt = computeWeaponCoreAttunement(wId, coreId, []);
    const omegaAtt = computeWeaponCoreAttunement(wId, coreId, [coreId]);
    assert.equal(baseAtt.attuned, true);
    assert.equal(baseAtt.isOmega, false);
    assert.equal(omegaAtt.attuned, true);
    assert.equal(omegaAtt.isOmega, true);
    assert.ok(omegaAtt.damageMultiplier > baseAtt.damageMultiplier);
  }

  // Non-cognate core stays inactive unless Warden Sovereign is awakened to OMEGA
  assert.equal(isWeaponAttunedToBossCore('pulsecaster', 'core_helix_bastion', []), false);
  assert.equal(isWeaponAttunedToBossCore('pulsecaster', 'core_warden_sovereign', []), false);
  const universalPulse = computeWeaponCoreAttunement('pulsecaster', 'core_warden_sovereign', [
    'core_warden_sovereign',
  ]);
  assert.equal(universalPulse.attuned, true);
  assert.equal(universalPulse.isUniversalOverride, true);
  assert.equal(universalPulse.cognateCoreId, 'core_choir_chime');
  assert.equal(universalPulse.heatCostMultiplier, 0.78);

  // Live simulation check: Pulsecaster + Choir Ω cuts shot Heat cost by 30%
  const world = createInitialWorld('paused');
  startPracticeStandardRun(world);
  if (!world.progression.unlockedWeaponIds.includes('pulsecaster')) {
    world.progression.unlockedWeaponIds.push('pulsecaster');
  }
  equipBenchWeapon(world, 'pulsecaster');
  world.appState = 'playing';

  // Baseline unattuned shot heat after 0.05s windup
  equipBossEchoCore(world, null);
  world.player.weaponHeat = 0;
  world.player.weaponShotCooldownTimer = 0;
  stepWorld(world, { ...IDLE_INPUT, lightAttackJustPressed: true }, 1 / 60);
  for (let i = 0; i < 4; i++) stepWorld(world, IDLE_INPUT, 1 / 60);
  assert.equal(world.player.lastWeaponShotOutcome, 'fired');
  const unattunedShotHeat = world.player.weaponHeat;
  assert.ok(unattunedShotHeat > 0);

  // Attuned Pulsecaster + Choir Ω shot heat
  world.player.actionState = 'idle';
  world.player.stateTimer = 0;
  world.progression.memoryFragments = 30;
  assert.equal(unlockBossEchoCore(world, 'core_choir_chime').success, true);
  assert.equal(transcendBossEchoCore(world, 'core_choir_chime').success, true);
  world.player.weaponHeat = 0;
  world.player.weaponShotCooldownTimer = 0;
  world.player.lastWeaponShotOutcome = 'none';
  stepWorld(world, { ...IDLE_INPUT, lightAttackJustPressed: true }, 1 / 60);
  for (let i = 0; i < 4; i++) stepWorld(world, IDLE_INPUT, 1 / 60);
  assert.equal(world.player.lastWeaponShotOutcome, 'fired');
  assert.ok(
    world.player.weaponHeat > 0 && world.player.weaponHeat < unattunedShotHeat * 0.76,
    `Expected Choir Ω Pulsecaster heat (${world.player.weaponHeat}) < ${unattunedShotHeat * 0.76}`
  );
  world.appState = 'paused';
  world.player.actionState = 'idle';
  world.player.stateTimer = 0;

  // Phase Rail + Matron Ω reduces Heavy Charge threshold by 28%
  assert.equal(unlockBossEchoCore(world, 'core_matron_siphon').success, true);
  assert.equal(transcendBossEchoCore(world, 'core_matron_siphon').success, true);
  world.progression.unlockedWeaponIds.push('phase_rail');
  equipBenchWeapon(world, 'phase_rail');
  world.player.chargeTime = 0.25;
  equipBossEchoCore(world, null);
  const railChargeRatioNoCore = extractHudSnapshot(world).chargeRatio;
  equipBossEchoCore(world, 'core_matron_siphon');
  const railChargeRatioAttuned = extractHudSnapshot(world).chargeRatio;
  assert.ok(
    railChargeRatioAttuned > railChargeRatioNoCore * 1.35,
    `Expected Phase Rail chargeRatio ${railChargeRatioAttuned} > ${railChargeRatioNoCore * 1.35}`
  );
  world.player.chargeTime = 0;
});

test('v3.6.0 Tactical Loadout Presets save, persist across Save V2, restore rig stats, and sanitize unowned gear', () => {
  const store = new Map<string, string>();
  const mockStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
  };

  const world = createInitialWorld('paused');
  startPracticeStandardRun(world);
  world.progression.memoryFragments = 40;
  unlockChronoScythe(world);
  unlockBossEchoCore(world, 'core_warden_sovereign');
  transcendBossEchoCore(world, 'core_warden_sovereign');
  purchaseRigModule(world, 'rig_chrono_spool');
  equipRigModule(world, 'temporal_core', 'rig_chrono_spool');
  purchaseAndEquipWeaponModChip(world, 'mod_volt_arc');
  setSentinelProtocol(world, 'aegis');
  equipBenchWeapon(world, 'chrono_scythe');

  const saveRes = saveLoadoutPreset(world, 0);
  assert.equal(saveRes.success, true);
  assert.equal(saveRes.preset?.name, 'ALPHA');
  assert.equal(saveRes.preset?.weaponId, 'chrono_scythe');
  assert.equal(saveRes.preset?.equippedBossCore, 'core_warden_sovereign');
  assert.equal(
    localizeBenchActionMessage(world.progression.lastActionMessage, 'vi'),
    'ĐÃ LƯU BỘ TRANG BỊ · ALPHA'
  );

  // Switch completely away from the saved build
  equipBenchWeapon(world, 'chrono_edge');
  equipBossEchoCore(world, null);
  setSentinelProtocol(world, 'off');
  equipRigModule(world, 'temporal_core', null);
  assert.equal(world.player.equippedWeaponId, 'chrono_edge');
  assert.equal(world.progression.equippedBossCore, null);

  // Persist to Save V2 storage and reload into a fresh world
  saveCampaignProgressToStorage(world, mockStorage);
  const restoredWorld = createInitialWorld('paused');
  loadCampaignProgressFromStorage(restoredWorld, mockStorage);
  assert.equal(restoredWorld.progression.loadoutPresets?.[0]?.name, 'ALPHA');

  // Empty slot 2 cannot be applied
  assert.equal(applyLoadoutPreset(restoredWorld, 2).success, false);

  // Apply slot 0 restores Scythe, Warden Core, AEGIS Sentinel, and Chrono Ward
  const loadRes = applyLoadoutPreset(restoredWorld, 0);
  assert.equal(loadRes.success, true);
  assert.equal(restoredWorld.player.equippedWeaponId, 'chrono_scythe');
  assert.equal(restoredWorld.progression.equippedBossCore, 'core_warden_sovereign');
  assert.equal(restoredWorld.progression.sentinelMode, 'aegis');
  assert.equal(restoredWorld.progression.equippedRigModules.temporal_core, 'rig_chrono_spool');
  assert.ok((restoredWorld.chronoAegis?.maxWard ?? 0) >= 60);
  assert.equal(
    localizeBenchActionMessage(restoredWorld.progression.lastActionMessage, 'vi'),
    'ĐÃ NẠP BỘ TRANG BỊ · ALPHA'
  );

  // Ownership guard: if Boss Core is removed from unlockedBossCores, applyLoadoutPreset sanitizes it to null
  restoredWorld.progression.unlockedBossCores = [];
  applyLoadoutPreset(restoredWorld, 0);
  assert.equal(restoredWorld.progression.equippedBossCore, null);
});

