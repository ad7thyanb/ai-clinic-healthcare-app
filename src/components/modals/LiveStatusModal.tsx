import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  Activity, 
  CheckCircle2, 
  Server, 
  Clock, 
  Users, 
  BedDouble, 
  RefreshCw, 
  ShieldCheck, 
  Stethoscope, 
  Calendar, 
  AlertTriangle, 
  ChevronRight, 
  Filter, 
  Layers, 
  ArrowUpRight,
  Database,
  Radio,
  Timer
} from 'lucide-react';
import { fetchLiveClinicStatus, LiveClinicStatus, DoctorLiveItem, AppointmentLiveItem, WaitingQueueItem } from '../../api/clinicApi';

interface LiveStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveStatusModal: React.FC<LiveStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [statusData, setStatusData] = useState<LiveClinicStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(10);
  
  // Tab view: 'overview' | 'doctors' | 'appointments' | 'queue'
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'appointments' | 'queue'>('overview');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [apptFilter, setApptFilter] = useState<string>('all');

  const loadLiveStatus = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const data = await fetchLiveClinicStatus();
      setStatusData(data);
      setCountdown(10);
    } catch (err) {
      console.error('Failed to fetch dynamic live status:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load when modal opens
  useEffect(() => {
    if (isOpen) {
      loadLiveStatus(false);
    }
  }, [isOpen, loadLiveStatus]);

  // Automatic Refresh every 10 seconds
  useEffect(() => {
    if (!isOpen || !autoRefresh) return;
    
    // Countdown ticker
    const ticker = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 10 : prev - 1));
    }, 1000);

    // Dynamic data fetch interval
    const fetchInterval = setInterval(() => {
      loadLiveStatus(true);
    }, 10000);

    return () => {
      clearInterval(ticker);
      clearInterval(fetchInterval);
    };
  }, [isOpen, autoRefresh, loadLiveStatus]);

  if (!isOpen) return null;

  // Filtered doctors
  const displayedDoctors = (statusData?.doctors || []).filter((doc) => {
    if (doctorFilter === 'all') return true;
    return doc.status.toLowerCase() === doctorFilter.toLowerCase();
  });

  // Filtered appointments
  const displayedAppointments = (statusData?.appointments || []).filter((appt) => {
    if (apptFilter === 'all') return true;
    return appt.status.toLowerCase() === apptFilter.toLowerCase();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl lg:max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="AI Clinic Live Status"
      >
        {/* ========================================================= */}
        {/* MODAL HEADER                                              */}
        {/* ========================================================= */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">AI Clinic Live Status</h2>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Operational
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>Real-time Doctor, Appointment &amp; Queue Telemetry</span>
                <span className="text-slate-600 hidden sm:inline">&bull;</span>
                {statusData && (
                  <span className="text-slate-300 font-mono hidden sm:inline">
                    Updated: <strong className="text-cyan-400">{statusData.lastUpdated}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Toolbar: Manual Refresh + Auto Refresh Toggle + Close */}
          <div className="flex items-center gap-2">
            {/* Auto Refresh Toggle Badge */}
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                autoRefresh
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 shadow-xs'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={autoRefresh ? 'Auto-refresh active every 10s' : 'Auto-refresh paused'}
            >
              <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Auto-refresh</span>
              <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-slate-900/60 text-cyan-300">
                {autoRefresh ? `${countdown}s` : 'Off'}
              </span>
            </button>

            {/* Manual Refresh Button */}
            <button
              type="button"
              onClick={() => loadLiveStatus(false)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition-all active:scale-95 disabled:opacity-60 shadow-xs"
              title="Manual status refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 ml-1"
              aria-label="Close Live Status"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SUBHEADER TABS & DATA SOURCE BADGE                        */}
        {/* ========================================================= */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Navigation Segments */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('doctors')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'doctors'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Doctor Status</span>
              <span className={`text-[10px] font-mono px-1 rounded ${activeTab === 'doctors' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                {statusData?.doctorCounts.total || 0}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('appointments')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'appointments'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Appointments</span>
              <span className={`text-[10px] font-mono px-1 rounded ${activeTab === 'appointments' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                {statusData?.appointmentCounts.total || 0}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'queue'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Waiting Queue</span>
              <span className={`text-[10px] font-mono px-1 rounded ${activeTab === 'queue' ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-500/20 text-amber-300'}`}>
                {statusData?.waitingQueue.totalWaiting || 0}
              </span>
            </button>
          </div>

          {/* Transparent Data Source / MySQL Architecture Indicator */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Data Engine:</span>
              <strong className="text-white">
                {statusData?.isDatabaseConnected ? 'MySQL Connected' : 'Application EHR (MySQL-Ready)'}
              </strong>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SCROLLABLE MAIN CONTENT AREA                              */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
          
          {/* ========================================================= */}
          {/* TOP LIVE METRIC KPI SUMMARY STRIP                         */}
          {/* ========================================================= */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Doctors Status KPI */}
            <div 
              onClick={() => setActiveTab('doctors')}
              className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Doctors</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">
                  {statusData?.doctorCounts.inConsultation || 0} active
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                {statusData?.doctorCounts.total || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span className="text-emerald-400 font-semibold">{statusData?.doctorCounts.available || 0} Available</span>
                <span className="text-amber-400">{statusData?.doctorCounts.waiting || 0} Waiting</span>
              </div>
            </div>

            {/* Today Appointments KPI */}
            <div 
              onClick={() => setActiveTab('appointments')}
              className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Appointments</span>
                </span>
                <span className="text-[10px] font-mono text-indigo-400 font-bold">Today</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                {statusData?.appointmentCounts.total || 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span className="text-blue-300">{statusData?.appointmentCounts.scheduled || 0} Scheduled</span>
                <span className="text-emerald-400">{statusData?.appointmentCounts.completed || 0} Done</span>
              </div>
            </div>

            {/* Waiting Queue KPI */}
            <div 
              onClick={() => setActiveTab('queue')}
              className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Waiting Queue</span>
                </span>
                <span className="text-[10px] font-mono text-amber-400 font-bold">In Clinic</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                {statusData?.waitingQueue.totalWaiting || 0}{' '}
                <span className="text-xs font-normal text-slate-400">patients</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Avg wait: <strong className="text-cyan-300 font-mono">{statusData?.waitingQueue.avgWaitTimeMinutes || 8} min</strong>
              </div>
            </div>

            {/* Telemetry Latency KPI */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
                <span className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-purple-400" />
                  <span>Sync Health</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">99.98%</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                {statusData?.systemTelemetry.serverLatency || '14ms'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span className="text-emerald-400">HL7 / FHIR R4</span>
                <span className="text-cyan-400">256-bit AES</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* TAB 1: OVERVIEW COMPREHENSIVE VIEW                        */}
          {/* ========================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* 1. DOCTOR STATUS BREAKDOWN (5 Required Categories) */}
              <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-cyan-400" />
                      <span>Doctor Status (5 Categories)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Current clinical attendance and examination room activity</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('doctors')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    <span>View all {statusData?.doctorCounts.total} doctors</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 5 Status Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                    <div className="text-[11px] font-semibold text-emerald-300">Available</div>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">
                      {statusData?.doctorCounts.available || 0}
                    </div>
                    <div className="text-[10px] text-emerald-400/80 mt-0.5">Ready for consult</div>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                    <div className="text-[11px] font-semibold text-cyan-300">In Consultation</div>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">
                      {statusData?.doctorCounts.inConsultation || 0}
                    </div>
                    <div className="text-[10px] text-cyan-400/80 mt-0.5">Actively in session</div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
                    <div className="text-[11px] font-semibold text-amber-300">Waiting</div>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">
                      {statusData?.doctorCounts.waiting || 0}
                    </div>
                    <div className="text-[10px] text-amber-400/80 mt-0.5">Between arrivals</div>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30">
                    <div className="text-[11px] font-semibold text-indigo-300">Completed</div>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">
                      {statusData?.doctorCounts.completed || 0}
                    </div>
                    <div className="text-[10px] text-indigo-400/80 mt-0.5">Shift quota finished</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-300">Unavailable</div>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">
                      {statusData?.doctorCounts.unavailable || 0}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Surgery / On Break</div>
                  </div>
                </div>
              </div>

              {/* 2. APPOINTMENT STATUS BREAKDOWN (5 Required Categories) */}
              <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <span>Appointment Status (5 Categories)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Today's patient schedule and progress states</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('appointments')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <span>View all appointments</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 5 Appointment Status Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30">
                    <div className="text-[11px] font-semibold text-blue-300">Scheduled</div>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">
                      {statusData?.appointmentCounts.scheduled || 0}
                    </div>
                    <div className="text-[10px] text-blue-400/80 mt-0.5">Upcoming today</div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30">
                    <div className="text-[11px] font-semibold text-amber-300">Waiting</div>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">
                      {statusData?.appointmentCounts.waiting || 0}
                    </div>
                    <div className="text-[10px] text-amber-400/80 mt-0.5">Checked-in queue</div>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                    <div className="text-[11px] font-semibold text-cyan-300">In Consultation</div>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">
                      {statusData?.appointmentCounts.inConsultation || 0}
                    </div>
                    <div className="text-[10px] text-cyan-400/80 mt-0.5">In examination bay</div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                    <div className="text-[11px] font-semibold text-emerald-300">Completed</div>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">
                      {statusData?.appointmentCounts.completed || 0}
                    </div>
                    <div className="text-[10px] text-emerald-400/80 mt-0.5">Chart finalized</div>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30">
                    <div className="text-[11px] font-semibold text-rose-300">Cancelled</div>
                    <div className="text-xl font-bold font-mono text-white mt-0.5">
                      {statusData?.appointmentCounts.cancelled || 0}
                    </div>
                    <div className="text-[10px] text-rose-400/80 mt-0.5">Cancelled / No-show</div>
                  </div>
                </div>
              </div>

              {/* 3. WAITING QUEUE PREVIEW */}
              <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Live Waiting Queue ({statusData?.waitingQueue.totalWaiting || 0} Patients)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Patients checked-in and awaiting physician triage or examination</p>
                  </div>
                  <span className="text-xs text-amber-300 font-mono px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                    Average wait: {statusData?.waitingQueue.avgWaitTimeMinutes || 8} min
                  </span>
                </div>

                {statusData && statusData.waitingQueue.patients.length > 0 ? (
                  <div className="space-y-2">
                    {statusData.waitingQueue.patients.slice(0, 4).map((pt, idx) => (
                      <div 
                        key={idx}
                        className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all text-xs gap-2"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-bold text-[11px] flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2">
                              <span>{pt.patientName}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                pt.priority === 'Critical'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : pt.priority === 'High'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              }`}>
                                {pt.priority}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {pt.department} &bull; Assigned to <strong className="text-slate-300">{pt.doctorName}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-amber-300 font-mono font-bold flex items-center gap-1">
                              <Timer className="w-3.5 h-3.5 text-amber-400" />
                              <span>{pt.waitTimeMinutes} min wait</span>
                            </div>
                            <div className="text-[10px] text-slate-500">Appt: {pt.time}</div>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300">
                            {pt.room}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No patients currently waiting in queue. All examination rooms clear.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: DOCTOR STATUS DETAILS                              */}
          {/* ========================================================= */}
          {activeTab === 'doctors' && (
            <div className="space-y-4">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px] mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-cyan-400" />
                  Filter by:
                </span>
                {['all', 'Available', 'In Consultation', 'Waiting', 'Completed', 'Unavailable'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setDoctorFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      doctorFilter === st
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-xs'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {st === 'all' ? 'All Doctors' : st}
                  </button>
                ))}
              </div>

              {/* Doctors List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {displayedDoctors.map((doc) => {
                  const getStatusBadge = (st: DoctorLiveItem['status']) => {
                    switch (st) {
                      case 'Available':
                        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                      case 'In Consultation':
                        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
                      case 'Waiting':
                        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                      case 'Completed':
                        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
                      case 'Unavailable':
                        return 'bg-slate-800 text-slate-400 border-slate-700';
                      default:
                        return 'bg-slate-800 text-slate-300 border-slate-700';
                    }
                  };

                  return (
                    <div 
                      key={doc.id}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${doc.avatarGradient} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm`}>
                            {doc.name.split(' ').slice(1, 2)[0]?.slice(0, 1) || 'D'}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">{doc.name}</h4>
                            <p className="text-[11px] text-cyan-300/90 font-medium">{doc.specialty}</p>
                            <p className="text-[10px] text-slate-500">{doc.department} &bull; {doc.room}</p>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        {doc.status === 'In Consultation' && doc.currentPatient ? (
                          <span className="text-cyan-300">
                            Examining: <strong>{doc.currentPatient}</strong>
                          </span>
                        ) : (
                          <span>Consults today: <strong>{doc.consultationsCompleted}/{doc.patientsToday}</strong></span>
                        )}
                        <span className="font-mono text-slate-500">Next: {doc.nextAvailable}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: APPOINTMENT STATUS DETAILS                         */}
          {/* ========================================================= */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px] mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-indigo-400" />
                  Filter by:
                </span>
                {['all', 'Scheduled', 'Waiting', 'In Consultation', 'Completed', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setApptFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      apptFilter === st
                        ? 'bg-indigo-500 text-white border-indigo-400 font-bold shadow-xs'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {st === 'all' ? 'All Appointments' : st}
                  </button>
                ))}
              </div>

              {/* Appointments Table / Cards */}
              <div className="space-y-2">
                {displayedAppointments.map((appt) => {
                  const getApptStatusBadge = (st: AppointmentLiveItem['status']) => {
                    switch (st) {
                      case 'Scheduled':
                        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
                      case 'Waiting':
                        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                      case 'In Consultation':
                        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
                      case 'Completed':
                        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                      case 'Cancelled':
                        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                      default:
                        return 'bg-slate-800 text-slate-300 border-slate-700';
                    }
                  };

                  return (
                    <div 
                      key={appt.id}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{appt.patientName}</span>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                            {appt.id}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                            {appt.type}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {appt.doctorName} &bull; {appt.department} &bull; <span className="text-slate-500">{appt.room}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-mono text-cyan-300 font-semibold">{appt.time}</div>
                          {appt.status === 'Waiting' && (
                            <div className="text-[10px] text-amber-400 font-mono">{appt.waitTimeMinutes}m in wait</div>
                          )}
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getApptStatusBadge(appt.status)}`}>
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: FULL WAITING QUEUE LIST                            */}
          {/* ========================================================= */}
          {activeTab === 'queue' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-amber-200 text-xs sm:text-sm">Active In-Clinic Waiting Room</h4>
                  <p className="text-[11px] text-slate-400">
                    Real-time queue sequencing ordered by triage acuity and duration waiting.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-amber-300">
                    {statusData?.waitingQueue.totalWaiting || 0}
                  </div>
                  <div className="text-[10px] text-slate-400">Patients in waiting</div>
                </div>
              </div>

              <div className="space-y-2">
                {(statusData?.waitingQueue.patients || []).map((pt, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{pt.patientName}</h4>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                            pt.priority === 'Critical'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : pt.priority === 'High'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {pt.priority}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Assigned: <strong className="text-slate-200">{pt.doctorName}</strong> &bull; {pt.department}
                        </p>
                        {pt.chiefComplaint && (
                          <p className="text-slate-500 text-[11px] mt-0.5 italic">
                            Complaint: "{pt.chiefComplaint}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-amber-300 font-mono font-bold flex items-center gap-1 text-sm">
                          <Timer className="w-4 h-4 text-amber-400" />
                          <span>{pt.waitTimeMinutes} min</span>
                        </div>
                        <div className="text-[10px] text-slate-500">Scheduled: {pt.time}</div>
                      </div>
                      <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300">
                        {pt.room}
                      </span>
                    </div>
                  </div>
                ))}

                {(statusData?.waitingQueue.patients || []).length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No patients currently waiting. The outpatient waiting bay is currently clear.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* BOTTOM INFRASTRUCTURE & BACKEND READINESS STATUS          */}
          {/* ========================================================= */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-white">Clinical Telemetry Engine</span>
                <span className="text-slate-500 text-[11px] ml-2">
                  {statusData?.systemTelemetry.databaseEngine}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono">
              <span>Uptime: <strong className="text-emerald-400">{statusData?.systemTelemetry.uptime}</strong></span>
              <span>Latency: <strong className="text-cyan-400">{statusData?.systemTelemetry.serverLatency}</strong></span>
              <span>FHIR R4: <strong className="text-purple-400">{statusData?.systemTelemetry.hl7FhirStatus}</strong></span>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* MODAL FOOTER                                              */}
        {/* ========================================================= */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Last refreshed at: <strong className="text-slate-200 font-mono">{statusData?.lastUpdated}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadLiveStatus(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3 h-3 text-cyan-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Update Now</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-white hover:bg-slate-200 transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
