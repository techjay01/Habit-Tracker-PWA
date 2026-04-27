import { HABIT_NAME_MAX_LENGTH, VALIDATION_ERRORS } from '@/lib/constants';

/**
 * Validates a habit name.
 * - trims the input
 * - rejects empty values
 * - rejects values longer than 60 characters
 * - returns normalized trimmed value when valid
 */
export function validateHabitName(name: string): {
  valid: boolean;
  value: string;
  error: string | null;
} {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, value: trimmed, error: VALIDATION_ERRORS.HABIT_NAME_REQUIRED };
  }

  if (trimmed.length > HABIT_NAME_MAX_LENGTH) {
    return {
      valid: false,
      value: trimmed,
      error: VALIDATION_ERRORS.HABIT_NAME_TOO_LONG,
    };
  }

  return { valid: true, value: trimmed, error: null };
}
