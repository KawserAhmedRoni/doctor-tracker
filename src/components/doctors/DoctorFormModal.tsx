import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { HOSPITALS, SPECIALIZATIONS } from '../../data/mockData';
import { Doctor, Specialization } from '../../types/healthcare';
import { isValidEmail, isValidPhone } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface DoctorFormModalProps {
  open: boolean;
  onClose: () => void;
  initialDoctor?: Doctor | null;
  onSave: (data: Omit<Doctor, 'id' | 'createdAt' | 'avatarUrl'>, existingId?: string) => void;
  variant?: 'modal' | 'drawer';
}

interface FormErrors {
  name?: string;
  specialization?: string;
  hospital?: string;
  phone?: string;
  email?: string;
}

export const DoctorFormModal: React.FC<DoctorFormModalProps> = ({
  open,
  onClose,
  initialDoctor,
  onSave,
  variant = 'modal',
}) => {
  const isEditing = Boolean(initialDoctor);
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState<Specialization>('Cardiology');
  const [hospital, setHospital] = useState(HOSPITALS[0]);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initialDoctor) {
      setName(initialDoctor.name);
      setSpecialization(initialDoctor.specialization);
      setHospital(initialDoctor.hospital);
      setPhone(initialDoctor.phone);
      setEmail(initialDoctor.email);
    } else {
      setName('');
      setSpecialization('Cardiology');
      setHospital(HOSPITALS[0]);
      setPhone('');
      setEmail('');
    }
    setErrors({});
    setSubmitError(null);
    setLoading(false);
  }, [open, initialDoctor]);

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!name.trim()) {
      next.name = 'Doctor name is required.';
    } else if (name.trim().length < 3) {
      next.name = 'Enter the physician’s full name.';
    }
    if (!specialization) {
      next.specialization = 'Specialization is required.';
    }
    if (!hospital.trim()) {
      next.hospital = 'Hospital affiliation is required.';
    }
    if (!phone.trim()) {
      next.phone = 'Phone number is required.';
    } else if (!isValidPhone(phone)) {
      next.phone = 'Enter a valid 10-digit phone number (e.g., (415) 890-2310).';
    }
    if (!email.trim()) {
      next.email = 'Email address is required.';
    } else if (!isValidEmail(email)) {
      next.email = 'Enter a valid clinical email address.';
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
      if (email.toLowerCase().includes('fail')) {
        setLoading(false);
        setSubmitError(
          'Unable to save doctor record due to a simulated server error. Please try again.'
        );
        return;
      }
      const normalizedName = name.trim().startsWith('Dr.')
        ? name.trim()
        : `Dr. ${name.trim()}`;
      onSave(
        {
          name: normalizedName,
          specialization,
          hospital: hospital.trim(),
          phone: phone.trim(),
          email: email.trim(),
        },
        initialDoctor?.id
      );
      setLoading(false);
      onClose();
    }, 450);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant={variant}
      size="md"
      title={isEditing ? 'Edit Doctor Profile' : 'Add New Doctor'}
      description={
        isEditing
          ? 'Update physician credentials, hospital affiliation, and contact information.'
          : 'Register a new physician in Doctor Tracker. All fields marked with * are required.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-800/70 dark:bg-rose-950/50 dark:text-rose-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <span>{submitError}</span>
          </div>
        )}

        <Input
          label="Doctor Name"
          placeholder="e.g., Dr. Sarah Jenkins"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          requiredMark
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value as Specialization)}
            error={errors.specialization}
            requiredMark
          >
            {SPECIALIZATIONS.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </Select>

          <Select
            label="Hospital"
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
            error={errors.hospital}
            requiredMark
          >
            {HOSPITALS.map((hosp) => (
              <option key={hosp} value={hosp}>
                {hosp}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone"
            type="tel"
            placeholder="(415) 890-2310"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            requiredMark
          />

          <Input
            label="Email"
            type="email"
            placeholder="s.jenkins@mercygeneral.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            requiredMark
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {loading
              ? isEditing
                ? 'Saving Changes...'
                : 'Adding Doctor...'
              : isEditing
              ? 'Save Changes'
              : 'Add Doctor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
