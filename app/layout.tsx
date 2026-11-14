import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Doctor Tracker - Healthcare Administration & Clinical Management',
  description: 'Enterprise healthcare portal for managing physicians, patient rosters, clinical assignments, and analytics.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-[#090E1A] text-slate-900 dark:text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

