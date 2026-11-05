import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AppointmentRecord } from '../types/clinic';
import { getField, findDoctorColumn, findDepartmentColumn, findMatchingColumn } from './supabaseClinicService';

export interface RealtimeAppointmentEvent {
  type: 'created' | 'updated';
  appointment: AppointmentRecord;
  source: 'supabase_postgres' | 'supabase_broadcast' | 'server_sse' | 'local_broadcast';
  timestamp: string;
}

type RealtimeListener = (event: RealtimeAppointmentEvent) => void;

// Memory cache to deduplicate events across Supabase, SSE, and local broadcasts
const deduplicationCache = new Map<string, number>();
const DEDUPLICATION_WINDOW_MS = 20000; // 20 seconds

function getEventKey(type: string, apt: Partial<AppointmentRecord>): string {
  const aptId = apt.id || 'unknown';
  const status = apt.status || 'Scheduled';
  const checkedIn = apt.checkedIn ? '1' : '0';
  const date = apt.date || '';
  const time = apt.time || '';
  return `${type}_${aptId}_${status}_${checkedIn}_${date}_${time}`;
}

export function isDuplicateEvent(type: string, apt: Partial<AppointmentRecord>): boolean {
  const key = getEventKey(type, apt);
  const now = Date.now();
  const lastTime = deduplicationCache.get(key);

  // Clean old keys occasionally
  if (deduplicationCache.size > 200) {
    for (const [k, t] of deduplicationCache.entries()) {
      if (now - t > DEDUPLICATION_WINDOW_MS) {
        deduplicationCache.delete(k);
      }
    }
  }

  if (lastTime && now - lastTime < DEDUPLICATION_WINDOW_MS) {
    return true;
  }

  deduplicationCache.set(key, now);
  return false;
}

export function markEventAsHandled(type: string, apt: Partial<AppointmentRecord>) {
  const key = getEventKey(type, apt);
  deduplicationCache.set(key, Date.now());
}

/**
 * Normalizes a raw Postgres table row from public."clinic data" or public.clinic_data
 * into a complete AppointmentRecord.
 */
export function normalizePostgresRowToAppointment(row: any): AppointmentRecord {
  if (!row || typeof row !== 'object') {
    throw new Error('Invalid row object received from Postgres change');
  }

  const cols = Object.keys(row);
  const docCol = findDoctorColumn(cols);
  const deptCol = findDepartmentColumn(cols);
  const dateCol = findMatchingColumn(cols, ['appointment_date', 'Appointment_Date', 'date', 'visit_date']);
  const timeCol = findMatchingColumn(cols, ['appointment_time', 'Appointment_Time', 'time', 'slot']);
  const statusCol = findMatchingColumn(cols, ['status', 'Status', 'appointment_status', 'state']);
  const priorityCol = findMatchingColumn(cols, ['priority', 'Priority', 'urgency', 'triage_priority']);
  const complaintCol = findMatchingColumn(cols, ['chief_complaint', 'Chief_Complaint', 'disease', 'Disease', 'diagnosis', 'Diagnosis', 'condition']);
  const roomCol = findMatchingColumn(cols, ['room', 'Room', 'exam_room', 'clinic_room', 'suite']);

  const id = String(getField(row, ['id', 'appointment_id', 'appt_id', 'Appointment_ID'], `APT-${Date.now().toString().slice(-4)}`));
  const patientId = String(getField(row, ['patient_id', 'Patient_ID', 'mrn', 'id'], 'PT-10492'));
  const patientName = String(getField(row, ['patient_name', 'Patient_Name', 'patient', 'name', 'full_name'], 'Clinical Patient'));
  const patientEmail = getField(row, ['email', 'Email', 'patient_email'], undefined);

  let doctorName = 'Attending Physician';
  if (docCol && row[docCol]) {
    doctorName = String(row[docCol]).trim();
  } else {
    doctorName = String(getField(row, ['doctor_name', 'Doctor_Name', 'doctor', 'Doctor', 'physician', 'provider'], 'Attending Physician')).trim();
  }

  const doctorId = String(getField(row, ['doctor_id', 'Doctor_ID', 'doc_id'], 'DOC-101'));
  const department = deptCol && row[deptCol] ? String(row[deptCol]).trim() : 'General Medicine';
  
  const rawDate = dateCol && row[dateCol] ? String(row[dateCol]) : new Date().toISOString().split('T')[0];
  const date = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
  const time = timeCol && row[timeCol] ? String(row[timeCol]) : '09:00';

  const rawStatus = statusCol && row[statusCol] ? String(row[statusCol]) : 'Scheduled';
  let status: AppointmentRecord['status'] = 'Scheduled';
  if (/completed/i.test(rawStatus)) status = 'Completed';
  else if (/waiting/i.test(rawStatus)) status = 'Waiting';
  else if (/progress/i.test(rawStatus)) status = 'In Progress';
  else if (/cancel/i.test(rawStatus)) status = 'Cancelled';
  else if (/urgent/i.test(rawStatus) || /triage/i.test(rawStatus)) status = 'Urgent Triage';

  const rawPriority = priorityCol && row[priorityCol] ? String(row[priorityCol]) : 'Normal';
  let priority: AppointmentRecord['priority'] = 'Normal';
  if (/critical/i.test(rawPriority)) priority = 'Critical';
  else if (/high/i.test(rawPriority)) priority = 'High';
  else if (/routine/i.test(rawPriority)) priority = 'Routine';

  const chiefComplaint = complaintCol && row[complaintCol] ? String(row[complaintCol]) : 'Clinical Consultation';
  const room = roomCol && row[roomCol] ? String(row[roomCol]) : 'Exam Room 1';

  return {
    id,
    patientId,
    patientName,
    patientEmail,
    doctorId,
    doctorName,
    department,
    date,
    time,
    type: 'In-Person',
    status,
    priority,
    chiefComplaint,
    room,
    checkedIn: status === 'Waiting' || Boolean(getField(row, ['checked_in', 'checkedIn'], false)),
    createdAt: String(getField(row, ['created_at', 'createdAt'], new Date().toISOString())),
  };
}

// Active listeners registry
const listeners = new Set<RealtimeListener>();

// Cross-tab broadcast channel
let localBroadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    localBroadcastChannel = new BroadcastChannel('ai_clinic_appointments_realtime');
    localBroadcastChannel.onmessage = (event) => {
      const data = event.data;
      if (data && (data.type === 'created' || data.type === 'updated') && data.appointment) {
        if (!isDuplicateEvent(data.type, data.appointment)) {
          notifyListeners({
            type: data.type,
            appointment: data.appointment,
            source: 'local_broadcast',
            timestamp: new Date().toISOString(),
          });
        }
      }
    };
  }
} catch {
  // BroadcastChannel unavailable
}

function notifyListeners(event: RealtimeAppointmentEvent) {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch (err) {
      console.warn('[RealtimeSync] Listener callback error:', err);
    }
  }
}

// Supabase Channel holder
let activeSupabaseChannel: any = null;
let isChannelSubscribed = false;

// Initialize Supabase Realtime subscription
export function initializeSupabaseRealtime(): () => void {
  // 1. Supabase Realtime Channel
  if (isSupabaseConfigured() && !isChannelSubscribed) {
    try {
      activeSupabaseChannel = supabase.channel('ai-clinic-realtime-appointments', {
        config: {
          broadcast: { self: false },
        },
      });

      // A. Listen to Supabase Broadcast events (instantly delivers client-to-client updates)
      activeSupabaseChannel.on(
        'broadcast',
        { event: 'appointment_created' },
        (payload: any) => {
          const apt = payload.payload;
          if (apt && !isDuplicateEvent('created', apt)) {
            notifyListeners({
              type: 'created',
              appointment: apt,
              source: 'supabase_broadcast',
              timestamp: new Date().toISOString(),
            });
          }
        }
      );

      activeSupabaseChannel.on(
        'broadcast',
        { event: 'appointment_status_updated' },
        (payload: any) => {
          const apt = payload.payload;
          if (apt && !isDuplicateEvent('updated', apt)) {
            notifyListeners({
              type: 'updated',
              appointment: apt,
              source: 'supabase_broadcast',
              timestamp: new Date().toISOString(),
            });
          }
        }
      );

      // B. Listen to Supabase Postgres Table Changes on "clinic data" (space)
      activeSupabaseChannel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'clinic data' },
        (payload: any) => {
          try {
            const apt = normalizePostgresRowToAppointment(payload.new);
            if (!isDuplicateEvent('created', apt)) {
              notifyListeners({
                type: 'created',
                appointment: apt,
                source: 'supabase_postgres',
                timestamp: new Date().toISOString(),
              });
            }
          } catch (err) {
            console.warn('[RealtimeSync] Could not normalize inserted row:', err);
          }
        }
      );

      activeSupabaseChannel.on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'clinic data' },
        (payload: any) => {
          try {
            const apt = normalizePostgresRowToAppointment(payload.new);
            if (!isDuplicateEvent('updated', apt)) {
              notifyListeners({
                type: 'updated',
                appointment: apt,
                source: 'supabase_postgres',
                timestamp: new Date().toISOString(),
              });
            }
          } catch (err) {
            console.warn('[RealtimeSync] Could not normalize updated row:', err);
          }
        }
      );

      // C. Also listen to "clinic_data" (underscore) if table name varies
      activeSupabaseChannel.on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'clinic_data' },
        (payload: any) => {
          try {
            const apt = normalizePostgresRowToAppointment(payload.new);
            if (!isDuplicateEvent('created', apt)) {
              notifyListeners({
                type: 'created',
                appointment: apt,
                source: 'supabase_postgres',
                timestamp: new Date().toISOString(),
              });
            }
          } catch {}
        }
      );

      activeSupabaseChannel.on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'clinic_data' },
        (payload: any) => {
          try {
            const apt = normalizePostgresRowToAppointment(payload.new);
            if (!isDuplicateEvent('updated', apt)) {
              notifyListeners({
                type: 'updated',
                appointment: apt,
                source: 'supabase_postgres',
                timestamp: new Date().toISOString(),
              });
            }
          } catch {}
        }
      );

      activeSupabaseChannel.subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          isChannelSubscribed = true;
          console.log('[RealtimeSync] Supabase Realtime channel connected successfully.');
        }
      });
    } catch (sbErr) {
      console.warn('[RealtimeSync] Supabase Realtime channel initialization notice:', sbErr);
    }
  }

  // 2. Server-Sent Events (SSE) Fallback connection to /api/appointments/events
  let eventSource: EventSource | null = null;
  try {
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      eventSource = new EventSource('/api/appointments/events');
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.data) {
            const apt: AppointmentRecord = parsed.data;
            const type = parsed.type === 'created' ? 'created' : 'updated';
            if (!isDuplicateEvent(type, apt)) {
              notifyListeners({
                type,
                appointment: apt,
                source: 'server_sse',
                timestamp: parsed.timestamp || new Date().toISOString(),
              });
            }
          }
        } catch {
          // ignore heartbeat or parse errors
        }
      };
      eventSource.onerror = () => {
        // EventSource will automatically reconnect
      };
    }
  } catch {
    // SSE unavailable
  }

  return () => {
    if (eventSource) {
      eventSource.close();
    }
  };
}

/**
 * Register a listener for real-time appointment updates.
 */
export function subscribeToAppointmentEvents(listener: RealtimeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Publishes a newly created appointment across all real-time channels:
 * - Supabase Realtime Broadcast
 * - Browser BroadcastChannel (for immediate cross-tab sync)
 * - Supabase database table insertion (if configured)
 */
export async function broadcastNewAppointment(appointment: AppointmentRecord) {
  // 1. Mark in deduplication cache so this local client doesn't double-notify
  markEventAsHandled('created', appointment);

  // 2. Local cross-tab broadcast
  if (localBroadcastChannel) {
    try {
      localBroadcastChannel.postMessage({
        type: 'created',
        appointment,
      });
    } catch {}
  }

  // 3. Supabase Realtime Broadcast
  if (activeSupabaseChannel && isChannelSubscribed) {
    try {
      await activeSupabaseChannel.send({
        type: 'broadcast',
        event: 'appointment_created',
        payload: appointment,
      });
    } catch (err) {
      console.warn('[RealtimeSync] Supabase broadcast created error:', err);
    }
  }

  // 4. Asynchronous write to Supabase "clinic data" table if configured
  if (isSupabaseConfigured()) {
    try {
      const rowPayload = {
        'Patient Id': appointment.patientId,
        'Patient Name': appointment.patientName,
        'Doctor Name': appointment.doctorName,
        'Doctor Id': appointment.doctorId,
        'Department': appointment.department,
        'Appointment Date': appointment.date,
        'Appointment Time': appointment.time,
        'Status': appointment.status,
        'Priority': appointment.priority,
        'Disease': appointment.chiefComplaint,
        'Room': appointment.room,
        'created_at': appointment.createdAt || new Date().toISOString(),
      };

      // Try inserting into "clinic data"
      const { error } = await supabase.from('clinic data').insert([rowPayload]);
      if (error && (error.code === '42P01' || error.message.includes('relation'))) {
        // Fallback to clinic_data table name
        await supabase.from('clinic_data').insert([rowPayload]);
      }
    } catch (dbErr) {
      // Non-blocking: data store / backend already has the record
      console.warn('[RealtimeSync] Background Supabase insert notice:', dbErr);
    }
  }
}

/**
 * Publishes an appointment status update across all real-time channels.
 */
export async function broadcastUpdatedAppointment(appointment: AppointmentRecord) {
  // 1. Mark in deduplication cache
  markEventAsHandled('updated', appointment);

  // 2. Local cross-tab broadcast
  if (localBroadcastChannel) {
    try {
      localBroadcastChannel.postMessage({
        type: 'updated',
        appointment,
      });
    } catch {}
  }

  // 3. Supabase Realtime Broadcast
  if (activeSupabaseChannel && isChannelSubscribed) {
    try {
      await activeSupabaseChannel.send({
        type: 'broadcast',
        event: 'appointment_status_updated',
        payload: appointment,
      });
    } catch (err) {
      console.warn('[RealtimeSync] Supabase broadcast updated error:', err);
    }
  }

  // 4. Update row in Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('clinic data')
        .update({
          'Status': appointment.status,
          'Waiting_Time': appointment.waitTimeMinutes || 0,
        })
        .or(`id.eq.${appointment.id},Appointment_ID.eq.${appointment.id}`);
    } catch {}
  }
}
