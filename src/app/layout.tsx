import type { Metadata } from 'next';
import './globals.css';
import { KlinqoProvider } from '@/context/KlinqoContext';

export const metadata: Metadata = {
  title: 'Klinqo AI (ArogyaPath AI) | Clinical Healthcare Triage & Infrastructure Discovery',
  description:
    'State-driven Indian healthcare triage platform with real-time capability scoring, operational equipment discovery, and cost transparency.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] text-brand-navy antialiased selection:bg-clinical-teal/20 selection:text-clinical-dark">
        <KlinqoProvider>
          {children}
        </KlinqoProvider>
      </body>
    </html>
  );
}
