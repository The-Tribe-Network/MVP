import { sendEmail, appName } from '../../client';
import { detailList, renderEmail } from '../../layout';
import type { ContentReportEmailData } from './types';

const TARGET_LABEL = { post: 'post', comment: 'comment', media: 'photo', user: 'member', message: 'chat message' } as const;

/** Sends one report email to every address in `to` (TRI-237). Throws when the send fails (`sendEmail`). */
export async function sendContentReportEmail({ to, ...data }: ContentReportEmailData) {
  const target = TARGET_LABEL[data.targetType];
  const { html, text } = renderEmail({
    heading: `A ${target} in ${data.tribeName} was reported`,
    preheader: `Reason: ${data.reason}`,
    blocks: [
      detailList([
        ['Reason', data.reason],
        ['Note', data.note],
        ['Reported by', data.reporterName],
        [data.targetType === 'user' ? 'Member' : 'Author', data.targetAuthorName],
        ['Content', data.targetExcerpt],
      ]),
      'Nothing has been hidden or removed automatically. Review it in the app and remove the content or the member if needed.',
      detailList([
        ['Tribe', `${data.tribeName} (${data.tribeId})`],
        ['Target', `${data.targetType} ${data.targetId}`],
        ['Report', `${data.reportId} · ${data.createdAt.toISOString()}`],
      ]),
    ],
    reason: `You're getting this because you own ${data.tribeName} or run ${appName}.`,
  });
  return await sendEmail({
    to,
    subject: `[${appName}] A ${target} in ${data.tribeName} was reported (${data.reason})`,
    html,
    text,
  });
}
