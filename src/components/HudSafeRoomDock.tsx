import React from 'react';
import { getExpeditionSectorSpec } from '../game/expedition-path.ts';
import { FIELD_FABRICATOR_ITEMS } from '../game/paradox-expansion.ts';
import type {
  AppLocale,
  FabricatorItemId,
  HudSnapshot,
  WeaponId,
} from '../game/types.ts';

/* -------------------------------------------------------------------------- */
/* Bespoke Multi-Layer Horological Inline <svg> HUD Icons                      */
/* Dark silhouette + brass/cyan interior detail + crisp state highlight       */
/* -------------------------------------------------------------------------- */

export const HudIconVitalCrest: React.FC<{ lowHp?: boolean }> = ({ lowHp }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
    <polygon
      points="12,1.5 22.5,12 12,22.5 1.5,12"
      fill="#050912"
      stroke={lowHp ? '#f87171' : '#fbbf24'}
      strokeWidth="1.4"
    />
    <polygon
      points="12,5.2 18.8,12 12,18.8 5.2,12"
      fill={lowHp ? 'rgba(239,68,68,0.28)' : 'rgba(34,211,238,0.22)'}
      stroke={lowHp ? '#fca5a5' : '#22d3ee'}
      strokeWidth="1.2"
    />
    <circle cx="12" cy="12" r="2.2" fill={lowHp ? '#fecaca' : '#fef08a'} />
  </svg>
);

export const HudIconArmory: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
    <polygon
      points="12,2 21,7 21,17 12,22 3,17 3,7"
      fill="#060c16"
      stroke="#f59e0b"
      strokeWidth="1.4"
    />
    <path
      d="M8.5 15.5L15.5 8.5M12.5 7.5L16.5 11.5M7.5 12.5L11.5 16.5"
      stroke="#e2e8f0"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="1.8" fill="#38bdf8" />
  </svg>
);

export const HudIconMap: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
    <circle cx="12" cy="12" r="9.5" fill="#050a13" stroke="#22d3ee" strokeWidth="1.4" />
    <circle cx="12" cy="12" r="5.2" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2.5 2" />
    <polygon points="12,5 14.3,12 12,10.5 9.7,12" fill="#67e8f9" />
    <polygon points="12,19 14.3,12 12,13.5 9.7,12" fill="#64748b" />
  </svg>
);

export const HudIconFocus: React.FC<{ active?: boolean }> = ({ active }) => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
    <path
      d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"
      fill="none"
      stroke={active ? '#fbbf24' : '#94a3b8'}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <circle
      cx="12"
      cy="12"
      r="3.4"
      fill={active ? 'rgba(251,191,36,0.32)' : '#060b14'}
      stroke={active ? '#fde68a' : '#38bdf8'}
      strokeWidth="1.4"
    />
  </svg>
);

export const HudIconPause: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
    <circle cx="12" cy="12" r="9.5" fill="#060b14" stroke="#64748b" strokeWidth="1.3" />
    <rect x="8.5" y="7.5" width="2.6" height="9" rx="0.6" fill="#e2e8f0" />
    <rect x="12.9" y="7.5" width="2.6" height="9" rx="0.6" fill="#e2e8f0" />
  </svg>
);

export const HudIconEchoGlyph: React.FC<{ state: string; hasClip: boolean }> = ({
  state,
  hasClip,
}) => {
  const accent =
    state === 'recording'
      ? '#fbbf24'
      : state === 'playback'
        ? '#67e8f9'
        : hasClip
          ? '#22d3ee'
          : '#64748b';
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2" fill="#050912" stroke={accent} strokeWidth="1.5" />
      <path d="M12 6.5v5.5l3.6 2.2" fill="none" stroke="#f8fafc" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.6" fill={accent} />
    </svg>
  );
};

export const HudIconWeaponGlyph: React.FC<{
  weaponId: WeaponId;
  overheated?: boolean;
}> = ({ weaponId, overheated }) => {
  const stroke = overheated
    ? '#f87171'
    : weaponId === 'grav_breaker'
      ? '#fbbf24'
      : weaponId === 'pulsecaster' || weaponId === 'phase_rail'
        ? '#38bdf8'
        : '#22d3ee';
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" aria-hidden="true">
      <polygon points="12,2.5 21.5,12 12,21.5 2.5,12" fill="#050912" stroke={stroke} strokeWidth="1.5" />
      {weaponId === 'pulsecaster' || weaponId === 'phase_rail' ? (
        <>
          <line x1="6.5" y1="12" x2="17.5" y2="12" stroke="#f8fafc" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="2.2" fill={stroke} />
        </>
      ) : (
        <polygon points="12,6 15.2,12 12,18 8.8,12" fill={stroke} />
      )}
    </svg>
  );
};

/* -------------------------------------------------------------------------- */
/* Bottom-Center Sanctuary Console Dock (Safe-Room Hub Intermission)          */
/* Zero top-center viewport occlusion; collapsible Field Fabricator drawer    */
/* -------------------------------------------------------------------------- */

interface HudSafeRoomDockProps {
  hud: HudSnapshot;
  locale: AppLocale;
  onSafeRoomMedBay?: () => void;
  onSafeRoomLysaBriefing?: () => void;
  onOpenArmory?: () => void;
  onEnterExpeditionAirlock?: () => void;
  onPurchaseFabricator?: (itemId: FabricatorItemId) => void;
  onEnterParadoxRift?: () => void;
}

export const HudSafeRoomDock: React.FC<HudSafeRoomDockProps> = React.memo(
  ({
    hud,
    locale,
    onSafeRoomMedBay,
    onSafeRoomLysaBriefing,
    onOpenArmory,
    onEnterExpeditionAirlock,
    onPurchaseFabricator,
    onEnterParadoxRift,
  }) => {
    const exp = hud.expedition;
    const safeRoom = exp?.safeRoom;
    const [fabOpen, setFabOpen] = React.useState(false);
    const [intelDismissed, setIntelDismissed] = React.useState(false);

    React.useEffect(() => {
      setFabOpen(false);
      setIntelDismissed(false);
    }, [exp?.sectorCode, safeRoom?.nextChapter]);

    React.useEffect(() => {
      if (safeRoom?.lysaBriefingClaimed) {
        setIntelDismissed(false);
      }
    }, [safeRoom?.lysaBriefingClaimed]);

    if (!exp?.enabled || exp.phase !== 'safe_room' || !safeRoom) {
      return null;
    }

    const nearby = safeRoom.nearbyStation;
    const nextSpec = exp.nextChapter ? getExpeditionSectorSpec(exp.nextChapter) : null;
    const fragments = hud.progression.memoryFragments;
    const showIntelCard = safeRoom.lysaBriefingClaimed && !intelDismissed;

    return (
      <div
        data-testid="hud-safe-room-dock"
        data-nearby-station={nearby}
        className="w-full max-w-[720px] flex flex-col items-center gap-1.5 pointer-events-auto"
      >
        {/* Collapsible Lysa Neural Briefing Strip (Opens cleanly above dock when claimed, dismissible) */}
        {safeRoom.lysaBriefingClaimed && (
          <div
            data-testid="hud-safe-room-lysa-intel"
            className={
              showIntelCard
                ? 'w-full bg-[#06101c]/94 border border-cyan-400/45 px-3 py-1.5 shadow-[0_10px_28px_rgba(0,0,0,0.72)] flex items-start justify-between gap-2 text-[10px] font-mono-tabular leading-snug text-slate-200'
                : 'sr-only'
            }
          >
            <div className="min-w-0">
              <span className="font-bold uppercase tracking-wider text-cyan-300 mr-1.5">
                {safeRoom.lysaIntelHeadline} ·
              </span>
              <span className="text-slate-200">{safeRoom.lysaIntelDetail}</span>
            </div>
            <button
              type="button"
              tabIndex={-1}
              aria-label={locale === 'vi' ? 'Đóng thông tin Lysa' : 'Dismiss Lysa briefing'}
              onClick={(e) => {
                e.currentTarget.blur();
                setIntelDismissed(true);
              }}
              className="shrink-0 px-1.5 py-0.5 text-[9px] font-mono-tabular uppercase text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Collapsible Field Fabricator Drawer (Mounted with sr-only when closed so tests & hotkeys stay live) */}
        {hud.paradox && (
          <div
            data-testid="hud-safe-room-fabricator"
            className={
              fabOpen
                ? 'w-full bg-[#070d18]/95 border border-amber-400/45 px-3 py-2 shadow-[0_12px_30px_rgba(0,0,0,0.78)] space-y-1.5'
                : 'sr-only'
            }
          >
            <div className="flex items-center justify-between gap-2 text-[9px] font-mono-tabular uppercase tracking-wider">
              <span className="text-amber-300 font-bold">
                {locale === 'vi' ? 'XƯỞNG CHẾ TÁC DÃ CHIẾN' : 'FIELD FABRICATOR'} · {fragments}◆
              </span>
              <button
                type="button"
                tabIndex={-1}
                aria-label={locale === 'vi' ? 'Thu gọn xưởng chế tác' : 'Close Field Fabricator'}
                onClick={(e) => {
                  e.currentTarget.blur();
                  setFabOpen(false);
                }}
                className="text-slate-400 hover:text-white px-1 cursor-pointer"
              >
                {locale === 'vi' ? 'ĐÓNG ▾' : 'CLOSE ▾'}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {FIELD_FABRICATOR_ITEMS.map((item) => {
                const loadout = hud.paradox!.loadout;
                const alreadyMaxed =
                  (item.id === 'nanite_pack' &&
                    loadout.naniteInjectors >= loadout.maxNaniteInjectors) ||
                  (item.id === 'aegis_shield' &&
                    loadout.aegisShieldHp >= loadout.maxAegisShieldHp) ||
                  (item.id === 'overclock_core' && loadout.overclockCoreActive) ||
                  (item.id === 'drone_mk1' && loadout.combatDroneTier >= 1) ||
                  (item.id === 'drone_mk2' && loadout.combatDroneTier >= 2);
                const disabled = alreadyMaxed || fragments < item.cost;
                return (
                  <button
                    key={item.id}
                    type="button"
                    tabIndex={-1}
                    data-testid={`hud-fab-${item.id}`}
                    disabled={disabled}
                    title={item.description}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      onPurchaseFabricator?.(item.id);
                    }}
                    className={`px-2 py-1 text-[9px] font-mono-tabular font-semibold uppercase border transition-colors whitespace-nowrap ${
                      alreadyMaxed
                        ? 'bg-emerald-950/45 border-emerald-500/50 text-emerald-300 cursor-default'
                        : !disabled
                          ? 'bg-[#0e1929] hover:bg-amber-500/20 border-amber-400/65 text-amber-100 cursor-pointer'
                          : 'bg-[#080c14] border-slate-800 text-slate-500 cursor-default'
                    }`}
                  >
                    {alreadyMaxed ? `${item.shortLabel} ✓` : `${item.shortLabel} · ${item.cost}◆`}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Primary Sleek 1-Row Horological Sanctuary Console Strip */}
        <div className="w-full bg-[#050a13]/92 border-t border-b border-x border-cyan-400/25 border-t-amber-300/55 px-2.5 py-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.78)] flex flex-wrap items-center justify-between gap-1.5 font-mono-tabular text-[9px]">
          <div className="flex flex-wrap items-center gap-1">
            {onSafeRoomMedBay && (
              <button
                type="button"
                tabIndex={-1}
                data-testid="hud-btn-safe-med"
                disabled={safeRoom.medBayUsed}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onSafeRoomMedBay();
                }}
                className={`h-7 px-2.5 flex items-center gap-1.5 border font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 ${
                  safeRoom.medBayUsed
                    ? 'bg-[#071412] border-emerald-800/50 text-emerald-400/75 cursor-default'
                    : nearby === 'med_bay'
                      ? 'bg-emerald-500/28 hover:bg-emerald-400/35 border-emerald-300 text-white cursor-pointer'
                      : 'bg-[#091518] hover:bg-emerald-500/20 border-emerald-400/60 text-emerald-200 cursor-pointer'
                }`}
              >
                <span>
                  {safeRoom.medBayUsed
                    ? locale === 'vi'
                      ? 'Y TẾ ✓'
                      : 'MED-BAY ✓'
                    : locale === 'vi'
                      ? 'Y TẾ [I]'
                      : 'MED-BAY [I]'}
                </span>
              </button>
            )}

            {onSafeRoomLysaBriefing && (
              <button
                type="button"
                tabIndex={-1}
                data-testid="hud-btn-safe-lysa"
                onClick={(e) => {
                  e.currentTarget.blur();
                  if (!safeRoom.lysaBriefingClaimed) {
                    onSafeRoomLysaBriefing();
                  } else {
                    setIntelDismissed((prev) => !prev);
                  }
                }}
                className={`h-7 px-2.5 flex items-center gap-1.5 border font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  safeRoom.lysaBriefingClaimed
                    ? 'bg-[#081522] hover:bg-[#0d2236] border-cyan-600/60 text-cyan-300'
                    : nearby === 'lysa_holo'
                      ? 'bg-cyan-500/28 hover:bg-cyan-400/35 border-cyan-300 text-white'
                      : 'bg-[#081320] hover:bg-cyan-500/20 border-cyan-400/60 text-cyan-200'
                }`}
              >
                <span>
                  {safeRoom.lysaBriefingClaimed
                    ? locale === 'vi'
                      ? 'LYSA ✓'
                      : 'LYSA INTEL ✓'
                    : locale === 'vi'
                      ? 'LYSA [I]'
                      : 'LYSA INTEL [I]'}
                </span>
              </button>
            )}

            {onOpenArmory && (
              <button
                type="button"
                tabIndex={-1}
                data-testid="hud-btn-safe-bench"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onOpenArmory();
                }}
                className={`h-7 px-2.5 flex items-center gap-1.5 border font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  nearby === 'workbench'
                    ? 'bg-amber-400/28 hover:bg-amber-400/38 border-amber-300 text-white'
                    : 'bg-[#12100a] hover:bg-amber-500/20 border-amber-400/65 text-amber-200'
                }`}
              >
                <span>{locale === 'vi' ? 'BÀN RÈN [U]' : 'WORKBENCH [U]'}</span>
              </button>
            )}

            {hud.paradox && (
              <button
                type="button"
                tabIndex={-1}
                data-testid="hud-btn-toggle-fabricator"
                aria-expanded={fabOpen}
                onClick={(e) => {
                  e.currentTarget.blur();
                  setFabOpen((prev) => !prev);
                }}
                className={`h-7 px-2.5 flex items-center gap-1 border font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  fabOpen
                    ? 'bg-amber-500/25 border-amber-300 text-amber-100'
                    : 'bg-[#0b111d] hover:bg-[#141f33] border-slate-600/80 text-slate-200'
                }`}
              >
                <span>
                  {locale === 'vi' ? 'CHẾ TÁC' : 'FABRICATOR'} · {fragments}◆ {fabOpen ? '▾' : '▴'}
                </span>
              </button>
            )}

            {hud.paradox &&
              (onEnterParadoxRift && hud.paradox.paradoxRiftUnlocked ? (
                <button
                  type="button"
                  tabIndex={-1}
                  data-testid="hud-btn-paradox-rift"
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onEnterParadoxRift();
                  }}
                  title="Enter Secret Boss Arena — ECHO-ZERO"
                  className="h-7 px-2.5 flex items-center gap-1 bg-[#180c24] hover:bg-fuchsia-500/28 border border-fuchsia-400/75 text-fuchsia-200 font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{locale === 'vi' ? 'KHE NGHỊCH LÝ' : 'PARADOX RIFT'}</span>
                </button>
              ) : (
                <span data-testid="hud-paradox-rift-locked" className="sr-only">
                  PARADOX RIFT LOCKED
                </span>
              ))}
          </div>

          {onEnterExpeditionAirlock && (
            <button
              type="button"
              tabIndex={-1}
              data-testid="hud-btn-enter-airlock"
              onClick={(e) => {
                e.currentTarget.blur();
                onEnterExpeditionAirlock();
              }}
              className="h-7 px-3 flex items-center gap-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display font-bold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>
                {locale === 'vi'
                  ? `KHỞI HÀNH KHU ${nextSpec?.code ?? '02'} →`
                  : `DEPART SEC ${nextSpec?.code ?? '02'} →`}
              </span>
            </button>
          )}
        </div>
      </div>
    );
  }
);
