import { cn, formatQuantity } from '../utils';

describe('utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names', () => {
      const result = cn('foo', 'bar');
      expect(result).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      const result = cn('foo', false && 'bar', 'baz');
      expect(result).toBe('foo baz');
    });

    it('should merge Tailwind classes correctly', () => {
      const result = cn('p-4', 'p-2');
      // twMerge should resolve conflicts, keeping the last one
      expect(result).toBe('p-2');
    });

    it('should handle arrays of classes', () => {
      const result = cn(['foo', 'bar'], 'baz');
      expect(result).toBe('foo bar baz');
    });

    it('should handle objects with boolean values', () => {
      const result = cn({ foo: true, bar: false, baz: true });
      expect(result).toBe('foo baz');
    });

    it('should return empty string for no arguments', () => {
      const result = cn();
      expect(result).toBe('');
    });
  });

  describe('formatQuantity', () => {
    it('should return empty string for null', () => {
      expect(formatQuantity(null)).toBe('');
    });

    it('should format whole numbers', () => {
      expect(formatQuantity(1)).toBe('1');
      expect(formatQuantity(5)).toBe('5');
      expect(formatQuantity(10)).toBe('10');
    });

    it('should format 0.25 as ¼', () => {
      expect(formatQuantity(0.25)).toBe('¼');
    });

    it('should format 0.5 as ½', () => {
      expect(formatQuantity(0.5)).toBe('½');
    });

    it('should format 0.75 as ¾', () => {
      expect(formatQuantity(0.75)).toBe('¾');
    });

    it('should format 0.333 as ⅓', () => {
      expect(formatQuantity(0.333)).toBe('⅓');
    });

    it('should format 0.667 as ⅔', () => {
      expect(formatQuantity(0.667)).toBe('⅔');
    });

    it('should format 0.125 as ⅛', () => {
      expect(formatQuantity(0.125)).toBe('⅛');
    });

    it('should format mixed numbers', () => {
      expect(formatQuantity(1.5)).toBe('1 ½');
      expect(formatQuantity(2.25)).toBe('2 ¼');
      expect(formatQuantity(3.75)).toBe('3 ¾');
    });

    it('should handle decimals that do not match fraction patterns', () => {
      const result = formatQuantity(1.3);
      expect(result).toContain('1');
      expect(result).toContain('0.3');
    });

    it('should handle zero', () => {
      expect(formatQuantity(0)).toBe('0');
    });

    it('should format large whole numbers', () => {
      expect(formatQuantity(100)).toBe('100');
      expect(formatQuantity(1000)).toBe('1000');
    });

    it('should format large mixed numbers', () => {
      expect(formatQuantity(10.5)).toBe('10 ½');
      expect(formatQuantity(50.25)).toBe('50 ¼');
    });

    it('should handle fractional values less than 1', () => {
      expect(formatQuantity(0.75)).toBe('¾');
      expect(formatQuantity(0.333)).toBe('⅓');
    });

  });
});
