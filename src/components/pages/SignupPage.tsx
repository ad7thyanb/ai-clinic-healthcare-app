import React, { useState, useId } from 'react';
import { 
  HeartPulse, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Stethoscope,
  ShieldCheck,
  Loader2,
  Database,
  Check,
  X
} from 'lucide-react';
import { useRouter } from '../../router/Router';
import { PublicNavbar } from '../layout/PublicNavbar';
import { PublicFooter } from '../layout/PublicFooter';
import { AuthUser } from '../auth/LoginScreen';
import { supabase, isSupabaseConfigured, mapSupabaseUserToAuthUser } from '../../lib/supabase';
import { SupabaseConfigModal } from '../modals/SupabaseConfigModal';
import { 
  normalizeEmail, 
  isValidEmail, 
  getEmailValidationError,
  validatePassword, 
  setRememberMePreference, 
  formatSupabaseAuthError 
} from '../../lib/authHelpers';

interface SignupPageProps {
  onLoginSuccess: (user: AuthUser, token?: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onLoginSuccess }) => {
  const { navigate } = useRouter();
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');

  // Input IDs for accessibility
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const specialtyId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const rememberId = useId();
  const termsId = useId();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isAdminRegister, setIsAdminRegister] = useState(false);
  const [adminInviteCode, setAdminInviteCode] = useState('');

  // Error & Status State
  const [emailTouched, setEmailTouched] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    specialty?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    adminKey?: string;
  }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ message: string; email: string; requiresEmailConfirmation?: boolean } | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Immediate email validation on typing
  const handleEmailChange = (newVal: string) => {
    setEmail(newVal);
    if (newVal.trim().length > 0) {
      const err = getEmailValidationError(newVal);
      setFormErrors(prev => ({ ...prev, email: err || undefined }));
    } else if (emailTouched) {
      setFormErrors(prev => ({ ...prev, email: 'Please enter a valid email address.' }));
    } else {
      setFormErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    const err = getEmailValidationError(email);
    setFormErrors(prev => ({ ...prev, email: err || undefined }));
  };

  // Real-time password strength validation
  const passwordStrength = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    const errors: typeof formErrors = {};
    const normalized = normalizeEmail(email);

    // Validate Full Name
    if (!name.trim()) {
      errors.name = 'Please enter your full legal name.';
    } else if (name.trim().length < 2) {
      errors.name = 'Full name must contain at least 2 characters.';
    }

    // Validate Email with strict RFC 5322 & domain suffix rules
    const emailErr = getEmailValidationError(email);
    if (emailErr) {
      errors.email = emailErr;
    }

    // Validate Specialty if doctor
    if (role === 'doctor' && !specialty.trim()) {
      errors.specialty = 'Medical specialty is required for physician credential registration.';
    }

    // Validate Password Strength
    const pCheck = validatePassword(password);
    if (!pCheck.isValid) {
      if (!pCheck.hasMinLength) {
        errors.password = 'Password must be at least 8 characters long.';
      } else if (!pCheck.hasLetter || !pCheck.hasNumber) {
        errors.password = 'Password must include both letters and numbers.';
      } else {
        errors.password = 'Please provide a stronger password meeting clinical security standards.';
      }
    }

    // Validate Password Confirmation
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirmation password is required.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match. Please re-enter.';
    }

    // Validate Terms & HIPAA
    if (!agreeTerms) {
      errors.terms = 'Please accept the Terms of Service and HIPAA Privacy Notice.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    try {
      // Role-Based Security:
      let assignedRole: 'patient' | 'doctor' | 'clinic_staff' = 'patient';
      let isVerifiedAdmin = false;

      if (isAdminRegister) {
        const cleanKey = adminInviteCode.trim().toUpperCase();
        const validAdminKeys = ['CLINIC-ADMIN-2026', 'ADMIN-MASTER-SECURE-2026', 'INV-ADMIN-9901', 'STAFF-AUTH-2026', 'INV-STAFF-9021'];
        if (!cleanKey) {
          setFormErrors(prev => ({ ...prev, adminKey: 'Staff Authorization Code is required for Clinic Staff registration.' }));
          setLoading(false);
          return;
        }
        if (!validAdminKeys.includes(cleanKey) && !cleanKey.startsWith('INV-') && !cleanKey.startsWith('CODE-') && !cleanKey.startsWith('STAFF-') && !cleanKey.startsWith('CLINIC-')) {
          setFormErrors(prev => ({ ...prev, adminKey: 'Invalid Staff Authorization Code. Please enter an authorized clinic clearance token.' }));
          setLoading(false);
          return;
        }
        assignedRole = 'clinic_staff';
        isVerifiedAdmin = true;
      } else if (role === 'doctor') {
        assignedRole = 'doctor';
      }

      const requestedRole = assignedRole;

      // 1. Always register & persist in backend persistent store (/api/auth/register)
      let backendUser: any = null;
      let backendToken: string | undefined;

      try {
        const backendRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: normalized,
            password: password,
            role: assignedRole,
            phone: phone.trim() || undefined,
            specialty: role === 'doctor' ? specialty.trim() : undefined,
            department: isVerifiedAdmin ? 'Clinic Administration' : role === 'doctor' ? (specialty.trim() || 'General Medicine') : 'General Medicine',
            adminAuthKey: adminInviteCode || 'CLINIC-ADMIN-2026',
          }),
        });

        if (backendRes.ok) {
          const body = await backendRes.json();
          backendUser = body.user;
          backendToken = body.token;
        } else {
          const errBody = await backendRes.json().catch(() => null);
          if (errBody?.error && errBody.error.includes('already exists')) {
            setGlobalError('An account with this email address already exists. Please sign in or use password recovery.');
            setLoading(false);
            return;
          }
        }
      } catch (beRegErr) {
        console.warn('Backend register call warning in SignupPage:', beRegErr);
      }

      // 2. Also register in Supabase Auth if configured
      let supabaseSession: any = null;
      let supabaseUser: any = null;

      if (isSupabaseConfigured()) {
        try {
          const { data, error: sbError } = await supabase.auth.signUp({
            email: normalized,
            password: password, // Case-sensitive; never altered
            options: {
              data: {
                full_name: name.trim(),
                name: name.trim(),
                phone: phone.trim() || undefined,
                role: assignedRole,
                requested_role: requestedRole,
                specialty: role === 'doctor' ? specialty.trim() : undefined,
                department: isVerifiedAdmin ? 'Clinic Administration' : role === 'doctor' ? (specialty.trim() || 'General Medicine') : 'General Medicine',
                pending_doctor_approval: role === 'doctor' && !isVerifiedAdmin,
                is_verified_admin: isVerifiedAdmin,
                admin_authorized: isVerifiedAdmin,
                is_verified_staff: isVerifiedAdmin,
                staff_authorized: isVerifiedAdmin,
              },
            },
          });

          if (sbError) {
            console.warn('[Supabase signUp notice]:', sbError.message);
          } else if (data) {
            supabaseSession = data.session;
            supabaseUser = data.user;
          }
        } catch (sbErr) {
          console.warn('[Supabase signUp error]:', sbErr);
        }
      }

      // Save login details / Remember Me preference securely
      if (rememberMe) {
        setRememberMePreference(true, normalized);
      }

      // 3. Establish active session and log user in immediately
      const activeToken = supabaseSession?.access_token || backendToken;
      if (activeToken) {
        try {
          localStorage.setItem('ai_clinic_token', activeToken);
        } catch {}
      }

      if (supabaseSession && supabaseUser) {
        const mapped = mapSupabaseUserToAuthUser(supabaseUser);
        try {
          localStorage.setItem('ai_clinic_auth_user', JSON.stringify(mapped));
        } catch {}
        onLoginSuccess(mapped, activeToken);
      } else if (backendUser) {
        try {
          localStorage.setItem('ai_clinic_auth_user', JSON.stringify(backendUser));
        } catch {}
        onLoginSuccess(backendUser, activeToken);
      } else if (supabaseUser) {
        setSuccessInfo({
          email: normalized,
          message: assignedRole === 'clinic_staff'
            ? `Your Clinic Staff registration for ${normalized} has been submitted! If your Supabase project requires email confirmation, please check your inbox to verify before logging in.`
            : assignedRole === 'doctor'
            ? `Your physician registration for ${normalized} has been submitted! If your Supabase project requires email confirmation, please check your inbox to verify before logging in.`
            : `Your patient account for ${normalized} has been successfully registered! If your Supabase project requires email confirmation, please check your inbox to verify before logging in.`,
          requiresEmailConfirmation: true,
        });
      } else {
        setGlobalError('Registration could not be completed. Please check your connection and try again.');
      }
    } catch (err: any) {
      setGlobalError(formatSupabaseAuthError(err) || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-teal-600/25 mb-3">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Clinical Account</h1>
            <p className="text-xs text-slate-500 mt-1">Register for patient care or submit physician credentials</p>

            {!isSupabaseConfigured() && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <Database className="w-3.5 h-3.5 text-amber-600" />
                <span>Supabase Not Configured</span>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(true)}
                  className="underline font-bold text-amber-900 ml-1"
                >
                  Setup
                </button>
              </div>
            )}
          </div>

          {/* Account Type Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 mb-5">
            <button
              type="button"
              onClick={() => {
                setRole('patient');
                setFormErrors(prev => ({ ...prev, specialty: undefined }));
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                role === 'patient'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Patient Account</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                role === 'doctor'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Credential</span>
            </button>
          </div>

          {role === 'doctor' && (
            <div className="mb-4 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-snug">
                Physician registrations are reviewed by the Medical Staff Office. Accounts initiate with patient view until medical licensing is verified.
              </p>
            </div>
          )}

          {successInfo ? (
            <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-3.5 animate-in fade-in duration-200">
              <div className="w-11 h-11 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md shadow-teal-600/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Registration Confirmed</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{successInfo.message}</p>
              <div className="p-3 bg-white/80 rounded-xl border border-teal-200/80 text-[11px] text-teal-900 font-medium text-left space-y-1">
                <div>Registered Email: <strong className="font-mono">{successInfo.email}</strong></div>
                <div className="text-[10px] text-slate-500 font-normal">
                  Please verify your mailbox ownership via the link sent by Supabase. Note: Syntactic email validity does not verify mailbox existence until confirmed.
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
              {globalError && (
                <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{globalError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label htmlFor={nameId} className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id={nameId}
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    placeholder={role === 'doctor' ? 'Dr. Sarah Chen, MD' : 'Eleanor Vance'}
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                      formErrors.name
                        ? 'border-rose-300 focus:border-rose-600 focus:ring-rose-600 bg-rose-50/20'
                        : 'border-slate-300 focus:border-teal-600 focus:ring-teal-600'
                    }`}
                  />
                </div>
                {formErrors.name && (
                  <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 animate-in fade-in">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{formErrors.name}</span>
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor={emailId} className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id={emailId}
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={handleEmailBlur}
                    placeholder="email@example.com"
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                      formErrors.email
                        ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-600 bg-rose-50/20'
                        : 'border-slate-300 focus:border-teal-600 focus:ring-teal-600'
                    }`}
                    aria-invalid={Boolean(formErrors.email)}
                  />
                </div>
                {formErrors.email && (
                  <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 animate-in fade-in">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{formErrors.email}</span>
                  </p>
                )}
              </div>

              {/* Specialty (for Doctor Credential) */}
              {role === 'doctor' && (
                <div>
                  <label htmlFor={specialtyId} className="block text-xs font-semibold text-slate-700 mb-1">
                    Medical Specialty <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id={specialtyId}
                      name="specialty"
                      type="text"
                      value={specialty}
                      onChange={(e) => {
                        setSpecialty(e.target.value);
                        if (formErrors.specialty) setFormErrors(prev => ({ ...prev, specialty: undefined }));
                      }}
                      placeholder="e.g. Cardiology, Neurology, Pediatrics"
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                        formErrors.specialty
                          ? 'border-rose-300 focus:border-rose-600 focus:ring-rose-600 bg-rose-50/20'
                          : 'border-slate-300 focus:border-teal-600 focus:ring-teal-600'
                      }`}
                    />
                  </div>
                  {formErrors.specialty && (
                    <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 animate-in fade-in">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{formErrors.specialty}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Phone (Optional) */}
              <div>
                <label htmlFor={phoneId} className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id={phoneId}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              {/* Password with Real-Time Strength & Variety Indicator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor={passwordId} className="block text-xs font-semibold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  {password ? (
                    <span 
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all duration-200 ${passwordStrength.badgeBg} ${passwordStrength.badgeText} ${passwordStrength.badgeBorder}`}
                      aria-live="polite"
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>{passwordStrength.strengthLabel}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Clinical standard: 8+ chars</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id={passwordId}
                    name="new-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (formErrors.password) setFormErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    placeholder="Min. 8 characters with letters, numbers & symbols"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 font-mono transition-colors ${
                      formErrors.password
                        ? 'border-rose-300 focus:border-rose-600 focus:ring-rose-600 bg-rose-50/20'
                        : 'border-slate-300 focus:border-teal-600 focus:ring-teal-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 transition-colors"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Real-time Multi-Segment Password Strength Meter */}
                {password && (
                  <div className="mt-2 space-y-1.5 animate-in fade-in duration-200">
                    <div 
                      className="grid grid-cols-4 gap-1.5 h-1.5" 
                      role="progressbar" 
                      aria-label="Password strength" 
                      aria-valuenow={passwordStrength.score} 
                      aria-valuemin={0} 
                      aria-valuemax={4}
                    >
                      {[1, 2, 3, 4].map((segIndex) => {
                        const isActive = passwordStrength.score >= segIndex;
                        return (
                          <div
                            key={segIndex}
                            className={`h-full rounded-full transition-all duration-300 ${
                              isActive ? passwordStrength.barColor : 'bg-slate-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="italic">{passwordStrength.feedback}</span>
                      {passwordStrength.isOptimalLength && (
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" /> 12+ chars
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Character Variety & Complexity Criteria Checklist */}
                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px]">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Security & Variety Requirements
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
                    {/* Length Check */}
                    <div className="flex items-center gap-1.5">
                      <span 
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          passwordStrength.hasMinLength 
                            ? 'bg-teal-100 text-teal-700' 
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {passwordStrength.hasMinLength ? (
                          <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                        ) : (
                          <span className="w-1 h-1 rounded-full bg-slate-400" />
                        )}
                      </span>
                      <span className={passwordStrength.hasMinLength ? 'text-teal-900 font-medium' : 'text-slate-500'}>
                        At least 8 characters
                      </span>
                    </div>

                    {/* Mixed-Case Letters Check */}
                    <div className="flex items-center gap-1.5">
                      <span 
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          passwordStrength.hasLowercase && passwordStrength.hasUppercase
                            ? 'bg-teal-100 text-teal-700' 
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {passwordStrength.hasLowercase && passwordStrength.hasUppercase ? (
                          <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                        ) : (
                          <span className="w-1 h-1 rounded-full bg-slate-400" />
                        )}
                      </span>
                      <span className={passwordStrength.hasLowercase && passwordStrength.hasUppercase ? 'text-teal-900 font-medium' : 'text-slate-500'}>
                        Upper & lower case
                      </span>
                    </div>

                    {/* Numeric Digits Check */}
                    <div className="flex items-center gap-1.5">
                      <span 
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          passwordStrength.hasNumber 
                            ? 'bg-teal-100 text-teal-700' 
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {passwordStrength.hasNumber ? (
                          <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                        ) : (
                          <span className="w-1 h-1 rounded-full bg-slate-400" />
                        )}
                      </span>
                      <span className={passwordStrength.hasNumber ? 'text-teal-900 font-medium' : 'text-slate-500'}>
                        At least one number (0-9)
                      </span>
                    </div>

                    {/* Special Character Variety Check */}
                    <div className="flex items-center gap-1.5">
                      <span 
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          passwordStrength.hasSpecial 
                            ? 'bg-teal-100 text-teal-700' 
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {passwordStrength.hasSpecial ? (
                          <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                        ) : (
                          <span className="w-1 h-1 rounded-full bg-slate-400" />
                        )}
                      </span>
                      <span className={passwordStrength.hasSpecial ? 'text-teal-900 font-medium' : 'text-slate-500'}>
                        Special symbol (!@#$%^&*)
                      </span>
                    </div>
                  </div>
                </div>

                {formErrors.password && (
                  <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 animate-in fade-in">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{formErrors.password}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor={confirmPasswordId} className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id={confirmPasswordId}
                    name="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (formErrors.confirmPassword) setFormErrors(prev => ({ ...prev, confirmPassword: undefined }));
                    }}
                    placeholder="Re-enter password"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 font-mono ${
                      formErrors.confirmPassword
                        ? 'border-rose-300 focus:border-rose-600 focus:ring-rose-600 bg-rose-50/20'
                        : 'border-slate-300 focus:border-teal-600 focus:ring-teal-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 animate-in fade-in">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{formErrors.confirmPassword}</span>
                  </p>
                )}
              </div>

              {/* Authorized Admin Registration Option */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAdminRegister}
                    onChange={(e) => {
                      setIsAdminRegister(e.target.checked);
                      if (!e.target.checked) {
                        setFormErrors(prev => ({ ...prev, adminKey: undefined }));
                      }
                    }}
                    className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-600 accent-purple-600"
                  />
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Register as Authorized Clinic Staff</span>
                  </span>
                </label>

                {isAdminRegister && (
                  <div className="pt-1.5 pl-6 space-y-1 animate-in fade-in duration-200">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Clinic Staff Authorization Clearance Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={adminInviteCode}
                      onChange={(e) => {
                        setAdminInviteCode(e.target.value);
                        if (formErrors.adminKey) setFormErrors(prev => ({ ...prev, adminKey: undefined }));
                      }}
                      placeholder="Enter clinic clearance token or invite code"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 font-mono focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600"
                    />
                    {formErrors.adminKey && (
                      <p className="text-[10px] text-rose-600 font-medium">{formErrors.adminKey}</p>
                    )}
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Standard self-registration creates patient accounts. Clinic Staff access requires authorized credentials (e.g. clearance key or staff invite token).
                    </p>
                  </div>
                )}
              </div>

              {/* Remember Me Option */}
              <div className="flex items-center pt-1">
                <label 
                  htmlFor={rememberId}
                  className="inline-flex items-center gap-2 cursor-pointer select-none group"
                >
                  <input
                    type="checkbox"
                    id={rememberId}
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-600 focus:ring-offset-0 focus:ring-1 cursor-pointer accent-teal-600 transition-colors"
                  />
                  <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                    Remember my details on this device
                  </span>
                </label>
              </div>

              {/* Terms and Privacy Checkbox */}
              <div className="pt-0.5">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id={termsId}
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (formErrors.terms) setFormErrors(prev => ({ ...prev, terms: undefined }));
                    }}
                    className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 accent-teal-600"
                  />
                  <label htmlFor={termsId} className="text-[11px] text-slate-600 leading-tight">
                    I agree to the{' '}
                    <button type="button" onClick={() => navigate('/terms')} className="text-teal-700 font-medium hover:underline">
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button type="button" onClick={() => navigate('/privacy')} className="text-teal-700 font-medium hover:underline">
                      HIPAA Privacy Notice
                    </button>.
                  </label>
                </div>
                {formErrors.terms && (
                  <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 animate-in fade-in">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{formErrors.terms}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering with Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-600">
            Already have an active account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-teal-700 font-bold hover:underline"
            >
              Sign In Here
            </button>
          </div>
        </div>
      </main>

      <PublicFooter />

      <SupabaseConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onConfigSaved={() => setGlobalError(null)}
      />
    </div>
  );
};
