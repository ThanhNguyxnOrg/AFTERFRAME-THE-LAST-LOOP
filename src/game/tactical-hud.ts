import type {
  BossState,
  CombatEvent,
  EnemyState,
  HudRadarBlip,
  HudRadarSnapshot,
  PlayerState,
  RadarBlipKind,
} from './types.ts';

export type ThreatSeverity = 'urgent' | 'telegraph' | 'hostile';

export interface PeripheralThreatIndicator {
  id: string;
  angleDeg: number;
  severity: ThreatSeverity;
  distance: number;
  isBoss: boolean;
}

export type CombatCalloutTone =
  | 'crit'
  | 'parry'
  | 'slip'
  | 'converge'
  | 'stagger'
  | 'normal'
  | 'blocked'
  | 'hurt';

export interface CombatCalloutSpec {
  text: string;
  tone: CombatCalloutTone;
  worldX: number;
  worldY: number;
  worldZ: number;
  scale: number;
  duration: number;
}

const SEVERITY_PRIORITY: Record<ThreatSeverity, number> = {
  urgent: 0,
  telegraph: 1,
  hostile: 2,
};

/**
 * Computes normalized bearing in degrees relative to camera aimYaw:
 * 0° = directly in front of camera, +90° = right, ±180° = behind, -90° = left.
 */
export function computeRelativeBearingDeg(
  fromX: number,
  fromZ: number,
  targetX: number,
  targetZ: number,
  aimYaw: number
): number {
  const dx = targetX - fromX;
  const dz = targetZ - fromZ;
  const fwdX = Math.sin(aimYaw);
  const fwdZ = Math.cos(aimYaw);
  // Camera right vector = cross(fwd, up) = (-fwdZ, 0, fwdX)
  const fwdProj = dx * fwdX + dz * fwdZ;
  const rightProj = dx * -fwdZ + dz * fwdX;
  if (fwdProj === 0 && rightProj === 0) return 0;
  return (Math.atan2(rightProj, fwdProj) * 180) / Math.PI;
}

export interface ThreatProjectileLike {
  id: string | number;
  owner: string;
  x: number;
  z: number;
  vx: number;
  vz: number;
}

export function computePeripheralThreats(
  player: Pick<PlayerState, 'x' | 'z'>,
  enemies: readonly Pick<EnemyState, 'id' | 'x' | 'z' | 'hp' | 'aiState'>[],
  boss: Pick<BossState, 'id' | 'x' | 'z' | 'hp' | 'aiState'> | null | undefined,
  projectiles: readonly ThreatProjectileLike[],
  aimYaw: number,
  maxThreats = 6
): PeripheralThreatIndicator[] {
  const results: PeripheralThreatIndicator[] = [];

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (e.hp <= 0 || e.aiState === 'ko') continue;
    const dist = Math.hypot(e.x - player.x, e.z - player.z);
    const isAttacking = e.aiState === 'telegraph' || e.aiState === 'attack';
    const maxRange = isAttacking ? 26 : 22;
    if (dist > maxRange || dist < 0.25) continue;

    const angleDeg = computeRelativeBearingDeg(player.x, player.z, e.x, e.z, aimYaw);
    const absAngle = Math.abs(angleDeg);
    const angleThreshold = isAttacking ? 28 : 38;
    if (absAngle < angleThreshold) continue;

    const severity: ThreatSeverity =
      e.aiState === 'attack'
        ? 'urgent'
        : e.aiState === 'telegraph'
          ? 'telegraph'
          : 'hostile';

    results.push({
      id: `enemy:${e.id}`,
      angleDeg: Number(angleDeg.toFixed(1)),
      severity,
      distance: Number(dist.toFixed(2)),
      isBoss: false,
    });
  }

  if (boss && boss.hp > 0 && boss.aiState !== 'dormant') {
    const dist = Math.hypot(boss.x - player.x, boss.z - player.z);
    const isAttacking = boss.aiState === 'telegraph' || boss.aiState === 'attack';
    if (dist >= 0.4 && dist <= 32) {
      const angleDeg = computeRelativeBearingDeg(player.x, player.z, boss.x, boss.z, aimYaw);
      const absAngle = Math.abs(angleDeg);
      if (absAngle >= (isAttacking ? 26 : 42)) {
        results.push({
          id: `boss:${boss.id}`,
          angleDeg: Number(angleDeg.toFixed(1)),
          severity:
            boss.aiState === 'attack'
              ? 'urgent'
              : boss.aiState === 'telegraph'
                ? 'telegraph'
                : 'hostile',
          distance: Number(dist.toFixed(2)),
          isBoss: true,
        });
      }
    }
  }

  for (let i = 0; i < projectiles.length; i++) {
    const proj = projectiles[i];
    if (proj.owner !== 'enemy') continue;
    const toPlayerX = player.x - proj.x;
    const toPlayerZ = player.z - proj.z;
    const dist = Math.hypot(toPlayerX, toPlayerZ);
    if (dist > 13 || dist < 0.25) continue;

    // Only alert if projectile is actually heading roughly toward Sera
    const speed = Math.hypot(proj.vx, proj.vz);
    if (speed > 0.01) {
      const approachDot = (toPlayerX * proj.vx + toPlayerZ * proj.vz) / (dist * speed);
      if (approachDot < 0.45) continue;
    }

    const angleDeg = computeRelativeBearingDeg(player.x, player.z, proj.x, proj.z, aimYaw);
    if (Math.abs(angleDeg) < 24) continue;

    results.push({
      id: `proj:${proj.id}`,
      angleDeg: Number(angleDeg.toFixed(1)),
      severity: 'urgent',
      distance: Number(dist.toFixed(2)),
      isBoss: false,
    });
  }

  results.sort((a, b) => {
    const sevDiff = SEVERITY_PRIORITY[a.severity] - SEVERITY_PRIORITY[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return a.distance - b.distance;
  });

  if (results.length > maxThreats) {
    results.length = maxThreats;
  }
  return results;
}

export function formatCombatCallouts(
  events: readonly CombatEvent[]
): CombatCalloutSpec[] {
  const out: CombatCalloutSpec[] = [];
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    switch (ev.type) {
      case 'player_parry_success':
        out.push({
          text: 'PARRY! +35F',
          tone: 'parry',
          worldX: ev.x,
          worldY: 2.05,
          worldZ: ev.z,
          scale: 1.18,
          duration: 0.8,
        });
        break;
      case 'player_perfect_dodge': {
        const gain = typeof ev.amount === 'number' && ev.amount > 0 ? Math.round(ev.amount) : 18;
        out.push({
          text: `CHRONO SLIP +${gain}F`,
          tone: 'slip',
          worldX: ev.x,
          worldY: 2.0,
          worldZ: ev.z,
          scale: 1.15,
          duration: 0.8,
        });
        break;
      }
      case 'resonance_convergence': {
        const dmg = typeof ev.amount === 'number' && ev.amount > 0 ? ` ${Math.round(ev.amount)}` : '';
        out.push({
          text: `CONVERGE!${dmg}`,
          tone: 'converge',
          worldX: ev.x,
          worldY: 2.25,
          worldZ: ev.z,
          scale: 1.28,
          duration: 0.9,
        });
        break;
      }
      case 'enemy_staggered':
      case 'boss_staggered':
        out.push({
          text: 'STAGGER!',
          tone: 'stagger',
          worldX: ev.x,
          worldY: 2.2,
          worldZ: ev.z,
          scale: 1.2,
          duration: 0.85,
        });
        break;
      case 'player_hit_enemy': {
        const dmg = typeof ev.amount === 'number' ? Math.round(ev.amount) : 0;
        if (ev.isGuarded) {
          out.push({
            text: dmg > 0 ? `GUARD ${dmg}` : 'GUARDED',
            tone: 'blocked',
            worldX: ev.x,
            worldY: 1.85,
            worldZ: ev.z,
            scale: 0.92,
            duration: 0.62,
          });
        } else if (dmg > 0) {
          const prefix = ev.flowKind === 'riposte'
            ? 'RIPOSTE '
            : ev.flowKind === 'chrono_slip'
              ? 'SLIP '
              : '';
          out.push({
            text: ev.isCriticalOrVulnerable ? `${prefix}${dmg}!` : `${prefix}${dmg}`,
            tone: ev.isCriticalOrVulnerable ? 'crit' : 'normal',
            worldX: ev.x,
            worldY: 1.9,
            worldZ: ev.z,
            scale: ev.isCriticalOrVulnerable || ev.isHeavy ? 1.14 : 0.96,
            duration: 0.68,
          });
        }
        break;
      }
      case 'player_damaged': {
        const dmg = typeof ev.amount === 'number' ? Math.round(ev.amount) : 0;
        if (dmg > 0) {
          out.push({
            text: `-${dmg}`,
            tone: 'hurt',
            worldX: ev.x,
            worldY: 1.95,
            worldZ: ev.z,
            scale: 1.05,
            duration: 0.72,
          });
        }
        break;
      }
      case 'active_vent_success':
        out.push({
          text: 'ACTIVE VENT! OVERCHARGED',
          tone: 'parry',
          worldX: ev.x,
          worldY: 2.15,
          worldZ: ev.z,
          scale: 1.24,
          duration: 0.88,
        });
        break;
      case 'active_vent_missed':
        out.push({
          text: 'VENT JAMMED',
          tone: 'hurt',
          worldX: ev.x,
          worldY: 2.0,
          worldZ: ev.z,
          scale: 0.96,
          duration: 0.65,
        });
        break;
      case 'adrenaline_tier_changed': {
        const tier = typeof ev.amount === 'number' ? Math.round(ev.amount) : 0;
        const delta = typeof ev.postureBonus === 'number' ? ev.postureBonus : 0;
        if (delta > 0 && tier >= 1) {
          out.push({
            text: tier >= 5 ? 'OVERDRIVE LV 5!' : `SYNC LV ${tier}`,
            tone: tier >= 5 ? 'crit' : 'slip',
            worldX: ev.x,
            worldY: 2.25,
            worldZ: ev.z,
            scale: tier >= 5 ? 1.28 : 1.08,
            duration: 0.85,
          });
        }
        break;
      }
      case 'chrono_execution_finisher': {
        const dmg = typeof ev.amount === 'number' && ev.amount > 0 ? ` ${Math.round(ev.amount)}` : '';
        out.push({
          text: `CHRONO BREAK!${dmg}`,
          tone: 'crit',
          worldX: ev.x,
          worldY: 2.35,
          worldZ: ev.z,
          scale: 1.38,
          duration: 0.95,
        });
        break;
      }
    }
  }
  return out;
}

export function projectNdcToViewport(
  ndcX: number,
  ndcY: number,
  ndcZ: number,
  viewportWidth: number,
  viewportHeight: number
): { visible: boolean; x: number; y: number } {
  if (
    !Number.isFinite(ndcX) ||
    !Number.isFinite(ndcY) ||
    !Number.isFinite(ndcZ) ||
    ndcZ < -1 ||
    ndcZ > 1 ||
    viewportWidth <= 0 ||
    viewportHeight <= 0
  ) {
    return { visible: false, x: 0, y: 0 };
  }
  const x = (ndcX * 0.5 + 0.5) * viewportWidth;
  const y = (-ndcY * 0.5 + 0.5) * viewportHeight;
  if (x < -40 || x > viewportWidth + 40 || y < -40 || y > viewportHeight + 40) {
    return { visible: false, x, y };
  }
  return { visible: true, x, y };
}

const RADAR_BLIP_PRIORITY: Record<RadarBlipKind, number> = {
  boss: 0,
  staggered: 1,
  telegraph: 2,
  enemy: 3,
  interactable: 4,
};

function clampToArena(value: number, radius: number): number {
  if (!Number.isFinite(value)) return 0;
  return Number(Math.max(-radius, Math.min(radius, value)).toFixed(2));
}

export interface RadarInteractableLike {
  id: string;
  x: number;
  z: number;
  status: string;
}

export interface RadarEchoLike {
  state: string;
  activeActor?: { x: number; z: number } | null;
}

export function computeTacticalRadarSnapshot(
  player: Pick<PlayerState, 'x' | 'z' | 'rotationY'>,
  aimYaw: number,
  arenaRadius: number,
  enemies: readonly Pick<EnemyState, 'id' | 'x' | 'z' | 'hp' | 'aiState'>[],
  boss: Pick<BossState, 'id' | 'x' | 'z' | 'hp' | 'aiState'> | null | undefined,
  echo: RadarEchoLike | null | undefined,
  objectiveTarget: { x: number; z: number } | null | undefined,
  interactables: readonly RadarInteractableLike[] = [],
  maxBlips = 16
): HudRadarSnapshot {
  const safeRadius = Number.isFinite(arenaRadius) && arenaRadius > 1 ? arenaRadius : 22;
  const blips: HudRadarBlip[] = [];

  if (boss && boss.hp > 0 && boss.aiState !== 'dormant') {
    const dist = Math.hypot(boss.x - player.x, boss.z - player.z);
    blips.push({
      id: `boss:${boss.id}`,
      kind: 'boss',
      x: clampToArena(boss.x, safeRadius),
      z: clampToArena(boss.z, safeRadius),
      distance: Number(dist.toFixed(2)),
    });
  }

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (e.hp <= 0 || e.aiState === 'ko') continue;
    const dist = Math.hypot(e.x - player.x, e.z - player.z);
    const kind: RadarBlipKind =
      e.aiState === 'staggered' || e.aiState === 'recovery'
        ? 'staggered'
        : e.aiState === 'telegraph' || e.aiState === 'attack'
          ? 'telegraph'
          : 'enemy';
    blips.push({
      id: `enemy:${e.id}`,
      kind,
      x: clampToArena(e.x, safeRadius),
      z: clampToArena(e.z, safeRadius),
      distance: Number(dist.toFixed(2)),
    });
  }

  for (let i = 0; i < interactables.length; i++) {
    const node = interactables[i];
    if (node.status === 'activated' || node.status === 'locked') continue;
    const dist = Math.hypot(node.x - player.x, node.z - player.z);
    blips.push({
      id: `node:${node.id}`,
      kind: 'interactable',
      x: clampToArena(node.x, safeRadius),
      z: clampToArena(node.z, safeRadius),
      distance: Number(dist.toFixed(2)),
    });
  }

  blips.sort((a, b) => {
    const prioDiff = RADAR_BLIP_PRIORITY[a.kind] - RADAR_BLIP_PRIORITY[b.kind];
    if (prioDiff !== 0) return prioDiff;
    return a.distance - b.distance;
  });

  if (blips.length > maxBlips) {
    blips.length = maxBlips;
  }

  const echoActive = Boolean(echo && echo.state === 'playback' && echo.activeActor);
  return {
    arenaRadius: safeRadius,
    playerX: clampToArena(player.x, safeRadius),
    playerZ: clampToArena(player.z, safeRadius),
    aimYaw: Number.isFinite(aimYaw) ? Number(aimYaw.toFixed(3)) : Number(player.rotationY.toFixed(3)),
    playerRotationY: Number.isFinite(player.rotationY) ? Number(player.rotationY.toFixed(3)) : 0,
    echoActive,
    echoX: echoActive && echo?.activeActor ? clampToArena(echo.activeActor.x, safeRadius) : null,
    echoZ: echoActive && echo?.activeActor ? clampToArena(echo.activeActor.z, safeRadius) : null,
    objectiveX: objectiveTarget ? clampToArena(objectiveTarget.x, safeRadius) : null,
    objectiveZ: objectiveTarget ? clampToArena(objectiveTarget.z, safeRadius) : null,
    blips,
  };
}

