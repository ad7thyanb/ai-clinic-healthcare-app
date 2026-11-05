import React, { useState, useEffect } from 'react';
import { 
  X, 
  HeartPulse, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Activity, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  FileText,
  BarChart3,
  Stethoscope,
  Clock,
  ArrowRight,
  AlertCircle,
  Eye,
  Sliders
} from 'lucide-react';
import { PatientTestimonials } from '../testimonials/PatientTestimonials';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Exactly 5 distinct realistic healthcare slides
  const aboutSlides = [
    {
      id: 1,
      title: 'Better Patient Care',
      subtitle: 'Technology that supports efficient healthcare management.',
      image: '/images/about_slide1_patient_care.jpg',
      alt: 'Modern doctor consulting with patient in clinical setting',
      tag: 'Patient Care'
    },
    {
      id: 2,
      title: 'Digital Healthcare',
      subtitle: 'Organize patient and appointment information efficiently.',
      image: '/images/about_slide2_digital_health.jpg',
      alt: 'Doctor using digital medical records and health software',
      tag: 'Digital Records'
    },
    {
      id: 3,
      title: 'Healthcare Analytics',
      subtitle: 'Transform healthcare data into meaningful insights.',
      image: '/images/about_slide3_analytics.jpg',
      alt: 'Healthcare analytics and clinical data dashboard screens',
      tag: 'Data Analytics'
    },
    {
      id: 4,
      title: 'AI-Powered Healthcare',
      subtitle: 'Use intelligent data analysis to support better decisions.',
      image: '/images/about_slide4_ai_tech.jpg',
      alt: 'AI medical technology and digital healthcare analysis',
      tag: 'AI Intelligence'
    },
    {
      id: 5,
      title: 'Connected Clinic',
      subtitle: 'Bring patients, doctors and clinic operations together.',
      image: '/images/about_slide5_clinic_team.jpg',
      alt: 'Modern clinic and hospital team collaborating',
      tag: 'Connected Operations'
    },
  ];

  // Automatic slide transition every 4.5 seconds
  useEffect(() => {
    if (!isOpen || isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % aboutSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isOpen, isHovered, aboutSlides.length]);

  if (!isOpen) return null;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % aboutSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + aboutSlides.length) % aboutSlides.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="About AI Clinic"
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/25 shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">About AI Clinic</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Platform Overview
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected Clinical Operations &amp; Health Intelligence Platform
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Close About Us dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-12">
          
          {/* ========================================================= */}
          {/* 1. ABOUT US IMAGE SLIDER (EXACTLY 5 SLIDES)               */}
          {/* ========================================================= */}
          <div 
            className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-xl relative select-none group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative w-full h-[260px] sm:h-[340px] md:h-[400px] overflow-hidden bg-slate-950">
              {aboutSlides.map((slide, idx) => {
                const isActive = idx === currentSlide;
                return (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                    aria-hidden={!isActive}
                  >
                    {/* Realistic Photographic Healthcare Image */}
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />

                    {/* Gradient Overlay for Healthcare Theme & Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent" />

                    {/* Short Text Overlay */}
                    <div className="absolute bottom-5 sm:bottom-8 left-5 sm:left-8 max-w-lg pr-12 z-20">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-cyan-500/30 text-[10px] font-semibold text-cyan-300 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span>{slide.tag} · Slide {idx + 1} of 5</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                        {slide.title}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-cyan-100/90 font-medium leading-relaxed drop-shadow-sm max-w-md">
                        {slide.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Slider Left Arrow */}
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous About slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/70 hover:bg-slate-900/95 text-white hover:text-cyan-300 border border-white/20 backdrop-blur-md flex items-center justify-center transition-all shadow-md active:scale-95"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Slider Right Arrow */}
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next About slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/70 hover:bg-slate-900/95 text-white hover:text-cyan-300 border border-white/20 backdrop-blur-md flex items-center justify-center transition-all shadow-md active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* 5 Indicator Dots */}
              <div className="absolute bottom-3 sm:bottom-5 right-5 sm:right-8 z-30 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                {aboutSlides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to About slide ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full ${
                      currentSlide === idx
                        ? 'w-5 h-1.5 bg-cyan-400 shadow-sm shadow-cyan-400/50'
                        : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 1: ABOUT AI CLINIC                                */}
          {/* ========================================================= */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">About AI Clinic</h3>
                <p className="text-xs text-slate-400">A Modern Healthcare Management &amp; Clinical Intelligence Solution</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2.5">
              <p>
                AI Clinic is a comprehensive clinical management and healthcare operations platform engineered to support modern outpatient facilities, medical practices, and healthcare teams. By centralizing patient records, appointment scheduling, queue coordination, and operational analytics into a cohesive system, AI Clinic reduces paperwork, eliminates scheduling friction, and empowers medical staff to focus on clinical care.
              </p>
              <p className="text-slate-400 text-xs">
                The platform unites medical administration, physician consultation workflows, and patient self-service access into synchronized, role-tailored dashboards.
              </p>
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION 2: OUR PURPOSE                                    */}
          {/* ========================================================= */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Our Purpose</h3>
                <p className="text-xs text-slate-400">Empowering Medical Staff and Improving Patient Experiences</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2.5">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Operational Efficiency</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Streamlining visit check-ins, optimizing consultation room turnover, and minimizing patient waiting times across specialty wings.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2.5">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Accurate Record-Keeping</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Providing organized, digital histories for patient visits, allergies, medications, and clinical progress notes in unified charts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2.5">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">Informed Decision-Making</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Presenting real-time clinical overviews to assist clinic supervisors in evaluating patient volume, doctor schedules, and department utilization.
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION 3: WHAT AI CLINIC PROVIDES (FEATURES)             */}
          {/* ========================================================= */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">What AI Clinic Provides</h3>
                <p className="text-xs text-slate-400">Core Platform Capabilities &amp; Everyday Tools</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-2">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-white">Patient Management</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Centralized demographic records, MRN indexing, contact directories, and visit history logs for every registered patient.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-white">Appointment Scheduling</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Flexible calendar booking, slot availability conflict checks, and live status tracking (Scheduled, Completed, Cancelled).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-2">
                  <Stethoscope className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-white">Physician Workspaces</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Dedicated queue view for attending doctors, consultation notes editor, vitals monitor, and patient status updates.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center mb-2">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-bold text-white">Clinical Queue Tracking</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Real-time visibility into active exam rooms, waiting room counts, and doctor department coverage across the facility.
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION 4: DATA-DRIVEN HEALTHCARE (DATA & AI)             */}
          {/* ========================================================= */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Data-Driven Healthcare</h3>
                <p className="text-xs text-slate-400">Translating Health Information Into Actionable Clarity</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/30 via-slate-950 to-indigo-950/30 border border-cyan-500/20 space-y-3">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Healthcare environments generate continuous operational and clinical signals every hour. AI Clinic aggregates and structures these data points into clear visualizations, enabling medical administrators to anticipate peak consultation hours, monitor disease category distributions, and allocate clinical resources effectively.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-cyan-400 text-xs font-bold">Trend Analysis</div>
                  <div className="text-[11px] text-slate-400 mt-1">Aggregated tracking of frequent clinical conditions and seasonality patterns.</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-indigo-400 text-xs font-bold">Resource Balancing</div>
                  <div className="text-[11px] text-slate-400 mt-1">Staffing and bay allocation insights grounded in actual patient arrival volume.</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-purple-400 text-xs font-bold">Operational Metrics</div>
                  <div className="text-[11px] text-slate-400 mt-1">Average wait times, consultation durations, and discharge rates summarized cleanly.</div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION 5: HOW IT WORKS                                   */}
          {/* ========================================================= */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">How It Works</h3>
                <p className="text-xs text-slate-400">Simple, Connected Clinical Workflow</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 relative">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Step 1
                </span>
                <h4 className="text-xs font-bold text-white mt-2.5">Patient Registration &amp; Booking</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Patients are registered with medical record numbers (MRN), and appointments are scheduled with preferred specialists.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 relative">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Step 2
                </span>
                <h4 className="text-xs font-bold text-white mt-2.5">Check-In &amp; Queue Routing</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  On visit day, patient arrivals are marked in real time, routing them directly to the doctor's active patient list.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 relative">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Step 3
                </span>
                <h4 className="text-xs font-bold text-white mt-2.5">Physician Consultation</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Attending doctors review historical charts, enter consultation progress notes, and document clinical advisories.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 relative">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Step 4
                </span>
                <h4 className="text-xs font-bold text-white mt-2.5">Centralized Records &amp; Follow-Up</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Consultation summaries are archived for longitudinal continuity, accessible to patients and providers for future care.
                </p>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION 6: OUR VISION                                     */}
          {/* ========================================================= */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">Our Vision</h3>
                <p className="text-xs text-slate-400">The Future of Connected, Patient-Centered Healthcare</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/50 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2">
              <p>
                We believe healthcare practices function best when technology removes friction rather than adding complexity. By designing reliable, transparent, and user-friendly digital tools, AI Clinic strives to bridge doctors, clinic staff, and patients into a collaborative healthcare environment.
              </p>
              <p className="text-slate-400 text-xs">
                Our continuous goal is to make clinic administration simpler and daily patient experiences more attentive, organized, and timely.
              </p>
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION 7: PATIENT TESTIMONIALS                           */}
          {/* ========================================================= */}
          <PatientTestimonials />

          {/* ========================================================= */}
          {/* SECTION 8: HEALTHCARE TECHNOLOGY DISCLAIMER               */}
          {/* ========================================================= */}
          <section className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                  Healthcare Technology Disclaimer
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  AI Clinic is a healthcare operational management and workflow assistance software application. The analytics, categorization tools, and informational suggestions provided by the system are designed to assist healthcare professionals in administrative organization and clinical data visualization. AI Clinic is not a medical device and does not provide formal medical diagnoses, independent clinical judgments, or treatment prescriptions. All clinical decisions, patient evaluations, and treatment plans must be made by qualified, licensed healthcare professionals.
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>AI Clinic System · All Systems Operational</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-white hover:bg-slate-200 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
