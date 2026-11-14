import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'results',
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalItems);

  const pageNumbers: number[] = [];
  for (let i = 1; i <= totalPages; i += 1) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between w-full sm:w-auto gap-3 text-xs text-slate-600 dark:text-slate-400">
        <span className="tabular-nums">
          Showing <strong className="font-semibold text-slate-900 dark:text-slate-100">{start}</strong>–
          <strong className="font-semibold text-slate-900 dark:text-slate-100">{end}</strong> of{' '}
          <strong className="font-semibold text-slate-900 dark:text-slate-100">{totalItems}</strong> {itemLabel}
        </span>

        <label className="inline-flex items-center gap-1.5 ml-auto sm:ml-0">
          <span className="whitespace-nowrap text-[11px] sm:text-xs">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
            aria-label="Rows per page"
            className="h-7.5 rounded-md border border-slate-200 bg-white px-1.5 text-xs font-medium text-slate-800 tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            {[5, 8, 10, 20].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center justify-center w-full sm:w-auto gap-1">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="Previous page"
          className="inline-flex items-center justify-center gap-1 h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap shrink-0"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex items-center gap-1 max-w-[200px] overflow-x-auto py-0.5">
          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={page === safePage ? 'page' : undefined}
              className={`h-8 min-w-8 px-2 rounded-md text-xs font-medium tabular-nums transition-colors cursor-pointer shrink-0 ${
                page === safePage
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          aria-label="Next page"
          className="inline-flex items-center justify-center gap-1 h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap shrink-0"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
