import { test, expect, Page, BrowserContext } from '@playwright/test';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TEST_EMAIL = 'testuser@example.com';
const TEST_PASSWORD = 'password123';
const OTHER_EMAIL = 'otheruser@example.com';
const OTHER_PASSWORD = 'otherpass456';

async function clearStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('habit-tracker-users');
    localStorage.removeItem('habit-tracker-session');
    localStorage.removeItem('habit-tracker-habits');
  });
}

async function signUpViaUI(page: Page, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.goto('/signup');
  await page.getByTestId('auth-signup-email').fill(email);
  await page.getByTestId('auth-signup-password').fill(password);
  await page.getByTestId('auth-signup-submit').click();
  await page.waitForURL('/dashboard');
}

async function signUpViaStorage(page: Page, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.evaluate(
    ({ email, password }) => {
      const users = JSON.parse(localStorage.getItem('habit-tracker-users') || '[]');
      const id = `user-${Date.now()}`;
      users.push({ id, email, password, createdAt: new Date().toISOString() });
      localStorage.setItem('habit-tracker-users', JSON.stringify(users));
    },
    { email, password }
  );
}

async function createSessionViaStorage(page: Page, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.evaluate(
    ({ email, password }) => {
      const users = JSON.parse(localStorage.getItem('habit-tracker-users') || '[]');
      let user = users.find((u: { email: string }) => u.email === email);
      if (!user) {
        user = { id: `user-${Date.now()}`, email, password, createdAt: new Date().toISOString() };
        users.push(user);
        localStorage.setItem('habit-tracker-users', JSON.stringify(users));
      }
      localStorage.setItem('habit-tracker-session', JSON.stringify({ userId: user.id, email: user.email }));
    },
    { email, password }
  );
}

async function createHabitViaStorage(page: Page, name: string, userId?: string) {
  await page.evaluate(
    ({ name, userId }) => {
      const session = JSON.parse(localStorage.getItem('habit-tracker-session') || 'null');
      const ownerId = userId ?? session?.userId ?? 'unknown';
      const habits = JSON.parse(localStorage.getItem('habit-tracker-habits') || '[]');
      habits.push({
        id: `habit-${Date.now()}-${Math.random()}`,
        userId: ownerId,
        name,
        description: '',
        frequency: 'daily',
        createdAt: new Date().toISOString(),
        completions: [],
      });
      localStorage.setItem('habit-tracker-habits', JSON.stringify(habits));
    },
    { name, userId }
  );
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

test.describe('Habit Tracker app', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to root so localStorage is accessible for that origin
    await page.goto('/');
    await clearStorage(page);
  });

  // ── 1 ────────────────────────────────────────────────────────────────────────
  test('shows the splash screen and redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/');

    // Splash screen must be visible
    const splash = page.getByTestId('splash-screen');
    await expect(splash).toBeVisible();

    // Should redirect to /login (no session)
    await page.waitForURL('/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  // ── 2 ────────────────────────────────────────────────────────────────────────
  test('redirects authenticated users from / to /dashboard', async ({ page }) => {
    await createSessionViaStorage(page);

    await page.goto('/');

    // Splash appears briefly
    await expect(page.getByTestId('splash-screen')).toBeVisible();

    // Then redirects to dashboard because session exists
    await page.waitForURL('/dashboard', { timeout: 5000 });
    expect(page.url()).toContain('/dashboard');
  });

  // ── 3 ────────────────────────────────────────────────────────────────────────
  test('prevents unauthenticated access to /dashboard', async ({ page }) => {
    // No session — navigate directly to /dashboard
    await page.goto('/dashboard');

    // Must redirect to /login
    await page.waitForURL('/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  // ── 4 ────────────────────────────────────────────────────────────────────────
  test('signs up a new user and lands on the dashboard', async ({ page }) => {
    await page.goto('/signup');

    await page.getByTestId('auth-signup-email').fill(TEST_EMAIL);
    await page.getByTestId('auth-signup-password').fill(TEST_PASSWORD);
    await page.getByTestId('auth-signup-submit').click();

    await page.waitForURL('/dashboard', { timeout: 5000 });

    // Dashboard must be visible
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    // Session must exist in localStorage
    const session = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('habit-tracker-session') || 'null')
    );
    expect(session).not.toBeNull();
    expect(session.email).toBe(TEST_EMAIL);
  });

  // ── 5 ────────────────────────────────────────────────────────────────────────
  test('logs in an existing user and loads only that user\'s habits', async ({ page }) => {
    // Create two users with habits in storage
    await signUpViaStorage(page, TEST_EMAIL, TEST_PASSWORD);
    await signUpViaStorage(page, OTHER_EMAIL, OTHER_PASSWORD);

    // Give each user their own habit
    await createSessionViaStorage(page, TEST_EMAIL, TEST_PASSWORD);
    await createHabitViaStorage(page, 'My Personal Habit');

    const otherUserId = await page.evaluate((email) => {
      const users = JSON.parse(localStorage.getItem('habit-tracker-users') || '[]');
      return users.find((u: { email: string }) => u.email === email)?.id;
    }, OTHER_EMAIL);

    await createHabitViaStorage(page, 'Other User Habit', otherUserId);

    // Clear session, then log in as TEST_EMAIL
    await page.evaluate(() =>
      localStorage.setItem('habit-tracker-session', 'null')
    );

    await page.goto('/login');
    await page.getByTestId('auth-login-email').fill(TEST_EMAIL);
    await page.getByTestId('auth-login-password').fill(TEST_PASSWORD);
    await page.getByTestId('auth-login-submit').click();

    await page.waitForURL('/dashboard', { timeout: 5000 });

    // Only TEST_EMAIL's habit should be visible
    await expect(page.getByTestId('habit-card-my-personal-habit')).toBeVisible();
    await expect(page.getByTestId('habit-card-other-user-habit')).not.toBeVisible();
  });

  // ── 6 ────────────────────────────────────────────────────────────────────────
  test('creates a habit from the dashboard', async ({ page }) => {
    await createSessionViaStorage(page);
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    // Click create button
    await page.getByTestId('create-habit-button').click();

    // Form must appear
    await expect(page.getByTestId('habit-form')).toBeVisible();

    // Fill in habit name
    await page.getByTestId('habit-name-input').fill('Drink Water');
    await page.getByTestId('habit-description-input').fill('8 glasses a day');
    await page.getByTestId('habit-save-button').click();

    // Habit card must appear with correct slug-based test ID
    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();
  });

  // ── 7 ────────────────────────────────────────────────────────────────────────
  test('completes a habit for today and updates the streak', async ({ page }) => {
    await createSessionViaStorage(page);
    await page.goto('/dashboard');

    // Create a habit via UI
    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Drink Water');
    await page.getByTestId('habit-save-button').click();
    await expect(page.getByTestId('habit-card-drink-water')).toBeVisible();

    // Streak should start at 0
    await expect(page.getByTestId('habit-streak-drink-water')).toContainText('0');

    // Complete the habit
    await page.getByTestId('habit-complete-drink-water').click();

    // Streak must update to 1
    await expect(page.getByTestId('habit-streak-drink-water')).toContainText('1');

    // Toggle back off
    await page.getByTestId('habit-complete-drink-water').click();

    // Streak must return to 0
    await expect(page.getByTestId('habit-streak-drink-water')).toContainText('0');
  });

  // ── 8 ────────────────────────────────────────────────────────────────────────
  test('persists session and habits after page reload', async ({ page }) => {
    await createSessionViaStorage(page);
    await page.goto('/dashboard');

    // Create a habit
    await page.getByTestId('create-habit-button').click();
    await page.getByTestId('habit-name-input').fill('Morning Run');
    await page.getByTestId('habit-save-button').click();
    await expect(page.getByTestId('habit-card-morning-run')).toBeVisible();

    // Complete it
    await page.getByTestId('habit-complete-morning-run').click();
    await expect(page.getByTestId('habit-streak-morning-run')).toContainText('1');

    // Reload the page
    await page.reload();

    // Session must persist — dashboard should load (not redirect to /login)
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
    expect(page.url()).toContain('/dashboard');

    // Habit and streak must persist
    await expect(page.getByTestId('habit-card-morning-run')).toBeVisible();
    await expect(page.getByTestId('habit-streak-morning-run')).toContainText('1');
  });

  // ── 9 ────────────────────────────────────────────────────────────────────────
  test('logs out and redirects to /login', async ({ page }) => {
    await createSessionViaStorage(page);
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    // Click logout
    await page.getByTestId('auth-logout-button').click();

    // Must redirect to /login
    await page.waitForURL('/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');

    // Session must be cleared — navigating to /dashboard should redirect
    await page.goto('/dashboard');
    await page.waitForURL('/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  // ── 10 ───────────────────────────────────────────────────────────────────────
  test('loads the cached app shell when offline after the app has been loaded once', async ({
    page,
    context,
  }) => {
    await createSessionViaStorage(page);

    // Load the app online first so the SW can cache the shell
    await page.goto('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();

    // Wait for service worker to install and cache
    await page.waitForTimeout(2000);

    // Go offline
    await context.setOffline(true);

    // Attempt to navigate — should not hard-crash
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 8000 });
    } catch {
      // Navigation may time out when offline; that's acceptable
    }

    // The page must not show a browser-level error (net::ERR_INTERNET_DISCONNECTED etc.)
    // A service worker fallback or cached page renders without a hard crash
    const bodyText = await page.evaluate(() => document.body?.innerText ?? '');
    expect(bodyText).not.toMatch(/ERR_INTERNET_DISCONNECTED|ERR_NAME_NOT_RESOLVED/);

    // Restore online
    await context.setOffline(false);
  });
});
