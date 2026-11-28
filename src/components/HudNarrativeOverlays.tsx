import React from 'react';
import { localizeCommsTransmission } from '../game/chronicle-awakening.ts';
import {
  computeHoloMemoryResonanceBonus,
  getChapterStoryBeat,
  getHoloMemoryById,
} from '../game/chronicle-narrative.ts';
import { t } from '../game/i18n.ts';
import { computeCommsCodecProfile } from '../game/tactical-hud.ts';
import type {
  AppLocale,
  CameraSettings,
  HudSnapshot,
  PhotoModeState,
} from '../game/types.ts';

export interface HudUpperNarrativeOverlaysProps {
  hud: HudSnapshot;
  locale: AppLocale;
  actCurtainVisible: boolean;
  focusMode?: boolean;
  photoMode?: PhotoModeState;
  onDismissHoloMemory?: () => void;
}

export const HudUpperNarrativeOverlays: React.FC<HudUpperNarrativeOverlaysProps> = React.memo(
  function HudUpperNarrativeOverlays({
    hud,
    locale,
    actCurtainVisible,
    focusMode = false,
    photoMode,
    onDismissHoloMemory,
  }) {
    return (
      <>
        {/* Diegetic Chapter Act Title Ribbon (Suppressed in Focus Mode or when Holo-Memory is open) */}
        {actCurtainVisible &&
          !focusMode &&
          hud.expedition?.phase !== 'safe_room' &&
          !hud.exploration.activeHoloMemoryId &&
          hud.outcome === 'none' &&
          hud.run.stage !== 'transition_to_boss' &&
          hud.run.stage !== 'boss_intro' &&
          !hud.loom.active &&
          !photoMode?.active &&
          (() => {
            const beat = getChapterStoryBeat(hud.run.chapter);
            return (
              <div
                data-testid="hud-chapter-act-curtain"
                data-chapter={hud.run.chapter}
                className="fixed top-24 sm:top-28 left-1/2 -translate-x-1/2 z-15 w-[90vw] max-w-md pointer-events-none select-none text-center bg-[#060a12]/88 border border-cyan-500/35 px-3.5 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.65)]"
              >
                <div className="flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-mono-tabular tracking-widest text-cyan-300/95">
                  <span>{beat.actNumber}</span>
                  <span aria-hidden="true" className="text-slate-500">
                    ·
                  </span>
                  <span className="text-amber-300/90 truncate">
                    {locale === 'vi' ? beat.locationVi : beat.locationEn}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-display font-bold tracking-wider text-slate-100 mt-0.5">
                  {locale === 'vi' ? beat.titleVi : beat.titleEn}
                </div>
                <div className="text-[10px] text-slate-300/90 truncate mt-0.5">
                  <span className="text-cyan-400 font-semibold">
                    {t(locale, 'actCurtainClueLabel')}:
                  </span>{' '}
                  {locale === 'vi' ? beat.lysaClueVi : beat.lysaClueEn}
                </div>
              </div>
            );
          })()}

        {/* Bilingual 3D Dr. Lysa Venn Holo-Memory Cinema Card */}
        {hud.exploration.activeHoloMemoryId &&
          !photoMode?.active &&
          (() => {
            const holo = getHoloMemoryById(hud.exploration.activeHoloMemoryId);
            if (!holo) return null;
            const discoveredIds = hud.exploration.discoveredHoloMemoryIds ?? [];
            const resonance = computeHoloMemoryResonanceBonus(discoveredIds);
            const remaining = Math.max(0, hud.exploration.activeHoloMemoryTimer ?? 0);
            const pct = Math.max(0, Math.min(100, (remaining / 9.5) * 100));
            return (
              <div
                data-testid="hud-holo-memory-card"
                data-holo-id={holo.id}
                className="fixed right-3 sm:right-4 top-48 z-25 w-[min(416px,calc(100vw-1.5rem))] bg-[#060b14]/94 border border-cyan-400/75 p-3 pointer-events-auto shadow-[0_16px_42px_rgba(0,0,0,0.85)]"
              >
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800/90">
                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono-tabular text-cyan-300 min-w-0">
                    <span className="font-bold whitespace-nowrap">
                      {t(locale, 'holoCardHeader')}
                    </span>
                    <span aria-hidden="true" className="text-slate-500">
                      ·
                    </span>
                    <span className="text-amber-300 whitespace-nowrap">{holo.loopCode}</span>
                    <span aria-hidden="true" className="hidden sm:inline text-slate-500">
                      ·
                    </span>
                    <span className="hidden sm:inline text-slate-400 truncate">
                      {locale === 'vi' ? holo.locationVi : holo.locationEn}
                    </span>
                  </div>
                  <button
                    type="button"
                    tabIndex={-1}
                    data-testid="hud-holo-dismiss-btn"
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onDismissHoloMemory?.();
                    }}
                    className="px-2 py-0.5 text-[9px] font-mono-tabular font-bold bg-[#0f1a2b] hover:bg-[#192b46] border border-cyan-400/50 text-cyan-200 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {t(locale, 'holoDismissBtn')}
                  </button>
                </div>

                <div className="flex flex-wrap items-baseline justify-between gap-2 mt-1.5 mb-2">
                  <h3 className="text-xs sm:text-sm font-display font-bold tracking-wide text-slate-100">
                    {locale === 'vi' ? holo.titleVi : holo.titleEn}
                  </h3>
                  <span className="text-[9px] font-mono-tabular text-emerald-300 whitespace-nowrap">
                    {t(locale, 'holoResonanceBadge')} {resonance.discoveredCount}/
                    {resonance.totalCount} · +{Math.round((resonance.allDamageMult - 1) * 100)}%
                    DMG · +{resonance.bonusMaxWard} WARD
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] leading-snug">
                  {holo.beats.map((b, idx) => (
                    <div
                      key={idx}
                      className="bg-[#09111e]/90 border border-slate-800/80 px-2.5 py-1.5"
                    >
                      <div className="flex items-center gap-1.5 text-[9px] font-mono-tabular text-slate-400 mb-0.5">
                        <span className="font-bold text-cyan-300">
                          {locale === 'vi' ? b.speakerVi : b.speakerEn}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-200/85">
                          {locale === 'vi' ? b.roleVi : b.roleEn}
                        </span>
                      </div>
                      <p className="text-slate-200">
                        “{locale === 'vi' ? b.lineVi : b.lineEn}”
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-2 h-1 w-full bg-[#04070d] border border-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 origin-left transition-transform duration-100"
                    style={{ transform: `scaleX(${(pct / 100).toFixed(3)})` }}
                  />
                </div>
              </div>
            );
          })()}
      </>
    );
  }
);

export interface HudLiveCommsStripProps {
  hud: HudSnapshot;
  locale: AppLocale;
  cameraSettings?: CameraSettings;
  inspectingLoomChamber: boolean;
  focusMode?: boolean;
  onDismissComms?: () => void;
}

export const HudLiveCommsStrip: React.FC<HudLiveCommsStripProps> = React.memo(
  function HudLiveCommsStrip({
    hud,
    locale,
    cameraSettings,
    inspectingLoomChamber,
    focusMode = false,
    onDismissComms,
  }) {
    if (
      focusMode ||
      hud.expedition?.phase === 'safe_room' ||
      !hud.comms.active ||
      !(cameraSettings?.subtitlesEnabled ?? true) ||
      hud.run.stage === 'intro' ||
      hud.run.stage === 'boss_intro' ||
      hud.run.stage === 'transition_to_boss' ||
      (hud.loom.active && !inspectingLoomChamber)
    ) {
      return null;
    }

    const localComms = localizeCommsTransmission(hud.comms.active, locale);
    const codec = computeCommsCodecProfile(
      hud.comms.active.speaker,
      hud.comms.active.classification,
      hud.comms.active.remainingTime,
      hud.comms.active.maxDuration,
      Boolean(cameraSettings?.reducedMotion)
    );
    const formattedSpeaker = localComms.speaker.replace(/\s*\/\/\s*/g, ' · ');
    const formattedFrequency = codec.frequencyLabel.replace(/\s*\/\/\s*/g, ' · ');
    const progressRatio = Math.max(
      0,
      Math.min(
        1,
        hud.comms.active.remainingTime / Math.max(0.1, hud.comms.active.maxDuration)
      )
    );

    return (
      <div
        data-testid="live-comms-banner"
        data-comms-id={hud.comms.active.id}
        data-comms-classification={hud.comms.active.classification}
        data-comms-channel={codec.channelCode}
        className="[@media(min-width:640px)_and_(min-height:541px)]:fixed [@media(min-width:640px)_and_(min-height:541px)]:left-4 [@media(min-width:640px)_and_(min-height:541px)]:bottom-[94px] [@media(min-width:640px)_and_(min-height:541px)]:z-20 [@media(min-width:640px)_and_(min-height:541px)]:w-[312px] w-full bg-gradient-to-r from-[#060b14]/94 to-[#0a1222]/82 border-t border-cyan-400/75 border-b border-white/10 px-2.5 py-1.5 pointer-events-auto shadow-[0_10px_28px_rgba(0,0,0,0.72)]"
      >
        <div className="flex items-start gap-2 mb-1">
          <div className="hidden sm:flex flex-col items-center justify-center w-6 h-6 shrink-0 bg-[#050911]/85 border-t border-white/12">
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              {codec.glyph === 'warden' ? (
                <>
                  <polygon
                    points="12,3 20,8 20,16 12,21 4,16 4,8"
                    fill="none"
                    stroke={codec.accentHex}
                    strokeWidth="1.5"
                  />
                  <polygon
                    points="12,7 16,12 12,17 8,12"
                    fill={codec.accentHex}
                    fillOpacity="0.3"
                    stroke={codec.accentHex}
                    strokeWidth="1"
                  />
                  <line x1="7" y1="12" x2="17" y2="12" stroke="#f8fafc" strokeWidth="1.3" />
                </>
              ) : codec.glyph === 'lysa' ? (
                <>
                  <circle
                    cx="12"
                    cy="12"
                    r="8"
                    fill="none"
                    stroke={codec.accentHex}
                    strokeWidth="1.4"
                    strokeDasharray="16 6"
                  />
                  <polygon
                    points="12,6 17,12 12,18 7,12"
                    fill={codec.accentHex}
                    fillOpacity="0.28"
                    stroke={codec.accentHex}
                    strokeWidth="1.2"
                  />
                  <circle cx="12" cy="12" r="1.8" fill="#f8fafc" />
                </>
              ) : codec.glyph === 'sera' ? (
                <>
                  <circle
                    cx="12"
                    cy="12"
                    r="8"
                    fill="none"
                    stroke={codec.accentHex}
                    strokeWidth="1.5"
                  />
                  <polygon points="12,6 17,15 12,13 7,15" fill={codec.accentHex} />
                </>
              ) : (
                <>
                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    fill="none"
                    stroke={codec.accentHex}
                    strokeWidth="1.4"
                  />
                  <line x1="6" y1="6" x2="18" y2="18" stroke={codec.accentHex} strokeWidth="1.2" />
                  <line x1="18" y1="6" x2="6" y2="18" stroke={codec.accentHex} strokeWidth="1.2" />
                </>
              )}
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span
                data-testid="live-comms-classification"
                className={`text-[8px] sm:text-[9px] font-mono-tabular font-bold tracking-wider truncate ${
                  hud.comms.active.classification === 'LIVE WARDEN DIRECTIVE'
                    ? 'text-red-300'
                    : hud.comms.active.classification === 'RECONSTRUCTED TRACE'
                      ? 'text-amber-300'
                      : hud.comms.active.classification === 'LIVE NEURAL TRACE'
                        ? 'text-emerald-300'
                        : 'text-cyan-300'
                }`}
              >
                {localComms.localizedClassification}
              </span>
              <button
                type="button"
                tabIndex={-1}
                data-testid="btn-dismiss-comms"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onDismissComms?.();
                }}
                className="px-1.5 py-0.5 text-[8px] font-mono-tabular text-slate-300 hover:text-white bg-[#0e1624] border border-white/10 cursor-pointer whitespace-nowrap shrink-0"
              >
                {t(locale, 'commsAck')}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 mt-0.5">
              <span className="text-[8px] sm:text-[9px] font-mono-tabular text-slate-300 tracking-wide truncate">
                {formattedSpeaker} · {formattedFrequency}
              </span>
              <svg
                viewBox="0 0 28 10"
                className="w-6 h-2 shrink-0"
                aria-hidden="true"
                data-testid="live-comms-waveform"
              >
                {codec.bars.map((amp, idx) => {
                  const h = Math.max(2, Number((amp * 10).toFixed(1)));
                  return (
                    <rect
                      key={idx}
                      x={idx * 4}
                      y={10 - h}
                      width="2.5"
                      height={h}
                      fill={codec.accentHex}
                      fillOpacity={0.85}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        <div
          data-testid="live-comms-headline"
          className="text-[10px] font-mono-tabular font-bold tracking-wider text-slate-100 mb-0.5 truncate"
        >
          {localComms.headline}
        </div>
        <p
          data-testid="live-comms-body"
          className="text-[10px] text-slate-200 leading-snug mb-1 line-clamp-2"
        >
          {localComms.body}
        </p>
        {localComms.tacticalHint && (
          <div
            data-testid="live-comms-hint"
            className="hidden sm:block text-[9px] font-mono-tabular text-amber-300 leading-snug mb-1 pt-1 border-t border-white/8 line-clamp-1"
          >
            {locale === 'vi' ? 'CHIẾN THUẬT:' : 'TACTICAL:'} {localComms.tacticalHint}
          </div>
        )}
        <div className="relative h-0.5 w-full bg-[#05080c] overflow-hidden">
          <div
            className="h-full w-full bg-cyan-400 origin-left transition-transform duration-75"
            style={{ transform: `scaleX(${progressRatio.toFixed(3)})` }}
          />
        </div>
      </div>
    );
  }
);
