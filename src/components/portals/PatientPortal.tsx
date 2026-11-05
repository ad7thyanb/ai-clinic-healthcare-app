import React, { useState } from 'react';
import { 
  Heart, 
  CalendarClock, 
  Check, 
  Clock, 
  Pill, 
  Plus, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Home,
  LayoutDashboard,
  Activity,
  Info,
  HeartPulse,
  Stethoscope,
  FileText,
  AlertTriangle,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { AppointmentRecord, PatientRecord, DoctorRecord } from '../../types/clinic';
import { AuthUser } from '../auth/LoginScreen';
import { LiveStatusModal } from '../modals/LiveStatusModal';
import { AboutUsModal } from '../modals/AboutUsModal';

interface PatientPortalProps {
  user: AuthUser;
  patient: PatientRecord;
  appointments: AppointmentRecord[];
  doctors: DoctorRecord[];
  onOpenBookAppointment: (doctorId?: string) => void;
  onLogout: () => void;
  onGoHome?: () => void;
  onOpenAiAssistant?: () => void;
  onUpdateAppointmentStatus?: (id: string, status: AppointmentRecord['status'], checkedIn?: boolean) => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  user,
  patient,
  appointments,
  doctors,
  onOpenBookAppointment,
  onLogout,
  onGoHome,
  onOpenAiAssistant,
  onUpdateAppointmentStatus,
}) => {
  const [refillRequested, setRefillRequested] = useState<string | null>(null);
  const [checkedInApptId, setCheckedInApptId] = useState<string | null>(null);
  const [liveStatusModalOpen, setLiveStatusModalOpen] = useState<boolean>(false);
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);

  const patientAppointments = appointments.filter(
    a => a.patientId === patient.id ||
         (patient.mrn && a.patientId === patient.mrn) ||
         a.patientName.toLowerCase() === patient.name.toLowerCase() ||
         (patient.email && a.patientEmail && a.patientEmail.toLowerCase() === patient.email.toLowerCase())
  );

  const handleRequestRefill = (med: string) => {
    setRefillRequested(med);
    setTimeout(() => setRefillRequested(null), 3500);
  };

  const handleCheckIn = (aptId: string) => {
    setCheckedInApptId(aptId);
    if (onUpdateAppointmentStatus) {
      onUpdateAppointmentStatus(aptId, 'Waiting', true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Patient Header */}
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
                    Patient
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono truncate max-w-[140px] sm:max-w-xs">
                  {patient.name} · {patient.mrn}
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
                title="Patient Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="hidden md:inline">Dashboard</span>
              </button>

              {/* Live Status */}
              <button
                type="button"
                onClick={() => setLiveStatusModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors group"
                title="Live Clinical Status"
              >
                <div className="relative shrink-0">
                  <Activity className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition-transform" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-teal-500 rounded-full" />
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

            {/* AI Assistant Navigation Option */}
            {onOpenAiAssistant && (
              <button
                type="button"
                onClick={onOpenAiAssistant}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all flex items-center gap-1.5 shadow-xs group"
                title="Open AI Healthcare Assistant"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600 group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline">AI Assistant</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenBookAppointment()}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-all flex items-center gap-1.5 shadow-sm shadow-teal-600/25"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Schedule Visit</span>
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
        {/* Welcome Care Overview Banner */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0 text-teal-600 shadow-xs">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                <span>Personal Electronic Health Record</span>
                <span className="text-slate-400">·</span>
                <span>Active Coverage: {patient.insurance}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                Welcome back, {patient.name.split(' ')[0]}
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Your primary care is managed by <strong>{patient.assignedDoctor}</strong> ({patient.department}). Next scheduled clinical visit is <strong>{patient.nextAppointment || 'Today, 10:30 AM'}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenAiAssistant && (
              <button
                type="button"
                onClick={onOpenAiAssistant}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm shadow-teal-600/25 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Assistant</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenBookAppointment()}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold transition-colors shadow-xs"
            >
              Book Follow-up
            </button>
          </div>
        </div>

        {/* AI Healthcare Assistant Feature Card */}
        <div className="bg-gradient-to-r from-teal-50/80 via-white to-slate-50 rounded-2xl p-4 sm:p-5 border border-teal-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-teal-600/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">AI Healthcare Assistant</h4>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Have questions about your next appointment, medications, or vital trends? Get instant clinical guidance 24/7.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenAiAssistant}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
              <span>Ask AI Assistant</span>
            </button>
          </div>
        </div>

        {/* Vitals Telemetry Cards */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Latest Recorded Vital Signs (Intake: Oct 07, 2026)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500">Blood Pressure</div>
              <div className="text-xl font-bold font-mono text-teal-700 mt-1">{patient.vitals.bp}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">mmHg (Resting)</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500">Heart Rate</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">{patient.vitals.hr} bpm</div>
              <div className="text-[10px] text-teal-700 mt-0.5 font-semibold">Normal Sinus</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500">Oxygen Saturation</div>
              <div className={`text-xl font-bold font-mono mt-1 ${patient.vitals.spo2 < 95 ? 'text-rose-600' : 'text-teal-700'}`}>
                {patient.vitals.spo2}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Room air</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500">Body Temperature</div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">{patient.vitals.temp}°F</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Afebrile</div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-500">Fasting Glucose</div>
              <div className="text-xl font-bold font-mono text-amber-700 mt-1">{patient.vitals.glucose}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">mg/dL</div>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Appointments & Prescriptions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Appointments */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Your Clinic Consultations &amp; Visits
                </h3>
                <p className="text-xs text-slate-500">
                  Confirmed hospital appointments and outpatient check-ins
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                {patientAppointments.length} Booked Visits
              </span>
            </div>

            <div className="space-y-3">
              {patientAppointments.map((apt) => {
                const isCheckedIn = checkedInApptId === apt.id || apt.checkedIn;

                return (
                  <div key={apt.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-teal-700">{apt.time}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-xs font-semibold text-slate-800">{apt.doctorName}</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                          apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">{apt.chiefComplaint}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Location: <strong className="text-slate-700">{apt.room}</strong> · Department: {apt.department}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {apt.status !== 'Completed' && (
                        <button
                          type="button"
                          onClick={() => handleCheckIn(apt.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                            isCheckedIn
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                          }`}
                        >
                          {isCheckedIn ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Checked In</span>
                            </>
                          ) : (
                            <span>Mobile Check-In</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Active Medications & Allergies */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Active Medications &amp; Prescriptions
              </h3>
              <p className="text-xs text-slate-500">
                Prescribed pharmacotherapy with 1-click pharmacy refill requests
              </p>
            </div>

            <div className="space-y-2.5">
              {patient.medications.map((med, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200">
                      <Pill className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{med}</div>
                      <div className="text-[10px] text-slate-500">Take as instructed with food</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRequestRefill(med)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white hover:bg-slate-100 text-teal-700 border border-slate-200 transition-colors"
                  >
                    {refillRequested === med ? 'Requested ✓' : 'Refill Rx'}
                  </button>
                </div>
              ))}
            </div>

            {/* Allergies Warning */}
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-xs">
              <div className="flex items-center gap-1.5 text-rose-700 font-bold mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Documented Drug Allergies</span>
              </div>
              <div className="text-slate-700 leading-relaxed text-[11px]">
                {patient.allergies.join(', ')}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Dedicated Attending Doctor Information & Medical History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Attending Doctor Information Card */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>Attending Physician Information</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Your designated primary specialist at AI Clinic Health Systems
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Primary Care Lead
              </span>
            </div>

            {(() => {
              const assignedDoc = doctors.find(d => 
                d.name.toLowerCase().includes(patient.assignedDoctor.toLowerCase().replace('dr. ', '').split(' ')[0]) ||
                patient.assignedDoctor.toLowerCase().includes(d.name.toLowerCase().replace('dr. ', '').split(' ')[0])
              ) || doctors[0];

              return (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                      {assignedDoc ? assignedDoc.name.split(' ').filter(n => !n.includes('.')).map(n => n[0]).join('').slice(0, 2) : 'MD'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">{assignedDoc ? assignedDoc.name : patient.assignedDoctor}</h4>
                        <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          ★ {assignedDoc?.rating || 4.9}
                        </span>
                      </div>
                      <div className="text-xs text-teal-700 font-medium mt-0.5">
                        {assignedDoc?.title || 'Specialist Physician'} · {assignedDoc?.department || patient.department}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        <span>Room: <strong className="text-slate-700">{assignedDoc?.room || 'Suite 302'}</strong></span>
                        <span>Experience: <strong className="text-slate-700">{assignedDoc?.experience || '12 yrs'}</strong></span>
                        <span>Next Slot: <strong className="text-teal-700">{assignedDoc?.nextAvailable || 'Today, 2:00 PM'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="text-slate-500 text-[11px]">Direct Clinical Inquiries:</div>
                      <div className="font-mono text-slate-800 font-semibold">{assignedDoc?.phone || '+1 (555) 234-5678'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenBookAppointment(assignedDoc?.id)}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all"
                    >
                      Book With Physician
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Longitudinal Medical History & EHR Summary */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Longitudinal Medical History</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Documented chronic diagnoses and clinical care plan timeline
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                Verified EHR
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Chronic Diagnoses &amp; Pre-Existing Conditions:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {patient.medicalHistory.map((item, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Current Clinical Advisory &amp; Action Plan</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Continue daily pharmacotherapy as scheduled. Maintain home blood pressure tracking twice daily. Follow up immediately if resting SpO2 falls below 95% or systolic pressure exceeds 140 mmHg.
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Primary Coverage: <strong className="text-slate-700">{patient.insurance}</strong></span>
                <span>Last Updated: <strong className="text-slate-700">Oct 07, 2026</strong></span>
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
