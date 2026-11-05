import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  Activity, 
  Filter,
  ArrowRight
} from 'lucide-react';
import { useRouter } from '../../router/Router';
import { PublicNavbar } from '../layout/PublicNavbar';
import { PublicFooter } from '../layout/PublicFooter';
import { AuthUser } from '../auth/LoginScreen';

export interface AcceptanceTestItem {
  id: number;
  testName: string;
  category: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'NOT YET TESTED';
  details: string;
}

interface TestRunSummary {
  total: number;
  passed: number;
  failed: number;
  pending: number;
  passRate: string;
  timestamp: string;
}

interface AcceptanceTestsPageProps {
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const AcceptanceTestsPage: React.FC<AcceptanceTestsPageProps> = ({ currentUser, onLogout }) => {
  const { navigate } = useRouter();
  const [tests, setTests] = useState<AcceptanceTestItem[]>([]);
  const [summary, setSummary] = useState<TestRunSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [running, setRunning] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const executeTests = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/tests/run');
      const data = await res.json();
      setTests(data.results || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error('Failed to run acceptance tests:', err);
    } finally {
      setLoading(false);
      setRunning(false);
    }
  };

  useEffect(() => {
    executeTests();
  }, []);

  const categories = ['All', ...Array.from(new Set(tests.map((t) => t.category)))];

  const filteredTests = tests.filter((t) => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    return matchesCat && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar currentUser={currentUser} onLogout={onLogout} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider mb-2">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Specification Compliance &bull; Teacher PDF</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Clinical Systems &amp; 3-Role Architecture Acceptance Test Suite
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Live automated test runner validating the complete &ldquo;AI Clinic &mdash; Web Application Implementation&rdquo; specification.
            </p>
          </div>

          <button
            type="button"
            onClick={executeTests}
            disabled={running}
            aria-label="Run All Tests"
            title="Run All Tests"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2.5 shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-60 shrink-0 hover:scale-102 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'Running All Tests...' : 'Run All Tests'}</span>
          </button>
        </div>

        {/* Executive Summary Metrics */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg text-center">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tests</div>
              <div className="text-3xl font-extrabold text-white mt-1.5">{summary.total}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">PDF Specifications</div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 shadow-lg text-center">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Passed</div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1.5">{summary.passed}</div>
              <div className="text-[11px] text-emerald-300/80 mt-0.5">Verified Working</div>
            </div>

            <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/30 shadow-lg text-center">
              <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">Failed</div>
              <div className="text-3xl font-extrabold text-rose-400 mt-1.5">{summary.failed}</div>
              <div className="text-[11px] text-rose-300/80 mt-0.5">Deficiencies</div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/30 shadow-lg text-center">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pending</div>
              <div className="text-3xl font-extrabold text-amber-400 mt-1.5">{summary.pending}</div>
              <div className="text-[11px] text-amber-300/80 mt-0.5">Not Yet Tested</div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-blue-950/60 border border-cyan-500/40 shadow-lg text-center col-span-2 md:col-span-1">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Pass Rate</div>
              <div className="text-3xl font-extrabold text-white mt-1.5">{summary.passRate}</div>
              <div className="text-[11px] text-cyan-300/80 mt-0.5">Live Score</div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 pl-1 pr-2">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Category:</span>
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {['All', 'PASS', 'FAIL', 'NOT YET TESTED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  selectedStatus === st
                    ? 'bg-slate-800 text-white border border-slate-600'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Test Cards List */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 rounded-3xl bg-slate-900 border border-slate-800">
            Running acceptance test validation suite...
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="p-16 text-center text-slate-400 rounded-3xl bg-slate-900 border border-slate-800">
            No acceptance tests matching filter.
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredTests.map((test) => {
              const isPass = test.status === 'PASS';
              const isFail = test.status === 'FAIL';
              return (
                <div
                  key={test.id}
                  className={`p-5 rounded-2xl bg-slate-900/90 border transition-all ${
                    isPass
                      ? 'border-emerald-500/20 hover:border-emerald-500/40'
                      : isFail
                      ? 'border-rose-500/30 hover:border-rose-500/50'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                        #{test.id}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-white">{test.testName}</h3>
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-semibold border border-slate-700/60">
                            {test.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{test.description}</p>
                        <div className="mt-2 text-xs font-mono text-cyan-300 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                          <span className="text-slate-500 font-sans font-bold">Result: </span>
                          {test.details}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 self-start sm:self-auto">
                      {isPass && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>PASS</span>
                        </span>
                      )}
                      {isFail && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>FAIL</span>
                        </span>
                      )}
                      {!isPass && !isFail && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>NOT YET TESTED</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};
