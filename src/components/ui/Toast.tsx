import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { ToastItem, ToastVariant } from '../../types/healthcare';

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const TOAST_STYLES: Record<
  ToastVariant,
  { border: string; glow: string; bg: string; icon: React.ReactNode }
> = {
  success: {
    border: 'border-teal-500/30 dark:border-teal-500/40',
    glow: 'shadow-[0_8px_30px_rgb(20,184,166,0.15)]',
    bg: 'bg-white/95 dark:bg-slate-900/95',
    icon: (
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 shrink-0">
        <CheckCircle2 className="h-4.5 w-4.5" />
      </div>
    ),
  },
  error: {
    border: 'border-rose-500/30 dark:border-rose-500/40',
    glow: 'shadow-[0_8px_30px_rgb(244,63,94,0.15)]',
    bg: 'bg-white/95 dark:bg-slate-900/95',
    icon: (
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 shrink-0">
        <XCircle className="h-4.5 w-4.5" />
      </div>
    ),
  },
  warning: {
    border: 'border-amber-500/30 dark:border-amber-500/40',
    glow: 'shadow-[0_8px_30px_rgb(245,158,11,0.15)]',
    bg: 'bg-white/95 dark:bg-slate-900/95',
    icon: (
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 shrink-0">
        <AlertTriangle className="h-4.5 w-4.5" />
      </div>
    ),
  },
  info: {
    border: 'border-sky-500/30 dark:border-sky-500/40',
    glow: 'shadow-[0_8px_30px_rgb(14,165,233,0.15)]',
    bg: 'bg-white/95 dark:bg-slate-900/95',
    icon: (
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 shrink-0">
        <Info className="h-4.5 w-4.5" />
      </div>
    ),
  },
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 right-4 z-[70] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.variant];
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border ${style.border} ${style.bg} ${style.glow} backdrop-blur-md p-4 shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-3 fade-in`}
          >
            {style.icon}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug tracking-tight">
                {toast.title}
              </p>
              {toast.description && (
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer shrink-0 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
