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
  'rig_echo_synchronizer',
  'rig_reactive_plating',
  'rig_kinetic_dynamo',
  'rig_aegis_bastion_frame',
  'rig_flux_salvager',
  'rig_adrenaline_overclock',
  'rig_executioner_bus',
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
  rig_echo_synchronizer: {
    id: 'rig_echo_synchronizer',
    slot: 'temporal_core',
    slotLabel: RIG_SLOT_LABELS.temporal_core,
    name: 'DUAL-THREAD SYNCHRONIZER',
    shortLabel: 'DUAL SYNCHRONIZER',
    roleLabel: 'WIDE SYNC WINDOW & FLUX REFUND',
    cost: 3,
    summary:
      'Compresses Echo track latency to widen Resonance timing and recycle phase energy back into your suit bus.',
    benefitText: '+0.8s Resonance Sync Window & +8 Flux refund when Convergence lands',
    tradeoffText: '-1.0s Max Echo recording duration (7.0s vs 8.0s base)',
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
  rig_aegis_bastion_frame: {
    id: 'rig_aegis_bastion_frame',
    slot: 'defensive_chassis',
    slotLabel: RIG_SLOT_LABELS.defensive_chassis,
    name: 'AEGIS RIPOSTE FRAME',
    shortLabel: 'RIPOSTE FRAME',
    roleLabel: 'COUNTER-SHOCKWAVE & PARRY REPAIR',
    cost: 3,
    summary:
      'Channels incoming enemy momentum caught by Parry [Q] into a shockwave counter-pulse and suit stabilization.',
    benefitText: '+22 bonus Parry posture shockwave & +10 Integrity heal on Perfect Parry',
    tradeoffText: '+0.10s longer Parry recovery if mistimed',
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
  rig_executioner_bus: {
    id: 'rig_executioner_bus',
    slot: 'tactical_harness',
    slotLabel: RIG_SLOT_LABELS.tactical_harness,
    name: 'EXECUTIONER CONDUIT BUS',
    shortLabel: 'EXECUTIONER BUS',
    roleLabel: 'STAGGER FINISHER & CORE HARVEST',
    cost: 3,
    summary:
      'High-voltage actuation rails tuned to harvest core telemetry whenever Sera executes a staggered foe.',
    benefitText: '+25% Execution damage, +14 Integrity & +16 Flux refunded on Execution finisher',
    tradeoffText: '+0.05s Heavy attack charge threshold',
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

export function isRigModuleOverclocked(
  moduleId: RigModuleId | null | undefined,
  overclockedList?: readonly RigModuleId[] | null
): boolean {
  if (!moduleId || !Array.isArray(overclockedList)) return false;
  return overclockedList.includes(moduleId);
}

export function computeEffectiveRigModifiers(
  equipped?: Partial<Record<RigModuleSlot, RigModuleId | null>> | null,
  isSurging = false,
  overclockedRigModules?: readonly RigModuleId[] | null
): RigEffectiveModifiers {
  const core = equipped?.temporal_core ?? null;
  const chassis = equipped?.defensive_chassis ?? null;
  const harness = equipped?.tactical_harness ?? null;

  const coreMk2 = isRigModuleOverclocked(core, overclockedRigModules);
  const chassisMk2 = isRigModuleOverclocked(chassis, overclockedRigModules);
  const harnessMk2 = isRigModuleOverclocked(harness, overclockedRigModules);

  return {
    echoMaxDurationBonus:
      core === 'rig_chrono_spool'
        ? coreMk2
          ? 2.8
          : 2.0
        : core === 'rig_echo_synchronizer'
          ? coreMk2
            ? -0.5
            : -1.0
          : 0,
    relayFluxCostDelta: core === 'rig_chrono_spool' ? (coreMk2 ? -7 : -5) : 0,
    relayCooldownDelta: core === 'rig_chrono_spool' ? (coreMk2 ? 0.12 : 0.25) : 0,
    convergenceBonusDamage: core === 'rig_resonance_prism' ? (coreMk2 ? 19 : 14) : 0,
    convergenceFluxCostDelta: core === 'rig_resonance_prism' ? (coreMk2 ? 1 : 3) : 0,
    staggerDurationBonus: core === 'rig_resonance_prism' ? (coreMk2 ? 0.6 : 0.45) : 0,
    echoSyncWindowBonus: core === 'rig_echo_synchronizer' ? (coreMk2 ? 1.1 : 0.8) : 0,
    convergenceFluxRefund: core === 'rig_echo_synchronizer' ? (coreMk2 ? 11 : 8) : 0,

    maxIntegrityBonus: chassis === 'rig_reactive_plating' ? (chassisMk2 ? 34 : 25) : 0,
    parrySlipBonusFlux: chassis === 'rig_reactive_plating' ? (chassisMk2 ? 14 : 10) : 0,
    moveSpeedMultiplier:
      chassis === 'rig_reactive_plating' && !isSurging ? (chassisMk2 ? 0.97 : 0.94) : 1.0,
    passiveFluxRegenMultiplier:
      chassis === 'rig_kinetic_dynamo' ? (chassisMk2 ? 1.55 : 1.4) : 1.0,
    boostPadIntegrityBonus: chassis === 'rig_kinetic_dynamo' ? (chassisMk2 ? 11 : 8) : 0,
    fluxPoolIntegrityPerSec: chassis === 'rig_kinetic_dynamo' ? (chassisMk2 ? 4.8 : 3.5) : 0,
    heatCoolMultiplier: chassis === 'rig_kinetic_dynamo' ? (chassisMk2 ? 0.93 : 0.85) : 1.0,
    parryShockwaveStagger: chassis === 'rig_aegis_bastion_frame' ? (chassisMk2 ? 30 : 22) : 0,
    parryIntegrityHeal: chassis === 'rig_aegis_bastion_frame' ? (chassisMk2 ? 14 : 10) : 0,
    parryRecoveryDelta: chassis === 'rig_aegis_bastion_frame' ? (chassisMk2 ? 0.05 : 0.1) : 0,

    crateFluxReward: harness === 'rig_flux_salvager' ? (harnessMk2 ? 24 : 18) : 12,
    crateSurgeDuration: harness === 'rig_flux_salvager' ? (harnessMk2 ? 1.9 : 1.4) : 0,
    threadIntegrityBonus: harness === 'rig_flux_salvager' ? (harnessMk2 ? 11 : 8) : 0,
    dodgeCooldownDelta: harness === 'rig_flux_salvager' ? (harnessMk2 ? 0.04 : 0.08) : 0,
    surgeDamageMultiplier:
      harness === 'rig_adrenaline_overclock' && isSurging ? (harnessMk2 ? 1.21 : 1.15) : 1.0,
    surgeCooldownTickMultiplier:
      harness === 'rig_adrenaline_overclock' && isSurging ? (harnessMk2 ? 1.35 : 1.25) : 1.0,
    surgeRangedHeatPenalty:
      harness === 'rig_adrenaline_overclock' && isSurging ? (harnessMk2 ? 2 : 4) : 0,
    executionDamageMult: harness === 'rig_executioner_bus' ? (harnessMk2 ? 1.35 : 1.25) : 1.0,
    executionIntegrityHeal: harness === 'rig_executioner_bus' ? (harnessMk2 ? 19 : 14) : 0,
    executionFluxRefund: harness === 'rig_executioner_bus' ? (harnessMk2 ? 22 : 16) : 0,
    heavyChargeDelayDelta: harness === 'rig_executioner_bus' ? (harnessMk2 ? 0.02 : 0.05) : 0,
  };
}
