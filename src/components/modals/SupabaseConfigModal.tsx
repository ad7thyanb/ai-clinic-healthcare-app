import React, { useState } from 'react';
import { 
  KeyRound, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  X, 
  Database,
  RefreshCw,
  Copy,
  Info
} from 'lucide-react';
import { 
  getSupabaseConfigDetails, 
  configureSupabase, 
  clearCustomSupabaseConfig, 
  isSupabaseConfigured 
} from '../../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const config = getSupabaseConfigDetails();
  const [url, setUrl] = useState(config.url || '');
  const [anonKey, setAnonKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('idle');
    try {
      configureSupabase(url, anonKey);
      setStatus('success');
      setStatusMessage('Supabase configuration applied successfully!');
      setTimeout(() => {
        if (onConfigSaved) onConfigSaved();
        onClose();
      }, 1000);
    } catch (err: any) {
      setStatus('error');
      setStatusMessage(err.message || 'Failed to apply Supabase credentials.');
    }
  };

  const handleReset = () => {
    clearCustomSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setStatus('idle');
    setStatusMessage('Configuration reset to default environment variables.');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(label);
    setTimeout(() => setCopiedVar(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 text-slate-800">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Supabase Authentication Settings</h3>
              <p className="text-xs text-slate-500">Configure your Supabase project for real authentication</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status banner */}
        <div className={`p-3.5 rounded-2xl mb-5 text-xs flex items-center gap-3 ${
          isSupabaseConfigured()
            ? 'bg-teal-50 border border-teal-200 text-teal-900'
            : 'bg-amber-50 border border-amber-200 text-amber-900'
        }`}>
          {isSupabaseConfigured() ? (
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <div className="flex-1">
            <div className="font-bold">
              {isSupabaseConfigured() ? 'Supabase Project Connected' : 'Supabase Credentials Needed'}
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              {isSupabaseConfigured()
                ? `Active URL: ${config.url}`
                : 'Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable real user authentication.'}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2 mb-5">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-teal-600" />
            <span>Where to find your Supabase credentials:</span>
          </div>
          <ol className="list-decimal pl-5 space-y-1 text-[11px] leading-relaxed text-slate-600">
            <li>Go to your project at <strong className="text-slate-900">supabase.com</strong></li>
            <li>Click on <strong className="text-slate-900">Project Settings → API</strong></li>
            <li>Copy <strong className="text-slate-900">Project URL</strong> and <strong className="text-slate-900">anon / public</strong> API key</li>
            <li className="text-rose-700 font-semibold">Never enter or expose the service_role key</li>
          </ol>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supabase Project URL (VITE_SUPABASE_URL)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Supabase Anon / Public Key (VITE_SUPABASE_ANON_KEY)
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              required={!isSupabaseConfigured()}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 font-mono"
            />
          </div>

          {statusMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              status === 'success'
                ? 'bg-teal-50 border border-teal-200 text-teal-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}>
              {status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Reset to Defaults
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Save Credentials</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
