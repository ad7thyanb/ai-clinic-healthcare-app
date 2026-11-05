import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2, HeartPulse, ArrowLeft } from 'lucide-react';
import { useRouter } from '../../router/Router';
import { PublicNavbar } from '../layout/PublicNavbar';
import { PublicFooter } from '../layout/PublicFooter';

export const PrivacyPolicyPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </button>

        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8">
          <div className="border-b border-slate-800 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HIPAA Compliance &amp; Patient Privacy</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Clinical Privacy Policy &amp; Notice of Privacy Practices
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              Effective Date: October 2026 &bull; Compliant with Health Insurance Portability and Accountability Act (HIPAA) &amp; HL7 Security Standards
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>1. Our Commitment to Patient Health Data</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              AI Clinic Management System is committed to safeguarding your Protected Health Information (PHI). We collect, maintain, and transmit electronic medical records solely for diagnostic evaluation, clinical treatment, scheduling, quality assurance, and authorized health analytics.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>2. Categories of Health Information Collected</span>
            </h2>
            <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
              <li><strong className="text-white">Demographic &amp; Contact:</strong> Full legal name, date of birth, emergency contact phone, home address, and MRN.</li>
              <li><strong className="text-white">Clinical &amp; Diagnostic Records:</strong> ICD-10 medical diagnoses, allergy profiles, vital sign telemetry, and consultation progress notes.</li>
              <li><strong className="text-white">Prescriptions &amp; Orders:</strong> Pharmacological orders, medication dosages, duration, and clinical dispensing instructions.</li>
              <li><strong className="text-white">Operational Telemetry:</strong> Appointment timestamps, waiting queue dwell intervals, and physician check-in telemetry.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>3. Server-Side Security &amp; Activity Audit Ledger</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              All communications are encrypted in transit via Transport Layer Security (TLS 1.3) and at rest utilizing AES-256 block encryption. Access to medical documentation is governed by strict Role-Based Access Control (RBAC). Furthermore, every login, consultation document finalization, and record release is permanently recorded in our tamper-resistant activity audit history ledger.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>4. Patient Rights Under HIPAA</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              As an outpatient patient, you have the right to inspect and receive an electronic copy of your released clinical consultation notes and prescriptions through our authenticated Patient Portal, request accounting of disclosures, and request record amendments.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Privacy Officer: privacy@clinic-health.org</span>
            <button
              type="button"
              onClick={() => navigate('/terms')}
              className="text-cyan-400 hover:underline font-semibold"
            >
              View Terms of Service &rarr;
            </button>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
