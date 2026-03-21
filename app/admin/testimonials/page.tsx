'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface Testimonial {
  id: number;
  content: string;
  rating: number | null;
  is_featured: number;
  approval_status: 'pending' | 'approved';
  created_at: string;
  user_type: string;
  user_email: string;
  user_name: string;
  additional_info: string | null;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, [filter]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/testimonials?status=${filter}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch testimonials');
      const result = await response.json();
      setTestimonials(result.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: 'approve' | 'reject' | 'feature') => {
    try {
      setActionLoading(id);
      const response = await fetch('/api/testimonials/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ testimonial_id: id, action }),
      });
      if (!response.ok) throw new Error('Action failed');
      fetchTestimonials();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/admin">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Testimonial Management</h1>
            <p className="text-sm text-gray-500">Review and approve user testimonials</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="max-w-4xl mx-auto px-6 flex border-t border-gray-100">
          {(['pending', 'approved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors capitalize ${
                filter === status
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-900">No {filter} testimonials</p>
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{testimonial.user_name || 'Anonymous'}</h3>
                    <p className="text-sm text-gray-500">
                      {testimonial.user_email} · {testimonial.user_type}
                      {testimonial.additional_info && ` · ${testimonial.additional_info}`}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(testimonial.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {testimonial.rating && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                        ⭐ {testimonial.rating}/5
                      </span>
                    )}
                    {testimonial.is_featured === 1 && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                <p className="mb-5 text-sm text-gray-700 leading-relaxed">{testimonial.content}</p>

                {testimonial.approval_status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAction(testimonial.id, 'approve')}
                      disabled={actionLoading === testimonial.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                    >
                      {actionLoading === testimonial.id ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => handleAction(testimonial.id, 'feature')}
                      disabled={actionLoading === testimonial.id}
                      className="flex-1 bg-black hover:bg-gray-800 text-white rounded-xl"
                    >
                      Approve + Feature
                    </Button>
                    <Button
                      onClick={() => handleAction(testimonial.id, 'reject')}
                      disabled={actionLoading === testimonial.id}
                      variant="secondary"
                      className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
