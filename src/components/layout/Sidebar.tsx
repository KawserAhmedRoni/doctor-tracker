import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { AdminUser, AppView } from '../../types/healthcare';
import { Avatar } from '../ui/Avatar';

interface SidebarProps {
  currentView: AppView;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onNavigate: (view: 'dashboard' | 'doctors' | 'patients') => void;
  onLogout: () => void;
  user: AdminUser;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onNavigate,
  onLogout,
  user,
}) => {
  const navItems: Array<{
    id: 'dashboard' | 'doctors' | 'patients';
    label: string;
    icon: React.ReactNode;
    activeMatches: AppView[];
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4 shrink-0" />,
      activeMatches: ['dashboard'],
    },
    {
      id: 'doctors',
      label: 'Doctors',
      icon: <Stethoscope className="h-4 w-4 shrink-0" />,
      activeMatches: ['doctors', 'doctor-details'],
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: <Users className="h-4 w-4 shrink-0" />,
      activeMatches: ['patients', 'patient-details'],
    },
  ];

  const renderSidebarContent = (isMobile: boolean) => {
    const isCollapsed = !isMobile && collapsed;
    return (
      <div className="flex h-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        {/* Brand Header */}
        <div
          className={`flex h-16 items-center border-b border-slate-200 dark:border-slate-800 px-4 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              onNavigate('dashboard');
              if (isMobile) onCloseMobile();
            }}
            className="flex items-center gap-2.5 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shrink-0">
              <Stethoscope className="h-4 w-4" aria-hidden="true" />
            </div>
            {!isCollapsed && (
              <span className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                Doctor Tracker
              </span>
            )}
          </button>

          {isMobile ? (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            !isCollapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                className="hidden md:inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Primary navigation">
          {!isCollapsed && (
            <p className="px-2.5 pb-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
              Administration
            </p>
          )}
          {navItems.map((item) => {
            const active = item.activeMatches.includes(currentView);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  if (isMobile) onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                aria-current={active ? 'page' : undefined}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isCollapsed ? 'justify-center px-2' : ''
                } ${
                  active
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                }`}
              >
                <span
                  className={
                    active
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }
                >
                  {item.icon}
                </span>
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}

          {isCollapsed && !isMobile && (
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Expand sidebar"
                title="Expand sidebar"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </nav>

        {/* User Profile & Logout Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-2">
          <div
            className={`flex items-center gap-2.5 rounded-lg p-2 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <Avatar name={user.name} src={user.avatarUrl} size="sm" />
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                  <UserRound className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">Admin</span>
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onLogout}
            title={isCollapsed ? 'Sign Out' : undefined}
            className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 transition-colors cursor-pointer whitespace-nowrap ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop / Tablet Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 ${
          collapsed ? 'w-[72px]' : 'w-[248px]'
        }`}
      >
        <div className="sticky top-0 h-screen">{renderSidebarContent(false)}</div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex md:hidden bg-slate-950/50 backdrop-blur-[2px]"
          onClick={onCloseMobile}
        >
          <aside
            className="w-[272px] max-w-[85vw] h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
