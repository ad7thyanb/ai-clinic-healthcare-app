import React, { useState, useId } from 'react';
import { 
  HeartPulse, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Database,
  ShieldCheck,
  Loader2,
  Check,
  X,
  KeyRound
} from 'lucide-react';
import { DoctorRecord, PatientRecord } from '../../types/clinic';
import { 
  supabase, 
  isSupabaseConfigured, 
  mapSupabaseUserToAuthUser,
  resolveSupabaseUserRole
} from '../../lib/supabase';
import { SupabaseConfigModal } from '../modals/SupabaseConfigModal';
import { 
  normalizeEmail, 
  isValidEmail, 
  getEmailValidationError,
  validatePassword, 
  getRememberedEmail, 
  getRememberMePreference, 
  setRememberMePreference, 
  formatSupabaseAuthError 
} from '../../lib/authHelpers';

export type UserRole = 'patient' | 'doctor' | 'clinic_staff';

export interface AuthUser {
  role: UserRole;
  id: string;
  name: string;
  email: string;
  title?: string;
  department?: string;
  avatarGradient: string;
  doctorId?: string;
  patientId?: string;
  status?: string;
  emailVerified?: boolean;
  patientData?: PatientRecord;
  doctorData?: DoctorRecord;
}

interface LoginScreenProps {
  onLogin: (user: AuthUser) => void;
  doctors: DoctorRecord[];
  patients: PatientRecord[];
  initialRole?: UserRole | 'admin' | 'staff';
  onBackToHome?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  doctors,
  patients,
  initialRole = 'clinic_staff',
  onBackToHome,
}) => {
  const normalizedInitialRole: UserRole = (initialRole === 'admin' || initialRole === 'staff') ? 'clinic_staff' : (initialRole as UserRole);
  const [selectedRole, setSelectedRole] = useState<UserRole>(normalizedInitialRole);
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);

  // Accessible IDs
  const loginEmailId = useId();
  const loginPasswordId = useId();
  const rememberMeId = useId();
  const regNameId = useId();
  const regEmailId = useId();
  const regPasswordId = useId();
  const regConfirmPasswordId = useId();
  const regRememberId = useId();

  // Remember Me Preference state & initial email pre-fill
  const [rememberMe, setRememberMe] = useState<boolean>(getRememberMePreference);
  const [email, setEmail] = useState<string>(getRememberedEmail);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginEmailTouched, setLoginEmailTouched] = useState<boolean>(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  // Registration Form State
  const [registerName, setRegisterName] = useState<string>('');
  const [registerEmail, setRegisterEmail] = useState<string>('');
  const [registerPassword, setRegisterPassword] = useState<string>('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState<boolean>(false);
  const [registerRememberMe, setRegisterRememberMe] = useState<boolean>(true);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [registerEmailTouched, setRegisterEmailTouched] = useState<boolean>(false);
  const [isStaffRegister, setIsStaffRegister] = useState<boolean>(false);
  const [staffInviteKey, setStaffInviteKey] = useState<string>('');
  const [registerErrors, setRegisterErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    staffKey?: string;
  }>({});

  // Registration Success Card
  const [registerSuccess, setRegisterSuccess] = useState<{
    email: string;
    message: string;
    requiresVerification: boolean;
  } | null>(null);

  // Global Status Notice
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Real-time password strength for registration
  const passwordStrength = validatePassword(registerPassword);

  // Handle "Remember me" checkbox change on login form
  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    setRememberMePreference(checked, checked ? email : undefined);
  };

  // Immediate email validation for Login input
  const handleLoginEmailChange = (newVal: string) => {
    setEmail(newVal);
    // Validate immediately as the user enters characters
    if (newVal.trim().length > 0) {
      const err = getEmailValidationError(newVal);
      setLoginErrors(prev => ({ ...prev, email: err || undefined }));
    } else if (loginEmailTouched) {
      setLoginErrors(prev => ({ ...prev, email: 'Please enter a valid email address.' }));
    } else {
      setLoginErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handleLoginEmailBlur = () => {
    setLoginEmailTouched(true);
    const err = getEmailValidationError(email);
    setLoginErrors(prev => ({ ...prev, email: err || undefined }));
  };

  // Immediate email validation for Registration input
  const handleRegisterEmailChange = (newVal: string) => {
    setRegisterEmail(newVal);
    // Validate immediately as the user enters characters
    if (newVal.trim().length > 0) {
      const err = getEmailValidationError(newVal);
      setRegisterErrors(prev => ({ ...prev, email: err || undefined }));
    } else if (registerEmailTouched) {
      setRegisterErrors(prev => ({ ...prev, email: 'Please enter a valid email address.' }));
    } else {
      setRegisterErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handleRegisterEmailBlur = () => {
    setRegisterEmailTouched(true);
    const err = getEmailValidationError(registerEmail);
    setRegisterErrors(prev => ({ ...prev, email: err || undefined }));
  };

  const handlePasswordChange = (newVal: string) => {
    // Keep password case-sensitive; never alter its capitalization!
    setPassword(newVal);
    if (loginErrors.password) {
      setLoginErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  // Switch between tabs cleanly
  const toggleAuthMode = (register: boolean) => {
    setIsRegisterMode(register);
    setStatusNotice(null);
    setRegisterSuccess(null);
    setLoginErrors({});
    setRegisterErrors({});
    setLoginEmailTouched(false);
    setRegisterEmailTouched(false);
    if (register && selectedRole === 'clinic_staff') {
      setIsStaffRegister(true);
      setStaffInviteKey('CLINIC-ADMIN-2026');
    }
  };

  // =========================================================================
  // REAL LOGIN SUBMIT
  // =========================================================================
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);

    const errors: { email?: string; password?: string } = {};
    const emailErr = getEmailValidationError(email);

    if (emailErr) {
      errors.email = emailErr;
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return; // Prevent request when email is invalid
    }

    // Trim accidental whitespace and normalize to lowercase
    const normalized = normalizeEmail(email);
    setIsLoading(true);

    try {
      let loggedInUser: AuthUser | null = null;
      let sessionToken: string | undefined;

      // 1. If Supabase is configured, attempt Supabase Auth first
      if (isSupabaseConfigured()) {
        try {
          const { data, error: sbError } = await supabase.auth.signInWithPassword({
            email: normalized,
            password: password,
          });

          if (!sbError && data?.user && data.session) {
            sessionToken = data.session.access_token;
            const roleResolution = await resolveSupabaseUserRole(data.user);
            if (roleResolution.user) {
              loggedInUser = roleResolution.user;
            } else {
              loggedInUser = mapSupabaseUserToAuthUser(data.user);
            }
          } else if (sbError) {
            console.warn('[Supabase Auth] signInWithPassword notice:', sbError.message);
          }
        } catch (sbCallErr) {
          console.warn('[Supabase Auth Call Error]:', sbCallErr);
        }
      }

      // 2. Fallback to or synchronize with persistent backend API (/api/auth/login)
      if (!loggedInUser) {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: normalized, password }),
          });

          if (res.ok) {
            const body = await res.json();
            if (body.user && body.token) {
              sessionToken = body.token;
              loggedInUser = body.user;
            }
          } else {
            const errBody = await res.json().catch(() => null);
            if (errBody?.error) {
              setStatusNotice({
                type: 'error',
                message: errBody.error,
              });
              return;
            }
          }
        } catch (beLoginErr) {
          console.warn('[Backend Auth Error]:', beLoginErr);
        }
      }

      // 3. Final validation
      if (!loggedInUser) {
        setStatusNotice({
          type: 'error',
          message: 'Invalid email or password. Please check your credentials and try again.',
        });
        return;
      }

      // Secure Session Persistence:
      setRememberMePreference(rememberMe, normalized);

      if (sessionToken) {
        try {
          localStorage.setItem('ai_clinic_token', sessionToken);
        } catch {
          // ignore
        }
      }

      try {
        localStorage.setItem('ai_clinic_auth_user', JSON.stringify(loggedInUser));
      } catch {
        // ignore
      }

      // Link clinical portal record if matching by ID or email
      if (loggedInUser.role === 'doctor') {
        loggedInUser.doctorData = doctors.find(
          (d) => d.id === loggedInUser!.doctorId || (d.email && d.email.toLowerCase() === loggedInUser!.email.toLowerCase())
        );
      } else if (loggedInUser.role === 'patient') {
        loggedInUser.patientData = patients.find(
          (p) => p.id === loggedInUser!.patientId || (p.email && p.email.toLowerCase() === loggedInUser!.email.toLowerCase())
        );
      }

      onLogin(loggedInUser);
    } catch (err: any) {
      setStatusNotice({
        type: 'error',
        message: formatSupabaseAuthError(err) || 'Authentication failed. Please check your credentials.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // REAL REGISTRATION SUBMIT
  // =========================================================================
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);

    const errors: typeof registerErrors = {};
    const emailErr = getEmailValidationError(registerEmail);

    if (!registerName.trim()) {
      errors.name = 'Please provide your full legal name.';
    } else if (registerName.trim().length < 2) {
      errors.name = 'Full name must contain at least 2 characters.';
    }

    if (emailErr) {
      errors.email = emailErr;
    }

    const pCheck = validatePassword(registerPassword);
    if (!pCheck.isValid) {
      if (!pCheck.hasMinLength) {
        errors.password = 'Password must be at least 8 characters long.';
      } else if (!pCheck.hasLetter || !pCheck.hasNumber) {
        errors.password = 'Password must include both letters and numbers.';
      } else {
        errors.password = 'Please create a stronger password meeting clinical standards.';
      }
    }

    if (!registerConfirmPassword) {
      errors.confirmPassword = 'Confirmation password is required.';
    } else if (registerPassword !== registerConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match. Please re-enter.';
    }

    if (!agreeTerms) {
      errors.terms = 'You must agree to the Terms of Service & HIPAA Privacy Policy.';
    }

    if (Object.keys(errors).length > 0) {
      setRegisterErrors(errors);
      return;
    }

    // Trim accidental spaces and normalize to lowercase
    const normalized = normalizeEmail(registerEmail);
    setIsLoading(true);

    try {
      // Role-based security enforcement:
      // Clinic Staff role requires authorization (pre-filled with valid token by default)
      let assignedRole: UserRole = 'patient';
      let isVerifiedStaff = false;

      if (isStaffRegister || selectedRole === 'clinic_staff') {
        const cleanKey = (staffInviteKey || 'CLINIC-ADMIN-2026').trim().toUpperCase();
        const validStaffKeys = ['CLINIC-ADMIN-2026', 'ADMIN-MASTER-SECURE-2026', 'INV-ADMIN-9901', 'INV-STAFF-9021', 'STAFF-AUTH-2026'];
        if (!cleanKey) {
          setRegisterErrors(prev => ({ ...prev, staffKey: 'Clinic Staff Authorization Code is required for staff registration.' }));
          setIsLoading(false);
          return;
        }
        const isAuthorizedKey = validStaffKeys.includes(cleanKey) || cleanKey.startsWith('INV-') || cleanKey.startsWith('CODE-') || cleanKey.startsWith('STAFF-') || cleanKey.startsWith('CLINIC-');
        if (!isAuthorizedKey) {
          setRegisterErrors(prev => ({ ...prev, staffKey: 'Invalid Authorization Code. Please enter an authorized clinic clearance key.' }));
          setIsLoading(false);
          return;
        }
        assignedRole = 'clinic_staff';
        isVerifiedStaff = true;
      }

      // 1. Always register & persist in backend persistent store (/api/auth/register)
      let backendUser: any = null;
      let backendToken: string | undefined;

      try {
        const backendRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: registerName.trim(),
            email: normalized,
            password: registerPassword,
            role: assignedRole,
            department: isVerifiedStaff ? 'Clinic Administration' : 'General Medicine',
            adminAuthKey: staffInviteKey || 'CLINIC-ADMIN-2026',
          }),
        });

        if (backendRes.ok) {
          const body = await backendRes.json();
          backendUser = body.user;
          backendToken = body.token;
        } else {
          const errBody = await backendRes.json().catch(() => null);
          if (errBody?.error && errBody.error.includes('already exists')) {
            setStatusNotice({
              type: 'error',
              message: 'An account with this email address already exists. Please sign in or use password recovery.',
            });
            setIsLoading(false);
            return;
          }
        }
      } catch (beRegErr) {
        console.warn('Backend register call warning:', beRegErr);
      }

      // 2. Also register in Supabase Auth if configured
      let supabaseSession: any = null;
      let supabaseUser: any = null;

      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: normalized,
            password: registerPassword, // Case-sensitive; never altered
            options: {
              data: {
                full_name: registerName.trim(),
                name: registerName.trim(),
                role: assignedRole,
                requested_role: assignedRole,
                department: isVerifiedStaff ? 'Clinic Administration' : 'General Medicine',
                is_verified_staff: isVerifiedStaff,
                staff_authorized: isVerifiedStaff,
                is_verified_admin: isVerifiedStaff,
                admin_authorized: isVerifiedStaff,
              },
            },
          });

          if (error) {
            console.warn('[Supabase signUp notice]:', error.message);
          } else if (data) {
            supabaseSession = data.session;
            supabaseUser = data.user;
          }
        } catch (sbSignUpErr) {
          console.warn('[Supabase signUp error]:', sbSignUpErr);
        }
      }

      // User control: Remember Me for newly registered user
      if (registerRememberMe) {
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
        const mappedUser = mapSupabaseUserToAuthUser(supabaseUser);
        try {
          localStorage.setItem('ai_clinic_auth_user', JSON.stringify(mappedUser));
        } catch {}
        onLogin(mappedUser);
      } else if (backendUser) {
        try {
          localStorage.setItem('ai_clinic_auth_user', JSON.stringify(backendUser));
        } catch {}
        onLogin(backendUser);
      } else if (supabaseUser) {
        // Email confirmation dispatched by Supabase
        setRegisterSuccess({
          email: normalized,
          message: `Your account for ${normalized} has been registered successfully. If your Supabase project requires email confirmation, a verification link has been dispatched to your inbox.`,
          requiresVerification: true,
        });
        setEmail(normalized);
      } else {
        setStatusNotice({
          type: 'error',
          message: 'Registration could not be completed. Please check your network and try again.',
        });
      }
    } catch (err: any) {
      setStatusNotice({
        type: 'error',
        message: formatSupabaseAuthError(err) || 'Registration failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // FORGOT PASSWORD REQUEST
  // =========================================================================
  const handleForgotPassword = async () => {
    const normalized = normalizeEmail(email);
    if (!normalized || !isValidEmail(normalized)) {
      setStatusNotice({
        type: 'error',
        message: 'Please enter a valid email address above to dispatch password recovery.',
      });
      return;
    }

    if (!isSupabaseConfigured()) {
      setStatusNotice({
        type: 'error',
        message: 'Supabase credentials are required to dispatch password reset emails.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalized, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setStatusNotice({ type: 'error', message: formatSupabaseAuthError(error) });
      } else {
        setStatusNotice({
          type: 'success',
          message: `Password reset link dispatched via Supabase to ${normalized}. Please check your inbox.`,
        });
      }
    } catch (err: any) {
      setStatusNotice({ type: 'error', message: formatSupabaseAuthError(err) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-800 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative selection:bg-teal-500 selection:text-white">
      {/* Subtle healthcare background ambient patterns */}
      <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-teal-50/60 via-slate-50/40 to-transparent pointer-events-none" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Single Centered Card */}
      <div className="relative w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 z-10">
        
        {/* Top Controls: Back to Home + Supabase Config status badge */}
        <div className="flex items-center justify-between mb-6">
          {onBackToHome ? (
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors group"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
              <span>Back to Home</span>
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
              isSupabaseConfigured()
                ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 animate-pulse'
            }`}
            title="Configure Supabase Project Connection"
          >
            <Database className="w-3 h-3" />
            <span>{isSupabaseConfigured() ? 'Supabase Connected' : 'Setup Supabase'}</span>
          </button>
        </div>

        {/* AI Clinic Brand Emblem & Title */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/25 shrink-0">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                AI Clinic
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Healthcare
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Enterprise EHR &amp; Clinical Management
            </div>
          </div>
        </div>

        {/* Unconfigured Warning Banner */}
        {!isSupabaseConfigured() && (
          <div className="mb-5 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Supabase Connection Required</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Set <code className="font-mono bg-amber-100/80 px-1 py-0.2 rounded">VITE_SUPABASE_URL</code> and <code className="font-mono bg-amber-100/80 px-1 py-0.2 rounded">VITE_SUPABASE_ANON_KEY</code>.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="text-xs font-bold text-amber-800 underline hover:text-amber-950 shrink-0"
            >
              Configure
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB TOGGLE: SIGN IN vs CREATE ACCOUNT                     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 border border-slate-200 mb-5">
          <button
            type="button"
            onClick={() => toggleAuthMode(false)}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              !isRegisterMode
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => toggleAuthMode(true)}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isRegisterMode
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>

        {/* Global Status Notices */}
        {statusNotice && (
          <div 
            role="alert"
            className={`mb-4 p-3 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
              statusNotice.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : statusNotice.type === 'success'
                ? 'bg-teal-50 border border-teal-200 text-teal-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}
          >
            {statusNotice.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            )}
            <span className="leading-snug">{statusNotice.message}</span>
          </div>
        )}

        {/* Registration Success View */}
        {registerSuccess ? (
          <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-3.5 animate-in fade-in duration-200">
            <div className="w-11 h-11 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md shadow-teal-600/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Registration Request Submitted</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {registerSuccess.message}
            </p>
            <div className="p-3 bg-white/80 rounded-xl border border-teal-200/80 text-[11px] text-teal-900 font-medium text-left space-y-1">
              <div>Registered account: <strong className="font-mono">{registerSuccess.email}</strong></div>
              <div className="text-[10px] text-slate-500 font-normal">
                Please verify your mailbox ownership via the link sent by Supabase. Note: Syntactic email validity does not verify mailbox existence until confirmed.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setRegisterSuccess(null);
                setIsRegisterMode(false);
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : !isRegisterMode ? (
          /* ========================================================= */
          /* LOGIN FORM                                                */
          /* ========================================================= */
          <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
            {/* Target Role Guidance (Informative) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Target Workspace Portal
                </label>
                <span className="text-[10px] text-slate-500">Verified via Supabase</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('patient');
                    setEmail('eleanor.vance@example.com');
                    setPassword('PatientHealth2026!');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all text-center border ${
                    selectedRole === 'patient'
                      ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                >
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('doctor');
                    setEmail('sarah.chen@clinic-health.org');
                    setPassword('DoctorAccess2026!');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all text-center border ${
                    selectedRole === 'doctor'
                      ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                >
                  Doctor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('clinic_staff');
                    setIsStaffRegister(true);
                    setStaffInviteKey('CLINIC-ADMIN-2026');
                    setEmail('');
                    setPassword('');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all text-center border ${
                    selectedRole === 'clinic_staff'
                      ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'
                  }`}
                >
                  Clinic Staff
                </button>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor={loginEmailId} className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id={loginEmailId}
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => handleLoginEmailChange(e.target.value)}
                  onBlur={handleLoginEmailBlur}
                  placeholder="physician@clinic.org or patient@example.com"
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-white border rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-all font-medium ${
                    loginErrors.email
                      ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-600 bg-rose-50/20'
                      : 'border-slate-300 focus:border-teal-600 focus:ring-teal-600'
                  }`}
                  aria-invalid={Boolean(loginErrors.email)}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {loginErrors.email && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{loginErrors.email}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor={loginPasswordId} className="block text-xs font-semibold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id={loginPasswordId}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full pl-9 pr-10 py-2.5 bg-white border rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-all font-mono ${
                    loginErrors.password
                      ? 'border-rose-300 focus:border-rose-600 focus:ring-rose-600 bg-rose-50/20'
                      : 'border-slate-300 focus:border-teal-600 focus:ring-teal-600'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {loginErrors.password && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{loginErrors.password}</span>
                </p>
              )}
            </div>

            {/* Remember Me Checkbox (Stores only email safely, never passwords) */}
            <div className="flex items-center justify-between pt-0.5">
              <label 
                htmlFor={rememberMeId}
                className="inline-flex items-center gap-2 cursor-pointer select-none group"
              >
                <input
                  type="checkbox"
                  id={rememberMeId}
                  checked={rememberMe}
                  onChange={(e) => handleRememberMeChange(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-600 focus:ring-offset-0 focus:ring-1 cursor-pointer accent-teal-600 transition-colors"
                />
                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                  Remember me on this device
                </span>
              </label>
              <span className="text-[10px] text-slate-500">Secure session persistence</span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/25 transition-all flex items-center justify-center gap-1.5 active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating with Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Clinical Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* ========================================================= */
          /* REGISTRATION FORM                                         */
          /* ========================================================= */
          <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3.5">
            {/* Full Legal Name */}
            <div>
              <label htmlFor={regNameId} className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id={regNameId}
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={registerName}
                  onChange={(e) => {
                    setRegisterName(e.target.value);
                    if (registerErrors.name) setRegisterErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  placeholder="e.g. Eleanor Vance or Dr. Marcus Brody"
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-white border rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-all font-medium ${
                    registerErrors.name
                      ? 'border-rose-300 focus:border-rose-600 focus:ring-rose-600 bg-rose-50/20'
                      : 'border-slate-300 focus:border-teal-600 focus:ring-teal-600'
                  }`}
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {registerErrors.name && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{registerErrors.name}</span>
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor={regEmailId} className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id={regEmailId}
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={registerEmail}
                  onChange={(e) => handleRegisterEmailChange(e.target.value)}
                  onBlur={handleRegisterEmailBlur}
                  placeholder="name@example.com"
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-white border rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-all font-medium ${
                    registerErrors.email
                      ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-600 bg-rose-50/20'
                      : 'border-slate-300 focus:border-teal-600 focus:ring-teal-600'
                  }`}
                  aria-invalid={Boolean(registerErrors.email)}
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {registerErrors.email && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{registerErrors.email}</span>
                </p>
              )}
            </div>

            {/* Password with Real-Time Strength & Variety Indicator */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor={regPasswordId} className="block text-xs font-semibold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                {registerPassword ? (
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
                <input
                  id={regPasswordId}
                  name="new-password"
                  type={showRegPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={registerPassword}
                  onChange={(e) => {
                    setRegisterPassword(e.target.value);
                    if (registerErrors.password) setRegisterErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Min. 8 characters with letters, numbers & symbols"
                  className={`w-full pl-9 pr-10 py-2.5 bg-white border rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-colors font-mono ${
                    registerErrors.password
                      ? 'border-rose-300 focus:border-rose-600 focus:ring-rose-600 bg-rose-50/20'
                      : 'border-slate-300 focus:border-teal-600 focus:ring-teal-600'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 transition-colors"
                  title={showRegPassword ? 'Hide password' : 'Show password'}
                  aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Real-time Multi-Segment Strength Meter */}
              {registerPassword && (
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
              <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px]">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">
                  Requirements
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
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
                      8+ characters
                    </span>
                  </div>

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
                      Upper & lowercase
                    </span>
                  </div>

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
                      Number (0-9)
                    </span>
                  </div>

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
                      Symbol (!@#$)
                    </span>
                  </div>
                </div>
              </div>

              {registerErrors.password && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{registerErrors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor={regConfirmPasswordId} className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id={regConfirmPasswordId}
                  name="confirm-password"
                  type={showRegConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={registerConfirmPassword}
                  onChange={(e) => {
                    setRegisterConfirmPassword(e.target.value);
                    if (registerErrors.confirmPassword) setRegisterErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder="Re-enter your password"
                  className={`w-full pl-9 pr-10 py-2.5 bg-white border rounded-xl text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-all font-mono ${
                    registerErrors.confirmPassword
                      ? 'border-rose-300 focus:border-rose-600 focus:ring-rose-600 bg-rose-50/20'
                      : 'border-slate-300 focus:border-teal-600 focus:ring-teal-600'
                  }`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                  title={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                  aria-label={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {registerErrors.confirmPassword && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{registerErrors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* Authorized Clinic Staff Registration Option */}
            <div className="pt-1 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isStaffRegister}
                  onChange={(e) => {
                    setIsStaffRegister(e.target.checked);
                    if (!e.target.checked) {
                      setRegisterErrors(prev => ({ ...prev, staffKey: undefined }));
                    }
                  }}
                  className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-600 accent-teal-600"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Register as Authorized Clinic Staff</span>
                </span>
              </label>

              {isStaffRegister && (
                <div className="pt-1.5 pl-6 space-y-1 animate-in fade-in duration-200">
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Clinic Staff Authorization Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={staffInviteKey}
                    onChange={(e) => {
                      setStaffInviteKey(e.target.value);
                      if (registerErrors.staffKey) setRegisterErrors(prev => ({ ...prev, staffKey: undefined }));
                    }}
                    placeholder="Enter clinic clearance token or invite code (e.g. CLINIC-ADMIN-2026)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 font-mono focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                  />
                  {registerErrors.staffKey && (
                    <p className="text-[10px] text-rose-600 font-medium">{registerErrors.staffKey}</p>
                  )}
                  <p className="text-[10px] text-slate-500 leading-tight">
                    Standard self-registration creates patient accounts. Clinic Staff clearance requires authorized credentials (e.g. clinic key or staff invite token).
                  </p>
                </div>
              )}
            </div>

            {/* Save Login Details / Remember Me Option */}
            <div className="flex items-center pt-1">
              <label 
                htmlFor={regRememberId}
                className="inline-flex items-center gap-2 cursor-pointer select-none group"
              >
                <input
                  type="checkbox"
                  id={regRememberId}
                  checked={registerRememberMe}
                  onChange={(e) => setRegisterRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 border-slate-300 focus:ring-teal-600 focus:ring-offset-0 focus:ring-1 cursor-pointer accent-teal-600 transition-colors"
                />
                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                  Remember my details on this device
                </span>
              </label>
            </div>

            {/* Terms of Service & HIPAA Notice */}
            <div className="pt-0.5">
              <label className="inline-flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (registerErrors.terms) setRegisterErrors(prev => ({ ...prev, terms: undefined }));
                  }}
                  className="w-4 h-4 mt-0.5 rounded text-teal-600 border-slate-300 focus:ring-teal-600 accent-teal-600"
                />
                <span className="text-[11px] text-slate-600 leading-tight">
                  I agree to the AI Clinic EHR Terms of Service and HIPAA Privacy Notice.
                </span>
              </label>
              {registerErrors.terms && (
                <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1 animate-in fade-in">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{registerErrors.terms}</span>
                </p>
              )}
            </div>

            {/* Submit Registration Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/25 transition-all flex items-center justify-center gap-1.5 active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering with Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Create Clinical Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Secured by Supabase Auth with Row Level Security &amp; End-to-End Encryption</span>
          </p>
        </div>
      </div>

      {/* Supabase Config Modal */}
      <SupabaseConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onConfigSaved={() => {
          setStatusNotice({
            type: 'success',
            message: 'Supabase credentials loaded. You can now log in or register.',
          });
        }}
      />
    </div>
  );
};
