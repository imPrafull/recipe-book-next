import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a numeric quantity for display.
 * Converts common decimal fractions to Unicode fraction characters.
 * Supports mixed numbers (e.g. 1.5 → "1 ½").
 * Returns empty string for null.
 */
const DECIMAL_FRACTIONS: Record<string, string> = {
  '0.125': '⅛',
  '0.25':  '¼',
  '0.333': '⅓',
  '0.5':   '½',
  '0.667': '⅔',
  '0.75':  '¾',
};

export function formatQuantity(qty: number | null): string {
  if (qty === null) return '';

  const whole = Math.floor(qty);
  const decimal = qty - whole;

  // Try to match the fractional part (round to 3 decimal places to avoid float noise)
  const decimalKey = decimal.toFixed(3).replace(/0+$/, '');
  const fraction = DECIMAL_FRACTIONS[decimalKey] ?? (decimal > 0 ? decimalKey : '');

  if (whole === 0) {
    return fraction || String(qty);
  }
  if (!fraction) {
    return String(qty);
  }
  return `${whole} ${fraction}`;
}
