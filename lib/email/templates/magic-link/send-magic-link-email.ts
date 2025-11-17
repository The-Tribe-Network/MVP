import { resend, fromEmail, appName } from '../../client';
import { MagicLinkEmailData } from './types';
import { generateMagicLinkEmailHtml } from './template-html';
import { generateMagicLinkEmailText } from './template-text';

export async function sendMagicLinkEmail(data: MagicLinkEmailData) {
  const { to, magicLink, userName } = data;
  
  return await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Sign in to ${appName}`,
    html: generateMagicLinkEmailHtml({ magicLink, userName, to }),
    text: generateMagicLinkEmailText({ magicLink, userName }),
  });
}
