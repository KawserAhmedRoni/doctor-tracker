import React, { useMemo, useState } from 'react';
import {
  Building2,
  Calendar,
  Edit3,
  Eye,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  X,
} from 'lucide-react';
import { HOSPITALS, SPECIALIZATIONS } from '../../data/mockData';
import { DataViewMode, Doctor, Patient } from '../../types/healthcare';
import { formatDisplayDate } from '../../utils/formatters';
import { Avatar } from '../ui/Avatar';
import { SpecializationLabel } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Pagination } from '../ui/Pagination';
import { EmptyState, ErrorState, TableSkeleton } from '../ui/StateViews';

interface DoctorsListViewProps {
  doctors: Doctor[];
  patients: Patient[];
  onAddDoctor: () => void;
  onEditDoctor: (doctor: Doctor) => void;
  onDeleteDoctor: (doctor: Doctor) => void;
  onSelectDoctor: (doctorId: string) => void;
}

type SortOption = 'name-asc' | 'name-desc' | 'patients-desc' | 'newest' | 'oldest';

export const DoctorsListView: React.FC<DoctorsListViewProps> = ({
  doctors,
  patients,
  onAddDoctor,
  onEditDoctor,
  onDeleteDoctor,
  onSelectDoctor,
}) => {
  const [search, setSearch] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState<string>('all');
  const [hospitalFilter, setHospitalFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('patients-desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [viewMode, setViewMode] = useState<DataViewMode>('default');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const patientCountMap = useMemo(() => {
    const map = new Map<string, number>();
    patients.forEach((p) => {
      if (p.assignedDoctorId) {
        map.set(p.assignedDoctorId, (map.get(p.assignedDoctorId) ?? 0) + 1);
      }
    });
    return map;
  }, [patients]);

  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doctors
      .filter((doc) => {
        if (q) {
          const matchesQuery =
            doc.name.toLowerCase().includes(q) ||
            doc.specialization.toLowerCase().includes(q) ||
            doc.hospital.toLowerCase().includes(q) ||
            doc.email.toLowerCase().includes(q) ||
            doc.phone.toLowerCase().includes(q);
          if (!matchesQuery) return false;
        }
        if (specializationFilter !== 'all' && doc.specialization !== specializationFilter) {
          return false;
        }
        if (hospitalFilter !== 'all' && doc.hospital !== hospitalFilter) {
          return false;
        }
        if (dateFrom && doc.createdAt < dateFrom) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        if (sortBy === 'patients-desc') {
          return (patientCountMap.get(b.id) ?? 0) - (patientCountMap.get(a.id) ?? 0);
        }
        if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
        return a.createdAt.localeCompare(b.createdAt);
      });
  }, [doctors, search, specializationFilter, hospitalFilter, dateFrom, sortBy, patientCountMap]);

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedDoctors = filteredDoctors.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const hasActiveFilters =
    Boolean(search.trim()) ||
    specializationFilter !== 'all' ||
    hospitalFilter !== 'all' ||
    Boolean(dateFrom);

  const clearAllFilters = () => {
    setSearch('');
    setSpecializationFilter('all');
    setHospitalFilter('all');
    setDateFrom('');
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Doctors
            </h1>
            <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 tabular-nums">
              {doctors.length} total
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage physician profiles, specialties, hospital assignments, and patient rosters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as DataViewMode)}
            aria-label="Preview table state"
            className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 cursor-pointer"
          >
            <option value="default">State: Live Data</option>
            <option value="loading">State: Loading Skeleton</option>
            <option value="empty">State: Empty Table</option>
            <option value="error">State: API Error</option>
          </select>

          <Button
            variant="primary"
            onClick={onAddDoctor}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add New Doctor
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-4">
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
              placeholder="Search name, hospital, email..."
              aria-label="Search doctors"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                aria-label="Clear doctor search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Specialization Filter */}
          <div className="lg:col-span-2">
            <select
              value={specializationFilter}
              onChange={(e) => {
                setSpecializationFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by specialization"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="all">All Specializations</option>
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Hospital Filter */}
          <div className="lg:col-span-2">
            <select
              value={hospitalFilter}
              onChange={(e) => {
                setHospitalFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by hospital"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="all">All Hospitals</option>
              {HOSPITALS.map((hosp) => (
                <option key={hosp} value={hosp}>
                  {hosp}
                </option>
              ))}
            </select>
          </div>

          {/* Date-wise Filter */}
          <div className="relative lg:col-span-2">
            <Calendar
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              aria-label="Filter doctors added from date"
              title="Joined on or after date"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>

          {/* Sort Control */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="Sort doctors"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="patients-desc">Sort: Most Patients</option>
              <option value="name-asc">Sort: Name (A–Z)</option>
              <option value="name-desc">Sort: Name (Z–A)</option>
              <option value="newest">Sort: Newest Added</option>
              <option value="oldest">Sort: Oldest Added</option>
            </select>
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
            {specializationFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setSpecializationFilter('all')}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <span>Specialty: {specializationFilter}</span>
                <X className="h-3 w-3" />
              </button>
            )}
            {hospitalFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setHospitalFilter('all')}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <span>Hospital: {hospitalFilter}</span>
                <X className="h-3 w-3" />
              </button>
            )}
            {dateFrom && (
              <button
                type="button"
                onClick={() => setDateFrom('')}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <span>Since: {formatDisplayDate(dateFrom)}</span>
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

      {/* Table / Data Container */}
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {viewMode === 'loading' ? (
          <TableSkeleton rows={6} columns={6} />
        ) : viewMode === 'error' ? (
          <ErrorState
            title="Failed to load doctor directory"
            description="Could not retrieve the physician roster from the healthcare administration service."
            onRetry={() => setViewMode('default')}
          />
        ) : viewMode === 'empty' || doctors.length === 0 ? (
          <EmptyState
            icon={<Stethoscope className="h-6 w-6" />}
            title="No doctors registered yet"
            description="Add your first physician to begin assigning patients and tracking clinical capacity."
            actionLabel="Add New Doctor"
            onAction={onAddDoctor}
            secondaryLabel={viewMode === 'empty' ? 'Restore Demo Data' : undefined}
            onSecondaryAction={
              viewMode === 'empty' ? () => setViewMode('default') : undefined
            }
          />
        ) : filteredDoctors.length === 0 ? (
          <EmptyState
            title="No matching doctors found"
            description="No physicians match your current search or filter criteria. Try adjusting or clearing your filters."
            actionLabel="Clear All Filters"
            onAction={clearAllFilters}
          />
        ) : (
          <>
            {/* Desktop & Tablet Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Specialization</th>
                    <th className="py-3 px-4">Hospital</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4 text-right">Patients</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {paginatedDoctors.map((doc) => {
                    const count = patientCountMap.get(doc.id) ?? 0;
                    const menuOpen = openMenuId === doc.id;
                    return (
                      <tr
                        key={doc.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => onSelectDoctor(doc.id)}
                            className="flex items-center gap-3 text-left group cursor-pointer"
                          >
                            <Avatar name={doc.name} src={doc.avatarUrl} size="sm" />
                            <div>
                              <p className="font-semibold text-slate-900 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-400 transition-colors">
                                {doc.name}
                              </p>
                              <p className="text-xs font-mono text-slate-400 dark:text-slate-500">
                                {doc.id.toUpperCase()}
                              </p>
                            </div>
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <SpecializationLabel specialization={doc.specialization} />
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {doc.hospital}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs space-y-0.5">
                            <p className="text-slate-700 dark:text-slate-300 tabular-nums">
                              {doc.phone}
                            </p>
                            <p className="text-slate-500 dark:text-slate-400">{doc.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                          {count}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
                          {formatDisplayDate(doc.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="relative inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onSelectDoctor(doc.id)}
                              title="View doctor details"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId(menuOpen ? null : doc.id)
                              }
                              aria-label={`Actions for ${doc.name}`}
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
                                    onSelectDoctor(doc.id);
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
                                    onEditDoctor(doc);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                  <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                                  <span>Edit Doctor</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);
                                    onDeleteDoctor(doc);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Delete Doctor</span>
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
              {paginatedDoctors.map((doc) => {
                const count = patientCountMap.get(doc.id) ?? 0;
                return (
                  <div key={doc.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onSelectDoctor(doc.id)}
                        className="flex items-center gap-3 text-left min-w-0 cursor-pointer"
                      >
                        <Avatar name={doc.name} src={doc.avatarUrl} size="md" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {doc.name}
                          </p>
                          <div className="mt-1">
                            <SpecializationLabel specialization={doc.specialization} />
                          </div>
                        </div>
                      </button>
                      <div className="text-right shrink-0">
                        <p className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                          {count}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          patients
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.hospital}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="tabular-nums">{doc.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        Joined {formatDisplayDate(doc.createdAt)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSelectDoctor(doc.id)}
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditDoctor(doc)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteDoctor(doc)}
                          className="text-rose-600 hover:bg-rose-50 dark:text-rose-400"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              currentPage={safePage}
              totalItems={filteredDoctors.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              itemLabel="doctors"
            />
          </>
        )}
      </div>
    </div>
  );
};
