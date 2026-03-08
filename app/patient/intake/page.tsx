'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { IntakeForm } from '@/components/patient/intake-form';

interface IntakeFormData {
  chief_complaint: string;
  medical_history: string;
  current_medications: string;
  mental_health_history: string;
  therapy_goals: string[];
  preferred_session_duration: number;
  availability: string;
  insurance_provider?: string;
  insurance_id?: string;
}

export default function PatientIntakePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: IntakeFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/patient/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit intake form');
      }

      const result = await response.json();
      
      // Redirect to dashboard after successful submission
      setTimeout(() => {
        router.push('/patient?intake_complete=true');
      }, 2000);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell
      title="Welcome to Mental Health Support"
      subtitle="Let's get to know you better. Please complete this intake form."
      breadcrumbs={[{ label: 'Patient', href: '/patient' }, { label: 'Intake Form' }]}
      navItems={[
        { label: 'Dashboard', href: '/patient', icon: 'Home' },
        { label: 'Find Therapist', href: '/patient/find-therapist', icon: 'Search' },
        { label: 'My Sessions', href: '/patient/sessions', icon: 'Calendar' },
        { label: 'My Profile', href: '/patient/profile', icon: 'User' },
      ]}
    >
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">Patient Intake Form</h2>
          <p className="text-gray-600">
            We take your privacy and well-being seriously. This information will help us match you with the right therapist and create a personalized treatment plan.
          </p>
        </div>
        
        <IntakeForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </DashboardShell>
  );
}
