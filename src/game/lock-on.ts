import type { BossState, EnemyState, WorldState } from './types.ts';

export const LOCK_ON_MAX_ACQUIRE_RANGE = 20;
export const LOCK_ON_BREAK_RANGE = 24;

export const CHRONO_EXECUTION_CONFIG = {
  mobMaxRange: 3.4,
  bossMaxRange: 4.2,
  mobDamageMult: 2.25,
  bossPercentHpBurst: 0.14,
  fluxGain: 22,
  integrityHeal: 10,
  adrenalineGain: 1.25,
  hitstopSeconds: 0.095,
  trauma: 0.78,
  recoveryDuration: 0.28,
} as const;

export interface LockOnTargetInfo {
  id: string;
  name: string;
  x: number;
  z: number;
  radius: number;
  hp: number;
  maxHp: number;
  aiState: string;
  isBoss: boolean;
  isStaggered: boolean;
}

export interface ExecutionCandidate {
  id: string;
  name: string;
  x: number;
  z: number;
  radius: number;
  isBoss: boolean;
  distance: number;
}

function wrapYawAngle(angle: number): number {
  let a = angle;
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

export function computeTargetBearingYaw(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number
): number {
  return Math.atan2(toX - fromX, toZ - fromZ);
}

export function computeLockedCameraYaw(
  currentYaw: number,
  playerX: number,
  playerZ: number,
  targetX: number,
  targetZ: number,
  dt: number,
  followSpeed = 9.5
): number {
  if (dt <= 0) return wrapYawAngle(currentYaw);
  const dx = targetX - playerX;
  const dz = targetZ - playerZ;
  if (dx * dx + dz * dz < 0.25) return wrapYawAngle(currentYaw);
  const desiredYaw = Math.atan2(dx, dz);
  const diff = wrapYawAngle(desiredYaw - currentYaw);
  const alpha = 1 - Math.exp(-followSpeed * dt);
  return wrapYawAngle(currentYaw + diff * alpha);
}

function toTargetInfoFromEnemy(e: EnemyState): LockOnTargetInfo {
  return {
    id: e.id,
    name: e.name,
    x: e.x,
    z: e.z,
    radius: e.radius,
    hp: e.hp,
    maxHp: e.maxHp,
    aiState: e.aiState,
    isBoss: false,
    isStaggered: e.aiState === 'staggered',
  };
}

function toTargetInfoFromBoss(b: BossState): LockOnTargetInfo {
  return {
    id: b.id,
    name: b.name,
    x: b.x,
    z: b.z,
    radius: b.radius,
    hp: b.hp,
    maxHp: b.maxHp,
    aiState: b.aiState,
    isBoss: true,
    isStaggered: b.aiState === 'staggered',
  };
}

export function collectLockOnCandidates(world: WorldState): LockOnTargetInfo[] {
  const out: LockOnTargetInfo[] = [];
  if (world.boss && world.boss.hp > 0 && world.boss.aiState !== 'dormant') {
    out.push(toTargetInfoFromBoss(world.boss));
  }
  for (let i = 0; i < world.enemies.length; i++) {
    const e = world.enemies[i];
    if (e.hp <= 0 || e.aiState === 'ko') continue;
    // Skip duplicate boss entity if world.boss already represents it
    if (world.boss && e.id === world.boss.id) continue;
    out.push(toTargetInfoFromEnemy(e));
  }
  return out;
}

export function resolveActiveLockOnTarget(
  world: WorldState,
  lockedTargetId: string | null | undefined
): LockOnTargetInfo | null {
  if (!lockedTargetId || world.appState !== 'playing') return null;
  const px = world.player.x;
  const pz = world.player.z;

  if (world.boss && world.boss.id === lockedTargetId) {
    if (world.boss.hp <= 0 || world.boss.aiState === 'dormant') return null;
    const dist = Math.hypot(world.boss.x - px, world.boss.z - pz);
    if (dist > LOCK_ON_BREAK_RANGE) return null;
    return toTargetInfoFromBoss(world.boss);
  }

  for (let i = 0; i < world.enemies.length; i++) {
    const e = world.enemies[i];
    if (e.id !== lockedTargetId) continue;
    if (e.hp <= 0 || e.aiState === 'ko') return null;
    const dist = Math.hypot(e.x - px, e.z - pz);
    if (dist > LOCK_ON_BREAK_RANGE) return null;
    return toTargetInfoFromEnemy(e);
  }

  return null;
}

export function selectBestLockOnTarget(
  world: WorldState,
  cameraYaw: number
): LockOnTargetInfo | null {
  const candidates = collectLockOnCandidates(world);
  if (candidates.length === 0) return null;

  const px = world.player.x;
  const pz = world.player.z;
  let best: LockOnTargetInfo | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const dist = Math.hypot(c.x - px, c.z - pz);
    if (dist > LOCK_ON_MAX_ACQUIRE_RANGE) continue;

    const bearing = computeTargetBearingYaw(px, pz, c.x, c.z);
    const anglePenalty = Math.abs(wrapYawAngle(bearing - cameraYaw));
    // Lower score = higher priority: reward facing alignment, stagger state, boss prominence, and proximity
    const bossBonus = c.isBoss ? -2.0 : 0;
    const decoyPenalty = world.enemies.find((e) => e.id === c.id)?.isDecoy ? 3.5 : 0;
    const score = dist + anglePenalty * 4.5 + bossBonus + decoyPenalty;
    if (score < bestScore) {
      bestScore = score;
      best = c;
    }
  }

  return best;
}

export function cycleLockOnTarget(
  world: WorldState,
  currentTargetId: string | null | undefined,
  cameraYaw: number
): LockOnTargetInfo | null {
  const candidates = collectLockOnCandidates(world).filter((c) => {
    const dist = Math.hypot(c.x - world.player.x, c.z - world.player.z);
    return dist <= LOCK_ON_MAX_ACQUIRE_RANGE;
  });
  if (candidates.length === 0) return null;
  if (candidates.length === 1 || !currentTargetId) {
    return selectBestLockOnTarget(world, cameraYaw);
  }

  const px = world.player.x;
  const pz = world.player.z;
  candidates.sort(
    (a, b) => Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz)
  );
  const idx = candidates.findIndex((c) => c.id === currentTargetId);
  if (idx === -1) return candidates[0];
  return candidates[(idx + 1) % candidates.length];
}

export function findExecutionCandidate(world: WorldState): ExecutionCandidate | null {
  if (world.appState !== 'playing') return null;
  if (world.resonance.status === 'primed' && world.resonance.activeMark !== null) {
    return null;
  }
  const px = world.player.x;
  const pz = world.player.z;
  let best: ExecutionCandidate | null = null;
  let bestDist = Number.POSITIVE_INFINITY;

  if (world.boss && world.boss.hp > 0 && world.boss.aiState === 'staggered') {
    const dist = Math.hypot(world.boss.x - px, world.boss.z - pz);
    if (dist <= CHRONO_EXECUTION_CONFIG.bossMaxRange) {
      best = {
        id: world.boss.id,
        name: world.boss.name,
        x: world.boss.x,
        z: world.boss.z,
        radius: world.boss.radius,
        isBoss: true,
        distance: dist,
      };
      bestDist = dist;
    }
  }

  for (let i = 0; i < world.enemies.length; i++) {
    const e = world.enemies[i];
    if (e.hp <= 0 || e.aiState !== 'staggered') continue;
    if (world.boss && e.id === world.boss.id) continue;
    const dist = Math.hypot(e.x - px, e.z - pz);
    if (dist <= CHRONO_EXECUTION_CONFIG.mobMaxRange && dist < bestDist) {
      bestDist = dist;
      best = {
        id: e.id,
        name: e.name,
        x: e.x,
        z: e.z,
        radius: e.radius,
        isBoss: false,
        distance: dist,
      };
    }
  }

  return best;
}
