import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Database, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  SlidersHorizontal, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Eye, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Table as TableIcon, 
  FileSpreadsheet, 
  Hash, 
  Columns, 
  ExternalLink, 
  Lock, 
  X, 
  FileText, 
  Sparkles, 
  Loader2, 
  Calendar, 
  User, 
  ShieldCheck, 
  Activity, 
  Terminal, 
  KeyRound, 
  AlertTriangle,
  Code2
} from 'lucide-react';
import { 
  supabase, 
  isSupabaseConfigured, 
  getSupabaseConfigDetails, 
  getActiveAuthSession 
} from '../../lib/supabase';
import { SupabaseConfigModal } from '../modals/SupabaseConfigModal';

interface ClinicDataTableViewProps {
  onBackToDashboard?: () => void;
}

interface DiagnosticReport {
  timestamp: string;
  targetTable: string;
  projectUrl: string;
  authStatus: 'authenticated' | 'anon';
  userEmail: string | null;
  userId: string | null;
  hasToken: boolean;
  httpStatus: number | null;
  httpStatusText: string | null;
  returnedCount: number | null;
  returnedRowCount: number;
  queryError: {
    message: string;
    code?: string;
    details?: string;
    hint?: string;
  } | null;
  exposedTables: string[];
  latencyMs: number;
}

export const ClinicDataTableView: React.FC<ClinicDataTableViewProps> = ({
  onBackToDashboard,
}) => {
  // Configured target table name - strictly 'clinic data' with a space in public schema
  const [activeTableName, setActiveTableName] = useState<string>('clinic data');

  // Data states
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  // Error and Diagnostic states
  const [queryState, setQueryState] = useState<'loading' | 'success' | 'error' | 'empty_rls'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [showDiagnosticPanel, setShowDiagnosticPanel] = useState<boolean>(true);
  const [alternativeTableAvailable, setAlternativeTableAvailable] = useState<string | null>(null);

  // Pagination states - 100 per page as required
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(100);
  const [jumpPageInput, setJumpPageInput] = useState<string>('1');

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');
  const [selectedSearchColumn, setSelectedSearchColumn] = useState<string>('all');

  // Record details modal
  const [selectedRecord, setSelectedRecord] = useState<Record<string, any> | null>(null);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);

  // Total pages
  const totalPages = useMemo(() => {
    if (!totalCount || totalCount <= 0) return 1;
    return Math.max(1, Math.ceil(totalCount / pageSize));
  }, [totalCount, pageSize]);

  // Synchronize jump page input when page changes
  useEffect(() => {
    setJumpPageInput(String(currentPage));
  }, [currentPage]);

  // Comprehensive Supabase query with full diagnostics and RLS session verification
  const fetchClinicData = useCallback(async (
    page: number, 
    size: number, 
    sortCol: string | null, 
    sortDir: 'asc' | 'desc',
    search: string,
    searchCol: string,
    targetTable: string
  ) => {
    const config = getSupabaseConfigDetails();
    if (!config.isConfigured) {
      setIsLoading(false);
      setQueryState('error');
      setErrorMessage('Supabase is not configured yet. Please configure your Supabase Project URL and Anon Key in Settings.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setErrorCode(null);
    setErrorDetails(null);
    setAlternativeTableAvailable(null);

    const startTime = performance.now();

    try {
      // Step 1: Verify current authenticated session and role
      const authInfo = await getActiveAuthSession();

      // Step 2: Check exposed tables in PostgREST schema via OpenAPI spec
      let discoveredTables: string[] = [];
      try {
        const specRes = await fetch(`${config.url}/rest/v1/?apikey=${config.url ? localStorage.getItem('supabase_custom_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '' : ''}`, {
          headers: {
            apikey: localStorage.getItem('supabase_custom_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || '',
            Authorization: `Bearer ${authInfo.session?.access_token || localStorage.getItem('supabase_custom_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
          },
        });
        if (specRes.ok) {
          const specJson = await specRes.json();
          if (specJson.definitions) {
            discoveredTables = Object.keys(specJson.definitions);
          } else if (specJson.paths) {
            discoveredTables = Object.keys(specJson.paths).map((p) => p.replace(/^\//, ''));
          }
        }
      } catch {
        // schema probe is advisory
      }

      // Step 3: Build and execute exact Supabase query
      const from = (page - 1) * size;
      const to = from + size - 1;

      let query = supabase
        .from(targetTable)
        .select('*', { count: 'exact' });

      // Apply search filter if active
      const cleanSearch = search.trim();
      if (cleanSearch) {
        if (searchCol !== 'all' && searchCol) {
          query = query.ilike(searchCol, `%${cleanSearch}%`);
        } else {
          // Dynamic text column search
          const searchCandidates = [
            'Patient_ID', 'patient_id',
            'Appointment_ID', 'appointment_id',
            'disease', 'Disease',
            'department', 'Department',
            'Patient_Name', 'patient_name',
            'Doctor_Name', 'doctor_name'
          ];
          const orConditions = searchCandidates
            .map((col) => `${col}.ilike.%${cleanSearch}%`)
            .join(',');
          query = query.or(orConditions);
        }
      }

      // Apply sorting if active
      if (sortCol) {
        query = query.order(sortCol, { ascending: sortDir === 'asc' });
      }

      // Apply exact page range
      query = query.range(from, to);

      const res = await query;
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      // Assemble diagnostic report
      const report: DiagnosticReport = {
        timestamp: new Date().toLocaleTimeString(),
        targetTable,
        projectUrl: config.url,
        authStatus: authInfo.role === 'authenticated' ? 'authenticated' : 'anon',
        userEmail: authInfo.email,
        userId: authInfo.id,
        hasToken: Boolean(authInfo.session?.access_token),
        httpStatus: res.status,
        httpStatusText: res.statusText,
        returnedCount: res.count,
        returnedRowCount: res.data ? res.data.length : 0,
        queryError: res.error ? {
          message: res.error.message,
          code: res.error.code,
          details: res.error.details,
          hint: res.error.hint,
        } : null,
        exposedTables: discoveredTables,
        latencyMs,
      };

      setDiagnosticReport(report);

      // Console Logging as explicitly required
      console.group('🏥 Supabase Clinic Data Diagnostic Report');
      console.log('Target Table:', targetTable);
      console.log('Auth Context:', {
        role: authInfo.role,
        userEmail: authInfo.email,
        userId: authInfo.id,
        hasToken: Boolean(authInfo.session?.access_token),
      });
      console.log('PostgREST Response:', {
        status: res.status,
        statusText: res.statusText,
        error: res.error,
        count: res.count,
        rowCount: res.data?.length ?? 0,
        latency: `${latencyMs}ms`,
      });
      console.log('Discovered Public Tables:', discoveredTables);
      console.groupEnd();

      // Check for Query Failure
      if (res.error) {
        setQueryState('error');
        setErrorMessage(res.error.message || `Query failed with status ${res.status}`);
        setErrorCode(res.error.code || String(res.status));
        setErrorDetails(
          [
            res.error.details ? `Details: ${res.error.details}` : null,
            res.error.hint ? `Hint: ${res.error.hint}` : null,
            res.error.code ? `PostgREST Code: ${res.error.code}` : null,
          ].filter(Boolean).join(' | ') || `HTTP ${res.status}: ${res.statusText}`
        );
        setRows([]);
        setTotalCount(null);

        // Check if table relation name mismatch occurred
        if (
          res.error.code === '42P01' || 
          res.error.code === 'PGRST205' || 
          res.error.message.includes('relation') ||
          res.error.message.includes('does not exist')
        ) {
          // Probe if clinic_data (with underscore) exists in this project
          try {
            const probeUnderscore = await supabase.from('clinic_data').select('*', { count: 'exact' }).limit(1);
            if (!probeUnderscore.error && (probeUnderscore.count ?? 0) > 0) {
              setAlternativeTableAvailable('clinic_data');
            }
          } catch {
            // ignore
          }
        }
        return;
      }

      // Query Succeeded (No error returned)
      const receivedRows = (res.data as Record<string, any>[]) || [];
      const exactCount = res.count ?? 0;

      // Handle RLS Silent Filter (0 rows despite table existing)
      if (receivedRows.length === 0 && exactCount === 0) {
        setQueryState('empty_rls');
        setRows([]);
        setTotalCount(0);
        setLastFetchedAt(new Date());

        // Probe single row without filters
        try {
          const probe = await supabase.from(targetTable).select('*').limit(1);
          if (probe.data && probe.data.length > 0) {
            setColumns(Object.keys(probe.data[0]));
          }
        } catch {
          // ignore
        }
        return;
      }

      // Real rows retrieved successfully
      setQueryState('success');
      setRows(receivedRows);
      setTotalCount(exactCount);
      setLastFetchedAt(new Date());

      // Discover and preserve column names
      const colSet = new Set<string>();
      receivedRows.forEach((r) => {
        Object.keys(r).forEach((k) => colSet.add(k));
      });
      const discoveredCols = Array.from(colSet);
      if (discoveredCols.length > 0) {
        setColumns(discoveredCols);
      }
    } catch (err: any) {
      console.error('Fatal unexpected query exception:', err);
      setQueryState('error');
      setErrorMessage(err.message || 'An unexpected runtime error occurred while executing the Supabase query.');
      setErrorDetails(err.stack || String(err));
      setRows([]);
      setTotalCount(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and dependency updates
  useEffect(() => {
    fetchClinicData(
      currentPage, 
      pageSize, 
      sortColumn, 
      sortDirection, 
      activeSearchQuery, 
      selectedSearchColumn, 
      activeTableName
    );
  }, [currentPage, pageSize, sortColumn, sortDirection, activeSearchQuery, selectedSearchColumn, activeTableName, fetchClinicData]);

  // Handle Sort Toggle
  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearchQuery(searchTerm.trim());
    setCurrentPage(1);
  };

  // Handle Search Reset
  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveSearchQuery('');
    setSelectedSearchColumn('all');
    setCurrentPage(1);
  };

  // Handle Page Change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle Jump to Page
  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      handlePageChange(p);
    } else {
      setJumpPageInput(String(currentPage));
    }
  };

  // Export current loaded records to CSV
  const handleExportCurrentView = () => {
    if (rows.length === 0) return;
    const headerRow = columns.join(',');
    const csvRows = rows.map((row) => {
      return columns.map((col) => {
        const val = row[col];
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(',');
    });
    const csvContent = [headerRow, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeTableName.replace(/\s+/g, '_')}_page_${currentPage}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate pagination page numbers
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  // Format cell values nicely
  const renderCellValue = (val: any, colName: string) => {
    if (val === null || val === undefined || val === '') {
      return <span className="text-slate-300 font-mono text-[11px]">—</span>;
    }
    const lowerCol = colName.toLowerCase();

    if (lowerCol === 'status') {
      const st = String(val).toLowerCase();
      let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
      if (st.includes('confirm') || st.includes('complete') || st.includes('normal')) {
        badgeStyle = 'bg-teal-50 text-teal-700 border-teal-200';
      } else if (st.includes('cancel') || st.includes('miss') || st.includes('no-show')) {
        badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
      } else if (st.includes('pend') || st.includes('wait') || st.includes('sched')) {
        badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
      }
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyle}`}>
          {String(val)}
        </span>
      );
    }

    if (lowerCol === 'priority') {
      const prio = String(val).toLowerCase();
      let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
      if (prio.includes('urgent') || prio.includes('emerg') || prio.includes('high')) {
        badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
      } else if (prio.includes('med')) {
        badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
      } else if (prio.includes('low') || prio.includes('norm')) {
        badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      }
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyle}`}>
          {String(val)}
        </span>
      );
    }

    if (lowerCol.includes('id')) {
      return (
        <span className="font-mono text-xs font-semibold text-teal-700 bg-teal-50/60 px-1.5 py-0.5 rounded border border-teal-100">
          {String(val)}
        </span>
      );
    }

    if (lowerCol.includes('disease') || lowerCol.includes('diagnosis')) {
      return (
        <span className="font-medium text-slate-900 flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-teal-600 shrink-0" />
          <span>{String(val)}</span>
        </span>
      );
    }

    if (lowerCol.includes('department')) {
      return (
        <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-xs">
          {String(val)}
        </span>
      );
    }

    return <span className="text-slate-800 text-xs truncate max-w-[220px] block" title={String(val)}>{String(val)}</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & SUMMARY STATUS BANNER                     */}
      {/* ========================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${
              queryState === 'error'
                ? 'bg-rose-600 text-white shadow-rose-600/20'
                : queryState === 'empty_rls'
                ? 'bg-amber-600 text-white shadow-amber-600/20'
                : 'bg-teal-600 text-white shadow-teal-600/20'
            }`}>
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Supabase &apos;{activeTableName}&apos; Dataset
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  queryState === 'error'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : queryState === 'empty_rls'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-teal-50 text-teal-700 border-teal-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    queryState === 'error' ? 'bg-rose-500' : queryState === 'empty_rls' ? 'bg-amber-500' : 'bg-teal-500 animate-pulse'
                  }`} />
                  {queryState === 'error' ? 'Query Failed' : queryState === 'empty_rls' ? 'RLS Restricted' : 'Live Connected'}
                </span>
                <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                  public.&quot;{activeTableName}&quot;
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Direct PostgREST queries with exact count telemetry, 100 records/page server pagination, and RLS policy verification.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowDiagnosticPanel(!showDiagnosticPanel)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all shadow-xs active:scale-95 ${
                showDiagnosticPanel ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{showDiagnosticPanel ? 'Hide Diagnostics' : 'Diagnostics'}</span>
            </button>

            <button
              type="button"
              onClick={() => fetchClinicData(currentPage, pageSize, sortColumn, sortDirection, activeSearchQuery, selectedSearchColumn, activeTableName)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-xs active:scale-95 disabled:opacity-50"
              title="Refresh dataset from Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleExportCurrentView}
              disabled={rows.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-xs active:scale-95 disabled:opacity-50"
              title="Export current page to CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-all active:scale-95"
            >
              <Database className="w-3.5 h-3.5 text-teal-600" />
              <span>Supabase Config</span>
            </button>
          </div>
        </div>

        {/* Requirements Metric Cards: Total Records & Total Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-5">
          {/* Metric 1: Total Records */}
          <div className={`border rounded-2xl p-3.5 flex items-center gap-3 ${
            queryState === 'error'
              ? 'bg-rose-50/60 border-rose-200 text-rose-900'
              : queryState === 'empty_rls'
              ? 'bg-amber-50/60 border-amber-200 text-amber-900'
              : 'bg-slate-50 border-slate-200/80 text-slate-800'
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              queryState === 'error'
                ? 'bg-rose-100 text-rose-700'
                : queryState === 'empty_rls'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-teal-100 text-teal-700'
            }`}>
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Records
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900">
                {isLoading ? (
                  <span className="inline-block w-16 h-5 bg-slate-200 animate-pulse rounded" />
                ) : queryState === 'error' ? (
                  <span className="text-rose-600 text-sm font-bold">Query Failed</span>
                ) : queryState === 'empty_rls' ? (
                  <span className="text-amber-700 text-sm font-bold">0 (RLS Locked)</span>
                ) : (
                  totalCount !== null ? totalCount.toLocaleString() : '0'
                )}
              </div>
            </div>
          </div>

          {/* Metric 2: Total Columns */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Columns className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Columns
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900">
                {isLoading ? (
                  <span className="inline-block w-14 h-5 bg-slate-200 animate-pulse rounded" />
                ) : queryState === 'error' ? (
                  <span className="text-slate-400 text-sm font-medium">N/A</span>
                ) : columns.length > 0 ? (
                  `${columns.length} Columns`
                ) : (
                  <span className="text-amber-600 text-sm font-semibold">0 Detected</span>
                )}
              </div>
            </div>
          </div>

          {/* Metric 3: Page Window */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Current Page
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>

          {/* Metric 4: Range Per Page */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <TableIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Rows Per Page
              </div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900">
                {pageSize} Records
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. LIVE DIAGNOSTIC & RLS VERIFICATION CONSOLE             */}
      {/* ========================================================= */}
      {showDiagnosticPanel && diagnosticReport && (
        <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Live Supabase PostgREST Diagnostics & RLS Inspector
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                Latency: {diagnosticReport.latencyMs}ms
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-mono text-[11px]">
                Executed at {diagnosticReport.timestamp}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Target Table */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Target Relation</span>
              <span className="font-mono text-teal-400 font-bold mt-1 block">
                public.&quot;{diagnosticReport.targetTable}&quot;
              </span>
            </div>

            {/* HTTP Status */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">PostgREST Response</span>
              <span className={`font-mono font-bold mt-1 block ${
                diagnosticReport.queryError ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {diagnosticReport.httpStatus} {diagnosticReport.httpStatusText || (diagnosticReport.queryError ? 'Error' : 'OK')}
              </span>
            </div>

            {/* Auth Session & Role */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Client Role & Identity</span>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                  diagnosticReport.authStatus === 'authenticated'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {diagnosticReport.authStatus.toUpperCase()}
                </span>
                <span className="font-mono text-[11px] text-slate-300 truncate max-w-[120px]" title={diagnosticReport.userEmail || 'anon'}>
                  {diagnosticReport.userEmail || 'unauthenticated'}
                </span>
              </div>
            </div>

            {/* Counts */}
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Returned Records / Exact Count</span>
              <span className="font-mono text-slate-200 font-bold mt-1 block">
                {diagnosticReport.returnedRowCount} rows / {diagnosticReport.returnedCount !== null ? diagnosticReport.returnedCount : 'null'}
              </span>
            </div>
          </div>

          {/* Error display if query failed */}
          {diagnosticReport.queryError && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>PostgREST Query Error Detected (Not Treated as Zero-Row Result):</span>
              </div>
              <div className="font-mono text-xs text-rose-300 bg-rose-950/80 p-2.5 rounded-xl border border-rose-900 break-all">
                {diagnosticReport.queryError.message}
              </div>
              {diagnosticReport.queryError.code && (
                <div className="text-[11px] text-rose-400 font-mono">
                  Error Code: <strong className="text-rose-200">{diagnosticReport.queryError.code}</strong>
                  {diagnosticReport.queryError.hint && ` | Hint: ${diagnosticReport.queryError.hint}`}
                </div>
              )}
            </div>
          )}

          {/* Alternative table discovery banner */}
          {alternativeTableAvailable && (
            <div className="p-4 rounded-2xl bg-teal-950/50 border border-teal-500/40 text-teal-200 text-xs flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
                <div>
                  <strong className="text-teal-300">Table &apos;{alternativeTableAvailable}&apos; Detected in Project!</strong>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    We tested the alternative table name &apos;{alternativeTableAvailable}&apos; and found active records.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTableName(alternativeTableAvailable);
                  setCurrentPage(1);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-900 bg-teal-400 hover:bg-teal-300 transition-colors shadow-sm"
              >
                Switch Table to &apos;{alternativeTableAvailable}&apos;
              </button>
            </div>
          )}

          {/* RLS Diagnosis when 0 records returned without an explicit error */}
          {queryState === 'empty_rls' && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Row Level Security (RLS) Advisory:</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                The PostgREST query completed with HTTP 200 OK, but returned <strong>0 records</strong> for role <strong className="text-amber-300">{diagnosticReport.authStatus}</strong> ({diagnosticReport.userEmail || 'anon'}). In Supabase PostgreSQL, tables with Row Level Security (RLS) enabled silently filter out all rows unless a matching SELECT policy allows the client role to view them.
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-teal-300 space-y-1">
                <div className="text-slate-400">-- To enable read access in your Supabase SQL Editor:</div>
                <div>CREATE POLICY &quot;Enable read access for all&quot; ON public.&quot;{activeTableName}&quot; FOR SELECT USING (true);</div>
                <div className="text-slate-400 mt-1">-- Or disable RLS for direct access:</div>
                <div>ALTER TABLE public.&quot;{activeTableName}&quot; DISABLE ROW LEVEL SECURITY;</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SEARCH & FILTER TOOLBAR                                */}
      {/* ========================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Table Switcher Selector */}
          <div className="relative min-w-[170px]">
            <select
              value={activeTableName}
              onChange={(e) => {
                setActiveTableName(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="clinic data">Table: &quot;clinic data&quot;</option>
              <option value="clinic_data">Table: &quot;clinic_data&quot;</option>
            </select>
            <Database className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Search Column Selector */}
          <div className="relative min-w-[190px]">
            <select
              value={selectedSearchColumn}
              onChange={(e) => setSelectedSearchColumn(e.target.value)}
              className="w-full pl-8 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="all">🔍 All Searchable Columns</option>
              {columns.map((col) => (
                <option key={col} value={col}>
                  Search in: {col}
                </option>
              ))}
            </select>
            <Filter className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Search text input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Patient_ID, Appointment_ID, disease, department, doctor, etc..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Submit Search & Reset Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-600/20 transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>

            {activeSearchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Active Filter Badges */}
        {(activeSearchQuery || sortColumn) && (
          <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100 flex-wrap text-xs">
            <span className="text-slate-400 font-medium text-[11px]">Active Filters:</span>
            {activeSearchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                <span>Filter: &quot;{activeSearchQuery}&quot;</span>
                {selectedSearchColumn !== 'all' && (
                  <span className="text-teal-600 text-[10px]">({selectedSearchColumn})</span>
                )}
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="hover:text-teal-950 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {sortColumn && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                <span>Sorted by: {sortColumn} ({sortDirection.toUpperCase()})</span>
                <button
                  type="button"
                  onClick={() => setSortColumn(null)}
                  className="hover:text-blue-950 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. MAIN DATA TABLE / ERROR CONTAINER                      */}
      {/* ========================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {/* Table status bar */}
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-teal-600" />
            <span className="font-semibold text-slate-800">
              {queryState === 'error' ? (
                <span className="text-rose-600 font-bold">Query Error Occurred</span>
              ) : queryState === 'empty_rls' ? (
                <span className="text-amber-700 font-bold">0 records returned (RLS Filtered)</span>
              ) : (
                `Showing records ${totalCount && totalCount > 0 ? ((currentPage - 1) * pageSize + 1).toLocaleString() : 0} – ${Math.min(currentPage * pageSize, totalCount || 0).toLocaleString()} of ${(totalCount || 0).toLocaleString()}`
              )}
            </span>
            {lastFetchedAt && (
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                • Synced at {lastFetchedAt.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>

        {/* Scrollable Table or Error State Container */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            /* Skeleton Loading State */
            <div className="p-8 space-y-4">
              <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
                <Loader2 className="w-7 h-7 text-teal-600 animate-spin" />
                <span className="text-sm font-semibold text-slate-700">
                  Retrieving records from Supabase &apos;{activeTableName}&apos; table...
                </span>
              </div>
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : queryState === 'error' ? (
            /* Explicit Query Error View - NOT treated as zero rows */
            <div className="py-14 px-6 text-center max-w-xl mx-auto space-y-4">
              <div className="w-14 h-14 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Supabase Query Failed for Table &quot;{activeTableName}&quot;
                </h3>
                <p className="text-xs text-rose-700 font-mono mt-1 break-all bg-rose-50 p-3 rounded-xl border border-rose-200 text-left">
                  {errorMessage}
                </p>
                {errorDetails && (
                  <p className="text-[11px] text-slate-500 font-mono mt-2 text-left">
                    {errorDetails}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => fetchClinicData(currentPage, pageSize, sortColumn, sortDirection, activeSearchQuery, selectedSearchColumn, activeTableName)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Retry Query
                </button>
                {alternativeTableAvailable && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTableName(alternativeTableAvailable);
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors"
                  >
                    Try &quot;{alternativeTableAvailable}&quot;
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowConfigModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Check Supabase Settings
                </button>
              </div>
            </div>
          ) : rows.length === 0 ? (
            /* Empty or RLS Restricted State */
            <div className="py-16 px-6 text-center max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {queryState === 'empty_rls' ? 'No Records Visible (Row Level Security Active)' : 'No Records Match Filter'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {queryState === 'empty_rls'
                  ? `The query to public."${activeTableName}" returned 0 records. If the table is populated in Supabase, an existing RLS policy is restricting SELECT permissions for your current authentication role.`
                  : activeSearchQuery
                  ? `No records in "${activeTableName}" match "${activeSearchQuery}". Try clearing your search query.`
                  : `Table "${activeTableName}" returned 0 rows.`}
              </p>
              <div className="mt-4 flex items-center justify-center gap-3 flex-wrap">
                {activeSearchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fetchClinicData(currentPage, pageSize, sortColumn, sortDirection, activeSearchQuery, selectedSearchColumn, activeTableName)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Re-test Query
                </button>
              </div>
            </div>
          ) : (
            /* Real Data Table */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider select-none sticky top-0 z-10 backdrop-blur-xs">
                  <th className="py-3 px-3.5 text-center w-12 text-slate-400 font-mono">#</th>
                  {columns.map((col) => {
                    const isSorted = sortColumn === col;
                    return (
                      <th
                        key={col}
                        onClick={() => handleSort(col)}
                        className="py-3 px-3.5 cursor-pointer hover:bg-slate-200/60 transition-colors whitespace-nowrap group"
                        title={`Click to sort by ${col}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col}</span>
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
                          )}
                        </div>
                      </th>
                    );
                  })}
                  <th className="py-3 px-3.5 text-center w-20">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {rows.map((row, idx) => {
                  const globalRowIndex = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={row.id || row.Appointment_ID || row.Patient_ID || idx}
                      onClick={() => setSelectedRecord(row)}
                      className="hover:bg-teal-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Row index */}
                      <td className="py-3 px-3.5 text-center text-[11px] font-mono text-slate-400 bg-slate-50/50">
                        {globalRowIndex}
                      </td>

                      {/* Dynamic Columns */}
                      {columns.map((col) => (
                        <td key={col} className="py-3 px-3.5 whitespace-nowrap">
                          {renderCellValue(row[col], col)}
                        </td>
                      ))}

                      {/* Detail action */}
                      <td className="py-3 px-3.5 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(row);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                          title="View all details for this record"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ========================================================= */}
        {/* 5. PAGINATION CONTROLS (100 RECORDS PER PAGE)             */}
        {/* ========================================================= */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Summary Information */}
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Showing <strong className="text-slate-900 font-semibold">{totalCount && totalCount > 0 ? ((currentPage - 1) * pageSize + 1).toLocaleString() : 0}</strong> to <strong className="text-slate-900 font-semibold">{Math.min(currentPage * pageSize, totalCount || 0).toLocaleString()}</strong> of <strong className="text-slate-900 font-semibold">{(totalCount || 0).toLocaleString()}</strong> records
          </div>

          {/* Page buttons */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {/* First page */}
            <button
              type="button"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1 || isLoading || !totalCount || totalCount <= 0}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all disabled:opacity-40 disabled:pointer-events-none"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* Previous page */}
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading || !totalCount || totalCount <= 0}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all disabled:opacity-40 disabled:pointer-events-none"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Number buttons */}
            <div className="flex items-center gap-1">
              {pageNumbers.map((p, i) => {
                if (p === '...') {
                  return (
                    <span key={`ellipsis-${i}`} className="px-2 text-xs text-slate-400 select-none">
                      ...
                    </span>
                  );
                }
                const pageNum = Number(p);
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isLoading}
                    className={`min-w-[34px] h-[34px] px-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next page */}
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading || !totalCount || totalCount <= 0}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all disabled:opacity-40 disabled:pointer-events-none"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last page */}
            <button
              type="button"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage >= totalPages || isLoading || !totalCount || totalCount <= 0}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition-all disabled:opacity-40 disabled:pointer-events-none"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>

          {/* Jump to Page Input */}
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Go to page:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              disabled={!totalCount || totalCount <= 0}
              className="w-16 px-2 py-1.5 text-center bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!totalCount || totalCount <= 0}
              className="px-2.5 py-1.5 rounded-lg font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-xs disabled:opacity-50"
            >
              Go
            </button>
          </form>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6. RECORD DETAILS INSPECTOR MODAL                         */}
      {/* ========================================================= */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Clinical Record Details
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedRecord.Appointment_ID || selectedRecord.appointment_id || selectedRecord.Patient_ID || selectedRecord.patient_id || selectedRecord.id || 'Row Item'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: All Columns Grid */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {Object.entries(selectedRecord).map(([key, val]) => (
                  <div key={key} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {key}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-900 break-words">
                      {val !== null && val !== undefined && val !== '' ? String(val) : <span className="text-slate-300 font-mono">—</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedRecord, null, 2));
                  alert('Record JSON copied to clipboard.');
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                Copy JSON
              </button>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Config Modal for credentials */}
      <SupabaseConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onConfigSaved={() => {
          fetchClinicData(currentPage, pageSize, sortColumn, sortDirection, activeSearchQuery, selectedSearchColumn, activeTableName);
        }}
      />
    </div>
  );
};
