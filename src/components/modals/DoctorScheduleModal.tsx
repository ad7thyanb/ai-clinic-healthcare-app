import React from 'react';
import { X, Calendar, Clock, User, Stethoscope, Star, CheckCircle2, MapPin } from 'lucide-react';
import { DoctorRecord } from '../../types/clinic';

interface DoctorScheduleModalProps {
  doctor: DoctorRecord | null;
  onClose: () => void;
  onBookAppointment: (doctorId: string) => void;
}

export const DoctorScheduleModal: React.FC<DoctorScheduleModalProps> = ({
  doctor,
  onClose,
  onBookAppointment,
}) => {
  if (!doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#0D182E] rounded-2xl shadow-2xl border border-slate-800 text-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B1327]">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${doctor.avatarGradient} flex items-center justify-center text-white font-bold text-sm shadow-xs border border-white/10`}>
              {doctor.name.replace('Dr. ', '').split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{doctor.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {doctor.department}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {doctor.room} · Next slot: <strong className="text-cyan-400 font-mono">{doctor.nextAvailable}</strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Schedule Timeline */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Today's Consultation Timeline (Oct 07, 2026)
            </h4>
            <span className="text-xs font-mono text-slate-400">
              {(doctor.todaySchedule || []).length} Assigned Encounters
            </span>
          </div>

          <div className="relative border-l-2 border-slate-800 ml-3 space-y-4 py-1">
            {(doctor.todaySchedule || []).map((item, idx) => {
              const isDone = item.status === 'Completed';
              const isCurrent = item.status === 'In Progress' || item.status === 'In Surgery';

              return (
                <div key={idx} className="relative pl-6">
                  {/* Dot on timeline */}
                  <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-[#0D182E] flex items-center justify-center ${
                    isDone 
                      ? 'bg-emerald-500' 
                      : isCurrent 
                      ? 'bg-cyan-500 ring-4 ring-cyan-500/30 animate-pulse' 
                      : 'bg-slate-700'
                  }`} />

                  <div className={`p-3 rounded-xl border text-xs transition-colors ${
                    isCurrent 
                      ? 'bg-cyan-950/30 border-cyan-500/40' 
                      : 'bg-[#080E1C] border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono font-bold text-cyan-300">{item.time}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isDone 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                          : isCurrent 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="font-bold text-white">{item.patient}</div>
                    <div className="text-[11px] text-slate-400">{item.type} Consultation</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0B1327] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Average Consult: <strong className="font-mono text-cyan-400">{doctor.avgConsultationTime} min</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onBookAppointment(doctor.id);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-md shadow-cyan-600/20"
          >
            Add Patient to This Doctor
          </button>
        </div>
      </div>
    </div>
  );
};
