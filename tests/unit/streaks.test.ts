import { describe, it, expect } from 'vitest';
import { calculateCurrentStreak } from '@/lib/streaks';

// Helper: offset today by N days, returns YYYY-MM-DD
function daysAgo(n: number, from = '2024-06-15'): string {
  const d = new Date(from + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().split('T')[0];
}

const TODAY = '2024-06-15';
const YESTERDAY = daysAgo(1, TODAY);
const TWO_DAYS_AGO = daysAgo(2, TODAY);
const THREE_DAYS_AGO = daysAgo(3, TODAY);

describe('calculateCurrentStreak', () => {
  it('returns 0 when completions is empty', () => {
    expect(calculateCurrentStreak([], TODAY)).toBe(0);
  });

  it('returns 0 when today is not completed', () => {
    expect(calculateCurrentStreak([YESTERDAY], TODAY)).toBe(0);
    expect(calculateCurrentStreak([TWO_DAYS_AGO, THREE_DAYS_AGO], TODAY)).toBe(0);
  });

  it('returns the correct streak for consecutive completed days', () => {
    expect(calculateCurrentStreak([TODAY], TODAY)).toBe(1);
    expect(calculateCurrentStreak([TODAY, YESTERDAY], TODAY)).toBe(2);
    expect(calculateCurrentStreak([TODAY, YESTERDAY, TWO_DAYS_AGO], TODAY)).toBe(3);
  });

  it('ignores duplicate completion dates', () => {
    // Duplicate today entries should still count as streak of 1
    expect(calculateCurrentStreak([TODAY, TODAY, TODAY], TODAY)).toBe(1);
    // Duplicates mixed with yesterday
    expect(calculateCurrentStreak([TODAY, TODAY, YESTERDAY, YESTERDAY], TODAY)).toBe(2);
  });

  it('breaks the streak when a calendar day is missing', () => {
    // Today and two days ago but NOT yesterday — streak should be 1 (not 2)
    expect(calculateCurrentStreak([TODAY, TWO_DAYS_AGO], TODAY)).toBe(1);
    // Three consecutive but missing the day before yesterday
    expect(calculateCurrentStreak([TODAY, YESTERDAY, THREE_DAYS_AGO], TODAY)).toBe(2);
  });

  it('uses the current date when no today argument is provided', () => {
    // Call without the second argument — should not throw and returns a number
    const result = calculateCurrentStreak([]);
    expect(typeof result).toBe('number');
  });
});
