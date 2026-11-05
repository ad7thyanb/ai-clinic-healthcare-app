import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  Phone, 
  Mail, 
  AlertTriangle,
  HeartPulse
} from 'lucide-react';
import { useRouter } from '../../router/Router';
import { PublicNavbar } from '../layout/PublicNavbar';
import { PublicFooter } from '../layout/PublicFooter';
import { DoctorRecord, PatientRecord } from '../../types/clinic';
import { fetchDoctors, addAppointment } from '../../api/clinicApi';
import { AuthUser } from '../auth/LoginScreen';

interface DoctorDetailsPageProps {
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  patients: PatientRecord[];
  onAppointmentBooked?: (msg: string) => void;
}

export const DoctorDetailsPage: React.FC<DoctorDetailsPageProps> = ({
  currentUser,
  onLogout,
  patients,
  onAppointmentBooked,
}) => {
  const { currentPath, navigate, matchRoute } = useRouter();
  const routeParams = matchRoute('/doctors/:id');
  const doctorId = routeParams?.id;

  const [doctor, setDoctor] = useState<DoctorRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('09:30');
  const [complaint, setComplaint] = useState('');
  const [patientName, setPatientName] = useState(currentUser?.name || '');
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchDoctors();
        const found = list.find((d) => d.id === doctorId);
        setDoctor(found || list[0] || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [doctorId]);

  const availableSlots = [
    '08:30', '09:00', '09:30', '10:00', '10:30', '11:00',
    '13:00', '13:30', '14:00', '14:30', '15:00', '16:00'
  ];

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;
    setBookingError(null);
    setBookingSuccess(null);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('ai_clinic_token');
      // Call server endpoint directly to test double-booking prevention & persistent storage
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          patientId: currentUser?.patientId || 'PT-10492',
          patientName: patientName || currentUser?.name || 'Eleanor Vance',
          doctorId: doctor.id,
          doctorName: doctor.name,
          department: doctor.department,
          date: selectedDate,
          time: selectedTime,
          type: 'In-Person',
          chiefComplaint: complaint || 'General Consultation',
          priority: 'Normal',
          room: doctor.room,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setBookingError(data.error || 'Failed to book appointment.');
      } else {
        setBookingSuccess(`Appointment booked successfully with ${doctor.name} for ${selectedDate} at ${selectedTime}!`);
        if (onAppointmentBooked) {
          onAppointmentBooked(`Booked with ${doctor.name}`);
        }
      }
    } catch (err: any) {
      setBookingError(err.message || 'Network error occurred while booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading doctor profile...
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <p>Physician profile not found.</p>
        <button
          type="button"
          onClick={() => navigate('/doctors')}
          className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold"
        >
          Return to Doctors Directory
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar currentUser={currentUser} onLogout={onLogout} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/doctors')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Physician Directory</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Doctor Profile (Left Column) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-800">
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${doctor.avatarGradient || 'from-cyan-500 to-blue-600'} flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shrink-0`}>
                  {doctor.name.split(' ')[1]?.[0] || 'D'}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      {doctor.department}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{doctor.rating || 4.95} Rating</span>
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{doctor.name}</h1>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">{doctor.title || doctor.specialty}</p>
                </div>
              </div>

              {/* Bio & Clinical Overview */}
              <div className="py-6 border-b border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Clinical Biography &amp; Practice</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {doctor.bio || 'Dr. Chen specializes in acute cardiovascular decompensation, predictive telemetry monitoring, and minimally invasive coronary intervention. Serving as clinical director, she oversees triage protocols and patient care continuity across outpatient cardiology suites.'}
                </p>
              </div>

              {/* Credentials & Qualifications */}
              <div className="py-6 border-b border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Education &amp; Board Certifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(doctor.qualifications || ['MD (Harvard Medical School)', 'FACC Board Certified', 'Fellowship at Cleveland Clinic']).map((q: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-slate-200">{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinic Bay & Hours */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-semibold text-white">Clinical Exam Bay</span>
                  </div>
                  <p className="text-slate-300">{doctor.room || 'Bay 4A — Echo Suite'}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-semibold text-white">Consultation Hours</span>
                  </div>
                  <p className="text-slate-300">
                    {doctor.workingHours ? `${doctor.workingHours.start} – ${doctor.workingHours.end}` : '08:30 – 17:00'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Panel (Right Column) */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white">Book Consultation Slot</h3>
                  <p className="text-xs text-slate-400">Direct electronic booking</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Consultation Fee</span>
                  <div className="text-lg font-extrabold text-cyan-400">${doctor.consultationFee || 180}</div>
                </div>
              </div>

              {bookingSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 mb-5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Booking Confirmed</p>
                    <p className="mt-0.5 leading-relaxed">{bookingSuccess}</p>
                  </div>
                </div>
              )}

              {bookingError && (
                <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 mb-5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Slot Unavailable / Error</p>
                    <p className="mt-0.5 leading-relaxed">{bookingError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleBook} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Select Consultation Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">Available Time Slots</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${
                          selectedTime === slot
                            ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                            : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Chief Medical Complaint / Symptoms</label>
                  <textarea
                    rows={3}
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="Describe symptoms or reasons for visit..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition-all disabled:opacity-50"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{isSubmitting ? 'Confirming with EHR...' : 'Confirm Appointment Slot'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
