import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

// GET /api/clinician/availability - Get the therapist's weekly availability schedule
export async function GET(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);
    if (!currentUser || !hasRole(currentUser, 'therapist')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const therapistRes = await db.execute({
      sql: 'SELECT id FROM therapists WHERE user_id = ?',
      args: [currentUser.userId],
    });
    const therapist = therapistRes.rows[0] as unknown as { id: number } | undefined;

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    const schedulesRes = await db.execute({
      sql: 'SELECT * FROM availability_schedules WHERE therapist_id = ? ORDER BY day_of_week, start_time',
      args: [therapist.id],
    });

    return NextResponse.json({ success: true, data: schedulesRes.rows });
  } catch (error) {
    console.error('Get availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/clinician/availability - Replace the therapist's full weekly schedule
// Body: { schedules: [{ day_of_week: 0-6, start_time: "HH:MM", end_time: "HH:MM", is_available: boolean }] }
export async function PUT(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);
    if (!currentUser || !hasRole(currentUser, 'therapist')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const therapistRes = await db.execute({
      sql: 'SELECT id FROM therapists WHERE user_id = ?',
      args: [currentUser.userId],
    });
    const therapist = therapistRes.rows[0] as unknown as { id: number } | undefined;

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 });
    }

    const { schedules } = await request.json();

    if (!Array.isArray(schedules)) {
      return NextResponse.json({ error: 'schedules must be an array' }, { status: 400 });
    }

    // Validate entries
    for (const s of schedules) {
      if (
        typeof s.day_of_week !== 'number' ||
        s.day_of_week < 0 || s.day_of_week > 6 ||
        typeof s.start_time !== 'string' ||
        typeof s.end_time !== 'string'
      ) {
        return NextResponse.json(
          { error: 'Each schedule entry must have day_of_week (0-6), start_time, and end_time' },
          { status: 400 }
        );
      }
    }

    // Delete existing and re-insert (full replace)
    await db.execute({
      sql: 'DELETE FROM availability_schedules WHERE therapist_id = ?',
      args: [therapist.id],
    });

    for (const s of schedules) {
      await db.execute({
        sql: `INSERT INTO availability_schedules (therapist_id, day_of_week, start_time, end_time, is_available)
              VALUES (?, ?, ?, ?, ?)`,
        args: [therapist.id, s.day_of_week, s.start_time, s.end_time, s.is_available !== false ? 1 : 0],
      });
    }

    return NextResponse.json({ success: true, message: 'Availability updated' });
  } catch (error) {
    console.error('Update availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
