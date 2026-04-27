import { describe, it, expect, beforeEach } from 'vitest';
import { signUp, logIn, logOut, requireSession } from '@/lib/auth';
import { getSession } from '@/lib/storage';

describe('auth', () => {
  beforeEach(() => { localStorage.clear(); });

  it('signUp creates a user and returns a session', () => {
    const result = signUp('alice@example.com', 'password123');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.session.email).toBe('alice@example.com');
    }
  });

  it('signUp stores the session in localStorage', () => {
    signUp('alice@example.com', 'password123');
    const session = getSession();
    expect(session).not.toBeNull();
    expect(session?.email).toBe('alice@example.com');
  });

  it('signUp rejects duplicate email with correct error', () => {
    signUp('alice@example.com', 'password123');
    const result = signUp('alice@example.com', 'other');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('User already exists');
    }
  });

  it('logIn succeeds with correct credentials', () => {
    signUp('bob@example.com', 'mypassword');
    localStorage.setItem('habit-tracker-session', 'null');
    const result = logIn('bob@example.com', 'mypassword');
    expect(result.success).toBe(true);
  });

  it('logIn stores the session in localStorage', () => {
    signUp('bob@example.com', 'mypassword');
    localStorage.setItem('habit-tracker-session', 'null');
    logIn('bob@example.com', 'mypassword');
    const session = getSession();
    expect(session?.email).toBe('bob@example.com');
  });

  it('logIn rejects wrong password with correct error', () => {
    signUp('bob@example.com', 'mypassword');
    const result = logIn('bob@example.com', 'wrongpassword');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Invalid email or password');
    }
  });

  it('logIn rejects unknown email with correct error', () => {
    const result = logIn('nobody@example.com', 'password');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Invalid email or password');
    }
  });

  it('logOut clears the session', () => {
    signUp('alice@example.com', 'password123');
    expect(getSession()).not.toBeNull();
    logOut();
    expect(getSession()).toBeNull();
  });

  it('requireSession returns null when no session exists', () => {
    expect(requireSession()).toBeNull();
  });

  it('requireSession returns the active session after login', () => {
    signUp('test@example.com', 'password123');
    const session = requireSession();
    expect(session).not.toBeNull();
    expect(session?.email).toBe('test@example.com');
  });

  it('requireSession returns null after logout', () => {
    signUp('test@example.com', 'password123');
    logOut();
    expect(requireSession()).toBeNull();
  });

  it('rejects signup with empty email', () => {
    const result = signUp('', 'password123');
    expect(result.success).toBe(false);
    });

    it('rejects signup with empty password', () => {
    const result = signUp('test@example.com', '');
    expect(result.success).toBe(false);
    });

    it('rejects login with empty credentials', () => {
    const result = logIn('', '');
    expect(result.success).toBe(false);
    expect(result).toMatchObject({ error: 'Invalid email or password' });
    });
});