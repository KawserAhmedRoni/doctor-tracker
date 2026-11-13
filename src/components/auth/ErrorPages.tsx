import React from 'react';
import { ArrowLeft, FileQuestion, ShieldAlert } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Button } from '../ui/Button';

interface SystemPageProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onGoDashboard: () => void;
  onGoLogin: () => void;
}

export const UnauthorizedPage: React.FC<SystemPageProps> = ({
  darkMode,
  onToggleDarkMode,
  onGoDashboard,
  onGoLogin,
}) => {
  return (
    <AuthLayout
      darkMode={darkMode}
      onToggleDarkMode={onToggleDarkMode}
      title="Access Denied"
      subtitle="Error 403 · Insufficient administrator privileges"
    >
      <div className="text-center space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800/70 dark:bg-rose-950/50 dark:text-rose-400">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Your current session does not have authorization to access this administrative module. Contact your system supervisor if you require elevated clinical permissions.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Button
            variant="primary"
            onClick={onGoDashboard}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Return to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={onGoLogin}
            className="w-full sm:w-auto"
          >
            Sign In as Admin
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export const NotFoundPage: React.FC<SystemPageProps> = ({
  darkMode,
  onToggleDarkMode,
  onGoDashboard,
  onGoLogin,
}) => {
  return (
    <AuthLayout
      darkMode={darkMode}
      onToggleDarkMode={onToggleDarkMode}
      title="Page Not Found"
      subtitle="Error 404 · The requested record or route could not be located"
    >
      <div className="text-center space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <FileQuestion className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The clinical workspace view or record URL you entered may have been moved, archived, or mistyped.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Button
            variant="primary"
            onClick={onGoDashboard}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            className="w-full sm:w-auto"
          >
            Back to Dashboard
          </Button>
          <Button
            variant="outline"
            onClick={onGoLogin}
            className="w-full sm:w-auto"
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};
