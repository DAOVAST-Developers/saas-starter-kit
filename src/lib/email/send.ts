import { render } from '@react-email/components';
import { resend, EMAIL_FROM } from '@/lib/email/resend';
import WelcomeEmail from '@/emails/welcome';
import InvoiceEmail from '@/emails/invoice';
import PasswordResetEmail from '@/emails/password-reset';
import TeamInviteEmail from '@/emails/team-invite';

type SendResult = { sent: boolean; error?: string };

async function deliver(
  to: string,
  subject: string,
  element: React.ReactElement,
): Promise<SendResult> {
  if (!resend) {
    // Email not configured (no RESEND_API_KEY). No-op in dev.
    return { sent: false, error: 'RESEND_API_KEY not configured' };
  }
  const html = await render(element);
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  });
  return error ? { sent: false, error: error.message } : { sent: true };
}

export function sendWelcomeEmail(to: string, name: string, dashboardUrl: string) {
  return deliver(to, 'Welcome to SaaS Starter', WelcomeEmail({ name, dashboardUrl }));
}

export function sendInvoiceEmail(
  to: string,
  props: { name: string; amount: string; plan: string; periodEnd: string },
) {
  return deliver(to, 'Your payment receipt', InvoiceEmail(props));
}

export function sendPasswordResetEmail(to: string, resetUrl: string) {
  return deliver(to, 'Reset your password', PasswordResetEmail({ resetUrl }));
}

export function sendTeamInviteEmail(
  to: string,
  props: { orgName: string; role: string; acceptUrl: string },
) {
  return deliver(to, `You're invited to ${props.orgName}`, TeamInviteEmail(props));
}
