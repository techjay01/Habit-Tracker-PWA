import { describe, it, expect } from 'vitest';
import { getHabitSlug } from '@/lib/slug';

describe('getHabitSlug', () => {
  it('returns lowercase hyphenated slug for a basic habit name', () => {
    expect(getHabitSlug('Drink Water')).toBe('drink-water');
    expect(getHabitSlug('Read Books')).toBe('read-books');
    expect(getHabitSlug('Exercise Daily')).toBe('exercise-daily');
  });

  it('trims outer spaces and collapses repeated internal spaces', () => {
    expect(getHabitSlug('  Drink Water  ')).toBe('drink-water');
    expect(getHabitSlug('Read   Books')).toBe('read-books');
    expect(getHabitSlug('  Multiple   Spaces   Here  ')).toBe('multiple-spaces-here');
  });

  it('removes non alphanumeric characters except hyphens', () => {
    expect(getHabitSlug('Drink Water!')).toBe('drink-water');
    expect(getHabitSlug('Read & Write')).toBe('read-write');
    expect(getHabitSlug('100% Effort')).toBe('100-effort');
    expect(getHabitSlug('Self-Care')).toBe('self-care');
    expect(getHabitSlug('Morning (Routine)')).toBe('morning-routine');
  });
});
