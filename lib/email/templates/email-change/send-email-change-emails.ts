import { AUTH_CONSTANTS } from '@/lib/constants/auth';
import { sendEmail, appName, supportEmail } from '../../client';
import { codeBlock, renderEmail } from '../../layout';

/**
 * Change email (USET-03). The 6-digit code goes to the NEW address (Better-Auth emailOTP `change-email`);
 * the old address gets a notice once the change is done, so a hijacked session can't move the account silently.
 */
export async function sendEmailChangeOTP({ to, otp, expirationMinutes = AUTH_CONSTANTS.OTP_EXPIRES_MINUTES }: { to: string; otp: string; expirationMinutes?: number }) {
  const { html, text } = renderEmail({
    heading: 'Confirm your new email',
    preheader: `Your ${appName} code is ${otp}.`,
    blocks: [
      `To make this your new ${appName} email address, enter this code in the app:`,
      codeBlock(otp),
      `It expires in ${expirationMinutes} minutes. Your email address won't change until you enter it.`,
    ],
    reason: `You're getting this because someone asked to move a ${appName} account to ${to}. If it wasn't you, ignore this email.`,
  });
  return await sendEmail({ to, subject: `Confirm your new email - ${appName}`, html, text });
}

export async function sendEmailChangedNotice({ to, newEmail }: { to: string; newEmail: string }) {
  const { html, text } = renderEmail({
    heading: 'Your email address was changed',
    preheader: `Your ${appName} account now uses ${maskEmail(newEmail)}.`,
    blocks: [
      `Your ${appName} email address was changed to ${maskEmail(newEmail)}. You can't sign in with ${to} anymore.`,
      `If you made this change, there's nothing to do. If you didn't, reset your password right away${supportEmail ? ` and write to ${supportEmail}` : ''}.`,
    ],
    reason: `This is a security notice about your ${appName} account, sent to the address it used before.`,
  });
  return await sendEmail({ to, subject: `Your ${appName} email address was changed`, html, text });
}

/** `jane.doe@example.com` → `ja•••@example.com` (the old inbox may no longer be the owner's) */
function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}•••@${domain}`;
}
