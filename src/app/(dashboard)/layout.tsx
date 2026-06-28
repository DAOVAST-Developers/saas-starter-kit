import Link from 'next/link';
import { requireUser, getProfile } from '@/lib/auth';

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/settings', label: 'Settings' },
  { href: '/settings/billing', label: 'Billing' },
  { href: '/settings/team', label: 'Team' },
];

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireUser();
  const profile = await getProfile();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-border bg-muted/40 p-4 md:flex">
        <Link href="/dashboard" className="mb-6 px-2 text-lg font-bold">
          SaaS Starter
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
          {profile?.role === 'admin' && (
            <Link
              href="/admin"
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Admin
            </Link>
          )}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border px-6">
          <div className="text-sm text-muted-foreground">
            {profile?.full_name ?? 'Account'}
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
