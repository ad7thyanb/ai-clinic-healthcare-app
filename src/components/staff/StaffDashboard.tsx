import React, { useState, useMemo } from 'react';
import { 
  Users, 
  CalendarClock, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Plus, 
  UserPlus, 
  ChevronRight, 
  FileText, 
  HeartPulse, 
  Sparkles, 
  LogOut, 
  Home, 
  Filter, 
  Phone, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  RefreshCw,
  Building,
  UserCheck
} from 'lucide-react';
import { AppointmentRecord, PatientRecord, DoctorRecord } from '../../types/clinic';
import { AuthUser } from '../auth/LoginScreen';
import { LiveStatusModal } from '../modals/LiveStatusModal';

interface StaffDashboardProps {
  currentUser: AuthUser;
  appointments: AppointmentRecord[];
  patients: PatientRecord[];
  doctors: DoctorRecord[];
  onUpdateAppointmentStatus: (id: string, status: AppointmentRecord['status'], checkedIn?: boolean) => void;
  onOpenNewAppointment: () => void;
  onOpenRegisterPatient: () => void;
  onSelectPatient: (patient: PatientRecord) => void;
  onLogout: () => void;
  onGoHome?: () => void;
  onRefreshData?: () => void;
  embedded?: boolean;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  currentUser,
  appointments,
  patients,
  doctors,
  onUpdateAppointmentStatus,
  onOpenNewAppointment,
  onOpenRegisterPatient,
  onSelectPatient,
  onLogout,
  onGoHome,
  onRefreshData,
  embedded = false,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'appointments' | 'patients'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Scheduled' | 'Waiting' | 'In Progress' | 'Completed'>('all');
  const [triageFilter, setTriageFilter] = useState<'all' | 'Critical' | 'Urgent' | 'Normal'>('all');
  const [liveStatusOpen, setLiveStatusOpen] = useState(false);
  const [recentCheckinToast, setRecentCheckinToast] = useState<string | null>(null);

  // Operational Front Desk Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = useMemo(() => {
    return appointments.filter(a => a.date === todayStr || !a.date);
  }, [appointments, todayStr]);

  const waitingQueue = useMemo(() => {
    return appointments.filter(a => a.status === 'Waiting' || (a.checkedIn && a.status !== 'Completed'));
  }, [appointments]);

  const inProgressCount = useMemo(() => {
    return appointments.filter(a => a.status === 'In Progress').length;
  }, [appointments]);

  const completedTodayCount = useMemo(() => {
    return appointments.filter(a => a.status === 'Completed').length;
  }, [appointments]);

  const urgentCasesCount = useMemo(() => {
    return appointments.filter(a => a.priority === 'Critical' || a.priority === 'High').length;
  }, [appointments]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appt => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        appt.patientName.toLowerCase().includes(q) ||
        appt.doctorName.toLowerCase().includes(q) ||
        appt.department.toLowerCase().includes(q) ||
        appt.id.toLowerCase().includes(q) ||
        (appt.patientId && appt.patientId.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || appt.status === statusFilter;
      const matchesTriage = triageFilter === 'all' || appt.priority === triageFilter;

      return matchesSearch && matchesStatus && matchesTriage;
    });
  }, [appointments, searchQuery, statusFilter, triageFilter]);

  // Filtered Patients for Quick Lookup
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) return patients.slice(0, 15);
    const q = searchQuery.toLowerCase().trim();
    return patients.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.department.toLowerCase().includes(q)
    );
  }, [patients, searchQuery]);

  const handleQuickCheckIn = (apt: AppointmentRecord) => {
    onUpdateAppointmentStatus(apt.id, 'Waiting', true);
    setRecentCheckinToast(`${apt.patientName} has been checked in and queued for ${apt.doctorName}.`);
    setTimeout(() => setRecentCheckinToast(null), 4000);
  };

  const handleSendToPhysician = (apt: AppointmentRecord) => {
    onUpdateAppointmentStatus(apt.id, 'In Progress');
    setRecentCheckinToast(`${apt.patientName} sent to Room ${apt.room || 'Clinic Suite'} with ${apt.doctorName}.`);
    setTimeout(() => setRecentCheckinToast(null), 4000);
  };

  const handleMarkCompleted = (apt: AppointmentRecord) => {
    onUpdateAppointmentStatus(apt.id, 'Completed');
    setRecentCheckinToast(`Encounter completed for ${apt.patientName}.`);
    setTimeout(() => setRecentCheckinToast(null), 4000);
  };

  const mainContent = (
    <div className="space-y-6">
      {/* Check-In Toast notification */}
      {recentCheckinToast && (
        <div className="p-3.5 rounded-2xl bg-teal-900 text-white shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-200 border border-teal-700">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{recentCheckinToast}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setRecentCheckinToast(null)}
            className="text-xs text-teal-300 hover:text-white font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

        {/* Operational Triage Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Waiting in Lobby</span>
              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{waitingQueue.length}</div>
            <p className="text-[11px] text-amber-700 font-medium">Arrived and ready for triage</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>In Consultation</span>
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Stethoscope className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{inProgressCount}</div>
            <p className="text-[11px] text-blue-700 font-medium">Currently with physician</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Completed Today</span>
              <div className="w-7 h-7 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{completedTodayCount}</div>
            <p className="text-[11px] text-teal-700 font-medium">Visits finalized &amp; billed</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>High Priority / Urgent</span>
              <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{urgentCasesCount}</div>
            <p className="text-[11px] text-rose-700 font-medium">Triage flags requiring priority</p>
          </div>
        </div>

        {/* Tab & Search Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* View Switcher Tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('queue')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'queue'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Live Lobby Queue ({waitingQueue.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('appointments')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'appointments'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarClock className="w-3.5 h-3.5 text-teal-600" />
                <span>All Appointments ({appointments.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('patients')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'patients'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-teal-600" />
                <span>Patient Search / MRN</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px] sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, MRN, phone, doctor..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Status and Triage Filter Pills */}
          {activeTab === 'appointments' && (
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {(['all', 'Scheduled', 'Waiting', 'In Progress', 'Completed'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-teal-600 text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' ? 'All Statuses' : st}
                </button>
              ))}

              <span className="text-[11px] font-semibold text-slate-500 ml-3">Triage Priority:</span>
              {(['all', 'Critical', 'Urgent', 'Normal'] as const).map((pri) => (
                <button
                  key={pri}
                  type="button"
                  onClick={() => setTriageFilter(pri)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                    triageFilter === pri
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pri === 'all' ? 'All Priorities' : pri}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* TAB 1: LIVE LOBBY QUEUE */}
        {activeTab === 'queue' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Front Desk Waiting &amp; Triage Queue</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {waitingQueue.length} Active Patients
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time arrival queue. Check in arriving patients or dispatch them to exam rooms.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenRegisterPatient}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Walk-In</span>
              </button>
            </div>

            {waitingQueue.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Waiting Queue is Clear</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No patients are currently waiting in the front lobby. Arriving patients can be checked in from the All Appointments tab.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('appointments')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  View Scheduled Appointments
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {waitingQueue.map((apt, index) => {
                  const pt = patients.find(p => p.id === apt.patientId || p.name === apt.patientName);
                  const isUrgent = apt.priority === 'Critical' || apt.priority === 'High';

                  return (
                    <div 
                      key={apt.id} 
                      className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-slate-50/80 ${
                        isUrgent ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                          #{index + 1}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{apt.patientName}</h4>
                            {pt?.mrn && (
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                                {pt.mrn}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isUrgent 
                                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {apt.priority || 'Normal Priority'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                              {apt.doctorName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-slate-400" />
                              {apt.department} · Room {apt.room || 'TBD'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              Slot: {apt.time}
                            </span>
                          </div>

                          {apt.chiefComplaint && (
                            <p className="text-xs text-slate-600 italic bg-white/80 p-2 rounded-xl border border-slate-200/80 max-w-xl">
                              &ldquo;{apt.chiefComplaint}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {pt && (
                          <button
                            type="button"
                            onClick={() => onSelectPatient(pt)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                          >
                            View Patient File
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleSendToPhysician(apt)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>Send to Room</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkCompleted(apt)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete Visit</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL TODAY'S APPOINTMENTS & FULL LIST */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Appointments Schedule &amp; Triage Registry
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {filteredAppointments.length} matching appointments
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenNewAppointment}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Appointment</span>
              </button>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No appointments matched the current search or status filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4 font-bold">Patient &amp; MRN</th>
                      <th className="py-3 px-4 font-bold">Physician &amp; Dept</th>
                      <th className="py-3 px-4 font-bold">Time &amp; Room</th>
                      <th className="py-3 px-4 font-bold">Chief Complaint</th>
                      <th className="py-3 px-4 font-bold">Priority</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Front Desk Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.map((apt) => {
                      const pt = patients.find(p => p.id === apt.patientId || p.name === apt.patientName);
                      return (
                        <tr key={apt.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{apt.patientName}</div>
                            {pt?.mrn && (
                              <div className="font-mono text-[10px] text-slate-500">{pt.mrn}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{apt.doctorName}</div>
                            <div className="text-[11px] text-slate-500">{apt.department}</div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-semibold text-slate-800">{apt.time}</div>
                            <div className="text-[11px] text-slate-500">Room {apt.room || '201'}</div>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                            {apt.chiefComplaint || 'General Follow-up'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              apt.priority === 'Critical'
                                ? 'bg-rose-100 text-rose-800'
                                : apt.priority === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {apt.priority || 'Normal'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              apt.status === 'Completed'
                                ? 'bg-teal-50 text-teal-700 border-teal-200'
                                : apt.status === 'Waiting'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : apt.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            {apt.status === 'Scheduled' && (
                              <button
                                type="button"
                                onClick={() => handleQuickCheckIn(apt)}
                                className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition-colors"
                              >
                                Check In
                              </button>
                            )}

                            {apt.status === 'Waiting' && (
                              <button
                                type="button"
                                onClick={() => handleSendToPhysician(apt)}
                                className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-colors"
                              >
                                Send to Room
                              </button>
                            )}

                            {apt.status === 'In Progress' && (
                              <button
                                type="button"
                                onClick={() => handleMarkCompleted(apt)}
                                className="px-3 py-1 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
                              >
                                Complete
                              </button>
                            )}

                            {apt.status === 'Completed' && (
                              <span className="text-[11px] text-teal-700 font-medium inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Checked Out</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PATIENT SEARCH / MRN DIRECTORY */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Patient Registry &amp; Medical Record Number (MRN) Lookup
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rapid search by patient full name, MRN, phone number, or department.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenRegisterPatient}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register New Patient</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-bold">MRN</th>
                    <th className="py-3 px-4 font-bold">Patient Name</th>
                    <th className="py-3 px-4 font-bold">Age / Gender</th>
                    <th className="py-3 px-4 font-bold">Contact Phone</th>
                    <th className="py-3 px-4 font-bold">Department</th>
                    <th className="py-3 px-4 font-bold">Triage Status</th>
                    <th className="py-3 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-teal-700">
                        {p.mrn}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {p.name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {p.age} yrs · {p.gender}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {p.phone}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {p.department}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.triageStatus === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : p.triageStatus === 'Urgent'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.triageStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectPatient(p)}
                          className="px-3 py-1 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                          View File
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
  );

  if (embedded) {
    return (
      <div className="space-y-6">
        {mainContent}
        <LiveStatusModal
          isOpen={liveStatusOpen}
          onClose={() => setLiveStatusOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={onGoHome}
              className="flex items-center gap-2.5 text-left group"
              title="Return to AI Clinic Home"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/25 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                    AI Clinic
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    Clinic Staff
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Front Desk Triage &amp; Patient Check-In Hub
                </div>
              </div>
            </button>
          </div>

          {/* Quick Actions & User Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setLiveStatusOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Queue Status</span>
            </button>

            {onRefreshData && (
              <button
                type="button"
                onClick={onRefreshData}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                title="Refresh Triage Queue"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onOpenRegisterPatient}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Register Walk-in</span>
            </button>

            <button
              type="button"
              onClick={onOpenNewAppointment}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            <div className="hidden md:flex items-center gap-2 text-right">
              <div>
                <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500 font-medium">{currentUser.title || 'Clinic Staff'}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Staff Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {mainContent}
      </main>

      {/* Live Status Telemetry Modal */}
      <LiveStatusModal
        isOpen={liveStatusOpen}
        onClose={() => setLiveStatusOpen(false)}
      />
    </div>
  );
};
