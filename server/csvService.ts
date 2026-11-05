import { getStore, saveStore, logAudit, Appointment, Patient } from './dataStore.js';
import { getPool, checkDatabaseHealth, ensureClinicDataTableExists } from './db.js';

export interface CsvColumnMapping {
  patient_name?: string;
  patient_id?: string;
  doctor_name?: string;
  doctor_id?: string;
  department?: string;
  appointment_date?: string;
  appointment_time?: string;
  status?: string;
  priority?: string;
  type?: string;
  room?: string;
  chief_complaint?: string;
  disease?: string;
  age?: string;
  gender?: string;
  phone?: string;
  email?: string;
  waiting_time?: string;
  consultation_duration?: string;
  revenue?: string;
  notes?: string;
  appointment_id?: string;
}

export interface NormalizedClinicRow {
  rowIndex: number;
  id: string;
  patientId: string;
  patientName: string;
  age?: number;
  gender?: string;
  phone?: string;
  email?: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'Scheduled' | 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled';
  priority: 'Critical' | 'High' | 'Normal' | 'Routine';
  type: 'In-Person' | 'Video Consultation' | 'Follow-up' | 'Emergency';
  room: string;
  chiefComplaint: string;
  disease: string;
  waitingTime: number;
  consultationDuration: number;
  revenue: number;
  notes: string;
  isValid: boolean;
  isDuplicate: boolean;
  validationErrors: string[];
  duplicateReason?: string;
}

export interface CsvPreviewResult {
  success: boolean;
  totalRows: number;
  validRowsCount: number;
  duplicateCount: number;
  invalidCount: number;
  headers: string[];
  matchedColumns: Record<string, string>;
  missingRequired: string[];
  previewRows: NormalizedClinicRow[];
  duplicates: NormalizedClinicRow[];
  errors: Array<{ row: number; errors: string[] }>;
  schemaStatus: {
    mysqlConnected: boolean;
    database: string;
    table: string;
    columns: string[];
    error?: string;
  };
}

// Synonyms map for intelligent fuzzy column matching
const COLUMN_SYNONYMS: Record<keyof CsvColumnMapping, string[]> = {
  patient_name: ['patient_name', 'patient name', 'patient', 'name', 'full_name', 'fullname', 'patient_fullname', 'patient full name'],
  patient_id: ['patient_id', 'patient id', 'mrn', 'id', 'pid', 'patient_mrn', 'medical_record_number'],
  doctor_name: ['doctor_name', 'doctor name', 'doctor', 'physician', 'provider', 'doctor_fullname', 'attending_physician'],
  doctor_id: ['doctor_id', 'doctor id', 'doc_id', 'did'],
  department: ['department', 'dept', 'specialty', 'specialization', 'clinic_department', 'clinical_department'],
  appointment_date: ['appointment_date', 'appointment date', 'date', 'visit_date', 'visit date', 'appt_date', 'appointmentdate'],
  appointment_time: ['appointment_time', 'appointment time', 'time', 'slot', 'visit_time', 'appt_time', 'appointmenttime'],
  status: ['status', 'appointment_status', 'visit_status', 'state'],
  priority: ['priority', 'triage_priority', 'triage_status', 'urgency'],
  type: ['type', 'consultation_type', 'visit_type', 'appointment_type'],
  room: ['room', 'exam_room', 'clinic_room', 'suite', 'bay'],
  chief_complaint: ['chief_complaint', 'chief complaint', 'complaint', 'reason', 'symptoms', 'presenting_complaint'],
  disease: ['disease', 'diagnosis', 'condition', 'medical_condition', 'disease_name', 'primary_diagnosis'],
  age: ['age', 'patient_age', 'patient age'],
  gender: ['gender', 'sex', 'patient_gender'],
  phone: ['phone', 'contact', 'mobile', 'telephone', 'phone_number'],
  email: ['email', 'e-mail', 'patient_email'],
  waiting_time: ['waiting_time', 'wait_time', 'waiting_time_minutes', 'waittime', 'wait_minutes'],
  consultation_duration: ['consultation_duration', 'duration', 'duration_minutes', 'consultation_time', 'duration_mins'],
  revenue: ['revenue', 'fee', 'consultation_fee', 'cost', 'billing_amount', 'amount', 'charge'],
  notes: ['notes', 'remarks', 'comments', 'clinical_notes'],
  appointment_id: ['appointment_id', 'appointment id', 'apt_id', 'booking_id', 'appointment_number'],
};

// RFC 4180 compliant CSV text parser
export function parseCsvText(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  // Strip BOM if present
  let cleanText = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleanText) {
    return { headers: [], rows: [] };
  }

  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote: ""
        currentField += '"';
        i++; // skip next quote
      } else {
        // Toggle quote mode
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // Delimiter
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      // End of line
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n in CRLF
      }
      currentRow.push(currentField.trim());
      currentField = '';
      if (currentRow.some((f) => f.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  // Push last field & row if pending
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      lines.push(currentRow);
    }
  }

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const rawHeaders = lines[0].map((h) => h.replace(/^["']|["']$/g, '').trim());
  const rows: Record<string, string>[] = [];

  for (let r = 1; r < lines.length; r++) {
    const rowValues = lines[r];
    const rowObj: Record<string, string> = {};
    let hasValue = false;
    for (let c = 0; c < rawHeaders.length; c++) {
      const header = rawHeaders[c];
      const val = (rowValues[c] ?? '').replace(/^["']|["']$/g, '').trim();
      rowObj[header] = val;
      if (val) hasValue = true;
    }
    if (hasValue) {
      rows.push(rowObj);
    }
  }

  return { headers: rawHeaders, rows };
}

// Map CSV headers to standard clinic fields
export function detectColumnMapping(headers: string[]): {
  mapping: CsvColumnMapping;
  matched: Record<string, string>;
  missingRequired: string[];
} {
  const mapping: CsvColumnMapping = {};
  const matched: Record<string, string> = {};
  const lowerHeaders = headers.map((h) => h.toLowerCase().replace(/[_\s-]+/g, ' '));

  for (const [key, synonyms] of Object.entries(COLUMN_SYNONYMS) as [keyof CsvColumnMapping, string[]][]) {
    for (let i = 0; i < headers.length; i++) {
      const normalizedHeader = lowerHeaders[i];
      const origHeader = headers[i];

      const isMatch = synonyms.some((syn) => {
        const normSyn = syn.toLowerCase().replace(/[_\s-]+/g, ' ');
        return normalizedHeader === normSyn || normalizedHeader.includes(normSyn);
      });

      if (isMatch) {
        mapping[key] = origHeader;
        matched[key] = origHeader;
        break;
      }
    }
  }

  // Check required fields
  const missingRequired: string[] = [];
  if (!mapping.patient_name) missingRequired.push('Patient Name');
  if (!mapping.doctor_name) missingRequired.push('Doctor Name');
  if (!mapping.appointment_date) missingRequired.push('Appointment Date');
  if (!mapping.appointment_time) missingRequired.push('Appointment Time');

  return { mapping, matched, missingRequired };
}

// Normalize date to YYYY-MM-DD
function normalizeDate(raw: string): string {
  if (!raw) return new Date().toISOString().split('T')[0];
  const cleaned = raw.trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }

  // MM/DD/YYYY or M/D/YYYY
  const mdy = cleaned.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (mdy) {
    const month = mdy[1].padStart(2, '0');
    const day = mdy[2].padStart(2, '0');
    const year = mdy[3];
    return `${year}-${month}-${day}`;
  }

  // DD-MM-YYYY
  const dmy = cleaned.match(/^(\d{1,2})[\.-](\d{1,2})[\.-](\d{4})$/);
  if (dmy) {
    const day = dmy[1].padStart(2, '0');
    const month = dmy[2].padStart(2, '0');
    const year = dmy[3];
    return `${year}-${month}-${day}`;
  }

  // Parse using Date
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return cleaned;
}

// Normalize time to HH:MM (24-hour)
function normalizeTime(raw: string): string {
  if (!raw) return '09:00';
  const cleaned = raw.trim();

  // 12-hour AM/PM e.g. "9:30 AM", "02:15 PM"
  const ampm = cleaned.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (ampm) {
    let hour = parseInt(ampm[1], 10);
    const minute = ampm[2];
    const modifier = (ampm[3] || '').toUpperCase();

    if (modifier === 'PM' && hour < 12) hour += 12;
    if (modifier === 'AM' && hour === 12) hour = 0;

    return `${String(hour).padStart(2, '0')}:${minute}`;
  }

  // Already HH:MM
  if (/^\d{1,2}:\d{2}$/.test(cleaned)) {
    const parts = cleaned.split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1]}`;
  }

  return cleaned;
}

// Normalize status
function normalizeStatus(raw: string): 'Scheduled' | 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled' {
  const l = (raw || '').toLowerCase();
  if (l.includes('cancel') || l.includes('no-show')) return 'Cancelled';
  if (l.includes('complete') || l.includes('done') || l.includes('attended')) return 'Completed';
  if (l.includes('progress') || l.includes('consulting')) return 'In Progress';
  if (l.includes('wait') || l.includes('triage') || l.includes('check')) return 'Waiting';
  return 'Scheduled';
}

// Normalize priority
function normalizePriority(raw: string): 'Critical' | 'High' | 'Normal' | 'Routine' {
  const l = (raw || '').toLowerCase();
  if (l.includes('crit') || l.includes('emerg')) return 'Critical';
  if (l.includes('high') || l.includes('urg')) return 'High';
  if (l.includes('rout') || l.includes('low')) return 'Routine';
  return 'Normal';
}

// Normalize type
function normalizeType(raw: string): 'In-Person' | 'Video Consultation' | 'Follow-up' | 'Emergency' {
  const l = (raw || '').toLowerCase();
  if (l.includes('video') || l.includes('tele')) return 'Video Consultation';
  if (l.includes('follow')) return 'Follow-up';
  if (l.includes('emerg')) return 'Emergency';
  return 'In-Person';
}

// Parse and validate rows
export async function previewCsv(csvText: string): Promise<CsvPreviewResult> {
  const { headers, rows } = parseCsvText(csvText);
  const { mapping, matched, missingRequired } = detectColumnMapping(headers);
  const health = await checkDatabaseHealth();
  const store = getStore();

  // Load existing appointment keys to prevent duplicate appointments
  // A conflict is: same doctorId/doctorName + same date + same time (and not cancelled)
  // OR same appointmentId
  const existingSlotKeys = new Set<string>();
  const existingApptIds = new Set<string>();
  const existingPatientKeys = new Set<string>();

  // 1. Load from memory store
  store.appointments.forEach((apt) => {
    existingApptIds.add(apt.id);
    if (apt.status !== 'Cancelled') {
      const slotKey = `${apt.doctorName.toLowerCase()}|${apt.date}|${apt.time}`;
      existingSlotKeys.add(slotKey);
      const docIdKey = `${apt.doctorId.toLowerCase()}|${apt.date}|${apt.time}`;
      existingSlotKeys.add(docIdKey);
      const ptKey = `${apt.patientName.toLowerCase()}|${apt.date}|${apt.time}`;
      existingPatientKeys.add(ptKey);
    }
  });

  // 2. Load from MySQL if connected
  if (health.connected) {
    try {
      const pool = getPool();
      const table = health.table;
      const cols = health.columns.map((c) => c.toLowerCase());
      const doctorCol = cols.includes('doctor_name') ? 'doctor_name' : cols.find((c) => c.includes('doctor')) || 'doctor_name';
      const dateCol = cols.includes('appointment_date') ? 'appointment_date' : cols.find((c) => c.includes('date')) || 'appointment_date';
      const timeCol = cols.includes('appointment_time') ? 'appointment_time' : cols.find((c) => c.includes('time')) || 'appointment_time';
      const statusCol = cols.includes('status') ? 'status' : 'status';
      const idCol = cols.includes('id') ? 'id' : cols[0] || 'id';

      const [dbRows] = await pool.query<any[]>(
        `SELECT \`${idCol}\` as id, \`${doctorCol}\` as doctor_name, \`${dateCol}\` as appt_date, \`${timeCol}\` as appt_time, \`${statusCol}\` as status FROM \`${table}\``
      );

      dbRows.forEach((r) => {
        if (r.id) existingApptIds.add(String(r.id));
        const st = String(r.status || '').toLowerCase();
        if (!st.includes('cancel')) {
          const dStr = r.appt_date ? new Date(r.appt_date).toISOString().split('T')[0] : '';
          const tStr = normalizeTime(String(r.appt_time || ''));
          if (r.doctor_name && dStr && tStr) {
            existingSlotKeys.add(`${String(r.doctor_name).toLowerCase()}|${dStr}|${tStr}`);
          }
        }
      });
    } catch (err: any) {
      console.warn('[CSV Preview] Could not query MySQL for existing slots:', err.message);
    }
  }

  // Intra-batch tracking to prevent duplicates WITHIN the CSV itself
  const batchSlotKeys = new Set<string>();
  const batchApptIds = new Set<string>();

  const normalizedRows: NormalizedClinicRow[] = [];
  const duplicates: NormalizedClinicRow[] = [];
  const errors: Array<{ row: number; errors: string[] }> = [];

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const rowIndex = i + 2; // 1-indexed, +1 for header
    const rowErrors: string[] = [];

    const patientName = raw[mapping.patient_name || ''] || raw['Patient Name'] || raw['Name'] || '';
    const doctorName = raw[mapping.doctor_name || ''] || raw['Doctor Name'] || raw['Doctor'] || '';
    const rawDate = raw[mapping.appointment_date || ''] || raw['Date'] || raw['Appointment Date'] || '';
    const rawTime = raw[mapping.appointment_time || ''] || raw['Time'] || raw['Appointment Time'] || '';

    if (!patientName.trim()) {
      rowErrors.push('Missing required Patient Name.');
    }
    if (!doctorName.trim()) {
      rowErrors.push('Missing required Doctor Name.');
    }

    const date = normalizeDate(rawDate);
    const time = normalizeTime(rawTime);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      rowErrors.push(`Invalid date format '${rawDate}'. Expected YYYY-MM-DD.`);
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      rowErrors.push(`Invalid time format '${rawTime}'. Expected HH:MM.`);
    }

    // Generate or read IDs
    const givenApptId = (raw[mapping.appointment_id || ''] || raw['ID'] || raw['Appointment ID'] || '').trim();
    const apptId = givenApptId || `APT-CSV-${Date.now().toString().slice(-4)}-${i + 1}`;
    const patientId = raw[mapping.patient_id || ''] || raw['Patient ID'] || raw['MRN'] || `PT-${Math.floor(10600 + i)}`;

    // Try finding existing doctor for matching doctorId & department
    const foundDoc = store.doctors.find((d) => d.name.toLowerCase() === doctorName.toLowerCase() || doctorName.toLowerCase().includes(d.name.toLowerCase()));
    const doctorId = raw[mapping.doctor_id || ''] || foundDoc?.id || `DOC-${Math.floor(200 + i)}`;
    const department = raw[mapping.department || ''] || foundDoc?.department || 'General Medicine';

    const status = normalizeStatus(raw[mapping.status || ''] || raw['Status'] || '');
    const priority = normalizePriority(raw[mapping.priority || ''] || raw['Priority'] || '');
    const type = normalizeType(raw[mapping.type || ''] || raw['Type'] || '');
    const room = raw[mapping.room || ''] || foundDoc?.room || `Exam Room ${(i % 6) + 1}`;
    const chiefComplaint = raw[mapping.chief_complaint || ''] || raw['Chief Complaint'] || raw['Complaint'] || 'General Clinic Consultation';
    const disease = raw[mapping.disease || ''] || raw['Disease'] || raw['Diagnosis'] || 'Unspecified Clinical Diagnosis';

    const age = parseInt(raw[mapping.age || ''] || raw['Age'] || '40', 10);
    const gender = raw[mapping.gender || ''] || raw['Gender'] || 'Not Specified';
    const phone = raw[mapping.phone || ''] || raw['Phone'] || '+1 (555) 000-0000';
    const email = raw[mapping.email || ''] || raw['Email'] || `${patientName.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`;

    const waitingTime = parseInt(raw[mapping.waiting_time || ''] || raw['Wait Time'] || '10', 10);
    const consultationDuration = parseInt(raw[mapping.consultation_duration || ''] || raw['Duration'] || '20', 10);
    const revenue = parseFloat(raw[mapping.revenue || ''] || raw['Revenue'] || raw['Fee'] || '150');
    const notes = raw[mapping.notes || ''] || raw['Notes'] || '';

    // DUPLICATE CHECK:
    let isDuplicate = false;
    let duplicateReason: string | undefined;

    const docSlotKey = `${doctorName.toLowerCase()}|${date}|${time}`;
    const docIdSlotKey = `${doctorId.toLowerCase()}|${date}|${time}`;
    const ptSlotKey = `${patientName.toLowerCase()}|${date}|${time}`;

    const formatDocName = (n: string) => (n.toLowerCase().startsWith('dr') ? n : `Dr. ${n}`);

    if (givenApptId && (existingApptIds.has(givenApptId) || batchApptIds.has(givenApptId))) {
      isDuplicate = true;
      duplicateReason = `Appointment ID '${givenApptId}' already exists in database.`;
    } else if (existingSlotKeys.has(docSlotKey) || existingSlotKeys.has(docIdSlotKey)) {
      isDuplicate = true;
      duplicateReason = `Double-booking conflict: ${formatDocName(doctorName)} already has an active appointment on ${date} at ${time}.`;
    } else if (batchSlotKeys.has(docSlotKey) || batchSlotKeys.has(docIdSlotKey)) {
      isDuplicate = true;
      duplicateReason = `Duplicate within CSV: Another row already books ${formatDocName(doctorName)} on ${date} at ${time}.`;
    } else if (existingPatientKeys.has(ptSlotKey)) {
      isDuplicate = true;
      duplicateReason = `Patient '${patientName}' already has an appointment booked for ${date} at ${time}.`;
    }

    if (!isDuplicate && rowErrors.length === 0) {
      batchSlotKeys.add(docSlotKey);
      batchSlotKeys.add(docIdSlotKey);
      if (givenApptId) batchApptIds.add(givenApptId);
    }

    const rowResult: NormalizedClinicRow = {
      rowIndex,
      id: apptId,
      patientId,
      patientName,
      age: isNaN(age) ? undefined : age,
      gender,
      phone,
      email,
      doctorId,
      doctorName,
      department,
      date,
      time,
      status,
      priority,
      type,
      room,
      chiefComplaint,
      disease,
      waitingTime: isNaN(waitingTime) ? 10 : waitingTime,
      consultationDuration: isNaN(consultationDuration) ? 20 : consultationDuration,
      revenue: isNaN(revenue) ? 150 : revenue,
      notes,
      isValid: rowErrors.length === 0 && !isDuplicate,
      isDuplicate,
      validationErrors: rowErrors,
      duplicateReason,
    };

    normalizedRows.push(rowResult);
    if (isDuplicate) {
      duplicates.push(rowResult);
    }
    if (rowErrors.length > 0) {
      errors.push({ row: rowIndex, errors: rowErrors });
    }
  }

  const validRowsCount = normalizedRows.filter((r) => r.isValid).length;
  const duplicateCount = duplicates.length;
  const invalidCount = errors.length;

  return {
    success: true,
    totalRows: rows.length,
    validRowsCount,
    duplicateCount,
    invalidCount,
    headers,
    matchedColumns: matched,
    missingRequired,
    previewRows: normalizedRows,
    duplicates,
    errors,
    schemaStatus: {
      mysqlConnected: health.connected,
      database: health.database,
      table: health.table,
      columns: health.columns,
      error: health.error,
    },
  };
}

// Execute CSV Import into MySQL and Persistent Clinic Store
export async function importValidClinicRows(
  csvText: string,
  user?: { id: string; name: string; role: string },
  clientIp = '127.0.0.1'
): Promise<{
  success: boolean;
  message: string;
  importedCount: number;
  duplicatesSkipped: number;
  invalidSkipped: number;
  mysqlInserted: boolean;
  persistentStoreUpdated: boolean;
  skippedDetails: Array<{ row: number; patient: string; doctor: string; date: string; time: string; reason: string }>;
}> {
  const preview = await previewCsv(csvText);
  const validRows = preview.previewRows.filter((r) => r.isValid);
  const duplicates = preview.duplicates;

  if (validRows.length === 0) {
    return {
      success: false,
      message: preview.totalRows === 0
        ? 'CSV file is empty.'
        : `No valid rows to import. Found ${preview.duplicateCount} duplicate appointments and ${preview.invalidCount} invalid rows.`,
      importedCount: 0,
      duplicatesSkipped: preview.duplicateCount,
      invalidSkipped: preview.invalidCount,
      mysqlInserted: false,
      persistentStoreUpdated: false,
      skippedDetails: duplicates.map((d) => ({
        row: d.rowIndex,
        patient: d.patientName,
        doctor: d.doctorName,
        date: d.date,
        time: d.time,
        reason: d.duplicateReason || 'Duplicate appointment slot',
      })),
    };
  }

  const store = getStore();
  let mysqlInserted = false;

  // 1. If MySQL is connected, insert rows into MySQL clinic_data table
  const health = await checkDatabaseHealth();
  if (health.connected) {
    try {
      await ensureClinicDataTableExists();
      const pool = getPool();
      const table = health.table || 'clinic_data';
      const cols = health.columns.map((c) => c.toLowerCase());

      for (const row of validRows) {
        // Build dynamic parameterized INSERT based on existing columns in clinic_data
        const insertCols: string[] = [];
        const placeholders: string[] = [];
        const values: any[] = [];

        const colMap: Record<string, any> = {
          id: row.id,
          patient_id: row.patientId,
          patient_name: row.patientName,
          age: row.age || 40,
          gender: row.gender || 'Not Specified',
          phone: row.phone || '',
          email: row.email || '',
          doctor_id: row.doctorId,
          doctor_name: row.doctorName,
          department: row.department,
          appointment_date: row.date,
          appointment_time: row.time,
          status: row.status,
          priority: row.priority,
          type: row.type,
          room: row.room,
          chief_complaint: row.chiefComplaint,
          disease: row.disease,
          waiting_time: row.waitingTime,
          consultation_duration: row.consultationDuration,
          revenue: row.revenue,
          notes: row.notes,
        };

        for (const [colName, colVal] of Object.entries(colMap)) {
          if (cols.length === 0 || cols.includes(colName.toLowerCase())) {
            insertCols.push(`\`${colName}\``);
            placeholders.push('?');
            values.push(colVal);
          }
        }

        if (insertCols.length > 0) {
          const sql = `INSERT INTO \`${table}\` (${insertCols.join(', ')}) VALUES (${placeholders.join(', ')})`;
          await pool.query(sql, values);
        }
      }
      mysqlInserted = true;
    } catch (dbErr: any) {
      console.warn('[CSV Import] MySQL insertion encountered error, will ensure persistent JSON store is updated:', dbErr.message);
    }
  }

  // 2. Insert into Persistent JSON Store (Appointments & Patients)
  for (const row of validRows) {
    // A. Add Appointment
    const newAppointment: Appointment = {
      id: row.id,
      patientId: row.patientId,
      patientName: row.patientName,
      doctorId: row.doctorId,
      doctorName: row.doctorName,
      department: row.department,
      date: row.date,
      time: row.time,
      type: row.type,
      status: row.status,
      priority: row.priority,
      chiefComplaint: row.chiefComplaint,
      room: row.room,
      checkedIn: row.status === 'Waiting' || row.status === 'In Progress' || row.status === 'Completed',
      notes: row.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.appointments.unshift(newAppointment);

    // B. Check if Patient exists in store, if not create Patient profile
    const existingPt = store.patients.find(
      (p) => p.id === row.patientId || p.name.toLowerCase() === row.patientName.toLowerCase()
    );
    if (!existingPt) {
      const newPatient: Patient = {
        id: row.patientId,
        mrn: `MRN-${Math.floor(80000 + Math.random() * 10000)}`,
        name: row.patientName,
        age: row.age || 42,
        gender: row.gender || 'Not Specified',
        phone: row.phone || '+1 (555) 234-5678',
        email: row.email || `${row.patientName.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
        address: 'Clinical Outpatient Center, Sector 4',
        bloodType: 'O+',
        allergies: [],
        department: row.department,
        assignedDoctor: row.doctorName,
        primaryDiagnosis: row.disease,
        admissionDate: row.date,
        lastVisit: row.date,
        triageStatus: row.priority === 'Critical' ? 'Critical' : row.priority === 'High' ? 'Urgent' : 'Stable',
        insuranceProvider: 'Standard Healthcare Coverage',
        insurancePolicyNumber: `SHC-${Math.floor(100000 + Math.random() * 900000)}`,
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Next of Kin',
          phone: row.phone || '+1 (555) 000-0000',
        },
      };
      store.patients.unshift(newPatient);
    }
  }

  // 3. Persist Store to Disk
  saveStore(store);

  // 4. Log Audit Event
  logAudit(
    user?.id || 'ADM-CSV',
    user?.name || 'Administrator',
    user?.role || 'admin',
    'CSV_IMPORT_CLINIC_DATA',
    'ClinicData',
    `Imported ${validRows.length} valid rows into clinic_data. Filtered ${duplicates.length} duplicate appointments. MySQL sync: ${mysqlInserted ? 'YES' : 'STANDBY'}.`,
    `BATCH-${Date.now()}`,
    clientIp
  );

  return {
    success: true,
    message: `Successfully imported ${validRows.length} valid appointment rows into clinic_data. Skipped ${duplicates.length} duplicate appointments to prevent scheduling conflicts.${
      mysqlInserted ? ' Synced to MySQL clinic_data table and persistent storage.' : ' Saved to persistent storage engine.'
    }`,
    importedCount: validRows.length,
    duplicatesSkipped: duplicates.length,
    invalidSkipped: preview.invalidCount,
    mysqlInserted,
    persistentStoreUpdated: true,
    skippedDetails: duplicates.map((d) => ({
      row: d.rowIndex,
      patient: d.patientName,
      doctor: d.doctorName,
      date: d.date,
      time: d.time,
      reason: d.duplicateReason || 'Duplicate appointment slot',
    })),
  };
}

// Generate Realistic Sample AI Clinic CSV Data
export function generateSampleClinicCsv(): string {
  const headers = [
    'Patient Name',
    'Patient ID',
    'Age',
    'Gender',
    'Phone',
    'Doctor Name',
    'Department',
    'Appointment Date',
    'Appointment Time',
    'Status',
    'Priority',
    'Type',
    'Room',
    'Chief Complaint',
    'Diagnosis',
    'Waiting Time',
    'Duration',
    'Fee',
  ];

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextDay = new Date(Date.now() + 172800000).toISOString().split('T')[0];

  const sampleRows = [
    [
      'Clara Oswald',
      'PT-10501',
      '28',
      'Female',
      '+1 (555) 782-9901',
      'Dr. Sarah Chen, MD',
      'Cardiology',
      today,
      '11:00',
      'Scheduled',
      'Normal',
      'In-Person',
      'Bay 4A — Echo Suite',
      'Follow-up post ambulatory blood pressure monitoring',
      'Essential Hypertension',
      '8',
      '20',
      '180.00',
    ],
    [
      'Robert Sterling',
      'PT-10502',
      '62',
      'Male',
      '+1 (555) 345-8812',
      'Dr. Marcus Vance, MD',
      'Neurology',
      today,
      '14:00',
      'Scheduled',
      'High',
      'In-Person',
      'Bay 2B — Neuro Pod',
      'Persistent unilateral headache and visual aura',
      'Migraine with Aura',
      '12',
      '25',
      '195.00',
    ],
    [
      'Lucia Morales',
      'PT-10503',
      '45',
      'Female',
      '+1 (555) 456-1123',
      'Dr. Elena Rostova, MD',
      'Endocrinology',
      tomorrow,
      '09:30',
      'Scheduled',
      'Normal',
      'Video Consultation',
      'Suite 101 — Metabolic Lab',
      'Routine quarterly thyroid panel review',
      "Hashimoto's Thyroiditis",
      '5',
      '15',
      '175.00',
    ],
    [
      'David K. Thorne',
      'PT-10504',
      '53',
      'Male',
      '+1 (555) 998-3344',
      'Dr. Tariq Al-Mansoor, MD',
      'Pulmonology',
      tomorrow,
      '10:30',
      'Scheduled',
      'High',
      'In-Person',
      'Bay 3C — Respiratory Care',
      'Nocturnal dyspnea and persistent wheezing',
      'Severe Adult Onset Asthma',
      '14',
      '30',
      '185.00',
    ],
    [
      'Maya Lin',
      'PT-10505',
      '9',
      'Female',
      '+1 (555) 234-7766',
      'Dr. Alex Patel, MD',
      'Pediatrics',
      nextDay,
      '10:00',
      'Scheduled',
      'Routine',
      'In-Person',
      'Room 204 — Pediatric Wing',
      'Annual pediatric milestone and vision check',
      'Routine Child Health Examination',
      '6',
      '20',
      '150.00',
    ],
    [
      'Arthur Pendelton',
      'PT-10493',
      '67',
      'Male',
      '+1 (555) 345-6789',
      'Dr. Marcus Vance, MD',
      'Neurology',
      '2026-10-10',
      '10:30',
      'Scheduled',
      'High',
      'In-Person',
      'Bay 2B — Neuro Pod',
      'Conflicting booking slot - Existing appointment already booked for Dr Vance',
      'Transient Ischemic Attack',
      '15',
      '20',
      '195.00',
    ],
    [
      'Gwen Stacy',
      'PT-10506',
      '26',
      'Female',
      '+1 (555) 123-9988',
      'Dr. Sarah Chen, MD',
      'Cardiology',
      nextDay,
      '15:00',
      'Scheduled',
      'Normal',
      'In-Person',
      'Bay 4A — Echo Suite',
      'Holter monitor detachment and rhythm analysis',
      'Supraventricular Tachycardia',
      '9',
      '20',
      '180.00',
    ],
    [
      'Gwen Stacy',
      'PT-10506',
      '26',
      'Female',
      '+1 (555) 123-9988',
      'Dr. Sarah Chen, MD',
      'Cardiology',
      nextDay,
      '15:00',
      'Scheduled',
      'Normal',
      'In-Person',
      'Bay 4A — Echo Suite',
      'Intra-CSV duplicate attempt for same doctor, date and time',
      'Supraventricular Tachycardia',
      '9',
      '20',
      '180.00',
    ],
    [
      'Jonathan Miller',
      'PT-10507',
      '38',
      'Male',
      '+1 (555) 667-8899',
      'Dr. Elena Rostova, MD',
      'Endocrinology',
      tomorrow,
      '14:00',
      'Scheduled',
      'Normal',
      'In-Person',
      'Suite 101 — Metabolic Lab',
      'Pre-diabetic insulin resistance lifestyle consultation',
      'Impaired Fasting Glucose',
      '7',
      '25',
      '175.00',
    ],
  ];

  const escapeCsv = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const lines = [
    headers.map(escapeCsv).join(','),
    ...sampleRows.map((row) => row.map(escapeCsv).join(',')),
  ];

  return lines.join('\n');
}
