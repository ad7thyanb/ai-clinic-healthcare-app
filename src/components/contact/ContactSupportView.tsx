import React, { useState } from 'react';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Headphones, 
  ShieldCheck, 
  Building2, 
  HelpCircle,
  FileCheck,
  Sparkles
} from 'lucide-react';

export const ContactSupportView: React.FC = () => {
  const [formData, setFormData] = useState({
    name: 'Clinical Staff Member',
    email: 'support@aura-health.org',
    inquiryType: 'Clinical Operations Support',
    priority: 'Normal',
    subject: '',
    message: '',
  });

  const [submittedTicket, setSubmittedTicket] = useState<{ id: string; time: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) return;

    const ticketId = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;
    setSubmittedTicket({
      id: ticketId,
      time: 'Just now'
    });

    setFormData(prev => ({
      ...prev,
      subject: '',
      message: ''
    }));
  };

  const emergencyContacts = [
    {
      title: '24/7 Rapid Response Desk',
      number: '+1 (800) 555-0199',
      extension: 'Ext. 9110',
      badge: 'Immediate',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      desc: 'Critical bedside telemetry alerts, code emergencies, and ambulance intake.',
    },
    {
      title: 'Attending CMO & Clinical Director',
      number: '+1 (800) 555-0144',
      extension: 'Ext. 4022',
      badge: 'Provider Only',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      desc: 'Physician-to-physician consults, ICU bed approvals, and surgical escalations.',
    },
    {
      title: 'Patient Admissions & Transfer',
      number: '+1 (800) 555-0182',
      extension: 'Ext. 4088',
      badge: 'Admissions',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      desc: 'Hospital-wide patient census, urgent transfers, and room allocations.',
    },
    {
      title: 'Pharmacovigilance & Stat Meds',
      number: '+1 (800) 555-0165',
      extension: 'Ext. 4015',
      badge: 'Pharmacy',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      desc: 'Stat formulary dispensation, drug interaction checks, and infusion therapy.',
    },
  ];

  const departmentDirectory = [
    { name: 'Cardiology Clinic', location: 'Wing A, Level 3', phone: 'Ext. 301', chief: 'Dr. Sarah Chen' },
    { name: 'Neurology Department', location: 'Wing B, Level 4', phone: 'Ext. 402', chief: 'Dr. Marcus Vance' },
    { name: 'Pulmonology & Respiratory', location: 'Wing A, Level 2', phone: 'Ext. 204', chief: 'Dr. Elena Rostova' },
    { name: 'Orthopedic Surgery', location: 'Wing C, Level 1', phone: 'Ext. 108', chief: 'Dr. David Kim' },
    { name: 'Pediatric Care Unit', location: 'Wing D, Level 2', phone: 'Ext. 210', chief: 'Dr. Maya Lin' },
    { name: 'Nephrology & Dialysis', location: 'Wing B, Level 1', phone: 'Ext. 115', chief: 'Dr. Rachel Greenwald' },
    { name: 'Radiology & MRI Suite', location: 'Sub-level 1', phone: 'Ext. 090', chief: 'Dr. Arthur Pendelton' },
    { name: 'Clinical Pathology Lab', location: 'Sub-level 2', phone: 'Ext. 085', chief: 'Dr. Miriam O’Connor' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Contact Us &amp; Clinical Support
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              24/7 Operations Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Emergency medical hotline, departmental directory, institutional campus guide, and clinical IT support.
          </p>
        </div>
      </div>

      {/* Emergency Hotlines Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {emergencyContacts.map((contact, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#0D182E] border border-slate-800 hover:border-cyan-500/40 shadow-md hover:shadow-cyan-500/10 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${contact.badgeColor}`}>
                  {contact.badge}
                </span>
                <span className="text-xs font-bold text-slate-400 font-mono">
                  {contact.extension}
                </span>
              </div>
              <h3 className="font-bold text-white text-sm mb-1 leading-snug group-hover:text-cyan-300 transition-colors">
                {contact.title}
              </h3>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                {contact.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <a
                href={`tel:${contact.number}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{contact.number}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Main Two-Column Layout: Form & Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Support Ticket Submission Form */}
        <div className="lg:col-span-7 bg-[#0D182E] p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Submit Clinical Support Ticket
                </h3>
                <p className="text-xs text-slate-400">
                  Direct dispatch to healthcare informatics, biomedical engineering, and clinic coordination.
                </p>
              </div>
            </div>

            {submittedTicket && (
              <div className="mb-4 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-3 animate-in fade-in duration-200 shadow-md">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-white">Support Ticket Created ({submittedTicket.id})</span>
                  Our clinical response team has received your ticket. Average response time is under 12 minutes.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-[#0A0F1D] border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:bg-[#0E1528] focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-3.5 py-2 bg-[#0A0F1D] border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:bg-[#0E1528] focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Inquiry Category
                  </label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#0A0F1D] border border-slate-800 rounded-xl text-slate-100 focus:bg-[#0E1528] focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Clinical Operations Support">Clinical Operations Support</option>
                    <option value="EHR & Informatics Assistance">EHR &amp; Informatics Assistance</option>
                    <option value="Bed Capacity & Triage Question">Bed Capacity &amp; Triage Question</option>
                    <option value="Medical Device / Telemetry Issue">Medical Device / Telemetry Issue</option>
                    <option value="Pharmacy & Lab Coordination">Pharmacy &amp; Lab Coordination</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Triage Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#0A0F1D] border border-slate-800 rounded-xl text-slate-100 focus:bg-[#0E1528] focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Normal">Routine (Normal)</option>
                    <option value="High">Elevated (High)</option>
                    <option value="Critical">Critical (Immediate Response)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="Brief summary of inquiry..."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 bg-[#0A0F1D] border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:bg-[#0E1528] focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Clinical Details / Message
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide relevant patient MRN, clinic room, or system details..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 bg-[#0A0F1D] border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:bg-[#0E1528] focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Ticket to Support Desk</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Department Extension Directory & Campus Info */}
        <div className="lg:col-span-5 space-y-4">
          {/* Campus Location Card */}
          <div className="p-5 rounded-3xl bg-[#0D182E] border border-slate-800 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <h3 className="font-bold text-white text-sm">
                AI Clinic Regional Medical Pavilion
              </h3>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p>742 Evergreen Medical Blvd, Suite 400</p>
              <p>Metropolitan Health Sciences Complex</p>
              <div className="flex items-center gap-1.5 text-slate-400 pt-2 border-t border-slate-800">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Inpatient &amp; ER: 24/7/365 • Outpatient: 07:00 - 20:00</span>
              </div>
            </div>
          </div>

          {/* Department Quick Dial Directory */}
          <div className="p-5 rounded-3xl bg-[#0D182E] border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <h3 className="font-bold text-white text-sm">
                  Clinical Extensions Directory
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#111C35] text-cyan-300 border border-slate-700">
                Internal Dial
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {departmentDirectory.map((dept, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-[#0A0F1D] border border-slate-800 flex items-center justify-between text-xs hover:bg-[#111C35] transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-slate-200 block truncate">{dept.name}</span>
                    <span className="text-[10px] text-slate-400 block">{dept.location} • {dept.chief}</span>
                  </div>
                  <span className="font-mono text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 shrink-0">
                    {dept.phone}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
