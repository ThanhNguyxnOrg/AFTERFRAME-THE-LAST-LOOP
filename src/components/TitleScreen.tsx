import React, { useState } from 'react';
import { GAME_CONFIG } from '../game/config.ts';
import type {
  BossEncounterId,
  CameraSettings,
  CampaignChapterId,
  ChronicleLoomEndingId,
} from '../game/types.ts';

type ActiveTitleDrawer = 'none' | 'chapters' | 'practice' | 'controls';

interface TitleScreenProps {
  onStartCampaign: () => void;
  onStartPracticeStandard?: () => void;
  onStartBoss?: (bossId?: BossEncounterId) => void;
  unlockedChapters?: CampaignChapterId[];
  completedChapters?: CampaignChapterId[];
  recoveredLogs?: string[];
  completedEndings?: ChronicleLoomEndingId[];
  activeChapter?: CampaignChapterId;
  savedCampaignChapter?: CampaignChapterId | null;
  onSelectCampaignChapter?: (chapter: CampaignChapterId) => void;
  hasSavedCampaignSnapshot?: boolean;
  onRestoreSavedCampaign?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  tutorialEnabled?: boolean;
  onToggleTutorial?: () => void;
  cameraSettings?: CameraSettings;
  onUpdateCameraSettings?: (settings: Partial<CameraSettings>) => void;
}

const CHAPTER_METADATA: Array<{
  id: CampaignChapterId;
  code: string;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  unlockRequirement: string;
}> = [
  {
    id: 'prologue',
    code: 'PROLOGUE',
    label: 'Prologue · Wake',
    title: 'Prologue: Wake',
    subtitle: 'Calibration Bay 04',
    description:
      'Bring Sera Venn’s Chrono Rig online, neutralize 3 WARDEN security proxies, and unlock the 3-stage Calibration Gate.',
    unlockRequirement: 'Available on initial launch',
  },
  {
    id: 'chapter_1_helix',
    code: 'CHAPTER I',
    label: 'Ch.I · HELIX-04',
    title: 'Chapter I: A Place That Remembers',
    subtitle: 'Marshal HELIX-04',
    description:
      'Breach Primary Containment and dismantle WARDEN Security Marshal HELIX-04 using directional parries and Echo Convergence.',
    unlockRequirement: 'Complete Prologue: Wake in Calibration Bay 04 to unlock',
  },
  {
    id: 'chapter_2_choir',
    code: 'CHAPTER II',
    label: 'Ch.II · THE CHOIR',
    title: 'Chapter II: Garden of Repeated Days',
    subtitle: 'THE CHOIR',
    description:
      'Shatter the Harmonic Confluence shield by priming one pylon with a Chrono Echo and striking a linked pylon with live Sera.',
    unlockRequirement: 'Defeat Marshal HELIX-04 in Chapter I to unlock',
  },
  {
    id: 'chapter_3_curator',
    code: 'CHAPTER III',
    label: 'Ch.III · THE CURATOR',
    title: 'Chapter III: The Archive That Answers',
    subtitle: 'THE CURATOR',
    description:
      'Read reconstructed attack traces and deploy Gravity Pin [G] to anchor false-Echo decoys and interrupt boss telegraphs.',
    unlockRequirement: 'Defeat THE CHOIR in Chapter II to unlock',
  },
  {
    id: 'chapter_4_matron',
    code: 'CHAPTER IV',
    label: 'Ch.IV · MATRON-V',
    title: 'Chapter IV: A System That Wants You Dead',
    subtitle: 'MATRON-V, The Surgeon',
    description:
      'Counter Siphon and Eraser units while detonating active Echoes with Echo Collapse [X] before Chrono Sever purges your track.',
    unlockRequirement: 'Defeat THE CURATOR in Chapter III to unlock',
  },
  {
    id: 'chapter_5_loom',
    code: 'CHAPTER V',
    label: 'Ch.V · Chronicle Loom',
    title: 'Chapter V: The Last Loop',
    subtitle: 'Chronicle Loom Core',
    description:
      'Access the central behavioral archive of Nadir-9 and choose humanity’s final directive: Silence, Witness, or Continuity.',
    unlockRequirement: 'Defeat MATRON-V in Chapter IV to unlock',
  },
];

const PRACTICE_ENCOUNTERS: Array<{
  testId: string;
  bossId?: BossEncounterId;
  code: string;
  title: string;
  focus: string;
  accentClass: string;
}> = [
  {
    testId: 'title-btn-practice-standard',
    code: 'SANDBOX BAY',
    title: 'Practice · Calibration Bay',
    focus: 'Echo recording [T], replay [Y], Relay warp [V], and the 3-step Calibration puzzle.',
    accentClass: 'border-slate-700 hover:border-cyan-400/70 text-slate-200',
  },
  {
    testId: 'title-btn-boss',
    bossId: 'helix-04',
    code: 'WARDEN 01',
    title: 'Practice · HELIX-04 [B]',
    focus: 'Frontal armor counterplay, Vector Ram dodges, Helical Sweep parries, and Convergence.',
    accentClass: 'border-amber-500/50 hover:border-amber-400 text-amber-300',
  },
  {
    testId: 'title-btn-boss-choir',
    bossId: 'the-choir',
    code: 'WARDEN 02',
    title: 'THE CHOIR',
    focus: 'Multi-target Harmonic Node synchronization within the 8.5s resonance window.',
    accentClass: 'border-cyan-500/50 hover:border-cyan-400 text-cyan-300',
  },
  {
    testId: 'title-btn-boss-curator',
    bossId: 'the-curator',
    code: 'WARDEN 03',
    title: 'THE CURATOR',
    focus: 'Reconstructed trace reading, False-Echo decoys, and Gravity Pin [G] interrupts.',
    accentClass: 'border-purple-500/50 hover:border-purple-400 text-purple-300',
  },
  {
    testId: 'title-btn-boss-matron',
    bossId: 'matron-v',
    code: 'WARDEN 04',
    title: 'MATRON-V',
    focus: 'Siphon Flux defense, Chrono Sever evasion, and Echo Collapse [X] detonation.',
    accentClass: 'border-rose-500/50 hover:border-rose-400 text-rose-300',
  },
];

function getChapterShortName(chapter: CampaignChapterId | null | undefined): string {
  const found = CHAPTER_METADATA.find((c) => c.id === chapter);
  return found ? found.label : 'Active Sector';
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartCampaign,
  onStartPracticeStandard,
  onStartBoss,
  unlockedChapters = ['prologue'],
  completedChapters = [],
  recoveredLogs = ['LOG-00'],
  completedEndings = [],
  activeChapter = 'prologue',
  savedCampaignChapter = null,
  onSelectCampaignChapter,
  hasSavedCampaignSnapshot = false,
  onRestoreSavedCampaign,
  isMuted,
  onToggleMute,
  tutorialEnabled = true,
  onToggleTutorial,
  cameraSettings,
  onUpdateCameraSettings,
}) => {
  const [activeDrawer, setActiveDrawer] = useState<ActiveTitleDrawer>('none');

  const toggleDrawer = (drawer: Exclude<ActiveTitleDrawer, 'none'>) => {
    setActiveDrawer((prev) => (prev === drawer ? 'none' : drawer));
  };

  const unlockedCount = CHAPTER_METADATA.filter((ch) =>
    unlockedChapters.includes(ch.id)
  ).length;

  return (
    <div
      className="fixed inset-0 z-20 flex flex-col justify-between p-4 sm:p-7 lg:p-12 pointer-events-none overflow-y-auto"
      style={{
        background:
          'linear-gradient(95deg, rgba(6,9,14,0.95) 0%, rgba(6,9,14,0.82) 45%, rgba(6,9,14,0.32) 100%)',
      }}
    >
      {/* Top Bar: Station Designation & Quick Audio Toggle */}
      <header className="flex items-center justify-between w-full gap-3 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs tracking-widest text-slate-400 font-mono-tabular">
          <span className="text-cyan-400 font-semibold">NADIR-9 ORBITAL STATION</span>
          <span aria-hidden="true">·</span>
          <span>CHRONO RIG ARCHIVE</span>
          <span aria-hidden="true" className="hidden md:inline">
            ·
          </span>
          <span className="hidden md:inline text-slate-300">
            CAMPAIGN PROGRESS: {unlockedCount}/6 SECTORS · {recoveredLogs.length}/6 LOGS ·{' '}
            {completedEndings.length}/3 ENDINGS
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.currentTarget.blur();
            onToggleMute();
          }}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 text-xs font-mono-tabular text-slate-200 bg-[#0d1420]/90 hover:bg-[#172336] border border-slate-700/80 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 text-cyan-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {isMuted ? (
              <>
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </>
            ) : (
              <>
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </>
            )}
          </svg>
          <span>{isMuted ? 'AUDIO MUTED [M]' : 'AUDIO ACTIVE [M]'}</span>
        </button>
      </header>

      {/* Main Two-Column Composition */}
      <div className="my-auto py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center w-full max-w-7xl mx-auto">
        {/* Left Column: Game Identity, Clear Premise & Primary Entry Hierarchy */}
        <section className="lg:col-span-6 pointer-events-auto flex flex-col items-start">
          {/* Bespoke Inline SVG Title Emblem & Lockup */}
          <div className="mb-4 sm:mb-5 w-full">
            <svg
              viewBox="0 0 520 136"
              className="w-full max-w-[470px] h-auto overflow-visible"
              role="img"
              aria-label="AFTERFRAME: THE LAST LOOP"
            >
              <g transform="translate(46, 66)">
                <circle
                  cx="0"
                  cy="0"
                  r="38"
                  fill="#0b111a"
                  stroke="#1e293b"
                  strokeWidth="2"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="31"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  strokeDasharray="42 14 18 14"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="21"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.75"
                  strokeDasharray="24 12"
                />
                <polygon
                  points="0,-14 12,0 0,14 -12,0"
                  fill="#22d3ee"
                  stroke="#f8fafc"
                  strokeWidth="1.5"
                />
                <line x1="-44" y1="0" x2="-32" y2="0" stroke="#22d3ee" strokeWidth="2" />
                <line x1="32" y1="0" x2="44" y2="0" stroke="#22d3ee" strokeWidth="2" />
                <line x1="0" y1="-44" x2="0" y2="-32" stroke="#22d3ee" strokeWidth="2" />
                <line x1="0" y1="32" x2="0" y2="44" stroke="#22d3ee" strokeWidth="2" />
              </g>

              <path
                d="M104 20 H500 L512 32 V104 H104 Z"
                fill="rgba(11, 17, 26, 0.88)"
                stroke="#1e293b"
                strokeWidth="1.5"
              />
              <path d="M104 20 H180" stroke="#22d3ee" strokeWidth="3" />
              <path d="M460 104 H512" stroke="#f59e0b" strokeWidth="3" />

              <text
                x="120"
                y="68"
                fill="#f8fafc"
                fontFamily="'Chakra Petch', sans-serif"
                fontWeight="700"
                fontSize="44"
                letterSpacing="4"
              >
                AFTERFRAME
              </text>

              <text
                x="122"
                y="93"
                fill="#22d3ee"
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="600"
                fontSize="14"
                letterSpacing="5.5"
              >
                THE LAST LOOP
              </text>
            </svg>
          </div>

          {/* Concise, Readable Narrative Hook */}
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-2 max-w-xl">
            Trapped aboard damaged orbital station{' '}
            <span className="text-white font-semibold">Nadir-9</span>, engineer{' '}
            <span className="text-cyan-300 font-semibold">Sera Venn</span> uses her Chrono Rig
            to record short action sequences and spawn Echoes that replay them in real time.
          </p>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-xl font-mono-tabular">
            “Your past is your greatest weapon. Your future is the one thing WARDEN cannot predict.”
          </p>

          {/* Primary Action Block: Unmistakable Hierarchy */}
          <div className="w-full max-w-md flex flex-col gap-3 mb-5">
            {hasSavedCampaignSnapshot && onRestoreSavedCampaign && (
              <button
                type="button"
                data-testid="title-btn-restore-campaign"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onRestoreSavedCampaign();
                }}
                className="w-full flex items-center justify-between px-6 py-4 bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 text-slate-950 font-display font-bold text-base tracking-wider uppercase transition-colors cursor-pointer shadow-[0_0_28px_rgba(34,211,238,0.35)]"
              >
                <span>CONTINUE CAMPAIGN</span>
                <span className="text-xs font-mono-tabular font-semibold bg-slate-950/20 px-2 py-0.5">
                  {getChapterShortName(savedCampaignChapter)}
                </span>
              </button>
            )}

            <button
              type="button"
              data-start="true"
              data-testid="title-btn-new-run"
              onClick={(e) => {
                e.currentTarget.blur();
                onStartCampaign();
              }}
              className={`w-full flex items-center justify-between px-6 py-4 font-display font-bold text-base sm:text-lg tracking-wider uppercase transition-colors cursor-pointer ${
                hasSavedCampaignSnapshot
                  ? 'bg-[#101c2e] hover:bg-[#172942] border-2 border-cyan-400/80 text-cyan-200'
                  : 'bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.38)]'
              }`}
            >
              <span>NEW CAMPAIGN [ENTER]</span>
              <span
                className={`text-[11px] font-mono-tabular font-semibold ${
                  hasSavedCampaignSnapshot ? 'text-cyan-300/90' : 'text-slate-900'
                }`}
              >
                PROLOGUE · BAY 04
              </span>
            </button>
          </div>

          {/* Secondary Mode Switcher Bar: Chapter Select, Practice Arena, Controls & Settings */}
          <nav
            aria-label="Secondary Game Modes and Configuration"
            className="w-full max-w-md grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/90"
          >
            <button
              type="button"
              data-testid="title-nav-chapters"
              aria-expanded={activeDrawer === 'chapters'}
              onClick={(e) => {
                e.currentTarget.blur();
                toggleDrawer('chapters');
              }}
              className={`px-3 py-2.5 text-left border transition-colors cursor-pointer ${
                activeDrawer === 'chapters'
                  ? 'bg-[#132338] border-cyan-400 text-cyan-200'
                  : 'bg-[#0b121d]/90 hover:bg-[#131e30] border-slate-700/80 text-slate-300'
              }`}
            >
              <div className="text-[10px] font-mono-tabular uppercase tracking-widest text-cyan-400">
                CAMPAIGN
              </div>
              <div className="text-xs font-display font-bold uppercase tracking-wider mt-0.5">
                CHAPTER SELECT
              </div>
            </button>

            <button
              type="button"
              data-testid="title-nav-practice"
              aria-expanded={activeDrawer === 'practice'}
              onClick={(e) => {
                e.currentTarget.blur();
                toggleDrawer('practice');
              }}
              className={`px-3 py-2.5 text-left border transition-colors cursor-pointer ${
                activeDrawer === 'practice'
                  ? 'bg-[#1f1912] border-amber-400 text-amber-200'
                  : 'bg-[#0b121d]/90 hover:bg-[#131e30] border-slate-700/80 text-slate-300'
              }`}
            >
              <div className="text-[10px] font-mono-tabular uppercase tracking-widest text-amber-400">
                SIMULATION
              </div>
              <div className="text-xs font-display font-bold uppercase tracking-wider mt-0.5">
                PRACTICE ARENA
              </div>
            </button>

            <button
              type="button"
              data-testid="title-btn-controls"
              aria-expanded={activeDrawer === 'controls'}
              onClick={(e) => {
                e.currentTarget.blur();
                toggleDrawer('controls');
              }}
              className={`px-3 py-2.5 text-left border transition-colors cursor-pointer ${
                activeDrawer === 'controls'
                  ? 'bg-[#132338] border-cyan-400 text-cyan-200'
                  : 'bg-[#0b121d]/90 hover:bg-[#131e30] border-slate-700/80 text-slate-300'
              }`}
            >
              <div className="text-[10px] font-mono-tabular uppercase tracking-widest text-slate-400">
                MANUAL
              </div>
              <div className="text-xs font-display font-bold uppercase tracking-wider mt-0.5">
                CONTROLS
              </div>
            </button>
          </nav>
        </section>

        {/* Right Column: Purposeful Contextual Drawer or Restrained Mission Briefing Card */}
        <section className="lg:col-span-6 flex flex-col lg:items-end pointer-events-auto">
          {/* Default Mission Briefing Overview (Desktop right column; hidden on small mobile to preserve 3D viewport) */}
          {activeDrawer === 'none' && (
            <div
              data-testid="title-mission-overview"
              className="hidden lg:block w-full max-w-lg bg-[#090e17]/85 border border-slate-800/90 p-5 text-slate-300 shadow-[0_16px_40px_rgba(0,0,0,0.65)]"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <span className="text-xs font-mono-tabular font-semibold uppercase tracking-widest text-cyan-400">
                  FIRST-TIME OPERATOR BRIEFING
                </span>
                <span className="text-[11px] font-mono-tabular text-slate-400">
                  SECTOR 04 · READY
                </span>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="flex items-start gap-3">
                  <span className="font-mono-tabular font-bold text-cyan-400 shrink-0">01.</span>
                  <div>
                    <span className="text-slate-100 font-semibold">Move & Fight:</span> Use{' '}
                    <span className="text-cyan-300 font-mono-tabular">[WASD]</span> to move,{' '}
                    <span className="text-cyan-300 font-mono-tabular">Mouse / [Arrow Keys]</span>{' '}
                    to aim, <span className="text-cyan-300 font-mono-tabular">[LMB / F]</span> for
                    Light combos, and{' '}
                    <span className="text-amber-300 font-mono-tabular">[E / R-Click]</span> for
                    armor-breaking Heavy strikes.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono-tabular font-bold text-amber-400 shrink-0">02.</span>
                  <div>
                    <span className="text-slate-100 font-semibold">Record & Replay Echoes:</span>{' '}
                    Press <span className="text-amber-300 font-mono-tabular">[T]</span> to record
                    Sera’s actions, then press{' '}
                    <span className="text-cyan-300 font-mono-tabular">[Y]</span> to spawn a Chrono
                    Echo that replays them independently.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-mono-tabular font-bold text-emerald-400 shrink-0">03.</span>
                  <div>
                    <span className="text-slate-100 font-semibold">Synchronize & Relay:</span>{' '}
                    Press <span className="text-cyan-300 font-mono-tabular">[V]</span> to teleport
                    to an active Echo, or follow an Echo Heavy strike with a live Heavy strike for{' '}
                    <span className="text-white font-semibold">Resonance Convergence</span>.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Drawer 1: Campaign Chapter Select (Always mounted in DOM for testability; visible when activeDrawer === 'chapters') */}
          {onSelectCampaignChapter && (
            <div
              data-testid="title-chapter-select"
              className={
                activeDrawer === 'chapters'
                  ? 'w-full max-w-lg bg-[#090e17]/95 border border-cyan-500/50 p-4 text-slate-200 shadow-[0_16px_48px_rgba(0,0,0,0.85)]'
                  : 'sr-only'
              }
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
                <div>
                  <div className="text-[10px] font-mono-tabular uppercase tracking-widest text-cyan-400">
                    CAMPAIGN ARCHIVE · {unlockedCount} OF 6 UNLOCKED
                  </div>
                  <h2 className="text-sm sm:text-base font-display font-bold uppercase tracking-wider text-white">
                    SELECT CAMPAIGN CHAPTER
                  </h2>
                </div>
                <button
                  type="button"
                  data-testid="title-drawer-close-chapters"
                  onClick={() => setActiveDrawer('none')}
                  className="px-2.5 py-1 text-xs font-mono-tabular uppercase bg-[#111a29] hover:bg-[#1b2940] border border-slate-700 text-slate-300 cursor-pointer"
                >
                  ← Close
                </button>
              </div>

              <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-0.5">
                {CHAPTER_METADATA.map((ch) => {
                  const unlocked = unlockedChapters.includes(ch.id);
                  const completed = completedChapters.includes(ch.id);
                  const isCurrent = activeChapter === ch.id && unlocked;
                  const statusLabel = completed
                    ? 'COMPLETED'
                    : isCurrent
                      ? 'ACTIVE'
                      : unlocked
                        ? 'UNLOCKED'
                        : 'LOCKED';

                  return (
                    <button
                      key={ch.id}
                      type="button"
                      disabled={!unlocked}
                      data-testid={`title-chapter-${ch.id}`}
                      data-unlocked={unlocked ? 'true' : 'false'}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        if (unlocked) {
                          onSelectCampaignChapter(ch.id);
                        }
                      }}
                      className={`w-full text-left px-3 py-2 border transition-colors ${
                        unlocked
                          ? 'bg-[#0d1624] hover:bg-[#16243a] border-cyan-500/50 cursor-pointer'
                          : 'bg-[#070b12]/80 border-slate-800/80 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span
                          className={`font-display font-bold text-xs uppercase tracking-wider ${
                            unlocked ? 'text-white' : 'text-slate-500'
                          }`}
                        >
                          {ch.label} — {ch.subtitle}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {unlocked && (
                            <span className="text-[9px] font-mono-tabular px-1.5 py-0.5 bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 uppercase tracking-wider">
                              {GAME_CONFIG.campaignChapters[ch.id].archiveLog.id} ·{' '}
                              {GAME_CONFIG.campaignChapters[ch.id].archiveLog.title}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-mono-tabular font-semibold uppercase tracking-widest ${
                              completed
                                ? 'text-emerald-400'
                                : unlocked
                                  ? 'text-cyan-300'
                                  : 'text-slate-500'
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug line-clamp-1">
                        {unlocked ? ch.description : `LOCKED · ${ch.unlockRequirement}`}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Persistent Chronicle Loom Ending Archive Strip */}
              <div
                data-testid="title-ending-archive-bar"
                className="mt-2.5 pt-2.5 border-t border-slate-800/90"
              >
                <div className="flex items-center justify-between text-[9px] font-mono-tabular uppercase tracking-widest text-slate-400 mb-1.5">
                  <span>CHRONICLE LOOM DIRECTIVES RECORDED</span>
                  <span className="text-cyan-300 font-bold">{completedEndings.length} / 3</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'silence', label: 'SILENCE' },
                      { id: 'witness', label: 'WITNESS' },
                      { id: 'continuity', label: 'CONTINUITY' },
                    ] as const
                  ).map((ending) => {
                    const recorded = completedEndings.includes(ending.id);
                    return (
                      <div
                        key={ending.id}
                        data-testid={`title-ending-badge-${ending.id}`}
                        data-recorded={recorded ? 'true' : 'false'}
                        className={`px-2 py-1 border text-[9px] font-mono-tabular flex items-center justify-between ${
                          recorded
                            ? 'bg-emerald-950/35 border-emerald-500/60 text-emerald-300'
                            : 'bg-[#070b12] border-slate-800 text-slate-500'
                        }`}
                      >
                        <span className="font-bold">{ending.label}</span>
                        <span>{recorded ? 'RECORDED' : 'LOCKED'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Drawer 2: Practice Arena (Always mounted in DOM for testability; visible when activeDrawer === 'practice') */}
          <div
            data-testid="title-practice-panel"
            className={
              activeDrawer === 'practice'
                ? 'w-full max-w-lg bg-[#090e17]/95 border border-amber-500/50 p-4 text-slate-200 shadow-[0_16px_48px_rgba(0,0,0,0.85)]'
                : 'sr-only'
            }
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2">
              <div>
                <div className="text-[10px] font-mono-tabular uppercase tracking-widest text-amber-400">
                  ISOLATED SIMULATION · NO CAMPAIGN MUTATION
                </div>
                <h2 className="text-sm sm:text-base font-display font-bold uppercase tracking-wider text-white">
                  PRACTICE & BOSS TRAINING ARENA
                </h2>
              </div>
              <button
                type="button"
                data-testid="title-drawer-close-practice"
                onClick={() => setActiveDrawer('none')}
                className="px-2.5 py-1 text-xs font-mono-tabular uppercase bg-[#111a29] hover:bg-[#1b2940] border border-slate-700 text-slate-300 cursor-pointer"
              >
                ← Close
              </button>
            </div>

            <p className="text-[11px] font-mono-tabular text-slate-400 mb-2.5">
              Practice victories and resets are completely isolated from your main campaign progression.
            </p>

            <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-0.5">
              {PRACTICE_ENCOUNTERS.map((item) => {
                const handleClick = () => {
                  if (!item.bossId) {
                    onStartPracticeStandard?.();
                  } else {
                    onStartBoss?.(item.bossId);
                  }
                };
                return (
                  <button
                    key={item.testId}
                    type="button"
                    data-testid={item.testId}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      handleClick();
                    }}
                    className={`w-full text-left px-3 py-2 bg-[#0d1420] hover:bg-[#152033] border transition-colors cursor-pointer ${item.accentClass}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-display font-bold text-xs uppercase tracking-wider">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono-tabular text-slate-400">
                        {item.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug line-clamp-1">
                      {item.focus}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drawer 3: Controls & Settings */}
          {activeDrawer === 'controls' && (
            <div
              data-testid="title-controls-panel"
              className="w-full max-w-lg bg-[#090e17]/95 border border-slate-700/90 p-5 text-xs font-mono-tabular text-slate-300 shadow-[0_16px_48px_rgba(0,0,0,0.85)]"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3.5">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-cyan-400">
                    NADIR-9 FIELD SPECIFICATION
                  </div>
                  <h2 className="text-base font-display font-bold uppercase tracking-wider text-white">
                    CONTROLS & SYSTEM SETTINGS
                  </h2>
                </div>
                <button
                  type="button"
                  data-testid="title-drawer-close-controls"
                  onClick={() => setActiveDrawer('none')}
                  className="px-2.5 py-1 text-xs font-mono-tabular uppercase bg-[#111a29] hover:bg-[#1b2940] border border-slate-700 text-slate-300 cursor-pointer"
                >
                  ← Close
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed mb-4">
                <div className="bg-[#0d1422] border border-slate-800 p-2.5">
                  <div className="text-white font-semibold mb-1 uppercase tracking-wider">
                    MOVEMENT & COMBAT
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <div>
                      <span className="text-cyan-300">[WASD]</span> Move ·{' '}
                      <span className="text-cyan-300">[Mouse / Arrows]</span> Aim
                    </div>
                    <div>
                      <span className="text-cyan-300">[LMB / F / J]</span> 3-Hit Light Combo
                    </div>
                    <div>
                      <span className="text-amber-300">[Hold LMB / E / K / RMB]</span> Heavy Cleave
                    </div>
                    <div>
                      <span className="text-cyan-300">[Space / Shift]</span> Dodge ·{' '}
                      <span className="text-amber-300">[Q]</span> Parry (+35 Flux)
                    </div>
                  </div>
                </div>

                <div className="bg-[#0d1422] border border-slate-800 p-2.5">
                  <div className="text-white font-semibold mb-1 uppercase tracking-wider">
                    CHRONO RIG & SYSTEM
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <div>
                      <span className="text-amber-300">[T]</span> Record ·{' '}
                      <span className="text-cyan-300">[Y]</span> Replay ·{' '}
                      <span className="text-slate-300">[C]</span> Clear
                    </div>
                    <div>
                      <span className="text-cyan-300">[V]</span> Relay Warp (25 Flux, 8m)
                    </div>
                    <div>
                      <span className="text-cyan-300">[G]</span> Gravity Pin ·{' '}
                      <span className="text-cyan-300">[X]</span> Echo Collapse
                    </div>
                    <div>
                      <span className="text-slate-200">[P / Esc]</span> Pause ·{' '}
                      <span className="text-slate-200">[R]</span> Restart ·{' '}
                      <span className="text-slate-200">[H]</span> Hints
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Settings Controls */}
              <div className="border-t border-slate-800 pt-3 space-y-2.5">
                <div className="text-[10px] uppercase tracking-widest text-slate-400">
                  PREFERENCES (SAVED AUTOMATICALLY)
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    data-testid="title-setting-mute"
                    onClick={onToggleMute}
                    className="flex items-center justify-between px-3 py-2 bg-[#0d1522] hover:bg-[#162236] border border-slate-700 text-[11px] cursor-pointer"
                  >
                    <span>Audio [M]</span>
                    <span className={isMuted ? 'text-amber-400 font-bold' : 'text-cyan-300 font-bold'}>
                      {isMuted ? 'MUTED' : 'ACTIVE'}
                    </span>
                  </button>

                  {onToggleTutorial && (
                    <button
                      type="button"
                      data-testid="title-setting-hints"
                      onClick={onToggleTutorial}
                      className="flex items-center justify-between px-3 py-2 bg-[#0d1522] hover:bg-[#162236] border border-slate-700 text-[11px] cursor-pointer"
                    >
                      <span>Tutorial Hints [H]</span>
                      <span
                        className={
                          tutorialEnabled ? 'text-cyan-300 font-bold' : 'text-slate-500 font-bold'
                        }
                      >
                        {tutorialEnabled ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  )}
                </div>

                {cameraSettings && onUpdateCameraSettings && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <label className="flex flex-col gap-1 bg-[#0d1522] border border-slate-800 px-3 py-2">
                      <div className="flex justify-between text-[11px]">
                        <span>Camera Sensitivity</span>
                        <span className="text-cyan-300">
                          {cameraSettings.sensitivity.toFixed(1)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.3"
                        max="2.5"
                        step="0.1"
                        value={cameraSettings.sensitivity}
                        onChange={(e) =>
                          onUpdateCameraSettings({
                            sensitivity: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateCameraSettings({ invertY: !cameraSettings.invertY })
                      }
                      className="flex items-center justify-between px-3 py-2 bg-[#0d1522] hover:bg-[#162236] border border-slate-800 text-[11px] cursor-pointer"
                    >
                      <span>Invert Y-Axis</span>
                      <span
                        className={
                          cameraSettings.invertY ? 'text-cyan-300 font-bold' : 'text-slate-500'
                        }
                      >
                        {cameraSettings.invertY ? 'INVERTED' : 'STANDARD'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Restrained Footer Bar: Chapter Status & Quick Prompt */}
      <footer className="flex items-center justify-between text-[11px] font-mono-tabular text-slate-400 border-t border-slate-800/60 pt-3 shrink-0">
        <span>
          PRESS <strong className="text-cyan-300">[ENTER]</strong> TO LAUNCH CAMPAIGN ·{' '}
          <strong className="text-slate-300">[M]</strong> AUDIO
        </span>
        <span className="hidden sm:inline text-slate-500">
          CHRONO RIG TELEMETRY · DETERMINISTIC LOCAL SIMULATION
        </span>
      </footer>
    </div>
  );
};
