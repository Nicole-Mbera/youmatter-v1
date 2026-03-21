"use client";

import { SignupForm } from "@/components/auth/signup-form";

export default function therapistSignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Become a Professional</h1>
          <p className="text-gray-600 mt-2">Join our network of licensed therapists</p>
        </div>
        <SignupForm preSelectedRole="therapist" />
      </div>
    </div>
  );
}
