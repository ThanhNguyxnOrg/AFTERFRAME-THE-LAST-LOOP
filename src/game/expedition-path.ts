import { FRAGMENT_CACHES } from './chronicle-expansion.ts';
import type {
  CampaignChapterId,
  ExpeditionGuideTarget,
  ExpeditionPhase,
  ExpeditionSafeRoomState,
  ExpeditionSectorSpec,
  ExpeditionState,
  SafeRoomStationId,
  SecretEchoVaultState,
  StationMapSectorNode,
} from './types.ts';

export const EXPEDITION_SECTORS: readonly ExpeditionSectorSpec[] = [
  {
    index: 0,
    chapter: 'prologue',
    code: '01',
    shortName: 'BAY 04',
    title: 'Calibration Bay 04',
    wardenLabel: 'Security Proxies & Chrono Gate',
    nextChapter: 'chapter_1_helix',
  },
  {
    index: 1,
    chapter: 'chapter_1_helix',
    code: '02',
    shortName: 'VAULT',
    title: 'Primary Containment Vault',
    wardenLabel: 'Marshal HELIX-04',
    nextChapter: 'chapter_2_choir',
  },
  {
    index: 2,
    chapter: 'chapter_2_choir',
    code: '03',
    shortName: 'GARDEN',
    title: 'Harmonic Garden',
    wardenLabel: 'THE CHOIR',
    nextChapter: 'chapter_3_curator',
  },
  {
    index: 3,
    chapter: 'chapter_3_curator',
    code: '04',
    shortName: 'ARCHIVE',
    title: 'Sovereign Archive',
    wardenLabel: 'THE CURATOR',
    nextChapter: 'chapter_4_matron',
  },
  {
    index: 4,
    chapter: 'chapter_4_matron',
    code: '05',
    shortName: 'SURGERY',
    title: 'Surgical Quarantine',
    wardenLabel: 'MATRON-V',
    nextChapter: 'chapter_5_loom',
  },
  {
    index: 5,
    chapter: 'chapter_5_loom',
    code: '06',
    shortName: 'LOOM',
    title: 'Chronicle Loom Core',
    wardenLabel: 'WARDEN PRIME',
    nextChapter: null,
  },
] as const;

export const EXPEDITION_ENTRY_AIRLOCK = { x: 0, z: 17.4 } as const;
export const EXPEDITION_BREACH_SEAL = { x: 0, z: 0, triggerRadius: 3.1 } as const;
export const EXPEDITION_TRANSIT_AIRLOCK = { x: 0, z: -15.4, triggerRadius: 2.35 } as const;

export const SAFE_ROOM_STATIONS = {
  medBay: { x: -5.8, z: 1.6, radius: 2.85 },
  workbench: { x: 0, z: -2.4, radius: 2.85 },
  lysaHolo: { x: 5.8, z: 1.6, radius: 2.85 },
} as const;

const SAFE_ROOM_LYSA_INTEL: Record<
  CampaignChapterId,
  { headline: string; detail: string }
> = {
  prologue: {
    headline: 'CALIBRATION DECK CHECK',
    detail: 'Synchronize your Chrono Rig and sweep Bay 04 caches before advancing.',
  },
  chapter_1_helix: {
    headline: 'LYSA INTEL · MARSHAL HELIX-04',
    detail:
      'HELIX-04 guards its chest core with frontal Aegis plating. Parry its Helical Sweep [Q] or flank with an Echo [T/Y] to crack the core for 1.5× damage.',
  },
  chapter_2_choir: {
    headline: 'LYSA INTEL · THE CHOIR MATRIX',
    detail:
      'THE CHOIR shields itself via Harmonic Pylons. Record an Echo hitting one pylon while live Sera strikes the second to shatter its resonance shield.',
  },
  chapter_3_curator: {
    headline: 'LYSA INTEL · THE CURATOR ARCHIVE',
    detail:
      'THE CURATOR spawns False-Echo decoys and replays recorded sweeps. Drop Gravity Pin [G] to anchor decoys and interrupt its archive trace.',
  },
  chapter_4_matron: {
    headline: 'LYSA INTEL · MATRON-V QUARANTINE',
    detail:
      'MATRON-V drains Flux with Siphon escorts and fires Chrono Sever rings. Detonate Echo Collapse [X] to break her surgical cadence.',
  },
  chapter_5_loom: {
    headline: 'LYSA FINAL BRIEFING · CHRONICLE LOOM',
    detail:
      'WARDEN PRIME waits at the Loom Core. Spend every remaining Memory Fragment at the Workbench [U]—your directive inside decides Nadir-9’s fate.',
  },
};

const SECRET_VAULT_META: Partial<
  Record<
    CampaignChapterId,
    {
      label: string;
      switchPos: { x: number; z: number; radius: number };
      vaultPos: { x: number; z: number; radius: number };
      rewardFragments: number;
    }
  >
> = {
  prologue: {
    label: 'Bay 04 Prototype Echo Vault',
    switchPos: { x: -11.4, z: 4.8, radius: 2.2 },
    vaultPos: { x: 11.8, z: 4.8, radius: 2.25 },
    rewardFragments: 2,
  },
  chapter_1_helix: {
    label: 'Containment Marshal Armory Vault',
    switchPos: { x: -11.6, z: 4.6, radius: 2.2 },
    vaultPos: { x: 11.8, z: 4.6, radius: 2.25 },
    rewardFragments: 2,
  },
  chapter_2_choir: {
    label: 'Harmonic Conservatory Vault',
    switchPos: { x: -11.6, z: 4.6, radius: 2.2 },
    vaultPos: { x: 11.8, z: 4.6, radius: 2.25 },
    rewardFragments: 2,
  },
  chapter_3_curator: {
    label: 'Black-Box Archive Vault',
    switchPos: { x: -11.6, z: 4.6, radius: 2.2 },
    vaultPos: { x: 11.8, z: 4.6, radius: 2.25 },
    rewardFragments: 2,
  },
  chapter_4_matron: {
    label: 'Quarantine Cryo-Relic Vault',
    switchPos: { x: -11.6, z: 4.6, radius: 2.2 },
    vaultPos: { x: 11.8, z: 4.6, radius: 2.25 },
    rewardFragments: 2,
  },
};

const CHAPTER_LORE_TOTALS: Record<CampaignChapterId, number> = {
  prologue: 3,
  chapter_1_helix: 2,
  chapter_2_choir: 2,
  chapter_3_curator: 2,
  chapter_4_matron: 2,
  chapter_5_loom: 2,
};

export function getExpeditionSectorSpec(chapter: CampaignChapterId): ExpeditionSectorSpec {
  return EXPEDITION_SECTORS.find((s) => s.chapter === chapter) ?? EXPEDITION_SECTORS[0];
}

export function createSafeRoomState(
  fromChapter: CampaignChapterId,
  nextChapter: CampaignChapterId
): ExpeditionSafeRoomState {
  const intel = SAFE_ROOM_LYSA_INTEL[nextChapter] ?? SAFE_ROOM_LYSA_INTEL.chapter_1_helix;
  return {
    active: true,
    fromChapter,
    nextChapter,
    medBayUsed: false,
    lysaBriefingClaimed: false,
    lysaIntelHeadline: intel.headline,
    lysaIntelDetail: intel.detail,
    medBayPos: { x: SAFE_ROOM_STATIONS.medBay.x, z: SAFE_ROOM_STATIONS.medBay.z },
    lysaPos: { x: SAFE_ROOM_STATIONS.lysaHolo.x, z: SAFE_ROOM_STATIONS.lysaHolo.z },
    workbenchPos: { x: SAFE_ROOM_STATIONS.workbench.x, z: SAFE_ROOM_STATIONS.workbench.z },
    nearbyStation: 'none',
  };
}

export function detectNearbySafeRoomStation(
  playerX: number,
  playerZ: number,
  safeRoom: ExpeditionSafeRoomState | null | undefined
): SafeRoomStationId {
  if (!safeRoom || !safeRoom.active) return 'none';
  const dMed = Math.hypot(playerX - safeRoom.medBayPos.x, playerZ - safeRoom.medBayPos.z);
  const dLysa = Math.hypot(playerX - safeRoom.lysaPos.x, playerZ - safeRoom.lysaPos.z);
  const dBench = Math.hypot(
    playerX - safeRoom.workbenchPos.x,
    playerZ - safeRoom.workbenchPos.z
  );

  let best: SafeRoomStationId = 'none';
  let bestDist = Infinity;
  if (dMed <= SAFE_ROOM_STATIONS.medBay.radius && dMed < bestDist) {
    best = 'med_bay';
    bestDist = dMed;
  }
  if (dLysa <= SAFE_ROOM_STATIONS.lysaHolo.radius && dLysa < bestDist) {
    best = 'lysa_holo';
    bestDist = dLysa;
  }
  if (dBench <= SAFE_ROOM_STATIONS.workbench.radius && dBench < bestDist) {
    best = 'workbench';
  }
  return best;
}

export function createSecretVaultForChapter(
  chapter: CampaignChapterId,
  alreadyLooted = false
): SecretEchoVaultState | null {
  const meta = SECRET_VAULT_META[chapter];
  if (!meta) return null;
  return {
    id: `echo_vault_${chapter}`,
    chapter,
    label: meta.label,
    switchPos: { ...meta.switchPos },
    vaultPos: { ...meta.vaultPos },
    switchPressed: false,
    heldByEcho: false,
    overrideTimer: 0,
    maxOverrideDuration: 7.0,
    gateOpen: alreadyLooted,
    looted: alreadyLooted,
    rewardFragments: meta.rewardFragments,
  };
}

export function tickSecretEchoVault(
  vault: SecretEchoVaultState | null | undefined,
  playerX: number,
  playerZ: number,
  echoActive: boolean,
  echoX: number,
  echoZ: number,
  dt: number
): { justOpened: boolean } {
  if (!vault) return { justOpened: false };
  if (vault.looted) {
    vault.gateOpen = true;
    vault.switchPressed = false;
    vault.heldByEcho = false;
    return { justOpened: false };
  }

  const wasOpen = vault.gateOpen;
  const playerOnSwitch =
    Math.hypot(playerX - vault.switchPos.x, playerZ - vault.switchPos.z) <=
    vault.switchPos.radius;
  const echoOnSwitch =
    echoActive &&
    Math.hypot(echoX - vault.switchPos.x, echoZ - vault.switchPos.z) <=
      vault.switchPos.radius + 0.55;

  vault.heldByEcho = echoOnSwitch;
  vault.switchPressed = playerOnSwitch || echoOnSwitch;

  if (vault.switchPressed) {
    vault.overrideTimer = vault.maxOverrideDuration;
    vault.gateOpen = true;
  } else if (vault.overrideTimer > 0) {
    vault.overrideTimer = Math.max(0, vault.overrideTimer - dt);
    vault.gateOpen = vault.overrideTimer > 0;
  } else {
    vault.gateOpen = false;
  }

  return { justOpened: !wasOpen && vault.gateOpen };
}

export interface NgPlusModifiers {
  cycle: number;
  active: boolean;
  enemyHpMultiplier: number;
  fragmentBonusMultiplier: number;
  badgeLabel: string;
}

export function getNgPlusModifiers(cycle = 0): NgPlusModifiers {
  const safeCycle = Math.max(0, Math.min(99, Math.floor(cycle || 0)));
  return {
    cycle: safeCycle,
    active: safeCycle > 0,
    enemyHpMultiplier: Number((1 + safeCycle * 0.35).toFixed(2)),
    fragmentBonusMultiplier: Number((1 + safeCycle * 0.25).toFixed(2)),
    badgeLabel: safeCycle > 0 ? `NG+${safeCycle}` : 'STANDARD',
  };
}

export function buildStationSectorMapNodes(params: {
  completedChapters: readonly CampaignChapterId[];
  unlockedChapters: readonly CampaignChapterId[];
  activeChapter: CampaignChapterId;
  claimedRewardIds: readonly string[];
  activatedNodeIds: readonly string[];
  unlockedVaultChapters: readonly CampaignChapterId[];
}): StationMapSectorNode[] {
  const {
    completedChapters,
    unlockedChapters,
    activeChapter,
    claimedRewardIds,
    activatedNodeIds,
    unlockedVaultChapters,
  } = params;

  return EXPEDITION_SECTORS.map((spec) => {
    const chapterCaches = FRAGMENT_CACHES.filter((c) => c.chapter === spec.chapter);
    const cachesTotal = chapterCaches.length;
    const cachesFound = chapterCaches.filter((c) =>
      claimedRewardIds.includes(c.rewardId)
    ).length;

    const loreTotal = CHAPTER_LORE_TOTALS[spec.chapter] ?? 2;
    const chapterPrefix =
      spec.chapter === 'prologue'
        ? 'prologue'
        : spec.chapter.replace('chapter_', 'ch');
    const loreFound = Math.min(
      loreTotal,
      activatedNodeIds.filter(
        (id) => id.includes(chapterPrefix) || id.includes(spec.chapter)
      ).length
    );

    const hasVault = Boolean(SECRET_VAULT_META[spec.chapter]);
    const vaultLooted = unlockedVaultChapters.includes(spec.chapter);

    const totalItems = cachesTotal + loreTotal + (hasVault ? 1 : 0);
    const foundItems = cachesFound + loreFound + (hasVault && vaultLooted ? 1 : 0);
    const discoveryPercent =
      totalItems > 0 ? Math.min(100, Math.round((foundItems / totalItems) * 100)) : 100;

    const isCleared = completedChapters.includes(spec.chapter);
    const isActive = activeChapter === spec.chapter;
    const isUnlocked = unlockedChapters.includes(spec.chapter) || isCleared || isActive;

    const status: StationMapSectorNode['status'] = isActive
      ? 'active'
      : isCleared
        ? 'cleared'
        : isUnlocked
          ? 'unlocked'
          : 'locked';

    return {
      index: spec.index,
      chapter: spec.chapter,
      code: spec.code,
      shortName: spec.shortName,
      title: spec.title,
      wardenLabel: spec.wardenLabel,
      status,
      discoveryPercent,
      vaultLooted,
      cachesFound,
      cachesTotal,
      loreFound,
      loreTotal,
    };
  });
}

export function createInitialExpeditionState(
  chapter: CampaignChapterId = 'prologue',
  enabled = false,
  initialPhase: ExpeditionPhase = enabled ? 'explore' : 'combat',
  alreadyLootedVault = false,
  ngPlusCycle = 0
): ExpeditionState {
  const spec = getExpeditionSectorSpec(chapter);
  return {
    enabled,
    phase: initialPhase,
    sectorIndex: spec.index,
    totalSectors: EXPEDITION_SECTORS.length,
    sectorCode: spec.code,
    sectorTitle: spec.title,
    wardenLabel: spec.wardenLabel,
    nextChapter: spec.nextChapter,
    breachSealPos: { x: EXPEDITION_BREACH_SEAL.x, z: EXPEDITION_BREACH_SEAL.z },
    transitGatePos: { x: EXPEDITION_TRANSIT_AIRLOCK.x, z: EXPEDITION_TRANSIT_AIRLOCK.z },
    airlockUnlocked: initialPhase === 'airlock_open' || initialPhase === 'safe_room',
    cachesFound: 0,
    cachesTotal: 0,
    terminalsScanned: 0,
    terminalsTotal: 0,
    beaconsActive: 0,
    beaconsTotal: 0,
    guideTarget: null,
    playerInsideBreachSeal: false,
    playerInsideTransitGate: false,
    transitBannerTimer: 0,
    transitBannerText: '',
    safeRoom: null,
    secretVault:
      enabled && initialPhase !== 'safe_room'
        ? createSecretVaultForChapter(chapter, alreadyLootedVault)
        : null,
    ngPlusCycle,
  };
}

export interface ExpeditionGuideInput {
  enabled: boolean;
  phase: ExpeditionPhase;
  playerX: number;
  playerZ: number;
  breachSealPos: { x: number; z: number };
  transitGatePos: { x: number; z: number };
  nextSectorTitle: string | null;
  wardenLabel: string;
  unclaimedCaches: ReadonlyArray<{ x: number; z: number; label: string }>;
  unscannedTerminals: ReadonlyArray<{ x: number; z: number; label: string }>;
  inactiveBeacons: ReadonlyArray<{ x: number; z: number; label: string }>;
  activeHostiles: ReadonlyArray<{ x: number; z: number; label: string; isBoss?: boolean }>;
  safeRoom?: ExpeditionSafeRoomState | null;
  secretVault?: SecretEchoVaultState | null;
}

function findNearest<T extends { x: number; z: number }>(
  items: readonly T[],
  px: number,
  pz: number
): { item: T; dist: number } | null {
  let best: T | null = null;
  let bestDist = Infinity;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const d = Math.hypot(it.x - px, it.z - pz);
    if (d < bestDist) {
      bestDist = d;
      best = it;
    }
  }
  return best ? { item: best, dist: bestDist } : null;
}

/**
 * Computes the active 3D Holographic Floor Guide Path target for the player.
 * Prioritizes: Safe-Room Stations -> Unlocked North Airlock -> Explore Discoveries (Caches -> Secret Echo Vault -> Terminals -> Beacons -> Breach Seal) -> Combat Hostiles.
 */
export function computeExpeditionGuideTarget(
  input: ExpeditionGuideInput
): ExpeditionGuideTarget | null {
  const { playerX, playerZ, phase } = input;

  if (phase === 'safe_room' && input.safeRoom?.active) {
    if (!input.safeRoom.medBayUsed) {
      const dist = Math.hypot(
        input.safeRoom.medBayPos.x - playerX,
        input.safeRoom.medBayPos.z - playerZ
      );
      return {
        x: input.safeRoom.medBayPos.x,
        z: input.safeRoom.medBayPos.z,
        label: 'MED-SUPPLY BAY [I] · FULL RESTORE',
        kind: 'safe_room_med',
        distance: Number(dist.toFixed(1)),
      };
    }
    if (!input.safeRoom.lysaBriefingClaimed) {
      const dist = Math.hypot(
        input.safeRoom.lysaPos.x - playerX,
        input.safeRoom.lysaPos.z - playerZ
      );
      return {
        x: input.safeRoom.lysaPos.x,
        z: input.safeRoom.lysaPos.z,
        label: 'LYSA HOLOGRAM [I] · BOSS INTEL & +1 FRAGMENT',
        kind: 'safe_room_lysa',
        distance: Number(dist.toFixed(1)),
      };
    }
    const dist = Math.hypot(input.transitGatePos.x - playerX, input.transitGatePos.z - playerZ);
    return {
      x: input.transitGatePos.x,
      z: input.transitGatePos.z,
      label: input.nextSectorTitle
        ? `DEPART NORTH AIRLOCK → ${input.nextSectorTitle.toUpperCase()}`
        : 'DEPART TO NEXT SECTOR',
      kind: 'transit_gate',
      distance: Number(dist.toFixed(1)),
    };
  }

  if (phase === 'airlock_open') {
    const dist = Math.hypot(input.transitGatePos.x - playerX, input.transitGatePos.z - playerZ);
    return {
      x: input.transitGatePos.x,
      z: input.transitGatePos.z,
      label: input.nextSectorTitle
        ? `NORTH AIRLOCK → TRANSIT HUB (${input.nextSectorTitle.toUpperCase()})`
        : 'CHRONICLE LOOM FINALE',
      kind: 'transit_gate',
      distance: Number(dist.toFixed(1)),
    };
  }

  if (phase === 'explore') {
    if (input.secretVault && !input.secretVault.looted && input.secretVault.gateOpen) {
      const dist = Math.hypot(
        input.secretVault.vaultPos.x - playerX,
        input.secretVault.vaultPos.z - playerZ
      );
      return {
        x: input.secretVault.vaultPos.x,
        z: input.secretVault.vaultPos.z,
        label: `VAULT OPEN! CLAIM [I] · ${input.secretVault.label.toUpperCase()}`,
        kind: 'secret_vault',
        distance: Number(dist.toFixed(1)),
      };
    }

    const nearCache = findNearest(input.unclaimedCaches, playerX, playerZ);
    if (nearCache) {
      return {
        x: nearCache.item.x,
        z: nearCache.item.z,
        label: `FRAGMENT CACHE · ${nearCache.item.label}`,
        kind: 'cache',
        distance: Number(nearCache.dist.toFixed(1)),
      };
    }

    if (input.secretVault && !input.secretVault.looted) {
      const dist = Math.hypot(
        input.secretVault.switchPos.x - playerX,
        input.secretVault.switchPos.z - playerZ
      );
      return {
        x: input.secretVault.switchPos.x,
        z: input.secretVault.switchPos.z,
        label: `ECHO VAULT SWITCH [T/Y] · UNLOCK EAST VAULT`,
        kind: 'secret_vault',
        distance: Number(dist.toFixed(1)),
      };
    }

    const nearTerm = findNearest(input.unscannedTerminals, playerX, playerZ);
    if (nearTerm) {
      return {
        x: nearTerm.item.x,
        z: nearTerm.item.z,
        label: `SCAN ARCHIVE [I] · ${nearTerm.item.label}`,
        kind: 'terminal',
        distance: Number(nearTerm.dist.toFixed(1)),
      };
    }

    const nearBeacon = findNearest(input.inactiveBeacons, playerX, playerZ);
    if (nearBeacon) {
      return {
        x: nearBeacon.item.x,
        z: nearBeacon.item.z,
        label: `SECTOR BEACON · ${nearBeacon.item.label}`,
        kind: 'beacon',
        distance: Number(nearBeacon.dist.toFixed(1)),
      };
    }

    const sealDist = Math.hypot(input.breachSealPos.x - playerX, input.breachSealPos.z - playerZ);
    return {
      x: input.breachSealPos.x,
      z: input.breachSealPos.z,
      label: `BREACH SEAL [I] · AWAKEN ${input.wardenLabel.toUpperCase()}`,
      kind: 'breach_seal',
      distance: Number(sealDist.toFixed(1)),
    };
  }

  if (phase === 'combat') {
    const boss = input.activeHostiles.find((h) => h.isBoss);
    if (boss) {
      const dist = Math.hypot(boss.x - playerX, boss.z - playerZ);
      return {
        x: boss.x,
        z: boss.z,
        label: boss.label,
        kind: 'combat',
        distance: Number(dist.toFixed(1)),
      };
    }
    const nearHostile = findNearest(input.activeHostiles, playerX, playerZ);
    if (nearHostile) {
      return {
        x: nearHostile.item.x,
        z: nearHostile.item.z,
        label: nearHostile.item.label,
        kind: 'combat',
        distance: Number(nearHostile.dist.toFixed(1)),
      };
    }
  }

  return null;
}

export function isPlayerInsideBreachSeal(
  playerX: number,
  playerZ: number,
  state: ExpeditionState | null | undefined
): boolean {
  if (!state || !state.enabled || state.phase !== 'explore') return false;
  return (
    Math.hypot(playerX - state.breachSealPos.x, playerZ - state.breachSealPos.z) <=
    EXPEDITION_BREACH_SEAL.triggerRadius
  );
}

export function isPlayerInsideTransitAirlock(
  playerX: number,
  playerZ: number,
  state: ExpeditionState | null | undefined
): boolean {
  if (
    !state ||
    !state.enabled ||
    !state.airlockUnlocked ||
    (state.phase !== 'airlock_open' && state.phase !== 'safe_room')
  ) {
    return false;
  }
  return (
    Math.hypot(playerX - state.transitGatePos.x, playerZ - state.transitGatePos.z) <=
    EXPEDITION_TRANSIT_AIRLOCK.triggerRadius
  );
}

export function computeSectorDiscoveryRatio(state: ExpeditionState | null | undefined): number {
  if (!state) return 0;
  const vaultTotal = state.secretVault ? 1 : 0;
  const vaultFound = state.secretVault?.looted ? 1 : 0;
  const total = state.cachesTotal + state.terminalsTotal + state.beaconsTotal + vaultTotal;
  if (total <= 0) return 1;
  const found = state.cachesFound + state.terminalsScanned + state.beaconsActive + vaultFound;
  return Math.max(0, Math.min(1, found / total));
}
