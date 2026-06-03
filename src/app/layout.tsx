import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KalinEdu Analytics - School Academic Analytics for Kenya',
  description:
    'Transform your Excel marksheets into instant analytics with automated CBC/KCSE grading, class rankings, and professional reports for Kenyan schools.',
  keywords: [
    'KalinEdu',
    'school analytics',
    'CBC grading',
    'KCSE grading',
    'Kenya education',
    'marksheet processing',
    'academic analytics',
  ],
  authors: [{ name: 'KALINITECH SYSTEMS', url: 'mailto:kalinimedia001@gmail.com' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
