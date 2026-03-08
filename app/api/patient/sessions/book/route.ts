import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { getUserFromRequest } from '@/lib/auth';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:youmatter.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

interface BookSessionRequest {
  clinician_id: number | string;
  scheduled_date: string;
  scheduled_time: string;
  session_type: 'individual' | 'couple' | 'family';
  notes?: string;
}

// POST /api/patient/sessions/book - Book a session
export async function POST(request: Request) {
  try {
    // Get authenticated user
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'patient') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: BookSessionRequest = await request.json();
    const { clinician_id, scheduled_date, scheduled_time, session_type, notes } = body;

    if (!clinician_id || !scheduled_date || !scheduled_time) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get patient ID from user
    const patientResult = await client.execute({
      sql: 'SELECT id FROM patients WHERE user_id = ?',
      args: [user.userId],
    });

    if (patientResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient profile not found' },
        { status: 404 }
      );
    }

    // Get patient details for email
    const patientDetailsResult = await client.execute({
      sql: 'SELECT full_name FROM patients WHERE id = ?',
      args: [patientId],
    });
    const patientDetails = patientDetailsResult.rows[0] as { full_name: string };

    // Get therapist details for email
    const therapistDetailsResult = await client.execute({
      sql: 'SELECT full_name FROM therapists WHERE id = ?',
      args: [parseInt(String(clinician_id))],
    });
    const therapistDetails = therapistDetailsResult.rows[0] as { full_name: string };

    // Generate unique Jitsi meeting link
    const sessionId = `youmatter-${clinician_id}-${user.userId}-${Date.now()}`;
    const jitsiLink = `https://meet.jit.si/${sessionId}`;

    // Create session record
    const result = await client.execute({
      sql: `INSERT INTO sessions (
        patient_id, 
        therapist_id, 
        scheduled_date, 
        scheduled_time, 
        session_type, 
        notes,
        meeting_link,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        patientId,
        parseInt(String(clinician_id)),
        scheduled_date,
        scheduled_time,
        session_type,
        notes || '',
        jitsiLink,
        'scheduled',
      ],
    });

    // TODO: Send confirmation emails
    // For now, just return success

    return NextResponse.json({
      success: true,
      data: {
        session_id: result.lastInsertRowid,
        status: 'scheduled',
        meeting_link: jitsiLink,
      },
    });
  } catch (error) {
    console.error('Error booking session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to book session' },
      { status: 500 }
    );
  }
}
