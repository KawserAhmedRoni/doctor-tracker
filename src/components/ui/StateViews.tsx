import React from 'react';
import { AlertCircle, RefreshCw, SearchX } from 'lucide-react';
import { Button } from './Button';

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 6,
  columns = 6,
}) => {
  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-800 animate-pulse" aria-busy="true" aria-label="Loading records">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex items-center gap-4 px-4 py-3.5">
          <div className="h-9 w-9 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 items-center">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <div
                key={colIdx}
                className={`h-3.5 rounded bg-slate-200 dark:bg-slate-800 ${
                  colIdx === 0 ? 'w-3/4' : colIdx === columns - 1 ? 'w-1/2 ml-auto' : 'w-4/5'
                }`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-14">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400">
        {icon ?? <SearchX className="h-6 w-6" aria-hidden="true" />}
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {(actionLabel || secondaryLabel) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {actionLabel && onAction && (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryLabel && onSecondaryAction && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to load records',
  description = 'We encountered a network or server interruption while retrieving healthcare data. Please retry or check your connection.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-14" role="alert">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-400">
        <AlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-1.5 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {onRetry && (
        <div className="mt-5">
          <Button
            variant="outline"
            onClick={onRetry}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Retry Request
          </Button>
        </div>
      )}
    </div>
  );
};
