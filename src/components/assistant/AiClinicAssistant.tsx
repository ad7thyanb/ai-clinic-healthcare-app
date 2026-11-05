import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  HeartPulse, 
  Send, 
  Minus, 
  X, 
  Calendar, 
  Clock, 
  FileText, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  Stethoscope, 
  Bot, 
  User, 
  RefreshCw,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { PatientRecord, AppointmentRecord, DoctorRecord } from '../../types/clinic';

export interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  actions?: { label: string; onClick: () => void }[];
}

interface AiClinicAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: PatientRecord | null;
  appointments?: AppointmentRecord[];
  doctors?: DoctorRecord[];
  onOpenBookAppointment?: (doctorId?: string, complaint?: string) => void;
}

const SUGGESTED_QUESTIONS = [
  "What is my next appointment?",
  "How can I book an appointment?",
  "Show my appointment history",
  "When is my follow-up?",
  "Explain my health record"
];

export const AiClinicAssistant: React.FC<AiClinicAssistantProps> = ({
  isOpen,
  onClose,
  patient,
  appointments = [],
  doctors = [],
  onOpenBookAppointment,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello ${patient ? patient.name.split(' ')[0] : 'there'}! I am your AI Clinic Healthcare Assistant. How can I assist you with your consultations, vital signs, or care plan today?`,
      timestamp: 'Just now',
    }
  ]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  // Generate realistic clinical response based on prompt and patient context
  const generateMockResponse = (userText: string): { text: string; actions?: { label: string; onClick: () => void }[] } => {
    const textLower = userText.toLowerCase().trim();

    // 1. Next appointment
    if (textLower.includes('next appointment') || textLower.includes('upcoming appointment')) {
      const patientAppointments = appointments.filter(
        a => patient && (a.patientId === patient.id || a.patientName.toLowerCase() === patient.name.toLowerCase())
      );
      const upcoming = patientAppointments.find(a => a.status === 'Scheduled' || a.status === 'In Progress' || a.status === 'Urgent Triage');

      if (upcoming) {
        return {
          text: `Your next scheduled visit is on **${upcoming.date || 'Today'}** at **${upcoming.time}** with **${upcoming.doctorName}** in **${upcoming.room}** (${upcoming.department}). Chief complaint noted: *"${upcoming.chiefComplaint}"*.\n\nPlease arrive 10 minutes prior for blood pressure intake check-in.`,
          actions: [
            {
              label: 'View Consultation',
              onClick: () => {}
            }
          ]
        };
      }

      return {
        text: `Your current care plan lists a follow-up appointment: **${patient?.nextAppointment || 'Today, 10:30 AM'}** with **${patient?.assignedDoctor || 'Dr. Sarah Chen'}** in the **${patient?.department || 'Cardiology'}** wing.`,
        actions: onOpenBookAppointment ? [
          {
            label: 'Book New Slot',
            onClick: () => onOpenBookAppointment(undefined, 'Routine Follow-up')
          }
        ] : undefined
      };
    }

    // 2. How can I book an appointment
    if (textLower.includes('how can i book') || textLower.includes('book an appointment') || textLower.includes('schedule')) {
      return {
        text: `Booking an appointment at AI Clinic is quick and automated:\n\n1. Select your preferred physician or department.\n2. Choose an available slot (morning, afternoon, or evening).\n3. State your primary symptoms or visit reason.\n4. Confirm your appointment for instant EHR calendar integration.`,
        actions: onOpenBookAppointment ? [
          {
            label: 'Open Booking Form',
            onClick: () => onOpenBookAppointment()
          }
        ] : undefined
      };
    }

    // 3. Show appointment history
    if (textLower.includes('appointment history') || textLower.includes('past appointment') || textLower.includes('history')) {
      const patientAppointments = appointments.filter(
        a => patient && (a.patientId === patient.id || a.patientName.toLowerCase() === patient.name.toLowerCase())
      );

      if (patientAppointments.length > 0) {
        const aptList = patientAppointments
          .map(a => `• **${a.time}** — ${a.doctorName} (${a.department}): *${a.status}*`)
          .join('\n');
        return {
          text: `Here is your recent clinical encounter summary:\n\n${aptList}\n\nAll session clinical notes are signed and synced to your longitudinal EHR record.`,
        };
      }

      return {
        text: `You have 2 documented encounters in your recent history:\n• **09:00 AM** — Dr. Sarah Chen (Cardiology): *Completed*\n• **10:30 AM** — Outpatient Follow-up: *Confirmed*\n\nClinical chart notes are archived securely in compliance with HIPAA protocols.`,
      };
    }

    // 4. When is my follow-up
    if (textLower.includes('follow-up') || textLower.includes('follow up')) {
      return {
        text: `Your attending physician, **${patient?.assignedDoctor || 'Dr. Sarah Chen, MD'}**, recommends a clinical follow-up visit on **${patient?.nextAppointment || 'Thursday at 10:30 AM'}** for routine blood pressure check and telemetry evaluation.\n\nWould you like to reschedule or verify the time?`,
        actions: onOpenBookAppointment ? [
          {
            label: 'Schedule Follow-Up',
            onClick: () => onOpenBookAppointment(undefined, 'Follow-up Evaluation')
          }
        ] : undefined
      };
    }

    // 5. Explain my health record
    if (textLower.includes('explain') || textLower.includes('health record') || textLower.includes('vitals') || textLower.includes('medical record')) {
      if (patient) {
        return {
          text: `Here is a clear breakdown of your latest electronic health record (**MRN: ${patient.mrn}**):\n\n• **Blood Pressure (${patient.vitals.bp} mmHg)**: Evaluated as within target clinical bounds under active medication.\n• **Heart Rate (${patient.vitals.hr} bpm)**: Normal resting sinus rhythm.\n• **Oxygen Saturation (${patient.vitals.spo2}%)**: ${patient.vitals.spo2 >= 95 ? 'Optimal oxygen delivery on room air.' : 'Slightly low; supplemental monitoring advised.'}\n• **Active Medications**: ${patient.medications.join(', ')}.\n• **Allergies**: ${patient.allergies.join(', ')}.\n\nYour vital signs are stable and continuous telemetry sync is active.`,
        };
      }
      return {
        text: `Your health record includes continuous vital signs surveillance, active prescribed medications, longitudinal diagnostic summaries, and attending physician progress notes. All metrics remain within standard parameters.`,
      };
    }

    // 6. Generic query fallback
    return {
      text: `Thank you for your inquiry regarding "${userText}".\n\nAs your AI Clinic Assistant, I can provide information about your appointment schedule, medication dosages, vital sign history, or assist in scheduling clinical encounters with our specialists.\n\n*Note: For acute emergencies or severe chest pain, please visit the emergency wing or contact emergency services immediately.*`,
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsTyping(true);

    // Realistic typing delay
    setTimeout(() => {
      const responseData = generateMockResponse(query);
      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: responseData.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: responseData.actions,
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  // Minimized Floating Pill Mode
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900 text-white border border-cyan-500/40 shadow-2xl hover:border-cyan-400 transition-all hover:scale-105 active:scale-95 group"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-bold text-white">AI Clinic Assistant</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-sm h-[560px] max-h-[82vh] bg-slate-950 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200">
      {/* ========================================================= */}
      {/* CHAT HEADER                                               */}
      {/* ========================================================= */}
      <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-tight">AI Clinic Assistant</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Live
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Healthcare intelligence active</span>
            </div>
          </div>
        </div>

        {/* Header Controls: Minimize & Close */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Minimize Assistant"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CHAT MESSAGES BODY                                        */}
      {/* ========================================================= */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-gradient-to-b from-slate-950/60 to-slate-900/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
          >
            <div className="flex items-end gap-2 max-w-[88%]">
              {msg.sender === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shrink-0 mb-0.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white rounded-br-xs shadow-md shadow-cyan-600/10'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800/90 rounded-bl-xs shadow-sm'
                }`}
              >
                {/* Message Text with Simple Markdown Line formatting */}
                <div className="space-y-1 whitespace-pre-line">
                  {msg.text.split('\n').map((line, i) => {
                    // Check bold markdown
                    const formatted = line.replace(/\*\*(.*?)\*\*/g, '$1');
                    return (
                      <p key={i} className={line.startsWith('•') ? 'pl-2 text-slate-300 font-medium' : ''}>
                        {formatted}
                      </p>
                    );
                  })}
                </div>

                {/* Optional Action Buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    {msg.actions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        type="button"
                        onClick={action.onClick}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1 transition-all"
                      >
                        <span>{action.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <span className="text-[10px] text-slate-500 px-1 font-mono">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {/* Assistant Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 max-w-[85%] text-slate-400">
            <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ========================================================= */}
      {/* SUGGESTED QUESTIONS CHIPS                                 */}
      {/* ========================================================= */}
      <div className="px-3 py-2 bg-slate-950 border-t border-slate-900 shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-cyan-400" />
          <span>Suggested Questions:</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 whitespace-nowrap transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* INPUT PANEL                                               */}
      {/* ========================================================= */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2 focus-within:border-cyan-500/60 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about appointments, vitals, doctors..."
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputPrompt.trim() || isTyping}
            className={`p-1.5 rounded-xl transition-all ${
              inputPrompt.trim() && !isTyping
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm hover:opacity-95'
                : 'text-slate-600 bg-slate-800/60 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-[10px] text-center text-slate-500 mt-1.5">
          AI Clinic Health System · HIPAA Compliant Guidance
        </div>
      </div>
    </div>
  );
};
