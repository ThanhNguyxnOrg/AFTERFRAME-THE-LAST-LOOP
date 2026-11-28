import type {
  AppLocale,
  ArenaBoostPad,
  ArenaFluxPool,
  ArenaFragmentCacheState,
  ArenaTemporalRift,
  BossState,
  CombatEvent,
  EnemyState,
  HoloMemoryId,
  HudRadarBlip,
  HudRadarBoostPad,
  HudRadarObstacle,
  HudRadarSnapshot,
  ObstacleCollider,
  PlayerState,
  RadarBlipKind,
  SectorTacticalBeaconState,
  TacticalWaypointState,
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
  events: readonly CombatEvent[],
  locale: AppLocale = 'en'
): CombatCalloutSpec[] {
  const isVi = locale === 'vi';
  const out: CombatCalloutSpec[] = [];
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    switch (ev.type) {
      case 'player_parry_success':
        out.push({
          text: isVi ? 'ĐỠ ĐÒN! +35F' : 'PARRY! +35F',
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
          text: isVi ? `LƯỚT PHA +${gain}F` : `CHRONO SLIP +${gain}F`,
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
          text: isVi ? `HỘI TỤ!${dmg}` : `CONVERGE!${dmg}`,
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
          text: isVi ? 'PHÁ TƯ THẾ!' : 'STAGGER!',
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
            text: isVi
              ? dmg > 0
                ? `ĐỠ KHIÊN ${dmg}`
                : 'ĐỠ KHIÊN'
              : dmg > 0
                ? `GUARD ${dmg}`
                : 'GUARDED',
            tone: 'blocked',
            worldX: ev.x,
            worldY: 1.85,
            worldZ: ev.z,
            scale: 0.92,
            duration: 0.62,
          });
        } else if (dmg > 0) {
          const prefix =
            ev.flowKind === 'riposte'
              ? isVi
                ? 'PHẢN KÍCH '
                : 'RIPOSTE '
              : ev.flowKind === 'chrono_slip'
                ? isVi
                  ? 'LƯỚT '
                  : 'SLIP '
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
          text: isVi ? 'XẢ NHIỆT CHUẨN! QUÁ TẢI' : 'ACTIVE VENT! OVERCHARGED',
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
          text: isVi ? 'KẸT VAN NHIỆT' : 'VENT JAMMED',
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
            text:
              tier >= 5
                ? isVi
                  ? 'QUÁ TẢI CẤP 5!'
                  : 'OVERDRIVE LV 5!'
                : isVi
                  ? `ĐỒNG BỘ CẤP ${tier}`
                  : `SYNC LV ${tier}`,
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
          text: isVi ? `KẾT LIỄU!${dmg}` : `CHRONO BREAK!${dmg}`,
          tone: 'crit',
          worldX: ev.x,
          worldY: 2.35,
          worldZ: ev.z,
          scale: 1.38,
          duration: 0.96,
        });
        break;
      }
      case 'phase_stalker_blink':
        out.push({
          text: isVi ? 'DỊCH CHUYỂN PHA!' : 'PHASE BLINK!',
          tone: 'slip',
          worldX: ev.x,
          worldY: 2.15,
          worldZ: ev.z,
          scale: 1.06,
          duration: 0.72,
        });
        break;
      case 'chrono_mortar_barrage_fired':
        out.push({
          text: isVi ? 'PHÁO CỐI ĐỊA CHẤN!' : 'MORTAR BARRAGE!',
          tone: 'hurt',
          worldX: ev.originX ?? ev.x,
          worldY: 2.45,
          worldZ: ev.originZ ?? ev.z,
          scale: 1.12,
          duration: 0.84,
        });
        break;
      case 'conductor_tether_severed': {
        const stag =
          typeof ev.amount === 'number' && ev.amount > 0
            ? isVi
              ? ` +${Math.round(ev.amount)} CHOÁNG`
              : ` +${Math.round(ev.amount)} STAG`
            : '';
        out.push({
          text: isVi ? `ĐỨT DÂY CỘNG HƯỞNG!${stag}` : `TETHER SEVERED!${stag}`,
          tone: 'stagger',
          worldX: ev.x,
          worldY: 2.3,
          worldZ: ev.z,
          scale: 1.22,
          duration: 0.9,
        });
        break;
      }
      case 'volatile_core_detonated':
        out.push({
          text: isVi ? 'NỔ LÕI BẤT ỔN!' : 'VOLATILE BLAST!',
          tone: 'hurt',
          worldX: ev.x,
          worldY: 2.25,
          worldZ: ev.z,
          scale: 1.24,
          duration: 0.85,
        });
        break;
      case 'obstacle_destroyed':
        out.push({
          text: isVi ? 'QUÁ TẢI TỤ! +12F' : 'OVERLOAD! +12F',
          tone: 'crit',
          worldX: ev.x,
          worldY: 1.85,
          worldZ: ev.z,
          scale: 1.16,
          duration: 0.8,
        });
        break;
      case 'boost_pad_triggered':
        out.push({
          text: isVi ? 'TĂNG TỐC +24% · +8F' : 'SURGE +24% SPD · +8F',
          tone: 'slip',
          worldX: ev.x,
          worldY: 1.9,
          worldZ: ev.z,
          scale: 1.08,
          duration: 0.72,
        });
        break;
      case 'temporal_thread_triggered': {
        const gain = typeof ev.amount === 'number' && ev.amount > 0 ? Math.round(ev.amount) : 14;
        out.push({
          text: isVi ? `MẠCH THỜI GIAN! +${gain}F` : `THREAD! +${gain}F · SURGE`,
          tone: 'slip',
          worldX: ev.x,
          worldY: 2.05,
          worldZ: ev.z,
          scale: 1.2,
          duration: 0.82,
        });
        break;
      }
      case 'flux_pool_spawned':
        out.push({
          text: isVi ? 'HỒ FLUX 7s' : 'FLUX POOL 7s',
          tone: 'converge',
          worldX: ev.x,
          worldY: 2.15,
          worldZ: ev.z,
          scale: 1.05,
          duration: 0.75,
        });
        break;
      case 'fragment_cache_claimed':
        out.push({
          text: isVi ? '+1 MẢNH KÝ ỨC' : '+1 MEMORY FRAGMENT',
          tone: 'parry',
          worldX: ev.x,
          worldY: 2.25,
          worldZ: ev.z,
          scale: 1.24,
          duration: 0.92,
        });
        break;
      case 'sector_beacon_activated':
        out.push({
          text: isVi ? 'KÍCH HOẠT TRỤ KHU VỰC!' : 'SECTOR BEACON SURGE!',
          tone: 'converge',
          worldX: ev.x,
          worldY: 2.3,
          worldZ: ev.z,
          scale: 1.26,
          duration: 0.9,
        });
        break;
      case 'weapon_upgrade_overclocked':
        out.push({
          text: isVi ? 'ÉP XUNG MK.II!' : 'MK.II OVERCLOCKED!',
          tone: 'crit',
          worldX: ev.x,
          worldY: 2.25,
          worldZ: ev.z,
          scale: 1.25,
          duration: 0.88,
        });
        break;
      case 'weapon_mythic_awakened':
        out.push({
          text: isVi ? 'THỨC TỈNH MK.III THẦN THOẠI!' : 'MK.III MYTHIC AWAKENED!',
          tone: 'converge',
          worldX: ev.x,
          worldY: 2.35,
          worldZ: ev.z,
          scale: 1.34,
          duration: 1.05,
        });
        break;
      case 'rig_module_overclocked':
        out.push({
          text: isVi ? 'ÉP XUNG KHUNG GIÁP MK.II!' : 'RIG MK.II OVERCLOCKED!',
          tone: 'crit',
          worldX: ev.x,
          worldY: 2.28,
          worldZ: ev.z,
          scale: 1.26,
          duration: 0.9,
        });
        break;
      case 'sentinel_mode_switched':
        out.push({
          text: isVi
            ? ev.amount && ev.amount > 0
              ? `LYS-04 BẬT · +${ev.amount} GIÁP`
              : 'LYS-04 CHỜ'
            : ev.amount && ev.amount > 0
              ? `LYS-04 ACTIVE · +${ev.amount} WARD`
              : 'LYS-04 STANDBY',
          tone: 'slip',
          worldX: ev.x,
          worldY: 2.22,
          worldZ: ev.z,
          scale: 1.18,
          duration: 0.78,
        });
        break;
      case 'echo_doctrine_switched': {
        const docIdx = typeof ev.amount === 'number' ? Math.round(ev.amount) : 0;
        const label =
          docIdx === 1
            ? isVi
              ? 'VỌNG ẢNH · TIÊN PHONG'
              : 'DOCTRINE · VANGUARD'
            : docIdx === 2
              ? isVi
                ? 'VỌNG ẢNH · PHÁO ĐÀI'
                : 'DOCTRINE · BASTION'
              : docIdx === 3
                ? isVi
                  ? 'VỌNG ẢNH · TÂN TINH'
                  : 'DOCTRINE · NOVA'
                : isVi
                  ? 'VỌNG ẢNH · CHUẨN'
                  : 'DOCTRINE · STANDARD';
        out.push({
          text: label,
          tone: 'slip',
          worldX: ev.x,
          worldY: 2.24,
          worldZ: ev.z,
          scale: 1.18,
          duration: 0.8,
        });
        break;
      }
      case 'echo_doctrine_nova_pulse': {
        const dmg = typeof ev.amount === 'number' && ev.amount > 0 ? ` ${Math.round(ev.amount)}` : '';
        out.push({
          text: isVi ? `XUNG TÂN TINH!${dmg}` : `NOVA RIFT!${dmg}`,
          tone: 'converge',
          worldX: ev.x,
          worldY: 2.28,
          worldZ: ev.z,
          scale: 1.24,
          duration: 0.84,
        });
        break;
      }
      case 'sovereign_astral_pulse': {
        const dmg = typeof ev.amount === 'number' && ev.amount > 0 ? ` ${Math.round(ev.amount)}` : '';
        out.push({
          text: isVi ? `XUNG TINH TÚ!${dmg}` : `ASTRAL PULSE!${dmg}`,
          tone: 'converge',
          worldX: ev.x,
          worldY: 2.42,
          worldZ: ev.z,
          scale: 1.24,
          duration: 0.86,
        });
        break;
      }
      case 'chrono_ward_absorbed':
        out.push({
          text: isVi ? `GIÁP -${ev.amount ?? 0}` : `WARD -${ev.amount ?? 0}`,
          tone: 'parry',
          worldX: ev.x,
          worldY: 2.15,
          worldZ: ev.z,
          scale: 1.12,
          duration: 0.65,
        });
        break;
      case 'chrono_ward_shatter':
        out.push({
          text: isVi ? 'NỔ VỠ GIÁP CHRONO!' : 'WARD SHATTER PULSE!',
          tone: 'converge',
          worldX: ev.x,
          worldY: 2.3,
          worldZ: ev.z,
          scale: 1.3,
          duration: 0.92,
        });
        break;
      case 'phantom_afterimage_strike':
        out.push({
          text: isVi ? `DƯ ẢNH +${ev.amount ?? 0}` : `AFTERIMAGE +${ev.amount ?? 0}`,
          tone: 'converge',
          worldX: ev.x,
          worldY: 2.25,
          worldZ: ev.z,
          scale: 1.16,
          duration: 0.72,
        });
        break;
      case 'boss_core_unlocked':
        out.push({
          text: isVi ? 'THU HỒI LÕI THỐNG LĨNH!' : 'BOSS CORE HARVESTED!',
          tone: 'converge',
          worldX: ev.x,
          worldY: 2.35,
          worldZ: ev.z,
          scale: 1.32,
          duration: 1.0,
        });
        break;
      case 'boss_core_equipped':
        out.push({
          text: isVi
            ? ev.amount && ev.amount > 0
              ? `LÕI THỐNG LĨNH · +${ev.amount} GIÁP`
              : 'ĐÃ CẬP NHẬT LÕI BOSS'
            : ev.amount && ev.amount > 0
              ? `BOSS CORE · +${ev.amount} WARD`
              : 'BOSS CORE UPDATED',
          tone: 'slip',
          worldX: ev.x,
          worldY: 2.24,
          worldZ: ev.z,
          scale: 1.2,
          duration: 0.85,
        });
        break;
      case 'boss_core_pulse': {
        const pulseAmt = typeof ev.amount === 'number' && ev.amount > 0 ? ` ${Math.round(ev.amount)}` : '';
        out.push({
          text: isVi ? `XUNG LÕI BOSS!${pulseAmt}` : `CORE RESONANCE!${pulseAmt}`,
          tone: 'converge',
          worldX: ev.x,
          worldY: 2.28,
          worldZ: ev.z,
          scale: 1.24,
          duration: 0.82,
        });
        break;
      }
      case 'boss_core_omega_awakened':
        out.push({
          text: isVi ? 'THỨC TỈNH LÕI OMEGA Ω!' : 'OMEGA CORE AWAKENED Ω!',
          tone: 'converge',
          worldX: ev.x,
          worldY: 2.38,
          worldZ: ev.z,
          scale: 1.32,
          duration: 1.05,
        });
        break;
      case 'confluence_burst_triggered': {
        const burstAmt = typeof ev.amount === 'number' && ev.amount > 0 ? ` ${Math.round(ev.amount)}` : '';
        out.push({
          text: isVi ? `TUYỆT KỸ HỢP LƯU!${burstAmt}` : `CONFLUENCE BURST!${burstAmt}`,
          tone: 'converge',
          worldX: ev.x,
          worldY: 2.42,
          worldZ: ev.z,
          scale: 1.34,
          duration: 0.96,
        });
        break;
      }
      case 'neural_protocol_purchased':
        out.push({
          text: isVi ? 'ĐÃ CÀI GIAO THỨC' : 'PROTOCOL INSTALLED',
          tone: 'slip',
          worldX: ev.x,
          worldY: 2.2,
          worldZ: ev.z,
          scale: 1.2,
          duration: 0.85,
        });
        break;
      case 'story_choice_resolved':
        out.push({
          text: isVi ? 'KHÓA LẬP TRƯỜNG · +1 MẢNH' : 'CHRONICLE STANCE LOCKED · +1 FRAG',
          tone: 'converge',
          worldX: ev.x,
          worldY: 2.35,
          worldZ: ev.z,
          scale: 1.22,
          duration: 0.95,
        });
        break;
      case 'holo_memory_projected':
        out.push({
          text: isVi ? 'KÝ ỨC LYSA ĐỒNG BỘ!' : 'LYSA HOLO-MEMORY SYNCED!',
          tone: 'converge',
          worldX: ev.x,
          worldY: 2.4,
          worldZ: ev.z,
          scale: 1.28,
          duration: 1.0,
        });
        break;
      case 'temporal_rift_spawned':
        out.push({
          text: isVi ? 'PHÁT HIỆN KHE NỨT!' : 'TEMPORAL RIFT DETECTED!',
          tone: 'converge',
          worldX: ev.x,
          worldY: 2.35,
          worldZ: ev.z,
          scale: 1.26,
          duration: 0.95,
        });
        break;
      case 'temporal_rift_sealed':
        out.push({
          text: isVi ? 'PHONG ẤN KHE NỨT! +28F' : 'RIFT SEALED! +28F · SURGE',
          tone: 'parry',
          worldX: ev.x,
          worldY: 2.3,
          worldZ: ev.z,
          scale: 1.28,
          duration: 0.92,
        });
        break;
      case 'temporal_rift_ruptured':
        out.push({
          text: isVi ? 'KHE NỨT PHÁT NỔ!' : 'RIFT RUPTURED!',
          tone: 'hurt',
          worldX: ev.x,
          worldY: 2.25,
          worldZ: ev.z,
          scale: 1.22,
          duration: 0.9,
        });
        break;
      case 'recursion_loop_cleared':
        out.push({
          text: isVi ? 'VƯỢT VÒNG LẶP · CHỌN DI VẬT' : 'LOOP CLEARED · SELECT RELIC',
          tone: 'slip',
          worldX: ev.x,
          worldY: 2.4,
          worldZ: ev.z,
          scale: 1.32,
          duration: 1.0,
        });
        break;
      case 'recursion_relic_picked':
        out.push({
          text: isVi ? 'ĐÃ LẮP DI VẬT CHRONO' : 'CHRONO RELIC INSTALLED',
          tone: 'crit',
          worldX: ev.x,
          worldY: 2.25,
          worldZ: ev.z,
          scale: 1.22,
          duration: 0.88,
        });
        break;
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
  maxBlips = 16,
  obstacles: readonly Pick<
    ObstacleCollider,
    'id' | 'x' | 'z' | 'radius' | 'disabled' | 'kind' | 'destructible' | 'hp' | 'maxHp'
  >[] = [],
  boostPads: readonly Pick<ArenaBoostPad, 'id' | 'x' | 'z' | 'cooldown'>[] = [],
  fluxPools: readonly Pick<ArenaFluxPool, 'id' | 'x' | 'z' | 'radius' | 'remainingTime' | 'maxDuration'>[] = [],
  waypoint: TacticalWaypointState | null = null,
  fragmentCaches: readonly Pick<ArenaFragmentCacheState, 'id' | 'label' | 'x' | 'z' | 'claimed'>[] = [],
  sectorBeacons: readonly Pick<SectorTacticalBeaconState, 'id' | 'label' | 'x' | 'z' | 'cooldown'>[] = [],
  temporalRift: ArenaTemporalRift | null = null,
  holoProjector: {
    id: HoloMemoryId;
    label: string;
    x: number;
    z: number;
    discovered: boolean;
  } | null = null
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

  const radarObstacles: HudRadarObstacle[] = [];
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    if (obs.disabled) continue;
    const kind = obs.kind ?? 'pillar';
    if (kind === 'barrier') continue;
    const maxHp = Math.max(1, obs.maxHp ?? 1);
    const hpRatio = obs.destructible
      ? Number(Math.max(0, Math.min(1, (obs.hp ?? maxHp) / maxHp)).toFixed(2))
      : 1;
    radarObstacles.push({
      id: obs.id,
      x: clampToArena(obs.x, safeRadius),
      z: clampToArena(obs.z, safeRadius),
      radius: Number(Math.max(0.4, obs.radius).toFixed(2)),
      kind,
      destructible: Boolean(obs.destructible),
      hpRatio,
    });
  }

  const radarBoostPads: HudRadarBoostPad[] = [];
  for (let i = 0; i < boostPads.length; i++) {
    const pad = boostPads[i];
    radarBoostPads.push({
      id: pad.id,
      x: clampToArena(pad.x, safeRadius),
      z: clampToArena(pad.z, safeRadius),
      ready: pad.cooldown <= 0,
    });
  }

  const radarFluxPools = fluxPools
    .filter((fp) => fp.remainingTime > 0)
    .map((fp) => ({
      id: fp.id,
      x: clampToArena(fp.x, safeRadius),
      z: clampToArena(fp.z, safeRadius),
      radius: Number(Math.max(0.5, fp.radius).toFixed(2)),
      remainingRatio: Number(
        Math.max(0, Math.min(1, fp.remainingTime / Math.max(0.1, fp.maxDuration))).toFixed(2)
      ),
    }));

  const radarFragmentCaches = fragmentCaches.map((fc) => ({
    id: fc.id,
    label: fc.label,
    x: clampToArena(fc.x, safeRadius),
    z: clampToArena(fc.z, safeRadius),
    claimed: Boolean(fc.claimed),
  }));

  const radarSectorBeacons = sectorBeacons.map((sb) => ({
    id: sb.id,
    label: sb.label,
    x: clampToArena(sb.x, safeRadius),
    z: clampToArena(sb.z, safeRadius),
    ready: sb.cooldown <= 0,
  }));

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
    obstacles: radarObstacles,
    boostPads: radarBoostPads,
    fluxPools: radarFluxPools,
    fragmentCaches: radarFragmentCaches,
    sectorBeacons: radarSectorBeacons,
    waypoint: waypoint ? { ...waypoint } : null,
    temporalRift:
      temporalRift
        ? {
            ...temporalRift,
            x: clampToArena(temporalRift.x, safeRadius),
            z: clampToArena(temporalRift.z, safeRadius),
          }
        : null,
    holoProjector: holoProjector
      ? {
          id: holoProjector.id,
          label: holoProjector.label,
          x: clampToArena(holoProjector.x, safeRadius),
          z: clampToArena(holoProjector.z, safeRadius),
          discovered: Boolean(holoProjector.discovered),
        }
      : null,
  };
}

export type CommsSpeakerGlyph = 'lysa' | 'warden' | 'sera' | 'boss';

export interface CommsCodecProfile {
  glyph: CommsSpeakerGlyph;
  channelCode: string;
  frequencyLabel: string;
  accentHex: string;
  bars: number[];
}

export function computeCommsCodecProfile(
  speaker: string,
  classification: string,
  remainingTime: number,
  maxDuration: number,
  reducedMotion = false
): CommsCodecProfile {
  const spk = (speaker || '').toUpperCase();
  const cls = (classification || '').toUpperCase();

  let glyph: CommsSpeakerGlyph = 'boss';
  let channelCode = 'TRC-09';
  let frequencyLabel = 'SIG // 88.4';
  let accentHex = '#fbbf24';
  let cadence = 11.5;

  if (spk.includes('LYSA')) {
    glyph = 'lysa';
    channelCode = 'CH-04';
    frequencyLabel = '142.8 MHz';
    accentHex = '#22d3ee';
    cadence = 10.2;
  } else if (spk.includes('WARDEN') && !spk.includes('PRIME')) {
    glyph = 'warden';
    channelCode = 'SYS-00';
    frequencyLabel = 'OVR // 00.0';
    accentHex = '#f87171';
    cadence = 15.8;
  } else if (cls === 'LIVE WARDEN DIRECTIVE') {
    glyph = 'warden';
    channelCode = 'SYS-00';
    frequencyLabel = 'OVR // 00.0';
    accentHex = '#f87171';
    cadence = 15.8;
  } else if (spk.includes('SERA')) {
    glyph = 'sera';
    channelCode = 'RIG-01';
    frequencyLabel = 'SYNC // 01';
    accentHex = '#34d399';
    cadence = 12.6;
  }

  if (reducedMotion) {
    return {
      glyph,
      channelCode,
      frequencyLabel,
      accentHex,
      bars: [0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45],
    };
  }

  const elapsed = Math.max(0, (maxDuration || 6) - Math.max(0, remainingTime || 0));
  const bars: number[] = [];
  for (let i = 0; i < 7; i++) {
    const waveA = Math.sin(elapsed * cadence + i * 1.15) * 0.5 + 0.5;
    const waveB = Math.cos(elapsed * (cadence * 0.57) - i * 0.85) * 0.5 + 0.5;
    const bell = 1 - Math.abs(i - 3) * 0.14;
    const val = Math.max(0.22, Math.min(0.98, (0.28 + 0.7 * (waveA * 0.62 + waveB * 0.38)) * bell));
    bars.push(Number(val.toFixed(3)));
  }

  return {
    glyph,
    channelCode,
    frequencyLabel,
    accentHex,
    bars,
  };
}


