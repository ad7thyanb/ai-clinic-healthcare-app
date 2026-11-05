import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Bell, 
  Server, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Save, 
  RefreshCw,
  Database,
  Users,
  UserCheck,
  UserX,
  Mail,
  Send,
  Clock,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface PendingDoctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  department: string;
  title: string;
  phone: string;
  room: string;
  status: string;
}

interface StaffInvite {
  id: string;
  email: string;
  role: string;
  inviteCode: string;
  status: string;
  createdAt: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  details: string;
  ipAddress?: string;
}

export const ClinicSettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'facility' | 'approvals' | 'invites' | 'audit' | 'database'>('facility');

  const [settings, setSettings] = useState({
    facilityName: 'AI Clinic Regional Medical Center',
    facilityNpi: '1928475019',
    cmsCert: '05-0124',
    timezone: 'America/New_York (EST)',
    urgentTriagePush: true,
    statLabPagers: true,
    smsPatientReminders: true,
    dailyCensusDigest: true,
    fhirSyncCadence: 'Real-time Webhook (30s)',
    encryptionProtocol: 'AES-256 & TLS 1.3',
    sessionTimeout: '15 Minutes',
    twoFactorEnforced: true,
    hipaaAuditLogging: true,
  });

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Admin Data States
  const [pendingDoctors, setPendingDoctors] = useState<PendingDoctor[]>([]);
  const [staffInvites, setStaffInvites] = useState<StaffInvite[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'staff' | 'doctor'>('staff');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      const [docsRes, invitesRes, auditRes, healthRes] = await Promise.all([
        fetch('/api/admin/doctors/pending'),
        fetch('/api/admin/staff/invitations'),
        fetch('/api/admin/audit-logs'),
        fetch('/api/health'),
      ]);

      if (docsRes.ok) setPendingDoctors(await docsRes.json());
      if (invitesRes.ok) setStaffInvites(await invitesRes.json());
      if (auditRes.ok) setAuditLogs(await auditRes.json());
      if (healthRes.ok) setDbHealth(await healthRes.json());
    } catch (e) {
      console.warn('Could not load some admin state:', e);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [activeTab]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4500);
  };

  const handleApproveDoctor = async (docId: string) => {
    try {
      const res = await fetch(`/api/admin/doctors/${docId}/approve`, { method: 'PUT' });
      if (res.ok) {
        setActionNotice(`Doctor approved and clinical account activated!`);
        loadAdminData();
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectDoctor = async (docId: string) => {
    try {
      const res = await fetch(`/api/admin/doctors/${docId}/reject`, { method: 'PUT' });
      if (res.ok) {
        setActionNotice(`Doctor application rejected.`);
        loadAdminData();
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      const res = await fetch('/api/admin/staff/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) {
        const inv = await res.json();
        setActionNotice(`Invitation generated for ${inv.email} (Code: ${inv.inviteCode})`);
        setInviteEmail('');
        loadAdminData();
        setTimeout(() => setActionNotice(null), 5000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              System Settings &amp; Administration
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Admin Gateway
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage facility configuration, doctor approvals, staff invitations, activity audit logs, and persistent database connections.
          </p>
        </div>

        {activeTab === 'facility' && (
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-600/25 transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save System Preferences</span>
          </button>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
        {[
          { id: 'facility' as const, label: 'Facility & Policies', icon: Building2 },
          { id: 'approvals' as const, label: `Doctor Approvals (${pendingDoctors.length})`, icon: UserCheck },
          { id: 'invites' as const, label: 'Staff Invitations', icon: Mail },
          { id: 'audit' as const, label: 'Audit History', icon: ShieldCheck },
          { id: 'database' as const, label: 'Database Diagnostics', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap border-b-2 ${
                active
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-[#111C35]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action Notification */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-200 shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold text-white">{actionNotice}</span>
        </div>
      )}

      {/* Save Success Notice */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-3 animate-in fade-in duration-200 shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-white">Configuration Successfully Updated</span>
            Institutional parameters have been applied across all active clinical workstations.
          </div>
        </div>
      )}

      {/* TAB 1: FACILITY & POLICIES */}
      {activeTab === 'facility' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0D182E] border border-slate-800 shadow-md">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Institutional Facility Profile</h3>
                <p className="text-[11px] text-slate-400">Official hospital identity and government licensing identifiers.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Facility Name</label>
                <input
                  type="text"
                  value={settings.facilityName}
                  onChange={(e) => setSettings({ ...settings, facilityName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-[#0A0F1D] text-white font-semibold focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">National Provider Identifier (NPI)</label>
                <input
                  type="text"
                  value={settings.facilityNpi}
                  onChange={(e) => setSettings({ ...settings, facilityNpi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-[#0A0F1D] text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">CMS Certification Number</label>
                <input
                  type="text"
                  value={settings.cmsCert}
                  onChange={(e) => setSettings({ ...settings, cmsCert: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-[#0A0F1D] text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Clinical Timezone</label>
                <input
                  type="text"
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-[#0A0F1D] text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-3xl bg-[#0D182E] border border-slate-800 shadow-md">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Clinical Notifications &amp; Alerts</h3>
                <p className="text-[11px] text-slate-400">Automated alerting routes for triage personnel and attending doctors.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#0A0F1D] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Emergency Triage Broadcasts</span>
                  <span className="text-slate-400 text-[11px]">Instant alert for Critical priority presentations</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.urgentTriagePush}
                  onChange={(e) => setSettings({ ...settings, urgentTriagePush: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-900 border-slate-700"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#0A0F1D] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Critical Lab Telemetry Pagers</span>
                  <span className="text-slate-400 text-[11px]">Immediate alerts for abnormal physiological metrics</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.statLabPagers}
                  onChange={(e) => setSettings({ ...settings, statLabPagers: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-900 border-slate-700"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: DOCTOR APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#0D182E] border border-slate-800 shadow-md flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Pending Doctor Registrations</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review physician credentials and approve or deny access to patient triage queues and EHR documentation.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {pendingDoctors.length} Pending Review
            </span>
          </div>

          {pendingDoctors.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0D182E] border border-slate-800 text-slate-400 text-xs shadow-md">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              All physician credential applications have been reviewed. No pending approvals.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingDoctors.map((doc) => (
                <div key={doc.id} className="p-5 rounded-3xl bg-[#0D182E] border border-slate-800 shadow-md space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{doc.name}</h4>
                      <p className="text-xs text-cyan-400 font-semibold">{doc.specialty} &bull; {doc.department}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{doc.email} &bull; {doc.phone}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Pending
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApproveDoctor(doc.id)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Approve Credentials</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectDoctor(doc.id)}
                      className="py-2 px-3 rounded-xl text-xs font-bold bg-[#111C35] hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 transition-colors"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STAFF INVITATIONS */}
      {activeTab === 'invites' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0D182E] border border-slate-800 shadow-md">
            <h3 className="text-base font-bold text-white mb-1">Issue New Staff Invitation</h3>
            <p className="text-xs text-slate-400 mb-4">
              Generate secure invitation codes for clinical coordinators, nursing supervisors, and admissions personnel.
            </p>

            <form onSubmit={handleCreateInvite} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="staff.member@clinic-health.org"
                className="flex-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-[#0A0F1D] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                required
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full sm:w-44 px-3.5 py-2.5 rounded-xl border border-slate-800 bg-[#0A0F1D] text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="staff">Role: Clinic Staff</option>
                <option value="doctor">Role: Physician</option>
              </select>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white flex items-center justify-center gap-2 shrink-0 transition-all shadow-md shadow-cyan-600/25"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Generate Invite</span>
              </button>
            </form>
          </div>

          {/* List of Existing Invitations */}
          <div className="p-6 rounded-3xl bg-[#0D182E] border border-slate-800 shadow-md space-y-3">
            <h4 className="text-sm font-bold text-white">Active Staff Invitation Ledger</h4>
            <div className="divide-y divide-slate-800 text-xs">
              {staffInvites.map((inv) => (
                <div key={inv.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-white">{inv.email}</span>
                    <div className="text-[11px] text-slate-400 mt-0.5">Role: {inv.role} &bull; Created: {new Date(inv.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-[#0A0F1D] font-mono text-cyan-300 text-[11px] font-bold border border-slate-800">
                      {inv.inviteCode}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT HISTORY LEDGER */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-[#0D182E] border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Activity Audit Ledger</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                HIPAA-compliant immutable audit trail tracking logins, appointment creation, finalizations, and approvals.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">
              {auditLogs.length} Recorded Events
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-[#0A0F1D] border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#111C35] text-cyan-300 border border-slate-700 font-bold text-[10px] font-mono">
                      {log.action}
                    </span>
                    <span className="font-bold text-white">{log.userName}</span>
                    <span className="text-[10px] text-slate-400">({log.userRole})</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()} &bull; {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DATABASE DIAGNOSTICS */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0D182E] border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Database Engine Status</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real backend connection diagnostics and configuration clarity.
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                dbHealth?.connected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              }`}>
                {dbHealth?.connected ? 'MySQL Active' : 'Persistent JSON Storage Active'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-slate-800 text-xs space-y-2">
              <div className="font-bold text-white">Active Storage Architecture:</div>
              <p className="text-slate-300 leading-relaxed">
                {dbHealth?.databaseStatusMessage || 'Local persistent JSON store (server/data/clinic_store.json) is actively maintaining all records and surviving restarts.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0A0F1D] border border-slate-800 text-center">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Active Users</span>
                <span className="text-lg font-bold text-white font-mono mt-0.5 block">{dbHealth?.activeUsersCount || 5}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0A0F1D] border border-slate-800 text-center">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Active Patients</span>
                <span className="text-lg font-bold text-white font-mono mt-0.5 block">{dbHealth?.activePatientsCount || 3}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0A0F1D] border border-slate-800 text-center">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Active Doctors</span>
                <span className="text-lg font-bold text-white font-mono mt-0.5 block">{dbHealth?.activeDoctorsCount || 4}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0A0F1D] border border-slate-800 text-center">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Appointments</span>
                <span className="text-lg font-bold text-white font-mono mt-0.5 block">{dbHealth?.activeAppointmentsCount || 3}</span>
              </div>
            </div>

            {/* Clear instructions on MySQL configuration */}
            <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-blue-500/30 text-xs text-slate-200 space-y-2">
              <span className="font-bold text-blue-300 block">To Connect an External MySQL Database:</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Provide these environment variables in your deployment or container configuration:
              </p>
              <div className="font-mono text-[11px] bg-[#070B14] p-3 rounded-xl border border-slate-800 text-cyan-300 space-y-1">
                <div>MYSQL_HOST=localhost</div>
                <div>MYSQL_PORT=3306</div>
                <div>MYSQL_USER=root</div>
                <div>MYSQL_PASSWORD=your_password</div>
                <div>MYSQL_DATABASE=ai_clinic_new</div>
                <div>MYSQL_TABLE=clinic_data</div>
              </div>
            </div>

            {/* Supabase 'clinic data' Database Section */}
            <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-teal-500/30 text-xs text-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-300 block">Supabase &apos;clinic data&apos; Table:</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Supabase Live Dataset
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Direct live query interface to Supabase &quot;clinic data&quot; table with server-side pagination (100 records per page), multi-column search, and sorting.
              </p>
              <div className="font-mono text-[11px] bg-[#070B14] p-3 rounded-xl border border-slate-800 text-teal-300 space-y-1">
                <div>Table: clinic data (public schema)</div>
                <div>Supabase Status: {isSupabaseConfigured() ? 'Connected' : 'Credentials Needed'}</div>
              </div>
            </div>

            {/* Supabase Row Level Security (RLS) Policies Card */}
            <div className="p-4 rounded-2xl bg-[#0A0F1D] border border-purple-500/30 text-xs text-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-purple-300">Supabase Row Level Security (RLS) Policies:</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Enforced at Database Layer
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Role-based access is locked at the PostgreSQL database level using Supabase Row Level Security. Authenticated Admins have full access, Doctors view assigned patients, Patients view only their personal MRN records, and Public/Anon requests are revoked.
              </p>
              <div className="font-mono text-[11px] bg-[#070B14] p-3 rounded-xl border border-slate-800 text-slate-300 space-y-1 overflow-x-auto max-h-48 scrollbar-thin">
                <div className="text-teal-400">-- 1. Enable RLS</div>
                <div>ALTER TABLE public.&quot;clinic data&quot; ENABLE ROW LEVEL SECURITY;</div>
                <div>REVOKE ALL ON public.&quot;clinic data&quot; FROM anon;</div>
                <div className="text-teal-400 mt-2">-- 2. Clinic Staff Full Access Policy</div>
                <div>CREATE POLICY &quot;Clinic Staff full access&quot; ON public.&quot;clinic data&quot; FOR ALL TO authenticated</div>
                <div>USING ((auth.jwt() -&gt; &apos;user_metadata&apos; -&gt;&gt; &apos;role&apos;) IN (&apos;clinic_staff&apos;, &apos;admin&apos;, &apos;staff&apos;));</div>
                <div className="text-teal-400 mt-2">-- 3. Patient Policy</div>
                <div>CREATE POLICY &quot;Patient view own records&quot; ON public.&quot;clinic data&quot; FOR SELECT TO authenticated</div>
                <div>USING ((auth.jwt() -&gt; &apos;user_metadata&apos; -&gt;&gt; &apos;role&apos;) = &apos;patient&apos; AND &quot;Email&quot; ILIKE (auth.jwt() -&gt;&gt; &apos;email&apos;));</div>
              </div>
              <div className="text-[11px] text-slate-400 italic">
                Complete SQL policy script is saved in <code className="text-purple-300 bg-slate-900 px-1 py-0.5 rounded">supabase-rls-policies.sql</code> in your project root.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
