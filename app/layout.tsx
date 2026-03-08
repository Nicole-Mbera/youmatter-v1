import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.youmatter.health'),
  title: {
    default: 'You Matter - Connect with Licensed Mental Health Professionals',
    template: '%s | You Matter',
  },
  description: 'Find a therapist, psychologist, or psychiatrist for personalized mental health care. You Matter connects you with licensed professionals for therapy, counseling, and wellness support.',
  keywords: ['mental health', 'therapy', 'therapist', 'counseling', 'psychologist', 'psychiatrist', 'online therapy', 'mental wellness', 'online counseling', 'telehealth', 'teletherapy'],
  authors: [{ name: 'You Matter' }],
  creator: 'You Matter',
  publisher: 'You Matter',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.youmatter.health',
    title: 'You Matter - Connect with Licensed Mental Health Professionals',
    description: 'Find quality mental health care with licensed therapists and psychiatrists. Book therapy sessions online.',
    siteName: 'You Matter',
    images: [
      {
        url: 'https://www.youmatter.health/uploads/logo.jpeg',
        alt: 'You Matter Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'You Matter - Connect with Licensed Mental Health Professionals',
    description: 'Find therapy and mental health support online with licensed professionals.',
    images: ['https://www.youmatter.health/uploads/logo.jpeg'],
    creator: '@youmatterhealth',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased bg-[#f5ebe3] text-[black]`}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
