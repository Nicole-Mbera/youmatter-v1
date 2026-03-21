import { NextResponse } from 'next/server';
import { getUserFromRequest, hasRole } from '@/lib/auth';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

function parseJsonArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((v) => typeof v === 'string') as string[];
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function safeJsonStringify(value: unknown): string | null {
  if (value === undefined) return null;
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'therapist')) {
      return NextResponse.json(
        { error: 'Unauthorized. Therapist access required.' },
        { status: 403 }
      );
    }

    const therapistRes = await db.execute({
      sql: `SELECT t.*, u.email
            FROM therapists t
            JOIN users u ON t.user_id = u.id
            WHERE t.user_id = ?`,
      args: [currentUser.userId],
    });
    const t = therapistRes.rows[0] as any;

    if (!t) {
      return NextResponse.json(
        { error: 'Therapist profile not found' },
        { status: 404 }
      );
    }

    const therapistId = Number(t.id);

    // Review statistics + recent reviews
    const [reviewStatsRes, recentReviewsRes] = await Promise.all([
      db.execute({
        sql: `SELECT 
                COUNT(*) as total_reviews,
                COALESCE(AVG(rating), 0) as average_rating,
                SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
                SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
                SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
                SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
                SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
              FROM session_reviews
              WHERE therapist_id = ?`,
        args: [therapistId],
      }),
      db.execute({
        sql: `SELECT
                r.id,
                r.rating,
                COALESCE(r.review_text, '') as comment,
                r.created_at,
                p.username as patient_username,
                p.profile_picture as patient_picture
              FROM session_reviews r
              JOIN patients p ON r.patient_id = p.id
              WHERE r.therapist_id = ?
              ORDER BY r.created_at DESC
              LIMIT 5`,
        args: [therapistId],
      }),
    ]);

    const specializations =
      parseJsonArray(t.specializations_json).length > 0
        ? parseJsonArray(t.specializations_json)
        : t.specialization
          ? [String(t.specialization)]
          : [];

    const therapyTypes = parseJsonArray(t.therapy_types_json);
    const languages = parseJsonArray(t.languages_json);

    const sessionPrice =
      typeof t.session_price === 'number'
        ? t.session_price
        : (typeof t.consultation_fee === 'number' ? Math.round(t.consultation_fee * 100) : 0);

    const reviewStatsRow = reviewStatsRes.rows[0] as any;

    return NextResponse.json({
      success: true,
      data: {
        id: therapistId,
        user_id: t.user_id,
        full_name: t.full_name,
        bio: t.bio || '',
        specializations,
        credentials: t.credentials || '',
        years_of_experience: t.years_of_experience || 0,
        phone: t.phone || '',
        profile_picture: t.profile_picture || undefined,
        average_rating: t.average_rating || 0,
        total_reviews: t.total_reviews || 0,
        email: t.email,
        therapy_types: therapyTypes,
        languages: languages.length > 0 ? languages : ['English'],
        session_price: sessionPrice,
        review_statistics: {
          total_reviews: Number(reviewStatsRow?.total_reviews || 0),
          average_rating: Number(reviewStatsRow?.average_rating || 0),
          five_star: Number(reviewStatsRow?.five_star || 0),
          four_star: Number(reviewStatsRow?.four_star || 0),
          three_star: Number(reviewStatsRow?.three_star || 0),
          two_star: Number(reviewStatsRow?.two_star || 0),
          one_star: Number(reviewStatsRow?.one_star || 0),
        },
        recent_reviews: recentReviewsRes.rows,
      },
    });
  } catch (error) {
    console.error('therapist profile GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = getUserFromRequest(request);

    if (!currentUser || !hasRole(currentUser, 'therapist')) {
      return NextResponse.json(
        { error: 'Unauthorized. Therapist access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // The UI sends arrays (specializations, therapy_types, languages) + session_price in cents
    const full_name = typeof body.full_name === 'string' ? body.full_name : undefined;
    const bio = typeof body.bio === 'string' ? body.bio : undefined;
    const credentials = typeof body.credentials === 'string' ? body.credentials : undefined;
    const years_of_experience = typeof body.years_of_experience === 'number' ? body.years_of_experience : undefined;
    const phone = typeof body.phone === 'string' ? body.phone : undefined;
    const session_price = typeof body.session_price === 'number' ? body.session_price : undefined;

    const specializations = Array.isArray(body.specializations) ? body.specializations : undefined;
    const therapy_types = Array.isArray(body.therapy_types) ? body.therapy_types : undefined;
    const languages = Array.isArray(body.languages) ? body.languages : undefined;

    // Keep a single-string specialization populated for search/listing pages.
    const specialization =
      Array.isArray(specializations) && specializations.length > 0
        ? String(specializations[0])
        : (typeof body.specialization === 'string' ? body.specialization : undefined);

    try {
      await db.execute({
        sql: `UPDATE therapists
              SET full_name = COALESCE(?, full_name),
                  bio = COALESCE(?, bio),
                  credentials = COALESCE(?, credentials),
                  years_of_experience = COALESCE(?, years_of_experience),
                  phone = COALESCE(?, phone),
                  specialization = COALESCE(?, specialization),
                  specializations_json = COALESCE(?, specializations_json),
                  therapy_types_json = COALESCE(?, therapy_types_json),
                  languages_json = COALESCE(?, languages_json),
                  session_price = COALESCE(?, session_price),
                  updated_at = CURRENT_TIMESTAMP
              WHERE user_id = ?`,
        args: [
          full_name ?? null,
          bio ?? null,
          credentials ?? null,
          years_of_experience ?? null,
          phone ?? null,
          specialization ?? null,
          safeJsonStringify(specializations) ?? null,
          safeJsonStringify(therapy_types) ?? null,
          safeJsonStringify(languages) ?? null,
          session_price ?? null,
          currentUser.userId,
        ],
      });
    } catch (e) {
      // Backward-compatible fallback if DB wasn't migrated yet
      await db.execute({
        sql: `UPDATE therapists
              SET full_name = COALESCE(?, full_name),
                  bio = COALESCE(?, bio),
                  years_of_experience = COALESCE(?, years_of_experience),
                  phone = COALESCE(?, phone),
                  specialization = COALESCE(?, specialization),
                  updated_at = CURRENT_TIMESTAMP
              WHERE user_id = ?`,
        args: [
          full_name ?? null,
          bio ?? null,
          years_of_experience ?? null,
          phone ?? null,
          specialization ?? null,
          currentUser.userId,
        ],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('therapist profile PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

