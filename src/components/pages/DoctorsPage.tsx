import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Stethoscope, 
  Star, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Filter, 
  Building2,
  CheckCircle2
} from 'lucide-react';
import { useRouter } from '../../router/Router';
import { PublicNavbar } from '../layout/PublicNavbar';
import { PublicFooter } from '../layout/PublicFooter';
import { DoctorRecord } from '../../types/clinic';
import { fetchDoctors } from '../../api/clinicApi';
import { AuthUser } from '../auth/LoginScreen';

interface DoctorsPageProps {
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onBookAppointmentWithDoctor?: (doctorId: string) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({
  currentUser,
  onLogout,
  onBookAppointmentWithDoctor,
}) => {
  const { navigate } = useRouter();
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchDoctors();
        setDoctors(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const departments = React.useMemo(() => {
    const set = new Set<string>();
    doctors.forEach((d) => {
      if (d.department && typeof d.department === 'string' && d.department.trim()) {
        set.add(d.department.trim());
      }
    });
    const dynamicList = Array.from(set).sort();
    return ['All', ...(dynamicList.length > 0 ? dynamicList : ['Cardiology', 'Neurology', 'Endocrinology', 'Pulmonology', 'Pediatrics'])];
  }, [doctors]);

  const filteredDoctors = doctors.filter((doc) => {
    const docDept = (doc.department || '').toLowerCase();
    const docName = (doc.name || '').toLowerCase();
    const docSpecialty = (doc.specialty || '').toLowerCase();
    const matchesDept = selectedDept === 'All' || docDept === selectedDept.toLowerCase();
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      docName.includes(q) ||
      docSpecialty.includes(q) ||
      docDept.includes(q);
    return matchesDept && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar currentUser={currentUser} onLogout={onLogout} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider mb-3">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clinical Medical Staff</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Our Specialist Physicians &amp; Care Directors
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Board-certified healthcare clinicians delivering predictive triage, evidence-based therapies, and continuous outpatient consultations.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search physician or specialty..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Department Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedDept === dept
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <div className="p-16 text-center text-slate-400">Loading physician profiles...</div>
        ) : filteredDoctors.length === 0 ? (
          <div className="p-16 text-center text-slate-400 rounded-3xl bg-slate-900 border border-slate-800">
            No physicians matching your filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl p-6 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${doc.avatarGradient || 'from-cyan-500 to-blue-600'} flex items-center justify-center text-white font-bold text-base shadow-md`}>
                        {(doc.name || 'Doctor').replace(/^Dr\.?\s+/i, '').split(' ')[0]?.[0] || doc.name?.[0] || 'D'}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {doc.name}
                        </h3>
                        <p className="text-xs text-cyan-400 font-medium">{doc.specialty}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{doc.rating || 4.9}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 mb-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{doc.department} — {doc.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Available: {doc.availableDays?.join(', ') || 'Mon–Fri'}</span>
                    </div>
                  </div>

                  {doc.qualifications && doc.qualifications.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {doc.qualifications.slice(0, 2).map((q: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                          {q}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/doctors/${doc.id}`)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onBookAppointmentWithDoctor) {
                        onBookAppointmentWithDoctor(doc.id);
                      } else {
                        navigate(`/doctors/${doc.id}`);
                      }
                    }}
                    className="py-2.5 px-3.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all"
                    title="Book Consultation"
                  >
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};
