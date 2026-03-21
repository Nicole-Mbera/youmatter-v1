'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface therapist {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  specialization: string;
  years_of_experience: number;
  bio: string;
  phone: string;
  license_number?: string;
  institution_name?: string;
  country?: string;
  contact_email?: string;
  mission?: string;
  documents?: string; // JSON string
  created_at: string;
  is_verified: number;
  is_active: number;
}

export default function AdmintherapistsPage() {
  const [therapists, settherapists] = useState<therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');

  useEffect(() => {
    fetchtherapists();
  }, [filter]);

  const fetchtherapists = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/clinician?status=${filter}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch therapists');

      const result = await response.json();
      settherapists(result.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (therapistId: number, userId: number) => {
    if (!confirm('Are you sure you want to approve this therapist?')) return;

    try {
      setActionLoading(therapistId);
      const response = await fetch('/api/admin/clinician/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ therapist_id: therapistId, user_id: userId, action: 'approve' }),
      });

      if (!response.ok) throw new Error('Failed to approve therapist');

      alert('therapist approved successfully!');
      fetchtherapists();
    } catch (err: any) {
      alert(err.message || 'Failed to approve therapist');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (therapistId: number, userId: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setActionLoading(therapistId);
      const response = await fetch('/api/admin/clinician/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          therapist_id: therapistId,
          user_id: userId,
          action: 'reject',
          reason
        }),
      });

      if (!response.ok) throw new Error('Failed to reject therapist');

      alert('therapist registration rejected');
      fetchtherapists();
    } catch (err: any) {
      alert(err.message || 'Failed to reject therapist');
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
            <h1 className="text-xl font-bold text-gray-900">Therapist Approvals</h1>
            <p className="text-sm text-gray-500">Review and approve therapist registrations</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="max-w-4xl mx-auto px-6 flex border-t border-gray-100">
          {([
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'all', label: 'All' },
          ] as const).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
                filter === value
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
        </div>
      ) : therapists.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-900">
            {filter === 'pending' ? 'No pending therapist approvals' : 'No therapists found'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {filter === 'pending' ? 'All registrations have been reviewed.' : 'No therapists match the current filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {therapists.map((therapist) => (
            <div
              key={therapist.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-[black]">
                      {therapist.full_name}
                    </h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${therapist.is_verified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {therapist.is_verified ? 'Approved' : 'Pending'}
                    </span>
                  </div>

                  <div className="grid gap-2 text-sm text-[gray-700]">
                    <p><strong className="text-[black]">Email:</strong> {therapist.email}</p>
                    <p><strong className="text-[black]">Specialization:</strong> {therapist.specialization}</p>
                    <p><strong className="text-[black]">Experience:</strong> {therapist.years_of_experience} years</p>
                    <p><strong className="text-[black]">Phone:</strong> {therapist.phone || 'N/A'}</p>
                    <p><strong className="text-[black]">Institution:</strong> {therapist.institution_name || 'N/A'}</p>
                    <p><strong className="text-[black]">Country:</strong> {therapist.country || 'N/A'}</p>
                    <p><strong className="text-[black]">License:</strong> {therapist.license_number || 'N/A'}</p>

                    {therapist.contact_email && <p><strong className="text-[black]">Contact Email:</strong> {therapist.contact_email}</p>}

                    {therapist.mission && (
                      <div className="mt-2">
                        <strong className="text-[black]">Mission:</strong>
                        <p className="mt-1 text-sm italic border-l-2 border-gray-300 pl-3">{therapist.mission}</p>
                      </div>
                    )}

                    <p><strong className="text-[black]">Bio:</strong> {therapist.bio}</p>

                    {therapist.documents && (
                      <div className="mt-2">
                        <strong className="text-[black]">Documents:</strong>
                        <div className="mt-1 text-xs">
                          {/* Documents are stored as a JSON string of filenames */}
                          {(() => {
                            try {
                              const docs = JSON.parse(therapist.documents as any);
                              if (Array.isArray(docs) && docs.length > 0) {
                                return (
                                  <ul className="list-disc list-inside space-y-1">
                                    {docs.map((doc: string, i: number) => {
                                      const fileName = doc.split('/').pop() || doc;
                                      return (
                                        <li key={i}>
                                          <a
                                            href={doc}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline break-all"
                                          >
                                            {fileName}
                                          </a>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                );
                              }
                              return <span className="text-gray-500">No documents uploaded</span>;
                            } catch (e) {
                              return <span className="text-gray-500">Invalid document format</span>;
                            }
                          })()}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-[gray-500] mt-4">
                      Registered: {new Date(therapist.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {!therapist.is_verified && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(therapist.id, therapist.user_id)}
                      disabled={actionLoading === therapist.id}
                      className="bg-[black] hover:bg-[gray-800] rounded-2xl"
                    >
                      {actionLoading === therapist.id ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => handleReject(therapist.id, therapist.user_id)}
                      disabled={actionLoading === therapist.id}
                      variant="secondary"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
