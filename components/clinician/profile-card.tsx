'use client';

import { Star, MapPin, Badge, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface therapistProfileCardProps {
  id: number;
  full_name: string;
  specialization?: string; // single specialization from API
  specializations?: string[]; // array of specializations (legacy)
  bio: string;
  credentials?: string;
  years_of_experience: number;
  average_rating: number;
  total_reviews: number;
  profile_picture?: string;
  consultation_fee?: number; // in dollars (from API)
  session_price?: number; // in cents (legacy)
  availability?: string;
  phone?: string;
  therapy_types?: string[];
  languages?: string[];
  is_verified?: boolean;
}

export function therapistProfileCard({
  id,
  full_name,
  specialization,
  specializations,
  bio,
  credentials,
  years_of_experience,
  average_rating,
  total_reviews,
  profile_picture,
  consultation_fee,
  session_price,
  availability,
  therapy_types = [],
  languages = ['English'],
  is_verified = false,
}: therapistProfileCardProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-black">
          {average_rating.toFixed(1)} ({total_reviews} reviews)
        </span>
      </div>
    );
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Contact for pricing';
    // Handle both formats: consultation_fee (dollars) and session_price (cents)
    const dollars = price > 1000 ? price / 100 : price;
    return `$${dollars.toFixed(2)}`;
  };

  // Handle both specialization formats
  const specs = specializations && specializations.length > 0 
    ? specializations 
    : (specialization ? [specialization] : []);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 hover:shadow-lg transition-shadow">
      <div className="flex gap-6 mb-6">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          {profile_picture ? (
            <img
              src={profile_picture}
              alt={full_name}
              className="h-20 w-20 rounded-2xl object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-gray-100 flex items-center justify-center border-2 border-gray-200">
              <span className="text-2xl font-semibold text-gray-400">
                {full_name[0]}
              </span>
            </div>
          )}
        </div>

        {/* Header Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                {full_name}
                {is_verified && (
                  <Badge className="bg-green-100 text-green-700 text-xs">Verified</Badge>
                )}
              </h3>
              {credentials && (
                <p className="text-sm text-gray-600">{credentials}</p>
              )}
            </div>
          </div>
          
          {renderStars(average_rating)}

          {session_price && (
            <p className="text-sm font-semibold text-black mt-2">
              {formatPrice(session_price)} per session
            </p>
          )}
          {consultation_fee && (
            <p className="text-sm font-semibold text-black mt-2">
              {formatPrice(consultation_fee)} per session
            </p>
          )}
        </div>
      </div>

      {/* Specializations */}
      {specs.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Specializations</p>
          <div className="flex flex-wrap gap-2">
            {specs.map((spec) => (
              <span
                key={spec}
                className="inline-flex items-center rounded-2xl bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Therapy Types */}
      {therapy_types.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Therapy Approaches</p>
          <div className="flex flex-wrap gap-2">
            {therapy_types.map((type) => (
              <span
                key={type}
                className="inline-flex items-center rounded-2xl bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bio */}
      {bio && (
        <p className="text-sm text-gray-700 mb-4 line-clamp-3">{bio}</p>
      )}

      {/* Meta Info */}
      <div className="space-y-2 mb-6 py-4 border-t border-gray-200">
        {years_of_experience > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} className="text-gray-400" />
            <span>{years_of_experience}+ years of experience</span>
          </div>
        )}
        
        {languages.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen size={16} className="text-gray-400" />
            <span>Languages: {languages.join(', ')}</span>
          </div>
        )}

        {availability && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Badge className="bg-green-100 text-green-700 text-xs">{availability}</Badge>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link href={`/patient/clinician/${id}`} className="flex-1">
          <Button variant="secondary" className="w-full rounded-2xl">
            View Profile
          </Button>
        </Link>
        <Link href={`/patient/book-session?therapist_id=${id}`} className="flex-1">
          <Button className="w-full bg-black hover:bg-gray-800 text-white rounded-2xl">
            Book Session
          </Button>
        </Link>
      </div>
    </div>
  );
}
