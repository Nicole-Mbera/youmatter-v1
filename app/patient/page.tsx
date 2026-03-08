'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bell, Settings, LogOut, MessageSquare, BookOpen, PieChart, Home, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const moodData = [
  { day: 'Mon', mood: 3 },
  { day: 'Tue', mood: 4 },
  { day: 'Wed', mood: 2 },
  { day: 'Thu', mood: 3 },
  { day: 'Fri', mood: 5 },
  { day: 'Sat', mood: 4 },
  { day: 'Sun', mood: 4 },
];

const upcomingAppointments = [
  {
    id: 1,
    therapist: 'Dr. Amara Okonkwo',
    specialty: 'Clinical Psychologist',
    date: 'Tomorrow',
    time: '2:00 PM',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    id: 2,
    therapist: 'Dr. Kwame Mensah',
    specialty: 'Licensed Therapist',
    date: 'Friday',
    time: '4:00 PM',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
];

const checkInMoods = ['😔 Sad', '😕 Anxious', '😐 Neutral', '🙂 Better', '😄 Great'];

export default function PatientDashboard() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [journalEntry, setJournalEntry] = useState('');
  const [showCheckIn, setShowCheckIn] = useState(true);

  const handleMoodSubmit = () => {
    setSelectedMood(null);
    setShowCheckIn(false);
    // In real app, save to backend
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 sticky top-0 h-screen flex flex-col shadow-sm`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold">UM</span>
          </div>
          {sidebarOpen && <span className="font-bold text-lg text-gray-900">You Matter</span>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { icon: Home, label: 'Dashboard', href: '/patient' },
            { icon: Bell, label: 'My Sessions', href: '/patient/sessions' },
            { icon: MessageSquare, label: 'Messages', href: '/patient/messages' },
            { icon: BookOpen, label: 'Journal', href: '/patient/journal' },
            { icon: PieChart, label: 'Mood Tracker', href: '/patient/mood-tracker' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} href={item.href}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-700 transition-colors cursor-pointer group">
                  <Icon className="w-5 h-5 group-hover:text-green-600" />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link href="/patient/settings">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors cursor-pointer">
              <Settings className="w-5 h-5" />
              {sidebarOpen && <span className="text-sm font-medium">Settings</span>}
            </div>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 border-t border-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span className="text-lg">›</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Chioma!</h1>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6 text-gray-600" />
              </button>
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop"
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Quick Check-In Widget */}
          {showCheckIn && (
            <div className="mb-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">How are you feeling today?</h2>
                  <p className="text-gray-600">Take a quick moment to check in with yourself</p>
                </div>
                <button
                  onClick={() => setShowCheckIn(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="flex flex-wrap gap-3">
                {checkInMoods.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`px-6 py-3 rounded-xl text-lg font-medium transition-all ${
                      selectedMood === mood
                        ? 'bg-green-600 text-white scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>

              {selectedMood && (
                <div className="mt-4 flex gap-3">
                  <Button
                    onClick={handleMoodSubmit}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                  >
                    Save Check-In
                  </Button>
                  <Button
                    onClick={() => setSelectedMood(null)}
                    variant="secondary"
                    className="rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Appointments & Actions */}
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Appointment Card */}
              {upcomingAppointments.length > 0 && (
                <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Next Session</h2>
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      in 24 hours
                    </span>
                  </div>

                  <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200">
                    <img
                      src={upcomingAppointments[0].image}
                      alt={upcomingAppointments[0].therapist}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {upcomingAppointments[0].therapist}
                      </h3>
                      <p className="text-sm text-gray-600">{upcomingAppointments[0].specialty}</p>
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        {upcomingAppointments[0].date} at{' '}
                        <span className="text-green-600">{upcomingAppointments[0].time}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold h-11">
                      Join Video Session
                    </Button>
                    <Button variant="secondary" className="flex-1 rounded-lg">
                      Reschedule
                    </Button>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <Link href="/patient/find-therapist">
                  <div className="rounded-2xl bg-white border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer text-center">
                    <Plus className="w-8 h-8 text-green-600 mx-auto mb-3" />
                    <p className="font-semibold text-gray-900">Book New Session</p>
                  </div>
                </Link>
                <Link href="/patient/messages">
                  <div className="rounded-2xl bg-white border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer text-center">
                    <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <p className="font-semibold text-gray-900">Message Therapist</p>
                  </div>
                </Link>
              </div>

              {/* Weekly Mood Chart */}
              <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Your Week at a Glance</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={moodData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={[1, 5]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="#16a34a"
                      strokeWidth={2}
                      dot={{ fill: '#16a34a', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-600 text-center mt-4">
                  Your mood improved by 33% this week. Great progress! 🎉
                </p>
              </div>
            </div>

            {/* Right Column - Sidebar Info */}
            <div className="space-y-6">
              {/* Upcoming Sessions List */}
              <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h3>
                <div className="space-y-4">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <img
                        src={apt.image}
                        alt={apt.therapist}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{apt.therapist}</p>
                        <p className="text-xs text-gray-600">{apt.date} at {apt.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Journey</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Sessions Completed</p>
                      <p className="text-2xl font-bold text-green-600">12</p>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 w-2/3"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Consistency Score</p>
                      <p className="text-2xl font-bold text-blue-600">87%</p>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 w-87"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Journal Entries</p>
                      <p className="text-2xl font-bold text-purple-600">24</p>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crisis Support Card */}
              <div className="rounded-2xl bg-red-50 border border-red-200 p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-3">Need Help Now?</h3>
                <p className="text-sm text-red-700 mb-4">If you're in crisis, please reach out immediately.</p>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold h-10">
                  Crisis Hotline
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
