import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

// Get therapists with optional status filter (for admin approval)
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
    const status = searchParams.get('status') || 'all'; // pending, approved, all

    let query = `
      SELECT 
        t.id,
        t.user_id,
        t.full_name,
        t.specialization,
        t.years_of_experience,
        t.bio,
        t.phone,
        t.license_number,
        t.institution_name,
        t.country,
        t.contact_email,
        t.mission,
        t.verification_status,
        u.email,
        u.is_verified,
        u.is_active
      FROM therapists t
      JOIN users u ON t.user_id = u.id
      WHERE u.role = 'therapist'
    `;

    if (status === 'pending') {
      query += ' AND (u.is_verified = 0 OR t.verification_status = \'pending\')';
    } else if (status === 'approved') {
      query += ' AND u.is_verified = 1 AND t.verification_status = \'approved\'';
    }

    query += ' ORDER BY t.id DESC';

    const therapistsRes = await db.execute({ sql: query, args: [] });

    return NextResponse.json({
      success: true,
      data: therapistsRes.rows,
    });
  } catch (error) {
    console.error('Get therapists error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
