import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Calendar,
  RefreshCw,
  Stethoscope,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DateRangePreset, Doctor, Patient } from '../../types/healthcare';
import { formatDisplayDate, isWithinDays } from '../../utils/formatters';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { ConditionLabel, SpecializationLabel } from '../ui/Badge';

interface DashboardViewProps {
  doctors: Doctor[];
  patients: Patient[];
  darkMode: boolean;
  onAddDoctor: () => void;
  onAddPatient: () => void;
  onNavigateDoctors: () => void;
  onNavigatePatients: () => void;
  onSelectDoctor: (doctorId: string) => void;
  onSelectPatient: (patientId: string) => void;
}

const CHART_PALETTE = [
  '#0D9488', // Teal 600
  '#0284C7', // Sky 600
  '#4F46E5', // Indigo 600
  '#D97706', // Amber 600
  '#059669', // Emerald 600
  '#64748B', // Slate 500
];

const RANGE_OPTIONS: Array<{ id: DateRangePreset; label: string; days: number | null }> = [
  { id: '7d', label: 'Last 7 days', days: 7 },
  { id: '30d', label: 'Last 30 days', days: 30 },
  { id: '90d', label: 'Last 90 days', days: 90 },
  { id: 'all', label: 'All time', days: null },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  doctors,
  patients,
  darkMode,
  onAddDoctor,
  onAddPatient,
  onNavigateDoctors,
  onNavigatePatients,
  onSelectDoctor,
  onSelectPatient,
}) => {
  const [dateRange, setDateRange] = useState<DateRangePreset>('90d');
  const [trendGranularity, setTrendGranularity] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [refreshing, setRefreshing] = useState(false);

  const activeRangeDays =
    RANGE_OPTIONS.find((opt) => opt.id === dateRange)?.days ?? null;

  const filteredPatients = useMemo(
    () => patients.filter((p) => isWithinDays(p.registrationDate, activeRangeDays)),
    [patients, activeRangeDays]
  );

  const recentRegistrationsCount = useMemo(
    () => patients.filter((p) => isWithinDays(p.registrationDate, 14)).length,
    [patients]
  );

  const avgPatientsPerDoctor = useMemo(() => {
    if (doctors.length === 0) return '0.0';
    return (patients.length / doctors.length).toFixed(1);
  }, [doctors.length, patients.length]);

  // A. Patients Per Doctor Bar Chart Data
  const patientsPerDoctorData = useMemo(() => {
    return doctors
      .map((doc) => {
        const count = filteredPatients.filter(
          (p) => p.assignedDoctorId === doc.id
        ).length;
        const shortName = doc.name.replace(/^Dr\.\s+/, 'Dr. ').split(' ');
        const displayName =
          shortName.length >= 2 ? `Dr. ${shortName[shortName.length - 1]}` : doc.name;
        return {
          id: doc.id,
          name: displayName,
          fullName: doc.name,
          specialization: doc.specialization,
          hospital: doc.hospital,
          patients: count,
        };
      })
      .sort((a, b) => b.patients - a.patients)
      .slice(0, 8);
  }, [doctors, filteredPatients]);

  // B. Patient Registration Trends (Daily / Weekly / Monthly)
  const registrationTrendData = useMemo(() => {
    if (trendGranularity === 'daily') {
      const days = ['Nov 07', 'Nov 08', 'Nov 09', 'Nov 10', 'Nov 11', 'Nov 12', 'Nov 13'];
      const isoDates = [
        '2026-11-07',
        '2026-11-08',
        '2026-11-09',
        '2026-11-10',
        '2026-11-11',
        '2026-11-12',
        '2026-11-13',
      ];
      return isoDates.map((iso, idx) => ({
        period: days[idx],
        registrations: patients.filter((p) => p.registrationDate === iso).length,
      }));
    }

    if (trendGranularity === 'weekly') {
      const weeks = [
        { label: 'Sep 21', start: '2026-09-21', end: '2026-09-27' },
        { label: 'Sep 28', start: '2026-09-28', end: '2026-10-04' },
        { label: 'Oct 05', start: '2026-10-05', end: '2026-10-11' },
        { label: 'Oct 12', start: '2026-10-12', end: '2026-10-18' },
        { label: 'Oct 19', start: '2026-10-19', end: '2026-10-25' },
        { label: 'Oct 26', start: '2026-10-26', end: '2026-11-01' },
        { label: 'Nov 02', start: '2026-11-02', end: '2026-11-08' },
        { label: 'Nov 09', start: '2026-11-09', end: '2026-11-15' },
      ];
      return weeks.map((w) => ({
        period: w.label,
        registrations: patients.filter(
          (p) => p.registrationDate >= w.start && p.registrationDate <= w.end
        ).length,
      }));
    }

    const months = [
      { label: 'Aug 2026', prefix: '2026-08' },
      { label: 'Sep 2026', prefix: '2026-09' },
      { label: 'Oct 2026', prefix: '2026-10' },
      { label: 'Nov 2026', prefix: '2026-11' },
    ];
    return months.map((m) => ({
      period: m.label,
      registrations: patients.filter((p) => p.registrationDate.startsWith(m.prefix)).length,
    }));
  }, [patients, trendGranularity]);

  // C. Doctor Specialization Distribution
  const specializationData = useMemo(() => {
    const counts = new Map<string, number>();
    doctors.forEach((d) => {
      counts.set(d.specialization, (counts.get(d.specialization) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, value], index) => ({
        name,
        value,
        percentage: doctors.length ? Math.round((value / doctors.length) * 100) : 0,
        color: CHART_PALETTE[index % CHART_PALETTE.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [doctors]);

  // D. Patient Condition Distribution
  const conditionData = useMemo(() => {
    const counts = new Map<string, number>();
    filteredPatients.forEach((p) => {
      counts.set(p.condition, (counts.get(p.condition) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, count], idx) => ({
        name,
        count,
        color: CHART_PALETTE[idx % CHART_PALETTE.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredPatients]);

  // E. Recent Activity
  const recentPatients = useMemo(
    () =>
      [...patients]
        .sort((a, b) => b.registrationDate.localeCompare(a.registrationDate))
        .slice(0, 4),
    [patients]
  );

  const recentDoctors = useMemo(
    () =>
      [...doctors]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 3),
    [doctors]
  );

  // F. Top Doctors
  const topDoctors = useMemo(() => {
    return doctors
      .map((doc) => ({
        ...doc,
        patientCount: patients.filter((p) => p.assignedDoctorId === doc.id).length,
      }))
      .sort((a, b) => b.patientCount - a.patientCount)
      .slice(0, 5);
  }, [doctors, patients]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 450);
  };

  const gridStroke = darkMode ? '#1E293B' : '#E2E8F0';
  const axisTickColor = darkMode ? '#94A3B8' : '#64748B';
  const tooltipStyle = {
    backgroundColor: darkMode ? '#0F172A' : '#FFFFFF',
    borderColor: darkMode ? '#334155' : '#E2E8F0',
    borderRadius: '8px',
    fontSize: '12px',
    color: darkMode ? '#F1F5F9' : '#0F172A',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-teal-700 dark:text-teal-400">
            Welcome back, Morgan Reed · Administrator Workspace
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Clinical Operations Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor active physicians, patient registrations, clinical workloads, and care assignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 h-9 dark:border-slate-700 dark:bg-slate-900">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangePreset)}
              aria-label="Dashboard date range"
              className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {RANGE_OPTIONS.map((opt) => (
                <option
                  key={opt.id}
                  value={opt.id}
                  className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onAddPatient}
            leftIcon={<UserPlus className="h-3.5 w-3.5" />}
          >
            Add Patient
          </Button>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Doctors
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <Stethoscope className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {doctors.length}
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
              +2 this month
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Across {new Set(doctors.map((d) => d.hospital)).size} clinical facilities
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Patients
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
              <Users className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {patients.length}
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
              +14% vs prior period
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {filteredPatients.length} registered in selected window
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Avg. Patients per Doctor
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Activity className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {avgPatientsPerDoctor}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Balanced roster
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Target capacity 2.0–4.5 patients/doc
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Recent Registrations
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="font-display text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {recentRegistrationsCount}
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Last 14 days
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Demo preview figures · Synced locally
          </p>
        </div>
      </div>

      {/* Primary Charts Row: Patients per Doctor & Patient Registration Trends */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* A. Patients Per Doctor Bar Chart */}
        <section className="xl:col-span-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                Patients per Doctor
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active patient distribution across leading physicians
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateDoctors}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 cursor-pointer whitespace-nowrap shrink-0"
            >
              View Doctors
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={patientsPerDoctorData}
                margin={{ top: 8, right: 12, left: -16, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  axisLine={{ stroke: gridStroke }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: darkMode ? 'rgba(30,41,59,0.5)' : 'rgba(241,245,249,0.7)' }}
                  formatter={(value) => [`${value ?? 0} patients`, 'Assigned']}
                  labelFormatter={(_, payload) => {
                    const row = payload?.[0]?.payload;
                    return row
                      ? `${row.fullName} · ${row.specialization}`
                      : '';
                  }}
                />
                <Bar dataKey="patients" fill="#0D9488" radius={[6, 6, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* B. Patient Registration Trends Area Chart */}
        <section className="xl:col-span-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                Patient Registration Trends
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                New patient intakes by {trendGranularity} period
              </p>
            </div>

            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800 self-start sm:self-auto">
              {(['daily', 'weekly', 'monthly'] as const).map((granularity) => (
                <button
                  key={granularity}
                  type="button"
                  onClick={() => setTrendGranularity(granularity)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer whitespace-nowrap ${
                    trendGranularity === granularity
                      ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-slate-100'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {granularity}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={registrationTrendData}
                margin={{ top: 8, right: 12, left: -16, bottom: 8 }}
              >
                <defs>
                  <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis
                  dataKey="period"
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  axisLine={{ stroke: gridStroke }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${value ?? 0} registrations`, 'New Patients']}
                />
                <Area
                  type="monotone"
                  dataKey="registrations"
                  stroke="#0284C7"
                  strokeWidth={2}
                  fill="url(#regGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Secondary Charts Row: Specialization Donut & Patient Condition Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* C. Doctor Specialization Distribution */}
        <section className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Doctor Specialization Distribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Share of active physicians by medical specialty
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={specializationData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={2}
                  >
                    {specializationData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => [
                      `${value ?? 0} doctors`,
                      String(name ?? ''),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5">
              {specializationData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-xs shrink-0"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <span className="text-slate-700 dark:text-slate-300 truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-mono text-slate-900 dark:text-slate-100 tabular-nums shrink-0">
                    {item.value} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* D. Patient Condition Distribution */}
        <section className="xl:col-span-7 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                Patient Condition Distribution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Breakdown of active patient cases by primary diagnosis
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigatePatients}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 cursor-pointer whitespace-nowrap shrink-0"
            >
              View Patients
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={conditionData}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 24, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  axisLine={{ stroke: gridStroke }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={118}
                  tick={{ fill: axisTickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${value ?? 0} patients`, 'Cases']}
                />
                <Bar dataKey="count" radius={[0, 5, 5, 0]} barSize={16}>
                  {conditionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Operational Lists Row: Recent Activity, Top Doctors & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* E. Recent Registrations */}
        <section className="lg:col-span-5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Recent Registrations
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Latest updates
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentPatients.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => onSelectPatient(patient.id)}
                className="w-full px-5 py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={patient.fullName} size="sm" tone="sky" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {patient.fullName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Patient · {formatDisplayDate(patient.registrationDate)}
                    </p>
                  </div>
                </div>
                <ConditionLabel condition={patient.condition} />
              </button>
            ))}

            {recentDoctors.slice(0, 2).map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelectDoctor(doc.id)}
                className="w-full px-5 py-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={doc.name} src={doc.avatarUrl} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Doctor Joined · {formatDisplayDate(doc.createdAt)}
                    </p>
                  </div>
                </div>
                <SpecializationLabel specialization={doc.specialization} />
              </button>
            ))}
          </div>
        </section>

        {/* F. Top Doctors */}
        <section className="lg:col-span-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Top Doctors
            </h2>
            <button
              type="button"
              onClick={onNavigateDoctors}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 cursor-pointer"
            >
              All Doctors
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topDoctors.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelectDoctor(doc.id)}
                className="w-full px-5 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={doc.name} src={doc.avatarUrl} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {doc.specialization} · {doc.hospital}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                    {doc.patientCount}
                  </p>
                  <p className="text-[11px] text-slate-400">patients</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* G. Quick Actions */}
        <section className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Quick Actions
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Direct shortcuts for daily administrative workflows.
            </p>

            <div className="mt-4 space-y-2.5">
              <Button
                variant="primary"
                className="w-full justify-start"
                onClick={onAddDoctor}
                leftIcon={<Stethoscope className="h-4 w-4" />}
              >
                Add New Doctor
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={onAddPatient}
                leftIcon={<UserPlus className="h-4 w-4" />}
              >
                Add New Patient
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={onNavigateDoctors}
                leftIcon={<Stethoscope className="h-4 w-4" />}
              >
                View All Doctors
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={onNavigatePatients}
                leftIcon={<Users className="h-4 w-4" />}
              >
                View All Patients
              </Button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            Select any doctor or patient row to inspect detailed clinical assignments.
          </div>
        </section>
      </div>
    </div>
  );
};
