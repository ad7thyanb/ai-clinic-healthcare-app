import React, { useState } from 'react';
import { 
  CalendarClock, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Eye, 
  MapPin, 
  Calendar,
  Building2,
  Sparkles,
  PhoneCall,
  Video
} from 'lucide-react';
import { AppointmentRecord } from '../../types/clinic';

interface AppointmentManagementProps {
  appointments: AppointmentRecord[];
  onOpenNewAppointment: () => void;
  onSelectAppointment: (apt: AppointmentRecord) => void;
  onUpdateStatus: (id: string, status: AppointmentRecord['status'], checkedIn?: boolean) => void;
  searchQuery: string;
}

export const AppointmentManagement: React.FC<AppointmentManagementProps> = ({
  appointments,
  onOpenNewAppointment,
  onSelectAppointment,
  onUpdateStatus,
  searchQuery,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [localSearch, setLocalSearch] = useState<string>('');

  const effectiveSearch = (searchQuery || localSearch).toLowerCase().trim();

  const scheduledCount = appointments.filter(a => a.status === 'Scheduled').length;
  const checkedInCount = appointments.filter(a => a.checkedIn).length;
  const inProgressCount = appointments.filter(a => a.status === 'In Progress' || a.status === 'Urgent Triage').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;
  const urgentCount = appointments.filter(a => a.priority === 'Critical').length;

  const filteredAppointments = appointments.filter((apt) => {
    // Search
    if (effectiveSearch) {
      const match = 
        apt.patientName.toLowerCase().includes(effectiveSearch) ||
        apt.doctorName.toLowerCase().includes(effectiveSearch) ||
        apt.chiefComplaint.toLowerCase().includes(effectiveSearch) ||
        apt.department.toLowerCase().includes(effectiveSearch) ||
        apt.room.toLowerCase().includes(effectiveSearch) ||
        apt.id.toLowerCase().includes(effectiveSearch);
      if (!match) return false;
    }

    // Status filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Checked-in') {
        if (!apt.checkedIn) return false;
      } else if (statusFilter === 'Scheduled') {
        if (apt.status !== 'Scheduled') return false;
      } else if (statusFilter === 'Completed') {
        if (apt.status !== 'Completed') return false;
      } else if (statusFilter === 'In Progress') {
        if (apt.status !== 'In Progress' && apt.status !== 'Urgent Triage') return false;
      } else if (statusFilter === 'Urgent') {
        if (apt.priority !== 'Critical' && apt.status !== 'Urgent Triage') return false;
      } else if (apt.status !== statusFilter) {
        return false;
      }
    }

    // Department filter
    if (departmentFilter !== 'All') {
      if (apt.department.toLowerCase() !== departmentFilter.toLowerCase()) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#0D182E] rounded-2xl p-4 border border-slate-800 shadow-md">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Scheduled Queue</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{scheduledCount}</span>
            <span className="text-xs text-cyan-400 font-semibold">Awaiting time</span>
          </div>
        </div>

        <div className="bg-[#0D182E] rounded-2xl p-4 border border-cyan-500/30 shadow-md">
          <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">Checked-in Patients</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">{checkedInCount}</span>
            <span className="text-xs text-cyan-400 font-semibold">Present at clinic</span>
          </div>
        </div>

        <div className="bg-[#0D182E] rounded-2xl p-4 border border-emerald-500/30 shadow-md">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Completed Today</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{completedCount}</span>
            <span className="text-xs text-emerald-400/80 font-semibold">Discharged</span>
          </div>
        </div>

        <div className="bg-[#0D182E] rounded-2xl p-4 border border-rose-500/30 shadow-md">
          <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Critical Priority</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-rose-400 tabular-nums">{urgentCount}</span>
            <span className="text-xs text-rose-400/80 font-semibold">Immediate attention</span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-[#0D182E] rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Quick Filter & Dropdown */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2 bg-[#0A0F1D] border border-slate-800 rounded-xl px-2.5 py-1">
              <label htmlFor="status-filter-select" className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span>Status:</span>
              </label>
              <select
                id="status-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs py-1 px-2 bg-transparent border-0 focus:outline-none focus:ring-0 font-bold text-cyan-300 cursor-pointer"
              >
                <option value="All" className="bg-[#0D182E] text-slate-200">All ({appointments.length})</option>
                <option value="Scheduled" className="bg-[#0D182E] text-slate-200">Scheduled ({scheduledCount})</option>
                <option value="Checked-in" className="bg-[#0D182E] text-slate-200">Checked-in ({checkedInCount})</option>
                <option value="Completed" className="bg-[#0D182E] text-slate-200">Completed ({completedCount})</option>
              </select>
            </div>

            {/* Quick Status Pill Buttons */}
            <div className="hidden sm:flex items-center gap-1 p-1 bg-[#0A0F1D] border border-slate-800 rounded-xl text-xs font-semibold">
              {(['All', 'Scheduled', 'Checked-in', 'Completed'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === st
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Search, Department Filter & Action */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter schedule..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#0A0F1D] border border-slate-800 rounded-xl focus:bg-[#0E1528] focus:outline-none focus:border-cyan-400 text-slate-100 placeholder:text-slate-500 w-44 transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="text-xs py-1.5 px-3 bg-[#0A0F1D] border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-400 font-medium text-slate-200"
            >
              <option value="All">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Pulmonology">Pulmonology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Nephrology">Nephrology</option>
            </select>

            <div className="flex items-center gap-1 border border-slate-800 rounded-xl p-0.5 bg-[#0A0F1D] text-xs">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                Cards
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenNewAppointment}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View: Table Mode */}
      {viewMode === 'table' ? (
        <div className="bg-[#0D182E] rounded-2xl border border-slate-800 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0A0F1D] border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Time &amp; ID</th>
                  <th className="py-3 px-4">Patient Information</th>
                  <th className="py-3 px-4">Doctor &amp; Specialty</th>
                  <th className="py-3 px-4">Chief Complaint &amp; Notes</th>
                  <th className="py-3 px-4">Room &amp; Type</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Clinical Status</th>
                  <th className="py-3 px-4 text-right">Workflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No appointments matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-[#111C35]/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-white font-mono tabular-nums">{apt.time}</div>
                        <div className="text-[10px] text-cyan-400 font-mono">{apt.id}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{apt.patientName}</span>
                          {apt.checkedIn && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Patient checked-in at reception" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {apt.patientAge}y · {apt.patientGender} · <span className="font-mono text-cyan-400">{apt.patientId}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{apt.doctorName}</div>
                        <div className="text-[11px] text-slate-400">{apt.doctorSpecialty}</div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-slate-200 truncate" title={apt.chiefComplaint}>
                          {apt.chiefComplaint}
                        </div>
                        {apt.notes && (
                          <div className="text-[10px] text-slate-400 italic truncate mt-0.5" title={apt.notes}>
                            Note: {apt.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-300">{apt.room}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          {apt.type === 'Telehealth' ? <Video className="w-3 h-3 text-cyan-400" /> : null}
                          <span>{apt.type} · {apt.durationMinutes}m</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          apt.priority === 'Critical'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : apt.priority === 'High'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-[#111C35] text-slate-300 border-slate-700'
                        }`}>
                          {apt.priority}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          apt.status === 'In Progress'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : apt.status === 'Urgent Triage'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : apt.status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-[#111C35] text-slate-300 border border-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            apt.status === 'In Progress' || apt.status === 'Urgent Triage'
                              ? 'bg-cyan-400 animate-ping'
                              : apt.status === 'Completed'
                              ? 'bg-emerald-400'
                              : 'bg-slate-400'
                          }`} />
                          {apt.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {!apt.checkedIn && apt.status === 'Scheduled' && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(apt.id, 'Scheduled', true)}
                              className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors"
                            >
                              Check-in
                            </button>
                          )}
                          {apt.status === 'Scheduled' && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(apt.id, 'In Progress', true)}
                              className="px-2 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors"
                            >
                              Start
                            </button>
                          )}
                          {(apt.status === 'In Progress' || apt.status === 'Urgent Triage') && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(apt.id, 'Completed')}
                              className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
                            >
                              Finish
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onSelectAppointment(apt)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#111C35] transition-colors"
                            title="View consultation details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-[#0D182E] rounded-2xl p-4 border border-slate-800 hover:border-cyan-500/40 shadow-md hover:shadow-cyan-500/10 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                    {apt.time}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                    apt.priority === 'Critical'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : apt.priority === 'High'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-[#111C35] text-slate-300 border-slate-700'
                  }`}>
                    {apt.priority}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{apt.patientName}</h4>
                <div className="text-xs text-slate-400 mb-2">
                  {apt.patientAge} yrs · {apt.patientGender} · <span className="font-mono text-cyan-400">{apt.patientId}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs space-y-1 mb-3">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{apt.doctorName}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{apt.department} · {apt.room}</div>
                  <div className="text-slate-300 font-medium pt-1 border-t border-slate-800 leading-tight">
                    {apt.chiefComplaint}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  apt.status === 'Completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : apt.status === 'In Progress'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    : 'bg-[#111C35] text-slate-300 border-slate-700'
                }`}>
                  {apt.status}
                </span>

                <div className="flex items-center gap-1">
                  {apt.status !== 'Completed' && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(apt.id, 'Completed')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold text-[11px] transition-colors"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectAppointment(apt)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#111C35] transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
