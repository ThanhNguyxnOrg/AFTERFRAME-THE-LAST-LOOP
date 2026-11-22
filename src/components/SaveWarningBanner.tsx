/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface SaveWarningBannerProps {
  retryFailed: boolean;
  onRetry: () => void;
}

export function SaveWarningBanner({ retryFailed, onRetry }: SaveWarningBannerProps) {
  return (
    <div
      role="alert"
      data-testid="save-warning-banner"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-auto w-[min(92vw,560px)] flex items-center gap-3 bg-[#1a0f08]/95 border border-amber-400/70 px-3.5 py-2.5 text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.25)]"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-mono-tabular font-bold uppercase tracking-wider text-amber-300">
          Progress not saved
        </p>
        <p className="text-[12px] leading-snug">
          Browser storage is full or blocked. Your progress is kept for this session only and
          will be lost if you close or reload the page.
        </p>
        {retryFailed && (
          <p data-testid="save-warning-retry-failed" className="text-[11px] text-amber-300/90 mt-0.5">
            Still unable to save. Free up site storage or allow site data, then retry.
          </p>
        )}
      </div>
      <button
        type="button"
        data-testid="save-warning-retry"
        onClick={onRetry}
        className="shrink-0 px-3 py-1.5 bg-amber-400 text-slate-950 text-[11px] font-mono-tabular font-bold uppercase tracking-wider hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
      >
        Retry save
      </button>
    </div>
  );
}
