/** Event times in emails, in the recipient's timezone (TRI-349, TRI-350). */

/** "Mon, Sep 28, 2:00 PM – 4:00 PM EDT" in `timeZone`; the end's date only when it's another day */
export function formatWhen(start: Date, end: Date | null, timeZone: string): string {
  const day = (d: Date) =>
    new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", month: "short", day: "numeric" }).format(d);
  const time = (d: Date, zone: boolean) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
      ...(zone ? { timeZoneName: "short" as const } : {}),
    }).format(d);
  if (!end) return `${day(start)}, ${time(start, true)}`;
  const sameDay = day(start) === day(end);
  return sameDay
    ? `${day(start)}, ${time(start, false)} – ${time(end, true)}`
    : `${day(start)}, ${time(start, false)} – ${day(end)}, ${time(end, true)}`;
}

/** `zone` if Intl knows it, else null (user.timezone is free text). */
export function validZone(zone: string | null | undefined): string | null {
  if (!zone) return null;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return zone;
  } catch {
    return null;
  }
}
