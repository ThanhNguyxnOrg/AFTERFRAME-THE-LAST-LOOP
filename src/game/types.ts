export type GameAppState = 'title' | 'playing' | 'paused' | 'gameover';

export type GameOutcome = 'none' | 'victory' | 'defeat';

export type WeaponId =
  | 'chrono_edge'
  | 'pulsecaster'
  | 'phase_rail'
  | 'grav_breaker'
  | 'chrono_scythe';

export type WeaponAttackMode =
  | 'melee'
  | 'ranged'
  | 'pulse_light'
  | 'pulse_heavy'
  | 'rail_light'
  | 'rail_heavy'
  | 'breaker_light'
  | 'breaker_heavy'
  | 'scythe_light'
  | 'scythe_heavy';

export type WeaponShotOutcome =
  | 'none'
  | 'fired'
  | 'hit'
  | 'hit_enemy'
  | 'hit_node'
  | 'guarded'
  | 'blocked_obstacle'
  | 'blocked_by_obstacle'
  | 'overheated'
  | 'on_cooldown'
  | 'cooldown'
  | 'expired';

export type WeaponUpgradeId =
  | 'edge_breaker_cleave'
  | 'edge_harmonic_conductor'
  | 'pulse_thermal_sink'
  | 'pulse_overcharge_condenser'
  | 'rail_null_aperture'
  | 'rail_phase_capacitor'
  | 'breaker_seismic_core'
  | 'breaker_singularity_coil'
  | 'scythe_rift_reaper'
  | 'scythe_astral_siphon';

export type RigModuleSlot =
  | 'temporal_core'
  | 'defensive_chassis'
  | 'tactical_harness';

export type RigModuleId =
  | 'rig_chrono_spool'
  | 'rig_resonance_prism'
  | 'rig_echo_synchronizer'
  | 'rig_reactive_plating'
  | 'rig_kinetic_dynamo'
  | 'rig_aegis_bastion_frame'
  | 'rig_flux_salvager'
  | 'rig_adrenaline_overclock'
  | 'rig_executioner_bus';

export type NeuralProtocolId =
  | 'proto_flux_reservoir'
  | 'proto_echo_harmonics'
  | 'proto_vanguard_reflex'
  | 'proto_salvage_telemetry';

export interface NeuralProtocolDefinition {
  id: NeuralProtocolId;
  name: string;
  shortLabel: string;
  roleLabel: string;
  cost: number;
  summary: string;
  benefitText: string;
  tradeoffText: string;
}

export interface RigModuleDefinition {
  id: RigModuleId;
  slot: RigModuleSlot;
  slotLabel: string;
  name: string;
  shortLabel: string;
  roleLabel: string;
  cost: number;
  summary: string;
  benefitText: string;
  tradeoffText: string;
}

export interface RigEffectiveModifiers {
  echoMaxDurationBonus: number;
  relayFluxCostDelta: number;
  relayCooldownDelta: number;
  convergenceBonusDamage: number;
  convergenceFluxCostDelta: number;
  staggerDurationBonus: number;
  echoSyncWindowBonus: number;
  convergenceFluxRefund: number;
  maxIntegrityBonus: number;
  parrySlipBonusFlux: number;
  moveSpeedMultiplier: number;
  passiveFluxRegenMultiplier: number;
  boostPadIntegrityBonus: number;
  fluxPoolIntegrityPerSec: number;
  heatCoolMultiplier: number;
  parryShockwaveStagger: number;
  parryIntegrityHeal: number;
  parryRecoveryDelta: number;
  crateFluxReward: number;
  crateSurgeDuration: number;
  threadIntegrityBonus: number;
  dodgeCooldownDelta: number;
  surgeDamageMultiplier: number;
  surgeCooldownTickMultiplier: number;
  surgeRangedHeatPenalty: number;
  executionDamageMult: number;
  executionIntegrityHeal: number;
  executionFluxRefund: number;
  heavyChargeDelayDelta: number;
}

export type WeaponProgressionRewardId =
  | 'prologue_calibration_teach'
  | 'prologue_calibration_test'
  | 'prologue_calibration_combine'
  | 'prologue_bay_proxies_cleared'
  | 'chapter_1_helix_defeated'
  | 'chapter_2_choir_defeated'
  | 'chapter_3_curator_defeated'
  | 'chapter_4_matron_defeated'
  | 'conduit_ch4_quarantine_override_frag'
  | 'conduit_ch5_temporal_anchor_frag'
  | 'cache_prologue_east'
  | 'cache_ch1_marshal_west'
  | 'cache_ch2_garden_north'
  | 'cache_ch3_vault_east'
  | 'cache_ch3_vault_west'
  | 'cache_ch4_quarantine_north'
  | 'cache_ch5_loom_east'
  | 'cache_ch5_loom_west'
  | 'story_arc_prologue'
  | 'story_arc_ch1'
  | 'story_arc_ch2'
  | 'story_arc_ch3'
  | 'story_arc_ch4'
  | 'story_arc_ch5';

export type UpgradePurchaseOutcome =
  | 'purchased'
  | 'already_owned'
  | 'insufficient_fragments'
  | 'invalid_upgrade'
  | 'action_locked';

export type UpgradeEquipOutcome =
  | 'equipped'
  | 'unequipped'
  | 'not_owned'
  | 'incompatible_weapon'
  | 'invalid_upgrade'
  | 'action_locked';

export interface WeaponUpgradeDefinition {
  id: WeaponUpgradeId;
  weaponId: WeaponId;
  name: string;
  shortLabel: string;
  roleLabel: string;
  cost: number;
  summary: string;
  benefitText: string;
  tradeoffText: string;
}

export interface WeaponProgressionRewardDefinition {
  id: WeaponProgressionRewardId;
  label: string;
  chapter: CampaignChapterId;
  fragments: number;
  description: string;
}

export type ChronoRelicId =
  | 'relic_kinetic_overdrive'
  | 'relic_temporal_siphon'
  | 'relic_echo_amplification'
  | 'relic_aegis_capacitor'
  | 'relic_thermal_purge'
  | 'relic_singularity_coil';

export interface ChronoRelicDefinition {
  id: ChronoRelicId;
  name: string;
  shortLabel: string;
  accent: 'cyan' | 'emerald' | 'purple' | 'amber' | 'rose';
  benefitText: string;
}

export type WeaponMasteryXpMap = Record<WeaponId, number>;

export interface WeaponMasteryRankInfo {
  rank: 1 | 2 | 3 | 4 | 5;
  rankLabel: string;
  xp: number;
  nextRankXp: number | null;
  progressRatio: number;
  damageMultiplier: number;
  staggerMultiplier: number;
  fluxGainMultiplier: number;
  vulnerableBonus: number;
}

export interface ArenaTemporalRift {
  id: string;
  x: number;
  z: number;
  radius: number;
  remainingTimer: number;
  maxDuration: number;
  label: string;
}

export interface RecursionRunState {
  active: boolean;
  loopIndex: number;
  bestLoopReached: number;
  totalClears: number;
  awaitingRelicDraft: boolean;
  draftOptions: ChronoRelicDefinition[];
  relicStacks: Partial<Record<ChronoRelicId, number>>;
  enemiesPerLoopTotal: number;
  isWardenSurge: boolean;
}

export interface ChronoOverdriveState {
  charge: number;
  maxCharge: number;
  active: boolean;
  remainingTimer: number;
  maxDuration: number;
  activationCount: number;
  statusMessage: string;
}

export interface GauntletStageSpec {
  index: number;
  bossId: BossId;
  chapter: CampaignChapterId;
  shortCode: string;
  bossName: string;
  label: string;
  sectorLabel: string;
}

export interface BossGauntletState {
  active: boolean;
  stageIndex: number;
  totalStages: number;
  currentBossId: BossId;
  currentChapter: CampaignChapterId;
  currentStageLabel: string;
  defeatedBossIds: BossId[];
  stageElapsedTimes: number[];
  totalElapsedTime: number;
  stageStartTime: number;
  refitBannerTimer: number;
  refitBannerText: string;
  completed: boolean;
  bestClearTimeSec: number | null;
  totalGauntletClears: number;
}

export type ExpeditionPhase =
  | 'explore'
  | 'combat'
  | 'airlock_open'
  | 'safe_room'
  | 'loom_finale';

export interface ExpeditionSectorSpec {
  index: number;
  chapter: CampaignChapterId;
  code: string;
  shortName: string;
  title: string;
  wardenLabel: string;
  nextChapter: CampaignChapterId | null;
}

export interface ExpeditionGuideTarget {
  x: number;
  z: number;
  label: string;
  kind:
    | 'cache'
    | 'terminal'
    | 'beacon'
    | 'secret_vault'
    | 'breach_seal'
    | 'combat'
    | 'transit_gate'
    | 'safe_room_med'
    | 'safe_room_lysa';
  distance: number;
}

export type SafeRoomStationId = 'none' | 'med_bay' | 'lysa_holo' | 'workbench';

export interface ExpeditionSafeRoomState {
  active: boolean;
  fromChapter: CampaignChapterId;
  nextChapter: CampaignChapterId;
  medBayUsed: boolean;
  lysaBriefingClaimed: boolean;
  lysaIntelHeadline: string;
  lysaIntelDetail: string;
  medBayPos: { x: number; z: number };
  lysaPos: { x: number; z: number };
  workbenchPos: { x: number; z: number };
  nearbyStation: SafeRoomStationId;
}

export interface SecretEchoVaultState {
  id: string;
  chapter: CampaignChapterId;
  label: string;
  switchPos: { x: number; z: number; radius: number };
  vaultPos: { x: number; z: number; radius: number };
  switchPressed: boolean;
  heldByEcho: boolean;
  overrideTimer: number;
  maxOverrideDuration: number;
  gateOpen: boolean;
  looted: boolean;
  rewardFragments: number;
}

export interface StationMapSectorNode {
  index: number;
  chapter: CampaignChapterId;
  code: string;
  shortName: string;
  title: string;
  wardenLabel: string;
  status: 'cleared' | 'active' | 'unlocked' | 'locked';
  discoveryPercent: number;
  vaultLooted: boolean;
  cachesFound: number;
  cachesTotal: number;
  loreFound: number;
  loreTotal: number;
}

export interface ExpeditionState {
  enabled: boolean;
  phase: ExpeditionPhase;
  sectorIndex: number;
  totalSectors: number;
  sectorCode: string;
  sectorTitle: string;
  wardenLabel: string;
  nextChapter: CampaignChapterId | null;
  breachSealPos: { x: number; z: number };
  transitGatePos: { x: number; z: number };
  airlockUnlocked: boolean;
  cachesFound: number;
  cachesTotal: number;
  terminalsScanned: number;
  terminalsTotal: number;
  beaconsActive: number;
  beaconsTotal: number;
  guideTarget: ExpeditionGuideTarget | null;
  playerInsideBreachSeal: boolean;
  playerInsideTransitGate: boolean;
  transitBannerTimer: number;
  transitBannerText: string;
  safeRoom?: ExpeditionSafeRoomState | null;
  secretVault?: SecretEchoVaultState | null;
  ngPlusCycle?: number;
}

export type SeraRigSkinId =
  | 'nadir_standard'
  | 'sovereign_gold'
  | 'warden_crimson'
  | 'phantom_emerald'
  | 'paradox_prism';

export type ChronoAchievementId =
  | 'first_breach'
  | 'vault_raider'
  | 'all_vaults'
  | 'safe_room_engineer'
  | 'convergence_chain'
  | 'parry_specialist'
  | 'untouchable_warden'
  | 'drone_commander'
  | 'gauntlet_champion'
  | 'ng_plus_initiate'
  | 'paradox_breaker'
  | 'mutator_daredevil';

export type FabricatorItemId =
  | 'nanite_pack'
  | 'aegis_shield'
  | 'overclock_core'
  | 'drone_mk1'
  | 'drone_mk2';

export interface ChronoMutatorState {
  glassCannon: boolean;
  zeroEchoCooldown: boolean;
  hyperSpeed: boolean;
  ironmanNoHeal: boolean;
}

export interface TacticalLoadoutState {
  naniteInjectors: number;
  maxNaniteInjectors: number;
  naniteCooldown: number;
  aegisShieldHp: number;
  maxAegisShieldHp: number;
  overclockCoreActive: boolean;
  combatDroneTier: 0 | 1 | 2;
  droneX: number;
  droneZ: number;
  droneAngle: number;
  droneFireCooldown: number;
  droneShieldCooldown: number;
  droneTargetId: string | null;
}

export type DamageNumberKind = 'normal' | 'crit' | 'convergence' | 'parry' | 'drone';

export interface DamagePopupEntry {
  id: number;
  amount: number;
  x: number;
  y: number;
  z: number;
  kind: DamageNumberKind;
  age: number;
  lifetime: number;
}

export interface SpeedrunSplitState {
  enabled: boolean;
  runElapsedSec: number;
  currentSplits: Partial<Record<CampaignChapterId, number>>;
  bestSplits: Partial<Record<CampaignChapterId, number>>;
  bestFullRunSec: number | null;
  lastSplitChapter: CampaignChapterId | null;
  lastDeltaSec: number | null;
}

export interface AchievementToastState {
  id: ChronoAchievementId;
  title: string;
  description: string;
  remaining: number;
}

export interface ParadoxRuntimeState {
  loadout: TacticalLoadoutState;
  damagePopups: DamagePopupEntry[];
  nextPopupId: number;
  killCamTimer: number;
  mutators: ChronoMutatorState;
  speedrun: SpeedrunSplitState;
  activeToast: AchievementToastState | null;
  paradoxRiftUnlocked: boolean;
  bossTookDamageThisFight: boolean;
}

export type AppLocale = 'en' | 'vi';

export type StyleRankTier = 'D' | 'C' | 'B' | 'A' | 'S' | 'SSS';

export type StyleActionKind =
  | 'light_hit'
  | 'heavy_hit'
  | 'parry'
  | 'perfect_dodge'
  | 'echo_deploy'
  | 'convergence'
  | 'scythe_vortex'
  | 'drone_hit'
  | 'flash_swap'
  | 'finisher'
  | 'kill';

export type WeaponModChipId =
  | 'mod_volt_arc'
  | 'mod_siphon_leech'
  | 'mod_chrono_nova';

export type PhotoFilterId =
  | 'standard'
  | 'noir'
  | 'cyber_cyan'
  | 'paradox_violet'
  | 'golden_hour';

export interface WeaponModChipDefinition {
  id: WeaponModChipId;
  name: string;
  nameVi: string;
  shortLabel: string;
  cost: number;
  accentHex: number;
  accentCss: string;
  summaryEn: string;
  summaryVi: string;
}

export interface StyleRankState {
  points: number;
  peakPoints: number;
  tier: StyleRankTier;
  peakTier: StyleRankTier;
  decayGraceTimer: number;
  recentActions: StyleActionKind[];
  hitFreeStreak: number;
  finisherCooldown: number;
  finisherActiveTimer: number;
  finisherReady: boolean;
  lastActionLabel: string;
  totalFinishersUsed: number;
}

export interface DailyTrialConfig {
  dateKey: string;
  seedCode: string;
  titleEn: string;
  titleVi: string;
  chapter: CampaignChapterId;
  bossId: BossId;
  bossLabel: string;
  mutatorKeys: Array<keyof ChronoMutatorState>;
  mutatorLabelsEn: string[];
  mutatorLabelsVi: string[];
  startingRelicId: ChronoRelicId;
  startingRelicLabel: string;
  parTimeSec: number;
  targetScore: number;
}

export interface DailyTrialRecord {
  dateKey: string;
  seedCode: string;
  bestScore: number;
  bestTimeSec: number;
  peakRank: StyleRankTier;
  completedCount: number;
  updatedAtIso: string;
}

export interface AscensionRuntimeState {
  style: StyleRankState;
  dailyTrialActive: boolean;
  dailyTrialConfig: DailyTrialConfig | null;
  dailyTrialElapsedSec: number;
  dailyTrialScore: number;
  dailyTrialCompleted: boolean;
  lastDailyRecord: DailyTrialRecord | null;
  finisherRiftTimer: number;
  finisherRiftX: number;
  finisherRiftZ: number;
}

export interface SingularityCombatState {
  hitComboCount: number;
  bestHitCombo: number;
  hitComboTimer: number;
  flashSwapWindowTimer: number;
  flashSwapCooldown: number;
  flashSwapAmpTimer: number;
  flashSwapCount: number;
  phantomRiposteTimer: number;
  lastMilestoneReached: number;
  bannerLabel: string;
  bannerTimer: number;
}

export interface KineticOverchargeState {
  charges: Record<WeaponId, number>;
  activeWeaponId: WeaponId | null;
  activeTimer: number;
  maxDuration: number;
  totalOvercharges: number;
}

export type TwinSyncTier = 0 | 1 | 2 | 3;

export interface TwinSyncState {
  charge: number;
  tier: TwinSyncTier;
  linkActive: boolean;
  pincerActive: boolean;
  lastPlayerHitTime: number;
  lastEchoHitTime: number;
  totalPincers: number;
  peakTier: TwinSyncTier;
}

export type ChronoMomentumTier = 0 | 1 | 2 | 3;

export interface ChronoMomentumState {
  streak: number;
  tier: ChronoMomentumTier;
  multiplier: number;
  streakTimer: number;
  weakpointTimer: number;
  peakStreak: number;
  totalBreaks: number;
  bonusFragmentsAwarded: number;
}

export type ChronoNexusTier = 0 | 2 | 3 | 4;
export type ChronoNexusLinkTag = 'overcharge' | 'twin_sync' | 'momentum' | 'flash_swap';

export interface ChronoNexusState {
  linkCount: number;
  tier: ChronoNexusTier;
  activeLinks: ChronoNexusLinkTag[];
  pulseCooldown: number;
  peakLinks: number;
  totalApexLinks: number;
}

export type WeaponResonanceId =
  | 'blade_reaper'
  | 'plasma_overload'
  | 'seismic_vortex'
  | 'temporal_flux_shift';

export interface WeaponResonanceState {
  activeId: WeaponResonanceId | null;
  timer: number;
  cooldown: number;
  fromWeaponId: WeaponId | null;
  toWeaponId: WeaponId | null;
  totalTriggers: number;
}

export type SentinelProtocolMode = 'off' | 'aegis' | 'interceptor' | 'harmonic';

export type BossEchoCoreId =
  | 'core_helix_bastion'
  | 'core_choir_chime'
  | 'core_curator_singularity'
  | 'core_matron_siphon'
  | 'core_warden_sovereign';

export interface ChronoAegisRuntimeState {
  mode: SentinelProtocolMode;
  ward: number;
  maxWard: number;
  rechargeDelayTimer: number;
  fireCooldown: number;
  harmonicFluxTimer: number;
  bossCoreSiphonCooldown?: number;
  droneX: number;
  droneZ: number;
  lastTargetId: string | null;
  totalWardAbsorbed: number;
  totalSentinelShots: number;
  totalAfterimages: number;
}

export interface PhotoModeState {
  active: boolean;
  hideUi: boolean;
  yawOffset: number;
  pitchOffset: number;
  distance: number;
  fov: number;
  filter: PhotoFilterId;
  showDrone: boolean;
}

export type EchoDoctrineId = 'standard' | 'vanguard' | 'bastion' | 'nova';

export type RelicConstellationId =
  | 'constellation_chrono_vampirism'
  | 'constellation_paradox_singularity'
  | 'constellation_cryo_fortress';

export type TacticalLoadoutPresetSlot = 0 | 1 | 2;

export interface TacticalLoadoutPreset {
  slotIndex: TacticalLoadoutPresetSlot;
  name: string;
  weaponId: WeaponId;
  equippedUpgrades: Record<WeaponId, WeaponUpgradeId | null>;
  equippedModChipId: WeaponModChipId | null;
  equippedRigModules: Record<RigModuleSlot, RigModuleId | null>;
  sentinelMode: SentinelProtocolMode;
  equippedBossCore: BossEchoCoreId | null;
  echoDoctrine?: EchoDoctrineId;
}

export interface PersistedWeaponProgressionState {
  memoryFragments: number;
  claimedRewardIds: WeaponProgressionRewardId[];
  purchasedUpgrades: WeaponUpgradeId[];
  equippedUpgrades: Record<WeaponId, WeaponUpgradeId | null>;
  overclockedUpgrades?: WeaponUpgradeId[];
  awakenedUpgrades?: WeaponUpgradeId[];
  unlockedWeaponIds?: WeaponId[];
  purchasedRigModules?: RigModuleId[];
  equippedRigModules?: Partial<Record<RigModuleSlot, RigModuleId | null>>;
  overclockedRigModules?: RigModuleId[];
  sentinelMode?: SentinelProtocolMode;
  echoDoctrine?: EchoDoctrineId;
  unlockedBossCores?: BossEchoCoreId[];
  equippedBossCore?: BossEchoCoreId | null;
  transcendedBossCores?: BossEchoCoreId[];
  purchasedNeuralProtocols?: NeuralProtocolId[];
  weaponMasteryXp?: Partial<WeaponMasteryXpMap>;
  bestRecursionLoop?: number;
  totalRecursionClears?: number;
  bestGauntletTimeSec?: number | null;
  totalGauntletClears?: number;
  ngPlusCycle?: number;
  unlockedVaultChapters?: CampaignChapterId[];
  overdriveDifficulty?: boolean;
  equippedSkinId?: SeraRigSkinId;
  unlockedAchievementIds?: ChronoAchievementId[];
  paradoxEndingUnlocked?: boolean;
  echoZeroDefeatedCount?: number;
  lifetimeParries?: number;
  lifetimeConvergences?: number;
  mutators?: ChronoMutatorState;
  bestSpeedrunSplits?: Partial<Record<CampaignChapterId, number>>;
  bestSpeedrunFullSec?: number | null;
  speedrunHudEnabled?: boolean;
  equippedModChipId?: WeaponModChipId | null;
  unlockedModChipIds?: WeaponModChipId[];
  difficultyTier?: DifficultyTierId;
  loadoutPresets?: Array<TacticalLoadoutPreset | null>;
  combatMastery?: CombatMasteryLedgerMap;
}

export type CombatMasteryGrade = 'S+' | 'S' | 'A' | 'B' | 'C';

export type MasteryTargetId =
  | 'sector_prologue'
  | 'sector_ch1_helix'
  | 'sector_ch2_choir'
  | 'sector_ch3_curator'
  | 'sector_ch4_matron'
  | 'sector_ch5_loom'
  | 'boss_helix_04'
  | 'boss_the_choir'
  | 'boss_the_curator'
  | 'boss_matron_v'
  | 'boss_warden_prime'
  | 'boss_echo_zero';

export type MasteryBountyKind = 's_rank' | 'hitless';

export interface CombatMasteryRecord {
  bestGrade: CombatMasteryGrade;
  bestScore: number;
  bestTimeSec: number;
  hitless: boolean;
  clears: number;
  sRankRewardClaimed: boolean;
  hitlessRewardClaimed: boolean;
}

export type CombatMasteryLedgerMap = Partial<Record<MasteryTargetId, CombatMasteryRecord>>;

export type DifficultyTierId = 'standard' | 'veteran' | 'singularity';

export interface WeaponProgressionState extends PersistedWeaponProgressionState {
  unlockedWeaponIds: WeaponId[];
  overclockedUpgrades: WeaponUpgradeId[];
  awakenedUpgrades: WeaponUpgradeId[];
  purchasedRigModules: RigModuleId[];
  equippedRigModules: Record<RigModuleSlot, RigModuleId | null>;
  overclockedRigModules: RigModuleId[];
  sentinelMode: SentinelProtocolMode;
  echoDoctrine: EchoDoctrineId;
  unlockedBossCores: BossEchoCoreId[];
  equippedBossCore: BossEchoCoreId | null;
  transcendedBossCores: BossEchoCoreId[];
  purchasedNeuralProtocols: NeuralProtocolId[];
  weaponMasteryXp: WeaponMasteryXpMap;
  bestRecursionLoop: number;
  totalRecursionClears: number;
  bestGauntletTimeSec: number | null;
  totalGauntletClears: number;
  ngPlusCycle: number;
  unlockedVaultChapters: CampaignChapterId[];
  overdriveDifficulty: boolean;
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
  equippedModChipId: WeaponModChipId | null;
  unlockedModChipIds: WeaponModChipId[];
  loadoutPresets: Array<TacticalLoadoutPreset | null>;
  combatMastery: CombatMasteryLedgerMap;
  lastPurchaseOutcome: UpgradePurchaseOutcome | null;
  lastEquipOutcome: UpgradeEquipOutcome | null;
  lastActionMessage: string;
}

export interface HudWeaponProgressionSnapshot {
  memoryFragments: number;
  claimedRewardIds: WeaponProgressionRewardId[];
  purchasedUpgrades: WeaponUpgradeId[];
  equippedUpgrades: Record<WeaponId, WeaponUpgradeId | null>;
  overclockedUpgrades: WeaponUpgradeId[];
  awakenedUpgrades: WeaponUpgradeId[];
  unlockedWeaponIds: WeaponId[];
  purchasedRigModules: RigModuleId[];
  equippedRigModules: Record<RigModuleSlot, RigModuleId | null>;
  overclockedRigModules: RigModuleId[];
  sentinelMode: SentinelProtocolMode;
  echoDoctrine: EchoDoctrineId;
  unlockedBossCores: BossEchoCoreId[];
  equippedBossCore: BossEchoCoreId | null;
  transcendedBossCores: BossEchoCoreId[];
  purchasedNeuralProtocols: NeuralProtocolId[];
  weaponMasteryXp: WeaponMasteryXpMap;
  bestRecursionLoop: number;
  totalRecursionClears: number;
  bestGauntletTimeSec: number | null;
  totalGauntletClears: number;
  ngPlusCycle: number;
  unlockedVaultChapters: CampaignChapterId[];
  overdriveDifficulty: boolean;
  difficultyTier?: DifficultyTierId;
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
  equippedModChipId: WeaponModChipId | null;
  unlockedModChipIds: WeaponModChipId[];
  loadoutPresets?: Array<TacticalLoadoutPreset | null>;
  combatMastery?: CombatMasteryLedgerMap;
  canModifyLoadout: boolean;
  lastActionMessage: string;
}

export interface WeaponDefinition {
  id: WeaponId;
  name: string;
  label: string;
  shortLabel: string;
  subtitle: string;
  roleLabel: string;
  description: string;
  attackMode: WeaponAttackMode;
  primaryLabel: string;
  secondaryLabel: string;
  effectiveRange: number;
  switchCooldown: number;
}

export interface ProjectileState {
  id: string;
  owner: 'player' | 'echo';
  weaponId: WeaponId;
  equippedUpgradeId?: WeaponUpgradeId | null;
  attackMode: 'pulse_light' | 'pulse_heavy' | 'rail_light' | 'rail_heavy';
  piercing?: boolean;
  x: number;
  z: number;
  prevX: number;
  prevZ: number;
  vx: number;
  vz: number;
  rotationY: number;
  radius: number;
  damage: number;
  staggerDamage: number;
  isHeavy: boolean;
  isEmpowered: boolean;
  maxRange: number;
  distanceTraveled: number;
  elapsed: number;
  maxLifetime: number;
  active: boolean;
  attackStartedAt: number;
  attackMarkId: number | null;
  hitTargetIds: string[];
  echoClipId?: number;
  echoEventId?: string;
  flowDamageMult?: number;
  flowStaggerMult?: number;
  flowKind?: 'none' | 'riposte' | 'chrono_slip' | 'relay_momentum' | 'quick_draw';
}

export type PlayerActionState =
  | 'idle'
  | 'moving'
  | 'charging_heavy'
  | 'light_windup'
  | 'light_active'
  | 'light_recovery'
  | 'heavy_windup'
  | 'heavy_active'
  | 'heavy_recovery'
  | 'dodging'
  | 'parry_active'
  | 'parry_recovery'
  | 'dead';

export type EnemyArchetype =
  | 'bastion'
  | 'scrapper'
  | 'scout'
  | 'aegis_sentinel'
  | 'null_weaver'
  | 'phase_stalker'
  | 'chrono_mortar'
  | 'resonance_warden'
  | 'helix'
  | 'choir'
  | 'curator'
  | 'curator_decoy'
  | 'matron'
  | 'warden_prime'
  | 'siphon'
  | 'eraser';

export type EnemyModifierId = 'overclocked' | 'phase_shielded' | 'volatile';

export interface ArenaArtilleryZone {
  id: string;
  x: number;
  z: number;
  radius: number;
  remainingTimer: number;
  maxDuration: number;
  damage: number;
  sourceEnemyId: string;
  kind: 'chrono_mortar' | 'volatile_core';
}

export type BossId =
  | 'helix-04'
  | 'the-choir'
  | 'the-curator'
  | 'matron-v'
  | 'warden-prime'
  | 'echo-zero';
export type BossEncounterId = BossId;

export type CampaignChapterId =
  | 'prologue'
  | 'chapter_1_helix'
  | 'chapter_2_choir'
  | 'chapter_3_curator'
  | 'chapter_4_matron'
  | 'chapter_5_loom';

export type ChronicleLoomEndingId = 'silence' | 'witness' | 'continuity';

export type EncounterMode = 'standard' | 'boss';

export type RunMode = 'campaign' | 'practice_standard' | 'practice_boss' | 'recursion' | 'boss_gauntlet';

export type VerticalSliceStage =
  | 'intro'
  | 'calibration'
  | 'transition_to_boss'
  | 'boss_intro'
  | 'boss_fight'
  | 'chronicle_loom'
  | 'completed';

export type TutorialStep =
  | 'movement_camera'
  | 'combat_basics'
  | 'echo_record_replay'
  | 'puzzle_teach'
  | 'puzzle_test'
  | 'puzzle_combine'
  | 'boss_counterplay'
  | 'choir_harmonic_nodes'
  | 'curator_gravity_pin'
  | 'matron_echo_collapse'
  | 'chronicle_loom_choice'
  | 'completed';

export interface BossCheckpointState {
  chapter?: CampaignChapterId;
  bossId?: BossId;
  equippedWeaponId?: WeaponId;
  integrity: number;
  maxIntegrity: number;
  flux: number;
  maxFlux: number;
  replenishedIntegrity: number;
  elapsedTimeAtCheckpoint: number;
  statsAtCheckpoint: {
    damageDealt: number;
    damageTaken: number;
    parriesLanded: number;
    vulnerableHits: number;
    convergencesTriggered: number;
    relaysUsed: number;
  };
}

export type NarrativeTransmissionClassification =
  | 'RECORDED LOG'
  | 'LIVE WARDEN DIRECTIVE'
  | 'RECONSTRUCTED TRACE'
  | 'LIVE NEURAL TRACE'
  | 'SERA VENN';

export type NarrativeTransmissionAccent =
  | 'cyan'
  | 'amber'
  | 'rose'
  | 'purple'
  | 'emerald';

export interface NarrativeTransmission {
  id: string;
  speaker: string;
  classification: NarrativeTransmissionClassification;
  accent: NarrativeTransmissionAccent;
  headline: string;
  body: string;
  tacticalHint?: string;
  remainingTime: number;
  maxDuration: number;
}

export interface NarrativeCommsState {
  active: NarrativeTransmission | null;
  queue: NarrativeTransmission[];
  triggeredIds: string[];
  history: Array<
    Pick<
      NarrativeTransmission,
      'id' | 'speaker' | 'classification' | 'accent' | 'headline' | 'body'
    >
  >;
}

export interface SavedCampaignProgressSnapshot {
  chapter: CampaignChapterId;
  stage: VerticalSliceStage;
  unlockedChapters: CampaignChapterId[];
  completedChapters: CampaignChapterId[];
  recoveredLogs: string[];
  completedEndings: ChronicleLoomEndingId[];
  pendingNextChapter: CampaignChapterId | null;
  bossCheckpoint: BossCheckpointState | null;
  selectedEnding: ChronicleLoomEndingId | null;
  equippedWeaponId?: WeaponId;
  progression?: PersistedWeaponProgressionState;
  exploration?: PersistedExplorationState;
}

export interface PersistedActiveCampaignState {
  chapter: CampaignChapterId;
  stage: VerticalSliceStage;
  pendingNextChapter: CampaignChapterId | null;
  bossCheckpoint: BossCheckpointState | null;
  selectedEnding: ChronicleLoomEndingId | null;
  equippedWeaponId?: WeaponId;
  progression?: PersistedWeaponProgressionState;
  exploration?: PersistedExplorationState;
}

export interface PersistedCampaignSaveV2 {
  version: 2;
  unlockedChapters: CampaignChapterId[];
  completedChapters: CampaignChapterId[];
  recoveredLogs: string[];
  completedEndings: ChronicleLoomEndingId[];
  activeCampaign: PersistedActiveCampaignState | null;
  progression?: PersistedWeaponProgressionState;
  exploration?: PersistedExplorationState;
}

export interface VerticalSliceRunState {
  mode: RunMode;
  stage: VerticalSliceStage;
  chapter: CampaignChapterId;
  unlockedChapters: CampaignChapterId[];
  completedChapters: CampaignChapterId[];
  recoveredLogs: string[];
  completedEndings: ChronicleLoomEndingId[];
  pendingNextChapter: CampaignChapterId | null;
  isChapterReplay: boolean;
  savedCampaignSnapshot: SavedCampaignProgressSnapshot | null;
  selectedEnding: ChronicleLoomEndingId | null;
  introTimer: number;
  introDuration: number;
  transitionTimer: number;
  transitionDuration: number;
  bossCheckpoint: BossCheckpointState | null;
  checkpointNotice: string | null;
  checkpointNoticeTimer: number;
}

export interface TutorialState {
  enabled: boolean;
  step: TutorialStep;
  stepDwellTimer: number;
  stuckHintActive: boolean;
  movementCompleted: boolean;
  combatCompleted: boolean;
  echoRecordCompleted: boolean;
  title: string;
  desktopPrompt: string;
  mobilePrompt: string;
  stuckHint: string;
}

export type BossPhase = 1 | 2;

export type BossAttackType =
  | 'vector_ram'
  | 'helical_sweep'
  | 'anchor_slam'
  | 'harmonic_chord'
  | 'resonance_wave'
  | 'cadenza_slam'
  | 'archive_lance'
  | 'reconstructed_sweep'
  | 'curator_burst'
  | 'surgical_incision'
  | 'quarantine_wave'
  | 'chrono_sever'
  | 'directive_lance'
  | 'temporal_convergence_grid'
  | 'sovereign_purge_wave'
  | 'paradox_blink_slash'
  | 'paradox_rail_lance'
  | 'paradox_twin_pincer';

export type BossAiState =
  | 'dormant'
  | 'pursue'
  | 'telegraph'
  | 'attack'
  | 'recovery'
  | 'staggered'
  | 'phase_transition'
  | 'ko'
  | 'defeated';

export type EnemyAIState =
  | 'idle'
  | 'pursue'
  | 'telegraph'
  | 'attack'
  | 'recovery' // Vulnerable window (white highlight + bonus damage taken)
  | 'staggered' // Broken posture window (white highlight + bonus damage taken)
  | 'ko'; // Defeated topple/dissolve transition

export type EchoLifecycleState = 'idle' | 'recording' | 'ready' | 'playback' | 'finished';

export type EchoRecordedActionType =
  | 'light_swing'
  | 'heavy_swing'
  | 'pulse_shot'
  | 'pulse_charged_shot'
  | 'rail_shot'
  | 'rail_charged_shot'
  | 'breaker_slam'
  | 'breaker_charged_slam'
  | 'dodge'
  | 'parry';

export type InteractionPermissionPolicy = 'echo_only' | 'player_only' | 'player_or_echo';

export interface EchoSample {
  t: number; // Relative simulation timestamp in seconds (0 <= t <= duration)
  x: number;
  z: number;
  rotationY: number;
  actionState: PlayerActionState;
  gaitPhase: number;
  comboIndex: number;
  chargeRatio: number;
  isEmpoweredHeavy: boolean;
  weaponId?: WeaponId;
  equippedUpgradeId?: WeaponUpgradeId | null;
}

export interface EchoRecordedActionEvent {
  id?: string; // Deterministic action event identity within clip
  t: number; // Relative simulation timestamp in seconds when action windup began (0 <= t <= duration)
  contactTime?: number; // Relative simulation timestamp when attack active/contact phase begins
  action: EchoRecordedActionType;
  x: number;
  z: number;
  rotationY: number;
  comboIndex: number;
  isEmpoweredHeavy?: boolean;
  weaponId?: WeaponId;
  equippedUpgradeId?: WeaponUpgradeId | null;
}

export interface EchoClip {
  id: number;
  duration: number;
  samples: EchoSample[];
  events: EchoRecordedActionEvent[];
}

export interface EchoActorState {
  id: string;
  clipId: number;
  x: number;
  z: number;
  rotationY: number;
  radius: number;
  actionState: PlayerActionState;
  gaitPhase: number;
  comboIndex: number;
  chargeRatio: number;
  isEmpoweredHeavy: boolean;
  weaponId: WeaponId;
  equippedUpgradeId?: WeaponUpgradeId | null;
  elapsed: number;
  duration: number;
}

export interface EchoSystemState {
  state: EchoLifecycleState;
  recordingTime: number;
  maxDuration: number;
  minDuration: number;
  playbackTime: number;
  nextEventIndex: number;
  processedContactEventIds: string[];
  clipCounter: number;
  clip: EchoClip | null;
  recordingSamples: EchoSample[];
  recordingEvents: EchoRecordedActionEvent[];
  activeActor: EchoActorState | null;
  statusMessage: string;
  novaPulseCooldownTimer?: number;
}

export type ResonanceStatus = 'idle' | 'primed' | 'on_cooldown';

export type ResonanceOutcome =
  | 'none'
  | 'primed'
  | 'converged'
  | 'expired'
  | 'wrong_target'
  | 'non_qualifying_attack'
  | 'attack_started_before_mark'
  | 'insufficient_flux'
  | 'on_cooldown'
  | 'out_of_range'
  | 'line_of_sight_blocked';

export interface ResonanceMarkState {
  markId: number;
  enemyId: string;
  enemyName: string;
  clipId: number;
  eventId: string;
  echoAction: EchoRecordedActionType;
  createdAt: number;
  expiresAt: number;
  duration: number;
  remainingTime: number;
  x: number;
  z: number;
}

export interface ResonanceSystemState {
  status: ResonanceStatus;
  activeMark: ResonanceMarkState | null;
  markCounter: number;
  primedCount: number;
  convergenceCount: number;
  cooldownTimer: number;
  maxCooldown: number;
  fluxCost: number;
  syncWindow: number;
  postureBonus: number;
  bonusDamage: number;
  lastOutcome: ResonanceOutcome;
  lastConvergedEnemyId: string | null;
  lastConvergedX: number;
  lastConvergedZ: number;
  flashTimer: number;
  statusMessage: string;
}

export type RelayEvaluationStatus =
  | 'ready'
  | 'no_active_echo'
  | 'action_locked'
  | 'on_cooldown'
  | 'insufficient_flux'
  | 'out_of_range'
  | 'path_blocked'
  | 'no_safe_landing';

export type RelayAttemptOutcome = 'none' | 'teleported' | RelayEvaluationStatus;

export interface RelayTargetEvaluation {
  canRelay: boolean;
  status: RelayEvaluationStatus;
  distance: number;
  maxRange: number;
  fluxCost: number;
  landingX: number;
  landingZ: number;
  echoX: number;
  echoZ: number;
  candidateIndex: number;
  message: string;
}

export interface RelaySystemState {
  cooldownTimer: number;
  maxCooldown: number;
  fluxCost: number;
  maxRange: number;
  activationCount: number;
  lastOutcome: RelayAttemptOutcome;
  lastOriginX: number;
  lastOriginZ: number;
  lastLandingX: number;
  lastLandingZ: number;
  successFlashTimer: number;
  statusMessage: string;
  preview: RelayTargetEvaluation;
}

export interface PressurePlateState {
  id: string;
  label: string;
  x: number;
  z: number;
  radius: number;
  interactionPolicy: InteractionPermissionPolicy;
  active: boolean;
  interactorId: string | null;
  receiverId: string;
  receiverLabel: string;
  receiverX: number;
  receiverZ: number;
  receiverRadius: number;
  barrierOpen: boolean;
  activationCount: number;
}

export type PuzzleStage = 'teach' | 'test' | 'combine' | 'completed';

export type ReceiverAttemptOutcome =
  | 'none'
  | 'charged'
  | 'wrong_actor'
  | 'wrong_action'
  | 'wrong_orientation'
  | 'out_of_range';

export interface HeavyReceiverState {
  id: string;
  label: string;
  x: number;
  z: number;
  radius: number;
  targetX: number;
  targetZ: number;
  targetYaw: number;
  angleTolerance: number;
  interactionPolicy: InteractionPermissionPolicy;
  charged: boolean;
  chargeTimer: number;
  chargeDuration: number;
  activationCount: number;
  lastAttemptOutcome: ReceiverAttemptOutcome;
}

export interface CombineBarrierState {
  id: string;
  label: string;
  x: number;
  z: number;
  radius: number;
  height: number;
  open: boolean;
  completionX: number;
  completionZ: number;
  completionRadius: number;
}

export interface ChronoPuzzleState {
  stage: PuzzleStage;
  teachCompleted: boolean;
  testCompleted: boolean;
  combineCompleted: boolean;
  completed: boolean;
  teachPlate: PressurePlateState;
  heavyReceiver: HeavyReceiverState;
  combinePlate: PressurePlateState;
  finalBarrier: CombineBarrierState;
}

// ============================================================================
// CHAPTER II — THE CHOIR: LINKED HARMONIC SYNCHRONIZATION NODES
// ============================================================================

export type HarmonicNodeStatus = 'inactive' | 'primed' | 'synchronized' | 'failed';

export interface HarmonicNodeState {
  id: string;
  label: string;
  index: number;
  x: number;
  z: number;
  radius: number;
  status: HarmonicNodeStatus;
  primedByEventId: string | null;
  primedRemainingTime: number;
  failedRemainingTime: number;
  syncOrder: number;
}

export interface ChoirState {
  active: boolean;
  nodes: HarmonicNodeState[];
  syncWindowSeconds: number;
  syncTimer: number;
  requiredNodeCount: number;
  synchronizedCount: number;
  completedCycles: number;
  failureResetTimer: number;
  lastFailureReason: string | null;
  processedNodeEventIds: string[];
  statusMessage: string;
}

// ============================================================================
// CHAPTER III — THE CURATOR: RECONSTRUCTED TRACES, DECOYS & GRAVITY PIN [G]
// ============================================================================

export type ReconstructedTraceState = 'warning' | 'committed' | 'executing' | 'residue';

export interface ReconstructedAttackTrace {
  id: string;
  attackId: 'archive_lance' | 'reconstructed_sweep';
  label: string;
  state: ReconstructedTraceState;
  originX: number;
  originZ: number;
  dirX: number;
  dirZ: number;
  rotationY: number;
  length: number;
  width: number;
  radius: number;
  arcRadians: number;
  timer: number;
  warningDuration: number;
  commitDuration: number;
  activeDuration: number;
  residueDuration: number;
  damage: number;
  hitApplied: boolean;
  isHarmlessResidue: boolean;
}

export type GravityPinStatus =
  | 'locked'
  | 'ready'
  | 'active'
  | 'on_cooldown'
  | 'insufficient_flux'
  | 'no_valid_target'
  | 'action_locked';

export interface GravityPinState {
  unlocked: boolean;
  status: GravityPinStatus;
  fluxCost: number;
  cooldownTimer: number;
  maxCooldown: number;
  activeDurationTimer: number;
  maxDuration: number;
  maxRange: number;
  radius: number;
  centerX: number;
  centerZ: number;
  pinnedTargetIds: string[];
  activationCount: number;
  statusMessage: string;
}

export interface CuratorState {
  active: boolean;
  traces: ReconstructedAttackTrace[];
  decoyIds: string[];
  nextTraceSeq: number;
  lastDecoySpawnTime: number;
  statusMessage: string;
}

// ============================================================================
// CHAPTER IV — MATRON-V: SIPHON, ERASER, CHRONO SEVER & ECHO COLLAPSE [X]
// ============================================================================

export type EchoCollapseStatus =
  | 'locked'
  | 'ready'
  | 'on_cooldown'
  | 'insufficient_flux'
  | 'no_active_echo'
  | 'action_locked';

export interface EchoCollapseState {
  unlocked: boolean;
  status: EchoCollapseStatus;
  fluxCost: number;
  cooldownTimer: number;
  maxCooldown: number;
  blastTimer: number;
  blastX: number;
  blastZ: number;
  blastRadius: number;
  damage: number;
  postureDamage: number;
  activationCount: number;
  lastTargetsHit: number;
  statusMessage: string;
}

export interface MatronState {
  active: boolean;
  siphonDrainEventsCount: number;
  totalFluxDrained: number;
  eraserDisruptionsCount: number;
  chronoSeverActive: boolean;
  chronoSeverZoneX: number;
  chronoSeverZoneZ: number;
  chronoSeverRadius: number;
  chronoSeverWarningTimer: number;
  echoSuppressedTimer: number;
  processedStrikeEventIds: string[];
  statusMessage: string;
}

// ============================================================================
// CHAPTER V — THE LAST LOOP: CHRONICLE LOOM FINALE
// ============================================================================

export interface ChronicleLoomState {
  active: boolean;
  endingChoiceAvailable: boolean;
  selectedEnding: ChronicleLoomEndingId | null;
  selectionCount: number;
  completedAtTime: number | null;
}

export type ObstacleKind = 'pillar' | 'barrier' | 'cover_wall' | 'destructible_crate';

export interface ObstacleCollider {
  id: string;
  x: number;
  z: number;
  radius: number;
  height: number;
  label: string;
  disabled?: boolean;
  kind?: ObstacleKind;
  destructible?: boolean;
  hp?: number;
  maxHp?: number;
}

export interface ArenaBoostPad {
  id: string;
  label: string;
  x: number;
  z: number;
  radius: number;
  cooldown: number;
  maxCooldown: number;
}

export interface ArenaFluxPool {
  id: string;
  x: number;
  z: number;
  radius: number;
  remainingTime: number;
  maxDuration: number;
  sourceObstacleId: string;
}

export interface TacticalWaypointState {
  id: string;
  kind:
    | 'region'
    | 'route'
    | 'hazard'
    | 'boost_pad'
    | 'obstacle'
    | 'interactable'
    | 'secret'
    | 'fragment_cache'
    | 'sector_beacon'
    | 'landmark';
  label: string;
  x: number;
  z: number;
}

export type FragmentCacheId =
  | 'cache_prologue_east'
  | 'cache_ch1_marshal_west'
  | 'cache_ch2_garden_north'
  | 'cache_ch3_vault_east'
  | 'cache_ch3_vault_west'
  | 'cache_ch4_quarantine_north'
  | 'cache_ch5_loom_east'
  | 'cache_ch5_loom_west';

export interface ArenaFragmentCacheState {
  id: FragmentCacheId;
  chapter: CampaignChapterId;
  label: string;
  crewAuthor: string;
  memoryExcerpt: string;
  x: number;
  z: number;
  radius: number;
  claimed: boolean;
  rewardId: WeaponProgressionRewardId;
}

export type SectorBeaconId =
  | 'beacon_prologue_cryo_vent'
  | 'beacon_ch1_emp_pylon'
  | 'beacon_ch2_harmonic_bell'
  | 'beacon_ch3_purge_scanner'
  | 'beacon_ch4_med_cradle'
  | 'beacon_ch5_loom_capacitor';

export interface SectorTacticalBeaconState {
  id: SectorBeaconId;
  chapter: CampaignChapterId;
  label: string;
  effectLabel: string;
  description: string;
  x: number;
  z: number;
  radius: number;
  cooldown: number;
  maxCooldown: number;
  activationCount: number;
}

export type ChronicleStance = 'defiance' | 'empathy' | 'pragmatism';

export type StoryArcId =
  | 'story_prologue_wake'
  | 'story_ch1_containment'
  | 'story_ch2_chorus'
  | 'story_ch3_archive'
  | 'story_ch4_quarantine'
  | 'story_ch5_reckoning';

export interface StoryDialogueLine {
  speaker: string;
  role: string;
  accent: NarrativeTransmissionAccent;
  line: string;
}

export interface StoryChoiceOption {
  id: string;
  stance: ChronicleStance;
  label: string;
  responseLine: string;
  blessingLabel: string;
  blessingEffect: 'flux_surge' | 'integrity_shield' | 'posture_edge';
}

export interface StoryArcDefinition {
  id: StoryArcId;
  chapter: CampaignChapterId;
  rewardId: WeaponProgressionRewardId;
  title: string;
  subtitle: string;
  crewCharacter: string;
  lines: readonly StoryDialogueLine[];
  choices: readonly StoryChoiceOption[];
}

export interface StoryArcState extends StoryArcDefinition {
  resolved: boolean;
  chosenOptionId: string | null;
  chosenStance: ChronicleStance | null;
}

export interface ChronicleStanceSummary {
  defiance: number;
  empathy: number;
  pragmatism: number;
  dominantStance: ChronicleStance | 'balanced';
}

export type GraphicsPreset = 'performance' | 'balanced' | 'quality' | 'custom';
export type ShadowQuality = 'off' | 'medium' | 'high';
export type ParticleQuality = 'low' | 'medium' | 'high';
export type LightingQuality = 'lite' | 'standard';
export type FpsLimitOption = 0 | 30 | 45 | 60;
export type CelestialAtmosphereGrade = 'natural' | 'aurora' | 'eclipse';

export type HoloMemoryId =
  | 'holo_prologue_lysa'
  | 'holo_ch1_manifest'
  | 'holo_ch2_garden'
  | 'holo_ch3_confession'
  | 'holo_ch4_cradle'
  | 'holo_ch5_origin';

export interface CameraSettings {
  sensitivity: number; // 0.3 to 2.5, default 1.0
  invertY: boolean; // default false
  reducedMotion: boolean;
  masterVolume?: number; // 0 to 1, default 0.85
  musicVolume?: number; // 0 to 1, default 0.7
  sfxVolume?: number; // 0 to 1, default 0.9
  cameraShake?: boolean; // default true
  screenEffects?: boolean; // default true
  subtitlesEnabled?: boolean; // default true
  graphicsPreset?: GraphicsPreset; // default 'balanced'
  renderScale?: number; // 0.6 to 1.0, default 0.85
  shadowQuality?: ShadowQuality; // 'off' | 'medium' | 'high', default 'medium'
  particleQuality?: ParticleQuality; // 'low' | 'medium' | 'high', default 'medium'
  lightingQuality?: LightingQuality; // 'lite' | 'standard', default 'standard'
  fpsLimit?: FpsLimitOption; // 0 (unlimited) | 30 | 45 | 60, default 60
  showPerfHud?: boolean; // default false
  adaptiveResolution?: boolean; // default true
  celestialGrade?: CelestialAtmosphereGrade; // 'natural' | 'aurora' | 'eclipse', default 'natural'
}

export interface PlayerInputFrame {
  moveX: number; // -1 to 1 (A/D)
  moveZ: number; // -1 to 1 (W/S, negative is forward into screen)
  aimYaw: number; // Camera horizontal yaw in radians
  aimPitch?: number; // Camera vertical pitch in radians (never affects horizontal WASD plane)
  aimWorldX?: number; // Optional explicit target world coordinate (not driven by competing 2D cursor)
  aimWorldZ?: number;
  lightAttackJustPressed: boolean;
  heavyHoldActive: boolean;
  heavyJustReleased: boolean;
  heavyAttackJustPressed: boolean; // Dedicated key (E or Right Click) for instant heavy charge/release
  dodgeJustPressed: boolean;
  parryJustPressed: boolean;
  cameraDragJustStarted?: boolean; // Cancels a pending mouse charge without turning it into an attack
  switchWeaponJustPressed?: boolean; // [Tab / Z] Toggle active weapon between Chrono Edge and Pulsecaster
  selectWeaponId?: WeaponId | null; // Explicit weapon selection (e.g., [1] Chrono Edge, [2] Pulsecaster)
  echoRecordJustPressed?: boolean; // [T] Start / Stop Echo recording
  echoPlayJustPressed?: boolean; // [Y] Start Echo playback
  echoClearJustPressed?: boolean; // [C] Discard / Clear Echo
  echoRelayJustPressed?: boolean; // [V] Teleport live Sera to safe landing position adjacent to active Echo
  gravityPinJustPressed?: boolean; // [G] Chapter III+ Gravity Pin crowd-control field
  echoCollapseJustPressed?: boolean; // [X] Chapter IV+ Echo Collapse tactical detonation
  interactJustPressed?: boolean; // [I] Contextual environmental interaction
  lockOnToggleJustPressed?: boolean; // [O / Middle Click] Tactical target lock-on toggle
  lockOnCycleJustPressed?: boolean; // [Wheel / ]] Cycle active lock-on target
  overdriveJustPressed?: boolean; // [5 / `] Trigger Chrono Stasis Overdrive (time dilation ultimate)
  useNaniteJustPressed?: boolean; // [H / 6] Inject Med-Nanite restorative canister
  confluenceBurstJustPressed?: boolean; // [9] Trigger Sentinel × Boss Core Sovereign Confluence Burst
}

export type ConfluenceDoctrineId =
  | 'none'
  | 'core_overpulse'
  | 'aegis_bastion'
  | 'interceptor_lance'
  | 'harmonic_paradox';

export interface ChronoConfluenceState {
  doctrineId: ConfluenceDoctrineId;
  charge: number; // 0..100
  cooldownTimer: number;
  maxCooldown: number;
  ready: boolean;
  isOmega: boolean;
  totalBursts: number;
}

export interface PlayerState {
  x: number;
  z: number;
  vx: number;
  vz: number;
  rotationY: number;
  integrity: number;
  maxIntegrity: number;
  ghostIntegrity: number; // Delayed trailing bar
  flux: number;
  maxFlux: number;
  equippedWeaponId: WeaponId;
  weaponHeat: number;
  maxWeaponHeat: number;
  weaponOverheated: boolean;
  weaponOverheatTimer: number;
  weaponShotCooldownTimer: number;
  weaponSwitchCooldownTimer: number;
  lastWeaponShotOutcome: WeaponShotOutcome;
  actionState: PlayerActionState;
  stateTimer: number;
  comboIndex: number; // 0, 1, 2
  comboWindowTimer: number;
  comboCooldownTimer: number; // Enforces commitment after 3-hit combo finisher
  chargeTime: number;
  isEmpoweredHeavy: boolean;
  dodgeCooldownTimer: number;
  parryCooldownTimer: number;
  invulnTimer: number;
  hurtFlashTimer: number;
  gaitPhase: number;
  squashX: number;
  squashY: number;
  attackHitIds: string[]; // Tracks enemies already hit during the current active swing
  currentAttackStartedAt: number; // Simulation elapsedTime when current attack was initiated
  currentAttackMarkId: number | null; // Active Resonance markId at the moment current attack was initiated
  bufferedAction: 'none' | 'light' | 'heavy' | 'dodge' | 'parry';
  bufferTimer: number;
  bufferedWeaponSwitch?: WeaponId | 'cycle' | null;
  weaponSwitchBufferTimer?: number;
  fluxDampenedTimer?: number;
  riposteTimer?: number;
  chronoSlipTimer?: number;
  dodgeCounterTriggered?: boolean;
  relayMomentumTimer?: number;
  quickDrawTimer?: number;
  activeStrikeFlowDamageMult?: number;
  activeStrikeFlowStaggerMult?: number;
  activeStrikeFlowKind?: 'none' | 'riposte' | 'chrono_slip' | 'relay_momentum' | 'quick_draw';
  adrenalineScore?: number;
  adrenalineDecayGraceTimer?: number;
  activeVentAttempted?: boolean;
  activeVentEmpoweredShots?: number;
  lockOnTargetId?: string | null;
  surgeTimer?: number;
  temporalSlipTimer?: number;
  temporalSlipMaxDuration?: number;
  temporalSlipCooldown?: number;
}

export interface EnemyState {
  id: string;
  name: string;
  archetype: EnemyArchetype;
  x: number;
  z: number;
  vx: number;
  vz: number;
  rotationY: number;
  hp: number;
  maxHp: number;
  ghostHp: number;
  stagger: number;
  maxStagger: number;
  radius: number;
  aiState: EnemyAIState;
  stateTimer: number;
  stateDuration: number;
  cooldownTimer: number;
  strafeDir: number;
  hitFlashTimer: number;
  hasDealtDamageThisAttack: boolean;
  koProgress: number; // 0 -> 1 over 0.45s
  targetX: number;
  targetZ: number;
  evadeTimer: number;
  evadeCooldownTimer: number;
  isDecoy?: boolean;
  decoySignature?: 'phase_flicker' | 'inverted_harmonic';
  pinnedTimer?: number;
  strikeSeq?: number;
  telegraphLocked?: boolean;
  modifier?: EnemyModifierId | null;
  blinkCooldownTimer?: number;
  phaseShiftTimer?: number;
  tetherTargetId?: string | null;
}

export interface BossState {
  id: string;
  name: string;
  subtitle: string;
  x: number;
  z: number;
  vx: number;
  vz: number;
  rotationY: number;
  hp: number;
  maxHp: number;
  ghostHp: number;
  stagger: number;
  maxStagger: number;
  radius: number;
  phase: BossPhase;
  aiState: BossAiState;
  stateTimer: number;
  stateDuration: number;
  cooldownTimer: number;
  activeAttack: BossAttackType | null;
  lastAttack: BossAttackType | null;
  attackSequenceIndex: number;
  telegraphLocked: boolean;
  attackOriginX: number;
  attackOriginZ: number;
  attackDirX: number;
  attackDirZ: number;
  targetX: number;
  targetZ: number;
  hasDealtDamageThisAttack: boolean;
  shockwaveActive: boolean;
  shockwaveRadius: number;
  shockwaveMaxRadius: number;
  hitFlashTimer: number;
  koProgress: number;
  phaseTransitionTriggered: boolean;
  defeatTriggered: boolean;
  staggerCooldownTimer: number;
  coreExposed: boolean;
  statusLabel: string;
  pinnedTimer?: number;
}

export interface CombatEvent {
  type:
    | 'player_light_swing'
    | 'player_heavy_charge_ready'
    | 'player_heavy_swing'
    | 'player_hit_enemy'
    | 'enemy_staggered'
    | 'enemy_killed'
    | 'enemy_telegraph_start'
    | 'enemy_attack_strike'
    | 'player_parry_success'
    | 'player_parry_start'
    | 'player_dodge'
    | 'player_damaged'
    | 'encounter_victory'
    | 'encounter_defeat'
    | 'echo_recording_started'
    | 'echo_recording_ready'
    | 'echo_recording_rejected'
    | 'echo_recording_replaced'
    | 'echo_playback_started'
    | 'echo_playback_rejected'
    | 'echo_playback_completed'
    | 'echo_cleared'
    | 'echo_action_visual'
    | 'echo_plate_activated'
    | 'echo_plate_released'
    | 'echo_receiver_activated'
    | 'echo_receiver_expired'
    | 'echo_receiver_rejected'
    | 'echo_combine_barrier_opened'
    | 'echo_combine_barrier_closed'
    | 'echo_puzzle_completed'
    | 'echo_relay_success'
    | 'echo_relay_rejected'
    | 'echo_resonance_primed'
    | 'echo_resonance_expired'
    | 'resonance_convergence'
    | 'resonance_convergence_rejected'
    | 'boss_activated'
    | 'boss_telegraph_start'
    | 'boss_attack_strike'
    | 'boss_shockwave_burst'
    | 'boss_core_exposed'
    | 'boss_phase_transition'
    | 'boss_staggered'
    | 'boss_defeated'
    | 'containment_transition_started'
    | 'choir_node_primed'
    | 'choir_node_synchronized'
    | 'choir_sync_completed'
    | 'choir_sync_failed'
    | 'curator_trace_spawned'
    | 'curator_trace_executed'
    | 'curator_decoy_eliminated'
    | 'gravity_pin_activated'
    | 'gravity_pin_rejected'
    | 'siphon_flux_drained'
    | 'null_weaver_flux_dampened'
    | 'eraser_echo_disrupted'
    | 'matron_chrono_sever'
    | 'echo_collapse_detonated'
    | 'echo_collapse_rejected'
    | 'campaign_chapter_advanced'
    | 'chronicle_loom_ending_selected'
    | 'comms_transmission_started'
    | 'weapon_switched'
    | 'weapon_unlocked'
    | 'player_pulse_shot'
    | 'player_pulse_heavy_shot'
    | 'player_rail_shot'
    | 'player_rail_heavy_shot'
    | 'player_breaker_slam'
    | 'player_breaker_heavy_slam'
    | 'breaker_shockwave_slam'
    | 'pulse_overheated'
    | 'pulse_overheat_cleared'
    | 'pulse_impact_obstacle'
    | 'progression_reward_granted'
    | 'weapon_upgrade_purchased'
    | 'weapon_upgrade_equipped'
    | 'weapon_upgrade_rejected'
    | 'encounter_wave_started'
    | 'environmental_interaction_completed'
    | 'environmental_interaction_rejected'
    | 'mission_objective_completed'
    | 'codex_entry_discovered'
    | 'traversal_route_unlocked'
    | 'timed_hazard_warning'
    | 'timed_hazard_active'
    | 'timed_hazard_damaged_player'
    | 'secret_area_discovered'
    | 'narrative_event_triggered'
    | 'echo_memory_discovered'
    | 'player_riposte_strike'
    | 'player_perfect_dodge'
    | 'adrenaline_tier_changed'
    | 'active_vent_success'
    | 'active_vent_missed'
    | 'chrono_execution_finisher'
    | 'lock_on_engaged'
    | 'obstacle_damaged'
    | 'obstacle_destroyed'
    | 'boost_pad_triggered'
    | 'rig_module_purchased'
    | 'rig_module_equipped'
    | 'flux_pool_spawned'
    | 'temporal_thread_triggered'
    | 'fragment_cache_claimed'
    | 'sector_beacon_activated'
    | 'weapon_upgrade_overclocked'
    | 'weapon_mythic_awakened'
    | 'rig_module_overclocked'
    | 'sentinel_mode_switched'
    | 'chrono_ward_absorbed'
    | 'chrono_ward_shatter'
    | 'phantom_afterimage_strike'
    | 'boss_core_unlocked'
    | 'boss_core_equipped'
    | 'boss_core_pulse'
    | 'boss_core_omega_awakened'
    | 'confluence_burst_triggered'
    | 'echo_doctrine_switched'
    | 'echo_doctrine_nova_pulse'
    | 'holo_memory_projected'
    | 'temporal_slip_triggered'
    | 'sovereign_astral_pulse'
    | 'mastery_bounty_claimed'
    | 'neural_protocol_purchased'
    | 'story_choice_resolved'
    | 'temporal_rift_spawned'
    | 'temporal_rift_sealed'
    | 'temporal_rift_ruptured'
    | 'recursion_loop_cleared'
    | 'recursion_relic_picked'
    | 'phase_stalker_blink'
    | 'chrono_mortar_barrage_fired'
    | 'chrono_mortar_detonated'
    | 'conductor_tether_severed'
    | 'volatile_core_detonated'
    | 'chrono_overdrive_activated'
    | 'chrono_overdrive_ended'
    | 'gauntlet_stage_cleared'
    | 'gauntlet_victory'
    | 'expedition_breach_triggered'
    | 'expedition_airlock_unlocked'
    | 'expedition_sector_transit'
    | 'safe_room_entered'
    | 'safe_room_med_used'
    | 'safe_room_lysa_briefing'
    | 'secret_vault_unlocked'
    | 'secret_vault_looted'
    | 'ng_plus_started'
    | 'nanite_injector_used'
    | 'aegis_shield_absorbed'
    | 'fabricator_purchased'
    | 'combat_drone_fired'
    | 'combat_drone_shield_triggered'
    | 'boss_killcam_triggered'
    | 'achievement_unlocked'
    | 'paradox_rift_entered'
    | 'echo_zero_defeated'
    | 'rig_skin_changed'
    | 'skin_equipped'
    | 'player_scythe_swing'
    | 'scythe_vortex_pull'
    | 'mod_volt_arc_chain'
    | 'mod_siphon_leech_heal'
    | 'mod_chrono_nova_burst'
    | 'style_rank_up'
    | 'chrono_finisher_triggered'
    | 'flash_swap_triggered'
    | 'chrono_chain_milestone'
    | 'weapon_overcharge_ready'
    | 'weapon_overcharge_ended'
    | 'twin_sync_tier_up'
    | 'twin_sync_pincer'
    | 'weakpoint_break_triggered'
    | 'chrono_momentum_tier_up'
    | 'chrono_nexus_linked'
    | 'chrono_nexus_pulse'
    | 'weapon_swap_resonance'
    | 'daily_trial_started'
    | 'daily_trial_completed';
  x: number;
  z: number;
  originX?: number;
  originZ?: number;
  amount?: number;
  postureBonus?: number;
  achievementId?: ChronoAchievementId;
  fabricatorItemId?: FabricatorItemId;
  skinId?: SeraRigSkinId;
  isCriticalOrVulnerable?: boolean;
  isHeavy?: boolean;
  isGuarded?: boolean;
  enemyId?: string;
  obstacleId?: string;
  boostPadId?: string;
  weaponId?: WeaponId;
  upgradeId?: WeaponUpgradeId | null;
  rewardId?: WeaponProgressionRewardId;
  interactableId?: InteractableId;
  objectiveId?: MissionObjectiveId;
  codexId?: CodexEntryId;
  routeId?: TraversalRouteId;
  hazardId?: TimedEnergyHazardId;
  secretId?: SecretAreaId;
  narrativeEventId?: NarrativeEventId;
  echoAction?: EchoRecordedActionType;
  relayStatus?: RelayEvaluationStatus;
  resonanceOutcome?: ResonanceOutcome;
  bossAttack?: BossAttackType;
  bossPhase?: BossPhase;
  flowKind?: 'none' | 'riposte' | 'chrono_slip' | 'relay_momentum' | 'quick_draw';
  commsSpeaker?: string;
  commsClassification?: string;
}

export interface RunSummary {
  outcome: GameOutcome;
  chapter?: CampaignChapterId;
  bossId?: string | null;
  selectedEnding?: ChronicleLoomEndingId | null;
  elapsedTime: number;
  enemiesDefeated: number;
  totalEnemies: number;
  damageDealt: number;
  damageTaken: number;
  parriesLanded: number;
  perfectDodges?: number;
  vulnerableHits: number;
  convergencesTriggered: number;
  relaysUsed: number;
  remainingTargetHp: number;
}

export type EncounterPacingTier = 'teach' | 'practice' | 'combine' | 'master';

export type EncounterCompositionId =
  | 'prologue_calibration_bay'
  | 'tactical_guard_and_flank'
  | 'tactical_crossfire_suppression'
  | 'tactical_temporal_disruption'
  | 'tactical_mastery_gauntlet'
  | 'tactical_apex_bestiary';

export interface EncounterWaveUnitSpec {
  id: string;
  archetype: EnemyArchetype;
  name: string;
  x: number;
  z: number;
  modifier?: EnemyModifierId;
}

export interface EncounterWaveSpec {
  waveIndex: number;
  label: string;
  tacticalDirective: string;
  units: readonly EncounterWaveUnitSpec[];
}

export interface EncounterDefinition {
  id: EncounterCompositionId;
  label: string;
  shortLabel: string;
  chapterContext: CampaignChapterId;
  pacingTier: EncounterPacingTier;
  tacticalFocus: string;
  recommendedWeaponId: WeaponId;
  recommendedUpgradeIds: readonly WeaponUpgradeId[];
  maxConcurrentAttackers: number;
  waves: readonly EncounterWaveSpec[];
}

export interface EncounterRuntimeState {
  encounterId: EncounterCompositionId;
  label: string;
  pacingTier: EncounterPacingTier;
  tacticalFocus: string;
  currentWaveIndex: number;
  totalWaves: number;
  waveClearedCount: number;
  completed: boolean;
  activeWaveLabel: string;
  tacticalDirective: string;
  spawnedWaveIndices: number[];
}

export interface EncounterSpawnValidationResult {
  valid: boolean;
  reason: string;
}

// ============================================================================
// PHASE 18 — WORLD EXPLORATION, ENVIRONMENTAL INTERACTION & MISSION SYSTEMS
// ============================================================================

export type MissionId =
  | 'mission_prologue_calibration'
  | 'mission_ch1_helix'
  | 'mission_ch2_choir'
  | 'mission_ch3_curator'
  | 'mission_ch4_matron'
  | 'mission_ch5_loom';

export type MissionObjectiveId =
  | 'obj_prologue_puzzle_calibration'
  | 'obj_prologue_clear_bay'
  | 'obj_prologue_optional_terminal'
  | 'obj_prologue_optional_power_node'
  | 'obj_ch1_break_helix_shield'
  | 'obj_ch1_defeat_helix'
  | 'obj_ch1_optional_marshal_log'
  | 'obj_ch2_sync_harmonic_cycle'
  | 'obj_ch2_defeat_choir'
  | 'obj_ch2_optional_garden_conduit'
  | 'obj_ch3_purge_archive_decoy'
  | 'obj_ch3_defeat_curator'
  | 'obj_ch3_optional_lysa_terminal'
  | 'obj_ch4_survive_excision'
  | 'obj_ch4_defeat_matron'
  | 'obj_ch4_optional_quarantine_override'
  | 'obj_ch5_defeat_warden_prime'
  | 'obj_ch5_select_loom_directive'
  | 'obj_ch5_optional_loom_manifest';

export type ObjectiveStatus = 'locked' | 'available' | 'active' | 'completed';

export type ObjectiveCategory = 'main' | 'optional';

export type ObjectiveTriggerType =
  | 'puzzle_completed'
  | 'encounter_completed'
  | 'interactable_activated'
  | 'boss_phase_reached'
  | 'boss_defeated'
  | 'choir_cycle_completed'
  | 'curator_decoy_eliminated'
  | 'loom_ending_selected';

export interface MissionObjectiveDefinition {
  id: MissionObjectiveId;
  missionId: MissionId;
  chapter: CampaignChapterId;
  category: ObjectiveCategory;
  title: string;
  description: string;
  triggerType: ObjectiveTriggerType;
  prerequisiteObjectiveIds: readonly MissionObjectiveId[];
  targetInteractableId?: InteractableId;
  rewardCodexId?: CodexEntryId;
}

export interface MissionDefinition {
  id: MissionId;
  chapter: CampaignChapterId;
  code: string;
  title: string;
  sectorLabel: string;
  summary: string;
  objectiveIds: readonly MissionObjectiveId[];
}

export interface MissionObjectiveState {
  id: MissionObjectiveId;
  category: ObjectiveCategory;
  title: string;
  description: string;
  status: ObjectiveStatus;
  prerequisiteObjectiveIds: MissionObjectiveId[];
  completedAtTime: number | null;
}

export interface MissionRuntimeState {
  id: MissionId;
  missionId: MissionId;
  chapter: CampaignChapterId;
  code: string;
  title: string;
  sectorLabel: string;
  summary: string;
  completed: boolean;
  activeMainObjectiveId: MissionObjectiveId | null;
  activeMainObjectiveTitle: string;
  activeMainObjectiveDescription: string;
  optionalObjectiveSummary: string;
  completedMainCount: number;
  totalMainCount: number;
  completedOptionalCount: number;
  totalOptionalCount: number;
  objectives: MissionObjectiveState[];
}

export type InteractableId =
  | 'int_prologue_diagnostic_terminal'
  | 'int_prologue_aux_power_node'
  | 'int_prologue_shortcut_gate'
  | 'int_ch1_marshal_terminal'
  | 'int_ch1_ballistic_capacitor'
  | 'int_ch2_garden_echo_conduit'
  | 'int_ch2_chorus_log_terminal'
  | 'int_ch3_lysa_archive_terminal'
  | 'int_ch3_vault_power_relay'
  | 'int_ch4_quarantine_override_node'
  | 'int_ch4_surgical_log_terminal'
  | 'int_ch5_loom_manifest_terminal'
  | 'int_ch5_temporal_anchor_conduit';

export type InteractableKind = 'terminal' | 'power_node' | 'gate_control' | 'echo_conduit';

export type InteractableStatus = 'locked' | 'available' | 'activated';

export type InteractionEvaluationStatus =
  | 'ready'
  | 'out_of_range'
  | 'not_facing'
  | 'blocked_by_obstacle'
  | 'prerequisite_locked'
  | 'requires_echo'
  | 'already_activated'
  | 'action_locked'
  | 'invalid_target';

export interface EnvironmentalInteractableDefinition {
  id: InteractableId;
  chapter: CampaignChapterId;
  kind: InteractableKind;
  label: string;
  promptVerb: string;
  x: number;
  z: number;
  interactRadius: number;
  requiresFacing: boolean;
  facingCosineThreshold: number;
  requiresLineOfSight: boolean;
  requiresActiveEcho?: boolean;
  acceptsEchoOrPulseStrike?: boolean;
  prerequisiteInteractableId?: InteractableId;
  unlocksObstacleId?: string;
  unlocksInteractableId?: InteractableId;
  fluxRestoreAmount?: number;
  integrityRestoreAmount?: number;
  grantsCodexId?: CodexEntryId;
  completesObjectiveId?: MissionObjectiveId;
  activationMessage: string;
  lockedReasonText?: string;
}

export interface EnvironmentalInteractableState {
  id: InteractableId;
  chapter: CampaignChapterId;
  kind: InteractableKind;
  label: string;
  promptVerb: string;
  x: number;
  z: number;
  interactRadius: number;
  status: InteractableStatus;
  activationCount: number;
  activatedAtTime: number | null;
  prerequisiteInteractableId: InteractableId | null;
  unlocksObstacleId: string | null;
  grantsCodexId: CodexEntryId | null;
  completesObjectiveId: MissionObjectiveId | null;
  requiresActiveEcho: boolean;
  statusMessage: string;
}

export interface InteractionTargetEvaluation {
  interactableId: InteractableId | null;
  label: string;
  kind: InteractableKind | null;
  status: InteractionEvaluationStatus;
  canInteract: boolean;
  distance: number;
  promptText: string;
  detailText: string;
}

export type CodexEntryId =
  | 'CODEX-01'
  | 'CODEX-02'
  | 'CODEX-03'
  | 'CODEX-04'
  | 'CODEX-05'
  | 'CODEX-06'
  | 'CODEX-07'
  | 'CODEX-08';

export type CodexCategory =
  | 'system_diagnostic'
  | 'incident_report'
  | 'research_note'
  | 'personnel_log'
  | 'memory_trace';

export interface CodexEntryDefinition {
  id: CodexEntryId;
  chapter: CampaignChapterId;
  category: CodexCategory;
  categoryLabel: string;
  title: string;
  author: string;
  timestampCode: string;
  summary: string;
  body: readonly string[];
  tacticalNote: string;
}

export interface HudCodexEntryView {
  id: CodexEntryId;
  chapter: CampaignChapterId;
  category: CodexCategory;
  categoryLabel: string;
  locationTag: string;
  title: string;
  subtitle: string;
  author: string;
  timestampCode: string;
  discovered: boolean;
  summary: string;
  body: string[];
  tacticalNote: string;
}

// ============================================================================
// PHASE 19 — WORLD TRAVERSAL, ENVIRONMENTAL CHALLENGES, SECRETS & SECTOR MAP
// ============================================================================

export type SectorRegionId =
  | 'region_prologue_staging_deck'
  | 'region_prologue_west_lock'
  | 'region_prologue_east_bypass'
  | 'region_prologue_secret_alcove'
  | 'region_ch1_nexus_core'
  | 'region_ch1_nw_conduit_lane'
  | 'region_ch1_secret_armory'
  | 'region_ch2_garden_rotunda'
  | 'region_ch2_sw_echo_bridge'
  | 'region_ch2_secret_sanctum'
  | 'region_ch3_archive_nave'
  | 'region_ch3_sw_purge_lane'
  | 'region_ch3_secret_vault'
  | 'region_ch4_surgical_theater'
  | 'region_ch4_se_override_bay'
  | 'region_ch5_loom_sanctuary'
  | 'region_ch5_nw_anchor_bridge';

export type SectorRegionKind =
  | 'staging_deck'
  | 'combat_bay'
  | 'traversal_corridor'
  | 'secret_alcove';

export interface SectorRegionDefinition {
  id: SectorRegionId;
  chapter: CampaignChapterId;
  kind: SectorRegionKind;
  label: string;
  x: number;
  z: number;
  radius: number;
  secretAreaId?: SecretAreaId;
}

export type TraversalRouteId =
  | 'route_prologue_west_containment'
  | 'route_prologue_east_bypass'
  | 'route_ch1_nw_timed_conduit'
  | 'route_ch2_sw_echo_bridge'
  | 'route_ch3_sw_archive_passage'
  | 'route_ch4_se_quarantine_lane'
  | 'route_ch5_loom_anchor_bridge';

export type TraversalRouteChallengeKind =
  | 'power_reroute'
  | 'timed_energy_passage'
  | 'echo_conduit_bridge';

export type TraversalRouteStatus = 'locked' | 'powered' | 'open';

export interface TraversalRouteDefinition {
  id: TraversalRouteId;
  chapter: CampaignChapterId;
  label: string;
  challengeKind: TraversalRouteChallengeKind;
  fromX: number;
  fromZ: number;
  toX: number;
  toZ: number;
  obstacleId: string;
  requiresPrologueBarrierOpen?: boolean;
  prerequisiteInteractableId?: InteractableId;
  controlInteractableId?: InteractableId;
  hazardId?: TimedEnergyHazardId;
  secretAreaId?: SecretAreaId;
}

export interface TraversalRouteState {
  id: TraversalRouteId;
  chapter: CampaignChapterId;
  label: string;
  challengeKind: TraversalRouteChallengeKind;
  fromX: number;
  fromZ: number;
  toX: number;
  toZ: number;
  obstacleId: string;
  prerequisiteInteractableId: InteractableId | null;
  controlInteractableId: InteractableId | null;
  hazardId: TimedEnergyHazardId | null;
  secretAreaId: SecretAreaId | null;
  status: TraversalRouteStatus;
  unlocked: boolean;
  statusMessage: string;
}

export type TimedEnergyHazardId =
  | 'hazard_prologue_east_arc_vent'
  | 'hazard_ch1_nw_arc_lane'
  | 'hazard_ch3_sw_purge_lane';

export type TimedEnergyHazardPhase = 'safe' | 'warning' | 'active';

export interface TimedEnergyHazardDefinition {
  id: TimedEnergyHazardId;
  chapter: CampaignChapterId;
  label: string;
  x: number;
  z: number;
  radius: number;
  safeDuration: number;
  warningDuration: number;
  activeDuration: number;
  damage: number;
  hitCooldownSeconds: number;
  routeId: TraversalRouteId;
}

export interface TimedEnergyHazardState {
  id: TimedEnergyHazardId;
  chapter: CampaignChapterId;
  label: string;
  x: number;
  z: number;
  radius: number;
  phase: TimedEnergyHazardPhase;
  phaseTimer: number;
  cycleDuration: number;
  cycleTime: number;
  safeDuration: number;
  warningDuration: number;
  activeDuration: number;
  damage: number;
  hitCooldownSeconds: number;
  lastPlayerHitTime: number;
  cycleIndex: number;
  lastHitCycleIndex: number;
  lastThreadCycleIndex?: number;
  routeId: TraversalRouteId;
  active: boolean;
  warning: boolean;
}

export type SecretAreaId =
  | 'secret_prologue_calibration_alcove'
  | 'secret_ch1_marshal_armory_cache'
  | 'secret_ch2_hydroponic_echo_sanctum'
  | 'secret_ch3_lysa_unedited_vault';

export interface SecretAreaDefinition {
  id: SecretAreaId;
  chapter: CampaignChapterId;
  title: string;
  subtitle: string;
  x: number;
  z: number;
  radius: number;
  prerequisiteRouteId: TraversalRouteId;
  prerequisiteInteractableId: InteractableId;
  linkedCodexId: CodexEntryId;
  fluxRestoreAmount: number;
  integrityRestoreAmount: number;
  rewardSummary: string;
  discoveryMessage: string;
}

export interface SecretAreaState {
  id: SecretAreaId;
  chapter: CampaignChapterId;
  title: string;
  subtitle: string;
  x: number;
  z: number;
  radius: number;
  prerequisiteRouteId: TraversalRouteId;
  prerequisiteInteractableId: InteractableId;
  linkedCodexId: CodexEntryId;
  fluxRestoreAmount: number;
  integrityRestoreAmount: number;
  rewardSummary: string;
  discovered: boolean;
  accessible: boolean;
  discoveredAtTime: number | null;
}

export interface SecretDiscoveryBannerState {
  secretId: SecretAreaId;
  title: string;
  subtitle: string;
  rewardSummary: string;
  remainingTime: number;
}

export interface LocalMapRegionCell {
  id: SectorRegionId;
  label: string;
  kind: SectorRegionKind;
  x: number;
  z: number;
  radius: number;
  discovered: boolean;
  hiddenByFog: boolean;
  secretAreaId: SecretAreaId | null;
}

export interface LocalMapSnapshot {
  chapter: CampaignChapterId;
  sectorCode: string;
  sectorLabel: string;
  arenaRadius: number;
  currentRegionId: SectorRegionId;
  currentRegionLabel: string;
  playerX: number;
  playerZ: number;
  playerRotationY: number;
  objectiveTarget: {
    x: number;
    z: number;
    label: string;
  } | null;
  regions: LocalMapRegionCell[];
  routes: TraversalRouteState[];
  hazards: TimedEnergyHazardState[];
  secrets: SecretAreaState[];
  discoveredSecretsInChapter: number;
  totalSecretsInChapter: number;
  totalDiscoveredSecretsCampaign: number;
  totalSecretsCampaign: number;
  waypoint?: TacticalWaypointState | null;
  fluxPools?: Array<{
    id: string;
    x: number;
    z: number;
    radius: number;
    remainingRatio: number;
  }>;
  fragmentCaches?: ArenaFragmentCacheState[];
  sectorBeacons?: SectorTacticalBeaconState[];
  temporalRift?: ArenaTemporalRift | null;
  holoProjector?: {
    id: HoloMemoryId;
    label: string;
    x: number;
    z: number;
    discovered: boolean;
  } | null;
}

// ============================================================================
// PHASE 20 — CAMPAIGN CONTENT, NARRATIVE PROGRESSION & WORLD EXPERIENCE
// ============================================================================

export type NarrativeEventId =
  | 'nev_prologue_awakening'
  | 'nev_prologue_calibration_revelation'
  | 'nev_prologue_bay_diagnostic_evidence'
  | 'nev_prologue_echo_memory_trace'
  | 'nev_ch1_containment_arrival'
  | 'nev_ch1_lockdown_evidence'
  | 'nev_ch1_aegis_escalation'
  | 'nev_ch1_seal_recovered'
  | 'nev_ch2_garden_arrival'
  | 'nev_ch2_echo_memory_duet'
  | 'nev_ch2_acoustic_sanctum_discovery'
  | 'nev_ch2_choir_silenced'
  | 'nev_ch3_vault_arrival'
  | 'nev_ch3_lysa_audit_revelation'
  | 'nev_ch3_unindexed_alcove_memory'
  | 'nev_ch3_vault_purged'
  | 'nev_ch4_quarantine_arrival'
  | 'nev_ch4_excision_evidence'
  | 'nev_ch4_echo_collapse_protocol'
  | 'nev_ch4_quarantine_breached'
  | 'nev_ch5_loom_arrival'
  | 'nev_ch5_anchor_echo_memory'
  | 'nev_ch5_archive_convergence'
  | 'nev_ch5_final_resolution';

export type NarrativeEventTriggerKind =
  | 'chapter_arrival'
  | 'calibration_revelation'
  | 'environmental_discovery'
  | 'echo_memory_activated'
  | 'secret_discovered'
  | 'boss_phase_transition'
  | 'boss_defeat'
  | 'campaign_convergence'
  | 'campaign_resolution';

export type NarrativeEventCategory = 'main' | 'optional' | 'echo_memory';

export interface NarrativeEventDefinition {
  id: NarrativeEventId;
  chapter: CampaignChapterId;
  category: NarrativeEventCategory;
  triggerKind: NarrativeEventTriggerKind;
  title: string;
  subtitle: string;
  summary: string;
  commKey?: string;
  requiredRegionId?: SectorRegionId;
  requiredInteractableId?: InteractableId;
  requiredObjectiveId?: MissionObjectiveId;
  requiredSecretId?: SecretAreaId;
  requiredRouteId?: TraversalRouteId;
  requiresActiveEcho?: boolean;
  linkedCodexId?: CodexEntryId;
}

export interface NarrativeEventState {
  id: NarrativeEventId;
  chapter: CampaignChapterId;
  category: NarrativeEventCategory;
  triggerKind: NarrativeEventTriggerKind;
  title: string;
  subtitle: string;
  summary: string;
  completed: boolean;
  completedAtTime: number | null;
  linkedCodexId: CodexEntryId | null;
}

export interface ChapterWorldIdentityDefinition {
  chapter: CampaignChapterId;
  code: string;
  title: string;
  subtitle: string;
  locationLabel: string;
  themeLabel: string;
  coreFeeling: string;
  atmosphereSummary: string;
  architecturalMotif: string;
  environmentalStorytellingSummary: string;
  arrivalHeadline: string;
  arrivalSubtext: string;
  echoMemoryTitle: string;
  echoMemoryExcerpt: string;
}

export type CampaignSynthesisTier =
  | 'fragmented'
  | 'reconstructed'
  | 'complete_chronicle';

export interface CampaignEndingDiscoverySummary {
  completedChaptersCount: number;
  totalChaptersCount: number;
  recoveredLogsCount: number;
  totalLogsCount: number;
  discoveredCodexCount: number;
  totalCodexCount: number;
  discoveredSecretsCount: number;
  totalSecretsCount: number;
  unlockedRoutesCount: number;
  totalRoutesCount: number;
  completedNarrativeEventsCount: number;
  totalNarrativeEventsCount: number;
  discoveredEchoMemoriesCount: number;
  totalEchoMemoriesCount: number;
  lysaTruthUncovered: boolean;
  synthesisTier: CampaignSynthesisTier;
  synthesisHeadline: string;
  synthesisSummary: string;
}

export interface PersistedExplorationState {
  discoveredCodexIds: CodexEntryId[];
  completedObjectiveIds: MissionObjectiveId[];
  activatedNodeIds: InteractableId[];
  unlockedRouteIds: string[];
  discoveredRegionIds?: SectorRegionId[];
  discoveredSecretIds?: SecretAreaId[];
  completedNarrativeEventIds?: NarrativeEventId[];
  resolvedStoryChoices?: Partial<Record<StoryArcId, string>>;
  discoveredHoloMemoryIds?: HoloMemoryId[];
}

export interface NearbyExpansionPrompt {
  kind: 'fragment_cache' | 'sector_beacon' | 'temporal_rift' | 'holo_memory';
  id: string;
  label: string;
  promptText: string;
  detailText: string;
  ready: boolean;
  cooldown: number;
}

export interface WorldExplorationState {
  mission: MissionRuntimeState;
  interactables: EnvironmentalInteractableState[];
  prompt: InteractionTargetEvaluation;
  discoveredCodexIds: CodexEntryId[];
  completedObjectiveIds: MissionObjectiveId[];
  activatedNodeIds: InteractableId[];
  unlockedRouteIds: string[];
  discoveredRegionIds: SectorRegionId[];
  discoveredSecretIds: SecretAreaId[];
  completedNarrativeEventIds: NarrativeEventId[];
  narrativeEvents: NarrativeEventState[];
  lastTriggeredNarrativeEventId: NarrativeEventId | null;
  chapterIdentity: ChapterWorldIdentityDefinition;
  convergenceSummary: CampaignEndingDiscoverySummary;
  routes: TraversalRouteState[];
  hazards: TimedEnergyHazardState[];
  secrets: SecretAreaState[];
  localMap: LocalMapSnapshot;
  lastDiscoveryBanner: SecretDiscoveryBannerState | null;
  codexEntries: HudCodexEntryView[];
  newlyDiscoveredCodexId: CodexEntryId | null;
  statusBannerText: string;
  tacticalWaypoint?: TacticalWaypointState | null;
  resolvedStoryChoices?: Partial<Record<StoryArcId, string>>;
  storyArcs?: StoryArcState[];
  activeChapterStory?: StoryArcState | null;
  stanceSummary?: ChronicleStanceSummary;
  nearbyExpansionPrompt?: NearbyExpansionPrompt | null;
  discoveredHoloMemoryIds?: HoloMemoryId[];
  activeHoloMemoryId?: HoloMemoryId | null;
  activeHoloMemoryTimer?: number;
}

export interface WorldState {
  appState: GameAppState;
  encounterMode: EncounterMode;
  run: VerticalSliceRunState;
  tutorial: TutorialState;
  outcome: GameOutcome;
  outcomeDelayTimer: number;
  elapsedTime: number;
  hitstopTimer: number;
  cameraTrauma: number;
  player: PlayerState;
  projectiles: ProjectileState[];
  nextProjectileId: number;
  enemies: EnemyState[];
  boss: BossState | null;
  obstacles: ObstacleCollider[];
  boostPads?: ArenaBoostPad[];
  fluxPools?: ArenaFluxPool[];
  fragmentCaches?: ArenaFragmentCacheState[];
  sectorBeacons?: SectorTacticalBeaconState[];
  activeStoryBlessing?: 'flux_surge' | 'integrity_shield' | 'posture_edge' | null;
  temporalRift?: ArenaTemporalRift | null;
  riftCooldownTimer?: number;
  riftSpawnSeq?: number;
  artilleryZones?: ArenaArtilleryZone[];
  recursion?: RecursionRunState | null;
  overdrive: ChronoOverdriveState;
  gauntlet?: BossGauntletState | null;
  expedition?: ExpeditionState | null;
  paradox: ParadoxRuntimeState;
  ascension: AscensionRuntimeState;
  singularity?: SingularityCombatState;
  kineticOvercharge?: KineticOverchargeState;
  twinSync?: TwinSyncState;
  momentum?: ChronoMomentumState;
  nexus?: ChronoNexusState;
  weaponResonance?: WeaponResonanceState;
  chronoAegis?: ChronoAegisRuntimeState;
  chronoConfluence?: ChronoConfluenceState;
  echo: EchoSystemState;
  relay: RelaySystemState;
  resonance: ResonanceSystemState;
  pressurePlate: PressurePlateState;
  puzzle: ChronoPuzzleState;
  choir: ChoirState;
  curator: CuratorState;
  matron: MatronState;
  gravityPin: GravityPinState;
  echoCollapse: EchoCollapseState;
  loom: ChronicleLoomState;
  comms: NarrativeCommsState;
  progression: WeaponProgressionState;
  encounter: EncounterRuntimeState;
  exploration: WorldExplorationState;
  events: CombatEvent[];
  stats: {
    damageDealt: number;
    damageTaken: number;
    parriesLanded: number;
    perfectDodges?: number;
    vulnerableHits: number;
  };
  frozenSummary: RunSummary | null;
}

export interface HudBossSnapshot {
  id: string;
  name: string;
  subtitle: string;
  hp: number;
  maxHp: number;
  ghostHp: number;
  stagger: number;
  maxStagger: number;
  phase: BossPhase;
  aiState: BossAiState;
  activeAttack: BossAttackType | null;
  telegraphRatio: number;
  coreExposed: boolean;
  isResonanceMarked: boolean;
  resonanceRemaining: number;
  statusLabel: string;
  introRemaining?: number;
  introDuration?: number;
}

export interface HudSnapshot {
  appState: GameAppState;
  encounterMode: EncounterMode;
  run: VerticalSliceRunState;
  tutorial: TutorialState;
  outcome: GameOutcome;
  integrity: number;
  maxIntegrity: number;
  ghostIntegrity: number;
  flux: number;
  maxFlux: number;
  fluxDampenedTimer?: number;
  playerActionState: PlayerActionState;
  chargeRatio: number;
  comboStep: number;
  combatFlow?: {
    active: boolean;
    kind: 'none' | 'riposte' | 'chrono_slip' | 'relay_momentum' | 'quick_draw';
    label: string;
    riposteRemaining: number;
    chronoSlipRemaining?: number;
    relayMomentumRemaining: number;
    quickDrawRemaining: number;
    temporalSlipRemaining?: number;
    temporalSlipMax?: number;
  };
  liveRankForecast?: {
    grade: CombatMasteryGrade;
    score: number;
    hitless: boolean;
    nextGrade: CombatMasteryGrade | null;
    pointsToNext: number;
  };
  weapon: {
    equippedId: WeaponId;
    equippedWeaponId: WeaponId;
    equippedUpgradeId: WeaponUpgradeId | null;
    equippedUpgradeLabel: string | null;
    name: string;
    label: string;
    shortLabel: string;
    roleLabel: string;
    attackMode: WeaponAttackMode;
    primaryLabel: string;
    secondaryLabel: string;
    effectiveRange: number;
    heat: number;
    maxHeat: number;
    heatRatio: number;
    overheated: boolean;
    overheatTimer: number;
    shotCooldownTimer: number;
    switchCooldownTimer: number;
    canFire: boolean;
    canSwitch: boolean;
    lastShotOutcome: WeaponShotOutcome;
    statusLabel: string;
    activeProjectiles: number;
    activeVent?: {
      progress: number;
      windowStart: number;
      windowEnd: number;
      attempted: boolean;
      empoweredShots: number;
    };
  };
  adrenaline?: {
    tier: number;
    score: number;
    progressToNext: number;
    label: string;
    perkLabel: string;
    decayGraceTimer: number;
  };
  progression: HudWeaponProgressionSnapshot;
  encounter: EncounterRuntimeState;
  exploration: WorldExplorationState;
  temporalRift?: ArenaTemporalRift | null;
  recursion?: RecursionRunState | null;
  overdrive: ChronoOverdriveState;
  gauntlet?: BossGauntletState | null;
  expedition?: ExpeditionState | null;
  paradox?: ParadoxRuntimeState;
  ascension?: AscensionRuntimeState;
  singularity?: SingularityCombatState;
  kineticOvercharge?: KineticOverchargeState;
  twinSync?: TwinSyncState;
  momentum?: ChronoMomentumState;
  nexus?: ChronoNexusState;
  weaponResonance?: WeaponResonanceState;
  chronoAegis?: ChronoAegisRuntimeState;
  chronoConfluence?: ChronoConfluenceState;
  enemiesAlive: number;
  totalEnemies: number;
  objectiveText: string;
  objectiveSubtext: string;
  focusedEnemy: {
    id: string;
    name: string;
    archetype: EnemyArchetype;
    hp: number;
    maxHp: number;
    ghostHp: number;
    stagger: number;
    maxStagger: number;
    aiState: EnemyAIState;
    telegraphRatio: number;
    isResonanceMarked: boolean;
    resonanceRemaining: number;
    isDecoy?: boolean;
    pinnedTimer?: number;
    roleLabel: string;
    statusLabel: string;
    isFrontShieldActive: boolean;
    telegraphLocked: boolean;
    modifier?: EnemyModifierId | null;
    isTetherProtected?: boolean;
  } | null;
  boss: HudBossSnapshot | null;
  echo: {
    state: EchoLifecycleState;
    hasClip: boolean;
    recordingTime: number;
    maxDuration: number;
    playbackTime: number;
    clipDuration: number;
    statusMessage: string;
  };
  relay: {
    canRelay: boolean;
    status: RelayEvaluationStatus;
    lastOutcome: RelayAttemptOutcome;
    cooldownTimer: number;
    maxCooldown: number;
    fluxCost: number;
    distance: number;
    maxRange: number;
    landingX: number;
    landingZ: number;
    successFlashActive: boolean;
    statusMessage: string;
    activationCount: number;
  };
  resonance: {
    status: ResonanceStatus;
    primed: boolean;
    targetEnemyId: string | null;
    targetEnemyName: string | null;
    remainingWindow: number;
    maxWindow: number;
    cooldownTimer: number;
    maxCooldown: number;
    fluxCost: number;
    canConverge: boolean;
    primedCount: number;
    convergenceCount: number;
    lastOutcome: ResonanceOutcome;
    flashActive: boolean;
    statusMessage: string;
  };
  pressurePlate: {
    label: string;
    active: boolean;
    barrierOpen: boolean;
    receiverLabel: string;
  };
  puzzle: {
    stage: PuzzleStage;
    teachCompleted: boolean;
    testCompleted: boolean;
    combineCompleted: boolean;
    completed: boolean;
    teachPlateActive: boolean;
    teachBarrierOpen: boolean;
    receiverLabel: string;
    receiverCharged: boolean;
    receiverChargeTimer: number;
    receiverChargeDuration: number;
    combinePlateLabel: string;
    combinePlateActive: boolean;
    finalBarrierLabel: string;
    finalBarrierOpen: boolean;
  };
  choir: ChoirState;
  curator: CuratorState;
  matron: MatronState;
  gravityPin: GravityPinState;
  echoCollapse: EchoCollapseState;
  loom: ChronicleLoomState;
  comms: NarrativeCommsState;
  threats?: HudPeripheralThreat[];
  radar?: HudRadarSnapshot;
  lockOn?: {
    active: boolean;
    targetId: string | null;
    targetName: string | null;
    isBoss: boolean;
    isStaggered: boolean;
    canExecute: boolean;
    executeTargetName: string | null;
  };
  elapsedTime: number;
  summary: RunSummary | null;
}

export interface HudPeripheralThreat {
  id: string;
  angleDeg: number;
  severity: 'urgent' | 'telegraph' | 'hostile';
  distance: number;
  isBoss: boolean;
}

export type RadarBlipKind = 'boss' | 'staggered' | 'telegraph' | 'enemy' | 'interactable';

export interface HudRadarBlip {
  id: string;
  kind: RadarBlipKind;
  x: number;
  z: number;
  distance: number;
}

export interface HudRadarObstacle {
  id: string;
  x: number;
  z: number;
  radius: number;
  kind: ObstacleKind;
  destructible: boolean;
  hpRatio: number;
}

export interface HudRadarBoostPad {
  id: string;
  x: number;
  z: number;
  ready: boolean;
}

export interface HudRadarSnapshot {
  arenaRadius: number;
  playerX: number;
  playerZ: number;
  aimYaw: number;
  playerRotationY: number;
  echoActive: boolean;
  echoX: number | null;
  echoZ: number | null;
  objectiveX: number | null;
  objectiveZ: number | null;
  blips: HudRadarBlip[];
  obstacles?: HudRadarObstacle[];
  boostPads?: HudRadarBoostPad[];
  fluxPools?: Array<{
    id: string;
    x: number;
    z: number;
    radius: number;
    remainingRatio: number;
  }>;
  fragmentCaches?: Array<{
    id: string;
    label: string;
    x: number;
    z: number;
    claimed: boolean;
  }>;
  sectorBeacons?: Array<{
    id: string;
    label: string;
    x: number;
    z: number;
    ready: boolean;
  }>;
  temporalRift?: ArenaTemporalRift | null;
  waypoint?: TacticalWaypointState | null;
  holoProjector?: {
    id: HoloMemoryId;
    label: string;
    x: number;
    z: number;
    discovered: boolean;
  } | null;
}
