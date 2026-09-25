/** One report, as the tribe owner and the platform owner read it (TRI-237). */
export interface ContentReportEmailData {
  to: string[];
  reportId: string;
  tribeId: string;
  tribeName: string;
  reporterName: string;
  targetType: "post" | "comment" | "media" | "user";
  targetId: string;
  /** Who wrote / uploaded / is the reported target. */
  targetAuthorName: string;
  /** A short quote of the content (post / comment text), the photo URL, or null. */
  targetExcerpt: string | null;
  reason: string;
  note: string | null;
  createdAt: Date;
}
