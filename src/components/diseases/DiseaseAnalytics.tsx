import React, { useState } from 'react';
import { 
  ActivitySquare, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldCheck, 
  Search, 
  Filter, 
  Pill, 
  Calendar, 
  Layers, 
  Activity,
  ArrowUpRight,
  Info,
  Users,
  CheckCircle2,
  BarChart2
} from 'lucide-react';
import { DiseaseRecord } from '../../types/clinic';

interface DiseaseAnalyticsProps {
  diseases: DiseaseRecord[];
}

export const DiseaseAnalytics: React.FC<DiseaseAnalyticsProps> = ({
  diseases,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'ranking' | 'cards'>('ranking');

  const filteredDiseases = diseases.filter((dis) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        dis.name.toLowerCase().includes(q) ||
        dis.code.toLowerCase().includes(q) ||
        dis.department.toLowerCase().includes(q) ||
        dis.commonAgeGroup.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (severityFilter !== 'All' && dis.severity.toLowerCase() !== severityFilter.toLowerCase()) {
      return false;
    }

    return true;
  });

  const totalActiveCases = diseases.reduce((acc, d) => acc + d.activeCases, 0);
  const severeCases = diseases.filter(d => d.severity === 'Severe').reduce((acc, d) => acc + d.activeCases, 0);
  const risingDiseases = diseases.filter(d => d.seasonalTrend === 'Rising');

  // Max active cases for relative progress bars
  const maxCases = Math.max(...diseases.map(d => d.activeCases));

  return (
    <div className="space-y-6">
      {/* Top Epidemiology Briefing Banner */}
      <div className="bg-[#0D182E] rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Epidemiology &amp; Outpatient Surveillance
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">{diseases.length} Prevalent ICD-10 Conditions Tracked</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
            Pathology Prevalence &amp; Clinical Recovery Trajectories
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
            Surveillance of outpatient volume rankings, seasonal respiratory surge indicators, age distribution demographics, and standard pharmaceutical regimens.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold font-mono">
            {risingDiseases.length} Seasonal Spike Vectors
          </span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#0D182E] rounded-2xl p-4 border border-slate-800 shadow-md">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Clinical Cases</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {totalActiveCases.toLocaleString()}
            </span>
            <span className="text-xs text-cyan-400 font-semibold">+4.2% Net</span>
          </div>
        </div>

        <div className="bg-[#0D182E] rounded-2xl p-4 border border-rose-500/30 shadow-md">
          <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">Severe Clinical Tier</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
              {severeCases.toLocaleString()}
            </span>
            <span className="text-xs text-rose-400/80 font-semibold">ICU &amp; Telemetry</span>
          </div>
        </div>

        <div className="bg-[#0D182E] rounded-2xl p-4 border border-indigo-500/30 shadow-md">
          <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">Chronic Managed Rate</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-indigo-300 tabular-nums">71.4%</span>
            <span className="text-xs text-indigo-400 font-semibold">Longitudinal Care</span>
          </div>
        </div>

        <div className="bg-[#0D182E] rounded-2xl p-4 border border-emerald-500/30 shadow-md">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Protocol Concordance</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">98.2%</span>
            <span className="text-xs text-emerald-400/80 font-semibold">Guideline-Aligned</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0D182E] rounded-2xl p-4 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0A0F1D] border border-slate-800 rounded-xl text-xs font-semibold">
          {['All', 'Severe', 'Moderate', 'Mild'].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                severityFilter === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              placeholder="Search ICD-10 or diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-[#0A0F1D] border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:bg-[#0E1528] focus:outline-none focus:border-cyan-400 w-60 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-1 border border-slate-800 rounded-xl p-0.5 bg-[#0A0F1D] text-xs">
            <button
              type="button"
              onClick={() => setViewMode('ranking')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${viewMode === 'ranking' ? 'bg-[#182649] text-white font-bold shadow-xs border border-slate-700' : 'text-slate-400 hover:text-white'}`}
            >
              Visual Rankings
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-[#182649] text-white font-bold shadow-xs border border-slate-700' : 'text-slate-400 hover:text-white'}`}
            >
              Pathology Cards
            </button>
          </div>
        </div>
      </div>

      {/* Top 10 Diseases Visual Rankings */}
      {viewMode === 'ranking' ? (
        <div className="bg-[#0D182E] rounded-2xl border border-slate-800 shadow-md overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Top 10 Prevalent Pathologies &amp; Case Volume Distribution
              </h3>
              <p className="text-xs text-slate-400">
                Visual ranking bars showing active caseload, population prevalence, and ICD-10 diagnostic classifications
              </p>
            </div>
            <span className="text-xs font-mono text-purple-300 font-bold bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-500/30">
              Epidemiology Rank
            </span>
          </div>

          <div className="space-y-3.5">
            {filteredDiseases.map((dis, idx) => {
              const relWidth = Math.round((dis.activeCases / maxCases) * 100);

              return (
                <div key={dis.id} className="p-3.5 rounded-xl bg-[#0A0F1D] hover:bg-[#0E1528] border border-slate-800 transition-all space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono font-bold text-slate-500 w-6">#{idx + 1}</span>
                      <span className="font-mono font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30 shrink-0">
                        {dis.code}
                      </span>
                      <span className="font-bold text-white truncate">{dis.name}</span>
                      <span className="text-slate-400 text-[11px]">({dis.department})</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs shrink-0">
                      <span className="font-bold text-slate-200 tabular-nums">
                        {dis.activeCases.toLocaleString()} Cases ({dis.prevalencePercentage}%)
                      </span>
                      <span className={`text-[11px] font-bold flex items-center gap-0.5 ${
                        dis.weeklyChange > 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {dis.weeklyChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{dis.weeklyChange > 0 ? `+${dis.weeklyChange}%` : `${dis.weeklyChange}%`}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        dis.severity === 'Severe'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : dis.severity === 'Moderate'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {dis.severity}
                      </span>
                    </div>
                  </div>

                  {/* Relative volume progress bar */}
                  <div className="h-2.5 w-full bg-[#111C35] rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500' 
                          : idx === 1 
                          ? 'bg-gradient-to-r from-cyan-600 to-teal-500' 
                          : idx === 2 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-500' 
                          : 'bg-gradient-to-r from-indigo-500 to-blue-500'
                      }`}
                      style={{ width: `${relWidth}%` }}
                    />
                  </div>

                  {/* Medications & Demographics Footer */}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                    <div>
                      <span>Age: <strong className="text-slate-200">{dis.commonAgeGroup}</strong></span>
                      <span className="mx-2">·</span>
                      <span>Trend: <strong className="text-slate-200">{dis.seasonalTrend}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Standard Rx:</span>
                      {dis.primaryMedications.map((m, mIdx) => (
                        <span key={mIdx} className="bg-[#111C35] px-1.5 py-0.2 rounded border border-slate-700 text-slate-300 font-medium">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Pathology Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDiseases.map((dis) => (
            <div
              key={dis.id}
              className="bg-[#0D182E] rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/40 shadow-md hover:shadow-cyan-500/10 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30">
                    {dis.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    dis.severity === 'Severe'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : dis.severity === 'Moderate'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {dis.severity}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white leading-snug group-hover:text-cyan-300 transition-colors">{dis.name}</h4>
                <div className="text-xs text-slate-400 mt-0.5">{dis.department} Department</div>

                <div className="p-3 bg-[#0A0F1D] rounded-xl border border-slate-800 mt-3 space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans">Active Cases:</span>
                    <strong className="text-white font-bold">{dis.activeCases}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans">Prevalence Rate:</span>
                    <strong className="text-purple-300 font-bold">{dis.prevalencePercentage}%</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans">Weekly Trajectory:</span>
                    <span className={dis.weeklyChange > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {dis.weeklyChange > 0 ? `+${dis.weeklyChange}%` : `${dis.weeklyChange}%`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <div className="text-slate-500 mb-1">Pharmacotherapy:</div>
                <div className="flex flex-wrap gap-1">
                  {dis.primaryMedications.map((m, i) => (
                    <span key={i} className="px-1.5 py-0.2 rounded bg-[#111C35] text-slate-300 border border-slate-700 font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
