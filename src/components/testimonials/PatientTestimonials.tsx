import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Quote, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Users,
  Sparkles
} from 'lucide-react';

export interface TestimonialItem {
  id: number;
  name: string;
  category: string;
  careWing: string;
  badge: string;
  avatarGradient: string;
  initials: string;
  rating: number;
  quote: string;
  highlight: string;
  duration: string;
}

export const PatientTestimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const testimonials: TestimonialItem[] = [
    {
      id: 1,
      name: 'Elena R.',
      category: 'General Medicine & Preventive Care',
      careWing: 'Outpatient Bay 2',
      badge: 'Verified Patient',
      avatarGradient: 'from-cyan-500 to-blue-600',
      initials: 'ER',
      rating: 5,
      quote:
        'Booking my morning consultation through AI Clinic was effortless. My triage notes were categorized immediately, and when I arrived, the attending doctor already had my vitals and allergy profile loaded. I felt truly listened to and received attentive, prompt care without the usual waiting room chaos.',
      highlight: 'Wait time reduced to under 8 minutes',
      duration: 'Registered Patient · 2 Years',
    },
    {
      id: 2,
      name: 'Marcus T.',
      category: 'Cardiology Care & Follow-Up',
      careWing: 'Specialty Wing A',
      badge: 'Verified Patient',
      avatarGradient: 'from-indigo-500 to-purple-600',
      initials: 'MT',
      rating: 5,
      quote:
        'Managing post-discharge follow-ups used to mean carrying thick folders of paper records. With AI Clinic’s longitudinal charting, my cardiologist tracks my blood pressure trends and progress notes across every visit seamlessly. The clinical team is always one step ahead.',
      highlight: 'Continuous vitals & progress synchronization',
      duration: 'Post-Procedure Care · 9 Months',
    },
    {
      id: 3,
      name: 'Sophia K.',
      category: 'Family & Pediatric Health',
      careWing: 'Children & Family Wing',
      badge: 'Verified Parent',
      avatarGradient: 'from-emerald-500 to-teal-600',
      initials: 'SK',
      rating: 5,
      quote:
        'Coordinating visits for my two kids used to involve endless phone holds. Now I can see the doctor’s real-time schedule, check in digitally before arriving, and access digital consultation summaries right on my phone afterwards. It has transformed our family healthcare experience.',
      highlight: 'Zero appointment booking conflicts',
      duration: 'Family Account · 18 Months',
    },
    {
      id: 4,
      name: 'David M.',
      category: 'Orthopedic Recovery & Rehabilitation',
      careWing: 'Rehab & Mobility Wing',
      badge: 'Verified Patient',
      avatarGradient: 'from-blue-600 to-cyan-500',
      initials: 'DM',
      rating: 5,
      quote:
        'The care coordination between my orthopedic surgeon and the physical therapy department was remarkable. Every practitioner knew my exact recovery timeline and exercise limits because their charts were unified. That level of communication made all the difference in my recovery.',
      highlight: 'Multi-specialist chart coordination',
      duration: 'Rehabilitation Program · 6 Months',
    },
    {
      id: 5,
      name: 'Amara N.',
      category: 'Endocrinology & Chronic Care',
      careWing: 'Metabolic Health Suite',
      badge: 'Verified Patient',
      avatarGradient: 'from-purple-500 to-pink-600',
      initials: 'AN',
      rating: 5,
      quote:
        'Living with Type 2 diabetes requires consistent medication checks and lab evaluations. Having my consultation histories, medication logs, and clinical advisories in one organized dashboard gives me complete confidence and keeps my care providers completely synchronized.',
      highlight: '100% chart continuity across 12 visits',
      duration: 'Chronic Care Plan · 1 Year',
    },
  ];

  // Auto-advance rotating testimonials every 5.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, testimonials.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section 
      className="space-y-4"
      aria-label="Patient Testimonials"
    >
      {/* Section Title Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Heart className="w-4 h-4 fill-cyan-400/20 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">Patient Testimonials</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Patient Stories
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Verified clinical experiences and patient outcomes across our healthcare network
            </p>
          </div>
        </div>

        {/* Carousel Prev/Next Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous patient story"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-950/60 hover:bg-slate-800 border border-slate-800 transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 px-1">
            {currentIndex + 1} / {testimonials.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next patient story"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-950/60 hover:bg-slate-800 border border-slate-800 transition-all active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rotating Card with Subtle Healthcare Theme Gradient */}
      <div 
        className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-cyan-950/30 via-slate-950 to-blue-950/25 border border-cyan-500/30 shadow-xl overflow-hidden transition-all duration-300 select-none group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Subtle decorative glow accents matching clinic branding */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Quote watermark icon */}
        <Quote className="absolute top-5 right-6 w-16 h-16 text-cyan-500/10 pointer-events-none stroke-1" />

        <div className="relative z-10 flex flex-col justify-between gap-5">
          {/* Top Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Patient Identity */}
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${current.avatarGradient} flex items-center justify-center text-white font-extrabold text-sm shadow-md ring-2 ring-white/10 shrink-0`}>
                {current.initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm sm:text-base tracking-tight">
                    {current.name}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{current.badge}</span>
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">
                  {current.category} · <span className="text-slate-500">{current.careWing}</span>
                </div>
              </div>
            </div>

            {/* Star Rating & Duration */}
            <div className="flex flex-col items-start sm:items-end gap-1">
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {current.duration}
              </span>
            </div>
          </div>

          {/* Testimonial Quote Text with Smooth Fade Key */}
          <blockquote 
            key={current.id}
            className="text-xs sm:text-sm text-slate-200 leading-relaxed italic border-l-2 border-cyan-500/60 pl-4 py-1 animate-in fade-in duration-300"
          >
            "{current.quote}"
          </blockquote>

          {/* Clinical Outcome Highlight & Indicators Row */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Key Clinical Highlight Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-semibold">{current.highlight}</span>
            </div>

            {/* Clickable Story Indicator Dots */}
            <div className="flex items-center gap-1.5">
              {testimonials.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`View story from ${item.name}`}
                  className={`transition-all duration-300 rounded-full ${
                    currentIndex === idx
                      ? 'w-6 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-sm shadow-cyan-400/50'
                      : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Patient Satisfaction Metrics Strip */}
      <div className="grid grid-cols-3 gap-3 text-center pt-1">
        <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
          <div className="text-base font-extrabold text-white font-mono">98.7%</div>
          <div className="text-[10px] text-slate-400 font-medium">Care Satisfaction Rate</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
          <div className="text-base font-extrabold text-cyan-300 font-mono">8.6 min</div>
          <div className="text-[10px] text-slate-400 font-medium">Average Visit Wait Time</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80">
          <div className="text-base font-extrabold text-emerald-300 font-mono">100%</div>
          <div className="text-[10px] text-slate-400 font-medium">Verified Patient Reviews</div>
        </div>
      </div>
    </section>
  );
};
