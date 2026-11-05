import React from 'react';
import { FileText, AlertTriangle, CheckCircle2, ShieldCheck, HeartPulse, ArrowLeft } from 'lucide-react';
import { useRouter } from '../../router/Router';
import { PublicNavbar } from '../layout/PublicNavbar';
import { PublicFooter } from '../layout/PublicFooter';

export const TermsOfServicePage: React.FC = () => {
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
              <FileText className="w-3.5 h-3.5" />
              <span>Legal Agreement &amp; Medical Disclaimer</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Terms of Clinical Service &amp; Telehealth Agreement
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              Last Updated: October 2026 &bull; Governing Outpatient Booking, EHR Access, and Telehealth Interactions
            </p>
          </div>

          {/* Life Threatening Emergency Warning */}
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-rose-200">Critical Medical Emergency Disclaimer</h3>
              <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">
                The AI Clinic web portal is not an emergency response provider. If you are experiencing acute coronary symptoms, severe respiratory distress, suspected stroke, traumatic injuries, or thoughts of self-harm, immediately dial 911 or report to the nearest hospital emergency room. Do not rely on web scheduling for urgent trauma care.
              </p>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">1. Acceptance of Terms</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              By accessing the AI Clinic portal, creating a patient or clinician account, or scheduling an appointment, you acknowledge and agree to be bound by these Terms of Clinical Service and our Privacy Practices.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">2. Appointment Scheduling &amp; Cancellation Policy</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our scheduling engine actively prevents physician double booking. Confirmed slots allocate clinical exam bays and dedicated medical personnel. If you must reschedule or cancel your consultation, please submit your request at least 2 hours prior to your scheduled time via the Patient Portal to allow triage coordinators to offer the bay to awaiting patients.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">3. Role-Based Account Responsibilities</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Users are strictly responsible for maintaining the confidentiality of their authentication credentials. Patient accounts may not attempt unauthorized access to physician triage queues or administrative settings. Physician registrations require administrative approval before clinical privileges are granted.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white">4. Electronic Health Records &amp; Document Release</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Physicians create consultation notes and prescriptions initially as clinical drafts. Once finalized with an immutable electronic lock and released by the attending care team, records become available in the patient&apos;s personal Medical Records archive.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Governance Counsel: legal@clinic-health.org</span>
            <button
              type="button"
              onClick={() => navigate('/privacy')}
              className="text-cyan-400 hover:underline font-semibold"
            >
              View Privacy Policy &rarr;
            </button>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
