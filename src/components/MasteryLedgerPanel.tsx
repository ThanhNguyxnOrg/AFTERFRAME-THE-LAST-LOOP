import React, { useMemo, useState } from 'react';
import {
  MASTERY_TARGETS,
  computeMasterySealModifiers,
  isSRankOrAbove,
} from '../game/combat-mastery.ts';
import { t } from '../game/i18n.ts';
import type {
  AppLocale,
  BossId,
  CampaignChapterId,
  CombatMasteryLedgerMap,
  EncounterCompositionId,
  MasteryBountyKind,
  MasteryTargetId,
} from '../game/types.ts';

export type MasteryFilterTab = 'all' | 'sector' | 'boss' | 'ready';

export interface MasteryLedgerPanelProps {
  variant: 'title' | 'modal';
  locale: AppLocale;
  combatMastery?: CombatMasteryLedgerMap;
  unlockedChapters?: readonly string[];
  onClaimMasteryBounty?: (targetId: MasteryTargetId, kind: MasteryBountyKind) => void;
  onClaimAllMasteryBounties?: () => void;
  onStartBoss?: (bossId: BossId) => void;
  onStartEchoZero?: () => void;
  onStartPracticeStandard?: (encounterId?: EncounterCompositionId) => void;
  onSelectCampaignChapter?: (chapter: CampaignChapterId) => void;
}

export const MasteryLedgerPanel: React.FC<MasteryLedgerPanelProps> = React.memo(
  function MasteryLedgerPanel({
    variant,
    locale,
    combatMastery,
    unlockedChapters = ['prologue'],
    onClaimMasteryBounty,
    onClaimAllMasteryBounties,
    onStartBoss,
    onStartEchoZero,
    onStartPracticeStandard,
    onSelectCampaignChapter,
  }) {
    const [activeFilter, setActiveFilter] = useState<MasteryFilterTab>('all');
    const prefix = variant;
    const masterySeal = useMemo(
      () => computeMasterySealModifiers(combatMastery),
      [combatMastery]
    );

    const filteredTargets = useMemo(() => {
      if (activeFilter === 'all') return MASTERY_TARGETS;
      if (activeFilter === 'sector') {
        return MASTERY_TARGETS.filter((item) => item.category === 'sector');
      }
      if (activeFilter === 'boss') {
        return MASTERY_TARGETS.filter((item) => item.category === 'boss');
      }
      return MASTERY_TARGETS.filter((item) => {
        const rec = combatMastery?.[item.id];
        if (!rec) return false;
        const sReady = isSRankOrAbove(rec.bestGrade) && !rec.sRankRewardClaimed;
        const hitlessReady = Boolean(rec.hitless && !rec.hitlessRewardClaimed);
        return sReady || hitlessReady;
      });
    }, [activeFilter, combatMastery]);

    const sealProgressRatio = useMemo(() => {
      if (masterySeal.nextTierMinSeals === null) return 1;
      const prevFloor =
        masterySeal.tier === 0
          ? 0
          : masterySeal.tier === 1
            ? 2
            : masterySeal.tier === 2
              ? 5
              : 9;
      const span = Math.max(1, masterySeal.nextTierMinSeals - prevFloor);
      return Math.max(0, Math.min(1, (masterySeal.claimedSealsCount - prevFloor) / span));
    }, [masterySeal]);

    const astralPulseDmg = masterySeal.tier * 18;

    return (
      <div
        data-testid={
          variant === 'title' ? 'title-mastery-ledger-panel' : 'modal-mastery-ledger-view'
        }
        className="space-y-2.5 font-mono-tabular"
      >
        {/* Sovereign Mastery Seal Status & Next-Seal Progress */}
        <div
          data-testid={`${prefix}-mastery-seal-banner`}
          data-seal-tier={masterySeal.tier}
          className="bg-[#07111d] border border-cyan-500/45 p-2.5 sm:p-3 space-y-1.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] font-bold tracking-wider text-cyan-300">
                {locale === 'vi' ? masterySeal.titleVi : masterySeal.titleEn}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-200 leading-snug">
                {masterySeal.tier > 0
                  ? locale === 'vi'
                    ? `+${Math.round((masterySeal.allDamageMult - 1) * 100)}% ST · +${masterySeal.bonusMaxWard} Giáp Chrono · +${Math.round((masterySeal.overdriveChargeMult - 1) * 100)}% Quá Tải · +${masterySeal.bonusSlipDurationSec.toFixed(2)}s Trượt Pha · Vương Miện Tinh Tú (${astralPulseDmg} ST)`
                    : `+${Math.round((masterySeal.allDamageMult - 1) * 100)}% DMG · +${masterySeal.bonusMaxWard} Ward · +${Math.round((masterySeal.overdriveChargeMult - 1) * 100)}% Overdrive · +${masterySeal.bonusSlipDurationSec.toFixed(2)}s Slip-Time · Astral Crown (${astralPulseDmg} DMG)`
                  : t(locale, 'masteryLedgerSub')}
              </div>
            </div>
            {masterySeal.pendingBountyCount > 0 && onClaimAllMasteryBounties && (
              <button
                type="button"
                data-testid={`${prefix}-mastery-claim-all`}
                onClick={(e) => {
                  e.currentTarget.blur();
                  onClaimAllMasteryBounties();
                }}
                className="px-2.5 py-1 text-[10px] font-bold uppercase bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-200 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
              >
                {t(locale, 'masteryClaimAll')} (+{masterySeal.pendingBountyCount}◆)
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
            <div>
              <span>
                S/S+: <strong className="text-cyan-300">{masterySeal.sRankUnlockedCount}/12</strong>
              </span>
              <span aria-hidden="true"> · </span>
              <span>
                {t(locale, 'masteryHitlessMedal')}:{' '}
                <strong className="text-emerald-300">{masterySeal.hitlessUnlockedCount}/12</strong>
              </span>
              <span aria-hidden="true"> · </span>
              <span>
                {locale === 'vi' ? 'Ấn đã nhận' : 'Claimed Seals'}:{' '}
                <strong className="text-amber-300">{masterySeal.claimedSealsCount}/24</strong>
              </span>
            </div>
            {masterySeal.nextTierMinSeals !== null ? (
              <span className="text-slate-300">
                {locale === 'vi'
                  ? `Ấn kế: ${masterySeal.claimedSealsCount}/${masterySeal.nextTierMinSeals}`
                  : `Next Seal: ${masterySeal.claimedSealsCount}/${masterySeal.nextTierMinSeals}`}
              </span>
            ) : (
              <span className="text-amber-300 font-bold">
                {locale === 'vi' ? 'ẤN TỐI THƯỢNG Ω ĐÃ MỞ' : 'OMEGA SEAL Ω ACTIVE'}
              </span>
            )}
          </div>

          <div
            data-testid={`${prefix}-mastery-seal-progress`}
            className="h-1 w-full bg-[#040811] border border-slate-800/90 overflow-hidden"
          >
            <div
              className="h-full w-full bg-cyan-400 origin-left transition-transform duration-150"
              style={{ transform: `scaleX(${sealProgressRatio.toFixed(3)})` }}
            />
          </div>
        </div>

        {/* Segmented Functional Filter Bar */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#080f1a] border border-slate-800/90">
          {(
            [
              { id: 'all', label: t(locale, 'masteryFilterAll') },
              { id: 'sector', label: t(locale, 'masteryFilterSectors') },
              { id: 'boss', label: t(locale, 'masteryFilterWardens') },
              {
                id: 'ready',
                label:
                  masterySeal.pendingBountyCount > 0
                    ? `${t(locale, 'masteryFilterReady')} (${masterySeal.pendingBountyCount})`
                    : t(locale, 'masteryFilterReady'),
              },
            ] as const
          ).map((tab) => {
            const selected = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                data-testid={`${prefix}-mastery-filter-${tab.id}`}
                aria-pressed={selected}
                onClick={(e) => {
                  e.currentTarget.blur();
                  setActiveFilter(tab.id);
                }}
                className={`px-2.5 py-1 text-[10px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  selected
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/70'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filtered Canonical Mastery Rows */}
        {filteredTargets.length === 0 ? (
          <div className="px-3 py-5 text-center text-[11px] text-slate-400 bg-[#0a121d] border border-slate-800/90">
            {locale === 'vi'
              ? 'Không còn phần thưởng S+ / Bất Thương nào đang chờ nhận. Hãy đạt Hạng S hoặc Không Trúng Đòn ở các khu vực và Thống Lĩnh để mở thêm Ấn!'
              : 'No unclaimed S-Rank or Hitless bounties right now. Earn S-Rank or Hitless clears across Sectors and Wardens to unlock more Seals.'}
          </div>
        ) : (
          <div
            className={
              variant === 'modal'
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[330px] overflow-y-auto pr-0.5'
                : 'space-y-1.5 max-h-[360px] overflow-y-auto pr-0.5'
            }
          >
            {filteredTargets.map((target) => {
              const rec = combatMastery?.[target.id];
              const hasSRank = isSRankOrAbove(rec?.bestGrade);
              const sClaimReady = Boolean(hasSRank && rec && !rec.sRankRewardClaimed);
              const hitlessClaimReady = Boolean(rec?.hitless && !rec.hitlessRewardClaimed);
              const canRematch =
                variant === 'title' &&
                (target.category === 'boss' ||
                  target.chapter === 'prologue' ||
                  unlockedChapters.includes(target.chapter));

              const handleRematch = () => {
                if (target.category === 'boss' && target.bossId) {
                  if (target.bossId === 'echo-zero' && onStartEchoZero) {
                    onStartEchoZero();
                  } else {
                    onStartBoss?.(target.bossId);
                  }
                } else if (target.chapter === 'prologue' && onStartPracticeStandard) {
                  onStartPracticeStandard('prologue_calibration_bay');
                } else if (unlockedChapters.includes(target.chapter)) {
                  onSelectCampaignChapter?.(target.chapter);
                }
              };

              return (
                <div
                  key={target.id}
                  data-testid={`${prefix}-mastery-row-${target.id}`}
                  data-best-grade={rec?.bestGrade ?? 'NONE'}
                  className="px-3 py-2 bg-[#0b1320] border border-slate-800 flex flex-col justify-between gap-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] sm:text-xs font-display font-bold text-slate-100 truncate">
                        {locale === 'vi' ? target.titleVi : target.titleEn}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-400 truncate">
                        {target.code}
                        {variant === 'title'
                          ? ` · ${locale === 'vi' ? target.subtitleVi : target.subtitleEn}`
                          : ''}
                        {rec && rec.bestTimeSec > 0 ? ` · ${rec.bestTimeSec.toFixed(1)}s` : ''}
                        {variant === 'modal' && rec && rec.clears > 0
                          ? ` · ${rec.clears} ${locale === 'vi' ? 'lần' : 'clears'}`
                          : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                      <span
                        className={
                          rec?.bestGrade === 'S+'
                            ? 'text-cyan-300 font-extrabold'
                            : rec?.bestGrade === 'S'
                              ? 'text-amber-300 font-bold'
                              : rec?.bestGrade
                                ? 'text-slate-200 font-bold'
                                : 'text-slate-500'
                        }
                      >
                        {rec?.bestGrade ?? '—'}
                      </span>
                      {variant === 'title' && rec?.hitless && (
                        <span className="text-[10px] text-emerald-300 font-semibold">
                          · {t(locale, 'masteryHitlessMedal')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex flex-wrap items-center gap-1.5 text-[9px] sm:text-[10px]">
                      {sClaimReady ? (
                        <button
                          type="button"
                          data-testid={`${prefix}-mastery-claim-s-${target.id}`}
                          onClick={() => onClaimMasteryBounty?.(target.id, 's_rank')}
                          className="px-2 py-0.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold cursor-pointer whitespace-nowrap"
                        >
                          S · {t(locale, 'masteryClaimBounty')}
                        </button>
                      ) : (
                        <span
                          className={rec?.sRankRewardClaimed ? 'text-cyan-300' : 'text-slate-500'}
                        >
                          S: {rec?.sRankRewardClaimed ? t(locale, 'masteryClaimedTag') : '+1◆'}
                        </span>
                      )}
                      <span aria-hidden="true" className="text-slate-600">
                        ·
                      </span>
                      {hitlessClaimReady ? (
                        <button
                          type="button"
                          data-testid={`${prefix}-mastery-claim-hitless-${target.id}`}
                          onClick={() => onClaimMasteryBounty?.(target.id, 'hitless')}
                          className="px-2 py-0.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold cursor-pointer whitespace-nowrap"
                        >
                          {t(locale, 'masteryHitlessMedal')} · {t(locale, 'masteryClaimBounty')}
                        </button>
                      ) : (
                        <span
                          className={rec?.hitlessRewardClaimed ? 'text-emerald-300' : 'text-slate-500'}
                        >
                          {t(locale, 'masteryHitlessMedal')}:{' '}
                          {rec?.hitlessRewardClaimed ? t(locale, 'masteryClaimedTag') : '+1◆'}
                        </span>
                      )}
                    </div>

                    {variant === 'title' && (
                      <button
                        type="button"
                        disabled={!canRematch}
                        data-testid={`title-mastery-rematch-${target.id}`}
                        onClick={(e) => {
                          e.currentTarget.blur();
                          handleRematch();
                        }}
                        className={`px-2.5 py-0.5 text-[10px] font-bold uppercase border transition-colors whitespace-nowrap shrink-0 ${
                          canRematch
                            ? 'bg-[#121e31] hover:bg-[#1a2c47] border-cyan-500/60 text-cyan-200 cursor-pointer'
                            : 'bg-[#080d15] border-slate-800 text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        {t(locale, 'masteryRematchBtn')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);
