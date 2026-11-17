import type {
  RigEffectiveModifiers,
  RigModuleDefinition,
  RigModuleId,
  RigModuleSlot,
} from './types.ts';

export const VALID_RIG_MODULE_SLOTS: readonly RigModuleSlot[] = [
  'temporal_core',
  'defensive_chassis',
  'tactical_harness',
];

export const VALID_RIG_MODULE_IDS: readonly RigModuleId[] = [
  'rig_chrono_spool',
  'rig_resonance_prism',
  'rig_reactive_plating',
  'rig_kinetic_dynamo',
  'rig_flux_salvager',
  'rig_adrenaline_overclock',
];

export const RIG_SLOT_LABELS: Record<RigModuleSlot, string> = {
  temporal_core: 'CHRONO CORE',
  defensive_chassis: 'CHASSIS & RECOVERY',
  tactical_harness: 'TACTICAL HARNESS',
};

export const RIG_MODULES: Record<RigModuleId, RigModuleDefinition> = {
  rig_chrono_spool: {
    id: 'rig_chrono_spool',
    slot: 'temporal_core',
    slotLabel: RIG_SLOT_LABELS.temporal_core,
    name: 'CHRONO SPOOL MK.II',
    shortLabel: 'CHRONO SPOOL',
    roleLabel: 'EXTENDED ECHO & LOW-COST RELAY',
    cost: 2,
    summary:
      'Expanded magnetic tape spool extending Chrono Echo memory and trimming Relay phase-warp power draw.',
    benefitText: '+2.0s Max Echo Recording (10.0s) & -5 Relay Flux cost (20F)',
    tradeoffText: '+0.25s Relay cooldown (1.25s vs 1.0s)',
  },
  rig_resonance_prism: {
    id: 'rig_resonance_prism',
    slot: 'temporal_core',
    slotLabel: RIG_SLOT_LABELS.temporal_core,
    name: 'RESONANCE FOCUS PRISM',
    shortLabel: 'RESONANCE PRISM',
    roleLabel: 'HIGH-BURST CONVERGENCE AMPLIFIER',
    cost: 3,
    summary:
      'Refracts overlapping Echo and live kinetic strikes into direct structural shear and extended enemy stagger.',
    benefitText: '+14 Resonance Convergence HP damage & +0.45s stagger window',
    tradeoffText: '+3 Convergence Flux cost (18F base)',
  },
  rig_reactive_plating: {
    id: 'rig_reactive_plating',
    slot: 'defensive_chassis',
    slotLabel: RIG_SLOT_LABELS.defensive_chassis,
    name: 'REACTIVE AEGIS PLATING',
    shortLabel: 'REACTIVE PLATING',
    roleLabel: 'ARMOR REINFORCEMENT & RIPOSTE HARVEST',
    cost: 2,
    summary:
      'Layered ceramic-phase torso armor paired with kinetic capacitors that harvest Flux on clean defensive timing.',
    benefitText: '+25 Max Integrity (125 HP) & +10 bonus Flux on Parry / Chrono Slip',
    tradeoffText: '-6% base walk speed when not Surging',
  },
  rig_kinetic_dynamo: {
    id: 'rig_kinetic_dynamo',
    slot: 'defensive_chassis',
    slotLabel: RIG_SLOT_LABELS.defensive_chassis,
    name: 'KINETIC FLUX DYNAMO',
    shortLabel: 'KINETIC DYNAMO',
    roleLabel: 'SUSTAINED FLUX & FIELD RECOVERY',
    cost: 2,
    summary:
      'Harvests stray magnetic shear from boost pads and capacitor Flux Pools into continuous suit Integrity repairs.',
    benefitText: '+40% passive Flux regen, +8 Integrity on Boost Pads & +3.5 HP/s in Flux Pools',
    tradeoffText: '-15% passive ranged heat dissipation outside Active Vent',
  },
  rig_flux_salvager: {
    id: 'rig_flux_salvager',
    slot: 'tactical_harness',
    slotLabel: RIG_SLOT_LABELS.tactical_harness,
    name: 'CAPACITOR SALVAGE HARNESS',
    shortLabel: 'FIELD SALVAGER',
    roleLabel: 'MAP CAPACITOR & HAZARD MASTERY',
    cost: 2,
    summary:
      'Siphons destabilized arena capacitors and active hazard conduits into emergency Mobility Surge & hull repair.',
    benefitText: '+18 Flux & 1.4s Surge on Capacitors; +8 Integrity on Temporal Thread',
    tradeoffText: '+0.08s dodge cooldown (0.60s vs 0.52s)',
  },
  rig_adrenaline_overclock: {
    id: 'rig_adrenaline_overclock',
    slot: 'tactical_harness',
    slotLabel: RIG_SLOT_LABELS.tactical_harness,
    name: 'SURGE OVERCLOCK COIL',
    shortLabel: 'OVERCLOCK COIL',
    roleLabel: 'AGGRESSIVE SURGE AMP & COOLDOWN HASTE',
    cost: 3,
    summary:
      'Routes Boost Pad, Capacitor, and Temporal Thread Surge directly into weapon actuation and rig cooldown motors.',
    benefitText: '+15% damage & +25% faster Relay/Pin/Collapse cooldown recovery while Surging',
    tradeoffText: '+4 extra weapon heat per ranged shot while Surging',
  },
};

export function isValidRigModuleSlot(value: unknown): value is RigModuleSlot {
  return (
    typeof value === 'string' &&
    (VALID_RIG_MODULE_SLOTS as readonly string[]).includes(value)
  );
}

export function isValidRigModuleId(value: unknown): value is RigModuleId {
  return (
    typeof value === 'string' &&
    (VALID_RIG_MODULE_IDS as readonly string[]).includes(value)
  );
}

export function getRigModuleDefinition(id: RigModuleId): RigModuleDefinition {
  return RIG_MODULES[id];
}

export function getAllRigModuleDefinitions(): RigModuleDefinition[] {
  return VALID_RIG_MODULE_IDS.map((id) => RIG_MODULES[id]);
}

export function createEmptyEquippedRigModules(): Record<RigModuleSlot, RigModuleId | null> {
  return {
    temporal_core: null,
    defensive_chassis: null,
    tactical_harness: null,
  };
}

export function normalizeRigProgressionFields(
  rawPurchased: unknown,
  rawEquipped: unknown
): {
  purchasedRigModules: RigModuleId[];
  equippedRigModules: Record<RigModuleSlot, RigModuleId | null>;
} {
  const purchasedRigModules: RigModuleId[] = [];
  if (Array.isArray(rawPurchased)) {
    const limit = Math.min(rawPurchased.length, 64);
    for (let i = 0; i < limit; i++) {
      const candidate = rawPurchased[i];
      if (isValidRigModuleId(candidate) && !purchasedRigModules.includes(candidate)) {
        purchasedRigModules.push(candidate);
      }
    }
  }

  const equippedRigModules = createEmptyEquippedRigModules();
  if (rawEquipped && typeof rawEquipped === 'object' && !Array.isArray(rawEquipped)) {
    const obj = rawEquipped as Record<string, unknown>;
    for (let i = 0; i < VALID_RIG_MODULE_SLOTS.length; i++) {
      const slot = VALID_RIG_MODULE_SLOTS[i];
      const mod = obj[slot];
      if (
        isValidRigModuleId(mod) &&
        purchasedRigModules.includes(mod) &&
        RIG_MODULES[mod].slot === slot
      ) {
        equippedRigModules[slot] = mod;
      }
    }
  }

  return { purchasedRigModules, equippedRigModules };
}

export function computeEffectiveRigModifiers(
  equipped?: Partial<Record<RigModuleSlot, RigModuleId | null>> | null,
  isSurging = false
): RigEffectiveModifiers {
  const core = equipped?.temporal_core ?? null;
  const chassis = equipped?.defensive_chassis ?? null;
  const harness = equipped?.tactical_harness ?? null;

  return {
    echoMaxDurationBonus: core === 'rig_chrono_spool' ? 2.0 : 0,
    relayFluxCostDelta: core === 'rig_chrono_spool' ? -5 : 0,
    relayCooldownDelta: core === 'rig_chrono_spool' ? 0.25 : 0,
    convergenceBonusDamage: core === 'rig_resonance_prism' ? 14 : 0,
    convergenceFluxCostDelta: core === 'rig_resonance_prism' ? 3 : 0,
    staggerDurationBonus: core === 'rig_resonance_prism' ? 0.45 : 0,

    maxIntegrityBonus: chassis === 'rig_reactive_plating' ? 25 : 0,
    parrySlipBonusFlux: chassis === 'rig_reactive_plating' ? 10 : 0,
    moveSpeedMultiplier:
      chassis === 'rig_reactive_plating' && !isSurging ? 0.94 : 1.0,
    passiveFluxRegenMultiplier: chassis === 'rig_kinetic_dynamo' ? 1.4 : 1.0,
    boostPadIntegrityBonus: chassis === 'rig_kinetic_dynamo' ? 8 : 0,
    fluxPoolIntegrityPerSec: chassis === 'rig_kinetic_dynamo' ? 3.5 : 0,
    heatCoolMultiplier: chassis === 'rig_kinetic_dynamo' ? 0.85 : 1.0,

    crateFluxReward: harness === 'rig_flux_salvager' ? 18 : 12,
    crateSurgeDuration: harness === 'rig_flux_salvager' ? 1.4 : 0,
    threadIntegrityBonus: harness === 'rig_flux_salvager' ? 8 : 0,
    dodgeCooldownDelta: harness === 'rig_flux_salvager' ? 0.08 : 0,
    surgeDamageMultiplier:
      harness === 'rig_adrenaline_overclock' && isSurging ? 1.15 : 1.0,
    surgeCooldownTickMultiplier:
      harness === 'rig_adrenaline_overclock' && isSurging ? 1.25 : 1.0,
    surgeRangedHeatPenalty:
      harness === 'rig_adrenaline_overclock' && isSurging ? 4 : 0,
  };
}
