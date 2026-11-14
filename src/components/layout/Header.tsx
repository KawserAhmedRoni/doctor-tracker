import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  KeyRound,
  LogOut,
  Menu,
  Moon,
  Search,
  ShieldAlert,
  Stethoscope,
  Sun,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import {
  AdminUser,
  AppView,
  Doctor,
  NotificationItem,
  Patient,
} from '../../types/healthcare';
import { Avatar } from '../ui/Avatar';

interface BreadcrumbSegment {
  label: string;
  onClick?: () => void;
}

interface HeaderProps {
  breadcrumbs: BreadcrumbSegment[];
  onOpenMobileMenu: () => void;
  doctors: Doctor[];
  patients: Patient[];
  onSelectDoctor: (doctorId: string) => void;
  onSelectPatient: (patientId: string) => void;
  notifications: NotificationItem[];
  onMarkAllNotificationsRead: () => void;
  onClickNotification: (item: NotificationItem) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  user: AdminUser;
  onLogout: () => void;
  onPreviewSystemScreen?: (view: AppView) => void;
}

export const Header: React.FC<HeaderProps> = ({
  breadcrumbs,
  onOpenMobileMenu,
  doctors,
  patients,
  onSelectDoctor,
  onSelectPatient,
  notifications,
  onMarkAllNotificationsRead,
  onClickNotification,
  darkMode,
  onToggleDarkMode,
  user,
  onLogout,
  onPreviewSystemScreen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const q = searchQuery.trim().toLowerCase();
  const matchedDoctors = q
    ? doctors
        .filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.specialization.toLowerCase().includes(q) ||
            d.hospital.toLowerCase().includes(q)
        )
        .slice(0, 4)
    : [];
  const matchedPatients = q
    ? patients
        .filter(
          (p) =>
            p.fullName.toLowerCase().includes(q) ||
            p.condition.toLowerCase().includes(q) ||
            p.phone.toLowerCase().includes(q)
        )
        .slice(0, 4)
    : [];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile toggle + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer shrink-0"
        >
          <Menu className="h-4 w-4" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.label + idx}>
                {idx > 0 && (
                  <ChevronRight
                    className="h-3.5 w-3.5 text-slate-400 shrink-0"
                    aria-hidden="true"
                  />
                )}
                {crumb.onClick && !isLast ? (
                  <button
                    type="button"
                    onClick={crumb.onClick}
                    className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 truncate cursor-pointer"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span
                    className={`truncate ${
                      isLast
                        ? 'font-semibold text-slate-900 dark:text-slate-100'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Global Search + Notifications + Theme + Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Search */}
        <div ref={searchRef} className="relative hidden lg:block w-72">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              placeholder="Search doctors or patients..."
              aria-label="Global search for doctors and patients"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {searchOpen && q.length > 0 && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900 overflow-hidden z-40">
              {matchedDoctors.length === 0 && matchedPatients.length === 0 ? (
                <div className="px-4 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  No matching doctors or patients found for "{searchQuery}".
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {matchedDoctors.length > 0 && (
                    <div className="p-2">
                      <p className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        Doctors
                      </p>
                      {matchedDoctors.map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            onSelectDoctor(doc.id);
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {doc.name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {doc.specialization} · {doc.hospital}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {matchedPatients.length > 0 && (
                    <div className="p-2">
                      <p className="px-2 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        Patients
                      </p>
                      {matchedPatients.map((pat) => (
                        <button
                          key={pat.id}
                          type="button"
                          onClick={() => {
                            onSelectPatient(pat.id);
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          <Users className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {pat.fullName}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {pat.condition} · {pat.phone}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Switch */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            aria-label={`Notifications (${unreadCount} unread)`}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-semibold text-white tabular-nums">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900 overflow-hidden z-40">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllNotificationsRead}
                    className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 cursor-pointer"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onClickNotification(item);
                      setNotifOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer ${
                      !item.read ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </p>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            aria-expanded={profileOpen}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white pl-1.5 pr-2.5 py-1 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Avatar name={user.name} src={user.avatarUrl} size="xs" />
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Admin
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900 overflow-hidden z-40 py-1.5">
              <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
