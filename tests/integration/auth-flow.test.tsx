import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupForm from '@/components/auth/SignupForm';
import LoginForm from '@/components/auth/LoginForm';
import { signUp, logIn } from '@/lib/auth';
import { getSession } from '@/lib/storage';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderSignup(onSubmit = vi.fn()) {
  return render(<SignupForm onSubmit={onSubmit} />);
}

function renderLogin(onSubmit = vi.fn()) {
  return render(<LoginForm onSubmit={onSubmit} />);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('auth flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('submits the signup form and creates a session', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderSignup(onSubmit);

    await user.type(screen.getByTestId('auth-signup-email'), 'alice@example.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'password123');
    await user.click(screen.getByTestId('auth-signup-submit'));

    expect(onSubmit).toHaveBeenCalledWith('alice@example.com', 'password123');

    // When the actual signUp lib is invoked, a session should be created
    signUp('alice@example.com', 'password123');
    const session = getSession();
    expect(session).not.toBeNull();
    expect(session?.email).toBe('alice@example.com');
  });

  it('shows an error for duplicate signup email', async () => {
    // First signup succeeds
    signUp('alice@example.com', 'password123');

    // Second signup with same email
    const result = signUp('alice@example.com', 'otherpass');
    expect(result.success).toBe(false);
    expect(result).toMatchObject({ success: false, error: 'User already exists' });

    // Render with error displayed
    render(<SignupForm onSubmit={vi.fn()} error="User already exists" />);
    expect(screen.getByRole('alert')).toHaveTextContent('User already exists');
  });

  it('submits the login form and stores the active session', async () => {
    const user = userEvent.setup();

    // Pre-create user
    signUp('bob@example.com', 'mypassword');
    localStorage.setItem('habit-tracker-session', 'null'); // clear session

    const onSubmit = vi.fn();
    renderLogin(onSubmit);

    await user.type(screen.getByTestId('auth-login-email'), 'bob@example.com');
    await user.type(screen.getByTestId('auth-login-password'), 'mypassword');
    await user.click(screen.getByTestId('auth-login-submit'));

    expect(onSubmit).toHaveBeenCalledWith('bob@example.com', 'mypassword');

    // Verify lib logIn sets session
    logIn('bob@example.com', 'mypassword');
    const session = getSession();
    expect(session).not.toBeNull();
    expect(session?.email).toBe('bob@example.com');
  });

  it('shows an error for invalid login credentials', async () => {
    const result = logIn('nobody@example.com', 'wrongpassword');
    expect(result.success).toBe(false);
    expect(result).toMatchObject({ success: false, error: 'Invalid email or password' });

    render(<LoginForm onSubmit={vi.fn()} error="Invalid email or password" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
  });
});
