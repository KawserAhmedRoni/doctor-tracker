import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit3,
  Eye,
  Mail,
  Phone,
  Search,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { PATIENT_CONDITIONS } from '../../data/mockData';
import { DataViewMode, Doctor, Patient } from '../../types/healthcare';
import { formatDisplayDate, isWithinDays } from '../../utils/formatters';
import { Avatar } from '../ui/Avatar';
import { ConditionLabel, SpecializationLabel } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState, ErrorState, TableSkeleton } from '../ui/StateViews';

interface DoctorDetailsViewProps {
  doctor: Doctor;
  patients: Patient[];
  onBack: () => void;
  onEditDoctor: (doctor: Doctor) => void;
  onDeleteDoctor: (doctor: Doctor) => void;
  onAddPatientUnderDoctor: (doctorId: string) => void;
  onSelectPatient: (patientId: string) => void;
  onRemovePatientFromDoctor: (patient: Patient, doctor: Doctor) => void;
}

export const DoctorDetailsView: React.FC<DoctorDetailsViewProps> = ({
  doctor,
  patients,
  onBack,
  onEditDoctor,
  onDeleteDoctor,
  onAddPatientUnderDoctor,
  onSelectPatient,
  onRemovePatientFromDoctor,
}) => {
  const [search, setSearch] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');

  const assignedPatients = useMemo(
    () => patients.filter((p) => p.assignedDoctorId === doctor.id),
    [patients, doctor.id]
  );

  const recentCount = useMemo(
    () => assignedPatients.filter((p) => isWithinDays(p.registrationDate, 30)).length,
    [assignedPatients]
  );

  const topCondition = useMemo(() => {
    if (assignedPatients.length === 0) return 'No active cases';
    const counts = new Map<string, number>();
    assignedPatients.forEach((p) => {
      counts.set(p.condition, (counts.get(p.condition) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
  }, [assignedPatients]);

  const filteredAssigned = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assignedPatients.filter((p) => {
      if (q) {
        const match =
          p.fullName.toLowerCase().includes(q) ||
          p.phone.toLowerCase().includes(q) ||
          (p.email?.toLowerCase().includes(q) ?? false) ||
          p.condition.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (conditionFilter !== 'all' && p.condition !== conditionFilter) {
        return false;
      }
      return true;
    });
  }, [assignedPatients, search, conditionFilter]);

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Doctors</span>
        </button>
      </div>

      {/* Doctor Profile Header Card */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Avatar name={doctor.name} src={doctor.avatarUrl} size="xl" />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {doctor.name}
                </h1>
                <SpecializationLabel specialization={doctor.specialization} />
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  {doctor.hospital}
                </span>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {doctor.phone}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {doctor.email}
                </span>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Joined {formatDisplayDate(doctor.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              onClick={() => onEditDoctor(doctor)}
              leftIcon={<Edit3 className="h-4 w-4" />}
            >
              Edit Profile
            </Button>
            <Button
              variant="outline"
              onClick={() => onDeleteDoctor(doctor)}
              leftIcon={<Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />}
              className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              Delete
            </Button>
            <Button
              variant="primary"
              onClick={() => onAddPatientUnderDoctor(doctor.id)}
              leftIcon={<UserPlus className="h-4 w-4" />}
            >
              Add Patient
            </Button>
          </div>
        </div>
      </section>

      {/* Doctor Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Assigned Patients
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {assignedPatients.length}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Active clinical roster
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Recent Registrations (30d)
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
            {recentCount}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Newly assigned in last 30 days
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Primary Condition Focus
          </p>
          <p className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
            {topCondition}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Most frequent diagnosis in roster
          </p>
        </div>
      </div>

      {/* Patients Under This Doctor */}
      <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Patients Under {doctor.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {assignedPatients.length} patient{assignedPatients.length === 1 ? '' : 's'} currently assigned
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search doctor's patients..."
                aria-label="Search patients under this doctor"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-7 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              aria-label="Filter by patient condition"
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="all">All Conditions</option>
              {PATIENT_CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <Button
              size="sm"
              variant="primary"
              onClick={() => onAddPatientUnderDoctor(doctor.id)}
              leftIcon={<UserPlus className="h-3.5 w-3.5" />}
            >
              Add Patient
            </Button>
          </div>
        </div>

        {assignedPatients.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No patients assigned yet"
            description={`${doctor.name} does not currently have any patients in their care roster.`}
            actionLabel="Assign First Patient"
            onAction={() => onAddPatientUnderDoctor(doctor.id)}
          />
        ) : filteredAssigned.length === 0 ? (
          <EmptyState
            title="No matching patients in this roster"
            description="Adjust your search term or condition filter to see assigned patients."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearch('');
              setConditionFilter('all');
            }}
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Contact Information</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4">Registration Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filteredAssigned.map((patient) => (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => onSelectPatient(patient.id)}
                          className="flex items-center gap-3 text-left group cursor-pointer"
                        >
                          <Avatar name={patient.fullName} size="sm" tone="sky" />
                          <div>
                            <p className="font-semibold text-slate-900 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-400">
                              {patient.fullName}
                            </p>
                            <p className="text-xs font-mono text-slate-400">
                              {patient.id.toUpperCase()}
                            </p>
                          </div>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-xs space-y-0.5">
                        <p className="text-slate-700 dark:text-slate-300 tabular-nums">
                          {patient.phone}
                        </p>
                        {patient.email && (
                          <p className="text-slate-500 dark:text-slate-400">
                            {patient.email}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <ConditionLabel condition={patient.condition} />
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400 tabular-nums">
                        {formatDisplayDate(patient.registrationDate)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSelectPatient(patient.id)}
                            leftIcon={<Eye className="h-3.5 w-3.5" />}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onRemovePatientFromDoctor(patient, doctor)}
                            leftIcon={<UserMinus className="h-3.5 w-3.5" />}
                            className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-800">
              {filteredAssigned.map((patient) => (
                <div key={patient.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onSelectPatient(patient.id)}
                      className="flex items-center gap-3 text-left min-w-0 cursor-pointer"
                    >
                      <Avatar name={patient.fullName} size="md" tone="sky" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {patient.fullName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                          {patient.phone}
                        </p>
                      </div>
                    </button>
                    <ConditionLabel condition={patient.condition} />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400 tabular-nums">
                      Registered {formatDisplayDate(patient.registrationDate)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelectPatient(patient.id)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemovePatientFromDoctor(patient, doctor)}
                        className="text-rose-600 hover:bg-rose-50 dark:text-rose-400"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};
