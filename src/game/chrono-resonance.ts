import { computeWeaponMasteryRankInfo } from './recursion-mode.ts';
import type {
  WeaponId,
  WeaponResonanceId,
  WeaponResonanceState,
} from './types.ts';

export interface WeaponResonanceSpec {
  id: WeaponResonanceId;
  accentHex: number;
  accentCss: string;
  durationSec: number;
  damageMult: number;
  staggerMult: number;
  fluxBurst: number;
  heatVentAmount: number;
  shockwaveRadius: number;
  shockwaveStagger: number;
  labelEn: string;
  labelVi: string;
  pairRuleEn: string;
  pairRuleVi: string;
  effectEn: string;
  effectVi: string;
}

export const WEAPON_RESONANCE_SPECS: Record<WeaponResonanceId, WeaponResonanceSpec> = {
  blade_reaper: {
    id: 'blade_reaper',
    accentHex: 0x22d3ee,
    accentCss: '#22d3ee',
    durationSec: 3.2,
    damageMult: 1.2,
    staggerMult: 1.22,
    fluxBurst: 10,
    heatVentAmount: 0,
    shockwaveRadius: 0,
    shockwaveStagger: 0,
    labelEn: 'BLADE REAPER · +20% DMG',
    labelVi: 'SONG KIẾM THỜI KHÔNG · +20% ST',
    pairRuleEn: 'Chrono Edge [1] ↔ Chrono Scythe [5]',
    pairRuleVi: 'Chrono Edge [1] ↔ Lưỡi Hái [5]',
    effectEn: '+20% DMG, +22% Stagger & +10 Flux surge for 3.2s',
    effectVi: '+20% Sát thương, +22% Phá giáp & hồi +10 Năng lượng trong 3.2s',
  },
  plasma_overload: {
    id: 'plasma_overload',
    accentHex: 0x38bdf8,
    accentCss: '#38bdf8',
    durationSec: 3.2,
    damageMult: 1.18,
    staggerMult: 1.0,
    fluxBurst: 6,
    heatVentAmount: 35,
    shockwaveRadius: 0,
    shockwaveStagger: 0,
    labelEn: 'PLASMA OVERLOAD · VENT -35',
    labelVi: 'QUÁ TẢI PLASMA · XẢ NHIỆT -35',
    pairRuleEn: 'Pulsecaster [2] ↔ Phase Rail [3]',
    pairRuleVi: 'Pulsecaster [2] ↔ Phase Rail [3]',
    effectEn: 'Instant -35 Heat vent + 18% Ranged DMG for 3.2s',
    effectVi: 'Xả tức thì -35 Nhiệt + tăng 18% Sát thương tầm xa trong 3.2s',
  },
  seismic_vortex: {
    id: 'seismic_vortex',
    accentHex: 0xf59e0b,
    accentCss: '#fbbf24',
    durationSec: 3.2,
    damageMult: 1.15,
    staggerMult: 1.25,
    fluxBurst: 8,
    heatVentAmount: 0,
    shockwaveRadius: 4.4,
    shockwaveStagger: 22,
    labelEn: 'SEISMIC VORTEX · SHOCKWAVE',
    labelVi: 'CHẤN ĐỘNG HỐ ĐEN · SÓNG XUNG KÍCH',
    pairRuleEn: 'Grav-Breaker [4] ↔ Edge [1] / Scythe [5]',
    pairRuleVi: 'Búa Trọng Lực [4] ↔ Kiếm [1] / Lưỡi Hái [5]',
    effectEn: '4.4m Gravity Pull Shockwave (+22 Stagger) + 15% DMG',
    effectVi: 'Sóng kéo trọng lực 4.4m (+22 Choáng) + 15% Sát thương',
  },
  temporal_flux_shift: {
    id: 'temporal_flux_shift',
    accentHex: 0xa78bfa,
    accentCss: '#c4b5fd',
    durationSec: 3.0,
    damageMult: 1.14,
    staggerMult: 1.0,
    fluxBurst: 8,
    heatVentAmount: 15,
    shockwaveRadius: 0,
    shockwaveStagger: 0,
    labelEn: 'TEMPORAL SHIFT · +14% DMG',
    labelVi: 'CHUYỂN PHA THỜI KHÔNG · +14% ST',
    pairRuleEn: 'Any Melee [1/4/5] ↔ Any Ranged [2/3]',
    pairRuleVi: 'Mọi Cận Chiến [1/4/5] ↔ Mọi Tầm Xa [2/3]',
    effectEn: '+14% DMG, -15 Heat & +8 Flux surge for 3.0s',
    effectVi: '+14% Sát thương, xả -15 Nhiệt & hồi +8 Năng lượng trong 3.0s',
  },
};

export const ORDERED_WEAPON_RESONANCE_IDS: readonly WeaponResonanceId[] = [
  'blade_reaper',
  'plasma_overload',
  'seismic_vortex',
  'temporal_flux_shift',
];

const RANGED_SET = new Set<WeaponId>(['pulsecaster', 'phase_rail']);

export function resolveWeaponSwapResonanceId(
  fromWeapon: WeaponId,
  toWeapon: WeaponId
): WeaponResonanceId | null {
  if (fromWeapon === toWeapon) return null;
  const pair = new Set<WeaponId>([fromWeapon, toWeapon]);
  if (pair.has('chrono_edge') && pair.has('chrono_scythe')) {
    return 'blade_reaper';
  }
  if (pair.has('pulsecaster') && pair.has('phase_rail')) {
    return 'plasma_overload';
  }
  if (
    pair.has('grav_breaker') &&
    (pair.has('chrono_edge') || pair.has('chrono_scythe'))
  ) {
    return 'seismic_vortex';
  }
  const fromRanged = RANGED_SET.has(fromWeapon);
  const toRanged = RANGED_SET.has(toWeapon);
  if (fromRanged !== toRanged) {
    return 'temporal_flux_shift';
  }
  return 'temporal_flux_shift';
}

export function createInitialWeaponResonanceState(): WeaponResonanceState {
  return {
    activeId: null,
    timer: 0,
    cooldown: 0,
    fromWeaponId: null,
    toWeaponId: null,
    totalTriggers: 0,
  };
}

export function triggerWeaponSwapResonance(
  state: WeaponResonanceState,
  fromWeapon: WeaponId,
  toWeapon: WeaponId
): WeaponResonanceSpec | null {
  if (state.cooldown > 0) return null;
  const id = resolveWeaponSwapResonanceId(fromWeapon, toWeapon);
  if (!id) return null;
  const spec = WEAPON_RESONANCE_SPECS[id];
  state.activeId = id;
  state.timer = spec.durationSec;
  state.cooldown = 3.5;
  state.fromWeaponId = fromWeapon;
  state.toWeaponId = toWeapon;
  state.totalTriggers += 1;
  return spec;
}

export function tickWeaponResonanceState(
  state: WeaponResonanceState,
  dt: number
): void {
  const safeDt = Math.max(0, dt);
  if (state.cooldown > 0) {
    state.cooldown = Math.max(0, state.cooldown - safeDt);
  }
  if (state.timer > 0) {
    state.timer = Math.max(0, state.timer - safeDt);
    if (state.timer <= 0) {
      state.activeId = null;
    }
  }
}

export function getActiveWeaponResonanceModifiers(
  state: WeaponResonanceState | undefined
): { damageMult: number; staggerMult: number; activeSpec: WeaponResonanceSpec | null } {
  if (!state || !state.activeId || state.timer <= 0) {
    return { damageMult: 1.0, staggerMult: 1.0, activeSpec: null };
  }
  const spec = WEAPON_RESONANCE_SPECS[state.activeId];
  return {
    damageMult: spec.damageMult,
    staggerMult: spec.staggerMult,
    activeSpec: spec,
  };
}

export interface GlobalArsenalMasteryBonus {
  totalRanks: number;
  bonusRanks: number;
  damageBonusPct: number;
  staggerBonusPct: number;
  fluxGainBonusPct: number;
  damageMult: number;
  staggerMult: number;
  fluxGainMult: number;
}

const ALL_WEAPONS: readonly WeaponId[] = [
  'chrono_edge',
  'pulsecaster',
  'phase_rail',
  'grav_breaker',
  'chrono_scythe',
];

export function computeGlobalArsenalMasteryBonus(
  weaponMasteryXp: Partial<Record<WeaponId, number>> | undefined
): GlobalArsenalMasteryBonus {
  let totalRanks = 0;
  for (let i = 0; i < ALL_WEAPONS.length; i++) {
    const xp = weaponMasteryXp?.[ALL_WEAPONS[i]] ?? 0;
    totalRanks += computeWeaponMasteryRankInfo(xp).rank;
  }
  // Baseline is 5 weapons x Rank 1 = 5 total ranks (neutral 1.0x until player levels weapons)
  const bonusRanks = Math.max(0, totalRanks - ALL_WEAPONS.length);
  const damageBonusPct = Math.min(20, bonusRanks * 1);
  const staggerBonusPct = Math.min(30, Math.round(bonusRanks * 1.5));
  const fluxGainBonusPct = Math.min(40, bonusRanks * 2);
  return {
    totalRanks,
    bonusRanks,
    damageBonusPct,
    staggerBonusPct,
    fluxGainBonusPct,
    damageMult: 1 + damageBonusPct / 100,
    staggerMult: 1 + staggerBonusPct / 100,
    fluxGainMult: 1 + fluxGainBonusPct / 100,
  };
}
