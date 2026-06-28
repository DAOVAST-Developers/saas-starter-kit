import Link from 'next/link';

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted px-4">
      <Link href="/" className="mb-6 text-2xl font-bold tracking-tight">
        SaaS Starter
      </Link>
      <div className="w-full max-w-md rounded-lg border border-border bg-background p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
