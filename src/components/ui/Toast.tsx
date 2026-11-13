import React from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { ToastItem, ToastVariant } from '../../types/healthcare';

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const TOAST_STYLES: Record<
  ToastVariant,
  { container: string; icon: React.ReactNode }
> = {
  success: {
    container:
      'border-emerald-200 bg-white text-slate-900 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-100',
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
  },
  error: {
    container:
      'border-rose-200 bg-white text-slate-900 dark:border-rose-800/70 dark:bg-slate-900 dark:text-slate-100',
    icon: <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />,
  },
  warning: {
    container:
      'border-amber-200 bg-white text-slate-900 dark:border-amber-800/70 dark:bg-slate-900 dark:text-slate-100',
    icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />,
  },
  info: {
    container:
      'border-sky-200 bg-white text-slate-900 dark:border-sky-800/70 dark:bg-slate-900 dark:text-slate-100',
    icon: <Info className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />,
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
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.variant];
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg transition-all ${style.container}`}
          >
            {style.icon}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-snug">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
