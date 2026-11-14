import React, { useState, useEffect, useCallback } from 'react';
import {
  User as UserIcon,
  Shield,
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { AdminUser } from '../../types/healthcare';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { isValidEmail } from '../../utils/formatters';

interface StoredUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'doctor';
  createdAt?: string;
}

interface ProfileViewProps {
  currentUser: AdminUser;
  onShowToast: (variant: 'success' | 'error' | 'info' | 'warning', title: string, desc?: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ currentUser, onShowToast }) => {
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'staff' | 'doctor'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Please enter full name.');
      return;
    }
    if (!email.trim() || !isValidEmail(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Failed to create user in database.');
        setSubmitting(false);
        return;
      }

      onShowToast(
        'success',
        'User Created Successfully',
        `User ${name} (${email}) has been saved to MongoDB. You can now log in with these credentials!`
      );

      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setRole('admin');
      fetchUsers();
    } catch (err: any) {
      setFormError('Network error while saving user to database.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Avatar name={currentUser.name} src={currentUser.avatarUrl} size="md" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                  {currentUser.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shrink-0">
                  <Shield className="h-3 w-3" />
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {currentUser.email}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto flex items-center justify-start sm:justify-end">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Connected to MongoDB Atlas
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Create New User Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="h-9 w-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Add New User / Admin
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Create a new user in MongoDB to access the system.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              {formError && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              <Input
                label="Full Name"
                placeholder="e.g. Dr. Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
                requiredMark
                leftIcon={<UserIcon className="h-4 w-4" />}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. sarah@doctortracker.health"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                requiredMark
                leftIcon={<Mail className="h-4 w-4" />}
              />

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Assigned Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="admin">Administrator (Full Access)</option>
                  <option value="staff">Clinical Staff</option>
                  <option value="doctor">Medical Specialist / Doctor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 py-2 text-xs sm:text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Will be securely hashed with bcrypt in MongoDB.
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                className="w-full mt-2"
                leftIcon={<UserPlus className="h-4 w-4" />}
              >
                {submitting ? 'Saving to Database...' : 'Save User to MongoDB'}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Existing Users in Database */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Database Users
                </h2>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {users.length}
                </span>
              </div>
              <button
                type="button"
                onClick={fetchUsers}
                className="text-xs text-teal-600 hover:underline dark:text-teal-400 cursor-pointer font-medium"
              >
                Refresh List
              </button>
            </div>

            {loadingUsers ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Loading users from MongoDB Atlas...
              </div>
            ) : users.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No users found in database.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => {
                  const isCurrent = u.email.toLowerCase() === currentUser.email.toLowerCase();
                  return (
                    <div
                      key={u._id}
                      className="py-3 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <Avatar name={u.name} size="sm" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              {u.name}
                            </p>
                            {isCurrent && (
                              <span className="text-[9px] sm:text-[10px] bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 font-bold px-1.5 py-0.2 rounded shrink-0">
                                YOU
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            u.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              : u.role === 'doctor'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                        {u.createdAt && (
                          <span className="text-[11px] text-slate-400 hidden sm:inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
