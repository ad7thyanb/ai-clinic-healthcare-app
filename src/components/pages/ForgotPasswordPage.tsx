import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, KeyRound, Loader2 } from 'lucide-react';
import { useRouter } from '../../router/Router';
import { PublicNavbar } from '../layout/PublicNavbar';
import { PublicFooter } from '../layout/PublicFooter';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { normalizeEmail, isValidEmail, formatSupabaseAuthError } from '../../lib/authHelpers';

export const ForgotPasswordPage: React.FC = () => {
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeEmail(email);
    if (!normalized) {
      setError('Please enter your registered clinical email address.');
      return;
    }
    if (!isValidEmail(normalized)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      let sbDispatched = false;
      if (isSupabaseConfigured()) {
        try {
          const { error: sbError } = await supabase.auth.resetPasswordForEmail(normalized, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          if (!sbError) sbDispatched = true;
        } catch {
          // fallback to backend
        }
      }

      // Also dispatch to clinic backend store to generate a verifiable reset token
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized }),
      });
      const data = await res.json();

      setSuccessMessage(
        sbDispatched
          ? `Password recovery link dispatched via Supabase to ${normalized}. Please check your email inbox.`
          : `Password recovery token generated for ${normalized}.`
      );
      if (data.resetToken) {
        setGeneratedToken(data.resetToken);
      }
    } catch (err: any) {
      setError(formatSupabaseAuthError(err) || 'Unable to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto shadow-sm mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Password Recovery</h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your registered clinical account email to receive a password reset link.
            </p>
          </div>

          {successMessage ? (
            <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-3.5">
              <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Recovery Dispatched</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{successMessage}</p>

              {generatedToken && (
                <div className="p-3 bg-white rounded-xl border border-teal-200 text-left space-y-1">
                  <div className="text-[11px] font-bold text-slate-700">Clinical Reset Token:</div>
                  <div className="font-mono text-xs text-teal-800 break-all select-all font-semibold bg-slate-50 p-1.5 rounded border border-slate-200">
                    {generatedToken}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/reset-password?token=${encodeURIComponent(generatedToken)}`)}
                    className="w-full mt-2 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Proceed with Reset Token</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-semibold hover:text-slate-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Login</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. physician@clinic.org"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Password Reset Link</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-200 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
