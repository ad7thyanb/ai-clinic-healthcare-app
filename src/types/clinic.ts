export type ActiveView = 
  | 'dashboard'
  | 'queue'
  | 'patients'
  | 'appointments'
  | 'doctors'
  | 'staff'
  | 'departments'
  | 'reports'
  | 'insights'
  | 'contact'
  | 'settings'
  | 'diseases'
  | 'clinic_data';

export interface VitalsRecord {
  bp: string;
  hr: number;
  spo2: number;
  temp: number;
  glucose: number;
}

export interface PatientRecord {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  bloodType: string;
  primaryDiagnosis: string;
  assignedDoctor: string;
  department: string;
  lastVisit: string;
  nextAppointment?: string;
  triageStatus: 'Normal' | 'Urgent' | 'Critical' | 'Moderate' | 'Discharged';
  vitals: VitalsRecord;
  allergies: string[];
  medications: string[];
  insurance: string;
  medicalHistory: string[];
  avatarGradient: string;
  vitalsHistory?: Array<{
    date: string;
    systolic: number;
    diastolic: number;
    hr?: number;
    spo2?: number;
  }>;
}

export interface AppointmentRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  department: string;
  date: string;
  time: string;
  type: 'In-Person' | 'Telehealth' | 'Follow-up' | 'Emergency' | 'Lab Review' | 'Video Consultation';
  status: 'Scheduled' | 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled' | 'Urgent Triage';
  chiefComplaint: string;
  room: string;
  priority: 'Critical' | 'High' | 'Normal' | 'Routine';
  durationMinutes?: number;
  waitTimeMinutes?: number;
  notes?: string;
  checkedIn: boolean;
  createdAt?: string;
  patientEmail?: string;
}

export interface DoctorScheduleItem {
  time: string;
  patient: string;
  type: string;
  status: string;
}

export interface DoctorRecord {
  id: string;
  name: string;
  title: string;
  specialty: string;
  department: string;
  experience?: string;
  education?: string;
  rating: number;
  reviewsCount?: number;
  status: 'In Consultation' | 'Available' | 'In Surgery' | 'On Break' | 'Off Duty' | 'approved' | 'pending_approval' | 'inactive';
  room: string;
  patientsToday?: number;
  consultationsCompleted?: number;
  avgConsultationTime?: number; // minutes
  avgWaitingTime?: number; // minutes
  nextAvailable?: string;
  avatarGradient: string;
  email: string;
  phone: string;
  todaySchedule?: DoctorScheduleItem[];
  bio?: string;
  qualifications?: string[];
  workingHours?: { start: string; end: string };
  consultationFee?: number;
  availableDays?: string[];
}

export interface DiseaseRecord {
  id: string;
  code: string; // ICD-10
  name: string;
  department: string;
  activeCases: number;
  weeklyChange: number; // percentage (+ or -)
  severity: 'Severe' | 'Moderate' | 'Mild';
  avgRecoveryDays: number;
  seasonalTrend: 'Rising' | 'Stable' | 'Declining';
  commonAgeGroup: string;
  prevalencePercentage: number;
  primaryMedications: string[];
}

export interface ClinicInsight {
  id: string;
  category: 'Operational Bottleneck' | 'Diagnostic Correlation' | 'No-Show Prediction' | 'Staffing Optimization' | 'Clinical Protocol';
  priority: 'Critical' | 'High' | 'Medium' | 'Info';
  title: string;
  summary: string;
  impactMetric: string;
  suggestedAction: string;
  confidenceScore: number;
  timestamp: string;
  status: 'Active' | 'Reviewed' | 'Implemented';
  affectedDepartment: string;
  cohortSize?: string;
  projectedSavingHours?: number;
}

export interface TrendDataPoint {
  date_label: string;
  total: number;
  completed: number;
  waiting: number;
  upcoming: number;
  cancelled: number;
}

export interface DepartmentMetric {
  department: string;
  activePatients: number;
  totalAppointments: number;
  avgWaitMinutes: number;
  occupancyPercent: number;
  headDoctor: string;
  status: 'Optimal' | 'Near Capacity' | 'High Load';
  color: string;
}

export interface DashboardStats {
  totalPatients: number;
  patientGrowthMonth: number;
  todayAppointments: number;
  appointmentsCompletedToday: number;
  activeDoctorsOnDuty: number;
  avgWaitingTime: number;
  roomOccupancyRate: number;
  triageAccuracyPercent: number;
  monthlyRevenue: number;
  emergencyCasesToday: number;
  appointmentTrend: TrendDataPoint[];
  departmentPerformance: DepartmentMetric[];
  topDiseases: DiseaseRecord[];
  recentInsights: ClinicInsight[];
  satisfactionScore?: number;
  followUpRatePercent?: number;
  totalEncounters?: number;
  dataSource?: 'supabase_live' | 'mock';
  avgEncounterFee?: number;
  hasRevenueColumn?: boolean;
  hasSatisfactionColumn?: boolean;
  hasFollowUpColumn?: boolean;
  verifiedColumnsCount?: number;
  lastSyncedAt?: string;
}
