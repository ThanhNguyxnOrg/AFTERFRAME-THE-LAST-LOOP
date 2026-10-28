import { GAME_CONFIG } from './config.ts';
import type {
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
  ChronoPuzzleState,
  CombatEvent,
  CombineBarrierState,
  CuratorState,
  EchoClip,
  EchoCollapseState,
  EchoRecordedActionEvent,
  EchoRecordedActionType,
  EchoSample,
  EchoSystemState,
  EncounterMode,
  EnemyArchetype,
  EnemyState,
  GameAppState,
  GravityPinState,
  HarmonicNodeState,
  HeavyReceiverState,
  HudBossSnapshot,
  HudSnapshot,
  MatronState,
  NarrativeCommsState,
  NarrativeTransmission,
  ObstacleCollider,
  PlayerInputFrame,
  PlayerState,
  PressurePlateState,
  ReconstructedAttackTrace,
  RelayEvaluationStatus,
  RelaySystemState,
  RelayTargetEvaluation,
  ResonanceMarkState,
  ResonanceOutcome,
  ResonanceSystemState,
  RunMode,
  RunSummary,
  SavedCampaignProgressSnapshot,
  TutorialState,
  TutorialStep,
  VerticalSliceRunState,
  VerticalSliceStage,
  WorldState,
} from './types.ts';

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
  echoRecordJustPressed: false,
  echoPlayJustPressed: false,
  echoClearJustPressed: false,
  echoRelayJustPressed: false,
  gravityPinJustPressed: false,
  echoCollapseJustPressed: false,
};

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
  const fluxCost = GAME_CONFIG.relay.fluxCost;
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

  // Deduct Flux once and start cooldown
  p.flux = Math.max(0, p.flux - GAME_CONFIG.relay.fluxCost);
  world.relay.cooldownTimer = GAME_CONFIG.relay.cooldown;

  // Move live Sera to the validated safe landing coordinate & clear stale horizontal velocity
  p.x = evaluation.landingX;
  p.z = evaluation.landingZ;
  p.vx = 0;
  p.vz = 0;
  p.squashX = 0.86;
  p.squashY = 1.16;

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
      'Use the bottom-left 4-button directional pad ([W] FWD, [A] LEFT, [S] BACK, [D] RIGHT) to move Sera through Calibration Bay 04.',
    stuckHint:
      'Press [W], [A], [S], or [D] (or tap the [W] / [A] / [S] / [D] directional buttons) to step forward into Calibration Bay 04.',
  },
  combat_basics: {
    title: 'STEP 02 · CHRONO EDGE COMBAT PROTOCOL',
    desktopPrompt:
      'Light Strike [LMB / F], Heavy Cleave [Hold LMB / E / R-Click], Phase Dodge [Space], Timed Parry [Q].',
    mobilePrompt:
      'Tap [LIGHT] or [HEAVY] to strike, [DODGE] to evade telegraphs, and [PARRY] (+35 Flux) on incoming swings.',
    stuckHint:
      'Perform any attack ([F] / [E]) or defensive maneuver ([Space] / [Q]) to verify Chrono Edge responsiveness.',
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

export function createInitialWorld(initialAppState: GameAppState = 'title'): WorldState {
  const plateCfg = GAME_CONFIG.arena.chronoPlate;
  const finalBarrierCfg = GAME_CONFIG.arena.chronoPuzzle.finalBarrier;
  const obstacles: ObstacleCollider[] = [
    ...GAME_CONFIG.arena.obstacles.map((o) => ({ ...o, disabled: false })),
    {
      id: plateCfg.receiverId,
      x: plateCfg.receiverX,
      z: plateCfg.receiverZ,
      radius: plateCfg.receiverRadius,
      height: plateCfg.receiverHeight,
      label: plateCfg.receiverLabel,
      disabled: false,
    },
    {
      id: finalBarrierCfg.id,
      x: finalBarrierCfg.x,
      z: finalBarrierCfg.z,
      radius: finalBarrierCfg.radius,
      height: finalBarrierCfg.height,
      label: finalBarrierCfg.label,
      disabled: false,
    },
  ];

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
    enemies,
    boss: null,
    obstacles,
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
    };
  }
  if (world.run.mode === 'campaign' && !world.run.isChapterReplay) {
    if (world.run.selectedEnding !== null) {
      return null;
    }
    return {
      chapter: world.run.chapter,
      stage: world.run.stage,
      unlockedChapters: [...world.run.unlockedChapters],
      completedChapters: [...world.run.completedChapters],
      recoveredLogs: [...(world.run.recoveredLogs ?? [])],
      completedEndings: [...(world.run.completedEndings ?? [])],
      pendingNextChapter: world.run.pendingNextChapter,
      bossCheckpoint: world.run.bossCheckpoint
        ? {
            ...world.run.bossCheckpoint,
            statsAtCheckpoint: { ...world.run.bossCheckpoint.statsAtCheckpoint },
          }
        : null,
      selectedEnding: world.run.selectedEnding,
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

  const choirState = createInitialChoirState(isChoir);
  const curatorState = createInitialCuratorState(isCurator);
  const matronState = createInitialMatronState(isMatron);
  const gravityPinState = createInitialGravityPinState(isCurator || isMatron);
  const echoCollapseState = createInitialEchoCollapseState(isMatron);
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
  world.player = fresh.player;
  // Position Sera in the central combat lane facing North toward the Boss
  world.player.x = 0;
  world.player.z = 5.2;
  world.player.rotationY = Math.PI;
  world.enemies = enemies;
  world.boss = boss;
  world.obstacles = fresh.obstacles.map((o) =>
    o.id === 'loom-pylon' ? { ...o, disabled: true } : o
  );
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

export function startCampaignRun(world: WorldState, skipIntro = false): void {
  const preserveTutorialEnabled = world.tutorial ? world.tutorial.enabled : true;
  const preservedCompletedEndings = world.run?.completedEndings
    ? [...world.run.completedEndings]
    : [];
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
  world.enemies = fresh.enemies;
  world.boss = null;
  world.obstacles = fresh.obstacles;
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
  world.events = [];
  triggerNarrativeTransmission(world, 'prologue_wake', true);
  world.stats = fresh.stats;
  world.frozenSummary = null;
}

export function startPracticeStandardRun(world: WorldState): void {
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
  world.player = fresh.player;
  world.enemies = fresh.enemies;
  world.boss = null;
  world.obstacles = fresh.obstacles;
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
  world.events = [];
  triggerNarrativeTransmission(world, 'prologue_wake', true);
  world.stats = fresh.stats;
  world.frozenSummary = null;
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
  const syncedFlux = Math.max(GAME_CONFIG.verticalSlice.bossCheckpointMinFluxFloor, rawFlux);

  return {
    chapter,
    bossId,
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
  // Cleanly terminate any active Echo recording/playback or pending marks before transitioning
  clearEchoState(world, 'outcome');
  world.resonance.activeMark = null;
  world.resonance.status = 'idle';
  world.resonance.cooldownTimer = 0;
  world.resonance.flashTimer = 0;

  // Halt any remaining standard security proxies so no stray hit occurs during transition
  for (let i = 0; i < world.enemies.length; i++) {
    const e = world.enemies[i];
    if (e.aiState !== 'ko') {
      e.aiState = 'pursue';
      e.vx = 0;
      e.vz = 0;
      e.cooldownTimer = 10;
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
    world.run.completedChapters = addUniqueChapter(
      world.run.completedChapters,
      'prologue'
    );
    world.run.unlockedChapters = addUniqueChapter(
      world.run.unlockedChapters,
      'chapter_1_helix'
    );
    world.run.recoveredLogs = addUniqueString(
      world.run.recoveredLogs ?? [],
      'LOG-00'
    );
    world.run.pendingNextChapter = 'chapter_1_helix';
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
      completedChapters = addUniqueChapter(completedChapters, 'prologue');
      recoveredLogs = addUniqueString(recoveredLogs, 'LOG-00');
    }
    unlockedChapters = addUniqueChapter(unlockedChapters, targetChapter);
  }

  startBossEncounter(world, skipBossIntro, bossId);

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

  // Restore exact checkpoint Integrity, Flux, and pre-boss campaign telemetry
  world.player.integrity = checkpoint.integrity;
  world.player.ghostIntegrity = checkpoint.integrity;
  world.player.flux = checkpoint.flux;
  world.elapsedTime = checkpoint.elapsedTimeAtCheckpoint;
  world.stats = {
    damageDealt: checkpoint.statsAtCheckpoint.damageDealt,
    damageTaken: checkpoint.statsAtCheckpoint.damageTaken,
    parriesLanded: checkpoint.statsAtCheckpoint.parriesLanded,
    vulnerableHits: checkpoint.statsAtCheckpoint.vulnerableHits,
  };
  world.resonance.convergenceCount = checkpoint.statsAtCheckpoint.convergencesTriggered;
  world.relay.activationCount = checkpoint.statsAtCheckpoint.relaysUsed;
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
  world.enemies = [];
  world.boss = null;
  world.obstacles = fresh.obstacles;
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
      statsAtCheckpoint: { ...checkpoint.statsAtCheckpoint },
    },
    checkpointNotice: 'CHRONICLE LOOM CORE ACCESSED · SELECT FINAL PROTOCOL DIRECTIVE',
    checkpointNoticeTimer: 6.0,
  };
  world.tutorial = createInitialTutorialState(
    preserveTutorialEnabled,
    'chronicle_loom_choice'
  );
  triggerNarrativeTransmission(world, 'chapter5_loom_arrival', true);
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
    for (let i = 0; i < a.length; i++) {
      if (isValidCampaignChapterId(a[i])) {
        out = addUniqueChapter(out, a[i]);
      }
    }
  }
  if (b) {
    for (let i = 0; i < b.length; i++) {
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
    for (let i = 0; i < a.length; i++) {
      if (validator(a[i])) {
        out = addUniqueString(out, a[i]);
      }
    }
  }
  if (b) {
    for (let i = 0; i < b.length; i++) {
      if (validator(b[i])) {
        out = addUniqueString(out, b[i]);
      }
    }
  }
  return out as T[];
}

export function parseAndApplyCampaignProgress(
  world: WorldState,
  rawJson: string | null | undefined
): boolean {
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

  if (!rawJson || typeof rawJson !== 'string') {
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

  if (Array.isArray(obj.unlockedChapters)) {
    for (let i = 0; i < obj.unlockedChapters.length; i++) {
      const ch = obj.unlockedChapters[i];
      if (isValidCampaignChapterId(ch)) {
        world.run.unlockedChapters = addUniqueChapter(world.run.unlockedChapters, ch);
      }
    }
  }

  if (Array.isArray(obj.completedChapters)) {
    for (let i = 0; i < obj.completedChapters.length; i++) {
      const ch = obj.completedChapters[i];
      if (isValidCampaignChapterId(ch)) {
        world.run.completedChapters = addUniqueChapter(world.run.completedChapters, ch);
      }
    }
  }

  if (Array.isArray(obj.recoveredLogs)) {
    for (let i = 0; i < obj.recoveredLogs.length; i++) {
      const logId = obj.recoveredLogs[i];
      if (isValidArchiveLogId(logId)) {
        world.run.recoveredLogs = addUniqueString(world.run.recoveredLogs, logId);
      }
    }
  }

  if (Array.isArray(obj.completedEndings)) {
    for (let i = 0; i < obj.completedEndings.length; i++) {
      const endingId = obj.completedEndings[i];
      if (isValidChronicleLoomEndingId(endingId)) {
        world.run.completedEndings = addUniqueString(
          world.run.completedEndings,
          endingId
        ) as ChronicleLoomEndingId[];
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
  }

  return true;
}

export function serializeCampaignProgress(world: WorldState): string {
  const snap = world.run?.savedCampaignSnapshot;
  const unlockedChapters = mergeUniqueChapters(
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

  return JSON.stringify({
    unlockedChapters,
    completedChapters,
    recoveredLogs,
    completedEndings,
  });
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
  const isReplay = isSnapshotLaterOrChapterCompleted(chapter, candidateSnap);
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
    startCampaignRun(world, skipIntro);
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
  world.player.integrity = GAME_CONFIG.player.maxIntegrity;
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
  const pending = snap.pendingNextChapter;
  const savedCheckpoint = snap.bossCheckpoint
    ? {
        ...snap.bossCheckpoint,
        statsAtCheckpoint: { ...snap.bossCheckpoint.statsAtCheckpoint },
      }
    : null;

  if (snap.chapter === 'prologue') {
    startCampaignRun(world, true);
  } else if (snap.chapter === 'chapter_5_loom') {
    world.run.bossCheckpoint = savedCheckpoint;
    enterChronicleLoomChapter(world, false);
  } else {
    world.run.bossCheckpoint = savedCheckpoint;
    transitionCampaignToBoss(world, true, snap.chapter);
  }

  world.run.mode = 'campaign';
  world.run.chapter = snap.chapter;
  world.run.stage = snap.stage === 'boss_intro' ? 'boss_fight' : snap.stage;
  world.run.unlockedChapters = unlocked;
  world.run.completedChapters = completed;
  world.run.recoveredLogs = recoveredLogs;
  world.run.completedEndings = completedEndings;
  world.run.pendingNextChapter = pending;
  world.run.bossCheckpoint = savedCheckpoint;
  world.run.selectedEnding = snap.selectedEnding;
  world.run.isChapterReplay = false;
  world.run.savedCampaignSnapshot = null;

  if (savedCheckpoint) {
    world.player.integrity = savedCheckpoint.integrity;
    world.player.ghostIntegrity = savedCheckpoint.integrity;
    world.player.flux = savedCheckpoint.flux;
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
  if (
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
  }
  world.outcome = 'victory';
  world.run.stage = 'completed';
  world.outcomeDelayTimer = 0;
  clearEchoState(world, 'outcome');
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
              : 'PHASE I · CONTAINMENT PROTOCOL';
    }
    return true;
  }
  return false;
}

export function retryBossFromCheckpoint(world: WorldState, skipBossIntro = false): void {
  if (world.run.mode === 'campaign' && world.run.bossCheckpoint) {
    const targetChapter = world.run.bossCheckpoint.chapter ?? world.run.chapter ?? 'chapter_1_helix';
    if (targetChapter === 'chapter_5_loom') {
      enterChronicleLoomChapter(world, world.run.isChapterReplay);
      return;
    }
    transitionCampaignToBoss(world, skipBossIntro, targetChapter);
    const cp = world.run.bossCheckpoint!;
    world.run.checkpointNotice = `CHECKPOINT RESTORED · INTEGRITY ${cp.integrity} · FLUX ${cp.flux}`;
    world.run.checkpointNoticeTimer = 4.0;
    return;
  }
  const currentBossId = (world.boss?.id as BossId | undefined) ?? 'helix-04';
  startPracticeBossRun(world, skipBossIntro, currentBossId);
}

export function resetWorldForPlaying(world: WorldState): void {
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
    startCampaignRun(world, true);
    return;
  }
  startPracticeStandardRun(world);
}

export function resetWorldForStandardPlaying(world: WorldState): void {
  startPracticeStandardRun(world);
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
    echoRecordJustPressed: false,
    echoPlayJustPressed: false,
    echoClearJustPressed: false,
    echoRelayJustPressed: false,
    gravityPinJustPressed: false,
    echoCollapseJustPressed: false,
  };
}

function resolveCircleObstacleCollisions(
  entity: { x: number; z: number; radius: number },
  obstacles: ObstacleCollider[],
  arenaRadius: number
): void {
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
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

function capturePlayerEchoSample(player: PlayerState, t: number): EchoSample {
  return {
    t,
    x: player.x,
    z: player.z,
    rotationY: player.rotationY,
    actionState: player.actionState,
    gaitPhase: player.gaitPhase,
    comboIndex: player.comboIndex,
    chargeRatio: Math.min(
      1,
      player.chargeTime / GAME_CONFIG.player.heavyAttack.chargeThreshold
    ),
    isEmpoweredHeavy: player.isEmpoweredHeavy,
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
  echo.recordingSamples = [capturePlayerEchoSample(world.player, 0)];
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
  const finalSample = capturePlayerEchoSample(world.player, duration);
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
    };
  }
  if (t <= samples[0].t || samples.length === 1) {
    return { ...samples[0], t: Math.max(0, t) };
  }
  const last = samples[samples.length - 1];
  if (t >= last.t) {
    return { ...last, t: clip.duration };
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
  };
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
    elapsed: 0,
    duration: clip.duration,
  };
  echo.statusMessage = `ECHO REPLAYING (${clip.duration.toFixed(1)}s)...`;

  world.events.push({
    type: 'echo_playback_started',
    x: pose0.x,
    z: pose0.z,
  });

  // Fire any action events recorded at t === 0
  while (
    echo.nextEventIndex < clip.events.length &&
    clip.events[echo.nextEventIndex].t <= 1e-6
  ) {
    const ev = clip.events[echo.nextEventIndex];
    echo.nextEventIndex += 1;
    world.events.push({
      type: 'echo_action_visual',
      x: ev.x,
      z: ev.z,
      isHeavy: ev.action === 'heavy_swing',
      echoAction: ev.action,
    });
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

  if (distToPad <= receiver.radius) {
    if (ev.action !== 'heavy_swing') {
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
      world.puzzle.testCompleted = true;
      world.echo.statusMessage =
        'KINETIC RECEIVER CHARGED · HOLD ANCHOR PAD WITH ECHO TO OPEN ARCHIVE BARRIER';
      world.events.push({
        type: 'echo_receiver_activated',
        x: receiver.targetX,
        z: receiver.targetZ,
        isHeavy: true,
        echoAction: 'heavy_swing',
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
        echoAction: 'heavy_swing',
      });
    }
  } else if (ev.action === 'heavy_swing') {
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
  attackerYaw: number
): { target: EnemyState | null; outcome: 'found' | 'out_of_range' | 'line_of_sight_blocked' } {
  const range = GAME_CONFIG.player.heavyAttack.range;
  const arcRadians = GAME_CONFIG.player.heavyAttack.arcRadians;

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
    if (ev.action !== 'heavy_swing' && ev.action !== 'light_swing') continue;

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

    let closestNode: HarmonicNodeState | null = null;
    let bestDist = Infinity;
    for (let n = 0; n < choir.nodes.length; n++) {
      const node = choir.nodes[n];
      const dist = Math.hypot(contactX - node.x, contactZ - node.z);
      if (dist <= strikeRange && dist < bestDist) {
        bestDist = dist;
        closestNode = node;
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
    if (ev.action !== 'heavy_swing') continue;

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

    const query = queryEchoResonanceTarget(world, contactX, contactZ, contactYaw);
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
    const syncWindow = GAME_CONFIG.resonance.syncWindow;
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

  if (echo.state === 'recording') {
    echo.recordingTime += dt;
    const lastSample = echo.recordingSamples[echo.recordingSamples.length - 1];
    if (
      (!lastSample ||
        echo.recordingTime - lastSample.t >= GAME_CONFIG.echo.sampleInterval - 1e-5) &&
      echo.recordingSamples.length < GAME_CONFIG.echo.maxSamples
    ) {
      echo.recordingSamples.push(
        capturePlayerEchoSample(world.player, Math.min(echo.maxDuration, echo.recordingTime))
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
      world.events.push({
        type: 'echo_action_visual',
        x: ev.x,
        z: ev.z,
        isHeavy: ev.action === 'heavy_swing',
        echoAction: ev.action,
      });
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
  const cfg = GAME_CONFIG.player.lightAttack;

  if (p.comboWindowTimer > 0 && p.comboIndex < 2) {
    p.comboIndex += 1;
  } else {
    p.comboIndex = 0;
  }
  p.comboWindowTimer = 0;

  p.rotationY = resolveCombatAimAngle(world, input, moveVec, 4.6);

  p.actionState = 'light_windup';
  p.stateTimer = cfg.windup[p.comboIndex] ?? 0.09;
  p.attackHitIds = [];
  p.currentAttackStartedAt = world.elapsedTime;
  p.currentAttackMarkId = world.resonance.activeMark?.markId ?? null;
  p.squashX = 0.9;
  p.squashY = 1.1;

  recordEchoActionEvent(world, 'light_swing');
}

function startHeavyWindup(
  world: WorldState,
  input: PlayerInputFrame,
  moveVec: { dirX: number; dirZ: number; length: number }
): void {
  const p = world.player;
  const cfg = GAME_CONFIG.player.heavyAttack;

  if (p.actionState !== 'charging_heavy') {
    p.currentAttackStartedAt = world.elapsedTime;
    p.currentAttackMarkId = world.resonance.activeMark?.markId ?? null;
  }

  p.rotationY = resolveCombatAimAngle(world, input, moveVec, 5.2);

  // When a Resonance mark is active, reserve Flux for Convergence impact rather than spending 35 upfront
  const hasActiveResonanceMark =
    world.resonance.activeMark !== null && world.resonance.cooldownTimer <= 0;
  p.isEmpoweredHeavy = !hasActiveResonanceMark && p.flux >= cfg.fluxCostForEmpower;
  if (p.isEmpoweredHeavy) {
    p.flux = Math.max(0, p.flux - cfg.fluxCostForEmpower);
  }

  p.actionState = 'heavy_windup';
  p.stateTimer = cfg.windup;
  p.chargeTime = 0;
  p.comboWindowTimer = 0;
  p.attackHitIds = [];
  p.squashX = 0.84;
  p.squashY = 1.18;

  recordEchoActionEvent(world, 'heavy_swing');

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
  if (moveVec.length > 0.1) {
    p.rotationY = Math.atan2(moveVec.dirX, moveVec.dirZ);
  }
  p.actionState = 'dodging';
  p.stateTimer = cfg.duration;
  p.invulnTimer = Math.max(p.invulnTimer, cfg.invulnDuration);
  p.dodgeCooldownTimer = cfg.cooldown;
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

export function isQualifyingConvergenceAttack(player: PlayerState, isHeavy: boolean): boolean {
  if (isHeavy || player.actionState === 'heavy_active') return true;
  if (player.actionState === 'light_active' && player.comboIndex === 2) return true;
  return false;
}

export function isBossArchetype(archetype: EnemyArchetype): boolean {
  return (
    archetype === 'helix' ||
    archetype === 'choir' ||
    archetype === 'curator' ||
    archetype === 'matron'
  );
}

function evaluateLivePlayerStrikeOnChoirNodes(world: WorldState, isHeavy: boolean): void {
  const choir = world.choir;
  if (!choir.active || world.outcome !== 'none') return;

  const p = world.player;
  const range = isHeavy
    ? GAME_CONFIG.player.heavyAttack.range
    : GAME_CONFIG.player.lightAttack.range;
  const arcRadians = isHeavy
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

  // Consume Flux, start cooldown, and consume the active Echo playback (preserving the recorded clip for future replay)
  p.flux = Math.max(0, p.flux - ec.fluxCost);
  ec.cooldownTimer = ec.maxCooldown;
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

  let hitCount = 0;
  for (let i = 0; i < world.enemies.length; i++) {
    const enemy = world.enemies[i];
    if (enemy.hp <= 0 || enemy.aiState === 'ko') continue;
    const dist = Math.hypot(enemy.x - echoX, enemy.z - echoZ);
    if (dist > ec.blastRadius + enemy.radius) continue;

    hitCount += 1;
    const isBoss = world.boss !== null && world.boss.id === enemy.id;
    const dmg = ec.damage;

    enemy.hp = Math.max(0, enemy.hp - dmg);
    enemy.hitFlashTimer = 0.24;
    world.stats.damageDealt += dmg;

    if (enemy.hp > 0) {
      enemy.stagger = Math.min(enemy.maxStagger, enemy.stagger + ec.postureDamage);
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
  if (gp.cooldownTimer > 0) {
    gp.cooldownTimer = Math.max(0, gp.cooldownTimer - dt);
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
          const bossEnemy = world.enemies.find((e) => e.id === 'the-curator');
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
  if (ec.cooldownTimer > 0) {
    ec.cooldownTimer = Math.max(0, ec.cooldownTimer - dt);
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

function getBossPhase2Threshold(bossId: string): number {
  if (bossId === 'the-choir') return GAME_CONFIG.choir.phase2HpThreshold;
  if (bossId === 'the-curator') return GAME_CONFIG.curator.phase2HpThreshold;
  if (bossId === 'matron-v') return GAME_CONFIG.matron.phase2HpThreshold;
  return GAME_CONFIG.boss.phase2HpThreshold;
}

function checkAndTriggerBossPhase2(
  world: WorldState,
  bossState: BossState,
  enemy: EnemyState
): void {
  const threshold = getBossPhase2Threshold(bossState.id);
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
    bossState.shockwaveMaxRadius = GAME_CONFIG.boss.attacks.anchor_slam.outerRadiusP2;
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
            : 'PHASE II · HELIX OVERLOAD INITIATED';

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
            : 'chapter1_phase2';
    triggerNarrativeTransmission(world, phase2CommKey, true);

    world.events.push({
      type: 'boss_phase_transition',
      x: enemy.x,
      z: enemy.z,
      enemyId: enemy.id,
      bossPhase: 2,
    });
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

  const bossState =
    world.boss && world.boss.id === enemy.id ? world.boss : null;
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
            : 'HELIX-04 NEUTRALIZED · CONTAINMENT CORE OFFLINE';

    // When a boss is defeated, also neutralize any remaining support units/decoys in the boss arena
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

    const defeatCommKey: NarrativeCommKey =
      bossState.id === 'the-choir'
        ? 'chapter2_defeat'
        : bossState.id === 'the-curator'
          ? 'chapter3_defeat'
          : bossState.id === 'matron-v'
            ? 'chapter4_defeat'
            : 'chapter1_defeat';
    triggerNarrativeTransmission(world, defeatCommKey, true);

    // Authoritative campaign progression unlock when winning a boss encounter in active campaign mode
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
        world.run.completedChapters = addUniqueChapter(
          world.run.completedChapters,
          bossChapter
        );
        const recoveredLogId =
          bossState.id === 'the-choir'
            ? 'LOG-02'
            : bossState.id === 'the-curator'
              ? 'LOG-03'
              : bossState.id === 'matron-v'
                ? 'LOG-04'
                : 'LOG-01';
        world.run.recoveredLogs = addUniqueString(
          world.run.recoveredLogs ?? [],
          recoveredLogId
        );
        let nextChap: CampaignChapterId | null = null;
        if (bossState.id === 'helix-04') {
          nextChap = 'chapter_2_choir';
        } else if (bossState.id === 'the-choir') {
          nextChap = 'chapter_3_curator';
        } else if (bossState.id === 'the-curator') {
          nextChap = 'chapter_4_matron';
        } else if (bossState.id === 'matron-v') {
          nextChap = 'chapter_5_loom';
        }
        if (nextChap) {
          world.run.pendingNextChapter = nextChap;
          world.run.unlockedChapters = addUniqueChapter(
            world.run.unlockedChapters,
            nextChap
          );
        }
      } else {
        world.run.pendingNextChapter = null;
      }
    } else {
      world.run.pendingNextChapter = null;
    }

    world.outcome = 'victory';
    world.run.stage = 'completed';
    world.outcomeDelayTimer = 0.5;
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
}

function performPlayerMeleeHitCheck(world: WorldState, isHeavy: boolean): void {
  const p = world.player;
  const range = isHeavy
    ? GAME_CONFIG.player.heavyAttack.range
    : GAME_CONFIG.player.lightAttack.range;
  const arcRadians = isHeavy
    ? GAME_CONFIG.player.heavyAttack.arcRadians
    : GAME_CONFIG.player.lightAttack.arcRadians;

  const baseDamage = isHeavy
    ? p.isEmpoweredHeavy
      ? GAME_CONFIG.player.heavyAttack.empoweredDamage
      : GAME_CONFIG.player.heavyAttack.baseDamage
    : (GAME_CONFIG.player.lightAttack.damage[p.comboIndex] ?? 16);

  const staggerAmount = isHeavy
    ? p.isEmpoweredHeavy
      ? GAME_CONFIG.player.heavyAttack.empoweredStagger
      : GAME_CONFIG.player.heavyAttack.stagger
    : (GAME_CONFIG.player.lightAttack.stagger[p.comboIndex] ?? 12);

  // Evaluate Chapter II Harmonic Node strikes first
  evaluateLivePlayerStrikeOnChoirNodes(world, isHeavy);

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

    // Evaluate Temporal Resonance / Convergence eligibility on this hit
    const res = world.resonance;
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
        } else if (p.flux < res.fluxCost) {
          rejectedConvergenceReason = 'insufficient_flux';
          res.lastOutcome = 'insufficient_flux';
          res.statusMessage = `INSUFFICIENT FLUX FOR CONVERGENCE (${res.fluxCost} REQUIRED)`;
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

    // Check directional frontal guard or Chapter II Choir harmonic shielding
    let isGuarded = false;
    if (enemy.archetype === 'bastion' && !isVulnerable && !isHeavy) {
      const angleFromEnemyToPlayer = Math.atan2(p.x - enemy.x, p.z - enemy.z);
      const facingDiff = Math.abs(angleDiff(angleFromEnemyToPlayer, enemy.rotationY));
      if (facingDiff <= GAME_CONFIG.enemies.bastion.frontGuardArc * 0.5) {
        isGuarded = true;
      }
    } else if (
      enemy.archetype === 'helix' &&
      !isVulnerable &&
      !isHeavy &&
      (!bossState || bossState.aiState !== 'phase_transition')
    ) {
      const angleFromEnemyToPlayer = Math.atan2(p.x - enemy.x, p.z - enemy.z);
      const facingDiff = Math.abs(angleDiff(angleFromEnemyToPlayer, enemy.rotationY));
      if (facingDiff <= GAME_CONFIG.boss.frontGuardArc * 0.5) {
        isGuarded = true;
      }
    } else if (
      enemy.archetype === 'choir' &&
      !isVulnerable &&
      world.choir.synchronizedCount < world.choir.requiredNodeCount
    ) {
      // THE CHOIR's harmonic shield dampens direct hits until linked nodes are synchronized
      isGuarded = true;
    }

    const vulnMult = isVulnerable
      ? isBossArchetype(enemy.archetype)
        ? enemy.aiState === 'staggered'
          ? GAME_CONFIG.boss.staggeredDamageMult
          : GAME_CONFIG.boss.exposedCoreDamageMult
        : GAME_CONFIG.player.vulnerableDamageMultiplier
      : 1.0;
    const vulnStaggerMult =
      isVulnerable && bossState !== null
        ? GAME_CONFIG.boss.exposedCoreStaggerMult
        : 1.0;
    const guardDmgMult = isGuarded
      ? enemy.archetype === 'helix'
        ? GAME_CONFIG.boss.frontalArmorDamageMult
        : enemy.archetype === 'choir'
          ? GAME_CONFIG.choir.unharmonizedDamageMult
          : GAME_CONFIG.enemies.bastion.frontGuardLightDamageMult
      : 1.0;
    const guardStaggerMult = isGuarded
      ? enemy.archetype === 'helix' || enemy.archetype === 'choir'
        ? GAME_CONFIG.boss.frontalArmorStaggerMult
        : GAME_CONFIG.enemies.bastion.frontGuardLightStaggerMult
      : 1.0;

    const convergencePostureBonus = triggeredConvergence ? GAME_CONFIG.resonance.postureBonus : 0;

    // Qualifying hit applies its normal damage once; Convergence grants +22 posture bonus through existing rules
    const finalDamage = Math.max(
      1,
      Math.round(baseDamage * vulnMult * guardDmgMult)
    );
    const effectiveStagger =
      Math.round(staggerAmount * vulnStaggerMult * guardStaggerMult) + convergencePostureBonus;

    if (triggeredConvergence) {
      p.flux = Math.max(0, p.flux - res.fluxCost);
      res.activeMark = null;
      res.cooldownTimer = res.maxCooldown;
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

    if (isVulnerable) {
      world.stats.vulnerableHits += 1;
    }

    // Grant Flux on ordinary melee hits when not attempting or rejecting a Resonance Convergence
    if (!triggeredConvergence && rejectedConvergenceReason === null) {
      if (!isHeavy) {
        const fluxGain = isGuarded
          ? GAME_CONFIG.player.fluxGainOnGuardedHit
          : GAME_CONFIG.player.fluxGainOnLightHit;
        p.flux = Math.min(p.maxFlux, p.flux + fluxGain);
      } else if (!p.isEmpoweredHeavy) {
        p.flux = Math.min(p.maxFlux, p.flux + GAME_CONFIG.player.fluxGainOnHeavyHit);
      }
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

      if (enemy.stagger >= enemy.maxStagger) {
        enemy.aiState = 'staggered';
        enemy.stateDuration = GAME_CONFIG.enemies[enemy.archetype].staggeredDuration;
        enemy.stateTimer = enemy.stateDuration;
        enemy.stagger = 0;
        enemy.vx = 0;
        enemy.vz = 0;
        if (bossState) {
          bossState.aiState = 'staggered';
          bossState.stateDuration = GAME_CONFIG.boss.staggeredDuration;
          bossState.stateTimer = bossState.stateDuration;
          bossState.stagger = 0;
          bossState.vx = 0;
          bossState.vz = 0;
          bossState.activeAttack = null;
          bossState.shockwaveActive = false;
          bossState.coreExposed = true;
          bossState.staggerCooldownTimer =
            GAME_CONFIG.boss.staggeredDuration + GAME_CONFIG.boss.staggerCooldown;
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

function updatePlayer(world: WorldState, input: PlayerInputFrame, dt: number): void {
  const p = world.player;
  if (p.actionState === 'dead') return;

  // Cooldowns & timers
  p.dodgeCooldownTimer = Math.max(0, p.dodgeCooldownTimer - dt);
  p.parryCooldownTimer = Math.max(0, p.parryCooldownTimer - dt);
  p.invulnTimer = Math.max(0, p.invulnTimer - dt);
  p.hurtFlashTimer = Math.max(0, p.hurtFlashTimer - dt);
  p.comboWindowTimer = Math.max(0, p.comboWindowTimer - dt);
  p.comboCooldownTimer = Math.max(0, p.comboCooldownTimer - dt);
  p.bufferTimer = Math.max(0, p.bufferTimer - dt);
  if (p.bufferTimer <= 0) {
    p.bufferedAction = 'none';
  }

  // Passive Flux regeneration
  p.flux = Math.min(p.maxFlux, p.flux + GAME_CONFIG.player.fluxRegenPerSec * dt);

  // Delayed ghost bar decay
  if (p.ghostIntegrity > p.integrity) {
    p.ghostIntegrity = Math.max(p.integrity, p.ghostIntegrity - 28 * dt);
  } else {
    p.ghostIntegrity = p.integrity;
  }

  // Squash & stretch recovery
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

  // Input buffering for responsive controls
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

  // Defensive actions (Dodge & Parry) can cancel attack recovery so skilled players can react to telegraphs
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

  const isNeutralState = p.actionState === 'idle' || p.actionState === 'moving';
  const canChainCancelRecovery =
    p.actionState === 'light_recovery' &&
    p.comboIndex < 2 &&
    p.stateTimer <= GAME_CONFIG.player.lightAttack.chainCancelRemaining;

  // Dedicated heavy attack key (Right-click or E) can initiate from neutral or chain-cancel hits 1 & 2
  if (p.bufferedAction === 'heavy' && (isNeutralState || canChainCancelRecovery)) {
    p.bufferedAction = 'none';
    p.actionState = 'charging_heavy';
    p.chargeTime = GAME_CONFIG.player.heavyAttack.chargeThreshold;
    p.currentAttackStartedAt = world.elapsedTime;
    p.currentAttackMarkId = world.resonance.activeMark?.markId ?? null;
    world.events.push({
      type: 'player_heavy_charge_ready',
      x: p.x,
      z: p.z,
    });
    startHeavyWindup(world, input, moveVec);
    return;
  }

  // Light attack & left-click hold charging logic
  const canStartLightAttack =
    p.comboCooldownTimer <= 0 && (isNeutralState || canChainCancelRecovery);

  if (isNeutralState && p.comboCooldownTimer <= 0 && input.heavyHoldActive) {
    if (p.bufferedAction === 'light') {
      p.actionState = 'charging_heavy';
      p.chargeTime = 0;
      p.currentAttackStartedAt = world.elapsedTime;
      p.currentAttackMarkId = world.resonance.activeMark?.markId ?? null;
      p.bufferedAction = 'none';
    }
  } else if (p.bufferedAction === 'light' && canStartLightAttack) {
    p.bufferedAction = 'none';
    startLightAttack(world, input, moveVec);
    return;
  }

  // State machine transitions
  switch (p.actionState) {
    case 'idle':
    case 'moving': {
      if (moveVec.length > 0.05) {
        p.actionState = 'moving';
        const speed = GAME_CONFIG.player.moveSpeed * moveVec.length;
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
        prevCharge < GAME_CONFIG.player.heavyAttack.chargeThreshold &&
        p.chargeTime >= GAME_CONFIG.player.heavyAttack.chargeThreshold
      ) {
        world.events.push({
          type: 'player_heavy_charge_ready',
          x: p.x,
          z: p.z,
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
      const reachedMax = p.chargeTime >= GAME_CONFIG.player.heavyAttack.maxChargeTime;

      if (released || reachedMax) {
        if (p.chargeTime >= GAME_CONFIG.player.heavyAttack.chargeThreshold) {
          startHeavyWindup(world, input, moveVec);
        } else {
          p.chargeTime = 0;
          startLightAttack(world, input, moveVec);
        }
      }
      break;
    }

    case 'light_windup': {
      p.stateTimer -= dt;
      const lunge = GAME_CONFIG.player.lightAttack.lungeSpeed[p.comboIndex] ?? 3.5;
      p.vx = Math.sin(p.rotationY) * lunge;
      p.vz = Math.cos(p.rotationY) * lunge;
      if (p.stateTimer <= 0) {
        p.actionState = 'light_active';
        p.stateTimer = GAME_CONFIG.player.lightAttack.active[p.comboIndex] ?? 0.12;
        world.events.push({
          type: 'player_light_swing',
          x: p.x,
          z: p.z,
        });
        performPlayerMeleeHitCheck(world, false);
      }
      break;
    }

    case 'light_active': {
      p.stateTimer -= dt;
      p.vx = Math.sin(p.rotationY) * 1.5;
      p.vz = Math.cos(p.rotationY) * 1.5;
      performPlayerMeleeHitCheck(world, false);
      if (p.stateTimer <= 0) {
        p.actionState = 'light_recovery';
        const recDuration = GAME_CONFIG.player.lightAttack.recovery[p.comboIndex] ?? 0.24;
        p.stateTimer = recDuration;
        if (p.comboIndex < 2) {
          p.comboWindowTimer = recDuration + GAME_CONFIG.player.lightAttack.comboResetTime;
        } else {
          p.comboWindowTimer = 0;
          p.comboCooldownTimer = recDuration + GAME_CONFIG.player.lightAttack.finisherCooldown;
        }
      }
      break;
    }

    case 'light_recovery': {
      p.stateTimer -= dt;
      const moveMult =
        p.comboIndex === 2
          ? GAME_CONFIG.player.attackMoveSpeedMultiplier * 0.55
          : GAME_CONFIG.player.attackMoveSpeedMultiplier;
      p.vx = moveVec.dirX * GAME_CONFIG.player.moveSpeed * moveMult;
      p.vz = moveVec.dirZ * GAME_CONFIG.player.moveSpeed * moveMult;
      if (p.stateTimer <= 0) {
        if (p.comboIndex === 2) {
          p.comboIndex = 0;
        }
        p.actionState = moveVec.length > 0.05 ? 'moving' : 'idle';
      }
      break;
    }

    case 'heavy_windup': {
      p.stateTimer -= dt;
      const lunge = GAME_CONFIG.player.heavyAttack.lungeSpeed;
      p.vx = Math.sin(p.rotationY) * lunge;
      p.vz = Math.cos(p.rotationY) * lunge;
      if (p.stateTimer <= 0) {
        p.actionState = 'heavy_active';
        p.stateTimer = GAME_CONFIG.player.heavyAttack.active;
        p.squashX = 1.24;
        p.squashY = 0.78;
        world.events.push({
          type: 'player_heavy_swing',
          x: p.x,
          z: p.z,
          isHeavy: true,
        });
        performPlayerMeleeHitCheck(world, true);
      }
      break;
    }

    case 'heavy_active': {
      p.stateTimer -= dt;
      p.vx = Math.sin(p.rotationY) * 2.5;
      p.vz = Math.cos(p.rotationY) * 2.5;
      performPlayerMeleeHitCheck(world, true);
      if (p.stateTimer <= 0) {
        p.actionState = 'heavy_recovery';
        p.stateTimer = GAME_CONFIG.player.heavyAttack.recovery;
        p.isEmpoweredHeavy = false;
      }
      break;
    }

    case 'heavy_recovery': {
      p.stateTimer -= dt;
      const decay = Math.exp(-9.5 * dt);
      p.vx *= decay;
      p.vz *= decay;
      if (p.stateTimer <= 0) {
        p.actionState = moveVec.length > 0.05 ? 'moving' : 'idle';
      }
      break;
    }

    case 'dodging': {
      p.stateTimer -= dt;
      const speed = GAME_CONFIG.player.dodge.speed;
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
        p.stateTimer = GAME_CONFIG.player.parry.recovery;
      }
      break;
    }

    case 'parry_recovery': {
      p.stateTimer -= dt;
      p.vx = moveVec.dirX * GAME_CONFIG.player.moveSpeed * 0.45;
      p.vz = moveVec.dirZ * GAME_CONFIG.player.moveSpeed * 0.45;
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
    p.flux = Math.min(p.maxFlux, p.flux + GAME_CONFIG.player.fluxGainOnParry);
    p.invulnTimer = Math.max(p.invulnTimer, 0.35);
    p.actionState = 'idle';
    p.stateTimer = 0;
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

    world.events.push({
      type: 'player_parry_success',
      x: p.x,
      z: p.z,
      enemyId: attacker?.id,
    });
    return false;
  }

  // Check Dodge / Hurt invulnerability
  if (p.invulnTimer > 0) {
    return false;
  }

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

export function selectNextBossAttack(
  boss: BossState,
  distToPlayer: number,
  hasActiveEcho = false
): BossAttackType {
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

  if (attack === 'vector_ram' || attack === 'surgical_incision') {
    telegraphDuration =
      boss.phase === 2 ? cfg.vector_ram.telegraphP2 : cfg.vector_ram.telegraphP1;
    statusLabel =
      attack === 'surgical_incision'
        ? 'TELEGRAPH · SURGICAL INCISION LUNGE'
        : 'TELEGRAPH · VECTOR RAM LANE LOCKING';
  } else if (attack === 'helical_sweep') {
    telegraphDuration =
      boss.phase === 2 ? cfg.helical_sweep.telegraphP2 : cfg.helical_sweep.telegraphP1;
    statusLabel = 'TELEGRAPH · HELICAL SWEEP ARC WINDUP';
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
      // Target the active playing Echo if within arena, or center on Matron
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
      boss.phase === 2 ? cfg.anchor_slam.telegraphP2 : cfg.anchor_slam.telegraphP1;
    statusLabel =
      attack === 'quarantine_wave'
        ? 'TELEGRAPH · QUARANTINE PULSE WAVE'
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

  if (attack === 'vector_ram' || attack === 'surgical_incision') {
    activeDuration = cfg.vector_ram.activeDuration;
    statusLabel =
      attack === 'surgical_incision'
        ? 'COMMITTED · SURGICAL INCISION THRUST'
        : 'COMMITTED · VECTOR RAM OVERDRIVE';
  } else if (attack === 'helical_sweep') {
    activeDuration = cfg.helical_sweep.activeDuration;
    statusLabel = 'COMMITTED · HELICAL CONTAINMENT CLEAVE';
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
    activeDuration = cfg.anchor_slam.activeDuration;
    statusLabel =
      attack === 'resonance_wave' || attack === 'harmonic_chord' || attack === 'cadenza_slam'
        ? 'COMMITTED · HARMONIC RESONANCE WAVE'
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
    attack === 'chrono_sever'
  ) {
    boss.shockwaveActive = true;
    boss.shockwaveRadius = cfg.anchor_slam.innerRadius;
    boss.shockwaveMaxRadius =
      attack === 'chrono_sever'
        ? GAME_CONFIG.matron.chronoSever.radius
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

      if (attack === 'vector_ram' || attack === 'surgical_incision') {
        const ramCfg = cfg.attacks.vector_ram;
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
      } else if (attack === 'helical_sweep') {
        const sweepCfg = cfg.attacks.helical_sweep;
        boss.vx = boss.attackDirX * sweepCfg.lungeSpeed;
        boss.vz = boss.attackDirZ * sweepCfg.lungeSpeed;
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

        // Evaluate Chrono Sever anti-Echo effect once per strike!
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
              // Sever the active Echo actor inside the zone WITHOUT corrupting world.echo.clip
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
        // Anchor Slam / Harmonic Pulse: stationary chassis impact + expanding temporal shockwave ring
        const slamCfg = cfg.attacks.anchor_slam;
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

      // Advance boss position during active attack before checking hit envelope
      boss.x += boss.vx * dt;
      boss.z += boss.vz * dt;
      enemy.x = boss.x;
      enemy.z = boss.z;
      enemy.vx = boss.vx;
      enemy.vz = boss.vz;
      enemy.rotationY = boss.rotationY;

      // Authoritative single-hit-per-attack-event check
      if (!boss.hasDealtDamageThisAttack && p.actionState !== 'dead') {
        const curDx = p.x - boss.x;
        const curDz = p.z - boss.z;
        const curDist = Math.hypot(curDx, curDz);
        const curAngleToPlayer = Math.atan2(curDx, curDz);

        let hitPlayer = false;
        let hitDamage = 0;

        if (attack === 'vector_ram' || attack === 'surgical_incision') {
          const ramCfg = cfg.attacks.vector_ram;
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
        } else if (attack === 'helical_sweep') {
          const sweepCfg = cfg.attacks.helical_sweep;
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
          // Damage is resolved via deterministic ReconstructedAttackTrace in advanceCuratorSystem
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
          // Anchor Slam / Harmonic Pulse: inner impact footprint OR expanding shockwave ring
          const slamCfg = cfg.attacks.anchor_slam;
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

      // Check if attack completed (and wasn't interrupted by a Parry stagger)
      if (boss.stateTimer <= 0 && boss.aiState === 'attack') {
        const recDuration =
          attack === 'vector_ram' || attack === 'surgical_incision'
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
    enemy.hitFlashTimer = Math.max(0, enemy.hitFlashTimer - dt);
    enemy.cooldownTimer = Math.max(0, enemy.cooldownTimer - dt);
    enemy.evadeTimer = Math.max(0, enemy.evadeTimer - dt);
    enemy.evadeCooldownTimer = Math.max(0, enemy.evadeCooldownTimer - dt);

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
      enemy.stagger = Math.max(0, enemy.stagger - 7 * dt);
    }

    const dxToPlayer = p.x - enemy.x;
    const dzToPlayer = p.z - enemy.z;
    const distToPlayer = Math.hypot(dxToPlayer, dzToPlayer) || 0.001;
    const angleToPlayer = Math.atan2(dxToPlayer, dzToPlayer);

    switch (enemy.aiState) {
      case 'idle':
      case 'pursue': {
        enemy.rotationY = moveAngleTowards(enemy.rotationY, angleToPlayer, 7.2 * dt);

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
        if (enemy.archetype === 'bastion') {
          if (distToPlayer > cfg.preferredRange) {
            enemy.vx = (dxToPlayer / distToPlayer) * cfg.moveSpeed;
            enemy.vz = (dzToPlayer / distToPlayer) * cfg.moveSpeed;
          } else {
            enemy.vx = 0;
            enemy.vz = 0;
          }
        } else if (
          enemy.archetype === 'scrapper' ||
          enemy.archetype === 'curator_decoy' ||
          enemy.archetype === 'siphon' ||
          enemy.archetype === 'eraser'
        ) {
          // Eraser prioritizes moving toward an active Echo if one is playing
          let targetX = p.x;
          let targetZ = p.z;
          if (
            enemy.archetype === 'eraser' &&
            world.echo.state === 'playback' &&
            world.echo.activeActor
          ) {
            targetX = world.echo.activeActor.x;
            targetZ = world.echo.activeActor.z;
          }
          const dxTarget = targetX - enemy.x;
          const dzTarget = targetZ - enemy.z;
          const distTarget = Math.hypot(dxTarget, dzTarget) || 0.001;
          const angleTarget = Math.atan2(dxTarget, dzTarget);
          enemy.rotationY = moveAngleTowards(enemy.rotationY, angleTarget, 7.2 * dt);

          const flankAngle =
            angleTarget + enemy.strafeDir * (distTarget > 4 ? 0.38 : 0.12);
          if (distTarget > cfg.preferredRange) {
            enemy.vx = Math.sin(flankAngle) * cfg.moveSpeed;
            enemy.vz = Math.cos(flankAngle) * cfg.moveSpeed;
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
            const lateralSpeed = scoutCfg.moveSpeed * 0.65 * enemy.strafeDir;
            enemy.vx = (dxToPlayer / distToPlayer) * awaySpeed + tangentX * lateralSpeed;
            enemy.vz = (dzToPlayer / distToPlayer) * awaySpeed + tangentZ * lateralSpeed;
          } else {
            let radialSpeed = 0;
            if (distToPlayer < cfg.preferredRange - 1.4) {
              radialSpeed = -cfg.moveSpeed * 0.9;
            } else if (distToPlayer > cfg.preferredRange + 1.2) {
              radialSpeed = cfg.moveSpeed * 0.85;
            }
            const orbitSpeed = cfg.moveSpeed * 0.65 * enemy.strafeDir;
            enemy.vx = (dxToPlayer / distToPlayer) * radialSpeed + tangentX * orbitSpeed;
            enemy.vz = (dzToPlayer / distToPlayer) * radialSpeed + tangentZ * orbitSpeed;
          }
        }

        // Check attack initiation with token pool limit
        let canStartAttack = distToPlayer <= cfg.attackRange;
        if (
          enemy.archetype === 'eraser' &&
          world.echo.state === 'playback' &&
          world.echo.activeActor
        ) {
          const distEcho = Math.hypot(
            world.echo.activeActor.x - enemy.x,
            world.echo.activeActor.z - enemy.z
          );
          if (distEcho <= GAME_CONFIG.matron.eraserDisruptionRadius) {
            canStartAttack = true;
          }
        }

        if (
          p.actionState !== 'dead' &&
          !holdPerimeterForCalibration &&
          enemy.evadeTimer <= 0 &&
          enemy.cooldownTimer <= 0 &&
          canStartAttack &&
          activeAttackers < GAME_CONFIG.enemies.maxConcurrentAttackers
        ) {
          enemy.aiState = 'telegraph';
          enemy.stateDuration = cfg.telegraphDuration;
          enemy.stateTimer = cfg.telegraphDuration;
          enemy.hasDealtDamageThisAttack = false;
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
        if (progress < 0.6) {
          enemy.rotationY = moveAngleTowards(enemy.rotationY, angleToPlayer, 5.0 * dt);
          enemy.targetX = p.x;
          enemy.targetZ = p.z;
        }

        if (enemy.stateTimer <= 0) {
          enemy.aiState = 'attack';
          enemy.stateDuration = cfg.activeDuration;
          enemy.stateTimer = cfg.activeDuration;
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

        if (enemy.archetype === 'scrapper') {
          const lunge = GAME_CONFIG.enemies.scrapper.lungeSpeed;
          enemy.vx = Math.sin(enemy.rotationY) * lunge;
          enemy.vz = Math.cos(enemy.rotationY) * lunge;
        } else if (enemy.archetype === 'bastion') {
          enemy.vx = Math.sin(enemy.rotationY) * 3.4;
          enemy.vz = Math.cos(enemy.rotationY) * 3.4;
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

          let hitPlayer = false;

          if (enemy.archetype === 'scout') {
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
            }
          }
        }

        if (enemy.stateTimer <= 0 && enemy.aiState === 'attack') {
          enemy.aiState = 'recovery';
          enemy.stateDuration = cfg.recoveryDuration;
          enemy.stateTimer = cfg.recoveryDuration;
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
          enemy.cooldownTimer = cfg.attackCooldown;
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

  // Hitstop freeze pauses simulation physics & Echo timeline while rendering & trauma continue
  if (world.hitstopTimer > 0) {
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

  world.elapsedTime += dt;

  // Tick Relay cooldown & visual flash timers
  world.relay.cooldownTimer = Math.max(0, world.relay.cooldownTimer - dt);
  world.relay.successFlashTimer = Math.max(0, world.relay.successFlashTimer - dt);

  // Tick Temporal Resonance window & Convergence cooldown timers
  advanceResonanceSystem(world, dt);

  updatePlayer(world, input, dt);

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

  advanceEchoSystem(world, dt);

  // Tick Chapter II, III, IV mechanics
  advanceChoirSystem(world, dt);
  advanceCuratorSystem(world, dt);
  advanceMatronSystem(world, dt);

  updatePressurePlate(world, dt);
  updateBoss(world, dt);
  updateEnemies(world, dt);

  // Zero-allocation collision resolution
  resolveActorSeparation(world.player, world.enemies);

  _scratchCollider.x = world.player.x;
  _scratchCollider.z = world.player.z;
  _scratchCollider.radius = GAME_CONFIG.player.radius;
  resolveCircleObstacleCollisions(_scratchCollider, world.obstacles, GAME_CONFIG.arena.radius);
  world.player.x = _scratchCollider.x;
  world.player.z = _scratchCollider.z;

  for (let i = 0; i < world.enemies.length; i++) {
    const enemy = world.enemies[i];
    if (enemy.aiState === 'ko') continue;
    _scratchCollider.x = enemy.x;
    _scratchCollider.z = enemy.z;
    _scratchCollider.radius = enemy.radius;
    resolveCircleObstacleCollisions(_scratchCollider, world.obstacles, GAME_CONFIG.arena.radius);
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

  // Update contextual tutorial state machine & live narrative comms
  updateTutorialSystem(world, input, dt);
  advanceNarrativeCommsSystem(world, dt);

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
    world.run.mode === 'campaign' &&
    world.encounterMode === 'standard' &&
    world.run.chapter === 'prologue' &&
    world.outcome === 'none' &&
    (world.puzzle.completed || (world.enemies.length > 0 && !anyAlive))
  ) {
    world.puzzle.completed = true;
    world.puzzle.stage = 'completed';
    if (world.run.isChapterReplay) {
      world.outcome = 'victory';
      world.run.stage = 'completed';
      world.run.pendingNextChapter = null;
      world.outcomeDelayTimer = 0.5;
      world.frozenSummary = buildRunSummary(world);
      clearEchoState(world, 'outcome');
      world.events.push({
        type: 'encounter_victory',
        x: world.player.x,
        z: world.player.z,
      });
      return;
    }
    beginCampaignBossTransition(world);
    return;
  }

  const canTriggerEncounterVictory =
    world.encounterMode === 'standard' &&
    world.run.mode !== 'campaign' &&
    world.run.chapter !== 'chapter_5_loom';
  if (
    world.enemies.length > 0 &&
    !anyAlive &&
    world.outcome === 'none' &&
    canTriggerEncounterVictory
  ) {
    world.outcome = 'victory';
    world.run.stage = 'completed';
    world.outcomeDelayTimer = 0.5;
    clearEchoState(world, 'outcome');
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

  for (let s = 0; s < slices; s++) {
    stepWorldSingleSlice(world, s === 0 ? input : _scratchSubstepInput, sliceDt);
  }
}

export function extractHudSnapshot(world: WorldState): HudSnapshot {
  const p = world.player;
  const totalEnemies = world.enemies.length;
  const aliveList = world.enemies.filter((e) => e.hp > 0 && e.aiState !== 'ko');
  const enemiesAlive = aliveList.length;

  let focusedEnemy: HudSnapshot['focusedEnemy'] = null;
  let bestScore = Infinity;

  const activeMark = world.resonance.activeMark;

  for (let i = 0; i < aliveList.length; i++) {
    const e = aliveList[i];
    const dist = Math.hypot(e.x - p.x, e.z - p.z);
    const isMarked = activeMark?.enemyId === e.id;
    const statePriority =
      (e.aiState === 'telegraph' || e.aiState === 'recovery' || e.aiState === 'staggered'
        ? -4
        : 0) + (isMarked ? -6 : 0);
    const score = dist + statePriority;
    if (score < bestScore) {
      bestScore = score;
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
    };
  }

  let objectiveText =
    world.run.chapter === 'chapter_5_loom'
      ? 'CHAPTER V · THE LAST LOOP — CHRONICLE LOOM'
      : world.encounterMode === 'boss' && world.boss
        ? `NEUTRALIZE ${world.boss.name} · ${world.boss.subtitle}`
        : 'NEUTRALIZE WARDEN SECURITY UNITS';
  let objectiveSubtext =
    world.run.chapter === 'chapter_5_loom'
      ? 'Approach the Chronicle Loom Console and select Nadir-9’s final protocol: SILENCE, WITNESS, or CONTINUITY'
      : world.encounterMode === 'boss'
        ? 'Evade telegraphed attacks and strike the exposed Chrono Core (1.5x)'
        : 'Strike White Recovery Windows after telegraphs for 1.5x damage';

  const plate = world.pressurePlate;
  const puzzle = world.puzzle;
  const receiver = puzzle.heavyReceiver;
  const combinePlate = puzzle.combinePlate;
  const finalBarrier = puzzle.finalBarrier;

  const playerDistToPlate = Math.hypot(p.x - plate.x, p.z - plate.z);
  const playerDistToReceiver = Math.hypot(p.x - receiver.x, p.z - receiver.z);
  const playerDistToCombinePlate = Math.hypot(p.x - combinePlate.x, p.z - combinePlate.z);

  if (world.run.chapter === 'chapter_5_loom') {
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

  if (enemiesAlive === 0 && world.run.chapter !== 'chapter_5_loom') {
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
    objectiveText = 'ARCHIVE CALIBRATION COMPLETE · BREACHING CONTAINMENT SECTOR';
    objectiveSubtext =
      world.run.checkpointNotice ??
      'WARNING: WARDEN Marshal HELIX-04 awakening in primary arena';
  }

  const echo = world.echo;

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
    playerActionState: p.actionState,
    chargeRatio: Math.min(
      1,
      p.chargeTime / GAME_CONFIG.player.heavyAttack.chargeThreshold
    ),
    comboStep:
      p.actionState.startsWith('light_') || p.comboWindowTimer > 0
        ? p.comboIndex + 1
        : 0,
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
    elapsedTime: world.elapsedTime,
    summary: world.frozenSummary,
  };
}


