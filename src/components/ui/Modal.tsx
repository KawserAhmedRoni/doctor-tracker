import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'modal' | 'drawer';
  children: React.ReactNode;
}

const MODAL_WIDTHS: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  description,
  size = 'md',
  variant = 'modal',
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  if (variant === 'drawer') {
    return (
      <div
        className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-[2px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative h-full w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
        >
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
            <div className="min-w-0">
              <h2
                id="modal-title"
                className="text-lg font-semibold text-slate-900 dark:text-slate-100"
              >
                {title}
              </h2>
              {description && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[2px] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${MODAL_WIDTHS[size]} my-auto rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden`}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="min-w-0">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[calc(100vh-12rem)] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
