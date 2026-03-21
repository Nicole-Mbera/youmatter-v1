import Link from "next/link";
import { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({
  title,
  subtitle,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative soft shapes */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-green-100/20 blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-green-50/30 blur-3xl opacity-20" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 hover:opacity-80 transition">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">UM</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">You Matter</span>
          </Link>
        </div>

        {/* Form */}
        <div className="rounded-3xl bg-white p-8 shadow-lg border border-green-200/50 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{title}</h2>
          <div className="space-y-6">{children}</div>
          {footer && <div className="pt-4 text-sm text-gray-600 text-center">{footer}</div>}
        </div>

        {/* Trust Badge */}
        <div className="text-center text-xs text-gray-500">
          <p>Your information is encrypted and secure. <span className="text-green-600 font-semibold">HIPAA compliant</span></p>
        </div>
      </div>
    </div>
  );
}