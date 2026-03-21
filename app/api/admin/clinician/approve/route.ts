import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

// Approve or reject therapist registration
export async function POST(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const therapist_id = body.therapist_id;
    const { user_id, action, reason } = body;

    if (!therapist_id || !user_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch user email and therapist details for notification
    const userDataRes = await db.execute({
      sql: `SELECT u.email, t.full_name 
      FROM users u 
      LEFT JOIN therapists t ON u.id = t.user_id
      WHERE u.id = ?`,
      args: [user_id]
    });
    const userData = userDataRes.rows[0] as unknown as { email: string; full_name: string } | undefined;

    const therapistName = userData?.full_name || 'Therapist';
    const therapistEmail = userData?.email;

    // Dynamically import email functions to avoid circular deps if any
    const { sendtherapistApprovalEmail, sendtherapistRejectionEmail } = await import('@/lib/email');

    if (action === 'approve') {
      // Approve the therapist: update users and therapists tables
      await db.execute({
        sql: `UPDATE users 
        SET is_verified = 1, is_active = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        args: [user_id]
      });
      await db.execute({
        sql: `UPDATE therapists 
        SET is_verified = 1, verification_status = 'approved', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        args: [therapist_id]
      });

      // Log the approval
      await db.execute({
        sql: `INSERT INTO user_activity (user_id, activity_type, details)
        VALUES (?, 'therapist_approved', ?)`,
        args: [currentUser.userId, JSON.stringify({
          approved_therapist_id: therapist_id,
          approved_user_id: user_id,
          timestamp: new Date().toISOString()
        })]
      });

      // Send approval email
      if (therapistEmail) {
        await sendtherapistApprovalEmail({
          to: therapistEmail,
          therapistName: therapistName,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Therapist approved successfully',
      });
    } else if (action === 'reject') {
      // Deactivate the user account and update therapist status
      await db.execute({
        sql: `UPDATE users 
        SET is_active = 0, is_verified = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        args: [user_id]
      });
      await db.execute({
        sql: `UPDATE therapists 
        SET verification_status = 'rejected', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        args: [therapist_id]
      });

      // Log the rejection
      await db.execute({
        sql: `INSERT INTO user_activity (user_id, activity_type, details)
        VALUES (?, 'therapist_rejected', ?)`,
        args: [currentUser.userId, JSON.stringify({
          rejected_therapist_id: therapist_id,
          rejected_user_id: user_id,
          reason: reason || 'No reason provided',
          timestamp: new Date().toISOString()
        })]
      });

      // Send rejection email
      if (therapistEmail) {
        await sendtherapistRejectionEmail({
          to: therapistEmail,
          therapistName: therapistName,
          reason: reason || 'Application criteria not met',
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Therapist registration rejected',
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('therapist approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
