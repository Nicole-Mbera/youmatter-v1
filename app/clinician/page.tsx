'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar, Clock, Users, CheckCircle, XCircle, Video } from 'lucide-react';

interface Session {
  id: number;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  status: string;
  meeting_link?: string;
  patient_name: string;
  patient_username: string;
  patient_picture?: string;
}

interface DashboardData {
  clinician: {
    id: number;
    name: string;
    specializations: string[];
    credentials?: string;
    experience: number;
    rating: number;
    total_reviews: number;
    stripe_account_id?: string;
  };
  stats: {
    totalSessions: number;
    scheduledSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    activePatients: number;
    todaysSessions: number;
  };
  todaySessions: Session[];
  upcomingSessions: Session[];
}

export default function ClinicianDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clinician/dashboard', {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard data');

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes}${ampm}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const clinicianNav = [
    { label: 'Dashboard', href: '/clinician', icon: 'Home' },
    { label: 'My Patients', href: '/clinician/patients', icon: 'Users' },
    { label: 'Schedule', href: '/clinician/schedule', icon: 'Calendar' },
    { label: 'My Sessions', href: '/clinician/sessions', icon: 'Clock' },
    { label: 'Bookings', href: '/clinician/bookings', icon: 'BookOpen' },
    { label: 'My Profile', href: '/clinician/profile', icon: 'User' },
  ];

  if (loading) {
    return (
      <DashboardShell
        title="Loading your dashboard..."
        subtitle="Please wait"
        breadcrumbs={[{ label: 'Clinician' }, { label: 'Dashboard' }]}
        navItems={clinicianNav}
      >
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
        </div>
      </DashboardShell>
    );
  }

  if (error || !data) {
    return (
      <DashboardShell
        title="Error loading dashboard"
        subtitle="Please try again"
        breadcrumbs={[{ label: 'Clinician' }, { label: 'Dashboard' }]}
        navItems={clinicianNav}
      >
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600">{error || 'Failed to load dashboard data'}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={`Welcome back, ${data.clinician.name}`}
      subtitle="Your therapy practice dashboard"
      breadcrumbs={[{ label: 'Clinician', href: '/clinician' }, { label: 'Dashboard' }]}
      navItems={clinicianNav}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Sessions"
          value={data.stats.totalSessions.toString()}
        />
        <StatCard
          label="Scheduled"
          value={data.stats.scheduledSessions.toString()}
        />
        <StatCard
          label="Completed"
          value={data.stats.completedSessions.toString()}
        />
        <StatCard
          label="Active Patients"
          value={data.stats.activePatients.toString()}
        />
      </div>

      {/* Today's and Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Sessions */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-black">Today's Sessions ({data.stats.todaysSessions})</h3>
            <Link href="/clinician/sessions">
              <Button variant="secondary" className="text-xs rounded-2xl">
                View All
              </Button>
            </Link>
          </div>

          {data.todaySessions.length === 0 ? (
            <p className="text-gray-600 text-sm">No sessions scheduled for today</p>
          ) : (
            <div className="space-y-3">
              {data.todaySessions.map((session) => (
                <div key={session.id} className="flex items-start gap-3 p-4 rounded-2xl border border-gray-200 hover:bg-gray-50">
                  {session.patient_picture ? (
                    <img
                      src={session.patient_picture}
                      alt={session.patient_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-gray-600">
                        {session.patient_name[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-black truncate">
                      {session.patient_name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatTime(session.scheduled_time)} · {session.duration_minutes} min
                    </p>
                  </div>
                  {session.meeting_link && (
                    <Link href={session.meeting_link} target="_blank">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-2xl">
                        <Video className="h-4 w-4 mr-1" />
                        Join
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-black">Upcoming Sessions</h3>
            <Link href="/clinician/sessions">
              <Button variant="secondary" className="text-xs rounded-2xl">
                View All
              </Button>
            </Link>
          </div>

          {data.upcomingSessions.length === 0 ? (
            <p className="text-gray-600 text-sm">No upcoming sessions</p>
          ) : (
            <div className="space-y-3">
              {data.upcomingSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-start gap-3 p-4 rounded-2xl border border-gray-200 hover:bg-gray-50">
                  {session.patient_picture ? (
                    <img
                      src={session.patient_picture}
                      alt={session.patient_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-gray-600">
                        {session.patient_name[0]}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-black truncate">
                      {session.patient_name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatDate(session.scheduled_date)} at {formatTime(session.scheduled_time)}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                      session.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : session.status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-black mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/clinician/schedule">
            <Button variant="secondary" className="w-full rounded-2xl justify-center">
              Update Schedule
            </Button>
          </Link>
          <Link href="/clinician/patients">
            <Button variant="secondary" className="w-full rounded-2xl justify-center">
              View Patients
            </Button>
          </Link>
          <Link href="/clinician/profile">
            <Button variant="secondary" className="w-full rounded-2xl justify-center">
              Edit Profile
            </Button>
          </Link>
          <Link href="/clinician/sessions">
            <Button variant="secondary" className="w-full rounded-2xl justify-center">
              All Sessions
            </Button>
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
