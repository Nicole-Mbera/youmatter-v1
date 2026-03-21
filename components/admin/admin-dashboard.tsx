'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/dashboard/data-table';
import { SystemMonitor } from '@/components/admin/system-monitor';
import Link from 'next/link';
import { Users, UserCheck, CalendarCheck, Clock, UserPlus } from 'lucide-react';

interface AdminStats {
  userCounts: {
    patients: number;
    therapists: number;
    admins: number;
  };
  activeUsers: number;
  sessionStats: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
  };
  recentUsers: Array<{
    id: number;
    email: string;
    role: string;
    display_name: string;
    created_at: string;
    is_active: number;
    is_verified: number;
  }>;
  pendingTherapists: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const result = await response.json();
      setStats(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const totalUsers = stats.userCounts.patients + stats.userCounts.therapists + stats.userCounts.admins;

  const statCards = [
    {
      label: 'Total Users',
      value: totalUsers,
      sub: `${stats.activeUsers} active this week`,
      icon: Users,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Therapists',
      value: stats.userCounts.therapists,
      sub: stats.pendingTherapists > 0 ? `${stats.pendingTherapists} pending approval` : 'All approved',
      icon: UserCheck,
      color: 'text-blue-600 bg-blue-50',
      href: stats.pendingTherapists > 0 ? '/admin/therapist' : undefined,
    },
    {
      label: 'Total Sessions',
      value: stats.sessionStats.total,
      sub: `${stats.sessionStats.completed} completed`,
      icon: CalendarCheck,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Scheduled Sessions',
      value: stats.sessionStats.scheduled,
      sub: 'Awaiting completion',
      icon: Clock,
      color: 'text-orange-600 bg-orange-50',
    },
  ];

  const recentUsersTable = stats.recentUsers.slice(0, 8).map(user => ({
    name: user.display_name || 'N/A',
    email: user.email,
    role: user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    status: user.is_active ? 'Active' : 'Inactive',
    verified: user.is_verified ? 'Yes' : 'No',
    joined: new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }));

  const userDistribution = [
    { label: 'Patients', value: stats.userCounts.patients, total: totalUsers, color: 'bg-green-500' },
    { label: 'Therapists', value: stats.userCounts.therapists, total: totalUsers, color: 'bg-blue-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Pending approval alert */}
      {stats.pendingTherapists > 0 && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-amber-600" />
            <p className="text-sm font-semibold text-amber-800">
              {stats.pendingTherapists} therapist{stats.pendingTherapists > 1 ? 's' : ''} waiting for approval
            </p>
          </div>
          <Link href="/admin/therapist" className="text-sm font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2">
            Review now →
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const card = (
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
            </div>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href}>{card}</Link>
          ) : (
            <div key={stat.label}>{card}</div>
          );
        })}
      </div>

      {/* User Distribution */}
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-5">User Distribution</h3>
        <div className="space-y-4">
          {userDistribution.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                <span className="text-sm font-bold text-gray-900">{item.value} users</span>
              </div>
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color} transition-all`}
                  style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%' }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {item.total > 0 ? ((item.value / item.total) * 100).toFixed(1) : 0}% of total users
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* System Monitor */}
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-5">System Health</h3>
        <SystemMonitor />
      </div>

      {/* Recent Users */}
      <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Recently Registered Users</h3>
          <Link href="/admin/users" className="text-sm font-semibold text-green-600 hover:text-green-700">
            View all →
          </Link>
        </div>
        <DataTable
          data={recentUsersTable}
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'email', header: 'Email' },
            { key: 'role', header: 'Role' },
            { key: 'status', header: 'Status' },
            { key: 'verified', header: 'Verified' },
            { key: 'joined', header: 'Joined' },
          ]}
        />
      </div>
    </div>
  );
}
