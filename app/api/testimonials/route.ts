import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import db from '@/lib/db';

// GET /api/testimonials - Get approved testimonials for public display
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const featured = searchParams.get('featured') === 'true';

    // DB schema: testimonial_text, patient_id/therapist_id, is_approved BOOLEAN
    let query = `
      SELECT
        t.id,
        t.testimonial_text AS content,
        t.rating,
        t.created_at,
        CASE WHEN t.patient_id IS NOT NULL THEN 'patient' ELSE 'therapist' END AS user_type,
        COALESCE(p.full_name, th.full_name) AS user_name,
        CASE
          WHEN t.patient_id IS NOT NULL THEN 'patient'
          ELSE th.specialization
        END AS user_role_display
      FROM testimonials t
      LEFT JOIN patients p ON t.patient_id = p.id
      LEFT JOIN therapists th ON t.therapist_id = th.id
      WHERE t.is_approved = 1
    `;

    const params: any[] = [];

    if (featured) {
      query += ' AND t.is_featured = 1';
    }

    query += ' ORDER BY t.created_at DESC LIMIT ?';
    params.push(limit);

    const testimonialsRes = await db.execute({ sql: query, args: params });

    return NextResponse.json({
      success: true,
      data: testimonialsRes.rows,
    });
  } catch (error) {
    console.error('Get testimonials error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/testimonials - Create a new testimonial
export async function POST(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login to leave a testimonial.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, rating } = body;

    if (!content || !rating) {
      return NextResponse.json(
        { error: 'Content and rating are required' },
        { status: 400 }
      );
    }

    const userRole = currentUser.role === 'admin' ? 'patient' : currentUser.role;

    if (userRole === 'patient') {
      // Look up patient record
      const patientRes = await db.execute({
        sql: 'SELECT id FROM patients WHERE user_id = ?',
        args: [currentUser.userId],
      });
      const patient = patientRes.rows[0] as any;

      if (!patient) {
        return NextResponse.json(
          { error: 'Patient profile not found.' },
          { status: 404 }
        );
      }

      // Check for existing testimonial
      const existingRes = await db.execute({
        sql: 'SELECT id FROM testimonials WHERE patient_id = ?',
        args: [patient.id],
      });
      if (existingRes.rows.length > 0) {
        return NextResponse.json(
          { error: 'You have already submitted a testimonial.' },
          { status: 400 }
        );
      }

      await db.execute({
        sql: `INSERT INTO testimonials (patient_id, testimonial_text, rating, is_approved, is_featured)
              VALUES (?, ?, ?, 0, 0)`,
        args: [patient.id, content, rating],
      });
    } else {
      // therapist
      const therapistRes = await db.execute({
        sql: 'SELECT id FROM therapists WHERE user_id = ?',
        args: [currentUser.userId],
      });
      const therapist = therapistRes.rows[0] as any;

      if (!therapist) {
        return NextResponse.json(
          { error: 'Therapist profile not found.' },
          { status: 404 }
        );
      }

      const existingRes = await db.execute({
        sql: 'SELECT id FROM testimonials WHERE therapist_id = ?',
        args: [therapist.id],
      });
      if (existingRes.rows.length > 0) {
        return NextResponse.json(
          { error: 'You have already submitted a testimonial.' },
          { status: 400 }
        );
      }

      await db.execute({
        sql: `INSERT INTO testimonials (therapist_id, testimonial_text, rating, is_approved, is_featured)
              VALUES (?, ?, ?, 0, 0)`,
        args: [therapist.id, content, rating],
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Testimonial submitted successfully. It will be visible after approval.',
    }, { status: 201 });

  } catch (error) {
    console.error('Create testimonial error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
