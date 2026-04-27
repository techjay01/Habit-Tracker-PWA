'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/storage';
import type { Session } from '@/types/auth';

interface ProtectedRouteProps {
  children: (session: Session) => React.ReactNode;
}

/**
 * ProtectedRoute guards client-side routes that require an active session.
 * If no valid session exists in localStorage, it redirects to /login.
 * Renders nothing (blank) while the session check is in progress to
 * prevent a flash of protected content.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace('/login');
    } else {
      setSession(s);
    }
    setChecked(true);
  }, [router]);

  if (!checked || !session) {
    return (
      <div
        aria-hidden="true"
        style={{ minHeight: '100dvh', background: 'var(--color-bg)' }}
      />
    );
  }

  return <>{children(session)}</>;
}
