import React, { useState } from 'react';
import { X, UserPlus, Heart, Stethoscope, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PatientRecord, DoctorRecord } from '../../types/clinic';

interface RegisterPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Omit<PatientRecord, 'id' | 'mrn'>) => void;
  doctors: DoctorRecord[];
}

export const RegisterPatientModal: React.FC<RegisterPatientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  doctors,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState(45);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [phone, setPhone] = useState('+1 (555) 789-0123');
  const [email, setEmail] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [department, setDepartment] = useState('Cardiology');
  const [assignedDoctor, setAssignedDoctor] = useState(doctors[0]?.name || 'Dr. Sarah Chen, MD');
  const [triageStatus, setTriageStatus] = useState<PatientRecord['triageStatus']>('Normal');
  const [bp, setBp] = useState('120/80');
  const [hr, setHr] = useState(72);
  const [spo2, setSpo2] = useState(98);
  const [glucose, setGlucose] = useState(105);
  const [temp, setTemp] = useState(98.6);
  const [allergiesText, setAllergiesText] = useState('NKDA');
  const [medicationsText, setMedicationsText] = useState('');
  const [insurance, setInsurance] = useState('Blue Cross Blue Shield');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !primaryDiagnosis.trim()) return;

    const gradients = [
      'from-blue-600 to-cyan-500',
      'from-cyan-500 to-teal-400',
      'from-purple-600 to-indigo-500',
      'from-indigo-600 to-purple-500',
      'from-pink-500 to-rose-400',
      'from-teal-500 to-emerald-400',
    ];
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

    onSave({
      name,
      age: Number(age),
      gender,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      bloodType,
      primaryDiagnosis,
      assignedDoctor,
      department,
      lastVisit: '2026-10-07',
      triageStatus,
      vitals: {
        bp,
        hr: Number(hr),
        spo2: Number(spo2),
        temp: Number(temp),
        glucose: Number(glucose),
      },
      allergies: allergiesText.split(',').map(s => s.trim()).filter(Boolean),
      medications: medicationsText ? medicationsText.split(',').map(s => s.trim()).filter(Boolean) : ['None recorded'],
      insurance,
      medicalHistory: [primaryDiagnosis],
      avatarGradient: randomGradient,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#0D182E] rounded-2xl shadow-2xl border border-slate-800 text-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B1327]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Register New Patient</h3>
              <p className="text-xs text-slate-400">Create electronic health record &amp; baseline vitals</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Jennifer Alvarez"
                className="w-full p-2 bg-[#080E1C] border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Age</label>
              <input
                type="number"
                required
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full p-2 bg-[#080E1C] border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full p-2 bg-[#080E1C] border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-100"
              >
                <option value="Female" className="bg-[#0D182E]">Female</option>
                <option value="Male" className="bg-[#0D182E]">Male</option>
                <option value="Other" className="bg-[#0D182E]">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Blood Type</label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full p-2 bg-[#080E1C] border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-100 font-mono"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                  <option key={b} value={b} className="bg-[#0D182E]">{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2 bg-[#080E1C] border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-100"
              >
                <option value="Cardiology" className="bg-[#0D182E]">Cardiology</option>
                <option value="Pulmonology" className="bg-[#0D182E]">Pulmonology</option>
                <option value="Neurology" className="bg-[#0D182E]">Neurology</option>
                <option value="Orthopedics" className="bg-[#0D182E]">Orthopedics</option>
                <option value="Pediatrics" className="bg-[#0D182E]">Pediatrics</option>
                <option value="Nephrology" className="bg-[#0D182E]">Nephrology</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Triage Priority</label>
              <select
                value={triageStatus}
                onChange={(e) => setTriageStatus(e.target.value as any)}
                className="w-full p-2 bg-[#080E1C] border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-100"
              >
                <option value="Normal" className="bg-[#0D182E]">Normal</option>
                <option value="Moderate" className="bg-[#0D182E]">Moderate</option>
                <option value="Urgent" className="bg-[#0D182E]">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Primary Diagnosis</label>
              <input
                type="text"
                required
                value={primaryDiagnosis}
                onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                placeholder="e.g., Unspecified Atrial Fibrillation"
                className="w-full p-2 bg-[#080E1C] border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Assigned Physician</label>
              <select
                value={assignedDoctor}
                onChange={(e) => setAssignedDoctor(e.target.value)}
                className="w-full p-2 bg-[#080E1C] border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-100"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.name} className="bg-[#0D182E]">{d.name} ({d.department})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Vitals */}
          <div className="p-3 bg-[#080E1C] rounded-xl border border-slate-800">
            <span className="block font-bold text-slate-200 mb-2">Baseline Intake Vitals</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold">BP (mmHg)</label>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full p-1.5 bg-[#0D182E] border border-slate-700/80 text-cyan-300 rounded-lg font-mono text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-semibold">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(Number(e.target.value))}
                  className="w-full p-1.5 bg-[#0D182E] border border-slate-700/80 text-white rounded-lg font-mono text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-semibold">SpO2 (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className="w-full p-1.5 bg-[#0D182E] border border-slate-700/80 text-emerald-400 rounded-lg font-mono text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-semibold">Glucose (mg/dL)</label>
                <input
                  type="number"
                  value={glucose}
                  onChange={(e) => setGlucose(Number(e.target.value))}
                  className="w-full p-1.5 bg-[#0D182E] border border-slate-700/80 text-amber-400 rounded-lg font-mono text-center"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-semibold">Temp (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full p-1.5 bg-[#0D182E] border border-slate-700/80 text-white rounded-lg font-mono text-center"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Drug Allergies (Comma separated)</label>
              <input
                type="text"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="Penicillin, Sulfa drugs, or NKDA"
                className="w-full p-2 bg-[#080E1C] border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-100 placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Active Prescriptions (Comma separated)</label>
              <input
                type="text"
                value={medicationsText}
                onChange={(e) => setMedicationsText(e.target.value)}
                placeholder="Lisinopril 10mg, Metformin 500mg"
                className="w-full p-2 bg-[#080E1C] border border-slate-700/80 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-100 placeholder:text-slate-500"
              />
            </div>
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
              Save EHR Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
