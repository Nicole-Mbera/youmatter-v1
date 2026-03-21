import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

// GET /api/admin/testimonials - Get all testimonials (pending or all)
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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // DB schema uses testimonial_text, patient_id/therapist_id, is_approved (BOOLEAN)
    let query = `
      SELECT
        t.id,
        t.testimonial_text AS content,
        t.rating,
        t.is_featured,
        t.is_approved,
        CASE WHEN t.is_approved = 1 THEN 'approved' ELSE 'pending' END AS approval_status,
        t.created_at,
        CASE WHEN t.patient_id IS NOT NULL THEN 'patient' ELSE 'therapist' END AS user_type,
        COALESCE(pu.email, tu.email) AS user_email,
        COALESCE(p.full_name, th.full_name) AS user_name,
        CASE
          WHEN t.patient_id IS NOT NULL THEN p.full_name
          ELSE th.specialization
        END AS additional_info
      FROM testimonials t
      LEFT JOIN patients p ON t.patient_id = p.id
      LEFT JOIN users pu ON p.user_id = pu.id
      LEFT JOIN therapists th ON t.therapist_id = th.id
      LEFT JOIN users tu ON th.user_id = tu.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status === 'pending') {
      query += ' AND t.is_approved = 0';
    } else if (status === 'approved') {
      query += ' AND t.is_approved = 1';
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const testimonialsRes = await db.execute({ sql: query, args: params });
    const testimonials = testimonialsRes.rows;

    // Get total count
    let countQuery = 'SELECT COUNT(*) as count FROM testimonials WHERE 1=1';
    const countParams: any[] = [];

    if (status === 'pending') {
      countQuery += ' AND is_approved = 0';
    } else if (status === 'approved') {
      countQuery += ' AND is_approved = 1';
    }

    const countRes = await db.execute({ sql: countQuery, args: countParams });
    const totalCount = (countRes.rows[0] as any).count;

    return NextResponse.json({
      success: true,
      data: testimonials,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('Get admin testimonials error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
