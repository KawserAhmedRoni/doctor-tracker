import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Lock, Mail } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { isValidEmail } from '../../utils/formatters';

interface AuthenticatedUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface LoginPageProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSuccessLogin: (user: AuthenticatedUserData) => void;
  onNavigateForgotPassword: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  darkMode,
  onToggleDarkMode,
  onSuccessLogin,
  onNavigateForgotPassword,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const nextErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!isValidEmail(email)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || 'Invalid email or password.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccessLogin(data.user);
      }, 500);
    } catch (err: any) {
      setAuthError('Connection error. Please check your network and try again.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      darkMode={darkMode}
      onToggleDarkMode={onToggleDarkMode}
      title="Sign in to Doctor Tracker"
      subtitle="Access physician rosters, patient assignments, and clinical analytics."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {authError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-800/70 dark:bg-rose-950/50 dark:text-rose-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <span>{authError}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-800/70 dark:bg-emerald-950/50 dark:text-emerald-300"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <span>Credentials verified. Redirecting to workspace...</span>
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. admin@doctortracker.health"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          requiredMark
          leftIcon={<Mail className="h-4 w-4" />}
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          requiredMark
          leftIcon={<Lock className="h-4 w-4" />}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between gap-3 pt-0.5">
          <label className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-800"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={onNavigateForgotPassword}
            className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </AuthLayout>
  );
};
