import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/admin/users - Get all users with statistics
export async function GET(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Get all users with their profile information
    const usersRes = await db.execute({
      sql: `SELECT 
        u.id,
        u.email,
        u.role,
        u.is_verified,
        u.is_active,
        u.created_at,
        CASE 
          WHEN u.role = 'patient' THEN p.full_name
          WHEN u.role = 'therapist' THEN t.full_name
          WHEN u.role = 'admin' THEN a.full_name
        END as full_name,
        CASE 
          WHEN u.role = 'patient' THEN p.username
          ELSE NULL
        END as username
      FROM users u
      LEFT JOIN patients p ON u.id = p.user_id AND u.role = 'patient'
      LEFT JOIN therapists t ON u.id = t.user_id AND u.role = 'therapist'
      LEFT JOIN admins a ON u.id = a.user_id AND u.role = 'admin'
      ORDER BY u.created_at DESC`,
      args: []
    });
    const users = usersRes.rows;

    // Get statistics
    const stats = {
      total: users.length,
      patients: users.filter((u: any) => u.role === 'patient').length,
      therapists: users.filter((u: any) => u.role === 'therapist').length,
      admins: users.filter((u: any) => u.role === 'admin').length,
      active: users.filter((u: any) => u.is_active === 1).length,
    };

    return NextResponse.json({
      success: true,
      users,
      stats,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
