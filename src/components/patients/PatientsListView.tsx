import React, { useMemo, useState } from 'react';
import {
  Calendar,
  Edit3,
  Eye,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { PATIENT_CONDITIONS } from '../../data/mockData';
import { DataViewMode, Doctor, Patient } from '../../types/healthcare';
import { formatDisplayDate } from '../../utils/formatters';
import { Avatar } from '../ui/Avatar';
import { ConditionLabel } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Pagination } from '../ui/Pagination';
import { CustomSelect } from '../ui/CustomSelect';
import { EmptyState, ErrorState, TableSkeleton } from '../ui/StateViews';

interface PatientsListViewProps {
  patients: Patient[];
  doctors: Doctor[];
  onAddPatient: () => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void;
  onSelectPatient: (patientId: string) => void;
  onSelectDoctor: (doctorId: string) => void;
}

type PatientSort = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'condition';

export const PatientsListView: React.FC<PatientsListViewProps> = ({
  patients,
  doctors,
  onAddPatient,
  onEditPatient,
  onDeletePatient,
  onSelectPatient,
  onSelectDoctor,
}) => {
  const [search, setSearch] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<PatientSort>('newest');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const doctorMap = useMemo(() => {
    const map = new Map<string, Doctor>();
    doctors.forEach((d) => map.set(d.id, d));
    return map;
  }, [doctors]);

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patients
      .filter((p) => {
        if (q) {
          const docName = p.assignedDoctorId
            ? doctorMap.get(p.assignedDoctorId)?.name.toLowerCase() ?? ''
            : '';
          const match =
            p.fullName.toLowerCase().includes(q) ||
            p.phone.toLowerCase().includes(q) ||
            (p.email?.toLowerCase().includes(q) ?? false) ||
            p.condition.toLowerCase().includes(q) ||
            docName.includes(q);
          if (!match) return false;
        }
        if (conditionFilter !== 'all' && p.condition !== conditionFilter) {
          return false;
        }
        if (doctorFilter !== 'all') {
          if (doctorFilter === 'unassigned') {
            if (p.assignedDoctorId !== null) return false;
          } else if (p.assignedDoctorId !== doctorFilter) {
            return false;
          }
        }
        if (dateFrom && p.registrationDate < dateFrom) return false;
        if (dateTo && p.registrationDate > dateTo) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.registrationDate.localeCompare(a.registrationDate);
        if (sortBy === 'oldest') return a.registrationDate.localeCompare(b.registrationDate);
        if (sortBy === 'name-asc') return a.fullName.localeCompare(b.fullName);
        if (sortBy === 'name-desc') return b.fullName.localeCompare(a.fullName);
        return a.condition.localeCompare(b.condition);
      });
  }, [patients, search, conditionFilter, doctorFilter, dateFrom, dateTo, sortBy, doctorMap]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedPatients = filteredPatients.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const hasActiveFilters =
    Boolean(search.trim()) ||
    conditionFilter !== 'all' ||
    doctorFilter !== 'all' ||
    Boolean(dateFrom) ||
    Boolean(dateTo);

  const clearAllFilters = () => {
    setSearch('');
    setConditionFilter('all');
    setDoctorFilter('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Patients
            </h1>
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 tabular-nums">
              {patients.length} total
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage patient records, track primary conditions, and oversee physician assignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            onClick={onAddPatient}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Patient
          </Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-3">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search patient, phone, doctor..."
              aria-label="Search patients"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                aria-label="Clear patient search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Condition Filter */}
          <div className="lg:col-span-2">
            <CustomSelect
              value={conditionFilter}
              onChange={(val) => {
                setConditionFilter(val);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Conditions' },
                ...PATIENT_CONDITIONS.map((cond) => ({ value: cond, label: cond })),
              ]}
            />
          </div>

          {/* Assigned Doctor Filter */}
          <div className="lg:col-span-3">
            <CustomSelect
              value={doctorFilter}
              onChange={(val) => {
                setDoctorFilter(val);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Assigned Doctors' },
                { value: 'unassigned', label: 'Unassigned Patients' },
                ...doctors.map((doc) => ({ value: doc.id, label: doc.name })),
              ]}
            />
          </div>

          {/* Date-wise Range */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-1.5">
            <div className="relative">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                aria-label="Registered from date"
                title="Registered from date"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>
            <div className="relative">
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                aria-label="Registered to date"
                title="Registered to date"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="lg:col-span-2">
            <CustomSelect
              value={sortBy}
              onChange={(val) => setSortBy(val as PatientSort)}
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'name-asc', label: 'Name (A–Z)' },
                { value: 'name-desc', label: 'Name (Z–A)' },
                { value: 'condition', label: 'By Condition' },
              ]}
            />
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Active filters:</span>
            {search.trim() && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <span>Query: "{search.trim()}"</span>
                <X className="h-3 w-3" />
              </button>
            )}
            {conditionFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setConditionFilter('all')}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <span>Condition: {conditionFilter}</span>
                <X className="h-3 w-3" />
              </button>
            )}
            {doctorFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setDoctorFilter('all')}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <span>
                  Doctor:{' '}
                  {doctorFilter === 'unassigned'
                    ? 'Unassigned'
                    : doctorMap.get(doctorFilter)?.name ?? doctorFilter}
                </span>
                <X className="h-3 w-3" />
              </button>
            )}
            {(dateFrom || dateTo) && (
              <button
                type="button"
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <Calendar className="h-3 w-3" />
                <span>
                  {dateFrom ? formatDisplayDate(dateFrom) : 'Start'} –{' '}
                  {dateTo ? formatDisplayDate(dateTo) : 'Present'}
                </span>
                <X className="h-3 w-3" />
              </button>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 cursor-pointer ml-1"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {patients.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No patients registered"
            description="Register your first patient and assign them to an attending physician."
            actionLabel="Add Patient"
            onAction={onAddPatient}
          />
        ) : filteredPatients.length === 0 ? (
          <EmptyState
            title="No matching patients found"
            description="Try broadening your search query, condition filter, or registration date window."
            actionLabel="Clear All Filters"
            onAction={clearAllFilters}
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Contact Information</th>
                    <th className="py-3 px-4">Assigned Doctor</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4">Registration Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {paginatedPatients.map((patient) => {
                    const assignedDoc = patient.assignedDoctorId
                      ? doctorMap.get(patient.assignedDoctorId)
                      : undefined;
                    const menuOpen = openMenuId === patient.id;
                    return (
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
                              <p className="font-semibold text-slate-900 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-400 transition-colors">
                                {patient.fullName}
                              </p>
                              <p className="text-xs font-mono text-slate-400 dark:text-slate-500">
                                {patient.id.toUpperCase()}
                              </p>
                            </div>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-xs space-y-0.5">
                          <p className="text-slate-700 dark:text-slate-300 tabular-nums">
                            {patient.phone}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400">
                            {patient.email ?? 'No email on file'}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          {assignedDoc ? (
                            <button
                              type="button"
                              onClick={() => onSelectDoctor(assignedDoc.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:underline dark:text-teal-400 cursor-pointer"
                            >
                              <Stethoscope className="h-3.5 w-3.5 shrink-0" />
                              <span>{assignedDoc.name}</span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <ConditionLabel condition={patient.condition} />
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
                          {formatDisplayDate(patient.registrationDate)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="relative inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onSelectPatient(patient.id)}
                              title="View patient details"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId(menuOpen ? null : patient.id)
                              }
                              aria-label={`Actions for ${patient.fullName}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 cursor-pointer"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>

                            {menuOpen && (
                              <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900 text-left">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    onSelectPatient(patient.id);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5 text-slate-400" />
                                  <span>View Details</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    onEditPatient(patient);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                  <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                                  <span>Edit Patient</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    onDeletePatient(patient);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Delete Patient</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedPatients.map((patient) => {
                const assignedDoc = patient.assignedDoctorId
                  ? doctorMap.get(patient.assignedDoctorId)
                  : undefined;
                return (
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
                          <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{patient.phone}</span>
                          </p>
                        </div>
                      </button>
                      <ConditionLabel condition={patient.condition} />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span className="truncate">
                        Doctor:{' '}
                        {assignedDoc ? (
                          <button
                            type="button"
                            onClick={() => onSelectDoctor(assignedDoc.id)}
                            className="font-medium text-teal-600 dark:text-teal-400 cursor-pointer"
                          >
                            {assignedDoc.name}
                          </button>
                        ) : (
                          'Unassigned'
                        )}
                      </span>
                      <span className="tabular-nums shrink-0 text-slate-400">
                        {formatDisplayDate(patient.registrationDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelectPatient(patient.id)}
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditPatient(patient)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeletePatient(patient)}
                        className="text-rose-600 hover:bg-rose-50 dark:text-rose-400"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              currentPage={safePage}
              totalItems={filteredPatients.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="patients"
            />
          </>
        )}
      </div>
    </div>
  );
};
