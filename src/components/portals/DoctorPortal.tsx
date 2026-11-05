import React, { useState } from 'react';
import { 
  Stethoscope, 
  CalendarClock, 
  CheckCircle2, 
  Clock, 
  User, 
  Activity, 
  FileText, 
  AlertTriangle, 
  Heart, 
  Pill, 
  Plus, 
  Eye, 
  Check, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  Send,
  Sparkles,
  Home,
  LayoutDashboard,
  Info,
  HeartPulse,
  Star
} from 'lucide-react';
import { DoctorRecord, AppointmentRecord, PatientRecord } from '../../types/clinic';
import { AuthUser } from '../auth/LoginScreen';
import { LiveStatusModal } from '../modals/LiveStatusModal';
import { AboutUsModal } from '../modals/AboutUsModal';

interface DoctorPortalProps {
  user: AuthUser;
  doctor: DoctorRecord;
  appointments: AppointmentRecord[];
  patients: PatientRecord[];
  onUpdateAppointmentStatus: (id: string, status: AppointmentRecord['status']) => void;
  onOpenNewAppointment: () => void;
  onLogout: () => void;
  onGoHome?: () => void;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({
  user,
  doctor,
  appointments,
  patients,
  onUpdateAppointmentStatus,
  onOpenNewAppointment,
  onLogout,
  onGoHome,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('PT-10495'); // Julian Sterling by default
  const [activeTab, setActiveTab] = useState<'schedule' | 'active_patient' | 'notes'>('schedule');
  const [queueFilter, setQueueFilter] = useState<'all' | 'waiting' | 'completed'>('all');
  const [clinicalNotesText, setClinicalNotesText] = useState<string>('Patient demonstrates stable telemetry rhythm following initiation of Apixaban. Resting heart rate 78 bpm. Scheduled for 12-lead ECG repeat and electrolytes panel.');
  const [savedNotes, setSavedNotes] = useState<boolean>(false);
  const [liveStatusModalOpen, setLiveStatusModalOpen] = useState<boolean>(false);
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);

  // Filter appointments assigned to this doctor
  const docCleanName = (doctor.name || '').toLowerCase().replace('dr.', '').trim();
  const docLastName = docCleanName.split(' ').pop() || '';
  const doctorAppointments = appointments.filter(
    a => a.doctorId === doctor.id ||
         (docLastName && a.doctorName.toLowerCase().includes(docLastName)) ||
         (docCleanName && a.doctorName.toLowerCase().includes(docCleanName)) ||
         (docCleanName && docCleanName.includes(a.doctorName.toLowerCase().replace('dr.', '').trim()))
  );

  const activePatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const completedCount = doctorAppointments.filter(a => a.status === 'Completed').length;
  const waitingQueueAppointments = doctorAppointments.filter(a => a.status !== 'Completed');
  const inProgressAppt = doctorAppointments.find(a => a.status === 'In Progress' || a.status === 'Urgent Triage');

  const displayedAppointments = doctorAppointments.filter(a => {
    if (queueFilter === 'waiting') return a.status !== 'Completed';
    if (queueFilter === 'completed') return a.status === 'Completed';
    return true;
  });

  const handleSaveNotes = () => {
    setSavedNotes(true);
    setTimeout(() => setSavedNotes(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Doctor Portal Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs text-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Top-Left: AI Clinic Logo & Project Name */}
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={onGoHome}
              title="Return to AI Clinic Home"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/25 group-hover:scale-105 transition-transform shrink-0">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                    AI Clinic
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    Physician
                  </span>
                </div>
                <div className="text-xs text-slate-500 truncate max-w-[140px] sm:max-w-xs">
                  {doctor.name} · {doctor.department}
                </div>
              </div>
            </div>
          </div>

          {/* Top-Right: Navigation Options with Icons & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <nav className="flex items-center gap-1">
              {/* Home */}
              <button
                type="button"
                onClick={onGoHome}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                title="Home"
              >
                <Home className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="hidden md:inline">Home</span>
              </button>

              {/* Dashboard */}
              <button
                type="button"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 shadow-xs transition-colors"
                title="Doctor Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="hidden md:inline">Dashboard</span>
              </button>

              {/* Live Status */}
              <button
                type="button"
                onClick={() => setLiveStatusModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors group"
                title="Live Clinical Status"
              >
                <div className="relative shrink-0">
                  <Activity className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                </div>
                <span className="hidden md:inline">Live Status</span>
              </button>

              {/* About Us */}
              <button
                type="button"
                onClick={() => setAboutModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                title="About AI Clinic"
              >
                <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="hidden md:inline">About Us</span>
              </button>
            </nav>

            <button
              type="button"
              onClick={onOpenNewAppointment}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all flex items-center gap-1.5 shadow-sm shadow-teal-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Book Encounter</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shadow-xs"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Physician Shift Overview Banner */}
        <div className="bg-white rounded-2xl p-5 text-slate-800 shadow-sm border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0 text-teal-700">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                <span>Active Physician On-Duty Shift</span>
                <span className="text-slate-300">·</span>
                <span className="text-emerald-700 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live in Clinic
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                {doctor.name} — Clinical Encounters for Today
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                {doctorAppointments.length} assigned outpatient encounters, {completedCount} charts finalized. Next scheduled slot at {doctor.nextAvailable}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono shadow-xs">
              <div className="text-[10px] text-teal-800 font-semibold">Encounter Load</div>
              <div className="text-base font-bold text-slate-900 tabular-nums">
                {completedCount} / {doctor.patientsToday}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Doctor KPI Cards with Gradients */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-4 sm:p-5 text-white shadow-lg border border-blue-400/20 group hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Scheduled Patients</span>
              <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/10">
                <CalendarClock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
                {doctorAppointments.length}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/30 text-blue-100 border border-blue-300/30">
                Today's list
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-teal-600 to-blue-700 p-4 sm:p-5 text-white shadow-lg border border-cyan-400/20 group hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-cyan-100 uppercase tracking-wider">Completed Visits</span>
              <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/10">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
                {completedCount}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-teal-500/30 text-teal-100 border border-teal-300/30">
                Charts signed
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-800 p-4 sm:p-5 text-white shadow-lg border border-indigo-400/20 group hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">Avg Consult Time</span>
              <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/10">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
                {doctor.avgConsultationTime} min
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-500/30 text-indigo-100 border border-indigo-300/30">
                On target
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-rose-700 p-4 sm:p-5 text-white shadow-lg border border-purple-400/20 group hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-purple-100 uppercase tracking-wider">Patient Satisfaction</span>
              <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/10">
                <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
                {doctor.rating} ★
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-pink-500/30 text-pink-100 border border-pink-300/30">
                {doctor.reviewsCount} reviews
              </span>
            </div>
          </div>
        </div>

        {/* Doctor Grid: Left 7 cols Today's Schedule & Right 5 cols Active Patient in Room */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Schedule Table */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Today’s Consultation Queue &amp; Encounters
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click any encounter to review vitals and document clinical notes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-600">
                    <button
                      type="button"
                      onClick={() => setQueueFilter('all')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${queueFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200' : 'hover:text-slate-900'}`}
                    >
                      All ({doctorAppointments.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setQueueFilter('waiting')}
                      className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${queueFilter === 'waiting' ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200' : 'hover:text-slate-900'}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Waiting Queue ({waitingQueueAppointments.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setQueueFilter('completed')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${queueFilter === 'completed' ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200' : 'hover:text-slate-900'}`}
                    >
                      Completed ({completedCount})
                    </button>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
                    {doctor.room}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Chief Complaint</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No encounters found for current filter.
                        </td>
                      </tr>
                    ) : (
                      displayedAppointments.map((apt) => (
                      <tr 
                        key={apt.id} 
                        onClick={() => setSelectedPatientId(apt.patientId)}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          selectedPatientId === apt.patientId ? 'bg-teal-50/50 border-l-2 border-teal-600' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-teal-700 whitespace-nowrap">
                          {apt.time}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{apt.patientName}</div>
                          <div className="text-[11px] text-slate-500">{apt.patientAge}y · {apt.patientGender}</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-slate-700 font-medium" title={apt.chiefComplaint}>
                          {apt.chiefComplaint}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            apt.status === 'Completed'
                              ? 'bg-teal-50 text-teal-700 border-teal-200'
                              : apt.status === 'In Progress'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {apt.status !== 'Completed' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateAppointmentStatus(apt.id, 'Completed');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold text-xs transition-colors"
                            >
                              Sign &amp; Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <span>Selected Encounter: <strong className="text-slate-800">{activePatient.name}</strong></span>
              <span>All consultations synchronized with hospital EHR</span>
            </div>
          </div>

          {/* Right: Active Patient Chart & Clinical Notes */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4 text-slate-800">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${activePatient.avatarGradient} flex items-center justify-center text-white font-bold text-sm shadow-xs border border-white/10`}>
                  {activePatient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">{activePatient.name}</h3>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#0B1327] text-cyan-300 border border-slate-700">
                      {activePatient.mrn}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {activePatient.age} yrs · {activePatient.gender} · Blood {activePatient.bloodType}
                  </div>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                activePatient.triageStatus === 'Urgent'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {activePatient.triageStatus}
              </span>
            </div>

            {/* Vitals Telemetry */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Bedside Vital Signs
              </div>
              <div className="grid grid-cols-4 gap-2 text-center p-2.5 rounded-xl bg-[#0B1327] border border-slate-800 text-white font-mono text-xs">
                <div>
                  <div className="text-[9px] text-slate-400">BP</div>
                  <div className="font-bold text-cyan-400">{activePatient.vitals.bp}</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400">Heart Rate</div>
                  <div className="font-bold text-white">{activePatient.vitals.hr} bpm</div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400">SpO2</div>
                  <div className={`font-bold ${activePatient.vitals.spo2 < 95 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {activePatient.vitals.spo2}%
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400">Glucose</div>
                  <div className="font-bold text-amber-400">{activePatient.vitals.glucose}</div>
                </div>
              </div>
            </div>

            {/* Primary Diagnosis & Allergies */}
            <div className="p-3 rounded-xl bg-[#0B1327] border border-slate-800 text-xs space-y-2">
              <div>
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Primary Diagnosis:</span>
                <span className="font-bold text-white">{activePatient.primaryDiagnosis}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5 text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span className="font-medium">Allergies: {activePatient.allergies.join(', ')}</span>
              </div>
            </div>

            {/* Doctor Clinical Notes Editor */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Attending Physician Assessment &amp; Plan:
              </label>
              <textarea
                rows={3}
                value={clinicalNotesText}
                onChange={(e) => setClinicalNotesText(e.target.value)}
                className="w-full p-2.5 text-xs bg-[#0B1327] border border-slate-700/80 rounded-xl focus:bg-[#0E1832] focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 font-medium text-slate-100 placeholder:text-slate-500"
              />
              <div className="flex items-center justify-between">
                {savedNotes ? (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>EHR Note Saved</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">Autosaves to EHR</span>
                )}
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
                >
                  Save Progress Note
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Live Status & About Us Modals */}
      <LiveStatusModal
        isOpen={liveStatusModalOpen}
        onClose={() => setLiveStatusModalOpen(false)}
      />

      <AboutUsModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />
    </div>
  );
};
