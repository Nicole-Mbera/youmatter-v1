import { NextResponse } from 'next/server';

// GET /api/patient/clinician/[id]/availability - Get therapist availability
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // For now, return mock availability data
    // TODO: Integrate with actual availability scheduling system
    const today = new Date();
    const availableSlots: Array<{ date: string; time: string; available: boolean }> = [];

    // Generate availability for next 14 days
    for (let day = 1; day <= 14; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() + day);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const dateStr = date.toISOString().split('T')[0];

      // Add time slots
      ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].forEach((time) => {
        availableSlots.push({
          date: dateStr,
          time,
          available: true,
        });
      });
    }

    return NextResponse.json({
      success: true,
      data: availableSlots,
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}
