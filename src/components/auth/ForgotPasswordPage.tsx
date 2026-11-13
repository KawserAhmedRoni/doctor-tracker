import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { isValidEmail } from '../../utils/formatters';

interface ForgotPasswordPageProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onBackToLogin: () => void;
  onOpenResetPassword: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  darkMode,
  onToggleDarkMode,
  onBackToLogin,
  onOpenResetPassword,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your administrator email address.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError(undefined);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 600);
  };

  return (
    <AuthLayout
      darkMode={darkMode}
      onToggleDarkMode={onToggleDarkMode}
      title="Reset your password"
      subtitle="Enter your registered administrator email to receive a password reset link."
    >
      {sent ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/70 dark:bg-emerald-950/50">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Reset link sent
              </p>
              <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
                If an administrator account exists for <strong className="font-semibold">{email}</strong>, instructions to reset your password have been dispatched.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <Button variant="primary" size="lg" onClick={onOpenResetPassword} className="w-full">
              Continue to Reset Password
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onBackToLogin}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              className="w-full"
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Administrator Email"
            type="email"
            placeholder="admin@doctortracker.health"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            requiredMark
            leftIcon={<Mail className="h-4 w-4" />}
          />

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            {loading ? 'Sending reset link...' : 'Send Reset Link'}
          </Button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 py-1.5 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Sign In</span>
          </button>
        </form>
      )}
    </AuthLayout>
  );
};
