import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { HOSPITALS, PATIENT_CONDITIONS } from '../../data/mockData';
import {
  Doctor,
  GenderOption,
  Patient,
  PatientCondition,
} from '../../types/healthcare';
import { isValidEmail, isValidPhone } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface PatientFormModalProps {
  open: boolean;
  onClose: () => void;
  doctors: Doctor[];
  initialPatient?: Patient | null;
  preselectedDoctorId?: string | null;
  onSave: (
    data: Omit<Patient, 'id' | 'registrationDate'>,
    existingId?: string
  ) => void;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  condition?: string;
  assignedDoctorId?: string;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  open,
  onClose,
  doctors,
  initialPatient,
  preselectedDoctorId,
  onSave,
}) => {
  const isEditing = Boolean(initialPatient);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<string>('');
  const [condition, setCondition] = useState<PatientCondition>('Hypertension');
  const [assignedDoctorId, setAssignedDoctorId] = useState<string>('');
  const [hospital, setHospital] = useState<string>('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (initialPatient) {
      setFullName(initialPatient.fullName);
      setPhone(initialPatient.phone);
      setEmail(initialPatient.email ?? '');
      setDateOfBirth(initialPatient.dateOfBirth ?? '');
      setGender(initialPatient.gender ?? '');
      setCondition(initialPatient.condition);
      setAssignedDoctorId(initialPatient.assignedDoctorId ?? '');
      setHospital(initialPatient.hospital ?? '');
      setAddress(initialPatient.address ?? '');
      setNotes(initialPatient.notes ?? '');
    } else {
      const defaultDocId = preselectedDoctorId || doctors[0]?.id || '';
      const matchedDoc = doctors.find((d) => d.id === defaultDocId);
      setFullName('');
      setPhone('');
      setEmail('');
      setDateOfBirth('');
      setGender('');
      setCondition('Hypertension');
      setAssignedDoctorId(defaultDocId);
      setHospital(matchedDoc?.hospital ?? HOSPITALS[0]);
      setAddress('');
      setNotes('');
    }
    setErrors({});
    setSubmitError(null);
    setLoading(false);
  }, [open, initialPatient, preselectedDoctorId, doctors]);

  const handleDoctorChange = (docId: string) => {
    setAssignedDoctorId(docId);
    const matchedDoc = doctors.find((d) => d.id === docId);
    if (matchedDoc && !isEditing) {
      setHospital(matchedDoc.hospital);
    }
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!fullName.trim()) {
      next.fullName = 'Patient full name is required.';
    } else if (fullName.trim().length < 2) {
      next.fullName = 'Enter the patient’s full name.';
    }

    if (!phone.trim()) {
      next.phone = 'Phone number is required.';
    } else if (!isValidPhone(phone)) {
      next.phone = 'Enter a valid 10-digit phone number.';
    }

    if (email.trim() && !isValidEmail(email)) {
      next.email = 'Enter a valid email address or leave blank.';
    }

    if (!condition) {
      next.condition = 'Patient condition is required.';
    }

    if (!assignedDoctorId) {
      next.assignedDoctorId = 'Assigning a doctor is required.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      if (fullName.toLowerCase().includes('error')) {
        setLoading(false);
        setSubmitError(
          'Unable to save patient record due to a simulated API timeout. Please try again.'
        );
        return;
      }
      onSave(
        {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          dateOfBirth: dateOfBirth || undefined,
          gender: (gender as GenderOption) || undefined,
          condition,
          assignedDoctorId: assignedDoctorId || null,
          hospital: hospital || undefined,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined,
        },
        initialPatient?.id
      );
      setLoading(false);
      onClose();
    }, 450);
  };

  const preselectedDoctorName = preselectedDoctorId
    ? doctors.find((d) => d.id === preselectedDoctorId)?.name
    : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="drawer"
      size="lg"
      title={
        isEditing
          ? 'Edit Patient Record'
          : preselectedDoctorName
          ? `Add Patient under ${preselectedDoctorName}`
          : 'Add New Patient'
      }
      description={
        isEditing
          ? 'Update patient contact details, clinical condition, or doctor assignment.'
          : 'Create a clinical patient record. Required fields are marked with *.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-800/70 dark:bg-rose-950/50 dark:text-rose-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Mandatory Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Required Patient Information
          </h3>

          <Input
            label="Patient Full Name"
            placeholder="e.g., Jordan Vance"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
            requiredMark
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              type="tel"
              placeholder="(415) 555-0192"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              requiredMark
            />

            <Select
              label="Patient Condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value as PatientCondition)}
              error={errors.condition}
              requiredMark
            >
              {PATIENT_CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </Select>
          </div>

          <Select
            label="Assigned Doctor"
            value={assignedDoctorId}
            onChange={(e) => handleDoctorChange(e.target.value)}
            error={errors.assignedDoctorId}
            requiredMark
          >
            <option value="">Select a physician...</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} ({doc.specialization} · {doc.hospital})
              </option>
            ))}
          </Select>
        </div>

        {/* Optional Information */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Additional Details (Optional)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="patient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              optionalMark
            />

            <Input
              label="Date of Birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              optionalMark
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              optionalMark
            >
              <option value="">Not specified</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </Select>

            <Select
              label="Hospital"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              optionalMark
            >
              <option value="">Not specified</option>
              {HOSPITALS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </Select>
          </div>

          <Input
            label="Address"
            placeholder="Street address, city, state"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            optionalMark
          />

          <Textarea
            label="Additional Notes"
            rows={3}
            placeholder="Relevant scheduling notes, intake context, or follow-up instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            optionalMark
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {loading
              ? isEditing
                ? 'Saving Changes...'
                : 'Registering Patient...'
              : isEditing
              ? 'Save Changes'
              : 'Add Patient'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
