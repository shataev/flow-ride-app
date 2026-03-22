/** Relative time in English, e.g. "45 minutes ago". */
export function formatEventAddedAt(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "always" });
  const secondsAgo = Math.round((Date.now() - d.getTime()) / 1000);

  if (secondsAgo < 0) {
    const s = Math.abs(secondsAgo);
    if (s < 60) return rtf.format(s, "second");
    const m = Math.round(s / 60);
    if (m < 60) return rtf.format(m, "minute");
    const h = Math.round(s / 3600);
    return h < 48 ? rtf.format(h, "hour") : rtf.format(Math.round(s / 86400), "day");
  }

  if (secondsAgo < 10) return "Just now";

  if (secondsAgo < 60) return rtf.format(-secondsAgo, "second");

  const minutesAgo = Math.round(secondsAgo / 60);
  if (minutesAgo < 60) return rtf.format(-minutesAgo, "minute");

  const hoursAgo = Math.round(secondsAgo / 3600);
  if (hoursAgo < 24) return rtf.format(-hoursAgo, "hour");

  const daysAgo = Math.round(secondsAgo / 86400);
  if (daysAgo < 7) return rtf.format(-daysAgo, "day");

  const weeksAgo = Math.round(daysAgo / 7);
  if (weeksAgo < 5) return rtf.format(-weeksAgo, "week");

  const monthsAgo = Math.round(daysAgo / 30);
  if (monthsAgo < 12) return rtf.format(-monthsAgo, "month");

  const yearsAgo = Math.round(daysAgo / 365);
  return rtf.format(-yearsAgo, "year");
}
