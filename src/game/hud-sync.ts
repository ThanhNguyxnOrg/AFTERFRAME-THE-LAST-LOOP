import {
  VALID_MASTERY_TARGET_IDS,
  computeMasterySealModifiers,
} from './combat-mastery.ts';
import type { WorldState } from './types.ts';

// ============================================================================
// v4.0.0 — ZERO-GC HUD & PERSISTENCE SYNC TRACKER
// Replaces 280 lines of inline 48-variable diffing in App.tsx with a typed,
// O(1) zero-allocation tracker that also tracks Sovereign Mastery Ledger seals.
// ============================================================================

export interface HudSyncResult {
  shouldSyncHud: boolean;
  persistenceChanged: boolean;
}

const _sharedSyncResult: HudSyncResult = {
  shouldSyncHud: false,
  persistenceChanged: false,
};

function countObjectKeys(record: Record<string, unknown> | undefined | null): number {
  if (!record) return 0;
  let count = 0;
  for (const key in record) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      count += 1;
    }
  }
  return count;
}

function countClaimedFragmentCaches(
  caches: ReadonlyArray<{ claimed: boolean }> | undefined | null
): number {
  if (!caches) return 0;
  let count = 0;
  for (let i = 0; i < caches.length; i += 1) {
    if (caches[i].claimed) count += 1;
  }
  return count;
}

function countReadyBeacons(
  beacons: ReadonlyArray<{ cooldown: number }> | undefined | null
): number {
  if (!beacons) return 0;
  let count = 0;
  for (let i = 0; i < beacons.length; i += 1) {
    if (beacons[i].cooldown <= 0) count += 1;
  }
  return count;
}

export function computeLoadoutPresetsStamp(
  presets: WorldState['progression']['loadoutPresets']
): number {
  if (!presets) return 0;
  let stamp = 0;
  for (let i = 0; i < presets.length; i += 1) {
    const p = presets[i];
    if (p) {
      stamp +=
        (i + 1) * 1009 +
        p.weaponId.length * 31 +
        (p.equippedBossCore ? p.equippedBossCore.length * 17 : 0) +
        p.sentinelMode.length * 7 +
        (p.echoDoctrine ? p.echoDoctrine.length * 13 : 0) +
        (p.equippedModChipId ? p.equippedModChipId.length * 3 : 0);
    }
  }
  return stamp;
}

export function computeMasteryPersistenceStamp(
  ledger: WorldState['progression']['combatMastery']
): number {
  if (!ledger) return 0;
  const seal = computeMasterySealModifiers(ledger);
  let clearsAndScoreStamp = 0;
  for (let i = 0; i < VALID_MASTERY_TARGET_IDS.length; i += 1) {
    const rec = ledger[VALID_MASTERY_TARGET_IDS[i]];
    if (rec) {
      clearsAndScoreStamp += rec.clears * 7 + rec.bestScore * 3;
    }
  }
  return (
    seal.claimedSealsCount * 10007 +
    seal.pendingBountyCount * 997 +
    seal.sRankUnlockedCount * 61 +
    seal.hitlessUnlockedCount * 19 +
    clearsAndScoreStamp
  );
}

function computeWeaponMasteryTotalXp(world: WorldState): number {
  const xp = world.progression.weaponMasteryXp;
  if (!xp) return 0;
  return (
    (xp.chrono_edge ?? 0) +
    (xp.pulsecaster ?? 0) +
    (xp.phase_rail ?? 0) +
    (xp.grav_breaker ?? 0) +
    (xp.chrono_scythe ?? 0)
  );
}

function hasLivingEnemies(world: WorldState): boolean {
  if (world.boss !== null && world.boss.hp > 0) return true;
  const enemies = world.enemies;
  for (let i = 0; i < enemies.length; i += 1) {
    const e = enemies[i];
    if (e.hp > 0 && e.aiState !== 'ko') return true;
  }
  return false;
}

export interface HudSyncTracker {
  lastHudSyncTime: number;
  prevIntegrityCeil: number;
  prevAppState: WorldState['appState'];
  prevEncounterMode: WorldState['encounterMode'];
  prevRunMode: WorldState['run']['mode'];
  prevRunStage: WorldState['run']['stage'];
  prevRunChapter: WorldState['run']['chapter'];
  prevPendingNextChapter: WorldState['run']['pendingNextChapter'];
  prevTutorialStep: WorldState['tutorial']['step'];
  prevTutorialEnabled: boolean;
  prevTutorialStuck: boolean;
  prevOutcome: WorldState['outcome'];
  prevEchoState: WorldState['echo']['state'];
  prevPlateActive: boolean;
  prevPuzzleStage: WorldState['puzzle']['stage'];
  prevReceiverCharged: boolean;
  prevCombinePlateActive: boolean;
  prevFinalBarrierOpen: boolean;
  prevCanRelay: boolean;
  prevRelayStatus: WorldState['relay']['preview']['status'];
  prevRelayCount: number;
  prevResonanceStatus: WorldState['resonance']['status'];
  prevResonanceMarkId: NonNullable<WorldState['resonance']['activeMark']>['markId'] | null;
  prevConvergenceCount: number;
  prevBossPhase: NonNullable<WorldState['boss']>['phase'] | null;
  prevBossState: NonNullable<WorldState['boss']>['aiState'] | null;
  prevBossAttack: NonNullable<WorldState['boss']>['activeAttack'] | null;
  prevBossCoreExposed: boolean;
  prevBossHp: number;
  prevCommsId: NonNullable<WorldState['comms']['active']>['id'] | null;
  prevEquippedWeapon: WorldState['player']['equippedWeaponId'];
  prevWeaponOverheated: boolean;
  prevMemoryFragments: number;
  prevPurchasedCount: number;
  prevUnlockedWeaponsCount: number;
  prevEquippedEdgeUpgrade: WorldState['progression']['equippedUpgrades']['chrono_edge'];
  prevEquippedPulseUpgrade: WorldState['progression']['equippedUpgrades']['pulsecaster'];
  prevEquippedRailUpgrade: NonNullable<WorldState['progression']['equippedUpgrades']['phase_rail']> | null;
  prevEquippedBreakerUpgrade: NonNullable<WorldState['progression']['equippedUpgrades']['grav_breaker']> | null;
  prevEquippedScytheUpgrade: NonNullable<WorldState['progression']['equippedUpgrades']['chrono_scythe']> | null;
  prevSentinelMode: NonNullable<WorldState['progression']['sentinelMode']>;
  prevEchoDoctrine: NonNullable<WorldState['progression']['echoDoctrine']>;
  prevEquippedBossCore: NonNullable<WorldState['progression']['equippedBossCore']> | null;
  prevUnlockedBossCoresCount: number;
  prevTranscendedBossCoresCount: number;
  prevLoadoutPresetsStamp: number;
  prevCombatMasteryStamp: number;
  prevConfluenceReady: boolean;
  prevConfluenceOnCooldown: boolean;
  prevEncounterId: WorldState['encounter']['encounterId'];
  prevWaveIndex: number;
  prevWaveClearedCount: number;
  prevEncounterCompleted: boolean;
  prevActivatedNodesCount: number;
  prevCompletedObjectivesCount: number;
  prevDiscoveredCodexCount: number;
  prevDiscoveredSecretsCount: number;
  prevUnlockedRoutesCount: number;
  prevCompletedNarrativeCount: number;
  prevLastNarrativeId: WorldState['exploration']['lastTriggeredNarrativeEventId'];
  prevDiscoveryBannerId: NonNullable<WorldState['exploration']['lastDiscoveryBanner']>['secretId'] | null;
  prevPromptId: WorldState['exploration']['prompt']['interactableId'];
  prevPromptStatus: WorldState['exploration']['prompt']['status'];
  prevOverclockedCount: number;
  prevAwakenedCount: number;
  prevNeuralProtocolsCount: number;
  prevResolvedStoryCount: number;
  prevClaimedCachesCount: number;
  prevDiscoveredHoloCount: number;
  prevActiveHoloId: NonNullable<WorldState['exploration']['activeHoloMemoryId']> | null;
  prevReadyBeaconsCount: number;
  prevLockOnTargetId: string | null;
  prevLockOnStaggered: boolean;
  prevCanExecute: boolean;
  prevRecursionLoop: number;
  prevRecursionDraft: boolean;
  prevOverdriveDifficulty: boolean;
  prevTemporalRiftId: NonNullable<WorldState['temporalRift']>['id'] | null;
  prevEquippedModChipId: NonNullable<WorldState['progression']['equippedModChipId']> | null;
  prevStyleTier: NonNullable<WorldState['ascension']>['style']['tier'];
  prevFinisherReady: boolean;
  prevMasteryTotal: number;
}

export function createHudSyncTracker(world: WorldState): HudSyncTracker {
  return {
    lastHudSyncTime: 0,
    prevIntegrityCeil: Math.ceil(world.player.integrity),
    prevAppState: world.appState,
    prevEncounterMode: world.encounterMode,
    prevRunMode: world.run.mode,
    prevRunStage: world.run.stage,
    prevRunChapter: world.run.chapter,
    prevPendingNextChapter: world.run.pendingNextChapter,
    prevTutorialStep: world.tutorial.step,
    prevTutorialEnabled: world.tutorial.enabled,
    prevTutorialStuck: world.tutorial.stuckHintActive,
    prevOutcome: world.outcome,
    prevEchoState: world.echo.state,
    prevPlateActive: world.pressurePlate.active,
    prevPuzzleStage: world.puzzle.stage,
    prevReceiverCharged: world.puzzle.heavyReceiver.charged,
    prevCombinePlateActive: world.puzzle.combinePlate.active,
    prevFinalBarrierOpen: world.puzzle.finalBarrier.open,
    prevCanRelay: world.relay.preview.canRelay,
    prevRelayStatus: world.relay.preview.status,
    prevRelayCount: world.relay.activationCount,
    prevResonanceStatus: world.resonance.status,
    prevResonanceMarkId: world.resonance.activeMark?.markId ?? null,
    prevConvergenceCount: world.resonance.convergenceCount,
    prevBossPhase: world.boss?.phase ?? null,
    prevBossState: world.boss?.aiState ?? null,
    prevBossAttack: world.boss?.activeAttack ?? null,
    prevBossCoreExposed: world.boss?.coreExposed ?? false,
    prevBossHp: Math.ceil(world.boss?.hp ?? 0),
    prevCommsId: world.comms.active?.id ?? null,
    prevEquippedWeapon: world.player.equippedWeaponId,
    prevWeaponOverheated: world.player.weaponOverheated,
    prevMemoryFragments: world.progression.memoryFragments,
    prevPurchasedCount: world.progression.purchasedUpgrades.length,
    prevUnlockedWeaponsCount: (world.progression.unlockedWeaponIds ?? []).length,
    prevEquippedEdgeUpgrade: world.progression.equippedUpgrades.chrono_edge,
    prevEquippedPulseUpgrade: world.progression.equippedUpgrades.pulsecaster,
    prevEquippedRailUpgrade: world.progression.equippedUpgrades.phase_rail ?? null,
    prevEquippedBreakerUpgrade: world.progression.equippedUpgrades.grav_breaker ?? null,
    prevEquippedScytheUpgrade: world.progression.equippedUpgrades.chrono_scythe ?? null,
    prevSentinelMode: world.progression.sentinelMode ?? 'off',
    prevEchoDoctrine: world.progression.echoDoctrine ?? 'standard',
    prevEquippedBossCore: world.progression.equippedBossCore ?? null,
    prevUnlockedBossCoresCount: (world.progression.unlockedBossCores ?? []).length,
    prevTranscendedBossCoresCount: (world.progression.transcendedBossCores ?? []).length,
    prevLoadoutPresetsStamp: computeLoadoutPresetsStamp(world.progression.loadoutPresets),
    prevCombatMasteryStamp: computeMasteryPersistenceStamp(world.progression.combatMastery),
    prevConfluenceReady: Boolean(world.chronoConfluence?.ready),
    prevConfluenceOnCooldown: (world.chronoConfluence?.cooldownTimer ?? 0) > 0,
    prevEncounterId: world.encounter.encounterId,
    prevWaveIndex: world.encounter.currentWaveIndex,
    prevWaveClearedCount: world.encounter.waveClearedCount,
    prevEncounterCompleted: world.encounter.completed,
    prevActivatedNodesCount: world.exploration.activatedNodeIds.length,
    prevCompletedObjectivesCount: world.exploration.completedObjectiveIds.length,
    prevDiscoveredCodexCount: world.exploration.discoveredCodexIds.length,
    prevDiscoveredSecretsCount: world.exploration.discoveredSecretIds.length,
    prevUnlockedRoutesCount: world.exploration.unlockedRouteIds.length,
    prevCompletedNarrativeCount: world.exploration.completedNarrativeEventIds.length,
    prevLastNarrativeId: world.exploration.lastTriggeredNarrativeEventId,
    prevDiscoveryBannerId: world.exploration.lastDiscoveryBanner?.secretId ?? null,
    prevPromptId: world.exploration.prompt.interactableId,
    prevPromptStatus: world.exploration.prompt.status,
    prevOverclockedCount: (world.progression.overclockedUpgrades ?? []).length,
    prevAwakenedCount: (world.progression.awakenedUpgrades ?? []).length,
    prevNeuralProtocolsCount: (world.progression.purchasedNeuralProtocols ?? []).length,
    prevResolvedStoryCount: countObjectKeys(world.exploration.resolvedStoryChoices),
    prevClaimedCachesCount: countClaimedFragmentCaches(world.fragmentCaches),
    prevDiscoveredHoloCount: (world.exploration.discoveredHoloMemoryIds ?? []).length,
    prevActiveHoloId: world.exploration.activeHoloMemoryId ?? null,
    prevReadyBeaconsCount: countReadyBeacons(world.sectorBeacons),
    prevLockOnTargetId: world.player.lockOnTargetId ?? null,
    prevLockOnStaggered: false,
    prevCanExecute: false,
    prevRecursionLoop: world.recursion?.loopIndex ?? 0,
    prevRecursionDraft: Boolean(world.recursion?.awaitingRelicDraft),
    prevOverdriveDifficulty: Boolean(world.progression.overdriveDifficulty),
    prevTemporalRiftId: world.temporalRift?.id ?? null,
    prevEquippedModChipId: world.progression.equippedModChipId ?? null,
    prevStyleTier: world.ascension?.style.tier ?? 'D',
    prevFinisherReady: world.ascension?.style.finisherReady ?? false,
    prevMasteryTotal: computeWeaponMasteryTotalXp(world),
  };
}

export function evaluateHudSyncTick(
  tracker: HudSyncTracker,
  world: WorldState,
  activeLockTarget: { id: string; isStaggered?: boolean } | null,
  canExecute: boolean,
  nowMs: number,
  continuousIntervalMs = 100
): HudSyncResult {
  const currMarkId = world.resonance.activeMark?.markId ?? null;
  const currBossPhase = world.boss?.phase ?? null;
  const currBossState = world.boss?.aiState ?? null;
  const currBossAttack = world.boss?.activeAttack ?? null;
  const currBossCoreExposed = world.boss?.coreExposed ?? false;
  const currBossHp = Math.ceil(world.boss?.hp ?? 0);
  const currCommsId = world.comms.active?.id ?? null;
  const currMasteryTotal = computeWeaponMasteryTotalXp(world);
  const currEquippedModChipId = world.progression.equippedModChipId ?? null;
  const currStyleTier = world.ascension?.style.tier ?? 'D';
  const currFinisherReady = world.ascension?.style.finisherReady ?? false;
  const currEquippedScytheUpgrade = world.progression.equippedUpgrades.chrono_scythe ?? null;
  const currSentinelMode = world.progression.sentinelMode ?? 'off';
  const currEchoDoctrine = world.progression.echoDoctrine ?? 'standard';
  const currEquippedBossCore = world.progression.equippedBossCore ?? null;
  const currUnlockedBossCoresCount = (world.progression.unlockedBossCores ?? []).length;
  const currTranscendedBossCoresCount = (world.progression.transcendedBossCores ?? []).length;
  const currLoadoutPresetsStamp = computeLoadoutPresetsStamp(world.progression.loadoutPresets);
  const currCombatMasteryStamp = computeMasteryPersistenceStamp(world.progression.combatMastery);
  const currConfluenceReady = Boolean(world.chronoConfluence?.ready);
  const currConfluenceOnCooldown = (world.chronoConfluence?.cooldownTimer ?? 0) > 0;
  const currResolvedStoryCount = countObjectKeys(world.exploration.resolvedStoryChoices);
  const currClaimedCachesCount = countClaimedFragmentCaches(world.fragmentCaches);
  const currDiscoveredHoloCount = (world.exploration.discoveredHoloMemoryIds ?? []).length;
  const currActiveHoloId = world.exploration.activeHoloMemoryId ?? null;
  const currLockOnTargetId = activeLockTarget?.id ?? null;
  const currLockOnStaggered = Boolean(activeLockTarget?.isStaggered);
  const currReadyBeaconsCount = countReadyBeacons(world.sectorBeacons);
  const currRecursionDraft = Boolean(world.recursion?.awaitingRelicDraft);
  const currTemporalRiftId = world.temporalRift?.id ?? null;
  const currIntegrityCeil = Math.ceil(world.player.integrity);

  const persistenceChanged =
    world.appState !== tracker.prevAppState ||
    world.encounterMode !== tracker.prevEncounterMode ||
    world.run.mode !== tracker.prevRunMode ||
    world.run.stage !== tracker.prevRunStage ||
    world.run.chapter !== tracker.prevRunChapter ||
    world.run.pendingNextChapter !== tracker.prevPendingNextChapter ||
    world.outcome !== tracker.prevOutcome ||
    world.progression.memoryFragments !== tracker.prevMemoryFragments ||
    world.progression.purchasedUpgrades.length !== tracker.prevPurchasedCount ||
    (world.progression.unlockedWeaponIds ?? []).length !== tracker.prevUnlockedWeaponsCount ||
    world.progression.equippedUpgrades.chrono_edge !== tracker.prevEquippedEdgeUpgrade ||
    world.progression.equippedUpgrades.pulsecaster !== tracker.prevEquippedPulseUpgrade ||
    (world.progression.equippedUpgrades.phase_rail ?? null) !== tracker.prevEquippedRailUpgrade ||
    (world.progression.equippedUpgrades.grav_breaker ?? null) !==
      tracker.prevEquippedBreakerUpgrade ||
    currEquippedScytheUpgrade !== tracker.prevEquippedScytheUpgrade ||
    currSentinelMode !== tracker.prevSentinelMode ||
    currEchoDoctrine !== tracker.prevEchoDoctrine ||
    currEquippedBossCore !== tracker.prevEquippedBossCore ||
    currUnlockedBossCoresCount !== tracker.prevUnlockedBossCoresCount ||
    currTranscendedBossCoresCount !== tracker.prevTranscendedBossCoresCount ||
    currLoadoutPresetsStamp !== tracker.prevLoadoutPresetsStamp ||
    currCombatMasteryStamp !== tracker.prevCombatMasteryStamp ||
    currEquippedModChipId !== tracker.prevEquippedModChipId ||
    Boolean(world.progression.overdriveDifficulty) !== tracker.prevOverdriveDifficulty ||
    (world.recursion?.loopIndex ?? 0) !== tracker.prevRecursionLoop ||
    currMasteryTotal !== tracker.prevMasteryTotal ||
    world.encounter.completed !== tracker.prevEncounterCompleted ||
    world.exploration.activatedNodeIds.length !== tracker.prevActivatedNodesCount ||
    world.exploration.completedObjectiveIds.length !== tracker.prevCompletedObjectivesCount ||
    world.exploration.discoveredCodexIds.length !== tracker.prevDiscoveredCodexCount ||
    world.exploration.discoveredSecretIds.length !== tracker.prevDiscoveredSecretsCount ||
    world.exploration.unlockedRouteIds.length !== tracker.prevUnlockedRoutesCount ||
    world.exploration.completedNarrativeEventIds.length !== tracker.prevCompletedNarrativeCount ||
    (world.progression.overclockedUpgrades ?? []).length !== tracker.prevOverclockedCount ||
    (world.progression.awakenedUpgrades ?? []).length !== tracker.prevAwakenedCount ||
    (world.progression.purchasedNeuralProtocols ?? []).length !== tracker.prevNeuralProtocolsCount ||
    currResolvedStoryCount !== tracker.prevResolvedStoryCount ||
    currClaimedCachesCount !== tracker.prevClaimedCachesCount ||
    currDiscoveredHoloCount !== tracker.prevDiscoveredHoloCount;

  const stateChanged =
    persistenceChanged ||
    currConfluenceReady !== tracker.prevConfluenceReady ||
    currConfluenceOnCooldown !== tracker.prevConfluenceOnCooldown ||
    currRecursionDraft !== tracker.prevRecursionDraft ||
    currTemporalRiftId !== tracker.prevTemporalRiftId ||
    currStyleTier !== tracker.prevStyleTier ||
    currFinisherReady !== tracker.prevFinisherReady ||
    currReadyBeaconsCount !== tracker.prevReadyBeaconsCount ||
    world.tutorial.step !== tracker.prevTutorialStep ||
    world.tutorial.enabled !== tracker.prevTutorialEnabled ||
    world.tutorial.stuckHintActive !== tracker.prevTutorialStuck ||
    world.echo.state !== tracker.prevEchoState ||
    world.pressurePlate.active !== tracker.prevPlateActive ||
    world.puzzle.stage !== tracker.prevPuzzleStage ||
    world.puzzle.heavyReceiver.charged !== tracker.prevReceiverCharged ||
    world.puzzle.combinePlate.active !== tracker.prevCombinePlateActive ||
    world.puzzle.finalBarrier.open !== tracker.prevFinalBarrierOpen ||
    world.relay.preview.canRelay !== tracker.prevCanRelay ||
    world.relay.preview.status !== tracker.prevRelayStatus ||
    world.relay.activationCount !== tracker.prevRelayCount ||
    world.resonance.status !== tracker.prevResonanceStatus ||
    currMarkId !== tracker.prevResonanceMarkId ||
    world.resonance.convergenceCount !== tracker.prevConvergenceCount ||
    currBossPhase !== tracker.prevBossPhase ||
    currBossState !== tracker.prevBossState ||
    currBossAttack !== tracker.prevBossAttack ||
    currBossCoreExposed !== tracker.prevBossCoreExposed ||
    currBossHp !== tracker.prevBossHp ||
    currCommsId !== tracker.prevCommsId ||
    world.player.equippedWeaponId !== tracker.prevEquippedWeapon ||
    world.player.weaponOverheated !== tracker.prevWeaponOverheated ||
    world.encounter.encounterId !== tracker.prevEncounterId ||
    world.encounter.currentWaveIndex !== tracker.prevWaveIndex ||
    world.encounter.waveClearedCount !== tracker.prevWaveClearedCount ||
    world.exploration.lastTriggeredNarrativeEventId !== tracker.prevLastNarrativeId ||
    (world.exploration.lastDiscoveryBanner?.secretId ?? null) !== tracker.prevDiscoveryBannerId ||
    world.exploration.prompt.interactableId !== tracker.prevPromptId ||
    world.exploration.prompt.status !== tracker.prevPromptStatus ||
    currActiveHoloId !== tracker.prevActiveHoloId ||
    currLockOnTargetId !== tracker.prevLockOnTargetId ||
    currLockOnStaggered !== tracker.prevLockOnStaggered ||
    canExecute !== tracker.prevCanExecute ||
    currIntegrityCeil !== tracker.prevIntegrityCeil;

  const hasLiveContinuousHud =
    world.appState === 'playing' &&
    (hasLivingEnemies(world) ||
      Boolean(world.temporalRift) ||
      Boolean(currActiveHoloId) ||
      Boolean(currLockOnTargetId) ||
      canExecute ||
      world.echo.state === 'recording' ||
      world.echo.state === 'playback' ||
      world.player.chargeTime > 0 ||
      world.player.weaponHeat > 0 ||
      world.player.weaponOverheated ||
      world.player.weaponOverheatTimer > 0 ||
      world.player.weaponShotCooldownTimer > 0 ||
      world.player.weaponSwitchCooldownTimer > 0 ||
      (world.player.fluxDampenedTimer ?? 0) > 0 ||
      (world.player.adrenalineDecayGraceTimer ?? 0) > 0 ||
      world.player.ghostIntegrity > world.player.integrity + 0.05 ||
      (world.player.riposteTimer ?? 0) > 0 ||
      (world.player.chronoSlipTimer ?? 0) > 0 ||
      (world.player.temporalSlipTimer ?? 0) > 0 ||
      (world.player.relayMomentumTimer ?? 0) > 0 ||
      (world.player.quickDrawTimer ?? 0) > 0 ||
      world.resonance.activeMark !== null ||
      world.resonance.cooldownTimer > 0 ||
      world.relay.cooldownTimer > 0 ||
      world.relay.successFlashTimer > 0 ||
      (world.gravityPin?.cooldownTimer ?? 0) > 0 ||
      (world.gravityPin?.activeDurationTimer ?? 0) > 0 ||
      (world.echoCollapse?.cooldownTimer ?? 0) > 0 ||
      (world.echoCollapse?.blastTimer ?? 0) > 0 ||
      (world.chronoConfluence?.cooldownTimer ?? 0) > 0 ||
      world.puzzle.heavyReceiver.charged ||
      world.run.stage === 'intro' ||
      world.run.stage === 'transition_to_boss' ||
      world.run.checkpointNoticeTimer > 0 ||
      Boolean(world.comms.active) ||
      Boolean(world.exploration.lastDiscoveryBanner) ||
      Boolean(
        world.choir?.active &&
          (world.choir.syncTimer > 0 || world.choir.failureResetTimer > 0)
      ) ||
      Boolean(
        world.matron?.active &&
          (world.matron.chronoSeverWarningTimer > 0 || world.matron.echoSuppressedTimer > 0)
      ) ||
      Boolean(
        world.paradox &&
          (world.paradox.damagePopups.length > 0 ||
            world.paradox.killCamTimer > 0 ||
            world.paradox.activeToast !== null ||
            world.paradox.speedrun.enabled ||
            world.paradox.loadout.naniteCooldown > 0)
      ));

  const shouldSyncHud =
    stateChanged ||
    (hasLiveContinuousHud && nowMs - tracker.lastHudSyncTime >= continuousIntervalMs);

  if (shouldSyncHud) {
    tracker.lastHudSyncTime = nowMs;
    tracker.prevIntegrityCeil = currIntegrityCeil;
    tracker.prevAppState = world.appState;
    tracker.prevEncounterMode = world.encounterMode;
    tracker.prevRunMode = world.run.mode;
    tracker.prevRecursionLoop = world.recursion?.loopIndex ?? 0;
    tracker.prevRecursionDraft = currRecursionDraft;
    tracker.prevOverdriveDifficulty = Boolean(world.progression.overdriveDifficulty);
    tracker.prevTemporalRiftId = currTemporalRiftId;
    tracker.prevEquippedModChipId = currEquippedModChipId;
    tracker.prevStyleTier = currStyleTier;
    tracker.prevFinisherReady = currFinisherReady;
    tracker.prevMasteryTotal = currMasteryTotal;
    tracker.prevRunStage = world.run.stage;
    tracker.prevRunChapter = world.run.chapter;
    tracker.prevPendingNextChapter = world.run.pendingNextChapter;
    tracker.prevTutorialStep = world.tutorial.step;
    tracker.prevTutorialEnabled = world.tutorial.enabled;
    tracker.prevTutorialStuck = world.tutorial.stuckHintActive;
    tracker.prevOutcome = world.outcome;
    tracker.prevEchoState = world.echo.state;
    tracker.prevPlateActive = world.pressurePlate.active;
    tracker.prevPuzzleStage = world.puzzle.stage;
    tracker.prevReceiverCharged = world.puzzle.heavyReceiver.charged;
    tracker.prevCombinePlateActive = world.puzzle.combinePlate.active;
    tracker.prevFinalBarrierOpen = world.puzzle.finalBarrier.open;
    tracker.prevCanRelay = world.relay.preview.canRelay;
    tracker.prevRelayStatus = world.relay.preview.status;
    tracker.prevRelayCount = world.relay.activationCount;
    tracker.prevResonanceStatus = world.resonance.status;
    tracker.prevResonanceMarkId = currMarkId;
    tracker.prevConvergenceCount = world.resonance.convergenceCount;
    tracker.prevBossPhase = currBossPhase;
    tracker.prevBossState = currBossState;
    tracker.prevBossAttack = currBossAttack;
    tracker.prevBossCoreExposed = currBossCoreExposed;
    tracker.prevBossHp = currBossHp;
    tracker.prevCommsId = currCommsId;
    tracker.prevEquippedWeapon = world.player.equippedWeaponId;
    tracker.prevWeaponOverheated = world.player.weaponOverheated;
    tracker.prevMemoryFragments = world.progression.memoryFragments;
    tracker.prevPurchasedCount = world.progression.purchasedUpgrades.length;
    tracker.prevUnlockedWeaponsCount = (world.progression.unlockedWeaponIds ?? []).length;
    tracker.prevEquippedEdgeUpgrade = world.progression.equippedUpgrades.chrono_edge;
    tracker.prevEquippedPulseUpgrade = world.progression.equippedUpgrades.pulsecaster;
    tracker.prevEquippedRailUpgrade = world.progression.equippedUpgrades.phase_rail ?? null;
    tracker.prevEquippedBreakerUpgrade = world.progression.equippedUpgrades.grav_breaker ?? null;
    tracker.prevEquippedScytheUpgrade = currEquippedScytheUpgrade;
    tracker.prevSentinelMode = currSentinelMode;
    tracker.prevEchoDoctrine = currEchoDoctrine;
    tracker.prevEquippedBossCore = currEquippedBossCore;
    tracker.prevUnlockedBossCoresCount = currUnlockedBossCoresCount;
    tracker.prevTranscendedBossCoresCount = currTranscendedBossCoresCount;
    tracker.prevLoadoutPresetsStamp = currLoadoutPresetsStamp;
    tracker.prevCombatMasteryStamp = currCombatMasteryStamp;
    tracker.prevConfluenceReady = currConfluenceReady;
    tracker.prevConfluenceOnCooldown = currConfluenceOnCooldown;
    tracker.prevEncounterId = world.encounter.encounterId;
    tracker.prevWaveIndex = world.encounter.currentWaveIndex;
    tracker.prevWaveClearedCount = world.encounter.waveClearedCount;
    tracker.prevEncounterCompleted = world.encounter.completed;
    tracker.prevActivatedNodesCount = world.exploration.activatedNodeIds.length;
    tracker.prevCompletedObjectivesCount = world.exploration.completedObjectiveIds.length;
    tracker.prevDiscoveredCodexCount = world.exploration.discoveredCodexIds.length;
    tracker.prevDiscoveredSecretsCount = world.exploration.discoveredSecretIds.length;
    tracker.prevUnlockedRoutesCount = world.exploration.unlockedRouteIds.length;
    tracker.prevCompletedNarrativeCount = world.exploration.completedNarrativeEventIds.length;
    tracker.prevLastNarrativeId = world.exploration.lastTriggeredNarrativeEventId;
    tracker.prevDiscoveryBannerId = world.exploration.lastDiscoveryBanner?.secretId ?? null;
    tracker.prevPromptId = world.exploration.prompt.interactableId;
    tracker.prevPromptStatus = world.exploration.prompt.status;
    tracker.prevOverclockedCount = (world.progression.overclockedUpgrades ?? []).length;
    tracker.prevAwakenedCount = (world.progression.awakenedUpgrades ?? []).length;
    tracker.prevNeuralProtocolsCount = (world.progression.purchasedNeuralProtocols ?? []).length;
    tracker.prevResolvedStoryCount = currResolvedStoryCount;
    tracker.prevClaimedCachesCount = currClaimedCachesCount;
    tracker.prevDiscoveredHoloCount = currDiscoveredHoloCount;
    tracker.prevActiveHoloId = currActiveHoloId;
    tracker.prevReadyBeaconsCount = currReadyBeaconsCount;
    tracker.prevLockOnTargetId = currLockOnTargetId;
    tracker.prevLockOnStaggered = currLockOnStaggered;
    tracker.prevCanExecute = canExecute;
  }

  _sharedSyncResult.shouldSyncHud = shouldSyncHud;
  _sharedSyncResult.persistenceChanged = persistenceChanged;
  return _sharedSyncResult;
}
