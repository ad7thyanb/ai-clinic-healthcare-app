import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Clock, 
  Activity, 
  Search, 
  TrendingUp, 
  Stethoscope, 
  Calendar, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { DepartmentMetric, DoctorRecord, PatientRecord } from '../../types/clinic';
import { INITIAL_DEPARTMENTS } from '../../mock/clinicData';

interface DepartmentsManagementProps {
  departments?: DepartmentMetric[];
  doctors: DoctorRecord[];
  patients: PatientRecord[];
  onSelectDoctor?: (doc: DoctorRecord) => void;
  onNavigateToAppointments?: () => void;
}

export const DepartmentsManagement: React.FC<DepartmentsManagementProps> = ({
  departments = INITIAL_DEPARTMENTS,
  doctors,
  patients,
  onSelectDoctor,
  onNavigateToAppointments,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Optimal' | 'Near Capacity' | 'High Load'>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentMetric | null>(null);
  const [reallocatedNotice, setReallocatedNotice] = useState<string | null>(null);

  // Compute aggregate metrics
  const totalActivePatients = departments.reduce((acc, d) => acc + d.activePatients, 0);
  const avgOccupancy = Math.round(departments.reduce((acc, d) => acc + d.occupancyPercent, 0) / departments.length);
  const avgWaitTime = (departments.reduce((acc, d) => acc + d.avgWaitMinutes, 0) / departments.length).toFixed(1);
  const totalApts = departments.reduce((acc, d) => acc + d.totalAppointments, 0);

  // Filtered list
  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch = 
      dept.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.headDoctor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || dept.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSimulateReallocation = (deptName: string) => {
    setReallocatedNotice(`Reserve nursing staff and emergency surge beds dispatched to ${deptName}. Bed occupancy balanced.`);
    setTimeout(() => setReallocatedNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Clinical Departments
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {departments.length} Units Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time inpatient census, bed capacity, staffing ratios, and medical division leadership.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToAppointments && (
            <button
              type="button"
              onClick={onNavigateToAppointments}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white text-xs font-bold hover:from-cyan-500 hover:to-indigo-500 transition-all shadow-md shadow-cyan-600/25 active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5 text-white" />
              <span>Department Schedules</span>
            </button>
          )}
        </div>
      </div>

      {/* Reallocation Toast / Alert Notice */}
      {reallocatedNotice && (
        <div className="p-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 flex items-start gap-3 animate-in fade-in duration-200 shadow-md">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-white">Staff Resource Allocation Successful: </span>
            {reallocatedNotice}
          </div>
        </div>
      )}

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D182E] border border-cyan-500/30 shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Active Inpatients</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {totalActivePatients}
          </div>
          <div className="text-[11px] text-cyan-300 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>Across all 6 clinical divisions</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D182E] border border-blue-500/30 shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Average Occupancy</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {avgOccupancy}%
          </div>
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1">
            <span>Operating within target thresholds</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D182E] border border-purple-500/30 shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Avg Triage Dwell</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {avgWaitTime} <span className="text-sm font-semibold text-slate-400">min</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>4.2 min faster than national avg</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D182E] border border-emerald-500/30 shadow-md relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Today's Consultations</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
            {totalApts}
          </div>
          <div className="text-[11px] text-cyan-300 font-medium flex items-center gap-1 mt-1">
            <span>Scheduled across specialized clinics</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0D182E] border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search department or department chief doctor..."
            className="w-full pl-9 pr-4 py-2 bg-[#0A0F1D] border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:bg-[#0E1528] focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#0A0F1D] border border-slate-800 rounded-xl overflow-x-auto">
          {(['All', 'Optimal', 'Near Capacity', 'High Load'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === filter
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredDepartments.map((dept) => {
          const associatedDoctor = doctors.find(d => d.name === dept.headDoctor);

          return (
            <div
              key={dept.department}
              className="p-5 rounded-2xl bg-[#0D182E] border border-slate-800 hover:border-cyan-500/40 shadow-md hover:shadow-cyan-500/10 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header: Department Name & Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm shrink-0 border border-white/10">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight group-hover:text-cyan-300 transition-colors">
                        {dept.department}
                      </h3>
                      <div className="text-xs text-slate-400 font-medium">
                        Division of Clinical Care
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full tabular-nums border ${
                    dept.status === 'Optimal'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : dept.status === 'Near Capacity'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}>
                    {dept.status}
                  </span>
                </div>

                {/* Head Doctor / Medical Director */}
                <div className="p-3 rounded-xl bg-[#0A0F1D] border border-slate-800 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Medical Director
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {dept.headDoctor}
                      </div>
                    </div>
                  </div>

                  {associatedDoctor && onSelectDoctor && (
                    <button
                      type="button"
                      onClick={() => onSelectDoctor(associatedDoctor)}
                      className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-0.5"
                    >
                      <span>Profile</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Key Statistics */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center font-mono">
                  <div className="p-2 rounded-xl bg-[#0A0F1D] border border-slate-800">
                    <span className="text-[10px] font-sans text-slate-400 block">Inpatients</span>
                    <span className="text-sm font-extrabold text-white">{dept.activePatients}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0A0F1D] border border-slate-800">
                    <span className="text-[10px] font-sans text-slate-400 block">Appts Today</span>
                    <span className="text-sm font-extrabold text-white">{dept.totalAppointments}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0A0F1D] border border-slate-800">
                    <span className="text-[10px] font-sans text-slate-400 block">Avg Wait</span>
                    <span className="text-sm font-extrabold text-cyan-400">{dept.avgWaitMinutes}m</span>
                  </div>
                </div>

                {/* Bed Occupancy Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">Bed Occupancy</span>
                    <span className="text-white font-mono font-bold">{dept.occupancyPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#0A0F1D] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        dept.occupancyPercent >= 90
                          ? 'bg-rose-500'
                          : dept.occupancyPercent >= 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${dept.occupancyPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateReallocation(dept.department)}
                  className="flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#111C35] hover:bg-[#162344] border border-slate-800 transition-colors text-center"
                >
                  Resource Surge
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDepartment(dept)}
                  className="py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center gap-1 shadow-sm shadow-cyan-600/25"
                >
                  <span>Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Department Modal View */}
      {selectedDepartment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D182E] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedDepartment.department} Division</h3>
                  <p className="text-xs text-slate-400">Supervised by {selectedDepartment.headDoctor}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDepartment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 mb-6">
              <div className="p-3 bg-[#0A0F1D] rounded-xl border border-slate-800 flex justify-between">
                <span className="text-slate-400">Current Operational Status:</span>
                <span className="font-bold text-white">{selectedDepartment.status}</span>
              </div>
              <div className="p-3 bg-[#0A0F1D] rounded-xl border border-slate-800 flex justify-between">
                <span className="text-slate-400">Active Inpatient Census:</span>
                <span className="font-bold text-white font-mono">{selectedDepartment.activePatients} beds occupied</span>
              </div>
              <div className="p-3 bg-[#0A0F1D] rounded-xl border border-slate-800 flex justify-between">
                <span className="text-slate-400">Estimated Turnaround / Wait:</span>
                <span className="font-bold text-cyan-400 font-mono">{selectedDepartment.avgWaitMinutes} minutes</span>
              </div>
              <div className="p-3 bg-[#0A0F1D] rounded-xl border border-slate-800 flex justify-between">
                <span className="text-slate-400">Scheduled Consultations Today:</span>
                <span className="font-bold text-white font-mono">{selectedDepartment.totalAppointments} sessions</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedDepartment(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#111C35] border border-slate-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSimulateReallocation(selectedDepartment.department);
                  setSelectedDepartment(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/25"
              >
                Optimize Department Flow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
