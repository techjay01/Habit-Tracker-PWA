# Habit Tracker PWA

**Author:** Mbamara Joshua - Jay Tech
**GitHub:** https://github.com/techjay01  
**Live Demo:** https://jay-habit-tracker.vercel.app 

---

A mobile-first Progressive Web App for building consistent daily habits. Built as a technical implementation of the Stage 3 Technical Requirements Document.

---

## Project Overview

Habit Tracker lets you:

- Sign up and log in with email and password (local auth — no server required)
- Create, edit, and delete daily habits
- Mark habits complete for today and unmark them
- Track your current streak for each habit
- Install as a PWA and use it offline
- Reload the app and retain all saved state via localStorage

The entire persistence layer uses `localStorage` — there is no remote database or external auth service. All behavior is deterministic and testable.

---

## Setup Instructions

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Install dependencies

```bash
npm install
```

### Install Playwright browsers (for E2E tests)

```bash
npx playwright install chromium
```

---

## Run Instructions

### Development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build

```bash
npm run build
npm run start
```

---

## Test Instructions

### Run all tests

```bash
npm test
```

This runs unit tests, integration tests, and E2E tests in sequence.

### Unit tests only (with coverage)

```bash
npm run test:unit
```

Runs Vitest against `tests/unit/**` with V8 coverage. Coverage is reported for `src/lib/**`.  
Minimum threshold: **80% line coverage** for `src/lib`.

### Integration / component tests only

```bash
npm run test:integration
```

Runs Vitest against `tests/integration/**` using React Testing Library and jsdom.

### End-to-end tests only

```bash
npm run test:e2e
```

Runs Playwright against a local dev server (`http://localhost:3000`). The `webServer` config in `playwright.config.ts` starts `next dev` automatically if no server is already running.

> **Note:** The dev server must be reachable on port 3000. If you have another process on that port, stop it first.

---

## Local Persistence Structure

All data is stored in the browser's `localStorage` under three keys:

### `habit-tracker-users`

A JSON array of registered users:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "alice@example.com",
    "password": "password123",
    "createdAt": "2024-06-15T10:00:00.000Z"
  }
]
```

> Passwords are stored in plain text. This is intentional for this stage — it keeps the implementation front-end-only, local, and deterministic without requiring hashing infrastructure.

### `habit-tracker-session`

Either `null` (no active session) or a session object:

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "alice@example.com"
}
```

The session is set on login/signup and cleared on logout.

### `habit-tracker-habits`

A JSON array of all habits across all users:

```json
[
  {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Drink Water",
    "description": "8 glasses a day",
    "frequency": "daily",
    "createdAt": "2024-06-15T10:05:00.000Z",
    "completions": ["2024-06-14", "2024-06-15"]
  }
]
```

Each habit's `completions` array holds unique ISO calendar dates (`YYYY-MM-DD`) representing days the habit was marked complete. The dashboard filters habits by `userId` to show only the logged-in user's habits.

---

## PWA Implementation

The app is installable and partially offline-capable via two files in `public/`:

### `public/manifest.json`

Provides browser-installability metadata: app name, icons (192×192 and 512×512), start URL, display mode (`standalone`), and theme/background colors.

### `public/sw.js`

A vanilla service worker registered in `src/app/layout.tsx` via an inline script. It uses a **cache-first with background update** strategy:

1. **Install** — pre-caches the app shell (routes, icons, manifest)
2. **Activate** — cleans up old caches and claims all clients
3. **Fetch** — for cached resources, returns the cache immediately while updating the cache from the network in the background; for uncached resources, fetches from the network and stores the result; for offline navigation requests, falls back to the cached root `/`

This means after the app has been loaded once, navigating to it offline will render the cached shell without a hard browser crash.

---

## Trade-offs and Limitations

| Area | Decision | Reason |
|---|---|---|
| **Auth security** | Passwords stored in plain text in localStorage | Spec requires no external auth or database; deterministic local-only behavior |
| **No server-side auth** | All route protection is client-side (`useEffect` redirect) | Next.js App Router middleware would require a server; spec is front-end-focused |
| **Flash on protected routes** | Dashboard renders a blank div before hydration | Prevents redirect loop; session check happens client-side only |
| **SW caching** | Cache-first strategy; may serve stale content | Appropriate for an app shell; API data is in localStorage anyway |
| **Frequency locked to `daily`** | Only `daily` frequency is implemented | Spec explicitly states "only daily frequency is required for this stage" |
| **No password hashing** | Plain text passwords | Out of scope for this stage per the TRD |
| **Single-file SW** | No build tooling for the service worker | Keeps the SW simple and auditable; it only needs to cache static shell |

---

## Implementation Map to TRD

This section maps each section of the Technical Requirements Document to where it is implemented in the codebase.

### Section 3 — Required Stack
| Requirement | Implementation |
|---|---|
| Next.js with App Router | `src/app/` directory with file-based routing |
| React + TypeScript | All components in `src/components/` use `.tsx` |
| Tailwind CSS | `tailwind.config.ts`, `src/app/globals.css` |
| localStorage persistence | `src/lib/storage.ts` |
| Playwright E2E tests | `tests/e2e/app.spec.ts`, `playwright.config.ts` |
| Vitest unit tests | `tests/unit/`, `vitest.config.ts` |
| React Testing Library | `tests/integration/` |

### Section 4 — Route Contract
| Route | File | Behavior |
|---|---|---|
| `/` | `src/app/page.tsx` | Renders splash screen for 1200ms, then redirects to `/dashboard` or `/login` based on session |
| `/login` | `src/app/login/page.tsx` | Renders `LoginForm`, on success saves session and redirects to `/dashboard` |
| `/signup` | `src/app/signup/page.tsx` | Renders `SignupForm`, on success creates user + session, redirects to `/dashboard` |
| `/dashboard` | `src/app/dashboard/page.tsx` | Protected via `ProtectedRoute` — redirects to `/login` if no session |

### Section 5 — Persistence Contract
| Key | Shape | Managed in |
|---|---|---|
| `habit-tracker-users` | `User[]` | `src/lib/storage.ts` → `getUsers`, `addUser`, `saveUsers` |
| `habit-tracker-session` | `Session \| null` | `src/lib/storage.ts` → `getSession`, `saveSession`, `clearSession` |
| `habit-tracker-habits` | `Habit[]` | `src/lib/storage.ts` → `getAllHabits`, `addHabit`, `updateHabit`, `deleteHabit` |

### Section 8 — Required Type Contracts
| Type | File |
|---|---|
| `User` | `src/types/auth.ts` |
| `Session` | `src/types/auth.ts` |
| `Habit` | `src/types/habit.ts` |

### Section 9 — Required Utility Function Contracts
| Function | File | Behaviour |
|---|---|---|
| `getHabitSlug(name)` | `src/lib/slug.ts` | Converts habit name to lowercase hyphenated slug |
| `validateHabitName(name)` | `src/lib/validators.ts` | Validates name — rejects empty or >60 chars |
| `calculateCurrentStreak(completions, today?)` | `src/lib/streaks.ts` | Counts consecutive days backwards from today |
| `toggleHabitCompletion(habit, date)` | `src/lib/habits.ts` | Immutably adds or removes a completion date |

### Section 10 — UI Contract
| Component | File | Test IDs implemented |
|---|---|---|
| `SplashScreen` | `src/components/shared/SplashScreen.tsx` | `splash-screen` |
| `LoginForm` | `src/components/auth/LoginForm.tsx` | `auth-login-email`, `auth-login-password`, `auth-login-submit` |
| `SignupForm` | `src/components/auth/SignupForm.tsx` | `auth-signup-email`, `auth-signup-password`, `auth-signup-submit` |
| `HabitForm` | `src/components/habits/HabitForm.tsx` | `habit-form`, `habit-name-input`, `habit-description-input`, `habit-frequency-select`, `habit-save-button` |
| `HabitCard` | `src/components/habits/HabitCard.tsx` | `habit-card-{slug}`, `habit-streak-{slug}`, `habit-complete-{slug}`, `habit-edit-{slug}`, `habit-delete-{slug}`, `confirm-delete-button` |
| `HabitList` | `src/components/habits/HabitList.tsx` | `empty-state` |
| Dashboard page | `src/app/dashboard/page.tsx` | `dashboard-page`, `create-habit-button`, `auth-logout-button` |

### Section 11 — Auth Behaviour Rules
| Rule | Implementation |
|---|---|
| Email and password required | Validated in `src/lib/auth.ts` before processing |
| Duplicate email rejected | `getUserByEmail()` check in `signUp()` — returns `"User already exists"` |
| Invalid login rejected | Credential match in `logIn()` — returns `"Invalid email or password"` |
| Logout clears session | `clearSession()` in `src/lib/auth.ts`, redirects to `/login` |

### Section 12 — Habit Behaviour Rules
| Rule | Implementation |
|---|---|
| Name required, description optional | `validateHabitName()` in `src/lib/validators.ts` |
| Frequency defaults to `daily` | `DEFAULT_FREQUENCY` in `src/lib/constants.ts` |
| Habit belongs to logged-in user | `userId` set from active session in `DashboardContent` |
| Edit preserves `id`, `userId`, `createdAt`, `completions` | Spread operator merge in `handleEditHabit()` |
| Delete requires confirmation | `confirm-delete-button` overlay in `HabitCard.tsx` |
| Completion toggles today only | `toggleHabitCompletion()` in `src/lib/habits.ts` |
| No duplicate completions | `Set` deduplication in `toggleHabitCompletion()` |

### Section 13 — PWA Contract
| Requirement | File |
|---|---|
| `manifest.json` | `public/manifest.json` |
| Service worker | `public/sw.js` |
| Icon 192×192 | `public/icons/icon-192.png` |
| Icon 512×512 | `public/icons/icon-512.png` |
| SW registration | Inline script in `src/app/layout.tsx` |
| Offline app shell | Cache-first strategy in `public/sw.js` |

### Section 18 — Required Package Scripts
| Script | Command |
|---|---|
| `dev` | `next dev` |
| `build` | `next build` |
| `start` | `next start` |
| `test:unit` | `vitest run --coverage tests/unit` |
| `test:integration` | `vitest run tests/integration` |
| `test:e2e` | `playwright test` |
| `test` | All three in sequence |

---

## Test File Map

This section maps each required test file to the behavior it verifies.

### `tests/unit/slug.test.ts`

**Describe block:** `getHabitSlug`

Verifies the `getHabitSlug()` utility in `src/lib/slug.ts`:
- Converts habit names to lowercase, hyphen-separated slugs
- Trims outer whitespace and collapses repeated spaces
- Removes non-alphanumeric characters (except hyphens)

### `tests/unit/validators.test.ts`

**Describe block:** `validateHabitName`

Verifies the `validateHabitName()` utility in `src/lib/validators.ts`:
- Rejects empty or whitespace-only names with the exact error message `Habit name is required`
- Rejects names longer than 60 characters with the exact message `Habit name must be 60 characters or fewer`
- Returns the trimmed, normalized value for valid inputs

### `tests/unit/streaks.test.ts`

**Describe block:** `calculateCurrentStreak`

Verifies the `calculateCurrentStreak()` utility in `src/lib/streaks.ts`:
- Returns 0 for empty completions
- Returns 0 when today is not in completions
- Returns the correct count for consecutive completed days
- Deduplicates completion dates before calculating
- Breaks the streak when a calendar day is missing

### `tests/unit/auth.test.ts`

**Describe block:** `auth`

Verifies the `signUp()`, `logIn()`, `logOut()`, and `requireSession()` functions in `src/lib/auth.ts`:
- Rejects signup with empty email or password
- Rejects duplicate email signup with `User already exists`
- Creates a session on successful signup
- Rejects invalid login credentials with `Invalid email or password`
- Creates a session on successful login
- Returns null from `requireSession()` when no session exists
- Returns the active session from `requireSession()` after login
- Returns null from `requireSession()` after logout

### `tests/unit/storage.test.ts`

**Describe block:** `storage`

Verifies the localStorage utility functions in `src/lib/storage.ts`:
- Returns an empty array from `getUsers()` when localStorage contains corrupt JSON
- Returns null from `getSession()` when localStorage contains corrupt JSON
- Returns an empty array from `getAllHabits()` when localStorage contains corrupt JSON

### `tests/unit/habits.test.ts`

**Describe block:** `toggleHabitCompletion`

Verifies the `toggleHabitCompletion()` utility in `src/lib/habits.ts`:
- Adds a date when it is absent
- Removes a date when it is present
- Does not mutate the original habit object (immutability contract)
- Returns no duplicate dates even when input contains duplicates

### `tests/integration/auth-flow.test.tsx`

**Describe block:** `auth flow`

Verifies auth UI components and the auth library together:
- Signup form submits email/password and a session is created in localStorage
- Duplicate email signup is rejected with `User already exists`
- Login form submits credentials and the session is stored
- Invalid login credentials show `Invalid email or password`

### `tests/integration/habit-form.test.tsx`

**Describe block:** `habit form`

Verifies habit UI components and their interactions:
- Submitting an empty habit name shows a validation error
- Filling in and submitting the form calls `onSave` with the correct data
- Editing preserves immutable fields (`id`, `userId`, `createdAt`, `completions`)
- Delete requires the `confirm-delete-button` to be clicked before `onDelete` fires
- Toggling completion updates the streak display immediately

### `tests/e2e/app.spec.ts`

**Describe block:** `Habit Tracker app`

Full end-to-end Playwright tests covering the entire user journey:
- Splash screen visibility and redirect for unauthenticated users
- Redirect to `/dashboard` for authenticated users from `/`
- Route protection — unauthenticated access to `/dashboard` redirects to `/login`
- Signup flow — new user lands on the dashboard
- Login flow — only that user's habits are shown
- Create a habit from the dashboard
- Complete a habit and verify streak updates
- Session and habit persistence across page reload
- Logout and session clearance
- Offline app shell rendering after first load

---

## Automated Tests

All test files are located in the `tests/` directory:

| File | Type | Tool |
|---|---|---|
| `tests/unit/slug.test.ts` | Unit | Vitest |
| `tests/unit/validators.test.ts` | Unit | Vitest |
| `tests/unit/streaks.test.ts` | Unit | Vitest |
| `tests/unit/habits.test.ts` | Unit | Vitest |
| `tests/unit/auth.test.ts` | Unit | Vitest |
| `tests/unit/storage.test.ts` | Unit | Vitest |
| `tests/integration/auth-flow.test.tsx` | Integration | Vitest + React Testing Library |
| `tests/integration/habit-form.test.tsx` | Integration | Vitest + React Testing Library |
| `tests/e2e/app.spec.ts` | End-to-End | Playwright |

**Total: 57 tests across 9 files — all passing.**

---

## Coverage Report

Generated by Vitest with V8 coverage provider. Run `npm run test:unit` to regenerate.
The full HTML report is available in the `coverage/` directory — open `coverage/index.html` in your browser.

| File | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| `auth.ts` | 100% | 100% | 100% | 100% |
| `constants.ts` | 100% | 100% | 100% | 100% |
| `habits.ts` | 100% | 100% | 100% | 100% |
| `slug.ts` | 100% | 100% | 100% | 100% |
| `storage.ts` | 100% | 86.66% | 100% | 100% |
| `streaks.ts` | 100% | 100% | 100% | 100% |
| `validators.ts` | 100% | 100% | 100% | 100% |
| **All files** | **100%** | **93.33%** | **100%** | **100%** |

> The `storage.ts` branch gap (86.66%) is from `typeof window === 'undefined'` guards that only trigger during server-side rendering — not reachable in a jsdom test environment. All other files are at 100%.

> Minimum required threshold: 80% line coverage. Achieved: 100%.

---

## Author

| Field | Details |
|---|---|
| **Name** | Mbamara Joshua - Jay Tech |
| **GitHub** | https://github.com/techjay01 |
| **Live Demo** | https://jay-habit-tracker.vercel.app |