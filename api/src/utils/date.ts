// Date helpers for the API. Calendar dates are YYYY-MM-DD strings.

const DAY_MS = 24 * 60 * 60 * 1000;

const pad2 = (n: number): string => String(n).padStart(2, '0');

export const toISODate = (d: Date): string =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export const parseISODate = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

export const todayISO = (): string => toISODate(new Date());

export const addDays = (iso: string, days: number): string => {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
};

export const diffDays = (start: string, end: string): number =>
  Math.round((parseISODate(end).getTime() - parseISODate(start).getTime()) / DAY_MS);

/** Rental length treating both endpoints as billable days (same day = 1). */
export const daysInclusive = (start: string, end: string): number =>
  Math.max(1, diffDays(start, end) + 1);

export const eachDay = (start: string, end: string): string[] => {
  const out: string[] = [];
  for (let d = start, guard = 0; d <= end && guard < 400; d = addDays(d, 1), guard++) out.push(d);
  return out;
};

export const overlaps = (
  aStart: string, aEnd: string, bStart: string, bEnd: string
): boolean => aStart <= bEnd && bStart <= aEnd;