import { appName } from '../../client';
import { escapeHtml } from './escape';
import type { ContentReportEmailData } from './types';

const TARGET_LABEL = { post: 'post', comment: 'comment', media: 'photo', user: 'member' } as const;

export function generateContentReportEmailHtml(data: Omit<ContentReportEmailData, 'to'>) {
  const e = escapeHtml;
  const row = (label: string, value: string | null) =>
    value ? `<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top">${label}</td><td style="padding:4px 0">${e(value)}</td></tr>` : '';
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Report in ${e(data.tribeName)}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="margin-top:0">A ${TARGET_LABEL[data.targetType]} in ${e(data.tribeName)} was reported</h2>
        <table style="border-collapse:collapse;font-size:15px">
          ${row('Reason', data.reason)}
          ${row('Note', data.note)}
          ${row('Reported by', data.reporterName)}
          ${row(data.targetType === 'user' ? 'Member' : 'Author', data.targetAuthorName)}
          ${row('Content', data.targetExcerpt)}
          ${row('Tribe', `${data.tribeName} (${data.tribeId})`)}
          ${row('Target', `${data.targetType} ${data.targetId}`)}
          ${row('Report', `${data.reportId} · ${data.createdAt.toISOString()}`)}
        </table>
        <p>Nothing has been hidden or removed automatically. Review it in the app and remove the content or the member if needed.</p>
        <p style="color:#666;font-size:14px">The ${e(appName)} Team</p>
      </body>
    </html>
  `;
}
