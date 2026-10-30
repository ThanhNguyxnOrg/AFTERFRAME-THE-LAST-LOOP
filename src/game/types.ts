export type GameAppState = 'title' | 'playing' | 'paused' | 'gameover';

export type GameOutcome = 'none' | 'victory' | 'defeat';

export type WeaponId = 'chrono_edge' | 'pulsecaster';

export type WeaponAttackMode = 'melee' | 'ranged' | 'pulse_light' | 'pulse_heavy';

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
  | 'pulse_overcharge_condenser';

export type WeaponProgressionRewardId =
  | 'prologue_calibration_teach'
  | 'prologue_calibration_test'
  | 'prologue_calibration_combine'
  | 'prologue_bay_proxies_cleared'
  | 'chapter_1_helix_defeated'
  | 'chapter_2_choir_defeated'
  | 'chapter_3_curator_defeated'
  | 'chapter_4_matron_defeated';

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

export interface PersistedWeaponProgressionState {
  memoryFragments: number;
  claimedRewardIds: WeaponProgressionRewardId[];
  purchasedUpgrades: WeaponUpgradeId[];
  equippedUpgrades: Record<WeaponId, WeaponUpgradeId | null>;
}

export interface WeaponProgressionState extends PersistedWeaponProgressionState {
  lastPurchaseOutcome: UpgradePurchaseOutcome | null;
  lastEquipOutcome: UpgradeEquipOutcome | null;
  lastActionMessage: string;
}

export interface HudWeaponProgressionSnapshot {
  memoryFragments: number;
  claimedRewardIds: WeaponProgressionRewardId[];
  purchasedUpgrades: WeaponUpgradeId[];
  equippedUpgrades: Record<WeaponId, WeaponUpgradeId | null>;
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
  attackMode: 'pulse_light' | 'pulse_heavy';
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
  | 'helix'
  | 'choir'
  | 'curator'
  | 'curator_decoy'
  | 'matron'
  | 'siphon'
  | 'eraser';

export type BossId = 'helix-04' | 'the-choir' | 'the-curator' | 'matron-v';
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

export type RunMode = 'campaign' | 'practice_standard' | 'practice_boss';

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
}

export interface PersistedActiveCampaignState {
  chapter: CampaignChapterId;
  stage: VerticalSliceStage;
  pendingNextChapter: CampaignChapterId | null;
  bossCheckpoint: BossCheckpointState | null;
  selectedEnding: ChronicleLoomEndingId | null;
  equippedWeaponId?: WeaponId;
  progression?: PersistedWeaponProgressionState;
}

export interface PersistedCampaignSaveV2 {
  version: 2;
  unlockedChapters: CampaignChapterId[];
  completedChapters: CampaignChapterId[];
  recoveredLogs: string[];
  completedEndings: ChronicleLoomEndingId[];
  activeCampaign: PersistedActiveCampaignState | null;
  progression?: PersistedWeaponProgressionState;
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
  | 'chrono_sever';

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

export interface ObstacleCollider {
  id: string;
  x: number;
  z: number;
  radius: number;
  height: number;
  label: string;
  disabled?: boolean;
}

export interface CameraSettings {
  sensitivity: number; // 0.3 to 2.5, default 1.0
  invertY: boolean; // default false
  reducedMotion: boolean;
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
    | 'eraser_echo_disrupted'
    | 'matron_chrono_sever'
    | 'echo_collapse_detonated'
    | 'echo_collapse_rejected'
    | 'campaign_chapter_advanced'
    | 'chronicle_loom_ending_selected'
    | 'comms_transmission_started'
    | 'weapon_switched'
    | 'player_pulse_shot'
    | 'player_pulse_heavy_shot'
    | 'pulse_overheated'
    | 'pulse_overheat_cleared'
    | 'pulse_impact_obstacle'
    | 'progression_reward_granted'
    | 'weapon_upgrade_purchased'
    | 'weapon_upgrade_equipped'
    | 'weapon_upgrade_rejected'
    | 'encounter_wave_started';
  x: number;
  z: number;
  originX?: number;
  originZ?: number;
  amount?: number;
  postureBonus?: number;
  isCriticalOrVulnerable?: boolean;
  isHeavy?: boolean;
  isGuarded?: boolean;
  enemyId?: string;
  weaponId?: WeaponId;
  upgradeId?: WeaponUpgradeId | null;
  rewardId?: WeaponProgressionRewardId;
  echoAction?: EchoRecordedActionType;
  relayStatus?: RelayEvaluationStatus;
  resonanceOutcome?: ResonanceOutcome;
  bossAttack?: BossAttackType;
  bossPhase?: BossPhase;
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
  | 'tactical_mastery_gauntlet';

export interface EncounterWaveUnitSpec {
  id: string;
  archetype: EnemyArchetype;
  name: string;
  x: number;
  z: number;
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
  events: CombatEvent[];
  stats: {
    damageDealt: number;
    damageTaken: number;
    parriesLanded: number;
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
  playerActionState: PlayerActionState;
  chargeRatio: number;
  comboStep: number;
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
  };
  progression: HudWeaponProgressionSnapshot;
  encounter: EncounterRuntimeState;
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
  elapsedTime: number;
  summary: RunSummary | null;
}
