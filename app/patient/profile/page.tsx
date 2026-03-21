'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Check, AlertCircle } from 'lucide-react';

interface PatientProfile {
  username: string;
  full_name: string | null;
  bio: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  email: string;
}

export default function PatientProfilePage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [form, setForm] = useState({
    username: '',
    full_name: '',
    bio: '',
    phone: '',
    date_of_birth: '',
    gender: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const p = data.user?.profile;
          const profileData: PatientProfile = {
            username: p?.username || '',
            full_name: p?.full_name || null,
            bio: p?.bio || null,
            phone: p?.phone || null,
            date_of_birth: p?.date_of_birth || null,
            gender: p?.gender || null,
            email: data.user?.email || '',
          };
          setProfile(profileData);
          setForm({
            username: profileData.username,
            full_name: profileData.full_name || '',
            bio: profileData.bio || '',
            phone: profileData.phone || '',
            date_of_birth: profileData.date_of_birth || '',
            gender: profileData.gender || '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaveStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setSaveStatus('idle');
    setErrorMsg('');

    try {
      const payload: Record<string, string | null> = {
        username: form.username,
        full_name: form.full_name || null,
        bio: form.bio || null,
        phone: form.phone || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
      };

      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Save failed');
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/patient">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <span className="text-green-700 font-bold text-3xl">
              {(form.full_name || form.username || user.email).charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {form.full_name || form.username || user.email.split('@')[0]}
            </h2>
            <p className="text-sm text-gray-500">@{form.username}</p>
            <p className="text-xs text-gray-400 mt-1 capitalize">{user.role}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-4">
            Personal Details
          </h3>

          {saveStatus === 'success' && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-800">
              <Check className="w-4 h-4 flex-shrink-0" />
              Profile saved successfully.
            </div>
          )}

          {saveStatus === 'error' && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="username" requiredIndicator>Username</Label>
            <Input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              placeholder="your_username"
              className="border-gray-300 focus:border-gray-800"
            />
            <p className="text-xs text-gray-400">Letters, numbers, underscores, and hyphens only.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Your full name"
              className="border-gray-300 focus:border-gray-800"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us a little about yourself..."
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
            />
          </div>

          <h3 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-4 pt-2">
            Contact Details
          </h3>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="+250788123456"
              className="border-gray-300 focus:border-gray-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={form.date_of_birth}
                onChange={handleChange}
                className="border-gray-300 focus:border-gray-800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold h-11"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
