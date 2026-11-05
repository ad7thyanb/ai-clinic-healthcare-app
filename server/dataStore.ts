import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'clinic_store.json');

// Interface Definitions
export type ApplicationRole = 'patient' | 'doctor' | 'clinic_staff';

export interface User {
  id: string;
  email: string;
  passwordHash: string; // Plain/hashed comparison
  name: string;
  role: ApplicationRole;
  title?: string;
  department?: string;
  status: 'active' | 'pending_approval' | 'suspended';
  emailVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: number;
  createdAt: string;
  patientId?: string;
  doctorId?: string;
  avatarGradient?: string;
}

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  bloodType: string;
  allergies: string[];
  department: string;
  assignedDoctor: string;
  primaryDiagnosis: string;
  admissionDate: string;
  lastVisit: string;
  triageStatus: 'Critical' | 'Urgent' | 'Stable' | 'Discharged';
  insuranceProvider: string;
  insurancePolicyNumber: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  department: string;
  title: string;
  qualifications: string[];
  experienceYears: number;
  room: string;
  phone: string;
  bio: string;
  status: 'approved' | 'pending_approval' | 'inactive';
  availableDays: string[];
  workingHours: {
    start: string;
    end: string;
  };
  consultationFee: number;
  rating: number;
  avatarGradient: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (e.g. "09:30")
  type: 'In-Person' | 'Video Consultation' | 'Follow-up' | 'Emergency';
  status: 'Scheduled' | 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'Critical' | 'High' | 'Normal' | 'Routine';
  chiefComplaint: string;
  room: string;
  notes?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  rescheduledFrom?: {
    date: string;
    time: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalDocument {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  appointmentId?: string;
  type: 'Consultation Note' | 'Prescription' | 'Lab Report' | 'Discharge Summary';
  title: string;
  content: string;
  prescriptionItems?: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  status: 'draft' | 'finalized' | 'released';
  finalizedAt?: string;
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: string;
  ipAddress?: string;
}

export interface StaffInvitation {
  id: string;
  email: string;
  role: 'clinic_staff' | 'doctor' | 'staff' | 'admin';
  department?: string;
  inviteCode: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired';
}

export interface StoreData {
  users: User[];
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  clinicalDocuments: ClinicalDocument[];
  auditLogs: AuditLog[];
  staffInvitations: StaffInvitation[];
}

export function normalizeAppRole(rawRole: any, email?: string): ApplicationRole {
  if (!rawRole) return 'patient';
  const str = String(rawRole).trim().toLowerCase().replace(/[-_\s]+/g, '');
  if (['patient', 'patients', 'pt', 'client'].includes(str)) return 'patient';
  if (['doctor', 'doctors', 'doc', 'physician', 'md', 'attending'].includes(str)) return 'doctor';
  // All admin, administrator, staff, clinic, coordinator aliases normalize to clinic_staff
  return 'clinic_staff';
}

// Initial Seed Data
const INITIAL_STORE: StoreData = {
  users: [
    {
      id: 'USR-ADMIN-1',
      email: 'admin@aura-health.org',
      passwordHash: 'ClinicSecure2026!',
      name: 'Dr. Sarah Chen, MD',
      role: 'clinic_staff',
      title: 'Chief Medical Officer / Clinic Staff',
      department: 'Hospital Administration',
      status: 'active',
      emailVerified: true,
      createdAt: '2026-01-01T08:00:00Z',
      avatarGradient: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'USR-STAFF-1',
      email: 'staff@aura-health.org',
      passwordHash: 'ClinicSecure2026!',
      name: 'James Reynolds',
      role: 'clinic_staff',
      title: 'Senior Clinical Coordinator',
      department: 'Admissions & Triage',
      status: 'active',
      emailVerified: true,
      createdAt: '2026-01-05T09:00:00Z',
      avatarGradient: 'from-teal-600 to-cyan-600',
    },
    {
      id: 'USR-DOC-1',
      email: 'sarah.chen@clinic-health.org',
      passwordHash: 'DoctorAccess2026!',
      name: 'Dr. Sarah Chen, MD',
      role: 'doctor',
      doctorId: 'DOC-101',
      title: 'Chief of Cardiology',
      department: 'Cardiology',
      status: 'active',
      emailVerified: true,
      createdAt: '2026-01-02T08:00:00Z',
      avatarGradient: 'from-blue-600 to-cyan-500',
    },
    {
      id: 'USR-DOC-2',
      email: 'marcus.vance@clinic-health.org',
      passwordHash: 'DoctorAccess2026!',
      name: 'Dr. Marcus Vance, MD',
      role: 'doctor',
      doctorId: 'DOC-102',
      title: 'Attending Neurologist',
      department: 'Neurology',
      status: 'active',
      emailVerified: true,
      createdAt: '2026-01-03T08:00:00Z',
      avatarGradient: 'from-indigo-600 to-purple-500',
    },
    {
      id: 'USR-PT-1',
      email: 'eleanor.vance@example.com',
      passwordHash: 'PatientHealth2026!',
      name: 'Eleanor Vance',
      role: 'patient',
      patientId: 'PT-10492',
      title: 'Patient',
      department: 'Cardiology',
      status: 'active',
      emailVerified: true,
      createdAt: '2026-01-10T10:00:00Z',
      avatarGradient: 'from-emerald-600 to-teal-500',
    },
    {
      id: 'USR-DOC-PENDING',
      email: 'alex.patel@clinic-health.org',
      passwordHash: 'DoctorAccess2026!',
      name: 'Dr. Alex Patel, MD',
      role: 'doctor',
      doctorId: 'DOC-105',
      title: 'Pediatric Specialist',
      department: 'Pediatrics',
      status: 'pending_approval',
      emailVerified: true,
      createdAt: '2026-03-01T12:00:00Z',
      avatarGradient: 'from-amber-600 to-orange-500',
    }
  ],
  doctors: [
    {
      id: 'DOC-101',
      name: 'Dr. Sarah Chen, MD',
      email: 'sarah.chen@clinic-health.org',
      specialty: 'Interventional Cardiology',
      department: 'Cardiology',
      title: 'Chief of Cardiology & Clinical Director',
      qualifications: ['MD (Harvard Medical School)', 'FACC Board Certified', 'Fellowship at Cleveland Clinic'],
      experienceYears: 16,
      room: 'Bay 4A — Echo Suite',
      phone: '+1 (555) 234-8901',
      bio: 'Dr. Chen specializes in acute cardiovascular decompensation, predictive telemetry monitoring, and minimally invasive coronary intervention.',
      status: 'approved',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: { start: '08:30', end: '17:00' },
      consultationFee: 180,
      rating: 4.95,
      avatarGradient: 'from-blue-600 to-cyan-500',
    },
    {
      id: 'DOC-102',
      name: 'Dr. Marcus Vance, MD',
      email: 'marcus.vance@clinic-health.org',
      specialty: 'Cognitive Neurology & Cerebrovascular',
      department: 'Neurology',
      title: 'Attending Neurologist',
      qualifications: ['MD (Johns Hopkins)', 'FAAN Board Certified', 'Neuro-oncology Fellowship'],
      experienceYears: 12,
      room: 'Bay 2B — Neuro Pod',
      phone: '+1 (555) 234-8902',
      bio: 'Dr. Vance leads stroke triage protocols, neuropathic evaluation, and algorithmic migraine management.',
      status: 'approved',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      workingHours: { start: '09:00', end: '16:30' },
      consultationFee: 195,
      rating: 4.88,
      avatarGradient: 'from-indigo-600 to-purple-500',
    },
    {
      id: 'DOC-103',
      name: 'Dr. Elena Rostova, MD',
      email: 'elena.rostova@clinic-health.org',
      specialty: 'Endocrinology & Metabolic Disorders',
      department: 'Endocrinology',
      title: 'Senior Endocrinologist',
      qualifications: ['MD (Stanford University)', 'FACE Board Certified'],
      experienceYears: 14,
      room: 'Suite 101 — Metabolic Lab',
      phone: '+1 (555) 234-8903',
      bio: 'Expertise in automated insulin feedback systems, diabetic ketoacidosis prevention, and thyroid endocrine pathology.',
      status: 'approved',
      availableDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: { start: '08:00', end: '16:00' },
      consultationFee: 175,
      rating: 4.92,
      avatarGradient: 'from-emerald-600 to-teal-500',
    },
    {
      id: 'DOC-104',
      name: 'Dr. Tariq Al-Mansoor, MD',
      email: 'tariq.mansoor@clinic-health.org',
      specialty: 'Critical Care & Pulmonology',
      department: 'Pulmonology',
      title: 'Head of Pulmonary Care',
      qualifications: ['MD (Oxford University)', 'FCCP Board Certified'],
      experienceYears: 15,
      room: 'Bay 3C — Respiratory Care',
      phone: '+1 (555) 234-8904',
      bio: 'Specialist in COPD stabilization, asthma biologic therapy, and high-flow pulmonary therapy.',
      status: 'approved',
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      workingHours: { start: '09:00', end: '17:00' },
      consultationFee: 185,
      rating: 4.89,
      avatarGradient: 'from-rose-600 to-pink-500',
    },
    {
      id: 'DOC-105',
      name: 'Dr. Alex Patel, MD',
      email: 'alex.patel@clinic-health.org',
      specialty: 'Pediatric Care & Adolescent Medicine',
      department: 'Pediatrics',
      title: 'Pediatric Specialist',
      qualifications: ['MD (Columbia University)', 'FAAP Board Certified'],
      experienceYears: 8,
      room: 'Room 204 — Pediatric Wing',
      phone: '+1 (555) 234-8905',
      bio: 'Comprehensive pediatric wellness, developmental screening, and pediatric acute triage.',
      status: 'pending_approval',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: { start: '08:30', end: '16:30' },
      consultationFee: 150,
      rating: 4.80,
      avatarGradient: 'from-amber-600 to-orange-500',
    }
  ],
  patients: [
    {
      id: 'PT-10492',
      mrn: 'MRN-88231',
      name: 'Eleanor Vance',
      age: 44,
      gender: 'Female',
      phone: '+1 (555) 782-9012',
      email: 'eleanor.vance@example.com',
      address: '742 Evergreen Terrace, Springfield, OR',
      bloodType: 'A+',
      allergies: ['Penicillin', 'Sulfa drugs'],
      department: 'Cardiology',
      assignedDoctor: 'Dr. Sarah Chen, MD',
      primaryDiagnosis: 'Hypertensive Cardiomyopathy & Episodic Angina',
      admissionDate: '2026-03-24',
      lastVisit: '2026-03-28',
      triageStatus: 'Stable',
      insuranceProvider: 'BlueCross BlueShield Premier',
      insurancePolicyNumber: 'BCBS-8890214-A',
      emergencyContact: {
        name: 'David Vance',
        relationship: 'Spouse',
        phone: '+1 (555) 782-9013',
      },
    },
    {
      id: 'PT-10493',
      mrn: 'MRN-88232',
      name: 'Arthur Pendelton',
      age: 67,
      gender: 'Male',
      phone: '+1 (555) 345-6789',
      email: 'arthur.p@example.com',
      address: '12 Oak Ridge Blvd, Austin, TX',
      bloodType: 'O+',
      allergies: ['Aspirin'],
      department: 'Neurology',
      assignedDoctor: 'Dr. Marcus Vance, MD',
      primaryDiagnosis: 'Transient Ischemic Attack & Essential Tremor',
      admissionDate: '2026-03-25',
      lastVisit: '2026-03-29',
      triageStatus: 'Urgent',
      insuranceProvider: 'Medicare Part B / Aetna Supplemental',
      insurancePolicyNumber: 'MED-4421098',
      emergencyContact: {
        name: 'Clara Pendelton',
        relationship: 'Daughter',
        phone: '+1 (555) 345-6790',
      },
    },
    {
      id: 'PT-10494',
      mrn: 'MRN-88233',
      name: 'Sophia Martinez',
      age: 31,
      gender: 'Female',
      phone: '+1 (555) 456-7890',
      email: 'sophia.m@example.com',
      address: '88 Coronado Way, San Diego, CA',
      bloodType: 'B+',
      allergies: ['Latex'],
      department: 'Endocrinology',
      assignedDoctor: 'Dr. Elena Rostova, MD',
      primaryDiagnosis: 'Type 1 Diabetes Mellitus with Microalbuminuria',
      admissionDate: '2026-03-26',
      lastVisit: '2026-03-30',
      triageStatus: 'Stable',
      insuranceProvider: 'UnitedHealthcare Choice Plus',
      insurancePolicyNumber: 'UHC-992014-C',
      emergencyContact: {
        name: 'Carlos Martinez',
        relationship: 'Brother',
        phone: '+1 (555) 456-7891',
      },
    }
  ],
  appointments: [
    {
      id: 'APT-8831',
      patientId: 'PT-10492',
      patientName: 'Eleanor Vance',
      doctorId: 'DOC-101',
      doctorName: 'Dr. Sarah Chen, MD',
      department: 'Cardiology',
      date: '2026-10-10',
      time: '09:00',
      type: 'In-Person',
      status: 'Scheduled',
      priority: 'Normal',
      chiefComplaint: 'Post-treatment cardiology routine review and blood pressure check',
      room: 'Bay 4A — Echo Suite',
      checkedIn: false,
      createdAt: '2026-10-01T10:00:00Z',
      updatedAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 'APT-8832',
      patientId: 'PT-10493',
      patientName: 'Arthur Pendelton',
      doctorId: 'DOC-102',
      doctorName: 'Dr. Marcus Vance, MD',
      department: 'Neurology',
      date: '2026-10-10',
      time: '10:30',
      type: 'In-Person',
      status: 'Waiting',
      priority: 'High',
      chiefComplaint: 'Follow-up on episodic dizzy spells and focal sensory paresthesia',
      room: 'Bay 2B — Neuro Pod',
      checkedIn: true,
      checkedInAt: '2026-10-10T10:15:00Z',
      createdAt: '2026-10-02T11:00:00Z',
      updatedAt: '2026-10-10T10:15:00Z',
    },
    {
      id: 'APT-8833',
      patientId: 'PT-10494',
      patientName: 'Sophia Martinez',
      doctorId: 'DOC-103',
      doctorName: 'Dr. Elena Rostova, MD',
      department: 'Endocrinology',
      date: '2026-10-11',
      time: '14:00',
      type: 'Video Consultation',
      status: 'Scheduled',
      priority: 'Routine',
      chiefComplaint: 'Continuous Glucose Monitor (CGM) trend adjustment',
      room: 'Suite 101 — Metabolic Lab',
      checkedIn: false,
      createdAt: '2026-10-03T14:30:00Z',
      updatedAt: '2026-10-03T14:30:00Z',
    }
  ],
  clinicalDocuments: [
    {
      id: 'DOC-NOTE-001',
      patientId: 'PT-10492',
      patientName: 'Eleanor Vance',
      doctorId: 'DOC-101',
      doctorName: 'Dr. Sarah Chen, MD',
      appointmentId: 'APT-8831',
      type: 'Consultation Note',
      title: 'Cardiovascular Comprehensive Evaluation & Stress Echo Summary',
      content: 'Patient presented with stable resting BP (128/82 mmHg). Stress echocardiogram demonstrates preserved left ventricular ejection fraction (58%) without regional wall motion abnormalities. Continue current ACE inhibitor regimen.',
      status: 'released',
      finalizedAt: '2026-03-28T16:30:00Z',
      releasedAt: '2026-03-28T17:00:00Z',
      createdAt: '2026-03-28T16:00:00Z',
      updatedAt: '2026-03-28T17:00:00Z',
    },
    {
      id: 'DOC-RX-001',
      patientId: 'PT-10492',
      patientName: 'Eleanor Vance',
      doctorId: 'DOC-101',
      doctorName: 'Dr. Sarah Chen, MD',
      appointmentId: 'APT-8831',
      type: 'Prescription',
      title: 'Cardiology Outpatient Prescription Order',
      content: 'Electronic prescription dispatched to designated outpatient clinic pharmacy.',
      prescriptionItems: [
        { medication: 'Lisinopril', dosage: '10mg', frequency: 'Once daily with water', duration: '90 days' },
        { medication: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime', duration: '90 days' },
      ],
      status: 'released',
      finalizedAt: '2026-03-28T16:45:00Z',
      releasedAt: '2026-03-28T17:00:00Z',
      createdAt: '2026-03-28T16:30:00Z',
      updatedAt: '2026-03-28T17:00:00Z',
    },
    {
      id: 'DOC-NOTE-002',
      patientId: 'PT-10493',
      patientName: 'Arthur Pendelton',
      doctorId: 'DOC-102',
      doctorName: 'Dr. Marcus Vance, MD',
      appointmentId: 'APT-8832',
      type: 'Consultation Note',
      title: 'Neurological Follow-up & Reflex Profile',
      content: 'Cranial nerves II-XII intact. Babinski negative bilaterally. Mild intentional tremor noted on right hand finger-to-nose testing. MRI brain scan ordered.',
      status: 'finalized',
      finalizedAt: '2026-03-29T11:00:00Z',
      createdAt: '2026-03-29T10:30:00Z',
      updatedAt: '2026-03-29T11:00:00Z',
    },
    {
      id: 'DOC-DRAFT-001',
      patientId: 'PT-10494',
      patientName: 'Sophia Martinez',
      doctorId: 'DOC-103',
      doctorName: 'Dr. Elena Rostova, MD',
      appointmentId: 'APT-8833',
      type: 'Consultation Note',
      title: 'Endocrine Care Plan - Preliminary Draft',
      content: 'Draft assessment for insulin pump basal rate titration. HbA1c improved to 6.8%. Awaiting morning fasting serum peptide panel.',
      status: 'draft',
      createdAt: '2026-03-30T09:00:00Z',
      updatedAt: '2026-03-30T09:00:00Z',
    }
  ],
  auditLogs: [
    {
      id: 'AUDIT-001',
      timestamp: '2026-10-08T08:00:00Z',
      userId: 'USR-ADMIN-1',
      userName: 'Dr. Sarah Chen, MD',
      userRole: 'admin',
      action: 'SYSTEM_STARTUP',
      entityType: 'System',
      details: 'AI Clinic server initialized with secure persistent storage engine.',
      ipAddress: '127.0.0.1',
    },
    {
      id: 'AUDIT-002',
      timestamp: '2026-10-08T08:15:00Z',
      userId: 'USR-STAFF-1',
      userName: 'James Reynolds',
      userRole: 'staff',
      action: 'PATIENT_CHECKIN',
      entityType: 'Appointment',
      entityId: 'APT-8832',
      details: 'Patient Arthur Pendelton checked in for appointment APT-8832 with Dr. Marcus Vance.',
      ipAddress: '127.0.0.1',
    }
  ],
  staffInvitations: [
    {
      id: 'INV-101',
      email: 'nurse.jenny@clinic-health.org',
      role: 'staff',
      inviteCode: 'INV-STAFF-9021',
      invitedBy: 'USR-ADMIN-1',
      createdAt: '2026-10-01T09:00:00Z',
      expiresAt: '2026-10-31T23:59:59Z',
      status: 'pending',
    }
  ],
};

let inMemoryStore: StoreData = JSON.parse(JSON.stringify(INITIAL_STORE));

// File System Persistence Helpers
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

export function loadStore(): StoreData {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      
      // Ensure all arrays exist and normalize all user roles to the 3 application roles
      const loadedUsers: User[] = (parsed.users || INITIAL_STORE.users).map((u: any) => ({
        ...u,
        role: normalizeAppRole(u.role, u.email),
      }));

      inMemoryStore = {
        users: loadedUsers,
        patients: parsed.patients || INITIAL_STORE.patients,
        doctors: parsed.doctors || INITIAL_STORE.doctors,
        appointments: parsed.appointments || INITIAL_STORE.appointments,
        clinicalDocuments: parsed.clinicalDocuments || INITIAL_STORE.clinicalDocuments,
        auditLogs: parsed.auditLogs || INITIAL_STORE.auditLogs,
        staffInvitations: parsed.staffInvitations || INITIAL_STORE.staffInvitations,
      };
      return inMemoryStore;
    } else {
      saveStore(INITIAL_STORE);
      return inMemoryStore;
    }
  } catch (err) {
    console.error('Failed to read store file, falling back to in-memory store:', err);
    return inMemoryStore;
  }
}

export function saveStore(store: StoreData): void {
  ensureDataDir();
  try {
    inMemoryStore = store;
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist store to disk:', err);
  }
}

export function getStore(): StoreData {
  return inMemoryStore;
}

// Audit Log Helper
export function logAudit(
  userId: string,
  userName: string,
  userRole: string,
  action: string,
  entityType: string,
  details: string,
  entityId?: string,
  ipAddress = '127.0.0.1'
): AuditLog {
  const store = getStore();
  const entry: AuditLog = {
    id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    userRole,
    action,
    entityType,
    entityId,
    details,
    ipAddress,
  };
  store.auditLogs.unshift(entry);
  if (store.auditLogs.length > 500) {
    store.auditLogs = store.auditLogs.slice(0, 500);
  }
  saveStore(store);
  return entry;
}

// Double Booking Check Helper
export function checkDoctorSlotConflict(
  doctorId: string,
  date: string,
  time: string,
  excludeAppointmentId?: string
): boolean {
  const store = getStore();
  return store.appointments.some(
    (apt) =>
      apt.doctorId === doctorId &&
      apt.date === date &&
      apt.time === time &&
      apt.status !== 'Cancelled' &&
      apt.id !== excludeAppointmentId
  );
}

// Initialize on load
loadStore();
