/**
 * Authentication and Clinical Security Helpers for AI Clinic Management System
 * Follows HIPAA-aligned security practices and Supabase Auth standards.
 */

export interface PasswordValidation {
  isValid: boolean;
  hasMinLength: boolean;
  isOptimalLength: boolean;
  hasLetter: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  score: number; // 0 to 4
  strengthLabel: 'Weak' | 'Fair' | 'Good' | 'Strong';
  strengthColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  barColor: string;
  feedback: string;
}

/**
 * Normalizes email addresses to lowercase and trims whitespace.
 * Must be used consistently for both registration and login.
 */
export function normalizeEmail(email: string): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

/**
 * Validates clinical email address format according to standard RFC 5322 & DNS domain rules.
 * Returns null if valid, or a clear user-facing error message if invalid.
 *
 * Specific rules enforced:
 * 1. Must be non-empty string.
 * 2. Cannot contain internal spaces (e.g. "user name@gmail.com").
 * 3. Must contain exactly one '@' symbol.
 * 4. Local part cannot be empty, exceed 64 chars, start/end with a dot, or contain consecutive dots.
 * 5. Domain part cannot start/end with a dot, cannot contain consecutive dots '..' (e.g. "user@gmail..com").
 * 6. Domain cannot be empty before the suffix (e.g. "user@.com").
 * 7. Domain must contain a valid domain suffix / TLD with at least 2 letters (e.g. "abc@gmail" rejected).
 */
export function getEmailValidationError(rawEmail: string): string | null {
  if (!rawEmail || !rawEmail.trim()) {
    return 'Please enter a valid email address.';
  }

  const trimmed = rawEmail.trim();

  // Reject internal spaces
  if (/\s/.test(trimmed)) {
    return 'Please enter a valid email address (spaces are not allowed).';
  }

  // Exactly one '@'
  const atParts = trimmed.split('@');
  if (atParts.length === 1) {
    return 'Please enter a valid email address (missing "@").';
  }
  if (atParts.length > 2) {
    return 'Please enter a valid email address (multiple "@" not permitted).';
  }

  const [localPart, domainPart] = atParts;

  // Local part checks
  if (!localPart || localPart.length === 0) {
    return 'Please enter a valid email address (missing username before "@").';
  }
  if (localPart.length > 64) {
    return 'Please enter a valid email address (username exceeds 64 characters).';
  }
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return 'Please enter a valid email address (username cannot start or end with a dot).';
  }
  if (localPart.includes('..')) {
    return 'Please enter a valid email address (username cannot contain consecutive dots).';
  }
  const validLocalRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
  if (!validLocalRegex.test(localPart)) {
    return 'Please enter a valid email address (username contains invalid characters).';
  }

  // Domain part checks
  if (!domainPart || domainPart.length === 0) {
    return 'Please enter a valid domain after "@" (e.g. gmail.com).';
  }
  if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return 'Please enter a valid email address (domain cannot start or end with a dot).';
  }
  if (domainPart.includes('..')) {
    return 'Please enter a valid email address (domain cannot contain consecutive dots).';
  }

  const domainLabels = domainPart.split('.');
  if (domainLabels.length < 2) {
    return 'Please enter a valid email address (missing domain suffix like .com or .org).';
  }

  for (const label of domainLabels) {
    if (!label || label.length === 0) {
      return 'Please enter a valid email address.';
    }
    if (label.length > 63) {
      return 'Please enter a valid email address (domain label exceeds 63 characters).';
    }
    if (label.startsWith('-') || label.endsWith('-')) {
      return 'Please enter a valid email address (domain cannot start or end with a hyphen).';
    }
    if (!/^[a-zA-Z0-9-]+$/.test(label)) {
      return 'Please enter a valid email address (domain contains invalid characters).';
    }
  }

  // TLD must be at least 2 alphabetic characters
  const tld = domainLabels[domainLabels.length - 1];
  if (!/^[a-zA-Z]{2,24}$/.test(tld)) {
    return 'Please enter a valid email address (e.g. .com, .org, .edu).';
  }

  return null;
}

/**
 * Validates email format according to standard RFC 5322 & DNS domain rules.
 * Rejects malformed email addresses.
 */
export function isValidEmail(email: string): boolean {
  return getEmailValidationError(email) === null;
}

/**
 * Validates password strength according to healthcare application standards.
 * Requirements:
 * - Minimum 8 characters
 * - At least one alphabetical letter
 * - At least one numeric digit
 */
export function validatePassword(password: string): PasswordValidation {
  if (!password) {
    return {
      isValid: false,
      hasMinLength: false,
      isOptimalLength: false,
      hasLetter: false,
      hasLowercase: false,
      hasUppercase: false,
      hasNumber: false,
      hasSpecial: false,
      score: 0,
      strengthLabel: 'Weak',
      strengthColor: 'bg-rose-500',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-700',
      badgeBorder: 'border-rose-200',
      barColor: 'bg-rose-500',
      feedback: 'Enter a password to protect your clinical account.',
    };
  }

  const hasMinLength = password.length >= 8;
  const isOptimalLength = password.length >= 12;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasLetter = hasLowercase || hasUppercase;
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const hasMixedCase = hasLowercase && hasUppercase;

  // Evaluate variety and complexity
  let score = 0;
  if (hasMinLength) score++;
  if (hasLetter && hasNumber) score++;
  if (hasMixedCase) score++;
  if (hasSpecial) score++;
  if (isOptimalLength && score >= 3) {
    // bonus if long and good variety
    score = Math.min(4, score + 1);
  }

  let strengthLabel: 'Weak' | 'Fair' | 'Good' | 'Strong' = 'Weak';
  let strengthColor = 'bg-rose-500';
  let badgeBg = 'bg-rose-50';
  let badgeText = 'text-rose-700';
  let badgeBorder = 'border-rose-200';
  let barColor = 'bg-rose-500';
  let feedback = 'Use at least 8 characters with letters and numbers.';

  if (score >= 4) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
    badgeBg = 'bg-emerald-50';
    badgeText = 'text-emerald-700';
    badgeBorder = 'border-emerald-200';
    barColor = 'bg-emerald-500';
    feedback = isOptimalLength
      ? 'Excellent! Optimal HIPAA-grade clinical password security.'
      : 'Great! Password meets clinical security requirements.';
  } else if (score === 3) {
    strengthLabel = 'Good';
    strengthColor = 'bg-teal-500';
    badgeBg = 'bg-teal-50';
    badgeText = 'text-teal-700';
    badgeBorder = 'border-teal-200';
    barColor = 'bg-teal-500';
    if (!hasSpecial) {
      feedback = 'Good. Add a symbol (!@#$%) for maximum strength.';
    } else if (!isOptimalLength) {
      feedback = 'Good. Lengthen to 12+ characters for optimal security.';
    } else {
      feedback = 'Good password strength.';
    }
  } else if (score === 2) {
    strengthLabel = 'Fair';
    strengthColor = 'bg-amber-500';
    badgeBg = 'bg-amber-50';
    badgeText = 'text-amber-700';
    badgeBorder = 'border-amber-200';
    barColor = 'bg-amber-500';
    if (!hasMixedCase) {
      feedback = 'Add uppercase and lowercase letters.';
    } else if (!hasNumber) {
      feedback = 'Add at least one number.';
    } else {
      feedback = 'Add special characters and length for better security.';
    }
  } else {
    strengthLabel = 'Weak';
    strengthColor = 'bg-rose-500';
    badgeBg = 'bg-rose-50';
    badgeText = 'text-rose-700';
    badgeBorder = 'border-rose-200';
    barColor = 'bg-rose-500';
    if (!hasMinLength) {
      feedback = `Need at least ${8 - password.length} more character${8 - password.length === 1 ? '' : 's'}.`;
    } else if (!hasNumber) {
      feedback = 'Add numbers to increase strength.';
    } else {
      feedback = 'Add varied characters (upper, lower, numbers).';
    }
  }

  // Must meet minimum 8 chars, letter, and number
  const isValid = hasMinLength && hasLetter && hasNumber;

  return {
    isValid,
    hasMinLength,
    isOptimalLength,
    hasLetter,
    hasLowercase,
    hasUppercase,
    hasNumber,
    hasSpecial,
    score,
    strengthLabel,
    strengthColor,
    badgeBg,
    badgeText,
    badgeBorder,
    barColor,
    feedback,
  };
}

// Storage keys for user control over session persistence
export const REMEMBERED_EMAIL_KEY = 'ai_clinic_remembered_email';
export const REMEMBER_ME_PREF_KEY = 'ai_clinic_remember_me_pref';

/**
 * Gets the remembered email address if the user opted into "Remember me".
 * NEVER returns or stores passwords.
 */
export function getRememberedEmail(): string {
  try {
    const isRemembered = localStorage.getItem(REMEMBER_ME_PREF_KEY) === 'true';
    if (!isRemembered) return '';
    return localStorage.getItem(REMEMBERED_EMAIL_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Gets whether the user currently has "Remember me" enabled.
 */
export function getRememberMePreference(): boolean {
  try {
    return localStorage.getItem(REMEMBER_ME_PREF_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Updates "Remember me" preferences.
 * Secure: Stores ONLY the normalized email string on the user's device when enabled.
 * NEVER stores passwords.
 */
export function setRememberMePreference(remember: boolean, email?: string): void {
  try {
    if (remember) {
      localStorage.setItem(REMEMBER_ME_PREF_KEY, 'true');
      if (email && email.trim()) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, normalizeEmail(email));
      }
    } else {
      localStorage.setItem(REMEMBER_ME_PREF_KEY, 'false');
      localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
  } catch {
    // Ignore localStorage access failures (e.g. private browsing mode)
  }
}

/**
 * Maps Supabase Auth errors into user-friendly clinical error messages.
 */
export function formatSupabaseAuthError(error: any): string {
  if (!error) return 'An unknown authentication error occurred.';
  const msg = (error.message || '').toString();

  if (msg.includes('Invalid login credentials') || msg.includes('invalid_grant')) {
    return 'Invalid email address or password. Please verify your credentials and try again.';
  }
  if (msg.includes('Email not confirmed') || msg.includes('email_not_confirmed')) {
    return 'Your email address has not been confirmed yet. Please check your inbox for the verification link dispatched by Supabase.';
  }
  if (msg.includes('User already registered') || msg.includes('already exists') || msg.includes('duplicate key')) {
    return 'An account with this email address already exists. Please sign in or use password recovery.';
  }
  if (msg.includes('Password should be') || msg.includes('weak_password')) {
    return 'The password is too weak. Please use at least 8 characters with letters and numbers.';
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Too many authentication attempts. For security, please wait a few moments before trying again.';
  }
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Network error')) {
    return 'Network error connecting to Supabase authentication server. Please check your internet connection.';
  }

  return msg || 'Authentication request failed.';
}
