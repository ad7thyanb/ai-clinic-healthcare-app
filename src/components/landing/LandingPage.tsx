import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Stethoscope, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight, 
  ChevronLeft,
  Home, 
  LayoutDashboard, 
  FileCheck2,
  Database
} from 'lucide-react';
import { AuthUser } from '../auth/LoginScreen';
import { LiveStatusModal } from '../modals/LiveStatusModal';
import { AboutUsModal } from '../modals/AboutUsModal';
import { useRouter } from '../../router/Router';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SupabaseConfigModal } from '../modals/SupabaseConfigModal';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: (role?: 'patient' | 'doctor' | 'clinic_staff') => void;
  currentUser?: AuthUser | null;
  onGoToDashboard?: () => void;
  onLogout?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  currentUser,
  onGoToDashboard,
  onLogout,
}) => {
  const { navigate } = useRouter();
  const [liveStatusModalOpen, setLiveStatusModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Exact 5 healthcare slides with real photography
  const heroSlides = [
    {
      id: 1,
      title: 'Smart Healthcare',
      subtitle: 'Modern technology for higher clinical precision and patient care',
      image: '/images/slide1_smart_healthcare.jpg',
      alt: 'Doctor consulting patient in modern clinic',
    },
    {
      id: 2,
      title: 'Digital Healthcare',
      subtitle: 'Manage electronic health records and consultations seamlessly',
      image: '/images/slide2_digital_healthcare.jpg',
      alt: 'Physician using digital medical records on tablet',
    },
    {
      id: 3,
      title: 'Healthcare Analytics',
      subtitle: 'Turn diagnostic and triage data into actionable operational insights',
      image: '/images/slide3_healthcare_analytics.jpg',
      alt: 'Healthcare analytics monitor and clinic data graphs',
    },
    {
      id: 4,
      title: 'AI-Powered Healthcare',
      subtitle: 'Algorithmic acuity screening and clinical triage support',
      image: '/images/slide4_ai_healthcare.jpg',
      alt: 'Medical technology and cardiology intelligence telemetry',
    },
    {
      id: 5,
      title: 'Connected Clinic',
      subtitle: 'Unified hospital ecosystem for patients, physicians, and administrators',
      image: '/images/slide5_connected_clinic.jpg',
      alt: 'Connected clinical hospital environment and medical staff',
    },
  ];

  // Automatic slide transition every 4.5 seconds
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered, heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const clinicalMetrics = [
    { label: 'Triage Concordance', value: '98.4%', subtext: 'CDC protocol accuracy' },
    { label: 'Average Queue Wait', value: '8.6 min', subtext: '-42% vs regional average' },
    { label: 'Active EHR Records', value: '2,845+', subtext: 'De-identified cohort' },
    { label: 'System Availability', value: '99.98%', subtext: 'HL7 & FHIR live sync' },
  ];

  const coreFeatures = [
    {
      icon: Sparkles,
      title: 'Algorithmic Clinical Triage',
      description: 'Real-time multi-symptom acuity classification routing critical presentations directly to physician exam bays.',
      badge: 'Predictive Acuity',
    },
    {
      icon: Activity,
      title: 'Live Vital Signs Telemetry',
      description: 'Continuous surveillance tracking Blood Pressure, Heart Rate, SpO2 hypoxia thresholds, and fasting glucose levels.',
      badge: 'HL7/FHIR Engine',
    },
    {
      icon: Stethoscope,
      title: 'Physician Workload Balancing',
      description: 'Automated consultation dwell balancing that prevents specialist burnout and dynamically allocates triage staff.',
      badge: 'Provider Suite',
    },
    {
      icon: TrendingUp,
      title: 'Epidemiological Surveillance',
      description: 'ICD-10 frequency mapping that detects local pediatric and seasonal contagion vectors with automated alerts.',
      badge: 'Disease Intelligence',
    },
  ];

  const roleHighlights = [
    {
      role: 'patient' as const,
      title: 'For Patients',
      tag: 'Personal Health Portal',
      description: 'Access longitudinal health history, review vital signs trends, book consultations, and view care advisories.',
      icon: Users,
      action: 'Open Patient Portal',
      features: ['Personal EHR summary & vitals', 'Mobile appointment check-in', 'Prescription records review', 'Care plan instructions from doctor'],
    },
    {
      role: 'doctor' as const,
      title: 'For Physicians',
      tag: 'Provider Clinical Suite',
      description: 'Manage daily patient encounters, review bedside vitals telemetry, sign consultation charts, and document progress notes.',
      icon: Stethoscope,
      action: 'Open Physician Portal',
      features: ['Real-time appointment schedule queue', 'Bedside vital signs & hypoxia telemetry', 'Rapid EHR progress notes documentation', 'Direct encounter completion workflows'],
    },
    {
      role: 'clinic_staff' as const,
      title: 'For Clinic Staff',
      tag: 'Operations & Management',
      description: 'Hospital-wide bed capacity oversight, multi-department throughput tracking, and predictive quality audit reporting.',
      icon: ShieldCheck,
      action: 'Enter Operations Hub',
      features: ['Comprehensive executive dashboard', 'Department bed load & waiting times', 'Clinic schedule & patient directory', 'Quality audit reports & analytics'],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Top-Left: AI Clinic Logo & Name */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="AI Clinic Home"
          >
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/25 group-hover:scale-105 transition-transform shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                AI Clinic
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 hidden sm:inline-block">
                Healthcare
              </span>
            </div>
          </div>

          {/* Top-Right: Navigation Options */}
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200"
                title="Home"
              >
                <Home className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="hidden sm:inline">Home</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/doctors')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Physicians Directory"
              >
                <Users className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="hidden sm:inline">Doctors</span>
              </button>

              {currentUser && (
                <button
                  type="button"
                  onClick={onGoToDashboard}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  title="Go to Clinical Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setLiveStatusModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                title="Live Clinical Telemetry"
              >
                <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="hidden sm:inline">Live Status</span>
              </button>

              <button
                type="button"
                onClick={() => setAboutModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="About AI Clinic"
              >
                <HeartPulse className="w-4 h-4 text-teal-600 shrink-0" />
                <span>About Us</span>
              </button>
            </nav>

            {/* Supabase status indicator & Auth CTAs */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              <button
                type="button"
                onClick={() => setSupabaseModalOpen(true)}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isSupabaseConfigured()
                    ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
                title="Supabase Auth Status"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{isSupabaseConfigured() ? 'Supabase Active' : 'Setup Auth'}</span>
              </button>

              {currentUser ? (
                <button
                  type="button"
                  onClick={onGoToDashboard}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
                >
                  Dashboard
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-700 mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="font-semibold text-slate-900">Clinical Intelligence Engine Active</span>
              <span className="text-slate-300">·</span>
              <span className="text-teal-700 font-mono text-[11px] font-bold">98.4% Concordance</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Modern Clinical{' '}
              <span className="text-teal-600">
                Healthcare Management
              </span>{' '}
              &amp; Operations
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Unified hospital operations, predictive triage routing, bedside vital signs telemetry, and patient EHR records powered by dynamic Supabase authentication.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              {currentUser && onGoToDashboard ? (
                <button
                  type="button"
                  onClick={onGoToDashboard}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Open {currentUser.role === 'patient' ? 'Patient' : currentUser.role === 'doctor' ? 'Physician' : 'Staff'} Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onGetStarted}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Launch Clinical Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSignIn('clinic_staff')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-600" />
                    <span>Staff &amp; Physician Sign In</span>
                  </button>
                </>
              )}
            </div>

            {/* Proof Badges */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>HIPAA &amp; Zero-Trust Standards</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Real-Time HL7/FHIR Protocol</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Supabase Secure Authentication</span>
              </span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* HOMEPAGE HERO IMAGE SLIDER (EXACTLY 5 SLIDES)             */}
          {/* ========================================================= */}
          <div 
            className="mt-12 sm:mt-14 rounded-3xl bg-white border border-slate-200/90 shadow-xl relative overflow-hidden group select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative w-full h-[220px] sm:h-[300px] md:h-[340px] lg:h-[380px] overflow-hidden bg-slate-900">
              {heroSlides.map((slide, idx) => {
                const isActive = idx === currentSlide;
                return (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                    aria-hidden={!isActive}
                  >
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center"
                    />

                    {/* Gradient Overlay for Healthcare Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent" />

                    {/* Clean Minimal Slide Text Overlay */}
                    <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-8 max-w-xl pr-14 z-20">
                      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-teal-400/30 text-[10px] sm:text-[11px] font-semibold text-teal-300 mb-1.5 sm:mb-2 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                        <span>Slide {idx + 1} of 5</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                        {slide.title}
                      </h2>
                      <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-200 font-medium leading-relaxed drop-shadow-sm max-w-lg line-clamp-2">
                        {slide.subtitle}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Navigation Left Arrow */}
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Previous slide"
                className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/70 hover:bg-slate-900/90 text-white hover:text-teal-300 border border-white/20 backdrop-blur-md flex items-center justify-center transition-all shadow-lg active:scale-95 group/btn"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:-translate-x-0.5 transition-transform" />
              </button>

              {/* Navigation Right Arrow */}
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Next slide"
                className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/70 hover:bg-slate-900/90 text-white hover:text-teal-300 border border-white/20 backdrop-blur-md flex items-center justify-center transition-all shadow-lg active:scale-95 group/btn"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>

              {/* 5 Slide Indicator Dots */}
              <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-8 z-30 flex items-center gap-1.5 sm:gap-2 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/10">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full ${
                      currentSlide === idx
                        ? 'w-5 sm:w-6 h-1.5 sm:h-2 bg-teal-400 shadow-md shadow-teal-400/50'
                        : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/40 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section id="analytics" className="py-12 border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {clinicalMetrics.map((m, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-700 tabular-nums">
                  {m.value}
                </div>
                <div className="text-xs font-bold text-slate-900 mt-1">{m.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{m.subtext}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Platform Features */}
      <section id="features" className="py-18 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Purpose-Built for Clinical Rigor
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Advanced triage algorithms, longitudinal records, and physician queue balancing designed with clinical workflows in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 shadow-sm transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shadow-xs">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Clinical standard</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role Workspaces */}
      <section id="roles" className="py-18 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Role-Specific Workspaces
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Three Role Dashboards. One Integrated Health System.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Every participant in the care delivery chain has an interface tailored to their specific clinical responsibilities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {roleHighlights.map((rh, idx) => {
              const Icon = rh.icon;
              return (
                <div
                  key={idx}
                  className="p-7 rounded-3xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/20">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 bg-white px-2.5 py-1 rounded-full border border-slate-200">
                        {rh.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">{rh.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mb-6">
                      {rh.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Included Workflows:
                      </div>
                      <ul className="space-y-2 text-xs text-slate-700">
                        {rh.features.map((f, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSignIn(rh.role)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>{rh.action}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 text-center relative overflow-hidden shadow-xl text-white">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Ready to Experience AI Clinic Healthcare Management?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Connect your Supabase project or sign in with your clinical credentials to explore live appointments, vital signs telemetry, and diagnostic analytics.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Sign In with Supabase</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-200 bg-white text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-teal-600" />
              <span className="font-bold text-slate-900">AI Clinic</span>
              <span>· Clinical Intelligence EHR Platform</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button type="button" onClick={() => navigate('/about')} className="hover:text-teal-700 transition-colors">
                About Us
              </button>
              <button type="button" onClick={() => navigate('/doctors')} className="hover:text-teal-700 transition-colors">
                Doctors
              </button>
              <button type="button" onClick={() => navigate('/contact')} className="hover:text-teal-700 transition-colors">
                Contact
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/acceptance-tests')} 
                className="text-teal-700 font-bold hover:text-teal-800 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200"
                title="Open Acceptance Tests Page"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Acceptance Tests</span>
              </button>
              <button type="button" onClick={() => navigate('/privacy')} className="hover:text-teal-700 transition-colors">
                Privacy
              </button>
              <button type="button" onClick={() => navigate('/terms')} className="hover:text-teal-700 transition-colors">
                Terms
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500">
            <span>HIPAA Compliant · HL7/FHIR Clinical Architecture · Supabase Auth</span>
            <span>&copy; {new Date().getFullYear()} AI Clinic Management System. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LiveStatusModal
        isOpen={liveStatusModalOpen}
        onClose={() => setLiveStatusModalOpen(false)}
      />

      <AboutUsModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />

      <SupabaseConfigModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />
    </div>
  );
};
