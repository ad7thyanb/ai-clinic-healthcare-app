import React, { useState } from 'react';
import { 
  HeartPulse, 
  Home, 
  Users, 
  Info, 
  PhoneCall, 
  LogIn, 
  UserPlus, 
  LayoutDashboard, 
  Activity, 
  Menu,
  X,
  FileCheck2,
  Database,
  Stethoscope
} from 'lucide-react';
import { useRouter } from '../../router/Router';
import { AuthUser } from '../auth/LoginScreen';
import { LiveStatusModal } from '../modals/LiveStatusModal';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SupabaseConfigModal } from '../modals/SupabaseConfigModal';

interface PublicNavbarProps {
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ currentUser, onLogout }) => {
  const { currentPath, navigate } = useRouter();
  const [liveStatusOpen, setLiveStatusOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/doctors', label: 'Doctors', icon: Users },
    { path: '/services', label: 'Services', icon: Stethoscope },
    { path: '/about', label: 'About Us', icon: Info },
    { path: '/contact', label: 'Contact', icon: PhoneCall },
    { path: '/acceptance-tests', label: 'Acceptance Tests', icon: FileCheck2 },
  ];

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/' || currentPath === '/home';
    return currentPath.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Branding */}
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="flex items-center gap-3 group text-left transition-transform active:scale-98"
          >
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/25 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                  AI Clinic
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Healthcare EHR
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-none mt-0.5">Clinical Operations Platform</p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    active
                      ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Live Status Modal Button */}
            <button
              type="button"
              onClick={() => setLiveStatusOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-2 transition-all"
              title="View dynamic clinic occupancy and queue telemetry"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Status</span>
            </button>
          </nav>

          {/* Authentication & Dashboard Action Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Supabase Status Pill */}
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
              <span className="hidden lg:inline">{isSupabaseConfigured() ? 'Supabase Active' : 'Setup Auth'}</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-sm shadow-teal-600/20 transition-all flex items-center gap-2"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>
                    Dashboard ({currentUser.role === 'patient' ? 'Patient' : currentUser.role === 'doctor' ? 'Doctor' : 'Clinic Staff'})
                  </span>
                </button>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                    title="Sign Out"
                  >
                    <LogIn className="w-4 h-4 rotate-180" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-teal-600" />
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
            {navLinks.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                  isActive(item.path)
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <item.icon className="w-4 h-4 text-teal-600" />
                <span>{item.label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setLiveStatusOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center gap-2.5"
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Live Status Monitor</span>
            </button>
            <div className="pt-2 border-t border-slate-200 flex gap-2">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    navigate('/dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white text-center"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 text-center"
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/signup');
                      setMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-teal-600 text-white text-center"
                  >
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Dynamic Live Status Modal */}
      <LiveStatusModal isOpen={liveStatusOpen} onClose={() => setLiveStatusOpen(false)} />

      {/* Supabase Config Modal */}
      <SupabaseConfigModal isOpen={supabaseModalOpen} onClose={() => setSupabaseModalOpen(false)} />
    </>
  );
};
