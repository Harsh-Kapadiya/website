import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

const input = 'w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/40 text-[0.9375rem]';

export function LoginPage() {
  const { isAdmin, loading, error: authError, signInWithPassword, signInWithGoogle } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'password' | 'google' | null>(null);

  if (isAdmin) return <Navigate to="/" replace />;

  async function run(kind: 'password' | 'google', action: () => Promise<string | null>) {
    setBusy(kind);
    setFormError(null);
    const err = await action();
    if (err) setFormError(err);
    if (err || kind === 'password') setBusy(null);
  }

  const error = formError || authError;

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-white/40 mb-2 text-xs tracking-[0.1em]">HK ADMIN</p>
        <h1 className="text-white mb-8 text-3xl font-medium">Sign in</h1>

        {!isSupabaseConfigured && (
          <p className="text-amber-300/90 mb-6 rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-[0.8125rem]">
            Supabase isn't connected — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in admin-panel/.env (or in Vercel), then restart.
          </p>
        )}

        <button
          type="button"
          disabled={!isSupabaseConfigured || busy !== null || loading}
          onClick={() => run('google', signInWithGoogle)}
          className="w-full py-3 rounded-xl bg-white/[0.06] border border-white/15 text-white hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-3 font-medium"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9C16.66 14.2 17.64 11.9 17.64 9.2z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
          </svg>
          {busy === 'google' ? 'Redirecting…' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3 my-6" aria-hidden>
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-white/30 text-xs">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); run('password', () => signInWithPassword(email, password)); }} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-white/60 mb-2 text-[0.8125rem]">Email</label>
            <input id="email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          </div>
          <div>
            <label htmlFor="password" className="block text-white/60 mb-2 text-[0.8125rem]">Password</label>
            <input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
          </div>
          {error && <p role="alert" className="text-red-400 text-[0.8125rem]">{error}</p>}
          <button type="submit" disabled={!isSupabaseConfigured || busy !== null} className="w-full py-3 rounded-xl bg-white text-[#0a0a0a] hover:bg-white/90 transition-colors disabled:opacity-50 font-medium">
            {busy === 'password' ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-white/30 mt-8 text-xs leading-relaxed">
          Only accounts listed in the <code className="text-white/50">admins</code> table can get in — with either method.
        </p>
      </div>
    </main>
  );
}
