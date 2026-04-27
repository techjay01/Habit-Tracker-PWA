// ─── localStorage keys ────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  USERS: 'habit-tracker-users',
  SESSION: 'habit-tracker-session',
  HABITS: 'habit-tracker-habits',
} as const;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const AUTH_ERRORS = {
  USER_ALREADY_EXISTS: 'User already exists',
  INVALID_CREDENTIALS: 'Invalid email or password',
} as const;

// ─── Validation ───────────────────────────────────────────────────────────────

export const HABIT_NAME_MAX_LENGTH = 60;

export const VALIDATION_ERRORS = {
  HABIT_NAME_REQUIRED: 'Habit name is required',
  HABIT_NAME_TOO_LONG: `Habit name must be ${HABIT_NAME_MAX_LENGTH} characters or fewer`,
} as const;

// ─── Habit defaults ───────────────────────────────────────────────────────────

export const DEFAULT_FREQUENCY = 'daily' as const;

// ─── Splash screen ────────────────────────────────────────────────────────────

/** Duration the splash screen is visible before redirecting (ms). Must be 800–2000. */
export const SPLASH_DURATION_MS = 1200;

// ─── PWA ─────────────────────────────────────────────────────────────────────

export const APP_NAME = 'Habit Tracker';
export const APP_SHORT_NAME = 'Habits';
