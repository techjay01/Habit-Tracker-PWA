'use client';

import { useState, FormEvent } from 'react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void | Promise<void>;
  error?: string | null;
  loading?: boolean;
}

export default function LoginForm({ onSubmit, error, loading }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(email, password);
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="login-email"
          style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-muted)' }}
        >
          Email address
        </label>
        <input
          id="login-email"
          data-testid="auth-login-email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label
          htmlFor="login-password"
          style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-muted)' }}
        >
          Password
        </label>
        <input
          id="login-password"
          data-testid="auth-login-password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
        />
      </div>

      {error && (
        <p
          role="alert"
          style={{
            fontSize: '0.85rem',
            color: 'var(--color-danger)',
            background: 'rgba(248,113,113,0.08)',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
          }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        data-testid="auth-login-submit"
        disabled={loading}
        className="btn-primary"
        style={{ width: '100%', paddingTop: '0.85rem', paddingBottom: '0.85rem', borderRadius: '0.875rem', fontSize: '0.95rem' }}
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
