import { resend, fromEmail, appName } from '../../client';
import type { ContentReportEmailData } from './types';
import { generateContentReportEmailHtml } from './template-html';
import { generateContentReportEmailText } from './template-text';

const TARGET_LABEL = { post: 'post', comment: 'comment', media: 'photo', user: 'member' } as const;

/**
 * Sends one report email to every address in `to` (TRI-237). Resend answers API errors in `error` rather
 * than throwing; both are surfaced as a thrown Error so the caller logs one way.
 */
export async function sendContentReportEmail({ to, ...data }: ContentReportEmailData) {
  const result = await resend.emails.send({
    from: fromEmail,
    to,
    subject: `[${appName}] A ${TARGET_LABEL[data.targetType]} in ${data.tribeName} was reported (${data.reason})`,
    html: generateContentReportEmailHtml(data),
    text: generateContentReportEmailText(data),
  });
  if (result.error) {
    throw new Error(`Resend: ${result.error.name ?? 'error'}: ${result.error.message}`);
  }
  return result.data;
}
