import React, { useState, useEffect, useCallback } from 'react';
import { RouterProvider, useRouter } from './router/Router';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { PatientManagement } from './components/patients/PatientManagement';
import { AppointmentManagement } from './components/appointments/AppointmentManagement';
import { DoctorManagement } from './components/doctors/DoctorManagement';
import { DiseaseAnalytics } from './components/diseases/DiseaseAnalytics';
import { AIClinicInsights } from './components/insights/AIClinicInsights';
import { NewAppointmentModal } from './components/modals/NewAppointmentModal';
import { PatientDetailModal } from './components/modals/PatientDetailModal';
import { RegisterPatientModal } from './components/modals/RegisterPatientModal';
import { DoctorScheduleModal } from './components/modals/DoctorScheduleModal';
import { ClinicalReportsModal } from './components/modals/ClinicalReportsModal';
import { LoginScreen, AuthUser } from './components/auth/LoginScreen';
import { DoctorPortal } from './components/portals/DoctorPortal';
import { PatientPortal } from './components/portals/PatientPortal';
import { LandingPage } from './components/landing/LandingPage';
import { AiClinicAssistant } from './components/assistant/AiClinicAssistant';
import { DepartmentsManagement } from './components/departments/DepartmentsManagement';
import { ReportsAnalyticsView } from './components/reports/ReportsAnalyticsView';
import { ContactSupportView } from './components/contact/ContactSupportView';
import { ClinicSettingsView } from './components/settings/ClinicSettingsView';
import { ClinicDataTableView } from './components/database/ClinicDataTableView';
import { StaffManagement } from './components/staff/StaffManagement';
import { StaffDashboard } from './components/staff/StaffDashboard';

// Dedicated Public Pages
import { AboutPage } from './components/pages/AboutPage';
import { ServicesPage } from './components/pages/ServicesPage';
import { ContactPage } from './components/pages/ContactPage';
import { DoctorsPage } from './components/pages/DoctorsPage';
import { DoctorDetailsPage } from './components/pages/DoctorDetailsPage';
import { SignupPage } from './components/pages/SignupPage';
import { ForgotPasswordPage } from './components/pages/ForgotPasswordPage';
import { ResetPasswordPage } from './components/pages/ResetPasswordPage';
import { VerifyEmailPage } from './components/pages/VerifyEmailPage';
import { PrivacyPolicyPage } from './components/pages/PrivacyPolicyPage';
import { TermsOfServicePage } from './components/pages/TermsOfServicePage';
import { AcceptanceTestsPage } from './components/pages/AcceptanceTestsPage';

import { 
  ActiveView, 
  DashboardStats, 
  PatientRecord, 
  AppointmentRecord, 
  DoctorRecord, 
  DiseaseRecord, 
  ClinicInsight 
} from './types/clinic';
import { 
  fetchDashboardStats, 
  fetchPatients, 
  fetchAppointments, 
  fetchDoctors, 
  fetchDiseases, 
  fetchInsights,
  addAppointment,
  updateAppointmentStatus,
  addPatient,
  updateInsightStatus
} from './api/clinicApi';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  X, 
  Loader2,
  HeartPulse
} from 'lucide-react';
import { 
  supabase, 
  mapSupabaseUserToAuthUser,
  resolveSupabaseUserRole,
  isSupabaseConfigured
} from './lib/supabase';
import { 
  initializeSupabaseRealtime, 
  subscribeToAppointmentEvents, 
  broadcastNewAppointment, 
  broadcastUpdatedAppointment 
} from './services/realtimeAppointmentSync';
import { UserRole } from './components/auth/LoginScreen';

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'alert';
}

function MainClinicApp() {
  const { currentPath, navigate, matchRoute } = useRouter();

  // Authentication State with real Supabase persistence & restoration
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('ai_clinic_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [selectedLoginRole, setSelectedLoginRole] = useState<UserRole>('clinic_staff');
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  // Core Clinical Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [diseases, setDiseases] = useState<DiseaseRecord[]>([]);
  const [insights, setInsights] = useState<ClinicInsight[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Modals
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [initialDoctorForAppointment, setInitialDoctorForAppointment] = useState<string | undefined>();
  const [initialComplaintForAppointment, setInitialComplaintForAppointment] = useState<string | undefined>();
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<PatientRecord | null>(null);
  const [selectedDoctorForSchedule, setSelectedDoctorForSchedule] = useState<DoctorRecord | null>(null);
  const [registerPatientOpen, setRegisterPatientOpen] = useState(false);
  const [reportsModalOpen, setReportsModalOpen] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Restore Session on App Startup & Page Refresh with Dynamic Auth Listeners
  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        let restoredUser: AuthUser | null = null;
        let activeToken: string | null = null;

        // 1. Initial Session Check with Supabase if configured
        if (isSupabaseConfigured()) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              activeToken = session.access_token;
              const roleResolution = await resolveSupabaseUserRole(session.user);
              if (roleResolution.user) {
                restoredUser = roleResolution.user;
              } else {
                restoredUser = mapSupabaseUserToAuthUser(session.user);
              }
            }
          } catch (sbErr) {
            console.warn('[Session] Supabase getSession warning:', sbErr);
          }
        }

        // 2. If no Supabase user, verify stored token against backend /api/auth/me
        if (!restoredUser) {
          const storedToken = localStorage.getItem('ai_clinic_token');
          if (storedToken) {
            try {
              const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${storedToken}` },
              });
              if (res.ok) {
                const body = await res.json();
                if (body?.user) {
                  restoredUser = body.user;
                  activeToken = storedToken;
                }
              }
            } catch (meErr) {
              console.warn('[Session] /api/auth/me check warning:', meErr);
            }
          }
        }

        // 3. Fallback to cached verified user object if present
        if (!restoredUser) {
          const cached = localStorage.getItem('ai_clinic_auth_user');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed && parsed.email && parsed.role) {
                restoredUser = parsed;
              }
            } catch {}
          }
        }

        if (!mounted) return;

        if (restoredUser) {
          setCurrentUser(restoredUser);
          try {
            localStorage.setItem('ai_clinic_auth_user', JSON.stringify(restoredUser));
            if (activeToken) {
              localStorage.setItem('ai_clinic_token', activeToken);
            }
          } catch {}
        } else {
          setCurrentUser(null);
        }
      } finally {
        if (mounted) setIsAuthLoading(false);
      }
    }

    restoreSession();

    // 2. Real-time Subscription to Supabase Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        try {
          const roleResolution = await resolveSupabaseUserRole(session.user);
          const mappedUser = roleResolution.user || mapSupabaseUserToAuthUser(session.user);
          setCurrentUser(mappedUser);
          try {
            localStorage.setItem('ai_clinic_auth_user', JSON.stringify(mappedUser));
            localStorage.setItem('ai_clinic_token', session.access_token);
          } catch {}
        } catch {}
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        try {
          localStorage.removeItem('ai_clinic_auth_user');
          localStorage.removeItem('ai_clinic_token');
        } catch {}
      }
      setIsAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadData = useCallback(async () => {
    setIsDataLoading(true);
    setDataError(null);
    try {
      const [sData, pData, aData, dData, disData, iData] = await Promise.all([
        fetchDashboardStats(selectedTimeframe),
        fetchPatients(),
        fetchAppointments(),
        fetchDoctors(),
        fetchDiseases(),
        fetchInsights(),
      ]);
      setStats(sData);
      setPatients(pData);
      setAppointments(aData);
      setDoctors(dData);
      setDiseases(disData);
      setInsights(iData);
    } catch (err: any) {
      console.warn('Clinic state notice (using persistent store fallback):', err?.message || err);
      setDataError(err?.message || 'Failed to query Supabase "clinic data" dataset.');
    } finally {
      setIsDataLoading(false);
    }
  }, [selectedTimeframe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('ai_clinic_auth_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save user in localStorage', e);
    }
    showToast(
      `Welcome, ${user.name}`,
      `Authenticated as ${
        user.role === 'patient'
          ? 'Patient'
          : user.role === 'doctor'
          ? 'Physician'
          : 'Clinic Staff'
      }.`,
      'success'
    );

    // Explicit Role-Based Destination Routing for 3-role architecture:
    // Patient -> /dashboard/patient
    // Doctor -> /dashboard/doctor
    // Clinic Staff (and preserved admin/staff accounts) -> /dashboard/staff
    if (user.role === 'patient') {
      navigate('/dashboard/patient');
    } else if (user.role === 'doctor') {
      navigate('/dashboard/doctor');
    } else {
      navigate('/dashboard/staff');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign-out error', err);
    }

    setCurrentUser(null);
    try {
      localStorage.removeItem('ai_clinic_auth_user');
      localStorage.removeItem('ai_clinic_token');
    } catch (e) {
      console.warn('Failed to clear user from localStorage', e);
    }

    showToast('Logged Out', 'You have been safely logged out.', 'info');
    navigate('/login');
  };

  const handleOpenLogin = (role: UserRole = 'patient') => {
    setSelectedLoginRole(role);
    navigate('/login');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  // Real-Time Appointment Synchronization via Supabase Realtime, Broadcast, and SSE
  useEffect(() => {
    const cleanupRealtime = initializeSupabaseRealtime();

    const unsubscribe = subscribeToAppointmentEvents((event) => {
      const incoming = event.appointment;
      if (!incoming || !incoming.id) return;

      if (event.type === 'created') {
        // 1. Immediately update appointment state without reloading the page (preventing duplicates)
        setAppointments((prev) => {
          if (prev.some((a) => a.id === incoming.id)) {
            return prev;
          }
          return [incoming, ...prev];
        });

        // 2. Update dashboard stats dynamically if date is today
        const todayStr = new Date().toISOString().split('T')[0];
        if (incoming.date === todayStr) {
          setStats((prev) => prev ? {
            ...prev,
            todayAppointments: prev.todayAppointments + 1,
            emergencyCasesToday: incoming.priority === 'Critical' ? prev.emergencyCasesToday + 1 : prev.emergencyCasesToday,
          } : null);
        }

        // 3. Role-Based Notification & Security Scoping
        if (currentUser) {
          if (currentUser.role === 'patient') {
            const isCurrentPatient =
              incoming.patientId === currentUser.id ||
              (currentUser.patientId && incoming.patientId === currentUser.patientId) ||
              incoming.patientName.toLowerCase() === currentUser.name.toLowerCase() ||
              (currentUser.email && incoming.patientEmail && incoming.patientEmail.toLowerCase() === currentUser.email.toLowerCase());

            if (isCurrentPatient) {
              showToast(
                'Appointment Confirmed',
                `Your consultation with ${incoming.doctorName} on ${incoming.date} at ${incoming.time} is confirmed.`,
                'success'
              );
            }
          } else if (currentUser.role === 'doctor') {
            const docClean = (currentUser.name || '').toLowerCase().replace('dr.', '').trim();
            const docLast = docClean.split(' ').pop() || '';
            const isAssignedDoctor =
              incoming.doctorId === currentUser.id ||
              (currentUser.doctorId && incoming.doctorId === currentUser.doctorId) ||
              (docLast && incoming.doctorName.toLowerCase().includes(docLast)) ||
              (docClean && incoming.doctorName.toLowerCase().includes(docClean));

            if (isAssignedDoctor) {
              showToast(
                'New Appointment Scheduled',
                `${incoming.patientName} booked for ${incoming.time} (${incoming.chiefComplaint}).`,
                'info'
              );
            }
          } else {
            // Clinic Staff sees all clinic-wide appointment notifications
            showToast(
              'New Clinic Appointment',
              `${incoming.patientName} booked with ${incoming.doctorName} for ${incoming.time} (${incoming.department}).`,
              'info'
            );
          }
        }
      } else if (event.type === 'updated') {
        // 1. Update appointment record in place across all dashboards without page refresh
        setAppointments((prev) =>
          prev.map((a) => (a.id === incoming.id ? { ...a, ...incoming } : a))
        );

        // 2. Role-Based Status Change Notification
        if (currentUser) {
          if (currentUser.role === 'patient') {
            const isCurrentPatient =
              incoming.patientId === currentUser.id ||
              (currentUser.patientId && incoming.patientId === currentUser.patientId) ||
              incoming.patientName.toLowerCase() === currentUser.name.toLowerCase();

            if (isCurrentPatient) {
              showToast(
                'Appointment Status Updated',
                `Your appointment with ${incoming.doctorName} is now "${incoming.status}".`,
                'info'
              );
            }
          } else if (currentUser.role === 'doctor') {
            const docClean = (currentUser.name || '').toLowerCase().replace('dr.', '').trim();
            const docLast = docClean.split(' ').pop() || '';
            const isAssignedDoctor =
              incoming.doctorId === currentUser.id ||
              (currentUser.doctorId && incoming.doctorId === currentUser.doctorId) ||
              (docLast && incoming.doctorName.toLowerCase().includes(docLast)) ||
              (docClean && incoming.doctorName.toLowerCase().includes(docClean));

            if (isAssignedDoctor) {
              showToast(
                'Status Updated',
                `Patient ${incoming.patientName} marked as "${incoming.status}".`,
                'info'
              );
            }
          } else {
            // Clinic Staff
            showToast(
              'Appointment Status Updated',
              `${incoming.patientName} (${incoming.doctorName}) status changed to "${incoming.status}".`,
              'info'
            );
          }
        }
      }
    });

    return () => {
      unsubscribe();
      if (cleanupRealtime) cleanupRealtime();
    };
  }, [currentUser]);

  // Appointment Actions
  const handleCreateAppointment = async (aptData: Omit<AppointmentRecord, 'id'>) => {
    try {
      const payload: Omit<AppointmentRecord, 'id'> = {
        ...aptData,
        patientEmail: currentUser?.role === 'patient' ? currentUser.email : (aptData as any).patientEmail,
        createdAt: new Date().toISOString(),
      };
      const created = await addAppointment(payload);
      setAppointments((prev) => prev.some((a) => a.id === created.id) ? prev : [created, ...prev]);

      // Broadcast real-time sync event across Supabase Realtime, BroadcastChannel, and SSE
      await broadcastNewAppointment(created);

      showToast(
        'Appointment Booked',
        `${created.patientName} scheduled with ${created.doctorName} for ${created.time}.`,
        'success'
      );
    } catch (err: any) {
      showToast('Booking Conflict', err.message || 'Could not schedule appointment.', 'alert');
    }
  };

  const handleUpdateAppointmentStatus = async (
    id: string,
    status: AppointmentRecord['status'],
    checkedIn?: boolean
  ) => {
    try {
      const updated = await updateAppointmentStatus(id, status, checkedIn);
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));

      // Broadcast status change in real time to patient, doctor, and clinic staff dashboards
      await broadcastUpdatedAppointment(updated);

      showToast('Status Updated', `Appointment ${updated.id} marked as ${status}.`, 'info');
    } catch (err: any) {
      showToast('Update Notice', err.message || 'Could not update status.', 'alert');
    }
  };

  // Patient Actions
  const handleRegisterPatient = async (patientData: Omit<PatientRecord, 'id' | 'mrn'>) => {
    const created = await addPatient(patientData);
    setPatients((prev) => [created, ...prev]);
    showToast(
      'Patient Registered',
      `${created.name} successfully entered into clinic database (MRN: ${created.mrn}).`,
      'success'
    );
    loadData();
  };

  // Insight Actions
  const handleUpdateInsight = async (id: string, status: ClinicInsight['status']) => {
    const updated = await updateInsightStatus(id, status);
    setInsights((prev) => prev.map((i) => (i.id === id ? updated : i)));
    showToast(
      'Protocol Action Applied',
      `Clinical recommendation "${updated.title}" marked as ${status}.`,
      'success'
    );
  };

  const handleOpenBookAppointment = (doctorId?: string, complaint?: string) => {
    setInitialDoctorForAppointment(doctorId);
    setInitialComplaintForAppointment(complaint);
    setNewAppointmentOpen(true);
  };

  const handleExportReports = (format: string) => {
    showToast(
      `Report Export Complete`,
      `Quality audit report exported in ${format} format with de-identified patient data.`,
      'success'
    );
  };

  // Render Global Floating Toasts
  const renderToasts = () => (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto p-3.5 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-700/80 flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-start gap-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />}
            {toast.type === 'alert' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Sparkles className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />}
            <div>
              <h5 className="text-xs font-bold text-white">{toast.title}</h5>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
            </div>
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );

  // Render Floating AI Healthcare Assistant
  const renderAiAssistant = () => {
    const activePatientContext =
      currentUser?.role === 'patient'
        ? currentUser.patientData || patients.find((p) => p.id === currentUser.id) || patients[0]
        : patients[0];

    return (
      <>
        {!isAiAssistantOpen && (
          <div className="fixed bottom-6 right-5 sm:right-6 z-40 animate-in fade-in zoom-in-90 duration-200">
            <button
              type="button"
              onClick={() => setIsAiAssistantOpen(true)}
              className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/30 hover:scale-105 active:scale-95 transition-all border border-teal-500/30"
              title="Open AI Clinic Healthcare Assistant"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white group-hover:rotate-12 transition-transform" />
              </div>
              <span className="text-xs font-bold tracking-tight">AI Assistant</span>
            </button>
          </div>
        )}

        <AiClinicAssistant
          isOpen={isAiAssistantOpen}
          onClose={() => setIsAiAssistantOpen(false)}
          patient={activePatientContext}
          appointments={appointments}
          doctors={doctors}
          onOpenBookAppointment={handleOpenBookAppointment}
        />
      </>
    );
  };

  // Auth Loading Screen for Protected Dashboard
  if (isAuthLoading && currentPath.startsWith('/dashboard')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Validating Supabase Session</h3>
            <p className="text-xs text-slate-500">Restoring clinical role credentials...</p>
          </div>
          <Loader2 className="w-5 h-5 text-teal-600 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // =========================================================
  // ROUTE DISPATCHER
  // =========================================================

  // Public Route 1: About Us
  if (currentPath === '/about') {
    return (
      <>
        {renderToasts()}
        {renderAiAssistant()}
        <AboutPage currentUser={currentUser} onLogout={handleLogout} />
      </>
    );
  }

  // Public Route 2: Contact
  if (currentPath === '/contact') {
    return (
      <>
        {renderToasts()}
        {renderAiAssistant()}
        <ContactPage currentUser={currentUser} onLogout={handleLogout} />
      </>
    );
  }

  // Public Route 3: Doctors Directory
  if (currentPath === '/doctors') {
    return (
      <>
        {renderToasts()}
        {renderAiAssistant()}
        <DoctorsPage
          currentUser={currentUser}
          onLogout={handleLogout}
          onBookAppointmentWithDoctor={(docId) => navigate(`/doctors/${docId}`)}
        />
      </>
    );
  }

  // Public Route: Clinical Services & Specialties
  if (currentPath === '/services') {
    return (
      <>
        {renderToasts()}
        {renderAiAssistant()}
        <ServicesPage currentUser={currentUser} onLogout={handleLogout} />
      </>
    );
  }

  // Public Route 4: Doctor Details
  const docMatch = matchRoute('/doctors/:id');
  if (docMatch) {
    return (
      <>
        {renderToasts()}
        {renderAiAssistant()}
        <DoctorDetailsPage
          currentUser={currentUser}
          onLogout={handleLogout}
          patients={patients}
          onAppointmentBooked={() => loadData()}
        />
      </>
    );
  }

  // Public Route 5: Signup
  if (currentPath === '/signup') {
    return (
      <>
        {renderToasts()}
        {renderAiAssistant()}
        <SignupPage onLoginSuccess={handleLogin} />
      </>
    );
  }

  // Public Route 6: Forgot Password
  if (currentPath === '/forgot-password') {
    return (
      <>
        {renderToasts()}
        {renderAiAssistant()}
        <ForgotPasswordPage />
      </>
    );
  }

  // Public Route 7: Reset Password
  if (currentPath === '/reset-password') {
    return (
      <>
        {renderToasts()}
        {renderAiAssistant()}
        <ResetPasswordPage />
      </>
    );
  }

  // Public Route 8: Verify Email
  if (currentPath === '/verify-email') {
    return (
      <>
        {renderToasts()}
        {renderAiAssistant()}
        <VerifyEmailPage />
      </>
    );
  }

  // Public Route 9: Privacy Policy
  if (currentPath === '/privacy') {
    return (
      <>
        {renderToasts()}
        {renderAiAssistant()}
        <PrivacyPolicyPage />
      </>
    );
  }

  // Public Route 10: Terms of Service
  if (currentPath === '/terms') {
    return (
      <>
        {renderToasts()}
        {renderAiAssistant()}
        <TermsOfServicePage />
      </>
    );
  }

  // Public Route 11: Acceptance Tests Runner
  if (currentPath === '/acceptance-tests') {
    return (
      <>
        {renderToasts()}
        {renderAiAssistant()}
        <AcceptanceTestsPage currentUser={currentUser} onLogout={handleLogout} />
      </>
    );
  }

  // Route: Login Screen
  if (currentPath === '/login') {
    if (currentUser) {
      // Authenticated users must not bypass their active session or switch roles without logging out
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-800">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Already Logged In</h3>
              <p className="text-xs text-slate-500 mt-1">
                You are currently signed in as <strong>{currentUser.name}</strong> ({currentUser.role === 'clinic_staff' ? 'Clinic Staff' : currentUser.role === 'doctor' ? 'Doctor' : 'Patient'}).
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-xs"
              >
                Go to Dashboard
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <>
        {renderToasts()}
        {renderAiAssistant()}
        <LoginScreen
          onLogin={handleLogin}
          doctors={doctors}
          patients={patients}
          initialRole={selectedLoginRole}
          onBackToHome={handleGoHome}
        />
      </>
    );
  }

  // Canonical Dashboard URL mapper for user's active role (3-role architecture)
  const getRoleDashboardPath = (role: UserRole | string) => {
    switch (role) {
      case 'patient':
        return '/dashboard/patient';
      case 'doctor':
        return '/dashboard/doctor';
      case 'clinic_staff':
      case 'admin':
      case 'staff':
      default:
        return '/dashboard/staff';
    }
  };

  // Direct Short Role URLs (/patient, /doctor, /staff, /admin, /clinic-staff)
  if (
    currentPath === '/patient' ||
    currentPath === '/doctor' ||
    currentPath === '/staff' ||
    currentPath === '/admin' ||
    currentPath === '/clinic-staff'
  ) {
    if (!currentUser) {
      const targetRole: UserRole =
        currentPath === '/patient'
          ? 'patient'
          : currentPath === '/doctor'
          ? 'doctor'
          : 'clinic_staff';
      handleOpenLogin(targetRole);
      return null;
    }

    if (currentPath === '/admin' || currentPath === '/staff' || currentPath === '/clinic-staff') {
      const isStaffOrAdmin =
        currentUser.role === 'clinic_staff' ||
        (currentUser.role as any) === 'staff' ||
        (currentUser.role as any) === 'admin';

      if (!isStaffOrAdmin) {
        showToast(
          'Access Denied',
          `Your account role (${currentUser.role}) cannot access Clinic Staff operations. Redirecting to your assigned dashboard.`,
          'alert'
        );
        navigate(getRoleDashboardPath(currentUser.role));
        return null;
      }
      navigate('/dashboard/staff');
      return null;
    }

    const requestedRole = currentPath.slice(1) as UserRole;
    if (currentUser.role !== requestedRole) {
      showToast(
        'Access Denied',
        `Your account (${currentUser.role}) does not have permission to access the ${requestedRole} portal. Redirecting to your assigned dashboard.`,
        'alert'
      );
      navigate(getRoleDashboardPath(currentUser.role));
      return null;
    }
    navigate(getRoleDashboardPath(requestedRole));
    return null;
  }

  // Canonical /dashboard entrypoint: Redirects each user to their specific authorized dashboard
  if (currentPath === '/dashboard') {
    if (!currentUser) {
      navigate('/login');
      return null;
    }
    navigate(getRoleDashboardPath(currentUser.role));
    return null;
  }

  // Protected Routes: Dashboards
  // Protect the dashboard so logged-out users cannot access protected pages
  if (currentPath.startsWith('/dashboard')) {
    if (!currentUser) {
      return (
        <>
          {renderToasts()}
          {renderAiAssistant()}
          <LoginScreen
            onLogin={handleLogin}
            doctors={doctors}
            patients={patients}
            initialRole={selectedLoginRole}
            onBackToHome={handleGoHome}
          />
        </>
      );
    }

    // 1. Role Guard: Patient Dashboard (/dashboard/patient)
    if (currentPath === '/dashboard/patient') {
      if (currentUser.role !== 'patient') {
        showToast(
          'Access Denied',
          `Your account role (${currentUser.role}) cannot access the Patient portal. Redirecting to your assigned dashboard.`,
          'alert'
        );
        navigate(getRoleDashboardPath(currentUser.role));
        return null;
      }

      const ptData: PatientRecord =
        currentUser.patientData ||
        patients.find((p) => p.id === currentUser.id || (p.email && p.email.toLowerCase() === currentUser.email.toLowerCase())) || {
          id: currentUser.id,
          mrn: currentUser.patientId || `PT-${currentUser.id.slice(0, 5).toUpperCase()}`,
          name: currentUser.name,
          age: 32,
          gender: 'Other',
          phone: '(555) 000-0000',
          email: currentUser.email,
          bloodType: 'O+',
          primaryDiagnosis: 'General Outpatient Care',
          assignedDoctor: doctors[0]?.name || 'Dr. Sarah Jenkins',
          department: 'General Medicine',
          lastVisit: 'Today',
          triageStatus: 'Normal',
          vitals: {
            bp: '120/80',
            hr: 72,
            spo2: 98,
            temp: 98.6,
            glucose: 95,
          },
          allergies: ['No known drug allergies'],
          medications: [],
          insurance: 'Clinical Direct Care Plan',
          medicalHistory: ['Routine health maintenance'],
          avatarGradient: currentUser.avatarGradient || 'from-teal-600 to-cyan-500',
        };

      return (
        <>
          {renderToasts()}
          {renderAiAssistant()}

          <PatientPortal
            user={currentUser}
            patient={ptData}
            appointments={appointments}
            doctors={doctors}
            onOpenBookAppointment={handleOpenBookAppointment}
            onLogout={handleLogout}
            onGoHome={handleGoHome}
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
          />

          <NewAppointmentModal
            isOpen={newAppointmentOpen}
            onClose={() => setNewAppointmentOpen(false)}
            onSave={handleCreateAppointment}
            doctors={doctors}
            patients={patients}
            initialPatientId={ptData.id}
            initialDoctorId={initialDoctorForAppointment}
            initialComplaint={initialComplaintForAppointment}
          />
        </>
      );
    }

    // 2. Role Guard: Doctor Dashboard (/dashboard/doctor)
    if (currentPath === '/dashboard/doctor') {
      if (currentUser.role !== 'doctor') {
        showToast(
          'Access Denied',
          `Your account role (${currentUser.role}) cannot access the Doctor portal. Redirecting to your assigned dashboard.`,
          'alert'
        );
        navigate(getRoleDashboardPath(currentUser.role));
        return null;
      }

      const docData: DoctorRecord =
        currentUser.doctorData ||
        doctors.find((d) => d.id === currentUser.id || (d.email && d.email.toLowerCase() === currentUser.email.toLowerCase())) || {
          id: currentUser.id,
          name: currentUser.name.startsWith('Dr.') ? currentUser.name : `Dr. ${currentUser.name}`,
          title: currentUser.title || 'Attending Physician',
          specialty: currentUser.department || 'General Medicine',
          department: currentUser.department || 'General Medicine',
          room: 'Suite 201',
          status: 'Available',
          patientsToday: 0,
          consultationsCompleted: 0,
          rating: 5.0,
          phone: '(555) 012-3456',
          email: currentUser.email,
          avatarGradient: currentUser.avatarGradient || 'from-blue-600 to-teal-500',
        };

      return (
        <>
          {renderToasts()}
          {renderAiAssistant()}

          <DoctorPortal
            user={currentUser}
            doctor={docData}
            appointments={appointments}
            patients={patients}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onOpenNewAppointment={() => handleOpenBookAppointment(docData.id)}
            onLogout={handleLogout}
            onGoHome={handleGoHome}
          />

          <NewAppointmentModal
            isOpen={newAppointmentOpen}
            onClose={() => setNewAppointmentOpen(false)}
            onSave={handleCreateAppointment}
            doctors={doctors}
            patients={patients}
            initialDoctorId={initialDoctorForAppointment}
            initialComplaint={initialComplaintForAppointment}
          />
        </>
      );
    }

    // 3. Role Guard: Unified Clinic Staff Dashboard (/dashboard/staff, /dashboard/admin, /dashboard/clinic-staff)
    if (
      currentPath === '/dashboard/staff' ||
      currentPath === '/dashboard/admin' ||
      currentPath === '/dashboard/clinic-staff'
    ) {
      const isStaffOrAdmin =
        currentUser.role === 'clinic_staff' ||
        (currentUser.role as any) === 'staff' ||
        (currentUser.role as any) === 'admin';

      if (!isStaffOrAdmin) {
        showToast(
          'Access Denied',
          `Your account role (${currentUser.role}) cannot access the Clinic Staff operations hub. Redirecting to your assigned dashboard.`,
          'alert'
        );
        navigate(getRoleDashboardPath(currentUser.role));
        return null;
      }
    } else {
      // Catch-all for any other /dashboard/* paths: redirect to authorized dashboard
      navigate(getRoleDashboardPath(currentUser.role));
      return null;
    }

    // Render Unified Clinic Staff Dashboard
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col selection:bg-teal-500 selection:text-white">
        {renderToasts()}

        {/* Sidebar with verified currentUser role access */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          stats={{
            totalPatients: stats?.totalPatients,
            todayAppointments: stats?.todayAppointments,
            activeDoctorsOnDuty: stats?.activeDoctorsOnDuty,
            roomOccupancyRate: stats?.roomOccupancyRate,
            emergencyCasesToday: stats?.emergencyCasesToday,
          }}
          currentUser={currentUser}
          onOpenReports={() => setReportsModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
            collapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
        >
          {/* Top Header */}
          <Header
            activeView={activeView}
            onNavigate={setActiveView}
            onOpenNewAppointment={() => handleOpenBookAppointment()}
            onOpenAddPatient={() => setRegisterPatientOpen(true)}
            onOpenReports={() => setReportsModalOpen(true)}
            onToggleMobileMenu={() => setMobileOpen(true)}
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={setSelectedTimeframe}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            currentUser={currentUser}
            onGoHome={handleGoHome}
            onLogout={handleLogout}
          />

          {/* View Component Rendering */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {activeView === 'dashboard' && (
              <AdminDashboard
                stats={stats}
                doctors={doctors}
                patients={patients}
                currentUser={currentUser}
                onNavigate={setActiveView}
                onOpenNewAppointment={() => handleOpenBookAppointment()}
                onOpenAddPatient={() => setRegisterPatientOpen(true)}
                onOpenViewReports={() => setReportsModalOpen(true)}
                onSelectAppointment={(apt) => {
                  const pt = patients.find((p) => p.id === apt.patientId);
                  if (pt) setSelectedPatientForDetail(pt);
                }}
                onSelectDoctor={(doc) => setSelectedDoctorForSchedule(doc)}
                onSelectPatient={(pt) => setSelectedPatientForDetail(pt)}
                appointments={appointments}
                onUpdateAppointmentStatus={(id, st) => handleUpdateAppointmentStatus(id, st)}
                selectedTimeframe={selectedTimeframe}
                onTimeframeChange={setSelectedTimeframe}
                onRefreshData={loadData}
                isLoading={isDataLoading}
                error={dataError}
                onRetry={loadData}
              />
            )}

            {activeView === 'queue' && (
              <StaffDashboard
                currentUser={currentUser}
                appointments={appointments}
                patients={patients}
                doctors={doctors}
                onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
                onOpenNewAppointment={() => handleOpenBookAppointment()}
                onOpenRegisterPatient={() => setRegisterPatientOpen(true)}
                onSelectPatient={(pt) => setSelectedPatientForDetail(pt)}
                onLogout={handleLogout}
                onGoHome={handleGoHome}
                onRefreshData={loadData}
                embedded={true}
              />
            )}

            {activeView === 'appointments' && (
              <AppointmentManagement
                appointments={appointments}
                onOpenNewAppointment={() => handleOpenBookAppointment()}
                onSelectAppointment={(apt) => {
                  const pt = patients.find((p) => p.id === apt.patientId);
                  if (pt) setSelectedPatientForDetail(pt);
                }}
                onUpdateStatus={handleUpdateAppointmentStatus}
                searchQuery={searchQuery}
              />
            )}

            {activeView === 'patients' && (
              <PatientManagement
                patients={patients}
                onSelectPatient={(pt) => setSelectedPatientForDetail(pt)}
                onOpenRegisterModal={() => setRegisterPatientOpen(true)}
                searchQuery={searchQuery}
              />
            )}

            {activeView === 'doctors' && (
              <DoctorManagement
                doctors={doctors}
                onSelectDoctor={(doc) => setSelectedDoctorForSchedule(doc)}
                onOpenBookAppointment={(docId) => handleOpenBookAppointment(docId)}
              />
            )}

            {activeView === 'staff' && (
              <StaffManagement currentUser={currentUser} />
            )}

            {activeView === 'diseases' && <DiseaseAnalytics diseases={diseases} />}

            {activeView === 'insights' && (
              <AIClinicInsights
                insights={insights}
                onUpdateStatus={handleUpdateInsight}
                onOpenBookAppointment={handleOpenBookAppointment}
                onOpenReports={() => setReportsModalOpen(true)}
              />
            )}

            {activeView === 'departments' && (
              <DepartmentsManagement
                departments={stats?.departmentPerformance}
                doctors={doctors}
                patients={patients}
                onSelectDoctor={(doc) => setSelectedDoctorForSchedule(doc)}
                onNavigateToAppointments={() => setActiveView('appointments')}
              />
            )}

            {activeView === 'reports' && (
              <ReportsAnalyticsView 
                stats={stats} 
                onExport={handleExportReports}
                isLoading={isDataLoading}
                error={dataError}
                onRetry={loadData}
              />
            )}

            {activeView === 'contact' && <ContactSupportView />}

            {activeView === 'settings' && <ClinicSettingsView />}

            {activeView === 'clinic_data' && (
              <ClinicDataTableView onBackToDashboard={() => setActiveView('dashboard')} />
            )}
          </main>
        </div>

        {/* Modals */}
        <NewAppointmentModal
          isOpen={newAppointmentOpen}
          onClose={() => setNewAppointmentOpen(false)}
          onSave={handleCreateAppointment}
          doctors={doctors}
          patients={patients}
          initialDoctorId={initialDoctorForAppointment}
          initialComplaint={initialComplaintForAppointment}
        />

        <PatientDetailModal
          patient={selectedPatientForDetail}
          onClose={() => setSelectedPatientForDetail(null)}
          onBookAppointment={() => handleOpenBookAppointment()}
        />

        <RegisterPatientModal
          isOpen={registerPatientOpen}
          onClose={() => setRegisterPatientOpen(false)}
          onSave={handleRegisterPatient}
          doctors={doctors}
        />

        <DoctorScheduleModal
          doctor={selectedDoctorForSchedule}
          onClose={() => setSelectedDoctorForSchedule(null)}
          onBookAppointment={(docId) => handleOpenBookAppointment(docId)}
        />

        <ClinicalReportsModal
          isOpen={reportsModalOpen}
          onClose={() => setReportsModalOpen(false)}
          stats={stats}
          onExport={handleExportReports}
        />

        {renderAiAssistant()}
      </div>
    );
  }

  // Default: Home Landing Page
  return (
    <>
      {renderToasts()}
      {renderAiAssistant()}
      <LandingPage
        onGetStarted={() => handleOpenLogin('clinic_staff')}
        onSignIn={(role) => handleOpenLogin(role || 'clinic_staff')}
        currentUser={currentUser}
        onGoToDashboard={() => navigate('/dashboard')}
        onLogout={handleLogout}
      />
    </>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <MainClinicApp />
    </RouterProvider>
  );
}
