import { GAME_CONFIG } from './config.ts';
import {
  COMBAT_FLOW_CONFIG,
  canCancelActionTailForCombatFlow,
  clearActiveStrikeFlow,
  consumeAttackFlowMultipliers,
  getCombatFlowHudSummary,
  getCombatFlowMovementSpeedMultiplier,
  grantChronoSlipWindow,
  grantQuickDrawWindow,
  grantRelayMomentumWindow,
  grantRiposteWindow,
  tickPlayerCombatFlowTimers,
} from './combat-flow.ts';
import {
  MASTERY_SEAL_TIERS,
  MASTERY_TARGETS,
  TEMPORAL_SLIP_CONFIG,
  VALID_MASTERY_TARGET_IDS,
  claimAllReadyMasteryBounties,
  claimCombatMasteryBounty,
  cloneCombatMasteryLedger,
  computeEffectiveHostileTimeScale,
  computeLiveTacticalRankForecast,
  computeMasterySealModifiers,
  isSRankOrAbove,
  isValidMasteryTargetId,
  mapBossIdToMasteryTargetId,
  mapChapterToSectorMasteryId,
  recordCombatMasteryVictory,
  sanitizeCombatMasteryLedger,
  tickTemporalSlipTimers,
  tryTriggerTemporalSlip,
  type LiveRankForecast,
  type MasterySealComputedSummary,
  type MasteryTargetDefinition,
} from './combat-mastery.ts';
export {
  MASTERY_SEAL_TIERS,
  MASTERY_TARGETS,
  TEMPORAL_SLIP_CONFIG,
  VALID_MASTERY_TARGET_IDS,
  claimAllReadyMasteryBounties,
  claimCombatMasteryBounty,
  cloneCombatMasteryLedger,
  computeEffectiveHostileTimeScale,
  computeLiveTacticalRankForecast,
  computeMasterySealModifiers,
  isSRankOrAbove,
  isValidMasteryTargetId,
  mapBossIdToMasteryTargetId,
  mapChapterToSectorMasteryId,
  recordCombatMasteryVictory,
  sanitizeCombatMasteryLedger,
  tickTemporalSlipTimers,
  tryTriggerTemporalSlip,
  type LiveRankForecast,
  type MasterySealComputedSummary,
  type MasteryTargetDefinition,
};
import {
  computePeripheralThreats,
  computeTacticalRadarSnapshot,
} from './tactical-hud.ts';
import {
  ACTIVE_VENT_CONFIG,
  ADRENALINE_GAINS,
  applyAdrenalineDelta,
  evaluateActiveVentTiming,
  getAdrenalineModifiers,
  tickAdrenalineDecay,
} from './adrenaline.ts';
import {
  CHRONO_EXECUTION_CONFIG,
  cycleLockOnTarget,
  findExecutionCandidate,
  resolveActiveLockOnTarget,
  selectBestLockOnTarget,
  type ExecutionCandidate,
} from './lock-on.ts';
import {
  RIG_MODULES,
  VALID_RIG_MODULE_IDS,
  VALID_RIG_MODULE_SLOTS,
  computeEffectiveRigModifiers,
  createEmptyEquippedRigModules,
  getAllRigModuleDefinitions,
  getRigModuleDefinition,
  isRigModuleOverclocked,
  isValidRigModuleId,
  isValidRigModuleSlot,
  normalizeRigProgressionFields,
} from './rig-progression.ts';
export {
  RIG_MODULES,
  VALID_RIG_MODULE_IDS,
  VALID_RIG_MODULE_SLOTS,
  computeEffectiveRigModifiers,
  createEmptyEquippedRigModules,
  getAllRigModuleDefinitions,
  getRigModuleDefinition,
  isRigModuleOverclocked,
  isValidRigModuleId,
  isValidRigModuleSlot,
  normalizeRigProgressionFields,
};
import {
  RIG_OVERCLOCK_COST,
  SENTINEL_PROTOCOL_SPECS,
  VALID_SENTINEL_MODES,
  absorbDamageWithChronoWard,
  computeMaxChronoWard,
  computeRigSetSynergy,
  createInitialChronoAegisState,
  cycleNextSentinelMode,
  formatSentinelHudLabel,
  isValidSentinelMode,
  normalizeSentinelMode,
  shouldTriggerPhantomAfterimage,
  syncChronoAegisMaxWard,
  tickChronoAegisSystem,
  type RigSetSynergySummary,
} from './chrono-aegis.ts';
export {
  RIG_OVERCLOCK_COST,
  SENTINEL_PROTOCOL_SPECS,
  VALID_SENTINEL_MODES,
  absorbDamageWithChronoWard,
  computeMaxChronoWard,
  computeRigSetSynergy,
  createInitialChronoAegisState,
  cycleNextSentinelMode,
  formatSentinelHudLabel,
  isValidSentinelMode,
  normalizeSentinelMode,
  shouldTriggerPhantomAfterimage,
  syncChronoAegisMaxWard,
  tickChronoAegisSystem,
  type RigSetSynergySummary,
};
import {
  BOSS_CORE_OMEGA_COST,
  BOSS_ECHO_CORES,
  COGNATE_CORE_FOR_WEAPON,
  COGNATE_WEAPON_FOR_CORE,
  CONFLUENCE_BURST_COOLDOWN_SEC,
  CONFLUENCE_CHARGE_GAINS,
  VALID_BOSS_ECHO_CORE_IDS,
  computeBossCoreModifiers,
  computeSentinelCoreConfluence,
  computeWeaponCoreAttunement,
  createInitialChronoConfluenceState,
  deriveAutoUnlockedBossCores,
  formatBossCoreHudBadge,
  getAllBossEchoCoreSpecs,
  isBossCoreTranscended,
  isValidBossEchoCoreId,
  isWeaponAttunedToBossCore,
  normalizeBossCoreProgression,
  type BossEchoCoreSpec,
  type SentinelCoreConfluenceSummary,
  type WeaponCoreAttunementSummary,
} from './boss-echo-cores.ts';
export {
  BOSS_CORE_OMEGA_COST,
  BOSS_ECHO_CORES,
  COGNATE_CORE_FOR_WEAPON,
  COGNATE_WEAPON_FOR_CORE,
  CONFLUENCE_BURST_COOLDOWN_SEC,
  CONFLUENCE_CHARGE_GAINS,
  VALID_BOSS_ECHO_CORE_IDS,
  computeBossCoreModifiers,
  computeSentinelCoreConfluence,
  computeWeaponCoreAttunement,
  createInitialChronoConfluenceState,
  deriveAutoUnlockedBossCores,
  formatBossCoreHudBadge,
  getAllBossEchoCoreSpecs,
  isBossCoreTranscended,
  isValidBossEchoCoreId,
  isWeaponAttunedToBossCore,
  normalizeBossCoreProgression,
  type BossEchoCoreSpec,
  type SentinelCoreConfluenceSummary,
  type WeaponCoreAttunementSummary,
};
import {
  WEAPON_OVERCLOCK_COST,
  VALID_NEURAL_PROTOCOL_IDS,
  NEURAL_PROTOCOLS,
  isValidNeuralProtocolId,
  getNeuralProtocolDefinition,
  getAllNeuralProtocolDefinitions,
  computeNeuralProtocolModifiers,
  isUpgradeOverclocked,
  FRAGMENT_CACHES,
  buildFragmentCachesForChapter,
  SECTOR_BEACONS,
  buildSectorBeaconsForChapter,
  STORY_ARCS,
  getStoryArcForChapter,
  getStoryArcById,
  buildStoryArcStates,
  computeChronicleStanceSummary,
  normalizeResolvedStoryChoices,
  type NeuralProtocolModifiers,
} from './chronicle-expansion.ts';
import {
  WEAPON_AWAKENING_COST,
  isUpgradeAwakened,
  computeEquippedMythicBonus,
  computeStanceDoctrineModifiers,
} from './chronicle-awakening.ts';
export {
  WEAPON_AWAKENING_COST,
  isUpgradeAwakened,
  computeEquippedMythicBonus,
  computeStanceDoctrineModifiers,
};
import {
  BOSS_GAUNTLET_STAGES,
  OVERDRIVE_CHARGE_GAINS,
  activateChronoOverdrive,
  addOverdriveCharge,
  advanceBossGauntletStage,
  canActivateChronoOverdrive,
  createInitialBossGauntletState,
  createInitialChronoOverdriveState,
  getGauntletStageSpec,
  getOverdriveTimeScales,
  tickChronoOverdrive,
} from './chrono-overdrive.ts';
export {
  BOSS_GAUNTLET_STAGES,
  OVERDRIVE_CHARGE_GAINS,
  canActivateChronoOverdrive,
  createInitialBossGauntletState,
  createInitialChronoOverdriveState,
  getGauntletStageSpec,
  getOverdriveTimeScales,
};
import {
  EXPEDITION_BREACH_SEAL,
  EXPEDITION_ENTRY_AIRLOCK,
  EXPEDITION_SECTORS,
  EXPEDITION_TRANSIT_AIRLOCK,
  SAFE_ROOM_STATIONS,
  buildStationSectorMapNodes,
  computeExpeditionGuideTarget,
  computeSectorDiscoveryRatio,
  createInitialExpeditionState,
  createSafeRoomState,
  createSecretVaultForChapter,
  detectNearbySafeRoomStation,
  getExpeditionSectorSpec,
  getNgPlusModifiers,
  isPlayerInsideBreachSeal,
  isPlayerInsideTransitAirlock,
  tickSecretEchoVault,
} from './expedition-path.ts';
export {
  EXPEDITION_BREACH_SEAL,
  EXPEDITION_ENTRY_AIRLOCK,
  EXPEDITION_SECTORS,
  EXPEDITION_TRANSIT_AIRLOCK,
  SAFE_ROOM_STATIONS,
  buildStationSectorMapNodes,
  computeExpeditionGuideTarget,
  computeSectorDiscoveryRatio,
  createInitialExpeditionState,
  createSafeRoomState,
  createSecretVaultForChapter,
  detectNearbySafeRoomStation,
  getExpeditionSectorSpec,
  getNgPlusModifiers,
  isPlayerInsideBreachSeal,
  isPlayerInsideTransitAirlock,
  tickSecretEchoVault,
};
import {
  VALID_CHRONO_RELIC_IDS,
  CHRONO_RELICS,
  isValidChronoRelicId,
  getAllChronoRelicDefinitions,
  computeRecursionModifierSummary,
  getRelicDraftChoices,
  pickNextRecursionSector,
  WEAPON_MASTERY_THRESHOLDS,
  createEmptyWeaponMasteryXpMap,
  normalizeWeaponMasteryXpMap,
  computeWeaponMasteryRankInfo,
  computeTemporalRiftSpawnPosition,
  type RecursionModifierSummary,
} from './recursion-mode.ts';
export {
  WEAPON_OVERCLOCK_COST,
  VALID_NEURAL_PROTOCOL_IDS,
  NEURAL_PROTOCOLS,
  isValidNeuralProtocolId,
  getNeuralProtocolDefinition,
  getAllNeuralProtocolDefinitions,
  computeNeuralProtocolModifiers,
  isUpgradeOverclocked,
  FRAGMENT_CACHES,
  SECTOR_BEACONS,
  STORY_ARCS,
  getStoryArcForChapter,
  getStoryArcById,
  buildStoryArcStates,
  computeChronicleStanceSummary,
  VALID_CHRONO_RELIC_IDS,
  CHRONO_RELICS,
  isValidChronoRelicId,
  getAllChronoRelicDefinitions,
  computeRecursionModifierSummary,
  getRelicDraftChoices,
  pickNextRecursionSector,
  WEAPON_MASTERY_THRESHOLDS,
  createEmptyWeaponMasteryXpMap,
  normalizeWeaponMasteryXpMap,
  computeWeaponMasteryRankInfo,
  computeTemporalRiftSpawnPosition,
};
import {
  CHRONO_ACHIEVEMENTS,
  CHRONO_MUTATORS,
  FIELD_FABRICATOR_ITEMS,
  SERA_RIG_SKINS,
  absorbIncomingDamageWithAegis,
  computeMutatorModifiers,
  createDefaultMutators,
  createInitialParadoxState,
  createInitialSpeedrunState,
  createInitialTacticalLoadout,
  formatSpeedrunClock,
  formatSpeedrunDelta,
  getAchievementDefinition,
  getFabricatorItem,
  getSeraRigSkinDefinition,
  hasAnyActiveMutator,
  isParadoxRiftEligible,
  isSeraRigSkinUnlocked,
  pushDamagePopup,
  recordSpeedrunSectorSplit,
  tickCombatDrone,
  tickDamagePopups,
} from './paradox-expansion.ts';
export {
  CHRONO_ACHIEVEMENTS,
  CHRONO_MUTATORS,
  FIELD_FABRICATOR_ITEMS,
  SERA_RIG_SKINS,
  absorbIncomingDamageWithAegis,
  computeMutatorModifiers,
  createDefaultMutators,
  createInitialParadoxState,
  createInitialSpeedrunState,
  createInitialTacticalLoadout,
  formatSpeedrunClock,
  formatSpeedrunDelta,
  getAchievementDefinition,
  getFabricatorItem,
  getSeraRigSkinDefinition,
  hasAnyActiveMutator,
  isParadoxRiftEligible,
  isSeraRigSkinUnlocked,
  pushDamagePopup,
  recordSpeedrunSectorSplit,
  tickCombatDrone,
  tickDamagePopups,
};
import {
  PHOTO_FILTER_PRESETS,
  STYLE_RANK_THRESHOLDS,
  WEAPON_MOD_CHIPS,
  canTriggerChronoFinisher,
  computeDailyTrialScore,
  computeStyleRankTier,
  createInitialAscensionState,
  createInitialPhotoModeState,
  createInitialStyleRankState,
  generateDailyTrialConfig,
  getDailyTrialRecord,
  getPhotoFilterCss,
  getStyleRankMeta,
  getTodayDateKey,
  getWeaponModChipDefinition,
  loadDailyTrialRecords,
  penalizeStyleOnHit,
  recordStyleAction,
  saveDailyTrialRecord,
  tickStyleRank,
} from './ascension-expansion.ts';
export {
  PHOTO_FILTER_PRESETS,
  STYLE_RANK_THRESHOLDS,
  WEAPON_MOD_CHIPS,
  canTriggerChronoFinisher,
  computeDailyTrialScore,
  computeStyleRankTier,
  createInitialAscensionState,
  createInitialPhotoModeState,
  createInitialStyleRankState,
  generateDailyTrialConfig,
  getDailyTrialRecord,
  getPhotoFilterCss,
  getStyleRankMeta,
  getTodayDateKey,
  getWeaponModChipDefinition,
  loadDailyTrialRecords,
  penalizeStyleOnHit,
  recordStyleAction,
  saveDailyTrialRecord,
  tickStyleRank,
};
import {
  armPhantomRiposte,
  consumeSingularityStrikeMultipliers,
  createInitialSingularityCombatState,
  registerSingularityHit,
  resetSingularityComboOnDamage,
  tickSingularityCombat,
  tryTriggerFlashSwap,
} from './singularity-combat.ts';
export {
  armPhantomRiposte,
  consumeSingularityStrikeMultipliers,
  createInitialSingularityCombatState,
  registerSingularityHit,
  resetSingularityComboOnDamage,
  tickSingularityCombat,
  tryTriggerFlashSwap,
};
import {
  OVERCHARGE_GAIN_FLASH_SWAP,
  OVERCHARGE_GAIN_HEAVY_HIT,
  OVERCHARGE_GAIN_LIGHT_HIT,
  OVERCHARGE_GAIN_PARRY,
  addWeaponKineticCharge,
  createInitialKineticOverchargeState,
  getActiveWeaponOverchargeModifiers,
  tickWeaponKineticOvercharge,
} from './kinetic-overcharge.ts';
export {
  addWeaponKineticCharge,
  createInitialKineticOverchargeState,
  getActiveWeaponOverchargeModifiers,
  tickWeaponKineticOvercharge,
};
import {
  LYSA_HOLO_MEMORIES,
  VALID_HOLO_MEMORY_IDS,
  computeHoloMemoryResonanceBonus,
  getHoloMemoryById,
  getHoloMemoryForChapter,
  getDifficultySpec,
  isValidHoloMemoryId,
  sanitizeHoloMemoryIds,
} from './chronicle-narrative.ts';
export {
  LYSA_HOLO_MEMORIES,
  VALID_HOLO_MEMORY_IDS,
  computeHoloMemoryResonanceBonus,
  getHoloMemoryById,
  getHoloMemoryForChapter,
  getDifficultySpec,
  isValidHoloMemoryId,
  sanitizeHoloMemoryIds,
};
import {
  ECHO_DOCTRINE_SPECS,
  TWIN_SYNC_EXECUTION_BONUS,
  VALID_ECHO_DOCTRINE_IDS,
  addTwinSyncBonus,
  createInitialTwinSyncState,
  cycleNextEchoDoctrineId,
  formatEchoDoctrineHudBadge,
  getEchoDoctrineSpec,
  getTwinSyncModifiers,
  isPincerFlankGeometry,
  isValidEchoDoctrineId,
  normalizeEchoDoctrineId,
  registerTwinSyncCombatHit,
  tickTwinSyncState,
} from './echo-synergy.ts';
export {
  ECHO_DOCTRINE_SPECS,
  VALID_ECHO_DOCTRINE_IDS,
  addTwinSyncBonus,
  createInitialTwinSyncState,
  cycleNextEchoDoctrineId,
  formatEchoDoctrineHudBadge,
  getEchoDoctrineSpec,
  getTwinSyncModifiers,
  isPincerFlankGeometry,
  isValidEchoDoctrineId,
  normalizeEchoDoctrineId,
  registerTwinSyncCombatHit,
  tickTwinSyncState,
};
import {
  createInitialChronoMomentumState,
  getChronoMomentumModifiers,
  registerMomentumStreakEvent,
  tickChronoMomentumState,
  triggerWeakpointBreakWindow,
} from './chrono-momentum.ts';
export {
  createInitialChronoMomentumState,
  getChronoMomentumModifiers,
  registerMomentumStreakEvent,
  tickChronoMomentumState,
  triggerWeakpointBreakWindow,
};
import {
  CHRONO_NEXUS_TIER_SPECS,
  CHRONICLE_LINK_CHAIN,
  computeChroniclePassiveBonus,
  createInitialChronoNexusState,
  evaluateChronoNexusState,
  getChronoNexusModifiers,
  resolveChronoNexusTier,
} from './chrono-nexus.ts';
export {
  CHRONO_NEXUS_TIER_SPECS,
  CHRONICLE_LINK_CHAIN,
  computeChroniclePassiveBonus,
  createInitialChronoNexusState,
  evaluateChronoNexusState,
  getChronoNexusModifiers,
  resolveChronoNexusTier,
};
import {
  ORDERED_WEAPON_RESONANCE_IDS,
  WEAPON_RESONANCE_SPECS,
  computeGlobalArsenalMasteryBonus,
  createInitialWeaponResonanceState,
  getActiveWeaponResonanceModifiers,
  resolveWeaponSwapResonanceId,
  tickWeaponResonanceState,
  triggerWeaponSwapResonance,
} from './chrono-resonance.ts';
export {
  ORDERED_WEAPON_RESONANCE_IDS,
  WEAPON_RESONANCE_SPECS,
  computeGlobalArsenalMasteryBonus,
  createInitialWeaponResonanceState,
  getActiveWeaponResonanceModifiers,
  resolveWeaponSwapResonanceId,
  tickWeaponResonanceState,
  triggerWeaponSwapResonance,
};
import type {
  ArenaArtilleryZone,
  ArenaBoostPad,
  ArenaFluxPool,
  ArenaFragmentCacheState,
  ArenaTemporalRift,
  BossAiState,
  BossAttackType,
  BossCheckpointState,
  BossId,
  BossPhase,
  BossState,
  CampaignChapterId,
  ChoirState,
  ChronicleLoomEndingId,
  ChronicleLoomState,
  ChronoAchievementId,
  ChronoMutatorState,
  ChronoPuzzleState,
  CombatEvent,
  CombineBarrierState,
  CuratorState,
  FabricatorItemId,
  ParadoxRuntimeState,
  SeraRigSkinId,
  EchoClip,
  EchoCollapseState,
  EchoRecordedActionEvent,
  EchoRecordedActionType,
  EchoSample,
  EchoSystemState,
  EncounterCompositionId,
  EncounterDefinition,
  EncounterMode,
  EncounterPacingTier,
  EncounterRuntimeState,
  EncounterSpawnValidationResult,
  EncounterWaveSpec,
  EnemyArchetype,
  EnemyModifierId,
  EnemyState,
  GameAppState,
  GravityPinState,
  HarmonicNodeState,
  HeavyReceiverState,
  HoloMemoryId,
  HudBossSnapshot,
  HudSnapshot,
  MatronState,
  NarrativeCommsState,
  CodexEntryDefinition,
  CodexEntryId,
  EnvironmentalInteractableDefinition,
  EnvironmentalInteractableState,
  HudCodexEntryView,
  InteractableId,
  InteractableStatus,
  InteractionEvaluationStatus,
  InteractionTargetEvaluation,
  MissionDefinition,
  MissionId,
  MissionObjectiveDefinition,
  MissionObjectiveId,
  MissionObjectiveState,
  MissionRuntimeState,
  NarrativeTransmission,
  NearbyExpansionPrompt,
  ObjectiveStatus,
  ObstacleCollider,
  PersistedActiveCampaignState,
  PersistedCampaignSaveV2,
  PersistedExplorationState,
  PersistedWeaponProgressionState,
  PlayerInputFrame,
  PlayerState,
  PressurePlateState,
  ProjectileState,
  ReconstructedAttackTrace,
  RelayEvaluationStatus,
  RelaySystemState,
  RelayTargetEvaluation,
  ResonanceMarkState,
  ResonanceOutcome,
  ResonanceSystemState,
  RigEffectiveModifiers,
  RigModuleDefinition,
  RigModuleId,
  RigModuleSlot,
  RunMode,
  RunSummary,
  SavedCampaignProgressSnapshot,
  TacticalWaypointState,
  TutorialState,
  TutorialStep,
  UpgradeEquipOutcome,
  UpgradePurchaseOutcome,
  VerticalSliceRunState,
  VerticalSliceStage,
  WeaponAttackMode,
  WeaponDefinition,
  WeaponId,
  WeaponProgressionRewardDefinition,
  WeaponProgressionRewardId,
  WeaponProgressionState,
  WeaponUpgradeDefinition,
  WeaponUpgradeId,
  SectorRegionId,
  SectorRegionDefinition,
  TraversalRouteId,
  TraversalRouteStatus,
  TraversalRouteDefinition,
  TraversalRouteState,
  TimedEnergyHazardId,
  TimedEnergyHazardPhase,
  TimedEnergyHazardDefinition,
  TimedEnergyHazardState,
  SecretAreaId,
  SecretAreaDefinition,
  SecretAreaState,
  LocalMapRegionCell,
  LocalMapSnapshot,
  NarrativeEventId,
  NarrativeEventDefinition,
  NarrativeEventState,
  ChapterWorldIdentityDefinition,
  CampaignSynthesisTier,
  CampaignEndingDiscoverySummary,
  ChronicleStance,
  ChronicleStanceSummary,
  FragmentCacheId,
  NeuralProtocolDefinition,
  NeuralProtocolId,
  SectorBeaconId,
  SectorTacticalBeaconState,
  StoryArcDefinition,
  StoryArcId,
  StoryArcState,
  ChronoRelicId,
  ChronoRelicDefinition,
  RecursionRunState,
  WeaponMasteryRankInfo,
  WeaponMasteryXpMap,
  WorldExplorationState,
  WorldState,
} from './types.ts';

export function shouldExposeTestHooks(envConfig?: {
  PROD?: boolean;
  DEV?: boolean;
  MODE?: string;
  VITE_ENABLE_TEST_HOOKS?: string;
}): boolean {
  const env =
    envConfig ??
    ((import.meta as unknown as { env?: Record<string, unknown> }).env as
      | {
          PROD?: boolean;
          DEV?: boolean;
          MODE?: string;
          VITE_ENABLE_TEST_HOOKS?: string;
        }
      | undefined);
  if (!env) return true;
  if (env.VITE_ENABLE_TEST_HOOKS === 'true') return true;
  if (env.VITE_ENABLE_TEST_HOOKS === 'false') return false;
  if (env.PROD === true || env.MODE === 'production') return false;
  return true;
}

// Reusable module-scope scratch objects to avoid per-frame allocations
const _scratchMoveVec = { dirX: 0, dirZ: 0, length: 0 };
const _scratchCollider = { x: 0, z: 0, radius: 0 };
const _scratchSubstepInput: PlayerInputFrame = {
  moveX: 0,
  moveZ: 0,
  aimYaw: Math.PI,
  aimPitch: GAME_CONFIG.camera.defaultPitch,
  lightAttackJustPressed: false,
  heavyHoldActive: false,
  heavyJustReleased: false,
  heavyAttackJustPressed: false,
  dodgeJustPressed: false,
  parryJustPressed: false,
  switchWeaponJustPressed: false,
  selectWeaponId: null,
  echoRecordJustPressed: false,
  echoPlayJustPressed: false,
  echoClearJustPressed: false,
  echoRelayJustPressed: false,
  gravityPinJustPressed: false,
  echoCollapseJustPressed: false,
  interactJustPressed: false,
};

export const VALID_WEAPON_IDS: readonly WeaponId[] = [
  'chrono_edge',
  'pulsecaster',
  'phase_rail',
  'grav_breaker',
  'chrono_scythe',
];

export function isValidWeaponId(value: unknown): value is WeaponId {
  return (
    typeof value === 'string' &&
    (VALID_WEAPON_IDS as readonly string[]).includes(value)
  );
}

export const VALID_ENCOUNTER_COMPOSITION_IDS: readonly EncounterCompositionId[] = [
  'prologue_calibration_bay',
  'tactical_guard_and_flank',
  'tactical_crossfire_suppression',
  'tactical_temporal_disruption',
  'tactical_mastery_gauntlet',
  'tactical_apex_bestiary',
];

export function isValidEncounterCompositionId(
  value: unknown
): value is EncounterCompositionId {
  return (
    typeof value === 'string' &&
    (VALID_ENCOUNTER_COMPOSITION_IDS as readonly string[]).includes(value)
  );
}

export function getEncounterDefinition(
  encounterId: EncounterCompositionId = GAME_CONFIG.encounters.defaultEncounterId
): EncounterDefinition {
  const safeId: EncounterCompositionId = isValidEncounterCompositionId(encounterId)
    ? encounterId
    : GAME_CONFIG.encounters.defaultEncounterId;
  return GAME_CONFIG.encounters.definitions[safeId];
}

export function getAllEncounterDefinitions(): EncounterDefinition[] {
  return VALID_ENCOUNTER_COMPOSITION_IDS.map((id) => getEncounterDefinition(id));
}

export function validateEncounterSpawnPoint(
  x: number,
  z: number,
  unitRadius: number,
  obstacles: readonly ObstacleCollider[],
  arenaRadius: number = GAME_CONFIG.arena.radius,
  playerX: number = GAME_CONFIG.player.spawnX,
  playerZ: number = GAME_CONFIG.player.spawnZ,
  playerRadius: number = GAME_CONFIG.player.radius
): EncounterSpawnValidationResult {
  if (!Number.isFinite(x) || !Number.isFinite(z)) {
    return { valid: false, reason: 'non_finite_coordinates' };
  }
  const distFromCenter = Math.hypot(x, z);
  if (distFromCenter + unitRadius > arenaRadius - 0.5) {
    return { valid: false, reason: 'outside_arena_bounds' };
  }
  const distToPlayer = Math.hypot(x - playerX, z - playerZ);
  if (distToPlayer < unitRadius + playerRadius + 1.0) {
    return { valid: false, reason: 'overlaps_player_spawn' };
  }
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    if (obs.disabled) continue;
    const distToObs = Math.hypot(x - obs.x, z - obs.z);
    if (distToObs < unitRadius + obs.radius + 0.15) {
      return { valid: false, reason: `overlaps_obstacle_${obs.id}` };
    }
  }
  return { valid: true, reason: 'ok' };
}

function createInitialEncounterRuntimeState(
  encounterId: EncounterCompositionId = GAME_CONFIG.encounters.defaultEncounterId
): EncounterRuntimeState {
  const def = getEncounterDefinition(encounterId);
  const firstWave: EncounterWaveSpec = def.waves[0];
  return {
    encounterId: def.id,
    label: def.label,
    pacingTier: def.pacingTier,
    tacticalFocus: def.tacticalFocus,
    currentWaveIndex: 1,
    totalWaves: def.waves.length,
    waveClearedCount: 0,
    completed: false,
    activeWaveLabel: firstWave.label,
    tacticalDirective: firstWave.tacticalDirective,
    spawnedWaveIndices: [1],
  };
}

function cloneEncounterRuntimeState(
  state?: EncounterRuntimeState | null
): EncounterRuntimeState {
  if (!state || !isValidEncounterCompositionId(state.encounterId)) {
    return createInitialEncounterRuntimeState();
  }
  return {
    ...state,
    spawnedWaveIndices: [...(state.spawnedWaveIndices ?? [1])],
  };
}

// ============================================================================
// PHASE 18 — MISSIONS, OBJECTIVES, ENVIRONMENTAL INTERACTION & LORE CODEX
// ============================================================================

export const VALID_MISSION_IDS: readonly MissionId[] = [
  'mission_prologue_calibration',
  'mission_ch1_helix',
  'mission_ch2_choir',
  'mission_ch3_curator',
  'mission_ch4_matron',
  'mission_ch5_loom',
];

export const VALID_MISSION_OBJECTIVE_IDS: readonly MissionObjectiveId[] = [
  'obj_prologue_puzzle_calibration',
  'obj_prologue_clear_bay',
  'obj_prologue_optional_terminal',
  'obj_prologue_optional_power_node',
  'obj_ch1_break_helix_shield',
  'obj_ch1_defeat_helix',
  'obj_ch1_optional_marshal_log',
  'obj_ch2_sync_harmonic_cycle',
  'obj_ch2_defeat_choir',
  'obj_ch2_optional_garden_conduit',
  'obj_ch3_purge_archive_decoy',
  'obj_ch3_defeat_curator',
  'obj_ch3_optional_lysa_terminal',
  'obj_ch4_survive_excision',
  'obj_ch4_defeat_matron',
  'obj_ch4_optional_quarantine_override',
  'obj_ch5_defeat_warden_prime',
  'obj_ch5_select_loom_directive',
  'obj_ch5_optional_loom_manifest',
];

export const VALID_INTERACTABLE_IDS: readonly InteractableId[] = [
  'int_prologue_diagnostic_terminal',
  'int_prologue_aux_power_node',
  'int_prologue_shortcut_gate',
  'int_ch1_marshal_terminal',
  'int_ch1_ballistic_capacitor',
  'int_ch2_garden_echo_conduit',
  'int_ch2_chorus_log_terminal',
  'int_ch3_lysa_archive_terminal',
  'int_ch3_vault_power_relay',
  'int_ch4_quarantine_override_node',
  'int_ch4_surgical_log_terminal',
  'int_ch5_loom_manifest_terminal',
  'int_ch5_temporal_anchor_conduit',
];

export const VALID_CODEX_ENTRY_IDS: readonly CodexEntryId[] = [
  'CODEX-01',
  'CODEX-02',
  'CODEX-03',
  'CODEX-04',
  'CODEX-05',
  'CODEX-06',
  'CODEX-07',
  'CODEX-08',
];

export const VALID_UNLOCKABLE_ROUTE_IDS: readonly string[] = [
  'pillar-nw',
  'pillar-ne',
  'pillar-sw',
  'pillar-se',
];

export const VALID_SECTOR_REGION_IDS: readonly SectorRegionId[] = [
  'region_prologue_staging_deck',
  'region_prologue_west_lock',
  'region_prologue_east_bypass',
  'region_prologue_secret_alcove',
  'region_ch1_nexus_core',
  'region_ch1_nw_conduit_lane',
  'region_ch1_secret_armory',
  'region_ch2_garden_rotunda',
  'region_ch2_sw_echo_bridge',
  'region_ch2_secret_sanctum',
  'region_ch3_archive_nave',
  'region_ch3_sw_purge_lane',
  'region_ch3_secret_vault',
  'region_ch4_surgical_theater',
  'region_ch4_se_override_bay',
  'region_ch5_loom_sanctuary',
  'region_ch5_nw_anchor_bridge',
];

export const VALID_TRAVERSAL_ROUTE_IDS: readonly TraversalRouteId[] = [
  'route_prologue_west_containment',
  'route_prologue_east_bypass',
  'route_ch1_nw_timed_conduit',
  'route_ch2_sw_echo_bridge',
  'route_ch3_sw_archive_passage',
  'route_ch4_se_quarantine_lane',
  'route_ch5_loom_anchor_bridge',
];

export const VALID_TIMED_HAZARD_IDS: readonly TimedEnergyHazardId[] = [
  'hazard_prologue_east_arc_vent',
  'hazard_ch1_nw_arc_lane',
  'hazard_ch3_sw_purge_lane',
];

export const VALID_SECRET_AREA_IDS: readonly SecretAreaId[] = [
  'secret_prologue_calibration_alcove',
  'secret_ch1_marshal_armory_cache',
  'secret_ch2_hydroponic_echo_sanctum',
  'secret_ch3_lysa_unedited_vault',
];

export const VALID_NARRATIVE_EVENT_IDS: readonly NarrativeEventId[] = [
  'nev_prologue_awakening',
  'nev_prologue_calibration_revelation',
  'nev_prologue_bay_diagnostic_evidence',
  'nev_prologue_echo_memory_trace',
  'nev_ch1_containment_arrival',
  'nev_ch1_lockdown_evidence',
  'nev_ch1_aegis_escalation',
  'nev_ch1_seal_recovered',
  'nev_ch2_garden_arrival',
  'nev_ch2_echo_memory_duet',
  'nev_ch2_acoustic_sanctum_discovery',
  'nev_ch2_choir_silenced',
  'nev_ch3_vault_arrival',
  'nev_ch3_lysa_audit_revelation',
  'nev_ch3_unindexed_alcove_memory',
  'nev_ch3_vault_purged',
  'nev_ch4_quarantine_arrival',
  'nev_ch4_excision_evidence',
  'nev_ch4_echo_collapse_protocol',
  'nev_ch4_quarantine_breached',
  'nev_ch5_loom_arrival',
  'nev_ch5_anchor_echo_memory',
  'nev_ch5_archive_convergence',
  'nev_ch5_final_resolution',
];

export function isValidMissionId(value: unknown): value is MissionId {
  return (
    typeof value === 'string' &&
    (VALID_MISSION_IDS as readonly string[]).includes(value)
  );
}

export function isValidMissionObjectiveId(
  value: unknown
): value is MissionObjectiveId {
  return (
    typeof value === 'string' &&
    (VALID_MISSION_OBJECTIVE_IDS as readonly string[]).includes(value)
  );
}

export function isValidInteractableId(value: unknown): value is InteractableId {
  return (
    typeof value === 'string' &&
    (VALID_INTERACTABLE_IDS as readonly string[]).includes(value)
  );
}

export function isValidCodexEntryId(value: unknown): value is CodexEntryId {
  return (
    typeof value === 'string' &&
    (VALID_CODEX_ENTRY_IDS as readonly string[]).includes(value)
  );
}

export function isValidUnlockableRouteId(value: unknown): value is string {
  return (
    typeof value === 'string' && VALID_UNLOCKABLE_ROUTE_IDS.includes(value)
  );
}

export function isValidSectorRegionId(
  value: unknown
): value is SectorRegionId {
  return (
    typeof value === 'string' &&
    (VALID_SECTOR_REGION_IDS as readonly string[]).includes(value)
  );
}

export function isValidTraversalRouteId(
  value: unknown
): value is TraversalRouteId {
  return (
    typeof value === 'string' &&
    (VALID_TRAVERSAL_ROUTE_IDS as readonly string[]).includes(value)
  );
}

export function isValidTimedEnergyHazardId(
  value: unknown
): value is TimedEnergyHazardId {
  return (
    typeof value === 'string' &&
    (VALID_TIMED_HAZARD_IDS as readonly string[]).includes(value)
  );
}

export function isValidSecretAreaId(value: unknown): value is SecretAreaId {
  return (
    typeof value === 'string' &&
    (VALID_SECRET_AREA_IDS as readonly string[]).includes(value)
  );
}

export function isValidNarrativeEventId(
  value: unknown
): value is NarrativeEventId {
  return (
    typeof value === 'string' &&
    (VALID_NARRATIVE_EVENT_IDS as readonly string[]).includes(value)
  );
}

export function getSectorRegionDefinition(
  regionId: SectorRegionId
): SectorRegionDefinition;
export function getSectorRegionDefinition(
  regionId: unknown
): SectorRegionDefinition | null;
export function getSectorRegionDefinition(
  regionId: unknown
): SectorRegionDefinition | null {
  if (!isValidSectorRegionId(regionId)) return null;
  return GAME_CONFIG.exploration.regions[regionId] ?? null;
}

export function getAllSectorRegionDefinitionsForChapter(
  chapter: CampaignChapterId
): SectorRegionDefinition[] {
  return VALID_SECTOR_REGION_IDS.map((id) => getSectorRegionDefinition(id)).filter(
    (def) => def.chapter === chapter
  );
}

export function getTraversalRouteDefinition(
  routeId: TraversalRouteId
): TraversalRouteDefinition;
export function getTraversalRouteDefinition(
  routeId: unknown
): TraversalRouteDefinition | null;
export function getTraversalRouteDefinition(
  routeId: unknown
): TraversalRouteDefinition | null {
  if (!isValidTraversalRouteId(routeId)) return null;
  return GAME_CONFIG.exploration.routes[routeId] ?? null;
}

export function getAllTraversalRouteDefinitionsForChapter(
  chapter: CampaignChapterId
): TraversalRouteDefinition[] {
  return VALID_TRAVERSAL_ROUTE_IDS.map((id) => getTraversalRouteDefinition(id)).filter(
    (def) => def.chapter === chapter
  );
}

export function getTimedEnergyHazardDefinition(
  hazardId: TimedEnergyHazardId
): TimedEnergyHazardDefinition;
export function getTimedEnergyHazardDefinition(
  hazardId: unknown
): TimedEnergyHazardDefinition | null;
export function getTimedEnergyHazardDefinition(
  hazardId: unknown
): TimedEnergyHazardDefinition | null {
  if (!isValidTimedEnergyHazardId(hazardId)) return null;
  return GAME_CONFIG.exploration.hazards[hazardId] ?? null;
}

export function getAllTimedEnergyHazardDefinitionsForChapter(
  chapter: CampaignChapterId
): TimedEnergyHazardDefinition[] {
  return VALID_TIMED_HAZARD_IDS.map((id) => getTimedEnergyHazardDefinition(id)).filter(
    (def) => def.chapter === chapter
  );
}

export function getSecretAreaDefinition(
  secretId: SecretAreaId
): SecretAreaDefinition;
export function getSecretAreaDefinition(
  secretId: unknown
): SecretAreaDefinition | null;
export function getSecretAreaDefinition(
  secretId: unknown
): SecretAreaDefinition | null {
  if (!isValidSecretAreaId(secretId)) return null;
  return GAME_CONFIG.exploration.secrets[secretId] ?? null;
}

export function getAllSecretAreaDefinitionsForChapter(
  chapter: CampaignChapterId
): SecretAreaDefinition[] {
  return VALID_SECRET_AREA_IDS.map((id) => getSecretAreaDefinition(id)).filter(
    (def) => def.chapter === chapter
  );
}

export function getAllSecretAreaDefinitions(): SecretAreaDefinition[] {
  return VALID_SECRET_AREA_IDS.map((id) => getSecretAreaDefinition(id));
}

export function getNarrativeEventDefinition(
  eventId: NarrativeEventId
): NarrativeEventDefinition;
export function getNarrativeEventDefinition(
  eventId: unknown
): NarrativeEventDefinition | null;
export function getNarrativeEventDefinition(
  eventId: unknown
): NarrativeEventDefinition | null {
  if (!isValidNarrativeEventId(eventId)) return null;
  return GAME_CONFIG.exploration.narrativeEvents[eventId] ?? null;
}

export function getAllNarrativeEventDefinitionsForChapter(
  chapter: CampaignChapterId
): NarrativeEventDefinition[] {
  return VALID_NARRATIVE_EVENT_IDS.map((id) =>
    getNarrativeEventDefinition(id)
  ).filter((def) => def.chapter === chapter);
}

export function getAllNarrativeEventDefinitions(): NarrativeEventDefinition[] {
  return VALID_NARRATIVE_EVENT_IDS.map((id) => getNarrativeEventDefinition(id));
}

export function getChapterWorldIdentity(
  chapter: CampaignChapterId = 'prologue'
): ChapterWorldIdentityDefinition {
  const safeChapter = isValidCampaignChapterId(chapter) ? chapter : 'prologue';
  return GAME_CONFIG.exploration.chapterIdentities[safeChapter];
}

export function buildNarrativeEventsForChapter(
  chapter: CampaignChapterId,
  completedNarrativeEventIds: readonly NarrativeEventId[],
  existingEvents?: readonly NarrativeEventState[] | null
): NarrativeEventState[] {
  const defs = getAllNarrativeEventDefinitionsForChapter(chapter);
  return defs.map((def) => {
    const completed = completedNarrativeEventIds.includes(def.id);
    const prev = existingEvents?.find((e) => e.id === def.id);
    return {
      id: def.id,
      chapter: def.chapter,
      category: def.category,
      triggerKind: def.triggerKind,
      title: def.title,
      subtitle: def.subtitle,
      summary: def.summary,
      completed,
      completedAtTime: completed ? (prev?.completedAtTime ?? 0) : null,
      linkedCodexId: def.linkedCodexId ?? null,
    };
  });
}

export function buildCampaignEndingDiscoverySummary(
  paramsOrWorld:
    | WorldState
    | {
        completedChapters?: readonly CampaignChapterId[];
        recoveredLogs?: readonly string[];
        discoveredCodexIds?: readonly CodexEntryId[];
        discoveredSecretIds?: readonly SecretAreaId[];
        activatedNodeIds?: readonly InteractableId[];
        unlockedRouteIds?: readonly string[];
        completedNarrativeEventIds?: readonly NarrativeEventId[];
        prologueBarrierOpen?: boolean;
      }
): CampaignEndingDiscoverySummary {
  const isWorld =
    paramsOrWorld &&
    typeof paramsOrWorld === 'object' &&
    'exploration' in paramsOrWorld &&
    'run' in paramsOrWorld;
  const params = isWorld
    ? {
        completedChapters: (paramsOrWorld as WorldState).run?.completedChapters,
        recoveredLogs: (paramsOrWorld as WorldState).run?.recoveredLogs,
        discoveredCodexIds: (paramsOrWorld as WorldState).exploration
          ?.discoveredCodexIds,
        discoveredSecretIds: (paramsOrWorld as WorldState).exploration
          ?.discoveredSecretIds,
        activatedNodeIds: (paramsOrWorld as WorldState).exploration
          ?.activatedNodeIds,
        unlockedRouteIds: (paramsOrWorld as WorldState).exploration
          ?.unlockedRouteIds,
        completedNarrativeEventIds: (paramsOrWorld as WorldState).exploration
          ?.completedNarrativeEventIds,
        prologueBarrierOpen: Boolean(
          (paramsOrWorld as WorldState).puzzle?.finalBarrier?.open ||
            (paramsOrWorld as WorldState).puzzle?.completed
        ),
      }
    : (paramsOrWorld as {
        completedChapters?: readonly CampaignChapterId[];
        recoveredLogs?: readonly string[];
        discoveredCodexIds?: readonly CodexEntryId[];
        discoveredSecretIds?: readonly SecretAreaId[];
        activatedNodeIds?: readonly InteractableId[];
        unlockedRouteIds?: readonly string[];
        completedNarrativeEventIds?: readonly NarrativeEventId[];
        prologueBarrierOpen?: boolean;
      });

  const validCompletedChapters: CampaignChapterId[] = [];
  if (Array.isArray(params.completedChapters)) {
    for (let i = 0; i < params.completedChapters.length; i++) {
      const ch = params.completedChapters[i];
      if (
        isValidCampaignChapterId(ch) &&
        !validCompletedChapters.includes(ch)
      ) {
        validCompletedChapters.push(ch);
      }
    }
  }
  const completedChaptersCount = validCompletedChapters.length;

  const validRecoveredLogs: string[] = [];
  if (Array.isArray(params.recoveredLogs)) {
    for (let i = 0; i < params.recoveredLogs.length; i++) {
      const logId = params.recoveredLogs[i];
      if (isValidArchiveLogId(logId) && !validRecoveredLogs.includes(logId)) {
        validRecoveredLogs.push(logId);
      }
    }
  }
  const recoveredLogsCount = validRecoveredLogs.length;

  const discoveredCodexIds: CodexEntryId[] = [];
  if (Array.isArray(params.discoveredCodexIds)) {
    for (let i = 0; i < params.discoveredCodexIds.length; i++) {
      const id = params.discoveredCodexIds[i];
      if (isValidCodexEntryId(id) && !discoveredCodexIds.includes(id)) {
        discoveredCodexIds.push(id);
      }
    }
  }

  const discoveredSecretIds: SecretAreaId[] = [];
  if (Array.isArray(params.discoveredSecretIds)) {
    for (let i = 0; i < params.discoveredSecretIds.length; i++) {
      const id = params.discoveredSecretIds[i];
      if (isValidSecretAreaId(id) && !discoveredSecretIds.includes(id)) {
        discoveredSecretIds.push(id);
      }
    }
  }

  const activatedNodeIds: InteractableId[] = [];
  if (Array.isArray(params.activatedNodeIds)) {
    for (let i = 0; i < params.activatedNodeIds.length; i++) {
      const id = params.activatedNodeIds[i];
      if (isValidInteractableId(id) && !activatedNodeIds.includes(id)) {
        activatedNodeIds.push(id);
      }
    }
  }

  const unlockedRouteIds: string[] = [];
  if (Array.isArray(params.unlockedRouteIds)) {
    for (let i = 0; i < params.unlockedRouteIds.length; i++) {
      const id = params.unlockedRouteIds[i];
      if (
        typeof id === 'string' &&
        id.length > 0 &&
        !unlockedRouteIds.includes(id)
      ) {
        unlockedRouteIds.push(id);
      }
    }
  }

  const completedNarrativeEventIds: NarrativeEventId[] = [];
  if (Array.isArray(params.completedNarrativeEventIds)) {
    for (let i = 0; i < params.completedNarrativeEventIds.length; i++) {
      const id = params.completedNarrativeEventIds[i];
      if (
        isValidNarrativeEventId(id) &&
        !completedNarrativeEventIds.includes(id)
      ) {
        completedNarrativeEventIds.push(id);
      }
    }
  }

  const prologueBarrierOpen = Boolean(params.prologueBarrierOpen);

  // Count how many of the 7 authored traversal routes have been unlocked across the campaign
  let unlockedRoutesCount = 0;
  for (let i = 0; i < VALID_TRAVERSAL_ROUTE_IDS.length; i++) {
    const rDef = getTraversalRouteDefinition(VALID_TRAVERSAL_ROUTE_IDS[i]);
    if (rDef.requiresPrologueBarrierOpen) {
      if (prologueBarrierOpen || validCompletedChapters.includes('prologue')) {
        unlockedRoutesCount += 1;
      }
    } else if (
      rDef.controlInteractableId &&
      activatedNodeIds.includes(rDef.controlInteractableId)
    ) {
      unlockedRoutesCount += 1;
    } else if (rDef.obstacleId && unlockedRouteIds.includes(rDef.obstacleId)) {
      unlockedRoutesCount += 1;
    }
  }

  const allDefs = getAllNarrativeEventDefinitions();
  const echoMemoryDefs = allDefs.filter((d) => d.category === 'echo_memory');
  const discoveredEchoMemoriesCount = echoMemoryDefs.filter((d) =>
    completedNarrativeEventIds.includes(d.id)
  ).length;

  const lysaTruthUncovered =
    discoveredCodexIds.includes('CODEX-05') ||
    discoveredSecretIds.includes('secret_ch3_lysa_unedited_vault') ||
    completedNarrativeEventIds.includes('nev_ch3_lysa_audit_revelation');

  const discoveredCodexCount = discoveredCodexIds.length;
  const discoveredSecretsCount = discoveredSecretIds.length;

  let synthesisTier: CampaignSynthesisTier = 'fragmented';
  let synthesisHeadline = 'PARTIAL ARCHIVE TELEMETRY · CORE DIRECTIVES VERIFIED';
  let synthesisSummary =
    'Sera reached the Chronicle Loom Core with essential Override Seals intact, though portions of Nadir-9’s unindexed sector records remain sealed in the dark.';

  if (
    discoveredCodexCount >= 6 &&
    discoveredSecretsCount >= 3 &&
    lysaTruthUncovered
  ) {
    synthesisTier = 'complete_chronicle';
    const isFullExhaustiveRecovery =
      discoveredCodexCount >= VALID_CODEX_ENTRY_IDS.length &&
      discoveredSecretsCount >= VALID_SECRET_AREA_IDS.length;
    if (isFullExhaustiveRecovery) {
      synthesisHeadline =
        'COMPLETE CHRONICLE RECONSTRUCTION · ALL UNINDEXED TRUTHS RECOVERED';
      synthesisSummary =
        'Having uncovered Lysa’s unedited Loop 412 audit, all 4/4 hidden sanctuaries, and all 8/8 Codex records, Sera approaches the Loom knowing the complete truth of Sector 07’s rupture and WARDEN’s forced preservation mandate.';
    } else {
      synthesisHeadline =
        'COMPLETE CHRONICLE RECONSTRUCTION · CORE ARCHIVE & LYSA AUDIT VERIFIED';
      synthesisSummary = `Having uncovered Lysa’s unedited Loop 412 audit, ${discoveredSecretsCount}/${VALID_SECRET_AREA_IDS.length} hidden sanctuaries, and ${discoveredCodexCount}/${VALID_CODEX_ENTRY_IDS.length} Codex records, Sera approaches the Loom with verified proof of Sector 07’s rupture and WARDEN’s forced preservation mandate.`;
    }
  } else if (
    discoveredCodexCount >= 3 ||
    discoveredSecretsCount >= 1 ||
    discoveredEchoMemoriesCount >= 2 ||
    completedNarrativeEventIds.length >= 8 ||
    lysaTruthUncovered
  ) {
    synthesisTier = 'reconstructed';
    if (lysaTruthUncovered) {
      synthesisHeadline =
        'RECONSTRUCTED ARCHIVE · LYSA’S UNINDEXED EVIDENCE INTEGRATED';
      synthesisSummary =
        'Sera recovered Lysa’s unindexed Loop 412 evidence and supporting sector records along her ascent, exposing how WARDEN edited crew grief and quarantined Lysa’s neural trace inside the Loom.';
    } else {
      synthesisHeadline =
        'RECONSTRUCTED ARCHIVE · MULTI-SECTOR TELEMETRY INTEGRATED';
      synthesisSummary =
        'Sera recovered key sector records and Echo Memory traces along her ascent, revealing how WARDEN edited crew grief across Nadir-9 even as Vault 03’s deepest audit files remain sealed.';
    }
  }

  return {
    completedChaptersCount,
    totalChaptersCount: 6,
    recoveredLogsCount,
    totalLogsCount: 6,
    discoveredCodexCount,
    totalCodexCount: VALID_CODEX_ENTRY_IDS.length,
    discoveredSecretsCount,
    totalSecretsCount: VALID_SECRET_AREA_IDS.length,
    unlockedRoutesCount,
    totalRoutesCount: VALID_TRAVERSAL_ROUTE_IDS.length,
    completedNarrativeEventsCount: completedNarrativeEventIds.length,
    totalNarrativeEventsCount: VALID_NARRATIVE_EVENT_IDS.length,
    discoveredEchoMemoriesCount,
    totalEchoMemoriesCount: echoMemoryDefs.length,
    lysaTruthUncovered,
    synthesisTier,
    synthesisHeadline,
    synthesisSummary,
  };
}

export function getMissionIdForChapter(chapter: CampaignChapterId): MissionId {
  switch (chapter) {
    case 'chapter_1_helix':
      return 'mission_ch1_helix';
    case 'chapter_2_choir':
      return 'mission_ch2_choir';
    case 'chapter_3_curator':
      return 'mission_ch3_curator';
    case 'chapter_4_matron':
      return 'mission_ch4_matron';
    case 'chapter_5_loom':
      return 'mission_ch5_loom';
    case 'prologue':
    default:
      return 'mission_prologue_calibration';
  }
}

export function getMissionDefinitionForChapter(
  chapter: CampaignChapterId = 'prologue'
): MissionDefinition {
  const missionId = getMissionIdForChapter(chapter);
  return GAME_CONFIG.exploration.missions[missionId];
}

export function getMissionObjectiveDefinition(
  objectiveId: MissionObjectiveId
): MissionObjectiveDefinition;
export function getMissionObjectiveDefinition(
  objectiveId: unknown
): MissionObjectiveDefinition | null;
export function getMissionObjectiveDefinition(
  objectiveId: unknown
): MissionObjectiveDefinition | null {
  if (!isValidMissionObjectiveId(objectiveId)) return null;
  return GAME_CONFIG.exploration.objectives[objectiveId] ?? null;
}

export function getInteractableDefinition(
  interactableId: InteractableId
): EnvironmentalInteractableDefinition;
export function getInteractableDefinition(
  interactableId: unknown
): EnvironmentalInteractableDefinition | null;
export function getInteractableDefinition(
  interactableId: unknown
): EnvironmentalInteractableDefinition | null {
  if (!isValidInteractableId(interactableId)) return null;
  return GAME_CONFIG.exploration.interactables[interactableId] ?? null;
}

export function getAllInteractableDefinitionsForChapter(
  chapter: CampaignChapterId
): EnvironmentalInteractableDefinition[] {
  return VALID_INTERACTABLE_IDS.map((id) => getInteractableDefinition(id)).filter(
    (def) => def.chapter === chapter
  );
}

export function getCodexEntryDefinition(
  codexId: CodexEntryId
): CodexEntryDefinition;
export function getCodexEntryDefinition(
  codexId: unknown
): CodexEntryDefinition | null;
export function getCodexEntryDefinition(
  codexId: unknown
): CodexEntryDefinition | null {
  if (!isValidCodexEntryId(codexId)) return null;
  return GAME_CONFIG.exploration.codexEntries[codexId] ?? null;
}

export function getAllCodexEntryDefinitions(): CodexEntryDefinition[] {
  return VALID_CODEX_ENTRY_IDS.map((id) => getCodexEntryDefinition(id));
}

export function getHudCodexEntries(
  worldOrDiscoveredIds: WorldState | readonly CodexEntryId[]
): HudCodexEntryView[] {
  const discoveredIds: readonly CodexEntryId[] = Array.isArray(worldOrDiscoveredIds)
    ? worldOrDiscoveredIds
    : ((worldOrDiscoveredIds as WorldState)?.exploration?.discoveredCodexIds ?? []);
  return VALID_CODEX_ENTRY_IDS.map((id) => {
    const def = getCodexEntryDefinition(id);
    const missionDef = getMissionDefinitionForChapter(def.chapter);
    const discovered = discoveredIds.includes(id);
    return {
      id: def.id,
      chapter: def.chapter,
      category: def.category,
      categoryLabel: def.categoryLabel,
      locationTag: missionDef.sectorLabel,
      title: discovered ? def.title : `ENCRYPTED RECORD // ${def.id}`,
      subtitle: discovered
        ? `${def.author} · ${def.timestampCode}`
        : 'ENCRYPTED ARCHIVE RECORD · LOCATE SECTOR TERMINAL OR TEMPORAL CONDUIT TO DECRYPT',
      author: discovered ? def.author : 'UNKNOWN ARCHIVE SOURCE',
      timestampCode: def.timestampCode,
      discovered,
      summary: discovered
        ? def.summary
        : 'ENCRYPTED ARCHIVE RECORD · LOCATE SECTOR TERMINAL OR TEMPORAL CONDUIT TO DECRYPT',
      body: discovered
        ? [...def.body]
        : [
            '[RECORD LOCKED · RECOVER THIS DATA LOG IN THE DESIGNATED SECTOR TO DECRYPT CONTENTS]',
          ],
      tacticalNote: discovered ? def.tacticalNote : 'UNDISCOVERED RECORD',
    };
  });
}

export function buildMissionRuntimeState(
  chapter: CampaignChapterId,
  completedObjectiveIds: readonly MissionObjectiveId[],
  existingMission?: MissionRuntimeState | null
): MissionRuntimeState {
  const missionDef = getMissionDefinitionForChapter(chapter);
  let activeMainAssigned = false;
  let activeMainId: MissionObjectiveId | null = null;
  let activeMainTitle = 'ALL PRIMARY OBJECTIVES COMPLETE';
  let activeMainDesc = 'Sector primary directives fulfilled.';

  let completedMainCount = 0;
  let totalMainCount = 0;
  let completedOptionalCount = 0;
  let totalOptionalCount = 0;

  const objectives: MissionObjectiveState[] = [];
  for (let i = 0; i < missionDef.objectiveIds.length; i++) {
    const objId = missionDef.objectiveIds[i];
    const objDef = getMissionObjectiveDefinition(objId);
    const prevObj = existingMission?.objectives.find((o) => o.id === objId);
    const isCompleted = completedObjectiveIds.includes(objId);
    const prereqsMet = objDef.prerequisiteObjectiveIds.every((pre) =>
      completedObjectiveIds.includes(pre)
    );

    let status: ObjectiveStatus;
    if (isCompleted) {
      status = 'completed';
    } else if (!prereqsMet) {
      status = 'locked';
    } else if (objDef.category === 'main' && !activeMainAssigned) {
      status = 'active';
      activeMainAssigned = true;
      activeMainId = objDef.id;
      activeMainTitle = objDef.title;
      activeMainDesc = objDef.description;
    } else {
      status = 'available';
    }

    if (objDef.category === 'main') {
      totalMainCount += 1;
      if (isCompleted) completedMainCount += 1;
    } else {
      totalOptionalCount += 1;
      if (isCompleted) completedOptionalCount += 1;
    }

    objectives.push({
      id: objDef.id,
      category: objDef.category,
      title: objDef.title,
      description: objDef.description,
      status,
      prerequisiteObjectiveIds: [...objDef.prerequisiteObjectiveIds],
      completedAtTime: isCompleted ? (prevObj?.completedAtTime ?? 0) : null,
    });
  }

  const nextOptional = objectives.find(
    (o) => o.category === 'optional' && o.status !== 'completed'
  );
  const optionalObjectiveSummary = nextOptional
    ? `OPTIONAL [${completedOptionalCount}/${totalOptionalCount}] · ${nextOptional.title}`
    : totalOptionalCount > 0
      ? `OPTIONAL [${completedOptionalCount}/${totalOptionalCount}] · ALL SECTOR LOGS & NODES RECOVERED`
      : 'NO OPTIONAL OBJECTIVES';

  return {
    id: missionDef.id,
    missionId: missionDef.id,
    chapter: missionDef.chapter,
    code: missionDef.code,
    title: missionDef.title,
    sectorLabel: missionDef.sectorLabel,
    summary: missionDef.summary,
    completed: totalMainCount > 0 && completedMainCount >= totalMainCount,
    activeMainObjectiveId: activeMainId,
    activeMainObjectiveTitle: activeMainTitle,
    activeMainObjectiveDescription: activeMainDesc,
    optionalObjectiveSummary,
    completedMainCount,
    totalMainCount,
    completedOptionalCount,
    totalOptionalCount,
    objectives,
  };
}

export function buildInteractablesForChapter(
  chapter: CampaignChapterId,
  activatedNodeIds: readonly InteractableId[]
): EnvironmentalInteractableState[] {
  const defs = getAllInteractableDefinitionsForChapter(chapter);
  return defs.map((def) => {
    const isActivated = activatedNodeIds.includes(def.id);
    const prereqId = def.prerequisiteInteractableId ?? null;
    const isPrereqMet = !prereqId || activatedNodeIds.includes(prereqId);
    const status: InteractableStatus = isActivated
      ? 'activated'
      : isPrereqMet
        ? 'available'
        : 'locked';
    return {
      id: def.id,
      chapter: def.chapter,
      kind: def.kind,
      label: def.label,
      promptVerb: def.promptVerb,
      x: def.x,
      z: def.z,
      interactRadius: def.interactRadius,
      status,
      activationCount: isActivated ? 1 : 0,
      activatedAtTime: isActivated ? 0 : null,
      prerequisiteInteractableId: prereqId,
      unlocksObstacleId: def.unlocksObstacleId ?? null,
      grantsCodexId: def.grantsCodexId ?? null,
      completesObjectiveId: def.completesObjectiveId ?? null,
      requiresActiveEcho: Boolean(def.requiresActiveEcho),
      statusMessage: isActivated
        ? def.activationMessage
        : status === 'locked'
          ? (def.lockedReasonText ?? 'LOCKED · PREREQUISITE NODE REQUIRED')
          : `[I] ${def.promptVerb}`,
    };
  });
}

export function createEmptyInteractionPrompt(): InteractionTargetEvaluation {
  return {
    interactableId: null,
    label: '',
    kind: null,
    status: 'out_of_range',
    canInteract: false,
    distance: Infinity,
    promptText: '',
    detailText: '',
  };
}

export function getPrimaryRegionIdForChapter(
  chapter: CampaignChapterId
): SectorRegionId {
  switch (chapter) {
    case 'chapter_1_helix':
      return 'region_ch1_nexus_core';
    case 'chapter_2_choir':
      return 'region_ch2_garden_rotunda';
    case 'chapter_3_curator':
      return 'region_ch3_archive_nave';
    case 'chapter_4_matron':
      return 'region_ch4_surgical_theater';
    case 'chapter_5_loom':
      return 'region_ch5_loom_sanctuary';
    case 'prologue':
    default:
      return 'region_prologue_staging_deck';
  }
}

export function buildRoutesForChapter(
  chapter: CampaignChapterId,
  activatedNodeIds: readonly InteractableId[],
  unlockedRouteIds: readonly string[],
  prologueBarrierOpen = false
): TraversalRouteState[] {
  const defs = getAllTraversalRouteDefinitionsForChapter(chapter);
  return defs.map((def) => {
    let status: TraversalRouteStatus = 'locked';
    let unlocked = false;
    let statusMessage = 'ROUTE SEALED · LOCATE CONTROL CONDUIT OR POWER NODE';

    const unlockedByControlNode = Boolean(
      def.controlInteractableId &&
        activatedNodeIds.includes(def.controlInteractableId)
    );
    const otherChapterNodeForSameObstacleActivated = Boolean(
      def.obstacleId &&
        VALID_INTERACTABLE_IDS.some((id) => {
          const intDef = getInteractableDefinition(id);
          return (
            intDef.chapter !== def.chapter &&
            intDef.unlocksObstacleId === def.obstacleId &&
            activatedNodeIds.includes(id)
          );
        })
    );
    const unlockedByObstacleList = Boolean(
      def.obstacleId &&
        unlockedRouteIds.includes(def.obstacleId) &&
        !otherChapterNodeForSameObstacleActivated
    );

    if (def.requiresPrologueBarrierOpen) {
      if (prologueBarrierOpen) {
        status = 'open';
        unlocked = true;
        statusMessage = 'CONTAINMENT BARRIER OPEN · CENTRAL BAY ACCESSIBLE';
      } else {
        status = 'locked';
        unlocked = false;
        statusMessage = 'LOCKED · COMPLETE 3-STAGE CHRONO CALIBRATION';
      }
    } else if (unlockedByControlNode || unlockedByObstacleList) {
      status = 'open';
      unlocked = true;
      statusMessage = `${def.label} · UNSEALED & SIGHTLINE OPEN`;
    } else if (
      def.prerequisiteInteractableId &&
      activatedNodeIds.includes(def.prerequisiteInteractableId)
    ) {
      status = 'powered';
      unlocked = false;
      const ctrlDef = def.controlInteractableId
        ? getInteractableDefinition(def.controlInteractableId)
        : null;
      statusMessage = ctrlDef
        ? `POWER REROUTED · ACTIVATE ${ctrlDef.label} [I] TO UNSEAL`
        : 'POWER REROUTED · READY TO UNSEAL';
    } else {
      status = 'locked';
      unlocked = false;
      const prereqOrCtrlId =
        def.prerequisiteInteractableId ?? def.controlInteractableId;
      const prereqDef = prereqOrCtrlId
        ? getInteractableDefinition(prereqOrCtrlId)
        : null;
      statusMessage = prereqDef
        ? `SEALED · REQUIRES ${prereqDef.label}`
        : 'SEALED · PREREQUISITE NODE REQUIRED';
    }

    return {
      id: def.id,
      chapter: def.chapter,
      label: def.label,
      challengeKind: def.challengeKind,
      fromX: def.fromX,
      fromZ: def.fromZ,
      toX: def.toX,
      toZ: def.toZ,
      obstacleId: def.obstacleId,
      prerequisiteInteractableId: def.prerequisiteInteractableId ?? null,
      controlInteractableId: def.controlInteractableId ?? null,
      hazardId: def.hazardId ?? null,
      secretAreaId: def.secretAreaId ?? null,
      status,
      unlocked,
      statusMessage,
    };
  });
}

export function buildHazardsForChapter(
  chapter: CampaignChapterId,
  existingHazards?: readonly TimedEnergyHazardState[] | null
): TimedEnergyHazardState[] {
  const defs = getAllTimedEnergyHazardDefinitionsForChapter(chapter);
  return defs.map((def) => {
    const prev = existingHazards?.find((h) => h.id === def.id);
    if (prev) {
      return {
        ...prev,
        cycleIndex: prev.cycleIndex ?? 0,
        lastHitCycleIndex: prev.lastHitCycleIndex ?? -1,
      };
    }
    const cycleDuration =
      def.safeDuration + def.warningDuration + def.activeDuration;
    return {
      id: def.id,
      chapter: def.chapter,
      label: def.label,
      x: def.x,
      z: def.z,
      radius: def.radius,
      phase: 'safe' as TimedEnergyHazardPhase,
      phaseTimer: def.safeDuration,
      cycleDuration,
      cycleTime: 0,
      safeDuration: def.safeDuration,
      warningDuration: def.warningDuration,
      activeDuration: def.activeDuration,
      damage: def.damage,
      hitCooldownSeconds: def.hitCooldownSeconds,
      lastPlayerHitTime: -999,
      cycleIndex: 0,
      lastHitCycleIndex: -1,
      routeId: def.routeId,
      active: false,
      warning: false,
    };
  });
}

export function buildSecretsForChapter(
  chapter: CampaignChapterId,
  discoveredSecretIds: readonly SecretAreaId[],
  routes: readonly TraversalRouteState[],
  existingSecrets?: readonly SecretAreaState[] | null
): SecretAreaState[] {
  const defs = getAllSecretAreaDefinitionsForChapter(chapter);
  return defs.map((def) => {
    const discovered = discoveredSecretIds.includes(def.id);
    const routeOpen = routes.some(
      (r) => r.id === def.prerequisiteRouteId && r.unlocked
    );
    const prev = existingSecrets?.find((s) => s.id === def.id);
    return {
      id: def.id,
      chapter: def.chapter,
      title: def.title,
      subtitle: def.subtitle,
      x: def.x,
      z: def.z,
      radius: def.radius,
      prerequisiteRouteId: def.prerequisiteRouteId,
      prerequisiteInteractableId: def.prerequisiteInteractableId,
      linkedCodexId: def.linkedCodexId,
      fluxRestoreAmount: def.fluxRestoreAmount,
      integrityRestoreAmount: def.integrityRestoreAmount,
      rewardSummary: def.rewardSummary,
      discovered,
      accessible: discovered || routeOpen,
      discoveredAtTime: discovered ? (prev?.discoveredAtTime ?? 0) : null,
    };
  });
}

export function buildLocalMapSnapshot(
  chapter: CampaignChapterId,
  playerPos: { x: number; z: number; rotationY: number },
  mission: MissionRuntimeState,
  routes: readonly TraversalRouteState[],
  hazards: readonly TimedEnergyHazardState[],
  secrets: readonly SecretAreaState[],
  discoveredRegionIds: readonly SectorRegionId[],
  discoveredSecretIds: readonly SecretAreaId[],
  fluxPools: readonly ArenaFluxPool[] = [],
  waypoint: TacticalWaypointState | null = null,
  fragmentCaches: readonly ArenaFragmentCacheState[] = [],
  sectorBeacons: readonly SectorTacticalBeaconState[] = [],
  temporalRift: ArenaTemporalRift | null = null,
  discoveredHoloMemoryIds: readonly HoloMemoryId[] = [],
  includeHoloProjector = true
): LocalMapSnapshot {
  const regionDefs = getAllSectorRegionDefinitionsForChapter(chapter);
  const primaryRegionId = getPrimaryRegionIdForChapter(chapter);
  let currentRegionDef =
    regionDefs.find((r) => r.id === primaryRegionId) ?? regionDefs[0];
  let bestDist = Infinity;

  for (let i = 0; i < regionDefs.length; i++) {
    const reg = regionDefs[i];
    if (reg.secretAreaId && !discoveredSecretIds.includes(reg.secretAreaId)) {
      continue;
    }
    const d = Math.hypot(playerPos.x - reg.x, playerPos.z - reg.z);
    if (d <= reg.radius + 1.2 && d < bestDist) {
      bestDist = d;
      currentRegionDef = reg;
    }
  }

  const regions: LocalMapRegionCell[] = regionDefs.map((reg) => {
    const isSecret = Boolean(reg.secretAreaId);
    const isSecretDiscovered = reg.secretAreaId
      ? discoveredSecretIds.includes(reg.secretAreaId)
      : false;
    const discovered = isSecret
      ? isSecretDiscovered
      : discoveredRegionIds.includes(reg.id) ||
        reg.id === primaryRegionId ||
        reg.id === currentRegionDef?.id;
    const hiddenByFog = Boolean(isSecret && !isSecretDiscovered);
    return {
      id: reg.id,
      label: hiddenByFog ? 'UNINDEXED SECTOR ANOMALY [FOG]' : reg.label,
      kind: reg.kind,
      x: reg.x,
      z: reg.z,
      radius: reg.radius,
      discovered,
      hiddenByFog,
      secretAreaId: reg.secretAreaId ?? null,
    };
  });

  let objectiveTarget: { x: number; z: number; label: string } | null = null;
  if (chapter === 'prologue') {
    objectiveTarget = {
      x: -4.2,
      z: 0.4,
      label: mission.activeMainObjectiveTitle,
    };
  } else {
    objectiveTarget = {
      x: 0,
      z: -4.0,
      label: mission.activeMainObjectiveTitle,
    };
  }

  const discoveredSecretsInChapter = secrets.filter((s) => s.discovered).length;
  const totalSecretsInChapter = secrets.length;

  return {
    chapter,
    sectorCode: mission.code,
    sectorLabel: mission.sectorLabel,
    arenaRadius: GAME_CONFIG.arena.radius,
    currentRegionId: currentRegionDef?.id ?? primaryRegionId,
    currentRegionLabel: currentRegionDef?.label ?? mission.sectorLabel,
    playerX: Number(playerPos.x.toFixed(2)),
    playerZ: Number(playerPos.z.toFixed(2)),
    playerRotationY: Number(playerPos.rotationY.toFixed(2)),
    objectiveTarget,
    regions,
    routes: routes.map((r) => ({ ...r })),
    hazards: hazards.map((h) => ({ ...h })),
    secrets: secrets.map((s) => ({ ...s })),
    discoveredSecretsInChapter,
    totalSecretsInChapter,
    totalDiscoveredSecretsCampaign: discoveredSecretIds.length,
    totalSecretsCampaign: VALID_SECRET_AREA_IDS.length,
    waypoint: waypoint ? { ...waypoint } : null,
    fluxPools: fluxPools
      .filter((fp) => fp.remainingTime > 0)
      .map((fp) => ({
        id: fp.id,
        x: Number(fp.x.toFixed(2)),
        z: Number(fp.z.toFixed(2)),
        radius: fp.radius,
        remainingRatio: Math.max(0, Math.min(1, Number((fp.remainingTime / Math.max(0.1, fp.maxDuration)).toFixed(2)))),
      })),
    fragmentCaches: fragmentCaches.map((c) => ({ ...c })),
    sectorBeacons: sectorBeacons.map((b) => ({ ...b })),
    temporalRift: temporalRift ? { ...temporalRift } : null,
    holoProjector: includeHoloProjector
      ? (() => {
          const holoDef = getHoloMemoryForChapter(chapter);
          return {
            id: holoDef.id,
            label: holoDef.titleEn,
            x: holoDef.x,
            z: holoDef.z,
            discovered: discoveredHoloMemoryIds.includes(holoDef.id),
          };
        })()
      : null,
  };
}

export function createInitialExplorationState(
  chapter: CampaignChapterId = 'prologue',
  persisted?: Partial<PersistedExplorationState> | null
): WorldExplorationState {
  const discoveredCodexIds: CodexEntryId[] = [];
  if (persisted?.discoveredCodexIds) {
    for (let i = 0; i < persisted.discoveredCodexIds.length; i++) {
      const id = persisted.discoveredCodexIds[i];
      if (isValidCodexEntryId(id) && !discoveredCodexIds.includes(id)) {
        discoveredCodexIds.push(id);
      }
    }
  }
  const completedObjectiveIds: MissionObjectiveId[] = [];
  if (persisted?.completedObjectiveIds) {
    for (let i = 0; i < persisted.completedObjectiveIds.length; i++) {
      const id = persisted.completedObjectiveIds[i];
      if (isValidMissionObjectiveId(id) && !completedObjectiveIds.includes(id)) {
        completedObjectiveIds.push(id);
      }
    }
  }
  const activatedNodeIds: InteractableId[] = [];
  if (persisted?.activatedNodeIds) {
    for (let i = 0; i < persisted.activatedNodeIds.length; i++) {
      const id = persisted.activatedNodeIds[i];
      if (isValidInteractableId(id) && !activatedNodeIds.includes(id)) {
        activatedNodeIds.push(id);
      }
    }
  }
  const unlockedRouteIds: string[] = [];
  if (persisted?.unlockedRouteIds) {
    for (let i = 0; i < persisted.unlockedRouteIds.length; i++) {
      const id = persisted.unlockedRouteIds[i];
      if (isValidUnlockableRouteId(id) && !unlockedRouteIds.includes(id)) {
        unlockedRouteIds.push(id);
      }
    }
  }
  const discoveredRegionIds: SectorRegionId[] = [];
  if (persisted?.discoveredRegionIds) {
    for (let i = 0; i < persisted.discoveredRegionIds.length; i++) {
      const id = persisted.discoveredRegionIds[i];
      if (isValidSectorRegionId(id) && !discoveredRegionIds.includes(id)) {
        discoveredRegionIds.push(id);
      }
    }
  }

  const discoveredSecretIds: SecretAreaId[] = [];
  if (persisted?.discoveredSecretIds) {
    for (let i = 0; i < persisted.discoveredSecretIds.length; i++) {
      const id = persisted.discoveredSecretIds[i];
      if (isValidSecretAreaId(id) && !discoveredSecretIds.includes(id)) {
        discoveredSecretIds.push(id);
      }
    }
  }

  const completedNarrativeEventIds: NarrativeEventId[] = [];
  if (persisted?.completedNarrativeEventIds) {
    for (let i = 0; i < persisted.completedNarrativeEventIds.length; i++) {
      const id = persisted.completedNarrativeEventIds[i];
      if (
        isValidNarrativeEventId(id) &&
        !completedNarrativeEventIds.includes(id)
      ) {
        completedNarrativeEventIds.push(id);
      }
    }
  }

  const mission = buildMissionRuntimeState(chapter, completedObjectiveIds, null);
  const interactables = buildInteractablesForChapter(chapter, activatedNodeIds);
  const routes = buildRoutesForChapter(
    chapter,
    activatedNodeIds,
    unlockedRouteIds,
    false
  );
  const hazards = buildHazardsForChapter(chapter, null);
  const secrets = buildSecretsForChapter(
    chapter,
    discoveredSecretIds,
    routes,
    null
  );
  const narrativeEvents = buildNarrativeEventsForChapter(
    chapter,
    completedNarrativeEventIds,
    null
  );
  const chapterIdentity = getChapterWorldIdentity(chapter);
  const convergenceSummary = buildCampaignEndingDiscoverySummary({
    discoveredCodexIds,
    discoveredSecretIds,
    activatedNodeIds,
    unlockedRouteIds,
    completedNarrativeEventIds,
    prologueBarrierOpen: false,
  });
  const resolvedStoryChoices = normalizeResolvedStoryChoices(
    persisted?.resolvedStoryChoices
  );
  const discoveredHoloMemoryIds = sanitizeHoloMemoryIds(
    persisted?.discoveredHoloMemoryIds
  );
  const storyArcs = buildStoryArcStates(resolvedStoryChoices);
  const activeChapterStory =
    storyArcs.find((s) => s.chapter === chapter) ?? null;
  const stanceSummary = computeChronicleStanceSummary(resolvedStoryChoices);
  const initialCaches = buildFragmentCachesForChapter(chapter, []);
  const initialBeacons = buildSectorBeaconsForChapter(chapter);
  const localMap = buildLocalMapSnapshot(
    chapter,
    {
      x: GAME_CONFIG.player.spawnX,
      z: GAME_CONFIG.player.spawnZ,
      rotationY: Math.PI,
    },
    mission,
    routes,
    hazards,
    secrets,
    discoveredRegionIds,
    discoveredSecretIds,
    [],
    null,
    initialCaches,
    initialBeacons,
    null,
    discoveredHoloMemoryIds
  );

  return {
    mission,
    interactables,
    prompt: createEmptyInteractionPrompt(),
    discoveredCodexIds,
    completedObjectiveIds,
    activatedNodeIds,
    unlockedRouteIds,
    discoveredRegionIds,
    discoveredSecretIds,
    completedNarrativeEventIds,
    narrativeEvents,
    lastTriggeredNarrativeEventId: null,
    chapterIdentity,
    convergenceSummary,
    routes,
    hazards,
    secrets,
    localMap,
    lastDiscoveryBanner: null,
    codexEntries: getHudCodexEntries(discoveredCodexIds),
    newlyDiscoveredCodexId: null,
    statusBannerText:
      'SECTOR TELEMETRY ONLINE · EXPLORE TERMINALS [I], REROUTE POWER & SURVEY MAP [N]',
    tacticalWaypoint: null,
    resolvedStoryChoices,
    storyArcs,
    activeChapterStory,
    stanceSummary,
    discoveredHoloMemoryIds,
    activeHoloMemoryId: null,
    activeHoloMemoryTimer: 0,
  };
}

export function clonePersistedExplorationState(
  exp?: Partial<PersistedExplorationState> | null
): PersistedExplorationState {
  return {
    discoveredCodexIds: exp?.discoveredCodexIds
      ? exp.discoveredCodexIds.filter(isValidCodexEntryId)
      : [],
    completedObjectiveIds: exp?.completedObjectiveIds
      ? exp.completedObjectiveIds.filter(isValidMissionObjectiveId)
      : [],
    activatedNodeIds: exp?.activatedNodeIds
      ? exp.activatedNodeIds.filter(isValidInteractableId)
      : [],
    unlockedRouteIds: exp?.unlockedRouteIds
      ? exp.unlockedRouteIds.filter(isValidUnlockableRouteId)
      : [],
    discoveredRegionIds: exp?.discoveredRegionIds
      ? exp.discoveredRegionIds.filter(isValidSectorRegionId)
      : [],
    discoveredSecretIds: exp?.discoveredSecretIds
      ? exp.discoveredSecretIds.filter(isValidSecretAreaId)
      : [],
    completedNarrativeEventIds: exp?.completedNarrativeEventIds
      ? exp.completedNarrativeEventIds.filter(isValidNarrativeEventId)
      : [],
    resolvedStoryChoices: normalizeResolvedStoryChoices(exp?.resolvedStoryChoices),
    discoveredHoloMemoryIds: sanitizeHoloMemoryIds(exp?.discoveredHoloMemoryIds),
  };
}

const MAX_SAVE_ARRAY_SCAN = 256;
export const MAX_SAVE_JSON_BYTES = 262_144;
export const MAX_SAVE_JSON_CHARS = MAX_SAVE_JSON_BYTES;
const SAVE_UTF8_ENCODER = new TextEncoder();

export function sanitizePersistedExplorationState(
  raw: unknown
): PersistedExplorationState {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return clonePersistedExplorationState(null);
  }
  const obj = raw as Record<string, unknown>;
  const discoveredCodexIds: CodexEntryId[] = [];
  if (Array.isArray(obj.discoveredCodexIds)) {
    const len = Math.min(obj.discoveredCodexIds.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < len; i++) {
      const id = obj.discoveredCodexIds[i];
      if (isValidCodexEntryId(id) && !discoveredCodexIds.includes(id)) {
        discoveredCodexIds.push(id);
      }
    }
  }
  const completedObjectiveIds: MissionObjectiveId[] = [];
  if (Array.isArray(obj.completedObjectiveIds)) {
    const len = Math.min(obj.completedObjectiveIds.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < len; i++) {
      const id = obj.completedObjectiveIds[i];
      if (isValidMissionObjectiveId(id) && !completedObjectiveIds.includes(id)) {
        completedObjectiveIds.push(id);
      }
    }
  }
  const activatedNodeIds: InteractableId[] = [];
  if (Array.isArray(obj.activatedNodeIds)) {
    const len = Math.min(obj.activatedNodeIds.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < len; i++) {
      const id = obj.activatedNodeIds[i];
      if (isValidInteractableId(id) && !activatedNodeIds.includes(id)) {
        activatedNodeIds.push(id);
      }
    }
  }
  const unlockedRouteIds: string[] = [];
  if (Array.isArray(obj.unlockedRouteIds)) {
    const len = Math.min(obj.unlockedRouteIds.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < len; i++) {
      const id = obj.unlockedRouteIds[i];
      if (isValidUnlockableRouteId(id) && !unlockedRouteIds.includes(id)) {
        unlockedRouteIds.push(id);
      }
    }
  }
  const discoveredRegionIds: SectorRegionId[] = [];
  if (Array.isArray(obj.discoveredRegionIds)) {
    const len = Math.min(obj.discoveredRegionIds.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < len; i++) {
      const id = obj.discoveredRegionIds[i];
      if (isValidSectorRegionId(id) && !discoveredRegionIds.includes(id)) {
        discoveredRegionIds.push(id);
      }
    }
  }
  const discoveredSecretIds: SecretAreaId[] = [];
  if (Array.isArray(obj.discoveredSecretIds)) {
    const len = Math.min(obj.discoveredSecretIds.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < len; i++) {
      const id = obj.discoveredSecretIds[i];
      if (isValidSecretAreaId(id) && !discoveredSecretIds.includes(id)) {
        discoveredSecretIds.push(id);
      }
    }
  }
  const completedNarrativeEventIds: NarrativeEventId[] = [];
  if (Array.isArray(obj.completedNarrativeEventIds)) {
    const len = Math.min(obj.completedNarrativeEventIds.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < len; i++) {
      const id = obj.completedNarrativeEventIds[i];
      if (
        isValidNarrativeEventId(id) &&
        !completedNarrativeEventIds.includes(id)
      ) {
        completedNarrativeEventIds.push(id);
      }
    }
  }
  const resolvedStoryChoices = normalizeResolvedStoryChoices(
    obj.resolvedStoryChoices
  );
  const discoveredHoloMemoryIds = sanitizeHoloMemoryIds(
    obj.discoveredHoloMemoryIds
  );
  return {
    discoveredCodexIds,
    completedObjectiveIds,
    activatedNodeIds,
    unlockedRouteIds,
    discoveredRegionIds,
    discoveredSecretIds,
    completedNarrativeEventIds,
    resolvedStoryChoices,
    discoveredHoloMemoryIds,
  };
}

export function cloneWorldExplorationState(
  exp: WorldExplorationState | undefined | null,
  chapter: CampaignChapterId = 'prologue',
  runContext?: {
    completedChapters?: readonly CampaignChapterId[];
    recoveredLogs?: readonly string[];
    prologueBarrierOpen?: boolean;
  }
): WorldExplorationState {
  if (!exp) {
    return createInitialExplorationState(chapter, null);
  }
  const discoveredRegionIds = exp.discoveredRegionIds
    ? [...exp.discoveredRegionIds]
    : [];
  const discoveredSecretIds = exp.discoveredSecretIds
    ? [...exp.discoveredSecretIds]
    : [];
  const completedNarrativeEventIds = exp.completedNarrativeEventIds
    ? [...exp.completedNarrativeEventIds]
    : [];
  const mission = buildMissionRuntimeState(
    chapter,
    exp.completedObjectiveIds,
    exp.mission
  );
  const routes = exp.routes
    ? exp.routes.map((r) => ({ ...r }))
    : buildRoutesForChapter(
        chapter,
        exp.activatedNodeIds,
        exp.unlockedRouteIds,
        false
      );
  const hazards = exp.hazards
    ? exp.hazards.map((h) => ({ ...h }))
    : buildHazardsForChapter(chapter, null);
  const secrets = exp.secrets
    ? exp.secrets.map((s) => ({ ...s }))
    : buildSecretsForChapter(chapter, discoveredSecretIds, routes, null);
  const narrativeEvents = buildNarrativeEventsForChapter(
    chapter,
    completedNarrativeEventIds,
    exp.narrativeEvents
  );
  const chapterIdentity = getChapterWorldIdentity(chapter);
  const convergenceSummary = buildCampaignEndingDiscoverySummary({
    completedChapters: runContext?.completedChapters,
    recoveredLogs: runContext?.recoveredLogs,
    discoveredCodexIds: exp.discoveredCodexIds,
    discoveredSecretIds,
    activatedNodeIds: exp.activatedNodeIds,
    unlockedRouteIds: exp.unlockedRouteIds,
    completedNarrativeEventIds,
    prologueBarrierOpen: runContext?.prologueBarrierOpen,
  });
  const resolvedStoryChoices = normalizeResolvedStoryChoices(
    exp.resolvedStoryChoices
  );
  const discoveredHoloMemoryIds = sanitizeHoloMemoryIds(
    exp.discoveredHoloMemoryIds
  );
  const activeHoloMemoryTimer =
    typeof exp.activeHoloMemoryTimer === 'number' && Number.isFinite(exp.activeHoloMemoryTimer)
      ? Math.max(0, Number(exp.activeHoloMemoryTimer.toFixed(2)))
      : 0;
  const activeHoloMemoryId =
    activeHoloMemoryTimer > 0 && isValidHoloMemoryId(exp.activeHoloMemoryId)
      ? exp.activeHoloMemoryId
      : null;
  const storyArcs = buildStoryArcStates(resolvedStoryChoices);
  const activeChapterStory =
    storyArcs.find((s) => s.chapter === chapter) ?? null;
  const stanceSummary = computeChronicleStanceSummary(resolvedStoryChoices);
  const localMap = exp.localMap
    ? {
        ...exp.localMap,
        objectiveTarget: exp.localMap.objectiveTarget
          ? { ...exp.localMap.objectiveTarget }
          : null,
        regions: exp.localMap.regions.map((r) => ({ ...r })),
        routes: exp.localMap.routes.map((r) => ({ ...r })),
        hazards: exp.localMap.hazards.map((h) => ({ ...h })),
        secrets: exp.localMap.secrets.map((s) => ({ ...s })),
        waypoint: exp.localMap.waypoint ? { ...exp.localMap.waypoint } : null,
        fluxPools: exp.localMap.fluxPools ? exp.localMap.fluxPools.map((fp) => ({ ...fp })) : [],
        fragmentCaches: exp.localMap.fragmentCaches
          ? exp.localMap.fragmentCaches.map((c) => ({ ...c }))
          : [],
        sectorBeacons: exp.localMap.sectorBeacons
          ? exp.localMap.sectorBeacons.map((b) => ({ ...b }))
          : [],
        temporalRift: exp.localMap.temporalRift
          ? { ...exp.localMap.temporalRift }
          : null,
        holoProjector: exp.localMap.holoProjector
          ? {
              ...exp.localMap.holoProjector,
              discovered: discoveredHoloMemoryIds.includes(exp.localMap.holoProjector.id),
            }
          : null,
      }
    : buildLocalMapSnapshot(
        chapter,
        {
          x: GAME_CONFIG.player.spawnX,
          z: GAME_CONFIG.player.spawnZ,
          rotationY: Math.PI,
        },
        mission,
        routes,
        hazards,
        secrets,
        discoveredRegionIds,
        discoveredSecretIds,
        [],
        exp.tacticalWaypoint ?? null,
        buildFragmentCachesForChapter(chapter, []),
        buildSectorBeaconsForChapter(chapter),
        null,
        discoveredHoloMemoryIds
      );

  return {
    mission,
    interactables: buildInteractablesForChapter(chapter, exp.activatedNodeIds),
    prompt: { ...exp.prompt },
    discoveredCodexIds: [...exp.discoveredCodexIds],
    completedObjectiveIds: [...exp.completedObjectiveIds],
    activatedNodeIds: [...exp.activatedNodeIds],
    unlockedRouteIds: [...exp.unlockedRouteIds],
    discoveredRegionIds,
    discoveredSecretIds,
    completedNarrativeEventIds,
    narrativeEvents,
    lastTriggeredNarrativeEventId: exp.lastTriggeredNarrativeEventId ?? null,
    chapterIdentity,
    convergenceSummary,
    routes,
    hazards,
    secrets,
    localMap,
    lastDiscoveryBanner: exp.lastDiscoveryBanner
      ? { ...exp.lastDiscoveryBanner }
      : null,
    codexEntries: getHudCodexEntries(exp.discoveredCodexIds),
    newlyDiscoveredCodexId: exp.newlyDiscoveredCodexId,
    statusBannerText: exp.statusBannerText,
    tacticalWaypoint: exp.tacticalWaypoint ? { ...exp.tacticalWaypoint } : null,
    resolvedStoryChoices,
    storyArcs,
    activeChapterStory,
    stanceSummary,
    discoveredHoloMemoryIds,
    activeHoloMemoryId,
    activeHoloMemoryTimer,
  };
}

export function setTacticalWaypoint(
  world: WorldState,
  waypoint: TacticalWaypointState | null
): TacticalWaypointState | null {
  if (!world) return null;
  const chapter = world.run?.chapter ?? 'prologue';
  if (!world.exploration) {
    world.exploration = createInitialExplorationState(chapter, null);
  }
  const next = waypoint
    ? {
        id: waypoint.id,
        kind: waypoint.kind,
        label: waypoint.label,
        x: Number(waypoint.x.toFixed(2)),
        z: Number(waypoint.z.toFixed(2)),
      }
    : null;
  world.exploration.tacticalWaypoint = next;
  world.exploration.localMap = buildLocalMapSnapshot(
    chapter,
    {
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
      rotationY: world.player?.rotationY ?? Math.PI,
    },
    world.exploration.mission,
    world.exploration.routes,
    world.exploration.hazards,
    world.exploration.secrets,
    world.exploration.discoveredRegionIds,
    world.exploration.discoveredSecretIds,
    world.fluxPools ?? [],
    next,
    world.fragmentCaches ?? [],
    world.sectorBeacons ?? [],
    world.temporalRift ?? null,
    world.exploration.discoveredHoloMemoryIds ?? [],
    world.run?.mode !== 'boss_gauntlet'
  );
  if (next) {
    world.exploration.statusBannerText = `WAYPOINT SET · ${next.label.toUpperCase()}`;
  } else {
    world.exploration.statusBannerText = 'TACTICAL WAYPOINT CLEARED';
  }
  return next;
}

export function clearTacticalWaypoint(world: WorldState): void {
  setTacticalWaypoint(world, null);
}

export function syncUnlockedRoutesToObstacles(world: WorldState): void {
  if (!world.exploration || !world.obstacles) return;
  const chapter = world.run?.chapter ?? 'prologue';
  const prologueBarrierOpen = Boolean(
    world.puzzle?.finalBarrier?.open || world.puzzle?.completed
  );
  const currentRoutes = buildRoutesForChapter(
    chapter,
    world.exploration.activatedNodeIds,
    world.exploration.unlockedRouteIds,
    prologueBarrierOpen
  );
  const unlockedObstaclesInChapter = new Set<string>();
  for (let i = 0; i < currentRoutes.length; i++) {
    const r = currentRoutes[i];
    if (r.unlocked && r.obstacleId) {
      unlockedObstaclesInChapter.add(r.obstacleId);
    }
  }
  for (let i = 0; i < world.obstacles.length; i++) {
    const obs = world.obstacles[i];
    if (unlockedObstaclesInChapter.has(obs.id)) {
      obs.disabled = true;
    }
  }
}

export function discoverCodexEntry(
  world: WorldState,
  codexId: unknown
): boolean {
  if (!isValidCodexEntryId(codexId)) {
    return false;
  }
  if (!world.exploration) {
    world.exploration = createInitialExplorationState(
      world.run?.chapter ?? 'prologue',
      null
    );
  }
  if (world.exploration.discoveredCodexIds.includes(codexId)) {
    return false;
  }
  world.exploration.discoveredCodexIds.push(codexId);
  world.exploration.newlyDiscoveredCodexId = codexId;
  world.exploration.codexEntries = getHudCodexEntries(
    world.exploration.discoveredCodexIds
  );
  const def = getCodexEntryDefinition(codexId);
  world.exploration.statusBannerText = `CODEX ARCHIVED · ${def.id}: ${def.title.toUpperCase()}`;
  world.exploration.convergenceSummary =
    buildCampaignEndingDiscoverySummary(world);
  world.events.push({
    type: 'codex_entry_discovered',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    codexId,
  });
  return true;
}

export function completeMissionObjective(
  world: WorldState,
  objectiveId: unknown
): boolean {
  if (!isValidMissionObjectiveId(objectiveId)) {
    return false;
  }
  if (!world.exploration) {
    world.exploration = createInitialExplorationState(
      world.run?.chapter ?? 'prologue',
      null
    );
  }
  const exp = world.exploration;
  if (exp.completedObjectiveIds.includes(objectiveId)) {
    return false;
  }
  const def = getMissionObjectiveDefinition(objectiveId);
  for (let i = 0; i < def.prerequisiteObjectiveIds.length; i++) {
    const preId = def.prerequisiteObjectiveIds[i];
    if (!exp.completedObjectiveIds.includes(preId)) {
      return false;
    }
  }

  exp.completedObjectiveIds.push(objectiveId);
  if (def.rewardCodexId) {
    discoverCodexEntry(world, def.rewardCodexId);
  }

  const chapter = world.run?.chapter ?? 'prologue';
  exp.mission = buildMissionRuntimeState(
    chapter,
    exp.completedObjectiveIds,
    exp.mission
  );
  const completedObjState = exp.mission.objectives.find(
    (o) => o.id === objectiveId
  );
  if (completedObjState) {
    completedObjState.completedAtTime = world.elapsedTime;
  }
  exp.statusBannerText = `OBJECTIVE COMPLETE · ${def.title.toUpperCase()}`;
  world.events.push({
    type: 'mission_objective_completed',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    objectiveId,
  });
  return true;
}

export function canPlayerExecuteInteraction(world: WorldState): boolean {
  if (world.appState !== 'playing' || world.outcome !== 'none') return false;
  const st = world.player?.actionState;
  return st === 'idle' || st === 'moving';
}

export function evaluateInteractionTarget(
  world: WorldState,
  interactableId: unknown
): InteractionTargetEvaluation {
  if (!world.exploration) {
    world.exploration = createInitialExplorationState(
      world.run?.chapter ?? 'prologue',
      null
    );
  }
  if (!isValidInteractableId(interactableId)) {
    return {
      interactableId: null,
      label: 'UNKNOWN TARGET',
      kind: null,
      status: 'invalid_target',
      canInteract: false,
      distance: Infinity,
      promptText: 'INVALID INTERACTION TARGET',
      detailText: 'Target ID is not registered in this sector.',
    };
  }

  const state = world.exploration.interactables.find(
    (item) => item.id === interactableId
  );
  if (!state) {
    return {
      interactableId,
      label: 'UNAVAILABLE SECTOR NODE',
      kind: null,
      status: 'invalid_target',
      canInteract: false,
      distance: Infinity,
      promptText: 'TARGET NOT IN ACTIVE SECTOR',
      detailText: 'This environmental node belongs to another campaign sector.',
    };
  }

  const def = getInteractableDefinition(interactableId);
  const p = world.player;
  const dx = def.x - p.x;
  const dz = def.z - p.z;
  const dist = Math.hypot(dx, dz);

  if (state.status === 'activated') {
    return {
      interactableId: def.id,
      label: def.label,
      kind: def.kind,
      status: 'already_activated',
      canInteract: false,
      distance: dist,
      promptText: `${def.label} · ONLINE`,
      detailText: def.activationMessage,
    };
  }

  if (dist > def.interactRadius) {
    return {
      interactableId: def.id,
      label: def.label,
      kind: def.kind,
      status: 'out_of_range',
      canInteract: false,
      distance: dist,
      promptText: `APPROACH ${def.label} (${dist.toFixed(1)}m)`,
      detailText: `Move within ${def.interactRadius.toFixed(1)}m to interact [I].`,
    };
  }

  if (
    def.requiresLineOfSight &&
    !hasMeleeLineOfSight(p.x, p.z, def.x, def.z, world.obstacles)
  ) {
    return {
      interactableId: def.id,
      label: def.label,
      kind: def.kind,
      status: 'blocked_by_obstacle',
      canInteract: false,
      distance: dist,
      promptText: `${def.label} · BLOCKED BY OBSTACLE`,
      detailText: 'Clear the intervening containment pylon or barrier to access.',
    };
  }

  if (def.requiresFacing && dist > 0.35) {
    const toTargetX = dx / dist;
    const toTargetZ = dz / dist;
    const facingX = Math.sin(p.rotationY);
    const facingZ = Math.cos(p.rotationY);
    const dot = toTargetX * facingX + toTargetZ * facingZ;
    if (dot < def.facingCosineThreshold) {
      return {
        interactableId: def.id,
        label: def.label,
        kind: def.kind,
        status: 'not_facing',
        canInteract: false,
        distance: dist,
        promptText: `FACE ${def.label} TO INTERACT [I]`,
        detailText: 'Turn Sera toward the terminal or node to align the Chrono-Rig link.',
      };
    }
  }

  if (
    def.prerequisiteInteractableId &&
    !world.exploration.activatedNodeIds.includes(def.prerequisiteInteractableId)
  ) {
    const prereqDef = getInteractableDefinition(def.prerequisiteInteractableId);
    return {
      interactableId: def.id,
      label: def.label,
      kind: def.kind,
      status: 'prerequisite_locked',
      canInteract: false,
      distance: dist,
      promptText: `${def.label} · LOCKED`,
      detailText:
        def.lockedReasonText ?? `Requires ${prereqDef.label} to be energized first.`,
    };
  }

  if (
    def.requiresActiveEcho &&
    (world.echo.state !== 'playback' || !world.echo.activeActor)
  ) {
    return {
      interactableId: def.id,
      label: def.label,
      kind: def.kind,
      status: 'requires_echo',
      canInteract: false,
      distance: dist,
      promptText: `${def.label} · REQUIRES ACTIVE ECHO [Y]`,
      detailText:
        def.lockedReasonText ??
        'Replay an Echo [Y] or strike this conduit with an Echo/Pulsecaster to attune.',
    };
  }

  if (!canPlayerExecuteInteraction(world)) {
    return {
      interactableId: def.id,
      label: def.label,
      kind: def.kind,
      status: 'action_locked',
      canInteract: false,
      distance: dist,
      promptText: `[I] ${def.promptVerb} (WAIT FOR RECOVERY)`,
      detailText: 'Cannot interact during a committed attack, dodge, or parry.',
    };
  }

  return {
    interactableId: def.id,
    label: def.label,
    kind: def.kind,
    status: 'ready',
    canInteract: true,
    distance: dist,
    promptText: `[I] ${def.promptVerb} · ${def.label}`,
    detailText: def.grantsCodexId
      ? `Recovers ${def.grantsCodexId}${def.fluxRestoreAmount ? ` & +${def.fluxRestoreAmount} FLUX` : ''}`
      : def.unlocksObstacleId
        ? 'Retracts arena containment pylon & opens flanking sightline'
        : `Restores +${def.fluxRestoreAmount ?? 20} Chrono Flux`,
  };
}

export function evaluateNearestInteractablePrompt(
  world: WorldState
): InteractionTargetEvaluation {
  if (!world.exploration || world.exploration.interactables.length === 0) {
    return createEmptyInteractionPrompt();
  }
  let bestEval: InteractionTargetEvaluation | null = null;
  let bestPriority = Infinity;
  let bestDist = Infinity;

  for (let i = 0; i < world.exploration.interactables.length; i++) {
    const item = world.exploration.interactables[i];
    const evalResult = evaluateInteractionTarget(world, item.id);
    const maxDisplayRange = item.interactRadius + 1.6;
    if (evalResult.distance > maxDisplayRange) continue;

    // Priority: 0 = ready, 1 = actionable feedback (locked, requires_echo, not_facing, blocked, action_locked), 2 = already_activated
    const priority = evalResult.canInteract
      ? 0
      : evalResult.status === 'already_activated'
        ? 2
        : 1;
    if (
      priority < bestPriority ||
      (priority === bestPriority && evalResult.distance < bestDist)
    ) {
      bestPriority = priority;
      bestDist = evalResult.distance;
      bestEval = evalResult;
    }
  }

  return bestEval ?? createEmptyInteractionPrompt();
}

function executeInteractableActivation(
  world: WorldState,
  def: EnvironmentalInteractableDefinition,
  state: EnvironmentalInteractableState
): void {
  state.status = 'activated';
  state.activationCount += 1;
  state.activatedAtTime = world.elapsedTime;
  state.statusMessage = def.activationMessage;

  if (!world.exploration.activatedNodeIds.includes(def.id)) {
    world.exploration.activatedNodeIds.push(def.id);
  }

  if (def.unlocksInteractableId) {
    const unlockedTarget = world.exploration.interactables.find(
      (item) => item.id === def.unlocksInteractableId
    );
    if (unlockedTarget && unlockedTarget.status === 'locked') {
      unlockedTarget.status = 'available';
      unlockedTarget.statusMessage = `[I] ${unlockedTarget.promptVerb}`;
    }
  }

  if (def.unlocksObstacleId) {
    if (!world.exploration.unlockedRouteIds.includes(def.unlocksObstacleId)) {
      world.exploration.unlockedRouteIds.push(def.unlocksObstacleId);
    }
    syncUnlockedRoutesToObstacles(world);
    const unlockedRouteDef = VALID_TRAVERSAL_ROUTE_IDS.map((id) =>
      getTraversalRouteDefinition(id)
    ).find(
      (r) =>
        r.chapter === def.chapter &&
        (r.obstacleId === def.unlocksObstacleId ||
          r.controlInteractableId === def.id)
    );
    if (unlockedRouteDef) {
      world.events.push({
        type: 'traversal_route_unlocked',
        x: def.x,
        z: def.z,
        interactableId: def.id,
        routeId: unlockedRouteDef.id,
      });
    }
  }

  const protocolMods = getPlayerProtocolModifiers(world);
  if (def.fluxRestoreAmount && def.fluxRestoreAmount > 0) {
    const scaledFlux = Math.round(
      def.fluxRestoreAmount * protocolMods.salvageYieldMultiplier
    );
    world.player.flux = Math.min(
      world.player.maxFlux,
      world.player.flux + scaledFlux
    );
  }

  if (def.integrityRestoreAmount && def.integrityRestoreAmount > 0) {
    const scaledIntegrity = Math.round(
      def.integrityRestoreAmount * protocolMods.salvageYieldMultiplier
    );
    world.player.integrity = Math.min(
      world.player.maxIntegrity,
      world.player.integrity + scaledIntegrity
    );
    world.player.ghostIntegrity = Math.max(
      world.player.ghostIntegrity,
      world.player.integrity
    );
  }

  if (def.grantsCodexId) {
    discoverCodexEntry(world, def.grantsCodexId);
  }

  if (def.completesObjectiveId) {
    completeMissionObjective(world, def.completesObjectiveId);
  }

  if (def.id === 'int_ch4_quarantine_override_node') {
    grantProgressionReward(world, 'conduit_ch4_quarantine_override_frag');
  } else if (def.id === 'int_ch5_temporal_anchor_conduit') {
    grantProgressionReward(world, 'conduit_ch5_temporal_anchor_frag');
  }

  world.exploration.statusBannerText = def.activationMessage;
  world.run.checkpointNotice = def.activationMessage;
  world.run.checkpointNoticeTimer = 4.2;

  world.events.push({
    type: 'environmental_interaction_completed',
    x: def.x,
    z: def.z,
    interactableId: def.id,
    codexId: def.grantsCodexId,
    objectiveId: def.completesObjectiveId,
  });

  const chapter = world.run?.chapter ?? 'prologue';
  const prologueBarrierOpen = Boolean(
    world.puzzle?.finalBarrier?.open || world.puzzle?.completed
  );
  world.exploration.routes = buildRoutesForChapter(
    chapter,
    world.exploration.activatedNodeIds,
    world.exploration.unlockedRouteIds,
    prologueBarrierOpen
  );
  world.exploration.secrets = buildSecretsForChapter(
    chapter,
    world.exploration.discoveredSecretIds,
    world.exploration.routes,
    world.exploration.secrets
  );
  world.exploration.localMap = buildLocalMapSnapshot(
    chapter,
    {
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
      rotationY: world.player?.rotationY ?? Math.PI,
    },
    world.exploration.mission,
    world.exploration.routes,
    world.exploration.hazards,
    world.exploration.secrets,
    world.exploration.discoveredRegionIds,
    world.exploration.discoveredSecretIds,
    world.fluxPools ?? [],
    world.exploration.tacticalWaypoint ?? null,
    world.fragmentCaches ?? [],
    world.sectorBeacons ?? [],
    world.temporalRift ?? null,
    world.exploration.discoveredHoloMemoryIds ?? [],
    world.run?.mode !== 'boss_gauntlet'
  );

  const chapterEventDefs = getAllNarrativeEventDefinitionsForChapter(chapter);
  for (let i = 0; i < chapterEventDefs.length; i++) {
    const evDef = chapterEventDefs[i];
    if (!world.exploration.completedNarrativeEventIds.includes(evDef.id)) {
      if (canTriggerNarrativeEventNow(world, evDef)) {
        triggerNarrativeEvent(world, evDef.id);
      }
    }
  }
  world.exploration.narrativeEvents = buildNarrativeEventsForChapter(
    chapter,
    world.exploration.completedNarrativeEventIds,
    world.exploration.narrativeEvents
  );
  world.exploration.convergenceSummary = buildCampaignEndingDiscoverySummary({
    completedChapters: world.run?.completedChapters,
    recoveredLogs: world.run?.recoveredLogs,
    discoveredCodexIds: world.exploration.discoveredCodexIds,
    discoveredSecretIds: world.exploration.discoveredSecretIds,
    activatedNodeIds: world.exploration.activatedNodeIds,
    unlockedRouteIds: world.exploration.unlockedRouteIds,
    completedNarrativeEventIds: world.exploration.completedNarrativeEventIds,
    prologueBarrierOpen,
  });

  world.exploration.prompt = evaluateNearestInteractablePrompt(world);
}

export function attemptEnvironmentalInteraction(
  world: WorldState,
  explicitInteractableId?: unknown
): InteractionTargetEvaluation & {
  success: boolean;
} {
  if (!world.exploration) {
    world.exploration = createInitialExplorationState(
      world.run?.chapter ?? 'prologue',
      null
    );
  }

  let targetEval: InteractionTargetEvaluation;
  if (explicitInteractableId !== undefined) {
    targetEval = evaluateInteractionTarget(world, explicitInteractableId);
  } else {
    // Pick nearest non-activated interactable first, or fallback to nearest overall
    let bestCandidate: InteractionTargetEvaluation | null = null;
    for (let i = 0; i < world.exploration.interactables.length; i++) {
      const item = world.exploration.interactables[i];
      const ev = evaluateInteractionTarget(world, item.id);
      if (
        !bestCandidate ||
        (ev.canInteract && !bestCandidate.canInteract) ||
        (ev.canInteract === bestCandidate.canInteract &&
          ev.status !== 'already_activated' &&
          bestCandidate.status === 'already_activated') ||
        (ev.canInteract === bestCandidate.canInteract &&
          (ev.status === 'already_activated') ===
            (bestCandidate.status === 'already_activated') &&
          ev.distance < bestCandidate.distance)
      ) {
        bestCandidate = ev;
      }
    }
    targetEval = bestCandidate ?? createEmptyInteractionPrompt();
  }

  if (!targetEval.canInteract || !targetEval.interactableId) {
    // Fallback: allow [I] interaction with nearest unclaimed Fragment Cache or ready Sector Tactical Beacon
    if (world.player && world.player.actionState !== 'dead' && canPlayerExecuteInteraction(world)) {
      const px = world.player.x;
      const pz = world.player.z;
      const caches = world.fragmentCaches ?? [];
      for (let i = 0; i < caches.length; i++) {
        const cache = caches[i];
        if (!cache.claimed && Math.hypot(px - cache.x, pz - cache.z) <= cache.radius + 0.9) {
          if (claimFragmentCache(world, cache.id)) {
            return {
              ...targetEval,
              status: 'ready',
              canInteract: true,
              label: cache.label,
              promptText: `CACHE RECOVERED · ${cache.label}`,
              success: true,
            };
          }
        }
      }
      const beacons = world.sectorBeacons ?? [];
      for (let i = 0; i < beacons.length; i++) {
        const beacon = beacons[i];
        if (beacon.cooldown <= 0 && Math.hypot(px - beacon.x, pz - beacon.z) <= beacon.radius + 0.9) {
          if (activateSectorBeacon(world, beacon.id)) {
            return {
              ...targetEval,
              status: 'ready',
              canInteract: true,
              label: beacon.label,
              promptText: `BEACON TRIGGERED · ${beacon.label}`,
              success: true,
            };
          }
        }
      }
      const rift = world.temporalRift ?? null;
      if (rift && Math.hypot(px - rift.x, pz - rift.z) <= rift.radius + 1.25) {
        if (sealTemporalRift(world)) {
          return {
            ...targetEval,
            status: 'ready',
            canInteract: true,
            label: rift.label,
            promptText: `ANOMALY SEALED · +28 FLUX · +12 INTEGRITY`,
            success: true,
          };
        }
      }
      if (world.run?.mode !== 'boss_gauntlet') {
        const holoDef = getHoloMemoryForChapter(world.run?.chapter ?? 'prologue');
        if (Math.hypot(px - holoDef.x, pz - holoDef.z) <= holoDef.interactRadius) {
          if (projectChapterHoloMemory(world)) {
            return {
              ...targetEval,
              status: 'ready',
              canInteract: true,
              label: holoDef.titleEn,
              promptText: `HOLO-MEMORY PROJECTED · ${holoDef.titleEn}`,
              success: true,
            };
          }
        }
      }
      if (
        world.expedition?.enabled &&
        world.expedition.phase === 'safe_room' &&
        world.expedition.safeRoom?.active
      ) {
        const sr = world.expedition.safeRoom;
        const nearStation = detectNearbySafeRoomStation(px, pz, sr);
        if (nearStation === 'med_bay' && !sr.medBayUsed && useSafeRoomMedBay(world)) {
          return {
            ...targetEval,
            status: 'ready',
            canInteract: true,
            label: 'MED-SUPPLY BAY',
            promptText: 'MED-SUPPLY BAY · INTEGRITY 100% · FLUX 100 · +35% OVERDRIVE',
            success: true,
          };
        }
        if (
          nearStation === 'lysa_holo' &&
          !sr.lysaBriefingClaimed &&
          claimSafeRoomLysaBriefing(world)
        ) {
          return {
            ...targetEval,
            status: 'ready',
            canInteract: true,
            label: 'LYSA VENN HOLOGRAM',
            promptText: sr.lysaIntelHeadline,
            success: true,
          };
        }
      }
      if (
        world.expedition?.secretVault &&
        world.expedition.secretVault.gateOpen &&
        !world.expedition.secretVault.looted
      ) {
        const vault = world.expedition.secretVault;
        if (Math.hypot(px - vault.vaultPos.x, pz - vault.vaultPos.z) <= vault.vaultPos.radius + 1.0) {
          if (claimSecretEchoVault(world)) {
            return {
              ...targetEval,
              status: 'ready',
              canInteract: true,
              label: vault.label,
              promptText: `SECRET VAULT CLAIMED · ${vault.label.toUpperCase()}`,
              success: true,
            };
          }
        }
      }
      if (isPlayerInsideBreachSeal(px, pz, world.expedition)) {
        if (triggerExpeditionBreach(world)) {
          return {
            ...targetEval,
            status: 'ready',
            canInteract: true,
            label: 'BREACH SEAL',
            promptText: `SEAL BREACHED · ENGAGE ${world.expedition?.wardenLabel?.toUpperCase() ?? 'SECTOR HOSTILES'}`,
            success: true,
          };
        }
      }
      if (isPlayerInsideTransitAirlock(px, pz, world.expedition)) {
        if (enterExpeditionTransitAirlock(world)) {
          return {
            ...targetEval,
            status: 'ready',
            canInteract: true,
            label: 'NORTH SECTOR AIRLOCK',
            promptText: `TRANSIT INITIATED · ${world.expedition?.sectorTitle?.toUpperCase() ?? 'NEXT SECTOR'}`,
            success: true,
          };
        }
      }
    }

    world.exploration.prompt = targetEval;
    if (targetEval.detailText) {
      world.exploration.statusBannerText = targetEval.detailText;
    }
    world.events.push({
      type: 'environmental_interaction_rejected',
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
      interactableId: targetEval.interactableId ?? undefined,
    });
    return {
      ...targetEval,
      success: false,
    };
  }

  const def = getInteractableDefinition(targetEval.interactableId);
  const state = world.exploration.interactables.find(
    (item) => item.id === targetEval.interactableId
  );
  if (!state) {
    return {
      ...targetEval,
      status: 'invalid_target',
      canInteract: false,
      success: false,
    };
  }

  executeInteractableActivation(world, def, state);
  return {
    ...targetEval,
    status: 'ready',
    canInteract: true,
    interactableId: def.id,
    success: true,
  };
}

export function syncChapterExpansionEntities(
  world: WorldState,
  chapter: CampaignChapterId = world.run?.chapter ?? 'prologue'
): void {
  if (!world) return;
  const claimedIds = world.progression?.claimedRewardIds ?? [];
  const caches = world.fragmentCaches ?? [];
  if (caches.length === 0 || caches[0].chapter !== chapter) {
    world.fragmentCaches = buildFragmentCachesForChapter(chapter, claimedIds);
  } else {
    for (let i = 0; i < caches.length; i++) {
      if (claimedIds.includes(caches[i].rewardId)) {
        caches[i].claimed = true;
      }
    }
  }
  const beacons = world.sectorBeacons ?? [];
  if (beacons.length === 0 || beacons[0].chapter !== chapter) {
    world.sectorBeacons = buildSectorBeaconsForChapter(chapter);
  }
}

export function claimFragmentCache(
  world: WorldState,
  cacheId: FragmentCacheId | string
): boolean {
  if (!world || world.outcome === 'defeat' || world.player?.actionState === 'dead') {
    return false;
  }
  syncChapterExpansionEntities(world, world.run?.chapter ?? 'prologue');
  const caches = world.fragmentCaches ?? [];
  const cache = caches.find((c) => c.id === cacheId);
  if (!cache || cache.claimed) {
    return false;
  }

  cache.claimed = true;
  grantProgressionReward(world, cache.rewardId);

  const protocolMods = getPlayerProtocolModifiers(world);
  const p = world.player;
  if (p) {
    const healAmt = Math.round(14 * protocolMods.salvageYieldMultiplier);
    const fluxAmt = Math.round(18 * protocolMods.salvageYieldMultiplier);
    p.integrity = Math.min(p.maxIntegrity, p.integrity + healAmt);
    p.ghostIntegrity = Math.max(p.ghostIntegrity, p.integrity);
    p.flux = Math.min(p.maxFlux, p.flux + fluxAmt);
    p.surgeTimer = Math.max(
      p.surgeTimer ?? 0,
      1.5 * protocolMods.surgeDurationMultiplier
    );
  }

  const notice = `${cache.label} · ${cache.crewAuthor} — ${cache.memoryExcerpt}`;
  if (world.exploration) {
    world.exploration.statusBannerText = `${cache.label} RECOVERED · +1 MEMORY FRAGMENT`;
    world.exploration.localMap = buildLocalMapSnapshot(
      world.run?.chapter ?? 'prologue',
      {
        x: p?.x ?? 0,
        z: p?.z ?? 0,
        rotationY: p?.rotationY ?? Math.PI,
      },
      world.exploration.mission,
      world.exploration.routes,
      world.exploration.hazards,
      world.exploration.secrets,
      world.exploration.discoveredRegionIds,
      world.exploration.discoveredSecretIds,
      world.fluxPools ?? [],
      world.exploration.tacticalWaypoint ?? null,
      world.fragmentCaches ?? [],
      world.sectorBeacons ?? [],
      world.temporalRift ?? null,
      world.exploration.discoveredHoloMemoryIds ?? [],
      world.run?.mode !== 'boss_gauntlet'
    );
  }
  world.run.checkpointNotice = notice;
  world.run.checkpointNoticeTimer = Math.max(world.run.checkpointNoticeTimer, 5.2);
  world.events.push({
    type: 'fragment_cache_claimed',
    x: cache.x,
    z: cache.z,
    rewardId: cache.rewardId,
    amount: 1,
  });
  return true;
}

export function activateSectorBeacon(
  world: WorldState,
  beaconId: SectorBeaconId | string
): boolean {
  if (!world || world.outcome !== 'none' || !world.player || world.player.actionState === 'dead') {
    return false;
  }
  syncChapterExpansionEntities(world, world.run?.chapter ?? 'prologue');
  const beacons = world.sectorBeacons ?? [];
  const beacon = beacons.find((b) => b.id === beaconId);
  if (!beacon || beacon.cooldown > 0) {
    return false;
  }

  const p = world.player;
  const protocolMods = getPlayerProtocolModifiers(world);
  beacon.cooldown = beacon.maxCooldown;
  beacon.activationCount += 1;

  let effectCount = 0;
  switch (beacon.id) {
    case 'beacon_prologue_cryo_vent': {
      p.weaponHeat = 0;
      p.weaponOverheated = false;
      p.weaponOverheatTimer = 0;
      for (let i = 0; i < world.enemies.length; i++) {
        const e = world.enemies[i];
        if (e.hp <= 0 || e.aiState === 'ko') continue;
        if (Math.hypot(e.x - beacon.x, e.z - beacon.z) <= 7.5 + e.radius) {
          e.stagger = Math.min(e.maxStagger, e.stagger + 26);
          e.hitFlashTimer = Math.max(e.hitFlashTimer, 0.18);
          effectCount += 1;
        }
      }
      break;
    }
    case 'beacon_ch1_emp_pylon': {
      for (let i = 0; i < world.enemies.length; i++) {
        const e = world.enemies[i];
        if (e.hp <= 0 || e.aiState === 'ko') continue;
        if (Math.hypot(e.x - beacon.x, e.z - beacon.z) <= 9.0 + e.radius) {
          e.stagger = Math.min(e.maxStagger, e.stagger + 35);
          e.hitFlashTimer = Math.max(e.hitFlashTimer, 0.22);
          if (world.boss && world.boss.id === e.id) {
            world.boss.stagger = e.stagger;
            world.boss.coreExposed = true;
          }
          effectCount += 1;
        }
      }
      break;
    }
    case 'beacon_ch2_harmonic_bell': {
      p.flux = Math.min(p.maxFlux, p.flux + 20);
      if (world.resonance.activeMark) {
        world.resonance.activeMark.expiresAt += 2.0;
        world.resonance.activeMark.duration += 2.0;
        world.resonance.activeMark.remainingTime += 2.0;
      }
      if (world.choir?.active) {
        for (let i = 0; i < world.choir.nodes.length; i++) {
          const n = world.choir.nodes[i];
          if (n.status === 'primed') {
            n.primedRemainingTime += 2.0;
          }
        }
        world.choir.syncTimer += 2.0;
      }
      break;
    }
    case 'beacon_ch3_purge_scanner': {
      p.flux = Math.min(p.maxFlux, p.flux + 25);
      for (let i = 0; i < world.enemies.length; i++) {
        const e = world.enemies[i];
        if (e.hp <= 0 || e.aiState === 'ko') continue;
        if (e.isDecoy || e.archetype === 'curator_decoy') {
          e.hp = Math.max(0, e.hp - 45);
          e.hitFlashTimer = 0.22;
          effectCount += 1;
          if (e.hp <= 0) {
            handleEnemyZeroHpDefeat(world, e, 45, true, false, false);
          }
        }
      }
      break;
    }
    case 'beacon_ch4_med_cradle': {
      p.integrity = Math.min(p.maxIntegrity, p.integrity + 22);
      p.ghostIntegrity = Math.max(p.ghostIntegrity, p.integrity);
      p.fluxDampenedTimer = 0;
      if (world.matron?.active) {
        world.matron.echoSuppressedTimer = 0;
      }
      break;
    }
    case 'beacon_ch5_loom_capacitor': {
      p.flux = Math.min(p.maxFlux, p.flux + 35);
      p.surgeTimer = Math.max(
        p.surgeTimer ?? 0,
        2.5 * protocolMods.surgeDurationMultiplier
      );
      if (world.boss && world.boss.hp > 0) {
        const b = world.boss;
        b.stagger = Math.min(b.maxStagger, b.stagger + 40);
        b.hitFlashTimer = Math.max(b.hitFlashTimer, 0.22);
        const bossEn = world.enemies.find((e) => e.id === b.id);
        if (bossEn) {
          bossEn.stagger = b.stagger;
          bossEn.hitFlashTimer = b.hitFlashTimer;
        }
        effectCount += 1;
      }
      break;
    }
  }

  if (world.exploration) {
    world.exploration.statusBannerText = `${beacon.label} ACTIVATED · ${beacon.effectLabel}`;
    world.exploration.localMap = buildLocalMapSnapshot(
      world.run?.chapter ?? 'prologue',
      {
        x: p.x ?? 0,
        z: p.z ?? 0,
        rotationY: p.rotationY ?? Math.PI,
      },
      world.exploration.mission,
      world.exploration.routes,
      world.exploration.hazards,
      world.exploration.secrets,
      world.exploration.discoveredRegionIds,
      world.exploration.discoveredSecretIds,
      world.fluxPools ?? [],
      world.exploration.tacticalWaypoint ?? null,
      world.fragmentCaches ?? [],
      world.sectorBeacons ?? [],
      world.temporalRift ?? null,
      world.exploration.discoveredHoloMemoryIds ?? [],
      world.run?.mode !== 'boss_gauntlet'
    );
  }
  world.run.checkpointNotice = `${beacon.label} // ${beacon.effectLabel}`;
  world.run.checkpointNoticeTimer = Math.max(world.run.checkpointNoticeTimer, 3.8);
  world.events.push({
    type: 'sector_beacon_activated',
    x: beacon.x,
    z: beacon.z,
    amount: effectCount,
  });
  return true;
}

export function resolveStoryArcChoice(
  world: WorldState,
  arcId: StoryArcId | string,
  optionId: string
): boolean {
  if (!world) return false;
  const arc = getStoryArcById(arcId as StoryArcId);
  if (!arc) return false;
  const option = arc.choices.find((c) => c.id === optionId);
  if (!option) return false;

  const chapter = world.run?.chapter ?? 'prologue';
  if (!world.exploration) {
    world.exploration = createInitialExplorationState(chapter, null);
  }
  const resolvedMap = normalizeResolvedStoryChoices(
    world.exploration.resolvedStoryChoices
  );
  if (resolvedMap[arc.id]) {
    return false;
  }

  resolvedMap[arc.id] = option.id;
  world.exploration.resolvedStoryChoices = resolvedMap;
  world.exploration.storyArcs = buildStoryArcStates(resolvedMap);
  world.exploration.activeChapterStory =
    world.exploration.storyArcs.find((s) => s.chapter === chapter) ?? null;
  world.exploration.stanceSummary = computeChronicleStanceSummary(resolvedMap);

  grantProgressionReward(world, arc.rewardId);
  syncPlayerRigStats(world);

  const protocolMods = getPlayerProtocolModifiers(world);
  const p = world.player;
  world.activeStoryBlessing = option.blessingEffect;
  if (p) {
    if (option.blessingEffect === 'flux_surge') {
      p.flux = Math.min(p.maxFlux, p.flux + 25);
      p.surgeTimer = Math.max(
        p.surgeTimer ?? 0,
        2.5 * protocolMods.surgeDurationMultiplier
      );
    } else if (option.blessingEffect === 'integrity_shield') {
      p.integrity = Math.min(p.maxIntegrity, p.integrity + 25);
      p.ghostIntegrity = Math.max(p.ghostIntegrity, p.integrity);
      p.invulnTimer = Math.max(p.invulnTimer, 1.2);
    }
  }

  world.exploration.statusBannerText = `${option.responseLine} · [${option.blessingLabel}]`;
  world.run.checkpointNotice = `${option.responseLine} · ${option.blessingLabel}`;
  world.run.checkpointNoticeTimer = Math.max(world.run.checkpointNoticeTimer, 5.0);
  world.events.push({
    type: 'story_choice_resolved',
    x: p?.x ?? 0,
    z: p?.z ?? 0,
    rewardId: arc.rewardId,
  });
  return true;
}

export function projectChapterHoloMemory(world: WorldState): boolean {
  if (
    !world ||
    world.outcome === 'defeat' ||
    world.run?.mode === 'boss_gauntlet' ||
    !world.player ||
    world.player.actionState === 'dead'
  ) {
    return false;
  }
  const chapter = world.run?.chapter ?? 'prologue';
  if (!world.exploration) {
    world.exploration = createInitialExplorationState(chapter, null);
  }
  const holoDef = getHoloMemoryForChapter(chapter);
  const discovered = sanitizeHoloMemoryIds(world.exploration.discoveredHoloMemoryIds);
  const isFirstDiscovery = !discovered.includes(holoDef.id);

  if (isFirstDiscovery) {
    discovered.push(holoDef.id);
    world.exploration.discoveredHoloMemoryIds = discovered;
    syncPlayerRigStats(world);

    const p = world.player;
    p.flux = Math.min(p.maxFlux, p.flux + 22);
    p.integrity = Math.min(p.maxIntegrity, p.integrity + 16);
    p.ghostIntegrity = Math.max(p.ghostIntegrity, p.integrity);
    const aegis = ensureChronoAegisState(world);
    if (aegis.maxWard > 0) {
      aegis.ward = Math.min(aegis.maxWard, aegis.ward + 12);
    }
  }

  world.exploration.activeHoloMemoryId = holoDef.id;
  world.exploration.activeHoloMemoryTimer = 9.5;
  world.exploration.statusBannerText = isFirstDiscovery
    ? `${holoDef.titleEn} · +22 FLUX · +16 INTEGRITY · HOLO RESONANCE ${discovered.length}/${LYSA_HOLO_MEMORIES.length}`
    : `${holoDef.titleEn} · HOLO-MEMORY REPLAY`;
  world.exploration.localMap = buildLocalMapSnapshot(
    chapter,
    {
      x: world.player.x,
      z: world.player.z,
      rotationY: world.player.rotationY,
    },
    world.exploration.mission,
    world.exploration.routes,
    world.exploration.hazards,
    world.exploration.secrets,
    world.exploration.discoveredRegionIds,
    world.exploration.discoveredSecretIds,
    world.fluxPools ?? [],
    world.exploration.tacticalWaypoint ?? null,
    world.fragmentCaches ?? [],
    world.sectorBeacons ?? [],
    world.temporalRift ?? null,
    discovered,
    true
  );

  if (isFirstDiscovery) {
    world.run.checkpointNotice = `${holoDef.titleEn} · HOLO RESONANCE ${discovered.length}/${LYSA_HOLO_MEMORIES.length}`;
    world.run.checkpointNoticeTimer = Math.max(world.run.checkpointNoticeTimer, 4.8);
  }

  world.events.push({
    type: 'holo_memory_projected',
    x: holoDef.x,
    z: holoDef.z,
    amount: isFirstDiscovery ? 1 : 0,
  });
  return true;
}

export function dismissActiveHoloMemory(world: WorldState): boolean {
  if (!world?.exploration || !world.exploration.activeHoloMemoryId) {
    return false;
  }
  world.exploration.activeHoloMemoryId = null;
  world.exploration.activeHoloMemoryTimer = 0;
  return true;
}

export function discoverSecretArea(
  world: WorldState,
  secretId: unknown
): boolean {
  if (!isValidSecretAreaId(secretId)) {
    return false;
  }
  const chapter = world.run?.chapter ?? 'prologue';
  if (!world.exploration) {
    world.exploration = createInitialExplorationState(chapter, null);
  }
  const exp = world.exploration;
  if (exp.discoveredSecretIds.includes(secretId)) {
    return false;
  }

  const def = getSecretAreaDefinition(secretId);
  if (def.chapter !== chapter) {
    return false;
  }
  const prologueBarrierOpen = Boolean(
    world.puzzle?.finalBarrier?.open || world.puzzle?.completed
  );
  exp.routes = buildRoutesForChapter(
    chapter,
    exp.activatedNodeIds,
    exp.unlockedRouteIds,
    prologueBarrierOpen
  );
  const routeUnlocked =
    exp.routes.some((r) => r.id === def.prerequisiteRouteId && r.unlocked) ||
    exp.activatedNodeIds.includes(def.prerequisiteInteractableId);
  if (!routeUnlocked) {
    return false;
  }

  exp.discoveredSecretIds.push(secretId);

  const matchingRegion = VALID_SECTOR_REGION_IDS.map((id) =>
    getSectorRegionDefinition(id)
  ).find((r) => r.secretAreaId === secretId);
  if (
    matchingRegion &&
    !exp.discoveredRegionIds.includes(matchingRegion.id)
  ) {
    exp.discoveredRegionIds.push(matchingRegion.id);
  }

  const secretProtocolMods = getPlayerProtocolModifiers(world);
  if (def.fluxRestoreAmount > 0 && world.player) {
    const scaledSecretFlux = Math.round(
      def.fluxRestoreAmount * secretProtocolMods.salvageYieldMultiplier
    );
    world.player.flux = Math.min(
      world.player.maxFlux,
      world.player.flux + scaledSecretFlux
    );
  }
  if (def.integrityRestoreAmount > 0 && world.player) {
    const scaledSecretIntegrity = Math.round(
      def.integrityRestoreAmount * secretProtocolMods.salvageYieldMultiplier
    );
    world.player.integrity = Math.min(
      world.player.maxIntegrity,
      world.player.integrity + scaledSecretIntegrity
    );
    world.player.ghostIntegrity = Math.max(
      world.player.ghostIntegrity,
      world.player.integrity
    );
  }

  if (def.linkedCodexId) {
    discoverCodexEntry(world, def.linkedCodexId);
  }

  if (
    secretId === 'secret_prologue_calibration_alcove' ||
    secretId === 'secret_ch1_marshal_armory_cache'
  ) {
    unlockPlayerWeapon(world, 'phase_rail');
  } else if (
    secretId === 'secret_ch2_hydroponic_echo_sanctum' ||
    secretId === 'secret_ch3_lysa_unedited_vault'
  ) {
    unlockPlayerWeapon(world, 'grav_breaker');
  }

  exp.lastDiscoveryBanner = {
    secretId: def.id,
    title: def.title,
    subtitle: def.subtitle,
    rewardSummary: def.rewardSummary,
    remainingTime: 5.0,
  };
  exp.statusBannerText = def.discoveryMessage;
  world.run.checkpointNotice = def.discoveryMessage;
  world.run.checkpointNoticeTimer = 4.6;

  exp.routes = buildRoutesForChapter(
    chapter,
    exp.activatedNodeIds,
    exp.unlockedRouteIds,
    prologueBarrierOpen
  );
  exp.secrets = buildSecretsForChapter(
    chapter,
    exp.discoveredSecretIds,
    exp.routes,
    exp.secrets
  );
  const secState = exp.secrets.find((s) => s.id === secretId);
  if (secState) {
    secState.discoveredAtTime = world.elapsedTime;
  }
  exp.localMap = buildLocalMapSnapshot(
    chapter,
    {
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
      rotationY: world.player?.rotationY ?? Math.PI,
    },
    exp.mission,
    exp.routes,
    exp.hazards,
    exp.secrets,
    exp.discoveredRegionIds,
    exp.discoveredSecretIds,
    world.fluxPools ?? [],
    exp.tacticalWaypoint ?? null,
    world.fragmentCaches ?? [],
    world.sectorBeacons ?? [],
    world.temporalRift ?? null,
    exp.discoveredHoloMemoryIds ?? [],
    world.run?.mode !== 'boss_gauntlet'
  );

  world.events.push({
    type: 'secret_area_discovered',
    x: def.x,
    z: def.z,
    secretId: def.id,
    codexId: def.linkedCodexId,
  });

  const chapterEventDefs = getAllNarrativeEventDefinitionsForChapter(chapter);
  for (let i = 0; i < chapterEventDefs.length; i++) {
    const evDef = chapterEventDefs[i];
    if (!exp.completedNarrativeEventIds.includes(evDef.id)) {
      if (canTriggerNarrativeEventNow(world, evDef)) {
        triggerNarrativeEvent(world, evDef.id);
      }
    }
  }
  exp.narrativeEvents = buildNarrativeEventsForChapter(
    chapter,
    exp.completedNarrativeEventIds,
    exp.narrativeEvents
  );
  exp.convergenceSummary = buildCampaignEndingDiscoverySummary({
    completedChapters: world.run?.completedChapters,
    recoveredLogs: world.run?.recoveredLogs,
    discoveredCodexIds: exp.discoveredCodexIds,
    discoveredSecretIds: exp.discoveredSecretIds,
    activatedNodeIds: exp.activatedNodeIds,
    unlockedRouteIds: exp.unlockedRouteIds,
    completedNarrativeEventIds: exp.completedNarrativeEventIds,
    prologueBarrierOpen,
  });

  return true;
}

export function advanceTimedEnergyHazards(
  world: WorldState,
  dt: number
): void {
  if (world.appState !== 'playing' || world.outcome !== 'none' || dt <= 0) {
    return;
  }
  const chapter = world.run?.chapter ?? 'prologue';
  if (!world.exploration) {
    world.exploration = createInitialExplorationState(chapter, null);
  }
  const exp = world.exploration;
  if (
    !exp.hazards ||
    (exp.hazards.length > 0 && exp.hazards[0].chapter !== chapter)
  ) {
    exp.hazards = buildHazardsForChapter(chapter, null);
  }

  if (exp.lastDiscoveryBanner && exp.lastDiscoveryBanner.remainingTime > 0) {
    exp.lastDiscoveryBanner.remainingTime = Math.max(
      0,
      exp.lastDiscoveryBanner.remainingTime - dt
    );
    if (exp.lastDiscoveryBanner.remainingTime <= 0) {
      exp.lastDiscoveryBanner = null;
    }
  }

  const p = world.player;
  for (let i = 0; i < exp.hazards.length; i++) {
    const h = exp.hazards[i];
    const prevPhase = h.phase;
    const cycleDur = Math.max(
      0.1,
      h.safeDuration + h.warningDuration + h.activeDuration
    );
    h.cycleDuration = cycleDur;
    const totalCycleTime = h.cycleTime + dt;
    const cyclesWrapped = Math.floor(totalCycleTime / cycleDur);
    if (cyclesWrapped > 0) {
      h.cycleIndex = (h.cycleIndex ?? 0) + cyclesWrapped;
    }
    h.cycleTime = totalCycleTime % cycleDur;

    if (h.cycleTime < h.safeDuration) {
      h.phase = 'safe';
      h.phaseTimer = Number((h.safeDuration - h.cycleTime).toFixed(3));
      h.warning = false;
      h.active = false;
    } else if (h.cycleTime < h.safeDuration + h.warningDuration) {
      h.phase = 'warning';
      h.phaseTimer = Number(
        (h.safeDuration + h.warningDuration - h.cycleTime).toFixed(3)
      );
      h.warning = true;
      h.active = false;
      if (prevPhase !== 'warning') {
        world.events.push({
          type: 'timed_hazard_warning',
          x: h.x,
          z: h.z,
          hazardId: h.id,
        });
      }
    } else {
      h.phase = 'active';
      h.phaseTimer = Number((cycleDur - h.cycleTime).toFixed(3));
      h.warning = false;
      h.active = true;
      if (prevPhase !== 'active') {
        world.events.push({
          type: 'timed_hazard_active',
          x: h.x,
          z: h.z,
          hazardId: h.id,
        });
      }
    }

    const currentCycleIndex = h.cycleIndex ?? 0;
    const relayPhaseShiftActive = (world.relay?.successFlashTimer ?? 0) > 0;
    if ((h.phase === 'warning' || h.phase === 'active') && p && p.actionState !== 'dead') {
      const threadDist = Math.hypot(p.x - h.x, p.z - h.z);
      const isPhaseThreading = p.actionState === 'dodging' || relayPhaseShiftActive;
      if (
        isPhaseThreading &&
        threadDist <= h.radius + 1.0 &&
        h.lastThreadCycleIndex !== currentCycleIndex
      ) {
        h.lastThreadCycleIndex = currentCycleIndex;
        const rigMods = getPlayerRigModifiers(world);
        const threadFlux = 14;
        p.flux = Math.min(p.maxFlux, p.flux + threadFlux);
        if (rigMods.threadIntegrityBonus > 0) {
          p.integrity = Math.min(p.maxIntegrity, p.integrity + rigMods.threadIntegrityBonus);
          p.ghostIntegrity = Math.max(p.ghostIntegrity, p.integrity);
        }
        p.surgeTimer = Math.max(p.surgeTimer ?? 0, 1.4);
        const threadAdr = applyAdrenalineDelta(p, 0.35);
        if (threadAdr.tierDelta !== 0) {
          world.events.push({
            type: 'adrenaline_tier_changed',
            x: p.x,
            z: p.z,
            amount: threadAdr.nextTier,
            postureBonus: threadAdr.tierDelta,
          });
        }
        world.events.push({
          type: 'temporal_thread_triggered',
          x: p.x,
          z: p.z,
          amount: threadFlux,
          hazardId: h.id,
        });
      }
    }

    if (h.active && p && p.actionState !== 'dead') {
      const dist = Math.hypot(p.x - h.x, p.z - h.z);
      const hitThreshold = h.radius + GAME_CONFIG.player.radius * 0.65;
      const lastHitCycle = h.lastHitCycleIndex ?? -1;
      if (
        dist <= hitThreshold &&
        p.actionState !== 'dodging' &&
        p.invulnTimer <= 0 &&
        !relayPhaseShiftActive &&
        lastHitCycle !== currentCycleIndex &&
        world.elapsedTime - h.lastPlayerHitTime >= h.hitCooldownSeconds
      ) {
        h.lastPlayerHitTime = world.elapsedTime;
        h.lastHitCycleIndex = currentCycleIndex;
        p.integrity = Math.max(0, p.integrity - h.damage);
        p.invulnTimer = GAME_CONFIG.player.hurtInvulnDuration;
        p.hurtFlashTimer = 0.22;
        p.squashX = 1.18;
        p.squashY = 0.84;
        world.stats.damageTaken += h.damage;
        world.hitstopTimer = Math.max(world.hitstopTimer, 0.04);
        world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.42);

        if (p.actionState === 'charging_heavy') {
          p.actionState = 'idle';
          p.chargeTime = 0;
        }

        world.events.push({
          type: 'timed_hazard_damaged_player',
          x: p.x,
          z: p.z,
          amount: h.damage,
          hazardId: h.id,
        });
        world.events.push({
          type: 'player_damaged',
          x: p.x,
          z: p.z,
          amount: h.damage,
        });

        if (p.integrity <= 0) {
          p.actionState = 'dead';
          p.vx = 0;
          p.vz = 0;
          world.outcome = 'defeat';
          world.outcomeDelayTimer = 0.55;
          clearEchoState(world, 'outcome');
          world.events.push({
            type: 'encounter_defeat',
            x: p.x,
            z: p.z,
          });
        }
      }
    }
  }
}

export function canTriggerNarrativeEventNow(
  world: WorldState,
  def: NarrativeEventDefinition
): boolean {
  if (!world || !def) {
    return false;
  }
  if (world.appState !== 'playing' || world.outcome === 'defeat') {
    return false;
  }
  if (
    !world.run ||
    world.run.mode !== 'campaign' ||
    Boolean(world.run.isChapterReplay)
  ) {
    return false;
  }
  if (
    !world.player ||
    world.player.actionState === 'dead' ||
    world.player.integrity <= 0
  ) {
    return false;
  }
  const chapter = world.run.chapter;
  if (def.chapter !== chapter) {
    return false;
  }
  const exp = world.exploration;
  if (!exp || !Array.isArray(exp.completedNarrativeEventIds)) {
    return false;
  }
  if (exp.completedNarrativeEventIds.includes(def.id)) {
    return false;
  }

  const activatedNodeIds = Array.isArray(exp.activatedNodeIds)
    ? exp.activatedNodeIds
    : [];
  const discoveredSecretIds = Array.isArray(exp.discoveredSecretIds)
    ? exp.discoveredSecretIds
    : [];
  const routes = Array.isArray(exp.routes) ? exp.routes : [];
  const completedObjectiveIds = Array.isArray(exp.completedObjectiveIds)
    ? exp.completedObjectiveIds
    : [];

  // Evaluate dual OR prerequisites when both an interactable/route and a secret are specified
  if (def.requiredInteractableId && def.requiredSecretId) {
    const hasInt = activatedNodeIds.includes(def.requiredInteractableId);
    const hasSec = discoveredSecretIds.includes(def.requiredSecretId);
    if (!hasInt && !hasSec) return false;
  } else if (def.requiredRouteId && def.requiredSecretId) {
    const hasRoute = routes.some(
      (r) => r.id === def.requiredRouteId && r.unlocked
    );
    const hasSec = discoveredSecretIds.includes(def.requiredSecretId);
    if (!hasRoute && !hasSec) return false;
  } else if (def.requiredInteractableId && def.requiredRouteId) {
    const hasInt = activatedNodeIds.includes(def.requiredInteractableId);
    const hasRoute = routes.some(
      (r) => r.id === def.requiredRouteId && r.unlocked
    );
    if (!hasInt && !hasRoute) return false;
  } else {
    if (
      def.requiredInteractableId &&
      !activatedNodeIds.includes(def.requiredInteractableId)
    ) {
      return false;
    }
    if (
      def.requiredSecretId &&
      !discoveredSecretIds.includes(def.requiredSecretId)
    ) {
      return false;
    }
    if (
      def.requiredRouteId &&
      !routes.some((r) => r.id === def.requiredRouteId && r.unlocked)
    ) {
      return false;
    }
  }

  if (
    def.requiredObjectiveId &&
    !completedObjectiveIds.includes(def.requiredObjectiveId)
  ) {
    return false;
  }

  switch (def.triggerKind) {
    case 'chapter_arrival':
      return true;
    case 'calibration_revelation':
      return Boolean(
        world.puzzle?.testCompleted ||
          world.puzzle?.heavyReceiver?.charged ||
          world.puzzle?.finalBarrier?.open ||
          world.puzzle?.completed
      );
    case 'environmental_discovery':
    case 'secret_discovered':
    case 'campaign_convergence':
      return true;
    case 'echo_memory_activated': {
      if (def.id === 'nev_prologue_echo_memory_trace') {
        return Boolean(
          world.puzzle?.teachCompleted ||
            world.pressurePlate?.active ||
            (world.pressurePlate?.activationCount ?? 0) > 0 ||
            discoveredSecretIds.includes('secret_prologue_calibration_alcove')
        );
      }
      return true;
    }
    case 'boss_phase_transition':
      return Boolean(world.boss && world.boss.phase >= 2);
    case 'boss_defeat':
      return Boolean(
        world.boss && (world.boss.hp <= 0 || world.boss.defeatTriggered)
      );
    case 'campaign_resolution':
      return (
        isValidChronicleLoomEndingId(world.loom?.selectedEnding) ||
        isValidChronicleLoomEndingId(world.run?.selectedEnding)
      );
    default:
      return false;
  }
}

export function triggerNarrativeEvent(
  world: WorldState,
  eventId: unknown
): boolean {
  if (!isValidNarrativeEventId(eventId)) {
    return false;
  }
  const chapter = world.run?.chapter ?? 'prologue';
  if (!world.exploration) {
    world.exploration = createInitialExplorationState(chapter, null);
  }
  const def = getNarrativeEventDefinition(eventId);
  if (!canTriggerNarrativeEventNow(world, def)) {
    return false;
  }

  const exp = world.exploration;
  exp.completedNarrativeEventIds.push(def.id);
  exp.lastTriggeredNarrativeEventId = def.id;

  // Trigger linked narrative transmission without disrupting active combat or boss telegraphs
  if (def.commKey && def.commKey in GAME_CONFIG.narrativeComms) {
    const isBossTelegraphing = Boolean(
      world.boss && world.boss.aiState === 'telegraph'
    );
    const shouldInterrupt =
      def.category === 'main' &&
      (def.triggerKind === 'boss_defeat' ||
        def.triggerKind === 'boss_phase_transition' ||
        def.triggerKind === 'calibration_revelation') &&
      !isBossTelegraphing;
    triggerNarrativeTransmission(
      world,
      def.commKey as NarrativeCommKey,
      shouldInterrupt
    );
  }

  exp.narrativeEvents = buildNarrativeEventsForChapter(
    chapter,
    exp.completedNarrativeEventIds,
    exp.narrativeEvents
  );
  const evState = exp.narrativeEvents.find((e) => e.id === def.id);
  if (evState) {
    evState.completedAtTime = world.elapsedTime;
  }

  const prologueBarrierOpen = Boolean(
    world.puzzle?.finalBarrier?.open || world.puzzle?.completed
  );
  exp.convergenceSummary = buildCampaignEndingDiscoverySummary({
    completedChapters: world.run?.completedChapters,
    recoveredLogs: world.run?.recoveredLogs,
    discoveredCodexIds: exp.discoveredCodexIds,
    discoveredSecretIds: exp.discoveredSecretIds,
    activatedNodeIds: exp.activatedNodeIds,
    unlockedRouteIds: exp.unlockedRouteIds,
    completedNarrativeEventIds: exp.completedNarrativeEventIds,
    prologueBarrierOpen,
  });

  if (def.category === 'echo_memory') {
    exp.statusBannerText = `ECHO MEMORY SYNCHRONIZED · ${def.title.toUpperCase()}`;
    world.events.push({
      type: 'echo_memory_discovered',
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
      narrativeEventId: def.id,
      codexId: def.linkedCodexId,
    });
  } else if (def.category === 'optional') {
    exp.statusBannerText = `NARRATIVE EVIDENCE RECORDED · ${def.title.toUpperCase()}`;
  }

  world.events.push({
    type: 'narrative_event_triggered',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    narrativeEventId: def.id,
    codexId: def.linkedCodexId,
  });

  return true;
}

export function advanceMissionAndExplorationSystem(world: WorldState): void {
  if (world.expedition?.enabled && world.expedition.phase === 'safe_room') {
    return;
  }
  const chapter = world.run?.chapter ?? 'prologue';
  if (!world.exploration) {
    world.exploration = createInitialExplorationState(chapter, null);
  }
  const exp = world.exploration;
  if (!exp.discoveredRegionIds) {
    exp.discoveredRegionIds = [];
  }
  if (!exp.discoveredSecretIds) {
    exp.discoveredSecretIds = [];
  }
  if (!exp.completedNarrativeEventIds) {
    exp.completedNarrativeEventIds = [];
  }

  if (exp.mission.chapter !== chapter) {
    exp.mission = buildMissionRuntimeState(
      chapter,
      exp.completedObjectiveIds,
      null
    );
    exp.interactables = buildInteractablesForChapter(
      chapter,
      exp.activatedNodeIds
    );
    exp.hazards = buildHazardsForChapter(chapter, null);
    exp.narrativeEvents = buildNarrativeEventsForChapter(
      chapter,
      exp.completedNarrativeEventIds,
      null
    );
    exp.chapterIdentity = getChapterWorldIdentity(chapter);
  } else {
    if (!exp.hazards || exp.hazards.length === 0) {
      exp.hazards = buildHazardsForChapter(chapter, exp.hazards);
    }
    exp.chapterIdentity = getChapterWorldIdentity(chapter);
  }

  syncUnlockedRoutesToObstacles(world);

  // Check Echo / Pulsecaster strikes or Echo proximity on Echo-Reactive conduits (acceptsEchoOrPulseStrike === true)
  for (let i = 0; i < exp.interactables.length; i++) {
    const state = exp.interactables[i];
    if (state.status === 'activated') continue;
    const def = getInteractableDefinition(state.id);
    if (!def.acceptsEchoOrPulseStrike) continue;

    let struckByEchoOrPulse = false;
    if (world.echo.state === 'playback' && world.echo.activeActor) {
      const actor = world.echo.activeActor;
      const distToConduit = Math.hypot(actor.x - def.x, actor.z - def.z);
      const isEchoAttacking =
        actor.actionState === 'light_active' ||
        actor.actionState === 'heavy_active' ||
        actor.actionState === 'light_windup' ||
        actor.actionState === 'heavy_windup';
      const isEchoStationedOnConduit =
        def.kind === 'echo_conduit' &&
        world.echo.playbackTime >= 0.08 &&
        distToConduit <= def.interactRadius * 0.85;
      if (
        (isEchoAttacking && distToConduit <= def.interactRadius + 0.6) ||
        isEchoStationedOnConduit
      ) {
        struckByEchoOrPulse = true;
      }
    }
    if (!struckByEchoOrPulse && world.projectiles.length > 0) {
      for (let pIdx = 0; pIdx < world.projectiles.length; pIdx++) {
        const proj = world.projectiles[pIdx];
        if (!proj.active) continue;
        const hitRadius = def.interactRadius * 0.75;
        const segHitT = segmentCircleEarliestHitT(
          proj.prevX,
          proj.prevZ,
          proj.x,
          proj.z,
          def.x,
          def.z,
          hitRadius
        );
        if (
          segHitT !== null ||
          Math.hypot(proj.x - def.x, proj.z - def.z) <= hitRadius
        ) {
          struckByEchoOrPulse = true;
          break;
        }
      }
    }
    if (struckByEchoOrPulse) {
      executeInteractableActivation(world, def, state);
    }
  }

  // Evaluate deterministic simulation objective triggers for the active chapter
  if (chapter === 'prologue') {
    if (world.puzzle?.completed) {
      completeMissionObjective(world, 'obj_prologue_puzzle_calibration');
    }
    const allDead =
      world.enemies.length > 0 &&
      world.enemies.every((e) => e.hp <= 0 || e.aiState === 'ko');
    if (allDead) {
      completeMissionObjective(world, 'obj_prologue_clear_bay');
    }
  } else if (chapter === 'chapter_1_helix') {
    if (
      world.boss &&
      world.boss.id === 'helix-04' &&
      (world.boss.phase >= 2 ||
        world.boss.coreExposed ||
        world.boss.hp <= 0 ||
        world.boss.defeatTriggered)
    ) {
      completeMissionObjective(world, 'obj_ch1_break_helix_shield');
    }
    if (
      world.boss &&
      world.boss.id === 'helix-04' &&
      (world.boss.hp <= 0 || world.boss.defeatTriggered)
    ) {
      completeMissionObjective(world, 'obj_ch1_defeat_helix');
    }
  } else if (chapter === 'chapter_2_choir') {
    if (
      world.choir?.completedCycles >= 1 ||
      (world.boss &&
        world.boss.id === 'the-choir' &&
        (world.boss.hp <= 0 || world.boss.defeatTriggered))
    ) {
      completeMissionObjective(world, 'obj_ch2_sync_harmonic_cycle');
    }
    if (
      world.boss &&
      world.boss.id === 'the-choir' &&
      (world.boss.hp <= 0 || world.boss.defeatTriggered)
    ) {
      completeMissionObjective(world, 'obj_ch2_defeat_choir');
    }
  } else if (chapter === 'chapter_3_curator') {
    const decoyEliminated =
      world.events.some((ev) => ev.type === 'curator_decoy_eliminated') ||
      world.enemies.some(
        (e) =>
          (e.isDecoy || e.archetype === 'curator_decoy') &&
          (e.hp <= 0 || e.aiState === 'ko')
      );
    if (decoyEliminated) {
      completeMissionObjective(world, 'obj_ch3_purge_archive_decoy');
    }
    if (
      world.boss &&
      world.boss.id === 'the-curator' &&
      (world.boss.hp <= 0 || world.boss.defeatTriggered)
    ) {
      completeMissionObjective(world, 'obj_ch3_defeat_curator');
    }
  } else if (chapter === 'chapter_4_matron') {
    if (
      world.boss &&
      world.boss.id === 'matron-v' &&
      (world.boss.phase >= 2 || world.boss.hp <= 0 || world.boss.defeatTriggered)
    ) {
      completeMissionObjective(world, 'obj_ch4_survive_excision');
    }
    if (
      world.boss &&
      world.boss.id === 'matron-v' &&
      (world.boss.hp <= 0 || world.boss.defeatTriggered)
    ) {
      completeMissionObjective(world, 'obj_ch4_defeat_matron');
    }
  } else if (chapter === 'chapter_5_loom') {
    if (world.loom?.active) {
      completeMissionObjective(world, 'obj_ch5_defeat_warden_prime');
    }
    if (world.loom?.selectedEnding !== null) {
      completeMissionObjective(world, 'obj_ch5_select_loom_directive');
    }
  }

  const prologueBarrierOpen = Boolean(
    world.puzzle?.finalBarrier?.open || world.puzzle?.completed
  );
  exp.routes = buildRoutesForChapter(
    chapter,
    exp.activatedNodeIds,
    exp.unlockedRouteIds,
    prologueBarrierOpen
  );

  // Check player entry into non-secret sector regions and unlocked secret areas
  if (world.player && world.player.actionState !== 'dead') {
    const px = world.player.x;
    const pz = world.player.z;

    if (world.run?.mode === 'campaign' && !world.run?.isChapterReplay) {
      const regionDefs = getAllSectorRegionDefinitionsForChapter(chapter);
      for (let i = 0; i < regionDefs.length; i++) {
        const reg = regionDefs[i];
        if (reg.secretAreaId) continue;
        if (
          !exp.discoveredRegionIds.includes(reg.id) &&
          Math.hypot(px - reg.x, pz - reg.z) <= reg.radius
        ) {
          exp.discoveredRegionIds.push(reg.id);
        }
      }
    }

    const secretDefs = getAllSecretAreaDefinitionsForChapter(chapter);
    for (let i = 0; i < secretDefs.length; i++) {
      const sec = secretDefs[i];
      if (exp.discoveredSecretIds.includes(sec.id)) continue;
      const routeUnlocked =
        exp.routes.some((r) => r.id === sec.prerequisiteRouteId && r.unlocked) ||
        exp.activatedNodeIds.includes(sec.prerequisiteInteractableId);
      if (
        routeUnlocked &&
        Math.hypot(px - sec.x, pz - sec.z) <= sec.radius
      ) {
        discoverSecretArea(world, sec.id);
      }
    }
  }

  // Evaluate authored chapter narrative events deterministically & idempotently
  const chapterEventDefs = getAllNarrativeEventDefinitionsForChapter(chapter);
  for (let i = 0; i < chapterEventDefs.length; i++) {
    const evDef = chapterEventDefs[i];
    if (!exp.completedNarrativeEventIds.includes(evDef.id)) {
      if (canTriggerNarrativeEventNow(world, evDef)) {
        triggerNarrativeEvent(world, evDef.id);
      }
    }
  }

  exp.narrativeEvents = buildNarrativeEventsForChapter(
    chapter,
    exp.completedNarrativeEventIds,
    exp.narrativeEvents
  );
  exp.convergenceSummary = buildCampaignEndingDiscoverySummary({
    completedChapters: world.run?.completedChapters,
    recoveredLogs: world.run?.recoveredLogs,
    discoveredCodexIds: exp.discoveredCodexIds,
    discoveredSecretIds: exp.discoveredSecretIds,
    activatedNodeIds: exp.activatedNodeIds,
    unlockedRouteIds: exp.unlockedRouteIds,
    completedNarrativeEventIds: exp.completedNarrativeEventIds,
    prologueBarrierOpen,
  });

  if (world.player && world.player.actionState !== 'dead' && exp.tacticalWaypoint) {
    const wp = exp.tacticalWaypoint;
    if (Math.hypot(world.player.x - wp.x, world.player.z - wp.z) <= 2.3) {
      exp.tacticalWaypoint = null;
      exp.statusBannerText = `WAYPOINT REACHED · ${wp.label.toUpperCase()}`;
    }
  }

  syncChapterExpansionEntities(world, chapter);
  if (world.player && world.player.actionState !== 'dead') {
    const px = world.player.x;
    const pz = world.player.z;
    const caches = world.fragmentCaches ?? [];
    for (let i = 0; i < caches.length; i++) {
      const cache = caches[i];
      if (!cache.claimed && Math.hypot(px - cache.x, pz - cache.z) <= cache.radius) {
        claimFragmentCache(world, cache.id);
      }
    }
  }

  exp.secrets = buildSecretsForChapter(
    chapter,
    exp.discoveredSecretIds,
    exp.routes,
    exp.secrets
  );
  exp.localMap = buildLocalMapSnapshot(
    chapter,
    {
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
      rotationY: world.player?.rotationY ?? Math.PI,
    },
    exp.mission,
    exp.routes,
    exp.hazards,
    exp.secrets,
    exp.discoveredRegionIds,
    exp.discoveredSecretIds,
    world.fluxPools ?? [],
    exp.tacticalWaypoint ?? null,
    world.fragmentCaches ?? [],
    world.sectorBeacons ?? [],
    world.temporalRift ?? null,
    exp.discoveredHoloMemoryIds ?? [],
    world.run?.mode !== 'boss_gauntlet'
  );

  exp.prompt = evaluateNearestInteractablePrompt(world);
}

function spawnWaveUnitsForEncounter(
  encounterId: EncounterCompositionId,
  waveIndex: number,
  obstacles: readonly ObstacleCollider[],
  playerX: number,
  playerZ: number,
  isReinforcementWave = false
): EnemyState[] {
  const def = getEncounterDefinition(encounterId);
  const wave =
    def.waves.find((w) => w.waveIndex === waveIndex) ?? def.waves[0];
  const spawned: EnemyState[] = [];
  for (let i = 0; i < wave.units.length; i++) {
    const spec = wave.units[i];
    const enemy = createEnemy(
      spec.id,
      spec.archetype,
      spec.x,
      spec.z,
      isReinforcementWave ? 0.45 + i * 0.25 : i === 0 ? 0 : i === 1 ? 0.3 : -0.3
    );
    enemy.name = spec.name;
    if (spec.modifier) {
      applyEnemyModifier(enemy, spec.modifier);
    }
    const validation = validateEncounterSpawnPoint(
      enemy.x,
      enemy.z,
      enemy.radius,
      obstacles,
      GAME_CONFIG.arena.radius,
      playerX,
      playerZ,
      GAME_CONFIG.player.radius
    );
    if (!validation.valid) {
      resolveCircleObstacleCollisions(
        enemy,
        obstacles as ObstacleCollider[],
        GAME_CONFIG.arena.radius - 0.6
      );
    }
    spawned.push(enemy);
  }
  return spawned;
}

export function getWeaponDefinition(weaponId: WeaponId): WeaponDefinition {
  return GAME_CONFIG.weapons[weaponId];
}

export const VALID_WEAPON_UPGRADE_IDS: readonly WeaponUpgradeId[] = [
  'edge_breaker_cleave',
  'edge_harmonic_conductor',
  'pulse_thermal_sink',
  'pulse_overcharge_condenser',
  'rail_null_aperture',
  'rail_phase_capacitor',
  'breaker_seismic_core',
  'breaker_singularity_coil',
  'scythe_rift_reaper',
  'scythe_astral_siphon',
];

export const VALID_PROGRESSION_REWARD_IDS: readonly WeaponProgressionRewardId[] = [
  'prologue_calibration_teach',
  'prologue_calibration_test',
  'prologue_calibration_combine',
  'prologue_bay_proxies_cleared',
  'chapter_1_helix_defeated',
  'chapter_2_choir_defeated',
  'chapter_3_curator_defeated',
  'chapter_4_matron_defeated',
  'conduit_ch4_quarantine_override_frag',
  'conduit_ch5_temporal_anchor_frag',
  'cache_prologue_east',
  'cache_ch1_marshal_west',
  'cache_ch2_garden_north',
  'cache_ch3_vault_east',
  'cache_ch3_vault_west',
  'cache_ch4_quarantine_north',
  'cache_ch5_loom_east',
  'cache_ch5_loom_west',
  'story_arc_prologue',
  'story_arc_ch1',
  'story_arc_ch2',
  'story_arc_ch3',
  'story_arc_ch4',
  'story_arc_ch5',
];

export function isValidWeaponUpgradeId(value: unknown): value is WeaponUpgradeId {
  return (
    typeof value === 'string' &&
    (VALID_WEAPON_UPGRADE_IDS as readonly string[]).includes(value)
  );
}

export function isValidProgressionRewardId(
  value: unknown
): value is WeaponProgressionRewardId {
  return (
    typeof value === 'string' &&
    (VALID_PROGRESSION_REWARD_IDS as readonly string[]).includes(value)
  );
}

export function getWeaponUpgradeDefinition(
  upgradeId: WeaponUpgradeId
): WeaponUpgradeDefinition {
  return GAME_CONFIG.weapons.upgrades[upgradeId];
}

export function getAllWeaponUpgradeDefinitions(): WeaponUpgradeDefinition[] {
  return VALID_WEAPON_UPGRADE_IDS.map((id) => GAME_CONFIG.weapons.upgrades[id]);
}

export function getProgressionRewardDefinition(
  rewardId: WeaponProgressionRewardId
): WeaponProgressionRewardDefinition {
  return GAME_CONFIG.weapons.progression.rewards[rewardId];
}

function normalizeUnlockedWeaponIds(rawList: unknown): WeaponId[] {
  const result: WeaponId[] = ['chrono_edge', 'pulsecaster'];
  if (Array.isArray(rawList)) {
    const scanSlice = rawList.slice(0, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < VALID_WEAPON_IDS.length; i++) {
      const candidate = VALID_WEAPON_IDS[i];
      if (!result.includes(candidate) && scanSlice.includes(candidate)) {
        result.push(candidate);
      }
    }
  }
  return result;
}

function normalizeSeraRigSkinId(raw: unknown): SeraRigSkinId {
  if (typeof raw === 'string' && SERA_RIG_SKINS.some((s) => s.id === raw)) {
    return raw as SeraRigSkinId;
  }
  return 'nadir_standard';
}

function normalizeAchievementIds(raw: unknown): ChronoAchievementId[] {
  const out: ChronoAchievementId[] = [];
  if (!Array.isArray(raw)) return out;
  for (let i = 0; i < Math.min(raw.length, 32); i++) {
    const id = raw[i];
    if (
      typeof id === 'string' &&
      CHRONO_ACHIEVEMENTS.some((a) => a.id === id) &&
      !out.includes(id as ChronoAchievementId)
    ) {
      out.push(id as ChronoAchievementId);
    }
  }
  return out;
}

function normalizeChronoMutators(raw: unknown): ChronoMutatorState {
  if (!raw || typeof raw !== 'object') return createDefaultMutators();
  const obj = raw as Record<string, unknown>;
  return {
    glassCannon: Boolean(obj.glassCannon),
    zeroEchoCooldown: Boolean(obj.zeroEchoCooldown),
    hyperSpeed: Boolean(obj.hyperSpeed),
    ironmanNoHeal: Boolean(obj.ironmanNoHeal),
  };
}

function normalizeSpeedrunSplits(
  raw: unknown
): Partial<Record<CampaignChapterId, number>> {
  const out: Partial<Record<CampaignChapterId, number>> = {};
  if (!raw || typeof raw !== 'object') return out;
  const obj = raw as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (isValidCampaignChapterId(key)) {
      const val = obj[key];
      if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
        out[key] = Math.round(Math.min(99999, val) * 10) / 10;
      }
    }
  }
  return out;
}

export const DEFAULT_LOADOUT_PRESET_NAMES = ['ALPHA', 'BETA', 'GAMMA'] as const;

function cloneLoadoutPresets(
  presets?: ReadonlyArray<import('./types.ts').TacticalLoadoutPreset | null> | null
): Array<import('./types.ts').TacticalLoadoutPreset | null> {
  const out: Array<import('./types.ts').TacticalLoadoutPreset | null> = [null, null, null];
  if (!Array.isArray(presets)) return out;
  for (let i = 0; i < 3; i++) {
    const p = presets[i];
    if (!p || typeof p !== 'object') continue;
    out[i] = {
      slotIndex: i as import('./types.ts').TacticalLoadoutPresetSlot,
      name:
        typeof p.name === 'string' && p.name.trim().length > 0
          ? p.name.trim().slice(0, 16)
          : DEFAULT_LOADOUT_PRESET_NAMES[i],
      weaponId: p.weaponId,
      equippedUpgrades: {
        chrono_edge: p.equippedUpgrades?.chrono_edge ?? null,
        pulsecaster: p.equippedUpgrades?.pulsecaster ?? null,
        phase_rail: p.equippedUpgrades?.phase_rail ?? null,
        grav_breaker: p.equippedUpgrades?.grav_breaker ?? null,
        chrono_scythe: p.equippedUpgrades?.chrono_scythe ?? null,
      },
      equippedModChipId: p.equippedModChipId ?? null,
      equippedRigModules: {
        temporal_core: p.equippedRigModules?.temporal_core ?? null,
        defensive_chassis: p.equippedRigModules?.defensive_chassis ?? null,
        tactical_harness: p.equippedRigModules?.tactical_harness ?? null,
      },
      sentinelMode: p.sentinelMode,
      equippedBossCore: p.equippedBossCore ?? null,
      echoDoctrine: normalizeEchoDoctrineId(p.echoDoctrine),
    };
  }
  return out;
}

function normalizeLoadoutPresets(
  rawPresets: unknown,
  unlockedWeaponIds: readonly WeaponId[],
  purchasedUpgrades: readonly WeaponUpgradeId[],
  purchasedRigModules: readonly RigModuleId[],
  unlockedModChipIds: readonly import('./types.ts').WeaponModChipId[],
  unlockedBossCores: readonly import('./types.ts').BossEchoCoreId[]
): Array<import('./types.ts').TacticalLoadoutPreset | null> {
  const out: Array<import('./types.ts').TacticalLoadoutPreset | null> = [null, null, null];
  if (!Array.isArray(rawPresets)) return out;
  for (let i = 0; i < 3; i++) {
    const raw = rawPresets[i];
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    const rec = raw as Record<string, unknown>;
    const weaponId: WeaponId =
      isValidWeaponId(rec.weaponId) && unlockedWeaponIds.includes(rec.weaponId)
        ? rec.weaponId
        : 'chrono_edge';
    const equippedUpgrades: Record<WeaponId, WeaponUpgradeId | null> = {
      chrono_edge: null,
      pulsecaster: null,
      phase_rail: null,
      grav_breaker: null,
      chrono_scythe: null,
    };
    if (rec.equippedUpgrades && typeof rec.equippedUpgrades === 'object' && !Array.isArray(rec.equippedUpgrades)) {
      const eqObj = rec.equippedUpgrades as Record<string, unknown>;
      for (let w = 0; w < VALID_WEAPON_IDS.length; w++) {
        const wId = VALID_WEAPON_IDS[w];
        const cand = eqObj[wId];
        if (
          isValidWeaponUpgradeId(cand) &&
          purchasedUpgrades.includes(cand) &&
          getWeaponUpgradeDefinition(cand).weaponId === wId
        ) {
          equippedUpgrades[wId] = cand;
        }
      }
    }
    const rawChip =
      typeof rec.equippedModChipId === 'string'
        ? (rec.equippedModChipId as import('./types.ts').WeaponModChipId)
        : null;
    const validChipDef = rawChip ? getWeaponModChipDefinition(rawChip) : null;
    const equippedModChipId =
      validChipDef && (unlockedModChipIds.includes(validChipDef.id) || validChipDef.cost === 0)
        ? validChipDef.id
        : null;
    const equippedRigModules = normalizeRigProgressionFields(
      purchasedRigModules,
      rec.equippedRigModules
    ).equippedRigModules;
    const sentinelMode = normalizeSentinelMode(rec.sentinelMode);
    const equippedBossCore =
      isValidBossEchoCoreId(rec.equippedBossCore) && unlockedBossCores.includes(rec.equippedBossCore)
        ? rec.equippedBossCore
        : null;
    const echoDoctrine = normalizeEchoDoctrineId(rec.echoDoctrine);
    const name =
      typeof rec.name === 'string' && rec.name.trim().length > 0
        ? rec.name.trim().slice(0, 16)
        : DEFAULT_LOADOUT_PRESET_NAMES[i];

    out[i] = {
      slotIndex: i as import('./types.ts').TacticalLoadoutPresetSlot,
      name,
      weaponId,
      equippedUpgrades,
      equippedModChipId,
      equippedRigModules,
      sentinelMode,
      equippedBossCore,
      echoDoctrine,
    };
  }
  return out;
}

export function createInitialWeaponProgressionState(): WeaponProgressionState {
  return {
    memoryFragments: 0,
    claimedRewardIds: [],
    unlockedWeaponIds: ['chrono_edge', 'pulsecaster'],
    purchasedUpgrades: [],
    equippedUpgrades: {
      chrono_edge: null,
      pulsecaster: null,
      phase_rail: null,
      grav_breaker: null,
      chrono_scythe: null,
    },
    overclockedUpgrades: [],
    awakenedUpgrades: [],
    purchasedRigModules: [],
    equippedRigModules: createEmptyEquippedRigModules(),
    overclockedRigModules: [],
    sentinelMode: 'off',
    echoDoctrine: 'standard',
    unlockedBossCores: [],
    equippedBossCore: null,
    transcendedBossCores: [],
    purchasedNeuralProtocols: [],
    weaponMasteryXp: createEmptyWeaponMasteryXpMap(),
    bestRecursionLoop: 0,
    totalRecursionClears: 0,
    bestGauntletTimeSec: null,
    totalGauntletClears: 0,
    overdriveDifficulty: false,
    ngPlusCycle: 0,
    unlockedVaultChapters: [],
    equippedSkinId: 'nadir_standard',
    unlockedAchievementIds: [],
    paradoxEndingUnlocked: false,
    echoZeroDefeatedCount: 0,
    lifetimeParries: 0,
    lifetimeConvergences: 0,
    mutators: createDefaultMutators(),
    bestSpeedrunSplits: {},
    bestSpeedrunFullSec: null,
    speedrunHudEnabled: false,
    equippedModChipId: null,
    unlockedModChipIds: ['mod_volt_arc'],
    loadoutPresets: [null, null, null],
    combatMastery: {},
    lastPurchaseOutcome: null,
    lastEquipOutcome: null,
    lastActionMessage: 'UPGRADE BENCH READY · EARN MEMORY FRAGMENTS IN CAMPAIGN MILESTONES',
  };
}

export function clonePersistedWeaponProgressionState(
  prog: PersistedWeaponProgressionState | undefined | null
): PersistedWeaponProgressionState & {
  unlockedWeaponIds: WeaponId[];
  overclockedUpgrades: WeaponUpgradeId[];
  awakenedUpgrades: WeaponUpgradeId[];
  purchasedRigModules: RigModuleId[];
  equippedRigModules: Record<RigModuleSlot, RigModuleId | null>;
  overclockedRigModules: RigModuleId[];
  sentinelMode: import('./types.ts').SentinelProtocolMode;
  echoDoctrine: import('./types.ts').EchoDoctrineId;
  unlockedBossCores: import('./types.ts').BossEchoCoreId[];
  equippedBossCore: import('./types.ts').BossEchoCoreId | null;
  transcendedBossCores: import('./types.ts').BossEchoCoreId[];
  purchasedNeuralProtocols: NeuralProtocolId[];
  weaponMasteryXp: WeaponMasteryXpMap;
  bestRecursionLoop: number;
  totalRecursionClears: number;
  bestGauntletTimeSec: number | null;
  totalGauntletClears: number;
  overdriveDifficulty: boolean;
  ngPlusCycle: number;
  unlockedVaultChapters: CampaignChapterId[];
  equippedSkinId: SeraRigSkinId;
  unlockedAchievementIds: ChronoAchievementId[];
  paradoxEndingUnlocked: boolean;
  echoZeroDefeatedCount: number;
  lifetimeParries: number;
  lifetimeConvergences: number;
  mutators: ChronoMutatorState;
  bestSpeedrunSplits: Partial<Record<CampaignChapterId, number>>;
  bestSpeedrunFullSec: number | null;
  speedrunHudEnabled: boolean;
  equippedModChipId: import('./types.ts').WeaponModChipId | null;
  unlockedModChipIds: import('./types.ts').WeaponModChipId[];
  loadoutPresets: Array<import('./types.ts').TacticalLoadoutPreset | null>;
  combatMastery: import('./types.ts').CombatMasteryLedgerMap;
} {
  if (!prog) {
    return {
      memoryFragments: 0,
      claimedRewardIds: [],
      unlockedWeaponIds: ['chrono_edge', 'pulsecaster'],
      purchasedUpgrades: [],
      equippedUpgrades: {
        chrono_edge: null,
        pulsecaster: null,
        phase_rail: null,
        grav_breaker: null,
        chrono_scythe: null,
      },
      overclockedUpgrades: [],
      awakenedUpgrades: [],
      purchasedRigModules: [],
      equippedRigModules: createEmptyEquippedRigModules(),
      overclockedRigModules: [],
      sentinelMode: 'off',
      echoDoctrine: 'standard',
      unlockedBossCores: [],
      equippedBossCore: null,
      transcendedBossCores: [],
      purchasedNeuralProtocols: [],
      weaponMasteryXp: createEmptyWeaponMasteryXpMap(),
      bestRecursionLoop: 0,
      totalRecursionClears: 0,
      bestGauntletTimeSec: null,
      totalGauntletClears: 0,
      overdriveDifficulty: false,
      ngPlusCycle: 0,
      unlockedVaultChapters: [],
      equippedSkinId: 'nadir_standard',
      unlockedAchievementIds: [],
      paradoxEndingUnlocked: false,
      echoZeroDefeatedCount: 0,
      lifetimeParries: 0,
      lifetimeConvergences: 0,
      mutators: createDefaultMutators(),
      bestSpeedrunSplits: {},
      bestSpeedrunFullSec: null,
      speedrunHudEnabled: false,
      equippedModChipId: null,
      unlockedModChipIds: ['mod_volt_arc'],
      loadoutPresets: [null, null, null],
      combatMastery: {},
    };
  }
  const rigNormalized = normalizeRigProgressionFields(
    prog.purchasedRigModules,
    prog.equippedRigModules
  );
  const purchasedUpgrades = [...prog.purchasedUpgrades];
  const overclockedUpgrades = Array.isArray(prog.overclockedUpgrades)
    ? prog.overclockedUpgrades.filter(
        (id) => isValidWeaponUpgradeId(id) && purchasedUpgrades.includes(id)
      )
    : [];
  const awakenedUpgrades = Array.isArray(prog.awakenedUpgrades)
    ? prog.awakenedUpgrades.filter(
        (id) =>
          isValidWeaponUpgradeId(id) &&
          purchasedUpgrades.includes(id) &&
          overclockedUpgrades.includes(id)
      )
    : [];
  const purchasedNeuralProtocols = Array.isArray(prog.purchasedNeuralProtocols)
    ? prog.purchasedNeuralProtocols.filter(isValidNeuralProtocolId)
    : [];
  const unlockedVaultChapters: CampaignChapterId[] = [];
  if (Array.isArray(prog.unlockedVaultChapters)) {
    for (let i = 0; i < prog.unlockedVaultChapters.length; i++) {
      const ch = prog.unlockedVaultChapters[i];
      if (isValidCampaignChapterId(ch) && !unlockedVaultChapters.includes(ch)) {
        unlockedVaultChapters.push(ch);
      }
    }
  }
  const unlockedWeaponIdsNorm = normalizeUnlockedWeaponIds(prog.unlockedWeaponIds);
  const bossCoreNorm = normalizeBossCoreProgression(
    prog.unlockedBossCores,
    prog.equippedBossCore,
    undefined,
    undefined,
    prog.transcendedBossCores
  );
  const unlockedModChipIdsNorm: import('./types.ts').WeaponModChipId[] =
    Array.isArray(prog.unlockedModChipIds) && prog.unlockedModChipIds.length > 0
      ? Array.from(
          new Set([
            'mod_volt_arc' as const,
            ...prog.unlockedModChipIds.filter((id) => Boolean(getWeaponModChipDefinition(id))),
          ])
        )
      : ['mod_volt_arc'];
  return {
    memoryFragments: prog.memoryFragments,
    claimedRewardIds: [...prog.claimedRewardIds],
    unlockedWeaponIds: unlockedWeaponIdsNorm,
    purchasedUpgrades,
    equippedUpgrades: {
      chrono_edge: prog.equippedUpgrades?.chrono_edge ?? null,
      pulsecaster: prog.equippedUpgrades?.pulsecaster ?? null,
      phase_rail: prog.equippedUpgrades?.phase_rail ?? null,
      grav_breaker: prog.equippedUpgrades?.grav_breaker ?? null,
      chrono_scythe: prog.equippedUpgrades?.chrono_scythe ?? null,
    },
    overclockedUpgrades,
    awakenedUpgrades,
    purchasedRigModules: rigNormalized.purchasedRigModules,
    equippedRigModules: rigNormalized.equippedRigModules,
    overclockedRigModules: Array.isArray(prog.overclockedRigModules)
      ? prog.overclockedRigModules.filter(
          (id) => isValidRigModuleId(id) && rigNormalized.purchasedRigModules.includes(id)
        )
      : [],
    sentinelMode: normalizeSentinelMode(prog.sentinelMode),
    echoDoctrine: normalizeEchoDoctrineId(prog.echoDoctrine),
    ...bossCoreNorm,
    purchasedNeuralProtocols,
    weaponMasteryXp: normalizeWeaponMasteryXpMap(prog.weaponMasteryXp),
    bestRecursionLoop:
      typeof prog.bestRecursionLoop === 'number' && Number.isFinite(prog.bestRecursionLoop)
        ? Math.max(0, Math.floor(prog.bestRecursionLoop))
        : 0,
    totalRecursionClears:
      typeof prog.totalRecursionClears === 'number' && Number.isFinite(prog.totalRecursionClears)
        ? Math.max(0, Math.floor(prog.totalRecursionClears))
        : 0,
    bestGauntletTimeSec:
      typeof prog.bestGauntletTimeSec === 'number' &&
      Number.isFinite(prog.bestGauntletTimeSec) &&
      prog.bestGauntletTimeSec > 0
        ? Number(prog.bestGauntletTimeSec.toFixed(2))
        : null,
    totalGauntletClears:
      typeof prog.totalGauntletClears === 'number' && Number.isFinite(prog.totalGauntletClears)
        ? Math.max(0, Math.floor(prog.totalGauntletClears))
        : 0,
    overdriveDifficulty: Boolean(prog.overdriveDifficulty),
    ngPlusCycle:
      typeof prog.ngPlusCycle === 'number' && Number.isFinite(prog.ngPlusCycle)
        ? Math.max(0, Math.min(99, Math.floor(prog.ngPlusCycle)))
        : 0,
    unlockedVaultChapters,
    equippedSkinId: normalizeSeraRigSkinId(prog.equippedSkinId),
    unlockedAchievementIds: normalizeAchievementIds(prog.unlockedAchievementIds),
    paradoxEndingUnlocked: Boolean(prog.paradoxEndingUnlocked),
    echoZeroDefeatedCount:
      typeof prog.echoZeroDefeatedCount === 'number' && Number.isFinite(prog.echoZeroDefeatedCount)
        ? Math.max(0, Math.floor(prog.echoZeroDefeatedCount))
        : 0,
    lifetimeParries:
      typeof prog.lifetimeParries === 'number' && Number.isFinite(prog.lifetimeParries)
        ? Math.max(0, Math.floor(prog.lifetimeParries))
        : 0,
    lifetimeConvergences:
      typeof prog.lifetimeConvergences === 'number' && Number.isFinite(prog.lifetimeConvergences)
        ? Math.max(0, Math.floor(prog.lifetimeConvergences))
        : 0,
    mutators: normalizeChronoMutators(prog.mutators),
    bestSpeedrunSplits: normalizeSpeedrunSplits(prog.bestSpeedrunSplits),
    bestSpeedrunFullSec:
      typeof prog.bestSpeedrunFullSec === 'number' &&
      Number.isFinite(prog.bestSpeedrunFullSec) &&
      prog.bestSpeedrunFullSec > 0
        ? Math.round(prog.bestSpeedrunFullSec * 10) / 10
        : null,
    speedrunHudEnabled: Boolean(prog.speedrunHudEnabled),
    equippedModChipId: getWeaponModChipDefinition(prog.equippedModChipId)?.id ?? null,
    unlockedModChipIds: unlockedModChipIdsNorm,
    loadoutPresets: normalizeLoadoutPresets(
      prog.loadoutPresets,
      unlockedWeaponIdsNorm,
      purchasedUpgrades,
      rigNormalized.purchasedRigModules,
      unlockedModChipIdsNorm,
      bossCoreNorm.unlockedBossCores
    ),
    combatMastery: cloneCombatMasteryLedger(prog.combatMastery),
  };
}

export function cloneWeaponProgressionState(
  prog: WeaponProgressionState | undefined | null
): WeaponProgressionState {
  if (!prog) {
    return createInitialWeaponProgressionState();
  }
  const cloned = clonePersistedWeaponProgressionState(prog);
  return {
    ...cloned,
    unlockedWeaponIds: normalizeUnlockedWeaponIds(cloned.unlockedWeaponIds),
    overclockedUpgrades: [...cloned.overclockedUpgrades],
    awakenedUpgrades: [...cloned.awakenedUpgrades],
    purchasedRigModules: [...cloned.purchasedRigModules],
    equippedRigModules: { ...cloned.equippedRigModules },
    overclockedRigModules: [...cloned.overclockedRigModules],
    sentinelMode: cloned.sentinelMode,
    echoDoctrine: cloned.echoDoctrine,
    unlockedBossCores: [...cloned.unlockedBossCores],
    equippedBossCore: cloned.equippedBossCore,
    transcendedBossCores: [...cloned.transcendedBossCores],
    purchasedNeuralProtocols: [...cloned.purchasedNeuralProtocols],
    weaponMasteryXp: normalizeWeaponMasteryXpMap(cloned.weaponMasteryXp),
    bestRecursionLoop: cloned.bestRecursionLoop,
    totalRecursionClears: cloned.totalRecursionClears,
    bestGauntletTimeSec: cloned.bestGauntletTimeSec,
    totalGauntletClears: cloned.totalGauntletClears,
    overdriveDifficulty: cloned.overdriveDifficulty,
    ngPlusCycle: cloned.ngPlusCycle,
    unlockedVaultChapters: [...cloned.unlockedVaultChapters],
    equippedSkinId: cloned.equippedSkinId,
    unlockedAchievementIds: [...cloned.unlockedAchievementIds],
    paradoxEndingUnlocked: cloned.paradoxEndingUnlocked,
    echoZeroDefeatedCount: cloned.echoZeroDefeatedCount,
    lifetimeParries: cloned.lifetimeParries,
    lifetimeConvergences: cloned.lifetimeConvergences,
    mutators: { ...cloned.mutators },
    bestSpeedrunSplits: { ...cloned.bestSpeedrunSplits },
    bestSpeedrunFullSec: cloned.bestSpeedrunFullSec,
    speedrunHudEnabled: cloned.speedrunHudEnabled,
    equippedModChipId: cloned.equippedModChipId,
    unlockedModChipIds: [...cloned.unlockedModChipIds],
    loadoutPresets: cloneLoadoutPresets(cloned.loadoutPresets),
    combatMastery: cloneCombatMasteryLedger(cloned.combatMastery),
    lastPurchaseOutcome: prog.lastPurchaseOutcome ?? null,
    lastEquipOutcome: prog.lastEquipOutcome ?? null,
    lastActionMessage:
      prog.lastActionMessage ||
      'UPGRADE BENCH READY · EARN MEMORY FRAGMENTS IN CAMPAIGN MILESTONES',
  };
}

export function sanitizePersistedWeaponProgressionState(
  raw: unknown
): PersistedWeaponProgressionState {
  const fallback = clonePersistedWeaponProgressionState(null);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return fallback;
  }
  const obj = raw as Record<string, unknown>;
  const memoryFragments =
    typeof obj.memoryFragments === 'number' &&
    Number.isFinite(obj.memoryFragments) &&
    obj.memoryFragments >= 0
      ? Math.min(999, Math.floor(obj.memoryFragments))
      : 0;

  const claimedRewardIds: WeaponProgressionRewardId[] = [];
  if (Array.isArray(obj.claimedRewardIds)) {
    const len = Math.min(obj.claimedRewardIds.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < len; i++) {
      const id = obj.claimedRewardIds[i];
      if (isValidProgressionRewardId(id) && !claimedRewardIds.includes(id)) {
        claimedRewardIds.push(id);
      }
    }
  }

  const unlockedWeaponIds = normalizeUnlockedWeaponIds(obj.unlockedWeaponIds);
  // Also infer unlocked weapons from claimed boss rewards if saving from an older state
  if (
    (claimedRewardIds.includes('prologue_calibration_combine') ||
      claimedRewardIds.includes('prologue_bay_proxies_cleared') ||
      claimedRewardIds.includes('chapter_1_helix_defeated')) &&
    !unlockedWeaponIds.includes('phase_rail')
  ) {
    unlockedWeaponIds.push('phase_rail');
  }
  if (
    (claimedRewardIds.includes('chapter_1_helix_defeated') ||
      claimedRewardIds.includes('chapter_2_choir_defeated') ||
      claimedRewardIds.includes('chapter_3_curator_defeated') ||
      claimedRewardIds.includes('chapter_4_matron_defeated')) &&
    !unlockedWeaponIds.includes('grav_breaker')
  ) {
    unlockedWeaponIds.push('grav_breaker');
  }

  const purchasedUpgrades: WeaponUpgradeId[] = [];
  if (Array.isArray(obj.purchasedUpgrades)) {
    const len = Math.min(obj.purchasedUpgrades.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < len; i++) {
      const id = obj.purchasedUpgrades[i];
      if (isValidWeaponUpgradeId(id) && !purchasedUpgrades.includes(id)) {
        purchasedUpgrades.push(id);
      }
    }
  }

  const overclockedUpgrades: WeaponUpgradeId[] = [];
  if (Array.isArray(obj.overclockedUpgrades)) {
    const len = Math.min(obj.overclockedUpgrades.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < len; i++) {
      const id = obj.overclockedUpgrades[i];
      if (
        isValidWeaponUpgradeId(id) &&
        purchasedUpgrades.includes(id) &&
        !overclockedUpgrades.includes(id)
      ) {
        overclockedUpgrades.push(id);
      }
    }
  }

  const awakenedUpgrades: WeaponUpgradeId[] = [];
  if (Array.isArray(obj.awakenedUpgrades)) {
    const len = Math.min(obj.awakenedUpgrades.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < len; i++) {
      const id = obj.awakenedUpgrades[i];
      if (
        isValidWeaponUpgradeId(id) &&
        purchasedUpgrades.includes(id) &&
        overclockedUpgrades.includes(id) &&
        !awakenedUpgrades.includes(id)
      ) {
        awakenedUpgrades.push(id);
      }
    }
  }

  const equippedUpgrades: Record<WeaponId, WeaponUpgradeId | null> = {
    chrono_edge: null,
    pulsecaster: null,
    phase_rail: null,
    grav_breaker: null,
    chrono_scythe: null,
  };
  if (
    obj.equippedUpgrades &&
    typeof obj.equippedUpgrades === 'object' &&
    !Array.isArray(obj.equippedUpgrades)
  ) {
    const eqObj = obj.equippedUpgrades as Record<string, unknown>;
    for (let i = 0; i < VALID_WEAPON_IDS.length; i++) {
      const wId = VALID_WEAPON_IDS[i];
      const candidate = eqObj[wId];
      if (
        isValidWeaponUpgradeId(candidate) &&
        purchasedUpgrades.includes(candidate) &&
        getWeaponUpgradeDefinition(candidate).weaponId === wId
      ) {
        equippedUpgrades[wId] = candidate;
      }
    }
  }

  const rigNormalized = normalizeRigProgressionFields(
    obj.purchasedRigModules,
    obj.equippedRigModules
  );
  const overclockedRigModules: RigModuleId[] = [];
  if (Array.isArray(obj.overclockedRigModules)) {
    const len = Math.min(obj.overclockedRigModules.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < len; i++) {
      const id = obj.overclockedRigModules[i];
      if (
        isValidRigModuleId(id) &&
        rigNormalized.purchasedRigModules.includes(id) &&
        !overclockedRigModules.includes(id)
      ) {
        overclockedRigModules.push(id);
      }
    }
  }
  const sentinelMode = normalizeSentinelMode(obj.sentinelMode);
  const echoDoctrine = normalizeEchoDoctrineId(obj.echoDoctrine);

  const purchasedNeuralProtocols: NeuralProtocolId[] = [];
  if (Array.isArray(obj.purchasedNeuralProtocols)) {
    const len = Math.min(obj.purchasedNeuralProtocols.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < len; i++) {
      const id = obj.purchasedNeuralProtocols[i];
      if (isValidNeuralProtocolId(id) && !purchasedNeuralProtocols.includes(id)) {
        purchasedNeuralProtocols.push(id);
      }
    }
  }

  const weaponMasteryXp = normalizeWeaponMasteryXpMap(
    obj.weaponMasteryXp && typeof obj.weaponMasteryXp === 'object' && !Array.isArray(obj.weaponMasteryXp)
      ? (obj.weaponMasteryXp as Partial<Record<WeaponId, number>>)
      : null
  );
  const bestRecursionLoop =
    typeof obj.bestRecursionLoop === 'number' &&
    Number.isFinite(obj.bestRecursionLoop) &&
    obj.bestRecursionLoop >= 0
      ? Math.min(9999, Math.floor(obj.bestRecursionLoop))
      : 0;
  const totalRecursionClears =
    typeof obj.totalRecursionClears === 'number' &&
    Number.isFinite(obj.totalRecursionClears) &&
    obj.totalRecursionClears >= 0
      ? Math.min(99999, Math.floor(obj.totalRecursionClears))
      : 0;
  const bestGauntletTimeSec =
    typeof obj.bestGauntletTimeSec === 'number' &&
    Number.isFinite(obj.bestGauntletTimeSec) &&
    obj.bestGauntletTimeSec > 0
      ? Number(Math.min(99999, obj.bestGauntletTimeSec).toFixed(2))
      : null;
  const totalGauntletClears =
    typeof obj.totalGauntletClears === 'number' &&
    Number.isFinite(obj.totalGauntletClears) &&
    obj.totalGauntletClears >= 0
      ? Math.min(99999, Math.floor(obj.totalGauntletClears))
      : 0;
  const overdriveDifficulty =
    typeof obj.overdriveDifficulty === 'boolean' ? obj.overdriveDifficulty : false;
  const ngPlusCycle =
    typeof obj.ngPlusCycle === 'number' &&
    Number.isFinite(obj.ngPlusCycle) &&
    obj.ngPlusCycle >= 0
      ? Math.min(99, Math.floor(obj.ngPlusCycle))
      : 0;
  const unlockedVaultChapters: CampaignChapterId[] = [];
  if (Array.isArray(obj.unlockedVaultChapters)) {
    const len = Math.min(obj.unlockedVaultChapters.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < len; i++) {
      const ch = obj.unlockedVaultChapters[i];
      if (isValidCampaignChapterId(ch) && !unlockedVaultChapters.includes(ch)) {
        unlockedVaultChapters.push(ch);
      }
    }
  }

  const normalizedUnlockedWeapons = normalizeUnlockedWeaponIds(unlockedWeaponIds);
  const bossCoreSanitized = normalizeBossCoreProgression(
    obj.unlockedBossCores,
    obj.equippedBossCore,
    undefined,
    undefined,
    obj.transcendedBossCores
  );
  const sanitizedUnlockedModChips: import('./types.ts').WeaponModChipId[] = Array.isArray(
    obj.unlockedModChipIds
  )
    ? Array.from(
        new Set([
          'mod_volt_arc' as const,
          ...(obj.unlockedModChipIds as unknown[]).filter(
            (id): id is import('./types.ts').WeaponModChipId =>
              typeof id === 'string' &&
              Boolean(getWeaponModChipDefinition(id as import('./types.ts').WeaponModChipId))
          ),
        ])
      )
    : ['mod_volt_arc'];

  return {
    memoryFragments,
    claimedRewardIds,
    unlockedWeaponIds: normalizedUnlockedWeapons,
    purchasedUpgrades,
    equippedUpgrades,
    overclockedUpgrades,
    awakenedUpgrades,
    purchasedRigModules: rigNormalized.purchasedRigModules,
    equippedRigModules: rigNormalized.equippedRigModules,
    overclockedRigModules,
    sentinelMode,
    echoDoctrine,
    ...bossCoreSanitized,
    purchasedNeuralProtocols,
    weaponMasteryXp,
    bestRecursionLoop,
    totalRecursionClears,
    bestGauntletTimeSec,
    totalGauntletClears,
    overdriveDifficulty,
    ngPlusCycle,
    unlockedVaultChapters,
    equippedSkinId: normalizeSeraRigSkinId(obj.equippedSkinId),
    unlockedAchievementIds: normalizeAchievementIds(obj.unlockedAchievementIds),
    paradoxEndingUnlocked: Boolean(obj.paradoxEndingUnlocked),
    echoZeroDefeatedCount:
      typeof obj.echoZeroDefeatedCount === 'number' &&
      Number.isFinite(obj.echoZeroDefeatedCount) &&
      obj.echoZeroDefeatedCount >= 0
        ? Math.min(9999, Math.floor(obj.echoZeroDefeatedCount))
        : 0,
    lifetimeParries:
      typeof obj.lifetimeParries === 'number' &&
      Number.isFinite(obj.lifetimeParries) &&
      obj.lifetimeParries >= 0
        ? Math.min(999999, Math.floor(obj.lifetimeParries))
        : 0,
    lifetimeConvergences:
      typeof obj.lifetimeConvergences === 'number' &&
      Number.isFinite(obj.lifetimeConvergences) &&
      obj.lifetimeConvergences >= 0
        ? Math.min(999999, Math.floor(obj.lifetimeConvergences))
        : 0,
    mutators: normalizeChronoMutators(obj.mutators),
    bestSpeedrunSplits: normalizeSpeedrunSplits(obj.bestSpeedrunSplits),
    bestSpeedrunFullSec:
      typeof obj.bestSpeedrunFullSec === 'number' &&
      Number.isFinite(obj.bestSpeedrunFullSec) &&
      obj.bestSpeedrunFullSec > 0
        ? Math.round(Math.min(99999, obj.bestSpeedrunFullSec) * 10) / 10
        : null,
    speedrunHudEnabled: Boolean(obj.speedrunHudEnabled),
    equippedModChipId: getWeaponModChipDefinition(
      typeof obj.equippedModChipId === 'string'
        ? (obj.equippedModChipId as import('./types.ts').WeaponModChipId)
        : null
    )?.id ?? null,
    unlockedModChipIds: sanitizedUnlockedModChips,
    loadoutPresets: normalizeLoadoutPresets(
      obj.loadoutPresets,
      normalizedUnlockedWeapons,
      purchasedUpgrades,
      rigNormalized.purchasedRigModules,
      sanitizedUnlockedModChips,
      bossCoreSanitized.unlockedBossCores
    ),
    combatMastery: sanitizeCombatMasteryLedger(obj.combatMastery),
  };
}

export function getUnlockedWeaponIds(world: WorldState): WeaponId[] {
  if (world.run && world.run.mode !== 'campaign') {
    const base: WeaponId[] = ['chrono_edge', 'pulsecaster', 'phase_rail', 'grav_breaker'];
    if (
      world.ascension?.dailyTrialActive ||
      world.progression?.unlockedWeaponIds?.includes('chrono_scythe')
    ) {
      base.push('chrono_scythe');
    }
    return base;
  }
  return normalizeUnlockedWeaponIds(world.progression?.unlockedWeaponIds);
}

export function unlockPlayerWeapon(world: WorldState, weaponId: WeaponId): boolean {
  if (!isValidWeaponId(weaponId)) return false;
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const current = normalizeUnlockedWeaponIds(world.progression.unlockedWeaponIds);
  if (current.includes(weaponId)) {
    world.progression.unlockedWeaponIds = current;
    return false;
  }
  current.push(weaponId);
  world.progression.unlockedWeaponIds = normalizeUnlockedWeaponIds(current);
  const def = getWeaponDefinition(weaponId);
  world.progression.lastActionMessage = `ARSENAL UNLOCKED · ${def.name} (${def.roleLabel})`;
  world.events.push({
    type: 'weapon_unlocked',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    weaponId,
  });
  return true;
}

export function getEquippedWeaponUpgrade(
  world: WorldState,
  weaponId: WeaponId
): WeaponUpgradeId | null {
  const prog = world.progression;
  if (!prog || !prog.equippedUpgrades) return null;
  const candidate = prog.equippedUpgrades[weaponId] ?? null;
  if (
    candidate &&
    isValidWeaponUpgradeId(candidate) &&
    prog.purchasedUpgrades.includes(candidate) &&
    getWeaponUpgradeDefinition(candidate).weaponId === weaponId
  ) {
    return candidate;
  }
  return null;
}

export function getEquippedRigModules(
  world: WorldState
): Record<RigModuleSlot, RigModuleId | null> {
  const prog = world.progression;
  if (!prog) return createEmptyEquippedRigModules();
  return normalizeRigProgressionFields(
    prog.purchasedRigModules,
    prog.equippedRigModules
  ).equippedRigModules;
}

export function getPlayerRigModifiers(world: WorldState): RigEffectiveModifiers {
  const equipped = getEquippedRigModules(world);
  const isSurging = (world.player?.surgeTimer ?? 0) > 0;
  return computeEffectiveRigModifiers(
    equipped,
    isSurging,
    world.progression?.overclockedRigModules
  );
}

export function getPlayerRigSetSynergy(world: WorldState): RigSetSynergySummary {
  return computeRigSetSynergy(
    getEquippedRigModules(world),
    world.progression?.overclockedRigModules
  );
}

export function ensureChronoAegisState(
  world: WorldState
): import('./types.ts').ChronoAegisRuntimeState {
  if (!world.chronoAegis) {
    world.chronoAegis = createInitialChronoAegisState(
      normalizeSentinelMode(world.progression?.sentinelMode)
    );
  }
  return world.chronoAegis;
}

export function ensureChronoConfluenceState(
  world: WorldState
): import('./types.ts').ChronoConfluenceState {
  const sentinelMode = normalizeSentinelMode(world.progression?.sentinelMode);
  const equippedCore = world.progression?.equippedBossCore ?? null;
  const transcended = world.progression?.transcendedBossCores ?? [];
  if (!world.chronoConfluence) {
    world.chronoConfluence = createInitialChronoConfluenceState(
      sentinelMode,
      equippedCore,
      transcended,
      35
    );
  }
  const summary = computeSentinelCoreConfluence(sentinelMode, equippedCore, transcended);
  world.chronoConfluence.doctrineId = summary.doctrineId;
  world.chronoConfluence.isOmega = summary.isOmega;
  world.chronoConfluence.ready =
    summary.active &&
    world.chronoConfluence.cooldownTimer <= 0 &&
    world.chronoConfluence.charge >= 100;
  return world.chronoConfluence;
}

export function getPlayerProtocolModifiers(world: WorldState): NeuralProtocolModifiers {
  const purchased = world.progression?.purchasedNeuralProtocols ?? [];
  const flux = world.player?.flux ?? 0;
  const isSurging = (world.player?.surgeTimer ?? 0) > 0;
  return computeNeuralProtocolModifiers(purchased, flux, isSurging);
}

export function getEffectiveConvergenceFluxCost(world: WorldState): number {
  const baseCost = GAME_CONFIG.resonance.fluxCost;
  const weaponDelta =
    getEquippedWeaponUpgrade(world, 'chrono_edge') === 'edge_harmonic_conductor'
      ? GAME_CONFIG.weapons.upgrades.edge_harmonic_conductor.convergenceFluxCostDelta
      : 0;
  const rigDelta = getPlayerRigModifiers(world).convergenceFluxCostDelta;
  return Math.max(0, baseCost + weaponDelta + rigDelta);
}

export function getEffectiveConvergencePostureBonus(world: WorldState): number {
  const baseBonus = GAME_CONFIG.resonance.postureBonus;
  const edgeEquipped = getEquippedWeaponUpgrade(world, 'chrono_edge');
  if (edgeEquipped === 'edge_harmonic_conductor') {
    const overclockBonus = isUpgradeOverclocked(
      'edge_harmonic_conductor',
      world.progression?.overclockedUpgrades
    )
      ? 6
      : 0;
    return (
      baseBonus +
      GAME_CONFIG.weapons.upgrades.edge_harmonic_conductor.convergencePostureBonus +
      overclockBonus
    );
  }
  return baseBonus;
}

export function syncResonanceUpgradeParameters(world: WorldState): void {
  if (!world.resonance) return;
  world.resonance.fluxCost = getEffectiveConvergenceFluxCost(world);
  world.resonance.postureBonus = getEffectiveConvergencePostureBonus(world);
  if (!world.resonance.activeMark) {
    const rigMods = getPlayerRigModifiers(world);
    const hasHarmonic =
      getEquippedWeaponUpgrade(world, 'chrono_edge') === 'edge_harmonic_conductor';
    const harmonicOverclock =
      hasHarmonic &&
      isUpgradeOverclocked(
        'edge_harmonic_conductor',
        world.progression?.overclockedUpgrades
      )
        ? 0.5
        : 0;
    world.resonance.syncWindow =
      GAME_CONFIG.resonance.syncWindow +
      rigMods.echoSyncWindowBonus +
      (hasHarmonic
        ? GAME_CONFIG.weapons.upgrades.edge_harmonic_conductor.syncWindowBonus
        : 0) +
      harmonicOverclock;
  }
}

export function syncUnlockedBossCoresFromCampaign(world: WorldState): void {
  if (!world || !world.progression) return;
  const normalized = normalizeBossCoreProgression(
    world.progression.unlockedBossCores,
    world.progression.equippedBossCore,
    world.run?.completedChapters,
    world.run?.completedEndings,
    world.progression.transcendedBossCores
  );
  world.progression.unlockedBossCores = normalized.unlockedBossCores;
  world.progression.equippedBossCore = normalized.equippedBossCore;
  world.progression.transcendedBossCores = normalized.transcendedBossCores;
}

export function syncPlayerRigStats(world: WorldState): void {
  if (!world) return;
  syncUnlockedBossCoresFromCampaign(world);
  const rigMods = getPlayerRigModifiers(world);
  const rigSynergy = getPlayerRigSetSynergy(world);
  const bossCoreMods = computeBossCoreModifiers(
    world.progression?.equippedBossCore,
    world.progression?.transcendedBossCores
  );
  const confluence = computeSentinelCoreConfluence(
    normalizeSentinelMode(world.progression?.sentinelMode),
    world.progression?.equippedBossCore,
    world.progression?.transcendedBossCores
  );
  const protocolMods = getPlayerProtocolModifiers(world);
  const recMods = getActiveRecursionModifiers(world);
  const stanceMods = computeStanceDoctrineModifiers(
    world.exploration?.resolvedStoryChoices
  );
  if (world.player) {
    const prevMax = world.player.maxIntegrity || GAME_CONFIG.player.maxIntegrity;
    const nextMax =
      GAME_CONFIG.player.maxIntegrity +
      rigMods.maxIntegrityBonus +
      recMods.maxIntegrityBonus +
      stanceMods.maxIntegrityBonus;
    world.player.maxIntegrity = nextMax;
    if (nextMax > prevMax && world.player.actionState !== 'dead' && world.player.integrity > 0) {
      const gained = nextMax - prevMax;
      world.player.integrity = Math.min(nextMax, world.player.integrity + gained);
      world.player.ghostIntegrity = Math.max(world.player.ghostIntegrity, world.player.integrity);
    } else if (world.player.integrity > nextMax) {
      world.player.integrity = nextMax;
      world.player.ghostIntegrity = Math.min(world.player.ghostIntegrity, nextMax);
    }

    const nextMaxFlux = GAME_CONFIG.player.maxFlux + protocolMods.maxFluxBonus;
    world.player.maxFlux = nextMaxFlux;
    if (world.player.flux > nextMaxFlux) {
      world.player.flux = nextMaxFlux;
    }
  }
  if (world.echo) {
    world.echo.maxDuration = GAME_CONFIG.echo.maxDuration + rigMods.echoMaxDurationBonus;
  }
  const combinedSkillFluxMult =
    rigSynergy.skillFluxCostMultiplier * confluence.skillFluxCostMultiplier;
  if (world.relay) {
    world.relay.fluxCost = Math.max(
      0,
      Math.round(
        (GAME_CONFIG.relay.fluxCost + rigMods.relayFluxCostDelta) * combinedSkillFluxMult
      )
    );
    world.relay.maxCooldown = Math.max(
      0.2,
      Number((GAME_CONFIG.relay.cooldown + rigMods.relayCooldownDelta).toFixed(3))
    );
  }
  if (world.gravityPin) {
    world.gravityPin.fluxCost = Math.max(
      0,
      Math.round(GAME_CONFIG.curator.gravityPin.fluxCost * combinedSkillFluxMult)
    );
  }
  if (world.echoCollapse) {
    world.echoCollapse.fluxCost = Math.max(
      0,
      Math.round(GAME_CONFIG.matron.echoCollapse.fluxCost * combinedSkillFluxMult)
    );
  }
  const holoResonance = computeHoloMemoryResonanceBonus(
    world.exploration?.discoveredHoloMemoryIds
  );
  const masterySeal = computeMasterySealModifiers(world.progression?.combatMastery);
  const aegis = ensureChronoAegisState(world);
  syncChronoAegisMaxWard(
    aegis,
    normalizeSentinelMode(world.progression?.sentinelMode),
    rigSynergy,
    true,
    bossCoreMods.bonusWard +
      confluence.bonusWard +
      holoResonance.bonusMaxWard +
      masterySeal.bonusMaxWard
  );
  ensureChronoConfluenceState(world);
  syncResonanceUpgradeParameters(world);
}

export function claimMasteryBountyInWorld(
  world: WorldState,
  targetId: import('./types.ts').MasteryTargetId,
  kind: import('./types.ts').MasteryBountyKind
): boolean {
  if (!world) return false;
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const res = claimCombatMasteryBounty(world.progression.combatMastery, targetId, kind);
  if (!res.claimed || res.fragmentsAwarded <= 0) {
    return false;
  }
  world.progression.combatMastery = res.ledger;
  world.progression.memoryFragments = Math.min(
    999,
    world.progression.memoryFragments + res.fragmentsAwarded
  );
  const seal = computeMasterySealModifiers(world.progression.combatMastery);
  world.progression.lastActionMessage = `MASTERY BOUNTY CLAIMED · +${res.fragmentsAwarded} MEMORY FRAGMENT · ${seal.titleEn}`;
  syncPlayerRigStats(world);
  if (world.player) {
    world.events.push({
      type: 'mastery_bounty_claimed',
      x: world.player.x,
      z: world.player.z,
      amount: res.fragmentsAwarded,
    });
  }
  return true;
}

export function claimAllMasteryBountiesInWorld(world: WorldState): number {
  if (!world) return 0;
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const res = claimAllReadyMasteryBounties(world.progression.combatMastery);
  if (res.claimedCount <= 0 || res.fragmentsAwarded <= 0) {
    return 0;
  }
  world.progression.combatMastery = res.ledger;
  world.progression.memoryFragments = Math.min(
    999,
    world.progression.memoryFragments + res.fragmentsAwarded
  );
  const seal = computeMasterySealModifiers(world.progression.combatMastery);
  world.progression.lastActionMessage = `CLAIMED ${res.claimedCount} MASTERY BOUNTIES · +${res.fragmentsAwarded} MEMORY FRAGMENTS · ${seal.titleEn}`;
  syncPlayerRigStats(world);
  if (world.player) {
    world.events.push({
      type: 'mastery_bounty_claimed',
      x: world.player.x,
      z: world.player.z,
      amount: res.fragmentsAwarded,
    });
  }
  return res.claimedCount;
}

function recordWorldCombatMasteryOnVictory(
  world: WorldState,
  targetIds: readonly import('./types.ts').MasteryTargetId[]
): void {
  if (!world || targetIds.length === 0) return;
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const baseSummary = buildRunSummary(world);
  const cp = world.run?.bossCheckpoint;
  const isBossSegment = world.encounterMode === 'boss' && Boolean(cp);
  const segmentSummary: RunSummary = {
    ...baseSummary,
    outcome: 'victory',
    elapsedTime: isBossSegment
      ? Math.max(0, world.elapsedTime - (cp?.elapsedTimeAtCheckpoint ?? 0))
      : baseSummary.elapsedTime,
    damageTaken: isBossSegment
      ? Math.max(0, Math.round(world.stats.damageTaken - (cp?.statsAtCheckpoint.damageTaken ?? 0)))
      : baseSummary.damageTaken,
    parriesLanded: isBossSegment
      ? Math.max(0, world.stats.parriesLanded - (cp?.statsAtCheckpoint.parriesLanded ?? 0))
      : baseSummary.parriesLanded,
    vulnerableHits: isBossSegment
      ? Math.max(0, world.stats.vulnerableHits - (cp?.statsAtCheckpoint.vulnerableHits ?? 0))
      : baseSummary.vulnerableHits,
    convergencesTriggered: isBossSegment
      ? Math.max(
          0,
          world.resonance.convergenceCount - (cp?.statsAtCheckpoint.convergencesTriggered ?? 0)
        )
      : baseSummary.convergencesTriggered,
    relaysUsed: isBossSegment
      ? Math.max(0, world.relay.activationCount - (cp?.statsAtCheckpoint.relaysUsed ?? 0))
      : baseSummary.relaysUsed,
  };
  const outcome = recordCombatMasteryVictory(
    world.progression.combatMastery,
    targetIds,
    segmentSummary
  );
  world.progression.combatMastery = outcome.ledger;
}

export function createInitialRecursionState(
  bestLoopReached = 0,
  totalClears = 0
): RecursionRunState {
  return {
    active: true,
    loopIndex: 1,
    bestLoopReached: Math.max(0, Math.floor(bestLoopReached)),
    totalClears: Math.max(0, Math.floor(totalClears)),
    awaitingRelicDraft: false,
    draftOptions: [],
    relicStacks: {},
    enemiesPerLoopTotal: 0,
    isWardenSurge: false,
  };
}

export function getActiveRecursionModifiers(world: WorldState): RecursionModifierSummary {
  if (world?.run?.mode === 'recursion' && world.recursion?.active) {
    return computeRecursionModifierSummary(world.recursion.relicStacks);
  }
  return computeRecursionModifierSummary(null);
}

export function getActiveWeaponMasteryInfo(
  world: WorldState,
  weaponId?: WeaponId
): WeaponMasteryRankInfo {
  const id = weaponId ?? world?.player?.equippedWeaponId ?? 'chrono_edge';
  const xp = world?.progression?.weaponMasteryXp?.[id] ?? 0;
  return computeWeaponMasteryRankInfo(xp);
}

export function awardWeaponMasteryXp(
  world: WorldState,
  weaponId: WeaponId,
  amount: number
): WeaponMasteryRankInfo {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const map = normalizeWeaponMasteryXpMap(world.progression.weaponMasteryXp);
  const gain = Math.max(0, Math.floor(amount));
  if (gain > 0) {
    map[weaponId] = Math.min(999999, (map[weaponId] ?? 0) + gain);
  }
  world.progression.weaponMasteryXp = map;
  return computeWeaponMasteryRankInfo(map[weaponId] ?? 0);
}

export function setDifficultyTier(
  world: WorldState,
  tier: import('./types.ts').DifficultyTierId
): import('./types.ts').DifficultyTierId {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  world.progression.difficultyTier = tier;
  world.progression.overdriveDifficulty = tier === 'singularity';
  const spec = getDifficultySpec(tier);
  world.progression.lastActionMessage = `DIFFICULTY: ${spec.labelEn} · ${spec.subtitleEn}`;
  return tier;
}

export function setOverdriveDifficulty(world: WorldState, enabled: boolean): boolean {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  world.progression.overdriveDifficulty = Boolean(enabled);
  world.progression.difficultyTier = enabled ? 'singularity' : 'standard';
  world.progression.lastActionMessage = world.progression.overdriveDifficulty
    ? 'OVERDRIVE PROTOCOL ENGAGED · +30% HOSTILE HP + BOSS PHASE II ESCORT'
    : 'OVERDRIVE PROTOCOL DISENGAGED · STANDARD CONTAINMENT SCALING';
  return world.progression.overdriveDifficulty;
}

export function applyOverdriveToEnemies(
  world: WorldState,
  enemies: EnemyState[],
  boss?: BossState | null
): void {
  const diffTier = world?.progression?.difficultyTier;
  const diffHpMult = diffTier
    ? getDifficultySpec(diffTier).enemyHpMult
    : world?.progression?.overdriveDifficulty
      ? 1.3
      : 1;
  const ngPlusMult = getNgPlusModifiers(world?.progression?.ngPlusCycle ?? 0).enemyHpMultiplier;
  const totalMult = diffHpMult * ngPlusMult;
  if (totalMult <= 1) return;
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (e.maxHp > 0) {
      e.maxHp = Math.round(e.maxHp * totalMult);
      e.hp = Math.round(e.hp * totalMult);
      e.ghostHp = e.hp;
    }
  }
  if (boss && boss.maxHp > 0) {
    boss.maxHp = Math.round(boss.maxHp * totalMult);
    boss.hp = Math.round(boss.hp * totalMult);
    boss.ghostHp = boss.hp;
  }
}

export function sealTemporalRift(world: WorldState): boolean {
  const rift = world?.temporalRift;
  const p = world?.player;
  if (!rift || !p || p.actionState === 'dead') {
    return false;
  }
  const protocolMods = getPlayerProtocolModifiers(world);
  p.flux = Math.min(p.maxFlux, p.flux + 28);
  p.integrity = Math.min(p.maxIntegrity, p.integrity + 12);
  p.ghostIntegrity = Math.max(p.ghostIntegrity, p.integrity);
  p.surgeTimer = Math.max(p.surgeTimer ?? 0, 2.0 * protocolMods.surgeDurationMultiplier);

  for (let i = 0; i < world.enemies.length; i++) {
    const e = world.enemies[i];
    if (e.hp <= 0 || e.aiState === 'ko') continue;
    if (Math.hypot(e.x - rift.x, e.z - rift.z) <= 5.5 + e.radius) {
      e.stagger = Math.min(e.maxStagger, e.stagger + 22);
      e.hitFlashTimer = Math.max(e.hitFlashTimer, 0.22);
      if (world.boss && world.boss.id === e.id) {
        world.boss.stagger = e.stagger;
        world.boss.hitFlashTimer = e.hitFlashTimer;
      }
    }
  }

  world.events.push({
    type: 'temporal_rift_sealed',
    x: rift.x,
    z: rift.z,
    amount: 28,
  });

  world.temporalRift = null;
  world.riftCooldownTimer = 22.0;
  if (world.run) {
    world.run.checkpointNotice = 'TEMPORAL RIFT SEALED · +28 FLUX · +12 INTEGRITY · 2.0s SURGE';
    world.run.checkpointNoticeTimer = Math.max(world.run.checkpointNoticeTimer, 3.6);
  }
  return true;
}

export function advanceTemporalRiftSystem(world: WorldState, dt: number): void {
  if (!world || world.appState !== 'playing' || world.outcome !== 'none') return;
  if (world.recursion?.awaitingRelicDraft) return;
  if (world.run?.chapter === 'chapter_5_loom' && world.run?.stage === 'chronicle_loom') {
    return;
  }

  const p = world.player;
  const rift = world.temporalRift ?? null;
  if (rift) {
    if (p && p.actionState !== 'dead') {
      const dist = Math.hypot(p.x - rift.x, p.z - rift.z);
      if (dist <= rift.radius) {
        sealTemporalRift(world);
        return;
      }
    }
    rift.remainingTimer = Math.max(0, rift.remainingTimer - dt);
    if (rift.remainingTimer <= 0) {
      for (let i = 0; i < world.enemies.length; i++) {
        const e = world.enemies[i];
        if (e.hp <= 0 || e.aiState === 'ko' || e.isDecoy) continue;
        e.hp = Math.min(e.maxHp, e.hp + 18);
        e.ghostHp = Math.max(e.ghostHp, e.hp);
        e.stagger = Math.max(0, e.stagger - 15);
        if (world.boss && world.boss.id === e.id) {
          world.boss.hp = e.hp;
          world.boss.ghostHp = e.ghostHp;
          world.boss.stagger = e.stagger;
        }
      }
      world.events.push({
        type: 'temporal_rift_ruptured',
        x: rift.x,
        z: rift.z,
        amount: 18,
      });
      world.temporalRift = null;
      world.riftCooldownTimer = 22.0;
      if (world.run) {
        world.run.checkpointNotice = 'TEMPORAL RIFT RUPTURED · HOSTILE INTEGRITY SURGE (+18 HP)';
        world.run.checkpointNoticeTimer = Math.max(world.run.checkpointNoticeTimer, 3.6);
      }
    }
    return;
  }

  const nextCooldown = (world.riftCooldownTimer ?? 7.5) - dt;
  if (nextCooldown > 0) {
    world.riftCooldownTimer = nextCooldown;
    return;
  }

  const seq = world.riftSpawnSeq ?? 1;
  world.riftSpawnSeq = seq + 1;
  world.riftCooldownTimer = 22.0;
  const pos = computeTemporalRiftSpawnPosition(
    world.run?.chapter ?? 'prologue',
    seq,
    p?.x ?? 0,
    p?.z ?? 0,
    world.obstacles ?? []
  );
  world.temporalRift = {
    id: `rift-${seq}`,
    x: pos.x,
    z: pos.z,
    radius: 2.4,
    remainingTimer: 12.0,
    maxDuration: 12.0,
    label: 'TEMPORAL ANOMALY RIFT',
  };
  world.events.push({
    type: 'temporal_rift_spawned',
    x: pos.x,
    z: pos.z,
  });
}

function spawnRecursionLoopArena(world: WorldState, loopIndex: number): void {
  const sector = pickNextRecursionSector(loopIndex);
  const isWardenSurge = loopIndex % 3 === 0;
  const hpScale = 1 + Math.max(0, loopIndex - 1) * 0.12;
  const obstacles = buildObstaclesForChapter(sector, isWardenSurge);

  world.projectiles = [];
  world.fluxPools = [];
  world.artilleryZones = [];
  world.temporalRift = null;
  world.riftCooldownTimer = 7.5;
  world.obstacles = obstacles;
  world.boostPads = createInitialBoostPads();
  world.fragmentCaches = buildFragmentCachesForChapter(
    sector,
    world.progression?.claimedRewardIds ?? []
  );
  world.sectorBeacons = buildSectorBeaconsForChapter(sector);
  world.resonance.activeMark = null;
  if (world.resonance.status === 'primed') {
    world.resonance.status = 'idle';
  }

  world.player.x = 0;
  world.player.z = 5.2;
  world.player.vx = 0;
  world.player.vz = 0;
  world.player.rotationY = Math.PI;
  world.run.chapter = sector;
  world.gravityPin = createInitialGravityPinState(true);
  world.echoCollapse = createInitialEchoCollapseState(true);
  world.loom = createInitialChronicleLoomState(false);

  const enemies: EnemyState[] = [];
  if (isWardenSurge) {
    const surgeBosses: readonly BossId[] = [
      'helix-04',
      'the-choir',
      'the-curator',
      'matron-v',
      'warden-prime',
    ];
    const bossId = surgeBosses[(Math.floor(loopIndex / 3) - 1) % surgeBosses.length];
    const boss = createBossStateForId(bossId, true);
    boss.maxHp = Math.round(boss.maxHp * hpScale);
    boss.hp = boss.maxHp;
    boss.ghostHp = boss.maxHp;
    const archetypeForBoss: EnemyArchetype =
      bossId === 'the-choir'
        ? 'choir'
        : bossId === 'the-curator'
          ? 'curator'
          : bossId === 'matron-v'
            ? 'matron'
            : bossId === 'warden-prime'
              ? 'warden_prime'
              : 'helix';
    const bossEnemy = createEnemy(boss.id, archetypeForBoss, boss.x, boss.z, boss.rotationY);
    bossEnemy.hp = boss.hp;
    bossEnemy.maxHp = boss.maxHp;
    bossEnemy.ghostHp = boss.maxHp;
    bossEnemy.stagger = 0;
    bossEnemy.maxStagger = boss.maxStagger;
    bossEnemy.radius = boss.radius;
    bossEnemy.aiState = 'pursue';
    bossEnemy.cooldownTimer = boss.cooldownTimer;
    enemies.push(bossEnemy);

    world.choir = createInitialChoirState(bossId === 'the-choir');
    world.curator = createInitialCuratorState(bossId === 'the-curator' || bossId === 'warden-prime');
    world.matron = createInitialMatronState(bossId === 'matron-v' || bossId === 'warden-prime');
    if (bossId === 'the-curator') {
      for (let i = 0; i < GAME_CONFIG.curator.decoySpawnPositions.length; i++) {
        const sp = GAME_CONFIG.curator.decoySpawnPositions[i];
        const decoyId = `curator-decoy-${i + 1}`;
        const decoy = createEnemy(decoyId, 'curator_decoy', sp.x, sp.z, 0);
        decoy.isDecoy = true;
        decoy.decoySignature = sp.signature;
        decoy.cooldownTimer = 0.8 + i * 0.35;
        decoy.maxHp = Math.round(decoy.maxHp * hpScale);
        decoy.hp = decoy.maxHp;
        decoy.ghostHp = decoy.maxHp;
        enemies.push(decoy);
        world.curator.decoyIds.push(decoyId);
      }
    } else if (bossId === 'matron-v') {
      const siphon = createEnemy(`rec-siphon-${loopIndex}`, 'siphon', -4.8, -1.6, 0.25);
      siphon.maxHp = Math.round(siphon.maxHp * hpScale);
      siphon.hp = siphon.maxHp;
      siphon.ghostHp = siphon.maxHp;
      enemies.push(siphon);
    }
    world.boss = boss;
    world.encounterMode = 'boss';
    world.run.stage = 'boss_fight';
  } else {
    world.boss = null;
    world.choir = createInitialChoirState(false);
    world.curator = createInitialCuratorState(false);
    world.matron = createInitialMatronState(false);
    world.encounterMode = 'standard';
    world.run.stage = 'calibration';

    const pool: readonly EnemyArchetype[] = [
      'bastion',
      'scrapper',
      'scout',
      'null_weaver',
      'aegis_sentinel',
      'siphon',
      'eraser',
      'phase_stalker',
      'chrono_mortar',
      'resonance_warden',
    ];
    const eliteAffixes: readonly EnemyModifierId[] = [
      'overclocked',
      'phase_shielded',
      'volatile',
    ];
    const count = 2 + Math.min(3, Math.floor((loopIndex + 1) / 2));
    for (let i = 0; i < count; i++) {
      const arch = pool[(loopIndex * 2 + i * 3) % pool.length];
      const spread = (i - (count - 1) * 0.5) * 4.2;
      const sx = Math.max(-10, Math.min(10, spread));
      const sz = -4.2 + (i % 2) * 2.2;
      const enemy = createEnemy(`rec-loop-${loopIndex}-unit-${i + 1}`, arch, sx, sz, i % 2 === 0 ? 0.2 : -0.2);
      enemy.maxHp = Math.round(enemy.maxHp * hpScale);
      enemy.hp = enemy.maxHp;
      enemy.ghostHp = enemy.maxHp;
      if (loopIndex >= 2 && i < (loopIndex >= 4 ? 2 : 1)) {
        const affix = eliteAffixes[(loopIndex + i) % eliteAffixes.length];
        applyEnemyModifier(enemy, affix);
      }
      const validation = validateEncounterSpawnPoint(
        enemy.x,
        enemy.z,
        enemy.radius,
        obstacles,
        GAME_CONFIG.arena.radius,
        world.player.x,
        world.player.z,
        GAME_CONFIG.player.radius
      );
      if (!validation.valid) {
        resolveCircleObstacleCollisions(enemy, obstacles, GAME_CONFIG.arena.radius - 0.8);
      }
      enemies.push(enemy);
    }
  }

  world.enemies = enemies;
  applyOverdriveToEnemies(world, world.enemies, world.boss);
  if (world.recursion) {
    world.recursion.isWardenSurge = isWardenSurge;
    world.recursion.enemiesPerLoopTotal = world.enemies.length;
  }

  world.exploration = createInitialExplorationState(sector, null);
  syncUnlockedRoutesToObstacles(world);
  syncPlayerRigStats(world);

  world.run.checkpointNotice = isWardenSurge
    ? `RECURSION LOOP ${loopIndex} · WARDEN BOSS SURGE (${world.boss?.name ?? 'WARDEN'})`
    : `RECURSION LOOP ${loopIndex} · ${world.enemies.length} HOSTILES DEPLOYED`;
  world.run.checkpointNoticeTimer = 4.5;
}

export function startRecursionProtocol(world: WorldState, startLoop = 1): void {
  const preserveTutorialEnabled = world.tutorial ? world.tutorial.enabled : true;
  const savedSnap = captureSavedCampaignSnapshotIfNeeded(world);
  const preservedUnlocked = world.run?.unlockedChapters
    ? [...world.run.unlockedChapters]
    : (['prologue'] as CampaignChapterId[]);
  const preservedCompleted = world.run?.completedChapters
    ? [...world.run.completedChapters]
    : ([] as CampaignChapterId[]);
  const preservedRecoveredLogs = world.run?.recoveredLogs ? [...world.run.recoveredLogs] : [];
  const preservedCompletedEndings = world.run?.completedEndings
    ? [...world.run.completedEndings]
    : [];
  const preservedProgression = cloneWeaponProgressionState(world.progression);
  const preservedWeaponId: WeaponId =
    world.player && isValidWeaponId(world.player.equippedWeaponId)
      ? world.player.equippedWeaponId
      : GAME_CONFIG.weapons.defaultWeaponId;

  const fresh = createInitialWorld('playing');
  world.appState = 'playing';
  world.outcome = 'none';
  world.outcomeDelayTimer = 0;
  world.elapsedTime = 0;
  world.hitstopTimer = 0;
  world.cameraTrauma = 0;
  world.player = fresh.player;
  world.player.equippedWeaponId = preservedWeaponId;
  world.echo = fresh.echo;
  world.relay = fresh.relay;
  world.resonance = fresh.resonance;
  world.pressurePlate = fresh.pressurePlate;
  world.puzzle = fresh.puzzle;
  world.comms = createInitialNarrativeCommsState();
  world.progression = preservedProgression;
  world.activeStoryBlessing = null;
  world.expedition = createInitialExpeditionState('prologue', false, 'combat');
  world.run = {
    ...createInitialRunState('recursion', 'calibration', pickNextRecursionSector(startLoop)),
    unlockedChapters: preservedUnlocked,
    completedChapters: preservedCompleted,
    recoveredLogs: preservedRecoveredLogs,
    completedEndings: preservedCompletedEndings,
    savedCampaignSnapshot: savedSnap,
  };
  world.tutorial = createInitialTutorialState(preserveTutorialEnabled, 'boss_counterplay');
  world.recursion = {
    ...createInitialRecursionState(
      preservedProgression.bestRecursionLoop ?? 0,
      preservedProgression.totalRecursionClears ?? 0
    ),
    loopIndex: Math.max(1, Math.floor(startLoop)),
  };
  world.overdrive = createInitialChronoOverdriveState(30);
  world.gauntlet = null;
  world.encounter = createInitialEncounterRuntimeState('prologue_calibration_bay');
  world.stats = fresh.stats;
  world.frozenSummary = null;
  world.events = [];

  spawnRecursionLoopArena(world, world.recursion.loopIndex);
  advanceMissionAndExplorationSystem(world);
}

export function grantOverdriveCharge(world: WorldState, amount: number): boolean {
  if (!world || !Number.isFinite(amount) || amount <= 0) return false;
  if (!world.overdrive) {
    world.overdrive = createInitialChronoOverdriveState(25);
  }
  const prev = world.overdrive.charge;
  world.overdrive = addOverdriveCharge(world.overdrive, amount);
  return world.overdrive.charge !== prev;
}

export function attemptActivateChronoOverdrive(world: WorldState): boolean {
  if (!world || !world.player) return false;
  if (!world.overdrive) {
    world.overdrive = createInitialChronoOverdriveState(25);
  }
  const res = activateChronoOverdrive(
    world.overdrive,
    world.player.actionState === 'dead' || world.player.integrity <= 0
  );
  world.overdrive = res.state;
  if (!res.activated) return false;

  // Immediate tactile burst: brief invulnerability, purge weapon overheat, camera shock
  world.player.invulnTimer = Math.max(world.player.invulnTimer, 0.35);
  world.player.weaponHeat = 0;
  world.player.weaponOverheated = false;
  world.player.weaponOverheatTimer = 0;
  world.hitstopTimer = Math.max(world.hitstopTimer, 0.055);
  world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.52);
  world.events.push({
    type: 'chrono_overdrive_activated',
    x: world.player.x,
    z: world.player.z,
    amount: world.overdrive.maxDuration,
  });
  const odCoreSpec = computeBossCoreModifiers(
    world.progression?.equippedBossCore,
    world.progression?.transcendedBossCores
  ).spec;
  if (odCoreSpec && odCoreSpec.overdriveNovaRadius > 0) {
    applyBossCoreRadialPulse(
      world,
      world.player.x,
      world.player.z,
      odCoreSpec.overdriveNovaRadius,
      odCoreSpec.overdriveNovaDamage,
      odCoreSpec.overdriveNovaStagger
    );
  }
  return true;
}

export function startBossGauntletRun(
  world: WorldState,
  skipIntro = false
): void {
  const preservedBest = world.progression?.bestGauntletTimeSec ?? null;
  const preservedClears = world.progression?.totalGauntletClears ?? 0;
  const firstStage = getGauntletStageSpec(0);

  startBossEncounter(world, skipIntro, firstStage.bossId);
  world.run.mode = 'boss_gauntlet';
  world.run.chapter = firstStage.chapter;
  world.gauntlet = createInitialBossGauntletState(preservedBest, preservedClears);
  world.overdrive = createInitialChronoOverdriveState(50);

  // Full Chrono Rig combat suite unlocked for the 5-Boss Sovereign Trial (all 5 weapons)
  world.gravityPin.unlocked = true;
  world.echoCollapse.unlocked = true;
  if (world.progression && !world.progression.unlockedWeaponIds.includes('chrono_scythe')) {
    world.progression.unlockedWeaponIds = [
      ...world.progression.unlockedWeaponIds,
      'chrono_scythe',
    ];
  }
  world.run.checkpointNotice =
    'SOVEREIGN GAUNTLET INITIATED // DISMANTLE ALL 5 WARDENS IN SEQUENCE';
  world.run.checkpointNoticeTimer = 4.5;
  advanceMissionAndExplorationSystem(world);
}

function advanceBossGauntletAfterDefeat(
  world: WorldState,
  defeatedBossX: number,
  defeatedBossZ: number,
  bossPhase: 1 | 2
): void {
  const g = world.gauntlet;
  if (!g || !g.active) return;

  const res = advanceBossGauntletStage(g, world.elapsedTime);
  world.gauntlet = res.state;

  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  world.progression.memoryFragments += res.refitRewards.memoryFragments;

  if (res.completedAll || !res.nextStage) {
    world.progression.totalGauntletClears = res.state.totalGauntletClears;
    world.progression.bestGauntletTimeSec = res.state.bestClearTimeSec;
    unlockChronoAchievement(world, 'gauntlet_champion');
    if (hasAnyActiveMutator(world.paradox?.mutators)) {
      unlockChronoAchievement(world, 'mutator_daredevil');
    }
    world.outcome = 'victory';
    world.run.stage = 'completed';
    world.outcomeDelayTimer = 0.5;
    world.run.checkpointNotice = res.state.refitBannerText;
    world.run.checkpointNoticeTimer = 5.5;
    advanceMissionAndExplorationSystem(world);
    world.frozenSummary = buildRunSummary(world);
    clearEchoState(world, 'outcome');
    world.events.push({
      type: 'boss_defeated',
      x: defeatedBossX,
      z: defeatedBossZ,
      enemyId: g.currentBossId,
      bossPhase,
    });
    world.events.push({
      type: 'gauntlet_victory',
      x: world.player.x,
      z: world.player.z,
      amount: res.state.totalElapsedTime,
    });
    world.events.push({
      type: 'encounter_victory',
      x: world.player.x,
      z: world.player.z,
    });
    return;
  }

  // Carry over cumulative run state + Field Refit into the next Boss Sector
  const nextStage = res.nextStage;
  const carriedElapsed = world.elapsedTime;
  const carriedStats = { ...world.stats };
  const carriedWeapon = world.player.equippedWeaponId;
  const carriedIntegrity = Math.min(
    world.player.maxIntegrity,
    Math.max(1, world.player.integrity) + res.refitRewards.integrityHeal
  );
  const carriedFlux = Math.min(
    world.player.maxFlux,
    world.player.flux + res.refitRewards.fluxGain
  );
  const carriedOverdrive = addOverdriveCharge(
    {
      ...world.overdrive,
      active: false,
      remainingTimer: 0,
    },
    res.refitRewards.overdriveCharge
  );
  const nextGauntletState = res.state;

  startBossEncounter(world, true, nextStage.bossId);
  world.run.mode = 'boss_gauntlet';
  world.run.chapter = nextStage.chapter;
  world.elapsedTime = carriedElapsed;
  world.stats = carriedStats;
  world.gauntlet = nextGauntletState;
  world.overdrive = carriedOverdrive;
  world.player.equippedWeaponId = carriedWeapon;
  world.player.integrity = Math.min(world.player.maxIntegrity, carriedIntegrity);
  world.player.ghostIntegrity = world.player.integrity;
  world.player.flux = Math.min(world.player.maxFlux, carriedFlux);
  world.gravityPin.unlocked = true;
  world.echoCollapse.unlocked = true;
  world.run.checkpointNotice = nextGauntletState.refitBannerText;
  world.run.checkpointNoticeTimer = 4.2;
  advanceMissionAndExplorationSystem(world);

  world.events.push({
    type: 'boss_defeated',
    x: defeatedBossX,
    z: defeatedBossZ,
    enemyId: g.currentBossId,
    bossPhase,
  });
  world.events.push({
    type: 'gauntlet_stage_cleared',
    x: world.player.x,
    z: world.player.z,
    amount: nextStage.index,
  });
}

export function completeRecursionLoopAndOpenDraft(world: WorldState): boolean {
  if (!world || world.run?.mode !== 'recursion' || !world.recursion?.active) {
    return false;
  }
  const rec = world.recursion;
  if (rec.awaitingRelicDraft) {
    return false;
  }

  rec.totalClears += 1;
  rec.bestLoopReached = Math.max(rec.bestLoopReached, rec.loopIndex);
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  world.progression.totalRecursionClears = (world.progression.totalRecursionClears ?? 0) + 1;
  world.progression.bestRecursionLoop = Math.max(
    world.progression.bestRecursionLoop ?? 0,
    rec.loopIndex
  );
  if (rec.loopIndex % 2 === 0) {
    world.progression.memoryFragments += 1;
  }

  world.projectiles = [];
  world.temporalRift = null;
  world.resonance.activeMark = null;
  if (world.resonance.status === 'primed') {
    world.resonance.status = 'idle';
  }
  clearEchoState(world, 'outcome');

  if (world.player && world.player.actionState !== 'dead') {
    world.player.integrity = Math.min(world.player.maxIntegrity, world.player.integrity + 15);
    world.player.ghostIntegrity = Math.max(world.player.ghostIntegrity, world.player.integrity);
    world.player.flux = Math.min(world.player.maxFlux, world.player.flux + 20);
  }

  rec.awaitingRelicDraft = true;
  rec.draftOptions = getRelicDraftChoices(rec.loopIndex, rec.relicStacks);
  world.run.checkpointNotice =
    rec.loopIndex % 2 === 0
      ? `LOOP ${rec.loopIndex} CLEARED · +1 MEMORY FRAGMENT · DRAFT CHRONO RELIC`
      : `LOOP ${rec.loopIndex} CLEARED · SELECT 1 CHRONO RELIC TO ADVANCE`;
  world.run.checkpointNoticeTimer = 5.5;

  world.events.push({
    type: 'recursion_loop_cleared',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    amount: rec.loopIndex,
  });
  return true;
}

export function selectRecursionRelic(
  world: WorldState,
  relicId: ChronoRelicId | string
): boolean {
  if (!world || world.run?.mode !== 'recursion' || !world.recursion?.awaitingRelicDraft) {
    return false;
  }
  if (!isValidChronoRelicId(relicId)) {
    return false;
  }
  const rec = world.recursion;
  rec.relicStacks[relicId] = (rec.relicStacks[relicId] ?? 0) + 1;
  rec.awaitingRelicDraft = false;
  rec.draftOptions = [];
  rec.loopIndex += 1;

  syncPlayerRigStats(world);
  if (relicId === 'relic_aegis_capacitor' && world.player && world.player.actionState !== 'dead') {
    world.player.integrity = Math.min(world.player.maxIntegrity, world.player.integrity + 18);
    world.player.ghostIntegrity = Math.max(world.player.ghostIntegrity, world.player.integrity);
  }

  world.events.push({
    type: 'recursion_relic_picked',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    amount: rec.loopIndex,
  });

  spawnRecursionLoopArena(world, rec.loopIndex);
  advanceMissionAndExplorationSystem(world);
  return true;
}

export function canModifyWeaponUpgrades(world: WorldState): boolean {
  if (!world || !world.player) return false;
  if (world.outcome === 'defeat' || world.player.actionState === 'dead') {
    return false;
  }
  if (world.run?.chapter === 'chapter_5_loom' && world.run?.stage === 'chronicle_loom') {
    return false;
  }
  // After winning a match, the simulation freezes player.actionState on the finishing blow;
  // never block post-match Upgrade Bench purchases or equips on the Victory screen.
  if (world.outcome === 'victory') {
    return true;
  }
  const st = world.player.actionState;
  const isCommittedAction =
    st === 'light_windup' ||
    st === 'light_active' ||
    st === 'heavy_windup' ||
    st === 'heavy_active' ||
    st === 'dodging' ||
    st === 'parry_active';
  if (isCommittedAction) {
    return false;
  }
  return true;
}

export function grantProgressionReward(
  world: WorldState,
  rewardId: WeaponProgressionRewardId
): boolean {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  if (world.run.mode !== 'campaign' || world.run.isChapterReplay) {
    return false;
  }
  if (!isValidProgressionRewardId(rewardId)) {
    return false;
  }
  if (world.progression.claimedRewardIds.includes(rewardId)) {
    return false;
  }

  const def = getProgressionRewardDefinition(rewardId);
  world.progression.claimedRewardIds.push(rewardId);
  world.progression.memoryFragments += def.fragments;
  const fragText = `+${def.fragments} MEMORY FRAGMENT${def.fragments > 1 ? 'S' : ''}`;
  world.progression.lastActionMessage = `${fragText} RECOVERED · ${def.label}`;
  world.run.checkpointNotice = `${fragText} (${world.progression.memoryFragments} TOTAL) · ${def.label}`;
  world.run.checkpointNoticeTimer = Math.max(world.run.checkpointNoticeTimer, 4.5);

  world.events.push({
    type: 'progression_reward_granted',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    amount: def.fragments,
    rewardId,
  });

  return true;
}

export function purchaseWeaponUpgrade(
  world: WorldState,
  upgradeId: unknown,
  autoEquip = true
): { success: boolean; outcome: UpgradePurchaseOutcome } {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const prog = world.progression;

  if (!isValidWeaponUpgradeId(upgradeId)) {
    prog.lastPurchaseOutcome = 'invalid_upgrade';
    prog.lastActionMessage = 'INVALID WEAPON UPGRADE ID';
    world.events.push({
      type: 'weapon_upgrade_rejected',
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
    });
    return { success: false, outcome: 'invalid_upgrade' };
  }

  if (!canModifyWeaponUpgrades(world)) {
    prog.lastPurchaseOutcome = 'action_locked';
    prog.lastActionMessage = 'CANNOT MODIFY WEAPON UPGRADES DURING COMMITTED COMBAT OR DEFEAT';
    world.events.push({
      type: 'weapon_upgrade_rejected',
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
      upgradeId,
    });
    return { success: false, outcome: 'action_locked' };
  }

  const def = getWeaponUpgradeDefinition(upgradeId);

  if (prog.purchasedUpgrades.includes(upgradeId)) {
    prog.lastPurchaseOutcome = 'already_owned';
    prog.lastActionMessage = `${def.name} IS ALREADY UNLOCKED`;
    world.events.push({
      type: 'weapon_upgrade_rejected',
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
      weaponId: def.weaponId,
      upgradeId,
    });
    return { success: false, outcome: 'already_owned' };
  }

  if (prog.memoryFragments < def.cost) {
    prog.lastPurchaseOutcome = 'insufficient_fragments';
    prog.lastActionMessage = `INSUFFICIENT MEMORY FRAGMENTS (${prog.memoryFragments}/${def.cost} REQUIRED)`;
    world.events.push({
      type: 'weapon_upgrade_rejected',
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
      weaponId: def.weaponId,
      upgradeId,
    });
    return { success: false, outcome: 'insufficient_fragments' };
  }

  prog.memoryFragments -= def.cost;
  prog.purchasedUpgrades.push(upgradeId);
  prog.lastPurchaseOutcome = 'purchased';

  if (autoEquip) {
    prog.equippedUpgrades[def.weaponId] = upgradeId;
    prog.lastEquipOutcome = 'equipped';
    prog.lastActionMessage = `UNLOCKED & EQUIPPED ${def.name} ON ${getWeaponDefinition(def.weaponId).name}`;
  } else {
    prog.lastActionMessage = `UNLOCKED ${def.name} (-${def.cost} MEMORY FRAGMENTS)`;
  }

  syncResonanceUpgradeParameters(world);

  world.events.push({
    type: 'weapon_upgrade_purchased',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    amount: def.cost,
    weaponId: def.weaponId,
    upgradeId,
  });

  if (autoEquip) {
    world.events.push({
      type: 'weapon_upgrade_equipped',
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
      weaponId: def.weaponId,
      upgradeId,
    });
  }

  return { success: true, outcome: 'purchased' };
}

export function equipWeaponUpgrade(
  world: WorldState,
  weaponId: unknown,
  upgradeId: unknown
): { success: boolean; outcome: UpgradeEquipOutcome } {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const prog = world.progression;

  if (!isValidWeaponId(weaponId)) {
    prog.lastEquipOutcome = 'invalid_upgrade';
    prog.lastActionMessage = 'INVALID TARGET WEAPON SLOT';
    world.events.push({
      type: 'weapon_upgrade_rejected',
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
    });
    return { success: false, outcome: 'invalid_upgrade' };
  }

  if (!canModifyWeaponUpgrades(world)) {
    prog.lastEquipOutcome = 'action_locked';
    prog.lastActionMessage = 'CANNOT MODIFY WEAPON UPGRADES DURING COMMITTED COMBAT OR DEFEAT';
    world.events.push({
      type: 'weapon_upgrade_rejected',
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
      weaponId,
    });
    return { success: false, outcome: 'action_locked' };
  }

  if (upgradeId === null || upgradeId === undefined) {
    prog.equippedUpgrades[weaponId] = null;
    prog.lastEquipOutcome = 'unequipped';
    prog.lastActionMessage = `${getWeaponDefinition(weaponId).name} RESTORED TO STANDARD FACTORY CORE`;
    syncResonanceUpgradeParameters(world);
    world.events.push({
      type: 'weapon_upgrade_equipped',
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
      weaponId,
      upgradeId: null,
    });
    return { success: true, outcome: 'unequipped' };
  }

  if (!isValidWeaponUpgradeId(upgradeId)) {
    prog.lastEquipOutcome = 'invalid_upgrade';
    prog.lastActionMessage = 'INVALID WEAPON UPGRADE SELECTION';
    world.events.push({
      type: 'weapon_upgrade_rejected',
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
      weaponId,
    });
    return { success: false, outcome: 'invalid_upgrade' };
  }

  const def = getWeaponUpgradeDefinition(upgradeId);
  if (def.weaponId !== weaponId) {
    prog.lastEquipOutcome = 'incompatible_weapon';
    prog.lastActionMessage = `${def.name} IS ONLY COMPATIBLE WITH ${getWeaponDefinition(def.weaponId).name}`;
    world.events.push({
      type: 'weapon_upgrade_rejected',
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
      weaponId,
      upgradeId,
    });
    return { success: false, outcome: 'incompatible_weapon' };
  }

  if (!prog.purchasedUpgrades.includes(upgradeId)) {
    prog.lastEquipOutcome = 'not_owned';
    prog.lastActionMessage = `UNLOCK ${def.name} (${def.cost} FRAGMENTS) BEFORE EQUIPPING`;
    world.events.push({
      type: 'weapon_upgrade_rejected',
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
      weaponId,
      upgradeId,
    });
    return { success: false, outcome: 'not_owned' };
  }

  prog.equippedUpgrades[weaponId] = upgradeId;
  prog.lastEquipOutcome = 'equipped';
  prog.lastActionMessage = `EQUIPPED ${def.name} ON ${getWeaponDefinition(weaponId).name}`;
  syncResonanceUpgradeParameters(world);

  world.events.push({
    type: 'weapon_upgrade_equipped',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    weaponId,
    upgradeId,
  });

  return { success: true, outcome: 'equipped' };
}

export function purchaseRigModule(
  world: WorldState,
  moduleId: unknown,
  autoEquip = true
): { success: boolean; outcome: UpgradePurchaseOutcome } {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const prog = world.progression;
  if (!prog.purchasedRigModules) prog.purchasedRigModules = [];
  if (!prog.equippedRigModules) prog.equippedRigModules = createEmptyEquippedRigModules();

  if (!isValidRigModuleId(moduleId)) {
    prog.lastPurchaseOutcome = 'invalid_upgrade';
    prog.lastActionMessage = 'INVALID RIG MODULE ID';
    return { success: false, outcome: 'invalid_upgrade' };
  }

  if (!canModifyWeaponUpgrades(world)) {
    prog.lastPurchaseOutcome = 'action_locked';
    prog.lastActionMessage = 'CANNOT MODIFY RIG CHASSIS DURING COMMITTED COMBAT OR DEFEAT';
    return { success: false, outcome: 'action_locked' };
  }

  const def = getRigModuleDefinition(moduleId);

  if (prog.purchasedRigModules.includes(moduleId)) {
    prog.lastPurchaseOutcome = 'already_owned';
    prog.lastActionMessage = `${def.name} IS ALREADY INSTALLED`;
    return { success: false, outcome: 'already_owned' };
  }

  if (prog.memoryFragments < def.cost) {
    prog.lastPurchaseOutcome = 'insufficient_fragments';
    prog.lastActionMessage = `INSUFFICIENT MEMORY FRAGMENTS (${prog.memoryFragments}/${def.cost} REQUIRED)`;
    return { success: false, outcome: 'insufficient_fragments' };
  }

  prog.memoryFragments -= def.cost;
  prog.purchasedRigModules.push(moduleId);
  prog.lastPurchaseOutcome = 'purchased';

  if (autoEquip) {
    prog.equippedRigModules[def.slot] = moduleId;
    prog.lastEquipOutcome = 'equipped';
    prog.lastActionMessage = `INSTALLED & EQUIPPED ${def.name} (${def.slotLabel})`;
  } else {
    prog.lastActionMessage = `INSTALLED ${def.name} (-${def.cost} MEMORY FRAGMENTS)`;
  }

  syncPlayerRigStats(world);

  world.events.push({
    type: 'rig_module_purchased',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    amount: def.cost,
  });
  if (autoEquip) {
    world.events.push({
      type: 'rig_module_equipped',
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
    });
  }

  return { success: true, outcome: 'purchased' };
}

export function equipRigModule(
  world: WorldState,
  slot: unknown,
  moduleId: unknown
): { success: boolean; outcome: UpgradeEquipOutcome } {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const prog = world.progression;
  if (!prog.purchasedRigModules) prog.purchasedRigModules = [];
  if (!prog.equippedRigModules) prog.equippedRigModules = createEmptyEquippedRigModules();

  if (!isValidRigModuleSlot(slot)) {
    prog.lastEquipOutcome = 'invalid_upgrade';
    prog.lastActionMessage = 'INVALID CHASSIS SUBSYSTEM SLOT';
    return { success: false, outcome: 'invalid_upgrade' };
  }

  if (!canModifyWeaponUpgrades(world)) {
    prog.lastEquipOutcome = 'action_locked';
    prog.lastActionMessage = 'CANNOT MODIFY RIG CHASSIS DURING COMMITTED COMBAT OR DEFEAT';
    return { success: false, outcome: 'action_locked' };
  }

  if (moduleId === null || moduleId === undefined) {
    prog.equippedRigModules[slot] = null;
    prog.lastEquipOutcome = 'unequipped';
    prog.lastActionMessage = `${slot.replace('_', ' ').toUpperCase()} RESTORED TO STOCK SPEC`;
    syncPlayerRigStats(world);
    world.events.push({
      type: 'rig_module_equipped',
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
    });
    return { success: true, outcome: 'unequipped' };
  }

  if (!isValidRigModuleId(moduleId)) {
    prog.lastEquipOutcome = 'invalid_upgrade';
    prog.lastActionMessage = 'INVALID RIG MODULE SELECTION';
    return { success: false, outcome: 'invalid_upgrade' };
  }

  const def = getRigModuleDefinition(moduleId);
  if (def.slot !== slot) {
    prog.lastEquipOutcome = 'incompatible_weapon';
    prog.lastActionMessage = `${def.name} FITS ONLY ${def.slotLabel}`;
    return { success: false, outcome: 'incompatible_weapon' };
  }

  if (!prog.purchasedRigModules.includes(moduleId)) {
    prog.lastEquipOutcome = 'not_owned';
    prog.lastActionMessage = `UNLOCK ${def.name} (${def.cost} FRAGMENTS) BEFORE EQUIPPING`;
    return { success: false, outcome: 'not_owned' };
  }

  prog.equippedRigModules[slot] = moduleId;
  prog.lastEquipOutcome = 'equipped';
  prog.lastActionMessage = `EQUIPPED ${def.name} IN ${def.slotLabel}`;
  syncPlayerRigStats(world);

  world.events.push({
    type: 'rig_module_equipped',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
  });

  return { success: true, outcome: 'equipped' };
}

export function overclockRigModule(
  world: WorldState,
  moduleId: unknown
): { success: boolean; outcome: UpgradePurchaseOutcome } {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const prog = world.progression;
  if (!prog.purchasedRigModules) prog.purchasedRigModules = [];
  if (!prog.overclockedRigModules) prog.overclockedRigModules = [];

  if (!isValidRigModuleId(moduleId)) {
    prog.lastPurchaseOutcome = 'invalid_upgrade';
    prog.lastActionMessage = 'INVALID RIG MODULE FOR MK.II OVERCLOCKING';
    return { success: false, outcome: 'invalid_upgrade' };
  }

  if (!canModifyWeaponUpgrades(world)) {
    prog.lastPurchaseOutcome = 'action_locked';
    prog.lastActionMessage = 'CANNOT OVERCLOCK RIG MODULES DURING COMMITTED COMBAT OR DEFEAT';
    return { success: false, outcome: 'action_locked' };
  }

  const def = getRigModuleDefinition(moduleId);
  if (!prog.purchasedRigModules.includes(moduleId)) {
    prog.lastPurchaseOutcome = 'invalid_upgrade';
    prog.lastActionMessage = `UNLOCK ${def.name} BEFORE MK.II OVERCLOCKING`;
    return { success: false, outcome: 'invalid_upgrade' };
  }

  if (prog.overclockedRigModules.includes(moduleId)) {
    prog.lastPurchaseOutcome = 'already_owned';
    prog.lastActionMessage = `${def.name} ALREADY MK.II OVERCLOCKED`;
    return { success: false, outcome: 'already_owned' };
  }

  if (prog.memoryFragments < RIG_OVERCLOCK_COST) {
    prog.lastPurchaseOutcome = 'insufficient_fragments';
    prog.lastActionMessage = `INSUFFICIENT MEMORY FRAGMENTS (${prog.memoryFragments}/${RIG_OVERCLOCK_COST} REQUIRED FOR MK.II)`;
    return { success: false, outcome: 'insufficient_fragments' };
  }

  prog.memoryFragments -= RIG_OVERCLOCK_COST;
  prog.overclockedRigModules.push(moduleId);
  prog.lastPurchaseOutcome = 'purchased';
  prog.lastActionMessage = `OVERCLOCKED ${def.name} TO MK.II (-${RIG_OVERCLOCK_COST} FRAGMENT)`;
  syncPlayerRigStats(world);

  world.events.push({
    type: 'rig_module_overclocked',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    amount: RIG_OVERCLOCK_COST,
  });

  return { success: true, outcome: 'purchased' };
}

export function setSentinelProtocol(
  world: WorldState,
  mode: unknown
): { success: boolean; mode: import('./types.ts').SentinelProtocolMode } {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const prog = world.progression;
  if (!isValidSentinelMode(mode)) {
    return { success: false, mode: normalizeSentinelMode(prog.sentinelMode) };
  }
  if (world.outcome !== 'none' || world.player?.actionState === 'dead') {
    return { success: false, mode: normalizeSentinelMode(prog.sentinelMode) };
  }
  prog.sentinelMode = mode;
  const spec = SENTINEL_PROTOCOL_SPECS[mode];
  prog.lastActionMessage = `SENTINEL PROTOCOL · ${spec.titleEn}`;
  syncPlayerRigStats(world);
  world.events.push({
    type: 'sentinel_mode_switched',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    amount: spec.baseWard,
  });
  return { success: true, mode };
}

export function cycleSentinelProtocol(
  world: WorldState
): { success: boolean; mode: import('./types.ts').SentinelProtocolMode } {
  const current = normalizeSentinelMode(world.progression?.sentinelMode);
  return setSentinelProtocol(world, cycleNextSentinelMode(current));
}

export function setEchoDoctrine(
  world: WorldState,
  doctrineId: unknown
): { success: boolean; doctrineId: import('./types.ts').EchoDoctrineId } {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const prog = world.progression;
  if (!isValidEchoDoctrineId(doctrineId)) {
    return { success: false, doctrineId: normalizeEchoDoctrineId(prog.echoDoctrine) };
  }
  if (world.outcome !== 'none' || world.player?.actionState === 'dead') {
    return { success: false, doctrineId: normalizeEchoDoctrineId(prog.echoDoctrine) };
  }
  prog.echoDoctrine = doctrineId;
  const spec = ECHO_DOCTRINE_SPECS[doctrineId];
  prog.lastActionMessage = `ECHO DOCTRINE · ${spec.titleEn}`;
  const docIdx = VALID_ECHO_DOCTRINE_IDS.indexOf(doctrineId);
  world.events.push({
    type: 'echo_doctrine_switched',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    amount: Math.max(0, docIdx),
  });
  return { success: true, doctrineId };
}

export function cycleEchoDoctrine(
  world: WorldState
): { success: boolean; doctrineId: import('./types.ts').EchoDoctrineId } {
  const current = normalizeEchoDoctrineId(world.progression?.echoDoctrine);
  return setEchoDoctrine(world, cycleNextEchoDoctrineId(current));
}

export function unlockBossEchoCore(
  world: WorldState,
  coreId: unknown,
  autoEquip = true
): { success: boolean; outcome: UpgradePurchaseOutcome } {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  syncUnlockedBossCoresFromCampaign(world);
  const prog = world.progression;
  if (!isValidBossEchoCoreId(coreId)) {
    prog.lastPurchaseOutcome = 'invalid_upgrade';
    prog.lastActionMessage = 'INVALID BOSS ECHO CORE IMPRINT';
    return { success: false, outcome: 'invalid_upgrade' };
  }
  if (!canModifyWeaponUpgrades(world)) {
    prog.lastPurchaseOutcome = 'action_locked';
    prog.lastActionMessage = 'CANNOT SYNTHESIZE BOSS CORES DURING COMMITTED COMBAT OR DEFEAT';
    return { success: false, outcome: 'action_locked' };
  }
  const spec = BOSS_ECHO_CORES[coreId];
  if (prog.unlockedBossCores.includes(coreId)) {
    prog.lastPurchaseOutcome = 'already_owned';
    prog.lastActionMessage = `${spec.titleEn} ALREADY HARVESTED`;
    return { success: false, outcome: 'already_owned' };
  }
  if (prog.memoryFragments < spec.synthesisCost) {
    prog.lastPurchaseOutcome = 'insufficient_fragments';
    prog.lastActionMessage = `INSUFFICIENT MEMORY FRAGMENTS (${prog.memoryFragments}/${spec.synthesisCost} REQUIRED FOR ${spec.titleEn})`;
    return { success: false, outcome: 'insufficient_fragments' };
  }
  prog.memoryFragments -= spec.synthesisCost;
  prog.unlockedBossCores.push(coreId);
  if (autoEquip) {
    prog.equippedBossCore = coreId;
  }
  prog.lastPurchaseOutcome = 'purchased';
  prog.lastActionMessage = `SYNTHESIZED ${spec.titleEn} (-${spec.synthesisCost} FRAGMENTS)`;
  syncPlayerRigStats(world);
  world.events.push({
    type: 'boss_core_unlocked',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    amount: spec.synthesisCost,
  });
  return { success: true, outcome: 'purchased' };
}

export function equipBossEchoCore(
  world: WorldState,
  coreId: unknown
): {
  success: boolean;
  outcome: UpgradeEquipOutcome;
  equipped: import('./types.ts').BossEchoCoreId | null;
} {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  syncUnlockedBossCoresFromCampaign(world);
  const prog = world.progression;
  if (!canModifyWeaponUpgrades(world)) {
    prog.lastEquipOutcome = 'action_locked';
    prog.lastActionMessage = 'CANNOT RE-SOCKET BOSS CORES DURING COMMITTED COMBAT OR DEFEAT';
    return { success: false, outcome: 'action_locked', equipped: prog.equippedBossCore };
  }
  if (coreId === null) {
    prog.equippedBossCore = null;
    prog.lastEquipOutcome = 'unequipped';
    prog.lastActionMessage = 'BOSS ECHO CORE UNEQUIPPED';
    syncPlayerRigStats(world);
    world.events.push({
      type: 'boss_core_equipped',
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
      amount: 0,
    });
    return { success: true, outcome: 'unequipped', equipped: null };
  }
  if (!isValidBossEchoCoreId(coreId) || !prog.unlockedBossCores.includes(coreId)) {
    prog.lastEquipOutcome = 'not_owned';
    prog.lastActionMessage = 'HARVEST OR SYNTHESIZE THIS BOSS ECHO CORE FIRST';
    return { success: false, outcome: 'not_owned', equipped: prog.equippedBossCore };
  }
  const spec = BOSS_ECHO_CORES[coreId];
  const effectiveCoreMods = computeBossCoreModifiers(coreId, prog.transcendedBossCores);
  prog.equippedBossCore = coreId;
  prog.lastEquipOutcome = 'equipped';
  prog.lastActionMessage = `EQUIPPED ${spec.titleEn}${effectiveCoreMods.isOmega ? ' Ω' : ''}`;
  syncPlayerRigStats(world);
  world.events.push({
    type: 'boss_core_equipped',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    amount: effectiveCoreMods.bonusWard,
  });
  return { success: true, outcome: 'equipped', equipped: coreId };
}

export function saveLoadoutPreset(
  world: WorldState,
  slotIndex: number
): {
  success: boolean;
  slotIndex: import('./types.ts').TacticalLoadoutPresetSlot;
  preset: import('./types.ts').TacticalLoadoutPreset | null;
} {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  syncUnlockedBossCoresFromCampaign(world);
  const prog = world.progression;
  if (!Array.isArray(prog.loadoutPresets) || prog.loadoutPresets.length < 3) {
    prog.loadoutPresets = cloneLoadoutPresets(prog.loadoutPresets);
  }
  if (slotIndex !== 0 && slotIndex !== 1 && slotIndex !== 2) {
    return { success: false, slotIndex: 0, preset: null };
  }
  const slot = slotIndex as import('./types.ts').TacticalLoadoutPresetSlot;
  const presetName = prog.loadoutPresets[slot]?.name || DEFAULT_LOADOUT_PRESET_NAMES[slot];
  const preset: import('./types.ts').TacticalLoadoutPreset = {
    slotIndex: slot,
    name: presetName,
    weaponId: world.player?.equippedWeaponId ?? 'chrono_edge',
    equippedUpgrades: {
      chrono_edge: prog.equippedUpgrades?.chrono_edge ?? null,
      pulsecaster: prog.equippedUpgrades?.pulsecaster ?? null,
      phase_rail: prog.equippedUpgrades?.phase_rail ?? null,
      grav_breaker: prog.equippedUpgrades?.grav_breaker ?? null,
      chrono_scythe: prog.equippedUpgrades?.chrono_scythe ?? null,
    },
    equippedModChipId: prog.equippedModChipId ?? null,
    equippedRigModules: {
      temporal_core: prog.equippedRigModules?.temporal_core ?? null,
      defensive_chassis: prog.equippedRigModules?.defensive_chassis ?? null,
      tactical_harness: prog.equippedRigModules?.tactical_harness ?? null,
    },
    sentinelMode: normalizeSentinelMode(prog.sentinelMode),
    equippedBossCore: prog.equippedBossCore ?? null,
    echoDoctrine: normalizeEchoDoctrineId(prog.echoDoctrine),
  };
  prog.loadoutPresets[slot] = preset;
  prog.lastActionMessage = `SAVED LOADOUT PRESET · ${preset.name}`;
  return { success: true, slotIndex: slot, preset };
}

export function applyLoadoutPreset(
  world: WorldState,
  slotIndex: number
): {
  success: boolean;
  outcome: UpgradeEquipOutcome | 'empty_slot';
  preset: import('./types.ts').TacticalLoadoutPreset | null;
} {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  syncUnlockedBossCoresFromCampaign(world);
  const prog = world.progression;
  if (!Array.isArray(prog.loadoutPresets) || prog.loadoutPresets.length < 3) {
    prog.loadoutPresets = cloneLoadoutPresets(prog.loadoutPresets);
  }
  if (slotIndex !== 0 && slotIndex !== 1 && slotIndex !== 2) {
    return { success: false, outcome: 'empty_slot', preset: null };
  }
  if (!canModifyWeaponUpgrades(world)) {
    prog.lastEquipOutcome = 'action_locked';
    prog.lastActionMessage = 'CANNOT LOAD PRESET DURING COMMITTED COMBAT OR DEFEAT';
    return { success: false, outcome: 'action_locked', preset: null };
  }
  const rawPreset = prog.loadoutPresets[slotIndex];
  if (!rawPreset) {
    prog.lastActionMessage = 'LOADOUT PRESET SLOT IS EMPTY';
    return { success: false, outcome: 'empty_slot', preset: null };
  }

  const availableWeapons = getUnlockedWeaponIds(world);
  const normalizedList = normalizeLoadoutPresets(
    [rawPreset, null, null],
    availableWeapons,
    prog.purchasedUpgrades,
    prog.purchasedRigModules,
    prog.unlockedModChipIds ?? ['mod_volt_arc'],
    prog.unlockedBossCores ?? []
  );
  const safePreset = normalizedList[0];
  if (!safePreset) {
    return { success: false, outcome: 'empty_slot', preset: null };
  }

  if (world.player) {
    world.player.equippedWeaponId = safePreset.weaponId;
    world.player.weaponSwitchCooldownTimer = 0;
  }
  prog.equippedUpgrades = { ...safePreset.equippedUpgrades };
  prog.equippedModChipId = safePreset.equippedModChipId;
  prog.equippedRigModules = { ...safePreset.equippedRigModules };
  prog.sentinelMode = safePreset.sentinelMode;
  prog.equippedBossCore = safePreset.equippedBossCore;
  prog.echoDoctrine = normalizeEchoDoctrineId(safePreset.echoDoctrine);
  prog.lastEquipOutcome = 'equipped';
  prog.lastActionMessage = `LOADED LOADOUT PRESET · ${safePreset.name}`;
  syncPlayerRigStats(world);

  world.events.push({
    type: 'weapon_switched',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    weaponId: safePreset.weaponId,
  });
  return { success: true, outcome: 'equipped', preset: safePreset };
}

export function transcendBossEchoCore(
  world: WorldState,
  coreId: unknown
): { success: boolean; outcome: UpgradePurchaseOutcome } {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  syncUnlockedBossCoresFromCampaign(world);
  const prog = world.progression;
  if (!prog.transcendedBossCores) {
    prog.transcendedBossCores = [];
  }
  if (!isValidBossEchoCoreId(coreId) || !prog.unlockedBossCores.includes(coreId)) {
    prog.lastPurchaseOutcome = 'invalid_upgrade';
    prog.lastActionMessage = 'HARVEST OR SYNTHESIZE THIS BOSS ECHO CORE BEFORE OMEGA TRANSCENDENCE';
    return { success: false, outcome: 'invalid_upgrade' };
  }
  if (!canModifyWeaponUpgrades(world)) {
    prog.lastPurchaseOutcome = 'action_locked';
    prog.lastActionMessage = 'CANNOT AWAKEN BOSS CORE OMEGA DURING COMMITTED COMBAT OR DEFEAT';
    return { success: false, outcome: 'action_locked' };
  }
  const spec = BOSS_ECHO_CORES[coreId];
  if (prog.transcendedBossCores.includes(coreId)) {
    prog.lastPurchaseOutcome = 'already_owned';
    prog.lastActionMessage = `${spec.titleEn} ALREADY TRANSCENDED TO OMEGA`;
    return { success: false, outcome: 'already_owned' };
  }
  if (prog.memoryFragments < BOSS_CORE_OMEGA_COST) {
    prog.lastPurchaseOutcome = 'insufficient_fragments';
    prog.lastActionMessage = `INSUFFICIENT MEMORY FRAGMENTS (${prog.memoryFragments}/${BOSS_CORE_OMEGA_COST} REQUIRED FOR ${spec.titleEn} OMEGA)`;
    return { success: false, outcome: 'insufficient_fragments' };
  }
  prog.memoryFragments -= BOSS_CORE_OMEGA_COST;
  prog.transcendedBossCores.push(coreId);
  if (!prog.equippedBossCore) {
    prog.equippedBossCore = coreId;
  }
  prog.lastPurchaseOutcome = 'purchased';
  prog.lastActionMessage = `OMEGA AWAKENED · ${spec.titleEn} Ω (-${BOSS_CORE_OMEGA_COST} FRAGMENTS)`;
  syncPlayerRigStats(world);
  world.events.push({
    type: 'boss_core_omega_awakened',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    amount: BOSS_CORE_OMEGA_COST,
  });
  return { success: true, outcome: 'purchased' };
}

export function overclockWeaponUpgrade(
  world: WorldState,
  upgradeId: unknown
): { success: boolean; outcome: UpgradePurchaseOutcome } {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const prog = world.progression;
  if (!prog.overclockedUpgrades) prog.overclockedUpgrades = [];

  if (!isValidWeaponUpgradeId(upgradeId)) {
    prog.lastPurchaseOutcome = 'invalid_upgrade';
    prog.lastActionMessage = 'INVALID WEAPON UPGRADE FOR OVERCLOCKING';
    return { success: false, outcome: 'invalid_upgrade' };
  }

  if (!canModifyWeaponUpgrades(world)) {
    prog.lastPurchaseOutcome = 'action_locked';
    prog.lastActionMessage = 'CANNOT OVERCLOCK MODULES DURING COMMITTED COMBAT OR DEFEAT';
    return { success: false, outcome: 'action_locked' };
  }

  const def = getWeaponUpgradeDefinition(upgradeId);

  if (!prog.purchasedUpgrades.includes(upgradeId)) {
    prog.lastPurchaseOutcome = 'invalid_upgrade';
    prog.lastActionMessage = `UNLOCK ${def.name} BEFORE OVERCLOCKING MK.II`;
    return { success: false, outcome: 'invalid_upgrade' };
  }

  if (prog.overclockedUpgrades.includes(upgradeId)) {
    prog.lastPurchaseOutcome = 'already_owned';
    prog.lastActionMessage = `${def.name} IS ALREADY OVERCLOCKED (MK.II)`;
    return { success: false, outcome: 'already_owned' };
  }

  if (prog.memoryFragments < WEAPON_OVERCLOCK_COST) {
    prog.lastPurchaseOutcome = 'insufficient_fragments';
    prog.lastActionMessage = `INSUFFICIENT MEMORY FRAGMENTS (${prog.memoryFragments}/${WEAPON_OVERCLOCK_COST} REQUIRED FOR MK.II)`;
    return { success: false, outcome: 'insufficient_fragments' };
  }

  prog.memoryFragments -= WEAPON_OVERCLOCK_COST;
  prog.overclockedUpgrades.push(upgradeId);
  prog.lastPurchaseOutcome = 'purchased';
  prog.lastActionMessage = `OVERCLOCKED ${def.name} MK.II (-${WEAPON_OVERCLOCK_COST} FRAGMENT)`;
  syncPlayerRigStats(world);

  world.events.push({
    type: 'weapon_upgrade_overclocked',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    amount: WEAPON_OVERCLOCK_COST,
    weaponId: def.weaponId,
    upgradeId,
  });

  return { success: true, outcome: 'purchased' };
}

export function awakenWeaponUpgrade(
  world: WorldState,
  upgradeId: unknown
): { success: boolean; outcome: UpgradePurchaseOutcome } {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const prog = world.progression;
  if (!prog.overclockedUpgrades) prog.overclockedUpgrades = [];
  if (!prog.awakenedUpgrades) prog.awakenedUpgrades = [];

  if (!isValidWeaponUpgradeId(upgradeId)) {
    prog.lastPurchaseOutcome = 'invalid_upgrade';
    prog.lastActionMessage = 'INVALID WEAPON UPGRADE FOR MK.III AWAKENING';
    return { success: false, outcome: 'invalid_upgrade' };
  }

  if (!canModifyWeaponUpgrades(world)) {
    prog.lastPurchaseOutcome = 'action_locked';
    prog.lastActionMessage = 'CANNOT AWAKEN MODULES DURING COMMITTED COMBAT OR DEFEAT';
    return { success: false, outcome: 'action_locked' };
  }

  const def = getWeaponUpgradeDefinition(upgradeId);

  if (!prog.purchasedUpgrades.includes(upgradeId) || !prog.overclockedUpgrades.includes(upgradeId)) {
    prog.lastPurchaseOutcome = 'invalid_upgrade';
    prog.lastActionMessage = `OVERCLOCK ${def.name} TO MK.II BEFORE MYTHIC AWAKENING`;
    return { success: false, outcome: 'invalid_upgrade' };
  }

  if (prog.awakenedUpgrades.includes(upgradeId)) {
    prog.lastPurchaseOutcome = 'already_owned';
    prog.lastActionMessage = `${def.name} IS ALREADY MYTHIC AWAKENED (MK.III)`;
    return { success: false, outcome: 'already_owned' };
  }

  if (prog.memoryFragments < WEAPON_AWAKENING_COST) {
    prog.lastPurchaseOutcome = 'insufficient_fragments';
    prog.lastActionMessage = `INSUFFICIENT MEMORY FRAGMENTS (${prog.memoryFragments}/${WEAPON_AWAKENING_COST} REQUIRED FOR MK.III)`;
    return { success: false, outcome: 'insufficient_fragments' };
  }

  prog.memoryFragments -= WEAPON_AWAKENING_COST;
  prog.awakenedUpgrades.push(upgradeId);
  prog.lastPurchaseOutcome = 'purchased';
  prog.lastActionMessage = `MYTHIC AWAKENED ${def.name} MK.III (-${WEAPON_AWAKENING_COST} FRAGMENTS)`;
  syncPlayerRigStats(world);

  world.events.push({
    type: 'weapon_mythic_awakened',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    amount: WEAPON_AWAKENING_COST,
    weaponId: def.weaponId,
    upgradeId,
  });

  return { success: true, outcome: 'purchased' };
}

export function purchaseNeuralProtocol(
  world: WorldState,
  protocolId: unknown
): { success: boolean; outcome: UpgradePurchaseOutcome } {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const prog = world.progression;
  if (!prog.purchasedNeuralProtocols) prog.purchasedNeuralProtocols = [];

  if (!isValidNeuralProtocolId(protocolId)) {
    prog.lastPurchaseOutcome = 'invalid_upgrade';
    prog.lastActionMessage = 'INVALID NEURAL PROTOCOL ID';
    return { success: false, outcome: 'invalid_upgrade' };
  }

  if (!canModifyWeaponUpgrades(world)) {
    prog.lastPurchaseOutcome = 'action_locked';
    prog.lastActionMessage = 'CANNOT INSTALL NEURAL PROTOCOLS DURING COMMITTED COMBAT OR DEFEAT';
    return { success: false, outcome: 'action_locked' };
  }

  const def = getNeuralProtocolDefinition(protocolId);

  if (prog.purchasedNeuralProtocols.includes(protocolId)) {
    prog.lastPurchaseOutcome = 'already_owned';
    prog.lastActionMessage = `${def.name} IS ALREADY ACTIVE`;
    return { success: false, outcome: 'already_owned' };
  }

  if (prog.memoryFragments < def.cost) {
    prog.lastPurchaseOutcome = 'insufficient_fragments';
    prog.lastActionMessage = `INSUFFICIENT MEMORY FRAGMENTS (${prog.memoryFragments}/${def.cost} REQUIRED)`;
    return { success: false, outcome: 'insufficient_fragments' };
  }

  prog.memoryFragments -= def.cost;
  prog.purchasedNeuralProtocols.push(protocolId);
  prog.lastPurchaseOutcome = 'purchased';
  prog.lastActionMessage = `NEURAL PROTOCOL INSTALLED · ${def.name} (-${def.cost} FRAGMENTS)`;
  syncPlayerRigStats(world);

  world.events.push({
    type: 'neural_protocol_purchased',
    x: world.player?.x ?? 0,
    z: world.player?.z ?? 0,
    amount: def.cost,
  });

  return { success: true, outcome: 'purchased' };
}

export function wrapAngle(angle: number): number {
  let a = angle;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export function angleDiff(target: number, current: number): number {
  return wrapAngle(target - current);
}

export function moveAngleTowards(current: number, target: number, maxStep: number): number {
  const diff = angleDiff(target, current);
  if (Math.abs(diff) <= maxStep) return wrapAngle(target);
  return wrapAngle(current + Math.sign(diff) * maxStep);
}

export function dampAngle(current: number, target: number, responseRate: number, dt: number): number {
  const diff = angleDiff(target, current);
  const absDiff = Math.abs(diff);
  if (absDiff < 0.0005) return wrapAngle(target);
  const expStep = absDiff * (1 - Math.exp(-responseRate * dt));
  const minStep = Math.min(absDiff, responseRate * 0.85 * dt);
  const step = Math.max(expStep, minStep);
  return moveAngleTowards(current, target, step);
}

export function createInitialPlayer(): PlayerState {
  return {
    x: GAME_CONFIG.player.spawnX,
    z: GAME_CONFIG.player.spawnZ,
    vx: 0,
    vz: 0,
    rotationY: GAME_CONFIG.player.spawnRotationY,
    integrity: GAME_CONFIG.player.maxIntegrity,
    maxIntegrity: GAME_CONFIG.player.maxIntegrity,
    ghostIntegrity: GAME_CONFIG.player.maxIntegrity,
    flux: GAME_CONFIG.player.initialFlux,
    maxFlux: GAME_CONFIG.player.maxFlux,
    equippedWeaponId: GAME_CONFIG.weapons.defaultWeaponId,
    weaponHeat: 0,
    maxWeaponHeat: GAME_CONFIG.weapons.pulsecaster.maxHeat,
    weaponOverheated: false,
    weaponOverheatTimer: 0,
    weaponShotCooldownTimer: 0,
    weaponSwitchCooldownTimer: 0,
    lastWeaponShotOutcome: 'none',
    actionState: 'idle',
    stateTimer: 0,
    comboIndex: 0,
    comboWindowTimer: 0,
    comboCooldownTimer: 0,
    chargeTime: 0,
    isEmpoweredHeavy: false,
    dodgeCooldownTimer: 0,
    parryCooldownTimer: 0,
    invulnTimer: 0,
    hurtFlashTimer: 0,
    gaitPhase: 0,
    squashX: 1,
    squashY: 1,
    attackHitIds: [],
    currentAttackStartedAt: 0,
    currentAttackMarkId: null,
    bufferedAction: 'none',
    bufferTimer: 0,
    fluxDampenedTimer: 0,
    riposteTimer: 0,
    chronoSlipTimer: 0,
    dodgeCounterTriggered: false,
    relayMomentumTimer: 0,
    quickDrawTimer: 0,
    activeStrikeFlowDamageMult: 1,
    activeStrikeFlowStaggerMult: 1,
    activeStrikeFlowKind: 'none',
    adrenalineScore: 0,
    adrenalineDecayGraceTimer: 0,
    activeVentAttempted: false,
    activeVentEmpoweredShots: 0,
    lockOnTargetId: null,
    surgeTimer: 0,
    temporalSlipTimer: 0,
    temporalSlipMaxDuration: 0,
    temporalSlipCooldown: 0,
  };
}

export function createInitialEchoState(): EchoSystemState {
  return {
    state: 'idle',
    recordingTime: 0,
    maxDuration: GAME_CONFIG.echo.maxDuration,
    minDuration: GAME_CONFIG.echo.minDuration,
    playbackTime: 0,
    nextEventIndex: 0,
    processedContactEventIds: [],
    clipCounter: 0,
    clip: null,
    recordingSamples: [],
    recordingEvents: [],
    activeActor: null,
    statusMessage: 'PRESS [T] TO RECORD ECHO SEQUENCE',
    novaPulseCooldownTimer: 0,
  };
}

export function createInitialResonanceState(): ResonanceSystemState {
  return {
    status: 'idle',
    activeMark: null,
    markCounter: 0,
    primedCount: 0,
    convergenceCount: 0,
    cooldownTimer: 0,
    maxCooldown: GAME_CONFIG.resonance.cooldown,
    fluxCost: GAME_CONFIG.resonance.fluxCost,
    syncWindow: GAME_CONFIG.resonance.syncWindow,
    postureBonus: GAME_CONFIG.resonance.postureBonus,
    bonusDamage: GAME_CONFIG.resonance.bonusDamage,
    lastOutcome: 'none',
    lastConvergedEnemyId: null,
    lastConvergedX: 0,
    lastConvergedZ: 0,
    flashTimer: 0,
    statusMessage: 'RECORD ECHO HEAVY [E] ON TARGET TO PRIME RESONANCE',
  };
}

export function createInitialRelayEvaluation(): RelayTargetEvaluation {
  return {
    canRelay: false,
    status: 'no_active_echo',
    distance: 0,
    maxRange: GAME_CONFIG.relay.maxRange,
    fluxCost: GAME_CONFIG.relay.fluxCost,
    landingX: 0,
    landingZ: 0,
    echoX: 0,
    echoZ: 0,
    candidateIndex: -1,
    message: 'NO ACTIVE ECHO · REPLAY [Y] TO LOCK RELAY TARGET',
  };
}

export function createInitialRelayState(): RelaySystemState {
  return {
    cooldownTimer: 0,
    maxCooldown: GAME_CONFIG.relay.cooldown,
    fluxCost: GAME_CONFIG.relay.fluxCost,
    maxRange: GAME_CONFIG.relay.maxRange,
    activationCount: 0,
    lastOutcome: 'none',
    lastOriginX: 0,
    lastOriginZ: 0,
    lastLandingX: 0,
    lastLandingZ: 0,
    successFlashTimer: 0,
    statusMessage: 'NO ACTIVE ECHO · REPLAY [Y] TO LOCK RELAY TARGET',
    preview: createInitialRelayEvaluation(),
  };
}

const RELAY_CANDIDATE_ANGLES = [
  0,
  Math.PI * 0.25,
  -Math.PI * 0.25,
  Math.PI * 0.5,
  -Math.PI * 0.5,
  Math.PI * 0.75,
  -Math.PI * 0.75,
  Math.PI,
] as const;

function distToSegmentSq(
  px: number,
  pz: number,
  ax: number,
  az: number,
  bx: number,
  bz: number
): number {
  const abx = bx - ax;
  const abz = bz - az;
  const lenSq = abx * abx + abz * abz;
  if (lenSq < 1e-8) {
    const dx = px - ax;
    const dz = pz - az;
    return dx * dx + dz * dz;
  }
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (pz - az) * abz) / lenSq));
  const projX = ax + t * abx;
  const projZ = az + t * abz;
  const dx = px - projX;
  const dz = pz - projZ;
  return dx * dx + dz * dz;
}

function isObstacleAuthoritativelySolid(world: WorldState, obs: ObstacleCollider): boolean {
  if (obs.id === world.pressurePlate.receiverId) {
    return !world.pressurePlate.barrierOpen;
  }
  if (world.puzzle && obs.id === world.puzzle.finalBarrier.id) {
    return !world.puzzle.finalBarrier.open;
  }
  return !obs.disabled;
}

function isLandingPointSafe(
  world: WorldState,
  candX: number,
  candZ: number,
  echoX: number,
  echoZ: number,
  echoRadius: number
): boolean {
  const pRadius = GAME_CONFIG.player.radius;
  const obsMargin = GAME_CONFIG.relay.obstacleClearanceMargin;
  const enemyMargin = GAME_CONFIG.relay.enemyClearanceMargin;

  // 1. Must stay inside circular arena perimeter
  const maxArenaDist = GAME_CONFIG.arena.radius - pRadius - obsMargin;
  if (Math.hypot(candX, candZ) > maxArenaDist) {
    return false;
  }

  // 2. Must not overlap the active Echo actor
  if (Math.hypot(candX - echoX, candZ - echoZ) < pRadius + echoRadius - 1e-4) {
    return false;
  }

  // 3. Must not overlap any active solid obstacle or locked barrier collider
  for (let i = 0; i < world.obstacles.length; i++) {
    const obs = world.obstacles[i];
    if (!isObstacleAuthoritativelySolid(world, obs)) continue;
    const minDist = pRadius + obs.radius + obsMargin;
    if (Math.hypot(candX - obs.x, candZ - obs.z) < minDist) {
      return false;
    }
  }

  // 4. Must not overlap any living enemy
  for (let i = 0; i < world.enemies.length; i++) {
    const enemy = world.enemies[i];
    if (enemy.aiState === 'ko' || enemy.hp <= 0) continue;
    const minDist = pRadius + enemy.radius + enemyMargin;
    if (Math.hypot(candX - enemy.x, candZ - enemy.z) < minDist) {
      return false;
    }
  }

  return true;
}

function isRelaySegmentBlocked(
  world: WorldState,
  startX: number,
  startZ: number,
  endX: number,
  endZ: number
): boolean {
  const pathClearance = GAME_CONFIG.relay.pathClearanceRadius;

  // 1. Check authoritative Stage 1 Containment Barrier threshold (-6.2, 9.0)
  const plate = world.pressurePlate;
  if (!plate.barrierOpen) {
    const gateX = plate.receiverX;
    const gateZ = plate.receiverZ;
    const gateR = plate.receiverRadius + pathClearance;
    if (distToSegmentSq(gateX, gateZ, startX, startZ, endX, endZ) < gateR * gateR) {
      return true;
    }
    const startWestOfGate1 = startX < gateX && startZ >= 7.0;
    const endWestOfGate1 = endX < gateX && endZ >= 7.0;
    if (startWestOfGate1 !== endWestOfGate1) {
      return true;
    }
  }

  // 2. Check authoritative Stage 3 Final Archive Calibration Barrier threshold (-10.8, 10.2)
  const fb = world.puzzle?.finalBarrier;
  if (fb && !fb.open) {
    const gateR = fb.radius + pathClearance;
    if (distToSegmentSq(fb.x, fb.z, startX, startZ, endX, endZ) < gateR * gateR) {
      return true;
    }
    const startWestOfFinal = startX < fb.x && startZ >= 7.0;
    const endWestOfFinal = endX < fb.x && endZ >= 7.0;
    if (startWestOfFinal !== endWestOfFinal) {
      return true;
    }
  }

  // 3. Check swept segment against all solid obstacles
  for (let i = 0; i < world.obstacles.length; i++) {
    const obs = world.obstacles[i];
    if (!isObstacleAuthoritativelySolid(world, obs)) continue;
    const minR = obs.radius + pathClearance;
    if (distToSegmentSq(obs.x, obs.z, startX, startZ, endX, endZ) < minR * minR) {
      return true;
    }
  }

  return false;
}

export function evaluateRelayTarget(world: WorldState): RelayTargetEvaluation {
  const maxRange = GAME_CONFIG.relay.maxRange;
  const rigMods = getPlayerRigModifiers(world);
  const fluxCost = Math.max(0, GAME_CONFIG.relay.fluxCost + rigMods.relayFluxCostDelta);
  const echo = world.echo;
  const p = world.player;

  if (
    world.appState !== 'playing' ||
    world.outcome !== 'none' ||
    echo.state !== 'playback' ||
    !echo.activeActor
  ) {
    return {
      canRelay: false,
      status: 'no_active_echo',
      distance: 0,
      maxRange,
      fluxCost,
      landingX: p.x,
      landingZ: p.z,
      echoX: 0,
      echoZ: 0,
      candidateIndex: -1,
      message: 'NO ACTIVE ECHO · REPLAY [Y] TO LOCK RELAY TARGET',
    };
  }

  const actor = echo.activeActor;
  const dist = Math.hypot(actor.x - p.x, actor.z - p.z);

  // Action-state commitment check: Relay is allowed only from neutral locomotion ('idle' or 'moving')
  // and prohibited during committed attacks, heavy charge, dodge, parry, hitstun, or defeat.
  const isNeutralAction =
    (p.actionState === 'idle' || p.actionState === 'moving') && p.hurtFlashTimer <= 0;
  if (!isNeutralAction) {
    return {
      canRelay: false,
      status: 'action_locked',
      distance: dist,
      maxRange,
      fluxCost,
      landingX: actor.x,
      landingZ: actor.z,
      echoX: actor.x,
      echoZ: actor.z,
      candidateIndex: -1,
      message: 'ACTION COMMITTED · CANNOT RELAY MID-STRIKE OR DODGE',
    };
  }

  if (world.relay.cooldownTimer > 0) {
    return {
      canRelay: false,
      status: 'on_cooldown',
      distance: dist,
      maxRange,
      fluxCost,
      landingX: actor.x,
      landingZ: actor.z,
      echoX: actor.x,
      echoZ: actor.z,
      candidateIndex: -1,
      message: `RELAY RECHARGING (${world.relay.cooldownTimer.toFixed(1)}s)`,
    };
  }

  if (p.flux < fluxCost) {
    return {
      canRelay: false,
      status: 'insufficient_flux',
      distance: dist,
      maxRange,
      fluxCost,
      landingX: actor.x,
      landingZ: actor.z,
      echoX: actor.x,
      echoZ: actor.z,
      candidateIndex: -1,
      message: `INSUFFICIENT FLUX (${Math.floor(p.flux)}/${fluxCost} FLUX)`,
    };
  }

  if (dist > maxRange) {
    return {
      canRelay: false,
      status: 'out_of_range',
      distance: dist,
      maxRange,
      fluxCost,
      landingX: actor.x,
      landingZ: actor.z,
      echoX: actor.x,
      echoZ: actor.z,
      candidateIndex: -1,
      message: `ECHO OUT OF RELAY RANGE (${dist.toFixed(1)}m / ${maxRange.toFixed(1)}m MAX)`,
    };
  }

  // Deterministic candidate ring evaluation around active Echo
  const baseAngle =
    dist > 0.05
      ? Math.atan2(p.x - actor.x, p.z - actor.z)
      : wrapAngle(actor.rotationY + Math.PI);

  const offsets = [
    GAME_CONFIG.relay.landingOffset,
    GAME_CONFIG.relay.secondaryLandingOffset,
    2.15,
  ];

  let anySafePoint = false;
  let firstSafeX = actor.x;
  let firstSafeZ = actor.z;
  let candidateCounter = 0;

  for (let rIdx = 0; rIdx < offsets.length; rIdx++) {
    const ringRadius = offsets[rIdx];
    for (let aIdx = 0; aIdx < RELAY_CANDIDATE_ANGLES.length; aIdx++) {
      const candidateIndex = candidateCounter++;
      const angle = wrapAngle(baseAngle + RELAY_CANDIDATE_ANGLES[aIdx]);
      const candX = Number((actor.x + Math.sin(angle) * ringRadius).toFixed(4));
      const candZ = Number((actor.z + Math.cos(angle) * ringRadius).toFixed(4));

      if (!isLandingPointSafe(world, candX, candZ, actor.x, actor.z, actor.radius)) {
        continue;
      }

      if (!anySafePoint) {
        anySafePoint = true;
        firstSafeX = candX;
        firstSafeZ = candZ;
      }

      const blockedToEcho = isRelaySegmentBlocked(world, p.x, p.z, actor.x, actor.z);
      const blockedToLanding = isRelaySegmentBlocked(world, p.x, p.z, candX, candZ);
      if (blockedToEcho || blockedToLanding) {
        continue;
      }

      return {
        canRelay: true,
        status: 'ready',
        distance: dist,
        maxRange,
        fluxCost,
        landingX: candX,
        landingZ: candZ,
        echoX: actor.x,
        echoZ: actor.z,
        candidateIndex,
        message: `RELAY LOCKED (${dist.toFixed(1)}m) · PRESS [V] TO TELEPORT (${fluxCost} FLUX)`,
      };
    }
  }

  if (anySafePoint) {
    return {
      canRelay: false,
      status: 'path_blocked',
      distance: dist,
      maxRange,
      fluxCost,
      landingX: firstSafeX,
      landingZ: firstSafeZ,
      echoX: actor.x,
      echoZ: actor.z,
      candidateIndex: -1,
      message: 'RELAY PATH BLOCKED BY SOLID BULKHEAD OR CONTAINMENT GATE',
    };
  }

  return {
    canRelay: false,
    status: 'no_safe_landing',
    distance: dist,
    maxRange,
    fluxCost,
    landingX: actor.x,
    landingZ: actor.z,
    echoX: actor.x,
    echoZ: actor.z,
    candidateIndex: -1,
    message: 'NO SAFE LANDING ZONE AROUND ACTIVE ECHO',
  };
}

export function attemptEchoRelay(world: WorldState): boolean {
  const evaluation = evaluateRelayTarget(world);
  world.relay.preview = evaluation;

  if (!evaluation.canRelay) {
    world.relay.lastOutcome = evaluation.status;
    world.relay.statusMessage = evaluation.message;
    world.events.push({
      type: 'echo_relay_rejected',
      x: world.player.x,
      z: world.player.z,
      relayStatus: evaluation.status,
    });
    return false;
  }

  const p = world.player;
  const originX = p.x;
  const originZ = p.z;
  const rigMods = getPlayerRigModifiers(world);
  const effectiveRelayCost = Math.max(
    0,
    GAME_CONFIG.relay.fluxCost + rigMods.relayFluxCostDelta
  );
  const effectiveRelayCooldown = Math.max(
    0.2,
    GAME_CONFIG.relay.cooldown + rigMods.relayCooldownDelta
  );

  // Deduct Flux once and start cooldown
  p.flux = Math.max(0, p.flux - effectiveRelayCost);
  world.relay.fluxCost = effectiveRelayCost;
  world.relay.maxCooldown = effectiveRelayCooldown;
  world.relay.cooldownTimer = effectiveRelayCooldown;

  // Move live Sera to the validated safe landing coordinate & clear stale horizontal velocity
  p.x = evaluation.landingX;
  p.z = evaluation.landingZ;
  p.vx = 0;
  p.vz = 0;
  p.squashX = 0.86;
  p.squashY = 1.16;
  grantRelayMomentumWindow(p);

  world.relay.activationCount += 1;
  world.relay.lastOutcome = 'teleported';
  world.relay.lastOriginX = originX;
  world.relay.lastOriginZ = originZ;
  world.relay.lastLandingX = evaluation.landingX;
  world.relay.lastLandingZ = evaluation.landingZ;
  world.relay.successFlashTimer = GAME_CONFIG.relay.successFlashDuration;
  world.relay.statusMessage = 'CHRONO RELAY COMPLETE · PHASE SHIFTED TO ECHO ANCHOR';
  world.echo.statusMessage = 'CHRONO RELAY COMPLETE · ECHO CONTINUES REPLAY';

  world.events.push({
    type: 'echo_relay_success',
    x: evaluation.landingX,
    z: evaluation.landingZ,
    originX,
    originZ,
    relayStatus: 'ready',
  });

  updatePressurePlate(world, 0);
  triggerEchoDoctrineNovaPulse(world, evaluation.landingX, evaluation.landingZ);
  world.relay.preview = evaluateRelayTarget(world);
  return true;
}

export function createInitialPressurePlateState(): PressurePlateState {
  const cfg = GAME_CONFIG.arena.chronoPlate;
  return {
    id: cfg.id,
    label: cfg.label,
    x: cfg.x,
    z: cfg.z,
    radius: cfg.radius,
    interactionPolicy: cfg.interactionPolicy,
    active: false,
    interactorId: null,
    receiverId: cfg.receiverId,
    receiverLabel: cfg.receiverLabel,
    receiverX: cfg.receiverX,
    receiverZ: cfg.receiverZ,
    receiverRadius: cfg.receiverRadius,
    barrierOpen: false,
    activationCount: 0,
  };
}

export function createInitialHeavyReceiverState(): HeavyReceiverState {
  const cfg = GAME_CONFIG.arena.chronoPuzzle.heavyReceiver;
  return {
    id: cfg.id,
    label: cfg.label,
    x: cfg.x,
    z: cfg.z,
    radius: cfg.radius,
    targetX: cfg.targetX,
    targetZ: cfg.targetZ,
    targetYaw: cfg.targetYaw,
    angleTolerance: cfg.angleTolerance,
    interactionPolicy: cfg.interactionPolicy,
    charged: false,
    chargeTimer: 0,
    chargeDuration: cfg.chargeDuration,
    activationCount: 0,
    lastAttemptOutcome: 'none',
  };
}

export function createInitialCombinePlateState(): PressurePlateState {
  const cfg = GAME_CONFIG.arena.chronoPuzzle.combinePlate;
  return {
    id: cfg.id,
    label: cfg.label,
    x: cfg.x,
    z: cfg.z,
    radius: cfg.radius,
    interactionPolicy: cfg.interactionPolicy,
    active: false,
    interactorId: null,
    receiverId: cfg.receiverId,
    receiverLabel: cfg.receiverLabel,
    receiverX: cfg.receiverX,
    receiverZ: cfg.receiverZ,
    receiverRadius: cfg.receiverRadius,
    barrierOpen: false,
    activationCount: 0,
  };
}

export function createInitialCombineBarrierState(): CombineBarrierState {
  const cfg = GAME_CONFIG.arena.chronoPuzzle.finalBarrier;
  return {
    id: cfg.id,
    label: cfg.label,
    x: cfg.x,
    z: cfg.z,
    radius: cfg.radius,
    height: cfg.height,
    open: false,
    completionX: cfg.completionX,
    completionZ: cfg.completionZ,
    completionRadius: cfg.completionRadius,
  };
}

export function createInitialPuzzleState(teachPlate: PressurePlateState): ChronoPuzzleState {
  return {
    stage: 'teach',
    teachCompleted: false,
    testCompleted: false,
    combineCompleted: false,
    completed: false,
    teachPlate,
    heavyReceiver: createInitialHeavyReceiverState(),
    combinePlate: createInitialCombinePlateState(),
    finalBarrier: createInitialCombineBarrierState(),
  };
}

export function createEnemy(
  id: string,
  archetype: EnemyArchetype,
  x: number,
  z: number,
  rotationY = 0
): EnemyState {
  const cfg = GAME_CONFIG.enemies[archetype];
  return {
    id,
    name: cfg.name,
    archetype,
    x,
    z,
    vx: 0,
    vz: 0,
    rotationY,
    hp: cfg.maxHp,
    maxHp: cfg.maxHp,
    ghostHp: cfg.maxHp,
    stagger: 0,
    maxStagger: cfg.maxStagger,
    radius: cfg.radius,
    aiState: 'pursue',
    stateTimer: 0,
    stateDuration: 0,
    cooldownTimer:
      archetype === 'bastion'
        ? 0.45
        : archetype === 'scrapper'
          ? 0.7
          : archetype === 'helix'
            ? 0.65
            : 0.9,
    strafeDir: id.endsWith('1') ? 1 : -1,
    hitFlashTimer: 0,
    hasDealtDamageThisAttack: false,
    koProgress: 0,
    targetX: x,
    targetZ: z + 3,
    evadeTimer: 0,
    evadeCooldownTimer: 0,
    modifier: null,
    blinkCooldownTimer: archetype === 'phase_stalker' ? 1.8 : 0,
    phaseShiftTimer: 0,
    tetherTargetId: null,
  };
}

export function createBossStateForId(
  bossId: BossId = 'helix-04',
  skipIntro = false
): BossState {
  const baseCfg = GAME_CONFIG.boss;
  let id: string = baseCfg.id;
  let name: string = baseCfg.name;
  let subtitle: string = baseCfg.subtitle;
  let maxHp: number = baseCfg.maxHp;
  let maxStagger: number = baseCfg.maxStagger;
  let radius: number = baseCfg.radius;
  let statusP1 = 'PHASE I · CONTAINMENT PROTOCOL';
  let statusIntro = 'WARDEN CORE INITIALIZING · HELIX-04';

  if (bossId === 'the-choir') {
    id = GAME_CONFIG.choir.id;
    name = GAME_CONFIG.choir.name;
    subtitle = GAME_CONFIG.choir.subtitle;
    maxHp = GAME_CONFIG.choir.maxHp;
    maxStagger = GAME_CONFIG.choir.maxStagger;
    radius = GAME_CONFIG.enemies.choir.radius;
    statusP1 = 'PHASE I · HARMONIC SHIELD ACTIVE (SYNC LINKED PYLONS)';
    statusIntro = 'HARMONIC CONFLUENCE AWAKENING · THE CHOIR';
  } else if (bossId === 'the-curator') {
    id = GAME_CONFIG.curator.id;
    name = GAME_CONFIG.curator.name;
    subtitle = GAME_CONFIG.curator.subtitle;
    maxHp = GAME_CONFIG.curator.maxHp;
    maxStagger = GAME_CONFIG.curator.maxStagger;
    radius = GAME_CONFIG.enemies.curator.radius;
    statusP1 = 'PHASE I · ARCHIVE TRACE RECONSTRUCTION';
    statusIntro = 'ARCHIVE RECONSTRUCTOR ONLINE · THE CURATOR';
  } else if (bossId === 'matron-v') {
    id = GAME_CONFIG.matron.id;
    name = GAME_CONFIG.matron.name;
    subtitle = GAME_CONFIG.matron.subtitle;
    maxHp = GAME_CONFIG.matron.maxHp;
    maxStagger = GAME_CONFIG.matron.maxStagger;
    radius = GAME_CONFIG.enemies.matron.radius;
    statusP1 = 'PHASE I · SURGICAL QUARANTINE PROTOCOL';
    statusIntro = 'QUARANTINE WARDEN AWAKENING · MATRON-V';
  } else if (bossId === 'warden-prime') {
    id = GAME_CONFIG.wardenPrime.id;
    name = GAME_CONFIG.wardenPrime.name;
    subtitle = GAME_CONFIG.wardenPrime.subtitle;
    maxHp = GAME_CONFIG.wardenPrime.maxHp;
    maxStagger = GAME_CONFIG.wardenPrime.maxStagger;
    radius = GAME_CONFIG.enemies.warden_prime.radius;
    statusP1 = 'PHASE I · SOVEREIGN LOOM DIRECTIVE';
    statusIntro = 'SOVEREIGN ARCHITECT ONLINE · WARDEN PRIME';
  } else if (bossId === 'echo-zero') {
    id = 'echo-zero';
    name = 'ECHO-ZERO';
    subtitle = 'PARADOX MIRROR · SERA PROTOTYPE';
    maxHp = 920;
    maxStagger = 120;
    radius = 0.95;
    statusP1 = 'PHASE I · PARADOX MIRROR PROTOCOL';
    statusIntro = 'PARADOX RIFT BREACHED · ECHO-ZERO AWAKENING';
  }

  return {
    id,
    name,
    subtitle,
    x: baseCfg.spawnX,
    z: baseCfg.spawnZ,
    vx: 0,
    vz: 0,
    rotationY: baseCfg.spawnRotationY,
    hp: maxHp,
    maxHp,
    ghostHp: maxHp,
    stagger: 0,
    maxStagger,
    radius,
    phase: 1,
    aiState: skipIntro ? 'pursue' : 'dormant',
    stateTimer: skipIntro ? 0 : baseCfg.introDuration,
    stateDuration: skipIntro ? 0 : baseCfg.introDuration,
    cooldownTimer: skipIntro ? 0.55 : baseCfg.introDuration,
    activeAttack: null,
    lastAttack: null,
    attackSequenceIndex: 0,
    telegraphLocked: false,
    attackOriginX: baseCfg.spawnX,
    attackOriginZ: baseCfg.spawnZ,
    attackDirX: Math.sin(baseCfg.spawnRotationY),
    attackDirZ: Math.cos(baseCfg.spawnRotationY),
    targetX: baseCfg.spawnX,
    targetZ: baseCfg.spawnZ + 5,
    hasDealtDamageThisAttack: false,
    shockwaveActive: false,
    shockwaveRadius: 0,
    shockwaveMaxRadius: baseCfg.attacks.anchor_slam.outerRadiusP1,
    hitFlashTimer: 0,
    koProgress: 0,
    phaseTransitionTriggered: false,
    defeatTriggered: false,
    staggerCooldownTimer: 0,
    coreExposed: false,
    statusLabel: skipIntro ? statusP1 : statusIntro,
    pinnedTimer: 0,
  };
}

export function createHelixBossState(skipIntro = false): BossState {
  return createBossStateForId('helix-04', skipIntro);
}

export function createInitialChoirState(active = false): ChoirState {
  const cfg = GAME_CONFIG.choir;
  const nodes: HarmonicNodeState[] = cfg.nodes.map((n) => ({
    id: n.id,
    label: n.label,
    index: n.index,
    x: n.x,
    z: n.z,
    radius: n.radius,
    status: 'inactive',
    primedByEventId: null,
    primedRemainingTime: 0,
    failedRemainingTime: 0,
    syncOrder: 0,
  }));
  return {
    active,
    nodes,
    syncWindowSeconds: cfg.syncWindowSeconds,
    syncTimer: 0,
    requiredNodeCount: 2,
    synchronizedCount: 0,
    completedCycles: 0,
    failureResetTimer: 0,
    lastFailureReason: null,
    processedNodeEventIds: [],
    statusMessage: active
      ? 'PRIME A PYLON WITH ECHO ATTACK [T->Y], THEN STRIKE A LINKED PYLON WITH LIVE SERA'
      : 'INACTIVE',
  };
}

export function createInitialCuratorState(active = false): CuratorState {
  return {
    active,
    traces: [],
    decoyIds: [],
    nextTraceSeq: 1,
    lastDecoySpawnTime: 0,
    statusMessage: active
      ? 'EVADE RECONSTRUCTED TRACES · USE GRAVITY PIN [G] TO LOCK DECOYS & INTERRUPT CURATOR'
      : 'INACTIVE',
  };
}

export function createInitialGravityPinState(unlocked = false): GravityPinState {
  const cfg = GAME_CONFIG.curator.gravityPin;
  return {
    unlocked,
    status: unlocked ? 'ready' : 'locked',
    fluxCost: cfg.fluxCost,
    cooldownTimer: 0,
    maxCooldown: cfg.cooldown,
    activeDurationTimer: 0,
    maxDuration: cfg.duration,
    maxRange: cfg.maxRange,
    radius: cfg.radius,
    centerX: 0,
    centerZ: 0,
    pinnedTargetIds: [],
    activationCount: 0,
    statusMessage: unlocked
      ? `GRAVITY PIN [G] READY (${cfg.fluxCost} FLUX)`
      : 'GRAVITY PIN LOCKED',
  };
}

export function createInitialMatronState(active = false): MatronState {
  return {
    active,
    siphonDrainEventsCount: 0,
    totalFluxDrained: 0,
    eraserDisruptionsCount: 0,
    chronoSeverActive: false,
    chronoSeverZoneX: 0,
    chronoSeverZoneZ: 0,
    chronoSeverRadius: GAME_CONFIG.matron.chronoSever.radius,
    chronoSeverWarningTimer: 0,
    echoSuppressedTimer: 0,
    processedStrikeEventIds: [],
    statusMessage: active
      ? 'COUNTER SIPHONS & ERASERS · DETONATE ACTIVE ECHO WITH ECHO COLLAPSE [X]'
      : 'INACTIVE',
  };
}

export function createInitialEchoCollapseState(unlocked = false): EchoCollapseState {
  const cfg = GAME_CONFIG.matron.echoCollapse;
  return {
    unlocked,
    status: unlocked ? 'no_active_echo' : 'locked',
    fluxCost: cfg.fluxCost,
    cooldownTimer: 0,
    maxCooldown: cfg.cooldown,
    blastTimer: 0,
    blastX: 0,
    blastZ: 0,
    blastRadius: cfg.blastRadius,
    damage: cfg.damage,
    postureDamage: cfg.postureDamage,
    activationCount: 0,
    lastTargetsHit: 0,
    statusMessage: unlocked
      ? `ECHO COLLAPSE [X] REQUIRES ACTIVE ECHO (${cfg.fluxCost} FLUX)`
      : 'ECHO COLLAPSE LOCKED',
  };
}

export function createInitialChronicleLoomState(active = false): ChronicleLoomState {
  return {
    active,
    endingChoiceAvailable: active,
    selectedEnding: null,
    selectionCount: 0,
    completedAtTime: null,
  };
}

export function createInitialNarrativeCommsState(): NarrativeCommsState {
  return {
    active: null,
    queue: [],
    triggeredIds: [],
    history: [],
  };
}

export type NarrativeCommKey = keyof typeof GAME_CONFIG.narrativeComms;

export function triggerNarrativeTransmission(
  world: WorldState,
  commKey: NarrativeCommKey,
  interrupt = false
): boolean {
  if (!world.comms) {
    world.comms = createInitialNarrativeCommsState();
  }
  const cfg = GAME_CONFIG.narrativeComms[commKey];
  if (!cfg || world.comms.triggeredIds.includes(cfg.id)) {
    return false;
  }

  world.comms.triggeredIds.push(cfg.id);
  const transmission: NarrativeTransmission = {
    id: cfg.id,
    speaker: cfg.speaker,
    classification: cfg.classification,
    accent: cfg.accent,
    headline: cfg.headline,
    body: cfg.body,
    tacticalHint: cfg.tacticalHint,
    remainingTime: cfg.duration,
    maxDuration: cfg.duration,
  };

  world.comms.history.push({
    id: transmission.id,
    speaker: transmission.speaker,
    classification: transmission.classification,
    accent: transmission.accent,
    headline: transmission.headline,
    body: transmission.body,
  });
  if (world.comms.history.length > 12) {
    world.comms.history.shift();
  }

  if (interrupt || !world.comms.active) {
    world.comms.active = transmission;
    world.events.push({
      type: 'comms_transmission_started',
      x: world.player?.x ?? 0,
      z: world.player?.z ?? 0,
      commsSpeaker: transmission.speaker,
      commsClassification: transmission.classification,
    });
  } else {
    world.comms.queue.push(transmission);
  }

  return true;
}

export function dismissActiveTransmission(world: WorldState): boolean {
  if (!world.comms || !world.comms.active) return false;
  if (world.comms.queue.length > 0) {
    world.comms.active = world.comms.queue.shift() ?? null;
    if (world.comms.active) {
      world.events.push({
        type: 'comms_transmission_started',
        x: world.player?.x ?? 0,
        z: world.player?.z ?? 0,
        commsSpeaker: world.comms.active.speaker,
        commsClassification: world.comms.active.classification,
      });
    }
  } else {
    world.comms.active = null;
  }
  return true;
}

const TUTORIAL_COPY: Record<
  TutorialStep,
  { title: string; desktopPrompt: string; mobilePrompt: string; stuckHint: string }
> = {
  movement_camera: {
    title: 'STEP 01 · LOCOMOTION & CAMERA CALIBRATION',
    desktopPrompt:
      'Move Sera with [WASD] and rotate the camera with Mouse Drag or [Arrow Keys].',
    mobilePrompt:
      'Use the bottom-left 4-button directional pad ([W] FWD, [A] LEFT, [S] BACK, [D] RIGHT) to move Sera and drag [CAM ORBIT] to look around Calibration Bay 04.',
    stuckHint:
      'Press [W], [A], [S], or [D] (or tap the [W] / [A] / [S] / [D] directional buttons) to step forward into Calibration Bay 04.',
  },
  combat_basics: {
    title: 'STEP 02 · CHRONO EDGE & PULSECASTER COMBAT',
    desktopPrompt:
      'Light Attack [LMB / F], Heavy [Hold LMB / E / R-Click], Switch Weapon [Tab / Z], Dodge [Space], Parry [Q].',
    mobilePrompt:
      'Tap [LIGHT] or [HEAVY] to attack, [WEAPON] to swap Chrono Edge / Pulsecaster, [DODGE] to evade, and [PARRY] (+35 Flux).',
    stuckHint:
      'Perform any attack ([F] / [E]) or defensive maneuver ([Space] / [Q]), or press [Tab / Z] to switch between Chrono Edge and Pulsecaster.',
  },
  echo_record_replay: {
    title: 'STEP 03 · CHRONO RIG RECORD & REPLAY',
    desktopPrompt:
      'Press [T] to Record up to 8s of movement & strikes, then press [Y] to spawn your autonomous Chrono Echo.',
    mobilePrompt:
      'Tap [REC] to record your movement & strikes, then tap [PLAY] to spawn your Chrono Echo.',
    stuckHint:
      'Press [T] to start recording, move or attack for at least 0.35s, then press [Y] to replay your Echo.',
  },
  puzzle_teach: {
    title: 'CALIBRATION 1/3 · ANCHOR PAD 01 (TEACH)',
    desktopPrompt:
      'Stand on Chrono Anchor Pad 01 (-3.8, 9.0), press [T] for >=1s, then press [Y] so your Echo holds the pad while you cross West.',
    mobilePrompt:
      'Stand on Anchor Pad 01, tap [REC] for >=1s, then tap [PLAY] so your Echo holds the barrier open while you cross West.',
    stuckHint:
      'Live Sera cannot hold the barrier open alone—your replaying Echo must stand on Anchor Pad 01 while Sera walks West through the open gate.',
  },
  puzzle_test: {
    title: 'CALIBRATION 2/3 · KINETIC RECEIVER (TEST)',
    desktopPrompt:
      'At Kinetic Receiver (-8.2, 13.6), face North, press [T], execute a Heavy Strike [E], and press [Y] so your Echo charges the receptor.',
    mobilePrompt:
      'At the North Kinetic Receiver, tap [REC], tap [HEAVY] facing North, then tap [PLAY] so your Echo charges the core.',
    stuckHint:
      'Only an Echo Heavy Strike [E] inside the North receptor ring charges the Kinetic Receiver (7.0s charge window).',
  },
  puzzle_combine: {
    title: 'CALIBRATION 3/3 · DUAL RESONANCE (COMBINE)',
    desktopPrompt:
      'Record [T] one clip that Heavy-strikes [E] the North Receiver AND walks onto Anchor Pad 02 (-8.2, 10.2), then Replay [Y] and cross West.',
    mobilePrompt:
      'Tap [REC], hit [HEAVY] at the North Receiver, walk onto Anchor Pad 02, tap [PLAY], and cross West through the Final Barrier.',
    stuckHint:
      'While your Echo charges the North Receiver (7s timer) and stands on Anchor Pad 02 (-8.2, 10.2), walk Sera West past (-11.8, 10.2) to breach HELIX-04.',
  },
  boss_counterplay: {
    title: 'CONTAINMENT WARDEN · HELIX-04 COUNTERPLAY',
    desktopPrompt:
      'Sidestep Vector Ram, Parry [Q] Helical Sweep (+35 Flux), clear Anchor Slam rings, and follow Echo Heavy marks with Live Heavy [E] for Convergence (+22 Stagger).',
    mobilePrompt:
      'Evade red telegraphs, tap [PARRY] on Helical Sweep, and strike with [HEAVY] after an Echo Heavy primes Yellow Resonance.',
    stuckHint:
      'Frontal armor mitigates light hits—bait HELIX-04 into white recovery windows, Parry [Q] Helical Sweep, or use Echo Heavy + Live Heavy [E] Convergence.',
  },
  choir_harmonic_nodes: {
    title: 'CHAPTER II · THE CHOIR HARMONIC SYNC',
    desktopPrompt:
      'Prime a Harmonic Pylon with an Echo attack ([T] -> [E] -> [Y]), then strike a linked Pylon with live Sera [F / E] within 8.5s to expose THE CHOIR.',
    mobilePrompt:
      'Prime a Harmonic Pylon with an Echo attack ([REC] -> [HEAVY] -> [PLAY]), then strike a linked Pylon with live Sera to expose THE CHOIR.',
    stuckHint:
      'Record [T] a strike near Soprano Pylon I (-5.4, -2.2), Replay [Y] so your Echo primes it, then strike Alto Pylon II (5.4, -2.2) or Bass Pylon III (0, 3.8) with live Sera.',
  },
  curator_gravity_pin: {
    title: 'CHAPTER III · THE CURATOR & GRAVITY PIN [G]',
    desktopPrompt:
      'Evade committed Reconstructed Traces, spot flickering False Echo decoys, and press [G] (30 Flux) to Gravity Pin decoys & interrupt non-committed Curator states.',
    mobilePrompt:
      'Evade Reconstructed Traces, spot flickering False Echo decoys, and tap [PIN G] (30 Flux) to lock decoys and disrupt THE CURATOR.',
    stuckHint:
      'Press [G] with >=30 Flux within 9.5m of False Echo decoys or THE CURATOR during pursue/telegraph to lock targets in a Gravity Pin field.',
  },
  matron_echo_collapse: {
    title: 'CHAPTER IV · MATRON-V & ECHO COLLAPSE [X]',
    desktopPrompt:
      'Counter Siphon Flux-drains & Eraser pulses, keep Echoes clear of Chrono Sever, and press [X] (25 Flux) while an Echo is active to detonate Echo Collapse.',
    mobilePrompt:
      'Counter Siphons & Erasers, avoid Chrono Sever rings, and tap [COLLAPSE X] (25 Flux) while an Echo is active to detonate it.',
    stuckHint:
      'Spawn an active Echo with [Y] near MATRON-V, Siphons, or Erasers and press [X] (25 Flux) to trigger an AoE Echo Collapse detonation.',
  },
  chronicle_loom_choice: {
    title: 'CHAPTER V · THE LAST LOOP: CHRONICLE LOOM',
    desktopPrompt:
      'All WARDEN Marshals neutralized. Select your final Chronicle Loom directive: [1] SILENCE, [2] WITNESS, or [3] CONTINUITY.',
    mobilePrompt:
      'All WARDEN Marshals neutralized. Tap SILENCE, WITNESS, or CONTINUITY on the Chronicle Loom console to resolve the loop.',
    stuckHint:
      'Select SILENCE, WITNESS, or CONTINUITY in the Chronicle Loom interface to conclude the campaign.',
  },
  completed: {
    title: 'CHRONICLE LOOM · SECTOR 04',
    desktopPrompt: 'All calibration protocols verified.',
    mobilePrompt: 'All calibration protocols verified.',
    stuckHint: '',
  },
};

export function createInitialRunState(
  mode: RunMode = 'practice_standard',
  stage: VerticalSliceStage = 'calibration',
  chapter: CampaignChapterId = mode === 'practice_boss' ? 'chapter_1_helix' : 'prologue'
): VerticalSliceRunState {
  const isIntro = stage === 'intro';
  const isTransition = stage === 'transition_to_boss';
  return {
    mode,
    stage,
    chapter,
    unlockedChapters: ['prologue'],
    completedChapters: [],
    recoveredLogs: [],
    completedEndings: [],
    pendingNextChapter: null,
    isChapterReplay: false,
    savedCampaignSnapshot: null,
    selectedEnding: null,
    introTimer: isIntro ? GAME_CONFIG.verticalSlice.introDuration : 0,
    introDuration: GAME_CONFIG.verticalSlice.introDuration,
    transitionTimer: isTransition ? GAME_CONFIG.verticalSlice.transitionDuration : 0,
    transitionDuration: GAME_CONFIG.verticalSlice.transitionDuration,
    bossCheckpoint: null,
    checkpointNotice: null,
    checkpointNoticeTimer: 0,
  };
}

export function createInitialTutorialState(
  enabled = true,
  initialStep: TutorialStep = 'movement_camera'
): TutorialState {
  const copy = TUTORIAL_COPY[initialStep];
  const isAdvancedStep =
    initialStep === 'boss_counterplay' ||
    initialStep === 'choir_harmonic_nodes' ||
    initialStep === 'curator_gravity_pin' ||
    initialStep === 'matron_echo_collapse' ||
    initialStep === 'chronicle_loom_choice' ||
    initialStep === 'completed';
  return {
    enabled,
    step: initialStep,
    stepDwellTimer: 0,
    stuckHintActive: false,
    movementCompleted: isAdvancedStep,
    combatCompleted: isAdvancedStep,
    echoRecordCompleted: isAdvancedStep,
    title: copy.title,
    desktopPrompt: copy.desktopPrompt,
    mobilePrompt: copy.mobilePrompt,
    stuckHint: copy.stuckHint,
  };
}

export function setTutorialEnabled(world: WorldState, enabled: boolean): void {
  world.tutorial.enabled = enabled;
}

export function toggleTutorialHints(world: WorldState): boolean {
  world.tutorial.enabled = !world.tutorial.enabled;
  return world.tutorial.enabled;
}

export function buildObstaclesForChapter(
  chapter: CampaignChapterId,
  disableLoomPylon = false
): ObstacleCollider[] {
  const plateCfg = GAME_CONFIG.arena.chronoPlate;
  const finalBarrierCfg = GAME_CONFIG.arena.chronoPuzzle.finalBarrier;
  const chapterProps = GAME_CONFIG.arena.chapterObstacles[chapter] ?? [];
  const isPrologue = chapter === 'prologue';
  return [
    ...GAME_CONFIG.arena.obstacles.map((o) => ({
      ...o,
      kind: 'pillar' as const,
      disabled: disableLoomPylon && o.id === 'loom-pylon',
    })),
    {
      id: plateCfg.receiverId,
      x: plateCfg.receiverX,
      z: plateCfg.receiverZ,
      radius: plateCfg.receiverRadius,
      height: plateCfg.receiverHeight,
      label: plateCfg.receiverLabel,
      kind: 'barrier' as const,
      disabled: !isPrologue,
    },
    {
      id: finalBarrierCfg.id,
      x: finalBarrierCfg.x,
      z: finalBarrierCfg.z,
      radius: finalBarrierCfg.radius,
      height: finalBarrierCfg.height,
      label: finalBarrierCfg.label,
      kind: 'barrier' as const,
      disabled: !isPrologue,
    },
    ...chapterProps.map((prop) => ({
      ...prop,
      disabled: false,
    })),
  ];
}

export function createInitialBoostPads(): ArenaBoostPad[] {
  return GAME_CONFIG.arena.boostPads.map((pad) => ({
    ...pad,
    cooldown: 0,
  }));
}

export function createInitialWorld(initialAppState: GameAppState = 'title'): WorldState {
  const obstacles = buildObstaclesForChapter('prologue', false);
  const boostPads = createInitialBoostPads();

  // Canonical 3-unit Standard Security Roster in Test Bay 04
  const enemies: EnemyState[] = [
    // Frontline heavy unit directly ahead in the clear central lane
    createEnemy('enemy-bastion-1', 'bastion', 0, 4.5, 0),
    // Fast flanker on the NW sector
    createEnemy('enemy-scrapper-1', 'scrapper', -6.5, -4.5, 0.3),
    // Ranged pulse recon drone on the NE sector
    createEnemy('enemy-scout-1', 'scout', 6.5, -5.0, -0.3),
  ];

  const pressurePlate = createInitialPressurePlateState();
  const puzzle = createInitialPuzzleState(pressurePlate);

  return {
    appState: initialAppState,
    encounterMode: 'standard',
    run: createInitialRunState('practice_standard', 'calibration', 'prologue'),
    tutorial: createInitialTutorialState(true, 'movement_camera'),
    outcome: 'none',
    outcomeDelayTimer: 0,
    elapsedTime: 0,
    hitstopTimer: 0,
    cameraTrauma: 0,
    player: createInitialPlayer(),
    projectiles: [],
    nextProjectileId: 1,
    enemies,
    boss: null,
    obstacles,
    boostPads,
    fluxPools: [],
    artilleryZones: [],
    temporalRift: null,
    riftCooldownTimer: 7.5,
    riftSpawnSeq: 1,
    recursion: null,
    overdrive: createInitialChronoOverdriveState(25),
    gauntlet: null,
    expedition: createInitialExpeditionState('prologue', false, 'combat'),
    fragmentCaches: buildFragmentCachesForChapter('prologue', []),
    sectorBeacons: buildSectorBeaconsForChapter('prologue'),
    activeStoryBlessing: null,
    echo: createInitialEchoState(),
    relay: createInitialRelayState(),
    resonance: createInitialResonanceState(),
    pressurePlate,
    puzzle,
    choir: createInitialChoirState(false),
    curator: createInitialCuratorState(false),
    matron: createInitialMatronState(false),
    gravityPin: createInitialGravityPinState(false),
    echoCollapse: createInitialEchoCollapseState(false),
    loom: createInitialChronicleLoomState(false),
    comms: createInitialNarrativeCommsState(),
    progression: createInitialWeaponProgressionState(),
    paradox: createInitialParadoxState(),
    ascension: createInitialAscensionState(),
    singularity: createInitialSingularityCombatState(),
    kineticOvercharge: createInitialKineticOverchargeState(),
    twinSync: createInitialTwinSyncState(),
    momentum: createInitialChronoMomentumState(),
    nexus: createInitialChronoNexusState(),
    weaponResonance: createInitialWeaponResonanceState(),
    chronoAegis: createInitialChronoAegisState('off'),
    chronoConfluence: createInitialChronoConfluenceState('off', null, [], 35),
    encounter: createInitialEncounterRuntimeState('prologue_calibration_bay'),
    exploration: createInitialExplorationState('prologue', null),
    events: [],
    stats: {
      damageDealt: 0,
      damageTaken: 0,
      parriesLanded: 0,
      vulnerableHits: 0,
    },
    frozenSummary: null,
  };
}

export function getChapterForBossId(bossId: BossId): CampaignChapterId {
  switch (bossId) {
    case 'the-choir':
      return 'chapter_2_choir';
    case 'the-curator':
      return 'chapter_3_curator';
    case 'matron-v':
      return 'chapter_4_matron';
    case 'warden-prime':
    case 'echo-zero':
      return 'chapter_5_loom';
    case 'helix-04':
    default:
      return 'chapter_1_helix';
  }
}

export function getBossIdForChapter(chapter: CampaignChapterId): BossId {
  switch (chapter) {
    case 'chapter_2_choir':
      return 'the-choir';
    case 'chapter_3_curator':
      return 'the-curator';
    case 'chapter_4_matron':
    case 'chapter_5_loom':
      return 'matron-v';
    case 'chapter_1_helix':
    default:
      return 'helix-04';
  }
}

export function getTutorialStepForBossId(bossId: BossId): TutorialStep {
  switch (bossId) {
    case 'the-choir':
      return 'choir_harmonic_nodes';
    case 'the-curator':
      return 'curator_gravity_pin';
    case 'matron-v':
    case 'warden-prime':
      return 'matron_echo_collapse';
    case 'helix-04':
    default:
      return 'boss_counterplay';
  }
}

function captureSavedCampaignSnapshotIfNeeded(
  world: WorldState
): SavedCampaignProgressSnapshot | null {
  if (!world.run) return null;
  if (world.run.savedCampaignSnapshot) {
    if (world.run.savedCampaignSnapshot.selectedEnding !== null) {
      return null;
    }
    return {
      ...world.run.savedCampaignSnapshot,
      unlockedChapters: [...world.run.savedCampaignSnapshot.unlockedChapters],
      completedChapters: [...world.run.savedCampaignSnapshot.completedChapters],
      recoveredLogs: [...(world.run.savedCampaignSnapshot.recoveredLogs ?? [])],
      completedEndings: [...(world.run.savedCampaignSnapshot.completedEndings ?? [])],
      bossCheckpoint: world.run.savedCampaignSnapshot.bossCheckpoint
        ? {
            ...world.run.savedCampaignSnapshot.bossCheckpoint,
            statsAtCheckpoint: {
              ...world.run.savedCampaignSnapshot.bossCheckpoint.statsAtCheckpoint,
            },
          }
        : null,
      progression: clonePersistedWeaponProgressionState(
        world.run.savedCampaignSnapshot.progression ?? world.progression
      ),
      exploration: clonePersistedExplorationState(
        world.run.savedCampaignSnapshot.exploration ?? world.exploration
      ),
    };
  }
  if (world.run.mode === 'campaign' && !world.run.isChapterReplay) {
    if (world.run.selectedEnding !== null) {
      return null;
    }

    let stage: VerticalSliceStage = world.run.stage;
    let checkpointToSave: BossCheckpointState | null = world.run.bossCheckpoint
      ? {
          ...world.run.bossCheckpoint,
          statsAtCheckpoint: { ...world.run.bossCheckpoint.statsAtCheckpoint },
        }
      : null;

    if (
      world.outcome === 'victory' &&
      world.run.pendingNextChapter !== null &&
      world.run.stage === 'completed'
    ) {
      const nextChap = world.run.pendingNextChapter;
      const nextBossId = getBossIdForChapter(nextChap);
      checkpointToSave = captureBossCheckpointFromWorld(world, nextChap, nextBossId);
    } else if (
      world.run.stage === 'completed' &&
      world.run.pendingNextChapter === null
    ) {
      stage =
        world.run.chapter === 'prologue'
          ? 'calibration'
          : world.run.chapter === 'chapter_5_loom'
            ? 'chronicle_loom'
            : 'boss_fight';
    }

    const snapUnlockedWeapons = normalizeUnlockedWeaponIds(
      world.progression?.unlockedWeaponIds
    );
    const snapEquippedWeaponId: WeaponId =
      world.player &&
      isValidWeaponId(world.player.equippedWeaponId) &&
      snapUnlockedWeapons.includes(world.player.equippedWeaponId)
        ? world.player.equippedWeaponId
        : GAME_CONFIG.weapons.defaultWeaponId;

    return {
      chapter: world.run.chapter,
      stage,
      unlockedChapters: [...world.run.unlockedChapters],
      completedChapters: [...world.run.completedChapters],
      recoveredLogs: [...(world.run.recoveredLogs ?? [])],
      completedEndings: [...(world.run.completedEndings ?? [])],
      pendingNextChapter: world.run.pendingNextChapter,
      bossCheckpoint: checkpointToSave,
      selectedEnding: world.run.selectedEnding,
      equippedWeaponId: snapEquippedWeaponId,
      progression: clonePersistedWeaponProgressionState(world.progression),
      exploration: clonePersistedExplorationState(world.exploration),
    };
  }
  return null;
}

export function hasResumableCampaign(world: WorldState): boolean {
  if (!world.run?.savedCampaignSnapshot) return false;
  return world.run.savedCampaignSnapshot.selectedEnding === null;
}

export interface CalibrationObjectiveGuidance {
  stepNumber: 1 | 2 | 3;
  totalSteps: 3;
  stage: 'teach' | 'test' | 'combine' | 'completed';
  headline: string;
  instruction: string;
  whyItMatters: string;
  completed: boolean;
}

export function getCurrentCalibrationObjective(puzzle: {
  stage: 'teach' | 'test' | 'combine' | 'completed';
  teachCompleted: boolean;
  testCompleted: boolean;
  combineCompleted: boolean;
  completed: boolean;
  teachPlateActive?: boolean;
  receiverCharged?: boolean;
  receiverChargeTimer?: number;
  combinePlateActive?: boolean;
  finalBarrierOpen?: boolean;
}): CalibrationObjectiveGuidance {
  if (puzzle.completed || puzzle.stage === 'completed') {
    return {
      stepNumber: 3,
      totalSteps: 3,
      stage: 'completed',
      headline: 'CALIBRATION COMPLETE · CONTAINMENT UNLOCKED',
      instruction: 'All three Chrono Calibration locks are synchronized. Proceed into the primary containment sector.',
      whyItMatters: 'Opening the final gate breaches Marshal HELIX-04’s containment lock.',
      completed: true,
    };
  }

  if (!puzzle.teachCompleted || puzzle.stage === 'teach') {
    return {
      stepNumber: 1,
      totalSteps: 3,
      stage: 'teach',
      headline: puzzle.teachPlateActive
        ? 'STEP 1 OF 3 · PAD 01 HELD — CROSS WEST THROUGH GATE 01'
        : 'STEP 1 OF 3 · HOLD ANCHOR PAD 01 WITH AN ECHO',
      instruction: puzzle.teachPlateActive
        ? 'Anchor Pad 01 is active and Gate 01 is open! Walk Sera West through Gate 01 (-6.2, 9.0) to reach the North Receiver.'
        : 'Stand on West Anchor Pad 01 (-4.0, 9.0), press [T] to Record briefly, then press [Y] to Replay your Echo onto the pad.',
      whyItMatters: 'Anchor pads only respond to a replaying Chrono Echo so live Sera can move freely while the gate stays open.',
      completed: false,
    };
  }

  if (!puzzle.testCompleted && puzzle.stage === 'test') {
    return {
      stepNumber: 2,
      totalSteps: 3,
      stage: 'test',
      headline: 'STEP 2 OF 3 · CHARGE THE NORTH RESONANCE RECEIVER',
      instruction:
        'Move to the North Kinetic Receiver (-8.2, 12.0), face North, press [T] to Record a Heavy Attack [E], then press [Y] to Replay.',
      whyItMatters: 'Only a directional Echo Heavy strike can energize the North Receiver for 6 seconds.',
      completed: false,
    };
  }

  if (puzzle.finalBarrierOpen) {
    return {
      stepNumber: 3,
      totalSteps: 3,
      stage: 'combine',
      headline: 'STEP 3 OF 3 · CROSS THE OPEN WEST CALIBRATION GATE',
      instruction:
        'Dual lock active! Move West across the open Final Calibration Barrier (-12.5, 10.2) before the charge expires.',
      whyItMatters: 'Crossing the open barrier completes Bay 04 calibration and triggers the HELIX-04 breach.',
      completed: false,
    };
  }

  if (puzzle.receiverCharged) {
    const rem = typeof puzzle.receiverChargeTimer === 'number' ? ` (${puzzle.receiverChargeTimer.toFixed(1)}s left)` : '';
    return {
      stepNumber: 3,
      totalSteps: 3,
      stage: 'combine',
      headline: `STEP 3 OF 3 · HOLD PAD 02 WHILE RECEIVER IS CHARGED${rem}`,
      instruction:
        'Receiver is charged! Keep an Echo holding Combine Pad 02 (-8.2, 10.2) simultaneously to open the West Gate.',
      whyItMatters: 'The final barrier requires both the North Receiver and Combine Pad 02 to be active at the same time.',
      completed: false,
    };
  }

  return {
    stepNumber: 3,
    totalSteps: 3,
    stage: 'combine',
    headline: 'STEP 3 OF 3 · SYNCHRONIZE RECEIVER & COMBINE PAD 02',
    instruction:
      'Record [T] a Heavy Attack [E] at the North Receiver (-8.2, 12.0) and step onto Combine Pad 02 (-8.2, 10.2), then Replay [Y] and cross the West Gate.',
    whyItMatters: 'Your Echo can charge the Receiver and hold Pad 02 in one recording while live Sera crosses the gate.',
    completed: false,
  };
}


export function startBossEncounter(
  world: WorldState,
  skipIntro = false,
  bossId: BossId = 'helix-04'
): void {
  const preserveTutorialEnabled = world.tutorial ? world.tutorial.enabled : true;
  const savedSnap = captureSavedCampaignSnapshotIfNeeded(world);
  const preservedUnlocked = world.run?.unlockedChapters
    ? [...world.run.unlockedChapters]
    : (['prologue'] as CampaignChapterId[]);
  const preservedCompleted = world.run?.completedChapters
    ? [...world.run.completedChapters]
    : ([] as CampaignChapterId[]);

  const preservedRecoveredLogs = world.run?.recoveredLogs
    ? [...world.run.recoveredLogs]
    : [];
  const preservedCompletedEndings = world.run?.completedEndings
    ? [...world.run.completedEndings]
    : [];

  const fresh = createInitialWorld('playing');
  const boss = createBossStateForId(bossId, skipIntro);
  const archetypeForBoss: EnemyArchetype =
    bossId === 'the-choir'
      ? 'choir'
      : bossId === 'the-curator'
        ? 'curator'
        : bossId === 'matron-v'
          ? 'matron'
          : bossId === 'warden-prime'
            ? 'warden_prime'
            : 'helix';

  const bossEnemy = createEnemy(
    boss.id,
    archetypeForBoss,
    boss.x,
    boss.z,
    boss.rotationY
  );
  bossEnemy.hp = boss.hp;
  bossEnemy.maxHp = boss.maxHp;
  bossEnemy.ghostHp = boss.ghostHp;
  bossEnemy.stagger = boss.stagger;
  bossEnemy.maxStagger = boss.maxStagger;
  bossEnemy.radius = boss.radius;
  bossEnemy.aiState = 'pursue';
  bossEnemy.cooldownTimer = boss.cooldownTimer;

  const enemies: EnemyState[] = [bossEnemy];

  const isChoir = bossId === 'the-choir';
  const isCurator = bossId === 'the-curator';
  const isMatron = bossId === 'matron-v';
  const isWardenPrime = bossId === 'warden-prime';

  const choirState = createInitialChoirState(isChoir);
  const curatorState = createInitialCuratorState(isCurator || isWardenPrime);
  const matronState = createInitialMatronState(isMatron || isWardenPrime);
  const gravityPinState = createInitialGravityPinState(
    isCurator || isMatron || isWardenPrime
  );
  const echoCollapseState = createInitialEchoCollapseState(isMatron || isWardenPrime);
  const loomState = createInitialChronicleLoomState(false);

  if (isCurator) {
    for (let i = 0; i < GAME_CONFIG.curator.decoySpawnPositions.length; i++) {
      const sp = GAME_CONFIG.curator.decoySpawnPositions[i];
      const decoyId = `curator-decoy-${i + 1}`;
      const decoy = createEnemy(decoyId, 'curator_decoy', sp.x, sp.z, 0);
      decoy.isDecoy = true;
      decoy.decoySignature = sp.signature;
      decoy.cooldownTimer = 0.8 + i * 0.35;
      enemies.push(decoy);
      curatorState.decoyIds.push(decoyId);
    }
  } else if (isMatron) {
    const siphon = createEnemy('enemy-siphon-1', 'siphon', -4.8, -1.6, 0.25);
    siphon.cooldownTimer = 0.85;
    siphon.strikeSeq = 0;
    const eraser = createEnemy('enemy-eraser-1', 'eraser', 4.8, -2.0, -0.25);
    eraser.cooldownTimer = 1.15;
    eraser.strikeSeq = 0;
    enemies.push(siphon, eraser);
  }

  const chapter = getChapterForBossId(bossId);
  const tutorialStep = getTutorialStepForBossId(bossId);

  world.appState = 'playing';
  world.encounterMode = 'boss';
  world.run = {
    ...createInitialRunState(
      'practice_boss',
      skipIntro ? 'boss_fight' : 'boss_intro',
      chapter
    ),
    unlockedChapters: preservedUnlocked,
    completedChapters: preservedCompleted,
    recoveredLogs: preservedRecoveredLogs,
    completedEndings: preservedCompletedEndings,
    savedCampaignSnapshot: savedSnap,
  };
  world.tutorial = createInitialTutorialState(preserveTutorialEnabled, tutorialStep);
  world.outcome = 'none';
  world.outcomeDelayTimer = 0;
  world.elapsedTime = 0;
  world.hitstopTimer = 0;
  world.cameraTrauma = skipIntro ? 0 : 0.28;
  const preservedEquippedWeapon: WeaponId =
    world.player && isValidWeaponId(world.player.equippedWeaponId)
      ? world.player.equippedWeaponId
      : GAME_CONFIG.weapons.defaultWeaponId;
  world.player = fresh.player;
  world.player.equippedWeaponId = preservedEquippedWeapon;
  // Position Sera in the central combat lane facing North toward the Boss
  world.player.x = 0;
  world.player.z = 5.2;
  world.player.rotationY = Math.PI;
  world.projectiles = [];
  world.nextProjectileId = 1;
  world.enemies = enemies;
  world.boss = boss;
  world.obstacles = buildObstaclesForChapter(chapter, true);
  world.boostPads = createInitialBoostPads();
  world.fluxPools = [];
  world.artilleryZones = [];
  world.temporalRift = null;
  world.riftCooldownTimer = 7.5;
  world.riftSpawnSeq = 1;
  world.recursion = null;
  world.overdrive = createInitialChronoOverdriveState(25);
  world.gauntlet = null;
  world.expedition = createInitialExpeditionState(chapter, false, 'combat');
  world.fragmentCaches = buildFragmentCachesForChapter(
    chapter,
    world.progression?.claimedRewardIds ?? []
  );
  world.sectorBeacons = buildSectorBeaconsForChapter(chapter);
  world.activeStoryBlessing = null;
  world.echo = fresh.echo;
  world.relay = fresh.relay;
  world.resonance = fresh.resonance;
  world.pressurePlate = fresh.pressurePlate;
  world.puzzle = fresh.puzzle;
  world.choir = choirState;
  world.curator = curatorState;
  world.matron = matronState;
  world.gravityPin = gravityPinState;
  world.echoCollapse = echoCollapseState;
  world.loom = loomState;
  world.comms = createInitialNarrativeCommsState();
  world.progression = cloneWeaponProgressionState(world.progression);
  const prevParadox = world.paradox;
  world.paradox = createInitialParadoxState({
    mutators: world.progression.mutators,
    speedrunEnabled: world.progression.speedrunHudEnabled,
    bestSplits: world.progression.bestSpeedrunSplits,
    bestFullRunSec: world.progression.bestSpeedrunFullSec,
    droneTier: prevParadox?.loadout.combatDroneTier ?? 0,
    paradoxRiftUnlocked: isParadoxRiftEligible(
      world.progression.unlockedVaultChapters,
      world.progression.ngPlusCycle,
      world.progression.echoZeroDefeatedCount
    ),
  });
  if (prevParadox) {
    world.paradox.loadout.aegisShieldHp = prevParadox.loadout.aegisShieldHp;
    world.paradox.loadout.overclockCoreActive = prevParadox.loadout.overclockCoreActive;
    world.paradox.loadout.naniteInjectors = Math.max(
      2,
      prevParadox.loadout.naniteInjectors
    );
  }
  applyOverdriveToEnemies(world, world.enemies, world.boss);
  world.encounter = createInitialEncounterRuntimeState('prologue_calibration_bay');
  world.exploration = createInitialExplorationState(chapter, null);
  syncResonanceUpgradeParameters(world);
  syncPlayerRigStats(world);
  world.events = [
    {
      type: 'boss_activated',
      x: boss.x,
      z: boss.z,
      enemyId: boss.id,
      bossPhase: 1,
    },
  ];
  const introCommKey: NarrativeCommKey =
    bossId === 'the-choir'
      ? 'chapter2_intro'
      : bossId === 'the-curator'
        ? 'chapter3_intro'
        : bossId === 'matron-v'
          ? 'chapter4_intro'
          : bossId === 'warden-prime'
            ? 'warden_prime_intro'
            : 'chapter1_intro';
  triggerNarrativeTransmission(world, introCommKey, true);
  world.stats = fresh.stats;
  world.frozenSummary = null;
}

export function createBossWorld(
  initialAppState: GameAppState = 'playing',
  skipIntro = false,
  bossId: BossId = 'helix-04'
): WorldState {
  const world = createInitialWorld(initialAppState);
  startBossEncounter(world, skipIntro, bossId);
  world.appState = initialAppState;
  return world;
}

export function startCampaignRun(
  world: WorldState,
  skipIntro = false,
  preserveProgression = false
): void {
  const preserveTutorialEnabled = world.tutorial ? world.tutorial.enabled : true;
  const preservedCompletedEndings = world.run?.completedEndings
    ? [...world.run.completedEndings]
    : [];
  const prevMeta = world.progression;
  const preservedProgression = preserveProgression
    ? cloneWeaponProgressionState(world.progression)
    : {
        ...createInitialWeaponProgressionState(),
        overdriveDifficulty: Boolean(prevMeta?.overdriveDifficulty),
        equippedSkinId: normalizeSeraRigSkinId(prevMeta?.equippedSkinId),
        unlockedAchievementIds: normalizeAchievementIds(prevMeta?.unlockedAchievementIds),
        paradoxEndingUnlocked: Boolean(prevMeta?.paradoxEndingUnlocked),
        echoZeroDefeatedCount: prevMeta?.echoZeroDefeatedCount ?? 0,
        lifetimeParries: prevMeta?.lifetimeParries ?? 0,
        lifetimeConvergences: prevMeta?.lifetimeConvergences ?? 0,
        mutators: normalizeChronoMutators(prevMeta?.mutators),
        bestSpeedrunSplits: normalizeSpeedrunSplits(prevMeta?.bestSpeedrunSplits),
        bestSpeedrunFullSec: prevMeta?.bestSpeedrunFullSec ?? null,
        speedrunHudEnabled: Boolean(prevMeta?.speedrunHudEnabled),
      };
  const preservedExploration = preserveProgression
    ? clonePersistedExplorationState(world.exploration)
    : null;
  const allowedStarterWeapons = normalizeUnlockedWeaponIds(
    preservedProgression.unlockedWeaponIds
  );
  const preservedWeaponId: WeaponId =
    preserveProgression &&
    world.player &&
    isValidWeaponId(world.player.equippedWeaponId) &&
    allowedStarterWeapons.includes(world.player.equippedWeaponId)
      ? world.player.equippedWeaponId
      : GAME_CONFIG.weapons.defaultWeaponId;
  const fresh = createInitialWorld('playing');
  world.appState = 'playing';
  world.encounterMode = 'standard';
  world.run = {
    ...createInitialRunState(
      'campaign',
      skipIntro ? 'calibration' : 'intro',
      'prologue'
    ),
    completedEndings: preservedCompletedEndings,
  };
  world.tutorial = createInitialTutorialState(
    preserveTutorialEnabled,
    'movement_camera'
  );
  world.outcome = 'none';
  world.outcomeDelayTimer = 0;
  world.elapsedTime = 0;
  world.hitstopTimer = 0;
  world.cameraTrauma = 0;
  world.player = fresh.player;
  world.player.equippedWeaponId = preservedWeaponId;
  world.projectiles = [];
  world.nextProjectileId = 1;
  world.enemies = fresh.enemies;
  world.boss = null;
  world.obstacles = fresh.obstacles;
  world.boostPads = fresh.boostPads;
  world.fluxPools = [];
  world.artilleryZones = [];
  world.temporalRift = null;
  world.riftCooldownTimer = 7.5;
  world.riftSpawnSeq = 1;
  world.recursion = null;
  world.overdrive = createInitialChronoOverdriveState(25);
  world.gauntlet = null;
  world.expedition = createInitialExpeditionState('prologue', false, 'combat');
  world.fragmentCaches = buildFragmentCachesForChapter(
    'prologue',
    preservedProgression.claimedRewardIds ?? []
  );
  world.sectorBeacons = buildSectorBeaconsForChapter('prologue');
  world.activeStoryBlessing = null;
  world.echo = fresh.echo;
  world.relay = fresh.relay;
  world.resonance = fresh.resonance;
  world.pressurePlate = fresh.pressurePlate;
  world.puzzle = fresh.puzzle;
  world.choir = fresh.choir;
  world.curator = fresh.curator;
  world.matron = fresh.matron;
  world.gravityPin = fresh.gravityPin;
  world.echoCollapse = fresh.echoCollapse;
  world.loom = fresh.loom;
  world.comms = createInitialNarrativeCommsState();
  world.progression = preservedProgression;
  applyOverdriveToEnemies(world, world.enemies, null);
  world.encounter = createInitialEncounterRuntimeState('prologue_calibration_bay');
  world.exploration = createInitialExplorationState('prologue', preservedExploration);
  syncUnlockedRoutesToObstacles(world);
  syncResonanceUpgradeParameters(world);
  syncPlayerRigStats(world);
  world.events = [];
  triggerNarrativeTransmission(world, 'prologue_wake', true);
  advanceMissionAndExplorationSystem(world);
  world.stats = fresh.stats;
  world.frozenSummary = null;
  const prevPx = world.paradox;
  world.paradox = createInitialParadoxState({
    mutators: world.progression.mutators,
    speedrunEnabled: world.progression.speedrunHudEnabled,
    bestSplits: world.progression.bestSpeedrunSplits,
    bestFullRunSec: world.progression.bestSpeedrunFullSec,
    droneTier: preserveProgression ? (prevPx?.loadout.combatDroneTier ?? 0) : 0,
    paradoxRiftUnlocked: isParadoxRiftEligible(
      world.progression.unlockedVaultChapters,
      world.progression.ngPlusCycle,
      world.progression.echoZeroDefeatedCount
    ),
  });
}

export function syncExpeditionState(world: WorldState, dt = 0): void {
  const chapter = world.run?.chapter ?? 'prologue';
  const ngCycle = world.progression?.ngPlusCycle ?? 0;
  if (!world.expedition) {
    world.expedition = createInitialExpeditionState(chapter, false, 'combat', false, ngCycle);
  }
  const exp = world.expedition;
  const spec = getExpeditionSectorSpec(chapter);
  exp.sectorIndex = spec.index;
  exp.totalSectors = EXPEDITION_SECTORS.length;
  exp.sectorCode = spec.code;
  exp.sectorTitle = spec.title;
  exp.wardenLabel = spec.wardenLabel;
  exp.ngPlusCycle = ngCycle;
  if (exp.phase !== 'safe_room') {
    exp.nextChapter = spec.nextChapter;
  } else if (exp.safeRoom?.nextChapter) {
    exp.nextChapter = exp.safeRoom.nextChapter;
  }
  if (exp.transitBannerTimer > 0 && dt > 0) {
    exp.transitBannerTimer = Math.max(0, exp.transitBannerTimer - dt);
  }

  const caches = world.fragmentCaches ?? [];
  const unclaimedCaches: Array<{ x: number; z: number; label: string }> = [];
  let cachesFound = 0;
  for (let i = 0; i < caches.length; i++) {
    const c = caches[i];
    if (c.claimed) {
      cachesFound++;
    } else {
      unclaimedCaches.push({ x: c.x, z: c.z, label: c.label });
    }
  }
  exp.cachesTotal = caches.length;
  exp.cachesFound = cachesFound;

  const interactables = world.exploration?.interactables ?? [];
  const unscannedTerminals: Array<{ x: number; z: number; label: string }> = [];
  let terminalsScanned = 0;
  for (let i = 0; i < interactables.length; i++) {
    const item = interactables[i];
    if (item.status === 'activated' || item.activationCount > 0) {
      terminalsScanned++;
    } else {
      unscannedTerminals.push({ x: item.x, z: item.z, label: item.label });
    }
  }
  exp.terminalsTotal = interactables.length;
  exp.terminalsScanned = terminalsScanned;

  const beacons = world.sectorBeacons ?? [];
  const inactiveBeacons: Array<{ x: number; z: number; label: string }> = [];
  let beaconsActive = 0;
  for (let i = 0; i < beacons.length; i++) {
    const b = beacons[i];
    if (b.activationCount > 0) {
      beaconsActive++;
    } else {
      inactiveBeacons.push({ x: b.x, z: b.z, label: b.label });
    }
  }
  exp.beaconsTotal = beacons.length;
  exp.beaconsActive = beaconsActive;

  // Update Safe-Room station proximity
  if (exp.phase === 'safe_room' && exp.safeRoom?.active) {
    exp.safeRoom.nearbyStation = detectNearbySafeRoomStation(
      world.player.x,
      world.player.z,
      exp.safeRoom
    );
  }

  // Update Secret Echo Vault laser switch & auto-claim when open
  if (exp.enabled && exp.phase !== 'safe_room' && exp.secretVault) {
    const echoActive =
      world.echo.state === 'playback' && Boolean(world.echo.activeActor);
    const echoX = world.echo.activeActor?.x ?? 0;
    const echoZ = world.echo.activeActor?.z ?? 0;
    const tickRes = tickSecretEchoVault(
      exp.secretVault,
      world.player.x,
      world.player.z,
      echoActive,
      echoX,
      echoZ,
      dt
    );
    if (tickRes.justOpened) {
      exp.transitBannerTimer = 4.5;
      exp.transitBannerText = `ECHO VAULT LASER GATE OPEN · CLAIM ${exp.secretVault.label.toUpperCase()} [I]`;
      world.events.push({
        type: 'secret_vault_unlocked',
        x: exp.secretVault.vaultPos.x,
        z: exp.secretVault.vaultPos.z,
      });
    }
    if (
      exp.secretVault.gateOpen &&
      !exp.secretVault.looted &&
      Math.hypot(
        world.player.x - exp.secretVault.vaultPos.x,
        world.player.z - exp.secretVault.vaultPos.z
      ) <= 1.85
    ) {
      claimSecretEchoVault(world);
      return;
    }
  }

  const activeHostiles: Array<{ x: number; z: number; label: string; isBoss?: boolean }> = [];
  for (let i = 0; i < world.enemies.length; i++) {
    const e = world.enemies[i];
    if (e.hp > 0 && e.aiState !== 'ko') {
      activeHostiles.push({
        x: e.x,
        z: e.z,
        label: e.name,
        isBoss: Boolean(world.boss && world.boss.id === e.id),
      });
    }
  }

  // If the player strikes any stasis-sealed enemy directly during Explore phase, break the seal automatically
  if (exp.enabled && exp.phase === 'explore') {
    const hostileDamaged = world.enemies.some((e) => e.hp < e.maxHp);
    if (hostileDamaged) {
      triggerExpeditionBreach(world);
      return;
    }
  }

  exp.playerInsideBreachSeal = isPlayerInsideBreachSeal(
    world.player.x,
    world.player.z,
    exp
  );
  exp.playerInsideTransitGate = isPlayerInsideTransitAirlock(
    world.player.x,
    world.player.z,
    exp
  );

  const targetNextChapter =
    exp.phase === 'safe_room'
      ? exp.safeRoom?.nextChapter ?? exp.nextChapter
      : exp.nextChapter;
  const nextSpec = targetNextChapter ? getExpeditionSectorSpec(targetNextChapter) : null;
  exp.guideTarget = computeExpeditionGuideTarget({
    enabled: exp.enabled,
    phase: exp.phase,
    playerX: world.player.x,
    playerZ: world.player.z,
    breachSealPos: exp.breachSealPos,
    transitGatePos: exp.transitGatePos,
    nextSectorTitle: nextSpec ? nextSpec.title : null,
    wardenLabel: exp.wardenLabel,
    unclaimedCaches,
    unscannedTerminals,
    inactiveBeacons,
    activeHostiles,
    safeRoom: exp.safeRoom ?? null,
    secretVault: exp.secretVault ?? null,
  });

  // Auto-transit when Sera physically walks into the unlocked North Sector Airlock
  if (exp.playerInsideTransitGate) {
    enterExpeditionTransitAirlock(world);
  }
}

export function startExpeditionJourneyRun(
  world: WorldState,
  startChapter: CampaignChapterId = 'prologue',
  preserveProgression = false
): void {
  if (startChapter === 'prologue') {
    startCampaignRun(world, true, preserveProgression);
  } else if (startChapter === 'chapter_5_loom') {
    if (!world.run) {
      startCampaignRun(world, true, preserveProgression);
    }
    world.run.mode = 'campaign';
    enterChronicleLoomChapter(world, false);
  } else {
    if (!world.run || world.run.mode !== 'campaign') {
      startCampaignRun(world, true, preserveProgression);
    }
    transitionCampaignToBoss(world, true, startChapter);
  }

  const initialPhase = startChapter === 'chapter_5_loom' ? 'combat' : 'explore';
  const spec = getExpeditionSectorSpec(startChapter);
  const alreadyLootedVault = Boolean(
    world.progression?.unlockedVaultChapters?.includes(startChapter)
  );
  const ngCycle = world.progression?.ngPlusCycle ?? 0;
  world.expedition = createInitialExpeditionState(
    startChapter,
    true,
    initialPhase,
    alreadyLootedVault,
    ngCycle
  );
  world.expedition.transitBannerTimer = 5.5;
  world.expedition.transitBannerText =
    initialPhase === 'explore'
      ? `SECTOR ${spec.code} · ${spec.title.toUpperCase()} — EXPLORE OR BREACH SEAL [I]`
      : `SECTOR ${spec.code} · ${spec.title.toUpperCase()} — APPROACH CHRONICLE LOOM`;

  // Spawn Sera cleanly inside the South Entry Boarding Airlock runway facing North
  world.player.x = 0;
  world.player.z = startChapter === 'chapter_5_loom' ? 9.5 : 10.6;
  world.player.rotationY = Math.PI;
  world.player.vx = 0;
  world.player.vz = 0;

  syncExpeditionState(world, 0);
}

export function startNewGamePlusRun(world: WorldState): number {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const nextCycle = Math.min(99, (world.progression.ngPlusCycle ?? 0) + 1);
  world.progression.ngPlusCycle = nextCycle;
  world.progression.unlockedWeaponIds = [
    'chrono_edge',
    'pulsecaster',
    'phase_rail',
    'grav_breaker',
  ];
  world.progression.lastActionMessage = `NEW GAME+ CYCLE ${nextCycle} ACTIVE · ALL 4 WEAPONS UNLOCKED`;

  startExpeditionJourneyRun(world, 'prologue', true);
  if (world.expedition) {
    world.expedition.ngPlusCycle = nextCycle;
    world.expedition.transitBannerTimer = 6.5;
    world.expedition.transitBannerText = `NEW GAME+ ${nextCycle} · ALL 4 WEAPONS PRESERVED · HOSTILES +${nextCycle * 35}% HP`;
  }
  world.events.push({
    type: 'ng_plus_started',
    x: world.player.x,
    z: world.player.z,
    amount: nextCycle,
  });
  const px = ensureParadoxState(world);
  px.paradoxRiftUnlocked = true;
  if (px.loadout.combatDroneTier < 1) {
    px.loadout.combatDroneTier = 1;
    unlockChronoAchievement(world, 'drone_commander');
  }
  unlockChronoAchievement(world, 'ng_plus_initiate');
  return nextCycle;
}

export function triggerExpeditionBreach(world: WorldState): boolean {
  const exp = world.expedition;
  if (!exp || !exp.enabled || exp.phase !== 'explore') {
    return false;
  }
  exp.phase = 'combat';
  exp.playerInsideBreachSeal = false;
  exp.transitBannerTimer = 4.0;
  exp.transitBannerText = `BREACH SEAL SHATTERED · ENGAGE ${exp.wardenLabel.toUpperCase()}`;

  if (world.boss && world.boss.aiState === 'dormant') {
    world.boss.stateTimer = Math.min(world.boss.stateTimer, 0.3);
  }
  world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.28);
  world.events.push({
    type: 'expedition_breach_triggered',
    x: exp.breachSealPos.x,
    z: exp.breachSealPos.z,
  });
  unlockChronoAchievement(world, 'first_breach');
  syncExpeditionState(world, 0);
  return true;
}

export function unlockExpeditionTransitAirlock(
  world: WorldState,
  nextChapter: CampaignChapterId
): void {
  const currentChapter = world.run?.chapter ?? 'prologue';
  const ngCycle = world.progression?.ngPlusCycle ?? 0;
  if (!world.expedition) {
    world.expedition = createInitialExpeditionState(
      currentChapter,
      true,
      'airlock_open',
      Boolean(world.progression?.unlockedVaultChapters?.includes(currentChapter)),
      ngCycle
    );
  }
  const exp = world.expedition;
  const nextSpec = getExpeditionSectorSpec(nextChapter);
  exp.enabled = true;
  exp.phase = 'airlock_open';
  exp.airlockUnlocked = true;
  exp.nextChapter = nextChapter;
  exp.transitBannerTimer = 6.5;
  exp.transitBannerText = `SECTOR CLEARED · NORTH AIRLOCK OPEN → TRANSIT HUB (${nextSpec.code} ${nextSpec.shortName})`;

  world.run.pendingNextChapter = nextChapter;
  world.outcome = 'none';
  world.outcomeDelayTimer = 0;
  world.appState = 'playing';
  world.projectiles = [];
  clearEchoState(world, 'outcome');

  world.events.push({
    type: 'expedition_airlock_unlocked',
    x: exp.transitGatePos.x,
    z: exp.transitGatePos.z,
  });
  syncExpeditionState(world, 0);
}

export function enterExpeditionSafeRoom(
  world: WorldState,
  fromChapter: CampaignChapterId,
  nextChapter: CampaignChapterId
): boolean {
  const nextSpec = getExpeditionSectorSpec(nextChapter);
  const ngCycle = world.progression?.ngPlusCycle ?? 0;

  // Clear active combat entities, cover silos, and sector clutter for a calm open Sanctuary
  world.enemies = [];
  world.boss = null;
  world.projectiles = [];
  world.fluxPools = [];
  world.artilleryZones = [];
  world.temporalRift = null;
  world.fragmentCaches = [];
  world.sectorBeacons = [];
  world.boostPads = [];
  if (world.exploration) {
    world.exploration.interactables = [];
    world.exploration.hazards = [];
    world.exploration.secrets = [];
    if (world.exploration.prompt) {
      world.exploration.prompt.interactableId = null;
      world.exploration.prompt.canInteract = false;
      world.exploration.prompt.promptText = '';
      world.exploration.prompt.detailText = '';
    }
    world.exploration.nearbyExpansionPrompt = null;
  }
  if (world.ascension?.style) {
    world.ascension.style.points = 0;
    world.ascension.style.tier = 'D';
    world.ascension.style.finisherReady = false;
    world.ascension.style.lastActionLabel = '';
  }
  if (world.comms) {
    world.comms.active = null;
    world.comms.queue = [];
  }
  world.run.checkpointNotice = null;
  world.run.checkpointNoticeTimer = 0;
  const safeRoom = createSafeRoomState(fromChapter, nextChapter);
  world.expedition = {
    ...createInitialExpeditionState(fromChapter, true, 'safe_room', true, ngCycle),
    phase: 'safe_room',
    nextChapter,
    airlockUnlocked: true,
    safeRoom,
    secretVault: null,
    transitBannerTimer: 5.0,
    transitBannerText: `SANCTUARY HUB · RESUPPLY & REFIT BEFORE SECTOR ${nextSpec.code} (${nextSpec.shortName})`,
  };

  world.outcome = 'none';
  world.outcomeDelayTimer = 0;
  world.appState = 'playing';
  world.run.pendingNextChapter = nextChapter;
  clearEchoState(world, 'outcome');

  if (Array.isArray(world.obstacles)) {
    for (let i = 0; i < world.obstacles.length; i++) {
      const obs = world.obstacles[i];
      if (obs && obs.id !== 'loom-pylon') {
        obs.disabled = true;
      }
    }
  }

  world.player.x = 0;
  world.player.z = 10.6;
  world.player.rotationY = Math.PI;
  world.player.vx = 0;
  world.player.vz = 0;

  world.events.push({
    type: 'safe_room_entered',
    x: world.player.x,
    z: world.player.z,
  });
  syncExpeditionState(world, 0);
  return true;
}

export function useSafeRoomMedBay(world: WorldState): boolean {
  const exp = world.expedition;
  if (!exp || !exp.enabled || exp.phase !== 'safe_room' || !exp.safeRoom?.active) {
    return false;
  }
  if (exp.safeRoom.medBayUsed) {
    return false;
  }
  const mutMods = computeMutatorModifiers(world.paradox?.mutators ?? world.progression?.mutators);
  if (!mutMods.allowHealing) {
    exp.transitBannerTimer = 3.5;
    exp.transitBannerText = 'IRONMAN PROTOCOL ACTIVE · MED-SUPPLY HEALING LOCKED';
    return false;
  }
  const p = world.player;
  p.integrity = p.maxIntegrity;
  p.ghostIntegrity = p.maxIntegrity;
  p.flux = p.maxFlux;
  if (!world.overdrive) {
    world.overdrive = createInitialChronoOverdriveState(25);
  }
  world.overdrive = addOverdriveCharge(world.overdrive, 35);
  exp.safeRoom.medBayUsed = true;
  exp.transitBannerTimer = 4.5;
  exp.transitBannerText = 'MED-SUPPLY BAY · INTEGRITY 100% · FLUX 100 · +35% OVERDRIVE';

  world.events.push({
    type: 'safe_room_med_used',
    x: exp.safeRoom.medBayPos.x,
    z: exp.safeRoom.medBayPos.z,
    amount: 35,
  });
  unlockChronoAchievement(world, 'safe_room_engineer');
  syncExpeditionState(world, 0);
  return true;
}

export function claimSafeRoomLysaBriefing(world: WorldState): boolean {
  const exp = world.expedition;
  if (!exp || !exp.enabled || exp.phase !== 'safe_room' || !exp.safeRoom?.active) {
    return false;
  }
  if (exp.safeRoom.lysaBriefingClaimed) {
    return false;
  }
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const ngMods = getNgPlusModifiers(world.progression.ngPlusCycle ?? 0);
  const bonusFrags = Math.max(1, Math.round(1 * ngMods.fragmentBonusMultiplier));
  world.progression.memoryFragments = Math.min(
    999,
    world.progression.memoryFragments + bonusFrags
  );
  world.progression.lastActionMessage = `${exp.safeRoom.lysaIntelHeadline} (+${bonusFrags} FRAG)`;
  exp.safeRoom.lysaBriefingClaimed = true;
  exp.transitBannerTimer = 6.0;
  exp.transitBannerText = `${exp.safeRoom.lysaIntelHeadline} · +${bonusFrags} MEMORY FRAGMENT`;

  world.events.push({
    type: 'safe_room_lysa_briefing',
    x: exp.safeRoom.lysaPos.x,
    z: exp.safeRoom.lysaPos.z,
    amount: bonusFrags,
  });
  syncExpeditionState(world, 0);
  return true;
}

export function claimSecretEchoVault(world: WorldState): boolean {
  const vault = world.expedition?.secretVault;
  if (!vault || !vault.gateOpen || vault.looted) {
    return false;
  }
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  vault.looted = true;
  vault.gateOpen = true;
  if (!world.progression.unlockedVaultChapters.includes(vault.chapter)) {
    world.progression.unlockedVaultChapters.push(vault.chapter);
  }
  const ngMods = getNgPlusModifiers(world.progression.ngPlusCycle ?? 0);
  const reward = Math.max(
    1,
    Math.round(vault.rewardFragments * ngMods.fragmentBonusMultiplier)
  );
  world.progression.memoryFragments = Math.min(
    999,
    world.progression.memoryFragments + reward
  );
  world.progression.lastActionMessage = `SECRET VAULT CLAIMED · ${vault.label.toUpperCase()} (+${reward} FRAG)`;

  world.player.integrity = Math.min(
    world.player.maxIntegrity,
    world.player.integrity + 25
  );
  world.player.ghostIntegrity = Math.max(
    world.player.ghostIntegrity,
    world.player.integrity
  );
  if (!world.overdrive) {
    world.overdrive = createInitialChronoOverdriveState(25);
  }
  world.overdrive = addOverdriveCharge(world.overdrive, 25);

  if (world.expedition) {
    world.expedition.transitBannerTimer = 5.0;
    world.expedition.transitBannerText = `SECRET VAULT CLAIMED · +${reward} FRAGMENTS · +25% OVERDRIVE · +25 INTEGRITY`;
  }

  world.events.push({
    type: 'secret_vault_looted',
    x: vault.vaultPos.x,
    z: vault.vaultPos.z,
    amount: reward,
  });
  unlockChronoAchievement(world, 'vault_raider');
  if (world.progression.unlockedVaultChapters.length >= 5) {
    unlockChronoAchievement(world, 'all_vaults');
  }
  const pxVault = ensureParadoxState(world);
  pxVault.paradoxRiftUnlocked = isParadoxRiftEligible(
    world.progression.unlockedVaultChapters,
    world.progression.ngPlusCycle,
    world.progression.echoZeroDefeatedCount
  );
  syncExpeditionState(world, 0);
  return true;
}

export function enterExpeditionTransitAirlock(world: WorldState): boolean {
  const exp = world.expedition;
  if (
    !exp ||
    !exp.enabled ||
    !exp.airlockUnlocked ||
    (exp.phase !== 'airlock_open' && exp.phase !== 'safe_room')
  ) {
    return false;
  }

  // Step 1: From a cleared sector's North Airlock -> Enter the Pressurized Safe-Room Hub first
  if (exp.phase === 'airlock_open') {
    const nextChapter = exp.nextChapter ?? world.run?.pendingNextChapter ?? null;
    if (!nextChapter) {
      return false;
    }
    return enterExpeditionSafeRoom(world, world.run?.chapter ?? 'prologue', nextChapter);
  }

  // Step 2: From Safe-Room North Departure Airlock -> Launch the upcoming Sector!
  const nextChapter =
    exp.safeRoom?.nextChapter ?? exp.nextChapter ?? world.run?.pendingNextChapter ?? null;
  if (!nextChapter) {
    return false;
  }

  world.run.pendingNextChapter = nextChapter;
  const advanced = advanceCampaignChapter(world, true);
  if (!advanced) {
    return false;
  }

  const nextPhase = nextChapter === 'chapter_5_loom' ? 'combat' : 'explore';
  const nextSpec = getExpeditionSectorSpec(nextChapter);
  const alreadyLootedVault = Boolean(
    world.progression?.unlockedVaultChapters?.includes(nextChapter)
  );
  const ngCycle = world.progression?.ngPlusCycle ?? 0;
  world.expedition = createInitialExpeditionState(
    nextChapter,
    true,
    nextPhase,
    alreadyLootedVault,
    ngCycle
  );
  world.expedition.transitBannerTimer = 5.5;
  world.expedition.transitBannerText =
    nextPhase === 'explore'
      ? `SECTOR ${nextSpec.code} ARRIVAL · ${nextSpec.title.toUpperCase()} — EXPLORE OR BREACH SEAL [I]`
      : `FINAL SECTOR ${nextSpec.code} · ${nextSpec.title.toUpperCase()} — CONFRONT CHRONICLE LOOM`;

  world.player.x = 0;
  world.player.z = nextChapter === 'chapter_5_loom' ? 9.5 : 10.6;
  world.player.rotationY = Math.PI;
  world.player.vx = 0;
  world.player.vz = 0;

  const pxTransit = ensureParadoxState(world);
  const completedChap = world.run?.chapter ?? 'prologue';
  const splitRes = recordSpeedrunSectorSplit(pxTransit.speedrun, completedChap);
  if (world.progression) {
    world.progression.bestSpeedrunSplits = { ...pxTransit.speedrun.bestSplits };
    world.progression.bestSpeedrunFullSec = pxTransit.speedrun.bestFullRunSec;
  }
  pxTransit.loadout.overclockCoreActive = false;
  if (splitRes.isNewBest && pxTransit.speedrun.enabled) {
    world.expedition.transitBannerText += ` · SPLIT ${formatSpeedrunClock(splitRes.splitSec)} (${formatSpeedrunDelta(splitRes.deltaSec)})`;
  }

  world.events.push({
    type: 'expedition_sector_transit',
    x: world.player.x,
    z: world.player.z,
  });
  syncExpeditionState(world, 0);
  return true;
}

export function ensureParadoxState(world: WorldState): ParadoxRuntimeState {
  if (!world.paradox) {
    world.paradox = createInitialParadoxState({
      mutators: world.progression?.mutators,
      speedrunEnabled: world.progression?.speedrunHudEnabled,
      bestSplits: world.progression?.bestSpeedrunSplits,
      bestFullRunSec: world.progression?.bestSpeedrunFullSec,
      paradoxRiftUnlocked: isParadoxRiftEligible(
        world.progression?.unlockedVaultChapters ?? [],
        world.progression?.ngPlusCycle ?? 0,
        world.progression?.echoZeroDefeatedCount ?? 0
      ),
    });
  }
  return world.paradox;
}

function getParadoxOutgoingDamageMult(world: WorldState): number {
  const px = world.paradox;
  const mutMods = computeMutatorModifiers(px?.mutators ?? world.progression?.mutators);
  const ocMult = px?.loadout?.overclockCoreActive ? 1.25 : 1.0;
  const bossCoreMods = computeBossCoreModifiers(
    world.progression?.equippedBossCore,
    world.progression?.transcendedBossCores
  );
  const confluence = computeSentinelCoreConfluence(
    normalizeSentinelMode(world.progression?.sentinelMode),
    world.progression?.equippedBossCore,
    world.progression?.transcendedBossCores
  );
  const holoResonance = computeHoloMemoryResonanceBonus(
    world.exploration?.discoveredHoloMemoryIds
  );
  const masterySeal = computeMasterySealModifiers(world.progression?.combatMastery);
  return (
    mutMods.playerDamageMult *
    ocMult *
    bossCoreMods.allDamageMultiplier *
    confluence.allDamageMultiplier *
    holoResonance.allDamageMult *
    masterySeal.allDamageMult
  );
}

function applyBossCoreRadialPulse(
  world: WorldState,
  centerX: number,
  centerZ: number,
  radius: number,
  baseDamage: number,
  staggerAmount: number
): number {
  if (radius <= 0 || baseDamage <= 0) return 0;
  const scaledDmg = Math.max(1, Math.round(baseDamage * getParadoxOutgoingDamageMult(world)));
  const px = ensureParadoxState(world);
  let hits = 0;
  for (let i = 0; i < world.enemies.length; i++) {
    const cand = world.enemies[i];
    if (cand.hp <= 0 || cand.aiState === 'ko') continue;
    if (Math.hypot(cand.x - centerX, cand.z - centerZ) <= radius + cand.radius) {
      hits += 1;
      cand.hp = Math.max(0, cand.hp - scaledDmg);
      cand.hitFlashTimer = Math.max(cand.hitFlashTimer, 0.18);
      world.stats.damageDealt += scaledDmg;
      const isBossCand = world.boss !== null && world.boss.id === cand.id;
      const bossStagImmune =
        isBossCand &&
        world.boss !== null &&
        (world.boss.staggerCooldownTimer > 0 || world.boss.aiState === 'phase_transition');
      if (!bossStagImmune && cand.aiState !== 'staggered') {
        cand.stagger = Math.min(cand.maxStagger, cand.stagger + staggerAmount);
      }
      if (isBossCand && world.boss) {
        world.boss.hp = cand.hp;
        if (!bossStagImmune && world.boss.aiState !== 'staggered') {
          world.boss.stagger = Math.min(world.boss.maxStagger, world.boss.stagger + staggerAmount);
        }
      }
      pushDamagePopup(px, scaledDmg, cand.x, isBossCand ? 2.55 : 2.05, cand.z, 'convergence');
      if (cand.hp <= 0) {
        handleEnemyZeroHpDefeat(world, cand, scaledDmg, true, false, false);
      }
    }
  }
  world.events.push({
    type: 'boss_core_pulse',
    x: centerX,
    z: centerZ,
    amount: scaledDmg,
  });
  return hits;
}

function triggerEchoDoctrineNovaPulse(
  world: WorldState,
  centerX: number,
  centerZ: number
): number {
  const docSpec = getEchoDoctrineSpec(world.progression?.echoDoctrine);
  if (
    docSpec.novaPulseRadius <= 0 ||
    docSpec.novaPulseDamage <= 0 ||
    (world.echo.novaPulseCooldownTimer ?? 0) > 0 ||
    world.outcome !== 'none' ||
    world.player?.actionState === 'dead'
  ) {
    return 0;
  }
  world.echo.novaPulseCooldownTimer = docSpec.novaCooldownSec;
  const scaledDmg = Math.max(
    1,
    Math.round(
      docSpec.novaPulseDamage *
        docSpec.echoDamageMultiplier *
        getActiveRecursionModifiers(world).echoDamageMultiplier *
        getParadoxOutgoingDamageMult(world)
    )
  );
  const scaledStagger = Math.round(
    docSpec.novaPulseStagger *
      docSpec.echoStaggerMultiplier *
      getActiveRecursionModifiers(world).echoStaggerMultiplier
  );
  const px = ensureParadoxState(world);
  let hits = 0;
  for (let i = 0; i < world.enemies.length; i++) {
    const cand = world.enemies[i];
    if (cand.hp <= 0 || cand.aiState === 'ko') continue;
    const dist = Math.hypot(cand.x - centerX, cand.z - centerZ);
    if (dist <= docSpec.novaPulseRadius + cand.radius) {
      hits += 1;
      cand.hp = Math.max(0, cand.hp - scaledDmg);
      cand.hitFlashTimer = Math.max(cand.hitFlashTimer, 0.2);
      world.stats.damageDealt += scaledDmg;
      const isBossCand = world.boss !== null && world.boss.id === cand.id;
      if (docSpec.novaPullDistance > 0 && dist > 1.2 && !isBossCand) {
        const pull = Math.min(docSpec.novaPullDistance, dist - 1.2);
        cand.x += ((centerX - cand.x) / dist) * pull;
        cand.z += ((centerZ - cand.z) / dist) * pull;
      }
      const bossStagImmune =
        isBossCand &&
        world.boss !== null &&
        (world.boss.staggerCooldownTimer > 0 || world.boss.aiState === 'phase_transition');
      if (!bossStagImmune && cand.aiState !== 'staggered') {
        cand.stagger = Math.min(cand.maxStagger, cand.stagger + scaledStagger);
      }
      if (isBossCand && world.boss) {
        world.boss.hp = cand.hp;
        if (!bossStagImmune && world.boss.aiState !== 'staggered') {
          world.boss.stagger = Math.min(world.boss.maxStagger, world.boss.stagger + scaledStagger);
        }
      }
      pushDamagePopup(px, scaledDmg, cand.x, isBossCand ? 2.55 : 2.05, cand.z, 'convergence');
      if (cand.hp <= 0) {
        handleEnemyZeroHpDefeat(world, cand, scaledDmg, true, false, false);
      }
    }
  }
  world.events.push({
    type: 'echo_doctrine_nova_pulse',
    x: centerX,
    z: centerZ,
    amount: scaledDmg,
  });
  return hits;
}

export const SOVEREIGN_ASTRAL_PULSE_CONFIG = {
  radius: 5.8,
  damagePerTier: 18,
  staggerPerTier: 8,
} as const;

export function applySovereignAstralPulse(world: WorldState, sealTier: number): number {
  const clampedTier = Math.max(0, Math.min(4, Math.floor(sealTier)));
  if (
    clampedTier <= 0 ||
    !world ||
    !world.player ||
    world.player.actionState === 'dead' ||
    world.outcome !== 'none'
  ) {
    return 0;
  }
  const centerX = world.player.x;
  const centerZ = world.player.z;
  const pulseDmg = SOVEREIGN_ASTRAL_PULSE_CONFIG.damagePerTier * clampedTier;
  const pulseStagger = SOVEREIGN_ASTRAL_PULSE_CONFIG.staggerPerTier * clampedTier;
  const px = ensureParadoxState(world);
  let hits = 0;

  for (let i = 0; i < world.enemies.length; i += 1) {
    const cand = world.enemies[i];
    if (cand.hp <= 0 || cand.aiState === 'ko') continue;
    const dist = Math.hypot(cand.x - centerX, cand.z - centerZ);
    if (dist <= SOVEREIGN_ASTRAL_PULSE_CONFIG.radius + cand.radius) {
      hits += 1;
      cand.hp = Math.max(0, cand.hp - pulseDmg);
      cand.hitFlashTimer = Math.max(cand.hitFlashTimer, 0.22);
      world.stats.damageDealt += pulseDmg;
      const isBossCand = world.boss !== null && world.boss.id === cand.id;
      const bossStagImmune =
        isBossCand &&
        world.boss !== null &&
        (world.boss.staggerCooldownTimer > 0 || world.boss.aiState === 'phase_transition');
      if (!bossStagImmune && cand.aiState !== 'staggered') {
        cand.stagger = Math.min(cand.maxStagger, cand.stagger + pulseStagger);
      }
      if (isBossCand && world.boss) {
        world.boss.hp = cand.hp;
        if (!bossStagImmune && world.boss.aiState !== 'staggered') {
          world.boss.stagger = Math.min(world.boss.maxStagger, world.boss.stagger + pulseStagger);
        }
      }
      pushDamagePopup(px, pulseDmg, cand.x, isBossCand ? 2.55 : 2.05, cand.z, 'convergence');
      if (cand.hp <= 0) {
        handleEnemyZeroHpDefeat(world, cand, pulseDmg, true, false, false);
      }
    }
  }

  world.events.push({
    type: 'sovereign_astral_pulse',
    x: centerX,
    z: centerZ,
    amount: pulseDmg,
  });
  return hits;
}

export function grantConfluenceCharge(world: WorldState, amount: number): number {
  const conf = ensureChronoConfluenceState(world);
  if (amount <= 0 || conf.doctrineId === 'none') return conf.charge;
  const masterySeal = computeMasterySealModifiers(world.progression?.combatMastery);
  const scaledAmount = amount * masterySeal.overdriveChargeMult;
  if (conf.cooldownTimer <= 0) {
    conf.charge = Math.max(0, Math.min(100, conf.charge + scaledAmount));
  }
  conf.ready = conf.cooldownTimer <= 0 && conf.charge >= 100;
  return conf.charge;
}

export function triggerConfluenceBurst(world: WorldState): boolean {
  if (!world || !world.player || world.player.actionState === 'dead') return false;
  const conf = ensureChronoConfluenceState(world);
  const summary = computeSentinelCoreConfluence(
    normalizeSentinelMode(world.progression?.sentinelMode),
    world.progression?.equippedBossCore,
    world.progression?.transcendedBossCores
  );
  if (!summary.active || conf.cooldownTimer > 0 || conf.charge < 100) {
    return false;
  }

  const recConfMult = getActiveRecursionModifiers(world).confluenceCooldownMultiplier;
  const effectiveConfluenceCooldown = Number(
    (CONFLUENCE_BURST_COOLDOWN_SEC * recConfMult).toFixed(2)
  );
  conf.charge = 0;
  conf.cooldownTimer = effectiveConfluenceCooldown;
  conf.maxCooldown = effectiveConfluenceCooldown;
  conf.ready = false;
  conf.totalBursts += 1;

  const p = world.player;
  const aegis = ensureChronoAegisState(world);
  const px = ensureParadoxState(world);
  const scaledDmg = Math.max(
    1,
    Math.round(
      summary.burstDamage *
        getPlayerRigSetSynergy(world).damageMultiplier *
        getParadoxOutgoingDamageMult(world)
    )
  );

  if (summary.burstWardRestoreRatio > 0 && aegis.maxWard > 0) {
    const wardGain = Math.round(aegis.maxWard * summary.burstWardRestoreRatio);
    aegis.ward = Math.min(aegis.maxWard, aegis.ward + wardGain);
    aegis.rechargeDelayTimer = 0;
  }
  if (summary.burstHeatRelief > 0) {
    p.weaponHeat = Math.max(0, (p.weaponHeat ?? 0) - summary.burstHeatRelief);
    p.weaponOverheatTimer = 0;
  }
  if (summary.burstFluxRestore > 0) {
    p.flux = Math.min(p.maxFlux, p.flux + summary.burstFluxRestore);
  }
  if (summary.burstTwinSyncBonus > 0 && world.twinSync) {
    addTwinSyncBonus(
      world.twinSync,
      summary.burstTwinSyncBonus,
      world.echo.state === 'recording' || world.echo.state === 'playback'
    );
  }

  if (summary.burstTargetCap > 0) {
    const candidates = world.enemies
      .filter(
        (cand) =>
          cand.hp > 0 &&
          cand.aiState !== 'ko' &&
          Math.hypot(cand.x - p.x, cand.z - p.z) <= summary.burstRadius + cand.radius
      )
      .sort(
        (a, b) =>
          Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z)
      )
      .slice(0, summary.burstTargetCap);

    for (let i = 0; i < candidates.length; i++) {
      const cand = candidates[i];
      cand.hp = Math.max(0, cand.hp - scaledDmg);
      cand.hitFlashTimer = Math.max(cand.hitFlashTimer, 0.2);
      world.stats.damageDealt += scaledDmg;
      const isBossCand = world.boss !== null && world.boss.id === cand.id;
      const bossStagImmune =
        isBossCand &&
        world.boss !== null &&
        (world.boss.staggerCooldownTimer > 0 || world.boss.aiState === 'phase_transition');
      if (!bossStagImmune && cand.aiState !== 'staggered') {
        cand.stagger = Math.min(cand.maxStagger, cand.stagger + summary.burstStagger);
      }
      if (isBossCand && world.boss) {
        world.boss.hp = cand.hp;
        if (!bossStagImmune && world.boss.aiState !== 'staggered') {
          world.boss.stagger = Math.min(
            world.boss.maxStagger,
            world.boss.stagger + summary.burstStagger
          );
        }
      }
      pushDamagePopup(px, scaledDmg, cand.x, isBossCand ? 2.6 : 2.1, cand.z, 'convergence');
      world.events.push({
        type: 'combat_drone_fired',
        x: cand.x,
        z: cand.z,
        originX: aegis.droneX || p.x,
        originZ: aegis.droneZ || p.z,
        amount: scaledDmg,
        enemyId: cand.id,
      });
      if (cand.hp <= 0) {
        handleEnemyZeroHpDefeat(world, cand, scaledDmg, true, false, false);
      }
    }
  } else if (summary.burstRadius > 0) {
    applyBossCoreRadialPulse(
      world,
      p.x,
      p.z,
      summary.burstRadius,
      summary.burstDamage,
      summary.burstStagger
    );
  }

  world.hitstopTimer = Math.max(world.hitstopTimer, 0.045);
  world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.42);
  world.events.push({
    type: 'confluence_burst_triggered',
    x: p.x,
    z: p.z,
    amount: scaledDmg,
  });
  return true;
}

function triggerCuratorGravityVortex(
  world: WorldState,
  centerX: number,
  centerZ: number
): void {
  const spec = computeBossCoreModifiers(
    world.progression?.equippedBossCore,
    world.progression?.transcendedBossCores
  ).spec;
  if (!spec || spec.heavyPullRadius <= 0) return;
  let pulledCount = 0;
  for (let i = 0; i < world.enemies.length; i++) {
    const cand = world.enemies[i];
    if (cand.hp <= 0 || cand.aiState === 'ko') continue;
    const dx = centerX - cand.x;
    const dz = centerZ - cand.z;
    const dist = Math.hypot(dx, dz);
    if (dist > 0.25 && dist <= spec.heavyPullRadius + cand.radius) {
      const pullScale = world.boss && world.boss.id === cand.id ? 0.35 : 1.0;
      const step = Math.min(dist * 0.65, spec.heavyPullStep * pullScale);
      cand.x += (dx / dist) * step;
      cand.z += (dz / dist) * step;
      pulledCount += 1;
    }
  }
  if (world.momentum && world.momentum.weakpointTimer > 0 && spec.weakpointExtendSec > 0) {
    world.momentum.weakpointTimer = Math.min(
      5.5,
      world.momentum.weakpointTimer + spec.weakpointExtendSec
    );
  }
  if (pulledCount > 0 || (world.momentum?.weakpointTimer ?? 0) > 0) {
    world.events.push({
      type: 'boss_core_pulse',
      x: centerX,
      z: centerZ,
      amount: pulledCount,
    });
  }
}

export function ensureAscensionState(
  world: WorldState
): import('./types.ts').AscensionRuntimeState {
  if (!world.ascension) {
    world.ascension = createInitialAscensionState();
  }
  return world.ascension;
}

export function ensureSingularityState(
  world: WorldState
): import('./types.ts').SingularityCombatState {
  if (!world.singularity) {
    world.singularity = createInitialSingularityCombatState();
  }
  return world.singularity;
}

export function ensureKineticOverchargeState(
  world: WorldState
): import('./types.ts').KineticOverchargeState {
  if (!world.kineticOvercharge) {
    world.kineticOvercharge = createInitialKineticOverchargeState();
  }
  return world.kineticOvercharge;
}

export function ensureTwinSyncState(
  world: WorldState
): import('./types.ts').TwinSyncState {
  if (!world.twinSync) {
    world.twinSync = createInitialTwinSyncState();
  }
  return world.twinSync;
}

export function ensureChronoMomentumState(
  world: WorldState
): import('./types.ts').ChronoMomentumState {
  if (!world.momentum) {
    world.momentum = createInitialChronoMomentumState();
  }
  return world.momentum;
}

export function ensureChronoNexusState(
  world: WorldState
): import('./types.ts').ChronoNexusState {
  if (!world.nexus) {
    world.nexus = createInitialChronoNexusState();
  }
  return world.nexus;
}

export function ensureWeaponResonanceState(
  world: WorldState
): import('./types.ts').WeaponResonanceState {
  if (!world.weaponResonance) {
    world.weaponResonance = createInitialWeaponResonanceState();
  }
  return world.weaponResonance;
}

export function unlockChronoScythe(world: WorldState): boolean {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  unlockPlayerWeapon(world, 'chrono_scythe');
  world.player.equippedWeaponId = 'chrono_scythe';
  world.progression.lastActionMessage = 'CHRONO SCYTHE UNLOCKED & EQUIPPED [5]';
  world.events.push({
    type: 'weapon_unlocked',
    x: world.player.x,
    z: world.player.z,
    weaponId: 'chrono_scythe',
  });
  return true;
}

export function purchaseAndEquipWeaponModChip(
  world: WorldState,
  chipId: import('./types.ts').WeaponModChipId | null
): boolean {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  if (!Array.isArray(world.progression.unlockedModChipIds)) {
    world.progression.unlockedModChipIds = ['mod_volt_arc'];
  }
  if (chipId === null) {
    world.progression.equippedModChipId = null;
    world.progression.lastActionMessage = 'MOD SOCKET CLEARED';
    return true;
  }
  const def = getWeaponModChipDefinition(chipId);
  if (!def) return false;

  if (!world.progression.unlockedModChipIds.includes(chipId)) {
    if (world.progression.memoryFragments < def.cost) {
      world.progression.lastActionMessage = `NEED ${def.cost}F MEMORY FRAGMENTS FOR ${def.name}`;
      return false;
    }
    world.progression.memoryFragments -= def.cost;
    world.progression.unlockedModChipIds.push(chipId);
  }
  world.progression.equippedModChipId = chipId;
  world.progression.lastActionMessage = `${def.name} SOCKETED`;
  world.events.push({
    type: 'weapon_upgrade_equipped',
    x: world.player.x,
    z: world.player.z,
  });
  return true;
}

export function triggerChronoFinisher(world: WorldState): boolean {
  const asc = ensureAscensionState(world);
  const p = world.player;
  if (world.appState !== 'playing' || world.outcome !== 'none' || p.actionState === 'dead') {
    return false;
  }

  let hasNearbyStaggered = false;
  for (let i = 0; i < world.enemies.length; i++) {
    const e = world.enemies[i];
    if (e.hp > 0 && e.aiState === 'staggered' && Math.hypot(e.x - p.x, e.z - p.z) <= 6.0) {
      hasNearbyStaggered = true;
      break;
    }
  }

  if (!canTriggerChronoFinisher(asc.style, hasNearbyStaggered)) {
    return false;
  }

  const px = ensureParadoxState(world);
  const finisherRadius = 5.6;
  const finisherDamage = Math.round(95 * getParadoxOutgoingDamageMult(world));
  const finisherStagger = 48;

  asc.style.finisherCooldown = 8.0;
  asc.style.finisherActiveTimer = 0.65;
  asc.style.finisherReady = false;
  asc.style.totalFinishersUsed += 1;
  asc.finisherRiftTimer = 1.45;
  asc.finisherRiftX = p.x;
  asc.finisherRiftZ = p.z;
  recordStyleAction(asc.style, 'finisher', 42, 'CHRONO FINISHER');

  p.invulnTimer = Math.max(p.invulnTimer, 0.85);
  p.integrity = Math.min(p.maxIntegrity, p.integrity + 12);
  p.ghostIntegrity = Math.max(p.ghostIntegrity, p.integrity);
  p.flux = Math.min(p.maxFlux, p.flux + 20);
  world.hitstopTimer = Math.max(world.hitstopTimer, 0.12);
  world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.62);

  world.events.push({
    type: 'chrono_finisher_triggered',
    x: p.x,
    z: p.z,
    amount: finisherDamage,
    isHeavy: true,
    isCriticalOrVulnerable: true,
    weaponId: p.equippedWeaponId,
  });

  for (let i = 0; i < world.enemies.length; i++) {
    const enemy = world.enemies[i];
    if (enemy.hp <= 0 || enemy.aiState === 'ko') continue;
    const dist = Math.hypot(enemy.x - p.x, enemy.z - p.z);
    if (dist > finisherRadius + enemy.radius) continue;

    enemy.hp = Math.max(0, enemy.hp - finisherDamage);
    enemy.stagger = Math.min(enemy.maxStagger, enemy.stagger + finisherStagger);
    enemy.hitFlashTimer = 0.28;
    world.stats.damageDealt += finisherDamage;
    pushDamagePopup(px, finisherDamage, enemy.x, 2.6, enemy.z, 'convergence');

    const bossState = world.boss && world.boss.id === enemy.id ? world.boss : null;
    if (bossState) {
      bossState.hp = enemy.hp;
      bossState.stagger = Math.min(bossState.maxStagger, bossState.stagger + finisherStagger);
      bossState.hitFlashTimer = 0.28;
      if (enemy.hp <= 0) {
        handleEnemyZeroHpDefeat(world, enemy, finisherDamage, true, true, false);
      } else {
        checkAndTriggerBossPhase2(world, bossState, enemy);
      }
    } else if (enemy.hp <= 0) {
      handleEnemyZeroHpDefeat(world, enemy, finisherDamage, true, true, false);
    }
  }

  return true;
}

export function startDailyChronoTrialRun(
  world: WorldState,
  skipIntro = true,
  dateKey: string = getTodayDateKey()
): import('./types.ts').DailyTrialConfig {
  const cfg = generateDailyTrialConfig(dateKey);
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  unlockPlayerWeapon(world, 'chrono_scythe');
  if (!world.progression.unlockedModChipIds?.includes('mod_volt_arc')) {
    world.progression.unlockedModChipIds = ['mod_volt_arc'];
  }
  if (!world.progression.equippedModChipId) {
    world.progression.equippedModChipId = 'mod_volt_arc';
  }

  // Launch the Daily Trial's deterministic boss encounter
  startBossEncounter(
    world,
    skipIntro,
    cfg.bossId as import('./types.ts').BossEncounterId
  );

  const px = ensureParadoxState(world);
  px.mutators = {
    glassCannon: cfg.mutatorKeys.includes('glassCannon'),
    zeroEchoCooldown: cfg.mutatorKeys.includes('zeroEchoCooldown'),
    hyperSpeed: cfg.mutatorKeys.includes('hyperSpeed'),
    ironmanNoHeal: cfg.mutatorKeys.includes('ironmanNoHeal'),
  };

  const asc = ensureAscensionState(world);
  asc.style = createInitialStyleRankState();
  asc.dailyTrialActive = true;
  asc.dailyTrialConfig = cfg;
  asc.dailyTrialElapsedSec = 0;
  asc.dailyTrialScore = 0;
  asc.dailyTrialCompleted = false;
  asc.lastDailyRecord = getDailyTrialRecord(cfg.dateKey);
  asc.finisherRiftTimer = 0;

  world.player.equippedWeaponId = 'chrono_scythe';
  world.events.push({
    type: 'daily_trial_started',
    x: world.player.x,
    z: world.player.z,
  });
  return cfg;
}

function stepAscensionSystems(
  world: WorldState,
  dt: number,
  eventIndexBeforeSlice: number
): void {
  const asc = ensureAscensionState(world);
  const sing = ensureSingularityState(world);
  const ko = ensureKineticOverchargeState(world);
  const twinSync = ensureTwinSyncState(world);
  const momentum = ensureChronoMomentumState(world);
  const nexus = ensureChronoNexusState(world);
  const px = ensureParadoxState(world);
  const p = world.player;

  if (asc.finisherRiftTimer > 0) {
    asc.finisherRiftTimer = Math.max(0, asc.finisherRiftTimer - dt);
  }

  let hasNearbyStaggered = false;
  for (let i = 0; i < world.enemies.length; i++) {
    const e = world.enemies[i];
    if (e.hp > 0 && e.aiState === 'staggered' && Math.hypot(e.x - p.x, e.z - p.z) <= 6.0) {
      hasNearbyStaggered = true;
      break;
    }
  }
  tickStyleRank(asc.style, dt, hasNearbyStaggered);
  tickSingularityCombat(sing, dt);
  tickChronoMomentumState(momentum, dt);
  tickWeaponResonanceState(ensureWeaponResonanceState(world), dt);
  const echoActor = world.echo.activeActor;
  const echoLiveForSync = world.echo.state === 'playback' && Boolean(echoActor);
  const syncDist =
    echoLiveForSync && echoActor
      ? Math.hypot(echoActor.x - p.x, echoActor.z - p.z)
      : 99;
  const activeDocId = normalizeEchoDoctrineId(world.progression?.echoDoctrine);
  const activeDocSpec = getEchoDoctrineSpec(activeDocId);
  tickTwinSyncState(twinSync, dt, echoLiveForSync, syncDist, activeDocId);
  if (echoLiveForSync && activeDocSpec.tetherRadius > 0 && syncDist <= activeDocSpec.tetherRadius) {
    if (activeDocSpec.tetherFluxRegenPerSec > 0 && p.flux < p.maxFlux) {
      p.flux = Math.min(p.maxFlux, p.flux + activeDocSpec.tetherFluxRegenPerSec * dt);
    }
    if (
      activeDocSpec.tetherWardRegenPerSec > 0 &&
      world.chronoAegis &&
      world.chronoAegis.maxWard > 0 &&
      world.chronoAegis.ward < world.chronoAegis.maxWard
    ) {
      world.chronoAegis.ward = Math.min(
        world.chronoAegis.maxWard,
        world.chronoAegis.ward + activeDocSpec.tetherWardRegenPerSec * dt
      );
    }
  }
  const koTick = tickWeaponKineticOvercharge(ko, dt);
  if (koTick.expired && koTick.expiredWeaponId) {
    world.events.push({
      type: 'weapon_overcharge_ended',
      x: p.x,
      z: p.z,
      weaponId: koTick.expiredWeaponId,
    });
  }

  if (asc.dailyTrialActive && world.outcome === 'none') {
    asc.dailyTrialElapsedSec += dt;
  }

  const equippedChip = world.progression?.equippedModChipId ?? null;
  const endIdx = world.events.length;

  const awardHitCombo = (hits: number, hx: number, hz: number) => {
    const out = registerSingularityHit(sing, hits);
    if (out.milestoneHit !== null) {
      p.flux = Math.min(p.maxFlux, p.flux + out.bonusFlux);
      recordStyleAction(asc.style, 'convergence', out.bonusStyle, `CHAIN ×${out.milestoneHit}`);
      world.events.push({
        type: 'chrono_chain_milestone',
        x: hx,
        z: hz,
        amount: out.milestoneHit,
      });
    }
  };

  const awardWeaponOvercharge = (weaponId: WeaponId, amount: number, ox: number, oz: number) => {
    const res = addWeaponKineticCharge(ko, weaponId, amount);
    if (res.triggered) {
      recordStyleAction(asc.style, 'convergence', 24, 'KINETIC OVERCHARGE');
      world.events.push({
        type: 'weapon_overcharge_ready',
        x: ox,
        z: oz,
        weaponId,
        amount: 100,
      });
    }
  };

  let breakProcessedThisSlice = false;
  for (let ei = eventIndexBeforeSlice; ei < endIdx; ei++) {
    const ev = world.events[ei];
    let rankRes: { tierChanged: boolean; newTier: import('./types.ts').StyleRankTier } | null =
      null;

    if (ev.type === 'player_hit_enemy') {
      awardHitCombo(1, ev.x, ev.z);
      const hitWeapon = ev.weaponId ?? p.equippedWeaponId;
      awardWeaponOvercharge(
        hitWeapon,
        ev.isHeavy ? OVERCHARGE_GAIN_HEAVY_HIT : OVERCHARGE_GAIN_LIGHT_HIT,
        p.x,
        p.z
      );
      if (echoLiveForSync && echoActor) {
        const isPincer = isPincerFlankGeometry(
          p.x,
          p.z,
          echoActor.x,
          echoActor.z,
          ev.x,
          ev.z
        );
        const syncRes = registerTwinSyncCombatHit(
          twinSync,
          'player',
          world.elapsedTime,
          true,
          isPincer,
          activeDocId
        );
        if (world.chronoAegis?.mode === 'harmonic') {
          addTwinSyncBonus(twinSync, 5, true);
        }
        if (syncRes.pincerTriggered) {
          recordStyleAction(asc.style, 'convergence', 20, 'TWIN PINCER');
          world.events.push({
            type: 'twin_sync_pincer',
            x: ev.x,
            z: ev.z,
            amount: syncRes.newTier,
          });
        }
        if (syncRes.tierUp) {
          world.events.push({
            type: 'twin_sync_tier_up',
            x: p.x,
            z: p.z,
            amount: syncRes.newTier,
          });
        }
      }
      // v2.7.0 Chrono Scythe Astral Siphon Core upgrade leech on hit
      if (
        hitWeapon === 'chrono_scythe' &&
        getEquippedWeaponUpgrade(world, 'chrono_scythe') === 'scythe_astral_siphon'
      ) {
        const sipCfg = GAME_CONFIG.weapons.upgrades.scythe_astral_siphon;
        const ocBonus = isUpgradeOverclocked(
          'scythe_astral_siphon',
          world.progression?.overclockedUpgrades
        )
          ? 2
          : 0;
        p.integrity = Math.min(p.maxIntegrity, p.integrity + sipCfg.healOnHit + ocBonus);
        p.ghostIntegrity = Math.max(p.ghostIntegrity, p.integrity);
        p.flux = Math.min(p.maxFlux, p.flux + sipCfg.fluxBonusOnHit + ocBonus);
      }
      rankRes = recordStyleAction(
        asc.style,
        ev.isHeavy ? 'heavy_hit' : 'light_hit',
        ev.isHeavy ? 26 : 15,
        ev.isHeavy ? 'HEAVY STRIKE' : 'STRIKE'
      );

      // Apply equipped Weapon Mod Socket Chip effects on player hits
      if (equippedChip === 'mod_volt_arc') {
        let bestArcTarget: EnemyState | null = null;
        let bestArcDist = 4.2;
        for (let j = 0; j < world.enemies.length; j++) {
          const cand = world.enemies[j];
          if (cand.hp <= 0 || cand.aiState === 'ko' || cand.id === ev.enemyId) continue;
          const d = Math.hypot(cand.x - ev.x, cand.z - ev.z);
          if (d < bestArcDist) {
            bestArcDist = d;
            bestArcTarget = cand;
          }
        }
        if (bestArcTarget) {
          const arcDmg = 12;
          bestArcTarget.hp = Math.max(0, bestArcTarget.hp - arcDmg);
          bestArcTarget.hitFlashTimer = 0.16;
          world.stats.damageDealt += arcDmg;
          pushDamagePopup(px, arcDmg, bestArcTarget.x, 2.3, bestArcTarget.z, 'drone');
          world.events.push({
            type: 'mod_volt_arc_chain',
            x: bestArcTarget.x,
            z: bestArcTarget.z,
            originX: ev.x,
            originZ: ev.z,
            amount: arcDmg,
            enemyId: bestArcTarget.id,
          });
          if (world.boss && world.boss.id === bestArcTarget.id) {
            world.boss.hp = bestArcTarget.hp;
          }
          if (bestArcTarget.hp <= 0) {
            handleEnemyZeroHpDefeat(world, bestArcTarget, arcDmg, false, false, false);
          }
        }
      } else if (equippedChip === 'mod_siphon_leech') {
        const healAmt = ev.isHeavy ? 8 : 3;
        p.integrity = Math.min(p.maxIntegrity, p.integrity + healAmt);
        p.ghostIntegrity = Math.max(p.ghostIntegrity, p.integrity);
        world.events.push({
          type: 'mod_siphon_leech_heal',
          x: p.x,
          z: p.z,
          amount: healAmt,
        });
      } else if (equippedChip === 'mod_chrono_nova' && ev.isHeavy) {
        const novaDmg = 18;
        const novaStag = 10;
        world.events.push({
          type: 'mod_chrono_nova_burst',
          x: ev.x,
          z: ev.z,
          amount: novaDmg,
        });
        for (let j = 0; j < world.enemies.length; j++) {
          const cand = world.enemies[j];
          if (cand.hp <= 0 || cand.aiState === 'ko') continue;
          if (Math.hypot(cand.x - ev.x, cand.z - ev.z) <= 2.9 + cand.radius) {
            cand.hp = Math.max(0, cand.hp - novaDmg);
            cand.stagger = Math.min(cand.maxStagger, cand.stagger + novaStag);
            world.stats.damageDealt += novaDmg;
            if (world.boss && world.boss.id === cand.id) {
              world.boss.hp = cand.hp;
              world.boss.stagger = Math.min(world.boss.maxStagger, world.boss.stagger + novaStag);
            }
            if (cand.hp <= 0) {
              handleEnemyZeroHpDefeat(world, cand, novaDmg, true, false, false);
            }
          }
        }
      }
      // v3.4.0/v3.5.0/v3.6.0 Matron Siphon Core + Phase Rail Surgical Aperture Siphon (with ICD)
      const hitCoreSpec = computeBossCoreModifiers(
        world.progression?.equippedBossCore,
        world.progression?.transcendedBossCores
      ).spec;
      const hitAttunement = computeWeaponCoreAttunement(
        hitWeapon,
        world.progression?.equippedBossCore,
        world.progression?.transcendedBossCores
      );
      const railUnconditionalTrigger = Boolean(
        ev.isHeavy && hitWeapon === 'phase_rail' && hitAttunement.railUnconditionalSiphon
      );
      if (
        (hitCoreSpec &&
          hitCoreSpec.siphonHp > 0 &&
          (ev.isCriticalOrVulnerable || (momentum.weakpointTimer ?? 0) > 0)) ||
        railUnconditionalTrigger
      ) {
        const aegis = ensureChronoAegisState(world);
        if ((aegis.bossCoreSiphonCooldown ?? 0) <= 0) {
          const siphonHp =
            hitCoreSpec && hitCoreSpec.siphonHp > 0 ? hitCoreSpec.siphonHp : 6;
          const siphonWard =
            hitCoreSpec && hitCoreSpec.siphonWard > 0 ? hitCoreSpec.siphonWard : 6;
          const siphonCd =
            hitCoreSpec && hitCoreSpec.siphonCooldownSec > 0
              ? hitCoreSpec.siphonCooldownSec
              : 1.2;
          aegis.bossCoreSiphonCooldown = siphonCd;
          p.integrity = Math.min(p.maxIntegrity, p.integrity + siphonHp);
          p.ghostIntegrity = Math.max(p.ghostIntegrity, p.integrity);
          if (aegis.maxWard > 0) {
            aegis.ward = Math.min(aegis.maxWard, aegis.ward + siphonWard);
          }
          world.events.push({
            type: 'boss_core_pulse',
            x: p.x,
            z: p.z,
            amount: siphonHp,
          });
        }
      }
    } else if (ev.type === 'player_parry_success') {
      awardHitCombo(1, p.x, p.z);
      awardWeaponOvercharge(p.equippedWeaponId, OVERCHARGE_GAIN_PARRY, p.x, p.z);
      // v3.0.0 Cross-Link: Perfect Parry extends active Momentum window & energizes Echo Twin-Sync
      if (momentum.streakTimer > 0) {
        momentum.streakTimer = Math.min(7.0, momentum.streakTimer + 1.5);
      }
      if (echoLiveForSync) {
        const parrySync = addTwinSyncBonus(twinSync, 14, true);
        if (parrySync.tierUp) {
          world.events.push({
            type: 'twin_sync_tier_up',
            x: p.x,
            z: p.z,
            amount: parrySync.newTier,
          });
        }
      }
      // v3.4.0/v3.5.0 Helix Bastion Core: Helical Counter-Lance + Ward restore on Perfect Parry
      const parryCoreSpec = computeBossCoreModifiers(
        world.progression?.equippedBossCore,
        world.progression?.transcendedBossCores
      ).spec;
      if (parryCoreSpec && parryCoreSpec.parryLanceRadius > 0) {
        const aegis = ensureChronoAegisState(world);
        if (aegis.maxWard > 0 && parryCoreSpec.parryWardRestore > 0) {
          aegis.ward = Math.min(aegis.maxWard, aegis.ward + parryCoreSpec.parryWardRestore);
        }
        applyBossCoreRadialPulse(
          world,
          p.x,
          p.z,
          parryCoreSpec.parryLanceRadius,
          parryCoreSpec.parryLanceDamage,
          parryCoreSpec.parryLanceStagger
        );
      }
      // v3.6.0 Chrono Edge × Helix Bastion Attunement: Aegis Riposte
      const parryAttunement = computeWeaponCoreAttunement(
        p.equippedWeaponId,
        world.progression?.equippedBossCore,
        world.progression?.transcendedBossCores
      );
      if (parryAttunement.parryConfluenceBonus > 0) {
        grantConfluenceCharge(world, parryAttunement.parryConfluenceBonus);
      }
      if (parryAttunement.parryResetSwitchCooldown) {
        p.weaponSwitchCooldownTimer = 0;
      }
      if (parryAttunement.parryFluxBonus > 0) {
        p.flux = Math.min(p.maxFlux, p.flux + parryAttunement.parryFluxBonus);
      }
      rankRes = recordStyleAction(asc.style, 'parry', 42, 'PERFECT PARRY');
    } else if (ev.type === 'flash_swap_triggered') {
      awardWeaponOvercharge(ev.weaponId ?? p.equippedWeaponId, OVERCHARGE_GAIN_FLASH_SWAP, p.x, p.z);
      // v3.0.0 Cross-Link: Flash Swap extends active Weakpoint Break window for chained weapon bursts
      if (momentum.weakpointTimer > 0) {
        momentum.weakpointTimer = Math.min(4.5, momentum.weakpointTimer + 1.2);
      }
    } else if (ev.type === 'player_perfect_dodge') {
      armPhantomRiposte(sing);
      rankRes = recordStyleAction(asc.style, 'perfect_dodge', 34, 'CHRONO SLIP');
    } else if (ev.type === 'echo_playback_started') {
      rankRes = recordStyleAction(asc.style, 'echo_deploy', 22, 'ECHO DEPLOY');
      const choirDeploySpec = computeBossCoreModifiers(
        world.progression?.equippedBossCore,
        world.progression?.transcendedBossCores
      ).spec;
      if (choirDeploySpec && choirDeploySpec.echoPulseRadius > 0) {
        addTwinSyncBonus(twinSync, choirDeploySpec.echoPulseTwinSync, true);
        applyBossCoreRadialPulse(
          world,
          echoActor?.x ?? ev.x,
          echoActor?.z ?? ev.z,
          choirDeploySpec.echoPulseRadius,
          choirDeploySpec.echoPulseDamage,
          choirDeploySpec.echoPulseStagger
        );
      }
    } else if (ev.type === 'resonance_convergence') {
      awardHitCombo(2, ev.x, ev.z);
      rankRes = recordStyleAction(asc.style, 'convergence', 48, 'CONVERGENCE');
      if (equippedChip === 'mod_siphon_leech') {
        p.integrity = Math.min(p.maxIntegrity, p.integrity + 8);
        p.ghostIntegrity = Math.max(p.ghostIntegrity, p.integrity);
      }
      const choirConvSpec = computeBossCoreModifiers(
        world.progression?.equippedBossCore,
        world.progression?.transcendedBossCores
      ).spec;
      if (choirConvSpec && choirConvSpec.echoPulseRadius > 0) {
        addTwinSyncBonus(twinSync, choirConvSpec.echoPulseTwinSync, true);
        applyBossCoreRadialPulse(
          world,
          ev.x,
          ev.z,
          choirConvSpec.echoPulseRadius,
          choirConvSpec.echoPulseDamage,
          choirConvSpec.echoPulseStagger
        );
      }
    } else if (ev.type === 'scythe_vortex_pull') {
      awardHitCombo(1, ev.x, ev.z);
      rankRes = recordStyleAction(asc.style, 'scythe_vortex', 32, 'VORTEX PULL');
    } else if (ev.type === 'combat_drone_fired') {
      awardHitCombo(1, ev.x, ev.z);
      rankRes = recordStyleAction(asc.style, 'drone_hit', 10, 'DRONE ASSIST');
    } else if (ev.type === 'echo_resonance_primed') {
      if (echoLiveForSync && echoActor) {
        const isPincer = isPincerFlankGeometry(
          p.x,
          p.z,
          echoActor.x,
          echoActor.z,
          ev.x,
          ev.z
        );
        const syncRes = registerTwinSyncCombatHit(
          twinSync,
          'echo',
          world.elapsedTime,
          true,
          isPincer,
          activeDocId
        );
        if (world.chronoAegis?.mode === 'harmonic') {
          addTwinSyncBonus(twinSync, 5, true);
        }
        if (syncRes.pincerTriggered) {
          recordStyleAction(asc.style, 'convergence', 20, 'TWIN PINCER');
          world.events.push({
            type: 'twin_sync_pincer',
            x: ev.x,
            z: ev.z,
            amount: syncRes.newTier,
          });
        }
        if (syncRes.tierUp) {
          world.events.push({
            type: 'twin_sync_tier_up',
            x: p.x,
            z: p.z,
            amount: syncRes.newTier,
          });
        }
      }
    } else if (
      (ev.type === 'enemy_staggered' || ev.type === 'boss_staggered') &&
      !breakProcessedThisSlice
    ) {
      breakProcessedThisSlice = true;
      const brk = triggerWeakpointBreakWindow(momentum);
      if (ev.type === 'enemy_staggered' && !(world.boss && ev.enemyId === world.boss.id)) {
        awardWeaponOvercharge(p.equippedWeaponId, 16, ev.x, ev.z);
        rankRes = recordStyleAction(asc.style, 'convergence', 18, 'WEAKPOINT BREAK');
        if (echoLiveForSync) {
          const syncRes = addTwinSyncBonus(twinSync, 18, true);
          if (syncRes.tierUp) {
            world.events.push({
              type: 'twin_sync_tier_up',
              x: p.x,
              z: p.z,
              amount: syncRes.newTier,
            });
          }
        }
      }
      if (brk.newlyOpened) {
        world.events.push({
          type: 'weakpoint_break_triggered',
          x: ev.x,
          z: ev.z,
          amount: brk.newTier,
        });
      }
      if (brk.tierUp) {
        world.events.push({
          type: 'chrono_momentum_tier_up',
          x: p.x,
          z: p.z,
          amount: brk.newTier,
        });
      }
    } else if (ev.type === 'chrono_execution_finisher') {
      awardWeaponOvercharge(p.equippedWeaponId, 35, p.x, p.z);
      const execMom = registerMomentumStreakEvent(momentum, 1);
      if (execMom.awardBonusFragment && world.progression) {
        world.progression.memoryFragments += 1;
      }
      if (execMom.tierUp) {
        world.events.push({
          type: 'chrono_momentum_tier_up',
          x: p.x,
          z: p.z,
          amount: execMom.newTier,
        });
      }
      if (echoLiveForSync) {
        const syncRes = addTwinSyncBonus(twinSync, TWIN_SYNC_EXECUTION_BONUS, true);
        if (syncRes.tierUp) {
          world.events.push({
            type: 'twin_sync_tier_up',
            x: p.x,
            z: p.z,
            amount: syncRes.newTier,
          });
        }
      }
      // v3.0.0 Cross-Link: Execution Finisher feeds Stasis Overdrive & Weapon Mastery XP
      if (world.overdrive && !world.overdrive.active) {
        const chronPassive = computeChroniclePassiveBonus(
          world.run?.recoveredLogs,
          world.run?.completedChapters
        );
        world.overdrive.charge = Math.min(
          100,
          world.overdrive.charge + Math.round(18 * chronPassive.overdriveChargeMult)
        );
      }
      if (world.progression?.weaponMasteryXp) {
        const nxMasteryMult = getChronoNexusModifiers(nexus).masteryXpMult;
        world.progression.weaponMasteryXp[p.equippedWeaponId] =
          (world.progression.weaponMasteryXp[p.equippedWeaponId] ?? 0) +
          Math.round(15 * nxMasteryMult);
      }
      // v3.4.0/v3.5.0 Matron Siphon Core: Execution Finisher siphons HP & Ward unconditionally
      const execCoreSpec = computeBossCoreModifiers(
        world.progression?.equippedBossCore,
        world.progression?.transcendedBossCores
      ).spec;
      if (execCoreSpec && execCoreSpec.siphonHp > 0) {
        const aegis = ensureChronoAegisState(world);
        p.integrity = Math.min(p.maxIntegrity, p.integrity + execCoreSpec.siphonHp);
        p.ghostIntegrity = Math.max(p.ghostIntegrity, p.integrity);
        if (aegis.maxWard > 0) {
          aegis.ward = Math.min(aegis.maxWard, aegis.ward + execCoreSpec.siphonWard);
        }
        world.events.push({
          type: 'boss_core_pulse',
          x: p.x,
          z: p.z,
          amount: execCoreSpec.siphonHp,
        });
      }
      rankRes = recordStyleAction(asc.style, 'convergence', 42, 'CHRONO EXECUTION');
    } else if (ev.type === 'enemy_killed') {
      const killMom = registerMomentumStreakEvent(momentum, 1);
      if (killMom.awardBonusFragment && world.progression) {
        world.progression.memoryFragments += 1;
      }
      if (killMom.tierUp) {
        world.events.push({
          type: 'chrono_momentum_tier_up',
          x: p.x,
          z: p.z,
          amount: killMom.newTier,
        });
      }
      rankRes = recordStyleAction(asc.style, 'kill', 30, 'HOSTILE CLEARED');
    } else if (ev.type === 'player_damaged') {
      penalizeStyleOnHit(asc.style);
      resetSingularityComboOnDamage(sing);
    }

    if (rankRes && rankRes.tierChanged) {
      world.events.push({
        type: 'style_rank_up',
        x: p.x,
        z: p.z,
      });
    }
  }

  // v3.0.0 Unified Chrono Nexus Synergy Evaluation (Links Overcharge + Twin-Sync + Momentum + Flash/Riposte)
  const nxRes = evaluateChronoNexusState(
    nexus,
    {
      overchargeActive: ko.activeWeaponId === p.equippedWeaponId && ko.activeTimer > 0,
      twinSyncActive: twinSync.linkActive && twinSync.tier >= 1,
      momentumActive: momentum.tier >= 1 || momentum.weakpointTimer > 0,
      flashOrRiposteActive: sing.flashSwapAmpTimer > 0 || sing.phantomRiposteTimer > 0,
    },
    dt
  );
  if (nxRes.tierUp) {
    world.events.push({
      type: 'chrono_nexus_linked',
      x: p.x,
      z: p.z,
      amount: nxRes.newTier,
    });
    if (nxRes.newTier === 4 && world.overdrive && !world.overdrive.active) {
      world.overdrive.charge = Math.min(100, world.overdrive.charge + 12);
    }
  }
  if (nxRes.pulseReady) {
    world.events.push({
      type: 'chrono_nexus_pulse',
      x: p.x,
      z: p.z,
      amount: nexus.tier,
    });
    for (let ni = 0; ni < world.enemies.length; ni++) {
      const ne = world.enemies[ni];
      if (ne.hp <= 0 || ne.aiState === 'ko') continue;
      if (Math.hypot(ne.x - p.x, ne.z - p.z) <= 4.8 + ne.radius) {
        ne.stagger = Math.min(ne.maxStagger, ne.stagger + 15);
        if (world.boss && world.boss.id === ne.id) {
          world.boss.stagger = Math.min(world.boss.maxStagger, world.boss.stagger + 15);
        }
      }
    }
  }

  // Record Daily Chrono Trial completion once victory occurs
  if (
    asc.dailyTrialActive &&
    asc.dailyTrialConfig &&
    !asc.dailyTrialCompleted &&
    world.outcome === 'victory'
  ) {
    asc.dailyTrialCompleted = true;
    const score = computeDailyTrialScore(
      asc.dailyTrialElapsedSec,
      asc.style.peakPoints,
      world.stats.damageTaken,
      asc.dailyTrialConfig.parTimeSec
    );
    asc.dailyTrialScore = score;
    asc.lastDailyRecord = saveDailyTrialRecord({
      dateKey: asc.dailyTrialConfig.dateKey,
      seedCode: asc.dailyTrialConfig.seedCode,
      bestScore: score,
      bestTimeSec: Number(asc.dailyTrialElapsedSec.toFixed(2)),
      peakRank: asc.style.peakTier,
      completedCount: 1,
      updatedAtIso: new Date().toISOString(),
    });
    world.events.push({
      type: 'daily_trial_completed',
      x: p.x,
      z: p.z,
      amount: score,
    });
  }
}

export function unlockChronoAchievement(
  world: WorldState,
  id: ChronoAchievementId
): boolean {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  if (!Array.isArray(world.progression.unlockedAchievementIds)) {
    world.progression.unlockedAchievementIds = [];
  }
  if (world.progression.unlockedAchievementIds.includes(id)) {
    return false;
  }
  world.progression.unlockedAchievementIds.push(id);
  const def = getAchievementDefinition(id);
  const px = ensureParadoxState(world);
  px.activeToast = {
    id,
    title: def.title,
    description: def.description,
    remaining: 4.5,
  };
  world.events.push({
    type: 'achievement_unlocked',
    x: world.player.x,
    z: world.player.z,
    achievementId: id,
  });
  return true;
}

export function equipSeraRigSkin(world: WorldState, skinId: SeraRigSkinId): boolean {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const unlocked = isSeraRigSkinUnlocked(
    skinId,
    world.progression.unlockedAchievementIds ?? [],
    world.progression.echoZeroDefeatedCount ?? 0
  );
  if (!unlocked) {
    return false;
  }
  world.progression.equippedSkinId = skinId;
  const def = getSeraRigSkinDefinition(skinId);
  world.progression.lastActionMessage = `CHASSIS REFIT · ${def.name} EQUIPPED`;
  world.events.push({
    type: 'skin_equipped',
    x: world.player.x,
    z: world.player.z,
    skinId,
  });
  return true;
}

export function toggleChronoMutator(
  world: WorldState,
  key: keyof ChronoMutatorState
): boolean {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const px = ensureParadoxState(world);
  const nextVal = !Boolean(px.mutators[key]);
  px.mutators[key] = nextVal;
  world.progression.mutators = { ...px.mutators };
  const def = CHRONO_MUTATORS.find((m) => m.key === key);
  world.progression.lastActionMessage = `MUTATOR ${def?.label ?? key.toUpperCase()} ${nextVal ? 'ENGAGED' : 'DISABLED'}`;
  return nextVal;
}

export function toggleSpeedrunHud(world: WorldState, explicit?: boolean): boolean {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const px = ensureParadoxState(world);
  const nextVal = typeof explicit === 'boolean' ? explicit : !px.speedrun.enabled;
  px.speedrun.enabled = nextVal;
  world.progression.speedrunHudEnabled = nextVal;
  return nextVal;
}

export function useMedNaniteInjector(world: WorldState): boolean {
  const px = ensureParadoxState(world);
  const loadout = px.loadout;
  const p = world.player;
  if (p.actionState === 'dead' || p.integrity <= 0) return false;
  const mutMods = computeMutatorModifiers(px.mutators);
  if (!mutMods.allowHealing) {
    if (world.expedition) {
      world.expedition.transitBannerTimer = 2.6;
      world.expedition.transitBannerText = 'IRONMAN PROTOCOL · MED-NANITE INJECTOR DISABLED';
    }
    return false;
  }
  if (loadout.naniteInjectors <= 0 || loadout.naniteCooldown > 0) return false;
  if (p.integrity >= p.maxIntegrity && p.flux >= p.maxFlux) return false;

  loadout.naniteInjectors = Math.max(0, loadout.naniteInjectors - 1);
  loadout.naniteCooldown = 3.5;
  const bossCoreMods = computeBossCoreModifiers(
    world.progression?.equippedBossCore,
    world.progression?.transcendedBossCores
  );
  const maxHealAmt = Math.round(42 * bossCoreMods.naniteHealMultiplier);
  const healed = Math.min(maxHealAmt, p.maxIntegrity - p.integrity);
  p.integrity = Math.min(p.maxIntegrity, p.integrity + maxHealAmt);
  p.ghostIntegrity = Math.max(p.ghostIntegrity, p.integrity);
  p.flux = Math.min(p.maxFlux, p.flux + 18);
  world.events.push({
    type: 'nanite_injector_used',
    x: p.x,
    z: p.z,
    amount: Math.round(healed),
  });
  return true;
}

export function purchaseFabricatorItem(
  world: WorldState,
  itemId: FabricatorItemId
): boolean {
  if (!world.progression) {
    world.progression = createInitialWeaponProgressionState();
  }
  const px = ensureParadoxState(world);
  const item = getFabricatorItem(itemId);
  if (world.progression.memoryFragments < item.cost) {
    world.progression.lastActionMessage = `INSUFFICIENT FRAGMENTS FOR ${item.name} (${item.cost} REQUIRED)`;
    return false;
  }

  const loadout = px.loadout;
  if (itemId === 'nanite_pack') {
    if (loadout.naniteInjectors >= loadout.maxNaniteInjectors) {
      world.progression.lastActionMessage = 'MED-NANITE INJECTORS ALREADY AT MAX (3/3)';
      return false;
    }
    loadout.naniteInjectors = Math.min(
      loadout.maxNaniteInjectors,
      loadout.naniteInjectors + 1
    );
  } else if (itemId === 'aegis_shield') {
    if (loadout.aegisShieldHp >= loadout.maxAegisShieldHp) {
      world.progression.lastActionMessage = 'AEGIS SHIELD ALREADY AT FULL CAPACITY';
      return false;
    }
    loadout.aegisShieldHp = Math.min(loadout.maxAegisShieldHp, loadout.aegisShieldHp + 40);
  } else if (itemId === 'overclock_core') {
    if (loadout.overclockCoreActive) {
      world.progression.lastActionMessage = 'OVERCLOCK CORE ALREADY ARMED (+25% DMG)';
      return false;
    }
    loadout.overclockCoreActive = true;
  } else if (itemId === 'drone_mk1') {
    if (loadout.combatDroneTier >= 1) {
      world.progression.lastActionMessage = 'COMBAT DRONE ALREADY DEPLOYED';
      return false;
    }
    loadout.combatDroneTier = 1;
    loadout.droneX = world.player.x - 1.5;
    loadout.droneZ = world.player.z - 0.5;
    unlockChronoAchievement(world, 'drone_commander');
  } else if (itemId === 'drone_mk2') {
    if (loadout.combatDroneTier >= 2) {
      world.progression.lastActionMessage = 'COMBAT DRONE MK.II ALREADY ACTIVE';
      return false;
    }
    loadout.combatDroneTier = 2;
    loadout.droneX = world.player.x - 1.5;
    loadout.droneZ = world.player.z - 0.5;
    unlockChronoAchievement(world, 'drone_commander');
  }

  world.progression.memoryFragments -= item.cost;
  world.progression.lastActionMessage = `FABRICATED · ${item.name} (-${item.cost} FRAG)`;
  if (world.expedition?.safeRoom?.active) {
    world.expedition.transitBannerTimer = 3.8;
    world.expedition.transitBannerText = `FIELD FABRICATOR · ${item.name} INSTALLED`;
  }
  unlockChronoAchievement(world, 'safe_room_engineer');
  world.events.push({
    type: 'fabricator_purchased',
    x: world.player.x,
    z: world.player.z,
    fabricatorItemId: itemId,
    amount: item.cost,
  });
  return true;
}

export function startEchoZeroParadoxEncounter(
  world: WorldState,
  skipIntro = false
): boolean {
  const px = ensureParadoxState(world);
  px.paradoxRiftUnlocked = true;
  startBossEncounter(world, skipIntro, 'echo-zero');
  world.events.push({
    type: 'paradox_rift_entered',
    x: world.player.x,
    z: world.player.z,
  });
  return true;
}

export function startAuthoredEncounter(
  world: WorldState,
  encounterId: EncounterCompositionId = GAME_CONFIG.encounters.defaultEncounterId
): boolean {
  if (!isValidEncounterCompositionId(encounterId)) {
    return false;
  }
  const preserveTutorialEnabled = world.tutorial ? world.tutorial.enabled : true;
  const savedSnap = captureSavedCampaignSnapshotIfNeeded(world);
  const preservedUnlocked = world.run?.unlockedChapters
    ? [...world.run.unlockedChapters]
    : (['prologue'] as CampaignChapterId[]);
  const preservedCompleted = world.run?.completedChapters
    ? [...world.run.completedChapters]
    : ([] as CampaignChapterId[]);
  const preservedRecoveredLogs = world.run?.recoveredLogs
    ? [...world.run.recoveredLogs]
    : [];
  const preservedCompletedEndings = world.run?.completedEndings
    ? [...world.run.completedEndings]
    : [];

  const fresh = createInitialWorld('playing');
  const def = getEncounterDefinition(encounterId);
  world.appState = 'playing';
  world.encounterMode = 'standard';
  world.run = {
    ...createInitialRunState('practice_standard', 'calibration', 'prologue'),
    unlockedChapters: preservedUnlocked,
    completedChapters: preservedCompleted,
    recoveredLogs: preservedRecoveredLogs,
    completedEndings: preservedCompletedEndings,
    savedCampaignSnapshot: savedSnap,
  };
  world.tutorial = createInitialTutorialState(
    preserveTutorialEnabled,
    'movement_camera'
  );
  world.outcome = 'none';
  world.outcomeDelayTimer = 0;
  world.elapsedTime = 0;
  world.hitstopTimer = 0;
  world.cameraTrauma = 0;
  const preservedEquippedWeapon: WeaponId =
    world.player && isValidWeaponId(world.player.equippedWeaponId)
      ? world.player.equippedWeaponId
      : GAME_CONFIG.weapons.defaultWeaponId;
  world.player = fresh.player;
  world.player.equippedWeaponId = preservedEquippedWeapon;
  world.projectiles = [];
  world.nextProjectileId = 1;
  world.obstacles = buildObstaclesForChapter(def.chapterContext, false);
  world.boostPads = createInitialBoostPads();
  world.fluxPools = [];
  world.artilleryZones = [];
  world.temporalRift = null;
  world.riftCooldownTimer = 7.5;
  world.riftSpawnSeq = 1;
  world.recursion = null;
  world.overdrive = createInitialChronoOverdriveState(25);
  world.gauntlet = null;
  world.fragmentCaches = buildFragmentCachesForChapter(
    def.chapterContext,
    world.progression?.claimedRewardIds ?? []
  );
  world.sectorBeacons = buildSectorBeaconsForChapter(def.chapterContext);
  world.activeStoryBlessing = null;
  world.enemies = spawnWaveUnitsForEncounter(
    def.id,
    1,
    world.obstacles,
    world.player.x,
    world.player.z,
    false
  );
  world.boss = null;
  world.echo = fresh.echo;
  world.relay = fresh.relay;
  world.resonance = fresh.resonance;
  world.pressurePlate = fresh.pressurePlate;
  world.puzzle = fresh.puzzle;
  world.choir = fresh.choir;
  world.curator = fresh.curator;
  world.matron = fresh.matron;
  const unlockAdvancedModules =
    encounterId === 'tactical_temporal_disruption' ||
    encounterId === 'tactical_mastery_gauntlet' ||
    encounterId === 'tactical_apex_bestiary';
  world.gravityPin = createInitialGravityPinState(unlockAdvancedModules);
  world.echoCollapse = createInitialEchoCollapseState(unlockAdvancedModules);
  world.loom = fresh.loom;
  world.comms = createInitialNarrativeCommsState();
  world.progression = cloneWeaponProgressionState(world.progression);
  applyOverdriveToEnemies(world, world.enemies, null);
  world.encounter = createInitialEncounterRuntimeState(def.id);
  world.exploration = createInitialExplorationState(def.chapterContext, null);
  syncUnlockedRoutesToObstacles(world);
  syncResonanceUpgradeParameters(world);
  syncPlayerRigStats(world);
  world.events = [];
  triggerNarrativeTransmission(world, 'prologue_wake', true);
  advanceMissionAndExplorationSystem(world);
  world.stats = fresh.stats;
  world.frozenSummary = null;
  return true;
}

export function advanceEncounterWaveIfReady(world: WorldState): boolean {
  if (
    world.encounterMode !== 'standard' ||
    !world.encounter ||
    world.encounter.completed ||
    world.outcome !== 'none'
  ) {
    return false;
  }
  const anyAlive = world.enemies.some((e) => e.hp > 0 && e.aiState !== 'ko');
  if (anyAlive || world.enemies.length === 0) {
    return false;
  }

  const def = getEncounterDefinition(world.encounter.encounterId);
  const nextWaveIndex = world.encounter.currentWaveIndex + 1;
  if (
    nextWaveIndex <= def.waves.length &&
    !world.encounter.spawnedWaveIndices.includes(nextWaveIndex)
  ) {
    const nextWave =
      def.waves.find((w) => w.waveIndex === nextWaveIndex) ??
      def.waves[nextWaveIndex - 1];
    world.encounter.waveClearedCount = Math.max(
      world.encounter.waveClearedCount,
      world.encounter.currentWaveIndex
    );
    world.encounter.currentWaveIndex = nextWaveIndex;
    world.encounter.spawnedWaveIndices = [
      ...world.encounter.spawnedWaveIndices,
      nextWaveIndex,
    ];
    world.encounter.activeWaveLabel = nextWave.label;
    world.encounter.tacticalDirective = nextWave.tacticalDirective;
    world.projectiles = [];
    world.resonance.activeMark = null;
    if (world.resonance.status === 'primed') {
      world.resonance.status = 'idle';
    }

    const reinforcementUnits = spawnWaveUnitsForEncounter(
      def.id,
      nextWaveIndex,
      world.obstacles,
      world.player.x,
      world.player.z,
      true
    );
    applyOverdriveToEnemies(world, reinforcementUnits, null);
    world.enemies.push(...reinforcementUnits);
    world.run.checkpointNotice = `${nextWave.label} DEPLOYED · ${nextWave.tacticalDirective}`;
    world.run.checkpointNoticeTimer = 4.2;
    world.events.push({
      type: 'encounter_wave_started',
      x: world.player.x,
      z: world.player.z,
    });
    return true;
  }

  world.encounter.waveClearedCount = def.waves.length;
  world.encounter.completed = true;
  return false;
}

export function startPracticeStandardRun(
  world: WorldState,
  encounterId: EncounterCompositionId = GAME_CONFIG.encounters.defaultEncounterId
): void {
  startAuthoredEncounter(world, encounterId);
}

export function startPracticeBossRun(
  world: WorldState,
  skipIntro = false,
  bossId: BossId = 'helix-04'
): void {
  startBossEncounter(world, skipIntro, bossId);
}

export function skipCampaignIntro(world: WorldState): void {
  if (world.run.stage === 'intro') {
    world.run.stage = 'calibration';
    world.run.introTimer = 0;
  }
}

export function captureBossCheckpointFromWorld(
  world: WorldState,
  chapter: CampaignChapterId = world.run?.chapter ?? 'chapter_1_helix',
  bossId: BossId = getBossIdForChapter(chapter)
): BossCheckpointState {
  const rawIntegrity = Math.max(
    1,
    Math.min(world.player.maxIntegrity, Math.ceil(world.player.integrity))
  );
  const floorIntegrity = GAME_CONFIG.verticalSlice.bossCheckpointMinIntegrityFloor;
  const syncedIntegrity = Math.max(floorIntegrity, rawIntegrity);
  const replenishedIntegrity = Math.max(0, syncedIntegrity - rawIntegrity);

  const rawFlux = Math.max(
    0,
    Math.min(world.player.maxFlux, Math.floor(world.player.flux))
  );
  const hasFluxReservoir = (
    world.progression?.purchasedNeuralProtocols ?? []
  ).includes('proto_flux_reservoir');
  const minFluxFloor =
    GAME_CONFIG.verticalSlice.bossCheckpointMinFluxFloor +
    (hasFluxReservoir ? 15 : 0);
  const syncedFlux = Math.max(minFluxFloor, rawFlux);

  const unlockedForCheckpoint =
    world.run?.mode === 'campaign'
      ? normalizeUnlockedWeaponIds(world.progression?.unlockedWeaponIds)
      : VALID_WEAPON_IDS;
  const sanitizedCheckpointWeapon: WeaponId =
    world.player &&
    isValidWeaponId(world.player.equippedWeaponId) &&
    unlockedForCheckpoint.includes(world.player.equippedWeaponId)
      ? world.player.equippedWeaponId
      : GAME_CONFIG.weapons.defaultWeaponId;

  return {
    chapter,
    bossId,
    equippedWeaponId: sanitizedCheckpointWeapon,
    integrity: syncedIntegrity,
    maxIntegrity: world.player.maxIntegrity,
    flux: syncedFlux,
    maxFlux: world.player.maxFlux,
    replenishedIntegrity,
    elapsedTimeAtCheckpoint: world.elapsedTime,
    statsAtCheckpoint: {
      damageDealt: world.stats.damageDealt,
      damageTaken: world.stats.damageTaken,
      parriesLanded: world.stats.parriesLanded,
      vulnerableHits: world.stats.vulnerableHits,
      convergencesTriggered: world.resonance.convergenceCount,
      relaysUsed: world.relay.activationCount,
    },
  };
}

function addUniqueChapter(
  list: CampaignChapterId[],
  chapter: CampaignChapterId
): CampaignChapterId[] {
  return list.includes(chapter) ? [...list] : [...list, chapter];
}

function addUniqueString<T extends string>(list: T[], item: T): T[] {
  return list.includes(item) ? [...list] : [...list, item];
}

export function beginCampaignBossTransition(world: WorldState): void {
  if (world.run.mode !== 'campaign' || world.run.stage === 'transition_to_boss') {
    return;
  }
  // Cleanly terminate any active Echo recording/playback, projectiles, or pending marks before transitioning
  clearEchoState(world, 'outcome');
  world.projectiles = [];
  world.resonance.activeMark = null;
  world.resonance.status = 'idle';
  world.resonance.cooldownTimer = 0;
  world.resonance.flashTimer = 0;
  if (world.encounter) {
    world.encounter.completed = true;
    world.encounter.waveClearedCount = world.encounter.totalWaves;
  }

  // Halt any remaining standard security proxies so no stray hit occurs during transition
  for (let i = 0; i < world.enemies.length; i++) {
    const e = world.enemies[i];
    if (e.aiState !== 'ko') {
      e.aiState = 'pursue';
      e.vx = 0;
      e.vz = 0;
      e.cooldownTimer = 10;
      e.telegraphLocked = false;
      e.hasDealtDamageThisAttack = false;
    }
  }

  const checkpoint = captureBossCheckpointFromWorld(
    world,
    'chapter_1_helix',
    'helix-04'
  );
  world.player.integrity = checkpoint.integrity;
  world.player.ghostIntegrity = checkpoint.integrity;
  world.player.flux = checkpoint.flux;
  world.player.invulnTimer = Math.max(
    world.player.invulnTimer,
    GAME_CONFIG.verticalSlice.transitionDuration + 0.5
  );

  if (!world.run.isChapterReplay) {
    if (world.puzzle?.completed) {
      grantProgressionReward(world, 'prologue_calibration_combine');
    }
    const anyProxyAlive = world.enemies.some((e) => e.hp > 0 && e.aiState !== 'ko');
    if (world.enemies.length > 0 && !anyProxyAlive) {
      grantProgressionReward(world, 'prologue_bay_proxies_cleared');
    }
    world.run.completedChapters = addUniqueChapter(
      world.run.completedChapters,
      'prologue'
    );
    recordWorldCombatMasteryOnVictory(world, ['sector_prologue']);
    world.run.unlockedChapters = addUniqueChapter(
      world.run.unlockedChapters,
      'chapter_1_helix'
    );
    world.run.recoveredLogs = addUniqueString(
      world.run.recoveredLogs ?? [],
      'LOG-00'
    );
    world.run.pendingNextChapter = 'chapter_1_helix';
    unlockPlayerWeapon(world, 'phase_rail');
  }

  world.run.stage = 'transition_to_boss';
  world.run.transitionTimer = GAME_CONFIG.verticalSlice.transitionDuration;
  world.run.transitionDuration = GAME_CONFIG.verticalSlice.transitionDuration;
  world.run.bossCheckpoint = checkpoint;
  world.run.checkpointNotice =
    checkpoint.replenishedIntegrity > 0
      ? `ARCHIVE CHECKPOINT SAVED · INTEGRITY SYNCHRONIZED TO ${checkpoint.integrity} (+${checkpoint.replenishedIntegrity}) · FLUX ${checkpoint.flux}`
      : `ARCHIVE CHECKPOINT SAVED · INTEGRITY ${checkpoint.integrity} · FLUX ${checkpoint.flux}`;
  world.run.checkpointNoticeTimer = 5.5;

  advanceMissionAndExplorationSystem(world);
  triggerNarrativeTransmission(world, 'prologue_step3_combine', true);

  world.events.push({
    type: 'containment_transition_started',
    x: world.player.x,
    z: world.player.z,
  });
}

export function transitionCampaignToBoss(
  world: WorldState,
  skipBossIntro = false,
  targetChapter: CampaignChapterId = world.run?.bossCheckpoint?.chapter ?? 'chapter_1_helix'
): void {
  const bossId = getBossIdForChapter(targetChapter);
  const checkpoint =
    world.run.bossCheckpoint && world.run.bossCheckpoint.chapter === targetChapter
      ? world.run.bossCheckpoint
      : captureBossCheckpointFromWorld(world, targetChapter, bossId);
  const existingNotice =
    world.run.checkpointNotice ??
    (checkpoint.replenishedIntegrity > 0
      ? `ARCHIVE CHECKPOINT SAVED · INTEGRITY SYNCHRONIZED TO ${checkpoint.integrity} (+${checkpoint.replenishedIntegrity}) · FLUX ${checkpoint.flux}`
      : `ARCHIVE CHECKPOINT SAVED · INTEGRITY ${checkpoint.integrity} · FLUX ${checkpoint.flux}`);
  const preserveTutorialEnabled = world.tutorial ? world.tutorial.enabled : true;
  const isReplay = Boolean(world.run?.isChapterReplay);
  const savedSnap = world.run?.savedCampaignSnapshot ?? null;
  let unlockedChapters = world.run?.unlockedChapters
    ? [...world.run.unlockedChapters]
    : (['prologue'] as CampaignChapterId[]);
  let completedChapters = world.run?.completedChapters
    ? [...world.run.completedChapters]
    : ([] as CampaignChapterId[]);
  let recoveredLogs = world.run?.recoveredLogs
    ? [...world.run.recoveredLogs]
    : [];
  const completedEndings = world.run?.completedEndings
    ? [...world.run.completedEndings]
    : [];

  if (!isReplay) {
    if (targetChapter === 'chapter_1_helix') {
      if (world.run?.chapter === 'prologue') {
        if (world.puzzle?.completed) {
          grantProgressionReward(world, 'prologue_calibration_combine');
        }
        const anyProxyAlive = world.enemies.some((e) => e.hp > 0 && e.aiState !== 'ko');
        if (world.enemies.length > 0 && !anyProxyAlive) {
          grantProgressionReward(world, 'prologue_bay_proxies_cleared');
        }
      }
      completedChapters = addUniqueChapter(completedChapters, 'prologue');
      recoveredLogs = addUniqueString(recoveredLogs, 'LOG-00');
    }
    unlockedChapters = addUniqueChapter(unlockedChapters, targetChapter);
  }

  if (!isReplay && world.exploration) {
    advanceMissionAndExplorationSystem(world);
  }
  const preservedExploration = isReplay
    ? null
    : clonePersistedExplorationState(world.exploration);

  startBossEncounter(world, skipBossIntro, bossId);
  if (targetChapter !== getChapterForBossId(bossId)) {
    world.obstacles = buildObstaclesForChapter(targetChapter, true);
  }
  if (!isReplay) {
    if (
      targetChapter === 'chapter_1_helix' ||
      targetChapter === 'chapter_2_choir' ||
      targetChapter === 'chapter_3_curator' ||
      targetChapter === 'chapter_4_matron' ||
      targetChapter === 'chapter_5_loom'
    ) {
      unlockPlayerWeapon(world, 'phase_rail');
    }
    if (
      targetChapter === 'chapter_2_choir' ||
      targetChapter === 'chapter_3_curator' ||
      targetChapter === 'chapter_4_matron' ||
      targetChapter === 'chapter_5_loom'
    ) {
      unlockPlayerWeapon(world, 'grav_breaker');
    }
  }
  world.exploration = createInitialExplorationState(
    targetChapter,
    preservedExploration
  );
  syncChapterExpansionEntities(world, targetChapter);
  syncUnlockedRoutesToObstacles(world);
  syncPlayerRigStats(world);

  world.run = {
    mode: 'campaign',
    stage: skipBossIntro ? 'boss_fight' : 'boss_intro',
    chapter: targetChapter,
    unlockedChapters,
    completedChapters,
    recoveredLogs,
    completedEndings,
    pendingNextChapter: null,
    isChapterReplay: isReplay,
    savedCampaignSnapshot: savedSnap,
    selectedEnding: null,
    introTimer: 0,
    introDuration: GAME_CONFIG.verticalSlice.introDuration,
    transitionTimer: 0,
    transitionDuration: GAME_CONFIG.verticalSlice.transitionDuration,
    bossCheckpoint: {
      ...checkpoint,
      chapter: targetChapter,
      bossId,
      statsAtCheckpoint: { ...checkpoint.statsAtCheckpoint },
    },
    checkpointNotice: existingNotice,
    checkpointNoticeTimer: 4.5,
  };
  world.tutorial = createInitialTutorialState(
    preserveTutorialEnabled,
    getTutorialStepForBossId(bossId)
  );

  // Restore exact checkpoint Integrity, Flux, equipped weapon, and pre-boss campaign telemetry
  world.player.integrity = Math.min(world.player.maxIntegrity, checkpoint.integrity);
  world.player.ghostIntegrity = world.player.integrity;
  world.player.flux = checkpoint.flux;
  const unlockedInBossChapter = getUnlockedWeaponIds(world);
  const validBossWeapon: WeaponId =
    checkpoint.equippedWeaponId &&
    isValidWeaponId(checkpoint.equippedWeaponId) &&
    unlockedInBossChapter.includes(checkpoint.equippedWeaponId)
      ? checkpoint.equippedWeaponId
      : GAME_CONFIG.weapons.defaultWeaponId;
  world.player.equippedWeaponId = validBossWeapon;
  if (world.run.bossCheckpoint) {
    world.run.bossCheckpoint.equippedWeaponId = validBossWeapon;
  }
  world.elapsedTime = checkpoint.elapsedTimeAtCheckpoint;
  world.stats = {
    damageDealt: checkpoint.statsAtCheckpoint.damageDealt,
    damageTaken: checkpoint.statsAtCheckpoint.damageTaken,
    parriesLanded: checkpoint.statsAtCheckpoint.parriesLanded,
    vulnerableHits: checkpoint.statsAtCheckpoint.vulnerableHits,
  };
  world.resonance.convergenceCount = checkpoint.statsAtCheckpoint.convergencesTriggered;
  world.relay.activationCount = checkpoint.statsAtCheckpoint.relaysUsed;
  advanceMissionAndExplorationSystem(world);
}

export function enterChronicleLoomChapter(
  world: WorldState,
  isReplay = false
): void {
  const preserveTutorialEnabled = world.tutorial ? world.tutorial.enabled : true;
  const checkpoint =
    world.run.bossCheckpoint ??
    captureBossCheckpointFromWorld(world, 'chapter_5_loom', 'matron-v');
  const unlockedChapters = addUniqueChapter(
    world.run?.unlockedChapters ?? ['prologue'],
    'chapter_5_loom'
  );
  const completedChapters = isReplay
    ? [...(world.run?.completedChapters ?? [])]
    : addUniqueChapter(world.run?.completedChapters ?? [], 'chapter_4_matron');
  const recoveredLogs = isReplay
    ? [...(world.run?.recoveredLogs ?? [])]
    : addUniqueString(
        addUniqueString(world.run?.recoveredLogs ?? [], 'LOG-04'),
        'LOG-05'
      );
  const completedEndings = [...(world.run?.completedEndings ?? [])];
  const savedSnap = world.run?.savedCampaignSnapshot ?? null;

  if (!isReplay && world.exploration) {
    advanceMissionAndExplorationSystem(world);
  }
  const preservedExploration = isReplay
    ? null
    : clonePersistedExplorationState(world.exploration);

  const fresh = createInitialWorld('playing');
  world.appState = 'playing';
  world.encounterMode = 'standard';
  world.outcome = 'none';
  world.outcomeDelayTimer = 0;
  world.hitstopTimer = 0;
  world.cameraTrauma = 0;
  world.player = fresh.player;
  world.player.x = 0;
  world.player.z = 4.2;
  world.player.rotationY = Math.PI;
  world.player.integrity = checkpoint.integrity;
  world.player.ghostIntegrity = checkpoint.integrity;
  world.player.flux = checkpoint.flux;
  if (checkpoint.equippedWeaponId && isValidWeaponId(checkpoint.equippedWeaponId)) {
    world.player.equippedWeaponId = checkpoint.equippedWeaponId;
  }
  world.projectiles = [];
  world.nextProjectileId = 1;
  world.enemies = [];
  world.boss = null;
  world.obstacles = buildObstaclesForChapter('chapter_5_loom', false);
  world.boostPads = createInitialBoostPads();
  world.fluxPools = [];
  world.artilleryZones = [];
  world.temporalRift = null;
  world.riftCooldownTimer = 7.5;
  world.recursion = null;
  world.fragmentCaches = buildFragmentCachesForChapter(
    'chapter_5_loom',
    world.progression?.claimedRewardIds ?? []
  );
  world.sectorBeacons = buildSectorBeaconsForChapter('chapter_5_loom');
  world.activeStoryBlessing = null;
  world.echo = fresh.echo;
  world.relay = fresh.relay;
  world.resonance = fresh.resonance;
  world.pressurePlate = fresh.pressurePlate;
  world.puzzle = fresh.puzzle;
  world.choir = createInitialChoirState(false);
  world.curator = createInitialCuratorState(false);
  world.matron = createInitialMatronState(false);
  world.gravityPin = createInitialGravityPinState(true);
  world.echoCollapse = createInitialEchoCollapseState(true);
  world.loom = createInitialChronicleLoomState(true);
  world.comms = createInitialNarrativeCommsState();
  world.progression = cloneWeaponProgressionState(world.progression);
  if (!isReplay) {
    unlockPlayerWeapon(world, 'phase_rail');
    unlockPlayerWeapon(world, 'grav_breaker');
  }
  world.encounter = createInitialEncounterRuntimeState('prologue_calibration_bay');
  world.exploration = createInitialExplorationState(
    'chapter_5_loom',
    preservedExploration
  );
  syncUnlockedRoutesToObstacles(world);
  syncResonanceUpgradeParameters(world);
  syncPlayerRigStats(world);
  world.player.integrity = Math.min(world.player.maxIntegrity, checkpoint.integrity);
  world.player.ghostIntegrity = world.player.integrity;
  world.frozenSummary = null;

  world.run = {
    mode: 'campaign',
    stage: 'chronicle_loom',
    chapter: 'chapter_5_loom',
    unlockedChapters,
    completedChapters,
    recoveredLogs,
    completedEndings,
    pendingNextChapter: null,
    isChapterReplay: isReplay,
    savedCampaignSnapshot: savedSnap,
    selectedEnding: null,
    introTimer: 0,
    introDuration: GAME_CONFIG.verticalSlice.introDuration,
    transitionTimer: 0,
    transitionDuration: GAME_CONFIG.verticalSlice.transitionDuration,
    bossCheckpoint: {
      ...checkpoint,
      chapter: 'chapter_5_loom',
      bossId: 'matron-v',
      statsAtCheckpoint: { ...checkpoint.statsAtCheckpoint },
    },
    checkpointNotice: 'CHRONICLE LOOM CORE ACCESSED · SELECT FINAL PROTOCOL DIRECTIVE',
    checkpointNoticeTimer: 6.0,
  };
  const unlockedInLoom = getUnlockedWeaponIds(world);
  const validLoomWeapon: WeaponId =
    checkpoint.equippedWeaponId &&
    isValidWeaponId(checkpoint.equippedWeaponId) &&
    unlockedInLoom.includes(checkpoint.equippedWeaponId)
      ? checkpoint.equippedWeaponId
      : GAME_CONFIG.weapons.defaultWeaponId;
  world.player.equippedWeaponId = validLoomWeapon;
  if (world.run.bossCheckpoint) {
    world.run.bossCheckpoint.equippedWeaponId = validLoomWeapon;
  }
  world.tutorial = createInitialTutorialState(
    preserveTutorialEnabled,
    'chronicle_loom_choice'
  );
  triggerNarrativeTransmission(world, 'chapter5_loom_arrival', true);
  advanceMissionAndExplorationSystem(world);
}

export function engageWardenPrimeInLoom(
  world: WorldState,
  skipIntro = false
): boolean {
  if (!world || !world.run || world.run.chapter !== 'chapter_5_loom') {
    return false;
  }
  const preserveTutorialEnabled = world.tutorial ? world.tutorial.enabled : true;
  const isReplay = Boolean(world.run.isChapterReplay);
  const savedSnap = world.run.savedCampaignSnapshot;
  const unlockedChapters = [...world.run.unlockedChapters];
  const completedChapters = [...world.run.completedChapters];
  const recoveredLogs = [...(world.run.recoveredLogs ?? [])];
  const completedEndings = [...(world.run.completedEndings ?? [])];
  const preservedExploration = clonePersistedExplorationState(world.exploration);
  const preservedProgression = cloneWeaponProgressionState(world.progression);
  const checkpoint = captureBossCheckpointFromWorld(
    world,
    'chapter_5_loom',
    'warden-prime'
  );

  startBossEncounter(world, skipIntro, 'warden-prime');
  world.progression = preservedProgression;
  if (!isReplay) {
    unlockPlayerWeapon(world, 'phase_rail');
    unlockPlayerWeapon(world, 'grav_breaker');
  }
  world.exploration = createInitialExplorationState(
    'chapter_5_loom',
    preservedExploration
  );
  syncChapterExpansionEntities(world, 'chapter_5_loom');
  syncUnlockedRoutesToObstacles(world);
  syncResonanceUpgradeParameters(world);
  syncPlayerRigStats(world);

  world.run = {
    mode: 'campaign',
    stage: skipIntro ? 'boss_fight' : 'boss_intro',
    chapter: 'chapter_5_loom',
    unlockedChapters,
    completedChapters,
    recoveredLogs,
    completedEndings,
    pendingNextChapter: null,
    isChapterReplay: isReplay,
    savedCampaignSnapshot: savedSnap,
    selectedEnding: null,
    introTimer: 0,
    introDuration: GAME_CONFIG.verticalSlice.introDuration,
    transitionTimer: 0,
    transitionDuration: GAME_CONFIG.verticalSlice.transitionDuration,
    bossCheckpoint: {
      ...checkpoint,
      chapter: 'chapter_5_loom',
      bossId: 'warden-prime',
      statsAtCheckpoint: { ...checkpoint.statsAtCheckpoint },
    },
    checkpointNotice: 'SOVEREIGN ARCHITECT ENGAGED · NEUTRALIZE WARDEN PRIME TO SEIZE LOOM CONTROL',
    checkpointNoticeTimer: 5.5,
  };
  world.tutorial = createInitialTutorialState(
    preserveTutorialEnabled,
    'matron_echo_collapse'
  );
  world.player.integrity = Math.min(world.player.maxIntegrity, checkpoint.integrity);
  world.player.ghostIntegrity = world.player.integrity;
  world.player.flux = checkpoint.flux;
  const unlockedForWarden = getUnlockedWeaponIds(world);
  const validWardenWeapon: WeaponId =
    checkpoint.equippedWeaponId &&
    isValidWeaponId(checkpoint.equippedWeaponId) &&
    unlockedForWarden.includes(checkpoint.equippedWeaponId)
      ? checkpoint.equippedWeaponId
      : GAME_CONFIG.weapons.defaultWeaponId;
  world.player.equippedWeaponId = validWardenWeapon;
  if (world.run.bossCheckpoint) {
    world.run.bossCheckpoint.equippedWeaponId = validWardenWeapon;
  }
  advanceMissionAndExplorationSystem(world);
  return true;
}

const CAMPAIGN_CHAPTER_ORDER: readonly CampaignChapterId[] = [
  'prologue',
  'chapter_1_helix',
  'chapter_2_choir',
  'chapter_3_curator',
  'chapter_4_matron',
  'chapter_5_loom',
];

const VALID_ARCHIVE_LOG_IDS: readonly string[] = [
  'LOG-00',
  'LOG-01',
  'LOG-02',
  'LOG-03',
  'LOG-04',
  'LOG-05',
];

const VALID_LOOM_ENDINGS: readonly ChronicleLoomEndingId[] = [
  'silence',
  'witness',
  'continuity',
];

export function isValidCampaignChapterId(value: unknown): value is CampaignChapterId {
  return (
    typeof value === 'string' &&
    (CAMPAIGN_CHAPTER_ORDER as readonly string[]).includes(value)
  );
}

export function isValidArchiveLogId(value: unknown): value is string {
  return typeof value === 'string' && VALID_ARCHIVE_LOG_IDS.includes(value);
}

export function isValidChronicleLoomEndingId(
  value: unknown
): value is ChronicleLoomEndingId {
  return (
    typeof value === 'string' &&
    (VALID_LOOM_ENDINGS as readonly string[]).includes(value)
  );
}

function mergeUniqueChapters(
  a: readonly CampaignChapterId[] | undefined,
  b: readonly CampaignChapterId[] | undefined,
  ensurePrologue = false
): CampaignChapterId[] {
  let out: CampaignChapterId[] = ensurePrologue ? ['prologue'] : [];
  if (a) {
    const lenA = Math.min(a.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < lenA; i++) {
      if (isValidCampaignChapterId(a[i])) {
        out = addUniqueChapter(out, a[i]);
      }
    }
  }
  if (b) {
    const lenB = Math.min(b.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < lenB; i++) {
      if (isValidCampaignChapterId(b[i])) {
        out = addUniqueChapter(out, b[i]);
      }
    }
  }
  return out;
}

function mergeUniqueStrings<T extends string>(
  a: readonly T[] | undefined,
  b: readonly T[] | undefined,
  validator: (v: unknown) => v is T
): T[] {
  let out: string[] = [];
  if (a) {
    const lenA = Math.min(a.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < lenA; i++) {
      if (validator(a[i])) {
        out = addUniqueString(out, a[i]);
      }
    }
  }
  if (b) {
    const lenB = Math.min(b.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < lenB; i++) {
      if (validator(b[i])) {
        out = addUniqueString(out, b[i]);
      }
    }
  }
  return out as T[];
}

export const CAMPAIGN_STORAGE_KEY = 'afterframe_campaign_progress_v1';
export const CAMPAIGN_SAVE_VERSION = 2 as const;

const VALID_VERTICAL_SLICE_STAGES: readonly VerticalSliceStage[] = [
  'calibration',
  'transition_to_boss',
  'boss_intro',
  'boss_fight',
  'chronicle_loom',
  'completed',
];

const VALID_BOSS_IDS: readonly BossId[] = [
  'helix-04',
  'the-choir',
  'the-curator',
  'matron-v',
  'warden-prime',
];

function isValidVerticalSliceStage(value: unknown): value is VerticalSliceStage {
  return (
    typeof value === 'string' &&
    (VALID_VERTICAL_SLICE_STAGES as readonly string[]).includes(value)
  );
}

function isValidBossId(value: unknown): value is BossId {
  return (
    typeof value === 'string' &&
    (VALID_BOSS_IDS as readonly string[]).includes(value)
  );
}

function getNextCampaignChapter(
  chapter: CampaignChapterId
): CampaignChapterId | null {
  switch (chapter) {
    case 'prologue':
      return 'chapter_1_helix';
    case 'chapter_1_helix':
      return 'chapter_2_choir';
    case 'chapter_2_choir':
      return 'chapter_3_curator';
    case 'chapter_3_curator':
      return 'chapter_4_matron';
    case 'chapter_4_matron':
      return 'chapter_5_loom';
    case 'chapter_5_loom':
    default:
      return null;
  }
}

function isValidStageForChapter(
  chapter: CampaignChapterId,
  stage: VerticalSliceStage,
  pendingNextChapter: CampaignChapterId | null
): boolean {
  if (chapter === 'prologue') {
    if (stage === 'calibration' || stage === 'intro') return pendingNextChapter === null;
    if (stage === 'transition_to_boss') {
      return pendingNextChapter === null || pendingNextChapter === 'chapter_1_helix';
    }
    return false;
  }
  if (chapter === 'chapter_5_loom') {
    return (
      (stage === 'chronicle_loom' ||
        stage === 'boss_intro' ||
        stage === 'boss_fight') &&
      pendingNextChapter === null
    );
  }
  if (
    stage === 'boss_intro' ||
    stage === 'boss_fight' ||
    stage === 'transition_to_boss'
  ) {
    return pendingNextChapter === null;
  }
  if (stage === 'completed') {
    const expectedNext = getNextCampaignChapter(chapter);
    return pendingNextChapter !== null && pendingNextChapter === expectedNext;
  }
  return false;
}

function sanitizeNonNegativeNumber(v: unknown, maxVal?: number): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return null;
  if (maxVal !== undefined) {
    return Math.min(maxVal, v);
  }
  return v;
}

function sanitizePositiveInt(v: unknown, maxVal?: number): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 1) return null;
  const rounded = Math.round(v);
  if (rounded < 1) return null;
  if (maxVal !== undefined) {
    return Math.min(maxVal, rounded);
  }
  return rounded;
}

function sanitizeNonNegativeInt(v: unknown, maxVal?: number): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return null;
  const rounded = Math.round(v);
  if (rounded < 0) return null;
  if (maxVal !== undefined) {
    return Math.min(maxVal, rounded);
  }
  return rounded;
}

function sanitizeBossCheckpoint(
  raw: unknown,
  expectedChapter: CampaignChapterId
): BossCheckpointState | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;

  if (!isValidCampaignChapterId(obj.chapter) || obj.chapter !== expectedChapter) {
    return null;
  }
  const expectedBossId = getBossIdForChapter(expectedChapter);
  const validChapter5Boss =
    expectedChapter === 'chapter_5_loom' &&
    (obj.bossId === 'matron-v' || obj.bossId === 'warden-prime');
  if (!isValidBossId(obj.bossId) || (obj.bossId !== expectedBossId && !validChapter5Boss)) {
    return null;
  }

  const maxRigIntegrityCap = GAME_CONFIG.player.maxIntegrity + 25;
  const maxIntegrity =
    obj.maxIntegrity !== undefined
      ? sanitizePositiveInt(obj.maxIntegrity, maxRigIntegrityCap)
      : GAME_CONFIG.player.maxIntegrity;
  const maxFlux =
    obj.maxFlux !== undefined
      ? sanitizePositiveInt(obj.maxFlux, GAME_CONFIG.player.maxFlux)
      : GAME_CONFIG.player.maxFlux;
  const integrity = sanitizePositiveInt(obj.integrity, maxRigIntegrityCap);
  const flux = sanitizeNonNegativeInt(obj.flux, GAME_CONFIG.player.maxFlux);
  const replenishedIntegrity = sanitizeNonNegativeInt(
    obj.replenishedIntegrity,
    maxRigIntegrityCap
  );
  const elapsedTimeAtCheckpoint = sanitizeNonNegativeNumber(obj.elapsedTimeAtCheckpoint);

  if (
    maxIntegrity === null ||
    maxFlux === null ||
    integrity === null ||
    flux === null ||
    replenishedIntegrity === null ||
    elapsedTimeAtCheckpoint === null
  ) {
    return null;
  }

  const rawStats = obj.statsAtCheckpoint;
  if (!rawStats || typeof rawStats !== 'object' || Array.isArray(rawStats)) {
    return null;
  }
  const statsObj = rawStats as Record<string, unknown>;
  const damageDealt = sanitizeNonNegativeInt(statsObj.damageDealt);
  const damageTaken = sanitizeNonNegativeInt(statsObj.damageTaken);
  const parriesLanded = sanitizeNonNegativeInt(statsObj.parriesLanded);
  const vulnerableHits = sanitizeNonNegativeInt(statsObj.vulnerableHits);
  const convergencesTriggered = sanitizeNonNegativeInt(statsObj.convergencesTriggered);
  const relaysUsed = sanitizeNonNegativeInt(statsObj.relaysUsed);

  if (
    damageDealt === null ||
    damageTaken === null ||
    parriesLanded === null ||
    vulnerableHits === null ||
    convergencesTriggered === null ||
    relaysUsed === null
  ) {
    return null;
  }

  const equippedWeaponId: WeaponId = isValidWeaponId(obj.equippedWeaponId)
    ? obj.equippedWeaponId
    : GAME_CONFIG.weapons.defaultWeaponId;

  return {
    chapter: obj.chapter,
    bossId: obj.bossId,
    equippedWeaponId,
    integrity,
    maxIntegrity,
    flux,
    maxFlux,
    replenishedIntegrity,
    elapsedTimeAtCheckpoint,
    statsAtCheckpoint: {
      damageDealt,
      damageTaken,
      parriesLanded,
      vulnerableHits,
      convergencesTriggered,
      relaysUsed,
    },
  };
}

function sanitizeActiveCampaign(raw: unknown): PersistedActiveCampaignState | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;

  if (!isValidCampaignChapterId(obj.chapter)) return null;
  if (!isValidVerticalSliceStage(obj.stage)) return null;
  if (obj.selectedEnding !== null && obj.selectedEnding !== undefined) {
    return null;
  }

  let pendingNextChapter: CampaignChapterId | null = null;
  if (obj.pendingNextChapter !== null && obj.pendingNextChapter !== undefined) {
    if (!isValidCampaignChapterId(obj.pendingNextChapter)) return null;
    pendingNextChapter = obj.pendingNextChapter;
  }

  if (!isValidStageForChapter(obj.chapter, obj.stage, pendingNextChapter)) {
    return null;
  }

  let bossCheckpoint: BossCheckpointState | null = null;
  if (obj.bossCheckpoint !== null && obj.bossCheckpoint !== undefined) {
    const expectedCheckpointChapter =
      obj.stage === 'completed' && pendingNextChapter ? pendingNextChapter : obj.chapter;
    const sanitizedCp = sanitizeBossCheckpoint(obj.bossCheckpoint, expectedCheckpointChapter);
    if (!sanitizedCp) return null;
    bossCheckpoint = sanitizedCp;
  }

  const normalizedStage: VerticalSliceStage =
    obj.stage === 'boss_intro'
      ? 'boss_fight'
      : obj.stage === 'intro'
        ? 'calibration'
        : obj.stage;

  const equippedWeaponId: WeaponId = isValidWeaponId(obj.equippedWeaponId)
    ? obj.equippedWeaponId
    : bossCheckpoint?.equippedWeaponId ?? GAME_CONFIG.weapons.defaultWeaponId;

  const progression =
    obj.progression !== undefined
      ? sanitizePersistedWeaponProgressionState(obj.progression)
      : undefined;

  const exploration =
    obj.exploration !== undefined
      ? sanitizePersistedExplorationState(obj.exploration)
      : undefined;

  return {
    chapter: obj.chapter,
    stage: normalizedStage,
    pendingNextChapter,
    bossCheckpoint,
    selectedEnding: null,
    equippedWeaponId,
    ...(progression ? { progression } : {}),
    ...(exploration ? { exploration } : {}),
  };
}

function extractActiveCampaignForSave(
  world: WorldState
): PersistedActiveCampaignState | null {
  const snap = captureSavedCampaignSnapshotIfNeeded(world);
  if (!snap) return null;
  if (snap.selectedEnding !== null) return null;
  if (snap.chapter === 'chapter_5_loom' && snap.stage === 'completed') return null;

  return sanitizeActiveCampaign({
    chapter: snap.chapter,
    stage: snap.stage,
    pendingNextChapter: snap.pendingNextChapter,
    bossCheckpoint: snap.bossCheckpoint,
    equippedWeaponId: snap.equippedWeaponId ?? world.player?.equippedWeaponId,
    progression: snap.progression,
    exploration: snap.exploration,
  });
}

function extractPersistedProgressionForSave(
  world: WorldState
): PersistedWeaponProgressionState {
  const snap = world.run?.savedCampaignSnapshot;
  if (world.run?.mode === 'recursion' || world.run?.mode === 'boss_gauntlet') {
    const liveProg = sanitizePersistedWeaponProgressionState(world.progression);
    const baseSnap = snap?.progression
      ? sanitizePersistedWeaponProgressionState(snap.progression)
      : liveProg;
    const mergedXp = normalizeWeaponMasteryXpMap(baseSnap.weaponMasteryXp);
    for (let i = 0; i < VALID_WEAPON_IDS.length; i++) {
      const wId = VALID_WEAPON_IDS[i];
      mergedXp[wId] = Math.max(mergedXp[wId] ?? 0, liveProg.weaponMasteryXp?.[wId] ?? 0);
    }
    const baseBestG = baseSnap.bestGauntletTimeSec ?? null;
    const liveBestG = liveProg.bestGauntletTimeSec ?? null;
    const mergedBestGauntlet =
      baseBestG === null
        ? liveBestG
        : liveBestG === null
          ? baseBestG
          : Math.min(baseBestG, liveBestG);
    return {
      ...baseSnap,
      memoryFragments: Math.max(baseSnap.memoryFragments, liveProg.memoryFragments),
      weaponMasteryXp: mergedXp,
      bestRecursionLoop: Math.max(
        baseSnap.bestRecursionLoop ?? 0,
        liveProg.bestRecursionLoop ?? 0
      ),
      totalRecursionClears: Math.max(
        baseSnap.totalRecursionClears ?? 0,
        liveProg.totalRecursionClears ?? 0
      ),
      bestGauntletTimeSec: mergedBestGauntlet,
      totalGauntletClears: Math.max(
        baseSnap.totalGauntletClears ?? 0,
        liveProg.totalGauntletClears ?? 0
      ),
      overdriveDifficulty: Boolean(liveProg.overdriveDifficulty),
      ngPlusCycle: Math.max(baseSnap.ngPlusCycle ?? 0, liveProg.ngPlusCycle ?? 0),
      unlockedVaultChapters: Array.from(
        new Set([
          ...(baseSnap.unlockedVaultChapters ?? []),
          ...(liveProg.unlockedVaultChapters ?? []),
        ])
      ),
      equippedSkinId: liveProg.equippedSkinId ?? baseSnap.equippedSkinId ?? 'nadir_standard',
      unlockedAchievementIds: Array.from(
        new Set([
          ...(baseSnap.unlockedAchievementIds ?? []),
          ...(liveProg.unlockedAchievementIds ?? []),
        ])
      ),
      paradoxEndingUnlocked: Boolean(
        baseSnap.paradoxEndingUnlocked || liveProg.paradoxEndingUnlocked
      ),
      echoZeroDefeatedCount: Math.max(
        baseSnap.echoZeroDefeatedCount ?? 0,
        liveProg.echoZeroDefeatedCount ?? 0
      ),
      lifetimeParries: Math.max(baseSnap.lifetimeParries ?? 0, liveProg.lifetimeParries ?? 0),
      lifetimeConvergences: Math.max(
        baseSnap.lifetimeConvergences ?? 0,
        liveProg.lifetimeConvergences ?? 0
      ),
      mutators: { ...(liveProg.mutators ?? createDefaultMutators()) },
      unlockedBossCores: Array.from(
        new Set([
          ...(baseSnap.unlockedBossCores ?? []),
          ...(liveProg.unlockedBossCores ?? []),
        ])
      ),
      equippedBossCore: liveProg.equippedBossCore ?? baseSnap.equippedBossCore ?? null,
      transcendedBossCores: Array.from(
        new Set([
          ...(baseSnap.transcendedBossCores ?? []),
          ...(liveProg.transcendedBossCores ?? []),
        ])
      ),
      bestSpeedrunSplits: {
        ...(baseSnap.bestSpeedrunSplits ?? {}),
        ...(liveProg.bestSpeedrunSplits ?? {}),
      },
      bestSpeedrunFullSec:
        baseSnap.bestSpeedrunFullSec !== null &&
        baseSnap.bestSpeedrunFullSec !== undefined &&
        liveProg.bestSpeedrunFullSec !== null &&
        liveProg.bestSpeedrunFullSec !== undefined
          ? Math.min(baseSnap.bestSpeedrunFullSec, liveProg.bestSpeedrunFullSec)
          : (liveProg.bestSpeedrunFullSec ?? baseSnap.bestSpeedrunFullSec ?? null),
      speedrunHudEnabled: Boolean(liveProg.speedrunHudEnabled),
    };
  }
  if (
    (world.run?.mode !== 'campaign' || world.run?.isChapterReplay) &&
    snap?.progression
  ) {
    return sanitizePersistedWeaponProgressionState(snap.progression);
  }
  return sanitizePersistedWeaponProgressionState(world.progression);
}

function extractPersistedExplorationForSave(
  world: WorldState
): PersistedExplorationState {
  const snap = world.run?.savedCampaignSnapshot;
  if (
    (world.run?.mode !== 'campaign' || world.run?.isChapterReplay) &&
    snap?.exploration
  ) {
    return sanitizePersistedExplorationState(snap.exploration);
  }
  return sanitizePersistedExplorationState(world.exploration);
}

export function parseAndApplyCampaignProgress(
  world: WorldState,
  rawJson: string | null | undefined
): boolean {
  // Client-side save validation protects local application state integrity against
  // corrupted, malformed, or oversized browser storage payloads.
  if (
    !rawJson ||
    typeof rawJson !== 'string' ||
    rawJson.length > MAX_SAVE_JSON_BYTES ||
    SAVE_UTF8_ENCODER.encode(rawJson).byteLength > MAX_SAVE_JSON_BYTES
  ) {
    return false;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return false;
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return false;
  }

  const obj = parsed as Record<string, unknown>;

  if (
    obj.version !== undefined &&
    obj.version !== 1 &&
    obj.version !== CAMPAIGN_SAVE_VERSION
  ) {
    return false;
  }

  world.run.unlockedChapters = mergeUniqueChapters(
    world.run.unlockedChapters,
    undefined,
    true
  );
  world.run.completedChapters = mergeUniqueChapters(
    world.run.completedChapters,
    undefined,
    false
  );
  world.run.recoveredLogs = mergeUniqueStrings(
    world.run.recoveredLogs,
    undefined,
    isValidArchiveLogId
  );
  world.run.completedEndings = mergeUniqueStrings(
    world.run.completedEndings,
    undefined,
    isValidChronicleLoomEndingId
  );

  if (Array.isArray(obj.unlockedChapters)) {
    const len = Math.min(obj.unlockedChapters.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < len; i++) {
      const ch = obj.unlockedChapters[i];
      if (isValidCampaignChapterId(ch)) {
        world.run.unlockedChapters = addUniqueChapter(world.run.unlockedChapters, ch);
      }
    }
  }

  if (Array.isArray(obj.completedChapters)) {
    const len = Math.min(obj.completedChapters.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < len; i++) {
      const ch = obj.completedChapters[i];
      if (isValidCampaignChapterId(ch)) {
        world.run.completedChapters = addUniqueChapter(world.run.completedChapters, ch);
      }
    }
  }

  if (Array.isArray(obj.recoveredLogs)) {
    const len = Math.min(obj.recoveredLogs.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < len; i++) {
      const logId = obj.recoveredLogs[i];
      if (isValidArchiveLogId(logId)) {
        world.run.recoveredLogs = addUniqueString(world.run.recoveredLogs, logId);
      }
    }
  }

  if (Array.isArray(obj.completedEndings)) {
    const len = Math.min(obj.completedEndings.length, MAX_SAVE_ARRAY_SCAN);
    for (let i = 0; i < len; i++) {
      const endingId = obj.completedEndings[i];
      if (isValidChronicleLoomEndingId(endingId)) {
        world.run.completedEndings = addUniqueString(
          world.run.completedEndings,
          endingId
        ) as ChronicleLoomEndingId[];
      }
    }
  }

  if (typeof obj.tutorialHintsEnabled === 'boolean' && world.tutorial) {
    world.tutorial.enabled = obj.tutorialHintsEnabled;
  }

  const inferLegacyWeaponUnlocksFromChapters = () => {
    const reachedHelixOrBeyond =
      world.run.unlockedChapters.some((ch) => ch !== 'prologue') ||
      world.run.completedChapters.includes('prologue') ||
      world.run.completedChapters.includes('chapter_1_helix');
    const reachedChoirOrBeyond =
      world.run.unlockedChapters.some(
        (ch) => ch !== 'prologue' && ch !== 'chapter_1_helix'
      ) ||
      world.run.completedChapters.some(
        (ch) => ch !== 'prologue'
      );
    if (reachedHelixOrBeyond) {
      unlockPlayerWeapon(world, 'phase_rail');
    }
    if (reachedChoirOrBeyond) {
      unlockPlayerWeapon(world, 'grav_breaker');
    }
  };

  const topLevelProgression =
    obj.progression !== undefined
      ? sanitizePersistedWeaponProgressionState(obj.progression)
      : null;

  if (topLevelProgression) {
    world.progression = {
      ...clonePersistedWeaponProgressionState(topLevelProgression),
      lastPurchaseOutcome: null,
      lastEquipOutcome: null,
      lastActionMessage:
        'CAMPAIGN PROGRESSION RESTORED · UPGRADE BENCH SYNCHRONIZED',
    };
    syncUnlockedBossCoresFromCampaign(world);
    syncResonanceUpgradeParameters(world);
    syncPlayerRigStats(world);
  } else {
    inferLegacyWeaponUnlocksFromChapters();
    syncUnlockedBossCoresFromCampaign(world);
    syncPlayerRigStats(world);
  }

  const topLevelExploration =
    obj.exploration !== undefined
      ? sanitizePersistedExplorationState(obj.exploration)
      : null;

  if (topLevelExploration) {
    world.exploration = createInitialExplorationState(
      world.run.chapter,
      topLevelExploration
    );
    syncChapterExpansionEntities(world, world.run.chapter);
    syncUnlockedRoutesToObstacles(world);
    advanceMissionAndExplorationSystem(world);
  }

  if (
    obj.version === undefined ||
    obj.version === 1 ||
    obj.version === CAMPAIGN_SAVE_VERSION
  ) {
    if (obj.activeCampaign === null || obj.activeCampaign === undefined) {
      if (world.appState === 'title') {
        world.run.savedCampaignSnapshot = null;
      }
    } else {
      const sanitizedActive = sanitizeActiveCampaign(obj.activeCampaign);
      if (sanitizedActive) {
        world.run.unlockedChapters = addUniqueChapter(
          world.run.unlockedChapters,
          sanitizedActive.chapter
        );
        if (sanitizedActive.pendingNextChapter) {
          world.run.unlockedChapters = addUniqueChapter(
            world.run.unlockedChapters,
            sanitizedActive.pendingNextChapter
          );
        }
        if (!topLevelProgression && !sanitizedActive.progression) {
          inferLegacyWeaponUnlocksFromChapters();
        }
        const effectiveProgression =
          sanitizedActive.progression ??
          topLevelProgression ??
          sanitizePersistedWeaponProgressionState(world.progression);
        if (!topLevelProgression && sanitizedActive.progression) {
          world.progression = {
            ...clonePersistedWeaponProgressionState(sanitizedActive.progression),
            lastPurchaseOutcome: null,
            lastEquipOutcome: null,
            lastActionMessage:
              'CAMPAIGN PROGRESSION RESTORED · UPGRADE BENCH SYNCHRONIZED',
          };
          syncResonanceUpgradeParameters(world);
          syncPlayerRigStats(world);
        }
        const effectiveExploration =
          sanitizedActive.exploration ??
          topLevelExploration ??
          sanitizePersistedExplorationState(world.exploration);
        if (!topLevelExploration && sanitizedActive.exploration) {
          world.exploration = createInitialExplorationState(
            world.run.chapter,
            sanitizedActive.exploration
          );
          syncUnlockedRoutesToObstacles(world);
          advanceMissionAndExplorationSystem(world);
        }
        const effectiveUnlockedWeapons = normalizeUnlockedWeaponIds(
          effectiveProgression.unlockedWeaponIds
        );
        const safeActiveWeaponId: WeaponId =
          sanitizedActive.equippedWeaponId &&
          effectiveUnlockedWeapons.includes(sanitizedActive.equippedWeaponId)
            ? sanitizedActive.equippedWeaponId
            : GAME_CONFIG.weapons.defaultWeaponId;
        const safeCheckpointWeaponId: WeaponId =
          sanitizedActive.bossCheckpoint?.equippedWeaponId &&
          effectiveUnlockedWeapons.includes(
            sanitizedActive.bossCheckpoint.equippedWeaponId
          )
            ? sanitizedActive.bossCheckpoint.equippedWeaponId
            : safeActiveWeaponId;
        world.run.savedCampaignSnapshot = {
          chapter: sanitizedActive.chapter,
          stage: sanitizedActive.stage,
          unlockedChapters: [...world.run.unlockedChapters],
          completedChapters: [...world.run.completedChapters],
          recoveredLogs: [...world.run.recoveredLogs],
          completedEndings: [...world.run.completedEndings],
          pendingNextChapter: sanitizedActive.pendingNextChapter,
          bossCheckpoint: sanitizedActive.bossCheckpoint
            ? {
                ...sanitizedActive.bossCheckpoint,
                equippedWeaponId: safeCheckpointWeaponId,
                statsAtCheckpoint: {
                  ...sanitizedActive.bossCheckpoint.statsAtCheckpoint,
                },
              }
            : null,
          selectedEnding: null,
          equippedWeaponId: safeActiveWeaponId,
          progression: clonePersistedWeaponProgressionState(effectiveProgression),
          exploration: clonePersistedExplorationState(effectiveExploration),
        };
      } else if (world.appState === 'title') {
        world.run.savedCampaignSnapshot = null;
      }
    }
  }

  if (world.run.savedCampaignSnapshot) {
    world.run.savedCampaignSnapshot.unlockedChapters = mergeUniqueChapters(
      world.run.savedCampaignSnapshot.unlockedChapters,
      world.run.unlockedChapters,
      true
    );
    world.run.savedCampaignSnapshot.completedChapters = mergeUniqueChapters(
      world.run.savedCampaignSnapshot.completedChapters,
      world.run.completedChapters,
      false
    );
    world.run.savedCampaignSnapshot.recoveredLogs = mergeUniqueStrings(
      world.run.savedCampaignSnapshot.recoveredLogs,
      world.run.recoveredLogs,
      isValidArchiveLogId
    );
    world.run.savedCampaignSnapshot.completedEndings = mergeUniqueStrings(
      world.run.savedCampaignSnapshot.completedEndings,
      world.run.completedEndings,
      isValidChronicleLoomEndingId
    );
    if (!world.run.savedCampaignSnapshot.progression) {
      world.run.savedCampaignSnapshot.progression =
        clonePersistedWeaponProgressionState(world.progression);
    }
    if (!world.run.savedCampaignSnapshot.exploration) {
      world.run.savedCampaignSnapshot.exploration =
        clonePersistedExplorationState(world.exploration);
    }
  }

  if (world.exploration) {
    world.exploration.convergenceSummary =
      buildCampaignEndingDiscoverySummary(world);
  }

  return true;
}

export function serializeCampaignProgress(world: WorldState): string {
  const snap = world.run?.savedCampaignSnapshot;
  let unlockedChapters = mergeUniqueChapters(
    snap?.unlockedChapters,
    world.run?.unlockedChapters,
    true
  );
  const completedChapters = mergeUniqueChapters(
    snap?.completedChapters,
    world.run?.completedChapters,
    false
  );
  const recoveredLogs = mergeUniqueStrings(
    snap?.recoveredLogs,
    world.run?.recoveredLogs,
    isValidArchiveLogId
  );
  const completedEndings = mergeUniqueStrings(
    snap?.completedEndings,
    world.run?.completedEndings,
    isValidChronicleLoomEndingId
  );
  const progression = extractPersistedProgressionForSave(world);
  const exploration = extractPersistedExplorationForSave(world);
  const activeCampaign = extractActiveCampaignForSave(world);
  if (activeCampaign) {
    unlockedChapters = addUniqueChapter(unlockedChapters, activeCampaign.chapter);
    if (activeCampaign.pendingNextChapter) {
      unlockedChapters = addUniqueChapter(
        unlockedChapters,
        activeCampaign.pendingNextChapter
      );
    }
  }

  const payload: PersistedCampaignSaveV2 = {
    version: CAMPAIGN_SAVE_VERSION,
    unlockedChapters,
    completedChapters,
    recoveredLogs,
    completedEndings,
    activeCampaign,
    progression,
    exploration,
  };

  return JSON.stringify(payload);
}

export function loadCampaignProgressFromStorage(
  world: WorldState,
  storage?: Pick<Storage, 'getItem'> | null
): boolean {
  const targetStorage =
    storage !== undefined
      ? storage
      : typeof window !== 'undefined'
        ? window.localStorage
        : null;
  if (!targetStorage) return false;
  try {
    const raw = targetStorage.getItem(CAMPAIGN_STORAGE_KEY);
    return parseAndApplyCampaignProgress(world, raw);
  } catch {
    return false;
  }
}

export function saveCampaignProgressToStorage(
  world: WorldState,
  storage?: Pick<Storage, 'setItem'> | null,
  previousJson: string | null = null
): { written: boolean; json: string } {
  const serialized = serializeCampaignProgress(world);
  if (serialized === previousJson) {
    return { written: false, json: serialized };
  }
  const targetStorage =
    storage !== undefined
      ? storage
      : typeof window !== 'undefined'
        ? window.localStorage
        : null;
  if (!targetStorage) {
    return { written: false, json: serialized };
  }
  try {
    targetStorage.setItem(CAMPAIGN_STORAGE_KEY, serialized);
    return { written: true, json: serialized };
  } catch {
    return { written: false, json: serialized };
  }
}

function getCampaignChapterIndex(chapter: CampaignChapterId): number {
  return CAMPAIGN_CHAPTER_ORDER.indexOf(chapter);
}

function isSnapshotLaterOrChapterCompleted(
  targetChapter: CampaignChapterId,
  snap: SavedCampaignProgressSnapshot | null
): boolean {
  if (!snap) return false;
  const targetIdx = getCampaignChapterIndex(targetChapter);
  const snapIdx = getCampaignChapterIndex(snap.chapter);
  const pendingIdx = snap.pendingNextChapter
    ? getCampaignChapterIndex(snap.pendingNextChapter)
    : -1;
  const highestActiveIdx = Math.max(snapIdx, pendingIdx);

  return targetIdx < highestActiveIdx || snap.completedChapters.includes(targetChapter);
}

export function advanceCampaignChapter(
  world: WorldState,
  skipBossIntro = false
): boolean {
  if (
    world.run.mode !== 'campaign' ||
    world.run.isChapterReplay ||
    world.outcome === 'defeat' ||
    !world.run.pendingNextChapter
  ) {
    return false;
  }

  const nextChapter = world.run.pendingNextChapter;
  world.run.pendingNextChapter = null;
  world.run.isChapterReplay = false;

  if (nextChapter === 'chapter_1_helix' && world.run.stage === 'transition_to_boss') {
    transitionCampaignToBoss(world, skipBossIntro, 'chapter_1_helix');
    world.events.push({
      type: 'campaign_chapter_advanced',
      x: world.player.x,
      z: world.player.z,
    });
    return true;
  }

  // Capture synchronized post-victory checkpoint before entering the next chapter
  const nextBossId = getBossIdForChapter(nextChapter);
  const checkpoint = captureBossCheckpointFromWorld(world, nextChapter, nextBossId);
  world.run.bossCheckpoint = checkpoint;
  world.run.checkpointNotice =
    checkpoint.replenishedIntegrity > 0
      ? `CHAPTER ADVANCE · INTEGRITY SYNCHRONIZED TO ${checkpoint.integrity} (+${checkpoint.replenishedIntegrity}) · FLUX ${checkpoint.flux}`
      : `CHAPTER ADVANCE · INTEGRITY ${checkpoint.integrity} · FLUX ${checkpoint.flux}`;

  if (nextChapter === 'chapter_5_loom') {
    enterChronicleLoomChapter(world, false);
  } else {
    transitionCampaignToBoss(world, skipBossIntro, nextChapter);
  }

  world.events.push({
    type: 'campaign_chapter_advanced',
    x: world.player.x,
    z: world.player.z,
  });
  return true;
}

export function startCampaignChapterSelect(
  world: WorldState,
  chapter: CampaignChapterId,
  skipIntro = true
): boolean {
  const unlocked = mergeUniqueChapters(
    world.run?.savedCampaignSnapshot?.unlockedChapters,
    world.run?.unlockedChapters,
    true
  );
  if (!unlocked.includes(chapter)) {
    return false;
  }

  const candidateSnap = captureSavedCampaignSnapshotIfNeeded(world);
  const isReplay =
    world.run.completedChapters.includes(chapter) ||
    isSnapshotLaterOrChapterCompleted(chapter, candidateSnap);
  const savedSnap = isReplay ? candidateSnap : null;
  const completed = mergeUniqueChapters(
    candidateSnap?.completedChapters,
    world.run?.completedChapters,
    false
  );
  const recoveredLogs = mergeUniqueStrings(
    candidateSnap?.recoveredLogs,
    world.run?.recoveredLogs,
    isValidArchiveLogId
  );
  const completedEndings = mergeUniqueStrings(
    candidateSnap?.completedEndings,
    world.run?.completedEndings,
    isValidChronicleLoomEndingId
  );

  if (chapter === 'prologue') {
    startCampaignRun(world, skipIntro, true);
    world.run.unlockedChapters = [...unlocked];
    world.run.completedChapters = [...completed];
    world.run.recoveredLogs = [...recoveredLogs];
    world.run.completedEndings = [...completedEndings];
    world.run.isChapterReplay = isReplay;
    world.run.savedCampaignSnapshot = savedSnap;
    return true;
  }

  if (chapter === 'chapter_5_loom') {
    world.run.unlockedChapters = [...unlocked];
    world.run.completedChapters = [...completed];
    world.run.recoveredLogs = [...recoveredLogs];
    world.run.completedEndings = [...completedEndings];
    world.run.savedCampaignSnapshot = savedSnap;
    enterChronicleLoomChapter(world, isReplay);
    return true;
  }

  world.run.unlockedChapters = [...unlocked];
  world.run.completedChapters = [...completed];
  world.run.recoveredLogs = [...recoveredLogs];
  world.run.completedEndings = [...completedEndings];
  world.run.isChapterReplay = isReplay;
  world.run.savedCampaignSnapshot = savedSnap;
  world.run.bossCheckpoint =
    !isReplay && candidateSnap?.bossCheckpoint?.chapter === chapter
      ? {
          ...candidateSnap.bossCheckpoint,
          statsAtCheckpoint: { ...candidateSnap.bossCheckpoint.statsAtCheckpoint },
        }
      : null;
  const rigMaxIntegrity =
    GAME_CONFIG.player.maxIntegrity + getPlayerRigModifiers(world).maxIntegrityBonus;
  world.player.maxIntegrity = rigMaxIntegrity;
  world.player.integrity = rigMaxIntegrity;
  world.player.ghostIntegrity = rigMaxIntegrity;
  world.player.flux = GAME_CONFIG.player.initialFlux;
  transitionCampaignToBoss(world, skipIntro, chapter);
  return true;
}

export function restoreSavedCampaignProgress(world: WorldState): boolean {
  const snap = world.run?.savedCampaignSnapshot;
  if (!snap) return false;

  const unlocked = [...snap.unlockedChapters];
  const completed = [...snap.completedChapters];
  const recoveredLogs = [...(snap.recoveredLogs ?? world.run?.recoveredLogs ?? [])];
  const completedEndings = [
    ...(snap.completedEndings ?? world.run?.completedEndings ?? []),
  ];
  const restoredProgression = snap.progression
    ? sanitizePersistedWeaponProgressionState(snap.progression)
    : sanitizePersistedWeaponProgressionState(world.progression);
  const restoredExploration = snap.exploration
    ? sanitizePersistedExplorationState(snap.exploration)
    : sanitizePersistedExplorationState(world.exploration);

  let targetChapter: CampaignChapterId = snap.chapter;
  let targetStage: VerticalSliceStage =
    snap.stage === 'boss_intro' ? 'boss_fight' : snap.stage;
  let pending: CampaignChapterId | null = snap.pendingNextChapter;

  if (
    (snap.stage === 'completed' || snap.stage === 'transition_to_boss') &&
    snap.pendingNextChapter !== null
  ) {
    targetChapter = snap.pendingNextChapter;
    targetStage =
      targetChapter === 'chapter_5_loom' ? 'chronicle_loom' : 'boss_fight';
    pending = null;
  }

  const savedCheckpoint = snap.bossCheckpoint
    ? {
        ...snap.bossCheckpoint,
        statsAtCheckpoint: { ...snap.bossCheckpoint.statsAtCheckpoint },
      }
    : null;

  if (targetChapter === 'prologue') {
    startCampaignRun(world, true, true);
  } else if (targetChapter === 'chapter_5_loom') {
    world.run.bossCheckpoint = savedCheckpoint;
    if (targetStage === 'boss_fight') {
      engageWardenPrimeInLoom(world, true);
    } else {
      enterChronicleLoomChapter(world, false);
    }
  } else {
    world.run.bossCheckpoint = savedCheckpoint;
    transitionCampaignToBoss(world, true, targetChapter);
  }

  world.progression = {
    ...clonePersistedWeaponProgressionState(restoredProgression),
    lastPurchaseOutcome: null,
    lastEquipOutcome: null,
    lastActionMessage:
      'CAMPAIGN PROGRESSION RESTORED · UPGRADE BENCH SYNCHRONIZED',
  };
  syncResonanceUpgradeParameters(world);
  syncPlayerRigStats(world);

  world.run.mode = 'campaign';
  world.run.chapter = targetChapter;
  world.run.stage = targetStage;
  world.run.unlockedChapters = addUniqueChapter(unlocked, targetChapter);
  world.run.completedChapters = completed;
  world.run.recoveredLogs = recoveredLogs;
  world.run.completedEndings = completedEndings;
  world.run.pendingNextChapter = pending;
  world.run.bossCheckpoint = savedCheckpoint;
  world.run.selectedEnding = snap.selectedEnding;
  world.run.isChapterReplay = false;
  world.run.savedCampaignSnapshot = null;

  world.exploration = createInitialExplorationState(
    targetChapter,
    restoredExploration
  );
  syncChapterExpansionEntities(world, targetChapter);
  syncUnlockedRoutesToObstacles(world);
  advanceMissionAndExplorationSystem(world);

  const unlockedCampaignWeapons = normalizeUnlockedWeaponIds(
    world.progression.unlockedWeaponIds
  );
  const candidateWeaponId: WeaponId =
    (savedCheckpoint?.equippedWeaponId && isValidWeaponId(savedCheckpoint.equippedWeaponId)
      ? savedCheckpoint.equippedWeaponId
      : null) ??
    (snap.equippedWeaponId && isValidWeaponId(snap.equippedWeaponId)
      ? snap.equippedWeaponId
      : GAME_CONFIG.weapons.defaultWeaponId);
  const restoredWeaponId: WeaponId = unlockedCampaignWeapons.includes(candidateWeaponId)
    ? candidateWeaponId
    : GAME_CONFIG.weapons.defaultWeaponId;
  world.player.equippedWeaponId = restoredWeaponId;
  if (world.run.bossCheckpoint) {
    world.run.bossCheckpoint.equippedWeaponId = restoredWeaponId;
  }

  if (savedCheckpoint) {
    world.player.integrity = Math.min(world.player.maxIntegrity, savedCheckpoint.integrity);
    world.player.ghostIntegrity = world.player.integrity;
    world.player.flux = savedCheckpoint.flux;
    world.elapsedTime = savedCheckpoint.elapsedTimeAtCheckpoint;
    world.stats = {
      damageDealt: savedCheckpoint.statsAtCheckpoint.damageDealt,
      damageTaken: savedCheckpoint.statsAtCheckpoint.damageTaken,
      parriesLanded: savedCheckpoint.statsAtCheckpoint.parriesLanded,
      vulnerableHits: savedCheckpoint.statsAtCheckpoint.vulnerableHits,
    };
    world.resonance.convergenceCount = savedCheckpoint.statsAtCheckpoint.convergencesTriggered;
    world.relay.activationCount = savedCheckpoint.statsAtCheckpoint.relaysUsed;
  }

  return true;
}

export function selectChronicleLoomEnding(
  world: WorldState,
  endingId: ChronicleLoomEndingId
): boolean {
  if (!isValidChronicleLoomEndingId(endingId)) {
    return false;
  }
  if (
    !world.run ||
    !world.loom ||
    world.run.mode !== 'campaign' ||
    world.run.chapter !== 'chapter_5_loom' ||
    !world.loom.active ||
    !world.loom.endingChoiceAvailable ||
    world.loom.selectedEnding !== null
  ) {
    return false;
  }

  world.loom.selectedEnding = endingId;
  world.loom.endingChoiceAvailable = false;
  world.loom.selectionCount += 1;
  world.loom.completedAtTime = world.elapsedTime;
  world.run.selectedEnding = endingId;
  world.run.completedEndings = addUniqueString(
    world.run.completedEndings ?? [],
    endingId
  );
  if (world.run.savedCampaignSnapshot) {
    world.run.savedCampaignSnapshot.completedEndings = addUniqueString(
      world.run.savedCampaignSnapshot.completedEndings ?? [],
      endingId
    );
  }
  if (!world.run.isChapterReplay) {
    world.run.completedChapters = addUniqueChapter(
      world.run.completedChapters,
      'chapter_5_loom'
    );
    world.run.recoveredLogs = addUniqueString(
      world.run.recoveredLogs ?? [],
      'LOG-05'
    );
    world.run.savedCampaignSnapshot = null;
  }
  syncUnlockedBossCoresFromCampaign(world);
  world.outcome = 'victory';
  world.run.stage = 'completed';
  world.outcomeDelayTimer = 0;
  completeMissionObjective(world, 'obj_ch5_select_loom_directive');
  advanceMissionAndExplorationSystem(world);
  clearEchoState(world, 'outcome');
  recordWorldCombatMasteryOnVictory(world, ['sector_ch5_loom']);
  world.frozenSummary = buildRunSummary(world);
  world.appState = 'gameover';

  world.events.push({
    type: 'chronicle_loom_ending_selected',
    x: world.player.x,
    z: world.player.z,
  });
  world.events.push({
    type: 'encounter_victory',
    x: world.player.x,
    z: world.player.z,
  });
  return true;
}

export function skipContainmentTransition(world: WorldState): void {
  if (world.run.mode === 'campaign' && world.run.stage === 'transition_to_boss') {
    const targetChap = world.run.pendingNextChapter ?? 'chapter_1_helix';
    transitionCampaignToBoss(world, false, targetChap);
  }
}

export function skipBossIntroBanner(world: WorldState): boolean {
  if (world.encounterMode === 'boss' && world.run.stage === 'boss_intro') {
    world.run.stage = 'boss_fight';
    if (world.boss && world.boss.aiState === 'dormant') {
      world.boss.aiState = 'pursue';
      world.boss.stateDuration = 0;
      world.boss.stateTimer = 0;
      world.boss.cooldownTimer = 0.35;
      world.boss.statusLabel =
        world.boss.id === 'the-choir'
          ? 'PHASE I · HARMONIC RESONANCE MATRIX'
          : world.boss.id === 'the-curator'
            ? 'PHASE I · ARCHIVAL RECONSTRUCTION'
            : world.boss.id === 'matron-v'
              ? 'PHASE I · QUARANTINE SURGICAL WARD'
              : world.boss.id === 'warden-prime'
                ? 'PHASE I · SOVEREIGN LOOM DIRECTIVE'
                : 'PHASE I · CONTAINMENT PROTOCOL';
    }
    return true;
  }
  return false;
}

export function retryBossFromCheckpoint(world: WorldState, skipBossIntro = false): boolean {
  if (world.run.mode === 'campaign' && world.run.bossCheckpoint) {
    const targetChapter = world.run.bossCheckpoint.chapter ?? world.run.chapter ?? 'chapter_1_helix';
    if (targetChapter === 'chapter_5_loom') {
      if (world.run.bossCheckpoint.bossId === 'warden-prime') {
        const cp = {
          ...world.run.bossCheckpoint,
          statsAtCheckpoint: { ...world.run.bossCheckpoint.statsAtCheckpoint },
        };
        engageWardenPrimeInLoom(world, skipBossIntro);
        const unlockedForRetry = getUnlockedWeaponIds(world);
        const sanitizedRetryWeapon: WeaponId =
          cp.equippedWeaponId &&
          isValidWeaponId(cp.equippedWeaponId) &&
          unlockedForRetry.includes(cp.equippedWeaponId)
            ? cp.equippedWeaponId
            : GAME_CONFIG.weapons.defaultWeaponId;
        cp.equippedWeaponId = sanitizedRetryWeapon;
        world.run.bossCheckpoint = cp;
        world.player.integrity = cp.integrity;
        world.player.ghostIntegrity = cp.integrity;
        world.player.flux = cp.flux;
        world.player.equippedWeaponId = sanitizedRetryWeapon;
        world.elapsedTime = cp.elapsedTimeAtCheckpoint;
        world.stats = {
          damageDealt: cp.statsAtCheckpoint.damageDealt,
          damageTaken: cp.statsAtCheckpoint.damageTaken,
          parriesLanded: cp.statsAtCheckpoint.parriesLanded,
          vulnerableHits: cp.statsAtCheckpoint.vulnerableHits,
        };
        world.resonance.convergenceCount = cp.statsAtCheckpoint.convergencesTriggered;
        world.relay.activationCount = cp.statsAtCheckpoint.relaysUsed;
        world.run.checkpointNotice = `CHECKPOINT RESTORED · INTEGRITY ${cp.integrity} · FLUX ${cp.flux}`;
        world.run.checkpointNoticeTimer = 4.0;
        return true;
      }
      enterChronicleLoomChapter(world, world.run.isChapterReplay);
      return true;
    }
    transitionCampaignToBoss(world, skipBossIntro, targetChapter);
    const cp = world.run.bossCheckpoint!;
    world.run.checkpointNotice = `CHECKPOINT RESTORED · INTEGRITY ${cp.integrity} · FLUX ${cp.flux}`;
    world.run.checkpointNoticeTimer = 4.0;
    return true;
  }
  const currentBossId = (world.boss?.id as BossId | undefined) ?? 'helix-04';
  startPracticeBossRun(world, skipBossIntro, currentBossId);
  return true;
}

export function resetWorldForPlaying(world: WorldState): void {
  if (world.run?.mode === 'boss_gauntlet') {
    startBossGauntletRun(world, false);
    return;
  }
  if (world.run?.mode === 'recursion') {
    startRecursionProtocol(world, 1);
    return;
  }
  if (world.run?.mode === 'campaign' && world.run.chapter === 'chapter_5_loom') {
    enterChronicleLoomChapter(world, world.run.isChapterReplay);
    return;
  }
  if (world.encounterMode === 'boss') {
    if (world.run?.mode === 'campaign' && world.run.bossCheckpoint) {
      retryBossFromCheckpoint(world, false);
      return;
    }
    const currentBossId = (world.boss?.id as BossId | undefined) ?? 'helix-04';
    startBossEncounter(world, false, currentBossId);
    return;
  }
  if (world.run?.mode === 'campaign') {
    const preservedUnlocked = [...(world.run.unlockedChapters ?? ['prologue'])];
    const preservedCompleted = [...(world.run.completedChapters ?? [])];
    const preservedLogs = [...(world.run.recoveredLogs ?? [])];
    const preservedEndings = [...(world.run.completedEndings ?? [])];
    const isReplay = Boolean(world.run.isChapterReplay);
    const savedSnap = world.run.savedCampaignSnapshot;
    startCampaignRun(world, true, true);
    world.run.unlockedChapters = preservedUnlocked;
    world.run.completedChapters = preservedCompleted;
    world.run.recoveredLogs = preservedLogs;
    world.run.completedEndings = preservedEndings;
    world.run.isChapterReplay = isReplay;
    world.run.savedCampaignSnapshot = savedSnap;
    return;
  }
  const activeEncounterId: EncounterCompositionId =
    world.encounter && isValidEncounterCompositionId(world.encounter.encounterId)
      ? world.encounter.encounterId
      : GAME_CONFIG.encounters.defaultEncounterId;
  startPracticeStandardRun(world, activeEncounterId);
}

export function resetWorldForStandardPlaying(world: WorldState): void {
  const activeEncounterId: EncounterCompositionId =
    world.encounter && isValidEncounterCompositionId(world.encounter.encounterId)
      ? world.encounter.encounterId
      : GAME_CONFIG.encounters.defaultEncounterId;
  startPracticeStandardRun(world, activeEncounterId);
}

export function createEmptyInput(aimYaw = Math.PI): PlayerInputFrame {
  return {
    moveX: 0,
    moveZ: 0,
    aimYaw,
    aimPitch: GAME_CONFIG.camera.defaultPitch,
    lightAttackJustPressed: false,
    heavyHoldActive: false,
    heavyJustReleased: false,
    heavyAttackJustPressed: false,
    dodgeJustPressed: false,
    parryJustPressed: false,
    switchWeaponJustPressed: false,
    selectWeaponId: null,
    echoRecordJustPressed: false,
    echoPlayJustPressed: false,
    echoClearJustPressed: false,
    echoRelayJustPressed: false,
    gravityPinJustPressed: false,
    echoCollapseJustPressed: false,
    interactJustPressed: false,
    overdriveJustPressed: false,
    confluenceBurstJustPressed: false,
  };
}

const _solidPropCollidersCache = new Map<CampaignChapterId, readonly ObstacleCollider[]>();

export function getArenaSolidPropColliders(
  chapter: CampaignChapterId
): readonly ObstacleCollider[] {
  const cached = _solidPropCollidersCache.get(chapter);
  if (cached) return cached;

  const list: ObstacleCollider[] = [];
  const pushSolid = (id: string, x: number, z: number, radius: number, height: number, label: string) => {
    list.push({ id, x, z, radius, height, label, kind: 'pillar', disabled: false });
  };

  // 1. Chapter Interactables (Lore Terminals, Power Nodes, Gate Controls, Echo Conduits)
  const interactables = getAllInteractableDefinitionsForChapter(chapter);
  for (let i = 0; i < interactables.length; i++) {
    const def = interactables[i];
    pushSolid(`prop_col_${def.id}`, def.x, def.z, 0.68, 2.2, def.label);
  }

  // 2. Fragment Cache Pedestals (solid core; 0.72 + 0.55 player radius = 1.27m < 1.50m auto-claim aura)
  const caches = buildFragmentCachesForChapter(chapter, []);
  for (let i = 0; i < caches.length; i++) {
    const cache = caches[i];
    pushSolid(`prop_col_${cache.id}`, cache.x, cache.z, 0.72, 1.8, cache.label);
  }

  // 3. Sector Tactical Beacons (solid spire; 0.72 + 0.55 = 1.27m < 2.40m activation range)
  const beacons = buildSectorBeaconsForChapter(chapter);
  for (let i = 0; i < beacons.length; i++) {
    const beacon = beacons[i];
    pushSolid(`prop_col_${beacon.id}`, beacon.x, beacon.z, 0.72, 2.6, beacon.label);
  }

  // 4. Prologue Chrono Receiver twin pedestals (leave central kinetic target gap open for melee strike!)
  if (chapter === 'prologue') {
    const hrCfg = GAME_CONFIG.arena.chronoPuzzle.heavyReceiver;
    pushSolid('prop_col_chrono_rx_w', hrCfg.targetX - 1.44, hrCfg.targetZ, 0.58, 2.2, 'Chrono Receiver W');
    pushSolid('prop_col_chrono_rx_e', hrCfg.targetX + 1.44, hrCfg.targetZ, 0.58, 2.2, 'Chrono Receiver E');
  }

  // 5. Chapter-Specific Floor-Mounted Sanctum Landmarks (1:1 synced with GAME_CONFIG.arena.sanctumLandmarks & models.ts)
  const landmarks = GAME_CONFIG.arena.sanctumLandmarks;
  if (chapter === 'prologue') {
    landmarks.prologue.calibrationGates.forEach((gate, idx) => {
      const cosR = Math.cos(gate.rotY);
      const sinR = Math.sin(gate.rotY);
      for (const side of [-1, 1] as const) {
        const px = gate.x + side * 1.72 * cosR;
        const pz = gate.z - side * 1.72 * sinR;
        pushSolid(`prop_col_cal_gate_${idx}_${side > 0 ? 'r' : 'l'}`, px, pz, 0.52, 4.4, 'Calibration Gate Column');
      }
    });
    const dp = landmarks.prologue.diagPylon;
    pushSolid('prop_col_prologue_diag_pylon', dp.x, dp.z, dp.radius, 3.2, 'Diagnostic Pylon');
    const pHolo = landmarks.prologue.tacticalHoloTable;
    pushSolid('prop_col_prologue_holo_table', pHolo.x, pHolo.z, pHolo.radius, 1.35, 'Tactical Holo-Table');
  } else if (chapter === 'chapter_1_helix') {
    landmarks.chapter_1_helix.vaultBulkheads.forEach((bh, idx) => {
      for (const ox of [-1.55, 0, 1.55]) {
        pushSolid(`prop_col_bulkhead_${idx}_${ox}`, bh.x + ox, bh.z, 0.92, 6.0, 'Vault Bulkhead');
      }
    });
    landmarks.chapter_1_helix.containmentPylons.forEach((p, idx) => {
      pushSolid(`prop_col_containment_pylon_${idx}`, p.x, p.z, p.radius, 4.0, 'Containment Pylon');
    });
    const lb = landmarks.chapter_1_helix.lockdownBeacon;
    pushSolid('prop_col_lockdown_beacon', lb.x, lb.z, lb.radius, 3.6, 'Lockdown Beacon');
    const odc = landmarks.chapter_1_helix.overdriveConduit;
    pushSolid('prop_col_overdrive_conduit', odc.x, odc.z, odc.radius, 2.8, 'Overdrive Conduit');
  } else if (chapter === 'chapter_2_choir') {
    landmarks.chapter_2_choir.harmonicOrgans.forEach((org, idx) => {
      const cosR = Math.cos(org.rotY);
      const sinR = Math.sin(org.rotY);
      for (const ox of [-0.95, 0.95]) {
        pushSolid(
          `prop_col_harmonic_organ_${idx}_${ox > 0 ? 'r' : 'l'}`,
          org.x + ox * cosR,
          org.z - ox * sinR,
          1.05,
          5.5,
          'Harmonic Organ'
        );
      }
    });
  } else if (chapter === 'chapter_3_curator') {
    landmarks.chapter_3_curator.archiveMonoliths.forEach((m, idx) => {
      pushSolid(`prop_col_archive_monolith_${idx}`, m.x, m.z, m.radius, 5.2, 'Archive Monolith');
    });
    const hs = landmarks.chapter_3_curator.heroMemorySlab;
    pushSolid('prop_col_hero_memory_slab', hs.x, hs.z, hs.radius, 4.2, 'Memory Slab Monument');
    const c3Holo = landmarks.chapter_3_curator.tacticalHoloTable;
    pushSolid('prop_col_ch3_holo_table', c3Holo.x, c3Holo.z, c3Holo.radius, 1.35, 'Tactical Holo-Table');
  } else if (chapter === 'chapter_4_matron') {
    landmarks.chapter_4_matron.stasisPods.forEach((pod, idx) => {
      pushSolid(`prop_col_stasis_pod_${idx}`, pod.x, pod.z, pod.radius, 4.2, 'Stasis Pod');
    });
    landmarks.chapter_4_matron.cryoMedTables.forEach((tbl, idx) => {
      pushSolid(`prop_col_cryo_med_table_${idx}`, tbl.x, tbl.z, tbl.radius, 1.85, 'Cryo Med-Table');
    });
  } else if (chapter === 'chapter_5_loom') {
    landmarks.chapter_5_loom.sovereignSeals.forEach((seal, idx) => {
      pushSolid(`prop_col_sovereign_seal_${idx}`, seal.x, seal.z, seal.radius, 5.5, 'Sovereign Seal');
    });
    landmarks.chapter_5_loom.convergencePillars.forEach((cp, idx) => {
      pushSolid(`prop_col_convergence_pillar_${idx}`, cp.x, cp.z, cp.radius, 4.6, 'Convergence Pillar');
    });
    const dc = landmarks.chapter_5_loom.directiveCore;
    pushSolid('prop_col_directive_core', dc.x, dc.z, dc.radius, 3.6, 'Directive Core Altar');
  }

  // 6. Perimeter Data Console Command Desks (i % 4 === 3 around 16-segment observation ring)
  const numSegments = 16;
  const wallDist = GAME_CONFIG.arena.radius + 0.35;
  for (let i = 3; i < numSegments; i += 4) {
    const angle = (i / numSegments) * Math.PI * 2;
    const sinA = Math.sin(angle);
    const cosA = Math.cos(angle);
    const wx = sinA * (wallDist - 1.08) + 0.35 * cosA;
    const wz = cosA * (wallDist - 1.08) - 0.35 * sinA;
    pushSolid(`prop_col_data_console_${i}`, wx, wz, 1.15, 1.4, 'Perimeter Data Console');
  }

  _solidPropCollidersCache.set(chapter, list);
  return list;
}

function resolveCircleObstacleCollisions(
  entity: { x: number; z: number; radius: number },
  obstacles: readonly ObstacleCollider[],
  arenaRadius: number,
  extraColliders?: readonly ObstacleCollider[]
): void {
  const resolveList = (list: readonly ObstacleCollider[]) => {
    for (let i = 0; i < list.length; i++) {
      const obs = list[i];
      if (obs.disabled) continue;
      const dx = entity.x - obs.x;
      const dz = entity.z - obs.z;
      const distSq = dx * dx + dz * dz;
      const minDist = entity.radius + obs.radius;
      if (distSq < minDist * minDist) {
        if (distSq < 1e-6) {
          entity.z += minDist;
        } else {
          const dist = Math.sqrt(distSq);
          const overlap = minDist - dist;
          entity.x += (dx / dist) * overlap;
          entity.z += (dz / dist) * overlap;
        }
      }
    }
  };

  for (let pass = 0; pass < 2; pass++) {
    resolveList(obstacles);
    if (extraColliders && extraColliders.length > 0) {
      resolveList(extraColliders);
    }
  }

  // Clamp inside circular arena perimeter
  const maxDist = arenaRadius - entity.radius;
  const distFromCenter = Math.hypot(entity.x, entity.z);
  if (distFromCenter > maxDist) {
    const scale = maxDist / distFromCenter;
    entity.x *= scale;
    entity.z *= scale;
  }
}

function resolveActorSeparation(player: PlayerState, enemies: EnemyState[]): void {
  const pRadius = GAME_CONFIG.player.radius;

  // Player vs living enemies (Echoes are intentionally excluded so they never block Sera or enemies)
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    if (enemy.aiState === 'ko') continue;
    const dx = player.x - enemy.x;
    const dz = player.z - enemy.z;
    const distSq = dx * dx + dz * dz;
    const minDist = pRadius + enemy.radius;
    if (distSq < minDist * minDist) {
      const dist = Math.sqrt(distSq) || 0.0001;
      const overlap = minDist - dist;
      const nx = dx / dist;
      const nz = dz / dist;
      player.x += nx * overlap * 0.65;
      player.z += nz * overlap * 0.65;
      enemy.x -= nx * overlap * 0.35;
      enemy.z -= nz * overlap * 0.35;
    }
  }

  // Enemy vs Enemy separation
  for (let i = 0; i < enemies.length; i++) {
    const a = enemies[i];
    if (a.aiState === 'ko') continue;
    for (let j = i + 1; j < enemies.length; j++) {
      const b = enemies[j];
      if (b.aiState === 'ko') continue;
      const dx = a.x - b.x;
      const dz = a.z - b.z;
      const distSq = dx * dx + dz * dz;
      const minDist = a.radius + b.radius;
      if (distSq < minDist * minDist) {
        const dist = Math.sqrt(distSq) || 0.0001;
        const overlap = (minDist - dist) * 0.5;
        const nx = dx / dist;
        const nz = dz / dist;
        a.x += nx * overlap;
        a.z += nz * overlap;
        b.x -= nx * overlap;
        b.z -= nz * overlap;
      }
    }
  }
}

function getEffectivePlayerHeavyChargeThreshold(
  world: WorldState,
  player: PlayerState
): number {
  const baseThresh =
    player.equippedWeaponId === 'pulsecaster'
      ? GAME_CONFIG.weapons.pulsecaster.heavyShot.chargeThreshold
      : player.equippedWeaponId === 'phase_rail'
        ? GAME_CONFIG.weapons.phase_rail.heavyShot.chargeThreshold
        : player.equippedWeaponId === 'grav_breaker'
          ? GAME_CONFIG.weapons.grav_breaker.heavySlam.chargeThreshold
          : player.equippedWeaponId === 'chrono_scythe'
            ? GAME_CONFIG.weapons.chrono_scythe.heavyVortex.chargeThreshold
            : GAME_CONFIG.player.heavyAttack.chargeThreshold;
  const attunement = computeWeaponCoreAttunement(
    player.equippedWeaponId,
    world.progression?.equippedBossCore,
    world.progression?.transcendedBossCores
  );
  const rigDelay = getPlayerRigModifiers(world).heavyChargeDelayDelta;
  return Math.max(0.18, baseThresh * attunement.chargeThresholdMultiplier + rigDelay);
}

function capturePlayerEchoSample(
  world: WorldState,
  player: PlayerState,
  t: number
): EchoSample {
  const chargeThresh = getEffectivePlayerHeavyChargeThreshold(world, player);
  return {
    t,
    x: player.x,
    z: player.z,
    rotationY: player.rotationY,
    actionState: player.actionState,
    gaitPhase: player.gaitPhase,
    comboIndex: player.comboIndex,
    chargeRatio: Math.min(1, player.chargeTime / chargeThresh),
    isEmpoweredHeavy: player.isEmpoweredHeavy,
    weaponId: player.equippedWeaponId,
    equippedUpgradeId: getEquippedWeaponUpgrade(world, player.equippedWeaponId),
  };
}

function recordEchoActionEvent(
  world: WorldState,
  action: EchoRecordedActionType
): void {
  if (world.echo.state !== 'recording') return;
  const p = world.player;
  const t = Math.min(world.echo.maxDuration, world.echo.recordingTime);
  const eventIndex = world.echo.recordingEvents.length;
  let contactTime = t;
  if (action === 'heavy_swing') {
    contactTime = t + GAME_CONFIG.player.heavyAttack.windup;
  } else if (action === 'light_swing') {
    const stepIdx = Math.min(2, Math.max(0, p.comboIndex));
    contactTime = t + (GAME_CONFIG.player.lightAttack.windup[stepIdx] ?? 0.09);
  } else if (action === 'pulse_shot') {
    contactTime = t + GAME_CONFIG.weapons.pulsecaster.lightShot.windup;
  } else if (action === 'pulse_charged_shot') {
    contactTime = t + GAME_CONFIG.weapons.pulsecaster.heavyShot.windup;
  } else if (action === 'rail_shot') {
    contactTime = t + GAME_CONFIG.weapons.phase_rail.lightShot.windup;
  } else if (action === 'rail_charged_shot') {
    contactTime = t + GAME_CONFIG.weapons.phase_rail.heavyShot.windup;
  } else if (action === 'breaker_slam') {
    const stepIdx = Math.min(2, Math.max(0, p.comboIndex));
    contactTime = t + (GAME_CONFIG.weapons.grav_breaker.lightSlam.windup[stepIdx] ?? 0.16);
  } else if (action === 'breaker_charged_slam') {
    contactTime = t + GAME_CONFIG.weapons.grav_breaker.heavySlam.windup;
  }
  world.echo.recordingEvents.push({
    id: `clip-${world.echo.clipCounter + 1}-evt-${eventIndex}`,
    t,
    contactTime,
    action,
    x: p.x,
    z: p.z,
    rotationY: p.rotationY,
    comboIndex: p.comboIndex,
    isEmpoweredHeavy: p.isEmpoweredHeavy,
    weaponId: p.equippedWeaponId,
    equippedUpgradeId: getEquippedWeaponUpgrade(world, p.equippedWeaponId),
  });
}

function startEchoRecording(world: WorldState): void {
  const echo = world.echo;
  if (world.matron?.active && world.matron.echoSuppressedTimer > 0) {
    echo.statusMessage = `CHRONO RIG SUPPRESSED BY ERASER PULSE (${world.matron.echoSuppressedTimer.toFixed(1)}s)`;
    world.events.push({
      type: 'echo_recording_rejected',
      x: world.player.x,
      z: world.player.z,
    });
    return;
  }

  const hadPrevious =
    echo.clip !== null || echo.state === 'playback' || echo.activeActor !== null;

  echo.activeActor = null;
  echo.clip = null;
  echo.state = 'recording';
  echo.recordingTime = 0;
  echo.playbackTime = 0;
  echo.nextEventIndex = 0;
  echo.recordingSamples = [capturePlayerEchoSample(world, world.player, 0)];
  echo.recordingEvents = [];

  if (hadPrevious) {
    echo.statusMessage = 'PREVIOUS ECHO REPLACED · RECORDING NEW SEQUENCE...';
    world.events.push({
      type: 'echo_recording_replaced',
      x: world.player.x,
      z: world.player.z,
    });
  } else {
    echo.statusMessage = 'RECORDING CHRONO ECHO · PRESS [T] TO FINALIZE OR [Y] TO REPLAY';
  }

  world.events.push({
    type: 'echo_recording_started',
    x: world.player.x,
    z: world.player.z,
  });

  updatePressurePlate(world);
}

function finalizeEchoRecording(world: WorldState, autoCapped = false): boolean {
  const echo = world.echo;
  if (echo.state !== 'recording') return false;

  const duration = Math.min(echo.maxDuration, echo.recordingTime);
  if (duration < echo.minDuration) {
    echo.state = 'idle';
    echo.recordingTime = 0;
    echo.recordingSamples = [];
    echo.recordingEvents = [];
    echo.clip = null;
    echo.activeActor = null;
    echo.statusMessage = `RECORDING TOO SHORT (${duration.toFixed(2)}s < ${echo.minDuration.toFixed(2)}s MIN)`;
    world.events.push({
      type: 'echo_recording_rejected',
      x: world.player.x,
      z: world.player.z,
    });
    updatePressurePlate(world);
    return false;
  }

  const samples = echo.recordingSamples.slice();
  const finalSample = capturePlayerEchoSample(world, world.player, duration);
  if (samples.length === 0 || samples[samples.length - 1].t < duration - 1e-5) {
    samples.push(finalSample);
  } else {
    samples[samples.length - 1] = finalSample;
  }

  echo.clipCounter += 1;
  const clipId = echo.clipCounter;
  echo.clip = {
    id: clipId,
    duration,
    samples,
    events: echo.recordingEvents
      .filter((ev) => ev.t <= duration + 1e-5)
      .map((ev, idx) => {
        const clampedT = Math.min(duration, Math.max(0, ev.t));
        const defaultOffset =
          ev.action === 'heavy_swing'
            ? GAME_CONFIG.player.heavyAttack.windup
            : ev.action === 'light_swing'
              ? (GAME_CONFIG.player.lightAttack.windup[Math.min(2, Math.max(0, ev.comboIndex))] ?? 0.09)
              : ev.action === 'pulse_shot'
                ? GAME_CONFIG.weapons.pulsecaster.lightShot.windup
                : ev.action === 'pulse_charged_shot'
                  ? GAME_CONFIG.weapons.pulsecaster.heavyShot.windup
                  : ev.action === 'rail_shot'
                    ? GAME_CONFIG.weapons.phase_rail.lightShot.windup
                    : ev.action === 'rail_charged_shot'
                      ? GAME_CONFIG.weapons.phase_rail.heavyShot.windup
                      : ev.action === 'breaker_slam'
                        ? (GAME_CONFIG.weapons.grav_breaker.lightSlam.windup[Math.min(2, Math.max(0, ev.comboIndex))] ?? 0.16)
                        : ev.action === 'breaker_charged_slam'
                          ? GAME_CONFIG.weapons.grav_breaker.heavySlam.windup
                          : 0;
        const rawContact =
          typeof ev.contactTime === 'number' ? ev.contactTime : clampedT + defaultOffset;
        return {
          ...ev,
          id: ev.id ?? `clip-${clipId}-evt-${idx}`,
          t: clampedT,
          contactTime: Math.max(clampedT, rawContact),
        };
      }),
  };
  echo.recordingSamples = [];
  echo.recordingEvents = [];
  echo.state = 'ready';
  echo.playbackTime = 0;
  echo.nextEventIndex = 0;
  echo.processedContactEventIds = [];
  echo.activeActor = null;
  echo.statusMessage = autoCapped
    ? `MAX DURATION (${duration.toFixed(1)}s) REACHED · ECHO READY — PRESS [Y] TO REPLAY`
    : `ECHO CLIP READY (${duration.toFixed(1)}s) · PRESS [Y] TO REPLAY`;

  world.events.push({
    type: 'echo_recording_ready',
    x: world.player.x,
    z: world.player.z,
  });
  updatePressurePlate(world);
  return true;
}

function evaluateEchoClipAtTime(clip: EchoClip, t: number): EchoSample {
  const samples = clip.samples;
  if (samples.length === 0) {
    return {
      t: 0,
      x: 0,
      z: 0,
      rotationY: Math.PI,
      actionState: 'idle',
      gaitPhase: 0,
      comboIndex: 0,
      chargeRatio: 0,
      isEmpoweredHeavy: false,
      weaponId: 'chrono_edge',
    };
  }
  if (t <= samples[0].t || samples.length === 1) {
    return {
      ...samples[0],
      t: Math.max(0, t),
      weaponId: samples[0].weaponId ?? 'chrono_edge',
    };
  }
  const last = samples[samples.length - 1];
  if (t >= last.t) {
    return {
      ...last,
      t: clip.duration,
      weaponId: last.weaponId ?? 'chrono_edge',
    };
  }

  // Binary search for bounding samples s0.t <= t <= s1.t
  let lo = 0;
  let hi = samples.length - 1;
  while (lo + 1 < hi) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].t <= t) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const s0 = samples[lo];
  const s1 = samples[hi];
  const span = s1.t - s0.t;
  const alpha = span > 1e-6 ? Math.max(0, Math.min(1, (t - s0.t) / span)) : 0;

  return {
    t,
    x: s0.x + (s1.x - s0.x) * alpha,
    z: s0.z + (s1.z - s0.z) * alpha,
    rotationY: wrapAngle(s0.rotationY + angleDiff(s1.rotationY, s0.rotationY) * alpha),
    actionState: alpha < 0.999 ? s0.actionState : s1.actionState,
    gaitPhase: s0.gaitPhase + (s1.gaitPhase - s0.gaitPhase) * alpha,
    comboIndex: alpha < 0.999 ? s0.comboIndex : s1.comboIndex,
    chargeRatio: s0.chargeRatio + (s1.chargeRatio - s0.chargeRatio) * alpha,
    isEmpoweredHeavy: alpha < 0.999 ? s0.isEmpoweredHeavy : s1.isEmpoweredHeavy,
    weaponId: (alpha < 0.999 ? s0.weaponId : s1.weaponId) ?? 'chrono_edge',
    equippedUpgradeId:
      (alpha < 0.999 ? s0.equippedUpgradeId : s1.equippedUpgradeId) ?? null,
  };
}

function spawnEchoPulsecasterProjectile(
  world: WorldState,
  clipId: number,
  ev: EchoRecordedActionEvent
): void {
  const isPulse = ev.action === 'pulse_shot' || ev.action === 'pulse_charged_shot';
  const isRail = ev.action === 'rail_shot' || ev.action === 'rail_charged_shot';
  if (!isPulse && !isRail) return;
  const isHeavy = ev.action === 'pulse_charged_shot' || ev.action === 'rail_charged_shot';
  const cfg = isRail
    ? isHeavy
      ? GAME_CONFIG.weapons.phase_rail.heavyShot
      : GAME_CONFIG.weapons.phase_rail.lightShot
    : isHeavy
      ? GAME_CONFIG.weapons.pulsecaster.heavyShot
      : GAME_CONFIG.weapons.pulsecaster.lightShot;
  const dirX = Math.sin(ev.rotationY);
  const dirZ = Math.cos(ev.rotationY);
  const muzzleOffset = 0.65;
  const startX = ev.x + dirX * muzzleOffset;
  const startZ = ev.z + dirZ * muzzleOffset;

  while (world.projectiles.length >= GAME_CONFIG.weapons.maxActiveProjectiles) {
    world.projectiles.shift();
  }

  const echoProtos = world.progression?.purchasedNeuralProtocols ?? [];
  const hasEchoMatrix = echoProtos.includes('proto_echo_harmonics');
  const echoProtoMods = computeNeuralProtocolModifiers(echoProtos);
  const echoDocSpec = getEchoDoctrineSpec(world.progression?.echoDoctrine);
  const echoChipDmg = hasEchoMatrix
    ? Math.round(5 * echoProtoMods.echoDamageMultiplier * echoDocSpec.echoDamageMultiplier)
    : 0;
  const echoChipStagger = hasEchoMatrix
    ? Math.round(7 * echoProtoMods.echoStaggerMultiplier * echoDocSpec.echoStaggerMultiplier)
    : 0;

  const projId = `proj-echo-${world.nextProjectileId++}`;
  world.projectiles.push({
    id: projId,
    owner: 'echo',
    weaponId: isRail ? 'phase_rail' : 'pulsecaster',
    equippedUpgradeId: ev.equippedUpgradeId ?? null,
    attackMode: isRail
      ? isHeavy
        ? 'rail_heavy'
        : 'rail_light'
      : isHeavy
        ? 'pulse_heavy'
        : 'pulse_light',
    x: startX,
    z: startZ,
    prevX: ev.x,
    prevZ: ev.z,
    vx: dirX * cfg.projectileSpeed,
    vz: dirZ * cfg.projectileSpeed,
    rotationY: ev.rotationY,
    radius: cfg.projectileRadius,
    damage: echoChipDmg,
    staggerDamage: echoChipStagger,
    isHeavy,
    isEmpowered: Boolean(ev.isEmpoweredHeavy),
    maxRange: cfg.maxRange,
    distanceTraveled: 0,
    elapsed: 0,
    maxLifetime: cfg.maxLifetime,
    active: true,
    piercing: Boolean(isRail && isHeavy),
    attackStartedAt: world.elapsedTime,
    attackMarkId: null,
    hitTargetIds: [],
    echoClipId: clipId,
    echoEventId: ev.id,
  });
}

function startEchoPlayback(world: WorldState): boolean {
  const echo = world.echo;

  if (world.matron?.active && world.matron.echoSuppressedTimer > 0) {
    echo.statusMessage = `ECHO PLAYBACK SUPPRESSED BY ERASER PULSE (${world.matron.echoSuppressedTimer.toFixed(1)}s)`;
    world.events.push({
      type: 'echo_playback_rejected',
      x: world.player.x,
      z: world.player.z,
    });
    return false;
  }

  // If currently recording, finalize first if long enough; otherwise reject
  if (echo.state === 'recording') {
    const ok = finalizeEchoRecording(world, false);
    if (!ok) return false;
  }

  if (!echo.clip || echo.clip.samples.length === 0) {
    echo.statusMessage = 'NO VALID ECHO CLIP · PRESS [T] TO RECORD FIRST';
    world.events.push({
      type: 'echo_playback_rejected',
      x: world.player.x,
      z: world.player.z,
    });
    return false;
  }

  const clip = echo.clip;
  const pose0 = evaluateEchoClipAtTime(clip, 0);

  echo.state = 'playback';
  echo.playbackTime = 0;
  echo.nextEventIndex = 0;
  echo.processedContactEventIds = [];
  if (world.choir?.active) {
    world.choir.processedNodeEventIds = [];
  }
  echo.activeActor = {
    id: `echo-actor-${clip.id}`,
    clipId: clip.id,
    x: pose0.x,
    z: pose0.z,
    rotationY: pose0.rotationY,
    radius: GAME_CONFIG.player.radius,
    actionState: pose0.actionState,
    gaitPhase: pose0.gaitPhase,
    comboIndex: pose0.comboIndex,
    chargeRatio: pose0.chargeRatio,
    isEmpoweredHeavy: pose0.isEmpoweredHeavy,
    weaponId: pose0.weaponId ?? 'chrono_edge',
    equippedUpgradeId: pose0.equippedUpgradeId ?? null,
    elapsed: 0,
    duration: clip.duration,
  };
  echo.statusMessage = `ECHO REPLAYING (${clip.duration.toFixed(1)}s)...`;

  world.events.push({
    type: 'echo_playback_started',
    x: pose0.x,
    z: pose0.z,
  });
  triggerEchoDoctrineNovaPulse(world, pose0.x, pose0.z);

  // Fire any action events recorded at t === 0
  while (
    echo.nextEventIndex < clip.events.length &&
    clip.events[echo.nextEventIndex].t <= 1e-6
  ) {
    const ev = clip.events[echo.nextEventIndex];
    echo.nextEventIndex += 1;
    if (echo.activeActor && ev.weaponId) {
      echo.activeActor.weaponId = ev.weaponId;
    }
    world.events.push({
      type: 'echo_action_visual',
      x: ev.x,
      z: ev.z,
      isHeavy:
        ev.action === 'heavy_swing' ||
        ev.action === 'pulse_charged_shot' ||
        ev.action === 'rail_charged_shot' ||
        ev.action === 'breaker_charged_slam',
      echoAction: ev.action,
      weaponId: ev.weaponId,
    });
    spawnEchoPulsecasterProjectile(world, clip.id, ev);
    evaluateEchoActionOnPuzzle(world, ev);
  }

  evaluateDueEchoResonanceContacts(world, clip, 0);
  evaluateDueEchoChoirNodes(world, clip, 0);

  updatePressurePlate(world);
  return true;
}

export function clearEchoState(world: WorldState, reason: 'user' | 'outcome' = 'user'): void {
  const echo = world.echo;
  const hadAnything =
    echo.state !== 'idle' || echo.clip !== null || echo.activeActor !== null;

  echo.state = 'idle';
  echo.recordingTime = 0;
  echo.playbackTime = 0;
  echo.nextEventIndex = 0;
  echo.processedContactEventIds = [];
  echo.recordingSamples = [];
  echo.recordingEvents = [];
  echo.clip = null;
  echo.activeActor = null;
  echo.statusMessage =
    reason === 'user'
      ? 'ECHO CLEARED · PRESS [T] TO RECORD NEW SEQUENCE'
      : 'ECHO TERMINATED';

  // Remove any active Echo-owned projectiles when the Echo is cleared
  if (world.projectiles && world.projectiles.length > 0) {
    for (let i = world.projectiles.length - 1; i >= 0; i--) {
      if (world.projectiles[i].owner === 'echo') {
        world.projectiles.splice(i, 1);
      }
    }
  }

  // Clearing the Echo also clears any active pending Resonance mark so no stale target marker survives
  if (world.resonance) {
    world.resonance.activeMark = null;
    world.resonance.status = world.resonance.cooldownTimer > 0 ? 'on_cooldown' : 'idle';
    if (reason === 'user') {
      world.resonance.statusMessage =
        'ECHO CLEARED · RECORD ECHO HEAVY [E] ON TARGET TO PRIME RESONANCE';
    }
  }

  // Clearing the Echo also discharges any active receiver charge so puzzle state resets cleanly
  if (world.puzzle) {
    world.puzzle.heavyReceiver.charged = false;
    world.puzzle.heavyReceiver.chargeTimer = 0;
    world.puzzle.heavyReceiver.lastAttemptOutcome = 'none';
  }

  if (hadAnything && reason === 'user') {
    world.events.push({
      type: 'echo_cleared',
      x: world.player.x,
      z: world.player.z,
    });
  }

  updatePressurePlate(world);
  world.relay.preview = evaluateRelayTarget(world);
}

function handleEchoControlInputs(world: WorldState, input: PlayerInputFrame): void {
  if (world.player.actionState === 'dead' || world.outcome !== 'none') return;

  if (input.echoClearJustPressed) {
    clearEchoState(world, 'user');
    return;
  }

  if (input.echoRecordJustPressed) {
    if (world.echo.state === 'recording') {
      finalizeEchoRecording(world, false);
    } else {
      startEchoRecording(world);
    }
    world.relay.preview = evaluateRelayTarget(world);
    return;
  }

  if (input.echoPlayJustPressed) {
    startEchoPlayback(world);
    world.relay.preview = evaluateRelayTarget(world);
  }
}

function evaluateEchoActionOnPuzzle(world: WorldState, ev: EchoRecordedActionEvent): void {
  const receiver = world.puzzle?.heavyReceiver;
  if (!receiver) return;

  const actor = world.echo.activeActor;
  const distEvent = Math.hypot(ev.x - receiver.x, ev.z - receiver.z);
  const distActor = actor ? Math.hypot(actor.x - receiver.x, actor.z - receiver.z) : distEvent;
  const distToPad = Math.min(distEvent, distActor);
  const isQualifyingHeavy =
    ev.action === 'heavy_swing' ||
    ev.action === 'pulse_charged_shot' ||
    ev.action === 'rail_charged_shot' ||
    ev.action === 'breaker_charged_slam';

  if (distToPad <= receiver.radius) {
    if (!isQualifyingHeavy) {
      receiver.lastAttemptOutcome = 'wrong_action';
      world.echo.statusMessage =
        'KINETIC RECEIVER REQUIRES HEAVY CLEAVE [E] · LIGHT/DODGE/PARRY REJECTED';
      world.events.push({
        type: 'echo_receiver_rejected',
        x: ev.x,
        z: ev.z,
        echoAction: ev.action,
      });
      return;
    }

    const angleToTarget = Math.atan2(receiver.targetX - ev.x, receiver.targetZ - ev.z);
    const diffCanonical = Math.abs(angleDiff(ev.rotationY, receiver.targetYaw));
    const diffToNode = Math.abs(angleDiff(ev.rotationY, angleToTarget));
    const bestAngleDiff = Math.min(diffCanonical, diffToNode);

    if (bestAngleDiff <= receiver.angleTolerance) {
      receiver.charged = true;
      receiver.chargeTimer = receiver.chargeDuration;
      receiver.activationCount += 1;
      receiver.lastAttemptOutcome = 'charged';
      const wasTestCompleted = world.puzzle.testCompleted;
      world.puzzle.testCompleted = true;
      if (!wasTestCompleted) {
        grantProgressionReward(world, 'prologue_calibration_test');
      }
      world.echo.statusMessage =
        'KINETIC RECEIVER CHARGED · HOLD ANCHOR PAD WITH ECHO TO OPEN ARCHIVE BARRIER';
      world.events.push({
        type: 'echo_receiver_activated',
        x: receiver.targetX,
        z: receiver.targetZ,
        isHeavy: true,
        echoAction: ev.action,
      });
    } else {
      receiver.lastAttemptOutcome = 'wrong_orientation';
      world.echo.statusMessage =
        'RECEIVER MISALIGNED · FACE CONDUIT CORE WHEN RECORDING HEAVY [E]';
      world.events.push({
        type: 'echo_receiver_rejected',
        x: ev.x,
        z: ev.z,
        isHeavy: true,
        echoAction: ev.action,
      });
    }
  } else if (isQualifyingHeavy) {
    if (!receiver.charged) {
      receiver.lastAttemptOutcome = 'out_of_range';
    }
  }
}

export function isEnemyWithinMeleeEnvelope(
  attackerX: number,
  attackerZ: number,
  attackerYaw: number,
  range: number,
  arcRadians: number,
  enemy: EnemyState
): { withinEnvelope: boolean; dist: number; angleDiffRad: number } {
  if (enemy.hp <= 0 || enemy.aiState === 'ko') {
    return { withinEnvelope: false, dist: Infinity, angleDiffRad: Math.PI };
  }
  const dx = enemy.x - attackerX;
  const dz = enemy.z - attackerZ;
  const dist = Math.hypot(dx, dz);
  if (dist > range + enemy.radius) {
    return { withinEnvelope: false, dist, angleDiffRad: Math.PI };
  }
  const angleToEnemy = Math.atan2(dx, dz);
  const diff = Math.abs(angleDiff(angleToEnemy, attackerYaw));
  const halfArc = arcRadians * 0.5;
  const withinArc =
    diff <= halfArc || dist <= enemy.radius + GAME_CONFIG.player.radius + 0.45;
  return { withinEnvelope: withinArc, dist, angleDiffRad: diff };
}

export function hasMeleeLineOfSight(
  ax: number,
  az: number,
  bx: number,
  bz: number,
  obstacles: ObstacleCollider[]
): boolean {
  const margin = GAME_CONFIG.resonance.lineOfSightMargin;
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    if (obs.disabled) continue;
    const effectiveRadius = Math.max(0.1, obs.radius - margin);
    if (distToSegmentSq(obs.x, obs.z, ax, az, bx, bz) < effectiveRadius * effectiveRadius) {
      return false;
    }
  }
  return true;
}

export function queryEchoResonanceTarget(
  world: WorldState,
  attackerX: number,
  attackerZ: number,
  attackerYaw: number,
  isRangedPulse = false,
  echoAction?: EchoRecordedActionType,
  equippedUpgradeId?: WeaponUpgradeId | null
): { target: EnemyState | null; outcome: 'found' | 'out_of_range' | 'line_of_sight_blocked' } {
  const isRail = echoAction === 'rail_charged_shot';
  const isBreaker = echoAction === 'breaker_charged_slam';
  const hasSingularityCoil =
    isBreaker &&
    (equippedUpgradeId === 'breaker_singularity_coil' ||
      (equippedUpgradeId === undefined &&
        getEquippedWeaponUpgrade(world, 'grav_breaker') === 'breaker_singularity_coil'));
  const range = isRail
    ? GAME_CONFIG.weapons.phase_rail.heavyShot.range
    : isRangedPulse
      ? GAME_CONFIG.weapons.pulsecaster.heavyShot.range
      : isBreaker
        ? GAME_CONFIG.weapons.grav_breaker.heavySlam.range +
          (hasSingularityCoil
            ? GAME_CONFIG.weapons.upgrades.breaker_singularity_coil.heavyRangeBonus
            : 0)
        : GAME_CONFIG.player.heavyAttack.range;
  const arcRadians = isRail
    ? Math.PI * 0.28
    : isRangedPulse
      ? Math.PI * 0.34
      : isBreaker
        ? hasSingularityCoil
          ? GAME_CONFIG.weapons.upgrades.breaker_singularity_coil.fullRadialArc
          : GAME_CONFIG.weapons.grav_breaker.heavySlam.arcRadians
        : GAME_CONFIG.player.heavyAttack.arcRadians;

  let bestEnemy: EnemyState | null = null;
  let bestDist = Infinity;
  let bestAngleDiff = Infinity;
  let anyInEnvelopeBlockedByLos = false;

  for (let i = 0; i < world.enemies.length; i++) {
    const enemy = world.enemies[i];
    // False Echo decoys in Chapter III cannot be accepted as authoritative Echo Resonance targets
    if (enemy.isDecoy || enemy.archetype === 'curator_decoy') {
      continue;
    }
    if (
      world.boss &&
      world.boss.id === enemy.id &&
      (world.boss.aiState === 'dormant' ||
        world.boss.aiState === 'phase_transition' ||
        world.boss.aiState === 'ko' ||
        world.boss.aiState === 'defeated')
    ) {
      continue;
    }
    const check = isEnemyWithinMeleeEnvelope(
      attackerX,
      attackerZ,
      attackerYaw,
      range,
      arcRadians,
      enemy
    );
    if (!check.withinEnvelope) continue;

    if (!hasMeleeLineOfSight(attackerX, attackerZ, enemy.x, enemy.z, world.obstacles)) {
      anyInEnvelopeBlockedByLos = true;
      continue;
    }

    const isCloser = check.dist < bestDist - 1e-5;
    const isSameDistBetterAngle =
      Math.abs(check.dist - bestDist) <= 1e-5 && check.angleDiffRad < bestAngleDiff - 1e-5;
    const isSameAngleLexicalTieBreak =
      Math.abs(check.dist - bestDist) <= 1e-5 &&
      Math.abs(check.angleDiffRad - bestAngleDiff) <= 1e-5 &&
      bestEnemy !== null &&
      enemy.id.localeCompare(bestEnemy.id) < 0;

    if (bestEnemy === null || isCloser || isSameDistBetterAngle || isSameAngleLexicalTieBreak) {
      bestEnemy = enemy;
      bestDist = check.dist;
      bestAngleDiff = check.angleDiffRad;
    }
  }

  if (bestEnemy) {
    return { target: bestEnemy, outcome: 'found' };
  }
  if (anyInEnvelopeBlockedByLos) {
    return { target: null, outcome: 'line_of_sight_blocked' };
  }
  return { target: null, outcome: 'out_of_range' };
}

export function getEchoActionContactTime(_clip: EchoClip, ev: EchoRecordedActionEvent): number {
  if (typeof ev.contactTime === 'number') {
    return Math.max(ev.t, ev.contactTime);
  }
  if (ev.action === 'heavy_swing') {
    return ev.t + GAME_CONFIG.player.heavyAttack.windup;
  }
  if (ev.action === 'light_swing') {
    const stepIdx = Math.min(2, Math.max(0, ev.comboIndex));
    return ev.t + (GAME_CONFIG.player.lightAttack.windup[stepIdx] ?? 0.09);
  }
  if (ev.action === 'pulse_shot') {
    return ev.t + GAME_CONFIG.weapons.pulsecaster.lightShot.windup;
  }
  if (ev.action === 'pulse_charged_shot') {
    return ev.t + GAME_CONFIG.weapons.pulsecaster.heavyShot.windup;
  }
  if (ev.action === 'rail_shot') {
    return ev.t + GAME_CONFIG.weapons.phase_rail.lightShot.windup;
  }
  if (ev.action === 'rail_charged_shot') {
    return ev.t + GAME_CONFIG.weapons.phase_rail.heavyShot.windup;
  }
  if (ev.action === 'breaker_slam') {
    const stepIdx = Math.min(2, Math.max(0, ev.comboIndex));
    return ev.t + (GAME_CONFIG.weapons.grav_breaker.lightSlam.windup[stepIdx] ?? 0.16);
  }
  if (ev.action === 'breaker_charged_slam') {
    return ev.t + GAME_CONFIG.weapons.grav_breaker.heavySlam.windup;
  }
  return ev.t;
}

function evaluateDueEchoChoirNodes(
  world: WorldState,
  clip: EchoClip,
  limitTime: number
): void {
  const choir = world.choir;
  if (!choir || !choir.active || !world.boss || world.boss.hp <= 0) return;

  const strikeRange = GAME_CONFIG.choir.nodeStrikeRange;
  for (let i = 0; i < clip.events.length; i++) {
    const ev = clip.events[i];
    const isPulseAction =
      ev.action === 'pulse_shot' ||
      ev.action === 'pulse_charged_shot' ||
      ev.action === 'rail_shot' ||
      ev.action === 'rail_charged_shot';
    const isMeleeAction =
      ev.action === 'heavy_swing' ||
      ev.action === 'light_swing' ||
      ev.action === 'breaker_slam' ||
      ev.action === 'breaker_charged_slam';
    if (!isMeleeAction && !isPulseAction) {
      continue;
    }

    const contactTime = getEchoActionContactTime(clip, ev);
    const eventId = ev.id ?? `clip-${clip.id}-evt-${i}`;
    if (contactTime > clip.duration + 1e-6) {
      if (!choir.processedNodeEventIds.includes(eventId)) {
        choir.processedNodeEventIds.push(eventId);
      }
      continue;
    }
    if (contactTime > limitTime + 1e-6) continue;
    if (choir.processedNodeEventIds.includes(eventId)) continue;
    choir.processedNodeEventIds.push(eventId);

    const contactPose =
      clip.samples.length > 0 ? evaluateEchoClipAtTime(clip, contactTime) : null;
    const contactX = contactPose ? contactPose.x : ev.x;
    const contactZ = contactPose ? contactPose.z : ev.z;
    const contactYaw = contactPose ? contactPose.rotationY : ev.rotationY;

    const hasSingularityCoil =
      ev.action === 'breaker_charged_slam' &&
      (ev.equippedUpgradeId === 'breaker_singularity_coil' ||
        (ev.equippedUpgradeId === undefined &&
          getEquippedWeaponUpgrade(world, 'grav_breaker') === 'breaker_singularity_coil'));
    const meleeEnvelopeRange =
      ev.action === 'breaker_charged_slam'
        ? GAME_CONFIG.weapons.grav_breaker.heavySlam.range +
          (hasSingularityCoil
            ? GAME_CONFIG.weapons.upgrades.breaker_singularity_coil.heavyRangeBonus
            : 0)
        : ev.action === 'breaker_slam'
          ? GAME_CONFIG.weapons.grav_breaker.lightSlam.range
          : strikeRange;

    let closestNode: HarmonicNodeState | null = null;
    let bestDist = Infinity;
    for (let n = 0; n < choir.nodes.length; n++) {
      const node = choir.nodes[n];
      const dist = Math.hypot(contactX - node.x, contactZ - node.z);
      const effectiveNodeStrikeRange = Math.max(strikeRange, meleeEnvelopeRange + node.radius);
      if (dist <= effectiveNodeStrikeRange && dist < bestDist) {
        bestDist = dist;
        closestNode = node;
      } else if (
        isPulseAction &&
        dist <= GAME_CONFIG.weapons.phase_rail.lightShot.range &&
        dist < bestDist
      ) {
        const angleToNode = Math.atan2(node.x - contactX, node.z - contactZ);
        if (
          Math.abs(angleDiff(angleToNode, contactYaw)) <= Math.PI * 0.22 &&
          hasMeleeLineOfSight(contactX, contactZ, node.x, node.z, world.obstacles)
        ) {
          bestDist = dist;
          closestNode = node;
        }
      }
    }

    if (closestNode && closestNode.status === 'inactive') {
      closestNode.status = 'primed';
      closestNode.primedByEventId = eventId;
      closestNode.primedRemainingTime = GAME_CONFIG.choir.nodePrimeDuration;
      closestNode.failedRemainingTime = 0;
      if (choir.syncTimer <= 0) {
        choir.syncTimer = choir.syncWindowSeconds;
      }
      choir.statusMessage = `${closestNode.label} PRIMED BY ECHO · STRIKE A LINKED PYLON WITH LIVE SERA (${choir.syncTimer.toFixed(1)}s)`;
      world.events.push({
        type: 'choir_node_primed',
        x: closestNode.x,
        z: closestNode.z,
        echoAction: ev.action,
      });
    }
  }
}

function evaluateDueEchoResonanceContacts(
  world: WorldState,
  clip: EchoClip,
  limitTime: number
): void {
  const echo = world.echo;
  const res = world.resonance;

  for (let i = 0; i < clip.events.length; i++) {
    const ev = clip.events[i];
    if (
      ev.action !== 'heavy_swing' &&
      ev.action !== 'pulse_charged_shot' &&
      ev.action !== 'rail_charged_shot' &&
      ev.action !== 'breaker_charged_slam'
    ) {
      continue;
    }

    const contactTime = getEchoActionContactTime(clip, ev);
    const eventId = ev.id ?? `clip-${clip.id}-evt-${i}`;

    // If the clip ended before the attack reached its active contact phase, never manufacture a contact at clip end
    if (contactTime > clip.duration + 1e-6) {
      if (!echo.processedContactEventIds.includes(eventId)) {
        echo.processedContactEventIds.push(eventId);
      }
      continue;
    }

    if (contactTime > limitTime + 1e-6) continue;

    if (echo.processedContactEventIds.includes(eventId)) continue;
    echo.processedContactEventIds.push(eventId);

    // Determine exact Echo pose at the active contact timestamp
    const contactPose =
      clip.samples.length > 0 ? evaluateEchoClipAtTime(clip, contactTime) : null;
    const contactX = contactPose ? contactPose.x : ev.x;
    const contactZ = contactPose ? contactPose.z : ev.z;
    const contactYaw = contactPose ? contactPose.rotationY : ev.rotationY;

    // Only one Resonance target may be pending at a time; never refresh or extend a live mark
    if (res.activeMark !== null && res.activeMark.remainingTime > 0) {
      continue;
    }

    // Respect Convergence cooldown rules before creating a new Resonance opportunity
    if (res.cooldownTimer > 0) {
      res.lastOutcome = 'on_cooldown';
      res.status = 'on_cooldown';
      res.statusMessage = 'CONVERGENCE RECHARGING · WAIT FOR COOLDOWN';
      continue;
    }

    const query = queryEchoResonanceTarget(
      world,
      contactX,
      contactZ,
      contactYaw,
      ev.action === 'pulse_charged_shot' || ev.action === 'rail_charged_shot',
      ev.action,
      ev.equippedUpgradeId
    );
    if (!query.target) {
      res.lastOutcome =
        query.outcome === 'line_of_sight_blocked' ? 'line_of_sight_blocked' : 'out_of_range';
      if (query.outcome === 'line_of_sight_blocked') {
        res.statusMessage = 'ECHO RESONANCE BLOCKED BY OBSTACLE LINE OF SIGHT';
      }
      continue;
    }

    const target = query.target;
    res.markCounter += 1;
    res.primedCount += 1;
    const echoRigMods = getPlayerRigModifiers(world);
    const hasHarmonicEdge =
      ev.equippedUpgradeId === 'edge_harmonic_conductor' ||
      getEquippedWeaponUpgrade(world, 'chrono_edge') === 'edge_harmonic_conductor';
    const harmonicOverclock =
      hasHarmonicEdge &&
      isUpgradeOverclocked(
        'edge_harmonic_conductor',
        world.progression?.overclockedUpgrades
      )
        ? 0.5
        : 0;
    const syncWindow =
      GAME_CONFIG.resonance.syncWindow +
      echoRigMods.echoSyncWindowBonus +
      (hasHarmonicEdge
        ? GAME_CONFIG.weapons.upgrades.edge_harmonic_conductor.syncWindowBonus
        : 0) +
      harmonicOverclock;
    res.syncWindow = syncWindow;
    const mark: ResonanceMarkState = {
      markId: res.markCounter,
      enemyId: target.id,
      enemyName: target.name,
      clipId: clip.id,
      eventId,
      echoAction: ev.action,
      createdAt: world.elapsedTime,
      expiresAt: world.elapsedTime + syncWindow,
      duration: syncWindow,
      remainingTime: syncWindow,
      x: target.x,
      z: target.z,
    };

    res.activeMark = mark;
    res.status = 'primed';
    res.lastOutcome = 'primed';
    res.statusMessage = `RESONANCE PRIMED ON ${target.name.toUpperCase()} (${syncWindow.toFixed(1)}s) · STRIKE WITH HEAVY [E] OR FINISHER`;

    world.events.push({
      type: 'echo_resonance_primed',
      x: target.x,
      z: target.z,
      originX: contactX,
      originZ: contactZ,
      isHeavy: true,
      enemyId: target.id,
      echoAction: ev.action,
      resonanceOutcome: 'primed',
    });
  }
}

function advanceResonanceSystem(world: WorldState, dt: number): void {
  const res = world.resonance;
  res.cooldownTimer = Math.max(0, res.cooldownTimer - dt);
  res.flashTimer = Math.max(0, res.flashTimer - dt);

  if (res.activeMark) {
    const mark = res.activeMark;
    let targetEnemy: EnemyState | null = null;
    for (let i = 0; i < world.enemies.length; i++) {
      const e = world.enemies[i];
      if (e.id === mark.enemyId) {
        targetEnemy = e;
        break;
      }
    }

    const bossForMark =
      world.boss && world.boss.id === mark.enemyId ? world.boss : null;
    if (
      !targetEnemy ||
      targetEnemy.hp <= 0 ||
      targetEnemy.aiState === 'ko' ||
      (bossForMark !== null &&
        (bossForMark.aiState === 'phase_transition' ||
          bossForMark.aiState === 'ko' ||
          bossForMark.aiState === 'defeated'))
    ) {
      res.activeMark = null;
    } else {
      mark.x = targetEnemy.x;
      mark.z = targetEnemy.z;
      mark.remainingTime = Math.max(0, mark.expiresAt - world.elapsedTime);
      if (world.elapsedTime >= mark.expiresAt - 1e-6 || mark.remainingTime <= 1e-6) {
        world.events.push({
          type: 'echo_resonance_expired',
          x: targetEnemy.x,
          z: targetEnemy.z,
          enemyId: targetEnemy.id,
          resonanceOutcome: 'expired',
        });
        res.activeMark = null;
        res.lastOutcome = 'expired';
        res.statusMessage = 'RESONANCE WINDOW EXPIRED · REPLAY OR RECORD ECHO HEAVY [E]';
      }
    }
  }

  if (res.activeMark) {
    res.status = 'primed';
  } else if (res.cooldownTimer > 0) {
    res.status = 'on_cooldown';
  } else {
    res.status = 'idle';
  }
}

function advanceEchoSystem(world: WorldState, dt: number): void {
  const echo = world.echo;
  if ((echo.novaPulseCooldownTimer ?? 0) > 0) {
    echo.novaPulseCooldownTimer = Math.max(0, (echo.novaPulseCooldownTimer ?? 0) - dt);
  }

  if (echo.state === 'recording') {
    echo.recordingTime += dt;
    const lastSample = echo.recordingSamples[echo.recordingSamples.length - 1];
    if (
      (!lastSample ||
        echo.recordingTime - lastSample.t >= GAME_CONFIG.echo.sampleInterval - 1e-5) &&
      echo.recordingSamples.length < GAME_CONFIG.echo.maxSamples
    ) {
      echo.recordingSamples.push(
        capturePlayerEchoSample(
          world,
          world.player,
          Math.min(echo.maxDuration, echo.recordingTime)
        )
      );
    }

    if (echo.recordingTime >= echo.maxDuration - 1e-6) {
      echo.recordingTime = echo.maxDuration;
      finalizeEchoRecording(world, true);
    }
  } else if (echo.state === 'playback' && echo.clip && echo.activeActor) {
    const clip = echo.clip;
    echo.playbackTime += dt;

    // Emit recorded visual action events whose relative windup timestamp was reached
    const limitTime = Math.min(clip.duration, echo.playbackTime);
    while (
      echo.nextEventIndex < clip.events.length &&
      clip.events[echo.nextEventIndex].t <= limitTime + 1e-6
    ) {
      const ev = clip.events[echo.nextEventIndex];
      echo.nextEventIndex += 1;
      if (echo.activeActor && ev.weaponId) {
        echo.activeActor.weaponId = ev.weaponId;
      }
      if (echo.activeActor && ev.equippedUpgradeId !== undefined) {
        echo.activeActor.equippedUpgradeId = ev.equippedUpgradeId;
      }
      world.events.push({
        type: 'echo_action_visual',
        x: ev.x,
        z: ev.z,
        isHeavy:
          ev.action === 'heavy_swing' ||
          ev.action === 'pulse_charged_shot' ||
          ev.action === 'rail_charged_shot' ||
          ev.action === 'breaker_charged_slam',
        echoAction: ev.action,
        weaponId: ev.weaponId,
        upgradeId: ev.equippedUpgradeId ?? null,
      });
      spawnEchoPulsecasterProjectile(world, clip.id, ev);
      evaluateEchoActionOnPuzzle(world, ev);
    }

    // Evaluate non-damaging Echo Heavy Resonance contacts at their actual active contact phase
    evaluateDueEchoResonanceContacts(world, clip, limitTime);
    evaluateDueEchoChoirNodes(world, clip, limitTime);

    if (echo.playbackTime >= clip.duration - 1e-6) {
      const endPose = evaluateEchoClipAtTime(clip, clip.duration);
      echo.playbackTime = clip.duration;
      echo.state = 'finished';
      echo.activeActor = null;
      echo.statusMessage = 'ECHO REPLAY COMPLETED · PRESS [Y] TO REPLAY OR [T] TO RECORD';
      world.events.push({
        type: 'echo_playback_completed',
        x: endPose.x,
        z: endPose.z,
      });
    } else {
      const pose = evaluateEchoClipAtTime(clip, echo.playbackTime);
      echo.activeActor.x = pose.x;
      echo.activeActor.z = pose.z;
      echo.activeActor.rotationY = pose.rotationY;
      echo.activeActor.actionState = pose.actionState;
      echo.activeActor.gaitPhase = pose.gaitPhase;
      echo.activeActor.comboIndex = pose.comboIndex;
      echo.activeActor.chargeRatio = pose.chargeRatio;
      echo.activeActor.isEmpoweredHeavy = pose.isEmpoweredHeavy;
      echo.activeActor.weaponId = pose.weaponId ?? echo.activeActor.weaponId ?? 'chrono_edge';
      echo.activeActor.equippedUpgradeId =
        pose.equippedUpgradeId ?? echo.activeActor.equippedUpgradeId ?? null;
      echo.activeActor.elapsed = echo.playbackTime;
    }
  }
}

function evaluateSinglePressurePlate(
  world: WorldState,
  plate: PressurePlateState,
  syncBarrierObstacle: boolean
): void {
  const echoActor =
    world.appState === 'playing' &&
    world.outcome === 'none' &&
    world.echo.state === 'playback'
      ? world.echo.activeActor
      : null;

  let nextActive = false;
  let nextInteractorId: string | null = null;

  if (
    plate.interactionPolicy === 'echo_only' ||
    plate.interactionPolicy === 'player_or_echo'
  ) {
    if (echoActor) {
      const dist = Math.hypot(echoActor.x - plate.x, echoActor.z - plate.z);
      if (dist <= plate.radius) {
        nextActive = true;
        nextInteractorId = echoActor.id;
      }
    }
  }

  if (
    !nextActive &&
    (plate.interactionPolicy === 'player_only' ||
      plate.interactionPolicy === 'player_or_echo')
  ) {
    if (world.player.actionState !== 'dead') {
      const dist = Math.hypot(world.player.x - plate.x, world.player.z - plate.z);
      if (dist <= plate.radius) {
        nextActive = true;
        nextInteractorId = 'player';
      }
    }
  }

  const wasActive = plate.active;
  plate.active = nextActive;
  plate.interactorId = nextInteractorId;

  if (syncBarrierObstacle) {
    plate.barrierOpen = nextActive;
    for (let i = 0; i < world.obstacles.length; i++) {
      const obs = world.obstacles[i];
      if (obs.id === plate.receiverId) {
        obs.disabled = plate.barrierOpen;
      }
    }
  }

  if (!wasActive && nextActive) {
    plate.activationCount += 1;
    world.echo.statusMessage = 'CHRONO ANCHOR SYNCED · CONTAINMENT BARRIER OPEN';
    world.events.push({
      type: 'echo_plate_activated',
      x: plate.x,
      z: plate.z,
    });
  } else if (wasActive && !nextActive) {
    if (world.echo.state === 'playback') {
      world.echo.statusMessage = `ECHO REPLAYING (${(world.echo.clip?.duration ?? 0).toFixed(1)}s)...`;
    }
    world.events.push({
      type: 'echo_plate_released',
      x: plate.x,
      z: plate.z,
    });
  }
}

function updatePressurePlate(world: WorldState, dt = 0): void {
  if (world.expedition?.enabled && world.expedition.phase === 'safe_room') {
    return;
  }
  const plate = world.pressurePlate;
  evaluateSinglePressurePlate(world, plate, true);

  const puzzle = world.puzzle;
  if (!puzzle) return;

  puzzle.teachPlate = plate;

  // Tick Heavy Receiver charge timer when advancing simulation time
  const receiver = puzzle.heavyReceiver;
  if (dt > 0 && receiver.charged) {
    receiver.chargeTimer = Math.max(0, receiver.chargeTimer - dt);
    if (receiver.chargeTimer <= 0) {
      receiver.charged = false;
      world.events.push({
        type: 'echo_receiver_expired',
        x: receiver.targetX,
        z: receiver.targetZ,
      });
    }
  }

  // Evaluate Stage 3 Combine Pressure Plate (Chrono Anchor Pad 02)
  evaluateSinglePressurePlate(world, puzzle.combinePlate, false);

  // Stage 3 Final Combine Barrier requires BOTH:
  // 1) Heavy Receiver is charged (by a valid Echo heavy action)
  // 2) An Echo is currently occupying Chrono Anchor Pad 02 (puzzle.combinePlate)
  const nextFinalOpen =
    world.appState === 'playing' &&
    world.outcome === 'none' &&
    receiver.charged &&
    puzzle.combinePlate.active;

  const wasFinalOpen = puzzle.finalBarrier.open;
  puzzle.finalBarrier.open = nextFinalOpen;
  puzzle.combinePlate.barrierOpen = nextFinalOpen;

  for (let i = 0; i < world.obstacles.length; i++) {
    const obs = world.obstacles[i];
    if (obs.id === puzzle.finalBarrier.id) {
      obs.disabled = nextFinalOpen;
    }
  }

  if (!wasFinalOpen && nextFinalOpen) {
    world.echo.statusMessage =
      'DUAL RESONANCE LOCKED · ARCHIVE CALIBRATION BARRIER OPEN';
    world.events.push({
      type: 'echo_combine_barrier_opened',
      x: puzzle.finalBarrier.x,
      z: puzzle.finalBarrier.z,
    });
  } else if (wasFinalOpen && !nextFinalOpen) {
    world.events.push({
      type: 'echo_combine_barrier_closed',
      x: puzzle.finalBarrier.x,
      z: puzzle.finalBarrier.z,
    });
  }

  // Track Stage 1 (TEACH) completion when live Sera crosses West through the open Stage 1 barrier
  const p = world.player;
  if (
    !puzzle.teachCompleted &&
    plate.barrierOpen &&
    p.x <= plate.receiverX - plate.receiverRadius - GAME_CONFIG.player.radius + 0.35 &&
    Math.abs(p.z - plate.receiverZ) <= 2.4
  ) {
    puzzle.teachCompleted = true;
    grantProgressionReward(world, 'prologue_calibration_teach');
  }

  // Track Stage 3 (COMBINE) completion when live Sera crosses West through the open Final Combine Barrier
  const fb = puzzle.finalBarrier;
  const crossedFinalBarrier =
    fb.open &&
    ((p.x <= fb.x - fb.radius - GAME_CONFIG.player.radius + 0.25 &&
      Math.abs(p.z - fb.z) <= 2.4) ||
      Math.hypot(p.x - fb.completionX, p.z - fb.completionZ) <= fb.completionRadius);

  if (!puzzle.combineCompleted && crossedFinalBarrier) {
    puzzle.teachCompleted = true;
    puzzle.testCompleted = true;
    puzzle.combineCompleted = true;
    puzzle.completed = true;
    p.flux = p.maxFlux;
    grantProgressionReward(world, 'prologue_calibration_teach');
    grantProgressionReward(world, 'prologue_calibration_test');
    grantProgressionReward(world, 'prologue_calibration_combine');
    world.echo.statusMessage =
      'CALIBRATION SEQUENCE COMPLETE · CHRONO RIG SYNCHRONIZED (+100 FLUX)';
    world.events.push({
      type: 'echo_puzzle_completed',
      x: p.x,
      z: p.z,
    });
  }

  // Update active guidance stage
  if (puzzle.completed) {
    puzzle.stage = 'completed';
  } else if (puzzle.testCompleted || receiver.charged) {
    puzzle.stage = 'combine';
  } else if (puzzle.teachCompleted) {
    puzzle.stage = 'test';
  } else {
    puzzle.stage = 'teach';
  }
}

function findNearestEnemyAngle(
  player: PlayerState,
  enemies: EnemyState[],
  referenceAngle: number,
  maxAssistRange = 4.6,
  maxConeRadians = Math.PI * 0.32
): number | null {
  let bestDistSq = maxAssistRange * maxAssistRange;
  let bestAngle: number | null = null;

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    if (enemy.aiState === 'ko' || enemy.hp <= 0) continue;
    const dx = enemy.x - player.x;
    const dz = enemy.z - player.z;
    const distSq = dx * dx + dz * dz;
    if (distSq < bestDistSq) {
      const angleToEnemy = Math.atan2(dx, dz);
      // Only soft-assist if within cone of intended attack direction
      if (Math.abs(angleDiff(angleToEnemy, referenceAngle)) <= maxConeRadians) {
        bestDistSq = distSq;
        bestAngle = angleToEnemy;
      }
    }
  }
  return bestAngle;
}

/**
 * Computes camera-yaw-relative horizontal movement vector.
 * Pitch (aimPitch) is intentionally ignored so looking up/down never affects horizontal speed or plane.
 * Diagonal inputs are normalized so diagonal travel is never faster than cardinal travel.
 */
export function computeMovementWorldVector(
  input: PlayerInputFrame,
  out: { dirX: number; dirZ: number; length: number } = { dirX: 0, dirZ: 0, length: 0 }
): { dirX: number; dirZ: number; length: number } {
  const rawLen = Math.hypot(input.moveX, input.moveZ);
  if (rawLen < 0.001) {
    out.dirX = 0;
    out.dirZ = 0;
    out.length = 0;
    return out;
  }
  const nx = input.moveX / rawLen;
  const nz = input.moveZ / rawLen;

  // Camera looks horizontally along aimYaw: Forward = (sin(aimYaw), cos(aimYaw)), Right = (-cos(aimYaw), sin(aimYaw))
  const forwardX = Math.sin(input.aimYaw);
  const forwardZ = Math.cos(input.aimYaw);
  const rightX = -forwardZ;
  const rightZ = forwardX;

  const forwardAmount = -nz;
  const rightAmount = nx;

  const worldX = forwardX * forwardAmount + rightX * rightAmount;
  const worldZ = forwardZ * forwardAmount + rightZ * rightAmount;
  const len = Math.hypot(worldX, worldZ) || 1;

  out.dirX = worldX / len;
  out.dirZ = worldZ / len;
  out.length = Math.min(1, rawLen);
  return out;
}

function resolveCombatAimAngle(
  world: WorldState,
  input: PlayerInputFrame,
  moveVec: { dirX: number; dirZ: number; length: number },
  assistRange: number
): number {
  const p = world.player;
  const lockedTarget = resolveActiveLockOnTarget(world, p.lockOnTargetId);
  if (lockedTarget) {
    return Math.atan2(lockedTarget.x - p.x, lockedTarget.z - p.z);
  }

  let baseAngle: number;

  if (moveVec.length > 0.1) {
    baseAngle = Math.atan2(moveVec.dirX, moveVec.dirZ);
  } else if (typeof input.aimWorldX === 'number' && typeof input.aimWorldZ === 'number') {
    baseAngle = Math.atan2(input.aimWorldX - p.x, input.aimWorldZ - p.z);
  } else {
    baseAngle = wrapAngle(input.aimYaw);
  }

  const assistAngle = findNearestEnemyAngle(p, world.enemies, baseAngle, assistRange);
  if (assistAngle !== null) {
    return moveAngleTowards(baseAngle, assistAngle, 0.48);
  }
  return baseAngle;
}

function startLightAttack(
  world: WorldState,
  input: PlayerInputFrame,
  moveVec: { dirX: number; dirZ: number; length: number }
): void {
  const p = world.player;
  const isBreaker = p.equippedWeaponId === 'grav_breaker';
  const isScythe = p.equippedWeaponId === 'chrono_scythe';
  const cfg = GAME_CONFIG.player.lightAttack;

  if (p.comboWindowTimer > 0 && p.comboIndex < 2) {
    p.comboIndex += 1;
  } else {
    p.comboIndex = 0;
  }
  p.comboWindowTimer = 0;

  p.rotationY = resolveCombatAimAngle(world, input, moveVec, isScythe ? 5.2 : 4.6);

  const flow = consumeAttackFlowMultipliers(p);
  const baseWindup = isBreaker
    ? (GAME_CONFIG.weapons.grav_breaker.lightSlam.windup[p.comboIndex] ?? 0.16)
    : isScythe
      ? (GAME_CONFIG.weapons.chrono_scythe.lightSweep.windup[p.comboIndex] ?? 0.12)
      : (cfg.windup[p.comboIndex] ?? 0.09);
  p.actionState = 'light_windup';
  p.stateTimer = Math.max(0.035, baseWindup * flow.windupMult);
  p.attackHitIds = [];
  p.currentAttackStartedAt = world.elapsedTime;
  p.currentAttackMarkId = world.resonance.activeMark?.markId ?? null;
  p.squashX = isBreaker ? 0.86 : isScythe ? 0.92 : 0.9;
  p.squashY = isBreaker ? 1.14 : isScythe ? 1.08 : 1.1;

  if (flow.triggeredRiposte) {
    world.events.push({
      type: 'player_riposte_strike',
      x: p.x,
      z: p.z,
      weaponId: p.equippedWeaponId,
      flowKind: flow.flowKind,
    });
  }

  recordEchoActionEvent(world, isBreaker ? 'breaker_slam' : 'light_swing');
}

const _scratchExecPos = { x: 0, z: 0, radius: GAME_CONFIG.player.radius };

function performChronoExecutionFinisher(
  world: WorldState,
  candidate: ExecutionCandidate
): boolean {
  const p = world.player;
  let enemy: EnemyState | undefined;
  for (let i = 0; i < world.enemies.length; i++) {
    if (world.enemies[i].id === candidate.id) {
      enemy = world.enemies[i];
      break;
    }
  }
  if (!enemy || enemy.hp <= 0 || enemy.aiState === 'ko') {
    return false;
  }

  const bossState = world.boss && world.boss.id === enemy.id ? world.boss : null;
  const startX = p.x;
  const startZ = p.z;
  const execYaw = Math.atan2(enemy.x - p.x, enemy.z - p.z);

  clearActiveStrikeFlow(p);
  p.rotationY = execYaw;
  p.chargeTime = 0;
  p.comboWindowTimer = 0;
  p.vx = 0;
  p.vz = 0;
  p.attackHitIds = [enemy.id];

  // Motion-warped lunge to optimal close-execution stance outside target hull
  const fromTargetX = p.x - enemy.x;
  const fromTargetZ = p.z - enemy.z;
  const fromLen = Math.hypot(fromTargetX, fromTargetZ);
  const standDist = enemy.radius + GAME_CONFIG.player.radius + 0.52;
  if (fromLen > standDist && fromLen > 0.001) {
    _scratchExecPos.x = enemy.x + (fromTargetX / fromLen) * standDist;
    _scratchExecPos.z = enemy.z + (fromTargetZ / fromLen) * standDist;
  } else {
    _scratchExecPos.x = p.x;
    _scratchExecPos.z = p.z;
  }
  _scratchExecPos.radius = GAME_CONFIG.player.radius;
  resolveCircleObstacleCollisions(
    _scratchExecPos,
    world.obstacles,
    GAME_CONFIG.arena.radius,
    getArenaSolidPropColliders(world.run?.chapter ?? 'prologue')
  );
  p.x = _scratchExecPos.x;
  p.z = _scratchExecPos.z;

  p.actionState = 'heavy_recovery';
  p.stateTimer = CHRONO_EXECUTION_CONFIG.recoveryDuration;
  p.invulnTimer = Math.max(
    p.invulnTimer,
    CHRONO_EXECUTION_CONFIG.recoveryDuration + 0.14
  );
  p.squashX = 1.28;
  p.squashY = 0.76;

  // Armor-bypassing execution burst
  const execRigMods = getPlayerRigModifiers(world);
  const baseHeavyDmg = GAME_CONFIG.player.heavyAttack.baseDamage;
  const rawExecDamage = bossState
    ? Math.max(
        Math.round(baseHeavyDmg * 2.4),
        Math.round(bossState.maxHp * CHRONO_EXECUTION_CONFIG.bossPercentHpBurst)
      )
    : Math.round(baseHeavyDmg * CHRONO_EXECUTION_CONFIG.mobDamageMult);
  const execDamage = Math.round(rawExecDamage * execRigMods.executionDamageMult);

  enemy.hp = Math.max(0, enemy.hp - execDamage);
  enemy.hitFlashTimer = 0.28;
  world.stats.damageDealt += execDamage;
  world.stats.vulnerableHits += 1;

  if (bossState) {
    bossState.hp = enemy.hp;
    bossState.hitFlashTimer = 0.28;
  }

  // Reward Flux, Integrity, Adrenaline, and cinematic impact feel
  p.flux = Math.min(
    p.maxFlux,
    p.flux + CHRONO_EXECUTION_CONFIG.fluxGain + execRigMods.executionFluxRefund
  );
  p.integrity = Math.min(
    p.maxIntegrity,
    p.integrity + CHRONO_EXECUTION_CONFIG.integrityHeal + execRigMods.executionIntegrityHeal
  );
  p.ghostIntegrity = Math.max(p.ghostIntegrity, p.integrity);
  const execAdr = applyAdrenalineDelta(p, CHRONO_EXECUTION_CONFIG.adrenalineGain);
  if (execAdr.tierDelta !== 0) {
    world.events.push({
      type: 'adrenaline_tier_changed',
      x: p.x,
      z: p.z,
      amount: execAdr.nextTier,
      postureBonus: execAdr.tierDelta,
    });
  }

  world.hitstopTimer = Math.max(world.hitstopTimer, CHRONO_EXECUTION_CONFIG.hitstopSeconds);
  world.cameraTrauma = Math.min(1, world.cameraTrauma + CHRONO_EXECUTION_CONFIG.trauma);

  world.events.push({
    type: 'chrono_execution_finisher',
    x: enemy.x,
    z: enemy.z,
    originX: startX,
    originZ: startZ,
    amount: execDamage,
    isHeavy: true,
    isCriticalOrVulnerable: true,
    enemyId: enemy.id,
    weaponId: p.equippedWeaponId,
  });

  if (enemy.hp <= 0) {
    handleEnemyZeroHpDefeat(world, enemy, execDamage, true, true, false);
  } else if (bossState) {
    bossState.stagger = 0;
    bossState.coreExposed = false;
    bossState.aiState = 'recovery';
    bossState.stateDuration = 0.55;
    bossState.stateTimer = 0.55;
    bossState.statusLabel = 'RECOVERY · CHRONO CORE SEALED';
    enemy.stagger = 0;
    enemy.aiState = 'recovery';
    enemy.stateDuration = 0.55;
    enemy.stateTimer = 0.55;
    checkAndTriggerBossPhase2(world, bossState, enemy);
  } else {
    enemy.stagger = 0;
    enemy.aiState = 'recovery';
    enemy.stateDuration = 0.5;
    enemy.stateTimer = 0.5;
  }

  return true;
}

function startHeavyWindup(
  world: WorldState,
  input: PlayerInputFrame,
  moveVec: { dirX: number; dirZ: number; length: number }
): void {
  const p = world.player;
  const isBreaker = p.equippedWeaponId === 'grav_breaker';
  const isScythe = p.equippedWeaponId === 'chrono_scythe';
  const cfg = isBreaker
    ? GAME_CONFIG.weapons.grav_breaker.heavySlam
    : isScythe
      ? GAME_CONFIG.weapons.chrono_scythe.heavyVortex
      : GAME_CONFIG.player.heavyAttack;

  if (p.actionState !== 'charging_heavy') {
    p.currentAttackStartedAt = world.elapsedTime;
    p.currentAttackMarkId = world.resonance.activeMark?.markId ?? null;
  }

  p.rotationY = resolveCombatAimAngle(world, input, moveVec, isScythe ? 5.8 : 5.2);

  // When a Resonance mark is active, reserve Flux for Convergence impact rather than spending upfront
  const hasActiveResonanceMark =
    world.resonance.activeMark !== null && world.resonance.cooldownTimer <= 0;
  const edgeUpgrade = getEquippedWeaponUpgrade(world, 'chrono_edge');
  const breakerUpgrade = getEquippedWeaponUpgrade(world, 'grav_breaker');
  const scytheUpgrade = getEquippedWeaponUpgrade(world, 'chrono_scythe');
  const koHeavyMods = getActiveWeaponOverchargeModifiers(
    world.kineticOvercharge,
    p.equippedWeaponId
  );
  const empowerFluxCost = isBreaker
    ? GAME_CONFIG.weapons.grav_breaker.heavySlam.fluxCostForEmpower +
      (breakerUpgrade === 'breaker_singularity_coil'
        ? GAME_CONFIG.weapons.upgrades.breaker_singularity_coil.empoweredFluxCostDelta
        : 0)
    : isScythe
      ? Math.max(
          10,
          GAME_CONFIG.weapons.chrono_scythe.heavyVortex.fluxCostForEmpower +
            (scytheUpgrade === 'scythe_astral_siphon'
              ? GAME_CONFIG.weapons.upgrades.scythe_astral_siphon.empoweredFluxCostDelta
              : 0)
        )
      : GAME_CONFIG.player.heavyAttack.fluxCostForEmpower +
        (edgeUpgrade === 'edge_harmonic_conductor'
          ? GAME_CONFIG.weapons.upgrades.edge_harmonic_conductor.empoweredFluxCostDelta
          : 0);
  p.isEmpoweredHeavy = !hasActiveResonanceMark && p.flux >= empowerFluxCost;
  if (p.isEmpoweredHeavy) {
    p.flux = Math.max(0, p.flux - empowerFluxCost);
  }

  const flow = consumeAttackFlowMultipliers(p);
  p.actionState = 'heavy_windup';
  p.stateTimer = Math.max(
    0.04,
    (cfg.windup * flow.windupMult) / Math.max(1, koHeavyMods.attackSpeedMult)
  );
  p.chargeTime = 0;
  p.comboWindowTimer = 0;
  p.attackHitIds = [];
  p.squashX = isBreaker ? 0.8 : 0.84;
  p.squashY = isBreaker ? 1.22 : 1.18;

  if (flow.triggeredRiposte) {
    world.events.push({
      type: 'player_riposte_strike',
      x: p.x,
      z: p.z,
      isHeavy: true,
      weaponId: p.equippedWeaponId,
      flowKind: flow.flowKind,
    });
  }

  recordEchoActionEvent(world, isBreaker ? 'breaker_charged_slam' : 'heavy_swing');

  // If live Sera performs a Heavy Attack at the Echo-only Heavy Receiver while NOT recording,
  // reject live activation explicitly and guide the player to record & replay with an Echo.
  const receiver = world.puzzle?.heavyReceiver;
  if (receiver && receiver.interactionPolicy === 'echo_only') {
    const distToReceiver = Math.hypot(p.x - receiver.x, p.z - receiver.z);
    if (distToReceiver <= receiver.radius) {
      if (world.echo.state === 'recording') {
        world.echo.statusMessage =
          'HEAVY STRIKE RECORDED · HOLD ANCHOR PAD OR PRESS [Y] TO REPLAY';
      } else {
        receiver.lastAttemptOutcome = 'wrong_actor';
        world.echo.statusMessage =
          'ECHO RESONANCE ONLY · RECORD [T] HEAVY [E] & REPLAY [Y]';
        world.events.push({
          type: 'echo_receiver_rejected',
          x: p.x,
          z: p.z,
          isHeavy: true,
        });
      }
    }
  }
}

function startDodge(
  world: WorldState,
  moveVec: { dirX: number; dirZ: number; length: number }
): void {
  const p = world.player;
  const cfg = GAME_CONFIG.player.dodge;
  clearActiveStrikeFlow(p);
  if (moveVec.length > 0.1) {
    p.rotationY = Math.atan2(moveVec.dirX, moveVec.dirZ);
  }
  p.actionState = 'dodging';
  p.stateTimer = cfg.duration;
  p.invulnTimer = Math.max(p.invulnTimer, cfg.invulnDuration);
  const rigMods = getPlayerRigModifiers(world);
  p.dodgeCounterTriggered = false;
  p.dodgeCooldownTimer = Math.max(0.15, cfg.cooldown + rigMods.dodgeCooldownDelta);
  p.chargeTime = 0;
  p.squashX = 1.22;
  p.squashY = 0.8;
  world.events.push({
    type: 'player_dodge',
    x: p.x,
    z: p.z,
  });

  recordEchoActionEvent(world, 'dodge');
}

function startParry(
  world: WorldState,
  input: PlayerInputFrame,
  moveVec: { dirX: number; dirZ: number; length: number }
): void {
  const p = world.player;
  const cfg = GAME_CONFIG.player.parry;
  clearActiveStrikeFlow(p);
  p.rotationY = resolveCombatAimAngle(world, input, moveVec, 4.5);
  p.actionState = 'parry_active';
  p.stateTimer = cfg.activeWindow;
  p.parryCooldownTimer = cfg.cooldown;
  p.chargeTime = 0;
  world.events.push({
    type: 'player_parry_start',
    x: p.x,
    z: p.z,
  });

  recordEchoActionEvent(world, 'parry');
}

function resolvePulsecasterAimAngle(
  world: WorldState,
  input: PlayerInputFrame,
  moveVec: { dirX: number; dirZ: number; length: number }
): number {
  const p = world.player;
  const lockedTarget = resolveActiveLockOnTarget(world, p.lockOnTargetId);
  if (lockedTarget) {
    return Math.atan2(lockedTarget.x - p.x, lockedTarget.z - p.z);
  }
  const isRail = p.equippedWeaponId === 'phase_rail';
  const rangedCfg = isRail
    ? GAME_CONFIG.weapons.phase_rail
    : GAME_CONFIG.weapons.pulsecaster;
  let baseAngle: number;

  if (typeof input.aimWorldX === 'number' && typeof input.aimWorldZ === 'number') {
    baseAngle = Math.atan2(input.aimWorldX - p.x, input.aimWorldZ - p.z);
  } else if (Math.abs(input.aimYaw) > 1e-5) {
    baseAngle = wrapAngle(input.aimYaw);
  } else if (moveVec.length > 0.1) {
    baseAngle = Math.atan2(moveVec.dirX, moveVec.dirZ);
  } else {
    baseAngle = p.rotationY;
  }

  const assistAngle = findNearestEnemyAngle(
    p,
    world.enemies,
    baseAngle,
    rangedCfg.aimAssistMaxRange,
    rangedCfg.aimAssistConeRadians
  );
  if (assistAngle !== null) {
    return moveAngleTowards(baseAngle, assistAngle, 0.42);
  }
  return baseAngle;
}

export function switchPlayerWeapon(world: WorldState, targetWeaponId?: WeaponId): boolean {
  if (world.appState !== 'playing' || world.outcome !== 'none') {
    return false;
  }
  if (world.run.chapter === 'chapter_5_loom' && world.run.stage === 'chronicle_loom') {
    return false;
  }
  const p = world.player;
  if (p.actionState === 'dead') {
    return false;
  }
  if (targetWeaponId !== undefined && !isValidWeaponId(targetWeaponId)) {
    return false;
  }

  const unlockedList = getUnlockedWeaponIds(world);
  if (targetWeaponId !== undefined && !unlockedList.includes(targetWeaponId)) {
    return false;
  }

  const baseCycleList = normalizeUnlockedWeaponIds(world.progression?.unlockedWeaponIds);
  const cycleList = baseCycleList.includes(p.equippedWeaponId)
    ? baseCycleList
    : unlockedList;
  let nextWeaponId: WeaponId;
  if (targetWeaponId !== undefined) {
    nextWeaponId = targetWeaponId;
  } else if (cycleList.length <= 1) {
    nextWeaponId = cycleList[0] ?? 'chrono_edge';
  } else {
    const curIdx = cycleList.indexOf(p.equippedWeaponId);
    nextWeaponId =
      curIdx >= 0
        ? cycleList[(curIdx + 1) % cycleList.length]
        : cycleList[0];
  }

  if (nextWeaponId === p.equippedWeaponId) {
    return false;
  }
  if (p.weaponSwitchCooldownTimer > 0) {
    return false;
  }

  // Block weapon switch during committed active/windup/dodge/parry frames so switching cannot cancel or duplicate active attacks
  const isCommittedAction =
    p.actionState === 'light_windup' ||
    p.actionState === 'light_active' ||
    p.actionState === 'heavy_windup' ||
    p.actionState === 'heavy_active' ||
    p.actionState === 'dodging' ||
    p.actionState === 'parry_active';

  if (isCommittedAction) {
    return false;
  }

  const prevIsRanged =
    p.equippedWeaponId === 'pulsecaster' || p.equippedWeaponId === 'phase_rail';
  const canFlowCancelSwitch = canCancelActionTailForCombatFlow(
    p,
    prevIsRanged,
    'weapon_switch'
  );

  // If switching while charging a heavy attack or at the trailing edge of heavy/parry recovery, snap cleanly to idle
  if (p.actionState === 'charging_heavy' || canFlowCancelSwitch) {
    p.actionState = 'idle';
    p.stateTimer = 0;
  }

  // Clear stale buffered attacks, residual charge state, empowered heavy flag, or melee combo chain state while preserving ordinary recovery timers
  clearActiveStrikeFlow(p);
  p.chargeTime = 0;
  p.isEmpoweredHeavy = false;
  p.bufferedAction = 'none';
  p.bufferTimer = 0;
  p.bufferedWeaponSwitch = null;
  p.weaponSwitchBufferTimer = 0;
  p.comboWindowTimer = 0;
  p.comboIndex = 0;
  const prevWeaponId = p.equippedWeaponId;
  p.equippedWeaponId = nextWeaponId;
  p.weaponSwitchCooldownTimer = getWeaponDefinition(nextWeaponId).switchCooldown;
  grantQuickDrawWindow(p);

  world.events.push({
    type: 'weapon_switched',
    x: p.x,
    z: p.z,
    weaponId: nextWeaponId,
  });

  // v2.6.0 Chrono Singularity: Mid-combo Flash Swap recovery cancel & amp
  const sing = ensureSingularityState(world);
  const swapRes = tryTriggerFlashSwap(sing);
  if (swapRes.triggered) {
    if (
      p.actionState === 'light_recovery' ||
      p.actionState === 'heavy_recovery' ||
      p.actionState === 'parry_recovery'
    ) {
      p.actionState = 'idle';
      p.stateTimer = 0;
    }
    p.flux = Math.min(p.maxFlux, p.flux + swapRes.bonusFlux);
    const asc = ensureAscensionState(world);
    recordStyleAction(asc.style, 'flash_swap', swapRes.bonusStyle, 'FLASH SWAP');
    world.events.push({
      type: 'flash_swap_triggered',
      x: p.x,
      z: p.z,
      weaponId: nextWeaponId,
      amount: swapRes.bonusFlux,
    });

    // v3.1.0 Chrono Resonance Forge: Dual-Weapon Flash Swap Synergy Pairing
    const resSpec = triggerWeaponSwapResonance(
      ensureWeaponResonanceState(world),
      prevWeaponId,
      nextWeaponId
    );
    if (resSpec) {
      if (resSpec.fluxBurst > 0) {
        p.flux = Math.min(p.maxFlux, p.flux + resSpec.fluxBurst);
      }
      if (resSpec.heatVentAmount > 0) {
        p.weaponHeat = Math.max(0, p.weaponHeat - resSpec.heatVentAmount);
        if (p.weaponHeat < p.maxWeaponHeat * 0.5) {
          p.weaponOverheated = false;
          p.weaponOverheatTimer = 0;
        }
      }
      if (resSpec.shockwaveRadius > 0) {
        for (let si = 0; si < world.enemies.length; si++) {
          const se = world.enemies[si];
          if (se.hp <= 0 || se.aiState === 'ko') continue;
          const dx = p.x - se.x;
          const dz = p.z - se.z;
          const dist = Math.hypot(dx, dz);
          if (dist <= resSpec.shockwaveRadius + se.radius) {
            se.stagger = Math.min(se.maxStagger, se.stagger + resSpec.shockwaveStagger);
            if (dist > 1.2) {
              const pull = Math.min(1.15, dist - 1.1);
              se.x += (dx / dist) * pull;
              se.z += (dz / dist) * pull;
            }
            if (world.boss && world.boss.id === se.id) {
              world.boss.stagger = Math.min(
                world.boss.maxStagger,
                world.boss.stagger + resSpec.shockwaveStagger
              );
            }
          }
        }
      }
      world.events.push({
        type: 'weapon_swap_resonance',
        x: p.x,
        z: p.z,
        weaponId: nextWeaponId,
        amount: resSpec.accentHex,
      });
    }
  }

  return true;
}

/**
 * Selects or cycles the active weapon from the Upgrade Bench ([U] Paused / Victory Intermission),
 * Title Screen Arsenal, or live HUD slot click (buffering the switch if mid-swing/dodge during combat).
 */
export function equipBenchWeapon(world: WorldState, targetWeaponId?: WeaponId): boolean {
  if (!world || !world.player) return false;
  if (world.outcome === 'defeat' || world.player.actionState === 'dead') {
    return false;
  }
  if (world.run?.chapter === 'chapter_5_loom' && world.run?.stage === 'chronicle_loom') {
    return false;
  }
  if (targetWeaponId !== undefined && !isValidWeaponId(targetWeaponId)) {
    return false;
  }

  const unlockedList = getUnlockedWeaponIds(world);
  if (targetWeaponId !== undefined && !unlockedList.includes(targetWeaponId)) {
    return false;
  }

  const p = world.player;
  const baseCycleList = normalizeUnlockedWeaponIds(world.progression?.unlockedWeaponIds);
  const cycleList = baseCycleList.includes(p.equippedWeaponId)
    ? baseCycleList
    : unlockedList;
  let nextWeaponId: WeaponId;
  if (targetWeaponId !== undefined) {
    nextWeaponId = targetWeaponId;
  } else if (cycleList.length <= 1) {
    nextWeaponId = cycleList[0] ?? 'chrono_edge';
  } else {
    const curIdx = cycleList.indexOf(p.equippedWeaponId);
    nextWeaponId =
      curIdx >= 0
        ? cycleList[(curIdx + 1) % cycleList.length]
        : cycleList[0];
  }

  if (nextWeaponId === p.equippedWeaponId) {
    p.bufferedWeaponSwitch = null;
    p.weaponSwitchBufferTimer = 0;
    return false;
  }

  if (world.appState === 'playing' && world.outcome === 'none') {
    if (switchPlayerWeapon(world, nextWeaponId)) {
      return true;
    }
    // Buffer the requested weapon switch so it executes immediately after the current swing/dodge/cooldown
    p.bufferedWeaponSwitch = nextWeaponId;
    p.weaponSwitchBufferTimer = 0.35;
    return false;
  }

  p.chargeTime = 0;
  p.isEmpoweredHeavy = false;
  p.bufferedAction = 'none';
  p.bufferTimer = 0;
  p.bufferedWeaponSwitch = null;
  p.weaponSwitchBufferTimer = 0;
  p.comboWindowTimer = 0;
  p.comboIndex = 0;
  p.equippedWeaponId = nextWeaponId;
  p.weaponSwitchCooldownTimer = 0;

  if (world.progression) {
    world.progression.lastActionMessage = `ACTIVE WEAPON EQUIPPED · ${getWeaponDefinition(nextWeaponId).name}`;
  }

  world.events.push({
    type: 'weapon_switched',
    x: p.x,
    z: p.z,
    weaponId: nextWeaponId,
  });

  return true;
}

function startPulsecasterLightShot(
  world: WorldState,
  input: PlayerInputFrame,
  moveVec: { dirX: number; dirZ: number; length: number }
): boolean {
  const p = world.player;
  const isRail = p.equippedWeaponId === 'phase_rail';
  const rangedCfg = isRail
    ? GAME_CONFIG.weapons.phase_rail
    : GAME_CONFIG.weapons.pulsecaster;

  if (p.weaponOverheated || p.weaponHeat >= p.maxWeaponHeat) {
    p.lastWeaponShotOutcome = 'overheated';
    return false;
  }
  if (p.weaponShotCooldownTimer > 0) {
    p.lastWeaponShotOutcome = 'cooldown';
    return false;
  }

  const flow = consumeAttackFlowMultipliers(p);
  p.rotationY = resolvePulsecasterAimAngle(world, input, moveVec);
  p.comboIndex = 0;
  p.comboWindowTimer = 0;
  p.actionState = 'light_windup';
  p.stateTimer = Math.max(0.035, rangedCfg.lightShot.windup * flow.windupMult);
  p.attackHitIds = [];
  p.currentAttackStartedAt = world.elapsedTime;
  p.currentAttackMarkId = world.resonance.activeMark?.markId ?? null;
  p.squashX = 0.94;
  p.squashY = 1.06;

  if (flow.triggeredRiposte) {
    world.events.push({
      type: 'player_riposte_strike',
      x: p.x,
      z: p.z,
      weaponId: p.equippedWeaponId,
      flowKind: flow.flowKind,
    });
  }

  recordEchoActionEvent(world, isRail ? 'rail_shot' : 'pulse_shot');
  return true;
}

function startPulsecasterHeavyWindup(
  world: WorldState,
  input: PlayerInputFrame,
  moveVec: { dirX: number; dirZ: number; length: number }
): boolean {
  const p = world.player;
  const isRail = p.equippedWeaponId === 'phase_rail';
  const rangedCfg = isRail
    ? GAME_CONFIG.weapons.phase_rail
    : GAME_CONFIG.weapons.pulsecaster;
  const heavyCfg = rangedCfg.heavyShot;

  if (p.weaponOverheated || p.weaponHeat >= p.maxWeaponHeat) {
    p.lastWeaponShotOutcome = 'overheated';
    p.chargeTime = 0;
    p.actionState = moveVec.length > 0.05 ? 'moving' : 'idle';
    return false;
  }
  if (p.weaponShotCooldownTimer > 0) {
    p.lastWeaponShotOutcome = 'cooldown';
    p.chargeTime = 0;
    p.actionState = moveVec.length > 0.05 ? 'moving' : 'idle';
    return false;
  }

  if (p.actionState !== 'charging_heavy') {
    p.currentAttackStartedAt = world.elapsedTime;
    p.currentAttackMarkId = world.resonance.activeMark?.markId ?? null;
  }

  p.rotationY = resolvePulsecasterAimAngle(world, input, moveVec);

  const hasActiveResonanceMark =
    world.resonance.activeMark !== null && world.resonance.cooldownTimer <= 0;
  p.isEmpoweredHeavy = !hasActiveResonanceMark && p.flux >= heavyCfg.fluxCostForEmpower;
  if (p.isEmpoweredHeavy) {
    p.flux = Math.max(0, p.flux - heavyCfg.fluxCostForEmpower);
  }

  const flow = consumeAttackFlowMultipliers(p);
  p.actionState = 'heavy_windup';
  p.stateTimer = Math.max(0.04, heavyCfg.windup * flow.windupMult);
  p.chargeTime = 0;
  p.comboWindowTimer = 0;
  p.attackHitIds = [];
  p.squashX = 0.88;
  p.squashY = 1.12;

  if (flow.triggeredRiposte) {
    world.events.push({
      type: 'player_riposte_strike',
      x: p.x,
      z: p.z,
      isHeavy: true,
      weaponId: p.equippedWeaponId,
      flowKind: flow.flowKind,
    });
  }

  recordEchoActionEvent(world, isRail ? 'rail_charged_shot' : 'pulse_charged_shot');

  const receiver = world.puzzle?.heavyReceiver;
  if (receiver && receiver.interactionPolicy === 'echo_only') {
    const distToReceiver = Math.hypot(p.x - receiver.x, p.z - receiver.z);
    if (distToReceiver <= receiver.radius) {
      if (world.echo.state === 'recording') {
        world.echo.statusMessage =
          'CHARGED PULSE RECORDED · HOLD ANCHOR PAD OR PRESS [Y] TO REPLAY';
      } else {
        receiver.lastAttemptOutcome = 'wrong_actor';
        world.echo.statusMessage =
          'ECHO RESONANCE ONLY · RECORD [T] HEAVY [E] & REPLAY [Y]';
        world.events.push({
          type: 'echo_receiver_rejected',
          x: p.x,
          z: p.z,
          isHeavy: true,
        });
      }
    }
  }

  return true;
}

function firePlayerPulsecasterProjectile(world: WorldState, isHeavy: boolean): void {
  const p = world.player;
  const isRail = p.equippedWeaponId === 'phase_rail';
  const rangedCfg = isRail
    ? GAME_CONFIG.weapons.phase_rail
    : GAME_CONFIG.weapons.pulsecaster;
  const shotCfg = isHeavy ? rangedCfg.heavyShot : rangedCfg.lightShot;
  const equippedUpgrade = getEquippedWeaponUpgrade(world, p.equippedWeaponId);
  const isOverclocked = isUpgradeOverclocked(
    equippedUpgrade,
    world.progression?.overclockedUpgrades
  );

  let heatCost: number = shotCfg.heatCost;
  let cooldown: number = shotCfg.cooldown;
  if (!isRail && !isHeavy && equippedUpgrade === 'pulse_thermal_sink') {
    heatCost =
      GAME_CONFIG.weapons.upgrades.pulse_thermal_sink.lightHeatCost -
      (isOverclocked ? 2 : 0);
  } else if (!isRail && isHeavy && equippedUpgrade === 'pulse_overcharge_condenser') {
    heatCost =
      GAME_CONFIG.weapons.upgrades.pulse_overcharge_condenser.heavyHeatCost -
      (isOverclocked ? 6 : 0);
    cooldown =
      GAME_CONFIG.weapons.upgrades.pulse_overcharge_condenser.heavyCooldown -
      (isOverclocked ? 0.04 : 0);
  } else if (isRail && !isHeavy && equippedUpgrade === 'rail_phase_capacitor') {
    heatCost =
      GAME_CONFIG.weapons.upgrades.rail_phase_capacitor.lightHeatCost -
      (isOverclocked ? 3 : 0);
  } else if (isRail && isHeavy && equippedUpgrade === 'rail_null_aperture') {
    heatCost = GAME_CONFIG.weapons.upgrades.rail_null_aperture.heavyHeatCost;
  } else if (isRail && isHeavy && equippedUpgrade === 'rail_phase_capacitor') {
    cooldown =
      GAME_CONFIG.weapons.upgrades.rail_phase_capacitor.heavyCooldown -
      (isOverclocked ? 0.08 : 0);
  }

  const rigMods = getPlayerRigModifiers(world);
  const projProtocolMods = getPlayerProtocolModifiers(world);
  const projMasteryInfo = getActiveWeaponMasteryInfo(world, p.equippedWeaponId);
  const projRecMods = getActiveRecursionModifiers(world);
  const projStanceMods = computeStanceDoctrineModifiers(
    world.exploration?.resolvedStoryChoices
  );
  const projMythicBonus = computeEquippedMythicBonus(
    equippedUpgrade,
    world.progression?.awakenedUpgrades
  );
  const projAttunement = computeWeaponCoreAttunement(
    p.equippedWeaponId,
    world.progression?.equippedBossCore,
    world.progression?.transcendedBossCores
  );
  const combinedHeatMult =
    projRecMods.heatMultiplier *
    projStanceMods.heatCostMult *
    projAttunement.heatCostMultiplier;
  const effectiveHeatCost = Math.max(
    1,
    (combinedHeatMult !== 1 ? Math.round(heatCost * combinedHeatMult) : heatCost) -
      projMythicBonus.heatRelief
  );

  // Apply heat cost & check overheat threshold
  p.weaponHeat = Math.min(
    p.maxWeaponHeat,
    p.weaponHeat +
      effectiveHeatCost +
      rigMods.surgeRangedHeatPenalty +
      projProtocolMods.nonSurgeHeatPenalty
  );
  p.weaponShotCooldownTimer = cooldown;
  p.lastWeaponShotOutcome = 'fired';
  if (isHeavy && projAttunement.heavyFluxRestore > 0) {
    p.flux = Math.min(p.maxFlux, p.flux + projAttunement.heavyFluxRestore);
  }

  if (p.weaponHeat >= p.maxWeaponHeat) {
    p.weaponHeat = p.maxWeaponHeat;
    p.weaponOverheated = true;
    p.weaponOverheatTimer = rangedCfg.overheatLockoutDuration;
    p.activeVentAttempted = false;
    world.events.push({
      type: 'pulse_overheated',
      x: p.x,
      z: p.z,
      weaponId: p.equippedWeaponId,
    });
  }

  if (world.projectiles.length >= rangedCfg.maxActiveProjectiles) {
    world.projectiles.shift();
  }

  const dirX = Math.sin(p.rotationY);
  const dirZ = Math.cos(p.rotationY);
  const muzzleOffset = isRail ? 0.68 : 0.56;
  const spawnX = p.x + dirX * muzzleOffset;
  const spawnZ = p.z + dirZ * muzzleOffset;

  const isEmpowered = isHeavy && p.isEmpoweredHeavy;
  let damage: number = isHeavy
    ? isEmpowered
      ? rangedCfg.heavyShot.empoweredDamage
      : rangedCfg.heavyShot.damage
    : rangedCfg.lightShot.damage;
  let staggerDamage: number = isHeavy
    ? isEmpowered
      ? rangedCfg.heavyShot.empoweredStaggerDamage
      : rangedCfg.heavyShot.staggerDamage
    : rangedCfg.lightShot.staggerDamage;

  if (!isRail && !isHeavy && equippedUpgrade === 'pulse_thermal_sink') {
    damage =
      GAME_CONFIG.weapons.upgrades.pulse_thermal_sink.lightDamage +
      (isOverclocked ? 2 : 0);
    staggerDamage =
      GAME_CONFIG.weapons.upgrades.pulse_thermal_sink.lightStagger +
      (isOverclocked ? 1 : 0);
  } else if (!isRail && isHeavy && equippedUpgrade === 'pulse_overcharge_condenser') {
    const condCfg = GAME_CONFIG.weapons.upgrades.pulse_overcharge_condenser;
    const ocMult = isOverclocked ? 1.18 : 1.0;
    damage = Math.round(
      (isEmpowered ? condCfg.heavyEmpoweredDamage : condCfg.heavyBaseDamage) * ocMult
    );
    staggerDamage = Math.round(
      (isEmpowered ? condCfg.heavyEmpoweredStagger : condCfg.heavyStagger) * ocMult
    );
  } else if (isRail && !isHeavy && equippedUpgrade === 'rail_phase_capacitor') {
    damage =
      GAME_CONFIG.weapons.upgrades.rail_phase_capacitor.lightDamage +
      (isOverclocked ? 2 : 0);
    staggerDamage =
      GAME_CONFIG.weapons.upgrades.rail_phase_capacitor.lightStagger +
      (isOverclocked ? 2 : 0);
  } else if (isRail && isHeavy && equippedUpgrade === 'rail_null_aperture') {
    const nullCfg = GAME_CONFIG.weapons.upgrades.rail_null_aperture;
    damage = isEmpowered ? nullCfg.heavyEmpoweredDamage : nullCfg.heavyBaseDamage;
    staggerDamage = isEmpowered ? nullCfg.heavyEmpoweredStagger : nullCfg.heavyStagger;
  }

  if ((p.activeVentEmpoweredShots ?? 0) > 0) {
    damage = Math.round(damage * ACTIVE_VENT_CONFIG.empoweredDamageMult);
    staggerDamage = Math.round(staggerDamage * ACTIVE_VENT_CONFIG.empoweredStaggerMult);
    p.activeVentEmpoweredShots = Math.max(0, (p.activeVentEmpoweredShots ?? 1) - 1);
  }
  if (rigMods.surgeDamageMultiplier !== 1) {
    damage = Math.max(1, Math.round(damage * rigMods.surgeDamageMultiplier));
  }
  const projDmgMult =
    projMasteryInfo.damageMultiplier *
    projRecMods.damageMultiplier *
    (isHeavy ? projRecMods.heavyRangedDamageMultiplier : 1);
  if (projDmgMult !== 1) {
    damage = Math.max(1, Math.round(damage * projDmgMult));
  }
  const projStagMult = projMasteryInfo.staggerMultiplier * projRecMods.staggerMultiplier;
  if (projStagMult !== 1) {
    staggerDamage = Math.round(staggerDamage * projStagMult);
  }
  const singProjBoost = consumeSingularityStrikeMultipliers(
    ensureSingularityState(world),
    false
  );
  const koProjMods = getActiveWeaponOverchargeModifiers(
    world.kineticOvercharge,
    p.equippedWeaponId
  );
  const tsProjMods = getTwinSyncModifiers(world.twinSync);
  const momProjMods =
    (world.momentum?.tier ?? 0) >= 1
      ? getChronoMomentumModifiers(world.momentum)
      : { damageMult: 1.0, styleBonusMult: 1.0, weakpointActive: false };
  const nxProjMods = getChronoNexusModifiers(world.nexus);
  const chronProjMods = computeChroniclePassiveBonus(
    world.run?.recoveredLogs,
    world.run?.completedChapters
  );
  const wResProjMods = getActiveWeaponResonanceModifiers(world.weaponResonance);
  const globalMasteryProj = computeGlobalArsenalMasteryBonus(
    world.progression?.weaponMasteryXp
  );
  const projRigSynergy = getPlayerRigSetSynergy(world);
  const totalProjDmgBoost =
    singProjBoost.damageMult *
    koProjMods.damageMult *
    tsProjMods.damageMult *
    momProjMods.damageMult *
    nxProjMods.damageMult *
    chronProjMods.damageMult *
    wResProjMods.damageMult *
    globalMasteryProj.damageMult *
    projStanceMods.damageMult *
    projMythicBonus.damageMult *
    projRigSynergy.damageMultiplier *
    projAttunement.damageMultiplier;
  const totalProjStagBoost =
    singProjBoost.staggerMult *
    koProjMods.staggerMult *
    tsProjMods.staggerMult *
    wResProjMods.staggerMult *
    globalMasteryProj.staggerMult *
    projStanceMods.staggerMult *
    projMythicBonus.staggerMult *
    projAttunement.staggerMultiplier;
  if (totalProjDmgBoost !== 1) {
    damage = Math.max(1, Math.round(damage * totalProjDmgBoost));
  }
  if (totalProjStagBoost !== 1) {
    staggerDamage = Math.round(staggerDamage * totalProjStagBoost);
  }

  world.projectiles.push({
    id: `proj-${world.nextProjectileId++}`,
    owner: 'player',
    weaponId: p.equippedWeaponId,
    equippedUpgradeId: equippedUpgrade,
    attackMode: isRail
      ? isHeavy
        ? 'rail_heavy'
        : 'rail_light'
      : isHeavy
        ? 'pulse_heavy'
        : 'pulse_light',
    x: spawnX,
    z: spawnZ,
    prevX: p.x,
    prevZ: p.z,
    vx: dirX * shotCfg.projectileSpeed,
    vz: dirZ * shotCfg.projectileSpeed,
    rotationY: p.rotationY,
    radius: shotCfg.projectileRadius,
    damage,
    staggerDamage,
    isHeavy,
    isEmpowered,
    maxRange: shotCfg.maxRange,
    distanceTraveled: 0,
    elapsed: 0,
    maxLifetime: shotCfg.maxLifetime,
    active: true,
    piercing: Boolean(isRail && isHeavy),
    attackStartedAt: p.currentAttackStartedAt,
    attackMarkId: p.currentAttackMarkId,
    hitTargetIds: [],
    flowDamageMult: p.activeStrikeFlowDamageMult ?? 1,
    flowStaggerMult: p.activeStrikeFlowStaggerMult ?? 1,
    flowKind: p.activeStrikeFlowKind ?? 'none',
  });
  clearActiveStrikeFlow(p);

  world.events.push({
    type: isRail
      ? isHeavy
        ? 'player_rail_heavy_shot'
        : 'player_rail_shot'
      : isHeavy
        ? 'player_pulse_heavy_shot'
        : 'player_pulse_shot',
    x: spawnX,
    z: spawnZ,
    isHeavy,
    weaponId: p.equippedWeaponId,
    upgradeId: equippedUpgrade,
  });
}

export function isQualifyingConvergenceAttack(
  player: PlayerState,
  isHeavy: boolean,
  attackMode?: WeaponAttackMode
): boolean {
  if (attackMode === 'pulse_heavy' || attackMode === 'rail_heavy' || attackMode === 'breaker_heavy') {
    return true;
  }
  if (attackMode === 'pulse_light' || attackMode === 'rail_light') {
    return false;
  }
  if (isHeavy || player.actionState === 'heavy_active') return true;
  if (player.actionState === 'light_active' && player.comboIndex === 2) return true;
  return false;
}

export function isBossArchetype(archetype: EnemyArchetype): boolean {
  return (
    archetype === 'helix' ||
    archetype === 'choir' ||
    archetype === 'curator' ||
    archetype === 'matron' ||
    archetype === 'warden_prime'
  );
}

function applyLivePlayerStrikeToChoirNode(
  world: WorldState,
  node: HarmonicNodeState
): void {
  const choir = world.choir;
  if (!choir.active || world.outcome !== 'none') return;

  // Check if another linked node is currently primed by an Echo
  const otherPrimedNode = choir.nodes.find(
    (n) => n.id !== node.id && n.status === 'primed' && n.primedRemainingTime > 0
  );

  if (node.status === 'primed') {
    // Striking the exact same node that the Echo primed is a single-target repeat; require striking a linked counterpart node!
    const alreadySyncedCount = choir.nodes.filter((n) => n.status === 'synchronized').length;
    if (alreadySyncedCount > 0 && otherPrimedNode) {
      node.status = 'synchronized';
      node.primedRemainingTime = 0;
      node.syncOrder = alreadySyncedCount + 1;
      choir.synchronizedCount = choir.nodes.filter((n) => n.status === 'synchronized').length;
      world.events.push({
        type: 'choir_node_synchronized',
        x: node.x,
        z: node.z,
        enemyId: node.id,
      });
    } else {
      // Mismatched single-node strike degrades/fails the node synchronization
      node.status = 'failed';
      node.primedRemainingTime = 0;
      node.failedRemainingTime = GAME_CONFIG.choir.failureResetDuration;
      choir.failureResetTimer = GAME_CONFIG.choir.failureResetDuration;
      choir.lastFailureReason = 'same_node_struck';
      choir.statusMessage = `HARMONIC MISMATCH // ECHO PRIMED ${node.label} — STRIKE A DIFFERENT LINKED NODE WITH LIVE SERA`;
      world.events.push({
        type: 'choir_sync_failed',
        x: node.x,
        z: node.z,
        enemyId: node.id,
      });
    }
  } else if (node.status === 'inactive') {
    if (otherPrimedNode) {
      // Valid linked-node synchronization! Echo primed otherPrimedNode, live Sera struck this linked counterpart node.
      otherPrimedNode.status = 'synchronized';
      otherPrimedNode.primedRemainingTime = 0;
      otherPrimedNode.syncOrder = 1;
      node.status = 'synchronized';
      node.primedRemainingTime = 0;
      node.syncOrder = 2;
      choir.synchronizedCount = choir.nodes.filter((n) => n.status === 'synchronized').length;
      world.hitstopTimer = Math.max(world.hitstopTimer, 0.06);
      world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.35);
      world.events.push({
        type: 'choir_node_synchronized',
        x: node.x,
        z: node.z,
        enemyId: node.id,
      });

      if (choir.synchronizedCount >= choir.requiredNodeCount) {
        choir.completedCycles += 1;
        choir.syncTimer = GAME_CONFIG.choir.syncExposedDuration;
        choir.statusMessage =
          'HARMONIC DISRUPTION COMPLETE // THE CHOIR SHIELD SHATTERED — CORE EXPOSED (1.65x)!';
        if (world.boss && world.boss.id === 'the-choir' && world.boss.hp > 0) {
          const b = world.boss;
          b.coreExposed = true;
          b.activeAttack = null;
          b.shockwaveActive = false;
          b.aiState = 'staggered';
          b.stateDuration = GAME_CONFIG.choir.syncExposedDuration;
          b.stateTimer = GAME_CONFIG.choir.syncExposedDuration;
          b.vx = 0;
          b.vz = 0;
          b.statusLabel = 'HARMONIC DISRUPTION · CORE EXPOSED (1.65x)';
          const bonusDmg = GAME_CONFIG.choir.syncCompletionBonusDamage;
          b.hp = Math.max(1, b.hp - bonusDmg);
          world.stats.damageDealt += bonusDmg;
          const bossEnemy = world.enemies.find((e) => e.id === b.id);
          if (bossEnemy) {
            bossEnemy.hp = b.hp;
            bossEnemy.aiState = 'staggered';
            bossEnemy.stateDuration = b.stateDuration;
            bossEnemy.stateTimer = b.stateTimer;
            bossEnemy.vx = 0;
            bossEnemy.vz = 0;
            checkAndTriggerBossPhase2(world, b, bossEnemy);
          }
        }
        world.events.push({
          type: 'choir_sync_completed',
          x: world.boss?.x ?? 0,
          z: world.boss?.z ?? 0,
          enemyId: world.boss?.id,
        });
      } else {
        choir.statusMessage = `NODE LINKED (${choir.synchronizedCount}/${choir.requiredNodeCount}) // SYNCHRONIZE REMAINING LINKED NODE`;
      }
    } else if (world.echo.state === 'recording') {
      // Player is actively recording an Echo strike at this pylon so the Echo can prime it on replay
      choir.statusMessage = `STRIKE RECORDED ON ${node.label} // PRESS [Y] TO REPLAY ECHO & PRIME PYLON`;
    } else {
      // Live player struck an unprimed node while not recording and while no linked node was primed by an Echo
      node.status = 'failed';
      node.primedRemainingTime = 0;
      node.failedRemainingTime = GAME_CONFIG.choir.failureResetDuration;
      choir.failureResetTimer = GAME_CONFIG.choir.failureResetDuration;
      choir.lastFailureReason = 'unprimed_node_struck';
      choir.statusMessage = `UNPRIMED NODE // PRIME A LINKED NODE WITH AN ECHO ATTACK FIRST, THEN STRIKE COUNTERPART`;
      world.events.push({
        type: 'choir_sync_failed',
        x: node.x,
        z: node.z,
        enemyId: node.id,
      });
    }
  }
}

function evaluateLivePlayerStrikeOnChoirNodes(world: WorldState, isHeavy: boolean): void {
  const choir = world.choir;
  if (!choir.active || world.outcome !== 'none') return;

  const p = world.player;
  const isBreaker = p.equippedWeaponId === 'grav_breaker';
  const breakerCfg = GAME_CONFIG.weapons.grav_breaker;
  const breakerUpgrade = getEquippedWeaponUpgrade(world, 'grav_breaker');
  const range = isBreaker
    ? isHeavy
      ? breakerCfg.heavySlam.range +
        (breakerUpgrade === 'breaker_singularity_coil'
          ? GAME_CONFIG.weapons.upgrades.breaker_singularity_coil.heavyRangeBonus
          : 0)
      : breakerCfg.lightSlam.range
    : isHeavy
      ? GAME_CONFIG.player.heavyAttack.range
      : GAME_CONFIG.player.lightAttack.range;
  const arcRadians = isBreaker
    ? isHeavy
      ? breakerUpgrade === 'breaker_singularity_coil'
        ? GAME_CONFIG.weapons.upgrades.breaker_singularity_coil.fullRadialArc
        : breakerCfg.heavySlam.arcRadians
      : breakerCfg.lightSlam.arcRadians
    : isHeavy
      ? GAME_CONFIG.player.heavyAttack.arcRadians
      : GAME_CONFIG.player.lightAttack.arcRadians;

  for (let i = 0; i < choir.nodes.length; i++) {
    const node = choir.nodes[i];
    if (p.attackHitIds.includes(node.id)) continue;

    const dx = node.x - p.x;
    const dz = node.z - p.z;
    const dist = Math.hypot(dx, dz);
    if (dist > range + node.radius) continue;

    const angleToNode = Math.atan2(dx, dz);
    const diff = Math.abs(angleDiff(angleToNode, p.rotationY));
    if (diff > arcRadians * 0.5 && dist > node.radius + GAME_CONFIG.player.radius + 0.3) {
      continue;
    }

    p.attackHitIds.push(node.id);
    applyLivePlayerStrikeToChoirNode(world, node);
  }
}

export function attemptGravityPin(world: WorldState): boolean {
  const gp = world.gravityPin;
  const p = world.player;

  if (!gp.unlocked) {
    gp.status = 'locked';
    gp.statusMessage = 'GRAVITY PIN [G] UNLOCKED IN CHAPTER III: THE CURATOR';
    world.events.push({
      type: 'gravity_pin_rejected',
      x: p.x,
      z: p.z,
    });
    return false;
  }

  if (p.actionState === 'dead' || world.outcome !== 'none') {
    gp.status = 'action_locked';
    gp.statusMessage = 'GRAVITY PIN UNAVAILABLE';
    return false;
  }

  if (gp.cooldownTimer > 0) {
    gp.status = 'on_cooldown';
    gp.statusMessage = `GRAVITY PIN RECHARGING (${gp.cooldownTimer.toFixed(1)}s)`;
    world.events.push({
      type: 'gravity_pin_rejected',
      x: p.x,
      z: p.z,
    });
    return false;
  }

  if (p.flux < gp.fluxCost) {
    gp.status = 'insufficient_flux';
    gp.statusMessage = `INSUFFICIENT FLUX FOR GRAVITY PIN (${gp.fluxCost} REQUIRED)`;
    world.events.push({
      type: 'gravity_pin_rejected',
      x: p.x,
      z: p.z,
    });
    return false;
  }

  // Find best target within range, or deploy forward along player facing
  let targetX = p.x + Math.sin(p.rotationY) * 4.2;
  let targetZ = p.z + Math.cos(p.rotationY) * 4.2;
  let bestDist = Infinity;

  for (let i = 0; i < world.enemies.length; i++) {
    const e = world.enemies[i];
    if (e.hp <= 0 || e.aiState === 'ko') continue;
    const d = Math.hypot(e.x - p.x, e.z - p.z);
    if (d <= gp.maxRange && d < bestDist) {
      bestDist = d;
      targetX = e.x;
      targetZ = e.z;
    }
  }

  const distFromCenter = Math.hypot(targetX, targetZ);
  if (distFromCenter > GAME_CONFIG.arena.radius - 1.2 && distFromCenter > 0.001) {
    const scale = (GAME_CONFIG.arena.radius - 1.2) / distFromCenter;
    targetX *= scale;
    targetZ *= scale;
  }

  p.flux = Math.max(0, p.flux - gp.fluxCost);
  gp.centerX = targetX;
  gp.centerZ = targetZ;
  gp.activeDurationTimer = gp.maxDuration;
  gp.cooldownTimer = gp.maxCooldown;
  gp.activationCount += 1;
  gp.status = 'active';
  gp.pinnedTargetIds = [];

  for (let i = 0; i < world.enemies.length; i++) {
    const e = world.enemies[i];
    if (e.hp <= 0 || e.aiState === 'ko') continue;
    const d = Math.hypot(e.x - gp.centerX, e.z - gp.centerZ);
    if (d > gp.radius + e.radius) continue;

    const isBoss = world.boss !== null && world.boss.id === e.id;
    if (isBoss && world.boss) {
      const b = world.boss;
      // Boss resistance: Gravity Pin NEVER cancels committed boss attacks ('attack' or 'phase_transition')
      if (b.aiState === 'pursue' || b.aiState === 'telegraph') {
        const pinDur = GAME_CONFIG.curator.gravityPin.bossInterruptDuration;
        e.pinnedTimer = Math.max(e.pinnedTimer ?? 0, pinDur);
        b.pinnedTimer = e.pinnedTimer;
        b.stagger = Math.min(
          b.maxStagger,
          b.stagger + GAME_CONFIG.curator.gravityPin.bossPostureDamage
        );
        e.stagger = b.stagger;
        if (b.aiState === 'telegraph') {
          // Interrupt eligible non-committed telegraph into a brief recovery window
          b.activeAttack = null;
          b.shockwaveActive = false;
          b.aiState = 'recovery';
          b.stateDuration = pinDur;
          b.stateTimer = pinDur;
          b.coreExposed = true;
          b.vx = 0;
          b.vz = 0;
          b.statusLabel = 'GRAVITY PINNED · TELEGRAPH INTERRUPTED (1.45x)';
          e.aiState = 'recovery';
          e.stateDuration = pinDur;
          e.stateTimer = pinDur;
          e.vx = 0;
          e.vz = 0;
        }
        gp.pinnedTargetIds.push(e.id);
      }
    } else {
      // Support units & False Echo decoys are locked for full duration and interrupted
      e.pinnedTimer = Math.max(e.pinnedTimer ?? 0, gp.maxDuration);
      e.vx = 0;
      e.vz = 0;
      e.stagger = Math.min(
        e.maxStagger,
        e.stagger + GAME_CONFIG.curator.gravityPin.bossPostureDamage
      );
      if (e.archetype === 'curator_decoy') {
        const decoyDmg = GAME_CONFIG.curator.gravityPin.decoyDamage;
        e.hp = Math.max(0, e.hp - decoyDmg);
        world.stats.damageDealt += decoyDmg;
        if (e.hp <= 0) {
          handleEnemyZeroHpDefeat(world, e, decoyDmg, true, false, false);
        }
      }
      if (e.hp > 0 && (e.aiState === 'telegraph' || e.aiState === 'attack')) {
        e.aiState = 'recovery';
        e.stateDuration = Math.min(1.4, gp.maxDuration);
        e.stateTimer = e.stateDuration;
      }
      gp.pinnedTargetIds.push(e.id);
    }
  }

  gp.statusMessage =
    gp.pinnedTargetIds.length > 0
      ? `GRAVITY PIN ACTIVE // ${gp.pinnedTargetIds.length} TARGET(S) ANCHORED`
      : 'GRAVITY PIN DEPLOYED // SPATIAL WELL ACTIVE';
  world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.24);
  world.events.push({
    type: 'gravity_pin_activated',
    x: gp.centerX,
    z: gp.centerZ,
  });

  return true;
}

export function attemptEchoCollapse(world: WorldState): boolean {
  const ec = world.echoCollapse;
  const p = world.player;

  if (!ec.unlocked) {
    ec.status = 'locked';
    ec.statusMessage = 'ECHO COLLAPSE [X] UNLOCKED IN CHAPTER IV: MATRON-V';
    world.events.push({
      type: 'echo_collapse_rejected',
      x: p.x,
      z: p.z,
    });
    return false;
  }

  if (world.echo.state !== 'playback' || !world.echo.activeActor) {
    ec.status = 'no_active_echo';
    ec.statusMessage = 'ECHO COLLAPSE REQUIRES AN ACTIVE PLAYING ECHO [Y]';
    world.events.push({
      type: 'echo_collapse_rejected',
      x: p.x,
      z: p.z,
    });
    return false;
  }

  if (ec.cooldownTimer > 0) {
    ec.status = 'on_cooldown';
    ec.statusMessage = `ECHO COLLAPSE RECHARGING (${ec.cooldownTimer.toFixed(1)}s)`;
    world.events.push({
      type: 'echo_collapse_rejected',
      x: p.x,
      z: p.z,
    });
    return false;
  }

  if (p.flux < ec.fluxCost) {
    ec.status = 'insufficient_flux';
    ec.statusMessage = `INSUFFICIENT FLUX FOR ECHO COLLAPSE (${ec.fluxCost} REQUIRED)`;
    world.events.push({
      type: 'echo_collapse_rejected',
      x: p.x,
      z: p.z,
    });
    return false;
  }

  const echoX = world.echo.activeActor.x;
  const echoZ = world.echo.activeActor.z;

  const ecDocSpec = getEchoDoctrineSpec(world.progression?.echoDoctrine);
  const ecRecMods = getActiveRecursionModifiers(world);
  // Consume Flux, start cooldown, and consume the active Echo playback (preserving the recorded clip for future replay)
  p.flux = Math.max(0, p.flux - ec.fluxCost);
  ec.cooldownTimer = Number(
    (ec.maxCooldown * ecDocSpec.collapseCooldownMultiplier * ecRecMods.confluenceCooldownMultiplier).toFixed(2)
  );
  ec.blastTimer = GAME_CONFIG.matron.echoCollapse.blastVisualDuration;
  ec.blastX = echoX;
  ec.blastZ = echoZ;
  ec.activationCount += 1;
  ec.status = 'on_cooldown';

  world.echo.state = 'ready';
  world.echo.activeActor = null;
  world.echo.playbackTime = 0;
  world.echo.nextEventIndex = 0;
  world.echo.statusMessage = 'ECHO COLLAPSED // TEMPORAL DETONATION TRIGGERED';

  const ecProtoMods = getPlayerProtocolModifiers(world);
  const effectiveBlastRadius = ec.blastRadius + ecDocSpec.collapseRadiusBonus;
  let hitCount = 0;
  for (let i = 0; i < world.enemies.length; i++) {
    const enemy = world.enemies[i];
    if (enemy.hp <= 0 || enemy.aiState === 'ko') continue;
    const dist = Math.hypot(enemy.x - echoX, enemy.z - echoZ);
    if (dist > effectiveBlastRadius + enemy.radius) continue;

    hitCount += 1;
    const isBoss = world.boss !== null && world.boss.id === enemy.id;
    const dmg = Math.round(
      ec.damage *
        ecProtoMods.echoDamageMultiplier *
        ecDocSpec.echoDamageMultiplier *
        ecRecMods.echoDamageMultiplier
    );

    enemy.hp = Math.max(0, enemy.hp - dmg);
    enemy.hitFlashTimer = 0.24;
    world.stats.damageDealt += dmg;

    if (enemy.hp > 0) {
      enemy.stagger = Math.min(
        enemy.maxStagger,
        enemy.stagger +
          Math.round(
            ec.postureDamage *
              ecProtoMods.echoStaggerMultiplier *
              ecDocSpec.echoStaggerMultiplier *
              ecRecMods.echoStaggerMultiplier
          )
      );
      if (isBoss && world.boss) {
        const b = world.boss;
        b.hp = enemy.hp;
        b.stagger = enemy.stagger;
        b.hitFlashTimer = 0.24;
        // Interrupt non-committed boss telegraph or trigger stagger if posture full
        if (b.stagger >= b.maxStagger && b.staggerCooldownTimer <= 0) {
          b.aiState = 'staggered';
          b.stateDuration = GAME_CONFIG.boss.staggeredDuration;
          b.stateTimer = b.stateDuration;
          b.stagger = 0;
          enemy.stagger = 0;
          b.activeAttack = null;
          b.shockwaveActive = false;
          b.coreExposed = true;
          b.staggerCooldownTimer = b.stateDuration + GAME_CONFIG.boss.staggerCooldown;
          b.statusLabel = 'ECHO COLLAPSE STAGGER · CORE EXPOSED (1.55x)';
          enemy.aiState = 'staggered';
          enemy.stateDuration = b.stateDuration;
          enemy.stateTimer = b.stateTimer;
        } else if (b.aiState === 'telegraph') {
          b.activeAttack = null;
          b.shockwaveActive = false;
          b.aiState = 'recovery';
          b.stateDuration = 1.15;
          b.stateTimer = 1.15;
          b.coreExposed = true;
          b.statusLabel = 'ECHO COLLAPSE · TELEGRAPH DISRUPTED';
          enemy.aiState = 'recovery';
          enemy.stateDuration = 1.15;
          enemy.stateTimer = 1.15;
        }
        // Check boss phase 2 transition if HP crossed threshold
        checkAndTriggerBossPhase2(world, b, enemy);
      } else {
        enemy.aiState = 'staggered';
        enemy.stateDuration = GAME_CONFIG.enemies[enemy.archetype].staggeredDuration;
        enemy.stateTimer = enemy.stateDuration;
        enemy.stagger = 0;
        enemy.vx = 0;
        enemy.vz = 0;
      }
    } else {
      handleEnemyZeroHpDefeat(world, enemy, dmg, true, false, false);
    }
  }

  ec.lastTargetsHit = hitCount;
  ec.statusMessage =
    hitCount > 0
      ? `ECHO COLLAPSE DETONATED // ${hitCount} TARGET(S) STRUCK`
      : 'ECHO COLLAPSE DETONATED // NO TARGETS IN BLAST RADIUS';
  world.hitstopTimer = Math.max(world.hitstopTimer, 0.075);
  world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.45);
  world.events.push({
    type: 'echo_collapse_detonated',
    x: echoX,
    z: echoZ,
    amount: hitCount,
  });

  return true;
}

function advanceChoirSystem(world: WorldState, dt: number): void {
  const choir = world.choir;
  if (!choir.active) return;

  if (choir.failureResetTimer > 0) {
    choir.failureResetTimer = Math.max(0, choir.failureResetTimer - dt);
  }

  if (choir.syncTimer > 0) {
    choir.syncTimer = Math.max(0, choir.syncTimer - dt);
    if (choir.syncTimer <= 0 && choir.synchronizedCount >= choir.requiredNodeCount) {
      for (let i = 0; i < choir.nodes.length; i++) {
        choir.nodes[i].status = 'inactive';
        choir.nodes[i].primedRemainingTime = 0;
        choir.nodes[i].failedRemainingTime = 0;
        choir.nodes[i].syncOrder = 0;
      }
      choir.synchronizedCount = 0;
      choir.statusMessage =
        'HARMONIC SHIELD RESTORED // PRIME A NODE WITH ECHO & STRIKE LINKED COUNTERPART';
      if (world.boss && world.boss.id === 'the-choir' && world.boss.hp > 0) {
        world.boss.coreExposed = false;
      }
    }
  }

  for (let i = 0; i < choir.nodes.length; i++) {
    const node = choir.nodes[i];

    if (node.status === 'primed') {
      node.primedRemainingTime = Math.max(0, node.primedRemainingTime - dt);
      if (node.primedRemainingTime <= 0) {
        node.status = 'failed';
        node.failedRemainingTime = GAME_CONFIG.choir.failureResetDuration;
        choir.failureResetTimer = GAME_CONFIG.choir.failureResetDuration;
        choir.lastFailureReason = 'prime_window_expired';
        // Also degrade any partial sync if window expired before completing required nodes
        for (let j = 0; j < choir.nodes.length; j++) {
          if (
            choir.nodes[j].status === 'synchronized' &&
            choir.synchronizedCount < choir.requiredNodeCount
          ) {
            choir.nodes[j].status = 'inactive';
            choir.nodes[j].syncOrder = 0;
          }
        }
        choir.synchronizedCount = choir.nodes.filter((n) => n.status === 'synchronized').length;
        choir.statusMessage = `${node.label} PRIME EXPIRED // SYNCHRONIZE LINKED NODE WITHIN ${GAME_CONFIG.choir.nodePrimeDuration.toFixed(1)}S`;
        world.events.push({
          type: 'choir_sync_failed',
          x: node.x,
          z: node.z,
          enemyId: node.id,
        });
      }
    } else if (node.status === 'failed') {
      node.failedRemainingTime = Math.max(0, node.failedRemainingTime - dt);
      if (node.failedRemainingTime <= 0) {
        node.status = 'inactive';
        if (choir.synchronizedCount < choir.requiredNodeCount) {
          choir.statusMessage =
            'HARMONIC NODES READY // PRIME ONE NODE WITH ECHO, STRIKE LINKED NODE WITH SERA';
        }
      }
    }
  }
}

function advanceCuratorSystem(world: WorldState, dt: number): void {
  const gp = world.gravityPin;
  const rigMods = getPlayerRigModifiers(world);
  if (gp.cooldownTimer > 0) {
    gp.cooldownTimer = Math.max(
      0,
      gp.cooldownTimer - dt * rigMods.surgeCooldownTickMultiplier
    );
  }
  if (gp.activeDurationTimer > 0) {
    gp.activeDurationTimer = Math.max(0, gp.activeDurationTimer - dt);
    if (gp.activeDurationTimer <= 0) {
      gp.pinnedTargetIds = [];
    }
  }
  if (!gp.unlocked) {
    gp.status = 'locked';
  } else if (gp.activeDurationTimer > 0) {
    gp.status = 'active';
  } else if (gp.cooldownTimer > 0) {
    gp.status = 'on_cooldown';
  } else if (world.player.flux < gp.fluxCost) {
    gp.status = 'insufficient_flux';
  } else {
    gp.status = 'ready';
  }

  const cur = world.curator;
  if (!cur.active) return;

  const p = world.player;
  const pRadius = GAME_CONFIG.player.radius;

  for (let i = cur.traces.length - 1; i >= 0; i--) {
    const trace = cur.traces[i];
    trace.timer -= dt;

    if (trace.state === 'warning') {
      if (trace.timer <= 0) {
        trace.state = 'committed';
        trace.timer = trace.commitDuration;
      }
    } else if (trace.state === 'committed') {
      if (trace.timer <= 0) {
        trace.state = 'executing';
        trace.timer = trace.activeDuration;
        world.events.push({
          type: 'curator_trace_executed',
          x: trace.originX,
          z: trace.originZ,
        });
      }
    } else if (trace.state === 'executing') {
      if (!trace.isHarmlessResidue && !trace.hitApplied && p.actionState !== 'dead') {
        const relX = p.x - trace.originX;
        const relZ = p.z - trace.originZ;
        const proj = relX * trace.dirX + relZ * trace.dirZ;
        const perp = Math.abs(relX * trace.dirZ - relZ * trace.dirX);
        if (
          proj >= -0.2 &&
          proj <= trace.length + pRadius &&
          perp <= trace.width * 0.5 + pRadius
        ) {
          trace.hitApplied = true;
          const bossEnemy =
            world.enemies.find((e) => e.id === (world.boss?.id ?? 'the-curator')) ??
            world.enemies.find((e) => e.id === 'the-curator');
          applyDamageToPlayer(world, trace.damage, bossEnemy);
        }
      }
      if (trace.timer <= 0) {
        trace.state = 'residue';
        trace.isHarmlessResidue = true;
        trace.timer = trace.residueDuration;
      }
    } else {
      if (trace.timer <= 0) {
        cur.traces.splice(i, 1);
      }
    }
  }
}

function advanceMatronSystem(world: WorldState, dt: number): void {
  const ec = world.echoCollapse;
  const rigMods = getPlayerRigModifiers(world);
  if (ec.cooldownTimer > 0) {
    ec.cooldownTimer = Math.max(
      0,
      ec.cooldownTimer - dt * rigMods.surgeCooldownTickMultiplier
    );
  }
  if (ec.blastTimer > 0) {
    ec.blastTimer = Math.max(0, ec.blastTimer - dt);
  }

  if (!ec.unlocked) {
    ec.status = 'locked';
  } else if (ec.cooldownTimer > 0) {
    ec.status = 'on_cooldown';
  } else if (world.echo.state !== 'playback' || !world.echo.activeActor) {
    ec.status = 'no_active_echo';
  } else if (world.player.flux < ec.fluxCost) {
    ec.status = 'insufficient_flux';
  } else {
    ec.status = 'ready';
    ec.statusMessage = `ECHO COLLAPSE [X] READY (${ec.fluxCost} FLUX)`;
  }

  const mat = world.matron;
  if (!mat.active) return;

  if (mat.echoSuppressedTimer > 0) {
    mat.echoSuppressedTimer = Math.max(0, mat.echoSuppressedTimer - dt);
    if (mat.echoSuppressedTimer <= 0) {
      mat.statusMessage =
        'CHRONO RIG SUPPRESSION CLEARED // RECORD [T], REPLAY [Y], AND ECHO COLLAPSE [X] ONLINE';
    }
  }
}

function getBossBaseMaxHp(bossId: string): number {
  if (bossId === 'the-choir') return GAME_CONFIG.choir.maxHp;
  if (bossId === 'the-curator') return GAME_CONFIG.curator.maxHp;
  if (bossId === 'matron-v') return GAME_CONFIG.matron.maxHp;
  if (bossId === 'warden-prime') return GAME_CONFIG.wardenPrime.maxHp;
  if (bossId === 'echo-zero') return 920;
  return GAME_CONFIG.boss.maxHp;
}

function getBossPhase2Threshold(bossId: string, bossMaxHp?: number): number {
  const baseThreshold =
    bossId === 'the-choir'
      ? GAME_CONFIG.choir.phase2HpThreshold
      : bossId === 'the-curator'
        ? GAME_CONFIG.curator.phase2HpThreshold
        : bossId === 'matron-v'
          ? GAME_CONFIG.matron.phase2HpThreshold
          : bossId === 'warden-prime'
            ? GAME_CONFIG.wardenPrime.phase2HpThreshold
            : bossId === 'echo-zero'
              ? 460
              : GAME_CONFIG.boss.phase2HpThreshold;
  const baseMaxHp = getBossBaseMaxHp(bossId);
  if (bossMaxHp && baseMaxHp > 0 && bossMaxHp !== baseMaxHp) {
    return Math.round(baseThreshold * (bossMaxHp / baseMaxHp));
  }
  return baseThreshold;
}

function checkAndTriggerBossPhase2(
  world: WorldState,
  bossState: BossState,
  enemy: EnemyState
): void {
  const threshold = getBossPhase2Threshold(bossState.id, bossState.maxHp);
  if (
    enemy.hp > 0 &&
    enemy.hp <= threshold &&
    !bossState.phaseTransitionTriggered
  ) {
    bossState.phaseTransitionTriggered = true;
    bossState.phase = 2;
    bossState.aiState = 'phase_transition';
    bossState.stateDuration = GAME_CONFIG.boss.phaseTransitionDuration;
    bossState.stateTimer = bossState.stateDuration;
    bossState.activeAttack = null;
    bossState.shockwaveActive = false;
    bossState.shockwaveRadius = 0;
    bossState.shockwaveMaxRadius =
      bossState.id === 'warden-prime'
        ? GAME_CONFIG.wardenPrime.attacks.sovereign_purge_wave.outerRadiusP2
        : GAME_CONFIG.boss.attacks.anchor_slam.outerRadiusP2;
    bossState.coreExposed = false;
    bossState.stagger = 0;
    bossState.vx = 0;
    bossState.vz = 0;
    bossState.statusLabel =
      bossState.id === 'the-choir'
        ? 'PHASE II · HARMONIC CONVERGENCE OVERLOAD'
        : bossState.id === 'the-curator'
          ? 'PHASE II · ARCHIVAL RECONSTRUCTION SURGE'
          : bossState.id === 'matron-v'
            ? 'PHASE II · QUARANTINE SURGICAL PROTOCOL'
            : bossState.id === 'warden-prime'
              ? 'PHASE II · SOVEREIGN CHRONICLE OVERDRIVE'
              : 'PHASE II · HELIX OVERLOAD INITIATED';

    if (world.progression?.overdriveDifficulty) {
      const escortId = `enemy-overdrive-escort-${bossState.id}-${world.enemies.length}`;
      const escort = createEnemy(escortId, 'scrapper', 0, -2.5, 0);
      escort.hitFlashTimer = 0.25;
      resolveCircleObstacleCollisions(
        escort,
        world.obstacles ?? [],
        GAME_CONFIG.arena.radius - 0.8,
        getArenaSolidPropColliders(world.run?.chapter ?? 'prologue')
      );
      applyOverdriveToEnemies(world, [escort], null);
      world.enemies.push(escort);
    }

    const res = world.resonance;
    if (res.activeMark && res.activeMark.enemyId === enemy.id) {
      res.activeMark = null;
      res.status = res.cooldownTimer > 0 ? 'on_cooldown' : 'idle';
    }
    enemy.stagger = 0;
    enemy.aiState = 'pursue';
    enemy.stateDuration = bossState.stateDuration;
    enemy.stateTimer = bossState.stateTimer;
    enemy.vx = 0;
    enemy.vz = 0;
    world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.62);
    const phase2CommKey: NarrativeCommKey =
      bossState.id === 'the-choir'
        ? 'chapter2_phase2'
        : bossState.id === 'the-curator'
          ? 'chapter3_phase2'
          : bossState.id === 'matron-v'
            ? 'chapter4_phase2'
            : bossState.id === 'warden-prime'
              ? 'warden_prime_phase2'
              : 'chapter1_phase2';
    triggerNarrativeTransmission(world, phase2CommKey, true);

    world.events.push({
      type: 'boss_phase_transition',
      x: enemy.x,
      z: enemy.z,
      enemyId: enemy.id,
      bossPhase: 2,
    });

    const p2Adr = applyAdrenalineDelta(world.player, ADRENALINE_GAINS.bossPhaseBreak);
    if (p2Adr.tierDelta !== 0) {
      world.events.push({
        type: 'adrenaline_tier_changed',
        x: world.player.x,
        z: world.player.z,
        amount: p2Adr.nextTier,
        postureBonus: p2Adr.tierDelta,
      });
    }
  }
}

function handleEnemyZeroHpDefeat(
  world: WorldState,
  enemy: EnemyState,
  finalDamage: number,
  isVulnerable: boolean,
  isHeavy: boolean,
  isGuarded: boolean
): void {
  const res = world.resonance;
  if (res.activeMark && res.activeMark.enemyId === enemy.id) {
    res.activeMark = null;
    res.status = res.cooldownTimer > 0 ? 'on_cooldown' : 'idle';
  }
  enemy.aiState = 'ko';
  enemy.stateTimer = 0.55;
  enemy.stateDuration = 0.55;
  enemy.koProgress = 0.01;
  enemy.vx = 0;
  enemy.vz = 0;

  if (enemy.archetype === 'curator_decoy') {
    world.events.push({
      type: 'curator_decoy_eliminated',
      x: enemy.x,
      z: enemy.z,
      enemyId: enemy.id,
    });
  }

  if (enemy.archetype === 'resonance_warden') {
    severConductorTether(world, enemy);
  }

  if (enemy.modifier === 'volatile') {
    if (!world.artilleryZones) {
      world.artilleryZones = [];
    }
    world.artilleryZones.push({
      id: `volatile-${enemy.id}-${Math.round(world.elapsedTime * 100)}`,
      x: enemy.x,
      z: enemy.z,
      radius: 3.4,
      remainingTimer: 1.0,
      maxDuration: 1.0,
      damage: 24,
      sourceEnemyId: enemy.id,
      kind: 'volatile_core',
    });
  }

  const bossState =
    world.boss && world.boss.id === enemy.id ? world.boss : null;
  awardWeaponMasteryXp(world, world.player.equippedWeaponId, bossState ? 12 : 4);
  if (bossState && !bossState.defeatTriggered) {
    bossState.defeatTriggered = true;
    bossState.hp = 0;
    bossState.aiState = 'ko';
    bossState.stateDuration = 0.55;
    bossState.stateTimer = 0.55;
    bossState.koProgress = 0.01;
    bossState.activeAttack = null;
    bossState.shockwaveActive = false;
    bossState.coreExposed = false;
    bossState.vx = 0;
    bossState.vz = 0;
    bossState.statusLabel =
      bossState.id === 'the-choir'
        ? 'THE CHOIR SILENCED · HARMONIC MATRIX OFFLINE'
        : bossState.id === 'the-curator'
          ? 'THE CURATOR DECOMMISSIONED · ARCHIVE PATHWAY CLEAR'
          : bossState.id === 'matron-v'
            ? 'MATRON-V NEUTRALIZED · CHRONICLE LOOM ACCESS UNLOCKED'
            : bossState.id === 'warden-prime'
              ? 'WARDEN PRIME SUBDUED · SOVEREIGN LOOM MATRIX EXPOSED'
              : bossState.id === 'echo-zero'
                ? 'ECHO-ZERO SHATTERED · PARADOX BREAK ENDING UNLOCKED'
                : 'HELIX-04 NEUTRALIZED · CONTAINMENT CORE OFFLINE';

    const pxDefeat = ensureParadoxState(world);
    pxDefeat.killCamTimer = 1.2;
    world.events.push({
      type: 'boss_killcam_triggered',
      x: enemy.x,
      z: enemy.z,
      enemyId: bossState.id,
    });
    if (!pxDefeat.bossTookDamageThisFight) {
      unlockChronoAchievement(world, 'untouchable_warden');
    }
    if (hasAnyActiveMutator(pxDefeat.mutators)) {
      unlockChronoAchievement(world, 'mutator_daredevil');
    }
    if (bossState.id === 'echo-zero') {
      if (!world.progression) {
        world.progression = createInitialWeaponProgressionState();
      }
      world.progression.paradoxEndingUnlocked = true;
      world.progression.echoZeroDefeatedCount =
        (world.progression.echoZeroDefeatedCount ?? 0) + 1;
      world.progression.memoryFragments = Math.min(
        999,
        world.progression.memoryFragments + 5
      );
      world.progression.lastActionMessage =
        'PARADOX BREAK UNLOCKED · +5 MEMORY FRAGMENTS · PARADOX PRISM SKIN READY';
      unlockChronoAchievement(world, 'paradox_breaker');
      world.events.push({
        type: 'echo_zero_defeated',
        x: enemy.x,
        z: enemy.z,
        enemyId: bossState.id,
        amount: 5,
      });
    }

    for (let k = 0; k < world.enemies.length; k++) {
      const other = world.enemies[k];
      if (other.id !== enemy.id && other.hp > 0 && other.aiState !== 'ko') {
        other.hp = 0;
        other.aiState = 'ko';
        other.stateDuration = 0.45;
        other.stateTimer = 0.45;
        other.koProgress = 0.01;
        other.vx = 0;
        other.vz = 0;
      }
    }
    if (world.curator.active) {
      world.curator.traces = [];
      world.curator.decoyIds = [];
    }
    if (world.matron.active) {
      world.matron.chronoSeverActive = false;
    }

    const defeatedBossMasteryId = mapBossIdToMasteryTargetId(bossState.id);
    const masteryTargetsForDefeat: import('./types.ts').MasteryTargetId[] = [];
    if (defeatedBossMasteryId) {
      masteryTargetsForDefeat.push(defeatedBossMasteryId);
    }
    if (world.run.mode === 'campaign' && bossState.id !== 'echo-zero') {
      masteryTargetsForDefeat.push(
        mapChapterToSectorMasteryId(getChapterForBossId(bossState.id as BossId))
      );
    }
    if (world.run.mode !== 'recursion' && masteryTargetsForDefeat.length > 0) {
      recordWorldCombatMasteryOnVictory(world, masteryTargetsForDefeat);
    }

    if (world.run.mode === 'boss_gauntlet' && world.gauntlet?.active) {
      advanceBossGauntletAfterDefeat(world, enemy.x, enemy.z, bossState.phase);
    } else if (world.run.mode === 'recursion') {
      world.events.push({
        type: 'boss_defeated',
        x: enemy.x,
        z: enemy.z,
        enemyId: enemy.id,
        bossPhase: bossState.phase,
      });
      completeRecursionLoopAndOpenDraft(world);
    } else {
      const defeatCommKey: NarrativeCommKey =
        bossState.id === 'the-choir'
          ? 'chapter2_defeat'
          : bossState.id === 'the-curator'
            ? 'chapter3_defeat'
            : bossState.id === 'matron-v'
              ? 'chapter4_defeat'
              : bossState.id === 'warden-prime'
                ? 'warden_prime_defeat'
                : 'chapter1_defeat';
      triggerNarrativeTransmission(world, defeatCommKey, true);

      if (world.run.mode === 'campaign') {
        const bossChapter = getChapterForBossId(bossState.id as BossId);
        world.run.chapter = bossChapter;
        if (!world.run.isChapterReplay) {
          if (bossChapter === 'chapter_1_helix') {
            world.run.completedChapters = addUniqueChapter(
              world.run.completedChapters,
              'prologue'
            );
            world.run.recoveredLogs = addUniqueString(
              world.run.recoveredLogs ?? [],
              'LOG-00'
            );
          }
          if (bossState.id !== 'warden-prime') {
            world.run.completedChapters = addUniqueChapter(
              world.run.completedChapters,
              bossChapter
            );
          }
          const recoveredLogId =
            bossState.id === 'the-choir'
              ? 'LOG-02'
              : bossState.id === 'the-curator'
                ? 'LOG-03'
                : bossState.id === 'matron-v' || bossState.id === 'warden-prime'
                  ? 'LOG-04'
                  : 'LOG-01';
          world.run.recoveredLogs = addUniqueString(
            world.run.recoveredLogs ?? [],
            recoveredLogId
          );
          let nextChap: CampaignChapterId | null = null;
          if (bossState.id === 'helix-04') {
            nextChap = 'chapter_2_choir';
            grantProgressionReward(world, 'chapter_1_helix_defeated');
            unlockPlayerWeapon(world, 'grav_breaker');
          } else if (bossState.id === 'the-choir') {
            nextChap = 'chapter_3_curator';
            grantProgressionReward(world, 'chapter_2_choir_defeated');
          } else if (bossState.id === 'the-curator') {
            nextChap = 'chapter_4_matron';
            grantProgressionReward(world, 'chapter_3_curator_defeated');
          } else if (bossState.id === 'matron-v') {
            nextChap = 'chapter_5_loom';
            grantProgressionReward(world, 'chapter_4_matron_defeated');
          }
          if (nextChap) {
            world.run.pendingNextChapter = nextChap;
            world.run.unlockedChapters = addUniqueChapter(
              world.run.unlockedChapters,
              nextChap
            );
          }
          const prevCoreCount = world.progression?.unlockedBossCores?.length ?? 0;
          syncUnlockedBossCoresFromCampaign(world);
          if ((world.progression?.unlockedBossCores?.length ?? 0) > prevCoreCount) {
            world.events.push({
              type: 'boss_core_unlocked',
              x: enemy.x,
              z: enemy.z,
              amount: 0,
            });
          }
        } else {
          world.run.pendingNextChapter = null;
        }
      } else {
        world.run.pendingNextChapter = null;
      }

      if (bossState.id === 'warden-prime' && world.run.mode === 'campaign') {
        world.loom = createInitialChronicleLoomState(true);
        world.encounterMode = 'standard';
        world.run.stage = 'chronicle_loom';
        world.run.checkpointNotice =
          'WARDEN PRIME SUBDUED // SELECT FINAL DIRECTIVE: [1] SILENCE · [2] WITNESS · [3] CONTINUITY';
        world.run.checkpointNoticeTimer = 6.0;
        advanceMissionAndExplorationSystem(world);
        clearEchoState(world, 'outcome');
        world.events.push({
          type: 'boss_defeated',
          x: enemy.x,
          z: enemy.z,
          enemyId: enemy.id,
          bossPhase: bossState.phase,
        });
      } else if (
        world.expedition?.enabled &&
        world.run.mode === 'campaign' &&
        !world.run.isChapterReplay &&
        world.run.pendingNextChapter
      ) {
        advanceMissionAndExplorationSystem(world);
        world.events.push({
          type: 'boss_defeated',
          x: enemy.x,
          z: enemy.z,
          enemyId: enemy.id,
          bossPhase: bossState.phase,
        });
        unlockExpeditionTransitAirlock(world, world.run.pendingNextChapter);
      } else {
        world.outcome = 'victory';
        world.run.stage = 'completed';
        world.outcomeDelayTimer = 0.5;
        advanceMissionAndExplorationSystem(world);
        world.frozenSummary = buildRunSummary(world);
        clearEchoState(world, 'outcome');

        world.events.push({
          type: 'boss_defeated',
          x: enemy.x,
          z: enemy.z,
          enemyId: enemy.id,
          bossPhase: bossState.phase,
        });
        world.events.push({
          type: 'encounter_victory',
          x: world.player.x,
          z: world.player.z,
        });
      }
    }
  }

  world.hitstopTimer = Math.max(world.hitstopTimer, 0.085);
  world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.65);
  world.events.push({
    type: 'enemy_killed',
    x: enemy.x,
    z: enemy.z,
    amount: finalDamage,
    isCriticalOrVulnerable: isVulnerable,
    isHeavy,
    isGuarded,
    enemyId: enemy.id,
  });

  if (world.player.integrity > 0 && world.player.actionState !== 'dead') {
    const adrMods = getAdrenalineModifiers(world.player.adrenalineScore);
    const defeatRecMods = getActiveRecursionModifiers(world);
    const killHealTotal = adrMods.siphonOnKillHp + defeatRecMods.killHealBonus;
    if (killHealTotal > 0) {
      world.player.integrity = Math.min(
        world.player.maxIntegrity,
        world.player.integrity + killHealTotal
      );
      world.player.ghostIntegrity = Math.max(
        world.player.ghostIntegrity,
        world.player.integrity
      );
    }
    if (defeatRecMods.killFluxBonus > 0) {
      world.player.flux = Math.min(
        world.player.maxFlux,
        world.player.flux + defeatRecMods.killFluxBonus
      );
    }
    if (
      defeatRecMods.killWardBonus > 0 &&
      world.chronoAegis &&
      world.chronoAegis.maxWard > 0
    ) {
      world.chronoAegis.ward = Math.min(
        world.chronoAegis.maxWard,
        world.chronoAegis.ward + defeatRecMods.killWardBonus
      );
    }
    const koAdr = applyAdrenalineDelta(world.player, ADRENALINE_GAINS.enemyKo);
    if (koAdr.tierDelta !== 0) {
      world.events.push({
        type: 'adrenaline_tier_changed',
        x: world.player.x,
        z: world.player.z,
        amount: koAdr.nextTier,
        postureBonus: koAdr.tierDelta,
      });
    }
  }
}

export function triggerBossDefeat(world: WorldState): boolean {
  if (!world.boss) return false;
  const enemy = world.enemies.find((e) => e.id === world.boss!.id);
  if (!enemy) return false;
  enemy.hp = 0;
  world.boss.hp = 0;
  handleEnemyZeroHpDefeat(world, enemy, 0, false, false, false);
  return true;
}

export function applyDamageToDestructibleObstacle(
  world: WorldState,
  obs: ObstacleCollider,
  damage: number,
  rewardFluxToPlayer = false
): void {
  if (!obs.destructible || obs.disabled) return;
  const maxHp = Math.max(1, obs.maxHp ?? 45);
  const applied = Math.max(1, Math.round(damage));
  const nextHp = Math.max(0, (obs.hp ?? maxHp) - applied);
  obs.hp = nextHp;
  if (nextHp > 0) {
    world.events.push({
      type: 'obstacle_damaged',
      x: obs.x,
      z: obs.z,
      amount: applied,
      obstacleId: obs.id,
    });
    return;
  }

  obs.disabled = true;
  const rigMods = getPlayerRigModifiers(world);
  if (rewardFluxToPlayer) {
    world.player.flux = Math.min(
      world.player.maxFlux,
      world.player.flux + rigMods.crateFluxReward
    );
    if (rigMods.crateSurgeDuration > 0) {
      world.player.surgeTimer = Math.max(
        world.player.surgeTimer ?? 0,
        rigMods.crateSurgeDuration
      );
    }
  }
  if (!world.fluxPools) {
    world.fluxPools = [];
  }
  world.fluxPools.push({
    id: `flux-pool-${obs.id}-${Math.round(world.elapsedTime * 100)}`,
    x: obs.x,
    z: obs.z,
    radius: 3.4,
    remainingTime: 7.0,
    maxDuration: 7.0,
    sourceObstacleId: obs.id,
  });
  world.hitstopTimer = Math.max(world.hitstopTimer, 0.045);
  world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.32);
  world.events.push({
    type: 'obstacle_destroyed',
    x: obs.x,
    z: obs.z,
    obstacleId: obs.id,
  });
  world.events.push({
    type: 'flux_pool_spawned',
    x: obs.x,
    z: obs.z,
    obstacleId: obs.id,
  });

  // Kinetic shock overload pulse (3.8m radius, 18 dmg + 14 stagger to nearby non-decoy enemies)
  const blastRadius = 3.8;
  for (let i = 0; i < world.enemies.length; i++) {
    const e = world.enemies[i];
    if (e.aiState === 'ko' || e.hp <= 0 || e.isDecoy) continue;
    if (
      world.boss &&
      world.boss.id === e.id &&
      (world.boss.aiState === 'dormant' ||
        world.boss.aiState === 'phase_transition' ||
        world.boss.aiState === 'ko' ||
        world.boss.aiState === 'defeated')
    ) {
      continue;
    }
    const dist = Math.hypot(e.x - obs.x, e.z - obs.z);
    if (dist > blastRadius + e.radius) continue;
    const shockDmg = 18;
    e.hp = Math.max(0, e.hp - shockDmg);
    e.hitFlashTimer = Math.max(e.hitFlashTimer, 0.14);
    e.stagger = Math.min(e.maxStagger, e.stagger + 14);
    world.stats.damageDealt += shockDmg;
    const bossState = world.boss && world.boss.id === e.id ? world.boss : null;
    if (bossState) {
      checkAndTriggerBossPhase2(world, bossState, e);
    }
    if (e.hp <= 0) {
      handleEnemyZeroHpDefeat(world, e, shockDmg, true, true, false);
    } else {
      world.events.push({
        type: 'player_hit_enemy',
        x: e.x,
        z: e.z,
        amount: shockDmg,
        isCriticalOrVulnerable: true,
        isHeavy: true,
        isGuarded: false,
        enemyId: e.id,
      });
    }
    if (bossState) {
      bossState.hp = e.hp;
      bossState.stagger = e.stagger;
      bossState.hitFlashTimer = e.hitFlashTimer;
    }
  }
}

export function advanceArenaBoostPads(world: WorldState, dt: number): void {
  const p = world.player;
  if (p) {
    p.surgeTimer = Math.max(0, (p.surgeTimer ?? 0) - Math.max(0, dt));
  }
  if (
    world.appState !== 'playing' ||
    world.outcome !== 'none' ||
    !world.boostPads ||
    dt <= 0
  ) {
    return;
  }
  const rigMods = getPlayerRigModifiers(world);
  const padProtoMods = getPlayerProtocolModifiers(world);
  for (let i = 0; i < world.boostPads.length; i++) {
    const pad = world.boostPads[i];
    pad.cooldown = Math.max(0, pad.cooldown - dt);
    if (
      pad.cooldown <= 0 &&
      p.actionState !== 'dead' &&
      Math.hypot(p.x - pad.x, p.z - pad.z) <= pad.radius
    ) {
      pad.cooldown = pad.maxCooldown;
      p.surgeTimer = Math.max(
        p.surgeTimer ?? 0,
        1.6 * padProtoMods.surgeDurationMultiplier
      );
      p.dodgeCooldownTimer = Math.max(0, p.dodgeCooldownTimer - 0.5);
      p.flux = Math.min(p.maxFlux, p.flux + 8);
      if (rigMods.boostPadIntegrityBonus > 0) {
        p.integrity = Math.min(
          p.maxIntegrity,
          p.integrity + rigMods.boostPadIntegrityBonus
        );
        p.ghostIntegrity = Math.max(p.ghostIntegrity, p.integrity);
      }
      world.events.push({
        type: 'boost_pad_triggered',
        x: pad.x,
        z: pad.z,
        boostPadId: pad.id,
      });
    }
  }
}

export function advanceArenaFluxPools(world: WorldState, dt: number): void {
  if (!world.fluxPools || world.fluxPools.length === 0 || dt <= 0) {
    return;
  }
  const p = world.player;
  const canHarvest =
    world.appState === 'playing' &&
    world.outcome === 'none' &&
    p &&
    p.actionState !== 'dead';
  const rigMods = getPlayerRigModifiers(world);
  const fluxDampenMult =
    p && (p.fluxDampenedTimer ?? 0) > 0
      ? GAME_CONFIG.enemies.null_weaver.fluxDampenRegenMult
      : 1.0;

  let writeIdx = 0;
  for (let i = 0; i < world.fluxPools.length; i++) {
    const pool = world.fluxPools[i];
    pool.remainingTime = Math.max(0, pool.remainingTime - dt);
    if (pool.remainingTime <= 0) continue;
    if (canHarvest && Math.hypot(p.x - pool.x, p.z - pool.z) <= pool.radius) {
      p.flux = Math.min(p.maxFlux, p.flux + 9 * fluxDampenMult * dt);
      if (rigMods.fluxPoolIntegrityPerSec > 0) {
        p.integrity = Math.min(
          p.maxIntegrity,
          p.integrity + rigMods.fluxPoolIntegrityPerSec * dt
        );
        p.ghostIntegrity = Math.max(p.ghostIntegrity, p.integrity);
      }
    }
    world.fluxPools[writeIdx++] = pool;
  }
  world.fluxPools.length = writeIdx;
}

export function applyEnemyModifier(
  enemy: EnemyState,
  modifier: EnemyModifierId | null
): void {
  enemy.modifier = modifier;
  if (modifier === 'phase_shielded') {
    enemy.maxStagger = Math.round(enemy.maxStagger * 1.25);
  }
}

export function isEnemyProtectedByConductor(
  world: WorldState,
  enemyId: string
): boolean {
  for (let i = 0; i < world.enemies.length; i++) {
    const e = world.enemies[i];
    if (
      e.archetype === 'resonance_warden' &&
      e.hp > 0 &&
      e.aiState !== 'ko' &&
      e.aiState !== 'staggered' &&
      e.tetherTargetId === enemyId
    ) {
      return true;
    }
  }
  return false;
}

export function severConductorTether(
  world: WorldState,
  conductor: EnemyState
): boolean {
  const targetId = conductor.tetherTargetId;
  if (!targetId) return false;
  conductor.tetherTargetId = null;

  const linked = world.enemies.find(
    (e) => e.id === targetId && e.hp > 0 && e.aiState !== 'ko'
  );
  if (!linked) return false;

  const breakStagger = GAME_CONFIG.enemies.resonance_warden.tetherBreakStagger;
  linked.stagger = Math.min(linked.maxStagger, linked.stagger + breakStagger);
  linked.hitFlashTimer = Math.max(linked.hitFlashTimer, 0.2);

  if (
    linked.stagger >= linked.maxStagger &&
    linked.aiState !== 'staggered' &&
    !isBossArchetype(linked.archetype)
  ) {
    const linkedCfg = GAME_CONFIG.enemies[linked.archetype];
    linked.aiState = 'staggered';
    linked.stateDuration = linkedCfg.staggeredDuration;
    linked.stateTimer = linkedCfg.staggeredDuration;
    linked.stagger = 0;
    linked.vx = 0;
    linked.vz = 0;
    linked.telegraphLocked = false;
  }

  world.events.push({
    type: 'conductor_tether_severed',
    x: linked.x,
    z: linked.z,
    originX: conductor.x,
    originZ: conductor.z,
    enemyId: linked.id,
    amount: breakStagger,
  });
  return true;
}

export function advanceConductorTethers(world: WorldState, dt: number): void {
  if (dt <= 0 || world.enemies.length === 0) return;
  const cfg = GAME_CONFIG.enemies.resonance_warden;

  for (let i = 0; i < world.enemies.length; i++) {
    const conductor = world.enemies[i];
    if (conductor.archetype !== 'resonance_warden') continue;

    if (
      conductor.hp <= 0 ||
      conductor.aiState === 'ko' ||
      conductor.aiState === 'staggered' ||
      (conductor.pinnedTimer ?? 0) > 0
    ) {
      if (conductor.tetherTargetId) {
        severConductorTether(world, conductor);
      }
      continue;
    }

    // Validate existing target or choose best alive non-conductor ally in range
    let chosen: EnemyState | null = null;
    if (conductor.tetherTargetId) {
      const existing = world.enemies.find(
        (e) =>
          e.id === conductor.tetherTargetId &&
          e.hp > 0 &&
          e.aiState !== 'ko' &&
          e.archetype !== 'resonance_warden'
      );
      if (
        existing &&
        Math.hypot(existing.x - conductor.x, existing.z - conductor.z) <=
          cfg.tetherRange + 1.0
      ) {
        chosen = existing;
      }
    }

    if (!chosen) {
      let bestScore = Infinity;
      for (let j = 0; j < world.enemies.length; j++) {
        const ally = world.enemies[j];
        if (
          ally.id === conductor.id ||
          ally.archetype === 'resonance_warden' ||
          ally.hp <= 0 ||
          ally.aiState === 'ko'
        ) {
          continue;
        }
        const dist = Math.hypot(ally.x - conductor.x, ally.z - conductor.z);
        if (dist <= cfg.tetherRange) {
          const hpRatio = ally.hp / Math.max(1, ally.maxHp);
          const score = hpRatio * 6 + dist * 0.4;
          if (score < bestScore) {
            bestScore = score;
            chosen = ally;
          }
        }
      }
    }

    conductor.tetherTargetId = chosen ? chosen.id : null;
    if (chosen && chosen.hp < chosen.maxHp) {
      chosen.hp = Math.min(chosen.maxHp, chosen.hp + cfg.tetherHealPerSec * dt);
      chosen.ghostHp = Math.max(chosen.ghostHp, chosen.hp);
    }
  }
}

export function advanceArtilleryZones(world: WorldState, dt: number): void {
  if (!world.artilleryZones || world.artilleryZones.length === 0 || dt <= 0) {
    return;
  }
  const p = world.player;
  const zones = world.artilleryZones;
  let writeIdx = 0;

  for (let i = 0; i < zones.length; i++) {
    const zone = zones[i];
    zone.remainingTimer = Math.max(0, zone.remainingTimer - dt);
    if (zone.remainingTimer > 0) {
      zones[writeIdx++] = zone;
      continue;
    }

    // Detonate!
    const distToPlayer = Math.hypot(p.x - zone.x, p.z - zone.z);
    if (
      p.actionState !== 'dead' &&
      distToPlayer <= zone.radius + GAME_CONFIG.player.radius
    ) {
      applyDamageToPlayer(world, zone.damage, undefined);
    }

    if (zone.kind === 'volatile_core') {
      // Friendly-fire shockwave rewards positioning volatile enemies near allies!
      for (let j = 0; j < world.enemies.length; j++) {
        const other = world.enemies[j];
        if (
          other.id === zone.sourceEnemyId ||
          other.hp <= 0 ||
          other.aiState === 'ko'
        ) {
          continue;
        }
        const distEnemy = Math.hypot(other.x - zone.x, other.z - zone.z);
        if (distEnemy <= zone.radius + other.radius) {
          const blastDmg = 28;
          other.hp = Math.max(0, other.hp - blastDmg);
          other.hitFlashTimer = 0.22;
          other.stagger = Math.min(other.maxStagger, other.stagger + 30);
          world.stats.damageDealt += blastDmg;
          if (other.hp <= 0) {
            handleEnemyZeroHpDefeat(world, other, blastDmg, false, true, false);
          } else if (
            other.stagger >= other.maxStagger &&
            other.aiState !== 'staggered' &&
            !isBossArchetype(other.archetype)
          ) {
            const otherCfg = GAME_CONFIG.enemies[other.archetype];
            other.aiState = 'staggered';
            other.stateDuration = otherCfg.staggeredDuration;
            other.stateTimer = otherCfg.staggeredDuration;
            other.stagger = 0;
            other.vx = 0;
            other.vz = 0;
            if (other.archetype === 'resonance_warden') {
              severConductorTether(world, other);
            }
          }
        }
      }
      world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.34);
      world.events.push({
        type: 'volatile_core_detonated',
        x: zone.x,
        z: zone.z,
        enemyId: zone.sourceEnemyId,
        amount: zone.damage,
      });
    } else {
      world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.24);
      world.events.push({
        type: 'chrono_mortar_detonated',
        x: zone.x,
        z: zone.z,
        enemyId: zone.sourceEnemyId,
        amount: zone.damage,
      });
    }
  }

  zones.length = writeIdx;
}

function performPlayerMeleeHitCheck(world: WorldState, isHeavy: boolean): void {
  const p = world.player;
  const isBreaker = p.equippedWeaponId === 'grav_breaker';
  const isScythe = p.equippedWeaponId === 'chrono_scythe';
  const breakerCfg = GAME_CONFIG.weapons.grav_breaker;
  const scytheCfg = GAME_CONFIG.weapons.chrono_scythe;
  const breakerUpgrade = getEquippedWeaponUpgrade(world, 'grav_breaker');
  const isBreakerOverclocked = isUpgradeOverclocked(
    breakerUpgrade,
    world.progression?.overclockedUpgrades
  );
  const scytheUpgrade = getEquippedWeaponUpgrade(world, 'chrono_scythe');
  const isScytheOverclocked = isUpgradeOverclocked(
    scytheUpgrade,
    world.progression?.overclockedUpgrades
  );
  const koMeleeMods = getActiveWeaponOverchargeModifiers(
    world.kineticOvercharge,
    p.equippedWeaponId
  );
  const range = isBreaker
    ? isHeavy
      ? breakerCfg.heavySlam.range +
        (breakerUpgrade === 'breaker_singularity_coil'
          ? GAME_CONFIG.weapons.upgrades.breaker_singularity_coil.heavyRangeBonus +
            (isBreakerOverclocked ? 0.9 : 0)
          : 0)
      : breakerCfg.lightSlam.range
    : isScythe
      ? (isHeavy ? scytheCfg.heavyVortex.range : scytheCfg.lightSweep.range) +
        (scytheUpgrade === 'scythe_rift_reaper'
          ? GAME_CONFIG.weapons.upgrades.scythe_rift_reaper.extraRange +
            (isScytheOverclocked ? 0.35 : 0)
          : 0)
      : isHeavy
        ? GAME_CONFIG.player.heavyAttack.range
        : GAME_CONFIG.player.lightAttack.range;
  const arcRadians = isBreaker
    ? isHeavy
      ? breakerUpgrade === 'breaker_singularity_coil'
        ? GAME_CONFIG.weapons.upgrades.breaker_singularity_coil.fullRadialArc
        : breakerCfg.heavySlam.arcRadians
      : breakerCfg.lightSlam.arcRadians
    : isScythe
      ? isHeavy
        ? scytheCfg.heavyVortex.arcRadians
        : scytheCfg.lightSweep.arcRadians
      : isHeavy
        ? GAME_CONFIG.player.heavyAttack.arcRadians
        : GAME_CONFIG.player.lightAttack.arcRadians;

  const edgeUpgrade = getEquippedWeaponUpgrade(world, 'chrono_edge');
  const isEdgeOverclocked = isUpgradeOverclocked(
    edgeUpgrade,
    world.progression?.overclockedUpgrades
  );
  let baseDamage = isBreaker
    ? isHeavy
      ? p.isEmpoweredHeavy
        ? breakerCfg.heavySlam.empoweredDamage
        : breakerCfg.heavySlam.baseDamage
      : (breakerCfg.lightSlam.damage[p.comboIndex] ?? 26)
    : isScythe
      ? isHeavy
        ? p.isEmpoweredHeavy
          ? scytheCfg.heavyVortex.empoweredDamage
          : scytheCfg.heavyVortex.baseDamage
        : (scytheCfg.lightSweep.damage[p.comboIndex] ?? 22)
      : isHeavy
        ? p.isEmpoweredHeavy
          ? GAME_CONFIG.player.heavyAttack.empoweredDamage
          : GAME_CONFIG.player.heavyAttack.baseDamage
        : (GAME_CONFIG.player.lightAttack.damage[p.comboIndex] ?? 16);

  let staggerAmount = isBreaker
    ? isHeavy
      ? p.isEmpoweredHeavy
        ? breakerCfg.heavySlam.empoweredStagger
        : breakerCfg.heavySlam.stagger
      : (breakerCfg.lightSlam.stagger[p.comboIndex] ?? 26)
    : isScythe
      ? isHeavy
        ? p.isEmpoweredHeavy
          ? scytheCfg.heavyVortex.empoweredStagger
          : scytheCfg.heavyVortex.stagger
        : (scytheCfg.lightSweep.stagger[p.comboIndex] ?? 18)
      : isHeavy
        ? p.isEmpoweredHeavy
          ? GAME_CONFIG.player.heavyAttack.empoweredStagger
          : GAME_CONFIG.player.heavyAttack.stagger
        : (GAME_CONFIG.player.lightAttack.stagger[p.comboIndex] ?? 12);

  // Apply Style Rank + Echo Twin-Sync + Chrono Momentum + Chrono Nexus + Chronicle bonuses on melee hits
  const styleMult = getStyleRankMeta(world.ascension?.style?.tier ?? 'D').damageBonusMult;
  const tsMeleeMods = getTwinSyncModifiers(world.twinSync);
  const momMeleeMods =
    (world.momentum?.tier ?? 0) >= 1
      ? getChronoMomentumModifiers(world.momentum)
      : { damageMult: 1.0, styleBonusMult: 1.0, weakpointActive: false };
  const nxMeleeMods = getChronoNexusModifiers(world.nexus);
  const chronMeleeMods = computeChroniclePassiveBonus(
    world.run?.recoveredLogs,
    world.run?.completedChapters
  );
  const wResMeleeMods = getActiveWeaponResonanceModifiers(world.weaponResonance);
  const globalMasteryMelee = computeGlobalArsenalMasteryBonus(
    world.progression?.weaponMasteryXp
  );
  const meleeStanceMods = computeStanceDoctrineModifiers(
    world.exploration?.resolvedStoryChoices
  );
  const meleeMythicBonus = computeEquippedMythicBonus(
    getEquippedWeaponUpgrade(world, p.equippedWeaponId),
    world.progression?.awakenedUpgrades
  );
  const meleeRigSynergy = getPlayerRigSetSynergy(world);
  const meleeAttunement = computeWeaponCoreAttunement(
    p.equippedWeaponId,
    world.progression?.equippedBossCore,
    world.progression?.transcendedBossCores
  );
  const meleeSynergyDmgMult =
    styleMult *
    tsMeleeMods.damageMult *
    momMeleeMods.damageMult *
    nxMeleeMods.damageMult *
    chronMeleeMods.damageMult *
    wResMeleeMods.damageMult *
    globalMasteryMelee.damageMult *
    meleeStanceMods.damageMult *
    meleeMythicBonus.damageMult *
    meleeRigSynergy.damageMultiplier *
    meleeAttunement.damageMultiplier;
  if (meleeSynergyDmgMult > 1) {
    baseDamage = Math.max(1, Math.round(baseDamage * meleeSynergyDmgMult));
  }
  const meleeSynergyStagMult =
    tsMeleeMods.staggerMult *
    wResMeleeMods.staggerMult *
    globalMasteryMelee.staggerMult *
    meleeStanceMods.staggerMult *
    meleeMythicBonus.staggerMult *
    meleeAttunement.staggerMultiplier;
  if (meleeSynergyStagMult > 1) {
    staggerAmount = Math.round(staggerAmount * meleeSynergyStagMult);
  }

  // Chrono Scythe Heavy Temporal Vortex Pull (+ v3.6.0 Sovereign Reaper Wave)
  if (isScythe && isHeavy && !p.attackHitIds.includes('__scythe_sovereign_wave__')) {
    p.attackHitIds.push('__scythe_sovereign_wave__');
    let pulledAny = false;
    const pullRadius =
      scytheCfg.heavyVortex.vortexPullRadius + koMeleeMods.vortexPullBonus;
    const pullStrength =
      scytheCfg.heavyVortex.vortexPullStrength + (koMeleeMods.isActive ? 1.1 : 0);
    for (let vi = 0; vi < world.enemies.length; vi++) {
      const target = world.enemies[vi];
      if (target.hp <= 0 || target.aiState === 'ko') continue;
      if (world.boss && world.boss.id === target.id) continue;
      const vdx = p.x - target.x;
      const vdz = p.z - target.z;
      const vDist = Math.hypot(vdx, vdz);
      if (vDist > 1.8 && vDist <= pullRadius) {
        const pull = Math.min(pullStrength, vDist - 1.5);
        target.x += (vdx / vDist) * pull;
        target.z += (vdz / vDist) * pull;
        pulledAny = true;
      }
    }
    if (pulledAny) {
      world.events.push({
        type: 'scythe_vortex_pull',
        x: p.x,
        z: p.z,
        weaponId: 'chrono_scythe',
      });
    }
    if (meleeAttunement.scytheWaveRadius > 0) {
      applyBossCoreRadialPulse(
        world,
        p.x,
        p.z,
        meleeAttunement.scytheWaveRadius,
        meleeAttunement.scytheWaveDamage,
        meleeAttunement.scytheWaveStagger
      );
    }
  }

  // v3.6.0 Grav-Breaker × Curator Singularity Maul: 3rd Light Slam & Heavy Slam pull + [9] Charge
  if (
    isBreaker &&
    (isHeavy || p.comboIndex >= 2) &&
    meleeAttunement.slamPullRadius > 0 &&
    !p.attackHitIds.includes('__breaker_slam_once__')
  ) {
    p.attackHitIds.push('__breaker_slam_once__');
    let pulledSlamCount = 0;
    for (let bi = 0; bi < world.enemies.length; bi++) {
      const cand = world.enemies[bi];
      if (cand.hp <= 0 || cand.aiState === 'ko') continue;
      const bdx = p.x - cand.x;
      const bdz = p.z - cand.z;
      const bDist = Math.hypot(bdx, bdz);
      if (bDist > 0.35 && bDist <= meleeAttunement.slamPullRadius + cand.radius) {
        const pullScale = world.boss && world.boss.id === cand.id ? 0.35 : 1.0;
        const step = Math.min(bDist * 0.65, 1.45 * pullScale);
        cand.x += (bdx / bDist) * step;
        cand.z += (bdz / bDist) * step;
        pulledSlamCount += 1;
      }
    }
    if (meleeAttunement.slamConfluenceBonus > 0) {
      grantConfluenceCharge(world, meleeAttunement.slamConfluenceBonus);
    }
    if (pulledSlamCount > 0) {
      world.events.push({
        type: 'boss_core_pulse',
        x: p.x,
        z: p.z,
        amount: pulledSlamCount,
      });
    }
  }

  if (isBreaker) {
    if (breakerUpgrade === 'breaker_seismic_core') {
      const seisCfg = GAME_CONFIG.weapons.upgrades.breaker_seismic_core;
      const ocDmgMult = isBreakerOverclocked ? 1.16 : 1.0;
      const ocStagMult = isBreakerOverclocked ? 1.16 : 1.0;
      baseDamage = Math.max(1, Math.round(baseDamage * seisCfg.damageMultiplier * ocDmgMult));
      staggerAmount = Math.round(staggerAmount * seisCfg.staggerMultiplier * ocStagMult);
    } else if (breakerUpgrade === 'breaker_singularity_coil' && isHeavy) {
      const coilCfg = GAME_CONFIG.weapons.upgrades.breaker_singularity_coil;
      const ocDmgMult = isBreakerOverclocked ? 1.18 : 1.0;
      baseDamage = Math.max(
        1,
        Math.round(baseDamage * coilCfg.heavyDamageMultiplier * ocDmgMult)
      );
    }
  } else if (isScythe) {
    if (scytheUpgrade === 'scythe_rift_reaper') {
      const reapCfg = GAME_CONFIG.weapons.upgrades.scythe_rift_reaper;
      const ocMult = isScytheOverclocked ? 1.14 : 1.0;
      baseDamage = Math.max(1, Math.round(baseDamage * reapCfg.damageMultiplier * ocMult));
      if (isHeavy) {
        staggerAmount += reapCfg.heavyStaggerBonus + (isScytheOverclocked ? 8 : 0);
      }
    } else if (scytheUpgrade === 'scythe_astral_siphon' && !isHeavy) {
      const sipCfg = GAME_CONFIG.weapons.upgrades.scythe_astral_siphon;
      baseDamage = Math.max(1, Math.round(baseDamage * sipCfg.lightDamageMultiplier));
    }
  } else if (edgeUpgrade === 'edge_breaker_cleave') {
    const cleaveCfg = GAME_CONFIG.weapons.upgrades.edge_breaker_cleave;
    const ocStagMult = isEdgeOverclocked ? 1.18 : 1.0;
    baseDamage = Math.max(1, Math.round(baseDamage * cleaveCfg.damageMultiplier));
    staggerAmount = Math.round(staggerAmount * cleaveCfg.staggerMultiplier * ocStagMult);
  } else if (
    edgeUpgrade === 'edge_harmonic_conductor' &&
    isHeavy &&
    !p.isEmpoweredHeavy
  ) {
    const condCfg = GAME_CONFIG.weapons.upgrades.edge_harmonic_conductor;
    baseDamage = Math.max(
      1,
      Math.round(baseDamage * condCfg.unempoweredHeavyDamageMultiplier)
    );
  }

  const flowDmgMult = p.activeStrikeFlowDamageMult ?? 1;
  const flowStagMult = p.activeStrikeFlowStaggerMult ?? 1;
  const meleeRigMods = getPlayerRigModifiers(world);
  const meleeProtoMods = getPlayerProtocolModifiers(world);
  const meleeMasteryInfo = getActiveWeaponMasteryInfo(world, p.equippedWeaponId);
  const meleeRecMods = getActiveRecursionModifiers(world);
  if (flowDmgMult !== 1) {
    baseDamage = Math.max(1, Math.round(baseDamage * flowDmgMult));
  }
  if (meleeRigMods.surgeDamageMultiplier !== 1) {
    baseDamage = Math.max(
      1,
      Math.round(baseDamage * meleeRigMods.surgeDamageMultiplier)
    );
  }
  const combinedMeleeDmgMult =
    meleeMasteryInfo.damageMultiplier * meleeRecMods.damageMultiplier;
  if (combinedMeleeDmgMult !== 1) {
    baseDamage = Math.max(1, Math.round(baseDamage * combinedMeleeDmgMult));
  }
  if (flowStagMult !== 1) {
    staggerAmount = Math.round(staggerAmount * flowStagMult);
  }
  if (world.activeStoryBlessing === 'posture_edge') {
    staggerAmount = Math.round(staggerAmount * 1.18);
  }
  const combinedMeleeStagMult =
    meleeMasteryInfo.staggerMultiplier * meleeRecMods.staggerMultiplier;
  if (combinedMeleeStagMult !== 1) {
    staggerAmount = Math.round(staggerAmount * combinedMeleeStagMult);
  }
  const singMeleeBoost = consumeSingularityStrikeMultipliers(
    ensureSingularityState(world),
    true
  );
  const totalMeleeDmgBoost = singMeleeBoost.damageMult * koMeleeMods.damageMult;
  const totalMeleeStagBoost = singMeleeBoost.staggerMult * koMeleeMods.staggerMult;
  if (totalMeleeDmgBoost !== 1) {
    baseDamage = Math.max(1, Math.round(baseDamage * totalMeleeDmgBoost));
  }
  if (totalMeleeStagBoost !== 1 || singMeleeBoost.bonusFlatStagger > 0) {
    staggerAmount =
      Math.round(staggerAmount * totalMeleeStagBoost) + singMeleeBoost.bonusFlatStagger;
  }

  evaluateLivePlayerStrikeOnChoirNodes(world, isHeavy);

  for (let o = 0; o < world.obstacles.length; o++) {
    const obs = world.obstacles[o];
    if (!obs.destructible || obs.disabled) continue;
    if (p.attackHitIds.includes(obs.id)) continue;
    const dxObs = obs.x - p.x;
    const dzObs = obs.z - p.z;
    const distObs = Math.hypot(dxObs, dzObs);
    if (distObs > range + obs.radius) continue;
    const angleToObs = Math.atan2(dxObs, dzObs);
    const diffObs = Math.abs(angleDiff(p.rotationY, angleToObs));
    if (
      diffObs <= arcRadians * 0.5 + 0.35 ||
      distObs <= obs.radius + GAME_CONFIG.player.radius + 0.7
    ) {
      p.attackHitIds.push(obs.id);
      applyDamageToDestructibleObstacle(world, obs, baseDamage, true);
    }
  }

  for (let i = 0; i < world.enemies.length; i++) {
    const enemy = world.enemies[i];
    if (enemy.aiState === 'ko' || enemy.hp <= 0) continue;
    if (
      world.boss &&
      world.boss.id === enemy.id &&
      (world.boss.aiState === 'dormant' ||
        world.boss.aiState === 'phase_transition' ||
        world.boss.aiState === 'ko' ||
        world.boss.aiState === 'defeated')
    ) {
      continue;
    }
    if (p.attackHitIds.includes(enemy.id)) continue;

    const envelope = isEnemyWithinMeleeEnvelope(
      p.x,
      p.z,
      p.rotationY,
      range,
      arcRadians,
      enemy
    );
    if (!envelope.withinEnvelope) continue;

    if (!hasMeleeLineOfSight(p.x, p.z, enemy.x, enemy.z, world.obstacles)) {
      continue;
    }

    const dx = enemy.x - p.x;
    const dz = enemy.z - p.z;
    const dist = envelope.dist;

    p.attackHitIds.push(enemy.id);

    const res = world.resonance;
    const effectiveConvFluxCost = getEffectiveConvergenceFluxCost(world);
    res.fluxCost = effectiveConvFluxCost;
    const activeMark = res.activeMark;
    let triggeredConvergence = false;
    let rejectedConvergenceReason: ResonanceOutcome | null = null;

    if (activeMark && activeMark.remainingTime > 0) {
      if (enemy.id !== activeMark.enemyId) {
        rejectedConvergenceReason = 'wrong_target';
        res.lastOutcome = 'wrong_target';
        res.statusMessage = `WRONG TARGET // STRIKE MARKED ${activeMark.enemyName.toUpperCase()} FOR CONVERGENCE`;
      } else if (!isQualifyingConvergenceAttack(p, isHeavy)) {
        rejectedConvergenceReason = 'non_qualifying_attack';
        res.lastOutcome = 'non_qualifying_attack';
        res.statusMessage = 'RESONANCE REQUIRES HEAVY [E] OR 3RD LIGHT FINISHER';
      } else {
        const startedAfterMark =
          p.currentAttackMarkId === activeMark.markId &&
          p.currentAttackStartedAt >= activeMark.createdAt - 1e-6;
        if (!startedAfterMark) {
          rejectedConvergenceReason = 'attack_started_before_mark';
          res.lastOutcome = 'attack_started_before_mark';
          res.statusMessage =
            'ATTACK STARTED BEFORE MARK · INITIATE FOLLOW-UP AFTER ECHO CONTACT';
        } else if (res.cooldownTimer > 0) {
          rejectedConvergenceReason = 'on_cooldown';
          res.lastOutcome = 'on_cooldown';
          res.statusMessage = 'CONVERGENCE RECHARGING · WAIT FOR COOLDOWN';
        } else if (p.flux < effectiveConvFluxCost) {
          rejectedConvergenceReason = 'insufficient_flux';
          res.lastOutcome = 'insufficient_flux';
          res.statusMessage = `INSUFFICIENT FLUX FOR CONVERGENCE (${effectiveConvFluxCost} REQUIRED)`;
        } else {
          triggeredConvergence = true;
        }
      }

      if (rejectedConvergenceReason) {
        world.events.push({
          type: 'resonance_convergence_rejected',
          x: enemy.x,
          z: enemy.z,
          originX: p.x,
          originZ: p.z,
          isHeavy,
          enemyId: enemy.id,
          resonanceOutcome: rejectedConvergenceReason,
        });
      }
    }

    const bossState =
      world.boss && world.boss.id === enemy.id ? world.boss : null;
    const isVulnerable =
      enemy.aiState === 'recovery' ||
      enemy.aiState === 'staggered' ||
      (bossState !== null && bossState.coreExposed);

    let isGuarded = false;
    if (
      (enemy.archetype === 'bastion' || enemy.archetype === 'aegis_sentinel') &&
      !isVulnerable &&
      (!isHeavy || isBreaker)
    ) {
      const angleFromEnemyToPlayer = Math.atan2(p.x - enemy.x, p.z - enemy.z);
      const facingDiff = Math.abs(angleDiff(angleFromEnemyToPlayer, enemy.rotationY));
      const guardArc =
        enemy.archetype === 'aegis_sentinel'
          ? GAME_CONFIG.enemies.aegis_sentinel.frontGuardArc
          : GAME_CONFIG.enemies.bastion.frontGuardArc;
      if (facingDiff <= guardArc * 0.5) {
        isGuarded = true;
      }
    } else if (
      (enemy.archetype === 'helix' || enemy.archetype === 'warden_prime') &&
      !isVulnerable &&
      !isHeavy &&
      (!bossState || bossState.aiState !== 'phase_transition')
    ) {
      const angleFromEnemyToPlayer = Math.atan2(p.x - enemy.x, p.z - enemy.z);
      const facingDiff = Math.abs(angleDiff(angleFromEnemyToPlayer, enemy.rotationY));
      const guardArc =
        enemy.archetype === 'warden_prime'
          ? GAME_CONFIG.wardenPrime.frontGuardArc
          : GAME_CONFIG.boss.frontGuardArc;
      if (facingDiff <= guardArc * 0.5) {
        isGuarded = true;
      }
    } else if (
      enemy.archetype === 'choir' &&
      !isVulnerable &&
      world.choir.synchronizedCount < world.choir.requiredNodeCount
    ) {
      isGuarded = true;
    }

    const vulnMult = isVulnerable
      ? (isBossArchetype(enemy.archetype)
          ? enemy.aiState === 'staggered'
            ? GAME_CONFIG.boss.staggeredDamageMult
            : GAME_CONFIG.boss.exposedCoreDamageMult
          : GAME_CONFIG.player.vulnerableDamageMultiplier) +
        meleeMasteryInfo.vulnerableBonus
      : 1.0;
    const vulnStaggerMult =
      isVulnerable && bossState !== null
        ? GAME_CONFIG.boss.exposedCoreStaggerMult
        : 1.0;
    const guardDmgMult = isGuarded
      ? Math.max(
          0.04,
          (isBreaker
            ? breakerUpgrade === 'breaker_seismic_core'
              ? GAME_CONFIG.weapons.upgrades.breaker_seismic_core.frontalGuardPenetration +
                (isBreakerOverclocked ? 0.1 : 0)
              : isHeavy
                ? breakerCfg.heavySlam.guardPenetrationMultiplier
                : breakerCfg.lightSlam.guardPenetrationMultiplier
            : enemy.archetype === 'helix'
              ? GAME_CONFIG.boss.frontalArmorDamageMult
              : enemy.archetype === 'warden_prime'
                ? GAME_CONFIG.wardenPrime.frontalArmorDamageMult
                : enemy.archetype === 'choir'
                  ? GAME_CONFIG.choir.unharmonizedDamageMult
                  : enemy.archetype === 'aegis_sentinel'
                    ? GAME_CONFIG.enemies.aegis_sentinel.frontGuardLightDamageMult
                    : GAME_CONFIG.enemies.bastion.frontGuardLightDamageMult) +
            meleeProtoMods.guardPenetrationDelta
        )
      : 1.0;
    let guardStaggerMult = isGuarded
      ? isBreaker
        ? breakerCfg.guardedStaggerMultiplier
        : enemy.archetype === 'helix' ||
            enemy.archetype === 'choir' ||
            enemy.archetype === 'warden_prime'
          ? GAME_CONFIG.boss.frontalArmorStaggerMult
          : enemy.archetype === 'aegis_sentinel'
            ? GAME_CONFIG.enemies.aegis_sentinel.frontGuardLightStaggerMult
            : GAME_CONFIG.enemies.bastion.frontGuardLightStaggerMult
      : 1.0;
    if (isGuarded && !isBreaker && edgeUpgrade === 'edge_breaker_cleave') {
      guardStaggerMult +=
        GAME_CONFIG.weapons.upgrades.edge_breaker_cleave.frontalGuardStaggerBonus;
    } else if (isGuarded && isBreaker && breakerUpgrade === 'breaker_seismic_core') {
      guardStaggerMult +=
        GAME_CONFIG.weapons.upgrades.breaker_seismic_core.frontalGuardStaggerBonus;
    }

    const effectiveConvPostureBonus = getEffectiveConvergencePostureBonus(world);
    res.postureBonus = effectiveConvPostureBonus;
    const convergencePostureBonus = triggeredConvergence ? effectiveConvPostureBonus : 0;

    const meleeAdrMods = getAdrenalineModifiers(p.adrenalineScore);
    const meleeOdScales = getOverdriveTimeScales(world.overdrive);
    const convergenceBonusDmg = triggeredConvergence
      ? meleeRigMods.convergenceBonusDamage
      : 0;
    const meleeBossCoreMods = computeBossCoreModifiers(
      world.progression?.equippedBossCore,
      world.progression?.transcendedBossCores
    );
    const meleeCuratorBreakMult =
      isVulnerable || (world.momentum?.weakpointTimer ?? 0) > 0
        ? meleeBossCoreMods.weakpointDamageMultiplier
        : 1.0;
    const harmonicEchoAmp = world.chronoAegis?.mode === 'harmonic' ? 1.2 : 1.0;
    const meleeDocSpec = getEchoDoctrineSpec(world.progression?.echoDoctrine);
    const echoDmgScale = triggeredConvergence
      ? meleeRecMods.echoDamageMultiplier *
        harmonicEchoAmp *
        meleeBossCoreMods.echoConvergenceMultiplier *
        meleeDocSpec.echoDamageMultiplier
      : 1;
    const echoStagScale = triggeredConvergence
      ? meleeRecMods.echoStaggerMultiplier * meleeDocSpec.echoStaggerMultiplier
      : 1;
    const tetherDrMult = isEnemyProtectedByConductor(world, enemy.id)
      ? 1 - GAME_CONFIG.enemies.resonance_warden.tetherDamageReduction
      : 1;
    const sovereignExposedMult =
      isVulnerable && bossState !== null ? meleeStanceMods.bossExposedBonusMult : 1.0;
    const finalDamage = Math.max(
      1,
      Math.round(
        baseDamage *
          vulnMult *
          meleeCuratorBreakMult *
          sovereignExposedMult *
          guardDmgMult *
          tetherDrMult *
          meleeAdrMods.damageMult *
          meleeOdScales.damageMult *
          echoDmgScale *
          getParadoxOutgoingDamageMult(world)
      ) + convergenceBonusDmg
    );
    let effectiveStagger =
      Math.round(
        (staggerAmount *
          vulnStaggerMult *
          guardStaggerMult *
          meleeAdrMods.staggerMult *
          meleeOdScales.staggerMult +
          convergencePostureBonus) *
          echoStagScale
      );

    if (triggeredConvergence) {
      p.flux = Math.max(
        0,
        Math.min(
          p.maxFlux,
          p.flux - effectiveConvFluxCost + meleeRigMods.convergenceFluxRefund
        )
      );
      res.activeMark = null;
      res.cooldownTimer =
        res.maxCooldown + meleeProtoMods.convergenceCooldownDelta;
      res.status = 'on_cooldown';
      res.convergenceCount += 1;
      res.lastOutcome = 'converged';
      res.lastConvergedEnemyId = enemy.id;
      res.lastConvergedX = enemy.x;
      res.lastConvergedZ = enemy.z;
      res.flashTimer = GAME_CONFIG.resonance.flashDuration;
      res.statusMessage = `TEMPORAL CONVERGENCE // +${convergencePostureBonus} POSTURE ON ${enemy.name.toUpperCase()}`;
    }

    enemy.hp = Math.max(0, enemy.hp - finalDamage);
    enemy.hitFlashTimer = triggeredConvergence ? 0.24 : 0.14;
    world.stats.damageDealt += finalDamage;
    awardWeaponMasteryXp(world, p.equippedWeaponId, 1);

    // v3.3.0 Phantom Afterimage Strike (Harmonic Sentinel or 3/3 MK.II Sovereign Rig)
    const qualifyingAfterimage =
      (isHeavy && p.isEmpoweredHeavy) ||
      triggeredConvergence ||
      (world.weaponResonance?.timer ?? 0) > 0;
    if (
      enemy.hp > 0 &&
      shouldTriggerPhantomAfterimage(
        world.chronoAegis?.mode ?? 'off',
        meleeRigSynergy,
        qualifyingAfterimage
      )
    ) {
      const afterimageDmg = Math.max(4, Math.round(finalDamage * 0.32));
      enemy.hp = Math.max(0, enemy.hp - afterimageDmg);
      world.stats.damageDealt += afterimageDmg;
      effectiveStagger += 10;
      if (world.chronoAegis) {
        world.chronoAegis.totalAfterimages += 1;
      }
      pushDamagePopup(
        ensureParadoxState(world),
        afterimageDmg,
        enemy.x + 0.25,
        bossState ? 2.55 : 1.95,
        enemy.z - 0.18,
        'convergence'
      );
      world.events.push({
        type: 'phantom_afterimage_strike',
        x: enemy.x,
        z: enemy.z,
        originX: p.x,
        originZ: p.z,
        amount: afterimageDmg,
        enemyId: enemy.id,
      });
    }

    if (isVulnerable) {
      world.stats.vulnerableHits += 1;
    }

    // Grant Flux on ordinary melee hits when not attempting or rejecting a Resonance Convergence
    if (!triggeredConvergence && rejectedConvergenceReason === null) {
      const fluxDampenMult =
        (p.fluxDampenedTimer ?? 0) > 0
          ? GAME_CONFIG.enemies.null_weaver.fluxDampenRegenMult
          : 1.0;
      const harmonicBonus =
        edgeUpgrade === 'edge_harmonic_conductor' && !isGuarded
          ? GAME_CONFIG.weapons.upgrades.edge_harmonic_conductor.fluxGainBonus +
            (isEdgeOverclocked ? 2 : 0)
          : 0;
      const masteryFluxMult =
        meleeMasteryInfo.fluxGainMultiplier *
        meleeStanceMods.fluxGainMult *
        meleeRigSynergy.fluxGainMultiplier;
      const mythicFluxFlat = meleeMythicBonus.fluxBonusOnHit;
      if (!isHeavy) {
        const baseLightFlux = isBreaker
          ? isGuarded
            ? breakerCfg.lightSlam.fluxGainOnGuardedHit
            : breakerCfg.lightSlam.fluxGainOnHit
          : isGuarded
            ? GAME_CONFIG.player.fluxGainOnGuardedHit
            : GAME_CONFIG.player.fluxGainOnLightHit;
        const fluxGain =
          (baseLightFlux + harmonicBonus + mythicFluxFlat) *
          fluxDampenMult *
          masteryFluxMult;
        p.flux = Math.min(p.maxFlux, p.flux + fluxGain);
      } else if (!p.isEmpoweredHeavy) {
        const baseHeavyFlux = isBreaker
          ? breakerCfg.heavySlam.fluxGainOnHit
          : GAME_CONFIG.player.fluxGainOnHeavyHit;
        p.flux = Math.min(
          p.maxFlux,
          p.flux +
            (baseHeavyFlux + harmonicBonus + mythicFluxFlat) *
              fluxDampenMult *
              masteryFluxMult
        );
      }
    }

    if (
      isBreaker &&
      isHeavy &&
      breakerUpgrade === 'breaker_singularity_coil' &&
      enemy.hp > 0
    ) {
      const microPin =
        GAME_CONFIG.weapons.upgrades.breaker_singularity_coil.microPinDuration +
        (isBreakerOverclocked ? 0.6 : 0);
      enemy.pinnedTimer = Math.max(enemy.pinnedTimer ?? 0, microPin);
      if (bossState) {
        bossState.pinnedTimer = enemy.pinnedTimer;
      }
    }
    if (isHeavy && p.isEmpoweredHeavy) {
      triggerCuratorGravityVortex(world, enemy.x, enemy.z);
    }

    // Apply directional knockback impulse (scaled down for massive boss chassis)
    const bossPushScale = bossState !== null ? 0.32 : 1.0;
    const pushDist =
      (triggeredConvergence ? 0.65 : isHeavy ? 0.55 : isGuarded ? 0.05 : 0.18) *
      bossPushScale;
    const nx = dist > 0.001 ? dx / dist : Math.sin(p.rotationY);
    const nz = dist > 0.001 ? dz / dist : Math.cos(p.rotationY);
    enemy.x += nx * pushDist;
    enemy.z += nz * pushDist;

    // Accumulate Stagger & evaluate posture break via existing combat/poise rules
    if (enemy.hp > 0 && enemy.aiState !== 'staggered') {
      const inHyperArmor = enemy.aiState === 'telegraph' || enemy.aiState === 'attack';
      const bossStaggerImmune =
        bossState !== null &&
        (bossState.staggerCooldownTimer > 0 || bossState.aiState === 'phase_transition');

      if (!bossStaggerImmune) {
        if (inHyperArmor && !isHeavy) {
          enemy.stagger = Math.min(enemy.maxStagger - 1, enemy.stagger + effectiveStagger);
        } else {
          enemy.stagger = Math.min(enemy.maxStagger, enemy.stagger + effectiveStagger);
        }
      }

      if (
        (enemy.archetype === 'scout' || enemy.archetype === 'null_weaver') &&
        enemy.aiState === 'telegraph' &&
        isHeavy &&
        enemy.stagger < enemy.maxStagger
      ) {
        enemy.aiState = 'recovery';
        enemy.stateDuration =
          enemy.archetype === 'null_weaver'
            ? GAME_CONFIG.enemies.null_weaver.recoveryDuration
            : GAME_CONFIG.enemies.scout.recoveryDuration;
        enemy.stateTimer = enemy.stateDuration;
        enemy.telegraphLocked = false;
        enemy.vx = 0;
        enemy.vz = 0;
      }

      if (enemy.stagger >= enemy.maxStagger) {
        enemy.aiState = 'staggered';
        enemy.stateDuration =
          GAME_CONFIG.enemies[enemy.archetype].staggeredDuration +
          meleeRigMods.staggerDurationBonus;
        enemy.stateTimer = enemy.stateDuration;
        enemy.telegraphLocked = false;
        enemy.stagger = 0;
        enemy.vx = 0;
        enemy.vz = 0;
        if (bossState) {
          bossState.aiState = 'staggered';
          bossState.stateDuration =
            GAME_CONFIG.boss.staggeredDuration + meleeRigMods.staggerDurationBonus;
          bossState.stateTimer = bossState.stateDuration;
          bossState.stagger = 0;
          bossState.vx = 0;
          bossState.vz = 0;
          bossState.activeAttack = null;
          bossState.shockwaveActive = false;
          bossState.coreExposed = true;
          bossState.staggerCooldownTimer =
            bossState.stateDuration + GAME_CONFIG.boss.staggerCooldown;
          bossState.statusLabel = 'POSTURE BROKEN · CHRONO CORE EXPOSED (1.5x)';
          world.events.push({
            type: 'boss_staggered',
            x: enemy.x,
            z: enemy.z,
            enemyId: enemy.id,
            bossPhase: bossState.phase,
          });
        }
        world.hitstopTimer = Math.max(world.hitstopTimer, triggeredConvergence ? 0.09 : 0.065);
        world.cameraTrauma = Math.min(1, world.cameraTrauma + (triggeredConvergence ? 0.48 : 0.45));
        world.events.push({
          type: 'enemy_staggered',
          x: enemy.x,
          z: enemy.z,
          enemyId: enemy.id,
        });
      }
    }

    // Check Boss Phase II transition threshold — triggers strictly once
    if (bossState) {
      checkAndTriggerBossPhase2(world, bossState, enemy);
    }

    // Scrapper counter-pressure when pressured with light attacks in pursue state
    if (
      enemy.hp > 0 &&
      enemy.archetype === 'scrapper' &&
      !isHeavy &&
      enemy.aiState === 'pursue'
    ) {
      enemy.cooldownTimer = Math.max(
        0,
        enemy.cooldownTimer - GAME_CONFIG.enemies.scrapper.counterCooldownRefundOnHit
      );
      if (
        enemy.cooldownTimer <= 0 &&
        dist <= GAME_CONFIG.enemies.scrapper.attackRange + 0.4
      ) {
        enemy.aiState = 'telegraph';
        enemy.stateDuration = GAME_CONFIG.enemies.scrapper.telegraphDuration;
        enemy.stateTimer = GAME_CONFIG.enemies.scrapper.telegraphDuration;
        enemy.hasDealtDamageThisAttack = false;
        enemy.rotationY = Math.atan2(p.x - enemy.x, p.z - enemy.z);
        enemy.targetX = p.x;
        enemy.targetZ = p.z;
        enemy.vx = 0;
        enemy.vz = 0;
        world.events.push({
          type: 'enemy_telegraph_start',
          x: enemy.x,
          z: enemy.z,
          enemyId: enemy.id,
        });
      }
    }

    if (triggeredConvergence) {
      world.hitstopTimer = Math.max(world.hitstopTimer, 0.085);
      world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.46);
      world.events.push({
        type: 'resonance_convergence',
        x: enemy.x,
        z: enemy.z,
        originX: p.x,
        originZ: p.z,
        amount: finalDamage,
        postureBonus: convergencePostureBonus,
        isCriticalOrVulnerable: isVulnerable,
        isHeavy,
        isGuarded,
        enemyId: enemy.id,
        resonanceOutcome: 'converged',
        weaponId: p.equippedWeaponId,
      });
    }

    const meleeHitAdr = applyAdrenalineDelta(
      p,
      triggeredConvergence
        ? ADRENALINE_GAINS.convergence
        : isHeavy
          ? ADRENALINE_GAINS.heavyHit
          : ADRENALINE_GAINS.lightHit
    );
    if (meleeHitAdr.tierDelta !== 0) {
      world.events.push({
        type: 'adrenaline_tier_changed',
        x: p.x,
        z: p.z,
        amount: meleeHitAdr.nextTier,
        postureBonus: meleeHitAdr.tierDelta,
      });
    }

    // Check kill vs hit event
    if (enemy.hp <= 0) {
      handleEnemyZeroHpDefeat(world, enemy, finalDamage, isVulnerable, isHeavy, isGuarded);
    } else {
      world.hitstopTimer = Math.max(
        world.hitstopTimer,
        isHeavy ? 0.055 : isGuarded ? 0.016 : 0.028
      );
      world.cameraTrauma = Math.min(
        1,
        world.cameraTrauma + (isHeavy ? 0.36 : isGuarded ? 0.08 : 0.16)
      );
      world.events.push({
        type: 'player_hit_enemy',
        x: enemy.x,
        z: enemy.z,
        amount: finalDamage,
        isCriticalOrVulnerable: isVulnerable,
        isHeavy,
        isGuarded,
        enemyId: enemy.id,
        weaponId: p.equippedWeaponId,
      });
    }

    if (bossState) {
      bossState.x = enemy.x;
      bossState.z = enemy.z;
      bossState.hp = enemy.hp;
      bossState.stagger = enemy.stagger;
      bossState.hitFlashTimer = enemy.hitFlashTimer;
    }
  }
}

function segmentCircleEarliestHitT(
  ax: number,
  az: number,
  bx: number,
  bz: number,
  cx: number,
  cz: number,
  r: number
): number | null {
  const dx = bx - ax;
  const dz = bz - az;
  const fx = ax - cx;
  const fz = az - cz;

  const a = dx * dx + dz * dz;
  if (a < 1e-9) {
    return fx * fx + fz * fz <= r * r ? 0 : null;
  }

  const b = 2 * (fx * dx + fz * dz);
  const c = fx * fx + fz * fz - r * r;

  if (c <= 0) {
    return 0;
  }

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) {
    return null;
  }

  const sqrtDisc = Math.sqrt(discriminant);
  const t1 = (-b - sqrtDisc) / (2 * a);
  const t2 = (-b + sqrtDisc) / (2 * a);

  if (t1 >= 0 && t1 <= 1) {
    return t1;
  }
  if (t2 >= 0 && t2 <= 1) {
    return t2;
  }
  return null;
}

function applyPlayerProjectileHitToEnemy(
  world: WorldState,
  proj: ProjectileState,
  enemy: EnemyState
): void {
  const p = world.player;
  const isHeavy = proj.isHeavy;
  const baseDamage = proj.damage;
  const staggerAmount = proj.staggerDamage;

  const dx = enemy.x - proj.prevX;
  const dz = enemy.z - proj.prevZ;
  const dist = Math.hypot(dx, dz);

  // Evaluate Temporal Resonance / Convergence eligibility on this ranged hit
  const res = world.resonance;
  const effectiveConvFluxCost = getEffectiveConvergenceFluxCost(world);
  res.fluxCost = effectiveConvFluxCost;
  const activeMark = res.activeMark;
  let triggeredConvergence = false;
  let rejectedConvergenceReason: ResonanceOutcome | null = null;

  if (activeMark && activeMark.remainingTime > 0) {
    if (enemy.id !== activeMark.enemyId) {
      rejectedConvergenceReason = 'wrong_target';
      res.lastOutcome = 'wrong_target';
      res.statusMessage = `WRONG TARGET // STRIKE MARKED ${activeMark.enemyName.toUpperCase()} FOR CONVERGENCE`;
    } else if (!isQualifyingConvergenceAttack(p, isHeavy, proj.attackMode)) {
      rejectedConvergenceReason = 'non_qualifying_attack';
      res.lastOutcome = 'non_qualifying_attack';
      res.statusMessage =
        proj.attackMode === 'rail_light'
          ? 'RESONANCE REQUIRES PHASE RAIL OVERCHARGE [E] OR HEAVY STRIKE'
          : 'RESONANCE REQUIRES CHARGED PULSE [E] OR CHRONO EDGE HEAVY';
    } else {
      const startedAfterMark =
        proj.attackMarkId === activeMark.markId &&
        proj.attackStartedAt >= activeMark.createdAt - 1e-6;
      if (!startedAfterMark) {
        rejectedConvergenceReason = 'attack_started_before_mark';
        res.lastOutcome = 'attack_started_before_mark';
        res.statusMessage =
          'ATTACK STARTED BEFORE MARK · INITIATE FOLLOW-UP AFTER ECHO CONTACT';
      } else if (res.cooldownTimer > 0) {
        rejectedConvergenceReason = 'on_cooldown';
        res.lastOutcome = 'on_cooldown';
        res.statusMessage = 'CONVERGENCE RECHARGING · WAIT FOR COOLDOWN';
      } else if (p.flux < effectiveConvFluxCost) {
        rejectedConvergenceReason = 'insufficient_flux';
        res.lastOutcome = 'insufficient_flux';
        res.statusMessage = `INSUFFICIENT FLUX FOR CONVERGENCE (${effectiveConvFluxCost} REQUIRED)`;
      } else {
        triggeredConvergence = true;
      }
    }

    if (rejectedConvergenceReason) {
      world.events.push({
        type: 'resonance_convergence_rejected',
        x: enemy.x,
        z: enemy.z,
        originX: proj.prevX,
        originZ: proj.prevZ,
        isHeavy,
        enemyId: enemy.id,
        resonanceOutcome: rejectedConvergenceReason,
      });
    }
  }

  const bossState =
    world.boss && world.boss.id === enemy.id ? world.boss : null;
  const isVulnerable =
    enemy.aiState === 'recovery' ||
    enemy.aiState === 'staggered' ||
    (bossState !== null && bossState.coreExposed);

  let isGuarded = false;
  if (
    (enemy.archetype === 'bastion' || enemy.archetype === 'aegis_sentinel') &&
    !isVulnerable &&
    !isHeavy &&
    !triggeredConvergence
  ) {
    const angleFromEnemyToShot = Math.atan2(proj.prevX - enemy.x, proj.prevZ - enemy.z);
    const facingDiff = Math.abs(angleDiff(angleFromEnemyToShot, enemy.rotationY));
    const guardArc =
      enemy.archetype === 'aegis_sentinel'
        ? GAME_CONFIG.enemies.aegis_sentinel.frontGuardArc
        : GAME_CONFIG.enemies.bastion.frontGuardArc;
    if (facingDiff <= guardArc * 0.5) {
      isGuarded = true;
    }
  } else if (
    (enemy.archetype === 'helix' || enemy.archetype === 'warden_prime') &&
    !isVulnerable &&
    !triggeredConvergence &&
    (!bossState || bossState.aiState !== 'phase_transition')
  ) {
    const angleFromEnemyToShot = Math.atan2(proj.prevX - enemy.x, proj.prevZ - enemy.z);
    const facingDiff = Math.abs(angleDiff(angleFromEnemyToShot, enemy.rotationY));
    const guardArc =
      enemy.archetype === 'warden_prime'
        ? GAME_CONFIG.wardenPrime.frontGuardArc
        : GAME_CONFIG.boss.frontGuardArc;
    if (facingDiff <= guardArc * 0.5) {
      isGuarded = true;
    }
  } else if (
    enemy.archetype === 'choir' &&
    !isVulnerable &&
    world.choir.synchronizedCount < world.choir.requiredNodeCount
  ) {
    isGuarded = true;
  }

  const isPhaseRailProj =
    proj.attackMode === 'rail_light' || proj.attackMode === 'rail_heavy';
  const railUpgrade = getEquippedWeaponUpgrade(world, 'phase_rail');
  const railOverclock = isUpgradeOverclocked(
    railUpgrade,
    world.progression?.overclockedUpgrades
  );
  const railExposedMult = isPhaseRailProj
    ? railUpgrade === 'rail_null_aperture'
      ? GAME_CONFIG.weapons.upgrades.rail_null_aperture.exposedCoreDamageMultiplier +
        (railOverclock ? 0.22 : 0)
      : GAME_CONFIG.weapons.phase_rail.exposedCoreDamageMultiplier
    : 1.0;

  const projProtocolMods = getPlayerProtocolModifiers(world);
  const projHitMasteryInfo = getActiveWeaponMasteryInfo(world, proj.weaponId);
  const projHitRecMods = getActiveRecursionModifiers(world);

  const vulnMult = isVulnerable
    ? (isPhaseRailProj
        ? railExposedMult
        : isBossArchetype(enemy.archetype)
          ? enemy.aiState === 'staggered'
            ? GAME_CONFIG.boss.staggeredDamageMult
            : GAME_CONFIG.boss.exposedCoreDamageMult
          : GAME_CONFIG.player.vulnerableDamageMultiplier) +
      projHitMasteryInfo.vulnerableBonus
    : triggeredConvergence && isPhaseRailProj
      ? railExposedMult + projHitMasteryInfo.vulnerableBonus
      : 1.0;
  const vulnStaggerMult =
    isVulnerable && bossState !== null
      ? GAME_CONFIG.boss.exposedCoreStaggerMult
      : 1.0;
  const guardDmgMult = isGuarded
    ? Math.max(
        0.04,
        (enemy.archetype === 'helix'
          ? GAME_CONFIG.boss.frontalArmorDamageMult
          : enemy.archetype === 'warden_prime'
            ? GAME_CONFIG.wardenPrime.frontalArmorDamageMult
            : enemy.archetype === 'choir'
              ? GAME_CONFIG.choir.unharmonizedDamageMult
              : enemy.archetype === 'aegis_sentinel'
                ? GAME_CONFIG.enemies.aegis_sentinel.frontGuardLightDamageMult
                : isPhaseRailProj
                  ? GAME_CONFIG.weapons.phase_rail.guardedDamageMultiplier
                  : GAME_CONFIG.weapons.pulsecaster.guardedDamageMultiplier) +
          projProtocolMods.guardPenetrationDelta
      )
    : 1.0;
  const guardStaggerMult = isGuarded
    ? enemy.archetype === 'helix' ||
        enemy.archetype === 'choir' ||
        enemy.archetype === 'warden_prime'
      ? GAME_CONFIG.boss.frontalArmorStaggerMult
      : enemy.archetype === 'aegis_sentinel'
        ? GAME_CONFIG.enemies.aegis_sentinel.frontGuardLightStaggerMult
        : isPhaseRailProj
          ? GAME_CONFIG.weapons.phase_rail.guardedStaggerMultiplier
          : GAME_CONFIG.weapons.pulsecaster.guardedStaggerMultiplier
    : 1.0;

  const effectiveConvPostureBonus = getEffectiveConvergencePostureBonus(world);
  res.postureBonus = effectiveConvPostureBonus;
  const convergencePostureBonus = triggeredConvergence ? effectiveConvPostureBonus : 0;
  const projFlowDamageMult = proj.flowDamageMult ?? 1;
  const projFlowStaggerMult = proj.flowStaggerMult ?? 1;
  const projAdrMods = getAdrenalineModifiers(p.adrenalineScore);
  const projOdScales = getOverdriveTimeScales(world.overdrive);
  const projRigMods = getPlayerRigModifiers(world);
  const projConvBonusDmg = triggeredConvergence
    ? projRigMods.convergenceBonusDamage
    : 0;
  const projBossCoreMods = computeBossCoreModifiers(
    world.progression?.equippedBossCore,
    world.progression?.transcendedBossCores
  );
  const projCuratorBreakMult =
    isVulnerable || (world.momentum?.weakpointTimer ?? 0) > 0
      ? projBossCoreMods.weakpointDamageMultiplier
      : 1.0;
  const blessingStaggerMult =
    world.activeStoryBlessing === 'posture_edge' ? 1.18 : 1.0;
  const projDocSpec = getEchoDoctrineSpec(world.progression?.echoDoctrine);
  const projEchoDmgScale = triggeredConvergence
    ? projHitRecMods.echoDamageMultiplier *
      projBossCoreMods.echoConvergenceMultiplier *
      projDocSpec.echoDamageMultiplier
    : 1;
  const projEchoStagScale = triggeredConvergence
    ? projHitRecMods.echoStaggerMultiplier * projDocSpec.echoStaggerMultiplier
    : 1;
  const projTetherDrMult = isEnemyProtectedByConductor(world, enemy.id)
    ? 1 - GAME_CONFIG.enemies.resonance_warden.tetherDamageReduction
    : 1;
  const finalDamage = Math.max(
    1,
    Math.round(
      baseDamage *
        vulnMult *
        projCuratorBreakMult *
        guardDmgMult *
        projTetherDrMult *
        projFlowDamageMult *
        projAdrMods.damageMult *
        projOdScales.damageMult *
        projEchoDmgScale *
        getParadoxOutgoingDamageMult(world)
    ) + projConvBonusDmg
  );
  if (isHeavy && proj.isEmpowered) {
    triggerCuratorGravityVortex(world, enemy.x, enemy.z);
  }
  const effectiveStagger = Math.round(
    (staggerAmount *
      vulnStaggerMult *
      guardStaggerMult *
      projFlowStaggerMult *
      projAdrMods.staggerMult *
      projOdScales.staggerMult *
      blessingStaggerMult +
      convergencePostureBonus) *
      projEchoStagScale
  );

  if (triggeredConvergence) {
    p.flux = Math.max(
      0,
      Math.min(
        p.maxFlux,
        p.flux - effectiveConvFluxCost + projRigMods.convergenceFluxRefund
      )
    );
    res.activeMark = null;
    res.cooldownTimer =
      res.maxCooldown + projProtocolMods.convergenceCooldownDelta;
    res.status = 'on_cooldown';
    res.convergenceCount += 1;
    res.lastOutcome = 'converged';
    res.lastConvergedEnemyId = enemy.id;
    res.lastConvergedX = enemy.x;
    res.lastConvergedZ = enemy.z;
    res.flashTimer = GAME_CONFIG.resonance.flashDuration;
    res.statusMessage = `TEMPORAL CONVERGENCE // +${convergencePostureBonus} POSTURE ON ${enemy.name.toUpperCase()}`;
  }

  enemy.hp = Math.max(0, enemy.hp - finalDamage);
  enemy.hitFlashTimer = triggeredConvergence ? 0.24 : 0.12;
  world.stats.damageDealt += finalDamage;
  awardWeaponMasteryXp(world, proj.weaponId, 1);

  if (isVulnerable) {
    world.stats.vulnerableHits += 1;
  }

  if (!triggeredConvergence && rejectedConvergenceReason === null) {
    const fluxDampenMult =
      (p.fluxDampenedTimer ?? 0) > 0
        ? GAME_CONFIG.enemies.null_weaver.fluxDampenRegenMult
        : 1.0;
    const projMasteryFluxMult = projHitMasteryInfo.fluxGainMultiplier;
    if (!isHeavy) {
      const fluxGain =
        (isGuarded
          ? isPhaseRailProj
            ? GAME_CONFIG.weapons.phase_rail.lightShot.fluxGainOnGuardedHit
            : GAME_CONFIG.weapons.pulsecaster.lightShot.fluxGainOnGuardedHit
          : isPhaseRailProj
            ? GAME_CONFIG.weapons.phase_rail.lightShot.fluxGainOnHit
            : GAME_CONFIG.weapons.pulsecaster.lightShot.fluxGainOnHit) *
        fluxDampenMult *
        projMasteryFluxMult;
      p.flux = Math.min(p.maxFlux, p.flux + fluxGain);
    } else if (!proj.isEmpowered) {
      p.flux = Math.min(
        p.maxFlux,
        p.flux +
          (isPhaseRailProj
            ? GAME_CONFIG.weapons.phase_rail.heavyShot.fluxGainOnHit
            : GAME_CONFIG.weapons.pulsecaster.heavyShot.fluxGainOnHit) *
            fluxDampenMult *
            projMasteryFluxMult
      );
    }
  }

  const bossPushScale = bossState !== null ? 0.24 : 0.85;
  const pushDist =
    (triggeredConvergence ? 0.55 : isHeavy ? 0.38 : isGuarded ? 0.03 : 0.12) *
    bossPushScale;
  const nx = dist > 0.001 ? dx / dist : Math.sin(proj.rotationY);
  const nz = dist > 0.001 ? dz / dist : Math.cos(proj.rotationY);
  enemy.x += nx * pushDist;
  enemy.z += nz * pushDist;

  if (enemy.hp > 0 && enemy.aiState !== 'staggered') {
    const inHyperArmor = enemy.aiState === 'telegraph' || enemy.aiState === 'attack';
    const bossStaggerImmune =
      bossState !== null &&
      (bossState.staggerCooldownTimer > 0 || bossState.aiState === 'phase_transition');

    if (!bossStaggerImmune) {
      if (inHyperArmor && !isHeavy) {
        enemy.stagger = Math.min(enemy.maxStagger - 1, enemy.stagger + effectiveStagger);
      } else {
        enemy.stagger = Math.min(enemy.maxStagger, enemy.stagger + effectiveStagger);
      }
    }

    if (
      (enemy.archetype === 'scout' || enemy.archetype === 'null_weaver') &&
      enemy.aiState === 'telegraph' &&
      isHeavy &&
      enemy.stagger < enemy.maxStagger
    ) {
      enemy.aiState = 'recovery';
      enemy.stateDuration =
        enemy.archetype === 'null_weaver'
          ? GAME_CONFIG.enemies.null_weaver.recoveryDuration
          : GAME_CONFIG.enemies.scout.recoveryDuration;
      enemy.stateTimer = enemy.stateDuration;
      enemy.telegraphLocked = false;
      enemy.vx = 0;
      enemy.vz = 0;
    }

    if (enemy.stagger >= enemy.maxStagger) {
      enemy.aiState = 'staggered';
      enemy.stateDuration =
        GAME_CONFIG.enemies[enemy.archetype].staggeredDuration +
        projRigMods.staggerDurationBonus;
      enemy.stateTimer = enemy.stateDuration;
      enemy.telegraphLocked = false;
      enemy.stagger = 0;
      enemy.vx = 0;
      enemy.vz = 0;
      if (bossState) {
        bossState.aiState = 'staggered';
        bossState.stateDuration =
          GAME_CONFIG.boss.staggeredDuration + projRigMods.staggerDurationBonus;
        bossState.stateTimer = bossState.stateDuration;
        bossState.stagger = 0;
        bossState.vx = 0;
        bossState.vz = 0;
        bossState.activeAttack = null;
        bossState.shockwaveActive = false;
        bossState.coreExposed = true;
        bossState.staggerCooldownTimer =
          bossState.stateDuration + GAME_CONFIG.boss.staggerCooldown;
        bossState.statusLabel = 'POSTURE BROKEN · CHRONO CORE EXPOSED (1.5x)';
        world.events.push({
          type: 'boss_staggered',
          x: enemy.x,
          z: enemy.z,
          enemyId: enemy.id,
          bossPhase: bossState.phase,
        });
      }
      world.hitstopTimer = Math.max(world.hitstopTimer, triggeredConvergence ? 0.085 : 0.055);
      world.cameraTrauma = Math.min(1, world.cameraTrauma + (triggeredConvergence ? 0.45 : 0.38));
      world.events.push({
        type: 'enemy_staggered',
        x: enemy.x,
        z: enemy.z,
        enemyId: enemy.id,
      });
    }
  }

  if (bossState) {
    checkAndTriggerBossPhase2(world, bossState, enemy);
  }

  if (triggeredConvergence) {
    world.hitstopTimer = Math.max(world.hitstopTimer, 0.08);
    world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.44);
    world.events.push({
      type: 'resonance_convergence',
      x: enemy.x,
      z: enemy.z,
      originX: proj.prevX,
      originZ: proj.prevZ,
      amount: finalDamage,
      postureBonus: convergencePostureBonus,
      isCriticalOrVulnerable: isVulnerable,
      isHeavy,
      isGuarded,
      enemyId: enemy.id,
      resonanceOutcome: 'converged',
      weaponId: isPhaseRailProj ? 'phase_rail' : 'pulsecaster',
    });
  }

  const projHitAdr = applyAdrenalineDelta(
    p,
    triggeredConvergence
      ? ADRENALINE_GAINS.convergence
      : isHeavy
        ? ADRENALINE_GAINS.heavyHit
        : ADRENALINE_GAINS.lightHit
  );
  if (projHitAdr.tierDelta !== 0) {
    world.events.push({
      type: 'adrenaline_tier_changed',
      x: p.x,
      z: p.z,
      amount: projHitAdr.nextTier,
      postureBonus: projHitAdr.tierDelta,
    });
  }

  if (enemy.hp <= 0) {
    handleEnemyZeroHpDefeat(world, enemy, finalDamage, isVulnerable, isHeavy, isGuarded);
  } else {
    world.hitstopTimer = Math.max(
      world.hitstopTimer,
      isHeavy ? 0.04 : isGuarded ? 0.012 : 0.02
    );
    world.cameraTrauma = Math.min(
      1,
      world.cameraTrauma + (isHeavy ? 0.28 : isGuarded ? 0.06 : 0.12)
    );
    world.events.push({
      type: 'player_hit_enemy',
      x: enemy.x,
      z: enemy.z,
      amount: finalDamage,
      isCriticalOrVulnerable: isVulnerable,
      isHeavy,
      isGuarded,
      enemyId: enemy.id,
      weaponId: isPhaseRailProj ? 'phase_rail' : 'pulsecaster',
    });
  }

  if (bossState) {
    bossState.x = enemy.x;
    bossState.z = enemy.z;
    bossState.hp = enemy.hp;
    bossState.stagger = enemy.stagger;
    bossState.hitFlashTimer = enemy.hitFlashTimer;
  }
}

function advanceProjectiles(world: WorldState, dt: number): void {
  if (world.projectiles.length === 0) return;

  for (let i = 0; i < world.projectiles.length; i++) {
    const proj = world.projectiles[i];
    if (!proj.active) continue;

    const prevX = proj.x;
    const prevZ = proj.z;
    const nextX = prevX + proj.vx * dt;
    const nextZ = prevZ + proj.vz * dt;
    proj.prevX = prevX;
    proj.prevZ = prevZ;

    const stepDist = Math.hypot(nextX - prevX, nextZ - prevZ);

    let earliestT = 2;
    let hitKind: 'none' | 'obstacle' | 'node' | 'enemy' = 'none';
    let hitObstacle: ObstacleCollider | null = null;
    let hitNode: HarmonicNodeState | null = null;
    let hitEnemy: EnemyState | null = null;

    // 1. Check solid obstacles (including closed barriers)
    for (let o = 0; o < world.obstacles.length; o++) {
      const obs = world.obstacles[o];
      if (!isObstacleAuthoritativelySolid(world, obs)) continue;
      const t = segmentCircleEarliestHitT(
        prevX,
        prevZ,
        nextX,
        nextZ,
        obs.x,
        obs.z,
        obs.radius + proj.radius * 0.35
      );
      if (t !== null && t < earliestT) {
        earliestT = t;
        hitKind = 'obstacle';
        hitObstacle = obs;
        hitNode = null;
        hitEnemy = null;
      }
    }

    // 2. Check Choir Harmonic Nodes when Chapter II Choir is active
    if (world.choir.active && world.outcome === 'none') {
      for (let n = 0; n < world.choir.nodes.length; n++) {
        const node = world.choir.nodes[n];
        if (proj.hitTargetIds.includes(node.id)) continue;
        const t = segmentCircleEarliestHitT(
          prevX,
          prevZ,
          nextX,
          nextZ,
          node.x,
          node.z,
          node.radius + proj.radius
        );
        if (t !== null && t < earliestT) {
          earliestT = t;
          hitKind = 'node';
          hitNode = node;
          hitEnemy = null;
        }
      }
    }

    // 3. Check living enemies & bosses
    for (let e = 0; e < world.enemies.length; e++) {
      const enemy = world.enemies[e];
      if (enemy.aiState === 'ko' || enemy.hp <= 0) continue;
      if (proj.hitTargetIds.includes(enemy.id)) continue;
      if (
        world.boss &&
        world.boss.id === enemy.id &&
        (world.boss.aiState === 'dormant' ||
          world.boss.aiState === 'phase_transition' ||
          world.boss.aiState === 'ko' ||
          world.boss.aiState === 'defeated')
      ) {
        continue;
      }
      const t = segmentCircleEarliestHitT(
        prevX,
        prevZ,
        nextX,
        nextZ,
        enemy.x,
        enemy.z,
        enemy.radius + proj.radius
      );
      if (t !== null && t < earliestT) {
        earliestT = t;
        hitKind = 'enemy';
        hitEnemy = enemy;
        hitNode = null;
      }
    }

    if (hitKind === 'obstacle') {
      proj.x = prevX + (nextX - prevX) * earliestT;
      proj.z = prevZ + (nextZ - prevZ) * earliestT;
      proj.active = false;
      if (proj.owner === 'player') {
        world.player.lastWeaponShotOutcome = 'blocked_by_obstacle';
      }
      world.events.push({
        type: 'pulse_impact_obstacle',
        x: proj.x,
        z: proj.z,
        isHeavy: proj.isHeavy,
        weaponId:
          proj.attackMode === 'rail_light' || proj.attackMode === 'rail_heavy'
            ? 'phase_rail'
            : 'pulsecaster',
      });
      if (hitObstacle?.destructible && !hitObstacle.disabled) {
        applyDamageToDestructibleObstacle(
          world,
          hitObstacle,
          proj.damage,
          proj.owner === 'player'
        );
      }
      continue;
    }

    if (hitKind === 'node' && hitNode) {
      proj.x = hitNode.x;
      proj.z = hitNode.z;
      proj.hitTargetIds.push(hitNode.id);
      if (!proj.piercing) {
        proj.active = false;
      }
      if (proj.owner === 'player') {
        world.player.lastWeaponShotOutcome = 'hit_node';
        applyLivePlayerStrikeToChoirNode(world, hitNode);
      } else if (hitNode.status === 'inactive') {
        hitNode.status = 'primed';
        hitNode.primedRemainingTime = GAME_CONFIG.choir.nodePrimeDuration;
        hitNode.failedRemainingTime = 0;
        if (world.choir.syncTimer <= 0) {
          world.choir.syncTimer = world.choir.syncWindowSeconds;
        }
        world.choir.lastFailureReason = 'none';
        world.choir.statusMessage = `${hitNode.label} PRIMED BY ECHO (${GAME_CONFIG.choir.nodePrimeDuration.toFixed(1)}s) // STRIKE COUNTERPART PYLON WITH LIVE SERA`;
        world.events.push({
          type: 'choir_node_primed',
          x: hitNode.x,
          z: hitNode.z,
          enemyId: hitNode.id,
        });
      }
      if (!proj.active) {
        continue;
      }
    }

    if (hitKind === 'enemy' && hitEnemy) {
      proj.x = prevX + (nextX - prevX) * earliestT;
      proj.z = prevZ + (nextZ - prevZ) * earliestT;
      proj.hitTargetIds.push(hitEnemy.id);
      if (!proj.piercing) {
        proj.active = false;
      }
      if (proj.owner === 'player') {
        world.player.lastWeaponShotOutcome = 'hit_enemy';
        applyPlayerProjectileHitToEnemy(world, proj, hitEnemy);
      } else {
        hitEnemy.hitFlashTimer = Math.max(hitEnemy.hitFlashTimer, 0.09);
        if (proj.damage > 0 && hitEnemy.hp > 0) {
          hitEnemy.hp = Math.max(0, hitEnemy.hp - proj.damage);
          hitEnemy.stagger = Math.min(hitEnemy.maxStagger, hitEnemy.stagger + proj.staggerDamage);
          world.stats.damageDealt += proj.damage;
          const echoHitBoss =
            world.boss && world.boss.id === hitEnemy.id ? world.boss : null;
          if (echoHitBoss) {
            echoHitBoss.hp = hitEnemy.hp;
            echoHitBoss.stagger = hitEnemy.stagger;
            checkAndTriggerBossPhase2(world, echoHitBoss, hitEnemy);
          }
          if (hitEnemy.hp <= 0) {
            handleEnemyZeroHpDefeat(world, hitEnemy, proj.damage, false, proj.isHeavy, false);
          }
        }
      }
      if (!proj.active) {
        continue;
      }
    }

    proj.x = nextX;
    proj.z = nextZ;
    proj.distanceTraveled += stepDist;
    proj.elapsed += dt;

    if (Math.hypot(proj.x, proj.z) >= GAME_CONFIG.arena.radius - 0.15) {
      proj.active = false;
      if (proj.owner === 'player') {
        world.player.lastWeaponShotOutcome = 'blocked_by_obstacle';
      }
      world.events.push({
        type: 'pulse_impact_obstacle',
        x: proj.x,
        z: proj.z,
        isHeavy: proj.isHeavy,
        weaponId:
          proj.attackMode === 'rail_light' || proj.attackMode === 'rail_heavy'
            ? 'phase_rail'
            : 'pulsecaster',
      });
      continue;
    }

    if (proj.distanceTraveled >= proj.maxRange || proj.elapsed >= proj.maxLifetime) {
      proj.active = false;
      if (proj.owner === 'player' && world.player.lastWeaponShotOutcome === 'fired') {
        world.player.lastWeaponShotOutcome = 'expired';
      }
    }
  }

  let writeIdx = 0;
  for (let i = 0; i < world.projectiles.length; i++) {
    const p = world.projectiles[i];
    if (p.active) {
      world.projectiles[writeIdx++] = p;
    }
  }
  world.projectiles.length = writeIdx;
}

function updatePlayer(world: WorldState, input: PlayerInputFrame, dt: number): void {
  const p = world.player;
  if (p.actionState === 'dead') return;
  const playerRecMods = getActiveRecursionModifiers(world);
  const cooldownDt =
    playerRecMods.cooldownMultiplier !== 1
      ? dt / Math.max(0.35, playerRecMods.cooldownMultiplier)
      : dt;

  p.dodgeCooldownTimer = Math.max(0, p.dodgeCooldownTimer - cooldownDt);
  p.parryCooldownTimer = Math.max(0, p.parryCooldownTimer - cooldownDt);
  p.invulnTimer = Math.max(0, p.invulnTimer - dt);
  p.hurtFlashTimer = Math.max(0, p.hurtFlashTimer - dt);
  p.comboWindowTimer = Math.max(0, p.comboWindowTimer - dt);
  p.comboCooldownTimer = Math.max(0, p.comboCooldownTimer - cooldownDt);
  p.weaponShotCooldownTimer = Math.max(0, p.weaponShotCooldownTimer - cooldownDt);
  p.weaponSwitchCooldownTimer = Math.max(0, p.weaponSwitchCooldownTimer - cooldownDt);
  p.bufferTimer = Math.max(0, p.bufferTimer - dt);
  tickPlayerCombatFlowTimers(p, dt);
  if (p.bufferTimer <= 0) {
    p.bufferedAction = 'none';
  }

  const pulseCfg = GAME_CONFIG.weapons.pulsecaster;
  const railCfg = GAME_CONFIG.weapons.phase_rail;
  const breakerCfg = GAME_CONFIG.weapons.grav_breaker;
  const activeThermalCfg = p.equippedWeaponId === 'phase_rail' ? railCfg : pulseCfg;
  const adrMods = getAdrenalineModifiers(p.adrenalineScore);
  let hasLiveEnemy = false;
  for (let ei = 0; ei < world.enemies.length; ei++) {
    const en = world.enemies[ei];
    if (en.hp > 0 && en.aiState !== 'ko') {
      hasLiveEnemy = true;
      break;
    }
  }
  const decayRes = tickAdrenalineDecay(p, dt, hasLiveEnemy);
  if (decayRes.tierDelta !== 0) {
    world.events.push({
      type: 'adrenaline_tier_changed',
      x: p.x,
      z: p.z,
      amount: decayRes.nextTier,
      postureBonus: decayRes.tierDelta,
    });
  }

  const playerRigMods = getPlayerRigModifiers(world);
  if (p.weaponOverheated) {
    p.weaponOverheatTimer = Math.max(0, p.weaponOverheatTimer - dt);
    const lockDuration = Math.max(0.1, activeThermalCfg.overheatLockoutDuration);
    const clearRatio = activeThermalCfg.overheatClearHeatRatio;
    const coolFraction = 1 - p.weaponOverheatTimer / lockDuration;
    p.weaponHeat = Math.max(
      clearRatio * p.maxWeaponHeat,
      p.maxWeaponHeat * (1 - coolFraction * (1 - clearRatio))
    );
    if (p.weaponOverheatTimer <= 0) {
      p.weaponOverheated = false;
      p.activeVentAttempted = false;
      p.weaponHeat = clearRatio * p.maxWeaponHeat;
      world.events.push({
        type: 'pulse_overheat_cleared',
        x: p.x,
        z: p.z,
        weaponId: p.equippedWeaponId === 'phase_rail' ? 'phase_rail' : 'pulsecaster',
      });
    }
  } else if (p.weaponHeat > 0) {
    const coolRateMult =
      (p.equippedWeaponId === 'phase_rail'
        ? getEquippedWeaponUpgrade(world, 'phase_rail') === 'rail_phase_capacitor'
          ? GAME_CONFIG.weapons.upgrades.rail_phase_capacitor.coolRateMultiplier
          : 1.0
        : getEquippedWeaponUpgrade(world, 'pulsecaster') === 'pulse_thermal_sink'
          ? GAME_CONFIG.weapons.upgrades.pulse_thermal_sink.coolRateMultiplier +
            (isUpgradeOverclocked(
              'pulse_thermal_sink',
              world.progression?.overclockedUpgrades
            )
              ? 0.25
              : 0)
          : 1.0) *
      adrMods.coolRateMult *
      playerRigMods.heatCoolMultiplier;
    p.weaponHeat = Math.max(
      0,
      p.weaponHeat - activeThermalCfg.heatCoolRatePerSec * coolRateMult * dt
    );
  }

  p.fluxDampenedTimer = Math.max(0, (p.fluxDampenedTimer ?? 0) - dt);
  const hasFluxReservoirRegen =
    (world.progression?.purchasedNeuralProtocols ?? []).includes('proto_flux_reservoir') &&
    p.flux > 100;
  const fluxRegenMult =
    ((p.fluxDampenedTimer ?? 0) > 0
      ? GAME_CONFIG.enemies.null_weaver.fluxDampenRegenMult
      : 1.0) *
    adrMods.fluxRegenMult *
    playerRigMods.passiveFluxRegenMultiplier *
    (hasFluxReservoirRegen ? 0.92 : 1.0);
  p.flux = Math.min(
    p.maxFlux,
    p.flux + GAME_CONFIG.player.fluxRegenPerSec * fluxRegenMult * dt
  );

  if (p.ghostIntegrity > p.integrity) {
    p.ghostIntegrity = Math.max(p.integrity, p.ghostIntegrity - 28 * dt);
  } else {
    p.ghostIntegrity = p.integrity;
  }

  const dampFactor = 1 - Math.exp(-14 * dt);
  p.squashX += (1 - p.squashX) * dampFactor;
  p.squashY += (1 - p.squashY) * dampFactor;

  const moveVec = computeMovementWorldVector(input, _scratchMoveVec);

  if (input.cameraDragJustStarted) {
    p.bufferedAction = 'none';
    p.bufferTimer = 0;
    if (p.actionState === 'charging_heavy') {
      p.actionState = 'idle';
      p.chargeTime = 0;
    }
  }

  if ((p.weaponSwitchBufferTimer ?? 0) > 0) {
    p.weaponSwitchBufferTimer = Math.max(0, (p.weaponSwitchBufferTimer ?? 0) - dt);
    if (p.weaponSwitchBufferTimer <= 0) {
      p.bufferedWeaponSwitch = null;
    }
  }

  const isLoomEndingStage =
    world.run.chapter === 'chapter_5_loom' && world.run.stage === 'chronicle_loom';

  if (!isLoomEndingStage && input.selectWeaponId && isValidWeaponId(input.selectWeaponId)) {
    if (input.selectWeaponId !== p.equippedWeaponId) {
      if (
        !switchPlayerWeapon(world, input.selectWeaponId) &&
        getUnlockedWeaponIds(world).includes(input.selectWeaponId)
      ) {
        p.bufferedWeaponSwitch = input.selectWeaponId;
        p.weaponSwitchBufferTimer = 0.35;
      }
    } else {
      p.bufferedWeaponSwitch = null;
      p.weaponSwitchBufferTimer = 0;
    }
  } else if (!isLoomEndingStage && input.switchWeaponJustPressed) {
    if (!switchPlayerWeapon(world)) {
      p.bufferedWeaponSwitch = 'cycle';
      p.weaponSwitchBufferTimer = 0.35;
    }
  } else if (!isLoomEndingStage && (p.weaponSwitchBufferTimer ?? 0) > 0 && p.bufferedWeaponSwitch) {
    const target = p.bufferedWeaponSwitch === 'cycle' ? undefined : p.bufferedWeaponSwitch;
    switchPlayerWeapon(world, target);
  }

  if (input.lockOnToggleJustPressed) {
    if (p.lockOnTargetId) {
      p.lockOnTargetId = null;
      world.events.push({ type: 'lock_on_engaged', x: p.x, z: p.z, amount: 0 });
    } else {
      const picked = selectBestLockOnTarget(world, input.aimYaw);
      if (picked) {
        p.lockOnTargetId = picked.id;
        world.events.push({
          type: 'lock_on_engaged',
          x: picked.x,
          z: picked.z,
          amount: 1,
          enemyId: picked.id,
        });
      }
    }
  } else if (input.lockOnCycleJustPressed && p.lockOnTargetId) {
    const cycled = cycleLockOnTarget(world, p.lockOnTargetId, input.aimYaw);
    if (cycled && cycled.id !== p.lockOnTargetId) {
      p.lockOnTargetId = cycled.id;
      world.events.push({
        type: 'lock_on_engaged',
        x: cycled.x,
        z: cycled.z,
        amount: 1,
        enemyId: cycled.id,
      });
    }
  }
  if (p.lockOnTargetId) {
    const validLock = resolveActiveLockOnTarget(world, p.lockOnTargetId);
    if (!validLock) {
      p.lockOnTargetId = null;
    }
  }

  if (input.dodgeJustPressed) {
    p.bufferedAction = 'dodge';
    p.bufferTimer = 0.16;
  } else if (input.parryJustPressed) {
    p.bufferedAction = 'parry';
    p.bufferTimer = 0.16;
  } else if (input.heavyAttackJustPressed) {
    p.bufferedAction = 'heavy';
    p.bufferTimer = 0.16;
  } else if (input.lightAttackJustPressed) {
    p.bufferedAction = 'light';
    p.bufferTimer = 0.15;
  }

  const canCancelIntoDodge =
    p.dodgeCooldownTimer <= 0 &&
    (p.actionState === 'idle' ||
      p.actionState === 'moving' ||
      p.actionState === 'charging_heavy' ||
      p.actionState === 'light_recovery' ||
      p.actionState === 'heavy_recovery' ||
      p.actionState === 'parry_recovery');

  if (p.bufferedAction === 'dodge' && canCancelIntoDodge) {
    p.bufferedAction = 'none';
    startDodge(world, moveVec);
    return;
  }

  const canCancelIntoParry =
    p.parryCooldownTimer <= 0 &&
    (p.actionState === 'idle' ||
      p.actionState === 'moving' ||
      p.actionState === 'charging_heavy' ||
      p.actionState === 'light_recovery');

  if (p.bufferedAction === 'parry' && canCancelIntoParry) {
    p.bufferedAction = 'none';
    startParry(world, input, moveVec);
    return;
  }

  const isPulsecaster = p.equippedWeaponId === 'pulsecaster';
  const isPhaseRail = p.equippedWeaponId === 'phase_rail';
  const isRangedWeapon = isPulsecaster || isPhaseRail;
  const isBreaker = p.equippedWeaponId === 'grav_breaker';
  const isNeutralState = p.actionState === 'idle' || p.actionState === 'moving';
  const maxComboIdx = 2;
  const canChainCancelRecovery =
    !isRangedWeapon &&
    p.actionState === 'light_recovery' &&
    p.comboIndex < maxComboIdx &&
    p.stateTimer <=
      (isBreaker
        ? breakerCfg.lightSlam.chainCancelRemaining
        : GAME_CONFIG.player.lightAttack.chainCancelRemaining);
  const canFlowCancelHeavy = canCancelActionTailForCombatFlow(p, isRangedWeapon, 'heavy');
  const canFlowCancelLight = canCancelActionTailForCombatFlow(p, isRangedWeapon, 'light');

  const heavyChargeThreshold = getEffectivePlayerHeavyChargeThreshold(world, p);
  const heavyMaxChargeTime = isPhaseRail
    ? railCfg.heavyShot.maxChargeTime
    : isPulsecaster
      ? pulseCfg.heavyShot.maxChargeTime
      : isBreaker
        ? breakerCfg.heavySlam.maxChargeTime
        : GAME_CONFIG.player.heavyAttack.maxChargeTime;

  if (
    p.bufferedAction === 'heavy' &&
    (isNeutralState || canChainCancelRecovery || canFlowCancelHeavy)
  ) {
    const execCandidate = findExecutionCandidate(world);
    if (execCandidate) {
      p.bufferedAction = 'none';
      if (performChronoExecutionFinisher(world, execCandidate)) {
        return;
      }
    }
    p.bufferedAction = 'none';
    if (isRangedWeapon) {
      if (p.weaponOverheated || p.weaponHeat >= p.maxWeaponHeat) {
        p.lastWeaponShotOutcome = 'overheated';
      } else if (p.weaponShotCooldownTimer <= 0) {
        p.actionState = 'charging_heavy';
        p.chargeTime = heavyChargeThreshold;
        p.currentAttackStartedAt = world.elapsedTime;
        p.currentAttackMarkId = world.resonance.activeMark?.markId ?? null;
        world.events.push({
          type: 'player_heavy_charge_ready',
          x: p.x,
          z: p.z,
          weaponId: p.equippedWeaponId,
        });
        startPulsecasterHeavyWindup(world, input, moveVec);
        return;
      } else {
        p.lastWeaponShotOutcome = 'cooldown';
      }
    } else {
      p.actionState = 'charging_heavy';
      p.chargeTime = heavyChargeThreshold;
      p.currentAttackStartedAt = world.elapsedTime;
      p.currentAttackMarkId = world.resonance.activeMark?.markId ?? null;
      world.events.push({
        type: 'player_heavy_charge_ready',
        x: p.x,
        z: p.z,
        weaponId: p.equippedWeaponId,
      });
      startHeavyWindup(world, input, moveVec);
      return;
    }
  }

  const canStartLightAttack = isRangedWeapon
    ? p.weaponShotCooldownTimer <= 0 &&
      !p.weaponOverheated &&
      (isNeutralState || canFlowCancelLight)
    : p.comboCooldownTimer <= 0 &&
      (isNeutralState || canChainCancelRecovery || canFlowCancelLight);

  if (
    isNeutralState &&
    (isRangedWeapon ? p.weaponShotCooldownTimer <= 0 && !p.weaponOverheated : p.comboCooldownTimer <= 0) &&
    input.heavyHoldActive
  ) {
    if (p.bufferedAction === 'light') {
      p.actionState = 'charging_heavy';
      p.chargeTime = 0;
      p.currentAttackStartedAt = world.elapsedTime;
      p.currentAttackMarkId = world.resonance.activeMark?.markId ?? null;
      p.bufferedAction = 'none';
    }
  } else if (p.bufferedAction === 'light') {
    if (isRangedWeapon) {
      if (p.weaponOverheated) {
        p.bufferedAction = 'none';
        if (!p.activeVentAttempted) {
          const ventResult = evaluateActiveVentTiming(
            p.weaponOverheatTimer,
            activeThermalCfg.overheatLockoutDuration
          );
          if (ventResult.inWindow) {
            p.weaponOverheated = false;
            p.weaponOverheatTimer = 0;
            p.weaponHeat = 0;
            p.weaponShotCooldownTimer = 0;
            p.activeVentAttempted = false;
            p.activeVentEmpoweredShots = ACTIVE_VENT_CONFIG.empoweredShotsGranted;
            p.lastWeaponShotOutcome = 'fired';
            p.flux = Math.min(p.maxFlux, p.flux + ACTIVE_VENT_CONFIG.fluxBonus);
            const ventAdr = applyAdrenalineDelta(p, ADRENALINE_GAINS.activeVent);
            if (ventAdr.tierDelta !== 0) {
              world.events.push({
                type: 'adrenaline_tier_changed',
                x: p.x,
                z: p.z,
                amount: ventAdr.nextTier,
                postureBonus: ventAdr.tierDelta,
              });
            }
            world.events.push({
              type: 'active_vent_success',
              x: p.x,
              z: p.z,
              weaponId: p.equippedWeaponId,
            });
          } else {
            p.activeVentAttempted = true;
            p.lastWeaponShotOutcome = 'overheated';
            world.events.push({
              type: 'active_vent_missed',
              x: p.x,
              z: p.z,
              weaponId: p.equippedWeaponId,
            });
          }
        } else {
          p.lastWeaponShotOutcome = 'overheated';
        }
      } else if (p.weaponHeat >= p.maxWeaponHeat) {
        p.bufferedAction = 'none';
        p.lastWeaponShotOutcome = 'overheated';
      } else if (isNeutralState || canFlowCancelLight) {
        p.bufferedAction = 'none';
        if (startPulsecasterLightShot(world, input, moveVec)) {
          return;
        }
      }
    } else if (canStartLightAttack) {
      p.bufferedAction = 'none';
      startLightAttack(world, input, moveVec);
      return;
    }
  }

  switch (p.actionState) {
    case 'idle':
    case 'moving': {
      if (moveVec.length > 0.05) {
        p.actionState = 'moving';
        const surgeMult = (p.surgeTimer ?? 0) > 0 ? 1.24 : 1.0;
        const speed =
          GAME_CONFIG.player.moveSpeed *
          getCombatFlowMovementSpeedMultiplier(p) *
          surgeMult *
          playerRigMods.moveSpeedMultiplier *
          playerRecMods.moveSpeedMultiplier *
          moveVec.length;
        p.vx = moveVec.dirX * speed;
        p.vz = moveVec.dirZ * speed;
        const targetAngle = Math.atan2(moveVec.dirX, moveVec.dirZ);
        p.rotationY = dampAngle(p.rotationY, targetAngle, GAME_CONFIG.player.turnSpeed, dt);
        p.gaitPhase += speed * dt * 1.8;
      } else {
        p.actionState = 'idle';
        p.vx = 0;
        p.vz = 0;
      }
      break;
    }

    case 'charging_heavy': {
      const prevCharge = p.chargeTime;
      p.chargeTime += dt;
      if (
        prevCharge < heavyChargeThreshold &&
        p.chargeTime >= heavyChargeThreshold
      ) {
        world.events.push({
          type: 'player_heavy_charge_ready',
          x: p.x,
          z: p.z,
          weaponId: p.equippedWeaponId,
        });
      }

      const speedMult =
        p.chargeTime >= GAME_CONFIG.player.chargeSlowdownGraceTime
          ? GAME_CONFIG.player.chargeMoveSpeedMultiplier
          : 1.0;
      const speed = GAME_CONFIG.player.moveSpeed * speedMult * moveVec.length;
      p.vx = moveVec.dirX * speed;
      p.vz = moveVec.dirZ * speed;

      if (moveVec.length > 0.05) {
        const targetAngle = Math.atan2(moveVec.dirX, moveVec.dirZ);
        p.rotationY = dampAngle(p.rotationY, targetAngle, GAME_CONFIG.player.turnSpeed * 0.75, dt);
        p.gaitPhase += speed * dt * 1.8;
      } else if (typeof input.aimWorldX === 'number' && typeof input.aimWorldZ === 'number') {
        const aimAngle = Math.atan2(input.aimWorldX - p.x, input.aimWorldZ - p.z);
        p.rotationY = dampAngle(p.rotationY, aimAngle, 16, dt);
      } else if (p.chargeTime >= GAME_CONFIG.player.chargeSlowdownGraceTime) {
        p.rotationY = dampAngle(p.rotationY, input.aimYaw, 16, dt);
      }

      const released = input.heavyJustReleased || !input.heavyHoldActive;
      const reachedMax = p.chargeTime >= heavyMaxChargeTime;

      if (released || reachedMax) {
        if (p.chargeTime >= heavyChargeThreshold) {
          if (isRangedWeapon) {
            startPulsecasterHeavyWindup(world, input, moveVec);
          } else {
            startHeavyWindup(world, input, moveVec);
          }
        } else {
          p.chargeTime = 0;
          if (isRangedWeapon) {
            startPulsecasterLightShot(world, input, moveVec);
          } else {
            startLightAttack(world, input, moveVec);
          }
        }
      }
      break;
    }

    case 'light_windup': {
      p.stateTimer -= dt;
      if (isRangedWeapon) {
        p.vx = moveVec.dirX * GAME_CONFIG.player.moveSpeed * 0.52;
        p.vz = moveVec.dirZ * GAME_CONFIG.player.moveSpeed * 0.52;
        if (p.stateTimer <= 0) {
          p.actionState = 'light_active';
          p.stateTimer = isPhaseRail ? railCfg.lightShot.active : pulseCfg.lightShot.active;
          firePlayerPulsecasterProjectile(world, false);
        }
      } else {
        const lunge = isBreaker
          ? (breakerCfg.lightSlam.lungeSpeed[p.comboIndex] ?? 2.8)
          : (GAME_CONFIG.player.lightAttack.lungeSpeed[p.comboIndex] ?? 3.5);
        p.vx = Math.sin(p.rotationY) * lunge;
        p.vz = Math.cos(p.rotationY) * lunge;
        if (p.stateTimer <= 0) {
          p.actionState = 'light_active';
          p.stateTimer = isBreaker
            ? (breakerCfg.lightSlam.active[p.comboIndex] ?? 0.16)
            : (GAME_CONFIG.player.lightAttack.active[p.comboIndex] ?? 0.12);
          world.events.push({
            type: isBreaker
              ? 'breaker_shockwave_slam'
              : p.equippedWeaponId === 'chrono_scythe'
                ? 'player_scythe_swing'
                : 'player_light_swing',
            x: p.x,
            z: p.z,
            weaponId: p.equippedWeaponId,
          });
          performPlayerMeleeHitCheck(world, false);
        }
      }
      break;
    }

    case 'light_active': {
      p.stateTimer -= dt;
      if (isRangedWeapon) {
        p.vx = -Math.sin(p.rotationY) * (isPhaseRail ? 1.05 : 0.65);
        p.vz = -Math.cos(p.rotationY) * (isPhaseRail ? 1.05 : 0.65);
        if (p.stateTimer <= 0) {
          p.actionState = 'light_recovery';
          p.stateTimer = isPhaseRail ? railCfg.lightShot.recovery : pulseCfg.lightShot.recovery;
          p.comboWindowTimer = 0;
        }
      } else {
        p.vx = Math.sin(p.rotationY) * 1.5;
        p.vz = Math.cos(p.rotationY) * 1.5;
        performPlayerMeleeHitCheck(world, false);
        if (p.stateTimer <= 0) {
          clearActiveStrikeFlow(p);
          p.actionState = 'light_recovery';
          const recDuration = isBreaker
            ? (breakerCfg.lightSlam.recovery[p.comboIndex] ?? 0.28) +
              (getEquippedWeaponUpgrade(world, 'grav_breaker') === 'breaker_seismic_core'
                ? GAME_CONFIG.weapons.upgrades.breaker_seismic_core.recoveryDelta
                : 0)
            : (GAME_CONFIG.player.lightAttack.recovery[p.comboIndex] ?? 0.24);
          p.stateTimer = recDuration;
          if (p.comboIndex < maxComboIdx) {
            p.comboWindowTimer =
              recDuration +
              (isBreaker
                ? breakerCfg.lightSlam.comboResetTime
                : GAME_CONFIG.player.lightAttack.comboResetTime);
          } else {
            p.comboWindowTimer = 0;
            p.comboCooldownTimer =
              recDuration +
              (isBreaker
                ? breakerCfg.lightSlam.finisherCooldown
                : GAME_CONFIG.player.lightAttack.finisherCooldown);
          }
        }
      }
      break;
    }

    case 'light_recovery': {
      p.stateTimer -= dt;
      const moveMult =
        !isRangedWeapon && p.comboIndex === maxComboIdx
          ? GAME_CONFIG.player.attackMoveSpeedMultiplier * 0.55
          : GAME_CONFIG.player.attackMoveSpeedMultiplier;
      p.vx = moveVec.dirX * GAME_CONFIG.player.moveSpeed * moveMult;
      p.vz = moveVec.dirZ * GAME_CONFIG.player.moveSpeed * moveMult;
      if (moveVec.length > 0.05) {
        const targetYaw = Math.atan2(moveVec.dirX, moveVec.dirZ);
        p.rotationY = dampAngle(
          p.rotationY,
          targetYaw,
          GAME_CONFIG.player.turnSpeed * 0.65,
          dt
        );
        p.gaitPhase += dt * 9.5;
      }
      if (p.stateTimer <= 0) {
        if (p.comboIndex === maxComboIdx) {
          p.comboIndex = 0;
        }
        p.actionState = moveVec.length > 0.05 ? 'moving' : 'idle';
      }
      break;
    }

    case 'heavy_windup': {
      p.stateTimer -= dt;
      if (isRangedWeapon) {
        p.vx = moveVec.dirX * GAME_CONFIG.player.moveSpeed * 0.35;
        p.vz = moveVec.dirZ * GAME_CONFIG.player.moveSpeed * 0.35;
        if (p.stateTimer <= 0) {
          p.actionState = 'heavy_active';
          p.stateTimer = isPhaseRail ? railCfg.heavyShot.active : pulseCfg.heavyShot.active;
          p.squashX = 1.16;
          p.squashY = 0.86;
          firePlayerPulsecasterProjectile(world, true);
        }
      } else {
        const lunge = isBreaker
          ? breakerCfg.heavySlam.lungeSpeed
          : GAME_CONFIG.player.heavyAttack.lungeSpeed;
        p.vx = Math.sin(p.rotationY) * lunge;
        p.vz = Math.cos(p.rotationY) * lunge;
        if (p.stateTimer <= 0) {
          p.actionState = 'heavy_active';
          p.stateTimer = isBreaker
            ? breakerCfg.heavySlam.active
            : GAME_CONFIG.player.heavyAttack.active;
          p.squashX = 1.24;
          p.squashY = 0.78;
          world.events.push({
            type: isBreaker ? 'breaker_shockwave_slam' : 'player_heavy_swing',
            x: p.x,
            z: p.z,
            isHeavy: true,
            weaponId: p.equippedWeaponId,
          });
          performPlayerMeleeHitCheck(world, true);
        }
      }
      break;
    }

    case 'heavy_active': {
      p.stateTimer -= dt;
      if (isRangedWeapon) {
        p.vx = -Math.sin(p.rotationY) * (isPhaseRail ? 1.85 : 1.35);
        p.vz = -Math.cos(p.rotationY) * (isPhaseRail ? 1.85 : 1.35);
        if (p.stateTimer <= 0) {
          p.actionState = 'heavy_recovery';
            p.stateTimer = isPhaseRail
            ? getEquippedWeaponUpgrade(world, 'phase_rail') === 'rail_null_aperture'
              ? GAME_CONFIG.weapons.upgrades.rail_null_aperture.heavyRecovery -
                (isUpgradeOverclocked(
                  'rail_null_aperture',
                  world.progression?.overclockedUpgrades
                )
                  ? 0.08
                  : 0)
              : railCfg.heavyShot.recovery
            : getEquippedWeaponUpgrade(world, 'pulsecaster') === 'pulse_overcharge_condenser'
              ? GAME_CONFIG.weapons.upgrades.pulse_overcharge_condenser.heavyRecovery
              : pulseCfg.heavyShot.recovery;
          p.isEmpoweredHeavy = false;
        }
      } else {
        p.vx = Math.sin(p.rotationY) * 2.5;
        p.vz = Math.cos(p.rotationY) * 2.5;
        performPlayerMeleeHitCheck(world, true);
        if (p.stateTimer <= 0) {
          clearActiveStrikeFlow(p);
          p.actionState = 'heavy_recovery';
          const breakerUp = getEquippedWeaponUpgrade(world, 'grav_breaker');
          const isBreakerRecOverclocked = isUpgradeOverclocked(
            breakerUp,
            world.progression?.overclockedUpgrades
          );
          const edgeUp = getEquippedWeaponUpgrade(world, 'chrono_edge');
          const isEdgeRecOverclocked = isUpgradeOverclocked(
            edgeUp,
            world.progression?.overclockedUpgrades
          );
          p.stateTimer = isBreaker
            ? breakerCfg.heavySlam.recovery +
              (breakerUp === 'breaker_singularity_coil'
                ? GAME_CONFIG.weapons.upgrades.breaker_singularity_coil.heavyRecoveryDelta
                : breakerUp === 'breaker_seismic_core' && !isBreakerRecOverclocked
                  ? GAME_CONFIG.weapons.upgrades.breaker_seismic_core.recoveryDelta
                  : 0)
            : GAME_CONFIG.player.heavyAttack.recovery +
              (edgeUp === 'edge_breaker_cleave' && !isEdgeRecOverclocked
                ? GAME_CONFIG.weapons.upgrades.edge_breaker_cleave.heavyRecoveryDelta
                : 0);
          p.isEmpoweredHeavy = false;
        }
      }
      break;
    }

    case 'heavy_recovery': {
      p.stateTimer -= dt;
      if (p.stateTimer <= 0.18 && moveVec.length > 0.05) {
        const driftSpeed = GAME_CONFIG.player.moveSpeed * 0.42;
        p.vx = moveVec.dirX * driftSpeed;
        p.vz = moveVec.dirZ * driftSpeed;
        const targetYaw = Math.atan2(moveVec.dirX, moveVec.dirZ);
        p.rotationY = dampAngle(
          p.rotationY,
          targetYaw,
          GAME_CONFIG.player.turnSpeed * 0.5,
          dt
        );
        p.gaitPhase += dt * 7.5;
      } else {
        const decay = Math.exp(-9.5 * dt);
        p.vx *= decay;
        p.vz *= decay;
      }
      if (p.stateTimer <= 0) {
        p.actionState = moveVec.length > 0.05 ? 'moving' : 'idle';
      }
      break;
    }

    case 'dodging': {
      p.stateTimer -= dt;
      const dodgeProtoMods = getPlayerProtocolModifiers(world);
      const speed =
        GAME_CONFIG.player.dodge.speed * dodgeProtoMods.dodgeImpulseMultiplier;
      p.vx = Math.sin(p.rotationY) * speed;
      p.vz = Math.cos(p.rotationY) * speed;
      if (p.stateTimer <= 0) {
        p.actionState = moveVec.length > 0.05 ? 'moving' : 'idle';
      }
      break;
    }

    case 'parry_active': {
      p.stateTimer -= dt;
      p.vx = 0;
      p.vz = 0;
      if (p.stateTimer <= 0) {
        p.actionState = 'parry_recovery';
        p.stateTimer = Math.max(
          0.08,
          GAME_CONFIG.player.parry.recovery + playerRigMods.parryRecoveryDelta
        );
      }
      break;
    }

    case 'parry_recovery': {
      p.stateTimer -= dt;
      p.vx = moveVec.dirX * GAME_CONFIG.player.moveSpeed * 0.45;
      p.vz = moveVec.dirZ * GAME_CONFIG.player.moveSpeed * 0.45;
      if (moveVec.length > 0.05) {
        const targetYaw = Math.atan2(moveVec.dirX, moveVec.dirZ);
        p.rotationY = dampAngle(
          p.rotationY,
          targetYaw,
          GAME_CONFIG.player.turnSpeed * 0.6,
          dt
        );
        p.gaitPhase += dt * 8.0;
      }
      if (p.stateTimer <= 0) {
        p.actionState = moveVec.length > 0.05 ? 'moving' : 'idle';
      }
      break;
    }
  }

  p.x += p.vx * dt;
  p.z += p.vz * dt;
}

export function applyDamageToPlayer(
  world: WorldState,
  damage: number,
  attacker?: EnemyState
): boolean {
  const p = world.player;
  if (p.actionState === 'dead' || world.outcome !== 'none') return false;

  // Check timed Parry deflection
  if (p.actionState === 'parry_active') {
    const rigMods = getPlayerRigModifiers(world);
    p.flux = Math.min(
      p.maxFlux,
      p.flux + GAME_CONFIG.player.fluxGainOnParry + rigMods.parrySlipBonusFlux
    );
    if (rigMods.parryIntegrityHeal > 0) {
      p.integrity = Math.min(
        p.maxIntegrity,
        p.integrity + rigMods.parryIntegrityHeal
      );
      p.ghostIntegrity = Math.max(p.ghostIntegrity, p.integrity);
    }
    if (rigMods.parryShockwaveStagger > 0) {
      for (let i = 0; i < world.enemies.length; i++) {
        const nearby = world.enemies[i];
        if (nearby.hp <= 0 || nearby.aiState === 'ko') continue;
        if (Math.hypot(nearby.x - p.x, nearby.z - p.z) <= 4.2 + nearby.radius) {
          nearby.stagger = Math.min(
            nearby.maxStagger,
            nearby.stagger + rigMods.parryShockwaveStagger
          );
          nearby.hitFlashTimer = Math.max(nearby.hitFlashTimer, 0.16);
          if (world.boss && world.boss.id === nearby.id) {
            world.boss.stagger = nearby.stagger;
          }
        }
      }
    }
    p.invulnTimer = Math.max(p.invulnTimer, 0.35);
    p.actionState = 'idle';
    p.stateTimer = 0;
    clearActiveStrikeFlow(p);
    grantRiposteWindow(p);
    world.stats.parriesLanded += 1;
    world.hitstopTimer = Math.max(world.hitstopTimer, 0.085);
    world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.48);

    if (attacker && attacker.hp > 0 && attacker.aiState !== 'ko') {
      const boss = world.boss && world.boss.id === attacker.id ? world.boss : null;
      if (boss) {
        boss.activeAttack = null;
        boss.shockwaveActive = false;
        boss.coreExposed = true;
        boss.vx = 0;
        boss.vz = 0;
        attacker.vx = 0;
        attacker.vz = 0;
        attacker.hitFlashTimer = 0.22;
        boss.hitFlashTimer = 0.22;

        if (boss.staggerCooldownTimer <= 0) {
          boss.stagger = Math.min(
            boss.maxStagger,
            boss.stagger + GAME_CONFIG.boss.parryStaggerDamage
          );
          attacker.stagger = boss.stagger;
        }

        if (boss.stagger >= boss.maxStagger && boss.staggerCooldownTimer <= 0) {
          boss.aiState = 'staggered';
          boss.stateDuration = GAME_CONFIG.boss.staggeredDuration;
          boss.stateTimer = boss.stateDuration;
          boss.stagger = 0;
          boss.staggerCooldownTimer =
            GAME_CONFIG.boss.staggeredDuration + GAME_CONFIG.boss.staggerCooldown;
          boss.statusLabel = 'PARRY COUNTER · CHRONO CORE EXPOSED (1.5x)';
          attacker.aiState = 'staggered';
          attacker.stateDuration = boss.stateDuration;
          attacker.stateTimer = boss.stateTimer;
          attacker.stagger = 0;
          world.events.push({
            type: 'boss_staggered',
            x: attacker.x,
            z: attacker.z,
            enemyId: attacker.id,
            bossPhase: boss.phase,
          });
          world.events.push({
            type: 'enemy_staggered',
            x: attacker.x,
            z: attacker.z,
            enemyId: attacker.id,
          });
        } else {
          boss.aiState = 'recovery';
          boss.stateDuration = 1.15;
          boss.stateTimer = 1.15;
          boss.statusLabel = 'PARRY DEFLECTED · CORE EXPOSED (1.5x)';
          attacker.aiState = 'recovery';
          attacker.stateDuration = 1.15;
          attacker.stateTimer = 1.15;
          world.events.push({
            type: 'boss_core_exposed',
            x: attacker.x,
            z: attacker.z,
            enemyId: attacker.id,
            bossPhase: boss.phase,
          });
        }
      } else {
        attacker.aiState = 'staggered';
        attacker.stateDuration = GAME_CONFIG.enemies[attacker.archetype].staggeredDuration;
        attacker.stateTimer = attacker.stateDuration;
        attacker.stagger = 0;
        attacker.hitFlashTimer = 0.22;
        world.events.push({
          type: 'enemy_staggered',
          x: attacker.x,
          z: attacker.z,
          enemyId: attacker.id,
        });
      }
    }

    const parryStanceMods = computeStanceDoctrineModifiers(
      world.exploration?.resolvedStoryChoices
    );
    if (parryStanceMods.parryHealBonus > 0 && p.integrity > 0) {
      p.integrity = Math.min(p.maxIntegrity, p.integrity + parryStanceMods.parryHealBonus);
      p.ghostIntegrity = Math.max(p.ghostIntegrity, p.integrity);
    }
    world.events.push({
      type: 'player_parry_success',
      x: p.x,
      z: p.z,
      enemyId: attacker?.id,
    });
    const parryAdr = applyAdrenalineDelta(p, ADRENALINE_GAINS.parry);
    if (parryAdr.tierDelta !== 0) {
      world.events.push({
        type: 'adrenaline_tier_changed',
        x: p.x,
        z: p.z,
        amount: parryAdr.nextTier,
        postureBonus: parryAdr.tierDelta,
      });
    }
    return false;
  }

  // Check Dodge / Hurt invulnerability (reward timed Dodges through attacks with Chrono Slip)
  if (p.invulnTimer > 0) {
    if (p.actionState === 'dodging' && !p.dodgeCounterTriggered) {
      p.dodgeCounterTriggered = true;
      p.invulnTimer = Math.max(
        p.invulnTimer,
        COMBAT_FLOW_CONFIG.chronoSlipInvulnExtension
      );
      const rigMods = getPlayerRigModifiers(world);
      const rawGain =
        COMBAT_FLOW_CONFIG.chronoSlipFluxGain + rigMods.parrySlipBonusFlux;
      const fluxGain =
        (p.fluxDampenedTimer ?? 0) > 0 ? Math.round(rawGain * 0.65) : rawGain;
      p.flux = Math.min(p.maxFlux, p.flux + fluxGain);
      grantChronoSlipWindow(p);
      world.stats.perfectDodges = (world.stats.perfectDodges ?? 0) + 1;
      world.hitstopTimer = Math.max(world.hitstopTimer, 0.042);
      world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.22);
      world.events.push({
        type: 'player_perfect_dodge',
        x: p.x,
        z: p.z,
        enemyId: attacker?.id,
        amount: fluxGain,
      });
      const slipMasterySeal = computeMasterySealModifiers(world.progression?.combatMastery);
      const temporalSlip = tryTriggerTemporalSlip(p, slipMasterySeal.bonusSlipDurationSec);
      if (temporalSlip.triggered) {
        world.events.push({
          type: 'temporal_slip_triggered',
          x: p.x,
          z: p.z,
          enemyId: attacker?.id,
          amount: Math.round(temporalSlip.durationSec * 100),
        });
        if (slipMasterySeal.tier >= 1) {
          applySovereignAstralPulse(world, slipMasterySeal.tier);
        }
      }
      const slipAdr = applyAdrenalineDelta(p, ADRENALINE_GAINS.chronoSlip);
      if (slipAdr.tierDelta !== 0) {
        world.events.push({
          type: 'adrenaline_tier_changed',
          x: p.x,
          z: p.z,
          amount: slipAdr.nextTier,
          postureBonus: slipAdr.tierDelta,
        });
      }
    }
    return false;
  }

  const pxDmg = ensureParadoxState(world);
  const dmgMutMods = computeMutatorModifiers(pxDmg.mutators);
  const diffDmgMult = world.progression?.difficultyTier
    ? getDifficultySpec(world.progression.difficultyTier).enemyDamageMult
    : 1.0;
  const koDefMods = getActiveWeaponOverchargeModifiers(
    world.kineticOvercharge,
    p.equippedWeaponId
  );
  const defDocSpec = getEchoDoctrineSpec(world.progression?.echoDoctrine);
  const bastionTetherMult =
    defDocSpec.tetherRadius > 0 &&
    world.echo.state === 'playback' &&
    world.echo.activeActor &&
    Math.hypot(world.echo.activeActor.x - p.x, world.echo.activeActor.z - p.z) <=
      defDocSpec.tetherRadius
      ? defDocSpec.tetherIncomingDamageMult
      : 1.0;
  let effectiveIncoming = Math.max(
    1,
    Math.round(
      damage *
        dmgMutMods.incomingDamageMult *
        diffDmgMult *
        koDefMods.damageTakenMult *
        bastionTetherMult
    )
  );
  const aegisRes = absorbIncomingDamageWithAegis(pxDmg.loadout, effectiveIncoming);
  if (aegisRes.absorbed > 0) {
    world.events.push({
      type: 'aegis_shield_absorbed',
      x: p.x,
      z: p.z,
      amount: Math.round(aegisRes.absorbed),
    });
  }
  effectiveIncoming = aegisRes.remainingDamage;
  if (effectiveIncoming > 0 && world.chronoAegis) {
    const wardRes = absorbDamageWithChronoWard(world.chronoAegis, effectiveIncoming);
    if (wardRes.absorbed > 0) {
      world.events.push({
        type: 'chrono_ward_absorbed',
        x: p.x,
        z: p.z,
        amount: Math.round(wardRes.absorbed),
      });
    }
    if (wardRes.shatteredShockwave) {
      world.events.push({
        type: 'chrono_ward_shatter',
        x: p.x,
        z: p.z,
        amount: 20,
      });
      for (let wi = 0; wi < world.enemies.length; wi++) {
        const we = world.enemies[wi];
        if (we.hp <= 0 || we.aiState === 'ko') continue;
        if (Math.hypot(we.x - p.x, we.z - p.z) <= 4.2 + we.radius) {
          we.stagger = Math.min(we.maxStagger, we.stagger + 20);
          we.hitFlashTimer = Math.max(we.hitFlashTimer, 0.16);
          if (
            world.boss &&
            world.boss.id === we.id &&
            world.boss.staggerCooldownTimer <= 0 &&
            world.boss.aiState !== 'phase_transition'
          ) {
            world.boss.stagger = we.stagger;
          }
        }
      }
    }
    effectiveIncoming = wardRes.remainingDamage;
  }
  if (effectiveIncoming <= 0) {
    p.invulnTimer = Math.max(p.invulnTimer, 0.26);
    p.hurtFlashTimer = 0.11;
    return true;
  }
  if (world.boss && world.boss.hp > 0) {
    pxDmg.bossTookDamageThisFight = true;
  }
  damage = effectiveIncoming;

  p.integrity = Math.max(0, p.integrity - damage);
  p.invulnTimer = GAME_CONFIG.player.hurtInvulnDuration;
  p.hurtFlashTimer = 0.22;
  p.squashX = 1.2;
  p.squashY = 0.82;
  world.stats.damageTaken += damage;
  world.hitstopTimer = Math.max(world.hitstopTimer, 0.05);
  world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.52);

  // Interrupt charging if hit
  if (p.actionState === 'charging_heavy') {
    p.actionState = 'idle';
    p.chargeTime = 0;
  }

  world.events.push({
    type: 'player_damaged',
    x: p.x,
    z: p.z,
    amount: damage,
    enemyId: attacker?.id,
  });
  const dmgAdr = applyAdrenalineDelta(p, ADRENALINE_GAINS.damageTakenPenalty, false);
  if (dmgAdr.tierDelta !== 0) {
    world.events.push({
      type: 'adrenaline_tier_changed',
      x: p.x,
      z: p.z,
      amount: dmgAdr.nextTier,
      postureBonus: dmgAdr.tierDelta,
    });
  }

  if (p.integrity <= 0) {
    p.actionState = 'dead';
    p.vx = 0;
    p.vz = 0;
    world.outcome = 'defeat';
    world.outcomeDelayTimer = 0.55;
    clearEchoState(world, 'outcome');
    world.events.push({
      type: 'encounter_defeat',
      x: p.x,
      z: p.z,
    });
  }

  return true;
}

export function isPlayerInCalibrationZone(world: WorldState): boolean {
  const p = world.player;
  const cal = GAME_CONFIG.arena.chronoPuzzle.calibrationZone;
  if (p.z < cal.minZ) return false;

  // Inside the southwestern calibration alcove (Stage 1 Pad 01, Stage 2 Heavy Receiver, Stage 3 Combine Pad 02 & Final Barrier)
  if (p.x <= cal.maxX) return true;

  // Protect the initial southern spawn pad (z >= 11.2) before Sera steps North into the combat bay
  if (
    p.z >= 11.2 &&
    p.x >= cal.spawnRecordMinX &&
    p.x <= cal.spawnRecordMaxX
  ) {
    return true;
  }

  // Also protect the initial spawn-to-Pad-01 approach while actively recording an Echo clip
  if (
    world.echo.state === 'recording' &&
    p.z >= cal.spawnRecordMinZ &&
    p.x >= cal.spawnRecordMinX &&
    p.x <= cal.spawnRecordMaxX
  ) {
    return true;
  }

  return false;
}

const PHASE1_BOSS_PATTERN: readonly BossAttackType[] = [
  'vector_ram',
  'helical_sweep',
  'anchor_slam',
  'helical_sweep',
];

const PHASE2_BOSS_PATTERN: readonly BossAttackType[] = [
  'vector_ram',
  'anchor_slam',
  'helical_sweep',
  'vector_ram',
  'anchor_slam',
];

const CHOIR_ATTACK_PATTERN: readonly BossAttackType[] = [
  'resonance_wave',
  'helical_sweep',
  'cadenza_slam',
  'resonance_wave',
];

const CURATOR_ATTACK_PATTERN: readonly BossAttackType[] = [
  'archive_lance',
  'reconstructed_sweep',
  'vector_ram',
  'archive_lance',
];

const MATRON_ATTACK_PATTERN: readonly BossAttackType[] = [
  'chrono_sever',
  'surgical_incision',
  'quarantine_wave',
  'chrono_sever',
];

const WARDEN_PRIME_ATTACK_PATTERN: readonly BossAttackType[] = [
  'directive_lance',
  'temporal_convergence_grid',
  'sovereign_purge_wave',
  'directive_lance',
];

const ECHO_ZERO_ATTACK_PATTERN: readonly BossAttackType[] = [
  'paradox_blink_slash',
  'paradox_rail_lance',
  'paradox_twin_pincer',
  'paradox_blink_slash',
];

export function selectNextBossAttack(
  boss: BossState,
  distToPlayer: number,
  hasActiveEcho = false
): BossAttackType {
  if (boss.id === 'echo-zero') {
    let chosen =
      ECHO_ZERO_ATTACK_PATTERN[boss.attackSequenceIndex % ECHO_ZERO_ATTACK_PATTERN.length];
    if (distToPlayer > 6.8) {
      chosen = 'paradox_rail_lance';
    } else if (distToPlayer <= 3.6 && boss.lastAttack !== 'paradox_twin_pincer') {
      chosen = 'paradox_twin_pincer';
    }
    boss.attackSequenceIndex += 1;
    boss.lastAttack = chosen;
    return chosen;
  }

  if (boss.id === 'the-choir') {
    const chosen = CHOIR_ATTACK_PATTERN[boss.attackSequenceIndex % CHOIR_ATTACK_PATTERN.length];
    boss.attackSequenceIndex += 1;
    boss.lastAttack = chosen;
    return chosen;
  }

  if (boss.id === 'the-curator') {
    const chosen = CURATOR_ATTACK_PATTERN[boss.attackSequenceIndex % CURATOR_ATTACK_PATTERN.length];
    boss.attackSequenceIndex += 1;
    boss.lastAttack = chosen;
    return chosen;
  }

  if (boss.id === 'matron-v') {
    let chosen = MATRON_ATTACK_PATTERN[boss.attackSequenceIndex % MATRON_ATTACK_PATTERN.length];
    if (hasActiveEcho && boss.lastAttack !== 'chrono_sever') {
      chosen = 'chrono_sever';
    }
    boss.attackSequenceIndex += 1;
    boss.lastAttack = chosen;
    return chosen;
  }

  if (boss.id === 'warden-prime') {
    let chosen =
      WARDEN_PRIME_ATTACK_PATTERN[boss.attackSequenceIndex % WARDEN_PRIME_ATTACK_PATTERN.length];
    if (distToPlayer > 6.5) {
      chosen = 'directive_lance';
    } else if (distToPlayer <= 3.8 && boss.phase === 2 && boss.lastAttack !== 'sovereign_purge_wave') {
      chosen = 'sovereign_purge_wave';
    }
    boss.attackSequenceIndex += 1;
    boss.lastAttack = chosen;
    return chosen;
  }

  const pattern = boss.phase === 2 ? PHASE2_BOSS_PATTERN : PHASE1_BOSS_PATTERN;
  let chosen = pattern[boss.attackSequenceIndex % pattern.length];

  // Distance-aware deterministic selection:
  // Long range (> 5.8m): prefer Vector Ram to close the gap along a telegraphed lane
  if (distToPlayer > 5.8) {
    chosen = 'vector_ram';
  } else if (
    distToPlayer > 4.6 &&
    chosen === 'helical_sweep'
  ) {
    chosen = distToPlayer <= 5.4 && boss.phase === 2 ? 'anchor_slam' : 'vector_ram';
  } else if (
    distToPlayer <= 2.9 &&
    chosen === 'vector_ram' &&
    boss.lastAttack === 'vector_ram'
  ) {
    chosen = boss.phase === 2 ? 'anchor_slam' : 'helical_sweep';
  }

  boss.attackSequenceIndex += 1;
  boss.lastAttack = chosen;
  return chosen;
}

export function spawnCuratorReconstructedTraces(
  world: WorldState,
  originX: number,
  originZ: number,
  aimAngle: number,
  attackId: 'archive_lance' | 'reconstructed_sweep' = 'archive_lance'
): void {
  const cur = world.curator;
  if (!cur.active) return;

  const dirX = Math.sin(aimAngle);
  const dirZ = Math.cos(aimAngle);
  const seq = cur.nextTraceSeq;
  cur.nextTraceSeq += 1;
  const lanceCfg = GAME_CONFIG.curator.traceConfig.archive_lance;
  const sweepCfg = GAME_CONFIG.curator.traceConfig.reconstructed_sweep;

  // Primary damaging reconstructed attack trace locked along aimAngle
  cur.traces.push({
    id: `trace-${seq}-real`,
    attackId,
    label: attackId === 'archive_lance' ? lanceCfg.label : sweepCfg.label,
    state: 'warning',
    originX,
    originZ,
    dirX,
    dirZ,
    rotationY: aimAngle,
    length: lanceCfg.length,
    width: lanceCfg.width,
    radius: sweepCfg.radius,
    arcRadians: sweepCfg.arcRadians,
    timer: attackId === 'archive_lance' ? lanceCfg.warningDuration : sweepCfg.warningDuration,
    warningDuration:
      attackId === 'archive_lance' ? lanceCfg.warningDuration : sweepCfg.warningDuration,
    commitDuration:
      attackId === 'archive_lance' ? lanceCfg.commitDuration : sweepCfg.commitDuration,
    activeDuration:
      attackId === 'archive_lance' ? lanceCfg.activeDuration : sweepCfg.activeDuration,
    residueDuration:
      attackId === 'archive_lance' ? lanceCfg.residueDuration : sweepCfg.residueDuration,
    damage: attackId === 'archive_lance' ? lanceCfg.damage : sweepCfg.damage,
    hitApplied: false,
    isHarmlessResidue: false,
  });

  // Secondary harmless archival memory residue trace offset by +38 deg so player can distinguish real vs harmless residue
  const residueAngle = wrapAngle(aimAngle + 0.66);
  cur.traces.push({
    id: `trace-${seq}-residue`,
    attackId,
    label: 'ARCHIVAL MEMORY RESIDUE (HARMLESS)',
    state: 'residue',
    originX,
    originZ,
    dirX: Math.sin(residueAngle),
    dirZ: Math.cos(residueAngle),
    rotationY: residueAngle,
    length: lanceCfg.length * 0.78,
    width: lanceCfg.width * 0.75,
    radius: sweepCfg.radius * 0.78,
    arcRadians: sweepCfg.arcRadians * 0.8,
    timer:
      lanceCfg.warningDuration + lanceCfg.commitDuration + lanceCfg.activeDuration,
    warningDuration: lanceCfg.warningDuration,
    commitDuration: lanceCfg.commitDuration,
    activeDuration: lanceCfg.activeDuration,
    residueDuration: lanceCfg.residueDuration,
    damage: 0,
    hitApplied: true,
    isHarmlessResidue: true,
  });

  cur.statusMessage =
    'ARCHIVAL TRACE RECONSTRUCTED // SOLID AMBER LANE IS DAMAGING — DASHED ECHO RESIDUE IS HARMLESS';
  world.events.push({
    type: 'curator_trace_spawned',
    x: originX,
    z: originZ,
  });
}

export function beginBossTelegraph(
  world: WorldState,
  boss: BossState,
  enemy: EnemyState,
  attack: BossAttackType,
  angleToPlayer: number
): void {
  const cfg = GAME_CONFIG.boss.attacks;
  let telegraphDuration: number;
  let statusLabel: string;

  if (
    attack === 'vector_ram' ||
    attack === 'surgical_incision' ||
    attack === 'directive_lance' ||
    attack === 'paradox_rail_lance'
  ) {
    telegraphDuration =
      attack === 'paradox_rail_lance'
        ? boss.phase === 2
          ? 0.56
          : 0.72
        : attack === 'directive_lance'
          ? boss.phase === 2
            ? GAME_CONFIG.wardenPrime.attacks.directive_lance.telegraphP2
            : GAME_CONFIG.wardenPrime.attacks.directive_lance.telegraphP1
          : boss.phase === 2
            ? cfg.vector_ram.telegraphP2
            : cfg.vector_ram.telegraphP1;
    statusLabel =
      attack === 'paradox_rail_lance'
        ? 'TELEGRAPH · ECHO-ZERO PARADOX RAIL LANCE'
        : attack === 'surgical_incision'
          ? 'TELEGRAPH · SURGICAL INCISION LUNGE'
          : attack === 'directive_lance'
            ? 'TELEGRAPH · SOVEREIGN DIRECTIVE LANCE'
            : 'TELEGRAPH · VECTOR RAM LANE LOCKING';
    if (
      attack === 'directive_lance' &&
      boss.id === 'warden-prime' &&
      boss.phase === 2 &&
      world.curator.active
    ) {
      spawnCuratorReconstructedTraces(
        world,
        boss.x,
        boss.z,
        wrapAngle(angleToPlayer + 0.28),
        'archive_lance'
      );
    }
  } else if (
    attack === 'helical_sweep' ||
    attack === 'temporal_convergence_grid' ||
    attack === 'paradox_blink_slash'
  ) {
    telegraphDuration =
      attack === 'paradox_blink_slash'
        ? boss.phase === 2
          ? 0.52
          : 0.68
        : attack === 'temporal_convergence_grid'
          ? boss.phase === 2
            ? GAME_CONFIG.wardenPrime.attacks.temporal_convergence_grid.telegraphP2
            : GAME_CONFIG.wardenPrime.attacks.temporal_convergence_grid.telegraphP1
          : boss.phase === 2
            ? cfg.helical_sweep.telegraphP2
            : cfg.helical_sweep.telegraphP1;
    statusLabel =
      attack === 'paradox_blink_slash'
        ? 'TELEGRAPH · ECHO-ZERO PARADOX BLINK SLASH'
        : attack === 'temporal_convergence_grid'
          ? 'TELEGRAPH · TEMPORAL CONVERGENCE LATTICE'
          : 'TELEGRAPH · HELICAL SWEEP ARC WINDUP';
    if (
      attack === 'temporal_convergence_grid' &&
      boss.id === 'warden-prime' &&
      boss.phase === 2 &&
      world.curator.active
    ) {
      spawnCuratorReconstructedTraces(
        world,
        boss.x,
        boss.z,
        wrapAngle(angleToPlayer),
        'reconstructed_sweep'
      );
    }
  } else if (
    attack === 'resonance_wave' ||
    attack === 'harmonic_chord' ||
    attack === 'cadenza_slam'
  ) {
    telegraphDuration =
      boss.phase === 2 ? cfg.anchor_slam.telegraphP2 : cfg.anchor_slam.telegraphP1;
    statusLabel = 'TELEGRAPH · HARMONIC CONVERGENCE PULSE';
  } else if (
    attack === 'archive_lance' ||
    attack === 'reconstructed_sweep' ||
    attack === 'curator_burst'
  ) {
    const traceType = attack === 'reconstructed_sweep' ? 'reconstructed_sweep' : 'archive_lance';
    const traceCfg = GAME_CONFIG.curator.traceConfig[traceType];
    telegraphDuration = traceCfg.warningDuration + traceCfg.commitDuration;
    statusLabel = 'TELEGRAPH · ARCHIVE TRACE RECONSTRUCTION';
    spawnCuratorReconstructedTraces(world, boss.x, boss.z, wrapAngle(angleToPlayer), traceType);
  } else if (attack === 'chrono_sever') {
    telegraphDuration =
      boss.phase === 2
        ? GAME_CONFIG.matron.chronoSever.telegraphP2
        : GAME_CONFIG.matron.chronoSever.telegraphP1;
    statusLabel = 'TELEGRAPH · CHRONO SEVER ANTI-ECHO FIELD';
    if (world.matron.active) {
      world.matron.chronoSeverActive = true;
      world.matron.chronoSeverWarningTimer = telegraphDuration;
      if (world.echo.state === 'playback' && world.echo.activeActor) {
        world.matron.chronoSeverZoneX = world.echo.activeActor.x;
        world.matron.chronoSeverZoneZ = world.echo.activeActor.z;
      } else {
        world.matron.chronoSeverZoneX = boss.x;
        world.matron.chronoSeverZoneZ = boss.z;
      }
      world.matron.statusMessage =
        'WARNING: CHRONO SEVER TELEGRAPH // RELAY [V] OR COLLAPSE [X] ECHO BEFORE SEVER DETONATES!';
    }
  } else {
    telegraphDuration =
      attack === 'sovereign_purge_wave'
        ? boss.phase === 2
          ? GAME_CONFIG.wardenPrime.attacks.sovereign_purge_wave.telegraphP2
          : GAME_CONFIG.wardenPrime.attacks.sovereign_purge_wave.telegraphP1
        : boss.phase === 2
          ? cfg.anchor_slam.telegraphP2
          : cfg.anchor_slam.telegraphP1;
    statusLabel =
      attack === 'quarantine_wave'
        ? 'TELEGRAPH · QUARANTINE PULSE WAVE'
        : attack === 'sovereign_purge_wave'
          ? 'TELEGRAPH · SOVEREIGN PURGE CASCADE'
          : 'TELEGRAPH · ANCHOR SLAM RADIAL IMPACT';
  }

  boss.aiState = 'telegraph';
  boss.activeAttack = attack;
  boss.stateDuration = telegraphDuration;
  boss.stateTimer = telegraphDuration;
  boss.telegraphLocked = false;
  boss.hasDealtDamageThisAttack = false;
  boss.shockwaveActive = false;
  boss.shockwaveRadius = 0;
  boss.shockwaveMaxRadius =
    attack === 'chrono_sever'
      ? GAME_CONFIG.matron.chronoSever.radius
      : attack === 'sovereign_purge_wave'
        ? boss.phase === 2
          ? GAME_CONFIG.wardenPrime.attacks.sovereign_purge_wave.outerRadiusP2
          : GAME_CONFIG.wardenPrime.attacks.sovereign_purge_wave.outerRadiusP1
        : boss.phase === 2
          ? cfg.anchor_slam.outerRadiusP2
          : cfg.anchor_slam.outerRadiusP1;
  boss.coreExposed = false;
  boss.rotationY = wrapAngle(angleToPlayer);
  boss.attackOriginX = boss.x;
  boss.attackOriginZ = boss.z;
  boss.attackDirX = Math.sin(boss.rotationY);
  boss.attackDirZ = Math.cos(boss.rotationY);
  boss.targetX = world.player.x;
  boss.targetZ = world.player.z;
  boss.vx = 0;
  boss.vz = 0;
  boss.statusLabel = statusLabel;

  enemy.aiState = 'telegraph';
  enemy.stateDuration = telegraphDuration;
  enemy.stateTimer = telegraphDuration;
  enemy.hasDealtDamageThisAttack = false;
  enemy.rotationY = boss.rotationY;
  enemy.targetX = boss.targetX;
  enemy.targetZ = boss.targetZ;
  enemy.vx = 0;
  enemy.vz = 0;

  world.events.push({
    type: 'boss_telegraph_start',
    x: boss.x,
    z: boss.z,
    enemyId: boss.id,
    bossAttack: attack,
    bossPhase: boss.phase,
  });
  world.events.push({
    type: 'enemy_telegraph_start',
    x: boss.x,
    z: boss.z,
    enemyId: boss.id,
  });
}

export function forceBossAttack(
  world: WorldState,
  attack: BossAttackType
): boolean {
  const boss = world.boss;
  if (!boss || boss.hp <= 0 || boss.aiState === 'defeated') return false;
  const enemy = world.enemies.find((e) => e.id === boss.id);
  if (!enemy) return false;
  const angleToPlayer = Math.atan2(world.player.x - boss.x, world.player.z - boss.z);
  beginBossTelegraph(world, boss, enemy, attack, angleToPlayer);
  return true;
}

function beginBossAttackActive(
  world: WorldState,
  boss: BossState,
  enemy: EnemyState
): void {
  const attack = boss.activeAttack ?? 'helical_sweep';
  const cfg = GAME_CONFIG.boss.attacks;
  let activeDuration: number;
  let statusLabel: string;

  if (
    attack === 'vector_ram' ||
    attack === 'surgical_incision' ||
    attack === 'directive_lance' ||
    attack === 'paradox_rail_lance'
  ) {
    activeDuration =
      attack === 'paradox_rail_lance'
        ? 0.42
        : attack === 'directive_lance'
          ? GAME_CONFIG.wardenPrime.attacks.directive_lance.activeDuration
          : cfg.vector_ram.activeDuration;
    statusLabel =
      attack === 'paradox_rail_lance'
        ? 'COMMITTED · PARADOX RAIL LANCE SURGE'
        : attack === 'surgical_incision'
          ? 'COMMITTED · SURGICAL INCISION THRUST'
          : attack === 'directive_lance'
            ? 'COMMITTED · SOVEREIGN DIRECTIVE LANCE'
            : 'COMMITTED · VECTOR RAM OVERDRIVE';
  } else if (
    attack === 'helical_sweep' ||
    attack === 'temporal_convergence_grid' ||
    attack === 'paradox_blink_slash'
  ) {
    activeDuration =
      attack === 'paradox_blink_slash'
        ? 0.38
        : attack === 'temporal_convergence_grid'
          ? GAME_CONFIG.wardenPrime.attacks.temporal_convergence_grid.activeDuration
          : cfg.helical_sweep.activeDuration;
    statusLabel =
      attack === 'paradox_blink_slash'
        ? 'COMMITTED · PARADOX BLINK CLEAVE'
        : attack === 'temporal_convergence_grid'
          ? 'COMMITTED · TEMPORAL CONVERGENCE CLEAVE'
          : 'COMMITTED · HELICAL CONTAINMENT CLEAVE';
  } else if (
    attack === 'archive_lance' ||
    attack === 'reconstructed_sweep' ||
    attack === 'curator_burst'
  ) {
    activeDuration = GAME_CONFIG.curator.traceConfig.archive_lance.activeDuration;
    statusLabel = 'COMMITTED · ARCHIVAL TRACE DISCHARGE';
  } else if (attack === 'chrono_sever') {
    activeDuration = GAME_CONFIG.matron.chronoSever.activeDuration;
    statusLabel = 'COMMITTED · CHRONO SEVER DISCHARGE';
  } else {
    activeDuration =
      attack === 'sovereign_purge_wave'
        ? GAME_CONFIG.wardenPrime.attacks.sovereign_purge_wave.activeDuration
        : cfg.anchor_slam.activeDuration;
    statusLabel =
      attack === 'resonance_wave' || attack === 'harmonic_chord' || attack === 'cadenza_slam'
        ? 'COMMITTED · HARMONIC RESONANCE WAVE'
        : attack === 'sovereign_purge_wave'
          ? 'COMMITTED · SOVEREIGN PURGE CASCADE'
          : 'COMMITTED · ANCHOR SLAM SHOCKWAVE';
  }

  boss.aiState = 'attack';
  boss.stateDuration = activeDuration;
  boss.stateTimer = activeDuration;
  boss.telegraphLocked = true;
  boss.attackOriginX = boss.x;
  boss.attackOriginZ = boss.z;
  boss.attackDirX = Math.sin(boss.rotationY);
  boss.attackDirZ = Math.cos(boss.rotationY);
  boss.hasDealtDamageThisAttack = false;
  boss.coreExposed = false;
  boss.statusLabel = statusLabel;

  if (
    attack === 'anchor_slam' ||
    attack === 'resonance_wave' ||
    attack === 'harmonic_chord' ||
    attack === 'cadenza_slam' ||
    attack === 'quarantine_wave' ||
    attack === 'chrono_sever' ||
    attack === 'sovereign_purge_wave' ||
    attack === 'paradox_twin_pincer'
  ) {
    boss.shockwaveActive = true;
    boss.shockwaveRadius =
      attack === 'sovereign_purge_wave'
        ? GAME_CONFIG.wardenPrime.attacks.sovereign_purge_wave.innerRadius
        : cfg.anchor_slam.innerRadius;
    boss.shockwaveMaxRadius =
      attack === 'chrono_sever'
        ? GAME_CONFIG.matron.chronoSever.radius
        : attack === 'sovereign_purge_wave'
          ? boss.phase === 2
            ? GAME_CONFIG.wardenPrime.attacks.sovereign_purge_wave.outerRadiusP2
            : GAME_CONFIG.wardenPrime.attacks.sovereign_purge_wave.outerRadiusP1
          : boss.phase === 2
            ? cfg.anchor_slam.outerRadiusP2
            : cfg.anchor_slam.outerRadiusP1;
    world.cameraTrauma = Math.min(1, world.cameraTrauma + 0.38);
  } else {
    boss.shockwaveActive = false;
    boss.shockwaveRadius = 0;
  }

  enemy.aiState = 'attack';
  enemy.stateDuration = activeDuration;
  enemy.stateTimer = activeDuration;
  enemy.hasDealtDamageThisAttack = false;
  enemy.rotationY = boss.rotationY;

  world.events.push({
    type: 'boss_attack_strike',
    x: boss.x,
    z: boss.z,
    enemyId: boss.id,
    bossAttack: attack,
    bossPhase: boss.phase,
  });
  world.events.push({
    type: 'enemy_attack_strike',
    x: boss.x,
    z: boss.z,
    enemyId: boss.id,
  });
}

function updateBoss(world: WorldState, dt: number): void {
  const boss = world.boss;
  if (!boss) return;

  let enemy: EnemyState | undefined;
  for (let i = 0; i < world.enemies.length; i++) {
    if (world.enemies[i].id === boss.id) {
      enemy = world.enemies[i];
      break;
    }
  }
  if (!enemy) return;

  const cfg = GAME_CONFIG.boss;
  boss.hitFlashTimer = Math.max(0, boss.hitFlashTimer - dt);
  boss.cooldownTimer = Math.max(0, boss.cooldownTimer - dt);
  boss.staggerCooldownTimer = Math.max(0, boss.staggerCooldownTimer - dt);
  if ((enemy.pinnedTimer ?? 0) > 0) {
    enemy.pinnedTimer = Math.max(0, (enemy.pinnedTimer ?? 0) - dt);
    boss.pinnedTimer = enemy.pinnedTimer;
  } else {
    boss.pinnedTimer = 0;
  }
  enemy.hitFlashTimer = boss.hitFlashTimer;
  enemy.cooldownTimer = boss.cooldownTimer;

  if (boss.ghostHp > boss.hp) {
    boss.ghostHp = Math.max(boss.hp, boss.ghostHp - 38 * dt);
  } else {
    boss.ghostHp = boss.hp;
  }
  enemy.ghostHp = boss.ghostHp;

  // Terminal defeated state
  if (
    boss.hp <= 0 ||
    enemy.hp <= 0 ||
    boss.aiState === 'ko' ||
    boss.aiState === 'defeated' ||
    enemy.aiState === 'ko'
  ) {
    if (!boss.defeatTriggered) {
      enemy.hp = 0;
      boss.hp = 0;
      handleEnemyZeroHpDefeat(world, enemy, 0, false, false, false);
    }
    boss.aiState = 'ko';
    enemy.aiState = 'ko';
    boss.activeAttack = null;
    boss.shockwaveActive = false;
    boss.coreExposed = false;
    boss.stateTimer = Math.max(0, boss.stateTimer - dt);
    enemy.stateTimer = boss.stateTimer;
    boss.koProgress = Math.min(1, 1 - boss.stateTimer / (boss.stateDuration || 0.55));
    enemy.koProgress = boss.koProgress;
    boss.vx = 0;
    boss.vz = 0;
    enemy.vx = 0;
    enemy.vz = 0;
    return;
  }

  // Gradually decay stagger only during pursue/dormant
  if (boss.aiState === 'pursue' || boss.aiState === 'dormant') {
    boss.stagger = Math.max(0, boss.stagger - 5.5 * dt);
    enemy.stagger = boss.stagger;
  }

  const p = world.player;
  const dxToPlayer = p.x - boss.x;
  const dzToPlayer = p.z - boss.z;
  const distToPlayer = Math.hypot(dxToPlayer, dzToPlayer) || 0.001;
  const angleToPlayer = Math.atan2(dxToPlayer, dzToPlayer);
  const pRadius = GAME_CONFIG.player.radius;
  const isPinned = (enemy.pinnedTimer ?? 0) > 0;
  const choirVulnerable =
    boss.id === 'the-choir' &&
    world.choir.synchronizedCount >= world.choir.requiredNodeCount &&
    world.choir.syncTimer > 0;

  switch (boss.aiState) {
    case 'dormant': {
      boss.stateTimer -= dt;
      boss.vx = 0;
      boss.vz = 0;
      boss.coreExposed = false;
      boss.rotationY = moveAngleTowards(boss.rotationY, angleToPlayer, 3.2 * dt);
      if (boss.stateTimer <= 0) {
        boss.aiState = 'pursue';
        boss.stateDuration = 0;
        boss.stateTimer = 0;
        boss.cooldownTimer = 0.35;
        boss.statusLabel =
          boss.id === 'the-choir'
            ? 'PHASE I · HARMONIC RESONANCE MATRIX'
            : boss.id === 'the-curator'
              ? 'PHASE I · ARCHIVAL RECONSTRUCTION'
              : boss.id === 'matron-v'
                ? 'PHASE I · QUARANTINE SURGICAL WARD'
                : boss.id === 'warden-prime'
                  ? 'PHASE I · SOVEREIGN LOOM DIRECTIVE'
                  : 'PHASE I · CONTAINMENT PROTOCOL';
      }
      enemy.aiState = 'pursue';
      enemy.stateTimer = boss.stateTimer;
      enemy.stateDuration = boss.stateDuration;
      break;
    }

    case 'phase_transition': {
      boss.stateTimer -= dt;
      boss.vx = 0;
      boss.vz = 0;
      boss.activeAttack = null;
      boss.shockwaveActive = false;
      boss.coreExposed = false;
      boss.rotationY = moveAngleTowards(boss.rotationY, angleToPlayer, 4.5 * dt);
      enemy.aiState = 'pursue';
      enemy.stateTimer = boss.stateTimer;
      enemy.stateDuration = boss.stateDuration;
      if (boss.stateTimer <= 0) {
        boss.aiState = 'pursue';
        boss.stateDuration = 0;
        boss.stateTimer = 0;
        boss.cooldownTimer = 0.25;
        boss.statusLabel =
          boss.id === 'the-choir'
            ? 'PHASE II · HARMONIC CONVERGENCE OVERLOAD'
            : boss.id === 'the-curator'
              ? 'PHASE II · ARCHIVAL RECONSTRUCTION SURGE'
              : boss.id === 'matron-v'
                ? 'PHASE II · QUARANTINE SURGICAL PROTOCOL'
                : boss.id === 'warden-prime'
                  ? 'PHASE II · SOVEREIGN CHRONICLE OVERDRIVE'
                  : 'PHASE II · HELIX OVERLOAD';
      }
      break;
    }

    case 'pursue': {
      boss.coreExposed = choirVulnerable;
      boss.activeAttack = null;
      boss.shockwaveActive = false;
      const moveSpeed = isPinned
        ? 0
        : boss.phase === 2
          ? cfg.moveSpeedPhase2
          : cfg.moveSpeedPhase1;
      const turnSpeed =
        boss.phase === 2 ? cfg.turnSpeedPhase2 : cfg.turnSpeedPhase1;

      boss.rotationY = moveAngleTowards(boss.rotationY, angleToPlayer, turnSpeed * dt);

      if (distToPlayer > cfg.preferredRange) {
        boss.vx = (dxToPlayer / distToPlayer) * moveSpeed;
        boss.vz = (dzToPlayer / distToPlayer) * moveSpeed;
      } else {
        // Subtle lateral weave when at preferred combat distance
        const tangentX = -dzToPlayer / distToPlayer;
        const tangentZ = dxToPlayer / distToPlayer;
        const strafeSign = boss.attackSequenceIndex % 2 === 0 ? 1 : -1;
        boss.vx = tangentX * moveSpeed * 0.32 * strafeSign;
        boss.vz = tangentZ * moveSpeed * 0.32 * strafeSign;
      }

      boss.statusLabel = isPinned
        ? 'GRAVITY PINNED · MOVEMENT ANCHORED'
        : boss.id === 'the-choir'
          ? boss.coreExposed
            ? 'HARMONIC DISRUPTION · CORE EXPOSED (1.65x)'
            : 'HARMONIC SHIELD ACTIVE · SYNCHRONIZE LINKED NODES'
          : boss.id === 'the-curator'
            ? boss.phase === 2
              ? 'PHASE II · ARCHIVAL RECONSTRUCTION SURGE'
              : 'PHASE I · ARCHIVAL RECONSTRUCTION'
            : boss.id === 'matron-v'
              ? boss.phase === 2
                ? 'PHASE II · QUARANTINE SURGICAL PROTOCOL'
                : 'PHASE I · QUARANTINE SURGICAL WARD'
              : boss.id === 'warden-prime'
                ? boss.phase === 2
                  ? 'PHASE II · SOVEREIGN CHRONICLE OVERDRIVE'
                  : 'PHASE I · SOVEREIGN LOOM DIRECTIVE'
                : boss.phase === 2
                  ? 'PHASE II · HELIX OVERLOAD'
                  : 'PHASE I · CONTAINMENT PROTOCOL';

      enemy.aiState = 'pursue';
      enemy.stateTimer = 0;
      enemy.stateDuration = 0;

      // Initiate next deterministic attack when cooldown expires and player is within arena combat range
      if (
        p.actionState !== 'dead' &&
        !isPinned &&
        boss.cooldownTimer <= 0 &&
        distToPlayer <= cfg.attacks.vector_ram.maxReach + 1.5 &&
        hasMeleeLineOfSight(boss.x, boss.z, p.x, p.z, world.obstacles)
      ) {
        const hasActiveEcho =
          world.echo.state === 'playback' && world.echo.activeActor !== null;
        const nextAttack = selectNextBossAttack(boss, distToPlayer, hasActiveEcho);
        beginBossTelegraph(world, boss, enemy, nextAttack, angleToPlayer);
      }
      break;
    }

    case 'telegraph': {
      boss.stateTimer -= dt;
      boss.vx = 0;
      boss.vz = 0;
      boss.coreExposed = false;
      const attack = boss.activeAttack ?? 'helical_sweep';
      const progress =
        boss.stateDuration > 0
          ? Math.max(0, Math.min(1, 1 - boss.stateTimer / boss.stateDuration))
          : 1;

      const cutoff =
        attack === 'vector_ram' || attack === 'surgical_incision'
          ? cfg.attacks.vector_ram.trackingCutoffRatio
          : attack === 'helical_sweep'
            ? cfg.attacks.helical_sweep.trackingCutoffRatio
            : attack === 'archive_lance' ||
                attack === 'reconstructed_sweep' ||
                attack === 'curator_burst'
              ? 0 // Reconstructed traces lock immediately at telegraph creation!
              : cfg.attacks.anchor_slam.trackingCutoffRatio;

      if (!boss.telegraphLocked && progress < cutoff) {
        const trackRate =
          attack === 'vector_ram' || attack === 'surgical_incision'
            ? 3.4
            : attack === 'helical_sweep'
              ? 3.2
              : 2.6;
        boss.rotationY = moveAngleTowards(boss.rotationY, angleToPlayer, trackRate * dt);
        boss.attackDirX = Math.sin(boss.rotationY);
        boss.attackDirZ = Math.cos(boss.rotationY);
        boss.targetX = p.x;
        boss.targetZ = p.z;
        boss.telegraphLocked = false;
      } else {
        boss.telegraphLocked = true;
      }

      enemy.aiState = 'telegraph';
      enemy.stateTimer = boss.stateTimer;
      enemy.stateDuration = boss.stateDuration;
      enemy.targetX = boss.targetX;
      enemy.targetZ = boss.targetZ;

      if (boss.stateTimer <= 0) {
        beginBossAttackActive(world, boss, enemy);
      }
      break;
    }

    case 'attack': {
      const prevTimer = boss.stateTimer;
      boss.stateTimer -= dt;
      const attack = boss.activeAttack ?? 'helical_sweep';
      const duration = boss.stateDuration || 0.3;
      const prevProgress = Math.max(0, Math.min(1, 1 - prevTimer / duration));
      const progress = Math.max(0, Math.min(1, 1 - boss.stateTimer / duration));

      if (
        attack === 'vector_ram' ||
        attack === 'surgical_incision' ||
        attack === 'directive_lance' ||
        attack === 'paradox_rail_lance'
      ) {
        const ramCfg =
          attack === 'directive_lance' || attack === 'paradox_rail_lance'
            ? GAME_CONFIG.wardenPrime.attacks.directive_lance
            : cfg.attacks.vector_ram;
        const dashSpeed =
          boss.phase === 2 ? ramCfg.dashSpeedP2 : ramCfg.dashSpeedP1;
        const traveled = Math.hypot(
          boss.x - boss.attackOriginX,
          boss.z - boss.attackOriginZ
        );
        if (traveled < ramCfg.maxReach) {
          boss.vx = boss.attackDirX * dashSpeed;
          boss.vz = boss.attackDirZ * dashSpeed;
        } else {
          boss.vx = 0;
          boss.vz = 0;
        }
      } else if (
        attack === 'helical_sweep' ||
        attack === 'temporal_convergence_grid' ||
        attack === 'paradox_blink_slash'
      ) {
        const sweepCfg =
          attack === 'temporal_convergence_grid' || attack === 'paradox_blink_slash'
            ? GAME_CONFIG.wardenPrime.attacks.temporal_convergence_grid
            : cfg.attacks.helical_sweep;
        boss.vx = boss.attackDirX * sweepCfg.lungeSpeed * (attack === 'paradox_blink_slash' ? 1.35 : 1);
        boss.vz = boss.attackDirZ * sweepCfg.lungeSpeed * (attack === 'paradox_blink_slash' ? 1.35 : 1);
      } else if (
        attack === 'archive_lance' ||
        attack === 'reconstructed_sweep' ||
        attack === 'curator_burst'
      ) {
        boss.vx = 0;
        boss.vz = 0;
      } else if (attack === 'chrono_sever') {
        boss.vx = 0;
        boss.vz = 0;
        boss.shockwaveActive = true;
        boss.shockwaveMaxRadius = GAME_CONFIG.matron.chronoSever.radius;
        boss.shockwaveRadius = GAME_CONFIG.matron.chronoSever.radius * progress;

        if (world.matron.active && world.matron.chronoSeverActive) {
          world.matron.chronoSeverActive = false;
          const severX = world.matron.chronoSeverZoneX;
          const severZ = world.matron.chronoSeverZoneZ;
          const severRange = GAME_CONFIG.matron.chronoSever.radius;

          if (world.echo.state === 'playback' && world.echo.activeActor) {
            const distToEcho = Math.hypot(
              world.echo.activeActor.x - severX,
              world.echo.activeActor.z - severZ
            );
            if (distToEcho <= severRange + GAME_CONFIG.player.radius) {
              world.echo.state = 'ready';
              world.echo.activeActor = null;
              world.echo.playbackTime = 0;
              world.echo.nextEventIndex = 0;
              world.echo.statusMessage =
                'CHRONO SEVERED // ACTIVE ECHO TERMINATED IN SEVER ZONE (CLIP PRESERVED)';
              if (world.resonance.activeMark) {
                world.resonance.activeMark = null;
                world.resonance.status =
                  world.resonance.cooldownTimer > 0 ? 'on_cooldown' : 'idle';
              }
              world.matron.echoSuppressedTimer =
                GAME_CONFIG.matron.eraserSuppressionDuration;
              world.matron.eraserDisruptionsCount += 1;
              world.matron.statusMessage =
                'CHRONO SEVER CONNECTED // ECHO TERMINATED & SUPPRESSED FOR 2.2S';
              world.events.push({
                type: 'matron_chrono_sever',
                x: severX,
                z: severZ,
                enemyId: boss.id,
              });
            } else {
              world.matron.statusMessage =
                'CHRONO SEVER EVADED // ECHO OUTSIDE SEVER RADIUS REMAINS INTACT';
            }
          }
        }
      } else {
        const slamCfg =
          attack === 'sovereign_purge_wave'
            ? GAME_CONFIG.wardenPrime.attacks.sovereign_purge_wave
            : cfg.attacks.anchor_slam;
        boss.vx = 0;
        boss.vz = 0;
        boss.shockwaveActive = true;
        const maxRad =
          boss.phase === 2 ? slamCfg.outerRadiusP2 : slamCfg.outerRadiusP1;
        boss.shockwaveMaxRadius = maxRad;
        boss.shockwaveRadius =
          slamCfg.innerRadius + (maxRad - slamCfg.innerRadius) * progress;

        if (prevProgress < 0.22 && progress >= 0.22) {
          world.events.push({
            type: 'boss_shockwave_burst',
            x: boss.x,
            z: boss.z,
            enemyId: boss.id,
            bossAttack: attack,
            bossPhase: boss.phase,
          });
        }
      }

      boss.x += boss.vx * dt;
      boss.z += boss.vz * dt;
      enemy.x = boss.x;
      enemy.z = boss.z;
      enemy.vx = boss.vx;
      enemy.vz = boss.vz;
      enemy.rotationY = boss.rotationY;

      if (!boss.hasDealtDamageThisAttack && p.actionState !== 'dead') {
        const curDx = p.x - boss.x;
        const curDz = p.z - boss.z;
        const curDist = Math.hypot(curDx, curDz);
        const curAngleToPlayer = Math.atan2(curDx, curDz);

        let hitPlayer = false;
        let hitDamage = 0;

        if (
          attack === 'vector_ram' ||
          attack === 'surgical_incision' ||
          attack === 'directive_lance' ||
          attack === 'paradox_rail_lance'
        ) {
          const ramCfg =
            attack === 'directive_lance' || attack === 'paradox_rail_lance'
              ? GAME_CONFIG.wardenPrime.attacks.directive_lance
              : cfg.attacks.vector_ram;
          const relX = p.x - boss.attackOriginX;
          const relZ = p.z - boss.attackOriginZ;
          const traveled = Math.hypot(
            boss.x - boss.attackOriginX,
            boss.z - boss.attackOriginZ
          );
          const proj = relX * boss.attackDirX + relZ * boss.attackDirZ;
          const perp = Math.abs(relX * boss.attackDirZ - relZ * boss.attackDirX);
          const laneHalfWidth = ramCfg.laneWidth * 0.5 + pRadius;

          if (
            proj >= -0.15 &&
            proj <= traveled + boss.radius + pRadius + 0.1 &&
            perp <= laneHalfWidth &&
            hasMeleeLineOfSight(boss.x, boss.z, p.x, p.z, world.obstacles)
          ) {
            hitPlayer = true;
            hitDamage = ramCfg.damage;
          }
        } else if (
          attack === 'helical_sweep' ||
          attack === 'temporal_convergence_grid' ||
          attack === 'paradox_blink_slash'
        ) {
          const sweepCfg =
            attack === 'temporal_convergence_grid' || attack === 'paradox_blink_slash'
              ? GAME_CONFIG.wardenPrime.attacks.temporal_convergence_grid
              : cfg.attacks.helical_sweep;
          const diff = Math.abs(angleDiff(curAngleToPlayer, boss.rotationY));
          const inArc = diff <= sweepCfg.arcRadians * 0.5;

          if (
            curDist <= sweepCfg.range + pRadius &&
            inArc &&
            hasMeleeLineOfSight(boss.x, boss.z, p.x, p.z, world.obstacles)
          ) {
            hitPlayer = true;
            hitDamage = sweepCfg.damage;
          }
        } else if (
          attack === 'archive_lance' ||
          attack === 'reconstructed_sweep' ||
          attack === 'curator_burst'
        ) {
          hitPlayer = false;
        } else if (attack === 'chrono_sever') {
          const severX = world.matron.active ? world.matron.chronoSeverZoneX : boss.x;
          const severZ = world.matron.active ? world.matron.chronoSeverZoneZ : boss.z;
          const distToSever = Math.hypot(p.x - severX, p.z - severZ);
          if (
            distToSever <= GAME_CONFIG.matron.chronoSever.radius + pRadius &&
            hasMeleeLineOfSight(boss.x, boss.z, p.x, p.z, world.obstacles)
          ) {
            hitPlayer = true;
            hitDamage = GAME_CONFIG.matron.chronoSever.damage;
          }
        } else {
          const slamCfg =
            attack === 'sovereign_purge_wave'
              ? GAME_CONFIG.wardenPrime.attacks.sovereign_purge_wave
              : cfg.attacks.anchor_slam;
          const inInnerImpact =
            progress <= 0.4 && curDist <= slamCfg.innerRadius + pRadius;
          const inShockwaveBand =
            progress > 0.15 &&
            curDist <= boss.shockwaveMaxRadius + pRadius &&
            Math.abs(curDist - boss.shockwaveRadius) <=
              slamCfg.ringBandWidth * 0.5 + pRadius;

          if (
            (inInnerImpact || inShockwaveBand) &&
            hasMeleeLineOfSight(boss.x, boss.z, p.x, p.z, world.obstacles)
          ) {
            hitPlayer = true;
            hitDamage = inInnerImpact ? slamCfg.damage : slamCfg.shockwaveDamage;
          }
        }

        if (hitPlayer) {
          boss.hasDealtDamageThisAttack = true;
          enemy.hasDealtDamageThisAttack = true;
          applyDamageToPlayer(world, hitDamage, enemy);
        }
      }

      if (boss.stateTimer <= 0 && boss.aiState === 'attack') {
        const recDuration =
          attack === 'directive_lance'
            ? boss.phase === 2
              ? GAME_CONFIG.wardenPrime.attacks.directive_lance.recoveryDurationP2
              : GAME_CONFIG.wardenPrime.attacks.directive_lance.recoveryDuration
            : attack === 'temporal_convergence_grid'
              ? boss.phase === 2
                ? GAME_CONFIG.wardenPrime.attacks.temporal_convergence_grid.recoveryDurationP2
                : GAME_CONFIG.wardenPrime.attacks.temporal_convergence_grid.recoveryDuration
              : attack === 'sovereign_purge_wave'
                ? boss.phase === 2
                  ? GAME_CONFIG.wardenPrime.attacks.sovereign_purge_wave.recoveryDurationP2
                  : GAME_CONFIG.wardenPrime.attacks.sovereign_purge_wave.recoveryDuration
                : attack === 'vector_ram' || attack === 'surgical_incision'
                  ? boss.phase === 2
                    ? cfg.attacks.vector_ram.recoveryDurationP2
                    : cfg.attacks.vector_ram.recoveryDuration
                  : attack === 'helical_sweep'
                    ? boss.phase === 2
                      ? cfg.attacks.helical_sweep.recoveryDurationP2
                      : cfg.attacks.helical_sweep.recoveryDuration
                    : boss.phase === 2
                      ? cfg.attacks.anchor_slam.recoveryDurationP2
                      : cfg.attacks.anchor_slam.recoveryDuration;

        boss.aiState = 'recovery';
        boss.stateDuration = recDuration;
        boss.stateTimer = recDuration;
        boss.vx = 0;
        boss.vz = 0;
        boss.shockwaveActive = false;
        boss.coreExposed = boss.id === 'the-choir' ? choirVulnerable : true;
        boss.statusLabel =
          boss.id === 'the-choir' && !boss.coreExposed
            ? 'RECOVERY · SYNCHRONIZE LINKED NODES TO EXPOSE CHOIR CORE'
            : 'RECOVERY · CHRONO CORE EXPOSED (1.5x)';

        enemy.aiState = 'recovery';
        enemy.stateDuration = recDuration;
        enemy.stateTimer = recDuration;
        enemy.vx = 0;
        enemy.vz = 0;

        world.events.push({
          type: 'boss_core_exposed',
          x: boss.x,
          z: boss.z,
          enemyId: boss.id,
          bossAttack: attack,
          bossPhase: boss.phase,
        });
      }
      return;
    }

    case 'recovery':
    case 'staggered': {
      boss.stateTimer -= dt;
      boss.vx = 0;
      boss.vz = 0;
      boss.shockwaveActive = false;
      boss.coreExposed =
        boss.id === 'the-choir' && boss.aiState === 'recovery'
          ? choirVulnerable
          : true;
      enemy.aiState = boss.aiState;
      enemy.stateTimer = boss.stateTimer;
      enemy.stateDuration = boss.stateDuration;

      if (boss.stateTimer <= 0) {
        boss.aiState = 'pursue';
        boss.coreExposed = choirVulnerable;
        boss.activeAttack = null;
        boss.cooldownTimer =
          boss.phase === 2 ? cfg.attackCooldownPhase2 : cfg.attackCooldownPhase1;
        boss.statusLabel =
          boss.id === 'the-choir'
            ? 'HARMONIC SHIELD ACTIVE · SYNCHRONIZE LINKED NODES'
            : boss.id === 'the-curator'
              ? 'PHASE I · ARCHIVAL RECONSTRUCTION'
              : boss.id === 'matron-v'
                ? 'PHASE I · QUARANTINE SURGICAL WARD'
                : boss.id === 'warden-prime'
                  ? boss.phase === 2
                    ? 'PHASE II · SOVEREIGN CHRONICLE OVERDRIVE'
                    : 'PHASE I · SOVEREIGN LOOM DIRECTIVE'
                  : boss.phase === 2
                    ? 'PHASE II · HELIX OVERLOAD'
                    : 'PHASE I · CONTAINMENT PROTOCOL';

        enemy.aiState = 'pursue';
        enemy.cooldownTimer = boss.cooldownTimer;
      }
      break;
    }
  }

  boss.x += boss.vx * dt;
  boss.z += boss.vz * dt;
  enemy.x = boss.x;
  enemy.z = boss.z;
  enemy.vx = boss.vx;
  enemy.vz = boss.vz;
  enemy.rotationY = boss.rotationY;
}

function updateEnemies(world: WorldState, dt: number): void {
  const p = world.player;

  // Count concurrent attackers (telegraph or attack) for the crowd token pool
  let activeAttackers = 0;
  for (let i = 0; i < world.enemies.length; i++) {
    const e = world.enemies[i];
    if (isBossArchetype(e.archetype)) continue;
    if (e.aiState === 'telegraph' || e.aiState === 'attack') {
      activeAttackers += 1;
    }
  }

  // Keep enemies stationed in the main combat bay ONLY while Sera is inside the explicit southern/southwestern
  // calibration alcove (or actively recording her approach from spawn to Pad 01) before engaging combat.
  // Once Sera leaves the calibration zone into the combat bay, enemies pursue and engage normally even if an Echo is ready or playing.
  const holdPerimeterForCalibration =
    world.encounterMode === 'standard' &&
    isPlayerInCalibrationZone(world) &&
    world.stats.damageDealt === 0;

  for (let i = 0; i < world.enemies.length; i++) {
    const enemy = world.enemies[i];
    if (isBossArchetype(enemy.archetype)) {
      continue;
    }
    const cfg = GAME_CONFIG.enemies[enemy.archetype];
    const isOverclocked = enemy.modifier === 'overclocked';
    const moveSpeed = cfg.moveSpeed * (isOverclocked ? 1.18 : 1.0);
    const telegraphScale = isOverclocked ? 0.82 : 1.0;
    const cooldownScale = isOverclocked ? 0.82 : 1.0;

    enemy.hitFlashTimer = Math.max(0, enemy.hitFlashTimer - dt);
    enemy.cooldownTimer = Math.max(0, enemy.cooldownTimer - dt);
    enemy.evadeTimer = Math.max(0, enemy.evadeTimer - dt);
    enemy.evadeCooldownTimer = Math.max(0, enemy.evadeCooldownTimer - dt);
    if ((enemy.blinkCooldownTimer ?? 0) > 0) {
      enemy.blinkCooldownTimer = Math.max(0, (enemy.blinkCooldownTimer ?? 0) - dt);
    }
    if ((enemy.phaseShiftTimer ?? 0) > 0) {
      enemy.phaseShiftTimer = Math.max(0, (enemy.phaseShiftTimer ?? 0) - dt);
    }

    if (enemy.ghostHp > enemy.hp) {
      enemy.ghostHp = Math.max(enemy.hp, enemy.ghostHp - 35 * dt);
    } else {
      enemy.ghostHp = enemy.hp;
    }

    if (enemy.aiState === 'ko') {
      enemy.stateTimer = Math.max(0, enemy.stateTimer - dt);
      enemy.koProgress = Math.min(1, 1 - enemy.stateTimer / (enemy.stateDuration || 0.45));
      enemy.vx = 0;
      enemy.vz = 0;
      continue;
    }

    // Gravity Pin immobilization check
    if ((enemy.pinnedTimer ?? 0) > 0) {
      enemy.pinnedTimer = Math.max(0, (enemy.pinnedTimer ?? 0) - dt);
      enemy.vx = 0;
      enemy.vz = 0;
      continue;
    }

    // Gradually decay stagger when in pursue/idle
    if (enemy.aiState === 'pursue' || enemy.aiState === 'idle') {
      const staggerDecayRate = enemy.modifier === 'phase_shielded' ? 11 : 7;
      enemy.stagger = Math.max(0, enemy.stagger - staggerDecayRate * dt);
    }

    const dxToPlayer = p.x - enemy.x;
    const dzToPlayer = p.z - enemy.z;
    const distToPlayer = Math.hypot(dxToPlayer, dzToPlayer) || 0.001;
    const angleToPlayer = Math.atan2(dxToPlayer, dzToPlayer);

    switch (enemy.aiState) {
      case 'idle':
      case 'pursue': {
        // Phase 16: Active Echo Tactical Decoy / Flanking Distraction
        // If an Echo is actively replaying closer to the enemy than live Sera (and live Sera is not in immediate melee range),
        // ordinary units orient toward the closer active Echo, enabling tactical flanking behind Bastion's Aegis shield.
        let pursueTargetX = p.x;
        let pursueTargetZ = p.z;
        const activeEchoActor =
          world.echo.state === 'playback' ? world.echo.activeActor : null;
        if (activeEchoActor) {
          const distEcho = Math.hypot(
            activeEchoActor.x - enemy.x,
            activeEchoActor.z - enemy.z
          );
          if (
            enemy.archetype === 'eraser' ||
            (distEcho <= 6.5 &&
              distEcho + 0.8 < distToPlayer &&
              distToPlayer > 2.1 &&
              hasMeleeLineOfSight(
                enemy.x,
                enemy.z,
                activeEchoActor.x,
                activeEchoActor.z,
                world.obstacles
              ))
          ) {
            pursueTargetX = activeEchoActor.x;
            pursueTargetZ = activeEchoActor.z;
          }
        }
        const dxTarget = pursueTargetX - enemy.x;
        const dzTarget = pursueTargetZ - enemy.z;
        const distTarget = Math.hypot(dxTarget, dzTarget) || 0.001;
        const angleTarget = Math.atan2(dxTarget, dzTarget);
        enemy.rotationY = moveAngleTowards(enemy.rotationY, angleTarget, 7.2 * dt);

        if (holdPerimeterForCalibration) {
          // Hold patrol perimeter in the main combat bay (z <= 4.5) so the player can record/replay on Chrono Anchor Pad 01 unobstructed
          if (enemy.z > 4.5) {
            enemy.vx = 0;
            enemy.vz = -cfg.moveSpeed;
          } else {
            enemy.vx = 0;
            enemy.vz = 0;
          }
          break;
        }

        // Distinct movement & spacing policies per archetype
        if (enemy.archetype === 'bastion' || enemy.archetype === 'aegis_sentinel') {
          if (distTarget > cfg.preferredRange) {
            enemy.vx = (dxTarget / distTarget) * moveSpeed;
            enemy.vz = (dzTarget / distTarget) * moveSpeed;
          } else {
            enemy.vx = 0;
            enemy.vz = 0;
          }
        } else if (enemy.archetype === 'phase_stalker') {
          const stalkerCfg = GAME_CONFIG.enemies.phase_stalker;
          if (
            p.actionState !== 'dead' &&
            !holdPerimeterForCalibration &&
            distToPlayer >= stalkerCfg.blinkTriggerMinDist &&
            distToPlayer <= stalkerCfg.blinkTriggerMaxDist &&
            (enemy.blinkCooldownTimer ?? 0) <= 0
          ) {
            const originX = enemy.x;
            const originZ = enemy.z;
            // Blink to Sera's flank/rear blindspot
            const flankAngle = p.rotationY + Math.PI + enemy.strafeDir * 0.72;
            enemy.x = p.x + Math.sin(flankAngle) * stalkerCfg.blinkFlankDistance;
            enemy.z = p.z + Math.cos(flankAngle) * stalkerCfg.blinkFlankDistance;
            resolveCircleObstacleCollisions(
              enemy,
              world.obstacles,
              GAME_CONFIG.arena.radius - 0.8,
              getArenaSolidPropColliders(world.run?.chapter ?? 'prologue')
            );
            enemy.blinkCooldownTimer = stalkerCfg.blinkCooldown * cooldownScale;
            enemy.phaseShiftTimer = 0.38;
            enemy.rotationY = Math.atan2(p.x - enemy.x, p.z - enemy.z);
            enemy.targetX = p.x;
            enemy.targetZ = p.z;
            enemy.vx = 0;
            enemy.vz = 0;
            enemy.aiState = 'telegraph';
            enemy.stateDuration = cfg.telegraphDuration * telegraphScale;
            enemy.stateTimer = enemy.stateDuration;
            enemy.hasDealtDamageThisAttack = false;
            enemy.telegraphLocked = false;
            activeAttackers += 1;
            world.events.push({
              type: 'phase_stalker_blink',
              x: enemy.x,
              z: enemy.z,
              originX,
              originZ,
              enemyId: enemy.id,
            });
            world.events.push({
              type: 'enemy_telegraph_start',
              x: enemy.x,
              z: enemy.z,
              enemyId: enemy.id,
            });
            break;
          }
          const flankAngle =
            angleTarget + enemy.strafeDir * (distTarget > 3.8 ? 0.52 : 0.16);
          if (distTarget > cfg.preferredRange) {
            enemy.vx = Math.sin(flankAngle) * moveSpeed;
            enemy.vz = Math.cos(flankAngle) * moveSpeed;
          } else {
            enemy.vx = 0;
            enemy.vz = 0;
          }
        } else if (enemy.archetype === 'chrono_mortar') {
          // Siege Mortar Tripod holds long standoff range (7.5 - 11.5m)
          if (distToPlayer < 6.8) {
            enemy.vx = -(dxToPlayer / distToPlayer) * moveSpeed;
            enemy.vz = -(dzToPlayer / distToPlayer) * moveSpeed;
          } else if (distToPlayer > 11.5) {
            enemy.vx = (dxToPlayer / distToPlayer) * moveSpeed;
            enemy.vz = (dzToPlayer / distToPlayer) * moveSpeed;
          } else {
            const tangentX = -dzToPlayer / distToPlayer;
            const tangentZ = dxToPlayer / distToPlayer;
            enemy.vx = tangentX * moveSpeed * 0.35 * enemy.strafeDir;
            enemy.vz = tangentZ * moveSpeed * 0.35 * enemy.strafeDir;
          }
        } else if (enemy.archetype === 'resonance_warden') {
          // Harmonic Conductor stays near tethered ally while keeping standoff distance from Sera
          const tetheredAlly = enemy.tetherTargetId
            ? world.enemies.find(
                (a) => a.id === enemy.tetherTargetId && a.hp > 0 && a.aiState !== 'ko'
              )
            : null;
          if (distToPlayer < 5.0) {
            enemy.vx = -(dxToPlayer / distToPlayer) * moveSpeed * 0.95;
            enemy.vz = -(dzToPlayer / distToPlayer) * moveSpeed * 0.95;
          } else if (tetheredAlly) {
            const dxAlly = tetheredAlly.x - enemy.x;
            const dzAlly = tetheredAlly.z - enemy.z;
            const distAlly = Math.hypot(dxAlly, dzAlly) || 0.001;
            if (distAlly > 5.4) {
              enemy.vx = (dxAlly / distAlly) * moveSpeed * 0.9;
              enemy.vz = (dzAlly / distAlly) * moveSpeed * 0.9;
            } else {
              const tangentX = -dzToPlayer / distToPlayer;
              const tangentZ = dxToPlayer / distToPlayer;
              enemy.vx = tangentX * moveSpeed * 0.55 * enemy.strafeDir;
              enemy.vz = tangentZ * moveSpeed * 0.55 * enemy.strafeDir;
            }
          } else {
            const tangentX = -dzToPlayer / distToPlayer;
            const tangentZ = dxToPlayer / distToPlayer;
            enemy.vx = tangentX * moveSpeed * 0.6 * enemy.strafeDir;
            enemy.vz = tangentZ * moveSpeed * 0.6 * enemy.strafeDir;
          }
        } else if (
          enemy.archetype === 'scrapper' ||
          enemy.archetype === 'curator_decoy' ||
          enemy.archetype === 'siphon' ||
          enemy.archetype === 'eraser'
        ) {
          const flankAngle =
            angleTarget + enemy.strafeDir * (distTarget > 4 ? 0.38 : 0.12);
          if (distTarget > cfg.preferredRange) {
            enemy.vx = Math.sin(flankAngle) * moveSpeed;
            enemy.vz = Math.cos(flankAngle) * moveSpeed;
          } else {
            enemy.vx = 0;
            enemy.vz = 0;
          }
        } else {
          // Scout Drone: triggers evasive thruster dash if rushed at close range
          const scoutCfg = GAME_CONFIG.enemies.scout;
          if (
            distToPlayer <= scoutCfg.evadeTriggerDist &&
            enemy.evadeCooldownTimer <= 0 &&
            enemy.evadeTimer <= 0
          ) {
            enemy.evadeTimer = scoutCfg.evadeDuration;
            enemy.evadeCooldownTimer = scoutCfg.evadeCooldown;
            enemy.cooldownTimer = Math.min(enemy.cooldownTimer, 0.2);
          }

          const tangentX = -dzToPlayer / distToPlayer;
          const tangentZ = dxToPlayer / distToPlayer;

          if (enemy.evadeTimer > 0) {
            const awaySpeed = -scoutCfg.evadeSpeed;
            const lateralSpeed = moveSpeed * 0.65 * enemy.strafeDir;
            enemy.vx = (dxToPlayer / distToPlayer) * awaySpeed + tangentX * lateralSpeed;
            enemy.vz = (dzToPlayer / distToPlayer) * awaySpeed + tangentZ * lateralSpeed;
          } else {
            let radialSpeed = 0;
            if (distToPlayer < cfg.preferredRange - 1.4) {
              radialSpeed = -moveSpeed * 0.9;
            } else if (distToPlayer > cfg.preferredRange + 1.2) {
              radialSpeed = moveSpeed * 0.85;
            }
            const orbitSpeed = moveSpeed * 0.65 * enemy.strafeDir;
            enemy.vx = (dxToPlayer / distToPlayer) * radialSpeed + tangentX * orbitSpeed;
            enemy.vz = (dzToPlayer / distToPlayer) * radialSpeed + tangentZ * orbitSpeed;
          }
        }

        // Check attack initiation with token pool limit & authoritative obstacle line-of-sight
        const hasLosToPlayer =
          enemy.archetype === 'chrono_mortar'
            ? true
            : hasMeleeLineOfSight(
                enemy.x,
                enemy.z,
                p.x,
                p.z,
                world.obstacles
              );
        let canStartAttack = distToPlayer <= cfg.attackRange && hasLosToPlayer;
        if (
          enemy.archetype === 'eraser' &&
          world.echo.state === 'playback' &&
          world.echo.activeActor
        ) {
          const distEcho = Math.hypot(
            world.echo.activeActor.x - enemy.x,
            world.echo.activeActor.z - enemy.z
          );
          if (
            distEcho <= GAME_CONFIG.matron.eraserDisruptionRadius &&
            hasMeleeLineOfSight(
              enemy.x,
              enemy.z,
              world.echo.activeActor.x,
              world.echo.activeActor.z,
              world.obstacles
            )
          ) {
            canStartAttack = true;
          }
        }

        const maxAttackers = world.encounter
          ? getEncounterDefinition(world.encounter.encounterId).maxConcurrentAttackers
          : GAME_CONFIG.enemies.maxConcurrentAttackers;
        if (
          p.actionState !== 'dead' &&
          !holdPerimeterForCalibration &&
          enemy.evadeTimer <= 0 &&
          enemy.cooldownTimer <= 0 &&
          canStartAttack &&
          activeAttackers < maxAttackers
        ) {
          enemy.aiState = 'telegraph';
          enemy.stateDuration = cfg.telegraphDuration * telegraphScale;
          enemy.stateTimer = enemy.stateDuration;
          enemy.hasDealtDamageThisAttack = false;
          enemy.telegraphLocked = false;
          enemy.rotationY = angleToPlayer;
          enemy.targetX = p.x;
          enemy.targetZ = p.z;
          enemy.vx = 0;
          enemy.vz = 0;
          activeAttackers += 1;
          world.events.push({
            type: 'enemy_telegraph_start',
            x: enemy.x,
            z: enemy.z,
            enemyId: enemy.id,
          });
        }
        break;
      }

      case 'telegraph': {
        enemy.stateTimer -= dt;
        enemy.vx = 0;
        enemy.vz = 0;
        const progress = 1 - enemy.stateTimer / (enemy.stateDuration || 1);
        if (p.actionState === 'dodging' || progress >= 0.55) {
          enemy.telegraphLocked = true;
        }
        if (!enemy.telegraphLocked) {
          enemy.rotationY = moveAngleTowards(enemy.rotationY, angleToPlayer, 5.0 * dt);
          enemy.targetX = p.x;
          enemy.targetZ = p.z;
        }

        if (enemy.stateTimer <= 0) {
          enemy.aiState = 'attack';
          enemy.stateDuration = cfg.activeDuration;
          enemy.stateTimer = cfg.activeDuration;
          enemy.telegraphLocked = true;
          world.events.push({
            type: 'enemy_attack_strike',
            x: enemy.x,
            z: enemy.z,
            enemyId: enemy.id,
          });
        }
        break;
      }

      case 'attack': {
        enemy.stateTimer -= dt;

        if (enemy.archetype === 'scrapper' || enemy.archetype === 'phase_stalker') {
          const lunge =
            enemy.archetype === 'phase_stalker'
              ? GAME_CONFIG.enemies.phase_stalker.lungeSpeed
              : GAME_CONFIG.enemies.scrapper.lungeSpeed;
          enemy.vx = Math.sin(enemy.rotationY) * lunge;
          enemy.vz = Math.cos(enemy.rotationY) * lunge;
        } else if (
          enemy.archetype === 'bastion' ||
          enemy.archetype === 'aegis_sentinel'
        ) {
          const lunge =
            enemy.archetype === 'aegis_sentinel'
              ? GAME_CONFIG.enemies.aegis_sentinel.lungeSpeed
              : 3.4;
          enemy.vx = Math.sin(enemy.rotationY) * lunge;
          enemy.vz = Math.cos(enemy.rotationY) * lunge;
        } else {
          enemy.vx = 0;
          enemy.vz = 0;
        }

        if (!enemy.hasDealtDamageThisAttack) {
          // Eraser unit anti-Echo pulse check (single-event guarded via hasDealtDamageThisAttack)
          if (enemy.archetype === 'eraser') {
            let disruptedEcho = false;
            if (world.echo.state === 'playback' && world.echo.activeActor) {
              const distEcho = Math.hypot(
                world.echo.activeActor.x - enemy.x,
                world.echo.activeActor.z - enemy.z
              );
              if (distEcho <= GAME_CONFIG.matron.eraserDisruptionRadius) {
                disruptedEcho = true;
                world.echo.activeActor = null;
                world.echo.state = 'ready';
                world.echo.playbackTime = 0;
                world.echo.nextEventIndex = 0;
                world.echo.statusMessage =
                  'ECHO SUPPRESSED BY ERASER PULSE · REPLAY [Y] AFTER SUPPRESSION';
                if (world.matron.active) {
                  world.matron.echoSuppressedTimer =
                    GAME_CONFIG.matron.eraserSuppressionDuration;
                  world.matron.eraserDisruptionsCount += 1;
                  world.matron.statusMessage = `ERASER DISRUPTED ACTIVE ECHO (${GAME_CONFIG.matron.eraserSuppressionDuration.toFixed(1)}s SUPPRESSION)`;
                }
                world.events.push({
                  type: 'eraser_echo_disrupted',
                  x: enemy.x,
                  z: enemy.z,
                  enemyId: enemy.id,
                });
              }
            } else if (world.echo.state === 'recording') {
              const distRec = Math.hypot(p.x - enemy.x, p.z - enemy.z);
              if (distRec <= GAME_CONFIG.matron.eraserDisruptionRadius) {
                disruptedEcho = true;
                finalizeEchoRecording(world, false);
                if (world.matron.active) {
                  world.matron.echoSuppressedTimer =
                    GAME_CONFIG.matron.eraserSuppressionDuration;
                  world.matron.eraserDisruptionsCount += 1;
                  world.matron.statusMessage = `ERASER INTERRUPTED ECHO RECORDING (${GAME_CONFIG.matron.eraserSuppressionDuration.toFixed(1)}s SUPPRESSION)`;
                }
                world.events.push({
                  type: 'eraser_echo_disrupted',
                  x: enemy.x,
                  z: enemy.z,
                  enemyId: enemy.id,
                });
              }
            }
            if (disruptedEcho) {
              enemy.hasDealtDamageThisAttack = true;
            }
          }

          if (enemy.archetype === 'chrono_mortar') {
            // Launch 3-zone arcing artillery barrage around locked target coordinates
            enemy.hasDealtDamageThisAttack = true;
            const mortarCfg = GAME_CONFIG.enemies.chrono_mortar;
            if (!world.artilleryZones) {
              world.artilleryZones = [];
            }
            const maxR = GAME_CONFIG.arena.radius - 1.6;
            const perpAngle = enemy.rotationY + Math.PI * 0.5;
            const offsets = [
              { dx: 0, dz: 0, delay: 0 },
              {
                dx: Math.sin(perpAngle) * 2.45,
                dz: Math.cos(perpAngle) * 2.45,
                delay: 0.14,
              },
              {
                dx: -Math.sin(perpAngle) * 2.45,
                dz: -Math.cos(perpAngle) * 2.45,
                delay: 0.28,
              },
            ];
            for (let k = 0; k < offsets.length; k++) {
              let zx = enemy.targetX + offsets[k].dx;
              let zz = enemy.targetZ + offsets[k].dz;
              const d = Math.hypot(zx, zz);
              if (d > maxR) {
                zx = (zx / d) * maxR;
                zz = (zz / d) * maxR;
              }
              const dur = mortarCfg.fuseDuration + offsets[k].delay;
              world.artilleryZones.push({
                id: `mortar-${enemy.id}-${Math.round(world.elapsedTime * 100)}-${k}`,
                x: zx,
                z: zz,
                radius: mortarCfg.blastRadius,
                remainingTimer: dur,
                maxDuration: dur,
                damage: mortarCfg.damage,
                sourceEnemyId: enemy.id,
                kind: 'chrono_mortar',
              });
            }
            world.events.push({
              type: 'chrono_mortar_barrage_fired',
              x: enemy.targetX,
              z: enemy.targetZ,
              originX: enemy.x,
              originZ: enemy.z,
              enemyId: enemy.id,
            });
          } else {
          let hitPlayer = false;

          if (
            enemy.archetype === 'scout' ||
            enemy.archetype === 'null_weaver' ||
            enemy.archetype === 'resonance_warden'
          ) {
            const dirX = Math.sin(enemy.rotationY);
            const dirZ = Math.cos(enemy.rotationY);
            const proj = dxToPlayer * dirX + dzToPlayer * dirZ;
            if (proj > 0 && proj <= cfg.attackRange + 0.8) {
              const perpDist = Math.abs(dxToPlayer * dirZ - dzToPlayer * dirX);
              if (perpDist <= GAME_CONFIG.player.radius + 0.55) {
                hitPlayer = true;
              }
            }
          } else {
            const diff = Math.abs(angleDiff(angleToPlayer, enemy.rotationY));
            if (
              distToPlayer <= cfg.attackRange + GAME_CONFIG.player.radius &&
              (diff <= cfg.attackArc * 0.5 ||
                distToPlayer <= enemy.radius + GAME_CONFIG.player.radius + 0.35)
            ) {
              hitPlayer = true;
            }
          }

          if (hitPlayer) {
            const hasClearAttackLos = hasMeleeLineOfSight(
              enemy.x,
              enemy.z,
              p.x,
              p.z,
              world.obstacles
            );
            if (!hasClearAttackLos) {
              enemy.hasDealtDamageThisAttack = true;
              if (
                enemy.archetype === 'scout' ||
                enemy.archetype === 'null_weaver'
              ) {
                const dirX = Math.sin(enemy.rotationY);
                const dirZ = Math.cos(enemy.rotationY);
                world.events.push({
                  type: 'pulse_impact_obstacle',
                  x: enemy.x + dirX * Math.min(distToPlayer * 0.5, cfg.attackRange * 0.5),
                  z: enemy.z + dirZ * Math.min(distToPlayer * 0.5, cfg.attackRange * 0.5),
                  weaponId: 'pulsecaster',
                });
              }
            } else {
              enemy.hasDealtDamageThisAttack = true;
              const prevIntegrity = p.integrity;
              const prevParries = world.stats.parriesLanded;
              applyDamageToPlayer(world, cfg.damage, enemy);

              // Siphon unit bounded single-event Flux drain (only when strike connects without being dodged/parried)
              if (
                enemy.archetype === 'siphon' &&
                p.integrity < prevIntegrity &&
                world.stats.parriesLanded === prevParries
              ) {
                const drain = Math.min(p.flux, GAME_CONFIG.matron.siphonFluxDrain);
                p.flux = Math.max(0, p.flux - drain);
                if (world.matron.active) {
                  world.matron.totalFluxDrained += drain;
                  world.matron.siphonDrainEventsCount += 1;
                  world.matron.statusMessage = `SIPHON DRAINED ${Math.round(drain)} FLUX · INTERRUPT OR DODGE SIPHON`;
                }
                world.events.push({
                  type: 'siphon_flux_drained',
                  x: p.x,
                  z: p.z,
                  enemyId: enemy.id,
                  amount: drain,
                });
              } else if (
                enemy.archetype === 'null_weaver' &&
                p.integrity < prevIntegrity &&
                world.stats.parriesLanded === prevParries
              ) {
                const nwCfg = GAME_CONFIG.enemies.null_weaver;
                const drain = Math.min(p.flux, nwCfg.fluxDrainOnHit);
                p.flux = Math.max(0, p.flux - drain);
                p.fluxDampenedTimer = Math.max(
                  p.fluxDampenedTimer ?? 0,
                  nwCfg.fluxDampenDuration
                );
                world.events.push({
                  type: 'null_weaver_flux_dampened',
                  x: p.x,
                  z: p.z,
                  enemyId: enemy.id,
                  amount: drain,
                });
              }
            }
          }
          }
        }

        if (enemy.stateTimer <= 0 && enemy.aiState === 'attack') {
          enemy.aiState = 'recovery';
          enemy.stateDuration = cfg.recoveryDuration;
          enemy.stateTimer = cfg.recoveryDuration;
          enemy.telegraphLocked = false;
          enemy.vx = 0;
          enemy.vz = 0;
        }
        break;
      }

      case 'recovery':
      case 'staggered': {
        enemy.stateTimer -= dt;
        enemy.vx = 0;
        enemy.vz = 0;
        if (enemy.stateTimer <= 0) {
          enemy.aiState = 'pursue';
          enemy.cooldownTimer = cfg.attackCooldown * cooldownScale;
          enemy.telegraphLocked = false;
          enemy.strafeDir *= -1;
        }
        break;
      }
    }

    enemy.x += enemy.vx * dt;
    enemy.z += enemy.vz * dt;
  }
}

function updateTutorialSystem(
  world: WorldState,
  input: PlayerInputFrame,
  dt: number
): void {
  const tut = world.tutorial;
  if (!tut) return;

  const p = world.player;
  const distFromSpawn = Math.hypot(
    p.x - GAME_CONFIG.player.spawnX,
    p.z - GAME_CONFIG.player.spawnZ
  );
  if (distFromSpawn >= 1.1 || Math.hypot(input.moveX, input.moveZ) > 0.25) {
    tut.movementCompleted = true;
  }

  if (
    (p.actionState !== 'idle' && p.actionState !== 'moving' && p.actionState !== 'dead') ||
    world.stats.damageDealt > 0 ||
    world.stats.parriesLanded > 0 ||
    input.lightAttackJustPressed ||
    input.heavyAttackJustPressed ||
    input.dodgeJustPressed ||
    input.parryJustPressed
  ) {
    tut.combatCompleted = true;
  }

  if (
    world.echo.state !== 'idle' ||
    world.echo.clip !== null ||
    world.puzzle.teachCompleted ||
    input.echoRecordJustPressed ||
    input.echoPlayJustPressed
  ) {
    tut.echoRecordCompleted = true;
  }

  let nextStep: TutorialStep;
  if (world.run.chapter === 'chapter_5_loom') {
    nextStep = world.loom.selectedEnding ? 'completed' : 'chronicle_loom_choice';
  } else if (world.encounterMode === 'boss') {
    if (world.outcome !== 'none') {
      nextStep = 'completed';
    } else if (world.boss?.id === 'the-choir') {
      nextStep = 'choir_harmonic_nodes';
    } else if (world.boss?.id === 'the-curator') {
      nextStep = 'curator_gravity_pin';
    } else if (world.boss?.id === 'matron-v') {
      nextStep = 'matron_echo_collapse';
    } else {
      nextStep = 'boss_counterplay';
    }
  } else if (world.puzzle.completed) {
    nextStep = 'completed';
  } else if (!tut.movementCompleted) {
    nextStep = 'movement_camera';
  } else if (!tut.combatCompleted) {
    nextStep = 'combat_basics';
  } else if (!tut.echoRecordCompleted) {
    nextStep = 'echo_record_replay';
  } else if (!world.puzzle.teachCompleted) {
    nextStep = 'puzzle_teach';
  } else if (!world.puzzle.testCompleted && !world.puzzle.heavyReceiver.charged) {
    nextStep = 'puzzle_test';
  } else {
    nextStep = 'puzzle_combine';
  }

  if (nextStep !== tut.step) {
    tut.step = nextStep;
    tut.stepDwellTimer = 0;
    tut.stuckHintActive = false;
    const copy = TUTORIAL_COPY[nextStep];
    tut.title = copy.title;
    tut.desktopPrompt = copy.desktopPrompt;
    tut.mobilePrompt = copy.mobilePrompt;
    tut.stuckHint = copy.stuckHint;
  } else {
    tut.stepDwellTimer += dt;
    if (
      tut.step !== 'completed' &&
      tut.stepDwellTimer >= GAME_CONFIG.verticalSlice.stuckHintDelay
    ) {
      tut.stuckHintActive = true;
    }
  }
}

export function buildRunSummary(world: WorldState): RunSummary {
  const totalEnemies = world.enemies.length;
  let enemiesDefeated = 0;
  let remainingTargetHp = 0;

  for (let i = 0; i < world.enemies.length; i++) {
    const e = world.enemies[i];
    if (e.hp <= 0 || e.aiState === 'ko') {
      enemiesDefeated += 1;
    } else {
      remainingTargetHp += Math.round(e.hp);
    }
  }

  return {
    outcome: world.outcome,
    chapter: world.run.chapter,
    bossId: world.boss?.id ?? null,
    selectedEnding: world.run.selectedEnding,
    elapsedTime: world.elapsedTime,
    enemiesDefeated,
    totalEnemies,
    damageDealt: Math.round(world.stats.damageDealt),
    damageTaken: Math.round(world.stats.damageTaken),
    parriesLanded: world.stats.parriesLanded,
    perfectDodges: world.stats.perfectDodges ?? 0,
    vulnerableHits: world.stats.vulnerableHits,
    convergencesTriggered: world.resonance.convergenceCount,
    relaysUsed: world.relay.activationCount,
    remainingTargetHp,
  };
}

function advanceNarrativeCommsSystem(world: WorldState, dt: number): void {
  if (!world.comms) {
    world.comms = createInitialNarrativeCommsState();
  }

  // Evaluate causal gameplay milestones across Prologue and Chapters I–IV
  // Independent milestone checks ensure Boss Phase 2 never shadows ability/synchronization transmissions.
  if (world.encounterMode === 'standard' && world.run.chapter === 'prologue') {
    if (world.puzzle.teachCompleted || world.pressurePlate.active) {
      triggerNarrativeTransmission(world, 'prologue_step1_teach', true);
    }
    if (world.puzzle.testCompleted || world.puzzle.heavyReceiver.charged) {
      triggerNarrativeTransmission(world, 'prologue_step2_test', true);
    }
    if (world.puzzle.finalBarrier.open || world.puzzle.combineCompleted) {
      triggerNarrativeTransmission(world, 'prologue_step3_combine', true);
    }
  } else if (world.encounterMode === 'boss' && world.boss) {
    const bossId = world.boss.id;
    const baselineConvergences =
      world.run.bossCheckpoint?.statsAtCheckpoint.convergencesTriggered ?? 0;

    if (bossId === 'helix-04') {
      if (world.resonance.convergenceCount > baselineConvergences) {
        triggerNarrativeTransmission(world, 'chapter1_convergence', true);
      }
      if (world.boss.phase >= 2) {
        triggerNarrativeTransmission(world, 'chapter1_phase2', true);
      }
    } else if (bossId === 'the-choir') {
      if (world.choir.nodes.some((n) => n.status === 'primed')) {
        triggerNarrativeTransmission(world, 'chapter2_node_primed', true);
      }
      if (
        world.choir.completedCycles > 0 ||
        world.choir.synchronizedCount >= world.choir.requiredNodeCount
      ) {
        triggerNarrativeTransmission(world, 'chapter2_confluence_broken', true);
      }
      if (world.boss.phase >= 2) {
        triggerNarrativeTransmission(world, 'chapter2_phase2', true);
      }
    } else if (bossId === 'the-curator') {
      if (world.gravityPin.activationCount > 0) {
        triggerNarrativeTransmission(world, 'chapter3_gravity_pin', true);
      }
      if (world.boss.phase >= 2) {
        triggerNarrativeTransmission(world, 'chapter3_phase2', true);
      }
    } else if (bossId === 'matron-v') {
      if (
        world.matron.siphonDrainEventsCount > 0 ||
        world.matron.eraserDisruptionsCount > 0 ||
        world.matron.chronoSeverActive
      ) {
        triggerNarrativeTransmission(world, 'chapter4_hazard', false);
      }
      if (world.echoCollapse.activationCount > 0) {
        triggerNarrativeTransmission(world, 'chapter4_collapse', true);
      }
      if (world.boss.phase >= 2) {
        triggerNarrativeTransmission(world, 'chapter4_phase2', true);
      }
    } else if (bossId === 'warden-prime') {
      if (world.boss.phase >= 2) {
        triggerNarrativeTransmission(world, 'warden_prime_phase2', true);
      }
    }
  }

  // Tick active transmission timer
  if (world.comms.active) {
    world.comms.active.remainingTime = Math.max(
      0,
      world.comms.active.remainingTime - dt
    );
    if (world.comms.active.remainingTime <= 0) {
      dismissActiveTransmission(world);
    }
  } else if (world.comms.queue.length > 0) {
    dismissActiveTransmission(world);
  }
}

function stepWorldSingleSlice(world: WorldState, input: PlayerInputFrame, dt: number): void {
  if (world.appState !== 'playing') {
    return;
  }

  // Camera trauma decay ticks in real dt
  world.cameraTrauma = Math.max(0, world.cameraTrauma - 1.65 * dt);

  // Tick campaign intro / checkpoint notice timers
  if (world.run.checkpointNoticeTimer > 0) {
    world.run.checkpointNoticeTimer = Math.max(0, world.run.checkpointNoticeTimer - dt);
  }
  if (world.recursion?.awaitingRelicDraft) {
    return;
  }
  if (world.run.stage === 'intro') {
    world.run.introTimer = Math.max(0, world.run.introTimer - dt);
    const hasPlayerAction =
      Math.hypot(input.moveX, input.moveZ) > 0.2 ||
      input.lightAttackJustPressed ||
      input.heavyAttackJustPressed ||
      input.dodgeJustPressed ||
      input.parryJustPressed ||
      input.echoRecordJustPressed;
    if (world.run.introTimer <= 0 || hasPlayerAction) {
      world.run.stage = 'calibration';
      world.run.introTimer = 0;
    }
  }

  // If in the brief skippable Containment Breach transition between Calibration Bay and HELIX-04,
  // tick the transition timer and launch the boss encounter upon completion.
  if (world.run.mode === 'campaign' && world.run.stage === 'transition_to_boss') {
    world.run.transitionTimer = Math.max(0, world.run.transitionTimer - dt);
    world.player.invulnTimer = Math.max(world.player.invulnTimer, 0.25);
    if (world.run.transitionTimer <= 0) {
      transitionCampaignToBoss(world, false, 'chapter_1_helix');
    }
    return;
  }

  // Process Echo record/play/clear one-shot commands even if hitstop is active
  handleEchoControlInputs(world, input);

  // Hitstop freeze pauses simulation physics & Echo timeline while preserving combat input buffers
  if (world.hitstopTimer > 0) {
    const p = world.player;
    if (p.actionState !== 'dead') {
      if (input.dodgeJustPressed) {
        p.bufferedAction = 'dodge';
        p.bufferTimer = 0.2;
      } else if (input.parryJustPressed) {
        p.bufferedAction = 'parry';
        p.bufferTimer = 0.2;
      } else if (input.heavyAttackJustPressed) {
        p.bufferedAction = 'heavy';
        p.bufferTimer = 0.2;
      } else if (input.lightAttackJustPressed) {
        p.bufferedAction = 'light';
        p.bufferTimer = 0.2;
      }
      if (input.selectWeaponId && isValidWeaponId(input.selectWeaponId)) {
        if (input.selectWeaponId !== p.equippedWeaponId && getUnlockedWeaponIds(world).includes(input.selectWeaponId)) {
          p.bufferedWeaponSwitch = input.selectWeaponId;
          p.weaponSwitchBufferTimer = 0.35;
        }
      } else if (input.switchWeaponJustPressed) {
        p.bufferedWeaponSwitch = 'cycle';
        p.weaponSwitchBufferTimer = 0.35;
      }
    }
    world.hitstopTimer = Math.max(0, world.hitstopTimer - dt);
    return;
  }

  // If encounter outcome was triggered, tick the brief dramatic beat before opening modal
  if (world.outcome !== 'none') {
    world.run.stage = 'completed';
    for (let i = 0; i < world.enemies.length; i++) {
      const enemy = world.enemies[i];
      if (enemy.aiState === 'ko') {
        enemy.stateTimer = Math.max(0, enemy.stateTimer - dt);
        enemy.koProgress = Math.min(1, 1 - enemy.stateTimer / (enemy.stateDuration || 0.45));
      }
    }
    if (world.boss && world.boss.aiState === 'defeated') {
      world.boss.stateTimer = Math.max(0, world.boss.stateTimer - dt);
      world.boss.koProgress = Math.min(
        1,
        1 - world.boss.stateTimer / (world.boss.stateDuration || 0.55)
      );
    }
    world.outcomeDelayTimer -= dt;
    if (world.outcomeDelayTimer <= 0) {
      world.frozenSummary = buildRunSummary(world);
      world.appState = 'gameover';
    }
    return;
  }

  const pxSlice = ensureParadoxState(world);
  const realDt = dt;
  if (pxSlice.activeToast) {
    pxSlice.activeToast.remaining = Math.max(
      0,
      pxSlice.activeToast.remaining - realDt
    );
    if (pxSlice.activeToast.remaining <= 0) {
      pxSlice.activeToast = null;
    }
  }
  if (pxSlice.loadout.naniteCooldown > 0) {
    pxSlice.loadout.naniteCooldown = Math.max(
      0,
      pxSlice.loadout.naniteCooldown - realDt
    );
  }
  tickDamagePopups(pxSlice, realDt);

  if (pxSlice.killCamTimer > 0) {
    pxSlice.killCamTimer = Math.max(0, pxSlice.killCamTimer - realDt);
    dt = realDt * 0.24;
  } else {
    const sliceMutMods = computeMutatorModifiers(pxSlice.mutators);
    dt = realDt * sliceMutMods.speedMult;
  }
  pxSlice.speedrun.runElapsedSec += realDt;

  world.elapsedTime += dt;

  // Tick Chrono Stasis Overdrive [5], Med-Nanite Injector [6] & Boss Gauntlet timer
  if (!world.overdrive) {
    world.overdrive = createInitialChronoOverdriveState(25);
  }
  const eventIndexBeforeSlice = world.events.length;
  if (input.overdriveJustPressed) {
    attemptActivateChronoOverdrive(world);
  }
  if (input.useNaniteJustPressed) {
    useMedNaniteInjector(world);
  }
  if (input.confluenceBurstJustPressed) {
    triggerConfluenceBurst(world);
  }
  const sliceConfluence = computeSentinelCoreConfluence(
    normalizeSentinelMode(world.progression?.sentinelMode),
    world.progression?.equippedBossCore,
    world.progression?.transcendedBossCores
  );
  if (pxSlice.mutators.zeroEchoCooldown) {
    world.resonance.cooldownTimer = 0;
    world.relay.cooldownTimer = 0;
    world.relay.fluxCost = Math.max(5, Math.round(GAME_CONFIG.relay.fluxCost * 0.5));
  } else {
    const relayRigMods = getPlayerRigModifiers(world);
    const relayRigSyn = getPlayerRigSetSynergy(world);
    world.relay.fluxCost = Math.max(
      0,
      Math.round(
        (GAME_CONFIG.relay.fluxCost + relayRigMods.relayFluxCostDelta) *
          relayRigSyn.skillFluxCostMultiplier *
          sliceConfluence.skillFluxCostMultiplier
      )
    );
  }
  const odTick = tickChronoOverdrive(world.overdrive, dt);
  world.overdrive = odTick.state;
  if (odTick.justEnded) {
    world.events.push({
      type: 'chrono_overdrive_ended',
      x: world.player.x,
      z: world.player.z,
    });
  }
  if (world.gauntlet?.active && !world.gauntlet.completed) {
    world.gauntlet.totalElapsedTime = world.elapsedTime;
    if (world.gauntlet.refitBannerTimer > 0) {
      world.gauntlet.refitBannerTimer = Math.max(0, world.gauntlet.refitBannerTimer - dt);
    }
  }

  tickTemporalSlipTimers(world.player, dt);
  const odScales = getOverdriveTimeScales(world.overdrive);
  const playerDt = dt * odScales.playerSpeedMult;
  const enemyDt =
    dt * computeEffectiveHostileTimeScale(odScales.enemyTimeScale, world.player.temporalSlipTimer);

  // Tick Relay cooldown & visual flash timers
  const stepRigMods = getPlayerRigModifiers(world);
  const stepRecMods = getActiveRecursionModifiers(world);
  const stepCooldownScale =
    stepRigMods.surgeCooldownTickMultiplier *
    (stepRecMods.cooldownMultiplier !== 1
      ? 1 / Math.max(0.35, stepRecMods.cooldownMultiplier)
      : 1);
  world.relay.cooldownTimer = Math.max(
    0,
    world.relay.cooldownTimer - dt * stepCooldownScale
  );
  world.relay.successFlashTimer = Math.max(0, world.relay.successFlashTimer - dt);

  // Tick Temporal Resonance window & Convergence cooldown timers
  advanceResonanceSystem(world, dt);

  updatePlayer(world, input, playerDt);
  if (odScales.heatLockZero) {
    world.player.weaponHeat = 0;
    world.player.weaponOverheated = false;
    world.player.weaponOverheatTimer = 0;
  }

  // Process one-shot Echo-Anchor Relay [V] before advancing Echo playback so landing matches the evaluated preview
  if (input.echoRelayJustPressed) {
    attemptEchoRelay(world);
  }

  // Process Chapter III Gravity Pin [G] and Chapter IV Echo Collapse [X]
  if (input.gravityPinJustPressed) {
    attemptGravityPin(world);
  }
  if (input.echoCollapseJustPressed) {
    attemptEchoCollapse(world);
  }
  if (input.interactJustPressed) {
    attemptEnvironmentalInteraction(world);
  }

  advanceEchoSystem(world, playerDt);
  advanceProjectiles(world, playerDt);

  const inExpeditionExplore = Boolean(
    world.expedition?.enabled &&
      (world.expedition.phase === 'explore' || world.expedition.phase === 'safe_room')
  );

  // Tick Chapter II, III, IV mechanics & hostiles (suspended during Expedition Explore & Safe-Room)
  if (!inExpeditionExplore) {
    advanceChoirSystem(world, dt);
    advanceCuratorSystem(world, enemyDt);
    advanceMatronSystem(world, enemyDt);

    updatePressurePlate(world, dt);
    updateBoss(world, enemyDt);
    updateEnemies(world, enemyDt);
  } else {
    updatePressurePlate(world, dt);
    for (let i = 0; i < world.enemies.length; i++) {
      const e = world.enemies[i];
      if (e.aiState !== 'ko') {
        e.vx = 0;
        e.vz = 0;
        e.cooldownTimer = Math.max(e.cooldownTimer, 0.45);
      }
    }
    if (world.boss && world.boss.aiState !== 'ko' && world.boss.aiState !== 'defeated') {
      world.boss.vx = 0;
      world.boss.vz = 0;
      world.boss.cooldownTimer = Math.max(world.boss.cooldownTimer, 0.55);
    }
  }

  // Zero-allocation collision resolution
  resolveActorSeparation(world.player, world.enemies);

  const solidProps = getArenaSolidPropColliders(world.run?.chapter ?? 'prologue');

  _scratchCollider.x = world.player.x;
  _scratchCollider.z = world.player.z;
  _scratchCollider.radius = GAME_CONFIG.player.radius;
  resolveCircleObstacleCollisions(
    _scratchCollider,
    world.obstacles,
    GAME_CONFIG.arena.radius,
    solidProps
  );
  world.player.x = _scratchCollider.x;
  world.player.z = _scratchCollider.z;

  for (let i = 0; i < world.enemies.length; i++) {
    const enemy = world.enemies[i];
    if (enemy.aiState === 'ko') continue;
    _scratchCollider.x = enemy.x;
    _scratchCollider.z = enemy.z;
    _scratchCollider.radius = enemy.radius;
    resolveCircleObstacleCollisions(
      _scratchCollider,
      world.obstacles,
      GAME_CONFIG.arena.radius,
      solidProps
    );
    enemy.x = _scratchCollider.x;
    enemy.z = _scratchCollider.z;
    if (world.boss && world.boss.id === enemy.id) {
      world.boss.x = enemy.x;
      world.boss.z = enemy.z;
    }
  }

  // Keep active Resonance mark coordinates anchored to the marked enemy after physics & collisions
  if (world.resonance.activeMark) {
    for (let i = 0; i < world.enemies.length; i++) {
      const e = world.enemies[i];
      if (e.id === world.resonance.activeMark.enemyId) {
        world.resonance.activeMark.x = e.x;
        world.resonance.activeMark.z = e.z;
        break;
      }
    }
  }

  // Re-evaluate pressure plate and Relay target preview after collision resolution so boundary triggers are exact
  updatePressurePlate(world, 0);
  world.relay.preview = evaluateRelayTarget(world);
  if (world.relay.successFlashTimer <= 0) {
    world.relay.statusMessage = world.relay.preview.message;
  }

  // Update timed energy hazards, arena kinetic boost pads, charged flux pools, tactical beacons, exploration objectives & live narrative comms
  advanceArenaBoostPads(world, dt);
  advanceArenaFluxPools(world, dt);
  if (world.sectorBeacons && world.sectorBeacons.length > 0) {
    for (let i = 0; i < world.sectorBeacons.length; i++) {
      const b = world.sectorBeacons[i];
      if (b.cooldown > 0) {
        b.cooldown = Math.max(
          0,
          b.cooldown - dt * stepRigMods.surgeCooldownTickMultiplier
        );
      }
    }
  }
  const inSafeRoomCalm = Boolean(
    world.expedition?.enabled && world.expedition.phase === 'safe_room'
  );
  if (!inExpeditionExplore && !inSafeRoomCalm) {
    advanceTimedEnergyHazards(world, enemyDt);
    advanceTemporalRiftSystem(world, dt);
    advanceConductorTethers(world, enemyDt);
    advanceArtilleryZones(world, enemyDt);
  }
  advanceMissionAndExplorationSystem(world);
  syncExpeditionState(world, dt);
  updateTutorialSystem(world, input, dt);
  advanceNarrativeCommsSystem(world, dt);

  // Autonomous 3D Combat Drone Wingman (Mk.I / Mk.II)
  if (pxSlice.loadout.combatDroneTier > 0 && world.player.actionState !== 'dead') {
    const droneTargets = !inExpeditionExplore
      ? world.enemies
          .filter((e) => e.hp > 0 && e.aiState !== 'ko' && !e.isDecoy)
          .map((e) => ({ id: e.id, x: e.x, z: e.z, hp: e.hp }))
      : [];
    const droneRes = tickCombatDrone({
      loadout: pxSlice.loadout,
      playerX: world.player.x,
      playerZ: world.player.z,
      playerIntegrity: world.player.integrity,
      playerMaxIntegrity: world.player.maxIntegrity,
      canAttack: !inExpeditionExplore,
      targets: droneTargets,
      dt: realDt,
    });
    if (droneRes.triggeredEmergencyShield) {
      world.events.push({
        type: 'combat_drone_shield_triggered',
        x: world.player.x,
        z: world.player.z,
        amount: 25,
      });
    }
    if (droneRes.fired && droneRes.targetId) {
      const targetEnemy = world.enemies.find(
        (e) => e.id === droneRes.targetId && e.hp > 0 && e.aiState !== 'ko'
      );
      if (targetEnemy) {
        const droneDmg = Math.max(
          1,
          Math.round(droneRes.damage * getParadoxOutgoingDamageMult(world))
        );
        targetEnemy.hp = Math.max(0, targetEnemy.hp - droneDmg);
        targetEnemy.hitFlashTimer = Math.max(targetEnemy.hitFlashTimer, 0.12);
        world.stats.damageDealt += droneDmg;
        world.player.flux = Math.min(
          world.player.maxFlux,
          world.player.flux + droneRes.fluxGain
        );
        const bossMatch =
          world.boss && world.boss.id === targetEnemy.id ? world.boss : null;
        if (bossMatch) {
          bossMatch.hp = targetEnemy.hp;
          bossMatch.hitFlashTimer = targetEnemy.hitFlashTimer;
          checkAndTriggerBossPhase2(world, bossMatch, targetEnemy);
        }
        pushDamagePopup(
          pxSlice,
          droneDmg,
          targetEnemy.x,
          bossMatch ? 2.6 : 1.9,
          targetEnemy.z,
          'drone'
        );
        world.events.push({
          type: 'combat_drone_fired',
          x: targetEnemy.x,
          z: targetEnemy.z,
          originX: pxSlice.loadout.droneX,
          originZ: pxSlice.loadout.droneZ,
          amount: droneDmg,
          enemyId: targetEnemy.id,
        });
        if (targetEnemy.hp <= 0) {
          handleEnemyZeroHpDefeat(world, targetEnemy, droneDmg, false, false, false);
        }
      }
    }
  }

  if (
    world.exploration &&
    typeof world.exploration.activeHoloMemoryTimer === 'number' &&
    world.exploration.activeHoloMemoryTimer > 0
  ) {
    world.exploration.activeHoloMemoryTimer = Math.max(
      0,
      world.exploration.activeHoloMemoryTimer - realDt
    );
    if (world.exploration.activeHoloMemoryTimer <= 0) {
      world.exploration.activeHoloMemoryId = null;
    }
  }

  // v3.3.0/v3.5.0 LYS-04 Chrono Sentinel, Regenerative Chrono Ward & Harmonic Confluence System
  if (world.player.actionState !== 'dead') {
    const aegisState = ensureChronoAegisState(world);
    const confluenceState = ensureChronoConfluenceState(world);
    if (confluenceState.cooldownTimer > 0) {
      confluenceState.cooldownTimer = Math.max(0, confluenceState.cooldownTimer - realDt);
      confluenceState.ready =
        confluenceState.doctrineId !== 'none' &&
        confluenceState.cooldownTimer <= 0 &&
        confluenceState.charge >= 100;
    }
    const stepRigSynergy = getPlayerRigSetSynergy(world);
    const stepBossCoreMods = computeBossCoreModifiers(
      world.progression?.equippedBossCore,
      world.progression?.transcendedBossCores
    );
    const stepConfluence = computeSentinelCoreConfluence(
      normalizeSentinelMode(world.progression?.sentinelMode),
      world.progression?.equippedBossCore,
      world.progression?.transcendedBossCores
    );
    const stepHoloResonance = computeHoloMemoryResonanceBonus(
      world.exploration?.discoveredHoloMemoryIds
    );
    const stepMasterySeal = computeMasterySealModifiers(world.progression?.combatMastery);
    syncChronoAegisMaxWard(
      aegisState,
      normalizeSentinelMode(world.progression?.sentinelMode),
      stepRigSynergy,
      false,
      stepBossCoreMods.bonusWard +
        stepConfluence.bonusWard +
        stepHoloResonance.bonusMaxWard +
        stepMasterySeal.bonusMaxWard
    );
    if (
      stepConfluence.wardRegenMultiplier > 1 &&
      aegisState.rechargeDelayTimer <= 0 &&
      aegisState.ward < aegisState.maxWard
    ) {
      aegisState.ward = Math.min(
        aegisState.maxWard,
        aegisState.ward + 8 * (stepConfluence.wardRegenMultiplier - 1) * realDt
      );
    }
    if (stepConfluence.sentinelFireRateMultiplier > 1 && aegisState.fireCooldown > 0) {
      aegisState.fireCooldown = Math.max(
        0,
        aegisState.fireCooldown - (stepConfluence.sentinelFireRateMultiplier - 1) * realDt
      );
    }
    const sentinelTargets = !inExpeditionExplore
      ? world.enemies
          .filter((e) => e.hp > 0 && e.aiState !== 'ko' && !e.isDecoy)
          .map((e) => ({ id: e.id, x: e.x, z: e.z, hp: e.hp }))
      : [];
    const sentinelTick = tickChronoAegisSystem({
      aegis: aegisState,
      rigSynergy: stepRigSynergy,
      playerX: world.player.x,
      playerZ: world.player.z,
      elapsedTime: world.elapsedTime,
      overdriveActive: Boolean(world.overdrive?.active),
      echoActiveOrRecording:
        world.echo.state === 'recording' || world.echo.state === 'playback',
      canAttack: !inExpeditionExplore,
      targets: sentinelTargets,
      dt: realDt,
    });
    if (sentinelTick.harmonicFluxPulse > 0) {
      world.player.flux = Math.min(
        world.player.maxFlux,
        world.player.flux +
          Math.round(sentinelTick.harmonicFluxPulse * stepConfluence.fluxGainMultiplier)
      );
    }
    if (sentinelTick.fired && sentinelTick.targetId) {
      const targetEnemy = world.enemies.find(
        (e) => e.id === sentinelTick.targetId && e.hp > 0 && e.aiState !== 'ko'
      );
      if (targetEnemy) {
        const sentDmg = Math.max(
          1,
          Math.round(
            sentinelTick.baseDamage *
              stepRigSynergy.damageMultiplier *
              getParadoxOutgoingDamageMult(world)
          )
        );
        targetEnemy.hp = Math.max(0, targetEnemy.hp - sentDmg);
        targetEnemy.hitFlashTimer = Math.max(targetEnemy.hitFlashTimer, 0.12);
        world.stats.damageDealt += sentDmg;
        world.player.flux = Math.min(
          world.player.maxFlux,
          world.player.flux +
            Math.round(sentinelTick.fluxGain * stepRigSynergy.fluxGainMultiplier)
        );
        if (targetEnemy.hp > 0 && targetEnemy.aiState !== 'staggered') {
          targetEnemy.stagger = Math.min(
            targetEnemy.maxStagger,
            targetEnemy.stagger + sentinelTick.baseStagger
          );
        }
        const bossMatch =
          world.boss && world.boss.id === targetEnemy.id ? world.boss : null;
        if (bossMatch) {
          bossMatch.hp = targetEnemy.hp;
          bossMatch.hitFlashTimer = targetEnemy.hitFlashTimer;
          if (bossMatch.staggerCooldownTimer <= 0 && bossMatch.aiState !== 'phase_transition') {
            bossMatch.stagger = targetEnemy.stagger;
          }
          checkAndTriggerBossPhase2(world, bossMatch, targetEnemy);
        }
        pushDamagePopup(
          pxSlice,
          sentDmg,
          targetEnemy.x,
          bossMatch ? 2.6 : 1.9,
          targetEnemy.z,
          'drone'
        );
        world.events.push({
          type: 'combat_drone_fired',
          x: targetEnemy.x,
          z: targetEnemy.z,
          originX: aegisState.droneX,
          originZ: aegisState.droneZ,
          amount: sentDmg,
          enemyId: targetEnemy.id,
        });
        if (targetEnemy.hp <= 0) {
          handleEnemyZeroHpDefeat(world, targetEnemy, sentDmg, false, false, false);
        }
      }
    }
  }

  // Scan combat events emitted in this slice for Floating Damage Numbers, Achievements, & Chrono Overdrive charge
  let chargeDelta = 0;
  for (let ei = eventIndexBeforeSlice; ei < world.events.length; ei++) {
    const ev = world.events[ei];
    if (ev.type === 'player_hit_enemy') {
      chargeDelta += ev.isHeavy
        ? OVERDRIVE_CHARGE_GAINS.heavyHit
        : OVERDRIVE_CHARGE_GAINS.lightHit;
      if (typeof ev.amount === 'number' && ev.amount > 0) {
        pushDamagePopup(
          pxSlice,
          ev.amount,
          ev.x,
          2.1,
          ev.z,
          ev.isCriticalOrVulnerable || ev.isHeavy ? 'crit' : 'normal'
        );
      }
    } else if (ev.type === 'player_parry_success') {
      chargeDelta += OVERDRIVE_CHARGE_GAINS.parry;
      if (world.progression) {
        world.progression.lifetimeParries = (world.progression.lifetimeParries ?? 0) + 1;
        if (world.progression.lifetimeParries >= 5) {
          unlockChronoAchievement(world, 'parry_specialist');
        }
      }
      pushDamagePopup(pxSlice, 25, ev.x, 2.2, ev.z, 'parry');
    } else if (ev.type === 'player_perfect_dodge') {
      chargeDelta += OVERDRIVE_CHARGE_GAINS.perfectDodge;
    } else if (ev.type === 'resonance_convergence') {
      chargeDelta += OVERDRIVE_CHARGE_GAINS.convergence;
      if (world.progression) {
        world.progression.lifetimeConvergences =
          (world.progression.lifetimeConvergences ?? 0) + 1;
        if (world.progression.lifetimeConvergences >= 5) {
          unlockChronoAchievement(world, 'convergence_chain');
        }
      }
      if (typeof ev.amount === 'number' && ev.amount > 0) {
        pushDamagePopup(pxSlice, ev.amount, ev.x, 2.5, ev.z, 'convergence');
      }
    } else if (ev.type === 'enemy_killed') {
      chargeDelta += OVERDRIVE_CHARGE_GAINS.enemyDefeat;
    } else if (ev.type === 'temporal_rift_sealed') {
      chargeDelta += OVERDRIVE_CHARGE_GAINS.riftSeal;
    }
    if (ev.type === 'player_hit_enemy') {
      grantConfluenceCharge(
        world,
        ev.isHeavy ? CONFLUENCE_CHARGE_GAINS.heavyHit : CONFLUENCE_CHARGE_GAINS.lightHit
      );
    } else if (ev.type === 'player_parry_success') {
      grantConfluenceCharge(world, CONFLUENCE_CHARGE_GAINS.parry);
    } else if (ev.type === 'resonance_convergence') {
      grantConfluenceCharge(world, CONFLUENCE_CHARGE_GAINS.convergence);
    } else if (
      ev.type === 'enemy_staggered' ||
      ev.type === 'boss_staggered' ||
      ev.type === 'chrono_execution_finisher'
    ) {
      grantConfluenceCharge(world, CONFLUENCE_CHARGE_GAINS.weakpointOrExecute);
    }
  }
  if (world.overdrive && !world.overdrive.active && chargeDelta > 0) {
    const odChargeMult =
      computeBossCoreModifiers(
        world.progression?.equippedBossCore,
        world.progression?.transcendedBossCores
      ).overdriveChargeMultiplier *
      computeMasterySealModifiers(world.progression?.combatMastery).overdriveChargeMult;
    world.overdrive = addOverdriveCharge(world.overdrive, chargeDelta * odChargeMult);
  }

  // v2.4.0 Chrono Ascension: Style Rank, Weapon Mod Socket Chips, Finisher Rift & Daily Trial
  stepAscensionSystems(world, dt, eventIndexBeforeSlice);

  // Track boss_intro -> boss_fight transition once boss finishes its awakening beat
  if (
    world.encounterMode === 'boss' &&
    world.run.stage === 'boss_intro' &&
    world.boss &&
    world.boss.aiState !== 'dormant'
  ) {
    world.run.stage = 'boss_fight';
  }

  // Check Victory / First-Map Campaign Transition condition:
  // - In boss encounters, victory is triggered authoritatively in handleEnemyZeroHpDefeat when the boss is defeated.
  // - In Campaign Mode Prologue (Calibration Bay 04), completing the 3-stage Calibration Puzzle OR defeating all 3 WARDEN proxies triggers the Containment Breach transition into HELIX-04!
  // - In standard encounters (Practice Standard), defeating all enemies triggers victory.
  let anyAlive = false;
  for (let i = 0; i < world.enemies.length; i++) {
    const e = world.enemies[i];
    if (e.hp > 0 && e.aiState !== 'ko') {
      anyAlive = true;
      break;
    }
  }

  if (
    world.encounterMode === 'standard' &&
    world.outcome === 'none' &&
    world.enemies.length > 0 &&
    !anyAlive
  ) {
    if (advanceEncounterWaveIfReady(world)) {
      return;
    }
  }

  if (
    world.run.mode === 'campaign' &&
    world.encounterMode === 'standard' &&
    world.run.chapter === 'prologue' &&
    world.outcome === 'none' &&
    world.enemies.length > 0 &&
    !anyAlive
  ) {
    grantProgressionReward(world, 'prologue_bay_proxies_cleared');
  }

  if (
    world.run.mode === 'campaign' &&
    world.encounterMode === 'standard' &&
    world.run.chapter === 'prologue' &&
    world.outcome === 'none' &&
    (world.puzzle.completed || (world.enemies.length > 0 && !anyAlive))
  ) {
    world.puzzle.completed = true;
    world.puzzle.stage = 'completed';
    if (world.encounter) {
      world.encounter.completed = true;
      world.encounter.waveClearedCount = world.encounter.totalWaves;
    }
    if (world.run.isChapterReplay) {
      world.projectiles = [];
      world.outcome = 'victory';
      world.run.stage = 'completed';
      world.run.pendingNextChapter = null;
      world.outcomeDelayTimer = 0.5;
      recordWorldCombatMasteryOnVictory(world, ['sector_prologue']);
      world.frozenSummary = buildRunSummary(world);
      clearEchoState(world, 'outcome');
      world.events.push({
        type: 'encounter_victory',
        x: world.player.x,
        z: world.player.z,
      });
      return;
    }
    if (world.expedition?.enabled && !world.run.isChapterReplay) {
      if (world.expedition.phase !== 'airlock_open' && world.expedition.phase !== 'safe_room') {
        if (world.puzzle?.completed) {
          grantProgressionReward(world, 'prologue_calibration_combine');
        }
        if (world.enemies.length > 0 && !anyAlive) {
          grantProgressionReward(world, 'prologue_bay_proxies_cleared');
        }
        world.run.completedChapters = addUniqueChapter(
          world.run.completedChapters,
          'prologue'
        );
        recordWorldCombatMasteryOnVictory(world, ['sector_prologue']);
        world.run.unlockedChapters = addUniqueChapter(
          world.run.unlockedChapters,
          'chapter_1_helix'
        );
        world.run.recoveredLogs = addUniqueString(
          world.run.recoveredLogs ?? [],
          'LOG-00'
        );
        unlockPlayerWeapon(world, 'phase_rail');
        const checkpoint = captureBossCheckpointFromWorld(
          world,
          'chapter_1_helix',
          'helix-04'
        );
        world.run.bossCheckpoint = checkpoint;
        world.player.integrity = checkpoint.integrity;
        world.player.ghostIntegrity = checkpoint.integrity;
        world.player.flux = checkpoint.flux;
        unlockExpeditionTransitAirlock(world, 'chapter_1_helix');
      }
      return;
    }
    beginCampaignBossTransition(world);
    return;
  }

  if (
    world.run.mode === 'recursion' &&
    world.encounterMode === 'standard' &&
    world.enemies.length > 0 &&
    !anyAlive &&
    world.outcome === 'none'
  ) {
    completeRecursionLoopAndOpenDraft(world);
    return;
  }

  const canTriggerEncounterVictory =
    world.encounterMode === 'standard' &&
    world.run.mode !== 'campaign' &&
    world.run.mode !== 'recursion' &&
    world.run.chapter !== 'chapter_5_loom';
  if (
    world.enemies.length > 0 &&
    !anyAlive &&
    world.outcome === 'none' &&
    canTriggerEncounterVictory
  ) {
    if (world.encounter) {
      world.encounter.completed = true;
      world.encounter.waveClearedCount = world.encounter.totalWaves;
    }
    world.projectiles = [];
    world.outcome = 'victory';
    world.run.stage = 'completed';
    world.outcomeDelayTimer = 0.5;
    clearEchoState(world, 'outcome');
    if (world.run.chapter === 'prologue') {
      recordWorldCombatMasteryOnVictory(world, ['sector_prologue']);
    }
    world.frozenSummary = buildRunSummary(world);
    world.events.push({
      type: 'encounter_victory',
      x: world.player.x,
      z: world.player.z,
    });
  }
}

export function stepWorld(world: WorldState, input: PlayerInputFrame, rawDt: number): void {
  world.events.length = 0;

  if (world.appState !== 'playing') {
    return;
  }

  // Cap extreme multi-second tab-inactivity spikes at 0.25s, while preserving full elapsed time for slower/headless frames (e.g. 64ms)
  const totalDt = Math.min(Math.max(rawDt, 0), 0.25);
  if (totalDt <= 0) return;

  if (totalDt <= 0.05) {
    stepWorldSingleSlice(world, input, totalDt);
    return;
  }

  // Substep intervals > 0.05s (such as 64ms headless throttle frames) into <= 0.05s slices so no simulation time is lost
  const slices = Math.ceil(totalDt / 0.05);
  const sliceDt = totalDt / slices;

  _scratchSubstepInput.moveX = input.moveX;
  _scratchSubstepInput.moveZ = input.moveZ;
  _scratchSubstepInput.aimYaw = input.aimYaw;
  _scratchSubstepInput.aimPitch = input.aimPitch;
  _scratchSubstepInput.aimWorldX = input.aimWorldX;
  _scratchSubstepInput.aimWorldZ = input.aimWorldZ;
  _scratchSubstepInput.heavyHoldActive = input.heavyHoldActive;
  _scratchSubstepInput.lightAttackJustPressed = false;
  _scratchSubstepInput.heavyJustReleased = false;
  _scratchSubstepInput.heavyAttackJustPressed = false;
  _scratchSubstepInput.dodgeJustPressed = false;
  _scratchSubstepInput.parryJustPressed = false;
  _scratchSubstepInput.echoRecordJustPressed = false;
  _scratchSubstepInput.echoPlayJustPressed = false;
  _scratchSubstepInput.echoClearJustPressed = false;
  _scratchSubstepInput.echoRelayJustPressed = false;
  _scratchSubstepInput.gravityPinJustPressed = false;
  _scratchSubstepInput.echoCollapseJustPressed = false;
  _scratchSubstepInput.interactJustPressed = false;
  _scratchSubstepInput.lockOnToggleJustPressed = false;
  _scratchSubstepInput.lockOnCycleJustPressed = false;
  _scratchSubstepInput.overdriveJustPressed = false;
  _scratchSubstepInput.confluenceBurstJustPressed = false;
  _scratchSubstepInput.switchWeaponJustPressed = false;
  _scratchSubstepInput.selectWeaponId = null;

  for (let s = 0; s < slices; s++) {
    stepWorldSingleSlice(world, s === 0 ? input : _scratchSubstepInput, sliceDt);
  }
}

export function getEnemyTacticalProfile(
  enemy: EnemyState,
  player?: { x: number; z: number }
): {
  roleId: 'bulwark' | 'skirmisher' | 'suppressor' | 'disruptor' | 'boss';
  roleLabel: string;
  statusLabel: string;
  isFrontShieldActive: boolean;
  isPlayerInFrontArc: boolean;
  telegraphLocked: boolean;
} {
  let roleId: 'bulwark' | 'skirmisher' | 'suppressor' | 'disruptor' | 'boss' = 'skirmisher';
  let roleLabel = 'FLANKING SKIRMISHER';

  if (enemy.archetype === 'bastion') {
    roleId = 'bulwark';
    roleLabel = 'AEGIS BULWARK';
  } else if (enemy.archetype === 'aegis_sentinel') {
    roleId = 'bulwark';
    roleLabel = 'PHALANX SENTINEL';
  } else if (enemy.archetype === 'scrapper') {
    roleId = 'skirmisher';
    roleLabel = 'FLANKING SKIRMISHER';
  } else if (enemy.archetype === 'curator_decoy') {
    roleId = 'skirmisher';
    roleLabel = 'PHANTOM SKIRMISHER';
  } else if (enemy.archetype === 'scout') {
    roleId = 'suppressor';
    roleLabel = 'RANGED SUPPRESSOR';
  } else if (enemy.archetype === 'null_weaver') {
    roleId = 'disruptor';
    roleLabel = 'PHASE SUPPRESSOR';
  } else if (enemy.archetype === 'siphon') {
    roleId = 'disruptor';
    roleLabel = 'FLUX EXTRACTOR';
  } else if (enemy.archetype === 'eraser') {
    roleId = 'disruptor';
    roleLabel = 'ECHO NULLIFIER';
  } else if (enemy.archetype === 'phase_stalker') {
    roleId = 'skirmisher';
    roleLabel = 'PHASE BLINK ASSASSIN';
  } else if (enemy.archetype === 'chrono_mortar') {
    roleId = 'suppressor';
    roleLabel = 'SIEGE MORTAR TRIPOD';
  } else if (enemy.archetype === 'resonance_warden') {
    roleId = 'disruptor';
    roleLabel = 'HARMONIC CONDUCTOR';
  } else if (isBossArchetype(enemy.archetype)) {
    roleId = 'boss';
    roleLabel = 'BOSS ENCOUNTER';
  }

  const isFrontShieldActive =
    (enemy.archetype === 'bastion' || enemy.archetype === 'aegis_sentinel') &&
    enemy.aiState !== 'recovery' &&
    enemy.aiState !== 'staggered' &&
    enemy.aiState !== 'ko';

  let isPlayerInFrontArc = false;
  if (player && (enemy.archetype === 'bastion' || enemy.archetype === 'aegis_sentinel')) {
    const angleFromEnemyToPlayer = Math.atan2(player.x - enemy.x, player.z - enemy.z);
    const guardArc =
      enemy.archetype === 'aegis_sentinel'
        ? GAME_CONFIG.enemies.aegis_sentinel.frontGuardArc
        : GAME_CONFIG.enemies.bastion.frontGuardArc;
    isPlayerInFrontArc =
      Math.abs(angleDiff(angleFromEnemyToPlayer, enemy.rotationY)) <=
      guardArc * 0.5;
  }

  const telegraphLocked = Boolean(enemy.telegraphLocked);

  let statusLabel = 'ENGAGED';
  if ((enemy.pinnedTimer ?? 0) > 0) {
    statusLabel = 'GRAVITY PINNED';
  } else if (enemy.aiState === 'staggered') {
    statusLabel = 'POSTURE BROKEN · 1.5x DMG';
  } else if (enemy.aiState === 'recovery') {
    statusLabel =
      enemy.archetype === 'bastion' || enemy.archetype === 'aegis_sentinel'
        ? 'SHIELD OPEN · 1.5x VULNERABLE'
        : 'VULNERABLE RECOVERY · 1.5x DMG';
  } else if (enemy.aiState === 'telegraph') {
    if (enemy.archetype === 'scout') {
      statusLabel = telegraphLocked
        ? 'PULSE AIM LOCKED · DODGE OR BREAK'
        : 'CALIBRATING PULSE · HEAVY BREAKS';
    } else if (enemy.archetype === 'null_weaver') {
      statusLabel = telegraphLocked
        ? 'SUPPRESSION BOLT LOCKED · DODGE OR BREAK LOS'
        : 'CHARGING FLUX DAMPENER · HEAVY BREAKS';
    } else if (enemy.archetype === 'bastion' || enemy.archetype === 'aegis_sentinel') {
      statusLabel = telegraphLocked
        ? 'COUNTER-SWEEP COMMITTED · PARRY/DODGE'
        : 'MAUL WINDUP · PARRY OR FLANK';
    } else if (enemy.archetype === 'scrapper') {
      statusLabel = telegraphLocked
        ? 'LUNGE COMMITTED · DODGE LATERAL'
        : 'COILING LUNGE · PARRY/DODGE';
    } else if (enemy.archetype === 'phase_stalker') {
      statusLabel = 'PHASE BLINK SLASH · PARRY [Q] OR SIDESTEP';
    } else if (enemy.archetype === 'chrono_mortar') {
      statusLabel = 'MORTAR BARRAGE LOCKING · EVADE BLAST RINGS';
    } else if (enemy.archetype === 'resonance_warden') {
      statusLabel = 'HARMONIC PULSE · STAGGER TO SEVER TETHER';
    } else if (enemy.archetype === 'siphon') {
      statusLabel = 'SIPHON STRIKE · DRAINS 22 FLUX';
    } else if (enemy.archetype === 'eraser') {
      statusLabel = 'ANTI-ECHO PULSE · SEVERS REPLAY';
    } else {
      statusLabel = 'ATTACK TELEGRAPH';
    }
  } else if (enemy.aiState === 'attack') {
    statusLabel = 'ACTIVE STRIKE';
  } else if (enemy.archetype === 'aegis_sentinel') {
    statusLabel = isPlayerInFrontArc
      ? 'FRONTAL BARRIER · 82% MITIGATION (USE GRAV-BREAKER OR FLANK)'
      : 'FLANK OPEN · 1.0x UNGUARDED DMG';
  } else if (enemy.archetype === 'bastion') {
    statusLabel = isPlayerInFrontArc
      ? 'FRONTAL GUARD · 0.42x DMG (FLANK/HEAVY)'
      : 'FLANK OPEN · 1.0x UNGUARDED DMG';
  } else if (enemy.archetype === 'scout') {
    statusLabel = 'STANDOFF ORBIT · USE COVER OR RANGED';
  } else if (enemy.archetype === 'null_weaver') {
    statusLabel = 'PHASE SUPPRESSOR · DAMPENS FLUX ON HIT';
  } else if (enemy.archetype === 'phase_stalker') {
    statusLabel = 'BLINK ASSASSIN · TELEPORTS TO FLANK';
  } else if (enemy.archetype === 'chrono_mortar') {
    statusLabel = 'SIEGE ARTILLERY · RUSH OR RANGED INTERRUPT';
  } else if (enemy.archetype === 'resonance_warden') {
    statusLabel = enemy.tetherTargetId
      ? 'TETHER ACTIVE · +25% ALLY DR & REGEN (STAGGER TO BREAK)'
      : 'HARMONIC CONDUCTOR · SEEKING ALLY LINK';
  } else if (enemy.archetype === 'scrapper') {
    statusLabel = 'FLANKING APPROACH · LOW POSTURE';
  } else if (enemy.archetype === 'siphon') {
    statusLabel = 'HUNTING FLUX · PRIORITIZE';
  } else if (enemy.archetype === 'eraser') {
    statusLabel = 'HUNTING ACTIVE ECHO';
  }

  return {
    roleId,
    roleLabel,
    statusLabel,
    isFrontShieldActive,
    isPlayerInFrontArc,
    telegraphLocked,
  };
}

export function extractHudSnapshot(world: WorldState, aimYaw?: number): HudSnapshot {
  const p = world.player;
  const totalEnemies = world.enemies.length;
  let enemiesAlive = 0;
  let focusedEnemy: HudSnapshot['focusedEnemy'] = null;
  let bestScore = Infinity;

  const activeMark = world.resonance.activeMark;

  for (let i = 0; i < totalEnemies; i++) {
    const e = world.enemies[i];
    if (e.hp <= 0 || e.aiState === 'ko') continue;
    enemiesAlive += 1;
    const dist = Math.hypot(e.x - p.x, e.z - p.z);
    const isMarked = activeMark?.enemyId === e.id;
    const statePriority =
      (e.aiState === 'telegraph' || e.aiState === 'recovery' || e.aiState === 'staggered'
        ? -4
        : 0) + (isMarked ? -6 : 0);
    const score = dist + statePriority;
    if (score < bestScore) {
      bestScore = score;
      const tacticalProfile = getEnemyTacticalProfile(e, p);
      focusedEnemy = {
        id: e.id,
        name: e.name,
        archetype: e.archetype,
        hp: Math.ceil(e.hp),
        maxHp: e.maxHp,
        ghostHp: Math.ceil(e.ghostHp),
        stagger: Math.round(e.stagger),
        maxStagger: e.maxStagger,
        aiState: e.aiState,
        telegraphRatio:
          e.aiState === 'telegraph' && e.stateDuration > 0
            ? Math.max(0, Math.min(1, 1 - e.stateTimer / e.stateDuration))
            : 0,
        isResonanceMarked: isMarked,
        resonanceRemaining: isMarked && activeMark ? Number(activeMark.remainingTime.toFixed(2)) : 0,
        isDecoy: e.isDecoy,
        pinnedTimer: e.pinnedTimer ? Number(e.pinnedTimer.toFixed(2)) : 0,
        roleLabel: tacticalProfile.roleLabel,
        statusLabel: tacticalProfile.statusLabel,
        isFrontShieldActive: tacticalProfile.isFrontShieldActive,
        telegraphLocked: tacticalProfile.telegraphLocked,
        modifier: e.modifier ?? null,
        isTetherProtected: isEnemyProtectedByConductor(world, e.id),
      };
    }
  }

  let bossSnapshot: HudBossSnapshot | null = null;
  if (world.boss) {
    const b = world.boss;
    const isBossMarked = activeMark?.enemyId === b.id;
    bossSnapshot = {
      id: b.id,
      name: b.name,
      subtitle: b.subtitle,
      hp: Math.ceil(b.hp),
      maxHp: b.maxHp,
      ghostHp: Math.ceil(b.ghostHp),
      stagger: Math.round(b.stagger),
      maxStagger: b.maxStagger,
      phase: b.phase,
      aiState: b.aiState,
      activeAttack: b.activeAttack,
      telegraphRatio:
        b.aiState === 'telegraph' && b.stateDuration > 0
          ? Math.max(0, Math.min(1, 1 - b.stateTimer / b.stateDuration))
          : 0,
      coreExposed: b.coreExposed,
      isResonanceMarked: isBossMarked,
      resonanceRemaining:
        isBossMarked && activeMark ? Number(activeMark.remainingTime.toFixed(2)) : 0,
      statusLabel: b.statusLabel,
      introRemaining:
        b.aiState === 'dormant' ? Number(Math.max(0, b.stateTimer).toFixed(2)) : 0,
      introDuration:
        b.aiState === 'dormant' && b.stateDuration > 0
          ? b.stateDuration
          : GAME_CONFIG.boss.introDuration,
    };
  }

  let objectiveText =
    world.run.chapter === 'chapter_5_loom'
      ? 'CHAPTER V · THE LAST LOOP — CHRONICLE LOOM'
      : world.encounterMode === 'boss' && world.boss
        ? `NEUTRALIZE ${world.boss.name} · ${world.boss.subtitle}`
        : world.encounter && world.encounter.totalWaves > 1
          ? `${world.encounter.label} · WAVE ${world.encounter.currentWaveIndex}/${world.encounter.totalWaves}`
          : world.encounter && world.encounter.encounterId !== 'prologue_calibration_bay'
            ? `${world.encounter.label}`
            : 'NEUTRALIZE WARDEN SECURITY UNITS';
  let objectiveSubtext =
    world.run.chapter === 'chapter_5_loom'
      ? 'Approach the Chronicle Loom Console and select Nadir-9’s final protocol: SILENCE, WITNESS, or CONTINUITY'
      : world.encounterMode === 'boss'
        ? 'Evade telegraphed attacks and strike the exposed Chrono Core (1.5x)'
        : world.encounter && world.encounter.encounterId !== 'prologue_calibration_bay'
          ? world.encounter.tacticalDirective
          : 'Strike White Recovery Windows after telegraphs for 1.5x damage';

  const plate = world.pressurePlate;
  const puzzle = world.puzzle;
  const receiver = puzzle.heavyReceiver;
  const combinePlate = puzzle.combinePlate;
  const finalBarrier = puzzle.finalBarrier;

  const playerDistToPlate = Math.hypot(p.x - plate.x, p.z - plate.z);
  const playerDistToReceiver = Math.hypot(p.x - receiver.x, p.z - receiver.z);
  const playerDistToCombinePlate = Math.hypot(p.x - combinePlate.x, p.z - combinePlate.z);

  if (world.expedition?.enabled && world.expedition.phase === 'safe_room') {
    const nextSpec = world.expedition.safeRoom?.nextChapter
      ? getExpeditionSectorSpec(world.expedition.safeRoom.nextChapter)
      : null;
    objectiveText = nextSpec
      ? `TRANSIT SAFE-ROOM · PREPARE FOR SECTOR ${nextSpec.code} (${nextSpec.shortName})`
      : 'PRESSURIZED TRANSIT HUB · RESUPPLY & REFIT';
    objectiveSubtext =
      'Use Med-Supply Bay [I], Lysa Venn Hologram [I], or Field Workbench [U] — walk North to depart';
  } else if (world.expedition?.enabled && world.expedition.phase === 'explore') {
    objectiveText = `SECTOR ${world.expedition.sectorCode} · ${world.expedition.sectorTitle.toUpperCase()} — RECON & LOOT`;
    objectiveSubtext = world.expedition.playerInsideBreachSeal
      ? `INSIDE BREACH SEAL · Press [I] to awaken ${world.expedition.wardenLabel}`
      : `Explore caches, Echo Vault switch, & archives — or breach Central Seal [I] to engage ${world.expedition.wardenLabel}`;
  } else if (world.expedition?.enabled && world.expedition.phase === 'airlock_open') {
    const nextSpec = world.expedition.nextChapter
      ? getExpeditionSectorSpec(world.expedition.nextChapter)
      : null;
    objectiveText = `SECTOR ${world.expedition.sectorCode} CLEARED · NORTH AIRLOCK UNLOCKED`;
    objectiveSubtext = nextSpec
      ? `Follow the emerald floor guide north into the Transit Hub before Sector ${nextSpec.code}: ${nextSpec.title}`
      : 'Walk through the North Airlock to advance';
  } else if (world.run.chapter === 'chapter_5_loom') {
    objectiveText = 'CHAPTER V · THE LAST LOOP — CHRONICLE LOOM';
    objectiveSubtext = world.loom.selectedEnding
      ? `DIRECTIVE EXECUTED: ${world.loom.selectedEnding.toUpperCase()}`
      : 'Select Nadir-9’s final protocol: SILENCE, WITNESS, or CONTINUITY';
  } else if (activeMark) {
    objectiveText = `RESONANCE PRIMED · ${activeMark.enemyName.toUpperCase()} (${activeMark.remainingTime.toFixed(1)}s)`;
    objectiveSubtext = `Follow up with Live Heavy [E] or 3rd Light Finisher (${world.resonance.fluxCost} Flux) for Convergence`;
  } else if (bossSnapshot && bossSnapshot.hp > 0) {
    if (world.boss?.id === 'the-choir') {
      objectiveText = 'CHAPTER II · NEUTRALIZE THE CHOIR';
      objectiveSubtext = world.choir.statusMessage;
    } else if (world.boss?.id === 'the-curator') {
      objectiveText = 'CHAPTER III · NEUTRALIZE THE CURATOR';
      objectiveSubtext = world.curator.statusMessage;
    } else if (world.boss?.id === 'matron-v') {
      objectiveText = 'CHAPTER IV · NEUTRALIZE MATRON-V, THE SURGEON';
      objectiveSubtext = world.matron.statusMessage;
    } else if (world.boss?.id === 'warden-prime') {
      objectiveText = 'CHAPTER V · NEUTRALIZE WARDEN PRIME, SOVEREIGN ARCHITECT';
      if (bossSnapshot.aiState === 'phase_transition') {
        objectiveSubtext = 'WARNING · SOVEREIGN CHRONICLE OVERDRIVE INITIATED';
      } else if (bossSnapshot.aiState === 'telegraph') {
        if (bossSnapshot.activeAttack === 'directive_lance') {
          objectiveSubtext = 'DIRECTIVE ZERO LANCE · Sidestep or Dodge [Space] out of the charge lane';
        } else if (bossSnapshot.activeAttack === 'temporal_convergence_grid') {
          objectiveSubtext = 'TEMPORAL CONVERGENCE CLEAVE · Evade outside frontal arc or timed Parry [Q]';
        } else {
          objectiveSubtext = 'SOVEREIGN PURGE NOVA · Clear radial impact zone & expanding shockwave';
        }
      } else if (bossSnapshot.coreExposed) {
        objectiveSubtext = 'SOVEREIGN CORE EXPOSED · Strike with Null-Point Rail Lance [3] or Echo Convergence';
      } else {
        objectiveSubtext =
          bossSnapshot.phase === 2
            ? 'PHASE II OVERDRIVE · Evade reconstructed traces and use Grav-Breaker [4] or Resonance'
            : 'PHASE I DIRECTIVE · Frontal Aegis active — use Grav-Breaker [4], Parry [Q], or Flank';
      }
    } else if (bossSnapshot.aiState === 'phase_transition') {
      objectiveText = `WARNING · ${bossSnapshot.name} PHASE II OVERLOAD`;
      objectiveSubtext = 'Containment cage accelerating — prepare for escalated attack cadence';
    } else if (bossSnapshot.aiState === 'telegraph') {
      if (bossSnapshot.activeAttack === 'vector_ram') {
        objectiveSubtext = 'VECTOR RAM · Sidestep or Dodge [Space] out of the red charge lane';
      } else if (bossSnapshot.activeAttack === 'helical_sweep') {
        objectiveSubtext = 'HELICAL SWEEP · Evade outside frontal arc or timed Parry [Q]';
      } else {
        objectiveSubtext = 'ANCHOR SLAM · Clear radial impact zone & expanding temporal shockwave';
      }
    } else if (bossSnapshot.coreExposed) {
      objectiveSubtext = 'CHRONO CORE EXPOSED · Strike now for 1.5x damage or Echo Convergence';
    } else {
      objectiveSubtext =
        bossSnapshot.phase === 2
          ? 'PHASE II OVERLOAD · Bait attacks or use Echo Resonance to break frontal armor'
          : 'PHASE I PROTOCOL · Frontal armor active — bait attacks or flank to expose core';
    }
  } else if (finalBarrier.open) {
    objectiveSubtext =
      'DUAL RESONANCE ACTIVE · Archive Calibration Barrier Open — Cross West Now';
  } else if (receiver.charged && !combinePlate.active && !plate.active) {
    objectiveSubtext = `RECEIVER CHARGED (${receiver.chargeTimer.toFixed(1)}s) · Hold Anchor Pad with Echo to Open Final Barrier`;
  } else if (plate.active) {
    objectiveSubtext = 'CHRONO ANCHOR ACTIVE · Containment Barrier Open via Echo Sync';
  } else if (playerDistToReceiver <= receiver.radius + 0.6 && !receiver.charged) {
    objectiveSubtext =
      'KINETIC RECEIVER (ECHO ONLY) · Face North & Record [T] Heavy [E], Then Replay [Y]';
  } else if (
    (playerDistToPlate <= plate.radius + 0.5 ||
      playerDistToCombinePlate <= combinePlate.radius + 0.5) &&
    world.echo.state !== 'playback'
  ) {
    objectiveSubtext = 'CHRONO ANCHOR PAD · Requires Active Chrono Echo — Record [T] & Replay [Y]';
  } else if (focusedEnemy) {
    if (focusedEnemy.aiState === 'telegraph') {
      objectiveSubtext = 'WARNING · Incoming Strike — Dodge [Space] or Parry [Q]';
    } else if (focusedEnemy.aiState === 'recovery' || focusedEnemy.aiState === 'staggered') {
      objectiveSubtext = 'OPPORTUNITY · Target Core Exposed — Strike Now (1.5x)';
    } else if (focusedEnemy.archetype === 'bastion') {
      objectiveSubtext = 'AEGIS GUARD · Break Armor with Heavy [E], Parry [Q], or Echo Resonance Sync';
    }
  }

  if (
    enemiesAlive === 0 &&
    world.run.chapter !== 'chapter_5_loom' &&
    world.expedition?.phase !== 'safe_room' &&
    world.expedition?.phase !== 'airlock_open'
  ) {
    if (world.encounterMode === 'boss') {
      objectiveText = `${world.boss?.name ?? 'HELIX-04'} DEFEATED`;
      objectiveSubtext =
        world.run.pendingNextChapter
          ? 'Sector unlocked — ready to advance to next campaign chapter'
          : 'Containment Sector 04 unlocked — Chronicle Loom pathway clear';
    } else if (world.run.mode === 'campaign' && !world.puzzle.completed) {
      objectiveText = 'BAY 04 PROXIES NEUTRALIZED · COMPLETE CALIBRATION SEQUENCE';
      objectiveSubtext =
        'Cross the NW Archive Calibration Barrier (Steps 1–3) to breach HELIX-04 Containment';
    } else {
      objectiveText = 'TEST BAY 04 SECURED · CHRONICLE LOOM ACCESSIBLE';
      objectiveSubtext = 'All security proxies neutralized';
    }
  }

  if (world.run.stage === 'transition_to_boss') {
    const destChapterId = world.run.pendingNextChapter ?? 'chapter_1_helix';
    const destChapterCfg =
      GAME_CONFIG.campaignChapters[destChapterId] ??
      GAME_CONFIG.campaignChapters.chapter_1_helix;
    objectiveText = `${destChapterCfg.numberLabel} · BREACHING ${destChapterCfg.sectorName.toUpperCase()}`;
    objectiveSubtext = world.run.checkpointNotice ?? destChapterCfg.arrivalBriefing;
  }

  const echo = world.echo;
  const explorationSnapshot = cloneWorldExplorationState(world.exploration, world.run.chapter, {
    completedChapters: world.run.completedChapters,
    recoveredLogs: world.run.recoveredLogs,
    prologueBarrierOpen: Boolean(
      world.puzzle?.finalBarrier?.open || world.puzzle?.completed
    ),
  });

  // Evaluate nearest Fragment Cache or Sector Tactical Beacon for live [I] HUD prompt
  let nearbyExpansionPrompt: NearbyExpansionPrompt | null = null;
  if (p.actionState !== 'dead') {
    let bestDist = Infinity;
    const caches = world.fragmentCaches ?? [];
    for (let i = 0; i < caches.length; i++) {
      const cache = caches[i];
      if (cache.claimed) continue;
      const dist = Math.hypot(p.x - cache.x, p.z - cache.z);
      if (dist <= cache.radius + 1.25 && dist < bestDist) {
        bestDist = dist;
        nearbyExpansionPrompt = {
          kind: 'fragment_cache',
          id: cache.id,
          label: cache.label,
          promptText: `[I] RECOVER ${cache.label} (+1 FRAG)`,
          detailText: `${cache.crewAuthor} — “${cache.memoryExcerpt}”`,
          ready: true,
          cooldown: 0,
        };
      }
    }
    if (!nearbyExpansionPrompt && world.temporalRift) {
      const rift = world.temporalRift;
      const dist = Math.hypot(p.x - rift.x, p.z - rift.z);
      if (dist <= rift.radius + 1.25 && dist < bestDist) {
        bestDist = dist;
        nearbyExpansionPrompt = {
          kind: 'temporal_rift',
          id: rift.id,
          label: rift.label,
          promptText: '[I] SEAL TEMPORAL RIFT (+28 FLUX)',
          detailText: 'SEAL RIFT EARLY FOR FLUX, INTEGRITY & STAGGER SHOCKWAVE',
          ready: true,
          cooldown: 0,
        };
      }
    }
    if (!nearbyExpansionPrompt) {
      const beacons = world.sectorBeacons ?? [];
      for (let i = 0; i < beacons.length; i++) {
        const beacon = beacons[i];
        const dist = Math.hypot(p.x - beacon.x, p.z - beacon.z);
        if (dist <= beacon.radius + 1.25 && dist < bestDist) {
          bestDist = dist;
          const ready = beacon.cooldown <= 0;
          nearbyExpansionPrompt = {
            kind: 'sector_beacon',
            id: beacon.id,
            label: beacon.label,
            promptText: ready
              ? `[I] ACTIVATE ${beacon.label}`
              : `${beacon.label} RECHARGING (${beacon.cooldown.toFixed(1)}s)`,
            detailText: beacon.effectLabel,
            ready,
            cooldown: Number(beacon.cooldown.toFixed(1)),
          };
        }
      }
    }
    if (!nearbyExpansionPrompt && world.run.mode !== 'boss_gauntlet') {
      const holoDef = getHoloMemoryForChapter(world.run.chapter);
      const dist = Math.hypot(p.x - holoDef.x, p.z - holoDef.z);
      if (dist <= holoDef.interactRadius && dist < bestDist) {
        bestDist = dist;
        const alreadySynced = Boolean(
          explorationSnapshot.discoveredHoloMemoryIds?.includes(holoDef.id)
        );
        nearbyExpansionPrompt = {
          kind: 'holo_memory',
          id: holoDef.id,
          label: holoDef.titleEn,
          promptText: alreadySynced
            ? `[I] REPLAY ${holoDef.titleEn}`
            : `[I] PROJECT ${holoDef.titleEn} (+22 FLUX)`,
          detailText: `${holoDef.loopCode} · ${holoDef.summaryEn}`,
          ready: true,
          cooldown: 0,
        };
      }
    }
  }
  explorationSnapshot.nearbyExpansionPrompt = nearbyExpansionPrompt;

  return {
    appState: world.appState,
    encounterMode: world.encounterMode,
    run: {
      mode: world.run.mode,
      chapter: world.run.chapter,
      stage: world.run.stage,
      unlockedChapters: [...world.run.unlockedChapters],
      completedChapters: [...world.run.completedChapters],
      recoveredLogs: [...(world.run.recoveredLogs ?? [])],
      completedEndings: [...(world.run.completedEndings ?? [])],
      pendingNextChapter: world.run.pendingNextChapter,
      selectedEnding: world.run.selectedEnding,
      isChapterReplay: world.run.isChapterReplay,
      savedCampaignSnapshot: world.run.savedCampaignSnapshot
        ? {
            ...world.run.savedCampaignSnapshot,
            unlockedChapters: [...world.run.savedCampaignSnapshot.unlockedChapters],
            completedChapters: [...world.run.savedCampaignSnapshot.completedChapters],
            recoveredLogs: [...(world.run.savedCampaignSnapshot.recoveredLogs ?? [])],
            completedEndings: [...(world.run.savedCampaignSnapshot.completedEndings ?? [])],
            bossCheckpoint: world.run.savedCampaignSnapshot.bossCheckpoint
              ? {
                  ...world.run.savedCampaignSnapshot.bossCheckpoint,
                  statsAtCheckpoint: {
                    ...world.run.savedCampaignSnapshot.bossCheckpoint.statsAtCheckpoint,
                  },
                }
              : null,
          }
        : null,
      introTimer: Number(world.run.introTimer.toFixed(2)),
      introDuration: world.run.introDuration,
      transitionTimer: Number(world.run.transitionTimer.toFixed(2)),
      transitionDuration: world.run.transitionDuration,
      bossCheckpoint: world.run.bossCheckpoint
        ? {
            ...world.run.bossCheckpoint,
            statsAtCheckpoint: { ...world.run.bossCheckpoint.statsAtCheckpoint },
          }
        : null,
      checkpointNotice: world.run.checkpointNotice,
      checkpointNoticeTimer: Number(world.run.checkpointNoticeTimer.toFixed(2)),
    },
    tutorial: {
      ...world.tutorial,
      stepDwellTimer: Number(world.tutorial.stepDwellTimer.toFixed(2)),
    },
    outcome: world.outcome,
    integrity: Math.ceil(p.integrity),
    maxIntegrity: p.maxIntegrity,
    ghostIntegrity: Math.ceil(p.ghostIntegrity),
    flux: Math.floor(p.flux),
    maxFlux: p.maxFlux,
    fluxDampenedTimer: Number((p.fluxDampenedTimer ?? 0).toFixed(2)),
    playerActionState: p.actionState,
    chargeRatio: Math.min(
      1,
      p.chargeTime / getEffectivePlayerHeavyChargeThreshold(world, p)
    ),
    comboStep:
      (p.equippedWeaponId === 'chrono_edge' ||
        p.equippedWeaponId === 'grav_breaker' ||
        p.equippedWeaponId === 'chrono_scythe') &&
      (p.actionState.startsWith('light_') || p.comboWindowTimer > 0)
        ? p.comboIndex + 1
        : 0,
    combatFlow: {
      ...getCombatFlowHudSummary(p),
      temporalSlipRemaining: Number((p.temporalSlipTimer ?? 0).toFixed(2)),
      temporalSlipMax: Number((p.temporalSlipMaxDuration ?? 0).toFixed(2)),
    },
    weapon: {
      equippedId: p.equippedWeaponId,
      equippedWeaponId: p.equippedWeaponId,
      equippedUpgradeId: getEquippedWeaponUpgrade(world, p.equippedWeaponId),
      equippedUpgradeLabel: (() => {
        const upgId = getEquippedWeaponUpgrade(world, p.equippedWeaponId);
        return upgId ? getWeaponUpgradeDefinition(upgId).shortLabel : null;
      })(),
      name: getWeaponDefinition(p.equippedWeaponId).name,
      label: getWeaponDefinition(p.equippedWeaponId).label,
      shortLabel: getWeaponDefinition(p.equippedWeaponId).shortLabel,
      roleLabel: getWeaponDefinition(p.equippedWeaponId).roleLabel,
      attackMode: getWeaponDefinition(p.equippedWeaponId).attackMode,
      primaryLabel: getWeaponDefinition(p.equippedWeaponId).primaryLabel,
      secondaryLabel: getWeaponDefinition(p.equippedWeaponId).secondaryLabel,
      effectiveRange: getWeaponDefinition(p.equippedWeaponId).effectiveRange,
      heat: Math.round(p.weaponHeat),
      maxHeat: p.maxWeaponHeat,
      heatRatio: Math.max(0, Math.min(1, p.weaponHeat / Math.max(1, p.maxWeaponHeat))),
      overheated: p.weaponOverheated,
      overheatTimer: Number(p.weaponOverheatTimer.toFixed(2)),
      shotCooldownTimer: Number(p.weaponShotCooldownTimer.toFixed(2)),
      switchCooldownTimer: Number(p.weaponSwitchCooldownTimer.toFixed(2)),
      canFire:
        p.equippedWeaponId === 'chrono_edge' ||
        p.equippedWeaponId === 'grav_breaker' ||
        p.equippedWeaponId === 'chrono_scythe'
          ? p.comboCooldownTimer <= 0
          : !p.weaponOverheated && p.weaponShotCooldownTimer <= 0,
      canSwitch:
        p.weaponSwitchCooldownTimer <= 0 &&
        p.actionState !== 'light_windup' &&
        p.actionState !== 'light_active' &&
        p.actionState !== 'heavy_windup' &&
        p.actionState !== 'heavy_active' &&
        p.actionState !== 'dodging' &&
        p.actionState !== 'parry_active',
      activeProjectiles: world.projectiles.length,
      lastShotOutcome: p.lastWeaponShotOutcome,
      statusLabel: p.weaponOverheated
        ? `OVERHEAT ${p.weaponOverheatTimer.toFixed(1)}s`
        : p.equippedWeaponId === 'pulsecaster' || p.equippedWeaponId === 'phase_rail'
          ? `HEAT ${Math.round(p.weaponHeat)}%`
          : p.equippedWeaponId === 'grav_breaker'
            ? `SLAM ${
                p.actionState.startsWith('light_') || p.comboWindowTimer > 0
                  ? p.comboIndex + 1
                  : 0
              }/3`
            : p.equippedWeaponId === 'chrono_scythe'
              ? `REAP ${
                  p.actionState.startsWith('light_') || p.comboWindowTimer > 0
                    ? p.comboIndex + 1
                    : 0
                }/3`
              : `COMBO ${
                  p.actionState.startsWith('light_') || p.comboWindowTimer > 0
                    ? p.comboIndex + 1
                    : 0
                }/3`,
      activeVent: {
        progress: (() => {
          const lockDur = Math.max(
            0.1,
            p.equippedWeaponId === 'phase_rail'
              ? GAME_CONFIG.weapons.phase_rail.overheatLockoutDuration
              : GAME_CONFIG.weapons.pulsecaster.overheatLockoutDuration
          );
          return p.weaponOverheated
            ? Number(Math.max(0, Math.min(1, 1 - p.weaponOverheatTimer / lockDur)).toFixed(3))
            : 0;
        })(),
        windowStart: ACTIVE_VENT_CONFIG.windowStart,
        windowEnd: ACTIVE_VENT_CONFIG.windowEnd,
        attempted: Boolean(p.activeVentAttempted),
        empoweredShots: p.activeVentEmpoweredShots ?? 0,
      },
    },
    adrenaline: (() => {
      const score = p.adrenalineScore ?? 0;
      const mods = getAdrenalineModifiers(score);
      const progressToNext = mods.tier >= 5 ? 1 : Math.max(0, Math.min(1, score - mods.tier));
      return {
        tier: mods.tier,
        score: Number(score.toFixed(2)),
        progressToNext: Number(progressToNext.toFixed(3)),
        label: mods.label,
        perkLabel: mods.perkLabel,
        decayGraceTimer: Number((p.adrenalineDecayGraceTimer ?? 0).toFixed(2)),
      };
    })(),
    progression: {
      memoryFragments: world.progression?.memoryFragments ?? 0,
      unlockedWeaponIds: getUnlockedWeaponIds(world),
      claimedRewardIds: [...(world.progression?.claimedRewardIds ?? [])],
      purchasedUpgrades: [...(world.progression?.purchasedUpgrades ?? [])],
      equippedUpgrades: {
        chrono_edge: getEquippedWeaponUpgrade(world, 'chrono_edge'),
        pulsecaster: getEquippedWeaponUpgrade(world, 'pulsecaster'),
        phase_rail: getEquippedWeaponUpgrade(world, 'phase_rail'),
        grav_breaker: getEquippedWeaponUpgrade(world, 'grav_breaker'),
        chrono_scythe: getEquippedWeaponUpgrade(world, 'chrono_scythe'),
      },
      overclockedUpgrades: [...(world.progression?.overclockedUpgrades ?? [])],
      awakenedUpgrades: [...(world.progression?.awakenedUpgrades ?? [])],
      purchasedRigModules: [...(world.progression?.purchasedRigModules ?? [])],
      equippedRigModules: {
        temporal_core: world.progression?.equippedRigModules?.temporal_core ?? null,
        defensive_chassis:
          world.progression?.equippedRigModules?.defensive_chassis ?? null,
        tactical_harness:
          world.progression?.equippedRigModules?.tactical_harness ?? null,
      },
      overclockedRigModules: [...(world.progression?.overclockedRigModules ?? [])],
      sentinelMode: normalizeSentinelMode(world.progression?.sentinelMode),
      echoDoctrine: normalizeEchoDoctrineId(world.progression?.echoDoctrine),
      ...normalizeBossCoreProgression(
        world.progression?.unlockedBossCores,
        world.progression?.equippedBossCore,
        world.run?.completedChapters,
        world.run?.completedEndings,
        world.progression?.transcendedBossCores
      ),
      purchasedNeuralProtocols: [
        ...(world.progression?.purchasedNeuralProtocols ?? []),
      ],
      weaponMasteryXp: normalizeWeaponMasteryXpMap(world.progression?.weaponMasteryXp),
      bestRecursionLoop: world.progression?.bestRecursionLoop ?? 0,
      totalRecursionClears: world.progression?.totalRecursionClears ?? 0,
      bestGauntletTimeSec: world.progression?.bestGauntletTimeSec ?? null,
      totalGauntletClears: world.progression?.totalGauntletClears ?? 0,
      overdriveDifficulty: Boolean(world.progression?.overdriveDifficulty),
      difficultyTier: world.progression?.difficultyTier ?? (world.progression?.overdriveDifficulty ? 'singularity' : 'standard'),
      ngPlusCycle: world.progression?.ngPlusCycle ?? 0,
      unlockedVaultChapters: [...(world.progression?.unlockedVaultChapters ?? [])],
      equippedSkinId: world.progression?.equippedSkinId ?? 'nadir_standard',
      unlockedAchievementIds: [...(world.progression?.unlockedAchievementIds ?? [])],
      paradoxEndingUnlocked: Boolean(world.progression?.paradoxEndingUnlocked),
      echoZeroDefeatedCount: world.progression?.echoZeroDefeatedCount ?? 0,
      lifetimeParries: world.progression?.lifetimeParries ?? 0,
      lifetimeConvergences: world.progression?.lifetimeConvergences ?? 0,
      mutators: { ...(world.progression?.mutators ?? createDefaultMutators()) },
      bestSpeedrunSplits: { ...(world.progression?.bestSpeedrunSplits ?? {}) },
      bestSpeedrunFullSec: world.progression?.bestSpeedrunFullSec ?? null,
      speedrunHudEnabled: Boolean(world.progression?.speedrunHudEnabled),
      equippedModChipId: world.progression?.equippedModChipId ?? null,
      unlockedModChipIds: [...(world.progression?.unlockedModChipIds ?? ['mod_volt_arc'])],
      loadoutPresets: cloneLoadoutPresets(world.progression?.loadoutPresets),
      combatMastery: cloneCombatMasteryLedger(world.progression?.combatMastery),
      canModifyLoadout: canModifyWeaponUpgrades(world),
      lastActionMessage:
        world.progression?.lastActionMessage ??
        'UPGRADE BENCH READY · EARN MEMORY FRAGMENTS IN CAMPAIGN MILESTONES',
    },
    encounter: cloneEncounterRuntimeState(world.encounter),
    exploration: explorationSnapshot,
    temporalRift: world.temporalRift
      ? {
          ...world.temporalRift,
          remainingTimer: Number(world.temporalRift.remainingTimer.toFixed(2)),
        }
      : null,
    recursion: world.recursion
      ? {
          ...world.recursion,
          draftOptions: world.recursion.draftOptions.map((d) => ({ ...d })),
          relicStacks: { ...world.recursion.relicStacks },
        }
      : undefined,
    overdrive: world.overdrive
      ? {
          ...world.overdrive,
          charge: Number(world.overdrive.charge.toFixed(1)),
          remainingTimer: Number(world.overdrive.remainingTimer.toFixed(2)),
        }
      : createInitialChronoOverdriveState(25),
    gauntlet: world.gauntlet
      ? {
          ...world.gauntlet,
          defeatedBossIds: [...world.gauntlet.defeatedBossIds],
          stageElapsedTimes: [...world.gauntlet.stageElapsedTimes],
          totalElapsedTime: Number(world.gauntlet.totalElapsedTime.toFixed(2)),
          refitBannerTimer: Number(world.gauntlet.refitBannerTimer.toFixed(2)),
        }
      : null,
    expedition: world.expedition
      ? {
          ...world.expedition,
          breachSealPos: { ...world.expedition.breachSealPos },
          transitGatePos: { ...world.expedition.transitGatePos },
          guideTarget: world.expedition.guideTarget
            ? { ...world.expedition.guideTarget }
            : null,
          safeRoom: world.expedition.safeRoom
            ? {
                ...world.expedition.safeRoom,
                medBayPos: { ...world.expedition.safeRoom.medBayPos },
                lysaPos: { ...world.expedition.safeRoom.lysaPos },
                workbenchPos: { ...world.expedition.safeRoom.workbenchPos },
              }
            : null,
          secretVault: world.expedition.secretVault
            ? {
                ...world.expedition.secretVault,
                switchPos: { ...world.expedition.secretVault.switchPos },
                vaultPos: { ...world.expedition.secretVault.vaultPos },
                overrideTimer: Number(world.expedition.secretVault.overrideTimer.toFixed(2)),
              }
            : null,
          transitBannerTimer: Number(world.expedition.transitBannerTimer.toFixed(2)),
        }
      : null,
    ascension: world.ascension
      ? {
          ...world.ascension,
          style: {
            ...world.ascension.style,
            points: Math.round(world.ascension.style.points),
            peakPoints: Math.round(world.ascension.style.peakPoints),
            finisherCooldown: Number(world.ascension.style.finisherCooldown.toFixed(2)),
            finisherActiveTimer: Number(world.ascension.style.finisherActiveTimer.toFixed(2)),
            recentActions: [...world.ascension.style.recentActions],
          },
          dailyTrialElapsedSec: Number(world.ascension.dailyTrialElapsedSec.toFixed(2)),
          finisherRiftTimer: Number(world.ascension.finisherRiftTimer.toFixed(2)),
        }
      : createInitialAscensionState(),
    singularity: world.singularity
      ? {
          ...world.singularity,
          hitComboTimer: Number(world.singularity.hitComboTimer.toFixed(2)),
          flashSwapWindowTimer: Number(world.singularity.flashSwapWindowTimer.toFixed(2)),
          flashSwapCooldown: Number(world.singularity.flashSwapCooldown.toFixed(2)),
          flashSwapAmpTimer: Number(world.singularity.flashSwapAmpTimer.toFixed(2)),
          phantomRiposteTimer: Number(world.singularity.phantomRiposteTimer.toFixed(2)),
          bannerTimer: Number(world.singularity.bannerTimer.toFixed(2)),
        }
      : createInitialSingularityCombatState(),
    kineticOvercharge: world.kineticOvercharge
      ? {
          charges: {
            chrono_edge: Math.round(world.kineticOvercharge.charges.chrono_edge),
            pulsecaster: Math.round(world.kineticOvercharge.charges.pulsecaster),
            phase_rail: Math.round(world.kineticOvercharge.charges.phase_rail),
            grav_breaker: Math.round(world.kineticOvercharge.charges.grav_breaker),
            chrono_scythe: Math.round(world.kineticOvercharge.charges.chrono_scythe),
          },
          activeWeaponId: world.kineticOvercharge.activeWeaponId,
          activeTimer: Number(world.kineticOvercharge.activeTimer.toFixed(2)),
          maxDuration: world.kineticOvercharge.maxDuration,
          totalOvercharges: world.kineticOvercharge.totalOvercharges,
        }
      : createInitialKineticOverchargeState(),
    twinSync: world.twinSync
      ? {
          ...world.twinSync,
          charge: Math.round(world.twinSync.charge),
        }
      : createInitialTwinSyncState(),
    momentum: world.momentum
      ? {
          ...world.momentum,
          streakTimer: Number(world.momentum.streakTimer.toFixed(2)),
          weakpointTimer: Number(world.momentum.weakpointTimer.toFixed(2)),
        }
      : createInitialChronoMomentumState(),
    nexus: world.nexus
      ? {
          ...world.nexus,
          activeLinks: [...world.nexus.activeLinks],
          pulseCooldown: Number(world.nexus.pulseCooldown.toFixed(2)),
        }
      : createInitialChronoNexusState(),
    weaponResonance: world.weaponResonance
      ? {
          ...world.weaponResonance,
          timer: Number(world.weaponResonance.timer.toFixed(2)),
          cooldown: Number(world.weaponResonance.cooldown.toFixed(2)),
        }
      : createInitialWeaponResonanceState(),
    chronoAegis: world.chronoAegis
      ? {
          ...world.chronoAegis,
          ward: Number(world.chronoAegis.ward.toFixed(1)),
          rechargeDelayTimer: Number(world.chronoAegis.rechargeDelayTimer.toFixed(2)),
          fireCooldown: Number(world.chronoAegis.fireCooldown.toFixed(2)),
          harmonicFluxTimer: Number(world.chronoAegis.harmonicFluxTimer.toFixed(2)),
        }
      : createInitialChronoAegisState('off'),
    chronoConfluence: (() => {
      const conf = ensureChronoConfluenceState(world);
      return {
        ...conf,
        charge: Math.round(conf.charge),
        cooldownTimer: Number(conf.cooldownTimer.toFixed(2)),
      };
    })(),
    enemiesAlive,
    totalEnemies,
    objectiveText,
    objectiveSubtext,
    focusedEnemy,
    boss: bossSnapshot,
    echo: {
      state: echo.state,
      hasClip: echo.clip !== null,
      recordingTime: Number(echo.recordingTime.toFixed(2)),
      maxDuration: echo.maxDuration,
      playbackTime: Number(echo.playbackTime.toFixed(2)),
      clipDuration: Number((echo.clip?.duration ?? 0).toFixed(2)),
      statusMessage: echo.statusMessage,
    },
    relay: {
      canRelay: world.relay.preview.canRelay,
      status: world.relay.preview.status,
      lastOutcome: world.relay.lastOutcome,
      cooldownTimer: Number(world.relay.cooldownTimer.toFixed(2)),
      maxCooldown: world.relay.maxCooldown,
      fluxCost: world.relay.fluxCost,
      distance: Number(world.relay.preview.distance.toFixed(2)),
      maxRange: world.relay.maxRange,
      landingX: Number(world.relay.preview.landingX.toFixed(2)),
      landingZ: Number(world.relay.preview.landingZ.toFixed(2)),
      successFlashActive: world.relay.successFlashTimer > 0,
      statusMessage: world.relay.statusMessage,
      activationCount: world.relay.activationCount,
    },
    resonance: {
      status: world.resonance.status,
      primed: activeMark !== null,
      targetEnemyId: activeMark?.enemyId ?? null,
      targetEnemyName: activeMark?.enemyName ?? null,
      remainingWindow: Number((activeMark?.remainingTime ?? 0).toFixed(2)),
      maxWindow: world.resonance.syncWindow,
      cooldownTimer: Number(world.resonance.cooldownTimer.toFixed(2)),
      maxCooldown: world.resonance.maxCooldown,
      fluxCost: world.resonance.fluxCost,
      canConverge:
        activeMark !== null &&
        world.resonance.cooldownTimer <= 0 &&
        p.flux >= world.resonance.fluxCost,
      primedCount: world.resonance.primedCount,
      convergenceCount: world.resonance.convergenceCount,
      lastOutcome: world.resonance.lastOutcome,
      flashActive: world.resonance.flashTimer > 0,
      statusMessage: world.resonance.statusMessage,
    },
    pressurePlate: {
      label: plate.label,
      active: plate.active,
      barrierOpen: plate.barrierOpen,
      receiverLabel: plate.receiverLabel,
    },
    puzzle: {
      stage: puzzle.stage,
      teachCompleted: puzzle.teachCompleted,
      testCompleted: puzzle.testCompleted,
      combineCompleted: puzzle.combineCompleted,
      completed: puzzle.completed,
      teachPlateActive: plate.active,
      teachBarrierOpen: plate.barrierOpen,
      receiverLabel: receiver.label,
      receiverCharged: receiver.charged,
      receiverChargeTimer: Number(receiver.chargeTimer.toFixed(2)),
      receiverChargeDuration: receiver.chargeDuration,
      combinePlateLabel: combinePlate.label,
      combinePlateActive: combinePlate.active,
      finalBarrierLabel: finalBarrier.label,
      finalBarrierOpen: finalBarrier.open,
    },
    choir: {
      active: world.choir.active,
      nodes: world.choir.nodes.map((n) => ({
        ...n,
        primedRemainingTime: Number(n.primedRemainingTime.toFixed(2)),
        failedRemainingTime: Number(n.failedRemainingTime.toFixed(2)),
      })),
      syncWindowSeconds: world.choir.syncWindowSeconds,
      syncTimer: Number(world.choir.syncTimer.toFixed(2)),
      requiredNodeCount: world.choir.requiredNodeCount,
      synchronizedCount: world.choir.synchronizedCount,
      completedCycles: world.choir.completedCycles,
      failureResetTimer: Number(world.choir.failureResetTimer.toFixed(2)),
      lastFailureReason: world.choir.lastFailureReason,
      processedNodeEventIds: [...world.choir.processedNodeEventIds],
      statusMessage: world.choir.statusMessage,
    },
    curator: {
      active: world.curator.active,
      traces: world.curator.traces.map((t) => ({
        ...t,
        timer: Number(t.timer.toFixed(2)),
      })),
      decoyIds: [...world.curator.decoyIds],
      nextTraceSeq: world.curator.nextTraceSeq,
      lastDecoySpawnTime: Number(world.curator.lastDecoySpawnTime.toFixed(2)),
      statusMessage: world.curator.statusMessage,
    },
    matron: {
      active: world.matron.active,
      siphonDrainEventsCount: world.matron.siphonDrainEventsCount,
      totalFluxDrained: Math.round(world.matron.totalFluxDrained),
      eraserDisruptionsCount: world.matron.eraserDisruptionsCount,
      chronoSeverActive: world.matron.chronoSeverActive,
      chronoSeverZoneX: Number(world.matron.chronoSeverZoneX.toFixed(2)),
      chronoSeverZoneZ: Number(world.matron.chronoSeverZoneZ.toFixed(2)),
      chronoSeverRadius: world.matron.chronoSeverRadius,
      chronoSeverWarningTimer: Number(world.matron.chronoSeverWarningTimer.toFixed(2)),
      echoSuppressedTimer: Number(world.matron.echoSuppressedTimer.toFixed(2)),
      processedStrikeEventIds: [...world.matron.processedStrikeEventIds],
      statusMessage: world.matron.statusMessage,
    },
    gravityPin: {
      unlocked: world.gravityPin.unlocked,
      status: world.gravityPin.status,
      fluxCost: world.gravityPin.fluxCost,
      cooldownTimer: Number(world.gravityPin.cooldownTimer.toFixed(2)),
      maxCooldown: world.gravityPin.maxCooldown,
      activeDurationTimer: Number(world.gravityPin.activeDurationTimer.toFixed(2)),
      maxDuration: world.gravityPin.maxDuration,
      maxRange: world.gravityPin.maxRange,
      radius: world.gravityPin.radius,
      centerX: Number(world.gravityPin.centerX.toFixed(2)),
      centerZ: Number(world.gravityPin.centerZ.toFixed(2)),
      pinnedTargetIds: [...world.gravityPin.pinnedTargetIds],
      activationCount: world.gravityPin.activationCount,
      statusMessage: world.gravityPin.statusMessage,
    },
    echoCollapse: {
      unlocked: world.echoCollapse.unlocked,
      status: world.echoCollapse.status,
      fluxCost: world.echoCollapse.fluxCost,
      cooldownTimer: Number(world.echoCollapse.cooldownTimer.toFixed(2)),
      maxCooldown: world.echoCollapse.maxCooldown,
      blastTimer: Number(world.echoCollapse.blastTimer.toFixed(2)),
      blastX: Number(world.echoCollapse.blastX.toFixed(2)),
      blastZ: Number(world.echoCollapse.blastZ.toFixed(2)),
      blastRadius: world.echoCollapse.blastRadius,
      damage: world.echoCollapse.damage,
      postureDamage: world.echoCollapse.postureDamage,
      activationCount: world.echoCollapse.activationCount,
      lastTargetsHit: world.echoCollapse.lastTargetsHit,
      statusMessage: world.echoCollapse.statusMessage,
    },
    loom: {
      active: world.loom.active,
      endingChoiceAvailable: world.loom.endingChoiceAvailable,
      selectedEnding: world.loom.selectedEnding,
      selectionCount: world.loom.selectionCount,
      completedAtTime: world.loom.completedAtTime,
    },
    comms: {
      active: world.comms?.active
        ? {
            ...world.comms.active,
            remainingTime: Number(world.comms.active.remainingTime.toFixed(2)),
          }
        : null,
      queue: (world.comms?.queue ?? []).map((q) => ({
        ...q,
        remainingTime: Number(q.remainingTime.toFixed(2)),
      })),
      triggeredIds: [...(world.comms?.triggeredIds ?? [])],
      history: (world.comms?.history ?? []).map((h) => ({ ...h })),
    },
    threats:
      world.appState === 'playing'
        ? computePeripheralThreats(
            p,
            world.enemies,
            world.boss,
            world.projectiles,
            aimYaw ?? p.rotationY,
            6
          )
        : [],
    radar: computeTacticalRadarSnapshot(
      p,
      aimYaw ?? p.rotationY,
      explorationSnapshot.localMap?.arenaRadius ?? GAME_CONFIG.arena.radius,
      world.enemies,
      world.boss,
      echo,
      explorationSnapshot.localMap?.objectiveTarget ?? null,
      explorationSnapshot.interactables,
      16,
      world.obstacles,
      world.boostPads ?? [],
      world.fluxPools ?? [],
      explorationSnapshot.tacticalWaypoint ?? null,
      world.fragmentCaches ?? [],
      world.sectorBeacons ?? [],
      world.temporalRift ?? null,
      world.run.mode !== 'boss_gauntlet'
        ? (explorationSnapshot.localMap?.holoProjector ?? null)
        : null
    ),
    lockOn: (() => {
      const activeLockTarget = resolveActiveLockOnTarget(world, p.lockOnTargetId);
      const execCand = findExecutionCandidate(world);
      return {
        active: activeLockTarget !== null,
        targetId: activeLockTarget?.id ?? null,
        targetName: activeLockTarget?.name ?? null,
        isBoss: activeLockTarget?.isBoss ?? false,
        isStaggered: activeLockTarget?.isStaggered ?? false,
        canExecute: execCand !== null,
        executeTargetName: execCand?.name ?? null,
      };
    })(),
    paradox: (() => {
      const px = ensureParadoxState(world);
      return {
        loadout: { ...px.loadout },
        damagePopups: px.damagePopups.map((d) => ({ ...d })),
        nextPopupId: px.nextPopupId,
        killCamTimer: Number(px.killCamTimer.toFixed(2)),
        mutators: { ...px.mutators },
        speedrun: {
          ...px.speedrun,
          currentSplits: { ...px.speedrun.currentSplits },
          bestSplits: { ...px.speedrun.bestSplits },
        },
        activeToast: px.activeToast ? { ...px.activeToast } : null,
        paradoxRiftUnlocked:
          px.paradoxRiftUnlocked ||
          isParadoxRiftEligible(
            world.progression?.unlockedVaultChapters ?? [],
            world.progression?.ngPlusCycle ?? 0,
            world.progression?.echoZeroDefeatedCount ?? 0
          ),
        bossTookDamageThisFight: px.bossTookDamageThisFight,
      };
    })(),
    liveRankForecast: computeLiveTacticalRankForecast({
      elapsedTime: Math.max(
        0,
        world.elapsedTime -
          (world.encounterMode === 'boss'
            ? (world.run.bossCheckpoint?.elapsedTimeAtCheckpoint ?? 0)
            : 0)
      ),
      damageTaken: Math.max(
        0,
        world.stats.damageTaken -
          (world.encounterMode === 'boss'
            ? (world.run.bossCheckpoint?.statsAtCheckpoint.damageTaken ?? 0)
            : 0)
      ),
      parriesLanded: Math.max(
        0,
        world.stats.parriesLanded -
          (world.encounterMode === 'boss'
            ? (world.run.bossCheckpoint?.statsAtCheckpoint.parriesLanded ?? 0)
            : 0)
      ),
      perfectDodges: world.stats.perfectDodges ?? 0,
      vulnerableHits: Math.max(
        0,
        world.stats.vulnerableHits -
          (world.encounterMode === 'boss'
            ? (world.run.bossCheckpoint?.statsAtCheckpoint.vulnerableHits ?? 0)
            : 0)
      ),
      convergencesTriggered: Math.max(
        0,
        world.resonance.convergenceCount -
          (world.encounterMode === 'boss'
            ? (world.run.bossCheckpoint?.statsAtCheckpoint.convergencesTriggered ?? 0)
            : 0)
      ),
      relaysUsed: Math.max(
        0,
        world.relay.activationCount -
          (world.encounterMode === 'boss'
            ? (world.run.bossCheckpoint?.statsAtCheckpoint.relaysUsed ?? 0)
            : 0)
      ),
    }),
    elapsedTime: world.elapsedTime,
    summary: world.frozenSummary,
  };
}


