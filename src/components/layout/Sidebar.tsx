import React from 'react';
import { 
  LayoutDashboard, 
  CalendarClock, 
  Users, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  X,
  HeartPulse,
  BedDouble,
  FileText,
  Headphones,
  Settings,
  LogOut,
  Database,
  Stethoscope,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { ActiveView } from '../../types/clinic';
import { AuthUser } from '../auth/LoginScreen';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  stats?: {
    totalPatients?: number;
    todayAppointments?: number;
    activeDoctorsOnDuty?: number;
    roomOccupancyRate?: number;
    emergencyCasesToday?: number;
    totalEncounters?: number;
  } | null;
  currentUser?: AuthUser | null;
  onOpenReports: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  stats,
  currentUser,
  onOpenReports,
  onLogout,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveView,
      label: 'Executive Overview',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      id: 'queue' as ActiveView,
      label: 'Front Desk & Queue',
      icon: Clock,
      badge: 'Triage Hub',
    },
    {
      id: 'appointments' as ActiveView,
      label: 'Appointments',
      icon: CalendarClock,
      badge: stats?.todayAppointments ? `${stats.todayAppointments}` : 'Schedule',
    },
    {
      id: 'patients' as ActiveView,
      label: 'Patient Management',
      icon: Users,
      badge: stats?.totalPatients ? `${stats.totalPatients.toLocaleString()}` : 'Patients',
    },
    {
      id: 'doctors' as ActiveView,
      label: 'Doctor Management',
      icon: Stethoscope,
      badge: stats?.activeDoctorsOnDuty ? `${stats.activeDoctorsOnDuty} On Duty` : 'Doctors',
    },
    {
      id: 'staff' as ActiveView,
      label: 'Staff Management',
      icon: ShieldCheck,
      badge: 'Team',
    },
    {
      id: 'reports' as ActiveView,
      label: 'Analytics & Reports',
      icon: FileText,
      badge: 'Reports',
    },
    {
      id: 'clinic_data' as ActiveView,
      label: 'Clinic Database',
      icon: Database,
      badge: stats?.totalEncounters ? `${Math.round(stats.totalEncounters / 1000)}k` : '30k Data',
    },
    {
      id: 'insights' as ActiveView,
      label: 'AI Insights',
      icon: Sparkles,
      badge: '3 Critical',
    },
    {
      id: 'settings' as ActiveView,
      label: 'Clinic Settings',
      icon: Settings,
    },
    {
      id: 'contact' as ActiveView,
      label: 'Support & Help',
      icon: Headphones,
    },
  ];

  // All navigation items are unified and available to Clinic Staff
  const visibleNavItems = navItems;

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-slate-900 text-white flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 shadow-xl ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Logo Emblem */}
            <div className="relative w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-md shadow-teal-600/30 shrink-0">
              <HeartPulse className="w-5 h-5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-teal-300 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>

            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">
                    AI Clinic
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-teal-500/20 text-teal-300 border-teal-500/30">
                    Clinic Staff
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 truncate tracking-wide">
                  Clinical Operations &amp; Command
                </span>
              </div>
            )}
          </div>

          {/* Close for mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Pill in Sidebar */}
        {!collapsed && (
          <div className="px-3.5 pt-3.5">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                </span>
                <span className="text-[11px] font-semibold text-slate-300">Clinic Engine Active</span>
              </div>
              <span className="text-[10px] font-mono text-teal-400 font-bold tabular-nums">99.8%</span>
            </div>
          </div>
        )}

        {/* Navigation Section */}
        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {!collapsed && (
            <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Clinical Workspace
            </div>
          )}

          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                  isActive
                    ? 'bg-teal-500/20 text-white border border-teal-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-teal-400 rounded-r-full" />
                )}

                <Icon 
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`} 
                />

                {!collapsed && (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border tabular-nums shrink-0 ${
                        isActive 
                          ? 'bg-teal-500/30 text-teal-200 border-teal-500/50' 
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}

          {/* Quick Reports & Analytics Link */}
          {!collapsed && (
            <div className="pt-4">
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-left relative overflow-hidden group">
                <div className="flex items-center gap-2 mb-1.5">
                  <FileText className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-bold text-white">Clinical Auditing</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                  Export physician RVUs, dwell times, and quality reports.
                </p>
                <button
                  type="button"
                  onClick={onOpenReports}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-teal-300 hover:text-teal-200 border border-teal-500/40 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Clinical Audit Reports</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Clinic Vitals Telemetry */}
        {!collapsed && (
          <div className="p-3.5 border-t border-slate-800 bg-slate-950/70">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5 text-teal-400" />
                  Clinic Occupancy
                </span>
                <span className="font-mono font-bold text-white tabular-nums">
                  {stats?.roomOccupancyRate ? `${stats.roomOccupancyRate}%` : '84.5%'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-500 rounded-full" 
                  style={{ width: `${stats?.roomOccupancyRate || 84.5}%` }} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Logout Action in Sidebar */}
        {onLogout && (
          <div className="p-2.5 border-t border-slate-800 bg-slate-950/60">
            <button
              type="button"
              onClick={onLogout}
              className={`w-full flex items-center gap-2.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all ${
                collapsed ? 'justify-center px-1' : 'px-3'
              }`}
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        )}

        {/* Collapse toggle button */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/40">
          {!collapsed && (
            <div className="text-[11px] text-slate-400 truncate">
              {stats?.activeDoctorsOnDuty || 14} Doctors On Duty
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-auto"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
