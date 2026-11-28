import type {
  CampaignChapterId,
  ChronoAchievementId,
  ChronoMutatorState,
  DamageNumberKind,
  DamagePopupEntry,
  FabricatorItemId,
  ParadoxRuntimeState,
  SeraRigSkinId,
  SpeedrunSplitState,
  TacticalLoadoutState,
} from './types.ts';

export interface SeraRigSkinDefinition {
  id: SeraRigSkinId;
  name: string;
  subtitle: string;
  armorHex: number;
  suitHex: number;
  accentHex: number;
  bladeHex: number;
  ringHex: number;
  swatchCss: string;
  unlockRequirementText: string;
  requiredAchievementCount: number;
  requiresEchoZeroDefeat?: boolean;
}

export const SERA_RIG_SKINS: readonly SeraRigSkinDefinition[] = [
  {
    id: 'nadir_standard',
    name: 'NADIR STANDARD',
    subtitle: 'Ceramic Pearl & Chrono Cyan',
    armorHex: 0xe6edf6,
    suitHex: 0x16202e,
    accentHex: 0x22d3ee,
    bladeHex: 0x67e8f9,
    ringHex: 0x38bdf8,
    swatchCss: 'linear-gradient(135deg, #e2e8f0 0%, #22d3ee 100%)',
    unlockRequirementText: 'Default Chrono Rig Chassis',
    requiredAchievementCount: 0,
  },
  {
    id: 'sovereign_gold',
    name: 'SOVEREIGN PRIME',
    subtitle: 'Royal Brushed Gold & Ivory Ceramic',
    armorHex: 0xe6b647,
    suitHex: 0xdfd8c8,
    accentHex: 0xfbbf24,
    bladeHex: 0xfde047,
    ringHex: 0xf59e0b,
    swatchCss: 'linear-gradient(135deg, #f59e0b 0%, #fef3c7 55%, #b45309 100%)',
    unlockRequirementText: 'Available for Immediate Refit',
    requiredAchievementCount: 0,
  },
  {
    id: 'warden_crimson',
    name: 'WARDEN HUNTER',
    subtitle: 'Brushed Titanium & Crimson Pulse',
    armorHex: 0x333c4c,
    suitHex: 0x171219,
    accentHex: 0xf43f5e,
    bladeHex: 0xfb7185,
    ringHex: 0xe11d48,
    swatchCss: 'linear-gradient(135deg, #334155 0%, #f43f5e 100%)',
    unlockRequirementText: 'Available for Immediate Refit',
    requiredAchievementCount: 0,
  },
  {
    id: 'phantom_emerald',
    name: 'PHANTOM ECHO',
    subtitle: 'Carbon Slate & Bio-Emerald',
    armorHex: 0x1b2f2d,
    suitHex: 0x0a1615,
    accentHex: 0x34d399,
    bladeHex: 0x6ee7b7,
    ringHex: 0x10b981,
    swatchCss: 'linear-gradient(135deg, #0f2925 0%, #34d399 100%)',
    unlockRequirementText: 'Unlock 2 Chrono Achievements',
    requiredAchievementCount: 2,
  },
  {
    id: 'paradox_prism',
    name: 'PARADOX PRISM',
    subtitle: 'Iridescent Void-Violet & Prism Crystal',
    armorHex: 0x4c2d7f,
    suitHex: 0x1b1033,
    accentHex: 0xe879f9,
    bladeHex: 0x67e8f9,
    ringHex: 0xd946ef,
    swatchCss: 'linear-gradient(135deg, #4c1d95 0%, #e879f9 55%, #38bdf8 100%)',
    unlockRequirementText: 'Defeat Secret Boss ECHO-ZERO or unlock 5 Achievements',
    requiredAchievementCount: 5,
    requiresEchoZeroDefeat: true,
  },
];

export function getSeraRigSkinDefinition(id: SeraRigSkinId): SeraRigSkinDefinition {
  return SERA_RIG_SKINS.find((s) => s.id === id) ?? SERA_RIG_SKINS[0];
}

export function isSeraRigSkinUnlocked(
  id: SeraRigSkinId,
  unlockedAchievements: readonly ChronoAchievementId[],
  echoZeroDefeatedCount: number
): boolean {
  const skin = getSeraRigSkinDefinition(id);
  if (skin.requiredAchievementCount <= 0 && !skin.requiresEchoZeroDefeat) return true;
  if (skin.requiresEchoZeroDefeat && echoZeroDefeatedCount > 0) return true;
  return unlockedAchievements.length >= skin.requiredAchievementCount;
}

export interface ChronoAchievementDefinition {
  id: ChronoAchievementId;
  title: string;
  description: string;
  code: string;
  accent: 'cyan' | 'emerald' | 'amber' | 'violet';
}

export const CHRONO_ACHIEVEMENTS: readonly ChronoAchievementDefinition[] = [
  {
    id: 'first_breach',
    title: 'SECTOR BREACHED',
    description: 'Shatter an Expedition Breach Seal and engage Nadir-9 hostiles.',
    code: 'ACH-01',
    accent: 'cyan',
  },
  {
    id: 'vault_raider',
    title: 'ECHO LOCKPICKER',
    description: 'Unlock and claim a laser-sealed Secret Echo Relic Vault.',
    code: 'ACH-02',
    accent: 'amber',
  },
  {
    id: 'all_vaults',
    title: 'MASTER OF NADIR-9',
    description: 'Open all 5 Secret Echo Relic Vaults across Sectors 01–05.',
    code: 'ACH-03',
    accent: 'amber',
  },
  {
    id: 'safe_room_engineer',
    title: 'FIELD REFITTER',
    description: 'Fabricate gear or resupply at a Safe-Room Intermission station.',
    code: 'ACH-04',
    accent: 'emerald',
  },
  {
    id: 'convergence_chain',
    title: 'HARMONIC ARCHITECT',
    description: 'Detonate 5 lifetime Resonance Convergences with your Echo.',
    code: 'ACH-05',
    accent: 'cyan',
  },
  {
    id: 'parry_specialist',
    title: 'BLADE MIRROR',
    description: 'Execute 5 lifetime Perfect Parries [Q] against incoming strikes.',
    code: 'ACH-06',
    accent: 'emerald',
  },
  {
    id: 'untouchable_warden',
    title: 'FLAWLESS EXECUTION',
    description: 'Defeat any Sovereign Warden boss without taking hull damage.',
    code: 'ACH-07',
    accent: 'amber',
  },
  {
    id: 'drone_commander',
    title: 'AUTONOMOUS WINGMAN',
    description: 'Deploy an Autonomous Combat Drone (Mk.I or Mk.II) into battle.',
    code: 'ACH-08',
    accent: 'cyan',
  },
  {
    id: 'gauntlet_champion',
    title: 'SOVEREIGN CONQUEROR',
    description: 'Complete the 5-Boss Sovereign Gauntlet ladder.',
    code: 'ACH-09',
    accent: 'amber',
  },
  {
    id: 'ng_plus_initiate',
    title: 'LOOP ASCENDANT',
    description: 'Launch a New Game+ cycle carrying full Chrono Rig mastery.',
    code: 'ACH-10',
    accent: 'violet',
  },
  {
    id: 'paradox_breaker',
    title: 'MIRROR SHATTERED',
    description: 'Defeat Secret Boss ECHO-ZERO and unlock the Paradox Break ending.',
    code: 'ACH-11',
    accent: 'violet',
  },
  {
    id: 'mutator_daredevil',
    title: 'ANOMALY RUNNER',
    description: 'Clear a Sector or Boss encounter with a Chrono Mutator active.',
    code: 'ACH-12',
    accent: 'violet',
  },
];

export function getAchievementDefinition(id: ChronoAchievementId): ChronoAchievementDefinition {
  return CHRONO_ACHIEVEMENTS.find((a) => a.id === id) ?? CHRONO_ACHIEVEMENTS[0];
}

export interface FabricatorItemDefinition {
  id: FabricatorItemId;
  name: string;
  shortLabel: string;
  cost: number;
  description: string;
}

export const FIELD_FABRICATOR_ITEMS: readonly FabricatorItemDefinition[] = [
  {
    id: 'nanite_pack',
    name: 'MED-NANITE REFILL',
    shortLabel: '+1 NANITE [6]',
    cost: 1,
    description: 'Restores +1 Med-Nanite Injector charge (up to 3 max).',
  },
  {
    id: 'aegis_shield',
    name: 'AEGIS SHIELD CELL',
    shortLabel: '+40 SHIELD',
    cost: 2,
    description: 'Projects a +40 HP reactive Aegis barrier over Sera’s hull.',
  },
  {
    id: 'overclock_core',
    name: 'OVERCLOCK CORE',
    shortLabel: '+25% DMG',
    cost: 2,
    description: 'Boosts all outgoing weapon damage +25% for the next Sector.',
  },
  {
    id: 'drone_mk1',
    name: 'COMBAT DRONE MK.I',
    shortLabel: 'DRONE MK.I',
    cost: 3,
    description: 'Deploys an autonomous plasma support wingman (11 dmg + 2 Flux/shot).',
  },
  {
    id: 'drone_mk2',
    name: 'COMBAT DRONE MK.II',
    shortLabel: 'DRONE MK.II',
    cost: 4,
    description: 'Upgrades Drone to Mk.II (17 dmg + 4 Flux/shot + auto +25 emergency shield).',
  },
];

export function getFabricatorItem(id: FabricatorItemId): FabricatorItemDefinition {
  return FIELD_FABRICATOR_ITEMS.find((i) => i.id === id) ?? FIELD_FABRICATOR_ITEMS[0];
}

export interface ChronoMutatorDefinition {
  key: keyof ChronoMutatorState;
  label: string;
  shortTag: string;
  description: string;
  bonusFragmentPct: number;
}

export const CHRONO_MUTATORS: readonly ChronoMutatorDefinition[] = [
  {
    key: 'glassCannon',
    label: 'GLASS CANNON',
    shortTag: '2× DMG BOTH',
    description: 'Sera & hostiles both deal 2.0× damage. Pure lethal precision.',
    bonusFragmentPct: 25,
  },
  {
    key: 'zeroEchoCooldown',
    label: 'INFINITE ECHO',
    shortTag: '0s ECHO CD',
    description: 'Removes Echo replay lockout and halves Echo Flux consumption.',
    bonusFragmentPct: 15,
  },
  {
    key: 'hyperSpeed',
    label: 'HYPER-PACE 1.3×',
    shortTag: '1.3× SPEED',
    description: 'Accelerates combat tempo and movement velocity by +30%.',
    bonusFragmentPct: 25,
  },
  {
    key: 'ironmanNoHeal',
    label: 'IRONMAN PROTOCOL',
    shortTag: 'NO HEALS',
    description: 'Disables Med-Nanite [6] and Safe-Room Med-Bay healing.',
    bonusFragmentPct: 35,
  },
];

export function createDefaultMutators(): ChronoMutatorState {
  return {
    glassCannon: false,
    zeroEchoCooldown: false,
    hyperSpeed: false,
    ironmanNoHeal: false,
  };
}

export function hasAnyActiveMutator(mutators: ChronoMutatorState | null | undefined): boolean {
  if (!mutators) return false;
  return Boolean(
    mutators.glassCannon ||
      mutators.zeroEchoCooldown ||
      mutators.hyperSpeed ||
      mutators.ironmanNoHeal
  );
}

export function computeMutatorModifiers(mutators: ChronoMutatorState | null | undefined): {
  playerDamageMult: number;
  incomingDamageMult: number;
  speedMult: number;
  echoFluxMult: number;
  allowHealing: boolean;
  bonusFragmentMultiplier: number;
  activeCount: number;
} {
  const m = mutators ?? createDefaultMutators();
  let bonusPct = 0;
  let activeCount = 0;
  for (const def of CHRONO_MUTATORS) {
    if (m[def.key]) {
      bonusPct += def.bonusFragmentPct;
      activeCount += 1;
    }
  }
  return {
    playerDamageMult: m.glassCannon ? 2.0 : 1.0,
    incomingDamageMult: m.glassCannon ? 2.0 : 1.0,
    speedMult: m.hyperSpeed ? 1.3 : 1.0,
    echoFluxMult: m.zeroEchoCooldown ? 0.5 : 1.0,
    allowHealing: !m.ironmanNoHeal,
    bonusFragmentMultiplier: 1 + bonusPct / 100,
    activeCount,
  };
}

export function createInitialTacticalLoadout(initialDroneTier: 0 | 1 | 2 = 0): TacticalLoadoutState {
  return {
    naniteInjectors: 2,
    maxNaniteInjectors: 3,
    naniteCooldown: 0,
    aegisShieldHp: 0,
    maxAegisShieldHp: 60,
    overclockCoreActive: false,
    combatDroneTier: initialDroneTier,
    droneX: -1.35,
    droneZ: 12.2,
    droneAngle: 0,
    droneFireCooldown: 0.4,
    droneShieldCooldown: 0,
    droneTargetId: null,
  };
}

export function createInitialSpeedrunState(
  enabled = false,
  bestSplits: Partial<Record<CampaignChapterId, number>> = {},
  bestFullRunSec: number | null = null
): SpeedrunSplitState {
  return {
    enabled,
    runElapsedSec: 0,
    currentSplits: {},
    bestSplits: { ...bestSplits },
    bestFullRunSec,
    lastSplitChapter: null,
    lastDeltaSec: null,
  };
}

export function createInitialParadoxState(options?: {
  mutators?: ChronoMutatorState;
  speedrunEnabled?: boolean;
  bestSplits?: Partial<Record<CampaignChapterId, number>>;
  bestFullRunSec?: number | null;
  droneTier?: 0 | 1 | 2;
  paradoxRiftUnlocked?: boolean;
}): ParadoxRuntimeState {
  return {
    loadout: createInitialTacticalLoadout(options?.droneTier ?? 0),
    damagePopups: [],
    nextPopupId: 1,
    killCamTimer: 0,
    mutators: options?.mutators ? { ...options.mutators } : createDefaultMutators(),
    speedrun: createInitialSpeedrunState(
      Boolean(options?.speedrunEnabled),
      options?.bestSplits ?? {},
      options?.bestFullRunSec ?? null
    ),
    activeToast: null,
    paradoxRiftUnlocked: Boolean(options?.paradoxRiftUnlocked),
    bossTookDamageThisFight: false,
  };
}

export function isParadoxRiftEligible(
  unlockedVaultChapters: readonly CampaignChapterId[],
  ngPlusCycle: number,
  echoZeroDefeatedCount: number
): boolean {
  return ngPlusCycle > 0 || unlockedVaultChapters.length >= 2 || echoZeroDefeatedCount > 0;
}

export function absorbIncomingDamageWithAegis(
  loadout: TacticalLoadoutState,
  rawDamage: number
): { remainingDamage: number; absorbed: number } {
  if (rawDamage <= 0 || loadout.aegisShieldHp <= 0) {
    return { remainingDamage: Math.max(0, rawDamage), absorbed: 0 };
  }
  const absorbed = Math.min(loadout.aegisShieldHp, rawDamage);
  loadout.aegisShieldHp = Math.max(0, Math.round((loadout.aegisShieldHp - absorbed) * 10) / 10);
  return {
    remainingDamage: Math.max(0, rawDamage - absorbed),
    absorbed,
  };
}

export interface CombatDroneTargetCandidate {
  id: string;
  x: number;
  z: number;
  hp: number;
}

export interface CombatDroneTickResult {
  fired: boolean;
  targetId: string | null;
  targetX: number;
  targetZ: number;
  damage: number;
  fluxGain: number;
  triggeredEmergencyShield: boolean;
}

/**
 * Pure deterministic update for Sera's autonomous 3D Combat Drone wingman.
 */
export function tickCombatDrone(params: {
  loadout: TacticalLoadoutState;
  playerX: number;
  playerZ: number;
  playerIntegrity: number;
  playerMaxIntegrity: number;
  canAttack: boolean;
  targets: readonly CombatDroneTargetCandidate[];
  dt: number;
}): CombatDroneTickResult {
  const { loadout, playerX, playerZ, playerIntegrity, playerMaxIntegrity, canAttack, targets, dt } =
    params;

  const empty: CombatDroneTickResult = {
    fired: false,
    targetId: null,
    targetX: 0,
    targetZ: 0,
    damage: 0,
    fluxGain: 0,
    triggeredEmergencyShield: false,
  };

  if (loadout.combatDroneTier <= 0) {
    loadout.droneTargetId = null;
    return empty;
  }

  loadout.droneAngle = (loadout.droneAngle + dt * 1.45) % (Math.PI * 2);
  const orbitR = 1.65;
  const targetDroneX = playerX + Math.cos(loadout.droneAngle) * orbitR;
  const targetDroneZ = playerZ + Math.sin(loadout.droneAngle) * orbitR;
  const followAlpha = Math.min(1, dt * 8.5);
  loadout.droneX += (targetDroneX - loadout.droneX) * followAlpha;
  loadout.droneZ += (targetDroneZ - loadout.droneZ) * followAlpha;

  loadout.droneFireCooldown = Math.max(0, loadout.droneFireCooldown - dt);
  loadout.droneShieldCooldown = Math.max(0, loadout.droneShieldCooldown - dt);

  let triggeredEmergencyShield = false;
  if (
    loadout.combatDroneTier >= 2 &&
    loadout.droneShieldCooldown <= 0 &&
    playerMaxIntegrity > 0 &&
    playerIntegrity > 0 &&
    playerIntegrity / playerMaxIntegrity <= 0.35 &&
    loadout.aegisShieldHp < 20
  ) {
    loadout.aegisShieldHp = Math.min(loadout.maxAegisShieldHp, loadout.aegisShieldHp + 25);
    loadout.droneShieldCooldown = 22.0;
    triggeredEmergencyShield = true;
  }

  if (!canAttack || targets.length === 0) {
    loadout.droneTargetId = null;
    return { ...empty, triggeredEmergencyShield };
  }

  // Acquire nearest live target within 15.5m
  let best: CombatDroneTargetCandidate | null = null;
  let bestDist = 15.5;
  for (const t of targets) {
    if (t.hp <= 0) continue;
    const d = Math.hypot(t.x - loadout.droneX, t.z - loadout.droneZ);
    if (d < bestDist) {
      bestDist = d;
      best = t;
    }
  }

  loadout.droneTargetId = best ? best.id : null;
  if (!best || loadout.droneFireCooldown > 0) {
    return { ...empty, targetId: loadout.droneTargetId, triggeredEmergencyShield };
  }

  const isMk2 = loadout.combatDroneTier >= 2;
  loadout.droneFireCooldown = isMk2 ? 1.15 : 1.45;
  return {
    fired: true,
    targetId: best.id,
    targetX: best.x,
    targetZ: best.z,
    damage: isMk2 ? 17 : 11,
    fluxGain: isMk2 ? 4 : 2,
    triggeredEmergencyShield,
  };
}

export function pushDamagePopup(
  paradox: ParadoxRuntimeState,
  amount: number,
  x: number,
  y: number,
  z: number,
  kind: DamageNumberKind
): DamagePopupEntry | null {
  const rounded = Math.round(amount);
  if (rounded <= 0) return null;
  const id = paradox.nextPopupId++;
  const slot = (id % 5) - 2;
  const verticalStagger = (id % 3) * 0.28;
  const entry: DamagePopupEntry = {
    id,
    amount: rounded,
    x: x + slot * 0.48,
    y: y + verticalStagger,
    z,
    kind,
    age: 0,
    lifetime: 0.9,
  };
  paradox.damagePopups.push(entry);
  if (paradox.damagePopups.length > 24) {
    paradox.damagePopups.splice(0, paradox.damagePopups.length - 24);
  }
  return entry;
}

export function tickDamagePopups(paradox: ParadoxRuntimeState, dt: number): void {
  for (let i = paradox.damagePopups.length - 1; i >= 0; i--) {
    const p = paradox.damagePopups[i];
    p.age += dt;
    p.y += dt * 1.15;
    if (p.age >= p.lifetime) {
      paradox.damagePopups.splice(i, 1);
    }
  }
}

export function recordSpeedrunSectorSplit(
  speedrun: SpeedrunSplitState,
  chapter: CampaignChapterId
): { splitSec: number; deltaSec: number | null; isNewBest: boolean } {
  const splitSec = Math.round(speedrun.runElapsedSec * 10) / 10;
  speedrun.currentSplits[chapter] = splitSec;
  const prevBest = speedrun.bestSplits[chapter];
  const deltaSec = typeof prevBest === 'number' ? Math.round((splitSec - prevBest) * 10) / 10 : null;
  let isNewBest = false;
  if (typeof prevBest !== 'number' || splitSec < prevBest) {
    speedrun.bestSplits[chapter] = splitSec;
    isNewBest = true;
  }
  speedrun.lastSplitChapter = chapter;
  speedrun.lastDeltaSec = deltaSec;
  if (chapter === 'chapter_5_loom') {
    if (speedrun.bestFullRunSec === null || splitSec < speedrun.bestFullRunSec) {
      speedrun.bestFullRunSec = splitSec;
    }
  }
  return { splitSec, deltaSec, isNewBest };
}

export function formatSpeedrunClock(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60);
  const secs = Math.floor(clamped % 60);
  const tenths = Math.floor((clamped * 10) % 10);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
}

export function formatSpeedrunDelta(deltaSec: number | null): string {
  if (deltaSec === null) return 'NEW PB';
  const sign = deltaSec <= 0 ? '-' : '+';
  return `${sign}${Math.abs(deltaSec).toFixed(1)}s`;
}
