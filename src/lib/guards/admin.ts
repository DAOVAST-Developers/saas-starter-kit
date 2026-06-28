import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Server-side guard for admin-only pages. Returns the user when they have the
 * global 'admin' application role; otherwise redirects to /dashboard.
 *
 * Use at the top of every admin Server Component / Server Action. This is the
 * authoritative check — do not rely on UI hiding alone.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  return user;
}
