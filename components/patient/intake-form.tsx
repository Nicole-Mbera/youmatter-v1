'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface IntakeFormData {
  chief_complaint: string;
  medical_history: string;
  current_medications: string;
  mental_health_history: string;
  therapy_goals: string[];
  preferred_session_duration: number;
  availability: string;
  insurance_provider?: string;
  insurance_id?: string;
}

const therapy_goal_options = [
  'Anxiety management',
  'Depression support',
  'Stress reduction',
  'Relationship counseling',
  'Trauma processing',
  'Life transitions',
  'Self-esteem building',
  'Coping skills development',
  'Sleep improvement',
  'Other',
];

const session_durations = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
];

const availability_options = [
  'Weekday mornings',
  'Weekday afternoons',
  'Weekday evenings',
  'Weekend mornings',
  'Weekend afternoons',
  'Flexible',
];

export function IntakeForm({ onSubmit, loading = false }: { onSubmit: (data: IntakeFormData) => Promise<void>; loading?: boolean }) {
  const [formData, setFormData] = useState<IntakeFormData>({
    chief_complaint: '',
    medical_history: '',
    current_medications: '',
    mental_health_history: '',
    therapy_goals: [],
    preferred_session_duration: 60,
    availability: 'Flexible',
    insurance_provider: '',
    insurance_id: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoalToggle = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      therapy_goals: prev.therapy_goals.includes(goal)
        ? prev.therapy_goals.filter((g) => g !== goal)
        : [...prev.therapy_goals, goal],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.chief_complaint.trim()) {
      setError('Please describe why you are seeking therapy');
      return;
    }

    if (formData.therapy_goals.length === 0) {
      setError('Please select at least one therapy goal');
      return;
    }

    try {
      await onSubmit(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit intake form');
    }
  };

  if (submitted) {
    return (
      <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h3 className="text-lg font-semibold text-green-900 mb-2">Intake Form Submitted</h3>
        <p className="text-green-700">Thank you! A therapist will review your information and reach out shortly to schedule your first session.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Chief Complaint */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <label className="block text-sm font-semibold text-black mb-3">
          What brings you to therapy? *
        </label>
        <textarea
          value={formData.chief_complaint}
          onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
          placeholder="Please describe the main reason you are seeking therapy (e.g., anxiety, depression, relationship issues, life transition, etc.)"
          className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300/20 resize-none"
          rows={5}
        />
        <p className="text-xs text-gray-500 mt-2">This helps us match you with the right therapist</p>
      </div>

      {/* Therapy Goals */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <label className="block text-sm font-semibold text-black mb-4">
          What are your therapy goals? * (Select all that apply)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {therapy_goal_options.map((goal) => (
            <label key={goal} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition">
              <input
                type="checkbox"
                checked={formData.therapy_goals.includes(goal)}
                onChange={() => handleGoalToggle(goal)}
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-2 focus:ring-gray-400"
              />
              <span className="text-sm text-black">{goal}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Medical & Mental Health History */}
      <div className="space-y-4">
        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <label className="block text-sm font-semibold text-black mb-3">
            Medical History (Optional)
          </label>
          <textarea
            value={formData.medical_history}
            onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
            placeholder="Any relevant medical conditions, past surgeries, or health concerns"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300/20 resize-none"
            rows={4}
          />
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <label className="block text-sm font-semibold text-black mb-3">
            Current Medications (Optional)
          </label>
          <textarea
            value={formData.current_medications}
            onChange={(e) => setFormData({ ...formData, current_medications: e.target.value })}
            placeholder="List any medications you are currently taking"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300/20 resize-none"
            rows={3}
          />
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <label className="block text-sm font-semibold text-black mb-3">
            Mental Health History (Optional)
          </label>
          <textarea
            value={formData.mental_health_history}
            onChange={(e) => setFormData({ ...formData, mental_health_history: e.target.value })}
            placeholder="Any past therapy, diagnoses, or mental health treatment"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300/20 resize-none"
            rows={4}
          />
        </div>
      </div>

      {/* Session Preferences */}
      <div className="space-y-4">
        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <label className="block text-sm font-semibold text-black mb-3">
            Preferred Session Duration
          </label>
          <div className="space-y-2">
            {session_durations.map((duration) => (
              <label key={duration.value} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="session_duration"
                  value={duration.value}
                  checked={formData.preferred_session_duration === duration.value}
                  onChange={() => setFormData({ ...formData, preferred_session_duration: duration.value })}
                  className="w-4 h-4 border-gray-300 text-black focus:ring-2 focus:ring-gray-400"
                />
                <span className="text-sm text-black">{duration.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6">
          <label className="block text-sm font-semibold text-black mb-3">
            Preferred Availability
          </label>
          <div className="space-y-2">
            {availability_options.map((option) => (
              <label key={option} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="availability"
                  value={option}
                  checked={formData.availability === option}
                  onChange={() => setFormData({ ...formData, availability: option })}
                  className="w-4 h-4 border-gray-300 text-black focus:ring-2 focus:ring-gray-400"
                />
                <span className="text-sm text-black">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Insurance Information */}
      <div className="rounded-3xl border border-gray-200 bg-white p-6">
        <label className="block text-sm font-semibold text-black mb-2">Insurance Information (Optional)</label>
        <p className="text-xs text-gray-500 mb-4">We work with many insurance providers. Providing this helps us process your claims.</p>
        <div className="space-y-3">
          <input
            type="text"
            value={formData.insurance_provider}
            onChange={(e) => setFormData({ ...formData, insurance_provider: e.target.value })}
            placeholder="Insurance Provider Name"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300/20"
          />
          <input
            type="text"
            value={formData.insurance_id}
            onChange={(e) => setFormData({ ...formData, insurance_id: e.target.value })}
            placeholder="Insurance ID"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300/20"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-black hover:bg-gray-800 text-white font-semibold rounded-2xl h-12"
        >
          {loading ? 'Submitting...' : 'Submit Intake Form'}
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Your information is secure and confidential. We will use it to match you with the right therapist.
      </p>
    </form>
  );
}
