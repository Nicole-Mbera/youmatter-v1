'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface ClinicianProfile {
  id: number;
  user_id: number;
  full_name: string;
  bio: string;
  specializations: string[];
  credentials?: string;
  years_of_experience: number;
  phone?: string;
  profile_picture?: string;
  average_rating: number;
  total_reviews: number;
  email: string;
  therapy_types: string[];
  languages: string[];
  session_price?: number;
  review_statistics?: {
    total_reviews: number;
    average_rating: number;
    five_star: number;
    four_star: number;
    three_star: number;
    two_star: number;
    one_star: number;
  };
  recent_reviews?: Array<{
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    patient_username: string;
    patient_picture?: string;
  }>;
}

const therapy_type_options = [
  'CBT (Cognitive Behavioral Therapy)',
  'DBT (Dialectical Behavior Therapy)',
  'Psychodynamic',
  'Humanistic',
  'Acceptance & Commitment Therapy (ACT)',
  'Mindfulness-Based',
  'Family Therapy',
  'Group Therapy',
  'Motivational Interviewing',
];

const specialization_options = [
  'Anxiety Disorders',
  'Depression',
  'PTSD & Trauma',
  'Relationship Issues',
  'Addiction & Recovery',
  'Sleep Disorders',
  'Life Transitions',
  'Grief & Loss',
  'Self-Esteem',
  'Stress Management',
  'Child/Adolescent',
  'Eating Disorders',
];

const language_options = [
  'English',
  'Spanish',
  'French',
  'German',
  'Mandarin',
  'Japanese',
  'Korean',
];

export default function ClinicianProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ClinicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    credentials: '',
    years_of_experience: 0,
    phone: '',
    specializations: [] as string[],
    therapy_types: [] as string[],
    languages: [] as string[],
    session_price: 0,
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user || (user.role !== 'clinician' && user.role !== 'therapist')) {
        router.push('/login?redirect=/clinician/profile');
        return;
      }
      fetchProfile();
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/clinician/profile', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
        setFormData({
          full_name: data.data.full_name || '',
          bio: data.data.bio || '',
          credentials: data.data.credentials || '',
          years_of_experience: data.data.years_of_experience || 0,
          phone: data.data.phone || '',
          specializations: data.data.specializations || [],
          therapy_types: data.data.therapy_types || [],
          languages: data.data.languages || ['English'],
          session_price: data.data.session_price || 0,
        });
      } else if (response.status === 401) {
        router.push('/login?redirect=/clinician/profile');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/clinician/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchProfile();
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update failed:', error);
      alert('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSpecialization = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const toggleTherapyType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      therapy_types: prev.therapy_types.includes(type)
        ? prev.therapy_types.filter((t) => t !== type)
        : [...prev.therapy_types, type],
    }));
  };

  const toggleLanguage = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  if (authLoading || loading) {
    return (
      <DashboardShell
        title="Loading..."
        subtitle="Please wait"
        breadcrumbs={[{ label: 'Clinician', href: '/clinician' }, { label: 'Profile' }]}
        navItems={[]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
        </div>
      </DashboardShell>
    );
  }

  if (!profile) {
    return (
      <DashboardShell
        title="Profile Not Found"
        subtitle="Unable to load your profile"
        breadcrumbs={[{ label: 'Clinician', href: '/clinician' }, { label: 'Profile' }]}
        navItems={[]}
      >
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600">Profile not found</p>
          <Button onClick={() => router.push('/clinician')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="My Professional Profile"
      subtitle="Manage your therapy practice profile"
      breadcrumbs={[{ label: 'Clinician', href: '/clinician' }, { label: 'Profile' }]}
      navItems={[
        { label: 'Dashboard', href: '/clinician', icon: 'Home' },
        { label: 'My Patients', href: '/clinician/patients', icon: 'Users' },
        { label: 'Schedule', href: '/clinician/schedule', icon: 'Calendar' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-black">Professional Information</h2>
              {!editing && (
                <Button onClick={() => setEditing(true)} variant="secondary">
                  Edit Profile
                </Button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300/20"
                    required
                  />
                </div>

                {/* Credentials */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Credentials (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.credentials}
                    onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                    placeholder="e.g., Ph.D. in Clinical Psychology, Licensed Professional Counselor"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300/20"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell patients about your approach, experience, and specializations"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300/20 resize-none"
                    rows={5}
                  />
                  <p className="text-xs text-gray-500 mt-1">This helps patients understand your approach</p>
                </div>

                {/* Years of Experience */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={formData.years_of_experience}
                    onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300/20"
                    min="0"
                  />
                </div>

                {/* Session Price */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Session Price (in dollars)
                  </label>
                  <input
                    type="number"
                    value={formData.session_price / 100}
                    onChange={(e) => setFormData({ ...formData, session_price: Math.round((parseFloat(e.target.value) || 0) * 100) })}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300/20"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300/20"
                  />
                </div>

                {/* Specializations */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-3">
                    Specializations (Select all that apply)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {specialization_options.map((spec) => (
                      <label key={spec} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.specializations.includes(spec)}
                          onChange={() => toggleSpecialization(spec)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Therapy Types */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-3">
                    Therapy Approaches (Select all that apply)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {therapy_type_options.map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.therapy_types.includes(type)}
                          onChange={() => toggleTherapyType(type)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-semibold text-black mb-3">
                    Languages Spoken (Select all that apply)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {language_options.map((lang) => (
                      <label key={lang} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(lang)}
                          onChange={() => toggleLanguage(lang)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-black hover:bg-gray-800 text-white font-semibold rounded-2xl h-12"
                  >
                    {submitting ? 'Saving...' : 'Save Profile'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setEditing(false)}
                    variant="secondary"
                    className="flex-1 rounded-2xl h-12"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              /* Display Mode */
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Name</p>
                  <p className="text-lg font-semibold text-black">{profile.full_name}</p>
                </div>

                {profile.credentials && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Credentials</p>
                    <p className="text-gray-700">{profile.credentials}</p>
                  </div>
                )}

                {profile.bio && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Bio</p>
                    <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Experience</p>
                    <p className="text-lg font-semibold text-black">{profile.years_of_experience}+ years</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Session Price</p>
                    <p className="text-lg font-semibold text-black">
                      ${profile.session_price ? (profile.session_price / 100).toFixed(2) : 'N/A'}
                    </p>
                  </div>
                </div>

                {profile.specializations.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Specializations</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.specializations.map((spec) => (
                        <span key={spec} className="inline-flex items-center rounded-2xl bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.therapy_types.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Therapy Approaches</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.therapy_types.map((type) => (
                        <span key={type} className="inline-flex items-center rounded-2xl bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.languages.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Languages</p>
                    <p className="text-gray-700">{profile.languages.join(', ')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          {/* Rating Card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Patient Ratings</h3>
            <div className="flex items-center gap-4 mb-4">
              <div>
                <p className="text-4xl font-bold text-black">{profile.average_rating.toFixed(1)}</p>
                <div className="flex gap-1 mt-2">{renderStars(profile.average_rating)}</div>
              </div>
              <div className="text-sm text-gray-600">
                Based on {profile.total_reviews} reviews
              </div>
            </div>

            {profile.review_statistics && (
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-6">{star}★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{
                          width: `${Math.round(
                            ((profile.review_statistics as any)[`${star}_star`] / profile.total_reviews) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 w-8 text-right">
                      {(profile.review_statistics as any)[`${star}_star`]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Email</p>
                <p className="text-gray-700">{profile.email}</p>
              </div>
              {profile.phone && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Phone</p>
                  <p className="text-gray-700">{profile.phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
