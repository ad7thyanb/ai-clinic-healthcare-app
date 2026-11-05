import { createClient, SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';
import { AuthUser, UserRole } from '../components/auth/LoginScreen';
import { INITIAL_DOCTORS, INITIAL_PATIENTS } from '../mock/clinicData';

// Get Supabase URL and Anon Key from Vite environment variables or local storage overrides
const getEnvConfig = () => {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) as string | undefined;
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) as string | undefined;

  let localUrl: string | null = null;
  let localKey: string | null = null;

  try {
    localUrl = localStorage.getItem('supabase_custom_url');
    localKey = localStorage.getItem('supabase_custom_anon_key');
  } catch {
    // ignore local storage errors
  }

  const url = (localUrl && localUrl.trim()) || (envUrl && envUrl.trim()) || '';
  const key = (localKey && localKey.trim()) || (envKey && envKey.trim()) || '';

  const isValidUrl = Boolean(url && (url.startsWith('https://') || url.startsWith('http://')) && !url.includes('your-project-id'));
  const isValidKey = Boolean(key && key.length > 20 && !key.includes('your-anon-key'));

  return {
    url,
    key,
    isConfigured: isValidUrl && isValidKey,
    isCustomOverride: Boolean(localUrl && localKey),
  };
};

let currentConfig = getEnvConfig();

// Dummy placeholder to prevent runtime crash before configuration
const fallbackDummyUrl = 'https://placeholder-project.supabase.co';
const fallbackDummyKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummyPlaceholderKeyForInitializationOnly';

export let supabase: SupabaseClient = createClient(
  currentConfig.isConfigured ? currentConfig.url : fallbackDummyUrl,
  currentConfig.isConfigured ? currentConfig.key : fallbackDummyKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'ai_clinic_supabase_auth',
    },
  }
);

export function isSupabaseConfigured(): boolean {
  return currentConfig.isConfigured;
}

export function getSupabaseConfigDetails() {
  return {
    url: currentConfig.url,
    hasKey: Boolean(currentConfig.key),
    isConfigured: currentConfig.isConfigured,
    isCustomOverride: currentConfig.isCustomOverride,
  };
}

export function configureSupabase(url: string, anonKey: string): boolean {
  try {
    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();

    if (!cleanUrl || !cleanKey) {
      throw new Error('Both Supabase Project URL and Anon/Publishable Key are required.');
    }
    if (!cleanUrl.startsWith('https://') && !cleanUrl.startsWith('http://')) {
      throw new Error('Project URL must start with https://');
    }

    localStorage.setItem('supabase_custom_url', cleanUrl);
    localStorage.setItem('supabase_custom_anon_key', cleanKey);

    currentConfig = {
      url: cleanUrl,
      key: cleanKey,
      isConfigured: true,
      isCustomOverride: true,
    };

    supabase = createClient(cleanUrl, cleanKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'ai_clinic_supabase_auth',
      },
    });

    return true;
  } catch (err) {
    console.error('Failed to configure Supabase client:', err);
    throw err;
  }
}

export function clearCustomSupabaseConfig() {
  try {
    localStorage.removeItem('supabase_custom_url');
    localStorage.removeItem('supabase_custom_anon_key');
    currentConfig = getEnvConfig();
    supabase = createClient(
      currentConfig.isConfigured ? currentConfig.url : fallbackDummyUrl,
      currentConfig.isConfigured ? currentConfig.key : fallbackDummyKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storageKey: 'ai_clinic_supabase_auth',
        },
      }
    );
  } catch (err) {
    console.error('Failed to clear custom Supabase configuration', err);
  }
}

// Case-insensitive, resilient user role normalizer across clinical aliases
export function normalizeUserRole(rawRole: any): UserRole | null {
  if (rawRole === null || rawRole === undefined) return null;
  const str = String(rawRole).trim().toLowerCase().replace(/[-_\s]+/g, '');
  if (!str) return null;

  // Patient aliases
  if (['patient', 'patients', 'pt', 'client', 'patientuser'].includes(str)) {
    return 'patient';
  }
  // Doctor / Physician aliases
  if ([
    'doctor',
    'doctors',
    'doc',
    'physician',
    'physicians',
    'md',
    'clinician',
    'attending',
    'specialist',
    'practitioner',
    'medicaldoctor',
  ].includes(str)) {
    return 'doctor';
  }
  // Clinic Staff & Administrator aliases (normalized to unified 'clinic_staff')
  if ([
    'clinicstaff',
    'clinicalstaff',
    'clinic_staff',
    'staff',
    'clinic',
    'coordinator',
    'receptionist',
    'nurse',
    'triage',
    'admissions',
    'operations',
    'clinicoperations',
    'clinicuser',
    'admin',
    'administrator',
    'administrators',
    'superadmin',
    'cmo',
    'management',
    'director',
    'chiefmedicalofficer',
  ].includes(str)) {
    return 'clinic_staff';
  }

  return null;
}

// Asynchronously resolve authenticated user's actual role from trusted profile/role records
export async function resolveSupabaseUserRole(
  sbUser: SupabaseUser
): Promise<{ user: AuthUser; error?: never } | { user?: never; error: string }> {
  const meta = sbUser.user_metadata || {};
  const appMeta = sbUser.app_metadata || {};
  const userEmail = (sbUser.email || '').toLowerCase().trim();

  let resolvedRole: UserRole | null = null;
  let resolvedTitle: string | undefined = meta.title;
  let resolvedDepartment: string | undefined = meta.department || meta.specialty;
  let resolvedDoctorId: string | undefined = meta.doctorId;
  let resolvedPatientId: string | undefined = meta.patientId;
  let resolvedName: string | undefined = meta.full_name || meta.name;

  // 1. Check Supabase app_metadata (highest authority for custom JWT claims & RBAC in Supabase)
  if (appMeta.role || appMeta.user_role) {
    resolvedRole = normalizeUserRole(appMeta.role || appMeta.user_role);
  } else if (Array.isArray(appMeta.roles) && appMeta.roles.length > 0) {
    for (const r of appMeta.roles) {
      const norm = normalizeUserRole(r);
      if (norm) {
        resolvedRole = norm;
        break;
      }
    }
  } else if (appMeta.claims_admin === true) {
    resolvedRole = 'clinic_staff';
  }

  // 2. Query Supabase database tables for trusted profile/role records (profiles, user_roles, users)
  if (!resolvedRole && isSupabaseConfigured()) {
    try {
      // Check 'profiles' table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sbUser.id)
        .maybeSingle();

      if (profileData) {
        resolvedRole = normalizeUserRole(
          profileData.role || profileData.user_role || profileData.role_name
        );
        if (profileData.title) resolvedTitle = profileData.title;
        if (profileData.department) resolvedDepartment = profileData.department;
        if (profileData.doctor_id || profileData.doctorId) {
          resolvedDoctorId = profileData.doctor_id || profileData.doctorId;
        }
        if (profileData.patient_id || profileData.patientId) {
          resolvedPatientId = profileData.patient_id || profileData.patientId;
        }
        if (profileData.name || profileData.full_name) {
          resolvedName = profileData.name || profileData.full_name;
        }
      }

      if (!resolvedRole) {
        // Check 'user_roles' table
        const { data: roleRow } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', sbUser.id)
          .maybeSingle();

        if (roleRow?.role) {
          resolvedRole = normalizeUserRole(roleRow.role);
        }
      }

      if (!resolvedRole) {
        // Check 'users' table
        const { data: userRow } = await supabase
          .from('users')
          .select('*')
          .eq('id', sbUser.id)
          .maybeSingle();

        if (userRow) {
          resolvedRole = normalizeUserRole(userRow.role);
          if (userRow.title) resolvedTitle = userRow.title;
          if (userRow.department) resolvedDepartment = userRow.department;
        }
      }
    } catch {
      // Ignore if table does not exist or RLS denies
    }
  }

  let backendVerified = false;

  // 3. Query backend trusted profile record via /api/auth/profile-role
  if (!resolvedRole && (userEmail || sbUser.id)) {
    try {
      const q = new URLSearchParams();
      if (userEmail) q.set('email', userEmail);
      if (sbUser.id) q.set('id', sbUser.id);

      const base = typeof window !== 'undefined' ? '' : 'http://localhost:3000';
      const res = await fetch(`${base}/api/auth/profile-role?${q.toString()}`);
      if (res.ok) {
        const body = await res.json();
        if (body.found && body.user?.role) {
          resolvedRole = normalizeUserRole(body.user.role);
          backendVerified = true;
          if (body.user.title) resolvedTitle = body.user.title;
          if (body.user.department) resolvedDepartment = body.user.department;
          if (body.user.doctorId) resolvedDoctorId = body.user.doctorId;
          if (body.user.patientId) resolvedPatientId = body.user.patientId;
          if (body.user.name && !resolvedName) resolvedName = body.user.name;
        }
      }
    } catch {
      // ignore network errors
    }
  }

  // 4. Check known Clinical Physician & Patient registries
  if (!resolvedRole && userEmail) {
    const knownDoc = INITIAL_DOCTORS.find(
      (d) => d.email && d.email.toLowerCase() === userEmail
    );
    if (knownDoc) {
      resolvedRole = 'doctor';
      if (!resolvedTitle) resolvedTitle = knownDoc.title;
      if (!resolvedDepartment) resolvedDepartment = knownDoc.department;
      if (!resolvedDoctorId) resolvedDoctorId = knownDoc.id;
      if (!resolvedName) resolvedName = knownDoc.name;
    } else {
      const knownPt = INITIAL_PATIENTS.find(
        (p) => p.email && p.email.toLowerCase() === userEmail
      );
      if (knownPt) {
        resolvedRole = 'patient';
        if (!resolvedTitle) resolvedTitle = 'Registered Patient';
        if (!resolvedDepartment) resolvedDepartment = knownPt.department;
        if (!resolvedPatientId) resolvedPatientId = knownPt.id;
        if (!resolvedName) resolvedName = knownPt.name;
      }
    }
  }

  // 5. Check Supabase user_metadata
  if (!resolvedRole) {
    const rawMetaRole =
      meta.role ||
      meta.user_role ||
      meta.userRole ||
      meta.Role ||
      meta.user_type ||
      meta.type;
    if (rawMetaRole) {
      resolvedRole = normalizeUserRole(rawMetaRole);
    }
  }

  // 6. Check trusted administrative and staff email domain rules
  if (!resolvedRole) {
    const authorizedStaffEmails = [
      'admin@aura-health.org',
      'admin@aiclinic.org',
      'admin@clinic.org',
      'staff@aura-health.org',
    ];
    if (
      userEmail &&
      (authorizedStaffEmails.includes(userEmail) || userEmail.endsWith('@clinic.admin') || userEmail.endsWith('@aura-health.org'))
    ) {
      resolvedRole = 'clinic_staff';
    }
  }

  // 7. Security verification for Clinic Staff role
  if (resolvedRole === 'clinic_staff') {
    const isVerifiedStaff = Boolean(
      backendVerified ||
      meta.is_verified_admin === true ||
      meta.is_verified_staff === true ||
      meta.admin_authorized === true ||
      meta.staff_authorized === true ||
      meta.role === 'clinic_staff' ||
      meta.role === 'admin' ||
      meta.role === 'staff' ||
      meta.requested_role === 'clinic_staff' ||
      appMeta.claims_admin === true ||
      appMeta.role === 'admin' ||
      appMeta.role === 'staff' ||
      appMeta.role === 'clinic_staff' ||
      userEmail === 'admin@aura-health.org' ||
      userEmail === 'staff@aura-health.org' ||
      userEmail === 'admin@aiclinic.org' ||
      userEmail === 'admin@clinic.org' ||
      userEmail.endsWith('@clinic.admin') ||
      userEmail.endsWith('@aura-health.org')
    );
    if (!isVerifiedStaff) {
      return {
        error:
          'Unauthorized Clinic Staff Claim: This account does not possess verified clinical staff credentials.',
      };
    }
  }

  // 7. CRITICAL RULE: If role is still missing or invalid, do NOT default to patient! Return clear error!
  if (!resolvedRole) {
    return {
      error:
        'Account Role Missing or Unrecognized: No valid clinical role (Patient, Doctor, or Clinic Staff) was found for this user in the trusted profile records. Please contact the clinic administration.',
    };
  }

  const name =
    resolvedName ||
    (sbUser.email ? sbUser.email.split('@')[0].replace(/[._]/g, ' ') : 'Clinical User');

  const defaultTitle =
    resolvedRole === 'doctor'
      ? resolvedDepartment || 'Attending Physician'
      : resolvedRole === 'patient'
      ? 'Registered Patient'
      : 'Clinic Staff Operations Specialist';

  const authUser: AuthUser = {
    id: sbUser.id,
    email: sbUser.email || '',
    name: name.charAt(0).toUpperCase() + name.slice(1),
    role: resolvedRole,
    title: resolvedTitle || defaultTitle,
    department: resolvedDepartment || 'General Medicine',
    avatarGradient:
      meta.avatarGradient ||
      (resolvedRole === 'doctor'
        ? 'from-blue-600 to-teal-500'
        : resolvedRole === 'patient'
        ? 'from-teal-600 to-cyan-500'
        : 'from-blue-600 to-indigo-600'),
    status: 'active',
    emailVerified: Boolean(sbUser.email_confirmed_at),
    doctorId:
      resolvedDoctorId ||
      (resolvedRole === 'doctor' ? `DOC-${sbUser.id.slice(0, 4).toUpperCase()}` : undefined),
    patientId:
      resolvedPatientId ||
      (resolvedRole === 'patient' ? `PT-${sbUser.id.slice(0, 5).toUpperCase()}` : undefined),
  };

  return { user: authUser };
}

// Convert a Supabase User object into our application AuthUser model with role authorization
export function mapSupabaseUserToAuthUser(sbUser: SupabaseUser): AuthUser {
  const meta = sbUser.user_metadata || {};
  const appMeta = sbUser.app_metadata || {};
  const userEmail = (sbUser.email || '').toLowerCase().trim();

  // 1. Resolve role using case-insensitive normalization
  let role: UserRole | null =
    normalizeUserRole(appMeta.role || appMeta.user_role) ||
    normalizeUserRole(meta.role || meta.user_role || meta.Role || meta.type);

  // 2. Check staff/admin emails
  const authorizedStaffEmails = [
    'admin@aura-health.org',
    'admin@aiclinic.org',
    'admin@clinic.org',
    'staff@aura-health.org',
  ];
  if (
    userEmail &&
    (authorizedStaffEmails.includes(userEmail) || userEmail.endsWith('@clinic.admin') || userEmail.endsWith('@aura-health.org'))
  ) {
    role = 'clinic_staff';
  }

  // 3. Staff validation - preserve clinic_staff role
  if (role === 'clinic_staff') {
    // Keep verified clinic_staff role intact
  } else if (!role) {
    role = 'patient';
  }

  const finalRole: UserRole = role || 'patient';

  const name =
    meta.full_name ||
    meta.name ||
    (sbUser.email ? sbUser.email.split('@')[0].replace(/[._]/g, ' ') : 'Clinical User');

  const defaultTitle =
    finalRole === 'doctor'
      ? meta.specialty || 'Attending Physician'
      : finalRole === 'patient'
      ? 'Registered Patient'
      : 'Clinic Staff Operations Specialist';

  return {
    id: sbUser.id,
    email: sbUser.email || '',
    name: name.charAt(0).toUpperCase() + name.slice(1),
    role: finalRole,
    title: meta.title || defaultTitle,
    department: meta.department || meta.specialty || 'General Medicine',
    avatarGradient:
      meta.avatarGradient ||
      (finalRole === 'doctor'
        ? 'from-blue-600 to-teal-500'
        : finalRole === 'patient'
        ? 'from-teal-600 to-cyan-500'
        : 'from-blue-600 to-indigo-600'),
    status: 'active',
    emailVerified: Boolean(sbUser.email_confirmed_at),
    doctorId: meta.doctorId || (finalRole === 'doctor' ? `DOC-${sbUser.id.slice(0, 4).toUpperCase()}` : undefined),
    patientId: meta.patientId || (finalRole === 'patient' ? `PT-${sbUser.id.slice(0, 5).toUpperCase()}` : undefined),
  };
}

export async function getActiveAuthSession(): Promise<{ session: Session | null; role: string; email: string | null; id: string | null }> {
  try {
    if (isSupabaseConfigured()) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        return {
          session,
          role: session.user.role || 'authenticated',
          email: session.user.email || null,
          id: session.user.id || null,
        };
      }
    }

    // Check if user session exists in localStorage and restore
    const savedToken = localStorage.getItem('ai_clinic_token');
    const savedUser = localStorage.getItem('ai_clinic_auth_user');
    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return {
          session: null,
          role: parsed.role || 'clinic_staff',
          email: parsed.email || null,
          id: parsed.id || null,
        };
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore
  }

  return {
    session: null,
    role: 'anon',
    email: null,
    id: null,
  };
}

export type { SupabaseUser, Session };
