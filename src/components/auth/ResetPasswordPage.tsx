import React, { useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, Lock } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ResetPasswordPageProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onBackToLogin: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  darkMode,
  onToggleDarkMode,
  onBackToLogin,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const requirements = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'Includes uppercase and lowercase letters', met: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) },
    { label: 'Includes at least one number', met: /\d/.test(newPassword) },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!requirements.every((r) => r.met)) {
      nextErrors.newPassword = 'Password must meet all security requirements below.';
    }
    if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCompleted(true);
    }, 650);
  };

  return (
    <AuthLayout
      darkMode={darkMode}
      onToggleDarkMode={onToggleDarkMode}
      title="Create a new password"
      subtitle="Choose a strong password for your Doctor Tracker administrator account."
    >
      {completed ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/70 dark:bg-emerald-950/50">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Password updated
              </p>
              <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
                Your administrator password has been reset. You can now sign in with your new credentials.
              </p>
            </div>
          </div>

          <Button variant="primary" size="lg" onClick={onBackToLogin} className="w-full">
            Return to Sign In
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={errors.newPassword}
            requiredMark
            leftIcon={<Lock className="h-4 w-4" />}
          />

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1.5 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Password requirements
            </p>
            {requirements.map((req) => (
              <div
                key={req.label}
                className={`flex items-center gap-2 text-xs ${
                  req.met
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Check
                  className={`h-3.5 w-3.5 shrink-0 ${
                    req.met ? 'opacity-100' : 'opacity-30'
                  }`}
                />
                <span>{req.label}</span>
              </div>
            ))}
          </div>

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            requiredMark
            leftIcon={<Lock className="h-4 w-4" />}
          />

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            {loading ? 'Updating password...' : 'Reset Password'}
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
