import { appName } from '../../client';
import type { ContentReportEmailData } from './types';

const TARGET_LABEL = { post: 'post', comment: 'comment', media: 'photo', user: 'member', message: 'chat message' } as const;

export function generateContentReportEmailText(data: Omit<ContentReportEmailData, 'to'>) {
  const lines = [
    `A ${TARGET_LABEL[data.targetType]} in ${data.tribeName} was reported on ${appName}.`,
    '',
    `Reason: ${data.reason}`,
    data.note ? `Note from the reporter: ${data.note}` : null,
    `Reported by: ${data.reporterName}`,
    `${data.targetType === 'user' ? 'Member' : 'Author'}: ${data.targetAuthorName}`,
    data.targetExcerpt ? `Content: ${data.targetExcerpt}` : null,
    '',
    `Tribe: ${data.tribeName} (${data.tribeId})`,
    `Target: ${data.targetType} ${data.targetId}`,
    `Report: ${data.reportId} · ${data.createdAt.toISOString()}`,
    '',
    `Nothing has been hidden or removed automatically. Review it in the app and remove the content or the member if needed.`,
    '',
    `The ${appName} Team`,
  ];
  return lines.filter((line) => line !== null).join('\n');
}
