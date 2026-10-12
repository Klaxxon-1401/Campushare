// Date helpers. All "calendar dates" in the app are YYYY-MM-DD strings and are
// handled in the device's local timezone to avoid UTC off-by-one bugs.

const DAY_MS = 24 * 60 * 60 * 1000;

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

/** Monday-first weekday initials. */
export const WEEKDAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

const pad2 = (n: number): string => String(n).padStart(2, '0');

export const toISODate = (d: Date): string =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

/** Parse a YYYY-MM-DD string at local midnight. */
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

export const addMonths = (year: number, month: number, delta: number) => {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
};

/** Difference in whole days (positive when `end` is after `start`). */
export const diffDays = (startISO: string, endISO: string): number =>
  Math.round((parseISODate(endISO).getTime() - parseISODate(startISO).getTime()) / DAY_MS);

/** Rental length treating both endpoints as billable days (same day = 1). */
export const daysInclusive = (startISO: string, endISO: string): number =>
  Math.max(1, diffDays(startISO, endISO) + 1);

export const eachDay = (startISO: string, endISO: string): string[] => {
  const out: string[] = [];
  for (let d = startISO, guard = 0; d <= endISO && guard < 400; d = addDays(d, 1), guard++) {
    out.push(d);
  }
  return out;
};

export const isBeforeToday = (iso: string): boolean => iso < todayISO();

export const overlaps = (
  aStart: string, aEnd: string, bStart: string, bEnd: string
): boolean => aStart <= bEnd && bStart <= aEnd;

export const formatShort = (iso: string): string => {
  const d = parseISODate(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
};

export const formatLong = (iso: string): string => {
  const d = parseISODate(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
};

/** "12–15 Oct" when within a month/year, otherwise "12 Oct – 3 Nov". */
export const formatRange = (startISO: string, endISO: string): string => {
  const s = parseISODate(startISO);
  const e = parseISODate(endISO);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()}–${e.getDate()} ${MONTHS_SHORT[e.getMonth()]}`;
  }
  return `${formatShort(startISO)} – ${formatShort(endISO)}`;
};

export interface CalendarCell {
  iso: string;
  day: number;
  inMonth: boolean;
}

/**
 * Build a Monday-first month grid (rows of 7 cells) with leading/trailing
 * days from adjacent months so weeks are always complete.
 */
export const getMonthMatrix = (year: number, month: number): CalendarCell[][] => {
  const first = new Date(year, month, 1);
  // JS getDay(): 0=Sun..6=Sat. Convert to Monday-first index.
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - offset);

  const weeks: CalendarCell[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < 6; w++) {
    const row: CalendarCell[] = [];
    for (let i = 0; i < 7; i++) {
      row.push({
        iso: toISODate(cursor),
        day: cursor.getDate(),
        inMonth: cursor.getMonth() === month,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(row);
  }
  return weeks;
};

export const monthKey = (year: number, month: number): string =>
  `${year}-${pad2(month + 1)}`;
