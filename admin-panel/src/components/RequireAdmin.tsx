import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';

// UX only — the real protection is Row Level Security in the database.
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { loading, isAdmin } = useAdminAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-white/40 text-sm">Checking access…</div>;
  return isAdmin ? <>{children}</> : <Navigate to="/login" replace />;
}
