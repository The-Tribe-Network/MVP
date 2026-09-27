import { Resend } from 'resend';
import { publicBaseUrl } from '@/lib/constants/urls';
import { unsubscribeHeaders, type EmailCategory } from './unsubscribe';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
export const appName = process.env.APP_NAME || 'Tribe';
export const appUrl = publicBaseUrl();
/** Replies and "contact support" go here (TRI-343). Unset = replies go to the sender address. */
export const supportEmail = process.env.SUPPORT_EMAIL || undefined;

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  /** Opt-out category: adds the RFC 8058 one-click unsubscribe headers (TRI-344) */
  unsubscribe?: { userId: string; category: EmailCategory };
}

/**
 * Every email goes through here (TRI-341). Resend answers API errors in `error` rather than throwing; this turns
 * them into a thrown Error so a failed send is never mistaken for a sent one. Logs name the recipient's domain
 * only, never the address.
 */
export async function sendEmail({ to, subject, html, text, unsubscribe }: SendEmailOptions) {
  const result = await resend.emails.send({
    from: fromEmail,
    to,
    subject,
    html,
    text,
    ...(supportEmail && { replyTo: supportEmail }),
    ...(unsubscribe && { headers: unsubscribeHeaders(unsubscribe.userId, unsubscribe.category) }),
  });
  if (result.error) {
    const domains = [to].flat().map((address) => address.split('@')[1] ?? '?').join(', ');
    const reason = `${result.error.name ?? 'error'}: ${result.error.message}`;
    console.error(`[email] "${subject}" to @${domains} failed: ${reason}`);
    throw new Error(`Resend: ${reason}`);
  }
  return result.data;
}
