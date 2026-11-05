import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  Stethoscope, 
  ShieldAlert, 
  Layers, 
  Zap, 
  Calendar,
  Users,
  Check,
  FileCheck,
  BarChart3,
  Building2,
  ChevronRight
} from 'lucide-react';
import { ClinicInsight } from '../../types/clinic';

interface AIClinicInsightsProps {
  insights: ClinicInsight[];
  onUpdateStatus: (id: string, status: ClinicInsight['status']) => void;
  onOpenBookAppointment: (doctorId?: string, complaint?: string) => void;
  onOpenReports: () => void;
}

export const AIClinicInsights: React.FC<AIClinicInsightsProps> = ({
  insights,
  onUpdateStatus,
  onOpenBookAppointment,
  onOpenReports,
}) => {
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'implemented'>('all');

  const filteredInsights = insights.filter((ins) => {
    if (filterPriority !== 'All' && ins.priority.toLowerCase() !== filterPriority.toLowerCase()) {
      return false;
    }
    if (categoryFilter !== 'All' && ins.category.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }
    if (activeTab === 'active' && ins.status !== 'Active') {
      return false;
    }
    if (activeTab === 'implemented' && ins.status !== 'Implemented' && ins.status !== 'Reviewed') {
      return false;
    }
    return true;
  });

  const criticalCount = insights.filter(i => i.priority === 'Critical').length;
  const highCount = insights.filter(i => i.priority === 'High').length;
  const implementedCount = insights.filter(i => i.status === 'Implemented').length;

  return (
    <div className="space-y-6">
      {/* Top Professional Header */}
      <div className="bg-gradient-to-br from-[#12102E] via-[#0E152E] to-[#1A123E] rounded-2xl p-5 border border-indigo-500/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Clinical Intelligence &amp; Predictive Analytics
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono">5 Continuous Surveillance Models Active</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
            Algorithmic Operations &amp; Diagnostic Quality Assurance
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
            Automated detection of patient flow bottlenecks, appointment no-show mitigation, cardiorenal multi-marker correlations, and epidemiological staffing optimization.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenReports}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-[#111C35] hover:bg-[#162344] border border-cyan-500/30 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Audit Reports</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Metric Badges with Blue, Cyan, Indigo and Purple Gradients */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-4 text-white shadow-lg border border-blue-400/20 group hover:-translate-y-0.5 transition-transform">
          <div className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider">Critical Bottlenecks</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{criticalCount}</span>
            <span className="text-xs text-blue-200/90 font-semibold">Immediate routing</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-teal-600 to-blue-700 p-4 text-white shadow-lg border border-cyan-400/20 group hover:-translate-y-0.5 transition-transform">
          <div className="text-[11px] font-semibold text-cyan-100 uppercase tracking-wider">Diagnostic Flags</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{highCount}</span>
            <span className="text-xs text-cyan-200/90 font-semibold">Elevated stroke/AFib risk</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-800 p-4 text-white shadow-lg border border-indigo-400/20 group hover:-translate-y-0.5 transition-transform">
          <div className="text-[11px] font-semibold text-indigo-100 uppercase tracking-wider">Protocols Applied</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">{implementedCount}</span>
            <span className="text-xs text-indigo-200/90 font-semibold">Active in clinic</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-rose-700 p-4 text-white shadow-lg border border-purple-400/20 group hover:-translate-y-0.5 transition-transform">
          <div className="text-[11px] font-semibold text-purple-100 uppercase tracking-wider">Mean Prediction Confidence</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">94.2%</span>
            <span className="text-xs text-purple-200/90 font-semibold">Concordance rate</span>
          </div>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="bg-[#0D182E] rounded-2xl p-4 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#0A0F1D] border border-slate-800 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'all' 
                ? 'bg-gradient-to-r from-indigo-600/40 to-purple-600/30 text-cyan-300 border border-cyan-500/40 font-bold shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Insights ({insights.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'active' 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Action Required
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('implemented')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'implemented' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-xs' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Implemented / Reviewed
          </button>
        </div>

        {/* Priority & Category Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs py-1.5 px-3 bg-[#0A0F1D] border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-400 font-medium text-slate-200"
          >
            <option value="All">All Acuities</option>
            <option value="Critical">Critical Priority</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Info">Informational</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-1.5 px-3 bg-[#0A0F1D] border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-400 font-medium text-slate-200"
          >
            <option value="All">All Categories</option>
            <option value="Operational Bottleneck">Operational Bottlenecks</option>
            <option value="Diagnostic Correlation">Diagnostic Correlations</option>
            <option value="No-Show Prediction">No-Show Predictions</option>
            <option value="Staffing Optimization">Staffing Optimization</option>
            <option value="Clinical Protocol">Clinical Protocols</option>
          </select>
        </div>
      </div>

      {/* Realistic Analytical Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredInsights.map((ins) => {
          const isCrit = ins.priority === 'Critical';
          const isHigh = ins.priority === 'High';
          const isImplemented = ins.status === 'Implemented';

          return (
            <div
              key={ins.id}
              className={`bg-gradient-to-br from-[#0E152E] to-[#121332] rounded-2xl p-5 border shadow-md transition-all flex flex-col justify-between ${
                isCrit 
                  ? 'border-rose-500/40 ring-1 ring-rose-500/20' 
                  : isHigh 
                  ? 'border-indigo-500/40 ring-1 ring-indigo-500/20' 
                  : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header: Priority, Category, Confidence */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      isCrit 
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                        : isHigh 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                        : 'bg-[#111C35] text-slate-300 border-slate-700'
                    }`}>
                      {ins.priority} Priority
                    </span>
                    <span className="text-xs text-indigo-300 font-medium">{ins.category}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-[11px] font-bold text-cyan-300 bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-500/30">
                      {ins.confidenceScore}% Confidence
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white leading-snug mb-1.5">
                  {ins.title}
                </h3>

                {/* Analytical Summary */}
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {ins.summary}
                </p>

                {/* Quantitative Impact Box */}
                <div className="p-3 rounded-xl bg-[#080D1D] border border-indigo-500/20 text-xs space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Quantified Clinical Impact:</span>
                    <strong className="text-cyan-300 font-mono font-bold">{ins.impactMetric}</strong>
                  </div>

                  {ins.cohortSize && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400">Patient Cohort Monitored:</span>
                      <strong className="text-slate-200 font-mono">{ins.cohortSize}</strong>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-bold text-cyan-300 mb-0.5 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Recommended Action:</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed text-[11px]">
                      {ins.suggestedAction}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer: Metadata & Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-400">
                  <span>Dept: <strong className="text-slate-200">{ins.affectedDepartment}</strong></span>
                  <span className="mx-1">·</span>
                  <span className="text-slate-400 font-mono">{ins.timestamp}</span>
                </div>

                <div className="flex items-center gap-2">
                  {!isImplemented ? (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(ins.id, 'Implemented')}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all flex items-center gap-1 active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Apply Protocol</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" />
                      <span>Protocol Applied</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
