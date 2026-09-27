import { sendEmail, appName } from '../../client';
import type { ContentReportEmailData } from './types';
import { generateContentReportEmailHtml } from './template-html';
import { generateContentReportEmailText } from './template-text';

const TARGET_LABEL = { post: 'post', comment: 'comment', media: 'photo', user: 'member', message: 'chat message' } as const;

/** Sends one report email to every address in `to` (TRI-237). Throws when the send fails (`sendEmail`). */
export async function sendContentReportEmail({ to, ...data }: ContentReportEmailData) {
  return await sendEmail({
    to,
    subject: `[${appName}] A ${TARGET_LABEL[data.targetType]} in ${data.tribeName} was reported (${data.reason})`,
    html: generateContentReportEmailHtml(data),
    text: generateContentReportEmailText(data),
  });
}
