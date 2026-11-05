import React, { useState } from 'react';
import { 
  HeartPulse, 
  Stethoscope, 
  Activity, 
  Brain, 
  Baby, 
  Bone, 
  ShieldCheck, 
  CalendarClock, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  PhoneCall, 
  Eye, 
  Pill, 
  FileText,
  Search,
  Building,
  Star
} from 'lucide-react';
import { useRouter } from '../../router/Router';
import { PublicNavbar } from '../layout/PublicNavbar';
import { PublicFooter } from '../layout/PublicFooter';
import { AuthUser } from '../auth/LoginScreen';

interface ServicesPageProps {
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onOpenBookAppointment?: (department?: string) => void;
}

interface ClinicalService {
  id: string;
  name: string;
  department: string;
  icon: React.ComponentType<{ className?: string }>;
  leadPhysician: string;
  description: string;
  keyTreatments: string[];
  equipment: string;
  telehealthEligible: boolean;
  waitTimes: string;
  color: string;
}

const CLINICAL_SERVICES: ClinicalService[] = [
  {
    id: 'cardiology',
    name: 'Advanced Cardiovascular Medicine',
    department: 'Cardiology',
    icon: HeartPulse,
    leadPhysician: 'Dr. Sarah Chen, MD (Chief of Cardiology)',
    description: 'Comprehensive preventative, diagnostic, and interventional cardiology with continuous telemetry monitoring and echocardiography.',
    keyTreatments: ['Echocardiogram & Doppler Flow', 'Telemetry Rhythm Management', 'Hypertension & Lipid Optimization', 'Post-MI Rehabilitation Protocol'],
    equipment: 'GE Vivid E95 Echo, Philips CX50 Telemetry Units',
    telehealthEligible: true,
    waitTimes: '< 15 mins for scheduled visits',
    color: 'from-rose-500 to-red-600',
  },
  {
    id: 'neurology',
    name: 'Clinical Neurology & Neuro-Diagnostics',
    department: 'Neurology',
    icon: Brain,
    leadPhysician: 'Dr. Marcus Vance, MD (Attending Neurologist)',
    description: 'Expert neurological assessment for acute headaches, seizure disorders, neuropathy, neurovascular monitoring, and cognitive wellness.',
    keyTreatments: ['EEG Brain Wave Mapping', 'Nerve Conduction Studies', 'Migraine Therapeutic Protocols', 'Stroke Prevention Consultations'],
    equipment: 'Nihon Kohden Digital EEG & Cadwell EMG Suite',
    telehealthEligible: true,
    waitTimes: '< 20 mins for scheduled visits',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics & Adolescent Medicine',
    department: 'Pediatrics',
    icon: Baby,
    leadPhysician: 'Dr. Alex Patel, MD (Pediatric Specialist)',
    description: 'Compassionate pediatric healthcare spanning newborn evaluations, immunization schedules, developmental milestones, and acute pediatric care.',
    keyTreatments: ['Well-Child Developmental Checkups', 'CDC Pediatric Immunizations', 'Childhood Asthma Management', 'Pediatric Infection Triage'],
    equipment: 'Child-friendly examination rooms with non-invasive vitals',
    telehealthEligible: true,
    waitTimes: '< 10 mins priority child queue',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'orthopedics',
    name: 'Orthopedic Surgery & Sports Medicine',
    department: 'Orthopedics',
    icon: Bone,
    leadPhysician: 'Dr. Jonathan Reynolds, MD (Orthopedic Consultant)',
    description: 'State-of-the-art musculoskeletal care for joint pain, fracture management, sports injuries, and conservative arthritis therapy.',
    keyTreatments: ['Digital Musculoskeletal Fluoroscopy', 'Targeted Joint Injections', 'Casting & Splint Immobilization', 'Pre- and Post-Surgical Rehabilitation'],
    equipment: 'Hologic Digital Fluoroscopy & C-Arm Radiology',
    telehealthEligible: false,
    waitTimes: '< 20 mins for scheduled visits',
    color: 'from-teal-500 to-emerald-600',
  },
  {
    id: 'emergency',
    name: '24/7 Acute Triage & Urgent Walk-In Care',
    department: 'Emergency & Urgent Care',
    icon: Activity,
    leadPhysician: 'Dr. Elena Rostova, MD (Emergency Medicine Director)',
    description: 'Immediate stabilization and rapid diagnostic evaluation for acute chest pain, high fevers, lacerations, and urgent medical decompensation.',
    keyTreatments: ['Rapid Cardiac Biomarker Troponin Assay', 'Wound Debridement & Suturing', 'IV Hydration & Electrolyte Infusion', 'Emergency Stabilization'],
    equipment: 'Abbott i-STAT Blood Gas, Point-of-Care Ultrasound (POCUS)',
    telehealthEligible: false,
    waitTimes: 'Immediate triage assessment upon arrival',
    color: 'from-rose-600 to-orange-600',
  },
  {
    id: 'diagnostics',
    name: 'Clinical Diagnostics & Laboratory Pathology',
    department: 'Diagnostics',
    icon: Stethoscope,
    leadPhysician: 'Dr. Michael Chang, MD (Pathology Lead)',
    description: 'On-site CLIA-certified pathology lab delivering rapid turnaround on routine metabolic panels, complete blood counts, and infectious assays.',
    keyTreatments: ['Comprehensive Metabolic Panel (CMP)', 'Lipid & Thyroid Functional Panels', 'Digital Chest & Extremity X-Ray', 'Microbiology & PCR Cultures'],
    equipment: 'Roche Cobas 6000 & Siemens Healthineers X-Ray',
    telehealthEligible: false,
    waitTimes: 'Results returned within 30–60 minutes',
    color: 'from-cyan-500 to-blue-600',
  },
];

export const ServicesPage: React.FC<ServicesPageProps> = ({
  currentUser,
  onLogout,
  onOpenBookAppointment,
}) => {
  const { navigate } = useRouter();
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredServices = CLINICAL_SERVICES.filter((svc) => {
    const matchesDept = selectedDept === 'all' || svc.department === selectedDept;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q ||
      svc.name.toLowerCase().includes(q) ||
      svc.department.toLowerCase().includes(q) ||
      svc.description.toLowerCase().includes(q) ||
      svc.keyTreatments.some(t => t.toLowerCase().includes(q));

    return matchesDept && matchesQuery;
  });

  const handleBook = (departmentName?: string) => {
    if (currentUser) {
      if (currentUser.role === 'patient') {
        navigate('/dashboard/patient');
      } else if (currentUser.role === 'doctor') {
        navigate('/dashboard/doctor');
      } else {
        navigate('/dashboard/staff');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      <PublicNavbar currentUser={currentUser} onLogout={onLogout} />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-teal-900 via-teal-800 to-slate-900 text-white py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hospital Services &amp; Specialties</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Integrated Clinical Services &amp; Specialized Care
          </h1>

          <p className="text-sm sm:text-base text-teal-100/90 max-w-2xl mx-auto leading-relaxed">
            From routine preventative screenings to 24/7 urgent triage and specialized surgical consultations, our interdisciplinary teams provide compassionate, data-driven medicine.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleBook()}
              className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2 active:scale-95"
            >
              <CalendarClock className="w-4 h-4" />
              <span>Schedule a Consultation</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/doctors')}
              className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center gap-2 backdrop-blur-xs"
            >
              <Stethoscope className="w-4 h-4" />
              <span>View Attending Physicians</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Search & Department Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Emergency & Urgent Care', 'Diagnostics'].map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedDept === dept
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dept === 'all' ? 'All Specialties' : dept}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px] sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search treatments or equipment..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            />
          </div>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((svc) => {
            const Icon = svc.icon;
            return (
              <div 
                key={svc.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md hover:border-teal-200 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    {svc.telehealthEligible && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Telehealth Ready
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                      {svc.department}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors mt-0.5">
                      {svc.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {svc.description}
                    </p>
                  </div>

                  {/* Key Treatments */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-700">Core Procedures &amp; Care:</div>
                    <ul className="space-y-1">
                      {svc.keyTreatments.map((t, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Operational Detail */}
                  <div className="p-3 bg-slate-50 rounded-2xl text-[11px] space-y-1 text-slate-600 border border-slate-100">
                    <div><strong>Lead:</strong> {svc.leadPhysician}</div>
                    <div><strong>Technology:</strong> {svc.equipment}</div>
                    <div className="flex items-center gap-1 text-teal-800 font-semibold pt-0.5">
                      <Clock className="w-3 h-3 text-teal-600" />
                      <span>{svc.waitTimes}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleBook(svc.department)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-teal-700 text-white transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Book {svc.department} Visit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Insurance & Care Guarantee Banner */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>Insurance Coverage &amp; Direct Care Access</span>
              </h3>
              <p className="text-xs text-slate-500 max-w-2xl">
                We accept all major commercial insurance plans, Medicare, Medicaid, and provide transparent self-pay rates for uninsured patients. Telehealth visits are billed at parity with standard clinic encounters.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors whitespace-nowrap self-start sm:self-center"
            >
              Verify Your Coverage
            </button>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};
