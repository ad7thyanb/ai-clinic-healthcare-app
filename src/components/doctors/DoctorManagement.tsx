import React, { useState } from 'react';
import { 
  Stethoscope, 
  Star, 
  Clock, 
  Users, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  Plus, 
  CheckCircle2, 
  Activity,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { DoctorRecord } from '../../types/clinic';

interface DoctorManagementProps {
  doctors: DoctorRecord[];
  onSelectDoctor: (doctor: DoctorRecord) => void;
  onOpenBookAppointment: (doctorId?: string) => void;
}

export const DoctorManagement: React.FC<DoctorManagementProps> = ({
  doctors,
  onSelectDoctor,
  onOpenBookAppointment,
}) => {
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDoctors = doctors.filter((doc) => {
    const docName = (doc.name || '').toLowerCase();
    const docSpecialty = (doc.specialty || '').toLowerCase();
    const docDept = (doc.department || '').toLowerCase();
    const docRoom = (doc.room || '').toLowerCase();
    const docStatus = (doc.status || '').toLowerCase();

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        docName.includes(q) ||
        docSpecialty.includes(q) ||
        docDept.includes(q) ||
        docRoom.includes(q);
      if (!match) return false;
    }

    if (departmentFilter !== 'All' && docDept !== departmentFilter.toLowerCase()) {
      return false;
    }

    if (statusFilter !== 'All' && docStatus !== statusFilter.toLowerCase()) {
      return false;
    }

    return true;
  });

  const availableCount = doctors.filter(d => d.status === 'Available').length;
  const inConsultCount = doctors.filter(d => d.status === 'In Consultation').length;
  const inSurgeryCount = doctors.filter(d => d.status === 'In Surgery').length;

  return (
    <div className="space-y-6">
      {/* Top Physician Roster Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#0D182E] rounded-2xl p-4 border border-slate-800 shadow-md">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Medical Staff</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{doctors.length}</span>
            <span className="text-xs text-indigo-400 font-semibold">Board Certified</span>
          </div>
        </div>

        <div className="bg-[#0D182E] rounded-2xl p-4 border border-emerald-500/30 shadow-md">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Available for Walk-ins</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{availableCount}</span>
            <span className="text-xs text-emerald-400/80 font-semibold">Immediate intake</span>
          </div>
        </div>

        <div className="bg-[#0D182E] rounded-2xl p-4 border border-cyan-500/30 shadow-md">
          <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">In Active Consultation</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">{inConsultCount}</span>
            <span className="text-xs text-cyan-400/80 font-semibold">In clinic rooms</span>
          </div>
        </div>

        <div className="bg-[#0D182E] rounded-2xl p-4 border border-purple-500/30 shadow-md">
          <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">In Surgical Suites</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-purple-300 tabular-nums">{inSurgeryCount}</span>
            <span className="text-xs text-purple-400/80 font-semibold">OR Operations</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0D182E] rounded-2xl p-4 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0A0F1D] border border-slate-800 rounded-xl text-xs font-semibold">
          {['All', 'Available', 'In Consultation', 'In Surgery'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search doctor or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-[#0A0F1D] border border-slate-800 rounded-xl focus:bg-[#0E1528] focus:outline-none focus:border-cyan-400 text-slate-100 placeholder:text-slate-500 w-52 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="text-xs py-1.5 px-3 bg-[#0A0F1D] border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-400 font-medium text-slate-200"
          >
            <option value="All">All Departments</option>
            {Array.from(new Set(doctors.map(d => d.department).filter(Boolean))).sort().map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onOpenBookAppointment()}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book with Physician</span>
          </button>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.map((doc) => {
          const loadPercent = Math.round(((doc.consultationsCompleted ?? 0) / (doc.patientsToday || 1)) * 100);

          return (
            <div
              key={doc.id}
              className="bg-[#0D182E] rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/40 shadow-md hover:shadow-cyan-500/10 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Header: Avatar, Name, Specialty, Status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${doc.avatarGradient} flex items-center justify-center text-white font-bold text-sm shadow-sm border border-white/10`}>
                      {doc.name.replace('Dr. ', '').split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {doc.name}
                      </h4>
                      <div className="text-xs text-slate-400 font-medium">{doc.title}</div>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    doc.status === 'Available'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : doc.status === 'In Consultation'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      doc.status === 'Available' ? 'bg-emerald-400 animate-ping' : doc.status === 'In Consultation' ? 'bg-cyan-400' : 'bg-purple-400'
                    }`} />
                    {doc.status}
                  </span>
                </div>

                {/* Subtitle & Specialty */}
                <div className="p-2.5 rounded-xl bg-[#0A0F1D] border border-slate-800 text-xs mb-3 space-y-1">
                  <div className="text-slate-200 font-semibold">{doc.specialty}</div>
                  <div className="text-[11px] text-slate-400">{doc.education}</div>
                  <div className="text-[11px] text-cyan-400 font-semibold">{doc.experience}</div>
                </div>

                {/* Performance Metrics: Rating, Room, Avg Consult */}
                <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-slate-800 text-xs mb-3 font-mono">
                  <div>
                    <div className="text-[10px] text-slate-400 font-sans">Rating</div>
                    <div className="font-bold text-amber-400 flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{doc.rating}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-sans">Avg Duration</div>
                    <div className="font-bold text-slate-200">{doc.avgConsultationTime} min</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-sans">Avg Wait</div>
                    <div className="font-bold text-emerald-400">{doc.avgWaitingTime} min</div>
                  </div>
                </div>

                {/* Daily Consult Load Progress */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Today's Schedule Load</span>
                    <span className="font-mono text-slate-200 font-bold tabular-nums">
                      {doc.consultationsCompleted} / {doc.patientsToday} ({loadPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#0A0F1D] rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r ${doc.avatarGradient}`}
                      style={{ width: `${loadPercent}%` }}
                    />
                  </div>
                </div>

                {/* Location and Next Slot */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{doc.room}</span>
                  </span>
                  <span>Next slot: <strong className="text-cyan-400 font-mono">{doc.nextAvailable}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectDoctor(doc)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-[#111C35] hover:bg-[#162344] text-slate-200 text-xs font-bold border border-slate-800 transition-colors flex items-center justify-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>View Timeline ({doc.todaySchedule?.length ?? 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenBookAppointment(doc.id)}
                  className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all active:scale-95"
                >
                  Schedule
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
