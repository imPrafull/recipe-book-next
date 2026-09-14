import {
  getWeekStart,
  getWeekKey,
  addWeeks,
  isSameWeek,
  getWeekStatus,
  formatWeekRange,
  getDatesOfWeek,
} from '../dateUtils';

describe('dateUtils', () => {
  describe('getWeekStart', () => {
    it('returns the Monday of the current week for a Wednesday', () => {
      // 2026-09-09 is a Wednesday
      const wednesday = new Date(2026, 8, 9); // Month is 0-indexed: 8 = Sept
      const monday = getWeekStart(wednesday);
      expect(monday.getFullYear()).toBe(2026);
      expect(monday.getMonth()).toBe(8);
      expect(monday.getDate()).toBe(7); // Sept 7 2026 is Monday
    });

    it('returns the Monday of the current week for a Sunday', () => {
      // 2026-09-13 is a Sunday
      const sunday = new Date(2026, 8, 13);
      const monday = getWeekStart(sunday);
      expect(monday.getDate()).toBe(7);
    });

    it('returns the exact same date if already Monday', () => {
      // 2026-09-07 is a Monday
      const mondayInput = new Date(2026, 8, 7);
      const monday = getWeekStart(mondayInput);
      expect(monday.getDate()).toBe(7);
    });
  });

  describe('getWeekKey', () => {
    it('formats date as YYYY-MM-DD', () => {
      const date = new Date(2026, 8, 7);
      expect(getWeekKey(date)).toBe('2026-09-07');
    });
  });

  describe('addWeeks', () => {
    it('adds 1 week correctly', () => {
      const monday = new Date(2026, 8, 7);
      const nextMonday = addWeeks(monday, 1);
      expect(nextMonday.getDate()).toBe(14);
    });

    it('subtracts 1 week correctly', () => {
      const monday = new Date(2026, 8, 7);
      const prevMonday = addWeeks(monday, -1);
      expect(prevMonday.getDate()).toBe(31); // Aug 31
      expect(prevMonday.getMonth()).toBe(7); // August
    });
  });

  describe('formatWeekRange', () => {
    it('formats range within the same month', () => {
      const monday = new Date(2026, 8, 7);
      expect(formatWeekRange(monday)).toBe('Sep 7 – 13, 2026');
    });

    it('formats range spanning two months', () => {
      const monday = new Date(2026, 8, 28); // Sep 28
      expect(formatWeekRange(monday)).toBe('Sep 28 – Oct 4, 2026');
    });
  });

  describe('getDatesOfWeek', () => {
    it('returns dates for all 7 days starting from Monday', () => {
      const monday = new Date(2026, 8, 7);
      const days = getDatesOfWeek(monday);
      expect(days.monday.dateNum).toBe(7);
      expect(days.tuesday.dateNum).toBe(8);
      expect(days.wednesday.dateNum).toBe(9);
      expect(days.thursday.dateNum).toBe(10);
      expect(days.friday.dateNum).toBe(11);
      expect(days.saturday.dateNum).toBe(12);
      expect(days.sunday.dateNum).toBe(13);
    });
  });
});
