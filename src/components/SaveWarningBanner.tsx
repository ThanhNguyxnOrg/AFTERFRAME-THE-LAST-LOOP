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
      className="pointer-events-auto w-[184px] sm:w-[214px] bg-[#140c06]/90 border border-amber-400/70 px-2.5 py-2 text-amber-100 shadow-[0_8px_22px_rgba(0,0,0,0.55)]"
    >
      <p className="text-[10px] font-mono-tabular font-bold uppercase tracking-wider text-amber-300">
        Progress not saved
      </p>
      <p className="text-[10px] leading-snug mt-0.5">
        Browser storage is full or blocked. Progress is kept for this session only.
      </p>
      {retryFailed && (
        <p data-testid="save-warning-retry-failed" className="text-[10px] leading-snug text-amber-300/90 mt-0.5">
          Still unable to save. Free up storage or allow site data, then retry.
        </p>
      )}
      <button
        type="button"
        tabIndex={-1}
        data-testid="save-warning-retry"
        onClick={(e) => {
          e.currentTarget.blur();
          onRetry();
        }}
        className="mt-1.5 w-full px-2 py-1 bg-amber-400 text-slate-950 text-[10px] font-mono-tabular font-bold uppercase tracking-wider hover:bg-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
      >
        Retry save
      </button>
    </div>
  );
}
