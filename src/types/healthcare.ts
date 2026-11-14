export type Specialization =
  | 'Cardiology'
  | 'Neurology'
  | 'Pediatrics'
  | 'Orthopedics'
  | 'Internal Medicine'
  | 'Dermatology';

export type PatientCondition =
  | 'Hypertension'
  | 'Type 2 Diabetes'
  | 'Arrhythmia'
  | 'Migraine'
  | 'Asthma'
  | 'Osteoarthritis'
  | 'Dermatitis'
  | 'Post-Op Recovery'
  | 'Pediatric Wellness';

export type GenderOption = 'Female' | 'Male' | 'Non-binary' | 'Prefer not to say';

export interface Doctor {
  id: string;
  name: string;
  specialization: Specialization;
  hospital: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  createdAt: string; // ISO date YYYY-MM-DD
}

export interface Patient {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: GenderOption;
  condition: PatientCondition;
  assignedDoctorId: string | null;
  hospital?: string;
  address?: string;
  notes?: string;
  registrationDate: string; // ISO date YYYY-MM-DD
}

export type AppView =
  | 'dashboard'
  | 'doctors'
  | 'doctor-details'
  | 'patients'
  | 'patient-details'
  | 'profile'
  | 'login'
  | 'forgot-password'
  | 'reset-password'
  | 'unauthorized'
  | 'not-found';

export type DataViewMode = 'default' | 'loading' | 'empty' | 'error';

export type DateRangePreset = '7d' | '30d' | '90d' | 'all';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  targetView?: 'doctors' | 'patients' | 'doctor-details' | 'patient-details';
  targetId?: string;
}

export interface AdminUser {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}
