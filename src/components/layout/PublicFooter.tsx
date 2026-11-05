import React from 'react';
import { HeartPulse, ShieldCheck, FileText, CheckCircle2, FileCheck2, Database } from 'lucide-react';
import { useRouter } from '../../router/Router';
import { isSupabaseConfigured } from '../../lib/supabase';

export const PublicFooter: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-200">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">AI Clinic</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Intelligent healthcare operations and electronic medical record management. Connecting clinicians, patients, and triage staff in real time.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>HIPAA Compliant &amp; HL7/FHIR Ready</span>
            </div>
          </div>

          {/* Clinical Navigation */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Clinic Navigation</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button type="button" onClick={() => navigate('/')} className="hover:text-teal-700 transition-colors">
                  Home Overview
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/about')} className="hover:text-teal-700 transition-colors">
                  About Our Clinic
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/doctors')} className="hover:text-teal-700 transition-colors">
                  Physicians Directory
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/services')} className="hover:text-teal-700 transition-colors">
                  Services &amp; Specialties
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/contact')} className="hover:text-teal-700 transition-colors">
                  Contact &amp; Emergency Desk
                </button>
              </li>
              <li>
                <button 
                  type="button" 
                  onClick={() => navigate('/acceptance-tests')} 
                  className="text-teal-700 font-bold hover:text-teal-800 transition-colors flex items-center gap-1.5"
                  title="Open Acceptance Tests Page"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Acceptance Tests</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Patient Services */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Patient Services</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button type="button" onClick={() => navigate('/login')} className="hover:text-teal-700 transition-colors">
                  Patient Portal Login
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/signup')} className="hover:text-teal-700 transition-colors">
                  New Patient Registration
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/forgot-password')} className="hover:text-teal-700 transition-colors">
                  Password Recovery
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/verify-email')} className="hover:text-teal-700 transition-colors">
                  Email Verification
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Governance &amp; Privacy</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button type="button" onClick={() => navigate('/privacy')} className="hover:text-teal-700 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Privacy Policy (HIPAA)</span>
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/terms')} className="hover:text-teal-700 transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Terms of Service</span>
                </button>
              </li>
              <li className="pt-2 text-[11px] text-slate-500 leading-snug">
                For life-threatening medical emergencies, please dial 911 or visit the nearest emergency medical department immediately.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} AI Clinic Management System. Powered by Supabase Authentication.</p>
          <div className="flex items-center gap-6">
            <button type="button" onClick={() => navigate('/privacy')} className="hover:text-slate-800 transition-colors">
              Privacy
            </button>
            <button type="button" onClick={() => navigate('/terms')} className="hover:text-slate-800 transition-colors">
              Terms
            </button>
            <button type="button" onClick={() => navigate('/acceptance-tests')} className="hover:text-teal-700 transition-colors">
              Acceptance Tests
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
