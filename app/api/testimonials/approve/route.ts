
import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    let query = `
      SELECT
        t.id,
        t.testimonial_text AS content,
        t.rating,
        t.created_at,
        CASE WHEN t.patient_id IS NOT NULL THEN 'patient' ELSE 'therapist' END AS user_type,
        COALESCE(pu.email, tu.email) AS email,
        COALESCE(p.full_name, th.full_name) AS full_name
      FROM testimonials t
      LEFT JOIN patients p ON t.patient_id = p.id
      LEFT JOIN users pu ON p.user_id = pu.id
      LEFT JOIN therapists th ON t.therapist_id = th.id
      LEFT JOIN users tu ON th.user_id = tu.id
      WHERE 1=1
    `;

    if (status === 'pending') {
      query += ' AND t.is_approved = 0';
    } else if (status === 'approved') {
      query += ' AND t.is_approved = 1';
    }

    query += ' ORDER BY t.created_at DESC';

    const testimonialsRes = await db.execute({
      sql: query,
      args: []
    });

    return NextResponse.json({
      success: true,
      data: testimonialsRes.rows,
    });
  } catch (error) {
    console.error('Get approve testimonials error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { testimonial_id, action } = await request.json();

    if (!testimonial_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const testimonialRes = await db.execute({
      sql: 'SELECT * FROM testimonials WHERE id = ?',
      args: [testimonial_id]
    });
    const testimonial = testimonialRes.rows[0];

    if (!testimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      await db.execute({
        sql: `UPDATE testimonials SET is_approved = 1 WHERE id = ?`,
        args: [testimonial_id]
      });

      // Log activity
      await db.execute({
        sql: `INSERT INTO user_activity (user_id, activity_type, details)
           VALUES (?, 'testimonial_approved', ?)`,
        args: [currentUser.userId, JSON.stringify({ testimonial_id })]
      });

      return NextResponse.json({
        success: true,
        message: 'Testimonial approved',
      });
    } else if (action === 'reject') {
      // Just delete for now, or could have a 'rejected' status
      await db.execute({
        sql: `DELETE FROM testimonials WHERE id = ?`,
        args: [testimonial_id]
      });

      await db.execute({
        sql: `INSERT INTO user_activity (user_id, activity_type, details)
            VALUES (?, 'testimonial_rejected', ?)`,
        args: [currentUser.userId, JSON.stringify({ testimonial_id })]
      });

      return NextResponse.json({
        success: true,
        message: 'Testimonial rejected and removed',
      });
    } else if (action === 'feature') {
      await db.execute({
        sql: 'UPDATE testimonials SET is_featured = 1 WHERE id = ?',
        args: [testimonial_id]
      });
      return NextResponse.json({ success: true, message: 'Testimonial featured' });
    } else if (action === 'unfeature') {
      await db.execute({
        sql: 'UPDATE testimonials SET is_featured = 0 WHERE id = ?',
        args: [testimonial_id]
      });
      return NextResponse.json({ success: true, message: 'Testimonial unfeatured' });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Approve testimonial error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
