import React, { useState, useEffect } from 'react';
import { 
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
  ArrowRight
} from 'lucide-react';
import { useRouter } from '../../router/Router';
import { PublicNavbar } from '../layout/PublicNavbar';
import { PublicFooter } from '../layout/PublicFooter';
import { PatientTestimonials } from '../testimonials/PatientTestimonials';
import { AuthUser } from '../auth/LoginScreen';

interface AboutPageProps {
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ currentUser, onLogout }) => {
  const { navigate } = useRouter();
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
      tag: 'Patient Care',
    },
    {
      id: 2,
      title: 'Digital Healthcare',
      subtitle: 'Organize patient and appointment information efficiently.',
      image: '/images/about_slide2_digital_health.jpg',
      alt: 'Doctor using digital medical records and health software',
      tag: 'Digital Records',
    },
    {
      id: 3,
      title: 'Healthcare Analytics',
      subtitle: 'Transform healthcare data into meaningful insights.',
      image: '/images/about_slide3_analytics.jpg',
      alt: 'Healthcare analytics and clinical data dashboard screens',
      tag: 'Data Analytics',
    },
    {
      id: 4,
      title: 'AI-Powered Healthcare',
      subtitle: 'Use intelligent data analysis to support better decisions.',
      image: '/images/about_slide4_ai_tech.jpg',
      alt: 'AI medical technology and digital healthcare analysis',
      tag: 'AI Intelligence',
    },
    {
      id: 5,
      title: 'Connected Clinic',
      subtitle: 'Bring patients, doctors and clinic operations together.',
      image: '/images/about_slide5_clinic_team.jpg',
      alt: 'Modern clinic and hospital team collaborating',
      tag: 'Connected Operations',
    },
  ];

  // Automatic slide transition every 4.5 seconds
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % aboutSlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isHovered, aboutSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % aboutSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + aboutSlides.length) % aboutSlides.length);
  };

  const pillars = [
    {
      icon: Sparkles,
      title: 'Evidence-Based Predictive Triage',
      desc: 'Machine-learning risk stratification aligned with emergency acuity protocols, prioritizing urgent interventions within seconds.',
      badge: '98.4% Concordance',
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise Clinical Security & HIPAA',
      desc: 'AES-256 encrypted electronic health records, immutable audit logging, and role-authorized multi-tenant clinical partitioning.',
      badge: 'Audit Verified',
    },
    {
      icon: Users,
      title: 'Multidisciplinary Collaboration',
      desc: 'Unified operational nexus synchronizing physicians, nurse practitioners, laboratory coordinators, and clinic leadership.',
      badge: 'Connected Bays',
    },
    {
      icon: Activity,
      title: 'Zero-Latency Patient Flow',
      desc: 'Dynamic room assignment, continuous waiting queue telemetry, and automated doctor workload load-balancing algorithms.',
      badge: '8.6 Min Avg Wait',
    },
  ];

  const milestones = [
    { metric: '2,845+', label: 'Active EHR Patients', subtext: 'De-identified clinical cohort' },
    { metric: '98.4%', label: 'Triage Concordance', subtext: 'Verified against physician diagnosis' },
    { metric: '14 Bays', label: 'Continuous Telemetry', subtext: 'Real-time physiological tracking' },
    { metric: '< 9 min', label: 'Average Triage Wait', subtext: '42% faster than regional baseline' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <PublicNavbar currentUser={currentUser} onLogout={onLogout} />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold uppercase tracking-wider mb-4">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>About AI Clinic System</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Transforming Outpatient Care with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                Data-Driven Intelligence
              </span>
            </h1>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              AI Clinic bridges clinical diagnostic excellence with real-time operational efficiency. Designed for physicians, nursing teams, and patients, our platform streamlines appointment scheduling, triage queues, and electronic health record documentation.
            </p>
          </div>

          {/* ========================================================= */}
          {/* ABOUT US IMAGE CAROUSEL (EXACTLY 5 REAL HEALTHCARE SLIDES)  */}
          {/* ========================================================= */}
          <div 
            className="mt-8 relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Aspect container (compact 21:9 / 16:7 format) */}
            <div className="relative w-full h-72 sm:h-96 md:h-[420px] overflow-hidden bg-slate-950">
              {aboutSlides.map((slide, index) => {
                const isActive = index === currentSlide;
                return (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    {/* Realistic Photography Image */}
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-700"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />

                    {/* Gradient Overlay for Text Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />

                    {/* Slide Caption Text */}
                    <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 max-w-xl text-left z-20">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold uppercase tracking-wider mb-2.5 backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{slide.tag}</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                        {slide.title}
                      </h2>
                      <p className="mt-1.5 text-sm sm:text-base text-slate-200 font-medium leading-relaxed drop-shadow">
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
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white border border-slate-700/80 backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 shadow-xl hover:scale-105"
                title="Previous Slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Navigation Right Arrow */}
              <button
                type="button"
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white border border-slate-700/80 backdrop-blur-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 shadow-xl hover:scale-105"
                title="Next Slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* 5 Indicator Dots at Bottom */}
              <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60">
                {aboutSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentSlide === idx
                        ? 'w-6 bg-cyan-400 shadow-sm shadow-cyan-400/50'
                        : 'w-2 bg-slate-500 hover:bg-slate-300'
                    }`}
                    title={`Slide ${idx + 1}: ${slide.title}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Milestones */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {milestones.map((m, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 tracking-tight">{m.metric}</div>
                <div className="text-xs font-bold text-white mt-1">{m.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{m.subtext}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pillars Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-800/80">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Our Four Clinical Pillars</h2>
            <p className="mt-2 text-sm text-slate-400">
              Rigorous healthcare engineering grounded in physician workflows, privacy governance, and patient safety.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-white">{p.title}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Patient Testimonials Rotating Component */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-slate-800/80">
          <PatientTestimonials />
        </div>

        {/* CTA Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900/60 via-slate-900 to-cyan-950/70 border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">Ready to Experience Modern Healthcare?</h3>
              <p className="text-sm text-slate-300 mt-1">Book an appointment with our specialist physicians or access your medical records.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/doctors')}
                className="px-5 py-3 rounded-xl text-xs font-bold bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-md flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-cyan-600" />
                <span>Find a Doctor</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-5 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md flex items-center gap-2"
              >
                <span>Patient Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
