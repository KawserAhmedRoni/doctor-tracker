import React from 'react';
import { Moon, Stethoscope, Sun } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  darkMode,
  onToggleDarkMode,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090E1A] text-slate-900 dark:text-slate-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white shrink-0">
            <Stethoscope className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight whitespace-nowrap shrink-0">
            Doctor Tracker
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleDarkMode}
          aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white cursor-pointer"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-[440px] space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
              {title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {children}
          </div>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            Authorized Healthcare Administrator Access Only
          </p>
        </div>
      </main>
    </div>
  );
};
