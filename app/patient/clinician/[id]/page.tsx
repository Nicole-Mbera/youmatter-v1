'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Star, Clock, MapPin, Badge } from 'lucide-react';
import Link from 'next/link';

interface ClinicianProfile {
  id: number;
  full_name: string;
  bio: string;
  specialization?: string;
  credentials?: string;
  years_of_experience: number;
  profile_picture?: string;
  average_rating: number;
  total_reviews: number;
  consultation_fee?: number;
  session_types?: string[];
  languages?: string[];
  availability: string;
  is_verified: boolean | number;
  email?: string;
  phone?: string;
  recent_reviews?: Array<{
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    patient_name: string;
    patient_picture?: string;
  }>;
}

export default function ClinicianProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ClinicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clinicianId = params.id;

  useEffect(() => {
    if (clinicianId) {
      fetchClinicianProfile();
    }
  }, [clinicianId]);

  const fetchClinicianProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/patient/clinician/${clinicianId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch clinician profile');
      }

      const data = await response.json();
      setProfile(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={18}
            className={star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-black">
          {rating.toFixed(1)} ({profile?.total_reviews || 0} reviews)
        </span>
      </div>
    );
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Contact for pricing';
    return `$${price.toFixed(2)} per session`;
  };

  if (loading) {
    return (
      <DashboardShell
        title="Loading..."
        subtitle="Please wait"
        breadcrumbs={[
          { label: 'Patient', href: '/patient' },
          { label: 'Find Therapist', href: '/patient/find-therapist' },
          { label: 'Profile' },
        ]}
        navItems={[]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
        </div>
      </DashboardShell>
    );
  }

  if (error || !profile) {
    return (
      <DashboardShell
        title="Profile Not Found"
        subtitle="Unable to load clinician profile"
        breadcrumbs={[
          { label: 'Patient', href: '/patient' },
          { label: 'Find Therapist', href: '/patient/find-therapist' },
        ]}
        navItems={[]}
      >
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600">{error || 'Profile not found'}</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={profile.full_name}
      subtitle={profile.credentials || 'Mental Health Professional'}
      breadcrumbs={[
        { label: 'Patient', href: '/patient' },
        { label: 'Find Therapist', href: '/patient/find-therapist' },
        { label: 'Profile' },
      ]}
      navItems={[
        { label: 'Back', href: '/patient/find-therapist', icon: 'ArrowLeft' },
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8">
            <div className="flex gap-6 mb-6">
              {profile.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt={profile.full_name}
                  className="h-24 w-24 rounded-2xl object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="h-24 w-24 rounded-2xl bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                  <span className="text-4xl font-semibold text-gray-400">
                    {profile.full_name[0]}
                  </span>
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-semibold text-black">
                    {profile.full_name}
                  </h1>
                  {profile.is_verified && (
                    <Badge className="bg-green-100 text-green-700">Verified</Badge>
                  )}
                </div>
                {profile.credentials && (
                  <p className="text-gray-600 mb-3">{profile.credentials}</p>
                )}
                {renderStars(profile.average_rating)}
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={18} className="text-gray-400" />
                {profile.years_of_experience}+ years experience
              </div>
              <Badge className="bg-green-100 text-green-700">{profile.availability}</Badge>
            </div>
          </div>

          {/* About */}
          {profile.bio && (
            <div className="rounded-3xl border border-gray-200 bg-white p-8">
              <h2 className="text-lg font-semibold text-black mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Specializations */}
          {profile.specialization && (
            <div className="rounded-3xl border border-gray-200 bg-white p-8">
              <h2 className="text-lg font-semibold text-black mb-4">Specialization</h2>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-2xl bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
                  {profile.specialization}
                </span>
              </div>
            </div>
          )}

          {/* Session Types */}
          {profile.session_types && profile.session_types.length > 0 && (
            <div className="rounded-3xl border border-gray-200 bg-white p-8">
              <h2 className="text-lg font-semibold text-black mb-4">Session Types</h2>
              <div className="flex flex-wrap gap-2">
                {profile.session_types.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center rounded-2xl bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 capitalize"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {profile.recent_reviews && profile.recent_reviews.length > 0 && (
            <div className="rounded-3xl border border-gray-200 bg-white p-8">
              <h2 className="text-lg font-semibold text-black mb-4">Patient Reviews</h2>
              <div className="space-y-4">
                {profile.recent_reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {review.patient_picture ? (
                          <img
                            src={review.patient_picture}
                            alt={review.patient_name}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-500">
                              {review.patient_name[0]}
                            </span>
                          </div>
                        )}
                        <span className="font-medium text-black">{review.patient_name}</span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 sticky top-6">
            <h3 className="text-lg font-semibold text-black mb-4">Session Pricing</h3>
            <p className="text-2xl font-bold text-black mb-1">
              {formatPrice(profile.consultation_fee)}
            </p>
            <p className="text-sm text-gray-600 mb-6">
              First consultation may vary. Insurance accepted.
            </p>

            <Link href={`/patient/book-session?clinician_id=${profile.id}`} className="w-full">
              <Button className="w-full bg-black hover:bg-gray-800 text-white font-semibold rounded-2xl h-12 mb-3">
                Book Session
              </Button>
            </Link>

            <Button variant="secondary" className="w-full rounded-2xl">
              Contact Directly
            </Button>
          </div>

          {/* Quick Info */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8">
            <h3 className="text-lg font-semibold text-black mb-4">Quick Info</h3>
            <div className="space-y-4 text-sm">
              {profile.email && (
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Email</p>
                  <a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline">
                    {profile.email}
                  </a>
                </div>
              )}
              {profile.phone && (
                <div>
                  <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Phone</p>
                  <a href={`tel:${profile.phone}`} className="text-blue-600 hover:underline">
                    {profile.phone}
                  </a>
                </div>
              )}
              <div>
                <p className="text-gray-500 text-xs uppercase font-semibold mb-1">Rating</p>
                <p className="text-black font-semibold">
                  {profile.average_rating.toFixed(1)} / 5.0 from {profile.total_reviews} reviews
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
