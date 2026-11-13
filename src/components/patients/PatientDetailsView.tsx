import React from 'react';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit3,
  FileText,
  Mail,
  MapPin,
  Phone,
  Stethoscope,
  Trash2,
  UserRound,
} from 'lucide-react';
import { Doctor, Patient } from '../../types/healthcare';
import { formatDisplayDate } from '../../utils/formatters';
import { Avatar } from '../ui/Avatar';
import { ConditionLabel, SpecializationLabel } from '../ui/Badge';
import { Button } from '../ui/Button';

interface PatientDetailsViewProps {
  patient: Patient;
  assignedDoctor?: Doctor;
  onBack: () => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void;
  onSelectDoctor: (doctorId: string) => void;
}

export const PatientDetailsView: React.FC<PatientDetailsViewProps> = ({
  patient,
  assignedDoctor,
  onBack,
  onEditPatient,
  onDeletePatient,
  onSelectDoctor,
}) => {
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
          <span>Back to Patients</span>
        </button>
      </div>

      {/* Patient Profile Header */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Avatar name={patient.fullName} size="xl" tone="sky" />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {patient.fullName}
                </h1>
                <ConditionLabel condition={patient.condition} />
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-mono text-slate-500 dark:text-slate-400">
                  ID: {patient.id.toUpperCase()}
                </span>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {patient.phone}
                </span>
                {patient.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {patient.email}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Registered {formatDisplayDate(patient.registrationDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              onClick={() => onEditPatient(patient)}
              leftIcon={<Edit3 className="h-4 w-4" />}
            >
              Edit Patient
            </Button>
            <Button
              variant="danger"
              onClick={() => onDeletePatient(patient)}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete Patient
            </Button>
          </div>
        </div>
      </section>

      {/* Two-column Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Contact & Demographics */}
        <section className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Contact & Personal Information
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recorded administrative contact details and optional demographic fields.
            </p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-sm">
            <div className="space-y-1">
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>Phone Number</span>
              </dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                {patient.phone}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>Email Address</span>
              </dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">
                {patient.email ?? (
                  <span className="text-slate-400 font-normal">Not provided</span>
                )}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Date of Birth</span>
              </dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                {patient.dateOfBirth ? (
                  formatDisplayDate(patient.dateOfBirth)
                ) : (
                  <span className="text-slate-400 font-normal">Not provided</span>
                )}
              </dd>
            </div>

            <div className="space-y-1">
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5 text-slate-400" />
                <span>Gender</span>
              </dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">
                {patient.gender ?? (
                  <span className="text-slate-400 font-normal">Not provided</span>
                )}
              </dd>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>Address</span>
              </dt>
              <dd className="font-medium text-slate-900 dark:text-slate-100">
                {patient.address ?? (
                  <span className="text-slate-400 font-normal">Not provided</span>
                )}
              </dd>
            </div>
          </dl>

          {patient.notes && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span>Administrative Notes</span>
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {patient.notes}
              </p>
            </div>
          )}
        </section>

        {/* Care Assignment */}
        <section className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Care Assignment
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Attending physician and clinical facility relationship.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
            {assignedDoctor ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      name={assignedDoctor.name}
                      src={assignedDoctor.avatarUrl}
                      size="md"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {assignedDoctor.name}
                      </p>
                      <div className="mt-1">
                        <SpecializationLabel
                          specialization={assignedDoctor.specialization}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <p className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>{assignedDoctor.hospital}</span>
                  </p>
                  <p className="flex items-center gap-1.5 tabular-nums">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{assignedDoctor.phone}</span>
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectDoctor(assignedDoctor.id)}
                  leftIcon={<Stethoscope className="h-3.5 w-3.5" />}
                  className="w-full"
                >
                  View Doctor Profile
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center dark:border-slate-700 space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No doctor currently assigned
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Edit this patient record to assign an attending physician.
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onEditPatient(patient)}
                >
                  Assign Doctor
                </Button>
              </div>
            )}

            <dl className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Facility</dt>
                <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
                  {patient.hospital ?? assignedDoctor?.hospital ?? 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Registration Date</dt>
                <dd className="mt-0.5 font-medium text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatDisplayDate(patient.registrationDate)}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
};
