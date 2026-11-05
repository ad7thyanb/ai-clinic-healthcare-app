import { 
  DashboardStats, 
  PatientRecord, 
  AppointmentRecord, 
  DoctorRecord, 
  DiseaseRecord, 
  ClinicInsight 
} from '../types/clinic';
import { 
  INITIAL_DASHBOARD_STATS, 
  INITIAL_PATIENTS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_DOCTORS, 
  INITIAL_DISEASES, 
  INITIAL_INSIGHTS 
} from '../mock/clinicData';
import { 
  fetchClinicDataFromSupabase, 
  fetchDistinctDoctorsFromSupabase, 
  SupabaseClinicDataResult 
} from '../services/supabaseClinicService';
import { isSupabaseConfigured } from '../lib/supabase';

// In-memory / LocalStorage backed reactive mock state
const STORAGE_PREFIX = 'ai_clinic_mock_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save to localStorage', e);
  }
}

// State holders
let patientsState: PatientRecord[] = loadFromStorage('patients', INITIAL_PATIENTS);
let appointmentsState: AppointmentRecord[] = loadFromStorage('appointments', INITIAL_APPOINTMENTS);
let doctorsState: DoctorRecord[] = loadFromStorage('doctors', INITIAL_DOCTORS);
let diseasesState: DiseaseRecord[] = loadFromStorage('diseases', INITIAL_DISEASES);
let insightsState: ClinicInsight[] = loadFromStorage('insights', INITIAL_INSIGHTS);
let statsState: DashboardStats = loadFromStorage('stats', INITIAL_DASHBOARD_STATS);

// Live Supabase dataset cache to prevent redundant simultaneous queries
let cachedSupabaseData: SupabaseClinicDataResult | null = null;
let lastFetchTimestamp = 0;
const CACHE_LIFETIME = 15000; // 15 seconds

export function invalidateClinicDataCache() {
  cachedSupabaseData = null;
  lastFetchTimestamp = 0;
}

// In-flight promise tracker to deduplicate simultaneous callers
let inFlightClinicPromise: Promise<SupabaseClinicDataResult | null> | null = null;

export async function getLiveClinicData(): Promise<SupabaseClinicDataResult | null> {
  if (!isSupabaseConfigured()) return null;
  const now = Date.now();
  if (cachedSupabaseData && now - lastFetchTimestamp < CACHE_LIFETIME) {
    return cachedSupabaseData;
  }
  if (inFlightClinicPromise) {
    return inFlightClinicPromise;
  }

  inFlightClinicPromise = (async () => {
    try {
      const res = await fetchClinicDataFromSupabase();
      cachedSupabaseData = res;
      lastFetchTimestamp = Date.now();
      return res;
    } catch (err: any) {
      console.warn('[clinicApi] Live Supabase fetch encountered issue, falling back gracefully:', err?.message || err);
      cachedSupabaseData = null;
      return null;
    } finally {
      inFlightClinicPromise = null;
    }
  })();

  return inFlightClinicPromise;
}

export async function fetchDashboardStats(timeframe: 'today' | 'week' | 'month' = 'today'): Promise<DashboardStats> {
  // Requirement 1 & 4: Prioritize real Supabase clinic data calculations without downloading 30k records
  if (isSupabaseConfigured()) {
    const live = await getLiveClinicData();
    if (live) {
      return live.stats;
    }
  }

  try {
    const res = await fetch('/api/dashboard/stats');
    if (res.ok) {
      const data = await res.json();
      if (data) {
        return {
          ...statsState,
          totalPatients: data.totalPatients || statsState.totalPatients,
          todayAppointments: data.todayAppointments || statsState.todayAppointments,
          appointmentsCompletedToday: data.completedAppointments || statsState.appointmentsCompletedToday,
          emergencyCasesToday: appointmentsState.filter((a) => a.type === 'Emergency' || a.priority === 'Critical').length,
          avgWaitingTime: data.avgWaitingTime || statsState.avgWaitingTime,
          appointmentTrend: Array.isArray(data.appointmentTrend) && data.appointmentTrend.length > 0 ? data.appointmentTrend : statsState.appointmentTrend,
          topDiseases: diseasesState,
          recentInsights: insightsState,
        };
      }
    }
  } catch {
    // fallback
  }

  return statsState;
}

export async function fetchPatients(search = '', department = 'All', triage = 'All'): Promise<PatientRecord[]> {
  if (isSupabaseConfigured()) {
    const live = await getLiveClinicData();
    if (live && live.patients.length > 0) {
      let list = [...live.patients];
      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter(p => 
          p.name.toLowerCase().includes(q) ||
          p.mrn.toLowerCase().includes(q) ||
          p.primaryDiagnosis.toLowerCase().includes(q) ||
          p.assignedDoctor.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q)
        );
      }
      if (department !== 'All') {
        list = list.filter(p => p.department.toLowerCase() === department.toLowerCase());
      }
      if (triage !== 'All') {
        list = list.filter(p => p.triageStatus.toLowerCase() === triage.toLowerCase());
      }
      return list;
    }
  }

  try {
    const res = await fetch('/api/patients');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.patients) && data.patients.length > 0) {
        const mappedPatients: PatientRecord[] = data.patients.map((p: any) => ({
          id: p.id || p.patient_id || `PT-${Math.floor(10500 + Math.random() * 1000)}`,
          mrn: p.mrn || `MRN-${Math.floor(80000 + Math.random() * 10000)}`,
          name: p.name || p.patient_name || 'Patient',
          age: p.age || 40,
          gender: p.gender || 'Other',
          phone: p.phone || '+1 (555) 000-0000',
          email: p.email || `${(p.name || 'patient').toLowerCase().replace(/\s+/g, '')}@example.com`,
          bloodType: p.bloodType || p.blood_type || 'O+',
          primaryDiagnosis: p.primaryDiagnosis || p.disease || p.diagnosis || 'Clinical Consultation',
          assignedDoctor: p.assignedDoctor || p.doctor_name || 'Dr. Sarah Chen, MD',
          department: p.department || 'General Medicine',
          lastVisit: p.lastVisit || p.appointment_date || new Date().toISOString().split('T')[0],
          triageStatus: p.triageStatus || (p.priority === 'Critical' ? 'Urgent' : 'Normal'),
          vitals: p.vitals || { bp: '120/80', hr: 72, spo2: 98, temp: 98.6, glucose: 95 },
          allergies: Array.isArray(p.allergies) ? p.allergies : [],
          medications: Array.isArray(p.medications) ? p.medications : [],
          insurance: p.insurance || p.insuranceProvider || 'Standard Insurance',
          medicalHistory: Array.isArray(p.medicalHistory) ? p.medicalHistory : [],
          avatarGradient: p.avatarGradient || 'from-blue-600 to-indigo-600',
        }));
        const existingIds = new Set(mappedPatients.map(mp => mp.id));
        patientsState = [...mappedPatients, ...patientsState.filter(ep => !existingIds.has(ep.id))];
        saveToStorage('patients', patientsState);
      }
    }
  } catch {
    // fallback
  }

  let list = [...patientsState];
  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.primaryDiagnosis.toLowerCase().includes(q) ||
      p.assignedDoctor.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q)
    );
  }
  if (department !== 'All') {
    list = list.filter(p => p.department.toLowerCase() === department.toLowerCase());
  }
  if (triage !== 'All') {
    list = list.filter(p => p.triageStatus.toLowerCase() === triage.toLowerCase());
  }
  return list;
}

export async function addPatient(patient: Omit<PatientRecord, 'id' | 'mrn'>): Promise<PatientRecord> {
  try {
    const token = localStorage.getItem('ai_clinic_token');
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(patient),
    });
    if (res.ok) {
      const serverPt = await res.json();
      patientsState = [serverPt, ...patientsState.filter(p => p.id !== serverPt.id)];
      saveToStorage('patients', patientsState);
      return serverPt;
    }
  } catch {
    // fallback
  }

  const newId = `PT-${Math.floor(10500 + Math.random() * 1000)}`;
  const newMrn = `MRN-${Math.floor(80000 + Math.random() * 10000)}`;
  const newRecord: PatientRecord = {
    ...patient,
    id: newId,
    mrn: newMrn,
  };
  patientsState = [newRecord, ...patientsState];
  saveToStorage('patients', patientsState);
  return newRecord;
}

export async function fetchAppointments(filter = 'All', search = ''): Promise<AppointmentRecord[]> {
  if (isSupabaseConfigured()) {
    const live = await getLiveClinicData();
    if (live && live.appointments.length > 0) {
      let list = [...live.appointments];
      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter(a => 
          a.patientName.toLowerCase().includes(q) ||
          a.doctorName.toLowerCase().includes(q) ||
          a.department.toLowerCase().includes(q) ||
          a.chiefComplaint.toLowerCase().includes(q) ||
          a.room.toLowerCase().includes(q)
        );
      }
      if (filter !== 'All') {
        list = list.filter(a => a.status.toLowerCase() === filter.toLowerCase() || a.priority.toLowerCase() === filter.toLowerCase());
      }
      return list;
    }
  }

  try {
    const res = await fetch('/api/appointments');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.appointments) && data.appointments.length > 0) {
        appointmentsState = data.appointments;
        saveToStorage('appointments', appointmentsState);
      }
    }
  } catch {
    // fallback
  }

  let list = [...appointmentsState];
  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(a => 
      a.patientName.toLowerCase().includes(q) ||
      a.doctorName.toLowerCase().includes(q) ||
      a.department.toLowerCase().includes(q) ||
      a.chiefComplaint.toLowerCase().includes(q) ||
      a.room.toLowerCase().includes(q)
    );
  }
  if (filter !== 'All') {
    list = list.filter(a => a.status.toLowerCase() === filter.toLowerCase() || a.priority.toLowerCase() === filter.toLowerCase());
  }
  return list;
}

export async function addAppointment(appointmentData: Omit<AppointmentRecord, 'id'>): Promise<AppointmentRecord> {
  try {
    const token = localStorage.getItem('ai_clinic_token');
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(appointmentData),
    });
    if (res.ok) {
      const serverApt = await res.json();
      appointmentsState = [serverApt, ...appointmentsState.filter(a => a.id !== serverApt.id)];
      saveToStorage('appointments', appointmentsState);
      return serverApt;
    } else {
      const errData = await res.json().catch(() => ({}));
      if (res.status === 409) {
        throw new Error(errData.error || 'Conflict: Doctor already has an appointment scheduled at this time.');
      }
    }
  } catch (err: any) {
    if (err.message?.includes('Conflict')) {
      throw err;
    }
  }

  const newId = `APT-${Math.floor(8831 + Math.random() * 900)}`;
  const newRecord: AppointmentRecord = {
    ...appointmentData,
    id: newId,
  };
  appointmentsState = [newRecord, ...appointmentsState];
  saveToStorage('appointments', appointmentsState);
  return newRecord;
}

export async function updateAppointmentStatus(
  id: string, 
  status: AppointmentRecord['status'], 
  checkedIn?: boolean
): Promise<AppointmentRecord> {
  try {
    const token = localStorage.getItem('ai_clinic_token');
    if (status === 'Cancelled') {
      await fetch(`/api/appointments/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason: 'Status updated by clinic' }),
      });
    } else if (checkedIn || status === 'Waiting') {
      await fetch(`/api/appointments/${id}/check-in`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } else {
      await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status, checkedIn }),
      });
    }
  } catch {
    // ignore
  }

  appointmentsState = appointmentsState.map(apt => {
    if (apt.id === id) {
      return {
        ...apt,
        status,
        checkedIn: checkedIn !== undefined ? checkedIn : apt.checkedIn,
      };
    }
    return apt;
  });
  saveToStorage('appointments', appointmentsState);
  const updated = appointmentsState.find(a => a.id === id)!;
  return updated;
}

export async function fetchDoctors(department = 'All'): Promise<DoctorRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const sbDoctors = await fetchDistinctDoctorsFromSupabase();
      if (sbDoctors && sbDoctors.length > 0) {
        doctorsState = sbDoctors;
        saveToStorage('doctors', sbDoctors);
        if (department === 'All') return sbDoctors;
        return sbDoctors.filter(d => (d.department || '').toLowerCase() === department.toLowerCase());
      }
    } catch (err) {
      console.warn('Direct distinct Supabase doctor fetch failed, trying live clinic data aggregate:', err);
    }

    try {
      const live = await getLiveClinicData();
      if (live && live.doctors && live.doctors.length > 0) {
        if (department === 'All') return live.doctors;
        return live.doctors.filter(d => (d.department || '').toLowerCase() === department.toLowerCase());
      }
    } catch (err) {
      console.warn('Live clinic data fetch failed in fetchDoctors:', err);
    }
  }

  try {
    const res = await fetch('/api/doctors');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.doctors) && data.doctors.length > 0) {
        const mapped: DoctorRecord[] = data.doctors.map((d: any, idx: number) => ({
          id: d.id || `DOC-${idx + 101}`,
          name: d.name || d.doctor_name || 'Attending Physician',
          title: d.title || 'Attending Physician',
          specialty: d.specialty || `${d.department || 'General Medicine'} Specialist`,
          department: d.department || 'General Medicine',
          rating: Number(d.rating) || 4.9,
          status: d.status || 'Available',
          room: d.room || `Suite ${idx + 101}`,
          patientsToday: d.patientsToday ?? d.patient_load ?? 0,
          consultationsCompleted: d.consultationsCompleted ?? 0,
          avgConsultationTime: d.avgConsultationTime || d.avg_consultation_time || 18,
          avgWaitingTime: d.avgWaitingTime || d.avg_waiting_time || 8,
          avatarGradient: d.avatarGradient || 'from-blue-600 to-cyan-500',
          email: d.email || `${(d.name || d.doctor_name || 'doctor').toLowerCase().replace(/[^a-z]/g, '')}@clinic.health`,
          phone: d.phone || `+1 (555) 012-${String(idx + 100).padStart(4, '0')}`,
          availableDays: d.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          workingHours: d.workingHours || { start: '08:30', end: '17:00' },
          consultationFee: d.consultationFee || 160,
          qualifications: d.qualifications || ['Board Certified Specialist'],
          bio: d.bio || `${d.name || d.doctor_name || 'Physician'} is an attending physician at AI Clinic.`,
        }));
        doctorsState = mapped;
        saveToStorage('doctors', mapped);
      }
    }
  } catch {
    // fallback
  }

  if (department === 'All') return doctorsState;
  return doctorsState.filter(d => (d.department || '').toLowerCase() === department.toLowerCase());
}

export async function fetchDiseases(): Promise<DiseaseRecord[]> {
  if (isSupabaseConfigured()) {
    const live = await getLiveClinicData();
    if (live && live.diseases.length > 0) {
      return live.diseases;
    }
  }
  return diseasesState;
}

export async function fetchInsights(): Promise<ClinicInsight[]> {
  if (isSupabaseConfigured()) {
    const live = await getLiveClinicData();
    if (live && live.insights.length > 0) {
      return live.insights;
    }
  }
  return insightsState;
}

export async function updateInsightStatus(id: string, status: ClinicInsight['status']): Promise<ClinicInsight> {
  insightsState = insightsState.map(ins => {
    if (ins.id === id) {
      return { ...ins, status };
    }
    return ins;
  });
  saveToStorage('insights', insightsState);
  return insightsState.find(i => i.id === id)!;
}

export function resetMockData() {
  localStorage.removeItem(STORAGE_PREFIX + 'patients');
  localStorage.removeItem(STORAGE_PREFIX + 'appointments');
  localStorage.removeItem(STORAGE_PREFIX + 'doctors');
  localStorage.removeItem(STORAGE_PREFIX + 'diseases');
  localStorage.removeItem(STORAGE_PREFIX + 'insights');
  localStorage.removeItem(STORAGE_PREFIX + 'stats');
  patientsState = [...INITIAL_PATIENTS];
  appointmentsState = [...INITIAL_APPOINTMENTS];
  doctorsState = [...INITIAL_DOCTORS];
  diseasesState = [...INITIAL_DISEASES];
  insightsState = [...INITIAL_INSIGHTS];
  statsState = { ...INITIAL_DASHBOARD_STATS };
}

// -------------------------------------------------------------
// DYNAMIC LIVE CLINIC STATUS SERVICE
// Structured for seamless MySQL backend connection or in-memory EHR state
// -------------------------------------------------------------

export interface DoctorLiveItem {
  id: string;
  name: string;
  specialty: string;
  department: string;
  room: string;
  avatarGradient: string;
  status: 'Available' | 'In Consultation' | 'Waiting' | 'Completed' | 'Unavailable';
  patientsToday: number;
  consultationsCompleted: number;
  currentPatient?: string;
  nextAvailable: string;
}

export interface AppointmentLiveItem {
  id: string;
  patientName: string;
  doctorName: string;
  department: string;
  time: string;
  room: string;
  type: string;
  status: 'Scheduled' | 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled';
  priority: 'Critical' | 'High' | 'Normal' | 'Routine';
  waitTimeMinutes: number;
}

export interface WaitingQueueItem {
  appointmentId: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  department: string;
  room: string;
  time: string;
  waitTimeMinutes: number;
  priority: 'Critical' | 'High' | 'Normal' | 'Routine';
  chiefComplaint: string;
}

export interface LiveClinicStatus {
  dataSource: 'mysql' | 'application_state';
  isDatabaseConnected: boolean;
  databaseDetails?: {
    host?: string;
    database?: string;
    table?: string;
    message?: string;
  };
  lastUpdated: string;
  timestamp: number;
  doctorCounts: {
    available: number;
    inConsultation: number;
    waiting: number;
    completed: number;
    unavailable: number;
    total: number;
  };
  doctors: DoctorLiveItem[];
  appointmentCounts: {
    scheduled: number;
    waiting: number;
    inConsultation: number;
    completed: number;
    cancelled: number;
    total: number;
  };
  appointments: AppointmentLiveItem[];
  waitingQueue: {
    totalWaiting: number;
    avgWaitTimeMinutes: number;
    patients: WaitingQueueItem[];
  };
  systemTelemetry: {
    uptime: string;
    serverLatency: string;
    hl7FhirStatus: 'Operational' | 'Syncing';
    databaseEngine: string;
  };
}

export async function fetchLiveClinicStatus(): Promise<LiveClinicStatus> {
  // 1. Check if real MySQL backend endpoint is accessible & connected
  let isDbConnected = false;
  let dbDetails = undefined;

  try {
    const res = await fetch('/api/live-status');
    if (res.ok) {
      const data = await res.json();
      if (data.connected && data.dataSource === 'mysql') {
        isDbConnected = true;
        dbDetails = {
          host: 'localhost:3306',
          database: 'ai_clinic_new',
          table: 'clinic_data',
          message: 'Connected to live MySQL database',
        };
      }
    }
  } catch {
    // Backend API fetch failed or dev server in offline mode
    isDbConnected = false;
  }

  const nowFormatted = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });

  // 2. Compute dynamic Live Status from actual Application Records State
  // If doctors/appointments change anywhere in the app, this updates reactively!
  
  // Find in-progress appointment for each doctor
  const liveDoctors: DoctorLiveItem[] = doctorsState.map(doc => {
    const activeAppt = appointmentsState.find(
      a => (a.doctorId === doc.id || a.doctorName.toLowerCase().includes(doc.name.toLowerCase().replace('dr. ', ''))) &&
           (a.status === 'In Progress' || a.status === 'Urgent Triage')
    );
    const waitingAppt = appointmentsState.find(
      a => (a.doctorId === doc.id || a.doctorName.toLowerCase().includes(doc.name.toLowerCase().replace('dr. ', ''))) &&
           (a.checkedIn && a.status !== 'Completed' && a.status !== 'In Progress')
    );

    let calculatedStatus: DoctorLiveItem['status'] = 'Available';

    if (activeAppt) {
      calculatedStatus = 'In Consultation';
    } else if (waitingAppt) {
      calculatedStatus = 'Waiting';
    } else if (doc.status === 'In Surgery' || doc.status === 'On Break' || doc.status === 'Off Duty') {
      calculatedStatus = 'Unavailable';
    } else if ((doc.consultationsCompleted ?? 0) >= (doc.patientsToday ?? 0) && (doc.patientsToday ?? 0) > 0) {
      calculatedStatus = 'Completed';
    } else {
      calculatedStatus = 'Available';
    }

    return {
      id: doc.id,
      name: doc.name,
      specialty: doc.specialty,
      department: doc.department,
      room: doc.room,
      avatarGradient: doc.avatarGradient,
      status: calculatedStatus,
      patientsToday: doc.patientsToday ?? 0,
      consultationsCompleted: doc.consultationsCompleted ?? 0,
      currentPatient: activeAppt?.patientName,
      nextAvailable: doc.nextAvailable || '10:00 AM',
    };
  });

  // Doctor Counts across the 5 required categories
  const doctorCounts = {
    available: liveDoctors.filter(d => d.status === 'Available').length,
    inConsultation: liveDoctors.filter(d => d.status === 'In Consultation').length,
    waiting: liveDoctors.filter(d => d.status === 'Waiting').length,
    completed: liveDoctors.filter(d => d.status === 'Completed').length,
    unavailable: liveDoctors.filter(d => d.status === 'Unavailable').length,
    total: liveDoctors.length,
  };

  // Appointment Status Mapping into the 5 required categories:
  // Scheduled, Waiting, In Consultation, Completed, Cancelled
  const liveAppointments: AppointmentLiveItem[] = appointmentsState.map(apt => {
    let mappedStatus: AppointmentLiveItem['status'] = 'Scheduled';

    if (apt.status === 'In Progress' || apt.status === 'Urgent Triage') {
      mappedStatus = 'In Consultation';
    } else if (apt.status === 'Completed') {
      mappedStatus = 'Completed';
    } else if (apt.status === 'Cancelled') {
      mappedStatus = 'Cancelled';
    } else if (apt.checkedIn) {
      mappedStatus = 'Waiting';
    } else {
      mappedStatus = 'Scheduled';
    }

    return {
      id: apt.id,
      patientName: apt.patientName,
      doctorName: apt.doctorName,
      department: apt.department,
      time: apt.time,
      room: apt.room,
      type: apt.type,
      status: mappedStatus,
      priority: apt.priority,
      waitTimeMinutes: apt.waitTimeMinutes || (mappedStatus === 'Waiting' ? 12 : 0),
    };
  });

  const appointmentCounts = {
    scheduled: liveAppointments.filter(a => a.status === 'Scheduled').length,
    waiting: liveAppointments.filter(a => a.status === 'Waiting').length,
    inConsultation: liveAppointments.filter(a => a.status === 'In Consultation').length,
    completed: liveAppointments.filter(a => a.status === 'Completed').length,
    cancelled: liveAppointments.filter(a => a.status === 'Cancelled').length,
    total: liveAppointments.length,
  };

  // Waiting Queue Items
  const waitingPatientsList: WaitingQueueItem[] = appointmentsState
    .filter(a => (a.checkedIn && a.status !== 'Completed' && a.status !== 'In Progress') || a.status === 'Scheduled' && a.waitTimeMinutes && a.waitTimeMinutes > 0)
    .map((a, idx) => ({
      appointmentId: a.id,
      patientName: a.patientName,
      patientId: a.patientId,
      doctorName: a.doctorName,
      department: a.department,
      room: a.room,
      time: a.time,
      waitTimeMinutes: a.waitTimeMinutes || (8 + idx * 4),
      priority: a.priority,
      chiefComplaint: a.chiefComplaint,
    }))
    .sort((a, b) => b.waitTimeMinutes - a.waitTimeMinutes);

  const avgWaitTime = waitingPatientsList.length > 0
    ? Math.round(waitingPatientsList.reduce((acc, curr) => acc + curr.waitTimeMinutes, 0) / waitingPatientsList.length)
    : 8;

  return {
    dataSource: isDbConnected ? 'mysql' : 'application_state',
    isDatabaseConnected: isDbConnected,
    databaseDetails: dbDetails || {
      host: 'localhost:3306',
      database: 'ai_clinic_new',
      table: 'clinic_data',
      message: 'Database currently disconnected. Dynamic status running on active application EHR state.',
    },
    lastUpdated: nowFormatted,
    timestamp: Date.now(),
    doctorCounts,
    doctors: liveDoctors,
    appointmentCounts,
    appointments: liveAppointments,
    waitingQueue: {
      totalWaiting: waitingPatientsList.length,
      avgWaitTimeMinutes: avgWaitTime,
      patients: waitingPatientsList,
    },
    systemTelemetry: {
      uptime: '99.98%',
      serverLatency: '14ms',
      hl7FhirStatus: 'Operational',
      databaseEngine: isDbConnected ? 'MySQL 8.0 (Live Connected)' : 'Application EHR Memory Engine (MySQL Ready)',
    },
  };
}

export interface CsvPreviewRow {
  rowIndex: number;
  id: string;
  patientId: string;
  patientName: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: string;
  priority: string;
  type: string;
  room: string;
  chiefComplaint: string;
  disease: string;
  waitingTime: number;
  consultationDuration: number;
  revenue: number;
  notes: string;
  isValid: boolean;
  isDuplicate: boolean;
  validationErrors: string[];
  duplicateReason?: string;
}

export interface CsvPreviewResponse {
  success: boolean;
  totalRows: number;
  validRowsCount: number;
  duplicateCount: number;
  invalidCount: number;
  headers: string[];
  matchedColumns: Record<string, string>;
  missingRequired: string[];
  previewRows: CsvPreviewRow[];
  duplicates: CsvPreviewRow[];
  errors: Array<{ row: number; errors: string[] }>;
  schemaStatus: {
    mysqlConnected: boolean;
    database: string;
    table: string;
    columns: string[];
    error?: string;
  };
}

export interface CsvImportResponse {
  success: boolean;
  message: string;
  importedCount: number;
  duplicatesSkipped: number;
  invalidSkipped: number;
  mysqlInserted: boolean;
  persistentStoreUpdated: boolean;
  skippedDetails: Array<{
    row: number;
    patient: string;
    doctor: string;
    date: string;
    time: string;
    reason: string;
  }>;
}

export async function previewClinicCsv(csvContent: string): Promise<CsvPreviewResponse> {
  const res = await fetch('/api/csv/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csvContent }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to preview CSV: HTTP ${res.status}`);
  }
  return res.json();
}

export async function importClinicCsv(csvContent: string): Promise<CsvImportResponse> {
  const token = localStorage.getItem('ai_clinic_token');
  const res = await fetch('/api/csv/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ csvContent }),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to import CSV: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchSampleClinicCsv(): Promise<{ csvContent: string; filename: string }> {
  const res = await fetch('/api/csv/sample-template');
  if (!res.ok) {
    throw new Error('Failed to load sample CSV template.');
  }
  return res.json();
}

export async function fetchClinicCsvSchema(): Promise<any> {
  const res = await fetch('/api/csv/schema');
  if (!res.ok) {
    throw new Error('Failed to fetch clinic schema.');
  }
  return res.json();
}

