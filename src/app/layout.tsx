import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/query-provider';

export const metadata: Metadata = {
  title: 'SaaS Starter Kit',
  description: 'Production-grade Next.js SaaS boilerplate with auth, billing, and teams.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
