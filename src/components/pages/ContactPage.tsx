import React, { useState } from 'react';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  HeartPulse,
  Building2,
  Calendar
} from 'lucide-react';
import { useRouter } from '../../router/Router';
import { PublicNavbar } from '../layout/PublicNavbar';
import { PublicFooter } from '../layout/PublicFooter';
import { AuthUser } from '../auth/LoginScreen';

interface ContactPageProps {
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ currentUser, onLogout }) => {
  const { navigate } = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('General Medicine');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please provide your name, email, and message inquiry.');
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  const departments = [
    { name: 'Cardiology & Echo Pod', phone: '+1 (555) 234-8901', hours: 'Mon–Fri: 08:30 – 17:00' },
    { name: 'Neurology & Stroke Triage', phone: '+1 (555) 234-8902', hours: 'Mon–Thu: 09:00 – 16:30' },
    { name: 'Endocrinology & Diabetes Lab', phone: '+1 (555) 234-8903', hours: 'Tue–Fri: 08:00 – 16:00' },
    { name: 'Pulmonary Care & Respiratory', phone: '+1 (555) 234-8904', hours: 'Mon, Wed, Fri: 09:00 – 17:00' },
    { name: 'Pediatrics & Family Wellness', phone: '+1 (555) 234-8905', hours: 'Mon–Fri: 08:30 – 16:30' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar currentUser={currentUser} onLogout={onLogout} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Urgent Emergency Disclaimer Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-200">Experiencing a Life-Threatening Emergency?</h3>
              <p className="text-xs text-rose-300/80 mt-0.5">
                If you have chest pain, severe shortness of breath, sudden numbness, or heavy bleeding, dial 911 or head to the nearest Emergency Department immediately.
              </p>
            </div>
          </div>
          <a
            href="tel:911"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shrink-0 transition-colors shadow-md"
          >
            Call 911
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider mb-3">
                <Mail className="w-3.5 h-3.5" />
                <span>Patient Support &amp; Clinical Inquiries</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Get in Touch with Our Clinical Care Team
              </h1>
              <p className="mt-2 text-xs text-slate-300">
                Have questions regarding appointment preparation, telehealth consultations, or records transfer? Fill in your details below and our team will respond within 24 business hours.
              </p>

              {submitted ? (
                <div className="mt-8 p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Inquiry Received</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    Thank you, {name}. Your inquiry has been routed to the {department} clinic team. A triage coordinator will contact you at {email}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                  >
                    Submit Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {error && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Target Department</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                      >
                        <option value="General Medicine">General Medicine</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Endocrinology">Endocrinology</option>
                        <option value="Pulmonology">Pulmonology</option>
                        <option value="Pediatrics">Pediatrics</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Inquiry / Clinical Details *</label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe your consultation request or administrative question..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Clinical Message</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Clinic Information & Hours */}
          <div className="lg:col-span-5 space-y-6">
            {/* Campus Info */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Main Healthcare Facility</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">AI Clinic Medical Center</p>
                    <p className="text-slate-400">742 Evergreen Healthcare Blvd, Building B</p>
                    <p className="text-slate-400">San Francisco Bay Area, CA 94107</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Outpatient Hours</p>
                    <p className="text-slate-400">Monday – Friday: 08:00 – 18:00</p>
                    <p className="text-slate-400">Saturday: 09:00 – 14:00 (Urgent Triage Only)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <PhoneCall className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">Appointments &amp; Help Desk</p>
                    <p className="text-cyan-400 font-mono">+1 (555) 234-8900</p>
                    <p className="text-slate-400">concierge@clinic-health.org</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Extensions */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-cyan-400" />
                <span>Department Direct Lines</span>
              </h3>
              <div className="divide-y divide-slate-800 text-xs">
                {departments.map((dept, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white">{dept.name}</p>
                      <p className="text-[11px] text-slate-400">{dept.hours}</p>
                    </div>
                    <span className="text-cyan-400 font-mono text-[11px] font-bold">{dept.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
