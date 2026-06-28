import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          SaaS Starter Kit
        </h1>
        <p className="text-lg text-muted-foreground">
          Auth, billing, teams, dashboard, and admin panel. Ship your SaaS in days, not months.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/signup"
          className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground"
        >
          Get started
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-border px-6 py-3 font-medium"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
