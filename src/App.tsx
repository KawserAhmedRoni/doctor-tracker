/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import {
  ADMIN_USER,
  INITIAL_DOCTORS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PATIENTS,
} from './data/mockData';
import {
  AppView,
  Doctor,
  NotificationItem,
  Patient,
  ToastItem,
  ToastVariant,
} from './types/healthcare';
import { NotFoundPage, UnauthorizedPage } from './components/auth/ErrorPages';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { LoginPage } from './components/auth/LoginPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { DoctorDetailsView } from './components/doctors/DoctorDetailsView';
import { DoctorFormModal } from './components/doctors/DoctorFormModal';
import { DoctorsListView } from './components/doctors/DoctorsListView';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { PatientDetailsView } from './components/patients/PatientDetailsView';
import { PatientFormModal } from './components/patients/PatientFormModal';
import { PatientsListView } from './components/patients/PatientsListView';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { ToastContainer } from './components/ui/Toast';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(INITIAL_DOCTORS[0].id);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(INITIAL_PATIENTS[0].id);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Doctor Add/Edit Modal State
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Patient Add/Edit Modal State
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [preselectedDoctorId, setPreselectedDoctorId] = useState<string | null>(null);

  // Destructive Confirmation Dialog States
  const [confirmDeletePatient, setConfirmDeletePatient] = useState<Patient | null>(null);
  const [confirmRemoveFromDoctor, setConfirmRemoveFromDoctor] = useState<{
    patient: Patient;
    doctor: Doctor;
  } | null>(null);
  const [confirmDeleteDoctor, setConfirmDeleteDoctor] = useState<Doctor | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const addToast = (variant: ToastVariant, title: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, variant, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigateToDoctor = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setCurrentView('doctor-details');
  };

  const navigateToPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentView('patient-details');
  };

  // Doctor CRUD Handlers
  const handleOpenAddDoctor = () => {
    setEditingDoctor(null);
    setDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setDoctorModalOpen(true);
  };

  const handleSaveDoctor = (
    data: Omit<Doctor, 'id' | 'createdAt' | 'avatarUrl'>,
    existingId?: string
  ) => {
    if (existingId) {
      setDoctors((prev) =>
        prev.map((d) => (d.id === existingId ? { ...d, ...data } : d))
      );
      addToast('success', 'Doctor profile updated', `${data.name} has been updated.`);
    } else {
      const newDoc: Doctor = {
        id: `doc-${100 + doctors.length + 1}`,
        ...data,
        createdAt: '2026-11-13',
      };
      setDoctors((prev) => [newDoc, ...prev]);
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'New Doctor Added',
          description: `${newDoc.name} (${newDoc.specialization}) added to ${newDoc.hospital}.`,
          timestamp: 'Just now',
          read: false,
          targetView: 'doctor-details',
          targetId: newDoc.id,
        },
        ...prev,
      ]);
      addToast('success', 'Doctor added', `${newDoc.name} is now active in the directory.`);
    }
  };

  const executeDeleteDoctor = () => {
    if (!confirmDeleteDoctor) return;
    const target = confirmDeleteDoctor;
    setConfirmLoading(true);
    setTimeout(() => {
      setDoctors((prev) => prev.filter((d) => d.id !== target.id));
      setPatients((prev) =>
        prev.map((p) =>
          p.assignedDoctorId === target.id ? { ...p, assignedDoctorId: null } : p
        )
      );
      setConfirmLoading(false);
      setConfirmDeleteDoctor(null);
      if (currentView === 'doctor-details' && selectedDoctorId === target.id) {
        setCurrentView('doctors');
      }
      addToast(
        'info',
        'Doctor removed',
        `${target.name} was removed. Any assigned patients are now marked unassigned.`
      );
    }, 450);
  };

  // Patient CRUD Handlers
  const handleOpenAddPatient = (doctorId?: string) => {
    setEditingPatient(null);
    setPreselectedDoctorId(doctorId ?? null);
    setPatientModalOpen(true);
  };

  const handleOpenEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setPreselectedDoctorId(null);
    setPatientModalOpen(true);
  };

  const handleSavePatient = (
    data: Omit<Patient, 'id' | 'registrationDate'>,
    existingId?: string
  ) => {
    if (existingId) {
      setPatients((prev) =>
        prev.map((p) => (p.id === existingId ? { ...p, ...data } : p))
      );
      addToast('success', 'Patient record updated', `${data.fullName} details saved.`);
    } else {
      const newPat: Patient = {
        id: `pat-${200 + patients.length + 1}`,
        ...data,
        registrationDate: '2026-11-13',
      };
      setPatients((prev) => [newPat, ...prev]);
      const assignedDoc = doctors.find((d) => d.id === newPat.assignedDoctorId);
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          title: 'New Patient Registered',
          description: `${newPat.fullName} assigned to ${assignedDoc?.name ?? 'Clinical Roster'}.`,
          timestamp: 'Just now',
          read: false,
          targetView: 'patient-details',
          targetId: newPat.id,
        },
        ...prev,
      ]);
      addToast(
        'success',
        'Patient registered',
        `${newPat.fullName} assigned to ${assignedDoc?.name ?? 'roster'}.`
      );
    }
  };

  const executeDeletePatient = () => {
    if (!confirmDeletePatient) return;
    const target = confirmDeletePatient;
    setConfirmLoading(true);
    setTimeout(() => {
      setPatients((prev) => prev.filter((p) => p.id !== target.id));
      setConfirmLoading(false);
      setConfirmDeletePatient(null);
      if (currentView === 'patient-details' && selectedPatientId === target.id) {
        setCurrentView('patients');
      }
      addToast('success', 'Patient deleted', `${target.fullName} has been removed.`);
    }, 450);
  };

  const executeRemovePatientFromDoctor = () => {
    if (!confirmRemoveFromDoctor) return;
    const { patient, doctor } = confirmRemoveFromDoctor;
    setConfirmLoading(true);
    setTimeout(() => {
      setPatients((prev) =>
        prev.map((p) =>
          p.id === patient.id ? { ...p, assignedDoctorId: null } : p
        )
      );
      setConfirmLoading(false);
      setConfirmRemoveFromDoctor(null);
      addToast(
        'warning',
        'Patient removed from doctor roster',
        `${patient.fullName} was unassigned from ${doctor.name}.`
      );
    }, 450);
  };

  const selectedDoctor = useMemo(
    () => doctors.find((d) => d.id === selectedDoctorId) ?? doctors[0],
    [doctors, selectedDoctorId]
  );

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) ?? patients[0],
    [patients, selectedPatientId]
  );

  const breadcrumbs = useMemo(() => {
    if (currentView === 'dashboard') {
      return [{ label: 'Dashboard' }];
    }
    if (currentView === 'doctors') {
      return [
        { label: 'Dashboard', onClick: () => setCurrentView('dashboard') },
        { label: 'Doctors' },
      ];
    }
    if (currentView === 'doctor-details') {
      return [
        { label: 'Dashboard', onClick: () => setCurrentView('dashboard') },
        { label: 'Doctors', onClick: () => setCurrentView('doctors') },
        { label: selectedDoctor?.name ?? 'Doctor Details' },
      ];
    }
    if (currentView === 'patients') {
      return [
        { label: 'Dashboard', onClick: () => setCurrentView('dashboard') },
        { label: 'Patients' },
      ];
    }
    if (currentView === 'patient-details') {
      return [
        { label: 'Dashboard', onClick: () => setCurrentView('dashboard') },
        { label: 'Patients', onClick: () => setCurrentView('patients') },
        { label: selectedPatient?.fullName ?? 'Patient Details' },
      ];
    }
    return [{ label: 'Doctor Tracker' }];
  }, [currentView, selectedDoctor, selectedPatient]);

  // Auth & Error Full-Viewport Screens
  if (currentView === 'login') {
    return (
      <>
        <LoginPage
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          onSuccessLogin={() => {
            setCurrentView('dashboard');
            addToast('success', 'Signed in', 'Welcome back to Doctor Tracker.');
          }}
          onNavigateForgotPassword={() => setCurrentView('forgot-password')}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  if (currentView === 'forgot-password') {
    return (
      <>
        <ForgotPasswordPage
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          onBackToLogin={() => setCurrentView('login')}
          onOpenResetPassword={() => setCurrentView('reset-password')}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  if (currentView === 'reset-password') {
    return (
      <>
        <ResetPasswordPage
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          onBackToLogin={() => setCurrentView('login')}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  if (currentView === 'unauthorized') {
    return (
      <UnauthorizedPage
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onGoDashboard={() => setCurrentView('dashboard')}
        onGoLogin={() => setCurrentView('login')}
      />
    );
  }

  if (currentView === 'not-found') {
    return (
      <NotFoundPage
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onGoDashboard={() => setCurrentView('dashboard')}
        onGoLogin={() => setCurrentView('login')}
      />
    );
  }

  // Authenticated Application Shell
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#090E1A] text-slate-900 dark:text-slate-100">
      <Sidebar
        currentView={currentView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onNavigate={(view) => setCurrentView(view)}
        onLogout={() => {
          setCurrentView('login');
          addToast('info', 'Signed out', 'Your administrator session has ended.');
        }}
        user={ADMIN_USER}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          breadcrumbs={breadcrumbs}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          doctors={doctors}
          patients={patients}
          onSelectDoctor={navigateToDoctor}
          onSelectPatient={navigateToPatient}
          notifications={notifications}
          onMarkAllNotificationsRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          }
          onClickNotification={(item) => {
            setNotifications((prev) =>
              prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
            );
            if (item.targetView === 'doctor-details' && item.targetId) {
              navigateToDoctor(item.targetId);
            } else if (item.targetView === 'patient-details' && item.targetId) {
              navigateToPatient(item.targetId);
            }
          }}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          user={ADMIN_USER}
          onLogout={() => {
            setCurrentView('login');
            addToast('info', 'Signed out', 'Your administrator session has ended.');
          }}
          onPreviewSystemScreen={(view) => setCurrentView(view)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-[1400px] w-full mx-auto">
          {currentView === 'dashboard' && (
            <DashboardView
              doctors={doctors}
              patients={patients}
              darkMode={darkMode}
              onAddDoctor={handleOpenAddDoctor}
              onAddPatient={() => handleOpenAddPatient()}
              onNavigateDoctors={() => setCurrentView('doctors')}
              onNavigatePatients={() => setCurrentView('patients')}
              onSelectDoctor={navigateToDoctor}
              onSelectPatient={navigateToPatient}
            />
          )}

          {currentView === 'doctors' && (
            <DoctorsListView
              doctors={doctors}
              patients={patients}
              onAddDoctor={handleOpenAddDoctor}
              onEditDoctor={handleOpenEditDoctor}
              onDeleteDoctor={(doc) => setConfirmDeleteDoctor(doc)}
              onSelectDoctor={navigateToDoctor}
            />
          )}

          {currentView === 'doctor-details' && selectedDoctor && (
            <DoctorDetailsView
              doctor={selectedDoctor}
              patients={patients}
              onBack={() => setCurrentView('doctors')}
              onEditDoctor={handleOpenEditDoctor}
              onDeleteDoctor={(doc) => setConfirmDeleteDoctor(doc)}
              onAddPatientUnderDoctor={(docId) => handleOpenAddPatient(docId)}
              onSelectPatient={navigateToPatient}
              onRemovePatientFromDoctor={(patient, doctor) =>
                setConfirmRemoveFromDoctor({ patient, doctor })
              }
            />
          )}

          {currentView === 'patients' && (
            <PatientsListView
              patients={patients}
              doctors={doctors}
              onAddPatient={() => handleOpenAddPatient()}
              onEditPatient={handleOpenEditPatient}
              onDeletePatient={(pat) => setConfirmDeletePatient(pat)}
              onSelectPatient={navigateToPatient}
              onSelectDoctor={navigateToDoctor}
            />
          )}

          {currentView === 'patient-details' && selectedPatient && (
            <PatientDetailsView
              patient={selectedPatient}
              assignedDoctor={doctors.find(
                (d) => d.id === selectedPatient.assignedDoctorId
              )}
              onBack={() => setCurrentView('patients')}
              onEditPatient={handleOpenEditPatient}
              onDeletePatient={(pat) => setConfirmDeletePatient(pat)}
              onSelectDoctor={navigateToDoctor}
            />
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      <DoctorFormModal
        open={doctorModalOpen}
        onClose={() => setDoctorModalOpen(false)}
        initialDoctor={editingDoctor}
        onSave={handleSaveDoctor}
      />

      <PatientFormModal
        open={patientModalOpen}
        onClose={() => setPatientModalOpen(false)}
        doctors={doctors}
        initialPatient={editingPatient}
        preselectedDoctorId={preselectedDoctorId}
        onSave={handleSavePatient}
      />

      {/* Delete Patient Confirmation */}
      <ConfirmDialog
        open={Boolean(confirmDeletePatient)}
        onClose={() => setConfirmDeletePatient(null)}
        onConfirm={executeDeletePatient}
        loading={confirmLoading}
        title="Delete Patient Record"
        description={
          confirmDeletePatient
            ? `Are you sure you want to permanently delete ${confirmDeletePatient.fullName}?`
            : ''
        }
        detailNote="This action removes the patient record and cannot be undone."
        confirmLabel="Delete Patient"
      />

      {/* Remove Patient from Doctor's List Confirmation */}
      <ConfirmDialog
        open={Boolean(confirmRemoveFromDoctor)}
        onClose={() => setConfirmRemoveFromDoctor(null)}
        onConfirm={executeRemovePatientFromDoctor}
        loading={confirmLoading}
        title="Remove Patient from Doctor Roster"
        description={
          confirmRemoveFromDoctor
            ? `Remove ${confirmRemoveFromDoctor.patient.fullName} from ${confirmRemoveFromDoctor.doctor.name}’s assigned patient list?`
            : ''
        }
        detailNote="The patient record will remain in the system as Unassigned and can be reassigned to another doctor at any time."
        confirmLabel="Remove from Roster"
      />

      {/* Delete Doctor Confirmation */}
      <ConfirmDialog
        open={Boolean(confirmDeleteDoctor)}
        onClose={() => setConfirmDeleteDoctor(null)}
        onConfirm={executeDeleteDoctor}
        loading={confirmLoading}
        title="Delete Doctor Profile"
        description={
          confirmDeleteDoctor
            ? `Are you sure you want to remove ${confirmDeleteDoctor.name} from Doctor Tracker?`
            : ''
        }
        detailNote="Any patients currently assigned to this physician will remain in the directory as Unassigned."
        confirmLabel="Delete Doctor"
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
