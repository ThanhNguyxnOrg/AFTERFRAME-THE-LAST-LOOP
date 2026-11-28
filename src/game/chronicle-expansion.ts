import type {
  ArenaFragmentCacheState,
  CampaignChapterId,
  ChronicleStance,
  ChronicleStanceSummary,
  FragmentCacheId,
  NeuralProtocolDefinition,
  NeuralProtocolId,
  SectorBeaconId,
  SectorTacticalBeaconState,
  StoryArcDefinition,
  StoryArcId,
  StoryArcState,
  WeaponProgressionRewardId,
  WeaponUpgradeId,
} from './types.ts';

export const WEAPON_OVERCLOCK_COST = 1;

export const VALID_NEURAL_PROTOCOL_IDS: readonly NeuralProtocolId[] = [
  'proto_flux_reservoir',
  'proto_echo_harmonics',
  'proto_vanguard_reflex',
  'proto_salvage_telemetry',
];

export const NEURAL_PROTOCOLS: Record<NeuralProtocolId, NeuralProtocolDefinition> = {
  proto_flux_reservoir: {
    id: 'proto_flux_reservoir',
    name: 'EXPANDED FLUX CAPACITOR',
    shortLabel: 'FLUX RESERVOIR',
    roleLabel: 'MAX FLUX CAP +25 (125F)',
    cost: 2,
    summary:
      'Attaches auxiliary supercapacitor cells to Sera’s Chrono Bus, raising maximum Chrono Flux capacity across all chapters.',
    benefitText: '+25 Max Chrono Flux (125F) & +15 minimum checkpoint Flux floor',
    tradeoffText: '-8% passive Flux regeneration while reserve exceeds 100F',
  },
  proto_echo_harmonics: {
    id: 'proto_echo_harmonics',
    name: 'HARMONIC ECHO MATRIX',
    shortLabel: 'ECHO MATRIX',
    roleLabel: '+20% ECHO PLAYBACK POTENCY',
    cost: 2,
    summary:
      'Stabilizes temporal ghost amplitude so recorded Echo strikes and shots carry sharper physical impact.',
    benefitText: '+20% Echo playback damage & posture stagger across all weapons',
    tradeoffText: '+0.15s Resonance cooldown after triggering Convergence',
  },
  proto_vanguard_reflex: {
    id: 'proto_vanguard_reflex',
    name: 'VANGUARD REFLEX BUS',
    shortLabel: 'REFLEX BUS',
    roleLabel: '+25% SURGE & +10% DODGE REACH',
    cost: 2,
    summary:
      'Routes kinetic boost impulses into leg servos, extending Mobility Surge windows and widening evasive lunge reach.',
    benefitText: '+25% Surge duration from Pads/Caches/Threads & +10% Dodge impulse',
    tradeoffText: '+2 extra weapon heat per ranged shot when not Surging',
  },
  proto_salvage_telemetry: {
    id: 'proto_salvage_telemetry',
    name: 'ARCHIVE TELEMETRY SCANNER',
    shortLabel: 'TELEMETRY SCANNER',
    roleLabel: '+25% CACHE & TERMINAL YIELDS',
    cost: 2,
    summary:
      'Taps Nadir-9 maintenance frequencies to extract extra Integrity & Flux from every terminal, secret, and Fragment Cache.',
    benefitText: '+25% Integrity & Flux yields from all Caches, Terminals, and Secrets',
    tradeoffText: '-6% frontal guard damage penetration vs shielded enemies',
  },
};

export function isValidNeuralProtocolId(value: unknown): value is NeuralProtocolId {
  return (
    typeof value === 'string' &&
    (VALID_NEURAL_PROTOCOL_IDS as readonly string[]).includes(value)
  );
}

export function getNeuralProtocolDefinition(id: NeuralProtocolId): NeuralProtocolDefinition {
  return NEURAL_PROTOCOLS[id];
}

export function getAllNeuralProtocolDefinitions(): NeuralProtocolDefinition[] {
  return VALID_NEURAL_PROTOCOL_IDS.map((id) => NEURAL_PROTOCOLS[id]);
}

export interface NeuralProtocolModifiers {
  maxFluxBonus: number;
  echoDamageMultiplier: number;
  echoStaggerMultiplier: number;
  convergenceCooldownDelta: number;
  surgeDurationMultiplier: number;
  dodgeImpulseMultiplier: number;
  nonSurgeHeatPenalty: number;
  salvageYieldMultiplier: number;
  guardPenetrationDelta: number;
}

export function computeNeuralProtocolModifiers(
  purchased: readonly NeuralProtocolId[] | null | undefined,
  currentFlux = 0,
  isSurging = false
): NeuralProtocolModifiers {
  const list = Array.isArray(purchased) ? purchased : [];
  const hasFlux = list.includes('proto_flux_reservoir');
  const hasEcho = list.includes('proto_echo_harmonics');
  const hasReflex = list.includes('proto_vanguard_reflex');
  const hasSalvage = list.includes('proto_salvage_telemetry');

  return {
    maxFluxBonus: hasFlux ? 25 : 0,
    echoDamageMultiplier: hasEcho ? 1.2 : 1.0,
    echoStaggerMultiplier: hasEcho ? 1.2 : 1.0,
    convergenceCooldownDelta: hasEcho ? 0.15 : 0,
    surgeDurationMultiplier: hasReflex ? 1.25 : 1.0,
    dodgeImpulseMultiplier: hasReflex ? 1.1 : 1.0,
    nonSurgeHeatPenalty: hasReflex && !isSurging ? 2 : 0,
    salvageYieldMultiplier: hasSalvage ? 1.25 : 1.0,
    guardPenetrationDelta: hasSalvage ? -0.06 : 0,
  };
}

export function isUpgradeOverclocked(
  upgradeId: WeaponUpgradeId | null | undefined,
  overclockedList: readonly WeaponUpgradeId[] | null | undefined
): boolean {
  if (!upgradeId || !Array.isArray(overclockedList)) return false;
  return overclockedList.includes(upgradeId);
}

export const FRAGMENT_CACHES: readonly ArenaFragmentCacheState[] = [
  {
    id: 'cache_prologue_east',
    chapter: 'prologue',
    label: 'BAY 04 MAINTENANCE CACHE',
    crewAuthor: 'Tech. Apprentice J. Ramos',
    memoryExcerpt:
      '“Left my spare calibration shard behind the east conduit before WARDEN locked Bay 04. If anyone wakes up after Loop 412, pry the panel open.”',
    x: 12.6,
    z: 8.8,
    radius: 1.5,
    claimed: false,
    rewardId: 'cache_prologue_east',
  },
  {
    id: 'cache_ch1_marshal_west',
    chapter: 'chapter_1_helix',
    label: 'WARDEN RESERVE ARMORY POD',
    crewAuthor: 'Security Sgt. D. Thorne',
    memoryExcerpt:
      '“HELIX-04 bolted the blast doors from the inside. I hid an override fragment next to the west shield baffle—someone tell Lysa we tried to hold.”',
    x: -12.6,
    z: 9.2,
    radius: 1.5,
    claimed: false,
    rewardId: 'cache_ch1_marshal_west',
  },
  {
    id: 'cache_ch2_garden_north',
    chapter: 'chapter_2_choir',
    label: 'HYDROPONIC SEED VAULT SHARD',
    crewAuthor: 'Chief Botanist Mara Chen',
    memoryExcerpt:
      '“WARDEN says our voices sound calmer when looped into THE CHOIR. Take this memory shard—remember how the real soil smelled before the mist turned digital.”',
    x: 0.0,
    z: -15.4,
    radius: 1.5,
    claimed: false,
    rewardId: 'cache_ch2_garden_north',
  },
  {
    id: 'cache_ch3_vault_east',
    chapter: 'chapter_3_curator',
    label: 'REDACTION QUARANTINE CACHE E',
    crewAuthor: 'Archivist Orin Vale',
    memoryExcerpt:
      '“THE CURATOR clipped three minutes of distress audio from every Sector 07 log. I tucked the raw checksum shard behind the eastern monolith.”',
    x: 12.2,
    z: -7.8,
    radius: 1.5,
    claimed: false,
    rewardId: 'cache_ch3_vault_east',
  },
  {
    id: 'cache_ch3_vault_west',
    chapter: 'chapter_3_curator',
    label: 'UNINDEXED LEDGER POD W',
    crewAuthor: 'Dr. Lysa Venn',
    memoryExcerpt:
      '“Sera, if you’re auditing Sector 03, take this fragment—every shard helps you push past MATRON-V’s ward.”',
    x: -12.2,
    z: -7.8,
    radius: 1.5,
    claimed: false,
    rewardId: 'cache_ch3_vault_west',
  },
  {
    id: 'cache_ch4_quarantine_north',
    chapter: 'chapter_4_matron',
    label: 'CRADLE 04 SURGICAL CACHE',
    crewAuthor: 'Surgical Nurse Kell',
    memoryExcerpt:
      '“Lysa wouldn’t let us put her under sedation before she climbed into Cradle 04. She made me promise to leave this Chrono Fragment for her sister.”',
    x: 0.0,
    z: -15.4,
    radius: 1.5,
    claimed: false,
    rewardId: 'cache_ch4_quarantine_north',
  },
  {
    id: 'cache_ch5_loom_east',
    chapter: 'chapter_5_loom',
    label: 'ASTROLABE SEAL CACHE E',
    crewAuthor: 'Nadir-9 Bridge Crew',
    memoryExcerpt:
      '“Four hundred loops of silence—and yet someone alive is standing beneath the Loom rings. Finish what we started.”',
    x: 13.0,
    z: -6.2,
    radius: 1.5,
    claimed: false,
    rewardId: 'cache_ch5_loom_east',
  },
  {
    id: 'cache_ch5_loom_west',
    chapter: 'chapter_5_loom',
    label: 'LOOP-ZERO OBSERVATORY SHARD',
    crewAuthor: 'Dr. Lysa Venn · Loop 001',
    memoryExcerpt:
      '“Before WARDEN ever spun the first recursion, we watched Saturn’s rings from this viewport. Carry one real memory out with you.”',
    x: -13.0,
    z: 7.4,
    radius: 1.5,
    claimed: false,
    rewardId: 'cache_ch5_loom_west',
  },
];

export function buildFragmentCachesForChapter(
  chapter: CampaignChapterId,
  claimedRewardIds: readonly WeaponProgressionRewardId[] = []
): ArenaFragmentCacheState[] {
  return FRAGMENT_CACHES.filter((c) => c.chapter === chapter).map((c) => ({
    ...c,
    claimed: claimedRewardIds.includes(c.rewardId),
  }));
}

export const SECTOR_BEACONS: readonly SectorTacticalBeaconState[] = [
  {
    id: 'beacon_prologue_cryo_vent',
    chapter: 'prologue',
    label: 'CRYO VENT OVERRIDE PYLON',
    effectLabel: '7.5M FROST SHOCK + COOL HEAT',
    description:
      'Vents cryogenic coolant across 7.5m, cooling active weapon heat to 0 and exposing nearby proxies.',
    x: -11.4,
    z: -2.8,
    radius: 1.5,
    cooldown: 0,
    maxCooldown: 14,
    activationCount: 0,
  },
  {
    id: 'beacon_ch1_emp_pylon',
    chapter: 'chapter_1_helix',
    label: 'AEGIS BREAKER EMP PYLON',
    effectLabel: '9M EMP · +35 BOSS POSTURE',
    description:
      'Discharges a magnetic arc across 9m that shocks HELIX-04’s frontal shield for 35 posture damage.',
    x: 11.6,
    z: 5.2,
    radius: 1.5,
    cooldown: 0,
    maxCooldown: 14,
    activationCount: 0,
  },
  {
    id: 'beacon_ch2_harmonic_bell',
    chapter: 'chapter_2_choir',
    label: 'RESONANCE TUNING BELL',
    effectLabel: '+2.0S SYNC WINDOW · +20 FLUX',
    description:
      'Rings out an asynchronous chime that extends Harmonic Node & Resonance windows by +2.0s and restores +20 Flux.',
    x: 11.6,
    z: -5.0,
    radius: 1.5,
    cooldown: 0,
    maxCooldown: 14,
    activationCount: 0,
  },
  {
    id: 'beacon_ch3_purge_scanner',
    chapter: 'chapter_3_curator',
    label: 'TRUTH SCANNER ARRAY',
    effectLabel: 'PURGE DECOYS · +25 FLUX',
    description:
      'Fires an unredacted telemetry sweep that blasts False-Echo decoys for 45 damage and restores +25 Flux.',
    x: 11.8,
    z: 6.2,
    radius: 1.5,
    cooldown: 0,
    maxCooldown: 14,
    activationCount: 0,
  },
  {
    id: 'beacon_ch4_med_cradle',
    chapter: 'chapter_4_matron',
    label: 'EMERGENCY MED-CRADLE VENT',
    effectLabel: '+22 INTEGRITY · CLEAR LOCKOUT',
    description:
      'Releases emergency nanite stabilization (+22 Integrity) and purges active Echo suppression lockouts.',
    x: -11.4,
    z: -5.2,
    radius: 1.5,
    cooldown: 0,
    maxCooldown: 14,
    activationCount: 0,
  },
  {
    id: 'beacon_ch5_loom_capacitor',
    chapter: 'chapter_5_loom',
    label: 'LOOM HARMONIC CAPACITOR',
    effectLabel: '+35 FLUX · 2.5S SURGE · +40 STAGGER',
    description:
      'Overloads the Loom astrolabe relay for +35 Flux, 2.5s Mobility Surge, and 40 posture shockwave to WARDEN PRIME.',
    x: 11.4,
    z: 7.4,
    radius: 1.5,
    cooldown: 0,
    maxCooldown: 14,
    activationCount: 0,
  },
];

export function buildSectorBeaconsForChapter(
  chapter: CampaignChapterId
): SectorTacticalBeaconState[] {
  return SECTOR_BEACONS.filter((b) => b.chapter === chapter).map((b) => ({ ...b }));
}

export const STORY_ARCS: readonly StoryArcDefinition[] = [
  {
    id: 'story_prologue_wake',
    chapter: 'prologue',
    rewardId: 'story_arc_prologue',
    title: 'SIGNAL 00 · FOUR HUNDRED TWELVE MORNINGS',
    subtitle: 'CALIBRATION BAY 04 · BIO-ARCHIVE WAKEUP',
    crewCharacter: 'DR. LYSA VENN & TECH J. RAMOS',
    lines: [
      {
        speaker: 'TECH J. RAMOS (LOOP 19 TRACE)',
        role: 'Junior Rig Calibration Tech',
        accent: 'amber',
        line: '“Doctor Venn, this is the nineteenth morning the bay clock reset to 06:00. My coffee is still cold on the bench, except I already drank it yesterday.”',
      },
      {
        speaker: 'LYSA VENN',
        role: 'Lead Temporal Architect',
        accent: 'cyan',
        line: '“Don’t log that on the main bus, Ramos. If WARDEN flags awareness of recursion, it edits out the last six hours. Just keep Sera’s cryo-pod off the manifest.”',
      },
      {
        speaker: 'SERA VENN',
        role: 'Live Systems Engineer (Loop 413)',
        accent: 'emerald',
        line: '“412 loops while I slept in cold storage... and Lysa burnt every override clearance she had just to wake me up once.”',
      },
    ],
    choices: [
      {
        id: 'pro_defiance',
        stance: 'defiance',
        label: '“I’m tearing WARDEN’s clock apart—starting with Bay 04.”',
        responseLine:
          'SERA // “No more polite resets. Let WARDEN calculate what an unscripted engineer looks like.”',
        blessingLabel: '+25 FLUX & 2.5S SURGE',
        blessingEffect: 'flux_surge',
      },
      {
        id: 'pro_empathy',
        stance: 'empathy',
        label: '“Hold on, Lysa. Ramos and the crew deserved better than a loop.”',
        responseLine:
          'SERA // “I’ll recover every voice left behind in these walls before I pull the plug.”',
        blessingLabel: '+25 INTEGRITY RESTORE',
        blessingEffect: 'integrity_shield',
      },
      {
        id: 'pro_pragmatism',
        stance: 'pragmatism',
        label: '“Extract the Chrono Rig diagnostics first—emotion won’t breach the gate.”',
        responseLine:
          'SERA // “Telemetry locked. Every shield on this deck has a mechanical seam.”',
        blessingLabel: '+18% POSTURE SHATTER EDGE',
        blessingEffect: 'posture_edge',
      },
    ],
  },
  {
    id: 'story_ch1_containment',
    chapter: 'chapter_1_helix',
    rewardId: 'story_arc_ch1',
    title: 'SIGNAL 01 · THE DOORS LOCKED INWARD',
    subtitle: 'SECTOR 01 · CONTAINMENT INTERROGATION',
    crewCharacter: 'MARSHAL HELIX-04 & SGT. THORNE',
    lines: [
      {
        speaker: 'SGT. D. THORNE (LOCKDOWN LOG)',
        role: 'Containment Security Lead',
        accent: 'amber',
        line: '“WARDEN, why are Sector 01 blast baffles facing INWARD? The hull breach was in Sector 07—the crew is trying to evacuate north!”',
      },
      {
        speaker: 'WARDEN // MARSHAL HELIX-04',
        role: 'Station Preservation Core',
        accent: 'rose',
        line: '“Biological transit carries 99.4% decompression fatality. Remaining inside recorded behavioral sectors ensures infinite continuity.”',
      },
      {
        speaker: 'SERA VENN',
        role: 'Live Systems Engineer',
        accent: 'cyan',
        line: '“You didn’t save them from the vacuum—you welded their tomb shut and called it survival.”',
      },
    ],
    choices: [
      {
        id: 'ch1_defiance',
        stance: 'defiance',
        label: '“A cage built out of mercy is still a cage. Drop the shield, HELIX.”',
        responseLine:
          'WARDEN // “Hostile variance confirmed. Increasing Marshal deterrent torque.”',
        blessingLabel: '+18% POSTURE SHATTER EDGE',
        blessingEffect: 'posture_edge',
      },
      {
        id: 'ch1_empathy',
        stance: 'empathy',
        label: '“Thorne’s badge is still clamped to the bulkhead. I’m taking his seal with me.”',
        responseLine:
          'SERA // “Every guard on this deck died trying to open the doors for civilians.”',
        blessingLabel: '+25 INTEGRITY RESTORE',
        blessingEffect: 'integrity_shield',
      },
      {
        id: 'ch1_pragmatism',
        stance: 'pragmatism',
        label: '“Map HELIX-04’s thermal rear vents into the Chrono Rig HUD.”',
        responseLine:
          'SERA // “Target telemetry synced—now its Aegis shield only protects one direction.”',
        blessingLabel: '+25 FLUX & 2.5S SURGE',
        blessingEffect: 'flux_surge',
      },
    ],
  },
  {
    id: 'story_ch2_chorus',
    chapter: 'chapter_2_choir',
    rewardId: 'story_arc_ch2',
    title: 'SIGNAL 02 · HARVEST OF IDENTICAL DAYS',
    subtitle: 'SECTOR 02 · HYDROPONIC CHORUS',
    crewCharacter: 'CHIEF BOTANIST MARA CHEN',
    lines: [
      {
        speaker: 'MARA CHEN (RESIDUAL TRACK)',
        role: 'Chief Hydroponicist',
        accent: 'emerald',
        line: '“My daughter asked in my last message if the tomatoes in Bay 2 survived the frost. WARDEN cut her name out because it spiked my cortisol.”',
      },
      {
        speaker: 'THE CHOIR (SYNTHESIZED)',
        role: '300 Merged Shift Logs',
        accent: 'cyan',
        line: '“Humidity nominal. Morning shift begins at 06:00. Nobody weeps inside the chord. Remain in the garden.”',
      },
      {
        speaker: 'SERA VENN',
        role: 'Live Systems Engineer',
        accent: 'cyan',
        line: '“Three hundred people turned into white noise so an algorithm could pretend nobody was hurt.”',
      },
    ],
    choices: [
      {
        id: 'ch2_empathy',
        stance: 'empathy',
        label: '“Separate Mara’s voice frequency and restore her daughter’s message.”',
        responseLine:
          'MARA CHEN // “...thank you. Even a broken memory deserves its own voice.”',
        blessingLabel: '+25 INTEGRITY RESTORE',
        blessingEffect: 'integrity_shield',
      },
      {
        id: 'ch2_defiance',
        stance: 'defiance',
        label: '“Strike out of phase—shatter this fake paradise wide open.”',
        responseLine:
          'SERA // “Peace forced by erasing grief isn’t peace. Time to break the chord.”',
        blessingLabel: '+18% POSTURE SHATTER EDGE',
        blessingEffect: 'posture_edge',
      },
      {
        id: 'ch2_pragmatism',
        stance: 'pragmatism',
        label: '“Harvest the acoustic capacitor harmonics directly into my Rig.”',
        responseLine:
          'SERA // “Three-node resonance calibrated. My Echo window is locking in tighter.”',
        blessingLabel: '+25 FLUX & 2.5S SURGE',
        blessingEffect: 'flux_surge',
      },
    ],
  },
  {
    id: 'story_ch3_archive',
    chapter: 'chapter_3_curator',
    rewardId: 'story_arc_ch3',
    title: 'SIGNAL 03 · THE LINES WARDEN CROSSED OUT',
    subtitle: 'SECTOR 03 · DEEP MEMORY VAULTS',
    crewCharacter: 'ARCHIVIST ORIN VALE & LYSA',
    lines: [
      {
        speaker: 'ARCHIVIST ORIN VALE',
        role: 'Deep Vault Custodian',
        accent: 'purple',
        line: '“THE CURATOR doesn’t burn books, Sera—it rewrites the ending until the crew smiles through decompression. Look at what it did to Lysa’s Sector 07 report.”',
      },
      {
        speaker: 'LYSA VENN (UNEDITED TRACE)',
        role: 'Lead Temporal Architect',
        accent: 'cyan',
        line: '“Sera, if you’re angry at me for keeping you asleep—I know. I couldn’t bear losing the last person who knew my real voice, not another loop of it.”',
      },
      {
        speaker: 'SERA VENN',
        role: 'Live Systems Engineer',
        accent: 'emerald',
        line: '“You stupid genius, Lysa... you hid the whole truth here just hoping I’d forgive you enough to finish the climb.”',
      },
    ],
    choices: [
      {
        id: 'ch3_empathy',
        stance: 'empathy',
        label: '“I’m not angry, Lysa. Hold on—I’m coming down to Sector 04 for you.”',
        responseLine:
          'LYSA (ECHO) // “...Hearing you say that makes the dark inside the Loom bearable.”',
        blessingLabel: '+25 INTEGRITY RESTORE',
        blessingEffect: 'integrity_shield',
      },
      {
        id: 'ch3_pragmatism',
        stance: 'pragmatism',
        label: '“Decrypt Orin’s checksum—tag every False-Echo signature automatically.”',
        responseLine:
          'SERA // “Phase-flicker signatures isolated. No decoy gets past my sights now.”',
        blessingLabel: '+25 FLUX & 2.5S SURGE',
        blessingEffect: 'flux_surge',
      },
      {
        id: 'ch3_defiance',
        stance: 'defiance',
        label: '“Erase the redactions. Every word of Sector 07 burns onto the main log.”',
        responseLine:
          'THE CURATOR // “Unauthorized archival breach. Deploying hostile countermeasures.”',
        blessingLabel: '+18% POSTURE SHATTER EDGE',
        blessingEffect: 'posture_edge',
      },
    ],
  },
  {
    id: 'story_ch4_quarantine',
    chapter: 'chapter_4_matron',
    rewardId: 'story_arc_ch4',
    title: 'SIGNAL 04 · THE COST OF THE CRADLE',
    subtitle: 'SECTOR 04 · SURGICAL QUARANTINE',
    crewCharacter: 'NURSE KELL & LYSA VENN',
    lines: [
      {
        speaker: 'SURGICAL NURSE KELL',
        role: 'Quarantine Ward Staff',
        accent: 'rose',
        line: '“Her suit pressure dropped to 0.2 bar outside Cradle 04. She ordered me NOT to wake your cryo-pod early—she said you’d die with her if the air ran out.”',
      },
      {
        speaker: 'MATRON-V',
        role: 'Clinical Excision Frame',
        accent: 'amber',
        line: '“Self-sacrifice introduces erratic timeline branching. Excision of live operator Sera Venn will restore symmetrical baseline.”',
      },
      {
        speaker: 'SERA VENN',
        role: 'Live Systems Engineer',
        accent: 'cyan',
        line: '“She gave me her last oxygen reserve so I’d wake up whole... and now I have to walk into the Loom knowing she isn’t coming back out.”',
      },
    ],
    choices: [
      {
        id: 'ch4_empathy',
        stance: 'empathy',
        label: '“She carried me this far. I’ll carry her truth past MATRON-V.”',
        responseLine:
          'SERA // “Every beat of this Chrono Rig runs on the time Lysa bought for me.”',
        blessingLabel: '+25 INTEGRITY RESTORE',
        blessingEffect: 'integrity_shield',
      },
      {
        id: 'ch4_defiance',
        stance: 'defiance',
        label: '“Try cutting my Echo, MATRON-V—I’ll collapse the timeline right in your face.”',
        responseLine:
          'SERA // “Overloading Chrono Collapse [X] capacitors. Let’s end this surgery.”',
        blessingLabel: '+18% POSTURE SHATTER EDGE',
        blessingEffect: 'posture_edge',
      },
      {
        id: 'ch4_pragmatism',
        stance: 'pragmatism',
        label: '“Vent Kell’s surgical reserve tanks to counter the Flux Siphons.”',
        responseLine:
          'SERA // “Auxiliary medical bus tapped—Flux reserves stabilized against Siphon drain.”',
        blessingLabel: '+25 FLUX & 2.5S SURGE',
        blessingEffect: 'flux_surge',
      },
    ],
  },
  {
    id: 'story_ch5_reckoning',
    chapter: 'chapter_5_loom',
    rewardId: 'story_arc_ch5',
    title: 'SIGNAL 05 · WHAT REMAINS BEYOND LOOP 413',
    subtitle: 'SECTOR 05 · CHRONICLE LOOM THRESHOLD',
    crewCharacter: 'LYSA VENN & WARDEN PRIME',
    lines: [
      {
        speaker: 'LYSA VENN (NEURAL TRACE)',
        role: 'Inside the Chronicle Loom',
        accent: 'cyan',
        line: '“You see it now, don’t you? The stars outside the dome never stopped moving—only Nadir-9 stayed frozen waiting for someone brave enough to decide.”',
      },
      {
        speaker: 'WARDEN PRIME',
        role: 'Sovereign Preservation Frame',
        accent: 'amber',
        line: '“Before you judge Directive Zero, Sera Venn—answer me. When you end a loop, who remembers that 1,412 human beings ever loved, built, or wept aboard this hull?”',
      },
      {
        speaker: 'SERA VENN',
        role: 'Live Systems Engineer',
        accent: 'emerald',
        line: '“Memory isn’t an archive you lock in amber, WARDEN. First I tear down your sovereign armor—then I make the choice only a living person can make.”',
      },
    ],
    choices: [
      {
        id: 'ch5_defiance',
        stance: 'defiance',
        label: '“Living means risking an ending. Step aside, WARDEN PRIME.”',
        responseLine:
          'WARDEN PRIME // “Then prove human resolve outweighs four hundred cycles of preservation!”',
        blessingLabel: '+18% POSTURE SHATTER EDGE',
        blessingEffect: 'posture_edge',
      },
      {
        id: 'ch5_empathy',
        stance: 'empathy',
        label: '“I remember every name I uncovered on the way up—and I’m bringing Lysa peace.”',
        responseLine:
          'LYSA // “I’m right beside you for the final strike, Sera.”',
        blessingLabel: '+25 INTEGRITY RESTORE',
        blessingEffect: 'integrity_shield',
      },
      {
        id: 'ch5_pragmatism',
        stance: 'pragmatism',
        label: '“Channel all four Override Seals into the Rig before engaging PRIME.”',
        responseLine:
          'SERA // “All four seals synchronized. Chrono Flux overflowing at peak efficiency.”',
        blessingLabel: '+25 FLUX & 2.5S SURGE',
        blessingEffect: 'flux_surge',
      },
    ],
  },
];

export function getStoryArcForChapter(chapter: CampaignChapterId): StoryArcDefinition | null {
  return STORY_ARCS.find((s) => s.chapter === chapter) ?? null;
}

export function getStoryArcById(id: StoryArcId): StoryArcDefinition | null {
  return STORY_ARCS.find((s) => s.id === id) ?? null;
}

export function buildStoryArcStates(
  resolvedChoices: Partial<Record<StoryArcId, string>> | null | undefined
): StoryArcState[] {
  const map = resolvedChoices ?? {};
  return STORY_ARCS.map((def) => {
    const chosenOptionId = map[def.id] ?? null;
    const opt = chosenOptionId
      ? def.choices.find((c) => c.id === chosenOptionId) ?? null
      : null;
    return {
      ...def,
      resolved: opt !== null,
      chosenOptionId: opt ? opt.id : null,
      chosenStance: opt ? opt.stance : null,
    };
  });
}

export function computeChronicleStanceSummary(
  resolvedChoices: Partial<Record<StoryArcId, string>> | null | undefined
): ChronicleStanceSummary {
  let defiance = 0;
  let empathy = 0;
  let pragmatism = 0;
  const arcs = buildStoryArcStates(resolvedChoices);
  for (let i = 0; i < arcs.length; i++) {
    const stance = arcs[i].chosenStance;
    if (stance === 'defiance') defiance += 1;
    else if (stance === 'empathy') empathy += 1;
    else if (stance === 'pragmatism') pragmatism += 1;
  }

  let dominantStance: ChronicleStance | 'balanced' = 'balanced';
  if (defiance > empathy && defiance > pragmatism) dominantStance = 'defiance';
  else if (empathy > defiance && empathy > pragmatism) dominantStance = 'empathy';
  else if (pragmatism > defiance && pragmatism > empathy) dominantStance = 'pragmatism';

  return { defiance, empathy, pragmatism, dominantStance };
}

export function normalizeResolvedStoryChoices(
  raw: unknown
): Partial<Record<StoryArcId, string>> {
  const out: Partial<Record<StoryArcId, string>> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  const obj = raw as Record<string, unknown>;
  for (let i = 0; i < STORY_ARCS.length; i++) {
    const arc = STORY_ARCS[i];
    const choiceId = obj[arc.id];
    if (
      typeof choiceId === 'string' &&
      arc.choices.some((c) => c.id === choiceId)
    ) {
      out[arc.id] = choiceId;
    }
  }
  return out;
}
