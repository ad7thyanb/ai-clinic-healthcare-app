import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  Download,
  RefreshCw,
  Database,
  Server,
  Clock,
  User,
  Stethoscope,
  Info,
  Check,
  Calendar,
  AlertCircle,
  Eye,
  Trash2
} from 'lucide-react';
import {
  previewClinicCsv,
  importClinicCsv,
  fetchSampleClinicCsv,
  fetchClinicCsvSchema,
  CsvPreviewResponse,
  CsvPreviewRow
} from '../../api/clinicApi';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedCount: number, duplicatesSkipped: number) => void;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<CsvPreviewResponse | null>(null);
  const [filterView, setFilterView] = useState<'all' | 'valid' | 'duplicates'>('all');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    importedCount: number;
    duplicatesSkipped: number;
    mysqlInserted: boolean;
  } | null>(null);
  const [schemaInfo, setSchemaInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch schema info
      fetchClinicCsvSchema()
        .then((s) => setSchemaInfo(s))
        .catch(() => {});
    } else {
      // Reset state on close
      setFileName(null);
      setCsvContent('');
      setPreviewData(null);
      setImportResult(null);
      setErrorMessage(null);
      setFilterView('all');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProcessCsvText = async (text: string, name: string) => {
    setLoading(true);
    setErrorMessage(null);
    setImportResult(null);
    try {
      const preview = await previewClinicCsv(text);
      setCsvContent(text);
      setFileName(name);
      setPreviewData(preview);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse CSV file. Please verify CSV format.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleProcessCsvText(text, file.name);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read file from disk.');
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        handleProcessCsvText(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSample = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const sample = await fetchSampleClinicCsv();
      await handleProcessCsvText(sample.csvContent, sample.filename || 'ai_clinic_sample_data.csv');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not load sample CSV.');
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.location.href = '/api/csv/sample-template?download=true';
  };

  const handleExecuteImport = async () => {
    if (!csvContent) return;
    setImporting(true);
    setErrorMessage(null);
    try {
      const result = await importClinicCsv(csvContent);
      setImportResult({
        success: result.success,
        message: result.message,
        importedCount: result.importedCount,
        duplicatesSkipped: result.duplicatesSkipped,
        mysqlInserted: result.mysqlInserted,
      });
      onImportSuccess(result.importedCount, result.duplicatesSkipped);
    } catch (err: any) {
      setErrorMessage(err.message || 'Import operation failed.');
    } finally {
      setImporting(false);
    }
  };

  const displayedRows: CsvPreviewRow[] = previewData
    ? previewData.previewRows.filter((r) => {
        if (filterView === 'valid') return r.isValid;
        if (filterView === 'duplicates') return r.isDuplicate;
        return true;
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#0D182E] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-[#0B1325]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  AI Clinic CSV Upload &amp; MySQL Sync
                </h3>
                {schemaInfo?.mysqlConnected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    MySQL `clinic_data`: Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    <Database className="w-3 h-3 text-cyan-400" />
                    Target: MySQL clinic_data
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Validate column schema, preview rows, filter duplicate slots, and populate clinic EHR records.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Validation Error: </span>
                {errorMessage}
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Success Result Banner */}
          {importResult && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-white">{importResult.message}</div>
                  <div className="text-xs text-emerald-300/90 mt-0.5">
                    Imported: <span className="font-bold font-mono text-white">{importResult.importedCount}</span> valid rows ·
                    Duplicates Skipped: <span className="font-bold font-mono text-amber-300">{importResult.duplicatesSkipped}</span> ·
                    Dashboard stats updated.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shrink-0"
              >
                Close &amp; View Dashboard
              </button>
            </div>
          )}

          {/* Dropzone & Quick Action Bar */}
          {!importResult && (
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all ${
                  dragActive
                    ? 'border-cyan-400 bg-cyan-500/10 scale-[1.005]'
                    : 'border-slate-700 hover:border-slate-600 bg-[#0B1325]/70'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <div className="text-sm font-bold text-white mb-1">
                  Drag and drop your AI Clinic CSV file here, or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-cyan-400 hover:text-cyan-300 underline font-semibold"
                  >
                    browse files
                  </button>
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Supports CSV format with Patient Name, Doctor, Date, Time, Department, Diagnosis, Priority, and Status.
                </p>

                {fileName && (
                  <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-cyan-300 font-mono">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{fileName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFileName(null);
                        setCsvContent('');
                        setPreviewData(null);
                      }}
                      className="text-slate-400 hover:text-rose-400 ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons: Sample Data & Template Download */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Load Sample AI Clinic CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-[#111C35] hover:bg-[#162344] border border-slate-700 transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>Download CSV Template</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Target Table: <code className="text-cyan-300 font-mono">clinic_data</code></span>
                </div>
              </div>
            </div>
          )}

          {/* Validation & Column Schema Inspection Panel */}
          {previewData && (
            <div className="space-y-4">
              {/* Summary KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#0B1325] border border-slate-800 rounded-xl p-3">
                  <div className="text-[11px] text-slate-400 font-medium">Total CSV Rows</div>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">
                    {previewData.totalRows}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Rows detected in file</div>
                </div>

                <div className="bg-[#0B1325] border border-emerald-500/30 rounded-xl p-3">
                  <div className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Valid to Import
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                    {previewData.validRowsCount}
                  </div>
                  <div className="text-[10px] text-emerald-400/70 mt-0.5">Ready for MySQL sync</div>
                </div>

                <div className="bg-[#0B1325] border border-amber-500/30 rounded-xl p-3">
                  <div className="text-[11px] text-amber-300 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    Duplicate Conflicts
                  </div>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                    {previewData.duplicateCount}
                  </div>
                  <div className="text-[10px] text-amber-400/70 mt-0.5">Will be skipped</div>
                </div>

                <div className="bg-[#0B1325] border border-slate-800 rounded-xl p-3">
                  <div className="text-[11px] text-slate-400 font-medium">Column Matching</div>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
                    {Object.keys(previewData.matchedColumns).length}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {previewData.missingRequired.length === 0 ? 'All 4 required matched' : `${previewData.missingRequired.length} missing`}
                  </div>
                </div>
              </div>

              {/* Column Mapping Badges */}
              <div className="bg-[#0B1325] border border-slate-800 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Schema Columns Mapping &amp; Validation</span>
                  </div>
                  {previewData.missingRequired.length === 0 ? (
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Schema Validated
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Missing: {previewData.missingRequired.join(', ')}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: 'patient_name', label: 'Patient Name', req: true },
                    { key: 'doctor_name', label: 'Doctor Name', req: true },
                    { key: 'appointment_date', label: 'Appt Date', req: true },
                    { key: 'appointment_time', label: 'Appt Time', req: true },
                    { key: 'department', label: 'Department', req: false },
                    { key: 'disease', label: 'Diagnosis', req: false },
                    { key: 'status', label: 'Status', req: false },
                    { key: 'priority', label: 'Priority', req: false },
                    { key: 'type', label: 'Type', req: false },
                    { key: 'room', label: 'Room', req: false },
                    { key: 'chief_complaint', label: 'Chief Complaint', req: false },
                    { key: 'revenue', label: 'Fee / Revenue', req: false },
                  ].map((col) => {
                    const matchedHeader = previewData.matchedColumns[col.key];
                    const isMatched = Boolean(matchedHeader);
                    return (
                      <span
                        key={col.key}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border font-medium ${
                          isMatched
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : col.req
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isMatched ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : col.req ? <AlertTriangle className="w-2.5 h-2.5 text-rose-400" /> : null}
                        <span>{col.label}</span>
                        {isMatched && <span className="text-slate-400 text-[10px]">({matchedHeader})</span>}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Duplicate Prevention Callout if any found */}
              {previewData.duplicateCount > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-300">
                      Duplicate Appointments Detected ({previewData.duplicateCount})
                    </div>
                    <div className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">
                      To protect scheduling integrity, duplicate appointments (conflicting physician slots or duplicate IDs) have been flagged and will be automatically skipped during import. Valid rows will proceed to MySQL and EHR storage.
                    </div>
                  </div>
                </div>
              )}

              {/* Data Preview Table */}
              <div className="bg-[#0B1325] border border-slate-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Data Preview</span>
                    <span className="text-[11px] text-slate-400 font-mono">({displayedRows.length} rows)</span>
                  </div>

                  {/* Filter View Selector */}
                  <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setFilterView('all')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        filterView === 'all' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All ({previewData.totalRows})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterView('valid')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        filterView === 'valid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Valid ({previewData.validRowsCount})
                    </button>
                    {previewData.duplicateCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setFilterView('duplicates')}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                          filterView === 'duplicates' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Duplicates ({previewData.duplicateCount})
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-[#090F1D] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Row</th>
                        <th className="py-2.5 px-3">Validation Status</th>
                        <th className="py-2.5 px-3">Patient</th>
                        <th className="py-2.5 px-3">Physician</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Slot Date &amp; Time</th>
                        <th className="py-2.5 px-3">Priority / Type</th>
                        <th className="py-2.5 px-3">Diagnosis</th>
                        <th className="py-2.5 px-3">Room</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {displayedRows.map((row) => (
                        <tr
                          key={row.rowIndex}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            row.isDuplicate ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          <td className="py-2 px-3 font-mono text-slate-400">{row.rowIndex}</td>
                          <td className="py-2 px-3">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Valid Slot
                              </span>
                            ) : row.isDuplicate ? (
                              <div className="max-w-xs">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                                  Duplicate - Will Skip
                                </span>
                                {row.duplicateReason && (
                                  <div className="text-[10px] text-amber-400/90 mt-0.5 truncate">
                                    {row.duplicateReason}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                <AlertCircle className="w-3 h-3 text-rose-400" />
                                Invalid
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <div className="font-semibold text-white">{row.patientName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{row.patientId}</div>
                          </td>
                          <td className="py-2 px-3 text-slate-200">{row.doctorName}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[11px] font-medium border border-slate-700">
                              {row.department}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-200 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-cyan-400" />
                              <span>{row.date}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{row.time}</span>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="text-white font-medium">{row.priority}</div>
                            <div className="text-[10px] text-slate-400">{row.type}</div>
                          </td>
                          <td className="py-2 px-3 text-slate-300 max-w-[160px] truncate" title={row.disease}>
                            {row.disease}
                          </td>
                          <td className="py-2 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                            {row.room}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-6 py-4 border-t border-slate-800 bg-[#0B1325]">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {previewData
                ? `${previewData.validRowsCount} valid appointment row(s) ready to insert into MySQL clinic_data.`
                : 'Upload or load sample CSV to preview and validate records.'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>

            {previewData && (
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={importing || previewData.validRowsCount === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 transition-all flex items-center gap-2 shadow-md shadow-cyan-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing to MySQL clinic_data...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Import {previewData.validRowsCount} Valid Records</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
