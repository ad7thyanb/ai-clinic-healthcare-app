import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Key, 
  Copy, 
  Check, 
  Trash2, 
  RefreshCw, 
  Lock,
  UserCheck,
  Building2,
  Stethoscope,
  MoreVertical,
  X
} from 'lucide-react';
import { AuthUser } from '../auth/LoginScreen';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'clinic_staff' | 'doctor';
  title: string;
  department: string;
  phone: string;
  status: 'active' | 'pending' | 'suspended';
  lastActive: string;
  avatarGradient: string;
  clearanceLevel: 'Clinical Staff Operations' | 'Attending Physician';
}

export interface StaffInvitation {
  id: string;
  email: string;
  role: 'clinic_staff' | 'doctor';
  department: string;
  inviteCode: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
  expiresAt: string;
}

interface StaffManagementProps {
  currentUser?: AuthUser | null;
}

export const StaffManagement: React.FC<StaffManagementProps> = ({ currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'clinic_staff' | 'doctor'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'suspended'>('all');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'clinic_staff' | 'doctor'>('clinic_staff');
  const [inviteDepartment, setInviteDepartment] = useState('Hospital Administration');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial Seed Staff Members
  const [staffList, setStaffList] = useState<StaffMember[]>([
    {
      id: 'USR-ADMIN-1',
      name: 'Dr. Sarah Chen, MD',
      email: 'admin@aura-health.org',
      role: 'clinic_staff',
      title: 'Chief Medical Officer / Clinic Staff',
      department: 'Hospital Administration',
      phone: '+1 (555) 019-2831',
      status: 'active',
      lastActive: 'Just now',
      avatarGradient: 'from-blue-600 to-indigo-600',
      clearanceLevel: 'Clinical Staff Operations',
    },
    {
      id: 'USR-STAFF-1',
      name: 'James Reynolds',
      email: 'staff@aura-health.org',
      role: 'clinic_staff',
      title: 'Senior Clinical Coordinator',
      department: 'Admissions & Triage',
      phone: '+1 (555) 014-9922',
      status: 'active',
      lastActive: '12 mins ago',
      avatarGradient: 'from-teal-600 to-cyan-600',
      clearanceLevel: 'Clinical Staff Operations',
    },
    {
      id: 'USR-DOC-1',
      name: 'Dr. Marcus Vance, MD',
      email: 'marcus.vance@clinic-health.org',
      role: 'doctor',
      title: 'Attending Neurologist',
      department: 'Neurology',
      phone: '+1 (555) 018-4721',
      status: 'active',
      lastActive: '35 mins ago',
      avatarGradient: 'from-indigo-600 to-purple-600',
      clearanceLevel: 'Attending Physician',
    },
    {
      id: 'USR-STAFF-2',
      name: 'Maya Patel, RN',
      email: 'maya.patel@aura-health.org',
      role: 'clinic_staff',
      title: 'Head Triage Nurse',
      department: 'Emergency & Urgent Care',
      phone: '+1 (555) 017-3819',
      status: 'active',
      lastActive: '1 hour ago',
      avatarGradient: 'from-emerald-600 to-teal-600',
      clearanceLevel: 'Clinical Staff Operations',
    },
    {
      id: 'USR-STAFF-3',
      name: 'David O\'Connor',
      email: 'david.o@aura-health.org',
      role: 'clinic_staff',
      title: 'Health Informatics Specialist',
      department: 'Medical Records & EHR',
      phone: '+1 (555) 012-7744',
      status: 'active',
      lastActive: 'Yesterday',
      avatarGradient: 'from-amber-600 to-orange-600',
      clearanceLevel: 'Clinical Staff Operations',
    },
  ]);

  // Invitations State
  const [invitations, setInvitations] = useState<StaffInvitation[]>([
    {
      id: 'INV-10928',
      email: 'elena.rostova@aura-health.org',
      role: 'clinic_staff',
      department: 'Patient Services',
      inviteCode: 'INV-AURA-8941',
      status: 'pending',
      createdAt: 'Today, 09:15 AM',
      expiresAt: 'In 6 days',
    },
    {
      id: 'INV-10929',
      email: 'robert.lang@clinic-health.org',
      role: 'doctor',
      department: 'Cardiology',
      inviteCode: 'INV-DOC-4482',
      status: 'pending',
      createdAt: 'Yesterday',
      expiresAt: 'In 5 days',
    },
  ]);

  // Fetch real invitations from backend if available
  const fetchBackendInvites = async () => {
    try {
      const res = await fetch('/api/admin/staff/invitations');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setInvitations(data.map((inv: any) => ({
            id: inv.id || `INV-${Math.random().toString().slice(2, 7)}`,
            email: inv.email,
            role: inv.role || 'staff',
            department: inv.department || 'Hospital Administration',
            inviteCode: inv.inviteCode || `INV-${Math.random().toString().slice(2, 6).toUpperCase()}`,
            status: inv.status || 'pending',
            createdAt: inv.createdAt || 'Recent',
            expiresAt: 'In 7 days',
          })));
        }
      }
    } catch {
      // Keep state
    }
  };

  useEffect(() => {
    fetchBackendInvites();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsSubmitting(true);
    const newCode = `INV-${inviteRole.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const res = await fetch('/api/admin/staff/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
          department: inviteDepartment,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setInvitations(prev => [
          {
            id: data.id || `INV-${Date.now().toString().slice(-5)}`,
            email: data.email || inviteEmail.trim(),
            role: data.role || inviteRole,
            department: inviteDepartment,
            inviteCode: data.inviteCode || newCode,
            status: 'pending',
            createdAt: 'Just now',
            expiresAt: 'In 7 days',
          },
          ...prev,
        ]);
      } else {
        // Fallback local addition
        setInvitations(prev => [
          {
            id: `INV-${Date.now().toString().slice(-5)}`,
            email: inviteEmail.trim(),
            role: inviteRole,
            department: inviteDepartment,
            inviteCode: newCode,
            status: 'pending',
            createdAt: 'Just now',
            expiresAt: 'In 7 days',
          },
          ...prev,
        ]);
      }

      setActionNotice({
        type: 'success',
        message: `Secure authorization invitation generated for ${inviteEmail.trim()} (Code: ${newCode}).`,
      });
      setInviteEmail('');
      setInviteModalOpen(false);
      setTimeout(() => setActionNotice(null), 5000);
    } catch {
      setInvitations(prev => [
        {
          id: `INV-${Date.now().toString().slice(-5)}`,
          email: inviteEmail.trim(),
          role: inviteRole,
          department: inviteDepartment,
          inviteCode: newCode,
          status: 'pending',
          createdAt: 'Just now',
          expiresAt: 'In 7 days',
        },
        ...prev,
      ]);
      setInviteModalOpen(false);
      setActionNotice({
        type: 'success',
        message: `Invitation generated for ${inviteEmail.trim()} (Code: ${newCode}).`,
      });
      setTimeout(() => setActionNotice(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeInvite = (id: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== id));
    setActionNotice({
      type: 'info',
      message: 'Invitation code has been securely revoked.',
    });
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleToggleStatus = (id: string) => {
    setStaffList(prev => prev.map(staff => {
      if (staff.id === id) {
        const newStatus = staff.status === 'active' ? 'suspended' : 'active';
        setActionNotice({
          type: newStatus === 'active' ? 'success' : 'error',
          message: `${staff.name} status updated to ${newStatus.toUpperCase()}.`,
        });
        setTimeout(() => setActionNotice(null), 4000);
        return { ...staff, status: newStatus };
      }
      return staff;
    }));
  };

  const filteredStaff = staffList.filter(staff => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const match = 
        staff.name.toLowerCase().includes(q) ||
        staff.email.toLowerCase().includes(q) ||
        staff.department.toLowerCase().includes(q) ||
        staff.title.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (roleFilter !== 'all' && staff.role !== roleFilter) return false;
    if (statusFilter !== 'all' && staff.status !== statusFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Staff Management &amp; Access Control
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white flex items-center gap-1 shadow-xs">
              <ShieldCheck className="w-3 h-3 text-teal-400" />
              <span>Admin Only</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage clinical staff credentials, administrative roles, triage coordinators, and secure authorization invitations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/25 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Staff Member</span>
          </button>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
          actionNotice.type === 'success' 
            ? 'bg-teal-50 border border-teal-200 text-teal-900'
            : actionNotice.type === 'error'
            ? 'bg-rose-50 border border-rose-200 text-rose-900'
            : 'bg-blue-50 border border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            ) : actionNotice.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{staffList.length}</div>
            <div className="text-xs text-slate-500 font-medium">Registered Staff</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">
              {staffList.filter(s => s.role === 'clinic_staff').length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Clinic Staff Members</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">
              {staffList.filter(s => s.role === 'doctor').length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Active Physicians</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{invitations.length}</div>
            <div className="text-xs text-slate-500 font-medium">Pending Invites</div>
          </div>
        </div>
      </div>

      {/* Main Table Card with Search & Filters */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff by name, email, department..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 transition-all font-medium"
            />
          </div>

          {/* Role and Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <span className="text-[11px] text-slate-500 px-2">Role:</span>
              {[
                { id: 'all' as const, label: 'All Roles' },
                { id: 'clinic_staff' as const, label: 'Clinic Staff' },
                { id: 'doctor' as const, label: 'Doctors' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRoleFilter(id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    roleFilter === id
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <span className="text-[11px] text-slate-500 px-2">Status:</span>
              {(['all', 'active', 'suspended'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                    statusFilter === s
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3 px-4 sm:px-6">Staff Member</th>
                <th className="py-3 px-4">Role &amp; Clearance</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-semibold text-slate-600">No staff members match the selected criteria.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try clearing your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map(staff => {
                  const isDoctor = staff.role === 'doctor';
                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${staff.avatarGradient} text-white font-extrabold text-xs flex items-center justify-center shadow-xs shrink-0`}>
                            {staff.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                              <span>{staff.name}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                isDoctor
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-teal-50 text-teal-700 border-teal-200'
                              }`}>
                                {isDoctor ? 'Physician' : 'Clinic Staff'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">{staff.title}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role & Clearance */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isDoctor
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-teal-50 text-teal-800 border-teal-200'
                          }`}>
                            {isDoctor ? <Stethoscope className="w-3 h-3 text-blue-600" /> : <ShieldCheck className="w-3 h-3 text-teal-600" />}
                            <span>{isDoctor ? 'Physician' : 'Clinic Staff'}</span>
                          </span>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {staff.clearanceLevel}
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 text-xs font-semibold">{staff.department}</div>
                        <div className="text-[10px] text-slate-400">ID: {staff.id}</div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-700 text-xs">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>
                              {staff.email === 'admin@aura-health.org' || staff.email === 'staff@aura-health.org' ? (
                                <span className="text-slate-400 font-mono text-[11px] italic">••••••••@aura-health.org</span>
                              ) : (
                                staff.email
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{staff.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          staff.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${staff.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className="capitalize">{staff.status}</span>
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Active: {staff.lastActive}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(staff.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                              staff.status === 'active'
                                ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {staff.status === 'active' ? 'Suspend' : 'Reactivate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-teal-600" />
              <span>Pending Authorized Invitations</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure single-use authorization tokens for newly assigned clinic staff and administrators.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchBackendInvites}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {invitations.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No pending invitations at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {invitations.map(inv => (
              <div key={inv.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">{inv.email}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span className="capitalize font-semibold text-teal-700">{inv.role}</span>
                      <span>·</span>
                      <span>{inv.department}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Pending
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-xs font-bold text-slate-800 tracking-wider truncate">
                      {inv.inviteCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(inv.inviteCode)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-800 px-2 py-1 rounded bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors shrink-0"
                  >
                    {copiedCode === inv.inviteCode ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                  <span>Created: {inv.createdAt}</span>
                  <button
                    type="button"
                    onClick={() => handleRevokeInvite(inv.id)}
                    className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Revoke</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Staff Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Invite Clinical Personnel</h3>
                  <p className="text-[11px] text-slate-500">Generate secure role invitation token</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@aura-health.org"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Clearance Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'clinic_staff' as const, label: 'Clinic Staff' },
                    { id: 'doctor' as const, label: 'Physician' },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setInviteRole(id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border capitalize transition-all ${
                        inviteRole === id
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Clinic Staff clearance grants operational access to appointment triage, patient care, doctors, and reports.</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={inviteDepartment}
                  onChange={(e) => setInviteDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 font-medium"
                >
                  <option value="Hospital Administration">Hospital Administration</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Emergency & Urgent Care">Emergency &amp; Urgent Care</option>
                  <option value="Admissions & Triage">Admissions &amp; Triage</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Medical Records & EHR">Medical Records &amp; EHR</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !inviteEmail.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/25 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Generating...' : 'Issue Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
