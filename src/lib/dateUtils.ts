import { DayOfWeek } from './types';

/**
 * Gets the Monday of the week for a given date.
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  // In JS: Sunday is 0, Monday is 1, ..., Saturday is 6.
  // Distance from Monday: Sunday -> 6, Monday -> 0, Tuesday -> 1, etc.
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Formats a Date object as YYYY-MM-DD string for key indexing.
 */
export function getWeekKey(weekStart: Date): string {
  const yyyy = weekStart.getFullYear();
  const mm = String(weekStart.getMonth() + 1).padStart(2, '0');
  const dd = String(weekStart.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Returns YYYY-MM-DD string for the Monday of the given date.
 */
export function getWeekStartDateString(date: Date = new Date()): string {
  return getWeekKey(getWeekStart(date));
}


/**
 * Adds or subtracts N weeks from a given date.
 */
export function addWeeks(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount * 7);
  return result;
}

/**
 * Checks if two dates belong to the same week.
 */
export function isSameWeek(date1: Date, date2: Date): boolean {
  return getWeekKey(getWeekStart(date1)) === getWeekKey(getWeekStart(date2));
}

/**
 * Determines whether a week is current, past, or future compared to today.
 */
export function getWeekStatus(weekStart: Date): 'current' | 'past' | 'future' {
  const currentWeekStart = getWeekStart(new Date());
  const currentKey = getWeekKey(currentWeekStart);
  const targetKey = getWeekKey(weekStart);

  if (targetKey === currentKey) return 'current';
  if (targetKey < currentKey) return 'past';
  return 'future';
}

/**
 * Formats week range string, e.g., "Sep 7 – Sep 13, 2026" or "Sep 7 – 13, 2026".
 */
export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  const startYear = weekStart.getFullYear();
  const endYear = weekEnd.getFullYear();

  if (startYear !== endYear) {
    return `${startMonth} ${weekStart.getDate()}, ${startYear} – ${endMonth} ${weekEnd.getDate()}, ${endYear}`;
  }
  if (startMonth !== endMonth) {
    return `${startMonth} ${weekStart.getDate()} – ${endMonth} ${weekEnd.getDate()}, ${startYear}`;
  }
  return `${startMonth} ${weekStart.getDate()} – ${weekEnd.getDate()}, ${startYear}`;
}

export interface DayDateInfo {
  date: Date;
  formattedShort: string;
  dateNum: number;
}

/**
 * Returns date information for each day (Monday to Sunday) of the week starting at weekStart.
 */
export function getDatesOfWeek(weekStart: Date): Record<DayOfWeek, DayDateInfo> {
  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const result = {} as Record<DayOfWeek, DayDateInfo>;

  days.forEach((day, index) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + index);
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const dateNum = d.getDate();
    result[day] = {
      date: d,
      formattedShort: `${month} ${dateNum}`,
      dateNum,
    };
  });

  return result;
}
