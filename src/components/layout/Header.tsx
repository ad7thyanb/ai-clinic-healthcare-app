import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Plus, 
  ChevronDown, 
  User, 
  ShieldCheck, 
  FileText, 
  UserPlus, 
  X, 
  LogOut, 
  Home, 
  LayoutDashboard, 
  Activity, 
  Info, 
  HeartPulse,
  Database
} from 'lucide-react';
import { ActiveView } from '../../types/clinic';
import { LiveStatusModal } from '../modals/LiveStatusModal';
import { AboutUsModal } from '../modals/AboutUsModal';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SupabaseConfigModal } from '../modals/SupabaseConfigModal';

import { AuthUser } from '../auth/LoginScreen';

interface HeaderProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onOpenNewAppointment: () => void;
  onOpenAddPatient: () => void;
  onOpenReports: () => void;
  onToggleMobileMenu: () => void;
  selectedTimeframe: 'today' | 'week' | 'month';
  onTimeframeChange: (timeframe: 'today' | 'week' | 'month') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  onGoHome?: () => void;
}

const VIEW_METADATA: Record<ActiveView, { title: string; category: string; description: string }> = {
  dashboard: {
    title: 'Executive Clinic Overview',
    category: 'Operations & Intelligence',
    description: 'Real-time patient flow, clinical capacity, KPI metrics, and algorithmic risk telemetry',
  },
  queue: {
    title: 'Front Desk Triage & Patient Check-In Hub',
    category: 'Clinical Operations',
    description: 'Real-time patient intake queue, triage classifications, instant check-in, and examination room assignments',
  },
  patients: {
    title: 'Patient Directory & EHR Records',
    category: 'Clinical Records',
    description: 'Electronic health records, vital signs monitoring, triage status, and pharmacological history',
  },
  appointments: {
    title: 'Consultation & Triage Schedule',
    category: 'Scheduling Engine',
    description: 'Active queue tracking, room allocations, priority classification, and wait time optimization',
  },
  doctors: {
    title: 'Physicians & Medical Staff Directory',
    category: 'Staff Operations',
    description: 'Departmental specialty coverage, real-time consultation loads, and physician availability',
  },
  diseases: {
    title: 'Epidemiology & Disease Analytics',
    category: 'Clinical Analytics',
    description: 'ICD-10 diagnostic frequency rankings, seasonal contagion vectors, and severity distributions',
  },
  insights: {
    title: 'AI Diagnostic & Triage Intelligence',
    category: 'Predictive Models',
    description: 'Automated triage protocols, no-show mitigations, cardiorenal flags, and staffing predictions',
  },
  departments: {
    title: 'Clinical Departments & Inpatient Census',
    category: 'Hospital Divisions',
    description: 'Specialty unit occupancy, surge capacity, staffing ratios, and medical leadership',
  },
  reports: {
    title: 'Reports & Clinical Quality Analytics',
    category: 'Quality & Compliance',
    description: 'Joint Commission quality scores, physician RVUs, dwell times, and export packages',
  },
  contact: {
    title: 'Contact Us & Clinical Support Desk',
    category: 'Hospital Communications',
    description: 'Emergency medical hotline, departmental directory, campus guide, and clinical IT desk',
  },
  settings: {
    title: 'System Settings & Clinic Configuration',
    category: 'Institutional Administration',
    description: 'EHR interoperability, notification protocols, HIPAA audit security, and facility preferences',
  },
  clinic_data: {
    title: 'Supabase Clinic Database (clinic data)',
    category: 'Relational Cloud Storage',
    description: 'Direct live query interface to Supabase "clinic data" table with server-side pagination, sorting, and search',
  },
  staff: {
    title: 'Staff Management & Access Control',
    category: 'Institutional Administration',
    description: 'Manage clinical staff credentials, administrative roles, triage coordinators, and secure invitations',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onNavigate,
  onOpenNewAppointment,
  onOpenAddPatient,
  onOpenReports,
  onToggleMobileMenu,
  selectedTimeframe,
  onTimeframeChange,
  searchQuery,
  onSearchChange,
  currentUser,
  onLogout,
  onGoHome,
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [liveStatusModalOpen, setLiveStatusModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const meta = VIEW_METADATA[activeView] || {
    title: 'Clinical Hub',
    category: 'Healthcare System',
    description: 'Medical practice operations',
  };

  const sampleNotifications = [
    {
      id: 'n1',
      title: 'Acute Respiratory Arrival',
      desc: 'Patient Marcus Holloway (SpO2 94%) in Room 112 triage bay.',
      time: '6m ago',
      type: 'alert',
      urgent: true,
    },
    {
      id: 'n2',
      title: 'AFib Predictive Flag',
      desc: 'Machine learning correlated CKD cohort lab data with high stroke risk.',
      time: '24m ago',
      type: 'ai',
      urgent: false,
    },
    {
      id: 'n3',
      title: 'Pediatric Strep Spike',
      desc: 'Local school cluster detected: +22.4% positive throat culture rate.',
      time: '1h ago',
      type: 'trend',
      urgent: false,
    },
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs text-slate-800">
        <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Left: Mobile Menu + AI Clinic Logo & View Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div 
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={onGoHome}
              title="Return to AI Clinic Home"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/25 group-hover:scale-105 transition-transform shrink-0">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                    AI Clinic
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-50 text-teal-700 border border-teal-200 hidden sm:inline-block">
                    Staff
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate max-w-[140px] sm:max-w-xs">
                  {meta.title}
                </div>
              </div>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-sm mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search patients, doctors, MRN, complaints..."
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white text-slate-900 rounded-xl border border-slate-300 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600/30 transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Navigation Options & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <nav className="flex items-center gap-1">
              {/* Home */}
              <button
                type="button"
                onClick={onGoHome}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                title="Home"
              >
                <Home className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="hidden md:inline">Home</span>
              </button>

              {/* Dashboard */}
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeView === 'dashboard'
                    ? 'bg-teal-50 text-teal-800 border border-teal-200 font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200'
                }`}
                title="Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="hidden md:inline">Dashboard</span>
              </button>

              {/* Live Status */}
              <button
                type="button"
                onClick={() => setLiveStatusModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                title="Live Clinical Status"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden md:inline">Live Status</span>
              </button>

              {/* About Us */}
              <button
                type="button"
                onClick={() => setAboutModalOpen(true)}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                title="About AI Clinic"
              >
                <Info className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>About Us</span>
              </button>
            </nav>

            {/* Supabase Status Pill */}
            <button
              type="button"
              onClick={() => setSupabaseModalOpen(true)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isSupabaseConfigured()
                  ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
              title="Supabase Auth Status"
            >
              <Database className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden 2xl:inline">{isSupabaseConfigured() ? 'Supabase Active' : 'Setup Auth'}</span>
            </button>

            {/* Timeframe Segmented Control */}
            <div className="hidden 2xl:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => onTimeframeChange('today')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  selectedTimeframe === 'today'
                    ? 'bg-white text-teal-800 shadow-xs font-bold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => onTimeframeChange('week')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  selectedTimeframe === 'week'
                    ? 'bg-white text-teal-800 shadow-xs font-bold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7d
              </button>
              <button
                type="button"
                onClick={() => onTimeframeChange('month')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  selectedTimeframe === 'month'
                    ? 'bg-white text-teal-800 shadow-xs font-bold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30d
              </button>
            </div>

            {/* New Appointment Primary Button */}
            <button
              type="button"
              onClick={onOpenNewAppointment}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-600/20 transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Appt</span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Clinical Alerts</span>
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-md">3 Active</span>
                    </div>
                    <span className="text-[11px] text-teal-700 font-medium">Real-Time HL7</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {sampleNotifications.map((notif) => (
                      <div key={notif.id} className="p-3 hover:bg-slate-50 transition-colors flex items-start gap-2.5">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.urgent ? 'bg-rose-500' : 'bg-teal-500'}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{notif.title}</span>
                            <span className="text-[10px] text-slate-400">{notif.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{notif.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Prominent Visible Logout Button */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shadow-xs active:scale-[0.98]"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Logout</span>
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors"
                aria-label="Staff account menu"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs uppercase">
                  {currentUser?.name ? currentUser.name[0] : 'S'}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-none truncate max-w-[130px]">
                    {currentUser?.name || 'Staff User'}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-none mt-0.5">
                    {currentUser?.title || 'Clinic Staff'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-slate-800">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {currentUser?.name || 'Clinic Staff'}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {(currentUser?.email === 'admin@aura-health.org' || currentUser?.email === 'staff@aura-health.org')
                        ? 'Clinic Staff Member'
                        : (currentUser?.email || 'Clinic Staff Member')}
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        setSupabaseModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Database className="w-3.5 h-3.5 text-teal-600" />
                      <span>Supabase Settings</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onOpenAddPatient();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                      <span>Register New Patient</span>
                    </button>
                  </div>
                  <div className="pt-1 border-t border-slate-100">
                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 font-bold"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Logout</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Live Status & About Us Modals */}
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
    </>
  );
};
