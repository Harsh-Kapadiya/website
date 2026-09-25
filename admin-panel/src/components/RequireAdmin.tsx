import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAuthed, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/30" style={{ fontSize: '0.875rem' }}>
        Loading…
      </div>
    );
  }

  if (!isAuthed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
