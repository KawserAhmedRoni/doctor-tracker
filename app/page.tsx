'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  AppView,
  Doctor,
  NotificationItem,
  Patient,
  ToastItem,
  ToastVariant,
} from '@/src/types/healthcare';
import { ADMIN_USER } from '@/src/data/mockData';
import { DashboardView } from '@/src/components/dashboard/DashboardView';
import { DoctorDetailsView } from '@/src/components/doctors/DoctorDetailsView';
import { DoctorFormModal } from '@/src/components/doctors/DoctorFormModal';
import { DoctorsListView } from '@/src/components/doctors/DoctorsListView';
import { Header } from '@/src/components/layout/Header';
import { Sidebar } from '@/src/components/layout/Sidebar';
import { PatientDetailsView } from '@/src/components/patients/PatientDetailsView';
import { PatientFormModal } from '@/src/components/patients/PatientFormModal';
import { PatientsListView } from '@/src/components/patients/PatientsListView';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { ToastContainer } from '@/src/components/ui/Toast';
import { BottomNav } from '@/src/components/ui/BottomNav';
import { LoginPage } from '@/src/components/auth/LoginPage';
import { ForgotPasswordPage } from '@/src/components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/src/components/auth/ResetPasswordPage';
import { NotFoundPage, UnauthorizedPage } from '@/src/components/auth/ErrorPages';

export default function MainPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Doctors & Patients state synced with Real MongoDB Backend
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Modals state
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [preselectedDoctorId, setPreselectedDoctorId] = useState<string | null>(null);

  // Confirmation dialogs
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

  // Fetch real data from MongoDB API
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [resDocs, resPats] = await Promise.all([
        fetch('/api/doctors?limit=100'),
        fetch('/api/patients?limit=200'),
      ]);

      const dataDocs = await resDocs.json();
      const dataPats = await resPats.json();

      if (dataDocs.success && dataDocs.data) {
        setDoctors(dataDocs.data);
        if (dataDocs.data.length > 0 && !selectedDoctorId) {
          setSelectedDoctorId(dataDocs.data[0].id);
        }
      }

      if (dataPats.success && dataPats.data) {
        setPatients(dataPats.data);
        if (dataPats.data.length > 0 && !selectedPatientId) {
          setSelectedPatientId(dataPats.data[0].id);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch data from MongoDB API:', err);
      addToast('error', 'Database Connection Error', 'Could not load data from MongoDB Atlas.');
    } finally {
      setLoading(false);
    }
  }, [selectedDoctorId, selectedPatientId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const navigateToDoctor = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setCurrentView('doctor-details');
  };

  const navigateToPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentView('patient-details');
  };

  // Doctor CRUD
  const handleOpenAddDoctor = () => {
    setEditingDoctor(null);
    setDoctorModalOpen(true);
  };

  const handleOpenEditDoctor = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setDoctorModalOpen(true);
  };

  const handleSaveDoctor = async (
    data: Omit<Doctor, 'id' | 'createdAt' | 'avatarUrl'>,
    existingId?: string
  ) => {
    try {
      if (existingId) {
        const res = await fetch(`/api/doctors/${existingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          addToast('success', 'Doctor updated', `${data.name} saved to MongoDB.`);
          refreshData();
        } else {
          addToast('error', 'Update Failed', result.error);
        }
      } else {
        const res = await fetch('/api/doctors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          addToast('success', 'Doctor added', `${data.name} saved to MongoDB Atlas.`);
          refreshData();
        } else {
          addToast('error', 'Failed to add doctor', result.error);
        }
      }
    } catch (err: any) {
      addToast('error', 'Network Error', err.message);
    }
  };

  const executeDeleteDoctor = async () => {
    if (!confirmDeleteDoctor) return;
    const target = confirmDeleteDoctor;
    setConfirmLoading(true);
    try {
      const res = await fetch(`/api/doctors/${target.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        addToast('info', 'Doctor deleted', `${target.name} removed from MongoDB.`);
        if (currentView === 'doctor-details' && selectedDoctorId === target.id) {
          setCurrentView('doctors');
        }
        refreshData();
      } else {
        addToast('error', 'Delete Failed', result.error);
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    } finally {
      setConfirmLoading(false);
      setConfirmDeleteDoctor(null);
    }
  };

  // Patient CRUD
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

  const handleSavePatient = async (
    data: Omit<Patient, 'id' | 'registrationDate'>,
    existingId?: string
  ) => {
    try {
      if (existingId) {
        const res = await fetch(`/api/patients/${existingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          addToast('success', 'Patient updated', `${data.fullName} saved to MongoDB.`);
          refreshData();
        } else {
          addToast('error', 'Failed', result.error);
        }
      } else {
        const res = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (result.success) {
          addToast('success', 'Patient registered', `${data.fullName} saved to MongoDB Atlas.`);
          refreshData();
        } else {
          addToast('error', 'Failed', result.error);
        }
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  const executeDeletePatient = async () => {
    if (!confirmDeletePatient) return;
    const target = confirmDeletePatient;
    setConfirmLoading(true);
    try {
      const res = await fetch(`/api/patients/${target.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        addToast('success', 'Patient deleted', `${target.fullName} deleted from database.`);
        if (currentView === 'patient-details' && selectedPatientId === target.id) {
          setCurrentView('patients');
        }
        refreshData();
      } else {
        addToast('error', 'Delete Failed', result.error);
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    } finally {
      setConfirmLoading(false);
      setConfirmDeletePatient(null);
    }
  };

  const executeRemovePatientFromDoctor = async () => {
    if (!confirmRemoveFromDoctor) return;
    const { patient, doctor } = confirmRemoveFromDoctor;
    setConfirmLoading(true);
    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedDoctorId: null }),
      });
      const result = await res.json();
      if (result.success) {
        addToast('warning', 'Patient unassigned', `${patient.fullName} unassigned from ${doctor.name}.`);
        refreshData();
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    } finally {
      setConfirmLoading(false);
      setConfirmRemoveFromDoctor(null);
    }
  };

  const selectedDoctor = useMemo(
    () => doctors.find((d) => d.id === selectedDoctorId) || doctors[0],
    [doctors, selectedDoctorId]
  );

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) || patients[0],
    [patients, selectedPatientId]
  );

  const breadcrumbs = useMemo(() => {
    if (currentView === 'dashboard') return [{ label: 'Dashboard' }];
    if (currentView === 'doctors')
      return [{ label: 'Dashboard', onClick: () => setCurrentView('dashboard') }, { label: 'Doctors' }];
    if (currentView === 'doctor-details')
      return [
        { label: 'Dashboard', onClick: () => setCurrentView('dashboard') },
        { label: 'Doctors', onClick: () => setCurrentView('doctors') },
        { label: selectedDoctor?.name ?? 'Doctor Details' },
      ];
    if (currentView === 'patients')
      return [{ label: 'Dashboard', onClick: () => setCurrentView('dashboard') }, { label: 'Patients' }];
    if (currentView === 'patient-details')
      return [
        { label: 'Dashboard', onClick: () => setCurrentView('dashboard') },
        { label: 'Patients', onClick: () => setCurrentView('patients') },
        { label: selectedPatient?.fullName ?? 'Patient Details' },
      ];
    return [{ label: 'Doctor Tracker' }];
  }, [currentView, selectedDoctor, selectedPatient]);

  if (!isAuthenticated || currentView === 'login') {
    return (
      <>
        <LoginPage
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((prev) => !prev)}
          onSuccessLogin={() => {
            setIsAuthenticated(true);
            setCurrentView('dashboard');
            addToast('success', 'Signed In', 'Welcome back to Doctor Tracker.');
          }}
          onNavigateForgotPassword={() => setCurrentView('forgot-password')}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  if (currentView === 'forgot-password') {
    return (
      <ForgotPasswordPage
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onBackToLogin={() => setCurrentView('login')}
        onOpenResetPassword={() => setCurrentView('reset-password')}
      />
    );
  }

  if (currentView === 'reset-password') {
    return (
      <ResetPasswordPage
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onBackToLogin={() => setCurrentView('login')}
      />
    );
  }

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
          setIsAuthenticated(false);
          setCurrentView('login');
          addToast('info', 'Signed Out', 'Administrator session ended.');
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
            setIsAuthenticated(false);
            setCurrentView('login');
          }}
          onPreviewSystemScreen={(view) => setCurrentView(view)}
        />

        <main className="flex-1 px-3 py-4 sm:px-6 lg:px-8 xl:px-10 w-full pb-20 md:pb-6">
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
              assignedDoctor={doctors.find((d) => d.id === selectedPatient.assignedDoctorId)}
              onBack={() => setCurrentView('patients')}
              onEditPatient={handleOpenEditPatient}
              onDeletePatient={(pat) => setConfirmDeletePatient(pat)}
              onSelectDoctor={navigateToDoctor}
            />
          )}
        </main>
      </div>

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
        detailNote="This action removes the patient record from MongoDB Atlas permanently."
        confirmLabel="Delete Patient"
      />

      <ConfirmDialog
        open={Boolean(confirmRemoveFromDoctor)}
        onClose={() => setConfirmRemoveFromDoctor(null)}
        onConfirm={executeRemovePatientFromDoctor}
        loading={confirmLoading}
        title="Remove Patient from Doctor Roster"
        description={
          confirmRemoveFromDoctor
            ? `Remove ${confirmRemoveFromDoctor.patient.fullName} from ${confirmRemoveFromDoctor.doctor.name}'s roster?`
            : ''
        }
        detailNote="The patient will remain in MongoDB Atlas with status Unassigned."
        confirmLabel="Remove from Roster"
      />

      <ConfirmDialog
        open={Boolean(confirmDeleteDoctor)}
        onClose={() => setConfirmDeleteDoctor(null)}
        onConfirm={executeDeleteDoctor}
        loading={confirmLoading}
        title="Delete Doctor Profile"
        description={
          confirmDeleteDoctor
            ? `Are you sure you want to remove ${confirmDeleteDoctor.name}?`
            : ''
        }
        detailNote="All patients assigned to this doctor will automatically become Unassigned in MongoDB Atlas."
        confirmLabel="Delete Doctor"
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* App-like Native Mobile Bottom Navigation Bar */}
      <BottomNav
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
      />
    </div>
  );
}

