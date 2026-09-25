import { resend, fromEmail, appName } from '../../client';
import { generateOTPEmailVerificationHtml } from '../otp-email-verification/template-html';

/**
 * Change email (USET-03). The 6-digit code goes to the NEW address (Better-Auth emailOTP `change-email`);
 * the old address gets a notice once the change is done, so a hijacked session can't move the account silently.
 */
export async function sendEmailChangeOTP({ to, otp, expirationMinutes = 5 }: { to: string; otp: string; expirationMinutes?: number }) {
  // Same look as the verification code email; only the wording differs
  const html = generateOTPEmailVerificationHtml({ otp, to, expirationMinutes })
    .replace('To complete your email verification, please use the verification code below:',
      `To make this your new ${appName} email address, enter the code below in the app:`)
    .replace('Enter this code in the verification form to confirm your email address and complete your account setup.',
      'Your email address will not change until you enter this code.');
  return await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Confirm your new email - ${appName}`,
    html,
    text: `Confirm your new email - ${appName}

To make this your new ${appName} email address, enter this code in the app:

${otp}

This code expires in ${expirationMinutes} minutes. Your email address will not change until you enter it.
If you didn't ask to change your email, you can ignore this message.`,
  });
}

export async function sendEmailChangedNotice({ to, newEmail }: { to: string; newEmail: string }) {
  const masked = maskEmail(newEmail);
  const text = `Your ${appName} email address was changed to ${masked}. You will no longer be able to sign in with ${to}.

If you made this change, no action is needed. If you didn't, reset your password right away and contact support.`;
  return await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Your ${appName} email address was changed`,
    html: `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;max-width:600px;margin:0 auto;padding:20px">
<h2>Your email address was changed</h2>
<p>Your ${appName} email address was changed to <strong>${masked}</strong>. You will no longer be able to sign in with ${to}.</p>
<p>If you made this change, no action is needed. If you didn't, reset your password right away and contact support.</p>
<p style="font-size:14px;color:#666">© ${new Date().getFullYear()} ${appName}</p>
</body></html>`,
    text,
  });
}

/** `jane.doe@example.com` → `ja•••@example.com` (the old inbox may no longer be the owner's) */
function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}•••@${domain}`;
}
