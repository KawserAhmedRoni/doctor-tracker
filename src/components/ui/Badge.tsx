import React from 'react';
import {
  Activity,
  AlertCircle,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Thermometer,
} from 'lucide-react';
import { PatientCondition, Specialization } from '../../types/healthcare';

interface ConditionBadgeProps {
  condition: PatientCondition;
}

const CONDITION_STYLES: Record<
  PatientCondition,
  { className: string; icon: React.ReactNode }
> = {
  Hypertension: {
    className:
      'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    icon: <HeartPulse className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  },
  Arrhythmia: {
    className:
      'bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
    icon: <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  },
  'Type 2 Diabetes': {
    className:
      'bg-sky-50 text-sky-800 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
    icon: <Activity className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  },
  Migraine: {
    className:
      'bg-indigo-50 text-indigo-800 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
    icon: <Activity className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  },
  Asthma: {
    className:
      'bg-cyan-50 text-cyan-800 border-cyan-200/80 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60',
    icon: <Thermometer className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  },
  Osteoarthritis: {
    className:
      'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    icon: <Stethoscope className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  },
  Dermatitis: {
    className:
      'bg-teal-50 text-teal-800 border-teal-200/80 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60',
    icon: <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  },
  'Post-Op Recovery': {
    className:
      'bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    icon: <Activity className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  },
  'Pediatric Wellness': {
    className:
      'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    icon: <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />,
  },
};

export const ConditionLabel: React.FC<ConditionBadgeProps> = ({ condition }) => {
  const style = CONDITION_STYLES[condition] ?? CONDITION_STYLES.Osteoarthritis;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium whitespace-nowrap shrink-0 ${style.className}`}
    >
      {style.icon}
      <span>{condition}</span>
    </span>
  );
};

export const SpecializationLabel: React.FC<{ specialization: Specialization }> = ({
  specialization,
}) => {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 text-xs font-medium whitespace-nowrap shrink-0">
      <Stethoscope className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" aria-hidden="true" />
      <span>{specialization}</span>
    </span>
  );
};
