import React from 'react';
import { X, FileText, Download, CheckCircle2, Calendar, TrendingUp, ShieldCheck, Printer } from 'lucide-react';
import { DashboardStats } from '../../types/clinic';

interface ClinicalReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: DashboardStats | null;
  onExport: (format: string) => void;
}

export const ClinicalReportsModal: React.FC<ClinicalReportsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onExport,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-[#0D182E] rounded-2xl shadow-2xl border border-slate-800 text-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B1327]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Clinical Operations &amp; Quality Audit Reports</h3>
              <p className="text-xs text-slate-400">Executive metrics, provider workload, and patient throughput audit</p>
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Report summary card */}
          <div className="p-4 rounded-xl bg-[#080E1C] border border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-400">Current Reporting Period</div>
              <div className="text-sm font-bold mt-0.5">October 2026 Comprehensive Quality Review</div>
              <div className="text-slate-400 text-[11px] mt-0.5">Generated for Chief Medical Officer &amp; Operations Board</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onExport('PDF')}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
              <button
                type="button"
                onClick={() => onExport('CSV')}
                className="px-3.5 py-2 rounded-xl bg-[#111C35] hover:bg-[#162344] text-slate-200 font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>CSV Dataset</span>
              </button>
            </div>
          </div>

          {/* Key sections in report */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Standard Clinical Report Modules
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-[#080E1C] hover:bg-[#0B1327] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="font-bold text-white">01. Outpatient Throughput &amp; Wait Time Report</div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 rounded">Ready</span>
                </div>
                <p className="text-slate-300 mt-1 leading-relaxed text-[11px]">
                  Daily patient encounters, queue dwell times, check-in to exam room velocity, and room utilization by department.
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">Records: 112 encounters · Avg Wait: 8.6 min</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-[#080E1C] hover:bg-[#0B1327] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="font-bold text-white">02. Physician Workload &amp; RVU Productivity</div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 rounded">Ready</span>
                </div>
                <p className="text-slate-300 mt-1 leading-relaxed text-[11px]">
                  Consultation volume, completed charts, average encounter duration, and scheduling density per clinician.
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">14 Active Physicians · 48 Completed Today</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-[#080E1C] hover:bg-[#0B1327] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="font-bold text-white">03. ICD-10 Epidemiological Surveillance</div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 px-1.5 py-0.5 rounded">Surveillance Active</span>
                </div>
                <p className="text-slate-300 mt-1 leading-relaxed text-[11px]">
                  Top 10 diagnoses, seasonal respiratory contagion spikes, pediatric pharyngitis trends, and polypharmacy correlation.
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">1,822 Analyzed Cases · 10 Prevalent Pathologies</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-[#080E1C] hover:bg-[#0B1327] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="font-bold text-white">04. Quality Assurance &amp; No-Show Mitigation</div>
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/20 border border-indigo-500/30 px-1.5 py-0.5 rounded">Audited</span>
                </div>
                <p className="text-slate-300 mt-1 leading-relaxed text-[11px]">
                  Attendance fidelity, predictive no-show cancellation recoveries, and telemedicine conversion effectiveness.
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-mono">94.8% Attendance Rate · 3 Recoverable Slots</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0B1327] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>HIPAA Compliant Synthetic De-identified Clinical Data</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close Report Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
