import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'JSON Viewer & Formatter',
  description:
    'A comprehensive JSON viewer and formatter with validation, editing, and export capabilities. Built with Next.js and Tailwind CSS.',
  keywords: [
    'JSON',
    'viewer',
    'formatter',
    'validator',
    'editor',
    'developer tools',
  ],
  authors: [{ name: 'Zihad Hossain Nayem' }],
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme='system' storageKey='json-viewer-theme'>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
