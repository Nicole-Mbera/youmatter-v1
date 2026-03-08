'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

interface AvailableSlot {
  date: string;
  time: string;
  available: boolean;
}

interface Clinician {
  id: number;
  full_name: string;
  specialization?: string;
  specializations?: string[];
  consultation_fee?: number;
  session_price?: number;
}

export default function BookSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clinicianId = searchParams.get('clinician_id');

  const [clinician, setClinician] = useState<Clinician | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [sessionType, setSessionType] = useState<'individual' | 'couple' | 'family'>('individual');
  const [notes, setNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);

  useEffect(() => {
    if (clinicianId) {
      fetchClinicianInfo();
      fetchAvailableSlots();
    } else {
      setError('No clinician selected');
      setLoading(false);
    }
  }, [clinicianId]);

  const fetchClinicianInfo = async () => {
    try {
      const response = await fetch(`/api/patient/clinician/${clinicianId}`);
      if (!response.ok) throw new Error('Failed to load clinician info');
      const data = await response.json();
      setClinician(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clinician');
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(`/api/patient/clinician/${clinicianId}/availability`);
      if (!response.ok) throw new Error('Failed to load availability');
      const data = await response.json();
      setAvailableSlots(data.data || []);
    } catch (err) {
      console.error('Error loading availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/patient/sessions/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clinician_id: clinicianId,
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
          session_type: sessionType,
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book session');
      }

      const result = await response.json();
      
      // Redirect to confirmation or sessions page
      setTimeout(() => {
        router.push('/patient/sessions?booked=true');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book session');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell
        title="Book a Session"
        subtitle="Schedule your therapy session"
        breadcrumbs={[
          { label: 'Patient', href: '/patient' },
          { label: 'Find Therapist', href: '/patient/find-therapist' },
          { label: 'Book Session' },
        ]}
        navItems={[]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
        </div>
      </DashboardShell>
    );
  }

  if (!clinician) {
    return (
      <DashboardShell
        title="Book a Session"
        subtitle="Schedule your therapy session"
        breadcrumbs={[
          { label: 'Patient', href: '/patient' },
          { label: 'Find Therapist', href: '/patient/find-therapist' },
          { label: 'Book Session' },
        ]}
        navItems={[]}
      >
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600">{error || 'Clinician not found'}</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const formatPrice = (consultationFee?: number, sessionPrice?: number) => {
    const price = consultationFee || sessionPrice;
    if (!price) return 'Contact for pricing';
    // If price > 1000, assume it's in cents; otherwise it's already in dollars
    return price > 1000 ? `$${(price / 100).toFixed(2)}` : `$${price.toFixed(2)}`;
  };

  const getAvailableTimesForDate = (date: string) => {
    return availableSlots
      .filter((slot) => slot.date === date && slot.available)
      .map((slot) => slot.time);
  };

  const availableDates = Array.from(new Set(availableSlots.map((s) => s.date))).sort();

  return (
    <DashboardShell
      title="Book a Session"
      subtitle={`Schedule with ${clinician.full_name}`}
      breadcrumbs={[
        { label: 'Patient', href: '/patient' },
        { label: 'Find Therapist', href: '/patient/find-therapist' },
        { label: 'Book Session' },
      ]}
      navItems={[]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Type */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6">
              <label className="block text-sm font-semibold text-black mb-4">
                Session Type
              </label>
              <div className="space-y-2">
                {(['individual', 'couple', 'family'] as const).map((type) => (
                  <label key={type} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="session_type"
                      value={type}
                      checked={sessionType === type}
                      onChange={() => setSessionType(type)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black capitalize">{type} Session</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6">
              <label className="block text-sm font-semibold text-black mb-4">
                <Calendar className="inline h-4 w-4 mr-2" />
                Select Date *
              </label>
              {availableDates.length === 0 ? (
                <p className="text-gray-600 text-sm">No available dates. Please contact the clinician.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedTime('');
                      }}
                      className={`p-3 rounded-2xl border-2 font-medium text-sm transition ${
                        selectedDate === date
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 bg-white text-black hover:border-gray-300'
                      }`}
                    >
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="rounded-3xl border border-gray-200 bg-white p-6">
                <label className="block text-sm font-semibold text-black mb-4">
                  <Clock className="inline h-4 w-4 mr-2" />
                  Select Time *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {getAvailableTimesForDate(selectedDate).map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-2xl border-2 font-medium text-sm transition ${
                        selectedTime === time
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 bg-white text-black hover:border-gray-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6">
              <label className="block text-sm font-semibold text-black mb-3">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information you'd like to share with your therapist?"
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300/20 resize-none"
                rows={4}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={submitting || !selectedDate || !selectedTime}
              className="w-full bg-black hover:bg-gray-800 text-white font-semibold rounded-2xl h-12"
            >
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </form>
        </div>

        {/* Sidebar - Summary */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 h-fit sticky top-6">
          <h3 className="text-lg font-semibold text-black mb-4">Booking Summary</h3>

          <div className="space-y-4 border-b border-gray-200 pb-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Therapist</p>
              <p className="font-medium text-black">{clinician.full_name}</p>
            </div>

            {(clinician.specialization || (clinician.specializations && clinician.specializations.length > 0)) && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Specialization</p>
                <p className="text-sm text-gray-700">
                  {clinician.specialization || (clinician.specializations?.slice(0, 2).join(', '))}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4 py-4 border-b border-gray-200">
            {selectedDate && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Selected Date</p>
                <p className="font-medium text-black">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}

            {selectedTime && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Selected Time</p>
                <p className="font-medium text-black">{selectedTime}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Session Type</p>
              <p className="font-medium text-black capitalize">{sessionType}</p>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Total Price</p>
            <p className="text-2xl font-bold text-black">
              {formatPrice(clinician.consultation_fee, clinician.session_price)}
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
