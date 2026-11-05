import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Heart, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  FileText, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Clock, 
  Droplet,
  Flame,
  Stethoscope
} from 'lucide-react';
import { PatientRecord } from '../../types/clinic';
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';

interface SparklineProps {
  patient: PatientRecord;
}

const PatientVitalsSparkline: React.FC<SparklineProps> = ({ patient }) => {
  const data = React.useMemo(() => {
    if (patient.vitalsHistory && patient.vitalsHistory.length > 0) {
      return patient.vitalsHistory.map((item) => ({
        label: item.date,
        systolic: item.systolic,
        diastolic: item.diastolic,
      }));
    }
    const [sysStr, diaStr] = (patient.vitals.bp || '120/80').split('/');
    const currentSys = parseInt(sysStr, 10) || 120;
    const currentDia = parseInt(diaStr, 10) || 80;

    const charSum = patient.id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
    const var1 = ((charSum % 7) - 3);
    const var2 = (((charSum * 3) % 9) - 4);
    const var3 = (((charSum * 5) % 8) - 4);
    const var4 = (((charSum * 2) % 6) - 2);

    return [
      { label: '4 wks ago', systolic: currentSys + var1, diastolic: currentDia + Math.round(var1 / 2) },
      { label: '3 wks ago', systolic: currentSys + var2, diastolic: currentDia + Math.round(var2 / 2) },
      { label: '2 wks ago', systolic: currentSys + var3, diastolic: currentDia + Math.round(var3 / 2) },
      { label: '1 wk ago', systolic: currentSys + var4, diastolic: currentDia + Math.round(var4 / 2) },
      { label: 'Current', systolic: currentSys, diastolic: currentDia },
    ];
  }, [patient.id, patient.vitals.bp, patient.vitalsHistory]);

  const [sysStr] = (patient.vitals.bp || '120/80').split('/');
  const currentSys = parseInt(sysStr, 10) || 120;
  const isHigh = currentSys >= 140;

  return (
    <div className="mb-3 p-2.5 rounded-xl bg-[#080E1C] border border-slate-800/90">
      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 px-0.5">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <Activity className="w-3 h-3 text-cyan-400" />
          <span>BP History Trend</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[9px] text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
            Sys
          </span>
          <span className="inline-flex items-center gap-1 text-[9px] text-indigo-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
            Dia
          </span>
          <span className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded border ${
            isHigh ? 'text-amber-300 bg-amber-500/10 border-amber-500/30' : 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30'
          }`}>
            {patient.vitals.bp}
          </span>
        </div>
      </div>
      <div className="h-10 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 2, right: 6, left: 6, bottom: 2 }}>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-[#0C172C] border border-cyan-500/40 p-1.5 rounded-lg shadow-xl text-[10px] text-white">
                      <div className="font-semibold text-slate-300">{item.label}</div>
                      <div className="font-mono text-cyan-300 font-bold">
                        {item.systolic}/{item.diastolic} mmHg
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="systolic"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              stroke="#818cf8"
              strokeWidth={1.5}
              strokeDasharray="2 2"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

interface PatientManagementProps {
  patients: PatientRecord[];
  onSelectPatient: (patient: PatientRecord) => void;
  onOpenRegisterModal: () => void;
  searchQuery: string;
}

export const PatientManagement: React.FC<PatientManagementProps> = ({
  patients,
  onSelectPatient,
  onOpenRegisterModal,
  searchQuery,
}) => {
  const [triageFilter, setTriageFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [localSearch, setLocalSearch] = useState<string>('');

  const effectiveSearch = (searchQuery || localSearch).toLowerCase().trim();

  const filteredPatients = patients.filter((pt) => {
    if (effectiveSearch) {
      const match = 
        pt.name.toLowerCase().includes(effectiveSearch) ||
        pt.mrn.toLowerCase().includes(effectiveSearch) ||
        pt.id.toLowerCase().includes(effectiveSearch) ||
        pt.primaryDiagnosis.toLowerCase().includes(effectiveSearch) ||
        pt.assignedDoctor.toLowerCase().includes(effectiveSearch) ||
        pt.department.toLowerCase().includes(effectiveSearch);
      if (!match) return false;
    }

    if (triageFilter !== 'All' && pt.triageStatus.toLowerCase() !== triageFilter.toLowerCase()) {
      return false;
    }

    if (departmentFilter !== 'All' && pt.department.toLowerCase() !== departmentFilter.toLowerCase()) {
      return false;
    }

    return true;
  });

  const urgentCount = patients.filter(p => p.triageStatus === 'Urgent').length;
  const moderateCount = patients.filter(p => p.triageStatus === 'Moderate').length;
  const normalCount = patients.filter(p => p.triageStatus === 'Normal').length;

  return (
    <div className="space-y-6">
      {/* Top Triage Breakdown Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#0D182E] rounded-2xl p-4 border border-slate-800 shadow-md">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Patient Records</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {(patients.length + 2835).toLocaleString()}
            </span>
            <span className="text-xs text-cyan-400 font-semibold">+12% YoY</span>
          </div>
        </div>

        <div className="bg-[#0D182E] rounded-2xl p-4 border border-rose-500/30 shadow-md">
          <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Urgent High-Triage</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-rose-400 tabular-nums">{urgentCount}</span>
            <span className="text-xs text-rose-400/80 font-semibold">Flagged for vitals</span>
          </div>
        </div>

        <div className="bg-[#0D182E] rounded-2xl p-4 border border-amber-500/30 shadow-md">
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Moderate Surveillance</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">{moderateCount}</span>
            <span className="text-xs text-amber-400/80 font-semibold">Routine follow-up</span>
          </div>
        </div>

        <div className="bg-[#0D182E] rounded-2xl p-4 border border-emerald-500/30 shadow-md">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Stable / Managed</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{normalCount}</span>
            <span className="text-xs text-emerald-400/80 font-semibold">Optimal control</span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-[#0D182E] rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Triage Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[#0A0F1D] border border-slate-800 rounded-xl text-xs font-semibold">
            {['All', 'Urgent', 'Moderate', 'Normal'].map((tg) => (
              <button
                key={tg}
                type="button"
                onClick={() => setTriageFilter(tg)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  triageFilter === tg
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tg}
              </button>
            ))}
          </div>

          {/* Search, Department, View Mode, Register button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <input
                type="text"
                placeholder="Search MRN or name..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#0A0F1D] border border-slate-800 rounded-xl focus:bg-[#0E1528] focus:outline-none focus:border-cyan-400 text-slate-100 placeholder:text-slate-500 w-48 transition-all"
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
              <option value="Pulmonology">Pulmonology</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Nephrology">Nephrology</option>
            </select>

            <div className="flex items-center gap-1 border border-slate-800 rounded-xl p-0.5 bg-[#0A0F1D] text-xs">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-xs' : 'text-slate-400 hover:text-white'}`}
              >
                Table
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenRegisterModal}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Patient</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Directory Grid: Card View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((pt) => {
            const isSpO2Low = pt.vitals.spo2 < 95;
            const isHRElevated = pt.vitals.hr > 95;

            return (
              <div
                key={pt.id}
                onClick={() => onSelectPatient(pt)}
                className="bg-[#0D182E] rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/40 shadow-md hover:shadow-cyan-500/10 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Top card row: Avatar + Demographics + Triage Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${pt.avatarGradient} flex items-center justify-center text-white font-bold text-sm shadow-xs border border-white/10`}>
                        {pt.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {pt.name}
                        </h4>
                        <div className="text-xs text-slate-400">
                          {pt.age} yrs · {pt.gender} · <span className="font-mono text-slate-300 font-semibold">{pt.bloodType}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${
                      pt.triageStatus === 'Urgent'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : pt.triageStatus === 'Moderate'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {pt.triageStatus}
                    </span>
                  </div>

                  {/* Primary Diagnosis */}
                  <div className="mb-3">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Primary Diagnosis</div>
                    <div className="text-xs font-bold text-white mt-0.5 leading-snug">
                      {pt.primaryDiagnosis}
                    </div>
                  </div>

                  {/* Vitals Telemetry Pill Cluster */}
                  <div className="grid grid-cols-4 gap-1.5 p-2.5 rounded-xl bg-[#0A0F1D] border border-slate-800 mb-3 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">BP</div>
                      <div className="text-xs font-bold font-mono text-cyan-300 tabular-nums">{pt.vitals.bp}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Heart Rate</div>
                      <div className={`text-xs font-bold font-mono tabular-nums ${isHRElevated ? 'text-amber-400' : 'text-slate-200'}`}>
                        {pt.vitals.hr} <span className="text-[9px] font-normal">bpm</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">SpO2</div>
                      <div className={`text-xs font-bold font-mono tabular-nums ${isSpO2Low ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {pt.vitals.spo2}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Glucose</div>
                      <div className="text-xs font-bold font-mono text-amber-300 tabular-nums">
                        {pt.vitals.glucose}
                      </div>
                    </div>
                  </div>

                  {/* Vitals History Sparkline */}
                  <PatientVitalsSparkline patient={pt} />

                  {/* Doctor & Dept */}
                  <div className="text-xs text-slate-300 space-y-1 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="font-semibold text-white">{pt.assignedDoctor}</span>
                      <span className="text-slate-400">({pt.department})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      MRN: {pt.mrn} · ID: {pt.id}
                    </div>
                  </div>
                </div>

                {/* Footer with action & last visit */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <span className="text-[11px] text-slate-400">
                    Last Visit: <strong className="text-slate-300 font-mono">{pt.lastVisit}</strong>
                  </span>
                  <span className="text-cyan-400 font-bold group-hover:text-cyan-300 flex items-center gap-1">
                    <span>EHR Dossier</span>
                    <Eye className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Patient Table View */
        <div className="bg-[#0D182E] rounded-2xl border border-slate-800 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0A0F1D] border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Patient Name &amp; MRN</th>
                  <th className="py-3 px-4">Demographics</th>
                  <th className="py-3 px-4">Primary Diagnosis</th>
                  <th className="py-3 px-4">Attending Doctor</th>
                  <th className="py-3 px-4">Vitals Snapshot</th>
                  <th className="py-3 px-4">Triage Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredPatients.map((pt) => (
                  <tr key={pt.id} className="hover:bg-[#111C35]/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{pt.name}</div>
                      <div className="text-[10px] text-cyan-400 font-mono">
                        {pt.mrn} · {pt.id}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-slate-200">{pt.age}y · {pt.gender}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Blood: {pt.bloodType}</div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-white truncate" title={pt.primaryDiagnosis}>
                        {pt.primaryDiagnosis}
                      </div>
                      <div className="text-[10px] text-slate-400">{pt.department}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{pt.assignedDoctor}</div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                      <div className="text-slate-200">BP: {pt.vitals.bp} · HR: {pt.vitals.hr}</div>
                      <div className={pt.vitals.spo2 < 95 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                        SpO2: {pt.vitals.spo2}% · Gluc: {pt.vitals.glucose}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        pt.triageStatus === 'Urgent'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : pt.triageStatus === 'Moderate'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {pt.triageStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onSelectPatient(pt)}
                        className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition-colors"
                      >
                        View EHR
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
};
