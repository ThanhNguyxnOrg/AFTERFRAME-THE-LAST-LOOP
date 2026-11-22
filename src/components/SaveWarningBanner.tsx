/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { CampaignSaveStatus } from '../game/save-status.ts';

interface SaveWarningBannerProps {
  status: Exclude<CampaignSaveStatus, 'ok'>;
  retryFailed: boolean;
  onRetry: () => void;
  onOverwrite: () => void;
  onReload: () => void;
}

const BUTTON_CLASS =
  'w-full px-2 py-1 text-[10px] font-mono-tabular font-bold uppercase tracking-wider focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200';

export function SaveWarningBanner({
  status,
  retryFailed,
  onRetry,
  onOverwrite,
  onReload,
}: SaveWarningBannerProps) {
  const click = (action: () => void) => (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    action();
  };
  return (
    <div
      role="alert"
      data-testid="save-warning-banner"
      data-save-status={status}
      className="pointer-events-auto w-[184px] sm:w-[214px] bg-[#140c06]/90 border border-amber-400/70 px-2.5 py-2 text-amber-100 shadow-[0_8px_22px_rgba(0,0,0,0.55)]"
    >
      <p className="text-[10px] font-mono-tabular font-bold uppercase tracking-wider text-amber-300">
        Progress not saved
      </p>
      {status === 'unread-save' ? (
        <p className="text-[10px] leading-snug mt-0.5">
          An earlier save could not be loaded when the game started, so this session is not being
          saved over it. Reload to continue from that save, or overwrite it with this session.
        </p>
      ) : (
        <p className="text-[10px] leading-snug mt-0.5">
          Browser storage is full or blocked. Progress is kept for this session only.
        </p>
      )}
      {retryFailed && (
        <p data-testid="save-warning-retry-failed" className="text-[10px] leading-snug text-amber-300/90 mt-0.5">
          Still unable to save. Free up storage or allow site data, then retry.
        </p>
      )}
      {status === 'unread-save' ? (
        <div className="mt-1.5 flex flex-col gap-1">
          <button
            type="button"
            data-testid="save-warning-reload"
            onClick={click(onReload)}
            className={`${BUTTON_CLASS} bg-amber-400 text-slate-950 hover:bg-amber-300`}
          >
            Reload earlier save
          </button>
          <button
            type="button"
            data-testid="save-warning-overwrite"
            onClick={click(onOverwrite)}
            className={`${BUTTON_CLASS} border border-amber-400/70 text-amber-200 hover:bg-amber-400/15`}
          >
            Overwrite with this session
          </button>
        </div>
      ) : (
        <button
          type="button"
          data-testid="save-warning-retry"
          onClick={click(onRetry)}
          className={`mt-1.5 ${BUTTON_CLASS} bg-amber-400 text-slate-950 hover:bg-amber-300`}
        >
          Retry save
        </button>
      )}
    </div>
  );
}
