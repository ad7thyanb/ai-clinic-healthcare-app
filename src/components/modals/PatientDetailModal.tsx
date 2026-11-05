import React, { useState, useMemo } from 'react';
import { 
  X, 
  Heart, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  FileText, 
  Pill, 
  Clock, 
  Phone, 
  Mail, 
  Stethoscope,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Info,
  Maximize2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine 
} from 'recharts';
import { PatientRecord } from '../../types/clinic';

interface PatientDetailModalProps {
  patient: PatientRecord | null;
  onClose: () => void;
  onBookAppointment: (patientId: string) => void;
}

type VitalsMetric = 'bp' | 'hr' | 'spo2' | 'glucose' | 'overview';

interface VitalsHistoryPoint {
  date: string;
  fullDate: string;
  dayIndex: number;
  systolic: number;
  diastolic: number;
  hr: number;
  spo2: number;
  glucose: number;
  temp: number;
}

// Generate realistic deterministic 30-day historical telemetry
function generate30DayVitalsHistory(patient: PatientRecord): VitalsHistoryPoint[] {
  const [sysStr, diaStr] = (patient.vitals.bp || '120/80').split('/');
  const baseSys = parseInt(sysStr, 10) || 120;
  const baseDia = parseInt(diaStr, 10) || 80;
  const baseHr = patient.vitals.hr || 74;
  const baseSpo2 = patient.vitals.spo2 || 98;
  const baseGlucose = patient.vitals.glucose || 95;
  const baseTemp = patient.vitals.temp || 98.6;

  // Use character code sum of patient id to seed deterministic variation
  const seed = patient.id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);

  const history: VitalsHistoryPoint[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - i);

    const monthStr = targetDate.toLocaleDateString('en-US', { month: 'short' });
    const dayStr = targetDate.getDate();
    const dateLabel = `${monthStr} ${dayStr}`;
    const fullDateLabel = targetDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });

    if (i === 0) {
      // Exactly match current vitals for today
      history.push({
        date: 'Today',
        fullDate: fullDateLabel,
        dayIndex: 30 - i,
        systolic: baseSys,
        diastolic: baseDia,
        hr: baseHr,
        spo2: baseSpo2,
        glucose: baseGlucose,
        temp: baseTemp,
      });
      continue;
    }

    // Deterministic pseudo-random variation based on seed and day index
    const wave1 = Math.sin((i + seed % 13) * 0.45);
    const wave2 = Math.cos((i + seed % 7) * 0.65);
    const noise = ((seed * (i + 13)) % 100) / 100 - 0.5;

    const sysVar = Math.round(wave1 * 7 + noise * 4);
    const diaVar = Math.round(wave1 * 4 + noise * 3);
    const hrVar = Math.round(wave2 * 6 + noise * 5);
    const spo2Var = Math.max(93, Math.min(100, Math.round(baseSpo2 + (noise < 0 ? -1 : 0) + (wave1 > 0.8 ? -1 : 0))));
    const glucoseVar = Math.round(wave2 * 9 + noise * 8);
    const tempVar = Number((baseTemp + (wave1 * 0.3) + (noise * 0.2)).toFixed(1));

    history.push({
      date: dateLabel,
      fullDate: fullDateLabel,
      dayIndex: 30 - i,
      systolic: Math.max(95, Math.min(180, baseSys + sysVar)),
      diastolic: Math.max(60, Math.min(110, baseDia + diaVar)),
      hr: Math.max(54, Math.min(130, baseHr + hrVar)),
      spo2: spo2Var,
      glucose: Math.max(70, Math.min(220, baseGlucose + glucoseVar)),
      temp: tempVar,
    });
  }

  return history;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  onClose,
  onBookAppointment,
}) => {
  const [activeMetric, setActiveMetric] = useState<VitalsMetric>('bp');
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(30);

  if (!patient) return null;

  // Generate full 30 days data
  const full30DayHistory = useMemo(() => {
    return generate30DayVitalsHistory(patient);
  }, [patient]);

  // Filter based on selected time range
  const displayedHistory = useMemo(() => {
    return full30DayHistory.slice(-timeRange);
  }, [full30DayHistory, timeRange]);

  // Metric stats calculations
  const stats = useMemo(() => {
    if (displayedHistory.length === 0) return null;

    const sysValues = displayedHistory.map(d => d.systolic);
    const diaValues = displayedHistory.map(d => d.diastolic);
    const hrValues = displayedHistory.map(d => d.hr);
    const spo2Values = displayedHistory.map(d => d.spo2);
    const glucoseValues = displayedHistory.map(d => d.glucose);

    const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    const min = (arr: number[]) => Math.min(...arr);
    const max = (arr: number[]) => Math.max(...arr);

    // Trend comparison: first 3 days average vs last 3 days average
    const calcTrend = (arr: number[]) => {
      const firstAvg = (arr[0] + arr[1] + (arr[2] || arr[0])) / 3;
      const lastAvg = (arr[arr.length - 1] + arr[arr.length - 2] + (arr[arr.length - 3] || arr[arr.length - 1])) / 3;
      const diff = lastAvg - firstAvg;
      return { diff: Number(diff.toFixed(1)), direction: diff > 1.5 ? 'up' : diff < -1.5 ? 'down' : 'stable' };
    };

    return {
      sys: { avg: avg(sysValues), min: min(sysValues), max: max(sysValues), trend: calcTrend(sysValues) },
      dia: { avg: avg(diaValues), min: min(diaValues), max: max(diaValues), trend: calcTrend(diaValues) },
      hr: { avg: avg(hrValues), min: min(hrValues), max: max(hrValues), trend: calcTrend(hrValues) },
      spo2: { avg: avg(spo2Values), min: min(spo2Values), max: max(spo2Values), trend: calcTrend(spo2Values) },
      glucose: { avg: avg(glucoseValues), min: min(glucoseValues), max: max(glucoseValues), trend: calcTrend(glucoseValues) },
    };
  }, [displayedHistory]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header with clean healthcare styling */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0`}>
              {patient.name.split(' ').filter(n => !n.includes('.')).map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{patient.name}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  patient.triageStatus === 'Urgent'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : patient.triageStatus === 'Moderate'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-teal-50 text-teal-700 border border-teal-200'
                }`}>
                  {patient.triageStatus} Triage
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                <span>MRN: <strong className="text-slate-700">{patient.mrn}</strong></span>
                <span>·</span>
                <span>{patient.age} yrs · {patient.gender}</span>
                <span>·</span>
                <span>Blood: <strong className="text-slate-700">{patient.bloodType}</strong></span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Primary Condition & Attending Doctor Summary Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />
                <span>Primary Clinical Diagnosis</span>
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{patient.primaryDiagnosis}</div>
              <div className="text-slate-500 mt-0.5 font-medium">{patient.department} Department · Room Care Wing</div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Attending Physician</div>
              <div className="font-bold text-slate-900 mt-0.5 flex items-center sm:justify-end gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                <span>{patient.assignedDoctor}</span>
              </div>
              <div className="text-teal-700 font-mono text-[11px] mt-0.5">Last Intake: {patient.lastVisit}</div>
            </div>
          </div>

          {/* Current Vitals Surveillance Grid */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                <span>Current Vital Signs Surveillance</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Real-time telemetry</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Blood Pressure</div>
                <div className="text-base font-bold font-mono text-teal-700 mt-0.5">{patient.vitals.bp}</div>
                <div className="text-[9px] text-slate-400">mmHg</div>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Heart Rate</div>
                <div className="text-base font-bold font-mono text-slate-900 mt-0.5">{patient.vitals.hr}</div>
                <div className="text-[9px] text-slate-400">bpm</div>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">SpO2 Pulse</div>
                <div className={`text-base font-bold font-mono mt-0.5 ${patient.vitals.spo2 < 95 ? 'text-rose-600' : 'text-teal-700'}`}>
                  {patient.vitals.spo2}%
                </div>
                <div className="text-[9px] text-slate-400">room air</div>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-500 font-medium">Temperature</div>
                <div className="text-base font-bold font-mono text-slate-900 mt-0.5">{patient.vitals.temp}°F</div>
                <div className="text-[9px] text-slate-400">oral</div>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-500 font-medium">Blood Sugar</div>
                <div className="text-base font-bold font-mono text-amber-700 mt-0.5">{patient.vitals.glucose}</div>
                <div className="text-[9px] text-slate-400">mg/dL</div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RECHARTS HISTORICAL VITALS TREND CHART SECTION (LAST 30 DAYS) */}
          {/* ========================================================= */}
          <div className="rounded-2xl border border-teal-200 bg-gradient-to-b from-teal-50/40 via-white to-white p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                    <span>30-Day Longitudinal Vitals Trend Analysis</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                    Recharts EHR Engine
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Historical telemetry readings, circadian baseline, and clinical trend stability
                </p>
              </div>

              {/* Timeframe Controls */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTimeRange(7)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    timeRange === 7 
                      ? 'bg-white text-teal-700 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange(14)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    timeRange === 14 
                      ? 'bg-white text-teal-700 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  14 Days
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange(30)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    timeRange === 30 
                      ? 'bg-white text-teal-700 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>

            {/* Metric Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
              <button
                type="button"
                onClick={() => setActiveMetric('bp')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMetric === 'bp'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Blood Pressure (Sys / Dia)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMetric('hr')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMetric === 'hr'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Heart Rate (HR)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMetric('spo2')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMetric === 'spo2'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SpO2 Saturation</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMetric('glucose')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMetric === 'glucose'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Blood Glucose</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMetric('overview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMetric === 'overview'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>Dual Multi-Vital View</span>
              </button>
            </div>

            {/* Metric Summary Statistics Pill Box */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                {activeMetric === 'bp' && (
                  <>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">30-Day Mean BP</span>
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {stats.sys.avg} / {stats.dia.avg} <span className="text-[10px] text-slate-500 font-normal">mmHg</span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">Systolic Range</span>
                      <div className="font-mono font-bold text-teal-700 text-sm">
                        {stats.sys.min} – {stats.sys.max} <span className="text-[10px] text-slate-500 font-normal">mmHg</span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">Diastolic Range</span>
                      <div className="font-mono font-bold text-blue-700 text-sm">
                        {stats.dia.min} – {stats.dia.max} <span className="text-[10px] text-slate-500 font-normal">mmHg</span>
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">Systolic Trend</span>
                      <div className="flex items-center gap-1 text-sm font-bold">
                        {stats.sys.trend.direction === 'up' && (
                          <span className="text-rose-600 flex items-center gap-0.5">
                            <TrendingUp className="w-3.5 h-3.5" /> +{stats.sys.trend.diff} mmHg
                          </span>
                        )}
                        {stats.sys.trend.direction === 'down' && (
                          <span className="text-emerald-600 flex items-center gap-0.5">
                            <TrendingDown className="w-3.5 h-3.5" /> {stats.sys.trend.diff} mmHg
                          </span>
                        )}
                        {stats.sys.trend.direction === 'stable' && (
                          <span className="text-slate-600 flex items-center gap-0.5">
                            <Minus className="w-3.5 h-3.5" /> Stable Baseline
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {activeMetric === 'hr' && (
                  <>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">30-Day Mean HR</span>
                      <div className="font-mono font-bold text-slate-900 text-sm">{stats.hr.avg} bpm</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">Recorded Minimum</span>
                      <div className="font-mono font-bold text-teal-700 text-sm">{stats.hr.min} bpm</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">Peak Recorded</span>
                      <div className="font-mono font-bold text-amber-700 text-sm">{stats.hr.max} bpm</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">Tachycardia / Target</span>
                      <div className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Sinus Rhythm Zone</span>
                      </div>
                    </div>
                  </>
                )}

                {activeMetric === 'spo2' && (
                  <>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">30-Day Mean SpO2</span>
                      <div className="font-mono font-bold text-teal-700 text-sm">{stats.spo2.avg}%</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">Lowest SpO2</span>
                      <div className={`font-mono font-bold text-sm ${stats.spo2.min < 95 ? 'text-rose-600' : 'text-teal-700'}`}>
                        {stats.spo2.min}%
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">Peak SpO2</span>
                      <div className="font-mono font-bold text-slate-900 text-sm">{stats.spo2.max}%</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">Respiratory Safety</span>
                      <div className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{stats.spo2.min >= 95 ? 'Adequate Airway' : 'Mild Desaturation Flags'}</span>
                      </div>
                    </div>
                  </>
                )}

                {activeMetric === 'glucose' && (
                  <>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">30-Day Mean Glucose</span>
                      <div className="font-mono font-bold text-amber-700 text-sm">{stats.glucose.avg} mg/dL</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">Fasting Minimum</span>
                      <div className="font-mono font-bold text-teal-700 text-sm">{stats.glucose.min} mg/dL</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">Postprandial Max</span>
                      <div className="font-mono font-bold text-slate-900 text-sm">{stats.glucose.max} mg/dL</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">Glycemic Control</span>
                      <div className="text-sm font-bold text-teal-700 flex items-center gap-1">
                        <span>{stats.glucose.avg <= 110 ? 'Normoglycemic' : 'Borderline Elevated'}</span>
                      </div>
                    </div>
                  </>
                )}

                {activeMetric === 'overview' && (
                  <>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">Mean BP</span>
                      <div className="font-mono font-bold text-teal-700 text-sm">{stats.sys.avg}/{stats.dia.avg}</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">Mean HR</span>
                      <div className="font-mono font-bold text-blue-700 text-sm">{stats.hr.avg} bpm</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">Mean SpO2</span>
                      <div className="font-mono font-bold text-emerald-700 text-sm">{stats.spo2.avg}%</div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">Mean Glucose</span>
                      <div className="font-mono font-bold text-amber-700 text-sm">{stats.glucose.avg} mg/dL</div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Recharts Canvas */}
            <div className="h-64 w-full bg-white rounded-xl p-2 border border-slate-100">
              <ResponsiveContainer width="100%" height="100%">
                {activeMetric === 'bp' ? (
                  <LineChart data={displayedHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[50, 180]} 
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                      unit=" mmHg"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as VitalsHistoryPoint;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs font-sans space-y-1">
                              <div className="font-bold text-teal-300 border-b border-slate-800 pb-1 flex items-center justify-between gap-3">
                                <span>{data.fullDate}</span>
                                <span className="text-[10px] font-mono text-slate-400">Day {data.dayIndex}/30</span>
                              </div>
                              <div className="flex items-center justify-between gap-4 pt-1">
                                <span className="text-slate-300">Systolic Pressure:</span>
                                <span className="font-mono font-bold text-teal-400">{data.systolic} mmHg</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-300">Diastolic Pressure:</span>
                                <span className="font-mono font-bold text-blue-400">{data.diastolic} mmHg</span>
                              </div>
                              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex items-center justify-between">
                                <span>Pulse: {data.hr} bpm</span>
                                <span>SpO2: {data.spo2}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: 11, paddingTop: 6 }} 
                      iconType="circle"
                    />
                    <ReferenceLine 
                      y={120} 
                      stroke="#0d9488" 
                      strokeDasharray="4 4" 
                      label={{ value: 'Normotensive Target (120)', position: 'insideTopRight', fill: '#0d9488', fontSize: 9 }} 
                    />
                    <ReferenceLine 
                      y={140} 
                      stroke="#f43f5e" 
                      strokeDasharray="4 4" 
                      label={{ value: 'Stage 1 HTN (140)', position: 'insideTopRight', fill: '#f43f5e', fontSize: 9 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="systolic" 
                      name="Systolic BP (mmHg)" 
                      stroke="#0d9488" 
                      strokeWidth={2.5} 
                      dot={{ r: 2.5, fill: '#0d9488' }}
                      activeDot={{ r: 6, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="diastolic" 
                      name="Diastolic BP (mmHg)" 
                      stroke="#3b82f6" 
                      strokeWidth={2} 
                      dot={{ r: 2, fill: '#3b82f6' }}
                      activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                ) : activeMetric === 'hr' ? (
                  <AreaChart data={displayedHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[50, 130]} 
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                      unit=" bpm"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as VitalsHistoryPoint;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs space-y-1">
                              <div className="font-bold text-teal-300">{data.fullDate}</div>
                              <div className="text-slate-300">Heart Rate: <strong className="text-teal-400 font-mono">{data.hr} bpm</strong></div>
                              <div className="text-[10px] text-slate-400">{data.hr > 100 ? 'Sinus Tachycardia' : data.hr < 60 ? 'Sinus Bradycardia' : 'Normal Sinus Rhythm'}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Tachycardia Threshold (100 bpm)', fill: '#f59e0b', fontSize: 9 }} />
                    <ReferenceLine y={60} stroke="#64748b" strokeDasharray="3 3" label={{ value: 'Bradycardia Threshold (60 bpm)', fill: '#64748b', fontSize: 9 }} />
                    <Area 
                      type="monotone" 
                      dataKey="hr" 
                      name="Heart Rate (bpm)" 
                      stroke="#0d9488" 
                      strokeWidth={2.5} 
                      fill="url(#hrGradient)" 
                      dot={{ r: 2.5, fill: '#0d9488' }}
                      activeDot={{ r: 5, fill: '#0d9488' }}
                    />
                  </AreaChart>
                ) : activeMetric === 'spo2' ? (
                  <AreaChart data={displayedHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="spo2Gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[90, 100]} 
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                      unit="%"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as VitalsHistoryPoint;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs space-y-1">
                              <div className="font-bold text-teal-300">{data.fullDate}</div>
                              <div className="text-slate-300">SpO2 Pulse Ox: <strong className="text-teal-400 font-mono">{data.spo2}%</strong></div>
                              <div className="text-[10px] text-slate-400">{data.spo2 < 95 ? 'Hypoxemia warning' : 'Optimal blood oxygenation'}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={95} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Hypoxemia Alert (<95%)', fill: '#f43f5e', fontSize: 9 }} />
                    <Area 
                      type="monotone" 
                      dataKey="spo2" 
                      name="SpO2 Saturation (%)" 
                      stroke="#0d9488" 
                      strokeWidth={2.5} 
                      fill="url(#spo2Gradient)" 
                      dot={{ r: 2.5, fill: '#0d9488' }}
                      activeDot={{ r: 5, fill: '#0d9488' }}
                    />
                  </AreaChart>
                ) : activeMetric === 'glucose' ? (
                  <LineChart data={displayedHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[60, 200]} 
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                      unit=" mg/dL"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as VitalsHistoryPoint;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs space-y-1">
                              <div className="font-bold text-amber-300">{data.fullDate}</div>
                              <div className="text-slate-300">Blood Sugar: <strong className="text-amber-400 font-mono">{data.glucose} mg/dL</strong></div>
                              <div className="text-[10px] text-slate-400">{data.glucose > 140 ? 'Postprandial peak' : 'Normal fasting range'}</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={100} stroke="#0d9488" strokeDasharray="3 3" label={{ value: 'Fasting Target (<100)', fill: '#0d9488', fontSize: 9 }} />
                    <ReferenceLine y={140} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Prediabetes Threshold (140)', fill: '#f59e0b', fontSize: 9 }} />
                    <Line 
                      type="monotone" 
                      dataKey="glucose" 
                      name="Glucose (mg/dL)" 
                      stroke="#f59e0b" 
                      strokeWidth={2.5} 
                      dot={{ r: 2.5, fill: '#f59e0b' }}
                      activeDot={{ r: 5, fill: '#f59e0b' }}
                    />
                  </LineChart>
                ) : (
                  <LineChart data={displayedHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as VitalsHistoryPoint;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs space-y-1">
                              <div className="font-bold text-teal-300">{data.fullDate}</div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 font-mono text-[11px]">
                                <span>BP: <strong className="text-teal-400">{data.systolic}/{data.diastolic}</strong></span>
                                <span>HR: <strong className="text-blue-400">{data.hr} bpm</strong></span>
                                <span>SpO2: <strong className="text-emerald-400">{data.spo2}%</strong></span>
                                <span>Glucose: <strong className="text-amber-400">{data.glucose}</strong></span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="systolic" name="Systolic BP" stroke="#0d9488" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="hr" name="Heart Rate" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="glucose" name="Glucose" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Documented Allergies & Prescriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Allergies Card */}
            <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/70">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold mb-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span className="text-xs uppercase tracking-wide">Documented Drug Allergies</span>
              </div>
              <ul className="space-y-1.5 text-slate-700">
                {patient.allergies.length > 0 ? (
                  patient.allergies.map((alg, i) => (
                    <li key={i} className="flex items-center gap-2 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>{alg}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 italic">No documented drug allergies</li>
                )}
              </ul>
            </div>

            {/* Active Prescriptions Card */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold mb-2.5">
                <Pill className="w-4 h-4 text-teal-600" />
                <span className="text-xs uppercase tracking-wide">Active Prescriptions &amp; Meds</span>
              </div>
              <ul className="space-y-1.5 text-slate-700">
                {patient.medications.length > 0 ? (
                  patient.medications.map((med, i) => (
                    <li key={i} className="flex items-center gap-2 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" />
                      <span>{med}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 italic">No active pharmacological therapies</li>
                )}
              </ul>
            </div>
          </div>

          {/* Longitudinal Medical History */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Documented Chronic Medical History</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {patient.medicalHistory.map((hist, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 font-medium text-xs shadow-2xs"
                >
                  {hist}
                </span>
              ))}
            </div>
          </div>

          {/* Insurance & Demographics */}
          <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block font-bold text-slate-900 text-[11px] uppercase tracking-wide mb-0.5">Insurance Coverage:</span>
              <span className="text-slate-700">{patient.insurance}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block font-bold text-slate-900 text-[11px] uppercase tracking-wide mb-0.5">Contact Telephone:</span>
              <span className="font-mono text-teal-800 font-semibold">{patient.phone}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 font-mono">
            EHR ID: <strong className="text-slate-700">{patient.id}</strong> · Last Telemetry Sync: Today
          </span>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-colors"
            >
              Close Record
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onBookAppointment(patient.id);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-600/25 transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Follow-up Visit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
