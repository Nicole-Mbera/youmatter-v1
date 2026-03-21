'use client';

import { useEffect, useState } from 'react';
import { DataTable } from '@/components/dashboard/data-table';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface User extends Record<string, unknown> {
  id: number;
  email: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  full_name: string | null;
  username: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    patients: 0,
    therapists: 0,
    admins: 0,
    active: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users || []);
      setStats(data.stats || { total: 0, patients: 0, therapists: 0, admins: 0, active: 0 });
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: newAdminEmail, password: newAdminPassword, full_name: newAdminName }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create admin');
      }
      setShowAddAdmin(false);
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminName('');
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create admin');
    }
  };

  const columns = [
    { key: 'email' as const, header: 'Email' },
    { key: 'full_name' as const, header: 'Full Name' },
    { key: 'role' as const, header: 'Role' },
    {
      key: 'is_verified' as const,
      header: 'Status',
      render: (_value: any, user: User) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          user.is_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {user.is_verified ? 'Verified' : 'Pending'}
        </span>
      ),
    },
    {
      key: 'is_active' as const,
      header: 'Active',
      render: (_value: any, user: User) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          user.is_active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
        }`}>
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'created_at' as const,
      header: 'Joined',
      render: (_value: any, user: User) => new Date(user.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-500">Manage all platform users</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddAdmin(!showAddAdmin)}
            className="bg-black hover:bg-gray-800 text-white rounded-lg font-semibold flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Admin
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Users', value: stats.total },
            { label: 'Patients', value: stats.patients },
            { label: 'Therapists', value: stats.therapists },
            { label: 'Admins', value: stats.admins },
            { label: 'Active', value: stats.active },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-center">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Add Admin Form */}
        {showAddAdmin && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Administrator</h3>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-gray-400 focus:outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-gray-400 focus:outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-gray-400 focus:outline-none text-sm"
                  minLength={8}
                  required
                />
              </div>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
              )}
              <div className="flex gap-3">
                <Button type="submit" className="bg-black hover:bg-gray-800 text-white rounded-lg">
                  Create Admin
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddAdmin(false)}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <DataTable columns={columns} data={users} />
          </div>
        )}
      </div>
    </div>
  );
}
