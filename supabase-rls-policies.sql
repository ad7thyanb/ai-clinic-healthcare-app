-- ============================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES FOR AI CLINIC MANAGEMENT SYSTEM
-- ============================================================================
-- Architecture: Strictly Three Unified Application Roles
--   1. Clinic Staff (role: 'clinic_staff', mapped from admin & staff)
--   2. Doctor       (role: 'doctor')
--   3. Patient      (role: 'patient')
-- Target Table: public."clinic data" (30,000 Patient EHR Records)
-- Role Authority: Enforced via Supabase Auth JWT claims & Trusted Role Mapping
-- ============================================================================

-- 1. Enable Row Level Security on the clinic data table
ALTER TABLE public."clinic data" ENABLE ROW LEVEL SECURITY;

-- 2. Revoke public/anon access to prevent unauthenticated data leaks
REVOKE ALL ON public."clinic data" FROM anon;

-- Clean up any legacy separate Admin/Staff policies
DROP POLICY IF EXISTS "Admin full access to clinic data" ON public."clinic data";
DROP POLICY IF EXISTS "Staff access for intake and queue triage" ON public."clinic data";
DROP POLICY IF EXISTS "Clinic Staff unified access to clinic data" ON public."clinic data";

-- ============================================================================
-- POLICY 1: CLINIC STAFF UNIFIED OPERATIONS ACCESS (ALL COMMANDS)
-- Authorized Clinic Staff (including former admin and staff accounts) have
-- unified clinical operations access to manage appointments, triage queues,
-- patients, doctors, reports, analytics, and clinic configurations.
-- ============================================================================
CREATE POLICY "Clinic Staff unified access to clinic data"
ON public."clinic data"
FOR ALL
TO authenticated
USING (
  LOWER(COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role', '')) IN (
    'clinic_staff',
    'staff',
    'admin',
    'administrator',
    'coordinator',
    'clinic'
  )
  OR (auth.jwt() -> 'user_metadata' ->> 'is_verified_admin')::boolean = true
  OR (auth.jwt() ->> 'email') IN (
    'admin@aura-health.org',
    'staff@aura-health.org',
    'admin@aiclinic.org',
    'staff@aiclinic.org'
  )
  OR (auth.jwt() ->> 'email') LIKE '%@aura-health.org'
  OR (auth.jwt() ->> 'email') LIKE '%@clinic.admin'
);

-- ============================================================================
-- POLICY 2: PHYSICIAN / DOCTOR ACCESS
-- Attending physicians can only query records where:
--   - The patient is assigned to their physician name
--   - Or the encounter matches their medical department
-- ============================================================================
DROP POLICY IF EXISTS "Doctor access assigned patient records" ON public."clinic data";
CREATE POLICY "Doctor access assigned patient records"
ON public."clinic data"
FOR SELECT
TO authenticated
USING (
  LOWER(COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role', '')) IN ('doctor', 'physician', 'md')
  AND (
    "Doctor Name" ILIKE '%' || COALESCE(auth.jwt() -> 'user_metadata' ->> 'name', '') || '%'
    OR "Department" = COALESCE(auth.jwt() -> 'user_metadata' ->> 'department', '')
  )
);

-- ============================================================================
-- POLICY 3: PATIENT SELF-RECORD ACCESS
-- Patients can ONLY query their personal records.
-- Records are strictly scoped to the authenticated patient's email or MRN.
-- ============================================================================
DROP POLICY IF EXISTS "Patient access personal records only" ON public."clinic data";
CREATE POLICY "Patient access personal records only"
ON public."clinic data"
FOR SELECT
TO authenticated
USING (
  LOWER(COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', auth.jwt() -> 'user_metadata' ->> 'role', '')) IN ('patient', 'client', 'pt')
  AND (
    "Patient Id" = COALESCE(auth.jwt() -> 'user_metadata' ->> 'patientId', '')
    OR "Email" ILIKE (auth.jwt() ->> 'email')
  )
);

-- ============================================================================
-- VERIFY POLICIES
-- ============================================================================
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'clinic data';
