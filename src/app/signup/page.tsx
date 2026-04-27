'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SignupForm from '@/components/auth/SignupForm';
import { signUp } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(email: string, password: string) {
    setLoading(true);
    setError(null);
    const result = signUp(email, password);
    if (result.success) {
      router.replace('/dashboard');
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'var(--color-bg)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo mark */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>✦</span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.8rem',
              fontWeight: 400,
              color: 'var(--color-text)',
              margin: '0.5rem 0 0.25rem',
            }}
          >
            Start your journey
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Create your free Habit Tracker account
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <SignupForm onSubmit={handleSignup} error={error} loading={loading} />
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link
            href="/login"
            style={{ color: 'var(--color-brand)', textDecoration: 'none', fontWeight: 500 }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
