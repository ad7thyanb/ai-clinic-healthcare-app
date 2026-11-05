import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Activity, 
  AlertCircle, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight, 
  HeartPulse, 
  Info, 
  Percent, 
  Hash, 
  Users, 
  X,
  Stethoscope
} from 'lucide-react';
import { PatientRecord, ActiveView } from '../../types/clinic';

export interface TriageStatusChartProps {
  patients: PatientRecord[];
  onNavigate?: (view: ActiveView) => void;
  onSelectPatient?: (patient: PatientRecord) => void;
}

export type TriageCategory = 'Normal' | 'Urgent' | 'Critical';

interface TriageDataPoint {
  category: TriageCategory;
  label: string;
  count: number;
  percentage: number;
  color: string;
  gradientId: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  sla: string;
  description: string;
  patients: PatientRecord[];
}

export function normalizeTriageStatus(raw: string | undefined | null): TriageCategory {
  if (!raw) return 'Normal';
  const lower = String(raw).toLowerCase().trim();
  if (lower.includes('crit') || lower.includes('emerg') || lower.includes('severe') || lower.includes('resusc')) {
    return 'Critical';
  }
  if (lower.includes('urg') || lower.includes('mod') || lower.includes('high') || lower.includes('prior')) {
    return 'Urgent';
  }
  return 'Normal';
}

export const TriageStatusChart: React.FC<TriageStatusChartProps> = ({
  patients,
  onNavigate,
  onSelectPatient,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<TriageCategory | null>(null);
  const [metricMode, setMetricMode] = useState<'count' | 'percent'>('count');
  const [hoveredPoint, setHoveredPoint] = useState<TriageDataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Compute distribution across the 3 explicit triage status tiers
  const triageData: TriageDataPoint[] = useMemo(() => {
    const total = Math.max(1, patients.length);
    const groups: Record<TriageCategory, PatientRecord[]> = {
      Normal: [],
      Urgent: [],
      Critical: [],
    };

    patients.forEach((pt) => {
      const category = normalizeTriageStatus(pt.triageStatus);
      groups[category].push(pt);
    });

    return [
      {
        category: 'Normal',
        label: 'Normal Acuity',
        count: groups.Normal.length,
        percentage: Math.round((groups.Normal.length / total) * 1000) / 10,
        color: '#0D9488', // teal-600
        gradientId: 'triage-grad-normal',
        accentBg: 'bg-teal-50',
        accentText: 'text-teal-700',
        accentBorder: 'border-teal-200',
        sla: 'Routine Care (< 120m)',
        description: 'Stable vital signs, routine consultations, and scheduled medical follow-ups.',
        patients: groups.Normal,
      },
      {
        category: 'Urgent',
        label: 'Urgent Care',
        count: groups.Urgent.length,
        percentage: Math.round((groups.Urgent.length / total) * 1000) / 10,
        color: '#F59E0B', // amber-500
        gradientId: 'triage-grad-urgent',
        accentBg: 'bg-amber-50',
        accentText: 'text-amber-700',
        accentBorder: 'border-amber-200',
        sla: 'Timely Review (< 60m)',
        description: 'Acute symptomatic presentation, moderate vitals deviation, requires priority clinical attention.',
        patients: groups.Urgent,
      },
      {
        category: 'Critical',
        label: 'Critical / Resuscitation',
        count: groups.Critical.length,
        percentage: Math.round((groups.Critical.length / total) * 1000) / 10,
        color: '#EF4444', // rose-500
        gradientId: 'triage-grad-critical',
        accentBg: 'bg-rose-50',
        accentText: 'text-rose-700',
        accentBorder: 'border-rose-200',
        sla: 'Immediate (< 15m)',
        description: 'Impaired vitals (hypoxia, severe tachycardia/hypertension), emergency triage resuscitation.',
        patients: groups.Critical,
      },
    ];
  }, [patients]);

  const totalPatients = patients.length;

  // D3 Chart Render with ResizeObserver
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svgElement = svgRef.current;
    const container = containerRef.current;

    const renderChart = () => {
      const containerWidth = container.clientWidth || 500;
      const height = 260;
      const margin = { top: 25, right: 25, bottom: 45, left: 50 };
      const innerWidth = containerWidth - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (innerWidth <= 0 || innerHeight <= 0) return;

      const svg = d3.select(svgElement);
      svg.selectAll('*').remove();

      svg
        .attr('width', containerWidth)
        .attr('height', height)
        .attr('viewBox', `0 0 ${containerWidth} ${height}`)
        .attr('style', 'max-width: 100%; height: auto;');

      // Defs: Gradients and drop shadows
      const defs = svg.append('defs');

      // Gradient Normal (Teal to Emerald)
      const gradNormal = defs.append('linearGradient')
        .attr('id', 'triage-grad-normal')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '0%').attr('y2', '100%');
      gradNormal.append('stop').attr('offset', '0%').attr('stop-color', '#14B8A6');
      gradNormal.append('stop').attr('offset', '100%').attr('stop-color', '#0D9488');

      // Gradient Urgent (Amber to Orange)
      const gradUrgent = defs.append('linearGradient')
        .attr('id', 'triage-grad-urgent')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '0%').attr('y2', '100%');
      gradUrgent.append('stop').attr('offset', '0%').attr('stop-color', '#FBBF24');
      gradUrgent.append('stop').attr('offset', '100%').attr('stop-color', '#D97706');

      // Gradient Critical (Rose to Red)
      const gradCritical = defs.append('linearGradient')
        .attr('id', 'triage-grad-critical')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '0%').attr('y2', '100%');
      gradCritical.append('stop').attr('offset', '0%').attr('stop-color', '#F87171');
      gradCritical.append('stop').attr('offset', '100%').attr('stop-color', '#DC2626');

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // X Scale
      const xScale = d3.scaleBand<string>()
        .domain(triageData.map((d) => d.category))
        .range([0, innerWidth])
        .padding(0.36);

      // Y Scale
      const maxValue = metricMode === 'count' 
        ? Math.max(5, d3.max(triageData, (d) => d.count) || 10) 
        : Math.max(10, d3.max(triageData, (d) => d.percentage) || 100);

      const yScale = d3.scaleLinear()
        .domain([0, maxValue * 1.15])
        .range([innerHeight, 0])
        .nice();

      // Horizontal subtle grid lines
      const yTicks = yScale.ticks(4);
      g.append('g')
        .attr('class', 'grid-lines')
        .selectAll('line')
        .data(yTicks)
        .enter()
        .append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', (d) => yScale(d))
        .attr('y2', (d) => yScale(d))
        .attr('stroke', '#E2E8F0')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '3,3')
        .attr('opacity', 0.8);

      // Y Axis
      const yAxis = d3.axisLeft(yScale)
        .ticks(4)
        .tickFormat((d) => metricMode === 'count' ? String(d) : `${d}%`)
        .tickSize(0);

      const yAxisG = g.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);

      yAxisG.select('.domain').remove();
      yAxisG.selectAll('text')
        .attr('fill', '#64748B')
        .attr('font-size', '11px')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('dx', '-6px');

      // X Axis
      const xAxis = d3.axisBottom(xScale)
        .tickSize(0);

      const xAxisG = g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis);

      xAxisG.select('.domain')
        .attr('stroke', '#CBD5E1')
        .attr('stroke-width', 1);

      xAxisG.selectAll('text')
        .attr('fill', '#1E293B')
        .attr('font-size', '12px')
        .attr('font-weight', '700')
        .attr('font-family', 'Plus Jakarta Sans, sans-serif')
        .attr('dy', '14px');

      // Bars Container
      const barGroups = g.selectAll('.bar-group')
        .data(triageData)
        .enter()
        .append('g')
        .attr('class', 'bar-group')
        .attr('cursor', 'pointer');

      // Background tracking pills for subtle depth
      barGroups.append('rect')
        .attr('class', 'bar-bg')
        .attr('x', (d) => xScale(d.category) || 0)
        .attr('y', 0)
        .attr('width', xScale.bandwidth())
        .attr('height', innerHeight)
        .attr('fill', '#F8FAFC')
        .attr('rx', 8)
        .attr('ry', 8)
        .attr('opacity', 0.6);

      // Main Animated D3 Bars
      const bars = barGroups.append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => xScale(d.category) || 0)
        .attr('width', xScale.bandwidth())
        .attr('y', innerHeight) // Start at bottom for animated rise
        .attr('height', 0)
        .attr('rx', 8)
        .attr('ry', 8)
        .attr('fill', (d) => `url(#${d.gradientId})`)
        .attr('stroke', (d) => selectedCategory === d.category ? '#0F172A' : 'none')
        .attr('stroke-width', (d) => selectedCategory === d.category ? 2 : 0);

      // Smooth rise transition
      bars.transition()
        .duration(700)
        .ease(d3.easeCubicOut)
        .attr('y', (d) => {
          const val = metricMode === 'count' ? d.count : d.percentage;
          return yScale(val);
        })
        .attr('height', (d) => {
          const val = metricMode === 'count' ? d.count : d.percentage;
          return Math.max(4, innerHeight - yScale(val));
        });

      // Metric value text on top of bars
      const labels = barGroups.append('text')
        .attr('class', 'bar-label')
        .attr('x', (d) => (xScale(d.category) || 0) + xScale.bandwidth() / 2)
        .attr('y', innerHeight - 6)
        .attr('text-anchor', 'middle')
        .attr('fill', '#0F172A')
        .attr('font-size', '12px')
        .attr('font-weight', '800')
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('opacity', 0);

      labels.transition()
        .duration(700)
        .ease(d3.easeCubicOut)
        .attr('y', (d) => {
          const val = metricMode === 'count' ? d.count : d.percentage;
          return Math.max(14, yScale(val) - 8);
        })
        .attr('opacity', 1)
        .text((d) => metricMode === 'count' ? d.count.toLocaleString() : `${d.percentage}%`);

      // Interactive Events (hover tooltip & click to filter)
      barGroups
        .on('mouseenter', function (event, d) {
          d3.select(this).select('.bar')
            .transition()
            .duration(150)
            .attr('opacity', 0.85);

          const [xPos, yPos] = d3.pointer(event, container);
          setHoveredPoint(d);
          setTooltipPos({ x: xPos, y: yPos });
        })
        .on('mousemove', function (event, d) {
          const [xPos, yPos] = d3.pointer(event, container);
          setTooltipPos({ x: xPos, y: yPos });
        })
        .on('mouseleave', function () {
          d3.select(this).select('.bar')
            .transition()
            .duration(150)
            .attr('opacity', 1);
          setHoveredPoint(null);
          setTooltipPos(null);
        })
        .on('click', function (_, d) {
          setSelectedCategory((prev) => prev === d.category ? null : d.category);
        });
    };

    renderChart();

    const resizeObserver = new ResizeObserver(() => {
      renderChart();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [triageData, metricMode, selectedCategory]);

  const activeSelectedData = triageData.find((d) => d.category === selectedCategory);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between relative">
      {/* Header with Title and Mode Controls */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Patient Triage Acuity Distribution</span>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    D3 Visualization
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribution of clinical triage status across all {totalPatients.toLocaleString()} registered patients
                </p>
              </div>
            </div>
          </div>

          {/* Metric Toggle: Count vs Percentage */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setMetricMode('count')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                metricMode === 'count'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Display raw patient counts"
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Count</span>
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('percent')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                metricMode === 'percent'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Display population percentage"
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Share (%)</span>
            </button>
          </div>
        </div>

        {/* Triage Acuity Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
          {triageData.map((tier) => {
            const isSelected = selectedCategory === tier.category;
            return (
              <button
                key={tier.category}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? null : tier.category)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? `${tier.accentBg} ${tier.accentBorder} ring-2 ring-slate-900/10 shadow-sm`
                    : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${tier.accentText}`}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color }} />
                    {tier.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-medium">
                    {tier.sla}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg sm:text-xl font-bold font-mono text-slate-900 tabular-nums">
                    {tier.count.toLocaleString()}
                    <span className="text-xs font-normal text-slate-500 ml-1">pts</span>
                  </span>
                  <span className="text-xs font-bold font-mono text-slate-600">
                    {tier.percentage}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* D3 Bar Chart Canvas */}
        <div 
          ref={containerRef} 
          className="relative w-full overflow-hidden bg-slate-50/40 rounded-xl p-2 border border-slate-100"
          style={{ minHeight: '260px' }}
        >
          <svg ref={svgRef} className="w-full h-auto overflow-visible select-none" />

          {/* Rich D3 Floating Tooltip */}
          {hoveredPoint && tooltipPos && (
            <div
              className="absolute pointer-events-none z-20 bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 max-w-xs animate-in fade-in duration-150 -translate-x-1/2 -translate-y-full"
              style={{
                left: `${Math.max(80, Math.min(tooltipPos.x, (containerRef.current?.clientWidth || 300) - 80))}px`,
                top: `${Math.max(10, tooltipPos.y - 12)}px`,
              }}
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hoveredPoint.color }} />
                  {hoveredPoint.label}
                </span>
                <span className="font-mono text-slate-300 font-semibold">{hoveredPoint.sla}</span>
              </div>
              <div className="flex items-baseline justify-between pt-0.5">
                <span className="text-slate-400">Patient Volume:</span>
                <span className="font-mono font-bold text-white">
                  {hoveredPoint.count.toLocaleString()} ({hoveredPoint.percentage}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                {hoveredPoint.description}
              </p>
              <div className="text-[10px] text-teal-300 font-medium pt-0.5">
                Click bar to inspect matching patient records
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Category Patient Drilldown Panel */}
      {selectedCategory && activeSelectedData && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: activeSelectedData.color }} 
              />
              <span className="text-xs font-bold text-slate-900">
                {activeSelectedData.category} Triage Patients ({activeSelectedData.count})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                · {activeSelectedData.sla}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              title="Close patient list"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeSelectedData.patients.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">
              No patients currently assigned to {activeSelectedData.category} triage.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {activeSelectedData.patients.slice(0, 9).map((pt) => (
                <div
                  key={pt.id}
                  onClick={() => onSelectPatient && onSelectPatient(pt)}
                  className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-teal-500/50 hover:shadow-xs transition-all cursor-pointer group text-xs flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                      {pt.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                      {pt.mrn}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mb-1.5">
                    {pt.primaryDiagnosis}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 font-mono">
                    <span>BP: <strong className="text-slate-700">{pt.vitals.bp}</strong></span>
                    <span>SpO2: <strong className="text-slate-700">{pt.vitals.spo2}%</strong></span>
                    <span className="text-teal-700 font-sans font-semibold group-hover:underline">View</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSelectedData.patients.length > 9 && onNavigate && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => onNavigate('patients')}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
              >
                <span>View all {activeSelectedData.count} {activeSelectedData.category} patients in Patient Management</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer Navigation Link */}
      <div className="pt-3.5 mt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
            <span>Normal: Stable &amp; Routine</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Urgent: Elevated Priority</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Critical: Emergency Resuscitation</span>
          </span>
        </div>

        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('patients')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 group"
          >
            <span>Filter Patient Directory</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};
