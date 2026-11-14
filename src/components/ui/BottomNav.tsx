import React from 'react';
import { LayoutDashboard, Stethoscope, Users } from 'lucide-react';
import { AppView } from '../../types/healthcare';

interface BottomNavProps {
  currentView: AppView;
  onNavigate: (view: 'dashboard' | 'doctors' | 'patients') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const tabs: Array<{
    id: 'dashboard' | 'doctors' | 'patients';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    activeMatches: AppView[];
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      activeMatches: ['dashboard'],
    },
    {
      id: 'doctors',
      label: 'Doctors',
      icon: Stethoscope,
      activeMatches: ['doctors', 'doctor-details'],
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: Users,
      activeMatches: ['patients', 'patient-details'],
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="grid grid-cols-3 max-w-md mx-auto gap-1">
        {tabs.map((tab) => {
          const isActive = tab.activeMatches.includes(currentView);
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-teal-600 dark:text-teal-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`flex items-center justify-center h-8 w-12 rounded-full transition-all ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-950/80 scale-105'
                    : 'bg-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

