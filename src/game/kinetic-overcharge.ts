import type { KineticOverchargeState, WeaponId } from './types.ts';

export const OVERCHARGE_MAX_CHARGE = 100;
export const OVERCHARGE_DURATION_SEC = 6.0;
export const OVERCHARGE_IDLE_DECAY_PER_SEC = 2.0;

export const OVERCHARGE_GAIN_LIGHT_HIT = 14;
export const OVERCHARGE_GAIN_HEAVY_HIT = 24;
export const OVERCHARGE_GAIN_PARRY = 22;
export const OVERCHARGE_GAIN_FLASH_SWAP = 20;

export interface WeaponOverchargePerk {
  weaponId: WeaponId;
  damageMult: number;
  staggerMult: number;
  attackSpeedMult: number;
  heatMult: number;
  chargeSpeedMult: number;
  damageTakenMult: number;
  vortexPullBonus: number;
  accentHex: number;
  accentCss: string;
  perkEn: string;
  perkVi: string;
}

export const WEAPON_OVERCHARGE_PERKS: Record<WeaponId, WeaponOverchargePerk> = {
  chrono_edge: {
    weaponId: 'chrono_edge',
    damageMult: 1.18,
    staggerMult: 1.15,
    attackSpeedMult: 1.24,
    heatMult: 1.0,
    chargeSpeedMult: 1.15,
    damageTakenMult: 1.0,
    vortexPullBonus: 0,
    accentHex: 0x38bdf8,
    accentCss: '#38bdf8',
    perkEn: 'PHANTOM EDGE · +24% SPD · +18% DMG',
    perkVi: 'KIẾM ẢO · +24% TỐC · +18% ST',
  },
  pulsecaster: {
    weaponId: 'pulsecaster',
    damageMult: 1.22,
    staggerMult: 1.12,
    attackSpeedMult: 1.15,
    heatMult: 0.0,
    chargeSpeedMult: 1.25,
    damageTakenMult: 1.0,
    vortexPullBonus: 0,
    accentHex: 0x0ea5e9,
    accentCss: '#38bdf8',
    perkEn: 'ZERO-HEAT PULSE · +22% DMG',
    perkVi: 'XUNG KHÔNG NHIỆT · +22% ST',
  },
  phase_rail: {
    weaponId: 'phase_rail',
    damageMult: 1.28,
    staggerMult: 1.2,
    attackSpeedMult: 1.1,
    heatMult: 0.45,
    chargeSpeedMult: 1.65,
    damageTakenMult: 1.0,
    vortexPullBonus: 0,
    accentHex: 0xe0f2fe,
    accentCss: '#e0f2fe',
    perkEn: 'INSTANT RAIL · +28% DMG · FAST CHARGE',
    perkVi: 'NẠP RAIL SIÊU TỐC · +28% ST',
  },
  grav_breaker: {
    weaponId: 'grav_breaker',
    damageMult: 1.2,
    staggerMult: 1.35,
    attackSpeedMult: 1.08,
    heatMult: 1.0,
    chargeSpeedMult: 1.2,
    damageTakenMult: 0.7,
    vortexPullBonus: 0,
    accentHex: 0xf59e0b,
    accentCss: '#fbbf24',
    perkEn: 'TITAN AEGIS · -30% DMG TAKEN · +35% STAGGER',
    perkVi: 'GIÁP TITAN · -30% ST NHẬN · +35% CHOÁNG',
  },
  chrono_scythe: {
    weaponId: 'chrono_scythe',
    damageMult: 1.24,
    staggerMult: 1.22,
    attackSpeedMult: 1.16,
    heatMult: 1.0,
    chargeSpeedMult: 1.25,
    damageTakenMult: 0.85,
    vortexPullBonus: 1.9,
    accentHex: 0xc084fc,
    accentCss: '#d8b4fe',
    perkEn: 'ASTRAL REAPER · +24% DMG · +1.9m VORTEX',
    perkVi: 'XOÁY THIÊN HÀ · +24% ST · +1.9m HÚT',
  },
};

export const NEUTRAL_OVERCHARGE_MODIFIERS: Readonly<WeaponOverchargePerk> = {
  weaponId: 'chrono_edge',
  damageMult: 1.0,
  staggerMult: 1.0,
  attackSpeedMult: 1.0,
  heatMult: 1.0,
  chargeSpeedMult: 1.0,
  damageTakenMult: 1.0,
  vortexPullBonus: 0,
  accentHex: 0x22d3ee,
  accentCss: '#22d3ee',
  perkEn: '',
  perkVi: '',
};

export function createInitialKineticOverchargeState(): KineticOverchargeState {
  return {
    charges: {
      chrono_edge: 0,
      pulsecaster: 0,
      phase_rail: 0,
      grav_breaker: 0,
      chrono_scythe: 0,
    },
    activeWeaponId: null,
    activeTimer: 0,
    maxDuration: OVERCHARGE_DURATION_SEC,
    totalOvercharges: 0,
  };
}

export interface KineticChargeOutcome {
  triggered: boolean;
  weaponId: WeaponId;
  charge: number;
  perk: WeaponOverchargePerk | null;
}

export function addWeaponKineticCharge(
  state: KineticOverchargeState,
  weaponId: WeaponId,
  amount: number
): KineticChargeOutcome {
  if (amount <= 0) {
    return {
      triggered: false,
      weaponId,
      charge: state.charges[weaponId] ?? 0,
      perk: null,
    };
  }

  // While this weapon is already actively Overcharging, hold meter at 0 until surge finishes
  if (state.activeWeaponId === weaponId && state.activeTimer > 0) {
    return {
      triggered: false,
      weaponId,
      charge: 0,
      perk: WEAPON_OVERCHARGE_PERKS[weaponId],
    };
  }

  const next = Math.min(OVERCHARGE_MAX_CHARGE, (state.charges[weaponId] ?? 0) + amount);
  if (next >= OVERCHARGE_MAX_CHARGE) {
    state.charges[weaponId] = 0;
    state.activeWeaponId = weaponId;
    state.activeTimer = state.maxDuration;
    state.totalOvercharges += 1;
    return {
      triggered: true,
      weaponId,
      charge: OVERCHARGE_MAX_CHARGE,
      perk: WEAPON_OVERCHARGE_PERKS[weaponId],
    };
  }

  state.charges[weaponId] = next;
  return {
    triggered: false,
    weaponId,
    charge: next,
    perk: null,
  };
}

export interface KineticTickOutcome {
  expired: boolean;
  expiredWeaponId: WeaponId | null;
}

export function tickWeaponKineticOvercharge(
  state: KineticOverchargeState,
  dt: number
): KineticTickOutcome {
  if (dt <= 0) return { expired: false, expiredWeaponId: null };

  let expired = false;
  let expiredWeaponId: WeaponId | null = null;

  if (state.activeTimer > 0 && state.activeWeaponId) {
    state.activeTimer = Math.max(0, state.activeTimer - dt);
    if (state.activeTimer <= 0) {
      expired = true;
      expiredWeaponId = state.activeWeaponId;
      state.activeWeaponId = null;
    }
  }

  // Gentle passive decay on non-overcharged partial meters
  const weapons: readonly WeaponId[] = [
    'chrono_edge',
    'pulsecaster',
    'phase_rail',
    'grav_breaker',
    'chrono_scythe',
  ];
  for (let i = 0; i < weapons.length; i++) {
    const id = weapons[i];
    if (state.charges[id] > 0) {
      state.charges[id] = Math.max(0, state.charges[id] - OVERCHARGE_IDLE_DECAY_PER_SEC * dt);
    }
  }

  return { expired, expiredWeaponId };
}

export function getActiveWeaponOverchargeModifiers(
  state: KineticOverchargeState | undefined,
  equippedWeaponId: WeaponId
): WeaponOverchargePerk & { isActive: boolean } {
  if (
    state &&
    state.activeTimer > 0 &&
    state.activeWeaponId === equippedWeaponId
  ) {
    return {
      ...WEAPON_OVERCHARGE_PERKS[equippedWeaponId],
      isActive: true,
    };
  }
  return {
    ...NEUTRAL_OVERCHARGE_MODIFIERS,
    weaponId: equippedWeaponId,
    isActive: false,
  };
}
