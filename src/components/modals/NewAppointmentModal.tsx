import React, { useState } from 'react';
import { X, Calendar, Clock, User, Stethoscope, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AppointmentRecord, DoctorRecord, PatientRecord } from '../../types/clinic';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Omit<AppointmentRecord, 'id'>) => void;
  doctors: DoctorRecord[];
  patients: PatientRecord[];
  initialPatientId?: string;
  initialDoctorId?: string;
  initialComplaint?: string;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  doctors,
  patients,
  initialPatientId,
  initialDoctorId,
  initialComplaint,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || patients[0]?.id || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(initialDoctorId || doctors[0]?.id || '');

  React.useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId, isOpen]);

  React.useEffect(() => {
    if (initialDoctorId) {
      setSelectedDoctorId(initialDoctorId);
    }
  }, [initialDoctorId, isOpen]);

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('11:30 AM');
  const [type, setType] = useState<AppointmentRecord['type']>('In-Person');
  const [priority, setPriority] = useState<AppointmentRecord['priority']>('Normal');
  const [chiefComplaint, setChiefComplaint] = useState<string>(initialComplaint || '');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === selectedPatientId) || patients[0];
    const doctor = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

    onSave({
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      department: doctor.department,
      date,
      time,
      type,
      status: priority === 'Critical' ? 'Urgent Triage' : 'Scheduled',
      chiefComplaint: chiefComplaint || 'Routine medical follow-up',
      room: doctor.room,
      priority,
      durationMinutes: 30,
      notes: notes || undefined,
      checkedIn: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#0D182E] rounded-2xl shadow-2xl border border-slate-800 text-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B1327]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Schedule Clinical Consultation</h3>
              <p className="text-xs text-slate-400">Assign patient, attending physician, and room queue</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Patient Select */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Select Patient</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#080E1C] border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-100 font-medium"
                required
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#0D182E] text-slate-100">
                    {p.name} ({p.mrn} · {p.age}y)
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor Select */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Attending Physician</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#080E1C] border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-100 font-medium"
                required
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id} className="bg-[#0D182E] text-slate-100">
                    {d.name} ({d.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2 bg-[#080E1C] border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-100 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Time Slot</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="11:30 AM"
                className="w-full text-xs p-2 bg-[#080E1C] border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-100 font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Visit Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full text-xs p-2 bg-[#080E1C] border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-100 font-medium"
              >
                <option value="In-Person" className="bg-[#0D182E]">In-Person</option>
                <option value="Telehealth" className="bg-[#0D182E]">Telehealth</option>
                <option value="Follow-up" className="bg-[#0D182E]">Follow-up</option>
                <option value="Emergency" className="bg-[#0D182E]">Emergency</option>
                <option value="Lab Review" className="bg-[#0D182E]">Lab Review</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Acuity Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs p-2 bg-[#080E1C] border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-100 font-medium"
              >
                <option value="Routine" className="bg-[#0D182E]">Routine</option>
                <option value="Normal" className="bg-[#0D182E]">Normal</option>
                <option value="High" className="bg-[#0D182E]">High</option>
                <option value="Critical" className="bg-[#0D182E]">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Chief Complaint &amp; Symptoms</label>
            <input
              type="text"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g., Shortness of breath, elevated blood pressure, post-op review"
              className="w-full text-xs p-2.5 bg-[#080E1C] border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-100 placeholder:text-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Clinical Notes (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Allergies, prior tests, special nurse intake notes..."
              className="w-full text-xs p-2 bg-[#080E1C] border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-xl shadow-md shadow-cyan-600/25 transition-all"
            >
              Confirm Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
