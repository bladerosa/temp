import type { ReactNode } from 'react';

/** Stub guard. Real implementation will check a session cookie + redirect to /login. */
export function AuthGuard({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
