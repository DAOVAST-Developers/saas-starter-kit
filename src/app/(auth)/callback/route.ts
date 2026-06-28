import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth / email-confirmation callback. Exchanges the auth code for a session
 * and redirects onward. Handles the load-balancer/forwarded-host case so it
 * works behind proxies and in local dev alike.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Fire a welcome email on first confirmation/login. Safe no-op when
      // RESEND_API_KEY is unset; failures are swallowed so auth never breaks.
      try {
        const user = data.user;
        const isNew =
          user?.created_at &&
          user.last_sign_in_at &&
          Math.abs(
            new Date(user.created_at).getTime() -
              new Date(user.last_sign_in_at).getTime(),
          ) < 60_000;
        if (user?.email && isNew) {
          const { sendWelcomeEmail } = await import('@/lib/email/send');
          await sendWelcomeEmail(
            user.email,
            (user.user_metadata?.full_name as string) ?? 'there',
            `${origin}/dashboard`,
          );
        }
      } catch {
        // ignore email errors
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
